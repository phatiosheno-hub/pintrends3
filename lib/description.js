// Generator deskripsi topik (judul, meta description, intro) oleh Ollama Cloud.
// Hasil di-cache 24 jam. Kalau AI gagal, pakai fallback template (tanpa error).

import { ollamaChat, DEFAULT_MODEL } from './ollama';

const DESC_TTL = 24 * 60 * 60 * 1000; // 24 jam
const FALLBACK_TTL = 10 * 60 * 1000; // fallback di-cache 10 menit
const cache = globalThis.__descCache || (globalThis.__descCache = new Map());

function cacheGet(key) {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < e.ttl) return e.value;
  return null;
}
function cacheSet(key, value, ttl) {
  cache.set(key, { ts: Date.now(), ttl, value });
  if (cache.size > 400) cache.delete(cache.keys().next().value);
}

export function titleCase(s) {
  return String(s)
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// Fallback tanpa AI (agar halaman tetap hidup)
export function fallbackDescription(topic) {
  const nice = titleCase(topic);
  return {
    title: `${nice} — Galeri & Inspirasi | PinTrend`,
    metaDescription: `Jelajahi kumpulan gambar ${nice} terbaik: ide, referensi, dan inspirasi visual yang dapat kamu simpan atau bagikan.`,
    intro: `Selamat datang di galeri ${nice}. Kumpulan gambar di halaman ini dikurasi secara otomatis dari Pinterest berdasarkan kata kunci "${nice}", diperbarui berkala agar selalu relevan.\n\nSimpan ide favoritmu, gunakan sebagai referensi desain, atau bagikan ke teman. Kalau kamu ingin melihat topik lain, ketik nama topiknya di kolom pencarian di halaman utama.`,
    model: 'fallback',
  };
}

// Ambil objek JSON dari teks model (toleran terhadap ```json fence dan teks tambahan)
function extractJson(text) {
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return null;
  }
}

function validDesc(d) {
  return (
    d &&
    typeof d.title === 'string' && d.title.length >= 10 &&
    typeof d.metaDescription === 'string' && d.metaDescription.length >= 40 &&
    typeof d.intro === 'string' && d.intro.length >= 100
  );
}

// Urutan model: default (env) dulu, lalu model cepat sebagai cadangan
const MODEL_CHAIN = Array.from(new Set([DEFAULT_MODEL, 'nemotron-3-nano:30b']));

export async function getTopicDescription(topic, { refresh = false } = {}) {
  const key = `desc:${topic}`;
  if (!refresh) {
    const hit = cacheGet(key);
    if (hit) return hit;
  }

  const prompt = `Kamu adalah penulis konten web SEO berbahasa Indonesia yang profesional dan natural.
Topik galeri gambar: "${topic}"

Tugasmu: buat konten halaman galeri inspirasi untuk topik tersebut.
Balas HANYA dengan JSON valid (tanpa markdown, tanpa tanda pagar, tanpa teks di luar JSON) dengan struktur:
{
  "title": "Judul halaman yang menarik dan mengandung kata kunci, maksimal 60 karakter",
  "metaDescription": "Deskripsi meta untuk Google, maksimal 150 karakter, menggoda dan mengandung kata kunci",
  "intro": "Dua paragraf pemisah dengan \\n\\n, total 90-140 kata. Paragraf 1: apa isi galeri ini dan kenapa menarik. Paragraf 2: tips singkat menggunakan ide/gambar di galeri plus ajakan melihat topik lain. Nada hangat, informatif, tidak berlebihan."
}`;

  let lastError = null;
  for (const model of MODEL_CHAIN) {
    try {
      const raw = await ollamaChat({
        model,
        messages: [{ role: 'user', content: prompt }],
      });
      const parsed = extractJson(raw);
      if (validDesc(parsed)) {
        const result = {
          topic,
          title: parsed.title.slice(0, 110),
          metaDescription: parsed.metaDescription.slice(0, 180),
          intro: parsed.intro,
          model,
          generatedAt: new Date().toISOString(),
        };
        cacheSet(key, result, DESC_TTL);
        return result;
      }
      lastError = new Error('Respon AI bukan JSON valid');
    } catch (e) {
      lastError = e;
    }
  }

  // Semua model gagal -> fallback template
  const fb = fallbackDescription(topic);
  cacheSet(key, fb, FALLBACK_TTL);
  if (process.env.DEBUG) console.error('[description] AI gagal:', String(lastError?.message || lastError));
  return fb;
}
