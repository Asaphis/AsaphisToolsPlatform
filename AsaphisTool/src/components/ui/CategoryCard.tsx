import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryCardProps {
  category: Category;
}

const categoryIcons: Record<string, string> = {
  image: '🖼️',
  video: '🎥',
  pdf: '📄',
  text: '📝',
  developer: '💻',
  converter: '🔄',
  generator: '⚡',
};

const categoryColors: Record<string, string> = {
  image: 'from-green-400 to-blue-500',
  video: 'from-purple-400 to-pink-500',
  pdf: 'from-red-400 to-orange-500',
  text: 'from-blue-400 to-indigo-500',
  developer: 'from-gray-400 to-gray-600',
  converter: 'from-yellow-400 to-orange-500',
  generator: 'from-teal-400 to-cyan-500',
};

export function CategoryCard({ category }: CategoryCardProps) {
  const icon = categoryIcons[category.id] || '🔧';
  const gradientColor = categoryColors[category.id] || 'from-gray-400 to-gray-600';

  return (
    <Link
      href={`/category/${category.id}`}
      className="group block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
    >
      <div className="text-center">
        <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${gradientColor} rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {category.count} {category.count === 1 ? 'tool' : 'tools'}
        </p>
        
        <div className="mt-3 inline-flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
          Explore tools
          <svg
            className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
