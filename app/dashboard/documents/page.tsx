import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";

const typeLabels: Record<string, string> = {
  CONTRACT: "Договор",
  KS2: "Акт КС-2",
  KS3: "Справка КС-3",
  WARRANTY: "Гарантия",
};

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { documents: { orderBy: { createdAt: "desc" } } },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Документы</h1>

      <div className="flex flex-col gap-3">
        {project.documents.map((doc) => (
          <a
            key={doc.id}
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center gap-4 p-4 transition hover:shadow-lg"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/25 to-brand/15 text-brand dark:from-accent/20 dark:to-accent/5 dark:text-accent">
              <FileText size={19} strokeWidth={2.25} />
            </div>
            <div className="flex-1">
              <p className="font-medium">{typeLabels[doc.type] ?? doc.type}</p>
              <p className="text-xs text-gray-400">
                {doc.signedAt
                  ? `Подписан ${new Date(doc.signedAt).toLocaleDateString("ru-RU")}`
                  : `Добавлен ${new Date(doc.createdAt).toLocaleDateString("ru-RU")}`}
              </p>
            </div>
          </a>
        ))}

        {project.documents.length === 0 && (
          <div className="card p-8 text-center text-gray-400">
            Документы по проекту появятся здесь по мере оформления
          </div>
        )}
      </div>
    </div>
  );
}
