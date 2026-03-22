import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  try {
    const clean = url.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
    const fromYear = req.nextUrl.searchParams.get('from') ?? '';
    const toYear   = req.nextUrl.searchParams.get('to')   ?? '';

    // Default: last 5 years so results are modern. User can override with explicit year range.
    const defaultFrom = String(new Date().getFullYear() - 5);
    const from = fromYear || defaultFrom;
    const to   = toYear   || '';

    const buildParams = (u: string) => {
      const p = new URLSearchParams({
        url: u, output: 'json', fl: 'timestamp,statuscode,mimetype', limit: '200',
      });
      p.set('from', from + '0101');
      if (to) p.set('to', to + '1231');
      return p.toString();
    };

    const cdx = (u: string) =>
      fetch(`https://web.archive.org/cdx/search/cdx?${buildParams(u)}`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(25000) });

    const [r1, r2] = await Promise.allSettled([cdx(clean), cdx(`www.${clean}`)]);

    const parse = async (r: PromiseSettledResult<Response>): Promise<string[][]> => {
      if (r.status !== 'fulfilled' || !r.value.ok) return [];
      const rows: string[][] = await r.value.json();
      return Array.isArray(rows) && rows.length > 1 ? rows.slice(1) : [];
    };

    const [rows1, rows2] = await Promise.all([parse(r1), parse(r2)]);

    const seen = new Set<string>();
    const merged = [...rows1, ...rows2]
      .filter(r => { if (seen.has(r[0])) return false; seen.add(r[0]); return true; })
      .sort((a, b) => b[0].localeCompare(a[0])) // newest first
      .slice(0, 150);

    return NextResponse.json({ data: [['timestamp', 'statuscode', 'mimetype'], ...merged], url: clean });
  } catch (e: any) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out — try a narrower date range.' }, { status: 504 });
    }
    return NextResponse.json({ error: e.message || 'Failed to query the Wayback Machine' }, { status: 500 });
  }
}
