import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { useHolidays } from "../hooks/use-holidays";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import {
  fetchAttendances,
  type AttendanceResponseDTO,
} from "@/stores/attendance/async";

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
  | "today_filled"
  | "today_overtime"
  | "future";

interface DayCell {
  readonly date: number;
  readonly dateStr: string; // "YYYY-MM-DD"
  readonly status: DayStatus;
  readonly tooltip?: string;
}

interface DayContext {
  readonly isToday: boolean;
  readonly isPast: boolean;
  readonly isWeekend: boolean;
  readonly isNational: boolean;
  readonly isJoint: boolean;
  readonly attendance?: AttendanceResponseDTO;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const LEAVE_TYPES: ReadonlySet<string> = new Set([
  "CUTI",
  "IZIN",
  "SAKIT",
  "SICK",
  "ANNUAL",
  "PERMISSION",
  "OTHER",
  "LEAVE",
]);

const statusStyles: Record<DayStatus, string> = {
  filled: "bg-emerald-500 text-white",
  missing: "bg-red-400 text-white",
  overtime: "bg-amber-400 text-white",
  weekend: "bg-muted text-muted-foreground opacity-40",
  national_holiday: "bg-rose-500 text-white font-bold",
  joint_leave: "bg-purple-400 text-white",
  today: "ring-2 ring-primary bg-primary text-primary-foreground font-bold",
  today_holiday: "ring-2 ring-rose-500 bg-rose-500 text-white font-bold",
  today_filled:
    "ring-2 ring-emerald-500 bg-emerald-500 text-white font-bold",
  today_overtime:
    "ring-2 ring-amber-400 bg-amber-400 text-white font-bold",
  future: "text-muted-foreground",
};

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const LEGEND_ITEMS = [
  { label: "Terisi", color: "bg-emerald-500" },
  { label: "Kurang", color: "bg-red-400" },
  { label: "Lembur", color: "bg-amber-400" },
  { label: "Libur", color: "bg-rose-500" },
  { label: "Cuti Bersama", color: "bg-purple-400" },
] as const;

const SATURDAY_INDEX = 5; // 0=Sen … 6=Min
const CALENDAR_FETCH_LIMIT = 50;

// Key statis untuk placeholder (skeleton & offset awal bulan)
const WEEKDAY_SKELETON_KEYS = WEEKDAYS.map((d) => `skeleton-head-${d}`);
const DAY_SKELETON_KEYS = Array.from(
  { length: 35 },
  (_, n) => `skeleton-day-${n}`,
);
const OFFSET_KEYS = Array.from({ length: 6 }, (_, n) => `offset-${n}`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pad = (value: number) => String(value).padStart(2, "0");

/** Format tanggal ke "YYYY-MM-DD" (month berbasis 0) */
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Indeks hari dengan Senin sebagai awal minggu (0=Sen … 6=Min) */
function getWeekdayIndex(year: number, month: number, day: number): number {
  const jsDay = new Date(year, month, day).getDay(); // 0=Sun … 6=Sat
  return (jsDay + 6) % 7;
}

/** Jumlah hari dalam sebulan */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Apakah tanggal sudah lewat, relatif terhadap hari ini */
function isPastDay(
  year: number,
  month: number,
  day: number,
  today: Date,
): boolean {
  const viewed = year * 12 + month;
  const current = today.getFullYear() * 12 + today.getMonth();

  if (viewed !== current) return viewed < current;
  return day < today.getDate();
}

/** Tentukan status attendance berdasarkan data record dari backend */
function resolveAttendanceStatus(
  record: AttendanceResponseDTO,
  isToday: boolean,
): DayStatus {
  // Cek apakah tipe izin/cuti/sakit
  if (LEAVE_TYPES.has(record.type.toUpperCase())) {
    return "missing";
  }

  // Ada lembur
  if (record.overtime) {
    return isToday ? "today_overtime" : "overtime";
  }

  // Hadir biasa (ada clockIn)
  if (record.clockIn) {
    return isToday ? "today_filled" : "filled";
  }

  return "missing";
}

/** Tentukan status hari berdasarkan prioritas: libur > data backend > akhir pekan > hari ini > lewat */
function resolveDayStatus(ctx: DayContext): DayStatus {
  if (ctx.isNational) return ctx.isToday ? "today_holiday" : "national_holiday";
  if (ctx.isJoint) return "joint_leave";
  if (ctx.isWeekend) return "weekend";

  // Gunakan data real dari backend
  if (ctx.attendance) {
    return resolveAttendanceStatus(ctx.attendance, ctx.isToday);
  }

  if (ctx.isToday) return "today";

  // Hari yang sudah lewat tanpa record = belum diisi
  return ctx.isPast ? "missing" : "future";
}

interface BuildCellsParams {
  readonly year: number;
  readonly month: number;
  readonly today: Date;
  readonly nationalHolidaySet: ReadonlySet<string>;
  readonly jointLeaveSet: ReadonlySet<string>;
  readonly holidayNames: ReadonlyMap<string, string>;
  readonly recordsByDate: ReadonlyMap<string, AttendanceResponseDTO>;
}

function buildCells({
  year,
  month,
  today,
  nationalHolidaySet,
  jointLeaveSet,
  holidayNames,
  recordsByDate,
}: BuildCellsParams): DayCell[] {
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return Array.from({ length: getDaysInMonth(year, month) }, (_, i) => {
    const day = i + 1;
    const dateStr = toDateStr(year, month, day);
    const isNational = nationalHolidaySet.has(dateStr);
    const isJoint = jointLeaveSet.has(dateStr);

    const status = resolveDayStatus({
      isNational,
      isJoint,
      isWeekend: getWeekdayIndex(year, month, day) >= SATURDAY_INDEX,
      isToday: isCurrentMonth && day === today.getDate(),
      isPast: isPastDay(year, month, day, today),
      attendance: recordsByDate.get(dateStr),
    });

    return {
      date: day,
      dateStr,
      status,
      tooltip: isNational || isJoint ? holidayNames.get(dateStr) : undefined,
    };
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_SKELETON_KEYS.map((key) => (
          <div key={key} className="mx-auto h-3 w-6 rounded bg-muted" />
        ))}
        {DAY_SKELETON_KEYS.map((key) => (
          <div key={key} className="aspect-square rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {LEGEND_ITEMS.map(({ label, color }) => (
        <span key={label} className="flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-full", color)} />
          {label}
        </span>
      ))}
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MiniCalendar() {
  const dispatch = useAppDispatch();
  const { records } = useAppSelector((state) => state.attendance);

  const today = useMemo(() => new Date(), []);
  const [viewed, setViewed] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const { year, month } = viewed;

  const { nationalHolidaySet, jointLeaveSet, holidayNames, isLoading } =
    useHolidays(year);

  // ── Fetch attendance data saat bulan berubah ──
  useEffect(() => {
    const daysInMonth = getDaysInMonth(year, month);

    dispatch(
      fetchAttendances({
        start_date: toDateStr(year, month, 1),
        end_date: toDateStr(year, month, daysInMonth),
        limit: CALENDAR_FETCH_LIMIT,
      }),
    );
  }, [year, month, dispatch]);

  // ── Map records berdasarkan tanggal untuk lookup O(1) ──
  const recordsByDate = useMemo(
    () => new Map(records.map((r) => [r.date, r])),
    [records],
  );

  // ── Navigasi bulan (Date menangani pergantian tahun otomatis) ──
  const shiftMonth = (delta: number) => {
    setViewed(({ year: y, month: m }) => {
      const next = new Date(y, m + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const startOffset = getWeekdayIndex(year, month, 1);

  const cells = useMemo(
    () =>
      buildCells({
        year,
        month,
        today,
        nationalHolidaySet,
        jointLeaveSet,
        holidayNames,
        recordsByDate,
      }),
    [
      year,
      month,
      today,
      nationalHolidaySet,
      jointLeaveSet,
      holidayNames,
      recordsByDate,
    ],
  );

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* ── Header + Navigasi ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{`${MONTH_NAMES[month]} ${year}`}</h3>
          <Legend />
        </div>

        <div className="flex items-center gap-1">
          <NavButton label="Bulan sebelumnya" onClick={() => shiftMonth(-1)}>
            <ChevronLeft className="size-4" />
          </NavButton>
          <NavButton label="Bulan berikutnya" onClick={() => shiftMonth(1)}>
            <ChevronRight className="size-4" />
          </NavButton>
        </div>
      </div>

      {/* ── Grid Kalender ── */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}

          {/* Offset kosong di awal bulan */}
          {OFFSET_KEYS.slice(0, startOffset).map((key) => (
            <div key={key} />
          ))}

          {cells.map(({ date, status, tooltip }) => (
            <div
              key={date}
              title={tooltip}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md text-xs transition-all",
                statusStyles[status],
                tooltip && "cursor-help",
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
