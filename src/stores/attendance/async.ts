import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiV1 } from "../../libs/api";

export interface ClockOutPayloadDTO {
  projectName: string;
  activityDescription: string;
}

export interface LeavePayloadDTO {
  date: string;
  type: string;
  projectName: string;
}

export interface AttendanceResponseDTO {
  uuid: string;
  date: string;
  type: string;
  clockIn: string | null;
  clockOut: string | null;
  isOvertime: boolean;
  project: string | null;
  activityDescription: string | null;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
}

export interface FetchAttendancesParams {
  type?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order_by?: string;
  limit?: number;
  page?: number;
}

export const checkInPresence = createAsyncThunk<void, void>(
  "attendance/checkInPresence",
  async (_, thunkAPI) => {
    try {
      await apiV1.post("/attendances/presences");
    } catch (error: any) {
      if (error.response?.data?.message) {
         return thunkAPI.rejectWithValue(error.response.data.message);
      }
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Check in failed");
    }
  }
);

export const clockOutPresence = createAsyncThunk<void, ClockOutPayloadDTO>(
  "attendance/clockOutPresence",
  async (payload, thunkAPI) => {
    try {
      await apiV1.patch("/attendances/clock-out", payload);
    } catch (error: any) {
      if (error.response?.data?.message) {
         return thunkAPI.rejectWithValue(error.response.data.message);
      }
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Check out failed");
    }
  }
);

export const submitLeave = createAsyncThunk<void, LeavePayloadDTO>(
  "attendance/submitLeave",
  async (payload, thunkAPI) => {
    try {
      await apiV1.post("/attendances/leaves", payload);
    } catch (error: any) {
      if (error.response?.data?.message) {
         return thunkAPI.rejectWithValue(error.response.data.message);
      }
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Submit leave failed");
    }
  }
);

export const fetchAttendances = createAsyncThunk<PageableResponse<AttendanceResponseDTO>, FetchAttendancesParams | void>(
  "attendance/fetchAttendances",
  async (params, thunkAPI) => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }
      const response = await apiV1.get(`/attendances?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
         return thunkAPI.rejectWithValue(error.response.data.message);
      }
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to fetch attendances");
    }
  }
);
