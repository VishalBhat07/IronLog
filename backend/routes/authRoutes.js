const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register User
router.post('/register', authController.register);

// Login User
router.post('/login', authController.login);

// Get User (Projected) - Protected
router.get('/me', authMiddleware, authController.getMe);

// Update Profile
router.put('/profile', authMiddleware, authController.updateProfile);

// Clear Data
router.delete('/data', authMiddleware, authController.clearData);

// Delete Account
router.delete('/me', authMiddleware, authController.deleteAccount);

// Seed Weights (Temp)
router.post('/seed-weights', authMiddleware, authController.seedWeights);

module.exports = router;
