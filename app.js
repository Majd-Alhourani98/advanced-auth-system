const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/auth.routes');
const AppError = require('./errors/AppError');
const globalErrorHandler = require('./middlewares/globalErrorHandler.middleware');

// Express application
const app = express();

// parse incoming JSON requests
app.use(express.json());

// Use Morgan middleware to log HTTP requests
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//  health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(), // How long the server has been running (in seconds)
    message: 'Express server is running 🚀',
  });
});

app.use('/api/v1/auth', authRouter);

app.all('*', (req, res, next) => {
  return next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
