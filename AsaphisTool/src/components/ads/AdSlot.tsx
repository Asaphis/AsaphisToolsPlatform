'use client';

import { useEffect, useState } from 'react';
import DirectAd from '@/components/ads/DirectAd';
import { AdBanner, AdSlotType } from '@/components/ui/AdBanner';

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
}

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  const directEnabled = (process.env.NEXT_PUBLIC_DIRECT_ADS_ENABLED || '').toLowerCase() === 'true';
  const [cfg, setCfg] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const url = base.startsWith('http') ? `${base}/ads` : '/api/ads';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const ads = (json.ads || []).filter((a: any) => a.provider === 'direct' && a.status === 'active');
        const pick = ads.find((a: any) => (a.slot_id || '').toLowerCase() === slot.toLowerCase());
        if (!cancelled) setCfg(pick);
      } catch {}
    };
    if (directEnabled) load();
    return () => { cancelled = true; };
  }, [slot, directEnabled]);

  if (directEnabled && cfg?.html) {
    return <DirectAd slot={slot} config={{ html: cfg.html, width: '100%', height: 250, enabled: true }} className={className} />;
  }

  return <AdBanner slot={slot} className={className} />; // falls back to AdSense
}
