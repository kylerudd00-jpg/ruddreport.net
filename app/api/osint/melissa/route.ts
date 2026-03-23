import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const first = searchParams.get('first') || '';
  const last = searchParams.get('last') || '';
  const state = searchParams.get('state') || '';

  if (!first || !last) return NextResponse.json({ results: [] });

  const params = new URLSearchParams({
    id: process.env.MELISSA_API_KEY || '',
    first,
    last,
    state,
    ctry: 'US',
    act: 'Check,Verify,Append,Move',
    cols: 'grpPhone,grpCensus,grpDemographics',
    format: 'json',
  });
  if (!state) params.delete('state');

  try {
    const url = `https://personator.melissadata.net/v3/WEB/ContactVerify/doContactVerify?${params}`;
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(`Melissa ${r.status}`);
    const data = await r.json();
    // Melissa returns a single record (flat object), not an array
    return NextResponse.json({ record: data });
  } catch (e: any) {
    return NextResponse.json({ record: null, error: e?.message }, { status: 502 });
  }
}
