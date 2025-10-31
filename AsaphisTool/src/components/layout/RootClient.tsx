'use client';

import { HeaderNew as Header } from '@/components/layout/Header.new';
import { FooterNew as Footer } from '@/components/layout/Footer.new';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import AdSense from '@/components/ads/AdSense';
import CookieConsent from '@/components/consent/CookieConsent';

export default function RootClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      <AdSense />
      <CookieConsent />
    </ThemeProvider>
  );
}
