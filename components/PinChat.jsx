'use client';

import { useEffect, useRef, useState } from 'react';

// Link iklan direct — juga tampil sebagai kartu "Sponsored" di sela obrolan.
const AD_URL =
  'https://www.profitableratecpmnetwork.com/i0byk4hfg?key=cc96319c243e4fd2bf9070bfc52eefb9';

// Persona asisten yang menemani pengunjung (silakan ganti nama/avatar sesuai selera)
const PERSONA = {
  name: 'Rani',
  emoji: '👩🏻‍💼',
  avatar: '/rani-avatar.png',
};

const POPULAR = [
  'Wallpaper Aesthetic',
  'Home Decor',
  'Wedding Ideas',
  'Nail Art',
  'Kitchen Design',
  'Tattoo Ideas',
];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

let idSeq = 0;
const nid = () => ++idSeq;

function Avatar() {
  const [broken, setBroken] = useState(false);
  if (broken) return <span className="avatar avatar-emoji">{PERSONA.emoji}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      className="avatar"
      src={PERSONA.avatar}
      alt={PERSONA.name}
      onError={() => setBroken(true)}
    />
  );
}

// Popup chat interaktif: asisten cewek yang menyapa pengunjung, menanyakan apa
// yang dicari, menemani ngobrol, dan menyelipkan kartu sponsor di sela obrolan.
export default function PinChat({ pin, topic, onClose }) {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState('');
  const [chips, setChips] = useState([]);
  const awaitingKeyword = useRef(false);
  const userMsgs = useRef(0);
  const timers = useRef([]);
  const scrollRef = useRef(null);

  const topicLabel = topic.replace(/-/g, ' ');

  // bersihkan timer saat komponen dilepas
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // auto-scroll ke pesan terbaru
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function schedule(fn, ms) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  const push = (list) => setMessages((prev) => [...prev, ...list]);
  const botMsg = (text) => ({ id: nid(), from: 'bot', text });
  const adMsg = () => ({ id: nid(), type: 'ad' });
  const imgMsg = () => ({ id: nid(), type: 'img', url: pin?.url, alt: topicLabel });

  // Sisipkan kartu sponsor setiap 2 interaksi pengunjung
  function withAd(items) {
    return userMsgs.current % 2 === 0 ? [...items, adMsg()] : items;
  }

  function botSay(items, { chips: nextChips, delay = 750 } = {}) {
    setTyping(true);
    schedule(() => {
      setTyping(false);
      push(items.map((i) => (typeof i === 'string' ? botMsg(i) : i)));
      if (nextChips !== undefined) setChips(nextChips);
    }, delay);
  }

  // ---------- aksi utama ----------

  function handleDownload() {
    if (pin?.url) {
      const a = document.createElement('a');
      a.href = `/api/download?url=${encodeURIComponent(pin.url)}&name=${encodeURIComponent(
        `pintrend-${topic}-${pin.id}.jpg`,
      )}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    botSay(
      withAd([
        'Siap! Downloadnya sudah aku mulai ya 📥 coba cek folder Downloads kamu~',
        'Itu resolusi aslinya lho, tajam banget. Sekalian mau aku carikan desain yang senada?',
      ]),
      {
        chips: [
          { label: '🔍 Iya, carikan yang mirip', act: askKeyword },
          { label: '↗ Buka pin aslinya', act: openPin },
          { label: '💡 Topik lainnya dong', act: suggestTopics },
        ],
      },
    );
  }

  function openPin() {
    if (pin?.id) {
      window.open(`https://www.pinterest.com/pin/${pin.id}/`, '_blank', 'noopener');
    }
    botSay(
      withAd([
        'Udah aku bukain di tab baru ya ↗',
        'Di sana kamu bisa save ke board Pinterest kamu. Nanti balik lagi ke sini ya~ 💖',
      ]),
    );
  }

  function askKeyword() {
    awaitingKeyword.current = true;
    botSay(
      [
        'Siaaap 🔎 kamu pengennya yang kayak gimana?',
        `Tulis aja kata kuncinya, misal “warna pastel”, “minimalis”, “boho”, atau “ruang kecil”… nanti langsung aku carikan!`,
      ],
      {
        chips: [
          { label: '🎨 Warna pastel', act: () => goSearch(`${topicLabel} warna pastel`) },
          { label: '🤍 Minimalis', act: () => goSearch(`${topicLabel} minimalis`) },
          { label: '✨ Aesthetic', act: () => goSearch(`${topicLabel} aesthetic`) },
          { label: '🏙️ Modern', act: () => goSearch(`${topicLabel} modern`) },
        ],
      },
    );
  }

  function goSearch(query) {
    const slug = slugify(query) || topic;
    botSay(
      withAd([
        `Oke! aku carikan “${query}” ya, sebentar… ✨`,
        'Ketemu! Yuk meluncur 🚀',
      ]),
      { chips: [] },
    );
    schedule(() => window.location.assign(`/${slug}`), 1500);
  }

  function suggestTopics() {
    botSay(
      [
        'Nih, beberapa topik yang lagi hits 🔥 klik aja salah satunya…',
        '…atau ketik sendiri topik yang kamu mau di kolom bawah, aku carikan!',
      ],
      { chips: POPULAR.map((t) => ({ label: t, act: () => goSearch(t) })) },
    );
  }

  const MAIN_CHIPS = [
    { label: '⬇ Download gambar ini', act: handleDownload },
    { label: '🔍 Cariin yang mirip dong', act: askKeyword },
    { label: '↗ Buka pin aslinya', act: openPin },
    { label: '💡 Rekomendasi topik lain', act: suggestTopics },
  ];

  // ---------- sapaan pembuka saat popup dibuka ----------
  useEffect(() => {
    botSay(
      [
        `Halooo 👋 kenalin, aku ${PERSONA.name}~ biar nggak bosen scrolling sendirian, aku temenin ya 💖`,
        imgMsg(),
        'Wah, yang ini kamu klik ya? Pilihan yang bagus banget! ✨',
        adMsg(),
        `Eh iya, kamu lagi cari inspirasi ${topicLabel} buat apa nih? Aku bisa bantu download gambarnya, carikan desain yang mirip, atau nemenin ngobrol dulu juga boleh kok 😊`,
      ],
      { chips: MAIN_CHIPS, delay: 900 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- otak balasan sederhana ----------

  function respond(raw) {
    const text = raw.toLowerCase();

    if (awaitingKeyword.current) {
      if (/(batal|nggak jadi|gak jadi|cancel)/.test(text)) {
        awaitingKeyword.current = false;
        return botSay(['Oke, nggak jadi ya~ terus aku bisa bantu apa lagi nih? 😊'], {
          chips: MAIN_CHIPS,
        });
      }
      awaitingKeyword.current = false;
      return goSearch(`${topicLabel} ${raw}`);
    }

    if (/(download|unduh|simpan|save)/.test(text)) return handleDownload();
    if (/(pin asli|pinterest|lanjut|halaman asli|sumber)/.test(text)) return openPin();
    if (/(mirip|serupa|sejenis|senada|kayak gini|model lain|yang lain|cari)/.test(text))
      return askKeyword();
    if (/(topik|rekomendasi|saran|ide|lagi hits|populer|hits)/.test(text))
      return suggestTopics();
    if (/(makasih|terima kasih|thanks|thank|tengkyu|tks|mksh)/.test(text))
      return botSay(
        withAd([
          'Sama-samaa 😘 seneng banget bisa bantu!',
          'Kalau nanti butuh inspirasi lagi, panggil aku aja ya~',
        ]),
      );
    if (/^(\p{Emoji}|hai|halo|hallo|hi|hei|hey|p)(\s|!|😁|😊|😄|$)/iu.test(raw.trim()))
      return botSay(['Haii jugaaa 😍 ada yang bisa aku bantu? Klik tombol di bawah atau ngobrol santai aja~'], {
        chips: MAIN_CHIPS,
      });
    if (/(cantik|manis|imut|lucu|baik banget|baik)/.test(text))
      return botSay(
        withAd([
          'Awww ih, kamu bisa aja 😳👉👈 makasih yaa~',
          'Kamu juga baik banget udah mampir! Ada lagi yang mau dicari?',
        ]),
        { chips: MAIN_CHIPS },
      );
    if (/(siapa|nama kamu|kamu siapa)/.test(text))
      return botSay(
        [
          `Aku ${PERSONA.name}, asisten pribadi kamu di PinTrend 👩🏻‍💼✨`,
          'Tugasku nemenin kamu cari inspirasi gambar terbaik. Mau cari apa hari ini?',
        ],
        { chips: MAIN_CHIPS },
      );
    if (/(bosen|bosan|gabut|bingung)/.test(text))
      return botSay(
        withAd([
          'Lagi bosen ya? Pas banget, scrolling inspirasi di sini dijamin lupa waktu 🤭',
          'Coba lirik topik-topik ini, banyak yang lagi hits lho~',
        ]),
        { chips: POPULAR.slice(0, 4).map((t) => ({ label: t, act: () => goSearch(t) })) },
      );

    // fallback ramah
    botSay(
      withAd([
        'Hmm menarik 🤔 tapi aku paling jago soal gambar & inspirasi nih!',
        `Coba ketik suasana yang kamu mau, misal “${topicLabel} warna pastel”, atau pilih tombol ini ya 👇`,
      ]),
      { chips: MAIN_CHIPS },
    );
  }

  function sendUser(raw) {
    const text = raw.trim();
    if (!text) return;
    setInput('');
    setChips([]);
    userMsgs.current += 1;
    push([{ id: nid(), from: 'user', text }]);
    respond(text);
  }

  function chipClick(chip) {
    setChips([]);
    userMsgs.current += 1;
    push([{ id: nid(), from: 'user', text: chip.label }]);
    chip.act();
  }

  // ---------- tampilan ----------

  return (
    <div className="pinchat">
      <div className="chat-header">
        <Avatar />
        <div className="chat-id">
          <b>
            {PERSONA.name} {PERSONA.emoji}
          </b>
          <span className="chat-status">
            <i className="dot" /> Online · siap nemenin
          </span>
        </div>
        <button type="button" className="chat-close" onClick={onClose} aria-label="Tutup">
          ×
        </button>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m) => {
          if (m.type === 'ad')
            return (
              <a
                key={m.id}
                className="msg-ad"
                href={AD_URL}
                target="_blank"
                rel="sponsored noopener"
              >
                <span className="msg-ad-label">Sponsored</span>
                <span className="msg-ad-text">
                  ✨ Penawaran spesial buat kamu — cek di sini yuk 🎁
                </span>
              </a>
            );
          if (m.type === 'img')
            return (
              <div key={m.id} className="msg-row bot">
                <div className="bubble bubble-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt} referrerPolicy="no-referrer" />
                </div>
              </div>
            );
          return (
            <div key={m.id} className={`msg-row ${m.from}`}>
              <div className="bubble">{m.text}</div>
            </div>
          );
        })}
        {typing && (
          <div className="msg-row bot">
            <div className="bubble typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="chat-chips">
          {chips.map((c, i) => (
            <button key={i} type="button" className="chip" onClick={() => chipClick(c)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          sendUser(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Balas ${PERSONA.name}…`}
          autoFocus
        />
        <button type="submit" aria-label="Kirim">
          ➤
        </button>
      </form>
    </div>
  );
}
