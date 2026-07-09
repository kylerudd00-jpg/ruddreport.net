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
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .back-bar { padding: 14px 40px; border-bottom: 1px solid var(--border); }
  .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
  .back-link:hover { color: var(--accent); }

  .hero { padding: 56px 40px 36px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 1100px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(22px, 3.5vw, 42px); font-weight: 900; color: #fff; letter-spacing: -0.02em; text-transform: uppercase; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.7; max-width: 700px; }

  .search-wrap { max-width: 1100px; margin: 0 auto; padding: 32px 40px 0; }
  .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
  .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.04em; }
  .search-input::placeholder { color: var(--text-muted); letter-spacing: 0.02em; }
  .search-box:focus-within { border-color: var(--accent); }
  .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
  .search-btn:hover { background: #4db3ff; }
  .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }

  .history-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .history-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
  .history-chip { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 4px 11px; cursor: pointer; letter-spacing: 0.02em; }
  .history-chip:hover { color: #fff; border-color: var(--accent); }

  .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
  .ex-row button { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
  .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }

  .scan-status { max-width: 1100px; margin: 24px auto 0; padding: 0 40px; }
  .scan-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
  .scan-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
  .scan-text.pulse { animation: blink 1.2s infinite; }
  .scan-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
  .scan-actions { display: flex; align-items: center; gap: 10px; }
  .action-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; background: none; border: 1px solid var(--border-bright); color: var(--text-secondary); padding: 6px 14px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
  .action-btn:hover { color: var(--accent); border-color: var(--accent); }
  .action-btn.copied { color: #22cc66; border-color: rgba(34,204,102,0.5); }
  .progress-track { height: 2px; background: var(--border); width: 100%; }
  .progress-fill { height: 2px; background: linear-gradient(90deg, var(--accent), #22cc66); transition: width 0.5s ease; }

  .main-wrap { max-width: 1100px; margin: 0 auto; padding: 28px 40px 80px; display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }

  /* Checked results panel */
  .checked-panel { }
  .panel-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
  .results-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; }
  .r-card { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden; transition: border-color 0.25s, opacity 0.25s; }
  .r-card.found { background: var(--bg-card-hover); border-color: rgba(34,204,102,0.4); }
  .r-card.found::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #22cc66, rgba(34,204,102,0.3)); }
  .r-card.not_found { opacity: 0.18; }
  .r-card.checking { opacity: 0.45; }
  .r-card.error { border-color: rgba(255,170,0,0.35); }
  .r-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
  .r-name { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-secondary); letter-spacing: 0.3px; }
  .r-card.found .r-name { color: var(--text-primary); font-size: 16px; }
  .r-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); text-transform: uppercase; flex-shrink: 0; }
  .r-status { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; }
  .r-status.found { color: #22cc66; }
  .r-status.not_found { color: var(--text-muted); }
  .r-status.checking { color: var(--accent); animation: blink 1.4s infinite; }
  .r-status.error { color: #ffaa00; }
  .r-link { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #22cc66; text-decoration: none; text-transform: uppercase; margin-top: 2px; display: inline-block; transition: opacity 0.2s; }
  .r-link:hover { opacity: 0.7; }
  .r-err-link { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #ffaa00; text-decoration: none; text-transform: uppercase; margin-top: 2px; display: inline-block; }
  .r-err-link:hover { color: #ffaa00; }
  .r-url { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.02em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Manual links panel */
  .manual-panel { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; }
  .manual-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .manual-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
  .manual-note { font-family: var(--font-display); font-size: 12px; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .open-all-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: var(--accent); background: var(--bg-card-hover); border: 1px solid var(--border-bright); padding: 5px 12px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; white-space: nowrap; }
  .open-all-btn:hover { background: var(--bg-card-hover); }
  .manual-list { display: flex; flex-direction: column; gap: 1px; }
  .manual-link { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--bg-secondary); text-decoration: none; transition: all 0.2s; }
  .manual-link:hover { background: var(--bg-card-hover); }
  .manual-link-name { font-family: var(--font-display); font-size: 13px; font-weight: 600; letter-spacing: 0.5px; color: var(--text-secondary); }
  .manual-link:hover .manual-link-name { color: var(--accent); }
  .manual-link-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); text-transform: uppercase; }
  .manual-link-arrow { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .manual-link:hover .manual-link-arrow { color: var(--accent); }

  .empty-state { padding: 48px 40px; max-width: 1100px; margin: 0 auto; }
  .empty-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
  .empty-card { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 16px; }
  .empty-name { font-family: var(--font-display); font-size: 13px; color: var(--text-muted); letter-spacing: 0.3px; }
  .empty-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }

  footer { border-top: 1px solid var(--border); padding: 28px 40px; background: var(--bg-secondary); }
  .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
  @media (max-width: 960px) { .main-wrap { grid-template-columns: 1fr; } .manual-panel { order: -1; } }
  @media (max-width: 768px) {
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
      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" aria-hidden="true" />
              <div className="hero-eyebrow-text">OSINT Hub · Identity Intelligence</div>
            </div>
            <h1 className="hero-title">Account <span>Finder</span></h1>
            <p className="hero-desc">
              Check {CHECKED.length} platforms for a username, plus quick links to {MANUAL.length} more.
            </p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Username to search"
              placeholder="Enter username — e.g. johndoe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !scanning && scan()}
            />
            <button type="button" className="search-btn" onClick={() => scan()} disabled={scanning || !username.trim()}>
              {scanning ? 'Scanning...' : 'Hunt →'}
            </button>
          </div>
          <div className="ex-row" role="group" aria-label="Example usernames to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['torvalds'].map(v => (
              <button key={v} type="button" onClick={() => scan(v)}>{v}</button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="history-row">
              <span className="history-label">Recent:</span>
              {history.map(h => (
                <button type="button" key={h} className="history-chip" onClick={() => { setUsername(h); scan(h); }}>{h}</button>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 ? (
          <>
            <div className="scan-status" aria-live="polite">
              <div className="scan-top">
                <div className={`scan-text${scanning ? ' pulse' : ''}`}>
                  {scanning
                    ? `Scanning ${total} platforms...`
                    : `${foundCount} profile${foundCount !== 1 ? 's' : ''} confirmed across ${total} platforms`}
                </div>
                <div className="scan-actions">
                  <div className="scan-meta">{done}/{total}</div>
                  {!scanning && foundCount > 0 && (
                    <button type="button" className={`action-btn${copied ? ' copied' : ''}`} onClick={copyFound}>
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
                    <button type="button" className="open-all-btn" onClick={openAllManual}>Open All</button>
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
      </main>
    </>
  );
}
