const express = require('express');
const router = express.Router();
const perizinanController = require('../controllers/perizinanController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const uploadSurat = require('../middleware/uploadMiddleware');

// Submit Form Perizinan + Upload Berkas Bukti (Siswa)
router.post('/submit', verifyToken, checkRole('siswa'), uploadSurat.single('bukti_surat'), perizinanController.submitPerizinanSiswa);

// Ambil Seluruh Pengajuan Perizinan (Guru, Waka, Admin)
router.get('/', verifyToken, checkRole('guru', 'waka', 'admin'), perizinanController.getAllPerizinan);

// Verifikasi ACC / Reject Surat Izin oleh Guru (Guru)
router.patch('/:id/acc', verifyToken, checkRole('guru'), perizinanController.verifyPerizinanGuru);

module.exports = router;
