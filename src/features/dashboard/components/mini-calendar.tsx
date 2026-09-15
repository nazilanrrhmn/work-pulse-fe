import { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { useHolidays } from "../hooks/use-holidays";

// ─── Types ──────────────────────────────────────────────────────────────────

type DayStatus =
  | "filled"
  | "missing"
  | "overtime"
  | "weekend"
  | "national_holiday"
  | "joint_leave"
  | "today"
  | "today_holiday"
  | "future";

interface DayCell {
  date: number;
  dateStr: string; // "YYYY-MM-DD"
  status: DayStatus;
  tooltip?: string;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const statusStyles: Record<DayStatus, string> = {
  filled: "bg-emerald-500 text-white",
  missing: "bg-red-400 text-white",
  overtime: "bg-amber-400 text-white",
  weekend: "bg-muted text-muted-foreground opacity-40",
  national_holiday: "bg-rose-500 text-white font-bold",
  joint_leave: "bg-purple-400 text-white",
  today: "ring-2 ring-primary bg-primary text-primary-foreground font-bold",
  today_holiday: "ring-2 ring-rose-500 bg-rose-500 text-white font-bold",
  future: "text-muted-foreground",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Nama bulan dalam Bahasa Indonesia */
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** Format tanggal ke "YYYY-MM-DD" */
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Hari pertama bulan (0=Sen … 6=Min, sesuai WEEKDAYS) */
function getStartOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0=Sun,1=Mon...6=Sat
  // Konversi ke Mon-first: Sun(0)→6, Mon(1)→0, ..., Sat(6)→5
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Jumlah hari dalam sebulan */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="mx-auto h-3 w-6 rounded bg-muted" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MiniCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const { nationalHolidaySet, jointLeaveSet, holidayNames, isLoading } =
    useHolidays(year);

  // ── Navigasi bulan ──
  const prevMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  // ── Bangun cell kalender (useMemo: rebuild saat bulan atau holiday data berubah) ──
  const startOffset = getStartOffset(year, month);
  const totalDays = getDaysInMonth(year, month);
  const todayDay = today.getDate();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const cells = useMemo<DayCell[]>(() => {
    const result: DayCell[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = toDateStr(year, month, day);
      const jsDay = new Date(year, month, day).getDay();
      const weekdayIdx = jsDay === 0 ? 6 : jsDay - 1; // 0=Mon … 6=Sun
      const isWeekend = weekdayIdx >= 5;
      const isToday = isCurrentMonth && day === todayDay;
      const isPast = isCurrentMonth
        ? day < todayDay
        : new Date(year, month, day) <
          new Date(today.getFullYear(), today.getMonth(), 1);

      const isNational = nationalHolidaySet.has(dateStr);
      const isJoint = jointLeaveSet.has(dateStr);
      const holidayName = holidayNames.get(dateStr);

      let status: DayStatus = "future";
      let tooltip: string | undefined;

      if (isNational) {
        status = isToday ? "today_holiday" : "national_holiday";
        tooltip = holidayName;
      } else if (isJoint) {
        status = "joint_leave";
        tooltip = holidayName;
      } else if (isWeekend) {
        status = "weekend";
      } else if (isToday) {
        status = "today";
      } else if (isPast) {
        // TODO: ganti dengan data real timesheet saat sudah ada endpoint
        status = "filled";
      } else {
        status = "future";
      }

      result.push({ date: day, dateStr, status, tooltip });
    }

    return result;
  }, [
    year,
    month,
    totalDays,
    todayDay,
    isCurrentMonth,
    nationalHolidaySet,
    jointLeaveSet,
    holidayNames,
  ]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* ── Header + Navigasi ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {MONTH_NAMES[month]} {year}
          </h3>
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
              <span className="inline-block size-2.5 rounded-full bg-rose-500" />
              Libur
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block size-2.5 rounded-full bg-purple-400" />
              Cuti Bersama
            </span>
          </div>
        </div>

        {/* Tombol navigasi */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="Bulan sebelumnya"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Bulan berikutnya"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Grid Kalender ── */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Header nama hari */}
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
          {cells.map(({ date, status, tooltip }) => (
            <div
              key={date}
              title={tooltip}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-xs transition-all",
                statusStyles[status],
                tooltip && "cursor-help",
                (status === "filled" ||
                  status === "missing" ||
                  status === "overtime") &&
                  "cursor-pointer hover:opacity-80",
              )}
            >
              {date}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
