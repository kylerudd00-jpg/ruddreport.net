'use client';
import { useEffect, useRef, useState } from 'react';

/*
  Hero centerpiece: canvas dot-matrix globe with signal nodes and
  great-circle arcs. Slow base rotation + scroll-coupled rotation +
  mouse-tilt (lerped, mouse pointers only).

  A11y contract (per accessibility-lead review):
  - canvas subtree aria-hidden, pointer-events none, no focusables
  - visible Pause/Play control OUTSIDE the aria-hidden subtree (WCAG 2.2.2 —
    auto-motion runs >5s); hidden under prefers-reduced-motion via CSS
  - prefers-reduced-motion: single static frame, no rAF, no listeners;
    handled live on mq change
  - rAF paused when offscreen (IO), tab hidden, or paused by the user
  - dot alpha fades to zero toward the canvas's left/bottom edges so text
    contrast never varies with rotation
  - pulse period 2.4s (~0.4Hz, far under the 3Hz flash limit)
*/

const GRID_STEP = 8;
const SIGNALS: [number, number][] = [
  [38.9, -77], [51.5, -0.1], [50.4, 30.5], [55.7, 37.6], [39.9, 116.4],
  [25.0, 121.5], [35.7, 51.4], [32.1, 34.8], [28.6, 77.2], [35.7, 139.7],
  [37.6, 127.0], [1.35, 103.8], [-33.9, 151.2], [-23.5, -46.6], [6.5, 3.4], [30.0, 31.2],
];
const ARCS: [number, number][] = [
  [0, 1], [0, 9], [1, 2], [3, 4], [4, 5], [8, 15], [11, 12], [0, 13],
];

function vec(lat: number, lon: number): [number, number, number] {
  const p = (lat * Math.PI) / 180;
  const l = (lon * Math.PI) / 180;
  return [Math.cos(p) * Math.cos(l), Math.sin(p), Math.cos(p) * Math.sin(l)];
}

function buildGeometry() {
  const grid: number[] = [];
  for (let lat = -72; lat <= 72; lat += GRID_STEP) {
    for (let lon = 0; lon < 360; lon += GRID_STEP) {
      grid.push(...vec(lat, lon));
    }
  }
  const signals = SIGNALS.map(([la, lo]) => vec(la, lo));
  // great-circle arcs, lifted off the surface at the midpoint
  const arcs = ARCS.map(([ai, bi]) => {
    const a = signals[ai], b = signals[bi];
    const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const omega = Math.acos(dot);
    const pts: number[] = [];
    const N = 36;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const sA = Math.sin((1 - t) * omega) / Math.sin(omega);
      const sB = Math.sin(t * omega) / Math.sin(omega);
      const lift = 1 + 0.16 * Math.sin(Math.PI * t);
      pts.push(
        (a[0] * sA + b[0] * sB) * lift,
        (a[1] * sA + b[1] * sB) * lift,
        (a[2] * sA + b[2] * sB) * lift,
      );
    }
    return pts;
  });
  return { grid, signals, arcs };
}

export default function IntelGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // restore a persisted pause preference (post-mount: no hydration mismatch)
  useEffect(() => {
    try { if (localStorage.getItem('rr-globe-paused') === '1') setPaused(true); } catch {}
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqWide = window.matchMedia('(min-width: 900px)');
    const { grid, signals, arcs } = buildGeometry();

    const SIZE = 700;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    const R = SIZE * 0.4, cx = SIZE * 0.54, cy = SIZE * 0.46;

    let raf = 0, running = false, inView = true;
    let mx = 0, my = 0, tmx = 0, tmy = 0;

    // fade dots toward the canvas's left/bottom edges (text sits there)
    const edgeFade = (sx: number, sy: number) => {
      const fx = Math.max(0, Math.min(1, sx / (SIZE * 0.3)));
      const fy = Math.max(0, Math.min(1, (SIZE * 0.97 - sy) / (SIZE * 0.2)));
      return fx * fy;
    };

    const project = (x: number, y: number, z: number, th: number, ph: number) => {
      const x1 = x * Math.cos(th) + z * Math.sin(th);
      const z1 = -x * Math.sin(th) + z * Math.cos(th);
      const y2 = y * Math.cos(ph) - z1 * Math.sin(ph);
      const z2 = y * Math.sin(ph) + z1 * Math.cos(ph);
      return { sx: cx + x1 * R, sy: cy - y2 * R, z: z2 };
    };

    const draw = (t: number) => {
      const th = t * 0.00007 + window.scrollY * 0.0009 + mx * 0.35;
      const ph = 0.42 + my * 0.13;
      ctx.clearRect(0, 0, SIZE, SIZE);

      for (let i = 0; i < grid.length; i += 3) {
        const p = project(grid[i], grid[i + 1], grid[i + 2], th, ph);
        if (p.z <= 0.02) continue;
        const a = (0.06 + p.z * 0.26) * edgeFade(p.sx, p.sy);
        if (a <= 0.01) continue;
        ctx.fillStyle = `rgba(235,235,232,${a.toFixed(3)})`;
        ctx.fillRect(p.sx, p.sy, 1.6, 1.6);
      }

      ctx.lineWidth = 1;
      for (const pts of arcs) {
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < pts.length; i += 3) {
          const p = project(pts[i], pts[i + 1], pts[i + 2], th, ph);
          if (p.z > 0.04) {
            if (pen) ctx.lineTo(p.sx, p.sy); else { ctx.moveTo(p.sx, p.sy); pen = true; }
          } else pen = false;
        }
        ctx.strokeStyle = 'rgba(30,158,255,0.20)';
        ctx.stroke();
      }

      signals.forEach((s, i) => {
        const p = project(s[0], s[1], s[2], th, ph);
        if (p.z <= 0.04) return;
        const f = edgeFade(p.sx, p.sy);
        if (f <= 0.02) return;
        ctx.fillStyle = `rgba(30,158,255,${(0.35 + p.z * 0.55) * f})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.4, 0, Math.PI * 2);
        ctx.fill();
        // expanding ring, 2.4s period, staggered — ~0.4Hz
        const phase = ((t / 2400) + i * 0.37) % 1;
        const ra = (1 - phase) * 0.3 * p.z * f;
        if (ra > 0.02) {
          ctx.strokeStyle = `rgba(30,158,255,${ra.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 3 + phase * 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    const loop = (t: number) => {
      if (!running) return;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    // read the persisted preference here too: the restore effect runs after
    // this one, and motion must not start even for those first frames
    let storedPaused = false;
    try { storedPaused = localStorage.getItem('rr-globe-paused') === '1'; } catch {}
    const start = () => {
      if (running || paused || storedPaused || mqReduce.matches || !mqWide.matches || document.hidden || !inView) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const resync = () => { stop(); draw(performance.now()); start(); };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const attachPointer = () => window.addEventListener('pointermove', onPointer, { passive: true });
    const detachPointer = () => window.removeEventListener('pointermove', onPointer);

    const onVis = () => resync();
    const onMq = () => {
      detachPointer();
      if (!mqReduce.matches && mqWide.matches) attachPointer();
      resync();
    };
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; resync(); });
    io.observe(wrap);

    if (!mqReduce.matches && mqWide.matches) attachPointer();
    document.addEventListener('visibilitychange', onVis);
    mqReduce.addEventListener('change', onMq);
    mqWide.addEventListener('change', onMq);

    draw(performance.now()); // synchronous first frame — never blank
    start();

    return () => {
      stop();
      detachPointer();
      document.removeEventListener('visibilitychange', onVis);
      mqReduce.removeEventListener('change', onMq);
      mqWide.removeEventListener('change', onMq);
      io.disconnect();
    };
  }, [paused]);

  const togglePause = () => {
    setPaused(p => {
      try { localStorage.setItem('rr-globe-paused', p ? '0' : '1'); } catch {}
      return !p;
    });
  };

  return (
    <div ref={wrapRef} className="rr-globe-wrap">
      <style>{`
        .rr-globe-wrap { pointer-events: none; }
        .rr-globe-wrap canvas {
          width: 100%; height: 100%; display: block; pointer-events: none;
        }
        /* inert without JS (nothing moves then) — render only when JS runs */
        .rr-globe-toggle { display: none; }
        html.rr-js .rr-globe-toggle { display: block; }
        .rr-globe-toggle {
          pointer-events: auto;
          position: absolute; right: 24%; bottom: 6%;
          font-family: var(--font-mono); font-size: 12px;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--text-muted); background: rgba(8,8,10,0.7);
          border: 1px solid var(--border-bright);
          padding: 6px 12px; cursor: pointer;
        }
        .rr-globe-toggle:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.6); }
        /* reduced motion renders a static frame — the control is moot */
        @media (prefers-reduced-motion: reduce) { .rr-globe-toggle { display: none; } }
      `}</style>
      <div aria-hidden="true" style={{ width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
      <button type="button" className="rr-globe-toggle" onClick={togglePause}>
        {paused ? 'Play motion' : 'Pause motion'}
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
          {' '}(background globe animation)
        </span>
      </button>
    </div>
  );
}
