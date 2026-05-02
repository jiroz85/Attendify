const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { env } = require("../config/env");
const { ApiError } = require("../utils/ApiError");
const { sha256Hex } = require("../utils/crypto");
const { unixSecondsToMySqlDateTime } = require("../utils/date");
const { findUserByEmail, createUser } = require("../queries/userQueries");
const {
  insertRefreshToken,
  findRefreshTokenByJti,
  revokeRefreshTokenById,
  pruneOldRefreshTokensForUser,
} = require("../queries/refreshTokenQueries");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("./tokenService");

function hashRefreshToken(token) {
  return sha256Hex(`${env.refreshTokens.pepper}:${token}`);
}

async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.status_code !== "ACTIVE") {
    throw new ApiError(403, "User is not active");
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role_code,
    email: user.email,
  });

  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({
    userId: user.id,
    role: user.role_code,
    email: user.email,
    jti,
  });
  const tokenHash = hashRefreshToken(refreshToken);

  const refreshPayload = verifyRefreshToken(refreshToken);
  const expiresAt = unixSecondsToMySqlDateTime(refreshPayload.exp);

  await insertRefreshToken({ userId: user.id, jti, tokenHash, expiresAt });
  await pruneOldRefreshTokensForUser(user.id, env.refreshTokens.maxActive);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role_code,
      firstName: user.first_name,
      lastName: user.last_name,
    },
  };
}

async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (payload.type !== "refresh" || !payload.jti) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const stored = await findRefreshTokenByJti(payload.jti);
  if (!stored) {
    throw new ApiError(401, "Refresh token not recognized");
  }

  if (stored.revoked_at) {
    throw new ApiError(401, "Refresh token revoked");
  }

  if (
    stored.expires_at &&
    new Date(stored.expires_at).getTime() <= Date.now()
  ) {
    await revokeRefreshTokenById(stored.id);
    throw new ApiError(401, "Refresh token expired");
  }

  const incomingHash = hashRefreshToken(refreshToken);
  if (incomingHash !== stored.token_hash) {
    // Token reuse / tampering
    await revokeRefreshTokenById(stored.id);
    throw new ApiError(401, "Refresh token invalid");
  }

  // Rotate: revoke old, issue new
  await revokeRefreshTokenById(stored.id);

  const accessToken = signAccessToken({
    userId: payload.sub,
    role: payload.role,
    email: payload.email,
  });

  const newJti = crypto.randomUUID();
  const newRefreshToken = signRefreshToken({
    userId: payload.sub,
    role: payload.role,
    email: payload.email,
    jti: newJti,
  });
  const newHash = hashRefreshToken(newRefreshToken);

  const newPayload = verifyRefreshToken(newRefreshToken);
  const expiresAt = unixSecondsToMySqlDateTime(newPayload.exp);

  await insertRefreshToken({
    userId: payload.sub,
    jti: newJti,
    tokenHash: newHash,
    expiresAt,
  });
  await pruneOldRefreshTokensForUser(payload.sub, env.refreshTokens.maxActive);

  return { accessToken, refreshToken: newRefreshToken };
}

async function register({
  actor,
  email,
  password,
  roleCode,
  firstName,
  lastName,
  phone,
}) {
  if (!actor || actor.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden");
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email already in use");
  }

  const allowedRoles = new Set(["ADMIN", "TEACHER", "STUDENT"]);
  if (!allowedRoles.has(roleCode)) {
    throw new ApiError(422, "Invalid role");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const id = await createUser({
      email,
      passwordHash,
      roleCode,
      firstName,
      lastName,
      phone,
      createdBy: actor.id,
    });
    return { id };
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Email already in use");
    }
    throw err;
  }
}

module.exports = { login, refresh, register };
