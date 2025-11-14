import { Tool } from '@/types';

export const generateWebsiteStructuredData = () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://asaphistools.onrender.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AsaPhisTool',
    description: 'Free online tools and utilities for productivity and creativity. Compress images, edit PDFs, generate QR codes, and much more.',
    url: base,
    sameAs: [
      'https://twitter.com/asaphistool',
      'https://github.com/asaphistool',
      'https://linkedin.com/company/asaphistool'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

export const generateOrganizationStructuredData = () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://asaphistools.onrender.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AsaPhis',
    description: 'Technology company providing free online tools and utilities',
    url: base,
    logo: `${base}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@asaphis.com'
    },
    sameAs: [
      'https://twitter.com/asaphistool',
      'https://github.com/asaphistool',
      'https://linkedin.com/company/asaphistool'
    ]
  };
};

export const generateToolStructuredData = (tool: Tool) => {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://asaphistools.onrender.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `${base}/tools/${tool.slug}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: tool.tags,
    screenshot: `${base}/screenshots/${tool.slug}.png`,
    author: {
      '@type': 'Organization',
      name: 'AsaPhis'
    },
    datePublished: '2024-01-01',
    inLanguage: 'en'
  };
};

export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

export const generateFAQStructuredData = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};
