'use client';
import { useEffect } from 'react';

/*
  Scroll-reveal observer shared by pages that use the .rv/.rv-clip utilities
  (styles live in globals.css, gated behind html.rr-js so no-JS users see
  everything). Pass deps for pages whose reveal targets re-render (filters).
*/
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rv, .rv-clip')).filter(el => !el.classList.contains('visible'));
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
