const { env } = require("./env");
const { logger } = require("./logger");

const { Pool } = require("pg");

function normalizeSqlAndParams(sql, params = []) {
  if (!params || params.length === 0) {
    return { sql, params: [] };
  }

  let i = 0;
  const normalizedSql = sql.replace(/\?/g, () => {
    i += 1;
    return `$${i}`;
  });

  return { sql: normalizedSql, params };
}

function toMysqlLikeResult(pgResult) {
  return {
    affectedRows: Number(pgResult.rowCount || 0),
    rowCount: Number(pgResult.rowCount || 0),
    // For INSERT ... RETURNING id queries, callers can read insertId.
    insertId:
      pgResult.rows && pgResult.rows[0] && pgResult.rows[0].id != null
        ? Number(pgResult.rows[0].id)
        : undefined,
  };
}

const rawPool = new Pool({
  connectionString: env.db.url,
  max: env.db.connectionLimit,
  ssl: { rejectUnauthorized: false },
});

rawPool.on("error", (err) => {
  logger.error("Postgres pool error", err);
});

const pool = {
  async execute(sql, params) {
    const normalized = normalizeSqlAndParams(sql, params);
    const result = await rawPool.query(normalized.sql, normalized.params);

    // mysql2 returns [rows, fields]. Most of your code uses only [rows] or [result].
    // For non-SELECT statements, mysql2 returns an OkPacket-like object.
    const isSelect = /^\s*select\b/i.test(sql);
    if (isSelect) {
      return [result.rows];
    }
    return [toMysqlLikeResult(result)];
  },

  async getConnection() {
    const client = await rawPool.connect();
    return {
      async beginTransaction() {
        await client.query("BEGIN");
      },
      async commit() {
        await client.query("COMMIT");
      },
      async rollback() {
        await client.query("ROLLBACK");
      },
      async execute(sql, params) {
        const normalized = normalizeSqlAndParams(sql, params);
        const result = await client.query(normalized.sql, normalized.params);
        const isSelect = /^\s*select\b/i.test(sql);
        if (isSelect) {
          return [result.rows];
        }
        return [toMysqlLikeResult(result)];
      },
      release() {
        client.release();
      },
    };
  },
};

async function assertDbConnection() {
  const conn = await rawPool.connect();
  try {
    await conn.query("SELECT 1");
  } finally {
    conn.release();
  }
}

module.exports = { pool, assertDbConnection };
