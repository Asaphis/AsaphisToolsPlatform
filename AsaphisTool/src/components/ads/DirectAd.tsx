'use client';

import { useEffect, useRef } from 'react';
type AdSlotKey = 'header' | 'sidebar' | 'footer' | 'inContent';
type DirectAdConfigItem = { html: string; width?: number|string; height?: number|string; responsive?: boolean; enabled?: boolean };

interface DirectAdProps {
  slot: AdSlotKey;
  config?: DirectAdConfigItem;
  className?: string;
}

export default function DirectAd({ slot, config, className = '' }: DirectAdProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !config?.html) return;
    // Use srcdoc to sandbox the ad content
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"/></head><body style="margin:0">${config.html}</body></html>`;
  }, [config?.html]);

  if (!config?.enabled) {
    return null;
  }

  if (isDev) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg my-8 ${className}`}
        style={{ width: config.width || '100%', height: config.height || 250, maxWidth: '100%', margin: '2rem auto' }}
      >
        <div className="text-center p-4">
          <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Direct Ad Placeholder ({slot})</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">Add your direct ad HTML in directAds.ts</div>
        </div>
      </div>
    );
  }

  const width = config.responsive ? '100%' : (config.width ?? '100%');
  const height = config.height ?? 250;

  return (
    <div className={`my-8 ${className}`} style={{ width, maxWidth: '100%', margin: '2rem auto' }}>
      <iframe
        ref={iframeRef}
        title={`direct-ad-${slot}`}
        width={typeof width === 'number' ? String(width) : width}
        height={typeof height === 'number' ? String(height) : height}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        loading="lazy"
        style={{ border: 0, display: 'block', margin: '0 auto' }}
      />
    </div>
  );
}