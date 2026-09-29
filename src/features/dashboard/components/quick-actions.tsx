import {
  LogIn,
  LogOut,
  FileDown,
  Clock,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

// ── Types ──────────────────────────────────────────────────────────────────────
interface QuickActionsProps {
  readonly isCheckedIn: boolean;
  readonly isCheckedOut: boolean;
  readonly isOnLeave: boolean;
  readonly checkInTime: Date | null;
  readonly checkOutTime: Date | null;
  readonly isOvertime: boolean;
  readonly isOvertimeReadyToClockOut?: boolean;
  readonly isOvertimeDone?: boolean;
  readonly onCheckIn: () => void;
  readonly onCheckOut: () => void;
  readonly onOvertime: () => void;
  readonly onLeave: () => void;
}

/**
 * done      → aksi sudah selesai
 * disabled  → belum/tidak bisa dilakukan
 * active    → sedang berjalan (lembur menunggu waktu minimum)
 * ready     → sedang berjalan dan sudah bisa diselesaikan
 * available → bisa dilakukan sekarang
 */
type ActionState = "done" | "disabled" | "active" | "ready" | "available";
type Accent = "primary" | "neutral" | "amber" | "blue";
type Layout = "compact" | "wide";

interface ActionView {
  readonly id: string;
  readonly state: ActionState;
  readonly accent: Accent;
  readonly layout: Layout;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly desktopLabel: string;
  readonly time?: string;
  readonly hint?: string;
  readonly onClick: () => void;
}

// ── Styles ─────────────────────────────────────────────────────────────────────
interface StateStyles {
  readonly done: string;
  readonly disabled: string;
  readonly active: string;
  readonly ready: string;
  readonly available: Record<Accent, string>;
}

function resolveStyle(
  styles: StateStyles,
  state: ActionState,
  accent: Accent,
): string {
  return state === "available" ? styles.available[accent] : styles[state];
}

const CARD_AVAILABLE_BASE =
  "border-border bg-card hover:shadow-md cursor-pointer active:scale-95";
const CARD_AVAILABLE_PRIMARY = `${CARD_AVAILABLE_BASE} hover:border-primary/40`;
const CARD_AVAILABLE_AMBER = `${CARD_AVAILABLE_BASE} hover:border-amber-500/40`;
const CARD_AVAILABLE_BLUE = `${CARD_AVAILABLE_BASE} hover:border-blue-500/40`;

const CARD_STYLES: StateStyles = {
  done: "cursor-default border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20",
  disabled: "cursor-not-allowed border-border/50 bg-muted/30 opacity-50",
  active:
    "cursor-default border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20",
  ready: CARD_AVAILABLE_AMBER,
  available: {
    primary: CARD_AVAILABLE_PRIMARY,
    neutral: CARD_AVAILABLE_PRIMARY,
    amber: CARD_AVAILABLE_AMBER,
    blue: CARD_AVAILABLE_BLUE,
  },
};

const AMBER_ICON_BOX =
  "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400";

const ICON_BOX_STYLES: StateStyles = {
  done: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400",
  disabled: "bg-muted text-muted-foreground",
  active: AMBER_ICON_BOX,
  ready: AMBER_ICON_BOX,
  available: {
    primary: "bg-primary/10 text-primary",
    neutral: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-500",
    blue: "bg-blue-500/10 text-blue-500",
  },
};

const TITLE_STYLES: Partial<Record<ActionState, string>> = {
  done: "text-emerald-700 dark:text-emerald-400",
  active: "text-amber-700 dark:text-amber-400",
  ready: "text-amber-700 dark:text-amber-400",
};

const BUTTON_AVAILABLE_BASE = "border-border bg-background shadow-sm";
const BUTTON_AVAILABLE_AMBER = `${BUTTON_AVAILABLE_BASE} hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:text-amber-400`;
const BUTTON_AVAILABLE_NEUTRAL = `${BUTTON_AVAILABLE_BASE} text-foreground hover:bg-muted`;

const BUTTON_STYLES: StateStyles = {
  done: "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  disabled:
    "cursor-not-allowed border-border/50 bg-muted/50 text-muted-foreground",
  active:
    "cursor-default border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  ready: `${BUTTON_AVAILABLE_AMBER} border-amber-200`,
  available: {
    primary:
      "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
    neutral: BUTTON_AVAILABLE_NEUTRAL,
    amber: BUTTON_AVAILABLE_AMBER,
    blue: `${BUTTON_AVAILABLE_BASE} hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400`,
  },
};

const COMPACT_CARD_BASE =
  "flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-xl border p-4 shadow-sm transition-all duration-200";
const WIDE_CARD_BASE =
  "col-span-2 flex min-h-[72px] items-center justify-center gap-3 rounded-xl border p-4 shadow-sm transition-all duration-200";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTime(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const isEnabled = (state: ActionState) =>
  state === "available" || state === "ready";

// ── View builders (satu fungsi per aksi, tanpa nested ternary) ─────────────────
function getCheckInView(p: QuickActionsProps): ActionView {
  let state: ActionState = "available";
  if (p.isCheckedIn) state = "done";
  else if (p.isOnLeave) state = "disabled";

  let desktopLabel = "Check-in Sekarang";
  if (state === "done") desktopLabel = `Check-in: ${formatTime(p.checkInTime)}`;
  else if (state === "disabled") desktopLabel = "Izin/Cuti Aktif";

  return {
    id: "check-in",
    state,
    accent: "primary",
    layout: "compact",
    icon: LogIn,
    label: state === "done" ? "Sudah Check-in" : "Check-in",
    desktopLabel,
    time: state === "done" ? formatTime(p.checkInTime) : undefined,
    hint: state === "disabled" ? "Hari ini izin/cuti" : undefined,
    onClick: p.onCheckIn,
  };
}

function getCheckOutView(p: QuickActionsProps): ActionView {
  let state: ActionState = "available";
  if (p.isCheckedOut) state = "done";
  else if (!p.isCheckedIn || p.isOnLeave) state = "disabled";

  let hint: string | undefined;
  if (state === "disabled") {
    hint = p.isOnLeave ? "Hari ini izin/cuti" : "Check-in dulu";
  }

  return {
    id: "check-out",
    state,
    accent: "neutral",
    layout: "compact",
    icon: LogOut,
    label: state === "done" ? "Sudah Check-out" : "Check-out",
    desktopLabel:
      state === "done"
        ? `Check-out: ${formatTime(p.checkOutTime)}`
        : "Check-out",
    time: state === "done" ? formatTime(p.checkOutTime) : undefined,
    hint,
    onClick: p.onCheckOut,
  };
}

function getOvertimeState(p: QuickActionsProps): ActionState {
  if (p.isOvertimeDone) return "done";
  if (p.isOnLeave || !p.isCheckedOut) return "disabled";
  if (p.isOvertime) return p.isOvertimeReadyToClockOut ? "ready" : "active";
  return "available";
}

const OVERTIME_TEXT: Record<
  ActionState,
  { label: string; desktopLabel: string; hint: string }
> = {
  done: {
    label: "Lembur Selesai",
    desktopLabel: "Lembur Selesai",
    hint: "Terima kasih sudah lembur hari ini",
  },
  ready: {
    label: "Selesai Lembur",
    desktopLabel: "Selesai Lembur",
    hint: "Klik untuk mengakhiri lembur",
  },
  active: {
    label: "Lembur Aktif",
    desktopLabel: "Lembur Aktif",
    hint: "Menunggu waktu minimum...",
  },
  disabled: {
    label: "Mulai Lembur",
    desktopLabel: "Lembur",
    hint: "Check-out dulu",
  },
  available: {
    label: "Mulai Lembur",
    desktopLabel: "Lembur",
    hint: "Catat waktu lembur Anda",
  },
};

function getOvertimeView(p: QuickActionsProps): ActionView {
  const state = getOvertimeState(p);
  const { label, desktopLabel, hint } = OVERTIME_TEXT[state];

  return {
    id: "overtime",
    state,
    accent: "amber",
    layout: "wide",
    icon: Clock,
    label,
    desktopLabel,
    hint:
      state === "disabled" && p.isOnLeave
        ? "Tidak bisa lembur karena izin/cuti"
        : hint,
    onClick: p.onOvertime,
  };
}

function getLeaveView(p: QuickActionsProps): ActionView {
  let state: ActionState = "available";
  if (p.isOnLeave) state = "done";
  else if (p.isCheckedIn) state = "disabled";

  const hints: Record<"done" | "disabled" | "available", string> = {
    done: "Pengajuan izin/cuti hari ini sudah tercatat",
    disabled: "Tidak bisa izin karena sudah hadir",
    available: "Ajukan absen tidak hadir",
  };

  return {
    id: "leave",
    state,
    accent: "blue",
    layout: "wide",
    icon: FileDown,
    label: state === "done" ? "Izin / Cuti Terkirim" : "Izin / Cuti",
    desktopLabel: state === "done" ? "Izin/Cuti Terkirim" : "Izin / Cuti",
    hint: hints[state as keyof typeof hints],
    onClick: p.onLeave,
  };
}

// ── Presentational components ──────────────────────────────────────────────────
function ActionCard({ view }: { readonly view: ActionView }) {
  const { state, accent, layout, label, time, hint } = view;
  const isCompact = layout === "compact";
  const Icon = state === "done" ? CheckCircle : view.icon;

  return (
    <button
      type="button"
      disabled={!isEnabled(state)}
      onClick={view.onClick}
      className={cn(
        isCompact ? COMPACT_CARD_BASE : WIDE_CARD_BASE,
        resolveStyle(CARD_STYLES, state, accent),
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl",
          isCompact ? "size-11" : "size-10",
          resolveStyle(ICON_BOX_STYLES, state, accent),
        )}
      >
        <Icon className={isCompact ? "size-6" : "size-5"} />
      </div>

      <div className={isCompact ? "text-center" : "flex-1 text-left"}>
        <p
          className={cn(
            "text-sm font-semibold leading-tight",
            TITLE_STYLES[state] ?? "text-foreground",
          )}
        >
          {label}
        </p>
        {time && (
          <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <Clock className="size-3" />
            {time}
          </p>
        )}
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
    </button>
  );
}

function ActionButton({ view }: { readonly view: ActionView }) {
  const { state, accent, desktopLabel } = view;
  const Icon = state === "done" ? CheckCircle : view.icon;

  return (
    <button
      type="button"
      disabled={!isEnabled(state)}
      onClick={view.onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
        resolveStyle(BUTTON_STYLES, state, accent),
      )}
    >
      <Icon className="size-4" />
      {desktopLabel}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function QuickActions(props: QuickActionsProps) {
  const views = [
    getCheckInView(props),
    getCheckOutView(props),
    getOvertimeView(props),
    getLeaveView(props),
  ];

  return (
    <>
      {/* ── Mobile: action cards (< sm) ── */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {views.map((view) => (
          <ActionCard key={view.id} view={view} />
        ))}
      </div>

      {/* ── Desktop: compact inline buttons (sm+) ── */}
      <div className="hidden items-center gap-2 sm:flex">
        {views.map((view) => (
          <ActionButton key={view.id} view={view} />
        ))}
      </div>
    </>
  );
}
