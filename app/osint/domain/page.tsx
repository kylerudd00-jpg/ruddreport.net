'use client';
import { useState, useEffect } from 'react';

/*
  Domain Lookup — one domain input, four sources at once (WHOIS + DNS +
  SSL/CT + Subdomains). Replaces running those four tools separately.
*/

const clean = (raw: string) =>
  raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

const asJson = (r: Response) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))));
const settled = <T,>(p: PromiseSettledResult<T>): T | null => (p.status === 'fulfilled' ? p.value : null);

interface DomainData {
  domain: string;
  whois: any | null;
  dns: any | null;
  ssl: any[] | null;
  subs: any | null;
}

export default function DomainLookup() {
  const [input, setInput] = useState('');
  const [data, setData] = useState<DomainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setInput(q); setTimeout(() => runLookup(q), 60); }
  }, []);

  const runLookup = async (val: string) => {
    const d = clean(val);
    if (!d) return;
    setLoading(true); setError(''); setData(null);
    const [whois, dns, ssl, subs] = await Promise.allSettled([
      fetch(`/api/whois?domain=${encodeURIComponent(d)}`).then(asJson),
      fetch(`/api/dns?domain=${encodeURIComponent(d)}`).then(asJson),
      fetch(`/api/ssl?domain=${encodeURIComponent(d)}`).then(asJson),
      fetch(`/api/osint/subdomains?domain=${encodeURIComponent(d)}`).then(asJson),
    ]);
    const next: DomainData = { domain: d, whois: settled(whois), dns: settled(dns), ssl: settled(ssl), subs: settled(subs) };
    if (!next.whois && !next.dns && !next.ssl && !next.subs) {
      setError('Could not reach any source for this domain. Check the spelling and try again.');
    } else {
      setData(next);
    }
    setLoading(false);
  };

  const handle = () => runLookup(input);
  const runExample = (v: string) => { setInput(v); runLookup(v); };

  // ── derive summary facts ──
  const w = data?.whois;
  const events = w?.events || [];
  const created = events.find((e: any) => e.eventAction === 'registration')?.eventDate;
  const expires = events.find((e: any) => e.eventAction === 'expiration')?.eventDate;
  const registrar = (w?.entities || []).find((e: any) => e.roles?.includes('registrar'));
  const registrarName = registrar?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || null;
  const nameservers = (w?.nameservers || []).map((ns: any) => ns.ldhName?.toUpperCase()).filter(Boolean);

  const dnsRecords: Record<string, any[]> = data?.dns?.records || {};
  const aRecords = (dnsRecords.A || []).map((r: any) => r.data).filter(Boolean);
  const mxRecords = (dnsRecords.MX || []).map((r: any) => r.data).filter(Boolean);

  const certs: any[] = Array.isArray(data?.ssl) ? data!.ssl! : [];
  const latestCert = certs[0];
  const certIssuer = latestCert?.issuer_name?.match(/O=([^,]+)/)?.[1] || latestCert?.issuer_name || null;

  const subList: any[] = data?.subs?.subdomains || [];
  const subCount = data?.subs?.total ?? subList.length;

  const fmtDate = (d?: string) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d; }
  };

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 64px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(36px, 5.5vw, 72px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.98; margin-bottom: 16px; }
        .tool-desc { font-size: 16px; color: var(--text-secondary); line-height: 1.6; max-width: 640px; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 18px; font-family: var(--font-mono); font-size: 15px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 30px; cursor: pointer; text-transform: uppercase; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .ex-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0 0; }
        .ex-row-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); }
        .ex-row button { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); background: var(--bg-card); border: 1px solid var(--border-bright); padding: 6px 12px; cursor: pointer; }
        .ex-row button:hover, .ex-row button:focus-visible { color: #fff; border-color: var(--accent); }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--red); padding: 20px 0; text-transform: uppercase; }
        .loading-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); padding: 40px 0; text-transform: uppercase; }
        /* summary strip */
        .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); margin-bottom: 2px; }
        .summary-cell { background: var(--bg-secondary); padding: 20px 22px; }
        .summary-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .summary-val { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); line-height: 1.2; word-break: break-word; }
        .summary-val.accent { color: var(--accent); }
        /* section */
        .sec { border: 1px solid var(--border); border-top: none; }
        .sec-head { display: flex; align-items: baseline; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid var(--border); background: var(--bg-secondary); }
        .sec-head h2 { font-family: var(--font-display); font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #fff; }
        .sec-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; text-transform: uppercase; }
        .sec-link:hover { text-decoration: underline; }
        .sec-body { padding: 8px 24px 20px; }
        .kv { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid var(--border); font-family: var(--font-mono); font-size: 13px; }
        .kv:last-child { border-bottom: none; }
        .kv-k { color: var(--text-muted); min-width: 150px; text-transform: uppercase; letter-spacing: 0.04em; font-size: 12px; }
        .kv-v { color: var(--text-primary); word-break: break-all; }
        .chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .chip { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); border: 1px solid var(--border); padding: 3px 9px; }
        .sec-none { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 0; }
        footer { border-top: 1px solid var(--border); padding: 32px 40px; background: var(--bg-secondary); margin-top: 48px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); text-transform: uppercase; }
        @media (max-width: 768px) {
          .tool-hero { padding: 48px 16px 32px; }
          .search-wrap { padding: 24px 16px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 16px 60px; }
          .summary { grid-template-columns: 1fr 1fr; }
          .kv { flex-direction: column; gap: 2px; }
          footer { padding: 24px 16px; } .footer-bottom { flex-direction: column; gap: 10px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">OSINT Hub — Domain Intelligence</div>
            </div>
            <h1 className="tool-title">Domain Lookup</h1>
            <p className="tool-desc">One domain, four checks at once: registration, DNS, SSL certificates, and subdomains.</p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Domain to look up"
              placeholder="Enter a domain — e.g. google.com"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()}
            />
            <button type="button" className="search-btn" onClick={handle} disabled={loading}>
              {loading ? 'Scanning…' : 'Look up →'}
            </button>
          </div>
          <div className="ex-row" role="group" aria-label="Examples to try">
            <span className="ex-row-label" aria-hidden="true">Try</span>
            {['google.com', 'github.com'].map(v => (
              <button key={v} type="button" onClick={() => runExample(v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className="results" aria-live="polite">
          {loading && <div className="loading-msg">Checking registration, DNS, SSL & subdomains…</div>}
          {error && <div className="error-msg" role="alert">{error}</div>}

          {data && !loading && (
            <>
              {/* Summary */}
              <div className="summary">
                <div className="summary-cell">
                  <div className="summary-label">Domain</div>
                  <div className="summary-val accent">{data.domain}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-label">Registered</div>
                  <div className="summary-val">{fmtDate(created) || '—'}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-label">Points to (A)</div>
                  <div className="summary-val">{aRecords[0] || '—'}</div>
                </div>
                <div className="summary-cell">
                  <div className="summary-label">Subdomains</div>
                  <div className="summary-val">{subCount || '—'}</div>
                </div>
              </div>

              {/* Registration */}
              <section className="sec" aria-labelledby="sec-reg">
                <div className="sec-head">
                  <h2 id="sec-reg">Registration (WHOIS)</h2>
                  <a className="sec-link" href={`/osint/whois?q=${encodeURIComponent(data.domain)}`}>Full WHOIS →</a>
                </div>
                <div className="sec-body">
                  {w ? (
                    <>
                      {registrarName && <div className="kv"><span className="kv-k">Registrar</span><span className="kv-v">{registrarName}</span></div>}
                      <div className="kv"><span className="kv-k">Created</span><span className="kv-v">{fmtDate(created) || 'Unknown'}</span></div>
                      <div className="kv"><span className="kv-k">Expires</span><span className="kv-v">{fmtDate(expires) || 'Unknown'}</span></div>
                      {nameservers.length > 0 && <div className="kv"><span className="kv-k">Nameservers</span><span className="kv-v">{nameservers.join(', ')}</span></div>}
                    </>
                  ) : <div className="sec-none">No WHOIS data available.</div>}
                </div>
              </section>

              {/* DNS */}
              <section className="sec" aria-labelledby="sec-dns">
                <div className="sec-head">
                  <h2 id="sec-dns">DNS Records</h2>
                  <a className="sec-link" href={`/osint/dns?q=${encodeURIComponent(data.domain)}`}>Full DNS →</a>
                </div>
                <div className="sec-body">
                  {data.dns ? (
                    <>
                      {aRecords.length > 0 && <div className="kv"><span className="kv-k">A</span><span className="kv-v">{aRecords.join(', ')}</span></div>}
                      {mxRecords.length > 0 && <div className="kv"><span className="kv-k">MX</span><span className="kv-v">{mxRecords.join(', ')}</span></div>}
                      {aRecords.length === 0 && mxRecords.length === 0 && <div className="sec-none">No A/MX records found.</div>}
                    </>
                  ) : <div className="sec-none">No DNS data available.</div>}
                </div>
              </section>

              {/* SSL */}
              <section className="sec" aria-labelledby="sec-ssl">
                <div className="sec-head">
                  <h2 id="sec-ssl">SSL Certificate</h2>
                  <a className="sec-link" href={`/osint/ssl?q=${encodeURIComponent(data.domain)}`}>Cert history →</a>
                </div>
                <div className="sec-body">
                  {certs.length > 0 ? (
                    <>
                      {certIssuer && <div className="kv"><span className="kv-k">Issuer</span><span className="kv-v">{certIssuer}</span></div>}
                      {latestCert?.common_name && <div className="kv"><span className="kv-k">Common name</span><span className="kv-v">{latestCert.common_name}</span></div>}
                      <div className="kv"><span className="kv-k">Certs on record</span><span className="kv-v">{certs.length}</span></div>
                    </>
                  ) : <div className="sec-none">No certificates found in transparency logs.</div>}
                </div>
              </section>

              {/* Subdomains */}
              <section className="sec" aria-labelledby="sec-sub">
                <div className="sec-head">
                  <h2 id="sec-sub">Subdomains{subCount ? ` (${subCount})` : ''}</h2>
                  <a className="sec-link" href={`/osint/subdomains?q=${encodeURIComponent(data.domain)}`}>All subdomains →</a>
                </div>
                <div className="sec-body">
                  {subList.length > 0 ? (
                    <div className="chips">
                      {subList.slice(0, 30).map((s: any, i: number) => (
                        <span className="chip" key={i}>{s.name || s}</span>
                      ))}
                      {subList.length > 30 && <span className="chip">+{subList.length - 30} more</span>}
                    </div>
                  ) : <div className="sec-none">No subdomains found.</div>}
                </div>
              </section>
            </>
          )}
        </div>

        <footer>
          <div className="footer-bottom">
            <span>© 2026 The Rudd Report</span>
            <span>Open-source intelligence &amp; analysis</span>
          </div>
        </footer>
      </main>
    </>
  );
}
