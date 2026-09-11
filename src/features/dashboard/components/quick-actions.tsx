import { LogIn, LogOut, FileDown, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "cn";

interface QuickActionsProps {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
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
  checkInTime,
  checkOutTime,
  onCheckIn,
  onCheckOut,
}: QuickActionsProps) {
  return (
    <>
      {/* ── Mobile: Full-width action cards (< sm) ── */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {/* Check-in card */}
        <button
          type="button"
          disabled={isCheckedIn}
          onClick={onCheckIn}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[96px]",
            isCheckedIn
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : "border-border bg-card hover:border-primary/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              isCheckedIn
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
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
          </div>
        </button>

        {/* Check-out card */}
        <button
          type="button"
          disabled={!isCheckedIn || isCheckedOut}
          onClick={onCheckOut}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow-sm transition-all duration-200 min-h-[96px]",
            isCheckedOut
              ? "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : !isCheckedIn
                ? "cursor-not-allowed border-border/50 bg-muted/30 opacity-50"
                : "border-border bg-card hover:border-primary/40 hover:shadow-md cursor-pointer active:scale-95",
          )}
        >
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              isCheckedOut
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                : !isCheckedIn
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
            {!isCheckedIn && !isCheckedOut && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Check-in dulu
              </p>
            )}
          </div>
        </button>
      </div>

      {/* ── Desktop: Compact inline buttons (sm+) ── */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Check-in */}
        <button
          type="button"
          disabled={isCheckedIn}
          onClick={onCheckIn}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
            isCheckedIn
              ? "cursor-default bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
          )}
        >
          {isCheckedIn ? <CheckCircle className="size-4" /> : <LogIn className="size-4" />}
          {isCheckedIn ? `Check-in: ${formatTime(checkInTime)}` : "Check-in Sekarang"}
        </button>

        {/* Check-out */}
        <button
          type="button"
          disabled={!isCheckedIn || isCheckedOut}
          onClick={onCheckOut}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
            isCheckedOut
              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
              : !isCheckedIn
                ? "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground"
                : "border-border bg-background hover:bg-muted text-foreground shadow-sm",
          )}
        >
          {isCheckedOut ? <CheckCircle className="size-4" /> : <LogOut className="size-4" />}
          {isCheckedOut ? `Check-out: ${formatTime(checkOutTime)}` : "Check-out"}
        </button>

        {/* Export */}
        <Link
          to="#"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
          title="Export Timesheet"
        >
          <FileDown className="size-4" />
          <span className="hidden lg:inline">Export</span>
        </Link>
      </div>
    </>
  );
}
