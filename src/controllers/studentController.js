const {
  getStudentProfileData,
  getStudentClassInfo,
  getStudentRecentAttendance,
} = require("../queries/studentQueries");

async function studentProfileHandler(req, res) {
  const profile = await getStudentProfileData(req.user.id);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.status(200).json(profile);
}

async function studentClassInfoHandler(req, res) {
  const classes = await getStudentClassInfo(req.user.id);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.status(200).json(classes);
}

async function studentRecentAttendanceHandler(req, res) {
  const limit = parseInt(req.query.limit) || 5;
  const attendance = await getStudentRecentAttendance(req.user.id, limit);
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.status(200).json(attendance);
}

module.exports = {
  studentProfileHandler,
  studentClassInfoHandler,
  studentRecentAttendanceHandler,
};
