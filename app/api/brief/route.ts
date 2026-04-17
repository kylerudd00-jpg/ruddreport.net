import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BriefMessage {
  id: string;
  text: string;
  html: string;
  date: string;
  link: string;
}

function htmlToText(raw: string): string {
  return raw
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
}

function parseChannelPage(html: string): BriefMessage[] {
  const messages: BriefMessage[] = [];

  // Match any message wrap div regardless of type (text, photo, video, link, document, etc.)
  const parts = html.split(/(?=<div class="tgme_widget_message[^"]*js-widget_message")/);

  for (const part of parts) {
    const idMatch = part.match(/data-post="AladdinOSINT\/(\d+)"/);
    const timeMatch = part.match(/datetime="([^"]+)"/);
    const linkMatch = part.match(/href="(https:\/\/t\.me\/AladdinOSINT\/\d+)"/);

    if (!idMatch || !timeMatch) continue;

    // Try to extract message text (may be absent for media-only posts)
    const textMatch = part.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="tgme_widget_message_footer|<a class="tgme_widget_message_photo)/);
    let rawHtml = '';
    let text = '';

    if (textMatch) {
      rawHtml = textMatch[1];
      text = htmlToText(rawHtml);
    }

    // For media-only posts with no caption, use a placeholder so they still appear
    if (!text) {
      const hasPhoto = /tgme_widget_message_photo/.test(part);
      const hasVideo = /tgme_widget_message_video/.test(part);
      const hasDoc = /tgme_widget_message_document/.test(part);
      if (hasPhoto) text = '[Photo]';
      else if (hasVideo) text = '[Video]';
      else if (hasDoc) text = '[Document]';
      else text = '[Media]';
      // Skip if truly no content at all (stray split artifact)
      if (!hasPhoto && !hasVideo && !hasDoc && !textMatch) continue;
    }

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
      cache: 'no-store',
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
