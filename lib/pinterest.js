// Port JavaScript dari pinscrape v2 (https://github.com/iamatulsingh/pinscrape)
// Menggunakan endpoint internal Pinterest "BaseSearchResource".
// Dua host dicoba berurutan (www lebih cepat, in sebagai backup).

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0';

const HOSTS = ['www.pinterest.com', 'in.pinterest.com'];
const PIN_TTL = 30 * 60 * 1000; // cache 30 menit
const NEGATIVE_TTL = 2 * 60 * 1000; // hasil gagal di-cache 2 menit (jangan spam Pinterest)

const cache = globalThis.__pinTrendCache || (globalThis.__pinTrendCache = new Map());

function cacheGet(key) {
  const e = cache.get(key);
  if (e && Date.now() - e.ts < e.ttl) return e.value;
  return null;
}
function cacheSet(key, value, ttl) {
  cache.set(key, { ts: Date.now(), ttl, value });
  if (cache.size > 400) cache.delete(cache.keys().next().value);
}

function baseHeaders(host) {
  return {
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Ch-Ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'Sec-Ch-Ua-Model': '""',
    'Sec-Ch-Ua-Mobile': '?0',
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json, text/javascript, */*, q=0.01',
    'X-Pinterest-Source-Url': '',
    'X-Pinterest-Appstate': 'active',
    'Accept-Language': 'en-US,en;q=0.9',
    'Screen-Dpr': '1',
    'X-Pinterest-Pws-Handler': 'www/search/[scope].js',
    'User-Agent': UA,
    'Sec-Ch-Ua-Platform-Version': '""',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    Referer: `https://${host}/`,
    Priority: 'u=1, i',
  };
}

// Inti scraper — setelan persis seperti pinscrape v2
async function searchPinsOnHost(host, query, pageSize) {
  const base = `https://${host}`;
  const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;

  // 1) Warm-up request (kritis — tanpa ini Pinterest sering menolak)
  await fetch(`${base}${sourceUrl}`, {
    headers: baseHeaders(host),
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });

  // 2) Payload pencarian (kompak, tanpa spasi — sama dengan pinscrape)
  const payload = {
    options: {
      applied_unified_filters: null,
      appliedProductFilters: '---',
      article: null,
      auto_correction_disabled: false,
      corpus: null,
      customized_rerank_type: null,
      domains: null,
      filters: null,
      journey_depth: null,
      page_size: String(pageSize),
      price_max: null,
      price_min: null,
      query_pin_sigs: null,
      query: encodeURIComponent(query),
      redux_normalize_feed: true,
      request_params: null,
      rs: 'typed',
      scope: 'pins',
      selected_one_bar_modules: null,
      source_id: null,
      source_module_id: null,
      seoDrawerEnabled: false,
      source_url: encodeURIComponent(sourceUrl),
      top_pin_id: null,
      top_pin_ids: null,
    },
    context: {},
  };

  // 3) Panggil BaseSearchResource
  const url =
    `${base}/resource/BaseSearchResource/get/` +
    `?source_url=${encodeURIComponent(sourceUrl)}` +
    `&data=${encodeURIComponent(JSON.stringify(payload))}` +
    `&_=${Date.now()}`;
  const headers = { ...baseHeaders(host), 'X-Pinterest-Source-Url': sourceUrl };

  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (res.status !== 200) throw new Error(`Pinterest ${host}: HTTP ${res.status}`);

  const json = await res.json();
  const results = json?.resource_response?.data?.results || [];
  const pins = [];
  const seen = new Set();
  for (const r of results) {
    const urlImg = r?.images?.orig?.url;
    if (!urlImg || !r?.id) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    pins.push({
      id: String(r.id),
      url: String(urlImg),
      title: r.title ? String(r.title) : '',
    });
  }
  return pins;
}

export async function searchPins(query, pageSize = 50) {
  let lastError;
  for (const host of HOSTS) {
    try {
      const pins = await searchPinsOnHost(host, query, pageSize);
      if (pins.length > 0) return pins;
      lastError = new Error(`Pinterest ${host}: hasil kosong`);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error('Pinterest: tidak dapat mencari gambar');
}

// Pembungkus dengan cache (dipakai halaman + API)
export async function getTopicPins(topic, { refresh = false } = {}) {
  const key = `pins:${topic}`;
  if (!refresh) {
    const hit = cacheGet(key);
    if (hit) return hit;
  }
  const pins = await searchPins(topic);
  const result = { topic, pins, fetchedAt: new Date().toISOString() };
  cacheSet(key, result, PIN_TTL);
  return result;
}

export async function getTopicPinsSafe(topic, { refresh = false } = {}) {
  const key = `pins:${topic}`;
  if (!refresh) {
    const hit = cacheGet(key);
    if (hit) return { ok: true, ...hit };
  }
  try {
    const result = await getTopicPins(topic, { refresh });
    return { ok: true, ...result };
  } catch (e) {
    cacheSet(key, { error: String(e.message || e) }, NEGATIVE_TTL);
    return { ok: false, error: String(e.message || e), topic, pins: [] };
  }
}
