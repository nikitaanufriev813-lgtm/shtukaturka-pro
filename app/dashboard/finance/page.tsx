import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Ожидает оплаты", color: "text-warning" },
  PAID: { label: "Оплачено", color: "text-success" },
  OVERDUE: { label: "Просрочено", color: "text-danger" },
};

export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { payments: { orderBy: { dueDate: "asc" } } },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  const totalDue = project.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = project.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Финансы</h1>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs text-gray-400">Общая сумма по договору</p>
          <p className="mt-1 text-2xl font-bold">{totalDue.toLocaleString("ru-RU")} ₽</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-400">Уже оплачено</p>
          <p className="mt-1 text-2xl font-bold text-success">
            {totalPaid.toLocaleString("ru-RU")} ₽
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-400 dark:border-white/10">
              <th className="px-4 py-3 font-medium">Сумма</th>
              <th className="px-4 py-3 font-medium">Срок оплаты</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {project.payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-gray-50 last:border-0 dark:border-white/5"
              >
                <td className="px-4 py-3 font-medium">
                  {payment.amount.toLocaleString("ru-RU")} ₽
                </td>
                <td className="px-4 py-3">
                  {new Date(payment.dueDate).toLocaleDateString("ru-RU")}
                </td>
                <td className={`px-4 py-3 font-medium ${statusLabels[payment.status]?.color}`}>
                  {statusLabels[payment.status]?.label ?? payment.status}
                </td>
              </tr>
            ))}
            {project.payments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  Счетов по проекту пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
