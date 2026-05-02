const { logger } = require('../config/logger');
const { ApiError } = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  const apiErr = err instanceof ApiError ? err : new ApiError(500, 'Internal Server Error');

  if (!(err instanceof ApiError)) {
    logger.error('Unhandled error', err);
  }

  res.status(apiErr.statusCode).json({
    error: {
      message: apiErr.message,
      code: apiErr.code,
      details: apiErr.details,
    },
  });
}

module.exports = { errorHandler };
