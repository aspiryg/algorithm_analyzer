const { verifyAccessToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Protect routes -- checks for a valid JWT in the Authorization header.
// Attaches the user document to req.user so downstream handlers can use it.
const protect = async (req, res, next) => {
  try {
    let token;

    // Look for the token in the Authorization header first, then cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Not authenticated. Please log in.', 401));
    }

    // Decode and verify
    const decoded = verifyAccessToken(token);

    // Make sure the user still exists (could have been deleted after the token was issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    // jwt errors (expired, malformed, etc.)
    return next(new AppError('Invalid or expired token.', 401));
  }
};

// Restrict access to certain roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

// Like protect, but doesn't reject unauthenticated requests.
// If a valid token is present the user is attached to req.user;
// otherwise req.user stays undefined and the request proceeds normally.
const optionalAuth = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user) req.user = user;
    }
  } catch {
    // token invalid or expired -- that's fine, continue as anonymous
  }
  next();
};

module.exports = { protect, authorize, optionalAuth };
