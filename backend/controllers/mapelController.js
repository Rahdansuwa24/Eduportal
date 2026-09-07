const db = require('../config/db');

// 1. Get All Mapel (Dapat difilter berdasarkan Tingkat Kelas / Jurusan / Tipe Mapel)
const getAllMapel = async (req, res) => {
    try {
        const { tingkat_kelas, jurusan, tipe_mapel } = req.query;
        let queryText = 'SELECT * FROM mapel WHERE 1=1';
        const queryParams = [];

        if (tingkat_kelas) {
            queryParams.push(tingkat_kelas);
            queryText += ` AND (tingkat_kelas = $${queryParams.length} OR tingkat_kelas = 'semua')`;
        }
        if (jurusan) {
            queryParams.push(jurusan);
            queryText += ` AND (jurusan = $${queryParams.length} OR jurusan = 'UMUM')`;
        }
        if (tipe_mapel) {
            queryParams.push(tipe_mapel);
            queryText += ` AND tipe_mapel = $${queryParams.length}`;
        }

        queryText += ' ORDER BY id ASC';
        const result = await db.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetAllMapel:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 2. Tambah Mapel Baru (Waka)
const createMapel = async (req, res) => {
    try {
        const { nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel } = req.body;

        if (!nama_mapel || !kode_mapel) {
            return res.status(400).json({ message: 'Nama mapel dan kode mapel wajib diisi!' });
        }

        const queryText = `
            INSERT INTO mapel (nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const result = await db.query(queryText, [
            nama_mapel,
            kode_mapel,
            tingkat_kelas || '10',
            jurusan || 'UMUM',
            tipe_mapel || 'wajib'
        ]);

        res.status(201).json({ message: 'Mata pelajaran berhasil ditambahkan!', mapel: result.rows[0] });
    } catch (err) {
        console.error('Error CreateMapel:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 3. Edit Mapel (Waka)
const updateMapel = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel } = req.body;

        const queryText = `
            UPDATE mapel 
            SET nama_mapel = $1, kode_mapel = $2, tingkat_kelas = $3, jurusan = $4, tipe_mapel = $5
            WHERE id = $6
            RETURNING *;
        `;
        const result = await db.query(queryText, [nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Mapel tidak ditemukan.' });
        }

        res.json({ message: 'Mapel berhasil diperbarui!', mapel: result.rows[0] });
    } catch (err) {
        console.error('Error UpdateMapel:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 4. Hapus Mapel (Waka)
const deleteMapel = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM mapel WHERE id = $1', [id]);
        res.json({ message: 'Mapel berhasil dihapus.' });
    } catch (err) {
        console.error('Error DeleteMapel:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

module.exports = { getAllMapel, createMapel, updateMapel, deleteMapel };
