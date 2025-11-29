const { BadRequestError, ValidationError } = require('../errors/AppError');
const { HTTP_STATUS, RESPONSE_STATUS } = require('../constants/httpConstants');

/**
 * Handle Mongoose CastError (invalid IDs)
 */
const handleCastErrorDB = err => {
  return new BadRequestError(`Invalid ${err.path}: ${err.value}.`);
};

/**
 * Handle duplicate fields error from MongoDB
 */
const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  const message = `Duplicate field ${field}: '${value}'. Please use another value.`;
  return new BadRequestError(message);
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ValidationError(message);
};

/**
 * Send full error details in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

/**
 * Send safe error response in production
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      status: RESPONSE_STATUS.ERROR,
      message: 'Something went wrong',
    });
  }
};

/**
 * Global error handling middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || RESPONSE_STATUS.ERROR;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;
    error.code = err.code;

    // Handle known database errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
