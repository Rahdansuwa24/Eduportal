const express = require('express');
const router = express.Router();
const materiController = require('../controllers/materiController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { uploadMateri } = require('../middleware/uploadMiddleware');

// 1. Ambil Seluruh Materi (Bisa difilter mapel_id / guru_id)
router.get('/', verifyToken, materiController.getAllMateri);

// 2. Download / Buka Berkas Materi
router.get('/:id/download', verifyToken, materiController.downloadMateri);

// 3. Unggah Materi PDF Baru (Guru, Waka, Admin)
router.post('/', verifyToken, checkRole('guru', 'waka', 'admin'), uploadMateri.single('file_materi'), materiController.createMateri);

// 4. Hapus Materi PDF (Guru Pemilik, Waka, Admin)
router.delete('/:id', verifyToken, checkRole('guru', 'waka', 'admin'), materiController.deleteMateri);

module.exports = router;
