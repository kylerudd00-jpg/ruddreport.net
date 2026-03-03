'use client';

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; height: 100%; }
        .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; position: relative; overflow: hidden; }
        .bg-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(255,58,58,0.06) 0%, transparent 70%); pointer-events: none; }
        .code { font-family: 'Orbitron', monospace; font-size: clamp(100px, 20vw, 200px); font-weight: 900; color: transparent; -webkit-text-stroke: 1px rgba(255,58,58,0.4); line-height: 1; margin-bottom: 0; animation: flicker 4s ease-in-out infinite; }
        .label { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 6px; color: #ff3a3a; text-transform: uppercase; margin-bottom: 32px; }
        .title { font-family: 'Orbitron', monospace; font-size: clamp(18px, 3vw, 28px); font-weight: 700; color: #c0cfe0; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
        .message { font-size: 16px; font-weight: 300; color: #7a9bb5; line-height: 1.8; max-width: 500px; margin-bottom: 12px; }
        .submessage { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #3d5870; letter-spacing: 2px; margin-bottom: 48px; }
        .btn { display: inline-block; padding: 14px 32px; border: 1px solid rgba(30,158,255,0.4); font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #1e9eff; text-decoration: none; text-transform: uppercase; transition: all 0.3s; }
        .btn:hover { background: rgba(30,158,255,0.1); border-color: #1e9eff; box-shadow: 0 0 20px rgba(30,158,255,0.2); }
        .classified { position: absolute; bottom: 40px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #1a2a3a; text-transform: uppercase; }
        @keyframes flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.4; }
          97% { opacity: 1; }
          98% { opacity: 0.2; }
          99% { opacity: 1; }
        }
      `}</style>
      <div className="page">
        <div className="bg-glow" />
        <div className="code">404</div>
        <div className="label">// Access Denied — Page Not Found</div>
        <div className="title">This Page Is Classified</div>
        <p className="message">Either this page doesn't exist, was redacted by a three-letter agency, or you've stumbled into a part of the internet that isn't cleared for public release.</p>
        <p className="submessage">// We're going to need you to act like you never saw thisッ </p>
        <a href="/" className="btn">↩ Return To Base</a>
        <div className="classified">CLASSIFIED — EYES ONLY — DO NOT DISTRIBUTE</div>
      </div>
    </>
  );
}