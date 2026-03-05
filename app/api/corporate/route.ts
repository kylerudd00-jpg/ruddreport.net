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
      `https://api.gleif.org/api/v1/lei-records?filter[entity.names]=${encodeURIComponent(query!)}&page[size]=8`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ data: data.data || [], total: data.meta?.pagination?.total || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Lookup failed' }, { status: 500 });
  }
}