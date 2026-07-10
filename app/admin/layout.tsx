"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/admin", label: "Все объекты", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Заявки на просмотр", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-surface-dark text-white md:flex-row">
      {/* Мобиль: верхний хедер с бургер-меню */}
      <header className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0F1A30]/95 px-4 py-3 backdrop-blur md:hidden">
        <span className="text-base font-extrabold">
          Штукатурка<span className="text-accent">PRO</span>
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="p-1 text-gray-300">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Мобиль: выдвижная панель */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="safe-top absolute right-0 top-0 h-full w-72 bg-[#0F1A30] p-4">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-accent">
                Панель менеджера
              </span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-300">
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="btn-tap flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-300 active:bg-white/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/25 to-accent/5 text-accent">
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  {label}
                </Link>
              ))}
              <ThemeToggle variant="full" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-danger active:bg-danger/10"
              >
                <LogOut size={18} />
                Выйти
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Десктоп: боковое меню */}
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-[#0F1A30] px-4 py-6 md:flex">
        <div className="mb-1 px-2 text-xl font-extrabold">
          Штукатурка<span className="text-accent">PRO</span>
        </div>
        <div className="mb-8 px-2 text-xs uppercase tracking-wider text-accent">
          Панель менеджера
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`btn-tap flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-accent/20 to-transparent text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition ${
                    active ? "bg-accent text-brand-dark shadow-sm" : "bg-transparent text-current"
                  }`}
                >
                  <Icon size={17} strokeWidth={2.25} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle variant="full" />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="btn-tap mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-danger/10"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </aside>

      <main className="safe-bottom flex-1 overflow-x-auto px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
