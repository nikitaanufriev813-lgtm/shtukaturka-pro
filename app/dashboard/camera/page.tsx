import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiveCameraPlayer } from "@/components/dashboard/LiveCameraPlayer";

export default async function CameraPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const role = (session.user as any).role as string;

  const project = await prisma.project.findFirst({
    where: role === "CLIENT" ? { clientId: userId } : {},
    orderBy: { createdAt: "desc" },
    include: { camera: true },
  });

  if (!project) {
    return <p className="text-gray-400">Нет активного проекта.</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Прямая трансляция</h1>
      <p className="mb-6 text-gray-400">{project.address}</p>

      {project.camera ? (
        <LiveCameraPlayer playbackId={project.camera.playbackId} />
      ) : (
        <div className="card p-10 text-center text-gray-400">
          Камера на объекте пока не подключена. Как только бригадир установит
          камеру, трансляция появится здесь автоматически.
        </div>
      )}
    </div>
  );
}
