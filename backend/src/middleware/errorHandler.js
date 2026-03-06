const AppError = require('../utils/AppError');

// Global error handling middleware.
// Every error that gets passed to next(err) ends up here.

const errorHandler = (err, req, res, _next) => {
  // clone so we don't mutate the original
  let error = { ...err, message: err.message };

  // log the full error in dev for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found (invalid id: ${err.value})`, 400);
  }

  // Mongoose duplicate key (e.g. trying to register with an existing email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`Duplicate value for "${field}". Please use another.`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join('. '), 400);
  }

  // JWT errors are already handled in the auth middleware,
  // but just in case one slips through:
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token has expired.', 401);
  }

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
