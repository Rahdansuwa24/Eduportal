const cron = require('node-cron');
const db = require('../config/db');

// Fungsi Kalkulasi Tahun Ajaran & Semester berdasarkan Bulan Berjalan
const getAcademicContext = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1 - 12

    let semester = 'Ganjil';
    let tahunAjaran = '';

    if (month >= 7) {
        // Juli - Desember -> Semester Ganjil (Contoh: Sept 2026 -> 2026/2027 Ganjil)
        semester = 'Ganjil';
        tahunAjaran = `${year}/${year + 1}`;
    } else {
        // Januari - Juni -> Semester Genap (Contoh: Feb 2027 -> 2026/2027 Genap)
        semester = 'Genap';
        tahunAjaran = `${year - 1}/${year}`;
    }

    return { semester, tahunAjaran };
};

// 1. Auto-Check Kelulusan Siswa (Tiap Tengah Malam Pukul 00:00:00)
const checkStudentGraduation = async () => {
    try {
        console.log('⏰ [Cron Job] Memeriksa otomatisasi kelulusan siswa...');
        
        const queryText = `
            UPDATE users 
            SET status_siswa = 'lulus' 
            WHERE role = 'siswa' 
              AND status_siswa = 'aktif' 
              AND tanggal_lulus IS NOT NULL 
              AND tanggal_lulus <= CURRENT_DATE
            RETURNING id, nama, email;
        `;
        const result = await db.query(queryText);

        if (result.rows.length > 0) {
            console.log(`🎉 [Cron Job] Berhasil mengupdate ${result.rows.length} siswa menjadi status LULUS:`, 
                result.rows.map(s => `${s.nama} (${s.email})`).join(', ')
            );
        } else {
            console.log('✅ [Cron Job] Tidak ada siswa yang melewati tanggal kelulusan hari ini.');
        }
    } catch (err) {
        console.error('❌ [Cron Job Error] Gagal mengeksekusi checkStudentGraduation:', err);
    }
};

// 2. Auto-Update Pengaturan Sekolah (Tahun Ajaran & Semester Aktif)
const syncSchoolAcademicSettings = async () => {
    try {
        const { semester, tahunAjaran } = getAcademicContext();
        console.log(`⏰ [Cron Job] Mengupdate Tahun Ajaran & Semester Aktif -> ${tahunAjaran} (${semester})...`);

        const queryText = `
            INSERT INTO pengaturan_sekolah (id, tahun_ajaran_aktif, semester_aktif, updated_at)
            VALUES (1, $1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE 
            SET tahun_ajaran_aktif = EXCLUDED.tahun_ajaran_aktif,
                semester_aktif = EXCLUDED.semester_aktif,
                updated_at = CURRENT_TIMESTAMP;
        `;
        await db.query(queryText, [tahunAjaran, semester]);
        console.log('✅ [Cron Job] Pengaturan akademik sekolah berhasil disinkronisasi.');
    } catch (err) {
        console.error('❌ [Cron Job Error] Gagal mengeksekusi syncSchoolAcademicSettings:', err);
    }
};

// Inisialisasi Seluruh Cron Job Scheduler
const initCronJobs = () => {
    console.log('🚀 [Background Scheduler] Memulai Node-Cron Scheduler 24/7...');

    // Synchronize sekali saat backend pertama kali dinyalakan
    syncSchoolAcademicSettings();
    checkStudentGraduation();

    // Cron 1: Jalankan setiap hari pukul 00:00:00 (Tengah Malam)
    cron.schedule('0 0 * * *', () => {
        console.log('🕒 [Cron Schedule 00:00] Eksekusi pemeriksaan kelulusan harian...');
        checkStudentGraduation();
    });

    // Cron 2: Jalankan setiap tanggal 1 bulan Juli & 1 bulan Januari pukul 00:00:00
    cron.schedule('0 0 1 1,7 *', () => {
        console.log('🕒 [Cron Schedule 1 Jan/Jul] Eksekusi pembaruan semester & tahun ajaran baru...');
        syncSchoolAcademicSettings();
    });
};

module.exports = {
    initCronJobs,
    getAcademicContext,
    checkStudentGraduation,
    syncSchoolAcademicSettings
};
