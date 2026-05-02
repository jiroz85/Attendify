const mysql = require('mysql2/promise');
const { env } = require('../src/config/env');

async function seedAcademicData() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  });

  try {
    console.log('Seeding academic data...');

    // Create departments
    const [deptResult] = await connection.execute(
      'INSERT IGNORE INTO departments (name, created_by, updated_by) VALUES (?, ?, ?)',
      ['Computer Science', 1, 1]
    );
    const departmentId = deptResult.insertId || 1;

    // Create academic years
    const [yearResult] = await connection.execute(
      'INSERT IGNORE INTO academic_years (name, sort_order, is_active, created_by, updated_by) VALUES (?, ?, ?, ?, ?)',
      ['2024-2025', 1, 1, 1, 1]
    );
    const academicYearId = yearResult.insertId || 1;

    // Create sections
    const [sectionA] = await connection.execute(
      'INSERT IGNORE INTO sections (name, created_by, updated_by) VALUES (?, ?, ?)',
      ['A', 1, 1]
    );
    const [sectionB] = await connection.execute(
      'INSERT IGNORE INTO sections (name, created_by, updated_by) VALUES (?, ?, ?)',
      ['B', 1, 1]
    );
    const sectionAId = sectionA.insertId || 1;
    const sectionBId = sectionB.insertId || 2;

    // Create courses
    await connection.execute(
      'INSERT IGNORE INTO courses (department_id, code, title, created_by, updated_by) VALUES (?, ?, ?, ?, ?)',
      [departmentId, 'CS101', 'Introduction to Programming', 1, 1]
    );
    await connection.execute(
      'INSERT IGNORE INTO courses (department_id, code, title, created_by, updated_by) VALUES (?, ?, ?, ?, ?)',
      [departmentId, 'CS102', 'Data Structures', 1, 1]
    );

    console.log('Academic data seeded successfully!');
    console.log(`Department ID: ${departmentId}`);
    console.log(`Academic Year ID: ${academicYearId}`);
    console.log(`Section A ID: ${sectionAId}`);
    console.log(`Section B ID: ${sectionBId}`);

  } catch (error) {
    console.error('Error seeding academic data:', error);
  } finally {
    await connection.end();
  }
}

seedAcademicData();
