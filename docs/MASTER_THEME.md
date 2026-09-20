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
