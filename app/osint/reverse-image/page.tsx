'use client';
import { useState } from 'react';

const ENGINES = [
  {
    name: 'Google Lens',
    icon: '🔍',
    best: 'Best for Western social media, news, and stock photos',
    buildUrl: (enc: string) => `https://lens.google.com/uploadbyurl?url=${enc}`,
    manual: false,
  },
  {
    name: 'TinEye',
    icon: '👁',
    best: 'Best for tracking where an image has appeared over time',
    buildUrl: (enc: string) => `https://tineye.com/search?url=${enc}`,
    manual: false,
  },
  {
    name: 'Yandex Images',
    icon: '🌐',
    best: 'Best for Eastern European/Russian sources — often finds more results',
    buildUrl: (enc: string) => `https://yandex.com/images/search?url=${enc}&rpt=imageview`,
    manual: false,
  },
  {
    name: 'Bing Visual Search',
    icon: '🔷',
    best: 'Good for Microsoft and LinkedIn ecosystem results',
    buildUrl: (enc: string) => `https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:${enc}`,
    manual: false,
  },
  {
    name: 'Baidu Images',
    icon: '🀄',
    best: 'Best for Chinese social media and websites',
    buildUrl: (enc: string) => `https://graph.baidu.com/details?isfromtusoupc=1&tn=pc&carousel=0&image=${enc}`,
    manual: false,
  },
  {
    name: 'OSINT Combine',
    icon: '⚡',
    best: 'Multi-engine aggregator — paste URL manually on their site',
    buildUrl: () => `https://www.osintcombine.com/reverse-image-search`,
    manual: true,
  },
];

const TIPS = [
  'Right-click any profile image → "Copy image address" → paste here',
  'Try cropping tightly to the face before searching for better match accuracy',
  'Yandex often finds matches that Google misses, especially for Russian-language content',
  'Use a direct image URL ending in .jpg/.png/.webp — not a page URL',
];

export default function ReverseImageSearch() {
  const [imageUrl, setImageUrl] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [openingAll, setOpeningAll] = useState(false);

  const isValid = (url: string) => url.trim().startsWith('http');

  const handleSubmit = () => {
    if (!isValid(imageUrl)) return;
    setSubmitted(imageUrl.trim());
  };

  const openAll = async () => {
    const target = submitted || imageUrl.trim();
    if (!isValid(target)) return;
    setOpeningAll(true);
    const enc = encodeURIComponent(target);
    for (let i = 0; i < ENGINES.length; i++) {
      const url = ENGINES[i].buildUrl(enc);
      window.open(url, '_blank');
      if (i < ENGINES.length - 1) await new Promise(r => setTimeout(r, 300));
    }
    setOpeningAll(false);
  };

  const enc = submitted ? encodeURIComponent(submitted) : '';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 18px 20px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #fff; background: var(--accent); border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .open-all-btn { margin-top: 16px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--bg-primary); background: var(--accent); border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; display: inline-block; }
        .open-all-btn:hover { background: #4db8ff; }
        .open-all-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .engines-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 60px; }
        .engine-card { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.3s; position: relative; overflow: hidden; }
        .engine-card:hover { border-color: var(--border-bright); }
        .engine-card.manual-card { border-color: rgba(255,170,0,0.15); background: #0e0c08; }
        .engine-card.manual-card:hover { border-color: rgba(255,170,0,0.35); }
        .engine-card-top { display: flex; align-items: center; gap: 12px; }
        .engine-icon { font-size: 22px; line-height: 1; }
        .engine-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; }
        .engine-best { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
        .engine-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; text-transform: uppercase; }
        .engine-btn { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); border: 1px solid var(--border-bright); background: none; padding: 10px 20px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .engine-btn:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }
        .engine-btn.manual-btn { color: #ffaa00; border-color: rgba(255,170,0,0.3); }
        .engine-btn.manual-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
        .engine-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        .tips-section { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; }
        .tips-header { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.02em; text-transform: uppercase; margin-bottom: 20px; }
        .tips-list { display: flex; flex-direction: column; gap: 12px; }
        .tip-item { display: flex; align-items: flex-start; gap: 16px; }
        .tip-num { font-family: var(--font-mono); font-size: 12px; color: var(--accent); letter-spacing: 0.05em; min-width: 24px; padding-top: 2px; }
        .tip-text { font-family: var(--font-display); font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 900px) {
          .engines-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .engines-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Visual Intelligence</div>
            </div>
            <h1 className="tool-title">Reverse Image Search</h1>
            <p className="tool-desc">Upload or link any image to search Google, TinEye, Yandex, and Bing simultaneously — finding every place that photo appears online. Used to expose fake profiles using stolen photos, trace the true origin of a viral image, and debunk disinformation using recycled or out-of-context media.</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Search input */}
          <div style={{marginBottom: '32px'}}>
            <div className="search-box">
              <input
                className="search-input"
                aria-label="Image URL to search"
                placeholder="Paste image URL — e.g. https://example.com/photo.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button type="button" className="search-btn" onClick={handleSubmit} disabled={!isValid(imageUrl)}>
                Load Engines →
              </button>
            </div>
            {submitted && (
              <div style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
                <button
                  type="button"
                  className="open-all-btn"
                  onClick={openAll}
                  disabled={openingAll}
                >
                  {openingAll ? 'Opening...' : 'Search All Engines →'}
                </button>
                <span style={{fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase'}}>
                  Opens all in new tabs with 300ms delay
                </span>
              </div>
            )}
          </div>

          {/* Engine cards */}
          <div style={{marginBottom: '12px'}}>
            <div className="section-label">Search Engines — {submitted ? 'Ready' : 'Enter URL Above to Enable'}</div>
          </div>
          <div className="engines-grid">
            {ENGINES.map((engine) => {
              const url = enc ? engine.buildUrl(enc) : '';
              const ready = !!submitted;
              return (
                <div key={engine.name} className={`engine-card${engine.manual ? ' manual-card' : ''}`}>
                  <div className="engine-card-top">
                    <div className="engine-icon">{engine.icon}</div>
                    <div className="engine-name">{engine.name}</div>
                  </div>
                  <div className="engine-best">{engine.best}</div>
                  {engine.manual && (
                    <div className="engine-note">Note: paste URL manually on their site</div>
                  )}
                  {ready ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`engine-btn${engine.manual ? ' manual-btn' : ''}`}
                    >
                      Open Search →
                    </a>
                  ) : (
                    <span className="engine-btn disabled">Open Search →</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="tips-section">
            <div className="tips-header">OSINT Tips for Reverse Image Search</div>
            <div className="tips-list">
              {TIPS.map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-num">0{i + 1}</div>
                  <div className="tip-text">{tip}</div>
                </div>
              ))}
            </div>
          </div>
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
