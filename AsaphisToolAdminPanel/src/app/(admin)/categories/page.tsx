"use client";

import { useEffect, useState } from 'react';
import fetchWithAdmin from '@/lib/fetchWithAdmin';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetchWithAdmin('/api/v1/admin/categories');
        if (res.ok) {
          const json = await res.json();
          setCategories(json.categories || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul>
          {categories.map((c: any) => (
            <li key={c.id}>{c.name} — {c.slug}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
