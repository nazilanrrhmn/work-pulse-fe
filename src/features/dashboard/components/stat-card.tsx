import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "danger";
}

const variantStyles = {
  default: "bg-card text-card-foreground border-border",
  warning: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800",
  success: "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800",
  danger: "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  warning: "bg-amber-200/60 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300",
  success: "bg-emerald-200/60 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-300",
  danger: "bg-red-200/60 text-red-700 dark:bg-red-800/40 dark:text-red-300",
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        // Responsive: stack vertically on small screens, horizontal on sm+
        "flex min-w-0 flex-col gap-2 rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4",
        variantStyles[variant],
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-12",
          iconStyles[variant],
        )}
      >
        <Icon className="size-4 sm:size-6" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium opacity-70 sm:text-sm">{title}</p>
        <p className="text-xl font-bold leading-tight sm:text-2xl">{value}</p>
        {subtitle && (
          <p className="truncate text-xs opacity-60">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
