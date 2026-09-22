// Klien Ollama Cloud (https://ollama.com)
// Primery: API native  POST /api/chat
// Fallback: kompatibel OpenAI  POST /v1/chat/completions

export const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'https://ollama.com').replace(/\/+$/, '');
export const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gpt-oss:120b';

const REQUEST_TIMEOUT_MS = 50_000;

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  };
}

async function callNative(model, messages) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, messages, stream: false }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama /api/chat HTTP ${res.status}: ${text.slice(0, 250)}`);
  }
  const json = await res.json();
  return json?.message?.content || '';
}

async function callOpenAI(model, messages) {
  const res = await fetch(`${OLLAMA_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ model, messages }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Ollama /v1 HTTP ${res.status}: ${text.slice(0, 250)}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content || '';
}

export async function ollamaChat({ model, messages }) {
  if (!process.env.OLLAMA_API_KEY) {
    throw new Error('OLLAMA_API_KEY belum diset di environment variables.');
  }
  try {
    const content = await callNative(model, messages);
    if (content) return content;
    throw new Error('Respon Ollama native kosong');
  } catch (firstError) {
    try {
      const content = await callOpenAI(model, messages);
      if (content) return content;
      throw new Error('Respon Ollama /v1 kosong');
    } catch {
      throw firstError;
    }
  }
}
