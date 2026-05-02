import { useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import { FormField } from "../components/FormField";
import { Toast } from "../components/Toast";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const st = location.state as { from?: string } | null;
    return st?.from || null;
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    const fallback =
      role === "ADMIN"
        ? "/admin"
        : role === "TEACHER"
          ? "/teacher"
          : "/student";
    return <Navigate to={from || fallback} replace />;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md items-center px-4 py-10">
      <div className="w-full">
        <Card title="Sign in">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            {error ? <Toast type="error" message={error} /> : null}

            <FormField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@school.edu"
              disabled={loading}
            />
            <FormField
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="••••••••"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-xs opacity-80">
              Backend expects:
              <div>
                <code>POST /auth/login</code> with <code>email</code> +{" "}
                <code>password</code>
              </div>
            </div>
          </form>
        </Card>

        <div className="mt-6 text-center text-xs opacity-80">
          Smart Attendance Tracking System
        </div>
      </div>
    </div>
  );
}
