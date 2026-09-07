const express = require('express');
const router = express.Router();
const mapelController = require('../controllers/mapelController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Get All Mapel (Bisa diakses oleh semua role yang sudah login)
router.get('/', verifyToken, mapelController.getAllMapel);

// CRUD Mapel (Khusus Waka Kurikulum)
router.post('/', verifyToken, checkRole('waka'), mapelController.createMapel);
router.put('/:id', verifyToken, checkRole('waka'), mapelController.updateMapel);
router.delete('/:id', verifyToken, checkRole('waka'), mapelController.deleteMapel);

module.exports = router;
