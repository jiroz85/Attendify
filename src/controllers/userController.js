const { ApiError } = require('../utils/ApiError');
const { findUserById } = require('../queries/userQueries');

async function meHandler(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role_code,
    status: user.status_code,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone,
  });
}

module.exports = { meHandler };
