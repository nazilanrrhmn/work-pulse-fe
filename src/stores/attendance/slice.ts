import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clockOutPresence,
  checkInPresence,
  submitLeave,
  fetchAttendances,
  fetchTodayAttendance,
  clockInOvertime,
  clockOutOvertime,
  type AttendanceResponseDTO,
} from "./async";

export interface AttendanceState {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  isOnLeave: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  isOvertime: boolean;
  overtimeClockInTime: string | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
  records: AttendanceResponseDTO[];
  recordsLoading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    totalElements: number;
  };
}

const LEAVE_TYPES: ReadonlySet<string> = new Set([
  "SICK",
  "ANNUAL",
  "PERMISSION",
  "OTHER",
  "LEAVE",
  "CUTI",
  "SAKIT",
  "IZIN",
]);

const initialState: AttendanceState = {
  isCheckedIn: false,
  isCheckedOut: false,
  isOnLeave: false,
  checkInTime: null,
  checkOutTime: null,
  isOvertime: false,
  overtimeClockInTime: null,
  loading: "idle",
  error: null,
  records: [],
  recordsLoading: false,
  pagination: {
    page: 1,
    totalPages: 0,
    totalElements: 0,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const isLeaveType = (type?: string | null): boolean =>
  !!type && LEAVE_TYPES.has(type.toUpperCase());

const toDateTime = (date: string, time: string): string => `${date}T${time}`;

/** Pending untuk aksi tulis: set loading dan bersihkan error sebelumnya. */
function startLoading(state: AttendanceState) {
  state.loading = "pending";
  state.error = null;
}

function markSucceeded(state: AttendanceState) {
  state.loading = "succeeded";
}

/** Rejected: pakai payload dari rejectWithValue, fallback ke pesan error thunk. */
function markFailed(
  state: AttendanceState,
  action: { payload?: unknown; error: { message?: string } },
) {
  state.loading = "failed";
  state.error =
    typeof action.payload === "string"
      ? action.payload
      : (action.error.message ?? null);
}

function applyOvertime(state: AttendanceState, today: AttendanceResponseDTO) {
  state.isOvertime = true;

  if (today.overtimeClockIn) {
    state.overtimeClockInTime = toDateTime(today.date, today.overtimeClockIn);
  }
  if (today.overtimeClockOut) {
    state.overtimeClockInTime = null;
  }
}

/** Sinkronkan state lokal dengan data presensi hari ini dari server. */
function applyTodayAttendance(
  state: AttendanceState,
  today: AttendanceResponseDTO | null | undefined,
) {
  if (!today) return;

  if (isLeaveType(today.type)) {
    state.isOnLeave = true;
  }
  if (today.clockIn) {
    state.isCheckedIn = true;
    state.checkInTime = toDateTime(today.date, today.clockIn);
  }
  if (today.clockOut) {
    state.isCheckedOut = true;
    state.checkOutTime = toDateTime(today.date, today.clockOut);
  }
  if (today.overtime) {
    applyOvertime(state, today);
  }
}

// ── Slice ──────────────────────────────────────────────────────────────────────
export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    setLocalCheckIn: (state, action: PayloadAction<string>) => {
      state.isCheckedIn = true;
      state.checkInTime = action.payload;
    },
    resetAttendance: (state) => {
      state.isCheckedIn = false;
      state.isCheckedOut = false;
      state.isOnLeave = false;
      state.checkInTime = null;
      state.checkOutTime = null;
      state.isOvertime = false;
      state.overtimeClockInTime = null;
      state.loading = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Clock out ──
      .addCase(clockOutPresence.pending, startLoading)
      .addCase(clockOutPresence.fulfilled, (state) => {
        markSucceeded(state);
        state.isCheckedOut = true;
      })
      .addCase(clockOutPresence.rejected, markFailed)

      // ── Check in ──
      .addCase(checkInPresence.pending, startLoading)
      .addCase(checkInPresence.fulfilled, (state) => {
        markSucceeded(state);
        state.isCheckedIn = true;
      })
      .addCase(checkInPresence.rejected, markFailed)

      // ── Leave ──
      .addCase(submitLeave.pending, startLoading)
      .addCase(submitLeave.fulfilled, (state) => {
        markSucceeded(state);
        state.isOnLeave = true;
      })
      .addCase(submitLeave.rejected, markFailed)

      // ── Today's attendance ──
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        markSucceeded(state);
        applyTodayAttendance(state, action.payload);
      })
      .addCase(fetchTodayAttendance.rejected, markFailed)

      // ── Overtime ──
      .addCase(clockInOvertime.pending, startLoading)
      .addCase(clockInOvertime.fulfilled, (state) => {
        markSucceeded(state);
        state.isOvertime = true;
        state.overtimeClockInTime = new Date().toISOString();
      })
      .addCase(clockInOvertime.rejected, markFailed)
      .addCase(clockOutOvertime.pending, startLoading)
      .addCase(clockOutOvertime.fulfilled, (state) => {
        markSucceeded(state);
        state.overtimeClockInTime = null;
      })
      .addCase(clockOutOvertime.rejected, markFailed)

      // ── Attendance list ──
      .addCase(fetchAttendances.pending, (state) => {
        state.recordsLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        const { content, pageable, totalPages, totalElements } = action.payload;

        state.recordsLoading = false;
        state.records = content;
        state.pagination = {
          // Spring memakai page number berbasis 0
          page: (pageable?.pageNumber ?? 0) + 1,
          totalPages,
          totalElements,
        };
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.recordsLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : (action.error.message ?? null);
      });
  },
});

export const { setLocalCheckIn, resetAttendance } = attendanceSlice.actions;

export default attendanceSlice.reducer;
