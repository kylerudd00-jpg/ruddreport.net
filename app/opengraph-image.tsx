import { ImageResponse } from 'next/og';

export const alt = 'The Rudd Report';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: '#030608',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(30,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,158,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Left accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#1e9eff' }} />
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 40, height: 1, background: '#1e9eff' }} />
          <span style={{ fontFamily: 'sans-serif', fontSize: 14, letterSpacing: 4, color: '#1e9eff', textTransform: 'uppercase' }}>
            Independent Strategic Analysis
          </span>
        </div>
        {/* Title */}
        <div style={{ fontSize: 80, fontWeight: 700, color: '#c0cfe0', lineHeight: 1.05, marginBottom: 24 }}>
          The Rudd Report
        </div>
        {/* Subtitle */}
        <div style={{ fontFamily: 'sans-serif', fontSize: 22, color: '#7a9bb5', lineHeight: 1.5, maxWidth: 720 }}>
          Independent writing on cybersecurity, national security, and geopolitics.
        </div>
        {/* Bottom bar */}
        <div style={{ position: 'absolute', bottom: 48, left: 80, right: 80, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#5a7a94', letterSpacing: 2 }}>ruddreport.net</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {['Cybersecurity', 'Intelligence', 'Geopolitics'].map(cat => (
              <span key={cat} style={{ fontFamily: 'sans-serif', fontSize: 11, color: '#5a7a94', letterSpacing: 2, border: '1px solid rgba(30,158,255,0.2)', padding: '4px 10px' }}>{cat.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
