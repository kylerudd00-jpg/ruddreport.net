'use client';

export default function Contact() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page { padding-top: 70px; min-height: 100vh; display: flex; flex-direction: column; }
        .header { padding: 80px 40px 60px; border-bottom: 1px solid var(--border); background: linear-gradient(180deg, rgba(30,158,255,0.04) 0%, transparent 100%); }
        .header-inner { max-width: 860px; margin: 0 auto; }
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
        .page-title { font-family: var(--font-display); font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: #fff; letter-spacing: -0.01em; margin-bottom: 20px; line-height: 1.1; }
        .page-sub { font-size: 16px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; max-width: 560px; }

        .body { padding: 60px 40px 100px; max-width: 860px; margin: 0 auto; width: 100%; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 60px; }
        .contact-card { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; text-decoration: none; display: block; transition: all 0.3s; position: relative; overflow: hidden; }
        .contact-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--accent); transform: scaleY(0); transition: transform 0.3s; transform-origin: bottom; }
        .contact-card:hover { background: var(--bg-card-hover); border-color: var(--border-bright); }
        .contact-card:hover::before { transform: scaleY(1); }
        .card-platform { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
        .card-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; transition: color 0.3s; }
        .contact-card:hover .card-name { color: #fff; }
        .card-handle { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
        .card-action { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }

        .email-section { border-top: 1px solid var(--border); padding-top: 40px; }
        .email-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        .email-link { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 12px; transition: color 0.3s; }
        .email-link:hover { color: var(--accent); }
        .email-note { margin-top: 12px; font-size: 13px; color: var(--text-muted); line-height: 1.7; }

        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: auto; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        @media (max-width: 768px) {
          .header { padding: 60px 20px 40px; }
          .body { padding: 40px 20px 60px; }
          .contact-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
        }
      `}</style>

      <main id="main" className="page">
        <div className="header">
          <div className="header-inner">
            <div className="eyebrow">
              <div className="eyebrow-line" aria-hidden="true" />
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
              <h2 className="card-name">LinkedIn</h2>
              <div className="card-handle">Kyle Rudd</div>
              <p className="email-note">For media inquiries, research collaboration, or general correspondence. I read everything.</p>
              <div className="card-action" style={{marginTop: '20px'}}>Connect →</div>
            </a>
            <a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer" className="contact-card">
              <div className="card-platform">Social</div>
              <h2 className="card-name">X / Twitter</h2>
              <div className="card-handle">@KyleRudd44</div>
              <div className="card-action">Follow →</div>
            </a>
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
