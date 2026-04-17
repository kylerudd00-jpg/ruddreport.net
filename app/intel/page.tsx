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
  const [mobileOpen, setMobileOpen] = useState(false);

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
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 21px; font-weight: 700; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .page-wrap { padding: 110px 40px 100px; max-width: 1200px; margin: 0 auto; }

        .hero { margin-bottom: 48px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 5vw, 52px); font-weight: 900; color: #fff; letter-spacing: 2px; }
        .hero-title span { color: #1e9eff; }
        .hero-desc { font-family: 'Barlow', sans-serif; font-size: 16px; color: #7a9bb5; line-height: 1.6; margin-top: 16px; max-width: 640px; }

        .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.06); background: rgba(7,13,18,0.8); }
        .legend-item { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        .controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .search-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(30,158,255,0.15); padding: 12px 18px; font-family: 'Barlow', sans-serif; font-size: 14px; color: #c0cfe0; outline: none; transition: border-color 0.2s; width: 100%; }
        .search-input::placeholder { color: #3d5870; }
        .search-input:focus { border-color: rgba(30,158,255,0.4); }
        .filter-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .filter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 7px 14px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: #5a7a94; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(255,255,255,0.2); color: #c0cfe0; }
        .filter-btn.active { background: #1e9eff; border-color: #1e9eff; color: #000; font-weight: 700; }

        .results-meta { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2px; }

        .country-card { border: 1px solid rgba(255,255,255,0.06); background: rgba(7,13,18,0.8); padding: 24px; text-decoration: none; display: block; transition: border-color 0.2s, background 0.2s; position: relative; overflow: hidden; }
        .country-card:hover { border-color: rgba(30,158,255,0.2); background: rgba(10,20,30,0.9); }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .card-flag { font-size: 28px; line-height: 1; }
        .card-name { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #fff; letter-spacing: 1px; margin-top: 2px; }
        .card-region { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #3d5870; letter-spacing: 1px; margin-top: 4px; }
        .threat-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 10px; border: 1px solid; flex-shrink: 0; }
        .card-summary { font-family: 'Barlow', sans-serif; font-size: 13px; color: #7a9bb5; line-height: 1.6; margin-bottom: 14px; }
        .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .card-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; padding: 2px 8px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.1); color: #5a7a94; }
        .card-badges { display: flex; gap: 6px; margin-bottom: 10px; }
        .mini-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; padding: 2px 7px; border: 1px solid; text-transform: uppercase; }

        footer { border-top: 1px solid rgba(30,158,255,0.1); padding: 40px; text-align: center; }
        .footer-text { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }

        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .page-wrap { padding: 90px 20px 80px; }
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <nav>
        <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
        <ul className="nav-links">
          <li><a href="/articles">All Reports</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/brief" style={{ color: '#ffaa00' }}>Aladdin Brief</a></li>
        </ul>
        <div className="hamburger" onClick={() => setMobileOpen(o => !o)}><span /><span /><span /></div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>✕ Close</button>
        <a href="/">Home</a><a href="/articles">All Reports</a><a href="/osint">OSINT Hub</a>
      </div>

      <div className="page-wrap">
        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <div className="hero-eyebrow-text">Intelligence // Country Profiles</div>
          </div>
          <div className="hero-title">COUNTRY <span>INTEL</span></div>
          <div className="hero-desc">Threat assessments, active conflicts, cyber risk ratings, and key concerns for {COUNTRIES.length} countries. Click any profile for the full brief.</div>
        </div>

        <div className="legend">
          {LEVELS.map(l => (
            <div key={l} className="legend-item">
              <div className="legend-dot" style={{ background: LEVEL_COLORS[l] }} />
              <span style={{ color: LEVEL_COLORS[l] }}>{l}</span>
            </div>
          ))}
        </div>

        <div className="controls">
          <input className="search-input" placeholder="Search countries..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-row">
            <button className={`filter-btn${filter === 'All' ? ' active' : ''}`} onClick={() => setFilter('All')}>All</button>
            {LEVELS.map(l => (
              <button
                key={l}
                className={`filter-btn${filter === l ? ' active' : ''}`}
                style={filter === l ? { background: LEVEL_COLORS[l], borderColor: LEVEL_COLORS[l] } : { color: LEVEL_COLORS[l], borderColor: `${LEVEL_COLORS[l]}40` }}
                onClick={() => setFilter(l)}
              >{l}</button>
            ))}
            {REGIONS.map(r => (
              <button key={r} className={`filter-btn${filter === r ? ' active' : ''}`} onClick={() => setFilter(r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="results-meta">{filtered.length} profiles</div>

        <div className="grid">
          {filtered.map(c => {
            const color = LEVEL_COLORS[c.threat_level];
            return (
              <a key={c.slug} href={`/intel/${c.slug}`} className="country-card">
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${color}, transparent)`, opacity: 0.5 }} />
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
                  <div className="mini-badge" style={{ color: LEVEL_COLORS[c.cyber_threat] ?? '#7a9bb5', borderColor: `${LEVEL_COLORS[c.cyber_threat] ?? '#7a9bb5'}40` }}>
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
      </div>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
