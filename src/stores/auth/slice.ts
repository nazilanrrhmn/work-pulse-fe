import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { AuthDTO } from "../../features/auth/types/auth.dto";
import { getLogin, getRegister } from "./async";

interface AuthState {
  entities: AuthDTO | null;
  loading: "idle" | "pending" | "success" | "failed";
  error?: string;
}

// Inisialisasi state dari cookie yang sudah ada (session persistence tanpa /auth/me)
function getInitialUser(): AuthDTO | null {
  const token = Cookies.get("token");
  if (!token) return null;
  try {
    return jwtDecode<AuthDTO>(token);
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  entities: getInitialUser(),
  loading: "idle",
  error: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Hapus token cookie dan reset state saat logout
    logout: (state) => {
      Cookies.remove("token");
      state.entities = null;
      state.loading = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── getLogin ────────────────────────────────────────────────────────────
      .addCase(getLogin.pending, (state) => {
        state.loading = "pending";
        state.error = undefined;
      })
      .addCase(getLogin.fulfilled, (state, action) => {
        state.entities = action.payload;
        state.loading = "success";
      })
      .addCase(getLogin.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })

      // ─── getRegister ─────────────────────────────────────────────────────────
      .addCase(getRegister.pending, (state) => {
        state.loading = "pending";
        state.error = undefined;
      })
      .addCase(getRegister.fulfilled, (state) => {
        state.loading = "success";
      })
      .addCase(getRegister.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
