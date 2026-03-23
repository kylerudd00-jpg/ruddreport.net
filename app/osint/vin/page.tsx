'use client';
import { useState } from 'react';

interface VinResult {
  Make: string;
  Model: string;
  ModelYear: string;
  Trim: string;
  BodyClass: string;
  DriveType: string;
  EngineConfiguration: string;
  DisplacementL: string;
  FuelTypePrimary: string;
  Turbo: string;
  TransmissionStyle: string;
  NumberOfSeats: string;
  PlantCountry: string;
  ManufacturerName: string;
  VehicleType: string;
  GVWR: string;
}

const FIELD_LABELS: { key: keyof VinResult; label: string }[] = [
  { key: 'Make', label: 'Make' },
  { key: 'Model', label: 'Model' },
  { key: 'ModelYear', label: 'Year' },
  { key: 'Trim', label: 'Trim' },
  { key: 'VehicleType', label: 'Vehicle Type' },
  { key: 'BodyClass', label: 'Body Style' },
  { key: 'DriveType', label: 'Drive Type' },
  { key: 'TransmissionStyle', label: 'Transmission' },
  { key: 'DisplacementL', label: 'Engine Displacement' },
  { key: 'EngineConfiguration', label: 'Engine Configuration' },
  { key: 'FuelTypePrimary', label: 'Fuel Type' },
  { key: 'Turbo', label: 'Turbo' },
  { key: 'NumberOfSeats', label: 'Seating Capacity' },
  { key: 'GVWR', label: 'GVWR' },
  { key: 'ManufacturerName', label: 'Manufacturer' },
  { key: 'PlantCountry', label: 'Made In' },
];

export default function VinDecoder() {
  const [vin, setVin] = useState('');
  const [result, setResult] = useState<VinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isValidVin = (v: string) => /^[A-HJ-NPR-Z0-9]{17}$/i.test(v.trim());

  const decode = async () => {
    const v = vin.trim().toUpperCase();
    if (!isValidVin(v)) { setError('VINs are exactly 17 characters (letters and numbers, no I/O/Q).'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${v}?format=json`);
      const data = await res.json();
      if (!data.Results || !data.Results[0]) { setError('No data returned for this VIN.'); return; }
      setResult(data.Results[0] as VinResult);
    } catch {
      setError('Could not reach the NHTSA database. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayVal = (val: string) => val && val !== 'Not Applicable' && val.trim() ? val : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
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
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 800px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; margin-bottom: 16px; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 18px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #d8e8f5; letter-spacing: 3px; text-transform: uppercase; }
        .search-input::placeholder { color: #5a7a94; letter-spacing: 1px; text-transform: none; font-size: 13px; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #000; background: #1e9eff; border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #5a7a94; cursor: not-allowed; }
        .error-box { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.3); padding: 16px 20px; font-family: 'Barlow', sans-serif; font-size: 13px; color: #ff6b6b; margin-bottom: 24px; }
        .loading { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; padding: 40px 0; text-align: center; }
        .result-header { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); padding: 28px 32px; margin-bottom: 2px; }
        .result-vehicle { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 700; color: #fff; letter-spacing: 1px; margin-bottom: 6px; }
        .result-vin { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .result-field { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 18px 22px; }
        .field-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 6px; }
        .field-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #c0cfe0; }
        .info-box { background: #070d12; border: 1px solid rgba(30,158,255,0.1); padding: 24px; margin-top: 32px; }
        .info-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #7a9bb5; text-transform: uppercase; margin-bottom: 12px; }
        .info-text { font-size: 13px; color: #5a7a94; line-height: 1.7; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; } .result-grid { grid-template-columns: 1fr; }
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
        </div>

        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow"><div className="tool-eyebrow-line" /><div className="tool-eyebrow-text">Vehicle Research</div></div>
            <div className="tool-title">VIN Decoder</div>
            <p className="tool-desc">Decode any 17-character Vehicle Identification Number using the NHTSA database. Returns make, model, year, engine, trim, drive type, and country of manufacture — free, no account needed. Useful before buying a used car.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter 17-character VIN..."
              value={vin}
              onChange={e => setVin(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && decode()}
              maxLength={17}
            />
            <button className="search-btn" onClick={decode} disabled={loading || !vin.trim()}>
              {loading ? 'Decoding...' : 'Decode →'}
            </button>
          </div>

          {error && <div className="error-box">{error}</div>}
          {loading && <div className="loading">Querying NHTSA database...</div>}

          {result && !loading && (
            <>
              <div className="result-header">
                <div className="result-vehicle">
                  {[result.ModelYear, result.Make, result.Model, result.Trim].filter(v => displayVal(v)).join(' ')}
                </div>
                <div className="result-vin">VIN: {vin.trim().toUpperCase()}</div>
              </div>
              <div className="result-grid">
                {FIELD_LABELS.map(({ key, label }) => {
                  const val = displayVal(result[key]);
                  if (!val) return null;
                  return (
                    <div key={key} className="result-field">
                      <div className="field-label">{label}</div>
                      <div className="field-value">{val}{key === 'DisplacementL' ? 'L' : ''}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="info-box">
            <div className="info-title">Where to find a VIN</div>
            <div className="info-text">The VIN is on the driver&apos;s side dashboard (visible through the windshield), the door jamb sticker, the title, and the insurance card. Always exactly 17 characters. Data is from the NHTSA vPIC API and reflects manufacturer specifications — not accident history or title status.</div>
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-copy">Data via NHTSA vPIC</div>
          </div>
        </footer>
      </div>
    </>
  );
}
