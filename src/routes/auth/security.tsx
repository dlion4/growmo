import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChevronRight,
  LogOut,
  MonitorSmartphone,
  OctagonAlert,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, ScoreRing, Toggle } from "../../components/auth/controls";
import { AuthConsole } from "../../components/auth/shell";
import { CONNECTED_APPS, LOGIN_HISTORY, SESSIONS, type ConnectedApp, type Session } from "../../data/auth";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/security")({ component: SecurityPage });

function SecurityPage() {
  const toast = useToast();
  const [checks, setChecks] = useState({ passkey: true, twofa: true, codes: false, bio: true, alerts: true, devices: false });
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [apps, setApps] = useState<ConnectedApp[]>(CONNECTED_APPS);
  const [revoke, setRevoke] = useState<Session | null>(null);
  const [revokeAll, setRevokeAll] = useState(false);
  const [appPerms, setAppPerms] = useState<ConnectedApp | null>(null);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [threshold, setThreshold] = useState("5000");
  const [freezeOpen, setFreezeOpen] = useState(false);
  const [freezeText, setFreezeText] = useState("");
  const [frozen, setFrozen] = useState(false);

  const score = useMemo(() => {
    let s = 28;
    if (checks.passkey) s += 14;
    if (checks.twofa) s += 14;
    if (checks.codes) s += 12;
    if (checks.bio) s += 10;
    if (checks.alerts) s += 12;
    if (checks.devices) s += 10;
    return Math.min(100, s);
  }, [checks]);

  const toggleCheck = (k: keyof typeof checks, label: string) => (v: boolean) => {
    setChecks({ ...checks, [k]: v });
    toast.notify(`${label} ${v ? "on — score up" : "off — score down"}`, v ? "success" : "warn");
  };

  const CHECKS: { k: keyof typeof checks; label: string; desc: string }[] = [
    { k: "passkey", label: "Passkey sign-in", desc: "3 passkeys registered" },
    { k: "twofa", label: "Two-step verification", desc: "Authenticator + SMS backup" },
    { k: "codes", label: "Backup codes saved", desc: "8 single-use recovery codes" },
    { k: "bio", label: "Biometric unlock", desc: "Fingerprint on this phone" },
    { k: "alerts", label: "Security alerts", desc: `SMS for logins + payouts over KES ${Number(threshold).toLocaleString()}` },
    { k: "devices", label: "Devices reviewed", desc: "All 3 sessions recognized" },
  ];

  return (
    <AuthConsole
      title="Security centre"
      desc="Your score, sessions, history, alerts, connected apps and emergency controls — one dashboard."
      actions={
        <button className="gm-btn gm-btn-danger-soft gm-btn-sm" onClick={() => { setFreezeText(""); setFreezeOpen(true); }}>
          <OctagonAlert width={15} height={15} /> Freeze account
        </button>
      }
    >
      {frozen && (
        <div className="gm-auth-frozen mb-4">
          <OctagonAlert width={30} height={30} style={{ marginBottom: ".5rem" }} />
          <h3 className="font-display" style={{ color: "#fff" }}>Account frozen</h3>
          <p className="mb-3" style={{ color: "rgba(255,255,255,.75)", fontWeight: 600 }}>
            Sign-ins, payouts and orders are paused. Your data and money are safe.
          </p>
          <button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { setFrozen(false); toast.notify("Account unfrozen — welcome back"); }}>
            Unfreeze my account
          </button>
        </div>
      )}

      <div className="row g-4">
        {/* score */}
        <div className="col-lg-4">
          <div className="gm-auth-card h-100 text-center">
            <ScoreRing score={score} />
            <h2 className="mt-3" style={{ fontSize: "1.2rem" }}>
              {score >= 80 ? "Fort Knox farm 🏰" : score >= 55 ? "Getting solid" : "Needs attention"}
            </h2>
            <p className="gm-auth-sub">Toggle protections to raise your score.</p>
          </div>
        </div>

        {/* checklist */}
        <div className="col-lg-8">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}>Protection checklist</h2>
            <p className="gm-auth-sub">Every toggle moves your score in real time.</p>
            <div className="row g-2">
              {CHECKS.map((c) => (
                <div key={c.k} className="col-md-6">
                  <Toggle checked={checks[c.k]} onChange={toggleCheck(c.k, c.label)} label={c.label} desc={c.desc} />
                </div>
              ))}
            </div>
            <button className="gm-btn gm-btn-outline gm-btn-sm mt-3" onClick={() => setThresholdOpen(true)}>
              <Settings2 width={15} height={15} /> Alert threshold: KES {Number(threshold).toLocaleString()}
            </button>
          </div>
        </div>

        {/* sessions */}
        <div className="col-lg-6">
          <div className="gm-auth-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <h2 style={{ fontSize: "1.2rem" }}>Active sessions ({sessions.length})</h2>
              <button className="gm-btn gm-btn-danger-soft gm-btn-sm" disabled={sessions.length <= 1} onClick={() => setRevokeAll(true)}>
                <LogOut width={14} height={14} /> All others
              </button>
            </div>
            <p className="gm-auth-sub">Don't recognize one? Revoke it immediately.</p>
            <div className="d-grid gap-2">
              {sessions.map((s) => (
                <div key={s.id} className="gm-check-row" style={{ marginBottom: 0 }}>
                  <span className="gm-mega-icon"><MonitorSmartphone /></span>
                  <span style={{ flex: 1 }}>
                    <strong>{s.device} {s.current && <span className="gm-chip" style={{ fontSize: ".65rem", padding: ".15rem .5rem" }}>This device</span>}</strong>
                    <small>{s.meta} · {s.location} · {s.lastActive}</small>
                  </span>
                  {!s.current && (
                    <button className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => setRevoke(s)}>Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* apps */}
        <div className="col-lg-6">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}>Connected apps ({apps.length})</h2>
            <p className="gm-auth-sub">Third parties with permission to touch your account.</p>
            <div className="d-grid gap-2">
              {apps.map((a) => (
                <button key={a.id} className="gm-check-row text-start" style={{ marginBottom: 0, width: "100%", cursor: "pointer", background: "#fff" }} onClick={() => setAppPerms(a)}>
                  <span className="gm-mega-icon" style={{ background: a.hue, color: "#fff" }}><ShieldCheck width={19} height={19} /></span>
                  <span style={{ flex: 1 }}>
                    <strong>{a.name}</strong>
                    <small>{a.desc} · Connected {a.connected}</small>
                  </span>
                  <ChevronRight width={17} height={17} color="var(--gm-leaf-600)" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* history */}
        <div className="col-12">
          <div className="gm-auth-card">
            <h2 style={{ fontSize: "1.2rem" }}><Bell width={19} height={19} style={{ verticalAlign: -3 }} /> Recent security activity</h2>
            <p className="gm-auth-sub">Full audit trail — kept 3 years per Kenya Data Protection Act.</p>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead><tr><th>When</th><th>Event</th><th>Device</th><th>IP</th><th>Risk</th></tr></thead>
                <tbody>
                  {LOGIN_HISTORY.map((h, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: "nowrap" }}>{h.when}</td>
                      <td>{h.event}</td>
                      <td>{h.device}</td>
                      <td style={{ fontFamily: "monospace", fontSize: ".8rem" }}>{h.ip}</td>
                      <td><span className={`gm-risk gm-risk-${h.risk}`}>{h.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* revoke session */}
      <Dialog open={!!revoke} onClose={() => setRevoke(null)} title="Revoke this session?" desc="That device will be signed out instantly.">
        <p className="gm-check-row">
          <span className="gm-mega-icon"><MonitorSmartphone /></span>
          <span><strong>{revoke?.device}</strong><small>{revoke?.location} · {revoke?.lastActive}</small></span>
        </p>
        <div className="d-flex gap-2">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setRevoke(null)}>Keep</button>
          <button className="gm-btn gm-btn-danger-soft" style={{ flex: 1 }} onClick={() => { if (!revoke) return; setSessions(sessions.filter((s) => s.id !== revoke.id)); setRevoke(null); toast.notify("Session revoked", "warn"); }}>
            <Trash2 /> Revoke
          </button>
        </div>
      </Dialog>

      {/* revoke all */}
      <Dialog open={revokeAll} onClose={() => setRevokeAll(false)} title="Sign out all other devices?" desc="Only this device stays signed in.">
        <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>
          {sessions.length - 1} other session{sessions.length - 1 === 1 ? "" : "s"} will be revoked. Use this if you suspect unauthorized access.
        </p>
        <div className="d-flex gap-2">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setRevokeAll(false)}>Cancel</button>
          <button className="gm-btn gm-btn-danger-soft" style={{ flex: 1 }} onClick={() => { setSessions(sessions.filter((s) => s.current)); setRevokeAll(false); toast.notify("All other sessions revoked", "warn"); }}>
            <LogOut /> Revoke all
          </button>
        </div>
      </Dialog>

      {/* app permissions */}
      <Dialog open={!!appPerms} onClose={() => setAppPerms(null)} title={appPerms?.name ?? ""} desc={appPerms?.desc}>
        <span className="gm-field-label">Permissions granted</span>
        {appPerms?.access.map((p) => (
          <p key={p} className="gm-check-row">
            <span className="gm-mega-icon"><Check /></span>
            <span><strong>{p}</strong></span>
          </p>
        ))}
        <div className="d-flex gap-2 mt-3">
          <button
            className="gm-btn gm-btn-danger-soft"
            style={{ flex: 1 }}
            onClick={() => { if (!appPerms) return; setApps(apps.filter((a) => a.id !== appPerms.id)); setAppPerms(null); toast.notify("App disconnected", "warn"); }}
          >
            <Trash2 /> Disconnect
          </button>
          <button className="gm-btn" style={{ flex: 1 }} onClick={() => { setAppPerms(null); toast.notify("Permissions kept as-is", "info"); }}>
            <Check /> Keep access
          </button>
        </div>
      </Dialog>

      {/* threshold */}
      <Dialog open={thresholdOpen} onClose={() => setThresholdOpen(false)} title="Payout alert threshold" desc="Get an SMS the moment money above this moves.">
        <div className="gm-field">
          <label htmlFor="sec-th">Alert me above (KES)</label>
          <input id="sec-th" className="gm-input" inputMode="numeric" value={threshold} onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ""))} />
        </div>
        <div className="d-flex gap-2">
          {[1000, 5000, 20000].map((v) => (
            <button key={v} className="gm-filter-chip" style={{ flex: 1, justifyContent: "center" }} onClick={() => setThreshold(String(v))}>
              {v.toLocaleString()}
            </button>
          ))}
        </div>
        <button className="gm-btn gm-btn-block mt-3" onClick={() => { setThresholdOpen(false); toast.notify(`Alerts set above KES ${Number(threshold).toLocaleString()}`); }}>
          <Check /> Save threshold
        </button>
      </Dialog>

      {/* freeze */}
      <Dialog open={freezeOpen} onClose={() => setFreezeOpen(false)} title="Freeze your account?" desc="Emergency brake — pauses everything instantly.">
        <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>
          Sign-ins, M-Pesa payouts, payroll and buyer orders stop immediately. Nothing is deleted. Type <strong>FREEZE</strong> to confirm.
        </p>
        <div className="gm-field">
          <label htmlFor="sec-freeze">Type FREEZE</label>
          <input id="sec-freeze" className="gm-input" value={freezeText} onChange={(e) => setFreezeText(e.target.value)} placeholder="FREEZE" />
        </div>
        <div className="d-flex gap-2">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setFreezeOpen(false)}>Cancel</button>
          <button
            className="gm-btn gm-btn-danger-soft"
            style={{ flex: 1 }}
            disabled={freezeText.trim().toUpperCase() !== "FREEZE"}
            onClick={() => { setFreezeOpen(false); setFrozen(true); toast.notify("Account frozen — everything paused", "warn"); }}
          >
            <OctagonAlert /> Freeze now
          </button>
        </div>
      </Dialog>
    </AuthConsole>
  );
}
