import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import { getTeacherProfile } from "../../services/teacher";
import type { TeacherProfile } from "../../services/teacher";

export function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTeacherProfile();
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setError("Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-4 max-w-3xl">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Teacher Profile
      </h2>
      {error ? <Toast type="error" message={error} /> : null}
      {loading ? (
        <div>Loading...</div>
      ) : profile ? (
        <>
          <Card title="Details">
            <div className="grid gap-3 text-sm">
              <div>
                <span className="font-medium text-[var(--text-h)]">Name:</span>{" "}
                {profile.first_name || ""} {profile.last_name || ""} (
                {profile.email})
              </div>
              <div>
                <span className="font-medium text-[var(--text-h)]">Employee #:</span>{" "}
                {profile.employee_number || "-"}
              </div>
              <div>
                <span className="font-medium text-[var(--text-h)]">Phone:</span>{" "}
                {profile.phone || "-"}
              </div>
              <div>
                <span className="font-medium text-[var(--text-h)]">Department:</span>{" "}
                {profile.department_name || "-"}
              </div>
            </div>
          </Card>

          <Card title={`Assigned Sessions (${profile.assignments.length})`}>
            {profile.assignments.length === 0 ? (
              <div className="text-sm opacity-80">No assigned sessions yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-h)]">
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Class
                      </th>
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Course
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.assignments.map((a) => (
                      <tr key={`${a.class_id}-${a.course_id}`}>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <div className="font-semibold text-[var(--text-h)]">
                            {a.department_name} / {a.academic_year_name} /{" "}
                            {a.section_name}
                          </div>
                          <div className="text-xs opacity-80">class #{a.class_id}</div>
                        </td>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <div className="font-semibold text-[var(--text-h)]">
                            {a.course_code}: {a.course_title}
                          </div>
                          <div className="text-xs opacity-80">course #{a.course_id}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
