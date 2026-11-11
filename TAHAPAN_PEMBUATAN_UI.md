# 🎨 Panduan & Tahapan Pembuatan UI: EduPortal Pro
**Tech Stack Frontend:** React 19 (Vite) + Tailwind CSS + Lucide Icons + Recharts  
**Status UI:** 100% Selesai & Terintegrasi ke Backend API  

---

## 📌 Lokasi Kerja Frontend
Direktori kerja frontend:
```bash
cd "d:\Developer\Aplikasi sekolah\frontend"
```

---

## 🚀 Tahap 1: Setup Tailwind CSS & Styling Base

1. **Install Dependensi Styling & PostCSS:**
   ```bash
   npm install -D tailwindcss@3 postcss autoprefixer
   ```

2. **Inisialisasi Konfigurasi Tailwind & PostCSS:**
   ```bash
   npx tailwindcss init -p
   ```

3. **Konfigurasi `frontend/tailwind.config.js`:**
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

4. **Direktif Dasar di `frontend/src/index.css`:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## 🔗 Tahap 2: Konfigurasi Path Alias (`@/`)

1. **Install `@types/node`:**
   ```bash
   npm install -D @types/node
   ```

2. **Pengaturan Alias pada `frontend/vite.config.js`:**
   ```javascript
   import path from "path"
   import { defineConfig } from "vite"
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
     server: {
       port: 8000,
     }
   })
   ```

3. **Dukungan Editor Code pada `frontend/jsconfig.json`:**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

---

## 📦 Tahap 3: Instalasi Library Ikon & Data Visualisasi

```bash
npm install lucide-react recharts clsx tailwind-merge
```

* 🎨 **`lucide-react`**: Kumpulan ikon SVG modern dan ringan untuk navigasi dan aksi.
* 📊 **`recharts`**: Library grafik responsif untuk visualisasi kehadiran mingguan, distribusi peran, dan tren nilai semester.
* 🔀 **`clsx` & `tailwind-merge`**: Utility penggabungan kelas styling dinamis bebas konflik.

---

## 📂 Tahap 4: Arsitektur Berkas & Komponen UI

```text
frontend/src/
├── assets/
├── components/
│   └── layout/
│       ├── DashboardLayout.jsx  <-- Shell pembungkus halaman
│       ├── Header.jsx           <-- Topbar profil, role badge, & notifikasi
│       └── Sidebar.jsx          <-- Navigasi dinamis responsif per role
├── context/
│   └── authContext.jsx          <-- State autentikasi global & token JWT
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx        <-- Halaman login + tombol Demo Quick Login
│   ├── admin/
│   │   ├── adminDashboard.jsx   <-- Manajemen user CRUD & modal registrasi
│   │   └── SystemAnalytics.jsx  <-- Visualisasi analitik sistem (Area, Pie, Bar charts)
│   ├── waka/
│   │   ├── wakaDashboard.jsx    <-- Dashboard kurikulum & alokasi jadwal
│   │   ├── ManajemenMapel.jsx   <-- CRUD kurikulum mata pelajaran
│   │   └── AccSoalUjian.jsx     <-- Verifikasi & review butir soal ujian
│   ├── guru/
│   │   ├── guruDashboard.jsx    <-- Shell navigasi guru
│   │   ├── GuruPresensiOverride.jsx <-- Monitoring presensi & edit kehadiran
│   │   ├── GuruAccPerizinan.jsx <-- Verifikasi berkas surat izin siswa
│   │   ├── BankSoalUjian.jsx    <-- Pembuatan paket soal & preview kunci jawaban
│   │   ├── UnggahMateri.jsx     <-- Upload berkas PDF modul pembelajaran
│   │   └── AiQuizGenerator.jsx  <-- Ekstraksi otomatis butir kuis dari dokumen PDF
│   └── siswa/
│       ├── siswaDashboard.jsx   <-- Shell navigasi siswa
│       ├── PresensiHarian.jsx   <-- Presensi mandiri per mapel (toleransi 15 menit)
│       ├── FormPerizinanSiswa.jsx <-- Pengajuan surat izin + unggah berkas bukti
│       ├── MateriUjianOnline.jsx <-- Baca modul PDF & mesin ujian CBT interaktif
│       └── GrafikNilaiSemester.jsx <-- Grafik tren nilai 6 semester vs KKM
└── services/
    └── api.js                   <-- Handler API Fetch otomatis header JWT & Form-Data
```

---

## 🎯 Tahap 5: Standar Kualitas Desain & Aksesibilitas
1. **WCAG AA Contrast**: Rasio kontras teks terhadap latar belakang selalu memenuhi standar keterbacaan tinggi (misal: `text-slate-800` pada latar belakang `bg-white` / `bg-slate-50`).
2. **State Lengkap**: Setiap komponen data-driven wajib memiliki state:
   * *Loading State*: Spinner `Loader2` atau skeleton animasi.
   * *Empty State*: Ilustrasi ikon dan teks panduan jika belum ada data.
   * *Error State*: Banner peringatan dengan tombol coba lagi (*retry*).
3. **Responsif Mobile & Desktop**:
   * Sidebar menggunakan mode *drawer overlay* pada layar smartphone (< 1024px) dan mode *fixed sticky* pada layar desktop.
   * Tabel dilengkapi pembungkus `overflow-x-auto` agar tidak terpotong pada perangkat layar kecil.
4. **Anti-Slop Copywriting**: Seluruh teks tombol, lencana, dan notifikasi ditulis secara ringkas, jelas, profesional, serta menghindari tanda baca em dash.
