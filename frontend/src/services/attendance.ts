import { api } from "./api";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AttendanceRow = {
  id: number;
  studentId: number;
  courseId: number;
  classId: number;
  date: string;
  status: AttendanceStatus;
  markedBy: number;
  createdAt: string;
  updatedAt: string;
  course: { code: string; title: string };
};

export async function markAttendance(params: {
  studentId: number;
  courseId: number;
  classId: number;
  attendanceDate: string;
  statusCode: AttendanceStatus;
}): Promise<{ status: "ok" }> {
  const res = await api.post<{ status: "ok" }>("/attendance", params);
  return res.data;
}

export async function listAttendanceForStudent(
  studentId: number,
): Promise<AttendanceRow[]> {
  const res = await api.get<AttendanceRow[]>(
    `/attendance/student/${studentId}`,
  );
  return res.data;
}

export type TeacherClassData = {
  class_id: number;
  department_name: string;
  academic_year_name: string;
  section_name: string;
  course_id: number;
  course_code: string;
  course_title: string;
};

export type ClassAttendanceStudent = {
  id: number;
  student_id: number;
  status_code: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  first_name: string;
  last_name: string;
  student_number: string;
};

export async function getTeacherClassData(): Promise<TeacherClassData[]> {
  const res = await api.get<TeacherClassData[]>("/attendance/teacher/classes");
  return res.data;
}

export async function getClassAttendance(
  classId: number,
  courseId: number,
  date: string,
): Promise<ClassAttendanceStudent[]> {
  const res = await api.get<ClassAttendanceStudent[]>(
    `/attendance/class/${classId}/date/${date}?courseId=${courseId}`,
  );
  return res.data;
}

export async function bulkMarkAttendance(params: {
  classId: number;
  courseId: number;
  attendanceDate: string;
  attendance: Array<{
    studentId: number;
    statusCode: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }>;
}): Promise<{ status: "ok"; count: number }> {
  const res = await api.post<{ status: "ok"; count: number }>(
    "/attendance/bulk",
    params,
  );
  return res.data;
}

export type StudentStats = {
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_percentage: number;
};

export async function getStudentStats(
  studentId: number,
): Promise<StudentStats> {
  const res = await api.get<StudentStats>(
    `/attendance/student/${studentId}/stats`,
  );
  return res.data;
}

export type ClassReport = {
  classId: number;
  className: string;
  courseId: number;
  courseName: string;
  totalSessions: number;
  averageAttendance: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
};

export type StudentReport = {
  studentId: number;
  studentName: string;
  studentNumber: string;
  attendanceRate: number;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  trend: "improving" | "declining" | "stable";
};

export async function getTeacherClassReports(
  startDate?: string,
  endDate?: string,
): Promise<ClassReport[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await api.get<ClassReport[]>(
    `/attendance/reports/class?${params.toString()}`,
  );
  return res.data;
}

export async function getTeacherStudentReports(
  startDate?: string,
  endDate?: string,
): Promise<StudentReport[]> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const res = await api.get<StudentReport[]>(
    `/attendance/reports/student?${params.toString()}`,
  );
  return res.data;
}
