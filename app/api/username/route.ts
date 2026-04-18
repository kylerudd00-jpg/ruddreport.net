import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function get(url: string, extra: Record<string, string> = {}, timeout = 7000) {
  return fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'application/json', ...extra },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  });
}

// ── Reliable API-based checks only ──────────────────────────────────────────

async function checkGitHub(u: string) {
  const r = await get(`https://api.github.com/users/${encodeURIComponent(u)}`, { Accept: 'application/vnd.github+json' });
  return r.status === 200;
}

async function checkReddit(u: string) {
  const r = await get(`https://www.reddit.com/user/${encodeURIComponent(u)}/about.json`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.data?.name;
}

async function checkGitLab(u: string) {
  const r = await get(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d) && d.length > 0 && d[0].username?.toLowerCase() === u.toLowerCase();
}

async function checkCodeberg(u: string) {
  const r = await get(`https://codeberg.org/api/v1/users/${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkDevTo(u: string) {
  const r = await get(`https://dev.to/api/users/by_username?url=${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkHashnode(u: string) {
  const safe = u.replace(/['"\\]/g, '');
  const r = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ query: `{ user(username: "${safe}") { username } }` }),
    signal: AbortSignal.timeout(7000),
  });
  if (!r.ok) return false;
  const d = await r.json();
  return !!d?.data?.user?.username;
}

async function checkHuggingFace(u: string) {
  const r = await get(`https://huggingface.co/api/users/${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkKeybase(u: string) {
  const r = await get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return d?.status?.code === 0 && !!d?.them;
}

async function checkNPM(u: string) {
  const r = await get(`https://registry.npmjs.org/-/user/org.couchdb.user:${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkBluesky(u: string) {
  for (const handle of [`${u}.bsky.social`, u]) {
    const r = await get(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`);
    if (r.status === 200) return true;
  }
  return false;
}

async function checkMastodon(u: string) {
  const r = await get(`https://mastodon.social/api/v1/accounts/lookup?acct=${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkLichess(u: string) {
  const r = await get(`https://lichess.org/api/user/${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkChessCom(u: string) {
  const r = await get(`https://api.chess.com/pub/player/${encodeURIComponent(u.toLowerCase())}`);
  return r.status === 200;
}

async function checkRoblox(u: string) {
  const r = await fetch('https://users.roblox.com/v1/usernames/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ usernames: [u], excludeBannedUsers: false }),
    signal: AbortSignal.timeout(7000),
  });
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

async function checkMinecraft(u: string) {
  const r = await get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(u)}`);
  return r.status === 200;
}

async function checkHackerNews(u: string) {
  const r = await get(`https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(u)}.json`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return d !== null && typeof d === 'object' && !!d.id;
}

async function checkLobsters(u: string) {
  const r = await get(`https://lobste.rs/u/${encodeURIComponent(u)}.json`);
  return r.status === 200;
}

async function checkDuolingo(u: string) {
  const r = await get(`https://www.duolingo.com/2017-06-30/users?username=${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.users) && d.users.length > 0;
}

async function checkDockerHub(u: string) {
  const r = await get(`https://hub.docker.com/v2/users/${encodeURIComponent(u)}/`);
  return r.status === 200;
}

async function checkCodeforces(u: string) {
  const r = await get(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return d?.status === 'OK' && Array.isArray(d?.result) && d.result.length > 0;
}

async function checkLeetCode(u: string) {
  const r = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA, 'Referer': 'https://leetcode.com' },
    body: JSON.stringify({ query: `{ matchedUser(username: "${u.replace(/['"\\]/g, '')}") { username } }` }),
    signal: AbortSignal.timeout(7000),
  });
  if (!r.ok) return false;
  const d = await r.json();
  return !!d?.data?.matchedUser?.username;
}

async function checkArtStation(u: string) {
  const r = await get(`https://www.artstation.com/users/${encodeURIComponent(u)}/quick.json`);
  if (r.status === 404) return false;
  if (r.status !== 200) return false;
  const d = await r.json();
  return !!d?.username;
}

async function checkPatreon(u: string) {
  const r = await get(`https://www.patreon.com/api/campaigns?filter[vanity]=${encodeURIComponent(u)}`);
  if (r.status !== 200) return false;
  const d = await r.json();
  return Array.isArray(d?.data) && d.data.length > 0;
}

// ── Platform registry ────────────────────────────────────────────────────────

type Platform = {
  name: string;
  url: string;
  category: string;
  check?: (u: string) => Promise<boolean>;
};

const CHECKED_PLATFORMS: Platform[] = [
  // Social
  { name: 'Reddit',      url: 'https://reddit.com/user/{}',           category: 'Social',   check: checkReddit },
  { name: 'Bluesky',     url: 'https://bsky.app/profile/{}',          category: 'Social',   check: checkBluesky },
  { name: 'Mastodon',    url: 'https://mastodon.social/@{}',          category: 'Social',   check: checkMastodon },
  // Dev
  { name: 'GitHub',      url: 'https://github.com/{}',                category: 'Dev',      check: checkGitHub },
  { name: 'GitLab',      url: 'https://gitlab.com/{}',                category: 'Dev',      check: checkGitLab },
  { name: 'Codeberg',    url: 'https://codeberg.org/{}',              category: 'Dev',      check: checkCodeberg },
  { name: 'Dev.to',      url: 'https://dev.to/{}',                    category: 'Dev',      check: checkDevTo },
  { name: 'Hashnode',    url: 'https://hashnode.com/@{}',             category: 'Dev',      check: checkHashnode },
  { name: 'HuggingFace', url: 'https://huggingface.co/{}',            category: 'Dev',      check: checkHuggingFace },
  { name: 'Keybase',     url: 'https://keybase.io/{}',                category: 'Dev',      check: checkKeybase },
  { name: 'NPM',         url: 'https://npmjs.com/~{}',                category: 'Dev',      check: checkNPM },
  { name: 'DockerHub',   url: 'https://hub.docker.com/u/{}',          category: 'Dev',      check: checkDockerHub },
  { name: 'LeetCode',    url: 'https://leetcode.com/{}/profile',      category: 'Dev',      check: checkLeetCode },
  { name: 'Codeforces',  url: 'https://codeforces.com/profile/{}',    category: 'Dev',      check: checkCodeforces },
  { name: 'Patreon',     url: 'https://patreon.com/{}',               category: 'Creative', check: checkPatreon },
  { name: 'ArtStation',  url: 'https://www.artstation.com/{}',        category: 'Creative', check: checkArtStation },
  // Gaming
  { name: 'Roblox',      url: 'https://roblox.com/user.aspx?username={}', category: 'Gaming', check: checkRoblox },
  { name: 'Minecraft',   url: 'https://namemc.com/profile/{}',        category: 'Gaming',   check: checkMinecraft },
  { name: 'Lichess',     url: 'https://lichess.org/@/{}',             category: 'Gaming',   check: checkLichess },
  { name: 'Chess.com',   url: 'https://chess.com/member/{}',          category: 'Gaming',   check: checkChessCom },
  // Other
  { name: 'Hacker News', url: 'https://news.ycombinator.com/user?id={}', category: 'Other', check: checkHackerNews },
  { name: 'Lobste.rs',   url: 'https://lobste.rs/u/{}',               category: 'Other',    check: checkLobsters },
  { name: 'Duolingo',    url: 'https://www.duolingo.com/profile/{}',  category: 'Other',    check: checkDuolingo },
];

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('u')?.trim() ?? '';
  if (!username) return new Response('Missing username', { status: 400 });

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  const emit = (result: object) =>
    writer.write(encoder.encode(JSON.stringify(result) + '\n')).catch(() => {});

  (async () => {
    await Promise.allSettled(
      CHECKED_PLATFORMS.map(async (p) => {
        const url = p.url.replace('{}', encodeURIComponent(username));
        try {
          const found = await p.check!(username);
          await emit({ platform: p.name, status: found ? 'found' : 'not_found', url });
        } catch {
          await emit({ platform: p.name, status: 'error', url });
        }
      })
    );
    writer.close().catch(() => {});
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
