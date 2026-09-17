import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiV1 } from "../../libs/api";
import type { UpdateBniProfileDTO } from "../../features/profile/types/profile.dto";

// NOTE: Add UpdateProfileDTO later if necessary, for now we will just use any or inline type
export interface UpdateProfileDTO {
  name: string;
  email: string;
  noHp: string;
  npp: string;
}

export const updateProfile = createAsyncThunk<void, UpdateProfileDTO>(
  "profile/updateGeneral",
  async (payload, thunkAPI) => {
    try {
      await apiV1.patch("/users/profile", payload);
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
  }
);

export const updateBniProfile = createAsyncThunk<void, UpdateBniProfileDTO>(
  "profile/updateBni",
  async (payload, thunkAPI) => {
    try {
      await apiV1.patch("/users/profile/bni", payload);
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Failed to update BNI profile");
    }
  },
);
