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
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); max-width: 1400px; margin: 0 auto; }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .osint-header { padding: 40px 40px 0; max-width: 1400px; margin: 0 auto; }
        .osint-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .osint-eyebrow-line { width: 40px; height: 1px; background: #00ff88; box-shadow: 0 0 8px #00ff88; }
        .osint-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #00ff88; text-transform: uppercase; }
        .osint-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 48px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        .osint-subtitle { font-size: 14px; color: #3d5870; font-family: 'Share Tech Mono', monospace; letter-spacing: 2px; }
        .osint-statusbar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1400px; margin: 20px auto 0; border: 1px solid rgba(30,158,255,0.12); background: rgba(10,21,32,0.8); }
        .status-left { display: flex; align-items: center; gap: 24px; }
        .status-live { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #00ff88; text-transform: uppercase; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: pulse 2s infinite; }
        .status-count { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .status-updated { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .refresh-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.3); padding: 6px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .refresh-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .osint-filters { display: flex; align-items: center; gap: 2px; padding: 20px 40px 0; max-width: 1400px; margin: 0 auto; }
        .filter-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .filter-btn.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .osint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 20px 40px 80px; max-width: 1400px; margin: 0 auto; }
        .feed-card { position: relative; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 24px; text-decoration: none; display: block; transition: all 0.3s; overflow: hidden; }
        .feed-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #1e9eff, transparent); transform: scaleX(0); transition: transform 0.4s; }
        .feed-card:hover { background: #0f1e2e; border-color: rgba(30,158,255,0.3); transform: translateY(-1px); }
        .feed-card:hover::before { transform: scaleX(1); }
        .feed-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .feed-source { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; border: 1px solid rgba(30,158,255,0.2); padding: 2px 8px; background: rgba(30,158,255,0.06); }
        .feed-cat-cyber { color: #ff3a3a; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .feed-cat-geopolitics { color: #ffaa00; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .feed-cat-global { color: #00ff88; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .feed-title { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #d8e8f5; line-height: 1.3; margin-bottom: 12px; transition: color 0.3s; }
        .feed-card:hover .feed-title { color: #1e9eff; }
        .feed-date { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .feed-arrow { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #1e9eff; margin-top: 16px; display: block; }
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 40px; gap: 20px; }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 4px; align-items: flex-end; height: 30px; }
        .loading-bars span { width: 4px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .no-results { text-align: center; padding: 80px 40px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-bottom { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 8px; } 50% { height: 30px; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 12px 20px; }
          .osint-header { padding: 30px 20px 0; }
          .osint-statusbar { padding: 12px 20px; flex-direction: column; gap: 12px; align-items: flex-start; margin: 16px 20px 0; }
          .osint-filters { padding: 16px 20px 0; flex-wrap: wrap; }
          .osint-grid { grid-template-columns: 1fr; padding: 16px 20px 60px; }
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
            <li><a href="/osint" style={{color:'#00ff88'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('feedMobileMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="feedMobileMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('feedMobileMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a>
          <a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="osint-header">
          <div className="osint-eyebrow">
            <div className="osint-eyebrow-line" />
            <div className="osint-eyebrow-text">// OSINT Hub — Live Feed</div>
          </div>
          <div className="osint-title">Intel Feed</div>
          <div className="osint-subtitle">// Real-time open source intelligence — updated every 5 minutes</div>
        </div>

        <div className="osint-statusbar">
          <div className="status-left">
            <div className="status-live"><div className="status-dot" /> Live</div>
            <div className="status-count">// {filtered.length} items loaded</div>
            {lastUpdated && <div className="status-updated">Last updated: {lastUpdated} UTC</div>}
          </div>
          <button className="refresh-btn" onClick={fetchFeeds}>↺ Refresh</button>
        </div>

        <div className="osint-filters">
          {categories.map(c => (
            <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="loading-bars"><span/><span/><span/><span/><span/></div>
            <div className="loading-text">// Acquiring intelligence feed...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="no-results">// No items found in this category</div>
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