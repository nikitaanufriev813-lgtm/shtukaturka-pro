import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "CLIENT") {
    return NextResponse.json(
      { message: "Оставлять отзыв может только клиент проекта" },
      { status: 403 }
    );
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.clientId !== (session.user as any).id) {
    return NextResponse.json({ message: "Проект не найден" }, { status: 404 });
  }

  const body = await req.json();
  const { rating, comment } = body;

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Оценка должна быть от 1 до 5" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      projectId,
      authorId: (session.user as any).id,
      rating,
      comment,
      published: false, // появится на публичной странице после одобрения ADMIN
    },
  });

  return NextResponse.json(review, { status: 201 });
}
