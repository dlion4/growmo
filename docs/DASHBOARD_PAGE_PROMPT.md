# Dashboard Page Build Prompt (reusable ×25)

> **How to use:** copy everything below the line, fill the CONFIG block for the
> page you want, paste the blueprint sections for that page, and send it to the
> AI agent. Use once per page, in any order. For page 1, keep `CREATE_SHELL=true`;
> for all later pages set `CREATE_SHELL=false`.

---

```text
You are building ONE GrowMO dashboard page inside the repo dlion4/growmo
(TanStack Start + React 19 + Bootstrap utilities + Lucide icons).

## CONFIG (edit per page)
PAGE_NUMBER  = 1
ROUTE        = /app/onboarding
TITLE        = Onboarding & Farm Profile
DATA_FILE    = src/data/app/onboarding.ts
CREATE_SHELL = true   # true ONLY for the first dashboard page you build

## BLUEPRINT (paste the exact page section from growmo.md / growmo-p2.md)
<PASTE HERE — e.g. "## PAGE 1: Onboarding & Farm Profile" through its last
section table. Do not summarize; the AI must implement every listed section.>

## MANDATORY FIRST READS (open before writing any code)
1. docs/MASTER_THEME.md — the design bible; obey every rule in it.
2. src/styles.css — skim the § map; reuse classes, never invent styles.
3. src/data/site.ts + src/data/auth.ts — reuse helpers (kes()), data shapes.
4. src/components/auth/controls.tsx + src/components/auth/shell.tsx + 
   src/components/ui/primitives.tsx — reuse Dialog, Stepper, OtpInput, PinPad,
   Toggle, ScoreRing, Reveal, Pagination, etc. Never rebuild them.
5. If CREATE_SHELL=false: src/components/app/AppShell.tsx — you MUST render
   inside it and set your route ready:true in its nav config (no other edits).

## WHAT TO BUILD
1. Route file for ROUTE implementing EVERY blueprint section (tables → tables/
   cards/forms; workflows → wizards/dialogs; lists → filterable, paginated).
2. DATA_FILE with realistic Kenyan demo data (KES, 07XX phones, real counties/
   crops/varieties, Kiswahili microcopy). No lorem ipsum, ever.
3. Reusable widgets → src/components/app/ (check dir first; no duplicates).
4. (Retired — the AppShell, nav config, and __root isApp chrome already
   exist. Never rebuild them; only flip your route to ready:true.)

## DESIGN CONSTRAINTS (anti-hallucination — zero exceptions)
- Style ONLY with master-theme classes/tokens; no hex/rgb in .tsx (use
  var(--gm-*)); no new fonts, colors, or libraries.
- Typography: .gm-h-section/.gm-lead/.gm-eyebrow/.font-display; numbers and
  prices in Fraunces via .font-display.
- Cards .gm-card; rows .gm-check-row; tables .gm-table-wrap>.gm-table;
  status via .gm-risk-* + .gm-chip; forms via .gm-field/.gm-input/.gm-select;
  filters via .gm-filter-chip; lists paginated with <Pagination>.
- Motion: .gm-reveal on scroll blocks; hover lifts come free from theme.
- Responsive: multi-col grids must stack at 1080px/640px using existing
  patterns (row/col classes, .gm-split, .gm-board). Test mentally at 360px.
- If a needed class truly doesn't exist: append it to styles.css as §18+ using
  tokens only, and document it in docs/MASTER_THEME.md. Last resort.

## FUNCTIONAL RULES
- EVERY button/link works: actions fire useToast().notify() feedback, open
  Dialog wizards, or navigate to a REAL route. Zero dead controls; zero 404s.
- Wizards use <Stepper>; destructive actions use confirm Dialogs; long lists
  get search + filter + pagination; money flows end in M-Pesa-style confirm
  + toast (simulate with timeout + spinner, like existing pages).
- Kenyan realism throughout; EN primary with Kiswahili touches.

## VERIFICATION PROTOCOL (must all pass before finishing)
1. npm run generate-routes && npm run build — clean, no errors.
2. Dev server curl ROUTE → HTTP 200 (start server on 0.0.0.0 if needed).
3. Grep route+data files: no console.log, TODO, lorem, or #[0-9a-f] hex.
4. Every <Link to> target exists in src/routeTree.gen.ts.
5. Commit + push ONLY to the current session branch (never switch branches).

## DELIVERABLE
Reply with: route built, sections implemented (checklist vs blueprint),
reused vs new components, verification results, commit hash.
DO NOT redesign the theme. DO NOT skip blueprint sections. Build to completion.
```
