import { NextResponse } from 'next/server';

// Wikidata properties we care about
const PROPS: Record<string, string> = {
  P31: 'type',
  P106: 'occupation',
  P27: 'citizenship',
  P569: 'born',
  P570: 'died',
  P19: 'birthplace',
  P108: 'employer',
  P102: 'party',
  P39: 'positions',
  P856: 'website',
  P17: 'country',
  P159: 'headquarters',
  P571: 'founded',
  P576: 'dissolved',
  P452: 'industry',
  P169: 'ceo',
  P112: 'foundedBy',
  P749: 'parentOrg',
  P414: 'stockExchange',
  P1454: 'legalForm',
};

function formatTime(time: string): string {
  const m = time.match(/[+-]?(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return time;
  const [, y, mo, d] = m;
  if (mo === '00') return y;
  if (d === '00') return `${y}-${mo}`;
  try {
    return new Date(`${y}-${mo}-${d}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return `${y}-${mo}-${d}`; }
}

async function searchWikidata(query: string) {
  try {
    const searchRes = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1`,
      { signal: AbortSignal.timeout(6000) }
    );
    const searchData = await searchRes.json();
    const top = searchData.search?.[0];
    if (!top) return null;

    const qid = top.id;
    const entityRes = await fetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
      { signal: AbortSignal.timeout(8000) }
    );
    const entityData = await entityRes.json();
    const entity = entityData.entities[qid];
    const claims = entity.claims || {};

    const qidsToResolve = new Set<string>();
    const rawValues: Record<string, any[]> = {};

    for (const [prop, key] of Object.entries(PROPS)) {
      const propClaims = claims[prop];
      if (!propClaims) continue;
      const values = propClaims
        .filter((c: any) => c.rank !== 'deprecated')
        .slice(0, 5)
        .map((c: any) => {
          const dv = c.mainsnak?.datavalue;
          if (!dv) return null;
          if (dv.type === 'wikibase-entityid') { qidsToResolve.add(dv.value.id); return { qid: dv.value.id }; }
          if (dv.type === 'time') return { time: dv.value.time };
          if (dv.type === 'string') return { string: dv.value };
          if (dv.type === 'monolingualtext') return { string: dv.value.text };
          return null;
        })
        .filter(Boolean);
      if (values.length) rawValues[key] = values;
    }

    // Batch-resolve QID labels
    const qidArray = Array.from(qidsToResolve);
    const labels: Record<string, string> = {};
    for (let i = 0; i < qidArray.length; i += 50) {
      const batch = qidArray.slice(i, i + 50).join('|');
      const lr = await fetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch}&props=labels&languages=en&format=json`,
        { signal: AbortSignal.timeout(6000) }
      );
      const ld = await lr.json();
      for (const [id, e] of Object.entries(ld.entities as Record<string, any>)) {
        labels[id] = e.labels?.en?.value || id;
      }
    }

    const resolve = (v: any): string | null => {
      if (v.qid) return labels[v.qid] || null;
      if (v.time) return formatTime(v.time);
      if (v.string) return v.string;
      return null;
    };

    const facts: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(rawValues)) {
      const resolved = values.map(resolve).filter(Boolean) as string[];
      if (resolved.length) facts[key] = resolved;
    }

    // Determine entity kind from P31 (instance of)
    const types = (facts.type || []).map(t => t.toLowerCase());
    const isPerson = types.some(t => t.includes('human') || t.includes('person') || t.includes('politician') || t.includes('athlete'));

    return {
      qid,
      label: top.label || entity.labels?.en?.value,
      description: top.description || entity.descriptions?.en?.value,
      facts,
      isPerson,
      wikidataUrl: `https://www.wikidata.org/wiki/${qid}`,
    };
  } catch {
    return null;
  }
}

async function searchWikipedia(query: string) {
  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&format=json&origin=*`,
      { signal: AbortSignal.timeout(8000) }
    );
    const searchData = await searchRes.json();
    const titles: string[] = searchData[1] || [];
    if (!titles.length) return null;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[0])}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!summaryRes.ok) return null;
    const s = await summaryRes.json();
    return {
      title: s.title,
      description: s.description || null,
      extract: s.extract || null,
      thumbnail: s.thumbnail?.source || null,
      url: s.content_urls?.desktop?.page || null,
      suggestions: titles.slice(1, 5),
    };
  } catch { return null; }
}

async function searchOpenCorporates(query: string) {
  try {
    const res = await fetch(
      `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(query)}&per_page=5`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.results?.companies || []).map((c: any) => ({
      name: c.company?.name,
      number: c.company?.company_number,
      jurisdiction: c.company?.jurisdiction_code?.toUpperCase(),
      status: c.company?.current_status,
      incorporated: c.company?.incorporation_date,
      url: c.company?.opencorporates_url,
    }));
  } catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  if (!query.trim()) return NextResponse.json({ found: false });

  const [wikiResult, wikidataResult, corpResult] = await Promise.allSettled([
    searchWikipedia(query),
    searchWikidata(query),
    searchOpenCorporates(query),
  ]);

  const wiki = wikiResult.status === 'fulfilled' ? wikiResult.value : null;
  const wikidata = wikidataResult.status === 'fulfilled' ? wikidataResult.value : null;
  const corporations = corpResult.status === 'fulfilled' ? corpResult.value : [];

  const found = !!(wiki || wikidata);

  return NextResponse.json({ found, wiki, wikidata, corporations });
}
