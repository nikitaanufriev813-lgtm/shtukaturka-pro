"use client";

import { useState } from "react";

export default function LeaveReviewPage() {
  const [projectId, setProjectId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/projects/${projectId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Не удалось отправить отзыв");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="mb-2 text-xl font-bold">Спасибо за отзыв!</h1>
        <p className="text-gray-500">
          Он появится на публичной странице после проверки менеджером.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Оставить отзыв</h1>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">ID вашего проекта</label>
          <input
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="project_xxx"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Оценка</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`btn-tap h-10 w-10 rounded-lg text-sm font-semibold transition ${
                  n <= rating
                    ? "bg-accent text-brand-dark"
                    : "bg-gray-100 text-gray-400 dark:bg-white/5"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Комментарий</label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Расскажите, как прошёл ремонт..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-tap mt-2 rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-light disabled:opacity-60"
        >
          {loading ? "Отправляем…" : "Отправить отзыв"}
        </button>
      </form>
    </div>
  );
}
