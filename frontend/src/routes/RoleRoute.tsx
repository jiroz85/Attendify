import { Navigate, Outlet } from "react-router-dom";
import type { RoleCode } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export function RoleRoute({ allow }: { allow: RoleCode[] }) {
  const { loading, role } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm opacity-80">Loading...</div>;
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
