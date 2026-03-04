import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
});

const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'Global' },
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'Cyber' },
  { url: 'https://therecord.media/feed', source: 'The Record', category: 'Cyber' },
  { url: 'https://foreignpolicy.com/feed/', source: 'Foreign Policy', category: 'Geopolitics' },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico', category: 'Geopolitics' },
  { url: 'https://www.wired.com/feed/category/security/latest/rss', source: 'Wired Security', category: 'Cyber' },
];

export async function GET() {
  const allItems: any[] = [];

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 8).map(item => ({
          title: item.title || 'Untitled',
          link: item.link || '#',
          pubDate: item.pubDate
            ? new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Unknown date',
          source: feed.source,
          category: feed.category,
        }));
        allItems.push(...items);
      } catch (e) {
        console.error(`Failed to fetch ${feed.source}:`, e);
      }
    })
  );

  if (allItems.length === 0) {
    return NextResponse.json({ items: [], error: 'All feeds failed' });
  }

  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ items: allItems });
}