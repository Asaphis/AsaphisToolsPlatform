'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import AdSense from '@/components/ads/AdSense';
import CookieConsent from '@/components/consent/CookieConsent';

export default function RootClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <AdSense />
      <CookieConsent />
    </ThemeProvider>
  );
}
