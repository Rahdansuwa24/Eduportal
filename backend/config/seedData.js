const db = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Script Seeder Komprehensif EduPortal Pro
 * Menyediakan data dummy memadai untuk semua role:
 * - Admin, Waka Kurikulum, Guru (berbagai mapel), Siswa (Kelas 10, 11, 12, dan Alumni)
 * - Mapel Wajib & Peminatan
 * - Kurikulum / Jadwal Kelas Senin s/d Sabtu
 * - Materi Pelajaran
 * - Paket Ujian & Butir Soal (PG & Isian, Approved & Pending)
 * - Riwayat Hasil Ujian & Grafik Nilai Semester 1-6
 * - Data Perizinan (Pending & Approved)
 * - Riwayat Presensi Kehadiran (Hadir, Terlambat, Izin, Alpa)
 */
const seedComprehensiveData = async () => {
    try {
        console.log('🌱 Memulai injeksi Data Dummy Komprehensif EduPortal Pro...');

        const defaultPasswordHash = await bcrypt.hash('password123', 10);

        // 1. Inisialisasi Pengaturan Sekolah
        await db.query(`
            INSERT INTO pengaturan_sekolah (id, tahun_ajaran_aktif, semester_aktif)
            VALUES (1, '2026/2027', 'Ganjil')
            ON CONFLICT (id) DO UPDATE 
            SET tahun_ajaran_aktif = '2026/2027', semester_aktif = 'Ganjil';
        `);

        // 2. Data Dummy Users (Admin, Waka, Guru, Siswa Kelas 10-12, Alumni)
        const usersList = [
            // Staff & Guru
            { nama: 'Admin Utama', email: 'admin@sekolah.sch.id', role: 'admin', tingkat: 'staff', jurusan: null, status: 'aktif' },
            { nama: 'Waka Kurikulum', email: 'waka@sekolah.sch.id', role: 'waka', tingkat: 'staff', jurusan: null, status: 'aktif' },
            { nama: 'Pak Budi (Guru Math)', email: 'budi@sekolah.sch.id', role: 'guru', tingkat: 'staff', jurusan: null, status: 'aktif' },
            { nama: 'Ibu Sri Wahyuni (Guru Bahasa)', email: 'sri@sekolah.sch.id', role: 'guru', tingkat: 'staff', jurusan: null, status: 'aktif' },
            { nama: 'Pak Hendra (Guru Fisika)', email: 'hendra@sekolah.sch.id', role: 'guru', tingkat: 'staff', jurusan: null, status: 'aktif' },
            { nama: 'Ibu Rina Marlina (Guru Biologi)', email: 'rina@sekolah.sch.id', role: 'guru', tingkat: 'staff', jurusan: null, status: 'aktif' },

            // Siswa Kelas 10 (UMUM)
            { nama: 'Siti Rahma (Siswa Kelas 10)', email: 'siti@sekolah.sch.id', role: 'siswa', tingkat: '10', jurusan: 'UMUM', status: 'aktif' },
            { nama: 'Ahmad Fauzi (Siswa Kelas 10)', email: 'ahmad@sekolah.sch.id', role: 'siswa', tingkat: '10', jurusan: 'UMUM', status: 'aktif' },
            { nama: 'Bella Safitri (Siswa Kelas 10)', email: 'bella@sekolah.sch.id', role: 'siswa', tingkat: '10', jurusan: 'UMUM', status: 'aktif' },

            // Siswa Kelas 11 (IPA & IPS)
            { nama: 'Rizky Pratama (Siswa Kelas 11 IPA)', email: 'rizky@sekolah.sch.id', role: 'siswa', tingkat: '11', jurusan: 'IPA', status: 'aktif' },
            { nama: 'Dewi Lestari (Siswa Kelas 11 IPS)', email: 'dewi@sekolah.sch.id', role: 'siswa', tingkat: '11', jurusan: 'IPS', status: 'aktif' },

            // Siswa Kelas 12 & Alumni
            { nama: 'Bagas Saputra (Siswa Kelas 12 IPA)', email: 'bagas@sekolah.sch.id', role: 'siswa', tingkat: '12', jurusan: 'IPA', status: 'aktif' },
            { nama: 'Nadia Putri (Siswa Kelas 12 IPS)', email: 'nadia@sekolah.sch.id', role: 'siswa', tingkat: '12', jurusan: 'IPS', status: 'aktif' },
            { nama: 'Candra Kusuma (Alumni Berprestasi)', email: 'candra@sekolah.sch.id', role: 'siswa', tingkat: '12', jurusan: 'IPA', status: 'lulus' }
        ];

        for (const u of usersList) {
            await db.query(`
                INSERT INTO users (nama, email, password_hash, role, tingkat_kelas, jurusan, status_siswa, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                ON CONFLICT (email) DO UPDATE 
                SET nama = $1, role = $4, tingkat_kelas = $5, jurusan = $6, status_siswa = $7, is_active = true;
            `, [u.nama, u.email, defaultPasswordHash, u.role, u.tingkat, u.jurusan, u.status]);
        }
        console.log('✅ Users dummy (Admin, Waka, Guru, Siswa 10-12, Alumni) siap.');

        // Ambil User ID Map
        const userRows = (await db.query('SELECT id, email, role, nama FROM users')).rows;
        const userMap = {};
        userRows.forEach(u => { userMap[u.email] = u.id; });

        // 3. Data Dummy Mapel
        const mapelList = [
            { nama: 'Matematika Wajib X', kode: 'MTK-10-W', tingkat: '10', jurusan: 'UMUM', tipe: 'wajib' },
            { nama: 'Bahasa Indonesia X', kode: 'BIN-10-W', tingkat: '10', jurusan: 'UMUM', tipe: 'wajib' },
            { nama: 'Bahasa Inggris X', kode: 'ENG-10-W', tingkat: '10', jurusan: 'UMUM', tipe: 'wajib' },
            { nama: 'Informatika X', kode: 'INF-10-P', tingkat: '10', jurusan: 'UMUM', tipe: 'peminatan' },
            { nama: 'Fisika Peminatan XI', kode: 'FIS-11-P', tingkat: '11', jurusan: 'IPA', tipe: 'peminatan' },
            { nama: 'Biologi Peminatan XI', kode: 'BIO-11-P', tingkat: '11', jurusan: 'IPA', tipe: 'peminatan' },
            { nama: 'Ekonomi Peminatan XI', kode: 'EKO-11-P', tingkat: '11', jurusan: 'IPS', tipe: 'peminatan' },
            { nama: 'Sosiologi Peminatan XI', kode: 'SOS-11-P', tingkat: '11', jurusan: 'IPS', tipe: 'peminatan' },
            { nama: 'Matematika Lanjut XII', kode: 'MTK-12-P', tingkat: '12', jurusan: 'IPA', tipe: 'peminatan' },
            { nama: 'Ekonomi Peminatan XII', kode: 'EKO-12-P', tingkat: '12', jurusan: 'IPS', tipe: 'peminatan' }
        ];

        for (const m of mapelList) {
            await db.query(`
                INSERT INTO mapel (nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (kode_mapel) DO UPDATE 
                SET nama_mapel = $1, tingkat_kelas = $3, jurusan = $4, tipe_mapel = $5;
            `, [m.nama, m.kode, m.tingkat, m.jurusan, m.tipe]);
        }
        console.log('✅ Mata Pelajaran (Mapel Wajib & Peminatan) siap.');

        const mapelRows = (await db.query('SELECT id, kode_mapel FROM mapel')).rows;
        const mapelMap = {};
        mapelRows.forEach(m => { mapelMap[m.kode_mapel] = m.id; });

        // 4. Data Dummy Kurikulum / Jadwal Belajar (Senin s/d Sabtu)
        const kurikulumCheck = await db.query('SELECT COUNT(*) FROM kurikulum');
        if (parseInt(kurikulumCheck.rows[0].count) < 8) {
            await db.query('DELETE FROM kurikulum'); // Refresh jadwal agar konsisten dan lengkap

            const jadwalList = [
                // SENIN
                { mapel: 'MTK-10-W', hari: 'Senin', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'BIN-10-W', hari: 'Senin', mulai: '09:15:00', selesai: '10:45:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'FIS-11-P', hari: 'Senin', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Lab Fisika' },

                // SELASA
                { mapel: 'ENG-10-W', hari: 'Selasa', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Lab Bahasa' },
                { mapel: 'INF-10-P', hari: 'Selasa', mulai: '09:15:00', selesai: '10:45:00', ruang: 'Lab Komputer 1' },
                { mapel: 'BIO-11-P', hari: 'Selasa', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Lab Biologi' },

                // RABU (Hari Ini)
                { mapel: 'MTK-10-W', hari: 'Rabu', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'BIN-10-W', hari: 'Rabu', mulai: '09:15:00', selesai: '10:45:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'EKO-11-P', hari: 'Rabu', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 11 IPS 1' },
                { mapel: 'EKO-12-P', hari: 'Rabu', mulai: '11:00:00', selesai: '12:30:00', ruang: 'Ruang 12 IPS 2' },

                // KAMIS
                { mapel: 'INF-10-P', hari: 'Kamis', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Lab Komputer 2' },
                { mapel: 'ENG-10-W', hari: 'Kamis', mulai: '09:15:00', selesai: '10:45:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'SOS-11-P', hari: 'Kamis', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 11 IPS 2' },

                // JUMAT
                { mapel: 'MTK-10-W', hari: 'Jumat', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'BIN-10-W', hari: 'Jumat', mulai: '09:15:00', selesai: '10:45:00', ruang: 'Ruang 10 IPA 1' },
                { mapel: 'MTK-12-P', hari: 'Jumat', mulai: '07:30:00', selesai: '09:00:00', ruang: 'Ruang 12 IPA 1' },

                // SABTU
                { mapel: 'INF-10-P', hari: 'Sabtu', mulai: '08:00:00', selesai: '09:30:00', ruang: 'Lab Komputer' },
                { mapel: 'BIO-11-P', hari: 'Sabtu', mulai: '08:00:00', selesai: '09:30:00', ruang: 'Lab Biologi' }
            ];

            for (const j of jadwalList) {
                const mapelId = mapelMap[j.mapel];
                if (mapelId) {
                    await db.query(`
                        INSERT INTO kurikulum (mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester)
                        VALUES ($1, $2, $3, $4, $5, '2026/2027', 'Ganjil')
                    `, [mapelId, j.hari, j.mulai, j.selesai, j.ruang]);
                }
            }
        }
        console.log('✅ Kurikulum & Jadwal Belajar (Senin - Sabtu) siap.');

        // 5. Data Dummy Materi Pelajaran
        const materiCheck = await db.query('SELECT COUNT(*) FROM materi');
        if (parseInt(materiCheck.rows[0].count) === 0) {
            await db.query(`
                INSERT INTO materi (guru_id, mapel_id, judul, file_path) VALUES
                ($1, $2, 'Modul Aljabar Linier & Matriks Dasar', 'uploads/materi_aljabar.pdf'),
                ($3, $4, 'Panduan Analisis Teks Laporan Hasil Observasi (LHO)', 'uploads/materi_teks_lho.pdf'),
                ($5, $6, 'Panduan Praktikum Termodinamika & Fluida Statis', 'uploads/materi_termodinamika.pdf'),
                ($7, $8, 'Struktur Sel dan Sistem Transpor Membran', 'uploads/materi_biologi_sel.pdf')
            `, [
                userMap['budi@sekolah.sch.id'], mapelMap['MTK-10-W'],
                userMap['sri@sekolah.sch.id'], mapelMap['BIN-10-W'],
                userMap['hendra@sekolah.sch.id'], mapelMap['FIS-11-P'],
                userMap['rina@sekolah.sch.id'], mapelMap['BIO-11-P']
            ]);
            console.log('✅ Materi Pelajaran siap.');
        }

        // 6. Data Dummy Ujian & Butir Soal (PG)
        const ujianCheck = await db.query('SELECT COUNT(*) FROM ujian');
        if (parseInt(ujianCheck.rows[0].count) === 0) {
            // Ujian 1: Matematika (Approved)
            const u1 = await db.query(`
                INSERT INTO ujian (guru_id, mapel_id, judul_ujian, durasi_menit, status_acc, catatan_waka)
                VALUES ($1, $2, 'Ulangan Harian Matematika: Sistem Persamaan Linear', 60, 'approved', 'Disetujui untuk kelas 10')
                RETURNING id
            `, [userMap['budi@sekolah.sch.id'], mapelMap['MTK-10-W']]);
            const u1Id = u1.rows[0].id;

            await db.query(`
                INSERT INTO detail_soal (ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban)
                VALUES 
                ($1, 'Jika 2x + y = 10 dan x - y = 2, berapakah nilai x dan y?', 'pg', 'x = 4, y = 2', 'x = 3, y = 4', 'x = 2, y = 6', 'x = 5, y = 0', 'pilihan_a'),
                ($1, 'Manakah di bawah ini yang merupakan persamaan linear satu variabel?', 'pg', 'x^2 + 2x = 5', '3x + 5 = 20', 'x + y = 12', 'xy = 8', 'pilihan_b'),
                ($1, 'Berapakah nilai determinan dari matriks identitas ordo 2x2?', 'pg', '0', '2', '1', '-1', 'pilihan_c');
            `, [u1Id]);

            // Ujian 2: Bahasa Indonesia (Approved)
            const u2 = await db.query(`
                INSERT INTO ujian (guru_id, mapel_id, judul_ujian, durasi_menit, status_acc, catatan_waka)
                VALUES ($1, $2, 'Kuis Struktur Teks Laporan Hasil Observasi', 45, 'approved', 'Disetujui Waka')
                RETURNING id
            `, [userMap['sri@sekolah.sch.id'], mapelMap['BIN-10-W']]);
            const u2Id = u2.rows[0].id;

            await db.query(`
                INSERT INTO detail_soal (ujian_id, pertanyaan, tipe_soal, pilihan_a, pilihan_b, pilihan_c, pilihan_d, kunci_jawaban)
                VALUES 
                ($1, 'Bagian awal dari teks LHO yang memuat pengantar umum objek yang diamati adalah...', 'pg', 'Pernyataan Umum / Klasifikasi', 'Deskripsi Bagian', 'Deskripsi Manfaat', 'Kesimpulan', 'pilihan_a'),
                ($1, 'Teks laporan hasil observasi harus disajikan berdasarkan...', 'pg', 'Opini pribadi', 'Fakta nyata hasil pengamatan', 'Khayalan penulis', 'Rumor masyarakat', 'pilihan_b');
            `, [u2Id]);

            // Ujian 3: Biologi (Pending ACC)
            await db.query(`
                INSERT INTO ujian (guru_id, mapel_id, judul_ujian, durasi_menit, status_acc, catatan_waka)
                VALUES ($1, $2, 'Penilaian Tengah Semester (PTS) Biologi Sel', 90, 'pending', 'Menunggu verifikasi butir soal oleh Waka Kurikulum')
            `, [userMap['rina@sekolah.sch.id'], mapelMap['BIO-11-P']]);

            console.log('✅ Ujian & Detail Butir Soal siap.');
        }

        // 7. Data Dummy Grafik Nilai Semester (Siswa Siti Rahma & Ahmad Fauzi)
        const sitiId = userMap['siti@sekolah.sch.id'];
        const ahmadId = userMap['ahmad@sekolah.sch.id'];
        const rizkyId = userMap['rizky@sekolah.sch.id'];

        if (sitiId) {
            const hasilCheck = await db.query('SELECT COUNT(*) FROM hasil_ujian WHERE siswa_id = $1', [sitiId]);
            if (parseInt(hasilCheck.rows[0].count) === 0) {
                await db.query(`
                    INSERT INTO hasil_ujian (siswa_id, ujian_id, skor, semester) VALUES
                    ($1, NULL, 78.50, 1),
                    ($1, NULL, 82.00, 2),
                    ($1, NULL, 80.00, 3),
                    ($1, NULL, 88.50, 4),
                    ($1, NULL, 91.00, 5),
                    ($1, NULL, 95.00, 6);
                `, [sitiId]);
            }
        }

        if (ahmadId) {
            const ahmadHasilCheck = await db.query('SELECT COUNT(*) FROM hasil_ujian WHERE siswa_id = $1', [ahmadId]);
            if (parseInt(ahmadHasilCheck.rows[0].count) === 0) {
                await db.query(`
                    INSERT INTO hasil_ujian (siswa_id, ujian_id, skor, semester) VALUES
                    ($1, NULL, 72.00, 1),
                    ($1, NULL, 76.50, 2),
                    ($1, NULL, 81.00, 3),
                    ($1, NULL, 84.50, 4),
                    ($1, NULL, 87.00, 5),
                    ($1, NULL, 90.00, 6);
                `, [ahmadId]);
            }
        }
        console.log('✅ Grafik Nilai Perkembangan Semester siap.');

        // 8. Data Dummy Perizinan (Pending & Approved)
        const perizinanCheck = await db.query('SELECT COUNT(*) FROM perizinan');
        if (parseInt(perizinanCheck.rows[0].count) < 3) {
            const budiId = userMap['budi@sekolah.sch.id'];

            if (sitiId) {
                await db.query(`
                    INSERT INTO perizinan (siswa_id, alasan, keterangan, tanggal_mulai, tanggal_selesai, bukti_file_path, status_acc, disetujui_oleh_guru_id, waktu_acc)
                    VALUES ($1, 'izin_keluarga', 'Menghadiri acara pernikahan kakak kandung di luar kota', CURRENT_DATE - 1, CURRENT_DATE, 'uploads/surat_izin_siti.pdf', 'approved', $2, CURRENT_TIMESTAMP - INTERVAL '2 hours')
                `, [sitiId, budiId]);
            }

            if (ahmadId) {
                await db.query(`
                    INSERT INTO perizinan (siswa_id, alasan, keterangan, tanggal_mulai, tanggal_selesai, bukti_file_path, status_acc)
                    VALUES ($1, 'sakit', 'Demam tinggi dan flu berat, istirahat atas anjuran dokter', CURRENT_DATE, CURRENT_DATE + 2, 'uploads/surat_sakit_ahmad.pdf', 'pending')
                `, [ahmadId]);
            }

            if (rizkyId) {
                await db.query(`
                    INSERT INTO perizinan (siswa_id, alasan, keterangan, tanggal_mulai, tanggal_selesai, bukti_file_path, status_acc, disetujui_oleh_guru_id, waktu_acc)
                    VALUES ($1, 'lainnya', 'Mengikuti seleksi Olimpiade Sains Nasional (OSN) tingkat kota', CURRENT_DATE - 3, CURRENT_DATE - 2, 'uploads/surat_tugas_osn.pdf', 'approved', $2, CURRENT_TIMESTAMP - INTERVAL '3 days')
                `, [rizkyId, budiId]);
            }
            console.log('✅ Data Perizinan Siswa (Pending & Approved) siap.');
        }

        // 9. Data Dummy Presensi Kehadiran Siswa
        const kurikulumRows = (await db.query('SELECT id, hari FROM kurikulum')).rows;
        const rabuKurikulum = kurikulumRows.find(k => k.hari === 'Rabu') || kurikulumRows[0];
        const seninKurikulum = kurikulumRows.find(k => k.hari === 'Senin') || kurikulumRows[0];
        const selasaKurikulum = kurikulumRows.find(k => k.hari === 'Selasa') || kurikulumRows[0];

        const presensiCheck = await db.query('SELECT COUNT(*) FROM presensi');
        if (parseInt(presensiCheck.rows[0].count) < 4) {
            const budiId = userMap['budi@sekolah.sch.id'];

            // Presensi Siti Rahma (Kemarin: Hadir, Kemarin lusa: Hadir Terlambat)
            if (sitiId && selasaKurikulum) {
                await db.query(`
                    INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, is_late, tanggal, catatan_guru)
                    VALUES ($1, $2, 'hadir', CURRENT_TIMESTAMP - INTERVAL '1 day', false, CURRENT_DATE - 1, 'Hadir tepat waktu dan aktif berdiskusi')
                `, [sitiId, selasaKurikulum.id]);
            }

            if (sitiId && seninKurikulum) {
                await db.query(`
                    INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, is_late, tanggal, catatan_guru)
                    VALUES ($1, $2, 'hadir', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '25 minutes', true, CURRENT_DATE - 2, 'Terlambat 25 menit karena kendala transportasi')
                `, [sitiId, seninKurikulum.id]);
            }

            // Presensi Ahmad Fauzi (Izin sakit)
            if (ahmadId && rabuKurikulum) {
                await db.query(`
                    INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, is_late, tanggal, catatan_guru)
                    VALUES ($1, $2, 'izin', CURRENT_TIMESTAMP, false, CURRENT_DATE, 'Izin sakit berdasarkan surat dokter')
                `, [ahmadId, rabuKurikulum.id]);
            }

            // Presensi Rizky Pratama (Hadir hari ini)
            if (rizkyId && rabuKurikulum) {
                await db.query(`
                    INSERT INTO presensi (siswa_id, kurikulum_id, status, waktu_absen, is_late, tanggal, catatan_guru)
                    VALUES ($1, $2, 'hadir', CURRENT_TIMESTAMP - INTERVAL '1 hour', false, CURRENT_DATE, 'Hadir lengkap')
                `, [rizkyId, rabuKurikulum.id]);
            }
            console.log('✅ Riwayat Presensi (Hadir, Terlambat, Izin) siap.');
        }

        console.log('🎉 SEMPURNA: Seluruh Data Dummy Komprehensif Berhasil Dimuat!');
        return true;
    } catch (err) {
        console.error('❌ Gagal menyuntikkan data dummy:', err);
        throw err;
    }
};

// Jika dijalankan langsung via CLI (node seedData.js)
if (require.main === module) {
    seedComprehensiveData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = { seedComprehensiveData };
