import { NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url') || '';
  if (!url.trim()) return NextResponse.json({ error: 'No URL provided' }, { status: 400 });

  // Ensure protocol
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const hops: Array<{ url: string; status: number; kind: 'redirect' | 'final' | 'error' }> = [];
  const MAX = 12;
  const seen = new Set<string>();

  for (let i = 0; i < MAX; i++) {
    if (seen.has(url)) {
      // Redirect loop
      hops.push({ url, status: 0, kind: 'error' });
      break;
    }
    seen.add(url);

    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000),
      });

      const isRedirect = [301, 302, 303, 307, 308].includes(res.status);
      hops.push({ url, status: res.status, kind: isRedirect ? 'redirect' : 'final' });

      if (!isRedirect) break;

      const location = res.headers.get('location');
      if (!location) break;

      // Resolve relative redirects
      url = location.startsWith('http') ? location : new URL(location, url).href;
    } catch {
      hops.push({ url, status: 0, kind: 'error' });
      break;
    }
  }

  return NextResponse.json({ hops });
}
