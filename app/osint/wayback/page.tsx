'use client';
import { useState } from 'react';

interface Snapshot {
  timestamp: string;
  statuscode: string;
  mimetype: string;
  url: string;
}

export default function WaybackMachine() {
  const [url, setUrl] = useState('');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${pad(now.getMonth()+1)}/${pad(now.getDate())}/${now.getFullYear()}`;
  const yearAgoStr = `${pad(now.getMonth()+1)}/${pad(now.getDate())}/${now.getFullYear()-1}`;
  const [fromDate, setFromDate] = useState(yearAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  const search = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setSnapshots([]);
    const clean = url.trim().replace(/^https?:\/\//, '');
    setTargetUrl(clean);
    try {
      const params = new URLSearchParams({ url: clean });
      if (fromDate) params.set('from', fromDate);
      if (toDate)   params.set('to',   toDate);
      const res = await fetch(`/api/osint/wayback?${params.toString()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      const raw = json.data;
      if (!Array.isArray(raw) || raw.length < 2) {
        setError('No archived snapshots found for this URL.');
        setLoading(false);
        return;
      }
      const [, ...rows] = raw;
      const parsed: Snapshot[] = rows.map((r: string[]) => ({
        timestamp: r[0],
        statuscode: r[1],
        mimetype: r[2],
        url: clean,
      }));
      setSnapshots(parsed);
    } catch (e: any) {
      setError('' + (e.message || 'Failed to query the Wayback Machine.'));
    }
    setLoading(false);
  };

  const formatTs = (ts: string) => {
    const y = ts.slice(0,4), mo = ts.slice(4,6), d = ts.slice(6,8);
    const h = ts.slice(8,10), mi = ts.slice(10,12);
    return `${y}-${mo}-${d} ${h}:${mi} UTC`;
  };

  const archiveUrl = (ts: string) => `https://web.archive.org/web/${ts}/${targetUrl}`;
  const displayed = sortDir === 'desc' ? snapshots : [...snapshots].reverse();

  const statusColor = (code: string) => {
    if (code.startsWith('2')) return '#1e9eff';
    if (code.startsWith('3')) return '#ffaa00';
    if (code.startsWith('4')) return '#ff3a3a';
    return '#7a9bb5';
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
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
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
        .search-input::placeholder { color: #5a7a94; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #33ffaa; }
        .search-btn:disabled { background: #0d3322; color: #5a7a94; cursor: not-allowed; }
        .date-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .date-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
        .year-input { background: rgba(10,21,32,0.8); border: 1px solid rgba(30,158,255,0.2); color: #c0cfe0; font-family: 'IBM Plex Mono', monospace; font-size: 12px; padding: 6px 12px; width: 120px; outline: none; letter-spacing: 1px; }
        .year-input::placeholder { color: #5a7a94; }
        .year-input:focus { border-color: rgba(30,158,255,0.5); }
        .date-sep { color: #5a7a94; font-family: 'IBM Plex Mono', monospace; font-size: 11px; }
        .date-clear { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; background: none; border: none; cursor: pointer; text-transform: uppercase; padding: 0; transition: color 0.2s; }
        .date-clear:hover { color: #1e9eff; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .result-header { margin-bottom: 20px; }
        .result-meta { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .result-meta span { color: #1e9eff; }
        .snapshot-table { width: 100%; border-collapse: collapse; }
        .snapshot-table th { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(30,158,255,0.12); background: rgba(30,158,255,0.03); }
        .th-sort { cursor: pointer; user-select: none; transition: color 0.2s; }
        .th-sort:hover { color: #1e9eff; }
        .sort-arrow { margin-left: 6px; color: #1e9eff; }
        .snapshot-table td { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; padding: 12px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); letter-spacing: 0.5px; }
        .snapshot-table tr:hover td { background: rgba(30,158,255,0.03); }
        .snapshot-link { color: #1e9eff; text-decoration: none; letter-spacing: 2px; font-size: 9px; border: 1px solid rgba(30,158,255,0.3); padding: 4px 10px; transition: all 0.2s; }
        .snapshot-link:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .mime-badge { font-size: 9px; letter-spacing: 1px; color: #5a7a94; padding: 2px 8px; border: 1px solid rgba(30,158,255,0.1); }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .info-box { background: rgba(30,158,255,0.04); border: 1px solid rgba(30,158,255,0.15); padding: 16px 20px; margin-bottom: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; line-height: 1.8; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
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
          .snapshot-table th, .snapshot-table td { padding: 10px 12px; font-size: 10px; }
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
          <div className="hamburger" onClick={() => document.getElementById('waybackMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="waybackMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('waybackMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">Internet Archive</div>
            </div>
            <div className="tool-title">Wayback Machine</div>
            <p className="tool-desc">The internet remembers everything — even content that's been deleted. Enter any URL to pull its full archive history from the Wayback Machine: see what a page said before it was scrubbed, recover deleted articles, and verify what was published and when. Critical for investigations where sources change or erase their story.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="example.com or example.com/page"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button className="search-btn" onClick={search} disabled={loading || !url.trim()}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
          <div className="date-row">
            <span className="date-label">Year range:</span>
            <input
              className="year-input"
              placeholder="mm/dd/yyyy"
              value={fromDate}
              maxLength={10}
              onChange={e => {
                let v = e.target.value.replace(/[^\d/]/g, '');
                if (v.length === 2 && !v.includes('/')) v += '/';
                if (v.length === 5 && v.split('/').length === 2) v += '/';
                setFromDate(v.slice(0, 10));
              }}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <span className="date-sep">—</span>
            <input
              className="year-input"
              placeholder="mm/dd/yyyy"
              value={toDate}
              maxLength={10}
              onChange={e => {
                let v = e.target.value.replace(/[^\d/]/g, '');
                if (v.length === 2 && !v.includes('/')) v += '/';
                if (v.length === 5 && v.split('/').length === 2) v += '/';
                setToDate(v.slice(0, 10));
              }}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button className="date-clear" onClick={() => { setFromDate(yearAgoStr); setToDate(todayStr); }}>↺ Reset</button>
            <span className="date-label" style={{marginLeft:4}}>default = last 12 months</span>
          </div>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars">
                <span /><span /><span /><span /><span />
              </div>
              <div className="loading-text">Querying the Wayback Machine...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}
          {snapshots.length > 0 && (
            <>
              <div className="info-box">
                Data from the Internet Archive Wayback Machine &nbsp;|&nbsp; Showing up to 50 most recent unique snapshots &nbsp;|&nbsp; Click "View Snapshot" to see the archived version
              </div>
              <div className="result-header">
                <div className="result-meta">
                  <span>{snapshots.length}</span> snapshots found for <span>{targetUrl}</span>
                </div>
              </div>
              <div className="table-scroll">
              <table className="snapshot-table">
                <thead>
                  <tr>
                    <th className="th-sort" onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
                      Captured<span className="sort-arrow">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    </th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Archive</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((s, i) => (
                    <tr key={i}>
                      <td>{formatTs(s.timestamp)}</td>
                      <td style={{color: statusColor(s.statuscode)}}>{s.statuscode}</td>
                      <td><span className="mime-badge">{s.mimetype.split(';')[0]}</span></td>
                      <td>
                        <a href={archiveUrl(s.timestamp)} target="_blank" rel="noopener noreferrer" className="snapshot-link">
                          View Snapshot →
                        </a>
                      </td>
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
