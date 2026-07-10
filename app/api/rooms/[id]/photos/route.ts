import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// В продакшене замените на реальную загрузку в Supabase Storage / Cloudinary
// (см. такую же заглушку в app/api/reports/route.ts).
async function uploadPhotoStub(file: File): Promise<string> {
  return `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`;
}

const MAX_ROOM_PHOTOS = 3;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { photos: true },
  });
  if (!room) {
    return NextResponse.json({ message: "Комната не найдена" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("photos") as File[];

  const existingCount = room.photos.length;
  const availableSlots = MAX_ROOM_PHOTOS - existingCount;

  if (availableSlots <= 0) {
    return NextResponse.json(
      { message: `Уже загружено максимум фото (${MAX_ROOM_PHOTOS})` },
      { status: 400 }
    );
  }

  const filesToUpload = files.slice(0, availableSlots);
  const urls = await Promise.all(filesToUpload.map(uploadPhotoStub));

  await prisma.photo.createMany({
    data: urls.map((url) => ({ roomId, url, type: "PROCESS" as const })),
  });

  const updatedRoom = await prisma.room.findUnique({
    where: { id: roomId },
    include: { photos: true },
  });

  return NextResponse.json(updatedRoom, { status: 201 });
}
