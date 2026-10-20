# Checkpoint — 20 Oktober 2026

## Kondisi terakhir

- Aplikasi berjalan lokal dengan Node.js 22 di `http://localhost:3000`.
- Migration Supabase berhasil dijalankan.
- User admin pertama sudah dibuat dan login admin berfungsi.
- Upload, ekstraksi PDF, peninjauan, publikasi, chat biasa, dan retrieval RAG sudah diuji berhasil.
- Favicon menggunakan logo Seksi Liturgi.
- Header menampilkan logo Paroki lalu logo Seksi Liturgi.
- Palet visual utama menggunakan putih dan merah dengan biru tua sebagai aksen ketiga.
- Bug transfer buffer `pdf-parse` dan peringatan React pada halaman chat sudah diperbaiki.
- Pemeriksaan terakhir: 12 test lulus, TypeScript lulus, lint lulus, dan production build berhasil.

## Pembagian pekerjaan berdasarkan lokasi

### Di kantor — aman tanpa koneksi Supabase

- Merapikan layout, spacing, tipografi, warna, responsive design, dan aksesibilitas.
- Mengubah komponen visual dengan data contoh atau state kosong.
- Menjalankan `npm test`, `npm run typecheck`, `npm run lint`, dan `npm run build`.
- Hindari menguji login, upload, publish, chat nyata, atau tindakan lain yang membutuhkan Supabase.

### Di rumah — membutuhkan koneksi Supabase

- Menguji login dan hak akses admin.
- Menguji upload, ekstraksi, reindex, review, publish, dan delete dokumen.
- Menguji retrieval RAG, sitasi, feedback, serta penyimpanan sesi chat.
- Menjalankan atau mengubah migration database dan Storage policy.

## Cara melanjutkan

```powershell
git pull origin main
npm install
npm run dev
```

File `.env.local` tidak disimpan di Git. Di komputer lain, salin `.env.example` menjadi `.env.local` dan isi kredensial hanya bila koneksi Supabase memang akan digunakan.

## Catatan keamanan

- Jangan commit `.env.local`, API key, password, atau service-role key.
- Bucket `documents` harus tetap privat.
- Perubahan database dibuat sebagai migration baru; jangan mengubah migration yang sudah diterapkan kecuali sedang memperbaiki instalasi baru.
