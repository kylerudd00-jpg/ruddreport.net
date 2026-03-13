import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = (searchParams.get('id') || '').trim();
  const keyword = (searchParams.get('keyword') || '').trim();

  if (!id && !keyword) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  let apiUrl: string;
  if (id) {
    apiUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(id)}`;
  } else {
    apiUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=10`;
  }

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) });
    if (res.status === 404) return NextResponse.json({ totalResults: 0, vulnerabilities: [] });
    if (!res.ok) return NextResponse.json({ error: `NVD API error: ${res.status}` }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to reach NVD' }, { status: 500 });
  }
}
