const { pool } = require("../config/db");

async function teacherHasAssignment({ teacherId, classId, courseId }) {
  const [rows] = await pool.execute(
    "SELECT id FROM teacher_course_class_assignments WHERE teacher_id = ? AND class_id = ? AND course_id = ? LIMIT 1",
    [teacherId, classId, courseId],
  );
  return !!rows[0];
}

async function upsertAttendance({
  studentId,
  courseId,
  classId,
  attendanceDate,
  statusCode,
  markedBy,
}) {
  const [result] = await pool.execute(
    `INSERT INTO attendance (student_id, course_id, class_id, attendance_date, status_code, marked_by)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (student_id, course_id, class_id, attendance_date) DO UPDATE SET
       status_code = EXCLUDED.status_code,
       marked_by = EXCLUDED.marked_by,
       updated_at = CURRENT_TIMESTAMP`,
    [studentId, courseId, classId, attendanceDate, statusCode, markedBy],
  );

  return result.insertId || null;
}

async function listAttendanceForStudent(studentId) {
  const [rows] = await pool.execute(
    `SELECT a.id, a.student_id, a.course_id, a.class_id, a.attendance_date, a.status_code, a.marked_by, a.created_at, a.updated_at,
            c.code AS course_code, c.title AS course_title
     FROM attendance a
     JOIN courses c ON c.id = a.course_id
     WHERE a.student_id = ?
     ORDER BY a.attendance_date DESC, a.course_id ASC`,
    [studentId],
  );
  return rows;
}

async function getAttendanceForClass({ classId, courseId, date }) {
  const [rows] = await pool.execute(
    `SELECT a.id, a.student_id, a.status_code, u.first_name, u.last_name, sp.student_number
     FROM attendance a
     JOIN users u ON u.id = a.student_id
     JOIN student_profiles sp ON sp.user_id = u.id
     WHERE a.class_id = ? AND a.course_id = ? AND a.attendance_date = ?
     ORDER BY u.last_name, u.first_name`,
    [classId, courseId, date],
  );
  return rows;
}

async function getTeacherClassAttendanceData(teacherId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT 
       c.id AS class_id,
       c.department_id,
       c.academic_year_id,
       c.section_id,
       d.name AS department_name,
       ay.name AS academic_year_name,
       s.name AS section_name,
       tcca.course_id,
       co.code AS course_code,
       co.title AS course_title
     FROM teacher_course_class_assignments tcca
     JOIN classes c ON c.id = tcca.class_id
     JOIN departments d ON d.id = c.department_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     JOIN sections s ON s.id = c.section_id
     JOIN courses co ON co.id = tcca.course_id
     WHERE tcca.teacher_id = ?
     ORDER BY d.name, ay.name, s.name, co.code`,
    [teacherId],
  );
  return rows;
}

async function bulkUpsertAttendance({
  attendance,
  classId,
  courseId,
  attendanceDate,
  markedBy,
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const record of attendance) {
      await connection.execute(
        `INSERT INTO attendance (student_id, course_id, class_id, attendance_date, status_code, marked_by)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT (student_id, course_id, class_id, attendance_date) DO UPDATE SET
           status_code = EXCLUDED.status_code,
           marked_by = EXCLUDED.marked_by,
           updated_at = CURRENT_TIMESTAMP`,
        [
          record.studentId,
          courseId,
          classId,
          attendanceDate,
          record.statusCode,
          markedBy,
        ],
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getStudentAttendanceStats(studentId) {
  const [rows] = await pool.execute(
    `SELECT 
       COUNT(*) as total_sessions,
       SUM(CASE WHEN status_code = 'PRESENT' THEN 1 ELSE 0 END)::INTEGER as present,
       SUM(CASE WHEN status_code = 'ABSENT' THEN 1 ELSE 0 END)::INTEGER as absent,
       SUM(CASE WHEN status_code = 'LATE' THEN 1 ELSE 0 END)::INTEGER as late,
       SUM(CASE WHEN status_code = 'EXCUSED' THEN 1 ELSE 0 END)::INTEGER as excused
     FROM attendance 
     WHERE student_id = ?`,
    [studentId],
  );

  const stats = rows[0];
  const totalSessions = stats.total_sessions || 0;
  const present = stats.present || 0;
  const absent = stats.absent || 0;
  const late = stats.late || 0;
  const excused = stats.excused || 0;

  // Calculate attended sessions (present + excused)
  const attendedSessions = present + excused;

  // Calculate attendance percentage, ensuring it doesn't exceed 100%
  let attendancePercentage = 0;
  if (totalSessions > 0) {
    attendancePercentage = Math.round((attendedSessions / totalSessions) * 100);
    // Cap at 100% to prevent impossible values
    attendancePercentage = Math.min(attendancePercentage, 100);
  }

  return {
    total_sessions: totalSessions,
    present: present,
    absent: absent,
    late: late,
    excused: excused,
    attendance_percentage: attendancePercentage,
  };
}

async function getAdminAttendanceStats() {
  const [rows] = await pool.execute(
    `SELECT 
       COUNT(*) as total_sessions,
       SUM(CASE WHEN status_code = 'PRESENT' THEN 1 ELSE 0 END)::INTEGER as present,
       SUM(CASE WHEN status_code = 'ABSENT' THEN 1 ELSE 0 END)::INTEGER as absent,
       SUM(CASE WHEN status_code = 'LATE' THEN 1 ELSE 0 END)::INTEGER as late,
       SUM(CASE WHEN status_code = 'EXCUSED' THEN 1 ELSE 0 END)::INTEGER as excused,
       COUNT(DISTINCT student_id) as total_students,
       COUNT(DISTINCT attendance_date) as total_dates
     FROM attendance`,
  );

  const stats = rows[0];
  const totalSessions = stats.total_sessions || 0;
  const present = stats.present || 0;
  const absent = stats.absent || 0;
  const late = stats.late || 0;
  const excused = stats.excused || 0;

  // Calculate attended sessions (present + excused)
  const attendedSessions = present + excused;

  // Calculate attendance percentage, ensuring it doesn't exceed 100%
  let attendancePercentage = 0;
  if (totalSessions > 0) {
    attendancePercentage = Math.round((attendedSessions / totalSessions) * 100);
    // Cap at 100% to prevent impossible values
    attendancePercentage = Math.min(attendancePercentage, 100);
  }

  return {
    total_sessions: totalSessions,
    present: present,
    absent: absent,
    late: late,
    excused: excused,
    attendance_percentage: attendancePercentage,
    total_students: stats.total_students || 0,
    total_dates: stats.total_dates || 0,
  };
}

async function getTeacherClassReports(
  teacherId,
  startDate = null,
  endDate = null,
) {
  let whereClause = `WHERE tcca.teacher_id = ?`;
  let params = [teacherId];

  if (startDate && endDate) {
    whereClause += ` AND a.attendance_date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  const [rows] = await pool.execute(
    `SELECT DISTINCT
       c.id AS class_id,
       d.name AS department_name,
       ay.name AS academic_year_name,
       s.name AS section_name,
       tcca.course_id,
       co.code AS course_code,
       co.title AS course_title,
       COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.attendance_date END) as total_sessions,
       SUM(CASE WHEN a.status_code = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
       SUM(CASE WHEN a.status_code = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
       SUM(CASE WHEN a.status_code = 'LATE' THEN 1 ELSE 0 END) as late_count,
       SUM(CASE WHEN a.status_code = 'EXCUSED' THEN 1 ELSE 0 END) as excused_count,
       COUNT(DISTINCT sp.user_id) as total_students
     FROM teacher_course_class_assignments tcca
     JOIN classes c ON c.id = tcca.class_id
     JOIN departments d ON d.id = c.department_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     JOIN sections s ON s.id = c.section_id
     JOIN courses co ON co.id = tcca.course_id
     LEFT JOIN student_profiles sp ON sp.class_id = tcca.class_id
     LEFT JOIN attendance a ON a.class_id = tcca.class_id AND a.course_id = tcca.course_id AND a.student_id = sp.user_id
     ${whereClause}
     GROUP BY c.id, d.name, ay.name, s.name, tcca.course_id, co.code, co.title
     ORDER BY d.name, ay.name, s.name, co.code`,
    params,
  );

  return rows.map((row) => {
    const totalSessions = row.total_sessions || 0;
    const presentCount = row.present_count || 0;
    const absentCount = row.absent_count || 0;
    const lateCount = row.late_count || 0;
    const excusedCount = row.excused_count || 0;

    // Total attendance records (excluding null)
    const totalRecords = presentCount + absentCount + lateCount + excusedCount;

    // Attendance rate: (Present + Excused) / Total Records * 100
    const averageAttendance =
      totalRecords > 0
        ? Math.round(((presentCount + excusedCount) / totalRecords) * 100)
        : 0;

    return {
      classId: row.class_id,
      className: `${row.department_name} - ${row.section_name}`,
      courseId: row.course_id,
      courseName: `${row.course_code}: ${row.course_title}`,
      totalSessions,
      averageAttendance,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
    };
  });
}

async function getTeacherStudentReports(
  teacherId,
  startDate = null,
  endDate = null,
) {
  let whereClause = `WHERE tcca.teacher_id = ?`;
  let params = [teacherId];

  if (startDate && endDate) {
    whereClause += ` AND a.attendance_date BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  const [rows] = await pool.execute(
    `SELECT DISTINCT
       u.id AS student_id,
       u.first_name,
       u.last_name,
       sp.student_number,
       COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN a.attendance_date END) as total_sessions,
       SUM(CASE WHEN a.status_code = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
       SUM(CASE WHEN a.status_code = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
       SUM(CASE WHEN a.status_code = 'LATE' THEN 1 ELSE 0 END) as late_count,
       SUM(CASE WHEN a.status_code = 'EXCUSED' THEN 1 ELSE 0 END) as excused_count
     FROM teacher_course_class_assignments tcca
     JOIN student_profiles sp ON sp.class_id = tcca.class_id
     JOIN users u ON u.id = sp.user_id
     LEFT JOIN attendance a ON a.student_id = u.id AND a.class_id = tcca.class_id AND a.course_id = tcca.course_id
     ${whereClause}
     GROUP BY u.id, u.first_name, u.last_name, sp.student_number
     ORDER BY u.last_name, u.first_name`,
    params,
  );

  return rows.map((row) => {
    const totalSessions = row.total_sessions || 0;
    const presentCount = row.present_count || 0;
    const absentCount = row.absent_count || 0;
    const lateCount = row.late_count || 0;
    const excusedCount = row.excused_count || 0;

    // Total attendance records (excluding null)
    const totalRecords = presentCount + absentCount + lateCount + excusedCount;

    // Attendance rate: (Present + Excused) / Total Records * 100
    const attendanceRate =
      totalRecords > 0
        ? Math.round(((presentCount + excusedCount) / totalRecords) * 100)
        : 0;

    // Improved trend calculation
    let trend = "stable";
    if (attendanceRate >= 90) {
      trend = "improving";
    } else if (attendanceRate >= 75) {
      trend = "stable";
    } else if (attendanceRate >= 60) {
      trend = "declining";
    } else {
      trend = "declining";
    }

    return {
      studentId: row.student_id,
      studentName: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      studentNumber: row.student_number || "N/A",
      attendanceRate,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      trend,
    };
  });
}

module.exports = {
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
};
