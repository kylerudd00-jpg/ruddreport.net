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
  .search-row { display: flex; gap: 2px; margin-bottom: 16px; }
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
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .results-count { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
  .filing-list { display: flex; flex-direction: column; gap: 2px; }
  .filing-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 20px 24px; display: grid; grid-template-columns: auto 1fr auto; gap: 20px; align-items: start; transition: border-color 0.2s; }
  .filing-card:hover { border-color: rgba(30,158,255,0.3); }
  .form-badge { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 4px 10px; border: 1px solid; text-align: center; min-width: 64px; white-space: nowrap; }
  .filing-body { min-width: 0; }
  .filing-entity { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #c0cfe0; margin-bottom: 4px; }
  .filing-desc { font-size: 13px; font-weight: 400; color: #7a9bb5; line-height: 1.5; margin-bottom: 8px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .filing-meta { display: flex; gap: 16px; flex-wrap: wrap; }
  .filing-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #5a7a94; }
  .filing-meta-item span { color: #5a7a90; }
  .filing-link { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: #1e9eff; text-decoration: none; text-transform: uppercase; white-space: nowrap; padding: 6px 14px; border: 1px solid rgba(30,158,255,0.2); transition: all 0.2s; display: inline-block; align-self: center; }
  .filing-link:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; }
  .loading { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; padding: 40px 0; text-align: center; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .loading { animation: pulse 1.5s infinite; }
  .empty { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: #5a7a94; text-align: center; padding: 40px 0; border: 1px solid rgba(30,158,255,0.08); }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .filing-card { grid-template-columns: 1fr; gap: 12px; } }
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
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('edgarMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="edgarMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('edgarMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <div className="hero-title">SEC EDGAR <span>Filing Search</span></div>
            <p className="hero-sub">Every public company in the US is legally required to disclose its financials, executive pay, risk factors, and major events to the SEC. Search EDGAR to find those filings — 10-Ks reveal the full financial picture, 8-Ks flag breaking events, and proxy statements expose executive compensation and insider transactions.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-panel">
            <div className="search-row">
              <input
                className="search-input"
                placeholder='Company name or keyword — e.g. "Tesla" or "supply chain"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? 'Searching...' : 'Search EDGAR →'}
              </button>
            </div>
            <div className="filter-row">
              <span className="filter-label">Filing Type:</span>
              {FORM_TYPES.map(f => (
                <button
                  key={f.value}
                  className={`filter-btn${formFilter === f.value ? ' active' : ''}`}
                  onClick={() => handleFormFilter(f.value)}
                >{f.label}</button>
              ))}
            </div>
            <div className="quick-searches">
              {QUICK.map(q => (
                <button key={q} className="quick-btn" onClick={() => handleQuick(q)}>{q}</button>
              ))}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
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
    </>
  );
}
