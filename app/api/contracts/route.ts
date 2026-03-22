import { NextResponse } from 'next/server';

async function fetchAwards(recipient: string, awardTypeCodes: string[]) {
  const body = {
    filters: {
      recipient_search_text: [recipient],
      award_type_codes: awardTypeCodes,
    },
    fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Awarding Agency', 'Award Type', 'Start Date', 'Description'],
    page: 1,
    limit: 30,
    sort: 'Award Amount',
    order: 'desc',
    subawards: false,
  };

  const res = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`USASpending HTTP ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  return { results: data.results ?? [], total: data.page_metadata?.total ?? 0 };
}

const CONTRACT_CODES = ['A', 'B', 'C', 'D'];
const GRANT_CODES = ['02', '03', '04', '05'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const tab = searchParams.get('tab') || 'all'; // 'all' | 'contracts' | 'grants'
  if (!query.trim()) return NextResponse.json({ error: 'No query' }, { status: 400 });

  try {
    if (tab === 'contracts') {
      const data = await fetchAwards(query.trim(), CONTRACT_CODES);
      return NextResponse.json(data);
    }

    if (tab === 'grants') {
      const data = await fetchAwards(query.trim(), GRANT_CODES);
      return NextResponse.json(data);
    }

    // "All" — run both in parallel and merge, sorted by Award Amount desc
    const [contractsResult, grantsResult] = await Promise.allSettled([
      fetchAwards(query.trim(), CONTRACT_CODES),
      fetchAwards(query.trim(), GRANT_CODES),
    ]);

    const contracts = contractsResult.status === 'fulfilled' ? contractsResult.value.results : [];
    const grants = grantsResult.status === 'fulfilled' ? grantsResult.value.results : [];
    const contractsTotal = contractsResult.status === 'fulfilled' ? contractsResult.value.total : 0;
    const grantsTotal = grantsResult.status === 'fulfilled' ? grantsResult.value.total : 0;

    const merged = [...contracts, ...grants].sort(
      (a, b) => (b['Award Amount'] ?? 0) - (a['Award Amount'] ?? 0)
    ).slice(0, 30);

    return NextResponse.json({ results: merged, total: contractsTotal + grantsTotal });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
