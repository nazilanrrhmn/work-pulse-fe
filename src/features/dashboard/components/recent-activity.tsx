import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "cn";

interface ActivityEntry {
  id: number;
  date: string;
  day: string;
  activity: string;
  checkIn: string;
  checkOut: string;
  overtime: string | null;
}

const recentActivities: ActivityEntry[] = [
  {
    id: 1,
    date: "09 Sep 2026",
    day: "Selasa",
    activity: "Development fitur timesheet export",
    checkIn: "08:00",
    checkOut: "17:00",
    overtime: null,
  },
  {
    id: 2,
    date: "08 Sep 2026",
    day: "Senin",
    activity: "Meeting koordinasi tim & code review",
    checkIn: "07:45",
    checkOut: "19:30",
    overtime: "2.5 jam",
  },
  {
    id: 3,
    date: "05 Sep 2026",
    day: "Jumat",
    activity: "Perbaikan bug produksi & deployment",
    checkIn: "08:00",
    checkOut: "18:00",
    overtime: "1 jam",
  },
  {
    id: 4,
    date: "04 Sep 2026",
    day: "Kamis",
    activity: "Dokumentasi API dan review desain UI",
    checkIn: "08:15",
    checkOut: "17:00",
    overtime: null,
  },
  {
    id: 5,
    date: "02 Sep 2026",
    day: "Selasa",
    activity: "Setup environment & onboarding",
    checkIn: "08:00",
    checkOut: "17:00",
    overtime: null,
  },
];

export default function RecentActivity() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <h3 className="font-semibold">Aktivitas Terbaru</h3>
        <Link
          to="/timesheet"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Lihat semua <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {recentActivities.map((entry) => (
          <div
            key={entry.id}
            className="flex min-w-0 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5 sm:py-3.5"
          >
            {/* Date badge — compact on mobile */}
            <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted px-1.5 py-1.5 text-center sm:w-14">
              <span className="text-[10px] font-semibold leading-none text-muted-foreground">
                {entry.date.split(" ")[1]} {entry.date.split(" ")[2]}
              </span>
              <span className="mt-0.5 text-base font-bold leading-none text-foreground sm:text-lg">
                {entry.date.split(" ")[0]}
              </span>
              <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                {entry.day}
              </span>
            </div>

            {/* Content — min-w-0 + truncate prevents overflow */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.activity}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  {entry.checkIn}–{entry.checkOut}
                </span>
                {entry.overtime && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    +{entry.overtime} lembur
                  </span>
                )}
              </div>
            </div>

            {/* Hours pill — hidden on very small screens to avoid pushing */}
            <div
              className={cn(
                "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:block",
                entry.overtime
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
              )}
            >
              {entry.overtime
                ? `${8 + parseFloat(entry.overtime)}j`
                : "8j"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
