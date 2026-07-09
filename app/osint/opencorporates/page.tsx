'use client';
import { useState, useEffect } from 'react';

const JURISDICTIONS = [
  { code: '', label: 'All Jurisdictions' },
  { code: 'us_de', label: 'US — Delaware' },
  { code: 'us_wy', label: 'US — Wyoming' },
  { code: 'us_nv', label: 'US — Nevada' },
  { code: 'us_ca', label: 'US — California' },
  { code: 'us_ny', label: 'US — New York' },
  { code: 'us_tx', label: 'US — Texas' },
  { code: 'us_fl', label: 'US — Florida' },
  { code: 'us_wa', label: 'US — Washington' },
  { code: 'us_il', label: 'US — Illinois' },
  { code: 'us_co', label: 'US — Colorado' },
  { code: 'us_az', label: 'US — Arizona' },
  { code: 'us_ga', label: 'US — Georgia' },
  { code: 'us_ma', label: 'US — Massachusetts' },
  { code: 'us_md', label: 'US — Maryland' },
  { code: 'us_mi', label: 'US — Michigan' },
  { code: 'us_mn', label: 'US — Minnesota' },
  { code: 'us_nj', label: 'US — New Jersey' },
  { code: 'us_nc', label: 'US — North Carolina' },
  { code: 'us_oh', label: 'US — Ohio' },
  { code: 'us_or', label: 'US — Oregon' },
  { code: 'us_pa', label: 'US — Pennsylvania' },
  { code: 'us_ut', label: 'US — Utah' },
  { code: 'us_va', label: 'US — Virginia' },
  { code: 'us_wi', label: 'US — Wisconsin' },
  { code: 'us_ak', label: 'US — Alaska' },
  { code: 'us_al', label: 'US — Alabama' },
  { code: 'us_ar', label: 'US — Arkansas' },
  { code: 'us_ct', label: 'US — Connecticut' },
  { code: 'us_hi', label: 'US — Hawaii' },
  { code: 'us_ia', label: 'US — Iowa' },
  { code: 'us_id', label: 'US — Idaho' },
  { code: 'us_in', label: 'US — Indiana' },
  { code: 'us_ks', label: 'US — Kansas' },
  { code: 'us_ky', label: 'US — Kentucky' },
  { code: 'us_la', label: 'US — Louisiana' },
  { code: 'us_me', label: 'US — Maine' },
  { code: 'us_mo', label: 'US — Missouri' },
  { code: 'us_ms', label: 'US — Mississippi' },
  { code: 'us_mt', label: 'US — Montana' },
  { code: 'us_nd', label: 'US — North Dakota' },
  { code: 'us_ne', label: 'US — Nebraska' },
  { code: 'us_nh', label: 'US — New Hampshire' },
  { code: 'us_nm', label: 'US — New Mexico' },
  { code: 'us_ok', label: 'US — Oklahoma' },
  { code: 'us_ri', label: 'US — Rhode Island' },
  { code: 'us_sc', label: 'US — South Carolina' },
  { code: 'us_sd', label: 'US — South Dakota' },
  { code: 'us_tn', label: 'US — Tennessee' },
  { code: 'us_vt', label: 'US — Vermont' },
  { code: 'us_wv', label: 'US — West Virginia' },
  { code: 'gb', label: 'United Kingdom' },
  { code: 'ca', label: 'Canada' },
  { code: 'de', label: 'Germany' },
  { code: 'au', label: 'Australia' },
  { code: 'nz', label: 'New Zealand' },
  { code: 'ie', label: 'Ireland' },
  { code: 'sg', label: 'Singapore' },
  { code: 'hk', label: 'Hong Kong' },
  { code: 'fr', label: 'France' },
  { code: 'nl', label: 'Netherlands' },
  { code: 'lu', label: 'Luxembourg' },
  { code: 'cy', label: 'Cyprus' },
  { code: 'mt', label: 'Malta' },
];

const SHELL_HAVENS = new Set(['us_de', 'us_wy', 'us_nv', 'us_sd', 'ky', 'vg', 'bm', 'pa', 'lu', 'mt', 'cy', 'li', 'gg', 'je', 'im']);

function jLabel(code: string): string {
  return JURISDICTIONS.find(j => j.code === code)?.label.replace(/^US — /, 'US-') || code.toUpperCase();
}

function statusColor(s: string): string {
  if (!s) return '#7a9bb5';
  const u = s.toUpperCase();
  if (u.includes('ACTIVE')) return '#00ff88';
  if (u.includes('DISSOLV') || u.includes('STRUCK') || u.includes('CANCEL') || u.includes('REVOK')) return '#ff3a3a';
  if (u.includes('INACTIV') || u.includes('SUSPEND') || u.includes('LAPSED') || u.includes('DELINQ')) return '#ffaa00';
  return '#7a9bb5';
}

export default function OpenCorporatesPage() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'companies' | 'officers'>('companies');
  const [jurisdiction, setJurisdiction] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);

  const runSearch = async (val: string, modeVal: 'companies' | 'officers' = mode) => {
    const q = val.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResults([]);
    setSelected(null);
    setDetail(null);
    setSearched(false);
    try {
      const params = new URLSearchParams({ q, type: modeVal });
      if (modeVal === 'companies' && jurisdiction) params.set('jurisdiction', jurisdiction);
      const res = await fetch(`/api/opencorporates?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results || []);
      setTotal(data.total || 0);
      setSearched(true);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };
  const search = () => runSearch(query);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      const modeVal = params.get('type') === 'officers' ? 'officers' : 'companies';
      setQuery(q);
      setMode(modeVal);
      runSearch(q, modeVal);
    }
  }, []);

  const selectCompany = async (item: any) => {
    setSelected(item);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/opencorporates?jurisdiction=${item.jurisdiction_code}&number=${item.company_number}&type=detail`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDetail(data.company);
    } catch {
      setDetail(item);
    }
    setDetailLoading(false);
  };

  const drillIntoCompany = async (jCode: string, num: string) => {
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/opencorporates?jurisdiction=${jCode}&number=${num}&type=detail`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDetail(data.company);
      setSelected({ ...data.company, _drilled: true });
    } catch {}
    setDetailLoading(false);
  };

  const isShell = (code: string) => SHELL_HAVENS.has(code || '');

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }

        .back-bar { padding: 14px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }

        .hero { padding: 32px 40px 22px; border-bottom: 1px solid rgba(255,170,0,0.1); }
        .hero-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
        .eyebrow-line { width: 36px; height: 1px; background: #ffaa00; }
        .eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #ffaa00; text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(18px, 2.4vw, 30px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.06em; }
        .hero-desc { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); margin-top: 6px; line-height: 1.55; max-width: 580px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .stag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; border: 1px solid rgba(255,170,0,0.28); padding: 3px 10px; background: rgba(255,170,0,0.05); }

        .search-section { padding: 16px 40px; max-width: 1400px; margin: 0 auto; }
        .mode-toggle { display: flex; gap: 2px; margin-bottom: 10px; }
        .mode-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); border: 1px solid rgba(255,170,0,0.12); padding: 7px 20px; cursor: pointer; text-transform: uppercase; background: none; transition: all 0.2s; }
        .mode-btn.active { color: #ffaa00; border-color: #ffaa00; background: rgba(255,170,0,0.07); }
        .mode-btn:hover:not(.active) { color: var(--text-primary); border-color: rgba(255,170,0,0.3); }
        .search-row { display: flex; gap: 8px; }
        .search-input { flex: 1; background: var(--bg-card); border: 1px solid rgba(255,170,0,0.22); padding: 12px 18px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.2s; }
        .search-input:focus { border-color: rgba(255,170,0,0.55); }
        .search-input::placeholder { color: var(--text-muted); }
        .jur-select { background: var(--bg-card); border: 1px solid rgba(255,170,0,0.22); padding: 12px 14px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); min-width: 190px; }
        .search-btn { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--bg-primary); background: #ffaa00; border: none; padding: 12px 26px; cursor: pointer; text-transform: uppercase; white-space: nowrap; transition: background 0.2s; }
        .search-btn:hover { background: #ffc233; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }

        .error-bar { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 8px 40px; }

        .main-layout { display: grid; grid-template-columns: 310px 1fr; gap: 2px; padding: 0 40px 40px; max-width: 1400px; margin: 0 auto; }
        .results-panel { background: var(--bg-secondary); border: 1px solid rgba(255,170,0,0.07); overflow-y: auto; max-height: 700px; }
        .panel-hdr { padding: 10px 14px; border-bottom: 1px solid rgba(255,170,0,0.06); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; position: sticky; top: 0; background: var(--bg-secondary); z-index: 1; }
        .result-item { padding: 12px 14px; border-bottom: 1px solid rgba(255,170,0,0.04); cursor: pointer; transition: background 0.15s; }
        .result-item:hover { background: rgba(255,170,0,0.04); }
        .result-item.active { background: rgba(255,170,0,0.07); border-left: 3px solid #ffaa00; padding-left: 11px; }
        .ri-name { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text-primary); line-height: 1.3; margin-bottom: 3px; }
        .ri-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 3px; }
        .ri-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
        .ri-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; padding: 2px 6px; border: 1px solid; text-transform: uppercase; }
        .no-results { padding: 36px 16px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-align: center; text-transform: uppercase; }

        .detail-panel { background: var(--bg-secondary); border: 1px solid var(--border); overflow-y: auto; max-height: 700px; }
        .detail-empty { padding: 80px 24px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-align: center; line-height: 2.8; text-transform: uppercase; }
        .detail-hdr { padding: 18px 20px; border-bottom: 1px solid rgba(255,170,0,0.1); }
        .detail-name { font-family: var(--font-display); font-size: 21px; font-weight: 700; color: #ffaa00; line-height: 1.2; margin-bottom: 5px; }
        .detail-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .shell-warn { margin: 12px 16px; background: rgba(255,170,0,0.05); border: 1px solid rgba(255,170,0,0.28); padding: 10px 14px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; text-transform: uppercase; line-height: 2; }
        .detail-field { padding: 10px 20px; border-bottom: 1px solid var(--border); }
        .df-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .df-value { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); letter-spacing: 0.05em; line-height: 1.6; word-break: break-all; }

        .officers-block { padding: 0 16px 16px; }
        .officers-hdr { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding: 14px 4px 8px; border-bottom: 1px solid rgba(255,170,0,0.07); margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; }
        .officer-row { padding: 9px 8px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 3px; }
        .officer-row.faded { opacity: 0.45; }
        .off-name { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .off-role { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; text-transform: uppercase; }
        .off-dates { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; }

        .company-btn { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--accent); background: none; border: none; padding: 0; cursor: pointer; text-align: left; transition: color 0.2s; }
        .company-btn:hover { color: #5bc0ff; text-decoration: underline; }
        .company-btn:disabled { color: var(--text-muted); cursor: default; text-decoration: none; }

        .oc-btn { display: block; margin: 14px 16px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #ffaa00; text-decoration: none; border: 1px solid rgba(255,170,0,0.28); padding: 10px 14px; text-transform: uppercase; text-align: center; transition: all 0.2s; }
        .oc-btn:hover { background: rgba(255,170,0,0.07); }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 11px; height: 11px; border: 1.5px solid var(--text-muted); border-top-color: #ffaa00; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px; vertical-align: middle; }

        footer { border-top: 1px solid var(--border); padding: 28px 40px; background: var(--bg-primary); margin-top: 2px; }
        .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-class { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); }

        @media (max-width: 900px) {
          .main-layout, .search-section, .back-bar, .hero, footer { padding-left: 16px; padding-right: 16px; }
          .main-layout { grid-template-columns: 1fr; }
          .search-row { flex-direction: column; }
          .jur-select { min-width: unset; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="eyebrow">
                <div className="eyebrow-line" aria-hidden="true" />
                <div className="eyebrow-text">OSINT Hub — Corporate Intelligence</div>
              </div>
              <h1 className="hero-title">OpenCorporates</h1>
              <div className="hero-desc">
                200M+ companies across all 50 US states and 140 jurisdictions. Officers, registered agents, historical records, and dissolved entities that have vanished from government sources.
              </div>
            </div>
            <div className="source-tags">
              {['200M+ Companies', 'All 50 US States', 'Officers & Agents', 'Historical Data', '140 Jurisdictions', 'Dissolved Entities'].map(t => (
                <div key={t} className="stag">{t}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="search-section">
          <div className="mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mode === 'companies' ? 'active' : ''}`}
              onClick={() => { setMode('companies'); setResults([]); setSearched(false); setSelected(null); setDetail(null); }}
            >
              Companies
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === 'officers' ? 'active' : ''}`}
              onClick={() => { setMode('officers'); setResults([]); setSearched(false); setSelected(null); setDetail(null); setJurisdiction(''); }}
            >
              Officers / People
            </button>
          </div>
          <div className="search-row">
            <input
              className="search-input"
              aria-label="Search companies or officers"
              placeholder={mode === 'companies'
                ? 'Company name — e.g. Acme Holdings, Blackwater, Pacific Ventures LLC'
                : 'Person name — e.g. John Smith, Viktor Bout, Paul Manafort'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            {mode === 'companies' && (
              <select className="jur-select" aria-label="Jurisdiction" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}>
                {JURISDICTIONS.map(j => (
                  <option key={j.code} value={j.code}>{j.label}</option>
                ))}
              </select>
            )}
            <button type="button" className="search-btn" onClick={search} disabled={loading}>
              {loading ? <><span className="spinner" />Searching...</> : 'Search →'}
            </button>
          </div>
        </div>

        {error && <div className="error-bar" role="alert">⚠ {error}</div>}

        <div className="main-layout" aria-live="polite">
          {/* Results list */}
          <div className="results-panel">
            <div className="panel-hdr">
              {searched
                ? `${results.length} of ${total.toLocaleString()} ${mode}`
                : mode === 'companies' ? 'Company results' : 'Officer results'}
            </div>

            {searched && results.length === 0 && (
              <div className="no-results">No results found</div>
            )}

            {mode === 'companies' && results.map((c: any, i: number) => {
              const sc = statusColor(c.current_status || '');
              const shell = isShell(c.jurisdiction_code);
              const isActive = selected?.company_number === c.company_number && selected?.jurisdiction_code === c.jurisdiction_code;
              return (
                <div key={i} className={`result-item ${isActive ? 'active' : ''}`} onClick={() => selectCompany(c)}>
                  <div className="ri-name">{c.name}</div>
                  <div className="ri-meta">{jLabel(c.jurisdiction_code || '')} · #{c.company_number}</div>
                  {c.incorporation_date && <div className="ri-meta">Inc. {c.incorporation_date}</div>}
                  <div className="ri-tags">
                    {c.current_status && (
                      <div className="ri-tag" style={{ color: sc, borderColor: sc }}>{c.current_status}</div>
                    )}
                    {shell && (
                      <div className="ri-tag" style={{ color: '#ffaa00', borderColor: '#ffaa00' }}>⚠ SHELL HAVEN</div>
                    )}
                    {c.dissolution_date && (
                      <div className="ri-tag" style={{ color: '#ff3a3a', borderColor: '#ff3a3a' }}>DISSOLVED</div>
                    )}
                  </div>
                </div>
              );
            })}

            {mode === 'officers' && results.map((o: any, i: number) => {
              const isActive = selected?.id === o.id && selected?.name === o.name;
              return (
                <div key={i} className={`result-item ${isActive ? 'active' : ''}`} onClick={() => setSelected(o)}>
                  <div className="ri-name">{o.name}</div>
                  {o.role && <div className="ri-meta">{o.role.toUpperCase()}</div>}
                  {o.company && (
                    <>
                      <div className="ri-meta">{o.company.name}</div>
                      <div className="ri-meta">{jLabel(o.company.jurisdiction_code || '')}</div>
                    </>
                  )}
                  {o.inactive && (
                    <div className="ri-tags">
                      <div className="ri-tag" style={{ color: '#7a9bb5', borderColor: '#7a9bb5' }}>FORMER</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="detail-panel">
            {detailLoading && (
              <div className="detail-empty"><span className="spinner" />Loading record...</div>
            )}

            {!detailLoading && !selected && (
              <div className="detail-empty">
                Select a result<br />to inspect the full record
              </div>
            )}

            {/* Company detail */}
            {!detailLoading && mode === 'companies' && selected && (() => {
              const c = detail || selected;
              const shell = isShell(c.jurisdiction_code || '');
              const officers: any[] = c.officers || [];
              const active = officers.filter((o: any) => !o.inactive);
              const former = officers.filter((o: any) => o.inactive);
              return (
                <>
                  <div className="detail-hdr">
                    <div className="detail-name">{c.name}</div>
                    <div className="detail-sub">
                      #{c.company_number} · {jLabel(c.jurisdiction_code || '')}
                    </div>
                  </div>

                  {shell && (
                    <div className="shell-warn">
                      ⚠ Shell Haven Jurisdiction — {jLabel(c.jurisdiction_code)} is commonly used for anonymous LLCs, holding structures, and asset concealment
                    </div>
                  )}

                  {c.current_status && (
                    <div className="detail-field">
                      <div className="df-label">Status</div>
                      <div className="df-value" style={{ color: statusColor(c.current_status) }}>{c.current_status}</div>
                    </div>
                  )}
                  {c.company_type && (
                    <div className="detail-field">
                      <div className="df-label">Entity Type</div>
                      <div className="df-value">{c.company_type}</div>
                    </div>
                  )}
                  {c.incorporation_date && (
                    <div className="detail-field">
                      <div className="df-label">Incorporated</div>
                      <div className="df-value">{c.incorporation_date}</div>
                    </div>
                  )}
                  {c.dissolution_date && (
                    <div className="detail-field">
                      <div className="df-label">Dissolved</div>
                      <div className="df-value" style={{ color: '#ff3a3a' }}>{c.dissolution_date}</div>
                    </div>
                  )}
                  {c.registered_address_in_full && (
                    <div className="detail-field">
                      <div className="df-label">Registered Address</div>
                      <div className="df-value">{c.registered_address_in_full}</div>
                    </div>
                  )}
                  {c.registered_agent_name && (
                    <div className="detail-field">
                      <div className="df-label">Registered Agent</div>
                      <div className="df-value" style={{ color: '#ffaa00' }}>{c.registered_agent_name}</div>
                    </div>
                  )}
                  {c.alternative_names?.length > 0 && (
                    <div className="detail-field">
                      <div className="df-label">Alternative Names</div>
                      <div className="df-value">{c.alternative_names.map((n: any) => n.company_name || n).join(' · ')}</div>
                    </div>
                  )}
                  {c.previous_names?.length > 0 && (
                    <div className="detail-field">
                      <div className="df-label">Previous Names</div>
                      <div className="df-value">{c.previous_names.map((n: any) => n.company_name || n).join(' · ')}</div>
                    </div>
                  )}

                  {officers.length > 0 && (
                    <div className="officers-block">
                      {active.length > 0 && (
                        <>
                          <div className="officers-hdr">
                            <span>Current Officers & Agents</span>
                            <span>{active.length}</span>
                          </div>
                          {active.map((o: any, i: number) => (
                            <div key={i} className="officer-row">
                              <div className="off-name">{o.name}</div>
                              <div className="off-role">{o.role}</div>
                              <div className="off-dates">
                                {o.start_date && `From ${o.start_date}`}
                                {o.start_date && o.end_date && ' — '}
                                {o.end_date && `To ${o.end_date}`}
                                {!o.start_date && !o.end_date && 'Dates unavailable'}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {former.length > 0 && (
                        <>
                          <div className="officers-hdr" style={{ marginTop: 14 }}>
                            <span>Former Officers</span>
                            <span>{former.length}</span>
                          </div>
                          {former.map((o: any, i: number) => (
                            <div key={i} className="officer-row faded">
                              <div className="off-name">{o.name}</div>
                              <div className="off-role">{o.role}</div>
                              <div className="off-dates">
                                {o.start_date && `From ${o.start_date}`}
                                {o.start_date && o.end_date && ' — '}
                                {o.end_date && `To ${o.end_date}`}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {c.opencorporates_url && (
                    <a href={c.opencorporates_url} target="_blank" rel="noopener noreferrer" className="oc-btn">
                      View Full Record on OpenCorporates →
                    </a>
                  )}
                </>
              );
            })()}

            {/* Officer detail */}
            {!detailLoading && mode === 'officers' && selected && (() => {
              const o = selected;
              const co = o.company;
              return (
                <>
                  <div className="detail-hdr">
                    <div className="detail-name">{o.name}</div>
                    <div className="detail-sub">Officer / Director / Agent</div>
                  </div>

                  {o.occupation && (
                    <div className="detail-field">
                      <div className="df-label">Occupation</div>
                      <div className="df-value">{o.occupation}</div>
                    </div>
                  )}
                  {o.nationality && (
                    <div className="detail-field">
                      <div className="df-label">Nationality</div>
                      <div className="df-value">{o.nationality}</div>
                    </div>
                  )}
                  {o.date_of_birth && (
                    <div className="detail-field">
                      <div className="df-label">Date of Birth</div>
                      <div className="df-value">{o.date_of_birth}</div>
                    </div>
                  )}
                  {o.role && (
                    <div className="detail-field">
                      <div className="df-label">Role (this record)</div>
                      <div className="df-value" style={{ color: '#ffaa00' }}>{o.role.toUpperCase()}</div>
                    </div>
                  )}

                  {co && (
                    <div className="officers-block">
                      <div className="officers-hdr">
                        <span>Associated Company</span>
                      </div>
                      <div className="officer-row">
                        <button
                          type="button"
                          className="company-btn"
                          onClick={() => co.jurisdiction_code && co.company_number && drillIntoCompany(co.jurisdiction_code, co.company_number)}
                          disabled={!co.jurisdiction_code || !co.company_number}
                        >
                          {co.name}
                        </button>
                        <div className="off-role">{o.role}</div>
                        <div className="off-dates">
                          {jLabel(co.jurisdiction_code || '')}
                          {o.start_date && ` · From ${o.start_date}`}
                          {o.end_date && ` → ${o.end_date}`}
                          {o.inactive && ' · FORMER'}
                        </div>
                      </div>
                    </div>
                  )}

                  {o.opencorporates_url && (
                    <a href={o.opencorporates_url} target="_blank" rel="noopener noreferrer" className="oc-btn">
                      View on OpenCorporates →
                    </a>
                  )}
                </>
              );
            })()}

            {/* Drilled company detail (from officer view) */}
            {!detailLoading && mode === 'officers' && selected?._drilled && detail && (() => {
              const c = detail;
              const shell = isShell(c.jurisdiction_code || '');
              const officers: any[] = c.officers || [];
              return (
                <>
                  <div className="detail-hdr">
                    <div className="detail-name">{c.name}</div>
                    <div className="detail-sub">#{c.company_number} · {jLabel(c.jurisdiction_code || '')}</div>
                  </div>
                  {shell && (
                    <div className="shell-warn">⚠ Shell Haven Jurisdiction — {jLabel(c.jurisdiction_code)}</div>
                  )}
                  {c.current_status && (
                    <div className="detail-field">
                      <div className="df-label">Status</div>
                      <div className="df-value" style={{ color: statusColor(c.current_status) }}>{c.current_status}</div>
                    </div>
                  )}
                  {c.incorporation_date && (
                    <div className="detail-field">
                      <div className="df-label">Incorporated</div>
                      <div className="df-value">{c.incorporation_date}</div>
                    </div>
                  )}
                  {c.registered_address_in_full && (
                    <div className="detail-field">
                      <div className="df-label">Registered Address</div>
                      <div className="df-value">{c.registered_address_in_full}</div>
                    </div>
                  )}
                  {officers.length > 0 && (
                    <div className="officers-block">
                      <div className="officers-hdr"><span>Officers</span><span>{officers.length}</span></div>
                      {officers.map((o: any, i: number) => (
                        <div key={i} className={`officer-row ${o.inactive ? 'faded' : ''}`}>
                          <div className="off-name">{o.name}</div>
                          <div className="off-role">{o.role}</div>
                          <div className="off-dates">
                            {o.start_date && `From ${o.start_date}`}
                            {o.end_date && ` → ${o.end_date}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {c.opencorporates_url && (
                    <a href={c.opencorporates_url} target="_blank" rel="noopener noreferrer" className="oc-btn">
                      View Full Record on OpenCorporates →
                    </a>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-class">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </main>
    </>
  );
}
