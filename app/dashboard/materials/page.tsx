import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MaterialsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { projectMaterials: { include: { material: true } } },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Материалы</h1>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-gray-400 dark:border-white/10">
              <th className="px-4 py-3 font-medium">Материал</th>
              <th className="px-4 py-3 font-medium">Заказано</th>
              <th className="px-4 py-3 font-medium">Использовано</th>
              <th className="px-4 py-3 font-medium">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {project.projectMaterials.map((pm) => (
              <tr key={pm.id} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                <td className="px-4 py-3">{pm.material.name}</td>
                <td className="px-4 py-3">
                  {pm.ordered} {pm.material.unit}
                </td>
                <td className="px-4 py-3">
                  {pm.used} {pm.material.unit}
                </td>
                <td className="px-4 py-3 font-medium">
                  {pm.remaining} {pm.material.unit}
                </td>
              </tr>
            ))}
            {project.projectMaterials.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Материалы по проекту ещё не заведены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
