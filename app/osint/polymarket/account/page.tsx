"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountTrackerPage() {
  const [input, setInput] = useState("");
  const router = useRouter();

  function handleTrack() {
    const raw = input.trim();
    if (!raw) return;
    const addrMatch = raw.match(/0x[a-fA-F0-9]{40}/);
    if (addrMatch) {
      router.push(`/osint/polymarket/account/${addrMatch[0]}`);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: #1e9eff; }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Orbitron', monospace; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Share Tech Mono', monospace; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .page-wrap { padding-top: 70px; min-height: 100vh; background: #030608; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid rgba(30,158,255,0.08); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: #1e9eff; }
        .tool-hero { padding: 60px 40px 50px; border-bottom: 1px solid rgba(30,158,255,0.12); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: #1e9eff; box-shadow: 0 0 8px #1e9eff; }
        .tool-eyebrow-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 5px; color: #1e9eff; text-transform: uppercase; }
        .tool-title { font-family: 'Orbitron', monospace; font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #c0cfe0; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 300; color: #7a9bb5; line-height: 1.8; max-width: 700px; }
        .search-wrap { padding: 60px 40px; max-width: 1100px; margin: 0 auto; }
        .search-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; }
        .search-box { display: flex; border: 1px solid rgba(30,158,255,0.3); background: #0a1520; }
        .search-box:focus-within { border-color: rgba(30,158,255,0.5); }
        .search-input { flex: 1; background: none; border: none; outline: none; padding: 20px 24px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #d8e8f5; letter-spacing: 2px; }
        .search-input::placeholder { color: #3d5870; }
        .search-btn { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 3px; color: #ffffff; background: #1e9eff; border: none; padding: 20px 40px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4dffaa; }
        .search-btn:disabled { background: #1a3a52; color: #3d5870; cursor: not-allowed; }
        .hint-section { padding: 0 40px 60px; max-width: 1100px; margin: 0 auto; }
        .hint-title { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; text-transform: uppercase; margin-bottom: 16px; }
        .hint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .hint-card { background: #0a1520; border: 1px solid rgba(30,158,255,0.08); padding: 20px; }
        .hint-card-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1e9eff; text-transform: uppercase; margin-bottom: 8px; }
        .hint-card-text { font-size: 13px; font-weight: 300; color: #7a9bb5; line-height: 1.6; }
        .hint-card-example { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5870; margin-top: 10px; word-break: break-all; }
        footer { border-top: 1px solid rgba(30,158,255,0.12); padding: 40px; background: #070d12; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-copy span { color: #1e9eff; }
        .footer-classify { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: #3d5870; border: 1px solid rgba(30,158,255,0.12); padding: 5px 14px; text-transform: uppercase; }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
          .tool-hero, .search-wrap, .hint-section { padding-left: 20px; padding-right: 20px; }
          .search-box { flex-direction: column; }
          .hint-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo">
            <div className="nav-logo-text">The Rudd Report</div>
          </a>
          <ul className="nav-links">
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/intelligence">Intelligence</a></li>
            <li><a href="/geopolitics">Geopolitics</a></li>
            <li><a href="/national-security">National Security</a></li>
            <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('acctMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>

        <div className="mobile-menu" id="acctMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('acctMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a>
          <a href="/osint">OSINT Hub</a>
          <a href="/osint/polymarket">Polymarket</a>
          <a href="/cybersecurity">Cybersecurity</a>
          <a href="/about">About</a>
        </div>

        <div className="back-bar">
          <a href="/osint/polymarket" className="back-link">← Back to Polymarket Tracker</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" />
              <div className="tool-eyebrow-text">// Polymarket — Wallet Intelligence</div>
            </div>
            <div className="tool-title">Account Tracker</div>
            <p className="tool-desc">
              Enter any Polymarket wallet address to surface open positions, trade history, and portfolio concentration.
              Identify conviction bets, track smart money, and flag unusual activity. OSINT leads — not proof.
            </p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-label">// Enter wallet address or Polymarket profile URL</div>
          <div className="search-box">
            <input
              className="search-input"
              placeholder="0x... or https://polymarket.com/profile/0x..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              autoFocus
            />
            <button
              className="search-btn"
              onClick={handleTrack}
              disabled={!input.trim()}
            >
              Track →
            </button>
          </div>
        </div>

        <div className="hint-section">
          <div className="hint-title">// How to find a wallet address</div>
          <div className="hint-grid">
            <div className="hint-card">
              <div className="hint-card-label">Raw Wallet Address</div>
              <div className="hint-card-text">Paste any Ethereum-format address starting with 0x (42 characters total).</div>
              <div className="hint-card-example">0x1234...abcd</div>
            </div>
            <div className="hint-card">
              <div className="hint-card-label">From a Profile URL</div>
              <div className="hint-card-text">Paste a Polymarket profile URL containing the 0x address — it will be extracted automatically.</div>
              <div className="hint-card-example">polymarket.com/profile/0xd91E...</div>
            </div>
            <div className="hint-card">
              <div className="hint-card-label">Finding an Address</div>
              <div className="hint-card-text">On any Polymarket market page, click a trader's name. Their profile URL will contain the 0x wallet address.</div>
              <div className="hint-card-example">market page → click trader → copy URL</div>
            </div>
          </div>
        </div>

        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 <span>The Rudd Report</span> — All Rights Reserved</div>
            <div className="footer-classify">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>
      </div>
    </>
  );
}