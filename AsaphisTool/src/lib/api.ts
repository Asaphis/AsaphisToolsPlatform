import { Tool } from '@/types';
import { implementedTools } from '@/data/tools';

export function getSiteBaseUrl() {
  // Prefer explicit env var so you can move from Render URL to a custom domain easily.
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  // Fallback to current live Render URL.
  return 'https://asaphistools.onrender.com';
}

export function getApiBase() {
  // Prefer explicit env var.
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Local development: talk to the local backend.
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4000/api/v1';
  }

  // Production fallback: use the deployed Render backend.
  return 'https://asaphistoolsbackend.onrender.com/api/v1';
}

/**
 * Helper to ensure backend fetches don't hang indefinitely during static generation.
 * If the backend is slow or unreachable, we abort after a short timeout so
 * Next.js build can continue and fall back to safe defaults.
 */
async function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function fetchToolsServer(): Promise<Tool[]> {
  const base = getApiBase();
  if (base && base.startsWith('http')) {
    try {
      const res = await fetchWithTimeout(`${base}/tools`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const serverTools = (json.tools as Tool[]) || [];
        if (serverTools.length) return serverTools;
      }
    } catch {
      // fall through to fallback logic below
    }
  }

  // Fallback: always show the locally defined implemented tools when backend fails,
  // even in production, so the UI never appears empty.
  return implementedTools;
}

export async function fetchCategoriesServer(): Promise<{ id: string; name: string }[]> {
  const base = getApiBase();
  if (base && base.startsWith('http')) {
    try {
      const res = await fetchWithTimeout(`${base}/categories`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const cats = (json.categories || []).map((c: any) => ({ id: c.slug || c.id, name: c.name }));
        if (cats.length) return cats;
      }
    } catch {
      // fall through to fallback logic below
    }
  }

  // Fallback categories derived from implemented tools so pages still work without backend.
  const cats = Array.from(new Set(implementedTools.map(t => t.category)));
  return cats.map(id => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }));
}
