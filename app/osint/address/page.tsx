'use client';
import { useState, useCallback } from 'react';

const US_STATES = [
  { abbr: '', label: 'Any State' },
  { abbr: 'AL', label: 'Alabama' }, { abbr: 'AK', label: 'Alaska' }, { abbr: 'AZ', label: 'Arizona' },
  { abbr: 'AR', label: 'Arkansas' }, { abbr: 'CA', label: 'California' }, { abbr: 'CO', label: 'Colorado' },
  { abbr: 'CT', label: 'Connecticut' }, { abbr: 'DE', label: 'Delaware' }, { abbr: 'FL', label: 'Florida' },
  { abbr: 'GA', label: 'Georgia' }, { abbr: 'HI', label: 'Hawaii' }, { abbr: 'ID', label: 'Idaho' },
  { abbr: 'IL', label: 'Illinois' }, { abbr: 'IN', label: 'Indiana' }, { abbr: 'IA', label: 'Iowa' },
  { abbr: 'KS', label: 'Kansas' }, { abbr: 'KY', label: 'Kentucky' }, { abbr: 'LA', label: 'Louisiana' },
  { abbr: 'ME', label: 'Maine' }, { abbr: 'MD', label: 'Maryland' }, { abbr: 'MA', label: 'Massachusetts' },
  { abbr: 'MI', label: 'Michigan' }, { abbr: 'MN', label: 'Minnesota' }, { abbr: 'MS', label: 'Mississippi' },
  { abbr: 'MO', label: 'Missouri' }, { abbr: 'MT', label: 'Montana' }, { abbr: 'NE', label: 'Nebraska' },
  { abbr: 'NV', label: 'Nevada' }, { abbr: 'NH', label: 'New Hampshire' }, { abbr: 'NJ', label: 'New Jersey' },
  { abbr: 'NM', label: 'New Mexico' }, { abbr: 'NY', label: 'New York' }, { abbr: 'NC', label: 'North Carolina' },
  { abbr: 'ND', label: 'North Dakota' }, { abbr: 'OH', label: 'Ohio' }, { abbr: 'OK', label: 'Oklahoma' },
  { abbr: 'OR', label: 'Oregon' }, { abbr: 'PA', label: 'Pennsylvania' }, { abbr: 'RI', label: 'Rhode Island' },
  { abbr: 'SC', label: 'South Carolina' }, { abbr: 'SD', label: 'South Dakota' }, { abbr: 'TN', label: 'Tennessee' },
  { abbr: 'TX', label: 'Texas' }, { abbr: 'UT', label: 'Utah' }, { abbr: 'VT', label: 'Vermont' },
  { abbr: 'VA', label: 'Virginia' }, { abbr: 'WA', label: 'Washington' }, { abbr: 'WV', label: 'West Virginia' },
  { abbr: 'WI', label: 'Wisconsin' }, { abbr: 'WY', label: 'Wyoming' },
];

interface FecRecord {
  contributor_name?: string;
  contributor_city?: string;
  contributor_state?: string;
  contributor_zip?: string;
  contributor_employer?: string;
  contributor_occupation?: string;
  contribution_receipt_amount?: number;
  contribution_receipt_date?: string;
  committee?: { name?: string };
}

interface CourtRecord {
  case_name?: string;
  court?: string;
  date_filed?: string;
  absolute_url?: string;
  docket_number?: string;
}


function fmt(d?: string) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return d; }
}

export default function PersonLookup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [fecResults, setFecResults] = useState<FecRecord[]>([]);
  const [fecError, setFecError] = useState('');

  const [courtResults, setCourtResults] = useState<CourtRecord[]>([]);
  const [courtError, setCourtError] = useState('');

  const [activeProfile, setActiveProfile] = useState<number | null>(null);


  const enc = (s: string) => encodeURIComponent(s);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  const runSearch = useCallback(async () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) return;

    setLoading(true);
    setSearched(false);
    setFecResults([]);
    setFecError('');
    setCourtResults([]);
    setCourtError('');
    setActiveProfile(null);

    const fullName = `${fn} ${ln}`;

    const [fecRes, courtRes] = await Promise.allSettled([
      fetch(`/api/osint/fec?name=${enc(fullName)}${state ? `&state=${enc(state)}` : ''}`).then(r => r.json()),
      fetch(`/api/osint/courtlistener?q=${enc('"' + fullName + '"')}&type=r`).then(r => r.json()),
    ]);

    if (fecRes.status === 'fulfilled') {
      if (fecRes.value.error) setFecError(fecRes.value.error);
      else setFecResults(fecRes.value.results || []);
    } else {
      setFecError('FEC lookup failed');
    }

    if (courtRes.status === 'fulfilled') {
      if (courtRes.value.error) setCourtError(courtRes.value.error);
      else setCourtResults(courtRes.value.results || []);
    } else {
      setCourtError('Court lookup failed');
    }

    setLoading(false);
    setSearched(true);
  }, [firstName, lastName, state]);

  const fn = firstName.trim();
  const ln = lastName.trim();
  const fullName = fn && ln ? `${fn} ${ln}` : '';

  // Deduplicate FEC by state + 5-digit zip prefix (same person may have zip+4 variants)
  const uniqueLocations = fecResults.reduce<{ city: string; state: string; zip: string; employer: string; occupation: string }[]>((acc, r) => {
    const zip5 = (r.contributor_zip || '').slice(0, 5);
    const key = `${r.contributor_state}|${zip5}`;
    const existing = acc.find(x => `${x.state}|${x.zip.slice(0, 5)}` === key);
    if (!existing) {
      acc.push({
        city: r.contributor_city || '—',
        state: r.contributor_state || '—',
        zip: zip5 || '—',
        employer: r.contributor_employer || '—',
        occupation: r.contributor_occupation || '—',
      });
    } else {
      // Fill in employer/occupation if the existing slot is blank
      if (existing.employer === '—' && r.contributor_employer) existing.employer = r.contributor_employer;
      if (existing.occupation === '—' && r.contributor_occupation) existing.occupation = r.contributor_occupation;
    }
    return acc;
  }, []);

  const activeLocation = activeProfile !== null ? uniqueLocations[activeProfile] : null;
  const filteredFecResults = activeLocation
    ? fecResults.filter(r =>
        r.contributor_city === activeLocation.city &&
        r.contributor_state === activeLocation.state &&
        r.contributor_zip === activeLocation.zip
      )
    : fecResults;

  return (
    <>
      <style>{`
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; line-height: 0.98; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .form-select { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); cursor: pointer; }
        .run-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 0 32px; cursor: pointer; text-transform: uppercase; transition: background 0.2s; white-space: nowrap; height: 49px; }
        .run-btn:hover { background: #4db3ff; }
        .run-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .loading-bar { padding: 24px; text-align: center; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); margin-bottom: 24px; }
        .section-hdr { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; padding-bottom: 10px; border-bottom: 1px solid var(--border); margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .section-count { font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .section-wrap { margin-bottom: 40px; }
        .empty-state { padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); text-align: center; }
        .error-state { padding: 20px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--red); background: rgba(255,60,60,0.04); border: 1px solid rgba(255,60,60,0.15); }
        .disambig-banner { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .disambig-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; }
        .disambig-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-top: 4px; }
        .show-all-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); background: none; border: 1px solid var(--border-bright); padding: 6px 14px; cursor: pointer; text-transform: uppercase; white-space: nowrap; transition: all 0.2s; }
        .show-all-btn:hover { color: #fff; border-color: var(--accent); }
        .loc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-bottom: 16px; }
        .loc-card { background: var(--bg-card); border: 1px solid var(--border); border-top: 2px solid var(--accent); padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .loc-card:hover { border-color: var(--accent); background: var(--bg-card-hover); }
        .loc-card.active { border-color: var(--accent); background: var(--bg-card-hover); border-top-width: 3px; }
        .loc-card.inactive { opacity: 0.35; }
        .loc-field { display: flex; flex-direction: column; gap: 3px; }
        .loc-key { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .loc-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.02em; }
        .loc-val.highlight { color: var(--accent); }
        .fec-table-wrap { background: var(--bg-card); border: 1px solid var(--border); overflow: auto; }
        .fec-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .fec-table th { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; padding: 12px 16px; text-align: left; background: var(--bg-secondary); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .fec-table td { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); padding: 11px 16px; border-bottom: 1px solid var(--border); letter-spacing: 0.02em; }
        .fec-table tr:last-child td { border-bottom: none; }
        .fec-table tr:hover td { background: var(--bg-card-hover); }
        .fec-table td.name-col { color: var(--text-primary); font-weight: 500; }
        .fec-table td.amount-col { color: #22cc66; }
        .court-list { display: flex; flex-direction: column; gap: 2px; }
        .court-item { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .court-item:hover { border-color: var(--accent); }
        .court-case { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .court-case a { color: var(--text-primary); text-decoration: none; }
        .court-case a:hover { color: var(--accent); }
        .court-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .court-meta-item { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
        .court-meta-item span { color: var(--text-secondary); }
        .sources-note { margin-top: 8px; padding: 14px 20px; background: var(--bg-card); border: 1px solid var(--border); }
        .sources-note-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); line-height: 1.8; }
        .sources-note-text strong { color: var(--text-secondary); }
        .deepdive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .dd-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .dd-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text-primary); }
        .dd-what { font-family: var(--font-display); font-size: 11px; color: var(--text-secondary); flex: 1; }
        .dd-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); border: 1px solid var(--border-bright); background: none; padding: 7px 16px; cursor: pointer; text-decoration: none; display: inline-block; align-self: flex-start; transition: all 0.2s; }
        .dd-btn:hover { background: var(--bg-card-hover); }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        @media (max-width: 900px) { .form-row { grid-template-columns: 1fr 1fr; } .loc-grid { grid-template-columns: 1fr; } .deepdive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; } .tool-hero { padding: 40px 20px; } .main-wrap { padding: 24px 20px; }
          .form-row { grid-template-columns: 1fr; } .deepdive-grid { grid-template-columns: 1fr; }
          .loc-card { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; } .footer-inner { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar"><a href="/osint" className="back-link">← Back to OSINT Hub</a></div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="eyebrow"><div className="eyebrow-line" aria-hidden="true" /><div className="eyebrow-text">Person Intelligence</div></div>
            <h1 className="tool-title">Person Lookup</h1>
            <p className="tool-desc">Enter a name to pull real public records directly onto this page — campaign finance filings (city, state, zip, employer), federal court appearances, and more. Data sourced live from FEC and CourtListener.</p>
          </div>
        </div>

        <div className="main-wrap">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input className="form-input" aria-label="First name" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name *</label>
              <input className="form-input" aria-label="Last name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && runSearch()} />
            </div>
            <div className="form-field">
              <label className="form-label">State (optional)</label>
              <select className="form-select" aria-label="State" value={state} onChange={e => setState(e.target.value)}>
                {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
              </select>
            </div>
            <button type="button" className="run-btn" onClick={runSearch} disabled={loading || !firstName.trim() || !lastName.trim()}>
              {loading ? 'Searching...' : 'Search →'}
            </button>
          </div>

          <div aria-live="polite">
          {loading && <div className="loading-bar">Querying FEC campaign finance + federal court records...</div>}

          {searched && !loading && (
            <>
              {/* ── FEC Campaign Finance / Address Data ── */}
              <div className="section-wrap">
                <div className="section-hdr">
                  <span>Campaign Finance Records — City, State, ZIP, Employer</span>
                  <span className="section-count">{fecResults.length} records · employer is self-reported</span>
                </div>

                {fecError && (
                  <div className="error-state" role="alert">
                    {fecError === 'FEC_RATE_LIMIT'
                      ? 'FEC rate limit hit — the demo API key only allows 40 requests/hour. Get a free key at api.data.gov/signup and add it as FEC_API_KEY in your Vercel environment variables.'
                      : fecError}
                  </div>
                )}

                {!fecError && fecResults.length === 0 && (
                  <div className="empty-state">No FEC campaign finance records found for {fullName}{state ? ` in ${state}` : ''}. This source only covers individuals who have donated $200+ to federal political campaigns.</div>
                )}

                {uniqueLocations.length > 1 && (
                  <div className="disambig-banner">
                    <div>
                      <div className="disambig-label">{uniqueLocations.length} different people found</div>
                      <div className="disambig-sub">Click a location card below to focus on one person — or show all records.</div>
                    </div>
                    {activeProfile !== null && (
                      <button type="button" className="show-all-btn" onClick={() => setActiveProfile(null)}>Show All</button>
                    )}
                  </div>
                )}

                {uniqueLocations.length > 0 && (
                  <>
                    <div style={{fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px'}}>
                      {uniqueLocations.length > 1 ? 'Select a Person — Click to Filter' : 'Known Location'}
                    </div>
                    <div className="loc-grid">
                      {uniqueLocations.map((loc, i) => {
                        const cardClass = activeProfile === null ? 'loc-card' : activeProfile === i ? 'loc-card active' : 'loc-card inactive';
                        return (
                          <div key={i} className={cardClass} onClick={() => setActiveProfile(activeProfile === i ? null : i)}>
                            <div className="loc-field">
                              <div className="loc-key">City</div>
                              <div className="loc-val highlight">{loc.city}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">State</div>
                              <div className="loc-val highlight">{loc.state}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">ZIP</div>
                              <div className="loc-val">{loc.zip}</div>
                            </div>
                            <div className="loc-field">
                              <div className="loc-key">Employer</div>
                              <div className="loc-val">{loc.employer}</div>
                            </div>
                            <div className="loc-field" style={{gridColumn: '1 / -1'}}>
                              <div className="loc-key">Occupation</div>
                              <div className="loc-val">{loc.occupation}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {filteredFecResults.length > 0 && (
                  <>
                    <div style={{fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '16px 0 10px'}}>
                      {activeProfile !== null ? `Donation History — ${activeLocation?.city}, ${activeLocation?.state}` : 'Full Donation History'}
                    </div>
                    <div className="fec-table-wrap">
                      <table className="fec-table">
                        <thead>
                          <tr>
                            <th>Name on Record</th>
                            <th>City</th>
                            <th>State</th>
                            <th>ZIP</th>
                            <th>Employer</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Committee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFecResults.map((r, i) => (
                            <tr key={i}>
                              <td className="name-col">{r.contributor_name || '—'}</td>
                              <td>{r.contributor_city || '—'}</td>
                              <td>{r.contributor_state || '—'}</td>
                              <td>{r.contributor_zip || '—'}</td>
                              <td>{r.contributor_employer || '—'}</td>
                              <td className="amount-col">{r.contribution_receipt_amount ? `$${r.contribution_receipt_amount.toLocaleString()}` : '—'}</td>
                              <td>{fmt(r.contribution_receipt_date)}</td>
                              <td>{r.committee?.name || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* ── Federal Court Records ── */}
              <div className="section-wrap">
                <div className="section-hdr">
                  <span>Federal Court Records — CourtListener / PACER</span>
                  <span className="section-count">{courtResults.length} cases found</span>
                </div>

                {courtError && <div className="error-state" role="alert">{courtError}</div>}

                {!courtError && courtResults.length === 0 && (
                  <div className="empty-state">No federal court filings found for &quot;{fullName}&quot;. CourtListener indexes PACER federal court cases only — state court records require separate state-level searches.</div>
                )}

                {courtResults.length > 0 && (
                  <div className="court-list">
                    {courtResults.map((r, i) => (
                      <div key={i} className="court-item">
                        <div className="court-case">
                          {r.absolute_url
                            ? <a href={`https://www.courtlistener.com${r.absolute_url}`} target="_blank" rel="noopener noreferrer">{r.case_name || 'Unnamed Case'}</a>
                            : (r.case_name || 'Unnamed Case')}
                        </div>
                        <div className="court-meta">
                          {r.docket_number && <div className="court-meta-item">Docket: <span>{r.docket_number}</span></div>}
                          {r.court && <div className="court-meta-item">Court: <span>{r.court}</span></div>}
                          {r.date_filed && <div className="court-meta-item">Filed: <span>{fmt(r.date_filed)}</span></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Data source note ── */}
              <div className="sources-note" style={{marginBottom: '40px'}}>
                <div className="sources-note-text">
                  <strong>Data sources:</strong> Federal Election Commission (FEC) — all federal campaign contributions $200+ are public record per 52 U.S.C. §30102. CourtListener/PACER — federal court filings only. <strong>Limitations:</strong> FEC only covers political donors. Court records cover federal dockets only, not state courts, criminal records, or local courts. For deeper searches use the links below.
                </div>
              </div>

              {/* ── Deep dive links ── */}
              <div className="section-hdr" style={{marginBottom: '16px'}}><span>Go Deeper — External Databases</span></div>
              <div className="deepdive-grid">
                {[
                  { name: 'TruePeopleSearch', what: 'Address history, DOB, relatives — free, no paywall', url: `https://www.truepeoplesearch.com/results?name=${enc(fullName)}${state ? `&citystatezip=${enc(state)}` : ''}` },
                  { name: 'FamilyTreeNow', what: 'Full date of birth, addresses, relatives — free', url: `https://www.familytreenow.com/search/genealogy/results?first=${enc(fn)}&last=${enc(ln)}${state ? `&state=${enc(state)}` : ''}` },
                  { name: 'FastPeopleSearch', what: 'Current address, age, household members — free', url: `https://www.fastpeoplesearch.com/name/${slug(fn)}-${slug(ln)}${state ? '_' + state : ''}` },
                  { name: 'Radaris', what: 'Full address history and previous locations', url: `https://radaris.com/p/${enc(fn)}/${enc(ln)}/` },
                  { name: 'WhitePages', what: 'Address + phone number', url: state ? `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}/${state}` : `https://www.whitepages.com/name/${slug(fn)}-${slug(ln)}` },
                  { name: 'State Court Records', what: 'Criminal + civil — search your state court system', url: `https://www.google.com/search?q=${enc(fn + ' ' + ln + ' ' + (state || '') + ' court records criminal')}` },
                ].map(d => (
                  <div key={d.name} className="dd-card">
                    <div className="dd-name">{d.name}</div>
                    <div className="dd-what">{d.what}</div>
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="dd-btn">Open →</a>
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        </div>

        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
