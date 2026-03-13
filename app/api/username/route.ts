import { NextResponse } from 'next/server';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
};

async function get(url: string, headers: Record<string, string> = {}, timeout = 8000) {
  return fetch(url, {
    headers: { ...HEADERS, ...headers },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  });
}

async function checkGitHub(u: string) {
  const r = await get(`https://api.github.com/users/${u}`, { Accept: 'application/vnd.github+json' });
  return r.status === 200;
}

async function checkReddit(u: string) {
  const r = await get(`https://www.reddit.com/user/${u}/about.json`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.data?.name;
}

async function checkTwitch(u: string) {
  const r = await get(`https://api.twitch.tv/kraken/users?login=${u}`, {
    Accept: 'application/vnd.twitchtv.v5+json',
    'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.users) && d.users.length > 0;
}

async function checkGitLab(u: string) {
  const r = await get(`https://gitlab.com/api/v4/users?username=${u}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d) && d.length > 0;
}

async function checkLichess(u: string) {
  const r = await get(`https://lichess.org/api/user/${u}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkChessCom(u: string) {
  const r = await get(`https://api.chess.com/pub/player/${u.toLowerCase()}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkRoblox(u: string) {
  const r = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [u], excludeBannedUsers: false }),
    signal: AbortSignal.timeout(8000),
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

async function checkMinecraft(u: string) {
  const r = await get(`https://api.mojang.com/users/profiles/minecraft/${u}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkNPM(u: string) {
  const r = await get(`https://registry.npmjs.org/-/user/org.couchdb.user:${u}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkKeybase(u: string) {
  const r = await get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${u}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return d?.status?.code === 0 && !!d?.them;
}

async function checkHuggingFace(u: string) {
  const r = await get(`https://huggingface.co/api/users/${u}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkDevTo(u: string) {
  const r = await get(`https://dev.to/api/users/by_username?url=${u}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkHashnode(u: string) {
  const r = await fetch('https://api.hashnode.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ user(username: "${u}") { username } }` }),
    signal: AbortSignal.timeout(8000),
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.data?.user?.username;
}

async function checkSteam(u: string) {
  const r = await get(`https://steamcommunity.com/id/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.includes('The specified profile could not be found') && !html.includes('error_ctn');
}

async function checkTwitter(u: string) {
  const r = await get(`https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${u}`, {
    Accept: 'application/json',
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d) && d.length > 0;
}

async function checkTikTok(u: string) {
  const r = await get(`https://www.tiktok.com/@${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.includes("Couldn't find this account") && !html.includes('user-not-found');
}

async function checkSnapchat(u: string) {
  const r = await get(`https://www.snapchat.com/add/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found') && !html.toLowerCase().includes('sorry, we couldn');
}

async function checkLinkedIn(u: string) {
  const r = await get(`https://www.linkedin.com/in/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found') && !html.toLowerCase().includes('this profile is not available');
}

async function checkYouTube(u: string) {
  const r = await get(`https://www.youtube.com/@${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.includes('404') && html.includes('channelId');
}

async function checkPinterest(u: string) {
  const r = await get(`https://www.pinterest.com/${u}/`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes("sorry! we couldn") && !html.toLowerCase().includes('page not found');
}

async function checkTumblr(u: string) {
  const r = await get(`https://${u}.tumblr.com/`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes("there's nothing here") && !html.toLowerCase().includes('not found');
}

async function checkMedium(u: string) {
  const r = await get(`https://medium.com/@${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found') && !html.toLowerCase().includes('this page is not available');
}

async function checkSubstack(u: string) {
  const r = await get(`https://${u}.substack.com/`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('not found');
}

async function checkPatreon(u: string) {
  const r = await get(`https://www.patreon.com/api/campaigns?filter[vanity]=${u}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

async function checkSoundCloud(u: string) {
  const r = await get(`https://soundcloud.com/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes("we can't find that user") && !html.toLowerCase().includes('page not found');
}

async function checkVimeo(u: string) {
  const r = await get(`https://vimeo.com/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found');
}

async function checkSpotify(u: string) {
  const r = await get(`https://open.spotify.com/user/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found') && !html.toLowerCase().includes('not found');
}

async function checkTelegram(u: string) {
  const r = await get(`https://t.me/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return html.toLowerCase().includes('tgme_page_title');
}

async function checkBluesky(u: string) {
  for (const handle of [u, `${u}.bsky.social`]) {
    const r = await get(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`, { Accept: 'application/json' });
    if (r.status === 200) return true;
  }
  return false;
}

async function checkLastFm(u: string) {
  const r = await get(`https://www.last.fm/user/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('user not found') && !html.toLowerCase().includes('page not found');
}

async function checkLetterboxd(u: string) {
  const r = await get(`https://letterboxd.com/${u}/`, { Accept: 'text/html' });
  return r.status === 200;
}

async function checkBandcamp(u: string) {
  const r = await get(`https://${u}.bandcamp.com`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('sorry, that something') && !html.toLowerCase().includes('error');
}

async function checkBehance(u: string) {
  const r = await get(`https://www.behance.net/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found');
}

async function checkCodepen(u: string) {
  const r = await get(`https://codepen.io/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  return r.status === 200;
}

async function checkReplit(u: string) {
  const r = await get(`https://replit.com/@${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('not found');
}

async function checkHackerNews(u: string) {
  const r = await get(`https://hacker-news.firebaseio.com/v0/user/${u}.json`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return d !== null && !!d?.id;
}

async function checkLobsters(u: string) {
  const r = await get(`https://lobste.rs/u/${u}.json`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkOsu(u: string) {
  const r = await get(`https://osu.ppy.sh/users/${u}`, { Accept: 'text/html' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('user not found') && !html.toLowerCase().includes('page not found');
}


const CHECKERS: Record<string, (u: string) => Promise<boolean>> = {
  'github': checkGitHub,
  'reddit': checkReddit,
  'twitter / x': checkTwitter,
  'instagram': async () => false, // blocks all server fetches
  'tiktok': checkTikTok,
  'youtube': checkYouTube,
  'twitch': checkTwitch,
  'snapchat': checkSnapchat,
  'linkedin': checkLinkedIn,
  'pinterest': checkPinterest,
  'tumblr': checkTumblr,
  'medium': checkMedium,
  'substack': checkSubstack,
  'telegram': checkTelegram,
  'spotify': checkSpotify,
  'soundcloud': checkSoundCloud,
  'vimeo': checkVimeo,
  'patreon': checkPatreon,
  'gitlab': checkGitLab,
  'dev.to': checkDevTo,
  'hashnode': checkHashnode,
  'hugging face': checkHuggingFace,
  'keybase': checkKeybase,
  'npm': checkNPM,
  'lichess': checkLichess,
  'chess.com': checkChessCom,
  'steam': checkSteam,
  'roblox': checkRoblox,
  'minecraft': checkMinecraft,
  'osu!': checkOsu,
  'bluesky': checkBluesky,
  'last.fm': checkLastFm,
  'letterboxd': checkLetterboxd,
  'bandcamp': checkBandcamp,
  'behance': checkBehance,
  'codepen': checkCodepen,
  'replit': checkReplit,
  'hacker news': checkHackerNews,
  'lobste.rs': checkLobsters,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || '';
  const platform = (searchParams.get('platform') || '').toLowerCase();

  if (!username || !platform) return NextResponse.json({ found: false });

  const checker = CHECKERS[platform];
  if (!checker) return NextResponse.json({ found: false });

  try {
    const found = await checker(username);
    return NextResponse.json({ found });
  } catch {
    return NextResponse.json({ found: false });
  }
}