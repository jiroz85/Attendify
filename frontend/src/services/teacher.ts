import { api } from "./api";

export type TeacherClass = {
  id: number;
  departmentId: number;
  academicYearId: number;
  sectionId: number;
  departmentName: string;
  academicYearName: string;
  sectionName: string;
};

export type TeacherStudent = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  studentNumber: string | null;
  classId: number;
};

export async function listTeacherClasses(): Promise<TeacherClass[]> {
  const res = await api.get<TeacherClass[]>("/teacher/classes");
  return res.data;
}

export async function listTeacherStudents(): Promise<TeacherStudent[]> {
  const res = await api.get<TeacherStudent[]>("/teacher/students");
  return res.data;
}

export async function getTeacherTodayAttendance(): Promise<{ count: number }> {
  const res = await api.get<{ count: number }>("/teacher/attendance/today");
  return res.data;
}

export type TeacherAssignmentSlim = {
  class_id: number;
  department_name: string;
  academic_year_name: string;
  section_name: string;
  course_id: number;
  course_code: string;
  course_title: string;
};

export type TeacherProfile = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  employee_number: string | null;
  department_id: number | null;
  department_name: string | null;
  assignments: TeacherAssignmentSlim[];
};

export async function getTeacherProfile(): Promise<TeacherProfile> {
  const res = await api.get<TeacherProfile>("/teacher/profile");
  return res.data;
}
