'use client';
import { useState, useCallback } from 'react';

const US_STATES = [
  { abbr: '', label: 'Any State' },
  { abbr: 'AL', label: 'Alabama' }, { abbr: 'AK', label: 'Alaska' }, { abbr: 'AZ', label: 'Arizona' },
  { abbr: 'AR', label: 'Arkansas' }, { abbr: 'CA', label: 'California' }, { abbr: 'CO', label: 'Colorado' },
  { abbr: 'CT', label: 'Connecticut' }, { abbr: 'DE', label: 'Delaware' }, { abbr: 'FL', label: 'Florida' },
  { abbr: 'GA', label: 'Georgia' }, { abbr: 'HI', label: 'Hawaii' }, { abbr: 'ID', label: 'Idaho' },
  { abbr: 'IL', label: 'Illinois' }, { abbr: 'IN', label: 'Indiana' }, { abbr: 'IA', label: 'Iowa' },
  { abbr: 'KS', label: 'Kansas' }, { abbr: 'KY', label: 'Kentucky' }, { abbr: 'LA', label: 'Louisiana' },
  { abbr: 'ME', label: 'Maine' }, { abbr: 'MD', label: 'Maryland' }, { abbr: 'MA', label: 'Massachusetts' },
  { abbr: 'MI', label: 'Michigan' }, { abbr: 'MN', label: 'Minnesota' }, { abbr: 'MS', label: 'Mississippi' },
  { abbr: 'MO', label: 'Missouri' }, { abbr: 'MT', label: 'Montana' }, { abbr: 'NE', label: 'Nebraska' },
  { abbr: 'NV', label: 'Nevada' }, { abbr: 'NH', label: 'New Hampshire' }, { abbr: 'NJ', label: 'New Jersey' },
  { abbr: 'NM', label: 'New Mexico' }, { abbr: 'NY', label: 'New York' }, { abbr: 'NC', label: 'North Carolina' },
  { abbr: 'ND', label: 'North Dakota' }, { abbr: 'OH', label: 'Ohio' }, { abbr: 'OK', label: 'Oklahoma' },
  { abbr: 'OR', label: 'Oregon' }, { abbr: 'PA', label: 'Pennsylvania' }, { abbr: 'RI', label: 'Rhode Island' },
  { abbr: 'SC', label: 'South Carolina' }, { abbr: 'SD', label: 'South Dakota' }, { abbr: 'TN', label: 'Tennessee' },
  { abbr: 'TX', label: 'Texas' }, { abbr: 'UT', label: 'Utah' }, { abbr: 'VT', label: 'Vermont' },
  { abbr: 'VA', label: 'Virginia' }, { abbr: 'WA', label: 'Washington' }, { abbr: 'WV', label: 'West Virginia' },
  { abbr: 'WI', label: 'Wisconsin' }, { abbr: 'WY', label: 'Wyoming' },
];

interface FecRecord {
  contributor_name?: string;
  contributor_city?: string;
  contributor_state?: string;
  contributor_zip?: string;
  contributor_employer?: string;
  contributor_occupation?: string;
  contribution_receipt_amount?: number;
  contribution_receipt_date?: string;
  committee?: { name?: string };
}

interface CourtRecord {
  case_name?: string;
  court?: string;
  date_filed?: string;
  absolute_url?: string;
  docket_number?: string;
}


function fmt(d?: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
}

export default function PersonLookup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [fecResults, setFecResults] = useState<FecRecord[]>([]);
  const [fecError, setFecError] = useState('');

  const [courtResults, setCourtResults] = useState<CourtRecord[]>([]);
  const [courtError, setCourtError] = useState('');

  const [activeProfile, setActiveProfile] = useState<number | null>(null);


  const enc = (s: string) => encodeURIComponent(s);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  const runSearch = useCallback(async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) return;

    setLoading(true);
    setSearched(false);
    setFecResults([]);
    setFecError('');
    setCourtResults([]);
    setCourtError('');
    setActiveProfile(null);

    const fullName = `${fn} ${ln}`;

    const [fecRes, courtRes] = await Promise.allSettled([
      fetch(`/api/osint/fec?name=${enc(fullName)}${state ? `&state=${enc(state)}` : ''}`).then(r => r.json()),
      fetch(`/api/osint/courtlistener?q=${enc('"' + fullName + '"')}&type=r`).then(r => r.json()),
    ]);

    if (fecRes.status === 'fulfilled') {
      if (fecRes.value.error) setFecError(fecRes.value.error);
      else setFecResults(fecRes.value.results || []);
    } else {
      setFecError('FEC lookup failed');
    }

    if (courtRes.status === 'fulfilled') {
      if (courtRes.value.error) setCourtError(courtRes.value.error);
      else setCourtResults(courtRes.value.results || []);
    } else {
      setCourtError('Court lookup failed');
    }

    setLoading(false);
    setSearched(true);
  }, [firstName, lastName, state]);

  const fn = firstName.trim();
  const ln = lastName.trim();
  const fullName = fn && ln ? `${fn} ${ln}` : '';

  // Deduplicate FEC by state + 5-digit zip prefix (same person may have zip+4 variants)
  const uniqueLocations = fecResults.reduce<{ city: string; state: string; zip: string; employer: string; occupation: string }[]>((acc, r) => {
    const zip5 = (r.contributor_zip || '').slice(0, 5);
    const key = `${r.contributor_state}|${zip5}`;
    const existing = acc.find(x => `${x.state}|${x.zip.slice(0, 5)}` === key);
    if (!existing) {
      acc.push({
        city: r.contributor_city || '—',
        state: r.contributor_state || '—',
        zip: zip5 || '—',
        employer: r.contributor_employer || '—',
        occupation: r.contributor_occupation || '—',
      });
    } else {
      // Fill in employer/occupation if the existing slot is blank
      if (existing.employer === '—' && r.contributor_employer) existing.employer = r.contributor_employer;
      if (existing.occupation === '—' && r.contributor_occupation) existing.occupation = r.contributor_occupation;
    }
    return acc;
  }, []);

  const activeLocation = activeProfile !== null ? uniqueLocations[activeProfile] : null;
  const filteredFecResults = activeLocation
    ? fecResults.filter(r =>
        r.contributor_city === activeLocation.city &&
        r.contributor_state === activeLocation.state &&
        r.contributor_zip === activeLocation.zip
      )
    : fecResults;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { text-decoration: none; } .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
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
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(30,158,255,0.6); }
        .form-input::placeholder { color: #2d4055; }
        .form-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; cursor: pointer; }
        .run-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 0 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; height: 49px; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .loading-bar { padding: 24px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); margin-bottom: 24px; }
        .section-hdr { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; padding-bottom: 10px; border-bottom: 1px solid rgba(30,158,255,0.1); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .section-count { font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .section-wrap { margin-bottom: 40px; }
        .empty-state { padding: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; background: #0a1520; border: 1px solid rgba(30,158,255,0.06); text-align: center; }
        .error-state { padding: 20px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 1px; color: #ff6060; background: rgba(255,60,60,0.04); border: 1px solid rgba(255,60,60,0.15); }
        .disambig-banner { background: rgba(30,158,255,0.04); border: 1px solid rgba(30,158,255,0.2); padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .disambig-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .disambig-sub { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #3d5870; margin-top: 4px; }
        .show-all-btn { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #7a9bb5; background: none; border: 1px solid rgba(122,155,181,0.3); padding: 6px 14px; cursor: pointer; text-transform: uppercase; white-space: nowrap; transition: all 0.2s; }
        .show-all-btn:hover { color: #c0cfe0; border-color: rgba(192,207,224,0.4); }
        .loc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-bottom: 16px; }
        .loc-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); border-top: 2px solid #1e9eff; padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .loc-card:hover { border-color: rgba(30,158,255,0.35); background: #0d1e30; }
        .loc-card.active { border-color: #1e9eff; background: #0d1e30; border-top-width: 3px; }
        .loc-card.inactive { opacity: 0.35; }
        .loc-field { display: flex; flex-direction: column; gap: 3px; }
        .loc-key { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .loc-val { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c0cfe0; letter-spacing: 0.5px; }
        .loc-val.highlight { color: #1e9eff; }
        .fec-table-wrap { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); overflow: auto; }
        .fec-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .fec-table th { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; padding: 12px 16px; text-align: left; background: rgba(30,158,255,0.04); border-bottom: 1px solid rgba(30,158,255,0.12); white-space: nowrap; }
        .fec-table td { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ab0c4; padding: 11px 16px; border-bottom: 1px solid rgba(30,158,255,0.05); letter-spacing: 0.5px; }
        .fec-table tr:last-child td { border-bottom: none; }
        .fec-table tr:hover td { background: rgba(30,158,255,0.02); }
        .fec-table td.name-col { color: #c0cfe0; font-weight: 500; }
        .fec-table td.amount-col { color: #00ff88; }
        .court-list { display: flex; flex-direction: column; gap: 2px; }
        .court-item { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .court-item:hover { border-color: rgba(30,158,255,0.25); }
        .court-case { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 600; color: #c0cfe0; }
        .court-case a { color: #c0cfe0; text-decoration: none; }
        .court-case a:hover { color: #1e9eff; }
        .court-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .court-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
        .court-meta-item span { color: #7a9bb5; }
        .sources-note { margin-top: 8px; padding: 14px 20px; background: rgba(30,158,255,0.03); border: 1px solid rgba(30,158,255,0.1); }
        .sources-note-text { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1.5px; color: #3d5870; line-height: 1.8; }
        .sources-note-text strong { color: #7a9bb5; }
        .deepdive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .dd-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .dd-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; color: #c0cfe0; }
        .dd-what { font-family: 'Barlow', sans-serif; font-size: 11px; color: #7a9bb5; flex: 1; }
        .dd-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 7px 16px; cursor: pointer; text-decoration: none; display: inline-block; align-self: flex-start; transition: all 0.2s; }
        .dd-btn:hover { background: rgba(30,158,255,0.08); }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @media (max-width: 900px) { .form-row { grid-template-columns: 1fr 1fr; } .loc-grid { grid-template-columns: 1fr; } .deepdive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .form-row { grid-template-columns: 1fr; } .deepdive-grid { grid-template-columns: 1fr; }
          .loc-card { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; } .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(o => !o)}><span /><span /><span /></div>
        </nav>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>
        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" /><div className="eyebrow-text">Person Intelligence</div></div>
            <div className="tool-title">Person Lookup</div>
            <p className="tool-desc">Enter a name to pull real public records directly onto this page — campaign finance filings (city, state, zip, employer), federal court appearances, and more. Data sourced live from FEC and CourtListener.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input className="form-input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name *</label>
              <input className="form-input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} />
            </div>
            <div className="form-field">
              <label className="form-label">State (optional)</label>
              <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
              </select>
            </div>
            <button className="run-btn" onClick={runSearch} disabled={loading || !firstName.trim() || !lastName.trim()}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>

          {loading && <div className="loading-bar">Querying FEC campaign finance + federal court records...</div>}

          {searched && !loading && (
            <>
              {/* ── FEC Campaign Finance / Address Data ── */}
              <div className="section-wrap">
                <div className="section-hdr">
                  <span>Campaign Finance Records — City, State, ZIP, Employer</span>
                  <span className="section-count">{fecResults.length} records · employer is self-reported</span>
                </div>

                {fecError && (
                  <div className="error-state">
                    {fecError === 'FEC_RATE_LIMIT'
                      ? 'FEC rate limit hit — the demo API key only allows 40 requests/hour. Get a free key at api.data.gov/signup and add it as FEC_API_KEY in your Vercel environment variables.'
                      : fecError}
                  </div>
                )}

                {!fecError && fecResults.length === 0 && (
                  <div className="empty-state">No FEC campaign finance records found for {fullName}{state ? ` in ${state}` : ''}. This source only covers individuals who have donated $200+ to federal political campaigns.</div>
                )}

                {uniqueLocations.length > 1 && (
                  <div className="disambig-banner">
                    <div>
                      <div className="disambig-label">{uniqueLocations.length} different people found</div>
                      <div className="disambig-sub">Click a location card below to focus on one person — or show all records.</div>
                    </div>
                    {activeProfile !== null && (
                      <button className="show-all-btn" onClick={() => setActiveProfile(null)}>Show All</button>
                    )}
                  </div>
                )}

                {uniqueLocations.length > 0 && (
                  <>
                    <div style={{fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase', marginBottom: '10px'}}>
                      {uniqueLocations.length > 1 ? 'Select a Person — Click to Filter' : 'Known Location'}
                    </div>
                    <div className="loc-grid">
                      {uniqueLocations.map((loc, i) => {
                        const cardClass = activeProfile === null ? 'loc-card' : activeProfile === i ? 'loc-card active' : 'loc-card inactive';
                        return (
                          <div key={i} className={cardClass} onClick={() => setActiveProfile(activeProfile === i ? null : i)}>
                            <div className="loc-field">
                              <div className="loc-key">City</div>
                              <div className="loc-val highlight">{loc.city}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">State</div>
                              <div className="loc-val highlight">{loc.state}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">ZIP</div>
                              <div className="loc-val">{loc.zip}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">Employer</div>
                              <div className="loc-val">{loc.employer}</div>
                            </div>
                            <div className="loc-field" style={{gridColumn: '1 / -1'}}>
                              <div className="loc-key">Occupation</div>
                              <div className="loc-val">{loc.occupation}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {filteredFecResults.length > 0 && (
                  <>
                    <div style={{fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase', margin: '16px 0 10px'}}>
                      {activeProfile !== null ? `Donation History — ${activeLocation?.city}, ${activeLocation?.state}` : 'Full Donation History'}
                    </div>
                    <div className="fec-table-wrap">
                      <table className="fec-table">
                        <thead>
                          <tr>
                            <th>Name on Record</th>
                            <th>City</th>
                            <th>State</th>
                            <th>ZIP</th>
                            <th>Employer</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Committee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFecResults.map((r, i) => (
                            <tr key={i}>
                              <td className="name-col">{r.contributor_name || '—'}</td>
                              <td>{r.contributor_city || '—'}</td>
                              <td>{r.contributor_state || '—'}</td>
                              <td>{r.contributor_zip || '—'}</td>
                              <td>{r.contributor_employer || '—'}</td>
                              <td className="amount-col">{r.contribution_receipt_amount ? `$${r.contribution_receipt_amount.toLocaleString()}` : '—'}</td>
                              <td>{fmt(r.contribution_receipt_date)}</td>
                              <td>{r.committee?.name || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* ── Federal Court Records ── */}
              <div className="section-wrap">
                <div className="section-hdr">
                  <span>Federal Court Records — CourtListener / PACER</span>
                  <span className="section-count">{courtResults.length} cases found</span>
                </div>

                {courtError && <div className="error-state">{courtError}</div>}

                {!courtError && courtResults.length === 0 && (
                  <div className="empty-state">No federal court filings found for &quot;{fullName}&quot;. CourtListener indexes PACER federal court cases only — state court records require separate state-level searches.</div>
                )}

                {courtResults.length > 0 && (
                  <div className="court-list">
                    {courtResults.map((r, i) => (
                      <div key={i} className="court-item">
                        <div className="court-case">
                          {r.absolute_url
                            ? <a href={`https://www.courtlistener.com${r.absolute_url}`} target="_blank" rel="noopener noreferrer">{r.case_name || 'Unnamed Case'}</a>
                            : (r.case_name || 'Unnamed Case')}
                        </div>
                        <div className="court-meta">
                          {r.docket_number && <div className="court-meta-item">Docket: <span>{r.docket_number}</span></div>}
                          {r.court && <div className="court-meta-item">Court: <span>{r.court}</span></div>}
                          {r.date_filed && <div className="court-meta-item">Filed: <span>{fmt(r.date_filed)}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Data source note ── */}
              <div className="sources-note" style={{marginBottom: '40px'}}>
                <div className="sources-note-text">
                  <strong>Data sources:</strong> Federal Election Commission (FEC) — all federal campaign contributions $200+ are public record per 52 U.S.C. §30102. CourtListener/PACER — federal court filings only. <strong>Limitations:</strong> FEC only covers political donors. Court records cover federal dockets only, not state courts, criminal records, or local courts. For deeper searches use the links below.
                </div>
              </div>

              {/* ── Deep dive links ── */}
              <div className="section-hdr" style={{marginBottom: '16px'}}><span>Go Deeper — External Databases</span></div>
              <div className="deepdive-grid">
                {[
                  { name: 'TruePeopleSearch', what: 'Address history, DOB, relatives — free, no paywall', url: `https://www.truepeoplesearch.com/results?name=${enc(fullName)}${state ? `&citystatezip=${enc(state)}` : ''}` },
                  { name: 'FamilyTreeNow', what: 'Full date of birth, addresses, relatives — free', url: `https://www.familytreenow.com/search/genealogy/results?first=${enc(fn)}&last=${enc(ln)}${state ? `&state=${enc(state)}` : ''}` },
                  { name: 'FastPeopleSearch', what: 'Current address, age, household members — free', url: `https://www.fastpeoplesearch.com/name/${slug(fn)}-${slug(ln)}${state ? '_' + state : ''}` },
                  { name: 'Radaris', what: 'Full address history and previous locations', url: `https://radaris.com/p/${enc(fn)}/${enc(ln)}/` },
                  { name: 'WhitePages', what: 'Address + phone number', url: state ? `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}/${state}` : `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}` },
                  { name: 'State Court Records', what: 'Criminal + civil — search your state court system', url: `https://www.google.com/search?q=${enc(fn + ' ' + ln + ' ' + (state || '') + ' court records criminal')}` },
                ].map(d => (
                  <div key={d.name} className="dd-card">
                    <div className="dd-name">{d.name}</div>
                    <div className="dd-what">{d.what}</div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="dd-btn">Open →</a>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
            <div className="footer-copy">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}
