import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import {
  createClass,
  getAcademicYears,
  getDepartments,
  getSections,
} from "../../services/admin";
import type { AcademicYear, Department, Section } from "../../services/admin";

export function CreateClassPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingPicklists, setLoadingPicklists] = useState(true);

  const [departmentId, setDepartmentId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoadingPicklists(true);
      setError(null);
      try {
        const [d, ay, s] = await Promise.all([
          getDepartments(),
          getAcademicYears(),
          getSections(),
        ]);
        if (!cancelled) {
          setDepartments(d);
          setAcademicYears(ay);
          setSections(s);
        }
      } catch {
        if (!cancelled) setError("Failed to load departments/years/sections");
      } finally {
        if (!cancelled) setLoadingPicklists(false);
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
      const res = await createClass({
        departmentId: Number(departmentId),
        academicYearId: Number(academicYearId),
        sectionId: Number(sectionId),
      });
      setSuccess(`Created class #${res.id}`);
      setDepartmentId("");
      setAcademicYearId("");
      setSectionId("");
    } catch {
      setError("Failed to create class");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Create Class
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
              disabled={loading || loadingPicklists}
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

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Academic Year
            </span>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              disabled={loading || loadingPicklists}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
            >
              <option value="">Select...</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={String(ay.id)}>
                  {ay.name} (#{ay.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Section
            </span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={loading || loadingPicklists}
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
            >
              <option value="">Select...</option>
              {sections.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} (#{s.id})
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={
              loading ||
              loadingPicklists ||
              !departmentId ||
              !academicYearId ||
              !sectionId
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
