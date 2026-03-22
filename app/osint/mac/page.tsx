'use client';
import { useState } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
  .nav-links a:hover { color: #1e9eff; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
  .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
  .hero-inner { max-width: 900px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; }
  .tool-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; }
  .input-row { display: flex; gap: 2px; margin-bottom: 2px; }
  .mac-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 14px; padding: 14px 18px; outline: none; transition: border-color 0.2s; letter-spacing: 1px; }
  .mac-input:focus { border-color: rgba(30,158,255,0.5); }
  .mac-input::placeholder { color: #3d5870; font-size: 12px; letter-spacing: 0; }
  .lookup-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 14px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .lookup-btn:hover { background: #4db3ff; }
  .lookup-btn:disabled { opacity: 0.5; cursor: default; }
  .result-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 32px; }
  .result-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 24px; }
  .result-vendor { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #c0cfe0; margin-bottom: 8px; }
  .result-oui { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #1e9eff; margin-bottom: 20px; }
  .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 16px; }
  .info-cell { background: rgba(3,6,8,0.5); padding: 14px 16px; }
  .info-cell-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 6px; }
  .info-cell-val { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #9ab0c4; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; }
  .hint { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: #3d5870; margin-top: 10px; }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .info-grid { grid-template-columns: 1fr; } .input-row { flex-direction: column; } }
`;

function normalizeMAC(raw: string): string {
  const clean = raw.replace(/[^0-9a-fA-F]/g, '');
  if (clean.length < 6) return raw;
  return clean.slice(0, 2) + ':' + clean.slice(2, 4) + ':' + clean.slice(4, 6) +
    (clean.length > 6 ? ':' + clean.slice(6, 8) + ':' + clean.slice(8, 10) + ':' + clean.slice(10, 12) : '');
}

function getOUI(mac: string): string {
  const clean = mac.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  return clean.slice(0, 6).match(/.{2}/g)?.join(':') ?? '';
}

function isLocal(mac: string): boolean {
  const firstByte = parseInt(mac.replace(/[^0-9a-fA-F]/g, '').slice(0, 2), 16);
  return (firstByte & 0x02) !== 0;
}

function isMulticast(mac: string): boolean {
  const firstByte = parseInt(mac.replace(/[^0-9a-fA-F]/g, '').slice(0, 2), 16);
  return (firstByte & 0x01) !== 0;
}

export default function MACLookup() {
  const [query, setQuery] = useState('');
  const [vendor, setVendor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState('');

  async function lookup() {
    const raw = query.trim();
    if (!raw) return;
    setLoading(true);
    setError('');
    setVendor('');
    setSearched(raw);
    try {
      const clean = raw.replace(/[^0-9a-fA-F]/g, '');
      if (clean.length < 6) throw new Error('Enter at least 6 hex characters (OUI prefix).');
      const oui = clean.slice(0, 6);
      const res = await fetch(`https://api.macvendors.com/${oui}`, { headers: { Accept: 'text/plain' } });
      if (res.status === 404) throw new Error('No vendor found for this OUI. May be a private or locally administered address.');
      if (!res.ok) throw new Error(`Lookup failed (HTTP ${res.status}).`);
      const text = await res.text();
      setVendor(text.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  const oui = searched ? getOUI(searched) : '';
  const local = searched ? isLocal(searched) : false;
  const multicast = searched ? isMulticast(searched) : false;

  return (
    <>
      <style>{STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('macMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="macMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('macMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Network</div></div>
            <div className="hero-title">MAC Address <span>Lookup</span></div>
            <p className="hero-sub">Identify the hardware vendor behind any MAC address or OUI prefix. Reveals the device manufacturer and flags locally administered or multicast addresses.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="input-row">
            <input
              className="mac-input"
              placeholder="e.g. 00:1A:2B:3C:4D:5E or 001A2B3C4D5E"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button className="lookup-btn" onClick={lookup} disabled={loading}>
              {loading ? 'Looking up...' : 'Look Up →'}
            </button>
          </div>
          <div className="hint">Accepts any format: colons, dashes, dots, or raw hex. Only the first 6 hex chars (OUI) are used for vendor lookup.</div>

          {error && <div className="error-box" style={{marginTop: '16px'}}>{error}</div>}

          {vendor && (
            <div className="result-panel" style={{marginTop: '16px'}}>
              <div className="result-label">Vendor Identified</div>
              <div className="result-vendor">{vendor}</div>
              <div className="result-oui">OUI: {oui}</div>
              <div className="info-grid">
                <div className="info-cell">
                  <div className="info-cell-label">Address Type</div>
                  <div className="info-cell-val">{local ? 'Locally Administered' : 'Globally Unique'}</div>
                </div>
                <div className="info-cell">
                  <div className="info-cell-label">Cast Type</div>
                  <div className="info-cell-val">{multicast ? 'Multicast' : 'Unicast'}</div>
                </div>
                <div className="info-cell">
                  <div className="info-cell-label">Normalized</div>
                  <div className="info-cell-val">{normalizeMAC(searched).toUpperCase()}</div>
                </div>
                <div className="info-cell">
                  <div className="info-cell-label">Source</div>
                  <div className="info-cell-val">IEEE OUI Registry</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
