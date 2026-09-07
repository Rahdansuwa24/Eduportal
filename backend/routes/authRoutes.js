const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public Route (Bisa diakses tanpa token)
router.post('/login', authController.login);

// Protected Route (Harus membawa Token JWT)
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
