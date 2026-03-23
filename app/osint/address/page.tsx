'use client';
import { useState } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM',
  'NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA',
  'WV','WI','WY',
];

interface AddrSubmit { street: string; city: string; state: string; zip: string; }
interface NameSubmit { firstName: string; lastName: string; state: string; city: string; }

export default function AddressIntel() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'address' | 'name'>('address');

  // Address tab
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');
  const [addrSubmit, setAddrSubmit] = useState<AddrSubmit | null>(null);

  // Name tab
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nameState, setNameState] = useState('');
  const [nameCity, setNameCity] = useState('');
  const [nameSubmit, setNameSubmit] = useState<NameSubmit | null>(null);

  const enc = (s: string) => encodeURIComponent(s);

  const handleAddrSubmit = () => {
    if (!street.trim() || !city.trim()) return;
    setAddrSubmit({ street: street.trim(), city: city.trim(), state: addrState, zip: zip.trim() });
  };

  const handleNameSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setNameSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), state: nameState, city: nameCity.trim() });
  };

  const fullAddr = addrSubmit ? `${addrSubmit.street}, ${addrSubmit.city}${addrSubmit.state ? ', ' + addrSubmit.state : ''}${addrSubmit.zip ? ' ' + addrSubmit.zip : ''}` : '';
  const fn = nameSubmit?.firstName || '';
  const ln = nameSubmit?.lastName || '';

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
        .tab-row { display: flex; gap: 2px; margin-bottom: 32px; }
        .tab-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 28px; border: 1px solid rgba(30,158,255,0.2); background: none; color: #3d5870; cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.4); color: #1e9eff; }
        .tab-btn:hover:not(.active) { border-color: rgba(30,158,255,0.4); color: #c0cfe0; }
        .form-grid { display: grid; grid-template-columns: 2fr 1fr 0.5fr 0.5fr; gap: 12px; margin-bottom: 16px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
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
        .services-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .service-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); border-left: 3px solid #1e9eff; padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.3s; }
        .service-card:hover { border-color: rgba(30,158,255,0.35); border-left-color: #1e9eff; }
        .service-card.green-card { border-left-color: #00ff88; }
        .service-card.green-card:hover { border-left-color: #00ff88; }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .service-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .service-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 8px 18px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .service-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #1e9eff; letter-spacing: 1px; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @media (max-width: 1100px) {
          .services-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .form-grid { grid-template-columns: 1fr 1fr; }
          .form-grid-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .form-grid-3 { grid-template-columns: 1fr; }
          .services-grid { grid-template-columns: 1fr; }
          .services-grid-4 { grid-template-columns: 1fr; }
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
              <div className="tool-eyebrow-text">Property Intelligence</div>
            </div>
            <div className="tool-title">Address &amp; Property Intelligence</div>
            <p className="tool-desc">Search property ownership, assessed value, occupant history, aerial imagery, and reverse address lookups. Cross-reference an address against multiple public data aggregators or find addresses linked to a person.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="tab-row">
            <button className={`tab-btn${activeTab === 'address' ? ' active' : ''}`} onClick={() => setActiveTab('address')}>By Address</button>
            <button className={`tab-btn${activeTab === 'name' ? ' active' : ''}`} onClick={() => setActiveTab('name')}>By Name</button>
          </div>

          {/* ── BY ADDRESS TAB ── */}
          {activeTab === 'address' && (
            <>
              <div className="form-grid" style={{marginBottom: '12px'}}>
                <div className="form-field">
                  <label className="form-label">Street Address *</label>
                  <input className="form-input" placeholder="123 Main St" value={street} onChange={e => setStreet(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddrSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">City *</label>
                  <input className="form-input" placeholder="Springfield" value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddrSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">State</label>
                  <select className="form-select" value={addrState} onChange={e => setAddrState(e.target.value)}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">ZIP (optional)</label>
                  <input className="form-input" placeholder="62701" value={zip} onChange={e => setZip(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddrSubmit()} />
                </div>
              </div>
              <button className="run-btn" onClick={handleAddrSubmit} disabled={!street.trim() || !city.trim()} style={{marginBottom: '32px'}}>
                Search Address →
              </button>

              {addrSubmit && (
                <div className="target-display" style={{marginBottom: '32px'}}>
                  <div>
                    <div className="target-label">Target Address</div>
                    <div className="target-value">{fullAddr}</div>
                  </div>
                </div>
              )}

              {/* Property Records */}
              <div className="section-wrap">
                <div className="section-label">Property Records</div>
                <div className="services-grid-4">
                  {[
                    {
                      name: 'PropertyShark',
                      badge: 'Full Report',
                      badgeColor: '#1e9eff',
                      desc: 'Comprehensive property reports including ownership history, sales, mortgages, and tax records. Most major U.S. markets covered.',
                      url: () => addrSubmit ? `https://www.propertyshark.com/mason/Property-Reports/` : '',
                      label: 'Open Site →',
                    },
                    {
                      name: 'Zillow',
                      badge: 'Valuation',
                      badgeColor: '#1e9eff',
                      desc: 'Search Zillow for property details, Zestimate value, tax history, and sales history. Best for residential properties.',
                      url: () => addrSubmit ? `https://www.zillow.com/homes/${enc(addrSubmit.street + ' ' + addrSubmit.city + ' ' + addrSubmit.state)}_rb/` : '',
                      label: 'Search →',
                    },
                    {
                      name: 'Rehold',
                      badge: 'Ownership + Residents',
                      badgeColor: '#1e9eff',
                      desc: 'Free property ownership and occupant search. Shows current and past residents, ownership records, and property details.',
                      url: () => addrSubmit ? `https://rehold.com/search?q=${enc(fullAddr)}` : '',
                      label: 'Search →',
                    },
                    {
                      name: 'County Assessor Search',
                      badge: 'Official Records',
                      badgeColor: '#00ff88',
                      desc: 'Find the official county assessor property search for this location. Official tax assessment, ownership, and parcel data.',
                      url: () => addrSubmit ? `https://www.google.com/search?q=${enc(addrSubmit.city + ' ' + addrSubmit.state + ' county assessor property search ' + addrSubmit.street)}` : '',
                      label: 'Find Assessor →',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {addrSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">{svc.label}</a>
                      ) : (
                        <span className="service-btn disabled">Search →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reverse Address */}
              <div className="section-wrap">
                <div className="section-label">Reverse Address — Who Lives There</div>
                <div className="services-grid-4">
                  {[
                    {
                      name: 'FastPeopleSearch',
                      badge: 'Free',
                      badgeColor: '#00ff88',
                      desc: 'Free reverse address lookup showing current and historical residents, phone numbers, and associated names.',
                      url: () => addrSubmit ? `https://www.fastpeoplesearch.com/address/${enc(addrSubmit.street + '_' + addrSubmit.city + '_' + addrSubmit.state)}` : '',
                    },
                    {
                      name: 'WhitePages Reverse',
                      badge: 'Established',
                      badgeColor: '#1e9eff',
                      desc: 'Reverse address lookup from one of the most established people-search databases. Shows current residents and contact info.',
                      url: () => addrSubmit ? `https://www.whitepages.com/address/${enc(addrSubmit.street + '/' + addrSubmit.city + '-' + addrSubmit.state)}` : '',
                    },
                    {
                      name: 'Spokeo Reverse',
                      badge: 'Aggregator',
                      badgeColor: '#1e9eff',
                      desc: 'Spokeo reverse address search aggregates public records, social profiles, and contact information for a given address.',
                      url: () => addrSubmit ? `https://www.spokeo.com/address/${addrSubmit.street.replace(/ /g,'-')}/${addrSubmit.city.replace(/ /g,'-')}-${addrSubmit.state}` : '',
                    },
                    {
                      name: 'Radaris Address',
                      badge: 'Deep Search',
                      badgeColor: '#1e9eff',
                      desc: 'Comprehensive address intelligence. Shows residents, property history, neighborhood data, and linked phone numbers.',
                      url: () => addrSubmit ? `https://radaris.com/address/${enc(addrSubmit.street)}/${enc(addrSubmit.city)}/${addrSubmit.state}/` : '',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {addrSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                      ) : (
                        <span className="service-btn disabled">Search →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Aerial & Maps */}
              <div className="section-wrap">
                <div className="section-label">Aerial &amp; Maps</div>
                <div className="services-grid">
                  {[
                    {
                      name: 'Google Maps Satellite',
                      badge: 'Satellite View',
                      badgeColor: '#1e9eff',
                      desc: 'Google Maps satellite imagery for the address. View overhead imagery, street context, and surrounding area.',
                      url: () => addrSubmit ? `https://www.google.com/maps/search/${enc(fullAddr)}/@?entry=ttu` : '',
                    },
                    {
                      name: 'Google Street View',
                      badge: 'Ground Level',
                      badgeColor: '#1e9eff',
                      desc: 'Google Street View panoramic imagery. View the property from street level and check surrounding context.',
                      url: () => addrSubmit ? `https://www.google.com/maps?q=${enc(fullAddr)}&layer=c` : '',
                    },
                    {
                      name: "Bing Maps Bird's Eye",
                      badge: 'Oblique Aerial',
                      badgeColor: '#7a9bb5',
                      desc: "Bing Maps bird's-eye view provides unique oblique aerial imagery not available in standard satellite views.",
                      url: () => addrSubmit ? `https://www.bing.com/maps?q=${enc(fullAddr)}&style=b` : '',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className="service-card">
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {addrSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Open Map →</a>
                      ) : (
                        <span className="service-btn disabled">Open Map →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ownership & History */}
              <div className="section-wrap">
                <div className="section-label">Ownership &amp; Sales History</div>
                <div className="services-grid">
                  {[
                    {
                      name: 'Redfin',
                      badge: 'Sales History',
                      badgeColor: '#1e9eff',
                      desc: 'Redfin property search with detailed sales history, price trends, and ownership timeline. Strong on recent transaction data.',
                      url: () => addrSubmit ? `https://www.redfin.com/search#location=${enc(fullAddr)}` : '',
                    },
                    {
                      name: 'Realtor.com',
                      badge: 'MLS Data',
                      badgeColor: '#1e9eff',
                      desc: 'MLS-based property search with listing history, price changes, and neighborhood market data. Official NAR-affiliated platform.',
                      url: () => addrSubmit ? `https://www.realtor.com/realestateandhomes-search/${enc(addrSubmit!.city + '_' + addrSubmit!.state)}/LCPROP/ADDRESS-${enc(addrSubmit!.street)}` : '',
                    },
                    {
                      name: 'NeighborWho',
                      badge: 'Owner + Residents',
                      badgeColor: '#1e9eff',
                      desc: 'Property ownership, resident history, and neighborhood data. Cross-references county records with public data aggregators.',
                      url: () => addrSubmit ? `https://www.neighborwho.com/address?q=${enc(fullAddr)}` : '',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className="service-card">
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {addrSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                      ) : (
                        <span className="service-btn disabled">Search →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── BY NAME TAB ── */}
          {activeTab === 'name' && (
            <>
              <div className="form-grid-3" style={{marginBottom: '12px'}}>
                <div className="form-field">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} />
                </div>
                <div className="form-field">
                  <label className="form-label">State</label>
                  <select className="form-select" value={nameState} onChange={e => setNameState(e.target.value)}>
                    <option value="">—</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">City (optional)</label>
                  <input className="form-input" placeholder="Springfield" value={nameCity} onChange={e => setNameCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} />
                </div>
              </div>
              <button className="run-btn" onClick={handleNameSubmit} disabled={!firstName.trim() || !lastName.trim()} style={{marginBottom: '32px'}}>
                Find Addresses →
              </button>

              {nameSubmit && (
                <div className="target-display" style={{marginBottom: '32px'}}>
                  <div>
                    <div className="target-label">Subject</div>
                    <div className="target-value">{fn} {ln}{nameSubmit.state ? ` — ${nameSubmit.state}` : ''}{nameSubmit.city ? ` — ${nameSubmit.city}` : ''}</div>
                  </div>
                </div>
              )}

              {/* Address Finders */}
              <div className="section-wrap">
                <div className="section-label">Address Finders</div>
                <div className="services-grid">
                  {[
                    {
                      name: 'FastPeopleSearch',
                      badge: 'Free',
                      badgeColor: '#00ff88',
                      desc: 'Free people search that returns current and historical addresses, phone numbers, and associated persons.',
                      url: () => nameSubmit ? `https://www.fastpeoplesearch.com/name/${enc(fn)}-${enc(ln)}_${nameSubmit.state}` : '',
                    },
                    {
                      name: 'WhitePages',
                      badge: 'Established',
                      badgeColor: '#1e9eff',
                      desc: 'One of the most established people-search databases. Returns current and historical addresses with contact information.',
                      url: () => nameSubmit ? `https://www.whitepages.com/name/${enc(fn)}-${enc(ln)}/${nameSubmit.state}` : '',
                    },
                    {
                      name: 'Radaris',
                      badge: 'Deep Search',
                      badgeColor: '#1e9eff',
                      desc: 'Comprehensive people intelligence platform. Returns address history, associates, property records, and more.',
                      url: () => nameSubmit ? `https://radaris.com/p/${enc(fn)}/${enc(ln)}/` : '',
                    },
                    {
                      name: 'Rehold by Name',
                      badge: 'Property Linked',
                      badgeColor: '#1e9eff',
                      desc: 'Search Rehold for properties linked to a person\'s name. Returns addresses where the subject appears in ownership records.',
                      url: () => nameSubmit ? `https://rehold.com/search?q=${enc(fn + ' ' + ln)}` : '',
                    },
                    {
                      name: 'ZabaSearch',
                      badge: 'Address History',
                      badgeColor: '#7a9bb5',
                      desc: 'Long-running people search engine with strong historical address data. Returns addresses, phone numbers, and relatives.',
                      url: () => nameSubmit ? `https://www.zabasearch.com/people/${enc(fn)}+${enc(ln)}/${nameSubmit.state}/` : '',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {nameSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                      ) : (
                        <span className="service-btn disabled">Search →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Background Context */}
              <div className="section-wrap">
                <div className="section-label">Background Context</div>
                <div className="services-grid">
                  {[
                    {
                      name: 'TruePeopleSearch',
                      badge: 'Free — Detailed',
                      badgeColor: '#00ff88',
                      desc: 'Free and detailed people search with address history, relatives, and associated persons. One of the best free options available.',
                      url: () => nameSubmit ? `https://www.truepeoplesearch.com/results?name=${enc(fn + ' ' + ln)}&citystatezip=${enc((nameSubmit.city ? nameSubmit.city + ' ' : '') + nameSubmit.state)}` : '',
                    },
                    {
                      name: 'PeekYou',
                      badge: 'Social + Web',
                      badgeColor: '#1e9eff',
                      desc: 'People search with strong social media and web presence data. Links addresses to online profiles and public records.',
                      url: () => nameSubmit ? `https://www.peekyou.com/${enc(fn)}_${enc(ln)}` : '',
                    },
                    {
                      name: 'FamilyTreeNow',
                      badge: 'Genealogy + Records',
                      badgeColor: '#7a9bb5',
                      desc: 'Genealogy-focused people search with historical address data, family connections, and vital records. Strong on historical addresses.',
                      url: () => nameSubmit ? `https://www.familytreenow.com/search/genealogy/results?first=${enc(fn)}&last=${enc(ln)}&state=${nameSubmit.state}` : '',
                    },
                  ].map((svc) => (
                    <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                      <div className="service-top">
                        <div className="service-name">{svc.name}</div>
                        <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                      </div>
                      <div className="service-desc">{svc.desc}</div>
                      {nameSubmit ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                      ) : (
                        <span className="service-btn disabled">Search →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
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
