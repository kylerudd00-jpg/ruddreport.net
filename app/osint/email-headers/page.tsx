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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .input-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .input-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .header-textarea { width: 100%; background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; line-height: 1.6; padding: 16px 20px; resize: vertical; min-height: 200px; }
        .header-textarea::placeholder { color: var(--text-muted); }
        .btn-row { display: flex; gap: 12px; margin-top: 16px; }
        .analyze-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #ffffff; background: var(--accent); border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .analyze-btn:hover { background: #4db8ff; }
        .reset-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 14px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .reset-btn:hover { color: var(--text-secondary); border-color: var(--border-bright); }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .auth-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .auth-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 24px; }
        .auth-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .auth-value { font-family: var(--font-display); font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .summary-row { background: var(--bg-card); border: 1px solid var(--border); padding: 14px 20px; }
        .summary-key { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
        .summary-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); word-break: break-all; }
        .hop-list { display: flex; flex-direction: column; gap: 2px; }
        .hop-card { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; display: grid; grid-template-columns: 32px 1fr; gap: 16px; align-items: start; }
        .hop-num { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--text-muted); }
        .hop-from { font-family: var(--font-mono); font-size: 11px; color: var(--text-primary); margin-bottom: 4px; }
        .hop-by { font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); margin-bottom: 4px; }
        .hop-ip { font-family: var(--font-mono); font-size: 10px; color: var(--accent); margin-bottom: 4px; }
        .hop-ts { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); }
        .ip-lookup { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; margin-left: 12px; }
        .ip-lookup:hover { color: #4db8ff; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 768px) {
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

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">OSINT Hub — Communications Intelligence</div>
            </div>
            <h1 className="tool-title">Email Header Analyzer</h1>
            <p className="tool-desc">Every email carries a hidden trail showing exactly where it came from, every server it passed through, and whether the sender's identity checks out. Paste raw email headers here to trace the originating IP, verify SPF/DKIM/DMARC authentication, and catch spoofed or phishing emails. Runs entirely in your browser.</p>
          </div>
        </div>

        <div className="input-wrap">
          <div className="input-label">Paste raw email headers below</div>
          <textarea
            className="header-textarea"
            aria-label="Raw email headers"
            placeholder={`Received: from mail.example.com ([192.168.1.1]) by mx.google.com ...\nFrom: sender@example.com\nTo: recipient@gmail.com\nSubject: Test Email\n...`}
            value={raw}
            onChange={e => setRaw(e.target.value)}
          />
          <div className="btn-row">
            <button type="button" className="analyze-btn" onClick={analyze}>Analyze Headers →</button>
            {analyzed && <button type="button" className="reset-btn" onClick={reset}>Clear</button>}
          </div>
        </div>

        {analyzed && (
          <div className="results-wrap" aria-live="polite">

            {auth && (
              <div>
                <h2 className="section-label">Authentication Results</h2>
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
                <h2 className="section-label">Message Summary</h2>
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
                <h2 className="section-label">Routing Path — {hops.length} hop{hops.length !== 1 ? 's' : ''} detected</h2>
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
              <div role="alert" style={{fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)'}}>
                No Received headers found — paste the full email header block
              </div>
            )}
          </div>
        )}

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>

          </div>
        </footer>
      </main>
    </>
  );
}
