import { Tool } from '@/types';

export const tools: Tool[] = [
  // Image Tools
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress JPEG, PNG, and WebP images without losing quality. Reduce file size by up to 80%.',
    category: 'image',
    slug: 'image-compressor',
    icon: '🗜️',
    featured: true,
    popular: true,
    premium: false,
    tags: ['compress', 'optimize', 'jpeg', 'png', 'webp', 'reduce size'],
    seoTitle: 'Free Image Compressor - Compress JPEG, PNG, WebP Online',
    seoDescription: 'Compress images online for free. Reduce JPEG, PNG, WebP file sizes by up to 80% without losing quality. Fast, secure, and no registration required.',
    keywords: ['image compressor', 'compress jpeg', 'png compressor', 'image optimizer', 'reduce image size']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimension. Perfect for social media, websites, and print.',
    category: 'image',
    slug: 'image-resizer',
    icon: '📏',
    featured: false,
    popular: true,
    premium: false,
    tags: ['resize', 'dimensions', 'scale', 'crop', 'social media'],
    seoTitle: 'Free Image Resizer - Resize Images Online',
    seoDescription: 'Resize images online for free. Change image dimensions for social media, websites, and print. Supports JPEG, PNG, WebP formats.',
    keywords: ['image resizer', 'resize image', 'change image size', 'image dimensions']
  },
  {
    id: 'image-format-converter',
    name: 'Image Format Converter',
    description: 'Convert between JPEG, PNG, WebP, GIF, and other image formats instantly.',
    category: 'converter',
    slug: 'image-format-converter',
    icon: '🔄',
    featured: false,
    popular: true,
    premium: false,
    tags: ['convert', 'jpeg', 'png', 'webp', 'gif', 'format'],
    seoTitle: 'Free Image Format Converter - Convert JPEG, PNG, WebP Online',
    seoDescription: 'Convert images between different formats online for free. Support for JPEG, PNG, WebP, GIF, and more. Fast and secure conversion.',
    keywords: ['image converter', 'jpeg to png', 'png to webp', 'convert image format']
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove background from images automatically using AI. Perfect for product photos and portraits.',
    category: 'image',
    slug: 'background-remover',
    icon: '✂️',
    featured: true,
    popular: true,
    premium: true,
    tags: ['background', 'remove', 'ai', 'transparent', 'cutout'],
    seoTitle: 'AI Background Remover - Remove Image Background Online',
    seoDescription: 'Remove background from images automatically using AI. Create transparent PNG images perfect for products, portraits, and designs.',
    keywords: ['background remover', 'remove background', 'transparent png', 'ai background removal']
  },

  // Video Tools
  {
    id: 'youtube-thumbnail-downloader',
    name: 'YouTube Thumbnail Downloader',
    description: 'Download YouTube video thumbnails in HD, SD, and other resolutions. Works with any YouTube video.',
    category: 'video',
    slug: 'youtube-thumbnail-downloader',
    icon: '🖼️',
    featured: true,
    popular: true,
    premium: false,
    tags: ['youtube', 'thumbnail', 'download', 'hd', 'video'],
    seoTitle: 'YouTube Thumbnail Downloader - Download YT Thumbnails HD',
    seoDescription: 'Download YouTube video thumbnails in high quality for free. Get HD, SD, and custom size thumbnails from any YouTube video instantly.',
    keywords: ['youtube thumbnail downloader', 'download youtube thumbnail', 'youtube thumbnail hd', 'yt thumbnail']
  },
  {
    id: 'video-compressor',
    name: 'Video Compressor',
    description: 'Compress video files to reduce size while maintaining quality. Supports MP4, AVI, MOV formats.',
    category: 'video',
    slug: 'video-compressor',
    icon: '🎥',
    featured: false,
    popular: true,
    premium: true,
    tags: ['compress', 'video', 'mp4', 'avi', 'mov', 'reduce size'],
    seoTitle: 'Video Compressor - Compress MP4, AVI, MOV Online',
    seoDescription: 'Compress video files online to reduce file size. Support for MP4, AVI, MOV formats with quality preservation.',
    keywords: ['video compressor', 'compress mp4', 'reduce video size', 'video optimizer']
  },

  // PDF Tools
  {
    id: 'pdf-merger',
    name: 'PDF Merger',
    description: 'Merge multiple PDF files into one document. Drag and drop to reorder pages.',
    category: 'pdf',
    slug: 'pdf-merger',
    icon: '📄',
    featured: true,
    popular: true,
    premium: false,
    tags: ['pdf', 'merge', 'combine', 'join', 'documents'],
    seoTitle: 'PDF Merger - Combine PDF Files Online Free',
    seoDescription: 'Merge multiple PDF files into one document online for free. Drag and drop to reorder pages. Secure and fast PDF combining tool.',
    keywords: ['pdf merger', 'merge pdf', 'combine pdf files', 'pdf joiner']
  },
  {
    id: 'pdf-splitter',
    name: 'PDF Splitter',
    description: 'Split PDF files into separate pages or extract specific page ranges.',
    category: 'pdf',
    slug: 'pdf-splitter',
    icon: '✂️',
    featured: false,
    popular: true,
    premium: false,
    tags: ['pdf', 'split', 'separate', 'extract', 'pages'],
    seoTitle: 'PDF Splitter - Split PDF Files Online Free',
    seoDescription: 'Split PDF files into separate pages or extract specific ranges online for free. Fast and secure PDF splitting tool.',
    keywords: ['pdf splitter', 'split pdf', 'extract pdf pages', 'pdf separator']
  },
  {
    id: 'pdf-compressor',
    name: 'PDF Compressor',
    description: 'Reduce PDF file size without losing quality. Perfect for email attachments and web uploads.',
    category: 'pdf',
    slug: 'pdf-compressor',
    icon: '🗜️',
    featured: false,
    popular: true,
    premium: false,
    tags: ['pdf', 'compress', 'reduce', 'optimize', 'size'],
    seoTitle: 'PDF Compressor - Reduce PDF File Size Online',
    seoDescription: 'Compress PDF files online to reduce file size without quality loss. Perfect for email attachments and web uploads.',
    keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'pdf optimizer']
  },

  // Text Tools
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, paragraphs, and sentences in your text. Real-time counting as you type.',
    category: 'text',
    slug: 'word-counter',
    icon: '🔢',
    featured: false,
    popular: true,
    premium: false,
    tags: ['word', 'count', 'character', 'text', 'analysis'],
    seoTitle: 'Word Counter - Count Words and Characters Online',
    seoDescription: 'Count words, characters, paragraphs, and sentences online for free. Real-time text analysis tool for writers and students.',
    keywords: ['word counter', 'character counter', 'text counter', 'count words online']
  },
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    description: 'Convert text to uppercase, lowercase, title case, sentence case, and more.',
    category: 'text',
    slug: 'text-case-converter',
    icon: 'Aa',
    featured: false,
    popular: true,
    premium: false,
    tags: ['text', 'case', 'uppercase', 'lowercase', 'title case'],
    seoTitle: 'Text Case Converter - Change Text Case Online',
    seoDescription: 'Convert text case online for free. Change to uppercase, lowercase, title case, sentence case, and more text formatting options.',
    keywords: ['text case converter', 'uppercase converter', 'lowercase converter', 'title case']
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs and layouts. Customize paragraphs, words, and sentences.',
    category: 'generator',
    slug: 'lorem-ipsum-generator',
    icon: '📝',
    featured: false,
    popular: false,
    premium: false,
    tags: ['lorem', 'ipsum', 'placeholder', 'text', 'generator'],
    seoTitle: 'Lorem Ipsum Generator - Generate Placeholder Text',
    seoDescription: 'Generate Lorem Ipsum placeholder text online for free. Customize paragraphs, words, and sentences for your designs.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'lipsum']
  },

  // Developer Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify JSON data. Minify or prettify JSON with syntax highlighting.',
    category: 'developer',
    slug: 'json-formatter',
    icon: '{ }',
    featured: false,
    popular: true,
    premium: false,
    tags: ['json', 'format', 'validate', 'beautify', 'minify'],
    seoTitle: 'JSON Formatter - Format and Validate JSON Online',
    seoDescription: 'Format, validate, and beautify JSON data online for free. Minify or prettify JSON with syntax highlighting and error detection.',
    keywords: ['json formatter', 'json validator', 'json beautifier', 'format json online']
  },
  {
    id: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs and URI components. Handle special characters and spaces properly.',
    category: 'developer',
    slug: 'url-encoder-decoder',
    icon: '🔗',
    featured: false,
    popular: true,
    premium: false,
    tags: ['url', 'encode', 'decode', 'uri', 'special characters'],
    seoTitle: 'URL Encoder Decoder - Encode and Decode URLs Online',
    seoDescription: 'Encode and decode URLs online for free. Handle special characters and spaces in web addresses properly.',
    keywords: ['url encoder', 'url decoder', 'uri encoder', 'encode url online']
  },
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode text and files to Base64 or decode Base64 strings back to original format.',
    category: 'developer',
    slug: 'base64-encoder-decoder',
    icon: '🔐',
    featured: false,
    popular: true,
    premium: false,
    tags: ['base64', 'encode', 'decode', 'text', 'files'],
    seoTitle: 'Base64 Encoder Decoder - Encode and Decode Base64 Online',
    seoDescription: 'Encode text and files to Base64 or decode Base64 strings online for free. Secure and fast Base64 conversion tool.',
    keywords: ['base64 encoder', 'base64 decoder', 'encode base64', 'decode base64']
  },

  // Converter Tools
  {
    id: 'image-format-converter',
    name: 'Image Format Converter',
    description: 'Convert between JPEG, PNG, WebP, GIF, and other image formats instantly.',
    category: 'converter',
    slug: 'image-format-converter',
    icon: '🔄',
    featured: true,
    popular: true,
    premium: false,
    tags: ['convert', 'jpeg', 'png', 'webp', 'gif', 'format'],
    seoTitle: 'Free Image Format Converter - Convert JPEG, PNG, WebP Online',
    seoDescription: 'Convert images between different formats online for free. Support for JPEG, PNG, WebP, GIF, and more. Fast and secure conversion.',
    keywords: ['image converter', 'jpeg to png', 'png to webp', 'convert image format']
  },
  {
    id: 'video-to-audio-converter',
    name: 'Video to Audio Converter',
    description: 'Extract audio from video files. Convert MP4, AVI, MOV to MP3, WAV, AAC formats.',
    category: 'converter',
    slug: 'video-to-audio-converter',
    icon: '🎵',
    featured: true,
    popular: true,
    premium: false,
    tags: ['video', 'audio', 'convert', 'mp4', 'mp3', 'extract'],
    seoTitle: 'Video to Audio Converter - Extract Audio from Video Online',
    seoDescription: 'Convert video to audio online for free. Extract MP3, WAV, AAC audio from MP4, AVI, MOV video files.',
    keywords: ['video to audio', 'mp4 to mp3', 'extract audio', 'video converter']
  },
  {
    id: 'csv-to-json-converter',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV files to JSON format with custom delimiters and encoding options.',
    category: 'converter',
    slug: 'csv-to-json-converter',
    icon: '📊',
    featured: false,
    popular: true,
    premium: false,
    tags: ['csv', 'json', 'convert', 'data', 'format'],
    seoTitle: 'CSV to JSON Converter - Convert CSV Files Online',
    seoDescription: 'Convert CSV files to JSON format online for free. Support for custom delimiters, headers, and encoding options.',
    keywords: ['csv to json', 'convert csv', 'json converter', 'data converter']
  },

  // AI-Powered Tools
  {
    id: 'ai-text-summarizer',
    name: 'AI Text Summarizer',
    description: 'Summarize long texts using advanced AI. Extract key points and main ideas automatically.',
    category: 'ai',
    slug: 'ai-text-summarizer',
    icon: '🤖',
    featured: true,
    popular: true,
    premium: true,
    tags: ['ai', 'summarize', 'text', 'analysis', 'nlp'],
    seoTitle: 'AI Text Summarizer - Summarize Long Texts with AI',
    seoDescription: 'Use AI to summarize long texts automatically. Extract key points, main ideas, and create concise summaries from articles and documents.',
    keywords: ['ai text summarizer', 'text summary', 'ai summarize', 'automatic summary']
  },
  {
    id: 'ai-color-palette-generator',
    name: 'AI Color Palette Generator',
    description: 'Generate beautiful color palettes using AI based on your preferences and design needs.',
    category: 'ai',
    slug: 'ai-color-palette-generator',
    icon: '🎨',
    featured: true,
    popular: true,
    premium: false,
    tags: ['ai', 'color', 'palette', 'design', 'generator'],
    seoTitle: 'AI Color Palette Generator - Create Beautiful Color Schemes',
    seoDescription: 'Generate stunning color palettes using AI. Perfect for web design, branding, and creative projects.',
    keywords: ['ai color palette', 'color generator', 'color scheme', 'design colors']
  },

  // Security Tools
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes for text and files. Verify data integrity.',
    category: 'security',
    slug: 'hash-generator',
    icon: '🔐',
    featured: false,
    popular: true,
    premium: false,
    tags: ['hash', 'md5', 'sha256', 'security', 'checksum'],
    seoTitle: 'Hash Generator - Generate MD5, SHA256 Hashes Online',
    seoDescription: 'Generate cryptographic hashes online. Support for MD5, SHA-1, SHA-256, SHA-512. Verify file integrity and data security.',
    keywords: ['hash generator', 'md5 generator', 'sha256 generator', 'checksum calculator']
  },
  {
    id: 'password-strength-checker',
    name: 'Password Strength Checker',
    description: 'Check password strength and security. Get suggestions to improve password safety.',
    category: 'security',
    slug: 'password-strength-checker',
    icon: '🛡️',
    featured: false,
    popular: true,
    premium: false,
    tags: ['password', 'security', 'strength', 'checker', 'safety'],
    seoTitle: 'Password Strength Checker - Test Password Security',
    seoDescription: 'Check password strength online. Analyze password security and get tips to create stronger, safer passwords.',
    keywords: ['password strength checker', 'password security', 'strong password', 'password test']
  },

  // Advanced Image Tools
  {
    id: 'image-watermark-remover',
    name: 'Image Watermark Remover',
    description: 'Remove watermarks from images using advanced AI algorithms. Clean up your photos.',
    category: 'image',
    slug: 'image-watermark-remover',
    icon: '🧽',
    featured: true,
    popular: true,
    premium: true,
    tags: ['watermark', 'remove', 'clean', 'ai', 'photo'],
    seoTitle: 'AI Watermark Remover - Remove Watermarks from Images',
    seoDescription: 'Remove watermarks from images using AI. Clean up photos and remove unwanted text or logos automatically.',
    keywords: ['watermark remover', 'remove watermark', 'clean image', 'ai photo editor']
  },
  {
    id: 'image-upscaler',
    name: 'AI Image Upscaler',
    description: 'Upscale images using AI to increase resolution while maintaining quality.',
    category: 'image',
    slug: 'image-upscaler',
    icon: '📈',
    featured: true,
    popular: true,
    premium: true,
    tags: ['upscale', 'ai', 'resolution', 'enhance', 'quality'],
    seoTitle: 'AI Image Upscaler - Increase Image Resolution with AI',
    seoDescription: 'Upscale images using AI technology. Increase image resolution and enhance quality while preserving details.',
    keywords: ['ai image upscaler', 'increase resolution', 'enhance image', 'ai upscale']
  },

  // Generator Tools
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate RFC 4122 version 4 UUIDs. Create multiple at once and copy or download.',
    category: 'generator',
    slug: 'uuid-generator',
    icon: '🆔',
    featured: false,
    popular: true,
    premium: false,
    tags: ['uuid', 'generator', 'id'],
    seoTitle: 'UUID Generator - Create RFC4122 v4 UUIDs',
    seoDescription: 'Generate secure random UUIDs (v4) online and copy or download the list.',
    keywords: ['uuid generator', 'random uuid', 'guid']
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for text, URLs, WiFi, contacts, and more. Customize colors and download as PNG.',
    category: 'generator',
    slug: 'qr-code-generator',
    icon: '📱',
    featured: true,
    popular: true,
    premium: false,
    tags: ['qr code', 'generator', 'text', 'url', 'wifi', 'contact'],
    seoTitle: 'QR Code Generator - Create QR Codes Online Free',
    seoDescription: 'Generate QR codes online for free. Create QR codes for text, URLs, WiFi, contacts, and more with customizable colors.',
    keywords: ['qr code generator', 'create qr code', 'qr generator', 'qr code maker']
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with customizable length and character sets. Include symbols, numbers, and letters.',
    category: 'generator',
    slug: 'password-generator',
    icon: '🔑',
    featured: false,
    popular: true,
    premium: false,
    tags: ['password', 'generator', 'secure', 'random', 'symbols'],
    seoTitle: 'Password Generator - Create Secure Passwords Online',
    seoDescription: 'Generate secure passwords online for free. Customize length and character sets including symbols, numbers, and letters.',
    keywords: ['password generator', 'secure password', 'random password', 'password creator']
  },
];

export const IMPLEMENTED_SLUGS = new Set<string>([
  'image-compressor',
  'image-resizer',
  'pdf-merger',
  'pdf-splitter',
  'image-format-converter',
  'csv-to-json-converter',
  'word-counter',
  'text-case-converter',
  'json-formatter',
  'url-encoder-decoder',
  'base64-encoder-decoder',
  'qr-code-generator',
  'password-generator',
  'hash-generator',
  'password-strength-checker',
  'background-remover',
  'uuid-generator',
]);

export const implementedTools: Tool[] = tools.filter(t => IMPLEMENTED_SLUGS.has(t.slug));

// Helper functions
export const getFeaturedTools = (): Tool[] => {
  return tools.filter(tool => tool.featured);
};

export const getPopularTools = (): Tool[] => {
  return tools.filter(tool => tool.popular).slice(0, 8);
};

export const getToolsByCategory = (category: string): Tool[] => {
  return tools.filter(tool => tool.category === category);
};

export const getToolBySlug = (slug: string): Tool | undefined => {
  return tools.find(tool => tool.slug === slug);
};

export const getToolCategories = () => {
  const categories = Array.from(new Set(tools.map(tool => tool.category)));
  return categories.map(category => ({
    id: category,
    name: category.charAt(0).toUpperCase() + category.slice(1),
    count: tools.filter(tool => tool.category === category).length
  }));
};

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
