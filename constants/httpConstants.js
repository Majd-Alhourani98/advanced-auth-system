export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const HTTP_MESSAGE = {
  // Success messages
  OK: 'Request successful',
  CREATED: 'Resource created successfully',
  ACCEPTED: 'Request accepted',
  NO_CONTENT: 'No content',

  // Client errors
  BAD_REQUEST: 'Bad request',
  UNAUTHORIZED: 'Authentication failed',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  REQUEST_TIMEOUT: 'Request timeout',
  CONFLICT: 'Conflict',
  PAYLOAD_TOO_LARGE: 'Payload too large',
  UNPROCESSABLE_ENTITY: 'Validation failed',
  TOO_MANY_REQUESTS: 'Too many requests',

  // Server errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service unavailable',
};

export const ERROR_CODE = {
  BAD_REQUEST: 'BAD_REQUEST',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  CONFLICT: 'CONFLICT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
};

export const RESPONSE_STATUS = {
  SUCCESS: 'success', // for successful requests (2xx)
  FAIL: 'fail', // for client errors (4xx)
  ERROR: 'error', // for server errors (5xx)
};
