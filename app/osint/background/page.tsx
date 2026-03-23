'use client';
import { useState, useCallback } from 'react';

const US_STATES = [
  'Any','AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
  'NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA',
  'WV','WI','WY',
];

const VOTER_STATES: Record<string, string> = {
  NC: 'https://vt.ncsbe.gov/RegLkup/',
  OH: 'https://voterlookup.ohiosos.gov/voterlookup.aspx',
  GA: 'https://mvp.sos.ga.gov/s/voter-registration-overview',
  TX: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
  FL: 'https://registration.elections.myflorida.com/CheckVoterStatus',
  AZ: 'https://my.arizona.vote/PortalList.aspx',
  CO: 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
  VA: 'https://vote.elections.virginia.gov/VoterInformation/PublicContactLookup',
  MI: 'https://mvic.sos.state.mi.us/Voter/Index',
  WA: 'https://voter.votewa.gov/WhereToVote.aspx',
};

interface CourtResult {
  case_name?: string;
  court?: string;
  date_filed?: string;
  absolute_url?: string;
  docket_number?: string;
}

export default function BackgroundCheck() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('Any');
  const [age, setAge] = useState('');
  const [submitted, setSubmitted] = useState<{ firstName: string; lastName: string; state: string; age: string } | null>(null);
  const [courtResults, setCourtResults] = useState<CourtResult[]>([]);
  const [courtCount, setCourtCount] = useState(0);
  const [courtLoading, setCourtLoading] = useState(false);
  const [courtError, setCourtError] = useState('');

  const fetchCourt = useCallback(async (fn: string, ln: string) => {
    setCourtLoading(true);
    setCourtError('');
    setCourtResults([]);
    setCourtCount(0);
    try {
      const q = `"${fn} ${ln}"`;
      const res = await fetch(`/api/osint/courtlistener?q=${encodeURIComponent(q)}&type=r`);
      const data = await res.json();
      setCourtResults(data.results || []);
      setCourtCount(data.count || 0);
    } catch {
      setCourtError('Could not reach CourtListener API.');
    }
    setCourtLoading(false);
  }, []);

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    const s = { firstName: firstName.trim(), lastName: lastName.trim(), state, age: age.trim() };
    setSubmitted(s);
    fetchCourt(s.firstName, s.lastName);
  };

  const enc = (s: string) => encodeURIComponent(s);
  const fn = submitted?.firstName || '';
  const ln = submitted?.lastName || '';
  const st = submitted?.state || '';
  const fullName = `${fn} ${ln}`.trim();

  const voterUrl = () => {
    if (st && VOTER_STATES[st]) return VOTER_STATES[st];
    return `https://www.vote.org/voter-registration-status/`;
  };

  const voterLabel = () => {
    if (st && VOTER_STATES[st]) return `${st} Voter Lookup`;
    return 'Vote.org — National Lookup';
  };

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
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .legal-disclaimer { margin-bottom: 32px; padding: 20px 24px; background: rgba(255,60,60,0.05); border: 1px solid rgba(255,60,60,0.25); border-left: 3px solid rgba(255,60,60,0.6); }
        .legal-disclaimer p { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #c4909090; line-height: 1.8; color: #c07070; }
        .legal-disclaimer strong { color: #ff6060; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(30,158,255,0.6); }
        .form-input::placeholder { color: #2d4055; }
        .form-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; cursor: pointer; }
        .run-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .section-wrap { margin-bottom: 48px; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .service-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); border-left: 3px solid #1e9eff; padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.3s; }
        .service-card:hover { border-color: rgba(30,158,255,0.35); border-left-color: #1e9eff; }
        .service-card.warn-card { border-left-color: #ffaa00; background: #0e0c08; border-color: rgba(255,170,0,0.12); }
        .service-card.warn-card:hover { border-color: rgba(255,170,0,0.3); border-left-color: #ffaa00; }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .service-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .service-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 8px 18px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .service-btn.warn-btn { color: #ffaa00; border-color: rgba(255,170,0,0.3); }
        .service-btn.warn-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
        .service-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #1e9eff; letter-spacing: 2px; }
        .court-table-wrap { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); overflow-x: auto; margin-bottom: 48px; }
        .court-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .court-table th { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; padding: 14px 20px; text-align: left; background: rgba(30,158,255,0.05); border-bottom: 1px solid rgba(30,158,255,0.15); }
        .court-table td { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ab0c4; padding: 12px 20px; border-bottom: 1px solid rgba(30,158,255,0.06); letter-spacing: 0.5px; vertical-align: top; }
        .court-table tr:last-child td { border-bottom: none; }
        .court-table tr:hover td { background: rgba(30,158,255,0.03); }
        .court-table td:first-child { color: #c0cfe0; }
        .court-table a { color: #1e9eff; text-decoration: none; }
        .court-table a:hover { text-decoration: underline; }
        .court-status { padding: 32px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; }
        .court-count { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #7a9bb5; margin-bottom: 16px; }
        .court-count span { color: #1e9eff; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .form-grid-4 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .form-grid-4 { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </div>
        </nav>

        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">OSINT Intelligence</div>
            </div>
            <div className="tool-title">Background Check &amp; Public Records</div>
            <p className="tool-desc">Search federal court filings, criminal records databases, sex offender registries, incarceration records, voter registrations, and vital records using authoritative public data sources.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="legal-disclaimer">
            <p><strong>For authorized research only.</strong> Public records are provided for lawful OSINT, background screening, and journalistic purposes. Misuse of this tool may violate the FCRA, DPPA, or state privacy laws. Verify all results through official channels before taking any action.</p>
          </div>

          {/* Input Form */}
          <div style={{marginBottom: '40px'}}>
            <div className="form-grid-4">
              <div className="form-field">
                <label className="form-label">First Name *</label>
                <input
                  className="form-input"
                  placeholder="John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Last Name *</label>
                <input
                  className="form-input"
                  placeholder="Smith"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              <div className="form-field">
                <label className="form-label">State</label>
                <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Age (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. 35"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
            <button
              className="run-btn"
              onClick={handleSubmit}
              disabled={!firstName.trim() || !lastName.trim()}
            >
              Run Background Check →
            </button>
          </div>

          {submitted && (
            <div className="target-display">
              <div>
                <div className="target-label">Subject</div>
                <div className="target-value">{fullName}{submitted.age ? ` — Age ${submitted.age}` : ''}{submitted.state !== 'Any' ? ` — ${submitted.state}` : ''}</div>
              </div>
            </div>
          )}

          {/* Federal Court Records */}
          <div className="section-wrap">
            <div className="section-label">Federal Court Records — CourtListener / PACER</div>
            {!submitted && (
              <div className="court-status">Enter a name above to search federal court records</div>
            )}
            {courtLoading && (
              <div className="court-status">Pulling federal court records...</div>
            )}
            {courtError && !courtLoading && (
              <div className="court-status" style={{color:'#ff6060'}}>{courtError}</div>
            )}
            {submitted && !courtLoading && !courtError && (
              <>
                <div className="court-count">
                  {courtCount > 0
                    ? <><span>{courtCount.toLocaleString()}</span> federal court records found — showing top {Math.min(15, courtResults.length)}</>
                    : 'No federal court records found for this name'
                  }
                </div>
                {courtResults.length > 0 && (
                  <div className="court-table-wrap">
                    <table className="court-table">
                      <thead>
                        <tr>
                          <th>Case Name</th>
                          <th>Court</th>
                          <th>Date Filed</th>
                          <th>Docket</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courtResults.map((r, i) => (
                          <tr key={i}>
                            <td>
                              {r.absolute_url ? (
                                <a href={`https://www.courtlistener.com${r.absolute_url}`} target="_blank" rel="noopener noreferrer">
                                  {r.case_name || 'Unknown Case'}
                                </a>
                              ) : (r.case_name || 'Unknown Case')}
                            </td>
                            <td>{r.court || '—'}</td>
                            <td>{r.date_filed || '—'}</td>
                            <td>{r.docket_number || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 1: Criminal Records */}
          <div className="section-wrap">
            <div className="section-label">Criminal Records</div>
            <div className="services-grid">
              {[
                {
                  name: 'FBI Name Check',
                  badge: 'Federal',
                  badgeColor: '#1e9eff',
                  desc: 'Official FBI Identity History Summary Check. Requires formal request but is authoritative for criminal history at the federal level.',
                  url: () => 'https://www.fbi.gov/services/cjis/identity-history-summary-checks',
                  label: 'Open Site →',
                },
                {
                  name: 'Instant Checkmate',
                  badge: 'Criminal + Records',
                  badgeColor: '#1e9eff',
                  desc: 'Comprehensive people search including criminal records, arrest history, and public court data. Aggregates records from multiple sources.',
                  url: () => submitted ? `https://www.instantcheckmate.com/people/${enc(fn)}-${enc(ln)}/` : '',
                  label: 'Search →',
                },
                {
                  name: 'CheckPeople',
                  badge: 'Public Records',
                  badgeColor: '#1e9eff',
                  desc: 'Search criminal records, arrest history, and public court filings by name. Free preview with paid full report.',
                  url: () => submitted ? `https://www.checkpeople.com/people/${enc(fn)}+${enc(ln)}` : '',
                  label: 'Search →',
                },
                {
                  name: 'CourtListener PACER',
                  badge: 'Federal Courts',
                  badgeColor: '#1e9eff',
                  desc: 'Search federal PACER filings via CourtListener\'s free interface. Access to millions of federal court records and dockets.',
                  url: () => submitted ? `https://www.courtlistener.com/?q=${enc(fullName)}&type=r` : '',
                  label: 'Search →',
                },
              ].map((svc) => (
                <div key={svc.name} className="service-card">
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">{svc.label}</a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Sex Offender Registry */}
          <div className="section-wrap">
            <div className="section-label">Sex Offender Registry</div>
            <div className="services-grid">
              {[
                {
                  name: 'National Sex Offender Public Website',
                  badge: 'DOJ — Federal',
                  badgeColor: '#ff6060',
                  desc: 'Official U.S. Department of Justice national sex offender search. Searches all 50 states, DC, and U.S. territories simultaneously.',
                  url: () => submitted ? `https://www.nsopw.gov/Search/Results?lang=en&sid=&bn=${enc(ln)}&fn=${enc(fn)}&state=${st !== 'Any' ? st : ''}&radius=1` : '',
                },
                {
                  name: 'Offender Radar',
                  badge: 'Aggregator',
                  badgeColor: '#1e9eff',
                  desc: 'Aggregated sex offender and criminal record search. Cross-references multiple state registries and public databases.',
                  url: () => submitted ? `https://offenderradar.com/search/people/${enc(fn)}-${enc(ln)}` : '',
                },
                {
                  name: "Megan's Law (CA)",
                  badge: 'California Only',
                  badgeColor: '#ffaa00',
                  desc: "California's official Megan's Law sex offender registry. Manual search on the official California DOJ site.",
                  url: () => 'https://www.meganslaw.ca.gov/',
                  manual: true,
                },
              ].map((svc) => (
                <div key={svc.name} className={`service-card${svc.manual ? ' warn-card' : ''}`}>
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {(submitted || svc.manual) ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className={`service-btn${svc.manual ? ' warn-btn' : ''}`}>
                      {svc.manual ? 'Open Registry →' : 'Search →'}
                    </a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Incarceration Records */}
          <div className="section-wrap">
            <div className="section-label">Incarceration Records</div>
            <div className="services-grid">
              {[
                {
                  name: 'Federal BOP Inmate Locator',
                  badge: 'Federal — Manual',
                  badgeColor: '#ffaa00',
                  desc: 'Official Bureau of Prisons inmate locator. Navigate to site and enter name to search federal inmates.',
                  url: () => 'https://www.bop.gov/inmateloc/',
                  manual: true,
                },
                {
                  name: 'VINELink National',
                  badge: 'Multi-State',
                  badgeColor: '#1e9eff',
                  desc: 'National victim notification network. Search current and past incarceration status across participating states and counties.',
                  url: () => submitted ? `https://vinelink.vineapps.com/search/US/Person?lastName=${enc(ln)}&firstName=${enc(fn)}` : '',
                },
                {
                  name: 'Find an Inmate (Federal)',
                  badge: 'BOP — Manual',
                  badgeColor: '#ffaa00',
                  desc: 'Alternate BOP federal inmate search interface. Search by name for current and released federal inmates.',
                  url: () => 'https://www.bop.gov/mobile/find_inmate/byname.jsp#inmate_results',
                  manual: true,
                },
                {
                  name: 'State DOC Search',
                  badge: st !== 'Any' ? st : 'State',
                  badgeColor: '#7a9bb5',
                  desc: `Search ${st !== 'Any' ? st : 'your state'}\'s Department of Corrections inmate database. Most states provide free online inmate locators.`,
                  url: () => submitted ? `https://www.google.com/search?q=${enc((st !== 'Any' ? st : '') + ' department of corrections inmate search')}` : '',
                },
              ].map((svc) => (
                <div key={svc.name} className={`service-card${svc.manual ? ' warn-card' : ''}`}>
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {(submitted || svc.manual) ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className={`service-btn${svc.manual ? ' warn-btn' : ''}`}>
                      {svc.manual ? 'Open Site →' : 'Search →'}
                    </a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Voter Registration */}
          <div className="section-wrap">
            <div className="section-label">Voter Registration Records</div>
            <div className="services-grid">
              {[
                {
                  name: voterLabel(),
                  badge: st !== 'Any' ? `${st} Official` : 'National',
                  badgeColor: '#00ff88',
                  desc: st !== 'Any' && VOTER_STATES[st]
                    ? `Official ${st} voter registration lookup. Direct link to the state\'s voter information portal.`
                    : 'National voter registration status lookup. Covers most U.S. states and provides registration verification.',
                  url: voterUrl,
                },
                {
                  name: 'Vote.org Lookup',
                  badge: 'All States',
                  badgeColor: '#00ff88',
                  desc: 'Nonpartisan voter registration status checker. Covers all 50 states and provides registration status, polling place, and more.',
                  url: () => 'https://www.vote.org/voter-registration-status/',
                },
                {
                  name: 'NCOA Voter Records',
                  badge: 'Multi-State',
                  badgeColor: '#7a9bb5',
                  desc: 'Search voter registration records across multiple states. Useful for confirming registration status and addresses.',
                  url: () => submitted ? `https://www.google.com/search?q=${enc(fullName + ' voter registration ' + (st !== 'Any' ? st : ''))}` : '',
                },
              ].map((svc) => (
                <div key={svc.name} className="service-card">
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Open →</a>
                  ) : (
                    <span className="service-btn disabled">Open →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Vital & Death Records */}
          <div className="section-wrap">
            <div className="section-label">Vital &amp; Death Records</div>
            <div className="services-grid">
              {[
                {
                  name: 'FindAGrave',
                  badge: 'Obituaries + Graves',
                  badgeColor: '#7a9bb5',
                  desc: 'World\'s largest gravesite collection. Search for obituaries, memorial pages, and burial records. Often contains biographical data.',
                  url: () => submitted ? `https://www.findagrave.com/memorial/search?firstname=${enc(fn)}&lastname=${enc(ln)}` : '',
                },
                {
                  name: 'Social Security Death Index',
                  badge: 'Ancestry.com',
                  badgeColor: '#7a9bb5',
                  desc: 'SSDI records via Ancestry. Contains death records for people whose deaths were reported to the Social Security Administration since 1936.',
                  url: () => submitted ? `https://www.ancestry.com/search/collections/3693/?name=${enc(fn)}_${enc(ln)}` : '',
                },
                {
                  name: 'BillionGraves',
                  badge: 'Global Records',
                  badgeColor: '#7a9bb5',
                  desc: 'GPS-tagged headstone photos and transcriptions. Searchable database of burial records from cemeteries worldwide.',
                  url: () => submitted ? `https://billiongraves.com/search/${enc(fn)}+${enc(ln)}` : '',
                },
              ].map((svc) => (
                <div key={svc.name} className="service-card">
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>
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
