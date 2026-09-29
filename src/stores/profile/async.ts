import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiV1 } from "../../libs/api";
import type { UserProfileDTO } from "../../features/profile/types/profile.dto";

export const fetchProfile = createAsyncThunk<UserProfileDTO>(
  "profile/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await apiV1.get<UserProfileDTO>("/users");
      return res.data;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to fetch profile");
    }
  },
);

export interface UpdateProfileDTO {
  nppBni: number;
  manager: string;
  departemenHead: string;
  divisi: string;
  departemen: string;
  kelompok: string;
}

export const updateProfile = createAsyncThunk<void, UpdateProfileDTO>(
  "profile/updateGeneral",
  async (payload, thunkAPI) => {
    try {
      await apiV1.patch("/users/profile/bni", payload);
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to update profile");
    }
  },
);

export const uploadSignature = createAsyncThunk<void, File>(
  "profile/uploadSignature",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await apiV1.patch("/users/signatures", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to upload signature");
    }
  },
);
