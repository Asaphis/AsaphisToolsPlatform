import { MetadataRoute } from 'next';
import { getApiBase } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://asaphistools.onrender.com';
  const base = getApiBase();

  let tools: Array<{ slug: string; featured?: boolean; popular?: boolean }> = [];
  let categories: Array<{ id: string }> = [];
  try {
    if (base && base.startsWith('http')) {
      const [toolsRes, catsRes] = await Promise.all([
        fetch(`${base}/tools`, { cache: 'no-store' }),
        fetch(`${base}/categories`, { cache: 'no-store' }),
      ]);
      if (toolsRes.ok) {
        const t = await toolsRes.json();
        tools = (t.tools || []).map((x: any) => ({ slug: x.slug, featured: x.featured, popular: x.popular }));
      }
      if (catsRes.ok) {
        const c = await catsRes.json();
        categories = (c.categories || []).map((x: any) => ({ id: x.slug || x.id }));
      }
    }
  } catch {}

  // If backend is unreachable, return a minimal sitemap rather than mixing in static mock tools.
  if (tools.length === 0) {
    tools = [];
  }
  if (categories.length === 0) {
    categories = [];
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Category pages
  // Category pages (only if available)
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Only include implemented tools in sitemap
  const implemented = new Set([
    'image-compressor',
    'image-resizer',
    'pdf-merger',
    'word-counter',
    'text-case-converter',
    'json-formatter',
    'url-encoder-decoder',
    'base64-encoder-decoder',
    'qr-code-generator',
    'password-generator',
  ]);
  const toolPages: MetadataRoute.Sitemap = tools
    .filter((tool) => implemented.has(tool.slug))
    .map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: tool.featured ? 0.9 : tool.popular ? 0.8 : 0.7,
    }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
