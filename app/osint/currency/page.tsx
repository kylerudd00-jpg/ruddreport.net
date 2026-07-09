'use client';

import React, { useState, useEffect, useCallback } from 'react';

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  CHF: 'Swiss Franc',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  RUB: 'Russian Ruble',
  SAR: 'Saudi Riyal',
  TRY: 'Turkish Lira',
  BRL: 'Brazilian Real',
  INR: 'Indian Rupee',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  PLN: 'Polish Zloty',
  HUF: 'Hungarian Forint',
  CZK: 'Czech Koruna',
};

const BASE_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'RUB', 'SAR'];

// Frankfurter doesn't support RUB or SAR as base — we proxy via USD
const FRANKFURTER_UNSUPPORTED_BASE = ['RUB', 'SAR'];

const QUICK_COMPARES = [
  { label: 'USD vs RUB', from: 'USD', to: 'RUB', context: 'Russia Sanctions Impact' },
  { label: 'USD vs CNY', from: 'USD', to: 'CNY', context: 'Trade War Monitor' },
  { label: 'USD vs IRR', from: 'USD', to: 'IRR', context: 'Iran Sanctions' },
  { label: 'EUR vs UAH', from: 'EUR', to: 'UAH', context: 'Ukraine Aid Context' },
];

type Rates = Record<string, number>;

function getRateName(code: string): string {
  return CURRENCY_NAMES[code] || code;
}

export default function CurrencyTracker() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [rates, setRates] = useState<Rates>({});
  const [ratesDate, setRatesDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Converter state
  const [convAmount, setConvAmount] = useState('1');
  const [convFrom, setConvFrom] = useState('USD');
  const [convTo, setConvTo] = useState('EUR');
  const [convResult, setConvResult] = useState<number | null>(null);

  // Quick compare state
  const [activeCompare, setActiveCompare] = useState<null | { from: string; to: string; rate: string | null; context: string }>(null);

  const fetchRates = useCallback(async (base: string) => {
    setLoading(true);
    setError('');
    setRates({});
    setRatesDate('');
    try {
      // Frankfurter doesn't support RUB/SAR as base; fetch USD and cross-rate
      if (FRANKFURTER_UNSUPPORTED_BASE.includes(base)) {
        const res = await fetch(`https://api.frankfurter.dev/v1/latest?from=USD`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const usdRates: Rates = { USD: 1, ...data.rates };
        // base in USD terms (e.g. 1 USD = X RUB)
        // We use parallel cross-rate source for RUB/SAR — show a notice
        setRates({});
        setError(`Note: ${base} is not available as a base currency via Frankfurter API (ECB data). Please select a supported base currency such as USD or EUR.`);
        setLoading(false);
        return;
      }
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?from=${base}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRates({ [base]: 1, ...data.rates });
      setRatesDate(data.date || '');
    } catch (e: any) {
      setError(`Failed to fetch rates: ${e?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(baseCurrency);
  }, [baseCurrency, fetchRates]);

  // Compute converter result
  useEffect(() => {
    const amount = parseFloat(convAmount);
    if (isNaN(amount) || !rates[convFrom] || !rates[convTo]) {
      setConvResult(null);
      return;
    }
    // rates are relative to baseCurrency
    // convFrom -> base -> convTo
    // 1 convFrom = (1 / rates[convFrom]) base
    // 1 base = rates[convTo] convTo
    if (convFrom === baseCurrency) {
      setConvResult(amount * rates[convTo]);
    } else if (convTo === baseCurrency) {
      setConvResult(amount / rates[convFrom]);
    } else {
      // cross
      const inBase = amount / rates[convFrom];
      setConvResult(inBase * rates[convTo]);
    }
  }, [convAmount, convFrom, convTo, rates, baseCurrency]);

  const handleQuickCompare = async (from: string, to: string, context: string) => {
    setActiveCompare({ from, to, rate: null, context });
    try {
      if (FRANKFURTER_UNSUPPORTED_BASE.includes(from)) {
        setActiveCompare({ from, to, rate: 'N/A (currency not in ECB dataset)', context });
        return;
      }
      const res = await fetch(`https://api.frankfurter.dev/v1/latest?from=${from}&to=${to}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rate = data.rates?.[to];
      if (!rate) {
        setActiveCompare({ from, to, rate: 'N/A (not in dataset)', context });
      } else {
        setActiveCompare({ from, to, rate: rate.toLocaleString('en-US', { maximumFractionDigits: 4 }), context });
      }
    } catch {
      setActiveCompare({ from, to, rate: 'Error fetching rate', context });
    }
  };

  const sortedRateEntries = Object.entries(rates)
    .filter(([code]) => code !== baseCurrency)
    .sort((a, b) => b[1] - a[1]);

  const maxRate = sortedRateEntries.length > 0 ? Math.max(...sortedRateEntries.map(([, r]) => r)) : 1;

  const allCurrencyCodes = Object.keys(rates).length > 0
    ? Object.keys(rates)
    : Object.keys(CURRENCY_NAMES);

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
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 700px; margin-bottom: 24px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .source-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border); padding: 4px 12px; text-transform: uppercase; background: rgba(30,158,255,0.06); }
        .main-content { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .base-selector { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
        .base-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 500; letter-spacing: 0.05em; padding: 10px 20px; border: 1px solid var(--border-bright); background: var(--bg-card); color: var(--text-secondary); cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .base-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--bg-card-hover); }
        .base-btn.active { border-color: var(--accent); color: var(--bg-primary); background: var(--accent); }
        .rates-table-wrap { background: var(--bg-secondary); border: 1px solid var(--border); margin-bottom: 40px; overflow: hidden; }
        .rates-table-header { display: grid; grid-template-columns: 80px 1fr 160px 200px; gap: 0; border-bottom: 1px solid var(--border); padding: 12px 20px; }
        .rates-col-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .rate-row { display: grid; grid-template-columns: 80px 1fr 160px 200px; gap: 0; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--border); transition: background 0.2s; }
        .rate-row:last-child { border-bottom: none; }
        .rate-row:hover { background: var(--bg-card-hover); }
        .rate-code { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--accent); letter-spacing: 0.05em; }
        .rate-name { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); }
        .rate-value { font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.05em; text-align: right; padding-right: 20px; }
        .rate-bar-wrap { display: flex; align-items: center; }
        .rate-bar-track { flex: 1; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .rate-bar-fill { height: 100%; background: linear-gradient(90deg, rgba(30,158,255,0.4), var(--accent)); border-radius: 2px; transition: width 0.5s ease; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 20px; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .rates-date { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); padding: 12px 20px; border-top: 1px solid var(--border); text-transform: uppercase; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; padding: 20px; background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.2); margin-bottom: 40px; line-height: 1.8; }
        .converter-wrap { background: var(--bg-secondary); border: 1px solid var(--border); padding: 28px; margin-bottom: 40px; }
        .converter-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: end; }
        .conv-field { display: flex; flex-direction: column; gap: 8px; }
        .conv-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .conv-input { background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 16px; padding: 12px 16px; letter-spacing: 0.05em; width: 100%; transition: border-color 0.2s; }
        .conv-input:focus { border-color: var(--accent); }
        .conv-select { background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--accent); font-family: var(--font-mono); font-size: 12px; padding: 12px 16px; letter-spacing: 0.05em; width: 100%; cursor: pointer; }
        .conv-arrow { font-family: var(--font-mono); font-size: 18px; color: var(--text-muted); padding-bottom: 12px; text-align: center; }
        .conv-result { background: rgba(30,158,255,0.06); border: 1px solid var(--border); padding: 28px; margin-top: 20px; display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
        .conv-result-value { font-family: var(--font-mono); font-size: 32px; color: var(--accent); letter-spacing: 0.05em; font-weight: 500; }
        .conv-result-label { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; }
        .conv-result-eq { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; margin-left: auto; }
        .quick-compare-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 40px; }
        .qc-btn { background: var(--bg-secondary); border: 1px solid var(--border-bright); padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s; }
        .qc-btn:hover { border-color: var(--accent); background: var(--bg-card-hover); }
        .qc-btn.active { border-color: var(--accent); background: var(--bg-card-hover); }
        .qc-pair { font-family: var(--font-mono); font-size: 14px; font-weight: 500; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 6px; }
        .qc-context { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .qc-result-panel { background: var(--bg-secondary); border: 1px solid var(--border); padding: 24px; margin-bottom: 40px; }
        .qc-result-header { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .qc-result-value { font-family: var(--font-mono); font-size: 28px; color: var(--text-primary); letter-spacing: 0.05em; margin-bottom: 6px; }
        .qc-result-context { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
        .osint-panel { background: var(--bg-secondary); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 32px; margin-bottom: 40px; }
        .osint-panel-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
        .osint-points { display: flex; flex-direction: column; gap: 14px; }
        .osint-point { display: flex; gap: 16px; align-items: flex-start; }
        .osint-point-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px rgba(30,158,255,0.5); }
        .osint-point-text { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
        .osint-point-text strong { color: var(--text-primary); font-weight: 500; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .main-content { padding: 24px 20px 60px; }
          .rates-table-header { grid-template-columns: 70px 1fr 120px; }
          .rates-table-header .rates-col-label:last-child { display: none; }
          .rate-row { grid-template-columns: 70px 1fr 120px; }
          .rate-bar-wrap { display: none; }
          .converter-grid { grid-template-columns: 1fr; gap: 12px; }
          .conv-arrow { padding-bottom: 0; transform: rotate(90deg); }
          .quick-compare-wrap { grid-template-columns: 1fr 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
        @media (max-width: 480px) {
          .quick-compare-wrap { grid-template-columns: 1fr; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        {/* Back bar */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← OSINT Hub</a>
        </div>

        {/* Hero */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <h1 className="tool-title">Currency Tracker</h1>
            <p className="tool-desc">
              Sudden currency devaluations and exchange rate swings are early warning signs of economic crisis, sanctions pressure, or capital flight. Monitor live rates across global currencies to track the real-world financial impact of geopolitical events as they unfold.
            </p>
            <div className="source-tags">
              {['Live ECB Rates', 'No API Key Required', 'Sanctions Analysis', 'Capital Flight', 'Economic Pressure'].map((t) => (
                <div key={t} className="source-tag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">

          {/* 1. Base Currency Selector */}
          <h2 className="section-label">Base Currency</h2>
          <div className="base-selector">
            {BASE_CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                className={`base-btn ${baseCurrency === code ? 'active' : ''}`}
                onClick={() => setBaseCurrency(code)}
              >
                {code}
              </button>
            ))}
          </div>

          {/* 2. Live Rate Table */}
          <h2 className="section-label">Live Exchange Rates — 1 {baseCurrency} = ...</h2>

          <div aria-live="polite">
            {loading && (
              <div className="loading-wrap">
                <div className="loading-bars" aria-hidden="true"><span /><span /><span /><span /><span /></div>
                <div className="loading-text">Fetching live rates...</div>
              </div>
            )}

            {error && <div className="error-msg" role="alert">{error}</div>}

            {!loading && !error && sortedRateEntries.length > 0 && (
              <div className="rates-table-wrap">
                <div className="rates-table-header">
                  <div className="rates-col-label">Code</div>
                  <div className="rates-col-label">Currency</div>
                  <div className="rates-col-label" style={{ textAlign: 'right', paddingRight: '20px' }}>Rate</div>
                  <div className="rates-col-label">Relative Strength</div>
                </div>
                {sortedRateEntries.map(([code, rate]) => {
                  const barPct = maxRate > 0 ? Math.max(2, (rate / maxRate) * 100) : 2;
                  return (
                    <div key={code} className="rate-row">
                      <div className="rate-code">{code}</div>
                      <div className="rate-name">{getRateName(code)}</div>
                      <div className="rate-value">
                        {rate >= 1000
                          ? rate.toLocaleString('en-US', { maximumFractionDigits: 2 })
                          : rate >= 10
                          ? rate.toLocaleString('en-US', { maximumFractionDigits: 4 })
                          : rate.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                      </div>
                      <div className="rate-bar-wrap">
                        <div className="rate-bar-track">
                          <div className="rate-bar-fill" style={{ width: `${barPct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {ratesDate && (
                  <div className="rates-date">
                    ECB Reference Rate — {ratesDate} — Rates relative to 1 {baseCurrency}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Currency Converter */}
          <h2 className="section-label">Currency Converter</h2>
          <div className="converter-wrap">
            <div className="converter-grid">
              <div className="conv-field">
                <div className="conv-label">Amount</div>
                <input
                  className="conv-input"
                  type="number"
                  min="0"
                  aria-label="Amount to convert"
                  value={convAmount}
                  onChange={(e) => setConvAmount(e.target.value)}
                  placeholder="1"
                />
                <select
                  className="conv-select"
                  aria-label="Convert from currency"
                  value={convFrom}
                  onChange={(e) => setConvFrom(e.target.value)}
                >
                  {allCurrencyCodes.map((code) => (
                    <option key={code} value={code}>{code} — {getRateName(code)}</option>
                  ))}
                </select>
              </div>

              <div className="conv-arrow" aria-hidden="true">→</div>

              <div className="conv-field">
                <div className="conv-label">Converted To</div>
                <div
                  className="conv-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--accent)',
                    fontSize: '18px',
                    minHeight: '48px',
                  }}
                >
                  {convResult !== null
                    ? convResult.toLocaleString('en-US', { maximumFractionDigits: 4 })
                    : loading ? '...' : '—'}
                </div>
                <select
                  className="conv-select"
                  aria-label="Convert to currency"
                  value={convTo}
                  onChange={(e) => setConvTo(e.target.value)}
                >
                  {allCurrencyCodes.map((code) => (
                    <option key={code} value={code}>{code} — {getRateName(code)}</option>
                  ))}
                </select>
              </div>
            </div>

            {convResult !== null && (
              <div className="conv-result">
                <div className="conv-result-value">
                  {convResult.toLocaleString('en-US', { maximumFractionDigits: 4 })} {convTo}
                </div>
                <div className="conv-result-label">{getRateName(convTo)}</div>
                <div className="conv-result-eq">
                  {parseFloat(convAmount).toLocaleString('en-US')} {convFrom} = {convResult.toLocaleString('en-US', { maximumFractionDigits: 4 })} {convTo}
                </div>
              </div>
            )}
          </div>

          {/* 4. Quick Compare */}
          <h2 className="section-label">Quick Compare — OSINT Scenarios</h2>
          <div className="quick-compare-wrap">
            {QUICK_COMPARES.map((qc) => (
              <button
                key={qc.label}
                type="button"
                className={`qc-btn ${activeCompare?.from === qc.from && activeCompare?.to === qc.to ? 'active' : ''}`}
                onClick={() => handleQuickCompare(qc.from, qc.to, qc.context)}
              >
                <div className="qc-pair">{qc.label}</div>
                <div className="qc-context">{qc.context}</div>
              </button>
            ))}
          </div>

          <div aria-live="polite">
            {activeCompare && (
              <div className="qc-result-panel">
                <div className="qc-result-header">Quick Compare Result</div>
                <div className="qc-result-value">
                  1 {activeCompare.from} = {activeCompare.rate === null ? 'Loading...' : `${activeCompare.rate} ${activeCompare.to}`}
                </div>
                <div className="qc-result-context">{activeCompare.context}</div>
              </div>
            )}
          </div>

          {/* 5. OSINT Context Panel */}
          <h2 className="section-label">Why This Matters for OSINT</h2>
          <div className="osint-panel">
            <div className="osint-panel-title">Intelligence Applications</div>
            <div className="osint-points">
              <div className="osint-point">
                <div className="osint-point-dot" aria-hidden="true" />
                <div className="osint-point-text">
                  <strong>Currency Devaluation as Economic Warfare</strong> — Rapid devaluation of a target nation's currency can indicate active financial sanctions pressure, central bank intervention failures, or deliberate monetary policy as a coercive tool. Track RUB, IRR, and TRY for ongoing pressure signals.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" aria-hidden="true" />
                <div className="osint-point-text">
                  <strong>Capital Flight Patterns</strong> — Sudden strengthening of safe-haven currencies (CHF, USD, JPY) against emerging market currencies often precedes or accompanies political crises, conflict escalation, or anticipated sanctions regimes. Monitor divergence between neighboring currencies.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" aria-hidden="true" />
                <div className="osint-point-text">
                  <strong>Purchasing Power &amp; Cost-of-Living Analysis</strong> — Exchange rates inform realistic assessments of salaries, infrastructure costs, and operational budgets in target countries. Essential for understanding local economic conditions in conflict zones or sanctioned states.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" aria-hidden="true" />
                <div className="osint-point-text">
                  <strong>Sanctions Impact Assessment</strong> — The RUB, IRR, and BYR provide direct signals of how effectively financial sanctions are degrading a target economy. Cross-reference with official exchange rates vs. black market rates for fuller picture.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2026 The Rudd Report
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
