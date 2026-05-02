const { ApiError } = require("../utils/ApiError");
const {
  teacherHasAssignment,
  upsertAttendance,
  listAttendanceForStudent,
  getAttendanceForClass,
  getTeacherClassAttendanceData,
  bulkUpsertAttendance,
  getStudentAttendanceStats,
  getAdminAttendanceStats,
  getTeacherClassReports,
  getTeacherStudentReports,
} = require("../queries/attendanceQueries");

async function markAttendanceHandler(req, res) {
  const { studentId, courseId, classId, attendanceDate, statusCode } = req.body;

  if (req.user.role !== "TEACHER" && req.user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden");
  }

  if (req.user.role === "TEACHER") {
    const ok = await teacherHasAssignment({
      teacherId: req.user.id,
      classId,
      courseId,
    });
    if (!ok) {
      throw new ApiError(403, "Teacher is not assigned to this class/course");
    }
  }

  await upsertAttendance({
    studentId,
    courseId,
    classId,
    attendanceDate,
    statusCode,
    markedBy: req.user.id,
  });

  res.status(200).json({ status: "ok" });
}

async function attendanceForStudentHandler(req, res) {
  const studentId = Number(req.params.id);
  if (!Number.isFinite(studentId) || studentId < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  const rows = await listAttendanceForStudent(studentId);
  res.status(200).json(
    rows.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      courseId: r.course_id,
      classId: r.class_id,
      date: r.attendance_date,
      status: r.status_code,
      markedBy: r.marked_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      course: {
        code: r.course_code,
        title: r.course_title,
      },
    })),
  );
}

async function getAttendanceForClassHandler(req, res) {
  const { classId, date } = req.params;
  const courseId = Number(req.query.courseId);

  if (!Number.isFinite(courseId) || courseId < 1) {
    throw new ApiError(422, "courseId query parameter is required");
  }

  if (req.user.role === "TEACHER") {
    const ok = await teacherHasAssignment({
      teacherId: req.user.id,
      classId: Number(classId),
      courseId,
    });
    if (!ok) {
      throw new ApiError(403, "Teacher is not assigned to this class/course");
    }
  }

  const attendance = await getAttendanceForClass({
    classId: Number(classId),
    courseId,
    date,
  });
  res.json(attendance);
}

async function getTeacherClassAttendanceHandler(req, res) {
  const data = await getTeacherClassAttendanceData(req.user.id);
  res.json(data);
}

async function bulkMarkAttendanceHandler(req, res) {
  const { classId, courseId, attendanceDate, attendance } = req.body;

  if (req.user.role === "TEACHER") {
    const ok = await teacherHasAssignment({
      teacherId: req.user.id,
      classId,
      courseId,
    });
    if (!ok) {
      throw new ApiError(403, "Teacher is not assigned to this class/course");
    }
  }

  await bulkUpsertAttendance({
    attendance,
    classId,
    courseId,
    attendanceDate,
    markedBy: req.user.id,
  });

  res.status(200).json({ status: "ok", count: attendance.length });
}

async function getStudentStatsHandler(req, res) {
  const studentId = Number(req.params.id);
  if (!Number.isFinite(studentId) || studentId < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  const stats = await getStudentAttendanceStats(studentId);
  console.log("Student stats for ID", studentId, ":", stats);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.json(stats);
}

async function getAdminStatsHandler(req, res) {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden");
  }

  const stats = await getAdminAttendanceStats();
  res.json(stats);
}

async function getTeacherClassReportsHandler(req, res) {
  const { startDate, endDate } = req.query;
  const reports = await getTeacherClassReports(req.user.id, startDate, endDate);
  res.json(reports);
}

async function getTeacherStudentReportsHandler(req, res) {
  const { startDate, endDate } = req.query;
  const reports = await getTeacherStudentReports(
    req.user.id,
    startDate,
    endDate,
  );
  res.json(reports);
}

module.exports = {
  markAttendanceHandler,
  attendanceForStudentHandler,
  getAttendanceForClassHandler,
  getTeacherClassAttendanceHandler,
  bulkMarkAttendanceHandler,
  getStudentStatsHandler,
  getAdminStatsHandler,
  getTeacherClassReportsHandler,
  getTeacherStudentReportsHandler,
};
