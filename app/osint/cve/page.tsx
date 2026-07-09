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
  if (s === 'LOW') return '#1e9eff';
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

  const runSearch = async (q: string, m: 'id' | 'keyword') => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setCves([]);
    setDone(false);

    try {
      const param = m === 'id' ? `id=${encodeURIComponent(q.trim())}` : `keyword=${encodeURIComponent(q.trim())}`;
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
  const search = () => runSearch(query, mode);
  const runExample = (v: string) => {
    const m = /^CVE-/i.test(v) ? 'id' : 'keyword';
    setMode(m);
    setQuery(v);
    runSearch(v, m);
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
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .mode-toggle { display: flex; gap: 2px; margin-bottom: 16px; }
        .mode-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .mode-btn:hover { color: var(--accent); }
        .mode-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(30,158,255,0.08); }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-display); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 16px 0 0; }
        .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
        .ex-row button { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
        .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; }
        .results-header { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 20px 0; }
        .not-found { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); padding: 20px 0; text-transform: uppercase; }
        .cve-list { display: flex; flex-direction: column; gap: 2px; }
        .cve-card { background: var(--bg-card); border: 1px solid var(--border); padding: 28px 32px; }
        .cve-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 16px; flex-wrap: wrap; }
        .cve-id { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; }
        .cve-dates { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 4px; }
        .cvss-block { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .cvss-score { font-family: var(--font-display); font-size: 28px; font-weight: 900; }
        .cvss-info { display: flex; flex-direction: column; gap: 3px; }
        .cvss-severity { font-family: var(--font-display); font-size: 13px; font-weight: 700; letter-spacing: 0.05em; }
        .cvss-version { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .cvss-vector { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .cve-desc { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px; }
        .cwe-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .cwe-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; border: 1px solid rgba(255,170,0,0.2); padding: 3px 10px; background: rgba(255,170,0,0.05); }
        .refs-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .refs-list { display: flex; flex-direction: column; gap: 4px; }
        .ref-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; word-break: break-all; transition: color 0.3s; }
        .ref-link:hover { color: #4db8ff; }
        .loading { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); animation: pulse 1s infinite; padding: 20px 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 768px) {
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

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">OSINT Hub — Vulnerability Intelligence</div>
            </div>
            <h1 className="tool-title">CVE Search</h1>
            <p className="tool-desc">Look up a software vulnerability by CVE ID or keyword to see its severity and impact.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="mode-toggle">
            <button type="button" className={`mode-btn ${mode === 'id' ? 'active' : ''}`} onClick={() => setMode('id')}>CVE ID</button>
            <button type="button" className={`mode-btn ${mode === 'keyword' ? 'active' : ''}`} onClick={() => setMode('keyword')}>Keyword</button>
          </div>
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Search CVEs by ID or keyword"
              placeholder={mode === 'id' ? 'CVE-2021-44228' : 'Search keyword — e.g. log4j, Apache, RCE'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && search()}
            />
            <button type="button" className="search-btn" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>
          <div className="ex-row" role="group" aria-label="Examples to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['CVE-2021-44228', 'log4j'].map(v => (
              <button key={v} type="button" onClick={() => runExample(v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className="results-wrap" aria-live="polite">
          {loading && <div className="loading">Querying NIST NVD...</div>}
          {error && <div className="error-msg" role="alert">Error: {error}</div>}

          {done && !loading && !error && (
            <>
              {cves.length === 0 ? (
                <div className="not-found">No vulnerabilities found</div>
              ) : (
                <>
                  <div className="results-header">
                    {total.toLocaleString()} result{total !== 1 ? 's' : ''} — showing {cves.length}
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
                              <div className="refs-label">References</div>
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
            <div className="footer-copy">© 2026 The Rudd Report</div>
            
          </div>
        </footer>
      </main>
    </>
  );
}
