import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const { unitPrice } = await req.json();
  if (typeof unitPrice !== "number" || unitPrice < 0) {
    return NextResponse.json({ message: "Некорректная цена" }, { status: 400 });
  }

  const item = await prisma.estimateItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ message: "Строка сметы не найдена" }, { status: 404 });
  }

  const updated = await prisma.estimateItem.update({
    where: { id },
    data: { unitPrice, total: item.quantity * unitPrice },
  });

  return NextResponse.json(updated);
}
