# CHORD

**Catholic Hymn Options, Rules, & Directives**

Asisten pengetahuan musik liturgi berbahasa Indonesia yang menjawab berdasarkan PDF yang diunggah, ditinjau, dan diterbitkan oleh administrator. Proyek ini memakai Next.js App Router, Supabase (Auth, PostgreSQL, Storage, pgvector), Gemini Embedding, dan Groq Chat Completions.

> Aplikasi ini adalah alat bantu informasi, bukan otoritas gerejawi resmi. Contoh dan fixture pengujian bukan kebijakan Gereja.

## Fitur

- Chat publik dengan jawaban berlandaskan dokumen dan sitasi halaman.
- Pencarian hybrid: vector similarity, full-text search, filter tanggal, masa berlaku, status publikasi, dan supersesi.
- Login admin yang diverifikasi server-side melalui `profiles.role`.
- Unggah langsung ke bucket Supabase privat dengan signed upload token.
- Ekstraksi teks per halaman dan tabel bergaris memakai `pdf-parse` v2.
- Deteksi heading, PDF hasil scan, tabel ambigu, koreksi manual, reindex idempoten, dan alur tinjau sebelum terbit.
- RLS ketat, validasi Zod, batas ukuran unggah, timeout AI, dan rate limit PostgreSQL tanpa Redis.
- Dashboard, pengelolaan dokumen, feedback, serta dokumentasi deploy.

## Persyaratan

- Node.js 22.12+ (kompatibel dengan SDK Supabase, `pdf-parse`, Vite, dan Vitest terbaru)
- npm 10+
- Proyek Supabase Free dengan Database, Auth, dan Storage
- API key Gemini dan Groq dengan akses free tier

## Menjalankan lokal

```bash
npm install
copy .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Isi `.env.local` dengan kredensial milik Anda; jangan kirim atau commit secret.

## Konfigurasi Supabase

1. Buat proyek Supabase.
2. Jalankan `supabase/migrations/202610200001_initial_schema.sql` di SQL Editor.
3. Buat user pertama melalui Authentication > Users.
4. Salin UUID user tersebut, lalu jalankan:

```sql
insert into public.profiles (user_id, role)
values ('UUID_USER_AUTH', 'admin');
```

5. Masukkan Project URL, publishable/anon key, dan service-role key ke `.env.local`.

Bucket `documents` dibuat privat oleh migration. Jangan mengubahnya menjadi public. Panduan lengkap ada di [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).

## Unggah PDF pertama

1. Masuk melalui `/login`.
2. Buka `/admin/dokumen/upload`.
3. Isi metadata, pilih PDF berbasis teks berukuran maksimum 8 MB, lalu proses.
4. Periksa setiap bagian bertanda **Perlu tinjauan**; koreksi dan setujui.
5. Klik **Terbitkan**. Baru setelah itu dokumen ikut dalam pencarian publik.

## Menguji retrieval dan build

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Setelah dokumen terbit, buka `/chat` dan ajukan pertanyaan yang jawabannya benar-benar ada di PDF. Periksa bahwa judul dan halaman sumber sesuai. Tanpa kredensial eksternal, unit test tetap dapat dijalankan, tetapi integrasi Gemini/Groq/Supabase tidak dapat diverifikasi.

## Variabel lingkungan

| Variabel | Lingkup | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client/server | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client/server | publishable/anon key; aman untuk browser dengan RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | server saja | akses istimewa; jangan memakai awalan `NEXT_PUBLIC_` |
| `GEMINI_API_KEY` | server saja | embedding 768 dimensi |
| `GROQ_API_KEY` | server saja | Chat Completions |
| `GROQ_MODEL` | server | default `openai/gpt-oss-20b` |
| `GEMINI_EMBEDDING_MODEL` | server | default `gemini-embedding-001` |
| `MAX_UPLOAD_MB` | server | default 8 (bucket migration juga membatasi 8 MB) |
| `PUBLIC_CHAT_REQUESTS_PER_HOUR` | server | default 20 per hash IP |

## Troubleshooting

- **`OCR diperlukan`**: PDF tidak memiliki lapisan teks. Gunakan PDF text-based atau lakukan OCR di luar aplikasi sebelum unggah.
- **Embedding 429**: kuota Gemini free tier habis. Tunggu reset kuota; aplikasi tidak berpindah diam-diam ke model berbayar.
- **Groq 429/model unavailable**: pilih model gratis yang tersedia dan ubah `GROQ_MODEL`; jangan mengaktifkan billing tanpa keputusan eksplisit.
- **Login berhasil lalu kembali ke login**: pastikan UUID user ada di tabel `profiles` dengan role `admin` dan URL/key benar.
- **Publish ditolak**: setujui semua bagian yang berstatus `needs_review`.
- **Build lokal gagal karena engine**: gunakan Node 22.12+ (`node --version`).

Arsitektur dan batasan operasional dijelaskan di [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) dan [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md).
