'use client';
import { useState } from 'react';

type Hop = { url: string; status: number; kind: 'redirect' | 'final' | 'error' };

function statusColor(s: number) {
  if (s >= 200 && s < 300) return '#1e9eff';
  if (s >= 300 && s < 400) return '#ffaa00';
  if (s >= 400) return '#ff3a3a';
  return '#5a7a94';
}

function statusLabel(s: number) {
  const labels: Record<number, string> = {
    200: 'OK', 301: 'Moved Permanently', 302: 'Found', 303: 'See Other',
    307: 'Temporary Redirect', 308: 'Permanent Redirect', 400: 'Bad Request',
    401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 410: 'Gone',
    429: 'Too Many Requests', 500: 'Server Error', 503: 'Unavailable',
  };
  return labels[s] || (s === 0 ? 'Connection Error' : `HTTP ${s}`);
}

export default function UrlTracer() {
  const [url, setUrl] = useState('');
  const [hops, setHops] = useState<Hop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const trace = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setHops([]);
    setDone(false);
    try {
      const res = await fetch(`/api/osint/url?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else { setHops(data.hops || []); }
      setDone(true);
    } catch {
      setError('Request failed. Check the URL and try again.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const final = hops[hops.length - 1];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card-hover); color: var(--text-muted); cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 20px 0; }
        .summary-banner { background: var(--bg-card); border: 1px solid var(--border); border-top: 2px solid var(--accent); padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .summary-stat { display: flex; flex-direction: column; gap: 4px; }
        .summary-stat-val { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); }
        .summary-stat-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .final-url { font-family: var(--font-mono); font-size: 12px; color: var(--accent); word-break: break-all; }
        .hop-list { display: flex; flex-direction: column; gap: 2px; }
        .hop-row { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; display: grid; grid-template-columns: 28px 64px 1fr; gap: 16px; align-items: center; }
        .hop-row.final-hop { border-color: var(--border-bright); }
        .hop-index { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--text-muted); }
        .hop-code { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
        .hop-info { display: flex; flex-direction: column; gap: 4px; }
        .hop-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .hop-url { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); word-break: break-all; }
        .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); animation: pulse 1s infinite; padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results-wrap { padding: 0 20px 60px; }
          .summary-banner { flex-direction: column; align-items: flex-start; gap: 16px; }
          .hop-row { grid-template-columns: 28px 1fr; }
          .hop-code { display: none; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Link Intelligence</div>
            </div>
            <h1 className="tool-title">URL Redirect Tracer</h1>
            <p className="tool-desc">Shortened links, affiliate redirects, and phishing URLs all hide where they actually send you. Paste any URL here to trace every redirect step before you click — revealing the final destination and every server your traffic passes through along the way.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter a URL to trace — e.g. https://bit.ly/3example"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && trace()}
            />
            <button className="search-btn" onClick={trace} disabled={loading}>
              {loading ? 'Tracing...' : 'Trace →'}
            </button>
          </div>
        </div>

        <div className="results-wrap">
          {loading && <div className="loading">Following redirect chain...</div>}
          {error && <div className="error-msg">Error: {error}</div>}

          {done && hops.length > 0 && (
            <>
              <div className="summary-banner">
                <div className="summary-stat">
                  <div className="summary-stat-val">{hops.length}</div>
                  <div className="summary-stat-label">Total Hops</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-val">{hops.filter(h => h.kind === 'redirect').length}</div>
                  <div className="summary-stat-label">Redirects</div>
                </div>
                <div className="summary-stat" style={{flex: 1}}>
                  <div className="summary-stat-label" style={{marginBottom: 6}}>Final Destination</div>
                  <div className="final-url">{final?.url}</div>
                </div>
              </div>

              <div className="hop-list">
                {hops.map((hop, i) => (
                  <div key={i} className={`hop-row ${hop.kind === 'final' ? 'final-hop' : ''}`}>
                    <div className="hop-index">{String(i + 1).padStart(2, '0')}</div>
                    <div className="hop-code" style={{color: statusColor(hop.status)}}>
                      {hop.status || '—'}
                    </div>
                    <div className="hop-info">
                      <div className="hop-label">{statusLabel(hop.status)} {hop.kind === 'final' ? 'destination' : hop.kind === 'redirect' ? 'redirect' : 'error'}</div>
                      <div className="hop-url">{hop.url}</div>
                    </div>
                  </div>
                ))}
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
