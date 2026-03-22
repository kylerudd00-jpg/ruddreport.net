'use client';
import { useState } from 'react';

const HASH_PATTERNS: { name: string; regex: RegExp; bits: number; desc: string }[] = [
  { name: 'MD5', regex: /^[a-f0-9]{32}$/i, bits: 128, desc: 'Message Digest 5 — broken, common in legacy systems' },
  { name: 'SHA-1', regex: /^[a-f0-9]{40}$/i, bits: 160, desc: 'Secure Hash Algorithm 1 — deprecated, collision-vulnerable' },
  { name: 'SHA-224', regex: /^[a-f0-9]{56}$/i, bits: 224, desc: 'SHA-2 family, 224-bit truncation' },
  { name: 'SHA-256', regex: /^[a-f0-9]{64}$/i, bits: 256, desc: 'SHA-2 family — current standard, widely used' },
  { name: 'SHA-384', regex: /^[a-f0-9]{96}$/i, bits: 384, desc: 'SHA-2 family, 384-bit output' },
  { name: 'SHA-512', regex: /^[a-f0-9]{128}$/i, bits: 512, desc: 'SHA-2 family — strong, used in certificates and file verification' },
  { name: 'SHA3-256', regex: /^[a-f0-9]{64}$/i, bits: 256, desc: 'SHA-3 family — Keccak-based, distinct from SHA-256' },
  { name: 'NTLM', regex: /^[a-f0-9]{32}$/i, bits: 128, desc: 'Windows NTLM password hash — same length as MD5' },
  { name: 'bcrypt', regex: /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/, bits: 0, desc: 'Adaptive password hashing — salted, GPU-resistant' },
  { name: 'Argon2', regex: /^\$argon2(i|d|id)\$/, bits: 0, desc: 'Winner of Password Hashing Competition 2015 — memory-hard' },
  { name: 'scrypt', regex: /^\$s0\$/, bits: 0, desc: 'Memory-hard KDF by Colin Percival' },
  { name: 'PBKDF2', regex: /^\$pbkdf2/, bits: 0, desc: 'Password-Based Key Derivation Function 2 — NIST recommended' },
  { name: 'MySQL 4.x', regex: /^[a-f0-9]{16}$/i, bits: 64, desc: 'Old MySQL password hash — extremely weak' },
  { name: 'LM Hash', regex: /^[a-f0-9]{32}$/i, bits: 128, desc: 'Windows LAN Manager — legacy, trivially crackable' },
  { name: 'CRC32', regex: /^[a-f0-9]{8}$/i, bits: 32, desc: 'Cyclic Redundancy Check — not cryptographic, for error detection only' },
  { name: 'Whirlpool', regex: /^[a-f0-9]{128}$/i, bits: 512, desc: 'Whirlpool (W) — ISO/IEC 10118-3 standard' },
  { name: 'RIPEMD-160', regex: /^[a-f0-9]{40}$/i, bits: 160, desc: 'Used in Bitcoin address derivation alongside SHA-256' },
  { name: 'BLAKE2b-256', regex: /^[a-f0-9]{64}$/i, bits: 256, desc: 'BLAKE2 family — faster than SHA-2, used in many modern protocols' },
];

function identifyHash(input: string): typeof HASH_PATTERNS {
  const trimmed = input.trim();
  return HASH_PATTERNS.filter(p => p.regex.test(trimmed));
}

async function sha1Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuf = await window.crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashAnalyzer() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'identify' | 'breach'>('identify');
  const [matches, setMatches] = useState<typeof HASH_PATTERNS>([]);
  const [breachResult, setBreachResult] = useState<{ count: number; found: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState('');

  const analyze = async () => {
    if (!input.trim()) return;
    setError('');
    setBreachResult(null);
    setMatches([]);
    setAnalyzed(input.trim());

    if (mode === 'identify') {
      const found = identifyHash(input.trim());
      if (found.length === 0) {
        setError('No known hash format matched. Input may be encoded, salted, or a custom format.');
      } else {
        setMatches(found);
      }
    } else {
      // Breach check via HIBP k-anonymity
      setLoading(true);
      try {
        const hash = await sha1Hex(input.trim());
        const prefix = hash.slice(0, 5).toUpperCase();
        const suffix = hash.slice(5).toUpperCase();
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
          headers: { 'Add-Padding': 'true' }
        });
        if (!res.ok) throw new Error('HIBP API unavailable');
        const text = await res.text();
        const lines = text.split('\n');
        const match = lines.find(l => l.startsWith(suffix));
        if (match) {
          const count = parseInt(match.split(':')[1].trim(), 10);
          setBreachResult({ found: true, count });
        } else {
          setBreachResult({ found: false, count: 0 });
        }
      } catch (e: any) {
        setError('' + (e.message || 'Failed to check breach database.'));
      }
      setLoading(false);
    }
  };

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
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff;  }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .mode-tabs { display: flex; gap: 2px; margin-bottom: 20px; }
        .mode-tab { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 10px 20px; border: 1px solid rgba(30,158,255,0.2); background: none; color: #3d5870; cursor: pointer; transition: all 0.2s; }
        .mode-tab.active { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.4); color: #1e9eff; }
        .mode-tab:hover:not(.active) { border-color: rgba(30,158,255,0.4); color: #c0cfe0; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #33ffaa; }
        .search-btn:disabled { background: #0d3322; color: #3d5870; cursor: not-allowed; }
        .mode-note { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; margin-top: 12px; line-height: 1.7; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .match-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); margin-bottom: 2px; }
        .match-header { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .match-name { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; }
        .match-bits { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; border: 1px solid rgba(30,158,255,0.15); padding: 4px 12px; }
        .match-desc { padding: 14px 24px; font-size: 13px; color: #9ab0c4; font-weight: 400; line-height: 1.7; }
        .breach-card { background: #0a1520; border: 1px solid; padding: 32px; text-align: center; }
        .breach-card.found { border-color: rgba(255,58,58,0.4); background: rgba(255,58,58,0.04); }
        .breach-card.safe { border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.04); }
        .breach-icon { font-size: 48px; margin-bottom: 16px; }
        .breach-status { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 3px; margin-bottom: 12px; }
        .breach-status.found { color: #ff3a3a; }
        .breach-status.safe { color: #1e9eff; }
        .breach-count { font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 3px; color: #7a9bb5; margin-bottom: 8px; }
        .breach-count span { color: #ff3a3a; font-size: 18px; }
        .breach-note { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; line-height: 1.8; margin-top: 16px; }
        .input-preview { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; margin-bottom: 20px; word-break: break-all; }
        .input-preview span { color: #1e9eff; }
        .error-msg { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
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
          <div className="hamburger" onClick={() => document.getElementById('hashMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="hashMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('hashMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">Cryptographic Analysis</div>
            </div>
            <div className="tool-title">Hash Analyzer</div>
            <p className="tool-desc">A hash is a unique fingerprint for any piece of data — files, passwords, and messages all produce one. Paste any hash to identify its type (MD5, SHA-256, bcrypt, and more) or check if it matches a known compromised password. Used by analysts to verify file integrity and check whether credentials have been exposed in a breach. Your input is never sent in full.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === 'identify' ? 'active' : ''}`}
              onClick={() => { setMode('identify'); setMatches([]); setBreachResult(null); setError(''); }}
            >
              Identify Hash
            </button>
            <button
              className={`mode-tab ${mode === 'breach' ? 'active' : ''}`}
              onClick={() => { setMode('breach'); setMatches([]); setBreachResult(null); setError(''); }}
            >
              Breach Check
            </button>
          </div>
          <div className="search-box">
            <input
              className="search-input"
              placeholder={mode === 'identify' ? 'paste hash here...' : 'enter password to check...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              type={mode === 'breach' ? 'password' : 'text'}
            />
            <button className="search-btn" onClick={analyze} disabled={loading || !input.trim()}>
              {loading ? 'Checking...' : mode === 'identify' ? 'Identify →' : 'Check →'}
            </button>
          </div>
          {mode === 'breach' && (
            <div className="mode-note">
              Privacy-safe: uses k-anonymity — only the first 5 hex chars of your password's SHA-1 hash are sent to HIBP. Your actual password never leaves your browser.
            </div>
          )}
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars">
                <span /><span /><span /><span /><span />
              </div>
              <div className="loading-text">Querying breach database...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}

          {matches.length > 0 && (
            <>
              <div className="input-preview">Input: <span>{analyzed.length > 60 ? analyzed.slice(0,60) + '...' : analyzed}</span></div>
              <div className="section-label">{matches.length} possible hash type{matches.length > 1 ? 's' : ''} identified</div>
              {matches.map((m, i) => (
                <div className="match-card" key={i}>
                  <div className="match-header">
                    <div className="match-name">{m.name}</div>
                    {m.bits > 0 && <div className="match-bits">{m.bits}-bit</div>}
                  </div>
                  <div className="match-desc">{m.desc}</div>
                </div>
              ))}
            </>
          )}

          {breachResult && (
            <div className={`breach-card ${breachResult.found ? 'found' : 'safe'}`}>
              <div className="breach-icon">{breachResult.found ? '⚠' : '✓'}</div>
              <div className={`breach-status ${breachResult.found ? 'found' : 'safe'}`}>
                {breachResult.found ? 'COMPROMISED' : 'NOT FOUND'}
              </div>
              {breachResult.found ? (
                <div className="breach-count">
                  Seen <span>{breachResult.count.toLocaleString()}</span> times in known breaches
                </div>
              ) : (
                <div className="breach-count">This password was not found in any known data breach</div>
              )}
              <div className="breach-note">
                Source: Have I Been Pwned (HIBP) — aggregates {'>'}14 billion compromised credentials<br />
                Note: a 'not found' result does not guarantee security — use unique, randomly generated passwords
              </div>
            </div>
          )}
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
