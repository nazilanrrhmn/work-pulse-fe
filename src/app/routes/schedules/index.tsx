import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-store";
import {
  fetchAttendances,
  type AttendanceResponseDTO,
} from "@/stores/attendance/async";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarX,
  Clock,
  AlertCircle,
  FileDown,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { apiV1 } from "@/libs/api";
import Swal from "sweetalert2";

// ── Types ──────────────────────────────────────────────────────────────────────
type AttendanceStatus = "present" | "absent" | "holiday" | "empty" | "weekend";

interface TimesheetRow {
  date: string;
  day: string;
  checkIn: string | null;
  checkOut: string | null;
  duration: string | null;
  project: string | null;
  notes: string | null;
  status: AttendanceStatus;
}

// ── Constants ──────────────────────────────────────────────────────────────────
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

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
const ABSENT_TYPES = new Set(["CUTI", "IZIN", "SAKIT"]);
const TABLE_HEADERS = [
  "Tanggal",
  "Check-in",
  "Check-out",
  "Durasi",
  "Project",
  "Keterangan",
  "Status",
] as const;
const RECORDS_LIMIT = 100;

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; className: string }
> = {
  present: {
    label: "Hadir",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  absent: {
    label: "Tidak Hadir",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  holiday: {
    label: "Hari Libur",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  empty: {
    label: "Belum Diisi",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  weekend: {
    label: "Akhir Pekan",
    className: "bg-muted text-muted-foreground",
  },
};

// ── Date helpers ───────────────────────────────────────────────────────────────
const pad = (value: number) => String(value).padStart(2, "0");

/** Format "YYYY-MM-DD"; `monthIndex` berbasis 0 (sama seperti Date#getMonth). */
const toDateKey = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate();

const formatDayMonth = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

/** Ambil "HH:mm" dari "HH:mm:ss". */
const toHHmm = (time?: string | null) => (time ? time.slice(0, 5) : null);

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateDuration(
  checkIn: string | null,
  checkOut: string | null,
): string | null {
  if (!checkIn || !checkOut) return null;

  const diffMinutes = toMinutes(checkOut) - toMinutes(checkIn);
  if (diffMinutes <= 0) return null;

  return `${Math.floor(diffMinutes / 60)}j ${diffMinutes % 60}m`;
}

// ── Row builder ────────────────────────────────────────────────────────────────
function buildRecordRow(
  record: AttendanceResponseDTO,
): Pick<
  TimesheetRow,
  "status" | "checkIn" | "checkOut" | "duration" | "project" | "notes"
> {
  if (ABSENT_TYPES.has(record.type)) {
    return {
      status: "absent",
      checkIn: null,
      checkOut: null,
      duration: null,
      project: null,
      notes: `Pengajuan: ${record.type}`,
    };
  }

  const checkIn = toHHmm(record.clockIn);
  const checkOut = toHHmm(record.overtimeClockOut || record.clockOut);

  let notes = record.activityDescription;
  if (record.overtime) {
    notes = notes ? `${notes} (+ Lembur)` : "+ Lembur";
  }

  return {
    status: "present",
    checkIn,
    checkOut,
    duration: calculateDuration(checkIn, checkOut),
    project: record.project,
    notes,
  };
}

function buildEmptyRow(isWeekend: boolean): ReturnType<typeof buildRecordRow> {
  return {
    status: isWeekend ? "weekend" : "empty",
    checkIn: null,
    checkOut: null,
    duration: null,
    project: null,
    notes: null,
  };
}

function buildMonthRows(
  year: number,
  monthIndex: number,
  records: AttendanceResponseDTO[] = [],
): TimesheetRow[] {
  const recordsByDate = new Map(records.map((r) => [r.date, r]));

  return Array.from({ length: getDaysInMonth(year, monthIndex) }, (_, i) => {
    const day = i + 1;
    const dayOfWeek = new Date(year, monthIndex, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const date = toDateKey(year, monthIndex, day);
    const record = recordsByDate.get(date);

    return {
      date,
      day: DAY_NAMES[dayOfWeek],
      ...(record ? buildRecordRow(record) : buildEmptyRow(isWeekend)),
    };
  });
}

// ── Export helpers ─────────────────────────────────────────────────────────────
function getFilenameFromHeader(header?: string): string | null {
  if (!header) return null;
  return /filename="?([^"]+)"?/.exec(header)?.[1] ?? null;
}

function downloadBlob(data: BlobPart, filename: string) {
  const url = globalThis.URL.createObjectURL(new Blob([data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
}

// ── Small UI pieces ────────────────────────────────────────────────────────────
function Dash() {
  return <span className="text-muted-foreground/40">—</span>;
}

function TimeCell({ value }: { readonly value: string | null }) {
  if (!value) return <Dash />;

  return (
    <span className="flex items-center gap-1.5">
      <Clock className="size-3.5 text-muted-foreground" />
      {value}
    </span>
  );
}

function StatusBadge({ status }: { readonly status: AttendanceStatus }) {
  const { label, className } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

interface StatItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

function SummaryBar({ rows }: { readonly rows: TimesheetRow[] }) {
  const counts = useMemo(() => {
    const result = { workDays: 0, present: 0, absent: 0, empty: 0 };

    for (const { status } of rows) {
      if (status !== "weekend") result.workDays++;
      if (status === "present") result.present++;
      if (status === "absent") result.absent++;
      if (status === "empty") result.empty++;
    }

    return result;
  }, [rows]);

  const stats: StatItem[] = [
    {
      label: "Hari Kerja",
      value: counts.workDays,
      icon: CalendarCheck,
      color: "text-foreground",
    },
    {
      label: "Hadir",
      value: counts.present,
      icon: CalendarCheck,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Tidak Hadir",
      value: counts.absent,
      icon: CalendarX,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Belum Diisi",
      value: counts.empty,
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <Icon className={cn("size-5 shrink-0", color)} />
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold leading-tight">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimesheetTableRow({
  row,
  isToday,
}: {
  readonly row: TimesheetRow;
  readonly isToday: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors last:border-0",
        row.status === "weekend"
          ? "bg-muted/20 text-muted-foreground"
          : "hover:bg-muted/30",
        isToday && "bg-primary/5 ring-1 ring-inset ring-primary/20",
      )}
    >
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-2">
          {isToday && (
            <span className="size-1.5 shrink-0 rounded-full bg-primary" />
          )}
          <span className={cn("font-medium", isToday && "text-primary")}>
            {`${row.day}, ${formatDayMonth(row.date)}`}
          </span>
        </div>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <TimeCell value={row.checkIn} />
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <TimeCell value={row.checkOut} />
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        {row.duration ? (
          <span className="font-medium">{row.duration}</span>
        ) : (
          <Dash />
        )}
      </td>

      <td className="max-w-[180px] px-4 py-3">
        <span className="line-clamp-1">{row.project ?? <Dash />}</span>
      </td>

      <td className="max-w-[180px] px-4 py-3">
        <span className="line-clamp-1 text-muted-foreground">
          {row.notes ?? <Dash />}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-3">
        <StatusBadge status={row.status} />
      </td>
    </tr>
  );
}

function MonthNavigator({
  year,
  month,
  isCurrentMonth,
  onPrev,
  onNext,
}: {
  readonly year: number;
  readonly month: number;
  readonly isCurrentMonth: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1 rounded-lg border border-border bg-card p-1 shadow-sm sm:justify-center">
      <button
        type="button"
        onClick={onPrev}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Bulan sebelumnya"
      >
        <ChevronLeft className="size-4" />
      </button>
      <span className="flex-1 text-center text-sm font-semibold sm:min-w-[10rem]">
        {`${MONTH_NAMES[month]} ${year}`}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={isCurrentMonth}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
          isCurrentMonth
            ? "cursor-not-allowed opacity-30"
            : "hover:bg-muted hover:text-foreground",
        )}
        aria-label="Bulan berikutnya"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

function ExportButton({
  isExporting,
  onClick,
}: {
  readonly isExporting: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isExporting}
      className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {isExporting ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Menyiapkan...</span>
        </>
      ) : (
        <>
          <FileDown className="size-4" />
          <span>Export Laporan</span>
        </>
      )}
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TimesheetPage() {
  const dispatch = useAppDispatch();
  const { records } = useAppSelector((state) => state.attendance);

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [isExporting, setIsExporting] = useState(false);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  useEffect(() => {
    dispatch(
      fetchAttendances({
        start_date: toDateKey(year, month, 1),
        end_date: toDateKey(year, month, getDaysInMonth(year, month)),
        limit: RECORDS_LIMIT,
      }),
    );
  }, [year, month, dispatch]);

  const rows = useMemo(
    () => buildMonthRows(year, month, records),
    [year, month, records],
  );

  const goToPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (isCurrentMonth) return;

    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await apiV1.get("/attendances/export-timesheet", {
        params: { year, month: month + 1 },
        responseType: "blob",
      });

      const filename =
        getFilenameFromHeader(response.headers["content-disposition"]) ??
        `timesheet-${year}-${pad(month + 1)}.xlsx`;

      downloadBlob(response.data, filename);
    } catch (error: unknown) {
      console.error("Export failed:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Export",
        text: "Terjadi kesalahan saat mengunduh laporan timesheet.",
        background: "#1D1D1D",
        color: "#fff",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timesheet</h1>
          <p className="text-sm text-muted-foreground">
            Rekap kehadiran dan jam kerja Anda
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <MonthNavigator
            year={year}
            month={month}
            isCurrentMonth={isCurrentMonth}
            onPrev={goToPrev}
            onNext={goToNext}
          />
          <ExportButton isExporting={isExporting} onClick={handleExport} />
        </div>
      </div>

      {/* ── Summary ── */}
      <SummaryBar rows={rows} />

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <TimesheetTableRow
                  key={row.date}
                  row={row}
                  isToday={row.date === todayKey}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
