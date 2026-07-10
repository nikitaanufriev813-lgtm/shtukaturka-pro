import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export function StatsCard({ icon: Icon, label, value, hint }: StatsCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-brand/15 text-brand shadow-inner dark:from-accent/20 dark:to-accent/5 dark:text-accent">
        <Icon size={22} strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}
