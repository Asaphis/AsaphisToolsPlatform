'use client';

import { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  slot: 'header' | 'sidebar' | 'footer' | 'inContent';
  className?: string;
}

const SLOT_ENV_MAP: Record<AdBannerProps['slot'], string> = {
  header: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER || '',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || '',
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER || '',
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT || '',
};

export function AdBanner({ slot, className = '' }: AdBannerProps) {
  const adConfig = {
    header: {
      width: '728px',
      height: '90px',
      text: 'Advertisement - 728x90',
      description: 'Leaderboard banner ad space',
    },
    sidebar: {
      width: '300px',
      height: '250px',
      text: 'Advertisement - 300x250',
      description: 'Medium rectangle ad space',
    },
    footer: {
      width: '728px',
      height: '90px',
      text: 'Advertisement - 728x90',
      description: 'Footer banner ad space',
    },
    inContent: {
      width: '100%',
      height: '280px',
      text: 'Advertisement',
      description: 'In-content responsive ad space',
    },
  } as const;

  const config = adConfig[slot];
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Lazy render only when visible
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { rootMargin: '200px 0px' }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (isDevelopment) {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg my-8 ${className}`}
        style={{
          width: config.width,
          height: config.height,
          maxWidth: '100%',
          margin: slot === 'inContent' ? '2rem auto' : '2rem auto',
        }}
      >
        <div className="text-center p-4">
          <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">{config.text}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{config.description}</div>
        </div>
      </div>
    );
  }

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '';
  const adSlot = SLOT_ENV_MAP[slot];

  // If no publisher configured, render nothing in prod to avoid policy issues
  if (!publisherId) return null;

  return (
    <div
      ref={ref}
      className={`my-8 ${className}`}
      style={{ width: config.width as string, maxWidth: '100%', margin: '2rem auto' }}
    >
      {visible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={`ca-pub-${publisherId.replace(/^ca-pub-/, '')}`}
          {...(adSlot ? { 'data-ad-slot': adSlot } : {})}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
      {visible && (
        <script dangerouslySetInnerHTML={{ __html: '(adsbygoogle=window.adsbygoogle||[]).push({});' }} />
      )}
    </div>
  );
}
