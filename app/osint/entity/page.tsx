'use client';
import { useState } from 'react';

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

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSearched(query.trim());
    try {
      const res = await fetch(`/api/osint/entity?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Failed to fetch. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const factOrder = result?.wikidata?.isPerson ? PERSON_FACT_ORDER : ORG_FACT_ORDER;
  const facts = result?.wikidata?.facts || {};
  const orderedFacts = factOrder.filter(k => facts[k]?.length);
  // Any facts not in the ordered list
  const extraFacts = Object.keys(facts).filter(k => !factOrder.includes(k));
  const allFacts = [...orderedFacts, ...extraFacts];

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
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #5a7a94; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #5a7a94; cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #ff3a3a; padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .loading { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; animation: pulse 1s infinite; padding: 20px 0; }
        .section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .wiki-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); border-top: 2px solid #1e9eff; padding: 28px; display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: start; }
        .wiki-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
        .wiki-desc { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; margin-bottom: 14px; }
        .wiki-extract { font-size: 14px; color: #9ab0c4; line-height: 1.9; margin-bottom: 16px; }
        .wiki-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-decoration: none; text-transform: uppercase; }
        .wiki-thumb { width: 130px; height: 130px; object-fit: cover; border: 1px solid rgba(30,158,255,0.2); flex-shrink: 0; }
        .facts-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 24px; }
        .facts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .fact-row { padding: 10px 14px; background: rgba(3,6,8,0.5); border: 1px solid rgba(30,158,255,0.06); }
        .fact-key { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 4px; }
        .fact-val { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c0cfe0; line-height: 1.5; }
        .fact-val a { color: #1e9eff; text-decoration: none; }
        .fact-val a:hover { text-decoration: underline; }
        .wikidata-row { margin-top: 12px; display: flex; align-items: center; gap: 16px; }
        .wikidata-link { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .wikidata-link:hover { color: #1e9eff; }
        .corp-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 16px 20px; text-decoration: none; display: block; transition: border-color 0.2s; }
        .corp-card:hover { border-color: rgba(30,158,255,0.3); }
        .corp-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #c0cfe0; letter-spacing: 1px; margin-bottom: 6px; }
        .corp-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .corp-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #5a7a94; }
        .corp-meta-item span { color: #5a7a90; }
        .corp-status { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 8px; border: 1px solid; }
        .osint-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .osint-link { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 14px 16px; text-decoration: none; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1.5px; color: #7a9bb5; text-transform: uppercase; transition: all 0.3s; display: block; }
        .osint-link:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); background: #0f1e2e; }
        .suggestions { display: flex; gap: 8px; flex-wrap: wrap; }
        .suggestion-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #7a9bb5; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 6px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .suggestion-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
        .no-result { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #5a7a94; padding: 20px 0; text-transform: uppercase; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
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

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('entityMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="entityMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('entityMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">OSINT Hub — Entity Intelligence</div>
            </div>
            <div className="tool-title">Entity Search</div>
            <p className="tool-desc">Type any person, company, or organization to instantly pull a structured profile from Wikipedia, Wikidata, and corporate registries — roles, nationality, founding date, headquarters, and key executives. A fast first step for any investigation when you need to establish who you're dealing with.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Person, company, or organization — e.g. Elon Musk, Tesla, Vladimir Putin"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && search()}
            />
            <button className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
        </div>

        <div className="results-wrap">
          {loading && <div className="loading">Querying intelligence sources...</div>}
          {error && <div className="error-msg">Error: {error}</div>}

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
                      <button key={i} className="suggestion-btn" onClick={() => { setQuery(s); }}>{s}</button>
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
                        color: c.status.toLowerCase() === 'active' ? '#22cc66' : '#ff4444',
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
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
          </div>
        </footer>
      </div>
    </>
  );
}
