import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRoom, ThicknessMm } from "@/lib/calculator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({
    where: { id },
    include: { selectedMix: true, selectedPrimer: true },
  });

  if (!room) {
    return NextResponse.json({ message: "Комната не найдена" }, { status: 404 });
  }

  if (!room.selectedMix) {
    return NextResponse.json(
      { message: "Для комнаты не выбрана смесь — сначала настройте параметры расчёта" },
      { status: 400 }
    );
  }

  if (!room.wallArea) {
    return NextResponse.json(
      { message: "Не заполнена площадь стен" },
      { status: 400 }
    );
  }

  const result = calculateRoom({
    wallArea: room.wallArea,
    windowArea: room.windowArea ?? 0,
    perimeter: room.perimeter ?? 0,
    height: room.height ?? 2.7,
    slopeLinearMeters: room.slopeLinearMeters ?? 0,
    meshJointsMeters: room.meshJointsMeters ?? 0,
    thicknessMm: (room.thicknessMm ?? 15) as ThicknessMm,
    mix: room.selectedMix,
    primer: room.selectedPrimer,
  });

  return NextResponse.json(result);
}
