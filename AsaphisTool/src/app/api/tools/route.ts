import { NextResponse } from 'next/server';
import { fetchToolsServer } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tools = await fetchToolsServer();
    return NextResponse.json({ tools }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ tools: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
