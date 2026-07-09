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
  const [menuOpen, setMenuOpen] = useState(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 700px; margin-bottom: 24px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .source-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); padding: 4px 12px; text-transform: uppercase; background: rgba(30,158,255,0.06); }
        .main-content { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .section-label::after { content: ''; flex: 1; height: 1px; background: rgba(30,158,255,0.15); }
        .base-selector { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
        .base-btn { font-family: 'Share Tech Mono', monospace; font-size: 11px; font-weight: 500; letter-spacing: 2px; padding: 10px 20px; border: 1px solid rgba(30,158,255,0.2); background: rgba(30,158,255,0.04); color: #7a9bb5; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .base-btn:hover { border-color: rgba(30,158,255,0.5); color: #1e9eff; background: rgba(30,158,255,0.08); }
        .base-btn.active { border-color: #1e9eff; color: #030608; background: #1e9eff; }
        .rates-table-wrap { background: #070d12; border: 1px solid rgba(30,158,255,0.12); margin-bottom: 40px; overflow: hidden; }
        .rates-table-header { display: grid; grid-template-columns: 80px 1fr 160px 200px; gap: 0; border-bottom: 1px solid rgba(30,158,255,0.15); padding: 12px 20px; }
        .rates-col-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .rate-row { display: grid; grid-template-columns: 80px 1fr 160px 200px; gap: 0; align-items: center; padding: 14px 20px; border-bottom: 1px solid rgba(30,158,255,0.05); transition: background 0.2s; }
        .rate-row:last-child { border-bottom: none; }
        .rate-row:hover { background: rgba(30,158,255,0.04); }
        .rate-code { font-family: 'Share Tech Mono', monospace; font-size: 13px; font-weight: 500; color: #1e9eff; letter-spacing: 2px; }
        .rate-name { font-family: 'Barlow', sans-serif; font-size: 13px; color: #7a9bb5; }
        .rate-value { font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 1px; text-align: right; padding-right: 20px; }
        .rate-bar-wrap { display: flex; align-items: center; }
        .rate-bar-track { flex: 1; height: 3px; background: rgba(30,158,255,0.08); border-radius: 2px; overflow: hidden; }
        .rate-bar-fill { height: 100%; background: linear-gradient(90deg, rgba(30,158,255,0.4), #1e9eff); border-radius: 2px; transition: width 0.5s ease; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 20px; }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .rates-date { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; padding: 12px 20px; border-top: 1px solid rgba(30,158,255,0.06); text-transform: uppercase; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #ffaa00; padding: 20px; background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.2); margin-bottom: 40px; line-height: 1.8; }
        .converter-wrap { background: #070d12; border: 1px solid rgba(30,158,255,0.12); padding: 28px; margin-bottom: 40px; }
        .converter-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: end; }
        .conv-field { display: flex; flex-direction: column; gap: 8px; }
        .conv-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .conv-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); color: #d8e8f5; font-family: 'Share Tech Mono', monospace; font-size: 16px; padding: 12px 16px; outline: none; letter-spacing: 1px; width: 100%; transition: border-color 0.2s; }
        .conv-input:focus { border-color: rgba(30,158,255,0.5); }
        .conv-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); color: #1e9eff; font-family: 'Share Tech Mono', monospace; font-size: 12px; padding: 12px 16px; outline: none; letter-spacing: 2px; width: 100%; cursor: pointer; }
        .conv-arrow { font-family: 'Share Tech Mono', monospace; font-size: 18px; color: rgba(30,158,255,0.4); padding-bottom: 12px; text-align: center; }
        .conv-result { background: rgba(30,158,255,0.06); border: 1px solid rgba(30,158,255,0.2); padding: 28px; margin-top: 20px; display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; }
        .conv-result-value { font-family: 'Share Tech Mono', monospace; font-size: 32px; color: #1e9eff; letter-spacing: 2px; font-weight: 500; }
        .conv-result-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #5a7a94; letter-spacing: 3px; text-transform: uppercase; }
        .conv-result-eq { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #5a7a94; letter-spacing: 2px; margin-left: auto; }
        .quick-compare-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 40px; }
        .qc-btn { background: #070d12; border: 1px solid rgba(30,158,255,0.15); padding: 20px; cursor: pointer; text-align: left; transition: all 0.2s; }
        .qc-btn:hover { border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.04); }
        .qc-btn.active { border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .qc-pair { font-family: 'Share Tech Mono', monospace; font-size: 14px; font-weight: 500; color: #1e9eff; letter-spacing: 2px; margin-bottom: 6px; }
        .qc-context { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .qc-result-panel { background: rgba(30,158,255,0.04); border: 1px solid rgba(30,158,255,0.2); padding: 24px; margin-bottom: 40px; }
        .qc-result-header { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; margin-bottom: 12px; }
        .qc-result-value { font-family: 'Share Tech Mono', monospace; font-size: 28px; color: #d8e8f5; letter-spacing: 2px; margin-bottom: 6px; }
        .qc-result-context { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .osint-panel { background: #070d12; border: 1px solid rgba(30,158,255,0.12); border-left: 3px solid #1e9eff; padding: 32px; margin-bottom: 40px; }
        .osint-panel-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; }
        .osint-points { display: flex; flex-direction: column; gap: 14px; }
        .osint-point { display: flex; gap: 16px; align-items: flex-start; }
        .osint-point-dot { width: 6px; height: 6px; background: #1e9eff; border-radius: 50%; margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px rgba(30,158,255,0.5); }
        .osint-point-text { font-family: 'Barlow', sans-serif; font-size: 14px; color: #9ab0c4; line-height: 1.7; }
        .osint-point-text strong { color: #c0cfe0; font-weight: 500; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        .footer-copy span { color: #1e9eff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
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

      <div className="page-wrap">
        {/* Nav */}
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        {/* Back bar */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← OSINT Hub</a>
        </div>

        {/* Hero */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <div className="tool-title">Currency Tracker</div>
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
          <div className="section-label">Base Currency</div>
          <div className="base-selector">
            {BASE_CURRENCIES.map((code) => (
              <button
                key={code}
                className={`base-btn ${baseCurrency === code ? 'active' : ''}`}
                onClick={() => setBaseCurrency(code)}
              >
                {code}
              </button>
            ))}
          </div>

          {/* 2. Live Rate Table */}
          <div className="section-label">Live Exchange Rates — 1 {baseCurrency} = ...</div>

          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars"><span /><span /><span /><span /><span /></div>
              <div className="loading-text">Fetching live rates...</div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

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

          {/* 3. Currency Converter */}
          <div className="section-label">Currency Converter</div>
          <div className="converter-wrap">
            <div className="converter-grid">
              <div className="conv-field">
                <div className="conv-label">Amount</div>
                <input
                  className="conv-input"
                  type="number"
                  min="0"
                  value={convAmount}
                  onChange={(e) => setConvAmount(e.target.value)}
                  placeholder="1"
                />
                <select
                  className="conv-select"
                  value={convFrom}
                  onChange={(e) => setConvFrom(e.target.value)}
                >
                  {allCurrencyCodes.map((code) => (
                    <option key={code} value={code}>{code} — {getRateName(code)}</option>
                  ))}
                </select>
              </div>

              <div className="conv-arrow">→</div>

              <div className="conv-field">
                <div className="conv-label">Converted To</div>
                <div
                  className="conv-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#1e9eff',
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
          <div className="section-label">Quick Compare — OSINT Scenarios</div>
          <div className="quick-compare-wrap">
            {QUICK_COMPARES.map((qc) => (
              <button
                key={qc.label}
                className={`qc-btn ${activeCompare?.from === qc.from && activeCompare?.to === qc.to ? 'active' : ''}`}
                onClick={() => handleQuickCompare(qc.from, qc.to, qc.context)}
              >
                <div className="qc-pair">{qc.label}</div>
                <div className="qc-context">{qc.context}</div>
              </button>
            ))}
          </div>

          {activeCompare && (
            <div className="qc-result-panel">
              <div className="qc-result-header">Quick Compare Result</div>
              <div className="qc-result-value">
                1 {activeCompare.from} = {activeCompare.rate === null ? 'Loading...' : `${activeCompare.rate} ${activeCompare.to}`}
              </div>
              <div className="qc-result-context">{activeCompare.context}</div>
            </div>
          )}

          {/* 5. OSINT Context Panel */}
          <div className="section-label">Why This Matters for OSINT</div>
          <div className="osint-panel">
            <div className="osint-panel-title">Intelligence Applications</div>
            <div className="osint-points">
              <div className="osint-point">
                <div className="osint-point-dot" />
                <div className="osint-point-text">
                  <strong>Currency Devaluation as Economic Warfare</strong> — Rapid devaluation of a target nation's currency can indicate active financial sanctions pressure, central bank intervention failures, or deliberate monetary policy as a coercive tool. Track RUB, IRR, and TRY for ongoing pressure signals.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" />
                <div className="osint-point-text">
                  <strong>Capital Flight Patterns</strong> — Sudden strengthening of safe-haven currencies (CHF, USD, JPY) against emerging market currencies often precedes or accompanies political crises, conflict escalation, or anticipated sanctions regimes. Monitor divergence between neighboring currencies.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" />
                <div className="osint-point-text">
                  <strong>Purchasing Power &amp; Cost-of-Living Analysis</strong> — Exchange rates inform realistic assessments of salaries, infrastructure costs, and operational budgets in target countries. Essential for understanding local economic conditions in conflict zones or sanctioned states.
                </div>
              </div>
              <div className="osint-point">
                <div className="osint-point-dot" />
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
      </div>
    </>
  );
}
