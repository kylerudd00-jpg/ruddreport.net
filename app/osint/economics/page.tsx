'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type WBDataPoint = {
  year: number;
  value: number | null;
};

type IndicatorResult = {
  code: string;
  label: string;
  unit: string;
  data: WBDataPoint[];
  loading: boolean;
  error: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const INDICATORS = [
  { code: 'NY.GDP.MKTP.CD',    label: 'GDP',                       unit: 'USD' },
  { code: 'NY.GDP.MKTP.KD.ZG', label: 'GDP Growth',                unit: '% annual' },
  { code: 'NY.GDP.PCAP.CD',    label: 'GDP per Capita',            unit: 'USD' },
  { code: 'FP.CPI.TOTL.ZG',   label: 'Inflation Rate',            unit: '% annual' },
  { code: 'SL.UEM.TOTL.ZS',   label: 'Unemployment Rate',         unit: '%' },
  { code: 'NE.TRD.GNFS.ZS',   label: 'Trade',                     unit: '% of GDP' },
  { code: 'BN.CAB.XOKA.GD.ZS',label: 'Current Account Balance',   unit: '% of GDP' },
  { code: 'GC.DOD.TOTL.GD.ZS',label: 'Central Government Debt',   unit: '% of GDP' },
];

const QUICK_COUNTRIES = [
  { name: 'USA',         code: 'US' },
  { name: 'China',       code: 'CN' },
  { name: 'Russia',      code: 'RU' },
  { name: 'Iran',        code: 'IR' },
  { name: 'North Korea', code: 'PRK' },
  { name: 'Venezuela',   code: 'VE' },
  { name: 'Saudi Arabia',code: 'SA' },
  { name: 'Ukraine',     code: 'UA' },
  { name: 'Israel',      code: 'IL' },
  { name: 'Germany',     code: 'DE' },
  { name: 'France',      code: 'FR' },
  { name: 'UK',          code: 'GB' },
  { name: 'Japan',       code: 'JP' },
  { name: 'India',       code: 'IN' },
  { name: 'Brazil',      code: 'BR' },
  { name: 'Turkey',      code: 'TR' },
  { name: 'Pakistan',    code: 'PK' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Taiwan',      code: 'TW' },
  { name: 'Mexico',      code: 'MX' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(value: number, code: string): string {
  if (code === 'NY.GDP.MKTP.CD' || code === 'NY.GDP.PCAP.CD') {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9)  return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6)  return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  }
  return `${value.toFixed(2)}%`;
}

function getTrend(data: WBDataPoint[]): 'up' | 'down' | 'flat' {
  const valid = data.filter(d => d.value !== null);
  if (valid.length < 2) return 'flat';
  const latest = valid[0].value as number;
  const prev   = valid[1].value as number;
  if (latest > prev + 0.01) return 'up';
  if (latest < prev - 0.01) return 'down';
  return 'flat';
}

function getLatest(data: WBDataPoint[]): WBDataPoint | null {
  return data.find(d => d.value !== null) ?? null;
}

function generateAssessments(indicators: IndicatorResult[]): string[] {
  const obs: string[] = [];

  const get = (code: string) => {
    const ind = indicators.find(i => i.code === code);
    return ind ? getLatest(ind.data)?.value ?? null : null;
  };

  const debt      = get('GC.DOD.TOTL.GD.ZS');
  const inflation = get('FP.CPI.TOTL.ZG');
  const growth    = get('NY.GDP.MKTP.KD.ZG');
  const trade     = get('NE.TRD.GNFS.ZS');
  const unemp     = get('SL.UEM.TOTL.ZS');
  const cab       = get('BN.CAB.XOKA.GD.ZS');

  if (debt !== null && debt > 100)
    obs.push('High sovereign debt burden (>100% GDP) — potential financial vulnerability and reduced fiscal flexibility.');
  if (inflation !== null && inflation > 10)
    obs.push('High inflation rate (>10%) — possible currency instability, consumer distress, or sanctions-related supply disruption.');
  if (growth !== null && growth < 0)
    obs.push('Economic contraction (negative GDP growth) — monitor for political instability, capital flight, or social unrest.');
  if (trade !== null && trade < 30)
    obs.push('Low trade integration (<30% of GDP) — economically isolated; reduced exposure to external financial pressure.');
  if (unemp !== null && unemp > 15)
    obs.push('Elevated unemployment (>15%) — structural economic weakness; heightened risk of social and political instability.');
  if (cab !== null && cab < -5)
    obs.push('Large current account deficit (< -5% GDP) — persistent external imbalance; potential vulnerability to capital outflows.');
  if (debt !== null && debt < 40 && inflation !== null && inflation < 5 && growth !== null && growth > 2)
    obs.push('Macro fundamentals appear stable — low debt, contained inflation, and positive growth. Lower near-term financial crisis risk.');

  // Always ensure at least 2 observations
  if (obs.length === 0) {
    if (growth !== null && growth > 0)
      obs.push(`Positive GDP growth (${growth.toFixed(1)}%) indicates economic expansion, though structural vulnerabilities may still exist.`);
    else
      obs.push('Insufficient data to generate a full economic assessment for this country.');
    obs.push('Cross-reference with sanctions exposure, political risk indices, and currency reserve data for a complete OSINT picture.');
  } else if (obs.length === 1) {
    obs.push('Cross-reference with sanctions exposure, political risk indices, and reserve adequacy for a comprehensive intelligence picture.');
  }

  return obs.slice(0, 5);
}

// ─── Sparkline Component ──────────────────────────────────────────────────────

function Sparkline({ data, code }: { data: WBDataPoint[]; code: string }) {
  const valid = data.filter(d => d.value !== null).slice(0, 5).reverse();
  if (valid.length === 0) return null;

  const values = valid.map(d => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Normalise to 0–28 px height
  const heights = values.map(v => 4 + ((v - min) / range) * 24);

  const isPositiveGood = !['FP.CPI.TOTL.ZG', 'SL.UEM.TOTL.ZS', 'GC.DOD.TOTL.GD.ZS'].includes(code);
  const latest = values[values.length - 1];
  const first  = values[0];
  const barColor = values.length < 2
    ? '#1e9eff'
    : isPositiveGood
      ? latest >= first ? '#00d68f' : '#ff4d4d'
      : latest <= first ? '#00d68f' : '#ff4d4d';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            width: '10px',
            height: `${h}px`,
            background: i === heights.length - 1 ? barColor : 'rgba(30,158,255,0.25)',
            borderRadius: '2px',
            transition: 'height 0.4s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CountryEconomicProfile() {
  const [searchInput,   setSearchInput]   = useState('');
  const [selectedCode,  setSelectedCode]  = useState('');
  const [selectedName,  setSelectedName]  = useState('');
  const [indicators,    setIndicators]    = useState<IndicatorResult[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [fetchError,    setFetchError]    = useState('');

  // ── Country lookup from search input ──────────────────────────────────────
  const handleSearch = () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return;
    // Try to match by code first, then by name
    const byCode = QUICK_COUNTRIES.find(c => c.code.toUpperCase() === q);
    if (byCode) { loadCountry(byCode.code, byCode.name); return; }
    const byName = QUICK_COUNTRIES.find(c => c.name.toUpperCase().includes(q) || q.includes(c.name.toUpperCase()));
    if (byName) { loadCountry(byName.code, byName.name); return; }
    // Treat input as raw country code (World Bank supports ISO 3166-1 alpha-2/3)
    loadCountry(q, q);
  };

  const loadCountry = async (code: string, name: string) => {
    setSelectedCode(code);
    setSelectedName(name);
    setFetchError('');
    setGlobalLoading(true);

    // Initialise all indicators in loading state
    setIndicators(INDICATORS.map(ind => ({
      ...ind,
      data: [],
      loading: true,
      error: '',
    })));

    // Fetch all 8 indicators in parallel
    const results = await Promise.allSettled(
      INDICATORS.map(async (ind) => {
        const url = `https://api.worldbank.org/v2/country/${code}/indicator/${ind.code}?format=json&mrv=5`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // World Bank format: [metadata, [data points]]
        const raw: any[] = json[1] || [];
        const points: WBDataPoint[] = raw
          .map((d: any) => ({ year: parseInt(d.date), value: d.value }))
          .sort((a, b) => b.year - a.year);
        return { code: ind.code, points };
      })
    );

    const updated: IndicatorResult[] = INDICATORS.map((ind, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        return { ...ind, data: result.value.points, loading: false, error: '' };
      } else {
        return { ...ind, data: [], loading: false, error: (result.reason as Error).message || 'Failed' };
      }
    });

    setIndicators(updated);
    setGlobalLoading(false);
  };

  const assessments = useMemo(() => {
    if (indicators.length === 0 || globalLoading) return [];
    return generateAssessments(indicators);
  }, [indicators, globalLoading]);

  const allDone = indicators.length > 0 && !globalLoading;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }

        /* ── Hero ── */
        .tool-hero { padding: 60px 40px 48px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1200px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(30px, 5vw, 58px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; line-height: 1; }
        .tool-title span { color: var(--accent); }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
        .source-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border-bright); padding: 4px 12px; text-transform: uppercase; background: rgba(30,158,255,0.06); }

        /* ── Search area ── */
        .search-section { max-width: 1200px; margin: 0 auto; padding: 40px 40px 0; }
        .search-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); margin-bottom: 12px; }
        .search-input { flex: 1; background: none; border: none; padding: 14px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 2px; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 14px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #45aaff; }

        /* ── Quick-select grid ── */
        .quick-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .quick-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .quick-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; background: rgba(30,158,255,0.05); border: 1px solid var(--border-bright); color: var(--text-secondary); padding: 6px 14px; cursor: pointer; transition: all 0.2s; }
        .quick-btn:hover { background: rgba(30,158,255,0.12); border-color: var(--accent); color: var(--accent); }
        .quick-btn.active { background: rgba(30,158,255,0.15); border-color: var(--accent); color: var(--accent); }

        /* ── Dashboard ── */
        .dashboard { max-width: 1200px; margin: 0 auto; padding: 40px 40px 0; }
        .country-header { display: flex; align-items: baseline; gap: 16px; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .country-name { font-family: var(--font-display); font-size: 32px; font-weight: 900; color: #fff; letter-spacing: 2px; text-transform: uppercase; }
        .country-code-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); border: 1px solid var(--border-bright); padding: 4px 12px; background: rgba(30,158,255,0.08); text-transform: uppercase; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }

        /* ── Indicator cards ── */
        .indicators-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 32px; }
        .ind-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; position: relative; overflow: hidden; }
        .ind-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--border-bright); }
        .ind-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .ind-value { font-family: var(--font-mono); font-size: 22px; color: var(--accent); font-weight: 500; margin-bottom: 4px; line-height: 1; }
        .ind-value.no-data { color: var(--text-muted); font-size: 14px; }
        .ind-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .ind-year { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .ind-trend { font-size: 14px; }
        .ind-trend.up { color: #22cc66; }
        .ind-trend.down { color: var(--red); }
        .ind-trend.flat { color: var(--text-secondary); }
        .ind-unit { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }
        .ind-loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); animation: blink 1.4s infinite; }
        .ind-error { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); }

        /* ── Assessment panel ── */
        .assessment-panel { background: var(--bg-secondary); border: 1px solid var(--border); margin-bottom: 32px; }
        .assessment-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .assessment-header-icon { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 10px var(--accent); flex-shrink: 0; }
        .assessment-header-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .assessment-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; }
        .assessment-item { display: flex; gap: 12px; align-items: flex-start; }
        .assessment-bullet { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-top: 2px; flex-shrink: 0; }
        .assessment-text { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); line-height: 1.7; }

        /* ── Context note ── */
        .context-note { background: rgba(30,158,255,0.04); border: 1px solid var(--border); padding: 28px; margin-bottom: 40px; }
        .context-note-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
        .context-note-body { font-size: 14px; color: var(--text-secondary); line-height: 1.8; }
        .context-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px; }
        .context-item-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-bottom: 4px; }
        .context-item-text { font-size: 13px; color: var(--text-muted); line-height: 1.6; }

        /* ── Loading spinner ── */
        .global-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 60px 40px; }
        .loading-bars { display: flex; gap: 4px; align-items: flex-end; height: 28px; }
        .loading-bars span { width: 4px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }

        /* ── Empty state ── */
        .empty-state { max-width: 1200px; margin: 0 auto; padding: 64px 40px; text-align: center; }
        .empty-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-muted); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px; }
        .empty-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        /* ── Footer ── */
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        /* ── Animations ── */
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 28px; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .indicators-grid { grid-template-columns: repeat(2, 1fr); }
          .context-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px 36px; }
          .search-section { padding: 28px 20px 0; }
          .dashboard { padding: 28px 20px 0; }
          .empty-state { padding: 48px 20px; }
          .indicators-grid { grid-template-columns: 1fr; }
          footer { padding: 28px 20px; }
          .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
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
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <h1 className="tool-title">
              Country <span>Economic</span> Profile
            </h1>
            <p className="tool-desc">
              GDP, inflation, debt levels, and trade balances tell the story of a country's economic health — and its vulnerabilities. Pull World Bank data for any country to understand the economic context behind geopolitical events, sanctions pressure, or investment risk.
            </p>
            <div className="source-tags">
              {['World Bank Open Data', 'GDP & Growth', 'Inflation (CPI)', 'Unemployment', 'Trade Integration', 'Sovereign Debt', 'Current Account', 'No API Key Required'].map(t => (
                <div key={t} className="source-tag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search + Quick Select ────────────────────────────────────────── */}
        <div className="search-section">
          <div className="search-label">Search by country name or ISO code</div>
          <div className="search-box">
            <input
              className="search-input"
              placeholder="e.g. Germany, BR, Pakistan, TWN..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              aria-label="Country search"
            />
            <button type="button" className="search-btn" onClick={handleSearch}>
              Analyse →
            </button>
          </div>

          <div style={{ marginTop: '24px' }}>
            <div className="quick-label">Quick Select — Key OSINT Countries</div>
            <div className="quick-grid">
              {QUICK_COUNTRIES.map(c => (
                <button
                  type="button"
                  key={c.code}
                  className={`quick-btn${selectedCode === c.code ? ' active' : ''}`}
                  onClick={() => { setSearchInput(''); loadCountry(c.code, c.name); }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div aria-live="polite">
        {/* ── Global loading ───────────────────────────────────────────────── */}
        {globalLoading && (
          <div className="global-loading">
            <div className="loading-bars">
              <span /><span /><span /><span /><span />
            </div>
            <div className="loading-text">
              Pulling World Bank data for {selectedName || selectedCode}…
            </div>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {fetchError && !globalLoading && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 40px' }}>
            <div role="alert" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--red)', textTransform: 'uppercase' }}>
              Error: {fetchError}
            </div>
          </div>
        )}

        {/* ── Dashboard ───────────────────────────────────────────────────── */}
        {allDone && !fetchError && (
          <div className="dashboard fade-in">

            {/* Country header */}
            <div className="country-header">
              <h2 className="country-name">{selectedName}</h2>
              <div className="country-code-badge">{selectedCode}</div>
            </div>

            {/* Indicators grid */}
            <div className="section-label">World Bank Macroeconomic Indicators — 5-Year History</div>
            <div className="indicators-grid">
              {indicators.map(ind => {
                const latest  = getLatest(ind.data);
                const trend   = getTrend(ind.data);
                const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';
                const hasData = latest !== null;

                return (
                  <div key={ind.code} className="ind-card">
                    <div className="ind-label">{ind.label}</div>

                    {ind.loading && <div className="ind-loading">Fetching…</div>}

                    {!ind.loading && ind.error && (
                      <div className="ind-error">Data unavailable</div>
                    )}

                    {!ind.loading && !ind.error && (
                      <>
                        <div className={`ind-value${hasData ? '' : ' no-data'}`}>
                          {hasData ? formatValue(latest!.value as number, ind.code) : 'N/A'}
                        </div>
                        {hasData && (
                          <div className="ind-meta">
                            <span className="ind-year">{latest!.year}</span>
                            <span className={`ind-trend ${trend}`}>{trendSymbol}</span>
                          </div>
                        )}
                        <div className="ind-unit">{ind.unit}</div>
                        {ind.data.length > 0 && (
                          <div style={{ marginTop: '14px' }}>
                            <Sparkline data={ind.data} code={ind.code} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* OSINT Assessment Panel */}
            {assessments.length > 0 && (
              <div className="assessment-panel" style={{ marginBottom: '32px' }}>
                <div className="assessment-header">
                  <div className="assessment-header-icon" aria-hidden="true" />
                  <div className="assessment-header-text">Automated OSINT Assessment — {selectedName}</div>
                </div>
                <div className="assessment-body">
                  {assessments.map((obs, i) => (
                    <div key={i} className="assessment-item">
                      <div className="assessment-bullet">//</div>
                      <div className="assessment-text">{obs}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Note */}
            <div className="context-note" style={{ marginBottom: '60px' }}>
              <div className="context-note-title">Why This Matters for OSINT</div>
              <div className="context-note-body">
                Economic indicators are primary intelligence signals. A country's fiscal health, debt trajectory, and trade
                exposure reveal geopolitical leverage points, sanctions vulnerability, and stability risks long before political
                events become visible.
              </div>
              <div className="context-grid" style={{ marginTop: '20px' }}>
                <div>
                  <div className="context-item-label">GDP Growth</div>
                  <div className="context-item-text">Contraction signals systemic stress, resource depletion, or external pressure — often precedes political upheaval.</div>
                </div>
                <div>
                  <div className="context-item-label">Inflation Rate</div>
                  <div className="context-item-text">Hyperinflation erodes state legitimacy and purchasing power; can indicate sanctions effects or monetary mismanagement.</div>
                </div>
                <div>
                  <div className="context-item-label">Sovereign Debt</div>
                  <div className="context-item-text">High debt-to-GDP reduces fiscal maneuverability and creates dependency on external creditors, constraining foreign policy.</div>
                </div>
                <div>
                  <div className="context-item-label">Trade Integration</div>
                  <div className="context-item-text">Low trade-to-GDP indicates economic isolation — useful when assessing sanctions impact and alternative trade routing.</div>
                </div>
                <div>
                  <div className="context-item-label">Current Account</div>
                  <div className="context-item-text">Persistent deficits create reliance on capital inflows; surpluses may fund military modernisation or foreign influence operations.</div>
                </div>
                <div>
                  <div className="context-item-label">Unemployment</div>
                  <div className="context-item-text">Elevated unemployment is a leading indicator of social unrest, regime pressure, and susceptibility to extremist recruitment.</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────── */}
        {!globalLoading && indicators.length === 0 && (
          <div className="empty-state">
            <div className="empty-title">Select a Country to Begin</div>
            <div className="empty-sub">Choose from the quick-select grid or enter any country name / ISO code above</div>
          </div>
        )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer>
          <div className="footer-inner">
            <div className="footer-copy">
              © 2026 The Rudd Report
            </div>
            <div className="footer-copy">
              Data: <span>World Bank Open Data</span> — No API key required
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
