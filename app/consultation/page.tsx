"use client";

import { useState } from "react";

export default function ConsultationPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    preferredDate: "",
    comment: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Не удалось отправить заявку");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
        <div className="card max-w-md p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Заявка принята!</h1>
          <p className="text-gray-500">
            Наш менеджер свяжется с вами в ближайшее время, чтобы согласовать удобное время
            просмотра.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light px-4 py-12 dark:bg-surface-dark">
      <div className="card w-full max-w-lg p-8">
        <h1 className="mb-1 text-2xl font-bold">Запись на просмотр объекта</h1>
        <p className="mb-6 text-sm text-gray-500">
          Хотите увидеть, как выглядит механизированная штукатурка вживую? Оставьте заявку —
          подберём для вас удобный готовый или текущий объект.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Ваше имя</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Телефон</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+7 900 000-00-00"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Ваш адрес (если хотите оценку сразу)
            </label>
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Удобная дата просмотра</label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => update("preferredDate", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Комментарий</label>
            <textarea
              rows={3}
              value={form.comment}
              onChange={(e) => update("comment", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-tap mt-2 rounded-lg bg-accent py-2.5 font-semibold text-brand-dark hover:bg-accent-light disabled:opacity-60"
          >
            {loading ? "Отправляем…" : "Записаться"}
          </button>
        </form>
      </div>
    </main>
  );
}
