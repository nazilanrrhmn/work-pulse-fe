import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthLayout from "../components/layouts/auth-layout";
import AdminLayout from "../components/layouts/admin-layout";
import LoginPage from "./routes/auth/login";
import RegisterPage from "./routes/auth/register";
import DashboardPage from "./routes/dashboard";
import TimesheetPage from "./routes/schedules";
import ProfilePage from "./routes/profile";

export default function RouterApp() {
  const router = createBrowserRouter([
    // ─── Auth routes ────────────────────────────────────────────────────────
    {
      element: <AuthLayout />,
      children: [
        { path: "/register", element: <RegisterPage /> },
        { path: "/login", element: <LoginPage /> },
      ],
    },

    // ─── Admin routes ───────────────────────────────────────────────────────
    {
      element: <AdminLayout />,
      children: [
        { path: "/dashboard", element: <DashboardPage /> },
        { path: "/timesheet", element: <TimesheetPage /> },
        { path: "/profile", element: <ProfilePage /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
