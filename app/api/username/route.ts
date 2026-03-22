import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function get(url: string, extra: Record<string, string> = {}, timeout = 8000) {
  return fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
      'Accept-Language': 'en-US,en;q=0.5',
      ...extra,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  });
}

// ─── API-based checks (high confidence) ─────────────────────────────────────

async function checkGitHub(u: string) {
  const r = await get(`https://api.github.com/users/${encodeURIComponent(u)}`, { Accept: 'application/vnd.github+json' });
  return r.status === 200;
}

async function checkReddit(u: string) {
  const r = await get(`https://www.reddit.com/user/${encodeURIComponent(u)}/about.json`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.data?.name;
}

async function checkGitLab(u: string) {
  const r = await get(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d) && d.length > 0 && d[0].username?.toLowerCase() === u.toLowerCase();
}

async function checkCodeberg(u: string) {
  const r = await get(`https://codeberg.org/api/v1/users/${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkDevTo(u: string) {
  const r = await get(`https://dev.to/api/users/by_username?url=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkHashnode(u: string) {
  const safe = u.replace(/['"\\]/g, '');
  const r = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ query: `{ user(username: "${safe}") { username } }` }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return false;
  const d = await r.json();
  return !!d?.data?.user?.username;
}

async function checkHuggingFace(u: string) {
  const r = await get(`https://huggingface.co/api/users/${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkKeybase(u: string) {
  const r = await get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return d?.status?.code === 0 && !!d?.them;
}

async function checkNPM(u: string) {
  const r = await get(`https://registry.npmjs.org/-/user/org.couchdb.user:${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkBluesky(u: string) {
  for (const handle of [`${u}.bsky.social`, u]) {
    const r = await get(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`,
      { Accept: 'application/json' }
    );
    if (r.status === 200) return true;
  }
  return false;
}

async function checkLichess(u: string) {
  const r = await get(`https://lichess.org/api/user/${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkChessCom(u: string) {
  const r = await get(`https://api.chess.com/pub/player/${encodeURIComponent(u.toLowerCase())}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkRoblox(u: string) {
  const r = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ usernames: [u], excludeBannedUsers: false }),
    signal: AbortSignal.timeout(8000),
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

async function checkMinecraft(u: string) {
  const r = await get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkHackerNews(u: string) {
  const r = await get(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(u)}.json`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return d !== null && typeof d === 'object' && !!d.id;
}

async function checkLobsters(u: string) {
  const r = await get(`https://lobste.rs/u/${encodeURIComponent(u)}.json`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkPatreon(u: string) {
  const r = await get(`https://www.patreon.com/api/campaigns?filter[vanity]=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

async function checkTwitch(u: string) {
  const r = await fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: {
      'Client-ID': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
      'Content-Type': 'application/json',
      'User-Agent': UA,
    },
    body: JSON.stringify([{
      operationName: 'ChannelShell',
      variables: { login: u.toLowerCase() },
      extensions: { persistedQuery: { version: 1, sha256Hash: '580ab410bcd0c1ad194224957ae2241e5d252b2c5173d8e0cce9d32d5bb14efe' } },
    }]),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return false;
  const d = await r.json();
  if (!Array.isArray(d)) return false;
  if (d[0]?.errors?.some((e: { message: string }) => e.message?.includes('PersistedQueryNotFound'))) {
    throw new Error('Twitch GQL hash stale'); // triggers 'error' state
  }
  const user = d[0]?.data?.userOrError;
  if (!user) return false;
  return user.__typename !== 'UserError' && user.__typename !== 'UserDoesNotExistError';
}

// ─── Web-scraping checks (moderate confidence) ───────────────────────────────

async function checkSteam(u: string) {
  const r = await get(`https://steamcommunity.com/id/${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const html = await r.text();
  return html.includes('profile_header') || html.includes('playerAvatar') || html.includes('persona_name');
}

async function checkTelegram(u: string) {
  const r = await get(`https://t.me/${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const html = await r.text();
  return html.includes('tgme_page_title');
}

async function checkTumblr(u: string) {
  const r = await get(`https://${u}.tumblr.com/`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  const low = html.toLowerCase();
  return !low.includes("there's nothing here") && !low.includes('not found') && !low.includes('page not found');
}

async function checkMedium(u: string) {
  const r = await get(`https://medium.com/@${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found');
}

async function checkSubstack(u: string) {
  const r = await get(`https://${u}.substack.com/`);
  if (r.status === 404) return false;
  return r.status === 200;
}

async function checkCodepen(u: string) {
  const r = await get(`https://codepen.io/${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkReplit(u: string) {
  const r = await get(`https://replit.com/@${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('not found');
}

async function checkSoundCloud(u: string) {
  const r = await get(`https://soundcloud.com/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  const low = html.toLowerCase();
  return !low.includes("we can't find that user") && !low.includes('page not found');
}

async function checkVimeo(u: string) {
  const r = await get(`https://vimeo.com/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  return r.status === 200;
}

async function checkInstagram(u: string) {
  const r = await fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(u)}`, {
    headers: { 'User-Agent': UA, 'x-ig-app-id': '936619743392459', 'Accept': 'application/json', 'Accept-Language': 'en-US,en;q=0.5' },
    signal: AbortSignal.timeout(8000),
  });
  if (r.status === 404) return false;
  if (r.status === 200) {
    const d = await r.json();
    return !!d?.data?.user?.id;
  }
  throw new Error(`Instagram: ${r.status}`);
}

async function checkMastodon(u: string) {
  const r = await get(`https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkFlickr(u: string) {
  const r = await get(`https://www.flickr.com/people/${encodeURIComponent(u)}/`);
  return r.status === 200;
}

async function checkBehance(u: string) {
  const r = await get(`https://www.behance.net/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  return r.status === 200;
}

async function checkLastFm(u: string) {
  const r = await get(`https://www.last.fm/user/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('user not found');
}

async function checkLetterboxd(u: string) {
  const r = await get(`https://letterboxd.com/${encodeURIComponent(u)}/`);
  return r.status === 200;
}

async function checkOsu(u: string) {
  const r = await get(`https://osu.ppy.sh/users/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('user not found');
}

async function checkDuolingo(u: string) {
  const r = await get(`https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.users) && d.users.length > 0;
}

async function checkDockerHub(u: string) {
  const r = await get(`https://hub.docker.com/v2/users/${encodeURIComponent(u)}/`, { Accept: 'application/json' });
  return r.status === 200;
}

async function checkCodeforces(u: string) {
  const r = await get(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(u)}`, { Accept: 'application/json' });
  if (r.status !== 200) return false;
  const d = await r.json();
  return d?.status === 'OK' && Array.isArray(d?.result) && d.result.length > 0;
}

async function checkLeetCode(u: string) {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'Referer': 'https://leetcode.com' },
    body: JSON.stringify({ query: `{ matchedUser(username: "${u.replace(/['"\\]/g, '')}") { username } }` }),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return false;
  const d = await r.json();
  return !!d?.data?.matchedUser?.username;
}

async function checkArtStation(u: string) {
  const r = await get(`https://www.artstation.com/users/${encodeURIComponent(u)}/quick.json`, { Accept: 'application/json' });
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.username;
}

async function checkDribbble(u: string) {
  const r = await get(`https://dribbble.com/${encodeURIComponent(u)}`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const html = await r.text();
  return !html.toLowerCase().includes('page not found');
}

async function checkItchIo(u: string) {
  const r = await get(`https://${encodeURIComponent(u)}.itch.io/`);
  if (r.status === 404) return false;
  return r.status === 200;
}

// ─── Platform registry ───────────────────────────────────────────────────────

type Platform = {
  name: string;
  url: string;
  category: string;
  tier: 'api' | 'web' | 'manual';
  check?: (u: string) => Promise<boolean>;
};

const PLATFORMS: Platform[] = [
  // Social
  { name: 'Twitter / X',  url: 'https://x.com/{}',                         category: 'Social',   tier: 'manual' },
  { name: 'Instagram',    url: 'https://instagram.com/{}',                  category: 'Social',   tier: 'api',    check: checkInstagram },
  { name: 'TikTok',       url: 'https://tiktok.com/@{}',                    category: 'Social',   tier: 'manual' },
  { name: 'LinkedIn',     url: 'https://linkedin.com/in/{}',                category: 'Social',   tier: 'manual' },
  { name: 'Pinterest',    url: 'https://pinterest.com/{}',                  category: 'Social',   tier: 'manual' },
  { name: 'YouTube',      url: 'https://youtube.com/@{}',                   category: 'Social',   tier: 'manual' },
  { name: 'Snapchat',     url: 'https://snapchat.com/add/{}',               category: 'Social',   tier: 'manual' },
  { name: 'Reddit',       url: 'https://reddit.com/user/{}',                category: 'Social',   tier: 'api',    check: checkReddit },
  { name: 'Bluesky',      url: 'https://bsky.app/profile/{}',               category: 'Social',   tier: 'api',    check: checkBluesky },
  { name: 'Mastodon',     url: 'https://mastodon.social/@{}',               category: 'Social',   tier: 'api',    check: checkMastodon },
  { name: 'Telegram',     url: 'https://t.me/{}',                           category: 'Social',   tier: 'web',    check: checkTelegram },
  { name: 'Tumblr',       url: 'https://{}.tumblr.com',                     category: 'Social',   tier: 'web',    check: checkTumblr },
  { name: 'Medium',       url: 'https://medium.com/@{}',                    category: 'Social',   tier: 'web',    check: checkMedium },
  { name: 'Substack',     url: 'https://{}.substack.com',                   category: 'Social',   tier: 'web',    check: checkSubstack },
  // Dev
  { name: 'GitHub',       url: 'https://github.com/{}',                     category: 'Dev',      tier: 'api',    check: checkGitHub },
  { name: 'GitLab',       url: 'https://gitlab.com/{}',                     category: 'Dev',      tier: 'api',    check: checkGitLab },
  { name: 'Codeberg',     url: 'https://codeberg.org/{}',                   category: 'Dev',      tier: 'api',    check: checkCodeberg },
  { name: 'Dev.to',       url: 'https://dev.to/{}',                         category: 'Dev',      tier: 'api',    check: checkDevTo },
  { name: 'Hashnode',     url: 'https://hashnode.com/@{}',                  category: 'Dev',      tier: 'api',    check: checkHashnode },
  { name: 'HuggingFace',  url: 'https://huggingface.co/{}',                 category: 'Dev',      tier: 'api',    check: checkHuggingFace },
  { name: 'Keybase',      url: 'https://keybase.io/{}',                     category: 'Dev',      tier: 'api',    check: checkKeybase },
  { name: 'NPM',          url: 'https://npmjs.com/~{}',                     category: 'Dev',      tier: 'api',    check: checkNPM },
  { name: 'Codepen',      url: 'https://codepen.io/{}',                     category: 'Dev',      tier: 'web',    check: checkCodepen },
  { name: 'Replit',       url: 'https://replit.com/@{}',                    category: 'Dev',      tier: 'web',    check: checkReplit },
  { name: 'DockerHub',    url: 'https://hub.docker.com/u/{}',               category: 'Dev',      tier: 'api',    check: checkDockerHub },
  { name: 'LeetCode',     url: 'https://leetcode.com/{}/',                   category: 'Dev',      tier: 'api',    check: checkLeetCode },
  { name: 'Codeforces',   url: 'https://codeforces.com/profile/{}',          category: 'Dev',      tier: 'api',    check: checkCodeforces },
  // Gaming
  { name: 'Twitch',       url: 'https://twitch.tv/{}',                      category: 'Gaming',   tier: 'api',    check: checkTwitch },
  { name: 'Steam',        url: 'https://steamcommunity.com/id/{}',          category: 'Gaming',   tier: 'web',    check: checkSteam },
  { name: 'Roblox',       url: 'https://roblox.com/user.aspx?username={}', category: 'Gaming',   tier: 'api',    check: checkRoblox },
  { name: 'Minecraft',    url: 'https://namemc.com/profile/{}',             category: 'Gaming',   tier: 'api',    check: checkMinecraft },
  { name: 'Lichess',      url: 'https://lichess.org/@/{}',                  category: 'Gaming',   tier: 'api',    check: checkLichess },
  { name: 'Chess.com',    url: 'https://chess.com/member/{}',               category: 'Gaming',   tier: 'api',    check: checkChessCom },
  { name: 'osu!',         url: 'https://osu.ppy.sh/users/{}',               category: 'Gaming',   tier: 'web',    check: checkOsu },
  // Creative
  { name: 'SoundCloud',   url: 'https://soundcloud.com/{}',                 category: 'Creative', tier: 'web',    check: checkSoundCloud },
  { name: 'Vimeo',        url: 'https://vimeo.com/{}',                      category: 'Creative', tier: 'web',    check: checkVimeo },
  { name: 'Behance',      url: 'https://behance.net/{}',                    category: 'Creative', tier: 'web',    check: checkBehance },
  { name: 'Flickr',       url: 'https://flickr.com/people/{}',              category: 'Creative', tier: 'web',    check: checkFlickr },
  { name: 'Patreon',      url: 'https://patreon.com/{}',                    category: 'Creative', tier: 'api',    check: checkPatreon },
  { name: 'Spotify',      url: 'https://open.spotify.com/user/{}',          category: 'Creative', tier: 'manual' },
  { name: 'ArtStation',   url: 'https://www.artstation.com/{}',             category: 'Creative', tier: 'api',    check: checkArtStation },
  { name: 'Dribbble',     url: 'https://dribbble.com/{}',                   category: 'Creative', tier: 'web',    check: checkDribbble },
  { name: 'Itch.io',      url: 'https://{}.itch.io',                        category: 'Creative', tier: 'web',    check: checkItchIo },
  // Other
  { name: 'Hacker News',  url: 'https://news.ycombinator.com/user?id={}',   category: 'Other',    tier: 'api',    check: checkHackerNews },
  { name: 'Lobste.rs',    url: 'https://lobste.rs/u/{}',                    category: 'Other',    tier: 'api',    check: checkLobsters },
  { name: 'Letterboxd',   url: 'https://letterboxd.com/{}',                 category: 'Other',    tier: 'web',    check: checkLetterboxd },
  { name: 'Last.fm',      url: 'https://www.last.fm/user/{}',               category: 'Other',    tier: 'web',    check: checkLastFm },
  { name: 'Duolingo',     url: 'https://www.duolingo.com/profile/{}',       category: 'Other',    tier: 'api',    check: checkDuolingo },
];

// ─── Per-platform handler ─────────────────────────────────────────────────────

const CHECKERS: Record<string, (u: string) => Promise<boolean>> = Object.fromEntries(
  PLATFORMS.filter(p => p.check).map(p => [p.name.toLowerCase(), p.check!])
);

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')?.trim() ?? '';
  const platform = req.nextUrl.searchParams.get('platform')?.toLowerCase().trim() ?? '';

  if (!username || !platform) return NextResponse.json({ status: 'error' });

  const checker = CHECKERS[platform];
  if (!checker) return NextResponse.json({ status: 'manual' });

  try {
    const found = await checker(username);
    return NextResponse.json({ status: found ? 'found' : 'not_found' });
  } catch {
    return NextResponse.json({ status: 'error' });
  }
}
