import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lei = searchParams.get('lei');
  if (!query && !lei) return NextResponse.json({ error: 'No query provided' }, { status: 400 });

  try {
    if (lei) {
      const [entityRes, parentRes, ultimateRes, childrenRes] = await Promise.all([
        fetch(`https://api.gleif.org/api/v1/lei-records/${lei}`),
        fetch(`https://api.gleif.org/api/v1/lei-records/${lei}/direct-parent`),
        fetch(`https://api.gleif.org/api/v1/lei-records/${lei}/ultimate-parent`),
        fetch(`https://api.gleif.org/api/v1/lei-records/${lei}/direct-children?page[size]=10`),
      ]);

      const entity = await entityRes.json();
      const parent = parentRes.ok ? await parentRes.json() : null;
      const ultimate = ultimateRes.ok ? await ultimateRes.json() : null;
      const children = childrenRes.ok ? await childrenRes.json() : null;

      return NextResponse.json({
        entity: entity.data,
        parent: parent?.data || null,
        ultimate: ultimate?.data || null,
        children: children?.data || [],
        childrenTotal: children?.meta?.pagination?.total || 0,
      });
    }

    const res = await fetch(
      `https://api.gleif.org/api/v1/lei-records?filter[entity.names]=${encodeURIComponent(query!)}&page[size]=20`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const records: any[] = data.data || [];
    const q = query!.toLowerCase().trim();

    const COUNTRY_RANK: Record<string, number> = {
      US: 0, GB: 1, DE: 1, CA: 1, AU: 1, JP: 1, NL: 2, IE: 2, CH: 2, SE: 2, SG: 2, FR: 2,
    };

    const score = (r: any) => {
      const name = (r.attributes?.entity?.legalName?.name || '').toLowerCase();
      const country = r.attributes?.entity?.legalAddress?.country || '';
      const category = r.attributes?.entity?.category || 'GENERAL';
      const active = r.attributes?.entity?.status === 'ACTIVE' ? 0 : 1;

      // Funds and branches are almost never what someone is searching for
      const categoryPenalty = category === 'FUND' ? 50000 : category === 'BRANCH' ? 20000 : 0;

      // Name match tier: exact=0, starts-with=10000, contains=20000
      const nameTier = name === q ? 0 : name.startsWith(q) ? 10000 : 20000;

      // Country score
      const countryScore = (COUNTRY_RANK[country] ?? 3) * 100;

      // Subsidiaries (have a direct parent) rank below parent companies
      const hasParent = !!r.relationships?.['direct-parent']?.links?.['relationship-record'];
      const subsidiaryPenalty = hasParent ? 500 : 0;

      // Older companies are more established — use creation year as proxy for size
      const creationYear = r.attributes?.entity?.creationDate
        ? new Date(r.attributes.entity.creationDate).getFullYear()
        : 2020;
      const agePenalty = Math.max(0, creationYear - 1990) * 2;

      return categoryPenalty + nameTier + countryScore + subsidiaryPenalty + agePenalty + active;
    };

    const sorted = records.sort((a: any, b: any) => score(a) - score(b));

    return NextResponse.json({ data: sorted.slice(0, 8), total: data.meta?.pagination?.total || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lookup failed' }, { status: 500 });
  }
}