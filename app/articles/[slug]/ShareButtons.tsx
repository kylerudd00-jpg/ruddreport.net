'use client';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () =>
    typeof window !== 'undefined'
      ? window.location.href
      : `https://www.theruddreport.com/articles/${slug}`;

  const shareTwitter = () => {
    const url = getUrl();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const shareLinkedIn = () => {
    const url = getUrl();
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = getUrl();
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '24px 0',
      borderTop: '1px solid rgba(30,158,255,0.12)',
      borderBottom: '1px solid rgba(30,158,255,0.12)',
      flexWrap: 'wrap',
    }}>
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '9px',
        letterSpacing: '3px',
        color: '#3d5870',
        textTransform: 'uppercase',
      }}>
        SHARE //
      </span>
      <button
        onClick={shareTwitter}
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: '#1e9eff',
          background: 'transparent',
          border: '1px solid rgba(30,158,255,0.25)',
          padding: '6px 14px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(30,158,255,0.1)';
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.5)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.background = 'transparent';
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.25)';
        }}
      >
        X / Twitter
      </button>
      <button
        onClick={shareLinkedIn}
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: '#1e9eff',
          background: 'transparent',
          border: '1px solid rgba(30,158,255,0.25)',
          padding: '6px 14px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.background = 'rgba(30,158,255,0.1)';
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.5)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.background = 'transparent';
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(30,158,255,0.25)';
        }}
      >
        LinkedIn
      </button>
      <button
        onClick={copyLink}
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: copied ? '#00ff88' : '#1e9eff',
          background: copied ? 'rgba(0,255,136,0.08)' : 'transparent',
          border: `1px solid ${copied ? 'rgba(0,255,136,0.3)' : 'rgba(30,158,255,0.25)'}`,
          padding: '6px 14px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
