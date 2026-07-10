import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, string> = {
  ACTIVE: "Активен",
  PAUSED: "На паузе",
  DONE: "Завершён",
};

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, rooms: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Все объекты</h1>

      <div className="overflow-x-auto rounded-xl2 bg-[#182236]">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Адрес</th>
              <th className="px-4 py-3 font-medium">Комнат</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.client.name}</div>
                  <div className="text-xs text-gray-400">{p.client.phone}</div>
                </td>
                <td className="px-4 py-3">{p.address}</td>
                <td className="px-4 py-3">{p.rooms.length}</td>
                <td className="px-4 py-3">{statusLabels[p.status] ?? p.status}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/projects/${p.id}/chat`} className="text-accent hover:underline">
                      Чат
                    </Link>
                    <Link
                      href={`/foreman/economics/${p.id}`}
                      className="text-accent hover:underline"
                    >
                      Экономика
                    </Link>
                    <Link
                      href={`/foreman/projects/${p.id}/estimate`}
                      className="text-accent hover:underline"
                    >
                      Смета
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Объектов пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
