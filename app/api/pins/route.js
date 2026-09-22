import { NextResponse } from 'next/server';
import { getTopicPinsSafe } from '@/lib/pinterest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

// GET /api/pins?topic=home-decor[&refresh=1]
export async function GET(request) {
  const url = new URL(request.url);
  const topic = (url.searchParams.get('topic') || '').toLowerCase();
  if (!SLUG_RE.test(topic)) {
    return NextResponse.json({ error: 'Topik tidak valid' }, { status: 400 });
  }
  const refresh = url.searchParams.get('refresh') === '1';
  const result = await getTopicPinsSafe(topic, { refresh });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, topic, pins: [] },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, ...result });
}
