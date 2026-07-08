'use client';
import { useReveal } from '../components/useReveal';

const EXPERIENCE = [
  {
    org: 'CISA · Office of the National Coordinator',
    role: 'HS-POWER Fellow (ORISE)',
    years: '2026–',
    current: true,
    detail: 'Supporting critical-infrastructure coordination and Sector Risk Management Agency work at the Cybersecurity and Infrastructure Security Agency. Built a coordination flowchart mapping how agencies, sector teams, and liaison offices interconnect; interviewed sector liaisons to identify communication gaps and briefed recommendations to agency leadership.',
  },
  {
    org: 'University of Cambridge',
    role: 'International Security & Intelligence Programme',
    years: '2025',
    detail: 'Full scholarship recipient. Evaluated U.S.–UK intelligence-sharing frameworks for disrupting transnational cybercrime networks and improving real-time coordination across allied systems.',
  },
  {
    org: 'ODNI · IC-CAE Program',
    role: 'IC-CAE Scholar',
    years: '2024–',
    detail: 'Selected by the Office of the Director of National Intelligence for intelligence analysis and cybersecurity research, as part of a small cohort of scholars bridging academia and the intelligence community.',
  },
  {
    org: 'Dept. of Homeland Security',
    role: 'Intelligence & Cybercrime Intern',
    years: '2024',
    detail: 'Supported cross-border cybercrime investigations and inter-agency intelligence exchange operations.',
  },
  {
    org: 'Afghanistan War Commission',
    role: 'Research Contributor',
    years: '2024',
    detail: 'Contributed research to the official commission examining the full scope of U.S. involvement in Afghanistan.',
  },
];

const COVERAGE = [
  {
    name: 'Cybersecurity',
    desc: 'State-sponsored threat actors, critical-infrastructure vulnerabilities, and offensive cyber operations.',
  },
  {
    name: 'Intelligence',
    desc: 'Intelligence-sharing frameworks, Five Eyes coordination, and the tradecraft behind useful assessment.',
  },
  {
    name: 'U.S. Foreign Policy',
    desc: 'Alliances, strategic competition with China and Russia, and economic coercion.',
  },
];

export default function About() {
  useReveal();

  return (
    <>
      <style>{`
        .ab { padding-top: 70px; }

        /* ── HERO ── */
        .ab-hero { padding: 72px 40px 72px; border-bottom: 1px solid var(--border); }
        .ab-hero-inner { max-width: 1280px; margin: 0 auto; }
        .ab-eyebrow {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
          animation: fadeUp 0.6s var(--ease-expo) 0.05s both;
        }
        .ab-eyebrow::after { content: ''; height: 1px; flex: 1; background: var(--border); }
        .ab-hero h1 {
          font-family: var(--font-display); font-size: clamp(48px, 7.5vw, 108px);
          font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em;
          line-height: 0.95; color: #fff; margin-bottom: 14px;
          animation: fadeUp 0.6s var(--ease-expo) 0.12s both;
        }
        .ab-role {
          font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-secondary); margin-bottom: 28px;
          animation: fadeUp 0.6s var(--ease-expo) 0.18s both;
        }
        .ab-bio {
          font-size: 17px; line-height: 1.75; color: var(--text-secondary);
          max-width: 640px; margin-bottom: 32px;
          animation: fadeUp 0.6s var(--ease-expo) 0.24s both;
        }
        .ab-bio strong { color: var(--text-primary); font-weight: 600; }
        .ab-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 36px; animation: fadeUp 0.6s var(--ease-expo) 0.3s both; }
        .ab-tag {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          color: var(--text-secondary); border: 1px solid var(--border-bright);
          padding: 7px 13px; text-transform: uppercase;
        }
        .ab-socials { display: flex; gap: 10px; flex-wrap: wrap; animation: fadeUp 0.6s var(--ease-expo) 0.36s both; }
        .ab-btn {
          font-family: var(--font-mono); font-size: 12px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
          padding: 13px 24px; border: 1px solid var(--border-bright);
          color: var(--text-primary); display: inline-flex; align-items: center; gap: 8px;
        }
        .ab-btn:hover { border-color: var(--accent); color: var(--accent); }
        .ab-btn--primary { background: var(--accent); border-color: var(--accent); color: #000; }
        .ab-btn--primary:hover { background: #4db3ff; color: #000; }

        /* ── SECTIONS ── */
        .ab-section { padding: 80px 40px; }
        .ab-section--alt { background: var(--bg-secondary); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .ab-inner { max-width: 1280px; margin: 0 auto; }
        .ab-sh {
          display: flex; align-items: baseline; gap: 18px;
          padding-bottom: 18px; margin-bottom: 36px;
          border-bottom: 1px solid var(--border-bright);
        }
        .ab-sh-idx { font-family: var(--font-mono); font-size: 14px; color: var(--accent); }
        .ab-sh h2 {
          font-family: var(--font-display); font-size: 24px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.01em; color: #fff;
        }

        /* Experience register */
        .ab-xp {
          display: grid; grid-template-columns: 90px 260px 1fr;
          gap: 24px; align-items: baseline;
          padding: 26px 8px; border-bottom: 1px solid var(--border);
        }
        .ab-xp:first-of-type { border-top: 1px solid var(--border); }
        .ab-xp-years { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
        .ab-xp-org {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em;
          text-transform: uppercase; color: var(--text-secondary); line-height: 1.6;
        }
        .ab-xp-now {
          display: inline-block; font-family: var(--font-mono); font-size: 12px;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: var(--accent); color: #000; font-weight: 600;
          padding: 2px 8px; margin-bottom: 8px;
        }
        .ab-xp h3 {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          color: var(--text-primary); line-height: 1.25; margin-bottom: 8px;
        }
        .ab-xp-detail { font-size: 14.5px; line-height: 1.7; color: var(--text-secondary); max-width: 680px; }

        /* About-the-site */
        .ab-site { max-width: 720px; }
        .ab-site p { font-size: 16.5px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px; }
        .ab-site p strong { color: var(--text-primary); font-weight: 600; }
        .ab-lead {
          font-family: var(--font-display); font-size: clamp(22px, 2.6vw, 32px);
          font-weight: 700; line-height: 1.3; color: var(--text-primary);
          margin-bottom: 28px; letter-spacing: -0.01em;
        }

        /* Coverage rows */
        .ab-cov {
          display: grid; grid-template-columns: 56px 260px 1fr;
          gap: 24px; align-items: baseline;
          padding: 24px 8px; border-bottom: 1px solid var(--border);
        }
        .ab-cov:first-of-type { border-top: 1px solid var(--border); }
        .ab-cov-idx { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }
        .ab-cov h3 {
          font-family: var(--font-display); font-size: 20px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0; color: var(--text-primary);
        }
        .ab-cov-desc { font-size: 14.5px; line-height: 1.65; color: var(--text-secondary); }

        /* Footer */
        .ab-foot { border-top: 1px solid var(--border); padding: 28px 40px; }
        .ab-foot-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.04em;
          color: var(--text-muted); text-transform: uppercase;
        }

        @media (max-width: 900px) {
          .ab-xp { grid-template-columns: 1fr; gap: 8px; padding: 22px 4px; }
          .ab-cov { grid-template-columns: 28px 1fr; }
          .ab-cov-desc { grid-column: 2; }
        }
        @media (max-width: 768px) {
          .ab-hero { padding: 48px 16px; }
          .ab-section { padding: 56px 16px; }
          .ab-foot { padding: 24px 16px; }
          .ab-foot-inner { flex-direction: column; align-items: flex-start; }
          .ab-btn { padding: 14px 20px; }
        }
      `}</style>

      <main id="main" className="ab">
        <div className="ab-hero">
          <div className="ab-hero-inner">
            <p className="ab-eyebrow">About · The Rudd Report</p>
            <h1>Kyle Rudd</h1>
            <p className="ab-role">Intelligence researcher · CISA HS-POWER Fellow</p>
            <p className="ab-bio">
              Kyle Rudd researches how the United States defends its <strong>critical infrastructure</strong>.
              He is currently an HS-POWER Fellow at CISA&apos;s Office of the National Coordinator, studying
              how federal agencies, sector teams, and liaison offices coordinate. Earlier work ran through
              the University of Cambridge, the Department of Homeland Security, and the Afghanistan War Commission.
            </p>
            <div className="ab-tags">
              <span className="ab-tag">CISA · HS-POWER</span>
              <span className="ab-tag">Cambridge Scholar</span>
              <span className="ab-tag">ODNI IC-CAE</span>
              <span className="ab-tag">IR + Economics</span>
              <span className="ab-tag">Intelligence Studies</span>
            </div>
            <div className="ab-socials">
              <a href="https://www.linkedin.com/in/kyle-rudd-68209b252/" target="_blank" rel="noopener noreferrer" className="ab-btn ab-btn--primary" aria-label="LinkedIn (opens in new tab)"><span aria-hidden="true">↗</span> LinkedIn</a>
              <a href="https://x.com/KyleRudd44" target="_blank" rel="noopener noreferrer" className="ab-btn" aria-label="X / Twitter (opens in new tab)"><span aria-hidden="true">↗</span> X / Twitter</a>
            </div>
          </div>
        </div>

        {/* 01 — EXPERIENCE */}
        <section className="ab-section" aria-labelledby="ab-h-xp">
          <div className="ab-inner">
            <div className="ab-sh rv">
              <span className="ab-sh-idx" aria-hidden="true">01</span>
              <h2 id="ab-h-xp">Experience</h2>
            </div>
            {EXPERIENCE.map(xp => (
              <div key={xp.role} className="ab-xp rv">
                <span className="ab-xp-years">{xp.years}</span>
                <span className="ab-xp-org">{xp.org}</span>
                <div>
                  {xp.current && <span className="ab-xp-now">Current</span>}
                  <h3>{xp.role}</h3>
                  <p className="ab-xp-detail">{xp.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 02 — ABOUT THE SITE */}
        <section className="ab-section ab-section--alt" aria-labelledby="ab-h-site">
          <div className="ab-inner">
            <div className="ab-sh rv">
              <span className="ab-sh-idx" aria-hidden="true">02</span>
              <h2 id="ab-h-site">About this site</h2>
            </div>
            <div className="ab-site rv">
              <p className="ab-lead">
                The most consequential decisions in the world are made with information most people never see.
              </p>
              <p>
                The Rudd Report tries to close a small part of that gap: plain-language analysis of
                cybersecurity, intelligence, and foreign policy, written by someone who has worked inside
                a few of the systems being analyzed. There is no staff and no sponsor. One writer,
                publishing when there is something worth saying.
              </p>
              <p>
                Kyle is pursuing dual degrees in <strong>International Relations and Economics</strong> with
                a minor in Intelligence Studies at the University of South Florida&apos;s Judy Genshaft Honors
                College, alongside his work supporting CISA&apos;s critical-infrastructure mission.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — COVERAGE */}
        <section className="ab-section" aria-labelledby="ab-h-cov">
          <div className="ab-inner">
            <div className="ab-sh rv">
              <span className="ab-sh-idx" aria-hidden="true">03</span>
              <h2 id="ab-h-cov">What I cover</h2>
            </div>
            {COVERAGE.map((c, i) => (
              <div key={c.name} className="ab-cov rv">
                <span className="ab-cov-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{c.name}</h3>
                <p className="ab-cov-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="ab-foot">
          <div className="ab-foot-inner">
            <span>© 2026 The Rudd Report</span>
            <span>Independent publication — not a U.S. government website</span>
          </div>
        </footer>
      </main>
    </>
  );
}
