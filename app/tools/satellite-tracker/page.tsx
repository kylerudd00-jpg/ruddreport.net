'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface TLEData {
  name: string; line1: string; line2: string; noradId: string;
}
interface SatPosition {
  lat: number; lon: number; alt: number; velocity: number;
  period: number; inclination: number; apogee: number; perigee: number;
}
interface LookAngles {
  az: number; el: number; range: number; rangeRate: number;
}
interface SkyPoint { az: number; el: number; }
interface Pass {
  aos: Date; los: Date; maxEl: number; duration: number;
  direction: string; visibility: string;
  azAtAos: number; azAtLos: number;
  skyTrack: SkyPoint[];
}

const PRESETS = [
  { label: 'ISS', noradId: '25544', group: 'stations' },
  { label: 'Tiangong', noradId: '48274', group: 'stations' },
  { label: 'Hubble', noradId: '20580', group: 'active' },
  { label: 'Starlink', noradId: null, group: 'starlink' },
  { label: 'GPS', noradId: null, group: 'gps' },
  { label: 'NOAA', noradId: null, group: 'weather' },
  { label: 'Iridium', noradId: null, group: 'iridium' },
  { label: 'Amateur', noradId: null, group: 'amateur' },
];

const ISS_FREQ_MHZ = 145.8;

function getSunPosition(date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * (Math.PI / 180);
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * (Math.PI / 180);
  const epsilon = 23.439 * (Math.PI / 180);
  const lat = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) * (180 / Math.PI);
  const gmst = (18.697374558 + 24.06570982441908 * n) % 24;
  const raSun = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)) * (180 / Math.PI);
  const lon = ((raSun / 15 - gmst) * 15 + 180) % 360 - 180;
  return { lat, lon };
}

function getVisibility(date: Date, obsLat: number, obsLon: number): string {
  const sun = getSunPosition(date);
  const dx = obsLon - sun.lon; const dy = obsLat - sun.lat;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 90) return 'Daylight';
  if (dist < 108) return 'Twilight';
  return 'Night';
}

function getOrbitType(alt: number): string {
  if (alt < 2000) return 'LEO';
  if (alt < 35000) return 'MEO';
  if (alt > 34000 && alt < 36000) return 'GEO';
  return 'HEO';
}

function drawSkyPlot(
  canvas: HTMLCanvasElement,
  skyTrack: SkyPoint[],
  currentAzEl: LookAngles | null,
  satName: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) / 2 - 36;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#050d14';
  ctx.fillRect(0, 0, W, H);

  // Elevation rings
  for (const el of [0, 30, 60]) {
    const r = R * (90 - el) / 90;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(30,158,255,0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#3d5870';
    ctx.font = '9px Share Tech Mono';
    ctx.fillText(`${el}°`, cx + 4, cy - r + 11);
  }
  // Center dot (zenith)
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(30,158,255,0.3)';
  ctx.fill();

  // Cardinal lines + labels
  const cardinals = [
    { label: 'N', az: 0 }, { label: 'NE', az: 45 },
    { label: 'E', az: 90 }, { label: 'SE', az: 135 },
    { label: 'S', az: 180 }, { label: 'SW', az: 225 },
    { label: 'W', az: 270 }, { label: 'NW', az: 315 },
  ];
  for (const d of cardinals) {
    const rad = (d.az - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(rad), cy + R * Math.sin(rad));
    ctx.strokeStyle = 'rgba(30,158,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    const isMain = d.az % 90 === 0;
    ctx.fillStyle = isMain ? '#7a9bb5' : '#3d5870';
    ctx.font = isMain ? 'bold 11px Share Tech Mono' : '9px Share Tech Mono';
    const lx = cx + (R + 18) * Math.cos(rad) - (d.label.length * 3);
    const ly = cy + (R + 18) * Math.sin(rad) + 4;
    ctx.fillText(d.label, lx, ly);
  }

  // Sky track path
  if (skyTrack.length > 1) {
    // Gradient track: AOS (green) → LOS (red)
    for (let i = 0; i < skyTrack.length - 1; i++) {
      const t = i / (skyTrack.length - 1);
      const r1 = Math.max(0, R * (90 - skyTrack[i].el) / 90);
      const r2 = Math.max(0, R * (90 - skyTrack[i + 1].el) / 90);
      const rad1 = (skyTrack[i].az - 90) * Math.PI / 180;
      const rad2 = (skyTrack[i + 1].az - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(cx + r1 * Math.cos(rad1), cy + r1 * Math.sin(rad1));
      ctx.lineTo(cx + r2 * Math.cos(rad2), cy + r2 * Math.sin(rad2));
      const g = t < 0.5
        ? `rgba(${Math.round(t * 2 * 245)},${Math.round(255 - t * 2 * (255 - 158))},11,0.9)`
        : `rgba(245,${Math.round(158 - (t - 0.5) * 2 * 100)},${Math.round(11 + (t - 0.5) * 2 * 48)},0.9)`;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // AOS marker (green)
    const a = skyTrack[0];
    const aR = R * (90 - a.el) / 90;
    const aRad = (a.az - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(cx + aR * Math.cos(aRad), cy + aR * Math.sin(aRad), 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.fillStyle = '#00ff88';
    ctx.font = '9px Share Tech Mono';
    ctx.fillText('AOS', cx + aR * Math.cos(aRad) + 8, cy + aR * Math.sin(aRad) - 6);

    // LOS marker (red)
    const l = skyTrack[skyTrack.length - 1];
    const lR = R * (90 - l.el) / 90;
    const lRad = (l.az - 90) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(cx + lR * Math.cos(lRad), cy + lR * Math.sin(lRad), 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff3a3a';
    ctx.fill();
    ctx.fillStyle = '#ff3a3a';
    ctx.font = '9px Share Tech Mono';
    ctx.fillText('LOS', cx + lR * Math.cos(lRad) + 8, cy + lR * Math.sin(lRad) + 12);
  }

  // Current position (if in view)
  if (currentAzEl && currentAzEl.el >= 0) {
    const r = Math.max(0, R * (90 - currentAzEl.el) / 90);
    const rad = (currentAzEl.az - 90) * Math.PI / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,255,255,0.15)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#00ffff';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Title
  ctx.fillStyle = 'rgba(30,158,255,0.5)';
  ctx.font = '9px Share Tech Mono';
  ctx.fillText('SKY PLOT — NEXT PASS', 12, 20);
  if (satName) {
    ctx.fillStyle = '#7a9bb5';
    ctx.fillText(satName.substring(0, 24), 12, H - 12);
  }
}

export default function SatelliteTracker() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TLEData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSat, setSelectedSat] = useState<TLEData | null>(null);
  const [position, setPosition] = useState<SatPosition | null>(null);
  const [lookAngles, setLookAngles] = useState<LookAngles | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [observerLat, setObserverLat] = useState('38.90');
  const [observerLon, setObserverLon] = useState('-77.04');
  const [minElevation, setMinElevation] = useState(10);
  const [passLoading, setPassLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasses, setShowPasses] = useState(5);
  const [activeView, setActiveView] = useState<'map' | 'skyplot'>('map');
  const [showTLE, setShowTLE] = useState(false);
  const [utcClock, setUtcClock] = useState('');
  const [countdown, setCountdown] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [showObserverForm, setShowObserverForm] = useState(false);
  const [postalCode, setPostalCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('us');
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalResult, setPostalResult] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const skyCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const satMarkerRef = useRef<any>(null);
  const trackLayerRef = useRef<any>(null);
  const footprintLayerRef = useRef<any>(null);
  const observerMarkerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const satLibRef = useRef<any>(null);
  const passesRef = useRef<Pass[]>([]);
  const selectedSatRef = useRef<TLEData | null>(null);
  const observerLatRef = useRef('38.90');
  const observerLonRef = useRef('-77.04');

  useEffect(() => { passesRef.current = passes; }, [passes]);
  useEffect(() => { selectedSatRef.current = selectedSat; }, [selectedSat]);
  useEffect(() => { observerLatRef.current = observerLat; }, [observerLat]);
  useEffect(() => { observerLonRef.current = observerLon; }, [observerLon]);

  // Load satellite.js
  useEffect(() => {
    import('satellite.js').then(mod => { satLibRef.current = mod; });
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const initMap = async () => {
      const L = (await import('leaflet' as any)).default;
      if (mapInstanceRef.current || !mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false, center: [20, 0], zoom: 1 });
      mapInstanceRef.current = map;
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 10,
      }).addTo(map);
      map.invalidateSize();
    };
    if (document.readyState === 'complete') {
      setTimeout(initMap, 50);
    } else {
      link.onload = () => setTimeout(initMap, 50);
      setTimeout(initMap, 300);
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  // UTC clock + countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcClock(now.toUTCString().replace(' GMT', '').split(', ')[1]?.split(' ').slice(0, 4).join(' ') || '');
      const ps = passesRef.current;
      if (ps.length > 0) {
        const next = ps.find(p => p.aos > now) || ps[0];
        const diff = next.aos.getTime() - now.getTime();
        if (diff > 0) {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setCountdown(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
        } else {
          setCountdown('IN PASS NOW');
        }
      } else {
        setCountdown('');
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const computePosition = useCallback((tle: TLEData, date: Date): SatPosition | null => {
    const sat = satLibRef.current;
    if (!sat) return null;
    try {
      const satrec = sat.twoline2satrec(tle.line1, tle.line2);
      const pv = sat.propagate(satrec, date);
      if (!pv.position || typeof pv.position === 'boolean') return null;
      const gmst = sat.gstime(date);
      const gd = sat.eciToGeodetic(pv.position, gmst);
      const lat = sat.degreesLat(gd.latitude);
      const lon = sat.degreesLong(gd.longitude);
      const alt = gd.height;
      const vel = pv.velocity as any;
      const velocity = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
      const period = (2 * Math.PI / satrec.no) / 60;
      const inclination = satrec.inclo * (180 / Math.PI);
      const ecc = satrec.ecco;
      const a = Math.pow(398600.4418 / Math.pow(satrec.no / 60, 2), 1 / 3);
      const apogee = a * (1 + ecc) - 6371;
      const perigee = a * (1 - ecc) - 6371;
      return { lat, lon, alt, velocity, period, inclination, apogee, perigee };
    } catch { return null; }
  }, []);

  const computeLookAngles = useCallback((tle: TLEData, date: Date, obsLat: number, obsLon: number): LookAngles | null => {
    const sat = satLibRef.current;
    if (!sat) return null;
    try {
      const satrec = sat.twoline2satrec(tle.line1, tle.line2);
      const obsGd = { latitude: obsLat * (Math.PI / 180), longitude: obsLon * (Math.PI / 180), height: 0 };
      const pv = sat.propagate(satrec, date);
      if (!pv.position || typeof pv.position === 'boolean') return null;
      const gmst = sat.gstime(date);
      const posEcf = sat.eciToEcf(pv.position, gmst);
      const la = sat.ecfToLookAngles(obsGd, posEcf);
      const az = la.azimuth * (180 / Math.PI);
      const el = la.elevation * (180 / Math.PI);
      const range = la.rangeSat;
      // Range rate: numerical derivative
      const date2 = new Date(date.getTime() + 1000);
      const pv2 = sat.propagate(satrec, date2);
      let rangeRate = 0;
      if (pv2.position && typeof pv2.position !== 'boolean') {
        const gmst2 = sat.gstime(date2);
        const posEcf2 = sat.eciToEcf(pv2.position, gmst2);
        const la2 = sat.ecfToLookAngles(obsGd, posEcf2);
        rangeRate = la2.rangeSat - range; // km/s
      }
      return { az: az < 0 ? az + 360 : az, el, range, rangeRate };
    } catch { return null; }
  }, []);

  const computeGroundTrack = useCallback((tle: TLEData, date: Date): { lat: number; lon: number }[] => {
    const sat = satLibRef.current;
    if (!sat) return [];
    try {
      const satrec = sat.twoline2satrec(tle.line1, tle.line2);
      const period = (2 * Math.PI / satrec.no) / 60;
      const points: { lat: number; lon: number }[] = [];
      for (let i = 0; i <= 120; i++) {
        const t = new Date(date.getTime() + (i - 30) * period * 60 * 1000 / 120 * 2);
        const pv = sat.propagate(satrec, t);
        if (!pv.position || typeof pv.position === 'boolean') continue;
        const gmst = sat.gstime(t);
        const gd = sat.eciToGeodetic(pv.position, gmst);
        points.push({ lat: sat.degreesLat(gd.latitude), lon: sat.degreesLong(gd.longitude) });
      }
      return points;
    } catch { return []; }
  }, []);

  const updateMap = useCallback(async (pos: SatPosition, track: { lat: number; lon: number }[], obsLat: number, obsLon: number) => {
    const L = (await import('leaflet' as any)).default;
    const map = mapInstanceRef.current;
    if (!map) return;

    if (satMarkerRef.current) { satMarkerRef.current.remove(); satMarkerRef.current = null; }
    if (trackLayerRef.current) { trackLayerRef.current.remove(); trackLayerRef.current = null; }
    if (footprintLayerRef.current) { footprintLayerRef.current.remove(); footprintLayerRef.current = null; }

    // Ground track (split at antimeridian)
    const segments: { lat: number; lon: number }[][] = [];
    let seg: { lat: number; lon: number }[] = [];
    for (let i = 0; i < track.length; i++) {
      if (i > 0 && Math.abs(track[i].lon - track[i - 1].lon) > 180) { segments.push(seg); seg = []; }
      seg.push(track[i]);
    }
    if (seg.length) segments.push(seg);
    const layerGroup = L.layerGroup();
    segments.forEach(s => {
      L.polyline(s.map(p => [p.lat, p.lon]), { color: '#f59e0b', weight: 1.5, opacity: 0.65 }).addTo(layerGroup);
    });
    layerGroup.addTo(map);
    trackLayerRef.current = layerGroup;

    // Satellite footprint (visibility circle)
    const halfAngle = Math.acos(6371 / (6371 + Math.max(pos.alt, 1)));
    const footprintRadiusM = 6371 * halfAngle * 1000;
    footprintLayerRef.current = L.circle([pos.lat, pos.lon], {
      radius: footprintRadiusM, color: 'rgba(0,255,255,0.25)',
      fillColor: 'rgba(0,255,255,0.04)', fillOpacity: 1, weight: 1,
    }).addTo(map);

    // Satellite marker
    const satIcon = L.divIcon({
      html: `<div style="position:relative;width:18px;height:18px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,255,255,0.15);animation:satPulse 2s infinite;"></div>
        <div style="position:absolute;top:3px;left:3px;width:12px;height:12px;border-radius:50%;background:#00ffff;border:2px solid #fff;box-shadow:0 0 12px #00ffff;"></div>
      </div>`,
      iconSize: [18, 18], iconAnchor: [9, 9], className: '',
    });
    satMarkerRef.current = L.marker([pos.lat, pos.lon], { icon: satIcon })
      .addTo(map)
      .bindTooltip(`<div style="font-family:monospace;font-size:11px;background:#0a1520;color:#00ffff;border:1px solid rgba(30,158,255,0.3);padding:6px 10px;border-radius:0;">${pos.lat.toFixed(3)}°, ${pos.lon.toFixed(3)}°<br>Alt: ${pos.alt.toFixed(0)} km</div>`, { permanent: false, className: 'sat-tooltip' });

    // Observer marker
    if (!isNaN(obsLat) && !isNaN(obsLon)) {
      if (observerMarkerRef.current) { observerMarkerRef.current.remove(); observerMarkerRef.current = null; }
      const obsIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:#00ff88;border:2px solid #fff;box-shadow:0 0 10px #00ff88;"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: '',
      });
      observerMarkerRef.current = L.marker([obsLat, obsLon], { icon: obsIcon })
        .addTo(map)
        .bindTooltip(`<div style="font-family:monospace;font-size:11px;background:#0a1520;color:#00ff88;border:1px solid rgba(0,255,136,0.3);padding:6px 10px;">Observer</div>`, { permanent: false, className: 'sat-tooltip' });
    }
  }, []);

  const calculatePasses = useCallback((tle: TLEData, obsLat: number, obsLon: number, minEl: number): Pass[] => {
    const sat = satLibRef.current;
    if (!sat) return [];
    try {
      const satrec = sat.twoline2satrec(tle.line1, tle.line2);
      const obsGd = { latitude: obsLat * (Math.PI / 180), longitude: obsLon * (Math.PI / 180), height: 0 };
      const passes: Pass[] = [];
      const now = new Date();
      const step = 15;
      const maxTime = now.getTime() + 7 * 86400000;

      let inPass = false;
      let passStart: Date | null = null;
      let maxElPass = 0;
      let maxElTime: Date | null = null;
      let prevEl = -90;
      let azAtAos = 0;

      for (let t = now.getTime(); t < maxTime && passes.length < 10; t += step * 1000) {
        const date = new Date(t);
        const pv = sat.propagate(satrec, date);
        if (!pv.position || typeof pv.position === 'boolean') continue;
        const gmst = sat.gstime(date);
        const posEcf = sat.eciToEcf(pv.position, gmst);
        const la = sat.ecfToLookAngles(obsGd, posEcf);
        const el = la.elevation * (180 / Math.PI);
        const az = ((la.azimuth * (180 / Math.PI)) + 360) % 360;

        if (!inPass && el >= minEl && prevEl < minEl) {
          inPass = true;
          passStart = date;
          maxElPass = el;
          maxElTime = date;
          azAtAos = az;
        } else if (inPass && el > maxElPass) {
          maxElPass = el;
          maxElTime = date;
        } else if (inPass && el < minEl && prevEl >= minEl) {
          inPass = false;
          if (passStart) {
            const duration = (date.getTime() - passStart.getTime()) / 1000;
            // Direction
            const pvA = sat.propagate(satrec, passStart);
            const pvL = sat.propagate(satrec, date);
            let direction = 'N→S';
            try {
              const gdA = sat.eciToGeodetic(pvA.position, sat.gstime(passStart));
              const gdL = sat.eciToGeodetic(pvL.position, sat.gstime(date));
              direction = sat.degreesLat(gdL.latitude) > sat.degreesLat(gdA.latitude) ? 'S→N' : 'N→S';
            } catch {}

            // Sky track (10s steps)
            const skyTrack: SkyPoint[] = [];
            for (let st = passStart.getTime(); st <= date.getTime(); st += 10000) {
              const sd = new Date(st);
              const spv = sat.propagate(satrec, sd);
              if (!spv.position || typeof spv.position === 'boolean') continue;
              const sgmst = sat.gstime(sd);
              const secf = sat.eciToEcf(spv.position, sgmst);
              const sla = sat.ecfToLookAngles(obsGd, secf);
              skyTrack.push({
                az: ((sla.azimuth * (180 / Math.PI)) + 360) % 360,
                el: sla.elevation * (180 / Math.PI),
              });
            }

            const losDate = date;
            const losLa = sat.ecfToLookAngles(obsGd, sat.eciToEcf(pvL.position, sat.gstime(date)));
            const azAtLos = ((losLa.azimuth * (180 / Math.PI)) + 360) % 360;
            const vis = getVisibility(maxElTime || passStart, obsLat, obsLon);
            passes.push({ aos: passStart, los: losDate, maxEl: maxElPass, duration, direction, visibility: vis, azAtAos, azAtLos, skyTrack });
          }
        }
        prevEl = el;
      }
      return passes;
    } catch { return []; }
  }, []);

  const startTracking = useCallback((tle: TLEData) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const tick = () => {
      const now = new Date();
      const pos = computePosition(tle, now);
      if (!pos) return;
      setPosition(pos);

      const lat = parseFloat(observerLatRef.current);
      const lon = parseFloat(observerLonRef.current);
      const track = computeGroundTrack(tle, now);
      updateMap(pos, track, isNaN(lat) ? NaN : lat, isNaN(lon) ? NaN : lon);

      if (!isNaN(lat) && !isNaN(lon)) {
        const la = computeLookAngles(tle, now, lat, lon);
        setLookAngles(la);
        // Redraw sky plot
        if (skyCanvasRef.current && passesRef.current.length > 0) {
          drawSkyPlot(skyCanvasRef.current, passesRef.current[0].skyTrack, la, tle.name);
        } else if (skyCanvasRef.current) {
          drawSkyPlot(skyCanvasRef.current, [], la, tle.name);
        }
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
  }, [computePosition, computeGroundTrack, updateMap, computeLookAngles]);

  // Redraw sky plot when passes change or view changes
  useEffect(() => {
    if (skyCanvasRef.current && passes.length > 0) {
      drawSkyPlot(skyCanvasRef.current, passes[0].skyTrack, lookAngles, selectedSat?.name || '');
    } else if (skyCanvasRef.current) {
      drawSkyPlot(skyCanvasRef.current, [], lookAngles, selectedSat?.name || '');
    }
  }, [passes, activeView]);

  const loadPreset = async (preset: typeof PRESETS[0]) => {
    setError(''); setSearchResults([]); setQuery('');
    try {
      const url = preset.noradId
        ? `/api/satellite/tle?noradId=${preset.noradId}`
        : `/api/satellite/tle?group=${preset.group}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.satellites?.[0]) { setSelectedSat(data.satellites[0]); startTracking(data.satellites[0]); }
    } catch { setError('Failed to load satellite data.'); }
  };

  const doSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true); setError('');
    try {
      const res = await fetch(`/api/satellite/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchResults(data.results || []);
      if (!data.results?.length) setError('No satellites found matching that query.');
    } catch (e: any) { setError(`// ${e.message}`); }
    setSearchLoading(false);
  };

  const selectSatellite = (tle: TLEData) => {
    setSelectedSat(tle); setSearchResults([]); setQuery('');
    startTracking(tle);
  };

  const predictPasses = async () => {
    if (!selectedSat || !satLibRef.current) return;
    const lat = parseFloat(observerLatRef.current); const lon = parseFloat(observerLonRef.current);
    if (isNaN(lat) || isNaN(lon)) { setError('Invalid observer coordinates.'); return; }
    setPassLoading(true); setPasses([]); setError('');
    await new Promise(r => setTimeout(r, 50));
    const result = calculatePasses(selectedSat, lat, lon, minElevation);
    setPasses(result);
    if (!result.length) setError('No passes found in the next 7 days with this minimum elevation.');
    // Draw sky plot for first pass
    if (skyCanvasRef.current) {
      drawSkyPlot(skyCanvasRef.current, result[0]?.skyTrack || [], lookAngles, selectedSat.name);
    }
    setPassLoading(false);
  };

  const lookupPostal = async () => {
    if (!postalCode.trim()) return;
    setPostalLoading(true); setPostalResult(''); setError('');
    try {
      const res = await fetch(`/api/satellite/geocode?postal=${encodeURIComponent(postalCode.trim())}&country=${selectedCountry}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const newLat = data.lat.toFixed(4);
      const newLon = data.lon.toFixed(4);
      observerLatRef.current = newLat;
      observerLonRef.current = newLon;
      setObserverLat(newLat);
      setObserverLon(newLon);
      const label = [data.city, data.state, data.country].filter(Boolean).join(', ');
      setPostalResult(`// Located: ${label}`);
    } catch (e: any) { setError(`// ${e.message}`); }
    setPostalLoading(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const newLat = pos.coords.latitude.toFixed(4);
        const newLon = pos.coords.longitude.toFixed(4);
        observerLatRef.current = newLat;
        observerLonRef.current = newLon;
        setObserverLat(newLat);
        setObserverLon(newLon);
        setGeoLoading(false);
      },
      () => { setError('Location access denied.'); setGeoLoading(false); }
    );
  };

  // Load ISS on mount
  useEffect(() => {
    const timer = setTimeout(() => loadPreset(PRESETS[0]), 600);
    return () => { clearTimeout(timer); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fmt = (d: Date) => {
    const s = d.toUTCString().replace(' GMT', '');
    return s.split(', ')[1] || s;
  };
  const fmtDur = (s: number) => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
  const fmtAz = (az: number) => {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(az / 22.5) % 16];
  };
  const dopplerHz = lookAngles
    ? Math.round(-ISS_FREQ_MHZ * 1e6 * lookAngles.rangeRate / 299792)
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        @keyframes satPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(2.2);opacity:0} }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
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
        .back-bar { padding: 12px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .utc-clock { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #1e9eff; }
        .tool-hero { padding: 48px 40px 36px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1300px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .tool-hero-text { flex: 1; min-width: 260px; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(26px, 3.5vw, 48px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .tool-desc { font-size: 14px; font-weight: 300; color: #7a9bb5; line-height: 1.8; max-width: 560px; }
        .hero-stats { display: flex; gap: 32px; flex-wrap: wrap; }
        .hero-stat { display: flex; flex-direction: column; gap: 4px; }
        .hero-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #00ff88; }
        .hero-stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .main-wrap { max-width: 1300px; margin: 0 auto; padding: 32px 40px 80px; }
        .search-row { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; margin-bottom: 14px; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 13px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 13px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; align-items: center; }
        .preset-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .preset-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #00ff88; background: none; border: 1px solid rgba(0,255,136,0.22); padding: 6px 13px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .preset-btn:hover { background: rgba(0,255,136,0.08); border-color: #00ff88; }
        .search-results { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); margin-bottom: 20px; }
        .search-result-item { padding: 11px 20px; border-bottom: 1px solid rgba(30,158,255,0.06); cursor: pointer; transition: background 0.2s; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .search-result-item:last-child { border-bottom: none; }
        .search-result-item:hover { background: rgba(30,158,255,0.06); }
        .sat-name { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #c0cfe0; }
        .sat-norad { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; white-space: nowrap; }
        .content-grid { display: grid; grid-template-columns: 1fr 360px; gap: 2px; margin-bottom: 2px; }
        .viz-panel { background: #050d14; border: 1px solid rgba(30,158,255,0.15); position: relative; display: flex; flex-direction: column; }
        .viz-tabs { display: flex; border-bottom: 1px solid rgba(30,158,255,0.15); flex-shrink: 0; }
        .viz-tab { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; padding: 10px 20px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #3d5870; border-right: 1px solid rgba(30,158,255,0.1); transition: all 0.2s; }
        .viz-tab.active { color: #1e9eff; background: rgba(30,158,255,0.06); }
        .viz-tab:hover:not(.active) { color: #7a9bb5; }
        .map-inner { width: 100%; height: 460px; display: block; position: relative; isolation: isolate; }
        .leaflet-container { position: relative !important; }
        .leaflet-pane, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow, .leaflet-tile-container, .leaflet-pane > svg, .leaflet-pane > canvas, .leaflet-zoom-box, .leaflet-image-layer, .leaflet-layer { position: absolute; left: 0; top: 0; }
        .leaflet-tile { filter: none; visibility: hidden; }
        .leaflet-tile-loaded { visibility: inherit; }
        .sky-canvas-wrap { display: flex; align-items: center; justify-content: center; padding: 12px; height: 460px; }
        .info-panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); display: flex; flex-direction: column; }
        .info-sat-header { padding: 18px 22px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); }
        .info-sat-name { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; word-break: break-all; line-height: 1.3; }
        .info-sat-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 6px; }
        .info-sat-badge { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; padding: 3px 9px; text-transform: uppercase; }
        .badge-norad { color: #3d5870; border: 1px solid rgba(30,158,255,0.15); }
        .badge-orbit { color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
        .badge-live { color: #00ff88; border: 1px solid rgba(0,255,136,0.3); background: rgba(0,255,136,0.05); }
        .info-section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 12px 22px 8px; background: rgba(30,158,255,0.03); border-bottom: 1px solid rgba(30,158,255,0.06); border-top: 1px solid rgba(30,158,255,0.06); }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; }
        .info-field { padding: 12px 22px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .info-field:nth-child(even) { border-right: none; }
        .info-field.full { grid-column: 1 / -1; border-right: none; }
        .field-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 5px; }
        .field-value { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #c0cfe0; letter-spacing: 1px; }
        .field-value.cyan { color: #00ffff; }
        .field-value.green { color: #00ff88; }
        .field-value.amber { color: #f59e0b; }
        .field-value.red { color: #ff3a3a; }
        .field-value.purple { color: #a78bfa; }
        .live-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; margin-right: 8px; animation: pulse 2s infinite; vertical-align: middle; }
        .countdown-box { padding: 14px 22px; border-bottom: 1px solid rgba(30,158,255,0.08); background: rgba(0,255,136,0.03); }
        .countdown-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 4px; }
        .countdown-value { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #00ff88; letter-spacing: 2px; }
        .observer-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); margin-bottom: 2px; }
        .observer-main { padding: 24px 28px; }
        .observer-modify-bar { border-top: 1px solid rgba(30,158,255,0.08); padding: 12px 28px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background 0.2s; }
        .observer-modify-bar:hover { background: rgba(30,158,255,0.03); }
        .observer-modify-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .observer-modify-toggle { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .observer-postal-form { border-top: 1px solid rgba(30,158,255,0.1); padding: 20px 28px; background: rgba(30,158,255,0.02); }
        .postal-form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #7a9bb5; text-transform: uppercase; margin-bottom: 14px; }
        .postal-inputs { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
        .postal-select { background: #050d14; border: 1px solid rgba(30,158,255,0.2); outline: none; padding: 9px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; appearance: none; cursor: pointer; min-width: 200px; }
        .postal-select:focus { border-color: rgba(30,158,255,0.5); }
        .postal-input { background: #050d14; border: 1px solid rgba(30,158,255,0.2); outline: none; padding: 9px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 2px; width: 160px; }
        .postal-input:focus { border-color: rgba(30,158,255,0.5); }
        .postal-input::placeholder { color: #3d5870; }
        .postal-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.3); padding: 9px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .postal-btn:hover { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.6); }
        .postal-btn:disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; }
        .postal-result { margin-top: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #00ff88; letter-spacing: 1px; }
        .section-header-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 5px; }
        .section-header-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 18px; }
        .obs-inputs { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
        .obs-field { display: flex; flex-direction: column; gap: 5px; }
        .obs-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .obs-input { background: #050d14; border: 1px solid rgba(30,158,255,0.2); outline: none; padding: 9px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; width: 136px; }
        .obs-input:focus { border-color: rgba(30,158,255,0.5); }
        .obs-input.narrow { width: 80px; }
        .geo-btn { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #7a9bb5; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 9px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
        .geo-btn:hover { border-color: rgba(30,158,255,0.4); color: #1e9eff; }
        .predict-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #00ff88; border: none; padding: 10px 22px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .predict-btn:hover { background: #33ffaa; }
        .predict-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .passes-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); margin-bottom: 2px; }
        .passes-header { padding: 18px 28px; border-bottom: 1px solid rgba(30,158,255,0.1); background: rgba(30,158,255,0.04); }
        .pass-card { border-bottom: 1px solid rgba(30,158,255,0.06); padding: 18px 28px; transition: background 0.2s; }
        .pass-card:last-child { border-bottom: none; }
        .pass-card:hover { background: rgba(30,158,255,0.025); }
        .pass-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px; flex-wrap: wrap; }
        .pass-num { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; color: #3d5870; }
        .pass-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .pass-vis { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; padding: 3px 10px; text-transform: uppercase; }
        .pass-vis.night { color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: rgba(30,158,255,0.06); }
        .pass-vis.daylight { color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); }
        .pass-vis.twilight { color: #a78bfa; border: 1px solid rgba(167,139,250,0.3); background: rgba(167,139,250,0.06); }
        .pass-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .pass-field-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 5px; }
        .pass-field-value { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; }
        .pass-field-value.accent { font-size: 20px; color: #00ff88; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; }
        .show-more-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; background: none; border: none; cursor: pointer; padding: 14px 28px; text-transform: uppercase; width: 100%; text-align: left; border-top: 1px solid rgba(30,158,255,0.08); transition: color 0.2s; }
        .show-more-btn:hover { color: #4db8ff; }
        .tle-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); margin-bottom: 2px; }
        .tle-header { padding: 16px 28px; border-bottom: 1px solid rgba(30,158,255,0.08); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
        .tle-header:hover { background: rgba(30,158,255,0.03); }
        .tle-toggle { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .tle-body { padding: 20px 28px; }
        .tle-line { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #7a9bb5; letter-spacing: 1px; margin-bottom: 8px; line-height: 1.8; word-break: break-all; }
        .tle-line span { color: #1e9eff; margin-right: 12px; }
        .credit-section { background: #0a1520; border: 1px solid rgba(0,255,136,0.12); padding: 24px 28px; margin-bottom: 2px; display: flex; align-items: flex-start; gap: 20px; }
        .credit-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
        .credit-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #00ff88; text-transform: uppercase; margin-bottom: 6px; }
        .credit-text { font-size: 14px; font-weight: 300; color: #7a9bb5; line-height: 1.8; }
        .credit-text a { color: #1e9eff; text-decoration: none; transition: color 0.2s; }
        .credit-text a:hover { color: #4db8ff; }
        .osint-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 28px; margin-bottom: 2px; }
        .osint-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-top: 18px; }
        .osint-card { border-left: 2px solid #1e9eff; padding: 14px 18px; background: rgba(30,158,255,0.04); }
        .osint-card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #d8e8f5; margin-bottom: 7px; }
        .osint-card-desc { font-size: 13px; font-weight: 300; color: #7a9bb5; line-height: 1.7; }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 14px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 20px 0; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1){animation-delay:0s} .loading-bars span:nth-child(2){animation-delay:.15s} .loading-bars span:nth-child(3){animation-delay:.3s} .loading-bars span:nth-child(4){animation-delay:.45s} .loading-bars span:nth-child(5){animation-delay:.6s}
        .loading-text { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1300px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes loadBar { 0%,100%{height:4px} 50%{height:20px} }
        @media (max-width: 1000px) { .content-grid { grid-template-columns: 1fr; } .pass-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 10px 16px; } .tool-hero { padding: 32px 20px; }
          .main-wrap { padding: 20px 16px 60px; }
          .pass-grid { grid-template-columns: repeat(2,1fr); }
          footer { padding: 28px 20px; } .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .obs-inputs { flex-direction: column; align-items: stretch; }
          .obs-input, .obs-input.narrow, .predict-btn, .geo-btn { width: 100%; }
          .hero-stats { gap: 20px; } .tool-hero-inner { flex-direction: column; align-items: flex-start; }
          .postal-inputs { flex-direction: column; align-items: stretch; }
          .postal-select, .postal-input, .postal-btn { width: 100%; }
          .map-inner { height: 320px; } .sky-canvas-wrap { height: 320px; }
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
            <li><a href="/osint" style={{ color: '#00ff88' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('satMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="satMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('satMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a>
          <a href="/cybersecurity">Cybersecurity</a><a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
          <div className="utc-clock">UTC {utcClock}</div>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-hero-text">
              <div className="tool-eyebrow">
                <div className="tool-eyebrow-line" />
                <div className="tool-eyebrow-text">OSINT Hub — Geospatial Intelligence</div>
              </div>
              <div className="tool-title">Satellite Tracker</div>
              <p className="tool-desc">Real-time satellite tracking powered by CelesTrak TLE data. Visualize ground tracks, predict passes over any location, plot sky paths, and analyze orbital coverage for GEOINT and surveillance awareness.</p>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">8K+</div>
                <div className="hero-stat-label">Active Satellites</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">1s</div>
                <div className="hero-stat-label">Update Rate</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">7d</div>
                <div className="hero-stat-label">Pass Lookahead</div>
              </div>
            </div>
          </div>
        </div>

        <div className="main-wrap">

          <div className="search-row">
            <input className="search-input"
              placeholder="Search satellite name or NORAD ID (e.g. ISS, NOAA 18, 25544)"
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()} />
            <button className="search-btn" onClick={doSearch} disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Search →'}
            </button>
          </div>

          <div className="presets">
            <span className="preset-label">Quick Select:&nbsp;&nbsp;</span>
            {PRESETS.map(p => (
              <button key={p.label} className="preset-btn" onClick={() => loadPreset(p)}>{p.label}</button>
            ))}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(s => (
                <div key={s.noradId} className="search-result-item" onClick={() => selectSatellite(s)}>
                  <span className="sat-name">{s.name}</span>
                  <span className="sat-norad">NORAD {s.noradId}</span>
                </div>
              ))}
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <div className="content-grid">
            {/* Visualization panel with tabs */}
            <div className="viz-panel">
              <div className="viz-tabs">
                <button className={`viz-tab${activeView === 'map' ? ' active' : ''}`} onClick={() => setActiveView('map')}>Map</button>
                <button className={`viz-tab${activeView === 'skyplot' ? ' active' : ''}`} onClick={() => setActiveView('skyplot')}>Sky Plot</button>
              </div>
              <div ref={mapRef} className="map-inner" style={{ display: activeView === 'map' ? 'block' : 'none' }} />
              <div className="sky-canvas-wrap" style={{ display: activeView === 'skyplot' ? 'flex' : 'none' }}>
                <canvas ref={skyCanvasRef} width={420} height={420} style={{ maxWidth: '100%', maxHeight: '420px' }} />
              </div>
              {activeView === 'skyplot' && passes.length === 0 && (
                <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', letterSpacing: '2px', color: '#3d5870', pointerEvents: 'none' }}>
                  // Run Pass Predictor to populate sky track
                </div>
              )}
            </div>

            {/* Info panel */}
            <div className="info-panel">
              {selectedSat ? (
                <>
                  <div className="info-sat-header">
                    <div className="info-sat-name"><span className="live-dot" />{selectedSat.name}</div>
                    <div className="info-sat-meta">
                      <span className="info-sat-badge badge-norad">NORAD {selectedSat.noradId}</span>
                      {position && <span className="info-sat-badge badge-orbit">{getOrbitType(position.alt)}</span>}
                      <span className="info-sat-badge badge-live">Live</span>
                    </div>
                  </div>

                  {countdown && (
                    <div className="countdown-box">
                      <div className="countdown-label">Next Pass In</div>
                      <div className="countdown-value">{countdown}</div>
                    </div>
                  )}

                  {position ? (
                    <>
                      <div className="info-section-label">Current Position</div>
                      <div className="info-grid">
                        <div className="info-field">
                          <div className="field-label">Latitude</div>
                          <div className="field-value cyan">{position.lat.toFixed(4)}°</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Longitude</div>
                          <div className="field-value cyan">{position.lon.toFixed(4)}°</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Altitude</div>
                          <div className="field-value green">{position.alt.toFixed(1)} km</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Velocity</div>
                          <div className="field-value">{position.velocity.toFixed(2)} km/s</div>
                        </div>
                      </div>

                      <div className="info-section-label">Orbital Parameters</div>
                      <div className="info-grid">
                        <div className="info-field">
                          <div className="field-label">Period</div>
                          <div className="field-value">{position.period.toFixed(1)} min</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Inclination</div>
                          <div className="field-value">{position.inclination.toFixed(2)}°</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Apogee</div>
                          <div className="field-value amber">{position.apogee.toFixed(0)} km</div>
                        </div>
                        <div className="info-field">
                          <div className="field-label">Perigee</div>
                          <div className="field-value amber">{position.perigee.toFixed(0)} km</div>
                        </div>
                      </div>

                      {lookAngles && (
                        <>
                          <div className="info-section-label">Look Angles from Observer</div>
                          <div className="info-grid">
                            <div className="info-field">
                              <div className="field-label">Azimuth</div>
                              <div className="field-value">{lookAngles.az.toFixed(1)}° {fmtAz(lookAngles.az)}</div>
                            </div>
                            <div className="info-field">
                              <div className="field-label">Elevation</div>
                              <div className={`field-value ${lookAngles.el >= 10 ? 'green' : lookAngles.el >= 0 ? 'amber' : 'red'}`}>
                                {lookAngles.el.toFixed(1)}°
                              </div>
                            </div>
                            <div className="info-field">
                              <div className="field-label">Range</div>
                              <div className="field-value">{lookAngles.range.toFixed(0)} km</div>
                            </div>
                            <div className="info-field">
                              <div className="field-label">Range Rate</div>
                              <div className={`field-value ${lookAngles.rangeRate < 0 ? 'green' : 'red'}`}>
                                {lookAngles.rangeRate > 0 ? '+' : ''}{lookAngles.rangeRate.toFixed(2)} km/s
                              </div>
                            </div>
                            {dopplerHz !== null && (
                              <div className="info-field full">
                                <div className="field-label">Doppler Shift @ {ISS_FREQ_MHZ} MHz</div>
                                <div className={`field-value ${dopplerHz >= 0 ? 'green' : 'red'}`}>
                                  {dopplerHz >= 0 ? '+' : ''}{dopplerHz.toLocaleString()} Hz
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: '20px 22px' }}>
                      <div className="loading-wrap">
                        <div className="loading-bars"><span/><span/><span/><span/><span/></div>
                        <div className="loading-text">Propagating orbit...</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ padding: '32px 22px', color: '#3d5870', fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', letterSpacing: '2px', lineHeight: 2 }}>
                  // Select a satellite above to begin tracking
                </div>
              )}
            </div>
          </div>

          {/* Observer & Pass Predictor */}
          <div className="observer-section">
            <div className="observer-main">
              <div className="section-header-label">Pass Predictor</div>
              <div className="section-header-title">Observer Location</div>
              <div className="obs-inputs">
                <div className="obs-field">
                  <div className="obs-label">Latitude</div>
                  <input className="obs-input" value={observerLat} onChange={e => { observerLatRef.current = e.target.value; setObserverLat(e.target.value); }} placeholder="38.90" />
                </div>
                <div className="obs-field">
                  <div className="obs-label">Longitude</div>
                  <input className="obs-input" value={observerLon} onChange={e => { observerLonRef.current = e.target.value; setObserverLon(e.target.value); }} placeholder="-77.04" />
                </div>
                <div className="obs-field">
                  <div className="obs-label">Min Elevation (°)</div>
                  <input className="obs-input narrow" type="number" min={0} max={89} value={minElevation} onChange={e => setMinElevation(Number(e.target.value))} />
                </div>
                <div className="obs-field" style={{ justifyContent: 'flex-end' }}>
                  <button className="geo-btn" onClick={useMyLocation} disabled={geoLoading}>
                    {geoLoading ? 'Locating...' : '⊕ Use My Location'}
                  </button>
                </div>
                <div className="obs-field" style={{ justifyContent: 'flex-end' }}>
                  <button className="predict-btn" onClick={predictPasses} disabled={!selectedSat || passLoading}>
                    {passLoading ? 'Calculating...' : 'Predict Passes →'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modify Observer toggle */}
            <div className="observer-modify-bar" onClick={() => setShowObserverForm(v => !v)}>
              <div className="observer-modify-label">⊕ Modify Observer — Enter Postal / ZIP Code</div>
              <div className="observer-modify-toggle">{showObserverForm ? '▲ Hide' : '▼ Expand'}</div>
            </div>

            {showObserverForm && (
              <div className="observer-postal-form">
                <div className="postal-form-label">Look up by postal or ZIP code</div>
                <div className="postal-inputs">
                  <div className="obs-field">
                    <div className="obs-label">Country</div>
                    <select className="postal-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)}>
                      <option value="us">🇺🇸 United States</option>
                      <option value="gb">🇬🇧 United Kingdom</option>
                      <option value="ca">🇨🇦 Canada</option>
                      <option value="au">🇦🇺 Australia</option>
                      <option value="de">🇩🇪 Germany</option>
                      <option value="fr">🇫🇷 France</option>
                      <option value="jp">🇯🇵 Japan</option>
                      <option value="nl">🇳🇱 Netherlands</option>
                      <option value="it">🇮🇹 Italy</option>
                      <option value="es">🇪🇸 Spain</option>
                      <option value="br">🇧🇷 Brazil</option>
                      <option value="mx">🇲🇽 Mexico</option>
                      <option value="kr">🇰🇷 South Korea</option>
                      <option value="se">🇸🇪 Sweden</option>
                      <option value="no">🇳🇴 Norway</option>
                      <option value="dk">🇩🇰 Denmark</option>
                      <option value="fi">🇫🇮 Finland</option>
                      <option value="pl">🇵🇱 Poland</option>
                      <option value="ch">🇨🇭 Switzerland</option>
                      <option value="at">🇦🇹 Austria</option>
                      <option value="nz">🇳🇿 New Zealand</option>
                      <option value="pt">🇵🇹 Portugal</option>
                      <option value="be">🇧🇪 Belgium</option>
                      <option value="za">🇿🇦 South Africa</option>
                      <option value="sg">🇸🇬 Singapore</option>
                      <option value="in">🇮🇳 India</option>
                      <option value="tr">🇹🇷 Turkey</option>
                      <option value="ar">🇦🇷 Argentina</option>
                      <option value="cl">🇨🇱 Chile</option>
                      <option value="il">🇮🇱 Israel</option>
                      <option value="ua">🇺🇦 Ukraine</option>
                      <option value="ro">🇷🇴 Romania</option>
                      <option value="hu">🇭🇺 Hungary</option>
                      <option value="cz">🇨🇿 Czech Republic</option>
                      <option value="gr">🇬🇷 Greece</option>
                    </select>
                  </div>
                  <div className="obs-field">
                    <div className="obs-label">Postal / ZIP Code</div>
                    <input
                      className="postal-input"
                      placeholder={selectedCountry === 'us' ? '90210' : selectedCountry === 'gb' ? 'SW1A 1AA' : selectedCountry === 'ca' ? 'K1A 0A9' : 'Postal code'}
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && lookupPostal()}
                    />
                  </div>
                  <div className="obs-field" style={{ justifyContent: 'flex-end' }}>
                    <button className="postal-btn" onClick={lookupPostal} disabled={postalLoading || !postalCode.trim()}>
                      {postalLoading ? 'Looking up...' : 'Look Up →'}
                    </button>
                  </div>
                </div>
                {postalResult && <div className="postal-result">{postalResult}</div>}
              </div>
            )}
          </div>

          {/* Pass results */}
          {(passes.length > 0 || passLoading) && (
            <div className="passes-section">
              <div className="passes-header">
                <div className="section-header-label">Pass Schedule</div>
                <div className="section-header-title" style={{ marginBottom: 0 }}>
                  {selectedSat?.name} — {observerLat}°, {observerLon}°
                </div>
              </div>
              {passLoading && (
                <div style={{ padding: '20px 28px' }}>
                  <div className="loading-wrap">
                    <div className="loading-bars"><span/><span/><span/><span/><span/></div>
                    <div className="loading-text">Computing orbital trajectories...</div>
                  </div>
                </div>
              )}
              {passes.slice(0, showPasses).map((p, i) => (
                <div key={i} className="pass-card">
                  <div className="pass-top">
                    <div className="pass-num">Pass {String(i + 1).padStart(2, '0')}</div>
                    <div className="pass-badges">
                      <div className={`pass-vis ${p.visibility.toLowerCase()}`}>{p.visibility}</div>
                      <div className="pass-vis" style={{ color: '#3d5870', border: '1px solid rgba(30,158,255,0.1)' }}>{p.direction}</div>
                    </div>
                  </div>
                  <div className="pass-grid">
                    <div>
                      <div className="pass-field-label">AOS</div>
                      <div className="pass-field-value">{fmt(p.aos)}</div>
                      <div className="pass-field-value" style={{ fontSize: '10px', color: '#3d5870', marginTop: '3px' }}>Az {p.azAtAos.toFixed(0)}° {fmtAz(p.azAtAos)}</div>
                    </div>
                    <div>
                      <div className="pass-field-label">LOS</div>
                      <div className="pass-field-value">{fmt(p.los)}</div>
                      <div className="pass-field-value" style={{ fontSize: '10px', color: '#3d5870', marginTop: '3px' }}>Az {p.azAtLos.toFixed(0)}° {fmtAz(p.azAtLos)}</div>
                    </div>
                    <div>
                      <div className="pass-field-label">Max Elevation</div>
                      <div className="pass-field-value accent">{p.maxEl.toFixed(1)}°</div>
                    </div>
                    <div>
                      <div className="pass-field-label">Duration</div>
                      <div className="pass-field-value" style={{ fontSize: '14px', color: '#c0cfe0' }}>{fmtDur(p.duration)}</div>
                    </div>
                    <div>
                      <div className="pass-field-label">Sky Track</div>
                      <button className="pass-field-value" style={{ fontSize: '10px', color: '#1e9eff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '1px', fontFamily: "'Share Tech Mono',monospace", textDecoration: 'underline' }}
                        onClick={() => { setPasses(ps => { const updated = [...ps]; const tmp = updated[i]; updated.splice(i, 1); updated.unshift(tmp); return updated; }); setActiveView('skyplot'); }}>
                        View Plot →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {passes.length > showPasses && (
                <button className="show-more-btn" onClick={() => setShowPasses(s => s + 5)}>
                  + Show {Math.min(5, passes.length - showPasses)} more passes ({passes.length - showPasses} remaining) →
                </button>
              )}
            </div>
          )}

          {/* TLE Raw Data */}
          {selectedSat && (
            <div className="tle-section">
              <div className="tle-header" onClick={() => setShowTLE(v => !v)}>
                <div>
                  <div className="section-header-label" style={{ margin: 0 }}>Raw TLE Data</div>
                  <div style={{ fontFamily: "'Barlow',sans-serif", fontSize: '13px', color: '#7a9bb5', marginTop: '4px', fontWeight: 300 }}>
                    Two-Line Element set from CelesTrak — {selectedSat.name}
                  </div>
                </div>
                <div className="tle-toggle">{showTLE ? '▲ Hide' : '▼ Show'}</div>
              </div>
              {showTLE && (
                <div className="tle-body">
                  <div className="tle-line"><span>Name</span>{selectedSat.name}</div>
                  <div className="tle-line"><span>Line 1</span>{selectedSat.line1}</div>
                  <div className="tle-line"><span>Line 2</span>{selectedSat.line2}</div>
                  <div style={{ marginTop: '12px', fontFamily: "'Barlow',sans-serif", fontSize: '12px', color: '#3d5870', fontWeight: 300, lineHeight: 1.7 }}>
                    TLE data sourced from CelesTrak, operated in partnership with the 18th Space Control Squadron, United States Space Force. Updated every 24 hours.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Credit */}
          <div className="credit-section">
            <div className="credit-icon">🛰️</div>
            <div>
              <div className="credit-label">Inspired By</div>
              <p className="credit-text">
                This tool was inspired by{' '}
                <a href="https://github.com/sgoudelis/ground-station" target="_blank" rel="noopener noreferrer">
                  Ground Station
                </a>{' '}
                by <strong style={{ color: '#c0cfe0' }}>Efstratios Goudelis</strong> — an open-source, all-in-one satellite monitoring suite for amateur radio operators and satellite enthusiasts, featuring real-time tracking, antenna rotator control, Doppler correction, IQ recording, and automated pass observations.
                If you find this tool useful, check out his work at{' '}
                <a href="https://github.com/sgoudelis/ground-station" target="_blank" rel="noopener noreferrer">
                  github.com/sgoudelis/ground-station
                </a>.
              </p>
            </div>
          </div>

          {/* OSINT Use Cases */}
          <div className="osint-section">
            <div className="section-header-label">Intelligence Applications</div>
            <div className="section-header-title">OSINT Use Cases</div>
            <p style={{ fontFamily: "'Barlow',sans-serif", fontSize: '14px', fontWeight: 300, color: '#7a9bb5', lineHeight: 1.8 }}>
              All TLE data is publicly available via CelesTrak — the same data used by defense analysts, space agencies, and amateur astronomers worldwide. No authentication required.
            </p>
            <div className="osint-grid">
              <div className="osint-card">
                <div className="osint-card-title">Surveillance Awareness</div>
                <div className="osint-card-desc">Know when reconnaissance satellites (USA-series) have line-of-sight over your area of interest. Use the sky plot to predict exact pass windows.</div>
              </div>
              <div className="osint-card">
                <div className="osint-card-title">Communication Windows</div>
                <div className="osint-card-desc">Plan satellite phone or data uplink windows. The Doppler shift display shows frequency correction needed for radio contact with LEO satellites.</div>
              </div>
              <div className="osint-card">
                <div className="osint-card-title">Geospatial Intelligence</div>
                <div className="osint-card-desc">Track Earth observation satellites (NOAA, Landsat, Sentinel) over conflict zones. The footprint circle shows the satellite's current coverage area.</div>
              </div>
              <div className="osint-card">
                <div className="osint-card-title">Space Situational Awareness</div>
                <div className="osint-card-desc">Over 8,000 active satellites are in orbit. The orbital regime (LEO/MEO/GEO) and inclination reveal the operator's strategic intent.</div>
              </div>
              <div className="osint-card">
                <div className="osint-card-title">ISR Pattern Analysis</div>
                <div className="osint-card-desc">ISR satellites follow predictable orbital mechanics. Pass scheduling can be correlated with ground activity windows and daylight visibility.</div>
              </div>
            </div>
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
