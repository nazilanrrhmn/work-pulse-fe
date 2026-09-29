import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "cn";
import type { AttendanceResponseDTO } from "@/stores/attendance/async";

interface RecentActivityProps {
  readonly data?: readonly AttendanceResponseDTO[];
  readonly loading?: boolean;
}

// ── Constants ──
const LEAVE_TYPES: ReadonlySet<string> = new Set(["CUTI", "IZIN", "SAKIT"]);
const EMPTY_TIME = "--:--";

const PILL_CLASS = {
  overtime:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  leave: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
} as const;

const dayFormat = new Intl.DateTimeFormat("id-ID", { day: "2-digit" });
const monthYearFormat = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});
const weekdayFormat = new Intl.DateTimeFormat("id-ID", { weekday: "long" });

// ── Helpers ──
const toHHmm = (time?: string | null) => (time ? time.slice(0, 5) : null);

function formatTimeRange(entry: AttendanceResponseDTO): string {
  const clockIn = toHHmm(entry.clockIn) ?? EMPTY_TIME;
  const clockOut =
    toHHmm(entry.overtimeClockOut || entry.clockOut) ?? EMPTY_TIME;
  return `${clockIn}–${clockOut}`;
}

function getTitle(entry: AttendanceResponseDTO): string {
  if (entry.type === "HADIR") {
    return entry.activityDescription || entry.project || "Bekerja";
  }
  if (LEAVE_TYPES.has(entry.type)) return `Pengajuan: ${entry.type}`;
  return entry.type;
}

function getPill(entry: AttendanceResponseDTO): {
  label: string;
  className: string;
} {
  const label = entry.type === "HADIR" ? "Hadir" : entry.type;

  if (entry.overtime) return { label, className: PILL_CLASS.overtime };
  if (LEAVE_TYPES.has(entry.type)) {
    return { label, className: PILL_CLASS.leave };
  }
  return { label, className: PILL_CLASS.present };
}

// ── Sub-components ──
function MessageRow({ children }: { readonly children: string }) {
  return (
    <div className="p-4 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function DateBadge({ date }: { readonly date: string }) {
  // Tambahkan waktu lokal agar "YYYY-MM-DD" tidak dibaca sebagai UTC
  const dateObj = new Date(`${date}T00:00:00`);

  return (
    <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted px-1.5 py-1.5 text-center sm:w-14">
      <span className="text-[10px] font-semibold leading-none text-muted-foreground">
        {monthYearFormat.format(dateObj)}
      </span>
      <span className="mt-0.5 text-base font-bold leading-none text-foreground sm:text-lg">
        {dayFormat.format(dateObj)}
      </span>
      <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
        {weekdayFormat.format(dateObj)}
      </span>
    </div>
  );
}

function ActivityItem({ entry }: { readonly entry: AttendanceResponseDTO }) {
  const isPresent = entry.type === "HADIR";
  const pill = getPill(entry);

  return (
    <div className="flex min-w-0 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5 sm:py-3.5">
      <DateBadge date={entry.date} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {getTitle(entry)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {isPresent && (
            <span className="flex items-center gap-1">
              <Clock className="size-3 shrink-0" />
              {formatTimeRange(entry)}
            </span>
          )}
          {entry.overtime && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                PILL_CLASS.overtime,
              )}
            >
              + Lembur
            </span>
          )}
        </div>
      </div>

      {/* Status pill */}
      <div
        className={cn(
          "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:block",
          pill.className,
        )}
      >
        {pill.label}
      </div>
    </div>
  );
}

function ActivityList({
  data,
  loading,
}: {
  readonly data: readonly AttendanceResponseDTO[];
  readonly loading: boolean;
}) {
  if (loading) return <MessageRow>Memuat data...</MessageRow>;
  if (data.length === 0) {
    return <MessageRow>Belum ada aktivitas terbaru</MessageRow>;
  }

  return (
    <>
      {data.map((entry) => (
        <ActivityItem key={entry.uuid} entry={entry} />
      ))}
    </>
  );
}

// ── Component ──
export default function RecentActivity({
  data = [],
  loading = false,
}: RecentActivityProps) {
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
        <ActivityList data={data} loading={loading} />
      </div>
    </div>
  );
}
