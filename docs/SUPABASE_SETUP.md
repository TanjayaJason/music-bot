# Setup Supabase

1. Buat proyek Free dan catat Project URL, anon/publishable key, dan service-role key.
2. Di SQL Editor, jalankan migration `supabase/migrations/202610200001_initial_schema.sql` utuh.
3. Pastikan extension `vector` aktif dan bucket `documents` berstatus private dengan batas 8 MB.
4. Pada Authentication, aktifkan Email/Password. Untuk instalasi tertutup, nonaktifkan public sign-up.
5. Buat user admin pertama dari dashboard Auth; kemudian masukkan UUID-nya ke `profiles`:

```sql
insert into public.profiles(user_id, role)
values ('UUID_USER_AUTH', 'admin');
```

Tidak ada email yang di-hardcode. Menambah admin berikutnya memakai langkah yang sama. Jangan membuat policy yang mengizinkan user menulis role mereka sendiri.

## Pemeriksaan keamanan

- Jalankan query sebagai anon dan pastikan dokumen `draft` tidak dapat dibaca.
- Pastikan bucket `documents` tidak public.
- Jangan menaruh service-role key pada `NEXT_PUBLIC_*`.
- Rotasi key segera jika pernah masuk log, Git, atau browser bundle.

## Supersesi

Pada halaman detail dokumen baru, pilih dokumen lama pada **Menggantikan dokumen**. Setelah dokumen baru diterbitkan, retrieval normal mengabaikan dokumen lama. Pertanyaan historis belum memiliki toggle UI khusus pada MVP.
