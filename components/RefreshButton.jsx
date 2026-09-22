'use client';

import { useState } from 'react';

export default function RefreshButton({ topic }) {
  const [loading, setLoading] = useState(false);

  function refresh() {
    setLoading(true);
    // reload dengan flag agar server melewati cache
    window.location.href = `/${topic}?refresh=1`;
  }

  return (
    <button className="btn" onClick={refresh} disabled={loading}>
      {loading ? (
        <>
          <span className="spinner" /> Memuat ulang…
        </>
      ) : (
        '↻ Muat gambar terbaru'
      )}
    </button>
  );
}
