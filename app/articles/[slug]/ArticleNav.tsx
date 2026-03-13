'use client';

export default function ArticleNav() {
  return (
    <>
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-text">The Rudd Report</div>
        </a>
        <ul className="nav-links">
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#00ff88' }}>OSINT Hub</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div
          className="hamburger"
          onClick={() => document.getElementById('articleMenu')?.classList.toggle('open')}
        >
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="articleMenu">
        <button
          className="mobile-menu-close"
          onClick={() => document.getElementById('articleMenu')?.classList.remove('open')}
        >
          ✕ Close
        </button>
        <a href="/">Home</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/about">About</a>
      </div>
    </>
  );
}
