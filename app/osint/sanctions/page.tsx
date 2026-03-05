'use client';

import React, { useMemo, useRef, useState } from 'react';

type OpenSanctionsResult = {
  id: string;
  schema: string;
  caption?: string;
  score?: number; // 0..1
  datasets?: string[];
  topics?: string[];
  properties?: Record<string, any>;
};

const DATASET_LABELS: Record<string, string> = {
  us_ofac_sdn: 'OFAC SDN',
  us_ofac_cons: 'OFAC Consolidated',
  un_sc_sanctions: 'UN Security Council',
  eu_fsf: 'EU Financial Sanctions',
  gb_hmt_sanctions: 'UK HMT',
  us_bis_denied: 'BIS Denied Persons',
  us_state_debarred: 'US State Dept',
  interpol_red_notices: 'INTERPOL Red Notice',
  us_dea_fugitives: 'DEA Fugitives',
  us_fbi_most_wanted: 'FBI Most Wanted',
};

const TOPIC_LABELS: Record<string, { label: string; color: string }> = {
  sanction: { label: 'Sanctioned', color: '#ff3a3a' },
  debarment: { label: 'Debarred', color: '#ff6b35' },
  wanted: { label: 'Wanted', color: '#ffaa00' },
  poi: { label: 'Person of Interest', color: '#ffaa00' },
  crime: { label: 'Criminal', color: '#ff3a3a' },
  terrorism: { label: 'Terrorism', color: '#ff3a3a' },
  weapons: { label: 'Weapons', color: '#ff3a3a' },
  drugs: { label: 'Narcotics', color: '#ff6b35' },
  corruption: { label: 'Corruption', color: '#ffaa00' },
  freeze: { label: 'Asset Freeze', color: '#ff3a3a' },
};

function getSchemaColor(schema: string) {
  if (schema === 'Person') return '#1e9eff';
  if (schema === 'Organization' || schema === 'Company') return '#00ff88';
  if (schema === 'Vessel') return '#ffaa00';
  if (schema === 'Aircraft') return '#c084fc';
  return '#7a9bb5';
}

function getSanctionSources(datasets: string[]) {
  return datasets.map((d) => DATASET_LABELS[d] || d.replace(/_/g, ' ').toUpperCase());
}

function getTopics(topics: string[]) {
  return topics.map((t) => TOPIC_LABELS[t] || { label: t, color: '#7a9bb5' });
}

export default function SanctionsMonitor() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OpenSanctionsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const headerAccent = results.length > 0 ? '#ff3a3a' : '#00ff88';

  const search = async () => {
    const q = query.trim();
    if (!q) return;

    // cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);

    try {
      const res = await fetch(`/api/sanctions?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${text ? ` — ${text}` : ''}`);
      }

      const data = await res.json();

      if (data?.error) throw new Error(data.error);

      setResults((data?.results || []) as OpenSanctionsResult[]);
      setSearched(true);
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      setError(`// ${e?.message || 'Search failed'}`);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #ff3a3a; box-shadow: 0 0 8px #ff3a3a; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #ff3a3a; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; max-width: 700px; margin-bottom: 24px; }
        .source-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .source-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #ff3a3a; border: 1px solid rgba(255,58,58,0.3); padding: 4px 12px; text-transform: uppercase; background: rgba(255,58,58,0.06); }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(255,58,58,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #ff3a3a; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #ff6b6b; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .search-hint { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; margin-top: 10px; }
        .results { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
        .results-header { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; padding: 12px 0; text-transform: uppercase; margin-bottom: 2px; }
        .clear-card { background: #0a1f10; border: 1px solid rgba(0,255,136,0.2); padding: 32px; text-align: center; }
        .clear-icon { font-size: 32px; margin-bottom: 12px; }
        .clear-title { font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 700; color: #00ff88; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        .clear-sub { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; }
        .result-card { background: #0a1520; border: 1px solid rgba(255,58,58,0.2); margin-bottom: 2px; position: relative; overflow: hidden; }
        .result-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #ff3a3a; }
        .result-top { padding: 20px 24px 20px 28px; border-bottom: 1px solid rgba(255,58,58,0.08); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .result-name { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: #ff3a3a; margin-bottom: 4px; }
        .result-aliases { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #7a9bb5; margin-top: 4px; }
        .schema-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; padding: 3px 10px; border: 1px solid; text-transform: uppercase; }
        .topic-pill { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; padding: 3px 10px; border: 1px solid; text-transform: uppercase; }
        .result-body { padding: 20px 24px 20px 28px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .result-field { padding: 12px 16px; background: rgba(255,58,58,0.02); border: 1px solid rgba(255,58,58,0.06); }
        .result-field.full { grid-column: 1 / -1; }
        .field-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 6px; }
        .field-value { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 1px; line-height: 1.7; word-break: break-word; }
        .sanctions-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .sanction-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #ff3a3a; border: 1px solid rgba(255,58,58,0.4); padding: 3px 10px; text-transform: uppercase; background: rgba(255,58,58,0.08); }
        .score-track { height: 4px; background: rgba(255,58,58,0.1); border-radius: 2px; overflow: hidden; }
        .score-fill { height: 100%; background: #ff3a3a; }
        .score-num { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #ff3a3a; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #ff3a3a; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .results { padding: 0 20px 60px; }
          .result-body { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>

          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{ color: '#00ff88' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>

          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="sanctionsMenu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} id="sanctionsMenu">
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">// OSINT Hub — Sanctions Intelligence</div>
            </div>
            <div className="tool-title">Sanctions Monitor</div>
            <p className="tool-desc">
              Cross-reference any individual, organization, or vessel against global sanctions lists in real time.
              Search across OFAC, UN, EU, UK, INTERPOL, and 100+ additional watchlists simultaneously.
            </p>
            <div className="source-tags">
              {['OFAC SDN', 'UN Security Council', 'EU Financial Sanctions', 'UK HMT', 'INTERPOL', 'FBI Most Wanted', 'BIS Denied Persons', 'DEA Fugitives', '100+ More']
                .map((s) => <div key={s} className="source-tag">{s}</div>)}
            </div>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Search sanctions lists"
              placeholder="Search name, organization, vessel — e.g. Vladimir Putin, Rosneft, MV Arctic Sea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Scanning...' : 'Screen →'}
            </button>
          </div>
          <div className="search-hint">// Search by full name, alias, organization, vessel name, or partial match</div>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars"><span /><span /><span /><span /><span /></div>
              <div className="loading-text">// Screening against global watchlists...</div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          {searched && (
            <div className="results-header">
              // <span style={{ color: headerAccent }}>{results.length}</span> result{results.length !== 1 ? 's' : ''} found for "{query}"
              {results.length === 0 && ' — entity not found on any screened watchlist'}
            </div>
          )}

          {searched && results.length === 0 && !loading && (
            <div className="clear-card">
              <div className="clear-icon">✓</div>
              <div className="clear-title">No Matches Found</div>
              <div className="clear-sub">// This entity does not appear on any screened sanctions list or watchlist</div>
            </div>
          )}

          {results.map((r, i) => {
            const props = r.properties || {};
            const name = r.caption || props.name?.[0] || 'Unknown';
            const aliases: string[] = props.alias || props.weakAlias || [];
            const nationality: string[] = props.nationality || props.country || [];
            const birthDate: string[] = props.birthDate || [];
            const position: string[] = props.position || [];
            const address: string[] = props.address || [];
            const notes: string[] = props.notes || props.summary || [];
            const datasets: string[] = r.datasets || [];
            const topics: string[] = r.topics || [];
            const score = typeof r.score === 'number' ? Math.round(r.score * 100) : null;

            const sources = getSanctionSources(datasets);
            const topicInfo = getTopics(topics);
            const schemaColor = getSchemaColor(r.schema);

            return (
              <div key={`${r.id}-${i}`} className="result-card">
                <div className="result-top">
                  <div>
                    <div className="result-name">{name}</div>
                    {aliases.length > 0 && (
                      <div className="result-aliases">AKA: {aliases.slice(0, 5).join(' · ')}</div>
                    )}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <div className="schema-badge" style={{ color: schemaColor, borderColor: schemaColor }}>{r.schema}</div>
                      {topicInfo.map((t, j) => (
                        <div key={j} className="topic-pill" style={{ color: t.color, borderColor: t.color }}>{t.label}</div>
                      ))}
                    </div>
                  </div>

                  {score !== null && (
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontFamily: 'Share Tech Mono', fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase', marginBottom: '6px' }}>
                        // Match Score
                      </div>
                      <div className="score-num">{score}%</div>
                      <div className="score-track">
                        <div className="score-fill" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="result-body">
                  <div className="result-field full">
                    <div className="field-label">// Sanctions Lists</div>
                    <div className="sanctions-list">
                      {sources.map((s, j) => <div key={j} className="sanction-badge">{s}</div>)}
                    </div>
                  </div>

                  {nationality.length > 0 && (
                    <div className="result-field">
                      <div className="field-label">// Nationality / Country</div>
                      <div className="field-value">{nationality.join(', ')}</div>
                    </div>
                  )}

                  {birthDate.length > 0 && (
                    <div className="result-field">
                      <div className="field-label">// Date of Birth</div>
                      <div className="field-value">{birthDate.join(', ')}</div>
                    </div>
                  )}

                  {position.length > 0 && (
                    <div className="result-field full">
                      <div className="field-label">// Position / Title</div>
                      <div className="field-value">{position.join(', ')}</div>
                    </div>
                  )}

                  {address.length > 0 && (
                    <div className="result-field full">
                      <div className="field-label">// Known Address</div>
                      <div className="field-value">{address.slice(0, 3).join(' · ')}</div>
                    </div>
                  )}

                  {notes.length > 0 && (
                    <div className="result-field full">
                      <div className="field-label">// Notes</div>
                      <div className="field-value">{notes[0]}</div>
                    </div>
                  )}

                  <div className="result-field full">
                    <div className="field-label">// OpenSanctions ID</div>
                    <div className="field-value" style={{ color: '#3d5870' }}>{r.id}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}