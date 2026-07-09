'use client';
import { useState } from 'react';

const NAV_STYLE = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
  .hero-inner { max-width: 900px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
  .hero-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; }
  .hero-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #fff; margin-bottom: 10px; }
  .hero-title span { color: var(--accent); }
  .hero-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.7; }
  .tool-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; }
  .panel { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; margin-bottom: 2px; }
  .panel-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
  textarea { width: 100%; background: var(--bg-secondary); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; padding: 14px; resize: vertical; min-height: 140px; line-height: 1.6; transition: border-color 0.2s; }
  textarea:focus { border-color: var(--accent); }
  textarea::placeholder { color: var(--text-muted); }
  .btn-row { display: flex; gap: 8px; margin-top: 16px; }
  .btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 10px 22px; border: 1px solid var(--border-bright); background: transparent; color: var(--accent); cursor: pointer; font-weight: 700; transition: all 0.2s; }
  .btn:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); }
  .btn-primary { background: var(--accent); border-color: var(--accent); color: #000; }
  .btn-primary:hover { background: #4db3ff; }
  .btn-sm { padding: 7px 16px; font-size: 12px; }
  .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); margin-top: 10px; }
  .info-row { display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap; }
  .info-chip { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
  .info-chip span { color: var(--text-secondary); }
  @media (max-width: 768px) { .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } }
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
      <main id="main" className="page-wrap">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" aria-hidden="true" /><div className="hero-eyebrow-text">OSINT Hub · Utility</div></div>
            <h1 className="hero-title">Base64 <span>Encoder / Decoder</span></h1>
            <p className="hero-sub">Base64 is a way of disguising data as a string of random-looking letters and numbers. Malware uses it to hide commands, developers use it to embed images in code, and APIs use it to transmit credentials. If you find a suspicious string that looks like gibberish — paste it here to instantly decode what it actually says. Runs entirely in your browser.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="panel">
            <div className="panel-label">Input</div>
            <textarea
              aria-label="Text or Base64 input"
              placeholder={mode === 'encode' ? 'Paste plain text to encode...' : 'Paste Base64 string to decode...'}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={() => run('encode')}>Encode →</button>
              <button type="button" className="btn" onClick={() => run('decode')}>Decode →</button>
              <button type="button" className="btn btn-sm" onClick={() => { setInput(''); setOutput(''); setError(''); }}>Clear</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-label">Output</div>
            <div aria-live="polite">
              <textarea readOnly aria-label="Result output" value={output} placeholder="Result will appear here..." />
              {error && <div className="error-msg" role="alert">{error}</div>}
              <div className="info-row">
                {output && (
                  <>
                    <div className="info-chip">Length: <span>{output.length}</span></div>
                    {mode === 'encode' && <div className="info-chip">Ratio: <span>{input.length > 0 ? ((output.length / input.length) * 100).toFixed(0) : 0}%</span></div>}
                  </>
                )}
              </div>
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn-sm" onClick={copy} disabled={!output}>Copy</button>
              <button type="button" className="btn btn-sm" onClick={swap} disabled={!output}>Use as Input</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
