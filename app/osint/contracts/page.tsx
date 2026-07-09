'use client';
import { useState, useEffect } from 'react';

const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 1200px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #fff; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; max-width: 700px; }
  .tool-wrap { max-width: 1200px; margin: 0 auto; padding: 40px 40px 80px; }
  .search-panel { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; margin-bottom: 16px; }
  .search-row { display: flex; gap: 2px; margin-bottom: 14px; }
  .search-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; padding: 13px 18px; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-muted); font-size: 12px; }
  .search-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 13px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .search-btn:hover { background: #4db3ff; }
  .search-btn:disabled { opacity: 0.5; cursor: default; }
  .filter-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .filter-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-right: 4px; }
  .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 5px 12px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .filter-btn:hover { border-color: var(--accent); color: var(--text-secondary); }
  .filter-btn.active { background: rgba(30,158,255,0.1); border-color: var(--accent); color: var(--accent); }
  .quick-searches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
  .quick-btn { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 4px 10px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: var(--accent); border-color: var(--accent); }
  .summary-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 16px; }
  .summary-cell { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; }
  .summary-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
  .summary-val { font-family: var(--font-mono); font-size: 18px; color: var(--accent); }
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .results-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
  .contract-list { display: flex; flex-direction: column; gap: 2px; }
  .contract-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 24px; display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: start; transition: border-color 0.2s; }
  .contract-card:hover { border-color: var(--border-bright); }
  .contract-recipient { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 5px; }
  .contract-desc { font-size: 13px; font-weight: 400; color: var(--text-secondary); line-height: 1.5; margin-bottom: 10px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .contract-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .contract-meta-item { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .contract-meta-item span { color: var(--text-secondary); }
  .contract-amount { font-family: var(--font-mono); font-size: 20px; font-weight: 500; color: #22cc66; text-align: right; white-space: nowrap; }
  .contract-type { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; text-align: right; margin-top: 4px; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); }
  .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding: 40px 0; text-align: center; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .empty { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-align: center; padding: 40px 0; border: 1px solid var(--border); }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .contract-card { grid-template-columns: 1fr; } .summary-bar { grid-template-columns: 1fr; } }
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

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setQuery(q); search(q); }
  }, []);

  function handleQuick(q: string) { setQuery(q); search(q, awardTypeIdx); }
  function handleType(idx: number) { setAwardTypeIdx(idx); if (searched) search(searched, idx); }

  return (
    <>
      <style>{STYLE}</style>
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <h1 className="hero-title">Government <span>Contracts Tracker</span></h1>
            <p className="hero-sub">Every dollar the US government spends on contracts is public record. Search by company name to see how much federal money they receive, which agencies award it, and what it's for. Essential for understanding which companies depend on government revenue — and which ones have influence over it.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-panel">
            <div className="search-row">
              <input
                className="search-input"
                aria-label="Company name to search"
                placeholder="Company name — e.g. Tesla, SpaceX, Lockheed Martin"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button type="button" className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? 'Searching...' : 'Search Awards →'}
              </button>
            </div>
            <div className="filter-row">
              <span className="filter-label">Award Type:</span>
              {AWARD_TYPES.map((t, i) => (
                <button type="button" key={t.label} className={`filter-btn${awardTypeIdx === i ? ' active' : ''}`} onClick={() => handleType(i)}>{t.label}</button>
              ))}
            </div>
            <div className="quick-searches">
              {QUICK.map(q => <button type="button" key={q} className="quick-btn" onClick={() => handleQuick(q)}>{q}</button>)}
            </div>
          </div>

          <div aria-live="polite">
            {error && <div className="error-box" role="alert">{error}</div>}
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
      </main>
    </>
  );
}
