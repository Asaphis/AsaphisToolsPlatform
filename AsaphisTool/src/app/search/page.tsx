import { Metadata } from 'next';
import { Tool } from '@/types';
import { ToolCard } from '@/components/ui/ToolCard';

export const metadata: Metadata = {
  title: 'Search Tools',
  description: 'Search across all tools.',
};

import { fetchToolsServer } from '@/lib/api';

async function fetchTools(): Promise<Tool[]> {
  return fetchToolsServer();
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim();
  const tools = await fetchTools();
  const results = q
    ? tools.filter(t =>
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(q.toLowerCase()) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q.toLowerCase()))
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Search</h1>
      {q ? (
        <p className="text-gray-600 dark:text-gray-400 mb-8">Results for &quot;{q}&quot;: {results.length}</p>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8">Type a query to search tools.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
