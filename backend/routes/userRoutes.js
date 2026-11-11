const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Seluruh endpoint di bawah ini khusus untuk role 'admin'
router.get('/', verifyToken, checkRole('admin'), userController.getAllUsers);
router.get('/analytics', verifyToken, checkRole('admin'), userController.getSystemAnalytics);
router.get('/akademik-info', verifyToken, checkRole('admin'), userController.getAcademicInfo);
router.post('/register', verifyToken, checkRole('admin'), userController.registerUser);
router.put('/:id', verifyToken, checkRole('admin'), userController.updateUser);
router.patch('/:id/toggle', verifyToken, checkRole('admin'), userController.toggleActiveStatus);
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUser);

module.exports = router;
