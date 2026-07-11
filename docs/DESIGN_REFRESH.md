# Design Refresh — Roadmap & Progress Log

> Phased rollout of the [`DESIGN.md`](../DESIGN.md) system. This file is the
> **handoff record**: anyone (or any model) picking up the work reads here to
> see what's done, what's next, and why. Tick boxes and note the commit as each
> step lands. Keep it honest.

**Goal (user-approved):** design-system foundation + progressive refinement
(not a full rewrite) · add dark mode · keep-and-refine the warm cream/orange
identity. Borrow *principles* from Airbnb (photo-first warmth), Stripe
(systematic depth/motion), Linear (tokens + dark mode + focus).

**Working rules:** each phase is an independent, revertible commit; every commit
passes `npx tsc --noEmit` + `npm run build`; no backend/DB/RLS changes; verify
live after push (deploy-to-test). Ignore the duplicate copy under `.claude/worktrees/`.

---

## Phase 1 — Token foundation (non-visual-breaking)
Status: **DONE** — commit `ff2598c`

- [x] Merge the two `:root` blocks in `app/globals.css` into one token source.
- [x] Add semantic (`--success/-danger/-warning/-info` + pale), surface
      (`--bg/--surface/-2/-3`), text, `--border-strong`, radius, motion tokens.
- [x] Keep legacy aliases (`--cream/--dark/--mid/--light/--green*/--blue*`) →
      semantic tokens so existing CSS is unaffected.
- [x] Fix literal `'Fraunces'` → `var(--font-fraunces)` (CSS: `app/styles.css`,
      `browse/styles.css`, `rescuer-listing/styles.css`; inline styles in
      `rescuer-listing/page.tsx`, `rescuer-listing/edit/[id]/page.tsx`). Latent
      font-loading bug fixed.
- [x] Author `DESIGN.md` (spec) + this roadmap.
- [x] Remove inert Tailwind: deleted the empty `tailwind.config.ts`. *(Unused
      `tailwindcss` dep left in package.json for a later lockfile-only cleanup.)*

## Phase 2 — Dark mode
Status: **DONE (core)** — commit `9f301f6`; residual polish rolled into P3.

- [x] Tokenize surfaces: all 65 `background:#fff/#fafafa/white` across every CSS
      file → `var(--surface)` / `var(--surface-2)` (background-only; on-accent
      `color:#fff` kept). Footer + toast → new always-dark `--inverse` token.
      Home + page hero gradients → surface tokens.
- [x] `:root[data-theme="dark"]` overrides + `@media (prefers-color-scheme: dark)`
      with correct precedence (explicit `light` wins; else OS; else explicit `dark`).
- [x] `components/ThemeToggle.tsx` (localStorage + sets `data-theme`, defaults to
      OS) placed in the navbar next to `LanguageSwitcher`.
- [x] Pre-hydration inline theme script in `app/layout.tsx` (no flash).
- [x] Footer/toast handled via `--inverse` (stay dark in both themes).
- [ ] **Residual (P3):** hardcoded status *pales* not yet tokenized (e.g.
      `.notif-icon.red #FEE2E2`, `.blue #EFF6FF`, dashboard status badges,
      `#DC2626`/`#10B981` literals, the ~260 inline `style={{}}` colors). These
      stay light-tinted in dark mode until swept to semantic tokens. Verify
      WCAG AA once swept.

## Phase 3 — Component consolidation & professional polish
Status: **IN PROGRESS**

- [x] a11y baseline (`a261219`): global `:focus-visible` ring + input focus ring
      (was `outline:none` with no replacement); honor `prefers-reduced-motion`.
- [x] SVG icon system (`components/icons.tsx`, Lucide-derived, `currentColor`,
      no dependency) replacing emoji-as-icons — the top "unprofessional" signal.
      Migrated the persistent chrome + controls: navbar (paw logo, bell, notif,
      mobile close), theme toggle (sun/moon), pagination + gallery chevrons,
      photo manager (remove/star/crop), all modal close buttons, pet-info
      health check/cross, upload camera, pet-card arrow.
- [ ] **Remaining emoji (follow-up):** decorative empty-state illustrations
      (🐾/🐱 via `EmptyState` icon prop), in-text flourish arrows (some `→`),
      ✨ badges (`ai-badge`, rescuer-landing/created), browse empty-state 🔍,
      guide ✂, contact 💬, celebratory 🎉. Lower risk; sweep when convenient.
- [ ] One Button, Card, Field, Badge, Chip definition (kill `.form-input`×5,
      `.section-card`×2, the two conflicting `.btn-approve`, the duplicate search bar).
- [x] Finish dark-mode color sweep (commit `<fill>`): all hardcoded status
      colors/pales/grays in CSS + inline styles → semantic tokens; status
      foregrounds (`--success/-danger/-warning/-info`) brighten in dark like
      `--accent-soft`; guide/thank-you/rescuer-landing hero gradients and the
      navbar profile dropdown tokenized. White-on-color solids (btn-approve,
      toast variants, notif-badge, photo-remove, adopted-badge) are PINNED to
      deep literals so white text keeps contrast in both themes.
- [ ] Standardize breakpoints (768 primary, 480 secondary); retire one-off widths.

## Phase 4 — Key-page polish (photo-first, whitespace, hierarchy)
Status: **TODO** — order: home → browse → pet detail → dashboard family →
listing wizard → auth.

- [ ] Consistent rounding, card hover micro-interactions, restrained hero gradient.
- [ ] Unify stat tiles / badges / empty states / skeletons.
- [ ] Migrate high-density inline styles (rescuer-listing, apply, signup, Navbar) to classes.

## Phase 5 — Cleanup
Status: **TODO**

- [ ] Delete remaining duplicated CSS (search bar, feature-card, page-title variants).
- [ ] Final `DESIGN.md` / this file pass; all boxes ticked.

---

## Decision log
- **2026-07:** Scope = foundation + progressive refinement (not full rewrite).
  Dark mode = yes. Palette = keep & refine warm identity (do not rebrand).
- Reference specs (getdesign.md) are "independent analysis, not affiliated";
  we take principles only, never copy another brand's exact palette.

## Commit log
- P1: `ff2598c` — tokens consolidated/expanded, font refs fixed, DESIGN docs added, dead Tailwind removed.
