const mysql = require("mysql2/promise");
const { env } = require("../src/config/env");
const fs = require("fs");

async function migrateRefreshTokens() {
  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  });

  try {
    // Read the migration SQL and remove USE statement
    const sql = fs.readFileSync(
      "./database/schema/002_refresh_tokens.sql",
      "utf8",
    );
    const cleanSql = sql.replace(/^USE\s+\w+;\s*\n/i, "");

    // Split by semicolon and filter out empty statements
    const statements = cleanSql.split(";").filter((stmt) => stmt.trim());

    console.log("Creating refresh_tokens table...");

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log("refresh_tokens table created successfully!");
  } catch (error) {
    if (error.code === "ER_TABLE_EXISTS_ERROR") {
      console.log("refresh_tokens table already exists");
    } else {
      console.error("Error creating refresh_tokens table:", error);
    }
  } finally {
    await connection.end();
  }
}

migrateRefreshTokens();
