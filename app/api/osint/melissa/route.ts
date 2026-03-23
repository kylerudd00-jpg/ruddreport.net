import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const first = searchParams.get('first') || '';
  const last = searchParams.get('last') || '';
  const state = searchParams.get('state') || '';

  if (!first || !last) return NextResponse.json({ record: null });

  const key = process.env.MELISSA_API_KEY || '';
  if (!key) {
    return NextResponse.json({ record: null, error: 'MELISSA_API_KEY not configured' });
  }

  const params = new URLSearchParams({
    id: key,
    first,
    last,
    ctry: 'US',
    act: 'Check,Verify,Append,Move',
    cols: 'grpPhone,grpCensus,grpDemographics',
    format: 'json',
  });
  if (state) params.set('state', state);

  try {
    const url = `https://personator.melissadata.net/v3/WEB/ContactVerify/doContactVerify?${params}`;
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) throw new Error(`Melissa ${r.status}`);
    const data = await r.json();

    // Melissa returns { TransmissionResults, Records: [...] }
    const transmissionResults: string = data.TransmissionResults || '';
    // GS01 = empty license, GS02 = invalid license, GS03 = license expired
    if (transmissionResults.includes('GS01') || transmissionResults.includes('GS02') || transmissionResults.includes('GS03')) {
      return NextResponse.json({ record: null, error: `Invalid or expired API key (${transmissionResults})` });
    }

    const record = Array.isArray(data.Records) ? data.Records[0] : null;
    return NextResponse.json({ record, transmissionResults });
  } catch (e: any) {
    return NextResponse.json({ record: null, error: e?.message }, { status: 502 });
  }
}
