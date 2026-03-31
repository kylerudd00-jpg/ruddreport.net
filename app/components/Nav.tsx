'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/articles', label: 'All Reports' },
  { href: '/cybersecurity', label: 'Cybersecurity' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/geopolitics', label: 'Geopolitics' },
  { href: '/national-security', label: 'National Security' },
  { href: '/osint', label: 'OSINT Hub' },
  { href: '/brief', label: 'Aladdin Brief' },
  { href: '/about', label: 'About' },
];

// Color per active section
const SECTION_COLORS: { prefix: string; color: string }[] = [
  { prefix: '/brief', color: '#ffaa00' },
  { prefix: '/osint', color: '#1e9eff' },
  { prefix: '/tools', color: '#1e9eff' },
  { prefix: '/cybersecurity', color: '#ff4444' },
  { prefix: '/intelligence', color: '#b464ff' },
  { prefix: '/geopolitics', color: '#ffaa00' },
  { prefix: '/national-security', color: '#22cc66' },
  { prefix: '/economic-security', color: '#00c9b0' },
  { prefix: '/articles', color: '#1e9eff' },
  { prefix: '/about', color: '#1e9eff' },
  { prefix: '/contact', color: '#1e9eff' },
];

function useActiveColor(): string {
  const pathname = usePathname();
  for (const { prefix, color } of SECTION_COLORS) {
    if (pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?')) {
      return color;
    }
  }
  return '#1e9eff';
}

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Nav() {
  const pathname = usePathname();
  const activeColor = useActiveColor();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Barlow+Condensed:wght@400;600;700&display=swap');

        /* ── Kill all per-page navs; only the shared nav renders ── */
        nav:not(#site-nav) { display: none !important; }
        div.mobile-menu:not(#site-mobile-menu) { display: none !important; }

        /* ── Site nav ── */
        #site-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          padding: 0 40px; height: 70px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(3,6,8,0.93);
          backdrop-filter: blur(20px);
          border-bottom: 3px solid ${activeColor};
          transition: border-color 0.4s ease;
        }
        #site-nav .sn-logo {
          display: flex; align-items: center; gap: 12px; text-decoration: none;
        }
        #site-nav .sn-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 0.3px;
        }
        #site-nav .sn-logo-text em {
          color: ${activeColor}; font-style: normal;
          transition: color 0.4s ease;
        }
        #site-nav .sn-links {
          display: flex; align-items: center; gap: 28px; list-style: none;
        }
        #site-nav .sn-links a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; text-decoration: none;
          color: #8aa0b8;
          transition: color 0.2s;
          position: relative; padding-bottom: 2px;
        }
        #site-nav .sn-links a:hover { color: #c0cfe0; }
        #site-nav .sn-links a.sn-active {
          color: ${activeColor};
          transition: color 0.4s ease;
        }
        #site-nav .sn-links a.sn-active::after {
          content: '';
          position: absolute; bottom: -4px; left: 0; right: 0;
          height: 2px; background: ${activeColor};
          transition: background 0.4s ease;
        }
        #site-nav .sn-burger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px; background: none; border: none;
        }
        #site-nav .sn-burger span {
          display: block; width: 24px; height: 2px;
          background: ${activeColor}; transition: background 0.4s ease;
        }

        #site-mobile-menu {
          display: none; position: fixed; inset: 0; z-index: 300;
          background: rgba(3,6,8,0.97);
          flex-direction: column; align-items: center; justify-content: center; gap: 36px;
        }
        #site-mobile-menu.open { display: flex; }
        #site-mobile-menu .smm-close {
          position: absolute; top: 24px; right: 24px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
          background: none; border: none; color: #7a9bb5; cursor: pointer;
        }
        #site-mobile-menu a {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 26px; font-weight: 700; letter-spacing: 4px;
          color: #c0cfe0; text-decoration: none; text-transform: uppercase;
          transition: color 0.2s;
        }
        #site-mobile-menu a:hover,
        #site-mobile-menu a.sn-active { color: ${activeColor}; }
        #site-mobile-menu .smm-accent-bar {
          width: 40px; height: 2px;
          background: ${activeColor}; transition: background 0.4s;
        }

        @media (max-width: 1100px) {
          #site-nav .sn-links { gap: 20px; }
          #site-nav .sn-links a { font-size: 12px; }
        }
        @media (max-width: 900px) {
          #site-nav { padding: 0 20px; }
          #site-nav .sn-links { display: none; }
          #site-nav .sn-burger { display: flex; }
        }
      `}</style>

      <nav id="site-nav">
        <a href="/" className="sn-logo">
          <span className="sn-logo-text">The Rudd <em>Report</em></span>
        </a>
        <ul className="sn-links">
          {LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className={isActive(href, pathname) ? 'sn-active' : ''}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <button className="sn-burger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      <div id="site-mobile-menu" className={mobileOpen ? 'open' : ''}>
        <button className="smm-close" onClick={() => setMobileOpen(false)}>✕ Close</button>
        <div className="smm-accent-bar" />
        <a href="/" onClick={() => setMobileOpen(false)}>Home</a>
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={isActive(href, pathname) ? 'sn-active' : ''}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
