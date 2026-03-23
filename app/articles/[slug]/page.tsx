import { getArticleBySlug, getReadingTime, getTableOfContents, getRelatedArticles, ARTICLES } from '@/lib/articles';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ShareButtons from './ShareButtons';
import ArticleNav from './ArticleNav';
import TocSidebar from './TocSidebar';

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  const url = `https://ruddreport.net/articles/${article.slug}`;
  return {
    title: `${article.title} | The Rudd Report`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      siteName: 'The Rudd Report',
      type: 'article',
      publishedTime: article.date,
      authors: ['Kyle Rudd'],
      tags: [article.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      site: '@KyleRudd44',
      creator: '@KyleRudd44',
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const readingTime = getReadingTime(article.content);
  const toc = getTableOfContents(article.content);
  const related = getRelatedArticles(slug);
  const relevanceColor =
    article.relevance === 'HIGH' ? '#ff3a3a' : article.relevance === 'MED' ? '#ffaa00' : '#1e9eff';

  const categoryColor = (() => {
    switch (article.category) {
      case 'Cybersecurity': return '#ff4444';
      case 'Intelligence': return '#b464ff';
      case 'Geopolitics': return '#ffaa00';
      case 'National Security': return '#22cc66';
      case 'Economic Security': return '#00c9b0';
      default: return '#1e9eff';
    }
  })();

  // Build content blocks with anchor IDs on headings
  const blocks = article.content.split('\n\n').map((block, i) => {
    if (block.startsWith('## ')) {
      const text = block.slice(3).trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      return { type: 'heading' as const, text, id, key: i };
    }
    return { type: 'paragraph' as const, text: block, key: i };
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }

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

        /* HEADER */
        .article-header { padding: 120px 40px 60px; border-bottom: 1px solid rgba(30,158,255,0.12); background: linear-gradient(180deg, rgba(30,158,255,0.04) 0%, transparent 100%); }
        .article-header-inner { max-width: 860px; margin: 0 auto; }
        .back-link { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; display: inline-block; margin-bottom: 32px; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .article-meta { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
        .meta-category { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); padding: 3px 10px; text-transform: uppercase; }
        .meta-date { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .meta-time { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .meta-sep { color: #1e2a35; }
        .article-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4.5vw, 52px); font-weight: 700; color: #c0cfe0; line-height: 1.15; margin-bottom: 24px; letter-spacing: -0.5px; }
        .article-excerpt { font-size: 18px; font-weight: 400; color: #9ab0c4; line-height: 1.7; border-left: 2px solid #1e9eff; padding-left: 20px; }

        /* BODY LAYOUT */
        .article-body { padding: 60px 40px 80px; }
        .article-body-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 240px; gap: 60px; align-items: start; }

        /* ARTICLE CONTENT */
        .article-content { min-width: 0; }
        .content-h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #c0cfe0; letter-spacing: -0.2px; margin: 48px 0 18px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.12); scroll-margin-top: 90px; }
        .content-p { font-size: 16px; font-weight: 400; color: #b8ccdc; line-height: 1.95; margin-bottom: 22px; }

        /* SHARE + FOOTER */
        .article-sign-off { margin-top: 60px; padding-top: 40px; border-top: 1px solid rgba(30,158,255,0.12); font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }

        /* RELATED ARTICLES */
        .related { max-width: 1200px; margin: 0 auto; padding: 60px 40px 100px; border-top: 1px solid rgba(30,158,255,0.08); }
        .related-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 28px; display: flex; align-items: center; gap: 12px; }
        .related-label::after { content: ''; flex: 1; height: 1px; background: rgba(30,158,255,0.1); }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1px; }
        .related-card { display: block; text-decoration: none; background: rgba(10,21,32,0.5); border: 1px solid rgba(30,158,255,0.1); padding: 24px; transition: all 0.3s; }
        .related-card:hover { border-color: rgba(30,158,255,0.3); background: rgba(10,21,32,0.8); }
        .related-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .related-card-cat { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .related-card-date { font-family: 'Barlow Condensed', sans-serif; font-size: 8px; letter-spacing: 2px; color: #3d5870; }
        .related-card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #c0cfe0; line-height: 1.2; margin-bottom: 8px; transition: color 0.3s; }
        .related-card:hover .related-card-title { color: #fff; }
        .related-card-excerpt { font-size: 13px; font-weight: 400; color: #9ab0c4; line-height: 1.65; }

        /* TOC SIDEBAR */
        .toc-sidebar { position: sticky; top: 90px; }
        .toc-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .toc-list { list-style: none; display: flex; flex-direction: column; gap: 2px; }
        .toc-item a { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1px; color: #3d5870; text-decoration: none; padding: 6px 0 6px 12px; border-left: 1px solid rgba(30,158,255,0.1); transition: all 0.2s; line-height: 1.5; }
        .toc-item a:hover { color: #1e9eff; border-left-color: rgba(30,158,255,0.5); padding-left: 16px; }

        /* FOOTER */
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .footer-copy { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }

        @media (max-width: 1024px) {
          .article-body-inner { grid-template-columns: 1fr; }
          .toc-sidebar { position: static; background: rgba(10,21,32,0.5); border: 1px solid rgba(30,158,255,0.1); padding: 20px; margin-bottom: 40px; order: -1; }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .article-header { padding: 90px 20px 32px; }
          .article-excerpt { font-size: 15px; }
          .article-body { padding: 32px 20px 48px; }
          .article-body-inner { grid-template-columns: 1fr; }
          .toc-sidebar { position: static; background: rgba(10,21,32,0.5); border: 1px solid rgba(30,158,255,0.1); padding: 16px; margin-bottom: 32px; order: -1; }
          .content-h2 { font-size: 17px; }
          .content-p { font-size: 15px; }
          .related { padding: 32px 20px 48px; }
          .related-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-inner { flex-direction: column; gap: 10px; }
        }
      `}</style>

      {/* NAV */}
      <ArticleNav />

      {/* HEADER */}
      <div className="article-header">
        <div className="article-header-inner">
          <a href="/articles" className="back-link">← All Reports</a>
          <div className="article-meta">
            <span className="meta-category" style={{color: categoryColor, borderColor: `${categoryColor}50`, background: `${categoryColor}10`}}>{article.category}</span>
            <span className="meta-date">{article.date}</span>
            <span className="meta-sep">·</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: relevanceColor }}>
              ■ {article.relevance} RELEVANCE
            </span>
            <span className="meta-sep">·</span>
            <span className="meta-time">{readingTime} MIN READ</span>
          </div>
          <h1 className="article-title">{article.title}</h1>
          <p className="article-excerpt">{article.excerpt}</p>
        </div>
      </div>

      {/* BODY */}
      <div className="article-body">
        <div className="article-body-inner">
          {/* MAIN CONTENT */}
          <div className="article-content">
            {blocks.map(block =>
              block.type === 'heading' ? (
                <h2 key={block.key} id={block.id} className="content-h2">
                  {block.text}
                </h2>
              ) : (
                <p key={block.key} className="content-p">
                  {block.text}
                </p>
              ),
            )}

            {/* SHARE BUTTONS */}
            <div style={{ marginTop: '48px' }}>
              <ShareButtons title={article.title} slug={article.slug} />
            </div>

            {/* AUTHOR BYLINE */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(30,158,255,0.12)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(30,158,255,0.1)', border: '1px solid rgba(30,158,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#1e9eff', flexShrink: 0 }}>K</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: '#c0cfe0', marginBottom: '4px' }}>Kyle Rudd</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#3d5870', textTransform: 'uppercase' }}>Intelligence Researcher · DHS · Cambridge · ODNI IC-CAE</div>
              </div>
            </div>

            {/* SIGN-OFF */}
            <div className="article-sign-off" style={{ marginTop: '24px' }}>
              Analysis by Kyle Rudd — The Rudd Report
            </div>
          </div>

          {/* TOC SIDEBAR */}
          <TocSidebar toc={toc} />
        </div>
      </div>

      {/* RELATED ARTICLES */}
      {related.length > 0 && (
        <div className="related">
          <div className="related-label">Related Reports</div>
          <div className="related-grid">
            {related.map(r => {
              const rColor =
                r.relevance === 'HIGH' ? '#ff3a3a' : r.relevance === 'MED' ? '#ffaa00' : '#1e9eff';
              const rCatColor = (() => { switch (r.category) { case 'Cybersecurity': return '#ff4444'; case 'Intelligence': return '#b464ff'; case 'Geopolitics': return '#ffaa00'; case 'National Security': return '#22cc66'; case 'Economic Security': return '#00c9b0'; default: return '#1e9eff'; } })();
              return (
                <a key={r.slug} href={`/articles/${r.slug}`} className="related-card">
                  <div className="related-card-meta">
                    <span className="related-card-cat" style={{color: rCatColor}}>{r.category}</span>
                    <span style={{ color: '#1e2a35' }}>·</span>
                    <span className="related-card-date">{r.date}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '8px', letterSpacing: '2px', color: rColor }}>
                      ■ {r.relevance}
                    </span>
                  </div>
                  <div className="related-card-title">{r.title}</div>
                  <div className="related-card-excerpt">{r.excerpt}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <footer>
        <div className="footer-inner">
          <div className="footer-copy">
            © 2026 The Rudd Report — All Rights Reserved
          </div>
          
        </div>
      </footer>
    </>
  );
}
