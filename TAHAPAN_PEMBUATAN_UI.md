# 🎨 Panduan & Tahapan Pembuatan UI EduPortal Pro
**Tech Stack Frontend:** React (Vite) + Tailwind CSS + shadcn/ui + Lucide Icons + TailAdmin Layout

---

## 📌 Lokasi Terminal
Sebelum menjalankan perintah di bawah ini, pastikan terminal Anda berada di folder `frontend`:
```bash
cd "d:\Developer\Aplikasi sekolah\frontend"
```

---

## 🚀 Tahap 1: Setup Tailwind CSS v3

> 💡 **Dokumentasi Resmi Tailwind v3:** [v3.tailwindcss.com/docs/guides/vite](https://v3.tailwindcss.com/docs/guides/vite)

1. **Install Dependensi Tailwind CSS v3 & PostCSS:**
   ```bash
   npm install -D tailwindcss@3 postcss autoprefixer
   ```

2. **Generate File Konfigurasi Tailwind & PostCSS:**
   ```bash
   npx tailwindcss init -p
   ```
   *(Flag `-p` otomatis membuatkan 2 file sekaligus: `tailwind.config.js` dan `postcss.config.js`)*.

3. **Edit File `frontend/tailwind.config.js`:**
   Sesuaikan bagian `content`:
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
   > ❓ **Alasan Bagian `content` Harus Diisi:**  
   > Tailwind menggunakan sistem *Tree-shaking*. Array `content` memberitahu Tailwind lokasi file React Anda agar Tailwind **hanya meregenerasi class CSS yang benar-benar dipakai saja**. Jika `content` kosong, class Tailwind (seperti `bg-red-500`, `flex`, dll) **tidak akan berfungsi di browser**.

4. **Edit File `frontend/src/index.css`:**
   Hapus seluruh isi CSS lama dan ganti dengan direktif berikut:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

## 🔗 Tahap 2: Konfigurasi Path Alias (`@/`) untuk shadcn/ui

1. **Install `@types/node`:**
   ```bash
   npm install -D @types/node
   ```

2. **Edit File `frontend/vite.config.js`:**
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

3. **Buat File Baru `frontend/jsconfig.json`:**
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
   > ❓ **Alasan Membuat `jsconfig.json`:**  
   > `vite.config.js` hanya dibaca oleh bundler Vite saat runtime. File `jsconfig.json` secara khusus memberitahu **VS Code / Code Editor** agar mengenali jalur `@/` sebagai `./src/`, sehingga fitur **Auto-Complete**, **Auto-Import**, dan navigasi kode berjalan lancar tanpa garis merah error.

---

## 📦 Tahap 3: Inisialisasi shadcn/ui & Install Komponen UI

> 💡 **Dokumentasi Resmi shadcn/ui Vite:** [ui.shadcn.com/docs/installation/vite](https://ui.shadcn.com/docs/installation/vite)

1. **Install Library Helper & Lucide Icons:**
   ```bash
   npm install lucide-react clsx tailwind-merge class-variance-authority
   ```

   **Penjelasan & Link Resmi Library Helper:**
   * 🎨 **`lucide-react`** ([lucide.dev](https://lucide.dev/)): Library ikon SVG modern & ringan khusus React.
   * 🔀 **`clsx`** ([npmjs.com/package/clsx](https://www.npmjs.com/package/clsx)): Utility untuk mengabungkan class CSS secara kondisional.
   * 🧩 **`tailwind-merge`** ([npmjs.com/package/tailwind-merge](https://www.npmjs.com/package/tailwind-merge)): Menggabungkan class Tailwind secara cerdas tanpa ada konflik.
   * 🎛️ **`class-variance-authority` (cva)** ([cva.style/docs](https://cva.style/docs)): Membuat sistem varian komponen UI (contoh: `primary`, `destructive`, `outline`, ukuran `sm`, `lg`).

2. **Inisialisasi shadcn/ui:**
   ```bash
   npx shadcn@latest init
   ```
   *Pilihan opsi saat init:*
   - Style: **Default / New York**
   - Base color: **Slate**
   - CSS variables: **Yes**

3. **Install Komponen Utama shadcn/ui untuk Fitur PRD:**
   ```bash
   npx shadcn@latest add button card badge dialog table tabs select dropdown-menu input toast
   ```

---

## 📂 Tahap 4: Struktur Folder UI Multi-Role (TailAdmin Layout)

Buat struktur folder berikut di dalam `frontend/src/`:

```text
frontend/src/
├── components/
│   ├── ui/               <-- Komponen dari shadcn/ui (Button, Card, Badges, dll)
│   └── layout/
│       ├── Sidebar.jsx   <-- Navigasi Sidebar Dinamis per Role (TailAdmin)
│       ├── Header.jsx    <-- Navbar Topbar Profile & Notifications
│       └── DashboardLayout.jsx
├── pages/
│   ├── admin/            <-- Halaman User Management & Analytics
│   ├── waka/             <-- Halaman CRUD Mapel & ACC Soal Ujian
│   ├── guru/             <-- Halaman Upload Materi & AI Quiz Generator
│   └── siswa/            <-- Halaman Presensi & Quiz Timer Countdown
└── services/             <-- API Calls ke Backend Express.js
```

---

## 📊 Tahap 5: Instalasi Data Visualization (Recharts)

Untuk visualisasi **Line Chart 6 Semester Siswa** dan **Bar Chart Presensi/Users Admin**:

```bash
npm install recharts
```
