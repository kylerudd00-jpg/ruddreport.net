'use client';

export default function Contact() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; min-height: 100vh; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .page { padding-top: 70px; min-height: 100vh; display: flex; flex-direction: column; }
        .header { padding: 80px 40px 60px; border-bottom: 1px solid rgba(30,158,255,0.12); background: linear-gradient(180deg, rgba(30,158,255,0.04) 0%, transparent 100%); }
        .header-inner { max-width: 860px; margin: 0 auto; }
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .page-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: #c0cfe0; letter-spacing: -0.5px; margin-bottom: 20px; line-height: 1.1; }
        .page-sub { font-size: 16px; font-weight: 400; color: #7a9bb5; line-height: 1.7; max-width: 560px; }

        .body { padding: 60px 40px 100px; max-width: 860px; margin: 0 auto; width: 100%; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 60px; }
        .contact-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 32px; text-decoration: none; display: block; transition: all 0.3s; position: relative; overflow: hidden; }
        .contact-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #1e9eff; transform: scaleY(0); transition: transform 0.3s; transform-origin: bottom; }
        .contact-card:hover { background: #0f1e2e; border-color: rgba(30,158,255,0.3); }
        .contact-card:hover::before { transform: scaleY(1); }
        .card-platform { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; margin-bottom: 12px; }
        .card-name { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #c0cfe0; margin-bottom: 8px; transition: color 0.3s; }
        .contact-card:hover .card-name { color: #fff; }
        .card-handle { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #7a9bb5; margin-bottom: 16px; }
        .card-action { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }

        .email-section { border-top: 1px solid rgba(30,158,255,0.12); padding-top: 40px; }
        .email-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 16px; }
        .email-link { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #c0cfe0; text-decoration: none; display: inline-flex; align-items: center; gap: 12px; transition: color 0.3s; }
        .email-link:hover { color: #1e9eff; }
        .email-note { margin-top: 12px; font-size: 13px; color: #5a7a94; line-height: 1.7; }

        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: auto; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }

        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .header { padding: 60px 20px 40px; }
          .body { padding: 40px 20px 60px; }
          .contact-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
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
          <li><a href="/about">About</a></li>
        </ul>
        <div className="hamburger" onClick={() => document.getElementById('contactMenu')?.classList.toggle('open')}>
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="contactMenu">
        <button className="mobile-menu-close" onClick={() => document.getElementById('contactMenu')?.classList.remove('open')}>✕ Close</button>
        <a href="/">Home</a>
        <a href="/articles">All Reports</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/about">About</a>
      </div>

      <div className="page">
        <div className="header">
          <div className="header-inner">
            <div className="eyebrow">
              <div className="eyebrow-line" />
              <div className="eyebrow-text">Get In Touch</div>
            </div>
            <h1 className="page-title">Contact</h1>
            <p className="page-sub">The best way to reach me is on LinkedIn or X. I'm open to media inquiries, research collaboration, and analytical discussion.</p>
          </div>
        </div>

        <div className="body">
          <div className="contact-grid">
            <a href="https://www.linkedin.com/in/kyle-rudd-68209b252/" target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="card-platform">Professional</div>
              <div className="card-name">LinkedIn</div>
              <div className="card-handle">Kyle Rudd</div>
              <p className="email-note">For media inquiries, research collaboration, or general correspondence. I read everything.</p>
              <div className="card-action" style={{marginTop: '20px'}}>Connect →</div>
            </a>
            <a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="card-platform">Social</div>
              <div className="card-name">X / Twitter</div>
              <div className="card-handle">@KyleRudd44</div>
              <div className="card-action">Follow →</div>
            </a>
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
          </div>
        </footer>
      </div>
    </>
  );
}
