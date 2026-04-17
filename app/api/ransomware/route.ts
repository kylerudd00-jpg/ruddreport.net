import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [postsRes, groupsRes] = await Promise.all([
      fetch('https://api.ransomwatch.telemetry.ltd/v2/posts', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }),
      fetch('https://api.ransomwatch.telemetry.ltd/v2/groups', {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    const posts = postsRes.ok ? await postsRes.json() : [];
    const groups = groupsRes.ok ? await groupsRes.json() : [];

    // sort by discovered desc, return top 150
    const sorted = [...posts]
      .filter((p: any) => p.discovered)
      .sort((a: any, b: any) => new Date(b.discovered).getTime() - new Date(a.discovered).getTime())
      .slice(0, 150);

    // build group stats from posts
    const groupStats: Record<string, number> = {};
    for (const p of posts) {
      if (p.group_name) groupStats[p.group_name] = (groupStats[p.group_name] ?? 0) + 1;
    }

    return NextResponse.json({
      posts: sorted,
      groups,
      groupStats,
      total: posts.length,
      fetched: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ransomware/route]', err);
    return NextResponse.json(
      { posts: [], groups: [], groupStats: {}, total: 0, error: 'Failed to fetch ransomware data', fetched: null },
      { status: 500 }
    );
  }
}
