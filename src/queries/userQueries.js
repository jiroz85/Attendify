const { pool } = require("../config/db");

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    "SELECT id, email, password_hash, role_code, status_code, first_name, last_name FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows[0] || null;
}

async function createUser({
  email,
  passwordHash,
  roleCode,
  firstName,
  lastName,
  phone,
  createdBy,
}) {
  const [result] = await pool.execute(
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

async function findUserById(id) {
  const [rows] = await pool.execute(
    "SELECT id, email, role_code, status_code, first_name, last_name, phone FROM users WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

module.exports = { findUserByEmail, findUserById, createUser };
