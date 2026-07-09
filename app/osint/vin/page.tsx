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
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 800px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); margin-bottom: 16px; }
        .search-input { flex: 1; background: none; border: none; padding: 18px 20px; font-family: var(--font-mono); font-size: 15px; color: var(--text-primary); letter-spacing: 3px; text-transform: uppercase; }
        .search-input::placeholder { color: var(--text-muted); letter-spacing: 1px; text-transform: none; font-size: 13px; }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .error-box { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.3); padding: 16px 20px; font-family: var(--font-display); font-size: 13px; color: var(--red); margin-bottom: 24px; }
        .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding: 40px 0; text-align: center; }
        .result-header { background: var(--bg-card); border: 1px solid var(--border); padding: 28px 32px; margin-bottom: 2px; }
        .result-vehicle { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: #fff; letter-spacing: 1px; margin-bottom: 6px; }
        .result-vin { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); }
        .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .result-field { background: var(--bg-card); border: 1px solid var(--border); padding: 18px 22px; }
        .field-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .field-value { font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); }
        .info-box { background: var(--bg-secondary); border: 1px solid var(--border); padding: 24px; margin-top: 32px; }
        .info-title { font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px; }
        .info-text { font-size: 13px; color: var(--text-muted); line-height: 1.7; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; } .result-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; } .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow"><div className="tool-eyebrow-line" aria-hidden="true" /><div className="tool-eyebrow-text">Vehicle Research</div></div>
            <h1 className="tool-title">VIN Decoder</h1>
            <p className="tool-desc">Decode any 17-character Vehicle Identification Number using the NHTSA database. Returns make, model, year, engine, trim, drive type, and country of manufacture — free, no account needed. Useful before buying a used car.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Vehicle Identification Number"
              placeholder="Enter 17-character VIN..."
              value={vin}
              onChange={e => setVin(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && decode()}
              maxLength={17}
            />
            <button type="button" className="search-btn" onClick={decode} disabled={loading || !vin.trim()}>
              {loading ? 'Decoding...' : 'Decode →'}
            </button>
          </div>

          <div aria-live="polite">
          {error && <div className="error-box" role="alert">{error}</div>}
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
          </div>

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
      </main>
    </>
  );
}
