import { LogIn, LogOut, FileDown, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "cn";

interface QuickActionsProps {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isOnLeave: boolean;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  isOvertime: boolean;
  isOvertimeReadyToClockOut?: boolean;
  isOvertimeDone?: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onOvertime: () => void;
  onLeave: () => void;
}

function formatTime(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QuickActions({
  isCheckedIn,
  isCheckedOut,
  isOnLeave,
  checkInTime,
  checkOutTime,
  isOvertime,
  isOvertimeReadyToClockOut,
  isOvertimeDone,
  onCheckIn,
  onCheckOut,
  onOvertime,
  onLeave,
}: QuickActionsProps) {
  return (
    <>
      {/* ── Mobile: Full-width action cards (< sm) ── */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {/* Check-in card */}
        <button
          type="button"
          disabled={isCheckedIn || isOnLeave}
          onClick={onCheckIn}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[96px]",
            isCheckedIn
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : isOnLeave
                ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                : "border-border bg-card hover:border-primary/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              isCheckedIn
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                : isOnLeave
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
            )}
          >
            {isCheckedIn
              ? <CheckCircle className="size-6" />
              : <LogIn className="size-6" />
            }
          </div>
          <div className="text-center">
            <p className={cn(
              "text-sm font-semibold leading-tight",
              isCheckedIn ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
            )}>
              {isCheckedIn ? "Sudah Check-in" : "Check-in"}
            </p>
            {isCheckedIn && (
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Clock className="size-3" />
                {formatTime(checkInTime)}
              </p>
            )}
            {isOnLeave && !isCheckedIn && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hari ini izin/cuti
              </p>
            )}
          </div>
        </button>

        {/* Check-out card */}
        <button
          type="button"
          disabled={!isCheckedIn || isCheckedOut || isOnLeave}
          onClick={onCheckOut}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[96px]",
            isCheckedOut
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : (!isCheckedIn || isOnLeave)
                ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                : "border-border bg-card hover:border-primary/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              isCheckedOut
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                : (!isCheckedIn || isOnLeave)
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
            )}
          >
            {isCheckedOut
              ? <CheckCircle className="size-6" />
              : <LogOut className="size-6" />
            }
          </div>
          <div className="text-center">
            <p className={cn(
              "text-sm font-semibold leading-tight",
              isCheckedOut ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
            )}>
              {isCheckedOut ? "Sudah Check-out" : "Check-out"}
            </p>
            {isCheckedOut && (
              <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Clock className="size-3" />
                {formatTime(checkOutTime)}
              </p>
            )}
            {!isCheckedIn && !isCheckedOut && !isOnLeave && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Check-in dulu
              </p>
            )}
            {isOnLeave && !isCheckedOut && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Hari ini izin/cuti
              </p>
            )}
          </div>
        </button>

        {/* Overtime card */}
        <button
          type="button"
          disabled={!isCheckedOut || (isOvertime && !isOvertimeReadyToClockOut) || isOvertimeDone || isOnLeave}
          onClick={onOvertime}
          className={cn(
            "col-span-2 flex items-center justify-center gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[72px]",
            isOvertimeDone
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : isOnLeave
                ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                : isOvertime
                  ? (isOvertimeReadyToClockOut 
                    ? "border-border bg-card hover:border-amber-500/40 hover:shadow-md cursor-pointer active:scale-95" 
                    : "cursor-default border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20")
                  : (!isCheckedOut)
                    ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                    : "border-border bg-card hover:border-amber-500/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              isOvertimeDone
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                : isOnLeave
                  ? "bg-muted text-muted-foreground"
                  : isOvertime
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                    : (!isCheckedOut)
                      ? "bg-muted text-muted-foreground"
                      : "bg-amber-500/10 text-amber-500",
            )}
          >
            {isOvertimeDone ? <CheckCircle className="size-5" /> : (isOvertime && !isOvertimeReadyToClockOut) ? <Clock className="size-5" /> : <Clock className="size-5" />}
          </div>
          <div className="text-left flex-1">
            <p className={cn(
              "text-sm font-semibold leading-tight",
              isOvertimeDone ? "text-emerald-700 dark:text-emerald-400" : isOvertime ? "text-amber-700 dark:text-amber-400" : "text-foreground",
            )}>
              {isOvertimeDone 
                ? "Lembur Selesai" 
                : isOvertime 
                  ? (isOvertimeReadyToClockOut ? "Selesai Lembur" : "Lembur Aktif") 
                  : "Mulai Lembur"}
            </p>
            
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isOnLeave
                ? "Tidak bisa lembur karena izin/cuti"
                : isOvertimeDone
                  ? "Terima kasih sudah lembur hari ini"
                  : isOvertime
                    ? (isOvertimeReadyToClockOut ? "Klik untuk mengakhiri lembur" : "Menunggu waktu minimum...")
                    : (isCheckedOut ? "Catat waktu lembur Anda" : "Check-out dulu")}
            </p>
          </div>
        </button>

        {/* Leave card */}
        <button
          type="button"
          disabled={isCheckedIn || isOnLeave}
          onClick={onLeave}
          className={cn(
            "col-span-2 flex items-center justify-center gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[72px]",
            isOnLeave
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : isCheckedIn
                ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                : "border-border bg-card hover:border-blue-500/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              isOnLeave
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                : isCheckedIn
                  ? "bg-muted text-muted-foreground"
                  : "bg-blue-500/10 text-blue-500",
            )}
          >
            {isOnLeave ? <CheckCircle className="size-5" /> : <FileDown className="size-5" />}
          </div>
          <div className="text-left flex-1">
            <p className={cn(
              "text-sm font-semibold leading-tight",
              isOnLeave ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
            )}>
              {isOnLeave ? "Izin / Cuti Terkirim" : "Izin / Cuti"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isOnLeave
                ? "Pengajuan izin/cuti hari ini sudah tercatat"
                : isCheckedIn
                  ? "Tidak bisa izin karena sudah hadir"
                  : "Ajukan absen tidak hadir"}
            </p>
          </div>
        </button>
      </div>

      {/* ── Desktop: Compact inline buttons (sm+) ── */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Check-in */}
        <button
          type="button"
          disabled={isCheckedIn || isOnLeave}
          onClick={onCheckIn}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            isCheckedIn
              ? "cursor-default bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : isOnLeave
                ? "cursor-not-allowed bg-muted/50 text-muted-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
          )}
        >
          {isCheckedIn ? <CheckCircle className="size-4" /> : <LogIn className="size-4" />}
          {isCheckedIn ? `Check-in: ${formatTime(checkInTime)}` : isOnLeave ? "Izin/Cuti Aktif" : "Check-in Sekarang"}
        </button>

        {/* Check-out */}
        <button
          type="button"
          disabled={!isCheckedIn || isCheckedOut || isOnLeave}
          onClick={onCheckOut}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            isCheckedOut
              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : (!isCheckedIn || isOnLeave)
                ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground"
                : "border-border bg-background hover:bg-muted text-foreground shadow-sm",
          )}
        >
          {isCheckedOut ? <CheckCircle className="size-4" /> : <LogOut className="size-4" />}
          {isCheckedOut ? `Check-out: ${formatTime(checkOutTime)}` : "Check-out"}
        </button>

        {/* Overtime */}
        <button
          type="button"
          disabled={!isCheckedOut || (isOvertime && !isOvertimeReadyToClockOut) || isOvertimeDone || isOnLeave}
          onClick={onOvertime}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            isOvertimeDone
              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : isOnLeave
                ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground"
                : isOvertime
                  ? (isOvertimeReadyToClockOut
                    ? "border-amber-200 bg-background hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 shadow-sm"
                    : "cursor-default border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300")
                  : (!isCheckedOut)
                    ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground"
                    : "border-border bg-background hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 shadow-sm",
          )}
        >
          {isOvertimeDone ? <CheckCircle className="size-4" /> : <Clock className="size-4" />}
          {isOvertimeDone 
            ? "Lembur Selesai" 
            : isOvertime 
              ? (isOvertimeReadyToClockOut ? "Selesai Lembur" : "Lembur Aktif") 
              : "Lembur"}
        </button>

        {/* Leave */}
        <button
          type="button"
          disabled={isCheckedIn || isOnLeave}
          onClick={onLeave}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            isOnLeave
              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : isCheckedIn
                ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground"
                : "border-border bg-background hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 shadow-sm",
          )}
        >
          {isOnLeave ? <CheckCircle className="size-4" /> : <FileDown className="size-4" />}
          {isOnLeave ? "Izin/Cuti Terkirim" : "Izin / Cuti"}
        </button>
      </div>
    </>
  );
}
