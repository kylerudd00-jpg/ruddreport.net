'use client';
import { useEffect, useState } from 'react';

export default function ArticleNav() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav>
        <a href="/" className="nav-logo">
          <div className="nav-logo-text">The Rudd Report</div>
        </a>
        <ul className="nav-links">
          <li><a href="/articles">All Reports</a></li>
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div
          className="hamburger"
          onClick={() => document.getElementById('articleMenu')?.classList.toggle('open')}
        >
          <span /><span /><span />
        </div>
      </nav>

      {/* Reading progress bar */}
      <div style={{
        position: 'fixed',
        top: 70,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 99,
        background: 'rgba(30,158,255,0.08)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#1e9eff',
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div className="mobile-menu" id="articleMenu">
        <button
          className="mobile-menu-close"
          onClick={() => document.getElementById('articleMenu')?.classList.remove('open')}
        >
          ✕ Close
        </button>
        <a href="/">Home</a>
        <a href="/articles">All Reports</a>
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
