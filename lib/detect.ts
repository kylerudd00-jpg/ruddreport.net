// Shared indicator detector — the single "brain" for routing + pivots.
// Given a raw string, classify what kind of OSINT indicator it is.

export type Indicator = 'url' | 'email' | 'ip' | 'hash' | 'domain' | 'username';

const RX: Record<Exclude<Indicator, 'username'>, RegExp> = {
  url: /^https?:\/\//i,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ip: /^(\d{1,3}\.){3}\d{1,3}$/,
  hash: /^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$/,
  domain: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i,
};

// Order matters: url → email → ip → hash → domain, else username.
export function detectType(raw: string): Indicator | null {
  const q = raw.trim();
  if (!q) return null;
  if (RX.url.test(q)) return 'url';
  if (RX.email.test(q)) return 'email';
  if (RX.ip.test(q)) return 'ip';
  if (RX.hash.test(q)) return 'hash';
  if (RX.domain.test(q)) return 'domain';
  return 'username';
}

export const INDICATOR_LABEL: Record<Indicator, string> = {
  url: 'URL',
  email: 'email address',
  ip: 'IP address',
  hash: 'file hash',
  domain: 'domain',
  username: 'username',
};

// The primary tool each indicator routes to on Enter / "Go".
export const PRIMARY_ROUTE: Record<Indicator, string> = {
  url: '/osint/url',
  email: '/osint/breach',
  ip: '/osint/ip',
  hash: '/osint/hash',
  domain: '/osint/domain',
  username: '/osint/username',
};

export function routeFor(raw: string): string | null {
  const t = detectType(raw);
  if (!t) return null;
  return `${PRIMARY_ROUTE[t]}?q=${encodeURIComponent(raw.trim())}`;
}
