'use client';
import { useEffect, useState } from 'react';

export default function ArticleNav() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop || document.body.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 70,
      left: 0,
      right: 0,
      height: 2,
      zIndex: 199,
      background: 'rgba(30,158,255,0.08)',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: '#1e9eff',
        transition: 'width 0.1s linear',
      }} />
    </div>
  );
}
