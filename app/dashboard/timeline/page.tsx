import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Timeline } from "@/components/dashboard/Timeline";

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  const reports = await prisma.report.findMany({
    where: { projectId: project.id },
    include: { room: true, photos: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  const timelineData = reports.map((r) => ({
    id: r.id,
    date: r.date,
    roomName: r.room.name,
    wallsArea: r.wallsArea,
    ceilingArea: r.ceilingArea,
    comment: r.comment,
    photoUrls: r.photos.map((p) => p.url),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Хроника работ</h1>
      <Timeline reports={timelineData} />
    </div>
  );
}
