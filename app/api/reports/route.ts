import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// В продакшене замените на реальную загрузку в Supabase Storage / Cloudinary.
async function uploadPhotoStub(file: File): Promise<string> {
  // Заглушка MVP: возвращаем плейсхолдер-URL с именем файла.
  return `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const reports = await prisma.report.findMany({
    where: projectId ? { projectId } : undefined,
    include: { room: true, photos: true },
    orderBy: { date: "desc" },
    take: 50,
  });

  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || (role !== "FOREMAN" && role !== "ADMIN")) {
    return NextResponse.json(
      { message: "Только бригадир или менеджер может загружать отчёты" },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const roomId = formData.get("roomId") as string;
  const wallsArea = parseFloat((formData.get("wallsArea") as string) || "0");
  const ceilingArea = parseFloat((formData.get("ceilingArea") as string) || "0");
  const waterShutOff = formData.get("waterShutOff") === "true";
  const doorsClosed = formData.get("doorsClosed") === "true";
  const furnitureProtected = formData.get("furnitureProtected") === "true";
  const comment = (formData.get("comment") as string) || undefined;
  const photoFiles = formData.getAll("photos") as File[];

  if (!roomId) {
    return NextResponse.json({ message: "Не указана комната" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    return NextResponse.json({ message: "Комната не найдена" }, { status: 404 });
  }

  const report = await prisma.report.create({
    data: {
      projectId: room.projectId,
      roomId,
      authorId: (session.user as any).id,
      wallsArea,
      ceilingArea,
      waterShutOff,
      doorsClosed,
      furnitureProtected,
      comment,
    },
  });

  const photoUrls = await Promise.all(photoFiles.map(uploadPhotoStub));
  if (photoUrls.length > 0) {
    await prisma.photo.createMany({
      data: photoUrls.map((url) => ({
        reportId: report.id,
        roomId,
        url,
        type: "PROCESS",
      })),
    });
  }

  // Обновляем прогресс комнаты (упрощённая логика для MVP:
  // прогресс = min(100, накопленная площадь / площадь комнаты * 100)
  const totalReported = await prisma.report.aggregate({
    where: { roomId },
    _sum: { wallsArea: true, ceilingArea: true },
  });
  const doneArea = (totalReported._sum.wallsArea ?? 0) + (totalReported._sum.ceilingArea ?? 0);
  const newProgress = Math.min(100, Math.round((doneArea / (room.area || 1)) * 100));

  await prisma.room.update({
    where: { id: roomId },
    data: {
      progressPercent: newProgress,
      status: newProgress >= 100 ? "DONE" : "IN_PROGRESS",
    },
  });

  return NextResponse.json({ id: report.id }, { status: 201 });
}
