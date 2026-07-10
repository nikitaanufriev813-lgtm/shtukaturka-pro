import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AvatarUploader } from "@/components/dashboard/AvatarUploader";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Профиль</h1>
      <div className="card flex flex-col items-center gap-4 p-8">
        <AvatarUploader currentAvatarUrl={user.avatarUrl} name={user.name} />
        <div className="text-center">
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-gray-400">{user.phone}</p>
          {user.email && <p className="text-sm text-gray-400">{user.email}</p>}
        </div>
      </div>
    </div>
  );
}
