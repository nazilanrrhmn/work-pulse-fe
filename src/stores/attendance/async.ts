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
