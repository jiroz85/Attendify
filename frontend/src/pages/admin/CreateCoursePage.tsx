import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { FormField } from "../../components/FormField";
import { Toast } from "../../components/Toast";
import { createCourse, getDepartments } from "../../services/admin";
import type { Department } from "../../services/admin";

export function CreateCoursePage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [departmentId, setDepartmentId] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoadingDeps(true);
      try {
        const rows = await getDepartments();
        if (!cancelled) setDepartments(rows);
      } catch {
        if (!cancelled) setError("Failed to load departments");
      } finally {
        if (!cancelled) setLoadingDeps(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await createCourse({
        departmentId: Number(departmentId),
        code,
        title,
      });
      setSuccess(`Created course #${res.id}`);
      setDepartmentId("");
      setCode("");
      setTitle("");
    } catch {
      setError("Failed to create course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Course
      </h2>
      <Card>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {error ? <Toast type="error" message={error} /> : null}
          {success ? <Toast type="success" message={success} /> : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Department
            </span>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              disabled={loading || loadingDeps}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
            >
              <option value="">Select...</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name} (#{d.id})
                </option>
              ))}
            </select>
          </label>
          <FormField
            label="Course Code"
            value={code}
            onChange={setCode}
            placeholder="CS101"
            disabled={loading}
          />
          <FormField
            label="Title"
            value={title}
            onChange={setTitle}
            placeholder="Introduction to CS"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading ||
              !departmentId ||
              code.trim().length < 1 ||
              title.trim().length < 2
            }
            className="mt-1 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </Card>
    </div>
  );
}
