'use client';

export default function OSINTHub() {
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
        .hero { padding: 80px 40px 60px; border-bottom: 1px solid rgba(30,158,255,0.12); position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .hero-eyebrow-line { width: 40px; height: 1px; background: #00ff88; box-shadow: 0 0 8px #00ff88; }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #00ff88; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(32px, 5vw, 64px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; line-height: 1.05; margin-bottom: 16px; }
        .hero-title span { color: #00ff88; }
        .hero-sub { font-size: 16px; font-weight: 300; color: #7a9bb5; line-height: 1.8; max-width: 600px; margin-bottom: 32px; }
        .hero-stats { display: flex; gap: 40px; }
        .hero-stat { display: flex; flex-direction: column; gap: 4px; }
        .hero-stat-num { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: #00ff88; }
        .hero-stat-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .section { padding: 60px 40px; max-width: 1200px; margin: 0 auto; }
        .section-header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #00ff88; text-transform: uppercase; margin-bottom: 8px; }
        .section-title { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; }
        .tools-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .tool-card { position: relative; background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 32px; text-decoration: none; display: block; transition: all 0.3s; overflow: hidden; }
        .tool-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #1e9eff; transform: scaleY(0); transition: transform 0.3s; transform-origin: bottom; }
        .tool-card:hover { background: #0f1e2e; border-color: rgba(30,158,255,0.3); transform: translateX(4px); }
        .tool-card:hover::before { transform: scaleY(1); }
        .tool-card.live { border-color: rgba(0,255,136,0.2); }
        .tool-card.live::before { background: #00ff88; }
        .tool-card.live:hover { border-color: rgba(0,255,136,0.4); background: #0a1f18; }
        .tool-card.coming { opacity: 0.45; cursor: default; pointer-events: none; }
        .tool-icon { font-size: 32px; margin-bottom: 16px; display: block; }
        .tool-status { display: inline-flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
        .tool-status.live { color: #00ff88; }
        .tool-status.soon { color: #3d5870; }
        .tool-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .tool-status.live .tool-status-dot { box-shadow: 0 0 6px #00ff88; animation: pulse 2s infinite; }
        .tool-name { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #d8e8f5; margin-bottom: 10px; transition: color 0.3s; }
        .tool-card:hover .tool-name { color: #1e9eff; }
        .tool-card.live:hover .tool-name { color: #00ff88; }
        .tool-desc { font-size: 13px; font-weight: 300; color: #7a9bb5; line-height: 1.7; margin-bottom: 20px; }
        .tool-action { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .tool-card.live .tool-action { color: #00ff88; }
        .tool-card.coming .tool-action { color: #3d5870; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(30,158,255,0.2), transparent); }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 40px 20px; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .section { padding: 40px 20px; }
          .tools-grid { grid-template-columns: 1fr; }
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
          <div className="hamburger" onClick={() => document.getElementById('osintHubMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="osintHubMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('osintHubMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a>
          <a href="/national-security">National Security</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" />
              <div className="hero-eyebrow-text">// Open Source Intelligence</div>
            </div>
            <div className="hero-title">OSINT <span>Hub</span></div>
            <p className="hero-sub">A curated toolkit for open-source intelligence gathering, corporate investigations, and real-time situational awareness. Built for analysts, researchers, and anyone who needs to know what's really going on.</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-num">5</div>
                <div className="hero-stat-label">// Live Tools</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">4+</div>
                <div className="hero-stat-label">// Coming Soon</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-num">6</div>
                <div className="hero-stat-label">// News Sources</div>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <div className="section-label">// Active Tools</div>
            <div className="section-title">Intelligence Toolkit</div>
          </div>
          <div className="tools-grid">

            <a href="/osint/feed" className="tool-card live">
              <span className="tool-icon">📡</span>
              <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
              <div className="tool-name">Live Intel Feed</div>
              <p className="tool-desc">Real-time news aggregation from premier intelligence and security sources — BBC, Krebs, The Record, Foreign Policy, and more. Updated every 5 minutes.</p>
              <div className="tool-action">Launch Feed →</div>
            </a>

            <a href="/osint/whois" className="tool-card live">
              <span className="tool-icon">🌐</span>
              <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
              <div className="tool-name">WHOIS Lookup</div>
              <p className="tool-desc">Full domain registration intelligence — ownership, registrar, nameservers, DNSSEC status, and contact records for any domain worldwide.</p>
              <div className="tool-action">Launch Tool →</div>
            </a>

            <a href="/osint/dns" className="tool-card live">
              <span className="tool-icon">🔬</span>
              <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
              <div className="tool-name">DNS Intelligence</div>
              <p className="tool-desc">Reveal the full infrastructure behind any domain — email providers, DNS hosts, third-party services, SPF/DMARC security posture, and all DNS records decoded.</p>
              <div className="tool-action">Launch Tool →</div>
            </a>

            <a href="/osint/ip" className="tool-card live">
              <span className="tool-icon">📍</span>
              <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
              <div className="tool-name">IP Geolocation</div>
              <p className="tool-desc">Identify the geographic location, ISP, ASN, and network details behind any IP address. Drop a pin on the map for any target worldwide.</p>
              <div className="tool-action">Launch Tool →</div>
            </a>

            <a href="/osint/username" className="tool-card live">
              <span className="tool-icon">👤</span>
              <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
              <div className="tool-name">Username Hunter</div>
              <p className="tool-desc">Check if a username exists across developer communities, gaming networks, forums, and more — all checked simultaneously.</p>
              <div className="tool-action">Launch Tool →</div>
            </a>
<a href="/osint/metadata" className="tool-card live">
  <span className="tool-icon">📷</span>
  <div className="tool-status live"><div className="tool-status-dot" /> Live</div>
  <div className="tool-name">Metadata Extractor</div>
  <p className="tool-desc">Upload any photo and reveal hidden EXIF data — GPS coordinates, device model, serial numbers, timestamps, and more. Runs entirely in your browser.</p>
  <div className="tool-action">Launch Tool →</div>
</a>
            <a href="#" className="tool-card coming">
              <span className="tool-icon">🏢</span>
              <div className="tool-status soon"><div className="tool-status-dot" /> Coming Soon</div>
              <div className="tool-name">Shell Company Investigator</div>
              <p className="tool-desc">Trace corporate structures, identify beneficial owners, and map shell company networks. Built for financial intelligence and sanctions research.</p>
              <div className="tool-action">// In Development</div>
            </a>

            <a href="#" className="tool-card coming">
              <span className="tool-icon">🗺️</span>
              <div className="tool-status soon"><div className="tool-status-dot" /> Coming Soon</div>
              <div className="tool-name">Conflict Tracker</div>
              <p className="tool-desc">Interactive map of active conflict zones, troop movements, and geopolitical flashpoints — updated from open-source reporting.</p>
              <div className="tool-action">// In Development</div>
            </a>

            <a href="#" className="tool-card coming">
              <span className="tool-icon">💰</span>
              <div className="tool-status soon"><div className="tool-status-dot" /> Coming Soon</div>
              <div className="tool-name">Sanctions Monitor</div>
              <p className="tool-desc">Cross-reference entities against OFAC, UN, EU, and UK sanctions lists in real time. Essential for compliance and intelligence work.</p>
              <div className="tool-action">// In Development</div>
            </a>

            <a href="#" className="tool-card coming">
              <span className="tool-icon">🔍</span>
              <div className="tool-status soon"><div className="tool-status-dot" /> Coming Soon</div>
              <div className="tool-name">Entity Search</div>
              <p className="tool-desc">Search individuals, organizations, and assets across open databases, sanctions lists, and public records simultaneously.</p>
              <div className="tool-action">// In Development</div>
            </a>

          </div>
        </div>

        <div className="divider" />

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