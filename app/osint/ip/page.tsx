'use client';
import { useState, useEffect, useRef } from 'react';

export default function IPGeo() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
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
    } catch (e: any) {
      setError(`// ${e.message || 'Could not retrieve data for this IP address.'}`);
    }
    setLoading(false);
  };

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
      setError('// Could not detect your IP.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .myip-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #00ff88; background: none; border: 1px solid rgba(0,255,136,0.3); padding: 10px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; margin-top: 12px; display: inline-block; }
        .myip-btn:hover { background: rgba(0,255,136,0.08); border-color: #00ff88; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .map-wrap { width: 100%; height: 400px; border: 1px solid rgba(30,158,255,0.2); margin-bottom: 2px; position: relative; z-index: 1; }
        .result-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); }
        .result-header { padding: 24px 28px; border-bottom: 1px solid rgba(30,158,255,0.12); display: flex; align-items: center; justify-content: space-between; background: rgba(30,158,255,0.04); }
        .result-ip { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; }
        .result-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #00ff88; border: 1px solid rgba(0,255,136,0.3); padding: 4px 12px; text-transform: uppercase; background: rgba(0,255,136,0.06); }
        .result-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 16px 28px 12px; background: rgba(30,158,255,0.03); border-bottom: 1px solid rgba(30,158,255,0.06); grid-column: 1 / -1; }
        .result-field { padding: 18px 28px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .result-field:nth-child(even) { border-right: none; }
        .result-field.full { grid-column: 1 / -1; border-right: none; }
        .field-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 8px; }
        .field-value { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c0cfe0; letter-spacing: 1px; line-height: 1.7; word-break: break-all; }
        .field-value.highlight { color: #1e9eff; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .result-grid { grid-template-columns: 1fr; }
          .result-field { border-right: none; }
          .map-wrap { height: 280px; }
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
            <li><a href="/osint" style={{color:'#00ff88'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('ipMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="ipMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('ipMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">// OSINT Hub — Network Intelligence</div>
            </div>
            <div className="tool-title">IP Geolocation</div>
            <p className="tool-desc">Identify the geographic location, ISP, organization, and network details behind any IP address. Drop a pin on the map for any target worldwide.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter IP address — e.g. 8.8.8.8"
              value={ip}
              onChange={e => setIp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button className="search-btn" onClick={() => lookup()} disabled={loading}>
              {loading ? 'Scanning...' : 'Lookup →'}
            </button>
          </div>
          <button className="myip-btn" onClick={myIp}>⊕ Use My IP Address</button>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">// Geolocating target...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}
          {result && (
            <>
              <div className="map-wrap" ref={mapRef} />
              <div className="result-card">
                <div className="result-header">
                  <div className="result-ip">{result.ip}</div>
                  <div className="result-badge">// Record Found</div>
                </div>
                <div className="result-grid">

                  <div className="section-label">// Location</div>
                  <div className="result-field">
                    <div className="field-label">// Country</div>
                    <div className="field-value highlight">{result.country}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// Region</div>
                    <div className="field-value">{result.region}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// City</div>
                    <div className="field-value">{result.city}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// Postal Code</div>
                    <div className="field-value">{result.postal || 'N/A'}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// Coordinates</div>
                    <div className="field-value highlight">{result.loc}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// Timezone</div>
                    <div className="field-value">{result.timezone}</div>
                  </div>

                  <div className="section-label">// Network</div>
                  <div className="result-field">
                    <div className="field-label">// ISP / Organization</div>
                    <div className="field-value highlight">{result.org}</div>
                  </div>
                  <div className="result-field">
                    <div className="field-label">// Hostname</div>
                    <div className="field-value">{result.hostname || 'N/A'}</div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}