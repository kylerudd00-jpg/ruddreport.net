'use client';
import { useState, useCallback } from 'react';

interface GdeltArticle {
  title?: string;
  seendate?: string;
  domain?: string;
  url?: string;
  sourcecountry?: string;
}

export default function SocialFootprint() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState<{ fullName: string; username: string; email: string } | null>(null);
  const [newsResults, setNewsResults] = useState<GdeltArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');

  const enc = (s: string) => encodeURIComponent(s);

  const fetchNews = useCallback(async (name: string) => {
    setNewsLoading(true);
    setNewsError('');
    setNewsResults([]);
    try {
      const res = await fetch(`/api/osint/gdelt?q=${enc(name)}&maxrecords=10&timespan=30d`);
      const data = await res.json();
      setNewsResults(data.articles || []);
      if (data.error) setNewsError(data.error);
    } catch {
      setNewsError('Could not reach news API.');
    }
    setNewsLoading(false);
  }, []);

  const handleSubmit = () => {
    if (!fullName.trim()) return;
    const s = { fullName: fullName.trim(), username: username.trim(), email: email.trim() };
    setSubmitted(s);
    fetchNews(s.fullName);
  };

  const name = submitted?.fullName || '';
  const nameParts = name.split(' ');
  const fn = nameParts[0] || '';
  const ln = nameParts.slice(1).join(' ') || nameParts[0] || '';
  const uname = submitted?.username || '';

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return d; }
  };

  const dorks = [
    { label: 'LinkedIn Profile', query: () => `"${name}" site:linkedin.com` },
    { label: 'Facebook Profile', query: () => `"${name}" site:facebook.com` },
    { label: 'Profile Pages', query: () => `"${name}" inurl:profile OR inurl:user OR inurl:about` },
    { label: 'Resume / CV', query: () => `"${name}" "resume" OR "CV" OR "curriculum vitae" filetype:pdf` },
    { label: 'Email / Contact', query: () => `"${name}" "email" OR "contact" OR "@"` },
    { label: 'Forum Mentions', query: () => `"${name}" site:reddit.com OR site:quora.com OR site:forums.` },
    { label: 'IntelligenceX', query: () => name, isIntelX: true },
  ];

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
        .tool-desc { font-size: 15px; font-weight: 400; color: #9ab0c4; line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .form-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .form-input { background: #0a1520; border: 1px solid rgba(30,158,255,0.25); outline: none; padding: 12px 16px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #d8e8f5; letter-spacing: 1px; transition: border-color 0.2s; }
        .form-input:focus { border-color: rgba(30,158,255,0.6); }
        .form-input::placeholder { color: #2d4055; }
        .run-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #fff; background: #1e9eff; border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .section-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid rgba(30,158,255,0.1); }
        .section-wrap { margin-bottom: 48px; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .services-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .services-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }
        .service-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); border-left: 3px solid #1e9eff; padding: 22px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.3s; }
        .service-card:hover { border-color: rgba(30,158,255,0.35); border-left-color: #1e9eff; }
        .service-card.green-card { border-left-color: #00ff88; }
        .service-card.purple-card { border-left-color: #9966ff; }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .service-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .service-badge { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 2px; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-platform { font-family: 'IBM Plex Mono', monospace; font-size: 18px; margin-bottom: 2px; }
        .service-desc { font-family: 'Barlow', sans-serif; font-size: 11px; color: #7a9bb5; line-height: 1.6; flex: 1; }
        .service-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #1e9eff; border: 1px solid rgba(30,158,255,0.3); background: none; padding: 8px 16px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; }
        .service-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: rgba(30,158,255,0.05); border: 1px solid rgba(30,158,255,0.2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #3d5870; text-transform: uppercase; }
        .target-value { font-family: 'IBM Plex Mono', monospace; font-size: 14px; color: #1e9eff; letter-spacing: 2px; }
        .news-list { display: flex; flex-direction: column; gap: 2px; }
        .news-item { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .news-item:hover { border-color: rgba(30,158,255,0.25); }
        .news-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 600; color: #c0cfe0; line-height: 1.4; }
        .news-title a { color: #c0cfe0; text-decoration: none; transition: color 0.2s; }
        .news-title a:hover { color: #1e9eff; }
        .news-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .news-meta-item { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; }
        .news-meta-item span { color: #7a9bb5; }
        .news-status { padding: 32px; text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 2px; color: #3d5870; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); }
        .dork-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .dork-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); border-left: 3px solid #9966ff; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.3s; }
        .dork-card:hover { border-color: rgba(153,102,255,0.3); }
        .dork-label { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; color: #c0cfe0; letter-spacing: 0.5px; }
        .dork-query { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #7a9bb5; letter-spacing: 0.5px; line-height: 1.5; word-break: break-all; }
        .dork-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #9966ff; border: 1px solid rgba(153,102,255,0.3); background: none; padding: 7px 16px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .dork-btn:hover { background: rgba(153,102,255,0.08); border-color: #9966ff; }
        .dork-btn.disabled { color: #3d5870; border-color: rgba(30,158,255,0.1); cursor: not-allowed; pointer-events: none; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        @media (max-width: 1100px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .services-grid-5 { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .services-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .dork-grid { grid-template-columns: repeat(2, 1fr); }
          .form-row-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .back-bar { padding: 16px 20px; }
          .tool-hero { padding: 40px 20px; }
          .main-wrap { padding: 24px 20px; }
          .services-grid { grid-template-columns: 1fr; }
          .services-grid-3 { grid-template-columns: 1fr; }
          .services-grid-5 { grid-template-columns: 1fr; }
          .dork-grid { grid-template-columns: 1fr; }
          .form-row { flex-direction: column; }
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
            <li><a href="/osint" style={{color:'#1e9eff'}}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </div>
        </nav>

        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          <button className="mobile-menu-close" onClick={() => setMenuOpen(false)}>✕ Close</button>
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/osint" onClick={() => setMenuOpen(false)}>OSINT Hub</a>
          <a href="/cybersecurity" onClick={() => setMenuOpen(false)}>Cybersecurity</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
        </div>

        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">Social Intelligence</div>
            </div>
            <div className="tool-title">Digital Footprint &amp; Social OSINT</div>
            <p className="tool-desc">Map a person's online presence across social media platforms, professional networks, academic databases, and news archives. Includes pre-built Google dorks and live news coverage from the GDELT Project.</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Input */}
          <div className="form-row-3" style={{marginBottom: '12px'}}>
            <div className="form-field">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="John Smith" value={fullName} onChange={e => setFullName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">Username (optional)</label>
              <input className="form-input" placeholder="jsmith92" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label">Email (optional)</label>
              <input className="form-input" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>
          <button className="run-btn" onClick={handleSubmit} disabled={!fullName.trim()} style={{marginBottom: '32px'}}>
            Map Digital Footprint →
          </button>

          {submitted && (
            <div className="target-display" style={{marginBottom: '32px'}}>
              <div>
                <div className="target-label">Subject</div>
                <div className="target-value">{name}{uname ? ` — @${uname}` : ''}</div>
              </div>
            </div>
          )}

          {/* Section 1: Social Media */}
          <div className="section-wrap">
            <div className="section-label">Social Media Profiles</div>
            <div className="services-grid">
              {[
                { icon: 'in', name: 'LinkedIn', badge: 'Professional', badgeColor: '#1e9eff', desc: 'Professional network profile search. Most reliable for full-name identification across industries.', url: () => `https://www.linkedin.com/search/results/people/?keywords=${enc(name)}` },
                { icon: 'fb', name: 'Facebook', badge: 'Personal', badgeColor: '#1e9eff', desc: 'People search on the largest social network. Search by full name to find personal profiles and connections.', url: () => `https://www.facebook.com/search/people?q=${enc(name)}` },
                { icon: 'X', name: 'Twitter / X', badge: 'Real-Time', badgeColor: '#1e9eff', desc: 'Search Twitter/X for user accounts matching the full name. Filter by user to find account profiles.', url: () => `https://twitter.com/search?q=${enc(name)}&f=user` },
                { icon: 'ig', name: 'Instagram', badge: 'Visual', badgeColor: '#cc44aa', desc: 'Instagram username and tag search. Best when combined with known username for direct profile lookup.', url: () => `https://www.instagram.com/explore/tags/${enc((fn + ln).replace(/ /g,'').toLowerCase())}/` },
                { icon: 'tt', name: 'TikTok', badge: 'Video', badgeColor: '#1e9eff', desc: 'Search TikTok for user accounts matching the name. Useful for younger subjects with active social presence.', url: () => `https://www.tiktok.com/search/user?q=${enc(name)}` },
                { icon: 'rd', name: 'Reddit', badge: 'Forums', badgeColor: '#ff6633', desc: 'Search Reddit for user accounts matching the name. Reveals forum activity, opinions, and posting history.', url: () => `https://www.reddit.com/search/?q=${enc(name)}&type=user` },
                { icon: 'yt', name: 'YouTube', badge: 'Video / Channel', badgeColor: '#ff3333', desc: 'Search YouTube for channels matching the name. Filter shows channel results only, not videos.', url: () => `https://www.youtube.com/results?search_query=${enc(name)}&sp=EgIQAg%3D%3D` },
                { icon: 'pi', name: 'Pinterest', badge: 'Visual', badgeColor: '#cc2244', desc: 'Search Pinterest for people profiles matching the name. Reveals interests, boards, and personal tastes.', url: () => `https://www.pinterest.com/search/people/?q=${enc(name)}` },
              ].map((svc) => (
                <div key={svc.name} className="service-card">
                  <div className="service-top">
                    <div>
                      <div className="service-platform">{svc.icon}</div>
                      <div className="service-name">{svc.name}</div>
                    </div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Professional & Academic */}
          <div className="section-wrap">
            <div className="section-label">Professional &amp; Academic</div>
            <div className="services-grid-5">
              {[
                { name: 'LinkedIn', badge: 'Professional Network', badgeColor: '#1e9eff', desc: 'Full professional profile search including work history, education, and endorsements.', url: () => `https://www.linkedin.com/search/results/people/?keywords=${enc(name)}` },
                { name: 'Google Scholar', badge: 'Academic Papers', badgeColor: '#00ff88', desc: 'Academic publication search. Find papers, citations, and research authored by or mentioning the subject.', url: () => `https://scholar.google.com/scholar?q=${enc(name)}` },
                { name: 'ResearchGate', badge: 'Science Network', badgeColor: '#00ff88', desc: 'Researcher profile network. Find academic profiles with publication lists and institutional affiliations.', url: () => `https://www.researchgate.net/search?q=${enc(name)}` },
                { name: 'ORCID', badge: 'Researcher ID', badgeColor: '#7a9bb5', desc: 'Open researcher identifier registry. Find persistent digital identifiers for academic and research professionals.', url: () => `https://orcid.org/orcid-search/search?searchQuery=${enc(name)}` },
                { name: 'GitHub', badge: 'Developer', badgeColor: '#7a9bb5', desc: 'Search GitHub for developer accounts matching the name. Reveals code repositories, projects, and contributions.', url: () => `https://github.com/search?q=${enc(name)}&type=users` },
              ].map((svc) => (
                <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: News & Media Mentions */}
          <div className="section-wrap">
            <div className="section-label">News &amp; Media Mentions — GDELT (Last 30 Days)</div>
            {!submitted && (
              <div className="news-status">Enter a name above to search news archives</div>
            )}
            {newsLoading && (
              <div className="news-status">Searching news archives...</div>
            )}
            {newsError && !newsLoading && (
              <div className="news-status" style={{color:'#ff6060'}}>{newsError}</div>
            )}
            {submitted && !newsLoading && !newsError && newsResults.length === 0 && (
              <div className="news-status">
                No recent news coverage found for this name — try adding an organization or title.
              </div>
            )}
            {newsResults.length > 0 && (
              <div className="news-list">
                {newsResults.map((article, i) => (
                  <div key={i} className="news-item">
                    <div className="news-title">
                      {article.url ? (
                        <a href={article.url} target="_blank" rel="noopener noreferrer">{article.title || 'Untitled Article'}</a>
                      ) : (article.title || 'Untitled Article')}
                    </div>
                    <div className="news-meta">
                      {article.domain && <div className="news-meta-item">Source: <span>{article.domain}</span></div>}
                      {article.seendate && <div className="news-meta-item">Date: <span>{formatDate(article.seendate)}</span></div>}
                      {article.sourcecountry && <div className="news-meta-item">Country: <span>{article.sourcecountry}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Google Dorks */}
          <div className="section-wrap">
            <div className="section-label">Advanced Google Dorks</div>
            <div className="dork-grid">
              {dorks.map((d) => {
                const googleUrl = submitted
                  ? (d.isIntelX
                    ? `https://intelx.io/?s=${enc(name)}`
                    : `https://www.google.com/search?q=${enc(d.query())}`)
                  : '';
                return (
                  <div key={d.label} className="dork-card">
                    <div className="dork-label">{d.label}</div>
                    {submitted && (
                      <div className="dork-query">{d.isIntelX ? `intelx.io → ${name}` : d.query()}</div>
                    )}
                    {submitted ? (
                      <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="dork-btn">
                        {d.isIntelX ? 'Search IntelX →' : 'Run Dork →'}
                      </a>
                    ) : (
                      <span className="dork-btn disabled">Run Dork →</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Username Tools */}
          {uname && submitted && (
            <div className="section-wrap">
              <div className="section-label">Username Search — @{uname}</div>
              <div className="services-grid-3">
                {[
                  { name: 'WhatsMyName', badge: 'Multi-Platform', badgeColor: '#00ff88', desc: 'Search hundreds of platforms for the given username simultaneously. One of the most comprehensive username enumeration tools.', url: `https://whatsmyname.app/?q=${enc(uname)}` },
                  { name: 'Sherlock (GitHub)', badge: 'Open Source', badgeColor: '#7a9bb5', desc: 'Open-source username hunt across 300+ social networks. Run locally for best results. Link leads to the GitHub repo.', url: `https://github.com/sherlock-project/sherlock` },
                  { name: 'Namechk', badge: 'Account Checker', badgeColor: '#1e9eff', desc: 'Check username availability and registration status across dozens of social media and domain registrars.', url: `https://namechk.com/${enc(uname)}` },
                ].map((svc) => (
                  <div key={svc.name} className={`service-card${svc.badgeColor === '#00ff88' ? ' green-card' : ''}`}>
                    <div className="service-top">
                      <div className="service-name">{svc.name}</div>
                      <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                    </div>
                    <div className="service-desc">{svc.desc}</div>
                    <a href={svc.url} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5 (always shown): Aggregator Tools */}
          <div className="section-wrap">
            <div className="section-label">People Aggregators</div>
            <div className="services-grid-3">
              {[
                { name: 'PeekYou', badge: 'Web + Social', badgeColor: '#1e9eff', desc: 'Aggregates social media profiles, web mentions, and public records into a unified people profile.', url: () => submitted ? `https://www.peekyou.com/${enc(fn)}_${enc(ln)}` : '' },
                { name: 'Pipl', badge: 'Deep Web', badgeColor: '#1e9eff', desc: 'Deep web people search that indexes social profiles, professional directories, and public records not found in standard search engines.', url: () => submitted ? `https://pipl.com/search/?q=${enc(name)}` : '' },
                { name: 'Spokeo', badge: 'Aggregator', badgeColor: '#1e9eff', desc: 'Comprehensive people aggregator with social media profiles, public records, phone numbers, and address history.', url: () => submitted ? `https://www.spokeo.com/${enc(fn)}-${enc(ln)}` : '' },
              ].map((svc) => (
                <div key={svc.name} className="service-card">
                  <div className="service-top">
                    <div className="service-name">{svc.name}</div>
                    <div className="service-badge" style={{color: svc.badgeColor, borderColor: svc.badgeColor + '55'}}>{svc.badge}</div>
                  </div>
                  <div className="service-desc">{svc.desc}</div>
                  {submitted ? (
                    <a href={svc.url()} target="_blank" rel="noopener noreferrer" className="service-btn">Search →</a>
                  ) : (
                    <span className="service-btn disabled">Search →</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
          </div>
        </footer>
      </div>
    </>
  );
}
