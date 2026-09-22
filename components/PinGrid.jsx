'use client';

import { useEffect, useState } from 'react';
import PinChat from '@/components/PinChat';

// Link iklan direct: dibuka di TAB BARU setiap gambar diklik,
// lalu di tab ini muncul popup chat interaktif (Download, cari yang mirip, dll).
const AD_URL =
  'https://www.profitableratecpmnetwork.com/i0byk4hfg?key=cc96319c243e4fd2bf9070bfc52eefb9';

// Grid masonry Pinterest-style. Klik tile -> buka iklan + tampilkan modal aksi.
export default function PinGrid({ pins, topic }) {
  const [broken, setBroken] = useState(() => new Set());
  const [selected, setSelected] = useState(null);

  // Tutup modal dengan tombol Escape
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // Kunci scroll halaman saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selected]);

  if (!pins || pins.length === 0) return null;

  function handleTileClick(pin) {
    // 1) Iklan dibuka di tab baru (monetisasi)
    window.open(AD_URL, '_blank', 'noopener');
    // 2) Popup pilihan muncul di tab ini
    setSelected(pin);
  }

  return (
    <>
      <div className="masonry">
        {pins.map((p) => {
          if (broken.has(p.id)) return null;
          return (
            <button
              key={p.id}
              type="button"
              className="tile"
              onClick={() => handleTileClick(p)}
              title={p.title || topic}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.title || `Gambar ${topic}`}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setBroken((prev) => new Set(prev).add(p.id))}
              />
              {p.title && (
                <span className="overlay">
                  <span className="t-title">{p.title}</span>
                </span>
              )}
              <span className="t-pin">Lihat</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal modal-chat"
            role="dialog"
            aria-modal="true"
            aria-label="Chat asisten PinTrend"
            onClick={(e) => e.stopPropagation()}
          >
            <PinChat pin={selected} topic={topic} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </>
  );
}
