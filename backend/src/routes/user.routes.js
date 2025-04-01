const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/user/profile - Get user profile
router.get('/profile', userController.getUserProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', userController.updateUserProfile);

// POST /api/user/mt-account - Add MT5/MT4 account
router.post('/mt-account', userController.addMTAccount);

// DELETE /api/user/mt-account/:accountNumber/:server - Remove MT5/MT4 account
router.delete('/mt-account/:accountNumber/:server', userController.removeMTAccount);

// GET /api/user/model-config - Get user model configuration
router.get('/model-config', userController.getModelConfig);

// PUT /api/user/model-config - Update user model configuration
router.put('/model-config', userController.updateModelConfig);

module.exports = router;
