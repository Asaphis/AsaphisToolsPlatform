"use client";

import { useEffect, useState } from 'react';
import fetchWithAdmin from '@/lib/fetchWithAdmin';

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAdmin('/api/v1/admin/tools');
        if (res.ok) {
          const json = await res.json();
          setTools(json.tools || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Tools</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {tools.map((t: any) => (
            <li key={t.id}>{t.name} — {t.slug} [{t.is_active ? 'active' : 'inactive'}]</li>
          ))}
        </ul>
      )}
    </div>
  );
}
