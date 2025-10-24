import Link from 'next/link';
import { Tool } from '@/types';

interface ToolCardProps {
  tool: Tool;
  featured?: boolean;
}

export function ToolCard({ tool, featured = false }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={`tool-card block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 shadow-sm hover:shadow-md transition-all duration-300 ${
        featured ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-lg flex items-center justify-center text-2xl">
            {tool.icon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {tool.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              {featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  ⭐ Featured
                </span>
              )}
              {tool.premium && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  💎 Pro
                </span>
              )}
              {tool.popular && !featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  🔥 Popular
                </span>
              )}
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {tool.description}
          </p>
          
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
              {tool.category}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {tool.tags.slice(0, 2).join(', ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
