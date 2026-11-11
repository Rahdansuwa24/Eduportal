# 📄 Product Requirement Document (PRD) v2.2: Implementasi Penuh
**Nama Proyek:** EduPortal Pro: AI-Powered School Management & Analytics Dashboard  
**Status:** 100% Implemented & Verified  
**Basis Data:** PostgreSQL 18  
**Backend:** Node.js, Express.js, `multer` (Upload Berkas Izin & Materi), `pdf-parse` (Ekstraksi Dokumen AI), `bcryptjs`, `jsonwebtoken`  
**Frontend & Data Viz:** React 19, Vite, Tailwind CSS, Lucide Icons, Recharts  

---

## 1. Executive Summary & Core Rules
EduPortal Pro adalah platform tata kelola akademik sekolah modern berbasis multi-role yang mengintegrasikan autentikasi JWT terpusat, presensi cerdas berbasis jadwal kurikulum, manajemen bank soal, sistem ujian CBT interaktif dengan auto-grading, analitik nilai semester, dan AI Quiz Generator otomatis dari dokumen PDF.

### 🔑 Aturan Utama Sistem:
1. **Autentikasi Terpusat**: Seluruh pengguna masuk menggunakan Email & Password. Sesi login dikelola melalui JSON Web Token (JWT) dengan masa berlaku 24 jam.
2. **Pendaftaran Akun Terpusat**: Siswa, Guru, dan Waka Kurikulum **tidak dapat mendaftar mandiri**. Akun baru dibuat secara eksklusif oleh **Admin Utama** untuk menjamin validitas data.
3. **Presensi Cerdas Berbasis Jadwal Waktu Kurikulum**:
   * Presensi dilakukan per sesi mata pelajaran sesuai jam mulai dan selesai.
   * Toleransi keterlambatan adalah 15 menit dari jam mulai mapel. Jika lewat dari 15 menit, sistem mencatat kehadiran dengan status `is_late = true`.
   * Guru memiliki hak akses untuk meninjau dan mengubah (*override*) status presensi siswa jika terdapat kendala teknis atau perizinan lisan.
4. **Sistem Perizinan Berkas**:
   * Siswa mengajukan izin via formulir: alasan (sakit, acara keluarga, atau lainnya), rentang tanggal, keterangan, dan **wajib mengunggah bukti berkas (PDF / Gambar)**.
   * Pengajuan diperiksa oleh Guru (`pending` -> `approved` / `rejected`).
5. **Kurikulum Berjenjang**:
   * Mata pelajaran diklasifikasikan berdasarkan Tingkat Kelas (10, 11, 12, semua), Jurusan (IPA, IPS, UMUM), dan Tipe Mapel (Wajib & Peminatan).
6. **Alur Ujian & AI Quiz Generator**:
   * Guru dapat menyusun paket soal secara manual atau menggunakan **AI Quiz Generator** untuk mengekstrak butir soal pilihan ganda dari dokumen PDF materi.
   * Paket ujian diajukan ke Waka Kurikulum untuk di-review (`pending`, `approved`, `rejected` disertai catatan evaluasi).
   * Siswa hanya dapat mengakses ujian yang berstatus `approved`.
   * Saat siswa mengerjakan ujian, kunci jawaban disembunyikan dari payload API. Setelah ujian selesai atau waktu habis, sistem otomatis melakukan penilaian (*auto-grading*) dan memperbarui grafik nilai semester.

---

## 2. Matriks Fitur Berdasarkan Role

| Role | Fitur Utama | Deskripsi Implementasi |
| :--- | :--- | :--- |
| **Admin** | 1. User Management Terpusat<br>2. System Analytics Dashboard | * CRUD pengguna lengkap (tambah akun baru, edit identitas, hashing sandi Bcrypt).<br>* Toggle aktivasi status pengguna (`is_active`).<br>* Visualisasi Recharts: area chart kehadiran mingguan, pie chart sebaran role, bar chart status siswa (aktif, lulus, cuti, do), dan indikator kesehatan sistem. |
| **Waka Kurikulum** | 1. Kurikulum & Mapel Kompleks<br>2. Verifikasi ACC Soal Ujian | * CRUD mata pelajaran berjenjang kelas & jurusan.<br>* Penjadwalan alokasi jam belajar per hari dan ruangan kelas.<br>* Verifikasi draft soal ujian guru dengan modal preview butir soal, tombol persetujuan cepat, dan penolakan berlandaskan catatan evaluasi. |
| **Guru** | 1. Monitoring & Override Presensi<br>2. Verifikasi Surat Izin Siswa<br>3. Unggah Materi Pembelajaran<br>4. Bank Soal & Manajemen Ujian<br>5. AI Auto-Generate Quiz | * Rekap kehadiran harian siswa per mapel dan kemampuan override status kehadiran.<br>* Review berkas surat izin siswa (PDF/Gambar) dan konfirmasi status ACC.<br>* Upload modul materi pelajaran berformat PDF ke server.<br>* Pembuatan paket soal ujian baru lengkap dengan kunci jawaban.<br>* Ekstraksi dokumen PDF materi via `pdf-parse` untuk merumuskan 3-10 butir soal pilihan ganda secara instan. |
| **Siswa** | 1. Presensi Harian Mandiri<br>2. Pengajuan Perizinan & Upload Surat<br>3. Akses Materi Pembelajaran<br>4. Ujian Online CBT Interaktif<br>5. Grafik Tren Nilai Semester | * Konfirmasi kehadiran mandiri per mata pelajaran dengan deteksi keterlambatan.<br>* Pengajuan surat izin dokter/keluarga dan pemantauan status persetujuan guru.<br>* Akses baca dan unduh seluruh modul materi pelajaran resmi.<br>* CBT dengan timer hitung mundur, navigasi palet nomor soal, auto-submit, dan kartu skor instan.<br>* Grafik garis Recharts perkembangan nilai semester 1 sampai 6 vs standar KKM (75.00). |

---

## 3. Skema Basis Data PostgreSQL (DDL Resmi v2.2)

```sql
-- 1. Database
CREATE DATABASE eduportal_db;

-- 2. Tabel Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'waka', 'guru', 'siswa')) NOT NULL,
    tingkat_kelas VARCHAR(10) DEFAULT '10', -- '10', '11', '12', atau 'staff'
    jurusan VARCHAR(20) DEFAULT NULL,       -- 'IPA', 'IPS', 'UMUM', atau NULL
    tanggal_masuk DATE DEFAULT CURRENT_DATE,
    tanggal_lulus DATE DEFAULT NULL,
    status_siswa VARCHAR(20) DEFAULT 'aktif' CHECK (status_siswa IN ('aktif', 'cuti', 'lulus', 'do')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Master Pengaturan Sekolah
CREATE TABLE pengaturan_sekolah (
    id SERIAL PRIMARY KEY,
    tahun_ajaran_aktif VARCHAR(20) NOT NULL DEFAULT '2026/2027',
    semester_aktif VARCHAR(10) NOT NULL DEFAULT 'Ganjil',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Mata Pelajaran
CREATE TABLE mapel (
    id SERIAL PRIMARY KEY,
    nama_mapel VARCHAR(100) NOT NULL,
    kode_mapel VARCHAR(20) UNIQUE NOT NULL,
    tingkat_kelas VARCHAR(10) CHECK (tingkat_kelas IN ('10', '11', '12', 'semua')) NOT NULL DEFAULT '10',
    jurusan VARCHAR(20) CHECK (jurusan IN ('IPA', 'IPS', 'UMUM')) NOT NULL DEFAULT 'UMUM',
    tipe_mapel VARCHAR(20) CHECK (tipe_mapel IN ('wajib', 'peminatan')) NOT NULL DEFAULT 'wajib'
);

-- 5. Tabel Kurikulum & Jadwal Sesi Kelas
CREATE TABLE kurikulum (
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

-- 6. Tabel Materi Pembelajaran
CREATE TABLE materi (
    id SERIAL PRIMARY KEY,
    guru_id INT REFERENCES users(id) ON DELETE CASCADE,
    mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
    judul VARCHAR(150) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Ujian Header
CREATE TABLE ujian (
    id SERIAL PRIMARY KEY,
    guru_id INT REFERENCES users(id) ON DELETE CASCADE,
    mapel_id INT REFERENCES mapel(id) ON DELETE CASCADE,
    judul_ujian VARCHAR(150) NOT NULL,
    durasi_menit INT NOT NULL,
    status_acc VARCHAR(20) DEFAULT 'pending' CHECK (status_acc IN ('pending', 'approved', 'rejected')),
    catatan_waka TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabel Detail Butir Soal
CREATE TABLE detail_soal (
    id SERIAL PRIMARY KEY,
    ujian_id INT REFERENCES ujian(id) ON DELETE CASCADE,
    pertanyaan TEXT NOT NULL,
    tipe_soal VARCHAR(20) CHECK (tipe_soal IN ('pg', 'isian')) NOT NULL DEFAULT 'pg',
    pilihan_a TEXT, 
    pilihan_b TEXT, 
    pilihan_c TEXT, 
    pilihan_d TEXT,
    kunci_jawaban TEXT NOT NULL
);

-- 9. Tabel Hasil Ujian & Semester
CREATE TABLE hasil_ujian (
    id SERIAL PRIMARY KEY,
    siswa_id INT REFERENCES users(id) ON DELETE CASCADE,
    ujian_id INT REFERENCES ujian(id) ON DELETE CASCADE,
    skor NUMERIC(5,2) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 6),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabel Presensi Kehadiran
CREATE TABLE presensi (
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

-- 11. Tabel Pengajuan Perizinan Siswa
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

## 4. Daftar Endpoint REST API

### 🔐 Autentikasi (`/api/auth`)
* `POST /api/auth/login`: Autentikasi email & password, mengembalikan token JWT dan profil pengguna.

### 👤 Pengguna & Analitik (`/api/users`)
* `GET /api/users`: Daftar seluruh pengguna (bisa difilter role).
* `POST /api/users`: Registrasi akun baru (Admin).
* `PUT /api/users/:id`: Edit identitas pengguna (Admin).
* `PATCH /api/users/:id/toggle-status`: Mengaktifkan/menonaktifkan akun pengguna (Admin).
* `DELETE /api/users/:id`: Hapus akun pengguna (Admin).
* `GET /api/users/analytics`: Data agregat real-time metrik kehadiran mingguan, rasio role, status siswa, dan kesehatan server (Admin).

### 📘 Mata Pelajaran (`/api/mapel`)
* `GET /api/mapel`: Daftar seluruh mata pelajaran.
* `POST /api/mapel`: Tambah mata pelajaran baru (Waka & Admin).
* `PUT /api/mapel/:id`: Update data mata pelajaran (Waka & Admin).
* `DELETE /api/mapel/:id`: Hapus mata pelajaran (Waka & Admin).

### 📅 Kurikulum & Jadwal (`/api/kurikulum`)
* `GET /api/kurikulum`: Daftar alokasi jadwal mata pelajaran kurikulum aktif.
* `POST /api/kurikulum`: Tambah sesi jadwal baru (Waka & Admin).
* `PUT /api/kurikulum/:id`: Update sesi jadwal (Waka & Admin).
* `DELETE /api/kurikulum/:id`: Hapus sesi jadwal (Waka & Admin).

### 📂 Materi Pembelajaran (`/api/materi`)
* `GET /api/materi`: Katalog materi pelajaran (terfilter sesuai tingkat kelas jika diakses siswa).
* `POST /api/materi`: Upload berkas modul PDF materi (Guru, Waka, Admin).
* `GET /api/materi/:id/download`: Unduh berkas fisik PDF materi secara aman.
* `DELETE /api/materi/:id`: Hapus materi dan berkas fisik terkait (Guru pemilik, Waka, Admin).

### 📝 Bank Soal & Ujian CBT (`/api/ujian`)
* `GET /api/ujian`: Daftar paket ujian (siswa hanya melihat yang `approved` beserta status pengerjaannya).
* `POST /api/ujian`: Pembuatan paket ujian baru lengkap dengan butir soal (Guru, Waka, Admin).
* `POST /api/ujian/ai-generate`: AI Auto-Generate butir soal kuis pilihan ganda dari file PDF (Guru, Waka, Admin).
* `GET /api/ujian/:id`: Detail paket ujian beserta butir soal (kunci jawaban disembunyikan untuk siswa yang belum selesai).
* `PATCH /api/ujian/:id/acc`: Konfirmasi ACC atau penolakan dengan catatan revisi (Waka & Admin).
* `POST /api/ujian/:id/submit`: Pengumpulan jawaban ujian siswa, auto-grading, dan pencatatan nilai (Siswa).
* `GET /api/ujian/my-results`: Rekapitulasi tren nilai semester 1-6 dan riwayat ujian lengkap (Siswa).
* `DELETE /api/ujian/:id`: Hapus paket ujian (Guru, Waka, Admin).

### ⏱️ Presensi Kehadiran (`/api/presensi`)
* `GET /api/presensi/today`: Rekapitulasi presensi harian seluruh siswa per mapel (Guru, Waka, Admin).
* `POST /api/presensi/submit`: Konfirmasi presensi mandiri per mapel dengan deteksi keterlambatan (Siswa).
* `GET /api/presensi/my`: Riwayat catatan kehadiran mandiri siswa (Siswa).
* `PATCH /api/presensi/override`: Pengubahan status presensi siswa oleh guru (Guru).

### ✉️ Perizinan & Surat (`/api/perizinan`)
* `POST /api/perizinan/submit`: Pengajuan surat izin dengan berkas bukti fisik PDF/Gambar (Siswa).
* `GET /api/perizinan/my`: Riwayat pengajuan izin siswa sendiri dan status ACC (Siswa).
* `GET /api/perizinan`: Seluruh permohonan izin siswa untuk ditinjau guru (Guru, Waka, Admin).
* `PATCH /api/perizinan/:id/acc`: Verifikasi persetujuan atau penolakan izin siswa (Guru).
