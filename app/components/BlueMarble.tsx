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

    // Scroll progress is applied directly from scroll events — never gated
    // behind rAF, which browsers throttle or stop entirely in background/
    // hidden states. The rAF loop below only smooths the mouse drift.
    const update = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      // progress across the PINNED phase: 0 the moment the section pins
      // (top reaches the 70px header), 1 well before it unpins — the whole
      // rise plays while the frame is held, then holds
      const p = Math.min(1, Math.max(0, (70 - r.top) / Math.max(1, r.height - vh)));
      sec.style.setProperty('--p', p.toFixed(4));
      sec.style.setProperty('--mx', mx.toFixed(2));
    };
    const loop = () => {
      if (!running) return;
      mx += (tmx - mx) * 0.06;
      update();
      raf = requestAnimationFrame(loop);
    };
    const onScroll = () => update();
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 18;
    };
    const start = () => {
      if (running) return;
      running = true;
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      window.addEventListener('pointermove', onPointer, { passive: true });
      update();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
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
        .bm { --p: 1; height: 150vh; border-bottom: 1px solid var(--border); }
        .bm-sticky { position: sticky; top: 70px; height: calc(100vh - 70px); }
        /* media layer — the ONLY thing clipped */
        .bm-media { position: absolute; inset: 0; overflow: hidden; margin: 0; }
        .bm-media img {
          /* the photo's disk starts 5.75% down and its outer rim is
             limb-darkened; offset by ~12.8% of image height so the BRIGHT
             band of the planet forms the horizon at half-frame */
          position: absolute; left: 50%;
          top: calc(50% - max(170vw, 1500px) * 0.128);
          width: max(170vw, 1500px); height: auto;
          transform:
            translateX(calc(-50% + var(--mx, 0) * 1px))
            translateY(calc((1 - var(--p)) * 24vh))
            scale(calc(1.08 - var(--p) * 0.08));
          transform-origin: top center;
          opacity: calc(0.45 + var(--p) * 0.55);
          /* counters the photo's limb darkening — the crest band must read */
          filter: brightness(1.45) saturate(1.08);
          will-change: transform, opacity;
        }
        /* atmosphere: sits ON TOP of the photo, screen-blended so it lights
           the dark crest instead of being occluded by the image's black */
        .bm-glow {
          position: absolute; left: 0; right: 0; bottom: 0; height: 64%;
          mix-blend-mode: screen; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 46% at 50% 104%, rgba(150,195,255,0.34), transparent 48%),
            radial-gradient(ellipse 95% 65% at 50% 110%, rgba(30,158,255,0.20), transparent 70%);
          opacity: calc(0.3 + var(--p) * 0.7);
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
          .bm { height: 135vh; }
          .bm-inner { padding: 64px 16px 0; }
          .bm-media img { width: max(230vw, 780px); top: calc(56% - max(230vw, 780px) * 0.128); }
          .bm-credit { left: 16px; bottom: 16px; }
        }
      `}</style>
      <div className="bm-sticky">
        <figure className="bm-media">
          <img
            src="/earth-blue-marble.jpg"
            alt="The curved horizon of Earth seen from space, blue ocean under swirling white cloud"
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
          <div className="bm-glow" aria-hidden="true" />
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
