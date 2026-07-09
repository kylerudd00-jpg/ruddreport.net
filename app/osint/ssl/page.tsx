'use client';
import { useState, useEffect } from 'react';

const STYLE = `
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #fff; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; }
  .tool-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }
  .input-row { display: flex; gap: 2px; margin-bottom: 8px; }
  .domain-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; padding: 14px 18px; transition: border-color 0.2s; }
  .domain-input:focus { border-color: var(--accent); }
  .domain-input::placeholder { color: var(--text-muted); font-size: 12px; }
  .lookup-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 14px 28px; cursor: pointer; font-weight: 600; white-space: nowrap; transition: all 0.2s; }
  .lookup-btn:hover { background: #4db3ff; }
  .lookup-btn:disabled { opacity: 0.5; cursor: default; }
  .hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 16px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .results-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
  .cert-table { width: 100%; border-collapse: collapse; }
  .cert-table th { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--bg-card); }
  .cert-table td { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; word-break: break-all; }
  .cert-table tr:hover td { background: var(--bg-card-hover); }
  .cert-table td:first-child { color: var(--accent); white-space: nowrap; }
  .issuer-tag { display: inline-block; background: var(--bg-card); border: 1px solid var(--border-bright); padding: 2px 8px; font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
  .error-box { background: rgba(255,77,77,0.06); border: 1px solid rgba(255,77,77,0.3); padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); }
  .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding: 40px 0; text-align: center; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .loading { animation: pulse 1.5s infinite; }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .input-row { flex-direction: column; } .cert-table th:nth-child(3), .cert-table td:nth-child(3) { display: none; } }
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
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Network</div></div>
            <h1 className="hero-title">SSL Certificate <span>Inspector</span></h1>
            <p className="hero-sub">Every SSL certificate issued for a domain is publicly logged — and that log reveals far more than most expect. Enter any domain to pull its full certificate history: when certs were issued, who issued them, and what additional domains are covered. Used to find hidden subdomains, track infrastructure changes, and verify a site's legitimacy.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="input-row">
            <input
              className="domain-input"
              aria-label="Domain to search certificates for"
              placeholder="e.g. example.com or %.example.com for wildcard"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button type="button" className="lookup-btn" onClick={() => lookup()} disabled={loading}>
              {loading ? 'Searching...' : 'Search Certs →'}
            </button>
          </div>
          <div className="hint">Uses crt.sh Certificate Transparency log search. Prefix with % for wildcard (e.g. %.example.com).</div>

          <div aria-live="polite">
          {error && <div className="error-box" role="alert">{error}</div>}
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
      </main>
    </>
  );
}
