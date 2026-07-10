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

  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const body = await req.json();
  const { description, amount } = body;

  if (!description || typeof amount !== "number") {
    return NextResponse.json({ message: "Некорректные данные" }, { status: 400 });
  }

  const cost = await prisma.laborCost.create({
    data: {
      projectId,
      description,
      amount,
      addedById: (session.user as any).id,
    },
  });

  return NextResponse.json(cost, { status: 201 });
}
