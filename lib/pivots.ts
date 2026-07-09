import type { Indicator } from './detect';

// Which tools accept each indicator type. Drives the hub "pivot board":
// paste an indicator, see everything you can run on it. `q` is filled in
// by the caller. Keep the primary tool first.
export interface Pivot {
  name: string;
  href: string;
  hint: string;
}

export const PIVOTS: Record<Indicator, Pivot[]> = {
  domain: [
    { name: 'Domain Lookup', href: '/osint/domain', hint: 'WHOIS, DNS, SSL & subdomains at once' },
    { name: 'IoC Scanner', href: '/osint/ioc', hint: 'Reputation across threat feeds' },
    { name: 'URL Tracer', href: '/osint/url', hint: 'Follow redirects and final destination' },
    { name: 'Wayback', href: '/osint/wayback', hint: 'Archived snapshots and old versions' },
  ],
  ip: [
    { name: 'IP Geolocation', href: '/osint/ip', hint: 'Location, ISP, ASN, network block' },
    { name: 'IoC Scanner', href: '/osint/ioc', hint: 'Shodan, GreyNoise, malware feeds' },
  ],
  email: [
    { name: 'Breach Lookup', href: '/osint/breach', hint: 'Exposure across breach databases' },
    { name: 'Email Headers', href: '/osint/email-headers', hint: 'Trace routing and auth results' },
  ],
  hash: [
    { name: 'Hash Analyzer', href: '/osint/hash', hint: 'Identify the algorithm' },
    { name: 'IoC Scanner', href: '/osint/ioc', hint: 'Check against malware databases' },
  ],
  url: [
    { name: 'URL Tracer', href: '/osint/url', hint: 'Full redirect chain and final URL' },
    { name: 'Wayback', href: '/osint/wayback', hint: 'Archived versions of the page' },
  ],
  username: [
    { name: 'Account Finder', href: '/osint/username', hint: 'Check the name across platforms' },
    { name: 'Digital Footprint', href: '/osint/social-footprint', hint: 'Social presence and mentions' },
  ],
};
