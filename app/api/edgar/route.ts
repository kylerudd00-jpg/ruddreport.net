import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const forms = searchParams.get('forms') || '';
  if (!q.trim()) return NextResponse.json({ error: 'No query' }, { status: 400 });

  const params = new URLSearchParams({ q: `"${q.trim()}"` });
  if (forms) params.set('forms', forms);

  try {
    const res = await fetch(`https://efts.sec.gov/LATEST/search-index?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OSINT-Tool/1.0)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `EDGAR HTTP ${res.status}: ${errText.slice(0, 200)}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
