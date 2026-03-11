import { getArticleBySlug, ARTICLES } from '@/lib/articles';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const relevanceColor = article.relevance === 'HIGH' ? '#ff3a3a' : article.relevance === 'MED' ? '#ffaa00' : '#00ff88';

  const paragraphs = article.content.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} style={{ fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 700, color: '#c0cfe0', letterSpacing: '2px', textTransform: 'uppercase', margin: '48px 0 20px', paddingBottom: '12px', borderBottom: '1px solid rgba(30,158,255,0.15)' }}>{block.slice(3)}</h2>;
    }
    return <p key={i} style={{ fontSize: '16px', fontWeight: 300, color: '#a0b8cc', lineHeight: 1.9, marginBottom: '24px' }}>{block}</p>;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #fff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .article-body { padding: 40px 20px 80px !important; }
          .article-header { padding: 100px 20px 40px !important; }
        }
      `}</style>

      <nav>
        <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
        <ul className="nav-links">
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#00ff88' }}>OSINT Hub</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className="hamburger" onClick={() => document.getElementById('articleMenu')?.classList.toggle('open')}>
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="articleMenu">
        <button className="mobile-menu-close" onClick={() => document.getElementById('articleMenu')?.classList.remove('open')}>✕ Close</button>
        <a href="/">Home</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/about">About</a>
      </div>

      {/* Header */}
      <div className="article-header" style={{ padding: '120px 40px 60px', borderBottom: '1px solid rgba(30,158,255,0.12)', background: 'linear-gradient(180deg, rgba(30,158,255,0.04) 0%, transparent 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <a href="/" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '3px', color: '#3d5870', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block', marginBottom: '32px' }}>← Back to Home</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#1e9eff', border: '1px solid rgba(30,158,255,0.3)', padding: '3px 10px', textTransform: 'uppercase' }}>{article.category}</span>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: '#3d5870' }}>{article.date}</span>
            <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: relevanceColor }}>■ {article.relevance} RELEVANCE</span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: '#c0cfe0', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '0.5px' }}>{article.title}</h1>
          <p style={{ fontSize: '18px', fontWeight: 300, color: '#7a9bb5', lineHeight: 1.7, borderLeft: '2px solid #1e9eff', paddingLeft: '20px' }}>{article.excerpt}</p>
        </div>
      </div>

      {/* Body */}
      <div className="article-body" style={{ padding: '60px 40px 120px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {paragraphs}

          <div style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(30,158,255,0.12)', fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '3px', color: '#3d5870', textTransform: 'uppercase' }}>
            The Rudd Report — Unclassified // For Public Release
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid rgba(30,158,255,0.12)', padding: '40px', background: '#070d12' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: '#3d5870' }}>© 2026 <span style={{ color: '#1e9eff' }}>The Rudd Report</span> — All Rights Reserved</div>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '4px', color: '#3d5870', border: '1px solid rgba(30,158,255,0.12)', padding: '5px 14px', textTransform: 'uppercase' }}>UNCLASSIFIED // FOR PUBLIC RELEASE</div>
        </div>
      </footer>
    </>
  );
}