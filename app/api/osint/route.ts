import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

// Cache the aggregated feed for 5 minutes so the 21-source fan-out isn't
// re-run on every request (keeps the page fast and is polite to the sources).
export const revalidate = 300;

const parser = new Parser({
  timeout: 9000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
});

// Free, keyless RSS/Atom sources — deliberately curated to hard-news, event-
// driven wires (things actively happening), NOT analysis/essay publications.
// Grouped into the three categories the feed page filters on.
const FEEDS = [
  // ── Global / World ──
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'Global' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'Global' },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR World', category: 'Global' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'Global' },
  { url: 'https://rss.dw.com/rdf/rss-en-world', source: 'Deutsche Welle', category: 'Global' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', category: 'Global' },
  { url: 'https://www.cbsnews.com/latest/rss/world', source: 'CBS News', category: 'Global' },

  // ── Cyber ──
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'Cyber' },
  { url: 'https://therecord.media/feed', source: 'The Record', category: 'Cyber' },
  { url: 'https://www.wired.com/feed/category/security/latest/rss', source: 'Wired Security', category: 'Cyber' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer', category: 'Cyber' },
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', category: 'Cyber' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', category: 'Cyber' },
  { url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml', source: 'CISA Advisories', category: 'Cyber' },
  { url: 'https://feeds.feedburner.com/securityweek', source: 'SecurityWeek', category: 'Cyber' },

  // ── Geopolitics / Defense ──
  { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico', category: 'Geopolitics' },
  { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel', category: 'Geopolitics' },
  { url: 'https://www.defenseone.com/rss/all/', source: 'Defense One', category: 'Geopolitics' },
];

const PER_FEED = 20;

// Keep the feed to declarative, factual reporting — drop rhetorical/question
// headlines and opinion/analysis pieces (what the watch floor is NOT for).
// "Is this France's best chance?" / "Will NATO get involved?" are out;
// "Ex-Olympian pleads not guilty to vandalism charges" stays.
const OPINION_TITLE = /^(opinion|analysis|comment|commentary|editorial|explainer|perspective|viewpoint|essay|review|profile|interview|q\s*&\s*a|photos?|in pictures|watch|listen|podcast|video)\s*[:\-|–—]/i;
const OPINION_PATH = /\/(opinion|opinions|commentisfree|comment|analysis|commentary|perspective|perspectives|viewpoint|editorial|column|columns|blog|blogs|magazine|features?|ideas|essay|essays|long-reads|longreads|interactives?|podcast|podcasts|video|videos|gallery|in-pictures)(\/|$|[?#])/i;
// Leading wh-openers that signal an explainer/opinion piece even without a
// trailing "?" (e.g. "Why X is happening", "How the attack unfolded"). Word
// boundaries keep real words safe — "WhatsApp", "Howard", "Whyalla" pass.
const RHETORICAL_START = /^(why|how|what|which)\b/i;
// Feature/essay framing — evocative openers that describe rather than report an
// event ("The great … reconciliation faces a test", "The rise of …"). Only the
// classic feature nouns, so hard news like "The Pentagon confirms …" passes.
const FEATURE_TITLE = /^the (great|rise|fall|future|end|age|era|making|unmaking|price|cost|problem|paradox|myth|return|reckoning|legacy|untold|secret|hidden|quiet|strange|surprising|unlikely|improbable|curious|remarkable|extraordinary)\b/i;

function isNonFactual(title: string, link: string): boolean {
  const t = title.trim();
  if (!t || t === 'Untitled') return true;
  if (t.endsWith('?')) return true;                 // any question headline
  if (OPINION_TITLE.test(t)) return true;           // labelled opinion/analysis/media
  if (RHETORICAL_START.test(t)) return true;        // rhetorical/explainer framing
  if (FEATURE_TITLE.test(t)) return true;           // feature/essay framing
  if (OPINION_PATH.test(link)) return true;         // opinion/analysis section URLs
  return false;
}

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
        const factual = (parsed.items || []).filter(
          (item) => !isNonFactual(item.title || '', item.link || ''),
        );
        const items = factual.slice(0, PER_FEED).map((item) => {
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

  // Keep only the last 24 hours — this is a live watch floor, not an archive.
  // Anything older (or without a parseable date) is offloaded.
  const DAY = 86_400_000;
  const nowMs = Date.now();
  const recent = deduped.filter((it) => it.ts && nowMs - it.ts <= DAY);
  recent.sort((a, b) => b.ts - a.ts);

  return NextResponse.json({ items: recent, sources: FEEDS.length, window: '24h' });
}
