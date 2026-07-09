'use client';
import { useState, useMemo } from 'react';
import { COUNTRIES, type ThreatLevel, THREAT_ORDER } from '@/lib/countries';

type Filter = 'All' | ThreatLevel | string; // string = region

const REGIONS = [...new Set(COUNTRIES.map(c => c.region))].sort();
const LEVELS: ThreatLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const LEVEL_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: '#ff3a3a',
  HIGH: '#ff8800',
  MEDIUM: '#ffaa00',
  LOW: '#00cc66',
};

export default function IntelHubPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return COUNTRIES
      .filter(c => {
        if (filter !== 'All' && LEVELS.includes(filter as ThreatLevel) && c.threat_level !== filter) return false;
        if (filter !== 'All' && !LEVELS.includes(filter as ThreatLevel) && c.region !== filter) return false;
        if (search) {
          const q = search.toLowerCase();
          return c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => THREAT_ORDER[a.threat_level] - THREAT_ORDER[b.threat_level] || a.name.localeCompare(b.name));
  }, [filter, search]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding: 110px 40px 100px; max-width: 1200px; margin: 0 auto; }

        .hero { margin-bottom: 48px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 52px); font-weight: 900; color: #fff; letter-spacing: -0.02em; }
        .hero-title span { color: var(--accent); }
        .hero-desc { font-family: var(--font-display); font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin-top: 16px; max-width: 640px; }

        .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; padding: 16px 20px; border: 1px solid var(--border); background: var(--bg-secondary); }
        .legend-item { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .search-input { background: var(--bg-secondary); border: 1px solid var(--border-bright); padding: 12px 18px; font-family: var(--font-display); font-size: 14px; color: var(--text-primary); transition: border-color 0.2s; width: 100%; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: var(--accent); }
        .filter-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 7px 14px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(255,255,255,0.6); color: var(--text-primary); }
        .filter-btn.active { background: var(--accent); border-color: var(--accent); color: #000; font-weight: 700; }

        .results-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2px; }

        .country-card { border: 1px solid var(--border); background: var(--bg-secondary); padding: 24px; text-decoration: none; display: block; transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .country-card:hover { border-color: var(--border-bright); background: var(--bg-card); }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .card-flag { font-size: 28px; line-height: 1; }
        .card-name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; margin-top: 2px; }
        .card-region { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; margin-top: 4px; }
        .threat-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 10px; border: 1px solid; flex-shrink: 0; }
        .card-summary { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .card-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 8px; background: rgba(30,158,255,0.05); border: 1px solid var(--border); color: var(--text-muted); }
        .card-badges { display: flex; gap: 6px; margin-bottom: 10px; }
        .mini-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; padding: 2px 7px; border: 1px solid; text-transform: uppercase; }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 90px 20px 80px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" aria-hidden="true" />
            <div className="hero-eyebrow-text">Intelligence // Country Profiles</div>
          </div>
          <h1 className="hero-title">COUNTRY <span>INTEL</span></h1>
          <div className="hero-desc">Threat assessments, active conflicts, cyber risk ratings, and key concerns for {COUNTRIES.length} countries. Click any profile for the full brief.</div>
        </div>

        <div className="legend">
          {LEVELS.map(l => (
            <div key={l} className="legend-item">
              <div className="legend-dot" style={{ background: LEVEL_COLORS[l] }} aria-hidden="true" />
              <span style={{ color: LEVEL_COLORS[l] }}>{l}</span>
            </div>
          ))}
        </div>

        <div className="controls">
          <input className="search-input" aria-label="Search countries" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-row">
            <button type="button" className={`filter-btn${filter === 'All' ? ' active' : ''}`} onClick={() => setFilter('All')}>All</button>
            {LEVELS.map(l => (
              <button
                key={l}
                type="button"
                className={`filter-btn${filter === l ? ' active' : ''}`}
                style={filter === l ? { background: LEVEL_COLORS[l], borderColor: LEVEL_COLORS[l] } : { color: LEVEL_COLORS[l], borderColor: `${LEVEL_COLORS[l]}40` }}
                onClick={() => setFilter(l)}
              >{l}</button>
            ))}
            {REGIONS.map(r => (
              <button key={r} type="button" className={`filter-btn${filter === r ? ' active' : ''}`} onClick={() => setFilter(r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="results-meta">{filtered.length} profiles</div>

        <div className="grid">
          {filtered.map(c => {
            const color = LEVEL_COLORS[c.threat_level];
            return (
              <a key={c.slug} href={`/intel/${c.slug}`} className="country-card">
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${color}, transparent)`, opacity: 0.5 }} aria-hidden="true" />
                <div className="card-top">
                  <div>
                    <div className="card-flag">{c.flag}</div>
                    <div className="card-name">{c.name}</div>
                    <div className="card-region">{c.region}</div>
                  </div>
                  <div className="threat-badge" style={{ color, borderColor: `${color}50`, background: `${color}12` }}>
                    {c.threat_level}
                  </div>
                </div>
                <div className="card-badges">
                  {c.nato && <div className="mini-badge" style={{ color: '#1e9eff', borderColor: 'rgba(30,158,255,0.3)' }}>NATO</div>}
                  {c.us_sanctioned && <div className="mini-badge" style={{ color: '#ff8800', borderColor: 'rgba(255,136,0,0.3)' }}>SANCTIONED</div>}
                  <div className="mini-badge" style={{ color: (LEVEL_COLORS as Record<string, string>)[c.cyber_threat] ?? '#7a9bb5', borderColor: `${(LEVEL_COLORS as Record<string, string>)[c.cyber_threat] ?? '#7a9bb5'}40` }}>
                    CYBER: {c.cyber_threat}
                  </div>
                </div>
                <div className="card-summary">{c.summary.slice(0, 140)}...</div>
                {c.active_conflicts.length > 0 && (
                  <div className="card-tags">
                    {c.active_conflicts.slice(0, 2).map(conflict => (
                      <span key={conflict} className="card-tag">{conflict.split('(')[0].trim()}</span>
                    ))}
                    {c.active_conflicts.length > 2 && <span className="card-tag">+{c.active_conflicts.length - 2}</span>}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </main>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
