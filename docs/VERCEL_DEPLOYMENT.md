# Deployment Vercel Hobby

1. Push repository ke GitHub.
2. Import repository di Vercel sebagai Next.js project.
3. Pilih Node.js 22.x.
4. Masukkan seluruh variabel dari `.env.example` untuk Production (dan Preview bila memang diperlukan).
5. Jalankan migration Supabase sebelum deployment pertama.
6. Deploy, lalu uji login, signed upload, proses satu PDF kecil, publish, dan chat.

Route pemrosesan memakai `maxDuration = 60`; batas nyata mengikuti plan dan konfigurasi Vercel. Upload dilakukan langsung ke Supabase agar ukuran body tidak membebani Function. Tetap gunakan PDF maksimal 8 MB dan dokumen dengan jumlah halaman moderat.

Jangan menambahkan secret ke `vercel.json`, source code, atau variabel `NEXT_PUBLIC_*`. Pastikan deployment Preview tidak memakai database produksi bila tim yang lebih besar dapat mengakses preview.
