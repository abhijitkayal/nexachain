const express = require('express');
const router = express.Router();
const { register, login, getMe, registerSchema, loginSchema } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', verifyJWT, getMe);

module.exports = router;
