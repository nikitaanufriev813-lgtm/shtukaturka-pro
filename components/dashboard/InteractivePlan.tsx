"use client";

import { useState } from "react";

interface Room {
  id: string;
  name: string;
  area: number;
  progressPercent: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
}

const statusLabels: Record<Room["status"], { label: string; color: string }> = {
  PENDING: { label: "Ожидает", color: "text-gray-400" },
  IN_PROGRESS: { label: "В работе", color: "text-warning" },
  DONE: { label: "Готово", color: "text-success" },
};

export function InteractivePlan({ rooms }: { rooms: Room[] }) {
  const [selected, setSelected] = useState<Room | null>(rooms[0] ?? null);

  if (rooms.length === 0) {
    return <p className="text-gray-400">Комнаты ещё не добавлены в проект.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelected(room)}
            className={`card flex flex-col items-start gap-1 p-4 text-left transition btn-tap ${
              selected?.id === room.id ? "ring-2 ring-accent" : "hover:shadow-lg"
            }`}
          >
            <span className="font-semibold">{room.name}</span>
            <span className="text-xs text-gray-400">{room.area} м²</span>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-brand"
                style={{ width: `${room.progressPercent}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="card p-6">
          <h2 className="text-xl font-bold">{selected.name}</h2>
          <p className="mt-1 text-sm text-gray-400">{selected.area} м²</p>
          <p className={`mt-1 text-sm font-medium ${statusLabels[selected.status].color}`}>
            {statusLabels[selected.status].label}
          </p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-brand transition-all"
              style={{ width: `${selected.progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-400">{selected.progressPercent}%</p>

          <a
            href={`/dashboard/rooms/${selected.id}`}
            className="mt-6 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light"
          >
            Смотреть отчёты по комнате
          </a>
        </div>
      )}
    </div>
  );
}
