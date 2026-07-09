'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

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

/* ─────────────────────────── Tab 1: Identity ─────────────────────────── */

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

/* ─────────────────────────── Tab 2: Court & Background ─────────────────────────── */

// Voter record lookup URLs by state (states with public self-lookup)
const VOTER_URLS: Record<string, string> = {
  AZ: 'https://my.arizona.vote/PortalList.aspx',
  CO: 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
  FL: 'https://registration.elections.myflorida.com/CheckVoterStatus',
  GA: 'https://mvp.sos.ga.gov/s/voter-registration-overview',
  MI: 'https://mvic.sos.state.mi.us/Voter/Index',
  NC: 'https://vt.ncsbe.gov/RegLkup/',
  OH: 'https://voterlookup.ohiosos.gov/voterlookup.aspx',
  TX: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
  VA: 'https://vote.elections.virginia.gov/VoterInformation/PublicContactLookup',
  WA: 'https://voter.votewa.gov/WhereToVote.aspx',
  WI: 'https://myvote.wi.gov/en-us/Find-My-Polling-Place',
};

/* ─────────────────────────── Tab 3: Address & Property ─────────────────────────── */

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

/* ─────────────────────────── Tabs config ─────────────────────────── */

const TABS = [
  { id: 'identity', label: 'Identity' },
  { id: 'court', label: 'Court & Background' },
  { id: 'property', label: 'Donations & Court Records' },
] as const;
type TabId = typeof TABS[number]['id'];

export default function PersonSearch() {
  // Active tab
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'court' || t === 'property' || t === 'identity') setActiveTab(t);
  }, []);

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    if (next !== null) {
      e.preventDefault();
      setActiveTab(TABS[next].id);
      tabRefs.current[next]?.focus();
    }
  };

  // Shared person-name inputs (used by all three tabs)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [state, setState] = useState('');

  // Tab 1 (identity) — extra inputs + results
  const [city, setCity] = useState('');
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

  // Tab 2 (court) — submission snapshot
  const [submitted, setSubmitted] = useState<{ fn: string; ln: string; state: string } | null>(null);

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSubmitted({ fn: firstName.trim(), ln: lastName.trim(), state });
  };

  const bFn = submitted?.fn || '';
  const bLn = submitted?.ln || '';
  const bSt = submitted?.state || '';
  const enc = (s: string) => encodeURIComponent(s);
  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

  type CardColor = 'blue' | 'green' | 'orange' | 'red';

  const services: { name: string; what: string; color: CardColor; manual?: boolean; url: () => string }[] = [
    {
      name: 'TruePeopleSearch',
      what: 'Address history, age, relatives — free & no paywall',
      color: 'green',
      url: () => `https://www.truepeoplesearch.com/results?name=${enc(bFn + ' ' + bLn)}${bSt ? `&citystatezip=${enc(bSt)}` : ''}`,
    },
    {
      name: 'FamilyTreeNow',
      what: 'Full date of birth, addresses, relatives — free',
      color: 'green',
      url: () => `https://www.familytreenow.com/search/genealogy/results?first=${enc(bFn)}&last=${enc(bLn)}${bSt ? `&state=${enc(bSt)}` : ''}`,
    },
    {
      name: 'FastPeopleSearch',
      what: 'Current address, age, relatives — free',
      color: 'green',
      url: () => `https://www.fastpeoplesearch.com/name/${slug(bFn)}-${slug(bLn)}${bSt ? `_${bSt}` : ''}`,
    },
    {
      name: 'Radaris',
      what: 'Address history, age, phone, social profiles',
      color: 'blue',
      url: () => `https://radaris.com/p/${enc(bFn)}/${enc(bLn)}/`,
    },
    {
      name: 'WhitePages',
      what: 'Phone numbers, addresses, age',
      color: 'blue',
      url: () => bSt
        ? `https://www.whitepages.com/name/${slug(bFn)}-${slug(bLn)}/${bSt}`
        : `https://www.whitepages.com/name/${slug(bFn)}-${slug(bLn)}`,
    },
    {
      name: 'Spokeo',
      what: 'Social profiles, addresses, phone, relatives',
      color: 'blue',
      url: () => bSt
        ? `https://www.spokeo.com/${slug(bFn)}-${slug(bLn)}/${bSt}`
        : `https://www.spokeo.com/${slug(bFn)}-${slug(bLn)}`,
    },
    {
      name: 'PeekYou',
      what: 'Social media + public web profile aggregator',
      color: 'blue',
      url: () => `https://www.peekyou.com/${enc(bFn)}_${enc(bLn)}`,
    },
    {
      name: 'Pipl',
      what: 'Deep web profiles, professional records',
      color: 'blue',
      url: () => `https://pipl.com/search/?q=${enc(bFn + ' ' + bLn)}${bSt ? `&sloc=US-${bSt}` : '&sloc=US'}`,
    },
    {
      name: 'BeenVerified',
      what: 'Criminal records, addresses, social — paid',
      color: 'orange',
      url: () => `https://www.beenverified.com/people/${slug(bFn)}-${slug(bLn)}/`,
    },
    {
      name: 'Intelius',
      what: 'Background check, criminal history — paid',
      color: 'orange',
      url: () => `https://www.intelius.com/people-search/${slug(bFn)}-${slug(bLn)}/`,
    },
    {
      name: 'Sex Offender Registry',
      what: 'National public sex offender registry (NSOPW)',
      color: 'red',
      url: () => `https://www.nsopw.gov/Search/Results?lang=en&bn=${enc(bLn)}&fn=${enc(bFn)}${bSt ? `&state=${bSt}` : ''}&radius=1`,
    },
    {
      name: 'Federal Inmate Locator',
      what: 'BOP federal prison inmate search — paste name on site',
      color: 'red',
      manual: true,
      url: () => 'https://www.bop.gov/inmateloc/',
    },
    {
      name: 'CourtListener',
      what: 'Federal court cases — PACER/RECAP filings',
      color: 'blue',
      url: () => `https://www.courtlistener.com/?q=${enc('"' + bFn + ' ' + bLn + '"')}&type=r&order_by=score+desc`,
    },
    {
      name: 'Google Search',
      what: 'Surface web presence — news, profiles, mentions',
      color: 'blue',
      url: () => `https://www.google.com/search?q=${enc('"' + bFn + ' ' + bLn + '"')}${bSt ? `+${enc(bSt)}` : ''}`,
    },
  ];

  // Add voter record link if state selected and supported
  const voterUrl = bSt && VOTER_URLS[bSt] ? VOTER_URLS[bSt] : null;

  const colorMap: Record<CardColor, { border: string; badge: string; badgeBg: string; btn: string; btnBorder: string; btnHoverBg: string }> = {
    green:  { border: '#00ff88', badge: '#00ff88', badgeBg: 'rgba(0,255,136,0.08)', btn: '#00ff88', btnBorder: 'rgba(0,255,136,0.4)', btnHoverBg: 'rgba(0,255,136,0.1)' },
    blue:   { border: '#1e9eff', badge: '#1e9eff', badgeBg: 'rgba(30,158,255,0.08)', btn: '#1e9eff', btnBorder: 'rgba(30,158,255,0.4)', btnHoverBg: 'rgba(30,158,255,0.1)' },
    orange: { border: '#ffaa00', badge: '#ffaa00', badgeBg: 'rgba(255,170,0,0.08)', btn: '#ffaa00', btnBorder: 'rgba(255,170,0,0.4)', btnHoverBg: 'rgba(255,170,0,0.1)' },
    red:    { border: '#ff4444', badge: '#ff4444', badgeBg: 'rgba(255,68,68,0.08)', btn: '#ff4444', btnBorder: 'rgba(255,68,68,0.4)', btnHoverBg: 'rgba(255,68,68,0.1)' },
  };

  // Tab 3 (property) — live FEC + CourtListener
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [fecResults, setFecResults] = useState<FecRecord[]>([]);
  const [fecError, setFecError] = useState('');
  const [courtResults, setCourtResults] = useState<CourtRecord[]>([]);
  const [courtError, setCourtError] = useState('');
  const [activeProfile, setActiveProfile] = useState<number | null>(null);

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

    const name = `${fn} ${ln}`;

    const [fecRes, courtRes] = await Promise.allSettled([
      fetch(`/api/osint/fec?name=${enc(name)}${state ? `&state=${enc(state)}` : ''}`).then(r => r.json()),
      fetch(`/api/osint/courtlistener?q=${enc('"' + name + '"')}&type=r`).then(r => r.json()),
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

  const pFn = firstName.trim();
  const pLn = lastName.trim();
  const pFullName = pFn && pLn ? `${pFn} ${pLn}` : '';

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

        /* Tabs */
        .tabs-wrap { max-width: 1100px; margin: 0 auto; padding: 24px 40px 0; }
        .tablist { display: flex; gap: 2px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
        .tab-btn { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); background: none; border: 1px solid var(--border); border-bottom: none; padding: 14px 24px; cursor: pointer; text-transform: uppercase; transition: color 0.2s, border-color 0.2s, background 0.2s; margin-bottom: -1px; }
        .tab-btn:hover { color: var(--accent); border-color: var(--border-bright); }
        .tab-btn.active { color: var(--accent); border-color: var(--accent); border-bottom: 1px solid var(--bg-primary); background: rgba(30,158,255,0.06); }

        /* Shared form primitives */
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.2s; width: 100%; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .form-select { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 14px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.2s; width: 100%; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .form-select:focus { border-color: var(--accent); }
        .form-select option { background: var(--bg-card); }

        /* ── Tab 1: Identity ── */
        .form-section { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
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

        /* ── Shared wrap for tabs 2 & 3 ── */
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }

        /* ── Tab 2: Court & Background ── */
        .bg-form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
        .bg-run-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #fff; background: var(--accent); border: none; padding: 14px 32px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; height: 49px; }
        .bg-run-btn:hover { background: #4db8ff; }
        .bg-run-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .target-bar { padding: 14px 20px; background: var(--bg-secondary); border: 1px solid var(--border); margin-bottom: 28px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .target-value { font-family: var(--font-mono); font-size: 14px; color: var(--accent); }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
        .bg-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 40px; }
        .card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
        .card:hover { border-color: var(--border-bright); }
        .bg-card-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
        .card-what { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
        .card-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid; background: none; padding: 8px 18px; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .card-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        .voter-box { background: var(--bg-card); border: 1px solid rgba(34,204,102,0.3); padding: 20px 24px; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .voter-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: #22cc66; text-transform: uppercase; margin-bottom: 4px; }
        .voter-desc { font-size: 13px; color: var(--text-secondary); }
        .voter-btn { font-family: var(--font-display); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #22cc66; border: 1px solid rgba(34,204,102,0.4); background: none; padding: 10px 24px; cursor: pointer; transition: all 0.2s; text-decoration: none; white-space: nowrap; }
        .voter-btn:hover { background: rgba(34,204,102,0.1); }
        .legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-secondary); text-transform: uppercase; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── Tab 3: Address & Property ── */
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 32px; }
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
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }

        @media (max-width: 900px) {
          .bg-form-grid { grid-template-columns: 1fr 1fr; }
          .bg-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .form-row { grid-template-columns: 1fr 1fr; }
          .loc-grid { grid-template-columns: 1fr; }
          .deepdive-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .tabs-wrap { padding: 20px 20px 0; }
          .form-section { padding: 24px 20px; }
          .main-wrap { padding: 24px 20px; }
          .form-grid { grid-template-columns: 1fr; }
          .form-grid-4 { grid-template-columns: 1fr 1fr; }
          .bg-form-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .results-section { padding: 0 20px 32px; }
          .cards-grid { grid-template-columns: 1fr; }
          .bg-cards-grid { grid-template-columns: 1fr; }
          .deepdive-grid { grid-template-columns: 1fr; }
          .loc-card { grid-template-columns: 1fr; }
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
              <div className="tool-eyebrow-text">OSINT Hub — Identity</div>
            </div>
            <h1 className="tool-title">Person Search</h1>
            <p className="tool-desc">Search a person across three research surfaces — aggregated people-search links, court and background databases, and live campaign-finance and federal court records — all from one name.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs-wrap">
          <div className="tablist" role="tablist" aria-label="Person Search sources">
            {TABS.map((t, i) => {
              const active = activeTab === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={active ? 0 : -1}
                  ref={el => { tabRefs.current[i] = el; }}
                  className={`tab-btn${active ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  onKeyDown={e => onTabKeyDown(e, i)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─────────── PANEL 1: IDENTITY ─────────── */}
        <div role="tabpanel" id="panel-identity" aria-labelledby="tab-identity" hidden={activeTab !== 'identity'}>
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
        </div>

        {/* ─────────── PANEL 2: COURT & BACKGROUND ─────────── */}
        <div role="tabpanel" id="panel-court" aria-labelledby="tab-court" hidden={activeTab !== 'court'}>
          <div className="main-wrap">
            <div className="bg-form-grid">
              <div className="form-field">
                <label className="form-label">First Name *</label>
                <input className="form-input" aria-label="First name" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
              <div className="form-field">
                <label className="form-label">Last Name *</label>
                <input className="form-input" aria-label="Last name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>
              <div className="form-field">
                <label className="form-label">State (optional)</label>
                <select className="form-select" aria-label="State" value={state} onChange={e => setState(e.target.value)}>
                  {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.label}</option>)}
                </select>
              </div>
              <button type="button" className="bg-run-btn" onClick={handleSubmit} disabled={!firstName.trim() || !lastName.trim()}>
                Search →
              </button>
            </div>

            <div aria-live="polite">
              {submitted && (
                <div className="target-bar">
                  <div className="target-label">Subject</div>
                  <div className="target-value">{bFn} {bLn}{bSt ? ` — ${bSt}` : ''}</div>
                </div>
              )}

              {/* Voter record shortcut when state is selected */}
              {submitted && voterUrl && (
                <div style={{marginBottom: '12px'}}>
                  <h2 className="section-label">Voter Registration — {bSt} (may include DOB + address)</h2>
                </div>
              )}
              {submitted && voterUrl && (
                <div className="voter-box">
                  <div>
                    <div className="voter-label">{bSt} Voter Records</div>
                    <div className="voter-desc">Many state voter records include date of birth, current address, and party registration. Navigate to the site and search by name.</div>
                  </div>
                  <a href={voterUrl} target="_blank" rel="noopener noreferrer" className="voter-btn">Open Lookup →</a>
                </div>
              )}

              <h2 className="section-label">Public Records Databases</h2>

              <div className="legend">
                <div className="legend-item"><div className="legend-dot" style={{background:'#00ff88'}} aria-hidden="true" />Free — no paywall</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'#1e9eff'}} aria-hidden="true" />Free partial / signup required</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'#ffaa00'}} aria-hidden="true" />Paid service</div>
                <div className="legend-item"><div className="legend-dot" style={{background:'#ff4444'}} aria-hidden="true" />Criminal / safety records</div>
              </div>

              <div className="bg-cards-grid">
                {services.map((svc) => {
                  const c = colorMap[svc.color];
                  return (
                    <div key={svc.name} className="card" style={{borderTop: `2px solid ${c.border}`}}>
                      <div className="bg-card-name">{svc.name}</div>
                      <div className="card-what">{svc.what}</div>
                      {submitted ? (
                        <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="card-btn"
                          style={{color: c.btn, borderColor: c.btnBorder}}>
                          {svc.manual ? 'Open Site →' : 'Search →'}
                        </a>
                      ) : (
                        <span className="card-btn disabled">Search →</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ─────────── PANEL 3: ADDRESS & PROPERTY ─────────── */}
        <div role="tabpanel" id="panel-property" aria-labelledby="tab-property" hidden={activeTab !== 'property'}>
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
                    <div className="empty-state">No FEC campaign finance records found for {pFullName}{state ? ` in ${state}` : ''}. This source only covers individuals who have donated $200+ to federal political campaigns.</div>
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
                    <div className="empty-state">No federal court filings found for &quot;{pFullName}&quot;. CourtListener indexes PACER federal court cases only — state court records require separate state-level searches.</div>
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
                    { name: 'TruePeopleSearch', what: 'Address history, DOB, relatives — free, no paywall', url: `https://www.truepeoplesearch.com/results?name=${enc(pFullName)}${state ? `&citystatezip=${enc(state)}` : ''}` },
                    { name: 'FamilyTreeNow', what: 'Full date of birth, addresses, relatives — free', url: `https://www.familytreenow.com/search/genealogy/results?first=${enc(pFn)}&last=${enc(pLn)}${state ? `&state=${enc(state)}` : ''}` },
                    { name: 'FastPeopleSearch', what: 'Current address, age, household members — free', url: `https://www.fastpeoplesearch.com/name/${slug(pFn)}-${slug(pLn)}${state ? '_' + state : ''}` },
                    { name: 'Radaris', what: 'Full address history and previous locations', url: `https://radaris.com/p/${enc(pFn)}/${enc(pLn)}/` },
                    { name: 'WhitePages', what: 'Address + phone number', url: state ? `https://www.whitepages.com/name/${slug(pFn)}-${slug(pLn)}/${state}` : `https://www.whitepages.com/name/${slug(pFn)}-${slug(pLn)}` },
                    { name: 'State Court Records', what: 'Criminal + civil — search your state court system', url: `https://www.google.com/search?q=${enc(pFn + ' ' + pLn + ' ' + (state || '') + ' court records criminal')}` },
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
        </div>

        {/* FOOTER */}
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
