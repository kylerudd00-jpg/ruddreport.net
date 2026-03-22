'use client';
import { useState } from 'react';

const PLATFORMS = [
  // Social
  { name: 'Reddit', url: 'https://reddit.com/user/{}', category: 'Social' },
  { name: 'Twitter / X', url: 'https://x.com/{}', category: 'Social' },
  { name: 'TikTok', url: 'https://tiktok.com/@{}', category: 'Social', checkable: false },
  { name: 'YouTube', url: 'https://youtube.com/@{}', category: 'Social' },
  { name: 'Twitch', url: 'https://twitch.tv/{}', category: 'Social' },
  { name: 'Snapchat', url: 'https://snapchat.com/add/{}', category: 'Social' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/{}', category: 'Social', checkable: false },
  { name: 'Pinterest', url: 'https://pinterest.com/{}', category: 'Social', checkable: false },
  { name: 'Tumblr', url: 'https://{}.tumblr.com', category: 'Social' },
  { name: 'Medium', url: 'https://medium.com/@{}', category: 'Social' },
  { name: 'Substack', url: 'https://{}.substack.com', category: 'Social' },
  { name: 'Telegram', url: 'https://t.me/{}', category: 'Social' },
  { name: 'Spotify', url: 'https://open.spotify.com/user/{}', category: 'Social', checkable: false },
  { name: 'SoundCloud', url: 'https://soundcloud.com/{}', category: 'Social' },
  { name: 'Vimeo', url: 'https://vimeo.com/{}', category: 'Social' },
  { name: 'Patreon', url: 'https://patreon.com/{}', category: 'Social' },
  { name: 'Bluesky', url: 'https://bsky.app/profile/{}', category: 'Social' },
  { name: 'Last.fm', url: 'https://www.last.fm/user/{}', category: 'Social' },
  { name: 'Letterboxd', url: 'https://letterboxd.com/{}', category: 'Social' },
  { name: 'Bandcamp', url: 'https://{}.bandcamp.com', category: 'Social' },
  { name: 'Behance', url: 'https://www.behance.net/{}', category: 'Social' },
  // Dev
  { name: 'GitHub', url: 'https://github.com/{}', category: 'Dev' },
  { name: 'GitLab', url: 'https://gitlab.com/{}', category: 'Dev' },
  { name: 'Dev.to', url: 'https://dev.to/{}', category: 'Dev' },
  { name: 'Hashnode', url: 'https://hashnode.com/@{}', category: 'Dev' },
  { name: 'Hugging Face', url: 'https://huggingface.co/{}', category: 'Dev' },
  { name: 'Keybase', url: 'https://keybase.io/{}', category: 'Dev' },
  { name: 'NPM', url: 'https://npmjs.com/~{}', category: 'Dev' },
  { name: 'Codepen', url: 'https://codepen.io/{}', category: 'Dev' },
  { name: 'Replit', url: 'https://replit.com/@{}', category: 'Dev' },
  // Forums
  { name: 'Hacker News', url: 'https://news.ycombinator.com/user?id={}', category: 'Forums' },
  { name: 'Lobste.rs', url: 'https://lobste.rs/u/{}', category: 'Forums' },
  // Gaming
  { name: 'Steam', url: 'https://steamcommunity.com/id/{}', category: 'Gaming' },
  { name: 'Roblox', url: 'https://roblox.com/user.aspx?username={}', category: 'Gaming' },
  { name: 'Minecraft', url: 'https://namemc.com/profile/{}', category: 'Gaming' },
  { name: 'Lichess', url: 'https://lichess.org/@/{}', category: 'Gaming' },
  { name: 'Chess.com', url: 'https://chess.com/member/{}', category: 'Gaming' },
  { name: 'osu!', url: 'https://osu.ppy.sh/users/{}', category: 'Gaming' },
];

type Result = {
  platform: string;
  url: string;
  category: string;
  status: 'found' | 'not_found' | 'checking' | 'manual';
};

export default function UsernameHunter() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('All');
  const [copied, setCopied] = useState(false);

  const copyFound = () => {
    const found = results.filter(r => r.status === 'found');
    const text = found.map(r => `${r.platform}: ${r.url}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const scan = async () => {
    if (!username.trim()) return;
    setScanning(true);
    setFilter('All');

    const initial: Result[] = PLATFORMS.map(p => ({
      platform: p.name,
      url: p.url.replace('{}', username.trim()),
      category: p.category,
      status: p.checkable === false ? 'manual' : 'checking',
    }));
    setResults(initial);

    const updated = [...initial];

    await Promise.all(
      PLATFORMS.map(async (p, i) => {
        if (p.checkable === false) return;
        try {
          const res = await fetch(`/api/username?username=${encodeURIComponent(username.trim())}&platform=${encodeURIComponent(p.name.toLowerCase())}`);
          const data = await res.json();
          updated[i] = { ...updated[i], status: data.found ? 'found' : 'not_found' };
        } catch {
          updated[i] = { ...updated[i], status: 'not_found' };
        }
        setResults([...updated]);
      })
    );

    setScanning(false);
  };

  const categories = ['All', 'Social', 'Dev', 'Gaming', 'Forums'];
  const filtered = filter === 'All' ? results : results.filter(r => r.category === filter);
  const foundCount = results.filter(r => r.status === 'found').length;
  const checkableCount = PLATFORMS.filter(p => p.checkable !== false).length;

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
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .status-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1100px; margin: 0 auto; border: 1px solid rgba(30,158,255,0.1); background: rgba(10,21,32,0.8); }
        .status-scanning { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; animation: blink 1s infinite; }
        .status-done { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
        .status-count { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .copy-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 6px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .copy-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
        .copy-btn.copied { color: #1e9eff; border-color: #1e9eff; }
        .filters { display: flex; gap: 2px; padding: 20px 40px 0; max-width: 1100px; margin: 0 auto; }
        .filter-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .filter-btn.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; padding: 20px 40px 80px; max-width: 1100px; margin: 0 auto; }
        .result-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all 0.3s; position: relative; overflow: hidden; }
        .result-card.found { border-color: rgba(30,158,255,0.25); background: #0a1f18; }
        .result-card.found::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #1e9eff; }
        .result-card.not_found { opacity: 0.3; }
        .result-card.checking { opacity: 0.6; }
        .result-card.manual { border-color: rgba(255,170,0,0.2); background: #12100a; }
        .result-card.manual::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: #ffaa00; }
        .card-top { display: flex; align-items: center; justify-content: space-between; }
        .card-platform { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; }
        .card-category { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; border: 1px solid rgba(30,158,255,0.1); padding: 2px 6px; }
        .card-status { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
        .card-status.found { color: #1e9eff; }
        .card-status.not_found { color: #3d5870; }
        .card-status.checking { color: #1e9eff; animation: blink 1s infinite; }
        .card-status.manual { color: #ffaa00; }
        .card-link { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #1e9eff; text-decoration: none; transition: color 0.3s; margin-top: 4px; }
        .card-link:hover { color: #4dffaa; }
        .card-link-manual { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #ffaa00; text-decoration: none; transition: color 0.3s; margin-top: 4px; }
        .card-link-manual:hover { color: #ffd04d; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .status-bar { padding: 12px 20px; flex-direction: column; gap: 8px; align-items: flex-start; }
          .filters { padding: 16px 20px 0; flex-wrap: wrap; }
          .results-grid { grid-template-columns: repeat(2, 1fr); padding: 16px 20px 60px; }
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
          <div className="hamburger" onClick={() => document.getElementById('usernameMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="usernameMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('usernameMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">OSINT Hub — Identity Intelligence</div>
            </div>
            <div className="tool-title">Username Hunter</div>
            <p className="tool-desc">Check if a username exists across {PLATFORMS.length} platforms simultaneously — social media, developer communities, gaming networks, forums, and more. Results update in real time. Platforms that block automated checks are flagged for manual verification.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter username to hunt — e.g. johndoe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scan()}
            />
            <button className="search-btn" onClick={scan} disabled={scanning}>
              {scanning ? 'Scanning...' : 'Hunt →'}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <>
            <div className="status-bar">
              <div>
                {scanning
                  ? <div className="status-scanning">Scanning ...</div>
                  : <div className="status-done">Scan complete — {foundCount} profile{foundCount !== 1 ? 's' : ''} found</div>
                }
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                <div className="status-count">
                  {results.filter(r => r.status === 'checking').length > 0
                    ? `${results.filter(r => r.status === 'checking').length} remaining...`
                    : `${checkableCount} platforms checked`
                  }
                </div>
                {!scanning && foundCount > 0 && (
                  <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copyFound}>
                    {copied ? '✓ Copied' : `Copy ${foundCount} Found`}
                  </button>
                )}
              </div>
            </div>

            <div className="filters">
              {categories.map(c => (
                <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
              ))}
            </div>

            <div className="results-grid">
              {filtered.map((r, i) => (
                <div key={i} className={`result-card ${r.status}`}>
                  <div className="card-top">
                    <div className="card-platform">{r.platform}</div>
                    <div className="card-category">{r.category}</div>
                  </div>
                  <div className={`card-status ${r.status}`}>
                    {r.status === 'found' && '✓ Found'}
                    {r.status === 'not_found' && '✗ Not Found'}
                    {r.status === 'checking' && 'Checking...'}
                    {r.status === 'manual' && '⚠ Manual Check'}
                  </div>
                  {r.status === 'found' && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="card-link">
                      View Profile →
                    </a>
                  )}
                  {r.status === 'manual' && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="card-link-manual">
                      Verify Manually →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
            
          </div>
        </footer>
      </div>
    </>
  );
}