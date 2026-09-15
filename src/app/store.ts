import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../stores/auth/slice";
import dashboardReducer from "../stores/dashboard/slice";
import holidayReducer from "../stores/holiday/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    holiday: holidayReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
