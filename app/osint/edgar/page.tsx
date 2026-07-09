'use client';
import { useState } from 'react';

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
  .search-row { display: flex; gap: 2px; margin-bottom: 16px; }
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
  .quick-btn { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); background: var(--bg-secondary); border: 1px solid var(--border-bright); padding: 4px 10px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: var(--accent); border-color: var(--accent); }
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .results-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
  .filing-list { display: flex; flex-direction: column; gap: 2px; }
  .filing-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 24px; display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: start; transition: border-color 0.2s; }
  .filing-card:hover { border-color: var(--border-bright); }
  .form-badge { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 10px; border: 1px solid; text-align: center; min-width: 64px; white-space: nowrap; }
  .filing-body { min-width: 0; }
  .filing-entity { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .filing-desc { font-size: 13px; font-weight: 400; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .filing-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .filing-meta-item { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .filing-meta-item span { color: var(--text-secondary); }
  .filing-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; text-transform: uppercase; white-space: nowrap; padding: 6px 14px; border: 1px solid var(--border-bright); transition: all 0.2s; display: inline-block; align-self: center; }
  .filing-link:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }
  .error-box { background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.3); padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); }
  .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding: 40px 0; text-align: center; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .loading { animation: pulse 1.5s infinite; }
  .empty { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-align: center; padding: 40px 0; border: 1px solid var(--border); }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .filing-card { grid-template-columns: 1fr; gap: 12px; } }
`;

const FORM_TYPES = [
  { label: 'All', value: '' },
  { label: '10-K', value: '10-K' },
  { label: '10-Q', value: '10-Q' },
  { label: '8-K', value: '8-K' },
  { label: 'DEF 14A', value: 'DEF 14A' },
  { label: 'S-1', value: 'S-1' },
  { label: '4 (Insider)', value: '4' },
  { label: 'SC 13G', value: 'SC 13G' },
];

const FORM_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  '10-K':   { bg: 'rgba(30,158,255,0.08)', border: 'rgba(30,158,255,0.3)', color: '#1e9eff' },
  '10-Q':   { bg: 'rgba(30,158,255,0.05)', border: 'rgba(30,158,255,0.2)', color: '#4db3ff' },
  '8-K':    { bg: 'rgba(255,170,0,0.06)',  border: 'rgba(255,170,0,0.25)',  color: '#ffaa00' },
  'DEF 14A':{ bg: 'rgba(34,204,102,0.06)', border: 'rgba(34,204,102,0.25)', color: '#22cc66' },
  'S-1':    { bg: 'rgba(255,100,100,0.06)',border: 'rgba(255,100,100,0.25)',color: '#ff6464' },
  '4':      { bg: 'rgba(180,100,255,0.06)',border: 'rgba(180,100,255,0.25)',color: '#b464ff' },
};

function getFormStyle(form: string) {
  for (const key of Object.keys(FORM_COLORS)) {
    if (form.startsWith(key)) return FORM_COLORS[key];
  }
  return { bg: 'rgba(90,120,150,0.08)', border: 'rgba(90,120,150,0.25)', color: '#5a7a90' };
}

interface FilingHit {
  _id: string;
  _source: {
    period_of_report?: string;
    entity_name?: string;
    file_date?: string;
    form_type?: string;
    file_num?: string;
    biz_location?: string;
    display_names?: string[];
    description?: string;
  };
}

const QUICK = ['Tesla', 'SpaceX', 'Rivian', 'Ford Motor', 'General Motors', 'BYD'];

export default function EDGARSearch() {
  const [query, setQuery] = useState('');
  const [formFilter, setFormFilter] = useState('');
  const [results, setResults] = useState<FilingHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function search(q?: string, form?: string) {
    const qVal = q ?? query;
    const fVal = form ?? formFilter;
    if (!qVal.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(qVal);
    try {
      const params = new URLSearchParams({ q: qVal.trim() });
      if (fVal) params.set('forms', fVal);
      const res = await fetch(`/api/edgar?${params}`);
      if (!res.ok) throw new Error(`EDGAR returned HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const hits: FilingHit[] = data?.hits?.hits ?? [];
      setResults(hits.slice(0, 40));
      setTotal(data?.hits?.total?.value ?? hits.length);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuick(q: string) {
    setQuery(q);
    search(q, formFilter);
  }

  function handleFormFilter(f: string) {
    setFormFilter(f);
    if (searched) search(searched, f);
  }

  return (
    <>
      <style>{STYLE}</style>
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <h1 className="hero-title">SEC EDGAR <span>Filing Search</span></h1>
            <p className="hero-sub">Every public company in the US is legally required to disclose its financials, executive pay, risk factors, and major events to the SEC. Search EDGAR to find those filings — 10-Ks reveal the full financial picture, 8-Ks flag breaking events, and proxy statements expose executive compensation and insider transactions.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-panel">
            <div className="search-row">
              <input
                className="search-input"
                aria-label="Company name or keyword to search SEC EDGAR"
                placeholder='Company name or keyword — e.g. "Tesla" or "supply chain"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button type="button" className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? 'Searching...' : 'Search EDGAR →'}
              </button>
            </div>
            <div className="filter-row">
              <span className="filter-label">Filing Type:</span>
              {FORM_TYPES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  className={`filter-btn${formFilter === f.value ? ' active' : ''}`}
                  onClick={() => handleFormFilter(f.value)}
                >{f.label}</button>
              ))}
            </div>
            <div className="quick-searches">
              {QUICK.map(q => (
                <button key={q} type="button" className="quick-btn" onClick={() => handleQuick(q)}>{q}</button>
              ))}
            </div>
          </div>

          <div aria-live="polite">
          {error && <div className="error-box" role="alert">{error}</div>}
          {loading && <div className="loading">Querying SEC EDGAR...</div>}

          {results.length > 0 && (
            <>
              <div className="results-meta">
                <div className="results-count">Showing {results.length} of {total.toLocaleString()} filings for &ldquo;{searched}&rdquo;</div>
              </div>
              <div className="filing-list">
                {results.map(hit => {
                  const s = hit._source;
                  const form = s.form_type ?? 'N/A';
                  const style = getFormStyle(form);
                  const entityName = s.display_names?.[0]?.replace(/\s*\(CIK.*\)/, '') ?? s.entity_name ?? 'Unknown Entity';
                  const edgarUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${s.file_num ?? ''}&type=${encodeURIComponent(form)}&dateb=&owner=include&count=10`;
                  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${entityName}"`)}&forms=${encodeURIComponent(form)}`;
                  return (
                    <div key={hit._id} className="filing-card">
                      <div className="form-badge" style={{ background: style.bg, borderColor: style.border, color: style.color }}>
                        {form}
                      </div>
                      <div className="filing-body">
                        <div className="filing-entity">{entityName}</div>
                        {s.description && <div className="filing-desc">{s.description}</div>}
                        <div className="filing-meta">
                          <div className="filing-meta-item">Filed: <span>{s.file_date ?? '—'}</span></div>
                          {s.period_of_report && <div className="filing-meta-item">Period: <span>{s.period_of_report}</span></div>}
                          {s.biz_location && <div className="filing-meta-item">Location: <span>{s.biz_location}</span></div>}
                        </div>
                      </div>
                      <a
                        href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(entityName)}&type=${encodeURIComponent(form)}&dateb=&owner=include&count=10&search_text=`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="filing-link"
                      >
                        View →
                      </a>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="empty">No filings found for &ldquo;{searched}&rdquo;</div>
          )}
          </div>
        </div>
      </main>
    </>
  );
}
