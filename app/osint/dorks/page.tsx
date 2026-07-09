'use client';
import { useState } from 'react';

interface DorkFields {
  site: string;
  filetype: string;
  inurl: string;
  intitle: string;
  intext: string;
  exact: string;
  exclude: string;
  orTerms: string;
  dateRange: string;
}

const EMPTY_FIELDS: DorkFields = {
  site: '',
  filetype: '',
  inurl: '',
  intitle: '',
  intext: '',
  exact: '',
  exclude: '',
  orTerms: '',
  dateRange: '',
};

const FILETYPES = ['', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'sql', 'log', 'json', 'xml', 'csv', 'env', 'bak', 'zip'];
const DATE_RANGES = [
  { label: 'Any time', value: '' },
  { label: 'Past day', value: 'd1' },
  { label: 'Past week', value: 'w1' },
  { label: 'Past month', value: 'm1' },
  { label: 'Past year', value: 'y1' },
];

function buildQuery(fields: DorkFields): string {
  const parts: string[] = [];
  if (fields.site.trim()) parts.push(`site:${fields.site.trim()}`);
  if (fields.filetype) parts.push(`filetype:${fields.filetype}`);
  if (fields.inurl.trim()) parts.push(`inurl:${fields.inurl.trim()}`);
  if (fields.intitle.trim()) parts.push(`intitle:${fields.intitle.trim()}`);
  if (fields.intext.trim()) parts.push(`intext:${fields.intext.trim()}`);
  if (fields.exact.trim()) parts.push(`"${fields.exact.trim()}"`);
  if (fields.exclude.trim()) parts.push(`-${fields.exclude.trim()}`);
  if (fields.orTerms.trim()) {
    const orParts = fields.orTerms.split(/\s+/).filter(Boolean);
    if (orParts.length > 1) parts.push(orParts.join(' OR '));
    else if (orParts.length === 1) parts.push(orParts[0]);
  }
  return parts.join(' ');
}

interface Template {
  name: string;
  desc: string;
  category: string;
  apply: (target: string) => Partial<DorkFields>;
  previewFn: (target: string) => string;
}

const TEMPLATES: Template[] = [
  {
    name: 'Find Login Pages',
    desc: 'Discover exposed authentication portals and admin panels',
    category: 'Access',
    apply: (t) => ({ site: t, inurl: 'login OR inurl:signin OR inurl:admin' }),
    previewFn: (t) => `site:${t || '[domain]'} inurl:login OR inurl:signin OR inurl:admin`,
  },
  {
    name: 'Exposed Config Files',
    desc: 'Find exposed environment and configuration files',
    category: 'Files',
    apply: (t) => ({ site: t, filetype: 'env', inurl: '', intext: '' }),
    previewFn: (t) => `site:${t || '[domain]'} filetype:env OR filetype:config OR filetype:yml`,
  },
  {
    name: 'Public Documents',
    desc: 'Index of public-facing PDFs and documents',
    category: 'Files',
    apply: (t) => ({ site: t, filetype: 'pdf' }),
    previewFn: (t) => `site:${t || '[domain]'} filetype:pdf OR filetype:doc`,
  },
  {
    name: 'Find Email Addresses',
    desc: 'Surface email addresses published on the target domain',
    category: 'Recon',
    apply: (t) => ({ site: t, intext: `"@${t || '[domain]'}"` }),
    previewFn: (t) => `site:${t || '[domain]'} intext:"@${t || '[domain]'}"`,
  },
  {
    name: 'SQL Errors',
    desc: 'Identify pages leaking database error messages',
    category: 'Vulnerabilities',
    apply: (t) => ({ site: t, intext: '"sql syntax" OR intext:"mysql error"' }),
    previewFn: (t) => `site:${t || '[domain]'} intext:"sql syntax" OR intext:"mysql error"`,
  },
  {
    name: 'Open Directories',
    desc: 'Find exposed directory listings on the target',
    category: 'Access',
    apply: (t) => ({ site: t, intitle: '"index of"' }),
    previewFn: (t) => `intitle:"index of" site:${t || '[domain]'}`,
  },
  {
    name: 'Pastebin Leaks',
    desc: 'Search Pastebin for mentions of the target company',
    category: 'Leaks',
    apply: (t) => ({ site: 'pastebin.com', exact: t || '[company name]' }),
    previewFn: (t) => `site:pastebin.com "${t || '[company name]'}"`,
  },
  {
    name: 'GitHub Code',
    desc: 'Find secrets and credentials committed to GitHub',
    category: 'Leaks',
    apply: (t) => ({ site: 'github.com', exact: t || '[company name]', inurl: '', intext: 'password OR secret OR key' }),
    previewFn: (t) => `site:github.com "${t || '[company name]'}" password OR secret OR key`,
  },
  {
    name: 'LinkedIn Employees',
    desc: 'Enumerate employees via LinkedIn profiles',
    category: 'Recon',
    apply: (t) => ({ site: 'linkedin.com/in', exact: t || '[company name]' }),
    previewFn: (t) => `site:linkedin.com/in "${t || '[company name]'}"`,
  },
  {
    name: 'News & Press',
    desc: 'Search major financial and news outlets for coverage',
    category: 'Media',
    apply: (t) => ({ exact: t || '[company name]', site: 'reuters.com OR site:bloomberg.com OR site:wsj.com' }),
    previewFn: (t) => `"${t || '[company name]'}" site:reuters.com OR site:bloomberg.com OR site:wsj.com`,
  },
  {
    name: 'Court Records',
    desc: 'Find litigation and legal filings involving the target',
    category: 'Legal',
    apply: (t) => ({ exact: t || '[company name]', site: 'courtlistener.com OR site:pacer.gov' }),
    previewFn: (t) => `"${t || '[company name]'}" site:courtlistener.com OR site:pacer.gov`,
  },
  {
    name: 'Cached Pages',
    desc: "Pull Google's cached version of a target page",
    category: 'Archive',
    apply: (t) => ({ inurl: `cache:${t || '[domain]'}` }),
    previewFn: (t) => `cache:${t || '[domain]'}`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Access: '#ff6b35',
  Files: '#1e9eff',
  Recon: '#c084fc',
  Vulnerabilities: '#ff3a3a',
  Leaks: '#ffaa00',
  Media: '#4db8ff',
  Legal: '#f472b6',
  Archive: '#34d399',
};

export default function DorkBuilder() {
  const [target, setTarget] = useState('');
  const [fields, setFields] = useState<DorkFields>(EMPTY_FIELDS);
  const [copied, setCopied] = useState(false);

  const query = buildQuery(fields);
  const encodedQuery = encodeURIComponent(query);

  const dateParam = fields.dateRange ? `&tbs=qdr:${fields.dateRange}` : '';
  const googleUrl = `https://www.google.com/search?q=${encodedQuery}${dateParam}`;

  function setField(key: keyof DorkFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function applyTemplate(t: Template) {
    const partial = t.apply(target);
    setFields({ ...EMPTY_FIELDS, ...partial });
  }

  function handleCopy() {
    if (!query) return;
    navigator.clipboard.writeText(query).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleReset() {
    setFields(EMPTY_FIELDS);
    setTarget('');
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Layout ── */
        .page-wrap { padding-top: 70px; }
        .back-bar { padding: 16px 40px; border-bottom: 1px solid var(--border); }
        .back-link { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--text-muted); text-decoration: none; text-transform: uppercase; transition: color 0.3s; }
        .back-link:hover { color: var(--accent); }

        /* ── Hero ── */
        .tool-hero { padding: 60px 40px 40px; border-bottom: 1px solid var(--border); }
        .tool-hero-inner { max-width: 1100px; margin: 0 auto; }
        .tool-eyebrow { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .tool-eyebrow-line { width: 40px; height: 1px; background: var(--accent); }
        .tool-eyebrow-text { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
        .tool-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 52px); font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; }
        .tool-desc { font-size: 15px; font-weight: 400; color: var(--text-secondary); line-height: 1.8; max-width: 720px; }

        /* ── Builder ── */
        .builder-wrap { max-width: 1100px; margin: 0 auto; padding: 48px 40px; }
        .target-row { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; padding: 20px 24px; background: rgba(30,158,255,0.05); border: 1px solid var(--border-bright); }
        .target-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; white-space: nowrap; }
        .target-input { flex: 1; background: none; border: none; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 1px; }
        .target-input::placeholder { color: var(--text-muted); }
        .target-hint { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); white-space: nowrap; }

        .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px; }
        .field-block { background: var(--bg-card); border: 1px solid var(--border); padding: 20px 24px; }
        .field-block.full { grid-column: 1 / -1; }
        .field-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .field-label-op { color: var(--accent); font-size: 12px; }
        .field-input { width: 100%; background: none; border: none; border-bottom: 1px solid var(--border-bright); padding: 8px 0; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 1px; transition: border-color 0.3s; }
        .field-input:focus { border-bottom-color: var(--accent); }
        .field-input::placeholder { color: var(--text-muted); font-size: 12px; }
        .field-select { width: 100%; background: var(--bg-card); border: none; border-bottom: 1px solid var(--border-bright); padding: 8px 0; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); letter-spacing: 1px; cursor: pointer; transition: border-color 0.3s; appearance: none; }
        .field-select:focus { border-bottom-color: var(--accent); }
        .field-select option { background: var(--bg-card); }

        /* ── Preview ── */
        .preview-block { background: var(--bg-secondary); border: 1px solid var(--border-bright); padding: 24px; margin-bottom: 2px; }
        .preview-label { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .preview-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .preview-query { font-family: var(--font-mono); font-size: clamp(13px, 1.5vw, 16px); color: var(--text-primary); line-height: 1.7; word-break: break-all; min-height: 52px; user-select: all; cursor: text; }
        .preview-query.empty { color: var(--text-muted); font-size: 12px; letter-spacing: 1px; }

        /* ── Actions ── */
        .actions-row { display: flex; gap: 2px; }
        .action-btn { flex: 1; font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 18px 24px; cursor: pointer; border: none; transition: all 0.3s; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .action-btn.primary { background: var(--accent); color: #fff; }
        .action-btn.primary:hover { background: #4db8ff; }
        .action-btn.secondary { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-bright); }
        .action-btn.secondary:hover { color: var(--accent); border-color: var(--accent); }
        .action-btn.tertiary { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-bright); }
        .action-btn.tertiary:hover { color: #ff6b35; border-color: rgba(255,107,53,0.3); }
        .action-btn:disabled, .action-btn.disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }

        /* ── Templates ── */
        .templates-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 80px; }
        .section-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-top: 8px; }
        .section-title { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--text-secondary); text-transform: uppercase; }
        .section-line { flex: 1; height: 1px; background: var(--border); }
        .templates-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .template-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; cursor: pointer; transition: all 0.25s; position: relative; overflow: hidden; }
        .template-card:hover { border-color: var(--border-bright); background: var(--bg-card-hover); }
        .template-card-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: 0; transition: opacity 0.25s; }
        .template-card:hover .template-card-bar { opacity: 1; }
        .template-cat { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; font-weight: 500; }
        .template-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: 0.05em; margin-bottom: 8px; }
        .template-desc { font-family: var(--font-display); font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 14px; }
        .template-preview { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); letter-spacing: 0.5px; word-break: break-all; line-height: 1.6; }
        .template-apply { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--accent); text-transform: uppercase; margin-top: 14px; opacity: 0; transition: opacity 0.25s; }
        .template-card:hover .template-apply { opacity: 1; }

        /* ── Footer ── */
        footer { border-top: 1px solid var(--border); padding: 40px; background: var(--bg-secondary); margin-top: 0; }
        .footer-bottom { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.05em; color: var(--text-muted); }
        .footer-copy span { color: var(--accent); }

        /* ── Mobile ── */
        @media (max-width: 900px) {
          .templates-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .tool-hero { padding: 40px 20px 30px; }
          .builder-wrap { padding: 32px 20px; }
          .target-row { flex-wrap: wrap; gap: 8px; }
          .target-hint { display: none; }
          .fields-grid { grid-template-columns: 1fr; }
          .field-block.full { grid-column: 1; }
          .actions-row { flex-wrap: wrap; }
          .action-btn { flex: none; width: 100%; }
          .templates-section { padding: 0 20px 60px; }
          .templates-grid { grid-template-columns: 1fr; }
          footer { padding: 30px 20px; }
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
          .back-bar { padding: 14px 20px; }
        }
      `}</style>

      <main id="main" className="page-wrap">
        {/* ── Back Bar ── */}
        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>

        {/* ── Hero ── */}
        <div className="tool-hero">
          <div className="tool-hero-inner">
            <div className="tool-eyebrow">
              <div className="tool-eyebrow-line" aria-hidden="true" />
              <div className="tool-eyebrow-text">Search Intelligence</div>
            </div>
            <h1 className="tool-title">Google Dork Builder</h1>
            <p className="tool-desc">Google indexes far more than most people realize — exposed files, login portals, internal documents, and employee directories are all findable with the right search syntax. Build advanced Google search operators here to surface sensitive information about any domain without writing a single line of code.</p>
          </div>
        </div>

        {/* ── Builder ── */}
        <div className="builder-wrap">

          {/* Target Row */}
          <div className="target-row">
            <div className="target-label">Target</div>
            <input
              className="target-input"
              aria-label="Target domain or company name"
              placeholder="tesla.com  or  Tesla Inc  — auto-fills templates below"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
            <div className="target-hint">Domain or company name</div>
          </div>

          {/* Fields Grid */}
          <div className="fields-grid">

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">site:</span> Restrict to domain</div>
              <input
                className="field-input"
                aria-label="site: restrict to domain"
                placeholder="e.g. tesla.com"
                value={fields.site}
                onChange={e => setField('site', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">filetype:</span> File extension</div>
              <select
                className="field-select"
                aria-label="filetype: file extension"
                value={fields.filetype}
                onChange={e => setField('filetype', e.target.value)}
              >
                {FILETYPES.map(ft => (
                  <option key={ft} value={ft}>{ft || '— any file type —'}</option>
                ))}
              </select>
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">inurl:</span> URL contains</div>
              <input
                className="field-input"
                aria-label="inurl: URL contains"
                placeholder="e.g. login OR admin"
                value={fields.inurl}
                onChange={e => setField('inurl', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">intitle:</span> Page title contains</div>
              <input
                className="field-input"
                aria-label="intitle: page title contains"
                placeholder='e.g. "index of"'
                value={fields.intitle}
                onChange={e => setField('intitle', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">intext:</span> Page body contains</div>
              <input
                className="field-input"
                aria-label="intext: page body contains"
                placeholder='e.g. "sql syntax"'
                value={fields.intext}
                onChange={e => setField('intext', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">" "</span> Exact phrase</div>
              <input
                className="field-input"
                aria-label="Exact phrase"
                placeholder="e.g. confidential internal use only"
                value={fields.exact}
                onChange={e => setField('exact', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">-</span> Exclude term</div>
              <input
                className="field-input"
                aria-label="Exclude term"
                placeholder="e.g. careers"
                value={fields.exclude}
                onChange={e => setField('exclude', e.target.value)}
              />
            </div>

            <div className="field-block">
              <div className="field-label"><span className="field-label-op">OR</span> Alternative terms</div>
              <input
                className="field-input"
                aria-label="OR alternative terms"
                placeholder="e.g. password secret key token"
                value={fields.orTerms}
                onChange={e => setField('orTerms', e.target.value)}
              />
            </div>

            <div className="field-block full">
              <div className="field-label"><span className="field-label-op">tbs:</span> Date range</div>
              <select
                className="field-select"
                aria-label="tbs: date range"
                value={fields.dateRange}
                onChange={e => setField('dateRange', e.target.value)}
              >
                {DATE_RANGES.map(dr => (
                  <option key={dr.value} value={dr.value}>{dr.label}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Live Preview */}
          <div className="preview-block">
            <div className="preview-label">Live Query Preview</div>
            {query ? (
              <div className="preview-query">{query}</div>
            ) : (
              <div className="preview-query empty">Fill fields above — query will appear here in real time</div>
            )}
          </div>

          {/* Actions */}
          <div className="actions-row">
            <a
              href={query ? googleUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`action-btn primary${!query ? ' disabled' : ''}`}
              onClick={e => !query && e.preventDefault()}
            >
              Search Google →
            </a>
            <button
              type="button"
              className={`action-btn secondary${!query ? ' disabled' : ''}`}
              onClick={handleCopy}
              disabled={!query}
            >
              {copied ? 'Copied ✓' : 'Copy Query'}
            </button>
            <button type="button" className="action-btn tertiary" onClick={handleReset}>
              Reset
            </button>
          </div>

        </div>

        {/* ── Templates ── */}
        <div className="templates-section">
          <div className="section-header">
            <div className="section-title">Dork Templates</div>
            <div className="section-line" />
          </div>
          <div className="templates-grid">
            {TEMPLATES.map((tmpl) => {
              const color = CATEGORY_COLORS[tmpl.category] || '#1e9eff';
              return (
                <div
                  key={tmpl.name}
                  className="template-card"
                  onClick={() => applyTemplate(tmpl)}
                >
                  <div className="template-card-bar" style={{ background: color }} />
                  <div className="template-cat" style={{ color }}>{tmpl.category}</div>
                  <div className="template-name">{tmpl.name}</div>
                  <div className="template-desc">{tmpl.desc}</div>
                  <div className="template-preview">{tmpl.previewFn(target)}</div>
                  <div className="template-apply">Click to load →</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <footer>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 The Rudd Report</div>
          </div>
        </footer>
      </main>
    </>
  );
}
