'use client';
import { useState } from 'react';

export default function WHOISLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const res = await fetch(`https://rdap.org/domain/${clean}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('// Could not retrieve WHOIS data. The domain may not exist or the registry may be unavailable.');
    }
    setLoading(false);
  };

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
      <div className="section-title">{title}</div>
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
        .tool-hero-inner { max-width: 1000px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; }
        .search-wrap { padding: 40px; max-width: 1000px; margin: 0 auto; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'Share Tech Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #030608; background: #1e9eff; border: none; padding: 16px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db8ff; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .results { max-width: 1000px; margin: 0 auto; padding: 0 40px 80px; }
        .result-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.15); }
        .result-header { padding: 24px 28px; border-bottom: 1px solid rgba(30,158,255,0.12); display: flex; align-items: center; justify-content: space-between; background: rgba(30,158,255,0.04); }
        .result-domain { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; }
        .result-badge { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #00ff88; border: 1px solid rgba(0,255,136,0.3); padding: 4px 12px; text-transform: uppercase; background: rgba(0,255,136,0.06); }
        .result-section { border-bottom: 1px solid rgba(30,158,255,0.08); }
        .result-section:last-child { border-bottom: none; }
        .section-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1e9eff; text-transform: uppercase; padding: 16px 28px 12px; background: rgba(30,158,255,0.03); border-bottom: 1px solid rgba(30,158,255,0.06); }
        .section-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
        .result-field { padding: 18px 28px; border-bottom: 1px solid rgba(30,158,255,0.05); border-right: 1px solid rgba(30,158,255,0.05); }
        .result-field:nth-child(even) { border-right: none; }
        .result-field.full { grid-column: 1 / -1; border-right: none; }
        .field-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; margin-bottom: 8px; }
        .field-value { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #c0cfe0; letter-spacing: 1px; line-height: 1.7; word-break: break-all; }
        .field-value.highlight { color: #1e9eff; }
        .field-value.green { color: #00ff88; }
        .field-value.red { color: #ff3a3a; }
        .field-value.orange { color: #ffaa00; }
        .ns-list { display: flex; flex-direction: column; gap: 4px; }
        .status-list { display: flex; flex-direction: column; gap: 4px; }
        .status-item { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #7a9bb5; letter-spacing: 1px; }
        .status-item.lock { color: #00ff88; }
        .error-msg { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 3px; color: #ff3a3a; padding: 20px 0; text-transform: uppercase; line-height: 1.8; }
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
        .footer-bottom { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
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
          .section-grid { grid-template-columns: 1fr; }
          .result-field { border-right: none; }
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
          <div className="hamburger" onClick={() => document.getElementById('whoisMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="whoisMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('whoisMenu')?.classList.remove('open')}>✕ Close</button>
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
              <div className="tool-eyebrow-text">// OSINT Hub — Domain Intelligence</div>
            </div>
            <div className="tool-title">WHOIS Lookup</div>
            <p className="tool-desc">Full domain registration intelligence — ownership, registrar, nameservers, contact records, DNSSEC status, and registry data. Powered by RDAP.</p>
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
              {loading ? 'Scanning...' : 'Lookup →'}
            </button>
          </div>
        </div>

        <div className="results">
          {loading && (
            <div className="loading-wrap">
              <div className="loading-bars"><span/><span/><span/><span/><span/></div>
              <div className="loading-text">// Querying RDAP database...</div>
            </div>
          )}
          {error && <div className="error-msg">{error}</div>}
          {result && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-domain">{result?.ldhName?.toUpperCase() || result?.handle}</div>
                <div className="result-badge">// Record Found</div>
              </div>

              <Section title="// Domain Overview">
                <Field label="// Registry Domain ID" value={result?.handle} />
                <Field label="// TLD" value={result?.ldhName?.split('.').pop()?.toUpperCase()} />
                <Field label="// Registered" value={getDate(result, 'registration')} highlight />
                <Field label="// Expires" value={getDate(result, 'expiration')} highlight />
                <Field label="// Last Updated" value={getDate(result, 'last changed')} />
                <Field label="// Transferred" value={getDate(result, 'transfer')} />
                <Field label="// DNSSEC" value={result?.secureDNS?.delegationSigned ? '✓ Signed — Protected' : '✗ Unsigned — No DNSSEC'} />
                <Field label="// Zone Signed" value={result?.secureDNS?.zoneSigned ? 'Yes' : 'No'} />
              </Section>

              <Section title="// Nameservers">
                <div className="result-field full">
                  <div className="field-label">// DNS Nameservers</div>
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
                <Section title="// Registrar">
                  <Field label="// Registrar Name" value={registrarInfo.fn} highlight />
                  <Field label="// IANA ID" value={registrarInfo.handle} />
                  <Field label="// Registrar URL" value={registrarInfo.url} />
                  <Field label="// Abuse Email" value={abuseInfo?.email || registrarInfo.email} />
                  <Field label="// Abuse Phone" value={abuseInfo?.tel} />
                </Section>
              )}

              {registrantInfo && (
                <Section title="// Registrant">
                  <Field label="// Name" value={registrantInfo.fn} highlight />
                  <Field label="// Organization" value={registrantInfo.org} highlight />
                  <Field label="// Email" value={registrantInfo.email} />
                  <Field label="// Phone" value={registrantInfo.tel} />
                  {registrantInfo.adr && (
                    <div className="result-field full">
                      <div className="field-label">// Address</div>
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
                <Section title="// Administrative Contact">
                  <Field label="// Name" value={adminInfo.fn} />
                  <Field label="// Organization" value={adminInfo.org} />
                  <Field label="// Email" value={adminInfo.email} />
                  <Field label="// Phone" value={adminInfo.tel} />
                </Section>
              )}

              {techInfo && (
                <Section title="// Technical Contact">
                  <Field label="// Name" value={techInfo.fn} />
                  <Field label="// Organization" value={techInfo.org} />
                  <Field label="// Email" value={techInfo.email} />
                  <Field label="// Phone" value={techInfo.tel} />
                </Section>
              )}

              <Section title="// Domain Status">
                <div className="result-field full">
                  <div className="field-label">// EPP Status Codes</div>
                  <div className="status-list">
                    {getStatus(result).map((s: string, i: number) => (
                      <div className={`status-item ${s.includes('ok') ? 'lock' : ''}`} key={i}>
                        {s.includes('prohibited') ? '🔒' : s.includes('ok') ? '✓' : '•'} {s}
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
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}