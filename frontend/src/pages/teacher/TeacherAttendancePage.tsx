import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import type { AttendanceStatus } from "../../services/attendance";
import {
  bulkMarkAttendance,
  getTeacherClassData,
  getClassAttendance,
} from "../../services/attendance";
import type { TeacherClassData } from "../../services/attendance";
import type { TeacherStudent } from "../../services/teacher";
import { listTeacherStudents } from "../../services/teacher";

function todayIsoDate() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function TeacherAttendancePage() {
  const [classData, setClassData] = useState<TeacherClassData[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<TeacherClassData | null>(
    null,
  );
  const [attendanceDate, setAttendanceDate] = useState(todayIsoDate());
  const [editMode, setEditMode] = useState(false);
  const [hasExistingAttendance, setHasExistingAttendance] = useState(false);

  const [draft, setDraft] = useState<Record<number, AttendanceStatus>>({});

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [data, students] = await Promise.all([
          getTeacherClassData(),
          listTeacherStudents(),
        ]);
        if (!cancelled) {
          setClassData(data);
          setStudents(students);
        }
      } catch {
        if (!cancelled) setError("Failed to load teacher data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load existing attendance when class and date are selected
  useEffect(() => {
    const sc = selectedClass;
    if (!sc || !attendanceDate) return;

    const classId = sc.class_id;
    const courseId = sc.course_id;

    let cancelled = false;
    async function run() {
      try {
        const attendance = await getClassAttendance(
          classId,
          courseId,
          attendanceDate,
        );
        if (!cancelled) {
          // Pre-fill draft with existing attendance
          const draftData: Record<number, AttendanceStatus> = {};
          attendance.forEach((record) => {
            draftData[record.student_id] =
              record.status_code as AttendanceStatus;
          });
          setDraft(draftData);
          setHasExistingAttendance(attendance.length > 0);
        }
      } catch {
        // No existing attendance is fine
        if (!cancelled) {
          setDraft({});
          setHasExistingAttendance(false);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedClass, attendanceDate]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.classId === selectedClass.class_id);
  }, [selectedClass, students]);

  function setStatus(studentId: number, status: AttendanceStatus) {
    setDraft((d) => ({ ...d, [studentId]: status }));
  }

  async function submitAll() {
    setError(null);
    setSuccess(null);

    if (!selectedClass) {
      setError("Select a class");
      return;
    }
    if (!attendanceDate) {
      setError("Select a date");
      return;
    }

    const attendanceData = filteredStudents.map((s) => ({
      studentId: s.id,
      statusCode: draft[s.id] || "PRESENT",
    }));

    setSaving(true);
    try {
      await bulkMarkAttendance({
        classId: selectedClass.class_id,
        courseId: selectedClass.course_id,
        attendanceDate,
        attendance: attendanceData,
      });
      setSuccess(
        `${hasExistingAttendance ? "Updated" : "Submitted"} attendance for ${attendanceData.length} student(s)`,
      );
      setHasExistingAttendance(true);
      setEditMode(false);
    } catch {
      setError("Failed to submit attendance");
    } finally {
      setSaving(false);
    }
  }

  function navigateDate(direction: "prev" | "next") {
    const currentDate = new Date(attendanceDate);
    if (direction === "prev") {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const pad = (n: number) => String(n).padStart(2, "0");
    const newDate = `${currentDate.getFullYear()}-${pad(
      currentDate.getMonth() + 1,
    )}-${pad(currentDate.getDate())}`;
    setAttendanceDate(newDate);
  }

  function viewStudentHistory(studentId: number) {
    window.location.href = `/teacher/students/${studentId}/attendance`;
  }

  function viewAttendanceHistory() {
    window.location.href = "/teacher/attendance/history";
  }

  return (
    <div className="grid gap-3">
      <h2 className="mt-0 text-xl font-semibold text-[var(--text-h)]">
        Attendance
      </h2>
      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      <Card title="Session">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Class
              </span>
              <select
                value={selectedClass ? String(selectedClass.class_id) : ""}
                onChange={(e) => {
                  const classId = Number(e.target.value);
                  const selected = classData.find(
                    (c) => c.class_id === classId,
                  );
                  setSelectedClass(selected || null);
                }}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
              >
                <option value="">Select...</option>
                {classData.map((c) => (
                  <option key={c.class_id} value={String(c.class_id)}>
                    {c.department_name} - {c.course_code} (
                    {c.academic_year_name} - {c.section_name})
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Course
              </span>
              <div className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 flex items-center text-[var(--text-h)]">
                {selectedClass
                  ? `${selectedClass.course_code}: ${selectedClass.course_title}`
                  : "Select a class"}
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Date
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigateDate("prev")}
                  disabled={saving}
                  className="h-10 w-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  disabled={saving}
                  className="h-10 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => navigateDate("next")}
                  disabled={saving}
                  className="h-10 w-10 rounded-xl border border-[var(--border)] bg-transparent px-2 text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  →
                </button>
              </div>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Actions
              </span>
              <div className="flex gap-2">
                {hasExistingAttendance && (
                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 text-sm font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={viewAttendanceHistory}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm font-semibold text-[var(--text-h)] hover:bg-white/5"
                >
                  History
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card
        title={`Students (${filteredStudents.length})`}
        right={
          <div className="flex gap-2">
            {hasExistingAttendance && !editMode && (
              <span className="text-sm text-amber-600 flex items-center">
                ⚠️ Existing attendance - Edit to modify
              </span>
            )}
            <button
              type="button"
              onClick={submitAll}
              disabled={saving || loading || filteredStudents.length === 0}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 text-sm font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Submitting..."
                : hasExistingAttendance && editMode
                  ? "Update"
                  : "Submit"}
            </button>
          </div>
        }
      >
        {loading ? (
          <div>Loading...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-sm opacity-80">
            Select a class to see students.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[var(--text-h)]">
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Student
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Status
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const status = draft[s.id] || "PRESENT";
                  return (
                    <tr key={s.id}>
                      <td className="border-b border-[var(--border)] px-3 py-2">
                        <div className="font-semibold text-[var(--text-h)]">
                          {`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() ||
                            s.email}
                        </div>
                        <div className="text-xs opacity-80">
                          #{s.id}{" "}
                          {s.studentNumber ? `• ${s.studentNumber}` : ""}
                        </div>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-2">
                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(s.id, e.target.value as AttendanceStatus)
                          }
                          disabled={
                            saving || (hasExistingAttendance && !editMode)
                          }
                          className={`h-10 w-full min-w-40 rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] ${
                            hasExistingAttendance && !editMode
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                          <option value="LATE">Late</option>
                          <option value="EXCUSED">Excused</option>
                        </select>
                      </td>
                      <td className="border-b border-[var(--border)] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => viewStudentHistory(s.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
