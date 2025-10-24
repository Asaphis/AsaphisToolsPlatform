'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'consent_v2';

type ConsentState = 'granted' | 'denied' | 'unset';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ConsentState>('unset');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'granted' || saved === 'denied') {
      setState(saved);
      updateConsent(saved);
    } else {
      setOpen(true);
    }
  }, []);

  const updateConsent = (consent: Exclude<ConsentState, 'unset'>) => {
    // Update Google Consent Mode
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: consent,
        ad_user_data: consent,
        ad_personalization: consent,
        analytics_storage: consent,
      });
    }
  };

  const acceptAll = () => {
    localStorage.setItem(STORAGE_KEY, 'granted');
    setState('granted');
    updateConsent('granted');
    setOpen(false);
  };

  const rejectAll = () => {
    localStorage.setItem(STORAGE_KEY, 'denied');
    setState('denied');
    updateConsent('denied');
    setOpen(false);
  };

  if (!open || state !== 'unset') return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-3xl m-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            We use cookies to deliver and measure ads. Choose whether we can use your data for personalized ads. You can change your choice anytime in your browser.
          </div>
          <div className="flex gap-2">
            <button onClick={rejectAll} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              Reject all
            </button>
            <button onClick={acceptAll} className="px-3 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm">
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}