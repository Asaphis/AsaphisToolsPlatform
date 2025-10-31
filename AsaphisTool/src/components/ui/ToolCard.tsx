import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Tool } from '@/types';

interface ToolCardProps {
  tool: Tool;
  animationDelay?: number;
}

const categoryColors: Record<string, string> = {
  image: 'bg-blue-100 text-blue-700 border-blue-200',
  text: 'bg-green-100 text-green-700 border-green-200',
  audio: 'bg-purple-100 text-purple-700 border-purple-200',
  code: 'bg-orange-100 text-orange-700 border-orange-200',
  document: 'bg-pink-100 text-pink-700 border-pink-200',
  design: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  security: 'bg-red-100 text-red-700 border-red-200',
  utility: 'bg-indigo-100 text-indigo-700 border-indigo-200'
};

export function ToolCard({ tool, animationDelay = 0 }: ToolCardProps) {
  const staggerClass = animationDelay > 0 && animationDelay <= 8 ? `stagger-${animationDelay}` : '';
  
  return (
    <Card 
      className={`relative p-6 hover-elevate transition-all duration-200 hover:shadow-lg group animate-fade-in-up ${staggerClass}`}
      data-testid={`card-tool-${tool.id}`}
    >
      {/* Badges */}
      <div className="absolute top-4 right-4 flex gap-2">
        {tool.popular && (
          <Badge 
            variant="secondary" 
            className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold"
            data-testid={`badge-popular-${tool.id}`}
          >
            Popular
          </Badge>
        )}
        <Badge 
          variant="secondary" 
          className="bg-green-100 text-green-700 border-green-200 text-xs font-semibold"
          data-testid={`badge-free-${tool.id}`}
        >
          FREE
        </Badge>
      </div>

      {/* Icon */}
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
          {typeof tool.icon === 'string' ? (
            <div className="w-6 h-6 text-purple-700 flex items-center justify-center">{tool.icon}</div>
          ) : (
            // If in the future icons are React components, render them here
            // @ts-ignore
            <tool.icon className="w-6 h-6 text-purple-700" />
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 pr-20" data-testid={`text-tool-name-${tool.id}`}>
        {tool.name}
      </h3>
      
      <Badge 
        variant="outline" 
        className={`mb-3 text-xs ${categoryColors[tool.category || ''] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
        data-testid={`badge-category-${tool.id}`}
      >
        {tool.category}
      </Badge>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2" data-testid={`text-description-${tool.id}`}>
        {tool.description}
      </p>

      {/* CTA Button */}
      <Link href={`/tools/${tool.slug}`}>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          data-testid={`button-use-tool-${tool.id}`}
        >
          Use Free Tool
        </Button>
      </Link>
    </Card>
  );
}
