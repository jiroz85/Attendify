const { pool } = require("../config/db");

async function listTeacherClasses(teacherId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT
      c.id AS class_id,
      c.department_id,
      c.academic_year_id,
      c.section_id,
      d.name AS department_name,
      ay.name AS academic_year_name,
      s.name AS section_name
    FROM teacher_course_class_assignments a
    JOIN classes c ON c.id = a.class_id
    JOIN departments d ON d.id = c.department_id
    JOIN academic_years ay ON ay.id = c.academic_year_id
    JOIN sections s ON s.id = c.section_id
    WHERE a.teacher_id = ?
    ORDER BY d.name, ay.sort_order, s.name, c.id`,
    [teacherId],
  );

  return rows;
}

async function listTeacherStudents(teacherId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT
      u.id AS student_id,
      u.email,
      u.first_name,
      u.last_name,
      sp.student_number,
      sp.class_id
    FROM teacher_course_class_assignments a
    JOIN student_profiles sp ON sp.class_id = a.class_id
    JOIN users u ON u.id = sp.user_id
    WHERE a.teacher_id = ?
      AND u.role_code = 'STUDENT'
      AND u.status_code = 'ACTIVE'
    ORDER BY sp.class_id, u.last_name, u.first_name, u.id`,
    [teacherId],
  );

  return rows;
}

async function getTeacherTodayAttendanceCount(teacherId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(DISTINCT attendance.id) as count
    FROM attendance
    JOIN teacher_course_class_assignments a ON attendance.class_id = a.class_id
    WHERE a.teacher_id = ?
      AND attendance.attendance_date = CURDATE()
      AND attendance.marked_by = ?`,
    [teacherId, teacherId],
  );

  return rows[0].count;
}

async function getTeacherProfile(teacherId) {
  const [profileRows] = await pool.execute(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
            tp.employee_number, tp.department_id,
            d.name AS department_name
     FROM users u
     LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
     LEFT JOIN departments d ON d.id = tp.department_id
     WHERE u.id = ? AND u.role_code = 'TEACHER'`,
    [teacherId],
  );

  const [assignmentRows] = await pool.execute(
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

  const profile = profileRows[0] || {};
  return {
    ...profile,
    assignments: assignmentRows,
  };
}

module.exports = {
  listTeacherClasses,
  listTeacherStudents,
  getTeacherTodayAttendanceCount,
  getTeacherProfile,
};
