'use client';

import { useState, useEffect, useMemo } from 'react';

type SdnResult = {
  entNum: string;
  name: string;
  type: 'Individual' | 'Entity' | 'Vessel' | 'Aircraft';
  programs: string[];
  title: string;
  remarks: string;
  akas: string[];
};

const OFFICIAL_SOURCES = [
  { label: 'OFAC SDN List Search',        url: 'https://sanctionssearch.ofac.treas.gov/', desc: 'US Treasury' },
  { label: 'BIS Entity List',             url: 'https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list', desc: 'Commerce Dept' },
  { label: 'UN Security Council Sanctions', url: 'https://www.un.org/securitycouncil/sanctions/information', desc: 'United Nations' },
  { label: 'EU Sanctions Map',            url: 'https://www.sanctionsmap.eu/', desc: 'European Union' },
  { label: 'UK OFSI Sanctions',           url: 'https://www.gov.uk/government/publications/financial-sanctions-targets', desc: 'UK Govt' },
  { label: 'OpenSanctions Search',        url: 'https://www.opensanctions.org/search/', desc: 'Open-source DB' },
];

type FilterType = 'All' | 'Individual' | 'Entity' | 'Vessel' | 'Aircraft';
const FILTERS: FilterType[] = ['All', 'Individual', 'Entity', 'Vessel', 'Aircraft'];
const FILTER_LABEL: Record<FilterType, string> = {
  All: 'All', Individual: 'Individuals', Entity: 'Entities', Vessel: 'Vessels', Aircraft: 'Aircraft',
};

export default function SanctionsScreener() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SdnResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const runSearch = async (val: string) => {
    const q = val.trim();
    if (q.length < 2) { setError('Enter at least 2 characters'); return; }
    setLoading(true);
    setError('');
    setActiveFilter('All');
    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || 'Lookup failed'); setResults([]); }
      else { setResults(data.results || []); }
      setSearched(true);
    } catch {
      setError('Request failed. Please try again.');
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };
  const search = () => runSearch(query);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setQuery(q); runSearch(q); }
  }, []);

  const filtered = useMemo(
    () => (activeFilter === 'All' ? results : results.filter((r) => r.type === activeFilter)),
    [results, activeFilter],
  );

  const filterCount = (f: FilterType) =>
    f === 'All' ? results.length : results.filter((r) => r.type === f).length;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }

        /* ── Hero ── */
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--red); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--red); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 56px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; line-height: 1; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 700px; }

        /* ── Main content ── */
        .content-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }

        /* ── Search ── */
        .search-section { margin-bottom: 28px; }
        .search-box { display: flex; border: 1px solid rgba(255,77,77,0.3); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.02em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--red); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: opacity 0.2s; white-space: nowrap; }
        .search-btn:hover { opacity: 0.85; }
        .search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .search-hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 10px; }

        /* ── Filters ── */
        .filters-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 7px 16px; border: 1px solid var(--border-bright); background: none; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { color: var(--accent); }
        .filter-btn.active { background: rgba(255,77,77,0.1); border-color: rgba(255,77,77,0.5); color: var(--red); }
        .filter-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ── Results count ── */
        .results-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        .results-count span { color: var(--red); }

        /* ── States ── */
        .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); text-transform: uppercase; animation: pulse 1s infinite; padding: 8px 0 20px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 8px 0 20px; }

        /* ── Cards grid ── */
        .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-bottom: 48px; }
        .sanction-card { background: var(--bg-card); border: 1px solid rgba(255,77,77,0.15); position: relative; overflow: hidden; transition: border-color 0.2s; }
        .sanction-card:hover { border-color: rgba(255,77,77,0.35); }
        .sanction-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--red); }
        .card-inner { padding: 20px 20px 20px 24px; }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
        .card-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; line-height: 1.2; }
        .card-type-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; padding: 3px 9px; text-transform: uppercase; border: 1px solid; flex-shrink: 0; margin-top: 2px; }
        .card-type-individual { color: var(--accent); border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.07); }
        .card-type-entity { color: #b464ff; border-color: rgba(180,100,255,0.4); background: rgba(180,100,255,0.07); }
        .card-type-vessel { color: #00c9b0; border-color: rgba(0,201,176,0.4); background: rgba(0,201,176,0.07); }
        .card-type-aircraft { color: #ffaa00; border-color: rgba(255,170,0,0.4); background: rgba(255,170,0,0.07); }
        .card-aka { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px; }
        .card-aka b { color: var(--text-muted); font-weight: 400; }
        .card-title-line { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 8px; }
        .card-remarks { font-family: var(--font-display); font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 10px; }
        .card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .card-programs { display: flex; flex-wrap: wrap; gap: 5px; }
        .program-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); border: 1px solid rgba(255,77,77,0.3); padding: 2px 7px; text-transform: uppercase; background: rgba(255,77,77,0.05); }
        .card-ent { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; white-space: nowrap; }

        /* ── No results / empty ── */
        .no-results { grid-column: 1 / -1; padding: 48px; text-align: center; border: 1px solid var(--border); background: var(--bg-card); }
        .no-results-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; }
        .no-results-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        /* ── Official sources ── */
        .sources-section { margin-bottom: 40px; }
        .sources-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .sources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .source-btn { display: block; background: var(--bg-card); border: 1px solid var(--border); padding: 18px 20px; text-decoration: none; transition: all 0.2s; }
        .source-btn:hover { background: var(--bg-card-hover); border-color: var(--border-bright); }
        .source-btn-label { font-family: var(--font-display); font-size: 14px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .source-btn-label span { color: var(--text-muted); font-size: 12px; }
        .source-btn-desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        /* ── Disclaimer ── */
        .disclaimer { background: rgba(255,170,0,0.04); border: 1px solid rgba(255,170,0,0.2); padding: 16px 20px; margin-bottom: 0; }
        .disclaimer-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); line-height: 1.7; }
        .disclaimer-text strong { color: #ffaa00; }

        /* ── Footer ── */
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: 1fr; }
          .sources-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .back-bar { padding: 16px 20px; }
          .content-wrap { padding: 24px 20px 60px; }
          .search-box { flex-direction: column; }
          .sources-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">

        {/* ── Back bar ── */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        {/* ── Hero ── */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <h1 className="tool-title">Sanctions Screener</h1>
            <p className="tool-desc">
              Before doing business with anyone, compliance teams screen them against sanctions lists. This searches the live U.S. Treasury OFAC Specially Designated Nationals (SDN) list — thousands of sanctioned people, companies, vessels, and aircraft, including a.k.a. aliases — to find out if a target is sanctioned and under which program.
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="content-wrap">

          {/* Search */}
          <div className="search-section">
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Search a name or alias — e.g. Putin, Wagner, Sberbank..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && search()}
                aria-label="Search the OFAC sanctions list by name"
              />
              <button type="button" className="search-btn" onClick={search} disabled={loading}>
                {loading ? 'Searching…' : 'Search →'}
              </button>
            </div>
            <div className="search-hint">Live OFAC SDN list · U.S. Treasury · matches names and a.k.a. aliases</div>
          </div>

          {/* Filters — only meaningful once we have results */}
          {searched && results.length > 0 && (
            <div className="filters-row">
              {FILTERS.map((f) => (
                <button
                  type="button"
                  key={f}
                  className={`filter-btn${activeFilter === f ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                  disabled={filterCount(f) === 0}
                >
                  {FILTER_LABEL[f]} ({filterCount(f)})
                </button>
              ))}
            </div>
          )}

          {/* Results region */}
          <div aria-live="polite">
            {loading && <div className="loading">Searching OFAC SDN list…</div>}
            {error && <div className="error-msg" role="alert">Error: {error}</div>}

            {!loading && searched && !error && (
              <div className="results-count">
                <span>{filtered.length}</span> {filtered.length === 1 ? 'match' : 'matches'}
                {query && ` for "${query.trim()}"`}
                {results.length > filtered.length && ` (of ${results.length})`}
                {results.length >= 50 && ' — showing top 50'}
              </div>
            )}

            {!loading && !error && (
              <div className="cards-grid">
                {searched && filtered.length === 0 && (
                  <div className="no-results">
                    <div className="no-results-title">No Matches</div>
                    <div className="no-results-sub">No OFAC SDN record matched — try a different spelling, or check the official databases below</div>
                  </div>
                )}
                {filtered.map((entry) => (
                  <div key={entry.entNum} className="sanction-card">
                    <div className="card-inner">
                      <div className="card-top">
                        <div className="card-name">{entry.name}</div>
                        <div className={`card-type-badge card-type-${entry.type.toLowerCase()}`}>
                          {entry.type}
                        </div>
                      </div>

                      {entry.akas.length > 0 && (
                        <div className="card-aka"><b>a.k.a.</b> {entry.akas.slice(0, 6).join(' · ')}{entry.akas.length > 6 ? ` +${entry.akas.length - 6} more` : ''}</div>
                      )}

                      {entry.title && <div className="card-title-line">{entry.title}</div>}
                      {entry.remarks && <div className="card-remarks">{entry.remarks}</div>}

                      <div className="card-bottom">
                        {entry.programs.length > 0 && (
                          <div className="card-programs">
                            {entry.programs.map((p) => (
                              <div key={p} className="program-tag">{p}</div>
                            ))}
                          </div>
                        )}
                        <div className="card-ent">SDN #{entry.entNum}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official sources */}
          <div className="sources-section">
            <div className="sources-label">Official Government Sanctions Databases</div>
            <div className="sources-grid">
              {OFFICIAL_SOURCES.map((src) => (
                <a
                  key={src.label}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-btn"
                >
                  <div className="source-btn-label">
                    {src.label} <span aria-hidden="true">→</span>
                  </div>
                  <div className="source-btn-desc">{src.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <p className="disclaimer-text">
              <strong>Disclaimer:</strong> Results come from the live U.S. Treasury OFAC SDN list only — they do not include EU, UN, BIS, or UK lists. For compliance decisions, always verify against the official government databases above.
            </p>
          </div>

        </div>

        {/* ── Footer ── */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>

      </main>
    </>
  );
}
