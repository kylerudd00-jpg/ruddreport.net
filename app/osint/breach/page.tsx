'use client';
import { useState, useEffect } from 'react';

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

async function sha1Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await window.crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function BreachLookup() {
  const [tab, setTab] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [password, setPassword] = useState('');
  const [pwResult, setPwResult] = useState<{ found: boolean; count: number } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const isValidEmail = (e: string) => e.trim().length > 3 && e.includes('@');

  const runEmail = (val: string) => {
    const e = val.trim();
    if (!isValidEmail(e)) return;
    setSubmitted(e);
  };
  const handleSubmit = () => runEmail(email);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setEmail(q); runEmail(q); }
  }, []);

  const checkPassword = async () => {
    if (!password.trim()) return;
    setPwLoading(true);
    setPwError('');
    setPwResult(null);
    try {
      const hash = await sha1Hex(password);
      const prefix = hash.slice(0, 5).toUpperCase();
      const suffix = hash.slice(5).toUpperCase();
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { 'Add-Padding': 'true' } });
      if (!res.ok) throw new Error('HIBP API unavailable');
      const text = await res.text();
      const match = text.split('\n').find(l => l.startsWith(suffix));
      if (match) {
        setPwResult({ found: true, count: parseInt(match.split(':')[1].trim(), 10) });
      } else {
        setPwResult({ found: false, count: 0 });
      }
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : 'Check failed.');
    }
    setPwLoading(false);
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
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 18px 20px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .disclaimer { margin-top: 16px; display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); }
        .disclaimer-icon { font-size: 14px; color: var(--red); flex-shrink: 0; padding-top: 2px; }
        .disclaimer-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); line-height: 1.7; }
        .disclaimer-text strong { color: var(--red); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: rgba(30,158,255,0.05); border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .target-value { font-family: var(--font-mono); font-size: 14px; color: var(--accent); letter-spacing: 0.05em; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 60px; }
        .service-card { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.3s; position: relative; overflow: hidden; }
        .service-card:hover { border-color: var(--border-bright); }
        .service-card.manual-card { background: var(--bg-card); border-color: rgba(255,170,0,0.12); }
        .service-card.manual-card:hover { border-color: rgba(255,170,0,0.3); }
        .service-card.paid-card { background: var(--bg-card); border-color: rgba(154,176,196,0.12); }
        .service-card.paid-card:hover { border-color: rgba(154,176,196,0.3); }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .service-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; }
        .service-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-desc { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
        .service-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); border: 1px solid var(--border-bright); background: none; padding: 10px 20px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }
        .service-btn.manual-btn { color: #ffaa00; border-color: rgba(255,170,0,0.3); }
        .service-btn.manual-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
        .service-btn.paid-btn { color: var(--text-secondary); border-color: rgba(154,176,196,0.3); }
        .service-btn.paid-btn:hover { background: rgba(154,176,196,0.08); border-color: #9ab0c4; }
        .service-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        .breach-table-wrap { background: var(--bg-card); border: 1px solid var(--border); overflow: hidden; }
        .breach-table { width: 100%; border-collapse: collapse; }
        .breach-table th { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; padding: 14px 20px; text-align: left; background: rgba(30,158,255,0.05); border-bottom: 1px solid var(--border); }
        .breach-table td { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); padding: 12px 20px; border-bottom: 1px solid var(--border); letter-spacing: 0.04em; }
        .breach-table tr:last-child td { border-bottom: none; }
        .breach-table tr:hover td { background: rgba(30,158,255,0.03); }
        .breach-table td:first-child { color: var(--text-primary); font-weight: 500; }
        .breach-table td:nth-child(3) { color: var(--accent); }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        .tab-row { display: flex; gap: 2px; margin-bottom: 28px; }
        .tab-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 24px; border: 1px solid var(--border-bright); background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .tab-btn.active { background: rgba(30,158,255,0.08); border-color: var(--accent); color: var(--accent); }
        .tab-btn:hover:not(.active) { border-color: var(--border-bright); color: var(--text-primary); }
        .pw-privacy-note { margin-top: 14px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.7; }
        .pw-result { margin-top: 24px; padding: 32px; text-align: center; border: 1px solid; }
        .pw-result.found { border-color: rgba(255,77,77,0.4); background: rgba(255,77,77,0.04); }
        .pw-result.safe { border-color: rgba(34,204,102,0.3); background: rgba(34,204,102,0.04); }
        .pw-icon { font-size: 40px; margin-bottom: 14px; }
        .pw-status { font-family: var(--font-display); font-size: 26px; font-weight: 900; letter-spacing: 0.06em; margin-bottom: 10px; }
        .pw-status.found { color: var(--red); }
        .pw-status.safe { color: #22cc66; }
        .pw-count { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 8px; }
        .pw-count span { color: var(--red); font-size: 17px; }
        .pw-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; margin-top: 16px; }
        .pw-error { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); margin-top: 16px; }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
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

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Credential Intelligence</div>
            </div>
            <h1 className="tool-title">Breach Lookup</h1>
            <p className="tool-desc">When companies get hacked, stolen credentials end up in criminal marketplaces. Check any email address against known breach databases, or test whether a password has ever appeared in leaked data — without ever exposing your actual password.</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Tab switcher */}
          <div className="tab-row">
            <button type="button" className={`tab-btn${tab === 'email' ? ' active' : ''}`} onClick={() => { setTab('email'); setPwResult(null); setPwError(''); }}>Email Lookup</button>
            <button type="button" className={`tab-btn${tab === 'password' ? ' active' : ''}`} onClick={() => { setTab('password'); setSubmitted(''); }}>Password Check</button>
          </div>

          {tab === 'email' && (
          <div style={{marginBottom: '40px'}}>
            <div className="search-box">
              <input
                className="search-input"
                aria-label="Email address to check for breaches"
                placeholder="Enter email address — e.g. target@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                type="email"
              />
              <button type="button" className="search-btn" onClick={handleSubmit} disabled={!isValidEmail(email)}>
                Check Breaches →
              </button>
            </div>
            <div className="disclaimer">
              <div className="disclaimer-icon" aria-hidden="true">⚠</div>
              <div className="disclaimer-text">
                <strong>Security notice:</strong> Never enter passwords or sensitive data into third-party breach checkers. Use Have I Been Pwned as your trusted baseline — it is the only service here that does not expose your query to third parties by design.
              </div>
            </div>
          </div>
          )}

          {tab === 'password' && (
          <div style={{marginBottom: '40px'}}>
            <div className="search-box">
              <input
                className="search-input"
                aria-label="Password to check against breach data"
                placeholder="Enter password to check..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkPassword()}
                type="password"
              />
              <button type="button" className="search-btn" onClick={checkPassword} disabled={pwLoading || !password.trim()}>
                {pwLoading ? 'Checking...' : 'Check →'}
              </button>
            </div>
            <div className="pw-privacy-note">
              Privacy-safe: only the first 5 hex chars of your password&apos;s SHA-1 hash are sent to HIBP (k-anonymity). Your actual password never leaves your browser.
            </div>
            <div aria-live="polite">
              {pwError && <div className="pw-error" role="alert">{pwError}</div>}
              {pwResult && (
                <div className={`pw-result ${pwResult.found ? 'found' : 'safe'}`}>
                  <div className="pw-icon" aria-hidden="true">{pwResult.found ? '⚠' : '✓'}</div>
                  <div className={`pw-status ${pwResult.found ? 'found' : 'safe'}`}>
                    {pwResult.found ? 'COMPROMISED' : 'NOT FOUND'}
                  </div>
                  {pwResult.found ? (
                    <div className="pw-count">Seen <span>{pwResult.count.toLocaleString()}</span> times in known breach data</div>
                  ) : (
                    <div className="pw-count">This password has not appeared in any known breach</div>
                  )}
                  <div className="pw-note">
                    Source: Have I Been Pwned — 14B+ compromised credentials indexed<br />
                    Note: not found does not mean safe — use unique, randomly generated passwords
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {tab === 'email' && submitted && (
            <div style={{marginBottom: '12px'}}>
              <div className="target-display">
                <div className="target-label">Target Email</div>
                <div className="target-value">{submitted}</div>
              </div>
            </div>
          )}

          {tab === 'email' && <><div style={{marginBottom: '12px'}}>
            <h2 className="section-label">Breach Databases — {submitted ? `Searching for ${submitted}` : 'Enter Email Above to Enable'}</h2>
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
            <h2 className="section-label">Major Known Breaches — Reference Table</h2>
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
          </div></>}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
