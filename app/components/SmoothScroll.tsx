'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

/*
  Inertial scrolling (the nasaforce/ndstudio "smoothness"). Only runs when
  prefers-reduced-motion is off — the CSS reduced-motion block cannot gate JS
  smoothing, so this matchMedia gate is the contract. Keyboard scrolling and
  native focus-scroll stay native; Lenis only intercepts wheel/touch.
*/
export default function SmoothScroll() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis: Lenis | null = null;
    let raf = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      const loop = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; };
    const apply = () => { if (mq.matches) stop(); else start(); };

    apply();
    mq.addEventListener('change', apply);
    return () => { mq.removeEventListener('change', apply); stop(); };
  }, []);

  return null;
}
