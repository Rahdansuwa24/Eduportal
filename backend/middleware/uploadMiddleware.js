const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Direktori uploads/perizinan
const uploadDir = path.join(__dirname, '../uploads/perizinan');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Direktori uploads/materi
const materiDir = path.join(__dirname, '../uploads/materi');
if (!fs.existsSync(materiDir)) {
    fs.mkdirSync(materiDir, { recursive: true });
}

// Storage untuk Surat Izin (Disk)
const storageSurat = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilterSurat = (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format berkas tidak diizinkan. Hanya menerima PDF dan Gambar (JPG/PNG/WEBP).'), false);
    }
};

const uploadSurat = multer({
    storage: storageSurat,
    limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5 MB
    fileFilter: fileFilterSurat
});

// Storage untuk Materi Pelajaran (Disk)
const storageMateri = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, materiDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'materi-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilterMateri = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Berkas materi wajib berformat PDF.'), false);
    }
};

const uploadMateri = multer({
    storage: storageMateri,
    limits: { fileSize: 25 * 1024 * 1024 }, // Maksimal 25 MB untuk materi PDF
    fileFilter: fileFilterMateri
});

// Storage untuk AI Quiz Generator (Memory Storage untuk ekstraksi langsung via buffer)
const uploadQuizDoc = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // Maksimal 15 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            cb(null, true);
        } else {
            cb(new Error('Dokumen acuan kuis harus berformat PDF.'), false);
        }
    }
});

module.exports = uploadSurat;
module.exports.uploadSurat = uploadSurat;
module.exports.uploadMateri = uploadMateri;
module.exports.uploadQuizDoc = uploadQuizDoc;

