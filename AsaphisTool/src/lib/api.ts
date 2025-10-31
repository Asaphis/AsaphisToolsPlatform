import { Tool } from '@/types';
import { implementedTools } from '@/data/tools';

export function getApiBase() {
  // Prefer explicit env var. In development, fall back to the local backend used by AsaphisToolBackend.
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.length) return process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:4000/api/v1';
  return '';
}

export async function fetchToolsServer(): Promise<Tool[]> {
  const base = getApiBase();
  if (base && base.startsWith('http')) {
    try {
      const res = await fetch(`${base}/tools`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const serverTools = (json.tools as Tool[]) || [];

        // Merge server-provided tools with local `implementedTools` so the UI
        // always shows the full set of tools available in the codebase.
        // Prefer server metadata when present, but include any local tools
        // (e.g. admin-only or not-yet-registered endpoints) that the server
        // doesn't return.
        const map = new Map<string, Tool>();
        // first add server tools (take precedence)
        serverTools.forEach(t => map.set(t.slug, t));
        // then add local tools if missing
        implementedTools.forEach(t => {
          if (!map.has(t.slug)) map.set(t.slug, t);
        });
        return Array.from(map.values());
      }
    } catch {
      // fall back below
    }
  }
  return implementedTools;
}

export async function fetchCategoriesServer(): Promise<{ id: string; name: string }[]> {
  const base = getApiBase();
  if (base && base.startsWith('http')) {
    try {
      const res = await fetch(`${base}/categories`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const cats = (json.categories || []).map((c: any) => ({ id: c.slug || c.id, name: c.name }));
        if (cats.length) return cats;
      }
    } catch {}
  }
  const cats = Array.from(new Set(implementedTools.map(t => t.category)));
  return cats.map(id => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1) }));
}
