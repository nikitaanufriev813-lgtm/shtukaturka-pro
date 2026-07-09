import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-dark to-brand text-white">
      <nav className="flex items-center justify-between px-6 py-6 md:px-16">
        <div className="text-xl font-extrabold tracking-tight">
          Штукатурка<span className="text-accent">PRO</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 hover:text-white"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-accent-light"
          >
            Начать проект
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center md:py-36">
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
        <Link
          href="/register"
          className="mt-10 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-brand-dark shadow-lg transition hover:scale-105 hover:bg-accent-light"
        >
          Зарегистрировать объект
        </Link>
      </section>
    </main>
  );
}
