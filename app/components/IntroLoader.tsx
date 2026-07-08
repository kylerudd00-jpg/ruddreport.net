'use client';
import { useEffect, useState } from 'react';

/*
  Fullscreen intro (ndstudio/nasaforce-style). A11y contract:
  - aria-hidden, zero focusable children, pointer-events none — never blocks
    keyboard or screen readers; page is interactive underneath from frame one.
  - < 5s total (WCAG 2.2.2 exempt), plays once per browser session.
  - Skipped entirely under prefers-reduced-motion.
  - Removal is failure-proof: transitionend + hard setTimeout fallback.
*/
export default function IntroLoader() {
  const [phase, setPhase] = useState<'idle' | 'play' | 'exit' | 'done'>('idle');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = sessionStorage.getItem('rr-intro') === '1'; } catch {}
    if (reduced || seen) return;
    try { sessionStorage.setItem('rr-intro', '1'); } catch {}
    // lets the page shift its own entrance choreography to after the curtain
    document.documentElement.classList.add('rr-intro-active');
    setPhase('play');
    const exitT = setTimeout(() => setPhase('exit'), 1500);
    const doneT = setTimeout(() => setPhase('done'), 2600); // hard fallback
    return () => { clearTimeout(exitT); clearTimeout(doneT); };
  }, []);

  // drop the choreography class once finished (covers both the transitionend
  // and fallback paths) — it must not leak into later client-side navigations
  useEffect(() => {
    if (phase === 'done') document.documentElement.classList.remove('rr-intro-active');
  }, [phase]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <>
      <style>{`
        .rr-intro {
          position: fixed; inset: 0; z-index: 9999;
          background: #050506;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          pointer-events: none;
          clip-path: inset(0 0 0 0);
          transition: clip-path 0.85s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rr-intro--exit { clip-path: inset(0 0 100% 0); }
        .rr-intro-mark { display: flex; align-items: center; gap: 14px; overflow: hidden; }
        .rr-intro-sq {
          width: 14px; height: 14px; background: #1e9eff; flex-shrink: 0;
          transform: translateY(220%);
          animation: rrIntroUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }
        .rr-intro-word {
          font-family: var(--font-display); font-size: clamp(28px, 5vw, 44px);
          font-weight: 800; letter-spacing: 0.02em; text-transform: uppercase;
          color: #fff; line-height: 1;
          transform: translateY(120%);
          animation: rrIntroUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.18s both;
        }
        .rr-intro-word em { font-style: normal; color: #1e9eff; }
        .rr-intro-bar {
          width: min(220px, 40vw); height: 2px; margin-top: 26px;
          background: rgba(255,255,255,0.14); overflow: hidden;
        }
        .rr-intro-bar span {
          display: block; height: 100%; background: #1e9eff;
          transform-origin: left; transform: scaleX(0);
          animation: rrIntroFill 1.15s cubic-bezier(0.4, 0, 0.2, 1) 0.25s forwards;
        }
        .rr-intro-foot {
          position: absolute; left: 40px; right: 40px; bottom: 28px;
          display: flex; justify-content: space-between; gap: 16px;
          font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.06em; text-transform: uppercase; color: #8f8f8a;
          animation: rrIntroFade 0.5s ease 0.35s both;
        }
        @keyframes rrIntroUp { to { transform: translateY(0); } }
        @keyframes rrIntroFill { to { transform: scaleX(1); } }
        @keyframes rrIntroFade { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 480px) { .rr-intro-foot { left: 16px; right: 16px; } }
        @media (prefers-reduced-motion: reduce) { .rr-intro { display: none !important; } }
      `}</style>
      <div
        className={`rr-intro${phase === 'exit' ? ' rr-intro--exit' : ''}`}
        aria-hidden="true"
        onTransitionEnd={e => { if (e.propertyName === 'clip-path') setPhase('done'); }}
      >
        <div className="rr-intro-mark">
          <span className="rr-intro-sq" />
          <span className="rr-intro-word">Rudd <em>Report</em></span>
        </div>
        <div className="rr-intro-bar"><span /></div>
        <div className="rr-intro-foot">
          <span>Open-source intelligence &amp; analysis</span>
          <span>Est. 2026</span>
        </div>
      </div>
    </>
  );
}
