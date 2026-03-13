'use client';
import { useState } from 'react';

type CvssScore = { baseScore: number; baseSeverity: string; vectorString: string };
type Cve = {
  id: string;
  published: string;
  lastModified: string;
  description: string;
  cvss31?: CvssScore;
  cvss30?: CvssScore;
  cvss2?: { baseScore: number; baseSeverity: string };
  references: string[];
  weaknesses: string[];
};

function parseVulnerabilities(data: any): Cve[] {
  if (!data?.vulnerabilities) return [];
  return data.vulnerabilities.map((v: any) => {
    const cve = v.cve;
    const desc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || '';
    const refs = (cve.references || []).map((r: any) => r.url).slice(0, 6);
    const weaknesses = (cve.weaknesses || [])
      .flatMap((w: any) => w.description || [])
      .map((d: any) => d.value)
      .filter(Boolean)
      .slice(0, 4);

    let cvss31: CvssScore | undefined;
    let cvss30: CvssScore | undefined;
    let cvss2: { baseScore: number; baseSeverity: string } | undefined;

    for (const m of cve.metrics?.cvssMetricV31 || []) {
      if (m.cvssData) {
        cvss31 = { baseScore: m.cvssData.baseScore, baseSeverity: m.cvssData.baseSeverity, vectorString: m.cvssData.vectorString };
        break;
      }
    }
    for (const m of cve.metrics?.cvssMetricV30 || []) {
      if (m.cvssData) {
        cvss30 = { baseScore: m.cvssData.baseScore, baseSeverity: m.cvssData.baseSeverity, vectorString: m.cvssData.vectorString };
        break;
      }
    }
    for (const m of cve.metrics?.cvssMetricV2 || []) {
      if (m.cvssData) {
        cvss2 = { baseScore: m.cvssData.baseScore, baseSeverity: m.baseSeverity || '' };
        break;
      }
    }

    return { id: cve.id, published: cve.published, lastModified: cve.lastModified, description: desc, cvss31, cvss30, cvss2, references: refs, weaknesses };
  });
}

function severityColor(sev: string) {
  const s = sev.toUpperCase();
  if (s === 'CRITICAL') return '#ff3a3a';
  if (s === 'HIGH') return '#ff6b35';
  if (s === 'MEDIUM') return '#ffaa00';
  if (s === 'LOW') return '#00ff88';
  return '#7a9bb5';
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return iso; }
}

export default function CVESearch() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'id' | 'keyword'>('id');
  const [cves, setCves] = useState<Cve[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setCves([]);
    setDone(false);

    try {
      const param = mode === 'id' ? `id=${encodeURIComponent(query.trim())}` : `keyword=${encodeURIComponent(query.trim())}`;
      const res = await fetch(`/api/osint/cve?${param}`);
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        const parsed = parseVulnerabilities(data);
        setCves(parsed);
        setTotal(data.totalResults || parsed.length);
      }
      setDone(true);
    } catch {
      setError('Request failed. Try again.');
      setDone(true);
    } finally {
      setLoading(false);
    }
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
        .mode-toggle { display: flex; gap: 2px; margin-bottom: 16px; }
        .mode-btn { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .mode-btn:hover { color: #1e9eff; }
        .mode-btn.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
        .results-header { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #ff3a3a; padding: 20px 0; }
        .not-found { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #3d5870; padding: 20px 0; text-transform: uppercase; }
        .cve-list { display: flex; flex-direction: column; gap: 2px; }
        .cve-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 28px 32px; }
        .cve-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
        .cve-id { font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 700; color: #c0cfe0; letter-spacing: 2px; }
        .cve-dates { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; margin-top: 4px; }
        .cvss-block { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .cvss-score { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; }
        .cvss-info { display: flex; flex-direction: column; gap: 3px; }
        .cvss-severity { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; letter-spacing: 2px; }
        .cvss-version { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .cvss-vector { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #3d5870; }
        .cve-desc { font-size: 14px; font-weight: 300; color: #7a9bb5; line-height: 1.8; margin-bottom: 16px; }
        .cwe-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .cwe-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #ffaa00; border: 1px solid rgba(255,170,0,0.2); padding: 3px 10px; background: rgba(255,170,0,0.05); }
        .refs-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 8px; }
        .refs-list { display: flex; flex-direction: column; gap: 4px; }
        .ref-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #1e9eff; text-decoration: none; word-break: break-all; transition: color 0.3s; }
        .ref-link:hover { color: #4db8ff; }
        .loading { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #1e9eff; animation: pulse 1s infinite; padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .search-wrap { padding: 24px 20px; }
          .search-box { flex-direction: column; }
          .mode-toggle { flex-wrap: wrap; }
          .results-wrap { padding: 0 20px 60px; }
          .cve-card { padding: 20px; }
          .cve-header { flex-direction: column; }
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
          <div className="hamburger" onClick={() => document.getElementById('cveMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="cveMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('cveMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">// OSINT Hub — Vulnerability Intelligence</div>
            </div>
            <div className="tool-title">CVE Search</div>
            <p className="tool-desc">Search the NIST National Vulnerability Database by CVE ID (e.g. CVE-2021-44228) or keyword. Displays CVSS severity scores, attack vectors, affected weaknesses (CWE), and official references. Powered by the NVD API.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'id' ? 'active' : ''}`} onClick={() => setMode('id')}>CVE ID</button>
            <button className={`mode-btn ${mode === 'keyword' ? 'active' : ''}`} onClick={() => setMode('keyword')}>Keyword</button>
          </div>
          <div className="search-box">
            <input
              className="search-input"
              placeholder={mode === 'id' ? 'CVE-2021-44228' : 'Search keyword — e.g. log4j, Apache, RCE'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && search()}
            />
            <button className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
        </div>

        <div className="results-wrap">
          {loading && <div className="loading">// Querying NIST NVD...</div>}
          {error && <div className="error-msg">// Error: {error}</div>}

          {done && !loading && !error && (
            <>
              {cves.length === 0 ? (
                <div className="not-found">// No vulnerabilities found</div>
              ) : (
                <>
                  <div className="results-header">
                    // {total.toLocaleString()} result{total !== 1 ? 's' : ''} — showing {cves.length}
                  </div>
                  <div className="cve-list">
                    {cves.map((cve, i) => {
                      const score = cve.cvss31 || cve.cvss30;
                      const scoreNum = score?.baseScore ?? cve.cvss2?.baseScore;
                      const sev = score?.baseSeverity || cve.cvss2?.baseSeverity || '';
                      const version = cve.cvss31 ? 'CVSS 3.1' : cve.cvss30 ? 'CVSS 3.0' : cve.cvss2 ? 'CVSS 2.0' : '';
                      return (
                        <div key={i} className="cve-card">
                          <div className="cve-header">
                            <div>
                              <div className="cve-id">{cve.id}</div>
                              <div className="cve-dates">
                                Published: {formatDate(cve.published)} &nbsp;|&nbsp; Modified: {formatDate(cve.lastModified)}
                              </div>
                            </div>
                            {scoreNum !== undefined && (
                              <div className="cvss-block">
                                <div className="cvss-score" style={{color: severityColor(sev)}}>{scoreNum.toFixed(1)}</div>
                                <div className="cvss-info">
                                  <div className="cvss-severity" style={{color: severityColor(sev)}}>{sev}</div>
                                  <div className="cvss-version">{version}</div>
                                  {score?.vectorString && <div className="cvss-vector">{score.vectorString}</div>}
                                </div>
                              </div>
                            )}
                          </div>

                          <p className="cve-desc">{cve.description}</p>

                          {cve.weaknesses.length > 0 && (
                            <div className="cwe-row">
                              {cve.weaknesses.map((cwe, j) => (
                                <span key={j} className="cwe-badge">{cwe}</span>
                              ))}
                            </div>
                          )}

                          {cve.references.length > 0 && (
                            <div>
                              <div className="refs-label">// References</div>
                              <div className="refs-list">
                                {cve.references.map((ref, j) => (
                                  <a key={j} href={ref} target="_blank" rel="noopener noreferrer" className="ref-link">{ref}</a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
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
