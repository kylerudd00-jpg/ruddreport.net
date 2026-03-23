'use client';
import { useState, useMemo, useEffect } from 'react';
import { Radio, Globe, Server, MapPin, User, FileImage, Building2, Map, Scale, TrendingUp, ScanSearch, History, KeyRound, Search, AlertTriangle, Link, Mail, Satellite, PlaneTakeoff, Ship, Phone, Lock, Calculator, Shield, Binary, FileText, Landmark, LayoutDashboard, DollarSign, BarChart2, Package, Image, AtSign, Users, ShieldAlert, Home, FingerprintPattern, Footprints, Car, UserSearch, Share2, type LucideIcon } from 'lucide-react';

function detectAndRoute(raw: string) {
  const q = raw.trim();
  if (!q) return;
  const ipRx = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hashRx = /^[0-9a-fA-F]{32}$|^[0-9a-fA-F]{40}$|^[0-9a-fA-F]{64}$/;
  const domainRx = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const urlRx = /^https?:\/\//i;
  if (urlRx.test(q)) { window.location.href = `/osint/url?q=${encodeURIComponent(q)}`; return; }
  if (emailRx.test(q)) { window.location.href = `/osint/email-headers?q=${encodeURIComponent(q)}`; return; }
  if (ipRx.test(q)) { window.location.href = `/osint/ip?q=${encodeURIComponent(q)}`; return; }
  if (hashRx.test(q)) { window.location.href = `/osint/hash?q=${encodeURIComponent(q)}`; return; }
  if (domainRx.test(q)) { window.location.href = `/osint/whois?q=${encodeURIComponent(q)}`; return; }
  window.location.href = `/osint/username?q=${encodeURIComponent(q)}`;
}

type Category = 'All' | 'Corporate' | 'Network' | 'Cyber' | 'Live & Tracking' | 'Utilities' | 'Economic';

interface Tool {
  icon: LucideIcon;
  name: string;
  desc: string;
  href: string;
  category: Exclude<Category, 'All'>;
}

const TOOLS: Tool[] = [
  // Corporate Intelligence
  { icon: LayoutDashboard, name: 'Corporate Intel Dashboard', desc: 'Full company research package — filings, patents, contracts, exec intel', href: '/osint/company', category: 'Corporate' },
  { icon: FileText, name: 'SEC EDGAR Search', desc: 'Full-text search of 10-Ks, 8-Ks, proxies, and insider transactions', href: '/osint/edgar', category: 'Corporate' },
  { icon: Landmark, name: 'Government Contracts', desc: 'Federal award search via USASpending.gov — contracts, grants, IDVs', href: '/osint/contracts', category: 'Corporate' },
  { icon: Building2, name: 'Corporate Investigator', desc: 'Search 200M+ companies across 140 jurisdictions via OpenCorporates', href: '/osint/corporate', category: 'Corporate' },
  { icon: Search, name: 'Entity Search', desc: 'Wikipedia profile + research links across registries and databases', href: '/osint/entity', category: 'Corporate' },
  // Network & Domain
  { icon: Globe, name: 'WHOIS Lookup', desc: 'Domain registration, registrar, nameservers, and contact records', href: '/osint/whois', category: 'Network' },
  { icon: Server, name: 'DNS Intelligence', desc: 'Full DNS records, email security posture, hosting infrastructure', href: '/osint/dns', category: 'Network' },
  { icon: MapPin, name: 'IP Geolocation', desc: 'Geographic location, ISP, ASN, and network details for any IP', href: '/osint/ip', category: 'Network' },
  { icon: ScanSearch, name: 'Subdomain Scanner', desc: 'Enumerate subdomains via certificate transparency logs', href: '/osint/subdomains', category: 'Network' },
  { icon: Lock, name: 'SSL Certificate Inspector', desc: 'Certificate transparency log search — cert history and SANs', href: '/osint/ssl', category: 'Network' },
  { icon: Link, name: 'URL Redirect Tracer', desc: 'Trace the full redirect chain of any shortened or obfuscated URL', href: '/osint/url', category: 'Network' },
  { icon: Shield, name: 'MAC Address Lookup', desc: 'Identify hardware vendor from any MAC address or OUI prefix', href: '/osint/mac', category: 'Network' },
  // Cyber & Security
  { icon: KeyRound, name: 'Hash Analyzer', desc: 'Identify hash algorithm — MD5, SHA-256, bcrypt, NTLM, and 15+ more', href: '/osint/hash', category: 'Cyber' },
  { icon: AlertTriangle, name: 'CVE Search', desc: 'NIST NVD vulnerability search — CVSS scores, attack vectors, CWEs', href: '/osint/cve', category: 'Cyber' },
  { icon: Mail, name: 'Email Header Analyzer', desc: 'Trace routing path, SPF/DKIM/DMARC results, and originating IP', href: '/osint/email-headers', category: 'Cyber' },
  { icon: User, name: 'Username Hunter', desc: 'Check username across 39 platforms simultaneously in real time', href: '/osint/username', category: 'Cyber' },
  { icon: History, name: 'Wayback Machine', desc: 'Historical snapshots of any URL via the Internet Archive', href: '/osint/wayback', category: 'Cyber' },
  { icon: FileImage, name: 'Metadata Extractor', desc: 'Extract hidden EXIF data from photos — GPS, device, timestamps', href: '/osint/metadata', category: 'Cyber' },
  // Live & Tracking
  { icon: Radio, name: 'Live Intel Feed', desc: 'Real-time news from BBC, Krebs, The Record, Foreign Policy, and more', href: '/osint/feed', category: 'Live & Tracking' },
  { icon: Map, name: 'Conflict Tracker', desc: 'Real-time mapping of conflict zones with GDELT and ACLED data', href: '/osint/conflict', category: 'Live & Tracking' },
  { icon: TrendingUp, name: 'Polymarket Tracker', desc: 'Prediction market odds on geopolitical events and global conflicts', href: '/osint/polymarket', category: 'Live & Tracking' },
  { icon: Satellite, name: 'Satellite Tracker', desc: 'Real-time satellite tracking with orbital ground tracks and passes', href: '/tools/satellite-tracker', category: 'Live & Tracking' },
  { icon: PlaneTakeoff, name: 'Flight Tracker', desc: 'Live global air traffic with full ADS-B telemetry via OpenSky', href: '/tools/flight-tracker', category: 'Live & Tracking' },
  { icon: Ship, name: 'Vessel Tracker', desc: 'AIS vessel tracking — MMSI lookup, position, destination, speed', href: '/tools/vessel-tracker', category: 'Live & Tracking' },
  // Utilities
  { icon: Calculator, name: 'Subnet Calculator', desc: 'CIDR subnet math — network, broadcast, host range, mask', href: '/osint/subnet', category: 'Utilities' },
  { icon: KeyRound, name: 'JWT Decoder', desc: 'Decode JWT tokens and inspect claims client-side', href: '/osint/jwt', category: 'Utilities' },
  { icon: Binary, name: 'Base64 Tool', desc: 'Encode or decode Base64 strings — Unicode supported, client-side', href: '/osint/base64', category: 'Utilities' },
  { icon: Phone, name: 'Phone Number OSINT', desc: 'Identify carrier and line type, launch into OSINT databases', href: '/tools/phone-lookup', category: 'Utilities' },
  // Simple High-Value Tools
  { icon: Search, name: 'Google Dork Builder', desc: 'Build advanced search operators — find exposed files, logins, leaked data', href: '/osint/dorks', category: 'Cyber' },
  { icon: AtSign, name: 'Email Permutator', desc: 'Generate every possible email format from a name + company domain', href: '/osint/email-permutator', category: 'Corporate' },
  { icon: Image, name: 'Reverse Image Search', desc: 'Launch Google, TinEye, Yandex, Bing, and Baidu simultaneously', href: '/osint/reverse-image', category: 'Cyber' },
  { icon: ShieldAlert, name: 'Breach Lookup', desc: 'Check email exposure across HIBP, DeHashed, IntelligenceX, and more', href: '/osint/breach', category: 'Cyber' },
  { icon: Users, name: 'People Search', desc: 'Aggregate public records, court data, and social profiles by name', href: '/osint/people', category: 'Corporate' },
  { icon: FingerprintPattern, name: 'Background Check Hub', desc: 'Federal court records, criminal history, sex offender registry, voter records, incarceration', href: '/osint/background', category: 'Corporate' },
  { icon: Home, name: 'Address & Property Lookup', desc: 'Reverse address search, property ownership, county assessor, aerial imagery', href: '/osint/address', category: 'Corporate' },
  { icon: Footprints, name: 'Digital Footprint OSINT', desc: 'Social media profiles, news mentions, professional presence, Google dorks by name', href: '/osint/social-footprint', category: 'Cyber' },
  { icon: UserSearch, name: 'Name Search', desc: 'Search WhitePages, Spokeo, FastPeopleSearch, Intelius, and 8 more simultaneously', href: '/osint/name-search', category: 'Corporate' },
  { icon: Share2, name: 'Social Media Name Search', desc: 'Find someone on Facebook, LinkedIn, Instagram, TikTok, Twitter, and Reddit by real name', href: '/osint/social-search', category: 'Cyber' },
  { icon: Car, name: 'VIN Decoder', desc: 'Decode any vehicle VIN — make, model, year, engine, trim via NHTSA', href: '/osint/vin', category: 'Utilities' },
  // Economic Intelligence
  { icon: DollarSign, name: 'Currency Tracker', desc: 'Live exchange rates — sanctions pressure, capital flight, currency collapse', href: '/osint/currency', category: 'Economic' },
  { icon: BarChart2, name: 'Country Economic Profile', desc: 'World Bank data — GDP, inflation, debt, trade for 200+ countries', href: '/osint/economics', category: 'Economic' },
  { icon: Package, name: 'Commodity Monitor', desc: 'Strategic commodities and crypto prices — oil, gold, palladium, Monero', href: '/osint/commodities', category: 'Economic' },
  { icon: Scale, name: 'Sanctions Screener', desc: 'Search OFAC SDN, EU, UN, and BIS sanctions lists by name', href: '/osint/sanctions', category: 'Economic' },
];

const CATEGORIES: Category[] = ['All', 'Corporate', 'Network', 'Cyber', 'Live & Tracking', 'Economic', 'Utilities'];

const CAT_COLORS: Record<string, string> = {
  Corporate: '#ffaa00',
  Network: '#1e9eff',
  Cyber: '#ff4444',
  'Live & Tracking': '#22cc66',
  Economic: '#00c9b0',
  Utilities: '#b464ff',
};

export default function OSINTHub() {
  const [routerQuery, setRouterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat') as Category | null;
    if (cat && CATEGORIES.includes(cat)) setActiveCategory(cat);
  }, []);

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? TOOLS : TOOLS.filter(t => t.category === activeCategory);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s));
    }
    return list;
  }, [activeCategory, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: TOOLS.length };
    CATEGORIES.slice(1).forEach(c => { map[c] = TOOLS.filter(t => t.category === c).length; });
    return map;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1.5px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .page-wrap { padding-top: 70px; }

        /* HERO */
        .hero { padding: 60px 40px 50px; border-bottom: 1px solid rgba(30,158,255,0.1); position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -150px; right: -150px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(30,158,255,0.04) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
        .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(36px, 4vw, 60px); font-weight: 700; color: #c0cfe0; line-height: 1.05; margin-bottom: 14px; letter-spacing: -0.5px; }
        .hero-title span { color: #1e9eff; }
        .hero-sub { font-size: 15px; font-weight: 400; color: #7a9bb5; line-height: 1.7; margin-bottom: 28px; }
        .hero-stats { display: flex; gap: 32px; }
        .hero-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: #1e9eff; }
        .hero-stat-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: #5a7a94; text-transform: uppercase; margin-top: 2px; }

        /* ROUTER */
        .router-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 28px; }
        .router-panel-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #c0cfe0; margin-bottom: 6px; }
        .router-panel-sub { font-size: 13px; color: #5a7a90; margin-bottom: 20px; line-height: 1.5; }
        .router-row { display: flex; gap: 0; }
        .router-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); border-right: none; color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 13px; padding: 13px 16px; outline: none; transition: border-color 0.2s; }
        .router-input:focus { border-color: rgba(30,158,255,0.5); }
        .router-input::placeholder { color: #5a7a94; font-size: 12px; }
        .router-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 13px 22px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: background 0.2s; }
        .router-btn:hover { background: #4db3ff; }
        .router-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
        .router-chip { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: #5a7a94; border: 1px solid rgba(30,158,255,0.1); padding: 3px 8px; }
        .router-chip span { color: #1e9eff; }

        /* FILTER BAR */
        .filter-bar { position: sticky; top: 70px; z-index: 50; background: rgba(3,6,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.1); }
        .filter-bar-inner { max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; align-items: center; gap: 0; }
        .filter-tab { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 16px 20px; color: #5a7a90; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; gap: 7px; }
        .filter-tab:hover { color: #9ab0c4; }
        .filter-tab.active { color: #fff; border-bottom-color: #1e9eff; }
        .filter-tab-count { font-family: 'IBM Plex Mono', monospace; font-size: 9px; background: rgba(30,158,255,0.1); padding: 1px 6px; color: #1e9eff; }
        .filter-tab.active .filter-tab-count { background: rgba(30,158,255,0.2); }
        .search-wrap { margin-left: auto; padding: 10px 0; }
        .tool-search { background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.12); color: #d8e8f5; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 1px; padding: 7px 14px; outline: none; width: 200px; transition: border-color 0.2s; }
        .tool-search:focus { border-color: rgba(30,158,255,0.4); }
        .tool-search::placeholder { color: #5a7a94; }

        /* TOOLS GRID */
        .tools-wrap { max-width: 1200px; margin: 0 auto; padding: 32px 40px 80px; }
        .results-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 20px; }
        .tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .tool-card { position: relative; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 28px 28px 22px; text-decoration: none; display: flex; flex-direction: column; gap: 0; transition: all 0.25s; overflow: hidden; }
        .tool-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; transform: scaleX(0); transition: transform 0.3s; transform-origin: left; }
        .tool-card:hover { background: #0d1e30; border-color: rgba(30,158,255,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .tool-card:hover::after { transform: scaleX(1); }
        .tool-cat-line { height: 2px; width: 24px; margin-bottom: 16px; border-radius: 1px; }
        .tool-icon-wrap { margin-bottom: 12px; }
        .tool-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.5px; color: #c0cfe0; margin-bottom: 8px; transition: color 0.2s; line-height: 1.2; }
        .tool-card:hover .tool-name { color: #fff; }
        .tool-desc { font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 400; color: #5a7a90; line-height: 1.55; flex: 1; margin-bottom: 16px; }
        .tool-footer { display: flex; align-items: center; justify-content: space-between; }
        .tool-cat-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 7px; border: 1px solid; }
        .tool-arrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #5a7a94; transition: all 0.2s; }
        .tool-card:hover .tool-arrow { color: #1e9eff; transform: translateX(3px); }

        .empty-state { grid-column: 1 / -1; text-align: center; padding: 60px 20px; }
        .empty-state-text { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }

        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(30,158,255,0.15), transparent); }
        footer { border-top: 1px solid rgba(30,158,255,0.1); padding: 32px 40px; background: #070d12; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 32px; }
          .tools-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 40px 20px 36px; }
          .filter-bar-inner { padding: 0 16px; overflow-x: auto; gap: 0; }
          .filter-tab { padding: 14px 14px; font-size: 10px; }
          .search-wrap { display: none; }
          .tools-wrap { padding: 24px 16px 60px; }
          .tools-grid { grid-template-columns: repeat(2, 1fr); }
          footer { padding: 24px 16px; }
          .footer-inner { flex-direction: column; gap: 8px; }
        }
        @media (max-width: 480px) {
          .tools-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('osintHubMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="osintHubMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('osintHubMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a>
          <a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/about">About</a>
        </div>

        {/* HERO */}
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <div className="hero-eyebrow-text">Free Tools</div>
              </div>
              <div className="hero-title">OSINT <span>Hub</span></div>
              <p className="hero-sub">41 free tools for researching companies, networks, people, and live events. No account required.</p>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-num">41</div>
                  <div className="hero-stat-label">Live Tools</div>
                </div>
                <div>
                  <div className="hero-stat-num">Free</div>
                  <div className="hero-stat-label">No Sign-Up</div>
                </div>
                <div>
                  <div className="hero-stat-num">6</div>
                  <div className="hero-stat-label">Categories</div>
                </div>
              </div>
            </div>

            {/* Smart Router */}
            <div className="router-panel">
              <div className="router-panel-title">Quick Investigate</div>
              <p className="router-panel-sub">Paste anything — auto-routes to the right tool.</p>
              <div className="router-row">
                <input
                  className="router-input"
                  placeholder="IP, domain, URL, hash, email, or username..."
                  value={routerQuery}
                  onChange={e => setRouterQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && detectAndRoute(routerQuery)}
                />
                <button className="router-btn" onClick={() => detectAndRoute(routerQuery)}>
                  Go →
                </button>
              </div>
              <div className="router-chips">
                <div className="router-chip"><span>IP</span> → Geolocation</div>
                <div className="router-chip"><span>domain</span> → WHOIS</div>
                <div className="router-chip"><span>hash</span> → Hash Analyzer</div>
                <div className="router-chip"><span>email</span> → Header Analyzer</div>
                <div className="router-chip"><span>url</span> → Redirect Tracer</div>
                <div className="router-chip"><span>username</span> → Hunter</div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY FILTER BAR */}
        <div className="filter-bar">
          <div className="filter-bar-inner">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-tab${activeCategory === cat ? ' active' : ''}`}
                onClick={() => { setActiveCategory(cat); setSearch(''); }}
              >
                {cat}
                <span className="filter-tab-count">{counts[cat]}</span>
              </button>
            ))}
            <div className="search-wrap">
              <input
                className="tool-search"
                placeholder="Search tools..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* TOOLS GRID */}
        <div className="tools-wrap">
          {search && (
            <div className="results-label">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </div>
          )}
          <div className="tools-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-text">No tools match &ldquo;{search}&rdquo;</div>
              </div>
            ) : filtered.map(tool => {
              const color = CAT_COLORS[tool.category];
              const Icon = tool.icon;
              return (
                <a key={tool.href} href={tool.href} className="tool-card" style={{ ['--cat-color' as string]: color }}>
                  <style>{`.tool-card:hover::after { background: ${color}; }`}</style>
                  <div className="tool-cat-line" style={{ background: color }} />
                  <div className="tool-icon-wrap" style={{ color }}>
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-desc">{tool.desc}</div>
                  <div className="tool-footer">
                    <div className="tool-cat-tag" style={{ color, borderColor: `${color}33` }}>{tool.category}</div>
                    <div className="tool-arrow">→</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="divider" />

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
            <div className="footer-copy">OSINT Hub · <span style={{color:'#1e9eff'}}>41 Live Tools</span></div>
          </div>
        </footer>
      </div>
    </>
  );
}
