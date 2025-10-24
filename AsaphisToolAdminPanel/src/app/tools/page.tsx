import { getApiBase } from '@/lib/api';

async function fetchTools() {
  const res = await fetch(`${getApiBase()}/tools`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load tools');
  return res.json();
}

export default async function ToolsPage() {
  const { tools } = await fetchTools();
  return (
    <div>
      <h2>Tools</h2>
      <ul>
        {tools.map((t: any) => (
          <li key={t.id}>{t.name} — {t.slug} [{t.status}]</li>
        ))}
      </ul>
    </div>
  );
}
