import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  try {
    const clean = url.trim().replace(/^https?:\/\//, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(clean)}&output=json&limit=50&fl=timestamp,statuscode,mimetype&reverse=on`,
      { headers: { 'Accept': 'application/json' }, signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) throw new Error('Wayback Machine unavailable');
    const data = await res.json();
    return NextResponse.json({ data, url: clean });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to query the Wayback Machine' }, { status: 500 });
  }
}
