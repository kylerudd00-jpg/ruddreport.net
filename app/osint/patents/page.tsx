'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .back-bar { padding: 20px 40px; border-bottom: 1px solid var(--border); }
  .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
  .back-link:hover { color: var(--accent); }
  .hero { padding: 48px 40px 36px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(24px, 4vw, 44px); font-weight: 900; color: #fff; letter-spacing: 2px; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 15px; color: var(--text-secondary); line-height: 1.7; max-width: 680px; }

  .tool-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }

  .search-block { margin-bottom: 32px; }
  .mode-tabs { display: flex; gap: 2px; margin-bottom: 10px; }
  .mode-tab { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 18px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
  .mode-tab:hover { color: var(--accent); border-color: var(--accent); }
  .mode-tab.active { background: rgba(30,158,255,0.1); border-color: var(--accent); color: var(--accent); }
  .search-row { display: flex; gap: 2px; }
  .search-input { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 15px; padding: 15px 20px; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-muted); font-size: 13px; }
  .search-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 15px 32px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .search-btn:hover { background: #4db3ff; }
  .hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 8px; }

  .results-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }

  .db-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-bottom: 40px; }
  .db-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.2s; }
  .db-card:hover { border-color: var(--border-bright); }
  .db-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .db-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase; }
  .db-coverage { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); background: rgba(30,158,255,0.08); border: 1px solid var(--border-bright); padding: 3px 8px; white-space: nowrap; }
  .db-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  .db-links { display: flex; flex-direction: column; gap: 2px; }
  .db-link { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border); text-decoration: none; transition: all 0.2s; }
  .db-link:hover { background: rgba(30,158,255,0.06); border-color: var(--border-bright); }
  .db-link-label { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
  .db-link:hover .db-link-label { color: var(--accent); }
  .db-link-arrow { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .db-link:hover .db-link-arrow { color: var(--accent); }

  .info-section { background: rgba(30,158,255,0.03); border: 1px solid var(--border); padding: 24px; }
  .info-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
  .tip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .tip { }
  .tip-head { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 6px; text-transform: uppercase; }
  .tip-body { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
  .tip-body code { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }

  @media (max-width: 900px) { .db-grid { grid-template-columns: 1fr; } .tip-grid { grid-template-columns: 1fr; } }
  @media (max-width: 768px) { .back-bar, .hero, .tool-wrap { padding-left: 20px; padding-right: 20px; } .hero { padding-top: 32px; padding-bottom: 24px; } .search-row { flex-direction: column; } .mode-tabs { flex-wrap: wrap; } }
`;

type Mode = 'keyword' | 'assignee' | 'inventor' | 'patent';

const MODE_LABELS: Record<Mode, string> = {
  keyword: 'Keyword',
  assignee: 'Assignee / Company',
  inventor: 'Inventor',
  patent: 'Patent Number',
};

const MODE_PLACEHOLDERS: Record<Mode, string> = {
  keyword: 'e.g. face recognition, semiconductor memory',
  assignee: 'e.g. Apple Inc, Samsung Electronics',
  inventor: 'e.g. Jony Ive, Nikola Tesla',
  patent: 'e.g. US10,000,000 or EP3123456',
};

function encQ(s: string) { return encodeURIComponent(s); }

function buildLinks(query: string, mode: Mode): { db: string; coverage: string; desc: string; links: { label: string; url: string }[] }[] {
  const q = query.trim();
  if (!q) return [];

  const ustpoAssignee = `https://ppubs.uspto.gov/pubwebapp/external.html?q=%22${encQ(q)}%22.ASNM.&type=grant&db=GRANT`;
  const googleAssignee = `https://patents.google.com/?assignee=${encQ(q)}&num=25&hl=en`;
  const googleInventor = `https://patents.google.com/?inventor=${encQ(q)}&num=25&hl=en`;
  const googleKeyword  = `https://patents.google.com/?q=${encQ(q)}&num=25&hl=en`;
  const googlePatNum   = `https://patents.google.com/patent/${q.replace(/[\s,]/g, '')}`;
  const espacenetAssignee = `https://worldwide.espacenet.com/patent/search?q=pa%3D%22${encQ(q)}%22`;
  const espacenetInventor = `https://worldwide.espacenet.com/patent/search?q=in%3D%22${encQ(q)}%22`;
  const espacenetKeyword  = `https://worldwide.espacenet.com/patent/search?q=${encQ(q)}`;
  const lensAssignee = `https://www.lens.org/lens/search/patent?q=assignee.name%3A%22${encQ(q)}%22`;
  const lensInventor = `https://www.lens.org/lens/search/patent?q=inventor.name%3A%22${encQ(q)}%22`;
  const lensKeyword  = `https://www.lens.org/lens/search/patent?q=${encQ(q)}`;
  const wipoKeyword  = `https://patentscope.wipo.int/search/en/result.jsf?query=${encQ(q)}&office=&prevFilter=&sortOption=Pub+Date+Desc`;
  const wipoAssignee = `https://patentscope.wipo.int/search/en/result.jsf?query=AA%3A${encQ(q)}&office=&prevFilter=&sortOption=Pub+Date+Desc`;
  const ustpoPatNum  = `https://ppubs.uspto.gov/pubwebapp/external.html?q=${encQ(q.replace(/[\s,]/g, ''))}.PN.&type=grant&db=GRANT`;

  if (mode === 'assignee') return [
    {
      db: 'USPTO Patent Public Search',
      coverage: 'US',
      desc: 'Official US patent database. Search all granted patents and published applications by assignee name.',
      links: [
        { label: `Assignee: "${q}" — Grants`, url: ustpoAssignee },
        { label: `Assignee: "${q}" — Applications`, url: `https://ppubs.uspto.gov/pubwebapp/external.html?q=%22${encQ(q)}%22.ASNM.&type=application&db=US-PGPUB` },
      ],
    },
    {
      db: 'Google Patents',
      coverage: 'Global',
      desc: 'Broadest coverage — US, EP, WO, CN, JP and more. Filters by assignee across all jurisdictions.',
      links: [
        { label: `Assignee: "${q}" — All patents`, url: googleAssignee },
        { label: `Assignee: "${q}" — Sorted by date`, url: `${googleAssignee}&sort=new` },
      ],
    },
    {
      db: 'EPO Espacenet',
      coverage: 'European + Global',
      desc: 'European Patent Office database with worldwide coverage. Excellent for European assignees.',
      links: [
        { label: `Proprietor: "${q}"`, url: espacenetAssignee },
      ],
    },
    {
      db: 'Lens.org',
      coverage: 'Global',
      desc: 'Open access patent database aggregating USPTO, EPO, WIPO, CNIPA and more.',
      links: [
        { label: `Assignee: "${q}"`, url: lensAssignee },
      ],
    },
  ];

  if (mode === 'inventor') return [
    {
      db: 'Google Patents',
      coverage: 'Global',
      desc: 'Search patents by inventor across all jurisdictions. Covers US, EP, WO, CN, JP and more.',
      links: [
        { label: `Inventor: "${q}"`, url: googleInventor },
        { label: `Inventor: "${q}" — Sorted by date`, url: `${googleInventor}&sort=new` },
      ],
    },
    {
      db: 'EPO Espacenet',
      coverage: 'European + Global',
      desc: 'European Patent Office database. Inventor search across all worldwide patent documents.',
      links: [
        { label: `Inventor: "${q}"`, url: espacenetInventor },
      ],
    },
    {
      db: 'Lens.org',
      coverage: 'Global',
      desc: 'Open access patent database. Inventor name search across all major patent offices.',
      links: [
        { label: `Inventor: "${q}"`, url: lensInventor },
      ],
    },
    {
      db: 'WIPO PatentScope',
      coverage: 'PCT / International',
      desc: 'World Intellectual Property Organization database. Best for international PCT applications.',
      links: [
        { label: `Author: "${q}"`, url: wipoAssignee },
      ],
    },
  ];

  if (mode === 'patent') return [
    {
      db: 'Google Patents',
      coverage: 'Global',
      desc: 'Direct lookup by patent number. Supports US, EP, WO, CN, JP and other country codes.',
      links: [
        { label: `Patent: ${q}`, url: googlePatNum },
      ],
    },
    {
      db: 'USPTO Patent Public Search',
      coverage: 'US',
      desc: 'Official USPTO full-text patent search. Best for US grant (US) and application (US-PG) numbers.',
      links: [
        { label: `Patent Number: ${q}`, url: ustpoPatNum },
      ],
    },
    {
      db: 'EPO Espacenet',
      coverage: 'European + Global',
      desc: 'EPO patent lookup. Supports US, EP, WO, and most national patent number formats.',
      links: [
        { label: `Patent Number: ${q}`, url: `https://worldwide.espacenet.com/patent/search?q=pn%3D${encQ(q.replace(/[\s,]/g, ''))}` },
      ],
    },
  ];

  // keyword (default)
  return [
    {
      db: 'Google Patents',
      coverage: 'Global',
      desc: 'Full-text patent search with semantic understanding. Best general-purpose patent keyword search.',
      links: [
        { label: `"${q}" — All patents`, url: googleKeyword },
        { label: `"${q}" — US only`, url: `${googleKeyword}&country=US` },
        { label: `"${q}" — Sorted by date`, url: `${googleKeyword}&sort=new` },
      ],
    },
    {
      db: 'USPTO Patent Public Search',
      coverage: 'US',
      desc: 'Full-text search of all US granted patents and published applications since 1976.',
      links: [
        { label: `"${q}" — Grants full-text`, url: `https://ppubs.uspto.gov/pubwebapp/external.html?q=${encQ(q)}&type=grant&db=GRANT` },
        { label: `"${q}" — Applications full-text`, url: `https://ppubs.uspto.gov/pubwebapp/external.html?q=${encQ(q)}&type=application&db=US-PGPUB` },
      ],
    },
    {
      db: 'EPO Espacenet',
      coverage: 'European + Global',
      desc: 'European Patent Office full-text search across 120M+ patent documents worldwide.',
      links: [
        { label: `"${q}" — Full text`, url: espacenetKeyword },
      ],
    },
    {
      db: 'Lens.org',
      coverage: 'Global',
      desc: 'Open access global patent database. Free full-text search across all major patent offices.',
      links: [
        { label: `"${q}" — Full text`, url: lensKeyword },
      ],
    },
    {
      db: 'WIPO PatentScope',
      coverage: 'PCT / International',
      desc: 'WIPO database for international patent applications (PCT) and national phase documents.',
      links: [
        { label: `"${q}" — PCT applications`, url: wipoKeyword },
      ],
    },
  ];
}

function PatentsInner() {
  const params = useSearchParams();
  const initQ = params.get('q') ?? '';
  const initMode = (params.get('mode') as Mode) ?? 'keyword';

  const [query, setQuery] = useState(initQ);
  const [mode, setMode] = useState<Mode>(initMode);
  const [submitted, setSubmitted] = useState(initQ);

  useEffect(() => {
    if (initQ) setSubmitted(initQ);
  }, [initQ]);

  const dbs = buildLinks(submitted, mode);

  function search() {
    const q = query.trim();
    if (q) setSubmitted(q);
  }

  return (
    <>
      <style>{STYLE}</style>
      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" aria-hidden="true" />
              <div className="hero-eyebrow-text">Intellectual Property Intelligence</div>
            </div>
            <h1 className="hero-title">Patent <span>Search</span></h1>
            <p className="hero-sub">
              Search USPTO, Google Patents, EPO Espacenet, WIPO PatentScope, and Lens.org by keyword, assignee, inventor, or patent number. Direct links open the authoritative source database with your query pre-loaded.
            </p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-block">
            <div className="mode-tabs">
              {(Object.keys(MODE_LABELS) as Mode[]).map(m => (
                <button type="button" key={m} className={`mode-tab${mode === m ? ' active' : ''}`} onClick={() => setMode(m)}>
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>
            <div className="search-row">
              <input
                className="search-input"
                type="text"
                aria-label="Patent search query"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && search()}
                placeholder={MODE_PLACEHOLDERS[mode]}
                autoFocus
              />
              <button type="button" className="search-btn" onClick={search}>Search</button>
            </div>
            <div className="hint">
              {mode === 'assignee' && 'Enter the exact legal company name for best results · e.g. "Apple Inc" not "Apple"'}
              {mode === 'inventor' && 'Use full name for precision · Results link directly to each database pre-filtered by inventor'}
              {mode === 'keyword' && 'Use technical terms from the patent claims · Combine terms with AND/OR in supporting databases'}
              {mode === 'patent' && 'Include country prefix · US10000000 · EP3123456 · WO2020123456 · JP2019123456'}
            </div>
          </div>

          <div aria-live="polite">
          {submitted && dbs.length > 0 && (
            <>
              <div className="results-label">
                {mode === 'assignee' ? 'Assignee' : mode === 'inventor' ? 'Inventor' : mode === 'patent' ? 'Patent' : 'Keyword'}: &ldquo;{submitted}&rdquo; — {dbs.length} databases
              </div>
              <div className="db-grid">
                {dbs.map(db => (
                  <div key={db.db} className="db-card">
                    <div className="db-header">
                      <div className="db-name">{db.db}</div>
                      <div className="db-coverage">{db.coverage}</div>
                    </div>
                    <div className="db-desc">{db.desc}</div>
                    <div className="db-links">
                      {db.links.map(lnk => (
                        <a key={lnk.url} href={lnk.url} target="_blank" rel="noopener noreferrer" className="db-link">
                          <span className="db-link-label">{lnk.label}</span>
                          <span className="db-link-arrow">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>

          <div className="info-section">
            <div className="info-title">Patent Search Tips</div>
            <div className="tip-grid">
              <div className="tip">
                <div className="tip-head">Assignee Search</div>
                <div className="tip-body">Use the exact legal entity name. <code>&quot;Apple Inc&quot;</code> differs from <code>&quot;Apple Computer Inc&quot;</code>. Check both historical and current names for acquisitions.</div>
              </div>
              <div className="tip">
                <div className="tip-head">Keyword Precision</div>
                <div className="tip-body">Combine technical terms from patent claims. Use quotation marks for phrases. USPTO and EPO support boolean operators (<code>AND</code>, <code>OR</code>, <code>NOT</code>).</div>
              </div>
              <div className="tip">
                <div className="tip-head">Patent Numbers</div>
                <div className="tip-body">US grants: <code>US10,000,000</code>. PCT applications: <code>WO2020/123456</code>. EP: <code>EP3123456</code>. Remove commas/spaces for most search engines.</div>
              </div>
            </div>
          </div>
        </div>

        <footer style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--border)', marginTop: 40 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            © 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE
          </div>
        </footer>
      </main>
    </>
  );
}

export default function PatentsPage() {
  return (
    <Suspense fallback={null}>
      <PatentsInner />
    </Suspense>
  );
}
