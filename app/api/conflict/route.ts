import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const maxrecords = searchParams.get('maxrecords') || '10';
  const timespan = searchParams.get('timespan') || '72h';

  if (!q) return NextResponse.json({ articles: [] });

  try {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=artlist&maxrecords=${maxrecords}&format=json&timespan=${timespan}&sort=DateDesc`;
    const r = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!r.ok) throw new Error(`GDELT ${r.status}`);
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ articles: [], error: e?.message }, { status: 502 });
  }
}