# GrowMO Master Theme — "Flowing Growth" v1.0

> **Single source of truth.** Every page (marketing, auth, and all 25 dashboard
> pages) MUST be built exclusively from this system. If a style you need is not
> listed here, add it to `src/styles.css` as a numbered appendix (§18+) using
> only the tokens below — then document it in this file. Never invent colors,
> fonts, or one-off styles inside page files.

**Theme file:** `src/styles.css` (imports: Google Fonts → Bootstrap 5 → tokens → components)
**Stack:** TanStack Start + React 19 + Bootstrap utilities + Lucide icons (no emoji icons, no other UI libs)

---

## 1. Design tokens (`:root` in styles.css)

### Brand greens
| Token | Value | Use |
|---|---|---|
| `--gm-forest-950` | `#08170f` | Darkest surfaces, footer, console active |
| `--gm-forest-900` | `#0c2317` | Hero/panel base |
| `--gm-forest-850` | `#0f2d1d` | Deep gradients |
| `--gm-forest-800` | `#123524` | Deep gradients |
| `--gm-pine-700` | `#17522f` | Dark accents |
| `--gm-leaf-700` | `#166534` | Primary text accents, headings |
| `--gm-leaf-600` | `#1d8345` | Primary actions, links |
| `--gm-leaf-500` | `#22a355` | Primary bright, focus rings |
| `--gm-sprout-400` | `#4cc38a` | Highlights |
| `--gm-sprout-300` | `#86ddb0` | Light highlights |
| `--gm-mint-200` | `#b9efcf` | — |
| `--gm-mint-100` | `#dcf5e5` | Soft fills, icon tiles |
| `--gm-mint-50` | `#f0faf3` | Card tints, hover fills |

### Accents & neutrals
| Token | Value | Use |
|---|---|---|
| `--gm-lime-300/400/500` | `#d8f65f` / `#c4ef3c` / `#a8d92b` | CTAs on dark, success glow, active states |
| `--gm-gold-400/500/600` | `#f2b950` / `#e8a02c` / `#c77f14` | Prices, badges, warnings, premium |
| `--gm-cream-50/100` | `#fbf8f0` / `#f5eeda` | Warm section backgrounds |
| `--gm-clay-500` | `#c65b3b` | Danger, destructive, errors |
| `--gm-ink-950/800/600/400` | `#0b120d` / `#1b261f` / `#3c4d43` / `#6b7d72` | Text scale (headings → muted) |
| `--gm-line` / `--gm-line-soft` | `#dfe9e1` / `#ecf2ed` | Borders |
| `--gm-mist` | `#f3f6f3` | Page background |
| `--gm-card` | `#ffffff` | Card background |

### Signature gradients (the "constant flow")
`--gm-grad-primary` (leaf flow) · `--gm-grad-deep` (dark hero/panel) ·
`--gm-grad-lime` (CTA pops) · `--gm-grad-gold` (price/premium) ·
`--gm-grad-mist` (light sections) · `--gm-grad-sheen` (button shine sweep)

### Type, shape, shadow, motion
- Fonts: `--gm-font-display` = **Fraunces** (headings, prices, numbers) ·
  `--gm-font-body` = **Plus Jakarta Sans** (everything else)
- Radii: `--gm-r-xs 8` · `--gm-r-sm 12` · `--gm-r-md 18` · `--gm-r-lg 26` ·
  `--gm-r-xl 36` · `--gm-r-pill 999`
- Shadows: `--gm-shadow-xs/sm/md/lg` + `--gm-shadow-glow` (green) + `--gm-shadow-lime`
- Motion: `--gm-ease` (spring), `--gm-t-fast .18s` / `med .35s` / `slow .6s`
- Layout: `--gm-max 1240px` container · `--gm-header-h 76px`
- Breakpoints: **1080px** (grids stack, nav → drawer) · **640px** (compact, `.hide-sm` hides)

---

## 2. Typography helpers
`.font-display` · `.gm-eyebrow` (with `.dot` pulse, `.on-dark` variant) ·
`.gm-h-display` · `.gm-h-section` · `.gm-lead` (`.on-dark`) ·
`.gm-grad-text` (light-on-dark) · `.gm-grad-text-green` (on light)

## 3. Buttons & chips
- `.gm-btn` + variants: `.gm-btn-lime` (hero CTA on dark) · `.gm-btn-gold` ·
  `.gm-btn-dark` · `.gm-btn-ghost` (on dark) · `.gm-btn-outline` (secondary) ·
  `.gm-btn-soft` (tertiary) · `.gm-btn-mpesa` (money actions) ·
  `.gm-btn-danger-soft` (destructive) · sizes `.gm-btn-sm/.gm-btn-lg/.gm-btn-block`
- `.gm-icon-btn` (+ `.on-dark`, badge `.gm-count`)
- `.gm-chip` + `.gm-chip-lime/.gm-chip-gold/.gm-chip-dark/.gm-chip-ghost`

## 4. Cards & content
`.gm-card` (lift on hover) · `.gm-service` (top flow-bar sweep) · `.gm-link-arrow` ·
`.gm-product` + `-art/-badge(.sale)/-body/-cat` · `.gm-stars` · `.gm-price(-old/-unit)` ·
`.gm-step(-num)` · `.gm-quote(-mark/-who/-ava)` · `.gm-pricing(.popular)` + `.gm-price-big` ·
`.gm-check-list` · `.gm-check-row` (hover slide — also used for settings/session/app rows) ·
`.gm-stat-band` + `.gm-stat-grid` · `.gm-tabs/.gm-tab(.is-active)/.gm-tabpanel(-copy/-art)` ·
`.gm-faq(.is-open)` accordion · `.gm-split` (2-col) · `.gm-empty` (empty states)

## 5. Forms, filters, pagination
`.gm-field > label + .gm-input/.gm-select/.gm-textarea` · `.gm-search-field` ·
`.gm-filter-chip(.is-active)` with count `.gm-n` ·
`.gm-pagination` > `.gm-page-btn(.is-active)` + `.gm-page-dots` + `.gm-page-meta`

## 6. Navigation chrome (global — never rebuild per page)
Marketing `Header`/`Footer` and auth `AuthTopbar`/`AuthMiniFooter` render from
`__root.tsx` by route prefix. Dashboard pages will use `AppShell` (created once,
see prompt) mounted the same way for `/app/*`.

## 7. Auth/app control kit (`src/components/auth/controls.tsx` — theme-global, reuse everywhere)
`<Dialog>` · `<Stepper>` · `<OtpInput>` · `<PinPad>` · `<PasswordField>` ·
`<StrengthMeter>` + `strengthOf()` · `useCountdown()` · `useTotpWindow()` ·
`<ScoreRing>` · `<Toggle>` · plus UI primitives (`components/ui/primitives.tsx`):
`<Reveal>` (variants up/left/right/zoom + delay) · `<SectionHeading>` · `<Stars>` ·
`<Pagination>` · `<CountUp>`

## 8. Feedback, overlays, data display
- Toasts: `useToast().notify(msg, "success" | "info" | "warn")` — **every** user
  action fires one. Rendered by global `<ToastHost/>`.
- Classes: `.gm-modal(-overlay/-wide/-head/-body)` · `.gm-table(-wrap)` ·
  `.gm-risk-low/-medium/-high` · `.gm-timer(.is-low)` · `.gm-totp(-num/-track/-fill)` ·
  `.gm-meter(-wrap/-bar/-label)` · `.gm-score-ring/-center` ·
  `.gm-toggle-row(-track/-thumb/-text)` · `.gm-method-grid` + `.gm-method(.is-active)` ·
  `.gm-option-row(.is-selected)` · `.gm-account-row` + `.gm-ava` · `.gm-board(-col/-count)` +
  `.gm-task(-foot)` · `.gm-timeline` + `.gm-tl-item(.is-done/.is-current)` ·
  `.gm-palette(-overlay/-input/-list/-item)` + `.gm-kbd` · `.gm-widget-grid/-mini/-bars` ·
  `.gm-spinner` · `.gm-divider` · `.gm-upload-drop` · `.gm-qr` · `.gm-code-chip` ·
  `.gm-cta-band` · `.gm-ussd-card/-code` · `.gm-qr`

## 9. Conventions
- **Routes:** file-based. Marketing `/`, `/services`, `/shop`, `/about`, `/contact` ·
  Auth `/auth/*` · Dashboard `/app/*` (map below). Dynamic: `$slug.tsx`.
- **Data:** page content lives in `src/data/*.ts` (never hardcoded trivia in JSX);
  dashboard data in `src/data/app/<slug>.ts`; money via `kes()` from `data/site`.
- **Shared UI:** reusable widgets go in `src/components/app/` (dashboard) or
  `src/components/ui/` (global). Check first — never duplicate.
- **Icons:** Lucide only. No emoji as icons (crop emoji in demo data strings is OK).
- **Kenyan realism:** KES prices, `07XX/01XX` phones, 47 counties, M-Pesa flows,
  Kiswahili microcopy, real crops/varieties (Gloria F1, H6213, Rosecoco…), AEZ zones.
- **A11y:** labels on inputs, `aria-label` on icon buttons, focus-visible comes free.
- **After every change:** `npm run generate-routes` → `npm run build` (must be clean)
  → curl route → 200 → commit + push on the **session branch only**.

## 10. Dashboard route map (growmo.md pages 1–25)
| Page | Route | Page | Route |
|---|---|---|---|
| 1 Onboarding & Farm Profile | `/app/onboarding` | 14 Payments & Wallet | `/app/wallet` |
| 2 Dashboard Home | `/app/dashboard` | 15 Settings & Team | `/app/settings` |
| 3 Crop Planner | `/app/planner` | 16 Offline/USSD/SMS | `/app/channels` |
| 4 Crop Management | `/app/crops` | 17 Soil Health | `/app/soil` |
| 5 Inputs & Inventory | `/app/inventory` | 18 Security & Logs | `/app/logs` |
| 6 Labour & Payroll | `/app/labour` | 19 Farm Mapping | `/app/map` |
| 7 Finance & Budgets | `/app/finance` | 20 Machinery | `/app/machinery` |
| 8 Weather & Climate | `/app/weather` | 21 Orders & Portfolio | `/app/orders` |
| 9 AI Advisor | `/app/advisor` | 22 Cooperative | `/app/cooperative` |
| 10 Market & Sales | `/app/market` | 23 Season Planning | `/app/seasons` |
| 11 Analytics | `/app/analytics` | 24 Post-Harvest | `/app/harvest` |
| 12 Records & Traceability | `/app/records` | 25 Nursery & Seeds | `/app/nursery` |
| 13 Community & Learning | `/app/community` | | |

Blueprint source: `growmo.md` (pages 1–17) + `growmo-p2.md` (pages 17–25+).

## 11. Dashboard shell (AppShell)

- `src/components/app/AppShell.tsx` + `src/data/app/nav.ts` (25 modules, 7 groups, `ready` flags) + `src/styles.css` §18.
- Dark gradient sidebar (`#0b1a0d → #12300f`), collapsible to 78px icons-only on desktop, off-canvas + scrim under 1024px.
- Sticky blur topbar: hamburger, breadcrumbs, ⌘K command palette trigger, notifications dropdown, tools dropdown, avatar dropdown, wallet pill, cloud-sync.
- Right drawers: alerts, weather, notes (localStorage), help. Global FAB (+ New task / note / photo). All controls real — no dead buttons.
- `__root.tsx` renders `<AppShell><Outlet /></AppShell>` chromeless for `/app` and `/app/*`. Pages render inside `.gm-app-inner` (max 1200px).
- Shared app components in §18: `.gm-modal`, `.gm-drawer`, `.gm-menu`, `.gm-table`, `.gm-steps`, `.gm-tabs`, `.gm-ring`, `.gm-otp`, `.gm-pinpad`, `.gm-checkcard`, `.gm-module-grid`.

## 12. Hard DON'Ts
No new colors/fonts outside tokens · no hex/rgb literals in `.tsx` (use `var(--gm-*)`) ·
no Tailwind/MUI/new libs · no dead buttons or links (unbuilt routes stay disabled with
"Soon", never 404) · no lorem ipsum · no `console.log`/TODOs · no other git branches ·
no global-chrome rebuilds · mobile must stack cleanly at 1080/640.
