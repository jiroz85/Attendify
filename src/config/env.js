const { URL } = require("url");
const dotenv = require("dotenv");

dotenv.config();

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

function requireDatabaseUrlWithPassword() {
  const raw = requireEnv("DATABASE_URL");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid DATABASE_URL: must be a valid URL");
  }

  if (
    !url.password &&
    process.env.DB_PASSWORD != null &&
    process.env.DB_PASSWORD !== ""
  ) {
    url.password = String(process.env.DB_PASSWORD);
  }

  if (!url.password) {
    throw new Error(
      "DATABASE_URL must include a password (e.g. postgresql://user:password@host:5432/db) or set DB_PASSWORD",
    );
  }

  return url.toString();
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || "*",

  db: {
    url: requireDatabaseUrlWithPassword(),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },

  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    refreshSecret: requireEnv("JWT_REFRESH_SECRET"),
    accessTtl: process.env.JWT_ACCESS_TTL || "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL || "30d",
  },

  refreshTokens: {
    pepper: requireEnv("REFRESH_TOKEN_PEPPER"),
    maxActive: Number(process.env.REFRESH_TOKEN_MAX_ACTIVE || 5),
  },
};

module.exports = { env };
