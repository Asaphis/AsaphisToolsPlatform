// Google Fonts Integration for Professional Typography
export interface GoogleFont {
  name: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  weights: string[];
  preview: string;
}

export const POPULAR_FONTS: GoogleFont[] = [
  // Sans-serif
  { name: 'Inter', category: 'sans-serif', weights: ['300', '400', '500', '600', '700', '800'], preview: 'Modern & Clean' },
  { name: 'Roboto', category: 'sans-serif', weights: ['100', '300', '400', '500', '700', '900'], preview: 'Google\'s Font' },
  { name: 'Poppins', category: 'sans-serif', weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], preview: 'Friendly & Modern' },
  { name: 'Open Sans', category: 'sans-serif', weights: ['300', '400', '500', '600', '700', '800'], preview: 'Professional' },
  { name: 'Lato', category: 'sans-serif', weights: ['100', '300', '400', '700', '900'], preview: 'Humanist Sans' },
  { name: 'Montserrat', category: 'sans-serif', weights: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], preview: 'Geometric Sans' },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: ['200', '300', '400', '600', '700', '900'], preview: 'Adobe\'s Font' },
  { name: 'Nunito', category: 'sans-serif', weights: ['200', '300', '400', '500', '600', '700', '800', '900'], preview: 'Rounded Sans' },
  
  // Serif
  { name: 'Playfair Display', category: 'serif', weights: ['400', '500', '600', '700', '800', '900'], preview: 'Elegant Headlines' },
  { name: 'Merriweather', category: 'serif', weights: ['300', '400', '700', '900'], preview: 'Reading Serif' },
  { name: 'Lora', category: 'serif', weights: ['400', '500', '600', '700'], preview: 'Modern Serif' },
  { name: 'Crimson Text', category: 'serif', weights: ['400', '600', '700'], preview: 'Book Serif' },
  { name: 'PT Serif', category: 'serif', weights: ['400', '700'], preview: 'Transitional' },
  
  // Display
  { name: 'Oswald', category: 'display', weights: ['200', '300', '400', '500', '600', '700'], preview: 'Impact Display' },
  { name: 'Bebas Neue', category: 'display', weights: ['400'], preview: 'All Caps Display' },
  { name: 'Anton', category: 'display', weights: ['400'], preview: 'Bold Display' },
  { name: 'Fjalla One', category: 'display', weights: ['400'], preview: 'Nordic Display' },
  { name: 'Righteous', category: 'display', weights: ['400'], preview: 'Retro Display' },
  
  // Handwriting
  { name: 'Dancing Script', category: 'handwriting', weights: ['400', '500', '600', '700'], preview: 'Casual Script' },
  { name: 'Pacifico', category: 'handwriting', weights: ['400'], preview: 'Brush Script' },
  { name: 'Great Vibes', category: 'handwriting', weights: ['400'], preview: 'Elegant Script' },
  { name: 'Kaushan Script', category: 'handwriting', weights: ['400'], preview: 'Brush Lettering' },
  
  // Monospace
  { name: 'Fira Code', category: 'monospace', weights: ['300', '400', '500', '600', '700'], preview: 'Code Font' },
  { name: 'JetBrains Mono', category: 'monospace', weights: ['100', '200', '300', '400', '500', '600', '700', '800'], preview: 'Developer Font' },
  { name: 'Source Code Pro', category: 'monospace', weights: ['200', '300', '400', '500', '600', '700', '900'], preview: 'Adobe Code' },
];

export const FONT_WEIGHTS = {
  '100': 'Thin',
  '200': 'Extra Light',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'Semi Bold',
  '700': 'Bold',
  '800': 'Extra Bold',
  '900': 'Black'
};

export class GoogleFontsLoader {
  private static loadedFonts = new Set<string>();
  
  static async loadFont(fontName: string, weights: string[] = ['400']): Promise<void> {
    const fontKey = `${fontName}-${weights.join(',')}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }
    
    try {
      const weightsParam = weights.join(';');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@${weightsParam}&display=swap`;
      
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      // Wait for font to load
      await document.fonts.load(`400 16px "${fontName}"`);
      
      this.loadedFonts.add(fontKey);
    } catch (error) {
      console.warn(`Failed to load font: ${fontName}`, error);
    }
  }
  
  static async loadPopularFonts(): Promise<void> {
    const fontPromises = POPULAR_FONTS.slice(0, 10).map(font => 
      this.loadFont(font.name, font.weights.slice(0, 4))
    );
    
    await Promise.allSettled(fontPromises);
  }
  
  static getFontsByCategory(category: string): GoogleFont[] {
    return POPULAR_FONTS.filter(font => font.category === category);
  }
  
  static searchFonts(query: string): GoogleFont[] {
    const lowerQuery = query.toLowerCase();
    return POPULAR_FONTS.filter(font => 
      font.name.toLowerCase().includes(lowerQuery) ||
      font.preview.toLowerCase().includes(lowerQuery) ||
      font.category.includes(lowerQuery)
    );
  }
}

export default GoogleFontsLoader;