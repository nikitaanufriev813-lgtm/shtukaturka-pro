import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EstimateClient } from "@/components/dashboard/EstimateClient";

export default async function ProjectEstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "FOREMAN")) {
    redirect("/dashboard");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project) {
    return <p className="p-6 text-gray-400">Проект не найден.</p>;
  }

  return (
    <div className="min-h-screen bg-surface-dark px-6 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-1 text-2xl font-bold">Смета объекта</h1>
        <p className="mb-6 text-gray-400">
          {project.client.name} · {project.address}
        </p>
        <EstimateClient projectId={projectId} />
      </div>
    </div>
  );
}
