class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
  
    // Log error for development
    console.error(err.stack);
  
    res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  };
  
  module.exports = {
    ApiError,
    errorHandler
  };