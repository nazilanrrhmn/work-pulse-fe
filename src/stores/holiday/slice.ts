import { createSlice } from "@reduxjs/toolkit";
import type { HolidayDTO } from "../../features/dashboard/types/holiday.dto";
import { getHolidays } from "./async";

interface HolidayState {
  // Cache per tahun: { "2026": [...], "2025": [...] }
  byYear: Record<string, HolidayDTO[]>;
  loading: "idle" | "pending" | "success" | "failed";
  error?: string;
}

const initialState: HolidayState = {
  byYear: {},
  loading: "idle",
  error: undefined,
};

const holidaySlice = createSlice({
  name: "holiday",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getHolidays.pending, (state) => {
        state.loading = "pending";
        state.error = undefined;
      })
      .addCase(getHolidays.fulfilled, (state, action) => {
        // action.meta.arg = year yang dikirim ke thunk
        const year = String(action.meta.arg);
        state.byYear[year] = action.payload;
        state.loading = "success";
      })
      .addCase(getHolidays.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export default holidaySlice.reducer;
