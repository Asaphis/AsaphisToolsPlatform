import { Tool } from '@/types';
import { implementedTools } from '@/data/tools';

export function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export async function fetchToolsServer(): Promise<Tool[]> {
  const base = getApiBase();
  if (base && base.startsWith('http')) {
    try {
      const res = await fetch(`${base}/tools`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        return (json.tools as Tool[]) || implementedTools;
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
