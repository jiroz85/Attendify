import { api } from "./api";

export type StudentProfile = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  studentNumber: string | null;
  classId: number | null;
  className: string | null;
  departmentName: string | null;
  academicYearName: string | null;
  sectionName: string | null;
};

export type StudentClassInfo = {
  id: number;
  className: string;
  departmentName: string;
  academicYearName: string;
  sectionName: string;
  courses: Array<{
    id: number;
    code: string;
    title: string;
  }>;
};

export type RecentAttendance = {
  id: number;
  date: string;
  courseCode: string;
  courseTitle: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  markedBy: number;
  createdAt: string;
};

export async function getStudentProfile(): Promise<StudentProfile> {
  const res = await api.get<StudentProfile>("/student/profile");
  return res.data;
}

export async function getStudentClassInfo(): Promise<StudentClassInfo[]> {
  const res = await api.get<StudentClassInfo[]>("/student/classes");
  return res.data;
}

export async function getStudentRecentAttendance(
  limit: number = 5,
): Promise<RecentAttendance[]> {
  const res = await api.get<RecentAttendance[]>(
    `/student/attendance/recent?limit=${limit}`,
  );
  return res.data;
}
