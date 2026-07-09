'use client';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setDomain(q); scan(q); }
  }, []);

  const scan = async (override?: string) => {
    const target = (override ?? domain).trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/osint/subdomains?domain=${encodeURIComponent(target)}`);
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .results-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .results-meta span { color: #1e9eff; }
        .results-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .filter-box { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 10px 14px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.05em; width: 240px; }
        .filter-box::placeholder { color: var(--text-muted); }
        .copy-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 10px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; white-space: nowrap; }
        .copy-btn:hover { color: #1e9eff; border-color: var(--border-bright); }
        .copy-btn.copied { color: #1e9eff; border-color: #1e9eff; }
        .subdomain-table { width: 100%; border-collapse: collapse; }
        .subdomain-table th { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); background: rgba(30,158,255,0.03); }
        .subdomain-table td { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); padding: 10px 16px; border-bottom: 1px solid var(--border); letter-spacing: 0.03em; word-break: break-all; }
        .subdomain-table tr:hover td { background: rgba(30,158,255,0.03); }
        .subdomain-name { color: #1e9eff; }
        .subdomain-wildcard { color: #ffaa00; }
        .date-cell { color: var(--text-muted); font-size: 12px; white-space: nowrap; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .info-box { background: rgba(30,158,255,0.04); border: 1px solid var(--border); padding: 16px 20px; margin-bottom: 24px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: #1e9eff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .results-header { flex-direction: column; align-items: flex-start; }
          .results-actions { width: 100%; flex-direction: column; }
          .filter-box { width: 100%; }
          .copy-btn { width: 100%; text-align: center; }
          .subdomain-table th, .subdomain-table td { padding: 8px 10px; font-size: 12px; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Certificate Transparency</div>
            </div>
            <h1 className="tool-title">Subdomain Scanner</h1>
            <p className="tool-desc">Companies often leave staging servers, internal tools, and admin panels exposed on subdomains they've forgotten about. This tool searches SSL certificate logs to find every subdomain that has ever existed for a domain — including dev environments, APIs, and forgotten infrastructure that may still be accessible.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Domain to scan for subdomains"
              placeholder="example.com"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
            />
            <button type="button" className="search-btn" onClick={() => scan()} disabled={loading || !domain.trim()}>
              {loading ? 'Scanning...' : 'Scan →'}
            </button>
          </div>
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars">
                <span /><span /><span /><span /><span />
              </div>
              <div className="loading-text">Querying certificate transparency logs...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}
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
                    aria-label="Filter subdomain results"
                    placeholder="filter results..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                  <button type="button" className={`copy-btn${copied ? ' copied' : ''}`} onClick={copyAll}>
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
                      <td style={{color:'var(--text-muted)', fontSize:'12px'}}>{s.issuer.replace(/^.*CN=/, '').split(',')[0] || '—'}</td>
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
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
