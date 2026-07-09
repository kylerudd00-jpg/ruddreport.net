'use client';
import { useEffect, useRef, useState } from 'react';
import { ARTICLES, type Article, getReadingTime } from '@/lib/articles';
import FlagUS from './components/FlagUS';
import BlueMarble from './components/BlueMarble';
import { useReveal } from './components/useReveal';

const CATEGORIES = ['All', 'Cybersecurity', 'Intelligence', 'Geopolitics', 'National Security', 'Economic Security'] as const;

function getFeatured(): Article[] {
  const featured = ARTICLES.filter(a => a.featured);
  return featured.length > 0 ? featured : ARTICLES.slice(0, 1);
}

// Dates are stored as "Mar 22, 2026" strings — parse for a true chronological sort
const byDateDesc = (a: Article, b: Article) => new Date(b.date).getTime() - new Date(a.date).getTime();

function getLatest(count = 3): Article[] {
  return [...ARTICLES].sort(byDateDesc).slice(0, count);
}

function getByCategory(cat: string): Article[] {
  if (cat === 'All') return [...ARTICLES].sort(byDateDesc);
  return ARTICLES.filter(a => a.category === cat).sort(byDateDesc);
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'Cybersecurity': return '#ff4444';
    case 'Intelligence': return '#b464ff';
    case 'Geopolitics': return '#ffaa00';
    case 'National Security': return '#22cc66';
    case 'Economic Security': return '#00c9b0';
    default: return '#1e9eff';
  }
}

const OSINT_CATS = [
  { name: 'Corporate', count: 10, desc: 'Company filings, SEC records, government contracts, court records, and exec research.', href: '/osint?cat=Corporate' },
  { name: 'Network', count: 4, desc: 'Domain lookup (WHOIS, DNS, SSL, subdomains), IP geolocation, URL tracing, and MAC lookup.', href: '/osint?cat=Network' },
  { name: 'Cyber', count: 14, desc: 'Hashes, CVEs, email headers, breach lookup, username search, and Google dorks.', href: '/osint?cat=Cyber' },
  { name: 'Live & Tracking', count: 7, desc: 'Satellites, flights, vessels, conflict zones, prediction markets, and news feeds.', href: '/osint?cat=Live' },
  { name: 'Economic', count: 4, desc: 'Currency rates, commodity prices, country economic profiles, and sanctions screening.', href: '/osint?cat=Economic' },
  { name: 'Utilities', count: 5, desc: 'Subnet calculator, JWT decoder, Base64 encoder, and phone number lookup.', href: '/osint?cat=Utilities' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [osintQuery, setOsintQuery] = useState('');
  // SSR/no-JS render the final values; JS animates 0 -> N on first sight
  const [stat, setStat] = useState({ tools: 44, cats: 6 });
  const statsRef = useRef<HTMLDivElement>(null);

  // Scroll reveals (shared hook) — re-runs on filter/search so newly
  // rendered rows get observed too.
  useReveal([activeCategory, searchQuery]);

  // Count-up on the OSINT stat numbers (skipped under reduced motion;
  // screen readers only ever see the static values)
  useEffect(() => {
    const el = statsRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1100;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const ease = 1 - Math.pow(1 - p, 4);
        setStat({ tools: Math.round(44 * ease), cats: Math.round(6 * ease) });
        if (p < 1) requestAnimationFrame(tick);
      };
      setStat({ tools: 0, cats: 0 });
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const featured = getFeatured();
  const lead = featured[0] ?? null;
  const latest = getLatest(3);
  const filteredArticles = getByCategory(activeCategory).filter(a =>
    !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const relevanceColor = (r: string) => r === 'HIGH' ? '#ff4d4d' : r === 'MED' ? '#ffaa00' : '#1e9eff';
  const runOsintSearch = () => {
    const q = osintQuery.trim();
    if (q) window.location.href = `/osint?q=${encodeURIComponent(q)}`;
  };

  return (
    <>
      <style>{`
        .rr-mono { font-family: var(--font-mono); }

        /* ── Hero ── */
        .rr-hero { padding: 150px 40px 0; border-bottom: 1px solid var(--border); }
        .rr-hero-inner { max-width: 1280px; margin: 0 auto; }
        .rr-hero-eyebrow {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          display: flex; align-items: center; gap: 12px;
          animation: fadeUp 0.6s ease 0.05s both;
        }
        .rr-hero-eyebrow::after { content: ''; height: 1px; flex: 1; background: var(--border); }
        .rr-hero-title {
          font-family: var(--font-display);
          font-size: clamp(58px, 10.5vw, 148px);
          font-weight: 900; text-transform: uppercase;
          letter-spacing: -0.025em; line-height: 0.92;
          color: #fff; margin-top: 28px;
        }
        /* masked line reveal (nasaforce-style): outer clips, inner rises */
        .rr-hl { display: block; overflow: hidden; padding-bottom: 0.04em; }
        .rr-hl-in {
          display: block; transform: translateY(115%);
          animation: rrLineUp 0.95s var(--ease-expo) 0.12s both;
        }
        .rr-hl:nth-child(2) .rr-hl-in { animation-delay: 0.24s; }
        .rr-hl-accent { color: var(--accent); }
        @keyframes rrLineUp { to { transform: translateY(0); } }
        /* first visit: hold entrances until the intro curtain lifts (~1.5s) */
        html.rr-intro-active .rr-hero-eyebrow { animation-delay: 1.3s; }
        html.rr-intro-active .rr-hl-in { animation-delay: 1.38s; }
        html.rr-intro-active .rr-hl:nth-child(2) .rr-hl-in { animation-delay: 1.5s; }
        html.rr-intro-active .rr-hero-mission { animation-delay: 1.62s; }
        html.rr-intro-active .rr-dir { animation-delay: 1.74s; }
        .rr-sr {
          position: absolute; width: 1px; height: 1px; overflow: hidden;
          clip: rect(0 0 0 0); white-space: nowrap;
        }
        .rr-hero-mission {
          font-size: 18px; line-height: 1.65; color: var(--text-secondary);
          max-width: 620px; margin: 30px 0 56px;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .rr-hero-mission strong { color: var(--text-primary); font-weight: 600; }

        /* Directory — what this site contains */
        .rr-dir { animation: fadeUp 0.6s ease 0.28s both; }
        .rr-dir-row {
          display: grid; grid-template-columns: 56px 300px 1fr auto 40px;
          align-items: baseline; gap: 24px;
          padding: 26px 0; border-top: 1px solid var(--border);
          text-decoration: none;
        }
        .rr-dir-row:hover { background: var(--bg-secondary); }
        .rr-dir-idx { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
        .rr-dir-name {
          font-family: var(--font-display); font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 700; text-transform: uppercase; letter-spacing: -0.01em;
          color: var(--text-primary); transition: color 0.15s;
        }
        .rr-dir-row:hover .rr-dir-name { color: var(--accent); }
        .rr-dir-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
        .rr-dir-meta {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-muted); white-space: nowrap;
        }
        .rr-dir-arrow { color: var(--text-muted); font-size: 18px; text-align: right; transition: transform 0.15s, color 0.15s; }
        .rr-dir-row:hover .rr-dir-arrow { transform: translateX(4px); color: var(--accent); }

        /* ── Credentials strip ── */
        .rr-creds { border-bottom: 1px solid var(--border); padding: 13px 40px; background: var(--bg-secondary); }
        .rr-creds-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .rr-creds-label { color: var(--text-muted); }
        .rr-creds-item { color: var(--text-secondary); display: flex; align-items: center; gap: 8px; }
        .rr-creds-item::before { content: '▪'; color: var(--accent); font-size: 9px; }

        /* ── Sections ── */
        .rr-section { padding: 88px 40px; }
        .rr-section--tight { padding-top: 64px; }
        .rr-section-inner { max-width: 1280px; margin: 0 auto; }
        .rr-sh {
          display: flex; align-items: baseline; gap: 18px;
          padding-bottom: 18px; margin-bottom: 40px;
          border-bottom: 1px solid var(--border-bright);
        }
        .rr-sh-idx { font-family: var(--font-mono); font-size: 14px; color: var(--accent); }
        .rr-sh h2 {
          font-family: var(--font-display); font-size: 24px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.01em; color: #fff;
        }
        .rr-sh-line { flex: 1; }
        .rr-sh-link {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--accent); text-decoration: none;
          white-space: nowrap;
        }
        .rr-sh-link:hover { text-decoration: underline; }

        /* ── Featured ── */
        .rr-lead {
          display: block; text-decoration: none;
          border: 1px solid var(--border); padding: 48px;
          background: var(--bg-secondary); margin-bottom: 2px;
        }
        .rr-lead:hover { background: var(--bg-card); border-color: var(--border-bright); }
        .rr-meta-row { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-bottom: 18px; }
        .rr-tag {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .rr-date { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .rr-lead h3 {
          font-family: var(--font-display); font-size: clamp(28px, 4vw, 46px);
          font-weight: 800; line-height: 1.06; letter-spacing: -0.015em;
          color: var(--text-primary); max-width: 900px;
        }
        .rr-lead:hover h3 { color: #fff; }
        .rr-lead p { font-size: 16px; line-height: 1.7; color: var(--text-secondary); max-width: 600px; margin-top: 18px; }
        .rr-lead-foot { display: flex; gap: 24px; margin-top: 28px; align-items: center; }
        .rr-read {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
        }
        .rr-sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .rr-sub {
          display: block; text-decoration: none;
          border: 1px solid var(--border); padding: 32px;
        }
        .rr-sub:hover { background: var(--bg-card); border-color: var(--border-bright); }
        .rr-sub h3 {
          font-family: var(--font-display); font-size: 22px; font-weight: 700;
          line-height: 1.2; letter-spacing: -0.01em; color: var(--text-primary);
        }
        .rr-sub:hover h3 { color: #fff; }
        .rr-sub p { font-size: 14px; line-height: 1.65; color: var(--text-secondary); margin-top: 12px; }
        .rr-sub-foot { display: flex; gap: 18px; margin-top: 20px; align-items: center; }

        /* ── Report register (list rows) ── */
        .rr-toolbar {
          display: flex; align-items: stretch; flex-wrap: wrap; gap: 10px;
          margin-bottom: 28px;
        }
        .rr-toolbar-filters { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }
        .rr-toolbar .cat-filter-btn { padding: 10px 16px; }
        .rr-search { display: flex; border: 1px solid var(--border-bright); }
        .rr-search:focus-within { border-color: var(--accent); }
        .rr-search input {
          background: transparent; border: none;
          padding: 10px 14px; width: 220px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em;
          color: var(--text-primary);
        }
        .rr-search input::placeholder { color: var(--text-muted); }
        .rr-search button {
          background: none; border: none; color: var(--text-secondary);
          cursor: pointer; padding: 0 14px; font-family: var(--font-mono); font-size: 12px;
        }
        .rr-search button:hover { color: #fff; }
        .rr-register { border-top: 1px solid var(--border-bright); }
        .rr-row {
          display: grid; grid-template-columns: 110px 150px 1fr 190px;
          gap: 24px; align-items: baseline;
          padding: 22px 8px; border-bottom: 1px solid var(--border);
          text-decoration: none;
        }
        .rr-row:hover { background: var(--bg-secondary); }
        .rr-row h3 {
          font-family: var(--font-display); font-size: 19px; font-weight: 600;
          line-height: 1.25; letter-spacing: -0.005em; color: var(--text-primary);
        }
        .rr-row:hover h3 { color: var(--accent); }
        .rr-row-excerpt { font-size: 14px; line-height: 1.6; color: var(--text-secondary); margin-top: 6px; max-width: 640px; }
        /* compact meta line for <=1024px — replaces the desktop grid columns */
        .rr-row-foot {
          display: none; align-items: baseline; gap: 14px; flex-wrap: wrap;
          margin-top: 12px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-muted);
        }
        .rr-row-meta {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; text-align: right;
          display: flex; flex-direction: column; gap: 6px;
        }
        .rr-empty {
          font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-muted);
          padding: 56px 20px; text-align: center; border-bottom: 1px solid var(--border);
        }

        /* ── OSINT toolkit ── */
        .rr-osint { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .rr-osint-head { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-bottom: 44px; align-items: end; }
        .rr-osint-blurb { font-size: 16px; line-height: 1.7; color: var(--text-secondary); max-width: 480px; }
        .rr-stats { display: flex; gap: 40px; margin-top: 28px; }
        .rr-stat-num { font-family: var(--font-display); font-size: 34px; font-weight: 800; color: #fff; }
        .rr-stat-label {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-muted); margin-top: 2px;
        }
        .rr-router label {
          display: block; font-family: var(--font-mono); font-size: 12px;
          letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .rr-router-row { display: flex; }
        .rr-router-row input {
          flex: 1; background: var(--bg-primary);
          border: 1px solid var(--border-bright); border-right: none;
          color: var(--text-primary); font-family: var(--font-mono);
          font-size: 13px; padding: 14px 16px;
        }
        .rr-router-row input::placeholder { color: var(--text-muted); }
        .rr-router-row input:focus { border-color: var(--accent); }
        .rr-router-row button {
          font-family: var(--font-mono); font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--accent); border: 1px solid var(--accent); color: #000;
          padding: 14px 24px; cursor: pointer; white-space: nowrap;
        }
        .rr-router-row button:hover { background: #4db3ff; }
        .rr-router-hint {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em;
          color: var(--text-muted); margin-top: 10px;
        }
        .rr-router-hint span { color: var(--text-secondary); }
        .rr-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
        .rr-cat { background: var(--bg-secondary); padding: 28px; text-decoration: none; display: flex; flex-direction: column; }
        .rr-cat:hover { background: var(--bg-card); }
        .rr-cat-top {
          display: flex; justify-content: space-between; align-items: baseline;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 14px;
        }
        .rr-cat h3 {
          font-family: var(--font-display); font-size: 21px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0; color: var(--text-primary);
        }
        .rr-cat:hover h3 { color: var(--accent); }
        .rr-cat p { font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); margin-top: 10px; flex: 1; }
        .rr-cat-arrow { font-size: 15px; color: var(--text-muted); margin-top: 18px; align-self: flex-end; }
        .rr-cat:hover .rr-cat-arrow { color: var(--accent); }
        .rr-osint-all {
          display: block; text-align: center; margin-top: 2px;
          border: 1px solid var(--border-bright); padding: 16px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-primary); text-decoration: none;
        }
        .rr-osint-all:hover { background: var(--bg-card); color: var(--accent); }

        /* ── Daily brief ── */
        .rr-brief {
          display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center;
          border: 1px solid var(--border); padding: 44px 48px; background: var(--bg-secondary);
        }
        .rr-brief-label {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: #ffaa00;
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .rr-brief-dot { width: 7px; height: 7px; border-radius: 50%; background: #ffaa00; }
        .rr-brief h3 {
          font-family: var(--font-display); font-size: clamp(24px, 3vw, 34px);
          font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em; color: #fff;
        }
        .rr-brief p { font-size: 15px; line-height: 1.65; color: var(--text-secondary); margin-top: 12px; max-width: 560px; }
        .rr-brief-cta {
          font-family: var(--font-mono); font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          border: 1px solid var(--border-bright); color: var(--text-primary);
          padding: 15px 28px; text-decoration: none; white-space: nowrap;
        }
        .rr-brief-cta:hover { border-color: var(--accent); color: var(--accent); }

        /* ── Footer ── */
        .rr-footer { border-top: 1px solid var(--border-bright); padding: 64px 40px 36px; background: var(--bg-secondary); }
        .rr-footer-inner { max-width: 1280px; margin: 0 auto; }
        .rr-footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; padding-bottom: 44px; border-bottom: 1px solid var(--border); margin-bottom: 28px; }
        .rr-footer-brand {
          font-family: var(--font-display); font-size: 22px; font-weight: 800;
          text-transform: uppercase; color: #fff; letter-spacing: 0.01em;
        }
        .rr-footer-brand em { font-style: normal; color: var(--accent); }
        .rr-footer-desc { font-size: 13.5px; color: var(--text-secondary); line-height: 1.7; max-width: 300px; margin-top: 14px; }
        .rr-footer h2 {
          font-family: var(--font-mono); font-size: 12px; font-weight: 500;
          letter-spacing: 0.08em; color: var(--text-secondary); text-transform: uppercase;
          margin-bottom: 18px;
        }
        .rr-footer ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .rr-footer ul a { font-size: 14px; color: var(--text-secondary); text-decoration: none; }
        .rr-footer ul a:hover { color: #fff; }
        .rr-footer-bottom {
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em;
          color: var(--text-muted); text-transform: uppercase;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .rr-dir-row { grid-template-columns: 40px 1fr auto 32px; }
          .rr-dir-desc { display: none; }
          .rr-osint-head { grid-template-columns: 1fr; gap: 36px; }
          .rr-cats { grid-template-columns: repeat(2, 1fr); }
          .rr-footer-top { grid-template-columns: 1fr 1fr; gap: 36px; }
          /* title first; metadata moves into the foot line below it */
          .rr-row { grid-template-columns: 1fr; padding: 20px 4px; }
          .rr-row > .rr-date, .rr-row > .rr-tag--col, .rr-row > .rr-row-meta { display: none; }
          .rr-row-foot { display: flex; }
        }
        @media (max-width: 768px) {
          .rr-hero { padding: 120px 16px 0; }
          .rr-section { padding: 56px 16px; }
          .rr-creds { padding: 12px 16px; }
          .rr-creds-inner { gap: 14px; }
          .rr-lead { padding: 28px 20px; }
          .rr-sub-grid { grid-template-columns: 1fr; }
          .rr-cats { grid-template-columns: 1fr; }
          .rr-dir-row { gap: 14px; padding: 20px 0; grid-template-columns: 28px 1fr auto 24px; }
          .rr-brief { grid-template-columns: 1fr; padding: 28px 20px; }
          .rr-footer { padding: 48px 16px 28px; }
          .rr-footer-top { grid-template-columns: 1fr; gap: 32px; }
          .rr-footer-bottom { flex-direction: column; align-items: flex-start; }
          .rr-search { width: 100%; }
          .rr-search input { flex: 1; width: auto; padding: 13px 14px; }
          .rr-search button { padding: 0 18px; }
          .rr-toolbar .cat-filter-btn { padding: 14px 16px; }
          /* comfortable tap targets without changing visual rhythm */
          .rr-footer ul a { display: inline-block; padding: 12px 0; margin: -5px 0; }
          .rr-router-row { flex-direction: column; }
          .rr-router-row input { border-right: 1px solid var(--border-bright); }
        }
      `}</style>

      <main id="main">
        {/* HERO — what this site is */}
        <section className="rr-hero" aria-labelledby="rr-hero-h1">
          <div className="rr-hero-inner">
            <p className="rr-hero-eyebrow">Open-source intelligence &amp; analysis · Est. 2026</p>
            <h1 className="rr-hero-title" id="rr-hero-h1">
              <span className="rr-hl"><span className="rr-hl-in">The Rudd</span></span>
              <span className="rr-hl"><span className="rr-hl-in rr-hl-accent">Report</span></span>
            </h1>
            <p className="rr-hero-mission">
              Independent writing on <strong>cybersecurity, national security, and geopolitics</strong>,
              plus a free investigation toolkit and a daily intelligence brief.
            </p>

            {/* div+role (not <nav>): legacy global CSS targets bare nav elements */}
            <div className="rr-dir" role="navigation" aria-label="Site directory">
              <a className="rr-dir-row" href="/articles">
                <span className="rr-dir-idx" aria-hidden="true">01</span>
                <span className="rr-dir-name">Reports &amp; Analysis</span>
                <span className="rr-dir-desc">Long-form reporting across five coverage desks.</span>
                <span className="rr-dir-meta">{ARTICLES.length} reports</span>
                <span className="rr-dir-arrow" aria-hidden="true">→</span>
              </a>
              <a className="rr-dir-row" href="/osint">
                <span className="rr-dir-idx" aria-hidden="true">02</span>
                <span className="rr-dir-name">OSINT Toolkit</span>
                <span className="rr-dir-desc">Free investigation tools — no account needed.</span>
                <span className="rr-dir-meta">44 tools</span>
                <span className="rr-dir-arrow" aria-hidden="true">→</span>
              </a>
              <a className="rr-dir-row" href="/brief" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="rr-dir-idx" aria-hidden="true">03</span>
                <span className="rr-dir-name">Aladdin Daily Brief</span>
                <span className="rr-dir-desc">Open-source intelligence summary, posted every morning.</span>
                <span className="rr-dir-meta">Daily · 0600</span>
                <span className="rr-dir-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* CREDENTIALS */}
        <div className="rr-creds">
          <div className="rr-creds-inner">
            <span className="rr-creds-label">Background</span>
            <span className="rr-creds-item">CISA — HS-POWER Fellow</span>
            <span className="rr-creds-item">ODNI IC-CAE Program</span>
            <span className="rr-creds-item">Cambridge Intelligence Studies</span>
            <span className="rr-creds-item">DHS Cybersecurity</span>
          </div>
        </div>

        {/* EARTH — scroll scene */}
        <BlueMarble />

        {/* 01 — FEATURED */}
        <section className="rr-section" aria-labelledby="rr-h-featured">
          <div className="rr-section-inner">
            <div className="rr-sh rv">
              <span className="rr-sh-idx" aria-hidden="true">01</span>
              <h2 id="rr-h-featured">Featured</h2>
              <span className="rr-sh-line" />
              <a className="rr-sh-link" href="/articles">View all reports →</a>
            </div>

            {!lead ? (
              <p className="rr-empty">No reports published yet</p>
            ) : (
              <>
                <a href={`/articles/${lead.slug}`} className="rr-lead rv">
                  <span className="rr-meta-row">
                    <span className="rr-tag" style={{ color: getCategoryColor(lead.category) }}>{lead.category}</span>
                    <span className="rr-date">{lead.date}</span>
                  </span>
                  <h3>{lead.title}</h3>
                  <p>{lead.excerpt}</p>
                  <span className="rr-lead-foot">
                    <span className="rr-read">Read report →</span>
                    <span className="rr-date" style={{ color: relevanceColor(lead.relevance) }}>{lead.relevance} relevance</span>
                  </span>
                </a>
                <div className="rr-sub-grid">
                  {latest.filter(a => a.slug !== lead.slug).slice(0, 2).map((a, i) => (
                    <a key={a.slug} href={`/articles/${a.slug}`} className={`rr-sub rv rv-d${i + 1}`}>
                      <span className="rr-meta-row">
                        <span className="rr-tag" style={{ color: getCategoryColor(a.category) }}>{a.category}</span>
                        <span className="rr-date">{a.date}</span>
                      </span>
                      <h3>{a.title}</h3>
                      <p>{a.excerpt}</p>
                      <span className="rr-sub-foot">
                        <span className="rr-read">Read →</span>
                        <span className="rr-date">{getReadingTime(a.content)} min</span>
                      </span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* 02 — OSINT TOOLKIT */}
        <section className="rr-section rr-osint" aria-labelledby="rr-h-osint">
          <div className="rr-section-inner">
            <div className="rr-sh rv">
              <span className="rr-sh-idx" aria-hidden="true">02</span>
              <h2 id="rr-h-osint">OSINT Toolkit</h2>
              <span className="rr-sh-line" />
              <a className="rr-sh-link" href="/osint">Open the hub →</a>
            </div>

            <div className="rr-osint-head rv">
              <div>
                <p className="rr-osint-blurb">
                  44 free tools covering companies, networks, live tracking, and more.
                  Everything runs in the browser with no account required.
                </p>
                <div className="rr-stats" ref={statsRef}>
                  <div>
                    <div className="rr-stat-num"><span aria-hidden="true">{stat.tools}</span><span className="rr-sr">44</span></div>
                    <div className="rr-stat-label">Live tools</div>
                  </div>
                  <div>
                    <div className="rr-stat-num"><span aria-hidden="true">{stat.cats}</span><span className="rr-sr">6</span></div>
                    <div className="rr-stat-label">Categories</div>
                  </div>
                  <div><div className="rr-stat-num">$0</div><div className="rr-stat-label">No sign-up</div></div>
                </div>
              </div>
              <div className="rr-router">
                <label htmlFor="rr-osint-q">Quick investigate — paste anything</label>
                <div className="rr-router-row">
                  <input
                    id="rr-osint-q"
                    placeholder="IP, domain, hash, username, company name..."
                    value={osintQuery}
                    onChange={e => setOsintQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') runOsintSearch(); }}
                  />
                  <button onClick={runOsintSearch}>Search →</button>
                </div>
                <p className="rr-router-hint">
                  Detects IPs, domains, hashes, emails, and usernames automatically.
                </p>
              </div>
            </div>

            <div className="rr-cats">
              {OSINT_CATS.map((cat, i) => (
                <a key={cat.name} href={cat.href} className={`rr-cat rv rv-d${(i % 3) + 1}`}>
                  <span className="rr-cat-top">
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span>{cat.count} tools</span>
                  </span>
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <span className="rr-cat-arrow" aria-hidden="true">→</span>
                </a>
              ))}
            </div>
            <a href="/osint" className="rr-osint-all rv">View all 44 tools in the OSINT hub →</a>
          </div>
        </section>

        {/* 03 — ALL REPORTS (register) */}
        <section className="rr-section rr-section--tight" aria-labelledby="rr-h-reports">
          <div className="rr-section-inner">
            <div className="rr-sh rv">
              <span className="rr-sh-idx" aria-hidden="true">03</span>
              <h2 id="rr-h-reports">All Reports</h2>
              <span className="rr-sh-line" />
            </div>

            <div className="rr-toolbar rv">
              <div className="rr-toolbar-filters" role="group" aria-label="Filter reports by category">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    aria-pressed={activeCategory === cat}
                    className={`cat-filter-btn${activeCategory === cat ? ' cat-filter-btn--active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="rr-search">
                <input
                  aria-label="Search reports"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} aria-label="Clear search">✕</button>
                )}
              </div>
            </div>

            <p aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
              {filteredArticles.length} reports shown
            </p>

            <div className="rr-register">
              {filteredArticles.length === 0 ? (
                <p className="rr-empty">{searchQuery ? `No reports matching "${searchQuery}"` : 'No reports in this category yet'}</p>
              ) : filteredArticles.map((a, i) => (
                <a key={a.slug} href={`/articles/${a.slug}`} className={`rr-row rv rv-d${(i % 5) + 1}`}>
                  <span className="rr-date">{a.date}</span>
                  <span className="rr-tag rr-tag--col" style={{ color: getCategoryColor(a.category) }}>{a.category}</span>
                  <div>
                    <h3>{a.title}</h3>
                    <div className="rr-row-excerpt">{a.excerpt}</div>
                    <span className="rr-row-foot">
                      <span style={{ color: getCategoryColor(a.category) }}>{a.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{a.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{getReadingTime(a.content)} min read</span>
                      <span aria-hidden="true">·</span>
                      <span style={{ color: relevanceColor(a.relevance) }}>{a.relevance}</span>
                    </span>
                  </div>
                  <span className="rr-row-meta">
                    <span style={{ color: 'var(--text-muted)' }}>{getReadingTime(a.content)} min read</span>
                    <span style={{ color: relevanceColor(a.relevance) }}>{a.relevance} relevance</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — DAILY BRIEF */}
        <section className="rr-section" aria-labelledby="rr-h-brief">
          <div className="rr-section-inner">
            <div className="rr-sh rv">
              <span className="rr-sh-idx" aria-hidden="true">04</span>
              <h2 id="rr-h-brief">Daily Brief</h2>
              <span className="rr-sh-line" />
            </div>
            <div className="rr-brief rv-clip">
              <div>
                <p className="rr-brief-label">
                  <span className="rr-brief-dot" aria-hidden="true" />
                  Aladdin · posted every morning at 0600
                </p>
                <h3>Morning Intelligence Brief</h3>
                <p>Your daily open-source intelligence summary — geopolitics, cyber, and national security in one read.</p>
              </div>
              <a href="/brief" className="rr-brief-cta">Read today&apos;s brief →</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="rr-footer">
        <div className="rr-footer-inner">
          <div className="rr-footer-top rv">
            <div>
              <p className="rr-footer-brand">Rudd <em>Report</em></p>
              <p className="rr-footer-desc">Independent coverage of security, intelligence, and world affairs.</p>
            </div>
            <div>
              <h2>Coverage</h2>
              <ul>
                <li><a href="/cybersecurity">Cybersecurity</a></li>
                <li><a href="/intelligence">Intelligence</a></li>
                <li><a href="/geopolitics">Geopolitics</a></li>
                <li><a href="/national-security">National Security</a></li>
                <li><a href="/economic-security">Economic Security</a></li>
              </ul>
            </div>
            <div>
              <h2>Navigate</h2>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/articles">All Reports</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h2>Connect</h2>
              <ul>
                <li><a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X (opens in new tab)">Twitter / X</a></li>
                <li><a href="https://www.linkedin.com/in/kyle-rudd-68209b252/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in new tab)">LinkedIn</a></li>
                <li><a href="/feed.xml">RSS Feed</a></li>
              </ul>
            </div>
          </div>
          <div className="rr-footer-bottom">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <FlagUS width={19} />
              © 2026 The Rudd Report
            </span>
            <span>Independent publication · Open-source intelligence &amp; analysis</span>
          </div>
        </div>
      </footer>
    </>
  );
}
