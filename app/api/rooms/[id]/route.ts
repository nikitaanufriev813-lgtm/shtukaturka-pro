import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    include: {
      photos: true,
      selectedMix: true,
      selectedPrimer: true,
      reports: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!room) {
    return NextResponse.json({ message: "Комната не найдена" }, { status: 404 });
  }

  return NextResponse.json(room);
}

// Обновление параметров комнаты — доступно бригадиру/админу.
// Клиент видит комнату только на чтение (через GET), не может менять параметры расчёта.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = [
    "name",
    "wallArea",
    "floorArea",
    "windowArea",
    "perimeter",
    "height",
    "slopeLinearMeters",
    "meshJointsMeters",
    "thicknessMm",
    "selectedMixId",
    "selectedPrimerId",
  ];

  const data: Record<string, any> = {};
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field];
  }

  const room = await prisma.room.update({ where: { id }, data });

  return NextResponse.json(room);
}
