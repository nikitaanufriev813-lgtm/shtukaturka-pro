"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  Video,
  Rows3,
  MessageCircle,
  Menu,
  X,
  Map,
  Boxes,
  Wallet,
  FileText,
  Star,
  LogOut,
  User,
} from "lucide-react";

const primaryItems = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/dashboard/camera", label: "Камера", icon: Video },
  { href: "/dashboard/timeline", label: "Хроника", icon: Rows3 },
  { href: "/dashboard/chat", label: "Чат", icon: MessageCircle },
];

const moreItems = [
  { href: "/dashboard/plan", label: "План квартиры", icon: Map },
  { href: "/dashboard/materials", label: "Материалы", icon: Boxes },
  { href: "/dashboard/finance", label: "Финансы", icon: Wallet },
  { href: "/dashboard/documents", label: "Документы", icon: FileText },
  { href: "/dashboard/review", label: "Оставить отзыв", icon: Star },
  { href: "/dashboard/profile", label: "Профиль", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Выдвижная панель "Ещё" */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="safe-bottom absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4 dark:bg-[#182236]">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">Ещё разделы</span>
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="btn-tap flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 active:bg-gray-100 dark:text-gray-300 dark:active:bg-white/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-brand/10 text-brand dark:text-accent">
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
            </div>
          </div>
        </div>
      )}

      {/* Нижний таб-бар */}
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur md:hidden dark:border-white/10 dark:bg-[#0F1A30]/95">
        <div className="grid grid-cols-5">
          {primaryItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`btn-tap flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                  active ? "text-brand dark:text-accent" : "text-gray-400"
                }`}
              >
                <span
                  className={`flex h-7 w-9 items-center justify-center rounded-full transition ${
                    active ? "bg-accent/20 dark:bg-accent/20" : ""
                  }`}
                >
                  <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                </span>
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className="btn-tap flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-gray-400"
          >
            <span className="flex h-7 w-9 items-center justify-center">
              <Menu size={19} strokeWidth={2} />
            </span>
            Ещё
          </button>
        </div>
      </nav>
    </>
  );
}
