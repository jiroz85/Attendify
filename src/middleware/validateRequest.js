const { validationResult } = require('express-validator');

const { ApiError } = require('../utils/ApiError');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return next(new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details));
}

module.exports = { validateRequest };
