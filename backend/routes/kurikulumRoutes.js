const express = require('express');
const router = express.Router();
const {
    getAllKurikulum,
    createKurikulum,
    updateKurikulum,
    deleteKurikulum
} = require('../controllers/kurikulumController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Router Jadwal Kurikulum & Waktu Mapel
router.get('/', verifyToken, getAllKurikulum);
router.post('/', verifyToken, checkRole('waka', 'admin'), createKurikulum);
router.put('/:id', verifyToken, checkRole('waka', 'admin'), updateKurikulum);
router.delete('/:id', verifyToken, checkRole('waka', 'admin'), deleteKurikulum);

module.exports = router;
