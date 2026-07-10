"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    roomId: "",
    wallsArea: "",
    ceilingArea: "",
    waterShutOff: false,
    doorsClosed: false,
    furnitureProtected: false,
    comment: "",
  });
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, String(value)));
    if (photos) {
      Array.from(photos).forEach((file) => body.append("photos", file));
    }

    const res = await fetch("/api/reports", { method: "POST", body });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Не удалось сохранить отчёт");
      return;
    }

    router.push("/dashboard/timeline");
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Новый отчёт с объекта</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">ID комнаты / зоны</label>
          <input
            required
            value={form.roomId}
            onChange={(e) => update("roomId", e.target.value)}
            placeholder="room_xxx"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Стены, м²</label>
            <input
              type="number"
              step="0.1"
              required
              value={form.wallsArea}
              onChange={(e) => update("wallsArea", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Потолок, м²</label>
            <input
              type="number"
              step="0.1"
              value={form.ceilingArea}
              onChange={(e) => update("ceilingArea", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { key: "waterShutOff", label: "Вода перекрыта" },
            { key: "doorsClosed", label: "Двери закрыты" },
            { key: "furnitureProtected", label: "Мебель защищена плёнкой" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(form as any)[key]}
                onChange={(e) => update(key as any, e.target.checked as any)}
              />
              {label}
            </label>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Комментарий мастера</label>
          <textarea
            value={form.comment}
            onChange={(e) => update("comment", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Фото / видео (до/после)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setPhotos(e.target.files)}
            className="w-full text-sm"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-tap mt-2 rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
        >
          {loading ? "Сохраняем…" : "Отправить отчёт"}
        </button>
      </form>
    </div>
  );
}
