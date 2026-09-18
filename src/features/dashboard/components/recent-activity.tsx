import { Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "cn";
import type { AttendanceResponseDTO } from "@/stores/attendance/async";

interface RecentActivityProps {
  data?: AttendanceResponseDTO[];
  loading?: boolean;
}

export default function RecentActivity({ data = [], loading = false }: RecentActivityProps) {
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
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">Belum ada aktivitas terbaru</div>
        ) : (
          data.map((entry) => {
            const dateObj = new Date(entry.date);
            const dateFmt = dateObj.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });
            const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
            const isPresent = entry.type === "PRESENT";
            const isLeave = ["CUTI", "IZIN", "SAKIT"].includes(entry.type);

            return (
              <div
                key={entry.uuid}
                className="flex min-w-0 items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-5 sm:py-3.5"
              >
                {/* Date badge */}
                <div className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-muted px-1.5 py-1.5 text-center sm:w-14">
                  <span className="text-[10px] font-semibold leading-none text-muted-foreground">
                    {dateFmt.split(" ")[1]} {dateFmt.split(" ")[2]}
                  </span>
                  <span className="mt-0.5 text-base font-bold leading-none text-foreground sm:text-lg">
                    {dateFmt.split(" ")[0]}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-none text-muted-foreground">
                    {dayName}
                  </span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {isPresent
                      ? entry.activityDescription || entry.project || "Bekerja"
                      : isLeave
                        ? `Pengajuan: ${entry.type}`
                        : entry.type}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {isPresent && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3 shrink-0" />
                        {entry.clockIn ? entry.clockIn.slice(0, 5) : "--:--"}–
                        {entry.clockOut ? entry.clockOut.slice(0, 5) : "--:--"}
                      </span>
                    )}
                    {entry.isOvertime && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        + Lembur
                      </span>
                    )}
                  </div>
                </div>

                {/* Status pill */}
                <div
                  className={cn(
                    "hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:block",
                    entry.isOvertime
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : isLeave
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
                  )}
                >
                  {isLeave ? entry.type : isPresent ? "Hadir" : entry.type}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
