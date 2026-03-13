import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  if (!query.trim()) return NextResponse.json({ found: false });

  try {
    // Search Wikipedia for matching articles
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=6&format=json&origin=*`,
      { signal: AbortSignal.timeout(8000) }
    );
    const searchData = await searchRes.json();
    const titles: string[] = searchData[1] || [];

    if (titles.length === 0) return NextResponse.json({ found: false });

    // Get summary for top result
    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles[0])}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!summaryRes.ok) return NextResponse.json({ found: false });

    const s = await summaryRes.json();

    return NextResponse.json({
      found: true,
      title: s.title,
      description: s.description || null,
      extract: s.extract || null,
      thumbnail: s.thumbnail?.source || null,
      url: s.content_urls?.desktop?.page || null,
      suggestions: titles.slice(1, 5),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
