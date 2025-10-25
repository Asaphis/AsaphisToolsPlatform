import { Metadata } from 'next';
import { Tool } from '@/types';
import { ToolCard } from '@/components/ui/ToolCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import { SearchBar } from '@/components/ui/SearchBar';
import AdSlot from '@/components/ads/AdSlot';

export const metadata: Metadata = {
  title: 'All Tools - AsaPhisTool',
  description: 'Browse all free online tools including image compression, PDF editing, text tools, generators, and developer utilities.',
  keywords: 'online tools, free tools, image compressor, pdf tools, text tools, generators, developer tools',
  openGraph: {
    title: 'All Tools - AsaPhisTool',
    description: 'Browse all free online tools for productivity and development.',
    type: 'website',
    url: '/tools',
  },
};

import { fetchToolsServer } from '@/lib/api';

async function fetchTools(): Promise<Tool[]> {
  return fetchToolsServer();
}

function buildCategories(tools: Tool[]) {
  const map = new Map<string, number>();
  tools.forEach(t => map.set(t.category, (map.get(t.category) || 0) + 1));
  return Array.from(map.entries()).map(([id, count]) => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1), count }));
}

export default async function ToolsPage() {
  const tools = await fetchTools();
  const categories = buildCategories(tools);
  const featuredTools = tools.filter(tool => tool.featured);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white/95 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-white flex items-center justify-center text-3xl shadow-lg">
                🧰
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              All Tools
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Browse our complete collection of free online tools. From image compression to PDF editing,
              find the perfect tool for your needs.
            </p>
            
            {/* Search */}
            <div className="mt-8 max-w-2xl mx-auto">
              <SearchBar placeholder="Search tools..." />
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {tools.length}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Tools
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Categories
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Free
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad */}
      <AdSlot slot="header" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Find tools organized by purpose and functionality
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                ⭐ Featured Tools
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Our most powerful and popular tools
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} featured />
              ))}
            </div>
          </section>
        )}

        {/* Ad - Mid Content */}
        <AdSlot slot="inContent" />

        {/* All Tools */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              All Tools
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Complete collection of our free online tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Categories Breakdown */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Tools by Category
            </h2>
          </div>
          
          {categories.map((category) => {
            const categoryTools = tools.filter(tool => tool.category === category.id);
            return (
              <div key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {category.name} Tools ({categoryTools.length})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Features */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-12 border border-blue-200 dark:border-blue-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              Why Choose AsaPhisTool?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🆓
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                100% Free
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                All tools are completely free with no hidden costs or premium subscriptions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Secure & Private
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                All processing happens in your browser. Your files never leave your device.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Fast & Reliable
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Optimized for speed with instant results and batch processing capabilities.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Ad - Footer */}
      <AdSlot slot="footer" />
    </div>
  );
}
