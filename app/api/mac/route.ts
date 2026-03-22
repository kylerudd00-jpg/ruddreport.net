import { NextRequest, NextResponse } from 'next/server';

// In-memory OUI cache: { [oui6hex]: vendorName }
let ouiMap: Record<string, string> | null = null;
let lastFetched = 0;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24h

async function getOuiMap(): Promise<Record<string, string>> {
  if (ouiMap && Date.now() - lastFetched < CACHE_TTL) return ouiMap;

  const res = await fetch('https://standards-oui.ieee.org/oui/oui.csv', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error('Failed to fetch IEEE OUI registry');

  const text = await res.text();
  const map: Record<string, string> = {};

  for (const line of text.split('\n').slice(1)) {
    const parts = line.split(',');
    if (parts.length < 3) continue;
    const assignment = parts[1]?.trim().toUpperCase();
    const org = parts[2]?.trim().replace(/^"|"$/g, '');
    if (assignment && org) map[assignment] = org;
  }

  ouiMap = map;
  lastFetched = Date.now();
  return map;
}

export async function GET(req: NextRequest) {
  const oui = req.nextUrl.searchParams.get('oui')?.toUpperCase().replace(/[^0-9A-F]/g, '');
  if (!oui || oui.length < 6) {
    return NextResponse.json({ error: 'Missing or invalid OUI' }, { status: 400 });
  }

  try {
    const map = await getOuiMap();
    const vendor = map[oui.slice(0, 6)];
    if (!vendor) {
      return NextResponse.json({ error: 'No vendor found for this OUI. May be a private or locally administered address.' }, { status: 404 });
    }
    return NextResponse.json({ vendor });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lookup failed' }, { status: 500 });
  }
}
