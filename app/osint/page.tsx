'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
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
  if (domainRx.test(q)) { window.location.href = `/osint/whois?q=${encodeURIComponent(q)}`; return; }
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
  { icon: Globe,           name: 'WHOIS',                 desc: 'Domain registration, registrar, nameservers, and contact records',     href: '/osint/whois',            category: 'Network', tags: ['domain', 'registration', 'registrar'] },
  { icon: Server,          name: 'DNS Intelligence',      desc: 'Full DNS records — MX, TXT, SPF, DKIM, DMARC, hosting',               href: '/osint/dns',              category: 'Network', tags: ['dns', 'records', 'email security'] },
  { icon: MapPin,          name: 'IP Geolocation',        desc: 'Geographic location, ISP, ASN, and network block for any IP',          href: '/osint/ip',               category: 'Network', tags: ['ip', 'location', 'asn', 'isp'] },
  { icon: ScanSearch,      name: 'Subdomain Scanner',     desc: 'Certificate transparency enumeration — find all subdomains',           href: '/osint/subdomains',       category: 'Network', tags: ['subdomain', 'enumeration', 'recon'] },
  { icon: Lock,            name: 'SSL Certificates',      desc: 'CT log search — cert history, alternative names, issuer',             href: '/osint/ssl',              category: 'Network', tags: ['ssl', 'certificate', 'tls'] },
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

// Use-case oriented quick starts — what a human editor would curate
const QUICK_STARTS = [
  {
    label: 'Investigate a company',
    tools: ['Corporate Intel', 'SEC EDGAR', 'Gov Contracts', 'OpenCorporates'],
    href: '/osint/company',
    color: '#ffaa00',
  },
  {
    label: 'Trace a domain or IP',
    tools: ['WHOIS', 'DNS Intelligence', 'IP Geolocation', 'SSL Certificates'],
    href: '/osint/whois',
    color: '#1e9eff',
  },
  {
    label: 'Profile a person or account',
    tools: ['People Search', 'Account Finder', 'Digital Footprint', 'Breach Lookup'],
    href: '/osint/people',
    color: '#b464ff',
  },
  {
    label: 'Identify a threat or indicator',
    tools: ['IoC Scanner', 'CVE Search', 'Hash Analyzer', 'Threat Actor DB'],
    href: '/osint/ioc',
    color: '#ff4444',
  },
];

const CATEGORIES: Category[] = ['All', 'Corporate', 'Network', 'Cyber', 'Live', 'Economic', 'Utilities'];

const CAT_META: Record<string, { color: string; label: string }> = {
  Corporate: { color: '#ffaa00', label: 'Corporate' },
  Network:   { color: '#1e9eff', label: 'Network'   },
  Cyber:     { color: '#ff4444', label: 'Cyber'     },
  Live:      { color: '#00ff88', label: 'Live'       },
  Economic:  { color: '#00c9b0', label: 'Economic'  },
  Utilities: { color: '#b464ff', label: 'Utilities' },
};

export default function OSINTHub() {
  const [query, setQuery]     = useState('');
  const [category, setCategory] = useState<Category>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat') as Category | null;
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, []);

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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }
        .page { padding-top: 70px; }

        /* ── HERO ── */
        .hero { padding: 52px 40px 0; max-width: 1280px; margin: 0 auto; }
        .hero-top { margin-bottom: 36px; }
        .eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .eyebrow-line { width: 24px; height: 1px; background: #1e9eff; }
        .eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(32px, 4.5vw, 58px); font-weight: 900; color: #fff; letter-spacing: 3px; text-transform: uppercase; line-height: 1; margin-bottom: 14px; }
        .hero-sub { font-size: 15px; color: #5a7a94; line-height: 1.6; max-width: 560px; }

        /* ── SEARCH BAR ── */
        .search-section { margin-bottom: 48px; }
        .search-bar { display: flex; border: 1px solid rgba(30,158,255,0.2); background: rgba(6,12,20,0.9); max-width: 700px; }
        .search-bar:focus-within { border-color: rgba(30,158,255,0.5); }
        .search-in { flex: 1; background: none; border: none; outline: none; padding: 15px 20px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #c0cfe0; letter-spacing: 0.5px; }
        .search-in::placeholder { color: #2d4560; }
        .search-go { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; background: #1e9eff; color: #000; border: none; padding: 15px 22px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-go:hover { background: #4db3ff; }
        .detect-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .detect-chip { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #2d4560; border: 1px solid rgba(30,158,255,0.07); padding: 4px 9px; }
        .detect-chip b { color: #3d6a8a; font-weight: 400; }

        /* ── QUICK STARTS ── */
        .qs-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 4px; color: #2d4560; text-transform: uppercase; margin-bottom: 12px; }
        .qs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 52px; }
        .qs-card { background: #060c14; border: 1px solid rgba(255,255,255,0.04); padding: 18px 20px; text-decoration: none; display: block; transition: background 0.2s; position: relative; }
        .qs-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.2s; }
        .qs-card:hover { background: #0a1420; }
        .qs-card:hover::after { opacity: 1; }
        .qs-task { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #c0cfe0; margin-bottom: 10px; line-height: 1.2; }
        .qs-tools { display: flex; flex-direction: column; gap: 3px; }
        .qs-tool { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 0.5px; color: #2d4560; }
        .qs-arrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; margin-top: 12px; transition: transform 0.2s; display: inline-block; }
        .qs-card:hover .qs-arrow { transform: translateX(3px); }

        /* ── STICKY CATEGORY BAR ── */
        .cat-bar {
          position: sticky; top: 70px; z-index: 50;
          background: rgba(3,6,8,0.97); backdrop-filter: blur(20px);
          border-top: 1px solid rgba(30,158,255,0.06);
          border-bottom: 1px solid rgba(30,158,255,0.06);
        }
        .cat-inner { max-width: 1280px; margin: 0 auto; padding: 0 40px; display: flex; align-items: stretch; gap: 0; }
        .cat-tab { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 0 18px; height: 44px; color: #2d4560; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; display: flex; align-items: center; gap: 7px; }
        .cat-tab:hover { color: #7a9bb5; }
        .cat-tab.active { color: #c0cfe0; }
        .cat-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: inherit; opacity: 0.5; }
        .search-pill { margin-left: auto; display: flex; align-items: center; }
        .search-pill input { background: none; border: none; outline: none; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 0.5px; width: 160px; padding: 0; }
        .search-pill input::placeholder { color: #2d4560; }

        /* ── CONTENT ── */
        .content { max-width: 1280px; margin: 0 auto; padding: 32px 40px 80px; }

        /* search results label */
        .results-note { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #2d4560; text-transform: uppercase; margin-bottom: 20px; }
        .results-note em { color: #1e9eff; font-style: normal; }

        /* ── CATEGORY SECTION ── */
        .cat-section { margin-bottom: 40px; }
        .cat-hdr { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; }
        .cat-hdr-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
        .cat-hdr-line { flex: 1; height: 1px; }
        .cat-hdr-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #2d4560; letter-spacing: 2px; }

        /* ── TOOL GRID ── */
        .tool-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .tool-card { background: #060c14; border: 1px solid rgba(255,255,255,0.035); padding: 16px 18px; text-decoration: none; display: flex; align-items: flex-start; gap: 14px; transition: background 0.15s, border-color 0.15s; position: relative; }
        .tool-card:hover { background: #0a1520; border-color: rgba(255,255,255,0.07); }
        .tc-icon { flex-shrink: 0; margin-top: 1px; opacity: 0.55; transition: opacity 0.15s; }
        .tool-card:hover .tc-icon { opacity: 0.9; }
        .tc-body { flex: 1; min-width: 0; }
        .tc-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #9ab0c4; letter-spacing: 0.3px; margin-bottom: 3px; line-height: 1.2; transition: color 0.15s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tool-card:hover .tc-name { color: #c0cfe0; }
        .tc-desc { font-family: 'Barlow', sans-serif; font-size: 11px; color: #2d4560; line-height: 1.45; transition: color 0.15s; }
        .tool-card:hover .tc-desc { color: #3d5870; }
        .tc-foot { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .tc-live { display: flex; align-items: center; gap: 4px; font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 2px; color: #00cc66; text-transform: uppercase; }
        .tc-live-dot { width: 4px; height: 4px; border-radius: 50%; background: #00cc66; animation: pulse 2s infinite; }
        .tc-cat { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 2px; padding: 2px 5px; border: 1px solid; text-transform: uppercase; opacity: 0.5; }
        .tc-arrow { margin-left: auto; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #1e3550; transition: all 0.15s; flex-shrink: 0; }
        .tool-card:hover .tc-arrow { transform: translateX(3px); }

        /* ── EMPTY ── */
        .no-results { padding: 60px 0; text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #2d4560; text-transform: uppercase; }

        /* ── FOOTER ── */
        footer { border-top: 1px solid rgba(30,158,255,0.06); padding: 28px 40px; }
        .foot-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .foot-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #2d4560; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 1100px) { .tool-grid { grid-template-columns: repeat(2, 1fr); } .qs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .hero, .content { padding-left: 20px; padding-right: 20px; }
          .hero { padding-top: 36px; }
          .cat-inner { padding: 0 20px; overflow-x: auto; scrollbar-width: none; }
          .cat-inner::-webkit-scrollbar { display: none; }
          .search-pill { display: none; }
          .tool-grid { grid-template-columns: 1fr; }
          .qs-grid { grid-template-columns: 1fr 1fr; gap: 2px; }
          .foot-inner { flex-direction: column; gap: 8px; text-align: center; }
        }
        @media (max-width: 480px) { .qs-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page">
        <div className="hero">
          <div className="hero-top">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <div className="eyebrow-text">The Rudd Report</div>
            </div>
            <div className="hero-title">OSINT Hub</div>
            <p className="hero-sub">{TOOLS.length} free tools. No account required.</p>
          </div>

          <div className="search-section">
            <div className="search-bar">
              <input
                ref={inputRef}
                className="search-in"
                placeholder="Paste an IP, domain, hash, URL, email, or username..."
                value={query}
                onChange={e => { setQuery(e.target.value); setCategory('All'); }}
                onKeyDown={e => e.key === 'Enter' && !filtered.length && detectAndRoute(query)}
              />
              <button className="search-go" onClick={() => detectAndRoute(query)}>Investigate →</button>
            </div>
            <div className="detect-row">
              <div className="detect-chip"><b>IP address</b> → Geolocation</div>
              <div className="detect-chip"><b>domain</b> → WHOIS</div>
              <div className="detect-chip"><b>hash</b> → Analyzer</div>
              <div className="detect-chip"><b>email header</b> → Trace</div>
              <div className="detect-chip"><b>URL</b> → Redirect chain</div>
              <div className="detect-chip"><b>username</b> → Account finder</div>
            </div>
          </div>

          {showQuickStarts && (
            <>
              <div className="qs-label">Common tasks</div>
              <div className="qs-grid">
                {QUICK_STARTS.map(qs => (
                  <a key={qs.href} href={qs.href} className="qs-card" style={{ borderColor: `${qs.color}18` }}
                     onMouseEnter={e => { (e.currentTarget.querySelector('.qs-arrow') as HTMLElement).style.color = qs.color; }}
                     onMouseLeave={e => { (e.currentTarget.querySelector('.qs-arrow') as HTMLElement).style.color = '#2d4560'; }}>
                    <style>{`.qs-card[href="${qs.href}"]::after { background: ${qs.color}; }`}</style>
                    <div className="qs-task" style={{ color: qs.color }}>{qs.label}</div>
                    <div className="qs-tools">
                      {qs.tools.map(t => <div key={t} className="qs-tool">→ {t}</div>)}
                    </div>
                    <div className="qs-arrow" style={{ color: '#2d4560' }}>Open →</div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CATEGORY BAR */}
        <div className="cat-bar">
          <div className="cat-inner">
            {CATEGORIES.map(cat => {
              const color = cat === 'All' ? '#1e9eff' : CAT_META[cat]?.color;
              const active = category === cat && !query.trim();
              return (
                <button
                  key={cat}
                  className={`cat-tab${active ? ' active' : ''}`}
                  style={active ? { borderBottomColor: color, color } : {}}
                  onClick={() => { setCategory(cat); setQuery(''); }}
                >
                  {cat === 'All' ? 'All tools' : CAT_META[cat].label}
                  <span className="cat-count">{counts[cat]}</span>
                </button>
              );
            })}
            <div className="search-pill">
              <input
                placeholder="Filter..."
                value={query}
                onChange={e => { setQuery(e.target.value); setCategory('All'); }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="content">
          {query.trim() && (
            <div className="results-note">
              <em>{filtered.length}</em> result{filtered.length !== 1 ? 's' : ''} for &ldquo;{query.trim()}&rdquo;
              {liveCount > 0 && <span> — {liveCount} live</span>}
            </div>
          )}

          {/* FILTERED / SINGLE-CATEGORY FLAT GRID */}
          {(query.trim() || category !== 'All') && (
            filtered.length === 0 ? (
              <div className="no-results">No tools match &ldquo;{query}&rdquo;</div>
            ) : (
              <div className="tool-grid">
                {filtered.map(tool => <ToolCard key={tool.href} tool={tool} showCat={category === 'All'} />)}
              </div>
            )
          )}

          {/* GROUPED ALL VIEW */}
          {!query.trim() && category === 'All' && grouped && CATEGORIES.slice(1).map(cat => {
            const tools = grouped[cat];
            const { color, label } = CAT_META[cat];
            return (
              <div key={cat} className="cat-section">
                <div className="cat-hdr">
                  <div className="cat-hdr-name" style={{ color }}>{label}</div>
                  <div className="cat-hdr-line" style={{ background: `linear-gradient(90deg, ${color}25, transparent)` }} />
                  <div className="cat-hdr-count">{tools.length}</div>
                </div>
                <div className="tool-grid">
                  {tools.map(tool => <ToolCard key={tool.href} tool={tool} showCat={false} />)}
                </div>
              </div>
            );
          })}
        </div>

        <footer>
          <div className="foot-inner">
            <div className="foot-copy">© 2026 The Rudd Report</div>
            <div className="foot-copy">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}

function ToolCard({ tool, showCat }: { tool: Tool; showCat: boolean }) {
  const { color } = CAT_META[tool.category];
  const Icon = tool.icon;
  return (
    <a href={tool.href} className="tool-card">
      <div className="tc-icon" style={{ color }}><Icon size={16} strokeWidth={1.5} /></div>
      <div className="tc-body">
        <div className="tc-name">{tool.name}</div>
        <div className="tc-desc">{tool.desc}</div>
        <div className="tc-foot">
          {tool.live && (
            <div className="tc-live"><div className="tc-live-dot" />Live</div>
          )}
          {showCat && (
            <div className="tc-cat" style={{ color, borderColor: `${color}35` }}>{tool.category}</div>
          )}
        </div>
      </div>
      <div className="tc-arrow" style={{ color }}>→</div>
    </a>
  );
}
