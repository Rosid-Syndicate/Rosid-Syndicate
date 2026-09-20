# DESIGN.md — Rosid Syndicates Group

Visual and interaction contract for the corporate website. This file is the
source of truth for any human or AI-assisted UI work. Tokens live in
`tailwind.config.js`; component classes live in `src/index.css`. If this file
and the code disagree, fix the code or update this file in the same change.

---

## 1. Visual identity

**Who this is for.** Procurement officers, developers, bank and EPC decision
makers evaluating an in-country partner in Nepal. They are reading on office
laptops and on phones in the field. They want to know, quickly: what the group
does, which company does it, who to contact, and whether the organisation is
credible.

**Design philosophy.** *Institutional clarity.* The site should read like a
well-prepared tender submission: structured, factual, unhurried, with one
accent used for direction rather than decoration. Credibility comes from
specificity (real company names, real scope, real contact details) — never
from visual noise.

| Attribute | Decision |
|---|---|
| Tone | Formal, direct, confident. No hype adjectives, no "revolutionary". |
| Density | Medium. Generous section spacing, compact information inside cards and tables. |
| Contrast | High. Dark navy on warm off-white; white on navy. Every text/background pair measured (see §5). |
| Brand personality | Engineering-grade reliability; Nepal-rooted, internationally legible. |
| Imagery | Real-looking industrial/finance photography, desaturated and darkened behind text; never hover-only, never as the sole carrier of meaning. |
| Icons | Heroicons outline (24) for UI, solid (20) for inline glyphs. One family only. |
| Motion | Functional only (see §10). Nothing loops; nothing runs on load except a 600 ms fade-up on the hero text. |

**Rejected (anti-slop gate).** Gradient text, glassmorphism/backdrop blur
cards, particle canvases, count-up statistics, pulsing badges, hover-revealed
descriptions, "three identical cards with no destination", mixed corner radii,
all-caps micro-labels under 12 px on interactive elements, fake metrics or
certifications, decorative blobs behind content.

---

## 2. Design tokens

Semantic tokens are defined in `tailwind.config.js → theme.extend`. Use the
semantic name; the legacy names (`fire`, `ocean`, `electric`, `warm`) exist
only for compatibility and must not be used in new code.

### 2.1 Color

| Token | Value | Role |
|---|---|---|
| `canvas` | `#F4F4F2` | Page background (light). |
| `surface` | `#FFFFFF` | Cards, panels, forms. |
| `deep` | `#030914` | Darkest background: footer, hero base. |
| `ink` | `#011E52` | Brand navy. Headings, primary buttons, dark sections. |
| `ink-700` | `#0A2A6B` | Primary button hover. |
| `muted` | `#475569` | Body copy on light backgrounds. |
| `line` | `#E2E8F0` | Borders and dividers on light. |
| `accent` | `#FD7B00` | Brand orange. Backgrounds (with `ink` text) and text **only on dark backgrounds**. |
| `accent-text` | `#A64F00` | Orange as text on light backgrounds (eyebrows, links, required marks). |
| `accent-soft` | `#FFF1E6` | Tint for check bullets / highlighted table cells. |
| `accent-hover` | `#E66E00` | Accent button hover. |
| `success / -soft` | `#15803D / #DCFCE7` | Confirmations, "Published". |
| `warning / -soft` | `#B45309 / #FEF3C7` | "New" inquiries, notes. |
| `danger / -soft` | `#B91C1C / #FEE2E2` | Errors, destructive actions. |
| `info / -soft` | `#0369A1 / #E0F2FE` | "Contacted", informational. |

On dark backgrounds use `text-white`, `text-slate-200` (lead), `text-slate-300`
(body), `text-slate-400` (secondary/links). Never `slate-500` on `deep`
(4.19:1 fails).

### 2.2 Typography

Families: **Inter** (400/500/600/700/800) for everything; **Montserrat**
(700/800) only for the wordmark "ROSID". Both load non-blocking with
metric-matched local fallbacks (`Inter Fallback`, `Montserrat Fallback`) so the
swap does not shift layout. `font-black` resolves to 800.

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `text-display` | clamp(2.75rem, 6vw, 4.75rem) | 1.02 | −0.03em | Home hero, inner-page headers |
| `text-h1` | clamp(2.25rem, 4.5vw, 3.5rem) | 1.08 | −0.025em | Article titles, compact page headers |
| `text-h2` | clamp(1.75rem, 3vw, 2.5rem) | 1.12 | −0.02em | Section headings |
| `text-h3` | 1.25rem | 1.3 | −0.01em | Card / sub-section headings |
| `text-lead` | 1.125rem | 1.7 | −0.005em | Intro paragraphs |
| `text-base` | 1rem | 1.5 | 0 | Body |
| `text-sm` | 0.875rem | 1.43 | 0 | Secondary text, buttons |
| `text-xs` | 0.75rem | 1.33 | 0 / +0.08em | Labels, meta. Minimum for interactive text. |
| `text-eyebrow` | 0.75rem | 1 | +0.16em | `.eyebrow` only |

Headings use `text-wrap: balance`; paragraphs `text-wrap: pretty`. One `<h1>`
per page. Section headings are `<h2>`; cards inside a section use `<h3>`.
Footer column titles are `<h3>` under a visually-hidden `<h2>`. The agency credit ("Website by …") sits in the middle of the legal bar (copyright · credit · legal links on one line from `xl`, stacked below): `text-xs text-slate-400`, link `text-accent` with `hover:brightness-110 hover:underline`, external-link attributes, global focus ring — never louder than the company's own content.

### 2.3 Spacing

Tailwind's 4 px scale. Section rhythm: `py-20 lg:py-28` (public), `py-16 lg:py-24`
(inner pages / secondary sections). Card padding `p-6` (mobile) → `p-8`.
Grid gaps `gap-5` (cards) / `gap-12 lg:gap-16` (two-column layouts).
Between eyebrow → heading → lead: `mt-5`, `mt-4/6`.

### 2.4 Radius, elevation, borders

- Radius: `rounded-sm` (2 px) everywhere on the public site and admin. `rounded-md`
  (6 px) is reserved for future use; no `rounded-xl/2xl`.
- Elevation: `shadow-card` (resting card), `shadow-raised` (forms, dropdown
  menus, primary panels). No other shadows.
- Borders: `border-line` on light; `border-white/10` on dark.

### 2.5 Layout

- `.container`: max 80 rem (`max-w-7xl`), gutters `px-5 sm:px-8 lg:px-12`.
- Long-form content: `max-w-4xl` (corporate profile, policies), `.prose-body`.
- Breakpoints: Tailwind defaults (`sm 640 · md 768 · lg 1024 · xl 1280`).
  Navigation switches to the mobile disclosure below `lg`.
- Header is fixed; `html { scroll-padding-top: 5.5rem }` handles anchors.

---

## 3. Components

All component classes are in `src/index.css` (`@layer components`).

| Component | Class / file | Notes |
|---|---|---|
| Button, primary | `.btn-primary` | `ink` bg, white text. Default CTA on light and dark. |
| Button, accent | `.btn-accent` | `accent` bg, **`ink` text** (white on orange fails AA). Use once per dark section for the main action. |
| Button, secondary | `.btn-secondary` | Surface + `line` border. |
| Button, outline (dark) | `.btn-outline-light` | Secondary action on `ink`/`deep`. |
| Button, ghost | `.btn-ghost` | Toolbar / table actions. |
| Button, small | `.btn-sm` | 36 px min height; only inside dense UI (filters, tables). |
| Text link with arrow | `.link-arrow` | "View all →" patterns. Always a real destination. |
| Eyebrow | `.eyebrow` | Small-caps label above a heading; `.eyebrow-on-dark` on dark. |
| Card | `.card`, `.card-hover` | Surface + border + `shadow-card`. Clickable cards are `<a>` with focus ring. |
| Dark panel | `.panel-dark` | Translucent panel on `ink`/`deep` (no blur). |
| Form field | `.field`, `.field-label` | Canvas background, `ink` focus ring. Labels always visible and associated. |
| Navigation item | `.nav-item` | 44 px min height. |
| Skip link | `.skip-link` | First focusable element. |
| Long-form body | `.prose-body` | Replaces the missing typography plugin. |
| Page header | `src/components/PageHeader.tsx` | `title`, `subtitle`, `lead`, `image`, `compact`, `titleAs`. |
| SEO head | `src/components/Seo.tsx` | Every page renders exactly one. |
| Status badge (admin) | `StatusBadge` in `src/pages/admin/Inquiries.tsx` | Color + text, never color alone. |
| Not found | `src/pages/NotFound.tsx` | Used for unknown slugs; `noindex`. |
| Testimonials | `src/components/Testimonials.tsx` | Renders nothing until a real quote is published from the admin; initials avatar when there is no photo. |
| Confirm dialog | `ConfirmProvider` / `useConfirm()` in `src/components/ConfirmDialog.tsx` | Native `<dialog>`, focus-trapped; `tone: 'danger'` for destructive actions. Never `window.confirm`. |
| Image field | `src/components/ImageField.tsx` | Upload (validated, downsized to WebP) to the `site-media` bucket or paste an https URL; preview + remove. |
| Rich text editor | `src/components/RichTextEditor.tsx` | TipTap 3, Markdown in/out; toolbar: block type, bold, italic, lists, quote, code, divider, link (https/mailto), image, undo/redo. |

### 3.1 States (required on every interactive component)

| State | Treatment |
|---|---|
| Default | As specified. |
| Hover | Color shift only (`hover:` variants). No scale on buttons; images may scale 1.03 inside clipped cards (`motion-safe:`). |
| Focus-visible | Global 3 px `accent` outline, 3 px offset (`#FFB067` on dark). Never removed. |
| Active | Primary button darkens to `deep`. |
| Disabled | `opacity-50`, `cursor-not-allowed`, `aria-busy` while loading. |
| Loading | Button label changes ("Sending…"), spinner has `role=status` + sr-only text. |
| Success / Error | `aria-live="polite"` region under the form; `role="alert"` for errors; color **and** text. |
| Empty | Short sentence + one action (see admin tables, credentials page). |
| Selected / current | `aria-pressed` (filters), `aria-current="page"` (nav). |

---

## 4. Patterns

- **Section anatomy:** eyebrow → h2 → optional lead → content → optional link-arrow.
- **Hero (home):** left-aligned, `text-display`, one `.btn-accent` + one
  `.btn-outline-light`, photograph at 35 % opacity under a navy gradient, four
  scope links below a hairline. No canvas animation.
- **Inner page header:** `PageHeader` with `compact` for utility pages
  (forms, policies, blog index). Photo is a real `<img>` with `srcset`.
- **Cards that navigate:** the whole card is one `<a>`; heading inside; visible
  "Learn more →" text; description always visible.
- **Tables (admin):** `<caption>` (sr-only), `<th scope>`, sticky-free,
  horizontal scroll on small screens, actions right-aligned with `aria-label`.
- **Forms:** `<fieldset>` + `<legend>` for groups; required marked with `*` and
  `required`; `autocomplete` on identity fields; honeypot hidden off-screen with
  `aria-hidden` and `tabindex=-1`; Turnstile widget `size: flexible`.

---

## 5. Accessibility rules (WCAG 2.2 AA)

Measured contrast for the approved pairs:

| Pair | Ratio |
|---|---|
| `ink` on `canvas` | 14.6 : 1 |
| `muted` on `canvas` / `surface` | 6.9 / 7.6 : 1 |
| white on `ink` | 16.0 : 1 |
| `ink` on `accent` | 6.1 : 1 |
| `accent-text` on `canvas` / `surface` | 5.1 / 5.6 : 1 |
| `accent` on `ink` / `deep` | 6.1 / 7.6 : 1 |
| `slate-400` on `deep` | 7.8 : 1 |

Rules:
1. Never use `accent` (#FD7B00) as text on a light background; use `accent-text`.
2. Never use white text on `accent`; use `ink`.
3. Interactive targets ≥ 44 × 44 px (buttons, nav items, menu toggles); `.btn-sm`
   (36 px) only in dense admin UI with spacing between targets.
4. Every image that carries meaning has `alt`; decorative images have `alt=""`.
5. Disclosures (menus, FAQ) use `aria-expanded` + `aria-controls`; Escape closes.
6. Icon-only controls have `aria-label`; icons themselves are `aria-hidden`.
7. Live regions for form outcomes; errors use `role="alert"`.
8. Motion respects `prefers-reduced-motion` (global CSS + `motion-safe:` utilities +
   `usePrefersReducedMotion()` for any JS-driven motion).
9. One `<h1>`; heading levels never skip.
10. Focus is never trapped except in future modal dialogs (none exist today).

---

## 6. Responsive behaviour

- Mobile first. No horizontal overflow at 360 px.
- Header: logo + disclosure button below `lg`; full nav + two CTAs at `lg+`.
- Grids: 1 → 2 → 3 columns (`sm`/`lg`); sector grid 1 → 3 with wide cards spanning 2.
- Tables scroll horizontally inside `.card overflow-x-auto`.
- Images use `srcset` + `sizes`; hero/page-header photos are `fetchpriority="high"`,
  everything below the fold `loading="lazy" decoding="async"`.

---

## 7. Imagery

- Photography via `unsplash(url, { w, q })` and `unsplashSrcSet()` from
  `src/lib/images.ts`; store the **base** Unsplash URL (no query) in data files.
  Widths: hero/page header 1600 (srcset 768–2000), cards 640 (480–960), sector
  wide cards 1000–1400. Quality 60–70.
- Brand assets are generated by `npm run images` into `public/brand` and
  `public/img` (WebP + PNG/JPEG fallbacks). Reference the generated files, not
  the 470 kB originals.
- Photos behind text sit at 25–35 % opacity under an `ink` gradient.

---

## 8. Copy

- Specific nouns and verbs: "bank-guarantee and financial-closure advisory", not
  "sovereign financial engineering".
- No unverifiable claims (counts, years, partners, certifications, "verified")
  unless the evidence is on the Credentials page.
- Sentence case for headings and buttons ("Discuss a project"); small caps only
  for eyebrows and table headers.
- British/international spelling is acceptable; keep it consistent within a page.

---

## 9. Admin

Same tokens, light theme only (`canvas` background, `surface` cards, 2 px
radius). Sidebar groups: Overview · Leads · Content · Organisation · Settings;
items the current role cannot use are not rendered (editors see Content only).
Priorities: speed, density, accuracy. Every mutation reports the real result —
no optimistic success. Destructive actions go through `useConfirm()` with
`tone: 'danger'`. Ordered lists (testimonials, FAQs) use move up/down buttons
rather than drag-and-drop so ordering works with a keyboard.

Sign-in (`src/pages/admin/Login.tsx`): split layout at `lg` — a `deep` brand
panel (logo, eyebrow, one headline, three capability cards, no statistics) and
a centred `card` with the form; below `lg` the panel is dropped and a compact
brand header sits above the card. Password fields get a show/hide toggle
(`aria-pressed`), errors render as a `danger-soft` banner directly above the
primary button, and optional elements (Turnstile, Google) only appear when
configured. The reset-link landing page reuses the same card.

---

## 10. Motion

| Token | Value |
|---|---|
| `duration-fast` | 150 ms — color/hover |
| `duration-base` | 250 ms — disclosure, shadow |
| `duration-slow` | 400 ms — image scale in cards |
| `ease-out` | cubic-bezier(0.16, 1, 0.3, 1) |
| `animate-fade-up` | 600 ms, opacity 0.01→1 + 16 px rise; hero text only |

Nothing loops. Nothing animates on scroll. Reduced-motion collapses all
durations to ~0.

---

## 11. Implementation guidance for agents

1. Read this file and `tailwind.config.js` before touching UI.
2. Use component classes (`.btn-*`, `.card`, `.field`) instead of composing
   one-off utility strings; add a class here if a new pattern is genuinely needed.
3. Every new page renders `<Seo>` and appears in `api/_lib/routes.js` and
   `vercel.json` rewrites (`npm run check:seo` enforces this).
4. Images: base Unsplash URL + `unsplash()`; never `w=3840`.
5. No `dangerouslySetInnerHTML`; use `renderMarkdown()`.
6. Run `npm run check` and `npm run build` before proposing changes.
7. When in doubt, remove decoration rather than add it.
