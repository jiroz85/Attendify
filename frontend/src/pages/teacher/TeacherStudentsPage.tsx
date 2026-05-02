import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import type { TeacherStudent } from "../../services/teacher";
import { listTeacherStudents } from "../../services/teacher";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

export function TeacherStudentsPage() {
  const [rows, setRows] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTeacherStudents();
      setRows(data);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useRefreshOnFocus(refresh);

  useEffect(() => {
    const t = window.setTimeout(() => {
      refresh();
    }, 0);
    return () => {
      window.clearTimeout(t);
    };
  }, [refresh]);

  return (
    <div className="grid gap-3">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Students
      </h2>
      {error ? <Toast type="error" message={error} /> : null}
      <Card>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[var(--text-h)]">
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    ID
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Name
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Email
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Student #
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Class ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.id}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {`${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() ||
                        "(no name)"}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.email}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.studentNumber ?? "-"}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.classId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
