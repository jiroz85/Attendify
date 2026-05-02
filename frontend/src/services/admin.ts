import { api } from "./api";

export interface Department {
  id: number;
  name: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  sort_order: number | null;
  is_active: number;
}

export interface Section {
  id: number;
  name: string;
}

export interface Class {
  id: number;
  is_active: number;
  department: string;
  academic_year: string;
  section: string;
  department_id: number;
  academic_year_id: number;
  section_id: number;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  is_active: number;
  department: string;
  department_id: number;
}

export interface ClassCourse {
  class_id: number;
  course_id: number;
  code: string;
  title: string;
}

export interface Teacher {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status_code: string;
  employee_number: string | null;
  department_id: number | null;
}

export interface Student {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status_code: string;
  student_number: string | null;
  class_id: number | null;
}

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  course_id: number;
  teacher_email: string;
  teacher_first_name: string | null;
  teacher_last_name: string | null;
  course_code: string;
  course_title: string;
  department_name: string;
  academic_year_name: string;
  section_name: string;
}

export async function getDepartments(): Promise<Department[]> {
  const res = await api.get<Department[]>("/admin/departments");
  return res.data;
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
  const res = await api.get<AcademicYear[]>("/admin/academic-years");
  return res.data;
}

export async function getSections(): Promise<Section[]> {
  const res = await api.get<Section[]>("/admin/sections");
  return res.data;
}

export async function createAcademicYear(params: {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/academic-years", params);
  return res.data;
}

export async function createSection(params: {
  name: string;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/sections", params);
  return res.data;
}

export async function getClasses(): Promise<Class[]> {
  const res = await api.get<Class[]>("/admin/classes");
  return res.data;
}

export async function getCourses(): Promise<Course[]> {
  const res = await api.get<Course[]>("/admin/courses");
  return res.data;
}

export async function createDepartment(params: {
  name: string;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/departments", params);
  return res.data;
}

export async function createClass(params: {
  departmentId: number;
  academicYearId: number;
  sectionId: number;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/classes", params);
  return res.data;
}

export async function createCourse(params: {
  departmentId: number;
  code: string;
  title: string;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/courses", params);
  return res.data;
}

export async function getTeachers(): Promise<Teacher[]> {
  const res = await api.get<Teacher[]>("/admin/teachers");
  return res.data;
}

export async function getStudents(): Promise<Student[]> {
  const res = await api.get<Student[]>("/admin/students");
  return res.data;
}

export async function createTeacher(params: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeNumber: string;
  departmentId?: number;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/teachers", params);
  return res.data;
}

export async function createStudent(params: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  studentNumber: string;
  classId: number;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>("/admin/students", params);
  return res.data;
}

export async function getClassCourses(classId: number): Promise<ClassCourse[]> {
  const res = await api.get<ClassCourse[]>(`/admin/classes/${classId}/courses`);
  return res.data;
}

export async function addCourseToClass(params: {
  classId: number;
  courseId: number;
}): Promise<{ status: "ok" }> {
  const res = await api.post<{ status: "ok" }>("/admin/class-courses", params);
  return res.data;
}

export async function removeCourseFromClass(params: {
  classId: number;
  courseId: number;
}): Promise<{ status: "ok"; affected: number }> {
  const res = await api.delete<{ status: "ok"; affected: number }>(
    `/admin/classes/${params.classId}/courses/${params.courseId}`,
  );
  return res.data;
}

export async function getTeacherAssignments(): Promise<TeacherAssignment[]> {
  const res = await api.get<TeacherAssignment[]>("/admin/teacher-assignments");
  return res.data;
}

export async function addTeacherAssignment(params: {
  teacherId: number;
  classId: number;
  courseId: number;
}): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>(
    "/admin/teacher-assignments",
    params,
  );
  return res.data;
}

export async function removeTeacherAssignment(
  id: number,
): Promise<{ status: "ok"; affected: number }> {
  const res = await api.delete<{ status: "ok"; affected: number }>(
    `/admin/teacher-assignments/${id}`,
  );
  return res.data;
}

export interface AttendanceStats {
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
  total_students: number;
  total_dates: number;
}

export async function getAttendanceStats(): Promise<AttendanceStats> {
  const res = await api.get<AttendanceStats>("/attendance/admin/stats");
  return res.data;
}

export async function updateTeacher(params: {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeNumber: string;
  departmentId?: number;
}): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>("/admin/teachers", params);
  return res.data;
}

export async function updateStudent(params: {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  studentNumber: string;
  classId?: number;
}): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>("/admin/students", params);
  return res.data;
}

export async function deleteTeacher(id: number): Promise<{ status: "ok" }> {
  const res = await api.delete<{ status: "ok" }>(`/admin/teachers/${id}`);
  return res.data;
}

export async function deleteStudent(id: number): Promise<{ status: "ok" }> {
  const res = await api.delete<{ status: "ok" }>(`/admin/students/${id}`);
  return res.data;
}

export async function resetTeacherPassword(params: {
  id: number;
  password: string;
}): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(
    "/admin/teachers/password",
    params,
  );
  return res.data;
}

export async function resetStudentPassword(params: {
  id: number;
  password: string;
}): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(
    "/admin/students/password",
    params,
  );
  return res.data;
}

export async function deactivateTeacher(id: number): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(
    `/admin/teachers/${id}/deactivate`,
  );
  return res.data;
}

export async function activateTeacher(id: number): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(`/admin/teachers/${id}/activate`);
  return res.data;
}

export async function deactivateStudent(id: number): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(
    `/admin/students/${id}/deactivate`,
  );
  return res.data;
}

export async function activateStudent(id: number): Promise<{ status: "ok" }> {
  const res = await api.put<{ status: "ok" }>(`/admin/students/${id}/activate`);
  return res.data;
}
