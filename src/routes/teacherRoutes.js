const express = require("express");

const { asyncHandler } = require("../middleware/asyncHandler");
const {
  authenticateAccessToken,
  requireRole,
} = require("../middleware/authMiddleware");
const {
  teacherClassesHandler,
  teacherStudentsHandler,
  teacherTodayAttendanceHandler,
  teacherProfileHandler,
} = require("../controllers/teacherController");

const router = express.Router();

router.use(authenticateAccessToken);
router.use(requireRole("TEACHER"));

router.get("/classes", asyncHandler(teacherClassesHandler));
router.get("/students", asyncHandler(teacherStudentsHandler));
router.get("/attendance/today", asyncHandler(teacherTodayAttendanceHandler));
router.get("/profile", asyncHandler(teacherProfileHandler));

module.exports = { teacherRoutes: router };
