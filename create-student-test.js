const mysql = require('mysql2/promise');

async function createStudentTest() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'attendance'
    });

    console.log('Creating test student account...');

    // Create a student user with a simple password hash
    const passwordHash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqJqMhJjOQ.NT7p9hJG1I8.3/P.J1'; // "password123"
    
    await connection.execute(`
      INSERT IGNORE INTO users (email, password_hash, role_code, first_name, last_name, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['student@test.com', passwordHash, 'STUDENT', 'Test', 'Student', 1, 1]);

    // Get the student ID
    const [studentRows] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND role_code = ?', 
      ['student@test.com', 'STUDENT']
    );
    const studentId = studentRows[0]?.id;

    if (!studentId) {
      console.log('Student not found');
      return;
    }

    console.log('Student ID:', studentId);

    // Create student profile
    await connection.execute(`
      INSERT IGNORE INTO student_profiles (user_id, student_number, class_id, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `, [studentId, 'STU999', 2, 1, 1]);

    console.log('Test student created successfully!');
    console.log('Login credentials:');
    console.log('Email: student@test.com');
    console.log('Password: password123');
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createStudentTest();
