const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Memastikan folder uploads/perizinan dibuat otomatis jika belum ada
const uploadDir = path.join(__dirname, '../uploads/perizinan');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Lokasi Simpan & Nama File Unik Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadSurat = multer({ storage: storage });

module.exports = uploadSurat;
