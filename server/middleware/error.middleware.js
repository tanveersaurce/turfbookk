export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev environment
  if (process.env.NODE_ENV !== 'production') {
    console.error('💥 Error Stack:', err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }

  // Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered: '${err.keyValue[field]}' for field '${field}'. Please use another value.`;
    error = { status: 400, message };
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { status: 400, message };
  }

  // JWT Signature Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid web token. Access denied.';
    error = { status: 401, message };
  }

  // JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const message = 'Session token has expired. Please login again.';
    error = { status: 401, message };
  }

  // Zod Validation Errors (if any reach here)
  if (err.issues && Array.isArray(err.issues)) {
    const message = err.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
    error = { status: 400, message };
  }

  const statusCode = error.status || err.statusCode || 500;
  const responseMessage = error.message || err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
