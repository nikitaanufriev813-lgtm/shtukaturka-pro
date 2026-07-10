"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Rows3,
  Map,
  Boxes,
  Wallet,
  FileText,
  MessageCircle,
  Video,
  Star,
  LogOut,
  User,
} from "lucide-react";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/dashboard/camera", label: "Трансляция с объекта", icon: Video },
  { href: "/dashboard/timeline", label: "Хроника работ", icon: Rows3 },
  { href: "/dashboard/plan", label: "План квартиры", icon: Map },
  { href: "/dashboard/materials", label: "Материалы", icon: Boxes },
  { href: "/dashboard/finance", label: "Финансы", icon: Wallet },
  { href: "/dashboard/documents", label: "Документы", icon: FileText },
  { href: "/dashboard/chat", label: "Чат с менеджером", icon: MessageCircle },
  { href: "/dashboard/review", label: "Оставить отзыв", icon: Star },
  { href: "/dashboard/profile", label: "Профиль", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      {/* Десктоп: боковое меню */}
      <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0F1A30] md:flex">
        <div className="mb-8 px-2 text-xl font-extrabold text-brand dark:text-white">
          Штукатурка<span className="text-accent">PRO</span>
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
                    ? "bg-gradient-to-r from-accent/20 to-transparent text-brand dark:text-white"
                    : "text-gray-500 hover:bg-brand/5 hover:text-brand dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-accent text-brand-dark shadow-sm"
                      : "bg-transparent text-current"
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

      {/* Мобиль: верхний компактный хедер */}
      <header className="safe-top fixed left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-white/10 dark:bg-[#0F1A30]/95">
        <span className="text-base font-extrabold text-brand dark:text-white">
          Штукатурка<span className="text-accent">PRO</span>
        </span>
        <ThemeToggle />
      </header>

      <main className="flex-1 px-4 pb-safe-nav pt-16 md:px-10 md:py-8 md:pb-8 md:pt-8">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
