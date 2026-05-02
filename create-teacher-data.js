const mysql = require('mysql2/promise');

async function createTeacherData() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'attendance'
    });

    console.log('Creating teacher assignments and student data...');

    // Create a teacher user if not exists
    await connection.execute(`
      INSERT IGNORE INTO users (email, password_hash, role_code, first_name, last_name, created_by, updated_by)
      VALUES ('teacher@example.com', '$2b$10$example.hash.here', 'TEACHER', 'John', 'Smith', 1, 1)
    `);

    // Get teacher ID
    const [teacherRows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND role_code = ?', 
      ['teacher@example.com', 'TEACHER']
    );
    const teacherId = teacherRows[0]?.id;

    if (!teacherId) {
      console.log('Teacher not found');
      return;
    }

    console.log('Teacher ID:', teacherId);

    // Create teacher profile
    await connection.execute(`
      INSERT IGNORE INTO teacher_profiles (user_id, employee_number, department_id, created_by, updated_by)
      VALUES (?, 'T001', 1, 1, 1)
    `, [teacherId]);

    // Assign teacher to the existing class
    await connection.execute(`
      INSERT IGNORE INTO teacher_course_class_assignments (teacher_id, course_id, class_id, created_by, updated_by)
      VALUES (?, 1, 2, 1, 1)
    `, [teacherId]);

    // Create some student users
    const students = [
      { email: 'student1@example.com', firstName: 'Alice', lastName: 'Johnson', studentNumber: 'STU001' },
      { email: 'student2@example.com', firstName: 'Bob', lastName: 'Smith', studentNumber: 'STU002' },
      { email: 'student3@example.com', firstName: 'Carol', lastName: 'Williams', studentNumber: 'STU003' }
    ];

    for (const student of students) {
      // Create student user
      await connection.execute(`
        INSERT IGNORE INTO users (email, password_hash, role_code, first_name, last_name, created_by, updated_by)
        VALUES (?, '$2b$10$example.hash.here', 'STUDENT', ?, ?, 1, 1)
      `, [student.email, student.firstName, student.lastName]);

      // Get student ID
      const [studentRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND role_code = ?', 
        [student.email, 'STUDENT']
      );
      const studentId = studentRows[0]?.id;

      if (studentId) {
        // Create student profile
        await connection.execute(`
          INSERT IGNORE INTO student_profiles (user_id, student_number, class_id, created_by, updated_by)
          VALUES (?, ?, 2, 1, 1)
        `, [studentId, student.studentNumber]);
      }
    }

    console.log('Teacher and student data created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTeacherData();
