'use client';
import { useEffect, useRef } from 'react';

/*
  Scroll scene (the nasaforce-moon treatment): a real NASA full-disk Earth
  that rises, brightens, and scales as the section scrolls through.

  - Motion is purely scroll-scrubbed plus a small lerped mouse drift — never
    autonomous, so WCAG 2.2.2 requires no pause control.
  - CSS default --p: 1 means no-JS, failed-JS, and reduced-motion all render
    the disk static at full size/opacity. The driver never starts under
    prefers-reduced-motion and tears down live if the OS setting changes.
*/
export default function BlueMarble() {
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let running = false;
    let mx = 0, my = 0, tmx = 0, tmy = 0;

    const drive = () => {
      if (!running) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom > -100 && r.top < vh + 100) {
        // 0 when the section top enters the viewport bottom; 1 when its
        // bottom reaches the viewport bottom (recomputed live — resize-safe)
        const p = Math.min(1, Math.max(0, (vh - r.top) / Math.max(1, r.height)));
        mx += (tmx - mx) * 0.06;
        my += (tmy - my) * 0.06;
        sec.style.setProperty('--p', p.toFixed(4));
        sec.style.setProperty('--mx', mx.toFixed(2));
        sec.style.setProperty('--my', my.toFixed(2));
      }
      raf = requestAnimationFrame(drive);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 16;
      tmy = (e.clientY / window.innerHeight - 0.5) * 10;
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
      // fall back to the CSS default (--p: 1) → static, full size/opacity
      sec.style.removeProperty('--p');
      sec.style.removeProperty('--mx');
      sec.style.removeProperty('--my');
    };
    const apply = () => { if (mq.matches) stop(); else start(); };
    apply();
    mq.addEventListener('change', apply);
    return () => { mq.removeEventListener('change', apply); stop(); };
  }, []);

  return (
    <section ref={secRef} className="bm" aria-labelledby="bm-h">
      <style>{`
        .bm { --p: 1; height: 175vh; border-bottom: 1px solid var(--border); }
        .bm-sticky {
          position: sticky; top: 70px; height: calc(100vh - 70px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 32px; padding: 24px 16px;
        }
        .bm-fig { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .bm-fig img {
          width: min(52vh, 540px); max-width: 86vw; height: auto; display: block;
          transform:
            translate(calc(var(--mx, 0) * 1px), calc((1 - var(--p)) * 14vh + var(--my, 0) * 1px))
            scale(calc(0.8 + var(--p) * 0.24));
          opacity: calc(0.45 + var(--p) * 0.55);
          will-change: transform, opacity;
        }
        .bm-credit {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-muted);
        }
        .bm-copy { text-align: center; max-width: 640px; }
        .bm-copy h2 {
          font-family: var(--font-display); font-size: clamp(24px, 3.2vw, 42px);
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.01em;
          color: #fff; margin-bottom: 12px;
        }
        .bm-copy p { font-size: 15.5px; line-height: 1.7; color: var(--text-secondary); }
        @media (max-width: 768px) {
          .bm { height: 150vh; }
          .bm-sticky { gap: 24px; }
          .bm-fig img { width: min(46vh, 78vw); }
        }
      `}</style>
      <div className="bm-sticky">
        <figure className="bm-fig">
          <img
            src="/earth-blue-marble.jpg"
            alt="Full-disk photograph of Earth from space, blue ocean under swirling white cloud"
            width={1200}
            height={1200}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="bm-credit">NASA Earth Observatory · MODIS composite</figcaption>
        </figure>
        <div className="bm-copy rv">
          <h2 id="bm-h">Global coverage</h2>
          <p>Reporting and tools that track events anywhere on Earth: satellites, vessels, flights, markets, conflict zones.</p>
        </div>
      </div>
    </section>
  );
}
