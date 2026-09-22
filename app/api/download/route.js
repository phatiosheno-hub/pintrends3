import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB anti penyalahgunaan bandwidth

// Hanya gambar dari CDN Pinterest (*.pinimg.com via https) yang boleh di-proxy.
// Tanpa whitelist ini endpoint bisa dipakai sebagai open proxy.
function isAllowedImageUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    return h === 'pinimg.com' || h.endsWith('.pinimg.com');
  } catch {
    return false;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const name = (searchParams.get('name') || 'pintrend.jpg')
    .replace(/[^\w.-]+/g, '_')
    .slice(0, 80);

  if (!isAllowedImageUrl(url)) {
    return NextResponse.json({ error: 'URL tidak diizinkan' }, { status: 400 });
  }

  let upstream;
  try {
    upstream = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
        Referer: 'https://www.pinterest.com/',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil gambar' }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'Gambar tidak ditemukan' }, { status: 502 });
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Konten bukan gambar' }, { status: 400 });
  }

  const len = Number(upstream.headers.get('content-length') || 0);
  if (len > MAX_BYTES) {
    return NextResponse.json({ error: 'File terlalu besar' }, { status: 413 });
  }

  // Batasi aliran saat server tidak mengirim content-length valid
  let counted = 0;
  const limiter = new TransformStream({
    transform(chunk, controller) {
      counted += chunk.byteLength;
      if (counted > MAX_BYTES) {
        controller.error(new Error('File terlalu besar'));
        return;
      }
      controller.enqueue(chunk);
    },
  });

  return new Response(upstream.body.pipeThrough(limiter), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${name}"`,
      ...(len ? { 'Content-Length': String(len) } : {}),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
