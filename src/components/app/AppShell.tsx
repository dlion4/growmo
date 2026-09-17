/* ============================================================================
   GrowMO AppShell — dashboard layout for ALL /app/* pages.
   Collapsible dark sidebar (icons-only ↔ icons+labels), dropdown/drawer
   topbar, command palette, notifications + help drawers. Pages render as
   {children}. Styled ONLY with master-theme classes (§18).
   ========================================================================== */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDollarSign,
  ClipboardList,
  CloudSun,
  Copy,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  Repeat,
  Search,
  Settings,
  Smartphone,
  Sprout,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { APP_NAV, findNavItem } from "../../data/app/nav";
import { APP_FORECAST, APP_NOTES, APP_WALLET, type AppNote } from "../../data/app/shell";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

const NOTE_ICON = { alert: TriangleAlert, money: CircleDollarSign, task: ClipboardList } as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("gm-app-collapsed") === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<"notes" | "help" | null>(null);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [hl, setHl] = useState(0);
  const [lang, setLang] = useState("EN");
  const [notes, setNotes] = useState<AppNote[]>(APP_NOTES);

  useEffect(() => {
    try {
      localStorage.setItem("gm-app-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
    setDrawer(null);
    setDrop(null);
    setPalette(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        setQuery("");
        setHl(0);
      }
      if (e.key === "Escape") {
        setPalette(false);
        setDrop(null);
        setDrawer(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || drawer || palette ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, drawer, palette]);

  const found = findNavItem(pathname);
  const unread = notes.filter((n) => n.unread).length;
  const toggleDrop = (id: string) => setDrop(drop === id ? null : id);
  const soon = (label: string) => toast.notify(`${label} module is coming soon — hang tight`, "info");
  const markAllRead = () => {
    setNotes((ns) => ns.map((n) => ({ ...n, unread: false })));
    toast.notify("All caught up!");
  };

  const paletteActions = useMemo(() => {
    const pages = APP_NAV.flatMap((g) =>
      g.items.map((i) => ({
        icon: i.icon,
        label: i.label,
        hint: i.ready ? g.label : "Coming soon",
        run: () => (i.ready ? navigate({ to: i.to }) : soon(i.label)),
      })),
    );
    return [
      ...pages,
      {
        icon: Copy,
        label: "Copy USSD code *384*66#",
        hint: "Kabambe access",
        run: () => {
          try {
            navigator.clipboard.writeText("*384*66#");
          } catch {
            /* noop */
          }
          toast.notify("USSD code copied", "info");
        },
      },
      {
        icon: Bell,
        label: "Mark all notifications read",
        hint: `${unread} unread`,
        run: markAllRead,
      },
      {
        icon: LogOut,
        label: "Sign out",
        hint: "Back to login",
        run: () => navigate({ to: "/auth/login" }),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, unread]);

  const filtered = paletteActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const currentAction = filtered[Math.min(hl, Math.max(filtered.length - 1, 0))];

  return (
    <div className={`gm-app ${collapsed ? "is-collapsed" : ""}`}>
      {/* mobile sidebar scrim */}
      <div className={`gm-scrim ${mobileOpen ? "is-visible" : ""}`} onClick={() => setMobileOpen(false)} />

      {/* ================= SIDEBAR ================= */}
      <aside className={`gm-app-side ${mobileOpen ? "is-open" : ""}`} aria-label="Dashboard navigation">
        <div className="gm-app-brand">
          <Link to="/app" className="gm-app-logo" aria-label="GrowMO Farm OS home">
            <span className="gm-logo-mark">
              <Sprout />
            </span>
            <span className="gm-app-logo-text">
              <strong>
                Grow<em>MO</em>
              </strong>
              <small>Farm OS</small>
            </span>
          </Link>
          <button className="gm-icon-btn on-dark gm-only-mobile" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>

        <nav className="gm-app-nav">
          {APP_NAV.map((g) => (
            <div key={g.id} className="gm-app-group">
              <p className="gm-app-cap">{g.label}</p>
              {g.items.map((item) => {
                const active = pathname === item.to;
                const inner = (
                  <>
                    <span className="gm-app-link-icon">
                      <item.icon />
                    </span>
                    <span className="gm-app-link-text">
                      <strong>{item.label}</strong>
                      <small>{item.desc}</small>
                    </span>
                    {item.count !== undefined ? (
                      <span className="gm-app-count">{item.count}</span>
                    ) : item.badge ? (
                      <span className="gm-app-badge">{item.badge}</span>
                    ) : null}
                    {!item.ready && <span className="gm-app-soon">Soon</span>}
                  </>
                );
                return item.ready ? (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    className={`gm-app-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    key={item.to}
                    type="button"
                    title={`${item.label} — coming soon`}
                    className="gm-app-link is-soon-link"
                    onClick={() => {
                      setMobileOpen(false);
                      soon(item.label);
                    }}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="gm-app-side-foot">
          <button
            type="button"
            className="gm-app-link gm-app-help"
            onClick={() => {
              setMobileOpen(false);
              setDrawer("help");
            }}
          >
            <span className="gm-app-link-icon">
              <LifeBuoy />
            </span>
            <span className="gm-app-link-text">
              <strong>Get help</strong>
              <small>0800 221 000</small>
            </span>
          </button>
          <button
            type="button"
            className="gm-app-collapse gm-only-desktop"
            onClick={() => {
              setCollapsed(!collapsed);
              toast.notify(collapsed ? "Sidebar expanded" : "Sidebar collapsed — icons only", "info");
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
            <span>{collapsed ? "Expand" : "Collapse"}</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="gm-app-main">
        <header className="gm-app-top">
          <button className="gm-icon-btn gm-only-mobile" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <div className="gm-app-title">
            <small>{found ? found.group.label : "Farm OS"}</small>
            <strong>{found ? found.item.label : "Getting started"}</strong>
          </div>

          <button type="button" className="gm-app-search" onClick={() => { setPalette(true); setQuery(""); setHl(0); }}>
            <Search />
            <span>Search modules…</span>
            <kbd>⌘K</kbd>
          </button>

          <div className="gm-app-actions">
            {/* weather dropdown */}
            <div className={`gm-dropdown ${drop === "weather" ? "is-open" : ""}`}>
              <button
                type="button"
                className="gm-app-chip"
                onClick={() => toggleDrop("weather")}
                aria-expanded={drop === "weather"}
                aria-label="Weather"
              >
                <CloudSun /> <span className="hide-sm">{APP_FORECAST.temp} · {APP_FORECAST.rain}</span> <ChevronDown />
              </button>
              <div className="gm-dropdown-menu gm-app-menu">
                <p className="gm-app-menu-cap">{APP_FORECAST.place}</p>
                {APP_FORECAST.rows.map((r) => (
                  <div key={r.d} className="gm-forecast-row">
                    <small>{r.d}</small>
                    <div className="gm-forecast-bar">
                      <i style={{ width: r.w }} />
                    </div>
                    <small>{r.t}</small>
                  </div>
                ))}
                <button type="button" className="gm-btn gm-btn-soft gm-btn-sm gm-btn-block mt-2" onClick={() => soon("Weather")}>
                  Full forecast <ArrowRight width={14} height={14} />
                </button>
              </div>
            </div>

            {/* wallet dropdown */}
            <div className={`gm-dropdown ${drop === "wallet" ? "is-open" : ""}`}>
              <button
                type="button"
                className="gm-app-chip gm-app-chip-money"
                onClick={() => toggleDrop("wallet")}
                aria-expanded={drop === "wallet"}
                aria-label="Wallet"
              >
                <Wallet /> <span className="hide-sm">{kes(APP_WALLET.balance)}</span> <ChevronDown />
              </button>
              <div className="gm-dropdown-menu gm-app-menu">
                <p className="gm-app-menu-cap">GrowMO Wallet · {APP_WALLET.phone}</p>
                <p className="gm-wallet-balance">{kes(APP_WALLET.balance)}</p>
                <small style={{ fontWeight: 700, color: "var(--gm-ink-400)" }}>
                  +{kes(APP_WALLET.pending)} pending from buyers
                </small>
                <div className="d-flex gap-2 mt-2">
                  <button
                    type="button"
                    className="gm-btn gm-btn-mpesa gm-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => toast.notify("M-Pesa push sent — enter PIN")}
                  >
                    Top up
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => soon("Wallet")}
                  >
                    Open wallet
                  </button>
                </div>
              </div>
            </div>

            {/* quick add dropdown */}
            <div className={`gm-dropdown ${drop === "add" ? "is-open" : ""}`}>
              <button
                type="button"
                className="gm-btn gm-btn-sm"
                onClick={() => toggleDrop("add")}
                aria-expanded={drop === "add"}
              >
                <Plus /> <span className="hide-sm">New</span>
              </button>
              <div className="gm-dropdown-menu">
                <button type="button" className="gm-dropdown-item" onClick={() => soon("Crop Planner")}>
                  <Sprout width={16} height={16} /> New crop plan
                </button>
                <button type="button" className="gm-dropdown-item" onClick={() => soon("Finance")}>
                  <Wallet width={16} height={16} /> Record expense
                </button>
                <button type="button" className="gm-dropdown-item" onClick={() => soon("Labour")}>
                  <ClipboardList width={16} height={16} /> Schedule task
                </button>
                <Link to="/shop" className="gm-dropdown-item">
                  <Smartphone width={16} height={16} /> Order inputs
                </Link>
              </div>
            </div>

            {/* notifications drawer */}
            <button type="button" className="gm-icon-btn" onClick={() => setDrawer("notes")} aria-label={`Notifications, ${unread} unread`}>
              <Bell />
              {unread > 0 && <span className="gm-count">{unread}</span>}
            </button>

            {/* language dropdown */}
            <div className={`gm-dropdown ${drop === "lang" ? "is-open" : ""}`}>
              <button
                type="button"
                className="gm-app-chip"
                onClick={() => toggleDrop("lang")}
                aria-expanded={drop === "lang"}
                aria-label="Language"
              >
                <span style={{ fontWeight: 900, fontSize: ".8rem" }}>{lang}</span> <ChevronDown />
              </button>
              <div className="gm-dropdown-menu" style={{ minWidth: 150 }}>
                {["EN", "SW"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`gm-dropdown-item ${l === lang ? "is-active" : ""}`}
                    onClick={() => {
                      setLang(l);
                      setDrop(null);
                      toast.notify(l === "SW" ? "Lugha: Kiswahili (hivi punde)" : "Language: English", "info");
                    }}
                  >
                    {l === lang && <Check width={15} height={15} />} {l === "EN" ? "English" : "Kiswahili"}
                  </button>
                ))}
              </div>
            </div>

            {/* avatar dropdown */}
            <div className={`gm-dropdown ${drop === "avatar" ? "is-open" : ""}`}>
              <button
                type="button"
                className="gm-app-avatar-btn"
                onClick={() => toggleDrop("avatar")}
                aria-expanded={drop === "avatar"}
                aria-label="Account menu"
              >
                <span className="gm-avatar" style={{ background: "var(--gm-grad-primary)", width: 40, height: 40 }}>
                  MW
                </span>
              </button>
              <div className="gm-dropdown-menu gm-app-menu">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="gm-avatar" style={{ background: "var(--gm-grad-primary)" }}>MW</span>
                  <span>
                    <strong style={{ display: "block", fontSize: ".88rem" }}>Mary Wanjiku</strong>
                    <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>Owner · Mary's Farm</small>
                  </span>
                </div>
                <button type="button" className="gm-dropdown-item" onClick={() => soon("Farm Profile")}>
                  <Settings width={16} height={16} /> Farm profile
                </button>
                <Link to="/auth/hub" className="gm-dropdown-item">
                  <Repeat width={16} height={16} /> Switch workspace
                </Link>
                <Link to="/auth/login" className="gm-dropdown-item" style={{ color: "var(--gm-clay-500)" }}>
                  <LogOut width={16} height={16} /> Sign out
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main key={pathname} className="gm-app-content">
          <div className="gm-app-inner">{children}</div>
          <footer className="gm-app-foot">
            <span>GrowMO Farm OS · v3.2</span>
            <span className="hide-sm">USSD *384*66# · Helpline 0800 221 000</span>
            <Link to="/">View website</Link>
          </footer>
        </main>
      </div>

      {/* transparent layer to close dropdowns */}
      {drop && (
        <button type="button" aria-hidden="true" tabIndex={-1} className="gm-drop-close" onClick={() => setDrop(null)} />
      )}

      {/* ================= RIGHT DRAWERS ================= */}
      <div className={`gm-scrim ${drawer ? "is-visible" : ""}`} onClick={() => setDrawer(null)} />
      <aside className={`gm-drawer ${drawer ? "is-visible" : ""}`} aria-label={drawer === "notes" ? "Notifications" : "Help"}>
        <div className="gm-drawer-head">
          <strong style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            {drawer === "notes" ? <Bell width={20} height={20} /> : <LifeBuoy width={20} height={20} />}
            {drawer === "notes" ? `Notifications (${unread} new)` : "Help & support"}
          </strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={() => setDrawer(null)} aria-label="Close panel">
            <X />
          </button>
        </div>
        <div className="gm-drawer-body">
          {drawer === "notes" && (
            <>
              <button type="button" className="gm-btn gm-btn-soft gm-btn-sm gm-btn-block mb-3" onClick={markAllRead}>
                <Check width={15} height={15} /> Mark all read
              </button>
              {notes.map((n) => {
                const Icon = NOTE_ICON[n.kind];
                return (
                  <div key={n.id} className="gm-check-row" style={n.unread ? { borderColor: "var(--gm-leaf-500)" } : undefined}>
                    <span className="gm-mega-icon">
                      <Icon />
                    </span>
                    <span style={{ flex: 1 }}>
                      <strong>{n.title}</strong>
                      <small>
                        {n.desc} · {n.at}
                      </small>
                    </span>
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={() => {
                        setNotes((ns) => ns.filter((x) => x.id !== n.id));
                        toast.notify("Notification dismissed", "info");
                      }}
                      style={{ border: "none", background: "none", color: "var(--gm-ink-400)", cursor: "pointer" }}
                    >
                      <X width={16} height={16} />
                    </button>
                  </div>
                );
              })}
              {notes.length === 0 && (
                <div className="gm-empty">
                  <h4 className="font-display">All caught up 🎉</h4>
                  <p className="text-muted">No notifications right now.</p>
                </div>
              )}
            </>
          )}
          {drawer === "help" && (
            <>
              <Link to="/contact" className="gm-option-row">
                <span className="gm-mega-icon">
                  <LifeBuoy />
                </span>
                <span style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: ".9rem" }}>Talk to support</strong>
                  <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Free call 0800 221 000 · Mon–Sat</small>
                </span>
                <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
              </Link>
              <Link to="/auth/recovery" className="gm-option-row">
                <span className="gm-mega-icon">
                  <Settings />
                </span>
                <span style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: ".9rem" }}>Recover access</strong>
                  <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Reset PIN or password</small>
                </span>
                <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
              </Link>
              <button
                type="button"
                className="gm-option-row"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText("*384*66#");
                  } catch {
                    /* noop */
                  }
                  toast.notify("USSD code copied — dial from any phone", "info");
                }}
              >
                <span className="gm-mega-icon">
                  <Smartphone />
                </span>
                <span style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: ".9rem" }}>Use *384*66# instead</strong>
                  <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Works on kabambe, no internet</small>
                </span>
                <Copy width={17} height={17} color="var(--gm-leaf-600)" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* ================= COMMAND PALETTE ================= */}
      {palette && (
        <div className="gm-palette-overlay" onClick={() => setPalette(false)}>
          <div className="gm-palette" onClick={(e) => e.stopPropagation()}>
            <div className="gm-palette-input">
              <Search />
              <input
                autoFocus
                placeholder="Jump to a module… (try “market”, “soil”, “wallet”)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHl(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHl((h) => Math.min(h + 1, filtered.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHl((h) => Math.max(h - 1, 0));
                  }
                  if (e.key === "Enter" && currentAction) {
                    setPalette(false);
                    currentAction.run();
                  }
                }}
              />
              <span className="gm-kbd">esc</span>
            </div>
            <div className="gm-palette-list">
              {filtered.length === 0 && (
                <p style={{ padding: "1rem", color: "var(--gm-ink-400)", fontWeight: 600, margin: 0 }}>
                  No matches for “{query}”.
                </p>
              )}
              {filtered.map((a, i) => (
                <button
                  key={a.label}
                  type="button"
                  className={`gm-palette-item ${i === Math.min(hl, filtered.length - 1) ? "is-active" : ""}`}
                  onMouseEnter={() => setHl(i)}
                  onClick={() => {
                    setPalette(false);
                    a.run();
                  }}
                >
                  <a.icon /> {a.label} <small>{a.hint}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
