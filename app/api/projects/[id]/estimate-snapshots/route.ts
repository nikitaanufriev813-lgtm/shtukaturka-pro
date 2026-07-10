import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const snapshots = await prisma.estimateSnapshot.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(snapshots);
}

// Сохраняет текущую (актуальную на EstimateItem) смету как исторический снимок.
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

  const items = await prisma.estimateItem.findMany({ where: { projectId } });
  const totalCost = items.reduce((sum, i) => sum + i.total, 0);

  const snapshot = await prisma.estimateSnapshot.create({
    data: {
      projectId,
      totalCost,
      breakdownJson: items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unit: i.unit,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
      createdById: (session.user as any).id,
    },
  });

  return NextResponse.json(snapshot, { status: 201 });
}
