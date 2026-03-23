'use client';
import { useState } from 'react';

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

// Voter record lookup URLs by state (states with public self-lookup)
const VOTER_URLS: Record<string, string> = {
  AZ: 'https://my.arizona.vote/PortalList.aspx',
  CO: 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
  FL: 'https://registration.elections.myflorida.com/CheckVoterStatus',
  GA: 'https://mvp.sos.ga.gov/s/voter-registration-overview',
  MI: 'https://mvic.sos.state.mi.us/Voter/Index',
  NC: 'https://vt.ncsbe.gov/RegLkup/',
  OH: 'https://voterlookup.ohiosos.gov/voterlookup.aspx',
  TX: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
  VA: 'https://vote.elections.virginia.gov/VoterInformation/PublicContactLookup',
  WA: 'https://voter.votewa.gov/WhereToVote.aspx',
  WI: 'https://myvote.wi.gov/en-us/Find-My-Polling-Place',
};

export default function BackgroundCheck() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [submitted, setSubmitted] = useState<{ fn: string; ln: string; state: string } | null>(null);

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSubmitted({ fn: firstName.trim(), ln: lastName.trim(), state });
  };

  const fn = submitted?.fn || '';
  const ln = submitted?.ln || '';
  const st = submitted?.state || '';
  const enc = (s: string) => encodeURIComponent(s);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  type CardColor = 'blue' | 'green' | 'orange' | 'red';

  const services: { name: string; what: string; color: CardColor; manual?: boolean; url: () => string }[] = [
    {
      name: 'TruePeopleSearch',
      what: 'Address history, age, relatives — free & no paywall',
      color: 'green',
      url: () => `https://www.truepeoplesearch.com/results?name=${enc(fn + ' ' + ln)}${st ? `&citystatezip=${enc(st)}` : ''}`,
    },
    {
      name: 'FamilyTreeNow',
      what: 'Full date of birth, addresses, relatives — free',
      color: 'green',
      url: () => `https://www.familytreenow.com/search/genealogy/results?first=${enc(fn)}&last=${enc(ln)}${st ? `&state=${enc(st)}` : ''}`,
    },
    {
      name: 'FastPeopleSearch',
      what: 'Current address, age, relatives — free',
      color: 'green',
      url: () => `https://www.fastpeoplesearch.com/name/${slug(fn)}-${slug(ln)}${st ? `_${st}` : ''}`,
    },
    {
      name: 'Radaris',
      what: 'Address history, age, phone, social profiles',
      color: 'blue',
      url: () => `https://radaris.com/p/${enc(fn)}/${enc(ln)}/`,
    },
    {
      name: 'WhitePages',
      what: 'Phone numbers, addresses, age',
      color: 'blue',
      url: () => st
        ? `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}/${st}`
        : `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}`,
    },
    {
      name: 'Spokeo',
      what: 'Social profiles, addresses, phone, relatives',
      color: 'blue',
      url: () => st
        ? `https://www.spokeo.com/${slug(fn)}-${slug(ln)}/${st}`
        : `https://www.spokeo.com/${slug(fn)}-${slug(ln)}`,
    },
    {
      name: 'PeekYou',
      what: 'Social media + public web profile aggregator',
      color: 'blue',
      url: () => `https://www.peekyou.com/${enc(fn)}_${enc(ln)}`,
    },
    {
      name: 'Pipl',
      what: 'Deep web profiles, professional records',
      color: 'blue',
      url: () => `https://pipl.com/search/?q=${enc(fn + ' ' + ln)}${st ? `&sloc=US-${st}` : '&sloc=US'}`,
    },
    {
      name: 'BeenVerified',
      what: 'Criminal records, addresses, social — paid',
      color: 'orange',
      url: () => `https://www.beenverified.com/people/${slug(fn)}-${slug(ln)}/`,
    },
    {
      name: 'Intelius',
      what: 'Background check, criminal history — paid',
      color: 'orange',
      url: () => `https://www.intelius.com/people-search/${slug(fn)}-${slug(ln)}/`,
    },
    {
      name: 'Sex Offender Registry',
      what: 'National public sex offender registry (NSOPW)',
      color: 'red',
      url: () => `https://www.nsopw.gov/Search/Results?lang=en&bn=${enc(ln)}&fn=${enc(fn)}${st ? `&state=${st}` : ''}&radius=1`,
    },
    {
      name: 'Federal Inmate Locator',
      what: 'BOP federal prison inmate search — paste name on site',
      color: 'red',
      manual: true,
      url: () => 'https://www.bop.gov/inmateloc/',
    },
    {
      name: 'CourtListener',
      what: 'Federal court cases — PACER/RECAP filings',
      color: 'blue',
      url: () => `https://www.courtlistener.com/?q=${enc('"' + fn + ' ' + ln + '"')}&type=r&order_by=score+desc`,
    },
    {
      name: 'Google Search',
      what: 'Surface web presence — news, profiles, mentions',
      color: 'blue',
      url: () => `https://www.google.com/search?q=${enc('"' + fn + ' ' + ln + '"')}${st ? `+${enc(st)}` : ''}`,
    },
  ];

  // Add voter record link if state selected and supported
  const voterUrl = st && VOTER_URLS[st] ? VOTER_URLS[st] : null;

  const colorMap: Record<CardColor, { border: string; badge: string; badgeBg: string; btn: string; btnBorder: string; btnHoverBg: string }> = {
    green:  { border: '#00ff88', badge: '#00ff88', badgeBg: 'rgba(0,255,136,0.08)', btn: '#00ff88', btnBorder: 'rgba(0,255,136,0.4)', btnHoverBg: 'rgba(0,255,136,0.1)' },
    blue:   { border: '#1e9eff', badge: '#1e9eff', badgeBg: 'rgba(30,158,255,0.08)', btn: '#1e9eff', btnBorder: 'rgba(30,158,255,0.4)', btnHoverBg: 'rgba(30,158,255,0.1)' },
    orange: { border: '#ffaa00', badge: '#ffaa00', badgeBg: 'rgba(255,170,0,0.08)', btn: '#ffaa00', btnBorder: 'rgba(255,170,0,0.4)', btnHoverBg: 'rgba(255,170,0,0.1)' },
    red:    { border: '#ff4444', badge: '#ff4444', badgeBg: 'rgba(255,68,68,0.08)', btn: '#ff4444', btnBorder: 'rgba(255,68,68,0.4)', btnHoverBg: 'rgba(255,68,68,0.1)' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
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
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(30,158,255,0.6); }
        .form-input::placeholder { color: #2d4055; }
        .form-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; cursor: pointer; }
        .run-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; height: 49px; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: #1a3a52; color: #5a7a94; cursor: not-allowed; }
        .target-bar { padding: 14px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #1e9eff; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 40px; }
        .card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
        .card:hover { border-color: rgba(30,158,255,0.25); }
        .card-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .card-what { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .card-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: 1px solid; background: none; padding: 8px 18px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .card-btn.disabled { color: #5a7a94; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .voter-box { background: #0a1520; border: 1px solid rgba(0,255,136,0.2); padding: 20px 24px; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .voter-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; margin-bottom: 4px; }
        .voter-desc { font-size: 13px; color: #9ab0c4; }
        .voter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #00ff88; border: 1px solid rgba(0,255,136,0.4); background: none; padding: 10px 24px; cursor: pointer; transition: all 0.2s; text-decoration: none; white-space: nowrap; }
        .voter-btn:hover { background: rgba(0,255,136,0.08); }
        .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #7a9bb5; text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr 1fr; } .cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; } .cards-grid { grid-template-columns: 1fr; }
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
            <div className="eyebrow"><div className="eyebrow-line" /><div className="eyebrow-text">People Intelligence</div></div>
            <div className="tool-title">Background Check Hub</div>
            <p className="tool-desc">Enter a name to launch searches across public records databases — addresses, date of birth, relatives, criminal history, court records, and sex offender registries.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input className="form-input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name *</label>
              <input className="form-input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">State (optional)</label>
              <select className="form-select" value={state} onChange={e => setState(e.target.value)}>
                {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
              </select>
            </div>
            <button className="run-btn" onClick={handleSubmit} disabled={!firstName.trim() || !lastName.trim()}>
              Search →
            </button>
          </div>

          {submitted && (
            <div className="target-bar">
              <div className="target-label">Subject</div>
              <div className="target-value">{fn} {ln}{st ? ` — ${st}` : ''}</div>
            </div>
          )}

          {/* Voter record shortcut when state is selected */}
          {submitted && voterUrl && (
            <div style={{marginBottom: '12px'}}>
              <div className="section-label">Voter Registration — {st} (may include DOB + address)</div>
            </div>
          )}
          {submitted && voterUrl && (
            <div className="voter-box">
              <div>
                <div className="voter-label">{st} Voter Records</div>
                <div className="voter-desc">Many state voter records include date of birth, current address, and party registration. Navigate to the site and search by name.</div>
              </div>
              <a href={voterUrl} target="_blank" rel="noopener noreferrer" className="voter-btn">Open Lookup →</a>
            </div>
          )}

          <div className="section-label">Public Records Databases</div>

          <div className="legend">
            <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88'}} />Free — no paywall</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'#1e9eff'}} />Free partial / signup required</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'#ffaa00'}} />Paid service</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'#ff4444'}} />Criminal / safety records</div>
          </div>

          <div className="cards-grid">
            {services.map((svc) => {
              const c = colorMap[svc.color];
              return (
                <div key={svc.name} className="card" style={{borderTop: `2px solid ${c.border}`}}>
                  <div className="card-name">{svc.name}</div>
                  <div className="card-what">{svc.what}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="card-btn"
                      style={{color: c.btn, borderColor: c.btnBorder}}>
                      {svc.manual ? 'Open Site →' : 'Search →'}
                    </a>
                  ) : (
                    <span className="card-btn disabled">Search →</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </div>
    </>
  );
}
