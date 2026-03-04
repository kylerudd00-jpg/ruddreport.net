import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const platform = searchParams.get('platform') || '';
  if (!url) return NextResponse.json({ found: false });

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404 || res.status === 410 || res.status === 403) {
      return NextResponse.json({ found: false });
    }
    if (res.status !== 200) {
      return NextResponse.json({ found: false });
    }

    const html = (await res.text()).toLowerCase();

    const notFoundPatterns: Record<string, string[]> = {
      reddit: ['sorry, nobody on reddit goes by that name'],
      github: ['not found'],
      twitch: ['sorry. unless you\'ve got a time machine', 'isn\'t available'],
      medium: ['this page is not available', '404'],
      lichess: ['no such user', 'this player does not exist'],
      hashnode: ['page not found', 'doesn\'t exist'],
      kaggle: ['page not found', '404'],
      bandcamp: ['sorry, that something isn\'t here', 'the address you requested does not exist'],
      namemc: ['unknown player', 'player not found'],
      gravatar: ['has not created a gravatar profile'],
      keybase: ['not a keybase user', 'page not found'],
      soundcloud: ['page not found', 'we can\'t find that user'],
      vimeo: ['page not found', 'this page is not found'],
      patreon: ['page not found', '404'],
      npm: ['not found'],
      replit: ['page not found', '404'],
      codepen: ['not found', '404'],
      huggingface: ['not found', '404'],
      roblox: ['page not found', '404'],
      gitlab: ['page not found', 'not found'],
      'dev.to': ['page not found', '404'],
      'chess.com': ['page not found', 'member not found'],
      minecraft: ['unknown player', 'not found'],
    };

    const key = platform.toLowerCase();
    const patterns = notFoundPatterns[key];
    if (patterns) {
      const notFound = patterns.some(p => html.includes(p));
      if (notFound) return NextResponse.json({ found: false });
      return NextResponse.json({ found: true });
    }

    return NextResponse.json({ found: true });

  } catch {
    return NextResponse.json({ found: false });
  }
}