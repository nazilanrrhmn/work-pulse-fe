import { useState, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/use-store";
import {
  CalendarCheck,
  CalendarX,
  Clock,
  Timer,
  AlertCircle,
} from "lucide-react";
import StatCard from "@/features/dashboard/components/stat-card";
import MiniCalendar from "@/features/dashboard/components/mini-calendar";
import RecentActivity from "@/features/dashboard/components/recent-activity";
import QuickActions from "@/features/dashboard/components/quick-actions";
import CheckoutModal, {
  type CheckoutData,
} from "@/features/dashboard/components/checkout-modal";
import LeaveModal, {
  type LeaveData,
} from "@/features/dashboard/components/leave-modal";
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";
import { setLocalCheckIn } from "@/stores/attendance/slice";
import { checkInPresence, clockOutPresence, submitLeave, fetchAttendances } from "@/stores/attendance/async";
import Swal from "sweetalert2";
import { useEffect } from "react";

// ── Skeleton placeholder untuk StatCard saat loading ──
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

  // ── Attendance state ──
  const dispatch = useAppDispatch();
  const { isCheckedIn, isCheckedOut, checkInTime, loading, records, recordsLoading } = useAppSelector(
    (state) => state.attendance,
  );
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    dispatch(fetchAttendances({ limit: 5 }));
  }, [dispatch]);

  const handleCheckIn = useCallback(() => {
    const now = new Date().toISOString();
    dispatch(setLocalCheckIn(now));

    dispatch(checkInPresence())
      .unwrap()
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Berhasil Check-In",
          text: "Waktu check-in Anda telah dicatat",
          background: "#1D1D1D",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Oops..",
          text: err || "Gagal mencatat check-in",
          background: "#1D1D1D",
          color: "#fff",
        });
      });
  }, [dispatch, user?.uuid]);

  const handleCheckOutClick = useCallback(() => {
    setShowCheckoutModal(true);
  }, []);

  const handleOvertime = useCallback(() => {
    setIsOvertime(true);
  }, []);

  const handleCheckoutSubmit = useCallback(
    (data: CheckoutData) => {
      setShowCheckoutModal(false);

      if (!user?.uuid || !checkInTime) return;

      const dateObj = new Date(checkInTime);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      const payload = {
        projectName: data.projectName,
        activityDescription: data.activityDescription,
      };

      dispatch(clockOutPresence(payload))
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Data presensi berhasil dikirim",
            background: "#1D1D1D",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Oops..",
            text: err || "Gagal mengirim data presensi",
            background: "#1D1D1D",
            color: "#fff",
          });
        });
    },
    [dispatch, user?.uuid, checkInTime, isOvertime],
  );

  const handleLeaveClick = useCallback(() => {
    setShowLeaveModal(true);
  }, []);

  const handleLeaveSubmit = useCallback(
    (data: LeaveData) => {
      setShowLeaveModal(false);

      const payload = {
        date: data.date,
        type: data.type,
        projectName: data.projectName,
      };

      dispatch(submitLeave(payload))
        .unwrap()
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Berhasil",
            text: "Pengajuan izin berhasil dikirim",
            background: "#1D1D1D",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false,
          });
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "Oops..",
            text: err || "Gagal mengirim pengajuan",
            background: "#1D1D1D",
            color: "#fff",
          });
        });
    },
    [dispatch],
  );

  // Label bulan saat ini
  const currentMonth = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Halo,{" "}
            <span className="font-semibold text-foreground">
              {user?.name ?? user?.npp}
            </span>
            ! Berikut ringkasan timesheet Anda bulan ini.
          </p>
        </div>

        {/* Check-in / Check-out */}
        <QuickActions
          isCheckedIn={isCheckedIn}
          isCheckedOut={isCheckedOut}
          checkInTime={checkInTime ? new Date(checkInTime) : null}
          checkOutTime={isCheckedOut ? new Date() : null}
          isOvertime={isOvertime}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOutClick}
          onOvertime={handleOvertime}
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
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
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
              variant={
                (summary?.missingAttendanceTotal ?? 0) > 0
                  ? "danger"
                  : "default"
              }
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
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-1">
          <MiniCalendar />
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <RecentActivity data={records} loading={recordsLoading} />
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={showCheckoutModal}
        onOpenChange={setShowCheckoutModal}
        onSubmit={handleCheckoutSubmit}
      />

      {/* Leave Modal */}
      <LeaveModal
        open={showLeaveModal}
        onOpenChange={setShowLeaveModal}
        onSubmit={handleLeaveSubmit}
      />
    </div>
  );
}
