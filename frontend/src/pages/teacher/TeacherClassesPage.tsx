import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import type { TeacherClass } from "../../services/teacher";
import { listTeacherClasses } from "../../services/teacher";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

export function TeacherClassesPage() {
  const [rows, setRows] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTeacherClasses();
      setRows(data);
    } catch {
      setError("Failed to load classes");
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
        Assigned Classes
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
                    Department
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Academic Year
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Section
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
                      {r.departmentName}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.academicYearName}
                    </td>
                    <td className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2">
                      {r.sectionName}
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
