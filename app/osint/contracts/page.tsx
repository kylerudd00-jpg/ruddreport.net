'use client';
import { useState } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
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
  .hero-inner { max-width: 1200px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; max-width: 700px; }
  .tool-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 40px 80px; }
  .search-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 28px; margin-bottom: 16px; }
  .search-row { display: flex; gap: 2px; margin-bottom: 14px; }
  .search-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 14px; padding: 13px 18px; outline: none; transition: border-color 0.2s; }
  .search-input:focus { border-color: rgba(30,158,255,0.5); }
  .search-input::placeholder { color: #5a7a94; font-size: 12px; }
  .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 13px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .search-btn:hover { background: #4db3ff; }
  .search-btn:disabled { opacity: 0.5; cursor: default; }
  .filter-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .filter-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-right: 4px; }
  .filter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 12px; border: 1px solid rgba(30,158,255,0.15); background: transparent; color: #5a7a90; cursor: pointer; transition: all 0.2s; }
  .filter-btn:hover { border-color: rgba(30,158,255,0.4); color: #9ab0c4; }
  .filter-btn.active { background: rgba(30,158,255,0.1); border-color: rgba(30,158,255,0.4); color: #1e9eff; }
  .quick-searches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .quick-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #5a7a94; background: rgba(3,6,8,0.5); border: 1px solid rgba(30,158,255,0.08); padding: 4px 10px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.25); }
  .summary-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 16px; }
  .summary-cell { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 16px 20px; }
  .summary-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 6px; }
  .summary-val { font-family: 'IBM Plex Mono', monospace; font-size: 18px; color: #1e9eff; }
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .results-count { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
  .contract-list { display: flex; flex-direction: column; gap: 2px; }
  .contract-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 20px 24px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: start; transition: border-color 0.2s; }
  .contract-card:hover { border-color: rgba(30,158,255,0.25); }
  .contract-recipient { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #c0cfe0; margin-bottom: 5px; }
  .contract-desc { font-size: 13px; font-weight: 400; color: #7a9bb5; line-height: 1.5; margin-bottom: 10px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .contract-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .contract-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #5a7a94; }
  .contract-meta-item span { color: #5a7a90; }
  .contract-amount { font-family: 'IBM Plex Mono', monospace; font-size: 20px; font-weight: 500; color: #22cc66; text-align: right; white-space: nowrap; }
  .contract-type { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: #5a7a94; text-transform: uppercase; text-align: right; margin-top: 4px; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; }
  .loading { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; padding: 40px 0; text-align: center; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .empty { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: #5a7a94; text-align: center; padding: 40px 0; border: 1px solid rgba(30,158,255,0.08); }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .contract-card { grid-template-columns: 1fr; } .summary-bar { grid-template-columns: 1fr; } }
`;

const AWARD_TYPES = [
  { label: 'All', tab: 'all' },
  { label: 'Contracts', tab: 'contracts' },
  { label: 'Grants', tab: 'grants' },
];

const QUICK = ['Tesla', 'SpaceX', 'Rivian', 'Lockheed Martin', 'General Motors', 'Northrop Grumman'];

function fmtMoney(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

interface Award {
  'Award ID': string;
  'Recipient Name': string;
  'Award Amount': number;
  'Awarding Agency': string;
  'Award Type': string;
  'Start Date': string;
  'Description': string;
}

export default function ContractsTracker() {
  const [query, setQuery] = useState('');
  const [awardTypeIdx, setAwardTypeIdx] = useState(0);
  const [results, setResults] = useState<Award[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function search(q?: string, typeIdx?: number) {
    const qVal = q ?? query;
    const tIdx = typeIdx ?? awardTypeIdx;
    if (!qVal.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setTotalAmount(0);
    setTotalCount(0);
    setSearched(qVal);
    try {
      const res = await fetch(`/api/contracts?q=${encodeURIComponent(qVal.trim())}&tab=${AWARD_TYPES[tIdx].tab}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const awards: Award[] = data.results ?? [];
      setResults(awards);
      setTotalCount(data.total ?? awards.length);
      const sum = awards.reduce((acc, a) => acc + (a['Award Amount'] ?? 0), 0);
      setTotalAmount(sum);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuick(q: string) { setQuery(q); search(q, awardTypeIdx); }
  function handleType(idx: number) { setAwardTypeIdx(idx); if (searched) search(searched, idx); }

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
          <div className="hamburger" onClick={() => document.getElementById('contractMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="contractMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('contractMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <div className="hero-title">Government <span>Contracts Tracker</span></div>
            <p className="hero-sub">Every dollar the US government spends on contracts is public record. Search by company name to see how much federal money they receive, which agencies award it, and what it's for. Essential for understanding which companies depend on government revenue — and which ones have influence over it.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-panel">
            <div className="search-row">
              <input
                className="search-input"
                placeholder="Company name — e.g. Tesla, SpaceX, Lockheed Martin"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? 'Searching...' : 'Search Awards →'}
              </button>
            </div>
            <div className="filter-row">
              <span className="filter-label">Award Type:</span>
              {AWARD_TYPES.map((t, i) => (
                <button key={t.label} className={`filter-btn${awardTypeIdx === i ? ' active' : ''}`} onClick={() => handleType(i)}>{t.label}</button>
              ))}
            </div>
            <div className="quick-searches">
              {QUICK.map(q => <button key={q} className="quick-btn" onClick={() => handleQuick(q)}>{q}</button>)}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
          {loading && <div className="loading">Querying USASpending.gov...</div>}

          {results.length > 0 && (
            <>
              <div className="summary-bar">
                <div className="summary-cell">
                  <div className="summary-label">Total Awards Shown</div>
                  <div className="summary-val">{results.length} / {totalCount.toLocaleString()}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-label">Combined Value (shown)</div>
                  <div className="summary-val">{fmtMoney(totalAmount)}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-label">Largest Single Award</div>
                  <div className="summary-val">{results[0] ? fmtMoney(results[0]['Award Amount']) : '—'}</div>
                </div>
              </div>
              <div className="results-meta">
                <div className="results-count">Top awards for &ldquo;{searched}&rdquo; · sorted by value</div>
              </div>
              <div className="contract-list">
                {results.map((a, i) => (
                  <div key={a['Award ID'] ?? i} className="contract-card">
                    <div>
                      <div className="contract-recipient">{a['Recipient Name'] ?? 'Unknown Recipient'}</div>
                      {a['Description'] && <div className="contract-desc">{a['Description']}</div>}
                      <div className="contract-meta">
                        <div className="contract-meta-item">Agency: <span>{a['Awarding Agency'] ?? '—'}</span></div>
                        {a['Start Date'] && <div className="contract-meta-item">Start: <span>{a['Start Date']}</span></div>}
                        {a['Award ID'] && <div className="contract-meta-item">ID: <span>{a['Award ID']}</span></div>}
                      </div>
                    </div>
                    <div>
                      <div className="contract-amount">{fmtMoney(a['Award Amount'] ?? 0)}</div>
                      <div className="contract-type">{a['Award Type'] ?? ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="empty">No federal awards found for &ldquo;{searched}&rdquo;</div>
          )}
        </div>
      </div>
    </>
  );
}
