import { NextResponse } from 'next/server';
import { fetchCategoriesServer } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await fetchCategoriesServer();
    return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
