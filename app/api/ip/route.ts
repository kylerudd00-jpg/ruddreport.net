import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get('ip');
  if (!ip) return NextResponse.json({ error: 'No IP provided' }, { status: 400 });

  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}