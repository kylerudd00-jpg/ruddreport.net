'use client';
import { useState } from 'react';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #030608; color: #d8e8f5; font-family: 'Barlow', sans-serif; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(30,158,255,0.12); }
  .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; color: #fff; }
  .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
  .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
  .nav-links a:hover { color: #1e9eff; }
  .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
  .hamburger span { display: block; width: 24px; height: 2px; background: #1e9eff; }
  .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
  .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; letter-spacing: 1px; }
  .page-wrap { padding-top: 70px; min-height: 100vh; }
  .hero { padding: 60px 40px 40px; border-bottom: 1px solid rgba(30,158,255,0.12); }
  .hero-inner { max-width: 900px; margin: 0 auto; }
  .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .hero-eyebrow-line { width: 32px; height: 1px; background: #1e9eff; }
  .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #1e9eff; text-transform: uppercase; }
  .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: #c0cfe0; margin-bottom: 10px; }
  .hero-title span { color: #1e9eff; }
  .hero-sub { font-size: 14px; font-weight: 400; color: #7a9bb5; line-height: 1.7; }
  .tool-wrap { max-width: 900px; margin: 0 auto; padding: 40px 40px 80px; }
  .input-row { display: flex; gap: 2px; margin-bottom: 2px; }
  .cidr-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); color: #d8e8f5; font-family: 'IBM Plex Mono', monospace; font-size: 16px; padding: 14px 18px; outline: none; transition: border-color 0.2s; letter-spacing: 1px; }
  .cidr-input:focus { border-color: rgba(30,158,255,0.5); }
  .cidr-input::placeholder { color: #3d5870; font-size: 13px; letter-spacing: 0; }
  .calc-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: #1e9eff; border: 1px solid #1e9eff; color: #000; padding: 14px 28px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: all 0.2s; }
  .calc-btn:hover { background: #4db3ff; }
  .hint { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: #3d5870; margin-top: 10px; }
  .result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2px; margin-top: 16px; }
  .result-cell { background: #0a1520; border: 1px solid rgba(30,158,255,0.12); padding: 20px 22px; }
  .result-cell-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: #3d5870; text-transform: uppercase; margin-bottom: 8px; }
  .result-cell-val { font-family: 'IBM Plex Mono', monospace; font-size: 15px; color: #c0cfe0; }
  .result-cell.accent .result-cell-val { color: #1e9eff; }
  .result-cell.full { grid-column: 1 / -1; }
  .error-box { background: rgba(255,60,60,0.06); border: 1px solid rgba(255,60,60,0.2); padding: 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 1px; color: #ff6666; margin-top: 16px; }
  .quick-btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .quick-btn { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d5870; background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 5px 12px; cursor: pointer; transition: all 0.2s; }
  .quick-btn:hover { color: #1e9eff; border-color: rgba(30,158,255,0.3); }
  @media (max-width: 768px) { nav { padding: 0 16px; } .nav-links { display: none; } .hamburger { display: flex; } .hero { padding: 40px 20px 30px; } .tool-wrap { padding: 24px 20px 60px; } .result-grid { grid-template-columns: 1fr; } .input-row { flex-direction: column; } }
`;

interface SubnetInfo {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  mask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  prefix: number;
  binary: string;
  ipClass: string;
  isPrivate: boolean;
}

function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0;
}

function numToIp(n: number): string {
  return [24, 16, 8, 0].map(shift => (n >>> shift) & 0xff).join('.');
}

function toBinaryOctets(ip: string): string {
  return ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.');
}

function calcSubnet(cidr: string): SubnetInfo | null {
  const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
  if (!match) return null;
  const ip = match[1];
  const prefix = parseInt(match[2]);
  if (prefix < 0 || prefix > 32) return null;
  const octs = ip.split('.').map(Number);
  if (octs.some(o => o < 0 || o > 255)) return null;

  const maskNum = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipNum = ipToNum(ip);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : totalHosts - 2;

  const firstOct = octs[0];
  let ipClass = 'E';
  if (firstOct < 128) ipClass = 'A';
  else if (firstOct < 192) ipClass = 'B';
  else if (firstOct < 224) ipClass = 'C';
  else if (firstOct < 240) ipClass = 'D (Multicast)';

  const isPrivate =
    (firstOct === 10) ||
    (firstOct === 172 && octs[1] >= 16 && octs[1] <= 31) ||
    (firstOct === 192 && octs[1] === 168) ||
    (firstOct === 127);

  return {
    network: numToIp(networkNum),
    broadcast: numToIp(broadcastNum),
    firstHost: prefix >= 31 ? numToIp(networkNum) : numToIp(networkNum + 1),
    lastHost: prefix >= 31 ? numToIp(broadcastNum) : numToIp(broadcastNum - 1),
    mask: numToIp(maskNum),
    wildcardMask: numToIp(~maskNum >>> 0),
    totalHosts,
    usableHosts: Math.max(0, usableHosts),
    prefix,
    binary: toBinaryOctets(numToIp(networkNum)),
    ipClass,
    isPrivate,
  };
}

const EXAMPLES = ['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/12', '192.168.100.64/26'];

export default function SubnetCalc() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState('');

  function calculate(val?: string) {
    const input = val ?? query;
    setError('');
    setResult(null);
    if (!input.trim()) return;
    const res = calcSubnet(input.trim());
    if (!res) { setError('Invalid CIDR notation. Use format: 192.168.1.0/24'); return; }
    setResult(res);
    if (val) setQuery(val);
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="page-wrap">
        <nav>
          <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
          <ul className="nav-links">
            <li><a href="/osint">OSINT Hub</a></li>
            <li><a href="/cybersecurity">Cybersecurity</a></li>
            <li><a href="/about">About</a></li>
          </ul>
          <div className="hamburger" onClick={() => document.getElementById('subMenu')?.classList.toggle('open')}>
            <span /><span /><span />
          </div>
        </nav>
        <div className="mobile-menu" id="subMenu">
          <button className="mobile-menu-close" onClick={() => document.getElementById('subMenu')?.classList.remove('open')}>✕ Close</button>
          <a href="/">Home</a><a href="/osint">OSINT Hub</a><a href="/about">About</a>
        </div>

        <div className="hero">
          <div className="hero-inner">
            <div className="hero-eyebrow"><div className="hero-eyebrow-line" /><div className="hero-eyebrow-text">OSINT Hub · Network</div></div>
            <div className="hero-title">Subnet <span>Calculator</span></div>
            <p className="hero-sub">IP addresses belong to network blocks that define who else shares the same range. Enter any IP in CIDR notation (like 192.168.1.0/24) to calculate the full address range, how many devices it can hold, and the broadcast and gateway addresses. Used by network engineers and analysts to understand the scope of any IP block.</p>
          </div>
        </div>

        <div className="tool-wrap">
          <div className="input-row">
            <input
              className="cidr-input"
              placeholder="e.g. 192.168.1.0/24"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && calculate()}
            />
            <button className="calc-btn" onClick={() => calculate()}>Calculate →</button>
          </div>
          <div className="quick-btns">
            {EXAMPLES.map(ex => (
              <button key={ex} className="quick-btn" onClick={() => calculate(ex)}>{ex}</button>
            ))}
          </div>
          <div className="hint" style={{marginTop: '8px'}}>Enter an IP address with CIDR prefix length (0–32).</div>

          {error && <div className="error-box">{error}</div>}

          {result && (
            <div className="result-grid">
              <div className="result-cell accent">
                <div className="result-cell-label">Network Address</div>
                <div className="result-cell-val">{result.network}/{result.prefix}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Broadcast Address</div>
                <div className="result-cell-val">{result.broadcast}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">First Usable Host</div>
                <div className="result-cell-val">{result.firstHost}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Last Usable Host</div>
                <div className="result-cell-val">{result.lastHost}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Subnet Mask</div>
                <div className="result-cell-val">{result.mask}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Wildcard Mask</div>
                <div className="result-cell-val">{result.wildcardMask}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Total Hosts</div>
                <div className="result-cell-val">{result.totalHosts.toLocaleString()}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Usable Hosts</div>
                <div className="result-cell-val">{result.usableHosts.toLocaleString()}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">IP Class</div>
                <div className="result-cell-val">Class {result.ipClass}</div>
              </div>
              <div className="result-cell">
                <div className="result-cell-label">Address Space</div>
                <div className="result-cell-val">{result.isPrivate ? 'Private (RFC 1918)' : 'Public'}</div>
              </div>
              <div className="result-cell full">
                <div className="result-cell-label">Network (Binary)</div>
                <div className="result-cell-val" style={{fontSize: '12px', letterSpacing: '1px'}}>{result.binary}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
