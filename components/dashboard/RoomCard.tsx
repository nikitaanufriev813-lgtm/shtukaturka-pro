import Link from "next/link";

interface RoomCardProps {
  id: string;
  name: string;
  area: number;
  progressPercent: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  coverPhotoUrl?: string;
}

const statusLabels: Record<RoomCardProps["status"], { label: string; color: string }> = {
  PENDING: { label: "Ожидает", color: "bg-gray-200 text-gray-600" },
  IN_PROGRESS: { label: "В работе", color: "bg-warning/20 text-warning" },
  DONE: { label: "Готово", color: "bg-success/20 text-success" },
};

export function RoomCard({ id, name, area, progressPercent, status, coverPhotoUrl }: RoomCardProps) {
  const statusInfo = statusLabels[status];

  return (
    <Link
      href={`/dashboard/rooms/${id}`}
      className="card group flex flex-col overflow-hidden transition hover:shadow-lg"
    >
      <div
        className="h-32 w-full bg-cover bg-center bg-brand/10"
        style={{ backgroundImage: coverPhotoUrl ? `url(${coverPhotoUrl})` : undefined }}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-sm text-gray-400">{area} м²</p>

        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-right text-xs font-medium text-gray-400">{progressPercent}%</span>
      </div>
    </Link>
  );
}
