// Response shape dari GET /api/v1/dashboards/summary
export interface DashboardSummaryDTO {
  workDayTotal: number;
  filled: number;
  missing: number;
  totalHours: number;
  targetHours: number;
  overtimeHours: number;
  overtimeDays: number;
}
