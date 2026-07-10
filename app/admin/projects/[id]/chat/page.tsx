import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChatWindow } from "@/components/dashboard/ChatWindow";

export default async function AdminProjectChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "ADMIN") redirect("/dashboard");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project) {
    return <p className="text-gray-400">Проект не найден.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Чат — {project.client.name}</h1>
      <p className="mb-6 text-gray-400">{project.address}</p>
      <ChatWindow projectId={project.id} currentUserId={(session.user as any).id} />
    </div>
  );
}
