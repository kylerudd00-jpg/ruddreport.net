'use client';
import { useEffect } from 'react';

/*
  Scroll-reveal for the .rv/.rv-clip utilities (styles in globals.css, gated
  behind html.rr-js so no-JS users see everything).

  Uses a rAF-throttled scroll sweep rather than IntersectionObserver: IO can
  silently fail to fire (background tabs, some timing paths) and leave content
  stuck invisible — a real bug we hit. A sweep can't get stuck: on mount and on
  every scroll, anything at/above the fold is revealed. Stagger still comes from
  the CSS .rv-d* transition delays. Pass deps for pages whose targets re-render.
*/
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const pending = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.rv:not(.visible), .rv-clip:not(.visible)'));
    const sweep = () => {
      const trigger = window.innerHeight * 0.9;
      pending().forEach(el => { if (el.getBoundingClientRect().top < trigger) el.classList.add('visible'); });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { sweep(); ticking = false; });
    };

    sweep(); // reveal whatever is already in view
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
