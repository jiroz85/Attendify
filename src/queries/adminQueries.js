const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

async function getDepartments() {
  const [rows] = await pool.execute("SELECT * FROM departments ORDER BY name");
  return rows;
}

async function getAcademicYears() {
  const [rows] = await pool.execute(
    "SELECT id, name, sort_order, is_active FROM academic_years ORDER BY sort_order, name",
  );
  return rows;
}

async function getSections() {
  const [rows] = await pool.execute(
    "SELECT id, name FROM sections ORDER BY name",
  );
  return rows;
}

async function createAcademicYear({ name, sortOrder, isActive, createdBy }) {
  const [result] = await pool.execute(
    "INSERT INTO academic_years (name, sort_order, is_active, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
    [name, sortOrder ?? null, isActive ? 1 : 0, createdBy, createdBy],
  );
  return result.insertId;
}

async function createSection({ name, createdBy }) {
  const [result] = await pool.execute(
    "INSERT INTO sections (name, created_by, updated_by) VALUES (?, ?, ?)",
    [name, createdBy, createdBy],
  );
  return result.insertId;
}

async function getClasses() {
  const [rows] = await pool.execute(`
    SELECT c.id, c.is_active, d.name as department, ay.name as academic_year, s.name as section,
           d.id as department_id, ay.id as academic_year_id, s.id as section_id
    FROM classes c
    JOIN departments d ON c.department_id = d.id
    JOIN academic_years ay ON c.academic_year_id = ay.id
    JOIN sections s ON c.section_id = s.id
    ORDER BY d.name, ay.name, s.name
  `);
  return rows;
}

async function getCourses() {
  const [rows] = await pool.execute(`
    SELECT c.id, c.code, c.title, c.is_active, d.name as department, d.id as department_id
    FROM courses c
    JOIN departments d ON c.department_id = d.id
    ORDER BY d.name, c.code
  `);
  return rows;
}

async function createDepartment({ name, createdBy }) {
  const [result] = await pool.execute(
    "INSERT INTO departments (name, created_by, updated_by) VALUES (?, ?, ?)",
    [name, createdBy, createdBy],
  );
  return result.insertId;
}

async function createClass({
  departmentId,
  academicYearId,
  sectionId,
  createdBy,
}) {
  const [result] = await pool.execute(
    "INSERT INTO classes (department_id, academic_year_id, section_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
    [departmentId, academicYearId, sectionId, createdBy, createdBy],
  );
  return result.insertId;
}

async function createCourse({ departmentId, code, title, createdBy }) {
  const [result] = await pool.execute(
    "INSERT INTO courses (department_id, code, title, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
    [departmentId, code, title, createdBy, createdBy],
  );
  return result.insertId;
}

async function insertUserTx(
  connection,
  { email, passwordHash, roleCode, firstName, lastName, phone, createdBy },
) {
  const [result] = await connection.execute(
    `INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, phone, created_by, updated_by)
     VALUES (?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)`,
    [
      email,
      passwordHash,
      roleCode,
      firstName || null,
      lastName || null,
      phone || null,
      createdBy || null,
      createdBy || null,
    ],
  );
  return result.insertId;
}

async function listClassCourses(classId) {
  const [rows] = await pool.execute(
    `SELECT cc.class_id, cc.course_id, c.code, c.title
     FROM class_courses cc
     JOIN courses c ON c.id = cc.course_id
     WHERE cc.class_id = ?
     ORDER BY c.code`,
    [classId],
  );
  return rows;
}

async function addCourseToClass({ classId, courseId, createdBy }) {
  const [result] = await pool.execute(
    "INSERT INTO class_courses (class_id, course_id, created_by, updated_by) VALUES (?, ?, ?, ?)",
    [classId, courseId, createdBy, createdBy],
  );
  return result.affectedRows || 0;
}

async function removeCourseFromClass({ classId, courseId }) {
  const [result] = await pool.execute(
    "DELETE FROM class_courses WHERE class_id = ? AND course_id = ?",
    [classId, courseId],
  );
  return result.affectedRows || 0;
}

async function listTeachers() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.status_code,
            tp.employee_number, tp.department_id
     FROM users u
     LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
     WHERE u.role_code = 'TEACHER'
     ORDER BY u.last_name, u.first_name, u.id`,
  );
  return rows;
}

async function listStudents() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.status_code,
            sp.student_number, sp.class_id
     FROM users u
     LEFT JOIN student_profiles sp ON sp.user_id = u.id
     WHERE u.role_code = 'STUDENT'
     ORDER BY u.last_name, u.first_name, u.id`,
  );
  return rows;
}

async function createTeacherUser({
  email,
  password,
  firstName,
  lastName,
  phone,
  employeeNumber,
  departmentId,
  createdBy,
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await insertUserTx(connection, {
      email,
      passwordHash,
      roleCode: "TEACHER",
      firstName,
      lastName,
      phone,
      createdBy,
    });

    await connection.execute(
      "INSERT INTO teacher_profiles (user_id, employee_number, department_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
      [userId, employeeNumber, departmentId || null, createdBy, createdBy],
    );

    await connection.commit();
    return userId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function createStudentUser({
  email,
  password,
  firstName,
  lastName,
  phone,
  studentNumber,
  classId,
  createdBy,
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = await insertUserTx(connection, {
      email,
      passwordHash,
      roleCode: "STUDENT",
      firstName,
      lastName,
      phone,
      createdBy,
    });

    await connection.execute(
      "INSERT INTO student_profiles (user_id, student_number, class_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
      [userId, studentNumber, classId, createdBy, createdBy],
    );

    await connection.commit();
    return userId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function listTeacherAssignments() {
  const [rows] = await pool.execute(
    `SELECT a.id, a.teacher_id, a.class_id, a.course_id,
            u.email AS teacher_email, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
            co.code AS course_code, co.title AS course_title,
            d.name AS department_name, ay.name AS academic_year_name, s.name AS section_name
     FROM teacher_course_class_assignments a
     JOIN users u ON u.id = a.teacher_id
     JOIN courses co ON co.id = a.course_id
     JOIN classes c ON c.id = a.class_id
     JOIN departments d ON d.id = c.department_id
     JOIN academic_years ay ON ay.id = c.academic_year_id
     JOIN sections s ON s.id = c.section_id
     ORDER BY u.last_name, u.first_name, d.name, ay.sort_order, s.name, co.code, a.id`,
  );
  return rows;
}

async function addTeacherAssignment({
  teacherId,
  classId,
  courseId,
  createdBy,
}) {
  const [result] = await pool.execute(
    "INSERT INTO teacher_course_class_assignments (teacher_id, course_id, class_id, created_by, updated_by) VALUES (?, ?, ?, ?, ?)",
    [teacherId, courseId, classId, createdBy, createdBy],
  );
  return result.insertId;
}

async function removeTeacherAssignment({ id }) {
  const [result] = await pool.execute(
    "DELETE FROM teacher_course_class_assignments WHERE id = ?",
    [id],
  );
  return result.affectedRows || 0;
}

async function updateTeacher({
  id,
  email,
  firstName,
  lastName,
  phone,
  employeeNumber,
  departmentId,
  updatedBy,
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update user table
    await connection.execute(
      `UPDATE users 
       SET email = ?, first_name = ?, last_name = ?, phone = ?, updated_by = ?
       WHERE id = ?`,
      [
        email,
        firstName || null,
        lastName || null,
        phone || null,
        updatedBy,
        id,
      ],
    );

    // Update teacher profile
    await connection.execute(
      `UPDATE teacher_profiles 
       SET employee_number = ?, department_id = ?, updated_by = ?
       WHERE user_id = ?`,
      [employeeNumber, departmentId || null, updatedBy, id],
    );

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateStudent({
  id,
  email,
  firstName,
  lastName,
  phone,
  studentNumber,
  classId,
  updatedBy,
}) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update user table
    await connection.execute(
      `UPDATE users 
       SET email = ?, first_name = ?, last_name = ?, phone = ?, updated_by = ?
       WHERE id = ?`,
      [
        email,
        firstName || null,
        lastName || null,
        phone || null,
        updatedBy,
        id,
      ],
    );

    // Update student profile
    await connection.execute(
      `UPDATE student_profiles 
       SET student_number = ?, class_id = ?, updated_by = ?
       WHERE user_id = ?`,
      [studentNumber, classId || null, updatedBy, id],
    );

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteTeacher(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if teacher has any attendance records
    const [attendanceCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE marked_by = ?",
      [id],
    );

    if (attendanceCheck[0].count > 0) {
      throw new Error(
        "Cannot delete teacher: they have attendance records. Consider reassigning or deactivating the teacher instead.",
      );
    }

    // Delete teacher assignments
    await connection.execute(
      "DELETE FROM teacher_course_class_assignments WHERE teacher_id = ?",
      [id],
    );

    // Delete teacher profile
    await connection.execute("DELETE FROM teacher_profiles WHERE user_id = ?", [
      id,
    ]);

    // Delete user
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteStudent(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete student profile
    await connection.execute("DELETE FROM student_profiles WHERE user_id = ?", [
      id,
    ]);

    // Delete user
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateTeacherPassword({ id, passwordHash, updatedBy }) {
  const [result] = await pool.execute(
    "UPDATE users SET password_hash = ?, updated_by = ? WHERE id = ?",
    [passwordHash, updatedBy, id],
  );
  return result.affectedRows > 0;
}

async function updateStudentPassword({ id, passwordHash, updatedBy }) {
  const [result] = await pool.execute(
    "UPDATE users SET password_hash = ?, updated_by = ? WHERE id = ?",
    [passwordHash, updatedBy, id],
  );
  return result.affectedRows > 0;
}

async function deactivateTeacher(id, updatedBy) {
  const [result] = await pool.execute(
    "UPDATE users SET status_code = 'SUSPENDED', updated_by = ? WHERE id = ? AND role_code = 'TEACHER'",
    [updatedBy, id],
  );
  return result.affectedRows > 0;
}

async function activateTeacher(id, updatedBy) {
  const [result] = await pool.execute(
    "UPDATE users SET status_code = 'ACTIVE', updated_by = ? WHERE id = ? AND role_code = 'TEACHER'",
    [updatedBy, id],
  );
  return result.affectedRows > 0;
}

async function deactivateStudent(id, updatedBy) {
  const [result] = await pool.execute(
    "UPDATE users SET status_code = 'SUSPENDED', updated_by = ? WHERE id = ? AND role_code = 'STUDENT'",
    [updatedBy, id],
  );
  return result.affectedRows > 0;
}

async function activateStudent(id, updatedBy) {
  const [result] = await pool.execute(
    "UPDATE users SET status_code = 'ACTIVE', updated_by = ? WHERE id = ? AND role_code = 'STUDENT'",
    [updatedBy, id],
  );
  return result.affectedRows > 0;
}

module.exports = {
  getDepartments,
  getAcademicYears,
  getSections,
  getClasses,
  getCourses,
  createDepartment,
  createAcademicYear,
  createSection,
  createClass,
  createCourse,
  listClassCourses,
  addCourseToClass,
  removeCourseFromClass,
  listTeachers,
  listStudents,
  createTeacherUser,
  createStudentUser,
  listTeacherAssignments,
  addTeacherAssignment,
  removeTeacherAssignment,
  updateTeacher,
  updateStudent,
  deleteTeacher,
  deleteStudent,
  updateTeacherPassword,
  updateStudentPassword,
  deactivateTeacher,
  activateTeacher,
  deactivateStudent,
  activateStudent,
};
