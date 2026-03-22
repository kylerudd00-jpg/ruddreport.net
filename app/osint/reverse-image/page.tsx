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
  const [menuOpen, setMenuOpen] = useState(false);

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
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
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 18px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .open-all-btn { margin-top: 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; display: inline-block; }
        .open-all-btn:hover { background: #4db8ff; }
        .open-all-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .engines-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 60px; }
        .engine-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 28px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.3s; position: relative; overflow: hidden; }
        .engine-card:hover { border-color: rgba(30,158,255,0.35); }
        .engine-card.manual-card { border-color: rgba(255,170,0,0.15); background: #0e0c08; }
        .engine-card.manual-card:hover { border-color: rgba(255,170,0,0.35); }
        .engine-card-top { display: flex; align-items: center; gap: 12px; }
        .engine-icon { font-size: 22px; line-height: 1; }
        .engine-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; letter-spacing: 1px; }
        .engine-best { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .engine-note { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #ffaa00; text-transform: uppercase; }
        .engine-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 10px 20px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .engine-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .engine-btn.manual-btn { color: #ffaa00; border-color: rgba(255,170,0,0.3); }
        .engine-btn.manual-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
        .engine-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .tips-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 32px; }
        .tips-header { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
        .tips-list { display: flex; flex-direction: column; gap: 12px; }
        .tip-item { display: flex; align-items: flex-start; gap: 16px; }
        .tip-num { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #1e9eff; letter-spacing: 2px; min-width: 24px; padding-top: 2px; }
        .tip-text { font-family: 'Barlow', sans-serif; font-size: 13px; color: #9ab0c4; line-height: 1.7; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @media (max-width: 900px) {
          .engines-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .engines-grid { grid-template-columns: 1fr; }
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
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </div>
        </nav>

        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">Visual Intelligence</div>
            </div>
            <div className="tool-title">Reverse Image Search</div>
            <p className="tool-desc">Find where an image appears across the web — identify fake profiles, track image origins, and verify photos</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Search input */}
          <div style={{marginBottom: '32px'}}>
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Paste image URL — e.g. https://example.com/photo.jpg"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="search-btn" onClick={handleSubmit} disabled={!isValid(imageUrl)}>
                Load Engines →
              </button>
            </div>
            {submitted && (
              <div style={{marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'}}>
                <button
                  className="open-all-btn"
                  onClick={openAll}
                  disabled={openingAll}
                >
                  {openingAll ? 'Opening...' : 'Search All Engines →'}
                </button>
                <span style={{fontFamily: "'IBM Plex Mono', monospace", fontSize: '9px', letterSpacing: '2px', color: '#3d5870', textTransform: 'uppercase'}}>
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
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
          </div>
        </footer>
      </div>
    </>
  );
}
