const express = require("express");
const { body } = require("express-validator");

const { asyncHandler } = require("../middleware/asyncHandler");
const { validateRequest } = require("../middleware/validateRequest");
const {
  authenticateAccessToken,
  requireRole,
} = require("../middleware/authMiddleware");
const {
  loginHandler,
  refreshHandler,
  registerHandler,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 200 }),
  ],
  validateRequest,
  asyncHandler(loginHandler),
);

router.post(
  "/refresh",
  [body("refreshToken").isString().isLength({ min: 20, max: 5000 })],
  validateRequest,
  asyncHandler(refreshHandler),
);

router.post(
  "/register",
  authenticateAccessToken,
  requireRole("ADMIN"),
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 200 }),
    body("roleCode").isString().trim().isIn(["ADMIN", "TEACHER", "STUDENT"]),
    body("firstName")
      .optional({ values: "falsy" })
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 100 }),
    body("lastName")
      .optional({ values: "falsy" })
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 100 }),
    body("phone")
      .optional({ values: "falsy" })
      .isString()
      .trim()
      .escape()
      .isLength({ min: 3, max: 30 }),
  ],
  validateRequest,
  asyncHandler(registerHandler),
);

module.exports = { authRoutes: router };
