'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  ts: number;
  source: string;
  category: string;
};

const REFRESH_SEC = 90;

const CAT_COLOR: Record<string, string> = {
  Cyber: 'var(--red)',
  Geopolitics: '#ffaa00',
  Global: '#1e9eff',
};

// Stopwords for the trending-topic extractor: articles, filler, and newsroom
// boilerplate that would otherwise dominate the ranking.
const STOP = new Set([
  'the','a','an','and','or','but','of','to','in','on','for','with','from','by','at','as','is','are','be','was','were','been','has','have','had','will','would','could','should','can','may','might','must','that','this','these','those','it','its','he','she','they','them','his','her','their','you','your','we','us','our','who','what','when','where','why','how','than','then','into','over','under','after','before','amid','about','out','off','up','down','new','more','most','some','any','all','no','not','one','two','three','first','last','next','says','say','said','report','reports','reported','live','breaking','update','updates','news','day','days','year','years','week','weeks','month','video','watch','latest','here','still','back','get','gets','got','make','makes','made','set','via','vs','per','amid','plus','ahead','across','among','without','within','being','also','just','now','due','top','key','way','ways','call','calls','see','use','used','man','woman','men','women','world','part','four','five','six','how','why','and','—','–',
]);

function extractTrending(items: FeedItem[]) {
  const df = new Map<string, { count: number; surface: string }>();
  for (const it of items) {
    const words = it.title.match(/[A-Za-z0-9][A-Za-z0-9.'&-]*/g) || [];
    const seen = new Set<string>();
    const add = (key: string, surface: string) => {
      if (seen.has(key)) return;
      seen.add(key);
      const e = df.get(key);
      if (e) e.count++;
      else df.set(key, { count: 1, surface });
    };
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const lw = w.toLowerCase();
      const isAcr = /^[A-Z0-9]{2,5}$/.test(w);
      if ((w.length >= 4 && !STOP.has(lw)) || (isAcr && !STOP.has(lw))) add(lw, w);
      if (i + 1 < words.length) {
        const w2 = words[i + 1];
        const lw2 = w2.toLowerCase();
        if (!STOP.has(lw) && !STOP.has(lw2) && w.length >= 3 && w2.length >= 3) {
          add(`${lw} ${lw2}`, `${w} ${w2}`);
        }
      }
    }
  }
  return [...df.values()]
    .filter((x) => x.count >= 2)
    .sort((a, b) => b.count - a.count || b.surface.length - a.surface.length)
    .slice(0, 12);
}

function timeAgo(ts: number, now: number) {
  if (!ts) return '—';
  const s = Math.max(0, (now - ts) / 1000);
  if (s < 90) return 'now';
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}m`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function OSINTFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [nextIn, setNextIn] = useState(REFRESH_SEC);
  const [newLinks, setNewLinks] = useState<Set<string>>(new Set());
  const [newCount, setNewCount] = useState(0);

  const seenRef = useRef<Set<string>>(new Set());
  const firstLoad = useRef(true);

  const fetchFeeds = useCallback(async () => {
    try {
      const res = await fetch('/api/osint');
      const data = await res.json();
      const incoming: FeedItem[] = data.items || [];
      if (firstLoad.current) {
        incoming.forEach((i) => seenRef.current.add(i.link));
        firstLoad.current = false;
        setNewLinks(new Set());
        setNewCount(0);
      } else {
        const fresh = incoming.filter((i) => !seenRef.current.has(i.link));
        fresh.forEach((i) => seenRef.current.add(i.link));
        setNewLinks(new Set(fresh.map((i) => i.link)));
        setNewCount(fresh.length);
        if (fresh.length) window.setTimeout(() => setNewLinks(new Set()), 6000);
      }
      setItems(incoming);
      setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  // Initial load.
  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  // Auto-refresh countdown (1s tick). Pausable; respects the toggle.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      setNextIn((n) => {
        if (n <= 1) { fetchFeeds(); return REFRESH_SEC; }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [autoRefresh, fetchFeeds]);

  // "time ago" clock — re-tick every 30s so relative times stay fresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const manualRefresh = () => { setNextIn(REFRESH_SEC); fetchFeeds(); };

  const categories = ['All', 'Cyber', 'Geopolitics', 'Global'];

  // Category filter first — drives the analytics panels too.
  const catFiltered = useMemo(
    () => (filter === 'All' ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  // Then the free-text + trending-topic filter for the stream itself.
  const streamItems = useMemo(() => {
    let out = catFiltered;
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((i) => i.title.toLowerCase().includes(q) || i.source.toLowerCase().includes(q));
    if (topic) out = out.filter((i) => i.title.toLowerCase().includes(topic.toLowerCase()));
    return out;
  }, [catFiltered, query, topic]);

  const trending = useMemo(() => extractTrending(catFiltered), [catFiltered]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = { Cyber: 0, Geopolitics: 0, Global: 0 };
    items.forEach((i) => { if (m[i.category] != null) m[i.category]++; });
    return m;
  }, [items]);

  const sourceCounts = useMemo(() => {
    const m = new Map<string, { count: number; category: string; latest: number }>();
    catFiltered.forEach((i) => {
      const e = m.get(i.source);
      if (e) { e.count++; e.latest = Math.max(e.latest, i.ts); }
      else m.set(i.source, { count: 1, category: i.category, latest: i.ts });
    });
    return [...m.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.count - a.count);
  }, [catFiltered]);

  // 24-hour publishing tempo — 24 hourly buckets, oldest→newest.
  const velocity = useMemo(() => {
    const buckets = new Array(24).fill(0);
    catFiltered.forEach((i) => {
      if (!i.ts) return;
      const h = Math.floor((now - i.ts) / 3600000);
      if (h >= 0 && h < 24) buckets[23 - h]++;
    });
    return buckets;
  }, [catFiltered, now]);
  const velMax = Math.max(1, ...velocity);

  const lastHour = useMemo(
    () => catFiltered.filter((i) => i.ts && now - i.ts < 3600000).length,
    [catFiltered, now],
  );
  const topCat = useMemo(() => {
    const entries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    return entries[0] || ['—', 0];
  }, [catCounts]);

  const sourcesOnline = sourceCounts.length;
  const maxTrend = Math.max(1, ...trending.map((t) => t.count));

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .wrap { max-width: 1500px; margin: 0 auto; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }

        /* Header + status */
        .hd { padding: 32px 40px 0; }
        .hd-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .hd-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
        .hd-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .hd-title { font-family: var(--font-display); font-size: clamp(26px, 3.4vw, 42px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.03em; line-height: 1; }
        .hd-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 8px; }

        /* Instrument rail — dense terminal-style readout, not stat cards */
        .rail { display: flex; align-items: stretch; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 0 40px; margin-top: 20px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
        .rail-metrics { display: flex; align-items: stretch; flex-wrap: wrap; }
        .rail-live { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.12em; color: var(--red); text-transform: uppercase; padding: 14px 20px 14px 0; }
        .rail-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--red); animation: pulse 1.6s infinite; }
        .rail-seg { display: inline-flex; align-items: baseline; gap: 7px; padding: 14px 20px; border-left: 1px solid var(--border); }
        .rail-v { font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; letter-spacing: 0.01em; }
        .rail-of { font-size: 12px; font-weight: 400; color: var(--text-muted); }
        .rail-k { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
        .rail-updated .rail-v { font-weight: 400; font-size: 13px; color: var(--text-secondary); }
        .rail-ctrl { display: flex; align-items: center; gap: 8px; padding: 10px 0; }
        .rail-next { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); min-width: 50px; text-align: right; font-variant-numeric: tabular-nums; }
        .st-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); background: none; border: 1px solid var(--border-bright); padding: 7px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.25s; }
        .st-btn:hover { color: var(--accent); border-color: var(--accent); }
        .st-btn.on { color: var(--red); border-color: rgba(255,77,77,0.5); background: rgba(255,77,77,0.08); }

        /* Main two-column */
        .main { display: grid; grid-template-columns: minmax(0,2fr) minmax(300px,1fr); gap: 2px; padding: 20px 40px 80px; align-items: start; }

        /* Stream */
        .stream { background: var(--bg-card); border: 1px solid var(--border); }
        .stream-hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .stream-h { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-secondary); text-transform: uppercase; }
        .search { flex: 1; min-width: 160px; background: var(--bg-primary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; padding: 8px 12px; }
        .search::placeholder { color: var(--text-muted); }
        .filters { display: flex; gap: 2px; flex-wrap: wrap; }
        .fbtn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; text-transform: uppercase; transition: all 0.25s; }
        .fbtn:hover { color: var(--accent); }
        .fbtn.active { color: var(--accent); border-color: var(--accent); background: rgba(30,158,255,0.08); }
        .topic-chip { display: inline-flex; align-items: center; gap: 8px; margin: 12px 20px 0; padding: 6px 12px; border: 1px solid var(--accent); background: rgba(30,158,255,0.08); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); }
        .topic-chip button { background: none; border: none; color: var(--accent); cursor: pointer; font-family: var(--font-mono); font-size: 13px; }

        .stream-list { display: flex; flex-direction: column; }
        .row { display: grid; grid-template-columns: 52px 3px 1fr auto; gap: 14px; align-items: center; padding: 13px 20px; border-bottom: 1px solid var(--border); text-decoration: none; transition: background 0.2s; }
        .row:hover { background: var(--bg-card-hover); }
        .row:last-child { border-bottom: none; }
        .row-time { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); white-space: nowrap; }
        .row-time.fresh { color: var(--red); }
        .row-bar { width: 3px; height: 100%; min-height: 22px; border-radius: 2px; }
        .row-body { min-width: 0; }
        .row-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-primary); line-height: 1.35; transition: color 0.2s; }
        .row:hover .row-title { color: var(--accent); }
        .row-sub { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .row-src { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); text-transform: uppercase; }
        .row-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
        .row-arrow { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); opacity: 0; transition: opacity 0.2s; }
        .row:hover .row-arrow { opacity: 1; color: var(--accent); }
        .row.isnew { animation: flashIn 6s ease-out; }
        .new-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); border: 1px solid rgba(255,77,77,0.4); padding: 0 6px; margin-left: 8px; }

        /* Side panels */
        .side { display: flex; flex-direction: column; gap: 2px; }
        .panel { background: var(--bg-card); border: 1px solid var(--border); padding: 18px 20px; }
        .panel-h { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 16px; }
        .panel-h .tag { color: var(--text-muted); font-weight: 400; }

        .trend-row { position: relative; display: flex; align-items: center; gap: 10px; width: 100%; background: var(--bg-primary); border: 1px solid var(--border); cursor: pointer; padding: 8px 12px; margin-bottom: 4px; text-align: left; overflow: hidden; transition: border-color 0.2s; }
        .trend-row:hover { border-color: var(--border-bright); }
        .trend-row.active { border-color: var(--accent); }
        .trend-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(30,158,255,0.16); border-right: 2px solid var(--accent); transition: width 0.6s var(--ease-expo, ease); }
        .trend-row.active .trend-fill { background: rgba(30,158,255,0.28); }
        .trend-rank { position: relative; z-index: 1; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); min-width: 16px; }
        .trend-name { position: relative; z-index: 1; font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.02em; color: var(--text-secondary); text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .trend-row:hover .trend-name, .trend-row.active .trend-name { color: var(--text-primary); }
        .trend-count { position: relative; z-index: 1; margin-left: auto; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--accent); }

        .cat-row { display: grid; grid-template-columns: 96px 1fr 34px; gap: 10px; align-items: center; margin-bottom: 10px; }
        .cat-name { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; }
        .cat-track { height: 8px; background: var(--border); overflow: hidden; }
        .cat-fill { height: 100%; }
        .cat-num { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); text-align: right; }

        .vel { display: flex; align-items: flex-end; gap: 2px; height: 64px; }
        .vel-col { flex: 1; background: var(--accent); min-height: 2px; opacity: 0.55; transition: opacity 0.2s; }
        .vel-col.hot { opacity: 1; background: var(--red); }
        .vel-axis { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 8px; }

        .src-row { display: grid; grid-template-columns: 8px 1fr auto; gap: 10px; align-items: center; padding: 5px 0; }
        .src-dot { width: 7px; height: 7px; border-radius: 50%; }
        .src-name { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.03em; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .src-count { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }

        .empty { padding: 60px 20px; text-align: center; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

        /* Loading */
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 40px; gap: 18px; }
        .loading-bars { display: flex; gap: 4px; align-items: flex-end; height: 30px; }
        .loading-bars span { width: 4px; background: var(--accent); animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(2){animation-delay:.15s} .loading-bars span:nth-child(3){animation-delay:.3s} .loading-bars span:nth-child(4){animation-delay:.45s} .loading-bars span:nth-child(5){animation-delay:.6s}
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }

        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-bottom { max-width: 1500px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes loadBar { 0%,100%{height:8px} 50%{height:30px} }
        @keyframes flashIn { 0%{background:rgba(255,77,77,0.16)} 100%{background:transparent} }

        @media (prefers-reduced-motion: reduce) {
          .rail-dot { animation: none; }
          .row.isnew { animation: none; }
          .loading-bars span { animation: none; height: 20px; }
        }

        @media (max-width: 1000px) {
          .main { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .back-bar, .hd, .rail, .main { padding-left: 20px; padding-right: 20px; }
          .rail-live { padding-left: 0; }
          .rail-seg { padding: 10px 14px; }
          .row { grid-template-columns: 46px 3px 1fr; }
          .row-arrow { display: none; }
          footer { padding: 30px 20px; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="wrap">
          <div className="back-bar">
            <a href="/osint" className="back-link"><span aria-hidden="true">←</span> Back to OSINT Hub</a>
          </div>

          <div className="hd">
            <div className="hd-eyebrow">
              <div className="hd-eyebrow-line" aria-hidden="true" />
              <div className="hd-eyebrow-text">OSINT Hub — Live Intelligence</div>
            </div>
            <h1 className="hd-title">Intel Watch Floor</h1>
            <div className="hd-sub">Open-source signals from {sourcesOnline || '—'} feeds, aggregated and analyzed in real time</div>
          </div>

          <div className="rail">
            <div className="rail-metrics">
              <span className="rail-live"><span className="rail-dot" aria-hidden="true" /> Live · 24h</span>
              <span className="rail-seg">
                <span className="rail-v">{streamItems.length}{streamItems.length !== items.length && <span className="rail-of"> / {items.length}</span>}</span>
                <span className="rail-k">stories</span>
              </span>
              <span className="rail-seg">
                <span className="rail-v" style={lastHour ? { color: 'var(--red)' } : undefined}>{lastHour}</span>
                <span className="rail-k">last hr</span>
              </span>
              <span className="rail-seg">
                <span className="rail-v">{sourcesOnline}</span>
                <span className="rail-k">sources</span>
              </span>
              <span className="rail-seg">
                <span className="rail-v" style={{ color: CAT_COLOR[topCat[0] as string] }}>{topCat[0]}</span>
                <span className="rail-k">top · {topCat[1]}</span>
              </span>
              {lastUpdated && (
                <span className="rail-seg rail-updated">
                  <span className="rail-v">{lastUpdated}</span>
                  <span className="rail-k">updated</span>
                </span>
              )}
            </div>
            <div className="rail-ctrl">
              <span className="rail-next" aria-hidden="true">{autoRefresh ? `↻ ${nextIn}s` : 'paused'}</span>
              <button type="button" className={`st-btn${autoRefresh ? ' on' : ''}`} aria-pressed={autoRefresh} onClick={() => setAutoRefresh((v) => !v)}>
                <span aria-hidden="true">{autoRefresh ? '⏸' : '▶'}</span> Auto-refresh
              </button>
              <button type="button" className="st-btn" onClick={manualRefresh}><span aria-hidden="true">↺</span> Refresh</button>
            </div>
          </div>

          {/* Screen-reader announcement for new items only (not the whole list).
              Includes the timestamp so identical counts still re-announce. */}
          <div className="sr-only" role="status" aria-live="polite">
            {newCount > 0 ? `${newCount} new ${newCount === 1 ? 'story' : 'stories'} received at ${lastUpdated}` : ''}
          </div>

          {loading ? (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true"><span /><span /><span /><span /><span /></div>
              <div className="loading-text">Acquiring intelligence feeds…</div>
            </div>
          ) : (
            <>
              <div className="main">
                {/* ── Live stream ── */}
                <section className="stream" aria-label="Live story stream">
                  <div className="stream-hd">
                    <h2 className="stream-h">Live Stream</h2>
                    <input
                      className="search"
                      type="search"
                      placeholder="Filter stories…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Filter stories by keyword"
                    />
                    <div className="filters" role="group" aria-label="Filter by category">
                      {categories.map((c) => (
                        <button
                          type="button"
                          key={c}
                          className={`fbtn${filter === c ? ' active' : ''}`}
                          aria-pressed={filter === c}
                          onClick={() => setFilter(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {topic && (
                    <div className="topic-chip">
                      Topic: {topic}
                      <button type="button" onClick={() => setTopic('')} aria-label={`Clear topic filter ${topic}`}>✕</button>
                    </div>
                  )}

                  {/* Announce filtered result counts to assistive tech */}
                  <div className="sr-only" role="status" aria-live="polite">
                    {streamItems.length === 0
                      ? 'No stories match the current filters'
                      : `${streamItems.length} ${streamItems.length === 1 ? 'story' : 'stories'} shown`}
                  </div>

                  {streamItems.length === 0 ? (
                    <div className="empty">No stories match — clear a filter</div>
                  ) : (
                    <div className="stream-list">
                      {streamItems.map((item) => {
                        const fresh = item.ts && now - item.ts < 3600000;
                        const isNew = newLinks.has(item.link);
                        return (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`row${isNew ? ' isnew' : ''}`}
                            key={item.link}
                          >
                            <div className={`row-time${fresh ? ' fresh' : ''}`}>{timeAgo(item.ts, now)}</div>
                            <div className="row-bar" style={{ background: CAT_COLOR[item.category] || 'var(--accent)' }} aria-hidden="true" />
                            <div className="row-body">
                              <div className="row-title">
                                {item.title}
                                {isNew && <span className="new-tag">NEW</span>}
                                <span className="sr-only"> (opens source in new tab)</span>
                              </div>
                              <div className="row-sub">
                                <span className="row-src">{item.source}</span>
                                <span className="row-cat" style={{ color: CAT_COLOR[item.category] }}>{item.category}</span>
                              </div>
                            </div>
                            <div className="row-arrow" aria-hidden="true">→</div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* ── Analytics rail ── */}
                <div className="side">
                  {/* Trending topics */}
                  <section className="panel" aria-label="Trending topics">
                    <h2 className="panel-h">Trending Topics <span className="tag">emerging</span></h2>
                    {trending.length === 0 ? (
                      <div className="src-name">Not enough signal yet</div>
                    ) : (
                      trending.map((t, i) => (
                        <button
                          type="button"
                          key={t.surface}
                          className={`trend-row${topic === t.surface ? ' active' : ''}`}
                          aria-pressed={topic === t.surface}
                          onClick={() => setTopic(topic === t.surface ? '' : t.surface)}
                        >
                          <span className="trend-fill" style={{ width: `${(t.count / maxTrend) * 100}%` }} aria-hidden="true" />
                          <span className="trend-rank" aria-hidden="true">{i + 1}</span>
                          <span className="trend-name">{t.surface}</span>
                          <span className="trend-count">{t.count}<span className="sr-only"> {t.count === 1 ? 'story' : 'stories'}</span></span>
                        </button>
                      ))
                    )}
                  </section>

                  {/* Category mix */}
                  <section className="panel" aria-label="Category distribution">
                    <h2 className="panel-h">Category Mix</h2>
                    {(['Cyber', 'Geopolitics', 'Global'] as const).map((c) => {
                      const total = items.length || 1;
                      const pct = Math.round((catCounts[c] / total) * 100);
                      return (
                        <div className="cat-row" key={c}>
                          <span className="cat-name" style={{ color: CAT_COLOR[c] }}>{c}</span>
                          <span className="cat-track"><span className="cat-fill" style={{ width: `${pct}%`, background: CAT_COLOR[c] }} /></span>
                          <span className="cat-num">{catCounts[c]}</span>
                        </div>
                      );
                    })}
                  </section>

                  {/* 24h velocity */}
                  <section className="panel" aria-label="Publishing velocity over the last 24 hours">
                    <h2 className="panel-h">24h Velocity <span className="tag">{lastHour}/hr now</span></h2>
                    <div className="vel" role="img" aria-label={`Stories published per hour over the last 24 hours. Most recent hour: ${velocity[23]}. Peak: ${velMax}.`}>
                      {velocity.map((v, i) => (
                        <div
                          key={i}
                          className={`vel-col${i >= 22 ? ' hot' : ''}`}
                          style={{ height: `${(v / velMax) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="vel-axis" aria-hidden="true"><span>−24h</span><span>now</span></div>
                  </section>

                  {/* Sources */}
                  <section className="panel" aria-label="Active sources">
                    <h2 className="panel-h">Sources <span className="tag">{sourcesOnline} online</span></h2>
                    {sourceCounts.map((s) => (
                      <div className="src-row" key={s.source}>
                        <span className="src-dot" style={{ background: CAT_COLOR[s.category] || 'var(--accent)' }} aria-hidden="true" />
                        <span className="src-name"><span className="sr-only">{s.category}: </span>{s.source}</span>
                        <span className="src-count">{s.count}</span>
                      </div>
                    ))}
                  </section>
                </div>
              </div>
            </>
          )}
        </div>

      </main>

      <footer>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 The Rudd Report</div>
        </div>
      </footer>
    </>
  );
}
