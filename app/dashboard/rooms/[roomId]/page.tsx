import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrSeedMixes, getOrSeedPrimers } from "@/lib/ensure-materials";
import { RoomDetailClient } from "@/components/dashboard/RoomDetailClient";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role as string;
  const userId = (session.user as any).id as string;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      photos: true,
      selectedMix: true,
      selectedPrimer: true,
      project: true,
      reports: { orderBy: { date: "desc" }, take: 10, include: { photos: true } },
    },
  });

  if (!room) {
    return <p className="text-gray-400">Комната не найдена.</p>;
  }

  // Клиент может смотреть только комнаты своего проекта.
  if (role === "CLIENT" && room.project.clientId !== userId) {
    redirect("/dashboard");
  }

  const canEdit = role === "ADMIN" || role === "FOREMAN";
  const [mixes, primers] = canEdit
    ? await Promise.all([getOrSeedMixes(), getOrSeedPrimers()])
    : [[], []];

  return (
    <RoomDetailClient
      room={JSON.parse(JSON.stringify(room))}
      mixes={JSON.parse(JSON.stringify(mixes))}
      primers={JSON.parse(JSON.stringify(primers))}
      canEdit={canEdit}
    />
  );
}
