'use client';
import { useState, useEffect, useRef } from 'react';

const HISTORY_KEY = 'osint_username_history';

const PLATFORMS_CLIENT = [
  { name: 'Twitter / X',  url: 'https://x.com/{}',                         category: 'Social',   manual: true },
  { name: 'Instagram',    url: 'https://instagram.com/{}',                  category: 'Social',   manual: false },
  { name: 'Mastodon',     url: 'https://mastodon.social/@{}',               category: 'Social',   manual: false },
  { name: 'TikTok',       url: 'https://tiktok.com/@{}',                    category: 'Social',   manual: true },
  { name: 'LinkedIn',     url: 'https://linkedin.com/in/{}',                category: 'Social',   manual: true },
  { name: 'Pinterest',    url: 'https://pinterest.com/{}',                  category: 'Social',   manual: true },
  { name: 'YouTube',      url: 'https://youtube.com/@{}',                   category: 'Social',   manual: true },
  { name: 'Snapchat',     url: 'https://snapchat.com/add/{}',               category: 'Social',   manual: true },
  { name: 'Reddit',       url: 'https://reddit.com/user/{}',                category: 'Social',   manual: false },
  { name: 'Bluesky',      url: 'https://bsky.app/profile/{}',               category: 'Social',   manual: false },
  { name: 'Telegram',     url: 'https://t.me/{}',                           category: 'Social',   manual: false },
  { name: 'Tumblr',       url: 'https://{}.tumblr.com',                     category: 'Social',   manual: false },
  { name: 'Medium',       url: 'https://medium.com/@{}',                    category: 'Social',   manual: false },
  { name: 'Substack',     url: 'https://{}.substack.com',                   category: 'Social',   manual: false },
  { name: 'GitHub',       url: 'https://github.com/{}',                     category: 'Dev',      manual: false },
  { name: 'GitLab',       url: 'https://gitlab.com/{}',                     category: 'Dev',      manual: false },
  { name: 'Codeberg',     url: 'https://codeberg.org/{}',                   category: 'Dev',      manual: false },
  { name: 'Dev.to',       url: 'https://dev.to/{}',                         category: 'Dev',      manual: false },
  { name: 'Hashnode',     url: 'https://hashnode.com/@{}',                  category: 'Dev',      manual: false },
  { name: 'HuggingFace',  url: 'https://huggingface.co/{}',                 category: 'Dev',      manual: false },
  { name: 'Keybase',      url: 'https://keybase.io/{}',                     category: 'Dev',      manual: false },
  { name: 'NPM',          url: 'https://npmjs.com/~{}',                     category: 'Dev',      manual: false },
  { name: 'Codepen',      url: 'https://codepen.io/{}',                     category: 'Dev',      manual: false },
  { name: 'Replit',       url: 'https://replit.com/@{}',                    category: 'Dev',      manual: false },
  { name: 'DockerHub',    url: 'https://hub.docker.com/u/{}',               category: 'Dev',      manual: false },
  { name: 'LeetCode',     url: 'https://leetcode.com/{}/',                   category: 'Dev',      manual: false },
  { name: 'Codeforces',   url: 'https://codeforces.com/profile/{}',          category: 'Dev',      manual: false },
  { name: 'Twitch',       url: 'https://twitch.tv/{}',                      category: 'Gaming',   manual: false },
  { name: 'Steam',        url: 'https://steamcommunity.com/id/{}',          category: 'Gaming',   manual: false },
  { name: 'Roblox',       url: 'https://roblox.com/user.aspx?username={}', category: 'Gaming',   manual: false },
  { name: 'Minecraft',    url: 'https://namemc.com/profile/{}',             category: 'Gaming',   manual: false },
  { name: 'Lichess',      url: 'https://lichess.org/@/{}',                  category: 'Gaming',   manual: false },
  { name: 'Chess.com',    url: 'https://chess.com/member/{}',               category: 'Gaming',   manual: false },
  { name: 'osu!',         url: 'https://osu.ppy.sh/users/{}',               category: 'Gaming',   manual: false },
  { name: 'SoundCloud',   url: 'https://soundcloud.com/{}',                 category: 'Creative', manual: false },
  { name: 'Vimeo',        url: 'https://vimeo.com/{}',                      category: 'Creative', manual: false },
  { name: 'Behance',      url: 'https://behance.net/{}',                    category: 'Creative', manual: false },
  { name: 'Flickr',       url: 'https://flickr.com/people/{}',              category: 'Creative', manual: false },
  { name: 'Patreon',      url: 'https://patreon.com/{}',                    category: 'Creative', manual: false },
  { name: 'Spotify',      url: 'https://open.spotify.com/user/{}',          category: 'Creative', manual: true },
  { name: 'ArtStation',   url: 'https://www.artstation.com/{}',             category: 'Creative', manual: false },
  { name: 'Dribbble',     url: 'https://dribbble.com/{}',                   category: 'Creative', manual: false },
  { name: 'Itch.io',      url: 'https://{}.itch.io',                        category: 'Creative', manual: false },
  { name: 'Hacker News',  url: 'https://news.ycombinator.com/user?id={}',   category: 'Other',    manual: false },
  { name: 'Lobste.rs',    url: 'https://lobste.rs/u/{}',                    category: 'Other',    manual: false },
  { name: 'Letterboxd',   url: 'https://letterboxd.com/{}',                 category: 'Other',    manual: false },
  { name: 'Last.fm',      url: 'https://www.last.fm/user/{}',               category: 'Other',    manual: false },
  { name: 'Duolingo',     url: 'https://www.duolingo.com/profile/{}',       category: 'Other',    manual: false },
];

type Status = 'checking' | 'found' | 'not_found' | 'error' | 'manual';

type Result = {
  platform: string;
  url: string;
  category: string;
  status: Status;
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700;900&family=Barlow:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #c0cfe0; font-family: 'Barlow', sans-serif; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #fff; text-transform: uppercase; }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #7a9bb5; text-decoration: none; transition: color 0.2s; }
  .nav-links a:hover { color: #1e9eff; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
  .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 3px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }
  .page-wrap { padding-top: 70px; min-height: 100vh; display: flex; flex-direction: column; }
  .page-content { flex: 1; }
  .back-bar { padding: 14px 40px; border-bottom: 1px solid rgba(30,158,255,0.07); }
  .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
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
  .search-btn:disabled { background: #0d2233; color: #3d5870; cursor: not-allowed; }
  .history-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .history-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
  .history-chip { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #7a9bb5; background: rgba(30,158,255,0.06); border: 1px solid rgba(30,158,255,0.15); padding: 3px 10px; cursor: pointer; letter-spacing: 1px; transition: all 0.2s; }
  .history-chip:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
  .status-row { max-width: 1100px; margin: 24px auto 0; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .status-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; }
  .status-text.scanning { animation: blink 1.2s infinite; }
  .status-meta { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
  .copy-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 6px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .copy-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.4); }
  .copy-btn.copied { color: #00ff88; border-color: rgba(0,255,136,0.4); }
  .progress-wrap { max-width: 1100px; margin: 10px auto 0; padding: 0 40px; }
  .progress-track { height: 2px; background: rgba(30,158,255,0.08); width: 100%; }
  .progress-fill { height: 2px; background: linear-gradient(90deg, #1e9eff, #00ff88); transition: width 0.4s ease; }
  .filters { max-width: 1100px; margin: 20px auto 0; padding: 0 40px; display: flex; gap: 2px; flex-wrap: wrap; }
  .filter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 2px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .filter-btn:hover { color: #c0cfe0; border-color: rgba(30,158,255,0.3); }
  .filter-btn.active { color: #1e9eff; border-color: rgba(30,158,255,0.5); background: rgba(30,158,255,0.06); }
  .filter-btn.found-filter.active { color: #00ff88; border-color: rgba(0,255,136,0.5); background: rgba(0,255,136,0.05); }
  .results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; max-width: 1100px; margin: 16px auto 0; padding: 0 40px 80px; }
  .r-card { background: #080f18; border: 1px solid rgba(30,158,255,0.07); padding: 16px 18px; display: flex; flex-direction: column; gap: 7px; position: relative; overflow: hidden; transition: border-color 0.2s; }
  .r-card.found { background: #06150e; border-color: rgba(0,255,136,0.28); }
  .r-card.found::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #00ff88, rgba(0,255,136,0.4)); }
  .r-card.found::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; background: rgba(0,255,136,0.25); }
  .r-card.found:hover { border-color: rgba(0,255,136,0.45); }
  .r-card.not_found { opacity: 0.22; }
  .r-card.checking { opacity: 0.5; }
  .r-card.error { border-color: rgba(255,170,0,0.22); background: #100e06; }
  .r-card.error::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #ffaa00; }
  .r-card.manual { background: #04101e; border-color: rgba(30,158,255,0.18); }
  .r-card.manual::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: rgba(30,158,255,0.35); }
  .r-card.manual::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 2px; background: rgba(30,158,255,0.15); }
  .r-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .r-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; line-height: 1; }
  .r-card.found .r-name { font-size: 17px; color: #d8f0e5; }
  .r-cat { font-family: 'Share Tech Mono', monospace; font-size: 7px; letter-spacing: 1px; color: #2d4560; text-transform: uppercase; flex-shrink: 0; }
  .r-card.manual .r-name { color: #4a7090; }
  .r-card.manual .r-cat { color: #1e3d55; }
  .r-status { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; }
  .r-status.found { color: #00ff88; }
  .r-status.not_found { color: #2d4560; }
  .r-status.checking { color: #1e6090; animation: blink 1.2s infinite; }
  .r-status.error { color: #ffaa00; }
  .r-status.manual { color: #2a6090; }
  .r-url { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #2a6644; letter-spacing: 0.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 1px; }
  .r-link { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #00ff88; text-decoration: none; text-transform: uppercase; margin-top: 3px; display: inline-block; transition: opacity 0.2s; }
  .r-link:hover { opacity: 0.7; }
  .r-link-manual { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #1e6090; text-decoration: none; text-transform: uppercase; margin-top: 3px; display: inline-block; transition: color 0.2s; }
  .r-link-manual:hover { color: #1e9eff; }
  .r-link-error { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #ffaa00; text-decoration: none; text-transform: uppercase; margin-top: 3px; display: inline-block; transition: opacity 0.2s; }
  .r-link-error:hover { opacity: 0.7; }
  .open-all-wrap { display: flex; align-items: center; gap: 8px; }
  .open-all-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #ffaa00; background: none; border: 1px solid rgba(255,170,0,0.3); padding: 6px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .open-all-btn:hover { background: rgba(255,170,0,0.08); border-color: #ffaa00; }
  .popup-hint { position: relative; display: flex; align-items: center; }
  .popup-hint-icon { width: 16px; height: 16px; border-radius: 50%; background: rgba(30,158,255,0.12); border: 1px solid rgba(30,158,255,0.25); color: #1e9eff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; cursor: default; font-family: 'Barlow Condensed', sans-serif; line-height: 1; }
  .popup-hint-tooltip { display: none; position: absolute; bottom: calc(100% + 8px); right: 0; background: #0a1828; border: 1px solid rgba(30,158,255,0.2); padding: 8px 12px; white-space: nowrap; font-family: 'Barlow', sans-serif; font-size: 12px; color: #7a9bb5; z-index: 10; pointer-events: none; }
  .popup-hint-tooltip::after { content: ''; position: absolute; top: 100%; right: 6px; border: 5px solid transparent; border-top-color: rgba(30,158,255,0.2); }
  .popup-hint:hover .popup-hint-tooltip { display: block; }
  .manual-note { font-family: 'Barlow', sans-serif; font-size: 13px; color: #4a6880; line-height: 1.6; max-width: 700px; }
  .legend { max-width: 1100px; margin: 0 auto; padding: 16px 40px 16px; display: flex; gap: 20px; flex-wrap: wrap; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1.5px; color: #3d5870; text-transform: uppercase; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  footer { border-top: 1px solid rgba(30,158,255,0.1); padding: 32px 40px; background: #040810; }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
  .footer-class { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
  @media (max-width: 900px) { .results-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) {
    nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; }
    .back-bar, .hero { padding-left: 20px; padding-right: 20px; }
    .search-wrap { padding: 24px 20px 0; }
    .search-box { flex-direction: column; }
    .search-btn { padding: 14px 20px; }
    .status-row, .progress-wrap, .filters, .legend { padding-left: 20px; padding-right: 20px; }
    .results-grid { grid-template-columns: repeat(2, 1fr); padding: 12px 20px 60px; }
    footer { padding: 24px 20px; } .footer-inner { flex-direction: column; gap: 8px; text-align: center; }
  }
`;

export default function UsernameHunter() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [checked, setChecked] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const total = PLATFORMS_CLIENT.length;

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch {}
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setUsername(q); setTimeout(() => scan(q), 100); }
  }, []);

  const copyFound = () => {
    const lines = results.filter(r => r.status === 'found').map(r => `${r.platform}: ${r.url}`).join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const scan = async (override?: string) => {
    const target = (override ?? username).trim();
    if (!target) return;
    if (override) setUsername(target);

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    setScanning(true);
    setFilter('All');

    setHistory(prev => {
      const next = [target, ...prev.filter(h => h !== target)].slice(0, 6);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
      return next;
    });

    const initial: Result[] = PLATFORMS_CLIENT.map(p => ({
      platform: p.name,
      url: p.url.replace('{}', target),
      category: p.category,
      status: p.manual ? 'manual' : 'checking',
    }));
    setResults(initial);
    setChecked(PLATFORMS_CLIENT.filter(p => p.manual).length);

    const checkable = PLATFORMS_CLIENT.filter(p => !p.manual);

    await Promise.allSettled(
      checkable.map(async (p) => {
        try {
          const res = await fetch(
            `/api/username?username=${encodeURIComponent(target)}&platform=${encodeURIComponent(p.name.toLowerCase())}`,
            { signal: abort.signal }
          );
          const data = await res.json();
          setResults(prev => prev.map(r => r.platform === p.name ? { ...r, status: data.status as Status } : r));
        } catch (e: unknown) {
          if ((e as Error)?.name === 'AbortError') return;
          setResults(prev => prev.map(r => r.platform === p.name ? { ...r, status: 'error' } : r));
        }
        setChecked(c => c + 1);
      })
    );

    setScanning(false);
  };

  const foundCount = results.filter(r => r.status === 'found').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const manualResults = results.filter(r => r.status === 'manual');

  const openAllManual = () => {
    manualResults.forEach(r => window.open(r.url, '_blank', 'noopener,noreferrer'));
  };
  const progress = total > 0 ? Math.round((checked / total) * 100) : 0;

  const categories = ['All', 'Found', 'Social', 'Dev', 'Gaming', 'Creative', 'Other'];
  const filtered = results.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Found') return r.status === 'found' || r.status === 'error';
    return r.category === filter;
  });
  const STATUS_ORDER: Record<Status, number> = { found: 0, error: 1, manual: 2, checking: 3, not_found: 4 };
  const sorted = [...filtered].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <>
      <style>{STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
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
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="page-content">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Identity Intelligence</div></div>
            <div className="hero-title">Username <span>Hunter</span></div>
            <p className="hero-desc">People reuse usernames across platforms without realizing how much that reveals. Enter any username to scan {total} sites simultaneously — social networks, developer communities, gaming platforms, and forums — mapping a target's full online presence in real time.</p>
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

        {results.length > 0 && (
          <>
            <div className="status-row">
              <div className={`status-text${scanning ? ' scanning' : ''}`}>
                {scanning
                  ? `Scanning ${total} platforms...`
                  : `Scan complete — ${foundCount} profile${foundCount !== 1 ? 's' : ''} confirmed${errorCount > 0 ? `, ${errorCount} need manual check` : ''}`
                }
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap'}}>
                <div className="status-meta">{checked}/{total} checked</div>
                {!scanning && manualResults.length > 0 && (
                  <div className="open-all-wrap">
                    <button className="open-all-btn" onClick={openAllManual}>
                      Open {manualResults.length} Manual →
                    </button>
                    <div className="popup-hint">
                      <div className="popup-hint-icon">i</div>
                      <div className="popup-hint-tooltip">Allow popups for this site to open all at once</div>
                    </div>
                  </div>
                )}
                {!scanning && foundCount > 0 && (
                  <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copyFound}>
                    {copied ? '✓ Copied' : `Copy ${foundCount} Found`}
                  </button>
                )}
              </div>
            </div>

            <div className="progress-wrap">
              <div className="progress-track">
                <div className="progress-fill" style={{width: `${progress}%`}} />
              </div>
            </div>

            <div className="filters">
              {categories.map(c => (
                <button
                  key={c}
                  className={`filter-btn${c === 'Found' ? ' found-filter' : ''}${filter === c ? ' active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c}{c === 'Found' && foundCount > 0 ? ` (${foundCount})` : ''}
                </button>
              ))}
            </div>

            <div className="legend">
              <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88'}} />Confirmed found</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#ffaa00'}} />Blocked — verify manually</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#3d5870'}} />Not found</div>
              <div className="legend-item"><div className="legend-dot" style={{background:'#1e6090'}} />Manual check required</div>
            </div>
            {!scanning && manualResults.length > 0 && (
              <div style={{maxWidth:'1100px', margin:'0 auto', padding:'0 40px 8px'}}>
                <div className="manual-note">Twitter/X, TikTok, LinkedIn, YouTube, Pinterest, Snapchat — these platforms block all automated checks and require a paid API or authentication. Use "Open {manualResults.length} Manual" above to open all at once.</div>
              </div>
            )}

            <div className="results-grid">
              {sorted.map((r, i) => (
                <div key={i} className={`r-card ${r.status}`}>
                  <div className="r-top">
                    <div className="r-name">{r.platform}</div>
                    <div className="r-cat">{r.category}</div>
                  </div>
                  <div className={`r-status ${r.status}`}>
                    {r.status === 'found'     && '✓ Found'}
                    {r.status === 'not_found' && '✗ Not Found'}
                    {r.status === 'checking'  && 'Checking...'}
                    {r.status === 'error'     && '⚠ Verify Manually'}
                    {r.status === 'manual'    && '— Open to Verify'}
                  </div>
                  {r.status === 'found' && (
                    <>
                      <div className="r-url">{r.url.replace('https://', '')}</div>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="r-link">View Profile →</a>
                    </>
                  )}
                  {r.status === 'error' && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="r-link-error">Open Manually →</a>
                  )}
                  {r.status === 'manual' && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="r-link-manual">Open →</a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        </div>
        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-class">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}
