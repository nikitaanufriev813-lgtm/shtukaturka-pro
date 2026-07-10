"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Не удалось зарегистрироваться");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-2xl font-bold">Регистрация клиента</h1>
        <p className="mb-6 text-sm text-gray-500">
          Создайте аккаунт, чтобы добавить свой объект
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Имя</label>
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
            <label className="mb-1 block text-sm font-medium">Email (необязательно)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Пароль</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-white/5"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-tap mt-2 rounded-lg bg-accent py-2.5 font-semibold text-brand-dark transition hover:bg-accent-light disabled:opacity-60"
          >
            {loading ? "Создаём аккаунт…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-brand">
            Войти
          </Link>
        </p>
      </div>
    </main>
  );
}
