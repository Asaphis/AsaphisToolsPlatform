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
      className={`tool-card block card p-5 hover:border-teal-300 dark:hover:border-teal-600 ${featured ? 'ring-1 ring-teal-100 dark:ring-teal-900' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-gray-700 flex items-center justify-center text-xl text-teal-600">
            {tool.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{tool.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge capitalize">{tool.category}</span>
              {tool.popular && <span className="badge text-teal-700 border-teal-200">Popular</span>}
              {featured && <span className="badge text-amber-700 border-amber-200">Featured</span>}
            </div>
          </div>
        </div>
        <span className="btn-cta">Use Free Tool</span>
      </div>
    </Link>
  );
}
