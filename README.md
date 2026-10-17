# Maiharsa Portfolio

Website portofolio kreatif berbasis React + Vite, Express, dan PostgreSQL, disusun mengikuti MVP PRD final.

## Halaman

- `/` — Home dan Featured Works
- `/about` — Profil, skill, pengalaman/organisasi dari API
- `/portfolio/3d-art` — Galeri 3D, filter, detail/lightbox
- `/portfolio/filmmaking` — Galeri film/video dengan embed YouTube/Vimeo
- `/portfolio/photography` — Grid fotografi, filter, dan detail lightbox
- `/furokidz` — Profil Furokidz dan konten unggulan dari API
- `/contact` — Kontak, salin email, form inquiry, unduh CV PDF
- URL lain — halaman 404 dengan tautan kembali ke Home

Semua halaman publik memakai tema terang/gelap dengan preferensi sistem dan penyimpanan pilihan pengguna. Isi proyek, pengalaman, dan konten Furokidz harus berasal dari data milik pemilik situs; tidak ada karya contoh fiktif yang ditambahkan.

## Menjalankan lokal

1. Install Node.js versi LTS.
2. Buat database PostgreSQL dan periksa terlebih dahulu apakah tabel dari proyek sebelumnya sudah tersedia.
3. Jika database baru, jalankan `server/schema.sql` di database target. Jangan menjalankannya ke database berisi data tanpa meninjau migrasi terlebih dahulu.
4. Salin `server/.env.example` menjadi `server/.env`, lalu isi `DATABASE_URL` atau variabel `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` yang diperlukan.
5. Di folder `server`, jalankan `npm install`, lalu `npm run dev`.
6. Di root proyek, salin `.env.example` menjadi `.env` dan jalankan `npm install`, lalu `npm run dev`.
7. Buka URL Vite yang ditampilkan terminal. API lokal secara default berada di `http://localhost:5000/api`.

## Environment variables

Frontend (`.env` di root):

```env
VITE_API_URL=http://localhost:5000/api
```

Backend (`server/.env`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
NODE_ENV=development
DATABASE_SSL=true
```

`FRONTEND_ORIGIN` menerima beberapa origin dipisahkan koma, misalnya origin localhost dan domain frontend production. Jangan commit `.env`, kredensial, atau API key. `DATABASE_URL` hanya berada di server.

## Konten dinamis

- `projects`: `main_category` harus konsisten memakai `3d_art`, `filmmaking`, atau `photography`; `sub_category` dipakai untuk filter galeri. Gunakan URL Cloudinary untuk gambar/render, serta URL YouTube/Vimeo untuk `video_embed_url`.
- `experiences`: pengalaman kerja dan organisasi yang benar-benar ingin dipublikasikan.
- `furokidz_highlights`: konten unggulan dengan tautan, platform, thumbnail, dan views bila tersedia.
- `contact_messages`: pesan valid dari formulir Contact.
- `cv_download_logs`: log unduhan CV.

Tabel kosong akan menghasilkan tampilan kosong yang informatif, bukan data contoh. Periksa judul, deskripsi, peran, URL, dan angka sebelum publikasi.

## Endpoint backend

- `GET /api/health`
- `GET /api/projects?category=&sub=&featured=`
- `GET /api/projects/:slug`
- `GET /api/about`
- `GET /api/furokidz`
- `POST /api/contact`
- `GET /api/cv/download`

## Pengujian dan rilis

- Frontend build: `npm run build`
- Frontend lint: `npm run lint`
- Backend dijalankan dari folder `server` dengan `npm run dev` atau `npm start`.
- Uji health check, form kontak, unduhan CV, navigasi langsung ke semua rute, kedua tema, serta viewport 360, 768, dan 1440 px sebelum rilis.
- Deploy frontend sebagai project Vercel dari root repository; `vercel.json` menyediakan fallback SPA untuk rute React.
- Backend dapat dijalankan sebagai service Node/Express terpisah atau disesuaikan untuk runtime serverless. Bila backend di-deploy sebagai project Vercel terpisah, set project root ke folder `server` dan verifikasi routing API pada deployment preview sebelum production.
- Atur `VITE_API_URL` di hosting frontend dan `DATABASE_URL` serta `FRONTEND_ORIGIN` di hosting backend. Pastikan domain frontend termasuk di CORS.
- CV yang diunduh berasal dari `server/public/cv.pdf`; ganti dengan CV terbaru yang memang akan dipublikasikan.

## Catatan batasan MVP

PRD tidak memasukkan dashboard admin/CMS, login pengunjung, komentar, like, maupun workflow upload Cloudinary dari website. Konten saat ini dikelola melalui PostgreSQL dan URL aset. Metrik Furokidz bukan data real-time kecuali integrasi sinkronisasi ditambahkan.
