import { useState, useCallback } from "react";
import { useAppSelector } from "@/hooks/use-store";
import {
  CalendarCheck,
  CalendarX,
  Clock,
  Timer,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/features/dashboard/components/stat-card";
import MiniCalendar from "@/features/dashboard/components/mini-calendar";
import RecentActivity from "@/features/dashboard/components/recent-activity";
import QuickActions from "@/features/dashboard/components/quick-actions";
import CheckoutModal, {
  type CheckoutData,
} from "@/features/dashboard/components/checkout-modal";

// Static demo stats — will be replaced with real API data
const stats = {
  workDays: 22,
  filled: 7,
  missing: 1,
  totalHours: 57.5,
  targetHours: 176,
  overtimeHours: 5.5,
  overtimeDays: 2,
};

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.entities);
  const fillProgress = Math.round(
    (stats.filled / (stats.filled + stats.missing)) * 100,
  );

  // ── Attendance state ──
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleCheckIn = useCallback(() => {
    const now = new Date();
    setCheckInTime(now);
    setIsCheckedIn(true);
  }, []);

  const handleCheckOutClick = useCallback(() => {
    setShowCheckoutModal(true);
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
      });
    },
    [checkInTime],
  );

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
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOutClick}
        />
      </div>

      {/* Stat cards — 2 per row on mobile, 3 on lg, 5 on xl */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Total Hari Kerja"
          value={stats.workDays}
          subtitle="September 2026"
          icon={CalendarCheck}
          variant="default"
        />
        <StatCard
          title="Sudah Diisi"
          value={stats.filled}
          subtitle={`dari ${stats.workDays} hari`}
          icon={CalendarCheck}
          variant="success"
        />
        <StatCard
          title="Belum Diisi"
          value={stats.missing}
          subtitle="hari terlewat"
          icon={CalendarX}
          variant={stats.missing > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Total Hari Lembur"
          value={stats.overtimeDays}
          subtitle="hari ini"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Total Lembur"
          value={`${stats.overtimeHours}j`}
          subtitle="bulan ini"
          icon={Timer}
          variant="warning"
        />
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
