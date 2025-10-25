import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Bridge disabled: we're calling the real backend directly now.
export async function GET() {
  return NextResponse.json({ error: 'Bridge disabled. Frontend calls backend directly.' }, { status: 404 });
}
export async function POST() {
  return NextResponse.json({ error: 'Bridge disabled. Frontend calls backend directly.' }, { status: 404 });
}
export async function PUT() {
  return NextResponse.json({ error: 'Bridge disabled. Frontend calls backend directly.' }, { status: 404 });
}
export async function DELETE() {
  return NextResponse.json({ error: 'Bridge disabled. Frontend calls backend directly.' }, { status: 404 });
}
