import { NextResponse } from 'next/server';

let cache: { data: any; ts: number } | null = null;
const TTL = 30_000;

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(cache.data);
  }
  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
    });
    if (!res.ok) throw new Error('OpenSky error');
    const data = await res.json();
    cache = { data, ts: Date.now() };
    return NextResponse.json(data);
  } catch {
    if (cache) return NextResponse.json(cache.data);
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}
