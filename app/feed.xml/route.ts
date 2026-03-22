import { ARTICLES } from '@/lib/articles';

export async function GET() {
  const base = 'https://ruddreport.net';

  const items = [...ARTICLES]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${base}/articles/${a.slug}</link>
      <guid isPermaLink="true">${base}/articles/${a.slug}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <category>${a.category}</category>
      <pubDate>${a.date}</pubDate>
    </item>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Rudd Report</title>
    <link>${base}</link>
    <description>Unclassified intelligence. Strategic analysis on cybersecurity, national security, geopolitics, and the forces reshaping the global order.</description>
    <language>en-us</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${base}/og.png</url>
      <title>The Rudd Report</title>
      <link>${base}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
