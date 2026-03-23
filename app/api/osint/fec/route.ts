import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || '';
  const state = searchParams.get('state') || '';
  if (!name) return NextResponse.json({ results: [] });

  const params = new URLSearchParams({
    contributor_name: name,
    api_key: process.env.FEC_API_KEY || 'DEMO_KEY',
    per_page: '20',
    sort: '-contribution_receipt_date',
  });
  if (state) params.set('contributor_state', state);

  try {
    const url = `https://api.open.fec.gov/v1/schedules/schedule_a/?${params}`;
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (r.status === 429) throw new Error('FEC_RATE_LIMIT');
    if (!r.ok) throw new Error(`FEC ${r.status}`);
    const data = await r.json();
    return NextResponse.json({ results: data.results || [], pagination: data.pagination });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: e?.message }, { status: 502 });
  }
}
