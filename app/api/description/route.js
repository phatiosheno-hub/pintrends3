import { NextResponse } from 'next/server';
import { getTopicDescription } from '@/lib/description';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,59}$/;

// GET /api/description?topic=home-decor[&refresh=1]
export async function GET(request) {
  const url = new URL(request.url);
  const topic = (url.searchParams.get('topic') || '').toLowerCase();
  if (!SLUG_RE.test(topic)) {
    return NextResponse.json({ error: 'Topik tidak valid' }, { status: 400 });
  }
  const refresh = url.searchParams.get('refresh') === '1';
  const desc = await getTopicDescription(topic, { refresh });
  return NextResponse.json(desc);
}
