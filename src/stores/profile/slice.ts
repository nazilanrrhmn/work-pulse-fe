import { createSlice } from "@reduxjs/toolkit";
import { updateBniProfile, updateProfile, uploadSignature } from "./async";

interface ProfileState {
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  loading: "idle",
  error: null,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateBniProfile.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateBniProfile.fulfilled, (state) => {
        state.loading = "succeeded";
      })
      .addCase(updateBniProfile.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
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
