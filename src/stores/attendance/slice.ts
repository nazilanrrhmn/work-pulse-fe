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

const LEAVE_TYPES = [
  "SICK",
  "ANNUAL",
  "PERMISSION",
  "OTHER",
  "LEAVE",
  "CUTI",
  "SAKIT",
  "IZIN",
];

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
      .addCase(clockOutPresence.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(clockOutPresence.fulfilled, (state) => {
        state.loading = "succeeded";
        state.isCheckedOut = true;
      })
      .addCase(clockOutPresence.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(checkInPresence.pending, (state, action) => {
        state.loading = "pending";
        state.error = action.payload as string;
      })
      .addCase(checkInPresence.fulfilled, (state) => {
        state.loading = "succeeded";
        state.isCheckedIn = true;
      })
      .addCase(checkInPresence.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(submitLeave.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(submitLeave.fulfilled, (state) => {
        state.loading = "succeeded";
        state.isOnLeave = true;
      })
      .addCase(submitLeave.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.loading = "pending";
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.loading = "succeeded";
        if (action.payload) {
          // Detect leave from today's attendance type
          if (
            action.payload.type &&
            LEAVE_TYPES.includes(action.payload.type.toUpperCase())
          ) {
            state.isOnLeave = true;
          }
          if (action.payload.clockIn) {
            state.isCheckedIn = true;
            state.checkInTime = `${action.payload.date}T${action.payload.clockIn}`;
          }
          if (action.payload.clockOut) {
            state.isCheckedOut = true;
            state.checkOutTime = `${action.payload.date}T${action.payload.clockOut}`;
          }
          if (action.payload.overtime) {
            state.isOvertime = true;
            if (action.payload.overtimeClockIn) {
              state.overtimeClockInTime = `${action.payload.date}T${action.payload.overtimeClockIn}`;
            }
            if (action.payload.overtimeClockOut) {
              state.overtimeClockInTime = null;
            }
          }
        }
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(clockInOvertime.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(clockInOvertime.fulfilled, (state) => {
        state.loading = "succeeded";
        state.isOvertime = true;
        const now = new Date().toISOString();
        state.overtimeClockInTime = now;
      })
      .addCase(clockInOvertime.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(clockOutOvertime.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(clockOutOvertime.fulfilled, (state) => {
        state.loading = "succeeded";
        state.overtimeClockInTime = null;
      })
      .addCase(clockOutOvertime.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchAttendances.pending, (state) => {
        state.recordsLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.recordsLoading = false;
        state.records = action.payload.content;
        state.pagination = {
          page: action.payload.pageable?.pageNumber
            ? action.payload.pageable.pageNumber + 1
            : 1, // Depending on if Spring is 0-indexed
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
        };
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.recordsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLocalCheckIn, resetAttendance } = attendanceSlice.actions;

export default attendanceSlice.reducer;
