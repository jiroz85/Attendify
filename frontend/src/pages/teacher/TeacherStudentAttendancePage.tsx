import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import {
  listAttendanceForStudent,
  getStudentStats,
} from "../../services/attendance";
import type { AttendanceRow, StudentStats } from "../../services/attendance";

export function TeacherStudentAttendancePage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const [attendanceData, statsData] = await Promise.all([
          listAttendanceForStudent(Number(studentId)),
          getStudentStats(Number(studentId)),
        ]);
        if (!cancelled) {
          setAttendance(attendanceData);
          setStats(statsData);
        }
      } catch {
        if (!cancelled) setError("Failed to load student attendance data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  function getStatusColor(status: string) {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "LATE":
        return "bg-yellow-100 text-yellow-800";
      case "EXCUSED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function exportToCSV() {
    if (attendance.length === 0) return;

    const headers = ["Date", "Course", "Status", "Marked By", "Created At"];
    const csvContent = [
      headers.join(","),
      ...attendance.map((record) =>
        [
          record.date,
          `${record.course.code} - ${record.course.title}`,
          record.status,
          `Teacher #${record.markedBy}`,
          record.createdAt,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student_${studentId || "unknown"}_attendance.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  if (!studentId) {
    return (
      <div className="grid gap-4">
        <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
          Student Attendance History
        </h2>
        <Card>
          <div className="text-sm opacity-80">Student ID not provided.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
          Student Attendance History
        </h2>
        <button
          type="button"
          onClick={exportToCSV}
          disabled={loading || attendance.length === 0}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 text-sm font-semibold text-[var(--text-h)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export CSV
        </button>
      </div>

      {error ? <Toast type="error" message={error} /> : null}

      {loading ? (
        <Card>
          <div>Loading...</div>
        </Card>
      ) : (
        <>
          {stats && (
            <Card title="Attendance Statistics">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--text-h)]">
                    {stats.attendance_percentage}%
                  </div>
                  <div className="text-sm opacity-80">Attendance Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.present}
                  </div>
                  <div className="text-sm opacity-80">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.absent}
                  </div>
                  <div className="text-sm opacity-80">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.late}
                  </div>
                  <div className="text-sm opacity-80">Late</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.excused}
                  </div>
                  <div className="text-sm opacity-80">Excused</div>
                </div>
              </div>
            </Card>
          )}

          <Card title={`Attendance Records (${attendance.length})`}>
            {attendance.length === 0 ? (
              <div className="text-sm opacity-80">
                No attendance records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0 text-sm">
                  <thead>
                    <tr className="text-left text-[var(--text-h)]">
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Date
                      </th>
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Course
                      </th>
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Status
                      </th>
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Marked By
                      </th>
                      <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id}>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <div className="font-semibold text-[var(--text-h)]">
                            {record.course.code}
                          </div>
                          <div className="text-xs opacity-80">
                            {record.course.title}
                          </div>
                        </td>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              record.status,
                            )}`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <div className="text-sm opacity-80">
                            Teacher #{record.markedBy}
                          </div>
                        </td>
                        <td className="border-b border-[var(--border)] px-3 py-2">
                          <div className="text-sm opacity-80">
                            {new Date(record.createdAt).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
