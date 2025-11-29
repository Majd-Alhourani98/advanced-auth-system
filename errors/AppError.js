import { HTTP_MESSAGE, HTTP_STATUS, ERROR_CODE } from '../constants/httpConstants.js';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = ERROR_CODE.INTERNAL_SERVER_ERROR) {
    super(message);

    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = HTTP_MESSAGE.BAD_REQUEST) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODE.BAD_REQUEST);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = HTTP_MESSAGE.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODE.AUTHENTICATION_FAILED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = HTTP_MESSAGE.FORBIDDEN) {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODE.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = HTTP_MESSAGE.NOT_FOUND) {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = HTTP_MESSAGE.CONFLICT) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODE.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message = HTTP_MESSAGE.UNPROCESSABLE_ENTITY) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODE.VALIDATION_ERROR);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = HTTP_MESSAGE.TOO_MANY_REQUESTS) {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODE.TOO_MANY_REQUESTS);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = HTTP_MESSAGE.PAYLOAD_TOO_LARGE) {
    super(message, HTTP_STATUS.PAYLOAD_TOO_LARGE, ERROR_CODE.PAYLOAD_TOO_LARGE);
  }
}

export class RequestTimeoutError extends AppError {
  constructor(message = HTTP_MESSAGE.REQUEST_TIMEOUT) {
    super(message, HTTP_STATUS.REQUEST_TIMEOUT, ERROR_CODE.REQUEST_TIMEOUT);
  }
}

// 5xx Server Errors

export class InternalServerError extends AppError {
  constructor(message = HTTP_MESSAGE.INTERNAL_SERVER_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODE.INTERNAL_SERVER_ERROR);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = HTTP_MESSAGE.SERVICE_UNAVAILABLE) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, ERROR_CODE.SERVICE_UNAVAILABLE);
  }
}

export class DatabaseError extends AppError {
  constructor(message = HTTP_MESSAGE.INTERNAL_SERVER_ERROR) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODE.DATABASE_ERROR);
  }
}
