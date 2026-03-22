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
  .search-input::placeholder { color: #3d5870; font-size: 12px; }
  .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 13px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .search-btn:hover { background: #4db3ff; }
  .search-btn:disabled { opacity: 0.5; cursor: default; }
  .mode-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
  .mode-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-right: 4px; }
  .mode-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border: 1px solid rgba(30,158,255,0.15); background: transparent; color: #5a7a90; cursor: pointer; transition: all 0.2s; }
  .mode-btn:hover { border-color: rgba(30,158,255,0.4); color: #9ab0c4; }
  .mode-btn.active { background: rgba(30,158,255,0.1); border-color: rgba(30,158,255,0.4); color: #1e9eff; }
  .quick-searches { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .quick-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d5870; background: rgba(3,6,8,0.5); border: 1px solid rgba(30,158,255,0.08); padding: 4px 10px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.25); }
  .results-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .results-count { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
  .patent-list { display: flex; flex-direction: column; gap: 2px; }
  .patent-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 22px 26px; transition: border-color 0.2s; }
  .patent-card:hover { border-color: rgba(30,158,255,0.25); }
  .patent-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 8px; }
  .patent-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #c0cfe0; line-height: 1.3; }
  .patent-num { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #1e9eff; white-space: nowrap; padding: 3px 10px; border: 1px solid rgba(30,158,255,0.2); background: rgba(30,158,255,0.06); }
  .patent-abstract { font-size: 13px; font-weight: 400; color: #7a9bb5; line-height: 1.6; margin-bottom: 12px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
  .patent-meta { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
  .patent-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #3d5870; }
  .patent-meta-item span { color: #5a7a90; }
  .patent-link { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: #1e9eff; text-decoration: none; text-transform: uppercase; padding: 3px 10px; border: 1px solid rgba(30,158,255,0.15); transition: all 0.2s; margin-left: auto; }
  .patent-link:hover { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.4); }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; }
  .loading { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; padding: 40px 0; text-align: center; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .empty { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: #3d5870; text-align: center; padding: 40px 0; border: 1px solid rgba(30,158,255,0.08); }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .patent-header { flex-direction: column; } }
`;

type SearchMode = 'assignee' | 'keyword';

interface Patent {
  patent_id: string;
  patent_title: string;
  patent_date: string;
  patent_abstract: string;
  assignees: { assignee_organization: string }[];
  inventors: { inventor_last_name: string; inventor_first_name: string }[];
}

const ASSIGNEE_QUICK = ['Tesla', 'Ford Global Technologies', 'General Motors', 'Rivian', 'BYD', 'Waymo'];
const KEYWORD_QUICK = ['battery management system', 'autopilot neural network', 'electric motor cooling', 'solid state battery', 'autonomous vehicle'];

export default function PatentIntelligence() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('assignee');
  const [results, setResults] = useState<Patent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function search(q?: string, m?: SearchMode) {
    const qVal = q ?? query;
    const mVal = m ?? mode;
    if (!qVal.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(qVal);
    try {
      const queryObj = mVal === 'assignee'
        ? { '_contains': { 'assignee_organization': qVal.trim() } }
        : { '_text_phrase': { 'patent_abstract': qVal.trim() } };

      const fields = ['patent_id', 'patent_title', 'patent_date', 'patent_abstract', 'assignee_organization', 'inventor_last_name', 'inventor_first_name'];
      const options = { sort: [{ patent_date: 'desc' }], per_page: 25, page: 1 };

      const url = `https://api.patentsview.org/patents/query?q=${encodeURIComponent(JSON.stringify(queryObj))}&f=${encodeURIComponent(JSON.stringify(fields))}&o=${encodeURIComponent(JSON.stringify(options))}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`PatentsView returned HTTP ${res.status}`);
      const data = await res.json();
      setResults(data?.patents ?? []);
      setTotal(data?.total_patent_count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  const quickList = mode === 'assignee' ? ASSIGNEE_QUICK : KEYWORD_QUICK;

  function handleQuick(q: string) { setQuery(q); search(q, mode); }
  function handleMode(m: SearchMode) { setMode(m); setResults([]); setSearched(''); setError(''); }

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
          <div className="hamburger" onClick={() => document.getElementById('patentMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="patentMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('patentMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <div className="hero-title">Patent <span>Intelligence</span></div>
            <p className="hero-sub">Search USPTO patents by company assignee or technology keyword. Track what competitors are inventing, identify emerging R&D focus areas, and monitor IP activity across any industry via PatentsView.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-panel">
            <div className="mode-row">
              <span className="mode-label">Search by:</span>
              <button className={`mode-btn${mode === 'assignee' ? ' active' : ''}`} onClick={() => handleMode('assignee')}>Company / Assignee</button>
              <button className={`mode-btn${mode === 'keyword' ? ' active' : ''}`} onClick={() => handleMode('keyword')}>Technology Keyword</button>
            </div>
            <div className="search-row">
              <input
                className="search-input"
                placeholder={mode === 'assignee' ? 'Company name — e.g. Tesla, Ford Global Technologies' : 'Technology keyword — e.g. battery management system'}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button className="search-btn" onClick={() => search()} disabled={loading}>
                {loading ? 'Searching...' : 'Search Patents →'}
              </button>
            </div>
            <div className="quick-searches">
              {quickList.map(q => <button key={q} className="quick-btn" onClick={() => handleQuick(q)}>{q}</button>)}
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
          {loading && <div className="loading">Querying USPTO PatentsView...</div>}

          {results.length > 0 && (
            <>
              <div className="results-meta">
                <div className="results-count">
                  {results.length} of {total.toLocaleString()} patents · {mode === 'assignee' ? 'assignee' : 'keyword'}: &ldquo;{searched}&rdquo;
                </div>
              </div>
              <div className="patent-list">
                {results.map(p => {
                  const assignee = p.assignees?.[0]?.assignee_organization ?? 'Unknown Assignee';
                  const inventors = p.inventors?.slice(0, 3).map(i => `${i.inventor_first_name} ${i.inventor_last_name}`).join(', ') ?? '';
                  return (
                    <div key={p.patent_id} className="patent-card">
                      <div className="patent-header">
                        <div className="patent-title">{p.patent_title}</div>
                        <div className="patent-num">US {p.patent_id}</div>
                      </div>
                      {p.patent_abstract && <div className="patent-abstract">{p.patent_abstract}</div>}
                      <div className="patent-meta">
                        <div className="patent-meta-item">Assignee: <span>{assignee}</span></div>
                        <div className="patent-meta-item">Granted: <span>{p.patent_date}</span></div>
                        {inventors && <div className="patent-meta-item">Inventors: <span>{inventors}</span></div>}
                        <a
                          href={`https://patents.google.com/patent/US${p.patent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="patent-link"
                        >View on Google Patents →</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="empty">No patents found for &ldquo;{searched}&rdquo;</div>
          )}
        </div>
      </div>
    </>
  );
}
