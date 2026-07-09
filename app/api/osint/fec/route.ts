import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || '';
  const state = searchParams.get('state') || '';
  if (!name) return NextResponse.json({ results: [] });

  // schedule_a contributor_name search across all cycles is enormous and
  // times out on DEMO_KEY. Scope to the two most recent election cycles and
  // individuals only — dramatically faster and still the relevant data.
  const params = new URLSearchParams({
    contributor_name: name,
    api_key: process.env.FEC_API_KEY || 'DEMO_KEY',
    per_page: '20',
    sort: '-contribution_receipt_date',
    is_individual: 'true',
  });
  params.append('two_year_transaction_period', '2026');
  params.append('two_year_transaction_period', '2024');
  if (state) params.set('contributor_state', state);

  try {
    const url = `https://api.open.fec.gov/v1/schedules/schedule_a/?${params}`;
    const r = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(9000),
    });
    if (r.status === 429) throw new Error('FEC rate limit — set FEC_API_KEY for a higher quota');
    if (!r.ok) throw new Error(`FEC ${r.status}`);
    const data = await r.json();
    return NextResponse.json({ results: data.results || [], pagination: data.pagination });
  } catch (e: any) {
    // Soft-fail (200) so the Address tool still renders its other sources
    // instead of treating FEC as a fatal error.
    const timedOut = /timeout|aborted/i.test(e?.message || '');
    return NextResponse.json({
      results: [],
      error: timedOut ? 'FEC search timed out — try a more specific name or add a state filter.' : (e?.message || 'FEC lookup failed'),
      soft: true,
    });
  }
}
