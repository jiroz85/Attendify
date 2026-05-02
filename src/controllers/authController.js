const { login, refresh, register } = require("../services/authService");

async function loginHandler(req, res) {
  const result = await login({
    email: req.body.email,
    password: req.body.password,
  });

  res.status(200).json(result);
}

async function refreshHandler(req, res) {
  const result = await refresh({ refreshToken: req.body.refreshToken });
  res.status(200).json(result);
}

async function registerHandler(req, res) {
  const result = await register({
    actor: req.user,
    email: req.body.email,
    password: req.body.password,
    roleCode: req.body.roleCode,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
  });
  res.status(201).json(result);
}

module.exports = { loginHandler, refreshHandler, registerHandler };
