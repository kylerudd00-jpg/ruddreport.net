'use client';
import { useState, useEffect } from 'react';

type IoCType = 'ip' | 'hash_md5' | 'hash_sha1' | 'hash_sha256' | 'url' | 'domain' | 'unknown';

interface ShodanResult {
  ip: string;
  ports?: number[];
  vulns?: string[];
  hostnames?: string[];
  tags?: string[];
  cpes?: string[];
}

interface GreyNoiseResult {
  ip: string;
  noise: boolean;
  riot: boolean;
  classification?: string;
  name?: string;
  link?: string;
  message?: string;
}

interface IPInfoResult {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  hostname?: string;
  loc?: string;
}

interface MalwareBazaarResult {
  query_status: string;
  data?: {
    file_name?: string;
    file_type_mime?: string;
    file_size?: number;
    md5_hash?: string;
    sha1_hash?: string;
    sha256_hash?: string;
    imphash?: string;
    ssdeep?: string;
    first_seen?: string;
    last_seen?: string;
    signature?: string | null;
    tags?: string[];
    vendor_intel?: Record<string, any>;
    delivery_method?: string;
    intelligence?: { downloads?: number; uploads?: number; };
  }[];
}

interface URLScanResult {
  results?: { page?: { domain?: string; url?: string; ip?: string; country?: string; }; stats?: any; }[];
  total?: number;
}

interface IoCResult {
  value: string;
  type: IoCType;
  results: {
    shodan?: ShodanResult;
    greynoise?: GreyNoiseResult;
    ipinfo?: IPInfoResult;
    malwarebazaar?: MalwareBazaarResult;
    urlscan?: URLScanResult;
  };
  checked: string;
  error?: string;
}

function typeLabel(t: IoCType): string {
  switch (t) {
    case 'ip': return 'IPv4 Address';
    case 'hash_md5': return 'MD5 Hash';
    case 'hash_sha1': return 'SHA-1 Hash';
    case 'hash_sha256': return 'SHA-256 Hash';
    case 'url': return 'URL';
    case 'domain': return 'Domain';
    default: return 'Unknown';
  }
}

function typeColor(t: IoCType): string {
  if (t === 'ip') return '#1e9eff';
  if (t.startsWith('hash')) return '#ff4444';
  if (t === 'url' || t === 'domain') return '#ffaa00';
  return '#7a9bb5';
}

function externalLinks(value: string, type: IoCType): { label: string; url: string }[] {
  const enc = encodeURIComponent(value);
  if (type === 'ip') return [
    { label: 'VirusTotal', url: `https://www.virustotal.com/gui/ip-address/${value}` },
    { label: 'AbuseIPDB', url: `https://www.abuseipdb.com/check/${value}` },
    { label: 'Shodan', url: `https://www.shodan.io/host/${value}` },
    { label: 'Censys', url: `https://search.censys.io/hosts/${value}` },
  ];
  if (type.startsWith('hash')) return [
    { label: 'VirusTotal', url: `https://www.virustotal.com/gui/file/${value}` },
    { label: 'MalwareBazaar', url: `https://bazaar.abuse.ch/sample/${value}/` },
    { label: 'Hybrid Analysis', url: `https://www.hybrid-analysis.com/search?query=${enc}` },
    { label: 'Any.run', url: `https://app.any.run/` },
  ];
  if (type === 'domain' || type === 'url') return [
    { label: 'VirusTotal', url: `https://www.virustotal.com/gui/domain/${type === 'url' ? new URL(value).hostname : value}` },
    { label: 'URLScan.io', url: `https://urlscan.io/search/#domain:${type === 'url' ? new URL(value).hostname : value}` },
    { label: 'Shodan', url: `https://www.shodan.io/search?query=hostname:${type === 'url' ? new URL(value).hostname : value}` },
    { label: 'Censys', url: `https://search.censys.io/` },
  ];
  return [];
}

export default function IoCPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IoCResult | null>(null);

  async function runAnalyze(val: string) {
    const q = val.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/ioc?q=${encodeURIComponent(q)}&t=${Date.now()}`);
      setResult(await res.json());
    } catch {
      setResult({ value: q, type: 'unknown', results: {}, checked: new Date().toISOString(), error: 'Network error' });
    } finally {
      setLoading(false);
    }
  }
  const analyze = () => runAnalyze(input);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setInput(q); runAnalyze(q); }
  }, []);

  const color = result ? typeColor(result.type) : '#1e9eff';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-wrap { padding: 110px 40px 100px; max-width: 960px; margin: 0 auto; }
        .back-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 48px; }
        .back-link { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-secondary); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #1e9eff; }
        .back-sep { color: var(--text-muted); }

        .hero { margin-bottom: 40px; }
        .hero-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
        .hero-eyebrow-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: #1e9eff; text-transform: uppercase; }
        .hero-title { font-family: var(--font-display); font-size: clamp(28px, 5vw, 52px); font-weight: 900; color: #fff; letter-spacing: 0.05em; }
        .hero-title span { color: #1e9eff; }
        .hero-desc { font-family: var(--font-display); font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin-top: 16px; max-width: 640px; }

        .input-block { border: 1px solid var(--border); background: var(--bg-secondary); padding: 32px; margin-bottom: 2px; }
        .input-row { display: flex; gap: 2px; }
        .ioc-input { flex: 1; background: var(--bg-card); border: 1px solid var(--border-bright); padding: 16px 20px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); transition: border-color 0.2s; }
        .ioc-input::placeholder { color: var(--text-muted); }
        .ioc-input:focus { border-color: var(--border-bright); }
        .analyze-btn { font-family: var(--font-mono); font-size: 14px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 16px 32px; background: #1e9eff; border: none; color: #000; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .analyze-btn:hover { background: #3aadff; }
        .analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .input-hint { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 12px; letter-spacing: 0.05em; }

        .type-badge-row { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border: 1px solid var(--border); background: var(--bg-secondary); margin-bottom: 2px; }
        .type-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 4px 12px; border: 1px solid; }
        .type-value { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); word-break: break-all; }
        .type-time { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-left: auto; }

        .result-section { border: 1px solid var(--border); background: var(--bg-secondary); margin-bottom: 2px; overflow: hidden; }
        .section-header { padding: 16px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .section-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: #1e9eff; }
        .section-source { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); }
        .section-body { padding: 20px 24px; }

        .kv-grid { display: grid; grid-template-columns: 160px 1fr; gap: 10px 20px; }
        .kv-key { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; padding-top: 2px; }
        .kv-val { font-family: var(--font-display); font-size: 14px; color: var(--text-primary); word-break: break-all; }
        .kv-val.mono { font-family: var(--font-mono); font-size: 13px; }

        .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 8px; }

        .pill-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .pill { font-family: var(--font-mono); font-size: 12px; padding: 4px 10px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-secondary); }

        .noise-row { display: flex; gap: 16px; }
        .noise-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 6px 14px; border: 1px solid; }

        .ext-links { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .ext-link { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 8px 16px; border: 1px solid var(--border-bright); color: var(--text-secondary); text-decoration: none; transition: all 0.2s; }
        .ext-link:hover { border-color: #1e9eff; color: #1e9eff; }

        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; }
        .loading-orb { width: 36px; height: 36px; border: 2px solid var(--border); border-top-color: #1e9eff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }

        .empty-hint { border: 1px solid var(--border); padding: 48px; text-align: center; }
        .empty-hint-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .examples { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 20px; }
        .example-btn { font-family: var(--font-mono); font-size: 12px; padding: 6px 14px; background: var(--bg-card); border: 1px solid var(--border-bright); color: var(--text-muted); cursor: pointer; transition: all 0.2s; }
        .example-btn:hover { border-color: var(--border-bright); color: var(--text-secondary); }

        footer { border-top: 1px solid var(--border); padding: 40px; text-align: center; }
        .footer-text { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }

        @media (max-width: 768px) {
          .page-wrap { padding: 90px 20px 80px; }
          .input-row { flex-direction: column; }
          .kv-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
          <span className="back-sep">/</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2, color: '#1e9eff', textTransform: 'uppercase' }}>IoC Scanner</span>
        </div>

        <div className="hero">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" aria-hidden="true" />
            <div className="hero-eyebrow-text">Cyber // Indicator of Compromise Analysis</div>
          </div>
          <h1 className="hero-title">IoC <span>SCANNER</span></h1>
          <div className="hero-desc">
            Paste any IP address, domain, URL, or file hash. Auto-detected and checked against Shodan, GreyNoise, MalwareBazaar, and URLScan simultaneously.
          </div>
        </div>

        <div className="input-block">
          <div className="input-row">
            <input
              className="ioc-input"
              aria-label="Indicator of compromise: IP address, domain, URL, or file hash"
              placeholder="8.8.8.8 · example.com · https://... · d41d8cd98f00b204..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
            />
            <button type="button" className="analyze-btn" onClick={analyze} disabled={loading || !input.trim()}>
              {loading ? '...' : 'Analyze'}
            </button>
          </div>
          <div className="input-hint">
            Supports: IPv4 · Domain · URL · MD5 · SHA-1 · SHA-256
          </div>
        </div>

        <div aria-live="polite">
        {loading && (
          <div className="loading-wrap">
            <div className="loading-orb" />
            <div className="loading-text">Querying threat intel sources...</div>
          </div>
        )}

        {!loading && !result && (
          <div className="empty-hint">
            <div className="empty-hint-title">Enter an indicator to begin analysis</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              Results pull from Shodan InternetDB, GreyNoise Community, MalwareBazaar, and URLScan — no API keys required.
            </div>
            <div className="examples">
              {['8.8.8.8', 'shodan.io', '44d88612fea8a8f36de82e1278abb02f'].map(ex => (
                <button type="button" key={ex} className="example-btn" onClick={() => { setInput(ex); }}>{ex}</button>
              ))}
            </div>
          </div>
        )}

        {!loading && result && (
          <>
            <div className="type-badge-row">
              <div className="type-badge" style={{ color, borderColor: `${color}50`, background: `${color}12` }}>
                {typeLabel(result.type)}
              </div>
              <div className="type-value">{result.value}</div>
              <div className="type-time">{new Date(result.checked).toLocaleTimeString()}</div>
            </div>

            {/* IP Results */}
            {result.type === 'ip' && (
              <>
                {result.results.shodan && (
                  <div className="result-section">
                    <div className="section-header">
                      <div className="section-title">Shodan InternetDB</div>
                      <div className="section-source">internetdb.shodan.io</div>
                    </div>
                    <div className="section-body">
                      <div className="kv-grid">
                        {result.results.shodan.hostnames && result.results.shodan.hostnames.length > 0 && (
                          <>
                            <div className="kv-key">Hostnames</div>
                            <div className="kv-val mono">{result.results.shodan.hostnames.join(', ')}</div>
                          </>
                        )}
                        {result.results.shodan.ports && result.results.shodan.ports.length > 0 && (
                          <>
                            <div className="kv-key">Open Ports</div>
                            <div className="kv-val">
                              <div className="pill-list">
                                {result.results.shodan.ports.map(p => <span key={p} className="pill">{p}</span>)}
                              </div>
                            </div>
                          </>
                        )}
                        {result.results.shodan.vulns && result.results.shodan.vulns.length > 0 && (
                          <>
                            <div className="kv-key">CVEs</div>
                            <div className="kv-val">
                              <div className="tag-list">
                                {result.results.shodan.vulns.map(v => (
                                  <span key={v} className="tag" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}>{v}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {result.results.shodan.tags && result.results.shodan.tags.length > 0 && (
                          <>
                            <div className="kv-key">Tags</div>
                            <div className="kv-val">
                              <div className="tag-list">
                                {result.results.shodan.tags.map(t => (
                                  <span key={t} className="tag" style={{ background: 'rgba(30,158,255,0.06)', border: '1px solid rgba(30,158,255,0.15)', color: '#5a7a94' }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {result.results.shodan.ports?.length === 0 && !result.results.shodan.vulns?.length && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>No open ports or vulnerabilities found in Shodan index.</div>
                      )}
                    </div>
                  </div>
                )}

                {result.results.greynoise && (
                  <div className="result-section">
                    <div className="section-header">
                      <div className="section-title">GreyNoise Community</div>
                      <div className="section-source">greynoise.io</div>
                    </div>
                    <div className="section-body">
                      <div className="noise-row">
                        <div className="noise-badge" style={
                          result.results.greynoise.noise
                            ? { color: '#ff4444', borderColor: 'rgba(255,68,68,0.4)', background: 'rgba(255,68,68,0.08)' }
                            : { color: '#00cc66', borderColor: 'rgba(0,204,102,0.4)', background: 'rgba(0,204,102,0.08)' }
                        }>
                          {result.results.greynoise.noise ? '⚠ NOISE' : '✓ NOT NOISE'}
                        </div>
                        {result.results.greynoise.riot && (
                          <div className="noise-badge" style={{ color: '#1e9eff', borderColor: 'rgba(30,158,255,0.4)', background: 'rgba(30,158,255,0.08)' }}>
                            RIOT (benign)
                          </div>
                        )}
                        {result.results.greynoise.classification && (
                          <div className="noise-badge" style={{ color: '#c0cfe0', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>
                            {result.results.greynoise.classification}
                          </div>
                        )}
                      </div>
                      {result.results.greynoise.name && (
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-secondary)', marginTop: 12 }}>
                          {result.results.greynoise.name}
                        </div>
                      )}
                      {result.results.greynoise.message && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                          {result.results.greynoise.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.results.ipinfo && (
                  <div className="result-section">
                    <div className="section-header">
                      <div className="section-title">Network Info</div>
                      <div className="section-source">ipinfo.io</div>
                    </div>
                    <div className="section-body">
                      <div className="kv-grid">
                        {result.results.ipinfo.org && <><div className="kv-key">Organization</div><div className="kv-val">{result.results.ipinfo.org}</div></>}
                        {result.results.ipinfo.country && <><div className="kv-key">Country</div><div className="kv-val">{result.results.ipinfo.country}</div></>}
                        {result.results.ipinfo.region && <><div className="kv-key">Region</div><div className="kv-val">{result.results.ipinfo.region}</div></>}
                        {result.results.ipinfo.city && <><div className="kv-key">City</div><div className="kv-val">{result.results.ipinfo.city}</div></>}
                        {result.results.ipinfo.hostname && <><div className="kv-key">Hostname</div><div className="kv-val mono">{result.results.ipinfo.hostname}</div></>}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Hash Results */}
            {(result.type === 'hash_md5' || result.type === 'hash_sha1' || result.type === 'hash_sha256') && result.results.malwarebazaar && (
              <div className="result-section">
                <div className="section-header">
                  <div className="section-title">MalwareBazaar</div>
                  <div className="section-source">bazaar.abuse.ch</div>
                </div>
                <div className="section-body">
                  {result.results.malwarebazaar.query_status === 'ok' && result.results.malwarebazaar.data?.[0] ? (
                    <div className="kv-grid">
                      {result.results.malwarebazaar.data[0].signature && (
                        <><div className="kv-key">Signature</div><div className="kv-val" style={{ color: '#ff4444', fontWeight: 600 }}>{result.results.malwarebazaar.data[0].signature}</div></>
                      )}
                      {result.results.malwarebazaar.data[0].file_type_mime && (
                        <><div className="kv-key">File Type</div><div className="kv-val mono">{result.results.malwarebazaar.data[0].file_type_mime}</div></>
                      )}
                      {result.results.malwarebazaar.data[0].file_size && (
                        <><div className="kv-key">File Size</div><div className="kv-val">{(result.results.malwarebazaar.data[0].file_size / 1024).toFixed(1)} KB</div></>
                      )}
                      {result.results.malwarebazaar.data[0].first_seen && (
                        <><div className="kv-key">First Seen</div><div className="kv-val">{result.results.malwarebazaar.data[0].first_seen}</div></>
                      )}
                      {result.results.malwarebazaar.data[0].last_seen && (
                        <><div className="kv-key">Last Seen</div><div className="kv-val">{result.results.malwarebazaar.data[0].last_seen}</div></>
                      )}
                      {result.results.malwarebazaar.data[0].tags && result.results.malwarebazaar.data[0].tags.length > 0 && (
                        <>
                          <div className="kv-key">Tags</div>
                          <div className="kv-val">
                            <div className="tag-list">
                              {result.results.malwarebazaar.data[0].tags.map(t => (
                                <span key={t} className="tag" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}>{t}</span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#22cc66' }}>
                      ✓ Hash not found in MalwareBazaar — no known malware match.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Domain / URL Results */}
            {(result.type === 'domain' || result.type === 'url') && result.results.urlscan && (
              <div className="result-section">
                <div className="section-header">
                  <div className="section-title">URLScan History</div>
                  <div className="section-source">urlscan.io</div>
                </div>
                <div className="section-body">
                  {result.results.urlscan.results && result.results.urlscan.results.length > 0 ? (
                    <>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: 1 }}>
                        {result.results.urlscan.total} total scans — showing most recent 5
                      </div>
                      {result.results.urlscan.results.map((r, i) => (
                        <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{r.page?.url}</div>
                          {r.page?.ip && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{r.page.ip}</div>}
                          {r.page?.country && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{r.page.country}</div>}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>No URLScan results found for this domain.</div>
                  )}
                </div>
              </div>
            )}

            {/* External links */}
            <div className="result-section">
              <div className="section-header">
                <div className="section-title">External Intelligence</div>
                <div className="section-source">Launch in external tools</div>
              </div>
              <div className="section-body">
                <div className="ext-links">
                  {externalLinks(result.value, result.type).map(l => (
                    <a key={l.label} className="ext-link" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </main>

      <footer><div className="footer-text">© 2026 The Rudd Report &nbsp;·&nbsp; UNCLASSIFIED // FOR PUBLIC RELEASE</div></footer>
    </>
  );
}
