const mysql = require('mysql2/promise');

const { env } = require('./env');
const { logger } = require('./logger');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  namedPlaceholders: false,
});

pool.on('connection', (conn) => {
  conn.on('error', (err) => {
    logger.error('MySQL connection error', err);
  });
});

async function assertDbConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

module.exports = { pool, assertDbConnection };
