const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { env } = require('../src/config/env');

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  });

  try {
    const email = 'admin@attendfy.com';
    const password = 'admin123';
    const firstName = 'System';
    const lastName = 'Administrator';
    const roleCode = 'ADMIN';
    const statusCode = 'ACTIVE';

    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert admin user
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, role_code, status_code, first_name, last_name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, passwordHash, roleCode, statusCode, firstName, lastName]
    );

    console.log(`Admin user created with ID: ${result.insertId}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await connection.end();
  }
}

seedAdmin();
