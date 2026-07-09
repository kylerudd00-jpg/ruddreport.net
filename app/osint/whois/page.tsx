'use client';
import { useState, useEffect } from 'react';

const HISTORY_KEY = 'osint_whois_history';

export default function WHOISLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')); } catch {}
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setDomain(q); setTimeout(() => runLookup(q), 100); }
  }, []);

  const runLookup = async (override?: string) => {
    const target = (override || domain).trim();
    if (!target) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const clean = target.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
      const res = await fetch(`/api/whois?domain=${encodeURIComponent(clean)}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setResult(data);
      setHistory(prev => {
        const next = [clean, ...prev.filter(h => h !== clean)].slice(0, 6);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    } catch (e) {
      setError('Could not retrieve WHOIS data. The domain may not exist or the registry may be unavailable.');
    }
    setLoading(false);
  };

  const lookup = runLookup;

  const getDate = (data: any, eventType: string) => {
    const event = (data?.events || []).find((e: any) => e.eventAction === eventType);
    if (!event) return null;
    return new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
  };

  const getNameservers = (data: any) => (data?.nameservers || []).map((ns: any) => ns.ldhName?.toUpperCase()).filter(Boolean);
  const getStatus = (data: any) => (data?.status || []);
  const getEntity = (data: any, role: string) => (data?.entities || []).find((e: any) => e.roles?.includes(role));
  const getVcard = (entity: any, field: string) => entity?.vcardArray?.[1]?.find((v: any) => v[0] === field)?.[3] || null;

  const getEntityInfo = (entity: any) => {
    if (!entity) return null;
    const fn = getVcard(entity, 'fn');
    const org = getVcard(entity, 'org');
    const email = getVcard(entity, 'email');
    const tel = getVcard(entity, 'tel');
    const adr = entity?.vcardArray?.[1]?.find((v: any) => v[0] === 'adr')?.[3];
    const url = entity?.links?.[0]?.href;
    const handle = entity?.handle;
    return { fn, org, email, tel, adr, url, handle };
  };

  const Field = ({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) => {
    if (!value || value === 'N/A') return null;
    return (
      <div className="result-field">
        <div className="field-label">{label}</div>
        <div className={`field-value ${highlight ? 'highlight' : ''}`}>{value}</div>
      </div>
    );
  };

  const Section = ({ title, children }: { title: string; children: any }) => (
    <div className="result-section">
      <h2 className="section-title">{title}</h2>
      <div className="section-grid">{children}</div>
    </div>
  );

  const registrar = getEntity(result, 'registrar');
  const registrant = getEntity(result, 'registrant');
  const admin = getEntity(result, 'administrative');
  const tech = getEntity(result, 'technical');
  const abuse = getEntity(result, 'abuse');
  const registrarInfo = getEntityInfo(registrar);
  const registrantInfo = getEntityInfo(registrant);
  const adminInfo = getEntityInfo(admin);
  const techInfo = getEntityInfo(tech);
  const abuseInfo = getEntityInfo(abuse);

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 64px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(36px, 5.5vw, 72px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.98; margin-bottom: 16px; }
        .tool-desc { font-size: 16px; color: var(--text-secondary); line-height: 1.75; max-width: 640px; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-secondary); }
        .search-input { flex: 1; background: none; border: none; padding: 16px 18px; font-family: var(--font-mono); font-size: 15px; color: var(--text-primary); letter-spacing: 0.04em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 16px 30px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .result-card { background: var(--bg-secondary); border: 1px solid var(--border); }
        .result-header { padding: 24px 28px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .result-domain { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--accent); letter-spacing: 0; }
        .result-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); border: 1px solid var(--border-bright); padding: 4px 11px; text-transform: uppercase; }
        .result-section { border-bottom: 1px solid var(--border); }
        .result-section:last-child { border-bottom: none; }
        .section-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; padding: 16px 28px 12px; border-bottom: 1px solid var(--border); }
        .section-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .result-field { padding: 18px 28px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
        .result-field:nth-child(even) { border-right: none; }
        .result-field.full { grid-column: 1 / -1; border-right: none; }
        .field-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .field-value { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; line-height: 1.7; word-break: break-all; }
        .field-value.highlight { color: var(--accent); }
        .field-value.green { color: var(--accent); }
        .field-value.red { color: var(--red); }
        .field-value.orange { color: #ffaa00; }
        .ns-list { display: flex; flex-direction: column; gap: 4px; }
        .status-list { display: flex; flex-direction: column; gap: 4px; }
        .status-item { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); letter-spacing: 0.02em; }
        .status-item.lock { color: var(--accent); }
        .error-msg { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
        .loading-wrap { display: flex; align-items: center; gap: 16px; padding: 40px 0; }
        .loading-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; animation: blink 1.5s infinite; }
        .loading-bars { display: flex; gap: 3px; align-items: flex-end; height: 20px; }
        .loading-bars span { width: 3px; background: var(--accent); border-radius: 2px; animation: loadBar 1s ease-in-out infinite; }
        .loading-bars span:nth-child(1) { animation-delay: 0s; }
        .loading-bars span:nth-child(2) { animation-delay: 0.15s; }
        .loading-bars span:nth-child(3) { animation-delay: 0.3s; }
        .loading-bars span:nth-child(4) { animation-delay: 0.45s; }
        .loading-bars span:nth-child(5) { animation-delay: 0.6s; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 48px; }
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em; color: var(--text-muted); text-transform: uppercase; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes loadBar { 0%, 100% { height: 4px; } 50% { height: 20px; } }
        @media (max-width: 768px) {
          .tool-hero { padding: 48px 16px 32px; }
          .search-wrap { padding: 24px 16px; }
          .search-box { flex-direction: column; }
          .results { padding: 0 16px 60px; }
          .section-grid { grid-template-columns: 1fr; }
          .result-field { border-right: none; }
          footer { padding: 30px 16px; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Domain Intelligence</div>
            </div>
            <h1 className="tool-title">WHOIS Lookup</h1>
            <p className="tool-desc">When a domain is registered, ownership details, registrar, and creation date are recorded — and often publicly accessible. Look up any domain to find out who registered it, when it was created (brand-new domains are a major red flag in phishing), what nameservers it uses, and whether the owner hid behind privacy protection.</p>
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
            <button type="button" className="search-btn" onClick={() => lookup()} disabled={loading}>
              {loading ? 'Scanning...' : 'Lookup →'}
            </button>
          </div>
          {history.length > 0 && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Recent:</span>
              {history.map(h => (
                <button type="button" key={h} onClick={() => { setDomain(h); runLookup(h); }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', padding: '4px 11px', cursor: 'pointer', letterSpacing: '0.02em' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >{h}</button>
              ))}
            </div>
          )}
        </div>

        <div className="results" aria-live="polite">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars" aria-hidden="true"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">Querying RDAP database...</div>
            </div>
          )}
          {error && <div className="error-msg" role="alert">{error}</div>}
          {result && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-domain">{result?.ldhName?.toUpperCase() || result?.handle}</div>
                <div className="result-badge">Record Found</div>
              </div>

              <Section title="Domain Overview">
                <Field label="Registry Domain ID" value={result?.handle} />
                <Field label="TLD" value={result?.ldhName?.split('.').pop()?.toUpperCase()} />
                <Field label="Registered" value={getDate(result, 'registration')} highlight />
                <Field label="Expires" value={getDate(result, 'expiration')} highlight />
                <Field label="Last Updated" value={getDate(result, 'last changed')} />
                <Field label="Transferred" value={getDate(result, 'transfer')} />
                <Field label="DNSSEC" value={result?.secureDNS?.delegationSigned ? '✓ Signed — Protected' : '✗ Unsigned — No DNSSEC'} />
                <Field label="Zone Signed" value={result?.secureDNS?.zoneSigned ? 'Yes' : 'No'} />
              </Section>

              <Section title="Nameservers">
                <div className="result-field full">
                  <div className="field-label">DNS Nameservers</div>
                  <div className="ns-list">
                    {getNameservers(result).length > 0
                      ? getNameservers(result).map((ns: string, i: number) => (
                          <div className="field-value highlight" key={i}>{ns}</div>
                        ))
                      : <div className="field-value">N/A</div>
                    }
                  </div>
                </div>
              </Section>

              {registrarInfo && (
                <Section title="Registrar">
                  <Field label="Registrar Name" value={registrarInfo.fn} highlight />
                  <Field label="IANA ID" value={registrarInfo.handle} />
                  <Field label="Registrar URL" value={registrarInfo.url} />
                  <Field label="Abuse Email" value={abuseInfo?.email || registrarInfo.email} />
                  <Field label="Abuse Phone" value={abuseInfo?.tel} />
                </Section>
              )}

              {registrantInfo && (
                <Section title="Registrant">
                  <Field label="Name" value={registrantInfo.fn} highlight />
                  <Field label="Organization" value={registrantInfo.org} highlight />
                  <Field label="Email" value={registrantInfo.email} />
                  <Field label="Phone" value={registrantInfo.tel} />
                  {registrantInfo.adr && (
                    <div className="result-field full">
                      <div className="field-label">Address</div>
                      <div className="field-value">
                        {Array.isArray(registrantInfo.adr)
                          ? registrantInfo.adr.filter(Boolean).join(', ')
                          : registrantInfo.adr}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {adminInfo && (
                <Section title="Administrative Contact">
                  <Field label="Name" value={adminInfo.fn} />
                  <Field label="Organization" value={adminInfo.org} />
                  <Field label="Email" value={adminInfo.email} />
                  <Field label="Phone" value={adminInfo.tel} />
                </Section>
              )}

              {techInfo && (
                <Section title="Technical Contact">
                  <Field label="Name" value={techInfo.fn} />
                  <Field label="Organization" value={techInfo.org} />
                  <Field label="Email" value={techInfo.email} />
                  <Field label="Phone" value={techInfo.tel} />
                </Section>
              )}

              <Section title="Domain Status">
                <div className="result-field full">
                  <div className="field-label">EPP Status Codes</div>
                  <div className="status-list">
                    {getStatus(result).map((s: string, i: number) => (
                      <div className={`status-item ${s.includes('ok') ? 'lock' : ''}`} key={i}>
                        {s.includes('prohibited') ? '■' : s.includes('ok') ? '✓' : '•'} {s}
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

            </div>
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