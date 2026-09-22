'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function TopicSearch({ compact = false }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(e) {
    e.preventDefault();
    const slug = slugify(value);
    if (slug.length >= 2) router.push(`/${slug}`);
  }

  return (
    <>
      <form className="searchbox" onSubmit={submit}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ketik topik apa saja… mis. home decor, wedding, fashion"
          aria-label="Cari topik"
        />
        <button type="submit">Cari</button>
      </form>
      {!compact && (
        <div className="search-hint">
          Setiap topik langsung menjadi halaman: <code>/home-decor</code>, <code>/wallpaper</code>,{' '}
          <code>/resep-masakan</code> — tanpa perlu admin panel.
        </div>
      )}
    </>
  );
}
