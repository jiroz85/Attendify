import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import { Toast } from "../../components/Toast";
import {
  getTeacherClassReports,
  getTeacherStudentReports,
} from "../../services/attendance";
import type { ClassReport, StudentReport } from "../../services/attendance";

export function TeacherAttendanceReportsPage() {
  const [classReports, setClassReports] = useState<ClassReport[]>([]);
  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<"class" | "student">(
    "class",
  );
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        // No-op: this page doesn't currently need classData/students on mount.
      } catch {
        if (!cancelled) setError("Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch report data when date range or report type changes
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        if (selectedReport === "class") {
          const reports = await getTeacherClassReports(
            dateRange.start || undefined,
            dateRange.end || undefined,
          );
          if (!cancelled) setClassReports(reports);
        } else {
          const reports = await getTeacherStudentReports(
            dateRange.start || undefined,
            dateRange.end || undefined,
          );
          if (!cancelled) setStudentReports(reports);
        }
      } catch {
        if (!cancelled) setError("Failed to load report data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedReport, dateRange]);

  function exportClassReports() {
    const headers = [
      "Class Name",
      "Course",
      "Total Sessions",
      "Average Attendance %",
      "Present",
      "Absent",
      "Late",
      "Excused",
    ];
    const csvContent = [
      headers.join(","),
      ...classReports.map((report) =>
        [
          report.className,
          report.courseName,
          report.totalSessions,
          report.averageAttendance,
          report.presentCount,
          report.absentCount,
          report.lateCount,
          report.excusedCount,
        ].join(","),
      ),
    ].join("\n");

    downloadCSV(csvContent, "class_attendance_report.csv");
  }

  function exportStudentReports() {
    const headers = [
      "Student Name",
      "Student Number",
      "Attendance Rate %",
      "Total Sessions",
      "Present",
      "Absent",
      "Late",
      "Excused",
      "Trend",
    ];
    const csvContent = [
      headers.join(","),
      ...studentReports.map((report) =>
        [
          report.studentName,
          report.studentNumber,
          report.attendanceRate,
          report.totalSessions,
          report.presentCount,
          report.absentCount,
          report.lateCount,
          report.excusedCount,
          report.trend,
        ].join(","),
      ),
    ].join("\n");

    downloadCSV(csvContent, "student_attendance_report.csv");
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function getTrendColor(trend: string) {
    switch (trend) {
      case "improving":
        return "text-green-600";
      case "declining":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case "improving":
        return "↗️";
      case "declining":
        return "↘️";
      default:
        return "→";
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
          Attendance Reports & Analytics
        </h2>
      </div>

      {error ? <Toast type="error" message={error} /> : null}

      <Card title="Report Options">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Report Type
            </span>
            <select
              value={selectedReport}
              onChange={(e) =>
                setSelectedReport(e.target.value as "class" | "student")
              }
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
            >
              <option value="class">Class Reports</option>
              <option value="student">Student Reports</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              Start Date
            </span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--text-h)]">
              End Date
            </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)]"
            />
          </label>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div>Loading reports...</div>
        </Card>
      ) : selectedReport === "class" ? (
        <Card
          title="Class Attendance Reports"
          right={
            <button
              type="button"
              onClick={exportClassReports}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 text-sm font-semibold text-[var(--text-h)] hover:brightness-110"
            >
              Export CSV
            </button>
          }
        >
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
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Sessions
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Attendance Rate
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Present
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Absent
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Late
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Excused
                  </th>
                </tr>
              </thead>
              <tbody>
                {classReports.map((report) => (
                  <tr key={`${report.classId}-${report.courseId}`}>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {report.className}
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="text-sm">{report.courseName}</div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      {report.totalSessions}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${report.averageAttendance}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {report.averageAttendance}%
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-green-600">
                      {report.presentCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-red-600">
                      {report.absentCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-yellow-600">
                      {report.lateCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-blue-600">
                      {report.excusedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card
          title="Student Attendance Reports"
          right={
            <button
              type="button"
              onClick={exportStudentReports}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-bg)] px-4 text-sm font-semibold text-[var(--text-h)] hover:brightness-110"
            >
              Export CSV
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-[var(--text-h)]">
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Student
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Student #
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Attendance Rate
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Sessions
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Present
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Absent
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Late
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Excused
                  </th>
                  <th className="whitespace-nowrap border-b border-[var(--border)] px-3 py-2 font-semibold">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentReports.map((report) => (
                  <tr key={report.studentId}>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="font-semibold text-[var(--text-h)]">
                        {report.studentName}
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      {report.studentNumber}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              report.attendanceRate >= 80
                                ? "bg-green-600"
                                : report.attendanceRate >= 60
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }`}
                            style={{ width: `${report.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {report.attendanceRate}%
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      {report.totalSessions}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-green-600">
                      {report.presentCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-red-600">
                      {report.absentCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-yellow-600">
                      {report.lateCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2 text-blue-600">
                      {report.excusedCount}
                    </td>
                    <td className="border-b border-[var(--border)] px-3 py-2">
                      <span
                        className={`flex items-center gap-1 ${getTrendColor(report.trend)}`}
                      >
                        <span>{getTrendIcon(report.trend)}</span>
                        <span className="text-sm capitalize">
                          {report.trend}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
