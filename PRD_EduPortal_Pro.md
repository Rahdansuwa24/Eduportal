# 📄 Product Requirement Document (PRD) v2.1 (Enhanced Workflow)
**Nama Proyek:** EduPortal Pro – AI-Powered School Management & Analytics Dashboard  
**Database:** PostgreSQL  
**Backend:** Node.js, Express.js, `multer` (Upload File Izin & Materi), `pdf-parse`, `bcryptjs`, `jsonwebtoken`  
**Frontend & Data Viz:** React, Vite, Tailwind CSS, shadcn/ui, Recharts  

---

## 1. Executive Summary & Core Rules
EduPortal Pro adalah aplikasi manajemen sekolah multi-role (Admin, Waka Kurikulum, Guru, Siswa).

### 🔑 Aturan Utama Sistem:
1. **Sistem Login & Autentikasi**: Seluruh role masuk menggunakan Email & Password. Token JWT digunakan untuk sesi login.
2. **Pendaftaran Akun (Register)**: Siswa, Guru, dan Waka **TIDAK BISA register sendiri**. Pembuatan akun baru dilakukan secara terpusat oleh **Admin**.
3. **Presensi Berbasis Waktu (Deadline 07:30 WIB)**:
   - Jika Siswa tidak absen sampai jam 07:30 WIB (dan tidak ada izin aktif), sistem/default menganggap statusnya **Alpa**.
   - Siswa yang lupa absen harus melapor ke **Guru**. Guru memiliki akses untuk mengubah/override status presensi siswa.
4. **Sistem Perizinan (Upload Bukti Surat Izin)**:
   - Siswa mengajukan Izin via Form: Alasan, Tanggal Mulai & Selesai, dan **Upload Bukti (PDF / Gambar)**.
   - Perizinan diproses oleh **Guru** (`pending` $\rightarrow$ `approved` / `rejected`).
   - Siswa yang mengajukan perizinan tidak akan terkena Alpa otomatis.
5. **Mata Pelajaran (Kurikulum Kompleks Waka)**:
   - Dikategorikan berdasarkan **Tingkat Kelas** (10, 11, 12), **Jurusan** (IPA, IPS, UMUM), dan **Tipe Mapel** (Wajib & Peminatan).

---

## 2. Matrix Role & Feature Specifications

| Role | Fitur Utama | Deskripsi Detail |
| :--- | :--- | :--- |
| **Admin** | 1. User Management & Registration<br>2. System Analytics Dashboard | • Membuat akun baru untuk Siswa, Guru, & Waka (Set Email, Password Awal, Role, & Tingkat Kelas).<br>• Mengaktifkan/menonaktifkan akun pengguna (`is_active`). |
| **Waka Kurikulum** | 1. Kompleks CRUD Mapel<br>2. ACC Soal Ujian Guru | • Pengelolaan Kurikulum Mapel (Tingkat Kelas 10/11/12, Jurusan IPA/IPS, Tipe Wajib/Peminatan).<br>• Memeriksa & me-review draft ujian dari Guru (`pending`, `approved`, `rejected`). |
| **Guru** | 1. Pengelolaan Presensi Siswa<br>2. Verifikasi ACC Surat Izin<br>3. Unggah Materi & AI Quiz Generator | • Melihat rekap presensi seluruh siswa & mengedit/override status jika siswa lupa absen.<br>• Melihat pengajuan surat izin siswa, mengunduh bukti PDF/gambar, & konfirmasi ACC/Reject.<br>• Unggah materi PDF & AI Auto-Generate draft kuis dari PDF/Word. |
| **Siswa** | 1. Presensi Harian Waktu<br>2. Form Perizinan & Upload Surat<br>3. Ujian Online & Analytics Nilai | • Absen harian sebelum tenggat waktu (07:30 WIB).<br>• Ajukan perizinan (Sakit/Izin) + Upload berkas bukti surat.<br>• Kerjakan Ujian Online + Lihat Line Chart Nilai 6 Semester. |

---

## 3. PostgreSQL Database Schema (DDL v2.1)

```sql
-- 1. Database
CREATE DATABASE eduportal_db;

-- 2. Tabel Users (Support Login & Admin Management)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'waka', 'guru', 'siswa')) NOT NULL,
    tingkat_kelas VARCHAR(10) DEFAULT '10', -- '10', '11', '12', atau 'staff'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Mata Pelajaran (Kurikulum Kompleks Waka)
CREATE TABLE mapel (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(100) NOT NULL,
    kode_mapel VARCHAR(20) UNIQUE NOT NULL,
    tingkat_kelas VARCHAR(10) CHECK (tingkat_kelas IN ('10', '11', '12', 'semua')) NOT NULL DEFAULT '10',
    jurusan VARCHAR(20) CHECK (jurusan IN ('IPA', 'IPS', 'UMUM')) NOT NULL DEFAULT 'UMUM',
    tipe_mapel VARCHAR(20) CHECK (tipe_mapel IN ('wajib', 'peminatan')) NOT NULL DEFAULT 'wajib'
);

-- 4. Tabel Materi (Uploaded by Guru)
CREATE TABLE materi (
    id SERIAL PRIMARY KEY,
    guru_id INT REFERENCES users(id) ON DELETE CASCADE,
    mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
    judul VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Ujian Header (Approved by Waka)
CREATE TABLE ujian (
    id SERIAL PRIMARY KEY,
    guru_id INT REFERENCES users(id) ON DELETE CASCADE,
    mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
    judul_ujian VARCHAR(150) NOT NULL,
    durasi_menit INT NOT NULL,
    status_acc VARCHAR(20) DEFAULT 'pending' CHECK (status_acc IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Detail Soal
CREATE TABLE detail_soal (
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

-- 7. Tabel Hasil Ujian & Semester (Siswa)
CREATE TABLE hasil_ujian (
    id SERIAL PRIMARY KEY,
    siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
    ujian_id INT REFERENCES ujian(id) ON DELETE CASCADE,
    skor NUMERIC(5,2) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 6),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Presensi Harian (Berbasis Waktu & Guru Override)
CREATE TABLE presensi (
    id SERIAL PRIMARY KEY,
    siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('hadir', 'izin', 'alpa', 'menunggu_acc')) NOT NULL DEFAULT 'alpa',
    waktu_absen TIMESTAMP,
    is_late BOOLEAN DEFAULT FALSE,
    diubah_oleh_guru_id INT REFERENCES users(id) ON DELETE SET NULL,
    catatan_guru TEXT,
    tanggal DATE DEFAULT CURRENT_DATE
);

-- 9. Tabel Perizinan & Upload Surat Izin (Siswa & Guru ACC)
CREATE TABLE perizinan (
    id SERIAL PRIMARY KEY,
    siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
    alasan VARCHAR(50) CHECK (alasan IN ('sakit', 'izin_keluarga', 'lainnya')) NOT NULL,
    keterangan TEXT,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    bukti_file_path VARCHAR(255) NOT NULL,
    status_acc VARCHAR(20) DEFAULT 'pending' CHECK (status_acc IN ('pending', 'approved', 'rejected')),
    disetujui_oleh_guru_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. SQL Seed Data (Data Dummy v2.1)

```sql
-- Insert Password Hash untuk 'password123'
INSERT INTO users (nama, email, password_hash, role, tingkat_kelas, is_active) VALUES
('Admin Utama', 'admin@sekolah.sch.id', '$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7', 'admin', 'staff', true),
('Waka Kurikulum', 'waka@sekolah.sch.id', '$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7', 'waka', 'staff', true),
('Pak Budi (Guru Math)', 'budi@sekolah.sch.id', '$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7', 'guru', 'staff', true),
('Siti Rahma (Siswa Kelas 10)', 'siti@sekolah.sch.id', '$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7', 'siswa', '10', true),
('Ahmad Fauzi (Siswa Kelas 11)', 'ahmad@sekolah.sch.id', '$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7', 'siswa', '11', false);

-- Insert Mapel Kompleks
INSERT INTO mapel (nama_mapel, kode_mapel, tingkat_kelas, jurusan, tipe_mapel) VALUES
('Matematika Wajib X', 'MTK-10-W', '10', 'UMUM', 'wajib'),
('Fisika Peminatan XI', 'FIS-11-P', '11', 'IPA', 'peminatan'),
('Ekonomi Peminatan XII', 'EKO-12-P', '12', 'IPS', 'peminatan');
```
