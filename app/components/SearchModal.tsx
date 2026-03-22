'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { ARTICLES } from '@/lib/articles';

const OSINT_TOOLS = [
  { name: 'IP Geolocation', desc: 'Locate any IP address', href: '/osint/ip', cat: 'Network' },
  { name: 'WHOIS Lookup', desc: 'Domain registration info', href: '/osint/whois', cat: 'Network' },
  { name: 'DNS Lookup', desc: 'Query DNS records', href: '/osint/dns', cat: 'Network' },
  { name: 'Subdomain Scanner', desc: 'Enumerate subdomains via CT logs', href: '/osint/subdomains', cat: 'Network' },
  { name: 'SSL Certificate Inspector', desc: 'Certificate transparency logs', href: '/osint/ssl', cat: 'Network' },
  { name: 'Subnet Calculator', desc: 'CIDR network math', href: '/osint/subnet', cat: 'Network' },
  { name: 'Username Hunter', desc: 'Check 39 platforms', href: '/osint/username', cat: 'Cyber' },
  { name: 'Hash Analyzer', desc: 'Identify and analyze file hashes', href: '/osint/hash', cat: 'Cyber' },
  { name: 'Base64 Encoder/Decoder', desc: 'Encode or decode Base64', href: '/osint/base64', cat: 'Utilities' },
  { name: 'JWT Decoder', desc: 'Decode JSON Web Tokens', href: '/osint/jwt', cat: 'Utilities' },
  { name: 'MAC Address Lookup', desc: 'Find vendor from MAC OUI', href: '/osint/mac', cat: 'Utilities' },
  { name: 'Corporate Intel Dashboard', desc: 'Full company research hub', href: '/osint/company', cat: 'Corporate' },
  { name: 'SEC EDGAR Search', desc: '10-K, 8-K, proxy filings', href: '/osint/edgar', cat: 'Corporate' },
  { name: 'Government Contracts', desc: 'USASpending.gov awards', href: '/osint/contracts', cat: 'Corporate' },
  { name: 'Conflict Tracker', desc: 'Live conflict zones map', href: '/osint/conflict', cat: 'Live & Tracking' },
  { name: 'Aviation Tracker', desc: 'Live flights, airport traffic, aircraft lookup by tail number', href: '/tools/flight-tracker', cat: 'Live & Tracking' },
  { name: 'Breach Lookup', desc: 'Check email across HIBP, DeHashed, IntelligenceX', href: '/osint/breach', cat: 'Cyber' },
  { name: 'Metadata Extractor', desc: 'Hidden file metadata', href: '/osint/metadata', cat: 'Cyber' },
  { name: 'Google Dork Builder', desc: 'Build advanced Google search operators', href: '/osint/dorks', cat: 'Cyber' },
  { name: 'Email Permutator', desc: 'Generate all email formats from name + domain', href: '/osint/email-permutator', cat: 'Corporate' },
  { name: 'Reverse Image Search', desc: 'Launch Google, TinEye, Yandex, Bing simultaneously', href: '/osint/reverse-image', cat: 'Cyber' },
  { name: 'People Search', desc: 'Aggregate public records and social profiles by name', href: '/osint/people', cat: 'Corporate' },
];

const CAT_COLOR: Record<string, string> = {
  Corporate: '#ffaa00',
  Network: '#1e9eff',
  Cyber: '#ff4444',
  'Live & Tracking': '#22cc66',
  Utilities: '#b464ff',
  Cybersecurity: '#ff4444',
  Intelligence: '#b464ff',
  Geopolitics: '#ffaa00',
  'National Security': '#22cc66',
  'Economic Security': '#00c9b0',
};

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { articles: [], tools: [] };
    const articles = ARTICLES.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    ).slice(0, 5);
    const tools = OSINT_TOOLS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.cat.toLowerCase().includes(q)
    ).slice(0, 5);
    return { articles, tools };
  }, [query]);

  const hasResults = results.articles.length > 0 || results.tools.length > 0;
  const showEmpty = query.trim() && !hasResults;

  if (!open) {
    return (
      <>
        <style>{`@media (max-width: 768px) { .search-float-btn { display: none !important; } }`}</style>
        <button
          className="search-float-btn"
          onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 200,
          background: 'rgba(10,21,32,0.95)', border: '1px solid rgba(30,158,255,0.25)',
          color: '#7a9bb5', fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '11px', letterSpacing: '2px', padding: '10px 18px',
          cursor: 'pointer', backdropFilter: 'blur(20px)', display: 'flex',
          alignItems: 'center', gap: '10px', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.5)';
          (e.currentTarget as HTMLButtonElement).style.color = '#1e9eff';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.25)';
          (e.currentTarget as HTMLButtonElement).style.color = '#7a9bb5';
        }}
      >
        <span style={{ opacity: 0.5, fontSize: '13px' }}>⌕</span>
        Search
      </button>
      </>
    );
  }

  return (
    <div
      className="search-modal-wrap"
      style={{
        position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(3,6,8,0.9)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '80px',
      }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="search-modal-box" style={{
        width: '100%', maxWidth: '680px', background: '#070d12',
        border: '1px solid rgba(30,158,255,0.25)', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(30,158,255,0.12)', padding: '0 20px' }}>
          <span style={{ color: '#3d5870', fontSize: '18px', marginRight: '12px' }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search reports and OSINT tools..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: "'Barlow', sans-serif", fontSize: '16px',
              color: '#d8e8f5', padding: '20px 0',
            }}
          />
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: '1px solid rgba(30,158,255,0.15)', color: '#3d5870', cursor: 'pointer', padding: '4px 8px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '1px' }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {!query.trim() && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase' }}>
              Type to search reports and tools
            </div>
          )}

          {showEmpty && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase' }}>
              No results for "{query}"
            </div>
          )}

          {results.articles.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 8px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase', borderBottom: '1px solid rgba(30,158,255,0.06)' }}>
                Reports
              </div>
              {results.articles.map(a => (
                <a
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px',
                    textDecoration: 'none', borderBottom: '1px solid rgba(30,158,255,0.06)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,158,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: '#c0cfe0', marginBottom: '3px', lineHeight: 1.2 }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '2px', color: CAT_COLOR[a.category] || '#1e9eff', textTransform: 'uppercase' }}>{a.category}</span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '1px', color: '#3d5870' }}>{a.date}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#3d5870', fontSize: '12px' }}>→</div>
                </a>
              ))}
            </div>
          )}

          {results.tools.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 8px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase', borderBottom: '1px solid rgba(30,158,255,0.06)' }}>
                OSINT Tools
              </div>
              {results.tools.map(t => (
                <a
                  key={t.href}
                  href={t.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px',
                    textDecoration: 'none', borderBottom: '1px solid rgba(30,158,255,0.06)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,158,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: '28px', height: '28px', background: `${CAT_COLOR[t.cat] || '#1e9eff'}15`, border: `1px solid ${CAT_COLOR[t.cat] || '#1e9eff'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', color: CAT_COLOR[t.cat] || '#1e9eff' }}>⊕</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', color: '#c0cfe0', marginBottom: '2px' }}>{t.name}</div>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontSize: '11px', color: '#3d5870' }}>{t.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '8px', letterSpacing: '2px', color: CAT_COLOR[t.cat] || '#1e9eff', textTransform: 'uppercase', border: `1px solid ${CAT_COLOR[t.cat] || '#1e9eff'}30`, padding: '2px 8px', whiteSpace: 'nowrap' }}>{t.cat}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(30,158,255,0.08)', display: 'flex', gap: '20px' }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '2px', color: '#3d5870' }}>↵ SELECT</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '2px', color: '#3d5870' }}>ESC CLOSE</span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '2px', color: '#3d5870' }}>⌘K TOGGLE</span>
        </div>
      </div>
    </div>
  );
}
