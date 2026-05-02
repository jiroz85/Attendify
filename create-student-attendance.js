const mysql = require('mysql2/promise');

async function createStudentAttendance() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'attendance'
    });

    console.log('Creating attendance data for test student...');

    // Get teacher assignment for class 2, course 1
    const [assignmentRows] = await connection.execute(
      'SELECT class_id, course_id FROM teacher_course_class_assignments WHERE teacher_id = ? LIMIT 1',
      [5]
    );

    if (assignmentRows.length === 0) {
      console.log('No teacher assignments found');
      return;
    }

    const { class_id, course_id } = assignmentRows[0];
    console.log(`Using class_id: ${class_id}, course_id: ${course_id}`);

    // Create attendance for the last 15 days for student ID 9
    const today = new Date();
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      // Create realistic attendance pattern
      const rand = Math.random();
      let statusCode;
      if (rand < 0.85) statusCode = 'PRESENT';      // 85% present
      else if (rand < 0.92) statusCode = 'LATE';     // 7% late
      else if (rand < 0.98) statusCode = 'ABSENT';   // 6% absent
      else statusCode = 'EXCUSED';                   // 2% excused

      await connection.execute(`
        INSERT IGNORE INTO attendance 
        (student_id, course_id, class_id, attendance_date, status_code, marked_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [9, course_id, class_id, dateStr, statusCode, 5]);
    }

    // Get the stats to verify
    const [statsRows] = await connection.execute(`
      SELECT 
         COUNT(*) as total_sessions,
         SUM(CASE WHEN status_code = 'PRESENT' THEN 1 ELSE 0 END) as present,
         SUM(CASE WHEN status_code = 'ABSENT' THEN 1 ELSE 0 END) as absent,
         SUM(CASE WHEN status_code = 'LATE' THEN 1 ELSE 0 END) as late,
         SUM(CASE WHEN status_code = 'EXCUSED' THEN 1 ELSE 0 END) as excused
       FROM attendance 
       WHERE student_id = ?
    `, [9]);

    const stats = statsRows[0];
    const attendancePercentage = stats.total_sessions > 0 ? 
      Math.round((stats.present / stats.total_sessions) * 100) : 0;

    console.log('\nStudent Attendance Statistics:');
    console.log(`Total Sessions: ${stats.total_sessions}`);
    console.log(`Present: ${stats.present}`);
    console.log(`Absent: ${stats.absent}`);
    console.log(`Late: ${stats.late}`);
    console.log(`Excused: ${stats.excused}`);
    console.log(`Attendance Percentage: ${attendancePercentage}%`);

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createStudentAttendance();
