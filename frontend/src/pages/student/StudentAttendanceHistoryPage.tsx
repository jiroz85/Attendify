import { useEffect, useMemo, useState } from "react";
import { Toast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import type { AttendanceRow } from "../../services/attendance";
import { listAttendanceForStudent } from "../../services/attendance";
import { getStudentClassInfo } from "../../services/student";

type CourseInfo = {
  id: number;
  code: string;
  title: string;
  attendanceCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
};

export function StudentAttendanceHistoryPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const [attendanceData, classData] = await Promise.all([
          listAttendanceForStudent(user.id),
          getStudentClassInfo(),
        ]);

        if (!cancelled) {
          setRows(attendanceData);

          // Extract all courses from class data
          const allCourses = classData.flatMap((cls) => cls.courses);

          // Calculate attendance stats for each course
          const coursesWithStats = allCourses.map((course) => {
            const courseAttendance = attendanceData.filter(
              (row) => row.courseId === course.id,
            );
            const stats = {
              id: course.id,
              code: course.code,
              title: course.title,
              attendanceCount: courseAttendance.length,
              presentCount: courseAttendance.filter(
                (row) => row.status === "PRESENT",
              ).length,
              absentCount: courseAttendance.filter(
                (row) => row.status === "ABSENT",
              ).length,
              lateCount: courseAttendance.filter((row) => row.status === "LATE")
                .length,
              excusedCount: courseAttendance.filter(
                (row) => row.status === "EXCUSED",
              ).length,
            };
            return stats;
          });

          setCourses(coursesWithStats);
        }
      } catch {
        if (!cancelled) setError("Failed to load attendance history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const selectedCourseAttendance = useMemo(() => {
    if (!selectedCourse) return [];
    return rows.filter((row) => row.courseId === selectedCourse.id);
  }, [rows, selectedCourse]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "text-green-600 bg-green-50";
      case "ABSENT":
        return "text-red-600 bg-red-50";
      case "LATE":
        return "text-yellow-600 bg-yellow-50";
      case "EXCUSED":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getAttendancePercentage = (course: CourseInfo) => {
    if (course.attendanceCount === 0) return 0;
    return Math.round(
      ((course.presentCount + course.excusedCount) / course.attendanceCount) *
        100,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 grid gap-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="mt-0 text-2xl font-bold text-white uppercase tracking-wider">
          📚 Attendance History
        </h2>
        {selectedCourse && (
          <button
            onClick={() => setSelectedCourse(null)}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
            ← Back to Courses
          </button>
        )}
      </div>

      {error ? <Toast type="error" message={error} /> : null}

      {loading ? (
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <div className="text-white text-center text-lg">Loading...</div>
        </div>
      ) : selectedCourse ? (
        // Course Detail View
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white">
              {selectedCourse.code} - {selectedCourse.title}
            </h3>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="text-center p-3 bg-gray-100 rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-gray-900">
                  {getAttendancePercentage(selectedCourse)}%
                </div>
                <div className="text-sm font-medium text-gray-700 mt-1">
                  Attendance
                </div>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
                <div className="text-xl font-bold text-green-800">
                  {selectedCourse.presentCount}
                </div>
                <div className="text-sm font-medium text-green-700 mt-1">
                  Present
                </div>
              </div>
              <div className="text-center p-3 bg-red-100 rounded-lg border border-red-200">
                <div className="text-xl font-bold text-red-800">
                  {selectedCourse.absentCount}
                </div>
                <div className="text-sm font-medium text-red-700 mt-1">
                  Absent
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                <div className="text-xl font-bold text-yellow-800">
                  {selectedCourse.lateCount}
                </div>
                <div className="text-sm font-medium text-yellow-700 mt-1">
                  Late
                </div>
              </div>
              <div className="text-center p-3 bg-blue-100 rounded-lg border border-blue-200">
                <div className="text-xl font-bold text-blue-800">
                  {selectedCourse.excusedCount}
                </div>
                <div className="text-sm font-medium text-blue-700 mt-1">
                  Excused
                </div>
              </div>
            </div>
          </div>

          {selectedCourseAttendance.length === 0 ? (
            <div className="text-sm opacity-80">
              No attendance records found for this course.
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
                Complete Attendance History
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-lg">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-900 to-black border-b-4 border-black shadow-lg">
                      <th className="text-left py-4 px-6 text-base font-bold text-white uppercase tracking-wider border-r border-gray-700">
                        📅 Date
                      </th>
                      <th className="text-left py-4 px-6 text-base font-bold text-white uppercase tracking-wider border-r border-gray-700">
                        ✅ Status
                      </th>
                      <th className="text-left py-4 px-6 text-base font-bold text-white uppercase tracking-wider border-r border-gray-700">
                        👨‍🏫 Marked By
                      </th>
                      <th className="text-left py-4 px-6 text-base font-bold text-white uppercase tracking-wider">
                        ⏰ Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCourseAttendance
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime(),
                      )
                      .map((attendance) => (
                        <tr
                          key={attendance.id}
                          className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="text-sm font-bold text-gray-900">
                              {new Date(attendance.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(
                                attendance.status,
                              )}`}
                            >
                              {attendance.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              Teacher ID: {attendance.markedBy}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(
                                attendance.createdAt,
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              {new Date(
                                attendance.createdAt,
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Statistics */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Summary Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present: {selectedCourse.presentCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent: {selectedCourse.absentCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Late: {selectedCourse.lateCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Excused: {selectedCourse.excusedCount}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Total Sessions: {selectedCourse.attendanceCount} | Attendance
                  Rate: {getAttendancePercentage(selectedCourse)}%
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Courses List View
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <div className="text-white text-center text-lg">
                No courses found.
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-600 shadow-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {course.code} - {course.title}
                      </h3>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span className="text-green-400 font-semibold">
                          {course.presentCount} present
                        </span>
                        <span className="text-red-400 font-semibold">
                          {course.absentCount} absent
                        </span>
                        <span className="text-yellow-400 font-semibold">
                          {course.lateCount} late
                        </span>
                        <span className="text-blue-400 font-semibold">
                          {course.excusedCount} excused
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">
                        {getAttendancePercentage(course)}%
                      </div>
                      <div className="text-sm text-gray-300 font-medium">
                        Attendance
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
