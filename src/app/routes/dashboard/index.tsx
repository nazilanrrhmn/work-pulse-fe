import type { CheckoutData } from "@/features/dashboard/components/checkout-modal";
import CheckoutModal from "@/features/dashboard/components/checkout-modal";
import type { LeaveData } from "@/features/dashboard/components/leave-modal";
import LeaveModal from "@/features/dashboard/components/leave-modal";
import MiniCalendar from "@/features/dashboard/components/mini-calendar";
import type { OvertimeFormValues } from "@/features/dashboard/components/overtime-modal";
import OvertimeModal from "@/features/dashboard/components/overtime-modal";
import QuickActions from "@/features/dashboard/components/quick-actions";
import RecentActivity from "@/features/dashboard/components/recent-activity";
import StatCard from "@/features/dashboard/components/stat-card";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";
import { useHolidays } from "@/features/dashboard/hooks/use-holidays";
import { useAppDispatch, useAppSelector } from "@/hooks/use-store";
import {
  checkInPresence,
  clockInOvertime,
  clockOutOvertime,
  clockOutPresence,
  fetchAttendances,
  fetchTodayAttendance,
  submitLeave,
} from "@/stores/attendance/async";
import { setLocalCheckIn } from "@/stores/attendance/slice";
import { getDashboardSummary } from "@/stores/dashboard/async";
import {
  AlertCircle,
  CalendarCheck,
  CalendarX,
  Clock,
  Timer,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";

const RECENT_LIMIT = 5;
const CHECK_INTERVAL_MS = 60_000;
const HOUR_MS = 60 * 60 * 1000;
const OVERTIME_THRESHOLD_WORKDAY_HOURS = 3;
const OVERTIME_THRESHOLD_OFFDAY_HOURS = 8;
const SWAL_THEME = { background: "#1D1D1D", color: "#fff" } as const;
const SKELETON_KEYS = ["a", "b", "c", "d", "e"] as const;

function notifySuccess(text: string, title = "Berhasil") {
  Swal.fire({
    icon: "success",
    title,
    text,
    ...SWAL_THEME,
    timer: 1500,
    showConfirmButton: false,
  });
}

function notifyError(err: unknown, fallback: string) {
  Swal.fire({
    icon: "error",
    title: "Oops..",
    text: typeof err === "string" && err ? err : fallback,
    ...SWAL_THEME,
  });
}

function StatCardSkeleton() {
  return (
    <div className="flex min-w-0 animate-pulse flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <div className="size-9 shrink-0 rounded-lg bg-muted sm:size-12" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-6 w-12 rounded bg-muted" />
        <div className="h-2.5 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.entities);
  const { summary, isLoading, error } = useDashboardSummary();

  const dispatch = useAppDispatch();
  const {
    isCheckedIn,
    isCheckedOut,
    isOnLeave,
    checkInTime,
    records,
    recordsLoading,
    isOvertime,
    overtimeClockInTime,
  } = useAppSelector((state) => state.attendance);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [isOvertimeReadyToClockOut, setIsOvertimeReadyToClockOut] =
    useState(false);

  const currentYear = new Date().getFullYear();
  const { nationalHolidaySet, jointLeaveSet } = useHolidays(currentYear);

  useEffect(() => {
    if (!isOvertime || !overtimeClockInTime) {
      setIsOvertimeReadyToClockOut(false);
      return;
    }

    const clockInDate = new Date(overtimeClockInTime);
    const clockInMs = clockInDate.valueOf();
    const day = clockInDate.getDay();
    const isWeekend = day === 0 || day === 6;
    const dateStr = clockInDate.toISOString().split("T")[0];
    const isHoliday =
      nationalHolidaySet.has(dateStr) || jointLeaveSet.has(dateStr);

    const thresholdHours =
      isWeekend || isHoliday
        ? OVERTIME_THRESHOLD_OFFDAY_HOURS
        : OVERTIME_THRESHOLD_WORKDAY_HOURS;
    const thresholdMs = thresholdHours * HOUR_MS;

    const checkThreshold = () => {
      setIsOvertimeReadyToClockOut(Date.now() - clockInMs >= thresholdMs);
    };

    checkThreshold();
    const interval = setInterval(checkThreshold, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOvertime, overtimeClockInTime, nationalHolidaySet, jointLeaveSet]);

  const refreshData = useCallback(() => {
    dispatch(fetchAttendances({ limit: RECENT_LIMIT }));
    dispatch(fetchTodayAttendance());
    dispatch(getDashboardSummary());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAttendances({ limit: RECENT_LIMIT }));
    dispatch(fetchTodayAttendance());
  }, [dispatch]);

  const handleCheckIn = useCallback(() => {
    dispatch(setLocalCheckIn(new Date().toISOString()));

    dispatch(checkInPresence())
      .unwrap()
      .then(() => {
        refreshData();
        notifySuccess("Waktu check-in Anda telah dicatat", "Berhasil Check-In");
      })
      .catch((err) => notifyError(err, "Gagal mencatat check-in"));
  }, [dispatch, refreshData]);

  const handleCheckOutClick = useCallback(() => {
    setShowCheckoutModal(true);
  }, []);

  const handleOvertimeClick = useCallback(() => {
    if (isOvertimeReadyToClockOut) {
      setShowOvertimeModal(true);
      return;
    }

    dispatch(clockInOvertime())
      .unwrap()
      .then(() => {
        refreshData();
        notifySuccess("Lembur berhasil dimulai");
      })
      .catch((err) => notifyError(err, "Gagal memulai lembur"));
  }, [dispatch, refreshData, isOvertimeReadyToClockOut]);

  const handleOvertimeSubmit = useCallback(
    (data: OvertimeFormValues) => {
      setShowOvertimeModal(false);

      dispatch(clockOutOvertime(data))
        .unwrap()
        .then(() => {
          refreshData();
          notifySuccess("Lembur berhasil diselesaikan");
        })
        .catch((err) => notifyError(err, "Gagal menyelesaikan lembur"));
    },
    [dispatch, refreshData],
  );

  const handleCheckoutSubmit = useCallback(
    (data: CheckoutData) => {
      setShowCheckoutModal(false);

      if (!user?.uuid || !checkInTime) return;

      dispatch(
        clockOutPresence({
          projectName: data.projectName,
          activityDescription: data.activityDescription,
        }),
      )
        .unwrap()
        .then(() => {
          refreshData();
          notifySuccess("Data presensi berhasil dikirim");
        })
        .catch((err) => notifyError(err, "Gagal mengirim data presensi"));
    },
    [dispatch, refreshData, user?.uuid, checkInTime],
  );

  const handleLeaveClick = useCallback(() => {
    setShowLeaveModal(true);
  }, []);

  const handleLeaveSubmit = useCallback(
    (data: LeaveData) => {
      setShowLeaveModal(false);

      dispatch(
        submitLeave({
          date: data.date,
          type: data.type,
          projectName: data.projectName,
        }),
      )
        .unwrap()
        .then(() => {
          refreshData();
          notifySuccess("Pengajuan izin berhasil dikirim");
        })
        .catch((err) => notifyError(err, "Gagal mengirim pengajuan"));
    },
    [dispatch, refreshData],
  );

  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const userLabel = user?.name ?? user?.npp;
  const missingTotal = summary?.missingAttendanceTotal ?? 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {`Halo, `}
            <span className="font-semibold text-foreground">{userLabel}</span>
            {` ! Berikut ringkasan timesheet Anda bulan ini.`}
          </p>
        </div>

        <QuickActions
          isCheckedIn={isCheckedIn}
          isCheckedOut={isCheckedOut}
          isOnLeave={isOnLeave}
          checkInTime={checkInTime ? new Date(checkInTime) : null}
          checkOutTime={isCheckedOut ? new Date() : null}
          isOvertime={isOvertime && !!overtimeClockInTime}
          isOvertimeReadyToClockOut={isOvertimeReadyToClockOut}
          isOvertimeDone={isOvertime && !overtimeClockInTime}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOutClick}
          onOvertime={handleOvertimeClick}
          onLeave={handleLeaveClick}
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>Gagal memuat data ringkasan: {error}</span>
        </div>
      )}

      {/* Stat cards — skeleton saat loading, data real setelahnya */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          SKELETON_KEYS.map((key) => <StatCardSkeleton key={key} />)
        ) : (
          <>
            <StatCard
              title="Total Hari Kerja"
              value={summary?.workDayTotal ?? "–"}
              subtitle={currentMonth}
              icon={CalendarCheck}
              variant="default"
            />
            <StatCard
              title="Sudah Diisi"
              value={summary?.clockInTotal ?? "–"}
              subtitle={`dari ${summary?.workDayTotal ?? "–"} hari`}
              icon={CalendarCheck}
              variant="success"
            />
            <StatCard
              title="Belum Diisi"
              value={summary?.missingAttendanceTotal ?? "–"}
              subtitle="hari terlewat"
              icon={CalendarX}
              variant={missingTotal > 0 ? "danger" : "default"}
            />
            <StatCard
              title="Total Hari Lembur"
              value={summary?.totalOvertime ?? "–"}
              subtitle="bulan ini"
              icon={Clock}
              variant="default"
            />
            <StatCard
              title="Total Lembur"
              value={summary?.formattedTotalOvertimeHours ?? "–"}
              subtitle={`${summary?.totalOvertimeMinutes ?? 0} menit`}
              icon={Timer}
              variant="warning"
            />
          </>
        )}
      </div>

      {/* Main grid: Calendar | Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-1">
          <MiniCalendar />
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <RecentActivity data={records} loading={recordsLoading} />
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal
        open={showCheckoutModal}
        onOpenChange={setShowCheckoutModal}
        onSubmit={handleCheckoutSubmit}
      />
      <LeaveModal
        open={showLeaveModal}
        onOpenChange={setShowLeaveModal}
        onSubmit={handleLeaveSubmit}
      />
      <OvertimeModal
        open={showOvertimeModal}
        onOpenChange={setShowOvertimeModal}
        onSubmit={handleOvertimeSubmit}
      />
    </div>
  );
}
