import { createSlice } from "@reduxjs/toolkit";
import type { DashboardSummaryDTO } from "../../features/dashboard/types/dashboard.dto";
import { getDashboardSummary } from "./async";

interface DashboardState {
  summary: DashboardSummaryDTO | null;
  loading: "idle" | "pending" | "success" | "failed";
  error?: string;
}

const initialState: DashboardState = {
  summary: null,
  loading: "idle",
  error: undefined,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Reset state (misal saat logout)
    resetDashboard: (state) => {
      state.summary = null;
      state.loading = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── getDashboardSummary ────────────────────────────────────────────────
      .addCase(getDashboardSummary.pending, (state) => {
        state.loading = "pending";
        state.error = undefined;
      })
      .addCase(getDashboardSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading = "success";
      })
      .addCase(getDashboardSummary.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
