const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerRules, loginRules, profileRules, validate } = require('../utils/validators');

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.put('/profile',   protect, profileRules, validate, updateProfile);

module.exports = router;
