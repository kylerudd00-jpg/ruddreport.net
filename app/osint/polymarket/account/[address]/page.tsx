"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Bundle = {
  address: string;
  profile?: any;
  value?: any;
  traded?: any;
  positions?: any[];
  closedPositions?: any[];
  trades?: any[];
  activity?: any[];
  error?: string;
};

const shortAddr = (a: string) => a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;

function pickValue(value: any): number | null {
  if (Array.isArray(value) && value[0] && typeof value[0].value !== "undefined") {
    const n = Number(value[0].value);
    return Number.isFinite(n) ? n : null;
  }
  if (value && typeof value.value !== "undefined") {
    const n = Number(value.value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function fmtMoney(x: number | null | undefined): string {
  if (typeof x !== "number" || !Number.isFinite(x)) return "—";
  const abs = Math.abs(x);
  if (abs >= 1_000_000) return `$${(x / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(x / 1_000).toFixed(1)}K`;
  return `$${Math.round(x).toLocaleString()}`;
}

function fmtPct(x: any): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function fmtDate(x: any): string {
  if (!x) return "—";
  try {
    return new Date(x).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return "—"; }
}

export default function AccountPage() {
  const params = useParams<{ address: string }>();
  const address = String(params?.address || "").trim();

  const [data, setData] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"positions" | "trades" | "activity">("positions");

  async function load() {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetch(
        `/api/osint/polymarket/account?address=${encodeURIComponent(address)}&positionsLimit=250&closedLimit=250&tradesLimit=400&activityLimit=400`,
        { cache: "no-store" }
      );
      const text = await r.text();
      const json = JSON.parse(text);
      setData(r.ok ? json : { address, error: json?.error || `HTTP ${r.status}` });
    } catch (e: any) {
      setData({ address, error: e?.message || "Failed to load" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [address]);

  const name = data?.profile?.name || data?.profile?.pseudonym || shortAddr(address);
  const totalValue = pickValue(data?.value);

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
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .page-wrap { padding-top: 70px; min-height: 100vh; background: #030608; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); display: flex; align-items: center; justify-content: space-between; }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .sync-status { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
        .sync-status.live { color: #00ff88; }
        .sync-status.syncing { color: #1e9eff; animation: blink 1s infinite; }

        .profile-hero { padding: 48px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .profile-hero-inner { max-width: 1100px; margin: 0 auto; }
        .profile-eyebrow { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 12px; }
        .profile-name { font-family: 'Orbitron', monospace; font-size: clamp(24px, 3vw, 42px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .profile-addr { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #3d5870; letter-spacing: 2px; margin-bottom: 24px; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; margin-bottom: 0; }
        .stat-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px 24px; }
        .stat-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 10px; }
        .stat-value { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: #d8e8f5; letter-spacing: 1px; }
        .stat-value.green { color: #00ff88; }
        .stat-value.blue { color: #1e9eff; }

        .error-bar { max-width: 1100px; margin: 24px auto; padding: 16px 24px; background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.2); font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #ff6060; letter-spacing: 2px; }

        .content-wrap { max-width: 1100px; margin: 0 auto; padding: 32px 40px 80px; }

        .tabs { display: flex; gap: 2px; margin-bottom: 24px; }
        .tab-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 10px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .tab-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .tab-btn.active { color: #00ff88; border-color: rgba(0,255,136,0.5); background: rgba(0,255,136,0.06); }

        .table-wrap { border: 1px solid rgba(30,158,255,0.1); overflow: hidden; }
        .table-header { display: grid; padding: 12px 16px; background: rgba(10,21,32,0.8); border-bottom: 1px solid rgba(30,158,255,0.1); }
        .table-header span { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .table-row { display: grid; padding: 14px 16px; border-bottom: 1px solid rgba(30,158,255,0.06); background: #0a1520; transition: background 0.2s; }
        .table-row:hover { background: #0f1e2e; }
        .table-row:last-child { border-bottom: none; }
        .cell-main { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; color: #c0cfe0; line-height: 1.3; }
        .cell-sub { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; margin-top: 4px; letter-spacing: 1px; }
        .cell-value { font-family: 'Orbitron', monospace; font-size: 14px; color: #d8e8f5; text-align: right; }
        .cell-value.green { color: #00ff88; }
        .cell-value.blue { color: #1e9eff; }
        .cell-value.red { color: #ff6060; }

        .positions-grid { grid-template-columns: 1fr 80px 100px 100px; }
        .trades-grid { grid-template-columns: 1fr 80px 100px 100px; }
        .activity-grid { grid-template-columns: 1fr 120px 100px; }

        .empty-state { padding: 48px; text-align: center; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; background: #0a1520; border: 1px solid rgba(30,158,255,0.08); }

        .loading-pulse { animation: blink 1s infinite; }

        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .profile-hero, .content-wrap { padding-left: 20px; padding-right: 20px; }
          .back-bar { padding: 12px 20px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .positions-grid, .trades-grid { grid-template-columns: 1fr 80px 90px; }
          .activity-grid { grid-template-columns: 1fr 90px; }
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
          <div className="hamburger" onClick={() => document.getElementById('acctDetailMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="acctDetailMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('acctDetailMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/osint/polymarket">Polymarket</a>
          <a href="/osint/polymarket/account">Account Tracker</a>
        </div>

        <div className="back-bar">
          <a href="/osint/polymarket/account" className="back-link">← Back to Account Tracker</a>
          <div className={`sync-status ${loading ? 'syncing' : 'live'}`}>
            {loading ? '// Syncing...' : '// Live'}
          </div>
        </div>

        <div className="profile-hero">
          <div className="profile-hero-inner">
            <div className="profile-eyebrow">// Polymarket — Wallet Intelligence</div>
            <div className="profile-name">{loading && !data ? '// Loading...' : name}</div>
            <div className="profile-addr">{address}</div>

            {data && !data.error && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Portfolio Value</div>
                  <div className="stat-value green">{fmtMoney(totalValue)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Markets Traded</div>
                  <div className="stat-value blue">{data?.traded?.traded ?? '—'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Open Positions</div>
                  <div className="stat-value">{data?.positions?.length ?? '—'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Recent Trades</div>
                  <div className="stat-value">{data?.trades?.length ?? '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {data?.error && (
          <div style={{ padding: '0 40px' }}>
            <div className="error-bar">// Error: {data.error}</div>
          </div>
        )}

        {data && !data.error && (
          <div className="content-wrap">
            <div className="tabs">
              {(['positions', 'trades', 'activity'] as const).map((t) => (
                <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'positions' ? `Open Positions (${data.positions?.length ?? 0})` :
                   t === 'trades' ? `Trades (${data.trades?.length ?? 0})` :
                   `Activity (${data.activity?.length ?? 0})`}
                </button>
              ))}
            </div>

            {tab === 'positions' && (
              <>
                {(data.positions?.length ?? 0) === 0 ? (
                  <div className="empty-state">// No open positions found</div>
                ) : (
                  <div className="table-wrap">
                    <div className="table-header positions-grid">
                      <span>Market</span>
                      <span>Side</span>
                      <span style={{ textAlign: 'right' }}>Size</span>
                      <span style={{ textAlign: 'right' }}>Current %</span>
                    </div>
                    {(data.positions ?? []).slice(0, 100).map((p: any, i: number) => (
                      <div key={i} className="table-row positions-grid">
                        <div>
                          <div className="cell-main">{p.title || p.market || p.question || '—'}</div>
                          <div className="cell-sub">{fmtDate(p.startDate || p.createdAt)}</div>
                        </div>
                        <div className="cell-value" style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: p.outcome?.toLowerCase() === 'yes' ? '#00ff88' : '#ff6060' }}>
                            {p.outcome || '—'}
                          </span>
                        </div>
                        <div className="cell-value">{fmtMoney(p.size || p.currentValue)}</div>
                        <div className="cell-value green">{fmtPct(p.currentPrice || p.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'trades' && (
              <>
                {(data.trades?.length ?? 0) === 0 ? (
                  <div className="empty-state">// No recent trades found</div>
                ) : (
                  <div className="table-wrap">
                    <div className="table-header trades-grid">
                      <span>Market</span>
                      <span>Side</span>
                      <span style={{ textAlign: 'right' }}>Size</span>
                      <span style={{ textAlign: 'right' }}>Price</span>
                    </div>
                    {(data.trades ?? []).slice(0, 100).map((t: any, i: number) => (
                      <div key={i} className="table-row trades-grid">
                        <div>
                          <div className="cell-main">{t.title || t.market || t.question || '—'}</div>
                          <div className="cell-sub">{fmtDate(t.timestamp || t.createdAt)}</div>
                        </div>
                        <div className="cell-value" style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: t.side?.toLowerCase() === 'buy' ? '#00ff88' : '#ff6060' }}>
                            {t.side || t.type || '—'}
                          </span>
                        </div>
                        <div className="cell-value">{fmtMoney(t.size || t.usdcSize)}</div>
                        <div className="cell-value blue">{fmtPct(t.price)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'activity' && (
              <>
                {(data.activity?.length ?? 0) === 0 ? (
                  <div className="empty-state">// No recent activity found</div>
                ) : (
                  <div className="table-wrap">
                    <div className="table-header activity-grid">
                      <span>Event</span>
                      <span>Type</span>
                      <span style={{ textAlign: 'right' }}>Amount</span>
                    </div>
                    {(data.activity ?? []).slice(0, 100).map((a: any, i: number) => (
                      <div key={i} className="table-row activity-grid">
                        <div>
                          <div className="cell-main">{a.title || a.market || a.question || '—'}</div>
                          <div className="cell-sub">{fmtDate(a.timestamp || a.createdAt)}</div>
                        </div>
                        <div className="cell-value" style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#1e9eff' }}>{a.type || '—'}</span>
                        </div>
                        <div className="cell-value">{fmtMoney(a.amount || a.usdcSize)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

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