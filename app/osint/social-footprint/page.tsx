'use client';
import { useState, useCallback, useEffect } from 'react';

interface GdeltArticle {
  title?: string;
  seendate?: string;
  domain?: string;
  url?: string;
  sourcecountry?: string;
}

export default function SocialFootprint() {
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

  const handleSubmit = (override?: string) => {
    const name = (override ?? fullName).trim();
    if (!name) return;
    const s = { fullName: name, username: username.trim(), email: email.trim() };
    setSubmitted(s);
    fetchNews(s.fullName);
  };

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setFullName(q); handleSubmit(q); }
  }, []);

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
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }
        .main-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }
        .form-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
        .form-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .form-input { background: var(--bg-card); border: 1px solid var(--border-bright); padding: 12px 16px; font-family: var(--font-mono); font-size: 12px; color: var(--text-primary); letter-spacing: 0.02em; transition: border-color 0.2s; }
        .form-input:focus { border-color: var(--accent); }
        .form-input::placeholder { color: var(--text-muted); }
        .run-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; color: #fff; background: var(--accent); border: none; padding: 14px 36px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; }
        .run-btn:hover { background: #4db8ff; }
        .run-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .section-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
        .section-wrap { margin-bottom: 48px; }
        .services-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
        .services-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .services-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2px; }
        .service-card { background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--accent); padding: 22px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.3s; }
        .service-card:hover { border-color: var(--border-bright); border-left-color: var(--accent); }
        .service-card.green-card { border-left-color: #22cc66; }
        .service-card.purple-card { border-left-color: #b464ff; }
        .service-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .service-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
        .service-badge { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 8px; border: 1px solid; flex-shrink: 0; }
        .service-platform { font-family: var(--font-mono); font-size: 18px; margin-bottom: 2px; }
        .service-desc { font-family: var(--font-display); font-size: 12px; color: var(--text-secondary); line-height: 1.6; flex: 1; }
        .service-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--accent); border: 1px solid var(--border-bright); background: none; padding: 8px 16px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .service-btn:hover { background: var(--bg-card-hover); border-color: var(--accent); }
        .service-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        .target-display { margin-bottom: 32px; padding: 16px 20px; background: var(--bg-card); border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }
        .target-value { font-family: var(--font-mono); font-size: 14px; color: var(--accent); letter-spacing: 0.05em; }
        .news-list { display: flex; flex-direction: column; gap: 2px; }
        .news-item { background: var(--bg-card); border: 1px solid var(--border); padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; transition: border-color 0.2s; }
        .news-item:hover { border-color: var(--border-bright); }
        .news-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-primary); line-height: 1.4; }
        .news-title a { color: var(--text-primary); text-decoration: none; transition: color 0.2s; }
        .news-title a:hover { color: var(--accent); }
        .news-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .news-meta-item { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); text-transform: uppercase; }
        .news-meta-item span { color: var(--text-secondary); }
        .news-status { padding: 32px; text-align: center; font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); background: var(--bg-card); border: 1px solid var(--border); }
        .dork-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .dork-card { background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid #b464ff; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color 0.3s; }
        .dork-card:hover { border-color: rgba(180,100,255,0.4); }
        .dork-label { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.5px; }
        .dork-query { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); letter-spacing: 0.02em; line-height: 1.5; word-break: break-all; }
        .dork-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #b464ff; border: 1px solid rgba(180,100,255,0.4); background: none; padding: 7px 16px; cursor: pointer; transition: all 0.3s; text-decoration: none; display: inline-block; align-self: flex-start; margin-top: 4px; }
        .dork-btn:hover { background: rgba(180,100,255,0.12); border-color: #b464ff; }
        .dork-btn.disabled { color: var(--text-muted); border-color: var(--border); cursor: not-allowed; pointer-events: none; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 40px; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
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

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Social Intelligence</div>
            </div>
            <h1 className="tool-title">Digital Footprint &amp; Social OSINT</h1>
            <p className="tool-desc">Map a person's online presence across social media platforms, professional networks, academic databases, and news archives. Includes pre-built Google dorks and live news coverage from the GDELT Project.</p>
          </div>
        </div>

        <div className="main-wrap">
          {/* Input */}
          <div className="form-row-3" style={{marginBottom: '12px'}}>
            <div className="form-field">
              <label className="form-label" htmlFor="sf-fullname">Full Name *</label>
              <input id="sf-fullname" className="form-input" placeholder="John Smith" value={fullName} onChange={e => setFullName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="sf-username">Username (optional)</label>
              <input id="sf-username" className="form-input" placeholder="jsmith92" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="sf-email">Email (optional)</label>
              <input id="sf-email" className="form-input" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>
          <button type="button" className="run-btn" onClick={() => handleSubmit()} disabled={!fullName.trim()} style={{marginBottom: '32px'}}>
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
          <div className="section-wrap" aria-live="polite">
            <div className="section-label">News &amp; Media Mentions — GDELT (Last 30 Days)</div>
            {!submitted && (
              <div className="news-status">Enter a name above to search news archives</div>
            )}
            {newsLoading && (
              <div className="news-status">Searching news archives...</div>
            )}
            {newsError && !newsLoading && (
              <div className="news-status" role="alert" style={{color:'var(--red)'}}>{newsError}</div>
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
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
