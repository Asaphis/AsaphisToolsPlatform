import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Tool } from '@/types';
import { ToolPageContent } from '@/components/tools/ToolPageContent';
import AdSlot from '@/components/ads/AdSlot';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { implementedTools } from '@/data/tools';

interface ToolPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return implementedTools.map((tool) => ({ slug: tool.slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tools = await fetchToolsServer();
  const tool = tools.find(t => t.slug === params.slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool was not found.',
    };
  }

  const title = tool.seoTitle || `${tool.name} - Free Online Tool`;
  const description = tool.seoDescription || tool.description;
  const keywords = tool.keywords || [tool.name.toLowerCase(), ...tool.tags];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/tools/${tool.slug}`,
      images: [
        {
          url: '/og-tool.png',
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-tool.png'],
    },
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
  };
}

import { fetchToolsServer } from '@/lib/api';

export default async function ToolPage({ params }: ToolPageProps) {
  const tools = await fetchToolsServer();
  const tool = tools.find(t => t.slug === params.slug);

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-2xl flex items-center justify-center text-4xl">
                {tool.icon}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              {tool.name}
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {tool.description}
            </p>
            <div className="mt-6 flex items-center justify-center">
              <ShareButtons 
                url={`https://asaphistool.com/tools/${tool.slug}`}
                title={`${tool.name} - Free Online Tool`}
                description={tool.description}
              />
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 capitalize">
                {tool.category}
              </span>
              {tool.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  ⭐ Featured
                </span>
              )}
              {tool.premium && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  💎 Pro
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ad - Top */}
      <AdSlot slot="header" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ToolPageContent tool={tool} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Ad - Sidebar */}
              <AdSlot slot="sidebar" />

              {/* Tool Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tool Information
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                    <dd className="text-sm text-gray-900 dark:text-white capitalize">{tool.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {tool.tags.slice(0, 3).join(', ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      {tool.premium ? 'Premium' : 'Free'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Security</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">
                      🔒 100% Secure - Files processed locally
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Features */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Why Use This Tool?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    100% Free to use
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No file size limits
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure & Private
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Works on any device
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No registration required
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad - Footer */}
      <AdSlot slot="footer" />
    </div>
  );
}
