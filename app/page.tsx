import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-dark to-brand text-white">
      <nav className="flex items-center justify-between px-4 py-4 md:px-16 md:py-6">
        <div className="text-lg font-extrabold tracking-tight md:text-xl">
          Штукатурка<span className="text-accent">PRO</span>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <Link
            href="/technology"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white sm:block"
          >
            О технологии
          </Link>
          <Link
            href="/otzyvy"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white sm:block"
          >
            Отзывы
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:text-white"
          >
            Войти
          </Link>
          <ThemeToggle className="btn-tap flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white" />
          <Link
            href="/consultation"
            className="btn-tap rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-brand-dark hover:bg-accent-light md:px-4 md:text-sm"
          >
            Записаться
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center md:px-6 md:py-36">
        <span className="mb-4 rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-accent-light">
          Прозрачность на 100%
        </span>
        <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
          Смотрите за ремонтом квартиры{" "}
          <span className="text-accent">в реальном времени</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/70">
          Личный кабинет со всеми отчётами, фото и прогрессом по каждой комнате.
          Вы точно знаете, что происходит с вашей квартирой — каждый день.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="btn-tap rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-brand-dark shadow-lg transition hover:scale-105 hover:bg-accent-light"
          >
            Зарегистрировать объект
          </Link>
          <Link
            href="/consultation"
            className="btn-tap rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            Записаться на просмотр
          </Link>
        </div>
      </section>
    </main>
  );
}
