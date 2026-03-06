const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// -- Security headers --
app.use(helmet());

// -- CORS --
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// -- Body parsing --
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -- Request logging (skip in test to keep output clean) --
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// -- Rate limiting for auth endpoints --
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests. Try again later.' },
});
app.use('/api/auth', authLimiter);

// -- Routes --
app.use('/api', routes);

// -- 404 catch-all --
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// -- Global error handler (must be last) --
app.use(errorHandler);

module.exports = app;
