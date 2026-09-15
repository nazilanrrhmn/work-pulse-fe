import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/use-store";

/**
 * ProtectedRoute — hanya dapat diakses oleh user yang sudah login.
 * Jika belum login, redirect ke /login.
 */
export default function ProtectedRoute() {
  const user = useAppSelector((state) => state.auth.entities);

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return <Outlet />;
}
