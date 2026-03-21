import { NextResponse } from 'next/server';

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

const GROUP_MAP: Record<string, string> = {
  stations: 'stations',
  weather: 'weather',
  gps: 'gps-ops',
  glonass: 'glo-ops',
  galileo: 'galileo',
  beidou: 'beidou',
  starlink: 'starlink',
  iridium: 'iridium',
  active: 'active',
  military: 'tle-new',
  amateur: 'amateur',
  'earth-obs': 'earth',
  geo: 'geo',
};

function parseTLE(raw: string) {
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean);
  const satellites: { name: string; line1: string; line2: string; noradId: string }[] = [];
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const name = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];
    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      const noradId = line1.substring(2, 7).trim();
      satellites.push({ name, line1, line2, noradId });
    }
  }
  return satellites;
}

// Simple in-memory cache
const cache: Record<string, { data: any; ts: number }> = {};
const TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') || 'stations';
  const noradId = searchParams.get('noradId');

  if (noradId) {
    const url = `${CELESTRAK_BASE}?CATNR=${noradId}&FORMAT=TLE`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'RuddReport-OSINT/1.0' } });
      const text = await res.text();
      if (text.includes('No TLE found')) return NextResponse.json({ error: 'Satellite not found' }, { status: 404 });
      const satellites = parseTLE(text);
      return NextResponse.json({ satellites });
    } catch {
      return NextResponse.json({ error: 'Failed to fetch TLE data' }, { status: 500 });
    }
  }

  const celestrakGroup = GROUP_MAP[group] || 'stations';
  const cacheKey = celestrakGroup;

  if (cache[cacheKey] && Date.now() - cache[cacheKey].ts < TTL) {
    return NextResponse.json({ satellites: cache[cacheKey].data });
  }

  try {
    const url = `${CELESTRAK_BASE}?GROUP=${celestrakGroup}&FORMAT=TLE`;
    const res = await fetch(url, { headers: { 'User-Agent': 'RuddReport-OSINT/1.0' } });
    const text = await res.text();
    const satellites = parseTLE(text);
    cache[cacheKey] = { data: satellites, ts: Date.now() };
    return NextResponse.json({ satellites });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch TLE data from CelesTrak' }, { status: 500 });
  }
}
