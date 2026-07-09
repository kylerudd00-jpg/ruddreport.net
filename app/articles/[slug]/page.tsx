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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* PAGE HEADER */
        .page-header { padding: 120px 40px 60px; background: linear-gradient(180deg, rgba(30,158,255,0.05) 0%, transparent 100%); border-bottom: 1px solid var(--border); }
        .page-header-inner { max-width: 1200px; margin: 0 auto; }
        .page-eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .page-eyebrow::before { content: ''; display: inline-block; width: 40px; height: 1px; background: var(--accent); }
        .page-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 52px); font-weight: 700; color: #fff; letter-spacing: -0.01em; margin-bottom: 16px; }
        .page-subtitle { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .page-subtitle span { color: var(--accent); }

        /* CONTROLS */
        .controls { padding: 28px 40px; border-bottom: 1px solid var(--border); background: rgba(8,8,10,0.85); position: sticky; top: 70px; z-index: 50; backdrop-filter: blur(20px); }
        .controls-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .search-wrap { position: relative; }
        .search-prefix { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); pointer-events: none; }
        .search-input { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; padding: 11px 16px 11px 90px; transition: border-color 0.3s; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-input:focus { border-color: var(--accent); }
        .category-filters { display: flex; flex-wrap: wrap; gap: 6px; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 6px 14px; border: 1px solid var(--border-bright); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(255,255,255,0.6); color: var(--text-primary); }
        .filter-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }

        /* RESULTS BAR */
        .results-bar { max-width: 1200px; margin: 0 auto; padding: 20px 40px 0; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .results-bar span { color: var(--accent); }

        /* ARTICLES GRID */
        .articles-grid { max-width: 1200px; margin: 24px auto 0; padding: 0 40px 100px; display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1px; }
        .article-card { display: block; text-decoration: none; background: var(--bg-card); border: 1px solid var(--border); padding: 28px; transition: all 0.3s; position: relative; overflow: hidden; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(30,158,255,0.4), transparent); opacity: 0; transition: opacity 0.3s; }
        .article-card:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .article-card:hover::before { opacity: 1; }
        .card-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .card-category { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); border: 1px solid rgba(30,158,255,0.3); padding: 3px 10px; background: rgba(30,158,255,0.06); }
        .card-date { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .card-featured { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 3px 10px; }
        .card-title { font-family: var(--font-display); font-size: 21px; font-weight: 700; color: var(--text-primary); line-height: 1.2; margin-bottom: 10px; transition: color 0.3s; }
        .article-card:hover .card-title { color: #fff; }
        .card-excerpt { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.75; margin-bottom: 20px; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border); }
        .card-time { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .card-read { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); transition: letter-spacing 0.3s; }
        .article-card:hover .card-read { letter-spacing: 0.06em; }

        /* EMPTY STATE */
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 80px 20px; }
        .empty-title { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .empty-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        /* FOOTER */
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        @media (max-width: 768px) {
          .page-header { padding: 100px 20px 40px; }
          .controls { padding: 20px 16px; top: 70px; }
          .results-bar { padding: 16px 20px 0; }
          .articles-grid { padding: 0 16px 60px; grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-inner { flex-direction: column; gap: 10px; }
        }
      `}</style>

      <main id="main">
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
                aria-label="Search reports"
                placeholder="Search by title, topic, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
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
        <div className="results-bar" aria-live="polite">
          <span>{filtered.length}</span> REPORT{filtered.length !== 1 ? 'S' : ''} FOUND
          {searchQuery.trim() && (
            <span style={{ color: 'var(--text-muted)' }}> — "{searchQuery}"</span>
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
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color }}>
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
