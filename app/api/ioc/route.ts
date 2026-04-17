import { NextResponse, NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

type IoCType = 'ip' | 'hash_md5' | 'hash_sha1' | 'hash_sha256' | 'url' | 'domain' | 'unknown';

function detectType(value: string): IoCType {
  const v = value.trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) return 'ip';
  if (/^[0-9a-fA-F]{64}$/.test(v)) return 'hash_sha256';
  if (/^[0-9a-fA-F]{40}$/.test(v)) return 'hash_sha1';
  if (/^[0-9a-fA-F]{32}$/.test(v)) return 'hash_md5';
  if (/^https?:\/\//i.test(v)) return 'url';
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(v)) return 'domain';
  return 'unknown';
}

async function checkIP(ip: string) {
  const results: Record<string, any> = {};
  const opts = { cache: 'no-store' as const, signal: AbortSignal.timeout(8000) };

  await Promise.allSettled([
    // Shodan InternetDB — free, no key
    fetch(`https://internetdb.shodan.io/${ip}`, opts)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) results.shodan = d; }),

    // GreyNoise Community — free, no key
    fetch(`https://api.greynoise.io/v3/community/${ip}`, opts)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) results.greynoise = d; }),

    // IPinfo basic — free, no key
    fetch(`https://ipinfo.io/${ip}/json`, opts)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) results.ipinfo = d; }),
  ]);

  return results;
}

async function checkHash(hash: string) {
  const results: Record<string, any> = {};
  try {
    const res = await fetch('https://mb-api.abuse.ch/api/v1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `query=get_info&hash=${hash}`,
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      results.malwarebazaar = data;
    }
  } catch {}
  return results;
}

async function checkDomain(domain: string) {
  const results: Record<string, any> = {};
  try {
    const res = await fetch(
      `https://urlscan.io/api/v1/search/?q=page.domain:${encodeURIComponent(domain)}&size=5`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuddReport/1.0)' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    );
    if (res.ok) results.urlscan = await res.json();
  } catch {}
  return results;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const value = searchParams.get('q')?.trim() ?? '';

  if (!value) return NextResponse.json({ error: 'No value provided' }, { status: 400 });

  const type = detectType(value);
  let results: Record<string, any> = {};

  if (type === 'ip') {
    results = await checkIP(value);
  } else if (type === 'hash_md5' || type === 'hash_sha1' || type === 'hash_sha256') {
    results = await checkHash(value);
  } else if (type === 'domain') {
    results = await checkDomain(value);
  } else if (type === 'url') {
    try {
      const domain = new URL(value).hostname;
      results = await checkDomain(domain);
    } catch {}
  }

  return NextResponse.json({ value, type, results, checked: new Date().toISOString() });
}
