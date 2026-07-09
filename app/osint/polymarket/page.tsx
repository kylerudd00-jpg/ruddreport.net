'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

type Market = {
  id: string | number;
  question: string;
  slug?: string;
  outcomes?: any;
  outcomePrices?: any;
  volume24hr?: number;
  volumeNum?: number;
  liquidityNum?: number;
  createdAt?: string;
  events?: Array<{ slug?: string }>;
};

type Row = Market & {
  yesPrice: number | null;
  delta: number | null; // current - previous (0..1)
};

function parseArrayMaybe(v: any): any[] | null {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function getYesPrice(m: Market): number | null {
  const outcomes = parseArrayMaybe(m.outcomes) ?? [];
  const prices = parseArrayMaybe(m.outcomePrices) ?? [];

  const yesIdx = outcomes.findIndex((x: any) => String(x).toLowerCase() === 'yes');
  if (yesIdx >= 0 && typeof prices[yesIdx] !== 'undefined') {
    const n = Number(prices[yesIdx]);
    return Number.isFinite(n) ? n : null;
  }

  if (prices.length === 2) {
    const n = Number(prices[0]);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

function fmtPct01(x: number | null): string {
  if (x === null) return '—';
  return `${Math.round(x * 100)}%`;
}

function fmtMoney(x: number | null | undefined): string {
  if (typeof x !== 'number' || !Number.isFinite(x)) return '—';
  const abs = Math.abs(x);
  if (abs >= 1_000_000) return `$${(x / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(x / 1_000).toFixed(1)}K`;
  return `$${Math.round(x).toLocaleString()}`;
}

function fmtDelta(d: number | null): { text: string; cls: string } {
  if (d === null || !Number.isFinite(d)) return { text: '—', cls: 'flat' };
  const pct = d * 100;
  if (pct >= 0.5) return { text: `↑ +${pct.toFixed(1)}%`, cls: 'up' };
  if (pct <= -0.5) return { text: `↓ ${pct.toFixed(1)}%`, cls: 'down' };
  return { text: '—', cls: 'flat' };
}

// --- OSINT FILTERS (tweak keywords anytime) ---
const RX = {
  osint: /(election|poll|vote|primary|president|senate|house|parliament|referendum|sanction|tariff|ceasefire|missile|drone|war|invasion|ukraine|russia|gaza|israel|iran|yemen|houthi|china|taiwan|north korea|nato|cpi|inflation|gdp|recession|rates|fed|boj|ecb|oil|brent|wti|gas|lng|opec|shipping|strait|suez|panama|cyber|hack|ransom|leak|ddos|ai|openai|chips|tsmc|nvidia|space|launch|starship|hurricane|earthquake|wildfire|pandemic)/i,
  elections: /(election|poll|vote|primary|president|senate|house|parliament|referendum|runoff|ballot)/i,
  conflict: /(war|invasion|ceasefire|attack|strike|missile|drone|frontline|offensive|mobilization)/i,
  ukr: /(ukraine|russia|putin|zelensky|donbas|crimea|kursk)/i,
  mideast: /(gaza|israel|iran|hezbollah|hamas|lebanon|syria|iraq|yemen|houthi|red sea)/i,
  china: /(china|taiwan|beijing|xi|pla|south china sea|philippines|tsmc)/i,
  macro: /(cpi|inflation|gdp|recession|unemployment|rates|fed|powell|boj|ecb|imf|yield|treasury)/i,
  energy: /(oil|brent|wti|gas|lng|opec|pipeline|refinery|petrol|diesel)/i,
  cyber: /(cyber|hack|ransom|ddos|breach|leak|exploit|zero[- ]day|malware)/i,
  ai: /(ai|openai|anthropic|gpt|llm|chips|nvidia|tsmc|semiconductor)/i,
  disaster: /(hurricane|earthquake|wildfire|storm|flood|tsunami|pandemic|outbreak)/i,
  shipping: /(shipping|strait|suez|panama|chokepoint|container|port|blockade)/i,
};

type SignalKey =
  | 'All'
  | 'OSINT'
  | 'Elections'
  | 'Conflict'
  | 'Russia-Ukraine'
  | 'Middle East'
  | 'China-Taiwan'
  | 'Macro'
  | 'Energy'
  | 'Shipping'
  | 'Cyber'
  | 'AI'
  | 'Disasters'
  | 'Event Pages'
  | 'Watchlist';

const SIGNALS: { key: SignalKey; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'OSINT', label: 'OSINT' },
  { key: 'Elections', label: 'Elections' },
  { key: 'Conflict', label: 'Conflict' },
  { key: 'Russia-Ukraine', label: 'Russia-Ukraine' },
  { key: 'Middle East', label: 'Middle East' },
  { key: 'China-Taiwan', label: 'China-Taiwan' },
  { key: 'Macro', label: 'Macro' },
  { key: 'Energy', label: 'Energy' },
  { key: 'Shipping', label: 'Shipping' },
  { key: 'Cyber', label: 'Cyber' },
  { key: 'AI', label: 'AI' },
  { key: 'Disasters', label: 'Disasters' },
  { key: 'Event Pages', label: 'Event Pages' },
  { key: 'Watchlist', label: 'Watchlist' },
];

function signalMatch(sig: SignalKey, m: Market): boolean {
  const q = m.question ?? '';
  switch (sig) {
    case 'All': return true;
    case 'OSINT': return RX.osint.test(q);
    case 'Elections': return RX.elections.test(q);
    case 'Conflict': return RX.conflict.test(q);
    case 'Russia-Ukraine': return RX.ukr.test(q);
    case 'Middle East': return RX.mideast.test(q);
    case 'China-Taiwan': return RX.china.test(q);
    case 'Macro': return RX.macro.test(q);
    case 'Energy': return RX.energy.test(q);
    case 'Shipping': return RX.shipping.test(q);
    case 'Cyber': return RX.cyber.test(q);
    case 'AI': return RX.ai.test(q);
    case 'Disasters': return RX.disaster.test(q);
    case 'Event Pages': return Boolean(m?.events?.[0]?.slug);
    case 'Watchlist': return true; // handled separately
    default: return true;
  }
}

export default function PolymarketTracker() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'Volume' | 'Movers' | 'Liquidity'>('Volume');

  const [signal, setSignal] = useState<SignalKey>('OSINT'); // default OSINT
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const prevYesRef = useRef<Map<string, number>>(new Map());

  const watchSet = useMemo(() => new Set(watchlist), [watchlist]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rr_poly_watchlist');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setWatchlist(parsed.map(String));
      }
    } catch {}
  }, []);

  function persistWatch(next: string[]) {
    setWatchlist(next);
    try {
      localStorage.setItem('rr_poly_watchlist', JSON.stringify(next));
    } catch {}
  }

  function togglePin(id: string) {
    const next = watchSet.has(id)
      ? watchlist.filter((x) => x !== id)
      : [id, ...watchlist].slice(0, 200); // cap
    persistWatch(next);
  }

  async function load() {
    setLoading(true);
    try {
      // you already increased markets in the API; keep using mixed pagination
      const r = await fetch('/api/osint/polymarket?mode=mixed&limit=200&pages=5', { cache: 'no-store' });
      const data = await r.json();
      const arr: Market[] = Array.isArray(data) ? data : [];

      const next: Row[] = arr.map((m) => {
        const yes = getYesPrice(m);
        const key = String(m.id);
        const prev = prevYesRef.current.get(key);
        const delta = yes !== null && typeof prev === 'number' ? (yes - prev) : null;
        if (yes !== null) prevYesRef.current.set(key, yes);
        return { ...m, yesPrice: yes, delta };
      });

      setRows(next);
      setLastUpdated(new Date());
    } catch {
      setRows([]);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let base = rows;

    // Signal filter
    if (signal === 'Watchlist') {
      base = base.filter((m) => watchSet.has(String(m.id)));
    } else {
      base = base.filter((m) => signalMatch(signal, m));
    }

    // Text filter
    if (q) base = base.filter((m) => (m.question ?? '').toLowerCase().includes(q));

    // Sort
    const sorted = [...base];
    if (sort === 'Volume') {
      sorted.sort((a, b) => (Number(b.volume24hr) || 0) - (Number(a.volume24hr) || 0));
    } else if (sort === 'Liquidity') {
      sorted.sort((a, b) => (Number(b.liquidityNum) || 0) - (Number(a.liquidityNum) || 0));
    } else {
      sorted.sort((a, b) => Math.abs(Number(b.delta) || 0) - Math.abs(Number(a.delta) || 0));
    }

    return sorted;
  }, [rows, query, sort, signal, watchSet]);

  const updatedLabel = useMemo(() => {
    if (!lastUpdated) return '—';
    const hh = String(lastUpdated.getHours()).padStart(2, '0');
    const mm = String(lastUpdated.getMinutes()).padStart(2, '0');
    const ss = String(lastUpdated.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }, [lastUpdated]);

  const count = filtered.length;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }

        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }

        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #ffffff; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }

        .status-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1100px; margin: 0 auto; border: 1px solid var(--border); background: var(--bg-card); }
        .status-scanning { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; animation: blink 1s infinite; }
        .status-done { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
        .status-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .status-chip { color: var(--accent); }

        .filters { display: flex; gap: 2px; padding: 20px 40px 0; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
        .filters.secondary { padding-top: 8px; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: var(--accent); border-color: var(--border-bright); }
        .filter-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(30,158,255,0.08); }
        .filter-btn.hot.active { color: var(--accent); border-color: var(--accent); background: rgba(30,158,255,0.08); }

        .results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; padding: 20px 40px 80px; max-width: 1100px; margin: 0 auto; }

        .result-card { background: var(--bg-card); border: 1px solid var(--border); padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: all 0.3s; position: relative; overflow: hidden; min-height: 150px; }
        .result-card.up { border-color: rgba(30,158,255,0.25); background: #0a1f18; }
        .result-card.up::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: var(--accent); }
        .result-card.down { border-color: rgba(30,158,255,0.22); background: #07131c; }
        .result-card.flat { border-color: var(--border); }
        .result-card.loading { opacity: 0.65; }

        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .card-platform { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .card-actions { display: flex; align-items: center; gap: 6px; }
        .card-category { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; border: 1px solid var(--border); padding: 2px 6px; white-space: nowrap; height: fit-content; }
        .pin-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; border: 1px solid var(--border-bright); padding: 2px 6px; background: none; color: var(--text-muted); cursor: pointer; }
        .pin-btn:hover { color: var(--accent); border-color: var(--border-bright); }
        .pin-btn.active { color: var(--accent); border-color: var(--border-bright); background: rgba(30,158,255,0.06); }

        .card-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 2px; }
        .metric { border: 1px solid var(--border); background: rgba(3,6,8,0.25); padding: 10px 10px; }
        .metric-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .metric-value { margin-top: 6px; font-family: var(--font-display); font-size: 16px; letter-spacing: 0.05em; color: var(--text-primary); }
        .metric-value.green { color: var(--accent); }
        .metric-value.blue { color: var(--accent); }

        .card-status { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
        .card-status.up { color: var(--accent); }
        .card-status.down { color: var(--accent); }
        .card-status.flat { color: var(--text-muted); }
        .card-status.loading { color: var(--accent); animation: blink 1s infinite; }

        .card-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; transition: color 0.3s; margin-top: 2px; }
        .card-link:hover { color: #22cc66; }

        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 900px) { .results-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .status-bar { padding: 12px 20px; flex-direction: column; gap: 8px; align-items: flex-start; }
          .filters { padding: 16px 20px 0; }
          .results-grid { padding: 16px 20px 60px; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Market Intelligence</div>
            </div>
            <h1 className="tool-title">Polymarket Tracker</h1>
<p className="tool-desc">Prediction markets let people bet real money on how world events unfold — and when the odds shift sharply, informed money is often behind it. This tracker surfaces those probability swings so you can spot what well-connected bettors are pricing in before it makes the news.</p>
          </div>
          <div style={{ maxWidth: 1100, margin: '24px auto 0', display: 'flex', gap: 12 }}>
            <a href="/osint/polymarket/account" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.06em',
              color: 'var(--bg-primary)',
              background: 'var(--accent)',
              border: 'none',
              padding: '12px 24px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              display: 'inline-block',
            }}>
              Account Tracker →
            </a>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Filter markets"
              placeholder="Filter markets — e.g. china, elections, ukraine, sanctions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <button type="button" className="search-btn" onClick={load} disabled={loading}>
              {loading ? 'Syncing...' : 'Sync →'}
            </button>
          </div>
        </div>

        <div className="status-bar">
          <div>
            {loading ? (
              <div className="status-scanning">Pulling live market data...</div>
            ) : (
              <div className="status-done">Live — updated {updatedLabel}</div>
            )}
          </div>
          <div className="status-count">
            {count.toLocaleString()} shown • signal: <span className="status-chip">{signal.toUpperCase()}</span> • sort: {sort.toUpperCase()} • pinned: {watchlist.length}
          </div>
        </div>

        {/* Sort row */}
        <div className="filters">
          {(['Volume', 'Movers', 'Liquidity'] as const).map((c) => (
            <button
              type="button"
              key={c}
              className={`filter-btn ${sort === c ? 'active' : ''}`}
              onClick={() => setSort(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* OSINT signal row */}
        <div className="filters secondary">
          {SIGNALS.map((s) => (
            <button
              type="button"
              key={s.key}
              className={`filter-btn ${signal === s.key ? 'active' : ''} ${s.key === 'OSINT' || s.key === 'Watchlist' ? 'hot' : ''}`}
              onClick={() => setSignal(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="results-grid" aria-live="polite">
          {filtered.map((m) => {
            const deltaInfo = fmtDelta(m.delta);
            const cardCls = loading ? 'loading' : deltaInfo.cls;

            const idStr = String(m.id);
            const pinned = watchSet.has(idStr);

            const href =
              m.slug ? `https://polymarket.com/market/${m.slug}` :
              m.events?.[0]?.slug ? `https://polymarket.com/event/${m.events[0].slug}` :
              null;

            return (
              <div key={idStr} className={`result-card ${cardCls}`}>
                <div className="card-top">
                  <div className="card-platform">{m.question}</div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`pin-btn ${pinned ? 'active' : ''}`}
                      onClick={() => togglePin(idStr)}
                      title={pinned ? 'Unpin from watchlist' : 'Pin to watchlist'}
                      aria-label={pinned ? 'Unpin' : 'Pin'}
                    >
                      {pinned ? 'Pinned' : 'Pin'}
                    </button>
                    <div className="card-category">
{sort === 'Movers' ? 'Momentum' : (m?.events?.[0]?.slug ? 'Event' : 'Live')}
                    </div>
                  </div>
                </div>

                <div className={`card-status ${cardCls}`}>
                  {loading ? 'Updating...' : `${deltaInfo.text} since last sync`}
                </div>

                <div className="card-metrics">
                  <div className="metric">
                    <div className="metric-label">YES</div>
                    <div className={`metric-value ${deltaInfo.cls === 'up' ? 'green' : deltaInfo.cls === 'down' ? 'blue' : ''}`}>
                      {fmtPct01(m.yesPrice)}
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">VOL (24H)</div>
                    <div className="metric-value">{fmtMoney(m.volume24hr)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">LIQUIDITY</div>
                    <div className="metric-value">{fmtMoney(m.liquidityNum)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">ID</div>
                    <div className="metric-value" style={{ fontSize: 12, letterSpacing: 1 }}>
                      {idStr}
                    </div>
                  </div>
                </div>

                {href && (
                  <a className="card-link" href={href} target="_blank" rel="noopener noreferrer">
                    Open Market →
                  </a>
                )}
              </div>
            );
          })}
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