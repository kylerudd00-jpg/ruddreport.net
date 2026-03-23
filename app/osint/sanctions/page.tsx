'use client';

import { useState, useMemo } from 'react';

type SanctionedEntry = {
  name: string;
  country: string;
  type: 'Individual' | 'Entity';
  list: string;
  programs: string[];
  added: string;
  notes: string;
};

const SANCTIONED: SanctionedEntry[] = [
  // Russia
  { name: 'Vladimir Putin', country: 'Russia', type: 'Individual', list: 'OFAC SDN', programs: ['UKRAINE-EO13685', 'RUSSIA-EO14024'], added: '2022', notes: 'President of Russia' },
  { name: 'Sergei Lavrov', country: 'Russia', type: 'Individual', list: 'OFAC SDN', programs: ['UKRAINE-EO13685'], added: '2022', notes: 'Foreign Minister' },
  { name: 'Rosoboronexport', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['RUSSIA-EO14024'], added: '2022', notes: 'State arms exporter' },
  { name: 'Sberbank', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['RUSSIA-EO14024'], added: '2022', notes: 'Largest Russian bank' },
  { name: 'VTB Bank', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['RUSSIA-EO14024'], added: '2022', notes: 'State-owned bank' },
  { name: 'Gazprom', country: 'Russia', type: 'Entity', list: 'EU Sanctions', programs: ['Russia-Ukraine'], added: '2022', notes: 'State energy company' },
  { name: 'Rostec', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['RUSSIA-EO14024'], added: '2022', notes: 'State defense conglomerate' },
  { name: 'Yevgeny Prigozhin', country: 'Russia', type: 'Individual', list: 'OFAC SDN', programs: ['CYBER2', 'UKRAINE-EO13685'], added: '2018', notes: 'Wagner Group founder' },
  { name: 'Wagner Group', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['UKRAINE-EO13685'], added: '2023', notes: 'Private military company' },
  // Iran
  { name: 'Islamic Revolutionary Guard Corps', country: 'Iran', type: 'Entity', list: 'OFAC SDN', programs: ['IRAN', 'SDGT'], added: '2007', notes: 'IRGC — designated FTO' },
  { name: 'Qasem Soleimani', country: 'Iran', type: 'Individual', list: 'OFAC SDN', programs: ['IRAN', 'SDGT'], added: '2011', notes: 'Former IRGC Quds Force commander' },
  { name: 'Bank Melli Iran', country: 'Iran', type: 'Entity', list: 'OFAC SDN', programs: ['IRAN'], added: '2008', notes: 'Largest Iranian bank' },
  { name: 'Bank Saderat Iran', country: 'Iran', type: 'Entity', list: 'OFAC SDN', programs: ['IRAN', 'SDGT'], added: '2006', notes: 'State bank, Hezbollah links' },
  { name: 'Mahan Air', country: 'Iran', type: 'Entity', list: 'OFAC SDN', programs: ['SDGT'], added: '2011', notes: 'Airline with IRGC ties' },
  { name: 'Ali Khamenei', country: 'Iran', type: 'Individual', list: 'OFAC SDN', programs: ['IRAN-EO13876'], added: '2019', notes: 'Supreme Leader of Iran' },
  // North Korea
  { name: 'Kim Jong-un', country: 'North Korea', type: 'Individual', list: 'OFAC SDN', programs: ['DPRK4'], added: '2017', notes: 'Supreme Leader of DPRK' },
  { name: 'Lazarus Group', country: 'North Korea', type: 'Entity', list: 'OFAC SDN', programs: ['CYBER2'], added: '2019', notes: 'State-sponsored hacking group' },
  { name: 'Korea Mining Development', country: 'North Korea', type: 'Entity', list: 'UN Sanctions', programs: ['DPRK'], added: '2009', notes: 'Arms and WMD-related exports' },
  { name: 'Chosun Expo', country: 'North Korea', type: 'Entity', list: 'OFAC SDN', programs: ['CYBER2'], added: '2019', notes: 'Lazarus Group front company' },
  // Venezuela
  { name: 'Nicolas Maduro', country: 'Venezuela', type: 'Individual', list: 'OFAC SDN', programs: ['VENEZUELA'], added: '2017', notes: 'President of Venezuela' },
  { name: 'PDVSA', country: 'Venezuela', type: 'Entity', list: 'OFAC SDN', programs: ['VENEZUELA'], added: '2019', notes: 'State oil company' },
  { name: 'Diosdado Cabello', country: 'Venezuela', type: 'Individual', list: 'OFAC SDN', programs: ['VENEZUELA'], added: '2020', notes: 'Senior PSUV official' },
  // Belarus
  { name: 'Alexander Lukashenko', country: 'Belarus', type: 'Individual', list: 'OFAC SDN', programs: ['BELARUS'], added: '2021', notes: 'President of Belarus' },
  { name: 'Viktor Lukashenko', country: 'Belarus', type: 'Individual', list: 'OFAC SDN', programs: ['BELARUS'], added: '2021', notes: 'National Security Advisor, son of Alexander' },
  // Syria
  { name: 'Bashar al-Assad', country: 'Syria', type: 'Individual', list: 'OFAC SDN', programs: ['SYRIA'], added: '2011', notes: 'Former President of Syria' },
  // China
  { name: 'Huawei Technologies', country: 'China', type: 'Entity', list: 'BIS Entity List', programs: ['Export Control'], added: '2019', notes: 'Telecom equipment, national security concerns' },
  { name: 'Hikvision', country: 'China', type: 'Entity', list: 'BIS Entity List', programs: ['Export Control'], added: '2019', notes: 'Surveillance cameras, Xinjiang ties' },
  { name: 'DJI', country: 'China', type: 'Entity', list: 'BIS Entity List', programs: ['Export Control'], added: '2022', notes: 'Drone manufacturer' },
  { name: 'CNOOC', country: 'China', type: 'Entity', list: 'OFAC NS-CMIC', programs: ['NS-CMIC'], added: '2021', notes: 'State oil company, military nexus' },
  // Cuba
  { name: 'GAESA', country: 'Cuba', type: 'Entity', list: 'OFAC SDN', programs: ['CUBA'], added: '2018', notes: 'Military-run business conglomerate' },
  // Myanmar
  { name: 'Min Aung Hlaing', country: 'Myanmar', type: 'Individual', list: 'OFAC SDN', programs: ['BURMA'], added: '2021', notes: 'Commander-in-Chief, coup leader' },
  { name: 'Myanmar Economic Corp', country: 'Myanmar', type: 'Entity', list: 'OFAC SDN', programs: ['BURMA'], added: '2021', notes: 'Military conglomerate' },
  // Sudan
  { name: 'Rapid Support Forces', country: 'Sudan', type: 'Entity', list: 'OFAC SDN', programs: ['SUDAN'], added: '2024', notes: 'Paramilitary group, Darfur atrocities' },
  // Cybercrime
  { name: 'Evil Corp', country: 'Russia', type: 'Entity', list: 'OFAC SDN', programs: ['CYBER2'], added: '2019', notes: 'Cybercrime group, Dridex malware' },
  { name: 'Maksim Yakubets', country: 'Russia', type: 'Individual', list: 'OFAC SDN', programs: ['CYBER2'], added: '2019', notes: 'Evil Corp leader' },
  { name: 'Sandworm', country: 'Russia', type: 'Entity', list: 'DOJ Indicted', programs: ['Cyber'], added: '2020', notes: 'GRU Unit 74455, NotPetya, Ukraine grid attacks' },
];

const COUNTRY_FLAGS: Record<string, string> = {
  Russia: '🇷🇺',
  Iran: '🇮🇷',
  'North Korea': '🇰🇵',
  Venezuela: '🇻🇪',
  Belarus: '🇧🇾',
  Syria: '🇸🇾',
  China: '🇨🇳',
  Cuba: '🇨🇺',
  Myanmar: '🇲🇲',
  Sudan: '🇸🇩',
};

const LIST_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  'OFAC SDN':      { color: '#ff3a3a', bg: 'rgba(255,58,58,0.08)',   border: 'rgba(255,58,58,0.35)' },
  'EU Sanctions':  { color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',   border: 'rgba(255,140,0,0.35)' },
  'UN Sanctions':  { color: '#1e9eff', bg: 'rgba(30,158,255,0.08)', border: 'rgba(30,158,255,0.35)' },
  'BIS Entity List': { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.35)' },
  'OFAC NS-CMIC':  { color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', border: 'rgba(255,107,53,0.35)' },
  'DOJ Indicted':  { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.35)' },
};

const OFFICIAL_SOURCES = [
  { label: 'OFAC SDN List Search',        url: 'https://sanctionssearch.ofac.treas.gov/', desc: 'US Treasury' },
  { label: 'BIS Entity List',             url: 'https://www.bis.doc.gov/index.php/policy-guidance/lists-of-parties-of-concern/entity-list', desc: 'Commerce Dept' },
  { label: 'UN Security Council Sanctions', url: 'https://www.un.org/securitycouncil/sanctions/information', desc: 'United Nations' },
  { label: 'EU Sanctions Map',            url: 'https://www.sanctionsmap.eu/', desc: 'European Union' },
  { label: 'UK OFSI Sanctions',           url: 'https://www.gov.uk/government/publications/financial-sanctions-targets', desc: 'UK Govt' },
  { label: 'OpenSanctions Search',        url: 'https://www.opensanctions.org/search/', desc: 'Open-source DB' },
];

type FilterType = 'All' | 'Individuals' | 'Entities' | 'Russia' | 'Iran' | 'North Korea' | 'China';

const FILTERS: FilterType[] = ['All', 'Individuals', 'Entities', 'Russia', 'Iran', 'North Korea', 'China'];

function getListStyle(list: string) {
  return LIST_COLORS[list] || { color: '#7a9bb5', bg: 'rgba(122,155,181,0.08)', border: 'rgba(122,155,181,0.3)' };
}

export default function SanctionsScreener() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SANCTIONED.filter((entry) => {
      // Type/country filter
      if (activeFilter === 'Individuals' && entry.type !== 'Individual') return false;
      if (activeFilter === 'Entities' && entry.type !== 'Entity') return false;
      if (activeFilter === 'Russia' && entry.country !== 'Russia') return false;
      if (activeFilter === 'Iran' && entry.country !== 'Iran') return false;
      if (activeFilter === 'North Korea' && entry.country !== 'North Korea') return false;
      if (activeFilter === 'China' && entry.country !== 'China') return false;

      // Text search
      if (!q) return true;
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.country.toLowerCase().includes(q) ||
        entry.notes.toLowerCase().includes(q) ||
        entry.list.toLowerCase().includes(q) ||
        entry.programs.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [query, activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }

        /* ── Nav ── */
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }

        /* ── Layout ── */
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }

        /* ── Hero ── */
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #ff3a3a; box-shadow: 0 0 8px rgba(255,58,58,0.5); }
        .tool-eyebrow-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #ff3a3a; text-transform: uppercase; }
        .tool-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 4vw, 56px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; line-height: 1; }
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 700px; }

        /* ── Main content ── */
        .content-wrap { max-width: 1100px; margin: 0 auto; padding: 40px 40px 80px; }

        /* ── Search ── */
        .search-section { margin-bottom: 28px; }
        .search-box { display: flex; border: 1px solid rgba(255,58,58,0.3); background: #0a1520; }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 16px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #d8e8f5; letter-spacing: 1px; }
        .search-input::placeholder { color: #5a7a94; }
        .search-clear { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #5a7a94; background: none; border: none; border-left: 1px solid rgba(255,58,58,0.15); padding: 0 20px; cursor: pointer; transition: color 0.2s; white-space: nowrap; }
        .search-clear:hover { color: #ff3a3a; }
        .search-hint { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; margin-top: 10px; }

        /* ── Filters ── */
        .filters-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 7px 16px; border: 1px solid rgba(30,158,255,0.2); background: none; color: #7a9bb5; cursor: pointer; transition: all 0.2s; }
        .filter-btn:hover { border-color: rgba(30,158,255,0.5); color: #1e9eff; }
        .filter-btn.active { background: rgba(255,58,58,0.1); border-color: rgba(255,58,58,0.5); color: #ff3a3a; }

        /* ── Results count ── */
        .results-count { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; margin-bottom: 16px; }
        .results-count span { color: #ff3a3a; }

        /* ── Cards grid ── */
        .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-bottom: 48px; }
        .sanction-card { background: #0a1520; border: 1px solid rgba(255,58,58,0.15); position: relative; overflow: hidden; transition: border-color 0.2s; }
        .sanction-card:hover { border-color: rgba(255,58,58,0.35); }
        .sanction-card::before { content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #ff3a3a; }
        .card-inner { padding: 20px 20px 20px 24px; }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .card-name { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 700; color: #d8e8f5; letter-spacing: 0.5px; line-height: 1.2; }
        .card-type-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; padding: 3px 9px; text-transform: uppercase; border: 1px solid; flex-shrink: 0; margin-top: 2px; }
        .card-type-individual { color: #1e9eff; border-color: rgba(30,158,255,0.4); background: rgba(30,158,255,0.07); }
        .card-type-entity { color: #c084fc; border-color: rgba(192,132,252,0.4); background: rgba(192,132,252,0.07); }
        .card-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
        .card-country { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #9ab0c4; }
        .card-year { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }
        .card-list-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; padding: 2px 8px; text-transform: uppercase; border: 1px solid; }
        .card-notes { font-family: 'Barlow', sans-serif; font-size: 13px; color: #7a9bb5; line-height: 1.6; margin-bottom: 10px; }
        .card-programs { display: flex; flex-wrap: wrap; gap: 5px; }
        .program-tag { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 1px; color: #5a7a94; border: 1px solid rgba(61,88,112,0.3); padding: 2px 7px; text-transform: uppercase; background: rgba(61,88,112,0.05); }

        /* ── No results ── */
        .no-results { grid-column: 1 / -1; padding: 48px; text-align: center; border: 1px solid rgba(30,158,255,0.1); background: #0a1520; }
        .no-results-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #1e9eff; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        .no-results-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }

        /* ── Official sources ── */
        .sources-section { margin-bottom: 40px; }
        .sources-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #5a7a94; text-transform: uppercase; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .sources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .source-btn { display: block; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 18px 20px; text-decoration: none; transition: all 0.2s; }
        .source-btn:hover { background: #0f1e2e; border-color: rgba(30,158,255,0.35); }
        .source-btn-label { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1px; color: #c0cfe0; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .source-btn-label span { color: #5a7a94; font-size: 12px; }
        .source-btn-desc { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #5a7a94; text-transform: uppercase; }

        /* ── Disclaimer ── */
        .disclaimer { background: rgba(255,170,0,0.04); border: 1px solid rgba(255,170,0,0.2); padding: 16px 20px; margin-bottom: 0; }
        .disclaimer-text { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1px; color: #7a6a3a; line-height: 1.7; }
        .disclaimer-text strong { color: #ffaa00; }

        /* ── Footer ── */
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #5a7a94; }
        .footer-copy span { color: #1e9eff; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .cards-grid { grid-template-columns: 1fr; }
          .sources-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero { padding: 40px 20px; }
          .back-bar { padding: 16px 20px; }
          .content-wrap { padding: 24px 20px 60px; }
          .sources-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">

        {/* ── Nav ── */}
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
          <button
            className="hamburger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </nav>

        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/geopolitics" onClick={() => setMenuOpen(false)}>Geopolitics</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        {/* ── Back bar ── */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        {/* ── Hero ── */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">Economic Intelligence</div>
            </div>
            <div className="tool-title">Sanctions Screener</div>
            <p className="tool-desc">
              Before doing business with anyone, compliance teams check global sanctions lists. Search OFAC, EU, UN, and BIS databases simultaneously to find out if a person or company is sanctioned — and why. Used by banks, law firms, and investigators to screen targets for financial crime and state connections.
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="content-wrap">

          {/* Search */}
          <div className="search-section">
            <div className="search-box">
              <input
                className="search-input"
                placeholder="Search by name, country, program — e.g. Putin, Iran, CYBER2..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sanctions list"
              />
              {query && (
                <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="search-hint">Searching {SANCTIONED.length} curated entries across name, country, program, and notes</div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`filter-btn${activeFilter === f ? ' active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="results-count">
            <span>{filtered.length}</span> {filtered.length === 1 ? 'match' : 'matches'}
            {query && ` for "${query}"`}
            {activeFilter !== 'All' && ` — filter: ${activeFilter}`}
          </div>

          {/* Cards */}
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="no-results">
                <div className="no-results-title">No Matches</div>
                <div className="no-results-sub">Try a different name, country, or program — or check official databases below</div>
              </div>
            )}
            {filtered.map((entry, i) => {
              const listStyle = getListStyle(entry.list);
              const flag = COUNTRY_FLAGS[entry.country] || '';
              return (
                <div key={`${entry.name}-${i}`} className="sanction-card">
                  <div className="card-inner">
                    <div className="card-top">
                      <div className="card-name">{entry.name}</div>
                      <div className={`card-type-badge ${entry.type === 'Individual' ? 'card-type-individual' : 'card-type-entity'}`}>
                        {entry.type}
                      </div>
                    </div>

                    <div className="card-meta">
                      <div className="card-country">{flag} {entry.country}</div>
                      <div
                        className="card-list-badge"
                        style={{ color: listStyle.color, background: listStyle.bg, borderColor: listStyle.border }}
                      >
                        {entry.list}
                      </div>
                      <div className="card-year">Added {entry.added}</div>
                    </div>

                    <div className="card-notes">{entry.notes}</div>

                    {entry.programs.length > 0 && (
                      <div className="card-programs">
                        {entry.programs.map((p) => (
                          <div key={p} className="program-tag">{p}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Official sources */}
          <div className="sources-section">
            <div className="sources-label">Official Government Sanctions Databases</div>
            <div className="sources-grid">
              {OFFICIAL_SOURCES.map((src) => (
                <a
                  key={src.label}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-btn"
                >
                  <div className="source-btn-label">
                    {src.label} <span>→</span>
                  </div>
                  <div className="source-btn-desc">{src.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="disclaimer">
            <p className="disclaimer-text">
              <strong>Disclaimer:</strong> This tool contains a curated sample of well-known sanctioned entities for educational OSINT purposes. Always verify against official government databases before making compliance decisions.
            </p>
          </div>

        </div>

        {/* ── Footer ── */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
          </div>
        </footer>

      </div>
    </>
  );
}
