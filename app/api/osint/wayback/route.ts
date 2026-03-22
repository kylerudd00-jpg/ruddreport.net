import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  try {
    const clean = url.trim().replace(/^https?:\/\//, '');
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(clean)}&output=json&limit=50&fl=timestamp,statuscode,mimetype&collapse=timestamp:8&filter=statuscode:200&reverse=on`,
      { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(25000) }
    );
    if (!res.ok) throw new Error('Wayback Machine unavailable');
    const data = await res.json();
    return NextResponse.json({ data, url: clean });
  } catch (e: any) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out — the Wayback Machine is slow right now. Try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: e.message || 'Failed to query the Wayback Machine' }, { status: 500 });
  }
}
