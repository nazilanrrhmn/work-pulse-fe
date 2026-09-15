import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type {
  HolidayDTO,
  HolidaysResponseDTO,
} from "../../features/dashboard/types/holiday.dto";

// Gunakan path proxy Vite (/holiday-api) agar request tidak kena CORS.
// Vite akan forward ke https://use.api.co.id secara server-side.
const HOLIDAY_API_BASE = "/holiday-api";
const HOLIDAY_API_KEY = import.meta.env.VITE_HOLIDAY_API_KEY as string;

// ─── Get Holidays by Year
export const getHolidays = createAsyncThunk<HolidayDTO[], number>(
  "holiday/getByYear",
  async (year, thunkAPI) => {
    try {
      const res = await axios.get<HolidaysResponseDTO>(
        `${HOLIDAY_API_BASE}/holidays/indonesia/`,
        {
          params: { year },
          headers: { "x-api-co-id": HOLIDAY_API_KEY },
        },
      );

      if (!res.data.is_success) {
        return thunkAPI.rejectWithValue(res.data.message);
      }

      return res.data.data ?? [];
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to fetch holidays");
    }
  },
);
