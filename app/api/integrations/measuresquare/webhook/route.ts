import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMeasureSquareProject } from "@/lib/measuresquare";

/**
 * MeasureSquare шлёт сюда уведомление, когда клиент (или замерщик)
 * завершил чертёж и смету в их приложении.
 *
 * ВАЖНО: чтобы связать их проект с нашим Project.id, при создании
 * проекта в MeasureSquare нужно передавать наш projectId как
 * external/reference-поле (уточняется в Integration API Spec после
 * получения доступа — большинство Cloud API это поддерживают).
 * Ожидаемое тело запроса ниже — эталон для первой интеграции,
 * поправить по факту первого реального вебхука.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  if (!body?.project_id) {
    return NextResponse.json({ message: "Отсутствует project_id" }, { status: 400 });
  }

  const msProjectId: string = body.project_id;
  const ourProjectId: string | undefined = body.external_reference ?? body.reference_id;

  if (!ourProjectId) {
    return NextResponse.json(
      { message: "Не удалось сопоставить проект — нет external_reference" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({ where: { id: ourProjectId } });
  if (!project) {
    return NextResponse.json({ message: "Проект не найден" }, { status: 404 });
  }

  const msData = await fetchMeasureSquareProject(msProjectId);

  // Сохраняем сырой ответ для отладки и повторной обработки.
  await prisma.measureSquareImport.create({
    data: {
      projectId: ourProjectId,
      msProjectId,
      floorplanUrl: msData.floorplanPdfUrl,
      rawPayload: body,
    },
  });

  // Создаём/обновляем комнаты по имени.
  for (const room of msData.rooms) {
    const existing = await prisma.room.findFirst({
      where: { projectId: ourProjectId, name: room.name },
    });

    if (existing) {
      await prisma.room.update({
        where: { id: existing.id },
        data: { area: room.areaSqm, scanSource: "MEASURESQUARE" },
      });
    } else {
      await prisma.room.create({
        data: {
          projectId: ourProjectId,
          name: room.name,
          area: room.areaSqm,
          status: "PENDING",
          scanSource: "MEASURESQUARE",
        },
      });
    }
  }

  // Сохраняем смету построчно.
  if (msData.estimateLines.length > 0) {
    await prisma.estimateItem.deleteMany({
      where: { projectId: ourProjectId, source: "MEASURESQUARE" },
    });
    await prisma.estimateItem.createMany({
      data: msData.estimateLines.map((line) => ({
        projectId: ourProjectId,
        roomName: line.roomName,
        description: line.description,
        quantity: line.quantity,
        unit: line.unit,
        unitPrice: line.unitPrice,
        total: line.total,
        source: "MEASURESQUARE",
      })),
    });
  }

  // Чертёж (PDF) сохраняем как документ проекта.
  if (msData.floorplanPdfUrl) {
    await prisma.document.create({
      data: {
        projectId: ourProjectId,
        type: "CONTRACT", // при желании завести отдельный DocumentType "FLOORPLAN"
        fileUrl: msData.floorplanPdfUrl,
      },
    });
  }

  // Обновляем общую площадь проекта.
  const rooms = await prisma.room.findMany({ where: { projectId: ourProjectId } });
  await prisma.project.update({
    where: { id: ourProjectId },
    data: {
      area: rooms.reduce((sum, r) => sum + r.area, 0),
      roomsCount: rooms.length,
    },
  });

  return NextResponse.json({ status: "ok", roomsImported: msData.rooms.length });
}
