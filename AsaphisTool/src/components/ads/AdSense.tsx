'use client';

import Script from 'next/script';

export default function AdSense() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '';

  // No script if not configured
  if (!publisherId) return null;

  return (
    <>
      {/* Consent Mode default (deny) until user acts; CookieConsent updates it */}
      <Script id="consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);} 
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
          });
        `}
      </Script>
      {/* AdSense Auto Ads */}
      <Script
        id="adsbygoogle-loader"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${publisherId.replace(/^ca-pub-/, '')}`}
        crossOrigin="anonymous"
      />
    </>
  );
}