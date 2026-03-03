'use client';
import { useEffect, useRef } from 'react';

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (cursorRef.current) { cursorRef.current.style.left = mx - 4 + 'px'; cursorRef.current.style.top = my - 4 + 'px'; }
    };
    const animateRing = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      if (ringRef.current) { ringRef.current.style.left = rx - 16 + 'px'; ringRef.current.style.top = ry - 16 + 'px'; }
      requestAnimationFrame(animateRing);
    };
    animateRing();
    document.addEventListener('mousemove', onMove);
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <>
      <style>{`
        .cursor { position: fixed; width: 8px; height: 8px; background: var(--accent); border-radius: 50%; pointer-events: none; z-index: 9999; box-shadow: 0 0 10px var(--accent); }
        .cursor-ring { position: fixed; width: 32px; height: 32px; border: 1px solid rgba(30,158,255,0.4); border-radius: 50%; pointer-events: none; z-index: 9998; transition: width 0.3s, height 0.3s; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); animation: fadeDown 0.8s ease forwards; }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; line-height: 1.2; }
        .nav-logo-text span { display: block; font-size: 8px; font-weight: 400; letter-spacing: 4px; color: var(--accent); font-family: 'Share Tech Mono', monospace; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; position: relative; }
        .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 1px; background: var(--accent); transform: scaleX(0); transition: transform 0.3s; }
        .nav-links a:hover { color: var(--accent); }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-status { display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text-muted); letter-spacing: 2px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #00ff88; box-shadow: 0 0 8px #00ff88; animation: pulse 2s infinite; }
        .signal-bar { display: flex; align-items: flex-end; gap: 3px; height: 16px; }
        .signal-bar span { width: 3px; background: var(--accent); border-radius: 1px; animation: signalPulse 1.5s ease-in-out infinite; }
        .signal-bar span:nth-child(1) { height: 4px; } .signal-bar span:nth-child(2) { height: 7px; animation-delay: 0.15s; } .signal-bar span:nth-child(3) { height: 11px; animation-delay: 0.3s; } .signal-bar span:nth-child(4) { height: 16px; animation-delay: 0.45s; }
        .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 120px 40px 80px; overflow: hidden; z-index: 3; }
        .hero-bg-glow { position: absolute; top: -200px; left: -200px; width: 800px; height: 800px; background: radial-gradient(circle, rgba(30,158,255,0.08) 0%, transparent 70%); pointer-events: none; animation: drift 8s ease-in-out infinite alternate; }
        .hero-bg-glow2 { position: absolute; bottom: -300px; right: -200px; width: 1000px; height: 700px; background: radial-gradient(circle, rgba(30,158,255,0.05) 0%, transparent 70%); pointer-events: none; animation: drift2 10s ease-in-out infinite alternate; }
        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; opacity: 0; animation: fadeUp 0.8s ease 0.3s forwards; }
        .hero-eyebrow-line { width: 60px; height: 1px; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
        .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: var(--accent); text-transform: uppercase; }
        .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(48px, 8vw, 96px); font-weight: 900; line-height: 1.05; color: var(--silver); text-transform: uppercase; letter-spacing: 2px; opacity: 0; animation: fadeUp 0.9s ease 0.5s forwards; }
        .hero-title .accent-word { color: transparent; -webkit-text-stroke: 1px var(--accent); text-shadow: 0 0 40px rgba(30,158,255,0.3); display: block; }
        .hero-subtitle { margin-top: 28px; font-size: 16px; font-weight: 300; color: var(--text-secondary); letter-spacing: 1px; max-width: 560px; line-height: 1.7; opacity: 0; animation: fadeUp 0.9s ease 0.7s forwards; }
        .hero-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 40px; opacity: 0; animation: fadeUp 0.9s ease 0.9s forwards; }
        .hero-tag { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); border: 1px solid var(--border); padding: 6px 14px; text-transform: uppercase; transition: all 0.3s; cursor: default; }
        .hero-tag:hover { color: var(--accent); border-color: var(--accent); background: var(--accent-glow); }
        .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; animation: fadeUp 1s ease 1.4s forwards; }
        .hero-scroll-text { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: var(--text-muted); text-transform: uppercase; }
        .hero-scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, var(--accent), transparent); animation: scrollLine 2s ease-in-out infinite; }
        .ticker-wrap { position: relative; z-index: 3; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(7,13,18,0.9); padding: 10px 0; overflow: hidden; }
        .ticker-label { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent); display: flex; align-items: center; padding: 0 20px; font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700; letter-spacing: 3px; color: #000; z-index: 2; text-transform: uppercase; }
        .ticker-track { display: flex; animation: ticker 30s linear infinite; padding-left: 160px; }
        .ticker-item { white-space: nowrap; font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--text-secondary); letter-spacing: 1px; padding: 0 40px; display: flex; align-items: center; gap: 12px; }
        .ticker-item::after { content: '//'; color: var(--accent); opacity: 0.5; }
        section { position: relative; z-index: 3; padding: 100px 40px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 60px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .section-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
        .section-title { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: var(--silver); letter-spacing: 2px; text-transform: uppercase; }
        .section-link { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: var(--accent); text-decoration: none; text-transform: uppercase; display: flex; align-items: center; gap: 8px; transition: gap 0.3s; }
        .section-link:hover { gap: 14px; }
        .featured-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .article-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); padding: 36px; overflow: hidden; text-decoration: none; display: block; transition: all 0.4s ease; cursor: pointer; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); transform: scaleX(0); transition: transform 0.5s ease; }
        .article-card:hover { background: var(--bg-card-hover); border-color: var(--border-bright); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px var(--accent-glow); }
        .article-card:hover::before { transform: scaleX(1); }
        .article-card.featured { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 60px; }
        .card-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .card-category { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); border: 1px solid var(--accent-dim); padding: 3px 10px; background: var(--accent-glow); }
        .card-date { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--text-muted); }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; letter-spacing: 0.5px; margin-bottom: 16px; transition: color 0.3s; }
        .article-card:hover .card-title { color: var(--accent); }
        .article-card.featured .card-title { font-size: 42px; line-height: 1.1; }
        .card-excerpt { font-size: 14px; font-weight: 300; color: var(--text-secondary); line-height: 1.8; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); }
        .card-read { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; }
        .threat-high { color: var(--red); } .threat-med { color: #ffaa00; } .threat-low { color: #00ff88; }
        .featured-visual { position: relative; height: 300px; border: 1px solid var(--border); overflow: hidden; background: var(--bg-secondary); }
        .featured-visual-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .globe-svg { width: 200px; height: 200px; opacity: 0.6; animation: rotateSlow 20s linear infinite; }
        .visual-label { position: absolute; bottom: 16px; left: 16px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; }
        .intel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .topics-section { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .topics-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; }
        .topic-card { padding: 40px 24px; border: 1px solid var(--border); text-align: center; cursor: pointer; transition: all 0.4s; position: relative; overflow: hidden; }
        .topic-card::before { content: ''; position: absolute; inset: 0; background: var(--accent-glow); opacity: 0; transition: opacity 0.4s; }
        .topic-card:hover::before { opacity: 1; }
        .topic-card:hover { border-color: var(--border-bright); }
        .topic-icon { font-size: 24px; margin-bottom: 16px; display: block; filter: grayscale(1) brightness(0.7); transition: filter 0.4s; }
        .topic-card:hover .topic-icon { filter: none; }
        .topic-name { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; color: var(--text-secondary); text-transform: uppercase; transition: color 0.4s; }
        .topic-card:hover .topic-name { color: var(--accent); }
        .topic-count { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: var(--text-muted); margin-top: 8px; letter-spacing: 2px; }
        footer { position: relative; z-index: 3; border-top: 1px solid var(--border); padding: 60px 40px 40px; background: var(--bg-secondary); }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; padding-bottom: 40px; border-bottom: 1px solid var(--border); margin-bottom: 40px; }
        .footer-brand-name { font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 700; color: var(--silver); letter-spacing: 3px; margin-bottom: 4px; }
        .footer-brand-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; }
        .footer-desc { font-size: 13px; color: var(--text-muted); line-height: 1.8; max-width: 280px; }
        .footer-col-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 4px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 20px; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a { font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--accent); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: var(--text-muted); border: 1px solid var(--border); padding: 5px 14px; text-transform: uppercase; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--accent-dim), transparent); position: relative; z-index: 3; }
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; } .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; } .reveal-delay-4 { transition-delay: 0.4s; }
        .reveal-delay-5 { transition-delay: 0.5s; } .reveal-delay-6 { transition-delay: 0.6s; }
      `}</style>

      <div className="cursor" ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />

 <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-text">
            The Rudd Report
            <span>Intelligence · Analysis · Strategy</span>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#">Cybersecurity</a></li>
          <li><a href="#">Intelligence</a></li>
          <li><a href="#">Geopolitics</a></li>
          <li><a href="#">National Security</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className="hamburger" onClick={() => document.getElementById('mobileMenu')?.classList.toggle('open')}>
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="mobileMenu">
        <button className="mobile-menu-close" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>✕ Close</button>
        <a href="/" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>Home</a>
        <a href="#" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>Cybersecurity</a>
        <a href="#" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>Intelligence</a>
        <a href="#" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>Geopolitics</a>
        <a href="#" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>National Security</a>
        <a href="/about" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>About</a>
        <a href="/contact" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>Contact</a>
      </div>
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="hero-bg-glow2" />
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <div className="hero-eyebrow-text">Est. 2026 — Independent Analysis</div>
          </div>
          <h1 className="hero-title">
            The Rudd
            <span className="accent-word">Report</span>
          </h1>
          <p className="hero-subtitle">Unclassified intelligence. Strategic analysis on cybersecurity, national security, geopolitics, and the forces reshaping the global order.</p>
          <div className="hero-tags">
            {['Cybersecurity','Intelligence','Geopolitics','National Security','Economic Security','Strategic Affairs'].map(t => (
              <div className="hero-tag" key={t}>{t}</div>
            ))}
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-text">Scroll</div>
          <div className="hero-scroll-line" />
        </div>
      </section>

      <div className="ticker-wrap">
        <div className="ticker-label">INTEL FEED</div>
        <div className="ticker-track">
          {['Semiconductor Supply Chain Risk Assessment','Five Eyes Intelligence Sharing Update','Cyber Threat Actor: APT41 Campaign Analysis','South China Sea: Strategic Update','Critical Infrastructure Vulnerability Report','Economic Coercion: New Vectors Identified','NATO Eastern Flank: Force Posture Review','Semiconductor Supply Chain Risk Assessment','Five Eyes Intelligence Sharing Update','Cyber Threat Actor: APT41 Campaign Analysis','South China Sea: Strategic Update','Critical Infrastructure Vulnerability Report','Economic Coercion: New Vectors Identified','NATO Eastern Flank: Force Posture Review'].map((item, i) => <div className="ticker-item" key={i}>{item}</div>)}
        </div>
      </div>

      <div className="divider" />

      <section>
        <div className="section-inner">
          <div className="section-header reveal">
            <div><div className="section-label">// Latest Intelligence</div><div className="section-title">Featured Analysis</div></div>
            <a href="#" className="section-link">View All Reports →</a>
          </div>
          <div className="featured-grid">
            <a href="#" className="article-card featured reveal">
              <div>
                <div className="card-meta"><div className="card-category">Geopolitics</div><div className="card-date">FEB 23, 2026</div></div>
                <div className="card-title">Why Semiconductor Supply Chains Define Modern Power</div>
                <div className="card-excerpt">Semiconductors are the backbone of modern national security. The global supply chain has become the most critical geopolitical battleground of the 21st century.</div>
                <div className="card-footer"><div className="card-read">Read Analysis →</div><div className="card-threat threat-high">■ HIGH RELEVANCE</div></div>
              </div>
              <div className="featured-visual">
                <div className="featured-visual-inner">
                  <svg className="globe-svg" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="80" stroke="#1e9eff" strokeWidth="0.5" strokeDasharray="4 4"/>
                    <ellipse cx="100" cy="100" rx="40" ry="80" stroke="#1e9eff" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <ellipse cx="100" cy="100" rx="80" ry="30" stroke="#1e9eff" strokeWidth="0.5" strokeDasharray="3 3"/>
                    <circle cx="100" cy="100" r="2" fill="#1e9eff"/>
                    <circle cx="60" cy="70" r="3" fill="#1e9eff" opacity="0.8"/>
                    <circle cx="140" cy="80" r="3" fill="#1e9eff" opacity="0.8"/>
                    <circle cx="120" cy="130" r="2" fill="#ff3a3a" opacity="0.8"/>
                    <line x1="60" y1="70" x2="140" y2="80" stroke="#1e9eff" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2"/>
                    <line x1="140" y1="80" x2="120" y2="130" stroke="#ff3a3a" strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2"/>
                  </svg>
                </div>
                <div className="visual-label">// STRATEGIC MAPPING ACTIVE</div>
              </div>
            </a>
            <a href="#" className="article-card reveal reveal-delay-1">
              <div className="card-meta"><div className="card-category">Intelligence</div><div className="card-date">FEB 20, 2026</div></div>
              <div className="card-title">The Intelligence Failure That Wasn't</div>
              <div className="card-excerpt">Not all strategic surprises are intelligence failures. Sometimes they are policy failures dressed up as analytical gaps.</div>
              <div className="card-footer"><div className="card-read">Read Analysis →</div><div className="card-threat threat-med">■ MED RELEVANCE</div></div>
            </a>
            <a href="#" className="article-card reveal reveal-delay-2">
              <div className="card-meta"><div className="card-category">Cybersecurity</div><div className="card-date">FEB 17, 2026</div></div>
              <div className="card-title">Critical Infrastructure: The Next Battlespace</div>
              <div className="card-excerpt">State-sponsored threat actors are no longer probing — they are pre-positioning inside critical infrastructure for future conflict escalation.</div>
              <div className="card-footer"><div className="card-read">Read Analysis →</div><div className="card-threat threat-high">■ HIGH RELEVANCE</div></div>
            </a>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section className="topics-section">
        <div className="section-inner">
          <div className="section-header reveal">
            <div><div className="section-label">// Coverage Areas</div><div className="section-title">Intelligence Domains</div></div>
          </div>
          <div className="topics-grid">
            {[{icon:'🔐',name:'Cybersecurity',count:'12'},{icon:'🕵️',name:'Intelligence',count:'8'},{icon:'🌐',name:'Geopolitics',count:'15'},{icon:'🛡️',name:'Natl. Security',count:'10'},{icon:'📊',name:'Econ. Security',count:'6'},{icon:'⚔️',name:'Strategy',count:'9'}].map((t,i) => (
              <div className={`topic-card reveal reveal-delay-${i+1}`} key={t.name}>
                <span className="topic-icon">{t.icon}</span>
                <div className="topic-name">{t.name}</div>
                <div className="topic-count">// {t.count} REPORTS</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <section>
        <div className="section-inner">
          <div className="section-header reveal">
            <div><div className="section-label">// Recent Dispatches</div><div className="section-title">Latest Reports</div></div>
            <a href="#" className="section-link">Full Archive →</a>
          </div>
          <div className="intel-grid">
            <a href="#" className="article-card reveal reveal-delay-1">
              <div className="card-meta"><div className="card-category">Natl. Security</div><div className="card-date">FEB 14, 2026</div></div>
              <div className="card-title">The AUKUS Equation: Submarines, Strategy & the Indo-Pacific</div>
              <div className="card-excerpt">How the trilateral security pact is reshaping alliance architecture across the Pacific theater.</div>
              <div className="card-footer"><div className="card-read">Read →</div><div className="card-threat threat-med">■ MED</div></div>
            </a>
            <a href="#" className="article-card reveal reveal-delay-2">
              <div className="card-meta"><div className="card-category">Cybersecurity</div><div className="card-date">FEB 11, 2026</div></div>
              <div className="card-title">Zero-Day Diplomacy: When Exploits Become Leverage</div>
              <div className="card-excerpt">Nation-states are stockpiling software vulnerabilities as strategic assets in a new form of coercive diplomacy.</div>
              <div className="card-footer"><div className="card-read">Read →</div><div className="card-threat threat-high">■ HIGH</div></div>
            </a>
            <a href="#" className="article-card reveal reveal-delay-3">
              <div className="card-meta"><div className="card-category">Econ. Security</div><div className="card-date">FEB 8, 2026</div></div>
              <div className="card-title">Dollar Dominance Under Pressure: BRICS & the Reserve Currency Question</div>
              <div className="card-excerpt">The structural challenge to USD hegemony is real — but premature obituaries miss the full picture.</div>
              <div className="card-footer"><div className="card-read">Read →</div><div className="card-threat threat-low">■ LOW</div></div>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand-name">THE RUDD REPORT</div>
              <div className="footer-brand-tag">// Independent Strategic Analysis</div>
              <p className="footer-desc">Unclassified analysis on the intelligence, security, and geopolitical forces shaping our world.</p>
            </div>
            <div>
              <div className="footer-col-title">Coverage</div>
              <ul className="footer-links">{['Cybersecurity','Intelligence','Geopolitics','National Security','Economic Security'].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
            <div>
              <div className="footer-col-title">Navigate</div>
              <ul className="footer-links">{['Home','All Reports','About','Contact'].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
            <div>
              <div className="footer-col-title">Connect</div>
              <ul className="footer-links">{['Twitter / X','LinkedIn','RSS Feed','Newsletter'].map(l=><li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </div>
      </footer>
    </>
  );
}