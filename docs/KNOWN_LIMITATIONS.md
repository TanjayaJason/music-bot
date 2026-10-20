# Batasan yang Diketahui

- OCR belum tersedia. PDF scan ditandai dan tidak diindeks.
- Deteksi tabel `pdf-parse` v2 paling baik untuk tabel bergaris. Tabel tanpa garis atau merge kompleks wajib dikoreksi manusia.
- Pemrosesan berjalan dalam request admin, bukan queue durable. Dokumen besar dapat melewati batas waktu Vercel Hobby; pecah dokumen atau proses ulang.
- Rate limiting menggunakan PostgreSQL per hash IP. Ini praktis dan gratis, tetapi bukan perlindungan abuse global sekuat layanan edge khusus. IP bersama dapat berbagi kuota.
- Riwayat chat publik memakai session acak tetapi belum menyediakan sinkronisasi lintas perangkat.
- Perbandingan eksplisit dua revisi dan mode pencarian historis belum memiliki UI khusus; data supersesi sudah tersedia.
- Free tier, kuota, dan daftar model dapat berubah. Aplikasi gagal secara eksplisit dan tidak beralih otomatis ke layanan berbayar.
- Parser mempertahankan nomor halaman fisik PDF; nomor halaman cetak yang berbeda belum dipetakan.
- Pengujian unit memakai data sintetis dan tidak menyatakan kebijakan liturgi resmi.

## Snapshot batas layanan (diverifikasi 20 Oktober 2026)

- Supabase Free: 500 MB database, 1 GB Storage, dan 10 GB bandwidth organisasi. Proyek dapat dibatasi/read-only saat kuota terlampaui.
- Vercel Hobby: penggunaan personal/nonkomersial; Function default 10 detik dan dapat dikonfigurasi sampai 60 detik. Karena itu route ingestion memakai batas 60 detik dan upload langsung ke Storage.
- Groq Free untuk `openai/gpt-oss-20b`: dokumentasi saat ini menampilkan 30 RPM, 1.000 RPD, 8.000 TPM, dan 200.000 TPD; limit akun aktual tetap harus diperiksa di halaman Limits.
- `gemini-embedding-001` mendukung dimensi 128–3072 dan merekomendasikan 768/1536/3072. Proyek ini mengunci 768 agar konsisten dengan pgvector.

Rujukan resmi: [Supabase billing](https://supabase.com/docs/guides/platform/billing-on-supabase), [Supabase bandwidth](https://supabase.com/docs/guides/storage/serving/bandwidth), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Groq rate limits](https://console.groq.com/docs/rate-limits), dan [Gemini Embedding](https://ai.google.dev/gemini-api/docs/models/gemini-embedding-001). Nilai dapat berubah; periksa kembali sebelum produksi.
