export interface BackgroundItem {
  id: string;
  name: string;
  category: string;
  url: string;
  thumbnail: string;
  tags: string[];
  premium: boolean;
  colors: string[];
  description: string;
}

export const backgroundCategories = [
  { id: 'office', name: 'Office & Business', icon: '🏢' },
  { id: 'nature', name: 'Nature & Outdoor', icon: '🌿' },
  { id: 'abstract', name: 'Abstract & Art', icon: '🎨' },
  { id: 'studio', name: 'Studio & Professional', icon: '📷' },
  { id: 'gradients', name: 'Gradients', icon: '🌈' },
  { id: 'textures', name: 'Textures & Patterns', icon: '🔲' },
  { id: 'seasonal', name: 'Seasonal', icon: '❄️' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨' }
];

export const backgrounds: BackgroundItem[] = [
  // Office & Business
  {
    id: 'office-1',
    name: 'Modern Office',
    category: 'office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop&crop=center',
    tags: ['office', 'modern', 'professional', 'clean'],
    premium: false,
    colors: ['#f8f9fa', '#e9ecef', '#6c757d'],
    description: 'Clean modern office space'
  },
  {
    id: 'office-2',
    name: 'Conference Room',
    category: 'office',
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300&h=200&fit=crop&crop=center',
    tags: ['meeting', 'professional', 'business'],
    premium: false,
    colors: ['#2c3e50', '#34495e', '#ecf0f1'],
    description: 'Professional conference room'
  },
  {
    id: 'office-3',
    name: 'Minimalist Workspace',
    category: 'office',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=300&h=200&fit=crop&crop=center',
    tags: ['minimal', 'clean', 'workspace'],
    premium: false,
    colors: ['#ffffff', '#f1f3f4', '#5f6368'],
    description: 'Clean minimalist workspace'
  },

  // Nature & Outdoor
  {
    id: 'nature-1',
    name: 'Forest Path',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop&crop=center',
    tags: ['forest', 'nature', 'green', 'peaceful'],
    premium: false,
    colors: ['#2d5016', '#52734d', '#91c788'],
    description: 'Serene forest pathway'
  },
  {
    id: 'nature-2',
    name: 'Mountain View',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center',
    tags: ['mountains', 'landscape', 'scenic'],
    premium: false,
    colors: ['#87ceeb', '#4682b4', '#2f4f4f'],
    description: 'Majestic mountain landscape'
  },
  {
    id: 'nature-3',
    name: 'Ocean Waves',
    category: 'nature',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200&fit=crop&crop=center',
    tags: ['ocean', 'waves', 'blue', 'calming'],
    premium: false,
    colors: ['#006994', '#0080b7', '#87ceeb'],
    description: 'Peaceful ocean waves'
  },

  // Abstract & Art
  {
    id: 'abstract-1',
    name: 'Geometric Patterns',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&h=200&fit=crop&crop=center',
    tags: ['geometric', 'modern', 'colorful'],
    premium: false,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    description: 'Modern geometric patterns'
  },
  {
    id: 'abstract-2',
    name: 'Fluid Colors',
    category: 'abstract',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center',
    tags: ['fluid', 'colorful', 'artistic'],
    premium: true,
    colors: ['#667eea', '#764ba2', '#f093fb'],
    description: 'Flowing abstract colors'
  },

  // Studio & Professional
  {
    id: 'studio-1',
    name: 'Photo Studio',
    category: 'studio',
    url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
    tags: ['studio', 'professional', 'portrait'],
    premium: false,
    colors: ['#f8f8f8', '#e0e0e0', '#808080'],
    description: 'Professional photo studio'
  },
  {
    id: 'studio-2',
    name: 'White Backdrop',
    category: 'studio',
    url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop&crop=center',
    tags: ['white', 'clean', 'minimal'],
    premium: false,
    colors: ['#ffffff', '#f5f5f5', '#eeeeee'],
    description: 'Pure white studio backdrop'
  },

  // Gradients
  {
    id: 'gradient-1',
    name: 'Blue Purple',
    category: 'gradients',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDAiIHgxPSIwIiB5MT0iMCIgeDI9IjE5MjAiIHkyPSIxMDgwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTA4MCIgZmlsbD0idXJsKCNwYWludDAiKSIvPgo8L3N2Zz4K',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MCIgeDE9IjAiIHkxPSIwIiB4Mj0iMzAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2NjdlZWEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjcGFpbnQwKSIvPgo8L3N2Zz4K',
    tags: ['gradient', 'blue', 'purple', 'modern'],
    premium: false,
    colors: ['#667eea', '#764ba2'],
    description: 'Smooth blue to purple gradient'
  },
  {
    id: 'gradient-2',
    name: 'Sunset Orange',
    category: 'gradients',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDAiIHgxPSIwIiB5MT0iMCIgeDI9IjE5MjAiIHkyPSIxMDgwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNmZjc3OTMiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmY2MTYxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTA4MCIgZmlsbD0idXJsKCNwYWludDAiKSIvPgo8L3N2Zz4K',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MCIgeDE9IjAiIHkxPSIwIiB4Mj0iMzAwIiB5Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNmZjc3OTMiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmY2MTYxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjcGFpbnQwKSIvPgo8L3N2Zz4K',
    tags: ['gradient', 'orange', 'sunset', 'warm'],
    premium: false,
    colors: ['#ff7793', '#ff6161'],
    description: 'Warm sunset gradient'
  },

  // Technology
  {
    id: 'tech-1',
    name: 'Circuit Board',
    category: 'technology',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop&crop=center',
    tags: ['technology', 'circuit', 'digital'],
    premium: true,
    colors: ['#1a1a1a', '#00ff41', '#0066cc'],
    description: 'High-tech circuit board'
  },
  {
    id: 'tech-2',
    name: 'Data Visualization',
    category: 'technology',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&crop=center',
    tags: ['data', 'analytics', 'modern'],
    premium: false,
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa'],
    description: 'Modern data visualization'
  },

  // Textures & Patterns
  {
    id: 'texture-1',
    name: 'Marble Texture',
    category: 'textures',
    url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=300&h=200&fit=crop&crop=center',
    tags: ['marble', 'luxury', 'elegant'],
    premium: false,
    colors: ['#f8f8f8', '#e5e5e5', '#c0c0c0'],
    description: 'Elegant marble texture'
  },
  {
    id: 'texture-2',
    name: 'Wood Grain',
    category: 'textures',
    url: 'https://images.unsplash.com/photo-1441027398901-b5081209b6c5?w=1920&h=1080&fit=crop&crop=center',
    thumbnail: 'https://images.unsplash.com/photo-1441027398901-b5081209b6c5?w=300&h=200&fit=crop&crop=center',
    tags: ['wood', 'natural', 'warm'],
    premium: false,
    colors: ['#8b4513', '#daa520', '#cd853f'],
    description: 'Natural wood grain texture'
  }
];

// Function to get backgrounds by category
export function getBackgroundsByCategory(category: string): BackgroundItem[] {
  return backgrounds.filter(bg => bg.category === category);
}

// Function to get featured backgrounds
export function getFeaturedBackgrounds(): BackgroundItem[] {
  return backgrounds.filter(bg => !bg.premium).slice(0, 12);
}

// Function to search backgrounds
export function searchBackgrounds(query: string): BackgroundItem[] {
  const lowercaseQuery = query.toLowerCase();
  return backgrounds.filter(bg => 
    bg.name.toLowerCase().includes(lowercaseQuery) ||
    bg.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    bg.description.toLowerCase().includes(lowercaseQuery)
  );
}