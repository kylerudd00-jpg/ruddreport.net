'use client';
import { useState, useEffect } from 'react';

export default function DNSIntel() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('intel');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setDomain(q); runLookup(q); }
  }, []);

  const runLookup = async (override?: string) => {
    const target = (override ?? domain).trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const clean = target.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const res = await fetch(`/api/dns?domain=${clean}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (Object.keys(data.records).length === 0) throw new Error('No DNS records found for this domain.');
      setResult(data);
      setActiveTab('intel');
    } catch (e: any) {
      setError(`${e.message}`);
    }
    setLoading(false);
  };

  const lookup = () => runLookup();
  const runExample = (v: string) => { setDomain(v); runLookup(v); };

  const RECORD_COLORS: Record<string, string> = {
    A: '#1e9eff', AAAA: '#4db8ff', MX: '#1e9eff', TXT: '#ffaa00',
    NS: '#ff6b35', CNAME: '#c084fc', SOA: '#f472b6', CAA: '#fb923c',
  };

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 24px; }
        .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
        .ex-row button { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
        .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }
        .results { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
        .tabs { display: flex; gap: 2px; margin-bottom: 2px; }
        .tab { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); padding: 10px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.2s; }
        .tab:hover { color: var(--accent); }
        .tab.active { color: var(--accent); border-color: var(--accent); background: var(--bg-card-hover); }
        .intel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .intel-card { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; }
        .intel-card.full { grid-column: 1 / -1; }
        .intel-card.highlight { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .intel-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; }
        .intel-value { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
        .intel-value.blue { color: var(--accent); }
        .intel-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .intel-item { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.02em; padding: 6px 10px; background: var(--bg-secondary); border-left: 2px solid var(--border-bright); }
        .intel-item.green { border-left-color: #22cc66; color: #22cc66; }
        .intel-item.orange { border-left-color: #ffaa00; color: #ffaa00; }
        .intel-item.red { border-left-color: var(--red); color: var(--red); }
        .service-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .service-tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); border: 1px solid var(--border-bright); padding: 4px 12px; text-transform: uppercase; background: var(--bg-secondary); }
        .records-wrap { display: flex; flex-direction: column; gap: 2px; }
        .record-section { background: var(--bg-card); border: 1px solid var(--border); }
        .record-header { padding: 16px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
        .record-type-badge { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.05em; padding: 4px 12px; border: 1px solid; }
        .record-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .record-rows { display: flex; flex-direction: column; }
        .record-row { padding: 12px 24px; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 80px 60px 1fr; gap: 16px; align-items: start; }
        .record-row:last-child { border-bottom: none; }
        .record-name { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.02em; word-break: break-all; }
        .record-ttl { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
        .record-data { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.02em; word-break: break-all; line-height: 1.6; }
        .domain-header { background: var(--bg-card); border: 1px solid var(--border); padding: 24px 28px; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .domain-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; }
        .record-count-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .count-pill { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.02em; padding: 3px 10px; border: 1px solid; }
        .raw-label { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-bottom: 8px; word-break: break-all; letter-spacing: 0.02em; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--red); padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 20px 60px; }
          .intel-grid { grid-template-columns: 1fr; }
          .record-row { grid-template-columns: 1fr; gap: 4px; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Infrastructure Intelligence</div>
            </div>
            <h1 className="tool-title">DNS Intelligence</h1>
            <p className="tool-desc">Map a domain&apos;s DNS records to see who hosts it and runs its email.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Domain to look up"
              placeholder="Enter domain — e.g. google.com, ruddreport.net"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button type="button" className="search-btn" onClick={lookup} disabled={loading}>
              {loading ? 'Scanning...' : 'Analyze →'}
            </button>
          </div>
          <div className="ex-row" role="group" aria-label="Examples to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['google.com'].map(v => (
              <button key={v} type="button" onClick={() => runExample(v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">Querying DNS records...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}
          {result && (
            <>
              <div className="domain-header">
                <div className="domain-name">{result.domain}</div>
                <div className="record-count-pills">
                  {Object.entries(result.records).map(([type, records]: any) => (
                    <div key={type} className="count-pill" style={{color: RECORD_COLORS[type] || 'var(--text-primary)', borderColor: RECORD_COLORS[type] || 'var(--text-primary)'}}>
                      {type} ×{records.length}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tabs">
                <button className={`tab ${activeTab === 'intel' ? 'active' : ''}`} onClick={() => setActiveTab('intel')}>Intelligence</button>
                <button className={`tab ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>Raw Records</button>
              </div>

              {activeTab === 'intel' && (
                <div className="intel-grid">
                  {result.intelligence.emailProvider && (
                    <div className="intel-card highlight">
                      <div className="intel-label">Email Provider</div>
                      <div className="intel-value">{result.intelligence.emailProvider}</div>
                    </div>
                  )}
                  {result.intelligence.dnsProvider && (
                    <div className="intel-card highlight">
                      <div className="intel-label">DNS / CDN Provider</div>
                      <div className="intel-value blue">{result.intelligence.dnsProvider}</div>
                    </div>
                  )}
                  {result.intelligence.services.length > 0 && (
                    <div className="intel-card full">
                      <div className="intel-label">Detected Third-Party Services</div>
                      <div className="service-tags">
                        {result.intelligence.services.map((s: string) => (
                          <div key={s} className="service-tag">{s}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.intelligence.spfDecoded && (
                    <div className="intel-card full">
                      <div className="intel-label">SPF Policy — Decoded</div>
                      <div className="raw-label">{result.intelligence.spfRaw}</div>
                      <div className="intel-list">
                        {result.intelligence.spfDecoded.map((line: string, i: number) => (
                          <div key={i} className={`intel-item ${line.includes('Reject') || line.includes('strict') ? 'green' : line.includes('Allow') ? 'orange' : line.includes('dangerous') ? 'red' : ''}`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.intelligence.dmarcDecoded && (
                    <div className="intel-card full">
                      <div className="intel-label">DMARC Policy — Decoded</div>
                      <div className="raw-label">{result.intelligence.dmarcRaw}</div>
                      <div className="intel-list">
                        {result.intelligence.dmarcDecoded.map((line: string, i: number) => (
                          <div key={i} className={`intel-item ${line.includes('Reject') ? 'green' : line.includes('Monitor') ? 'orange' : ''}`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!result.intelligence.emailProvider && !result.intelligence.dnsProvider && result.intelligence.services.length === 0 && !result.intelligence.spfDecoded && !result.intelligence.dmarcDecoded && (
                    <div className="intel-card full">
                      <div className="intel-label">Intelligence</div>
                      <div style={{fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)', letterSpacing:'0.02em'}}>Limited intelligence available. Check Raw Records tab.</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'records' && (
                <div className="records-wrap">
                  {Object.entries(result.records).map(([type, records]: any) => (
                    <div key={type} className="record-section">
                      <div className="record-header">
                        <div className="record-type-badge" style={{color: RECORD_COLORS[type] || 'var(--text-primary)', borderColor: RECORD_COLORS[type] || 'var(--text-primary)'}}>
                          {type}
                        </div>
                        <div className="record-count">{records.length} record{records.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div className="record-rows">
                        {records.map((r: any, i: number) => (
                          <div key={i} className="record-row">
                            <div className="record-name">{r.name}</div>
                            <div className="record-ttl">{r.TTL}s</div>
                            <div className="record-data">{r.data}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
