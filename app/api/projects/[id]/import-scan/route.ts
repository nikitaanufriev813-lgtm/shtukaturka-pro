import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Формат, который отдаёт наш iOS-модуль после обработки CapturedRoom (RoomPlan).
// wallsPolygon — точки контура комнаты в метрах, идущие по периметру.
const scanSchema = z.object({
  roomName: z.string().min(1),
  wallsPolygon: z.array(z.object({ x: z.number(), y: z.number() })).min(3),
  ceilingHeight: z.number().optional(),
  // Площадь пола считаем на устройстве (по полигону) и присылаем готовой,
  // чтобы не дублировать геометрию на сервере.
  floorAreaSqm: z.number().positive(),
});

function polygonCentroid(points: { x: number; y: number }[]) {
  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // TODO: авторизация — проверить, что запрос идёт от устройства,
  // привязанного к этому проекту (например, по API-ключу мобильного приложения).

  const projectId = params.id;
  const body = await req.json();
  const parsed = scanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Некорректные данные скана", issues: parsed.error.errors },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ message: "Проект не найден" }, { status: 404 });
  }

  const { roomName, wallsPolygon, ceilingHeight, floorAreaSqm } = parsed.data;

  // Координаты центра комнаты на плане — для интерактивной планировки на дашборде.
  const centroid = polygonCentroid(wallsPolygon);

  const room = await prisma.room.create({
    data: {
      projectId,
      name: roomName,
      area: Math.round(floorAreaSqm * 10) / 10,
      status: "PENDING",
      progressPercent: 0,
      planCoordX: centroid.x,
      planCoordY: centroid.y,
      scanSource: "ROOMPLAN_NATIVE",
      scanWallsJson: wallsPolygon,
      scanCeilingHeight: ceilingHeight,
      scannedAt: new Date(),
    },
  });

  // Пересчитываем общую площадь и число комнат проекта.
  const rooms = await prisma.room.findMany({ where: { projectId } });
  await prisma.project.update({
    where: { id: projectId },
    data: {
      area: rooms.reduce((sum, r) => sum + r.area, 0),
      roomsCount: rooms.length,
    },
  });

  return NextResponse.json({ roomId: room.id }, { status: 201 });
}
