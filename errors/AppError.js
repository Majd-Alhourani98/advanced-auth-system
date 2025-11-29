class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  // 400 Bad Request – general client input error
  constructor(message = 'Bad Request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

class AuthenticationError extends AppError {
  // 401 Authentication failed – invalid or missing credentials
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_FAILED');
  }
}

class ForbiddenError extends AppError {
  // 403 Forbidden – user lacks permission to access resource
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  // 404 Not Found – requested resource does not exist
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  // 409 Conflict – request conflicts with current state of resource
  constructor(message = 'Conflict') {
    super(message, 409, 'CONFLICT');
  }
}

class ValidationError extends AppError {
  // 422 Unprocessable Entity – data validation failed
  constructor(message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

class TooManyRequestsError extends AppError {
  // 429 Too Many Requests – rate limiting exceeded
  constructor(message = 'Too many requests') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

class PayloadTooLargeError extends AppError {
  // 413 Payload Too Large – request body exceeds allowed size
  constructor(message = 'Payload too large') {
    super(message, 413, 'PAYLOAD_TOO_LARGE');
  }
}

class RequestTimeoutError extends AppError {
  // 408 Request Timeout – server timed out waiting for client request
  constructor(message = 'Request timeout') {
    super(message, 408, 'REQUEST_TIMEOUT');
  }
}

// 5xx Server Errors

class InternalServerError extends AppError {
  // 500 Internal Server Error – generic server-side failure
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

class ServiceUnavailableError extends AppError {
  // 503 Service Unavailable – server temporarily unable to handle request
  constructor(message = 'Service unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

class DatabaseError extends AppError {
  // 500 Database Error – unexpected database failure
  constructor(message = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

module.exports = {
  AppError,
  BadRequestError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  PayloadTooLargeError,
  RequestTimeoutError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
};
