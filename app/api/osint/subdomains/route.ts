import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) return NextResponse.json({ error: 'No domain provided' }, { status: 400 });

  try {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    const res = await fetch(`https://crt.sh/?q=%.${clean}&output=json`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('crt.sh unavailable');
    const data = await res.json();

    // Deduplicate and clean
    const seen = new Set<string>();
    const subdomains: { name: string; issuer: string; notBefore: string; notAfter: string }[] = [];
    for (const entry of data) {
      const names: string[] = (entry.name_value || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
      for (const name of names) {
        if (!seen.has(name)) {
          seen.add(name);
          subdomains.push({
            name,
            issuer: entry.issuer_name || '',
            notBefore: entry.not_before || '',
            notAfter: entry.not_after || '',
          });
        }
      }
    }

    subdomains.sort((a, b) => a.name.localeCompare(b.name));
    const trimmed = subdomains.slice(0, 500);
    return NextResponse.json({ domain: clean, total: subdomains.length, count: trimmed.length, subdomains: trimmed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to query certificate transparency logs' }, { status: 500 });
  }
}
