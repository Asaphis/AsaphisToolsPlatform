'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

export function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script strategy="lazyOnload" id="ga-script">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Hook for tracking events
export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  };

  const trackToolUsage = (toolName: string, action: string) => {
    trackEvent('tool_usage', {
      tool_name: toolName,
      action: action,
      timestamp: new Date().toISOString()
    });
  };

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  };

  const trackDownload = (toolName: string, fileType: string) => {
    trackEvent('download', {
      tool_name: toolName,
      file_type: fileType
    });
  };

  return {
    trackEvent,
    trackToolUsage,
    trackSearch,
    trackDownload
  };
};
