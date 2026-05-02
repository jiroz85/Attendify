import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import {
  getDepartments,
  getClasses,
  getCourses,
  getAttendanceStats,
  getTeachers,
  getStudents,
} from "../../services/admin";
import type {
  Class,
  Course,
  Department,
  AttendanceStats,
} from "../../services/admin";

export function AdminDashboardPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendanceStats, setAttendanceStats] =
    useState<AttendanceStats | null>(null);
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          deptData,
          classData,
          courseData,
          statsData,
          teachersData,
          studentsData,
        ] = await Promise.all([
          getDepartments(),
          getClasses(),
          getCourses(),
          getAttendanceStats(),
          getTeachers(),
          getStudents(),
        ]);
        setDepartments(deptData);
        setClasses(classData);
        setCourses(courseData);
        setAttendanceStats(statsData);
        setTeacherCount(teachersData.length);
        setStudentCount(studentsData.length);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="grid gap-4">
      <h2 className="m-0 text-xl font-semibold text-[var(--text-h)]">
        Admin Dashboard
      </h2>

      <Card title="Setup Checklist">
        <div className="grid gap-2 text-sm">
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/departments">
              Create Department
            </Link>
            <span className="opacity-80"> (e.g. Software)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/academic-years">
              Create Academic Year
            </Link>
            <span className="opacity-80"> (e.g. 2024-2025)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/sections">
              Create Section
            </Link>
            <span className="opacity-80"> (e.g. A)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/classes">
              Create Class
            </Link>
            <span className="opacity-80"> (Software / 2024-2025 / A)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/courses">
              Create Course
            </Link>
            <span className="opacity-80"> (e.g. CS101)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/class-courses">
              Assign Course To Class
            </Link>
            <span className="opacity-80"> (Class A has CS101)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/teachers">
              Create Teacher
            </Link>
            <span className="opacity-80"> (e.g. John)</span>
          </div>
          <div>
            <Link className="text-[var(--text-h)]" to="/admin/students">
              Create Students
            </Link>
            <span className="opacity-80"> (and assign them to Class A)</span>
          </div>
          <div>
            <Link
              className="text-[var(--text-h)]"
              to="/admin/teacher-assignments"
            >
              Assign Teacher
            </Link>
            <span className="opacity-80"> (John teaches Class A + CS101)</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Overall Attendance">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : `${attendanceStats?.attendance_percentage || 0}%`}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading ? "Loading..." : "Attendance Rate"}
          </div>
        </Card>
        <Card title="Total Sessions">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : attendanceStats?.total_sessions || 0}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading ? "Loading..." : "Attendance Records"}
          </div>
        </Card>
        <Card title="Students">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : studentCount}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : studentCount === 1
                ? "Student"
                : "Students"}
          </div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card title="Present">
          <div className="text-2xl font-bold text-green-600">
            {loading ? "--" : attendanceStats?.present || 0}
          </div>
          <div className="mt-1 text-sm opacity-80">Present</div>
        </Card>
        <Card title="Absent">
          <div className="text-2xl font-bold text-red-600">
            {loading ? "--" : attendanceStats?.absent || 0}
          </div>
          <div className="mt-1 text-sm opacity-80">Absent</div>
        </Card>
        <Card title="Late">
          <div className="text-2xl font-bold text-yellow-600">
            {loading ? "--" : attendanceStats?.late || 0}
          </div>
          <div className="mt-1 text-sm opacity-80">Late</div>
        </Card>
        <Card title="Excused">
          <div className="text-2xl font-bold text-blue-600">
            {loading ? "--" : attendanceStats?.excused || 0}
          </div>
          <div className="mt-1 text-sm opacity-80">Excused</div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card title="Departments">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : departments.length}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : departments.length === 1
                ? "Department"
                : "Departments"}
          </div>
        </Card>
        <Card title="Classes">
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
        <Card title="Teachers">
          <div className="text-3xl font-bold text-[var(--text-h)]">
            {loading ? "--" : teacherCount}
          </div>
          <div className="mt-1 text-sm opacity-80">
            {loading
              ? "Loading..."
              : teacherCount === 1
                ? "Teacher"
                : "Teachers"}
          </div>
        </Card>
      </div>

      {/* Additional details section */}
      {!loading && (
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Recent Departments</h3>
              <div className="space-y-1">
                {departments.slice(0, 3).map((dept) => (
                  <div key={dept.id} className="text-sm">
                    {dept.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Recent Classes</h3>
              <div className="space-y-1">
                {classes.slice(0, 3).map((cls) => (
                  <div key={cls.id} className="text-sm">
                    {cls.department} - {cls.section}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Recent Courses</h3>
              <div className="space-y-1">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="text-sm">
                    {course.code}: {course.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Attendance Summary</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Total Students with Attendance:</span>
                <span className="font-medium">
                  {attendanceStats?.total_students || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Attendance Dates:</span>
                <span className="font-medium">
                  {attendanceStats?.total_dates || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Sessions Recorded:</span>
                <span className="font-medium">
                  {attendanceStats?.total_sessions || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
