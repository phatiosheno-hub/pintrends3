import { notFound } from 'next/navigation';
import PinGrid from '@/components/PinGrid';
import RefreshButton from '@/components/RefreshButton';
import { getTopicPinsSafe } from '@/lib/pinterest';
import { getTopicDescription } from '@/lib/description';
import { titleCase } from '@/lib/description';

export const dynamic = 'force-dynamic';
// Halaman ini memanggil Pinterest + Ollama Cloud saat render (butuh waktu saat cache dingin)
export const maxDuration = 60;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_RE.test(slug) && !slug.startsWith('api');
}

export async function generateMetadata({ params }) {
  const { topic } = await params;
  if (!isValidSlug(topic)) return {};
  try {
    const desc = await getTopicDescription(topic);
    return {
      title: desc.title,
      description: desc.metaDescription,
      openGraph: {
        title: desc.title,
        description: desc.metaDescription,
        type: 'website',
      },
    };
  } catch {
    return {
      title: `${titleCase(topic)} — Galeri & Inspirasi`,
      description: `Kumpulan gambar ${titleCase(topic)} terbaik.`,
    };
  }
}

export default async function TopicPage({ params, searchParams }) {
  const { topic } = await params;
  if (!isValidSlug(topic)) notFound();

  const sp = await searchParams;
  const refresh = sp?.refresh === '1';

  // Ambil gambar + deskripsi paralel; keduanya punya fallback sehingga
  // halaman tetap bisa dirender meskipun salah satu sumber bermasalah.
  const [pinResult, desc] = await Promise.all([
    getTopicPinsSafe(topic, { refresh }),
    getTopicDescription(topic, { refresh }).catch(() => null),
  ]);

  const descData = desc || {
    topic,
    title: `${titleCase(topic)} — Galeri & Inspirasi | PinTrend`,
    metaDescription: `Jelajahi kumpulan gambar ${titleCase(topic)} terbaik.`,
    intro: `Kumpulan gambar ${titleCase(topic)} yang dikurasi otomatis dari Pinterest.`,
    model: 'fallback',
  };

  const isAi = descData.model && descData.model !== 'fallback';
  const introParas = String(descData.intro)
    .split(/\n{2,}|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div className="header">
        <div className="header-inner">
          <a href="/" className="logo">
            <span className="mark">📌</span>
            <span>
              Pin<span className="accent">Trend</span>
            </span>
          </a>
          <span className="spacer" />
          <nav>
            <a href="/#topik">Topik Populer</a>
            <a href="/#cara">Cara Kerja</a>
          </nav>
        </div>
      </div>

      <div className="wrap">
        <div className="topic-hero">
          <div className="crumb">
            <a href="/">Beranda</a> / {titleCase(topic)}
          </div>
          <h1>{descData.title.replace(/\s*\|\s*PinTrend\s*$/, '')}</h1>
          <div className="intro">
            {introParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="topic-meta">
            {pinResult.ok ? (
              <span className="pill">
                🖼️ {pinResult.pins.length} gambar · diperbarui{' '}
                {new Date(pinResult.fetchedAt).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ) : (
              <span className="pill">⚠️ gambar sedang tidak tersedia</span>
            )}
            {isAi && <span className="pill ai">✨ deskripsi oleh AI · {descData.model}</span>}
            <RefreshButton topic={topic} />
          </div>
        </div>

        {pinResult.ok ? (
          <PinGrid pins={pinResult.pins} topic={topic} />
        ) : (
          <div className="state">
            <div className="big">🖼️</div>
            <b>Gambar untuk “{titleCase(topic)}” sedang tidak bisa dimuat.</b>
            <br />
            Pinterest mungkin sedang membatasi akses. Coba lagi beberapa menit kemudian.
            <br />
            <a className="btn btn-primary" href={`/${topic}?refresh=1`}>
              Coba Muat Ulang
            </a>
          </div>
        )}
      </div>
    </>
  );
}
