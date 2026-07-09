'use client';
import { useState, useEffect } from 'react';

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
};

export default function OSINTFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/osint');
      const data = await res.json();
      setItems(data.items || []);
      setLastUpdated(new Date().toUTCString().slice(0, 25));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const categories = ['All', 'Cyber', 'Geopolitics', 'Global'];
  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); max-width: 1400px; margin: 0 auto; }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .osint-header { padding: 40px 40px 0; max-width: 1400px; margin: 0 auto; }
        .osint-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .osint-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .osint-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #1e9eff; text-transform: uppercase; }
        .osint-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
        .osint-subtitle { font-size: 14px; color: var(--text-muted); font-family: var(--font-mono); letter-spacing: 0.05em; }
        .osint-statusbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1400px; margin: 20px auto 0; border: 1px solid var(--border); background: var(--bg-card); }
        .status-left { display: flex; align-items: center; gap: 24px; }
        .status-live { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #1e9eff; text-transform: uppercase; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #1e9eff; }
        .status-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .status-updated { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .refresh-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #1e9eff; background: none; border: 1px solid var(--border-bright); padding: 6px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .refresh-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .osint-filters { display: flex; align-items: center; gap: 2px; padding: 20px 40px 0; max-width: 1400px; margin: 0 auto; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: #1e9eff; border-color: var(--border-bright); }
        .filter-btn.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .osint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 20px 40px 80px; max-width: 1400px; margin: 0 auto; }
        .feed-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); padding: 24px; text-decoration: none; display: block; transition: all 0.3s; overflow: hidden; }
        .feed-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #1e9eff, transparent); transform: scaleX(0); transition: transform 0.4s; }
        .feed-card:hover { background: var(--bg-card-hover); border-color: var(--border); transform: translateY(-1px); }
        .feed-card:hover::before { transform: scaleX(1); }
        .feed-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .feed-source { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #1e9eff; text-transform: uppercase; border: 1px solid var(--border); padding: 2px 8px; background: rgba(30,158,255,0.06); }
        .feed-cat-cyber { color: var(--red); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .feed-cat-geopolitics { color: #ffaa00; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .feed-cat-global { color: #1e9eff; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .feed-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); line-height: 1.3; margin-bottom: 12px; transition: color 0.3s; }
        .feed-card:hover .feed-title { color: #1e9eff; }
        .feed-date { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .feed-arrow { font-family: var(--font-mono); font-size: 12px; color: #1e9eff; margin-top: 16px; display: block; }
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 40px; gap: 20px; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 4px; align-items: flex-end; height: 30px; }
        .loading-bars span { width: 4px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .no-results { text-align: center; padding: 80px 40px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-bottom { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: #1e9eff; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 8px; } 50% { height: 30px; } }
        @media (max-width: 768px) {
          .back-bar { padding: 12px 20px; }
          .osint-header { padding: 30px 20px 0; }
          .osint-statusbar { padding: 12px 20px; flex-direction: column; gap: 12px; align-items: flex-start; margin: 16px 20px 0; }
          .osint-filters { padding: 16px 20px 0; flex-wrap: wrap; }
          .osint-grid { grid-template-columns: 1fr; padding: 16px 20px 60px; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="osint-header">
          <div className="osint-eyebrow">
            <div className="osint-eyebrow-line" aria-hidden="true" />
            <div className="osint-eyebrow-text">OSINT Hub — Live Feed</div>
          </div>
          <h1 className="osint-title">Intel Feed</h1>
          <div className="osint-subtitle">Real-time open source intelligence — updated every 5 minutes</div>
        </div>

        <div className="osint-statusbar">
          <div className="status-left">
            <div className="status-live"><div className="status-dot" aria-hidden="true" /> Live</div>
            <div className="status-count">{filtered.length} items loaded</div>
            {lastUpdated && <div className="status-updated">Last updated: {lastUpdated} UTC</div>}
          </div>
          <button type="button" className="refresh-btn" onClick={fetchFeeds}>↺ Refresh</button>
        </div>

        <div className="osint-filters">
          {categories.map(c => (
            <button type="button" key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        <div aria-live="polite">
          {loading ? (
            <div className="loading-wrap">
              <div className="loading-bars"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">Acquiring intelligence feed...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-results">No items found in this category</div>
          ) : (
            <div className="osint-grid">
              {filtered.map((item, i) => (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="feed-card" key={i}>
                  <div className="feed-card-top">
                    <div className="feed-source">{item.source}</div>
                    <div className={`feed-cat-${item.category.toLowerCase()}`}>■ {item.category.toUpperCase()}</div>
                  </div>
                  <div className="feed-title">{item.title}</div>
                  <div className="feed-date">{item.pubDate}</div>
                  <div className="feed-arrow">Read Source →</div>
                </a>
              ))}
            </div>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>

          </div>
        </footer>
      </main>
    </>
  );
}
