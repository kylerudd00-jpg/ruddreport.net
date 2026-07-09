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
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .date-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
        .date-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
        .year-input { background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; padding: 6px 12px; width: 120px; letter-spacing: 0.02em; }
        .year-input::placeholder { color: var(--text-muted); }
        .year-input:focus { border-color: var(--accent); }
        .date-sep { color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; }
        .date-clear { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); background: none; border: none; cursor: pointer; text-transform: uppercase; padding: 0; transition: color 0.2s; }
        .date-clear:hover { color: var(--accent); }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .result-header { margin-bottom: 20px; }
        .result-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .result-meta span { color: var(--accent); }
        .snapshot-table { width: 100%; border-collapse: collapse; }
        .snapshot-table th { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border); background: var(--bg-card); }
        .th-sort { cursor: pointer; user-select: none; transition: color 0.2s; }
        .th-sort:hover { color: var(--accent); }
        .sort-arrow { margin-left: 6px; color: var(--accent); }
        .snapshot-table td { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); padding: 12px 16px; border-bottom: 1px solid var(--border); letter-spacing: 0.02em; }
        .snapshot-table tr:hover td { background: var(--bg-card-hover); }
        .snapshot-link { color: var(--accent); text-decoration: none; letter-spacing: 0.05em; font-size: 12px; border: 1px solid var(--border-bright); padding: 4px 10px; transition: all 0.2s; }
        .snapshot-link:hover { background: var(--bg-card-hover); border-color: var(--accent); }
        .mime-badge { font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); padding: 2px 8px; border: 1px solid var(--border); }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .info-box { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; margin-bottom: 24px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .snapshot-table th, .snapshot-table td { padding: 10px 12px; font-size: 12px; }
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
              <div className="tool-eyebrow-text">Internet Archive</div>
            </div>
            <h1 className="tool-title">Wayback Machine</h1>
            <p className="tool-desc">The internet remembers everything — even content that's been deleted. Enter any URL to pull its full archive history from the Wayback Machine: see what a page said before it was scrubbed, recover deleted articles, and verify what was published and when. Critical for investigations where sources change or erase their story.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="URL to search archives for"
              placeholder="example.com or example.com/page"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <button type="button" className="search-btn" onClick={search} disabled={loading || !url.trim()}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
          <div className="date-row">
            <span className="date-label">Year range:</span>
            <input
              className="year-input"
              aria-label="From date"
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
              aria-label="To date"
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
            <button type="button" className="date-clear" onClick={() => { setFromDate(yearAgoStr); setToDate(todayStr); }}>↺ Reset</button>
            <span className="date-label" style={{marginLeft:4}}>default = last 12 months</span>
          </div>
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </div>
              <div className="loading-text">Querying the Wayback Machine...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}
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
            <div className="footer-copy">© 2026 The Rudd Report</div>

          </div>
        </footer>
      </main>
    </>
  );
}
