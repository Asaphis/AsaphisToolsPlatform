import { NextResponse } from 'next/server';
import { implementedTools } from '@/data/tools';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ tools: implementedTools }, { headers: { 'Cache-Control': 'no-store' } });
}
