'use client';
import { useState, useMemo } from 'react';
import { ARTICLES, Article, getReadingTime } from '@/lib/articles';

const CATEGORIES = [
  'All',
  'Cybersecurity',
  'Intelligence',
  'Geopolitics',
  'National Security',
  'Economic Security',
] as const;

const rc = (relevance: string) =>
  relevance === 'HIGH' ? '#ff3a3a' : relevance === 'MED' ? '#ffaa00' : '#1e9eff';

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'Cybersecurity': return '#ff4444';
    case 'Intelligence': return '#b464ff';
    case 'Geopolitics': return '#ffaa00';
    case 'National Security': return '#22cc66';
    case 'Economic Security': return '#00c9b0';
    default: return '#1e9eff';
  }
}

export default function ArticlesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [activeCategory, searchQuery]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; min-height: 100vh; }

        /* NAV */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        /* PAGE HEADER */
        .page-header { padding: 120px 40px 60px; background: linear-gradient(180deg, rgba(30,158,255,0.05) 0%, transparent 100%); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .page-eyebrow::before { content: ''; display: inline-block; width: 40px; height: 1px; background: #1e9eff; }
        .page-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 52px); font-weight: 700; color: #c0cfe0; letter-spacing: -0.5px; margin-bottom: 16px; }
        .page-subtitle { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .page-subtitle span { color: #1e9eff; }

        /* CONTROLS */
        .controls { padding: 28px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); background: rgba(3,6,8,0.85); position: sticky; top: 70px; z-index: 50; backdrop-filter: blur(20px); }
        .controls-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .search-wrap { position: relative; }
        .search-prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1px; color: #5a7a94; pointer-events: none; }
        .search-input { width: 100%; background: rgba(10,21,32,0.8); border: 1px solid rgba(30,158,255,0.15); color: #d8e8f5; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; padding: 11px 16px 11px 90px; outline: none; transition: border-color 0.3s; }
        .search-input::placeholder { color: #5a7a94; }
        .search-input:focus { border-color: rgba(30,158,255,0.4); }
        .category-filters { display: flex; flex-wrap: wrap; gap: 6px; }
        .filter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; padding: 6px 14px; border: 1px solid rgba(30,158,255,0.2); background: transparent; color: #7a9bb5; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(30,158,255,0.5); color: #c0cfe0; }
        .filter-btn.active { background: rgba(30,158,255,0.12); border-color: rgba(30,158,255,0.5); color: #1e9eff; }

        /* RESULTS BAR */
        .results-bar { max-width: 1200px; margin: 0 auto; padding: 20px 40px 0; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
        .results-bar span { color: #1e9eff; }

        /* ARTICLES GRID */
        .articles-grid { max-width: 1200px; margin: 24px auto 0; padding: 0 40px 100px; display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1px; }
        .article-card { display: block; text-decoration: none; background: rgba(10,21,32,0.5); border: 1px solid rgba(30,158,255,0.1); padding: 28px; transition: all 0.3s; position: relative; overflow: hidden; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(30,158,255,0.4), transparent); opacity: 0; transition: opacity 0.3s; }
        .article-card:hover { border-color: rgba(30,158,255,0.3); background: rgba(10,21,32,0.8); }
        .article-card:hover::before { opacity: 1; }
        .card-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .card-category { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); padding: 3px 10px; background: rgba(30,158,255,0.06); }
        .card-date { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 2px; color: #5a7a94; }
        .card-featured { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 2px; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 3px 10px; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #c0cfe0; line-height: 1.2; margin-bottom: 10px; transition: color 0.3s; }
        .article-card:hover .card-title { color: #fff; }
        .card-excerpt { font-size: 14px; font-weight: 400; color: #9ab0c4; line-height: 1.75; margin-bottom: 20px; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(30,158,255,0.08); }
        .card-time { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; }
        .card-read { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #1e9eff; transition: letter-spacing 0.3s; }
        .article-card:hover .card-read { letter-spacing: 3px; }

        /* EMPTY STATE */
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 20px; }
        .empty-title { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; margin-bottom: 10px; }
        .empty-sub { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: #1e2a35; }

        /* FOOTER */
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        .footer-copy span { color: #1e9eff; }

        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .page-header { padding: 100px 20px 40px; }
          .controls { padding: 20px 16px; top: 70px; }
          .results-bar { padding: 16px 20px 0; }
          .articles-grid { padding: 0 16px 60px; grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-inner { flex-direction: column; gap: 10px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-text">The Rudd Report</div>
        </a>
        <ul className="nav-links">
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div
          className="hamburger"
          onClick={() => document.getElementById('articlesMobileMenu')?.classList.toggle('open')}
        >
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="articlesMobileMenu">
        <button
          className="mobile-menu-close"
          onClick={() => document.getElementById('articlesMobileMenu')?.classList.remove('open')}
        >
          ✕ Close
        </button>
        <a href="/">Home</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/about">About</a>
      </div>

      {/* HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-eyebrow">Intelligence Database</div>
          <h1 className="page-title">All Reports</h1>
          <div className="page-subtitle">
            <span>{ARTICLES.length}</span> Reports Published
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="controls">
        <div className="controls-inner">
          <div className="search-wrap">
            <span className="search-prefix">Search</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
                style={activeCategory === cat && cat !== 'All' ? {
                  color: getCategoryColor(cat),
                  borderColor: `${getCategoryColor(cat)}60`,
                  background: `${getCategoryColor(cat)}12`,
                } : {}}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS COUNT */}
      <div className="results-bar">
        <span>{filtered.length}</span> REPORT{filtered.length !== 1 ? 'S' : ''} FOUND
        {searchQuery.trim() && (
          <span style={{ color: '#5a7a94' }}> — "{searchQuery}"</span>
        )}
      </div>

      {/* GRID */}
      <div className="articles-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">No Reports Found</div>
            <div className="empty-sub">Adjust your search or filter criteria</div>
          </div>
        ) : (
          filtered.map(article => <ArticleCard key={article.slug} article={article} />)
        )}
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-copy">
            © 2026 The Rudd Report
          </div>
          
        </div>
      </footer>
    </>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const readingTime = getReadingTime(article.content);
  const color = rc(article.relevance);

  return (
    <a href={`/articles/${article.slug}`} className="article-card">
      <div className="card-meta">
        <span className="card-category" style={{color: getCategoryColor(article.category), borderColor: `${getCategoryColor(article.category)}40`, background: `${getCategoryColor(article.category)}10`}}>{article.category}</span>
        <span className="card-date">{article.date}</span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '2px', color }}>
          ■ {article.relevance}
        </span>
        {article.featured && <span className="card-featured">FEATURED</span>}
      </div>
      <h2 className="card-title">{article.title}</h2>
      <p className="card-excerpt">{article.excerpt}</p>
      <div className="card-footer">
        <span className="card-time">{readingTime} MIN READ</span>
        <span className="card-read">READ REPORT →</span>
      </div>
    </a>
  );
}
