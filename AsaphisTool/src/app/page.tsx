import { SearchBar } from '@/components/ui/SearchBar';
import { ToolCard } from '@/components/ui/ToolCard';
import { CategoryCard } from '@/components/ui/CategoryCard';
import AdSlot from '@/components/ads/AdSlot';
import { Tool } from '@/types';
import Link from 'next/link';
import { fetchToolsServer } from '@/lib/api';

async function fetchTools(): Promise<Tool[]> {
  // Prefer backend when configured, fallback to implemented tools
  return fetchToolsServer();
}

export default async function HomePage() {
  const tools = await fetchTools();
  const featuredTools = tools.filter(t => t.featured);
  const popularTools = tools.filter(t => t.popular).slice(0, 8);
  const categories = Array.from(new Set(tools.map(t => t.category))).map(id => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1), count: tools.filter(t => t.category === id).length }));

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Free Online Tools for
              <span className="block text-primary-600 dark:text-primary-400">
                Everything You Need
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Boost your productivity with our collection of free, fast, and secure online tools. 
              Compress images, edit PDFs, generate QR codes, and much more - all in your browser, 
              no downloads required.
            </p>
            
            {/* CTA Search */}
            <div className="mt-10 max-w-2xl mx-auto">
              <SearchBar />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                🔥 Popular searches: image compressor, PDF merger, QR generator, password generator
              </p>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {tools.length}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Free Tools
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  100%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Secure
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  0
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Registration
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad - Top */}
      <AdSlot slot="header" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Tools Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              ⭐ Featured Tools
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Our most popular and powerful tools to boost your productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} featured />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              🗂️ Browse by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Find the right tool for your specific needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Ad - Mid Content */}
        <AdSlot slot="inContent" />

        {/* Popular Tools Section */}
        <section className="py-16">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                🔥 Popular Tools
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Most used tools by our community
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              View All Tools
              <svg
                className="ml-2 -mr-1 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Why Choose AsaPhisTool?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Everything you need for free, fast, and secure online tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-2xl font-bold mb-4">
                ✨
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Always Free
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All tools are completely free to use with no hidden fees or premium subscriptions required.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-2xl font-bold mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Process your files instantly with our optimized tools. No waiting, no delays.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-2xl font-bold mb-4">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                100% Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your files are processed locally in your browser. We never store or access your data.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-2xl font-bold mb-4">
                📱
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Any Device
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Works perfectly on desktop, tablet, and mobile. Use anywhere, anytime.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-2xl font-bold mb-4">
                🚫
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Registration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start using tools immediately. No signup, no email, no personal information needed.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 text-2xl font-bold mb-4">
                🌐
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Downloads
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Everything runs in your browser. No software to install or update.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Ad - Footer */}
      <AdSlot slot="footer" />
    </>
  );
}
