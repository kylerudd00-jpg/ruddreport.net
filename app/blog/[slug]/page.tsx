'use client';
import { use } from 'react';
import { getArticle } from '../../lib/articles';

export default function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = getArticle(slug);

  if (!article) {
    return (
      <>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
          .not-found { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 24px; }
          .nf-code { font-family: 'Orbitron', monospace; font-size: 80px; font-weight: 900; color: transparent; -webkit-text-stroke: 1px rgba(30,158,255,0.4); }
          .nf-text { font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; }
          .nf-btn { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; text-decoration: none; border: 1px solid rgba(30,158,255,0.3); padding: 12px 24px; text-transform: uppercase; }
        `}</style>
        <div className="not-found">
          <div className="nf-code">404</div>
          <div className="nf-text">// Article not found</div>
          <a href="/" className="nf-btn">↩ Return To Base</a>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; line-height: 1.2; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; backdrop-filter: blur(20px); }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu a:hover { color: #1e9eff; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .article-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); max-width: 900px; margin: 0 auto; }
        .article-back { display: inline-flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; margin-bottom: 32px; transition: color 0.3s; }
        .article-back:hover { color: #1e9eff; }
        .article-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .article-category { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); padding: 4px 12px; background: rgba(30,158,255,0.08); }
        .article-date { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .threat-high { color: #ff3a3a; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .threat-med { color: #ffaa00; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .threat-low { color: #00ff88; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; }
        .article-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: #d8e8f5; line-height: 1.1; margin-bottom: 20px; }
        .article-excerpt { font-size: 18px; font-weight: 300; color: #7a9bb5; line-height: 1.8; padding: 20px 24px; border-left: 3px solid #1e9eff; background: rgba(30,158,255,0.04); }
        .article-body { max-width: 900px; margin: 0 auto; padding: 60px 40px 100px; }
        .article-section { margin-bottom: 48px; }
        .article-heading { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: #c0cfe0; letter-spacing: 1px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .article-paragraph { font-size: 17px; font-weight: 300; color: #a0b8cc; line-height: 1.95; }
        .article-divider { width: 60px; height: 1px; background: #1e9eff; margin: 60px 0; box-shadow: 0 0 8px #1e9eff; }
        .article-footer { max-width: 900px; margin: 0 auto; padding: 40px; border-top: 1px solid rgba(30,158,255,0.12); display: flex; align-items: center; justify-content: space-between; }
        .article-author { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .article-author span { color: #1e9eff; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .article-hero { padding: 40px 20px 30px; }
          .article-body { padding: 40px 20px 60px; }
          .article-footer { flex-direction: column; gap: 12px; padding: 30px 20px; }
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
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('blogMobileMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="blogMobileMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('blogMobileMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/intelligence">Intelligence</a>
          <a href="/geopolitics">Geopolitics</a>
          <a href="/national-security">National Security</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>

        <div className="article-hero">
          <a href="/" className="article-back">← Back to Reports</a>
          <div className="article-meta">
            <div className="article-category">{article.category}</div>
            <div className="article-date">{article.date}</div>
            <div className={`threat-${article.threat}`}>■ {article.threat.toUpperCase()} RELEVANCE</div>
          </div>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-excerpt">{article.excerpt}</div>
        </div>

        <div className="article-body">
          {article.content.map((section, i) => (
            <div className="article-section" key={i}>
              {section.heading && <div className="article-heading">{section.heading}</div>}
              <p className="article-paragraph">{section.body}</p>
            </div>
          ))}
          <div className="article-divider" />
        </div>

        <div className="article-footer">
          <div className="article-author">Analysis by <span>Kyle Rudd</span> — The Rudd Report</div>
          <a href="/" className="article-back">← Back to Reports</a>
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