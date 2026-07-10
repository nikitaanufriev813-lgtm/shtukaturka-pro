import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/dashboard");

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-surface-dark px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold">Заявки на просмотр</h1>

        <div className="overflow-x-auto rounded-xl2 bg-[#182236]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Телефон</th>
                <th className="px-4 py-3 font-medium">Адрес</th>
                <th className="px-4 py-3 font-medium">Желаемая дата</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Создана</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{lead.name}</td>
                  <td className="px-4 py-3">{lead.phone}</td>
                  <td className="px-4 py-3">{lead.address ?? "—"}</td>
                  <td className="px-4 py-3">
                    {lead.preferredDate
                      ? new Date(lead.preferredDate).toLocaleDateString("ru-RU")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{lead.status}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Заявок пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
