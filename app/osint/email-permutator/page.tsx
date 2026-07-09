'use client';
import { useState, useMemo } from 'react';

const PRIMARY_PATTERNS = new Set([
  'firstname.lastname@domain',
  'flastname@domain',
  'firstname@domain',
  'firstnamelastname@domain',
]);

type EmailEntry = {
  label: string;
  email: string;
  primary: boolean;
};

function generateEmails(
  first: string,
  last: string,
  domain: string,
  middle: string
): { primary: EmailEntry[]; extended: EmailEntry[] } {
  const f = first.toLowerCase().trim();
  const l = last.toLowerCase().trim();
  const m = middle.toLowerCase().trim();
  const fi = f.charAt(0);
  const li = l.charAt(0);
  const mi = m.charAt(0);
  const f3 = f.slice(0, 3);
  const l3 = l.slice(-3);

  const patterns: { label: string; email: string }[] = [
    { label: 'firstname@domain',           email: `${f}@${domain}` },
    { label: 'lastname@domain',            email: `${l}@${domain}` },
    { label: 'firstname.lastname@domain',  email: `${f}.${l}@${domain}` },
    { label: 'lastname.firstname@domain',  email: `${l}.${f}@${domain}` },
    { label: 'firstnamelastname@domain',   email: `${f}${l}@${domain}` },
    { label: 'lastnamefirstname@domain',   email: `${l}${f}@${domain}` },
    { label: 'f.lastname@domain',          email: `${fi}.${l}@${domain}` },
    { label: 'firstname.l@domain',         email: `${f}.${li}@${domain}` },
    { label: 'flastname@domain',           email: `${fi}${l}@${domain}` },
    { label: 'firstnamel@domain',          email: `${f}${li}@${domain}` },
    { label: 'f_lastname@domain',          email: `${fi}_${l}@${domain}` },
    { label: 'firstname_lastname@domain',  email: `${f}_${l}@${domain}` },
    { label: 'lastname_firstname@domain',  email: `${l}_${f}@${domain}` },
    { label: 'firstname-lastname@domain',  email: `${f}-${l}@${domain}` },
    { label: 'lastname-firstname@domain',  email: `${l}-${f}@${domain}` },
    { label: 'fl@domain',                  email: `${fi}${li}@${domain}` },
    { label: '3letters+lastname@domain',   email: `${f3}${l}@${domain}` },
    { label: 'firstname+last3@domain',     email: `${f}${l3}@${domain}` },
  ];

  if (m) {
    patterns.push(
      { label: 'fml@domain',                     email: `${fi}${mi}${li}@${domain}` },
      { label: 'firstname.m.lastname@domain',    email: `${f}.${mi}.${l}@${domain}` },
      { label: 'firstname.middle.lastname@domain', email: `${f}.${m}.${l}@${domain}` }
    );
  }

  const subdomains = ['mail', 'corp', 'us', 'eu'];
  const subdomain_extras: { label: string; email: string }[] = [];
  const basePatterns = [
    { label: 'firstname.lastname', template: `${f}.${l}` },
    { label: 'flastname',          template: `${fi}${l}` },
    { label: 'firstname',          template: `${f}` },
  ];
  for (const sub of subdomains) {
    for (const bp of basePatterns) {
      subdomain_extras.push({
        label: `${bp.label}@${sub}.domain`,
        email: `${bp.template}@${sub}.${domain}`,
      });
    }
  }

  const allEntries = [
    ...patterns.map(p => ({ ...p, primary: PRIMARY_PATTERNS.has(p.label) })),
    ...subdomain_extras.map(p => ({ ...p, primary: false })),
  ];

  return {
    primary: allEntries.filter(e => e.primary),
    extended: allEntries.filter(e => !e.primary),
  };
}

export default function EmailPermutator() {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [domain, setDomain]         = useState('');
  const [middleName, setMiddleName] = useState('');
  const [generated, setGenerated]   = useState(false);
  const [copiedIdx, setCopiedIdx]   = useState<string | null>(null);
  const [copiedAll, setCopiedAll]   = useState(false);

  const results = useMemo(() => {
    if (!generated || !firstName.trim() || !lastName.trim() || !domain.trim()) {
      return { primary: [], extended: [] };
    }
    return generateEmails(firstName, lastName, domain, middleName);
  }, [generated, firstName, lastName, domain, middleName]);

  const totalCount = results.primary.length + results.extended.length;

  const handleGenerate = () => {
    if (firstName.trim() && lastName.trim() && domain.trim()) {
      setGenerated(true);
    }
  };

  const handleReset = () => {
    setGenerated(false);
    setFirstName('');
    setLastName('');
    setDomain('');
    setMiddleName('');
  };

  const copyOne = (email: string, key: string) => {
    navigator.clipboard.writeText(email).then(() => {
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1800);
    });
  };

  const copyAll = () => {
    const all = [...results.primary, ...results.extended].map(e => e.email).join('\n');
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  const allEmails = [...results.primary, ...results.extended];

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
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .form-wrap { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px; }
        .form-field { display: flex; flex-direction: column; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; padding: 10px 20px 0; background: var(--bg-card); border: 1px solid var(--border-bright); border-bottom: none; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); border-top: none; padding: 10px 20px 14px; font-family: var(--font-mono); font-size: 14px; color: var(--text-primary); letter-spacing: 1px; width: 100%; transition: border-color 0.3s; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .domain-row { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 16px; }
        .btn-row { display: flex; gap: 12px; margin-top: 16px; }
        .generate-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #ffffff; background: var(--accent); border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .generate-btn:hover { background: #4db8ff; }
        .generate-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .reset-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 14px 24px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .reset-btn:hover { color: var(--text-secondary); border-color: var(--accent); }
        .results-wrap { padding: 0 40px 80px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }
        .result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; }
        .count-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); background: rgba(30,158,255,0.1); border: 1px solid var(--border-bright); padding: 4px 12px; }
        .copy-all-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border-bright); padding: 8px 20px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .copy-all-btn:hover { color: var(--accent); border-color: var(--accent); }
        .copy-all-btn.copied { color: var(--accent); border-color: var(--accent); }
        .email-list { display: flex; flex-direction: column; gap: 2px; }
        .email-row { display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); border: 1px solid var(--border); padding: 14px 20px; transition: border-color 0.2s; }
        .email-row:hover { border-color: var(--border-bright); }
        .email-row.primary-row { border-left: 3px solid var(--accent); background: var(--bg-card-hover); }
        .email-text { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.5px; }
        .email-row.primary-row .email-text { color: var(--text-primary); }
        .primary-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-transform: uppercase; border: 1px solid var(--border-bright); padding: 2px 8px; margin-left: 12px; white-space: nowrap; }
        .email-left { display: flex; align-items: center; min-width: 0; }
        .copy-icon-btn { background: none; border: 1px solid var(--border-bright); color: var(--text-muted); padding: 6px 10px; cursor: pointer; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; transition: all 0.25s; white-space: nowrap; flex-shrink: 0; margin-left: 16px; }
        .copy-icon-btn:hover { color: var(--accent); border-color: var(--accent); }
        .copy-icon-btn.active { color: var(--accent); border-color: var(--accent); }
        .tips-panel { background: var(--bg-secondary); border: 1px solid var(--border); padding: 24px 28px; }
        .tips-eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; }
        .tips-text { font-family: var(--font-display); font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px; }
        .tips-links { display: flex; gap: 16px; flex-wrap: wrap; }
        .tips-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--border-bright); padding-bottom: 1px; transition: color 0.3s; }
        .tips-link:hover { color: #4db8ff; border-color: #4db8ff; }
        .top-bar { display: flex; align-items: center; justify-content: space-between; padding: 16px 40px; max-width: 1100px; margin: 0 auto 0; border: 1px solid var(--border); background: var(--bg-card); }
        .top-bar-count { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .form-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .domain-row { grid-template-columns: 1fr; }
          .btn-row { flex-direction: column; }
          .generate-btn, .reset-btn { width: 100%; text-align: center; }
          .results-wrap { padding: 0 20px 60px; }
          .top-bar { padding: 12px 20px; flex-direction: column; gap: 8px; align-items: flex-start; }
          .email-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .copy-icon-btn { margin-left: 0; }
          .tips-links { flex-direction: column; gap: 10px; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">&#x2190; Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Corporate Intelligence</div>
            </div>
            <h1 className="tool-title">Email Permutator</h1>
            <p className="tool-desc">Every company uses a standard email format — like firstname.lastname@company.com — but you often don't know which one. Enter a name and company domain to generate every possible format. Used by journalists, investigators, and recruiters to find the right address for anyone at any organization.</p>
          </div>
        </div>

        <div className="form-wrap">
          <div className="form-grid">
            <div className="form-field">
              <div className="form-label">First Name *</div>
              <input
                className="form-input"
                aria-label="First name"
                placeholder="e.g. John"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); setGenerated(false); }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Last Name *</div>
              <input
                className="form-input"
                aria-label="Last name"
                placeholder="e.g. Smith"
                value={lastName}
                onChange={e => { setLastName(e.target.value); setGenerated(false); }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>
          <div className="domain-row">
            <div className="form-field">
              <div className="form-label">Company Domain *</div>
              <input
                className="form-input"
                aria-label="Company domain"
                placeholder="e.g. tesla.com"
                value={domain}
                onChange={e => { setDomain(e.target.value); setGenerated(false); }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Middle Name (optional)</div>
              <input
                className="form-input"
                aria-label="Middle name (optional)"
                placeholder="e.g. David"
                value={middleName}
                onChange={e => { setMiddleName(e.target.value); setGenerated(false); }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>
          <div className="btn-row">
            <button
              type="button"
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!firstName.trim() || !lastName.trim() || !domain.trim()}
            >
              Generate Permutations &#x2192;
            </button>
            {generated && (
              <button type="button" className="reset-btn" onClick={handleReset}>Clear</button>
            )}
          </div>
        </div>

        <div aria-live="polite">
        {generated && totalCount > 0 && (
          <>
            <div className="top-bar" style={{maxWidth:'1100px', margin:'0 auto 0'}}>
              <div className="top-bar-count">{totalCount} variants generated</div>
              <button type="button" className={`copy-all-btn${copiedAll ? ' copied' : ''}`} onClick={copyAll}>
                {copiedAll ? '&#x2713; Copied All' : `Copy All ${totalCount} Emails`}
              </button>
            </div>

            <div className="results-wrap" style={{marginTop:'24px'}}>

              {/* Primary Formats */}
              <div>
                <div className="result-header">
                  <h2 className="section-label">Primary Formats — Most Likely</h2>
                  <div className="count-badge">{results.primary.length} formats</div>
                </div>
                <div className="email-list">
                  {results.primary.map((entry, i) => (
                    <div key={`primary-${i}`} className="email-row primary-row">
                      <div className="email-left">
                        <div className="email-text">{entry.email}</div>
                        <div className="primary-badge">Top Pick</div>
                      </div>
                      <button
                        type="button"
                        className={`copy-icon-btn${copiedIdx === `primary-${i}` ? ' active' : ''}`}
                        onClick={() => copyOne(entry.email, `primary-${i}`)}
                      >
                        {copiedIdx === `primary-${i}` ? '&#x2713; Copied' : '&#x2398; Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extended Formats */}
              <div>
                <div className="result-header">
                  <h2 className="section-label">Extended Formats</h2>
                  <div className="count-badge">{results.extended.length} formats</div>
                </div>
                <div className="email-list">
                  {results.extended.map((entry, i) => (
                    <div key={`extended-${i}`} className="email-row">
                      <div className="email-left">
                        <div className="email-text">{entry.email}</div>
                      </div>
                      <button
                        type="button"
                        className={`copy-icon-btn${copiedIdx === `extended-${i}` ? ' active' : ''}`}
                        onClick={() => copyOne(entry.email, `extended-${i}`)}
                      >
                        {copiedIdx === `extended-${i}` ? '&#x2713; Copied' : '&#x2398; Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* OSINT Tips Panel */}
              <div className="tips-panel">
                <div className="tips-eyebrow">Verification Tips</div>
                <p className="tips-text">
                  Once you have a candidate list, verify which address is live using dedicated email validation services. The fastest method: run the address through Hunter.io or Snov.io&#39;s verifier. Alternatively, send a probe email and check for a bounce — a non-delivery report (NDR) confirms the address does not exist; silence may mean it does.
                </p>
                <div className="tips-links">
                  <a href="https://hunter.io" target="_blank" rel="noopener noreferrer" className="tips-link">Hunter.io &#x2197;</a>
                  <a href="https://email-checker.net" target="_blank" rel="noopener noreferrer" className="tips-link">email-checker.net &#x2197;</a>
                  <a href="https://snov.io/email-verifier" target="_blank" rel="noopener noreferrer" className="tips-link">Snov.io Verifier &#x2197;</a>
                </div>
              </div>

            </div>
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
