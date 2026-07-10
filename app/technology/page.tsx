import Link from "next/link";

const steps = [
  {
    title: "Подготовка поверхности",
    text: "Демонтаж старой отделки, удаление пыли и жирных пятен, установка защитных плёнок на мебель, окна и полы.",
  },
  {
    title: "Грунтовка",
    text: "Нанесение грунта глубокого проникновения — улучшает сцепление штукатурки со стеной и снижает расход материала.",
  },
  {
    title: "Установка маяков",
    text: "Профили-маяки выставляются строго по уровню — это гарантирует идеально ровную плоскость стены без волн.",
  },
  {
    title: "Машинное нанесение",
    text: "Штукатурная станция замешивает смесь до однородной консистенции и подаёт её под давлением через шланг — быстрее и равномернее ручного нанесения.",
  },
  {
    title: "Выравнивание правилом",
    text: "Излишки смеси снимаются алюминиевым правилом по маякам — формируется идеально ровная поверхность.",
  },
  {
    title: "Затирка и финиш",
    text: "После частичного высыхания поверхность затирается, убирая мелкие неровности и подготавливая стену под покраску или обои.",
  },
];

const benefits = [
  ["В 3–5 раз быстрее", "ручного нанесения — бригада закрывает большие площади за один день"],
  ["Меньше швов и трещин", "машинное нанесение даёт монолитный слой без стыков"],
  ["Точный расход материала", "станция дозирует смесь равномерно, экономия до 15–20%"],
  ["Идеальная плоскость", "отклонение по уровню — не более 1-2 мм на 2 метра"],
];

export default function TechnologyPage() {
  return (
    <main className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <section className="bg-gradient-to-b from-brand-dark to-brand px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-extrabold md:text-4xl">
            Что такое механизированная штукатурка
          </h1>
          <p className="mt-4 text-white/70">
            Технология нанесения штукатурки с помощью специальной станции — быстрее, ровнее и
            экономичнее классического ручного способа.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold">Почему это лучше ручной штукатурки</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {benefits.map(([title, text]) => (
            <div key={title} className="card p-5">
              <h3 className="mb-1 font-semibold text-brand dark:text-accent">{title}</h3>
              <p className="text-sm text-gray-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold">Как проходит процесс на объекте</h2>
        <div className="flex flex-col gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-4">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white dark:bg-accent dark:text-brand-dark">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Хотите увидеть процесс вживую?</h2>
        <Link
          href="/consultation"
          className="btn-tap inline-block rounded-xl bg-accent px-8 py-4 font-semibold text-brand-dark hover:bg-accent-light"
        >
          Записаться на просмотр объекта
        </Link>
      </section>
    </main>
  );
}
