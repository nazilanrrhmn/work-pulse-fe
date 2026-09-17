import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiV1 } from "../../libs/api";
import type { HolidayDTO } from "../../features/dashboard/types/holiday.dto";

// ─── Get Holidays by Year
// We fetch the full year data to maintain the byYear caching mechanism in Redux.
export const getHolidays = createAsyncThunk<HolidayDTO[], number>(
  "holiday/getByYear",
  async (year, thunkAPI) => {
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const res = await apiV1.get<HolidayDTO[]>("/holidays", {
        params: { startDate, endDate },
      });

      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to fetch holidays");
    }
  },
);

// ─── Sync Holidays Manually
export const syncHolidays = createAsyncThunk<string, number>(
  "holiday/sync",
  async (year, thunkAPI) => {
    try {
      const res = await apiV1.post<string>("/holidays/sync", undefined, {
        params: { year },
      });

      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to sync holidays");
    }
  },
);
