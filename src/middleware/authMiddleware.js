const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const { ApiError } = require("../utils/ApiError");

function authenticateAccessToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing Authorization header"));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    if (payload.type !== "access") {
      return next(new ApiError(401, "Invalid access token"));
    }
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }

    return next();
  };
}

function requireSelfOrRole(paramName, ...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const raw = req.params[paramName];
    const id = Number(raw);

    if (Number.isFinite(id) && id === Number(req.user.id)) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden"));
    }

    return next();
  };
}

module.exports = { authenticateAccessToken, requireRole, requireSelfOrRole };
