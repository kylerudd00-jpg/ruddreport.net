'use client';
import { useState } from 'react';

export default function SubdomainScanner() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    const text = filtered.map((s: any) => s.name).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const scan = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/osint/subdomains?domain=${encodeURIComponent(domain.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError('' + (e.message || 'Failed to query certificate transparency logs. Try again.'));
    }
    setLoading(false);
  };

  const filtered = result?.subdomains?.filter((s: any) =>
    !filter || s.name.toLowerCase().includes(filter.toLowerCase())
  ) || [];

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
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #33ffaa; }
        .search-btn:disabled { background: #0d3322; color: #3d5870; cursor: not-allowed; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .results-meta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .results-meta span { color: #1e9eff; }
        .results-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .filter-box { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); padding: 10px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; outline: none; width: 240px; }
        .filter-box::placeholder { color: #3d5870; }
        .copy-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 10px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; white-space: nowrap; }
        .copy-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
        .copy-btn.copied { color: #1e9eff; border-color: #1e9eff; }
        .subdomain-table { width: 100%; border-collapse: collapse; }
        .subdomain-table th { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(30,158,255,0.12); background: rgba(30,158,255,0.03); }
        .subdomain-table td { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; padding: 10px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); letter-spacing: 0.5px; word-break: break-all; }
        .subdomain-table tr:hover td { background: rgba(30,158,255,0.03); }
        .subdomain-name { color: #1e9eff; }
        .subdomain-wildcard { color: #ffaa00; }
        .date-cell { color: #3d5870; font-size: 10px; white-space: nowrap; }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .info-box { background: rgba(30,158,255,0.04); border: 1px solid rgba(30,158,255,0.15); padding: 16px 20px; margin-bottom: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; line-height: 1.8; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .results-header { flex-direction: column; align-items: flex-start; }
          .results-actions { width: 100%; flex-direction: column; }
          .filter-box { width: 100%; }
          .copy-btn { width: 100%; text-align: center; }
          .subdomain-table th, .subdomain-table td { padding: 8px 10px; font-size: 10px; }
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
          <div className="hamburger" onClick={() => document.getElementById('subMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="subMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('subMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">Certificate Transparency</div>
            </div>
            <div className="tool-title">Subdomain Scanner</div>
            <p className="tool-desc">Companies often leave staging servers, internal tools, and admin panels exposed on subdomains they've forgotten about. This tool searches SSL certificate logs to find every subdomain that has ever existed for a domain — including dev environments, APIs, and forgotten infrastructure that may still be accessible.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="example.com"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
            />
            <button className="search-btn" onClick={scan} disabled={loading || !domain.trim()}>
              {loading ? 'Scanning...' : 'Scan →'}
            </button>
          </div>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars">
                <span /><span /><span /><span /><span />
              </div>
              <div className="loading-text">Querying certificate transparency logs...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}
          {result && (
            <>
              <div className="info-box">
                Source: crt.sh certificate transparency log aggregator &nbsp;|&nbsp; Data sourced from public SSL/TLS certificate issuance records &nbsp;|&nbsp; Wildcards (*) indicate broad cert coverage
              </div>
              <div className="results-header">
                <div className="results-meta">
                  <span>{result.total > result.count ? `${result.count} of ${result.total}` : result.count}</span> subdomains found for <span>{result.domain}</span>
                  {filter && filtered.length < result.count && <> — showing <span>{filtered.length}</span> filtered</>}
                </div>
                <div className="results-actions">
                  <input
                    className="filter-box"
                    placeholder="filter results..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                  <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copyAll}>
                    {copied ? '✓ Copied' : 'Copy All'}
                  </button>
                </div>
              </div>
              <div className="table-scroll">
              <table className="subdomain-table">
                <thead>
                  <tr>
                    <th>Subdomain</th>
                    <th>Issuer</th>
                    <th>Valid From</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any, i: number) => (
                    <tr key={i}>
                      <td className={s.name.startsWith('*') ? 'subdomain-wildcard' : 'subdomain-name'}>{s.name}</td>
                      <td style={{color:'#3d5870', fontSize:'10px'}}>{s.issuer.replace(/^.*CN=/, '').split(',')[0] || '—'}</td>
                      <td className="date-cell">{s.notBefore ? new Date(s.notBefore).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '—'}</td>
                      <td className="date-cell">{s.notAfter ? new Date(s.notAfter).toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'}) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
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
