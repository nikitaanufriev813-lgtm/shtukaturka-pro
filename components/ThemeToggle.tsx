"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "full";
  className?: string;
}) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // До монтирования не знаем реальную тему — рендерим невидимую заглушку,
  // чтобы избежать несовпадения серверной/клиентской разметки.
  if (!mounted) {
    return <div className={variant === "icon" ? "h-9 w-9" : "h-9 w-full"} />;
  }

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        className="btn-tap flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-brand/5 hover:text-brand dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        {isDark ? <Sun size={18} strokeWidth={2.25} /> : <Moon size={18} strokeWidth={2.25} />}
        {isDark ? "Светлая тема" : "Тёмная тема"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className={
        className ??
        "btn-tap flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-brand/5 hover:text-brand dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
      }
    >
      {isDark ? <Sun size={18} strokeWidth={2.25} /> : <Moon size={18} strokeWidth={2.25} />}
    </button>
  );
}
