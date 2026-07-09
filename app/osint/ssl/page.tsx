'use client';
import { useState, useEffect } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
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
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
  .hero-inner { max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; }
  .tool-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }
  .input-row { display: flex; gap: 2px; margin-bottom: 8px; }
  .domain-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); color: #d8e8f5; font-family: 'Share Tech Mono', monospace; font-size: 14px; padding: 14px 18px; outline: none; transition: border-color 0.2s; }
  .domain-input:focus { border-color: rgba(30,158,255,0.5); }
  .domain-input::placeholder { color: #5a7a94; font-size: 12px; }
  .lookup-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 14px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .lookup-btn:hover { background: #4db3ff; }
  .lookup-btn:disabled { opacity: 0.5; cursor: default; }
  .hint { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: #5a7a94; margin-bottom: 16px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .results-count { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
  .cert-table { width: 100%; border-collapse: collapse; }
  .cert-table th { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; text-align: left; padding: 10px 14px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(10,21,32,0.8); }
  .cert-table td { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #9ab0c4; padding: 12px 14px; border-bottom: 1px solid rgba(30,158,255,0.06); vertical-align: top; word-break: break-all; }
  .cert-table tr:hover td { background: rgba(30,158,255,0.03); }
  .cert-table td:first-child { color: #1e9eff; white-space: nowrap; }
  .issuer-tag { display: inline-block; background: rgba(30,158,255,0.08); border: 1px solid rgba(30,158,255,0.15); padding: 2px 8px; font-size: 10px; color: #5a9abf; margin-top: 2px; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; }
  .loading { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; padding: 40px 0; text-align: center; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .loading { animation: pulse 1.5s infinite; }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .input-row { flex-direction: column; } .cert-table th:nth-child(3), .cert-table td:nth-child(3) { display: none; } }
`;

interface CertRecord {
  id: number;
  name_value: string;
  issuer_name: string;
  not_before: string;
  not_after: string;
}

function parseIssuerCN(issuerStr: string): string {
  const match = issuerStr.match(/CN=([^,]+)/);
  return match ? match[1].trim() : issuerStr.split(',')[0] ?? issuerStr;
}

function formatDate(dateStr: string): string {
  try { return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return dateStr; }
}

function isExpired(dateStr: string): boolean {
  try { return new Date(dateStr) < new Date(); } catch { return false; }
}

export default function SSLInspector() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CertRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setQuery(q); lookup(q); }
  }, []);

  async function lookup(override?: string) {
    const domain = (override ?? query).trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(domain);
    try {
      const res = await fetch(`/api/ssl?domain=${encodeURIComponent(domain)}`);
      if (!res.ok) throw new Error(`crt.sh returned HTTP ${res.status}`);
      const data: CertRecord[] = await res.json();
      // Deduplicate by name_value + issuer, take most recent 50
      const seen = new Set<string>();
      const deduped = data
        .sort((a, b) => new Date(b.not_before).getTime() - new Date(a.not_before).getTime())
        .filter(c => {
          const key = c.name_value + '|' + parseIssuerCN(c.issuer_name);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 50);
      setResults(deduped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lookup failed. Check the domain and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('sslMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="sslMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('sslMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Network</div></div>
            <div className="hero-title">SSL Certificate <span>Inspector</span></div>
            <p className="hero-sub">Every SSL certificate issued for a domain is publicly logged — and that log reveals far more than most expect. Enter any domain to pull its full certificate history: when certs were issued, who issued them, and what additional domains are covered. Used to find hidden subdomains, track infrastructure changes, and verify a site's legitimacy.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="input-row">
            <input
              className="domain-input"
              placeholder="e.g. example.com or %.example.com for wildcard"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button className="lookup-btn" onClick={() => lookup()} disabled={loading}>
              {loading ? 'Searching...' : 'Search Certs →'}
            </button>
          </div>
          <div className="hint">Uses crt.sh Certificate Transparency log search. Prefix with % for wildcard (e.g. %.example.com).</div>

          {error && <div className="error-box">{error}</div>}
          {loading && <div className="loading">Querying certificate transparency logs...</div>}

          {results.length > 0 && (
            <>
              <div className="results-header">
                <div className="results-count">{results.length} certificates found for {searched}</div>
              </div>
              <table className="cert-table">
                <thead>
                  <tr>
                    <th>Domain / SAN</th>
                    <th>Issuer</th>
                    <th>Issued</th>
                    <th>Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(cert => (
                    <tr key={cert.id}>
                      <td>{cert.name_value.split('\n')[0]}</td>
                      <td><span className="issuer-tag">{parseIssuerCN(cert.issuer_name)}</span></td>
                      <td>{formatDate(cert.not_before)}</td>
                      <td style={{ color: isExpired(cert.not_after) ? '#ff4444' : '#22cc66' }}>
                        {formatDate(cert.not_after)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
