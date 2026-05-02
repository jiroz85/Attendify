import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { AttendanceRow } from "../../services/attendance";
import { listAttendanceForStudent } from "../../services/attendance";

export function StudentAttendancePercentagePage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await listAttendanceForStudent(user.id);
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setError("Failed to load attendance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = rows.length;
    const present = rows.filter(
      (r) => r.status === "PRESENT" || r.status === "EXCUSED",
    ).length;
    const late = rows.filter((r) => r.status === "LATE").length;
    const absent = rows.filter((r) => r.status === "ABSENT").length;
    const percent = total ? Math.round((present / total) * 100) : 0;
    return { total, present, late, absent, percent };
  }, [rows]);

  return (
    <div className="grid gap-3">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Attendance Percentage
      </h2>
      {error ? <Toast type="error" message={error} /> : null}
      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Total">
          <div className="text-2xl font-extrabold text-[var(--text-h)]">
            {stats.total}
          </div>
        </Card>
        <Card title="Present/Excused">
          <div className="text-2xl font-extrabold text-[var(--text-h)]">
            {stats.present}
          </div>
        </Card>
        <Card title="Late">
          <div className="text-2xl font-extrabold text-[var(--text-h)]">
            {stats.late}
          </div>
        </Card>
        <Card title="Absent">
          <div className="text-2xl font-extrabold text-[var(--text-h)]">
            {stats.absent}
          </div>
        </Card>
      </div>
      <Card title="Percentage">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="text-4xl font-black text-[var(--text-h)]">
            {stats.percent}%
          </div>
        )}
        <div className="mt-2 text-sm opacity-80">
          Based on PRESENT + EXCUSED over total records.
        </div>
      </Card>
    </div>
  );
}
