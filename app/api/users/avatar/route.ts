import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// В продакшене замените на реальную загрузку в Supabase Storage / Cloudinary.
async function uploadAvatarStub(file: File): Promise<string> {
  return `https://placehold.co/200x200?text=${encodeURIComponent(file.name)}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return NextResponse.json({ message: "Файл не передан" }, { status: 400 });
  }

  const avatarUrl = await uploadAvatarStub(file);

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { avatarUrl },
  });

  return NextResponse.json({ avatarUrl });
}
