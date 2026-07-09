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
  .search-row { display: flex; gap: 2px; margin-bottom: 12px; }
  .search-input { flex: 1; background: var(--bg-primary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 16px; padding: 16px 20px; transition: border-color 0.2s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--text-muted); font-size: 13px; }
  .search-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 16px 32px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .search-btn:hover { background: #4db3ff; }
  .quick-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
  .quick-btn { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 5px 12px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: var(--accent); border-color: var(--accent); }
  .target-banner { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 28px; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; }
  .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
  .target-name { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text-primary); }
  .target-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #22cc66; border: 1px solid rgba(34,204,102,0.3); padding: 4px 12px; text-transform: uppercase; }
  .sections-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
  .intel-section { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; }
  .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .section-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
  .section-name { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; }
  .link-list { display: flex; flex-direction: column; gap: 2px; }
  .intel-link { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-primary); border: 1px solid var(--border); text-decoration: none; transition: all 0.2s; }
  .intel-link:hover { background: var(--bg-card-hover); border-color: var(--border-bright); }
  .intel-link-name { font-family: var(--font-display); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: var(--text-secondary); }
  .intel-link:hover .intel-link-name { color: var(--accent); }
  .intel-link-desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
  .intel-link-arrow { font-family: var(--font-mono); font-size: 12px; color: var(--accent); opacity: 0.5; }
  .intel-link:hover .intel-link-arrow { opacity: 1; }
  .internal-link { border-color: var(--border); }
  .internal-link .intel-link-name { color: var(--accent); }
  .notes-section { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; margin-top: 2px; grid-column: 1 / -1; }
  textarea { width: 100%; background: var(--bg-primary); border: 1px solid var(--border-bright); color: var(--text-secondary); font-family: var(--font-mono); font-size: 12px; padding: 14px; resize: vertical; min-height: 100px; line-height: 1.7; transition: border-color 0.2s; }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: var(--text-muted); }
  .notes-hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 8px; }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .search-row { flex-direction: column; } .sections-grid { grid-template-columns: 1fr; } }
`;

function enc(s: string) { return encodeURIComponent(s); }

function buildSections(company: string) {
  return [
    {
      name: 'SEC Filings',
      color: '#1e9eff',
      links: [
        { name: 'EDGAR Full-Text Search', desc: 'All SEC filings mentioning company', url: `/osint/edgar?q=${enc(company)}`, internal: true },
        { name: '10-K Annual Reports', desc: 'Annual financial disclosures', url: `https://efts.sec.gov/LATEST/search-index?q="${enc(company)}"&forms=10-K`, internal: false },
        { name: '8-K Material Events', desc: 'Material event filings', url: `https://efts.sec.gov/LATEST/search-index?q="${enc(company)}"&forms=8-K`, internal: false },
        { name: 'Proxy Statements (DEF 14A)', desc: 'Executive pay, board composition', url: `https://efts.sec.gov/LATEST/search-index?q="${enc(company)}"&forms=DEF+14A`, internal: false },
        { name: 'Insider Transactions (Form 4)', desc: 'Executive and director trades', url: `https://www.sec.gov/cgi-bin/browse-edgar?company=${enc(company)}&type=4&action=getcompany`, internal: false },
      ],
    },
    {
      name: 'Corporate Registry',
      color: '#22cc66',
      links: [
        { name: 'OpenCorporates (Internal)', desc: '200M+ companies — officers, agents, dissolved', url: `/osint/opencorporates?q=${enc(company)}`, internal: true },
        { name: 'Corporate Investigator (Internal)', desc: 'GLEIF ownership graph — parents, subsidiaries', url: `/osint/corporate?q=${enc(company)}`, internal: true },
        { name: 'OpenCorporates Search', desc: '200M+ companies, 140 jurisdictions', url: `https://opencorporates.com/companies?q=${enc(company)}&utf8=✓`, internal: false },
        { name: 'EDGAR Company Search', desc: 'Official SEC company lookup', url: `https://www.sec.gov/cgi-bin/browse-edgar?company=${enc(company)}&action=getcompany`, internal: false },
        { name: 'D&B Hoovers', desc: 'Corporate structure and subsidiaries', url: `https://www.dnb.com/business-directory/company-search.html#!#q=${enc(company)}`, internal: false },
        { name: 'Dun & Bradstreet', desc: 'Credit ratings and financials', url: `https://www.dnb.com/site-search-results.html#%7B%22keyword%22:%22${enc(company)}%22%7D`, internal: false },
      ],
    },
    {
      name: 'Patent & IP Intelligence',
      color: '#ffaa00',
      links: [
        { name: 'Patent Search (Internal)', desc: 'USPTO PatentsView by assignee', url: `/osint/patents?q=${enc(company)}&mode=assignee`, internal: true },
        { name: 'Google Patents Assignee', desc: 'All patents filed by company', url: `https://patents.google.com/?assignee=${enc(company)}&sort=new`, internal: false },
        { name: 'USPTO Patent Search', desc: 'Official USPTO patent database', url: `https://ppubs.uspto.gov/pubwebapp/external.html#/${enc(company)}`, internal: false },
        { name: 'WIPO Global Brand DB', desc: 'International trademark search', url: `https://branddb.wipo.int/en/quicksearch?by=brandName&v=${enc(company)}`, internal: false },
      ],
    },
    {
      name: 'Government & Contracts',
      color: '#b464ff',
      links: [
        { name: 'Contracts Tracker (Internal)', desc: 'Federal awards via USASpending', url: `/osint/contracts?q=${enc(company)}`, internal: true },
        { name: 'USASpending.gov', desc: 'Full federal contract database', url: `https://www.usaspending.gov/search/?query=${enc(company)}`, internal: false },
        { name: 'SAM.gov Registration', desc: 'Federal contractor registration', url: `https://sam.gov/search/?keywords=${enc(company)}&index=er`, internal: false },
        { name: 'Lobbying Disclosure', desc: 'Senate lobbying filings', url: `https://lda.senate.gov/system/public/#/?registrant_name=${enc(company)}`, internal: false },
      ],
    },
    {
      name: 'News & Media Intelligence',
      color: '#ff6464',
      links: [
        { name: 'Google News', desc: 'Recent news coverage', url: `https://news.google.com/search?q=${enc(company)}&hl=en-US`, internal: false },
        { name: 'Reuters Search', desc: 'Wire service news', url: `https://www.reuters.com/search/news?blob=${enc(company)}`, internal: false },
        { name: 'Financial Times', desc: 'Business and financial reporting', url: `https://www.ft.com/search?q=${enc(company)}`, internal: false },
        { name: 'Bloomberg Search', desc: 'Market and company intelligence', url: `https://www.bloomberg.com/search?query=${enc(company)}`, internal: false },
        { name: 'Wayback Machine', desc: 'Historical web snapshots', url: `/osint/wayback?q=${enc(company)}.com`, internal: true },
      ],
    },
    {
      name: 'People & Executive Intelligence',
      color: '#4db3ff',
      links: [
        { name: 'LinkedIn Company', desc: 'Employee count, hiring, leadership', url: `https://www.linkedin.com/search/results/companies/?keywords=${enc(company)}`, internal: false },
        { name: 'LinkedIn People Search', desc: 'Current and former employees', url: `https://www.linkedin.com/search/results/people/?keywords=${enc(company)}`, internal: false },
        { name: 'Entity Search (Internal)', desc: 'Wikipedia profile + research links', url: `/osint/entity?q=${enc(company)}`, internal: true },
        { name: 'Executive Bios (Crunchbase)', desc: 'Founder and executive profiles', url: `https://www.crunchbase.com/search/people/field/companies/name/${enc(company.toLowerCase())}`, internal: false },
      ],
    },
    {
      name: 'Financial & Market Data',
      color: '#22cc66',
      links: [
        { name: 'Yahoo Finance', desc: 'Stock price, financials, filings', url: `https://finance.yahoo.com/quote/${enc(company)}`, internal: false },
        { name: 'Macrotrends', desc: 'Historical financial statements', url: `https://www.macrotrends.net/search?query=${enc(company)}`, internal: false },
        { name: 'Prediction Markets', desc: 'Polymarket odds on company events', url: `/osint/polymarket`, internal: true },
        { name: 'Sanctions Check', desc: 'OFAC / UN / EU watchlist check', url: `/osint/sanctions?q=${enc(company)}`, internal: true },
      ],
    },
    {
      name: 'Infrastructure & Technical',
      color: '#1e9eff',
      links: [
        { name: 'WHOIS Lookup', desc: 'Domain registration data', url: `/osint/whois?q=${enc(company.toLowerCase().replace(/\s+/g, ''))}.com`, internal: true },
        { name: 'DNS Intelligence', desc: 'Email, hosting, infrastructure', url: `/osint/dns?q=${enc(company.toLowerCase().replace(/\s+/g, ''))}.com`, internal: true },
        { name: 'SSL Certificate History', desc: 'Cert transparency log search', url: `/osint/ssl?q=${enc(company.toLowerCase().replace(/\s+/g, ''))}.com`, internal: true },
        { name: 'Subdomain Scanner', desc: 'Enumerate company subdomains', url: `/osint/subdomains?q=${enc(company.toLowerCase().replace(/\s+/g, ''))}.com`, internal: true },
        { name: 'CVE Search', desc: 'Vulnerabilities in company products', url: `/osint/cve?q=${enc(company)}`, internal: true },
      ],
    },
  ];
}

const QUICK_COMPANIES = ['Tesla', 'SpaceX', 'Rivian', 'BYD', 'Ford Motor', 'Apple', 'Lockheed Martin', 'Palantir'];

export default function CorporateDashboard() {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState('');
  const [notes, setNotes] = useState('');

  function launch(q?: string) {
    const val = q ?? query;
    if (!val.trim()) return;
    setTarget(val.trim());
    if (q) setQuery(q);
  }

  const sections = target ? buildSections(target) : [];

  return (
    <>
      <style>{STYLE}</style>
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Corporate Intelligence</div></div>
            <h1 className="hero-title">Corporate Intelligence <span>Dashboard</span></h1>
            <p className="hero-sub">Everything publicly known about a company — in one place. Enter any company name to pull SEC filings, government contracts, corporate registry records, executive profiles, and infrastructure data. Used by journalists, analysts, and due diligence teams to build a complete picture of any organization.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="search-row">
            <input
              className="search-input"
              aria-label="Company name to research"
              placeholder="Enter company name — e.g. Tesla, SpaceX, Rivian"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && launch()}
            />
            <button type="button" className="search-btn" onClick={() => launch()}>Generate Profile →</button>
          </div>
          <div className="quick-row">
            {QUICK_COMPANIES.map(c => <button type="button" key={c} className="quick-btn" onClick={() => launch(c)}>{c}</button>)}
          </div>

          {target && (
            <div aria-live="polite">
              <div className="target-banner">
                <div>
                  <div className="target-label">Intelligence Target</div>
                  <div className="target-name">{target}</div>
                </div>
                <div className="target-badge">Profile Active</div>
              </div>

              <div className="sections-grid">
                {sections.map(sec => (
                  <div key={sec.name} className="intel-section">
                    <div className="section-header">
                      <div className="section-dot" style={{ background: sec.color }} aria-hidden="true" />
                      <div className="section-name">{sec.name}</div>
                    </div>
                    <div className="link-list">
                      {sec.links.map(link => (
                        <a
                          key={link.name}
                          href={link.url}
                          target={link.internal ? '_self' : '_blank'}
                          rel={link.internal ? undefined : 'noopener noreferrer'}
                          className={`intel-link${link.internal ? ' internal-link' : ''}`}
                        >
                          <div>
                            <div className="intel-link-name">{link.name}</div>
                            <div className="intel-link-desc">{link.desc}</div>
                          </div>
                          <div className="intel-link-arrow">→</div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="notes-section">
                  <div className="section-header">
                    <div className="section-dot" style={{ background: 'var(--text-muted)' }} aria-hidden="true" />
                    <div className="section-name">Intelligence Notes</div>
                  </div>
                  <textarea
                    aria-label={`Research notes on ${target}`}
                    placeholder={`Research notes on ${target}...`}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                  <div className="notes-hint">Notes are stored locally in this browser session only.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
