import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRoom, aggregateProjectEstimate, ThicknessMm } from "@/lib/calculator";

// Живой расчёт по текущим параметрам всех комнат — ничего не сохраняет в БД,
// просто пересчитывает "на лету". Для сохранения истории — см. estimate-snapshots.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const rooms = await prisma.room.findMany({
    where: { projectId },
    include: { selectedMix: true, selectedPrimer: true },
  });

  const roomResults = rooms
    .filter((r) => r.wallArea && r.selectedMix)
    .map((room) => ({
      roomName: room.name,
      result: calculateRoom({
        wallArea: room.wallArea!,
        windowArea: room.windowArea ?? 0,
        perimeter: room.perimeter ?? 0,
        height: room.height ?? 2.7,
        slopeLinearMeters: room.slopeLinearMeters ?? 0,
        meshJointsMeters: room.meshJointsMeters ?? 0,
        thicknessMm: (room.thicknessMm ?? 15) as ThicknessMm,
        mix: room.selectedMix!,
        primer: room.selectedPrimer,
      }),
    }));

  const lineItems = aggregateProjectEstimate(roomResults);
  const totalCost = lineItems.reduce((sum, item) => sum + item.total, 0);
  const roomsWithoutData = rooms.length - roomResults.length;

  return NextResponse.json({ lineItems, totalCost, roomsWithoutData, roomsTotal: rooms.length });
}

// Записывает текущий расчёт в EstimateItem (source=CALCULATOR), чтобы цены
// можно было редактировать построчно и они сохранялись между визитами.
// Уже отредактированные вручную цены не перезаписываются — обновляется только
// количество и итог по существующей строке.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const rooms = await prisma.room.findMany({
    where: { projectId },
    include: { selectedMix: true, selectedPrimer: true },
  });

  const roomResults = rooms
    .filter((r) => r.wallArea && r.selectedMix)
    .map((room) => ({
      roomName: room.name,
      result: calculateRoom({
        wallArea: room.wallArea!,
        windowArea: room.windowArea ?? 0,
        perimeter: room.perimeter ?? 0,
        height: room.height ?? 2.7,
        slopeLinearMeters: room.slopeLinearMeters ?? 0,
        meshJointsMeters: room.meshJointsMeters ?? 0,
        thicknessMm: (room.thicknessMm ?? 15) as ThicknessMm,
        mix: room.selectedMix!,
        primer: room.selectedPrimer,
      }),
    }));

  const lineItems = aggregateProjectEstimate(roomResults);

  const existing = await prisma.estimateItem.findMany({
    where: { projectId, source: "CALCULATOR" },
  });
  const existingByDescription = new Map(existing.map((e) => [e.description, e]));

  for (const item of lineItems) {
    const found = existingByDescription.get(item.description);
    if (found) {
      await prisma.estimateItem.update({
        where: { id: found.id },
        data: {
          quantity: item.quantity,
          total: item.quantity * found.unitPrice,
        },
      });
      existingByDescription.delete(item.description);
    } else {
      await prisma.estimateItem.create({
        data: {
          projectId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          total: item.total,
          source: "CALCULATOR",
        },
      });
    }
  }

  // Удаляем строки, которых больше нет в текущем расчёте (например, комнату удалили).
  for (const stale of existingByDescription.values()) {
    await prisma.estimateItem.delete({ where: { id: stale.id } });
  }

  const updated = await prisma.estimateItem.findMany({
    where: { projectId, source: "CALCULATOR" },
  });

  return NextResponse.json(updated);
}
