const db = require('../config/db');

// 1. Ambil Seluruh Jadwal Kurikulum (JOIN dengan tabel Mapel)
const getAllKurikulum = async (req, res) => {
    try {
        const query = `
            SELECT k.id, k.mapel_id, k.hari, k.waktu_mulai, k.waktu_selesai, k.ruangan, k.tahun_ajaran, k.semester,
                   m.nama_mapel, m.kode_mapel, m.tingkat_kelas, m.jurusan, m.tipe_mapel
            FROM kurikulum k
            JOIN mapel m ON k.mapel_id = m.id
            ORDER BY 
              CASE k.hari
                WHEN 'Senin' THEN 1
                WHEN 'Selasa' THEN 2
                WHEN 'Rabu' THEN 3
                WHEN 'Kamis' THEN 4
                WHEN 'Jumat' THEN 5
                WHEN 'Sabtu' THEN 6
                ELSE 7
              END, k.waktu_mulai ASC;
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error getAllKurikulum:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil jadwal kurikulum.' });
    }
};

// 2. Tambah Jadwal Kurikulum Baru (Khusus Waka / Admin)
const createKurikulum = async (req, res) => {
    const { mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester } = req.body;

    if (!mapel_id || !hari || !waktu_mulai || !waktu_selesai) {
        return res.status(400).json({ message: 'Mapel, Hari, Waktu Mulai, dan Waktu Selesai wajib diisi!' });
    }

    try {
        const query = `
            INSERT INTO kurikulum (mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [
            mapel_id,
            hari,
            waktu_mulai,
            waktu_selesai,
            ruangan || 'Kelas 10 IPA 1',
            tahun_ajaran || '2026/2027',
            semester || 'Ganjil'
        ];
        const result = await db.query(query, values);
        res.status(201).json({
            message: 'Jadwal kurikulum mata pelajaran berhasil ditambahkan!',
            kurikulum: result.rows[0]
        });
    } catch (err) {
        console.error('Error createKurikulum:', err);
        res.status(500).json({ message: 'Gagal menambahkan jadwal kurikulum.' });
    }
};

// 3. Edit Jadwal Kurikulum (Khusus Waka / Admin)
const updateKurikulum = async (req, res) => {
    const { id } = req.params;
    const { mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester } = req.body;

    try {
        const query = `
            UPDATE kurikulum
            SET mapel_id = $1, hari = $2, waktu_mulai = $3, waktu_selesai = $4, ruangan = $5, tahun_ajaran = $6, semester = $7
            WHERE id = $8
            RETURNING *;
        `;
        const values = [
            mapel_id,
            hari,
            waktu_mulai,
            waktu_selesai,
            ruangan,
            tahun_ajaran,
            semester,
            id
        ];
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Jadwal kurikulum tidak ditemukan!' });
        }

        res.json({
            message: 'Jadwal kurikulum berhasil diperbarui!',
            kurikulum: result.rows[0]
        });
    } catch (err) {
        console.error('Error updateKurikulum:', err);
        res.status(500).json({ message: 'Gagal memperbarui jadwal kurikulum.' });
    }
};

// 4. Hapus Jadwal Kurikulum (Khusus Waka / Admin)
const deleteKurikulum = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM kurikulum WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Jadwal kurikulum tidak ditemukan!' });
        }
        res.json({ message: 'Jadwal kurikulum berhasil dihapus.' });
    } catch (err) {
        console.error('Error deleteKurikulum:', err);
        res.status(500).json({ message: 'Gagal menghapus jadwal kurikulum.' });
    }
};

module.exports = {
    getAllKurikulum,
    createKurikulum,
    updateKurikulum,
    deleteKurikulum
};
