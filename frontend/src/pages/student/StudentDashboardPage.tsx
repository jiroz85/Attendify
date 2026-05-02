import { useEffect, useState, useContext, useCallback } from "react";
import { Card } from "../../components/Card";
import { StatsCardSkeleton } from "../../components/LoadingSkeleton";
import { getStudentStats } from "../../services/attendance";
import {
  getStudentProfile,
  getStudentClassInfo,
  getStudentRecentAttendance,
} from "../../services/student";
import type { StudentStats } from "../../services/attendance";
import type {
  StudentProfile,
  StudentClassInfo,
  RecentAttendance,
} from "../../services/student";
import { AuthContext } from "../../context/AuthContext";
import {
  getAttendanceStatusBadgeColor,
  getAttendancePerformanceColor,
  getAttendancePerformanceBgColor,
  getAttendancePerformanceMessage,
  formatAttendanceDate,
} from "../../utils/attendance";

type DashboardError = {
  message: string;
  type: "auth" | "network" | "unknown";
};

type LoadingState = "idle" | "loading" | "success" | "error";

export function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [classes, setClasses] = useState<StudentClassInfo[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendance[]>(
    [],
  );

  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<DashboardError | null>(null);
  const auth = useContext(AuthContext);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoadingState("loading");
      setError(null);

      // Validate authentication and role
      if (!auth?.isAuthenticated || !auth.user || auth.role !== "STUDENT") {
        setError({
          message:
            "Access denied. Only students can view their attendance dashboard.",
          type: "auth",
        });
        return;
      }

      const userId = auth.user.id;

      // Fetch all dashboard data in parallel with timeout
      const [userStats, userProfile, userClasses, userRecentAttendance] =
        await Promise.all([
          getStudentStats(userId),
          getStudentProfile(),
          getStudentClassInfo(),
          getStudentRecentAttendance(5),
        ]);

      setStats(userStats);
      setProfile(userProfile);
      setClasses(userClasses);
      setRecentAttendance(userRecentAttendance);
      setLoadingState("success");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError({
        message: errorMessage,
        type: "network",
      });
      console.error("Error fetching student dashboard data:", err);
      setLoadingState("error");
    }
  }, [auth]);

  useEffect(() => {
    const fetchData = async () => {
      if (auth?.isAuthenticated && loadingState === "idle") {
        await fetchDashboardData();
      }
    };

    fetchData().catch(console.error);
  }, [auth?.isAuthenticated, fetchDashboardData, loadingState]);

  return (
    <main className="grid gap-4" role="main" aria-label="Student Dashboard">
      <header>
        <h1 className="m-0 text-xl font-semibold text-[var(--text-h)]">
          Student Dashboard
        </h1>
      </header>

      {error && (
        <div
          className="p-3 border border-red-200 bg-red-50 rounded-lg text-red-700 text-sm"
          role="alert"
          aria-live="polite"
        >
          <strong>Error: </strong>
          {error.message}
          {error.type === "auth" && (
            <button
              className="ml-2 text-red-600 underline text-xs"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          )}
        </div>
      )}

      {loadingState === "loading" && (
        <section
          className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50"
          aria-label="Loading user profile"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="animate-pulse" aria-hidden="true">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="animate-pulse" aria-hidden="true">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {loadingState !== "loading" && profile && (
        <section className="p-4 border rounded-lg" aria-label="Welcome message">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-h)]">
                Welcome, {profile.firstName || "Student"}!
              </h2>
              <div className="text-sm opacity-80 mt-1">
                {profile.studentNumber &&
                  `Student ID: ${profile.studentNumber}`}
                {profile.studentNumber && profile.className && " • "}
                {profile.className}
              </div>
            </div>
            <div className="text-right">
              <div
                className="text-2xl font-bold text-blue-600"
                aria-label={`Overall attendance: ${stats?.attendance_percentage || 0}%`}
              >
                {stats?.attendance_percentage || 0}%
              </div>
              <div className="text-xs opacity-80">Overall Attendance</div>
            </div>
          </div>
        </section>
      )}
      <section aria-label="Attendance statistics">
        <div className="grid gap-3 md:grid-cols-4">
          {loadingState === "loading" ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <Card title="Attendance %">
                <div
                  className="text-3xl font-bold text-[var(--text-h)]"
                  aria-label={`Attendance percentage: ${stats?.attendance_percentage || 0}%`}
                >
                  {stats?.attendance_percentage || 0}%
                </div>
                <div className="mt-1 text-sm opacity-80">
                  Based on {stats?.total_sessions || 0} total sessions
                </div>
              </Card>

              <Card title="Present">
                <div
                  className="text-3xl font-bold text-green-600"
                  aria-label={`Present days: ${stats?.present || 0}`}
                >
                  {stats?.present || 0}
                </div>
                <div className="mt-1 text-sm opacity-80">Days present</div>
              </Card>

              <Card title="Absent/Late">
                <div
                  className="text-3xl font-bold text-red-600"
                  aria-label={`Absent and late days: ${(stats?.absent || 0) + (stats?.late || 0)}`}
                >
                  {(stats?.absent || 0) + (stats?.late || 0)}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  {stats?.absent || 0} absent, {stats?.late || 0} late
                </div>
              </Card>

              <Card title="Excused">
                <div
                  className="text-3xl font-bold text-blue-600"
                  aria-label={`Excused days: ${stats?.excused || 0}`}
                >
                  {stats?.excused || 0}
                </div>
                <div className="mt-1 text-sm opacity-80">Excused days</div>
              </Card>
            </>
          )}
        </div>
      </section>

      {loadingState !== "loading" && (stats || profile) && (
        <section aria-label="Detailed attendance information">
          <div className="grid gap-4 mt-6">
            <div className="grid gap-3 md:grid-cols-3">
              <article className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Attendance Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Present:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {stats?.present || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Absent:</span>
                    <span className="text-sm font-semibold text-red-600">
                      {stats?.absent || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Late:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {stats?.late || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Excused:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {stats?.excused || 0}
                    </span>
                  </div>
                </div>
              </article>

              <article className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Your Classes</h3>
                <div className="space-y-2">
                  {classes.length > 0 ? (
                    classes.slice(0, 3).map((cls) => (
                      <div key={cls.id} className="text-sm">
                        <div className="font-medium">{cls.className}</div>
                        <div className="text-xs opacity-80">
                          {cls.courses.length} course
                          {cls.courses.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm opacity-60">
                      No classes assigned
                    </div>
                  )}
                  {classes.length > 3 && (
                    <div className="text-xs text-blue-600 font-medium">
                      +{classes.length - 3} more class
                      {classes.length - 3 !== 1 ? "es" : ""}
                    </div>
                  )}
                </div>
              </article>

              <article className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Recent Attendance</h3>
                <div className="space-y-2">
                  {recentAttendance.length > 0 ? (
                    recentAttendance.slice(0, 5).map((attendance) => (
                      <div
                        key={attendance.id}
                        className="flex justify-between items-center p-2 rounded border bg-gray-50/50"
                      >
                        <div>
                          <div className="font-medium text-xs text-gray-700 mb-1">
                            {formatAttendanceDate(attendance.date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-xs text-blue-600">
                              {attendance.courseCode}
                            </div>
                            {attendance.courseTitle && (
                              <div className="text-xs text-gray-600">
                                {attendance.courseTitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceStatusBadgeColor(
                            attendance.status,
                          )}`}
                        >
                          {attendance.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm opacity-60">
                      No recent attendance
                    </div>
                  )}
                </div>
              </article>
            </div>

            {stats && (
              <article className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Performance Overview</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Total Sessions:</span>
                      <span className="text-sm font-semibold">
                        {stats.total_sessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Attendance Rate:</span>
                      <span
                        className={`text-sm font-semibold ${getAttendancePerformanceColor(
                          stats.attendance_percentage,
                        )}`}
                      >
                        {stats.attendance_percentage}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getAttendancePerformanceBgColor(
                          stats.attendance_percentage,
                        )}`}
                        style={{ width: `${stats.attendance_percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-1 opacity-80">
                      {getAttendancePerformanceMessage(
                        stats.attendance_percentage,
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
