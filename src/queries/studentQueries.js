const { pool } = require("../config/db");

async function getStudentProfileData(studentId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.first_name, u.last_name,
            sp.student_number, sp.class_id,
            c.id AS class_id, 
            d.name AS department_name,
            ay.name AS academic_year_name,
            s.name AS section_name,
            CONCAT(d.name, ' - ', s.name) AS class_name
     FROM users u
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     LEFT JOIN classes c ON c.id = sp.class_id
     LEFT JOIN departments d ON d.id = c.department_id
     LEFT JOIN academic_years ay ON ay.id = c.academic_year_id
     LEFT JOIN sections s ON s.id = c.section_id
     WHERE u.id = ? AND u.role_code = 'STUDENT'`,
    [studentId],
  );

  const profile = rows[0] || {};
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    studentNumber: profile.student_number,
    classId: profile.class_id,
    className: profile.class_name,
    departmentName: profile.department_name,
    academicYearName: profile.academic_year_name,
    sectionName: profile.section_name,
  };
}

async function getStudentClassInfo(studentId) {
  const [rows] = await pool.execute(
    `SELECT DISTINCT
       c.id AS id,
       CONCAT(d.name, ' - ', s.name) AS class_name,
       d.name AS department_name,
       ay.name AS academic_year_name,
       s.name AS section_name
     FROM student_profiles sp
     JOIN classes c ON c.id = sp.class_id
     JOIN departments d ON d.id = c.department_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     JOIN sections s ON s.id = c.section_id
     WHERE sp.user_id = ?`,
    [studentId],
  );

  // Get courses for each class
  for (const classRow of rows) {
    const [courseRows] = await pool.execute(
      `SELECT co.id, co.code, co.title
       FROM class_courses cc
       JOIN courses co ON co.id = cc.course_id
       WHERE cc.class_id = ?
       ORDER BY co.code`,
      [classRow.id],
    );
    classRow.courses = courseRows;
  }

  return rows;
}

async function getStudentRecentAttendance(studentId, limit = 5) {
  const limitNum = parseInt(limit) || 5;
  const [rows] = await pool.execute(
    `SELECT a.id, a.attendance_date, a.status_code, a.marked_by, a.created_at,
            c.code AS course_code, c.title AS course_title
     FROM attendance a
     JOIN courses c ON c.id = a.course_id
     WHERE a.student_id = ?
     ORDER BY a.attendance_date DESC, a.created_at DESC
     LIMIT ${limitNum}`,
    [studentId],
  );

  return rows.map((row) => ({
    id: row.id,
    date: row.attendance_date,
    courseCode: row.course_code,
    courseTitle: row.course_title,
    status: row.status_code,
    markedBy: row.marked_by,
    createdAt: row.created_at,
  }));
}

module.exports = {
  getStudentProfileData,
  getStudentClassInfo,
  getStudentRecentAttendance,
};
