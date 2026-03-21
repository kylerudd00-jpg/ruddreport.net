import { NextResponse } from 'next/server';

const API_KEY = process.env.DATALASTIC_API_KEY || '';
const BASE = 'https://api.datalastic.com/api/endpoint';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name')?.trim();
  const mmsi = searchParams.get('mmsi')?.trim();

  if (!name && !mmsi) {
    return NextResponse.json({ error: 'Provide name or mmsi' }, { status: 400 });
  }
  if (!API_KEY) {
    return NextResponse.json({ error: 'NO_API_KEY' }, { status: 503 });
  }
  try {
    const endpoint = mmsi
      ? `${BASE}/vessel?api-key=${API_KEY}&mmsi=${mmsi}`
      : `${BASE}/vessel_find?api-key=${API_KEY}&name=${encodeURIComponent(name!)}`;
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'RuddReport-OSINT/1.0' },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Vessel lookup failed' }, { status: 500 });
  }
}
