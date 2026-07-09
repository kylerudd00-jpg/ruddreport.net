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

  async function fetchBrief() {
    setLoading(true);
    try {
      const res = await fetch(`/api/brief?t=${Date.now()}`);
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .classify-banner { background: #ffaa00; color: #000; text-align: center; padding: 8px 20px; font-family: var(--font-mono); font-size: 13px; font-weight: 700; letter-spacing: 0.06em; position: fixed; top: 70px; left: 0; right: 0; z-index: 90; }

        .page-wrap { padding: 170px 40px 100px; max-width: 900px; margin: 0 auto; }

        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-secondary); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #ffaa00; }
        .back-sep { color: var(--text-muted); }

        .doc-header { border: 1px solid rgba(255,170,0,0.25); background: rgba(255,170,0,0.03); padding: 40px; margin-bottom: 2px; position: relative; overflow: hidden; }
        .doc-header::before { content: 'MAGIC CARPET'; position: absolute; right: 30px; top: 50%; transform: translateY(-50%); font-family: var(--font-display); font-size: 80px; font-weight: 900; color: rgba(255,170,0,0.04); letter-spacing: -2px; pointer-events: none; white-space: nowrap; }
        .doc-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .doc-eyebrow-line { width: 32px; height: 1px; background: #ffaa00; }
        .doc-eyebrow-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: #ffaa00; text-transform: uppercase; }
        .doc-title { font-family: var(--font-display); font-size: clamp(32px, 6vw, 56px); font-weight: 900; color: #fff; letter-spacing: 2px; line-height: 1.0; }
        .doc-title span { color: #ffaa00; }
        .doc-subtitle { font-family: var(--font-mono); font-size: 14px; color: var(--text-secondary); letter-spacing: 0.05em; margin-top: 12px; text-transform: uppercase; }
        .doc-meta { display: flex; gap: 32px; margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(255,170,0,0.12); flex-wrap: wrap; }
        .doc-meta-item { display: flex; flex-direction: column; gap: 6px; }
        .doc-meta-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
        .doc-meta-val { font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); }

        .doc-actions { display: flex; gap: 12px; padding: 18px 40px; background: rgba(255,170,0,0.04); border: 1px solid rgba(255,170,0,0.15); border-top: none; margin-bottom: 32px; flex-wrap: wrap; align-items: center; }
        .doc-btn { font-family: var(--font-mono); font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 10px 20px; border: 1px solid rgba(255,170,0,0.3); background: transparent; color: #ffaa00; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .doc-btn:hover { background: rgba(255,170,0,0.1); border-color: #ffaa00; }
        .doc-btn.primary { background: #ffaa00; color: #000; border-color: #ffaa00; }
        .doc-btn.primary:hover { background: #ffc300; }

        .today-label { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: #ffaa00; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .today-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,170,0,0.2); }
        .live-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffaa00; display: inline-block; flex-shrink: 0; }
        @keyframes pulse-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }

        .message-block { border: 1px solid rgba(255,170,0,0.15); background: var(--bg-secondary); padding: 28px 32px; margin-bottom: 2px; position: relative; }
        .message-block::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #ffaa00, transparent); opacity: 0.4; }
        .message-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .message-time { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); letter-spacing: 0.05em; }
        .message-link { font-family: var(--font-mono); font-size: 13px; font-weight: 600; letter-spacing: 0.05em; color: #ffaa00; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .message-link:hover { color: #ffc300; }
        .message-text { font-family: var(--font-display); font-size: 16px; color: var(--text-primary); line-height: 1.9; white-space: pre-wrap; }

        .day-section { margin-bottom: 40px; }
        .day-label { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .day-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,170,0,0.1); }

        .empty-state { border: 1px solid rgba(255,170,0,0.1); padding: 60px 40px; text-align: center; }
        .empty-title { font-family: var(--font-display); font-size: 16px; color: var(--text-muted); letter-spacing: 0.06em; margin-bottom: 16px; }
        .empty-sub { font-family: var(--font-display); font-size: 15px; color: var(--text-muted); }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 0; }
        .loading-orb { width: 40px; height: 40px; border: 2px solid rgba(255,170,0,0.1); border-top-color: #ffaa00; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }

        .error-block { border: 1px solid rgba(255,60,60,0.2); background: rgba(255,60,60,0.04); padding: 20px 24px; margin-bottom: 24px; }
        .error-text { font-family: var(--font-mono); font-size: 13px; color: var(--red); letter-spacing: 0.05em; }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 140px 20px 80px; }
          .doc-header { padding: 28px 24px; }
          .doc-actions { padding: 14px 24px; }
          .message-block { padding: 20px; }
        }
      `}</style>

      <div className="classify-banner">UNCLASSIFIED // FOR PUBLIC RELEASE // SOURCE: OPEN-SOURCE INTELLIGENCE</div>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/" className="back-link">← Home</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.05em', color: '#ffaa00', textTransform: 'uppercase' }}>Aladdin Brief</span>
        </div>

        <div className="doc-header">
          <div className="doc-eyebrow">
            <div className="doc-eyebrow-line" aria-hidden="true" />
            <div className="doc-eyebrow-text">Daily Intelligence Brief // Magic Carpet</div>
          </div>
          <h1 className="doc-title">ALADDIN<span>.</span></h1>
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
          <button type="button" className="doc-btn" onClick={fetchBrief}>↺ Refresh</button>
          <a className="doc-btn primary" href="https://t.me/AladdinOSINT" target="_blank" rel="noopener noreferrer">Open in Telegram →</a>
        </div>

        <div aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-orb" />
              <div className="loading-text">Receiving transmission...</div>
            </div>
          )}

          {!loading && data?.error && (
            <div className="error-block" role="alert">
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
                    <span className="live-dot" aria-hidden="true" />
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
      </main>

      <div className="classify-banner" style={{ position: 'static', marginTop: 0 }}>
        UNCLASSIFIED // FOR PUBLIC RELEASE // © 2026 THE RUDD REPORT
      </div>

      <footer>
        <div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div>
      </footer>
    </>
  );
}
