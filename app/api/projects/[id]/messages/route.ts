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
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { projectId },
    include: { sender: { select: { name: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ message: "Сообщение не может быть пустым" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      projectId,
      senderId: (session.user as any).id,
      text: text.trim(),
    },
    include: { sender: { select: { name: true, role: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
