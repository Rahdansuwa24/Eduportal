# 👥 Daftar Akun Pengguna & Kredensial Login: EduPortal Pro

Dokumen ini memuat daftar lengkap akun pengguna (*user accounts*) pada basis data PostgreSQL **`eduportal_db`**, dikelompokkan berdasarkan **Role Hak Akses** serta fitur-fitur yang dapat diakses oleh masing-masing akun.

---

## 🔑 Kredensial Login Utama (Default Semua Akun Seed)
* **Password Asli (Plaintext):** `password123`
* **Hash Enkripsi (Bcrypt):** `$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7`
* **Masa Berlaku Token JWT:** 24 Jam

---

## 1. ⚙️ Role: ADMIN (Administrator Utama)
> **Hak Akses & Tanggung Jawab:**
> * Manajemen Akun Terpusat: Tambah pengguna baru (Guru, Waka, Siswa), edit data, dan aktifkan/nonaktifkan akun (`is_active`).
> * System Analytics Dashboard: Grafik kehadiran harian, sebaran role, breakdown status siswa, dan indikator kesehatan server.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#1` | **Admin Utama** | `admin@sekolah.sch.id` | `password123` | Staff / System | 🟢 **AKTIF** |

---

## 2. 📋 Role: WAKA KURIKULUM (Wakil Kepala Sekolah Bidang Kurikulum)
> **Hak Akses & Tanggung Jawab:**
> * Manajemen Kurikulum & Mapel: Pengaturan mata pelajaran (tingkat kelas 10, 11, 12; jurusan IPA, IPS, Umum; tipe wajib/peminatan).
> * Penjadwalan Waktu Belajar: Jam mulai, jam selesai, hari, dan ruangan kelas.
> * Verifikasi ACC Soal Ujian: Review butir soal dari guru, setujui (*Approved*), atau tolak (*Rejected*) dengan catatan evaluasi.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#2` | **Waka Kurikulum** | `waka@sekolah.sch.id` | `password123` | Staff / Management | 🟢 **AKTIF** |

---

## 3. 👨‍🏫 Role: GURU (Tenaga Pendidik / Pengajar)
> **Hak Akses & Tanggung Jawab:**
> * Rekap & Override Presensi: Monitoring kehadiran harian per mapel dan kemampuan mengubah status kehadiran siswa yang terlambat/alpa.
> * Verifikasi Surat Izin Siswa: Meninjau pengajuan surat izin, memeriksa bukti berkas PDF/gambar, serta memberi persetujuan ACC.
> * Bank Soal & Manajemen Ujian: Membuat paket soal pilihan ganda baru dan mengajukannya ke Waka Kurikulum.
> * AI Quiz Generator: Ekstrak materi dari berkas PDF secara otomatis menjadi draft butir soal pilihan ganda siap pakai.
> * Unggah Materi Pembelajaran: Publikasi berkas modul PDF untuk diakses oleh siswa.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#3` | **Pak Budi (Guru Math)** | `budi@sekolah.sch.id` | `password123` | Staff / Pengajar | 🟢 **AKTIF** |

---

## 4. 🎓 Role: SISWA (Peserta Didik)
> **Hak Akses & Tanggung Jawab:**
> * Presensi Mandiri: Melakukan absensi tepat waktu per mata pelajaran sesuai jadwal kurikulum (deteksi batas waktu keterlambatan 15 menit).
> * Form Pengajuan Perizinan: Mengirim surat izin sakit atau keperluan keluarga disertai unggahan dokumen bukti (PDF / Gambar) serta memantau status persetujuan Guru.
> * Materi Pembelajaran: Membaca dan mengunduh berkas PDF materi dari guru pengampu.
> * Ujian Online CBT: Mengerjakan ujian pilihan ganda berbasis waktu dengan timer hitung mundur, auto-submit, dan penilaian instan (*auto-grading*).
> * Grafik Nilai Semester: Visualisasi Recharts tren perkembangan nilai semester 1 hingga 6 terhadap standar KKM (75.00).

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#4` | **Siti Rahma** | `siti@sekolah.sch.id` | `password123` | Kelas 10 | 🟢 **AKTIF** |
| `#5` | **Ahmad Fauzi** | `ahmad@sekolah.sch.id` | `password123` | Kelas 11 | 🔴 **NONAKTIF** (Uji coba akun diblokir) |
| `#6` | **Mahesa Narasinghamurti** | `mashisa@sekolah.sch.id` | `password123` | Kelas 10 | 🟢 **AKTIF** |

---

## 💡 Panduan Cepat Pengujian Login
1. Pastikan backend Express berjalan di port 5000 dan frontend Vite berjalan di port 8000.
2. Buka peramban di **`http://localhost:8000`**.
3. Masukkan **Email** dan **Password** dari tabel di atas sesuai role yang ingin diuji.
4. Anda juga dapat menggunakan tombol **Demo Quick Login** pada kartu halaman login untuk berganti akun secara instan dalam satu klik.
