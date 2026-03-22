'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const MID: Record<string, string> = {
  '201':'Albania','202':'Andorra','203':'Austria','205':'Belgium','206':'Belarus','207':'Bulgaria',
  '209':'Cyprus','210':'Cyprus','211':'Germany','213':'Georgia','215':'Malta','218':'Germany',
  '219':'Denmark','220':'Denmark','224':'Spain','225':'Spain','226':'France','227':'France',
  '228':'France','230':'Finland','232':'United Kingdom','233':'United Kingdom','234':'United Kingdom',
  '235':'United Kingdom','236':'Gibraltar','237':'Greece','238':'Croatia','239':'Greece',
  '240':'Greece','241':'Greece','244':'Netherlands','245':'Netherlands','246':'Netherlands',
  '247':'Italy','248':'Malta','249':'Malta','250':'Ireland','251':'Iceland','253':'Luxembourg',
  '255':'Madeira (Portugal)','257':'Norway','258':'Norway','259':'Norway','261':'Poland',
  '262':'Montenegro','263':'Portugal','264':'Romania','265':'Sweden','266':'Sweden',
  '269':'Switzerland','270':'Czech Republic','271':'Turkey','272':'Ukraine','273':'Russia',
  '275':'Latvia','276':'Estonia','277':'Lithuania','278':'Slovenia','279':'Serbia',
  '303':'USA (Alaska)','304':'Antigua & Barbuda','308':'Bahamas','309':'Bahamas','310':'Bermuda',
  '311':'Bahamas','312':'Belize','314':'Barbados','316':'Canada','319':'Cayman Islands',
  '321':'Costa Rica','323':'Cuba','325':'Dominica','327':'Dominican Republic','330':'Grenada',
  '332':'Guatemala','334':'Honduras','336':'Haiti','338':'United States','339':'Jamaica',
  '341':'Saint Kitts & Nevis','343':'Saint Lucia','345':'Mexico','347':'Martinique',
  '348':'Montserrat','350':'Nicaragua','351':'Panama','352':'Panama','353':'Panama',
  '354':'Panama','355':'Panama','356':'Panama','357':'Panama','358':'Puerto Rico',
  '359':'El Salvador','362':'Trinidad & Tobago','366':'United States','367':'United States',
  '368':'United States','369':'United States','370':'Panama','371':'Panama','372':'Panama',
  '373':'Panama','374':'Panama','401':'Afghanistan','403':'Saudi Arabia','405':'Bangladesh',
  '408':'Bahrain','412':'China','413':'China','414':'China','416':'Taiwan','417':'Sri Lanka',
  '419':'India','422':'Iran','423':'Azerbaijan','425':'Iraq','428':'Israel','431':'Japan',
  '432':'Japan','434':'Turkmenistan','436':'Kazakhstan','437':'Uzbekistan','438':'Jordan',
  '440':'South Korea','441':'South Korea','443':'Palestine','445':'North Korea','447':'Kuwait',
  '450':'Lebanon','453':'Macau','455':'Maldives','457':'Mongolia','461':'Oman','463':'Pakistan',
  '466':'Qatar','468':'Syria','470':'UAE','471':'UAE','472':'Tajikistan','473':'Yemen',
  '477':'Hong Kong','503':'Australia','506':'Myanmar','508':'Brunei','510':'Micronesia',
  '512':'New Zealand','514':'Cambodia','515':'Cambodia','516':'Christmas Island',
  '518':'Cook Islands','520':'Fiji','525':'Indonesia','529':'Kiribati','531':'Laos',
  '533':'Malaysia','538':'Marshall Islands','540':'New Caledonia','542':'Niue','544':'Nauru',
  '548':'Philippines','553':'Papua New Guinea','557':'Solomon Islands','559':'American Samoa',
  '561':'Samoa','563':'Singapore','564':'Singapore','565':'Singapore','566':'Singapore',
  '567':'Thailand','570':'Tonga','572':'Tuvalu','574':'Vietnam','576':'Vanuatu','578':'Vietnam',
  '601':'South Africa','603':'Angola','605':'Algeria','610':'Benin','611':'Botswana',
  '613':'Cameroon','615':'Congo','619':'Ivory Coast','621':'Djibouti','622':'Egypt',
  '624':'Ethiopia','625':'Eritrea','626':'Gabon','627':'Ghana','629':'Gambia',
  '630':'Guinea-Bissau','631':'Equatorial Guinea','632':'Guinea','633':'Burkina Faso',
  '634':'Kenya','636':'Liberia','637':'Liberia','638':'South Sudan','642':'Libya',
  '644':'Lesotho','645':'Mauritius','647':'Madagascar','649':'Mali','650':'Mozambique',
  '654':'Mauritania','655':'Malawi','656':'Niger','657':'Nigeria','659':'Namibia',
  '661':'Rwanda','662':'Sudan','663':'Senegal','664':'Seychelles','666':'Somalia',
  '667':'Sierra Leone','671':'Togo','672':'Tunisia','674':'Tanzania','675':'Uganda',
  '676':'DR Congo','678':'Zambia','679':'Zimbabwe','701':'Argentina','710':'Brazil',
  '720':'Bolivia','725':'Chile','730':'Colombia','735':'Ecuador','740':'Falkland Islands',
  '750':'Guyana','755':'Paraguay','760':'Peru','765':'Suriname','770':'Uruguay','775':'Venezuela',
};

const VESSEL_TYPES: Record<string, string> = {
  '20':'Wing In Ground','21':'Wing In Ground — Hazardous A','30':'Fishing',
  '31':'Towing','32':'Towing (Large)','33':'Dredging / Underwater Ops',
  '34':'Diving Ops','35':'Military Ops','36':'Sailing','37':'Pleasure Craft',
  '40':'High Speed Craft','41':'High Speed Craft — Hazardous A',
  '50':'Pilot Vessel','51':'Search & Rescue','52':'Tug','53':'Port Tender',
  '54':'Anti-Pollution','55':'Law Enforcement','58':'Medical Transport',
  '59':'Non-Combatant','60':'Passenger','61':'Passenger — Hazardous A',
  '62':'Passenger — Hazardous B','63':'Passenger — Hazardous C',
  '64':'Passenger — Hazardous D','69':'Passenger — No Additional Info',
  '70':'Cargo','71':'Cargo — Hazardous A','72':'Cargo — Hazardous B',
  '73':'Cargo — Hazardous C','74':'Cargo — Hazardous D',
  '79':'Cargo — No Additional Info','80':'Tanker','81':'Tanker — Hazardous A',
  '82':'Tanker — Hazardous B','83':'Tanker — Hazardous C','84':'Tanker — Hazardous D',
  '89':'Tanker — No Additional Info','90':'Other','91':'Other — Hazardous A',
};

function decodeMmsi(mmsi: string): { country: string; type: string; mid: string } | null {
  const m = mmsi.replace(/\D/g, '');
  if (m.length !== 9) return null;
  let type = 'Ship Station', mid = m.slice(0, 3);
  if (m.startsWith('00')) { type = 'Coast Station'; mid = m.slice(2, 5); }
  else if (m.startsWith('0')) { type = 'Group of Ships'; mid = m.slice(1, 4); }
  else if (m.startsWith('111')) { type = 'SAR Aircraft'; mid = m.slice(3, 6); }
  else if (m.startsWith('970')) { type = 'AIS-SART (Survival Craft)'; mid = ''; }
  else if (m.startsWith('972')) { type = 'MOB Device'; mid = ''; }
  else if (m.startsWith('974')) { type = 'EPIRB'; mid = ''; }
  else if (m.startsWith('98')) { type = 'Craft Associated with Parent Ship'; mid = m.slice(2, 5); }
  else if (m.startsWith('99')) { type = 'Aid to Navigation'; mid = m.slice(2, 5); }
  const country = MID[mid] || (mid ? `Unknown (MID: ${mid})` : 'N/A');
  return { country, type, mid };
}

interface VesselData {
  mmsi: string; name: string; lat: number; lon: number;
  speed: number; course: number; shipType: number;
}
interface VesselResult {
  name?: string; mmsi?: string; imo?: string; callsign?: string; flag?: string;
  vessel_type?: string; vessel_type_code?: number; length?: number; width?: number;
  year_built?: number; gross_tonnage?: number; deadweight_tonnage?: number;
  latitude?: number; longitude?: number; speed?: number; course?: number;
  status?: string; current_port?: string; destination?: string; eta?: string;
  last_position_UTC?: string; draught?: number;
}

const NAV_STATUS: Record<string, string> = {
  '0':'Underway (Engine)','1':'At Anchor','2':'Not Under Command',
  '3':'Restricted Manoeuvrability','4':'Constrained by Draught',
  '5':'Moored','6':'Aground','7':'Engaged in Fishing',
  '8':'Underway (Sailing)','15':'Not Defined',
};

function vesselColor(type: number): string {
  if (type >= 70 && type <= 79) return '#1e9eff';
  if (type >= 80 && type <= 89) return '#ff3a3a';
  if (type >= 60 && type <= 69) return '#00ff88';
  if (type === 30) return '#f59e0b';
  if (type === 35) return '#cc0000';
  if (type === 36 || type === 37) return '#00ffff';
  if (type === 51 || type === 52) return '#a78bfa';
  return '#7a9bb5';
}

export default function VesselTracker() {
  const [mode, setMode] = useState<'mmsi' | 'name'>('mmsi');
  const [input, setInput] = useState('');
  const [mmsiInfo, setMmsiInfo] = useState<ReturnType<typeof decodeMmsi>>(null);
  const [results, setResults] = useState<VesselResult[] | null>(null);
  const [selected, setSelected] = useState<VesselResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noKey, setNoKey] = useState(false);
  const [wsStatus, setWsStatus] = useState<'idle'|'connecting'|'connected'|'live'|'no-key'|'error'>('idle');
  const [wsError, setWsError] = useState('');
  const [vesselCount, setVesselCount] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const vesselMarkersRef = useRef<Map<string, any>>(new Map());
  const vesselLayerRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const drawTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // All vessel positions received from AIS stream
  const vesselDataRef = useRef<Map<string, VesselData>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const wsLiveRef = useRef(false);

  // Update Leaflet markers from vesselDataRef for current viewport
  const updateMapMarkers = useCallback(() => {
    const L = LRef.current;
    const layer = vesselLayerRef.current;
    const map = mapRef.current;
    if (!L || !layer || !map) return;

    const bounds = map.getBounds();
    const seen = new Set<string>();

    for (const v of vesselDataRef.current.values()) {
      if (!bounds.contains([v.lat, v.lon])) continue;
      seen.add(v.mmsi);
      if (vesselMarkersRef.current.has(v.mmsi)) {
        vesselMarkersRef.current.get(v.mmsi).setLatLng([v.lat, v.lon]);
      } else {
        const color = vesselColor(v.shipType);
        const m = L.circleMarker([v.lat, v.lon], {
          renderer: rendererRef.current,
          radius: 4, color, fillColor: color, fillOpacity: 0.85, weight: 1,
        }).addTo(layer);
        const label = v.name || v.mmsi;
        m.bindTooltip(label, { sticky: true, className: 'vt-tooltip', offset: [8, 0] });
        m.on('click', () => {
          setInput(v.mmsi);
          setMode('mmsi');
          setMmsiInfo(decodeMmsi(v.mmsi));
          setSelected(null); setResults(null); setError(''); setNoKey(false);
          setSelected({ name: v.name, mmsi: v.mmsi, speed: v.speed, course: v.course, latitude: v.lat, longitude: v.lon });
        });
        vesselMarkersRef.current.set(v.mmsi, m);
      }
    }

    for (const [mmsi, marker] of vesselMarkersRef.current) {
      if (!seen.has(mmsi)) { marker.remove(); vesselMarkersRef.current.delete(mmsi); }
    }
    setVesselCount(seen.size);
  }, []);

  // Connect to AISstream.io directly from the browser
  const connectAIS = useCallback(async () => {
    const ws = wsRef.current;
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
    setWsStatus('connecting');
    try {
      const res = await fetch('/api/vessel/stream-key');
      if (!res.ok) { setWsStatus('error'); setWsError(`Key route returned ${res.status}`); return; }
      const data = await res.json();
      const key = data?.key;
      if (!key) { setWsStatus('no-key'); setNoKey(true); return; }

      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        setWsError('');
        ws.send(JSON.stringify({
          APIKey: key,
          BoundingBoxes: [[[-90, -180], [90, 180]]],
          FilterMessageTypes: ['PositionReport'],
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Surface any error messages from AISstream
          if (msg.error || msg.Error) {
            setWsError(msg.error || msg.Error || 'AIS stream error');
            setWsStatus('error');
            return;
          }
          if (msg.MessageType !== 'PositionReport') return;
          const meta = msg.MetaData;
          const pr = msg.Message?.PositionReport;
          const lat = meta?.latitude ?? pr?.Latitude;
          const lon = meta?.longitude ?? pr?.Longitude;
          if (lat == null || lon == null) return;

          vesselDataRef.current.set(String(meta.MMSI), {
            mmsi: String(meta.MMSI),
            name: (meta.ShipName || '').trim(),
            lat, lon,
            speed: pr?.Sog ?? 0,
            course: pr?.Cog ?? 0,
            shipType: pr?.ShipType ?? 0,
          });

          if (!wsLiveRef.current) {
            wsLiveRef.current = true;
            setWsStatus('live');
          }
        } catch { /* ignore malformed */ }
      };

      ws.onclose = (e) => {
        wsLiveRef.current = false;
        wsRef.current = null;
        if (e.code === 1008 || e.code === 4001 || e.code === 4003) {
          setWsStatus('error');
          setWsError(`Connection rejected by AIS server (code ${e.code}) — check API key`);
          return; // don't retry on auth errors
        }
        setWsStatus('connecting');
        setTimeout(connectAIS, 8000);
      };

      ws.onerror = () => ws.close();
    } catch {
      setWsStatus('connecting');
      setTimeout(connectAIS, 10000);
    }
  }, []); // eslint-disable-line

  // Init Leaflet map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    let cancelled = false;
    (async () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const L = (await import('leaflet')).default;
      if (cancelled || !mapContainerRef.current) return;
      LRef.current = L;
      rendererRef.current = L.canvas({ padding: 0.5 });
      const map = L.map(mapContainerRef.current, { center: [20, 0], zoom: 3, preferCanvas: true });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 14,
      }).addTo(map);
      L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: '© OpenSeaMap', maxZoom: 14, opacity: 0.6,
      }).addTo(map);
      vesselLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
        connectAIS();
        // Refresh markers every 5 seconds
        drawTimerRef.current = setInterval(updateMapMarkers, 5000);
        // Also refresh on map pan/zoom
        map.on('moveend', updateMapMarkers);
      }, 400);
    })();
    return () => {
      cancelled = true;
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
      if (wsRef.current) wsRef.current.close();
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line

  const handleSearch = () => {
    setError(''); setResults(null); setSelected(null); setMmsiInfo(null); setNoKey(false);
    const val = input.trim();
    if (!val) return;

    if (mode === 'mmsi') {
      const info = decodeMmsi(val);
      if (!info) { setError('Invalid MMSI — must be exactly 9 digits.'); return; }
      setMmsiInfo(info);
      return;
    }

    // Name search against accumulated AIS data
    setLoading(true);
    const q = val.toUpperCase();
    const matches = Array.from(vesselDataRef.current.values())
      .filter(v => v.name.toUpperCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 30)
      .map(v => ({ name: v.name, mmsi: v.mmsi, latitude: v.lat, longitude: v.lon, speed: v.speed, course: v.course }));

    if (matches.length === 0) {
      setError(`No vessels matching "${val}" in live AIS feed yet — more vessels stream in every second, try again shortly.`);
    } else {
      setResults(matches);
      if (matches.length === 1) setSelected(matches[0]);
    }
    setLoading(false);
  };

  const mmsiVal = input.trim();
  const mtLink = mmsiVal.length === 9 ? `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${mmsiVal}` : 'https://www.marinetraffic.com';
  const vfLink = mmsiVal.length === 9 ? `https://www.vesselfinder.com/?mmsi=${mmsiVal}` : 'https://www.vesselfinder.com';

  const vesselTypeLabel = (v: VesselResult) => {
    if (v.vessel_type) return v.vessel_type;
    if (v.vessel_type_code != null) return VESSEL_TYPES[String(v.vessel_type_code)] || `Type ${v.vessel_type_code}`;
    return null;
  };
  const cargoType = (v: VesselResult) => {
    const code = v.vessel_type_code;
    if (!code) return null;
    if (code >= 60 && code <= 69) return 'Passenger';
    if (code >= 70 && code <= 79) return 'Cargo';
    if (code >= 80 && code <= 89) return 'Tanker';
    if (code === 30) return 'Fishing / Commercial';
    if (code === 36 || code === 37) return 'Leisure / Recreational';
    if (code === 35) return 'Military';
    if (code === 52) return 'Tug / Working Vessel';
    if (code === 51) return 'Search & Rescue';
    return 'Commercial / Other';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
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
        .hero-sub { font-size: 14px; color: #7a9bb5; max-width: 600px; line-height: 1.7; }
        .tool-section { padding: 24px 40px 40px; max-width: 1200px; margin: 0 auto; }
        .live-map-wrap { position: relative; width: 100%; height: 520px; border: 1px solid rgba(30,158,255,0.15); background: #050d14; margin-bottom: 2px; overflow: hidden; }
        .live-map-label { position: absolute; top: 12px; left: 12px; z-index: 10; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; background: rgba(3,6,8,0.85); padding: 5px 12px; border: 1px solid rgba(30,158,255,0.2); }
        .live-map-inner { width: 100%; height: 100%; position: relative; isolation: isolate; }
        .live-map-inner .leaflet-container { position: relative !important; width: 100% !important; height: 100% !important; background: #050d14; }
        .live-map-inner .leaflet-pane { position: absolute; }
        .live-map-inner .leaflet-tile { position: absolute; }
        .ws-legend { position: absolute; bottom: 10px; left: 10px; z-index: 10; display: flex; gap: 10px; flex-wrap: wrap; background: rgba(3,6,8,0.82); padding: 5px 10px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; }
        .vt-tooltip { background: rgba(5,13,20,0.95) !important; border: 1px solid rgba(30,158,255,0.3) !important; color: #1e9eff !important; font-family: 'IBM Plex Mono', monospace !important; font-size: 10px !important; letter-spacing: 2px !important; padding: 4px 10px !important; border-radius: 0 !important; box-shadow: none !important; }
        .vt-tooltip::before { display: none !important; }
        .mode-tabs { display: flex; gap: 2px; margin-bottom: 2px; }
        .mode-tab { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; padding: 9px 20px; cursor: pointer; text-transform: uppercase; background: #0a1520; border: 1px solid rgba(30,158,255,0.15); color: #3d5870; transition: all 0.2s; }
        .mode-tab.active { color: #1e9eff; background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.35); }
        .search-row { display: flex; gap: 2px; margin-bottom: 16px; }
        .search-input { flex: 1; background: #0a1520; border: 1px solid rgba(30,158,255,0.2); outline: none; padding: 13px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 13px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .result-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); }
        .panel-section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 12px 22px 8px; background: rgba(30,158,255,0.03); border-bottom: 1px solid rgba(30,158,255,0.06); }
        .detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
        .detail-field { padding: 14px 22px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .detail-field:nth-child(3n) { border-right: none; }
        .detail-field.full { grid-column: 1/-1; border-right: none; }
        .detail-field.two { grid-column: span 2; }
        .field-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 5px; }
        .field-value { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #c0cfe0; word-break: break-word; }
        .field-value.cyan { color: #00ffff; } .field-value.green { color: #00ff88; }
        .field-value.amber { color: #f59e0b; } .field-value.blue { color: #1e9eff; }
        .field-value.red { color: #ff3a3a; } .field-value.purple { color: #a78bfa; }
        .vessel-header { padding: 20px 22px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); }
        .vessel-name-big { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; text-transform: uppercase; word-break: break-all; margin-bottom: 8px; }
        .vessel-badges { display: flex; gap: 8px; flex-wrap: wrap; }
        .vessel-badge { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; padding: 3px 10px; border: 1px solid; text-transform: uppercase; }
        .badge-mmsi { color: #3d5870; border-color: rgba(30,158,255,0.2); }
        .badge-type { color: #f59e0b; border-color: rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
        .badge-flag { color: #00ff88; border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.05); }
        .results-list { }
        .result-item { padding: 12px 22px; border-bottom: 1px solid rgba(30,158,255,0.06); cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
        .result-item:hover { background: rgba(30,158,255,0.06); }
        .result-name { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c0cfe0; }
        .result-meta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #3d5870; }
        .mmsi-decode { padding: 22px; }
        .mmsi-decode-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
        .mmsi-raw { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d5870; letter-spacing: 2px; margin-bottom: 16px; }
        .decode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 16px; }
        .decode-field { background: #050d14; padding: 12px 14px; }
        .decode-field.full { grid-column: 1/-1; }
        .ext-links-wrap { border-top: 1px solid rgba(30,158,255,0.08); padding-top: 16px; }
        .ext-links-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 10px; }
        .ext-link { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-decoration: none; padding: 8px 0; border-bottom: 1px solid rgba(30,158,255,0.06); transition: color 0.2s; }
        .ext-link:last-child { border-bottom: none; }
        .ext-link:hover { color: #4db8ff; }
        .empty-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; gap: 14px; text-align: center; }
        .empty-icon { font-size: 36px; opacity: 0.15; }
        .empty-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; line-height: 1.9; }
        .error-bar { background: rgba(255,58,58,0.08); border: 1px solid rgba(255,58,58,0.2); padding: 10px 16px; margin-bottom: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #ff3a3a; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 32px 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .hero { padding: 32px 20px; } .tool-section { padding: 16px 20px 32px; }
          .live-map-wrap { height: 320px; }
          .detail-grid { grid-template-columns: 1fr 1fr; }
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
          <div className="hamburger" onClick={() => document.getElementById('vtMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="vtMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('vtMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/cybersecurity">Cybersecurity</a><a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a><a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">Maritime Intelligence</div></div>
            <div className="hero-title">Vessel <span>Tracker</span></div>
            <p className="hero-sub">Live global vessel tracking via AIS stream. Click any vessel on the map to decode its MMSI. Search by MMSI or vessel name for flag state, cargo type, and full AIS telemetry.</p>
          </div>
        </div>

        <div className="tool-section">
          {/* Live vessel map */}
          <div className="live-map-wrap">
            <div className="live-map-label">
              {wsStatus === 'live'
                ? `Live AIS — ${vesselCount.toLocaleString()} vessels in view`
                : wsStatus === 'connected' ? 'AIS connected — waiting for vessels...'
                : wsStatus === 'connecting' ? 'Connecting to AIS stream...'
                : wsStatus === 'error' ? `AIS Error: ${wsError}`
                : wsStatus === 'no-key' ? 'No API key configured'
                : 'Initializing...'}
            </div>
            {wsStatus === 'live' && (
              <div className="ws-legend">
                <span style={{color:'#1e9eff'}}>● Cargo</span>
                <span style={{color:'#ff3a3a'}}>● Tanker</span>
                <span style={{color:'#00ff88'}}>● Passenger</span>
                <span style={{color:'#f59e0b'}}>● Fishing</span>
                <span style={{color:'#00ffff'}}>● Pleasure</span>
                <span style={{color:'#a78bfa'}}>● SAR / Tug</span>
                <span style={{color:'#7a9bb5'}}>● Other</span>
              </div>
            )}
            <div className="live-map-inner" ref={mapContainerRef} />
          </div>

          {/* Search */}
          <div className="mode-tabs">
            <button className={`mode-tab${mode === 'mmsi' ? ' active' : ''}`} onClick={() => setMode('mmsi')}>MMSI Decode</button>
            <button className={`mode-tab${mode === 'name' ? ' active' : ''}`} onClick={() => setMode('name')}>Vessel Name Search</button>
          </div>
          <div className="search-row">
            <input
              className="search-input"
              placeholder={mode === 'mmsi' ? 'Enter 9-digit MMSI (e.g. 338123456)...' : 'Enter vessel name (e.g. EVER GIVEN)...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading || !input.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <div className="error-bar">{error}</div>}

          <div className="result-panel">
            {mmsiInfo && (
              <div className="mmsi-decode">
                <div className="mmsi-decode-title">MMSI Decoded</div>
                <div className="mmsi-raw">MMSI: {input.trim()}</div>
                <div className="decode-grid">
                  <div className="decode-field full">
                    <div className="field-label">Flag State / Registered Country</div>
                    <div className="field-value cyan" style={{fontSize:'15px'}}>{mmsiInfo.country}</div>
                  </div>
                  <div className="decode-field full">
                    <div className="field-label">Station Type</div>
                    <div className="field-value">{mmsiInfo.type}</div>
                  </div>
                  {mmsiInfo.mid && (
                    <div className="decode-field">
                      <div className="field-label">MID (Country Code)</div>
                      <div className="field-value amber">{mmsiInfo.mid}</div>
                    </div>
                  )}
                </div>
                <div className="ext-links-wrap">
                  <div className="ext-links-label">Track This Vessel Live</div>
                  <a className="ext-link" href={mtLink} target="_blank" rel="noopener noreferrer">MarineTraffic →</a>
                  <a className="ext-link" href={vfLink} target="_blank" rel="noopener noreferrer">VesselFinder →</a>
                  <a className="ext-link" href={`https://www.myshiptracking.com/?mmsi=${input.trim()}`} target="_blank" rel="noopener noreferrer">MyShipTracking →</a>
                  <a className="ext-link" href={`https://www.fleetmon.com/vessels/?search=${input.trim()}`} target="_blank" rel="noopener noreferrer">FleetMon →</a>
                </div>
              </div>
            )}

            {results && results.length > 1 && !selected && (
              <div className="results-list">
                <div className="panel-section-label">Search Results — {results.length} vessels found</div>
                {results.map((v, i) => (
                  <div key={i} className="result-item" onClick={() => setSelected(v)}>
                    <div>
                      <div className="result-name">{v.name || '—'}</div>
                      <div className="result-meta">MMSI: {v.mmsi || '—'}</div>
                    </div>
                    <div className="result-meta">{v.speed != null ? `${v.speed} kts` : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {selected && (
              <>
                <div className="vessel-header">
                  <div className="vessel-name-big">{selected.name || 'Unknown Vessel'}</div>
                  <div className="vessel-badges">
                    {selected.mmsi && <span className="vessel-badge badge-mmsi">MMSI: {selected.mmsi}</span>}
                    {vesselTypeLabel(selected) && <span className="vessel-badge badge-type">{vesselTypeLabel(selected)}</span>}
                    {selected.flag && <span className="vessel-badge badge-flag">Flag: {selected.flag}</span>}
                  </div>
                </div>

                {(selected.imo || selected.callsign || selected.flag || selected.year_built) && (
                  <>
                    <div className="panel-section-label">Identity & Registration</div>
                    <div className="detail-grid">
                      {selected.imo && <div className="detail-field"><div className="field-label">IMO Number</div><div className="field-value blue">{selected.imo}</div></div>}
                      {selected.callsign && <div className="detail-field"><div className="field-label">Call Sign</div><div className="field-value">{selected.callsign}</div></div>}
                      {selected.flag && <div className="detail-field"><div className="field-label">Flag State</div><div className="field-value green">{selected.flag}</div></div>}
                      {selected.year_built && <div className="detail-field"><div className="field-label">Year Built</div><div className="field-value">{selected.year_built}</div></div>}
                    </div>
                  </>
                )}

                <div className="panel-section-label">Current Position & Voyage</div>
                <div className="detail-grid">
                  {selected.speed != null && <div className="detail-field"><div className="field-label">Speed</div><div className="field-value green">{selected.speed} kts</div></div>}
                  {selected.course != null && <div className="detail-field"><div className="field-label">Course</div><div className="field-value">{selected.course}°</div></div>}
                  {selected.status && <div className="detail-field"><div className="field-label">Nav Status</div><div className="field-value amber">{NAV_STATUS[selected.status] || selected.status}</div></div>}
                  {selected.latitude != null && <div className="detail-field"><div className="field-label">Latitude</div><div className="field-value">{selected.latitude?.toFixed(4)}°</div></div>}
                  {selected.longitude != null && <div className="detail-field"><div className="field-label">Longitude</div><div className="field-value">{selected.longitude?.toFixed(4)}°</div></div>}
                  {selected.destination && <div className="detail-field two"><div className="field-label">Destination</div><div className="field-value cyan">{selected.destination}</div></div>}
                  {selected.eta && <div className="detail-field"><div className="field-label">ETA</div><div className="field-value">{selected.eta}</div></div>}
                </div>

                <div className="panel-section-label">Live Tracking</div>
                <div style={{padding:'14px 22px', display:'flex', gap:'12px', flexWrap:'wrap'}}>
                  <a className="ext-link" style={{padding:'8px 16px', border:'1px solid rgba(30,158,255,0.25)', display:'inline-block'}} href={`https://www.marinetraffic.com/en/ais/details/ships/mmsi:${selected.mmsi}`} target="_blank" rel="noopener noreferrer">MarineTraffic →</a>
                  <a className="ext-link" style={{padding:'8px 16px', border:'1px solid rgba(30,158,255,0.25)', display:'inline-block'}} href={`https://www.vesselfinder.com/?mmsi=${selected.mmsi}`} target="_blank" rel="noopener noreferrer">VesselFinder →</a>
                  <a className="ext-link" style={{padding:'8px 16px', border:'1px solid rgba(30,158,255,0.25)', display:'inline-block'}} href={`https://www.fleetmon.com/vessels/?search=${selected.mmsi}`} target="_blank" rel="noopener noreferrer">FleetMon →</a>
                </div>
              </>
            )}

            {!mmsiInfo && results === null && !selected && (
              <div className="empty-panel">
                <div className="empty-icon">⚓</div>
                <div className="empty-text">Enter an MMSI to decode registration & flag state<br />or search by vessel name in the live AIS feed</div>
              </div>
            )}
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
