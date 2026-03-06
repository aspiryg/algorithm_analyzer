const express = require('express');
const router = express.Router();
const { register, login, refreshTokens, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/refresh', refreshTokens);
router.post('/logout', optionalAuth, logout);   // optionalAuth so expired-token users can still log out
router.get('/me', protect, getMe);

module.exports = router;
