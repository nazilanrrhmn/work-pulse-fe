import { createAsyncThunk } from "@reduxjs/toolkit";
import type { DashboardSummaryDTO } from "../../features/dashboard/types/dashboard.dto";
import { apiV1 } from "../../libs/api";

// ─── Get Dashboard Summary
export const getDashboardSummary = createAsyncThunk<DashboardSummaryDTO>(
  "dashboard/summary",
  async (_, thunkAPI) => {
    try {
      const res = await apiV1.get<DashboardSummaryDTO>("/dashboards/summary");
      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to fetch dashboard summary");
    }
  },
);
