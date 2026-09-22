# 📌 PinTrend — Galeri Inspirasi Gambar ala Pinterest + AI

Website Next.js yang membuat **halaman galeri gambar ala Pinterest** untuk topik apa pun.
Cukup buka URL-nya — misalnya **`pintrend.vercel.app/home-decor`** — maka halaman otomatis
membangun dirinya sendiri:

1. **Gambar** diambil real-time dari Pinterest (metode [pinscrape v2](https://github.com/iamatulsingh/pinscrape), di-port ke JavaScript)
2. **Deskripsi** (judul, meta description, intro) dibuat otomatis oleh **Ollama Cloud** dalam bahasa Indonesia
3. Ditampilkan seperti website normal: grid masonry ala Pinterest + teks deskripsi — SEO friendly

Tidak ada admin panel, tidak ada database: **setiap slug = satu halaman galeri** yang dibuat on-demand dan di-cache.

## ✨ Fitur

- 🔗 **Dynamic topic**: `/{topic}` untuk topik apa pun (`/home-decor`, `/wallpaper`, `/resep-masakan`, …)
- 🖼️ **Pinterest scraper** (port resmi dari pinscrape v2): ~48 gambar per topik, host `www.pinterest.com` + backup `in.pinterest.com`
- ✨ **Deskripsi AI** via Ollama Cloud (model default `gpt-oss:120b`, fallback `nemotron-3-nano:30b`, fallback template)
- 🚀 **Cache pintar**: gambar 30 menit, deskripsi 24 jam (di memori serverless — gratis)
- 🔍 Halaman ber-SEO: `generateMetadata` + SSR penuh
- 🖱️ **Klik gambar = monetisasi**: membuka link iklan direct (tab baru)
- 💬 **Popup chat interaktif “Rani”**: asisten cewek yang menyapa pengunjung, menanyakan apa yang dicari, bisa diajak ngobrol, dan mengarahkan ke topik baru (otomatis jadi halaman SEO baru!) — tombol **Download Gambar** & **Buka pin asli** tetap tersedia
- 🎁 **Kartu "Sponsored"** (link iklan direct) terselip di sela-sela obrolan setiap 2 interaksi
- ⬇️ **Download gambar asli** via `/api/download` (proxy server-side terbatas ke `*.pinimg.com`, maks 25 MB)
- 💰 Iklan **invoke.js** (ProfitableRateCPM Network) terpasang di semua halaman
- 🧱 Tanpa database, tanpa dependensi tambahan

## 🧱 Teknologi

- Next.js 15 (App Router) — siap Vercel
- Pinterest internal API `BaseSearchResource` (pendekatan pinscrape v2)
- Ollama Cloud `https://ollama.com` (`/api/chat` + fallback `/v1/chat/completions`)

## ▶️ Menjalankan Lokal

```bash
npm install
cp .env.example .env.local   # isi OLLAMA_API_KEY
npm run dev                  # http://localhost:3000
```

Buka `http://localhost:3000/home-decor` untuk melihat contoh halaman galeri.

## 🚀 Deploy ke Vercel

1. **Push ke GitHub:**
   ```bash
   cd pintrend
   git init && git add -A && git commit -m "PinTrend"
   git branch -M main
   git remote add origin https://github.com/USERNAME/pintrend.git
   git push -u origin main
   ```
   > `.env.local` (API key asli) tidak ikut ter-commit — sudah di `.gitignore`.
2. **vercel.com/new** → import repo → framework auto-detect **Next.js** → Deploy.
3. Isi **Environment Variables**:

| Nama | Nilai | Wajib? |
|---|---|---|
| `OLLAMA_API_KEY` | API key Ollama Cloud kamu | ✅ Ya (untuk deskripsi AI) |
| `OLLAMA_BASE_URL` | `https://ollama.com` | Tidak (default benar) |
| `OLLAMA_MODEL` | `gpt-oss:120b` | Tidak (default sudah bagus) |

Model **gratis** per akun Ollama Cloud: `gpt-oss:120b`, `nemotron-3-nano:30b`, `nemotron-3-super`, `nemotron-3-ultra`, `gemma4:31b`, `gpt-oss:20b`. Model berbayar (minimax, kimi, glm, dst.) bisa dipakai setelah menambah usage credits.

> Kalau `OLLAMA_API_KEY` tidak diset, website tetap jalan — deskripsi memakai template fallback (tanpa AI).

## 📁 Struktur Penting

```
app/
├── layout.jsx             ← Iklan invoke.js + container dipasang di sini
├── page.jsx               ← Beranda: hero, pencarian, 18 topik populer
├── [topic]/page.jsx       ← HALAMAN GALERI DINAMIS (SSR + generateMetadata)
├── globals.css
└── api/
    ├── pins/route.js      ← GET /api/pins?topic=xxx
    ├── description/route.js ← GET /api/description?topic=xxx
    └── download/route.js  ← GET /api/download?url=…&name=… (proxy download gambar)
components/
├── PinGrid.jsx            ← Grid masonry + klik tile (buka iklan + popup chat)
├── PinChat.jsx            ← Asisten chat “Rani” (ngobrol, download, kartu sponsor)
├── TopicSearch.jsx        ← Kotak pencarian (slug otomatis)
└── RefreshButton.jsx
public/
└── rani-avatar.png        ← Avatar si Rani (ganti sesukamu)
lib/
├── pinterest.js           ← Port pinscrape v2 (warm-up + BaseSearchResource + cache)
├── ollama.js              ← Klien Ollama Cloud
└── description.js         ← Prompt AI + parser JSON + fallback
```

## 🎛️ Kustomisasi

- **Iklan invoke.js** → ganti `src`/`id` pada `<Script>` dan `<div id="container-…">` di `app/layout.jsx`.
- **Link iklan direct** → konstanta `AD_URL` di `components/PinGrid.jsx` (dibuka saat gambar diklik) dan di `components/PinChat.jsx` (kartu “Sponsored” di obrolan).
- **Persona asisten** → `PERSONA` (nama, emoji, avatar) dan naskah obrolan di `components/PinChat.jsx`; avatar fisiknya di `public/rani-avatar.png`.
- **Topik populer beranda** → daftar `TOPICS` di `app/page.jsx` (slug, nama, emoji, warna).
- **Jumlah gambar** → `pageSize` di `lib/pinterest.js` (default 50).
- **Gaya deskripsi AI** → prompt di `lib/description.js`.
- **Durasi & batas** → `maxDuration` di setiap route/page (Hobby Vercel maks 60 detik).

## ⚠️ Catatan Penting

- **Scraping Pinterest**: endpoint internal Pinterest tidak resmi dan bisa berubah kapan pun; sudah ada dual-host + cache + fallback agar website tetap hidup. Gunakan dengan bijak (cache 30 menit menjaga request tetap sedikit).
- **Gambar di-preview in-app sandbox** mungkin tidak muncul (iframe preview tanpa akses internet) — di Vercel semuanya normal.
- **Kredit**: gambar & konten milik Pinterest/pemiliknya; tautan ke pin asli selalu disertakan (hover tile).
- **Keamanan key**: `.env.local` tidak pernah di-commit. Kalau API key pernah dibagikan, regenerasi di dashboard Ollama.
