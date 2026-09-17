import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type {
  AuthDTO,
  LoginDTO,
  LoginResponseDTO,
  RegisterDTO,
} from "../../features/auth/types/auth.dto";
import { apiV1 } from "../../libs/api";

// ─── Login
export const getLogin = createAsyncThunk<AuthDTO, LoginDTO>(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const res = await apiV1.post<LoginResponseDTO>("/tokens", payload);

      if (!res.data?.token) {
        return thunkAPI.rejectWithValue("Token not received from server");
      }

      // Simpan token ke cookie (expires 7 hari)
      Cookies.set("token", res.data.token, { expires: 7 });

      // Decode JWT untuk ambil data user (npp, name, status)
      const user = jwtDecode<AuthDTO>(res.data.token);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Login failed");
    }
  },
);

// ─── Register
export const getRegister = createAsyncThunk<void, RegisterDTO>(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      await apiV1.post("/registrations", payload);
    } catch (error) {
      if (error instanceof Error) {
        return thunkAPI.rejectWithValue(error.message);
      }
      return thunkAPI.rejectWithValue("Register failed");
    }
  },
);
