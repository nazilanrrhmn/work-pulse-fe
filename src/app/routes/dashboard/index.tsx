import { useState, useCallback } from "react";
import { useAppSelector } from "@/hooks/use-store";
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
import { useDashboardSummary } from "@/features/dashboard/hooks/use-dashboard-summary";

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
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isOvertime, setIsOvertime] = useState(false);

  const handleCheckIn = useCallback(() => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
  }, []);

  const handleCheckOutClick = useCallback(() => {
    setShowCheckoutModal(true);
  }, []);

  const handleOvertime = useCallback(() => {
    setIsOvertime(true);
  }, []);

  const handleCheckoutSubmit = useCallback(
    (data: CheckoutData) => {
      setCheckOutTime(data.checkOutTime);
      setIsCheckedOut(true);
      setShowCheckoutModal(false);

      // TODO: Send data to API
      console.log("Checkout data:", {
        checkInTime,
        checkOutTime: data.checkOutTime,
        projectName: data.projectName,
        activityDescription: data.activityDescription,
        isOvertime,
      });
    },
    [checkInTime, isOvertime],
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
              {user?.name ?? user?.username}
            </span>
            ! Berikut ringkasan timesheet Anda bulan ini.
          </p>
        </div>

        {/* Check-in / Check-out */}
        <QuickActions
          isCheckedIn={isCheckedIn}
          isCheckedOut={isCheckedOut}
          checkInTime={checkInTime}
          checkOutTime={checkOutTime}
          isOvertime={isOvertime}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOutClick}
          onOvertime={handleOvertime}
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
              variant={(summary?.missingAttendanceTotal ?? 0) > 0 ? "danger" : "default"}
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
          <RecentActivity />
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        open={showCheckoutModal}
        onOpenChange={setShowCheckoutModal}
        onSubmit={handleCheckoutSubmit}
      />
    </div>
  );
}
