import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/Card";
import {
  listTeacherClasses,
  listTeacherStudents,
  getTeacherTodayAttendance,
} from "../../services/teacher";
import type { TeacherClass, TeacherStudent } from "../../services/teacher";
import { useRefreshOnFocus } from "../../hooks/useRefreshOnFocus";

export function TeacherDashboardPage() {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [classData, studentData, attendanceData] = await Promise.all([
        listTeacherClasses(),
        listTeacherStudents(),
        getTeacherTodayAttendance(),
      ]);
      setClasses(classData);
      setStudents(studentData);
      setAttendanceCount(attendanceData.count);
    } catch (error) {
      console.error("Failed to fetch teacher data:", error);
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
    <div className="grid gap-4">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Teacher Dashboard
      </h2>
      <div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-3 text-sm font-semibold text-[var(--text-h)] hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Assigned Classes">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : classes.length}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : classes.length === 1
                ? "Class"
                : "Classes"}
          </div>
        </Card>
        <Card title="Students">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : students.length}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : students.length === 1
                ? "Student"
                : "Students"}
          </div>
        </Card>
        <Card title="Attendance Taken (Today)">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : attendanceCount}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : attendanceCount === 1
                ? "Session"
                : "Sessions"}
          </div>
        </Card>
      </div>

      {/* Additional details section */}
      {!loading && (
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Your Classes</h3>
              <div className="space-y-1">
                {classes.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="text-sm">
                    {cls.departmentName} - {cls.sectionName}
                  </div>
                ))}
                {classes.length === 0 && (
                  <div className="text-sm opacity-60">No classes assigned</div>
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Recent Students</h3>
              <div className="space-y-1">
                {students.slice(0, 3).map((student) => (
                  <div key={student.id} className="text-sm">
                    {student.firstName} {student.lastName}
                  </div>
                ))}
                {students.length === 0 && (
                  <div className="text-sm opacity-60">No students found</div>
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Today's Activity</h3>
              <div className="space-y-1">
                <div className="text-sm">
                  Attendance sessions: {attendanceCount}
                </div>
                <div className="text-sm opacity-60">
                  {attendanceCount === 0
                    ? "No attendance taken today"
                    : "Keep up the great work!"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
