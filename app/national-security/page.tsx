'use client';

function CategoryPage({ category, eyebrow, tagline, blurb, personalNote, icon, articles }: any) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: var(--bg-primary, #030608); color: var(--text-primary, #d8e8f5); font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; line-height: 1.2; }
        .nav-logo-text span { display: block; font-size: 8px; font-weight: 400; letter-spacing: 4px; color: #1e9eff; font-family: 'Share Tech Mono', monospace; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; position: relative; }
        .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 1px; background: #1e9eff; transform: scaleX(0); transition: transform 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-status { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; letter-spacing: 2px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: pulse 2s infinite; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; backdrop-filter: blur(20px); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu a:hover { color: #1e9eff; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .hero { position: relative; padding: 80px 40px; overflow: hidden; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .hero::before { content: ''; position: absolute; top: -300px; right: -200px; width: 800px; height: 800px; background: radial-gradient(circle, rgba(30,158,255,0.07) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .hero-eyebrow-line { width: 60px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(36px, 6vw, 72px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; line-height: 1.05; margin-bottom: 12px; }
        .hero-tagline { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 28px; }
        .hero-blurb { font-size: 16px; font-weight: 300; color: #7a9bb5; line-height: 1.9; margin-bottom: 24px; }
        .hero-note { font-size: 14px; font-weight: 300; line-height: 1.8; padding: 20px 24px; border-left: 2px solid #1e9eff; background: rgba(30,158,255,0.04); font-style: italic; color: #3d5870; }
        .hero-icon-box { display: flex; align-items: center; justify-content: center; font-size: 120px; opacity: 0.15; }
        .articles { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
        .articles-header { margin-bottom: 48px; padding-bottom: 20px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .articles-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 8px; }
        .articles-title { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .article-card { position: relative; background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 32px; overflow: hidden; text-decoration: none; display: block; transition: all 0.4s ease; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #1e9eff, transparent); transform: scaleX(0); transition: transform 0.5s ease; }
        .article-card:hover { background: #0f1e2e; border-color: rgba(30,158,255,0.4); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .article-card:hover::before { transform: scaleX(1); }
        .card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .card-category { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid #0d5a9e; padding: 3px 10px; background: rgba(30,158,255,0.08); }
        .card-date { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #d8e8f5; line-height: 1.2; margin-bottom: 12px; transition: color 0.3s; }
        .article-card:hover .card-title { color: #1e9eff; }
        .card-excerpt { font-size: 13px; font-weight: 300; color: #7a9bb5; line-height: 1.8; margin-bottom: 24px; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(30,158,255,0.12); }
        .card-read { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .threat-high { color: #ff3a3a; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .threat-med { color: #ffaa00; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .threat-low { color: #00ff88; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .coming-soon { text-align: center; padding: 60px 40px; border: 1px dashed rgba(30,158,255,0.2); margin-top: 2px; }
        .coming-soon-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 80px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links, .nav-status { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 40px 20px; }
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-icon-box { display: none; }
          .articles { padding: 40px 20px; }
          .articles-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report<span>Intelligence · Analysis · Strategy</span></div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="nav-status"><div className="status-dot" /><span>LIVE</span></div>
          <div className="hamburger" onClick={() => document.getElementById('catMobileMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="catMobileMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>Home</a>
          <a href="/cybersecurity" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>Cybersecurity</a>
          <a href="/intelligence" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>Intelligence</a>
          <a href="/geopolitics" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>Geopolitics</a>
          <a href="/national-security" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>National Security</a>
          <a href="/about" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>About</a>
          <a href="/contact" onClick={() => document.getElementById('catMobileMenu')?.classList.remove('open')}>Contact</a>
        </div>
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">{eyebrow}</div></div>
              <h1 className="hero-title">{category}</h1>
              <div className="hero-tagline">// {tagline}</div>
              <p className="hero-blurb">{blurb}</p>
              <div className="hero-note">{personalNote}</div>
            </div>
            <div className="hero-icon-box">{icon}</div>
          </div>
        </div>
        <div className="articles">
          <div className="articles-header">
            <div className="articles-label">// Latest Reports</div>
            <div className="articles-title">{category} Analysis</div>
          </div>
          <div className="articles-grid">
            {articles.map((a: any, i: number) => (
              <a href="#" className="article-card" key={i}>
                <div className="card-meta"><div className="card-category">{a.category}</div><div className="card-date">{a.date}</div></div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">{a.excerpt}</div>
                <div className="card-footer">
                  <div className="card-read">Read Analysis →</div>
                  <div className={`threat-${a.threat}`}>■ {a.threat.toUpperCase()} RELEVANCE</div>
                </div>
              </a>
            ))}
          </div>
          <div className="coming-soon"><div className="coming-soon-text">// More reports incoming — check back soon</div></div>
        </div>
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

export default function NationalSecurity() {
  const articles = [
    { category: 'Natl. Security', date: 'FEB 14, 2026', title: 'The AUKUS Equation: Submarines, Strategy & the Indo-Pacific', excerpt: 'How the trilateral security pact is reshaping alliance architecture across the Pacific theater.', threat: 'med' },
    { category: 'Natl. Security', date: 'FEB 1, 2026', title: 'Border Security in the Age of Hybrid Threats', excerpt: 'The border is no longer just a physical line — it is a digital, financial, and intelligence frontier that demands a new kind of defense.', threat: 'high' },
    { category: 'Natl. Security', date: 'JAN 22, 2026', title: 'The National Security State: Reform or Reinforce?', excerpt: 'Decades after 9/11 reshaped U.S. national security architecture, a new generation of policymakers is asking hard questions about what comes next.', threat: 'low' },
  ];
  return <CategoryPage category="National Security" eyebrow="// Domain: Defense & Security" tagline="NATIONAL SECURITY ANALYSIS" blurb="National security sits at the intersection of military strategy, intelligence, diplomacy, and domestic policy. Protecting the homeland in the 21st century requires understanding threats that are increasingly hybrid, diffuse, and digital." personalNote="My internship with the Department of Homeland Security gave me direct exposure to how national security policy translates into operational reality. This section examines the decisions, doctrines, and dilemmas that define American security." icon="🛡️" articles={articles} />;
}