import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InteractivePlan } from "@/components/dashboard/InteractivePlan";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { rooms: true },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  const rooms = project.rooms.map((r) => ({
    id: r.id,
    name: r.name,
    area: r.area,
    progressPercent: r.progressPercent,
    status: r.status,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">План квартиры</h1>
      <p className="mb-6 text-gray-400">
        Кликните по комнате в списке, чтобы увидеть подробности
      </p>
      <InteractivePlan rooms={rooms} />
    </div>
  );
}
