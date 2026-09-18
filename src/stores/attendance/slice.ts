import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clockOutPresence, checkInPresence, submitLeave, fetchAttendances, type AttendanceResponseDTO } from "./async";

export interface AttendanceState {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
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

const initialState: AttendanceState = {
  isCheckedIn: false,
  isCheckedOut: false,
  checkInTime: null,
  checkOutTime: null,
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
      state.checkInTime = null;
      state.checkOutTime = null;
      state.loading = "idle";
      state.error = null;
    }
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
      .addCase(checkInPresence.pending, (state) => {
        state.loading = "pending";
        state.error = undefined;
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
        // Can optionally set a flag or keep it as is, depends on UI needs.
      })
      .addCase(submitLeave.rejected, (state, action) => {
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
          page: action.payload.pageable?.pageNumber ? action.payload.pageable.pageNumber + 1 : 1, // Depending on if Spring is 0-indexed
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
