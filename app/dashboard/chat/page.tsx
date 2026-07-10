import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/dashboard/ChatWindow";

export default async function ChatPage() {
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

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Чат с менеджером</h1>
      <ChatWindow projectId={project.id} currentUserId={userId} />
    </div>
  );
}
