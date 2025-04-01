const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/login - Authenticate user with MT5/MT4 credentials
router.post('/login', authController.login);

// GET /api/auth/me - Get current user information
router.get('/me', authController.getCurrentUser);

// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout);

// GET /api/auth/verify - Verify token and return user info
router.get('/verify', authController.verifyToken);

module.exports = router;
