'use client';
import { getArticlesByCategory } from '@/lib/articles';
import { Shield } from 'lucide-react';

function CategoryPage({ category, eyebrow, tagline, blurb, personalNote, icon, articles }: any) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .hero { position: relative; padding: 80px 40px; overflow: hidden; border-bottom: 1px solid var(--border); }
        .hero::before { content: ''; position: absolute; top: -300px; right: -200px; width: 800px; height: 800px; background: radial-gradient(circle, rgba(30,158,255,0.07) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .hero-eyebrow-line { width: 60px; height: 1px; background: #1e9eff; }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(36px, 6vw, 72px); font-weight: 700; color: #fff; letter-spacing: -0.5px; line-height: 1.05; margin-bottom: 12px; }
        .hero-tagline { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #1e9eff; text-transform: uppercase; margin-bottom: 28px; }
        .hero-blurb { font-size: 16px; font-weight: 400; color: var(--text-secondary); line-height: 1.9; margin-bottom: 24px; }
        .hero-note { font-size: 14px; font-weight: 400; line-height: 1.8; padding: 20px 24px; border-left: 2px solid #1e9eff; background: rgba(30,158,255,0.04); font-style: italic; color: var(--text-muted); }
        .hero-icon-box { display: flex; align-items: center; justify-content: center; opacity: 0.1; color: #1e9eff; }
        .articles { padding: 80px 40px; max-width: 1200px; margin: 0 auto; }
        .articles-header { margin-bottom: 48px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .articles-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: #1e9eff; text-transform: uppercase; margin-bottom: 8px; }
        .articles-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.2px; }
        .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .article-card { position: relative; background: var(--bg-card); border: 1px solid var(--border-bright); padding: 32px; overflow: hidden; text-decoration: none; display: block; transition: all 0.4s ease; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #1e9eff, transparent); transform: scaleX(0); transition: transform 0.5s ease; }
        .article-card:hover { background: var(--bg-card-hover); border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .article-card:hover::before { transform: scaleX(1); }
        .card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .card-category { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: #1e9eff; border: 1px solid var(--border-bright); padding: 3px 10px; background: rgba(30,158,255,0.08); }
        .card-date { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .card-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); line-height: 1.2; margin-bottom: 12px; transition: color 0.3s; }
        .article-card:hover .card-title { color: #1e9eff; }
        .card-excerpt { font-size: 13px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; margin-bottom: 24px; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border); }
        .card-read { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #1e9eff; text-transform: uppercase; }
        .threat-high { color: var(--red); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .threat-med { color: #ffaa00; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .threat-low { color: #1e9eff; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; }
        .coming-soon { text-align: center; padding: 60px 40px; border: 1px dashed var(--border); margin-top: 2px; }
        .coming-soon-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 80px; }
        .footer-bottom { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: #1e9eff; }
        @media (max-width: 768px) {
          .hero { padding: 40px 20px; }
          .hero-inner { grid-template-columns: 1fr; gap: 32px; }
          .hero-icon-box { display: none; }
          .hero-title { font-size: 36px; }
          .hero-note { font-size: 13px; }
          .articles { padding: 40px 20px; }
          .articles-grid { grid-template-columns: 1fr; }
          .article-card { padding: 24px; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">{eyebrow}</div></div>
              <h1 className="hero-title">{category}</h1>
              <div className="hero-tagline">{tagline}</div>
              <p className="hero-blurb">{blurb}</p>
              <div className="hero-note">{personalNote}</div>
            </div>
            <div className="hero-icon-box" aria-hidden="true">{icon}</div>
          </div>
        </div>
        <div className="articles">
          <div className="articles-header">
            <div className="articles-label">Latest Reports</div>
            <h2 className="articles-title">{category} Analysis</h2>
          </div>
          <div className="articles-grid">
            {articles.map((a: any, i: number) => (
              <a href={`/articles/${a.slug}`} className="article-card" key={i}>
                <div className="card-meta"><div className="card-category">{a.category}</div><div className="card-date">{a.date}</div></div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">{a.excerpt}</div>
                <div className="card-footer">
                  <div className="card-read">Read Analysis →</div>
                  <div className={`threat-${a.relevance.toLowerCase()}`}>■ {a.relevance} RELEVANCE</div>
                </div>
              </a>
            ))}
          </div>
          <div className="coming-soon"><div className="coming-soon-text">More reports incoming — check back soon</div></div>
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

export default function NationalSecurity() {
  const articles = getArticlesByCategory('National Security');
  return <CategoryPage category="National Security" eyebrow="Domain: Defense & Security" tagline="NATIONAL SECURITY ANALYSIS" blurb="National security sits at the intersection of military strategy, intelligence, diplomacy, and domestic policy. Protecting the homeland in the 21st century requires understanding threats that are increasingly hybrid, diffuse, and digital." personalNote="My internship with the Department of Homeland Security gave me direct exposure to how national security policy translates into operational reality. This section examines the decisions, doctrines, and dilemmas that define American security." icon={<Shield size={120} strokeWidth={0.75} />} articles={articles} />;
}
