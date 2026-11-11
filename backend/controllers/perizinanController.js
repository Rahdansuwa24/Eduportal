const db = require('../config/db');

// 1. Submit Form Perizinan & Upload Surat (Siswa)
const submitPerizinanSiswa = async (req, res) => {
    try {
        const siswaId = req.user.id;
        const { alasan, keterangan, tanggal_mulai, tanggal_selesai } = req.body;

        if (!alasan || !tanggal_mulai || !tanggal_selesai) {
            return res.status(400).json({ message: 'Alasan dan rentang tanggal perizinan wajib diisi!' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Berkas bukti surat izin (PDF/Gambar) wajib diunggah!' });
        }

        // Simpan path web relatif
        const bukti_file_path = 'uploads/perizinan/' + req.file.filename;

        const queryText = `
            INSERT INTO perizinan (siswa_id, alasan, keterangan, tanggal_mulai, tanggal_selesai, bukti_file_path, status_acc)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *;
        `;
        const result = await db.query(queryText, [
            siswaId,
            alasan,
            keterangan || '',
            tanggal_mulai,
            tanggal_selesai,
            bukti_file_path
        ]);

        res.status(201).json({
            message: 'Pengajuan perizinan berhasil dikirim. Menunggu verifikasi Guru.',
            perizinan: result.rows[0]
        });
    } catch (err) {
        console.error('Error SubmitPerizinanSiswa:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengajukan perizinan.' });
    }
};

// 2. Ambil Seluruh Pengajuan Perizinan (Guru, Waka, Admin)
const getAllPerizinan = async (req, res) => {
    try {
        const queryText = `
            SELECT 
                p.*,
                u.nama AS nama_siswa,
                u.tingkat_kelas AS kelas,
                g.nama AS disetujui_oleh_guru
            FROM perizinan p
            JOIN users u ON p.siswa_id = u.id
            LEFT JOIN users g ON p.disetujui_oleh_guru_id = g.id
            ORDER BY p.created_at DESC;
        `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetAllPerizinan:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 3. Ambil Riwayat Perizinan Siswa Sendiri (Siswa)
const getMyPerizinan = async (req, res) => {
    try {
        const siswaId = req.user.id;
        const queryText = `
            SELECT 
                p.*,
                g.nama AS disetujui_oleh_guru
            FROM perizinan p
            LEFT JOIN users g ON p.disetujui_oleh_guru_id = g.id
            WHERE p.siswa_id = $1
            ORDER BY p.created_at DESC;
        `;
        const result = await db.query(queryText, [siswaId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetMyPerizinan:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil riwayat perizinan.' });
    }
};

// 4. Verifikasi ACC / Reject Surat Izin oleh Guru (Dengan Finalisasi ke Presensi Siswa)
const verifyPerizinanGuru = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_acc } = req.body; // 'approved' atau 'rejected'
        const guruId = req.user.id;

        if (!['approved', 'rejected'].includes(status_acc)) {
            return res.status(400).json({ message: 'Status ACC harus approved atau rejected.' });
        }

        const queryText = `
            UPDATE perizinan 
            SET status_acc = $1, disetujui_oleh_guru_id = $2
            WHERE id = $3
            RETURNING *;
        `;
        const result = await db.query(queryText, [status_acc, guruId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Data perizinan tidak ditemukan.' });
        }

        const perizinanRow = result.rows[0];

        // FINALISASI KE PRESENSI:
        // Jika surat izin disetujui (approved), sinkronkan presensi siswa pada jadwal aktif menjadi 'izin'
        if (status_acc === 'approved') {
            const siswaId = perizinanRow.siswa_id;
            const alasanClean = perizinanRow.alasan ? perizinanRow.alasan.replace(/_/g, ' ') : 'Izin Siswa';

            const kurikulumList = await db.query(
                `SELECT k.id FROM kurikulum k 
                 JOIN users u ON u.tingkat_kelas = k.tingkat_kelas 
                 WHERE u.id = $1`,
                [siswaId]
            );

            for (const k of kurikulumList.rows) {
                // Update jika sudah ada presensi hari ini
                const updateRes = await db.query(
                    `UPDATE presensi 
                     SET status = 'izin', diubah_oleh_guru_id = $1, catatan_guru = $2
                     WHERE siswa_id = $3 AND kurikulum_id = $4 AND tanggal = CURRENT_DATE
                     RETURNING id`,
                    [guruId, `ACC Surat: ${alasanClean}`, siswaId, k.id]
                );

                // Jika belum ada, buatkan entri presensi 'izin'
                if (updateRes.rows.length === 0) {
                    await db.query(
                        `INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, diubah_oleh_guru_id, catatan_guru, tanggal)
                         VALUES ($1, $2, 'izin', CURRENT_TIMESTAMP, $3, $4, CURRENT_DATE)`,
                        [siswaId, k.id, guruId, `ACC Surat: ${alasanClean}`]
                    );
                }
            }
        }

        // Ambil nama guru verifikator untuk respon instan di UI
        const guruUser = await db.query('SELECT nama FROM users WHERE id = $1', [guruId]);
        const guruNama = guruUser.rows[0]?.nama || 'Guru Pengampu';

        res.json({
            message: `Surat perizinan berhasil ${status_acc === 'approved' ? 'disetujui dan difinalisasi ke rekap presensi siswa' : 'ditolak'}!`,
            perizinan: {
                ...perizinanRow,
                disetujui_oleh_guru: guruNama
            }
        });
    } catch (err) {
        console.error('Error VerifyPerizinanGuru:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat memverifikasi perizinan.' });
    }
};

module.exports = {
    submitPerizinanSiswa,
    getAllPerizinan,
    getMyPerizinan,
    verifyPerizinanGuru
};
