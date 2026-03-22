import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  try {
    const clean = url.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
    // Query both bare domain and www — Wayback treats them as separate URLs
    const urls = [clean, `www.${clean}`];
    const cdx = (u: string) =>
      fetch(
        `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(u)}&output=json&limit=150&fl=timestamp,statuscode,mimetype&reverse=on`,
        { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(25000) }
      );

    const [r1, r2] = await Promise.allSettled(urls.map(cdx));

    const parse = async (r: PromiseSettledResult<Response>): Promise<string[][]> => {
      if (r.status !== 'fulfilled' || !r.value.ok) return [];
      const rows: string[][] = await r.value.json();
      return Array.isArray(rows) && rows.length > 1 ? rows.slice(1) : [];
    };

    const [rows1, rows2] = await Promise.all([parse(r1), parse(r2)]);

    // Merge, deduplicate by timestamp, sort newest first, cap at 100
    const seen = new Set<string>();
    const merged = [...rows1, ...rows2]
      .filter(r => { if (seen.has(r[0])) return false; seen.add(r[0]); return true; })
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 100);

    if (merged.length === 0) return NextResponse.json({ data: [], url: clean });

    // Prepend header row to match expected format
    return NextResponse.json({ data: [['timestamp', 'statuscode', 'mimetype'], ...merged], url: clean });
  } catch (e: any) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out — the Wayback Machine is slow right now. Try again.' }, { status: 504 });
    }
    return NextResponse.json({ error: e.message || 'Failed to query the Wayback Machine' }, { status: 500 });
  }
}
