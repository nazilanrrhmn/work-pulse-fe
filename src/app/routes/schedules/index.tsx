import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-store";
import { fetchAttendances, type AttendanceResponseDTO } from "@/stores/attendance/async";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarX,
  Clock,
  AlertCircle,
  FileDown,
} from "lucide-react";
import { cn } from "cn";

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

// ── Mock data generator ────────────────────────────────────────────────────────
function generateMonthData(year: number, month: number, records: AttendanceResponseDTO[] = []): TimesheetRow[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isToday = isCurrentMonth && day === today.getDate();
    const isFuture = date > today && !isToday;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = records.find(r => r.date === dateStr);

    let status: AttendanceStatus = "empty";
    let checkIn: string | null = null;
    let checkOut: string | null = null;
    let duration: string | null = null;
    let project: string | null = null;
    let notes: string | null = null;

    if (record) {
      if (["CUTI", "IZIN", "SAKIT"].includes(record.type)) {
        status = "absent";
        notes = `Pengajuan: ${record.type}`;
      } else {
        status = "present";
        checkIn = record.clockIn ? record.clockIn.slice(0, 5) : null;
        checkOut = record.clockOut ? record.clockOut.slice(0, 5) : null;
        project = record.project;
        notes = record.activityDescription;
        if (record.isOvertime) {
          notes = notes ? `${notes} (+ Lembur)` : "+ Lembur";
        }
        
        // Calculate duration if possible
        if (checkIn && checkOut) {
          const start = new Date(`1970-01-01T${checkIn}:00`);
          const end = new Date(`1970-01-01T${checkOut}:00`);
          const diffMs = end.getTime() - start.getTime();
          if (diffMs > 0) {
            const hrs = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            duration = `${hrs}j ${mins}m`;
          }
        }
      }
    } else {
      if (isWeekend) status = "weekend";
      else if (isFuture) status = "empty";
      else status = "empty"; // Could be marked absent, but empty is safer if they forgot to clock in
    }

    return {
      date: dateStr,
      day: dayNames[dayOfWeek],
      checkIn,
      checkOut,
      duration,
      project,
      notes,
      status,
    };
  });
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AttendanceStatus }) {
  const config: Record<AttendanceStatus, { label: string; className: string }> =
    {
      present: {
        label: "Hadir",
        className:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      },
      absent: {
        label: "Tidak Hadir",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
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
  const { label, className } = config[status];
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

// ── Summary Stats ──────────────────────────────────────────────────────────────
function SummaryBar({ rows }: { rows: TimesheetRow[] }) {
  const workDays = rows.filter((r) => r.status !== "weekend").length;
  const present = rows.filter((r) => r.status === "present").length;
  const absent = rows.filter((r) => r.status === "absent").length;
  const empty = rows.filter((r) => r.status === "empty").length;

  const stats = [
    {
      label: "Hari Kerja",
      value: workDays,
      icon: CalendarCheck,
      color: "text-foreground",
    },
    {
      label: "Hadir",
      value: present,
      icon: CalendarCheck,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Tidak Hadir",
      value: absent,
      icon: CalendarX,
      color: "text-red-600 dark:text-red-400",
    },
    {
      label: "Belum Diisi",
      value: empty,
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

// ── Main Page ──────────────────────────────────────────────────────────────────
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
];

export default function TimesheetPage() {
  const dispatch = useAppDispatch();
  const { records, recordsLoading } = useAppSelector((state) => state.attendance);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    
    dispatch(fetchAttendances({ start_date: startDate, end_date: endDate, limit: 100 }));
  }, [year, month, dispatch]);

  const rows = useMemo(() => generateMonthData(year, month, records), [year, month, records]);

  const goToPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };

  const goToNext = () => {
    const isNextFuture =
      year > today.getFullYear() ||
      (year === today.getFullYear() && month >= today.getMonth());
    if (isNextFuture) return;
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

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

        <div className="flex w-full flex-col sm:w-auto sm:flex-row sm:items-center gap-3">
          {/* Month Navigator */}
          <div className="flex justify-between sm:justify-center items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm">
            <button
              onClick={goToPrev}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="flex-1 text-center text-sm font-semibold sm:min-w-[10rem]">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={goToNext}
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

          {/* Export Button */}
          <button
            type="button"
            onClick={() => {
              // TODO: Integrate with backend export endpoint
              console.log("Export triggered for", year, month + 1);
            }}
            className="inline-flex h-10 w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted shadow-sm"
          >
            <FileDown className="size-4" />
            <span>Export Laporan</span>
          </button>
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
                {[
                  "Tanggal",
                  "Check-in",
                  "Check-out",
                  "Durasi",
                  "Project",
                  "Keterangan",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isToday =
                  isCurrentMonth &&
                  row.date ===
                    `${year}-${String(month + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

                return (
                  <tr
                    key={row.date}
                    className={cn(
                      "border-b border-border/60 transition-colors last:border-0",
                      row.status === "weekend"
                        ? "bg-muted/20 text-muted-foreground"
                        : "hover:bg-muted/30",
                      isToday &&
                        "bg-primary/5 ring-1 ring-inset ring-primary/20",
                    )}
                  >
                    {/* Tanggal */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isToday && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            isToday && "text-primary",
                          )}
                        >
                          {row.day},{" "}
                          {new Date(row.date + "T00:00:00").toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Check-in */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.checkIn ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {row.checkIn}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Check-out */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {row.checkOut ? (
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {row.checkOut}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Durasi */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={
                          row.duration
                            ? "font-medium"
                            : "text-muted-foreground/40"
                        }
                      >
                        {row.duration ?? "—"}
                      </span>
                    </td>

                    {/* Project */}
                    <td className="max-w-[180px] px-4 py-3">
                      <span className="line-clamp-1">
                        {row.project ?? (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="max-w-[180px] px-4 py-3">
                      <span className="line-clamp-1 text-muted-foreground">
                        {row.notes ?? (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
