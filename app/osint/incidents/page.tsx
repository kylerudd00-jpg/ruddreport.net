'use client';
import { useState, useMemo } from 'react';
import { INCIDENTS, INCIDENT_TYPES, IMPACT_COLORS, NATION_COLORS, type IncidentType, type ImpactLevel } from '@/lib/incidents';

const ALL_NATIONS = [...new Set(INCIDENTS.map(i => i.nation))].sort();
const ALL_YEARS = [...new Set(INCIDENTS.map(i => i.year))].sort((a, b) => b - a);

export default function IncidentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<IncidentType | 'All'>('All');
  const [nationFilter, setNationFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState<ImpactLevel | 'All'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return INCIDENTS.filter(i => {
      if (typeFilter !== 'All' && i.type !== typeFilter) return false;
      if (nationFilter !== 'All' && i.nation !== nationFilter) return false;
      if (impactFilter !== 'All' && i.impact !== impactFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          i.name.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.actors.some(a => a.toLowerCase().includes(q)) ||
          i.targets.some(t => t.toLowerCase().includes(q)) ||
          i.tags.some(t => t.toLowerCase().includes(q)) ||
          i.nation.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => b.year - a.year || b.date.localeCompare(a.date));
  }, [search, typeFilter, nationFilter, impactFilter]);

  const stats = useMemo(() => {
    const total = INCIDENTS.length;
    const critical = INCIDENTS.filter(i => i.impact === 'CRITICAL').length;
    const nationState = INCIDENTS.filter(i => !['Criminal', 'Unknown'].includes(i.nation)).length;
    const ransomware = INCIDENTS.filter(i => i.type === 'ransomware').length;
    return { total, critical, nationState, ransomware };
  }, []);

  const typeInfo = Object.fromEntries(INCIDENT_TYPES.map(t => [t.value, t]));

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding: 110px 40px 100px; max-width: 1300px; margin: 0 auto; }

        .back-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #1e9eff; }

        .hero { margin-bottom: 40px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: var(--red); }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--red); text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(24px, 4vw, 48px); font-weight: 900; color: #fff; letter-spacing: 0.05em; }
        .hero-title span { color: var(--red); }
        .hero-desc { font-family: var(--font-display); font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin-top: 12px; max-width: 680px; }

        .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 40px; }
        .stat-box { background: var(--bg-secondary); border: 1px solid var(--border); padding: 20px 24px; }
        .stat-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .stat-value { font-family: var(--font-display); font-size: 28px; font-weight: 900; color: var(--text-primary); }
        .stat-value.red { color: var(--red); }
        .stat-value.orange { color: #ffaa00; }
        .stat-value.blue { color: #1e9eff; }

        .controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .search-wrap { position: relative; }
        .search-input { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid var(--border-bright); padding: 12px 18px; font-family: var(--font-display); font-size: 14px; color: var(--text-primary); transition: border-color 0.2s; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: var(--accent); }
        .filter-section { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .filter-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-right: 4px; white-space: nowrap; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 5px 12px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: var(--border-bright); color: var(--text-primary); }
        .filter-btn.active-type { font-weight: 700; }
        .filter-btn.active-impact { font-weight: 700; }
        .filter-btn.active-nation { background: rgba(30,158,255,0.15); border-color: rgba(30,158,255,0.4); color: #1e9eff; font-weight: 700; }

        .results-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }

        .timeline { display: flex; flex-direction: column; gap: 2px; }
        .year-group { margin-bottom: 8px; }
        .year-header { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); padding: 8px 0; border-bottom: 1px solid var(--border); margin-bottom: 2px; }

        .incident-card { border: 1px solid var(--border); background: var(--bg-secondary); position: relative; overflow: hidden; transition: border-color 0.2s; }
        .incident-card:hover { border-color: var(--border-bright); }
        .incident-card.expanded-card { border-color: var(--border-bright); }
        .card-left-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
        .card-header { padding: 18px 20px 18px 24px; cursor: pointer; display: flex; align-items: flex-start; gap: 16px; }
        .card-header:hover .card-name { color: var(--text-primary); }
        .card-main { flex: 1; min-width: 0; }
        .card-meta-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
        .card-date { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; }
        .card-type-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 8px; border: 1px solid; }
        .card-nation-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 8px; border: 1px solid; }
        .card-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; transition: color 0.2s; margin-bottom: 6px; }
        .card-summary { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); line-height: 1.55; }
        .card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .impact-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 10px; border: 1px solid; }
        .expand-arrow { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); transition: color 0.2s; }
        .card-header:hover .expand-arrow { color: var(--text-secondary); }

        .card-body { padding: 0 24px 20px; display: none; }
        .card-body.open { display: block; }
        .detail-text { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); line-height: 1.7; margin-bottom: 16px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .detail-section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
        .detail-list { display: flex; flex-direction: column; gap: 3px; }
        .detail-item { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); }
        .detail-item::before { content: '→ '; color: var(--text-muted); }
        .damage-box { background: rgba(255,58,58,0.05); border: 1px solid rgba(255,58,58,0.15); padding: 10px 14px; margin-bottom: 16px; }
        .damage-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); text-transform: uppercase; margin-bottom: 4px; }
        .damage-value { font-family: var(--font-display); font-size: 13px; color: #ffa0a0; }
        .tags-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 8px; background: rgba(30,158,255,0.05); border: 1px solid var(--border); color: var(--text-muted); }
        .actor-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .actor-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 10px; background: rgba(30,158,255,0.08); border: 1px solid var(--border); color: #1e9eff; text-decoration: none; transition: background 0.2s; }
        .actor-link:hover { background: rgba(30,158,255,0.15); }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 90px 20px 80px; }
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .detail-grid { grid-template-columns: 1fr; }
          .card-right { display: none; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" aria-hidden="true" />
            <div className="hero-eyebrow-text">Cyber // Incident Database</div>
          </div>
          <h1 className="hero-title">CYBER <span>INCIDENT</span> DATABASE</h1>
          <div className="hero-desc">
            A curated record of major cyberattacks, state-sponsored operations, and critical infrastructure breaches — from Stuxnet to Salt Typhoon. Searchable by type, nation, and impact.
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-box">
            <div className="stat-label">Total Incidents</div>
            <div className="stat-value blue">{stats.total}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Critical Impact</div>
            <div className="stat-value red">{stats.critical}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Nation-State</div>
            <div className="stat-value orange">{stats.nationState}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Ransomware</div>
            <div className="stat-value" style={{ color: '#ff8800' }}>{stats.ransomware}</div>
          </div>
        </div>

        <div className="controls">
          <input
            className="search-input"
            aria-label="Search incidents by name, actor, target, tag, or nation"
            placeholder="Search by name, actor, target, tag, or nation..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="filter-section">
            <span className="filter-label">Type:</span>
            <button
              type="button"
              className={`filter-btn${typeFilter === 'All' ? ' active-type' : ''}`}
              style={typeFilter === 'All' ? { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' } : {}}
              onClick={() => setTypeFilter('All')}
            >All</button>
            {INCIDENT_TYPES.map(t => (
              <button
                type="button"
                key={t.value}
                className={`filter-btn${typeFilter === t.value ? ' active-type' : ''}`}
                style={typeFilter === t.value
                  ? { background: `${t.color}20`, borderColor: `${t.color}60`, color: t.color }
                  : { color: t.color, borderColor: `${t.color}30` }}
                onClick={() => setTypeFilter(prev => prev === t.value ? 'All' : t.value)}
              >{t.label}</button>
            ))}
          </div>

          <div className="filter-section">
            <span className="filter-label">Impact:</span>
            {(['All', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(imp => (
              <button
                type="button"
                key={imp}
                className={`filter-btn${impactFilter === imp ? ' active-impact' : ''}`}
                style={imp !== 'All' && impactFilter === imp
                  ? { background: `${IMPACT_COLORS[imp as ImpactLevel]}20`, borderColor: `${IMPACT_COLORS[imp as ImpactLevel]}60`, color: IMPACT_COLORS[imp as ImpactLevel] }
                  : imp !== 'All' ? { color: IMPACT_COLORS[imp as ImpactLevel], borderColor: `${IMPACT_COLORS[imp as ImpactLevel]}30` }
                  : impactFilter === 'All' ? { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' } : {}}
                onClick={() => setImpactFilter(prev => prev === imp ? 'All' : imp)}
              >{imp}</button>
            ))}
          </div>

          <div className="filter-section">
            <span className="filter-label">Nation:</span>
            <button
              type="button"
              className={`filter-btn${nationFilter === 'All' ? ' active-nation' : ''}`}
              onClick={() => setNationFilter('All')}
            >All</button>
            {ALL_NATIONS.map(n => {
              const color = NATION_COLORS[n] ?? '#7a9bb5';
              return (
                <button
                  type="button"
                  key={n}
                  className={`filter-btn${nationFilter === n ? ' active-nation' : ''}`}
                  style={nationFilter === n
                    ? { background: `${color}20`, borderColor: `${color}60`, color }
                    : { color, borderColor: `${color}30` }}
                  onClick={() => setNationFilter(prev => prev === n ? 'All' : n)}
                >{n}</button>
              );
            })}
          </div>
        </div>

        <div className="results-meta">{filtered.length} incident{filtered.length !== 1 ? 's' : ''} matched</div>

        <div className="timeline">
          {(() => {
            const byYear: Record<number, typeof filtered> = {};
            filtered.forEach(i => {
              if (!byYear[i.year]) byYear[i.year] = [];
              byYear[i.year].push(i);
            });
            return Object.entries(byYear)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([year, incidents]) => (
                <div key={year} className="year-group">
                  <div className="year-header">// {year}</div>
                  {incidents.map(incident => {
                    const typeColor = typeInfo[incident.type]?.color ?? '#7a9bb5';
                    const impactColor = IMPACT_COLORS[incident.impact];
                    const nationColor = NATION_COLORS[incident.nation] ?? '#7a9bb5';
                    const isExpanded = expanded === incident.id;
                    return (
                      <div key={incident.id} className={`incident-card${isExpanded ? ' expanded-card' : ''}`}>
                        <div className="card-left-bar" style={{ background: `linear-gradient(to bottom, ${typeColor}, transparent)` }} />
                        <div className="card-header" onClick={() => setExpanded(prev => prev === incident.id ? null : incident.id)}>
                          <div className="card-main">
                            <div className="card-meta-row">
                              <span className="card-date">{incident.date}</span>
                              <span className="card-type-badge" style={{ color: typeColor, borderColor: `${typeColor}40`, background: `${typeColor}10` }}>
                                {typeInfo[incident.type]?.label ?? incident.type}
                              </span>
                              <span className="card-nation-badge" style={{ color: nationColor, borderColor: `${nationColor}40`, background: `${nationColor}10` }}>
                                {incident.nation}
                              </span>
                            </div>
                            <div className="card-name">{incident.name}</div>
                            <div className="card-summary">{incident.summary}</div>
                          </div>
                          <div className="card-right">
                            <div className="impact-badge" style={{ color: impactColor, borderColor: `${impactColor}50`, background: `${impactColor}12` }}>
                              {incident.impact}
                            </div>
                            <div className="expand-arrow">{isExpanded ? '▲ CLOSE' : '▼ DETAIL'}</div>
                          </div>
                        </div>

                        <div className={`card-body${isExpanded ? ' open' : ''}`}>
                          <div className="detail-text">{incident.details}</div>

                          {incident.damage && (
                            <div className="damage-box">
                              <div className="damage-label">Estimated Damage / Impact</div>
                              <div className="damage-value">{incident.damage}</div>
                            </div>
                          )}

                          <div className="detail-grid">
                            <div>
                              <div className="detail-section-label">Threat Actors</div>
                              <div className="detail-list">
                                {incident.actors.map(a => <div key={a} className="detail-item">{a}</div>)}
                              </div>
                            </div>
                            <div>
                              <div className="detail-section-label">Primary Targets</div>
                              <div className="detail-list">
                                {incident.targets.map(t => <div key={t} className="detail-item">{t}</div>)}
                              </div>
                            </div>
                          </div>

                          <div className="tags-row">
                            {incident.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                          </div>

                          <div className="actor-links">
                            <a href="/osint/threat-actors" className="actor-link">→ Threat Actor Database</a>
                            <a href="/osint/ioc" className="actor-link">→ IoC Scanner</a>
                            <a href={`/osint/cve?q=${encodeURIComponent(incident.name)}`} className="actor-link">→ CVE Search</a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
          })()}
        </div>
      </main>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
