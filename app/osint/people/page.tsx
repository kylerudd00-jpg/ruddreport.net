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
  const [menuOpen, setMenuOpen] = useState(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        .page-wrap { padding-top: 70px; }

        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }

        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 740px; }

        .form-section { padding: 40px; max-width: 1100px; margin: 0 auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .form-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .form-field { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; outline: none; transition: border-color 0.3s; width: 100%; }
        .form-input:focus { border-color: rgba(30,158,255,0.5); }
        .form-input::placeholder { color: #3d5870; }
        .form-select { background: #0a1520; border: 1px solid rgba(30,158,255,0.2); padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 1px; outline: none; transition: border-color 0.3s; width: 100%; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .form-select:focus { border-color: rgba(30,158,255,0.5); }
        .form-select option { background: #0a1520; }
        .form-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
        .btn-primary { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .btn-primary:hover { background: #4db8ff; }
        .btn-primary:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .btn-secondary { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.4); padding: 14px 28px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; white-space: nowrap; }
        .btn-secondary:hover { background: rgba(30,158,255,0.08); border-color: #1e9eff; }
        .btn-secondary:disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; }
        .privacy-note { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; border: 1px solid rgba(30,158,255,0.08); padding: 10px 16px; background: rgba(30,158,255,0.03); }

        .results-section { padding: 0 40px 40px; max-width: 1100px; margin: 0 auto; }
        .results-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 0 12px; border-bottom: 1px solid rgba(30,158,255,0.08); margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .results-subject { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; }
        .results-meta { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; }
        .results-meta span { color: #1e9eff; }

        .filters { display: flex; gap: 2px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-btn { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; background: none; border: 1px solid rgba(30,158,255,0.1); padding: 8px 18px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; }
        .filter-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
        .filter-btn.active { color: #1e9eff; border-color: #1e9eff; background: rgba(30,158,255,0.08); }

        .cat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; padding: 8px 0 10px; border-bottom: 1px solid rgba(30,158,255,0.06); margin-bottom: 10px; margin-top: 28px; }
        .cat-label:first-of-type { margin-top: 0; }

        .cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .service-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px; display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden; transition: border-color 0.3s; }
        .service-card:hover { border-color: rgba(30,158,255,0.2); }
        .service-card.autofilled { border-top: 2px solid rgba(30,158,255,0.4); }
        .service-card.manual-card { border-top: 2px solid rgba(255,170,0,0.35); background: #0e0d08; }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
        .card-name { font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .badge-auto { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #22c55e; border: 1px solid rgba(34,197,94,0.3); padding: 3px 8px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .badge-manual { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; color: #ffaa00; border: 1px solid rgba(255,170,0,0.3); padding: 3px 8px; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
        .card-desc { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #7a9bb5; }
        .card-note { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #ffaa00; opacity: 0.8; }
        .open-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #1e9eff; background: none; border: 1px solid rgba(30,158,255,0.25); padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; }
        .open-btn:hover { background: rgba(30,158,255,0.08); border-color: #1e9eff; }
        .open-btn-manual { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #ffaa00; background: none; border: 1px solid rgba(255,170,0,0.25); padding: 8px 16px; cursor: pointer; text-transform: uppercase; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; }
        .open-btn-manual:hover { background: rgba(255,170,0,0.06); border-color: rgba(255,170,0,0.5); }

        .checklist-section { padding: 0 40px 40px; max-width: 1100px; margin: 0 auto; }
        .section-header { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
        .section-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; margin-bottom: 20px; }
        .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .checklist-item { display: flex; align-items: center; gap: 14px; background: #0a1520; border: 1px solid rgba(30,158,255,0.06); padding: 16px 20px; cursor: pointer; transition: all 0.2s; user-select: none; }
        .checklist-item:hover { border-color: rgba(30,158,255,0.15); background: #0d1d2e; }
        .checklist-item.checked { border-color: rgba(30,158,255,0.2); background: #091620; }
        .check-box { width: 18px; height: 18px; border: 1px solid rgba(30,158,255,0.3); background: none; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .check-box.checked { background: #1e9eff; border-color: #1e9eff; }
        .check-icon { color: #fff; font-size: 11px; font-weight: 700; line-height: 1; }
        .check-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #9ab0c4; line-height: 1.5; }
        .check-text.checked { color: #3d5870; text-decoration: line-through; }
        .checklist-progress { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; margin-top: 14px; text-transform: uppercase; }
        .checklist-progress span { color: #1e9eff; }

        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }

        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
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

      <div className="page-wrap">
        {/* NAV */}
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        {/* BACK BAR */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        {/* HERO */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">Human Intelligence</div>
            </div>
            <div className="tool-title">People Search</div>
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
                placeholder="Chicago"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">State</label>
              <select
                className="form-select"
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
                placeholder="45 or 1979"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Username (optional)</label>
              <input
                className="form-input"
                placeholder="johndoe99"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions" style={{ marginBottom: '20px' }}>
            <button
              className="btn-primary"
              onClick={generate}
              disabled={!firstName.trim() || !lastName.trim()}
            >
              Generate Search Links →
            </button>
            {generated && (
              <button
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
          <div className="results-section">
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
          <div style={{ borderTop: generated ? '1px solid rgba(30,158,255,0.08)' : 'none', paddingTop: generated ? '32px' : '0' }}>
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
              © 2026 The Rudd Report — All Rights Reserved
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
