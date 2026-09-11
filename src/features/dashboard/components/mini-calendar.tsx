import { cn } from "cn";

type DayStatus = "filled" | "missing" | "overtime" | "weekend" | "holiday" | "today" | "future";

interface DayData {
  date: number;
  status: DayStatus;
}

const statusStyles: Record<DayStatus, string> = {
  filled: "bg-emerald-500 text-white",
  missing: "bg-red-400 text-white",
  overtime: "bg-amber-400 text-white",
  weekend: "bg-muted text-muted-foreground opacity-50",
  holiday: "bg-purple-400 text-white",
  today: "ring-2 ring-primary bg-primary text-primary-foreground",
  future: "text-muted-foreground",
};

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Static demo data for September 2026
function generateDemoCalendar(): DayData[] {
  const days: DayData[] = [];
  // September 2026: starts on Tuesday (index 1)
  const startOffset = 1; // Tuesday
  const totalDays = 30;
  const today = 9;

  for (let i = 1; i <= totalDays; i++) {
    const dayOfWeek = (startOffset + i - 1) % 7; // 0=Mon, 6=Sun
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    let status: DayStatus = "future";
    if (isWeekend) {
      status = "weekend";
    } else if (i === today) {
      status = "today";
    } else if (i < today) {
      // past workdays
      if (i === 3) status = "holiday";
      else if (i === 2 || i === 5 || i === 8) status = "overtime";
      else if (i === 6) status = "missing";
      else status = "filled";
    }

    days.push({ date: i, status });
  }
  return days;
}

const calendarDays = generateDemoCalendar();

export default function MiniCalendar() {
  const startOffset = 1; // September 2026 starts on Tuesday

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold">September 2026</h3>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full bg-emerald-500" />
            Terisi
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full bg-red-400" />
            Kurang
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full bg-amber-400" />
            Lembur
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full bg-purple-400" />
            Libur
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Header hari */}
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}

        {/* Offset kosong di awal bulan */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Hari-hari */}
        {calendarDays.map(({ date, status }) => (
          <div
            key={date}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-xs font-medium transition-all",
              statusStyles[status],
              status === "future" && "cursor-default",
              (status === "filled" || status === "missing" || status === "overtime") &&
                "cursor-pointer hover:opacity-80",
            )}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
}
