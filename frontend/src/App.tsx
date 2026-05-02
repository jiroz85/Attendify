import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { HomeRedirect } from "./pages/HomeRedirect";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { CreateAcademicYearPage } from "./pages/admin/CreateAcademicYearPage";
import { CreateClassPage } from "./pages/admin/CreateClassPage";
import { CreateCoursePage } from "./pages/admin/CreateCoursePage";
import { CreateDepartmentPage } from "./pages/admin/CreateDepartmentPage";
import { CreateSectionPage } from "./pages/admin/CreateSectionPage";
import { CreateStudentPage } from "./pages/admin/CreateStudentPage";
import { CreateTeacherPage } from "./pages/admin/CreateTeacherPage";
import { ManageClassCoursesPage } from "./pages/admin/ManageClassCoursesPage";
import { ManageStudentsPage } from "./pages/admin/ManageStudentsPage";
import { ManageTeacherAssignmentsPage } from "./pages/admin/ManageTeacherAssignmentsPage";
import { ManageTeachersPage } from "./pages/admin/ManageTeachersPage";
import { StudentAttendanceHistoryPage } from "./pages/student/StudentAttendanceHistoryPage";
import { StudentAttendancePercentagePage } from "./pages/student/StudentAttendancePercentagePage";
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { TeacherAttendancePage } from "./pages/teacher/TeacherAttendancePage";
import { TeacherAttendanceHistoryPage } from "./pages/teacher/TeacherAttendanceHistoryPage";
import { TeacherAttendanceReportsPage } from "./pages/teacher/TeacherAttendanceReportsPage";
import { TeacherClassesPage } from "./pages/teacher/TeacherClassesPage";
import { TeacherDashboardPage } from "./pages/teacher/TeacherDashboardPage";
import { TeacherProfilePage } from "./pages/teacher/TeacherProfilePage";
import { TeacherStudentsPage } from "./pages/teacher/TeacherStudentsPage";
import { TeacherStudentAttendancePage } from "./pages/teacher/TeacherStudentAttendancePage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<RoleRoute allow={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route
              path="/admin/departments"
              element={<CreateDepartmentPage />}
            />
            <Route
              path="/admin/academic-years"
              element={<CreateAcademicYearPage />}
            />
            <Route path="/admin/sections" element={<CreateSectionPage />} />
            <Route path="/admin/classes" element={<CreateClassPage />} />
            <Route path="/admin/courses" element={<CreateCoursePage />} />
            <Route
              path="/admin/class-courses"
              element={<ManageClassCoursesPage />}
            />
            <Route path="/admin/teachers" element={<CreateTeacherPage />} />
            <Route
              path="/admin/manage-teachers"
              element={<ManageTeachersPage />}
            />
            <Route path="/admin/students" element={<CreateStudentPage />} />
            <Route
              path="/admin/manage-students"
              element={<ManageStudentsPage />}
            />
            <Route
              path="/admin/teacher-assignments"
              element={<ManageTeacherAssignmentsPage />}
            />
          </Route>

          <Route element={<RoleRoute allow={["TEACHER"]} />}>
            <Route path="/teacher" element={<TeacherDashboardPage />} />
            <Route path="/teacher/profile" element={<TeacherProfilePage />} />
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/students" element={<TeacherStudentsPage />} />
            <Route
              path="/teacher/attendance"
              element={<TeacherAttendancePage />}
            />
            <Route
              path="/teacher/attendance/history"
              element={<TeacherAttendanceHistoryPage />}
            />
            <Route
              path="/teacher/attendance/reports"
              element={<TeacherAttendanceReportsPage />}
            />
            <Route
              path="/teacher/students/:studentId/attendance"
              element={<TeacherStudentAttendancePage />}
            />
          </Route>

          <Route element={<RoleRoute allow={["STUDENT"]} />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />
            <Route
              path="/student/attendance"
              element={<StudentAttendanceHistoryPage />}
            />
            <Route
              path="/student/percentage"
              element={<StudentAttendancePercentagePage />}
            />
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
