import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, rating: true, comment: true, createdAt: true },
  });

  return NextResponse.json(reviews);
}
