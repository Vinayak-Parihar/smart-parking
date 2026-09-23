# Design — Smart Parking

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

Applied by Hallmark (`hallmark redesign`, full-app scope, tone: playful) on 2026-09-24.
This is a scoped, practical application of the Hum system — it adopts Hum's palette,
type, radii, and signature button/card mechanics everywhere, but does not implement
every catalog embellishment (no scroll library, no tick-up counters, no confetti) —
those don't fit a utility app where drivers need the free-space count fast.

## Genre
playful

## Macrostructure family
- Marketing pages (`/`): Marquee Hero, Hum variant — off-centre headline + CTA below
  the fold, one character mark, one big+small feature pairing (not a 3-card row).
- App pages (`/app`, `/admin`): existing sidebar + detail layout, kept as-is
  structurally (Workbench family) — Hallmark reskins these pages, it does not
  restructure working data-fetching or socket logic.

## Theme
Catalog theme: **Hum** (rounded-sans, multi-accent, cream paper). Tokens live in
[`src/tokens.css`](src/tokens.css):
- `--color-paper` cream `oklch(97% 0.012 95)`
- `--color-ink` near-black, cool tilt `oklch(20% 0.012 250)`
- `--color-accent` pear-yellow (primary actions)
- `--color-accent-2` sky-cyan (links, secondary state, hover tints)
- `--color-accent-3` coral-red (one high-energy moment per page — e.g. the ANPR
  scan result, the "leave zero free" warning)

## Typography
- Display + body: Plus Jakarta Sans (400/500/600/700)
- Mono / labels: JetBrains Mono
- Display weight 600, tracking -0.025em. No serif anywhere. No italic headers.

## Spacing
4-point named scale in `tokens.css` (`--space-3xs` … `--space-3xl`). Pages use
named tokens, never raw px/rem for layout gaps.

## Motion
- `--ease-spring` (bouncy overshoot) — the primary CTA press only.
- `--ease-snap` — reveals, hover-lift.
- `prefers-reduced-motion: reduce` collapses all of the above to opacity-only.

## Microinteractions stance
- Buttons: the push system (`.btn`) — a colour-edge shadow that shrinks on
  `:active`, so pressing physically depresses the button.
- Cards lift 4px + shadow softens on hover; no scale transforms.
- Silent success over celebratory toasts, except the one ANPR-scan character
  moment on the landing page.

## CTA voice
- Primary: `.btn` filled pear, pill radius, chunky edge-shadow.
- Secondary: `.btn.secondary` — outline, transparent fill.
- Destructive (unallocate / cancel): outline in coral.

## Per-page allowances
- Marketing (`/`) MAY use one character moment + one off-grid element.
- App pages (`/app`, `/admin`) MUST NOT add decorative enrichment — the
  occupancy numbers and scan flow carry the page.

## What pages MUST share
- The wordmark treatment (amber square mark → pear-yellow rounded mark).
- The accent palette and its placement (pear = primary, cyan = secondary/links,
  coral = one alert/attention moment).
- The display + body font (Plus Jakarta Sans) and the `.btn` system.
- Card radius (20px) and input radius (12px) everywhere — no square corners.

## What pages MAY differ on
- Marketing page can use the character-mark + off-grid moment; app pages don't.
- Section rhythm on the landing page vs. the fixed sidebar+detail grid on `/app`
  and `/admin`.

## Nav & footer (landing page)
- Nav: **N1a** wordmark + "Open App" pill link (the site only has one real
  destination once `/admin` is hidden from navigation).
- Footer: **Ft5 Statement** — one closing line + wordmark + muted copyright.
