'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ARTICLES, type Article, getReadingTime } from '@/lib/articles';

const CATEGORIES = ['All', 'Cybersecurity', 'Intelligence', 'Geopolitics', 'National Security', 'Economic Security'] as const;

function getFeatured(): Article[] {
  const featured = ARTICLES.filter(a => a.featured);
  return featured.length > 0 ? featured : ARTICLES.slice(0, 1);
}

function getLatest(count = 3): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

function getByCategory(cat: string): Article[] {
  if (cat === 'All') return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  return ARTICLES.filter(a => a.category === cat).sort((a, b) => b.date.localeCompare(a.date));
}

function getCategoryColor(cat: string): string {
  switch (cat) {
    case 'Cybersecurity': return '#ff4444';
    case 'Intelligence': return '#b464ff';
    case 'Geopolitics': return '#ffaa00';
    case 'National Security': return '#22cc66';
    case 'Economic Security': return '#00c9b0';
    default: return '#1e9eff';
  }
}

export default function Home() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [osintQuery, setOsintQuery] = useState('');
  const [toolCount, setToolCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const featured = getFeatured();
  const currentFeatured = featured.length > 0 ? featured[featuredIndex % featured.length] : null;
  const filteredArticles = getByCategory(activeCategory).filter(a =>
    !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const latest = getLatest(3);

  useEffect(() => {
    if (featured.length <= 1) return;
    const t = setInterval(() => setFeaturedIndex(i => i + 1), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    reveals.forEach(r => observer.observe(r));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        const duration = 1200;
        const fps = 60;
        const steps = Math.round(duration / (1000 / fps));
        let step = 0;
        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          setToolCount(Math.round(38 * eased));
          setCatCount(Math.round(6 * eased));
          if (step >= steps) clearInterval(timer);
        }, 1000 / fps);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const relevanceColor = (r: string) => r === 'HIGH' ? '#ff3a3a' : r === 'MED' ? '#ffaa00' : '#1e9eff';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@300;400;600;700&family=Barlow:wght@300;400;500&display=swap');
        :root { --accent: #1e9eff; --accent-dim: rgba(30,158,255,0.25); --accent-glow: rgba(30,158,255,0.06); --border: rgba(30,158,255,0.12); --border-bright: rgba(30,158,255,0.35); --bg: #030608; --bg-card: #070d12; --bg-card-hover: #0a1520; --bg-secondary: #070d12; --silver: #c0cfe0; --text-primary: #d8e8f5; --text-secondary: #7a9bb5; --text-muted: #5a7a94; --red: #ff3a3a; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: var(--bg); color: var(--text-primary); font-family: 'Barlow', sans-serif; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 40px; height: 70px; display: flex; align-items: center; justify-content: space-between; background: rgba(3,6,8,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
        .nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; color: #fff; }
        .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
        .nav-links a { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #c0cfe0; text-decoration: none; transition: color 0.3s; }
        .nav-links a:hover { color: var(--accent); }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; }
        .hamburger span { display: block; width: 24px; height: 2px; background: var(--accent); }
        .mobile-menu { display: none; position: fixed; inset: 0; background: rgba(3,6,8,0.97); z-index: 150; flex-direction: column; align-items: center; justify-content: center; gap: 40px; }
        .mobile-menu.open { display: flex; }
        .mobile-menu a { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #c0cfe0; text-decoration: none; text-transform: uppercase; }
        .mobile-menu-close { position: absolute; top: 24px; right: 24px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; letter-spacing: 3px; cursor: pointer; text-transform: uppercase; background: none; border: none; color: #7a9bb5; }
        .hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 120px 40px 80px; overflow: hidden; }
        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; }
        .hero-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; opacity: 0; animation: fadeUp 0.8s ease 0.3s forwards; }
        .hero-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .hero-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: var(--text-secondary); text-transform: uppercase; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(52px, 8vw, 100px); font-weight: 900; line-height: 1.0; color: var(--silver); letter-spacing: -1px; opacity: 0; animation: fadeUp 0.9s ease 0.5s forwards; }
        .hero-title .accent-word { color: var(--accent); display: block; }
        .hero-subtitle { margin-top: 28px; font-size: 16px; font-weight: 400; color: var(--text-secondary); max-width: 560px; line-height: 1.7; opacity: 0; animation: fadeUp 0.9s ease 0.7s forwards; }
        .hero-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 40px; opacity: 0; animation: fadeUp 0.9s ease 0.9s forwards; }
        .hero-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 2px; color: #c0cfe0; border: 1px solid rgba(30,158,255,0.25); padding: 7px 16px; text-transform: uppercase; transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease; text-decoration: none; display: inline-block; background: transparent; cursor: pointer; }
        .hero-tag:hover { color: #fff; border-color: rgba(30,158,255,0.6); background: rgba(30,158,255,0.07); transform: translateY(-1px); }
        .hero-tag.active { color: #fff; border-color: #1e9eff; background: rgba(30,158,255,0.12); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(30,158,255,0.2), 0 0 0 1px rgba(30,158,255,0.15); }
        .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0; animation: fadeUp 1s ease 1.4s forwards; }
        .hero-scroll-text { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 4px; color: var(--text-muted); text-transform: uppercase; }
        .hero-scroll-line { width: 1px; height: 50px; background: linear-gradient(to bottom, var(--accent), transparent); animation: scrollLine 2s ease-in-out infinite; }
        .ticker-wrap { position: relative; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(7,13,18,0.9); padding: 10px 0; overflow: hidden; }
        .ticker-label { position: absolute; left: 0; top: 0; bottom: 0; background: var(--accent); display: flex; align-items: center; padding: 0 20px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #000; z-index: 2; text-transform: uppercase; }
        .ticker-track { display: flex; animation: ticker 30s linear infinite; padding-left: 160px; }
        .ticker-item { white-space: nowrap; font-family: 'Barlow', sans-serif; font-size: 12px; font-weight: 400; color: var(--text-secondary); padding: 0 40px; display: flex; align-items: center; gap: 12px; }
        .ticker-item::after { content: '·'; color: var(--text-muted); }
        section { padding: 100px 40px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 60px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .section-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: var(--silver); letter-spacing: 0; }
        .section-link { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: var(--accent); text-decoration: none; text-transform: uppercase; display: flex; align-items: center; gap: 8px; transition: gap 0.3s; }
        .section-link:hover { gap: 14px; }
        .featured-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .article-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); padding: 36px; overflow: hidden; text-decoration: none; display: block; transition: all 0.4s ease; cursor: pointer; }
        .article-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); transform: scaleX(0); transition: transform 0.5s ease; }
        .article-card:hover { background: var(--bg-card-hover); border-color: var(--border-bright); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .article-card:hover::before { transform: scaleX(1); }
        .article-card.featured-card { grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 60px; }

        .featured-visual { position: relative; height: 300px; border: 1px solid var(--border); overflow: hidden; background: radial-gradient(ellipse at center, rgba(30,158,255,0.06) 0%, rgba(7,13,18,0.0) 70%), var(--bg-secondary); }
        .featured-visual::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(30,158,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,158,255,0.04) 1px, transparent 1px); background-size: 30px 30px; pointer-events: none; }
        .featured-visual-inner { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 1; }
        .globe-svg { width: 200px; height: 200px; opacity: 0.6; animation: rotateSlow 20s linear infinite; }
        .visual-label { position: absolute; bottom: 16px; left: 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; z-index: 2; opacity: 0.6; }
        .card-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .card-category { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); border: 1px solid var(--accent-dim); padding: 3px 10px; background: var(--accent-glow); }
        .card-date { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: var(--text-muted); }
        .card-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.2; letter-spacing: -0.3px; margin-bottom: 16px; transition: color 0.3s; }
        .article-card:hover .card-title { color: var(--accent); }
        .featured-card .card-title { font-size: 42px; line-height: 1.1; }
        .card-excerpt { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.75; }
        .card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); }
        .card-read { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; }
        .visual-label { position: absolute; bottom: 16px; left: 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; z-index: 2; opacity: 0.6; }
        .rotate-dots { display: flex; gap: 8px; margin-top: 16px; }
        .rotate-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(30,158,255,0.2); cursor: pointer; transition: background 0.3s; border: 1px solid rgba(30,158,255,0.3); }
        .rotate-dot.active { background: #1e9eff; }
        .intel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .topics-section { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .topics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .topic-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); padding: 36px; overflow: hidden; text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; min-height: 220px; transition: all 0.4s ease; }
        .topic-card:first-child { grid-column: span 2; min-height: 260px; }
        .topic-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); transform: scaleX(0); transition: transform 0.5s ease; }
        .topic-card:hover { background: var(--bg-card-hover); border-color: var(--border-bright); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .topic-card:hover::before { transform: scaleX(1); }
        .topic-ghost { display: none; }
        .topic-top { display: flex; align-items: center; justify-content: space-between; }
        .topic-index { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; }
        .topic-icon { color: var(--text-muted); transition: color 0.4s; }
        .topic-card:hover .topic-icon { color: var(--accent); }
        .topic-name { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 700; color: var(--silver); text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; margin-top: 20px; transition: color 0.4s; }
        .topic-card:first-child .topic-name { font-size: 48px; }
        .topic-card:hover .topic-name { color: var(--accent); }
        .topic-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
        .topic-count { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); }
        .topic-enter { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; transition: letter-spacing 0.3s; }
        .topic-card:hover .topic-enter { letter-spacing: 5px; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, var(--accent-dim), transparent); }
        .reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; } .reveal-delay-2 { transition-delay: 0.2s; } .reveal-delay-3 { transition-delay: 0.3s; }
        footer { border-top: 1px solid var(--border); padding: 60px 40px 40px; background: var(--bg-secondary); }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 60px; padding-bottom: 40px; border-bottom: 1px solid var(--border); margin-bottom: 40px; }
        .footer-brand-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--silver); letter-spacing: 0; margin-bottom: 4px; }
        .footer-brand-tag { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 20px; }
        .footer-desc { font-size: 13px; color: var(--text-muted); line-height: 1.8; max-width: 280px; }
        .footer-col-title { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 4px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 20px; }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a { font-size: 13px; color: var(--text-muted); text-decoration: none; transition: color 0.3s; }
        .footer-links a:hover { color: var(--accent); }
        .footer-bottom { display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Barlow', sans-serif; font-size: 12px; color: var(--text-muted); }
        .footer-copy span { color: var(--text-secondary); }
        .no-articles { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 3px; color: var(--text-muted); text-align: center; padding: 60px 20px; border: 1px solid var(--border); grid-column: 1 / -1; }
        .articles-toolbar { border-top: 1px solid rgba(30,158,255,0.12); border-bottom: 1px solid rgba(30,158,255,0.12); margin-bottom: 24px; background: rgba(7,13,18,0.6); }
        .articles-toolbar-row { display: flex; align-items: center; }
        .articles-toolbar-title { padding: 16px 24px; border-right: 1px solid rgba(30,158,255,0.12); flex-shrink: 0; font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #c0cfe0; white-space: nowrap; }
        .articles-toolbar-filters { display: flex; flex: 1; overflow-x: auto; scrollbar-width: none; }
        .articles-toolbar-filters::-webkit-scrollbar { display: none; }
        .articles-toolbar-search { display: flex; border-left: 1px solid rgba(30,158,255,0.12); flex-shrink: 0; }
        .search-bar-wrap { margin-bottom: 24px; }
        .search-bar { display: flex; border: 1px solid var(--border); background: var(--bg-card); }
        .search-bar-input { flex: 1; background: none; border: none; outline: none; padding: 12px 16px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; color: var(--text-primary); letter-spacing: 1px; }
        .search-bar-input::placeholder { color: var(--text-muted); }
        .search-bar-clear { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: var(--text-muted); background: none; border: none; padding: 12px 16px; cursor: pointer; text-transform: uppercase; transition: color 0.2s; }
        .search-bar-clear:hover { color: var(--accent); }
        .cat-filter-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border: 1px solid rgba(30,158,255,0.2); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .cat-filter-btn:hover { border-color: rgba(30,158,255,0.5); color: var(--silver); }
        .cat-filter-btn--active { background: rgba(30,158,255,0.1); border-color: rgba(30,158,255,0.5); color: var(--accent); }
        /* OSINT HUB SECTION */
        .osint-section { background: #050c14; border-top: 1px solid rgba(30,158,255,0.12); border-bottom: 1px solid rgba(30,158,255,0.12); padding: 80px 40px; }
        .osint-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .osint-header { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: end; margin-bottom: 48px; }
        .osint-eyebrow { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .osint-eyebrow-line { width: 32px; height: 1px; background: var(--accent); }
        .osint-eyebrow-text { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; }
        .osint-title { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 52px); font-weight: 700; color: var(--silver); line-height: 1.05; letter-spacing: -0.5px; }
        .osint-title span { color: var(--accent); }
        .osint-sub { font-size: 14px; font-weight: 400; color: var(--text-secondary); line-height: 1.75; margin-bottom: 24px; }
        .osint-cta { display: inline-flex; align-items: center; gap: 10px; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #000; background: var(--accent); padding: 12px 24px; text-decoration: none; transition: background 0.2s; }
        .osint-cta:hover { background: #4db3ff; }
        .osint-stats { display: flex; gap: 28px; }
        .osint-stat { border-left: 2px solid rgba(30,158,255,0.2); padding-left: 16px; }
        .osint-stat-num { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: var(--accent); }
        .osint-stat-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: var(--text-muted); text-transform: uppercase; }
        .osint-right { display: flex; flex-direction: column; gap: 0; }
        .osint-router-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; }
        .osint-router-row { display: flex; gap: 0; margin-bottom: 10px; }
        .osint-router-input { flex: 1; background: rgba(3,6,8,0.8); border: 1px solid rgba(30,158,255,0.2); border-right: none; color: var(--text-primary); font-family: 'IBM Plex Mono', monospace; font-size: 13px; padding: 13px 16px; outline: none; transition: border-color 0.2s; }
        .osint-router-input:focus { border-color: rgba(30,158,255,0.5); }
        .osint-router-input::placeholder { color: var(--text-muted); font-size: 11px; }
        .osint-router-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; background: var(--accent); border: 1px solid var(--accent); color: #000; padding: 13px 22px; cursor: pointer; font-weight: 700; white-space: nowrap; transition: background 0.2s; }
        .osint-router-btn:hover { background: #4db3ff; }
        .osint-router-hint { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: var(--text-muted); }
        .osint-router-hint span { color: var(--accent); }
        .osint-cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .osint-cat { background: #0a1520; border: 1px solid rgba(30,158,255,0.1); padding: 24px 26px; text-decoration: none; display: flex; flex-direction: column; gap: 0; transition: all 0.25s; position: relative; overflow: hidden; }
        .osint-cat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; transform: scaleX(0); transition: transform 0.3s; transform-origin: left; }
        .osint-cat:hover { background: #0d1e30; border-color: rgba(30,158,255,0.25); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .osint-cat:hover::before { transform: scaleX(1); }
        .osint-cat-count { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; margin-bottom: 12px; font-weight: 600; }
        .osint-cat-name { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #c0cfe0; margin-bottom: 8px; letter-spacing: 0.3px; transition: color 0.2s; }
        .osint-cat:hover .osint-cat-name { color: #fff; }
        .osint-cat-desc { font-family: 'Barlow', sans-serif; font-size: 12px; color: #5a7a94; line-height: 1.55; }
        .osint-cat-footer { display: flex; align-items: center; justify-content: flex-end; margin-top: 16px; }
        .osint-cat-arrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #5a7a94; transition: all 0.2s; }
        .osint-cat:hover .osint-cat-arrow { transform: translateX(3px); }
        .osint-view-all { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 2px; padding: 16px; border: 1px solid rgba(30,158,255,0.1); background: rgba(3,6,8,0.4); text-decoration: none; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; transition: all 0.2s; }
        .osint-view-all:hover { background: rgba(30,158,255,0.06); border-color: rgba(30,158,255,0.25); }
        .creds-strip { border-top: 1px solid rgba(30,158,255,0.08); border-bottom: 1px solid rgba(30,158,255,0.08); padding: 14px 40px; background: rgba(3,6,8,0.7); }
        .creds-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 24px; }
        .creds-label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 3px; color: #5a7a94; text-transform: uppercase; white-space: nowrap; }
        .creds-items { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .cred-item { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 2px; color: #7a9bb5; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
        .cred-dot { width: 4px; height: 4px; border-radius: 50%; background: #1e9eff; opacity: 0.5; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes rotateSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes scrollLine { 0%, 100% { opacity: 1; transform: scaleY(1); } 50% { opacity: 0.3; transform: scaleY(0.5); } }
        @keyframes sectionFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .section-header-content { animation: sectionFadeIn 0.35s ease forwards; }
        .animated-grid .article-card { opacity: 0; animation: cardFadeUp 0.4s ease forwards; }
        .animated-grid .article-card:nth-child(1) { animation-delay: 0ms; }
        .animated-grid .article-card:nth-child(2) { animation-delay: 60ms; }
        .animated-grid .article-card:nth-child(3) { animation-delay: 120ms; }
        .animated-grid .article-card:nth-child(4) { animation-delay: 180ms; }
        .animated-grid .article-card:nth-child(5) { animation-delay: 240ms; }
        .animated-grid .article-card:nth-child(6) { animation-delay: 300ms; }
        .animated-grid .article-card:nth-child(n+7) { animation-delay: 360ms; }
        @media (max-width: 1024px) {
          .featured-card { grid-template-columns: 1fr !important; }
          .featured-visual { display: none; }
          .intel-grid { grid-template-columns: 1fr 1fr; }
          .topics-grid { grid-template-columns: repeat(3, 1fr); }
          .footer-top { grid-template-columns: 1fr 1fr; gap: 40px; }
        }
        @media (max-width: 1024px) {
          .osint-header { grid-template-columns: 1fr; gap: 32px; }
          .osint-cats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          nav { padding: 0 16px; }
          .nav-links, .nav-status { display: none; }
          .hamburger { display: flex; }
          .hero { padding: 100px 20px 60px; }
          .hero-tags { gap: 8px; }
          section { padding: 60px 20px; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .featured-grid, .intel-grid { grid-template-columns: 1fr; }
          .osint-section { padding: 60px 20px; }
          .osint-cats { grid-template-columns: 1fr 1fr; }
          .topics-grid { grid-template-columns: 1fr 1fr !important; }
          .topic-card:first-child { grid-column: span 2; min-height: 200px !important; }
          .topic-card { padding: 24px 20px !important; min-height: 160px !important; }
          .topic-name { font-size: 22px !important; }
          .topic-card:first-child .topic-name { font-size: 30px !important; }
          .topic-ghost { font-size: 80px !important; }
          .topic-card:first-child .topic-ghost { font-size: 100px !important; }
          .search-bar-wrap { margin-bottom: 16px; }
          .footer-top { grid-template-columns: 1fr; gap: 32px; }
          footer { padding: 40px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .featured-card { padding: 28px 20px !important; }
          .featured-card .card-title { font-size: 26px !important; }
          .osint-stats { flex-wrap: wrap; gap: 16px; }
          .creds-strip { padding: 10px 16px; }
          .creds-inner { flex-wrap: wrap; gap: 10px; }
          .creds-label { display: none; }
          .articles-toolbar-row { flex-direction: column; align-items: stretch; }
          .articles-toolbar-title { border-right: none !important; border-bottom: 1px solid rgba(30,158,255,0.1); padding: 14px 16px !important; }
          .articles-toolbar-filters { overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid rgba(30,158,255,0.08); flex-wrap: nowrap !important; }
          .articles-toolbar-filters::-webkit-scrollbar { display: none; }
          .articles-toolbar-search { border-left: none !important; border-top: 1px solid rgba(30,158,255,0.08); width: 100%; }
          .articles-toolbar-search input { width: 100% !important; padding: 14px 16px !important; }
          .cat-filter-btn { white-space: nowrap; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 46px !important; }
          .osint-router-row { flex-direction: column; }
          .osint-router-input { border-right: 1px solid rgba(30,158,255,0.2) !important; }
          .osint-router-btn { width: 100%; }
        }
      `}</style>

      <nav>
        <a href="/" className="nav-logo"><div className="nav-logo-text">The Rudd Report</div></a>
        <ul className="nav-links">
          <li><a href="/articles">All Reports</a></li>
          <li><a href="/cybersecurity">Cybersecurity</a></li>
          <li><a href="/intelligence">Intelligence</a></li>
          <li><a href="/geopolitics">Geopolitics</a></li>
          <li><a href="/national-security">National Security</a></li>
          <li><a href="/osint" style={{ color: '#1e9eff' }}>OSINT Hub</a></li>
          <li><a href="/about">About</a></li>
        </ul>
        <div className="hamburger" onClick={() => document.getElementById('mobileMenu')?.classList.toggle('open')}>
          <span /><span /><span />
        </div>
      </nav>

      <div className="mobile-menu" id="mobileMenu">
        <button className="mobile-menu-close" onClick={() => document.getElementById('mobileMenu')?.classList.remove('open')}>✕ Close</button>
        <a href="/">Home</a>
        <a href="/articles">All Reports</a>
        <a href="/cybersecurity">Cybersecurity</a>
        <a href="/intelligence">Intelligence</a>
        <a href="/geopolitics">Geopolitics</a>
        <a href="/national-security">National Security</a>
        <a href="/osint">OSINT Hub</a>
        <a href="/about">About</a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <div className="hero-eyebrow-text">Est. 2026 — Independent Analysis</div>
          </div>
          <h1 className="hero-title">
            The Rudd
            <span className="accent-word">Report</span>
          </h1>
          <p className="hero-subtitle">Independent writing on cybersecurity, national security, and geopolitics.</p>
          <div className="hero-tags">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`hero-tag ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-scroll">
          <div className="hero-scroll-text">Scroll</div>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-label">LATEST</div>
        <div className="ticker-track">
          {[...ARTICLES, ...ARTICLES].map((a, i) => (
            <div className="ticker-item" key={i}>{a.title}</div>
          ))}
        </div>
      </div>

      {/* CREDENTIALS STRIP */}
      <div className="creds-strip">
        <div className="creds-inner">
          <div className="creds-label">Background</div>
          <div className="creds-items">
            <div className="cred-item"><div className="cred-dot" />DHS Cybersecurity</div>
            <div className="cred-item"><div className="cred-dot" />ODNI IC-CAE Program</div>
            <div className="cred-item"><div className="cred-dot" />Cambridge Intelligence Studies</div>
            <div className="cred-item"><div className="cred-dot" />Strategic & Competitive Intelligence</div>
          </div>
        </div>
      </div>

      {/* OSINT HUB FEATURE */}
      <div className="osint-section">
        <div className="osint-inner">
          <div className="osint-header">
            <div>
              <div className="osint-eyebrow">
                <div className="osint-eyebrow-line" />
                <div className="osint-eyebrow-text">Tools</div>
              </div>
              <div className="osint-title">The OSINT <span>Hub</span></div>
              <p className="osint-sub" style={{marginTop: '14px'}}>38 free tools covering companies, networks, live tracking, and more. No account needed.</p>
              <div className="osint-stats" style={{marginBottom: '28px'}} ref={statsRef}>
                <div className="osint-stat"><div className="osint-stat-num">{toolCount}</div><div className="osint-stat-label">Live Tools</div></div>
                <div className="osint-stat"><div className="osint-stat-num">{catCount}</div><div className="osint-stat-label">Categories</div></div>
                <div className="osint-stat"><div className="osint-stat-num">Free</div><div className="osint-stat-label">No Sign-Up</div></div>
              </div>
              <a href="/osint" className="osint-cta">Browse Tools <ChevronRight size={14} /></a>
            </div>
            <div className="osint-right">
              <div className="osint-router-label">Quick Investigate — paste anything</div>
              <div className="osint-router-row">
                <input
                  className="osint-router-input"
                  placeholder="IP, domain, hash, username, company name..."
                  value={osintQuery}
                  onChange={e => setOsintQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const q = osintQuery.trim();
                      if (q) window.location.href = `/osint/company?q=${encodeURIComponent(q)}`;
                    }
                  }}
                />
                <button
                  className="osint-router-btn"
                  onClick={() => { const q = osintQuery.trim(); if (q) window.location.href = `/osint?q=${encodeURIComponent(q)}`; }}
                >
                  Search →
                </button>
              </div>
              <div className="osint-router-hint">
                Auto-routes · <span>IP</span> → Geolocation · <span>domain</span> → WHOIS · <span>hash</span> → Hash Analyzer · <span>company</span> → Intel Dashboard
              </div>
            </div>
          </div>

          <div className="osint-cats">
            {[
              { name: 'Corporate', count: 8, color: '#ffaa00', desc: 'Company filings, SEC records, government contracts, court records, and exec research.', href: '/osint?cat=Corporate' },
              { name: 'Network', count: 7, color: '#1e9eff', desc: 'WHOIS, DNS, IP geolocation, subdomains, SSL certs, and URL redirect tracing.', href: '/osint?cat=Network' },
              { name: 'Cyber', count: 10, color: '#ff4444', desc: 'Hashes, CVEs, email headers, breach lookup, username search, and Google dorks.', href: '/osint?cat=Cyber' },
              { name: 'Live & Tracking', count: 6, color: '#22cc66', desc: 'Satellites, flights, vessels, conflict zones, prediction markets, and news feeds.', href: '/osint?cat=Live+%26+Tracking' },
              { name: 'Economic', count: 4, color: '#00c9b0', desc: 'Currency rates, commodity prices, country economic profiles, and sanctions screening.', href: '/osint?cat=Economic' },
              { name: 'Utilities', count: 4, color: '#b464ff', desc: 'Subnet calculator, JWT decoder, Base64 encoder, and phone number lookup.', href: '/osint?cat=Utilities' },
            ].map(cat => (
              <a key={cat.name} href={cat.href} className="osint-cat" style={{ ['--cat-color' as string]: cat.color }}>
                <style>{`.osint-cat:hover::before { background: ${cat.color}; }`}</style>
                <div className="osint-cat-count" style={{ color: cat.color }}>{cat.count} tools</div>
                <div className="osint-cat-name">{cat.name}</div>
                <div className="osint-cat-desc">{cat.desc}</div>
                <div className="osint-cat-footer">
                  <div className="osint-cat-arrow" style={{ color: cat.color }}>→</div>
                </div>
              </a>
            ))}
          </div>

          <a href="/osint" className="osint-view-all">
            View all 38 tools in the OSINT Hub →
          </a>
        </div>
      </div>

      <div className="divider" />

      {/* FEATURED */}
      <section style={{paddingBottom: '40px'}}>
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">Latest</div>
              <div className="section-title">Featured</div>
            </div>
            <a href="/articles" className="section-link">View All Reports →</a>
          </div>
          <div className="featured-grid">
            {!currentFeatured ? (
              <div className="no-articles">No reports published yet</div>
            ) : (
            <a href={`/articles/${currentFeatured.slug}`} className="article-card featured-card reveal" style={{gridTemplateColumns: '1fr'}}>
              <div>
                <div className="card-meta">
                  <div className="card-category" style={{color: getCategoryColor(currentFeatured.category), borderColor: `${getCategoryColor(currentFeatured.category)}40`, background: `${getCategoryColor(currentFeatured.category)}10`}}>{currentFeatured.category}</div>
                  <div className="card-date">{currentFeatured.date}</div>
                </div>
                <div className="card-title">{currentFeatured.title}</div>
                <div className="card-excerpt">{currentFeatured.excerpt}</div>
                <div className="card-footer">
                  <div className="card-read">Read →</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', color: relevanceColor(currentFeatured.relevance), letterSpacing: '2px' }}>
                    {currentFeatured.relevance}
                  </div>
                </div>
                {featured.length > 1 && (
                  <div className="rotate-dots" onClick={e => e.preventDefault()}>
                    {featured.map((_, i) => (
                      <div key={i} className={`rotate-dot ${i === featuredIndex % featured.length ? 'active' : ''}`} onClick={() => setFeaturedIndex(i)} />
                    ))}
                  </div>
                )}
              </div>
            </a>

            )}
            {/* Two latest non-featured articles */}
            {currentFeatured && latest.filter(a => a.slug !== currentFeatured.slug).slice(0, 2).map((a, i) => (
              <a key={a.slug} href={`/articles/${a.slug}`} className={`article-card reveal reveal-delay-${i + 1}`}>
                <div className="card-meta">
                  <div className="card-category" style={{color: getCategoryColor(a.category), borderColor: `${getCategoryColor(a.category)}40`, background: `${getCategoryColor(a.category)}10`}}>{a.category}</div>
                  <div className="card-date">{a.date}</div>
                </div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">{a.excerpt}</div>
                <div className="card-footer">
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div className="card-read">Read →</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'9px',letterSpacing:'2px',color:'#5a7a94'}}>{getReadingTime(a.content)} MIN</div>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', color: relevanceColor(a.relevance), letterSpacing: '2px' }}>{a.relevance}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES — filtered by category tag + search */}
      <section id="articles-section" style={{paddingTop: '0', paddingBottom: '80px'}}>
        <div className="section-inner">
          {/* Compact toolbar */}
          <div className="articles-toolbar">
            <div className="articles-toolbar-row">
              <div key={activeCategory} className="articles-toolbar-title">
                {searchQuery ? `"${searchQuery}"` : activeCategory === 'All' ? 'All Reports' : `${activeCategory}`}
              </div>
              <div className="articles-toolbar-filters">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={`cat-filter-btn${activeCategory === cat ? ' cat-filter-btn--active' : ''}`}
                    style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '18px 14px', whiteSpace: 'nowrap' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="articles-toolbar-search">
                <input
                  style={{ background: 'transparent', border: 'none', outline: 'none', padding: '18px 16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '11px', letterSpacing: '1px', color: '#c0cfe0', width: '200px' }}
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#5a7a94', cursor: 'pointer', padding: '0 16px', fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px' }}>✕</button>
                )}
              </div>
            </div>
          </div>
          <div key={activeCategory} className="intel-grid animated-grid">
            {filteredArticles.length === 0 ? (
              <div className="no-articles">{searchQuery ? `No reports matching "${searchQuery}"` : 'No reports in this category yet'}</div>
            ) : filteredArticles.map((a, i) => (
              <a key={a.slug} href={`/articles/${a.slug}`} className={`article-card reveal reveal-delay-${(i % 3) + 1}`}>
                <div className="card-meta">
                  <div className="card-category" style={{color: getCategoryColor(a.category), borderColor: `${getCategoryColor(a.category)}40`, background: `${getCategoryColor(a.category)}10`}}>{a.category}</div>
                  <div className="card-date">{a.date}</div>
                </div>
                <div className="card-title">{a.title}</div>
                <div className="card-excerpt">{a.excerpt}</div>
                <div className="card-footer">
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div className="card-read">Read →</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'9px',letterSpacing:'2px',color:'#5a7a94'}}>{getReadingTime(a.content)} MIN</div>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', color: relevanceColor(a.relevance), letterSpacing: '2px' }}>{a.relevance}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand-name">The Rudd Report</div>
              <div className="footer-brand-tag">Independent Analysis</div>
              <p className="footer-desc">Independent coverage of security, intelligence, and world affairs.</p>
            </div>
            <div>
              <div className="footer-col-title">Coverage</div>
              <ul className="footer-links">
                <li><a href="/cybersecurity">Cybersecurity</a></li>
                <li><a href="/intelligence">Intelligence</a></li>
                <li><a href="/geopolitics">Geopolitics</a></li>
                <li><a href="/national-security">National Security</a></li>
                <li><a href="/economic-security">Economic Security</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Navigate</div>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="/articles">All Reports</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Connect</div>
              <ul className="footer-links">
                <li><a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
                <li><a href="https://www.linkedin.com/in/kyle-rudd-68209b252/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report — All Rights Reserved</div>
          </div>
        </div>
      </footer>
    </>
  );
}