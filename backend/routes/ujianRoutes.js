const express = require('express');
const router = express.Router();
const ujianController = require('../controllers/ujianController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { uploadQuizDoc } = require('../middleware/uploadMiddleware');

// 1. Get All Ujian (Bisa diakses seluruh role yang login, siswa hanya approved)
router.get('/', verifyToken, ujianController.getAllUjian);

// 2. Rekap Nilai Semester & Riwayat Ujian Siswa (Siswa) - Wajib sebelum `/:id`
router.get('/my-results', verifyToken, checkRole('siswa'), ujianController.getMyNilaiSemester);

// 3. AI Auto-Generate Quiz dari Berkas PDF (Guru, Waka, Admin)
router.post('/ai-generate', verifyToken, checkRole('guru', 'waka', 'admin'), uploadQuizDoc.single('file_doc'), ujianController.generateAiQuiz);

// 4. Buat Paket Soal Baru (Guru & Waka)
router.post('/', verifyToken, checkRole('guru', 'waka', 'admin'), ujianController.createUjian);

// 5. Submit Jawaban Ujian oleh Siswa (Siswa)
router.post('/:id/submit', verifyToken, checkRole('siswa'), ujianController.submitJawabanUjian);

// 6. Get Detail Ujian + Butir-Butir Soal
router.get('/:id', verifyToken, ujianController.getUjianDetail);

// 7. Verifikasi ACC / Reject Soal Ujian (Khusus Waka Kurikulum & Admin)
router.patch('/:id/acc', verifyToken, checkRole('waka', 'admin'), ujianController.verifyUjianAcc);

// 8. Hapus Paket Ujian (Guru, Waka, Admin)
router.delete('/:id', verifyToken, checkRole('guru', 'waka', 'admin'), ujianController.deleteUjian);

module.exports = router;
