'use client';
import { useEffect, useState } from 'react';

interface BriefMessage {
  id: string;
  text: string;
  html: string;
  date: string;
  link: string;
}

interface BriefData {
  messages: BriefMessage[];
  channel: string;
  fetched: string | null;
  error?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) + 'Z';
}

function groupByDay(messages: BriefMessage[]): Map<string, BriefMessage[]> {
  const map = new Map<string, BriefMessage[]>();
  for (const msg of messages) {
    const day = msg.date.split('T')[0];
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(msg);
  }
  return map;
}

export default function BriefPage() {
  const [data, setData] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function fetchBrief() {
    setLoading(true);
    try {
      const res = await fetch('/api/brief');
      const json = await res.json();
      setData(json);
    } catch {
      setData({ messages: [], channel: 'AladdinOSINT', fetched: null, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBrief(); }, []);

  const todayISO = new Date().toISOString().split('T')[0];
  const todayMessages = data?.messages.filter(m => m.date.startsWith(todayISO)) ?? [];
  const olderMessages = data?.messages.filter(m => !m.date.startsWith(todayISO)) ?? [];
  const grouped = groupByDay(olderMessages);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .classify-banner { background: #ffaa00; color: #000; text-align: center; padding: 8px 20px; font-family: 'Share Tech Mono', monospace; font-size: 13px; font-weight: 700; letter-spacing: 3px; position: fixed; top: 70px; left: 0; right: 0; z-index: 90; }

        .page-wrap { padding: 170px 40px 100px; max-width: 900px; margin: 0 auto; }

        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; color: #7a9bb5; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #ffaa00; }
        .back-sep { color: #3d5870; }

        .doc-header { border: 1px solid rgba(255,170,0,0.25); background: rgba(255,170,0,0.03); padding: 40px; margin-bottom: 2px; position: relative; overflow: hidden; }
        .doc-header::before { content: 'MAGIC CARPET'; position: absolute; right: 30px; top: 50%; transform: translateY(-50%); font-family: 'Orbitron', monospace; font-size: 80px; font-weight: 900; color: rgba(255,170,0,0.04); letter-spacing: -2px; pointer-events: none; white-space: nowrap; }
        .doc-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .doc-eyebrow-line { width: 32px; height: 1px; background: #ffaa00; }
        .doc-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; color: #ffaa00; text-transform: uppercase; }
        .doc-title { font-family: 'Orbitron', monospace; font-size: clamp(32px, 6vw, 56px); font-weight: 900; color: #fff; letter-spacing: 2px; line-height: 1.0; }
        .doc-title span { color: #ffaa00; }
        .doc-subtitle { font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #7a9bb5; letter-spacing: 1px; margin-top: 12px; text-transform: uppercase; }
        .doc-meta { display: flex; gap: 32px; margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(255,170,0,0.12); flex-wrap: wrap; }
        .doc-meta-item { display: flex; flex-direction: column; gap: 6px; }
        .doc-meta-label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
        .doc-meta-val { font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #c0cfe0; }

        .doc-actions { display: flex; gap: 12px; padding: 18px 40px; background: rgba(255,170,0,0.04); border: 1px solid rgba(255,170,0,0.15); border-top: none; margin-bottom: 32px; flex-wrap: wrap; align-items: center; }
        .doc-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 10px 20px; border: 1px solid rgba(255,170,0,0.3); background: transparent; color: #ffaa00; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .doc-btn:hover { background: rgba(255,170,0,0.1); border-color: #ffaa00; }
        .doc-btn.primary { background: #ffaa00; color: #000; border-color: #ffaa00; }
        .doc-btn.primary:hover { background: #ffc300; }

        .today-label { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; color: #ffaa00; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .today-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,170,0,0.2); }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffaa00; display: inline-block; animation: pulse-dot 1.5s ease-in-out infinite; flex-shrink: 0; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }

        .message-block { border: 1px solid rgba(255,170,0,0.15); background: rgba(7,13,18,0.8); padding: 28px 32px; margin-bottom: 2px; position: relative; }
        .message-block::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #ffaa00, transparent); opacity: 0.4; }
        .message-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .message-time { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #5a7a94; letter-spacing: 1px; }
        .message-link { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; color: #ffaa00; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .message-link:hover { color: #ffc300; }
        .message-text { font-family: 'Barlow', sans-serif; font-size: 16px; color: #c0cfe0; line-height: 1.9; white-space: pre-wrap; }

        .day-section { margin-bottom: 40px; }
        .day-label { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .day-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,170,0,0.1); }

        .empty-state { border: 1px solid rgba(255,170,0,0.1); padding: 60px 40px; text-align: center; }
        .empty-title { font-family: 'Orbitron', monospace; font-size: 16px; color: #5a7a94; letter-spacing: 3px; margin-bottom: 16px; }
        .empty-sub { font-family: 'Barlow', sans-serif; font-size: 15px; color: #3d5870; }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; }
        .loading-orb { width: 40px; height: 40px; border: 2px solid rgba(255,170,0,0.1); border-top-color: #ffaa00; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }

        .error-block { border: 1px solid rgba(255,60,60,0.2); background: rgba(255,60,60,0.04); padding: 20px 24px; margin-bottom: 24px; }
        .error-text { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #ff6060; letter-spacing: 1px; }

        footer { border-top: 1px solid rgba(30,158,255,0.1); padding: 40px; text-align: center; }
        .footer-text { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }

        @media (max-width: 768px) {
          nav { padding: 0 20px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .page-wrap { padding: 140px 20px 80px; }
          .doc-header { padding: 28px 24px; }
          .doc-actions { padding: 14px 24px; }
          .message-block { padding: 20px; }
        }
      `}</style>

      <nav>
        <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
        <ul className="nav-links">
          <li><a href="/articles">All Reports</a></li>
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/brief" style={{ color: '#ffaa00' }}>Aladdin Brief</a></li>
        </ul>
        <div className="hamburger" onClick={() => setMobileOpen(o => !o)}>
          <span /><span /><span />
        </div>
      </nav>

      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMobileOpen(false)}>✕ Close</button>
        <a href="/">Home</a>
        <a href="/articles">All Reports</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/brief">Aladdin Brief</a>
      </div>

      <div className="classify-banner">UNCLASSIFIED // FOR PUBLIC RELEASE // SOURCE: OPEN-SOURCE INTELLIGENCE</div>

      <div className="page-wrap">
        <div className="back-bar">
          <a href="/" className="back-link">← Home</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'Barlow Condensed', fontSize: 11, letterSpacing: 2, color: '#ffaa00', textTransform: 'uppercase' }}>Aladdin Brief</span>
        </div>

        <div className="doc-header">
          <div className="doc-eyebrow">
            <div className="doc-eyebrow-line" />
            <div className="doc-eyebrow-text">Daily Intelligence Brief // Magic Carpet</div>
          </div>
          <div className="doc-title">ALADDIN<span>.</span></div>
          <div className="doc-subtitle">Open-Source Intelligence Summary — Prepared for Public Release</div>
          <div className="doc-meta">
            <div className="doc-meta-item">
              <div className="doc-meta-label">Date</div>
              <div className="doc-meta-val">{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</div>
            </div>
            <div className="doc-meta-item">
              <div className="doc-meta-label">Source</div>
              <div className="doc-meta-val">@AladdinOSINT</div>
            </div>
            <div className="doc-meta-item">
              <div className="doc-meta-label">Classification</div>
              <div className="doc-meta-val" style={{ color: '#ffaa00' }}>UNCLASSIFIED</div>
            </div>
            <div className="doc-meta-item">
              <div className="doc-meta-label">Entries</div>
              <div className="doc-meta-val">{data?.messages.length ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="doc-actions">
          <button className="doc-btn" onClick={fetchBrief}>↺ Refresh</button>
          <a className="doc-btn primary" href="https://t.me/AladdinOSINT" target="_blank" rel="noopener noreferrer">Open in Telegram →</a>
        </div>

        {loading && (
          <div className="loading-wrap">
            <div className="loading-orb" />
            <div className="loading-text">Receiving transmission...</div>
          </div>
        )}

        {!loading && data?.error && (
          <div className="error-block">
            <div className="error-text">// TRANSMISSION ERROR: {data.error} — try refreshing or open directly in Telegram</div>
          </div>
        )}

        {!loading && data && !data.error && data.messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-title">No transmissions received</div>
            <div className="empty-sub">The channel has not posted yet. Check back at 0600.</div>
          </div>
        )}

        {!loading && data && data.messages.length > 0 && (
          <>
            {todayMessages.length > 0 && (
              <div className="day-section">
                <div className="today-label">
                  <span className="live-dot" />
                  Today — {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                </div>
                {todayMessages.map(msg => (
                  <div className="message-block" key={msg.id}>
                    <div className="message-header">
                      <div className="message-time">{formatTime(msg.date)}</div>
                      <a className="message-link" href={msg.link} target="_blank" rel="noopener noreferrer">View on Telegram ↗</a>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>
            )}

            {Array.from(grouped.entries()).map(([day, msgs]) => (
              <div className="day-section" key={day}>
                <div className="day-label">
                  {formatDate(msgs[0].date)}
                </div>
                {msgs.map(msg => (
                  <div className="message-block" key={msg.id}>
                    <div className="message-header">
                      <div className="message-time">{formatTime(msg.date)}</div>
                      <a className="message-link" href={msg.link} target="_blank" rel="noopener noreferrer">View on Telegram ↗</a>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="classify-banner" style={{ position: 'static', marginTop: 0 }}>
        UNCLASSIFIED // FOR PUBLIC RELEASE // © 2026 THE RUDD REPORT
      </div>

      <footer>
        <div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div>
      </footer>
    </>
  );
}
