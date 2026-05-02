const jwt = require('jsonwebtoken');

const { env } = require('../config/env');

function signAccessToken({ userId, role, email }) {
  return jwt.sign(
    {
      sub: userId,
      role,
      email,
      type: 'access',
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessTtl }
  );
}

function signRefreshToken({ userId, role, email, jti }) {
  return jwt.sign(
    {
      sub: userId,
      role,
      email,
      jti,
      type: 'refresh',
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshTtl }
  );
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken };
