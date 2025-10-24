import { NextResponse } from 'next/server';
import { implementedTools } from '@/data/tools';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = Array.from(new Set(implementedTools.map(t => t.category))).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
  }));
  return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } });
}
