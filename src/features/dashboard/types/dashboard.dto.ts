// Response shape dari GET /api/v1/dashboards/summary
export interface DashboardSummaryDTO {
  workDayTotal: number;
  clockInTotal: number;
  missingAttendanceTotal: number;
  totalOvertime: number;
  totalOvertimeMinutes: number;
  formattedTotalOvertimeHours: string;
}
