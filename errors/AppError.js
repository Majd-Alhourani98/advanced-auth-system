class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode <= 500 ? 'fail' : 'error';
    this.isOperational = isOperational;

    // Captures stack trace, removes constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
