import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/structured-data';
import RootClient from '@/components/layout/RootClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AsaPhisTool - Free Online Tools & Utilities',
    template: '%s | AsaPhisTool'
  },
  description: 'Free online tools and utilities for image compression, PDF editing, text processing, and more. Fast, secure, and no registration required.',
  keywords: [
    'online tools',
    'free utilities',
    'image compressor',
    'pdf tools',
    'text tools',
    'developer tools',
    'image converter',
    'youtube thumbnail downloader',
    'qr code generator',
    'password generator'
  ],
  authors: [{ name: 'AsaPhis' }],
  creator: 'AsaPhis',
  publisher: 'AsaPhis',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://asaphistools.onrender.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://asaphistools.onrender.com',
    title: 'AsaPhisTool - Free Online Tools & Utilities',
    description: 'Free online tools and utilities for image compression, PDF editing, text processing, and more. Fast, secure, and no registration required.',
    siteName: 'AsaPhisTool',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AsaPhisTool - Free Online Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AsaPhisTool - Free Online Tools & Utilities',
    description: 'Free online tools and utilities for image compression, PDF editing, text processing, and more.',
    images: ['/twitter-image.png'],
    creator: '@asaphistool',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AsaPhisTool" />
        <link rel="apple-touch-icon" href="/icon-apple-180.png" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteStructuredData()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationStructuredData()),
          }}
        />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <RootClient>
          {children}
        </RootClient>
      </body>
    </html>
  );
}
