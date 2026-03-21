import { NextResponse } from 'next/server';

const cache = new Map<string, { data: any; ts: number }>();
const TTL = 10 * 60 * 1000; // 10 minutes

function cached(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  return data;
}
function fromCache(key: string) {
  const c = cache.get(key);
  return c && Date.now() - c.ts < TTL ? c.data : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icao24 = searchParams.get('icao24')?.toLowerCase().trim();
  const callsign = searchParams.get('callsign')?.trim().toUpperCase();

  const result: any = {};

  // Aircraft registration, type, airline by ICAO24
  if (icao24) {
    const key = `ac-${icao24}`;
    const hit = fromCache(key);
    if (hit !== null) {
      result.aircraft = hit;
    } else {
      try {
        const res = await fetch(`https://api.adsbdb.com/v0/aircraft/${icao24}`, {
          headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
          signal: AbortSignal.timeout(4000),
        });
        const data = await res.json();
        result.aircraft = cached(key, data.response?.aircraft ?? null);
      } catch {
        result.aircraft = null;
      }
    }
  }

  // Flight route (origin + destination) by callsign
  if (callsign) {
    const key = `cs-${callsign}`;
    const hit = fromCache(key);
    if (hit !== null) {
      result.route = hit;
    } else {
      try {
        const res = await fetch(`https://api.adsbdb.com/v0/callsign/${callsign}`, {
          headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
          signal: AbortSignal.timeout(4000),
        });
        const data = await res.json();
        result.route = cached(key, data.response?.flightroute ?? null);
      } catch {
        result.route = null;
      }
    }
  }

  return NextResponse.json(result);
}
