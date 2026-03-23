'use client';
import { useState } from 'react';

const US_STATES = [
  { abbr: '', label: 'Select State' },
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

export default function AddressLookup() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<'address' | 'name'>('address');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrSubmitted, setAddrSubmitted] = useState<{ street: string; city: string; state: string } | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameState, setNameState] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState<{ fn: string; ln: string; state: string } | null>(null);

  const enc = (s: string) => encodeURIComponent(s);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  const handleAddrSubmit = () => {
    if (!street.trim() || !city.trim()) return;
    setAddrSubmitted({ street: street.trim(), city: city.trim(), state: addrState });
  };
  const handleNameSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setNameSubmitted({ fn: firstName.trim(), ln: lastName.trim(), state: nameState });
  };

  const a = addrSubmitted;
  const fullAddr = a ? `${a.street}, ${a.city}${a.state ? ', ' + a.state : ''}` : '';
  const streetSlug = a ? slug(a.street) : '';
  const citySlug = a ? slug(a.city) : '';
  const n = nameSubmitted;

  type CardColor = 'blue' | 'green' | 'orange';
  const colorMap: Record<CardColor, { border: string; btn: string; btnBorder: string }> = {
    green:  { border: '#00ff88', btn: '#00ff88', btnBorder: 'rgba(0,255,136,0.4)' },
    blue:   { border: '#1e9eff', btn: '#1e9eff', btnBorder: 'rgba(30,158,255,0.4)' },
    orange: { border: '#ffaa00', btn: '#ffaa00', btnBorder: 'rgba(255,170,0,0.4)' },
  };

  const addrServices: { name: string; what: string; color: CardColor; url: () => string }[] = [
    { name: 'TruePeopleSearch', what: 'Who lives here — residents, history, relatives', color: 'green',
      url: () => `https://www.truepeoplesearch.com/results?streetaddress=${enc(a!.street)}&citystatezip=${enc(a!.city + (a!.state ? ' ' + a!.state : ''))}` },
    { name: 'FastPeopleSearch', what: 'Reverse address — current and past residents', color: 'green',
      url: () => `https://www.fastpeoplesearch.com/address/${streetSlug}_${citySlug}${a!.state ? '_' + a!.state : ''}` },
    { name: 'WhitePages Reverse', what: 'Current residents and phone numbers', color: 'blue',
      url: () => `https://www.whitepages.com/address/${streetSlug}/${citySlug}${a!.state ? '-' + a!.state : ''}` },
    { name: 'Radaris', what: 'Property history, residents, ownership', color: 'blue',
      url: () => `https://radaris.com/address/${enc(a!.street)}/${enc(a!.city)}/${a!.state || ''}/` },
    { name: 'Google Maps Satellite', what: 'Aerial view of the property', color: 'blue',
      url: () => `https://www.google.com/maps/search/${enc(fullAddr)}` },
    { name: 'Google Street View', what: 'Street-level exterior imagery', color: 'blue',
      url: () => `https://www.google.com/maps?q=${enc(fullAddr)}&layer=c` },
    { name: 'Zillow', what: 'Property value, owner history, listing data', color: 'blue',
      url: () => `https://www.zillow.com/homes/${enc(fullAddr)}_rb/` },
    { name: 'Redfin', what: 'Sale history, property records, estimated value', color: 'blue',
      url: () => `https://www.redfin.com/search#location=${enc(fullAddr)}` },
    { name: 'County Assessor', what: 'Official tax records — owner, valuation, lot size', color: 'orange',
      url: () => `https://www.google.com/search?q=${enc((a!.city || '') + ' ' + (a!.state || '') + ' county assessor property search ' + a!.street)}` },
  ];

  const nameServices: { name: string; what: string; color: CardColor; url: () => string }[] = [
    { name: 'TruePeopleSearch', what: 'Current and past addresses — free, no paywall', color: 'green',
      url: () => `https://www.truepeoplesearch.com/results?name=${enc(n!.fn + ' ' + n!.ln)}${n!.state ? `&citystatezip=${enc(n!.state)}` : ''}` },
    { name: 'FamilyTreeNow', what: 'Addresses + DOB + relatives — completely free', color: 'green',
      url: () => `https://www.familytreenow.com/search/genealogy/results?first=${enc(n!.fn)}&last=${enc(n!.ln)}${n!.state ? `&state=${enc(n!.state)}` : ''}` },
    { name: 'FastPeopleSearch', what: 'Current address, age, household members', color: 'green',
      url: () => `https://www.fastpeoplesearch.com/name/${slug(n!.fn)}-${slug(n!.ln)}${n!.state ? '_' + n!.state : ''}` },
    { name: 'Radaris', what: 'Full address history and previous locations', color: 'blue',
      url: () => `https://radaris.com/p/${enc(n!.fn)}/${enc(n!.ln)}/` },
    { name: 'WhitePages', what: 'Address and phone number by name and state', color: 'blue',
      url: () => n!.state ? `https://www.whitepages.com/name/${slug(n!.fn)}-${slug(n!.ln)}/${n!.state}` : `https://www.whitepages.com/name/${slug(n!.fn)}-${slug(n!.ln)}` },
    { name: 'ZabaSearch', what: 'Public record address search by name', color: 'blue',
      url: () => `https://www.zabasearch.com/people/${enc(n!.fn)}+${enc(n!.ln)}/${n!.state ? enc(n!.state) : ''}` },
  ];

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
        .tab-row { display: flex; gap: 2px; margin-bottom: 28px; }
        .tab-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 10px 24px; border: 1px solid rgba(30,158,255,0.2); background: none; color: #3d5870; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.4); color: #1e9eff; }
        .tab-btn:hover:not(.active) { border-color: rgba(30,158,255,0.3); color: #c0cfe0; }
        .form-grid { display: grid; gap: 12px; margin-bottom: 32px; align-items: end; }
        .fg-addr { grid-template-columns: 2fr 1fr 0.6fr auto; }
        .fg-name { grid-template-columns: 1fr 1fr 1fr auto; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(30,158,255,0.6); }
        .form-input::placeholder { color: #2d4055; }
        .form-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 14px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; cursor: pointer; }
        .run-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; white-space: nowrap; height: 49px; transition: background 0.3s; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .target-bar { padding: 14px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #1e9eff; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 24px; display: flex; flex-direction: column; gap: 10px; }
        .card-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; }
        .card-what { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .card-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: 1px solid; background: none; padding: 8px 18px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .card-btn.disabled { color: #3d5870 !important; border-color: rgba(30,158,255,0.1) !important; cursor: not-allowed; pointer-events: none; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @media (max-width: 900px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } .fg-addr,.fg-name { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .fg-addr,.fg-name { grid-template-columns: 1fr; } .cards-grid { grid-template-columns: 1fr; }
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
            <div className="eyebrow"><div className="eyebrow-line" /><div className="eyebrow-text">Location Intelligence</div></div>
            <div className="tool-title">Address &amp; Property Lookup</div>
            <p className="tool-desc">Two modes: look up who lives at a specific address, or find all known addresses linked to a person's name. Searches public records, property databases, and people-search aggregators.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="tab-row">
            <button className={`tab-btn${tab === 'address' ? ' active' : ''}`} onClick={() => setTab('address')}>By Address — Who Lives Here?</button>
            <button className={`tab-btn${tab === 'name' ? ' active' : ''}`} onClick={() => setTab('name')}>By Name — Find Addresses</button>
          </div>

          {tab === 'address' && (
            <>
              <div className="form-grid fg-addr">
                <div className="form-field">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" placeholder="123 Main St" value={street} onChange={e => setStreet(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddrSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">City *</label>
                  <input className="form-input" placeholder="Dallas" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddrSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">State</label>
                  <select className="form-select" value={addrState} onChange={e => setAddrState(e.target.value)}>
                    {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.abbr || '—'}</option>)}
                  </select>
                </div>
                <button className="run-btn" onClick={handleAddrSubmit} disabled={!street.trim() || !city.trim()}>Search →</button>
              </div>
              {addrSubmitted && <div className="target-bar"><div className="target-label">Address</div><div className="target-value">{fullAddr}</div></div>}
              <div className="section-label">Address Search Results</div>
              <div className="cards-grid">
                {addrServices.map(svc => {
                  const c = colorMap[svc.color];
                  return (
                    <div key={svc.name} className="card" style={{borderTop: `2px solid ${c.border}`}}>
                      <div className="card-name">{svc.name}</div>
                      <div className="card-what">{svc.what}</div>
                      {addrSubmitted
                        ? <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="card-btn" style={{color: c.btn, borderColor: c.btnBorder}}>Search →</a>
                        : <span className="card-btn disabled">Search →</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'name' && (
            <>
              <div className="form-grid fg-name">
                <div className="form-field">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">State (optional)</label>
                  <select className="form-select" value={nameState} onChange={e => setNameState(e.target.value)}>
                    {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
                  </select>
                </div>
                <button className="run-btn" onClick={handleNameSubmit} disabled={!firstName.trim() || !lastName.trim()}>Search →</button>
              </div>
              {nameSubmitted && <div className="target-bar"><div className="target-label">Subject</div><div className="target-value">{n!.fn} {n!.ln}{n!.state ? ` — ${n!.state}` : ''}</div></div>}
              <div className="section-label">Address Search Results</div>
              <div className="cards-grid">
                {nameServices.map(svc => {
                  const c = colorMap[svc.color];
                  return (
                    <div key={svc.name} className="card" style={{borderTop: `2px solid ${c.border}`}}>
                      <div className="card-name">{svc.name}</div>
                      <div className="card-what">{svc.what}</div>
                      {nameSubmitted
                        ? <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="card-btn" style={{color: c.btn, borderColor: c.btnBorder}}>Search →</a>
                        : <span className="card-btn disabled">Search →</span>}
                    </div>
                  );
                })}
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
