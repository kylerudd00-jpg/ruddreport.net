'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Flight {
  icao24: string; callsign: string; country: string;
  lon: number; lat: number; baroAlt: number; onGround: boolean;
  velocity: number; heading: number; vertRate: number;
  squawk: string; positionSource: number; category: number;
}

type FlightCat = 'commercial' | 'cargo' | 'private' | 'military' | 'helicopter' | 'other';
// Pure-cargo ICAO airline codes (operators that fly cargo only)
const CARGO_CS = ['UPS','FDX','GTI','ABX','CLX','DHK','DHX','CKS','ATN','SCI','CJT','PAC','WGN','NCR','MPH','BOX','MYZ','KFS','SWG','TPA','CAO','ACT','VKG'];

// Military callsign word prefixes (tactical / named callsigns)
const MIL_CS = [
  // USAF Air Mobility Command
  'RCH','REACH','RRR','SPAR','VENUS','VALOR',
  // USAF tactical
  'CHAOS','NOBLE','COLT','FURY','DOOM','PAVE','BUCK','SWIFT','DARK','DUST',
  'BONE','GRIM','RAGE','JAKE','HAVOC','GHOST','EVIL','THUD','WOLF','VIPER',
  'DEMON','SLAM','IRON','TALON','RAVEN','COBRA','MAGIC','SWORD','LANCER',
  'RAPTOR','REAPER','SHADOW','SABRE','DAGGER','BISON','RACER','CONAN',
  'HOMER','ROCKY','JOLLY','PEDRO','KING','SLUGGER','STEEL','VADER',
  // US Navy / Marines
  'CNV','NAVY','TRUK','MARINE','VMGR','VMR','CUTTER','BATT',
  // US Army
  'ARMY','MEDEVAC','DUSTOFF',
  // NATO / allied
  'CFC','LAGR','NATO','BUSR',
  // UK RAF
  'ASCOT','TARTAN','VORTEX','COMET','HERC',
  // German AF
  'GAF',
];

// Military ICAO24 hex address blocks (government/DoD allocations)
// US DoD: AE0000–AFFFFF (starts with 'ae' or 'af')
// UK military: 43C000–43FFFF (starts with '43c'–'43f')
// French military: 3B0000–3BFFFF (starts with '3b')
// German military: ~3CC000 range
const MIL_HEX_PREFIXES = ['ae','af','43c','43d','43e','43f','3b0','3b1','3b2','3b3'];

function getFlightCat(f: Flight): FlightCat {
  const cs = f.callsign.toUpperCase().trim();
  const icao = f.icao24.toLowerCase();

  // Military: ICAO24 DoD hex block OR known callsign prefix OR ADS-B high-perf category
  if (
    MIL_HEX_PREFIXES.some(h => icao.startsWith(h)) ||
    f.category === 7 ||
    MIL_CS.some(p => cs.startsWith(p))
  ) return 'military';

  // Helicopter: ADS-B category 8
  if (f.category === 8) return 'helicopter';

  // Cargo: known pure-cargo ICAO codes (check before commercial regex)
  if (CARGO_CS.some(p => cs.startsWith(p))) return 'cargo';

  // Commercial airline: ICAO callsign format = 3 letters + 1–4 digits (+ optional letter suffix)
  // e.g. RYR1234, BAW456, EZY78, DAL1, AAL123B
  if (/^[A-Z]{3}\d{1,4}[A-Z]?$/.test(cs)) return 'commercial';

  // ADS-B category fallbacks (for aircraft that actually broadcast category)
  if (f.category === 2 || f.category === 3) return 'private';
  if (f.category === 4 || f.category === 5 || f.category === 6) return 'commercial';

  return 'other';
}
const CAT_COLOR: Record<FlightCat, string> = {
  commercial: '#1e9eff', cargo: '#f59e0b', private: '#00ff88',
  military: '#ff4444', helicopter: '#a78bfa', other: '#4a6080',
};
const CAT_LABEL: Record<FlightCat, string> = {
  commercial: 'Commercial', cargo: 'Cargo', private: 'Private / GA',
  military: 'Military', helicopter: 'Helicopter', other: 'Other',
};
const ALL_CATS: FlightCat[] = ['commercial','cargo','private','military','helicopter','other'];
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
interface AirportFlight {
  icao24: string; callsign: string; country: string;
  lon: number; lat: number; baroAlt: number; onGround: boolean;
  velocity: number; heading: number; vertRate: number;
  squawk: string; positionSource: number; category: number;
}
interface LookupResult {
  found: boolean;
  registration: string;
  aircraft?: {
    type: string | null; icaoType?: string | null; manufacturer: string | null;
    registration: string; modeS: string | null; owner: string | null;
    ownerCountry: string | null; ownerIso: string | null; flagCode: string | null;
  } | null;
  photo?: {
    src: string | null; link: string | null; photographer: string | null;
    airline: string | null; airport: string | null; date: string | null;
  } | null;
}

function parseState(s: any[]): Flight | null {
  if (s[5] == null || s[6] == null) return null;
  return {
    icao24: s[0] || '', callsign: (s[1] || '').trim(), country: s[2] || '',
    lon: s[5], lat: s[6], baroAlt: s[7] ?? 0, onGround: !!s[8],
    velocity: s[9] ?? 0, heading: s[10] ?? 0, vertRate: s[11] ?? 0,
    squawk: s[14] || '', positionSource: s[16] ?? 0, category: s[17] ?? 0,
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
function fmtUnix(unix: number) {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return `${d.getUTCHours().toString().padStart(2,'0')}:${d.getUTCMinutes().toString().padStart(2,'0')} UTC`;
}
function fmtUnixFull(unix: number) {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return d.toUTCString().replace('GMT', 'UTC');
}

export default function AviationTracker() {
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
  const [catCounts, setCatCounts] = useState<Partial<Record<FlightCat, number>>>({});
  const [filterCat, setFilterCat] = useState<FlightCat | ''>('');
  const filterCatRef = useRef<FlightCat | ''>('');

  // Airport / lookup state
  const [activeTab, setActiveTab] = useState<'live' | 'departures' | 'arrivals' | 'lookup'>('live');
  const [airportInput, setAirportInput] = useState('');
  const [airportSearched, setAirportSearched] = useState('');
  const [airportFlights, setAirportFlights] = useState<AirportFlight[]>([]);
  const [airportLoading, setAirportLoading] = useState(false);
  const [airportError, setAirportError] = useState('');
  const [selectedAirportFlight, setSelectedAirportFlight] = useState<AirportFlight | null>(null);
  const [airportName, setAirportName] = useState('');
  const [airportCity, setAirportCity] = useState('');
  const [airportSort, setAirportSort] = useState<'alt' | 'speed' | 'callsign'>('alt');

  // Aircraft lookup state
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

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
  useEffect(() => { filterCatRef.current = filterCat; }, [filterCat]);

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

  // Invalidate map size when switching back to live tab
  useEffect(() => {
    if (activeTab === 'live' && mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 50);
    }
  }, [activeTab]);

  const updateMarkers = useCallback(() => {
    const L = LRef.current; const lg = layerGroupRef.current; const renderer = rendererRef.current;
    if (!L || !lg || !renderer) return;
    lg.clearLayers();
    const q = searchRef.current.toUpperCase();
    const fc = filterCatRef.current;
    let list = q
      ? flightsRef.current.filter(f => f.callsign.toUpperCase().includes(q) || f.country.toUpperCase().includes(q) || f.icao24.toUpperCase().includes(q))
      : flightsRef.current;
    if (fc) list = list.filter(f => getFlightCat(f) === fc);
    list.forEach(f => {
      const isSel = selectedRef.current?.icao24 === f.icao24;
      const cat = getFlightCat(f);
      const baseColor = f.onGround ? '#2a3d4f' : CAT_COLOR[cat];
      const m = L.circleMarker([f.lat, f.lon], {
        renderer,
        radius: isSel ? 7 : f.onGround ? 2 : 3,
        color: isSel ? '#ffffff' : baseColor,
        fillColor: isSel ? '#ffffff' : baseColor,
        fillOpacity: isSel ? 1 : f.onGround ? 0.35 : 0.85,
        weight: isSel ? 2 : 0,
      });
      const label = f.callsign || f.icao24;
      const catLabel = CAT_LABEL[cat];
      if (label) m.bindTooltip(`${label} · ${catLabel}`, { sticky: true, className: 'fl-tooltip', offset: [10, 0] });
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
      const counts: Partial<Record<FlightCat, number>> = {};
      parsed.forEach(f => { const c = getFlightCat(f); counts[c] = (counts[c] || 0) + 1; });
      setCatCounts(counts);
      setLastUpdated(new Date().toUTCString().split(' ').slice(1, 5).join(' '));
      setLoading(false); setError(''); setCountdown(30);
      updateMarkers();
    } catch { setError('OpenSky data temporarily unavailable — retrying in 30s'); setLoading(false); }
  }, [updateMarkers]);

  useEffect(() => { fetchFlights(); const iv = setInterval(fetchFlights, 30_000); return () => clearInterval(iv); }, [fetchFlights]);
  useEffect(() => { const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { updateMarkers(); }, [search, filterCat, updateMarkers]);

  const fetchAirportFlights = useCallback(async (tab: 'departures' | 'arrivals') => {
    if (!airportInput.trim()) return;
    setAirportLoading(true);
    setAirportError('');
    setAirportFlights([]);
    setSelectedAirportFlight(null);
    const type = tab === 'departures' ? 'departure' : 'arrival';
    const code = airportInput.trim().toUpperCase();
    try {
      const res = await fetch(`/api/flights/airport?airport=${encodeURIComponent(code)}&type=${type}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAirportFlights(data.flights || []);
      setAirportSearched(code);
      setAirportName(data.airportName || '');
      setAirportCity(data.airportCity || '');
    } catch (e: any) {
      setAirportError(e.message || 'Failed to fetch airport data');
    } finally {
      setAirportLoading(false);
    }
  }, [airportInput]);

  const fetchAircraftLookup = useCallback(async () => {
    if (!lookupInput.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupResult(null);
    try {
      const res = await fetch(`/api/aircraft/lookup?reg=${encodeURIComponent(lookupInput.trim().toUpperCase())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLookupResult(data);
    } catch (e: any) {
      setLookupError(e.message || 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  }, [lookupInput]);

  const handleTabChange = (tab: 'live' | 'departures' | 'arrivals' | 'lookup') => {
    setActiveTab(tab);
    setSelectedAirportFlight(null);
    if (tab !== 'live' && airportSearched && airportInput === airportSearched) {
      fetchAirportFlights(tab as 'departures' | 'arrivals');
    }
  };

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
        .hero-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .hero-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .hero-title span { color: #1e9eff; }
        .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; margin-bottom: 24px; max-width: 560px; line-height: 1.7; }
        .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
        .hero-stat { display: flex; flex-direction: column; gap: 3px; }
        .hero-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 700; color: #1e9eff; }
        .hero-stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .tool-section { padding: 24px 40px 40px; max-width: 1200px; margin: 0 auto; }

        /* Tabs */
        .tab-bar { display: flex; gap: 0; border-bottom: 1px solid rgba(30,158,255,0.15); margin-bottom: 16px; }
        .tab-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 12px 24px; background: none; border: none; color: #3d5870; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; bottom: -1px; }
        .tab-btn:hover { color: #7a9bb5; }
        .tab-btn.active { color: #1e9eff; border-bottom-color: #1e9eff; }
        .tab-btn.tab-dep.active { color: #00ff88; border-bottom-color: #00ff88; }
        .tab-btn.tab-arr.active { color: #f59e0b; border-bottom-color: #f59e0b; }

        .controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .search-box { display: flex; flex: 1; min-width: 200px; border: 1px solid rgba(30,158,255,0.2); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 11px 18px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .refresh-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.25); padding: 10px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .refresh-btn:hover { background: rgba(30,158,255,0.08); }
        .countdown-tag { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; white-space: nowrap; }

        /* Airport search */
        .airport-controls { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .airport-hint { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .airport-search-box { display: flex; border: 1px solid rgba(30,158,255,0.25); background: #0a1520; flex: 0 0 auto; }
        .airport-input { background: none; border: none; outline: none; padding: 11px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 3px; width: 160px; text-transform: uppercase; }
        .airport-input::placeholder { color: #3d5870; letter-spacing: 2px; text-transform: none; }
        .airport-search-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; padding: 11px 20px; border: none; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .airport-search-btn.dep { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.25); }
        .airport-search-btn.dep:hover { background: rgba(0,255,136,0.18); }
        .airport-search-btn.arr { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.25); }
        .airport-search-btn.arr:hover { background: rgba(245,158,11,0.18); }

        /* Airport results */
        .airport-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2px; }
        .airport-results { background: #050d14; border: 1px solid rgba(30,158,255,0.15); overflow-y: auto; max-height: 580px; }
        .airport-results-header { padding: 12px 20px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .airport-results-title { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; }
        .airport-results-count { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; }
        .flight-row { display: grid; grid-template-columns: 120px 1fr 1fr 100px; gap: 0; border-bottom: 1px solid rgba(30,158,255,0.06); cursor: pointer; transition: background 0.15s; }
        .flight-row:hover { background: rgba(30,158,255,0.04); }
        .flight-row.selected-row { background: rgba(30,158,255,0.08); }
        .flight-col { padding: 12px 16px; display: flex; flex-direction: column; gap: 3px; }
        .flight-col-label { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .flight-col-val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; }
        .flight-callsign { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1px; color: #1e9eff; }
        .flight-icao { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #3d5870; margin-top: 2px; }
        .flight-airport-code { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; }
        .flight-airport-code.dep-color { color: #00ff88; }
        .flight-airport-code.arr-color { color: #f59e0b; }
        .flight-airport-code.neutral { color: #7a9bb5; }
        .flight-time { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; }
        .flight-col-header { display: grid; grid-template-columns: 120px 1fr 1fr 100px; gap: 0; border-bottom: 1px solid rgba(30,158,255,0.12); background: rgba(30,158,255,0.03); }
        .flight-col-header > div { padding: 8px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .airport-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 12px; text-align: center; }
        .airport-empty-icon { font-size: 28px; opacity: 0.15; }
        .airport-empty-text { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; line-height: 2; }
        .airport-loading { display: flex; align-items: center; justify-content: center; padding: 60px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; animation: pulse 1.5s infinite; }
        .airport-error { margin-bottom: 12px; background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.2); padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #ff3a3a; line-height: 1.6; }

        /* Airport flight detail panel */
        .ap-detail { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); display: flex; flex-direction: column; overflow-y: auto; max-height: 580px; }
        .ap-no-selection { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 12px; padding: 40px 20px; text-align: center; }
        .ap-no-selection-icon { font-size: 28px; opacity: 0.2; }
        .ap-no-selection-text { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; line-height: 1.8; }

        /* Aircraft lookup */
        .lookup-wrap { max-width: 860px; }
        .lookup-search-row { display: flex; gap: 10px; align-items: center; margin-bottom: 24px; flex-wrap: wrap; }
        .lookup-input-box { display: flex; flex: 1; min-width: 220px; border: 1px solid rgba(30,158,255,0.25); background: #0a1520; }
        .lookup-input { flex: 1; background: none; border: none; outline: none; padding: 13px 18px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 3px; text-transform: uppercase; }
        .lookup-input::placeholder { color: #3d5870; letter-spacing: 1px; text-transform: none; font-size: 12px; }
        .lookup-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; padding: 13px 24px; background: rgba(30,158,255,0.1); border: 1px solid rgba(30,158,255,0.3); color: #1e9eff; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .lookup-btn:hover:not(:disabled) { background: rgba(30,158,255,0.18); }
        .lookup-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .lookup-card { display: grid; grid-template-columns: 320px 1fr; gap: 2px; border: 1px solid rgba(30,158,255,0.15); }
        .lookup-photo { background: #050d14; position: relative; overflow: hidden; min-height: 240px; display: flex; align-items: center; justify-content: center; }
        .lookup-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lookup-photo-credit { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 10px; background: rgba(3,6,8,0.8); font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
        .lookup-photo-none { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .lookup-details { background: #0a1520; }
        .lookup-details-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.03); }
        .lookup-reg { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 900; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .lookup-type { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 600; color: #c0cfe0; margin-top: 4px; letter-spacing: 0.5px; }
        .lookup-owner { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #7a9bb5; margin-top: 4px; letter-spacing: 1px; }
        .lookup-fields { display: grid; grid-template-columns: 1fr 1fr; }
        .lookup-field { padding: 12px 24px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .lookup-field:nth-child(even) { border-right: none; }
        .lookup-field.full { grid-column: 1/-1; border-right: none; }
        .lookup-not-found { padding: 48px 24px; text-align: center; border: 1px solid rgba(30,158,255,0.1); }
        .lookup-not-found-icon { font-size: 36px; opacity: 0.15; margin-bottom: 16px; }
        .lookup-not-found-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; line-height: 2; }
        .lookup-hint { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 14px; }
        .lookup-examples { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .lookup-example { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; border: 1px solid rgba(30,158,255,0.1); padding: 4px 10px; cursor: pointer; transition: all 0.15s; text-transform: uppercase; }
        .lookup-example:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        @media (max-width: 768px) { .lookup-card { grid-template-columns: 1fr; } .lookup-photo { min-height: 180px; } }
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
        /* Category filter bar */
        .cat-bar { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .cat-btn { display: flex; align-items: center; gap: 7px; padding: 6px 14px; background: rgba(10,21,32,0.8); border: 1px solid rgba(30,158,255,0.15); font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #3d5870; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .cat-btn:hover { border-color: rgba(30,158,255,0.3); color: #7a9bb5; }
        .cat-btn.active { color: #fff; }
        .cat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .cat-count { font-size: 8px; opacity: 0.6; margin-left: 2px; }
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
          .airport-grid { grid-template-columns: 1fr; }
          .flight-row { grid-template-columns: 1fr 1fr; }
          .flight-col-header { grid-template-columns: 1fr 1fr; }
          .flight-col:nth-child(n+3) { display: none; }
          .flight-col-header > div:nth-child(n+3) { display: none; }
          .map-inner { height: 360px; } .info-panel { max-height: none; min-height: 300px; }
          .airport-results { max-height: none; } .ap-detail { max-height: none; min-height: 280px; }
          .hero-stats { gap: 24px; }
          footer { padding: 24px 20px; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
          .tab-btn { padding: 10px 14px; font-size: 9px; }
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
            <div className="hero-title">Aviation <span>Tracker</span></div>
            <p className="hero-sub">Every commercial and most private aircraft broadcast their position, altitude, and speed in real time via ADS-B transponders — and it's all public. Track live flights color-coded by type, check what's arriving and departing any major airport, or search a tail number to find who owns the aircraft, its registration, and a photo.</p>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-num">{loading ? '—' : stats.total.toLocaleString()}</div><div className="hero-stat-label">Live ADS-B</div></div>
            </div>
          </div>
        </div>

        <div className="tool-section">
          {/* Tab bar */}
          <div className="tab-bar">
            <button className={`tab-btn${activeTab === 'live' ? ' active' : ''}`} onClick={() => handleTabChange('live')}>Live Map</button>
            <button className={`tab-btn tab-dep${activeTab === 'departures' ? ' active' : ''}`} onClick={() => handleTabChange('departures')}>Departures</button>
            <button className={`tab-btn tab-arr${activeTab === 'arrivals' ? ' active' : ''}`} onClick={() => handleTabChange('arrivals')}>Arrivals</button>
            <button className={`tab-btn${activeTab === 'lookup' ? ' active' : ''}`} style={activeTab === 'lookup' ? {color:'#a78bfa', borderBottomColor:'#a78bfa'} : {}} onClick={() => handleTabChange('lookup')}>Aircraft Lookup</button>
          </div>

          {/* Live Map tab — always mounted so Leaflet ref stays alive */}
          <div style={{display: activeTab === 'live' ? 'block' : 'none'}}>
            <>
              {error && <div className="error-bar">{error}</div>}
              <div className="controls">
                <div className="search-box">
                  <input className="search-input" placeholder="Filter by callsign, country, or ICAO24..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="refresh-btn" onClick={fetchFlights}>Refresh</button>
                <span className="countdown-tag">Next: {countdown}s</span>
              </div>

              {/* Category filter */}
              <div className="cat-bar">
                <button
                  className={`cat-btn${filterCat === '' ? ' active' : ''}`}
                  style={filterCat === '' ? { borderColor: '#1e9eff', background: 'rgba(30,158,255,0.1)', color: '#1e9eff' } : {}}
                  onClick={() => setFilterCat('')}
                >
                  All <span className="cat-count">({stats.total.toLocaleString()})</span>
                </button>
                {ALL_CATS.map(cat => (
                  <button
                    key={cat}
                    className={`cat-btn${filterCat === cat ? ' active' : ''}`}
                    style={filterCat === cat ? { borderColor: CAT_COLOR[cat], background: `${CAT_COLOR[cat]}18`, color: CAT_COLOR[cat] } : {}}
                    onClick={() => setFilterCat(f => f === cat ? '' : cat)}
                  >
                    <span className="cat-dot" style={{ background: CAT_COLOR[cat] }} />
                    {CAT_LABEL[cat]}
                    {catCounts[cat] ? <span className="cat-count">({catCounts[cat]!.toLocaleString()})</span> : null}
                  </button>
                ))}
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
                        <div style={{display:'flex', gap:'10px', alignItems:'center', marginTop:'8px', flexWrap:'wrap'}}>
                          <div className={`status-badge ${selected.onGround ? 'ground' : 'air'}`}>
                            <div className="status-dot" />{selected.onGround ? 'On Ground' : 'Airborne'}
                          </div>
                          <span style={{fontFamily:"'IBM Plex Mono', monospace", fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', padding:'2px 8px', border:`1px solid ${CAT_COLOR[getFlightCat(selected)]}40`, color: CAT_COLOR[getFlightCat(selected)], background:`${CAT_COLOR[getFlightCat(selected)]}10`}}>
                            {CAT_LABEL[getFlightCat(selected)]}
                          </span>
                        </div>
                      </div>

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

                      <div className="info-section-label">Navigation</div>
                      <div className="info-grid">
                        <div className="info-field"><div className="field-label">Altitude</div><div className="field-value cyan">{selected.baroAlt > 0 ? `${mToFt(selected.baroAlt)} ft` : '—'}</div></div>
                        <div className="info-field"><div className="field-label">Alt (m)</div><div className="field-value">{selected.baroAlt > 0 ? `${Math.round(selected.baroAlt).toLocaleString()} m` : '—'}</div></div>
                        <div className="info-field"><div className="field-label">Speed</div><div className="field-value green">{msToKts(selected.velocity)} kts</div></div>
                        <div className="info-field"><div className="field-label">Speed km/h</div><div className="field-value">{msToKmh(selected.velocity)}</div></div>
                        <div className="info-field"><div className="field-label">Heading</div><div className="field-value amber">{Math.round(selected.heading)}° {compass(selected.heading)}</div></div>
                        <div className="info-field"><div className="field-label">Vertical</div><div className={`field-value ${selected.vertRate > 0 ? 'green' : selected.vertRate < 0 ? 'red' : ''}`}>{selected.vertRate >= 0 ? '+' : ''}{ftMin(selected.vertRate)} ft/min</div></div>
                      </div>

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
                {ALL_CATS.map(cat => (
                  <div key={cat} className="legend-item">
                    <div className="legend-dot" style={{background: CAT_COLOR[cat]}} />
                    {CAT_LABEL[cat]}
                  </div>
                ))}
                <div className="legend-item"><div className="legend-dot" style={{background:'#2a3d4f', border:'1px solid #3d5870'}} /> On Ground</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'#fff'}} /> Selected</div>
              </div>
              <div className="credit">ADS-B: <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer">OpenSky Network</a> · Aircraft data: <a href="https://adsbdb.com" target="_blank" rel="noopener noreferrer">adsbdb.com</a> · Updated: {lastUpdated}</div>
            </>
          </div>

          {/* Departures / Arrivals tabs */}
          {(activeTab === 'departures' || activeTab === 'arrivals') && (
            <>
              <div className="airport-hint">
                Enter a 4-letter ICAO airport code — e.g. KLAX, KJFK, EGLL, EDDF, OMDB · Live traffic within ~100 km of airport
              </div>
              <div className="airport-controls">
                <div className="airport-search-box">
                  <input
                    className="airport-input"
                    placeholder="ICAO code..."
                    value={airportInput}
                    onChange={e => setAirportInput(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') fetchAirportFlights(activeTab); }}
                    maxLength={4}
                  />
                </div>
                <button
                  className={`airport-search-btn ${activeTab === 'departures' ? 'dep' : 'arr'}`}
                  onClick={() => fetchAirportFlights(activeTab)}
                  disabled={airportLoading || !airportInput.trim()}
                >
                  {airportLoading ? 'Searching...' : activeTab === 'departures' ? 'Find Departures' : 'Find Arrivals'}
                </button>
              </div>

              {airportError && <div className="airport-error">{airportError}</div>}

              <div className="airport-grid">
                <div className="airport-results">
                  <div className="airport-results-header">
                    <div className="airport-results-title">
                      {airportSearched
                        ? `${activeTab === 'departures' ? 'Departures from' : 'Arrivals at'} ${airportName || airportSearched}${airportCity ? ` — ${airportCity}` : ''}`
                        : activeTab === 'departures' ? 'Departure Flights' : 'Arrival Flights'}
                    </div>
                    {airportFlights.length > 0 && (
                      <div className="airport-results-count">{airportFlights.length} flights</div>
                    )}
                  </div>

                  {airportLoading && (
                    <div className="airport-loading">Querying OpenSky Network...</div>
                  )}

                  {!airportLoading && airportFlights.length === 0 && !airportError && (
                    <div className="airport-empty">
                      <div className="airport-empty-icon">{activeTab === 'departures' ? '🛫' : '🛬'}</div>
                      <div className="airport-empty-text">
                        {airportSearched
                          ? `No ${activeTab} found for ${airportSearched}\nin the last 2 hours`
                          : `Enter an airport ICAO code\nand search to see ${activeTab}`}
                      </div>
                    </div>
                  )}

                  {airportFlights.length > 0 && (
                    <>
                      {/* Sort controls */}
                      <div style={{display:'flex', gap:'6px', padding:'8px 16px', borderBottom:'1px solid rgba(30,158,255,0.08)', alignItems:'center'}}>
                        <span style={{fontFamily:"'IBM Plex Mono', monospace", fontSize:'8px', letterSpacing:'3px', color:'#3d5870', textTransform:'uppercase', marginRight:'4px'}}>Sort:</span>
                        {(['alt','speed','callsign'] as const).map(s => (
                          <button key={s} onClick={() => setAirportSort(s)} style={{fontFamily:"'IBM Plex Mono', monospace", fontSize:'8px', letterSpacing:'2px', textTransform:'uppercase', padding:'3px 10px', background: airportSort===s ? 'rgba(30,158,255,0.12)' : 'none', border: airportSort===s ? '1px solid rgba(30,158,255,0.35)' : '1px solid rgba(30,158,255,0.1)', color: airportSort===s ? '#1e9eff' : '#3d5870', cursor:'pointer'}}>
                            {s === 'alt' ? 'Altitude' : s === 'speed' ? 'Speed' : 'Callsign'}
                          </button>
                        ))}
                      </div>
                      <div className="flight-col-header">
                        <div>Flight</div>
                        <div>Status / Alt</div>
                        <div>Speed</div>
                        <div>Vert Rate</div>
                      </div>
                      {[...airportFlights].sort((a, b) => {
                        if (airportSort === 'speed') return b.velocity - a.velocity;
                        if (airportSort === 'callsign') return (a.callsign || a.icao24).localeCompare(b.callsign || b.icao24);
                        // Default: on-ground first, then ascending altitude
                        if (a.onGround !== b.onGround) return a.onGround ? -1 : 1;
                        return a.baroAlt - b.baroAlt;
                      }).map((f, i) => {
                        const isSel = selectedAirportFlight?.icao24 === f.icao24;
                        const cat = getFlightCat(f);
                        const vr = f.vertRate;
                        const vrColor = vr > 0.5 ? '#00ff88' : vr < -0.5 ? '#f59e0b' : '#3d5870';
                        return (
                          <div
                            key={`${f.icao24}-${i}`}
                            className={`flight-row${isSel ? ' selected-row' : ''}`}
                            onClick={() => setSelectedAirportFlight(isSel ? null : f)}
                          >
                            <div className="flight-col">
                              <div className="flight-callsign" style={{color: CAT_COLOR[cat]}}>{f.callsign || '—'}</div>
                              <div className="flight-icao">{f.icao24.toUpperCase()}</div>
                            </div>
                            <div className="flight-col">
                              <div className="flight-col-label">Status</div>
                              {f.onGround
                                ? <div className="flight-col-val" style={{color:'#3d5870'}}>On Ground</div>
                                : <div className="flight-col-val" style={{color:'#1e9eff'}}>{mToFt(f.baroAlt)} ft</div>
                              }
                            </div>
                            <div className="flight-col">
                              <div className="flight-col-label">Speed</div>
                              <div className="flight-col-val">{msToKts(f.velocity)} kts</div>
                            </div>
                            <div className="flight-col">
                              <div className="flight-col-label">Vert Rate</div>
                              <div className="flight-col-val" style={{color: vrColor}}>
                                {f.onGround ? '—' : `${vr >= 0 ? '+' : ''}${ftMin(f.vertRate)} fpm`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Detail panel for selected airport flight */}
                <div className="ap-detail">
                  {selectedAirportFlight ? (() => {
                    const f = selectedAirportFlight;
                    const cat = getFlightCat(f);
                    const vr = f.vertRate;
                    return (
                      <>
                        <div className="info-header">
                          <div className="info-header-label">{activeTab === 'departures' ? 'Departure Detail' : 'Arrival Detail'}</div>
                          <div className="info-callsign">{f.callsign || 'No Callsign'}</div>
                          <div className="info-icao">ICAO24: {f.icao24.toUpperCase()}</div>
                          <div style={{display:'flex', gap:'8px', marginTop:'8px', flexWrap:'wrap'}}>
                            <span className={`status-badge ${f.onGround ? 'ground' : 'air'}`}>
                              <span className="status-dot" />{f.onGround ? 'On Ground' : 'Airborne'}
                            </span>
                            <span style={{fontFamily:"'IBM Plex Mono', monospace", fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', padding:'2px 8px', border:`1px solid ${CAT_COLOR[cat]}40`, color:CAT_COLOR[cat], background:`${CAT_COLOR[cat]}10`}}>
                              {CAT_LABEL[cat]}
                            </span>
                          </div>
                        </div>
                        <div className="info-section-label">Navigation</div>
                        <div className="info-grid">
                          <div className="info-field"><div className="field-label">Altitude</div><div className="field-value cyan">{f.baroAlt > 0 ? `${mToFt(f.baroAlt)} ft` : 'Ground'}</div></div>
                          <div className="info-field"><div className="field-label">Alt (m)</div><div className="field-value">{f.baroAlt > 0 ? `${Math.round(f.baroAlt).toLocaleString()} m` : '—'}</div></div>
                          <div className="info-field"><div className="field-label">Speed</div><div className="field-value green">{msToKts(f.velocity)} kts</div></div>
                          <div className="info-field"><div className="field-label">Speed km/h</div><div className="field-value">{msToKmh(f.velocity)}</div></div>
                          <div className="info-field"><div className="field-label">Heading</div><div className="field-value amber">{Math.round(f.heading)}° {compass(f.heading)}</div></div>
                          <div className="info-field"><div className="field-label">Vert Rate</div><div className={`field-value ${vr > 0 ? 'green' : vr < 0 ? 'red' : ''}`}>{f.onGround ? '—' : `${vr >= 0 ? '+' : ''}${ftMin(vr)} fpm`}</div></div>
                        </div>
                        <div className="info-section-label">Identification</div>
                        <div className="info-grid">
                          <div className="info-field full"><div className="field-label">Callsign</div><div className="field-value blue">{f.callsign || '—'}</div></div>
                          <div className="info-field full"><div className="field-label">ICAO24 Transponder</div><div className="field-value green">{f.icao24.toUpperCase()}</div></div>
                          <div className="info-field full"><div className="field-label">Registered Country</div><div className="field-value">{f.country || '—'}</div></div>
                          <div className="info-field"><div className="field-label">Squawk</div><div className="field-value">{f.squawk || '—'}</div></div>
                          <div className="info-field"><div className="field-label">Data Source</div><div className="field-value">{POS_SOURCES[f.positionSource] || '—'}</div></div>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="ap-no-selection">
                      <div className="ap-no-selection-icon">{activeTab === 'departures' ? '🛫' : '🛬'}</div>
                      <div className="ap-no-selection-text">Select a flight<br />to view details</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="credit" style={{marginTop:'10px'}}>
                Live ADS-B: <a href="https://opensky-network.org" target="_blank" rel="noopener noreferrer">OpenSky Network</a> · Aircraft within 100 km of airport · Departures = climbing or on ground · Arrivals = descending or landed
              </div>
            </>
          )}

          {/* Aircraft Lookup tab */}
          {activeTab === 'lookup' && (
            <div className="lookup-wrap">
              <div className="lookup-hint">
                Enter a tail number / registration — works for grounded &amp; airborne aircraft worldwide
              </div>
              <div className="lookup-search-row">
                <div className="lookup-input-box">
                  <input
                    className="lookup-input"
                    placeholder="Tail number / registration..."
                    value={lookupInput}
                    onChange={e => setLookupInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') fetchAircraftLookup(); }}
                  />
                </div>
                <button className="lookup-btn" onClick={fetchAircraftLookup} disabled={lookupLoading || !lookupInput.trim()}>
                  {lookupLoading ? 'Searching...' : 'Look Up'}
                </button>
              </div>

              {lookupError && <div className="airport-error">{lookupError}</div>}

              {lookupLoading && (
                <div className="airport-loading">Querying aircraft databases...</div>
              )}

              {lookupResult && !lookupResult.found && (
                <div className="lookup-not-found">
                  <div className="lookup-not-found-icon">✈</div>
                  <div className="lookup-not-found-text">No records found for &quot;{lookupResult.registration}&quot;<br />Check the registration format and try again</div>
                </div>
              )}

              {lookupResult?.found && lookupResult.aircraft && (
                <div className="lookup-card">
                  {/* Photo panel */}
                  <div className="lookup-photo">
                    {lookupResult.photo?.src ? (
                      <>
                        <img src={lookupResult.photo.src} alt={lookupResult.registration} />
                        {lookupResult.photo.photographer && (
                          <div className="lookup-photo-credit">
                            Photo: {lookupResult.photo.photographer}
                            {lookupResult.photo.airport ? ` · ${lookupResult.photo.airport}` : ''}
                            {lookupResult.photo.date ? ` · ${lookupResult.photo.date}` : ''}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="lookup-photo-none">No photo available</div>
                    )}
                  </div>

                  {/* Details panel */}
                  <div className="lookup-details">
                    <div className="lookup-details-header">
                      <div className="lookup-reg">{lookupResult.aircraft.registration}</div>
                      {lookupResult.aircraft.type && <div className="lookup-type">{lookupResult.aircraft.type}</div>}
                      {lookupResult.aircraft.owner && <div className="lookup-owner">{lookupResult.aircraft.owner}</div>}
                    </div>
                    <div className="lookup-fields">
                      {lookupResult.aircraft.manufacturer && (
                        <div className="lookup-field">
                          <div className="field-label">Manufacturer</div>
                          <div className="field-value">{lookupResult.aircraft.manufacturer}</div>
                        </div>
                      )}
                      {lookupResult.aircraft.icaoType && (
                        <div className="lookup-field">
                          <div className="field-label">ICAO Type</div>
                          <div className="field-value amber">{lookupResult.aircraft.icaoType}</div>
                        </div>
                      )}
                      {lookupResult.aircraft.owner && (
                        <div className="lookup-field">
                          <div className="field-label">Registered Owner</div>
                          <div className="field-value blue">{lookupResult.aircraft.owner}</div>
                        </div>
                      )}
                      {lookupResult.aircraft.ownerCountry && (
                        <div className="lookup-field">
                          <div className="field-label">Country of Registration</div>
                          <div className="field-value">{lookupResult.aircraft.ownerCountry}</div>
                        </div>
                      )}
                      {lookupResult.aircraft.modeS && (
                        <div className="lookup-field">
                          <div className="field-label">Mode-S / ICAO24</div>
                          <div className="field-value green" style={{letterSpacing:'2px'}}>{lookupResult.aircraft.modeS.toUpperCase()}</div>
                        </div>
                      )}
                      {lookupResult.aircraft.flagCode && (
                        <div className="lookup-field">
                          <div className="field-label">Operator Code</div>
                          <div className="field-value cyan">{lookupResult.aircraft.flagCode}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="credit" style={{marginTop:'14px'}}>
                Aircraft data: <a href="https://adsbdb.com" target="_blank" rel="noopener noreferrer">adsbdb.com</a> · Photos: <a href="https://planespotters.net" target="_blank" rel="noopener noreferrer">Planespotters.net</a>
              </div>
            </div>
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
