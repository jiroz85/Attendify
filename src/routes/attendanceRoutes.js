const express = require("express");
const { body } = require("express-validator");

const { asyncHandler } = require("../middleware/asyncHandler");
const { validateRequest } = require("../middleware/validateRequest");
const {
  authenticateAccessToken,
  requireRole,
  requireSelfOrRole,
} = require("../middleware/authMiddleware");
const {
  markAttendanceHandler,
  attendanceForStudentHandler,
  getTeacherClassAttendanceHandler,
  bulkMarkAttendanceHandler,
  getAttendanceForClassHandler,
  getStudentStatsHandler,
  getAdminStatsHandler,
  getTeacherClassReportsHandler,
  getTeacherStudentReportsHandler,
} = require("../controllers/attendanceController");

const router = express.Router();

router.use(authenticateAccessToken);

router.post(
  "/",
  requireRole("TEACHER", "ADMIN"),
  [
    body("studentId").isInt({ min: 1 }).toInt(),
    body("courseId").isInt({ min: 1 }).toInt(),
    body("classId").isInt({ min: 1 }).toInt(),
    body("attendanceDate").isISO8601({ strict: true }).toDate(),
    body("statusCode")
      .isString()
      .trim()
      .isIn(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  ],
  validateRequest,
  asyncHandler((req, res, next) => {
    // Convert Date object back to YYYY-MM-DD for MySQL DATE
    if (req.body.attendanceDate instanceof Date) {
      const d = req.body.attendanceDate;
      const pad = (n) => String(n).padStart(2, "0");
      req.body.attendanceDate = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    }
    next();
  }),
  asyncHandler(markAttendanceHandler),
);

router.get(
  "/student/:id",
  requireSelfOrRole("id", "ADMIN", "TEACHER", "STUDENT"),
  asyncHandler(attendanceForStudentHandler),
);
router.get(
  "/student/:id/stats",
  requireSelfOrRole("id", "ADMIN", "TEACHER", "STUDENT"),
  asyncHandler(getStudentStatsHandler),
);

router.get(
  "/admin/stats",
  requireRole("ADMIN"),
  asyncHandler(getAdminStatsHandler),
);

// Teacher attendance management routes
router.get(
  "/class/:classId/date/:date",
  requireRole("TEACHER", "ADMIN"),
  asyncHandler(getAttendanceForClassHandler),
);
router.get(
  "/teacher/classes",
  requireRole("TEACHER", "ADMIN"),
  asyncHandler(getTeacherClassAttendanceHandler),
);
router.post(
  "/bulk",
  requireRole("TEACHER", "ADMIN"),
  [
    body("classId").isInt({ min: 1 }).toInt(),
    body("courseId").isInt({ min: 1 }).toInt(),
    body("attendanceDate").isISO8601({ strict: true }).toDate(),
    body("attendance").isArray(),
    body("attendance.*.studentId").isInt({ min: 1 }).toInt(),
    body("attendance.*.statusCode")
      .isString()
      .trim()
      .isIn(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  ],
  validateRequest,
  asyncHandler((req, res, next) => {
    // Convert Date object back to YYYY-MM-DD for MySQL DATE
    if (req.body.attendanceDate instanceof Date) {
      const d = req.body.attendanceDate;
      const pad = (n) => String(n).padStart(2, "0");
      req.body.attendanceDate = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
    }
    next();
  }),
  asyncHandler(bulkMarkAttendanceHandler),
);

// Teacher report routes
router.get(
  "/reports/class",
  requireRole("TEACHER", "ADMIN"),
  asyncHandler(getTeacherClassReportsHandler),
);
router.get(
  "/reports/student",
  requireRole("TEACHER", "ADMIN"),
  asyncHandler(getTeacherStudentReportsHandler),
);

module.exports = { attendanceRoutes: router };
