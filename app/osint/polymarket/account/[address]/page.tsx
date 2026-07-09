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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page-wrap { padding-top: 70px; min-height: 100vh; background: var(--bg-primary); }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }
        .tool-hero { padding: 60px 40px 50px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent);  }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 700px; }
        .search-wrap { padding: 60px 40px; max-width: 1100px; margin: 0 auto; }
        .search-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        .search-box { display: flex; border: 1px solid var(--border-bright); background: var(--bg-card); }
        .search-box:focus-within { border-color: var(--accent); }
        .search-input { flex: 1; background: none; border: none; padding: 20px 24px; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 0.05em; }
        .search-input::placeholder { color: var(--text-muted); }
        .search-btn { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: #000; background: var(--accent); border: none; padding: 20px 40px; cursor: pointer; text-transform: uppercase; transition: background 0.3s; white-space: nowrap; }
        .search-btn:hover { background: #4db3ff; }
        .search-btn:disabled { background: var(--bg-card); color: var(--text-muted); cursor: not-allowed; }
        .hint-section { padding: 0 40px 60px; max-width: 1100px; margin: 0 auto; }
        .hint-title { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; }
        .hint-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .hint-card { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; }
        .hint-card-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
        .hint-card-text { font-size: 13px; font-weight: 400; color: var(--text-secondary); line-height: 1.6; }
        .hint-card-example { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 10px; word-break: break-all; }
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }
        @media (max-width: 768px) {
          .tool-hero, .search-wrap, .hint-section { padding-left: 20px; padding-right: 20px; }
          .search-box { flex-direction: column; }
          .hint-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        <div className="back-bar">
          <a href="/osint/polymarket" className="back-link">← Back to Polymarket Tracker</a>
        </div>

        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Polymarket — Wallet Intelligence</div>
            </div>
            <h1 className="tool-title">Account Tracker</h1>
            <p className="tool-desc">
              Enter any Polymarket wallet address to surface open positions, trade history, and portfolio concentration.
              Identify conviction bets, track smart money, and flag unusual activity. OSINT leads — not proof.
            </p>
          </div>
        </div>

        <div className="search-wrap">
          <div className="search-label">Enter wallet address or Polymarket profile URL</div>
          <div className="search-box">
            <input
              className="search-input"
              aria-label="Wallet address or Polymarket profile URL"
              placeholder="0x... or https://polymarket.com/profile/0x..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              autoFocus
            />
            <button
              type="button"
              className="search-btn"
              onClick={handleTrack}
              disabled={!input.trim()}
            >
              Track →
            </button>
          </div>
        </div>

        <div className="hint-section">
          <h2 className="hint-title">How to find a wallet address</h2>
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
            <div className="footer-copy">© 2026 The Rudd Report</div>

          </div>
        </footer>
      </main>
    </>
  );
}