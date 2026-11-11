const db = require('../config/db');

// 1. Rekap Presensi Per Mata Pelajaran Hari Ini (Guru, Admin, Waka)
const getPresensiToday = async (req, res) => {
    try {
        const queryText = `
            SELECT 
                p.id AS presensi_id,
                u.id AS siswa_id,
                u.nama AS nama_siswa,
                u.tingkat_kelas AS kelas,
                k.id AS kurikulum_id,
                m.nama_mapel,
                m.kode_mapel,
                k.hari,
                k.waktu_mulai,
                k.waktu_selesai,
                k.ruangan,
                COALESCE(p.status, 'alpa') AS status,
                p.waktu_absen,
                COALESCE(p.is_late, FALSE) AS is_late,
                p.catatan_guru,
                g.nama AS diubah_oleh_guru
            FROM users u
            CROSS JOIN kurikulum k
            JOIN mapel m ON k.mapel_id = m.id
            LEFT JOIN presensi p ON u.id = p.siswa_id AND k.id = p.kurikulum_id AND p.tanggal = CURRENT_DATE
            WHERE u.role = 'siswa'
            ORDER BY 
              CASE k.hari
                WHEN 'Senin' THEN 1
                WHEN 'Selasa' THEN 2
                WHEN 'Rabu' THEN 3
                WHEN 'Kamis' THEN 4
                WHEN 'Jumat' THEN 5
                WHEN 'Sabtu' THEN 6
                ELSE 7
              END, k.waktu_mulai ASC, u.nama ASC;
        `;
        const result = await db.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetPresensiToday:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil presensi per mapel.' });
    }
};

// 2. Submit Absen Per Mata Pelajaran Berdasarkan Waktu Belajar (Siswa)
const submitPresensiSiswa = async (req, res) => {
    try {
        const siswaId = req.user.id;
        const { kurikulum_id } = req.body;

        if (!kurikulum_id) {
            return res.status(400).json({ message: 'Kurikulum / Mata Pelajaran yang di-absen wajib dipilih!' });
        }

        // Ambil info alokasi waktu mapel dari tabel kurikulum
        const kurikulumCheck = await db.query(
            `SELECT k.*, m.nama_mapel FROM kurikulum k JOIN mapel m ON k.mapel_id = m.id WHERE k.id = $1`,
            [kurikulum_id]
        );

        if (kurikulumCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Jadwal mata pelajaran tidak ditemukan!' });
        }

        const jadwal = kurikulumCheck.rows[0];
        const now = new Date();

        // Validasi Hari: Pastikan mapel yang di-absen dijadwalkan pada hari ini
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDayName = dayNames[now.getDay()];

        if (jadwal.hari && jadwal.hari.toLowerCase() !== currentDayName.toLowerCase()) {
            return res.status(400).json({
                message: `Presensi mata pelajaran "${jadwal.nama_mapel}" hanya dibuka pada hari ${jadwal.hari}. Hari ini adalah hari ${currentDayName}.`
            });
        }

        const currentTimeStr = now.toTimeString().split(' ')[0]; // 'HH:mm:ss'

        // Cek Keterlambatan: Jika absen lebih dari 15 menit setelah waktu_mulai mapel
        const [hStart, mStart] = jadwal.waktu_mulai.split(':').map(Number);
        const startTimeInMinutes = hStart * 60 + mStart;
        const nowInMinutes = now.getHours() * 60 + now.getMinutes();

        const isLate = nowInMinutes > (startTimeInMinutes + 15);
        const status = 'hadir';

        // Validasi: Cek apakah siswa sudah melakukan presensi untuk mapel ini hari ini
        const existingRecord = await db.query(
            `SELECT id, waktu_absen, is_late FROM presensi WHERE siswa_id = $1 AND kurikulum_id = $2 AND tanggal = CURRENT_DATE`,
            [siswaId, kurikulum_id]
        );

        if (existingRecord.rows.length > 0) {
            return res.status(400).json({
                message: `Anda sudah melakukan presensi untuk mata pelajaran "${jadwal.nama_mapel}" hari ini dan tidak dapat melakukan absensi ulang.`
            });
        }

        const insertQuery = `
            INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, is_late, tanggal)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_DATE)
            RETURNING *;
        `;
        const result = await db.query(insertQuery, [siswaId, kurikulum_id, status, isLate]);

        res.json({
            message: isLate 
                ? `Presensi Mapel "${jadwal.nama_mapel}" Berhasil tetapi Anda Terlambat (lewat 15 menit dari jam ${jadwal.waktu_mulai.substring(0, 5)} WIB).`
                : `Presensi Tepat Waktu Berhasil untuk Mapel "${jadwal.nama_mapel}"!`,
            presensi: result.rows[0]
        });
    } catch (err) {
        console.error('Error SubmitPresensiSiswa:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat submit presensi mapel.' });
    }
};

// 3. Pop-up Override Status Presensi Per Mapel oleh Guru (Dapat Diubah Berkali-kali)
const overridePresensiGuru = async (req, res) => {
    try {
        const { presensi_id, siswa_id, kurikulum_id, status, catatan_guru } = req.body;
        const guruId = req.user.id; // Diambil dari JWT Auth

        if (!status) {
            return res.status(400).json({ message: 'Status baru wajib dipilih!' });
        }

        let result;
        if (presensi_id) {
            const updateQuery = `
                UPDATE presensi 
                SET status = $1, diubah_oleh_guru_id = $2, catatan_guru = $3, waktu_absen = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *;
            `;
            result = await db.query(updateQuery, [status, guruId, catatan_guru || '', presensi_id]);
        } else if (siswa_id && kurikulum_id) {
            // Jika siswa belum ada record presensi (masih null/alpa), buatkan record baru oleh guru
            const insertQuery = `
                INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, diubah_oleh_guru_id, catatan_guru, tanggal)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, CURRENT_DATE)
                RETURNING *;
            `;
            result = await db.query(insertQuery, [siswa_id, kurikulum_id, status, guruId, catatan_guru || '']);
        } else {
            return res.status(400).json({ message: 'Presensi ID atau kombinasi Siswa ID & Kurikulum ID wajib diisi!' });
        }

        res.json({
            message: 'Status presensi mapel siswa berhasil di-override oleh Guru!',
            presensi: result.rows[0]
        });
    } catch (err) {
        console.error('Error OverridePresensiGuru:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat override presensi.' });
    }
};

// 4. Ambil Riwayat Presensi Siswa Sendiri
const getMyPresensi = async (req, res) => {
    try {
        const siswaId = req.user.id;
        const queryText = `
            SELECT 
                p.id AS presensi_id,
                p.kurikulum_id,
                p.status,
                p.waktu_absen,
                p.is_late,
                TO_CHAR(p.tanggal, 'YYYY-MM-DD') AS tanggal_str,
                p.tanggal,
                p.catatan_guru,
                k.hari,
                k.waktu_mulai,
                k.waktu_selesai,
                k.ruangan,
                m.nama_mapel,
                m.kode_mapel,
                g.nama AS diubah_oleh_guru
            FROM presensi p
            JOIN kurikulum k ON p.kurikulum_id = k.id
            JOIN mapel m ON k.mapel_id = m.id
            LEFT JOIN users g ON p.diubah_oleh_guru_id = g.id
            WHERE p.siswa_id = $1
            ORDER BY p.tanggal DESC, p.waktu_absen DESC;
        `;
        const result = await db.query(queryText, [siswaId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetMyPresensi:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server saat mengambil riwayat presensi.' });
    }
};

module.exports = { getPresensiToday, submitPresensiSiswa, overridePresensiGuru, getMyPresensi };
