'use client';
import { useEffect, useRef } from 'react';

/*
  Scroll scene, nasaforce-style: not a floating object but an environment.
  The NASA Blue Marble is oversized to ~1.7x viewport width and anchored so
  only the planet's curved horizon rises from the bottom of the pinned frame
  as the user scrolls through; the section's left-aligned type sits in the
  dark space above it.

  A11y contract (adjudicated in the scene's pre-review):
  - scroll-scrubbed only (no autonomous motion) => no WCAG 2.2.2 pause control
  - CSS --p: 1 default => no-JS / failed-JS / reduced-motion render a static
    full-opacity limb; the driver never starts under prefers-reduced-motion
    and tears down live on mq change
  - overflow:hidden clips ONLY the absolute media layer; the text block stays
    in normal flow at z1 and is never clipped
  - text occupies the top zone, limb the bottom ~38% => separation by layout;
    the figcaption sits over the photo's black-space corner
*/
export default function BlueMarble() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let running = false;
    let mx = 0, tmx = 0;

    const drive = () => {
      if (!running) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom > -100 && r.top < vh + 100) {
        const p = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, r.height)));
        mx += (tmx - mx) * 0.06;
        sec.style.setProperty('--p', p.toFixed(4));
        sec.style.setProperty('--mx', mx.toFixed(2));
      }
      raf = requestAnimationFrame(drive);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 18;
    };
    const start = () => {
      if (running) return;
      running = true;
      window.addEventListener('pointermove', onPointer, { passive: true });
      raf = requestAnimationFrame(drive);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      sec.style.removeProperty('--p');
      sec.style.removeProperty('--mx');
    };
    const apply = () => { if (mq.matches) stop(); else start(); };
    apply();
    mq.addEventListener('change', apply);
    return () => { mq.removeEventListener('change', apply); stop(); };
  }, []);

  return (
    <section ref={secRef} className="bm" aria-labelledby="bm-h">
      <style>{`
        .bm { --p: 1; height: 165vh; border-bottom: 1px solid var(--border); }
        .bm-sticky { position: sticky; top: 70px; height: calc(100vh - 70px); }
        /* media layer — the ONLY thing clipped */
        .bm-media { position: absolute; inset: 0; overflow: hidden; margin: 0; }
        .bm-glow {
          position: absolute; left: 0; right: 0; bottom: 0; height: 55%;
          background: radial-gradient(ellipse 90% 55% at 50% 105%, rgba(30,158,255,0.14), transparent 65%);
        }
        .bm-media img {
          position: absolute; left: 50%; top: 62%;
          width: max(170vw, 1500px); height: auto;
          transform:
            translateX(calc(-50% + var(--mx, 0) * 1px))
            translateY(calc((1 - var(--p)) * 26vh))
            scale(calc(1.06 - var(--p) * 0.06));
          transform-origin: top center;
          opacity: calc(0.5 + var(--p) * 0.5);
          will-change: transform, opacity;
        }
        .bm-credit {
          position: absolute; left: 40px; bottom: 22px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-muted);
        }
        /* type sits in the dark zone above the limb, on the site grid */
        .bm-inner {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto; padding: 96px 40px 0;
        }
        .bm-inner h2 {
          font-family: var(--font-display); font-size: clamp(32px, 4.5vw, 60px);
          font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em;
          color: #fff; margin-bottom: 14px;
        }
        .bm-inner p { font-size: 16px; line-height: 1.7; color: var(--text-secondary); max-width: 540px; }
        .bm-link {
          display: inline-block; margin-top: 22px; padding: 4px 0;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--accent); text-decoration: none;
        }
        .bm-link:hover { text-decoration: underline; }
        @media (max-width: 768px) {
          .bm { height: 145vh; }
          .bm-inner { padding: 64px 16px 0; }
          .bm-media img { width: max(230vw, 780px); top: 66%; }
          .bm-credit { left: 16px; bottom: 16px; }
        }
      `}</style>
      <div className="bm-sticky">
        <figure className="bm-media">
          <div className="bm-glow" aria-hidden="true" />
          <img
            src="/earth-blue-marble.jpg"
            alt="The curved horizon of Earth seen from space, blue ocean under swirling white cloud"
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="bm-credit">NASA Earth Observatory · MODIS composite</figcaption>
        </figure>
        <div className="bm-inner rv">
          <h2 id="bm-h">Global coverage</h2>
          <p>Reporting and tools that track events anywhere on Earth: satellites, vessels, flights, markets, conflict zones.</p>
          <a className="bm-link" href="/osint?cat=Live">Open live tracking →</a>
        </div>
      </div>
    </section>
  );
}
