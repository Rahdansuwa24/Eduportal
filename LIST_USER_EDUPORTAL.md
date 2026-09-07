# 👥 Daftar Akun Pengguna & Kredensial Login – EduPortal Pro

Dokumen ini berisi daftar lengkap akun pengguna (*user accounts*) di database PostgreSQL **`eduportal_db`**, dikelompokkan berdasarkan **Role Hak Akses** masing-masing.

---

## 🔑 Kredensial Login Utama (Default All Users)
> **Password Asli (Plaintext):** `password123`  
> **Hash Enkripsi (Bcrypt):** `$2a$10$e8qH9z3.kG9s/X7jO1W00u0J4/1b9gT5yH3wL9zK1O2P3Q4R5S6T7`

---

## 1. ⚙️ Role: ADMIN (Administrator Utama)
> **Hak Akses:** Manajemen User Terpusat, Registrasi Akun Baru, Toggle Status Aktif/Nonaktif, & System Analytics.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#1` | **Admin Utama** | `admin@sekolah.sch.id` | `password123` | Staff / System | 🟢 **AKTIF** |

---

## 2. 📋 Role: WAKA KURIKULUM (Wakil Kepala Sekolah Bidang Kurikulum)
> **Hak Akses:** Kelola Kurikulum Mata Pelajaran Wajib & Peminatan (CRUD Mapel) & Verifikasi ACC Draft Soal Ujian Guru.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#2` | **Waka Kurikulum** | `waka@sekolah.sch.id` | `password123` | Staff / Management | 🟢 **AKTIF** |

---

## 3. 👨‍🏫 Role: GURU (Tenaga Pendidik / Pengajar)
> **Hak Akses:** Rekap & Pop-up Override Presensi Siswa, Verifikasi ACC Surat Izin Siswa (PDF/Gambar), Upload Materi PDF, & AI Quiz Generator.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#3` | **Pak Budi (Guru Math)** | `budi@sekolah.sch.id` | `password123` | Staff / Pengajar | 🟢 **AKTIF** |

---

## 4. 🎓 Role: SISWA (Peserta Didik)
> **Hak Akses:** Submit Presensi Kehadiran Harian (Deadline 07:30 WIB), Form Perizinan & Upload Surat Dokter/Izin, Ujian Online, & Visualisasi Line Chart Nilai 6 Semester.

| ID | Nama Lengkap | Email (Username Login) | Password | Tingkat Kelas | Status Akun |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `#4` | **Siti Rahma** | `siti@sekolah.sch.id` | `password123` | Kelas 10 | 🟢 **AKTIF** |
| `#5` | **Ahmad Fauzi** | `ahmad@sekolah.sch.id` | `password123` | Kelas 11 | 🔴 **NONAKTIF** |

---

## 💡 Panduan Uji Coba Login
1. Buka browser di **`http://localhost:8000`**.
2. Masukkan **Email** dan **Password** dari tabel di atas sesuai role yang ingin Anda uji.
3. Anda juga dapat mengeklik tombol **Demo Quick Login** di halaman login untuk beralih role secara instan.
