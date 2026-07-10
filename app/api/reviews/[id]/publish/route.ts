import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { published: true },
  });

  return NextResponse.json(review);
}
