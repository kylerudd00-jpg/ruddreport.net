'use client';
import { useState, useMemo, useEffect } from 'react';
import { Radio, Globe, Server, MapPin, User, FileImage, Building2, Map, Scale, TrendingUp, ScanSearch, History, KeyRound, Search, AlertTriangle, Link, Mail, Satellite, PlaneTakeoff, Ship, Phone, Lock, Calculator, Shield, Binary, FileText, Landmark, LayoutDashboard, DollarSign, BarChart2, Package, Image, AtSign, Users, ShieldAlert, Home, Footprints, Car, Network, FingerprintPattern, type LucideIcon } from 'lucide-react';

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

type Category = 'All' | 'Corporate' | 'Network' | 'Cyber' | 'Live & Tracking' | 'Economic' | 'Utilities';

interface Tool {
  icon: LucideIcon;
  name: string;
  desc: string;
  href: string;
  category: Exclude<Category, 'All'>;
  live?: boolean;
}

const TOOLS: Tool[] = [
  { icon: LayoutDashboard, name: 'Corporate Intel Dashboard', desc: 'Full company research package — filings, patents, contracts, exec intel', href: '/osint/company', category: 'Corporate' },
  { icon: Network, name: 'OpenCorporates', desc: '200M+ companies across all 50 US states — officers, registered agents, historical and dissolved records', href: '/osint/opencorporates', category: 'Corporate' },
  { icon: FileText, name: 'SEC EDGAR Search', desc: 'Full-text search of 10-Ks, 8-Ks, proxies, and insider transactions', href: '/osint/edgar', category: 'Corporate' },
  { icon: Landmark, name: 'Government Contracts', desc: 'Federal award search via USASpending.gov — contracts, grants, IDVs', href: '/osint/contracts', category: 'Corporate' },
  { icon: Building2, name: 'Corporate Investigator', desc: 'LEI ownership graph — parent companies, subsidiaries, and offshore flags via GLEIF', href: '/osint/corporate', category: 'Corporate' },
  { icon: Search, name: 'Entity Search', desc: 'Wikipedia profile + research links across registries and databases', href: '/osint/entity', category: 'Corporate' },
  { icon: AtSign, name: 'Email Permutator', desc: 'Generate every possible email format from a name and company domain', href: '/osint/email-permutator', category: 'Corporate' },
  { icon: Users, name: 'People Search', desc: 'Aggregate public records, court data, and social profiles by name', href: '/osint/people', category: 'Corporate' },
  { icon: FingerprintPattern, name: 'Background Check Hub', desc: 'Federal court records, criminal history, sex offender registry, voter records, incarceration', href: '/osint/background', category: 'Corporate' },
  { icon: Home, name: 'Address & Property Lookup', desc: 'Reverse address search, property ownership, county assessor, aerial imagery', href: '/osint/address', category: 'Corporate' },
  { icon: Globe, name: 'WHOIS Lookup', desc: 'Domain registration, registrar, nameservers, and contact records', href: '/osint/whois', category: 'Network' },
  { icon: Server, name: 'DNS Intelligence', desc: 'Full DNS records, email security posture, hosting infrastructure', href: '/osint/dns', category: 'Network' },
  { icon: MapPin, name: 'IP Geolocation', desc: 'Geographic location, ISP, ASN, and network details for any IP', href: '/osint/ip', category: 'Network' },
  { icon: ScanSearch, name: 'Subdomain Scanner', desc: 'Enumerate subdomains via certificate transparency logs', href: '/osint/subdomains', category: 'Network' },
  { icon: Lock, name: 'SSL Certificate Inspector', desc: 'Certificate transparency log search — cert history and SANs', href: '/osint/ssl', category: 'Network' },
  { icon: Link, name: 'URL Redirect Tracer', desc: 'Trace the full redirect chain of any shortened or obfuscated URL', href: '/osint/url', category: 'Network' },
  { icon: Shield, name: 'MAC Address Lookup', desc: 'Identify hardware vendor from any MAC address or OUI prefix', href: '/osint/mac', category: 'Network' },
  { icon: KeyRound, name: 'Hash Analyzer', desc: 'Identify hash algorithm — MD5, SHA-256, bcrypt, NTLM, and 15+ more', href: '/osint/hash', category: 'Cyber' },
  { icon: AlertTriangle, name: 'CVE Search', desc: 'NIST NVD vulnerability search — CVSS scores, attack vectors, CWEs', href: '/osint/cve', category: 'Cyber' },
  { icon: Mail, name: 'Email Header Analyzer', desc: 'Trace routing path, SPF/DKIM/DMARC results, and originating IP', href: '/osint/email-headers', category: 'Cyber' },
  { icon: User, name: 'Username Hunter', desc: 'Check username across 39 platforms simultaneously in real time', href: '/osint/username', category: 'Cyber' },
  { icon: History, name: 'Wayback Machine', desc: 'Historical snapshots of any URL via the Internet Archive', href: '/osint/wayback', category: 'Cyber' },
  { icon: FileImage, name: 'Metadata Extractor', desc: 'Extract hidden EXIF data from photos — GPS, device, timestamps', href: '/osint/metadata', category: 'Cyber' },
  { icon: Search, name: 'Google Dork Builder', desc: 'Build advanced search operators — find exposed files, logins, leaked data', href: '/osint/dorks', category: 'Cyber' },
  { icon: Image, name: 'Reverse Image Search', desc: 'Launch Google, TinEye, Yandex, Bing, and Baidu simultaneously', href: '/osint/reverse-image', category: 'Cyber' },
  { icon: ShieldAlert, name: 'Breach Lookup', desc: 'Check email exposure across HIBP, DeHashed, IntelligenceX, and more', href: '/osint/breach', category: 'Cyber' },
  { icon: Footprints, name: 'Digital Footprint OSINT', desc: 'Social media profiles, news mentions, professional presence, Google dorks by name', href: '/osint/social-footprint', category: 'Cyber' },
  { icon: ShieldAlert, name: 'Threat Actor Database', desc: 'Nation-state and criminal APT profiles — attribution, targets, tradecraft, MITRE ATT&CK', href: '/osint/threat-actors', category: 'Cyber' },
  { icon: Radio, name: 'Live Intel Feed', desc: 'Real-time news from BBC, Krebs, The Record, Foreign Policy, and more', href: '/osint/feed', category: 'Live & Tracking', live: true },
  { icon: Map, name: 'Conflict Tracker', desc: 'Real-time mapping of conflict zones with GDELT and ACLED data', href: '/osint/conflict', category: 'Live & Tracking', live: true },
  { icon: TrendingUp, name: 'Polymarket Tracker', desc: 'Prediction market odds on geopolitical events and global conflicts', href: '/osint/polymarket', category: 'Live & Tracking', live: true },
  { icon: Satellite, name: 'Satellite Tracker', desc: 'Real-time satellite tracking with orbital ground tracks and passes', href: '/tools/satellite-tracker', category: 'Live & Tracking', live: true },
  { icon: PlaneTakeoff, name: 'Flight Tracker', desc: 'Live global air traffic with full ADS-B telemetry via OpenSky', href: '/tools/flight-tracker', category: 'Live & Tracking', live: true },
  { icon: Ship, name: 'Vessel Tracker', desc: 'AIS vessel tracking — MMSI lookup, position, destination, speed', href: '/tools/vessel-tracker', category: 'Live & Tracking', live: true },
  { icon: Calculator, name: 'Subnet Calculator', desc: 'CIDR subnet math — network, broadcast, host range, mask', href: '/osint/subnet', category: 'Utilities' },
  { icon: KeyRound, name: 'JWT Decoder', desc: 'Decode JWT tokens and inspect claims client-side', href: '/osint/jwt', category: 'Utilities' },
  { icon: Binary, name: 'Base64 Tool', desc: 'Encode or decode Base64 strings — Unicode supported, client-side', href: '/osint/base64', category: 'Utilities' },
  { icon: Phone, name: 'Phone Number OSINT', desc: 'Identify carrier and line type, launch into OSINT databases', href: '/tools/phone-lookup', category: 'Utilities' },
  { icon: Car, name: 'VIN Decoder', desc: 'Decode any vehicle VIN — make, model, year, engine, trim via NHTSA', href: '/osint/vin', category: 'Utilities' },
  { icon: DollarSign, name: 'Currency Tracker', desc: 'Live exchange rates — sanctions pressure, capital flight, currency collapse', href: '/osint/currency', category: 'Economic', live: true },
  { icon: BarChart2, name: 'Country Economic Profile', desc: 'World Bank data — GDP, inflation, debt, trade for 200+ countries', href: '/osint/economics', category: 'Economic' },
  { icon: Package, name: 'Commodity Monitor', desc: 'Strategic commodities and crypto prices — oil, gold, palladium, Monero', href: '/osint/commodities', category: 'Economic', live: true },
  { icon: Scale, name: 'Sanctions Screener', desc: 'Search OFAC SDN, EU, UN, and BIS sanctions lists by name', href: '/osint/sanctions', category: 'Economic' },
];

const CATEGORIES: Category[] = ['All', 'Corporate', 'Network', 'Cyber', 'Live & Tracking', 'Economic', 'Utilities'];

const CAT_COLORS: Record<string, string> = {
  Corporate: '#ffaa00',
  Network: '#1e9eff',
  Cyber: '#ff4444',
  'Live & Tracking': '#00ff88',
  Economic: '#00c9b0',
  Utilities: '#b464ff',
};

const CAT_LABELS: Record<string, string> = {
  Corporate: 'Corporate Intelligence',
  Network: 'Network & Domain',
  Cyber: 'Cyber & Security',
  'Live & Tracking': 'Live & Tracking',
  Economic: 'Economic Intelligence',
  Utilities: 'Utilities',
};

const FEATURED_NAMES = ['Live Intel Feed', 'OpenCorporates', 'Conflict Tracker', 'Satellite Tracker'];

export default function OSINTHub() {
  const [routerQuery, setRouterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'category' | 'alpha'>('category');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat') as Category | null;
    if (cat && CATEGORIES.includes(cat)) setActiveCategory(cat);
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: TOOLS.length };
    CATEGORIES.slice(1).forEach(c => { map[c] = TOOLS.filter(t => t.category === c).length; });
    return map;
  }, []);

  const showGrouped = activeCategory === 'All' && !search.trim() && sort === 'category';

  const filtered = useMemo(() => {
    let list = activeCategory === 'All' ? TOOLS : TOOLS.filter(t => t.category === activeCategory);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s));
    }
    if (sort === 'alpha') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [activeCategory, search, sort]);

  const featuredTools = TOOLS.filter(t => FEATURED_NAMES.includes(t.name));

  const liveCount = TOOLS.filter(t => t.live).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }
        .page-wrap { padding-top: 70px; }

        /* ── HERO ── */
        .hero {
          padding: 48px 40px 36px;
          border-bottom: 1px solid rgba(30,158,255,0.1);
          background: linear-gradient(180deg, rgba(30,158,255,0.02) 0%, transparent 100%);
        }
        .hero-inner { max-width: 1320px; margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 48px; align-items: center; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .hero-eyebrow-line { width: 28px; height: 1px; background: #00ff88; box-shadow: 0 0 8px #00ff88; }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #00ff88; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(26px, 3.5vw, 46px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 4px; line-height: 1.05; margin-bottom: 12px; }
        .hero-desc { font-family: 'Barlow', sans-serif; font-size: 15px; color: #7a9bb5; line-height: 1.65; margin-bottom: 24px; max-width: 520px; }
        .stats-bar { display: flex; align-items: center; gap: 0; }
        .stat-item { padding: 10px 20px; border: 1px solid rgba(30,158,255,0.1); background: rgba(10,21,32,0.6); display: flex; flex-direction: column; gap: 2px; }
        .stat-item + .stat-item { border-left: none; }
        .stat-num { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; color: #1e9eff; line-height: 1; }
        .stat-num.green { color: #00ff88; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }

        /* ── SMART ROUTER ── */
        .router-panel { background: #070d12; border: 1px solid rgba(30,158,255,0.12); padding: 20px; }
        .router-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 10px; }
        .router-row { display: flex; gap: 0; }
        .router-input { flex: 1; background: #030608; border: 1px solid rgba(30,158,255,0.15); border-right: none; color: #c0cfe0; font-family: 'Share Tech Mono', monospace; font-size: 12px; padding: 11px 14px; outline: none; transition: border-color 0.2s; letter-spacing: 0.5px; }
        .router-input:focus { border-color: rgba(30,158,255,0.4); }
        .router-input::placeholder { color: #3d5870; font-size: 11px; }
        .router-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; background: #1e9eff; border: none; color: #000; padding: 11px 18px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: background 0.2s; }
        .router-btn:hover { background: #4db3ff; }
        .router-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px; }
        .router-chip { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 1.5px; color: #3d5870; border: 1px solid rgba(30,158,255,0.08); padding: 3px 8px; }
        .router-chip b { color: #1e9eff; font-weight: 400; }

        /* ── CONTROL BAR ── */
        .control-bar {
          position: sticky; top: 70px; z-index: 50;
          background: rgba(3,6,8,0.97); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(30,158,255,0.08);
        }
        .control-inner { max-width: 1320px; margin: 0 auto; padding: 0 40px; display: flex; align-items: stretch; gap: 0; }
        .filter-input-wrap { display: flex; align-items: center; border-right: 1px solid rgba(30,158,255,0.08); padding-right: 16px; margin-right: 4px; }
        .filter-input { background: none; border: none; outline: none; font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c0cfe0; width: 180px; padding: 16px 0; letter-spacing: 0.5px; }
        .filter-input::placeholder { color: #3d5870; }
        .cat-tabs { display: flex; align-items: stretch; flex: 1; overflow-x: auto; scrollbar-width: none; }
        .cat-tabs::-webkit-scrollbar { display: none; }
        .cat-tab { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 0 16px; color: #3d5870; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .cat-tab:hover { color: #7a9bb5; }
        .cat-tab.active { color: #fff; }
        .cat-tab-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; padding: 1px 5px; background: rgba(255,255,255,0.05); }
        .sort-wrap { display: flex; align-items: center; border-left: 1px solid rgba(30,158,255,0.08); padding-left: 16px; gap: 4px; }
        .sort-btn { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; border: 1px solid rgba(30,158,255,0.08); padding: 5px 10px; cursor: pointer; background: none; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .sort-btn.active { color: #1e9eff; border-color: rgba(30,158,255,0.3); background: rgba(30,158,255,0.05); }
        .sort-btn:hover:not(.active) { color: #7a9bb5; border-color: rgba(30,158,255,0.15); }

        /* ── MAIN CONTENT ── */
        .content-wrap { max-width: 1320px; margin: 0 auto; padding: 32px 40px 80px; }

        /* ── FEATURED STRIP ── */
        .featured-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 40px; }
        .featured-card { position: relative; background: #070d12; border: 1px solid rgba(255,255,255,0.04); padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; overflow: hidden; }
        .featured-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; transition: opacity 0.2s; opacity: 0.6; }
        .featured-card:hover { background: #0a1520; }
        .featured-card:hover::before { opacity: 1; }
        .fc-icon { margin-bottom: 2px; }
        .fc-live { display: flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 2px; }
        .fc-live-dot { width: 5px; height: 5px; border-radius: 50%; animation: pulse 2s infinite; }
        .fc-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; line-height: 1.2; }
        .fc-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #3d5870; line-height: 1.5; flex: 1; }
        .fc-arrow { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #3d5870; margin-top: 4px; transition: all 0.2s; }
        .featured-card:hover .fc-arrow { transform: translateX(4px); }

        /* ── SEARCH RESULTS LABEL ── */
        .results-meta { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; }
        .results-meta b { color: #1e9eff; font-weight: 400; }

        /* ── CATEGORY SECTIONS (grouped mode) ── */
        .cat-section { margin-bottom: 36px; }
        .cat-section-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .cat-section-line { height: 1px; flex: 1; }
        .cat-section-name { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap; }
        .cat-section-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; white-space: nowrap; }

        /* ── TOOL ROWS ── */
        .tool-rows { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .tool-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: #070d12; border: 1px solid rgba(255,255,255,0.03); text-decoration: none; transition: all 0.15s; position: relative; overflow: hidden; border-left: 3px solid; }
        .tool-row:hover { background: #0a1520; border-right-color: rgba(255,255,255,0.06); border-top-color: rgba(255,255,255,0.06); border-bottom-color: rgba(255,255,255,0.06); }
        .tr-icon { flex-shrink: 0; opacity: 0.7; transition: opacity 0.15s; }
        .tool-row:hover .tr-icon { opacity: 1; }
        .tr-body { flex: 1; min-width: 0; }
        .tr-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #c0cfe0; line-height: 1.2; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
        .tool-row:hover .tr-name { color: #fff; }
        .tr-desc { font-family: 'Barlow', sans-serif; font-size: 11px; color: #3d5870; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.15s; }
        .tool-row:hover .tr-desc { color: #5a7a94; }
        .tr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .tr-cat-badge { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 2px; padding: 2px 6px; border: 1px solid; text-transform: uppercase; opacity: 0.7; }
        .tr-live { display: flex; align-items: center; gap: 4px; font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 2px; color: #00ff88; text-transform: uppercase; }
        .tr-live-dot { width: 4px; height: 4px; border-radius: 50%; background: #00ff88; animation: pulse 2s infinite; }
        .tr-arrow { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #3d5870; transition: all 0.15s; }
        .tool-row:hover .tr-arrow { transform: translateX(3px); }

        /* ── EMPTY STATE ── */
        .empty-state { grid-column: 1 / -1; padding: 60px 0; text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }

        /* ── FOOTER ── */
        footer { border-top: 1px solid rgba(30,158,255,0.08); padding: 28px 40px; background: #030608; }
        .footer-inner { max-width: 1320px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-class { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1a3a24; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 1100px) {
          .hero-inner { grid-template-columns: 1fr; gap: 28px; }
          .router-panel { max-width: 500px; }
          .featured-grid { grid-template-columns: repeat(2, 1fr); }
          .tool-rows { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .hero, .content-wrap, footer { padding-left: 16px; padding-right: 16px; }
          .hero { padding-top: 32px; padding-bottom: 24px; }
          .control-inner { padding: 0 16px; }
          .filter-input-wrap { display: none; }
          .sort-wrap { display: none; }
          .featured-grid { grid-template-columns: 1fr 1fr; }
          .cat-tab { padding: 0 12px; font-size: 11px; }
        }
        @media (max-width: 480px) {
          .featured-grid { grid-template-columns: 1fr; }
          .stats-bar { flex-wrap: wrap; }
        }
      `}</style>

      <div className="page-wrap">

        {/* HERO */}
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <div className="hero-eyebrow-text">Free Intelligence Tools</div>
              </div>
              <div className="hero-title">OSINT Hub</div>
              <p className="hero-desc">
                {TOOLS.length} free tools for investigating companies, networks, people, live events, and financial systems. No account required.
              </p>
              <div className="stats-bar">
                <div className="stat-item">
                  <div className="stat-num">{TOOLS.length}</div>
                  <div className="stat-label">Tools</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num green">{liveCount}</div>
                  <div className="stat-label">Live Feeds</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">6</div>
                  <div className="stat-label">Categories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-num">Free</div>
                  <div className="stat-label">No Sign-Up</div>
                </div>
              </div>
            </div>

            <div className="router-panel">
              <div className="router-label">Quick Investigate — paste anything</div>
              <div className="router-row">
                <input
                  className="router-input"
                  placeholder="IP, domain, URL, hash, email, username..."
                  value={routerQuery}
                  onChange={e => setRouterQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && detectAndRoute(routerQuery)}
                />
                <button className="router-btn" onClick={() => detectAndRoute(routerQuery)}>Go →</button>
              </div>
              <div className="router-chips">
                <div className="router-chip"><b>IP</b> → Geolocation</div>
                <div className="router-chip"><b>domain</b> → WHOIS</div>
                <div className="router-chip"><b>hash</b> → Analyzer</div>
                <div className="router-chip"><b>email</b> → Header Trace</div>
                <div className="router-chip"><b>url</b> → Redirect Chain</div>
                <div className="router-chip"><b>username</b> → Hunter</div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY CONTROL BAR */}
        <div className="control-bar">
          <div className="control-inner">
            <div className="filter-input-wrap">
              <input
                className="filter-input"
                placeholder="Filter tools..."
                value={search}
                onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCategory('All'); }}
              />
            </div>
            <div className="cat-tabs">
              {CATEGORIES.map(cat => {
                const color = cat === 'All' ? '#1e9eff' : CAT_COLORS[cat];
                const isActive = activeCategory === cat && !search;
                return (
                  <button
                    key={cat}
                    className={`cat-tab${isActive ? ' active' : ''}`}
                    style={isActive ? { borderBottomColor: color, color: color } : {}}
                    onClick={() => { setActiveCategory(cat); setSearch(''); }}
                  >
                    {cat}
                    <span className="cat-tab-count" style={isActive ? { background: `${color}18`, color } : {}}>
                      {counts[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="sort-wrap">
              <button className={`sort-btn${sort === 'category' ? ' active' : ''}`} onClick={() => setSort('category')}>Cat</button>
              <button className={`sort-btn${sort === 'alpha' ? ' active' : ''}`} onClick={() => setSort('alpha')}>A–Z</button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="content-wrap">

          {/* FEATURED STRIP — only when All + no search + category sort */}
          {showGrouped && (
            <>
              <div className="featured-label">Flagship Tools</div>
              <div className="featured-grid">
                {featuredTools.map(tool => {
                  const color = CAT_COLORS[tool.category];
                  const Icon = tool.icon;
                  return (
                    <a key={tool.href} href={tool.href} className="featured-card" style={{ borderColor: `${color}20` }}>
                      <style>{`.featured-card[href="${tool.href}"]::before { background: ${color}; } .featured-card[href="${tool.href}"]:hover { border-color: ${color}40 !important; }`}</style>
                      <div className="fc-icon" style={{ color }}><Icon size={20} strokeWidth={1.5} /></div>
                      {tool.live && (
                        <div className="fc-live" style={{ color }}>
                          <div className="fc-live-dot" style={{ background: color }} />
                          Live
                        </div>
                      )}
                      <div className="fc-name">{tool.name}</div>
                      <div className="fc-desc">{tool.desc}</div>
                      <div className="fc-arrow" style={{ color }}>→</div>
                    </a>
                  );
                })}
              </div>
            </>
          )}

          {/* SEARCH RESULTS META */}
          {search.trim() && (
            <div className="results-meta">
              <b>{filtered.length}</b> result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
            </div>
          )}

          {/* GROUPED SECTIONS */}
          {showGrouped && CATEGORIES.slice(1).map(cat => {
            const catTools = TOOLS.filter(t => t.category === cat);
            const color = CAT_COLORS[cat];
            return (
              <div key={cat} className="cat-section">
                <div className="cat-section-hdr">
                  <div className="cat-section-name" style={{ color }}>{CAT_LABELS[cat]}</div>
                  <div className="cat-section-line" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
                  <div className="cat-section-count">{catTools.length} tools</div>
                </div>
                <div className="tool-rows">
                  {catTools.map(tool => {
                    const Icon = tool.icon;
                    return (
                      <a key={tool.href} href={tool.href} className="tool-row" style={{ borderLeftColor: `${color}60` }}>
                        <div className="tr-icon" style={{ color }}><Icon size={16} strokeWidth={1.5} /></div>
                        <div className="tr-body">
                          <div className="tr-name">{tool.name}</div>
                          <div className="tr-desc">{tool.desc}</div>
                        </div>
                        <div className="tr-right">
                          {tool.live && (
                            <div className="tr-live">
                              <div className="tr-live-dot" />
                              Live
                            </div>
                          )}
                          <div className="tr-arrow" style={{ color }}>→</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* FLAT LIST — filtered or alpha sort */}
          {!showGrouped && (
            <div className="tool-rows">
              {filtered.length === 0 ? (
                <div className="empty-state">No tools match &ldquo;{search}&rdquo;</div>
              ) : filtered.map(tool => {
                const color = CAT_COLORS[tool.category];
                const Icon = tool.icon;
                return (
                  <a key={tool.href} href={tool.href} className="tool-row" style={{ borderLeftColor: `${color}60` }}>
                    <div className="tr-icon" style={{ color }}><Icon size={16} strokeWidth={1.5} /></div>
                    <div className="tr-body">
                      <div className="tr-name">{tool.name}</div>
                      <div className="tr-desc">{tool.desc}</div>
                    </div>
                    <div className="tr-right">
                      {activeCategory === 'All' && (
                        <div className="tr-cat-badge" style={{ color, borderColor: `${color}40` }}>
                          {tool.category}
                        </div>
                      )}
                      {tool.live && (
                        <div className="tr-live">
                          <div className="tr-live-dot" />
                          Live
                        </div>
                      )}
                      <div className="tr-arrow" style={{ color }}>→</div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}

        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-class">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}
