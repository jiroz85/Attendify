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
  const [showPassword, setShowPassword] = useState(false);
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
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 pr-11 text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-[var(--text)] hover:text-[var(--text-h)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a20.3 20.3 0 0 1 5.06-6.94" />
                      <path d="M1 1l22 22" />
                      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c6.5 0 10 7 10 7a20.6 20.6 0 0 1-3.16 4.19" />
                      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

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
