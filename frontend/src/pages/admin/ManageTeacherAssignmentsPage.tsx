import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import {
  addTeacherAssignment,
  getClassCourses,
  getClasses,
  getCourses,
  getTeacherAssignments,
  getTeachers,
  removeTeacherAssignment,
} from "../../services/admin";
import type {
  Class,
  ClassCourse,
  Course,
  Teacher,
  TeacherAssignment,
} from "../../services/admin";

export function ManageTeacherAssignmentsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classCourses, setClassCourses] = useState<ClassCourse[]>([]);

  const [teacherId, setTeacherId] = useState("");
  const [classId, setClassId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedClass = useMemo(() => {
    const id = Number(classId);
    if (!Number.isFinite(id) || id < 1) return null;
    return classes.find((c) => c.id === id) || null;
  }, [classId, classes]);

  const courseOptions = useMemo(() => {
    if (!selectedClass) return courses;
    const allowed = new Set(classCourses.map((cc) => cc.course_id));
    return courses.filter((c) => allowed.has(c.id));
  }, [classCourses, courses, selectedClass]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const cid = Number(classId);
      if (!Number.isFinite(cid) || cid < 1) {
        setClassCourses([]);
        return;
      }
      try {
        const rows = await getClassCourses(cid);
        if (!cancelled) setClassCourses(rows);
      } catch {
        if (!cancelled) setError("Failed to load class courses");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  async function reloadAssignments() {
    const rows = await getTeacherAssignments();
    setAssignments(rows);
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [t, c, co, a] = await Promise.all([
          getTeachers(),
          getClasses(),
          getCourses(),
          getTeacherAssignments(),
        ]);
        if (!cancelled) {
          setTeachers(t);
          setClasses(c);
          setCourses(co);
          setAssignments(a);
        }
      } catch {
        if (!cancelled) setError("Failed to load admin data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onAssign() {
    setError(null);
    setSuccess(null);

    const tid = Number(teacherId);
    const cid = Number(classId);
    const coid = Number(courseId);

    if (!Number.isFinite(tid) || tid < 1) {
      setError("Select a teacher");
      return;
    }
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
      const res = await addTeacherAssignment({
        teacherId: tid,
        classId: cid,
        courseId: coid,
      });
      await reloadAssignments();
      setSuccess(`Created assignment #${res.id}`);
    } catch {
      setError("Failed to create assignment");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(id: number) {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await removeTeacherAssignment(id);
      await reloadAssignments();
      setSuccess("Assignment removed");
    } catch {
      setError("Failed to remove assignment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-5xl">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Assign Teacher To Class + Course
      </h2>

      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      <Card title="Create Assignment">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Teacher
              </span>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={saving}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
              >
                <option value="">Select...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {`${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() ||
                      t.email}{" "}
                    (#{t.id})
                  </option>
                ))}
              </select>
            </label>

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
                disabled={saving}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
              >
                <option value="">Select...</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.code}: {c.title} (#{c.id})
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={onAssign}
              disabled={saving || !teacherId || !classId || !courseId}
              className="md:col-span-3 inline-flex h-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Assign"}
            </button>
          </div>
        )}
      </Card>

      <Card title={`Assignments (${assignments.length})`}>
        {loading ? (
          <div>Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-sm opacity-80">No assignments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[var(--text-h)]">
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Teacher
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Class
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Course
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {`${a.teacher_first_name ?? ""} ${a.teacher_last_name ?? ""}`.trim() ||
                          a.teacher_email}
                      </div>
                      <div className="text-xs opacity-80">#{a.teacher_id}</div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {a.department_name} / {a.academic_year_name} /{" "}
                        {a.section_name}
                      </div>
                      <div className="text-xs opacity-80">
                        class #{a.class_id}
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {a.course_code}: {a.course_title}
                      </div>
                      <div className="text-xs opacity-80">
                        course #{a.course_id}
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onRemove(a.id)}
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
