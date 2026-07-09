'use client';
import { useState, useEffect, useRef } from 'react';

const HISTORY_KEY = 'osint_ip_history';

export default function IPGeo() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      // Load history
      try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch {}
      // Auto-run if ?q= param present
      const q = new URLSearchParams(window.location.search).get('q');
      if (q) { setIp(q); setTimeout(() => lookup(q), 100); }
    }
  }, []);

  const lookup = async (overrideIp?: string) => {
    const target = overrideIp || ip.trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/ip?ip=${target}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'Lookup failed');
      const [lat, lon] = (data.loc || '0,0').split(',').map(Number);
      const enriched = { ...data, lat, lon };
      setResult(enriched);
      if (lat && lon) initMap(lat, lon, enriched);
      // Save to history
      setHistory(prev => {
        const next = [target, ...prev.filter(h => h !== target)].slice(0, 6);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (e: any) {
      setError(`${e.message || 'Could not retrieve data for this IP address.'}`);
    }
    setLoading(false);
  };

  const runExample = (v: string) => { setIp(v); lookup(v); };

  const initMap = async (lat: number, lon: number, data: any) => {
    if (typeof window === 'undefined') return;
    const L = (await import('leaflet' as any)).default;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.off();
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    if (!mapRef.current) return;

    mapRef.current._leaflet_id = null;

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lon], 10);
    mapInstanceRef.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(map);
    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#1e9eff;border:3px solid #fff;box-shadow:0 0 20px #1e9eff;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: '',
    });
    L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(`<div style="font-family:monospace;font-size:12px;"><b>${data.ip}</b><br>${data.city}, ${data.country}</div>`)
      .openPopup();
  };

  const myIp = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      setIp(data.ip);
      await lookup(data.ip);
    } catch {
      setError('Could not detect your IP.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .myip-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); background: none; border: 1px solid var(--border-bright); padding: 10px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; margin-top: 12px; display: inline-block; }
        .myip-btn:hover { background: var(--bg-card-hover); border-color: var(--accent); }
        .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 24px; }
        .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
        .ex-row button { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
        .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .map-wrap { width: 100%; height: 400px; border: 1px solid var(--border); margin-bottom: 2px; position: relative; z-index: 1; }
        .result-card { background: var(--bg-secondary); border: 1px solid var(--border); }
        .result-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); }
        .result-ip { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--accent); letter-spacing: 0; }
        .result-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); border: 1px solid var(--border-bright); padding: 4px 12px; text-transform: uppercase; }
        .result-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; padding: 16px 28px 12px; border-bottom: 1px solid var(--border); grid-column: 1 / -1; }
        .result-field { padding: 18px 28px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
        .result-field:nth-child(even) { border-right: none; }
        .result-field.full { grid-column: 1 / -1; border-right: none; }
        .field-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .field-value { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; line-height: 1.7; word-break: break-all; }
        .field-value.highlight { color: var(--accent); }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .result-grid { grid-template-columns: 1fr; }
          .result-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .result-field { border-right: none; }
          .map-wrap { height: 280px; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Network Intelligence</div>
            </div>
            <h1 className="tool-title">IP Geolocation</h1>
            <p className="tool-desc">Map any IP to its location, internet provider, and owning organization.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="IP address to look up"
              placeholder="Enter IP address — e.g. 8.8.8.8"
              value={ip}
              onChange={e => setIp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button type="button" className="search-btn" onClick={() => lookup()} disabled={loading}>
              {loading ? 'Scanning...' : 'Lookup →'}
            </button>
          </div>
          <div className="ex-row" role="group" aria-label="Examples to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['8.8.8.8'].map(v => (
              <button key={v} type="button" onClick={() => runExample(v)}>{v}</button>
            ))}
          </div>
          <button type="button" className="myip-btn" onClick={myIp}>⊕ Use My IP Address</button>
          {history.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recent:</span>
              {history.map(h => (
                <button type="button" key={h} onClick={() => { setIp(h); lookup(h); }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', padding: '4px 11px', cursor: 'pointer', letterSpacing: '0.02em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >{h}</button>
              ))}
            </div>
          )}
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">Geolocating target...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}
          {result && (
            <>
              <div className="map-wrap" ref={mapRef} />
              <div className="result-card">
                <div className="result-header">
                  <div className="result-ip">{result.ip}</div>
                  <div className="result-badge">Record Found</div>
                </div>
                <div className="result-grid">

                  <div className="section-label">Location</div>
                  <div className="result-field">
                    <div className="field-label">Country</div>
                    <div className="field-value highlight">{result.country}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Region</div>
                    <div className="field-value">{result.region}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">City</div>
                    <div className="field-value">{result.city}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Postal Code</div>
                    <div className="field-value">{result.postal || 'N/A'}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Coordinates</div>
                    <div className="field-value highlight">{result.loc}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Timezone</div>
                    <div className="field-value">{result.timezone}</div>
                  </div>

                  <div className="section-label">Network</div>
                  <div className="result-field">
                    <div className="field-label">ISP / Organization</div>
                    <div className="field-value highlight">{result.org}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">Hostname</div>
                    <div className="field-value">{result.hostname || 'N/A'}</div>
                  </div>

                </div>
              </div>
            </>
          )}
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