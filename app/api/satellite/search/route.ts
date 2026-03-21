import { NextResponse } from 'next/server';

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php';

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

const activeCache: { data: any[] | null; ts: number } = { data: null, ts: 0 };
const TTL = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim().toUpperCase();
  if (!query) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  // Try NORAD ID lookup first
  if (/^\d{5}$/.test(query)) {
    try {
      const res = await fetch(`${CELESTRAK_BASE}?CATNR=${query}&FORMAT=TLE`, {
        headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
      });
      const text = await res.text();
      if (!text.includes('No TLE found')) {
        const sats = parseTLE(text);
        if (sats.length > 0) return NextResponse.json({ results: sats.slice(0, 10) });
      }
    } catch {}
  }

  // Load active satellite list and filter
  if (!activeCache.data || Date.now() - activeCache.ts > TTL) {
    try {
      const res = await fetch(`${CELESTRAK_BASE}?GROUP=active&FORMAT=TLE`, {
        headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
      });
      const text = await res.text();
      activeCache.data = parseTLE(text);
      activeCache.ts = Date.now();
    } catch {
      return NextResponse.json({ error: 'Failed to fetch satellite database' }, { status: 500 });
    }
  }

  const results = (activeCache.data || [])
    .filter(s => s.name.toUpperCase().includes(query) || s.noradId === query)
    .slice(0, 15);

  return NextResponse.json({ results });
}
