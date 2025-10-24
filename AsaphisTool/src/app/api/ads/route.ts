import { NextResponse } from 'next/server';
import { directAds } from '@/data/directAds';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Map local directAds config into a simple ads array compatible with AdSlot
  const ads = Object.entries(directAds).flatMap(([slot, cfg]) => {
    if (!cfg || !cfg.enabled) return [] as any[];
    return [{
      provider: 'direct',
      status: 'active',
      slot_id: slot,
      html: cfg.html,
      width: cfg.width ?? '100%',
      height: cfg.height ?? 250,
    }];
  });
  return NextResponse.json({ ads }, { headers: { 'Cache-Control': 'no-store' } });
}
