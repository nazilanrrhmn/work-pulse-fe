import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile, uploadSignature } from "./async";
import type { UserProfileDTO } from "../../features/profile/types/profile.dto";

interface ProfileState {
  data: UserProfileDTO | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  fetchLoading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: "idle",
  fetchLoading: "idle",
  error: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch Profile ──
      .addCase(fetchProfile.pending, (state) => {
        state.fetchLoading = "pending";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.fetchLoading = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.fetchLoading = "failed";
        state.error = action.payload as string;
      })
      // ── Update Profile ──
      .addCase(updateProfile.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = "succeeded";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // ── Upload Signature ──
      .addCase(uploadSignature.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(uploadSignature.fulfilled, (state) => {
        state.loading = "succeeded";
      })
      .addCase(uploadSignature.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
