'use client';
import { useState } from 'react';

const NAV_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
  .nav-links a:hover { color: #1e9eff; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
  .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1.5px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
  .hero-inner { max-width: 900px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; }
  .tool-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; }
  .panel { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 28px; margin-bottom: 2px; }
  .panel-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; margin-bottom: 12px; }
  textarea { width: 100%; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.15); color: #d8e8f5; font-family: 'Share Tech Mono', monospace; font-size: 13px; padding: 14px; outline: none; resize: vertical; min-height: 140px; line-height: 1.6; transition: border-color 0.2s; }
  textarea:focus { border-color: rgba(30,158,255,0.4); }
  textarea::placeholder { color: #5a7a94; }
  .btn-row { display: flex; gap: 8px; margin-top: 16px; }
  .btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 10px 22px; border: 1px solid rgba(30,158,255,0.4); background: transparent; color: #1e9eff; cursor: pointer; font-weight: 700; transition: all 0.2s; }
  .btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
  .btn-primary { background: #1e9eff; border-color: #1e9eff; color: #000; }
  .btn-primary:hover { background: #4db3ff; }
  .btn-sm { padding: 7px 16px; font-size: 10px; }
  .error-msg { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 1px; color: #ff4444; margin-top: 10px; }
  .info-row { display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap; }
  .info-chip { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #5a7a94; }
  .info-chip span { color: #9ab0c4; }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } }
`;

function tryEncode(input: string): { result: string; error: string } {
  try {
    return { result: btoa(unescape(encodeURIComponent(input))), error: '' };
  } catch {
    return { result: '', error: 'Encoding failed — check your input.' };
  }
}

function tryDecode(input: string): { result: string; error: string } {
  try {
    return { result: decodeURIComponent(escape(atob(input.trim()))), error: '' };
  } catch {
    return { result: '', error: 'Invalid Base64 — cannot decode.' };
  }
}

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  function run(m: 'encode' | 'decode') {
    setMode(m);
    if (!input.trim()) { setOutput(''); setError(''); return; }
    const { result, error: err } = m === 'encode' ? tryEncode(input) : tryDecode(input);
    setOutput(result);
    setError(err);
  }

  function copy() {
    if (output) navigator.clipboard.writeText(output);
  }

  function swap() {
    setInput(output);
    setOutput('');
    setError('');
  }

  return (
    <>
      <style>{NAV_STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('b64Menu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="b64Menu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('b64Menu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Utility</div></div>
            <div className="hero-title">Base64 <span>Encoder / Decoder</span></div>
            <p className="hero-sub">Base64 is a way of disguising data as a string of random-looking letters and numbers. Malware uses it to hide commands, developers use it to embed images in code, and APIs use it to transmit credentials. If you find a suspicious string that looks like gibberish — paste it here to instantly decode what it actually says. Runs entirely in your browser.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="panel">
            <div className="panel-label">Input</div>
            <textarea
              placeholder={mode === 'encode' ? 'Paste plain text to encode...' : 'Paste Base64 string to decode...'}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => run('encode')}>Encode →</button>
              <button className="btn" onClick={() => run('decode')}>Decode →</button>
              <button className="btn btn-sm" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Clear</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-label">Output</div>
            <textarea readOnly value={output} placeholder="Result will appear here..." />
            {error && <div className="error-msg">{error}</div>}
            <div className="info-row">
              {output && (
                <>
                  <div className="info-chip">Length: <span>{output.length}</span></div>
                  {mode === 'encode' && <div className="info-chip">Ratio: <span>{input.length > 0 ? ((output.length / input.length) * 100).toFixed(0) : 0}%</span></div>}
                </>
              )}
            </div>
            <div className="btn-row">
              <button className="btn btn-sm" onClick={copy} disabled={!output}>Copy</button>
              <button className="btn btn-sm" onClick={swap} disabled={!output}>Use as Input</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
