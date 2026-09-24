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
| `--gm-sprout-700/600/500` | `#1b6a49` / `#24835a` / `#2f9d6b` | Deeper highlight greens (gradient tails) |
| `--gm-sprout-400` | `#4cc38a` | Highlights |
| `--gm-sprout-300` | `#86ddb0` | Light highlights |
| `--gm-mint-500` | `#6dd39d` | Mid-green borders |
| `--gm-mint-200` | `#b9efcf` | — |
| `--gm-mint-100` | `#dcf5e5` | Soft fills, icon tiles |
| `--gm-mint-50` | `#f0faf3` | Card tints, hover fills |
| `--gm-leaf-800` | `#124d28` | Deep green text on light greens |
| `--gm-leaf-400` | `#3aa96f` | Hover borders, mid accents |
| `--gm-leaf-300` | `#7fd0a4` | Light green accents |
| `--gm-leaf-50` | `#eef8f1` | Pale green fills |

### Accents & neutrals
| Token | Value | Use |
|---|---|---|
| `--gm-lime-50/100/200` | `#f8feec` / `#f2fcd6` / `#e6f8a8` | Pale lime fills, lime text on dark |
| `--gm-lime-300/400/500` | `#d8f65f` / `#c4ef3c` / `#a8d92b` | CTAs on dark, success glow, active states |
| `--gm-gold-50/100/200/300` | `#fef8ec` / `#fdf1d9` / `#fbe6b9` / `#f8d48b` | Warning/premium tints |
| `--gm-gold-400/500/600/800` | `#f2b950` / `#e8a02c` / `#c77f14` / `#8a5a0e` | Prices, badges, warnings, premium |
| `--gm-cream-50/100` | `#fbf8f0` / `#f5eeda` | Warm section backgrounds |
| `--gm-cream-500` | `#e8d7a8` | Warm alert rails |
| `--gm-sand-50` / `--gm-earth-50` | `#fbf7ee` / `#f7f1e9` | Warm neutral surfaces |
| `--gm-clay-50/300/400` | `#fdf3ef` / `#e2a08c` / `#d47a5c` | Danger tints |
| `--gm-clay-500/700/800` | `#c65b3b` / `#9d4326` / `#7a3320` | Danger, destructive, deep danger text |
| `--gm-berry-500` | `#b03a72` | Categorical marker (buyer channel) |
| `--gm-ocean-50/400/500/700/800` | `#eef6f8` / `#4ea6bd` / `#2f8aa3` / `#1a5d72` / `#124a5c` | **Info** tone — the fourth semantic hue (good / warn / danger / info) |
| `--gm-ink-950/900/800/700/600/500/400/300/50` | `#0b120d` → `#f6f9f7` | Text scale (headings → muted → hairline tints) |
| `--gm-ink` / `--gm-muted` | `#1b261f` / `#6b7d72` | Long-form aliases of ink-800 / ink-400 |
| `--gm-white-04/06/10/20` | `rgba(255,255,255,.04/.06/.10/.20)` | Translucent rails on dark surfaces |
| `--gm-line` / `--gm-line-soft` | `#dfe9e1` / `#ecf2ed` | Borders |
| `--gm-mist` | `#f3f6f3` | Page background |
| `--gm-paper` | `#f3f6f3` | App shell background alias |
| `--gm-card` / `--gm-surface` | `#ffffff` | Card background (surface = alias) |
| `--gm-deep` | `#0c2317` | Solid dark pill/bar surfaces |
| `--gm-risk-high` | `#c65b3b` | High-risk badge fill |

### Signature gradients (the "constant flow")
`--gm-grad-primary` (leaf flow) · `--gm-grad-deep` (dark hero/panel) ·
`--gm-grad-lime` (CTA pops) · `--gm-grad-gold` (price/premium) ·
`--gm-grad-mist` (light sections) · `--gm-grad-sheen` (button shine sweep)

### Type, shape, shadow, motion
- Fonts: `--gm-font-display` = **Fraunces** (headings, prices, numbers) ·
  `--gm-font-body` = **Plus Jakarta Sans** (everything else) ·
  `--gm-font-mono` = `ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`
  (receipt codes, phone keys, SMS/USSD mocks — never hand-rolled stacks)
- Radii: `--gm-r-xs 8` · `--gm-r-sm 12` · `--gm-r-md 18` · `--gm-r-lg 26` ·
  `--gm-r-xl 36` · `--gm-r-pill 999` (+ `--gm-radius-sm/md/lg` long-form aliases)
- Shadows: `--gm-shadow-xs/sm/md/lg` + `--gm-shadow-glow` (green) + `--gm-shadow-lime`
  (+ `--gm-shadow-card`, alias of `--gm-shadow-sm`)
- Motion: `--gm-ease` (spring), `--gm-spring` (overshoot easing for pop/drawer),
  `--gm-transition` (`0.2s` + ease), `--gm-t-fast .18s` / `med .35s` / `slow .6s`,
  `--gm-d` (0s stagger delay default)
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

## 13. Weather & climate layer (page 8 — `/app/weather-pro`)

Page-scoped stylesheet `src/weather.css`, linked from `__root.tsx` after
`planner.css` (`weatherCss` → `?url` + `?v=1`). Every selector is prefixed with
`.gm-app` (or `.gm-modal-overlay`), so nothing leaks into the marketing or auth
chrome. Token-only: no new colors, fonts, radii or shadows, and no global
`.gm-*` component is redefined.

**New `.gm-wx-*` classes (52, all additive):**

| Blueprint section | Classes |
|---|---|
| Hero / station strip | `.gm-wx-hero` (+`::after` rings), `.gm-wx-hero-weather` |
| 8.1 live conditions | `.gm-wx-now`, `.gm-wx-now-top`, `.gm-wx-now-value`, `.gm-wx-now-change`, `.gm-wx-now-note`, `.gm-wx-now-grid`, `.gm-wx-now-list`, `.gm-wx-detail` |
| 8.2 hourly + 7-day | `.gm-wx-strip`, `.gm-wx-temp`, `.gm-wx-hours`, `.gm-wx-hour`, `.gm-wx-hour-bar`, `.gm-wx-days`, `.gm-wx-day`(`.is-today`), `.gm-wx-day-top`, `.gm-wx-day-temp`, `.gm-wx-day-meta` |
| 8.3 seasonal outlook | `.gm-wx-months`, `.gm-wx-month`, `.gm-wx-month-rain`, `.gm-wx-dekadal`, `.gm-wx-dek`, `.gm-wx-prob`, `.gm-wx-scenarios`, `.gm-wx-scenario` |
| 8.4 prediction engine | `.gm-wx-engine-tabs`, `.gm-wx-crop-btn`(`.is-active`), `.gm-wx-stage-rail`, `.gm-wx-stage-item`(`.is-current`/`.is-done`), `.gm-wx-balance`, `.gm-wx-bar`, `.gm-wx-bar-track` |
| 8.5 planting windows | `.gm-wx-window`, `.gm-wx-track`, `.gm-wx-months-mini`, `.gm-wx-legend` |
| 8.6 extreme alerts | `.gm-wx-actions`, `.gm-wx-alert`(`.sev-critical`/`.sev-high`/`.sev-medium`/`.sev-low`), `.gm-wx-alert-head`, `.gm-wx-alert-msg`, `.gm-wx-alert-meta` |
| 8.7 history | `.gm-wx-chart` (rainfall bar chart, month labels + values) |
| Shared bits | `.gm-wx-note`, `.gm-wx-fact`, `.gm-wx-fact-grid`, `.gm-wx-summary`, `.gm-wx-receipt`, `.gm-wx-pop`, `.gm-wx-tools` |

**Responsive:** grids collapse at **1080px** and **640px** (single column);
a **380px** tier reflows the live-conditions grid to two columns and the
planting-window row to one. `@media print` hides `.gm-wx-actions` /
`.gm-wx-tools` so the tables print cleanly. Reveal transitions respect
`prefers-reduced-motion` via `styles.css` §16.

**Reusable widgets — `src/components/app/WeatherWidgets.tsx`:**
`WxField`, `WxModalFooter`, `WxNote`, `WxFact`, `WxFactGrid`, `WxSummary`,
`WxConditionTile`, `WxConditionDetail`, `WxHourlyStrip`, `WxDayCard`,
`WxMonthCard`, `WxDekadalGrid`, `WxStageRail`, `WxBalanceBar`,
`WxWindowTrack`, `WxWindowLegend`, `WxAlertCard`, `WxRainChart`,
`WxObservationRow`, `WxContactRow`, plus the `CONDITION_ICONS` /
`CURRENT_ICONS` icon maps and `severityTone()` (`low|medium|high` →
`StatusChip` tone).

**Page data:** `src/data/app/weather.ts` (live parameters, 7-day forecast,
seasonal outlook + AI advisory, crop engine, planting windows, alerts,
12-month history, stations, observations, scenarios, SMS bundle, spray
products, mitigation presets, FAQs). Money goes through `kes()` from
`data/site`.

## 14. AI advisor layer (page 9 — `/app/advisor`)

Page-scoped stylesheet `src/advisor.css`, linked from `__root.tsx` after
`weather.css` (`advisorCss` → `?url` + `?v=1`). Every selector is prefixed with
`.gm-app`, token-only (no hex, no literal colors in the `.tsx`), and no global
`.gm-*` component is redefined.

**New `.gm-ai-*` classes (64, all additive):**

| Blueprint section | Classes |
|---|---|
| Hero / identity | `.gm-ai-hero` (+`::after` rings), `.gm-ai-ava-lg`, `.gm-ai-hero-strip`, `.gm-ai-hero-actions`, `.gm-ai-credit`, `.gm-ai-credit-track` |
| 9.1 chat | `.gm-ai-layout`, `.gm-ai-side`, `.gm-ai-thread`, `.gm-ai-msg`(`.is-me`), `.gm-ai-ava`, `.gm-ai-bubble`, `.gm-ai-meta`, `.gm-ai-src`, `.gm-ai-blocks`, `.gm-ai-block`, `.gm-ai-option`, `.gm-ai-budget-row`, `.gm-ai-budget-total`, `.gm-ai-steps`, `.gm-ai-pay-row`, `.gm-ai-chips`, `.gm-ai-typing`, `.gm-ai-dot`, `.gm-ai-composer`, `.gm-ai-composer-row`, `.gm-ai-prompts`, `.gm-ai-session`, `.gm-ai-upload`, `.gm-ai-scan-preview` |
| Insight feed | `.gm-ai-insight`(`.tone-high`/`.tone-medium`/`.tone-low`), `.gm-ai-insight-foot`, `.gm-ai-feed-btn` |
| 9.2 plan generator | `.gm-ai-plans`, `.gm-ai-plan`, `.gm-ai-plan-meta`, `.gm-ai-scenarios`, `.gm-ai-scenario`(`.is-best`) |
| 9.3 pest & disease | `.gm-ai-risks`, `.gm-ai-risk`(`.sev-high`/`.sev-medium`), `.gm-ai-risk-head`, `.gm-ai-risk-msg`, `.gm-ai-risk-meta`, `.gm-ai-score` |
| 9.4 market forecast | `.gm-ai-markets`, `.gm-ai-market`, `.gm-ai-spark`, `.gm-ai-range`, `.gm-ai-range-track` |
| 9.5 benchmarking | `.gm-ai-bench`, `.gm-ai-bench-head`, `.gm-ai-bench-bar`, `.gm-ai-bench-legend` |
| 9.6 input optimization | `.gm-ai-programs`, `.gm-ai-program`(`.is-pick`), `.gm-ai-program-price` |
| Shared bits | `.gm-ai-tools`, `.gm-ai-fact`, `.gm-ai-fact-grid`, `.gm-ai-note`(`.warn`/`.danger`), `.gm-ai-summary`, `.gm-ai-receipt`, `.gm-ai-kv`, `.gm-ai-empty` |

**Responsive:** the chat layout is `1fr 300px` above **1080px** and stacks to a
single column below it (the right rail becomes a card grid); grids collapse at
**640px**; a **380px** tier reflows the hero strip and fact grid to two
columns and the composer to a stacked column. `@media print` hides the
composer, prompts, toolbars and hero actions. Reveal motion inherits
`prefers-reduced-motion` from `styles.css` §16.

**Reusable widgets — `src/components/app/AdvisorWidgets.tsx`:**
`AiField`, `AiModalFooter`, `AiNote`, `AiFact`, `AiFactGrid`, `AiSummary`,
`AiKv`, `AiEmpty`, `AiUploadDrop`, `AiTyping`, `AiChatBlock`, `AiChatBubble`,
`AiInsightCard`, `AiPlanCard`, `AiScenarioCard`, `AiRiskCard`, `AiSparkline`
(+ `SPARK_MONTHS`), `AiMarketCard`, `AiBenchBar`, `AiProgramCard`, plus the
`riskTone()`, `verdictTone()` and `<TrendIcon />` helpers.

**Page data:** `src/data/app/advisor.ts` — profile, 10 chat sessions with three
full blueprint transcripts (Kiswahili maize budget, labour M-Pesa payment,
black-rot diagnosis), 12 quick prompts with data-driven AI replies, 10
proactive insights, the 17-row blueprint season plan + 3 revenue scenarios +
10 saved plans, 10 pest/disease risks + 10 treatment products + 10 scouting
rounds + 10 symptoms, 10 market forecasts + 8 price alerts, 10 benchmark
metrics + 10 peer groups, 6 fertilizer programs + 10 fertilizer products + the
soil test, 10 AI model cards, 10 data sources, 4 credit plans, 8 FAQs.
Money goes through `kes()` from `data/site`.

## 15. Records layer (page 12 — `/app/records`)

Page-scoped stylesheet `src/records.css`, linked from `__root.tsx` after
`advisorCss` (`recordsCss` → `?url` + `?v=1`). Every selector is prefixed with
`.gm-app` or `.gm-modal-overlay`, token-only, and no global `.gm-*` component is
redefined. It also styles the page header hooks the master theme leaves
unstyled: `.gm-menu-wrap` / `.gm-finance-menu` (the "More record tools" dropdown)
and `.gm-back-link`.

**New `.gm-rec-*` classes (all additive):** hero `.gm-rec-hero`(+`-head`,
`-actions`), `.gm-rec-kpi`(+`-grid`), `.gm-rec-ring`(+`-num`); `.gm-rec-phi`(
`-head`, `-track`, `-note`), `.gm-rec-alert-row`; diary `.gm-rec-diary`(
`-top`, `-date`, `-meta`, `-body`, `-foot`), `.gm-rec-photos`, `.gm-rec-photo`;
batches `.gm-rec-batch`(+`-grid`, `-head`, `-foot`), `.gm-rec-qr`;
certification `.gm-rec-cert`(+`-head`, `-meta`, `-progress`, `-foot`, `-req`),
`.gm-rec-mini-track`; soil `.gm-rec-soil-chart`, `.gm-rec-soil-col`,
`.gm-rec-soil-bar`(`-plot`, `-date`, `-value`, `-label`, `-pills`),
`.gm-rec-soil-row`; activity `.gm-rec-bars`, `.gm-rec-bar`(+`-col`, `-label`,
`-value`); compliance `.gm-rec-evidence`, `.gm-rec-gap`(+`-head`, `-foot`),
`.gm-rec-kv`, `.gm-rec-toolbar`, `.gm-rec-callout`, `.gm-rec-review`; wizard bits
`.gm-rec-stack`, `.gm-rec-pay`, `.gm-rec-processing` (reuses the global
`@keyframes gm-spin`), `.gm-rec-success`(+`-mark`), `.gm-rec-receipt`.

**Reusable widgets — `src/components/app/RecordsWidgets.tsx`:** `RecordsHero`,
`PhiMeter`, `DiaryEntryCard`, `QrTile`, `BatchSummaryCard`, `TraceTimeline`,
`CertProgressCard`, `SoilTrendChart`, `SoilSampleRow`, `RecordsMonthChart`,
`EvidenceDocRow`, `ComplianceGapRow`, `RecordKvList` (+ `RecordKpi`).
**Workflows:** `src/components/app/RecordsModals.tsx` (23 dialogs/wizards,
including the M-Pesa OTP + PIN confirmation shape shared with finance).

## 16. Community layer (page 13 — `/app/community`)

Page-scoped stylesheet `src/community.css`, linked from `__root.tsx` after
`recordsCss` (`communityCss` → `?url` + `?v=1`). Same rules: `.gm-app` /
`.gm-modal-overlay` prefixes only, tokens only, no global component redefined.
It also styles the page header hooks `.gm-cm-crumbs`, `.gm-cm-back`,
`.gm-cm-menu-wrap` and `.gm-cm-menu` so the community tools dropdown is a real
styled pop-up.

**New `.gm-cm-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + points | `.gm-cm-hero`(+`-head`, `-actions`), `.gm-cm-score`, `.gm-cm-badge-line`, `.gm-cm-kpi`(+`-grid`) |
| 13.1 Forums | `.gm-cm-cat`(+`-foot`), `.gm-cm-thread`(`-main`, `-head`, `-title`, `-body`, `-meta`, `-side`), `.gm-cm-likes`, `.gm-cm-reply`(`.is-verified`, `-foot`), `.gm-cm-thread-full` |
| 13.2 Library | `.gm-cm-resource`(+`-top`, `-sw`, `-meta`, `-foot`) |
| 13.3 Agronomist connect | `.gm-cm-expert`(+`-head`, `-spec`, `-meta`, `-counties`, `-foot`) |
| 13.4 Groups | `.gm-cm-group`(+`-head`, `-stats`, `-tags`, `-savings`, `-foot`), `.gm-cm-event`, `.gm-cm-feature`(+`-grid`) |
| 13.5 Stories | `.gm-cm-story`(+`-head`, `-achievement`, `-compare`, `-foot`), `.gm-cm-quote` |
| 13.6 Benchmarking | `.gm-cm-bench`(+`-head`, `-track` with `.mark.mine/.county/.top25/.peerTop`, `-values`), `.gm-cm-leader`(`.is-mine`), `.gm-cm-rank`, `.gm-cm-badge`(`.is-earned`) |
| Chat (drawer + expert) | `.gm-cm-chat`(+`-thread`), `.gm-cm-msg`(`.is-me`), `.gm-cm-msg-ava`, `.gm-cm-bubble`, `.gm-cm-composer`, `.gm-cm-chat-note` |
| Toolbars & lists | `.gm-cm-toolbar`, `.gm-cm-search`, `.gm-cm-count`, `.gm-cm-activity`, `.gm-cm-faq`(+`-row`), `.gm-cm-kv` |
| Modal wizard bits | `.gm-cm-stack`, `.gm-cm-callout`, `.gm-cm-review`, `.gm-cm-pay`, `.gm-cm-processing` (reuses `gm-spin`), `.gm-cm-success`(+`-mark`), `.gm-cm-receipt` |

**Responsive:** KPI and card grids collapse at **1080px**, thread rows stack and
toolbars go full-width at **640px**, story comparison returns to one column at
**380px**; `@media print` hides hero actions, composers, card footers and side
rails. Reveal motion inherits `prefers-reduced-motion` from `styles.css` §16.

**Reusable widgets — `src/components/app/CommunityWidgets.tsx`:** `CommunityHero`,
`ForumCategoryCard`, `ThreadRow`, `ResourceCard`, `AgronomistCard`, `ServiceRow`,
`GroupCard`, `EventRow`, `StoryCard`, `BenchmarkBar`, `LeaderboardRow`,
`BadgeTile`, `ChatThread`, `CommunityKv` (+ `CommunityKpi`, `ChatMessage`).
**Workflows:** `src/components/app/CommunityModals.tsx` (22 dialogs/wizards:
thread composer, thread reader with replies and best-answer, report, category
browser, resource preview/offline/bookmark, agronomist request wizard, profile,
session detail, rating, contact, ask-expert, group join/leave, group buying,
contributions, event registration, story reader/share, benchmark compare, invite
and settings), plus the FAQ pop-up in the route file. Paid flows reuse the
Amount → OTP (`123456`) → processing → receipt shape from finance.

**Page data:** `src/data/app/community.ts` — 13 forum threads with replies
(incl. the black-rot thread with @maryWanjiku, @johnFarmer and verified
@agronomistPeter), 10 forum categories, 12 library resources + 10 library
categories, 10 agronomists + 5 paid services + 10 sessions, 10 farmer groups +
10 events + 10 group-buying items + 10 contributions, 10 success stories,
10 benchmark metrics + 10 peer groups + leaderboard + badges, group and expert
chat seeds, activity log, settings and FAQs. Money goes through `kes()` from
`data/site`.

## 17. Soil health & testing layer (page 17 — `/app/soil`)

Page-scoped stylesheet `src/soil.css`, linked from `__root.tsx` after
`communityCss` (`soilCss` → `?url` + `?v=1`). Same rules: `.gm-app` /
`.gm-modal-overlay` prefixes only, tokens only, no global component redefined.
It also styles the page header hooks `.gm-soil-crumbs`, `.gm-soil-back` (with
`.gm-breadcrumb-sep`), `.gm-soil-menu-wrap` and `.gm-soil-menu` so the "More
soil tools" dropdown and the plot drawer behave as real pop-ups, and it reuses
the global `.gm-checkcard`, `.gm-empty`, `.gm-filter-chip`, `.gm-table-link` and
`.gm-spin` rather than inventing local versions.

**New `.gm-soil-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + KPIs | `.gm-soil-hero`(+`-grid`, `-copy`, `-head`, `-chips`, `-actions`), `.gm-soil-score`(+`-label`, `-link`), `.gm-soil-component`(+`-head`), `.gm-soil-kpi`(+`-grid`) |
| 17.1 Test scheduler | `.gm-soil-plot`(+`-head`, `-meta`, `-meters`, `-zone`, `-note`, `-foot`), `.gm-soil-zone`(+`-s`) |
| 17.2 Results dashboard | `.gm-soil-meter`(+`-head`, `-track`) — optimal band + reading mark inside one track |
| 17.3 Fertilizer programme | `.gm-soil-skip`(+`-icon`, `-evidence`, `-saved`), `.gm-soil-bar-row`/`.gm-soil-bars` (NPK bars), `.gm-soil-temp` |
| 17.4 History & trend | `.gm-soil-chart`(+`-unit`, `-note`), `.gm-soil-score-trend`, `.gm-soil-score-col`, `.gm-soil-score-bar`, `.gm-soil-bars-legend` |
| 17.5 Sampling guide | `.gm-soil-step`(+`-num`) — EN/SW instructions, kit checklist uses `.gm-checkcard` |
| 17.6 Lab directory | `.gm-soil-lab`(+`-head`, `-meta`, `-prices`, `-note`, `-foot`) |
| 17.7 Improvement plan | `.gm-soil-practice`(+`-head`, `-meta`, `-progress`, `-foot`) |
| 17.8 Moisture monitoring | `.gm-soil-moisture`(+`-bars`, `-legend`, `-row`, `-week`, `-net`), `.gm-soil-net`(`.is-positive`/`.is-negative`), `.gm-soil-signal`(`.is-off`, `.is-none`, `.is-low`), `.gm-soil-method`(+`-head`, `-meta`, `-best`) |
| Records tab & shared bits | `.gm-soil-kv`, `.gm-soil-partner`, `.gm-soil-callout`(`.tone-warn`/`.tone-good`), `.gm-soil-feature`(+`-grid`) |
| Toolbars & lists | `.gm-soil-toolbar`, `.gm-soil-search`, `.gm-soil-count`, `.gm-soil-faq`(+`-row`) |
| Modal wizard bits | `.gm-soil-stack`, `.gm-soil-review`, `.gm-soil-step-list`, `.gm-soil-pay`, `.gm-soil-processing` (reuses `gm-spin`), `.gm-soil-success`(+`-mark`), `.gm-soil-receipt` |

**Responsive:** the hero, plot, lab, practice, method and feature grids collapse
at **1080px**, toolbars/search/dropdowns and week rows go full-width at **640px**,
plot and lab card footers stack at **380px**; `@media print` hides hero actions,
toolbars, card footers and the menu, and neutralises the hero gradient so the
sampling guide and the test report print legibly. Reveal motion inherits
`prefers-reduced-motion` from `styles.css` §16.

**Reusable widgets — `src/components/app/SoilWidgets.tsx`:** `SoilHero`,
`SoilPlotCard`, `SoilPlotRow`, `LabCard`, `ParameterRow`, `ParameterMeter`,
`ProgramStepRow`, `SkippedInputRow`, `TrendLineChart`, `NpkBarChart`,
`ScoreTrendChart`, `SamplingStepCard`, `PracticeCard`, `MoistureWeekRow`,
`MoistureBalanceChart`, `SensorRow`, `CompostRow`, `LimeRateRowView`,
`SoilOrderRow`, `MoistureMethodCard`, `SoilPartnerCard`, `SoilKv`, `SoilCallout`
(reuses `ProgressLine`/`StatusChip` from `DashboardWidgets` and `ScoreRing` from
`auth/controls`). **Workflows:** `src/components/app/SoilModals.tsx` (27
dialogs/wizards: test booking wizard with lab/test-type/plot steps, lime order
with the M-Pesa path, illustrated sampling guide, lab detail and contact, 15
parameter dialogs, score breakdown, history report, compare tests, trend point,
fertilizer programme with CSV export, product detail with substitution, skip
reason, amendment log, compost batch wizard and batch detail, practice plan,
moisture log, irrigation plan, sensor wizard, share access links, export,
settings, FAQ/glossary, order receipt, confirm pause and the input order
wizard). Money flows reuse the Amount → OTP (`123456`) → processing → receipt
shape from finance.

**Page data:** `src/data/app/soil.ts` — 10 plots, 3 test types, 10 labs,
15 parameters with blueprints values (pH 5.8, OM 3.2%, N 15, P 25, K 180, Ca
1,200, Mg 200, S 12, Zn 1.8, B 0.4, Cu 1.2, Fe 45, Mn 8, CEC 12, clay loam),
7-line fertilizer programme at KES 54,000, 3 skipped inputs saving KES 13,300,
10 history rows 2023–2026, 5 score components totalling 58/100 (35 in 2023,
70 projected), 9 sampling steps + 6 kit items, 10 improvement practices,
10 moisture weeks + 4 methods + 6 sensors, 10 compost batches, 10 lime rate
rows, 12 products, 6 alerts, 10 activity rows, 10 lab orders, settings, FAQ and
glossary. Money goes through `kes()` from `data/site`; every figure is stated in
KES and dated in the Sep 2026 Kenya farming calendar used by pages 1–13.

## 18. Market & sales layer (page 10 — `/app/market`)

Page-scoped stylesheet `src/market.css`, linked from `__root.tsx` after
`soilCss` (`marketCss` → `?url` + `?v=1`). Every selector is prefixed with
`.gm-app` or `.gm-modal-overlay`, token-only, no global `.gm-*` component
redefined. It styles the live-price table, trend bar chart, buyer cards,
scenario cards, contract cards, modal wizards, alerts and FAQ/glossary.

**New `.gm-mk-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + KPIs | `.gm-mk-hero`(+`-head`, `-copy`, `-chips`, `-actions`, `-score`, `-grid`), `.gm-chip-live`, `.gm-dot-live` (pulse) |
| 10.1 live prices | `.gm-mk-price-table`, `.gm-mk-price-row`, `.gm-mk-crop-cell`, `.gm-mk-crop-btn`, `.gm-mk-price-cell`, `.gm-mk-price-link`(`.is-best`), `.gm-mk-price-range`, `.gm-mk-best-tag`, `.gm-mk-trend`(`-up/-down/-stable`) |
| 10.2 trend chart | `.gm-mk-chart`(`.is-lg`), `.gm-mk-chart-body`, `.gm-mk-chart-row`, `.gm-mk-chart-y`, `.gm-mk-chart-track`, `.gm-mk-chart-bar`, `.gm-mk-chart-tip`, `.gm-mk-chart-x` |
| 10.3 best market | `.gm-mk-rec-list`, `.gm-mk-rec`(`.best/.higher/.far`), `.gm-mk-rec-rank`, `.gm-mk-rec-main`(`-head/-meta/-note/-bar`), `.gm-mk-rec-net` |
| 10.4 buyers | `.gm-mk-buyer-grid`, `.gm-mk-buyer`(`-head/-body/-foot`, `-ava` variants), `.gm-mk-buyer-ident`, `.gm-mk-buyer-crops`, `.gm-mk-buyer-kv`, `.gm-mk-buyer-last`, `.gm-mk-buyer-rating`, `.gm-mk-v` |
| 10.5 sales planner | `.gm-mk-scenario-grid`, `.gm-mk-scenario`(`.is-pick`), `.gm-mk-scenario-head/-sw/-figures/-note/-foot`, `.gm-mk-fig-label` |
| 10.6 sales log | `.gm-mk-sale-row`, `.gm-mk-sale-date`, `.gm-mk-pay`, `.gm-grade` |
| 10.7 contracts | `.gm-mk-contract-grid`, `.gm-mk-contract`(`-head/-body/-foot`, `-co`, `-row`, `-reqs`), `.gm-mk-price-k` |
| Shared KV/callouts | `.gm-mk-kv`(`.is-2`, `-row`, `-k`, `-v`), `.gm-mk-callout`(`tone-info/warn/good`), `.gm-mk-form-grid`, `.gm-mk-list`, `.gm-mk-help`, `.gm-mk-err` |
| Toolbar/menu | `.gm-mk-toolbar`, `.gm-mk-search`, `.gm-mk-count`, `.gm-mk-menu-wrap`, `.gm-mk-menu` |
| Modal wizard bits | `.gm-mk-stack`, `.gm-mk-options`, `.gm-mk-opt-icon`, `.gm-mk-processing`(`.spin`), `.gm-mk-success`(`-mark`), `.gm-mk-receipt(`-lg`)`, `.gm-mk-pay-note`, `.gm-mk-share-btns` |
| FAQ/glossary/alerts | `.gm-mk-faq`(`-row`), `.gm-mk-glossary`(`-row`), `.gm-mk-alert-list`, `.gm-mk-alert`(`.is-hot`, `-meta`), `.gm-mk-score-break`, `.gm-mk-phone`(`-num`) |

**Responsive:** KPI/card/option grids collapse at **1080px**, recommendation
rows reflow and toolbars go full-width at **640px**, scenario figures and
buyer/contract footers stack at **380px**; `@media print` hides toolbars,
footers and menu so prices and recommendations print cleanly. Reveal
motion inherits `prefers-reduced-motion`.

**Reusable widgets — `src/components/app/MarketWidgets.tsx`:** `MarketHero`,
`PriceRow`, `PriceTrendChart`, `RecommendationRow`, `BuyerCard`,
`ScenarioCard`, `SaleRow`, `ContractCard`, `MarketKv`, `MarketCallout`,
`MarketEmpty`. **Workflows:** `src/components/app/MarketModals.tsx` (21
dialogs/wizards: crop price detail, trend viewer with tabs, price alert
wizard, recommendation detail, buyer detail, contact-buyer OTP wizard,
scenario detail, activate-plan with OTP/PIN, sale detail, record-sale
wizard, contract detail, apply-contract wizard, transport compare, export,
share time-limited link, settings, FAQ/glossary, score breakdown, alerts
list, quick-phone, generic confirm). Money flows use Amount → OTP
(`123456`) → processing → receipt (QK/PL/SHK/MSG/AL/EXP prefixes).

**Page data:** `src/data/app/market.ts` — 10 crops across 8 Kenyan markets
with [low,high] price ranges and trend, 12-month Marikiti cabbage trend,
6 ranked market recommendations, 10 verified buyers (broker, supermarket,
restaurant, exporter, processor, cooperative, online), 4 harvest scenarios
with AI pick, 10 sale records with M-Pesa receipts, 6 contracts, 5 transport
options, 7-day price history, 8 FAQs and 8 glossary terms. Money uses
`kes()` from `data/site`; every price matches the blueprint table exactly.

## 19. Analytics & reporting layer (page 11 — `/app/analytics`)

Page-scoped stylesheet `src/analytics.css`, linked from `__root.tsx` after
`marketCss` (`analyticsCss` → `?url` + `?v=1`). Every selector is prefixed
with `.gm-app` or `.gm-modal-overlay`, token-only, no global `.gm-*`
component redefined.

**New `.gm-an-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + KPIs | `.gm-an-hero`(+`-head`, `-copy`, `-score`, `-grid`), `.gm-an-hero-score-num/-label`, `.gm-an-score-link` |
| 11.1 KPI tiles | `.gm-an-kpi-grid`, `.gm-an-kpi`(+`-icon/-label/-deltas`), `.gm-an-delta`(`-up/-down/-flat`) |
| 11.2 crop bars | `.gm-an-crop-grid`, `.gm-an-crop-bar-row/head/track/fill/meta`, `.gm-an-crop-emo`, `.gm-an-crop-rank`, `.gm-an-roi` |
| 11.3 cost bars | `.gm-an-cost-grid`, `.gm-an-cost-row/head/bar/fill`, `.gm-an-cost-ico/-pct` |
| 11.4 revenue chart | `.gm-an-rev-chart`, `.gm-an-rev-col/track/target/fill`(`.is-hit/.is-miss`, `-tip`) |
| 11.5 workers | `.gm-an-worker-row`, `.gm-an-w-ava`, `.gm-an-rating`, `.gm-an-worker-bars` |
| 11.6 weather impact | `.gm-an-wx-grid`, `.gm-an-wx-row`(`tone-good/warn/bad`), `.gm-an-wx-impact` |
| 11.8 reports | `.gm-an-report-grid`, `.gm-an-report`(`-icon/-body/-foot`), `.gm-an-report-use/-last` |
| Toolbar/menu | `.gm-an-toolbar`, `.gm-an-search`, `.gm-an-menu-wrap/-menu` |
| Builder walk | `.gm-an-builder-walk`, `.gm-an-step` |
| Shared KV/callouts | `.gm-an-kv`(`.is-2`, `-row/-k/-v`), `.gm-an-callout`(`tone-info/warn/good`), `.gm-an-check-list`, `.gm-an-options` |
| Modal wizard bits | `.gm-an-stack`, `.gm-an-processing`, `.gm-an-success`(`-mark`), `.gm-an-receipt(`-lg`)`, `.gm-an-share-btns` |
| FAQ/glossary/score | `.gm-an-faq(-row)`, `.gm-an-glossary(-row)`, `.gm-an-score-break` |

**Responsive:** KPI and report grids collapse at **1080px**, worker table
and report-card footers wrap at **640px**, hero grid stacks at **380px**;
`@media print` hides toolbars and footers for board-ready printouts.

**Reusable widgets — `src/components/app/AnalyticsWidgets.tsx`:**
`AnalyticsHero`, `DeltaChip`, `AnKpiCard`, `CropBar`, `CostRow`,
`RevenueBar`, `WorkerRow`, `WeatherRow`, `ReportCard`, `AnKv`, `AnCallout`.
**Workflows:** `src/components/app/AnalyticsModals.tsx` (13 dialogs/wizards:
KPI drilldown, crop comparison, worker detail, premade-report run wizard,
custom report builder wizard with OTP, report result viewer, loan
application preview, analytics export bundle, share dialog, settings, FAQ,
score breakdown, generic confirm). Generated reports issue `RPT-`/`CUSTOM-`/`BUNDLE-` receipt codes.

**Page data:** `src/data/app/analytics.ts` — 8 farm KPIs (exact blueprint
figures: 2.5 acres, KES 580,000 revenue, KES 210,000 expenses, KES 370,000
profit, 176% ROI, 15% labour, 8% post-harvest loss), 5 crops with yield/cost/
revenue/profit/ROI, 8 cost categories totalling KES 210,000, 7 revenue
months including January projection (435,000), 8 labour-efficiency metrics
+ 6 workers, 4 weather-impact rows, 9 custom-report metrics across 3 groups,
10 premade reports, 6 FAQs and 5 glossary terms. Money uses `kes()`.

## 20. Wallet, payments & mobile money layer (page 14 — `/app/wallet`)

Page-scoped stylesheet `src/wallet.css`, linked from `__root.tsx` after
`analyticsCss` (`walletCss` → `?url` + `?v=1`). Every selector is prefixed
with `.gm-app` or `.gm-modal-overlay`, token-only, and no global `.gm-*`
component is redefined.

**New `.gm-w-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| 14.1 hero + balance | `.gm-w-hero`(+`-head/-copy/-chips/-actions/-strip`), `.gm-w-balance`, `.gm-w-bal-row`(`.is-warn/.is-strong`), `.gm-w-bal-foot`, `.gm-w-action`(`.is-quiet`, `-ic`) |
| 14.2 deposit rails | `.gm-w-method-grid`, `.gm-w-method`(`-ic/-facts/-cta`) |
| 14.3 send / pay | `.gm-w-paytype-grid`, `.gm-w-paytype`(`.is-on`, `-hint`), `.gm-w-recipient-grid`, `.gm-w-recipient`(`-copy/-last`), `.gm-w-radio` |
| 14.4 auto-pay | `.gm-w-rule`(`.is-on/.is-off`, `-main/-head/-meta/-note/-actions`) |
| 14.5 ledger | `.gm-w-txn`, `.gm-w-dir`(`.in/.out`), `.gm-w-bal`, `.gm-w-method`, `.gm-w-ref`, `.gm-w-toolbar`, `.gm-field-inline`, `.gm-w-up` |
| 14.6 budgets | `.gm-w-budget-grid`, `.gm-w-budget`(`-head/-emoji/-figures`) |
| 14.7 security | `.gm-w-sec`(`-ic/-copy`), `.gm-w-limit`(`-head`) |
| Shared | `.gm-w-kv`(`-row`/`dt`/`dd`), `.gm-w-callout`(`.is-info/.is-good/.is-warn`), `.gm-w-faq(-row)`, `.gm-w-glossary` |
| Modal wizard bits | `.gm-w-wizard`, `.gm-w-note`(`.is-small`), `.gm-w-quick-amounts`, `.gm-w-steps`, `.gm-w-processing`(+`spin`), `.gm-w-receipt-block/-mark/-amount/-note`, `.gm-w-paytype-grid` |

**Responsive:** hero stacks and the balance panel goes full width at
**1080px**; deposit, pay-type, budget and recipient grids collapse to one
column at **640px**; the hero action strip stacks at **380px**;
`@media print` strips the hero background, the action strip and the toolbar.

**Reusable widgets — `src/components/app/WalletWidgets.tsx`:**
`WalletHero`, `TxnRow`, `DepositMethodCard`, `PayTypeCard`, `RecipientCard`,
`AutopayRuleRow`, `BudgetCard`, `SecurityRow`, `WalletKv`, `WalletCallout`,
`LimitMeter`, `WalletFaqList`, `WalletGlossary`.
**Workflows:** `src/components/app/WalletModals.tsx` (11 dialogs/wizards:
deposit wizard across all five rails, send/pay wizard with bank, biller and
P2P rails, withdraw wizard, transaction detail with reversal request, auto-pay
rule editor, budget allocation, add payee, statement share link, wallet
settings, fraud/freeze confirmation and a generic confirm). Receipts use
`DEP-`, `PL-`, `WDR-`, `PAYEE-`, `QK-` codes and OTP/PIN `123456`.

**Page data:** `src/data/app/wallet.ts` — blueprint wallet figures (KES 35,000
available, 20,000 in budgets, 15,000 free, 4,500 pending, 10,500 effective,
60,000 deposits, 35,500 spend, 50,000 daily and 500,000 monthly limits),
5 deposit rails with min/max/fee/speed, 5 pay rails, 6 saved payees, 4
auto-pay rules, the 14-row October ledger (John/Peter/Grace weeding at KES 500,
M-Pesa `QJK3L5X7YZ`/`PLM8NR2KQW`/`RTY9PV3NXM`, `SHK4RT9AB` deposit, DAP
purchase, monthly subscription), three budget envelopes, nine security
controls, 6 FAQs and 8 glossary terms. Money uses `kes()`.

## 21. Settings, team & permissions layer (page 15 — `/app/settings`)

Page-scoped stylesheet `src/settings.css`, linked from `__root.tsx` after
`walletCss` (`settingsCss` → `?url` + `?v=1`), prefix `.gm-app` /
`.gm-modal-overlay`, token-only.

**New `.gm-st-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + stats | `.gm-st-hero`(+`-top/-copy/-actions/-stats`), `.gm-st-stat` |
| 15.1 profile | `.gm-st-profile`(+`-copy/-chips`), `.gm-st-avatar`, `.gm-st-groups`, `.gm-st-group`, `.gm-st-panel-note`(`.is-good/.is-warn`) |
| 15.2 plots | `.gm-st-plot-grid`, `.gm-st-plot`(`-head/-icon/-cta`) |
| 15.3 team | `.gm-st-member-grid`, `.gm-st-member`(`-head/-ava/-line/-foot/-tasks`), `.gm-st-roles`, `.gm-st-role`(`-ic`), `.gm-st-matrix-wrap`, `.gm-st-matrix`(`td.is-y/.is-l/.is-n`, `.is-plans`), `.gm-st-matrix-note` |
| 15.3 HR | `.gm-st-hr`, `.gm-st-row-actions`, `.gm-st-list`(`.is-grid`), `.gm-st-checklist`(`.is-action`), `.gm-st-check`, `.gm-st-rating`, `.gm-st-bars`, `.gm-st-bar`, `.gm-st-payroll-head`, `.gm-st-compliance(-row/-track)`, `.gm-st-good`, `.gm-st-warn` |
| 15.4 notifications | `.gm-st-notif`(`-copy/-channels`), `.gm-st-toggle`(`.is-on`) |
| 15.5 data | `.gm-st-data-list`, `.gm-st-data`(`.is-info/.is-good/.is-warn`) |
| 15.6 plans | `.gm-st-plan-grid`, `.gm-st-plan`(`.is-current/.is-featured`, `-head/-icon/-price/-features/-badge`) |
| FAQ/footer | `.gm-st-faq(-row)`, `.gm-st-glossary`, `.gm-st-footer-note` |
| Modal wizard bits | `.gm-st-form`(`.is-two`), `.gm-st-note`, `.gm-st-processing`(+`spin`), `.gm-st-receipt`(`-mark`), `.gm-st-plan-grid` |

**Responsive:** matrix padding tightens and compliance rows stack at
**1080px**; two-column key/value and form grids collapse at **860px**; hero
stats, plot, member and plan grids collapse at **640px**; stats stack at
**380px**; `@media print` hides the action row, menu wrapper and tabs.

**Reusable widgets — `src/components/app/SettingsWidgets.tsx`:**
`SettingsHero`, `ProfileCard`, `ProfileFieldGroups`, `FarmPlotCard`,
`FarmDefaults`, `TeamMemberCard`, `PermissionMatrix`, `RoleLegend`,
`WorkerRow`, `HrPanel` (eight HR tabs), `NotifRow`, `PlanCard`,
`PlanComparison`, `DataRow`, `KvList`, `SettingsFaqList`, `SettingsGlossary`.
**Workflows:** `src/components/app/SettingsModals.tsx` (11 dialogs/wizards:
three-step invite with owner OTP, member role editor, profile editor, plot
editor, plan switcher, OTP-gated data action (export, retention, buyer list,
deletion), worker detail with inline pay-by-PIN, weekly payroll run with
batch receipts, job posting, onboarding checklist and a generic confirm).
Receipts use `INV-`, `SHL`/`SHK`, `PAY-`, `JOB-`, `SET-`, `DEL-` codes.

**Page data:** `src/data/app/settings.ts` — the 15.1 profile fields, 6 farm
plots with soil and pH, 6 role definitions, the 13 × 6 permission matrix, 6
team members with financial and payment authority plus validity windows, 6
worker records with 30+ fields each, job post + 4 channels + 8 onboarding
steps, 5 attendance methods with adoption, today's register and a monthly
summary, 5 performance ratings + John Mwangi's performance card, 6 payslips
totalling KES 9,312.50, 4 advances/deductions, 12 Kenyan labour compliance
requirements, 9 labour analytics rows, 10 notification rows across push/SMS/
WhatsApp/email, 6 data & privacy settings, three plans with the full blueprint
feature comparison table, 6 FAQs and 5 glossary terms.

## 22. Mobile, offline, USSD & SMS layer (page 16 — `/app/channels`)

Page-scoped stylesheet `src/channels.css`, linked from `__root.tsx` after
`settingsCss` (`channelsCss` → `?url` + `?v=1`), prefix `.gm-app` /
`.gm-modal-overlay`, token-only.

**New `.gm-ch-*` classes by blueprint section:**

| Blueprint section | Classes |
|---|---|
| Hero + stats | `.gm-ch-hero`(+`-top/-copy/-actions/-stats`), `.gm-ch-stat` |
| 16.1 offline | `.gm-ch-banner`(`.is-offline/.is-syncing`, `-ic`), `.gm-ch-queue`(`-head/-meta`), `.gm-ch-tips`, `.gm-ch-tip`, `.gm-ch-savers` |
| 16.2 USSD | `.gm-ch-phone-wrap`, `.gm-ch-phone`(`-notch/-screen/-status/-code/-log/-line`, `-menu/-key/-foot`), `.gm-ch-phone-input`, `.gm-ch-ussd-notes` |
| 16.3 SMS | `.gm-ch-sms-console`, `.gm-ch-sms-phone`(`-head/-thread/-compose`), `.gm-ch-sms-out/-in`, `.gm-ch-sms-commands`, `.gm-ch-sms-command` |
| 16.4 WhatsApp | `.gm-ch-wa`(+`-chat/-head/-body/-msg/-photo/-quick/-btn/-side/-features`) |
| 16.5 agents | `.gm-ch-agents`, `.gm-ch-agent`(`-head/-ava/-addr/-meta/-services/-actions`) |
| Shared | `.gm-ch-kv`(`-row`/`dt`/`dd`), `.gm-ch-faq(-row)`, `.gm-ch-glossary`, `.gm-ch-footer-note` |
| Modal wizard bits | `.gm-ch-form`, `.gm-ch-quick`, `.gm-ch-note`(`.is-small`), `.gm-ch-install`, `.gm-ch-processing`(+`spin`), `.gm-ch-done`(`-mark`) |

**Responsive:** the phone/console/chat three two-column layouts collapse to one
column and the handset is centred at **1080px**; hero stats, agent grid and
SMS command grid collapse at **640px**; stats stack at **380px**;
`@media print` hides tabs, hero actions and the tools menu, and keeps the
phone, SMS and chat mocks unbroken.

**Reusable widgets — `src/components/app/ChannelsWidgets.tsx`:**
`ChannelsHero`, `OfflineBanner`, `OfflineFeatureTable`, `SyncQueue`,
`OfflineTips`, `DataSaverList`, `UssdPhone` (a real navigable menu tree),
`SmsConsole` (live keyword responder), `SmsFacts`, `SmsCommandRow`,
`WhatsAppPanel`, `AgentsPanel`, `AgentProgramme`, `KvPairs`,
`ChannelsFaqList`, `ChannelsGlossary`.
**Workflows:** `src/components/app/ChannelsModals.tsx` (7 dialogs: three-step
PWA install, offline action simulator that queues or posts, agent cash-in with
OTP, agent registration, USSD help, SMS command list, WhatsApp bot help and the
channel FAQ/glossary). Receipts use `QUEUE-`, `LIVE-`, `DEP-`, `AGENT-` codes.

**Page data:** `src/data/app/channels.ts` — the 10 offline capabilities with
queue limits and conflict rules, 2 queued actions with GPS, 20 USSD screens
covering weather, tasks, wallet, prices, AI, payments, crops and help in
Kiswahili, 8 SMS commands with exact replies, 3 WhatsApp diagnosis examples,
8 bot capabilities, 3 agents with float and services, the agent programme
terms, 6 FAQs, 7 glossary terms and 4 data-saver modes. Shortcodes are
`*384#`, `20550` and `0700 000 384`; money uses `kes()`.

---

## 23. Contrast safety (app-wide — added after the Sep 2026 appearance audit)

Root causes found on the shipped app pages:

1. **Undefined design tokens.** 53 of the 118 referenced `var(--gm-*)` names
   were never defined (e.g. `--gm-ink-500`, `--gm-leaf-400`, `--gm-deep`,
   `--gm-surface`, `--gm-radius-md`, `--gm-white-10`). An undefined `var()`
   without a fallback makes the whole declaration invalid at computed-value
   time, so backgrounds fell back to transparent and `color` fell back to
   *inherit* — that is what produced white-on-white text. All scale steps are
   now defined in `:root` (121 tokens); the audit rule is **zero undefined
   `var(--gm-*)` references**.
2. **Light surfaces nested in dark heroes.** `.gm-app .gm-plan-head` sets
   `color: var(--gm-card)`, which every descendant inherits — including white
   `.gm-card` KPI tiles → white text on white cards.
3. **Global heading default beats inheritance.** `h1..h5 { color:
   var(--gm-ink-950) }` painted near-black headings onto dark hero gradients.

The rules that keep this fixed (all in `src/styles.css`, appended as §23):

```css
/* 1 — light surfaces reset ink */
.gm-card, .gm-check-row, .gm-stat { color: var(--gm-ink-800); }

/* 2 — headings inside dark heroes/panels inherit the surface colour */
.gm-app .gm-plan-head h1, … .gm-app .gm-d-hero h3 { color: inherit; }

/* 3 — muted text inside dark heroes */
.gm-app .gm-plan-head .gm-check-row small { color: var(--gm-ink-500); }

/* 4 — one hero-title scale app-wide (matches pages 12/13/17) */
.gm-app .gm-plan-head h1, .gm-app .gm-mk-hero h1, .gm-app .gm-an-hero h1,
.gm-app .gm-w-hero h1, .gm-app .gm-st-hero h1, .gm-app .gm-ch-hero h1,
.gm-app .gm-rec-hero h1, .gm-app .gm-soil-hero h1, .gm-app .gm-cm-hero h1 {
  font-size: clamp(1.9rem, 4.2vw, 3rem); font-weight: 700;
  line-height: 1.06; letter-spacing: -0.03em;
}

/* 5 — `.gm-h-section` inside the app is an in-card section title */
.gm-app h2.gm-h-section, .gm-app h3.gm-h-section, … { font-size: 1.15rem; }
```

**Type scale now used by every app page**

| Element | Spec |
|---|---|
| Page hero `h1` | Fraunces 700 · `clamp(1.9rem, 4.2vw, 3rem)` · line-height 1.06 · tracking -0.03em |
| In-card section title (`h2/h3.gm-h-section`) | Fraunces 700 · `1.15rem` |
| Sub-section `h3.font-display` | Fraunces 500 · `1.75rem` |
| Body / labels / buttons | Plus Jakarta Sans |
| Codes, receipts, phone keys, USSD/SMS mocks | `var(--gm-font-mono)` |

**Also fixed in the same pass**

- `.gm-chip-lime` is now a solid lime pill with `--gm-forest-950` text, so it
  reads on both dark heroes and white cards (it used to be pale lime text on a
  translucent lime fill → invisible on light surfaces).
- `.gm-ava` owns its surface (`--gm-grad-primary`), so initials are readable on
  white cards; inline `background` (auth hub) still wins.
- `.gm-plan-compare-tray` gets its dark surface back (`--gm-deep` now defined).
- Market/analytics hero KPI tiles were translucent glass on a dark gradient but
  their values used the dashboard's deep-ink default → hero-scoped overrides in
  `market.css` / `analytics.css`.
- `dashboard.tsx` weather hero carries `.gm-d-hero` so its `h2` inherits the
  hero's light colour.

**Verification harness (not in the repo):** a CSS-cascade + WCAG-contrast audit
(`/tmp/audit/audit.mjs`) that parses Bootstrap + all 13 project stylesheets,
resolves `var()` chains, composites translucent/gradient backdrops and reports
every text node below 3:1. Result: **0 findings on all 17 app routes at 1440px
and 390px** (was 100+ findings, including pure 1.00 white-on-white).
