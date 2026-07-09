'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useReveal } from '../components/useReveal';
import { Radio, Globe, Server, MapPin, User, FileImage, Building2, Map, Scale, TrendingUp, ScanSearch, History, KeyRound, Search, AlertTriangle, Link, Mail, Satellite, PlaneTakeoff, Ship, Phone, Lock, Calculator, Shield, Binary, FileText, Landmark, LayoutDashboard, DollarSign, BarChart2, Package, Image, AtSign, Users, ShieldAlert, Home, Footprints, Car, Network, Bug, Crosshair, Flag, Database, type LucideIcon } from 'lucide-react';

// Smart detection — paste anything and route to the right tool
function detectAndRoute(raw: string) {
  const q = raw.trim();
  if (!q) return;
  const ipRx     = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hashRx   = /^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$/;
  const domainRx = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  const emailRx  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRx    = /^https?:\/\//i;
  if (urlRx.test(q))    { window.location.href = `/osint/url?q=${encodeURIComponent(q)}`; return; }
  if (emailRx.test(q))  { window.location.href = `/osint/email-headers?q=${encodeURIComponent(q)}`; return; }
  if (ipRx.test(q))     { window.location.href = `/osint/ip?q=${encodeURIComponent(q)}`; return; }
  if (hashRx.test(q))   { window.location.href = `/osint/hash?q=${encodeURIComponent(q)}`; return; }
  if (domainRx.test(q)) { window.location.href = `/osint/domain?q=${encodeURIComponent(q)}`; return; }
  window.location.href = `/osint/username?q=${encodeURIComponent(q)}`;
}

type Category = 'All' | 'Corporate' | 'Network' | 'Cyber' | 'Live' | 'Economic' | 'Utilities';

interface Tool {
  icon: LucideIcon;
  name: string;
  desc: string;
  href: string;
  category: Exclude<Category, 'All'>;
  live?: boolean;
  tags?: string[];
}

const TOOLS: Tool[] = [
  // Corporate
  { icon: LayoutDashboard, name: 'Corporate Intel',       desc: 'Full company package — filings, patents, contracts, exec dossier',      href: '/osint/company',          category: 'Corporate', tags: ['company', 'business', 'exec'] },
  { icon: Network,         name: 'OpenCorporates',        desc: '200M+ companies — officers, agents, dissolved entities',                href: '/osint/opencorporates',   category: 'Corporate', tags: ['company', 'officers', 'incorporation'] },
  { icon: FileText,        name: 'SEC EDGAR',             desc: '10-Ks, 8-Ks, proxies, insider transactions full-text search',          href: '/osint/edgar',            category: 'Corporate', tags: ['sec', 'filings', 'public company'] },
  { icon: Landmark,        name: 'Gov Contracts',         desc: 'Federal awards via USASpending — contracts, grants, IDVs',             href: '/osint/contracts',        category: 'Corporate', tags: ['government', 'spending', 'federal'] },
  { icon: Building2,       name: 'Corporate Investigator',desc: 'GLEIF ownership graph — parents, subsidiaries, offshore structures',   href: '/osint/corporate',        category: 'Corporate', tags: ['lei', 'ownership', 'subsidiaries'] },
  { icon: Search,          name: 'Entity Search',         desc: 'Wikipedia profile + cross-registry research links',                    href: '/osint/entity',           category: 'Corporate', tags: ['entity', 'wikipedia', 'research'] },
  { icon: AtSign,          name: 'Email Permutator',      desc: 'Generate every email format from a name and domain',                   href: '/osint/email-permutator', category: 'Corporate', tags: ['email', 'permutations', 'format'] },
  { icon: Users,           name: 'People Search',         desc: 'Public records, court data, and social profiles by name',              href: '/osint/people',           category: 'Corporate', tags: ['people', 'person', 'public records'] },
  { icon: User,            name: 'Background Check',      desc: 'Federal courts, criminal history, voter records, sex offender reg',    href: '/osint/background',       category: 'Corporate', tags: ['background', 'criminal', 'court'] },
  { icon: Home,            name: 'Address & Property',    desc: 'Reverse address — ownership, assessor data, aerial imagery',           href: '/osint/address',          category: 'Corporate', tags: ['address', 'property', 'real estate'] },
  // Network
  { icon: Globe,           name: 'Domain Lookup',         desc: 'WHOIS, DNS, SSL certs & subdomains for a domain — all in one',        href: '/osint/domain',           category: 'Network', tags: ['domain', 'whois', 'dns', 'ssl', 'subdomains', 'registration', 'nameservers'] },
  { icon: MapPin,          name: 'IP Geolocation',        desc: 'Geographic location, ISP, ASN, and network block for any IP',          href: '/osint/ip',               category: 'Network', tags: ['ip', 'location', 'asn', 'isp'] },
  { icon: Link,            name: 'URL Redirect Tracer',   desc: 'Full redirect chain for any shortened or obfuscated URL',              href: '/osint/url',              category: 'Network', tags: ['url', 'redirect', 'link'] },
  { icon: Shield,          name: 'MAC Lookup',            desc: 'Hardware vendor from any MAC address or OUI prefix',                  href: '/osint/mac',              category: 'Network', tags: ['mac', 'oui', 'vendor', 'hardware'] },
  // Cyber
  { icon: Crosshair,       name: 'IoC Scanner',           desc: 'IP, domain, hash against Shodan, GreyNoise, MalwareBazaar, URLScan',  href: '/osint/ioc',              category: 'Cyber', tags: ['ioc', 'malware', 'threat', 'shodan'] },
  { icon: KeyRound,        name: 'Hash Analyzer',         desc: 'Identify hash type — MD5, SHA-256, bcrypt, NTLM, and 15+ more',      href: '/osint/hash',             category: 'Cyber', tags: ['hash', 'md5', 'sha256', 'identify'] },
  { icon: AlertTriangle,   name: 'CVE Search',            desc: 'NIST NVD vulnerabilities — CVSS scores, attack vectors, patches',     href: '/osint/cve',              category: 'Cyber', tags: ['cve', 'vulnerability', 'nvd', 'cvss'] },
  { icon: Mail,            name: 'Email Header Trace',    desc: 'Routing path, SPF/DKIM/DMARC results, originating IP',               href: '/osint/email-headers',    category: 'Cyber', tags: ['email', 'headers', 'spf', 'dkim'] },
  { icon: User,            name: 'Account Finder',        desc: 'Username across 23 platforms via live API — GitHub to Chess.com',     href: '/osint/username',         category: 'Cyber', tags: ['username', 'social', 'accounts'] },
  { icon: History,         name: 'Wayback Machine',       desc: 'Internet Archive snapshots — find deleted pages and old versions',    href: '/osint/wayback',          category: 'Cyber', tags: ['wayback', 'archive', 'history', 'cached'] },
  { icon: FileImage,       name: 'EXIF Metadata',         desc: 'Hidden data in photos — GPS coordinates, device info, timestamps',    href: '/osint/metadata',         category: 'Cyber', tags: ['exif', 'metadata', 'photo', 'gps'] },
  { icon: Search,          name: 'Google Dork Builder',   desc: 'Advanced search operators — exposed files, login pages, leaks',       href: '/osint/dorks',            category: 'Cyber', tags: ['google', 'dork', 'dorking', 'search'] },
  { icon: Image,           name: 'Reverse Image Search',  desc: 'Google, TinEye, Yandex, Bing, and Baidu in one click',               href: '/osint/reverse-image',    category: 'Cyber', tags: ['image', 'reverse', 'photo search'] },
  { icon: ShieldAlert,     name: 'Breach Lookup',         desc: 'Email exposure across HIBP, DeHashed, and IntelligenceX',            href: '/osint/breach',           category: 'Cyber', tags: ['breach', 'password', 'leak', 'hibp'] },
  { icon: Footprints,      name: 'Digital Footprint',     desc: 'Social presence, news mentions, Google dorks by full name',          href: '/osint/social-footprint', category: 'Cyber', tags: ['footprint', 'social', 'name', 'osint'] },
  { icon: ShieldAlert,     name: 'Threat Actor DB',       desc: 'APT profiles — attribution, targets, tradecraft, MITRE mapping',     href: '/osint/threat-actors',    category: 'Cyber', tags: ['apt', 'threat actor', 'nation state'] },
  { icon: Bug,             name: 'Ransomware Tracker',    desc: 'Live victim feed from active ransomware leak sites',                  href: '/osint/ransomware',       category: 'Cyber', live: true, tags: ['ransomware', 'victims', 'live'] },
  { icon: Database,        name: 'Cyber Incident DB',     desc: '50+ major attacks from Stuxnet to Salt Typhoon — searchable',        href: '/osint/incidents',        category: 'Cyber', tags: ['incidents', 'cyberattack', 'history'] },
  // Live
  { icon: Flag,            name: 'Country Intel',         desc: 'Threat assessments and cyber risk for 30+ countries',                 href: '/intel',                  category: 'Live', live: true, tags: ['country', 'threat', 'intelligence'] },
  { icon: Radio,           name: 'Live Intel Feed',       desc: 'Real-time from BBC, Krebs, The Record, Foreign Policy',              href: '/osint/feed',             category: 'Live', live: true, tags: ['news', 'feed', 'live', 'intel'] },
  { icon: Map,             name: 'Conflict Tracker',      desc: 'Active conflict zones — GDELT and ACLED data, mapped in real time',  href: '/osint/conflict',         category: 'Live', live: true, tags: ['conflict', 'war', 'map', 'acled'] },
  { icon: TrendingUp,      name: 'Polymarket',            desc: 'Prediction market odds on geopolitical events',                      href: '/osint/polymarket',       category: 'Live', live: true, tags: ['polymarket', 'prediction', 'odds'] },
  { icon: Satellite,       name: 'Satellite Tracker',     desc: 'Real-time orbital positions with ground tracks and pass predictions', href: '/tools/satellite-tracker',category: 'Live', live: true, tags: ['satellite', 'iss', 'orbital', 'tle'] },
  { icon: PlaneTakeoff,    name: 'Flight Tracker',        desc: 'Live global air traffic — ADS-B telemetry via OpenSky',              href: '/tools/flight-tracker',   category: 'Live', live: true, tags: ['flight', 'aircraft', 'adsb', 'live'] },
  { icon: Ship,            name: 'Vessel Tracker',        desc: 'AIS maritime tracking — MMSI lookup, position, destination',         href: '/tools/vessel-tracker',   category: 'Live', live: true, tags: ['vessel', 'ship', 'ais', 'maritime'] },
  // Economic
  { icon: DollarSign,      name: 'Currency Tracker',      desc: 'Live exchange rates — sanction pressure, capital flight signals',     href: '/osint/currency',         category: 'Economic', live: true, tags: ['currency', 'exchange rate', 'forex'] },
  { icon: BarChart2,       name: 'Economic Profiles',     desc: 'World Bank data — GDP, inflation, debt, trade for 200+ countries',   href: '/osint/economics',        category: 'Economic', tags: ['gdp', 'economics', 'world bank'] },
  { icon: Package,         name: 'Commodity Monitor',     desc: 'Strategic commodities — oil, gold, palladium, Monero',               href: '/osint/commodities',      category: 'Economic', live: true, tags: ['commodity', 'oil', 'gold', 'crypto'] },
  { icon: Scale,           name: 'Sanctions Screener',    desc: 'OFAC SDN, EU, UN, and BIS lists — search by name',                  href: '/osint/sanctions',        category: 'Economic', tags: ['sanctions', 'ofac', 'sdn', 'eu'] },
  // Utilities
  { icon: Calculator,      name: 'Subnet Calculator',     desc: 'CIDR math — network address, broadcast, host range, mask',           href: '/osint/subnet',           category: 'Utilities', tags: ['subnet', 'cidr', 'network'] },
  { icon: KeyRound,        name: 'JWT Decoder',           desc: 'Decode and inspect JWT tokens entirely client-side',                 href: '/osint/jwt',              category: 'Utilities', tags: ['jwt', 'token', 'decode'] },
  { icon: Binary,          name: 'Base64',                desc: 'Encode / decode Base64 — Unicode supported, client-side',            href: '/osint/base64',           category: 'Utilities', tags: ['base64', 'encode', 'decode'] },
  { icon: Phone,           name: 'Phone OSINT',           desc: 'Carrier, line type, and OSINT launch for any phone number',          href: '/tools/phone-lookup',     category: 'Utilities', tags: ['phone', 'number', 'carrier'] },
  { icon: Car,             name: 'VIN Decoder',           desc: 'Make, model, year, engine, and trim via NHTSA',                     href: '/osint/vin',              category: 'Utilities', tags: ['vin', 'vehicle', 'car', 'nhtsa'] },
];

// Use-case quick starts
const QUICK_STARTS = [
  {
    label: 'Investigate a company',
    tools: ['Corporate Intel', 'SEC EDGAR', 'Gov Contracts', 'OpenCorporates'],
    href: '/osint/company',
  },
  {
    label: 'Trace a domain or IP',
    tools: ['WHOIS', 'DNS Intelligence', 'IP Geolocation', 'SSL Certificates'],
    href: '/osint/whois',
  },
  {
    label: 'Profile a person or account',
    tools: ['People Search', 'Account Finder', 'Digital Footprint', 'Breach Lookup'],
    href: '/osint/people',
  },
  {
    label: 'Identify a threat or indicator',
    tools: ['IoC Scanner', 'CVE Search', 'Hash Analyzer', 'Threat Actor DB'],
    href: '/osint/ioc',
  },
];

const CATEGORIES: Category[] = ['All', 'Corporate', 'Network', 'Cyber', 'Live', 'Economic', 'Utilities'];

const CAT_META: Record<string, { color: string; label: string }> = {
  Corporate: { color: '#ffaa00', label: 'Corporate' },
  Network:   { color: '#1e9eff', label: 'Network'   },
  Cyber:     { color: '#ff4444', label: 'Cyber'     },
  Live:      { color: '#22cc66', label: 'Live'       },
  Economic:  { color: '#00c9b0', label: 'Economic'  },
  Utilities: { color: '#b464ff', label: 'Utilities' },
};

export default function OSINTHub() {
  const [query, setQuery]     = useState('');
  const [category, setCategory] = useState<Category>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // homepage quick-investigate lands here as ?q= — route it as promised
    const q = params.get('q');
    if (q && q.trim()) { detectAndRoute(q); return; }
    const cat = params.get('cat') as Category | null;
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, []);

  useReveal([query, category]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: TOOLS.length };
    CATEGORIES.slice(1).forEach(c => { m[c] = TOOLS.filter(t => t.category === c).length; });
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return TOOLS.filter(t => {
      if (category !== 'All' && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.includes(q))
      );
    });
  }, [query, category]);

  const showQuickStarts = !query.trim() && category === 'All';
  const liveCount = filtered.filter(t => t.live).length;

  // Group by category when showing all unfiltered
  const grouped = useMemo(() => {
    if (query.trim() || category !== 'All') return null;
    const g: Record<string, Tool[]> = {};
    CATEGORIES.slice(1).forEach(c => { g[c] = TOOLS.filter(t => t.category === c); });
    return g;
  }, [query, category]);

  return (
    <>
      <style>{`
        .oz { padding-top: 70px; }

        /* ── HERO ── */
        .oz-hero { padding: 72px 40px 0; max-width: 1280px; margin: 0 auto; }
        .oz-eyebrow {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
          animation: fadeUp 0.6s var(--ease-expo) 0.05s both;
        }
        .oz-eyebrow::after { content: ''; height: 1px; flex: 1; background: var(--border); }
        .oz-hero h1 {
          font-family: var(--font-display); font-size: clamp(44px, 6.5vw, 92px);
          font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;
          line-height: 0.95; color: #fff; margin-bottom: 16px;
          animation: fadeUp 0.6s var(--ease-expo) 0.12s both;
        }
        .oz-sub {
          font-size: 17px; color: var(--text-secondary); line-height: 1.6;
          max-width: 560px; margin-bottom: 44px;
          animation: fadeUp 0.6s var(--ease-expo) 0.2s both;
        }

        /* ── SEARCH ── */
        .oz-search { max-width: 720px; margin-bottom: 56px; animation: fadeUp 0.6s var(--ease-expo) 0.28s both; }
        .oz-search label {
          display: block; font-family: var(--font-mono); font-size: 12px;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-secondary); margin-bottom: 10px;
        }
        .oz-search-row { display: flex; }
        .oz-search-row input {
          flex: 1; background: var(--bg-secondary);
          border: 1px solid var(--border-bright); border-right: none;
          color: var(--text-primary); font-family: var(--font-mono);
          font-size: 13px; padding: 15px 16px;
        }
        .oz-search-row input::placeholder { color: var(--text-muted); }
        .oz-search-row input:focus { border-color: var(--accent); }
        .oz-search-row button {
          font-family: var(--font-mono); font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--accent); border: 1px solid var(--accent); color: #000;
          padding: 15px 24px; cursor: pointer; white-space: nowrap;
        }
        .oz-search-row button:hover { background: #4db3ff; }
        .oz-hint {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em;
          color: var(--text-muted); margin-top: 12px;
        }
        .oz-ex { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .oz-ex-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
        .oz-ex button {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em;
          color: var(--text-secondary); background: var(--bg-card);
          border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer;
        }
        .oz-ex button:hover, .oz-ex button:focus-visible { color: #fff; border-color: var(--accent); }

        /* ── QUICK STARTS ── */
        .oz-qs-h {
          display: flex; align-items: baseline; gap: 14px;
          padding-bottom: 14px; margin-bottom: 20px;
          border-bottom: 1px solid var(--border-bright);
        }
        .oz-qs-h h2 {
          font-family: var(--font-display); font-size: 18px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.01em; color: #fff;
        }
        .oz-qs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 64px; }
        .oz-qs a { background: var(--bg-primary); padding: 22px 24px; text-decoration: none; display: flex; flex-direction: column; }
        .oz-qs a:hover, .oz-qs a:focus-visible { background: var(--bg-card); }
        .oz-qs-task {
          font-family: var(--font-display); font-size: 17px; font-weight: 700;
          color: var(--text-primary); line-height: 1.25; margin-bottom: 12px;
        }
        .oz-qs a:hover .oz-qs-task { color: var(--accent); }
        .oz-qs-tool {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em;
          color: var(--text-muted); line-height: 1.7;
        }
        .oz-qs-arrow { margin-top: 14px; color: var(--text-muted); font-size: 15px; }
        .oz-qs a:hover .oz-qs-arrow { color: var(--accent); }

        /* ── STICKY CATEGORY BAR ── */
        .oz-bar {
          position: sticky; top: 70px; z-index: 50;
          background: rgba(8,8,10,0.96); backdrop-filter: blur(16px);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .oz-bar-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; display: flex; align-items: stretch; }
        .oz-tab {
          font-family: var(--font-mono); font-size: 12px; font-weight: 500;
          letter-spacing: 0.05em; text-transform: uppercase;
          padding: 0 16px; height: 48px;
          color: var(--text-secondary); cursor: pointer;
          border: none; background: none; border-bottom: 2px solid transparent;
          white-space: nowrap; display: flex; align-items: center; gap: 8px;
        }
        .oz-tab:hover { color: #fff; }
        .oz-tab[aria-pressed="true"] { color: #fff; border-bottom-color: var(--accent); }
        .oz-tab-count { font-size: 11px; color: var(--text-muted); }
        .oz-pill { margin-left: auto; display: flex; align-items: center; }
        .oz-pill input {
          background: none; border: none; border-left: 1px solid var(--border);
          font-family: var(--font-mono); font-size: 12px; color: var(--text-primary);
          width: 180px; padding: 14px 0 14px 16px; height: 100%;
        }
        .oz-pill input::placeholder { color: var(--text-muted); }

        /* ── CONTENT ── */
        .oz-content { max-width: 1280px; margin: 0 auto; padding: 40px 40px 88px; }
        .oz-note {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          color: var(--text-secondary); text-transform: uppercase; margin-bottom: 24px;
        }
        .oz-note em { color: var(--accent); font-style: normal; }

        /* ── CATEGORY SECTIONS ── */
        .oz-cat { margin-bottom: 56px; }
        .oz-cat-h {
          display: flex; align-items: baseline; gap: 14px;
          padding-bottom: 12px; margin-bottom: 16px;
          border-bottom: 1px solid var(--border-bright);
        }
        .oz-cat-h .oz-cat-idx { font-family: var(--font-mono); font-size: 13px; color: var(--accent); }
        .oz-cat-h h2 {
          font-family: var(--font-display); font-size: 18px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.01em; color: #fff;
        }
        .oz-cat-h .oz-cat-n {
          margin-left: auto; font-family: var(--font-mono); font-size: 12px;
          letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase;
        }

        /* ── TOOL GRID ── */
        .oz-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
        .oz-tool {
          background: var(--bg-primary); padding: 18px 20px; text-decoration: none;
          display: flex; align-items: flex-start; gap: 14px;
        }
        .oz-tool:hover, .oz-tool:focus-visible { background: var(--bg-card); }
        .oz-tool-icon { flex-shrink: 0; margin-top: 2px; opacity: 0.75; }
        .oz-tool-body { flex: 1; min-width: 0; }
        .oz-tool h3 {
          font-family: var(--font-display); font-size: 15.5px; font-weight: 600;
          color: var(--text-primary); line-height: 1.25; margin-bottom: 4px;
        }
        .oz-tool:hover h3 { color: var(--accent); }
        .oz-tool-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.55; }
        .oz-tool-foot { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
        .oz-live {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          color: #22cc66; text-transform: uppercase;
        }
        /* finite (4s) — keeps the pulse out of WCAG 2.2.2 scope entirely */
        .oz-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #22cc66; animation: pulse 2s 2; }
        .oz-tool-cat {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .oz-empty {
          padding: 64px 0; text-align: center;
          font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em;
          color: var(--text-muted); text-transform: uppercase;
        }

        /* ── FOOTER ── */
        .oz-foot { border-top: 1px solid var(--border); padding: 28px 40px; }
        .oz-foot-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em;
          color: var(--text-muted); text-transform: uppercase;
        }

        @media (max-width: 1100px) { .oz-grid { grid-template-columns: repeat(2, 1fr); } .oz-qs { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .oz-hero { padding: 48px 16px 0; }
          .oz-content { padding: 32px 16px 64px; }
          .oz-bar-inner { padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
          .oz-bar-inner::-webkit-scrollbar { display: none; }
          .oz-pill { display: none; }
          .oz-grid { grid-template-columns: 1fr; }
          .oz-search-row { flex-direction: column; }
          .oz-search-row input { border-right: 1px solid var(--border-bright); }
          .oz-foot { padding: 24px 16px; }
          .oz-foot-inner { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) { .oz-qs { grid-template-columns: 1fr; } }
      `}</style>

      <main id="main" className="oz">
        <div className="oz-hero">
          <p className="oz-eyebrow">The Rudd Report · Toolkit</p>
          <h1>OSINT Toolkit</h1>
          <p className="oz-sub">{TOOLS.length} free investigation tools. No account required.</p>

          <div className="oz-search">
            <label htmlFor="oz-q">Paste anything — we&apos;ll pick the right tool</label>
            <div className="oz-search-row">
              <input
                id="oz-q"
                ref={inputRef}
                placeholder="An IP, domain, hash, email, or username…"
                value={query}
                onChange={e => { setQuery(e.target.value); setCategory('All'); }}
                onKeyDown={e => e.key === 'Enter' && !filtered.length && detectAndRoute(query)}
              />
              <button type="button" onClick={() => detectAndRoute(query)}>Go →</button>
            </div>
            <div className="oz-ex" role="group" aria-label="Example inputs to try">
              <span className="oz-ex-label" aria-hidden="true">Try</span>
              {['8.8.8.8', 'google.com', '5d41402abc4b2a76b9719d911017c592', 'torvalds'].map(v => (
                <button key={v} type="button" onClick={() => { setQuery(v); detectAndRoute(v); }}>{v}</button>
              ))}
            </div>
          </div>

          {showQuickStarts && (
            <section aria-labelledby="oz-h-qs">
              <div className="oz-qs-h rv">
                <h2 id="oz-h-qs">Common tasks</h2>
              </div>
              <div className="oz-qs">
                {QUICK_STARTS.map((qs, i) => (
                  <a key={qs.href} href={qs.href} className={`rv rv-d${(i % 4) + 1}`}>
                    <span className="oz-qs-task">{qs.label}</span>
                    {qs.tools.map(t => <span key={t} className="oz-qs-tool">{t}</span>)}
                    <span className="oz-qs-arrow" aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* CATEGORY BAR */}
        <div className="oz-bar">
          <div className="oz-bar-inner" role="group" aria-label="Filter tools by category">
            {CATEGORIES.map(cat => {
              const active = category === cat && !query.trim();
              return (
                <button
                  key={cat}
                  className="oz-tab"
                  aria-pressed={active}
                  onClick={() => { setCategory(cat); setQuery(''); }}
                >
                  {cat === 'All' ? 'All tools' : CAT_META[cat].label}
                  <span className="oz-tab-count">{counts[cat]}</span>
                </button>
              );
            })}
            <div className="oz-pill">
              <input
                aria-label="Filter tools"
                placeholder="Filter..."
                value={query}
                onChange={e => { setQuery(e.target.value); setCategory('All'); }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="oz-content">
          <p aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
            {filtered.length} tools shown
          </p>
          {query.trim() && (
            <p className="oz-note">
              <em>{filtered.length}</em> result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query.trim()}&rdquo;
              {liveCount > 0 && <span> · {liveCount} live</span>}
            </p>
          )}

          {/* FILTERED / SINGLE-CATEGORY FLAT GRID */}
          {(query.trim() || category !== 'All') && (
            filtered.length === 0 ? (
              <p className="oz-empty">No tools match &ldquo;{query}&rdquo;</p>
            ) : (
              <div className="oz-grid">
                {filtered.map(tool => <ToolCard key={tool.href} tool={tool} showCat={category === 'All'} />)}
              </div>
            )
          )}

          {/* GROUPED ALL VIEW */}
          {!query.trim() && category === 'All' && grouped && CATEGORIES.slice(1).map((cat, ci) => {
            const tools = grouped[cat];
            const { label } = CAT_META[cat];
            return (
              <section key={cat} className="oz-cat" aria-labelledby={`oz-h-${cat}`}>
                <div className="oz-cat-h rv">
                  <span className="oz-cat-idx" aria-hidden="true">{String(ci + 1).padStart(2, '0')}</span>
                  <h2 id={`oz-h-${cat}`}>{label}</h2>
                  <span className="oz-cat-n">{tools.length} tools</span>
                </div>
                <div className="oz-grid">
                  {tools.map(tool => <ToolCard key={tool.href} tool={tool} showCat={false} />)}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="oz-foot">
          <div className="oz-foot-inner">
            <span>© 2026 The Rudd Report</span>
            <span>Independent publication · Open-source intelligence &amp; analysis</span>
          </div>
        </footer>
      </main>
    </>
  );
}

function ToolCard({ tool, showCat }: { tool: Tool; showCat: boolean }) {
  const { color } = CAT_META[tool.category];
  const Icon = tool.icon;
  return (
    <a href={tool.href} className="oz-tool">
      <span className="oz-tool-icon" style={{ color }} aria-hidden="true"><Icon size={18} strokeWidth={1.5} /></span>
      <div className="oz-tool-body">
        <h3>{tool.name}</h3>
        <div className="oz-tool-desc">{tool.desc}</div>
        {(tool.live || showCat) && (
          <div className="oz-tool-foot">
            {tool.live && (
              <span className="oz-live"><span className="oz-live-dot" aria-hidden="true" />Live</span>
            )}
            {showCat && (
              <span className="oz-tool-cat" style={{ color }}>{tool.category}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
