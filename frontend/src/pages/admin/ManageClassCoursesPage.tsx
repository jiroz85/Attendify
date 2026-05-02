import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import {
  addCourseToClass,
  getClassCourses,
  getClasses,
  getCourses,
  removeCourseFromClass,
} from "../../services/admin";
import type { Class, Course, ClassCourse } from "../../services/admin";

export function ManageClassCoursesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classId, setClassId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [assigned, setAssigned] = useState<ClassCourse[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedClassId = Number(classId);

  const availableCourses = useMemo(() => {
    if (!Number.isFinite(selectedClassId) || selectedClassId < 1)
      return courses;
    const assignedIds = new Set(assigned.map((a) => a.course_id));
    return courses.filter((c) => !assignedIds.has(c.id));
  }, [assigned, courses, selectedClassId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [c, co] = await Promise.all([getClasses(), getCourses()]);
        if (!cancelled) {
          setClasses(c);
          setCourses(co);
        }
      } catch {
        if (!cancelled) setError("Failed to load classes/courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!Number.isFinite(selectedClassId) || selectedClassId < 1) {
      return;
    }

    let cancelled = false;
    async function run() {
      setError(null);
      try {
        const rows = await getClassCourses(selectedClassId);
        if (!cancelled) setAssigned(rows);
      } catch {
        if (!cancelled) setError("Failed to load class courses");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedClassId]);

  async function onAssign() {
    setError(null);
    setSuccess(null);

    const cid = Number(classId);
    const coid = Number(courseId);
    if (!Number.isFinite(cid) || cid < 1) {
      setError("Select a class");
      return;
    }
    if (!Number.isFinite(coid) || coid < 1) {
      setError("Select a course");
      return;
    }

    setSaving(true);
    try {
      await addCourseToClass({ classId: cid, courseId: coid });
      const rows = await getClassCourses(cid);
      setAssigned(rows);
      setCourseId("");
      setSuccess("Course assigned to class");
    } catch {
      setError("Failed to assign course to class");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(courseIdToRemove: number) {
    setError(null);
    setSuccess(null);

    const cid = Number(classId);
    if (!Number.isFinite(cid) || cid < 1) {
      setError("Select a class");
      return;
    }

    setSaving(true);
    try {
      await removeCourseFromClass({ classId: cid, courseId: courseIdToRemove });
      const rows = await getClassCourses(cid);
      setAssigned(rows);
      setSuccess("Course removed from class");
    } catch {
      setError("Failed to remove course from class");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-3xl">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Assign Courses To Class
      </h2>

      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      <Card title="Select">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Class
              </span>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={saving}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
              >
                <option value="">Select...</option>
                {classes.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.department} / {c.academic_year} / {c.section} (#{c.id})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Course
              </span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={saving || !classId}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
              >
                <option value="">Select...</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code}: {c.title} (#{c.id})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onAssign}
              disabled={saving || !classId || !courseId}
              className="md:col-span-2 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>
        )}
      </Card>

      <Card title={`Assigned Courses (${assigned.length})`}>
        {!classId ? (
          <div className="text-sm opacity-80">
            Select a class to view assigned courses.
          </div>
        ) : assigned.length === 0 ? (
          <div className="text-sm opacity-80">No courses assigned.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[var(--text-h)]">
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Course
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((a) => (
                  <tr key={`${a.class_id}-${a.course_id}`}>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {a.code}: {a.title}
                      </div>
                      <div className="text-xs opacity-80">#{a.course_id}</div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onRemove(a.course_id)}
                        disabled={saving}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm font-semibold text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Remove
                      </button>
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
