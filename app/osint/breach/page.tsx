'use client';
import { useState } from 'react';

const SERVICES = [
  {
    name: 'Have I Been Pwned',
    badge: 'Gold Standard',
    desc: 'The most trusted breach notification service. Indexes 12B+ leaked accounts across hundreds of breaches.',
    buildUrl: (email: string) => `https://haveibeenpwned.com/account/${encodeURIComponent(email)}`,
    manual: false,
    badgeColor: '#1e9eff',
  },
  {
    name: 'DeHashed',
    badge: 'Largest Database',
    desc: 'Largest breach database available. Indexes leaked passwords, usernames, IP addresses, and more.',
    buildUrl: (email: string) => `https://dehashed.com/search?query=${encodeURIComponent(email)}`,
    manual: false,
    badgeColor: '#1e9eff',
  },
  {
    name: 'IntelligenceX',
    badge: 'Dark Web + Breach',
    desc: 'Searches dark web, Tor, leaked data, and public sources. Strong on deep web breach indexing.',
    buildUrl: (email: string) => `https://intelx.io/?s=${encodeURIComponent(email)}`,
    manual: false,
    badgeColor: '#1e9eff',
  },
  {
    name: 'Google Dork',
    badge: 'Surface Web',
    desc: 'Uses a search dork to find public references to the email address in breach reports and leaked documents.',
    buildUrl: (email: string) => `https://www.google.com/search?q="${encodeURIComponent(email)}"+breach+OR+leaked+OR+hack`,
    manual: false,
    badgeColor: '#7a9bb5',
  },
  {
    name: 'Leak-Lookup',
    badge: 'Paste Manually',
    desc: 'Broad breach search engine covering many lesser-known leaks. Navigate to site and paste email.',
    buildUrl: () => `https://leak-lookup.com/search`,
    manual: true,
    badgeColor: '#ffaa00',
  },
  {
    name: 'BreachDirectory',
    badge: 'Paste Manually',
    desc: 'Fast directory of known breaches. Shows password hashes and exposure details for compromised accounts.',
    buildUrl: () => `https://breachdirectory.org/`,
    manual: true,
    badgeColor: '#ffaa00',
  },
  {
    name: 'Snusbase',
    badge: 'Paid — Comprehensive',
    desc: 'One of the most comprehensive breach search engines. Paid service but indexes many exclusive breach sets.',
    buildUrl: () => `https://snusbase.com/`,
    manual: true,
    badgeColor: '#9ab0c4',
  },
];

const BREACHES = [
  { service: 'RockYou2024', year: '2024', records: '10B+', type: 'Password list' },
  { service: 'LinkedIn', year: '2021', records: '700M', type: 'Professional data' },
  { service: 'Facebook', year: '2021', records: '533M', type: 'Personal data' },
  { service: 'Twitter / X', year: '2023', records: '200M', type: 'Email addresses' },
  { service: 'Equifax', year: '2017', records: '147M', type: 'Financial / SSN' },
  { service: 'Yahoo', year: '2016', records: '3B', type: 'Credentials' },
  { service: 'Adobe', year: '2013', records: '153M', type: 'Credentials' },
  { service: 'Dropbox', year: '2012', records: '69M', type: 'Credentials' },
  { service: 'MySpace', year: '2016', records: '360M', type: 'Credentials' },
  { service: 'Collection #1', year: '2019', records: '773M', type: 'Email / password' },
  { service: 'Marriott', year: '2018', records: '500M', type: 'Travel data' },
  { service: 'Canva', year: '2019', records: '137M', type: 'Design platform' },
  { service: 'Twitch', year: '2021', records: '125GB', type: 'Source code + data' },
  { service: 'T-Mobile', year: '2021', records: '54M', type: 'Mobile data' },
  { service: 'LastPass', year: '2022', records: 'Unknown', type: 'Password vaults' },
];

export default function BreachLookup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isValidEmail = (e: string) => e.trim().length > 3 && e.includes('@');

  const handleSubmit = () => {
    if (!isValidEmail(email)) return;
    setSubmitted(email.trim());
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
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 18px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .disclaimer { margin-top: 16px; display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); }
        .disclaimer-icon { font-size: 14px; color: #ff6060; flex-shrink: 0; padding-top: 2px; }
        .disclaimer-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #9ab0c4; line-height: 1.7; }
        .disclaimer-text strong { color: #ff6060; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #1e9eff; letter-spacing: 2px; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 60px; }
        .service-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 28px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.3s; position: relative; overflow: hidden; }
        .service-card:hover { border-color: rgba(30,158,255,0.3); }
        .service-card.manual-card { background: #0e0c08; border-color: rgba(255,170,0,0.12); }
        .service-card.manual-card:hover { border-color: rgba(255,170,0,0.3); }
        .service-card.paid-card { background: #0a0d10; border-color: rgba(154,176,196,0.12); }
        .service-card.paid-card:hover { border-color: rgba(154,176,196,0.3); }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; letter-spacing: 1px; }
        .service-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .service-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 10px 20px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .service-btn.manual-btn { color: #ffaa00; border-color: rgba(255,170,0,0.3); }
        .service-btn.manual-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
        .service-btn.paid-btn { color: #9ab0c4; border-color: rgba(154,176,196,0.3); }
        .service-btn.paid-btn:hover { background: rgba(154,176,196,0.08); border-color: #9ab0c4; }
        .service-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .breach-table-wrap { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); overflow: hidden; }
        .breach-table { width: 100%; border-collapse: collapse; }
        .breach-table th { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; padding: 14px 20px; text-align: left; background: rgba(30,158,255,0.05); border-bottom: 1px solid rgba(30,158,255,0.15); }
        .breach-table td { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #9ab0c4; padding: 12px 20px; border-bottom: 1px solid rgba(30,158,255,0.06); letter-spacing: 1px; }
        .breach-table tr:last-child td { border-bottom: none; }
        .breach-table tr:hover td { background: rgba(30,158,255,0.03); }
        .breach-table td:first-child { color: #c0cfe0; font-weight: 500; }
        .breach-table td:nth-child(3) { color: #1e9eff; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .services-grid { grid-template-columns: 1fr; }
          .breach-table th, .breach-table td { padding: 10px 14px; font-size: 10px; }
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
              <div className="tool-eyebrow-text">Credential Intelligence</div>
            </div>
            <div className="tool-title">Breach Lookup</div>
            <p className="tool-desc">When companies get hacked, stolen email and password combinations end up in criminal marketplaces. Enter any email to check if it appeared in known data breaches — so you know whether credentials for a target have already been compromised and are likely in the hands of attackers.</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Input */}
          <div style={{marginBottom: '40px'}}>
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Enter email address — e.g. target@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                type="email"
              />
              <button className="search-btn" onClick={handleSubmit} disabled={!isValidEmail(email)}>
                Check Breaches →
              </button>
            </div>
            <div className="disclaimer">
              <div className="disclaimer-icon">⚠</div>
              <div className="disclaimer-text">
                <strong>Security notice:</strong> Never enter passwords or sensitive data into third-party breach checkers. Use Have I Been Pwned as your trusted baseline — it is the only service here that does not expose your query to third parties by design.
              </div>
            </div>
          </div>

          {/* Target display + service cards */}
          {submitted && (
            <div style={{marginBottom: '12px'}}>
              <div className="target-display">
                <div className="target-label">Target Email</div>
                <div className="target-value">{submitted}</div>
              </div>
            </div>
          )}

          <div style={{marginBottom: '12px'}}>
            <div className="section-label">Breach Databases — {submitted ? `Searching for ${submitted}` : 'Enter Email Above to Enable'}</div>
          </div>
          <div className="services-grid">
            {SERVICES.map((svc) => {
              const ready = !!submitted;
              const url = ready ? svc.buildUrl(submitted) : '';
              const isManual = svc.manual && svc.badge === 'Paste Manually';
              const isPaid = svc.badge === 'Paid — Comprehensive';
              return (
                <div
                  key={svc.name}
                  className={`service-card${isManual ? ' manual-card' : ''}${isPaid ? ' paid-card' : ''}`}
                >
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div
                      className="service-badge"
                      style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}
                    >
                      {svc.badge}
                    </div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {ready ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`service-btn${isManual ? ' manual-btn' : ''}${isPaid ? ' paid-btn' : ''}`}
                    >
                      {isManual || isPaid ? 'Open Site →' : 'Search →'}
                    </a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Breach reference table */}
          <div style={{marginBottom: '12px'}}>
            <div className="section-label">Major Known Breaches — Reference Table</div>
          </div>
          <div className="breach-table-wrap">
            <table className="breach-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Year</th>
                  <th>Records</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {BREACHES.map((b) => (
                  <tr key={b.service}>
                    <td>{b.service}</td>
                    <td>{b.year}</td>
                    <td>{b.records}</td>
                    <td>{b.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
