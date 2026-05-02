import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import type { TeacherClassData } from "../../services/attendance";
import {
  getTeacherClassData,
  getClassAttendance,
  bulkMarkAttendance,
} from "../../services/attendance";
import type { TeacherStudent } from "../../services/teacher";
import { listTeacherStudents } from "../../services/teacher";

export function TeacherAttendanceHistoryPage() {
  const [classData, setClassData] = useState<TeacherClassData[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState<TeacherClassData | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);

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

  // Load attendance when class and date are selected
  useEffect(() => {
    const sc = selectedClass;
    if (!sc?.class_id || !sc?.course_id || !selectedDate) return;

    const classId = sc.class_id;
    const courseId = sc.course_id;

    let cancelled = false;

    async function run() {
      try {
        const attendance = await getClassAttendance(
          classId,
          courseId,
          selectedDate,
        );

        if (!cancelled) {
          setAttendanceData(attendance);
        }
      } catch {
        if (!cancelled) {
          setAttendanceData([]);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedClass, selectedDate]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter((s) => s.classId === selectedClass.class_id);
  }, [selectedClass, students]);

  function updateAttendance(studentId: number, statusCode: string) {
    setAttendanceData((prev) => {
      const existing = prev.find((a) => a.student_id === studentId);

      if (existing) {
        return prev.map((a) =>
          a.student_id === studentId ? { ...a, status_code: statusCode } : a,
        );
      } else {
        const student = filteredStudents.find((s) => s.id === studentId);

        if (student) {
          return [
            ...prev,
            {
              student_id: studentId,
              status_code: statusCode,
              first_name: student.firstName,
              last_name: student.lastName,
              student_number: student.studentNumber,
            },
          ];
        }
      }

      return prev;
    });
  }

  async function saveAttendance() {
    if (
      !selectedClass?.class_id ||
      !selectedClass?.course_id ||
      !selectedDate
    ) {
      setError("Please select class and date");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const attendancePayload = filteredStudents.map((student) => {
        const record = attendanceData.find((a) => a.student_id === student.id);

        return {
          studentId: student.id,
          statusCode: record?.status_code || "PRESENT",
        };
      });

      await bulkMarkAttendance({
        classId: selectedClass.class_id,
        courseId: selectedClass.course_id,
        attendanceDate: selectedDate,
        attendance: attendancePayload,
      });

      setSuccess(`Updated attendance for ${attendancePayload.length} students`);

      setEditMode(false);
    } catch {
      setError("Failed to update attendance");
    } finally {
      setSaving(false);
    }
  }

  function getStudentStatus(studentId: number) {
    const record = attendanceData.find((a) => a.student_id === studentId);
    return record?.status_code || "PRESENT";
  }

  return (
    <div className="grid gap-4">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Attendance History
      </h2>

      {error ? <Toast type="error" message={error} /> : null}
      {success ? <Toast type="success" message={success} /> : null}

      <Card title="Select Class & Date">
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

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Date
              </span>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--text-h)]">
                Actions
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditMode(!editMode)}
                  disabled={!selectedClass || !selectedDate}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 text-sm font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editMode ? "Cancel" : "Edit"}
                </button>

                {editMode && (
                  <button
                    type="button"
                    onClick={saveAttendance}
                    disabled={saving}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-3 text-sm font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {selectedClass && selectedDate && (
        <Card
          title={`Attendance - ${selectedDate} (${filteredStudents.length} students)`}
        >
          {filteredStudents.length === 0 ? (
            <div className="text-sm opacity-80">
              No students found for this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => {
                    const status = getStudentStatus(student.id);

                    return (
                      <tr key={student.id}>
                        <td className="px-3 py-2">
                          {student.firstName} {student.lastName}
                        </td>

                        <td className="px-3 py-2">{status}</td>

                        <td className="px-3 py-2">
                          <select
                            value={status}
                            onChange={(e) =>
                              updateAttendance(student.id, e.target.value)
                            }
                          >
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
