// Tool categories
export type ToolCategory = 
  | 'image' 
  | 'video' 
  | 'pdf' 
  | 'text' 
  | 'developer' 
  | 'converter' 
  | 'generator'
  | 'ai'
  | 'security'
  | 'audio'
  | 'tools';

// Tool interface
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  slug: string;
  icon: string;
  featured: boolean;
  popular: boolean;
  premium: boolean;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}

// Tool execution result
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
  fileName?: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  favoriteTools: string[];
  recentTools: string[];
  language: string;
}

// Analytics event
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

// Ad configuration
export interface AdConfig {
  enabled: boolean;
  adSenseId?: string;
  slots: {
    header: string;
    sidebar: string;
    footer: string;
    inContent: string;
  };
}

// SEO metadata
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

// Blog post
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: Date;
  updatedDate?: Date;
  tags: string[];
  featured: boolean;
  seo: SEOMetadata;
}

// Search result
export interface SearchResult {
  tool: Tool;
  score: number;
}
