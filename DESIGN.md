# FurriHearts — Design System (DESIGN.md)

> Living spec for the FurriHearts pet-adoption platform. This is the single
> source of truth for how the UI should look and behave. Format inspired by
> [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — written
> in Markdown so any AI agent or new teammate can pick it up and stay consistent.
>
> **Companion:** [`docs/DESIGN_REFRESH.md`](docs/DESIGN_REFRESH.md) tracks the
> phased rollout of this system with a checklist and commit log. Update it as
> you go.

---

## 1. Brand & personality

Warm, trustworthy, editorial-but-approachable. A cozy "rescue/handmade" feel,
not clinical tech-blue. Malaysia's pet-adoption marketplace.

- **Wordmark:** "Furri**Hearts**" — Fraunces serif, "Furri" in `--text`,
  "Hearts" in `--orange`. Logo mark: 🐾 in an `--orange-pale` circle.
- **Voice:** friendly, concrete, emoji-accented (🐾 💬 🔔). Trust-forward.
- **Signature move:** one warm loud accent (burnt orange) over cream + brown
  neutrals; everything else is quiet.

### Influences (principles distilled, palettes NOT copied)
Curated from public design analyses — we borrow *principles*, keep our own brand.
- **Airbnb** → photography-first cards, generous rounding, warmth, trust signals.
- **Stripe** → systematic tokens, restrained depth/elevation, refined focus states, tasteful motion.
- **Linear** → full tokenization, first-class dark mode, crisp type scale, visible keyboard focus rings.

---

## 2. Design tokens

All tokens live in **one `:root` block** at the top of
[`app/globals.css`](app/globals.css). **Never hardcode a hex in a component** —
use a token. Legacy aliases (`--cream/--dark/--mid/--light/--green*/--blue*`)
point at the semantic tokens so older rules keep working.

### Color — light (default)
| Token | Value | Role |
|---|---|---|
| `--orange` | `#C8490A` | Primary brand / accent |
| `--orange-light` | `#E05C1A` | Accent hover |
| `--orange-pale` | `#FDF0EA` | Accent tint bg (tags, avatars) |
| `--accent` / `--accent-hover` / `--accent-contrast` | → orange / orange-light / `#fff` | Semantic accent aliases |
| `--success` / `--success-pale` | `#2D7A3A` / `#EAF5EC` | Approved, health, positive |
| `--danger` / `--danger-pale` | `#DC2626` / `#FEE2E2` | Errors, reject, destructive |
| `--warning` / `--warning-pale` | `#B45309` / `#FEF3C7` | Pending, caution, preview |
| `--info` / `--info-pale` | `#1A5FAD` / `#E8F0FA` | Neutral info, "new" |
| `--bg` | `#FDFAF7` | Page background |
| `--surface` | `#FFFFFF` | Cards, modals, inputs |
| `--surface-2` | `#FBF7F2` | Recessed areas, modal footer, hover |
| `--surface-3` | `#F5EEE6` | Deeper tint / gradient stop |
| `--text` / `--text-muted` / `--text-subtle` | `#1A1008` / `#5C4A3A` / `#8A7A6A` | Primary / secondary / tertiary text |
| `--border` / `--border-strong` | `#EDE4DA` / `#E0D4C6` | Hairlines / emphasized borders |

### Color — dark (`:root[data-theme="dark"]`, added in P2)
Surfaces/text/border flip; brand orange stays. Pale tints become deep-tinted
dark backgrounds. See the dark block in `app/globals.css`.

### Radius / spacing / elevation / motion
- **Radius:** `--radius-sm: 8px` (buttons, inputs, small), `--radius-md: 12px`
  (cards), `--radius-lg: 16px` (modals, hero cards), `--radius-pill: 999px` (chips, toggles).
- **Spacing:** `--space-1..8` = 4·8·12·16·20·24·32·40px. Prefer these over literals.
- **Shadow:** `--shadow-sm` (resting subtle), `--shadow-md` (card hover),
  `--shadow-lg` (floating: search bar, dropdowns), `--shadow-brand` (orange-tinted emphasis).
- **Motion:** `--ease: cubic-bezier(.4,0,.2,1)`, `--dur-fast: .15s`, `--dur: .2s`.
  Transitions on color/background/transform only; avoid animating layout.

---

## 3. Typography

Loaded via `next/font/google` in [`app/layout.tsx`](app/layout.tsx), exposed as
CSS vars. **Always reference the variable**, never the literal family name
(`font-family: var(--font-fraunces)` — the next/font family name is hashed, so
`'Fraunces'` literals silently fall back to the system serif).

- **Body:** DM Sans (`--font-dm-sans`), 15px base, line-height 1.5.
- **Headings/wordmark/stat numbers:** Fraunces serif (`--font-fraunces`).
- **Type scale (informal):** hero 42 · section 28–32 · page H1 24–28 ·
  card/section heading 15–20 · body 14–15 · meta/label 11–13 · micro 10–11.
- **Weights:** 500 nav · 600 labels/links · 700 headings/emphasis.
- **Mini-label motif:** uppercase, `letter-spacing:.5px`, `--text-subtle`, 700.

---

## 4. Components

White `--surface` on `--bg`, 1–1.5px `--border` hairlines, soft rounding,
low-opacity shadows only on hover/floating. Flat-with-light-elevation.

- **Buttons.** Primary = solid `--accent`, `--accent-contrast` text, 600–700,
  `--radius-sm`. Secondary/ghost = `--surface` + 1.5px `--border`, border→accent
  on hover. Sizes `.btn-sm/md/lg`. Semantic: success/danger variants use those
  tokens. **One green only** (`--success`) — do not reintroduce `#10B981`.
- **Cards.** `--surface` + 1px `--border` + `--radius-md` + 16–24px padding.
  Hover lift `translateY(-2px)` + `--shadow-md`. Featured = accent-tinted border + `--shadow-brand`.
- **Photos.** Photography-first: pet imagery leads cards and detail. Use
  `next/image` (see existing usage), `object-fit: cover`, `--radius-md`.
- **Forms.** `--surface` bg, 1.5px `--border`, `--radius-sm`, focus →
  `--accent` border **+ a 3px focus-visible ring** (`0 0 0 3px` accent at ~18%).
  Error → `--danger` border + `--danger-pale` helper. Labels = mini-label motif.
- **Chips / badges.** Pill (`--radius-pill`), selected/active = accent border +
  `--orange-pale` bg + accent text. Status pills map to semantic tokens:
  pending=warning, approved/closed=success, rejected/error=danger, cancelled=neutral.
- **Modals.** Canonical `.modal-overlay` (blur backdrop) + `.modal-content`
  (`--surface`, `--radius-lg`). Always `role="dialog" aria-modal="true"
  aria-labelledby`. Layered variants: `.confirm-dialog`, `.crop-dialog`.
- **Navbar / footer / drawer / toast / skeleton / pagination / empty-state**
  are defined once in `app/globals.css` — reuse, don't re-fork.

---

## 5. Layout & responsive

- **Containers:** 1200 (chrome, marketing, browse, detail) · 1000 (dashboard) · 600 (page-hero).
- **Grids:** pet grids `repeat(4,1fr)`→2→1; browse `260px 1fr`; detail `1fr 420px`.
- **Breakpoints:** primary **768px** (mobile), secondary **480px**. Avoid
  one-off widths; use these two unless a layout genuinely needs another.
- **Mobile nav:** hamburger → right slide-in drawer.

---

## 6. Dark mode

Theme is driven by `data-theme` on `<html>` (P2): default follows
`prefers-color-scheme`, user can override via the header toggle (persisted to
localStorage). A tiny inline script in `layout.tsx` sets it pre-hydration to
avoid a flash. Because every surface reads from `--surface/--bg/--text/--border`,
components theme automatically — **this only works if you use tokens, not `#fff`.**

---

## 7. Guardrails (do / don't)

- ✅ Use tokens for every color, radius, shadow, spacing.
- ✅ Reference `var(--font-fraunces)` / `var(--font-dm-sans)`.
- ✅ New shared UI → add once to `app/globals.css` (or `components/ui/`), reuse.
- ✅ Give interactive elements a visible `:focus-visible` ring.
- ❌ No raw hex in components/inline styles (migrate the ~260 inline `style={{}}` over time).
- ❌ No second green (`#10B981`), no duplicate `.form-input`/`.section-card`/`.btn-approve`.
- ❌ Don't hardcode `#fff` for surfaces — breaks dark mode.
- ❌ Don't animate layout/size on scroll; keep motion to color/transform.

---

## 8. For AI agents & handoff

Before touching UI: read this file + `docs/DESIGN_REFRESH.md` (current phase &
what's done). Make changes token-first, keep light+dark and en/zh/ms working,
run `npx tsc --noEmit` + `npm run build`, then tick the checklist in
`DESIGN_REFRESH.md` and record the commit. Backend/DB/RLS are out of scope for
design work.
