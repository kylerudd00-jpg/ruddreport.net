'use client';
import { useState } from 'react';

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

type ServiceDef = {
  name: string;
  description: string;
  category: 'People Search' | 'Social Media' | 'Public Records' | 'Government';
  buildUrl: (params: SearchParams) => string | null;
  manual?: boolean;
};

type SearchParams = {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  age: string;
  username: string;
};

type ServiceResult = ServiceDef & {
  url: string | null;
};

const SERVICES: ServiceDef[] = [
  // People Search
  {
    name: 'Spokeo',
    description: 'Addresses, relatives, phone',
    category: 'People Search',
    buildUrl: ({ firstName, lastName, state }) => {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
      return state
        ? `https://www.spokeo.com/${slug}/${state}`
        : `https://www.spokeo.com/${slug}`;
    },
  },
  {
    name: 'WhitePages',
    description: 'Phone + address records',
    category: 'People Search',
    buildUrl: ({ firstName, lastName, state }) => {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
      return state
        ? `https://www.whitepages.com/name/${slug}/${state}`
        : `https://www.whitepages.com/name/${slug}`;
    },
  },
  {
    name: 'BeenVerified',
    description: 'Criminal, financial, social',
    category: 'People Search',
    buildUrl: ({ firstName, lastName }) => {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
      return `https://www.beenverified.com/people/${slug}/`;
    },
  },
  {
    name: 'TruthFinder',
    description: 'Background checks',
    category: 'People Search',
    buildUrl: () => `https://www.truthfinder.com/`,
    manual: true,
  },
  {
    name: 'Pipl',
    description: 'Deep web profiles',
    category: 'People Search',
    buildUrl: ({ firstName, lastName, city }) => {
      const q = `${firstName}+${lastName}`;
      return city
        ? `https://pipl.com/search/?q=${q}&l=${encodeURIComponent(city)}&sloc=US`
        : `https://pipl.com/search/?q=${q}&sloc=US`;
    },
  },
  {
    name: 'FastPeopleSearch',
    description: 'Free basic info',
    category: 'People Search',
    buildUrl: ({ firstName, lastName, state }) => {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
      return state
        ? `https://www.fastpeoplesearch.com/name/${slug}_${state}`
        : `https://www.fastpeoplesearch.com/name/${slug}`;
    },
  },
  {
    name: 'PeopleFinders',
    description: 'Background + court records',
    category: 'People Search',
    buildUrl: ({ firstName, lastName }) => {
      const slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, '-');
      return `https://www.peoplefinders.com/people/${slug}`;
    },
  },
  // Social Media
  {
    name: 'LinkedIn',
    description: 'Professional profile',
    category: 'Social Media',
    buildUrl: ({ firstName, lastName }) =>
      `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${firstName} ${lastName}`)}`,
  },
  {
    name: 'Facebook',
    description: 'Personal / social',
    category: 'Social Media',
    buildUrl: ({ firstName, lastName }) =>
      `https://www.facebook.com/search/people/?q=${encodeURIComponent(`${firstName} ${lastName}`)}`,
  },
  {
    name: 'Twitter / X',
    description: 'Social media accounts',
    category: 'Social Media',
    buildUrl: ({ firstName, lastName }) =>
      `https://x.com/search?q=${encodeURIComponent(`${firstName} ${lastName}`)}&f=user`,
  },
  // Public Records
  {
    name: 'CourtListener',
    description: 'Federal court records',
    category: 'Public Records',
    buildUrl: ({ firstName, lastName }) =>
      `https://www.courtlistener.com/?q=${encodeURIComponent(`${firstName} ${lastName}`)}&type=p`,
  },
  {
    name: 'PACER',
    description: 'Federal court documents',
    category: 'Public Records',
    buildUrl: () => `https://pcl.uscourts.gov/pcl/pages/search/find.jsf`,
    manual: true,
  },
  {
    name: 'Google',
    description: 'General web search',
    category: 'Public Records',
    buildUrl: ({ firstName, lastName, city }) => {
      const name = `"${firstName} ${lastName}"`;
      const q = city ? `${name} ${city}` : name;
      return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    },
  },
  {
    name: 'Google News',
    description: 'News mentions',
    category: 'Public Records',
    buildUrl: ({ firstName, lastName }) =>
      `https://news.google.com/search?q=${encodeURIComponent(`${firstName} ${lastName}`)}`,
  },
  {
    name: 'Google Images',
    description: 'Photos',
    category: 'Public Records',
    buildUrl: ({ firstName, lastName }) =>
      `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`"${firstName} ${lastName}"`)}`,
  },
  // Government
  {
    name: 'OFAC Sanctions',
    description: 'Sanctions list check',
    category: 'Government',
    buildUrl: () => `https://sanctionssearch.ofac.treas.gov/`,
    manual: true,
  },
  {
    name: 'SEC EDGAR',
    description: 'Insider filings',
    category: 'Government',
    buildUrl: ({ firstName, lastName }) =>
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${firstName} ${lastName}"`)}&dateRange=custom`,
  },
];

const CATEGORIES = ['All', 'People Search', 'Social Media', 'Public Records', 'Government'] as const;
type Category = typeof CATEGORIES[number];

const CHECKLIST_ITEMS = [
  'Check for social media accounts',
  'Verify current address and phone',
  'Search court records for lawsuits, criminal history',
  'Check professional licenses (state licensing boards)',
  'Search news mentions',
  'Check SEC filings for insider trading',
  'Check voter registration records',
  'Run email permutation on likely work email',
  'Check for business ownership (state business registries)',
  'Verify LinkedIn employment history',
];

const TOP_5 = ['Google', 'LinkedIn', 'Spokeo', 'WhitePages', 'FastPeopleSearch'];

export default function PeopleSearch() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [age, setAge] = useState('');
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [filter, setFilter] = useState<Category>('All');
  const [checklist, setChecklist] = useState<boolean[]>(CHECKLIST_ITEMS.map(() => false));
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    const params: SearchParams = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      city: city.trim(),
      state,
      age: age.trim(),
      username: username.trim(),
    };
    const built: ServiceResult[] = SERVICES.map(s => ({
      ...s,
      url: s.buildUrl(params),
    }));
    setResults(built);
    setFilter('All');
    setGenerated(true);
  };

  const openTop5 = () => {
    results
      .filter(r => TOP_5.includes(r.name) && r.url && !r.manual)
      .forEach(r => window.open(r.url!, '_blank', 'noopener,noreferrer'));
  };

  const toggleCheck = (i: number) => {
    setChecklist(prev => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  const filtered = filter === 'All' ? results : results.filter(r => r.category === filter);
  const autofilled = results.filter(r => !r.manual).length;
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

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
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 740px; }

        .form-section { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 12px 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.3s; width: 100%; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .form-select { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 12px 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.3s; width: 100%; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .form-select:focus { border-color: var(--accent); }
        .form-select option { background: var(--bg-card); }
        .form-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .btn-primary { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #ffffff; background: var(--accent); border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .btn-primary:hover { background: #4db8ff; }
        .btn-primary:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .btn-secondary { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--accent); background: none; border: 1px solid var(--border-bright); padding: 14px 28px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; white-space: nowrap; }
        .btn-secondary:hover { background: rgba(30,158,255,0.08); border-color: var(--accent); }
        .btn-secondary:disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; }
        .privacy-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); border: 1px solid var(--border); padding: 10px 16px; background: rgba(30,158,255,0.03); }

        .results-section { padding: 0 40px 40px; max-width: 1100px; margin: 0 auto; }
        .results-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 0 12px; border-bottom: 1px solid var(--border); margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .results-subject { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; }
        .results-meta { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .results-meta span { color: var(--accent); }

        .filters { display: flex; gap: 2px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border); padding: 8px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: var(--accent); border-color: var(--border-bright); }
        .filter-btn.active { color: var(--accent); border-color: var(--accent); background: rgba(30,158,255,0.08); }

        .cat-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; padding: 8px 0 10px; border-bottom: 1px solid var(--border); margin-bottom: 10px; margin-top: 28px; }
        .cat-label:first-of-type { margin-top: 0; }

        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .service-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .service-card:hover { border-color: var(--border-bright); }
        .service-card.autofilled { border-top: 2px solid var(--border-bright); }
        .service-card.manual-card { border-top: 2px solid rgba(255,170,0,0.35); background: #0e0d08; }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .card-name { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
        .badge-auto { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #22cc66; border: 1px solid rgba(34,197,94,0.3); padding: 3px 8px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .badge-manual { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 3px 8px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .card-desc { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); }
        .card-note { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: #ffaa00; opacity: 0.8; }
        .open-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: var(--accent); background: none; border: 1px solid var(--border-bright); padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; }
        .open-btn:hover { background: rgba(30,158,255,0.08); border-color: var(--accent); }
        .open-btn-manual { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #ffaa00; background: none; border: 1px solid rgba(255,170,0,0.25); padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; }
        .open-btn-manual:hover { background: rgba(255,170,0,0.06); border-color: rgba(255,170,0,0.5); }

        .checklist-section { padding: 0 40px 40px; max-width: 1100px; margin: 0 auto; }
        .section-header { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .section-sub { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 20px; }
        .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .checklist-item { display: flex; align-items: center; gap: 14px; background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; cursor: pointer; transition: all 0.2s; user-select: none; }
        .checklist-item:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .checklist-item.checked { border-color: var(--border-bright); background: var(--bg-card); }
        .check-box { width: 18px; height: 18px; border: 1px solid var(--border-bright); background: none; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .check-box.checked { background: var(--accent); border-color: var(--accent); }
        .check-icon { color: #fff; font-size: 11px; font-weight: 700; line-height: 1; }
        .check-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); line-height: 1.5; }
        .check-text.checked { color: var(--text-muted); text-decoration: line-through; }
        .checklist-progress { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); margin-top: 14px; text-transform: uppercase; }
        .checklist-progress span { color: var(--accent); }

        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .form-section { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .form-grid-4 { grid-template-columns: 1fr 1fr; }
          .results-section { padding: 0 20px 32px; }
          .cards-grid { grid-template-columns: 1fr; }
          .checklist-section { padding: 0 20px 32px; }
          .checklist-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
        @media (max-width: 480px) {
          .form-grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        {/* BACK BAR */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        {/* HERO */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Human Intelligence</div>
            </div>
            <h1 className="tool-title">People Search</h1>
            <p className="tool-desc">Public records, property filings, voter registrations, and social profiles contain more information about people than most realize. Search by name to pull aggregated results across people-search databases — addresses, known relatives, and linked social profiles — all in one place.</p>
          </div>
        </div>

        {/* INPUT FORM */}
        <div className="form-section">
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">First Name *</label>
              <input
                className="form-input"
                aria-label="First Name"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Last Name *</label>
              <input
                className="form-input"
                aria-label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
            </div>
          </div>

          <div className="form-grid-4">
            <div className="form-field">
              <label className="form-label">City</label>
              <input
                className="form-input"
                aria-label="City"
                placeholder="Chicago"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">State</label>
              <select
                className="form-select"
                aria-label="State"
                value={state}
                onChange={e => setState(e.target.value)}
              >
                {US_STATES.map(s => (
                  <option key={s.abbr} value={s.abbr}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Age / Birth Year</label>
              <input
                className="form-input"
                aria-label="Age or Birth Year"
                placeholder="45 or 1979"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Username (optional)</label>
              <input
                className="form-input"
                aria-label="Username"
                placeholder="johndoe99"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginBottom: '20px' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={generate}
              disabled={!firstName.trim() || !lastName.trim()}
            >
              Generate Search Links →
            </button>
            {generated && (
              <button
                type="button"
                className="btn-secondary"
                onClick={openTop5}
                disabled={results.length === 0}
              >
                Search All (Top 5) →
              </button>
            )}
          </div>

          <div className="privacy-note">
            This tool aggregates links to public records databases. Only use for legitimate research purposes.
          </div>
        </div>

        {/* RESULTS */}
        {generated && results.length > 0 && (
          <div className="results-section" aria-live="polite">
            <div className="results-header">
              <div className="results-subject">{fullName}</div>
              <div className="results-meta">
                <span>{autofilled}</span> auto-filled &nbsp;·&nbsp; {results.filter(r => r.manual).length} manual
              </div>
            </div>

            {/* FILTERS */}
            <div className="filters">
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c}
                  className={`filter-btn${filter === c ? ' active' : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* CARDS BY CATEGORY */}
            {(filter === 'All'
              ? (['People Search', 'Social Media', 'Public Records', 'Government'] as const)
              : [filter as Exclude<Category, 'All'>]
            ).map(cat => {
              const catResults = filtered.filter(r => r.category === cat);
              if (catResults.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="cat-label">{cat}</div>
                  <div className="cards-grid">
                    {catResults.map((r, i) => (
                      <div
                        key={i}
                        className={`service-card${r.manual ? ' manual-card' : ' autofilled'}`}
                      >
                        <div className="card-top">
                          <div className="card-name">{r.name}</div>
                          {r.manual
                            ? <span className="badge-manual">Paste Manually</span>
                            : <span className="badge-auto">Auto-filled</span>
                          }
                        </div>
                        <div className="card-desc">{r.description}</div>
                        {r.manual && (
                          <div className="card-note">Open the site and paste the name manually</div>
                        )}
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={r.manual ? 'open-btn-manual' : 'open-btn'}
                          >
                            Open &rarr;
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHECKLIST */}
        <div className="checklist-section" style={{ marginTop: generated ? '20px' : '0' }}>
          <div style={{ borderTop: generated ? '1px solid var(--border)' : 'none', paddingTop: generated ? '32px' : '0' }}>
            <div className="section-header">OSINT Investigation Checklist</div>
            <div className="section-sub">Track your research steps</div>
            <div className="checklist-grid">
              {CHECKLIST_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className={`checklist-item${checklist[i] ? ' checked' : ''}`}
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`check-box${checklist[i] ? ' checked' : ''}`}>
                    {checklist[i] && <span className="check-icon">&#10003;</span>}
                  </div>
                  <div className={`check-text${checklist[i] ? ' checked' : ''}`}>{item}</div>
                </div>
              ))}
            </div>
            <div className="checklist-progress">
              <span>{checklist.filter(Boolean).length}</span> / {CHECKLIST_ITEMS.length} steps completed
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">
              © 2026 The Rudd Report
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
