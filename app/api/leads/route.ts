import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  name: z.string().min(2, "Слишком короткое имя"),
  phone: z.string().min(6, "Некорректный номер телефона"),
  address: z.string().optional(),
  preferredDate: z.string().optional(), // ISO-строка с фронта
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }

  const { name, phone, address, preferredDate, comment } = parsed.data;

  const lead = await prisma.lead.create({
    data: {
      name,
      phone,
      address,
      comment,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
    },
  });

  // TODO: здесь же отправить уведомление менеджеру (Telegram/email) о новой заявке.

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
