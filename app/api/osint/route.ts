import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache the aggregated feed for 5 minutes so the 21-source fan-out isn't
// re-run on every request (keeps the page fast and is polite to the sources).
export const revalidate = 300;

const parser = new Parser({
  timeout: 9000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
});

// All free, keyless RSS/Atom sources, grouped into the three categories the
// feed page filters on: Global, Cyber, Geopolitics.
const FEEDS = [
  // ── Global / World ──
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'Global' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'Global' },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World', category: 'Global' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'Global' },
  { url: 'https://rss.dw.com/rdf/rss-en-world', source: 'Deutsche Welle', category: 'Global' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', category: 'Global' },

  // ── Cyber ──
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'Cyber' },
  { url: 'https://therecord.media/feed', source: 'The Record', category: 'Cyber' },
  { url: 'https://www.wired.com/feed/category/security/latest/rss', source: 'Wired Security', category: 'Cyber' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer', category: 'Cyber' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', category: 'Cyber' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', category: 'Cyber' },
  { url: 'https://www.schneier.com/feed/atom/', source: 'Schneier on Security', category: 'Cyber' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA Advisories', category: 'Cyber' },
  { url: 'https://feeds.feedburner.com/securityweek', source: 'SecurityWeek', category: 'Cyber' },

  // ── Geopolitics / Defense ──
  { url: 'https://foreignpolicy.com/feed/', source: 'Foreign Policy', category: 'Geopolitics' },
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico', category: 'Geopolitics' },
  { url: 'https://thediplomat.com/feed/', source: 'The Diplomat', category: 'Geopolitics' },
  { url: 'https://www.bellingcat.com/feed/', source: 'Bellingcat', category: 'Geopolitics' },
  { url: 'https://warontherocks.com/feed/', source: 'War on the Rocks', category: 'Geopolitics' },
  { url: 'https://www.defenseone.com/rss/all/', source: 'Defense One', category: 'Geopolitics' },
];

const PER_FEED = 15;

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  ts: number;
  source: string;
  category: string;
};

export async function GET() {
  const allItems: FeedItem[] = [];

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, PER_FEED).map((item) => {
          const raw = item.isoDate || item.pubDate;
          const d = raw ? new Date(raw) : null;
          const ts = d && !isNaN(d.getTime()) ? d.getTime() : 0;
          return {
            title: (item.title || 'Untitled').trim(),
            link: item.link || '#',
            pubDate: ts
              ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Unknown date',
            ts,
            source: feed.source,
            category: feed.category,
          };
        });
        allItems.push(...items);
      } catch (e) {
        console.error(`Failed to fetch ${feed.source}:`, e);
      }
    })
  );

  if (allItems.length === 0) {
    return NextResponse.json({ items: [], error: 'All feeds failed' });
  }

  // De-duplicate cross-posted stories by normalized title.
  const seen = new Set<string>();
  const deduped = allItems.filter((it) => {
    const key = it.title.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Newest first, by real timestamp (not date-only).
  deduped.sort((a, b) => b.ts - a.ts);

  return NextResponse.json({ items: deduped, sources: FEEDS.length });
}
