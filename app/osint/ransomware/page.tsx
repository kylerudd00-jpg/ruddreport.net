'use client';
import { useEffect, useState, useMemo } from 'react';

interface RansomPost {
  post_title: string;
  group_name: string;
  discovered: string;
  description: string | null;
  website: string;
}

interface RansomData {
  posts: RansomPost[];
  groupStats: Record<string, number>;
  total: number;
  fetched: string | null;
  error?: string;
}

const GROUP_COLORS: Record<string, string> = {
  lockbit: '#ff4444', lockbit3: '#ff4444', 'lockbit 3.0': '#ff4444',
  'cl0p': '#ff8800', clop: '#ff8800',
  alphv: '#b464ff', blackcat: '#b464ff',
  akira: '#00cc66',
  play: '#1e9eff',
  'black basta': '#ffaa00',
  conti: '#ff4444',
  revil: '#ff6060',
  darkside: '#ff6060',
  'hunters international': '#00c9b0',
  ransomhub: '#ff4444',
  medusa: '#b464ff',
  '8base': '#ffaa00',
  bianlian: '#1e9eff',
  rhysida: '#ff8800',
};

function groupColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(GROUP_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#7a9bb5';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function RansomwarePage() {
  const [data, setData] = useState<RansomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [groupFilter, setGroupFilter] = useState('All');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ransomware?t=${Date.now()}`);
      setData(await res.json());
    } catch {
      setData({ posts: [], groupStats: {}, total: 0, fetched: null, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const topGroups = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.groupStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.posts.filter(p => {
      if (groupFilter !== 'All' && p.group_name !== groupFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.post_title?.toLowerCase().includes(q) || p.group_name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, groupFilter, search]);

  const last24h = data?.posts.filter(p => Date.now() - new Date(p.discovered).getTime() < 86400000).length ?? 0;
  const last7d = data?.posts.filter(p => Date.now() - new Date(p.discovered).getTime() < 604800000).length ?? 0;

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
        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; color: #7a9bb5; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #1e9eff; }
        .back-sep { color: #3d5870; }

        .hero { margin-bottom: 40px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: #ff4444; }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; color: #ff4444; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 5vw, 52px); font-weight: 900; color: #fff; letter-spacing: 2px; }
        .hero-title span { color: #ff4444; }
        .hero-desc { font-family: 'Barlow', sans-serif; font-size: 16px; color: #7a9bb5; line-height: 1.6; margin-top: 16px; max-width: 640px; }

        .stats-row { display: flex; gap: 2px; margin-bottom: 32px; }
        .stat-box { flex: 1; border: 1px solid rgba(255,68,68,0.15); background: rgba(255,68,68,0.04); padding: 20px 24px; }
        .stat-num { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: #ff4444; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-top: 4px; }

        .layout { display: grid; grid-template-columns: 240px 1fr; gap: 2px; }
        .sidebar { display: flex; flex-direction: column; gap: 2px; }
        .sidebar-box { border: 1px solid rgba(255,255,255,0.06); background: rgba(7,13,18,0.8); padding: 20px; }
        .sidebar-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .group-btn { display: flex; align-items: center; justify-content: space-between; width: 100%; background: none; border: none; cursor: pointer; padding: 8px 10px; text-align: left; transition: background 0.15s; }
        .group-btn:hover { background: rgba(255,255,255,0.03); }
        .group-btn.active { background: rgba(255,68,68,0.08); }
        .group-btn-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #c0cfe0; }
        .group-btn.active .group-btn-name { color: #ff4444; }
        .group-btn-count { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #3d5870; }

        .main-panel { display: flex; flex-direction: column; gap: 2px; }
        .controls { display: flex; gap: 8px; margin-bottom: 0; }
        .search-input { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; font-family: 'Barlow', sans-serif; font-size: 14px; color: #c0cfe0; outline: none; transition: border-color 0.2s; }
        .search-input::placeholder { color: #3d5870; }
        .search-input:focus { border-color: rgba(255,68,68,0.4); }
        .refresh-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 12px 20px; border: 1px solid rgba(255,68,68,0.3); background: transparent; color: #ff4444; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .refresh-btn:hover { background: rgba(255,68,68,0.08); }

        .results-meta { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; padding: 10px 0; }

        .post-card { border: 1px solid rgba(255,255,255,0.05); background: rgba(7,13,18,0.8); padding: 20px 24px; position: relative; overflow: hidden; transition: border-color 0.2s; }
        .post-card:hover { border-color: rgba(255,68,68,0.2); }
        .post-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; }
        .post-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
        .post-title { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; color: #fff; line-height: 1.3; }
        .post-meta { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .group-badge { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid; }
        .post-time { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #3d5870; }
        .post-desc { font-family: 'Barlow', sans-serif; font-size: 13px; color: #7a9bb5; line-height: 1.5; margin-top: 8px; }
        .post-link { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #3d5870; text-decoration: none; margin-top: 8px; display: inline-block; text-transform: uppercase; }
        .post-link:hover { color: #5a7a94; }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; }
        .loading-orb { width: 36px; height: 36px; border: 2px solid rgba(255,68,68,0.1); border-top-color: #ff4444; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }

        footer { border-top: 1px solid rgba(30,158,255,0.1); padding: 40px; text-align: center; }
        .footer-text { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }

        @media (max-width: 900px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .page-wrap { padding: 90px 20px 80px; }
          .layout { grid-template-columns: 1fr; }
          .stats-row { flex-wrap: wrap; }
          .stat-box { flex: 1 1 40%; }
        }
      `}</style>

      <nav>
        <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
        <ul className="nav-links">
          <li><a href="/articles">All Reports</a></li>
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/brief" style={{ color: '#ffaa00' }}>Aladdin Brief</a></li>
        </ul>
        <div className="hamburger" onClick={() => setMobileOpen(o => !o)}><span /><span /><span /></div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>✕ Close</button>
        <a href="/">Home</a><a href="/articles">All Reports</a><a href="/osint">OSINT Hub</a><a href="/brief">Aladdin Brief</a>
      </div>

      <div className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: 2, color: '#ff4444', textTransform: 'uppercase' }}>Ransomware Tracker</span>
        </div>

        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <div className="hero-eyebrow-text">Live // Ransomware Intelligence</div>
          </div>
          <div className="hero-title">RANSOMWARE<span>.</span></div>
          <div className="hero-desc">Live victim feed from active ransomware group leak sites. Data sourced from ransomwatch — updated continuously.</div>
        </div>

        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num">{data?.total ?? '—'}</div>
            <div className="stat-label">Total Known Victims</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{last24h}</div>
            <div className="stat-label">Last 24 Hours</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{last7d}</div>
            <div className="stat-label">Last 7 Days</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{topGroups.length}</div>
            <div className="stat-label">Active Groups</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="loading-orb" />
            <div className="loading-text">Pulling live feed...</div>
          </div>
        ) : (
          <div className="layout">
            <div className="sidebar">
              <div className="sidebar-box">
                <div className="sidebar-label">Filter by Group</div>
                <button
                  className={`group-btn${groupFilter === 'All' ? ' active' : ''}`}
                  onClick={() => setGroupFilter('All')}
                >
                  <span className="group-btn-name">All Groups</span>
                  <span className="group-btn-count">{data?.total}</span>
                </button>
                {topGroups.map(g => (
                  <button
                    key={g.name}
                    className={`group-btn${groupFilter === g.name ? ' active' : ''}`}
                    onClick={() => setGroupFilter(g.name)}
                  >
                    <span className="group-btn-name" style={{ color: groupColor(g.name) }}>{g.name}</span>
                    <span className="group-btn-count">{g.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="main-panel">
              <div className="controls">
                <input
                  className="search-input"
                  placeholder="Search victims, groups..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="refresh-btn" onClick={load}>↺ Refresh</button>
              </div>

              <div className="results-meta">{filtered.length} victims</div>

              {filtered.map((p, i) => {
                const color = groupColor(p.group_name);
                return (
                  <div className="post-card" key={i} style={{ borderLeftColor: `${color}50` } as React.CSSProperties}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${color}, transparent)`, opacity: 0.6 }} />
                    <div className="post-header">
                      <div className="post-title">{p.post_title || 'Unknown Victim'}</div>
                      <div className="post-meta">
                        <div className="group-badge" style={{ color, borderColor: `${color}50`, background: `${color}12` }}>
                          {p.group_name}
                        </div>
                        <div className="post-time">{timeAgo(p.discovered)}</div>
                      </div>
                    </div>
                    {p.description && (
                      <div className="post-desc">{p.description.slice(0, 200)}{p.description.length > 200 ? '...' : ''}</div>
                    )}
                    {p.website && (
                      <div className="post-link">via {new URL(p.website).hostname}</div>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 13, color: '#3d5870', letterSpacing: 3 }}>NO RESULTS</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
