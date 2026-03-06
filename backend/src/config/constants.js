// Central place for app-wide constants.
// Keeps magic strings out of the rest of the codebase.

module.exports = {
  // Token lifetimes (also read from .env, but defaults live here)
  ACCESS_TOKEN_LIFE: process.env.JWT_EXPIRE || '15m',
  REFRESH_TOKEN_LIFE: process.env.JWT_REFRESH_EXPIRE || '7d',

  // Rate limiting
  AUTH_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  AUTH_RATE_LIMIT_MAX: 20,                 // max requests per window

  // User roles -- extend as needed
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Algorithm categories -- we'll reference these throughout the app
  ALGORITHM_CATEGORIES: {
    PATH_FINDING: 'path-finding',
    SORTING: 'sorting',
    TREES: 'trees',
    DYNAMIC_PROGRAMMING: 'dynamic-programming',
    OPTIMIZATION: 'optimization',
  },
};
