import { getApiBase } from '@/lib/api';

async function fetchCategories() {
  const res = await fetch(`${getApiBase()}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export default async function CategoriesPage() {
  const { categories } = await fetchCategories();
  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map((c: any) => (
          <li key={c.id}>{c.name} — {c.slug}</li>
        ))}
      </ul>
    </div>
  );
}
