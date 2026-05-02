const express = require("express");

const { asyncHandler } = require("../middleware/asyncHandler");
const {
  authenticateAccessToken,
  requireRole,
} = require("../middleware/authMiddleware");
const {
  studentProfileHandler,
  studentClassInfoHandler,
  studentRecentAttendanceHandler,
} = require("../controllers/studentController");

const router = express.Router();

router.use(authenticateAccessToken);
router.use(requireRole("STUDENT"));

router.get("/profile", asyncHandler(studentProfileHandler));
router.get("/classes", asyncHandler(studentClassInfoHandler));
router.get("/attendance/recent", asyncHandler(studentRecentAttendanceHandler));

module.exports = { studentRoutes: router };
