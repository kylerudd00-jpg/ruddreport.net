'use client';
import { useState } from 'react';

const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 900px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; }
  .tool-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; }
  .input-row { display: flex; gap: 2px; margin-bottom: 2px; }
  .mac-input { flex: 1; background: var(--bg-primary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; padding: 14px 18px; transition: border-color 0.2s; letter-spacing: 0.05em; }
  .mac-input:focus { border-color: var(--accent); }
  .mac-input::placeholder { color: var(--text-muted); font-size: 12px; letter-spacing: 0; }
  .lookup-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 14px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .lookup-btn:hover { background: #4db3ff; }
  .lookup-btn:disabled { opacity: 0.5; cursor: default; }
  .result-panel { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; }
  .result-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 24px; }
  .result-vendor { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
  .result-oui { font-family: var(--font-mono); font-size: 13px; color: var(--accent); margin-bottom: 20px; }
  .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 16px; }
  .info-cell { background: var(--bg-primary); padding: 14px 16px; }
  .info-cell-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
  .info-cell-val { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
  .error-box { background: rgba(255,77,77,0.06); border: 1px solid rgba(255,77,77,0.2); padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); }
  .hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 10px; }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .info-grid { grid-template-columns: 1fr; } .input-row { flex-direction: column; } }
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
      const res = await fetch(`/api/mac?oui=${oui}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Lookup failed (HTTP ${res.status}).`);
      setVendor(data.vendor);
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
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Network</div></div>
            <h1 className="hero-title">MAC Address <span>Lookup</span></h1>
            <p className="hero-sub">Every network device has a MAC address with the first half identifying its manufacturer. Paste any MAC address to find out what company made the hardware — useful when analyzing network traffic logs, investigating unknown devices on a network, or attributing equipment to a specific vendor.</p>
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
      </main>
    </>
  );
}
