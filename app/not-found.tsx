'use client';

export default function NotFound() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; position: relative; overflow: hidden; }
        .bg-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(255,58,58,0.06) 0%, transparent 70%); pointer-events: none; }
        .code { font-family: var(--font-display); font-size: clamp(100px, 20vw, 200px); font-weight: 900; color: transparent; -webkit-text-stroke: 1px rgba(255,77,77,0.4); line-height: 1; margin-bottom: 0; animation: flicker 4s ease-in-out infinite; }
        .label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--red); text-transform: uppercase; margin-bottom: 32px; }
        .title { font-family: var(--font-display); font-size: clamp(18px, 3vw, 28px); font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
        .message { font-size: 16px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 500px; margin-bottom: 12px; }
        .submessage { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.05em; margin-bottom: 48px; }
        .btn { display: inline-block; padding: 14px 32px; border: 1px solid var(--border-bright); font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-decoration: none; text-transform: uppercase; transition: all 0.3s; }
        .btn:hover { background: rgba(30,158,255,0.1); border-color: var(--accent); box-shadow: 0 0 20px rgba(30,158,255,0.2); }
        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.4; }
          97% { opacity: 1; }
          98% { opacity: 0.2; }
          99% { opacity: 1; }
        }
      `}</style>
      <main id="main" className="page">
        <div className="bg-glow" aria-hidden="true" />
        <div className="code" aria-hidden="true">404</div>
        <div className="label">Access Denied — Page Not Found</div>
        <h1 className="title">This Page Is Classified</h1>
        <p className="message">Either this page doesn't exist, was redacted by a three-letter agency, or you've stumbled into a part of the internet that isn't cleared for public release.</p>
        <p className="submessage">We're going to need you to act like you never saw this.</p>
        <a href="/" className="btn">↩ Return To Base</a>
      </main>
    </>
  );
}