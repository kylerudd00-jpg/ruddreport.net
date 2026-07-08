'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import FlagUS from './FlagUS';

const LINKS = [
  { href: '/articles', label: 'Reports' },
  { href: '/cybersecurity', label: 'Cyber' },
  { href: '/intelligence', label: 'Intelligence' },
  { href: '/geopolitics', label: 'Geopolitics' },
  { href: '/national-security', label: 'Nat-Sec' },
  { href: '/osint', label: 'OSINT Tools' },
  { href: '/brief', label: 'Daily Brief' },
  { href: '/about', label: 'About' },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
      // Trap Tab inside the dialog while it is open
      if (e.key === 'Tab' && menuRef.current) {
        const focusables = menuRef.current.querySelectorAll<HTMLElement>('a[href], button');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      burgerRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        /* ── Kill all per-page navs; only the shared nav renders ── */
        nav:not(#site-nav) { display: none !important; }
        div.mobile-menu:not(#site-mobile-menu) { display: none !important; }

        .skip-link {
          /* above the intro overlay (9999) — focus must never be obscured */
          position: absolute; left: -9999px; top: 0; z-index: 10000;
          background: #1e9eff; color: #000; padding: 12px 20px;
          font-family: var(--font-mono);
          font-size: 13px; font-weight: 600; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none;
        }
        .skip-link:focus { left: 0; }

        /* ── Fixed header: notice strip + nav bar, 70px total ── */
        #site-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          background: rgba(8,8,10,0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
        }
        /* first visit: slide in under the intro curtain */
        html.rr-intro-active #site-header {
          animation: rrNavDown 0.7s var(--ease-expo) 1.55s both;
        }
        @keyframes rrNavDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .sn-notice {
          /* min-height + wrap (not fixed height + clip): the disclaimer must
             stay readable at 200% zoom / narrow viewports (WCAG 1.4.4/1.4.10) */
          min-height: 24px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 2px 40px;
          border-bottom: 1px solid var(--border);
          background: #000;
          font-family: var(--font-mono);
          font-size: 12px; line-height: 1.4; letter-spacing: 0.06em;
          color: #9a9a94; text-transform: uppercase;
        }
        .sn-notice-right { color: #7f7f79; }
        #site-nav {
          /* position/background declared explicitly: legacy page styles set
             element-level nav { position: fixed; background; border } */
          position: static;
          background: transparent;
          border-bottom: none;
          backdrop-filter: none;
          height: 45px; min-height: 45px;
          padding: 0 40px;
          display: flex; align-items: center; justify-content: space-between;
        }
        #site-nav .sn-logo {
          display: flex; align-items: baseline; gap: 10px; text-decoration: none;
        }
        #site-nav .sn-logo-text {
          font-family: var(--font-display);
          font-size: 17px; font-weight: 800; color: #fff;
          letter-spacing: 0.02em; text-transform: uppercase;
        }
        #site-nav .sn-logo-text em {
          color: var(--accent); font-style: normal;
        }
        #site-nav .sn-links {
          display: flex; align-items: center; gap: 24px; list-style: none;
        }
        #site-nav .sn-links a {
          font-family: var(--font-mono);
          font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
          text-transform: uppercase; text-decoration: none;
          color: #a3a39c;
          transition: color 0.2s;
          position: relative; padding: 6px 0;
        }
        #site-nav .sn-links a:hover { color: #fff; }
        #site-nav .sn-links a.sn-active { color: #fff; }
        #site-nav .sn-links a.sn-active::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; background: var(--accent);
        }
        #site-nav .sn-burger {
          display: none; flex-direction: column; gap: 5px; justify-content: center;
          cursor: pointer; padding: 14px 12px; background: none; border: none;
        }
        #site-nav .sn-burger span {
          display: block; width: 22px; height: 2px; background: #ededea;
        }

        #site-mobile-menu {
          display: none; position: fixed; inset: 0; z-index: 300;
          background: rgba(8,8,10,0.98);
          flex-direction: column; align-items: flex-start;
          justify-content: center; gap: 4px; padding: 0 32px;
        }
        #site-mobile-menu.open { display: flex; }
        #site-mobile-menu .smm-close {
          position: absolute; top: 20px; right: 24px;
          font-family: var(--font-mono);
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          background: none; border: 1px solid var(--border-bright);
          padding: 8px 14px; color: #ededea; cursor: pointer;
        }
        #site-mobile-menu a {
          font-family: var(--font-display);
          font-size: 26px; font-weight: 700; letter-spacing: 0.01em;
          color: #ededea; text-decoration: none; text-transform: uppercase;
          padding: 8px 0; display: flex; align-items: baseline; gap: 14px;
          transition: color 0.2s;
        }
        #site-mobile-menu a .smm-idx {
          font-family: var(--font-mono);
          font-size: 12px; color: #8f8f8a; letter-spacing: 0.06em;
        }
        #site-mobile-menu a:hover,
        #site-mobile-menu a.sn-active { color: var(--accent); }
        #site-mobile-menu .smm-notice {
          font-family: var(--font-mono);
          font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
          color: #8f8f8a; margin-top: 32px;
          border-top: 1px solid var(--border); padding-top: 16px;
        }

        @media (max-width: 1180px) {
          /* tighten spacing, never shrink the type */
          #site-nav .sn-links { gap: 15px; }
        }
        @media (max-width: 960px) {
          .sn-notice { padding: 0 16px; }
          .sn-notice-right { display: none; }
          #site-nav { padding: 0 16px; }
          #site-nav .sn-links { display: none; }
          #site-nav .sn-burger { display: flex; }
        }
        @media (max-width: 480px) {
          .sn-notice { font-size: 11px; letter-spacing: 0.03em; }
        }
      `}</style>

      <a href="#main" className="skip-link">Skip to content</a>
      <header id="site-header">
        <div className="sn-notice">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <FlagUS width={19} />
            Independent publication — not a U.S. government website
          </span>
          <span className="sn-notice-right">Open-source intelligence &amp; analysis · Est. 2026</span>
        </div>
        <nav id="site-nav" aria-label="Main">
          <a href="/" className="sn-logo">
            <span className="sn-logo-text">Rudd <em>Report</em></span>
          </a>
          <ul className="sn-links">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className={isActive(href, pathname) ? 'sn-active' : ''}
                  aria-current={isActive(href, pathname) ? 'page' : undefined}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <button
            ref={burgerRef}
            className="sn-burger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="site-mobile-menu"
          >
            <span /><span /><span />
          </button>
        </nav>
      </header>

      <div ref={menuRef} id="site-mobile-menu" className={mobileOpen ? 'open' : ''} role="dialog" aria-modal="true" aria-label="Site menu">
        <button ref={closeRef} className="smm-close" onClick={() => setMobileOpen(false)}><span aria-hidden="true">✕</span> Close</button>
        <a href="/" onClick={() => setMobileOpen(false)}>
          <span className="smm-idx" aria-hidden="true">00</span> Home
        </a>
        {LINKS.map(({ href, label }, i) => (
          <a
            key={href}
            href={href}
            className={isActive(href, pathname) ? 'sn-active' : ''}
            aria-current={isActive(href, pathname) ? 'page' : undefined}
            onClick={() => setMobileOpen(false)}
          >
            <span className="smm-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> {label}
          </a>
        ))}
        <p className="smm-notice">Independent publication — not a U.S. government website</p>
      </div>
    </>
  );
}
