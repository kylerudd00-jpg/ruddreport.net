'use client';
import { useEffect, useState } from 'react';

type TocItem = { id: string; text: string };

export default function TocSidebar({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="toc-sidebar">
      <div className="toc-label">Contents</div>
      <ul className="toc-list">
        {toc.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id} className="toc-item">
              <a
                href={`#${item.id}`}
                style={active ? {
                  color: '#1e9eff',
                  fontWeight: 700,
                  borderLeftColor: '#1e9eff',
                  paddingLeft: '16px',
                  letterSpacing: '1.5px',
                } : undefined}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
