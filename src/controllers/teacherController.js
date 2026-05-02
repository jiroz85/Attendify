const {
  listTeacherClasses,
  listTeacherStudents,
  getTeacherTodayAttendanceCount,
  getTeacherProfile,
} = require("../queries/teacherQueries");

async function teacherClassesHandler(req, res) {
  const rows = await listTeacherClasses(req.user.id);
  res.status(200).json(
    rows.map((r) => ({
      id: r.class_id,
      departmentId: r.department_id,
      academicYearId: r.academic_year_id,
      sectionId: r.section_id,
      departmentName: r.department_name,
      academicYearName: r.academic_year_name,
      sectionName: r.section_name,
    })),
  );
}

async function teacherStudentsHandler(req, res) {
  const rows = await listTeacherStudents(req.user.id);
  res.status(200).json(
    rows.map((r) => ({
      id: r.student_id,
      email: r.email,
      firstName: r.first_name,
      lastName: r.last_name,
      studentNumber: r.student_number,
      classId: r.class_id,
    })),
  );
}

async function teacherTodayAttendanceHandler(req, res) {
  const count = await getTeacherTodayAttendanceCount(req.user.id);
  res.status(200).json({ count });
}

async function teacherProfileHandler(req, res) {
  const profile = await getTeacherProfile(req.user.id);
  res.status(200).json(profile);
}

module.exports = {
  teacherClassesHandler,
  teacherStudentsHandler,
  teacherTodayAttendanceHandler,
  teacherProfileHandler,
};
