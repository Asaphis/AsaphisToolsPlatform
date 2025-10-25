import { Tool } from '@/types';

export const generateWebsiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AsaPhisTool',
    description: 'Free online tools and utilities for productivity and creativity. Compress images, edit PDFs, generate QR codes, and much more.',
    url: 'https://asaphistool.com',
    sameAs: [
      'https://twitter.com/asaphistool',
      'https://github.com/asaphistool',
      'https://linkedin.com/company/asaphistool'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://asaphistool.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AsaPhis',
    description: 'Technology company providing free online tools and utilities',
    url: 'https://asaphistool.com',
    logo: 'https://asaphistool.com/logo.png',
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
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: `https://asaphistool.com/tools/${tool.slug}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: tool.tags,
    screenshot: `https://asaphistool.com/screenshots/${tool.slug}.png`,
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
