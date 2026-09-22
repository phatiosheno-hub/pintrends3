import TopicSearch from '@/components/TopicSearch';

// Topik populer (kartu statis — ringan, tanpa fetch gambar)
const TOPICS = [
  { slug: 'home-decor', name: 'Home Decor', emoji: '🛋️', g: 'linear-gradient(135deg,#f6d365,#fda085)' },
  { slug: 'interior-design', name: 'Interior Design', emoji: '🏠', g: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)' },
  { slug: 'wall-art', name: 'Wall Art', emoji: '🖼️', g: 'linear-gradient(135deg,#d4a5ff,#f68fbc)' },
  { slug: 'bedroom-ideas', name: 'Bedroom Ideas', emoji: '🛏️', g: 'linear-gradient(135deg,#ffd1ff,#b3b5d0)' },
  { slug: 'kitchen-ideas', name: 'Kitchen Ideas', emoji: '🍳', g: 'linear-gradient(135deg,#ffecd2,#fcb69f)' },
  { slug: 'garden-design', name: 'Garden Design', emoji: '🌿', g: 'linear-gradient(135deg,#d4fc79,#96e6a1)' },
  { slug: 'wedding-ideas', name: 'Wedding Ideas', emoji: '💍', g: 'linear-gradient(135deg,#fbc2eb,#a6c1ee)' },
  { slug: 'fashion-outfit', name: 'Fashion Outfit', emoji: '👗', g: 'linear-gradient(135deg,#89f7fe,#66a6ff)' },
  { slug: 'street-style', name: 'Street Style', emoji: '🧢', g: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { slug: 'beauty-makeup', name: 'Beauty & Makeup', emoji: '💄', g: 'linear-gradient(135deg,#fda085,#f6d365)' },
  { slug: 'fitness-workout', name: 'Fitness Workout', emoji: '💪', g: 'linear-gradient(135deg,#43e97b,#38f9d7)' },
  { slug: 'healthy-recipes', name: 'Healthy Recipes', emoji: '🥗', g: 'linear-gradient(135deg,#96fbc4,#f9f586)' },
  { slug: 'travel-destination', name: 'Travel Destination', emoji: '✈️', g: 'linear-gradient(135deg,#5ee7df,#b490ca)' },
  { slug: 'nature-photography', name: 'Nature Photography', emoji: '🏔️', g: 'linear-gradient(135deg,#c1dfc4,#deecdd)' },
  { slug: 'car-modification', name: 'Car Modification', emoji: '🚗', g: 'linear-gradient(135deg,#ff8177,#b12a5b)' },
  { slug: 'office-desk-setup', name: 'Desk Setup', emoji: '🖥️', g: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { slug: 'logo-design', name: 'Logo Design', emoji: '✏️', g: 'linear-gradient(135deg,#fccb90,#d57eeb)' },
  { slug: 'cat-photos', name: 'Cat Photos', emoji: '🐱', g: 'linear-gradient(135deg,#ff9a9e,#fecfef)' },
];

export default function Home() {
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
            <a href="#topik">Topik Populer</a>
            <a href="#cara">Cara Kerja</a>
          </nav>
        </div>
      </div>

      <div className="wrap">
        <section className="hero">
          <h1>
            Temukan inspirasi gambar <span className="accent">tanpa batas</span>
          </h1>
          <p>
            Ribuan gambar pilihan langsung dari Pinterest, tersaji seperti website. Setiap topik
            lengkap dengan deskripsi yang diolah AI agar enak dibaca dan mudah ditemukan di Google.
          </p>
          <TopicSearch />
        </section>

        <section className="section" id="topik">
          <div className="section-head">
            <h2>🔥 Topik Populer</h2>
            <span className="hint">klik untuk membuka galeri</span>
          </div>
          <div className="topic-grid">
            {TOPICS.map((t) => (
              <a
                key={t.slug}
                className="topic-card"
                href={`/${t.slug}`}
                style={{ background: t.g }}
              >
                <span className="emoji">{t.emoji}</span>
                <span className="name">{t.name}</span>
                <span className="go">Lihat galeri →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="section" id="cara">
          <div className="section-head">
            <h2>⚙️ Cara Kerja</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="n">1</div>
              <h3>Ketik topik apa pun</h3>
              <p>
                Mau lihat gambar “ramen tokoyo” atau “tembok estetik”? Ketik saja — setiap kata kunci
                langsung menjadi halaman galeri sendiri.
              </p>
            </div>
            <div className="step">
              <div className="n">2</div>
              <h3>Gambar dimuat otomatis</h3>
              <p>
                Sistem mengambil gambar terbaik dari Pinterest secara real-time (dengan cache 30
                menit agar cepat dibuka ulang), lalu ditampilkan dalam grid ala Pinterest.
              </p>
            </div>
            <div className="step">
              <div className="n">3</div>
              <h3>Deskripsi diolah AI</h3>
              <p>
                Judul, meta description, dan pengantar halaman dibuat otomatis oleh AI (Ollama Cloud)
                dalam bahasa Indonesia — siap untuk SEO dan enak dibaca.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
