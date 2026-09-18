import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Command,
  LayoutDashboard,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Toggle } from "../../components/auth/controls";
import { AuthConsole } from "../../components/auth/shell";
import { AUTH_NAV, HUB_NOTIFICATIONS, HUB_WIDGETS, WORKSPACES, type HubNote } from "../../data/auth";
import { APP_NAV } from "../../data/app/nav";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/hub")({ component: HubPage });

const WIDGET_KEY = "growmo-hub-widgets-v1";

function loadWidgets(): string[] {
  try {
    const raw = localStorage.getItem(WIDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return ["weather", "wallet", "tasks", "market"];
}

const NOTE_ICON = { alert: TriangleAlert, money: CircleDollarSign, task: ClipboardList } as const;

function HubPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const activeId = WORKSPACES[0].id;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState<HubNote[]>(HUB_NOTIFICATIONS);
  const [notesOpen, setNotesOpen] = useState(false);
  const [widgets, setWidgets] = useState<string[]>(loadWidgets);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [hl, setHl] = useState(0);

  const preview = WORKSPACES.find((w) => w.id === previewId);
  const unread = notes.filter((n) => n.unread).length;

  /* ⌘K / Ctrl+K opens palette */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
        setQuery("");
        setHl(0);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const actions = useMemo(() => {
    const nav = AUTH_NAV.filter((n) => n.to !== "/auth/hub").map((n) => ({
      icon: n.icon, label: `Go to ${n.label}`, hint: n.desc,
      run: () => navigate({ to: n.to }),
    }));

    const appNav = APP_NAV.flatMap((group) =>
      group.items.filter((item) => item.ready).map((item) => ({
        icon: item.icon,
        label: item.label,
        hint: item.desc,
        run: () => navigate({ to: item.to }),
      }))
    );

    return [
      ...nav,
      ...appNav,
      {
        icon: Search, label: "Copy USSD code *384*66#", hint: "Share with kabambe users",
        run: () => {
          try { navigator.clipboard.writeText("*384*66#"); } catch { /* noop */ }
          toast.notify("USSD code copied", "info");
        },
      },
      {
        icon: Bell, label: "Mark all notifications read", hint: `${unread} unread`,
        run: () => {
          setNotes(notes.map((n) => ({ ...n, unread: false })));
          toast.notify("All caught up!");
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, unread]);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));
  const current = filtered[Math.min(hl, Math.max(filtered.length - 1, 0))];

  const toggleWidget = (id: string) => {
    const next = widgets.includes(id) ? widgets.filter((w) => w !== id) : [...widgets, id];
    setWidgets(next);
    const label = HUB_WIDGETS.find((w) => w.id === id)?.label;
    toast.notify(`${label} ${widgets.includes(id) ? "removed from" : "added to"} dashboard`, "info");
  };

  const saveLayout = () => {
    try { localStorage.setItem(WIDGET_KEY, JSON.stringify(widgets)); } catch { /* noop */ }
    toast.notify("Dashboard layout saved");
  };

  return (
    <AuthConsole
      title="Workspace hub"
      desc="Pick a farm to enter — or press ⌘K to jump anywhere in your account."
      actions={
        <>
          <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => { setPalette(true); setQuery(""); setHl(0); }}>
            <Command width={15} height={15} /> Quick actions <span className="gm-kbd">⌘K</span>
          </button>
          <button className="gm-icon-btn" onClick={() => setNotesOpen(!notesOpen)} aria-label={`Notifications, ${unread} unread`}>
            <Bell />
            {unread > 0 && <span className="gm-count">{unread}</span>}
          </button>
        </>
      }
    >
      {/* workspace picker */}
      <div className="row g-3 mb-4">
        {WORKSPACES.map((w) => (
          <div key={w.id} className="col-md-6 col-xl-3">
            <article className={`gm-card p-3 h-100 ${activeId === w.id ? "" : ""}`} style={activeId === w.id ? { borderColor: "var(--gm-leaf-500)", boxShadow: "0 0 0 3px rgba(34,163,85,.14)" } : undefined}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="gm-ava" style={{ background: w.hue, width: 44, height: 44 }}>{w.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: "block", fontSize: ".92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</strong>
                  <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>{w.role}</small>
                </div>
                {activeId === w.id && <span className="gm-chip" style={{ fontSize: ".65rem" }}>Active</span>}
              </div>
              <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{w.meta}</small>
              <div className="d-flex gap-2 mt-3">
                <button className="gm-btn gm-btn-soft gm-btn-sm" style={{ flex: 1 }} onClick={() => { setPreviewId(w.id); toast.notify(`Previewing ${w.name}`, "info"); }}>
                  Preview
                </button>
                <button
                  className="gm-btn gm-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => { navigate({ to: "/app/onboarding" }); }}
                >
                  Enter <ChevronRight width={14} height={14} />
                </button>
              </div>
            </article>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* preview */}
        <div className="col-lg-5">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}><LayoutDashboard width={19} height={19} style={{ verticalAlign: -3 }} /> Workspace preview</h2>
            {preview ? (
              <>
                <div className="gm-card p-3 mb-3" style={{ background: preview.hue, border: "none", color: "#fff" }}>
                  <strong className="font-display" style={{ fontSize: "1.2rem" }}>{preview.name}</strong>
                  <br />
                  <small style={{ opacity: 0.8, fontWeight: 700 }}>{preview.meta} · {preview.role}</small>
                  <div className="row g-2 mt-2">
                    {preview.stats.map((s) => (
                      <div key={s.label} className="col-4">
                        <div style={{ background: "rgba(255,255,255,.14)", borderRadius: 10, padding: ".5rem", textAlign: "center" }}>
                          <strong style={{ display: "block" }}>{s.value}</strong>
                          <small style={{ opacity: 0.8, fontSize: ".68rem", fontWeight: 700 }}>{s.label}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="gm-btn gm-btn-block" onClick={() => { navigate({ to: "/app/onboarding" }); }}>
                  Enter {preview.name} <ArrowRight />
                </button>
              </>
            ) : (
              <p style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>
                Select <strong>Preview</strong> on any workspace to peek at its dashboard before entering.
              </p>
            )}

            {/* notifications */}
            <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>Notifications {unread > 0 && <span className="gm-chip" style={{ fontSize: ".68rem" }}>{unread} new</span>}</h3>
              <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer", fontSize: ".8rem" }} onClick={() => { setNotes(notes.map((n) => ({ ...n, unread: false }))); toast.notify("All caught up!"); }}>
                Mark all read
              </button>
            </div>
            {(notesOpen ? notes : notes.slice(0, 3)).map((n) => {
              const Icon = NOTE_ICON[n.kind];
              return (
                <div key={n.id} className="gm-check-row" style={n.unread ? { borderColor: "var(--gm-leaf-500)" } : undefined}>
                  <span className="gm-mega-icon"><Icon /></span>
                  <span style={{ flex: 1 }}>
                    <strong>{n.title}</strong>
                    <small>{n.desc} · {n.at}</small>
                  </span>
                  <button
                    aria-label="Dismiss"
                    onClick={() => { setNotes(notes.filter((x) => x.id !== n.id)); toast.notify("Notification dismissed", "info"); }}
                    style={{ border: "none", background: "none", color: "var(--gm-ink-400)", cursor: "pointer" }}
                  >
                    <X width={16} height={16} />
                  </button>
                </div>
              );
            })}
            {!notesOpen && notes.length > 3 && (
              <button className="gm-btn gm-btn-outline gm-btn-sm gm-btn-block" onClick={() => setNotesOpen(true)}>
                Show all {notes.length}
              </button>
            )}
          </div>
        </div>

        {/* dashboard builder */}
        <div className="col-lg-7">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}>Custom dashboard builder</h2>
            <p className="gm-auth-sub">Toggle widgets — your home screen rearranges instantly. Saved on this device.</p>
            <span className="gm-field-label">Live preview</span>
            <div className="gm-widget-grid mb-3">
              {HUB_WIDGETS.map((w) => {
                const on = widgets.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`gm-widget-mini ${on ? "is-on" : ""}`}
                    style={{ cursor: "pointer", textAlign: "left", fontFamily: "inherit", color: "inherit" }}
                    onClick={() => toggleWidget(w.id)}
                    aria-pressed={on}
                  >
                    <strong>{on ? "✓ " : ""}{w.label}</strong>
                    <div className="gm-widget-bars">
                      {[55, 80, 40, 70, 95, 60].map((h, i) => (
                        <i key={i} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <span className="gm-field-label">Widgets ({widgets.length} of {HUB_WIDGETS.length})</span>
            <div className="row g-2">
              {HUB_WIDGETS.map((w) => (
                <div key={w.id} className="col-md-6">
                  <Toggle checked={widgets.includes(w.id)} onChange={() => toggleWidget(w.id)} label={w.label} desc={w.desc} />
                </div>
              ))}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="gm-btn gm-btn-outline gm-btn-sm" style={{ flex: 1 }} onClick={() => { setWidgets(["weather", "wallet", "tasks", "market"]); toast.notify("Layout reset to defaults", "info"); }}>
                Reset
              </button>
              <button className="gm-btn gm-btn-sm" style={{ flex: 2 }} onClick={saveLayout}>
                <Check width={15} height={15} /> Save my dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* command palette */}
      {palette && (
        <div className="gm-palette-overlay" onClick={() => setPalette(false)}>
          <div className="gm-palette" onClick={(e) => e.stopPropagation()}>
            <div className="gm-palette-input">
              <Search />
              <input
                autoFocus
                placeholder="Jump to… (try “security”, “passkey”, “USSD”)"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHl(0); }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setHl((h) => Math.min(h + 1, filtered.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setHl((h) => Math.max(h - 1, 0)); }
                  if (e.key === "Enter" && current) { setPalette(false); current.run(); }
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
                  className={`gm-palette-item ${i === Math.min(hl, filtered.length - 1) ? "is-active" : ""}`}
                  onMouseEnter={() => setHl(i)}
                  onClick={() => { setPalette(false); a.run(); }}
                >
                  <a.icon /> {a.label} <small>{a.hint}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </AuthConsole>
  );
}
