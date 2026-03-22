'use client';
import { Lock, Eye, Globe } from 'lucide-react';


export default function About() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-primary); color: var(--text-primary); font-family: 'Barlow', sans-serif; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; position: relative; }
        .nav-links a::after { content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 1px; background: var(--accent); transform: scaleX(0); transition: transform 0.3s; }
        .nav-links a:hover { color: var(--accent); }
        .nav-links a:hover::after { transform: scaleX(1); }
        .nav-links a.active { color: var(--accent); }
        .nav-links a.active::after { transform: scaleX(1); }
        .nav-status { display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--text-muted); letter-spacing: 2px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #1e9eff;  animation: pulse 2s infinite; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; z-index: 200; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--accent); transition: all 0.3s; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; backdrop-filter: blur(20px); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: var(--silver); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .mobile-menu a:hover { color: var(--accent); }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; color: var(--text-muted); cursor: pointer; text-transform: uppercase; background: none; border: none; }

        .page-wrap { padding-top: 70px; min-height: 100vh; }

        .hero { position: relative; padding: 80px 40px 60px; overflow: hidden; border-bottom: 1px solid var(--border); }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(30,158,255,0.06) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .hero-eyebrow-line { width: 60px; height: 1px; background: var(--accent);  }
        .hero-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: var(--accent); text-transform: uppercase; }
        .hero-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(36px, 5vw, 68px); font-weight: 900; color: var(--silver); text-transform: uppercase; letter-spacing: 2px; line-height: 1.05; margin-bottom: 8px; }
        .hero-title span { color: transparent; -webkit-text-stroke: 1px var(--accent); }
        .hero-subtitle { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; margin-bottom: 24px; }
        .hero-bio { font-size: 15px; font-weight: 300; color: var(--text-secondary); line-height: 1.9; margin-bottom: 28px; }
        .hero-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 32px; }
        .hero-tag { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: var(--text-muted); border: 1px solid rgba(30,158,255,0.15); padding: 5px 12px; text-transform: uppercase; }
        .hero-socials { display: flex; gap: 10px; }
        .social-btn { padding: 11px 22px; border: 1px solid var(--border); font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: var(--text-secondary); text-decoration: none; text-transform: uppercase; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
        .social-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
        .social-btn.primary { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 700; }
        .social-btn.primary:hover { background: transparent; color: var(--accent); }

        @keyframes scanDown { 0% { top: 0; opacity: 0.35; } 100% { top: 100%; opacity: 0; } }

        .credentials { padding: 80px 40px; border-bottom: 1px solid var(--border); }
        .credentials-inner { max-width: 1200px; margin: 0 auto; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 700; color: var(--silver); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 48px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .cred-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .cred-card { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; position: relative; overflow: hidden; transition: all 0.3s; }
        .cred-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); opacity: 0; transition: opacity 0.3s; }
        .cred-card:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .cred-card:hover::before { opacity: 1; }
        .cred-org { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; }
        .cred-role { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: var(--text-primary); line-height: 1.2; margin-bottom: 10px; }
        .cred-detail { font-size: 13px; font-weight: 300; color: var(--text-muted); line-height: 1.7; }
        .cred-year { position: absolute; top: 32px; right: 32px; font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--text-muted); letter-spacing: 2px; }

        .mission { padding: 80px 40px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); }
        .mission-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 2fr; gap: 80px; align-items: start; }
        .mission-left {}
        .mission-quote { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(24px, 3vw, 40px); font-weight: 400; color: var(--text-primary); line-height: 1.5; font-style: italic; padding-left: 24px; border-left: 3px solid var(--accent); }
        .mission-right {}
        .mission-text { font-size: 15px; font-weight: 300; color: var(--text-secondary); line-height: 1.9; margin-bottom: 20px; }

        .focus-areas { padding: 80px 40px; border-bottom: 1px solid var(--border); }
        .focus-inner { max-width: 1200px; margin: 0 auto; }
        .focus-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 0; }
        .focus-card { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; transition: all 0.3s; position: relative; overflow: hidden; }
        .focus-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); transform: scaleX(0); transition: transform 0.4s; }
        .focus-card:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .focus-card:hover::after { transform: scaleX(1); }
        .focus-icon { margin-bottom: 16px; display: block; color: #1e9eff; opacity: 0.7; }
        .focus-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: var(--silver); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
        .focus-desc { font-size: 13px; font-weight: 300; color: var(--text-muted); line-height: 1.7; }

        footer { position: relative; z-index: 3; border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        .footer-classify { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: var(--text-muted); border: 1px solid var(--border); padding: 5px 14px; text-transform: uppercase; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes signalPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .nav-status { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 40px 20px; }
          .hero-inner { grid-template-columns: 1fr; }
          .credentials { padding: 60px 20px; }
          .cred-grid { grid-template-columns: 1fr; }
          .mission { padding: 60px 20px; }
          .mission-inner { grid-template-columns: 1fr; gap: 40px; }
          .focus-areas { padding: 60px 20px; }
          .focus-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
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
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about" className="active">About</a></li>
          </ul>
          <div className="nav-status">
            <span>LIVE</span>
            <div className="signal-bar"><span /><span /><span /><span /></div>
          </div>
          <div className="hamburger" onClick={() => document.getElementById('mobileMenuAbout')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="mobileMenuAbout">
          <button className="mobile-menu-close" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>✕ Close</button>
          <a href="/" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>Home</a>
          <a href="/cybersecurity" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>Cybersecurity</a>
          <a href="/intelligence" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>Intelligence</a>
          <a href="/geopolitics" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>Geopolitics</a>
          <a href="/national-security" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>National Security</a>
          <a href="/osint" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')} style={{color:'#1e9eff'}}>OSINT Hub</a>
          <a href="/about" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>About</a>
          <a href="/contact" onClick={() => document.getElementById('mobileMenuAbout')?.classList.remove('open')}>Contact</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-left">
              <div className="hero-eyebrow">
                <div className="hero-eyebrow-line" />
                <div className="hero-eyebrow-text">Personnel File — Analyst Profile</div>
              </div>
              <h1 className="hero-title">Kyle<br /><span>Rudd</span></h1>
              <div className="hero-subtitle">Intelligence Researcher & Strategic Analyst</div>
              <p className="hero-bio">
                From the halls of Cambridge to the corridors of the Department of Homeland Security, Kyle Rudd has spent his early career at the intersection of intelligence, cybersecurity, and national security policy — building a rare analytical perspective grounded in both academic rigor and operational experience.
              </p>
              <div className="hero-tags">
                <span className="hero-tag">DHS Intern</span>
                <span className="hero-tag">Cambridge Scholar</span>
                <span className="hero-tag">ODNI IC-CAE</span>
                <span className="hero-tag">IR + Economics</span>
                <span className="hero-tag">Intelligence Studies</span>
              </div>
              <div className="hero-socials">
                <a href="https://www.linkedin.com/in/kyle-rudd-68209b252/" target="_blank" rel="noopener noreferrer" className="social-btn primary">↗ LinkedIn</a>
                <a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer" className="social-btn">↗ X / Twitter</a>
              </div>
            </div>
          </div>
        </div>

        <div className="credentials">
          <div className="credentials-inner">
            <div className="section-label">Service Record</div>
            <div className="section-title">Key Credentials</div>
            <div className="cred-grid">
              <div className="cred-card">
                <div className="cred-org">University of Cambridge</div>
                <div className="cred-role">International Security & Intelligence Programme</div>
                <div className="cred-detail">Full scholarship recipient. Evaluated U.S.–UK intelligence-sharing frameworks for disrupting transnational cybercrime networks and improving real-time coordination across allied systems.</div>
                <div className="cred-year">2025</div>
              </div>
              <div className="cred-card">
                <div className="cred-org">Dept. of Homeland Security</div>
                <div className="cred-role">Intelligence & Cybercrime Intern</div>
                <div className="cred-detail">Supported cross-border cybercrime investigations and inter-agency intelligence exchange operations — working at the frontline of federal cybersecurity response.</div>
                <div className="cred-year">2024</div>
              </div>
              <div className="cred-card">
                <div className="cred-org">ODNI — IC-CAE Program</div>
                <div className="cred-role">IC-CAE Scholar</div>
                <div className="cred-detail">Selected by the Office of the Director of National Intelligence for intelligence analysis and cybersecurity research — one of a small cohort of scholars bridging academia and the intelligence community.</div>
                <div className="cred-year">2024–</div>
              </div>
              <div className="cred-card">
                <div className="cred-org">Afghanistan War Commission</div>
                <div className="cred-role">Research Contributor</div>
                <div className="cred-detail">Contributed research to the official commission examining the full scope of U.S. involvement in Afghanistan — a landmark historical and policy undertaking.</div>
                <div className="cred-year">2024</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mission">
          <div className="mission-inner">
            <div className="mission-left">
              <div className="section-label">Mission Statement</div>
              <div className="mission-quote">"Make serious national security analysis accessible to everyone — not just insiders."</div>
            </div>
            <div className="mission-right">
              <div className="section-label" style={{marginBottom: '20px'}}>About The Rudd Report</div>
              <p className="mission-text">The Rudd Report was built on a simple premise: the most consequential decisions in the world — about war, intelligence, technology, and power — are made with information most people never see. That needs to change.</p>
              <p className="mission-text">In an era of information overload, The Rudd Report cuts through noise to deliver intelligence-informed analysis on the issues that actually shape the global order. No spin. No partisanship. Just rigorous, evidence-based perspective from someone who has worked inside the systems being analyzed.</p>
              <p className="mission-text">Currently pursuing dual degrees in International Relations and Economics with a minor in Intelligence Studies at the University of South Florida's Judy Genshaft Honors College — and building a career at the intersection of intelligence analysis, federal law enforcement, and national security research.</p>
            </div>
          </div>
        </div>

        <div className="focus-areas">
          <div className="focus-inner">
            <div className="section-label">Areas of Focus</div>
            <div className="section-title">Research Domains</div>
            <div className="focus-grid">
              <div className="focus-card">
                <span className="focus-icon"><Lock size={28} strokeWidth={1.5} /></span>
                <div className="focus-name">Cybersecurity</div>
                <div className="focus-desc">State-sponsored threat actors, critical infrastructure vulnerabilities, zero-day diplomacy, and the evolving landscape of offensive cyber operations.</div>
              </div>
              <div className="focus-card">
                <span className="focus-icon"><Eye size={28} strokeWidth={1.5} /></span>
                <div className="focus-name">Intelligence</div>
                <div className="focus-desc">Intelligence-sharing frameworks, Five Eyes coordination, IC reform, and the analytical tradecraft behind operationally relevant assessment.</div>
              </div>
              <div className="focus-card">
                <span className="focus-icon"><Globe size={28} strokeWidth={1.5} /></span>
                <div className="focus-name">U.S. Foreign Policy</div>
                <div className="focus-desc">Alliance architecture, strategic competition with China and Russia, economic coercion, and the geopolitical forces reshaping the post-unipolar world.</div>
              </div>
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            
          </div>
        </footer>
      </div>
    </>
  );
}