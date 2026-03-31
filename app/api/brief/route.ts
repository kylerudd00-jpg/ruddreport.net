import { NextResponse } from 'next/server';

export const revalidate = 300;

interface BriefMessage {
  id: string;
  text: string;
  html: string;
  date: string;
  link: string;
}

function parseChannelPage(html: string): BriefMessage[] {
  const messages: BriefMessage[] = [];

  // Split on message wrap boundaries
  const parts = html.split(/(?=<div class="tgme_widget_message[^"]*(?:text|photo|video)[^"]*js-widget_message")/);

  for (const part of parts) {
    const idMatch = part.match(/data-post="AladdinOSINT\/(\d+)"/);
    // Match text content up to the footer div
    const textMatch = part.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tgme_widget_message_footer|<\/div>)/);
    const timeMatch = part.match(/datetime="([^"]+)"/);
    const linkMatch = part.match(/href="(https:\/\/t\.me\/AladdinOSINT\/\d+)"/);

    if (!idMatch || !textMatch || !timeMatch) continue;

    const rawHtml = textMatch[1];

    // Convert HTML to readable text
    const text = rawHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<b>([\s\S]*?)<\/b>/gi, '$1')
      .replace(/<i>([\s\S]*?)<\/i>/gi, '$1')
      .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (!text) continue;

    messages.push({
      id: idMatch[1],
      text,
      html: rawHtml,
      date: timeMatch[1],
      link: linkMatch?.[1] ?? `https://t.me/AladdinOSINT/${idMatch[1]}`,
    });
  }

  // Return most recent first, up to 20
  return messages.reverse().slice(0, 20);
}

export async function GET() {
  try {
    const res = await fetch('https://t.me/s/AladdinOSINT', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)',
        'Accept': 'text/html',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`Telegram returned ${res.status}`);

    const html = await res.text();
    const messages = parseChannelPage(html);

    return NextResponse.json({ messages, channel: 'AladdinOSINT', fetched: new Date().toISOString() });
  } catch (err) {
    console.error('[brief/route]', err);
    return NextResponse.json({ messages: [], error: 'Failed to fetch brief', channel: 'AladdinOSINT', fetched: null }, { status: 500 });
  }
}
