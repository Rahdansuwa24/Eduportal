const db = require('../config/db');
const bcrypt = require('bcryptjs');
const os = require('os');
const { addYears, addMonths, format } = require('date-fns');
const { getAcademicContext } = require('../services/cronScheduler');

// Helper: Ambil informasi akademik sekolah & default tanggal untuk registrasi
const getAcademicInfo = async (req, res) => {
    try {
        const today = new Date();
        const { semester, tahunAjaran } = getAcademicContext(today);

        // Auto-calculate tanggal masuk (hari ini) & tanggal lulus (+3 tahun +1 bulan)
        const tglMasukDefault = format(today, 'yyyy-MM-dd');
        const tglLulusDefault = format(addMonths(addYears(today, 3), 1), 'yyyy-MM-dd');

        // Ambil data dari database jika ada
        const schoolSettings = await db.query('SELECT tahun_ajaran_aktif, semester_aktif FROM pengaturan_sekolah WHERE id = 1');
        const currentSettings = schoolSettings.rows[0] || { tahun_ajaran_aktif: tahunAjaran, semester_aktif: semester };

        res.json({
            tahun_ajaran_aktif: currentSettings.tahun_ajaran_aktif,
            semester_aktif: currentSettings.semester_aktif,
            tanggal_masuk_default: tglMasukDefault,
            tanggal_lulus_default: tglLulusDefault
        });
    } catch (err) {
        console.error('Error GetAcademicInfo:', err);
        res.status(500).json({ message: 'Gagal mengambil informasi akademik.' });
    }
};

// 1. Ambil Seluruh Daftar User (Admin) - Dengan Auto-Check Kelulusan
const getAllUsers = async (req, res) => {
    try {
        // Auto update status kelulusan jika tanggal_lulus <= hari ini
        await db.query(`
            UPDATE users 
            SET status_siswa = 'lulus' 
            WHERE role = 'siswa' 
              AND status_siswa = 'aktif' 
              AND tanggal_lulus IS NOT NULL 
              AND tanggal_lulus <= CURRENT_DATE
        `);

        const result = await db.query(`
            SELECT id, nama, email, role, tingkat_kelas, jurusan, 
                   tanggal_masuk, tanggal_lulus, status_siswa, is_active, created_at 
            FROM users 
            ORDER BY id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error GetAllUsers:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 2. Registrasi Akun Baru Terpusat oleh Admin (Mendukung Single maupun Multiple Users Sekaligus)
const registerUser = async (req, res) => {
    try {
        // Cek apakah request berupa array multiple users atau single user
        const rawUsers = Array.isArray(req.body.users) 
            ? req.body.users 
            : (Array.isArray(req.body) ? req.body : [req.body]);

        if (!rawUsers || rawUsers.length === 0) {
            return res.status(400).json({ message: 'Data pengguna tidak boleh kosong!' });
        }

        // Validasi kelengkapan field wajib
        for (let i = 0; i < rawUsers.length; i++) {
            const u = rawUsers[i];
            if (!u.nama || !u.email || !u.role) {
                return res.status(400).json({ 
                    message: `Baris #${i + 1} (${u.nama || 'Tanpa Nama'}): Nama, email, dan role wajib diisi!` 
                });
            }
        }

        // Kumpulkan semua email yang akan didaftarkan untuk cek duplikasi di database
        const emails = rawUsers.map(u => u.email.trim().toLowerCase());
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
            return res.status(400).json({ message: 'Terdapat email duplikat di dalam daftar pendaftaran!' });
        }

        const existingUsers = await db.query('SELECT email FROM users WHERE LOWER(email) = ANY($1)', [emails]);
        if (existingUsers.rows.length > 0) {
            const registeredEmails = existingUsers.rows.map(r => r.email).join(', ');
            return res.status(400).json({ 
                message: `Email berikut sudah digunakan oleh akun lain: ${registeredEmails}` 
            });
        }

        const insertedUsers = [];
        const today = new Date();
        const defaultTglMasuk = format(today, 'yyyy-MM-dd');
        const defaultTglLulus = format(addMonths(addYears(today, 3), 1), 'yyyy-MM-dd');

        // Insert setiap user ke database
        for (const u of rawUsers) {
            const passwordToHash = u.password && u.password.trim() !== '' ? u.password : 'password123';
            const password_hash = await bcrypt.hash(passwordToHash, 10);
            
            const userRole = u.role;
            const userKelas = userRole === 'siswa' ? (u.tingkat_kelas || '10') : 'staff';
            const userJurusan = userRole === 'siswa' ? (u.jurusan || 'MIPA') : null;
            const userTglMasuk = userRole === 'siswa' ? (u.tanggal_masuk || defaultTglMasuk) : null;
            const userTglLulus = userRole === 'siswa' ? (u.tanggal_lulus || defaultTglLulus) : null;
            const userStatus = userRole === 'siswa' ? (u.status_siswa || 'aktif') : 'aktif';

            const queryText = `
                INSERT INTO users (nama, email, password_hash, role, tingkat_kelas, jurusan, tanggal_masuk, tanggal_lulus, status_siswa, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
                RETURNING id, nama, email, role, tingkat_kelas, jurusan, tanggal_masuk, tanggal_lulus, status_siswa, is_active, created_at;
            `;
            const result = await db.query(queryText, [
                u.nama.trim(),
                u.email.trim().toLowerCase(),
                password_hash,
                userRole,
                userKelas,
                userJurusan,
                userTglMasuk,
                userTglLulus,
                userStatus
            ]);
            insertedUsers.push(result.rows[0]);
        }

        res.status(201).json({
            message: `Berhasil mendaftarkan ${insertedUsers.length} akun pengguna!`,
            count: insertedUsers.length,
            users: insertedUsers,
            user: insertedUsers[0]
        });

    } catch (err) {
        console.error('Error RegisterUser:', err);
        res.status(500).json({ message: `Gagal mendaftarkan user: ${err.message}` });
    }
};

// 3. Toggle Status Aktif / Nonaktif Akun (Admin)
const toggleActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const checkUser = await db.query('SELECT is_active FROM users WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        const newStatus = !checkUser.rows[0].is_active;
        await db.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id]);

        res.json({
            message: `Status akun berhasil diubah menjadi ${newStatus ? 'AKTIF' : 'NONAKTIF'}!`,
            is_active: newStatus
        });
    } catch (err) {
        console.error('Error ToggleActiveStatus:', err);
        res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
};

// 4. Update / Edit Data User (Admin)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, email, role, tingkat_kelas, jurusan, password, tanggal_masuk, tanggal_lulus, status_siswa } = req.body;

        if (!nama || !email || !role) {
            return res.status(400).json({ message: 'Nama, email, dan role wajib diisi!' });
        }

        // Cek user yang akan diedit
        const checkUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan!' });
        }

        // Cek apakah email sudah digunakan oleh user lain
        const checkEmail = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2', [email.trim(), id]);
        if (checkEmail.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain!' });
        }

        const userKelas = role === 'siswa' ? (tingkat_kelas || '10') : 'staff';
        const userJurusan = role === 'siswa' ? (jurusan || 'MIPA') : null;
        const userTglMasuk = role === 'siswa' ? (tanggal_masuk || null) : null;
        const userTglLulus = role === 'siswa' ? (tanggal_lulus || null) : null;
        const userStatus = role === 'siswa' ? (status_siswa || 'aktif') : 'aktif';

        let queryText = '';
        let queryParams = [];

        // Jika password diisi, update password hash-nya juga
        if (password && password.trim() !== '') {
            const password_hash = await bcrypt.hash(password.trim(), 10);
            queryText = `
                UPDATE users 
                SET nama = $1, email = $2, role = $3, tingkat_kelas = $4, jurusan = $5, 
                    tanggal_masuk = $6, tanggal_lulus = $7, status_siswa = $8, password_hash = $9
                WHERE id = $10
                RETURNING id, nama, email, role, tingkat_kelas, jurusan, tanggal_masuk, tanggal_lulus, status_siswa, is_active, created_at;
            `;
            queryParams = [nama.trim(), email.trim().toLowerCase(), role, userKelas, userJurusan, userTglMasuk, userTglLulus, userStatus, password_hash, id];
        } else {
            queryText = `
                UPDATE users 
                SET nama = $1, email = $2, role = $3, tingkat_kelas = $4, jurusan = $5,
                    tanggal_masuk = $6, tanggal_lulus = $7, status_siswa = $8
                WHERE id = $9
                RETURNING id, nama, email, role, tingkat_kelas, jurusan, tanggal_masuk, tanggal_lulus, status_siswa, is_active, created_at;
            `;
            queryParams = [nama.trim(), email.trim().toLowerCase(), role, userKelas, userJurusan, userTglMasuk, userTglLulus, userStatus, id];
        }

        const result = await db.query(queryText, queryParams);

        res.json({
            message: 'Data pengguna berhasil diperbarui!',
            user: result.rows[0]
        });

    } catch (err) {
        console.error('Error UpdateUser:', err);
        res.status(500).json({ message: `Gagal memperbarui pengguna: ${err.message}` });
    }
};

// 5. Hapus Pengguna Permanen (Admin)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek user yang akan dihapus
        const checkUser = await db.query('SELECT id, nama, role FROM users WHERE id = $1', [id]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan!' });
        }

        const targetUser = checkUser.rows[0];

        // Jangan izinkan admin menghapus akunnya sendiri yang sedang login
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan!' });
        }

        await db.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({
            message: `Akun pengguna "${targetUser.nama}" berhasil dihapus!`
        });
    } catch (err) {
        console.error('Error DeleteUser:', err);
        res.status(500).json({ message: `Gagal menghapus pengguna: ${err.message}` });
    }
};

// 6. Ambil Data Analitik Sistem & Statistik Sekolah (Admin)
const getSystemAnalytics = async (req, res) => {
    try {
        const [
            roleDist,
            statusDist,
            siswaStatusDist,
            presensiToday,
            weeklyPresensi,
            academicCounts,
            recentUsers
        ] = await Promise.all([
            db.query(`
                SELECT role, COUNT(*)::int as count 
                FROM users 
                GROUP BY role 
                ORDER BY count DESC
            `),
            db.query(`
                SELECT 
                    COUNT(CASE WHEN is_active = TRUE THEN 1 END)::int as active_count,
                    COUNT(CASE WHEN is_active = FALSE THEN 1 END)::int as inactive_count,
                    COUNT(*)::int as total_count
                FROM users
            `),
            db.query(`
                SELECT status_siswa, COUNT(*)::int as count 
                FROM users 
                WHERE role = 'siswa' 
                GROUP BY status_siswa
            `),
            db.query(`
                SELECT 
                    COUNT(*)::int as total_submitted,
                    COUNT(CASE WHEN status = 'hadir' THEN 1 END)::int as hadir,
                    COUNT(CASE WHEN status = 'izin' THEN 1 END)::int as izin,
                    COUNT(CASE WHEN status = 'alpa' THEN 1 END)::int as alpa,
                    COUNT(CASE WHEN is_late = TRUE THEN 1 END)::int as late
                FROM presensi 
                WHERE tanggal = CURRENT_DATE
            `),
            db.query(`
                SELECT 
                    TO_CHAR(d::date, 'Dy') as hari_en,
                    TO_CHAR(d::date, 'DD/MM') as tanggal,
                    COUNT(CASE WHEN p.status = 'hadir' THEN 1 END)::int as hadir,
                    COUNT(CASE WHEN p.status = 'izin' THEN 1 END)::int as izin,
                    COUNT(CASE WHEN p.status = 'alpa' THEN 1 END)::int as alpa
                FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d
                LEFT JOIN presensi p ON p.tanggal = d::date
                GROUP BY d::date
                ORDER BY d::date ASC
            `),
            db.query(`
                SELECT 
                    (SELECT COUNT(*)::int FROM mapel) as total_mapel,
                    (SELECT COUNT(*)::int FROM kurikulum) as total_kurikulum,
                    (SELECT COUNT(*)::int FROM perizinan) as total_perizinan,
                    (SELECT COUNT(*)::int FROM perizinan WHERE status_acc = 'pending') as perizinan_pending,
                    (SELECT COUNT(*)::int FROM perizinan WHERE status_acc = 'approved') as perizinan_approved,
                    (SELECT COUNT(*)::int FROM ujian) as total_ujian
            `),
            db.query(`
                SELECT id, nama, email, role, tingkat_kelas, is_active, created_at 
                FROM users 
                ORDER BY created_at DESC, id DESC 
                LIMIT 5
            `)
        ]);

        const hariMap = {
            Mon: 'Senin',
            Tue: 'Selasa',
            Wed: 'Rabu',
            Thu: 'Kamis',
            Fri: 'Jumat',
            Sat: 'Sabtu',
            Sun: 'Minggu'
        };

        const formattedWeekly = weeklyPresensi.rows.map(r => ({
            hari: hariMap[r.hari_en.trim()] || r.hari_en.trim(),
            tanggal: r.tanggal,
            hadir: r.hadir,
            izin: r.izin,
            alpa: r.alpa
        }));

        const memUsage = process.memoryUsage();
        const systemHealth = {
            status: 'healthy',
            serverUptimeSeconds: Math.floor(process.uptime()),
            nodeVersion: process.version,
            platform: os.platform(),
            arch: os.arch(),
            memory: {
                rssMB: Math.round(memUsage.rss / 1024 / 1024),
                heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
                heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
                systemTotalMemMB: Math.round(os.totalmem() / 1024 / 1024),
                systemFreeMemMB: Math.round(os.freemem() / 1024 / 1024)
            },
            database: {
                status: 'connected',
                dbName: process.env.DB_NAME || 'eduportal_db'
            }
        };

        res.json({
            roleDistribution: roleDist.rows,
            statusOverview: statusDist.rows[0] || { active_count: 0, inactive_count: 0, total_count: 0 },
            siswaStatusDistribution: siswaStatusDist.rows,
            presensiToday: presensiToday.rows[0] || { total_submitted: 0, hadir: 0, izin: 0, alpa: 0, late: 0 },
            weeklyPresensi: formattedWeekly,
            academicCounts: academicCounts.rows[0] || { total_mapel: 0, total_kurikulum: 0, total_perizinan: 0, perizinan_pending: 0, perizinan_approved: 0, total_ujian: 0 },
            recentUsers: recentUsers.rows,
            systemHealth
        });
    } catch (err) {
        console.error('Error GetSystemAnalytics:', err);
        res.status(500).json({ message: 'Gagal mengambil data analitik sistem: ' + err.message });
    }
};

module.exports = { getAllUsers, registerUser, toggleActiveStatus, updateUser, deleteUser, getAcademicInfo, getSystemAnalytics };
