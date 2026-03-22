import { ImageResponse } from 'next/og';
import { getArticleBySlug, ARTICLES } from '@/lib/articles';

export const alt = 'The Rudd Report';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  const title = article?.title ?? 'The Rudd Report';
  const category = article?.category ?? '';
  const relevance = article?.relevance ?? '';
  const relevanceColor = relevance === 'HIGH' ? '#ff3a3a' : relevance === 'MED' ? '#ffaa00' : '#1e9eff';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: '#030608',
          position: 'relative',
        }}
      >
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(30,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,158,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Left accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1e9eff' }} />
        {/* Top: site name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <span style={{ fontFamily: 'serif', fontSize: 20, fontWeight: 700, color: '#ffffff' }}>The Rudd Report</span>
          <div style={{ width: 1, height: 20, background: 'rgba(30,158,255,0.3)' }} />
          {category && (
            <span style={{ fontFamily: 'sans-serif', fontSize: 12, letterSpacing: 3, color: '#1e9eff', textTransform: 'uppercase' }}>{category}</span>
          )}
          {relevance && (
            <span style={{ fontFamily: 'sans-serif', fontSize: 11, letterSpacing: 2, color: relevanceColor, marginLeft: 8 }}>■ {relevance} RELEVANCE</span>
          )}
        </div>
        {/* Middle: article title */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{
            fontFamily: 'serif',
            fontSize: title.length > 60 ? 42 : title.length > 40 ? 52 : 62,
            fontWeight: 700,
            color: '#c0cfe0',
            lineHeight: 1.15,
            maxWidth: 960,
          }}>
            {title}
          </div>
        </div>
        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#3d5870', letterSpacing: 2 }}>
            ruddreport.net · Kyle Rudd
          </span>
          <span style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#3d5870', letterSpacing: 2, border: '1px solid rgba(30,158,255,0.15)', padding: '4px 12px' }}>
            READ FULL ANALYSIS →
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
