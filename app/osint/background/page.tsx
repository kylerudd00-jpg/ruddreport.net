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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .form-select { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); cursor: pointer; }
        .run-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #fff; background: var(--accent); border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; height: 49px; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .target-bar { padding: 14px 20px; background: var(--bg-secondary); border: 1px solid var(--border); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .target-value { font-family: var(--font-mono); font-size: 14px; color: var(--accent); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 40px; }
        .card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
        .card:hover { border-color: var(--border-bright); }
        .card-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
        .card-what { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
        .card-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid; background: none; padding: 8px 18px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .card-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        .voter-box { background: var(--bg-card); border: 1px solid rgba(34,204,102,0.3); padding: 20px 24px; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .voter-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #22cc66; text-transform: uppercase; margin-bottom: 4px; }
        .voter-desc { font-size: 13px; color: var(--text-secondary); }
        .voter-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #22cc66; border: 1px solid rgba(34,204,102,0.4); background: none; padding: 10px 24px; cursor: pointer; transition: all 0.2s; text-decoration: none; white-space: nowrap; }
        .voter-btn:hover { background: rgba(34,204,102,0.1); }
        .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        @media (max-width: 900px) { .form-grid { grid-template-columns: 1fr 1fr; } .cards-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; } .cards-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; } .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" aria-hidden="true" /><div className="eyebrow-text">People Intelligence</div></div>
            <h1 className="tool-title">Background Check Hub</h1>
            <p className="tool-desc">Enter a name to launch searches across public records databases — addresses, date of birth, relatives, criminal history, court records, and sex offender registries.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input className="form-input" aria-label="First name" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name *</label>
              <input className="form-input" aria-label="Last name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">State (optional)</label>
              <select className="form-select" aria-label="State" value={state} onChange={e => setState(e.target.value)}>
                {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
              </select>
            </div>
            <button type="button" className="run-btn" onClick={handleSubmit} disabled={!firstName.trim() || !lastName.trim()}>
              Search →
            </button>
          </div>

          <div aria-live="polite">
            {submitted && (
              <div className="target-bar">
                <div className="target-label">Subject</div>
                <div className="target-value">{fn} {ln}{st ? ` — ${st}` : ''}</div>
              </div>
            )}

            {/* Voter record shortcut when state is selected */}
            {submitted && voterUrl && (
              <div style={{marginBottom: '12px'}}>
                <h2 className="section-label">Voter Registration — {st} (may include DOB + address)</h2>
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

            <h2 className="section-label">Public Records Databases</h2>

            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88'}} aria-hidden="true" />Free — no paywall</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#1e9eff'}} aria-hidden="true" />Free partial / signup required</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#ffaa00'}} aria-hidden="true" />Paid service</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#ff4444'}} aria-hidden="true" />Criminal / safety records</div>
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
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
