'use client';
import { useState, useEffect, useRef } from 'react';

const HISTORY_KEY = 'osint_username_history';

// Platforms we CAN reliably check via the streaming API
const CHECKED = [
  { name: 'Bluesky',     url: 'https://bsky.app/profile/{}',               category: 'Social'   },
  { name: 'Mastodon',    url: 'https://mastodon.social/@{}',               category: 'Social'   },
  { name: 'GitHub',      url: 'https://github.com/{}',                     category: 'Dev'      },
  { name: 'GitLab',      url: 'https://gitlab.com/{}',                     category: 'Dev'      },
  { name: 'Codeberg',    url: 'https://codeberg.org/{}',                   category: 'Dev'      },
  { name: 'Dev.to',      url: 'https://dev.to/{}',                         category: 'Dev'      },
  { name: 'Hashnode',    url: 'https://hashnode.com/@{}',                  category: 'Dev'      },
  { name: 'HuggingFace', url: 'https://huggingface.co/{}',                 category: 'Dev'      },
  { name: 'Keybase',     url: 'https://keybase.io/{}',                     category: 'Dev'      },
  { name: 'NPM',         url: 'https://npmjs.com/~{}',                     category: 'Dev'      },
  { name: 'DockerHub',   url: 'https://hub.docker.com/u/{}',               category: 'Dev'      },
  { name: 'LeetCode',    url: 'https://leetcode.com/{}/profile',           category: 'Dev'      },
  { name: 'Codeforces',  url: 'https://codeforces.com/profile/{}',         category: 'Dev'      },
  { name: 'Patreon',     url: 'https://patreon.com/{}',                    category: 'Creative' },
  { name: 'ArtStation',  url: 'https://www.artstation.com/{}',             category: 'Creative' },
  { name: 'Roblox',      url: 'https://roblox.com/user.aspx?username={}', category: 'Gaming'   },
  { name: 'Minecraft',   url: 'https://namemc.com/profile/{}',             category: 'Gaming'   },
  { name: 'Lichess',     url: 'https://lichess.org/@/{}',                  category: 'Gaming'   },
  { name: 'Chess.com',   url: 'https://chess.com/member/{}',               category: 'Gaming'   },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/user?id={}',   category: 'Other'    },
  { name: 'Lobste.rs',   url: 'https://lobste.rs/u/{}',                    category: 'Other'    },
  { name: 'Duolingo',    url: 'https://www.duolingo.com/profile/{}',       category: 'Other'    },
];

// Platforms that block automated checks — links only
const MANUAL = [
  { name: 'Reddit',      url: 'https://reddit.com/user/{}',            category: 'Social'   },
  { name: 'Twitter / X', url: 'https://x.com/{}',                     category: 'Social'   },
  { name: 'Instagram',   url: 'https://instagram.com/{}',              category: 'Social'   },
  { name: 'TikTok',      url: 'https://tiktok.com/@{}',                category: 'Social'   },
  { name: 'LinkedIn',    url: 'https://linkedin.com/in/{}',            category: 'Social'   },
  { name: 'YouTube',     url: 'https://youtube.com/@{}',               category: 'Social'   },
  { name: 'Pinterest',   url: 'https://pinterest.com/{}',              category: 'Social'   },
  { name: 'Snapchat',    url: 'https://snapchat.com/add/{}',           category: 'Social'   },
  { name: 'Telegram',    url: 'https://t.me/{}',                       category: 'Social'   },
  { name: 'Tumblr',      url: 'https://{}.tumblr.com',                 category: 'Social'   },
  { name: 'Medium',      url: 'https://medium.com/@{}',                category: 'Social'   },
  { name: 'Substack',    url: 'https://{}.substack.com',               category: 'Social'   },
  { name: 'Twitch',      url: 'https://twitch.tv/{}',                  category: 'Gaming'   },
  { name: 'Steam',       url: 'https://steamcommunity.com/id/{}',      category: 'Gaming'   },
  { name: 'osu!',        url: 'https://osu.ppy.sh/users/{}',           category: 'Gaming'   },
  { name: 'Codepen',     url: 'https://codepen.io/{}',                 category: 'Dev'      },
  { name: 'Replit',      url: 'https://replit.com/@{}',                category: 'Dev'      },
  { name: 'Spotify',     url: 'https://open.spotify.com/user/{}',      category: 'Creative' },
  { name: 'SoundCloud',  url: 'https://soundcloud.com/{}',             category: 'Creative' },
  { name: 'Vimeo',       url: 'https://vimeo.com/{}',                  category: 'Creative' },
  { name: 'Behance',     url: 'https://behance.net/{}',                category: 'Creative' },
  { name: 'Flickr',      url: 'https://flickr.com/people/{}',          category: 'Creative' },
  { name: 'Dribbble',    url: 'https://dribbble.com/{}',               category: 'Creative' },
  { name: 'Itch.io',     url: 'https://{}.itch.io',                    category: 'Creative' },
  { name: 'Last.fm',     url: 'https://www.last.fm/user/{}',           category: 'Other'    },
  { name: 'Letterboxd',  url: 'https://letterboxd.com/{}',             category: 'Other'    },
];

type Status = 'checking' | 'found' | 'not_found' | 'error';

type Result = {
  platform: string;
  url: string;
  category: string;
  status: Status;
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }

  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 21px; font-weight: 700; color: #fff; }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: #1e9eff; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
  .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }

  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .back-bar { padding: 14px 40px; border-bottom: 1px solid rgba(30,158,255,0.07); }
  .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
  .back-link:hover { color: #1e9eff; }

  .hero { padding: 56px 40px 36px; border-bottom: 1px solid rgba(30,158,255,0.1); }
  .hero-inner { max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(22px, 3.5vw, 42px); font-weight: 900; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-desc { font-size: 14px; color: #7a9bb5; line-height: 1.7; max-width: 700px; }

  .search-wrap { max-width: 1100px; margin: 0 auto; padding: 32px 40px 0; }
  .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: rgba(10,21,32,0.8); }
  .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #c0cfe0; letter-spacing: 2px; }
  .search-input::placeholder { color: #3d5870; letter-spacing: 1px; }
  .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #000; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
  .search-btn:hover { background: #4db3ff; }
  .search-btn:disabled { background: #0d2233; color: #5a7a94; cursor: not-allowed; }

  .history-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .history-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
  .history-chip { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #5a7a94; background: rgba(30,158,255,0.04); border: 1px solid rgba(30,158,255,0.1); padding: 3px 10px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
  .history-chip:hover { color: #1e9eff; border-color: rgba(30,158,255,0.35); }

  .scan-status { max-width: 1100px; margin: 24px auto 0; padding: 0 40px; }
  .scan-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
  .scan-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
  .scan-text.pulse { animation: blink 1.2s infinite; }
  .scan-meta { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
  .scan-actions { display: flex; align-items: center; gap: 10px; }
  .action-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; background: none; border: 1px solid rgba(30,158,255,0.2); color: #5a7a94; padding: 6px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .action-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.5); }
  .action-btn.copied { color: #00ff88; border-color: rgba(0,255,136,0.4); }
  .progress-track { height: 2px; background: rgba(30,158,255,0.08); width: 100%; }
  .progress-fill { height: 2px; background: linear-gradient(90deg, #1e9eff, #00ff88); transition: width 0.5s ease; }

  .main-wrap { max-width: 1100px; margin: 0 auto; padding: 28px 40px 80px; display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }

  /* Checked results panel */
  .checked-panel { }
  .panel-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 12px; }
  .results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; }
  .r-card { background: #060d15; border: 1px solid rgba(30,158,255,0.07); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden; transition: border-color 0.25s, opacity 0.25s; }
  .r-card.found { background: #050f0a; border-color: rgba(0,255,136,0.25); }
  .r-card.found::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00ff88, rgba(0,255,136,0.3)); }
  .r-card.not_found { opacity: 0.18; }
  .r-card.checking { opacity: 0.45; }
  .r-card.error { border-color: rgba(255,170,0,0.18); }
  .r-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .r-name { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #9ab0c4; letter-spacing: 0.3px; }
  .r-card.found .r-name { color: #c8e8d0; font-size: 16px; }
  .r-cat { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #1e3550; text-transform: uppercase; flex-shrink: 0; }
  .r-status { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; }
  .r-status.found { color: #00ff88; }
  .r-status.not_found { color: #1e3550; }
  .r-status.checking { color: #1e5080; animation: blink 1.4s infinite; }
  .r-status.error { color: #7a5a00; }
  .r-link { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #00ff88; text-decoration: none; text-transform: uppercase; margin-top: 2px; display: inline-block; transition: opacity 0.2s; }
  .r-link:hover { opacity: 0.7; }
  .r-err-link { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 1px; color: #7a5a00; text-decoration: none; text-transform: uppercase; margin-top: 2px; display: inline-block; }
  .r-err-link:hover { color: #ffaa00; }
  .r-url { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #1a4428; letter-spacing: 0.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Manual links panel */
  .manual-panel { background: #050c18; border: 1px solid rgba(30,158,255,0.1); padding: 20px; }
  .manual-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .manual-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; }
  .manual-note { font-family: 'Barlow', sans-serif; font-size: 11px; color: #3d5870; line-height: 1.5; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.07); }
  .open-all-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #1e9eff; background: rgba(30,158,255,0.06); border: 1px solid rgba(30,158,255,0.2); padding: 5px 12px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
  .open-all-btn:hover { background: rgba(30,158,255,0.12); }
  .manual-list { display: flex; flex-direction: column; gap: 1px; }
  .manual-link { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: rgba(3,6,8,0.6); text-decoration: none; transition: all 0.2s; }
  .manual-link:hover { background: rgba(30,158,255,0.05); }
  .manual-link-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: #5a7a94; }
  .manual-link:hover .manual-link-name { color: #1e9eff; }
  .manual-link-cat { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #1e3550; text-transform: uppercase; }
  .manual-link-arrow { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #1e3550; }
  .manual-link:hover .manual-link-arrow { color: #1e9eff; }

  .empty-state { padding: 48px 40px; max-width: 1100px; margin: 0 auto; }
  .empty-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .empty-card { background: #040b14; border: 1px solid rgba(30,158,255,0.04); padding: 14px 16px; }
  .empty-name { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; color: #1e3550; letter-spacing: 0.3px; }
  .empty-cat { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #0d1e2e; text-transform: uppercase; margin-top: 4px; }

  footer { border-top: 1px solid rgba(30,158,255,0.08); padding: 28px 40px; background: #040810; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
  @media (max-width: 960px) { .main-wrap { grid-template-columns: 1fr; } .manual-panel { order: -1; } }
  @media (max-width: 768px) {
    nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
    .back-bar, .hero { padding-left: 20px; padding-right: 20px; }
    .search-wrap, .scan-status, .main-wrap, .empty-state, footer { padding-left: 20px; padding-right: 20px; }
    .hero { padding-top: 40px; padding-bottom: 28px; }
    .search-box { flex-direction: column; }
    .results-grid { grid-template-columns: 1fr; }
    .empty-grid { grid-template-columns: repeat(2, 1fr); }
    .footer-inner { flex-direction: column; gap: 8px; text-align: center; }
  }
`;

const STATUS_ORDER: Record<string, number> = { found: 0, error: 1, checking: 2, not_found: 3 };

export default function UsernameHunter() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(0);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [target, setTarget] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch {}
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setUsername(q); setTimeout(() => scan(q), 100); }
  }, []);

  const scan = async (override?: string) => {
    const t = (override ?? username).trim().replace(/^@+/, '');
    if (!t) return;
    setUsername(t);

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setTarget(t);
    setScanning(true);
    setDone(0);

    setHistory(prev => {
      const next = [t, ...prev.filter(h => h !== t)].slice(0, 6);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    const initial: Result[] = CHECKED.map(p => ({
      platform: p.name,
      url: p.url.replace('{}', encodeURIComponent(t)),
      category: p.category,
      status: 'checking' as Status,
    }));
    setResults(initial);

    try {
      const res = await fetch(`/api/username?u=${encodeURIComponent(t)}`, { signal: abort.signal });
      if (!res.body) throw new Error('no body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done: rdDone, value } = await reader.read();
        if (rdDone) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data: { platform: string; status: Status; url?: string } = JSON.parse(line);
            setResults(prev =>
              prev.map(r => r.platform === data.platform ? { ...r, status: data.status, url: data.url ?? r.url } : r)
            );
            setDone(d => d + 1);
          } catch {}
        }
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== 'AbortError') {
        setResults(prev => prev.map(r => r.status === 'checking' ? { ...r, status: 'error' } : r));
      }
    }

    setScanning(false);
  };

  const foundCount = results.filter(r => r.status === 'found').length;
  const total = CHECKED.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const sorted = [...results].sort((a, b) =>
    (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  );

  const copyFound = () => {
    const lines = results.filter(r => r.status === 'found').map(r => `${r.platform}: ${r.url}`).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openAllManual = () => {
    MANUAL.forEach(p => window.open(p.url.replace('{}', target), '_blank', 'noopener,noreferrer'));
  };

  const manualLinks = MANUAL.map(p => ({ ...p, url: p.url.replace('{}', target || '{}') }));

  return (
    <>
      <style>{STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
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

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" />
              <div className="hero-eyebrow-text">OSINT Hub · Identity Intelligence</div>
            </div>
            <div className="hero-title">Account <span>Finder</span></div>
            <p className="hero-desc">
              Scan {CHECKED.length} platforms via live API checks — social networks, developer communities, gaming, and more. Quick links for {MANUAL.length} additional platforms that block automated scanning.
            </p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter username — e.g. johndoe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !scanning && scan()}
            />
            <button className="search-btn" onClick={() => scan()} disabled={scanning || !username.trim()}>
              {scanning ? 'Scanning...' : 'Hunt →'}
            </button>
          </div>
          {history.length > 0 && (
            <div className="history-row">
              <span className="history-label">Recent:</span>
              {history.map(h => (
                <button key={h} className="history-chip" onClick={() => { setUsername(h); scan(h); }}>{h}</button>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <>
            <div className="scan-status">
              <div className="scan-top">
                <div className={`scan-text${scanning ? ' pulse' : ''}`}>
                  {scanning
                    ? `Scanning ${total} platforms...`
                    : `${foundCount} profile${foundCount !== 1 ? 's' : ''} confirmed across ${total} platforms`}
                </div>
                <div className="scan-actions">
                  <div className="scan-meta">{done}/{total}</div>
                  {!scanning && foundCount > 0 && (
                    <button className={`action-btn${copied ? ' copied' : ''}`} onClick={copyFound}>
                      {copied ? '✓ Copied' : `Copy ${foundCount} Found`}
                    </button>
                  )}
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="main-wrap">
              <div className="checked-panel">
                <div className="panel-label">API-verified results — {foundCount} found</div>
                <div className="results-grid">
                  {sorted.map((r, i) => (
                    <div key={i} className={`r-card ${r.status}`}>
                      <div className="r-top">
                        <div className="r-name">{r.platform}</div>
                        <div className="r-cat">{r.category}</div>
                      </div>
                      <div className={`r-status ${r.status}`}>
                        {r.status === 'found'     && '✓ Found'}
                        {r.status === 'not_found' && 'Not found'}
                        {r.status === 'checking'  && 'Checking...'}
                        {r.status === 'error'     && 'Check manually'}
                      </div>
                      {r.status === 'found' && (
                        <>
                          <div className="r-url">{r.url.replace('https://', '')}</div>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="r-link">View Profile →</a>
                        </>
                      )}
                      {r.status === 'error' && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="r-err-link">Open →</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="manual-panel">
                <div className="manual-header">
                  <div className="manual-title">Quick Links ({MANUAL.length})</div>
                  {target && (
                    <button className="open-all-btn" onClick={openAllManual}>Open All</button>
                  )}
                </div>
                <div className="manual-note">
                  These platforms block automated scanning. Links open directly with &ldquo;{target || 'username'}&rdquo; pre-filled.
                </div>
                <div className="manual-list">
                  {manualLinks.map(p => (
                    <a key={p.name} href={target ? p.url : '#'} target="_blank" rel="noopener noreferrer" className="manual-link">
                      <div>
                        <div className="manual-link-name">{p.name}</div>
                        <div className="manual-link-cat">{p.category}</div>
                      </div>
                      <div className="manual-link-arrow">↗</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="panel-label" style={{marginBottom:16}}>
              {CHECKED.length} platforms checked via API · {MANUAL.length} additional quick links
            </div>
            <div className="empty-grid">
              {CHECKED.map(p => (
                <div key={p.name} className="empty-card">
                  <div className="empty-name">{p.name}</div>
                  <div className="empty-cat">{p.category}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-copy">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}
