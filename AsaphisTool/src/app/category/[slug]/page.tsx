import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Tool } from '@/types';
import { ToolCard } from '@/components/ui/ToolCard';
import AdSlot from '@/components/ads/AdSlot';
import { implementedTools } from '@/data/tools';

interface CategoryPageProps {
  params: { slug: string };
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = Array.from(new Set(implementedTools.map(t => t.category)));
  return categories.map((slug) => ({ slug }));
}

// Generate metadata for SEO
import { fetchToolsServer } from '@/lib/api';

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const tools = await fetchToolsServer();
  const count = tools.filter(t => t.category === params.slug).length;
  const category = { id: params.slug, name: params.slug.charAt(0).toUpperCase() + params.slug.slice(1), count };
  
  if (!count) {
    return {
      title: 'Category Not Found',
      description: 'The requested category was not found.',
    };
  }

  const title = `${category.name} Tools - Free Online ${category.name} Tools`;
  const description = `Discover ${category.count} free ${category.name.toLowerCase()} tools. Convert, compress, edit, and optimize files online with no downloads required.`;

  return {
    title,
    description,
    keywords: `${category.name.toLowerCase()} tools, online ${category.name.toLowerCase()}, free ${category.name.toLowerCase()} converter`,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/category/${params.slug}`,
      images: [
        {
          url: '/og-category.png',
          width: 1200,
          height: 630,
          alt: `${category.name} Tools`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/twitter-category.png'],
    },
    alternates: {
      canonical: `/category/${params.slug}`,
    },
  };
}

const categoryDescriptions = {
  image: {
    description: "Powerful image tools to compress, resize, convert, and enhance your photos. All processing happens in your browser for maximum privacy and speed.",
    features: ["Image Compression", "Format Conversion", "Resizing & Cropping", "Background Removal", "AI Enhancement"]
  },
  pdf: {
    description: "Complete PDF toolkit to merge, split, compress, and convert PDF documents. Handle any PDF task without installing software.",
    features: ["PDF Merging", "Document Splitting", "Size Compression", "Format Conversion", "Text Extraction"]
  },
  video: {
    description: "Video processing tools to compress, convert, and optimize video files. Support for all major video formats and codecs.",
    features: ["Video Compression", "Format Conversion", "Audio Extraction", "Thumbnail Generation", "Quality Optimization"]
  },
  text: {
    description: "Text processing and analysis tools for writers, developers, and content creators. Count, convert, and format text efficiently.",
    features: ["Word Counting", "Case Conversion", "Text Analysis", "Format Transformation", "Content Generation"]
  },
  developer: {
    description: "Essential developer tools for encoding, formatting, and data processing. Speed up your development workflow with these utilities.",
    features: ["JSON Formatting", "URL Encoding", "Base64 Conversion", "Hash Generation", "Data Validation"]
  },
  generator: {
    description: "Generate useful content and codes including QR codes, passwords, placeholder text, and more. Perfect for quick content creation.",
    features: ["QR Code Creation", "Password Generation", "Lorem Ipsum", "UUID Generation", "Mock Data"]
  },
  converter: {
    description: "Universal file conversion tools supporting hundreds of formats. Convert between images, documents, audio, and video files.",
    features: ["Multi-format Support", "Batch Conversion", "Quality Preservation", "Fast Processing", "Universal Compatibility"]
  },
  ai: {
    description: "AI-powered tools leveraging machine learning for advanced image processing, text analysis, and content generation.",
    features: ["Image Enhancement", "Text Summarization", "Smart Cropping", "Color Palette Generation", "Content Analysis"]
  },
  security: {
    description: "Security and cryptography tools for password generation, hash calculation, and data protection. Keep your data safe and secure.",
    features: ["Hash Generation", "Password Security", "Encryption Tools", "Data Validation", "Security Analysis"]
  }
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const tools = implementedTools;
  const categories = Array.from(new Set(tools.map(t => t.category))).map(id => ({ id, name: id.charAt(0).toUpperCase() + id.slice(1), count: tools.filter(t => t.category === id).length }));
  const category = categories.find(cat => cat.id === params.slug);
  const categoryTools = tools.filter(t => t.category === params.slug);

  if (!category || categoryTools.length === 0) {
    notFound();
  }

  const categoryInfo = categoryDescriptions[params.slug as keyof typeof categoryDescriptions];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-white flex items-center justify-center text-3xl shadow-lg">
                🗂️
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              {category.name} Tools
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto">
              {categoryInfo?.description || `Discover ${category.count} powerful ${category.name.toLowerCase()} tools for all your needs.`}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-muted text-foreground">{category.count} Tools Available</span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-muted text-foreground">100% Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link href="/tools" className="ml-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  Tools
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-4 text-gray-500 dark:text-gray-400">{category.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Ad - Top */}
      <AdSlot slot="header" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Features */}
            {categoryInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  What You Can Do
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categoryTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>

            {/* Related Categories */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Explore Other Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories
                  .filter(cat => cat.id !== params.slug)
                  .slice(0, 8)
                  .map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      {cat.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {cat.count} tools
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Ad - Sidebar */}
              <AdSlot slot="sidebar" />

              {/* Category Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Stats
                </h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Total Tools</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">{category.count}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Free Tools</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {categoryTools.filter(t => !t.premium).length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Premium Tools</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {categoryTools.filter(t => t.premium).length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Featured</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-white">
                      {categoryTools.filter(t => t.featured).length}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Quick Features */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Why Choose Our Tools?
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    100% free to use
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No file size limits
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Secure & private
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Works offline
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    No registration needed
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
