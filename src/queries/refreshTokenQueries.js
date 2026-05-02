const { pool } = require("../config/db");

async function insertRefreshToken({ userId, jti, tokenHash, expiresAt }) {
  await pool.execute(
    "INSERT INTO refresh_tokens (user_id, jti, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    [userId, jti, tokenHash, expiresAt],
  );
}

async function findRefreshTokenByJti(jti) {
  const [rows] = await pool.execute(
    "SELECT id, user_id, jti, token_hash, expires_at, revoked_at FROM refresh_tokens WHERE jti = ? LIMIT 1",
    [jti],
  );
  return rows[0] || null;
}

async function revokeRefreshTokenById(id) {
  await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND revoked_at IS NULL",
    [id],
  );
}

async function pruneOldRefreshTokensForUser(userId, keepLatestN) {
  // Keep only latest N active (not revoked) tokens by created_at
  // First get all tokens to potentially revoke
  const [rows] = await pool.execute(
    `SELECT id FROM refresh_tokens 
     WHERE user_id = ? AND revoked_at IS NULL 
     ORDER BY created_at DESC`,
    [userId],
  );

  // Revoke tokens beyond the keepLatestN limit
  const tokensToRevoke = rows.slice(keepLatestN);
  if (tokensToRevoke.length > 0) {
    const idsToRevoke = tokensToRevoke.map((row) => row.id);
    const placeholders = idsToRevoke.map(() => "?").join(",");
    await pool.execute(
      `UPDATE refresh_tokens 
       SET revoked_at = CURRENT_TIMESTAMP 
       WHERE id IN (${placeholders})`,
      idsToRevoke,
    );
  }
}

module.exports = {
  insertRefreshToken,
  findRefreshTokenByJti,
  revokeRefreshTokenById,
  pruneOldRefreshTokensForUser,
};
