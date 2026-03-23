'use client';
import { useState } from 'react';

const PLATFORMS = [
  { name: 'Facebook', desc: 'Search people by name — shows profiles, public posts, and pages', buildUrl: (name: string) => `https://www.facebook.com/search/people/?q=${encodeURIComponent(name)}` },
  { name: 'LinkedIn', desc: 'Find professional profiles — employer, location, work history', buildUrl: (name: string) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}` },
  { name: 'Twitter / X', desc: 'Search accounts and posts — shows bio matches and name matches', buildUrl: (name: string) => `https://twitter.com/search?q=${encodeURIComponent(name)}&f=user` },
  { name: 'Instagram', desc: 'Searches tags and accounts — requires login to see full results', buildUrl: (name: string) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}` },
  { name: 'TikTok', desc: 'Search for accounts and videos posted under this name', buildUrl: (name: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(name)}` },
  { name: 'YouTube', desc: 'Find channels and videos associated with this name', buildUrl: (name: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}&sp=EgIQAg%3D%3D` },
  { name: 'Reddit', desc: 'Search for usernames and posts mentioning this name', buildUrl: (name: string) => `https://www.reddit.com/search/?q="${encodeURIComponent(name)}"&type=user` },
  { name: 'Pinterest', desc: 'Find public boards and profiles linked to this name', buildUrl: (name: string) => `https://www.pinterest.com/search/users/?q=${encodeURIComponent(name)}` },
  { name: 'Google (All Social)', desc: 'Search all major social platforms at once via Google', buildUrl: (name: string) => `https://www.google.com/search?q="${encodeURIComponent(name)}"+site:facebook.com+OR+site:instagram.com+OR+site:twitter.com+OR+site:linkedin.com+OR+site:tiktok.com` },
  { name: 'Google (News)', desc: 'Find news articles, press mentions, and public records', buildUrl: (name: string) => `https://www.google.com/search?q="${encodeURIComponent(name)}"&tbm=nws` },
];

export default function SocialSearch() {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openingAll, setOpeningAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = () => { if (name.trim()) setSubmitted(true); };

  const openAll = async () => {
    if (!name.trim()) return;
    setOpeningAll(true);
    for (let i = 0; i < PLATFORMS.length; i++) {
      window.open(PLATFORMS[i].buildUrl(name.trim()), '_blank');
      if (i < PLATFORMS.length - 1) await new Promise(r => setTimeout(r, 300));
    }
    setOpeningAll(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
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
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; margin-bottom: 16px; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 18px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; }
        .search-input::placeholder { color: #5a7a94; font-size: 13px; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #000; background: #1e9eff; border: none; padding: 18px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #5a7a94; cursor: not-allowed; }
        .open-all-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #000; background: #1e9eff; border: none; padding: 12px 28px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; }
        .open-all-btn:hover { background: #4db8ff; }
        .open-all-btn:disabled { background: #1a3a52; color: #5a7a94; cursor: not-allowed; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .platforms-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .platform-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 24px 26px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
        .platform-card:hover { border-color: rgba(30,158,255,0.3); }
        .platform-name { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .platform-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .platform-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 9px 16px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .platform-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .platform-btn.disabled { color: #5a7a94; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .tips-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 32px; margin-top: 40px; }
        .tips-header { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
        .tips-list { display: flex; flex-direction: column; gap: 12px; }
        .tip-item { display: flex; align-items: flex-start; gap: 16px; }
        .tip-num { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #1e9eff; letter-spacing: 2px; min-width: 24px; padding-top: 2px; }
        .tip-text { font-family: 'Barlow', sans-serif; font-size: 13px; color: #9ab0c4; line-height: 1.7; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        @media (max-width: 900px) { .platforms-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; } .platforms-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; } .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(o => !o)}><span /><span /><span /></div>
        </nav>
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
        </div>

        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow"><div className="tool-eyebrow-line" /><div className="tool-eyebrow-text">Social Media</div></div>
            <div className="tool-title">Social Media Name Search</div>
            <p className="tool-desc">Search for someone by real name across Facebook, LinkedIn, Twitter, Instagram, TikTok, YouTube, Reddit, and more — all at once. Enter a full name and open each platform in its own tab.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div style={{marginBottom:'32px'}}>
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Full name — e.g. John Smith"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button className="search-btn" onClick={handleSubmit} disabled={!name.trim()}>Search →</button>
            </div>
            {submitted && (
              <div style={{display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
                <button className="open-all-btn" onClick={openAll} disabled={openingAll}>
                  {openingAll ? 'Opening...' : 'Open All Platforms →'}
                </button>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',letterSpacing:'2px',color:'#5a7a94',textTransform:'uppercase'}}>Opens 10 tabs with 300ms delay</span>
              </div>
            )}
          </div>

          <div style={{marginBottom:'12px'}}>
            <div className="section-label">Platforms — {submitted ? `Searching for "${name}"` : 'Enter Name Above to Enable'}</div>
          </div>
          <div className="platforms-grid">
            {PLATFORMS.map(platform => {
              const url = submitted ? platform.buildUrl(name.trim()) : '';
              return (
                <div key={platform.name} className="platform-card">
                  <div className="platform-name">{platform.name}</div>
                  <div className="platform-desc">{platform.desc}</div>
                  {submitted ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="platform-btn">Open →</a>
                  ) : (
                    <span className="platform-btn disabled">Open →</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="tips-section">
            <div className="tips-header">Tips</div>
            <div className="tips-list">
              {[
                'Use full name in quotes for more precise results — this tool adds quotes automatically for Google searches.',
                'LinkedIn is the most reliable for finding real people — especially for professional verification.',
                'Facebook search requires being logged in to see most results.',
                'If the name is common, add a city or employer to the search box to narrow it down.',
                'Google (All Social) is the most powerful — it searches Facebook, Instagram, Twitter, LinkedIn, and TikTok simultaneously.',
              ].map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-num">0{i + 1}</div>
                  <div className="tip-text">{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-copy">Social Media Name Search</div>
          </div>
        </footer>
      </div>
    </>
  );
}
