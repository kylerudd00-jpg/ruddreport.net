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
    // header Search button (and anything else) opens the modal via this event
    const openHandler = () => setOpen(true);
    window.addEventListener('keydown', handler);
    window.addEventListener('rr:open-search', openHandler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('rr:open-search', openHandler);
    };
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

  // No floating launcher — search opens from the header Search button or Cmd/Ctrl+K.
  if (!open) return null;

  return (
    <div
      className="search-modal-wrap"
      role="dialog"
      aria-modal="true"
      aria-label="Search reports and OSINT tools"
      style={{
        position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(8,8,10,0.9)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', paddingTop: '80px',
      }}
      onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="search-modal-box" style={{
        width: '100%', maxWidth: '680px', background: 'var(--bg-secondary)',
        border: '1px solid var(--border-bright)', overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '18px', marginRight: '12px' }} aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search reports and OSINT tools"
            placeholder="Search reports and OSINT tools..."
            style={{
              flex: 1, background: 'none', border: 'none',
              fontFamily: "var(--font-display)", fontSize: '16px',
              color: 'var(--text-primary)', padding: '20px 0',
            }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: '1px solid var(--border-bright)', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em' }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {!query.trim() && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Type to search reports and tools
            </div>
          )}

          {showEmpty && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              No results for "{query}"
            </div>
          )}

          {results.articles.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 8px', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                Reports
              </div>
              {results.articles.map(a => (
                <a
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px',
                    textDecoration: 'none', borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,158,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px', lineHeight: 1.2 }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: CAT_COLOR[a.category] || 'var(--accent)', textTransform: 'uppercase' }}>{a.category}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{a.date}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }} aria-hidden="true">→</div>
                </a>
              ))}
            </div>
          )}

          {results.tools.length > 0 && (
            <div>
              <div style={{ padding: '12px 20px 8px', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                OSINT Tools
              </div>
              {results.tools.map(t => (
                <a
                  key={t.href}
                  href={t.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 20px',
                    textDecoration: 'none', borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,158,255,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ width: '28px', height: '28px', background: `${CAT_COLOR[t.cat] || '#1e9eff'}15`, border: `1px solid ${CAT_COLOR[t.cat] || '#1e9eff'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
                    <span style={{ fontSize: '11px', color: CAT_COLOR[t.cat] || 'var(--accent)' }}>⊕</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text-primary)', marginBottom: '2px' }}>{t.name}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: CAT_COLOR[t.cat] || 'var(--accent)', textTransform: 'uppercase', border: `1px solid ${CAT_COLOR[t.cat] || '#1e9eff'}30`, padding: '2px 8px', whiteSpace: 'nowrap' }}>{t.cat}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '20px' }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>↵ SELECT</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>ESC CLOSE</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>⌘K TOGGLE</span>
        </div>
      </div>
    </div>
  );
}
