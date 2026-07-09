'use client';

import React, { useState, useEffect } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface CryptoPrice {
  usd: number;
  usd_24h_change?: number;
}

interface CryptoPrices {
  bitcoin?: CryptoPrice;
  ethereum?: CryptoPrice;
  monero?: CryptoPrice;
  tether?: CryptoPrice;
}

interface CommodityCard {
  name: string;
  price: string;
  unit: string;
  note: string;
  liveUrl: string;
  category: 'energy' | 'metals' | 'agriculture' | 'industrial';
}

interface CryptoCard {
  id: keyof CryptoPrices;
  symbol: string;
  name: string;
  note: string;
  color: string;
}

// ── Static Data ───────────────────────────────────────────────────────────────

const COMMODITIES: CommodityCard[] = [
  {
    name: 'Brent Crude Oil',
    price: '$75.40',
    unit: 'per barrel',
    note: 'Energy weapon; Russia revenue, Iran sanctions pressure',
    liveUrl: 'https://tradingeconomics.com/commodity/brent-crude-oil',
    category: 'energy',
  },
  {
    name: 'WTI Crude Oil',
    price: '$72.10',
    unit: 'per barrel',
    note: 'US benchmark; sanctions compliance indicator',
    liveUrl: 'https://tradingeconomics.com/commodity/crude-oil',
    category: 'energy',
  },
  {
    name: 'Natural Gas',
    price: '$3.52',
    unit: 'per MMBtu',
    note: 'European energy security; Russia leverage',
    liveUrl: 'https://tradingeconomics.com/commodity/natural-gas',
    category: 'energy',
  },
  {
    name: 'Gold',
    price: '$2,912',
    unit: 'per troy oz',
    note: 'Sanctions hedge; Russia, Iran, North Korea reserves',
    liveUrl: 'https://tradingeconomics.com/commodity/gold',
    category: 'metals',
  },
  {
    name: 'Silver',
    price: '$32.15',
    unit: 'per troy oz',
    note: 'Industrial demand + safe haven',
    liveUrl: 'https://tradingeconomics.com/commodity/silver',
    category: 'metals',
  },
  {
    name: 'Palladium',
    price: '$952',
    unit: 'per troy oz',
    note: 'Russia supplies 40%+ of global palladium',
    liveUrl: 'https://tradingeconomics.com/commodity/palladium',
    category: 'metals',
  },
  {
    name: 'Wheat',
    price: '$5.48',
    unit: 'per bushel',
    note: 'Food security weapon; Ukraine war impact',
    liveUrl: 'https://tradingeconomics.com/commodity/wheat',
    category: 'agriculture',
  },
  {
    name: 'Aluminum',
    price: '$2,405',
    unit: 'per metric ton',
    note: 'Russian export; sanctions pressure indicator',
    liveUrl: 'https://tradingeconomics.com/commodity/aluminum',
    category: 'industrial',
  },
  {
    name: 'Nickel',
    price: '$16,200',
    unit: 'per metric ton',
    note: 'EV batteries; Russia and Indonesia dominance',
    liveUrl: 'https://tradingeconomics.com/commodity/nickel',
    category: 'industrial',
  },
  {
    name: 'Copper',
    price: '$9,520',
    unit: 'per metric ton',
    note: 'Economic activity indicator — the "economist metal"',
    liveUrl: 'https://tradingeconomics.com/commodity/copper',
    category: 'industrial',
  },
];

const CRYPTO_CARDS: CryptoCard[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    note: 'Sanctions evasion monitoring; El Salvador, Russia interest',
    color: '#f7931a',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    note: 'Smart contract ecosystem; DeFi sanctions risk',
    color: '#627eea',
  },
  {
    id: 'monero',
    symbol: 'XMR',
    name: 'Monero',
    note: 'Privacy coin; favored by sanctioned actors, ransomware',
    color: '#ff6600',
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    note: 'Stablecoin; sanctions evasion via crypto',
    color: '#26a17b',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  energy: '#ff6b35',
  metals: '#ffd700',
  agriculture: '#4ade80',
  industrial: '#1e9eff',
};

const CATEGORY_LABELS: Record<string, string> = {
  energy: 'Energy',
  metals: 'Precious Metals',
  agriculture: 'Agriculture',
  industrial: 'Industrial Metals',
};

const DATA_SOURCES = [
  { label: 'TradingEconomics', url: 'https://tradingeconomics.com/commodities' },
  { label: 'Investing.com Commodities', url: 'https://www.investing.com/commodities/' },
  { label: 'CFTC Commitments of Traders', url: 'https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm' },
  { label: 'EIA Energy Data', url: 'https://www.eia.gov/' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (n >= 1) return '$' + n.toFixed(2);
  return '$' + n.toFixed(4);
}

function fmtChange(n: number): string {
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommodityMonitor() {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState('');
  const [lastUpdated] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCrypto() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,monero,tether&vs_currencies=usd&include_24hr_change=true',
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCryptoPrices(data);
        setCryptoError('');
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setCryptoError('Live prices unavailable — CoinGecko rate limit or network error.');
      } finally {
        setCryptoLoading(false);
      }
    }

    fetchCrypto();
    return () => controller.abort();
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .inner { max-width: 1200px; margin: 0 auto; }

        /* ── Hero ── */
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 58px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; margin-bottom: 24px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .source-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border); padding: 4px 12px; text-transform: uppercase; background: rgba(30,158,255,0.06); }

        /* ── Section labels ── */
        .section { padding: 48px 40px; }
        .section-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .section-line { width: 32px; height: 1px; background: var(--accent); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .section-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .section-subtitle { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 24px; }
        .reference-badge { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 5px 14px; text-transform: uppercase; background: rgba(255,170,0,0.04); margin-bottom: 24px; }
        .reference-badge::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ffaa00; animation: blink 2s infinite; }

        /* ── Commodity grid ── */
        .commodity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2px; }
        .commodity-card { background: var(--bg-card); border: 1px solid var(--border); padding: 22px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .commodity-card:hover { border-color: var(--border-bright); }
        .commodity-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
        .commodity-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }
        .commodity-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: 1px; margin-bottom: 10px; }
        .commodity-price { font-family: var(--font-mono); font-size: 26px; font-weight: 500; color: var(--accent); margin-bottom: 2px; letter-spacing: -0.5px; }
        .commodity-unit { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .commodity-note { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; border-left: 2px solid var(--border); padding-left: 10px; }
        .commodity-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; display: inline-flex; align-items: center; gap: 6px; }
        .commodity-link:hover { color: var(--accent); }
        .commodity-link::after { content: '↗'; font-size: 11px; }

        /* ── Crypto grid ── */
        .crypto-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2px; }
        .crypto-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .crypto-card:hover { border-color: var(--border-bright); }
        .crypto-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; }
        .crypto-symbol { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
        .crypto-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 1px; margin-bottom: 12px; }
        .crypto-price { font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: var(--accent); margin-bottom: 4px; letter-spacing: -0.5px; }
        .crypto-change { font-family: var(--font-mono); font-size: 12px; font-weight: 500; margin-bottom: 14px; }
        .crypto-change.pos { color: #22cc66; }
        .crypto-change.neg { color: var(--red); }
        .crypto-note { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; border-left: 2px solid var(--border); padding-left: 10px; }
        .crypto-loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); animation: blink 1.5s infinite; text-transform: uppercase; }
        .crypto-error { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); text-transform: uppercase; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; margin-bottom: 8px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }

        /* ── OSINT context cards ── */
        .context-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2px; }
        .context-card { background: var(--bg-secondary); border: 1px solid var(--border); padding: 28px; position: relative; overflow: hidden; }
        .context-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), transparent); }
        .context-icon { font-size: 20px; margin-bottom: 12px; }
        .context-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
        .context-body { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

        /* ── Data sources ── */
        .source-section { padding: 0 40px 60px; }
        .source-btns { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
        .source-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border-bright); padding: 10px 20px; text-transform: uppercase; background: rgba(30,158,255,0.04); text-decoration: none; transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px; }
        .source-btn:hover { background: rgba(30,158,255,0.12); border-color: var(--accent); color: #fff; }
        .source-btn::after { content: '↗'; font-size: 12px; }

        /* ── Divider ── */
        .divider { border: none; border-top: 1px solid var(--border); margin: 0 40px; }

        /* ── Footer ── */
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 20px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        /* ── Animations ── */
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px 30px; }
          .section { padding: 36px 20px; }
          .divider { margin: 0 20px; }
          .source-section { padding: 0 20px 48px; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .commodity-grid { grid-template-columns: 1fr; }
          .crypto-grid { grid-template-columns: 1fr; }
          .context-grid { grid-template-columns: 1fr; }
          .back-bar { padding: 14px 20px; }
        }
      `}</style>

      <main id="main" className="page-wrap">

        {/* ── Back bar ─────────────────────────────────────────────────────── */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← OSINT Hub</a>
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="tool-hero">
          <div className="inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <h1 className="tool-title">Commodity Monitor</h1>
            <p className="tool-desc">
              Oil, gas, wheat, and gold prices move in direct response to conflict, sanctions, and geopolitical shocks. Track live prices for strategic commodities and crypto assets to monitor supply disruptions, economic pressure campaigns, and the financial signals that often precede major world events.
            </p>
            <div className="source-tags">
              {['Brent Crude', 'WTI Oil', 'Natural Gas', 'Gold', 'Palladium', 'Wheat', 'Bitcoin', 'Monero', 'CoinGecko Live'].map((t) => (
                <div key={t} className="source-tag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — Strategic Commodities
        ════════════════════════════════════════════════════════════════════ */}
        <div className="section">
          <div className="inner">
            <div className="section-header">
              <div className="section-line" aria-hidden="true" />
              <div className="section-label">Strategic Commodities</div>
            </div>
            <h2 className="section-title">Global Commodity Prices</h2>
            <div className="section-subtitle">Reference prices as of {lastUpdated} — click cards for live data</div>

            <div className="reference-badge">
              Reference Prices — Click for Live Data
            </div>

            <div className="commodity-grid">
              {COMMODITIES.map((c) => {
                const accent = CATEGORY_COLORS[c.category];
                return (
                  <div
                    key={c.name}
                    className="commodity-card"
                    style={{ ['--accent' as string]: accent }}
                  >
                    <style>{`
                      .commodity-card[data-cat="${c.category}"]::before { background: ${accent}; }
                    `}</style>
                    <div
                      style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: accent }}
                    />
                    <div className="commodity-cat" style={{ color: accent }}>
                      {CATEGORY_LABELS[c.category]}
                    </div>
                    <div className="commodity-name">{c.name}</div>
                    <div className="commodity-price">{c.price}</div>
                    <div className="commodity-unit">{c.unit}</div>
                    <div className="commodity-note">{c.note}</div>
                    <a
                      href={c.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="commodity-link"
                    >
                      View Live Price
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2 — Crypto Prices (Live)
        ════════════════════════════════════════════════════════════════════ */}
        <div className="section">
          <div className="inner">
            <div className="section-header">
              <div className="section-line" aria-hidden="true" />
              <div className="section-label">Digital Assets — Live</div>
            </div>
            <h2 className="section-title">Cryptocurrency Prices</h2>
            <div className="section-subtitle">
              {cryptoLoading
                ? 'Fetching live prices from CoinGecko...'
                : cryptoError
                ? 'Prices unavailable — showing cached reference data'
                : `Live via CoinGecko API · Last fetched on load`}
            </div>

            <div className="crypto-grid" aria-live="polite">
              {CRYPTO_CARDS.map((c) => {
                const data = cryptoPrices?.[c.id];
                const price = data?.usd;
                const change = data?.usd_24h_change;

                return (
                  <div key={c.id} className="crypto-card">
                    <div
                      style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: c.color }}
                    />
                    <div className="crypto-symbol" style={{ color: c.color }}>
                      {c.symbol}
                    </div>
                    <div className="crypto-name">{c.name}</div>

                    {cryptoLoading ? (
                      <>
                        <div className="loading-bars">
                          <span /><span /><span /><span /><span />
                        </div>
                        <div className="crypto-loading">Fetching...</div>
                      </>
                    ) : cryptoError || price === undefined ? (
                      <div className="crypto-error" role="alert">
                        {cryptoError ? 'Price unavailable' : 'No data'}
                      </div>
                    ) : (
                      <>
                        <div className="crypto-price">{fmt(price)}</div>
                        {change !== undefined && (
                          <div className={`crypto-change ${change >= 0 ? 'pos' : 'neg'}`}>
                            {fmtChange(change)} (24h)
                          </div>
                        )}
                      </>
                    )}

                    <div className="crypto-note">{c.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3 — OSINT Context Cards
        ════════════════════════════════════════════════════════════════════ */}
        <div className="section">
          <div className="inner">
            <div className="section-header">
              <div className="section-line" aria-hidden="true" />
              <div className="section-label">Intelligence Context</div>
            </div>
            <h2 className="section-title">Economic OSINT Framework</h2>
            <div className="section-subtitle">How to interpret commodity and crypto price signals</div>

            <div className="context-grid">
              <div className="context-card">
                <div className="context-icon">⚡</div>
                <div className="context-title">Energy as a Weapon</div>
                <div className="context-body">
                  Russia uses gas and oil supply as geopolitical leverage against Europe and
                  neighboring states. Track price spikes in Brent crude and natural gas as potential
                  coercion signals — sudden drops may indicate supply gluts engineered to undercut
                  competing producers, while surges can signal deliberate supply restriction.
                </div>
              </div>

              <div className="context-card">
                <div className="context-icon">🔗</div>
                <div className="context-title">Commodity Sanctions Impact</div>
                <div className="context-body">
                  When Russia or Iran face new sanctions, track palladium, nickel, aluminum, and
                  oil prices for real economic pressure indicators. Price spikes in Russian-dominated
                  commodities confirm supply disruption. Persistent pressure without price movement
                  may indicate sanctions leakage through third-party intermediaries.
                </div>
              </div>

              <div className="context-card">
                <div className="context-icon">🛡</div>
                <div className="context-title">Crypto Evasion Monitoring</div>
                <div className="context-body">
                  Sanctioned states increasingly use Bitcoin and Monero to bypass financial
                  restrictions. Monero's privacy features — ring signatures, stealth addresses —
                  make it particularly attractive to state-level threat actors. Anomalous volume
                  spikes in XMR can correlate with sanctions escalation events and ransomware
                  campaigns attributed to DPRK and Russian actors.
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4 — Data Source Links
        ════════════════════════════════════════════════════════════════════ */}
        <div className="source-section">
          <div className="inner">
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginTop: '48px',
                marginBottom: '4px',
              }}
            >
              Live Data Sources
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '0',
              }}
            >
              Reference prices sourced from these platforms — all links open in a new tab
            </div>
            <div className="source-btns">
              {DATA_SOURCES.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-btn"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2026 The Rudd Report
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
              }}
            >
              Prices are reference data — verify with live sources
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
