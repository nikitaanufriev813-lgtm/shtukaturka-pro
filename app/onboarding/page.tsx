"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ address: "", area: "", roomsCount: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: form.address,
        area: parseFloat(form.area),
        roomsCount: parseInt(form.roomsCount, 10),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Не удалось создать объект");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light px-4 py-12 dark:bg-surface-dark">
      <div className="card w-full max-w-lg p-8">
        <h1 className="mb-1 text-2xl font-bold">Добавить объект</h1>
        <p className="mb-6 text-sm text-gray-500">
          Расскажите о вашей квартире — мы создадим проект и вы сразу увидите его в личном
          кабинете.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Адрес</label>
            <input
              required
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="г. Москва, ул. Примерная, д. 10, кв. 25"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Площадь, м²</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Количество комнат</label>
              <input
                type="number"
                min={1}
                required
                value={form.roomsCount}
                onChange={(e) => update("roomsCount", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Загрузку плана квартиры (PDF/фото) и интерактивную разметку комнат можно будет
            добавить позже в разделе «План квартиры».
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-tap mt-2 rounded-lg bg-accent py-2.5 font-semibold text-brand-dark hover:bg-accent-light disabled:opacity-60"
          >
            {loading ? "Создаём объект…" : "Создать объект"}
          </button>
        </form>
      </div>
    </main>
  );
}
