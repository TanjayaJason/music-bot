# Arsitektur

## Alur dokumen

1. Browser admin meminta signed upload token dari Route Handler yang memverifikasi `profiles.role = admin`.
2. Browser mengunggah PDF langsung ke bucket privat `documents`, sehingga body besar tidak melewati Vercel Function.
3. Admin memicu `/process`; server mengunduh PDF, memvalidasi signature, lalu menjalankan ekstraksi teks dan tabel per halaman.
4. Tabel disimpan sebagai grid asli, JSON ternormalisasi, dan Markdown pencarian. Sel kosong hanya mewarisi nilai sebelumnya; parser tidak membuat isi baru.
5. Bagian ambigu diberi `needs_review`. PDF hampir tanpa teks dihentikan dengan pesan `OCR diperlukan`.
6. Chunk berbasis bagian diberi embedding 768 dimensi. RPC `replace_document_index` mengganti section/chunk dalam satu transaksi agar reindex idempoten.
7. Admin mengoreksi hasil, menyetujui bagian, lalu menerbitkan. Status indexing dan publikasi terpisah.

## Alur pertanyaan

`POST /api/chat` → validasi Zod → rate limit PostgreSQL → normalisasi istilah/tanggal Indonesia → Gemini query embedding → RPC pencarian hybrid → threshold relevansi → konteks terbatas → Groq → jawaban dan sitasi.

RPC memaksa `published + completed`, periode efektif, dan menyingkirkan sumber yang telah digantikan oleh dokumen terbit. Prompt memperlakukan isi PDF sebagai data yang tidak dipercaya dan menolak instruksi yang tertanam di dalamnya.

## Batas kepercayaan

- Browser tidak pernah menerima service-role key, Gemini key, atau Groq key.
- Role admin berasal dari database, bukan email atau metadata client.
- Storage privat; publik hanya mendapat signed URL singkat melalui endpoint yang memeriksa status dokumen.
- Semua tabel memakai RLS. Fungsi pencarian/reindex/rate limit dicabut dari `anon` dan `authenticated`; hanya `service_role` yang dapat mengeksekusi.
- Output dokumen tidak dirender sebagai HTML mentah. Markdown chat dirender tanpa `rehype-raw`.

## Modul

- `lib/pdf`: interface parser, ekstraksi per halaman, heading, dan normalisasi tabel.
- `lib/rag`: normalisasi query, chunking sadar struktur, dan retrieval.
- `lib/ai`: panggilan HTTP langsung ke Gemini/Groq dengan timeout dan model eksplisit.
- `lib/auth`, `lib/supabase`: sesi dan klien terpisah.
- `lib/documents`: orkestrasi ingestion di luar Route Handler.

Model ini sengaja menghindari LangChain, Redis, worker berbayar, dan text-to-SQL.
