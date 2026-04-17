import fs from 'fs';

const BASE = 'C:/Users/kerud/ruddreport';

// =========================================================
// TASK 1: Remove nav HTML blocks
// =========================================================

function removeInlineNav(content) {
  // Remove <nav>...</nav> block (with indentation)
  // Handles both multi-line and inline forms
  content = content.replace(/\n[ \t]*<nav>[\s\S]*?<\/nav>\n/g, '\n');

  // Remove <div className="mobile-menu"...>...</div> block
  // Need to handle nested divs properly - find by matching the opening tag
  // The mobile-menu div is always at the page level, not deeply nested
  content = content.replace(/\n[ \t]*<div className="mobile-menu"[^>]*>[\s\S]*?<\/div>\n/g, '\n');

  return content;
}

// =========================================================
// TASK 1: Remove nav CSS
// =========================================================

// Remove specific CSS rules from either `<style>{...}` or const STYLE = `...`
function removeNavCSS(content) {
  const patterns = [
    // nav { ... }
    /[ \t]*nav \{[^\}]*\}\n/g,
    // .nav-logo { ... }
    /[ \t]*\.nav-logo \{[^\}]*\}\n/g,
    // .nav-logo-text { ... }
    /[ \t]*\.nav-logo-text \{[^\}]*\}\n/g,
    // .nav-links { ... }
    /[ \t]*\.nav-links \{[^\}]*\}\n/g,
    // .nav-links a { ... }
    /[ \t]*\.nav-links a \{[^\}]*\}\n/g,
    // .nav-links a:hover { ... }
    /[ \t]*\.nav-links a:hover \{[^\}]*\}\n/g,
    // .hamburger { ... }
    /[ \t]*\.hamburger \{[^\}]*\}\n/g,
    // .hamburger span { ... }
    /[ \t]*\.hamburger span \{[^\}]*\}\n/g,
    // .mobile-menu { ... }
    /[ \t]*\.mobile-menu \{[^\}]*\}\n/g,
    // .mobile-menu.open { ... }
    /[ \t]*\.mobile-menu\.open \{[^\}]*\}\n/g,
    // .mobile-menu a { ... }
    /[ \t]*\.mobile-menu a \{[^\}]*\}\n/g,
    // .mobile-menu-close { ... }
    /[ \t]*\.mobile-menu-close \{[^\}]*\}\n/g,
  ];
  for (const pat of patterns) {
    content = content.replace(pat, '');
  }
  // Also remove from compact media query blocks e.g.:
  // @media (...) { nav { ... } .nav-links { ... } .hamburger { ... } ... }
  // Remove nav/nav-links/hamburger parts from media query rules
  content = content.replace(/\s*nav \{ padding: 0 16px; \}/g, '');
  content = content.replace(/\s*\.nav-links \{ display: none; \}/g, '');
  content = content.replace(/\s*\.hamburger \{ display: flex; \}/g, '');
  return content;
}

// =========================================================
// TASK 2: Standardize footer
// =========================================================

// Standard footer CSS - for inline <style> blocks (8 spaces indent)
const STD_FOOTER_CSS_8 = `        footer { border-top: 1px solid rgba(30,158,255,0.08); padding: 28px 40px; background: #030608; }
        .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
        .footer-class { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1a3a24; }`;

// For const STYLE = `` blocks (2 spaces indent)
const STD_FOOTER_CSS_2 = `  footer { border-top: 1px solid rgba(30,158,255,0.08); padding: 28px 40px; background: #030608; }
  .footer-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .footer-copy { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; color: #3d5870; }
  .footer-class { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: #1a3a24; }`;

const STD_FOOTER_HTML = `        <footer>
          <div className="footer-inner">
            <div className="footer-copy">© 2026 The Rudd Report</div>
            <div className="footer-class">UNCLASSIFIED // FOR PUBLIC RELEASE</div>
          </div>
        </footer>`;

// Standard footer responsive CSS to add to media queries
const FOOTER_RESPONSIVE_8 = `          footer { padding: 20px 16px; }
          .footer-inner { flex-direction: column; gap: 8px; text-align: center; }`;

const FOOTER_RESPONSIVE_2 = `    footer { padding: 20px 16px; }
    .footer-inner { flex-direction: column; gap: 8px; text-align: center; }`;

// =========================================================
// TASK 3: Back bar
// =========================================================

const BACK_BAR_HTML = `        <div className="back-bar">
          <a href="/osint" className="back-link">← Back to OSINT Hub</a>
        </div>`;

const BACK_BAR_CSS_8 = `        .back-bar { padding: 14px 40px; border-bottom: 1px solid rgba(30,158,255,0.07); }
        .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
        .back-link:hover { color: #1e9eff; }`;

const BACK_BAR_CSS_2 = `  .back-bar { padding: 14px 40px; border-bottom: 1px solid rgba(30,158,255,0.07); }
  .back-link { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #3d5870; text-decoration: none; text-transform: uppercase; transition: color 0.2s; }
  .back-link:hover { color: #1e9eff; }`;

// =========================================================
// HELPER: Replace old footer CSS with standard
// =========================================================

function replaceFooterCSS(content, indent8 = true) {
  // Replace any existing footer/footer-inner/footer-bottom/footer-copy/footer-class CSS rules
  // These may span multiple lines
  // Strategy: remove old footer CSS, add new

  const indent = indent8 ? '        ' : '  ';
  const stdCSS = indent8 ? STD_FOOTER_CSS_8 : STD_FOOTER_CSS_2;

  // Remove various footer CSS patterns
  const footerCSSPatterns = [
    /[ \t]*footer \{[^\}]*\}\n/g,
    /[ \t]*\.footer-bottom \{[^\}]*\}\n/g,
    /[ \t]*\.footer-inner \{[^\}]*\}\n/g,
    /[ \t]*\.footer-copy \{[^\}]*\}\n/g,
    /[ \t]*\.footer-copy span \{[^\}]*\}\n/g,
    /[ \t]*\.footer-class \{[^\}]*\}\n/g,
    /[ \t]*\.footer-text \{[^\}]*\}\n/g,
  ];

  // We need to insert the new CSS where the old footer CSS was
  // Find the first footer-related CSS rule position
  const firstFooterMatch = content.search(/[ \t]*footer \{/);
  if (firstFooterMatch === -1) {
    // No footer CSS exists - we need to add it
    // Add before @keyframes or before the closing of the style block
    const insertBefore = /[ \t]*@keyframes blink/;
    const beforeMatch = content.search(insertBefore);
    if (beforeMatch !== -1) {
      content = content.substring(0, beforeMatch) + stdCSS + '\n' + content.substring(beforeMatch);
    }
    return content;
  }

  // Replace all old footer CSS rules
  for (const pat of footerCSSPatterns) {
    content = content.replace(pat, '');
  }

  // Now insert the new CSS at the right position (after last non-footer CSS before @keyframes/media)
  // Find position to insert: before @keyframes or before closing of style
  const insertBefore2 = content.search(/[ \t]*@keyframes blink/);
  if (insertBefore2 !== -1) {
    content = content.substring(0, insertBefore2) + stdCSS + '\n' + content.substring(insertBefore2);
  } else {
    // Try before the media query
    const mediaMatch = content.search(/[ \t]*@media \(max-width: 768px\)/);
    if (mediaMatch !== -1) {
      content = content.substring(0, mediaMatch) + stdCSS + '\n' + content.substring(mediaMatch);
    }
  }

  return content;
}

function replaceFooterHTML(content) {
  // Find and replace the footer HTML block
  // Look for <footer>...</footer>
  const footerStart = content.indexOf('\n        <footer>');
  const footerEnd = content.indexOf('</footer>');

  if (footerStart !== -1 && footerEnd !== -1) {
    const before = content.substring(0, footerStart);
    const after = content.substring(footerEnd + '</footer>'.length);
    return before + '\n' + STD_FOOTER_HTML + '\n' + after;
  }

  // Try without leading whitespace
  const footerStart2 = content.indexOf('\n      <footer>');
  if (footerStart2 !== -1 && footerEnd !== -1) {
    const before = content.substring(0, footerStart2);
    const after = content.substring(footerEnd + '</footer>'.length);
    return before + '\n' + STD_FOOTER_HTML + '\n' + after;
  }

  return content;
}

function updateFooterResponsiveCSS(content) {
  // Remove old footer responsive rules from media query blocks
  content = content.replace(/\s*footer \{ padding: \d+px \d+px; \}/g, '');
  content = content.replace(/\s*\.footer-bottom \{ flex-direction: column;[^}]*\}/g, '');
  content = content.replace(/\s*\.footer-inner \{ flex-direction: column;[^}]*\}/g, '');

  // Check if the standard footer responsive CSS is already present
  if (content.includes('.footer-inner { flex-direction: column; gap: 8px; text-align: center; }')) {
    return content;
  }

  // Add footer responsive CSS to the media query
  // Find the @media (max-width: 768px) block
  const mediaMatch = content.indexOf('@media (max-width: 768px)');
  if (mediaMatch !== -1) {
    // Find the closing } of this media block
    // The media block ends before the next style closer
    // For now, just add to the end of the first @media block we find

    // Strategy: add before the closing of the last @media block
    // Find last @media block
    let lastMediaPos = content.lastIndexOf('@media (max-width: 768px)');

    // Find the closing }
    // The media block is { ... }
    // We need to find the end brace
    let bracePos = content.indexOf('{', lastMediaPos);
    let depth = 0;
    let closePos = bracePos;
    for (let i = bracePos; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          closePos = i;
          break;
        }
      }
    }

    // For the compact single-line form: @media (...) { ... }
    // Insert before the closing }
    const beforeClose = content.substring(0, closePos);
    const afterClose = content.substring(closePos);

    // Determine indent
    const isCompact = !content.substring(lastMediaPos, closePos).includes('\n          ');
    const newRules = isCompact
      ? ' footer { padding: 20px 16px; } .footer-inner { flex-direction: column; gap: 8px; text-align: center; }'
      : '\n          footer { padding: 20px 16px; }\n          .footer-inner { flex-direction: column; gap: 8px; text-align: center; }\n        ';

    content = beforeClose + newRules + afterClose;
  }

  return content;
}

// =========================================================
// Process a standard tool page (inline style backtick)
// =========================================================

function processStandardPage(filepath, opts = {}) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Task 1: Remove nav HTML
  content = removeInlineNav(content);

  // Task 1: Remove nav CSS
  content = removeNavCSS(content);

  // Task 2: Replace footer CSS
  content = replaceFooterCSS(content, true);

  // Task 2: Replace footer HTML
  content = replaceFooterHTML(content);

  // Task 2: Update footer responsive CSS
  content = updateFooterResponsiveCSS(content);

  // Task 3: Add back bar if needed
  if (opts.addBackBar) {
    // Add after <div className="page-wrap">
    if (!content.includes('back-bar')) {
      // Add back bar CSS
      // Find page-wrap CSS and add after it
      const pageWrapIdx = content.indexOf('.page-wrap {');
      if (pageWrapIdx !== -1) {
        const lineEnd = content.indexOf('\n', pageWrapIdx);
        content = content.substring(0, lineEnd + 1) + BACK_BAR_CSS_8 + '\n' + content.substring(lineEnd + 1);
      }

      // Add back bar HTML after <div className="page-wrap">
      const htmlInsertPoint = content.indexOf('\n        <div className="page-wrap">');
      if (htmlInsertPoint !== -1) {
        const insertAfter = htmlInsertPoint + '\n        <div className="page-wrap">'.length;
        content = content.substring(0, insertAfter) + '\n' + BACK_BAR_HTML + content.substring(insertAfter);
      }
    }
  }

  // Task 4: Fix hero title font (Playfair -> Barlow Condensed) for tool-title or hero-title
  if (opts.fixHeroFont) {
    content = content.replace(
      /\.tool-title \{ font-family: 'Playfair Display', serif;/g,
      `.tool-title { font-family: 'Barlow Condensed', sans-serif;`
    );
    content = content.replace(
      /\.hero-title \{ font-family: 'Playfair Display', serif;/g,
      `.hero-title { font-family: 'Barlow Condensed', sans-serif;`
    );
  }

  return content;
}

// =========================================================
// Process a STYLE-const page
// =========================================================

function processStyleConstPage(filepath, opts = {}) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Task 1: Remove nav HTML
  content = removeInlineNav(content);

  // Task 1: Remove nav CSS from STYLE const (2-space indent)
  content = removeNavCSS(content);

  // Task 2: Add/replace footer CSS
  // First check if footer CSS exists in STYLE
  const hasFooterCSS = content.includes('footer {') || content.includes('footer{');

  if (hasFooterCSS) {
    // Replace existing footer CSS
    const footerCSSPatterns = [
      /[ \t]*footer \{[^\}]*\}\n/g,
      /[ \t]*\.footer-bottom \{[^\}]*\}\n/g,
      /[ \t]*\.footer-inner \{[^\}]*\}\n/g,
      /[ \t]*\.footer-copy \{[^\}]*\}\n/g,
      /[ \t]*\.footer-copy span \{[^\}]*\}\n/g,
      /[ \t]*\.footer-class \{[^\}]*\}\n/g,
    ];
    for (const pat of footerCSSPatterns) {
      content = content.replace(pat, '');
    }
  }

  // Insert standard footer CSS before the media query in STYLE
  // STYLE const uses 2-space indent
  const mediaInStyle = content.search(/  @media \(max-width: 768px\)/);
  if (mediaInStyle !== -1) {
    content = content.substring(0, mediaInStyle) + STD_FOOTER_CSS_2 + '\n' + content.substring(mediaInStyle);
  } else {
    // Insert before closing backtick of STYLE
    // Find the end of STYLE const
    const styleEnd = content.indexOf('\`;\n\nfunction') !== -1
      ? content.indexOf('\`;\n\nfunction')
      : content.indexOf('\`;\n\nexport');
    if (styleEnd !== -1) {
      content = content.substring(0, styleEnd) + '\n' + STD_FOOTER_CSS_2 + '\n' + content.substring(styleEnd);
    }
  }

  // Task 2: Update footer responsive CSS
  content = content.replace(/\s*footer \{ padding: \d+px \d+px; \}/g, '');
  content = content.replace(/\s*\.footer-bottom \{ flex-direction: column;[^}]*\}/g, '');
  content = content.replace(/\s*\.footer-inner \{ flex-direction: column;[^}]*\}/g, '');

  // Add footer responsive rules to media query in STYLE
  const lastMediaInStyle = content.lastIndexOf('@media (max-width: 768px)');
  if (lastMediaInStyle !== -1) {
    let bracePos = content.indexOf('{', lastMediaInStyle);
    let depth = 0;
    let closePos = bracePos;
    for (let i = bracePos; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) { closePos = i; break; }
      }
    }
    if (!content.substring(lastMediaInStyle, closePos).includes('footer-inner')) {
      const before = content.substring(0, closePos);
      const after = content.substring(closePos);
      content = before + ' footer { padding: 20px 16px; } .footer-inner { flex-direction: column; gap: 8px; text-align: center; }' + after;
    }
  }

  // Task 2: Add footer HTML before closing </div> of page-wrap
  // These pages may or may not have a footer
  const hasFooterHTML = content.includes('<footer>') || content.includes('<footer\n');
  if (hasFooterHTML) {
    content = replaceFooterHTML(content);
  } else {
    // Insert footer before the closing </div>\n    </>\n  );
    // Find: </div>\n    </>\n  );\n}
    const closingPattern = '\n      </div>\n    </>\n  );\n}';
    const closingIdx = content.lastIndexOf(closingPattern);
    if (closingIdx !== -1) {
      content = content.substring(0, closingIdx) + '\n' + STD_FOOTER_HTML + content.substring(closingIdx);
    }
  }

  // Task 3: Add back bar if needed
  if (opts.addBackBar && !content.includes('back-bar')) {
    // Add CSS - insert before closing of STYLE
    const insertBeforeMedia = content.search(/  @media \(max-width: 768px\)/);
    if (insertBeforeMedia !== -1) {
      content = content.substring(0, insertBeforeMedia) + BACK_BAR_CSS_2 + '\n' + content.substring(insertBeforeMedia);
    }

    // Add HTML after <div className="page-wrap">
    content = content.replace(
      /(<div className="page-wrap">)\n(\s+<div className="hero">)/,
      `$1\n${BACK_BAR_HTML}\n$2`
    );
  }

  // Task 4: Fix hero title font
  if (opts.fixHeroFont) {
    content = content.replace(
      /\.hero-title \{ font-family: 'Playfair Display', serif;/g,
      `.hero-title { font-family: 'Barlow Condensed', sans-serif;`
    );
  }

  return content;
}

// =========================================================
// Process specific files
// =========================================================

function writeFile(filepath, content) {
  fs.writeFileSync(filepath, content, 'utf8');
  console.log('✓', filepath.replace(BASE, ''));
}

// Standard osint pages with inline <style>
const standardPages = [
  'app/osint/ip/page.tsx',
  'app/osint/whois/page.tsx',
  'app/osint/dns/page.tsx',
  'app/osint/conflict/page.tsx',
  'app/osint/feed/page.tsx',
  'app/osint/metadata/page.tsx',
  'app/osint/hash/page.tsx',
  'app/osint/cve/page.tsx',
  'app/osint/username/page.tsx',
  'app/osint/wayback/page.tsx',
  'app/osint/subdomains/page.tsx',
  'app/osint/url/page.tsx',
  'app/osint/email-headers/page.tsx',
  'app/osint/entity/page.tsx',
  'app/osint/sanctions/page.tsx',
  'app/osint/polymarket/page.tsx',
  'app/osint/currency/page.tsx',
  'app/osint/economics/page.tsx',
  'app/osint/commodities/page.tsx',
  'app/osint/breach/page.tsx',
  'app/osint/dorks/page.tsx',
  'app/osint/reverse-image/page.tsx',
  'app/osint/people/page.tsx',
  'app/osint/background/page.tsx',
  'app/osint/address/page.tsx',
  'app/osint/social-footprint/page.tsx',
  'app/osint/email-permutator/page.tsx',
  'app/osint/vin/page.tsx',
  'app/tools/satellite-tracker/page.tsx',
  'app/tools/flight-tracker/page.tsx',
  'app/tools/vessel-tracker/page.tsx',
  'app/tools/phone-lookup/page.tsx',
];

// STYLE const pages
const styleConstPages = [
  { path: 'app/osint/ssl/page.tsx', fixHeroFont: false, addBackBar: false },
  { path: 'app/osint/mac/page.tsx', fixHeroFont: false, addBackBar: false },
  { path: 'app/osint/jwt/page.tsx', fixHeroFont: true, addBackBar: true },
  { path: 'app/osint/base64/page.tsx', fixHeroFont: true, addBackBar: true },
  { path: 'app/osint/subnet/page.tsx', fixHeroFont: false, addBackBar: false },
  { path: 'app/osint/edgar/page.tsx', fixHeroFont: false, addBackBar: false },
  { path: 'app/osint/contracts/page.tsx', fixHeroFont: false, addBackBar: false },
];

// Pages needing back bar added (inline style)
const pagesNeedingBackBar = new Set([
  'app/osint/company/page.tsx',  // STYLE const
]);

// Pages needing hero font fix (inline style)
const pagesNeedingHeroFix = new Set([
  'app/osint/corporate/page.tsx',  // inline style
]);

// Process standard pages
for (const relPath of standardPages) {
  const fullPath = `${BASE}/${relPath}`;
  try {
    const content = processStandardPage(fullPath);
    writeFile(fullPath, content);
  } catch(e) {
    console.error(`ERROR processing ${relPath}:`, e.message);
  }
}

// Process STYLE const pages
for (const { path: relPath, fixHeroFont, addBackBar } of styleConstPages) {
  const fullPath = `${BASE}/${relPath}`;
  try {
    const content = processStyleConstPage(fullPath, { fixHeroFont, addBackBar });
    writeFile(fullPath, content);
  } catch(e) {
    console.error(`ERROR processing ${relPath}:`, e.message);
  }
}

// Process company page (STYLE const, needs back bar, needs hero font fix)
{
  const fullPath = `${BASE}/app/osint/company/page.tsx`;
  try {
    const content = processStyleConstPage(fullPath, { fixHeroFont: true, addBackBar: true });
    writeFile(fullPath, content);
  } catch(e) {
    console.error(`ERROR processing company:`, e.message);
  }
}

// Process corporate page (inline style, needs hero font fix)
{
  const fullPath = `${BASE}/app/osint/corporate/page.tsx`;
  try {
    let content = processStandardPage(fullPath, { fixHeroFont: true });
    writeFile(fullPath, content);
  } catch(e) {
    console.error(`ERROR processing corporate:`, e.message);
  }
}

console.log('Done!');
