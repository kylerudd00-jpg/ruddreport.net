'use client';
import { useState } from 'react';

type EntityResult = {
  found: boolean;
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: string | null;
  url?: string | null;
  suggestions?: string[];
};

const OSINT_LINKS = (q: string) => [
  { label: 'Google News', url: `https://news.google.com/search?q=${encodeURIComponent(q)}` },
  { label: 'OpenCorporates', url: `https://opencorporates.com/companies?q=${encodeURIComponent(q)}` },
  { label: 'ICIJ Offshore Leaks', url: `https://offshoreleaks.icij.org/search?q=${encodeURIComponent(q)}` },
  { label: 'SEC EDGAR', url: `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(q)}&action=getcompany` },
  { label: 'LinkedIn', url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}` },
  { label: 'Twitter / X', url: `https://x.com/search?q=${encodeURIComponent(q)}` },
  { label: 'US Court Records', url: `https://www.pacermonitor.com/search/?q=${encodeURIComponent(q)}` },
  { label: 'OpenSanctions', url: `https://www.opensanctions.org/search/?q=${encodeURIComponent(q)}` },
];

export default function EntitySearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<EntityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/osint/entity?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to fetch. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #ff3a3a; padding: 20px 0; }
        .not-found { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; padding: 20px 0; text-transform: uppercase; }
        .entity-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); border-top: 2px solid #1e9eff; padding: 32px; display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: start; margin-bottom: 24px; }
        .entity-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .entity-desc { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; margin-bottom: 16px; }
        .entity-extract { font-size: 14px; font-weight: 400; color: #9ab0c4; line-height: 1.9; margin-bottom: 20px; }
        .entity-wiki-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .entity-wiki-link:hover { color: #4db8ff; }
        .entity-thumb { width: 140px; height: 140px; object-fit: cover; border: 1px solid rgba(30,158,255,0.2); flex-shrink: 0; }
        .suggestions { margin-bottom: 24px; }
        .suggestions-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .suggestions-list { display: flex; gap: 8px; flex-wrap: wrap; }
        .suggestion-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #7a9bb5; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 6px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .suggestion-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
        .osint-section { margin-top: 4px; }
        .osint-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .osint-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .osint-link { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 16px 20px; text-decoration: none; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #7a9bb5; text-transform: uppercase; transition: all 0.3s; display: block; }
        .osint-link:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); background: #0f1e2e; }
        .osint-link-arrow { color: #3d5870; margin-left: 4px; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .loading { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; animation: pulse 1s infinite; padding: 20px 0; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results-wrap { padding: 0 20px 60px; }
          .entity-card { grid-template-columns: 1fr; }
          .entity-thumb { width: 100%; height: 200px; }
          .osint-grid { grid-template-columns: repeat(2, 1fr); }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
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
          <div className="hamburger" onClick={() => document.getElementById('entityMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="entityMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('entityMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">OSINT Hub — Entity Intelligence</div>
            </div>
            <div className="tool-title">Entity Search</div>
            <p className="tool-desc">Search any person, organization, or topic. Pulls a Wikipedia profile summary and surfaces quick-launch links to cross-reference against news archives, corporate registries, sanctions databases, court records, and more.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter a person, company, or organization — e.g. Vladimir Putin"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && search()}
            />
            <button className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
        </div>

        <div className="results-wrap">
          {loading && <div className="loading">Querying intelligence sources...</div>}
          {error && <div className="error-msg">Error: {error}</div>}

          {result && !result.found && !loading && (
            <div className="not-found">No Wikipedia profile found — try the cross-reference links below</div>
          )}

          {result?.found && (
            <>
              <div className="entity-card">
                <div>
                  <div className="entity-title">{result.title}</div>
                  {result.description && <div className="entity-desc">{result.description}</div>}
                  {result.extract && <p className="entity-extract">{result.extract}</p>}
                  {result.url && (
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="entity-wiki-link">
                      View on Wikipedia →
                    </a>
                  )}
                </div>
                {result.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.thumbnail} alt={result.title} className="entity-thumb" />
                )}
              </div>

              {result.suggestions && result.suggestions.length > 0 && (
                <div className="suggestions">
                  <div className="suggestions-label">Related results</div>
                  <div className="suggestions-list">
                    {result.suggestions.map((s, i) => (
                      <button key={i} className="suggestion-btn" onClick={() => { setQuery(s); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {(result || query) && !loading && (
            <div className="osint-section">
              <div className="osint-label">Cross-reference in external databases</div>
              <div className="osint-grid">
                {OSINT_LINKS(result?.title || query).map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="osint-link">
                    {l.label}<span className="osint-link-arrow"> →</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
            
          </div>
        </footer>
      </div>
    </>
  );
}
