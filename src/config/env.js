const dotenv = require('dotenv');

dotenv.config();

function requireEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  db: {
    host: requireEnv('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: requireEnv('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    database: requireEnv('DB_NAME'),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  },

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  },

  refreshTokens: {
    pepper: requireEnv('REFRESH_TOKEN_PEPPER'),
    maxActive: Number(process.env.REFRESH_TOKEN_MAX_ACTIVE || 5),
  },
};

module.exports = { env };
