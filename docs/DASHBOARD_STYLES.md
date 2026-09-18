# GrowMO Dashboard Styles — `src/dashboard.css`

> **Two stylesheets, one brand.**
> `src/styles.css` is the **master theme** (marketing + shop + auth + the base
> dashboard shell). `src/dashboard.css` is an **additive dashboard layer**.
> Dashboard work goes in `dashboard.css`; the master theme stays untouched.

**Load order** (`src/routes/__root.tsx`):

```
styles.css    ← master theme   (single source of truth, do not edit for app work)
dashboard.css ← dashboard layer (loaded after, scoped to the /app shell)
```

Both are cache-busted with `?v=` — bump the number whenever you change a file.

---

## The no-clash contract

`dashboard.css` obeys four rules so it can never collide with the master theme:

1. **Scoped selectors only.** Every rule is prefixed with `.gm-app`
   (the AppShell root) — nothing targets bare `body`, `h1`, `p`, or a global
   `.gm-*` component that the marketing site also uses.
2. **No token redefinition.** Master tokens (`--gm-*`) are only *read*.
   Dashboard-only tokens live in their own `--gm-d-*` namespace.
3. **No new global keyframes.** Dashboard animations are named
   `gm-dash-*` so they can never override `gm-fade`, `gm-pop`, …
4. **Order does the work.** Because it loads last, equal-specificity rules win
   without a single `!important` — except for the collapsed-rail text hiding,
   which must beat the master's mobile `display: revert !important`.

## Dashboard tokens (`--gm-d-*`)

| Token | Default | Use |
|---|---|---|
| `--gm-d-side` | `248px` (→ `68px` collapsed) | Sidebar width |
| `--gm-d-side-collapsed` | `68px` | Icon-rail width |
| `--gm-d-rail` / `--gm-d-rail-soft` | white 9% / 5.5% | Hairlines + hovers on the dark rail |
| `--gm-d-ink` / `--gm-d-ink-dim` | `#e7f2e4` / `#9dc08f` | Rail text / captions |
| `--gm-d-top` | `64px` | Topbar height |
| `--gm-d-ease` | `cubic-bezier(.22,1,.36,1)` | Shell motion |

## What lives in here

| § | Section |
|---|---|
| 1–2 | Tokens + shell grid (`.gm-app`, `.gm-app-main`, `.gm-app-content`, `.gm-app-inner`) |
| 3 | Sidebar: brand, groups, links, **collapsed icons-only rail**, footer, collapse button |
| 4 | Topbar: title, search, chips, actions, dropdown menus |
| 5 | `.gm-drop-close` — full-screen click-catcher so menus can't get stuck open |
| 6–7 | Content scaffolding + dashboard widgets (`.gm-dash-head`, `.gm-dash-card`, `.gm-progress`, `.gm-setup-grid`, `.gm-stat-grid`, `.gm-module-grid`) |
| 8 | Drawers + scrim (**closed = invisible + non-interactive**) |
| 9 | Command palette |
| 10 | Reveal neutraliser + reduced-motion |
| 11–12 | Responsive + print |

---

## Sidebar behaviour

| State | Width | Content |
|---|---|---|
| Expanded | 248px | icon + one-word label (+ optional count/badge/dot) |
| **Collapsed** | **68px** | **icon only — every text node is `display:none`** |
| Mobile (≤1023px) | 264px off-canvas | full sidebar, opens with `.is-open` |

While collapsed, group captions are replaced by a hairline divider and labels
are still available as native `title` tooltips (no clipping, no JS).

## Overlay safety — "stuck drawer" rules

The dashboard can never be blocked by an overlay:

- **Closed drawers/scrims** are `visibility: hidden; pointer-events: none`
  (dashboard.css §8) — they cannot cover the page even mid-animation.
- Opening a drawer also applies `.is-visible` to its scrim, so it is always
  click-to-close.
- Scroll locking goes through `src/store/scroll-lock.ts` (reference counter),
  so a modal and the shell can't clear each other's lock.
- `clearStaleScrollLock()` runs on mount and on every route change: if no
  overlay is open in the DOM, any leftover `overflow:hidden` is dropped.
- Pages can force everything shut with
  `window.dispatchEvent(new Event('close-appshell-drawers'))` (or
  `gm-app:close-overlays`) — the AppShell listens for both.
- `Esc` closes palette, dropdowns, drawers and the mobile menu.

## Adding a dashboard style later

1. Put it in `src/dashboard.css` under the matching `§` section.
2. Prefix the selector with `.gm-app` (or nest it inside one).
3. Reuse master tokens; add new ones as `--gm-d-*`.
4. Bump `?v=` on the `dashboardCss` link in `src/routes/__root.tsx`.
