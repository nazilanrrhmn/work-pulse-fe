import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/use-store";

/**
 * GuestRoute — hanya dapat diakses oleh user yang BELUM login.
 * Jika sudah login, redirect ke /dashboard.
 */
export default function GuestRoute() {
  const user = useAppSelector((state) => state.auth.entities);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
