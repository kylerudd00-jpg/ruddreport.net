'use client';
import { useState } from 'react';

const STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 1000px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #fff; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; }
  .tool-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 40px 80px; }
  .panel-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
  textarea { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; padding: 14px; resize: vertical; min-height: 100px; line-height: 1.6; transition: border-color 0.2s; }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: var(--text-muted); }
  .btn-row { display: flex; gap: 8px; margin: 12px 0 24px; }
  .btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 10px 22px; border: 1px solid var(--border-bright); background: transparent; color: var(--accent); cursor: pointer; font-weight: 700; transition: all 0.2s; }
  .btn:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }
  .btn-primary { background: var(--accent); border-color: var(--accent); color: #000; }
  .btn-primary:hover { background: #4db3ff; }
  .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
  .jwt-section { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; }
  .jwt-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .jwt-section-dot { width: 8px; height: 8px; border-radius: 50%; }
  .jwt-section-name { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; }
  .jwt-json { font-family: var(--font-mono); font-size: 12px; line-height: 1.8; white-space: pre-wrap; word-break: break-all; }
  .jwt-sig { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; margin-top: 2px; }
  .sig-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); word-break: break-all; margin-top: 8px; }
  .claims-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 2px; }
  .claim-cell { background: var(--bg-secondary); padding: 12px 16px; }
  .claim-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
  .claim-val { font-family: var(--font-mono); font-size: 13px; color: var(--text-secondary); }
  .claim-val.expired { color: var(--red); }
  .claim-val.valid { color: #22cc66; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); margin-top: 8px; }
  .warn-box { background: rgba(255,170,0,0.06); border: 1px solid rgba(255,170,0,0.2); padding: 12px 16px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; margin-top: 2px; }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .sections { grid-template-columns: 1fr; } .claims-grid { grid-template-columns: 1fr; } }
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
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Utility</div></div>
            <h1 className="hero-title">JWT <span>Decoder</span></h1>
            <p className="hero-sub">When you log into a website, the server often gives your browser a JWT — a token that proves who you are. Paste one here to see exactly what's inside: your user ID, email, permissions, and when it expires. Security researchers use this to find sensitive data developers accidentally encoded into tokens, or to spot weak signing algorithms that make tokens forgeable. Runs entirely in your browser — your token is never sent anywhere.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="panel-label">Paste JWT Token</div>
          <textarea
            aria-label="JWT token to decode"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={decode}>Decode →</button>
            <button type="button" className="btn" onClick={() => { setInput(''); setHeader(null); setPayload(null); setSig(''); setError(''); }}>Clear</button>
          </div>

          <div aria-live="polite">
          {error && <div className="error-box" role="alert">{error}</div>}

          {header && payload && (
            <>
              <div className="sections">
                <div className="jwt-section">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[0] }} aria-hidden="true" />
                    <div className="jwt-section-name">Header</div>
                  </div>
                  <div className="jwt-json">{colorizeJson(header)}</div>
                </div>
                <div className="jwt-section">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[1] }} aria-hidden="true" />
                    <div className="jwt-section-name">Payload</div>
                  </div>
                  <div className="jwt-json">{colorizeJson(payload)}</div>
                </div>
              </div>

              {sig && (
                <div className="jwt-sig">
                  <div className="jwt-section-header">
                    <div className="jwt-section-dot" style={{ background: dotColors[2] }} aria-hidden="true" />
                    <div className="jwt-section-name">Signature</div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)', marginLeft: '8px' }}>(not verified — signature check requires the secret key)</span>
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
      </main>
    </>
  );
}
