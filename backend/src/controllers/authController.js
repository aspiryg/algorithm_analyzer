const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokenUtils');

// Hash a refresh token before persisting it in the database.
const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// Helper: set tokens as httpOnly cookies AND return them in the response body.
// The cookies path handles browser-based usage; the body handles API clients.
const sendTokens = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // persist a *hash* of the refresh token so a DB compromise doesn't yield usable tokens
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/auth/register
const register = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body;

  // check if user already exists (mongoose unique index also catches this,
  // but we want a cleaner error message)
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    return next(new AppError(`A user with that ${field} already exists.`, 409));
  }

  const user = await User.create({ username, email, password });
  await sendTokens(user, 201, res);
});

// POST /api/auth/login
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // explicitly select password because the schema excludes it by default
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  await sendTokens(user, 200, res);
});

// POST /api/auth/refresh
// Takes a refresh token and returns a new access + refresh token pair.
const refreshTokens = catchAsync(async (req, res, next) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;

  if (!token) {
    return next(new AppError('No refresh token provided.', 401));
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== hashToken(token)) {
    return next(new AppError('Refresh token has been revoked.', 401));
  }

  await sendTokens(user, 200, res);
});

// POST /api/auth/logout
const logout = catchAsync(async (req, res) => {
  // clear refresh token from DB
  if (req.user) {
    req.user.refreshToken = null;
    await req.user.save({ validateBeforeSave: false });
  }

  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
  res.status(200).json({ success: true, message: 'Logged out.' });
});

// GET /api/auth/me -- return current user info
const getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = { register, login, refreshTokens, logout, getMe };
