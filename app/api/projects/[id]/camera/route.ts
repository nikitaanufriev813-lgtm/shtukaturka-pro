import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMuxLiveStream } from "@/lib/mux";

// POST — подключить камеру к проекту (только ADMIN/FOREMAN).
// Возвращает streamKey и rtmpUrl ОДИН РАЗ — их нужно ввести в настройках камеры,
// после этого секрет больше не показывается клиентскому коду.
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

  const existing = await prisma.camera.findUnique({ where: { projectId } });
  if (existing) {
    return NextResponse.json(
      { message: "К этому проекту уже подключена камера" },
      { status: 409 }
    );
  }

  const stream = await createMuxLiveStream();

  await prisma.camera.create({
    data: {
      projectId,
      provider: "MUX",
      streamKey: stream.streamKey,
      playbackId: stream.playbackId,
      status: "IDLE",
    },
  });

  return NextResponse.json(
    { streamKey: stream.streamKey, rtmpUrl: stream.rtmpUrl },
    { status: 201 }
  );
}

// GET — публичные данные для плеера клиента (НИКОГДА не включает streamKey).
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
  }

  const camera = await prisma.camera.findUnique({ where: { projectId } });
  if (!camera) {
    return NextResponse.json({ message: "Камера не подключена" }, { status: 404 });
  }

  return NextResponse.json({
    playbackId: camera.playbackId,
    status: camera.status,
    hlsUrl: `https://stream.mux.com/${camera.playbackId}.m3u8`,
  });
}
