'use client';
import { useState } from 'react';

type Hop = { url: string; status: number; kind: 'redirect' | 'final' | 'error' };

function statusColor(s: number) {
  if (s >= 200 && s < 300) return '#1e9eff';
  if (s >= 300 && s < 400) return '#ffaa00';
  if (s >= 400) return '#ff3a3a';
  return '#3d5870';
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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #ff3a3a; padding: 20px 0; }
        .summary-banner { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); border-top: 2px solid #1e9eff; padding: 20px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .summary-stat { display: flex; flex-direction: column; gap: 4px; }
        .summary-stat-val { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: #c0cfe0; }
        .summary-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .final-url { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #1e9eff; word-break: break-all; }
        .hop-list { display: flex; flex-direction: column; gap: 2px; }
        .hop-row { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 16px 20px; display: grid; grid-template-columns: 28px 64px 1fr; gap: 16px; align-items: center; }
        .hop-row.final-hop { border-color: rgba(30,158,255,0.2); }
        .hop-index { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; color: #3d5870; }
        .hop-code { font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 700; }
        .hop-info { display: flex; flex-direction: column; gap: 4px; }
        .hop-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .hop-url { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; word-break: break-all; }
        .loading { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; animation: pulse 1s infinite; padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
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
          <div className="hamburger" onClick={() => document.getElementById('urlMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="urlMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('urlMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">// OSINT Hub — Link Intelligence</div>
            </div>
            <div className="tool-title">URL Redirect Tracer</div>
            <p className="tool-desc">Trace the complete redirect chain of any URL — shortened links, tracking redirects, affiliate hops, and obfuscated destinations. See every step between the link you clicked and where you actually end up.</p>
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
          {loading && <div className="loading">// Following redirect chain...</div>}
          {error && <div className="error-msg">// Error: {error}</div>}

          {done && hops.length > 0 && (
            <>
              <div className="summary-banner">
                <div className="summary-stat">
                  <div className="summary-stat-val">{hops.length}</div>
                  <div className="summary-stat-label">// Total Hops</div>
                </div>
                <div className="summary-stat">
                  <div className="summary-stat-val">{hops.filter(h => h.kind === 'redirect').length}</div>
                  <div className="summary-stat-label">// Redirects</div>
                </div>
                <div className="summary-stat" style={{flex: 1}}>
                  <div className="summary-stat-label" style={{marginBottom: 6}}>// Final Destination</div>
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
                      <div className="hop-label">{statusLabel(hop.status)} {hop.kind === 'final' ? '// destination' : hop.kind === 'redirect' ? '// redirect' : '// error'}</div>
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
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}
