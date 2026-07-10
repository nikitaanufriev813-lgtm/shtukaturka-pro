import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const projectSchema = z.object({
  address: z.string().min(3, "Укажите адрес"),
  area: z.number().positive("Площадь должна быть больше нуля"),
  roomsCount: z.number().int().min(1, "Укажите количество комнат"),
});

// Стандартный шаблон этапов механизированной штукатурки — создаётся
// автоматически для каждого нового проекта.
const DEFAULT_STAGES = [
  "Демонтаж",
  "Грунтовка",
  "Механизированная штукатурка стен",
  "Штукатурка потолка",
  "Шпатлёвка",
  "Приёмка",
];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "CLIENT") {
    return NextResponse.json(
      { message: "Добавлять объект может только клиент" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { address, area, roomsCount } = parsed.data;

  // Создаём комнаты-заглушки с равномерно распределённой площадью —
  // клиент/бригадир смогут переименовать и скорректировать площади позже.
  const roomArea = Math.round((area / roomsCount) * 10) / 10;
  const roomNames = Array.from({ length: roomsCount }, (_, i) =>
    roomsCount === 1 ? "Комната" : `Комната ${i + 1}`
  );

  const project = await prisma.project.create({
    data: {
      clientId: (session.user as any).id,
      address,
      area,
      roomsCount,
      rooms: {
        create: roomNames.map((name) => ({ name, area: roomArea })),
      },
      stages: {
        create: DEFAULT_STAGES.map((name, i) => ({ name, order: i })),
      },
    },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
