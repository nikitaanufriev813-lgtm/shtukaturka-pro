import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressCircle } from "@/components/dashboard/ProgressCircle";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Ruler, Layers, CalendarClock } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  // MVP: показываем последний активный проект клиента.
  // Для ADMIN/FOREMAN здесь позже подключается отдельный вид со списком проектов.
  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { rooms: true },
  });

  if (!project) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <h2 className="text-xl font-bold">У вас пока нет активных объектов</h2>
        <p className="text-gray-400">Добавьте свою квартиру, чтобы начать проект.</p>
        <a
          href="/onboarding"
          className="btn-tap mt-2 rounded-lg bg-accent px-6 py-2.5 font-semibold text-brand-dark hover:bg-accent-light"
        >
          Добавить объект
        </a>
      </div>
    );
  }

  const totalArea = project.rooms.reduce((sum, r) => sum + r.area, 0);
  const overallProgress =
    project.rooms.length > 0
      ? Math.round(
          project.rooms.reduce((sum, r) => sum + r.progressPercent, 0) / project.rooms.length
        )
      : 0;

  const daysLeft = project.plannedEndDate
    ? Math.max(
        0,
        Math.ceil((project.plannedEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : undefined;

  const todayReports = await prisma.report.findMany({
    where: {
      projectId: project.id,
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: { room: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Ваш объект</h1>
          <p className="text-gray-400">{project.address}</p>
        </div>
      </header>

      <section className="card flex flex-col items-center gap-8 p-8 md:flex-row md:justify-around">
        <ProgressCircle percent={overallProgress} daysLeft={daysLeft} />
        <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
          <StatsCard icon={Ruler} label="Общая площадь" value={`${totalArea} м²`} />
          <StatsCard icon={Layers} label="Комнат" value={`${project.rooms.length}`} />
          <StatsCard
            icon={CalendarClock}
            label="Сегодня сделано"
            value={
              todayReports.length > 0
                ? `${todayReports.reduce((s, r) => s + r.wallsArea + r.ceilingArea, 0)} м²`
                : "—"
            }
            hint={todayReports[0]?.room.name}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Комнаты и зоны</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.rooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              area={room.area}
              progressPercent={room.progressPercent}
              status={room.status}
              wallArea={room.wallArea}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
