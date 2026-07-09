'use client';
import { useState, useEffect } from 'react';

type WikidataFacts = {
  qid: string;
  label: string;
  description: string;
  facts: Record<string, string[]>;
  isPerson: boolean;
  wikidataUrl: string;
};

type WikipediaResult = {
  title: string;
  description: string | null;
  extract: string | null;
  thumbnail: string | null;
  url: string | null;
  suggestions: string[];
};

type Corporation = {
  name: string;
  number: string;
  jurisdiction: string;
  status: string;
  incorporated: string;
  url: string;
};

type EntityResult = {
  found: boolean;
  wiki: WikipediaResult | null;
  wikidata: WikidataFacts | null;
  corporations: Corporation[];
};

const FACT_LABELS: Record<string, string> = {
  type: 'Entity Type',
  occupation: 'Occupation',
  citizenship: 'Citizenship',
  born: 'Date of Birth',
  died: 'Date of Death',
  birthplace: 'Place of Birth',
  employer: 'Employer',
  party: 'Political Party',
  positions: 'Positions Held',
  website: 'Official Website',
  country: 'Country',
  headquarters: 'Headquarters',
  founded: 'Founded',
  dissolved: 'Dissolved',
  industry: 'Industry',
  ceo: 'CEO',
  foundedBy: 'Founded By',
  parentOrg: 'Parent Organization',
  stockExchange: 'Stock Exchange',
  legalForm: 'Legal Form',
};

// Person vs org — which facts to show and in what order
const PERSON_FACT_ORDER = ['type','occupation','citizenship','born','died','birthplace','employer','party','positions','website'];
const ORG_FACT_ORDER = ['type','country','headquarters','founded','dissolved','industry','ceo','foundedBy','parentOrg','stockExchange','legalForm','website'];

const OSINT_LINKS = (q: string) => [
  { label: 'Google News', url: `https://news.google.com/search?q=${encodeURIComponent(q)}` },
  { label: 'LinkedIn', url: `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(q)}` },
  { label: 'Twitter / X', url: `https://x.com/search?q=${encodeURIComponent(q)}` },
  { label: 'SEC EDGAR', url: `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent('"'+q+'"')}` },
  { label: 'OpenCorporates', url: `https://opencorporates.com/companies?q=${encodeURIComponent(q)}` },
  { label: 'ICIJ Offshore Leaks', url: `https://offshoreleaks.icij.org/search?q=${encodeURIComponent(q)}` },
  { label: 'OpenSanctions', url: `https://www.opensanctions.org/search/?q=${encodeURIComponent(q)}` },
  { label: 'US Court Records', url: `https://www.pacermonitor.com/search/?q=${encodeURIComponent(q)}` },
  { label: 'TruePeopleSearch', url: `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(q)}` },
  { label: 'FEC Donations', url: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(q)}` },
  { label: 'Wikidata', url: `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(q)}` },
  { label: 'Google Search', url: `https://www.google.com/search?q=${encodeURIComponent('"'+q+'"')}` },
];

export default function EntitySearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<EntityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  const runSearch = async (val: string) => {
    const q = val.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(q);
    try {
      const res = await fetch(`/api/osint/entity?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to fetch. Try again.');
    } finally {
      setLoading(false);
    }
  };
  const search = () => runSearch(query);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setQuery(q); runSearch(q); }
  }, []);

  const factOrder = result?.wikidata?.isPerson ? PERSON_FACT_ORDER : ORG_FACT_ORDER;
  const facts = result?.wikidata?.facts || {};
  const orderedFacts = factOrder.filter(k => facts[k]?.length);
  // Any facts not in the ordered list
  const extraFacts = Object.keys(facts).filter(k => !factOrder.includes(k));
  const allFacts = [...orderedFacts, ...extraFacts];

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
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #ffffff; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); animation: pulse 1s infinite; padding: 20px 0; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .wiki-card { background: var(--bg-card); border: 1px solid var(--border); border-top: 2px solid var(--accent); padding: 28px; display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: start; }
        .wiki-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .wiki-desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-bottom: 14px; }
        .wiki-extract { font-size: 14px; color: var(--text-secondary); line-height: 1.9; margin-bottom: 16px; }
        .wiki-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-decoration: none; text-transform: uppercase; }
        .wiki-thumb { width: 130px; height: 130px; object-fit: cover; border: 1px solid var(--border); flex-shrink: 0; }
        .facts-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; }
        .facts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .fact-row { padding: 10px 14px; background: var(--bg-primary); border: 1px solid var(--border); }
        .fact-key { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .fact-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); line-height: 1.5; }
        .fact-val a { color: var(--accent); text-decoration: none; }
        .fact-val a:hover { text-decoration: underline; }
        .wikidata-row { margin-top: 12px; display: flex; align-items: center; gap: 16px; }
        .wikidata-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .wikidata-link:hover { color: var(--accent); }
        .corp-card { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; text-decoration: none; display: block; transition: border-color 0.2s; }
        .corp-card:hover { border-color: var(--border-bright); }
        .corp-name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; margin-bottom: 6px; }
        .corp-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .corp-meta-item { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
        .corp-meta-item span { color: var(--text-muted); }
        .corp-status { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 8px; border: 1px solid; }
        .osint-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .osint-link { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; text-decoration: none; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; transition: all 0.3s; display: block; }
        .osint-link:hover { color: var(--accent); border-color: var(--border-bright); background: var(--bg-card-hover); }
        .suggestions { display: flex; gap: 8px; flex-wrap: wrap; }
        .suggestion-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); background: none; border: 1px solid var(--border-bright); padding: 6px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .suggestion-btn:hover { color: var(--accent); border-color: var(--border-bright); }
        .no-result { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); padding: 20px 0; text-transform: uppercase; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; } .search-box { flex-direction: column; }
          .results-wrap { padding: 0 20px 60px; }
          .wiki-card { grid-template-columns: 1fr; }
          .wiki-thumb { width: 100%; height: 180px; }
          .facts-grid { grid-template-columns: 1fr; }
          .osint-grid { grid-template-columns: repeat(2, 1fr); }
          footer { padding: 30px 20px; } .footer-bottom { flex-direction: column; gap: 12px; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Entity Intelligence</div>
            </div>
            <h1 className="tool-title">Entity Search</h1>
            <p className="tool-desc">Type any person, company, or organization to instantly pull a structured profile from Wikipedia, Wikidata, and corporate registries — roles, nationality, founding date, headquarters, and key executives. A fast first step for any investigation when you need to establish who you're dealing with.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Person, company, or organization to search"
              placeholder="Person, company, or organization — e.g. Elon Musk, Tesla, Vladimir Putin"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && search()}
            />
            <button type="button" className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
        </div>

        <div className="results-wrap" aria-live="polite">
          {loading && <div className="loading">Querying intelligence sources...</div>}
          {error && <div className="error-msg" role="alert">Error: {error}</div>}

          {/* Wikipedia profile */}
          {result?.wiki && (
            <div>
              <div className="section-label">Wikipedia Profile</div>
              <div className="wiki-card">
                <div>
                  <div className="wiki-title">{result.wiki.title}</div>
                  {result.wiki.description && <div className="wiki-desc">{result.wiki.description}</div>}
                  {result.wiki.extract && <p className="wiki-extract">{result.wiki.extract}</p>}
                  {result.wiki.url && (
                    <a href={result.wiki.url} target="_blank" rel="noopener noreferrer" className="wiki-link">
                      View full Wikipedia article →
                    </a>
                  )}
                </div>
                {result.wiki.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={result.wiki.thumbnail} alt={result.wiki.title} className="wiki-thumb" />
                )}
              </div>
              {result.wiki.suggestions && result.wiki.suggestions.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div className="section-label" style={{ marginBottom: '8px' }}>Related Entities</div>
                  <div className="suggestions">
                    {result.wiki.suggestions.map((s, i) => (
                      <button type="button" key={i} className="suggestion-btn" onClick={() => { setQuery(s); }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wikidata structured facts */}
          {result?.wikidata && allFacts.length > 0 && (
            <div>
              <div className="section-label">
                Structured Intelligence — {result.wikidata.description || result.wikidata.label}
              </div>
              <div className="facts-card">
                <div className="facts-grid">
                  {allFacts.map(key => {
                    const vals = facts[key];
                    const label = FACT_LABELS[key] || key;
                    const isWebsite = key === 'website';
                    return (
                      <div key={key} className="fact-row">
                        <div className="fact-key">{label}</div>
                        <div className="fact-val">
                          {isWebsite ? (
                            <a href={vals[0].startsWith('http') ? vals[0] : `https://${vals[0]}`} target="_blank" rel="noopener noreferrer">
                              {vals[0]}
                            </a>
                          ) : (
                            vals.join(' · ')
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="wikidata-row">
                  <a href={result.wikidata.wikidataUrl} target="_blank" rel="noopener noreferrer" className="wikidata-link">
                    View on Wikidata ({result.wikidata.qid}) →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* No result */}
          {result && !result.found && (
            <div className="no-result">No profile found in Wikipedia or Wikidata — use the cross-reference links below</div>
          )}

          {/* OpenCorporates */}
          {result?.corporations && result.corporations.length > 0 && (
            <div>
              <div className="section-label">Corporate Records — OpenCorporates</div>
              {result.corporations.map((c, i) => (
                <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="corp-card" style={{ marginBottom: '2px' }}>
                  <div className="corp-name">{c.name}</div>
                  <div className="corp-meta">
                    {c.number && <div className="corp-meta-item">Reg. <span>{c.number}</span></div>}
                    {c.jurisdiction && <div className="corp-meta-item">Jurisdiction: <span>{c.jurisdiction}</span></div>}
                    {c.incorporated && <div className="corp-meta-item">Incorporated: <span>{c.incorporated}</span></div>}
                    {c.status && (
                      <div className="corp-status" style={{
                        color: c.status.toLowerCase() === 'active' ? '#22cc66' : 'var(--red)',
                        borderColor: c.status.toLowerCase() === 'active' ? 'rgba(34,204,102,0.3)' : 'rgba(255,68,68,0.3)',
                      }}>
                        {c.status}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Cross-reference links — always show once searched */}
          {searched && !loading && (
            <div>
              <div className="section-label">Cross-Reference in External Databases</div>
              <div className="osint-grid">
                {OSINT_LINKS(result?.wiki?.title || searched).map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="osint-link">
                    {l.label} →
                  </a>
                ))}
              </div>
            </div>
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
