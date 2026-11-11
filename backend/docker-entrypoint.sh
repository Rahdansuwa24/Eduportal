#!/bin/sh
set -e

echo "⏳ Memeriksa kesiapan koneksi Database..."
node -e "
const db = require('./config/db.js');
const testConn = async (retries = 20) => {
  while (retries > 0) {
    try {
      await db.query('SELECT 1');
      console.log('✅ Koneksi Database berhasil terhubung.');
      process.exit(0);
    } catch (err) {
      console.log('⚠️ Database belum siap, mencoba lagi dalam 2 detik... (sisa ' + retries + ' percobaan): ' + err.message);
      await new Promise(r => setTimeout(r, 2000));
      retries--;
    }
  }
  console.error('❌ Gagal terhubung ke Database setelah beberapa percobaan.');
  process.exit(1);
};
testConn();
"

echo "🚀 Menjalankan migrasi struktur tabel & injeksi data dummy komprehensif..."
node ./config/initDb.js

echo "⚡ Menjalankan Server Backend Express EduPortal..."
exec node ./bin/www
