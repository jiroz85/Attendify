const express = require("express");
const { body } = require("express-validator");

const { asyncHandler } = require("../middleware/asyncHandler");
const { validateRequest } = require("../middleware/validateRequest");
const {
  authenticateAccessToken,
  requireRole,
} = require("../middleware/authMiddleware");
const {
  getDepartmentsHandler,
  getAcademicYearsHandler,
  getSectionsHandler,
  getClassesHandler,
  getCoursesHandler,
  createDepartmentHandler,
  createAcademicYearHandler,
  createSectionHandler,
  createClassHandler,
  createCourseHandler,
  listTeachersHandler,
  listStudentsHandler,
  createTeacherHandler,
  createStudentHandler,
  listClassCoursesHandler,
  addClassCourseHandler,
  removeClassCourseHandler,
  listTeacherAssignmentsHandler,
  addTeacherAssignmentHandler,
  removeTeacherAssignmentHandler,
  updateTeacherHandler,
  updateStudentHandler,
  deleteTeacherHandler,
  deleteStudentHandler,
  updateTeacherPasswordHandler,
  updateStudentPasswordHandler,
  deactivateTeacherHandler,
  activateTeacherHandler,
  deactivateStudentHandler,
  activateStudentHandler,
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticateAccessToken);
router.use(requireRole("ADMIN"));

// GET routes
router.get("/departments", asyncHandler(getDepartmentsHandler));
router.get("/academic-years", asyncHandler(getAcademicYearsHandler));
router.get("/sections", asyncHandler(getSectionsHandler));
router.get("/classes", asyncHandler(getClassesHandler));
router.get("/courses", asyncHandler(getCoursesHandler));
router.get("/teachers", asyncHandler(listTeachersHandler));
router.get("/students", asyncHandler(listStudentsHandler));
router.get("/classes/:classId/courses", asyncHandler(listClassCoursesHandler));
router.get("/teacher-assignments", asyncHandler(listTeacherAssignmentsHandler));

// POST routes
router.post(
  "/departments",
  [body("name").isString().trim().escape().isLength({ min: 2, max: 150 })],
  validateRequest,
  asyncHandler(createDepartmentHandler),
);

router.post(
  "/academic-years",
  [
    body("name").isString().trim().escape().isLength({ min: 2, max: 50 }),
    body("sortOrder").optional({ values: "falsy" }).isInt().toInt(),
    body("isActive").optional({ values: "falsy" }).isBoolean().toBoolean(),
  ],
  validateRequest,
  asyncHandler(createAcademicYearHandler),
);

router.post(
  "/sections",
  [body("name").isString().trim().escape().isLength({ min: 1, max: 10 })],
  validateRequest,
  asyncHandler(createSectionHandler),
);

router.post(
  "/classes",
  [
    body("departmentId").isInt({ min: 1 }).toInt(),
    body("academicYearId").isInt({ min: 1 }).toInt(),
    body("sectionId").isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  asyncHandler(createClassHandler),
);

router.post(
  "/courses",
  [
    body("departmentId").isInt({ min: 1 }).toInt(),
    body("code").isString().trim().escape().isLength({ min: 1, max: 30 }),
    body("title").isString().trim().escape().isLength({ min: 2, max: 200 }),
  ],
  validateRequest,
  asyncHandler(createCourseHandler),
);

router.post(
  "/teachers",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 200 }),
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
    body("employeeNumber")
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 50 }),
    body("departmentId")
      .optional({ values: "falsy" })
      .isInt({ min: 1 })
      .toInt(),
  ],
  validateRequest,
  asyncHandler(createTeacherHandler),
);

router.post(
  "/students",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6, max: 200 }),
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
    body("studentNumber")
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 50 }),
    body("classId").isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  asyncHandler(createStudentHandler),
);

router.post(
  "/class-courses",
  [
    body("classId").isInt({ min: 1 }).toInt(),
    body("courseId").isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  asyncHandler(addClassCourseHandler),
);

router.delete(
  "/classes/:classId/courses/:courseId",
  asyncHandler(removeClassCourseHandler),
);

router.post(
  "/teacher-assignments",
  [
    body("teacherId").isInt({ min: 1 }).toInt(),
    body("classId").isInt({ min: 1 }).toInt(),
    body("courseId").isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  asyncHandler(addTeacherAssignmentHandler),
);

router.delete(
  "/teacher-assignments/:id",
  asyncHandler(removeTeacherAssignmentHandler),
);

// PUT routes for updating users
router.put(
  "/teachers",
  [
    body("id").isInt({ min: 1 }).toInt(),
    body("email").isEmail().normalizeEmail(),
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
    body("employeeNumber")
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 50 }),
    body("departmentId")
      .optional({ values: "falsy" })
      .isInt({ min: 1 })
      .toInt(),
  ],
  validateRequest,
  asyncHandler(updateTeacherHandler),
);

router.put(
  "/students",
  [
    body("id").isInt({ min: 1 }).toInt(),
    body("email").isEmail().normalizeEmail(),
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
    body("studentNumber")
      .isString()
      .trim()
      .escape()
      .isLength({ min: 1, max: 50 }),
    body("classId").optional({ values: "falsy" }).isInt({ min: 1 }).toInt(),
  ],
  validateRequest,
  asyncHandler(updateStudentHandler),
);

// DELETE routes for users
router.delete("/teachers/:id", asyncHandler(deleteTeacherHandler));
router.delete("/students/:id", asyncHandler(deleteStudentHandler));

// Password reset routes
router.put(
  "/teachers/password",
  [
    body("id").isInt({ min: 1 }).toInt(),
    body("password").isString().isLength({ min: 6, max: 200 }),
  ],
  validateRequest,
  asyncHandler(updateTeacherPasswordHandler),
);

router.put(
  "/students/password",
  [
    body("id").isInt({ min: 1 }).toInt(),
    body("password").isString().isLength({ min: 6, max: 200 }),
  ],
  validateRequest,
  asyncHandler(updateStudentPasswordHandler),
);

// Status toggle routes
router.put("/teachers/:id/deactivate", asyncHandler(deactivateTeacherHandler));
router.put("/teachers/:id/activate", asyncHandler(activateTeacherHandler));
router.put("/students/:id/deactivate", asyncHandler(deactivateStudentHandler));
router.put("/students/:id/activate", asyncHandler(activateStudentHandler));

module.exports = { adminRoutes: router };
