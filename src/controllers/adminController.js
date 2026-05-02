const { ApiError } = require("../utils/ApiError");
const {
  getDepartments,
  getAcademicYears,
  getSections,
  getClasses,
  getCourses,
  createDepartment,
  createAcademicYear,
  createSection,
  createClass,
  createCourse,
  listClassCourses,
  addCourseToClass,
  removeCourseFromClass,
  listTeachers,
  listStudents,
  createTeacherUser,
  createStudentUser,
  listTeacherAssignments,
  addTeacherAssignment,
  removeTeacherAssignment,
  updateTeacher,
  updateStudent,
  deleteTeacher,
  deleteStudent,
  updateTeacherPassword,
  updateStudentPassword,
  deactivateTeacher,
  activateTeacher,
  deactivateStudent,
  activateStudent,
} = require("../queries/adminQueries");

async function getDepartmentsHandler(req, res) {
  const departments = await getDepartments();
  res.json(departments);
}

async function getAcademicYearsHandler(req, res) {
  const rows = await getAcademicYears();
  res.json(rows);
}

async function getSectionsHandler(req, res) {
  const rows = await getSections();
  res.json(rows);
}

async function getClassesHandler(req, res) {
  const classes = await getClasses();
  res.json(classes);
}

async function getCoursesHandler(req, res) {
  const courses = await getCourses();
  res.json(courses);
}

async function createDepartmentHandler(req, res) {
  try {
    const id = await createDepartment({
      name: req.body.name,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Department already exists");
    }
    throw err;
  }
}

async function createAcademicYearHandler(req, res) {
  try {
    const id = await createAcademicYear({
      name: req.body.name,
      sortOrder: req.body.sortOrder,
      isActive: req.body.isActive,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Academic year already exists");
    }
    throw err;
  }
}

async function createSectionHandler(req, res) {
  try {
    const id = await createSection({
      name: req.body.name,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Section already exists");
    }
    throw err;
  }
}

async function createClassHandler(req, res) {
  try {
    const id = await createClass({
      departmentId: req.body.departmentId,
      academicYearId: req.body.academicYearId,
      sectionId: req.body.sectionId,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Class already exists");
    }
    throw err;
  }
}

async function createCourseHandler(req, res) {
  try {
    const id = await createCourse({
      departmentId: req.body.departmentId,
      code: req.body.code,
      title: req.body.title,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Course already exists");
    }
    throw err;
  }
}

async function listTeachersHandler(req, res) {
  const rows = await listTeachers();
  res.status(200).json(rows);
}

async function listStudentsHandler(req, res) {
  const rows = await listStudents();
  res.status(200).json(rows);
}

async function createTeacherHandler(req, res) {
  try {
    const id = await createTeacherUser({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      employeeNumber: req.body.employeeNumber,
      departmentId: req.body.departmentId,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Teacher already exists");
    }
    throw err;
  }
}

async function createStudentHandler(req, res) {
  try {
    const id = await createStudentUser({
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      studentNumber: req.body.studentNumber,
      classId: req.body.classId,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Student already exists");
    }
    throw err;
  }
}

async function listClassCoursesHandler(req, res) {
  const classId = Number(req.params.classId);
  if (!Number.isFinite(classId) || classId < 1) {
    throw new ApiError(422, "Invalid class id");
  }
  const rows = await listClassCourses(classId);
  res.status(200).json(rows);
}

async function addClassCourseHandler(req, res) {
  try {
    await addCourseToClass({
      classId: req.body.classId,
      courseId: req.body.courseId,
      createdBy: req.user.id,
    });
    res.status(201).json({ status: "ok" });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Course already assigned to class");
    }
    throw err;
  }
}

async function removeClassCourseHandler(req, res) {
  const classId = Number(req.params.classId);
  const courseId = Number(req.params.courseId);
  if (!Number.isFinite(classId) || classId < 1) {
    throw new ApiError(422, "Invalid class id");
  }
  if (!Number.isFinite(courseId) || courseId < 1) {
    throw new ApiError(422, "Invalid course id");
  }

  try {
    const affected = await removeCourseFromClass({ classId, courseId });
    res.status(200).json({ status: "ok", affected });
  } catch (err) {
    if (err && err.code === "ER_ROW_IS_REFERENCED_2") {
      throw new ApiError(409, "Cannot remove course from class (in use)");
    }
    throw err;
  }
}

async function listTeacherAssignmentsHandler(req, res) {
  const rows = await listTeacherAssignments();
  res.status(200).json(rows);
}

async function addTeacherAssignmentHandler(req, res) {
  try {
    const id = await addTeacherAssignment({
      teacherId: req.body.teacherId,
      classId: req.body.classId,
      courseId: req.body.courseId,
      createdBy: req.user.id,
    });
    res.status(201).json({ id });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      throw new ApiError(409, "Assignment already exists");
    }
    throw err;
  }
}

async function removeTeacherAssignmentHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid assignment id");
  }
  const affected = await removeTeacherAssignment({ id });
  res.status(200).json({ status: "ok", affected });
}

async function updateTeacherHandler(req, res) {
  const {
    id,
    email,
    firstName,
    lastName,
    phone,
    employeeNumber,
    departmentId,
  } = req.body;

  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid teacher id");
  }

  await updateTeacher({
    id,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    employeeNumber,
    departmentId: departmentId ? Number(departmentId) : null,
    updatedBy: req.user.id,
  });

  res.status(200).json({ status: "ok" });
}

async function updateStudentHandler(req, res) {
  const { id, email, firstName, lastName, phone, studentNumber, classId } =
    req.body;

  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  await updateStudent({
    id,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
    studentNumber,
    classId: classId ? Number(classId) : null,
    updatedBy: req.user.id,
  });

  res.status(200).json({ status: "ok" });
}

async function deleteTeacherHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid teacher id");
  }

  try {
    await deleteTeacher(id);
    res.status(200).json({ status: "ok" });
  } catch (error) {
    if (error.message.includes("attendance records")) {
      throw new ApiError(409, error.message);
    }
    throw error;
  }
}

async function deleteStudentHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  await deleteStudent(id);
  res.status(200).json({ status: "ok" });
}

async function updateTeacherPasswordHandler(req, res) {
  const { id, password } = req.body;

  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid teacher id");
  }

  if (!password || password.length < 6) {
    throw new ApiError(422, "Password must be at least 6 characters");
  }

  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  await updateTeacherPassword({ id, passwordHash, updatedBy: req.user.id });
  res.status(200).json({ status: "ok" });
}

async function updateStudentPasswordHandler(req, res) {
  const { id, password } = req.body;

  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  if (!password || password.length < 6) {
    throw new ApiError(422, "Password must be at least 6 characters");
  }

  const bcrypt = require("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  await updateStudentPassword({ id, passwordHash, updatedBy: req.user.id });
  res.status(200).json({ status: "ok" });
}

async function deactivateTeacherHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid teacher id");
  }

  const success = await deactivateTeacher(id, req.user.id);
  if (!success) {
    throw new ApiError(404, "Teacher not found");
  }
  res.status(200).json({ status: "ok" });
}

async function activateTeacherHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid teacher id");
  }

  const success = await activateTeacher(id, req.user.id);
  if (!success) {
    throw new ApiError(404, "Teacher not found");
  }
  res.status(200).json({ status: "ok" });
}

async function deactivateStudentHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  const success = await deactivateStudent(id, req.user.id);
  if (!success) {
    throw new ApiError(404, "Student not found");
  }
  res.status(200).json({ status: "ok" });
}

async function activateStudentHandler(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) {
    throw new ApiError(422, "Invalid student id");
  }

  const success = await activateStudent(id, req.user.id);
  if (!success) {
    throw new ApiError(404, "Student not found");
  }
  res.status(200).json({ status: "ok" });
}

module.exports = {
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
};
