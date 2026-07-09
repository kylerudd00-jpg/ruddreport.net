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


export default function HashAnalyzer() {
  const [input, setInput] = useState('');
  const [matches, setMatches] = useState<typeof HASH_PATTERNS>([]);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState('');

  const analyze = () => {
    if (!input.trim()) return;
    setError('');
    setMatches([]);
    setAnalyzed(input.trim());
    const found = identifyHash(input.trim());
    if (found.length === 0) {
      setError('No known hash format matched. Input may be encoded, salted, or a custom format.');
    } else {
      setMatches(found);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .mode-tabs { display: flex; gap: 2px; margin-bottom: 20px; }
        .mode-tab { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 20px; border: 1px solid var(--border-bright); background: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .mode-tab.active { background: rgba(30,158,255,0.08); border-color: rgba(30,158,255,0.4); color: var(--accent); }
        .mode-tab:hover:not(.active) { border-color: rgba(30,158,255,0.4); color: var(--text-primary); }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #33ffaa; }
        .search-btn:disabled { background: #0d3322; color: var(--text-muted); cursor: not-allowed; }
        .mode-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 12px; line-height: 1.7; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .match-card { background: var(--bg-card); border: 1px solid var(--border); margin-bottom: 2px; }
        .match-header { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
        .match-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; }
        .match-bits { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); border: 1px solid var(--border); padding: 4px 12px; }
        .match-desc { padding: 14px 24px; font-size: 13px; color: var(--text-secondary); font-weight: 400; line-height: 1.7; }
        .breach-card { background: var(--bg-card); border: 1px solid; padding: 32px; text-align: center; }
        .breach-card.found { border-color: rgba(255,77,77,0.4); background: rgba(255,77,77,0.04); }
        .breach-card.safe { border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.04); }
        .breach-icon { font-size: 48px; margin-bottom: 16px; }
        .breach-status { font-family: var(--font-display); font-size: 24px; font-weight: 900; letter-spacing: 0.06em; margin-bottom: 12px; }
        .breach-status.found { color: var(--red); }
        .breach-status.safe { color: var(--accent); }
        .breach-count { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.06em; color: var(--text-secondary); margin-bottom: 8px; }
        .breach-count span { color: var(--red); font-size: 18px; }
        .breach-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; margin-top: 16px; }
        .input-preview { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 20px; word-break: break-all; }
        .input-preview span { color: var(--accent); }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
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
              <div className="tool-eyebrow-text">Cryptographic Analysis</div>
            </div>
            <h1 className="tool-title">Hash Analyzer</h1>
            <p className="tool-desc">A hash is a unique fingerprint for any piece of data — files, passwords, and messages all produce one. Paste any hash to identify its algorithm (MD5, SHA-256, bcrypt, NTLM, and more). Used by analysts to verify file integrity, identify credential formats in breach dumps, and assess the strength of password storage.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Hash value to identify"
              placeholder="paste hash here — MD5, SHA-256, bcrypt, NTLM..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              type="text"
            />
            <button type="button" className="search-btn" onClick={analyze} disabled={!input.trim()}>
              Identify →
            </button>
          </div>
        </div>

        <div className="results" aria-live="polite">
          {error && <div className="error-msg" role="alert">{error}</div>}

          {matches.length > 0 && (
            <>
              <div className="input-preview">Input: <span>{analyzed.length > 60 ? analyzed.slice(0,60) + '...' : analyzed}</span></div>
              <h2 className="section-label">{matches.length} possible hash type{matches.length > 1 ? 's' : ''} identified</h2>
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
