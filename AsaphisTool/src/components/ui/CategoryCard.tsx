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

const categoryGradients: Record<string, string> = {
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
  const gradient = categoryGradients[category.id] || 'from-gray-400 to-gray-600';

  return (
    <Link
      href={`/category/${category.id}`}
      className="group block rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow text-center"
    >
      <div className={`mx-auto w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl mb-3`}>{icon}</div>
      <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
      <p className="mt-1 text-sm text-foreground/70">{category.count} {category.count === 1 ? 'tool' : 'tools'}</p>
      <div className="mt-3 inline-flex items-center text-primary-600 text-sm font-medium">
        Explore tools
        <svg className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </div>
    </Link>
  );
}
