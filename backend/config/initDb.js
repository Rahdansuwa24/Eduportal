const db = require('./db');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    console.log('🚀 Memulai pembuatan Tabel Database PostgreSQL...');

    // 1. Tabel Users (Support Auth Login & Admin Registration)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          nama VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) CHECK (role IN ('admin', 'waka', 'guru', 'siswa')) NOT NULL,
          tingkat_kelas VARCHAR(10) DEFAULT '10',
          jurusan VARCHAR(20) DEFAULT NULL,
          tanggal_masuk DATE DEFAULT CURRENT_DATE,
          tanggal_lulus DATE DEFAULT NULL,
          status_siswa VARCHAR(20) DEFAULT 'aktif',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Pastikan kolom baru ada jika tabel sudah pernah dibuat sebelumnya
      ALTER TABLE users ADD COLUMN IF NOT EXISTS jurusan VARCHAR(20) DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_masuk DATE DEFAULT CURRENT_DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS tanggal_lulus DATE DEFAULT NULL;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status_siswa VARCHAR(20) DEFAULT 'aktif';

      -- Ubah status alumni menjadi lulus jika pernah ada data alumni
      UPDATE users SET status_siswa = 'lulus' WHERE status_siswa = 'alumni';
    `);

    // 1.5. Tabel Master Pengaturan Sekolah (Tahun Ajaran & Semester Aktif)
    await db.query(`
      CREATE TABLE IF NOT EXISTS pengaturan_sekolah (
          id SERIAL PRIMARY KEY,
          tahun_ajaran_aktif VARCHAR(20) NOT NULL DEFAULT '2026/2027',
          semester_aktif VARCHAR(10) NOT NULL DEFAULT 'Ganjil',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO pengaturan_sekolah (id, tahun_ajaran_aktif, semester_aktif)
      VALUES (1, '2026/2027', 'Ganjil')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Tabel Mapel Kompleks (Tingkat Kelas, Jurusan, Tipe Wajib/Peminatan)
    await db.query(`
      CREATE TABLE IF NOT EXISTS mapel (
          id SERIAL PRIMARY KEY,
          nama_mapel VARCHAR(100) NOT NULL,
          kode_mapel VARCHAR(20) UNIQUE NOT NULL,
          tingkat_kelas VARCHAR(10) CHECK (tingkat_kelas IN ('10', '11', '12', 'semua')) NOT NULL DEFAULT '10',
          jurusan VARCHAR(20) CHECK (jurusan IN ('IPA', 'IPS', 'UMUM')) NOT NULL DEFAULT 'UMUM',
          tipe_mapel VARCHAR(20) CHECK (tipe_mapel IN ('wajib', 'peminatan')) NOT NULL DEFAULT 'wajib'
      );
    `);

    // 3. Tabel Kurikulum & Jadwal Mapel (Dikelola oleh Waka Kurikulum)
    await db.query(`
      CREATE TABLE IF NOT EXISTS kurikulum (
          id SERIAL PRIMARY KEY,
          mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
          hari VARCHAR(15) CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')) NOT NULL,
          waktu_mulai TIME NOT NULL,
          waktu_selesai TIME NOT NULL,
          ruangan VARCHAR(50) DEFAULT 'Kelas 10 IPA 1',
          tahun_ajaran VARCHAR(20) DEFAULT '2026/2027',
          semester VARCHAR(10) DEFAULT 'Ganjil',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Tabel Materi Pelajaran
    await db.query(`
      CREATE TABLE IF NOT EXISTS materi (
          id SERIAL PRIMARY KEY,
          guru_id INT REFERENCES users(id) ON DELETE CASCADE,
          mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
          judul VARCHAR(150) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Tabel Ujian Header (ACC Waka)
    await db.query(`
      CREATE TABLE IF NOT EXISTS ujian (
          id SERIAL PRIMARY KEY,
          guru_id INT REFERENCES users(id) ON DELETE CASCADE,
          mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
          judul_ujian VARCHAR(150) NOT NULL,
          durasi_menit INT NOT NULL,
          status_acc VARCHAR(20) DEFAULT 'pending' CHECK (status_acc IN ('pending', 'approved', 'rejected')),
          catatan_waka TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE ujian ADD COLUMN IF NOT EXISTS catatan_waka TEXT DEFAULT NULL;
    `);

    // 6. Tabel Detail Soal Ujian (PG & Isian)
    await db.query(`
      CREATE TABLE IF NOT EXISTS detail_soal (
          id SERIAL PRIMARY KEY,
          ujian_id INT REFERENCES ujian(id) ON DELETE CASCADE,
          pertanyaan TEXT NOT NULL,
          tipe_soal VARCHAR(20) CHECK (tipe_soal IN ('pg', 'isian')) NOT NULL,
          pilihan_a TEXT, 
          pilihan_b TEXT, 
          pilihan_c TEXT, 
          pilihan_d TEXT,
          kunci_jawaban TEXT NOT NULL
      );
    `);

    // 7. Tabel Hasil Ujian Semester
    await db.query(`
      CREATE TABLE IF NOT EXISTS hasil_ujian (
          id SERIAL PRIMARY KEY,
          siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
          ujian_id INT REFERENCES ujian(id) ON DELETE CASCADE,
          skor NUMERIC(5,2) NOT NULL,
          semester INT NOT NULL CHECK (semester BETWEEN 1 AND 6),
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Tabel Presensi Harian (Berbasis Waktu & Guru Override)
    await db.query(`
      CREATE TABLE IF NOT EXISTS presensi (
          id SERIAL PRIMARY KEY,
          siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
          kurikulum_id INT REFERENCES kurikulum(id) ON DELETE CASCADE,
          status VARCHAR(20) CHECK (status IN ('hadir', 'izin', 'alpa', 'menunggu_acc')) NOT NULL DEFAULT 'alpa',
          waktu_absen TIMESTAMP,
          is_late BOOLEAN DEFAULT FALSE,
          diubah_oleh_guru_id INT REFERENCES users(id) ON DELETE SET NULL,
          catatan_guru TEXT,
          tanggal DATE DEFAULT CURRENT_DATE
      );

      ALTER TABLE presensi ADD COLUMN IF NOT EXISTS kurikulum_id INT REFERENCES kurikulum(id) ON DELETE CASCADE;
    `);

    // 9. Tabel Perizinan & Upload Surat Izin (Siswa & Guru ACC)
    await db.query(`
      CREATE TABLE IF NOT EXISTS perizinan (
          id SERIAL PRIMARY KEY,
          siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
          alasan VARCHAR(50) CHECK (alasan IN ('sakit', 'izin_keluarga', 'lainnya')) NOT NULL,
          keterangan TEXT,
          tanggal_mulai DATE NOT NULL,
          tanggal_selesai DATE NOT NULL,
          bukti_file_path VARCHAR(255) NOT NULL,
          status_acc VARCHAR(20) DEFAULT 'pending' CHECK (status_acc IN ('pending', 'approved', 'rejected')),
          disetujui_oleh_guru_id INT REFERENCES users(id) ON DELETE SET NULL,
          waktu_acc TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Berhasil! Seluruh Tabel Database telah dibuat.');

    // Masukkan Seed Data Dummy awal jika belum ada
    const userCheck = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      const defaultPasswordHash = await bcrypt.hash('password123', 10);

      await db.query(`
        INSERT INTO users (nama, email, password_hash, role, tingkat_kelas, is_active) VALUES
        ('Admin Utama', 'admin@sekolah.sch.id', '${defaultPasswordHash}', 'admin', 'staff', true),
        ('Waka Kurikulum', 'waka@sekolah.sch.id', '${defaultPasswordHash}', 'waka', 'staff', true),
        ('Pak Budi (Guru Math)', 'budi@sekolah.sch.id', '${defaultPasswordHash}', 'guru', 'staff', true),
        ('Siti Rahma (Siswa Kelas 10)', 'siti@sekolah.sch.id', '${defaultPasswordHash}', 'siswa', '10', true),
        ('Ahmad Fauzi (Siswa Kelas 11)', 'ahmad@sekolah.sch.id', '${defaultPasswordHash}', 'siswa', '11', false);
      `);

      await db.query(`
        INSERT INTO mapel (nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel) VALUES
        ('Matematika Wajib X', 'MTK-10-W', '10', 'UMUM', 'wajib'),
        ('Fisika Peminatan XI', 'FIS-11-P', '11', 'IPA', 'peminatan'),
        ('Ekonomi Peminatan XII', 'EKO-12-P', '12', 'IPS', 'peminatan');
      `);

      await db.query(`
        INSERT INTO kurikulum (mapel_id, hari, waktu_mulai, waktu_selesai, ruangan, tahun_ajaran, semester) VALUES
        (1, 'Senin', '07:30:00', '09:00:00', 'Ruang 10 IPA 1', '2026/2027', 'Ganjil'),
        (2, 'Selasa', '09:15:00', '10:45:00', 'Lab Fisika', '2026/2027', 'Ganjil'),
        (3, 'Rabu', '11:00:00', '12:30:00', 'Ruang 12 IPS 2', '2026/2027', 'Ganjil');
      `);

      await db.query(`
        INSERT INTO hasil_ujian (siswa_id, ujian_id, skor, semester) VALUES
        (4, NULL, 78.50, 1),
        (4, NULL, 82.00, 2),
        (4, NULL, 80.00, 3),
        (4, NULL, 88.50, 4),
        (4, NULL, 91.00, 5),
        (4, NULL, 95.00, 6);
      `);

      console.log('🎉 Seed Data Dummy Kurikulum Berhasil Dimasukkan!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error Pembuatan Tabel:', err);
    process.exit(1);
  }
};

initDatabase();
