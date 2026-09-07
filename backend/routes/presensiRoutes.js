const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Rekap Presensi Hari Ini (Guru, Admin, Waka)
router.get('/today', verifyToken, checkRole('guru', 'admin', 'waka'), presensiController.getPresensiToday);

// Submit Presensi Siswa Harian (Siswa)
router.post('/submit', verifyToken, checkRole('siswa'), presensiController.submitPresensiSiswa);

// Pop-up Override Status Presensi oleh Guru (Guru)
router.patch('/override', verifyToken, checkRole('guru'), presensiController.overridePresensiGuru);

module.exports = router;
