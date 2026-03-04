'use client';
import { useState } from 'react';

export default function DNSIntel() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('intel');

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const res = await fetch(`/api/dns?domain=${clean}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (Object.keys(data.records).length === 0) throw new Error('No DNS records found for this domain.');
      setResult(data);
      setActiveTab('intel');
    } catch (e: any) {
      setError(`// ${e.message}`);
    }
    setLoading(false);
  };

  const RECORD_COLORS: Record<string, string> = {
    A: '#1e9eff', AAAA: '#4db8ff', MX: '#00ff88', TXT: '#ffaa00',
    NS: '#ff6b35', CNAME: '#c084fc', SOA: '#f472b6', CAA: '#fb923c',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #00ff88; }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .results { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
        .tabs { display: flex; gap: 2px; margin-bottom: 2px; }
        .tab { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 10px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .tab:hover { color: #1e9eff; }
        .tab.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .intel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; }
        .intel-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 28px; }
        .intel-card.full { grid-column: 1 / -1; }
        .intel-card.highlight { border-color: rgba(0,255,136,0.2); background: #0a1f18; }
        .intel-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 12px; }
        .intel-value { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: #00ff88; margin-bottom: 4px; }
        .intel-value.blue { color: #1e9eff; }
        .intel-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
        .intel-item { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 1px; padding: 6px 10px; background: rgba(30,158,255,0.04); border-left: 2px solid rgba(30,158,255,0.3); }
        .intel-item.green { border-left-color: #00ff88; color: #00ff88; }
        .intel-item.orange { border-left-color: #ffaa00; color: #ffaa00; }
        .intel-item.red { border-left-color: #ff3a3a; color: #ff3a3a; }
        .service-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .service-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); padding: 4px 12px; text-transform: uppercase; background: rgba(30,158,255,0.06); }
        .records-wrap { display: flex; flex-direction: column; gap: 2px; }
        .record-section { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); }
        .record-header { padding: 16px 24px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .record-type-badge { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 2px; padding: 4px 12px; border: 1px solid; }
        .record-count { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .record-rows { display: flex; flex-direction: column; }
        .record-row { padding: 12px 24px; border-bottom: 1px solid rgba(30,158,255,0.04); display: grid; grid-template-columns: 80px 60px 1fr; gap: 16px; align-items: start; }
        .record-row:last-child { border-bottom: none; }
        .record-name { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; letter-spacing: 1px; word-break: break-all; }
        .record-ttl { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; }
        .record-data { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c0cfe0; letter-spacing: 1px; word-break: break-all; line-height: 1.6; }
        .domain-header { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); padding: 24px 28px; margin-bottom: 2px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .domain-name { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; }
        .record-count-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .count-pill { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; padding: 3px 10px; border: 1px solid; }
        .raw-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; margin-bottom: 8px; word-break: break-all; letter-spacing: 1px; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: #1e9eff; border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
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
          .intel-grid { grid-template-columns: 1fr; }
          .record-row { grid-template-columns: 1fr; gap: 4px; }
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
            <li><a href="/osint" style={{color:'#00ff88'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('dnsMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="dnsMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('dnsMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">// OSINT Hub — Infrastructure Intelligence</div>
            </div>
            <div className="tool-title">DNS Intelligence</div>
            <p className="tool-desc">Reveal the full infrastructure behind any domain — email providers, DNS hosts, third-party services, security posture, and all DNS records decoded into plain English.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Enter domain — e.g. google.com, ruddreport.net"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
            />
            <button className="search-btn" onClick={lookup} disabled={loading}>
              {loading ? 'Scanning...' : 'Analyze →'}
            </button>
          </div>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">// Querying DNS records...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}
          {result && (
            <>
              <div className="domain-header">
                <div className="domain-name">{result.domain}</div>
                <div className="record-count-pills">
                  {Object.entries(result.records).map(([type, records]: any) => (
                    <div key={type} className="count-pill" style={{color: RECORD_COLORS[type] || '#c0cfe0', borderColor: RECORD_COLORS[type] || '#c0cfe0'}}>
                      {type} ×{records.length}
                    </div>
                  ))}
                </div>
              </div>

              <div className="tabs">
                <button className={`tab ${activeTab === 'intel' ? 'active' : ''}`} onClick={() => setActiveTab('intel')}>// Intelligence</button>
                <button className={`tab ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>// Raw Records</button>
              </div>

              {activeTab === 'intel' && (
                <div className="intel-grid">
                  {result.intelligence.emailProvider && (
                    <div className="intel-card highlight">
                      <div className="intel-label">// Email Provider</div>
                      <div className="intel-value">{result.intelligence.emailProvider}</div>
                    </div>
                  )}
                  {result.intelligence.dnsProvider && (
                    <div className="intel-card highlight">
                      <div className="intel-label">// DNS / CDN Provider</div>
                      <div className="intel-value blue">{result.intelligence.dnsProvider}</div>
                    </div>
                  )}
                  {result.intelligence.services.length > 0 && (
                    <div className="intel-card full">
                      <div className="intel-label">// Detected Third-Party Services</div>
                      <div className="service-tags">
                        {result.intelligence.services.map((s: string) => (
                          <div key={s} className="service-tag">{s}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.intelligence.spfDecoded && (
                    <div className="intel-card full">
                      <div className="intel-label">// SPF Policy — Decoded</div>
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
                      <div className="intel-label">// DMARC Policy — Decoded</div>
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
                      <div className="intel-label">// Intelligence</div>
                      <div style={{fontFamily:'Share Tech Mono', fontSize:'11px', color:'#3d5870', letterSpacing:'2px'}}>// Limited intelligence available. Check Raw Records tab.</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'records' && (
                <div className="records-wrap">
                  {Object.entries(result.records).map(([type, records]: any) => (
                    <div key={type} className="record-section">
                      <div className="record-header">
                        <div className="record-type-badge" style={{color: RECORD_COLORS[type] || '#c0cfe0', borderColor: RECORD_COLORS[type] || '#c0cfe0'}}>
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
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}