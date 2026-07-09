'use client';
import { COUNTRIES, THREAT_ORDER, type ThreatLevel } from '@/lib/countries';
import { ARTICLES } from '@/lib/articles';
import { notFound } from 'next/navigation';

const LEVEL_COLORS: Record<ThreatLevel, string> = {
  CRITICAL: '#ff3a3a',
  HIGH: '#ff8800',
  MEDIUM: '#ffaa00',
  LOW: '#00cc66',
};

export default function CountryPage({ params }: { params: { country: string } }) {
  const c = COUNTRIES.find(x => x.slug === params.country);
  if (!c) return notFound();

  const color = LEVEL_COLORS[c.threat_level];
  const cyberColor = LEVEL_COLORS[c.cyber_threat as ThreatLevel] ?? '#7a9bb5';

  // Find related articles by matching country name in title/content
  const related = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(c.name.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(c.name.toLowerCase()) ||
    (c.apt_groups.some(g => a.title.toLowerCase().includes(g.split(' ')[0].toLowerCase())))
  ).slice(0, 4);

  // Adjacent countries by threat level for nav
  const peers = COUNTRIES
    .filter(x => x.slug !== c.slug && x.threat_level === c.threat_level)
    .slice(0, 4);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding: 110px 40px 100px; max-width: 960px; margin: 0 auto; }
        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-secondary); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .back-sep { color: var(--text-muted); }

        .profile-header { border: 1px solid; padding: 40px; margin-bottom: 2px; position: relative; overflow: hidden; }
        .header-bg-flag { position: absolute; right: 24px; top: 50%; transform: translateY(-50%); font-size: 140px; opacity: 0.06; pointer-events: none; }
        .header-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .header-flag { font-size: 56px; line-height: 1; margin-bottom: 12px; }
        .header-name { font-family: var(--font-display); font-size: clamp(24px, 5vw, 44px); font-weight: 900; color: #fff; letter-spacing: -0.02em; }
        .header-region { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }
        .threat-badge-lg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 16px; border: 1px solid; display: inline-flex; align-items: center; gap: 8px; margin-top: 8px; }
        .threat-dot { width: 8px; height: 8px; border-radius: 50%; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .header-meta { display: flex; gap: 32px; margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--border); flex-wrap: wrap; }
        .meta-item { display: flex; flex-direction: column; gap: 6px; }
        .meta-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
        .meta-val { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); }
        .badge-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
        .mini-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; padding: 4px 10px; border: 1px solid; text-transform: uppercase; }

        .section { border: 1px solid var(--border); background: var(--bg-secondary); margin-bottom: 2px; overflow: hidden; }
        .section-header { padding: 16px 24px; border-bottom: 1px solid var(--border); }
        .section-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); }
        .section-body { padding: 24px; }

        .summary-text { font-family: var(--font-display); font-size: 16px; color: var(--text-primary); line-height: 1.8; }
        .concerns-list { display: flex; flex-direction: column; gap: 10px; }
        .concern-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .concern-item:last-child { border-bottom: none; }
        .concern-bullet { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        .concern-text { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); line-height: 1.5; }

        .conflict-list { display: flex; flex-direction: column; gap: 8px; }
        .conflict-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: rgba(255,68,68,0.04); border: 1px solid rgba(255,68,68,0.1); }
        .conflict-icon { color: var(--red); font-size: 14px; flex-shrink: 0; }
        .conflict-text { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); }

        .apt-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .apt-tag { font-family: var(--font-mono); font-size: 12px; padding: 8px 14px; background: rgba(255,68,68,0.06); border: 1px solid rgba(255,68,68,0.2); color: var(--red); text-decoration: none; transition: all 0.2s; }
        .apt-tag:hover { background: rgba(255,68,68,0.12); border-color: rgba(255,68,68,0.4); }

        .cyber-meter { display: flex; align-items: center; gap: 16px; }
        .cyber-level { font-family: var(--font-display); font-size: 24px; font-weight: 900; }
        .cyber-desc { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); line-height: 1.5; }

        .article-card { display: block; padding: 16px 0; border-bottom: 1px solid var(--border); text-decoration: none; transition: opacity 0.2s; }
        .article-card:hover { opacity: 0.8; }
        .article-card:last-child { border-bottom: none; }
        .article-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px; }
        .article-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }

        .peers-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .peer-link { font-family: var(--font-mono); font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 16px; border: 1px solid var(--border-bright); color: var(--text-secondary); text-decoration: none; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .peer-link:hover { border-color: rgba(255,255,255,0.6); color: var(--text-primary); }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 90px 20px 80px; }
          .profile-header { padding: 24px; }
          .section-body { padding: 16px; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/intel" className="back-link">← Country Intel</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em', color, textTransform: 'uppercase' }}>{c.name}</span>
        </div>

        {/* Header */}
        <div className="profile-header" style={{ borderColor: `${color}30`, background: `${color}04` }}>
          <div className="header-bg-flag" aria-hidden="true">{c.flag}</div>
          <div className="header-top">
            <div>
              <div className="header-flag">{c.flag}</div>
              <h1 className="header-name">{c.name}</h1>
              <div className="header-region">{c.region} · {c.capital}</div>
              <div className="threat-badge-lg" style={{ color, borderColor: `${color}50`, background: `${color}10`, marginTop: 12 }}>
                <div className="threat-dot" style={{ background: color }} aria-hidden="true" />
                THREAT: {c.threat_level}
              </div>
            </div>
          </div>
          <div className="header-meta">
            <div className="meta-item">
              <div className="meta-label">Government</div>
              <div className="meta-val" style={{ fontSize: 12 }}>{c.government}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Population</div>
              <div className="meta-val">{c.population}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Cyber Threat</div>
              <div className="meta-val" style={{ color: cyberColor }}>{c.cyber_threat}</div>
            </div>
          </div>
          <div className="badge-row">
            {c.nato && <div className="mini-badge" style={{ color: '#1e9eff', borderColor: 'rgba(30,158,255,0.3)' }}>NATO Member</div>}
            {c.us_sanctioned && <div className="mini-badge" style={{ color: '#ff8800', borderColor: 'rgba(255,136,0,0.3)' }}>OFAC Sanctioned</div>}
            {c.active_conflicts.length === 0 && <div className="mini-badge" style={{ color: '#00cc66', borderColor: 'rgba(0,204,102,0.3)' }}>No Active Conflicts</div>}
          </div>
        </div>

        {/* Summary */}
        <div className="section">
          <div className="section-header"><h2 className="section-title">Assessment</h2></div>
          <div className="section-body"><div className="summary-text">{c.summary}</div></div>
        </div>

        {/* Key Concerns */}
        <div className="section">
          <div className="section-header"><h2 className="section-title">Key Concerns</h2></div>
          <div className="section-body">
            <div className="concerns-list">
              {c.key_concerns.map((concern, i) => (
                <div key={i} className="concern-item">
                  <div className="concern-bullet" style={{ background: color }} aria-hidden="true" />
                  <div className="concern-text">{concern}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Conflicts */}
        {c.active_conflicts.length > 0 && (
          <div className="section">
            <div className="section-header"><h2 className="section-title">Active Conflicts & Situations</h2></div>
            <div className="section-body">
              <div className="conflict-list">
                {c.active_conflicts.map((conflict, i) => (
                  <div key={i} className="conflict-item">
                    <div className="conflict-icon" aria-hidden="true">▲</div>
                    <div className="conflict-text">{conflict}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cyber Threat */}
        <div className="section">
          <div className="section-header"><h2 className="section-title">Cyber Threat Profile</h2></div>
          <div className="section-body">
            <div className="cyber-meter" style={{ marginBottom: c.apt_groups.length ? 20 : 0 }}>
              <div className="cyber-level" style={{ color: cyberColor }}>{c.cyber_threat}</div>
              <div className="cyber-desc">
                {c.cyber_threat === 'CRITICAL' && 'Nation-state actors conducting mass espionage, critical infrastructure attacks, and destructive operations against Western targets.'}
                {c.cyber_threat === 'HIGH' && 'Significant nation-state cyber capability targeting government, defense, and economic sectors.'}
                {c.cyber_threat === 'MEDIUM' && 'Moderate cyber threat activity — state-affiliated groups targeting regional adversaries and periodic opportunistic attacks.'}
                {c.cyber_threat === 'LOW' && 'Low offensive cyber threat. May be a target of foreign operations rather than a significant originator.'}
                {c.cyber_threat === 'UNKNOWN' && 'Cyber threat level is not well-assessed due to limited visibility.'}
              </div>
            </div>
            {c.apt_groups.length > 0 && (
              <>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Attributed Threat Actors
                </div>
                <div className="apt-grid">
                  {c.apt_groups.map(g => (
                    <a key={g} className="apt-tag" href="/osint/threat-actors">{g}</a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="section">
            <div className="section-header"><h2 className="section-title">Related Coverage</h2></div>
            <div className="section-body">
              {related.map(a => (
                <a key={a.slug} className="article-card" href={`/articles/${a.slug}`}>
                  <div className="article-cat" style={{ color: a.relevance === 'HIGH' ? '#ff3a3a' : a.relevance === 'MED' ? '#ffaa00' : '#1e9eff' }}>
                    {a.category} · {a.date}
                  </div>
                  <div className="article-title">{a.title}</div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Similar profiles */}
        {peers.length > 0 && (
          <div className="section">
            <div className="section-header"><h2 className="section-title">Similar Threat Level</h2></div>
            <div className="section-body">
              <div className="peers-grid">
                {peers.map(p => (
                  <a key={p.slug} className="peer-link" href={`/intel/${p.slug}`}>
                    <span>{p.flag}</span>
                    <span>{p.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
