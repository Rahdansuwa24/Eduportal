const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// 1. Ambil Seluruh Materi Pelajaran (Bisa difilter mapel_id / guru_id)
const getAllMateri = async (req, res) => {
    try {
        const { mapel_id, guru_id } = req.query;
        let queryText = `
            SELECT 
                m.id, 
                m.guru_id, 
                m.mapel_id, 
                m.judul, 
                m.file_path, 
                m.created_at,
                u.nama AS nama_guru,
                u.email AS email_guru,
                mp.nama_mapel,
                mp.kode_mapel,
                mp.tingkat_kelas,
                mp.jurusan,
                mp.tipe_mapel
            FROM materi m
            JOIN users u ON m.guru_id = u.id
            JOIN mapel mp ON m.mapel_id = mp.id
            WHERE 1=1
        `;
        const queryParams = [];

        if (mapel_id) {
            queryParams.push(mapel_id);
            queryText += ` AND m.mapel_id = $${queryParams.length}`;
        }
        if (guru_id) {
            queryParams.push(guru_id);
            queryText += ` AND m.guru_id = $${queryParams.length}`;
        }

        // Jika siswa, filter sesuai kelas siswa
        if (req.user && req.user.role === 'siswa' && req.user.tingkat_kelas) {
            queryParams.push(req.user.tingkat_kelas);
            queryText += ` AND (mp.tingkat_kelas = $${queryParams.length} OR mp.tingkat_kelas = 'semua')`;
        }

        queryText += ' ORDER BY m.created_at DESC';
        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetAllMateri:', err);
        res.status(500).json({ message: 'Gagal mengambil daftar materi pelajaran.' });
    }
};

// 2. Unggah Materi Pelajaran Baru (Khusus Guru & Waka)
const createMateri = async (req, res) => {
    try {
        const guruId = req.user.id;
        const { judul, mapel_id } = req.body;

        if (!judul || !mapel_id) {
            return res.status(400).json({ message: 'Judul materi dan mata pelajaran wajib diisi!' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Berkas materi PDF wajib diunggah!' });
        }

        // Simpan path relatif web-accessible: uploads/materi/filename
        const file_path = 'uploads/materi/' + req.file.filename;

        const queryText = `
            INSERT INTO materi (guru_id, mapel_id, judul, file_path)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(queryText, [guruId, mapel_id, judul, file_path]);

        res.status(201).json({
            message: 'Materi pelajaran berhasil diunggah!',
            materi: result.rows[0]
        });
    } catch (err) {
        console.error('Error CreateMateri:', err);
        res.status(500).json({ message: 'Gagal mengunggah materi pelajaran: ' + err.message });
    }
};

// 3. Download / Akses Berkas Materi PDF
const downloadMateri = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM materi WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Materi tidak ditemukan.' });
        }

        const materi = result.rows[0];
        const fullPath = path.isAbsolute(materi.file_path)
            ? materi.file_path
            : path.join(__dirname, '..', materi.file_path);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'Berkas fisik tidak ditemukan di server.' });
        }

        const cleanTitle = (materi.judul || 'materi').replace(/[^a-zA-Z0-9_\-\s]/g, '_');
        res.download(fullPath, `${cleanTitle}.pdf`);
    } catch (err) {
        console.error('Error DownloadMateri:', err);
        res.status(500).json({ message: 'Gagal mengunduh berkas materi.' });
    }
};

// 4. Hapus Materi Pelajaran (Guru Pemilik, Waka, atau Admin)
const deleteMateri = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await db.query('SELECT * FROM materi WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Materi tidak ditemukan.' });
        }

        const materi = check.rows[0];

        // Validasi kepemilikan jika role guru (hanya bisa hapus materinya sendiri)
        if (req.user.role === 'guru' && materi.guru_id !== req.user.id) {
            return res.status(403).json({ message: 'Anda hanya dapat menghapus materi yang Anda unggah sendiri!' });
        }

        // Hapus file fisik dari disk jika ada
        if (materi.file_path) {
            const fullPath = path.isAbsolute(materi.file_path)
                ? materi.file_path
                : path.join(__dirname, '..', materi.file_path);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (e) {
                    console.warn('Gagal menghapus file fisik materi:', e.message);
                }
            }
        }

        await db.query('DELETE FROM materi WHERE id = $1', [id]);
        res.json({ message: `Materi "${materi.judul}" berhasil dihapus!` });
    } catch (err) {
        console.error('Error DeleteMateri:', err);
        res.status(500).json({ message: 'Gagal menghapus materi pelajaran.' });
    }
};

module.exports = {
    getAllMateri,
    createMateri,
    downloadMateri,
    deleteMateri
};
