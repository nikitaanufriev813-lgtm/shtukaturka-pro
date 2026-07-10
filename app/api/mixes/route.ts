import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrSeedMixes } from "@/lib/ensure-materials";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const mixes = await getOrSeedMixes();
  return NextResponse.json(mixes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    return NextResponse.json({ message: "Недостаточно прав" }, { status: 403 });
  }

  const body = await req.json();
  const { name, brand, consumption10mm, consumption15mm, consumption20mm, consumption25mm, bagWeightKg, pricePerBag } = body;

  if (!name || !consumption10mm || !consumption15mm || !consumption20mm || !consumption25mm) {
    return NextResponse.json(
      { message: "Укажите название и расход для всех четырёх толщин" },
      { status: 400 }
    );
  }

  const mix = await prisma.plasterMix.create({
    data: {
      name,
      brand,
      consumption10mm: parseFloat(consumption10mm),
      consumption15mm: parseFloat(consumption15mm),
      consumption20mm: parseFloat(consumption20mm),
      consumption25mm: parseFloat(consumption25mm),
      bagWeightKg: bagWeightKg ? parseFloat(bagWeightKg) : 30,
      pricePerBag: pricePerBag ? parseFloat(pricePerBag) : null,
      isCustom: true,
      createdById: (session.user as any).id,
    },
  });

  return NextResponse.json(mix, { status: 201 });
}
