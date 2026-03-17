const ApiError = require('../utils/ApiError');

// Simple validation middleware purely for checking required fields
// For complex validation, we can use 'express-validator' or 'joi' later
const validate = (requiredFields) => (req, res, next) => {
  if (!req.body) {
    return next(new ApiError(400, 'Request body is empty'));
  }

  const missing = requiredFields.filter((field) => !req.body[field]);

  if (missing.length > 0) {
    return next(
      new ApiError(400, `Missing required fields: ${missing.join(', ')}`)
    );
  }

  next();
};

module.exports = { validate };
