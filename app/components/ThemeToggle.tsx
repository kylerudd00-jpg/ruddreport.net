'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.body.classList.add('light-mode');
      setIsDark(false);
    }
  }, []);

  const toggle = () => {
    const goLight = isDark;
    setIsDark(!goLight);
    if (goLight) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button className="theme-toggle-fab" onClick={toggle} aria-label="Toggle theme" title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      <span>{isDark ? 'LIGHT' : 'DARK'}</span>
    </button>
  );
}
