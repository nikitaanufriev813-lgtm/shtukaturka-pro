import Link from "next/link";
import {
  LayoutDashboard,
  Rows3,
  Map,
  Boxes,
  Wallet,
  FileText,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/dashboard/timeline", label: "Хроника работ", icon: Rows3 },
  { href: "/dashboard/plan", label: "План квартиры", icon: Map },
  { href: "/dashboard/materials", label: "Материалы", icon: Boxes },
  { href: "/dashboard/finance", label: "Финансы", icon: Wallet },
  { href: "/dashboard/documents", label: "Документы", icon: FileText },
  { href: "/dashboard/chat", label: "Чат с менеджером", icon: MessageCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark">
      <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white px-4 py-6 dark:border-white/10 dark:bg-[#0F1A30] md:flex">
        <div className="mb-8 px-2 text-xl font-extrabold text-brand dark:text-white">
          Штукатурка<span className="text-accent">PRO</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-brand/5 hover:text-brand dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
