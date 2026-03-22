'use client';
import { useState } from 'react';

type Hop = {
  from: string;
  by: string;
  ip: string;
  timestamp: string;
  raw: string;
};

type AuthResult = { spf: string; dkim: string; dmarc: string };
type Summary = { from: string; replyTo: string; to: string; subject: string; date: string; messageId: string; xOriginatingIp: string };

function extractIp(text: string): string {
  const m = text.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
  return m ? m[1] : '';
}

function parseReceivedHeaders(raw: string): Hop[] {
  // Split on newlines but fold continuation lines (lines starting with whitespace belong to the previous header)
  const unfolded = raw.replace(/\r\n/g, '\n').replace(/\n([ \t])/g, ' $1');
  const lines = unfolded.split('\n');
  const hops: Hop[] = [];

  let current = '';
  for (const line of lines) {
    if (/^Received:/i.test(line)) {
      if (current) {
        const hop = parseOneReceived(current);
        if (hop) hops.push(hop);
      }
      current = line;
    } else if (current && /^\s/.test(line)) {
      current += ' ' + line.trim();
    } else {
      if (current) {
        const hop = parseOneReceived(current);
        if (hop) hops.push(hop);
        current = '';
      }
    }
  }
  if (current) {
    const hop = parseOneReceived(current);
    if (hop) hops.push(hop);
  }
  return hops;
}

function parseOneReceived(line: string): Hop | null {
  const value = line.replace(/^Received:\s*/i, '');
  const fromM = value.match(/from\s+([^\s]+)/i);
  const byM = value.match(/by\s+([^\s]+)/i);
  const forPart = value.split(/;\s*/);
  const timestamp = forPart.length > 1 ? forPart[forPart.length - 1].trim() : '';
  return {
    from: fromM ? fromM[1] : '',
    by: byM ? byM[1] : '',
    ip: extractIp(value),
    timestamp,
    raw: value,
  };
}

function parseAuth(raw: string): AuthResult {
  const unfolded = raw.replace(/\r\n/g, '\n').replace(/\n([ \t])/g, ' ');
  const result: AuthResult = { spf: 'none', dkim: 'none', dmarc: 'none' };

  const spfLine = unfolded.match(/(?:Authentication-Results|Received-SPF)[^\n]*spf=(\w+)/i);
  if (spfLine) result.spf = spfLine[1].toLowerCase();

  const spfHeader = unfolded.match(/^Received-SPF:\s*(\w+)/im);
  if (spfHeader && result.spf === 'none') result.spf = spfHeader[1].toLowerCase();

  const dkimLine = unfolded.match(/dkim=(\w+)/i);
  if (dkimLine) result.dkim = dkimLine[1].toLowerCase();

  const dmarcLine = unfolded.match(/dmarc=(\w+)/i);
  if (dmarcLine) result.dmarc = dmarcLine[1].toLowerCase();

  return result;
}

function parseSummary(raw: string): Summary {
  const unfolded = raw.replace(/\r\n/g, '\n').replace(/\n([ \t])/g, ' ');
  const get = (header: string) => {
    const m = unfolded.match(new RegExp(`^${header}:\\s*(.+)`, 'im'));
    return m ? m[1].trim() : '';
  };
  return {
    from: get('From'),
    replyTo: get('Reply-To'),
    to: get('To'),
    subject: get('Subject'),
    date: get('Date'),
    messageId: get('Message-ID'),
    xOriginatingIp: get('X-Originating-IP'),
  };
}

function statusColor(val: string) {
  if (['pass', 'passed'].includes(val)) return '#1e9eff';
  if (['fail', 'failed', 'reject', 'quarantine'].includes(val)) return '#ff3a3a';
  return '#ffaa00';
}

export default function EmailHeaderAnalyzer() {
  const [raw, setRaw] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [hops, setHops] = useState<Hop[]>([]);
  const [auth, setAuth] = useState<AuthResult | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const analyze = () => {
    if (!raw.trim()) return;
    setHops(parseReceivedHeaders(raw));
    setAuth(parseAuth(raw));
    setSummary(parseSummary(raw));
    setAnalyzed(true);
  };

  const reset = () => { setRaw(''); setAnalyzed(false); setHops([]); setAuth(null); setSummary(null); };

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
        .input-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .input-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .header-textarea { width: 100%; background: #0a1520; border: 1px solid rgba(30,158,255,0.3); color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 12px; line-height: 1.6; padding: 16px 20px; resize: vertical; outline: none; min-height: 200px; }
        .header-textarea::placeholder { color: #3d5870; }
        .btn-row { display: flex; gap: 12px; margin-top: 16px; }
        .analyze-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .analyze-btn:hover { background: #4db8ff; }
        .reset-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.15); padding: 14px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .reset-btn:hover { color: #7a9bb5; border-color: rgba(30,158,255,0.3); }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .auth-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .auth-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px 24px; }
        .auth-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 8px; }
        .auth-value { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .summary-row { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 14px 20px; }
        .summary-key { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 4px; }
        .summary-val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; word-break: break-all; }
        .hop-list { display: flex; flex-direction: column; gap: 2px; }
        .hop-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 16px 20px; display: grid; grid-template-columns: 32px 1fr; gap: 16px; align-items: start; }
        .hop-num { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: #3d5870; }
        .hop-from { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #c0cfe0; margin-bottom: 4px; }
        .hop-by { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #7a9bb5; margin-bottom: 4px; }
        .hop-ip { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #1e9eff; margin-bottom: 4px; }
        .hop-ts { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #3d5870; }
        .ip-lookup { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #1e9eff; text-decoration: none; margin-left: 12px; }
        .ip-lookup:hover { color: #4db8ff; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .input-wrap { padding: 24px 20px; }
          .btn-row { flex-direction: column; }
          .analyze-btn, .reset-btn { width: 100%; text-align: center; }
          .results-wrap { padding: 0 20px 60px; }
          .auth-grid { grid-template-columns: 1fr; }
          .summary-grid { grid-template-columns: 1fr; }
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
          <div className="hamburger" onClick={() => document.getElementById('emailMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="emailMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('emailMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">OSINT Hub — Communications Intelligence</div>
            </div>
            <div className="tool-title">Email Header Analyzer</div>
            <p className="tool-desc">Paste raw email headers to reveal the full routing path, originating IP, authentication results (SPF / DKIM / DMARC), and timestamps. Runs entirely in your browser — no data leaves your device.</p>
          </div>
        </div>

        <div className="input-wrap">
          <div className="input-label">Paste raw email headers below</div>
          <textarea
            className="header-textarea"
            placeholder={`Received: from mail.example.com ([192.168.1.1]) by mx.google.com ...\nFrom: sender@example.com\nTo: recipient@gmail.com\nSubject: Test Email\n...`}
            value={raw}
            onChange={e => setRaw(e.target.value)}
          />
          <div className="btn-row">
            <button className="analyze-btn" onClick={analyze}>Analyze Headers →</button>
            {analyzed && <button className="reset-btn" onClick={reset}>Clear</button>}
          </div>
        </div>

        {analyzed && (
          <div className="results-wrap">

            {auth && (
              <div>
                <div className="section-label">Authentication Results</div>
                <div className="auth-grid">
                  {(['spf', 'dkim', 'dmarc'] as const).map(k => (
                    <div className="auth-card" key={k}>
                      <div className="auth-label">{k.toUpperCase()}</div>
                      <div className="auth-value" style={{color: statusColor(auth[k])}}>{auth[k]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary && (
              <div>
                <div className="section-label">Message Summary</div>
                <div className="summary-grid">
                  {([
                    ['From', summary.from],
                    ['Reply-To', summary.replyTo],
                    ['To', summary.to],
                    ['Subject', summary.subject],
                    ['Date', summary.date],
                    ['Message-ID', summary.messageId],
                    ['X-Originating-IP', summary.xOriginatingIp],
                  ] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
                    <div className="summary-row" key={k}>
                      <div className="summary-key">{k}</div>
                      <div className="summary-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hops.length > 0 && (
              <div>
                <div className="section-label">Routing Path — {hops.length} hop{hops.length !== 1 ? 's' : ''} detected</div>
                <div className="hop-list">
                  {hops.map((hop, i) => (
                    <div className="hop-card" key={i}>
                      <div className="hop-num">{String(i + 1).padStart(2, '0')}</div>
                      <div>
                        {hop.from && <div className="hop-from">From: {hop.from}</div>}
                        {hop.by && <div className="hop-by">By: {hop.by}</div>}
                        {hop.ip && (
                          <div className="hop-ip">
                            IP: {hop.ip}
                            <a href={`/osint/ip?ip=${hop.ip}`} className="ip-lookup">Look up →</a>
                          </div>
                        )}
                        {hop.timestamp && <div className="hop-ts">{hop.timestamp}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hops.length === 0 && (
              <div style={{fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', letterSpacing: '2px', color: '#3d5870'}}>
                No Received headers found — paste the full email header block
              </div>
            )}
          </div>
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
