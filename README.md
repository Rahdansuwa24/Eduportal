# 🏫 EduPortal Pro: AI-Powered School Management & Analytics Dashboard

EduPortal Pro adalah sistem manajemen akademik sekolah terpadu berbasis web yang dirancang untuk mendukung operasional multi-peran (**Admin**, **Waka Kurikulum**, **Guru**, dan **Siswa**). Sistem ini dilengkapi dengan presensi cerdas berbasis jadwal kurikulum, manajemen bank soal, sistem Computer-Based Testing (CBT) dengan penilaian instan (*auto-grading*), visualisasi analitik performa siswa, serta fitur AI Quiz Generator otomatis dari dokumen PDF materi pelajaran.

---

## 🌟 Fitur Utama Berdasarkan Peran

### 1. ⚙️ Administrator Utama (Admin)
* **Manajemen Pengguna Terpusat:** Pembuatan akun baru (Guru, Waka, Siswa) dengan enkripsi password Bcrypt serta pengaktifan atau penonaktifan akun (`is_active`).
* **System Analytics Dashboard:** Visualisasi grafik kehadiran mingguan, komposisi peran pengguna, distribusi status siswa (aktif, lulus, cuti, do), dan indikator metrik server.

### 2. 📋 Wakil Kepala Sekolah Bidang Kurikulum (Waka Kurikulum)
* **Manajemen Kurikulum & Mapel:** Pengaturan mata pelajaran berjenjang kelas (10, 11, 12), jurusan (IPA, IPS, Umum), dan tipe mapel (wajib atau peminatan).
* **Penjadwalan Waktu Belajar:** Alokasi jam belajar per hari dan penugasan ruangan kelas.
* **Verifikasi ACC Soal Ujian:** Peninjauan butir soal draft dari guru dengan modal pratinjau soal, persetujuan cepat (*Approved*), atau penolakan (*Rejected*) dengan catatan evaluasi.

### 3. 👨‍🏫 Tenaga Pendidik (Guru)
* **Monitoring & Override Presensi:** Pemantauan daftar hadir harian per mapel dengan hak akses mengubah status absensi siswa yang lupa absen atau terkendala teknis.
* **Verifikasi Surat Izin Siswa:** Peninjauan permohonan surat izin siswa, unduh berkas bukti (PDF/gambar), dan penetapan status ACC.
* **Bank Soal & Manajemen Ujian:** Penyusunan paket soal pilihan ganda baru lengkap dengan distribusi kunci jawaban.
* **AI Quiz Generator:** Ekstrak materi dari berkas PDF secara otomatis menjadi draf kuis pilihan ganda siap pakai menggunakan pustaka `pdf-parse`.
* **Katalog Materi:** Pengunggahan modul materi pelajaran PDF untuk diakses siswa.

### 4. 🎓 Peserta Didik (Siswa)
* **Presensi Mandiri Per Sesi:** Konfirmasi kehadiran mandiri sesuai jam mata pelajaran dengan toleransi keterlambatan 15 menit.
* **Pengajuan Perizinan:** Formulir izin sakit atau keperluan mendesak disertai bukti berkas surat dan pelacakan status ACC dari guru.
* **Katalog Materi Pembelajaran:** Membaca dan mengunduh berkas PDF materi modul resmi sekolah.
* **Ujian Online CBT Interaktif:** Pengerjaan soal ujian dengan penghitung waktu mundur (*countdown timer*), palet navigasi nomor soal, proteksi kebocoran kunci jawaban, dan skor instan saat selesai.
* **Grafik Nilai Semester:** Visualisasi garis Recharts perkembangan nilai semester 1 hingga 6 dibandingkan batas KKM sekolah (75.00).

---

## 🛠️ Tech Stack

* **Basis Data:** PostgreSQL 18
* **Backend:** Node.js, Express.js, `multer` (penanganan unggah berkas), `pdf-parse` (ekstraksi teks PDF untuk AI), `bcryptjs`, `jsonwebtoken` (JWT)
* **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Recharts

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat Sistem
* **Node.js:** Versi >= 18.0.0
* **PostgreSQL:** Versi >= 15 (disarankan PostgreSQL 18) yang sedang berjalan di port `5432`

---

### Langkah 1: Pengaturan Backend Express

1. Buka terminal dan masuk ke direktori backend:
   ```bash
   cd "backend"
   ```

2. Pasang seluruh dependensi:
   ```bash
   npm install
   ```

3. Siapkan berkas environment:
   Salin berkas `.env.example` menjadi `.env`:
   ```bash
   copy .env.example .env
   ```
   Pastikan konfigurasi kredensial basis data sesuai dengan PostgreSQL lokal Anda:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password_postgres_anda
   DB_NAME=eduportal_db
   JWT_SECRET=rahasia_eduportal_pro_sekolah_2026_super_safe
   ```

4. Inisialisasi basis data dan data seed awal:
   ```bash
   node config/initDb.js
   ```
   *(Perintah ini otomatis membuat database `eduportal_db`, membuat seluruh tabel relasional, dan memasukkan data seed pengguna awal).*

5. Jalankan server backend:
   ```bash
   npm start
   ```
   API Server akan aktif dan dapat diakses di **`http://localhost:5000`**.

---

### Langkah 2: Pengaturan Frontend React (Vite)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd "frontend"
   ```

2. Pasang seluruh dependensi:
   ```bash
   npm install
   ```

3. Siapkan berkas environment frontend:
   Salin berkas `.env.example` menjadi `.env`:
   ```bash
   copy .env.example .env
   ```
   Isi konfigurasi endpoint backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Jalankan server pengembangan frontend:
   ```bash
   npm run dev
   ```
   Frontend akan aktif dan dapat dibuka melalui peramban di **`http://localhost:8000`**.

5. *(Opsional)* Uji coba kompilasi build produksi:
   ```bash
   npm run build
   ```

---

## 🔑 Kredensial Login Pengguna Demo

Seluruh akun seed default menggunakan password plaintext: **`password123`**.

| Role | Nama Pengguna | Email Login | Password | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Admin Utama | `admin@sekolah.sch.id` | `password123` | Akses penuh manajemen pengguna dan analitik |
| **Waka** | Waka Kurikulum | `waka@sekolah.sch.id` | `password123` | Akses kurikulum mapel dan verifikasi ACC ujian |
| **Guru** | Pak Budi (Guru Math) | `budi@sekolah.sch.id` | `password123` | Presensi guru, izin siswa, upload materi, dan AI Quiz |
| **Siswa** | Siti Rahma | `siti@sekolah.sch.id` | `password123` | Presensi siswa, izin mandiri, ujian CBT, dan grafik nilai |
| **Siswa** | Ahmad Fauzi | `ahmad@sekolah.sch.id` | `password123` | Akun berstatus non-aktif (contoh pengujian akun terblokir) |

> 💡 **Tip:** Halaman login juga dilengkapi dengan tombol **Demo Quick Login** untuk beralih role secara instan dengan satu klik tanpa perlu mengetik manual.

---

## 📁 Struktur Direktori Proyek

```text
Aplikasi sekolah/
├── backend/
│   ├── config/              <-- Koneksi database PostgreSQL & inisialisasi tabel (initDb.js)
│   ├── controllers/         <-- Logika bisnis REST API (Auth, User, Mapel, Kurikulum, Presensi, Perizinan, Ujian, Materi)
│   ├── middleware/          <-- Autentikasi JWT, validasi role, & konfigurasi Multer disk/memory
│   ├── routes/              <-- Perutean endpoint API Express
│   ├── uploads/             <-- Direktori berkas fisik surat izin & materi PDF
│   ├── utils/               <-- Helper pemrosesan teks AI Quiz Generator
│   ├── app.js               <-- Konfigurasi utama Express, static folder, & CORS
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      <-- Layout utama, Header, dan Sidebar responsif per role
│   │   ├── context/         <-- Global AuthContext & penanganan token JWT
│   │   ├── pages/           <-- Halaman UI untuk Admin, Waka, Guru, Siswa, dan Login
│   │   ├── services/        <-- Fetch API client terpadu (api.js)
│   │   └── App.jsx          <-- Konfigurasi routing & protected route per role
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore               <-- Kebijakan proteksi rahasia, kredensial, & berkas unggahan
├── LIST_USER_EDUPORTAL.md   <-- Dokumentasi akun pengguna dan status akses
├── PRD_EduPortal_Pro.md     <-- Dokumentasi spesifikasi produk dan skema basis data
├── TAHAPAN_PEMBUATAN_UI.md  <-- Panduan arsitektur antarmuka pengguna
└── README.md                <-- Dokumentasi utama proyek
```

---

## 🔒 Kebijakan Keamanan & Kredensial

* Berkas konfigurasi rahasia seperti `.env`, sertifikat pribadi (`*.pem`, `*.key`), dan berkas fisik unggahan pengguna pada `backend/uploads/` dilindungi secara ketat oleh `.gitignore` sehingga tidak akan terunggah ke repositori git.
* Password pengguna selalu disimpan dalam bentuk hash satu arah menggunakan algoritma Bcrypt dengan cost factor 10.
* Seluruh endpoint privat diwajibkan menyertakan header `Authorization: Bearer <token_jwt>` yang divalidasi oleh middleware autentikasi Express.
