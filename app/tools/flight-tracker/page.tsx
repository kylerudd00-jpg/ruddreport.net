'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Flight {
  icao24: string; callsign: string; country: string;
  lon: number; lat: number; baroAlt: number; onGround: boolean;
  velocity: number; heading: number; vertRate: number;
  squawk: string; positionSource: number;
}
interface AircraftInfo {
  registration?: string; type?: string; icao_type?: string;
  manufacturer?: string; registered_owner?: string;
  registered_owner_country_name?: string;
  registered_owner_operator_flag_code?: string;
}
interface Airport {
  iata_code?: string; icao_code?: string; name?: string; municipality?: string;
  country_name?: string;
}
interface RouteInfo {
  callsign?: string; callsign_icao?: string; callsign_iata?: string;
  airline?: { name?: string; icao?: string; iata?: string; country?: string; callsign?: string };
  origin?: Airport; destination?: Airport;
}

function parseState(s: any[]): Flight | null {
  if (s[5] == null || s[6] == null) return null;
  return {
    icao24: s[0] || '', callsign: (s[1] || '').trim(), country: s[2] || '',
    lon: s[5], lat: s[6], baroAlt: s[7] ?? 0, onGround: !!s[8],
    velocity: s[9] ?? 0, heading: s[10] ?? 0, vertRate: s[11] ?? 0,
    squawk: s[14] || '', positionSource: s[16] ?? 0,
  };
}

const mToFt = (m: number) => Math.round(m * 3.28084).toLocaleString();
const msToKts = (ms: number) => Math.round(ms * 1.94384);
const msToKmh = (ms: number) => Math.round(ms * 3.6);
const ftMin = (ms: number) => Math.round(ms * 196.85);
const POS_SOURCES = ['ADS-B', 'ASTERIX', 'MLAT', 'FLARM'];
function compass(deg: number) {
  return ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg / 22.5) % 16];
}

export default function FlightTracker() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selected, setSelected] = useState<Flight | null>(null);
  const [aircraftInfo, setAircraftInfo] = useState<AircraftInfo | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingAircraft, setLoadingAircraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [lastUpdated, setLastUpdated] = useState('—');
  const [stats, setStats] = useState({ total: 0, airborne: 0, ground: 0 });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const selectedRef = useRef<Flight | null>(null);
  const flightsRef = useRef<Flight[]>([]);
  const searchRef = useRef('');

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { flightsRef.current = flights; }, [flights]);
  useEffect(() => { searchRef.current = search; }, [search]);

  // Fetch aircraft enrichment when selection changes
  useEffect(() => {
    if (!selected) { setAircraftInfo(null); setRouteInfo(null); return; }
    setAircraftInfo(null); setRouteInfo(null); setLoadingAircraft(true);
    const params = new URLSearchParams();
    if (selected.icao24) params.set('icao24', selected.icao24);
    if (selected.callsign) params.set('callsign', selected.callsign);
    fetch(`/api/flights/aircraft?${params}`)
      .then(r => r.json())
      .then(data => {
        setAircraftInfo(data.aircraft || null);
        setRouteInfo(data.route || null);
      })
      .catch(() => {})
      .finally(() => setLoadingAircraft(false));
  }, [selected?.icao24]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const init = async () => {
      const L = (await import('leaflet' as any)).default;
      if (mapInstanceRef.current || !mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapRef.current, { center: [30, 10], zoom: 2, scrollWheelZoom: true });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 12,
      }).addTo(map);
      rendererRef.current = L.canvas({ padding: 0.5 });
      layerGroupRef.current = L.layerGroup().addTo(map);
      map.invalidateSize();
    };
    setTimeout(init, 50);
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  const updateMarkers = useCallback(() => {
    const L = LRef.current; const lg = layerGroupRef.current; const renderer = rendererRef.current;
    if (!L || !lg || !renderer) return;
    lg.clearLayers();
    const q = searchRef.current.toUpperCase();
    const list = q
      ? flightsRef.current.filter(f => f.callsign.toUpperCase().includes(q) || f.country.toUpperCase().includes(q) || f.icao24.toUpperCase().includes(q))
      : flightsRef.current;
    list.forEach(f => {
      const isSel = selectedRef.current?.icao24 === f.icao24;
      const m = L.circleMarker([f.lat, f.lon], {
        renderer, radius: isSel ? 7 : f.onGround ? 2 : 3,
        color: isSel ? '#00ff88' : f.onGround ? '#3d5870' : '#1e9eff',
        fillColor: isSel ? '#00ff88' : f.onGround ? '#2a4055' : '#1e9eff',
        fillOpacity: isSel ? 1 : f.onGround ? 0.5 : 0.8, weight: isSel ? 2 : 0,
      });
      const label = f.callsign || f.icao24;
      if (label) m.bindTooltip(label, { sticky: true, className: 'fl-tooltip', offset: [10, 0] });
      m.on('click', () => { selectedRef.current = f; setSelected({ ...f }); updateMarkers(); });
      lg.addLayer(m);
    });
  }, []);

  const fetchFlights = useCallback(async () => {
    try {
      const res = await fetch('/api/flights');
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = (data.states || []).map(parseState).filter(Boolean) as Flight[];
      flightsRef.current = parsed;
      setFlights(parsed);
      const airborne = parsed.filter(f => !f.onGround).length;
      setStats({ total: parsed.length, airborne, ground: parsed.length - airborne });
      setLastUpdated(new Date().toUTCString().split(' ').slice(1, 5).join(' '));
      setLoading(false); setError(''); setCountdown(30);
      updateMarkers();
    } catch { setError('OpenSky data temporarily unavailable — retrying in 30s'); setLoading(false); }
  }, [updateMarkers]);

  useEffect(() => { fetchFlights(); const iv = setInterval(fetchFlights, 30_000); return () => clearInterval(iv); }, [fetchFlights]);
  useEffect(() => { const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { updateMarkers(); }, [search, updateMarkers]);

  const airline = routeInfo?.airline?.name || aircraftInfo?.registered_owner;
  const origin = routeInfo?.origin;
  const dest = routeInfo?.destination;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 1100; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .hero { padding: 48px 40px 36px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .hero-inner { max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .hero-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .hero-title span { color: #1e9eff; }
        .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; margin-bottom: 24px; max-width: 560px; line-height: 1.7; }
        .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
        .hero-stat { display: flex; flex-direction: column; gap: 3px; }
        .hero-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: #1e9eff; }
        .hero-stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .tool-section { padding: 24px 40px 40px; max-width: 1200px; margin: 0 auto; }
        .controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .search-box { display: flex; flex: 1; min-width: 200px; border: 1px solid rgba(30,158,255,0.2); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 11px 18px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .refresh-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.25); padding: 10px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .refresh-btn:hover { background: rgba(30,158,255,0.08); }
        .countdown-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; white-space: nowrap; }
        .content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 2px; }
        .map-panel { background: #050d14; border: 1px solid rgba(30,158,255,0.15); position: relative; isolation: isolate; }
        .map-inner { width: 100%; height: 580px; display: block; position: relative; }
        .leaflet-container { position: relative !important; }
        .leaflet-pane, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow, .leaflet-tile-container, .leaflet-pane > svg, .leaflet-pane > canvas, .leaflet-zoom-box, .leaflet-image-layer, .leaflet-layer { position: absolute; left: 0; top: 0; }
        .leaflet-tile { visibility: hidden; } .leaflet-tile-loaded { visibility: inherit; }
        .map-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #050d14; z-index: 2; }
        .map-loading-text { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .fl-tooltip { background: rgba(5,13,20,0.95) !important; border: 1px solid rgba(30,158,255,0.3) !important; color: #1e9eff !important; font-family: 'IBM Plex Mono', monospace !important; font-size: 10px !important; letter-spacing: 2px !important; padding: 4px 10px !important; border-radius: 0 !important; box-shadow: none !important; }
        .fl-tooltip::before { display: none !important; }
        .info-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); display: flex; flex-direction: column; overflow-y: auto; max-height: 580px; }
        .info-header { padding: 16px 20px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); flex-shrink: 0; }
        .info-header-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; margin-bottom: 6px; }
        .info-callsign { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; word-break: break-all; }
        .info-icao { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d5870; margin-top: 4px; letter-spacing: 2px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; }
        .status-badge.air { color: #1e9eff; } .status-badge.ground { color: #3d5870; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .status-badge.air .status-dot { box-shadow: 0 0 6px #1e9eff; animation: pulse 2s infinite; }
        .info-section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 10px 20px 6px; background: rgba(30,158,255,0.03); border-bottom: 1px solid rgba(30,158,255,0.06); border-top: 1px solid rgba(30,158,255,0.06); flex-shrink: 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .info-field { padding: 10px 20px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .info-field:nth-child(even) { border-right: none; }
        .info-field.full { grid-column: 1/-1; border-right: none; }
        .field-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 4px; }
        .field-value { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c0cfe0; word-break: break-word; line-height: 1.4; }
        .field-value.cyan { color: #00ffff; } .field-value.green { color: #00ff88; }
        .field-value.amber { color: #f59e0b; } .field-value.red { color: #ff3a3a; }
        .field-value.blue { color: #1e9eff; }
        .loading-row { padding: 14px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; animation: pulse 1.5s infinite; }
        .route-airport { display: flex; flex-direction: column; gap: 2px; }
        .route-iata { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #1e9eff; }
        .route-name { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #7a9bb5; letter-spacing: 1px; }
        .route-city { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #3d5870; letter-spacing: 1px; }
        .route-arrow { display: flex; align-items: center; justify-content: center; padding: 12px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 16px; color: #3d5870; border-bottom: 1px solid rgba(30,158,255,0.05); }
        .no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; padding: 40px 20px; text-align: center; }
        .no-selection-icon { font-size: 32px; opacity: 0.2; }
        .no-selection-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; line-height: 1.8; }
        .error-bar { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.2); padding: 10px 16px; margin-bottom: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #ff3a3a; }
        .legend { display: flex; gap: 20px; margin-top: 10px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .credit { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; margin-top: 8px; }
        .credit a { color: #1e9eff; text-decoration: none; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 32px 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.3;} }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .hero { padding: 32px 20px; } .tool-section { padding: 16px 20px 32px; }
          .content-grid { grid-template-columns: 1fr; }
          .map-inner { height: 360px; } .info-panel { max-height: none; min-height: 300px; }
          .hero-stats { gap: 24px; }
          footer { padding: 24px 20px; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
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
          <div className="hamburger" onClick={() => document.getElementById('ftMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="ftMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('ftMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/cybersecurity">Cybersecurity</a><a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a><a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">Aviation Intelligence</div></div>
            <div className="hero-title">Flight <span>Tracker</span></div>
            <p className="hero-sub">Live global air traffic via OpenSky Network. Click any aircraft for airline, aircraft type, registration, and origin/destination. Refreshes every 30 seconds.</p>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-num">{loading ? '—' : stats.total.toLocaleString()}</div><div className="hero-stat-label">Tracked</div></div>
              <div className="hero-stat"><div className="hero-stat-num">{loading ? '—' : stats.airborne.toLocaleString()}</div><div className="hero-stat-label">Airborne</div></div>
              <div className="hero-stat"><div className="hero-stat-num">{loading ? '—' : stats.ground.toLocaleString()}</div><div className="hero-stat-label">On Ground</div></div>
            </div>
          </div>
        </div>

        <div className="tool-section">
          {error && <div className="error-bar">{error}</div>}
          <div className="controls">
            <div className="search-box">
              <input className="search-input" placeholder="Filter by callsign, country, or ICAO24..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="refresh-btn" onClick={fetchFlights}>Refresh</button>
            <span className="countdown-tag">Next: {countdown}s</span>
          </div>

          <div className="content-grid">
            <div className="map-panel">
              {loading && <div className="map-loading"><div className="map-loading-text">Loading flight data...</div></div>}
              <div ref={mapRef} className="map-inner" />
            </div>

            <div className="info-panel">
              {selected ? (
                <>
                  <div className="info-header">
                    <div className="info-header-label">Selected Aircraft</div>
                    <div className="info-callsign">{selected.callsign || 'No Callsign'}</div>
                    <div className="info-icao">ICAO24: {selected.icao24.toUpperCase()}</div>
                    <div className={`status-badge ${selected.onGround ? 'ground' : 'air'}`}>
                      <div className="status-dot" />{selected.onGround ? 'On Ground' : 'Airborne'}
                    </div>
                  </div>

                  {/* Route */}
                  {loadingAircraft && <div className="loading-row">Fetching aircraft data...</div>}
                  {(origin || dest) && (
                    <>
                      <div className="info-section-label">Route</div>
                      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr'}}>
                        <div className="info-field full" style={{gridColumn:'unset', borderRight:'1px solid rgba(30,158,255,0.05)'}}>
                          <div className="field-label">Origin</div>
                          <div className="route-airport">
                            <div className="route-iata">{origin?.iata_code || origin?.icao_code || '—'}</div>
                            <div className="route-name">{origin?.name || '—'}</div>
                            <div className="route-city">{[origin?.municipality, origin?.country_name].filter(Boolean).join(', ')}</div>
                          </div>
                        </div>
                        <div className="route-arrow">→</div>
                        <div className="info-field full" style={{gridColumn:'unset'}}>
                          <div className="field-label">Destination</div>
                          <div className="route-airport">
                            <div className="route-iata">{dest?.iata_code || dest?.icao_code || '—'}</div>
                            <div className="route-name">{dest?.name || '—'}</div>
                            <div className="route-city">{[dest?.municipality, dest?.country_name].filter(Boolean).join(', ')}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Aircraft */}
                  {(aircraftInfo || routeInfo) && (
                    <>
                      <div className="info-section-label">Aircraft & Airline</div>
                      <div className="info-grid">
                        {airline && <div className="info-field full"><div className="field-label">Airline / Operator</div><div className="field-value blue">{airline}</div></div>}
                        {aircraftInfo?.type && <div className="info-field full"><div className="field-label">Aircraft Type</div><div className="field-value cyan">{aircraftInfo.type}</div></div>}
                        {aircraftInfo?.manufacturer && <div className="info-field"><div className="field-label">Manufacturer</div><div className="field-value">{aircraftInfo.manufacturer}</div></div>}
                        {aircraftInfo?.icao_type && <div className="info-field"><div className="field-label">ICAO Type</div><div className="field-value amber">{aircraftInfo.icao_type}</div></div>}
                        {aircraftInfo?.registration && <div className="info-field"><div className="field-label">Registration</div><div className="field-value green">{aircraftInfo.registration}</div></div>}
                        {aircraftInfo?.registered_owner_country_name && <div className="info-field"><div className="field-label">Reg. Country</div><div className="field-value">{aircraftInfo.registered_owner_country_name}</div></div>}
                        {routeInfo?.airline?.callsign && <div className="info-field full"><div className="field-label">Radio Callsign</div><div className="field-value">{routeInfo.airline.callsign}</div></div>}
                      </div>
                    </>
                  )}

                  {/* Navigation */}
                  <div className="info-section-label">Navigation</div>
                  <div className="info-grid">
                    <div className="info-field"><div className="field-label">Altitude</div><div className="field-value cyan">{selected.baroAlt > 0 ? `${mToFt(selected.baroAlt)} ft` : '—'}</div></div>
                    <div className="info-field"><div className="field-label">Alt (m)</div><div className="field-value">{selected.baroAlt > 0 ? `${Math.round(selected.baroAlt).toLocaleString()} m` : '—'}</div></div>
                    <div className="info-field"><div className="field-label">Speed</div><div className="field-value green">{msToKts(selected.velocity)} kts</div></div>
                    <div className="info-field"><div className="field-label">Speed km/h</div><div className="field-value">{msToKmh(selected.velocity)}</div></div>
                    <div className="info-field"><div className="field-label">Heading</div><div className="field-value amber">{Math.round(selected.heading)}° {compass(selected.heading)}</div></div>
                    <div className="info-field"><div className="field-label">Vertical</div><div className={`field-value ${selected.vertRate > 0 ? 'green' : selected.vertRate < 0 ? 'red' : ''}`}>{selected.vertRate >= 0 ? '+' : ''}{ftMin(selected.vertRate)} ft/min</div></div>
                  </div>

                  {/* Identification */}
                  <div className="info-section-label">Identification</div>
                  <div className="info-grid">
                    <div className="info-field full"><div className="field-label">Registered Country</div><div className="field-value">{selected.country || '—'}</div></div>
                    <div className="info-field"><div className="field-label">Squawk</div><div className="field-value">{selected.squawk || '—'}</div></div>
                    <div className="info-field"><div className="field-label">Data Source</div><div className="field-value">{POS_SOURCES[selected.positionSource] || '—'}</div></div>
                    <div className="info-field full"><div className="field-label">Position</div><div className="field-value">{selected.lat.toFixed(4)}°, {selected.lon.toFixed(4)}°</div></div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <div className="no-selection-icon">✈</div>
                  <div className="no-selection-text">Click any aircraft<br />to view full details</div>
                </div>
              )}
            </div>
          </div>

          <div className="legend">
            <div className="legend-item"><div className="legend-dot" style={{background:'#1e9eff'}} /> Airborne</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'#3d5870'}} /> On Ground</div>
            <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88'}} /> Selected</div>
          </div>
          <div className="credit">ADS-B: <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer">OpenSky Network</a> · Aircraft data: <a href="https://adsbdb.com" target="_blank" rel="noopener noreferrer">adsbdb.com</a> · Updated: {lastUpdated}</div>
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
