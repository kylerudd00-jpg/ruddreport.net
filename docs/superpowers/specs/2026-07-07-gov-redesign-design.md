# Rudd Report — "Federal Signal" redesign

**Date:** 2026-07-07 · **Ask:** make it easier to see and understand what is happening on the site; copy the government/techy feel of ndstudio.gov.

## Reference findings

ndstudio.gov (White House National Design Studio) is: pure black background, white text,
one modern grotesque (PP Neue Montreal), hairline white borders, no decorative color, huge
confident type. Stark Swiss/federal utility — not sci-fi cyber.

## Decisions

| Area | Decision | Why |
|---|---|---|
| Palette | Neutral near-black `#08080a`, off-white `#ededeb` ink, hairline `rgba(255,255,255,.14)` rules | ndstudio DNA; replaces blue-tinted dark theme |
| Accent | Keep `#1e9eff` (7.6:1 on bg) as the *only* accent | ~70 untouched OSINT/tool pages hardcode it; stays coherent |
| Type | Archivo (display + body) + IBM Plex Mono (all metadata) | Institutional grotesque ≈ free Neue Montreal; mono = data/registry feel. No Orbitron/Share Tech Mono/micro-labels (per July direction) |
| Notice strip | Site-wide top strip: "Independent publication — not a U.S. government website" | Instant .gov recognition + protects Kyle (CISA fellow) from affiliation confusion |
| Nav | Monochrome, mono uppercase links, blue active underline; drop per-section rainbow colors | One consistent wayfinding system is clearer than 8 colors |
| Ticker | Replace marquee with static "Latest" strip (3 newest titles) | Marquees are hard to read; WCAG 2.2.2 friendlier |
| Featured | Static lead (no 6s auto-rotate carousel, no dots) | Auto-rotation fights comprehension |
| Articles | Register-style list rows: mono date / category tag / title / excerpt / meta | Dense, scannable — the core "understand what's happening" fix |
| Hero | Giant grotesque wordmark + mission + numbered directory (Reports / OSINT tools / Daily brief) | Homepage states what the site *is* above the fold |
| Removed JS | Carousel timer, stat count-up, scroll-reveal observers | Subtractive; less motion, faster |

## Scope

- `app/globals.css` — retokened `:root` (same var names → whole site shifts palette), fonts, base styles. Legacy font families stay imported so untouched pages don't break.
- `app/components/Nav.tsx` — notice strip + monochrome nav inside the same 70px fixed header (legacy pages pad 70px for it). All a11y machinery preserved (skip link, aria-expanded/controls, Escape, focus return, per-page-nav kill rules).
- `app/page.tsx` — full rewrite per above. Keeps: category filter (aria-pressed), search + live region, OSINT quick-investigate router, Aladdin banner (amber reduced to label accent), credentials strip, footer links.

Out of scope (inherit new palette via CSS vars only): section pages, OSINT tool pages, article pages. Candidates for a later sweep.

## Success criteria

1. `next build` passes.
2. WCAG AA: all text ≥ 4.5:1 on new bg; focus-visible outlines; reduced-motion gating intact; heading order h1→h2→h3.
3. No Orbitron / Share Tech Mono / sub-11px labels on rewritten surfaces.
