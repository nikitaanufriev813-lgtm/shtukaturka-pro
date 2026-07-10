import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EconomicsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  // Двойная защита: сессия + роль. middleware.ts уже блокирует /foreman для CLIENT,
  // но проверяем и здесь на случай прямого API-доступа или ошибки конфигурации.
  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectMaterials: { include: { material: true } },
      laborCosts: true,
      estimateItems: true,
      payments: true,
    },
  });

  if (!project) {
    return <p className="text-gray-400">Проект не найден.</p>;
  }

  // Себестоимость материалов: использовано × закупочная цена компании
  const materialsCost = project.projectMaterials.reduce(
    (sum, pm) => sum + pm.used * (pm.material.costPerUnit ?? 0),
    0
  );

  // Прочие расходы (зарплата бригады, транспорт, аренда техники и т.д.)
  const laborCost = project.laborCosts.reduce((sum, l) => sum + l.amount, 0);

  const totalCost = materialsCost + laborCost;

  // Выручка: по смете (если из MeasureSquare) или по факту оплат
  const revenueFromEstimate = project.estimateItems.reduce((sum, e) => sum + e.total, 0);
  const revenueFromPayments = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const revenue = revenueFromEstimate || revenueFromPayments;

  const margin = revenue - totalCost;
  const marginPercent = revenue > 0 ? Math.round((margin / revenue) * 100) : 0;

  return (
    <div className="min-h-screen bg-surface-dark px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 inline-block rounded-full bg-danger/15 px-3 py-1 text-xs font-medium text-danger">
          Закрытый раздел — не виден клиенту
        </div>
        <h1 className="mb-1 text-2xl font-bold">Экономика объекта</h1>
        <p className="mb-8 text-gray-400">{project.address}</p>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl2 bg-[#182236] p-5">
            <p className="text-xs text-gray-400">Выручка</p>
            <p className="mt-1 text-2xl font-bold">{revenue.toLocaleString("ru-RU")} ₽</p>
          </div>
          <div className="rounded-xl2 bg-[#182236] p-5">
            <p className="text-xs text-gray-400">Себестоимость</p>
            <p className="mt-1 text-2xl font-bold">{totalCost.toLocaleString("ru-RU")} ₽</p>
          </div>
          <div className="rounded-xl2 bg-[#182236] p-5">
            <p className="text-xs text-gray-400">Маржа</p>
            <p className={`mt-1 text-2xl font-bold ${margin >= 0 ? "text-success" : "text-danger"}`}>
              {margin.toLocaleString("ru-RU")} ₽ ({marginPercent}%)
            </p>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Материалы</h2>
        <div className="overflow-x-auto rounded-xl2 bg-[#182236]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Материал</th>
                <th className="px-4 py-3 font-medium">Использовано</th>
                <th className="px-4 py-3 font-medium">Закупка/ед.</th>
                <th className="px-4 py-3 font-medium">Итого</th>
              </tr>
            </thead>
            <tbody>
              {project.projectMaterials.map((pm) => (
                <tr key={pm.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{pm.material.name}</td>
                  <td className="px-4 py-3">
                    {pm.used} {pm.material.unit}
                  </td>
                  <td className="px-4 py-3">
                    {(pm.material.costPerUnit ?? 0).toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(pm.used * (pm.material.costPerUnit ?? 0)).toLocaleString("ru-RU")} ₽
                  </td>
                </tr>
              ))}
              {project.projectMaterials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    Материалы ещё не списаны по проекту
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Прочие расходы</h2>
        <div className="overflow-x-auto rounded-xl2 bg-[#182236]">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-gray-400">
                <th className="px-4 py-3 font-medium">Статья расхода</th>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {project.laborCosts.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{l.description}</td>
                  <td className="px-4 py-3">{new Date(l.date).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-3 font-medium">{l.amount.toLocaleString("ru-RU")} ₽</td>
                </tr>
              ))}
              {project.laborCosts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    Расходы ещё не добавлены
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
