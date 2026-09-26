/* ============================================================================
   PAGE 18 — SECURITY, LOGS, BACKUPS & ACCOUNT PROTECTION  (/app/logs)

   Blueprint sections implemented
   18.1 Authentication methods   18.2 PIN management     18.3 Session management
   18.4 Activity & security logs 18.5 Data backup & recovery  18.6 Fraud protection
   18.7 Account recovery         18.8 Privacy (KDP Act)  18.9 Security health check

   28 dialogs/wizards are driven by one discriminated-union modal state
   (see SecurityModals). Sessions, backups, fraud toggles, velocity limits,
   PIN age, sharing prefs, the account freeze and the 10-point health score
   all change live on the page.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Database,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  HeartPulse,
  HelpCircle,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  List,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  MoreHorizontal,
  PhoneCall,
  Printer,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  Timer,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardMetric,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  type SecModalState,
  SecurityModals,
} from "../../components/app/SecurityModals";
import {
  AuthMethodCard,
  BackupRowView,
  FraudFeatureRowView,
  HealthCheckRowView,
  LogRowView,
  PrivacyRowView,
  RecoveryCard,
  type SecAction,
  SecCallout,
  SecFaqList,
  SecGlossary,
  SecScoreRing,
  SecurityHero,
  SessionRowView,
  TierCard,
} from "../../components/app/SecurityWidgets";
import { Toggle } from "../../components/auth/controls";
import { Pagination } from "../../components/ui/primitives";
import {
  AUTH_METHODS,
  type AuthMethod,
  BACKUP_CONTENTS,
  BACKUP_HISTORY,
  type BackupRow,
  DATA_SHARING_PREFS,
  FRAUD_FEATURES,
  type FraudFeature,
  HEALTH_CHECKS,
  type HealthCheck,
  LOG_EVENTS,
  type LogEvent,
  type LogRisk,
  type LogType,
  PIN_LOCKOUT_STEPS,
  PIN_RULES,
  PRIVACY_RIGHTS,
  RECOVERY_SCENARIOS,
  riskTone,
  SEC_ALERTS,
  SEC_CONTEXT,
  SEC_FAQ,
  SEC_GLOSSARY,
  SESSIONS,
  type Session,
  TIER_SETUPS,
  VELOCITY_LIMITS,
} from "../../data/app/logs";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/logs")({
  component: LogsPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Security, logs & backups — GrowMO" }] }),
});

type SecView =
  | "overview"
  | "auth"
  | "pin"
  | "sessions"
  | "logs"
  | "backup"
  | "protection"
  | "recovery"
  | "privacy"
  | "health";

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const RISK_EXPLAIN: Record<LogRisk, string> = {
  Low: "Routine activity — a normal login, save or backup. Nothing unusual, just an audit trail.",
  Medium:
    "Money or a credential moved. Normal for your farm, but exactly the kind of line you check when something feels off.",
  High: "Something the system expects to be rare. If you didn't do this, freeze the account first, then investigate.",
};

function LogsPage() {
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [view, setView] = useState<SecView>("overview");
  const [modal, setModal] = useState<SecModalState>({ kind: "none" });
  const [drawer, setDrawer] = useState<LogEvent | null>(null);

  /* ---- live state (every control on the page changes one of these) ---- */
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [backups, setBackups] = useState<BackupRow[]>(BACKUP_HISTORY);
  const [fraud, setFraud] = useState<FraudFeature[]>(FRAUD_FEATURES);
  const [velocity, setVelocity] = useState(VELOCITY_LIMITS);
  const [pinAge, setPinAge] = useState(SEC_CONTEXT.pinAge);
  const [txPin, setTxPin] = useState(true);
  const [autoLogout, setAutoLogout] = useState("5 min");
  const [loginSms, setLoginSms] = useState(true);
  const [loginPush, setLoginPush] = useState(true);
  const [twoFaApp, setTwoFaApp] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [emergency, setEmergency] = useState("");
  const [frozen, setFrozen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [sharing, setSharing] = useState(DATA_SHARING_PREFS);

  /* ---- log filters ---- */
  const [query, setQuery] = useState("");
  const [fType, setFType] = useState("All types");
  const [fRisk, setFRisk] = useState("All risks");
  const [fDate, setFDate] = useState("October 2026");
  const [fLoc, setFLoc] = useState("All locations");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const score = Math.min(10, 7 + (twoFaApp ? 2 : 0) + (emergency ? 1 : 0));

  const checks: HealthCheck[] = useMemo(
    () =>
      HEALTH_CHECKS.map((c) => {
        if (c.id === "h3" && twoFaApp)
          return {
            ...c,
            status: "Pass" as const,
            detail: "Authenticator-app layer linked — very high protection.",
            actionLabel: undefined,
          };
        if (c.id === "h8" && emergency)
          return {
            ...c,
            status: "Pass" as const,
            detail: `Second adult registered — ${emergency}.`,
            actionLabel: undefined,
          };
        if (c.id === "h4") {
          const s4 = sessions.find((s) => s.id === "s4");
          if (!s4 || s4.trusted)
            return {
              ...c,
              status: "Pass" as const,
              detail: "Every device in the last 7 days is now recognised.",
            };
        }
        return c;
      }),
    [twoFaApp, emergency, sessions],
  );

  const events = useMemo(
    () =>
      LOG_EVENTS.filter((e) => {
        const hay =
          `${e.event} ${e.details} ${e.device} ${e.location} ${e.ts} ${e.ip}`.toLowerCase();
        if (query && !hay.includes(query.toLowerCase())) return false;
        if (fType !== "All types" && e.type !== fType) return false;
        if (fRisk !== "All risks" && e.risk !== fRisk) return false;
        if (fLoc !== "All locations" && e.location !== fLoc) return false;
        if (fDate === "Last 24 h" && e.iso < "2026-10-24T10:30") return false;
        if (fDate === "Last 7 days" && e.iso < "2026-10-18T00:00") return false;
        if (fDate === "Last 30 days" && e.iso < "2026-09-25T00:00")
          return false;
        return true;
      }),
    [query, fType, fRisk, fLoc, fDate],
  );

  const pageCount = Math.max(1, Math.ceil(events.length / perPage));
  const pageRows = events.slice((page - 1) * perPage, page * perPage);
  const last24 = LOG_EVENTS.filter((e) => e.iso >= "2026-10-24T10:30").length;
  const s4 = sessions.find((s) => s.id === "s4");

  /* ---- modal / navigation plumbing ---- */
  const close = () => setModal({ kind: "none" });
  const open = (m: SecModalState) => setModal(m);
  const gotoLogs = (q: string) => {
    setQuery(q);
    setFType("All types");
    setPage(1);
    setView("logs");
    close();
  };
  const gotoSessions = () => {
    setView("sessions");
    close();
  };

  const handleHeroAction = (a: SecAction) => {
    if (a === "run-health") open({ kind: "health" });
    else if (a === "backup-now") open({ kind: "backup-now" });
    else if (a === "secure-account") open({ kind: "secure" });
    else gotoSessions();
  };

  const exportLogsCsv = () => {
    const head = [
      "timestamp",
      "type",
      "event",
      "details",
      "ip",
      "location",
      "device",
      "risk",
    ].join(",");
    const body = events
      .map((e) =>
        [e.ts, e.type, e.event, e.details, e.ip, e.location, e.device, e.risk]
          .map(csvCell)
          .join(","),
      )
      .join("\n");
    downloadText("growmo-security-log-oct2026.csv", `${head}\n${body}`);
    setMenu(false);
  };

  const trust = (id: string) => {
    setSessions((cur) =>
      cur.map((s) => (s.id === id ? { ...s, trusted: true } : s)),
    );
    const s = sessions.find((x) => x.id === id);
    toast.notify(
      `${s?.device ?? "Device"} is now trusted — it skips 2FA on login.`,
      "success",
    );
  };
  const logoutDevice = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    setSessions((cur) => cur.filter((x) => x.id !== id));
    toast.notify(
      `${s?.device ?? "Session"} logged out remotely. It must re-authenticate with full 2FA.`,
      "success",
    );
  };

  const addBackup = (label: string) => {
    setBackups((cur) => [
      {
        id: `b-${Date.now()}`,
        date: "Oct 25 11:02",
        iso: "2026-10-25T11:02",
        type: "Manual" as const,
        size: "249 MB",
        status: "Complete" as const,
        trigger: "User triggered (Backup now)",
        objects: 41967,
      },
      ...cur,
    ]);
    toast.notify(
      "Backup complete — 249 MB, verified. Ref BK-OCT25-1102.",
      "success",
    );
    void label;
  };

  /* ================================================================== */
  return (
    <main className="gm-app-page gm-sec-page">
      <div className="gm-container py-4">
        {/* breadcrumb + tools menu */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">System</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Security &amp; logs</strong>
            {frozen ? (
              <StatusChip label="Account frozen" tone="high" />
            ) : (
              <StatusChip label="Protected" tone="low" />
            )}
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((c) => !c)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> Security tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-sec-menu">
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "health" });
                    setMenu(false);
                  }}
                >
                  <ShieldCheck /> Run health check
                </button>
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "backup-now" });
                    setMenu(false);
                  }}
                >
                  <FileDown /> Backup now
                </button>
                <button type="button" onClick={exportLogsCsv}>
                  <FileSpreadsheet /> Export activity log (CSV)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "report" });
                    setMenu(false);
                  }}
                >
                  <ScrollText /> Security report
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("logs");
                    setMenu(false);
                  }}
                >
                  <List /> Review activity log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("sessions");
                    setMenu(false);
                  }}
                >
                  <MonitorSmartphone /> Review devices
                </button>
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "dpo" });
                    setMenu(false);
                  }}
                >
                  <Mail /> Contact the DPO
                </button>
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "faq" });
                    setMenu(false);
                  }}
                >
                  <HelpCircle /> Security help &amp; glossary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setMenu(false);
                  }}
                >
                  <Printer /> Print this page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    open({ kind: "secure" });
                    setMenu(false);
                  }}
                >
                  <ShieldOff />{" "}
                  {frozen ? "Lift account freeze" : "Secure my account"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <SecurityHero
          onAction={handleHeroAction}
          score={score}
          lastBackup="06:00"
          nextBackup="12:00"
          backupSize="248 MB"
          failed7d={SEC_CONTEXT.failed7d}
          logins7d={SEC_CONTEXT.logins7d}
        />

        {frozen ? (
          <div className="mt-3">
            <SecCallout tone="warn">
              <strong>Account frozen.</strong> Sends, withdrawals, auto-pay and
              scheduled batches are stopped — deposits still land. Lift the
              freeze when you're sure.
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm gm-sec-unfreeze"
                onClick={() => open({ kind: "secure" })}
              >
                <ShieldCheck /> Lift the freeze
              </button>
            </SecCallout>
          </div>
        ) : null}

        {deleted ? (
          <div className="mt-3">
            <SecCallout tone="warn">
              <strong>Deletion scheduled — ref DEL-2026-0093.</strong> The
              account is restorable until Nov 24, 2026 (30-day grace).
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm gm-sec-unfreeze"
                onClick={() => {
                  setDeleted(false);
                  toast.notify(
                    "Deletion cancelled — your account stays active.",
                    "success",
                  );
                }}
              >
                <RotateCcw /> Undo deletion
              </button>
            </SecCallout>
          </div>
        ) : null}

        {/* KPI band */}
        <div className="row g-3 mt-3">
          <div className="col-6 col-lg-3">
            <DashboardMetric
              icon={ShieldCheck}
              label="Security score"
              value={`${score}/10`}
              note={
                twoFaApp ? "2FA app layer linked" : "Enable 2FA to reach 9/10"
              }
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric
              icon={MonitorSmartphone}
              label="Active sessions"
              value={`${sessions.length}`}
              note={`${sessions.filter((s) => s.trusted).length} trusted · ${s4 && !s4.trusted ? "1 unrecognised" : "all recognised"}`}
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric
              icon={Activity}
              label="Events · last 24 h"
              value={`${last24}`}
              note={`${LOG_EVENTS.length} logged this month`}
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric
              icon={Database}
              label="Last backup"
              value="4 h ago"
              note="248 MB verified · next 12:00"
            />
          </div>
        </div>

        {/* alerts */}
        <div className="row g-2 mt-3">
          {SEC_ALERTS.map((a) => (
            <div className="col-lg-4" key={a.id}>
              <SecCallout tone={a.tone}>{a.text}</SecCallout>
            </div>
          ))}
        </div>

        {/* tabs */}
        <div className="mt-4">
          <PlannerSubtabs
            label="Security sections"
            value={view}
            onChange={(next) => setView(next)}
            items={[
              { id: "overview", label: "Overview", icon: <LayoutGrid /> },
              { id: "auth", label: "Auth & 2FA", icon: <ShieldCheck /> },
              { id: "pin", label: "PIN", icon: <KeyRound /> },
              {
                id: "sessions",
                label: "Sessions",
                icon: <MonitorSmartphone />,
                count: sessions.length,
              },
              {
                id: "logs",
                label: "Logs",
                icon: <List />,
                count: events.length,
              },
              { id: "backup", label: "Backup", icon: <Database /> },
              { id: "protection", label: "Protection", icon: <ShieldOff /> },
              { id: "recovery", label: "Recovery", icon: <LifeBuoy /> },
              { id: "privacy", label: "Privacy", icon: <Eye /> },
              { id: "health", label: "Health check", icon: <HeartPulse /> },
            ]}
          />
        </div>

        {/* ---------------- overview ---------------- */}
        {view === "overview" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18 · overview"
                  title="Today at a glance"
                  subtitle="The security posture of Mary's Farm in one screen."
                />
                <div className="gm-card p-3">
                  <ProgressLine value={score * 10} label="Security score" />
                  <div className="gm-sec-kv">
                    <div>
                      <span>Authentication</span>
                      <strong>
                        {AUTH_METHODS.filter((m) => m.enabled).length} of{" "}
                        {AUTH_METHODS.length} methods active
                      </strong>
                    </div>
                    <div>
                      <span>PIN</span>
                      <strong>
                        {pinAge === 0
                          ? "Changed today"
                          : `Last changed ${pinAge} days ago`}
                      </strong>
                    </div>
                    <div>
                      <span>Transaction PIN</span>
                      <strong>
                        {txPin
                          ? "Active — separate payment PIN"
                          : "Off — login PIN pays"}
                      </strong>
                    </div>
                    <div>
                      <span>Auto-logout</span>
                      <strong>{autoLogout}</strong>
                    </div>
                    <div>
                      <span>Encryption</span>
                      <strong>{SEC_CONTEXT.encryption}</strong>
                    </div>
                    <div>
                      <span>Tier</span>
                      <strong>
                        {SEC_CONTEXT.tier} —{" "}
                        {TIER_SETUPS.find((t) => t.active)?.recommended}
                      </strong>
                    </div>
                  </div>
                  <div className="gm-sec-quick">
                    <button
                      type="button"
                      onClick={() => open({ kind: "health" })}
                    >
                      <HeartPulse /> Run health check
                    </button>
                    <button
                      type="button"
                      onClick={() => open({ kind: "backup-now" })}
                    >
                      <FileDown /> Backup now
                    </button>
                    <button
                      type="button"
                      onClick={() => open({ kind: "log-export" })}
                    >
                      <FileSpreadsheet /> Export activity log
                    </button>
                    <button
                      type="button"
                      onClick={() => open({ kind: "report" })}
                    >
                      <ScrollText /> Security report
                    </button>
                    <button type="button" onClick={() => setView("sessions")}>
                      <MonitorSmartphone /> Review devices
                    </button>
                    <button type="button" onClick={() => open({ kind: "faq" })}>
                      <HelpCircle /> Help &amp; glossary
                    </button>
                  </div>
                </div>
                <div className="gm-card p-3 mt-3">
                  <h3 className="gm-sec-mini-title">Recent security events</h3>
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Event</th>
                          <th>Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LOG_EVENTS.slice(0, 6).map((e) => (
                          <tr key={e.id}>
                            <td className="gm-sec-log-ts">{e.ts}</td>
                            <td>
                              <button
                                type="button"
                                className="gm-sec-log-event"
                                onClick={() => setDrawer(e)}
                              >
                                {e.event}
                              </button>
                              <small className="gm-sec-log-sub">
                                {e.details}
                              </small>
                            </td>
                            <td>
                              <StatusChip
                                label={e.risk}
                                tone={riskTone(e.risk)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm gm-sec-all-logs"
                    onClick={() => setView("logs")}
                  >
                    All {LOG_EVENTS.length} events <List />
                  </button>
                </div>
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.1"
                  title="Recommended setup"
                  subtitle="What your Premium tier should have active."
                />
                <div className="gm-sec-tiers-col">
                  {TIER_SETUPS.map((t) => (
                    <TierCard
                      key={t.tier}
                      tier={t}
                      onOpen={() => open({ kind: "tiers" })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.1 auth & 2FA ---------------- */}
        {view === "auth" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18.1"
                  title="Authentication methods"
                  subtitle="Seven ways in — each with its own security level. Tap any row for the detail."
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-primary gm-btn-sm"
                      onClick={() => open({ kind: "twofa" })}
                    >
                      <ShieldCheck /> Set up 2FA
                    </button>
                  }
                />
                <div className="gm-sec-methods">
                  {AUTH_METHODS.map((m) => (
                    <AuthMethodCard
                      key={m.id}
                      method={m}
                      onDetail={(mm: AuthMethod) =>
                        open({ kind: "method", m: mm })
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.1"
                  title="Setup by account type"
                  subtitle="Minimums and what we actually recommend."
                />
                <div className="gm-card p-3">
                  {TIER_SETUPS.map((t) => (
                    <div
                      key={t.tier}
                      className={`gm-sec-tier-row ${t.active ? "is-active" : ""}`}
                    >
                      <strong>{t.tier}</strong>
                      <span>{t.minimum}</span>
                      <span className="gm-sec-tier-rec">{t.recommended}</span>
                    </div>
                  ))}
                  <WizardNoteLite text="You're on Premium. Everything recommended is active except the authenticator-app layer — one tap takes you from 7/10 to 9/10." />
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm gm-sec-all-logs"
                    onClick={() => open({ kind: "tiers" })}
                  >
                    Why this setup?
                  </button>
                </div>
                <div className="gm-card p-3 mt-3">
                  <h3 className="gm-sec-mini-title">Current state</h3>
                  <div className="gm-sec-kv">
                    <div>
                      <span>Phone + OTP</span>
                      <strong>{SEC_CONTEXT.phone}</strong>
                    </div>
                    <div>
                      <span>PIN</span>
                      <strong>
                        6 digits ·{" "}
                        {pinAge === 0 ? "changed today" : `${pinAge} days old`}
                      </strong>
                    </div>
                    <div>
                      <span>Biometric</span>
                      <strong>Fingerprint · Infinix Hot 40</strong>
                    </div>
                    <div>
                      <span>2FA app</span>
                      <strong>
                        {twoFaApp
                          ? "Linked — rotating 30 s codes"
                          : "Not linked (biggest score gap)"}
                      </strong>
                    </div>
                    <div>
                      <span>2FA SMS</span>
                      <strong>Active on new devices &amp; withdrawals</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.2 PIN ---------------- */}
        {view === "pin" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-lg-7">
                <DashboardSectionHeader
                  eyebrow="18.2"
                  title="PIN management"
                  subtitle="Your 6-digit key — change it any time, reset it any time, lock it out on purpose."
                />
                <div className="gm-card p-3">
                  <div className="gm-sec-kv">
                    <div>
                      <span>Current PIN</span>
                      <strong>•••• 56</strong>
                    </div>
                    <div>
                      <span>Last changed</span>
                      <strong>
                        {pinAge === 0
                          ? "Today, Oct 25"
                          : `${pinAge} days ago (Aug 3, 2026)`}
                      </strong>
                    </div>
                    <div>
                      <span>Length</span>
                      <strong>6 digits (max)</strong>
                    </div>
                    <div>
                      <span>Failed attempts</span>
                      <strong>0 in the current window</strong>
                    </div>
                  </div>
                  <div className="gm-sec-strength">
                    <small>Strength</small>
                    <ProgressLine value={92} label="PIN strength" />
                    <StatusChip label="Strong" tone="low" />
                  </div>
                  <div className="gm-sec-pin-actions">
                    <button
                      type="button"
                      className="gm-btn gm-btn-primary"
                      onClick={() => open({ kind: "change-pin" })}
                    >
                      <KeyRound /> Change PIN
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline"
                      onClick={() => open({ kind: "reset-pin" })}
                    >
                      Forgot PIN
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-ghost"
                      onClick={() => open({ kind: "lockout" })}
                    >
                      <Timer /> Check lockout
                    </button>
                  </div>
                  <div className={`gm-sec-txpin-row ${txPin ? "is-on" : ""}`}>
                    <span>
                      <strong>Transaction PIN</strong>
                      <small>
                        {txPin
                          ? "Active — payments need a separate PIN (recommended)"
                          : "Off — the login PIN alone pays out money"}
                      </small>
                    </span>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => open({ kind: "tx-pin" })}
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <DashboardSectionHeader
                  eyebrow="18.2"
                  title="How the PIN works"
                  subtitle="Every rule, in one table."
                />
                <div className="gm-card p-2">
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <tbody>
                        {PIN_RULES.map((r) => (
                          <tr key={r.id}>
                            <td className="gm-sec-rule-f">
                              <strong>{r.feature}</strong>
                            </td>
                            <td>{r.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="gm-card p-3 mt-3">
                  <h3 className="gm-sec-mini-title">Lockout policy</h3>
                  {PIN_LOCKOUT_STEPS.map((s) => (
                    <div key={s.attempts} className="gm-sec-lockstep">
                      <Timer />
                      <span>{s.attempts}</span>
                      <StatusChip
                        label={s.lock}
                        tone={s.tone === "medium" ? "medium" : "high"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.3 sessions ---------------- */}
        {view === "sessions" ? (
          <div className="mt-3">
            {s4 && !s4.trusted ? (
              <div className="mb-3">
                <SecCallout tone="warn">
                  <strong>
                    New login from Safari · iPhone in Kikuyu (Oct 22, 09:14).
                    Was this you?
                  </strong>
                  <span className="gm-sec-inline-btns">
                    <button
                      type="button"
                      className="gm-btn gm-btn-primary gm-btn-sm"
                      onClick={() => open({ kind: "unfamiliar" })}
                    >
                      Yes, it's me
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => open({ kind: "unfamiliar" })}
                    >
                      <ShieldOff /> No — secure my account
                    </button>
                  </span>
                </SecCallout>
              </div>
            ) : null}
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18.3"
                  title="Active sessions"
                  subtitle="Every place GrowMO is currently signed in. Trust the good ones, log out the rest."
                />
                <div className="gm-card p-2">
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Device</th>
                          <th>Location</th>
                          <th>IP</th>
                          <th>Last active</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((s) => (
                          <SessionRowView
                            key={s.id}
                            session={s}
                            onDetail={(ss) => open({ kind: "session", s: ss })}
                            onLogout={(ss) =>
                              open({ kind: "logout-dev", s: ss })
                            }
                            onTrust={(ss) => open({ kind: "trust", s: ss })}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <WizardNoteLite text="Trusted devices skip 2FA to keep daily logins one-tap. Anything you don't own should never be trusted." />
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.3"
                  title="Auto-logout & alerts"
                  subtitle="How long the app stays open, and where login alerts go."
                />
                <div className="gm-card p-3">
                  <div className="gm-sec-kv">
                    <div>
                      <span>Current timer</span>
                      <strong>{autoLogout}</strong>
                    </div>
                    <div>
                      <span>Re-entry after inactivity</span>
                      <strong>PIN required after 5 min</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-sec-all-logs"
                    onClick={() => open({ kind: "auto-logout" })}
                  >
                    <Timer /> Change auto-logout timer
                  </button>
                  <div className="gm-sec-toggle-stack">
                    <Toggle
                      checked={loginSms}
                      onChange={setLoginSms}
                      label="Login alerts — SMS"
                      desc="Every new-device login texts 0712 345 678"
                    />
                    <Toggle
                      checked={loginPush}
                      onChange={setLoginPush}
                      label="Login alerts — push"
                      desc="In-app notification on every login"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.4 logs ---------------- */}
        {view === "logs" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="18.4"
              title="Activity & security logs"
              subtitle="The full audit trail — every login, payment, PIN event, backup and alert. Export it any time."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-primary gm-btn-sm"
                  onClick={() => open({ kind: "log-export" })}
                >
                  <FileDown /> Export
                </button>
              }
            />
            <div className="gm-card p-3">
              <div className="gm-sec-log-tools">
                <div className="gm-search-field gm-sec-log-search">
                  <SearchGlyph />
                  <input
                    className="gm-input"
                    type="search"
                    placeholder="Search events, IPs, devices…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Search security log"
                  />
                </div>
                <select
                  className="gm-select"
                  value={fType}
                  onChange={(e) => {
                    setFType(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Event type"
                >
                  {["All types", ...LOG_EVENT_TYPES_LIST].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select
                  className="gm-select"
                  value={fRisk}
                  onChange={(e) => {
                    setFRisk(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Risk level"
                >
                  {["All risks", "Low", "Medium", "High"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select
                  className="gm-select"
                  value={fDate}
                  onChange={(e) => {
                    setFDate(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Date range"
                >
                  {[
                    "Last 24 h",
                    "Last 7 days",
                    "Last 30 days",
                    "October 2026",
                  ].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <select
                  className="gm-select"
                  value={fLoc}
                  onChange={(e) => {
                    setFLoc(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Location"
                >
                  {[
                    "All locations",
                    "Kiambu",
                    "Nairobi",
                    "Kikuyu",
                    "Nakuru",
                  ].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="gm-table-wrap mt-3">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Timestamp / IP</th>
                      <th>Event</th>
                      <th>Details</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="gm-sec-empty">
                          No events match those filters.
                          <button
                            type="button"
                            className="gm-btn gm-btn-outline gm-btn-sm gm-sec-unfreeze"
                            onClick={() => {
                              setQuery("");
                              setFType("All types");
                              setFRisk("All risks");
                              setFDate("October 2026");
                              setFLoc("All locations");
                              setPage(1);
                            }}
                          >
                            Clear filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((e) => (
                        <LogRowView key={e.id} event={e} onOpen={setDrawer} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="gm-sec-log-foot">
                <small>
                  Showing {pageRows.length} of {events.length} events · {fDate}
                </small>
                <Pagination
                  page={page}
                  total={pageCount}
                  onChange={setPage}
                  perPage={perPage}
                  totalItems={events.length}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.5 backup ---------------- */}
        {view === "backup" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18.5"
                  title="Data backup & recovery"
                  subtitle="Encrypted snapshots in the Nairobi region, every 6 hours while you're online."
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-primary gm-btn-sm"
                      onClick={() => open({ kind: "backup-now" })}
                    >
                      <FileDown /> Backup now
                    </button>
                  }
                />
                <div className="gm-card p-3">
                  <div className="gm-sec-kv">
                    <div>
                      <span>Last backup</span>
                      <strong>Oct 25, 06:00 — 248 MB · verified ✓</strong>
                    </div>
                    <div>
                      <span>Next automatic run</span>
                      <strong>Today, 12:00 (5 h 58 min)</strong>
                    </div>
                    <div>
                      <span>Storage</span>
                      <strong>Encrypted · AWS Nairobi region</strong>
                    </div>
                    <div>
                      <span>Retention</span>
                      <strong>30 days snapshots · 12 months weekly</strong>
                    </div>
                  </div>
                  <div className="gm-sec-strength">
                    <small>Time since last backup</small>
                    <ProgressLine value={33} label="Backup age" />
                    <StatusChip label="Fresh" tone="low" />
                  </div>
                  <div className="gm-sec-toggle-stack">
                    <Toggle
                      checked={autoBackup}
                      onChange={setAutoBackup}
                      label="Automatic backup every 6 hours"
                      desc="Runs whenever the phone is online — 41,900+ objects each time"
                    />
                  </div>
                  <div className="gm-sec-pin-actions">
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline"
                      onClick={() => open({ kind: "restore" })}
                    >
                      <RotateCcw /> Restore from backup
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline"
                      onClick={() => open({ kind: "export-data" })}
                    >
                      <Download /> Export all data
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-ghost"
                      onClick={() => open({ kind: "data-transfer" })}
                    >
                      Data transfer request (KDP Act)
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.5"
                  title="What's inside a backup"
                  subtitle="≈ 248 MB across six collections."
                />
                <div className="gm-card p-2">
                  {BACKUP_CONTENTS.map((c) => (
                    <div key={c.id} className="gm-sec-content-row">
                      <span className="gm-sec-content-emoji">{c.emoji}</span>
                      <span>
                        {c.label}
                        <small>{c.objects}</small>
                      </span>
                      <strong>{c.size}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="gm-card p-2 mt-3">
              <h3 className="gm-sec-mini-title px-3 pt-2">Backup history</h3>
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Objects</th>
                      <th>Trigger</th>
                      <th>Status</th>
                      <th> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((b) => (
                      <BackupRowView
                        key={b.id}
                        backup={b}
                        onDetail={(bb) =>
                          open({ kind: "backup-detail", b: bb })
                        }
                        onRestore={(bb) => open({ kind: "restore", b: bb })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.6 protection ---------------- */}
        {view === "protection" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18.6"
                  title="Fraud protection"
                  subtitle="Nine controls working around the clock. The core ones can't be switched off — the optional ones are yours."
                />
                <div className="gm-card p-2">
                  {fraud.map((f) => (
                    <FraudFeatureRowView
                      key={f.id}
                      feature={f}
                      onToggle={(ff, v) => {
                        setFraud((cur) =>
                          cur.map((x) =>
                            x.id === ff.id ? { ...x, enabled: v } : x,
                          ),
                        );
                      }}
                      onDetail={(ff) => open({ kind: "fraud", f: ff })}
                    />
                  ))}
                </div>
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.6"
                  title="Velocity limits"
                  subtitle="Hard ceilings on how much moves, and how fast."
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => open({ kind: "velocity" })}
                    >
                      Edit
                    </button>
                  }
                />
                <div className="gm-card p-3">
                  <div className="gm-sec-kv">
                    <div>
                      <span>Max transactions / hour</span>
                      <strong>{velocity.perHour}</strong>
                    </div>
                    <div>
                      <span>Max wallet spend / day</span>
                      <strong>
                        KES {velocity.perDay.toLocaleString("en-KE")}
                      </strong>
                    </div>
                    <div>
                      <span>Unusual-payment threshold</span>
                      <strong>
                        {velocity.multiplier}× your 30-day average
                      </strong>
                    </div>
                    <div>
                      <span>Extra PIN above</span>
                      <strong>
                        KES{" "}
                        {(
                          velocity.avgPayout30d * velocity.multiplier
                        ).toLocaleString("en-KE")}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <SecCallout tone="info">
                    <strong>SIM-swap watch.</strong> If Safaricom sees a SIM
                    change on your number, M-Pesa payments freeze automatically
                    and the new SIM gets a confirmation ask. No money moves in
                    between.
                  </SecCallout>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.7 recovery ---------------- */}
        {view === "recovery" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="18.7"
              title="Account recovery"
              subtitle="Six scenarios, each with the exact path. Lost phone? Locked out? Suspected fraud? You're not stuck."
            />
            <div className="row g-3">
              {RECOVERY_SCENARIOS.map((s) => (
                <div className="col-md-6 col-xl-4" key={s.id}>
                  <RecoveryCard
                    scenario={s}
                    onOpen={(sc) => open({ kind: "recovery", s: sc })}
                  />
                </div>
              ))}
            </div>
            <div className="gm-card p-3 mt-3">
              <div className="gm-sec-support-strip">
                <a href="tel:0800100200">
                  <PhoneCall />
                  <span>
                    <strong>{SEC_CONTEXT.support}</strong>
                    <small>Toll-free · 24/7 · Kiswahili &amp; English</small>
                  </span>
                </a>
                <Link to="/app/channels">
                  <MessageSquare />
                  <span>
                    <strong>Live chat</strong>
                    <small>WhatsApp &amp; in-app · avg. 4 min</small>
                  </span>
                </Link>
                <a href={`mailto:${SEC_CONTEXT.dpo}`}>
                  <Mail />
                  <span>
                    <strong>DPO</strong>
                    <small>{SEC_CONTEXT.dpo}</small>
                  </span>
                </a>
                <button
                  type="button"
                  className="gm-btn gm-btn-primary"
                  onClick={() => open({ kind: "support" })}
                >
                  Open support desk
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.8 privacy ---------------- */}
        {view === "privacy" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-xl-7">
                <DashboardSectionHeader
                  eyebrow="18.8"
                  title="Your rights — Kenya Data Protection Act 2019"
                  subtitle="Eleven statutory rights, and exactly how GrowMO meets each one."
                />
                <div className="gm-card p-2">
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Right</th>
                          <th>How GrowMO meets it</th>
                          <th>Status</th>
                          <th> </th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRIVACY_RIGHTS.map((r) => (
                          <PrivacyRowView
                            key={r.id}
                            right={r}
                            onAction={(rr) => open({ kind: "privacy", r: rr })}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <DashboardSectionHeader
                  eyebrow="18.8"
                  title="Data sharing & consent"
                  subtitle="What leaves this account — toggle it off any time."
                />
                <div className="gm-card p-3">
                  <div className="gm-sec-toggle-stack">
                    {sharing.map((d) => (
                      <Toggle
                        key={d.id}
                        checked={d.enabled}
                        onChange={(v) => {
                          setSharing((cur) =>
                            cur.map((x) =>
                              x.id === d.id ? { ...x, enabled: v } : x,
                            ),
                          );
                        }}
                        label={d.label}
                        desc={d.note}
                      />
                    ))}
                  </div>
                </div>
                <div className="gm-card p-3 mt-3">
                  <h3 className="gm-sec-mini-title">Data Protection Officer</h3>
                  <div className="gm-sec-kv">
                    <div>
                      <span>Direct</span>
                      <strong>{SEC_CONTEXT.dpo}</strong>
                    </div>
                    <div>
                      <span>Breach notice</span>
                      <strong>Within 72 hours — as the Act requires</strong>
                    </div>
                    <div>
                      <span>Storage limit</span>
                      <strong>3 years inactivity + 90-day notice</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-sec-all-logs"
                    onClick={() => open({ kind: "dpo" })}
                  >
                    <Mail /> Contact the DPO
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 18.9 health check ---------------- */}
        {view === "health" ? (
          <div className="mt-3">
            <div className="row g-4">
              <div className="col-lg-4">
                <DashboardSectionHeader
                  eyebrow="18.9"
                  title="Security health check"
                  subtitle="Ten checks, about three seconds."
                />
                <div className="gm-card p-3 gm-sec-health-card">
                  <SecScoreRing
                    score={score}
                    hint={
                      score === 10
                        ? "All fixed — karibu sana!"
                        : SEC_CONTEXT.scoreHint
                    }
                  />
                  <div className="gm-sec-health-score-foot">
                    <button
                      type="button"
                      className="gm-btn gm-btn-primary"
                      onClick={() => open({ kind: "health" })}
                    >
                      <HeartPulse /> Run the 10-point check
                    </button>
                    <button
                      type="button"
                      className="gm-btn gm-btn-ghost"
                      onClick={() => open({ kind: "report" })}
                    >
                      <ScrollText /> Security report
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="gm-card p-2">
                  {checks.map((c) => (
                    <HealthCheckRowView
                      key={c.id}
                      check={c}
                      onFix={(cc) => {
                        if (cc.actionLabel === "Enable 2FA")
                          open({ kind: "twofa" });
                        else if (cc.actionLabel === "Add emergency contact")
                          open({ kind: "emergency" });
                        else gotoSessions();
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- FAQ + glossary (all views) ---------------- */}
        <div className="gm-card p-3 mt-4">
          <DashboardSectionHeader
            eyebrow="18.10"
            title="Security & data — questions we hear"
            subtitle="Plain answers. Anything deeper goes straight to the DPO."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => open({ kind: "faq" })}
              >
                <HelpCircle /> Open in a dialog
              </button>
            }
          />
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <SecFaqList items={SEC_FAQ} />
            </div>
            <div className="col-lg-6">
              <h3 className="gm-sec-mini-title">Glossary</h3>
              <SecGlossary items={SEC_GLOSSARY} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- log detail drawer ---------------- */}
      {drawer ? (
        <>
          <div
            className="gm-scrim is-visible"
            onClick={() => setDrawer(null)}
            aria-hidden="true"
          />
          <aside
            className="gm-drawer wide is-visible"
            role="dialog"
            aria-label="Security event detail"
          >
            <div className="gm-drawer-head">
              <h3>Security event</h3>
              <button
                type="button"
                className="gm-icon-btn"
                onClick={() => setDrawer(null)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <div className="gm-drawer-body">
              <div className="gm-sec-kv">
                <div>
                  <span>Timestamp</span>
                  <strong>{drawer.ts}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{drawer.type}</strong>
                </div>
                <div>
                  <span>Event</span>
                  <strong>{drawer.event}</strong>
                </div>
                <div>
                  <span>Details</span>
                  <strong>{drawer.details}</strong>
                </div>
                <div>
                  <span>IP</span>
                  <strong>{drawer.ip}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{drawer.location}</strong>
                </div>
                <div>
                  <span>Device</span>
                  <strong>{drawer.device}</strong>
                </div>
                <div>
                  <span>Risk</span>
                  <strong>
                    <StatusChip
                      label={drawer.risk}
                      tone={riskTone(drawer.risk)}
                    />
                  </strong>
                </div>
              </div>
              <div
                className={`gm-sec-riskbox gm-sec-riskbox-${riskTone(drawer.risk)}`}
              >
                {RISK_EXPLAIN[drawer.risk]}
              </div>
              <h3 className="gm-sec-mini-title">Similar events</h3>
              {LOG_EVENTS.filter(
                (e) => e.type === drawer.type && e.id !== drawer.id,
              )
                .slice(0, 3)
                .map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    className="gm-sec-related"
                    onClick={() => setDrawer(e)}
                  >
                    <span className="gm-sec-log-ts">{e.ts}</span>
                    <span>
                      {e.event} — {e.details}
                    </span>
                  </button>
                ))}
            </div>
            <div className="gm-drawer-foot">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => gotoSessions()}
              >
                <MonitorSmartphone /> Review devices
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-primary gm-btn-sm"
                onClick={() => {
                  open({ kind: "log-export" });
                  setDrawer(null);
                }}
              >
                <FileDown /> Export log
              </button>
            </div>
          </aside>
        </>
      ) : null}

      {/* ---------------- all 28 dialogs / wizards ---------------- */}
      <SecurityModals
        state={modal}
        onClose={close}
        onOpen={open}
        frozen={frozen}
        checks={checks}
        score={score}
        pinTxActive={txPin}
        autoLogout={autoLogout}
        logRows={events}
        emergency={emergency}
        onGotoLogs={gotoLogs}
        onGotoSessions={gotoSessions}
        onSessionTrusted={trust}
        onSessionLoggedOut={logoutDevice}
        onAutoLogoutSaved={(v) => {
          setAutoLogout(v);
          toast.notify(`Auto-logout set to ${v}.`, "success");
        }}
        onFraudToggled={(id, v) =>
          setFraud((cur) =>
            cur.map((x) => (x.id === id ? { ...x, enabled: v } : x)),
          )
        }
        onVelocitySaved={(v) => {
          setVelocity((cur) => ({ ...cur, ...v }));
          toast.notify("Velocity limits updated.", "success");
        }}
        onBackupAdded={addBackup}
        onRestoreDone={(info) =>
          toast.notify(
            `Restore from ${info.date} (${info.scope}) complete — ref ${info.ref}.`,
            "success",
          )
        }
        onExportDone={(info) =>
          toast.notify(
            `Export ready (${info.formats.join(", ").toUpperCase()}) — ref ${info.ref}.`,
            "success",
          )
        }
        onPinChanged={() => {
          setPinAge(0);
          toast.notify(
            "PIN changed — the other 4 sessions were logged out for safety.",
            "success",
          );
        }}
        onTxPinChanged={(on) => setTxPin(on)}
        onSecureDone={(f) => {
          setFrozen(f);
          toast.notify(
            f
              ? "Account frozen — all outgoing money is stopped."
              : "Freeze lifted — normal payments resume.",
            "warn",
          );
        }}
        onTwoFaDone={(method) => {
          if (method === "app") {
            setTwoFaApp(true);
            toast.notify(
              "Authenticator app linked — your score is now 9/10.",
              "success",
            );
          } else {
            toast.notify(
              "SMS 2FA tightened — new devices and withdrawals now need the extra code.",
              "success",
            );
          }
        }}
        onEmergencySaved={(name) => setEmergency(name)}
        onRestrictionSaved={(id, v) =>
          setSharing((cur) =>
            cur.map((x) => (x.id === id ? { ...x, enabled: v } : x)),
          )
        }
        onAccountDeleted={() => setDeleted(true)}
      />
    </main>
  );
}

/* ---- tiny local helpers (page-scoped, no new global classes) ---- */

function WizardNoteLite({ text }: { text: string }) {
  return <p className="gm-sec-wiznote-lite">{text}</p>;
}

function SearchGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/* Local constants that mirror the data module's filter lists, kept here so the
   select markup stays a plain string list (Biome-friendly, no type juggling). */
const LOG_EVENT_TYPES_LIST: LogType[] = [
  "Login",
  "Login attempt",
  "Payment",
  "PIN",
  "Device",
  "Data",
  "Alert",
  "Backup",
  "Settings",
];
