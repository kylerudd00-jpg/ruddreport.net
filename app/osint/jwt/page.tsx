'use client';
import { useState } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
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
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
  .hero-inner { max-width: 1000px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; }
  .tool-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 40px 80px; }
  .panel-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 10px; }
  textarea { width: 100%; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.15); color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 12px; padding: 14px; outline: none; resize: vertical; min-height: 100px; line-height: 1.6; transition: border-color 0.2s; }
  textarea:focus { border-color: rgba(30,158,255,0.4); }
  textarea::placeholder { color: #3d5870; }
  .btn-row { display: flex; gap: 8px; margin: 12px 0 24px; }
  .btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; padding: 10px 22px; border: 1px solid rgba(30,158,255,0.4); background: transparent; color: #1e9eff; cursor: pointer; font-weight: 700; transition: all 0.2s; }
  .btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
  .btn-primary { background: #1e9eff; border-color: #1e9eff; color: #000; }
  .btn-primary:hover { background: #4db3ff; }
  .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .jwt-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 24px; }
  .jwt-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .jwt-section-dot { width: 8px; height: 8px; border-radius: 50%; }
  .jwt-section-name { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: #9ab0c4; text-transform: uppercase; }
  .jwt-json { font-family: 'IBM Plex Mono', monospace; font-size: 12px; line-height: 1.8; white-space: pre-wrap; word-break: break-all; }
  .jwt-sig { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 24px; margin-top: 2px; }
  .sig-val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d5870; word-break: break-all; margin-top: 8px; }
  .claims-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 2px; }
  .claim-cell { background: rgba(3,6,8,0.5); padding: 12px 16px; }
  .claim-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 5px; }
  .claim-val { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #9ab0c4; }
  .claim-val.expired { color: #ff4444; }
  .claim-val.valid { color: #22cc66; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; margin-top: 8px; }
  .warn-box { background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.2); padding: 12px 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1px; color: #ffaa00; margin-top: 2px; }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .sections { grid-template-columns: 1fr; } .claims-grid { grid-template-columns: 1fr; } }
`;

function b64urlDecode(str: string): string {
  const padded = str + '==='.slice((str.length + 3) % 4);
  const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return decodeURIComponent(decoded.split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
}

function colorizeJson(obj: Record<string, unknown>): React.ReactNode {
  const entries = Object.entries(obj);
  return entries.map(([k, v], i) => (
    <span key={k}>
      <span style={{ color: '#7ab8e8' }}>{JSON.stringify(k)}</span>
      <span style={{ color: '#5a7a90' }}>: </span>
      <span style={{ color: typeof v === 'string' ? '#22cc66' : typeof v === 'number' ? '#ffaa00' : typeof v === 'boolean' ? '#ff6b6b' : '#9ab0c4' }}>
        {JSON.stringify(v)}
      </span>
      {i < entries.length - 1 ? <span style={{ color: '#5a7a90' }}>,{'\n'}</span> : ''}
    </span>
  ));
}

function formatTimestamp(ts: unknown): string {
  if (typeof ts !== 'number') return String(ts);
  try { return new Date(ts * 1000).toUTCString(); } catch { return String(ts); }
}

export default function JWTDecoder() {
  const [input, setInput] = useState('');
  const [header, setHeader] = useState<Record<string, unknown> | null>(null);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [sig, setSig] = useState('');
  const [error, setError] = useState('');

  function decode() {
    setError(''); setHeader(null); setPayload(null); setSig('');
    const token = input.trim();
    if (!token) return;
    const parts = token.split('.');
    if (parts.length < 2 || parts.length > 3) { setError('Not a valid JWT — expected 2 or 3 dot-separated parts.'); return; }
    try {
      const h = JSON.parse(b64urlDecode(parts[0]));
      const p = JSON.parse(b64urlDecode(parts[1]));
      setHeader(h);
      setPayload(p);
      setSig(parts[2] ?? '');
    } catch {
      setError('Failed to decode — token may be malformed or not a standard JWT.');
    }
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = payload?.exp as number | undefined;
  const nbf = payload?.nbf as number | undefined;
  const iat = payload?.iat as number | undefined;
  const isExpired = exp !== undefined && exp < now;
  const isNotYetValid = nbf !== undefined && nbf > now;

  const dotColors = ['#1e9eff', '#22cc66', '#ffaa00'];

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
          <div className="hamburger" onClick={() => document.getElementById('jwtMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="jwtMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('jwtMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Utility</div></div>
            <div className="hero-title">JWT <span>Decoder</span></div>
            <p className="hero-sub">When you log into a website, the server often gives your browser a JWT — a token that proves who you are. Paste one here to see exactly what's inside: your user ID, email, permissions, and when it expires. Security researchers use this to find sensitive data developers accidentally encoded into tokens, or to spot weak signing algorithms that make tokens forgeable. Runs entirely in your browser — your token is never sent anywhere.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="panel-label">Paste JWT Token</div>
          <textarea
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={decode}>Decode →</button>
            <button className="btn" onClick={() => { setInput(''); setHeader(null); setPayload(null); setSig(''); setError(''); }}>Clear</button>
          </div>

          {error && <div className="error-box">{error}</div>}

          {header && payload && (
            <>
              <div className="sections">
                <div className="jwt-section">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[0] }} />
                    <div className="jwt-section-name">Header</div>
                  </div>
                  <div className="jwt-json">{colorizeJson(header)}</div>
                </div>
                <div className="jwt-section">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[1] }} />
                    <div className="jwt-section-name">Payload</div>
                  </div>
                  <div className="jwt-json">{colorizeJson(payload)}</div>
                </div>
              </div>

              {sig && (
                <div className="jwt-sig">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[2] }} />
                    <div className="jwt-section-name">Signature</div>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '9px', letterSpacing: '1px', color: '#3d5870', marginLeft: '8px' }}>(not verified — signature check requires the secret key)</span>
                  </div>
                  <div className="sig-val">{sig}</div>
                </div>
              )}

              <div className="claims-grid">
                {exp !== undefined && (
                  <div className="claim-cell">
                    <div className="claim-label">Expiration (exp)</div>
                    <div className={`claim-val ${isExpired ? 'expired' : 'valid'}`}>
                      {formatTimestamp(exp)} {isExpired ? '· EXPIRED' : '· VALID'}
                    </div>
                  </div>
                )}
                {iat !== undefined && (
                  <div className="claim-cell">
                    <div className="claim-label">Issued At (iat)</div>
                    <div className="claim-val">{formatTimestamp(iat)}</div>
                  </div>
                )}
                {nbf !== undefined && (
                  <div className="claim-cell">
                    <div className="claim-label">Not Before (nbf)</div>
                    <div className={`claim-val ${isNotYetValid ? 'expired' : 'valid'}`}>
                      {formatTimestamp(nbf)} {isNotYetValid ? '· NOT YET VALID' : '· OK'}
                    </div>
                  </div>
                )}
                {header.alg !== undefined && (
                  <div className="claim-cell">
                    <div className="claim-label">Algorithm</div>
                    <div className="claim-val">{String(header.alg)}</div>
                  </div>
                )}
              </div>

              <div className="warn-box">
                Signature is not cryptographically verified here. This tool only decodes and inspects the token structure. Never trust a JWT without verifying the signature against the issuer&apos;s key.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
