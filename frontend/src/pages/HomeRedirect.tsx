import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HomeRedirect() {
  const { loading, role } = useAuth();

  if (loading) {
    return <div className="p-6 text-sm opacity-80">Loading...</div>;
  }

  if (role === "ADMIN") return <Navigate to="/admin" replace />;
  if (role === "TEACHER") return <Navigate to="/teacher" replace />;
  if (role === "STUDENT") return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
}
