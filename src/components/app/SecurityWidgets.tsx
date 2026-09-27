/* PAGE 18 — Security, Logs, Backups & Account Protection — reusable widgets.
   Presentational only; state lives in /app/logs route + SecurityModals. */

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  FileDown,
  Globe,
  Info,
  KeyRound,
  Laptop,
  MapPin,
  MonitorSmartphone,
  ScanFace,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import {
  type AuthMethod,
  type BackupRow,
  type FraudFeature,
  type HealthCheck,
  type LogEvent,
  type PrivacyRight,
  type RecoveryScenario,
  riskTone,
  SEC_CONTEXT,
  type Session,
  type TierSetup,
} from "../../data/app/logs";
import { StatusChip } from "./DashboardWidgets";

/* ---------- small shared bits ---------- */

export function SecScoreRing({ score, hint }: { score: number; hint: string }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const pct = (score / 10) * 100;
  const color =
    score >= 9
      ? "var(--gm-leaf-500)"
      : score >= 6
        ? "var(--gm-gold-500)"
        : "var(--gm-clay-500)";
  return (
    <div
      className="gm-sec-score"
      role="img"
      aria-label={`Security score ${score} out of 10`}
    >
      <svg viewBox="0 0 140 140" width="100%" height="100%" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset .8s var(--gm-ease)" }}
        />
      </svg>
      <div className="gm-sec-score-center">
        <strong>
          {score}
          <span>/10</span>
        </strong>
        <small>{hint}</small>
      </div>
    </div>
  );
}

export function LevelChip({ level }: { level: AuthMethod["level"] }) {
  const tone = level === "Medium" ? "medium" : "low";
  return <StatusChip label={level} tone={tone} />;
}

export function Chip({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <span className="gm-sec-chip">
      {Icon ? <Icon /> : null}
      {children}
    </span>
  );
}

export function SecCallout({
  tone,
  children,
}: {
  tone: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const Icon =
    tone === "warn" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info;
  return (
    <div className={`gm-sec-callout gm-sec-callout-${tone}`}>
      <Icon />
      <div>{children}</div>
    </div>
  );
}

/* ---------- hero ---------- */

export type SecAction =
  | "run-health"
  | "backup-now"
  | "secure-account"
  | "review-devices"
  | "export-csv"
  | "security-report"
  | "faq"
  | "dpo";

const HERO_ACTIONS: { id: SecAction; label: string; icon: LucideIcon }[] = [
  { id: "run-health", label: "Run health check", icon: ShieldCheck },
  { id: "backup-now", label: "Backup now", icon: FileDown },
  { id: "secure-account", label: "Secure my account", icon: ShieldOff },
  { id: "review-devices", label: "Review devices", icon: MonitorSmartphone },
];

export function SecurityHero({
  onAction,
  score,
  lastBackup,
  nextBackup,
  backupSize,
  failed7d,
  logins7d,
}: {
  onAction: (a: SecAction) => void;
  score: number;
  lastBackup: string;
  nextBackup: string;
  backupSize: string;
  failed7d: number;
  logins7d: number;
}) {
  return (
    <section className="gm-sec-hero" aria-label="Security overview">
      <div className="gm-sec-hero-grid">
        <div>
          <div className="gm-sec-hero-eyebrow">
            <ShieldCheck />
            Security, logs, backups &amp; account protection
          </div>
          <h1 className="gm-sec-hero-title">
            Your farm account, <em>bomvu yetu</em> — protected end to end
          </h1>
          <p className="gm-sec-hero-sub">
            Every login, payment and backup for {SEC_CONTEXT.farm} is logged,
            encrypted and restorable. Kenya DPA 2019 compliant — the DPO is one
            tap away.
          </p>
          <div className="gm-sec-hero-chips">
            <Chip icon={Globe}>{SEC_CONTEXT.encryption}</Chip>
            <Chip icon={KeyRound}>Phone {SEC_CONTEXT.phone}</Chip>
            <Chip icon={ShieldCheck}>Tier: {SEC_CONTEXT.tier}</Chip>
            <Chip icon={MapPin}>{SEC_CONTEXT.county} County</Chip>
          </div>
          <div className="gm-sec-hero-actions">
            {HERO_ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                className="gm-sec-hero-btn"
                onClick={() => onAction(a.id)}
              >
                <a.icon />
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="gm-sec-score-wrap">
          <SecScoreRing score={score} hint={SEC_CONTEXT.scoreHint} />
          <ul className="gm-sec-strip">
            <li>
              <strong>{logins7d}</strong>
              <small>logins · 7 days</small>
            </li>
            <li>
              <strong>{failed7d}</strong>
              <small>failed attempts</small>
            </li>
            <li>
              <strong>{backupSize}</strong>
              <small>last backup {lastBackup}</small>
            </li>
            <li>
              <strong>{nextBackup}</strong>
              <small>next auto run</small>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 18.1 auth methods ---------- */

const METHOD_ICONS: Record<string, LucideIcon> = {
  "phone-otp": Smartphone,
  pin: KeyRound,
  "bio-finger": Cpu,
  "bio-face": ScanFace,
  "2fa-app": ShieldCheck,
  "2fa-sms": Globe,
  "hw-key": Laptop,
};

export function AuthMethodCard({
  method,
  onDetail,
}: {
  method: AuthMethod;
  onDetail: (m: AuthMethod) => void;
}) {
  const Icon = METHOD_ICONS[method.id] ?? ShieldCheck;
  return (
    <div className={`gm-sec-method ${method.enabled ? "is-on" : ""}`}>
      <div className="gm-sec-method-ic">
        <Icon />
      </div>
      <div className="gm-sec-method-body">
        <div className="gm-sec-method-top">
          <strong>{method.name}</strong>
          <span className="gm-sec-method-swahili">{method.swahili}</span>
          <LevelChip level={method.level} />
        </div>
        <p>{method.how}</p>
        <div className="gm-sec-method-foot">
          <span
            className={`gm-sec-method-state ${method.enabled ? "on" : "off"}`}
          >
            {method.enabled ? "● Active" : "○ Not active"}
          </span>
          <button type="button" onClick={() => onDetail(method)}>
            {method.enabled ? "Details" : method.setup}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TierCard({
  tier,
  onOpen,
}: {
  tier: TierSetup;
  onOpen: () => void;
}) {
  return (
    <div className={`gm-sec-tier ${tier.active ? "is-active" : ""}`}>
      <div className="gm-sec-tier-top">
        <strong>{tier.tier}</strong>
        <span>{tier.swahili}</span>
        {tier.active ? (
          <span className="gm-chip gm-risk gm-risk-low">Your tier</span>
        ) : null}
      </div>
      <dl className="gm-sec-tier-dl">
        <div>
          <dt>Minimum</dt>
          <dd>{tier.minimum}</dd>
        </div>
        <div>
          <dt>Recommended</dt>
          <dd>{tier.recommended}</dd>
        </div>
      </dl>
      <p className="gm-sec-tier-note">{tier.note}</p>
      <button type="button" onClick={onOpen}>
        Why this setup?
      </button>
    </div>
  );
}

/* ---------- 18.3 sessions ---------- */

export function SessionRowView({
  session,
  onDetail,
  onLogout,
  onTrust,
}: {
  session: Session;
  onDetail: (s: Session) => void;
  onLogout: (s: Session) => void;
  onTrust: (s: Session) => void;
}) {
  return (
    <tr className={session.current ? "gm-sec-row-current" : ""}>
      <td>
        <button
          type="button"
          className="gm-sec-sess-device"
          onClick={() => onDetail(session)}
        >
          <Smartphone />
          <span>
            {session.device}
            <small>
              {session.model} · {session.os}
            </small>
          </span>
        </button>
      </td>
      <td>{session.location}</td>
      <td>
        <span className="gm-sec-sess-ip">{session.ip}</span>
      </td>
      <td>{session.lastActive}</td>
      <td>
        {session.trusted ? (
          <StatusChip label="Trusted" tone="low" />
        ) : session.current ? (
          <StatusChip label="This device" tone="low" />
        ) : (
          <StatusChip label="Untrusted" tone="medium" />
        )}
      </td>
      <td className="gm-sec-sess-actions">
        {!session.current ? (
          <>
            <button
              type="button"
              onClick={() => onTrust(session)}
              disabled={session.trusted}
            >
              {session.trusted ? "Trusted" : "Trust"}
            </button>
            <button
              type="button"
              className="danger"
              onClick={() => onLogout(session)}
            >
              Log out
            </button>
          </>
        ) : (
          <span className="gm-sec-sess-current">Current</span>
        )}
      </td>
    </tr>
  );
}

/* ---------- 18.4 logs ---------- */

export function LogRowView({
  event,
  onOpen,
}: {
  event: LogEvent;
  onOpen: (e: LogEvent) => void;
}) {
  return (
    <tr>
      <td className="gm-sec-log-ts">
        {event.ts}
        <small>{event.ip}</small>
      </td>
      <td>
        <button
          type="button"
          className="gm-sec-log-event"
          onClick={() => onOpen(event)}
        >
          {event.event}
        </button>
        <span className="gm-chip gm-sec-log-type">{event.type}</span>
      </td>
      <td className="gm-sec-log-details">{event.details}</td>
      <td>
        {event.location === "—" ? (
          <span className="gm-sec-muted">—</span>
        ) : (
          event.location
        )}
      </td>
      <td>
        {event.device === "—" ? (
          <span className="gm-sec-muted">—</span>
        ) : (
          event.device
        )}
      </td>
      <td>
        <StatusChip label={event.risk} tone={riskTone(event.risk)} />
      </td>
    </tr>
  );
}

/* ---------- 18.5 backups ---------- */

export function BackupRowView({
  backup,
  onDetail,
  onRestore,
}: {
  backup: BackupRow;
  onDetail: (b: BackupRow) => void;
  onRestore: (b: BackupRow) => void;
}) {
  return (
    <tr>
      <td>
        <button
          type="button"
          className="gm-sec-backup-date"
          onClick={() => onDetail(backup)}
        >
          <Clock />
          {backup.date}
        </button>
      </td>
      <td>
        <StatusChip
          label={backup.type}
          tone={backup.type === "Manual" ? "medium" : "neutral"}
        />
      </td>
      <td>{backup.size}</td>
      <td className="gm-sec-backup-objects">
        {backup.objects.toLocaleString("en-KE")} objects
      </td>
      <td>{backup.trigger}</td>
      <td>
        <StatusChip
          label={backup.status}
          tone={
            backup.status === "Complete"
              ? "low"
              : backup.status === "Running"
                ? "medium"
                : "high"
          }
        />
      </td>
      <td className="gm-sec-backup-action">
        {backup.status === "Complete" ? (
          <button type="button" onClick={() => onRestore(backup)}>
            Restore
          </button>
        ) : (
          <span className="gm-sec-muted">—</span>
        )}
      </td>
    </tr>
  );
}

/* ---------- 18.6 fraud ---------- */

export function FraudFeatureRowView({
  feature,
  onToggle,
  onDetail,
}: {
  feature: FraudFeature;
  onToggle: (f: FraudFeature, v: boolean) => void;
  onDetail: (f: FraudFeature) => void;
}) {
  return (
    <div className="gm-sec-fraud">
      <button
        type="button"
        className="gm-sec-fraud-main"
        onClick={() => onDetail(feature)}
      >
        <span className="gm-sec-fraud-name">
          {feature.name}
          <small>{feature.swahili}</small>
        </span>
        <span className="gm-sec-fraud-how">{feature.how}</span>
      </button>
      <div className="gm-sec-fraud-side">
        {feature.locked ? (
          <span className="gm-chip gm-sec-muted">Always on</span>
        ) : (
          <button
            type="button"
            role="switch"
            aria-checked={feature.enabled}
            aria-label={`${feature.name} ${feature.enabled ? "on" : "off"}`}
            className={`gm-sec-switch ${feature.enabled ? "is-on" : ""}`}
            onClick={() => onToggle(feature, !feature.enabled)}
          >
            <span className="gm-sec-switch-thumb" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- 18.7 recovery ---------- */

export function RecoveryCard({
  scenario,
  onOpen,
}: {
  scenario: RecoveryScenario;
  onOpen: (s: RecoveryScenario) => void;
}) {
  return (
    <div className="gm-sec-recovery">
      <div className="gm-sec-recovery-top">
        <strong>{scenario.scenario}</strong>
        <span>{scenario.swahili}</span>
      </div>
      <p className="gm-sec-recovery-method">{scenario.method}</p>
      <ol className="gm-sec-recovery-steps">
        {scenario.steps.map((s, i) => (
          <li key={s}>
            <i>{i + 1}</i>
            {s}
          </li>
        ))}
      </ol>
      <div className="gm-sec-recovery-foot">
        <span className="gm-chip gm-sec-muted">
          <Clock /> {scenario.eta}
        </span>
        <button type="button" onClick={() => onOpen(scenario)}>
          {scenario.cta}
        </button>
      </div>
    </div>
  );
}

/* ---------- 18.8 privacy ---------- */

export function PrivacyRowView({
  right,
  onAction,
}: {
  right: PrivacyRight;
  onAction: (r: PrivacyRight) => void;
}) {
  return (
    <tr>
      <td>
        <strong>{right.right}</strong>
        <small className="gm-sec-right-sw">{right.swahili}</small>
      </td>
      <td className="gm-sec-right-impl">{right.impl}</td>
      <td>
        <StatusChip
          label={right.status}
          tone={
            right.status === "Active"
              ? "low"
              : right.status === "Opted out"
                ? "neutral"
                : "medium"
          }
        />
      </td>
      <td className="gm-sec-right-action">
        {right.actionable ? (
          <button type="button" onClick={() => onAction(right)}>
            Open
          </button>
        ) : (
          <span className="gm-sec-muted">Built-in</span>
        )}
      </td>
    </tr>
  );
}

/* ---------- 18.9 health ---------- */

const CHECK_ICONS = {
  Pass: CheckCircle2,
  Fail: ShieldOff,
  Warn: AlertTriangle,
} as const;

export function HealthCheckRowView({
  check,
  onFix,
}: {
  check: HealthCheck;
  onFix: (c: HealthCheck) => void;
}) {
  const Icon = CHECK_ICONS[check.status];
  return (
    <div
      className={`gm-sec-health gm-sec-health-${check.status.toLowerCase()}`}
    >
      <Icon className="gm-sec-health-ic" />
      <div className="gm-sec-health-body">
        <strong>{check.check}</strong>
        <small>{check.detail}</small>
      </div>
      {check.actionLabel ? (
        <button type="button" onClick={() => onFix(check)}>
          {check.actionLabel}
        </button>
      ) : (
        <StatusChip
          label={check.status}
          tone={
            check.status === "Pass"
              ? "low"
              : check.status === "Warn"
                ? "medium"
                : "high"
          }
        />
      )}
    </div>
  );
}

/* ---------- FAQ / glossary ---------- */

export function SecFaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="gm-sec-faq">
      {items.map((f) => (
        <details key={f.q} className="gm-acc">
          <summary className="gm-acc-head">
            {f.q}
            <ChevronDown />
          </summary>
          <p className="gm-sec-faq-a">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function SecGlossary({
  items,
}: {
  items: { term: string; def: string }[];
}) {
  return (
    <div className="gm-sec-glossary">
      {items.map((g) => (
        <div key={g.term} className="gm-sec-glossary-item">
          <strong>{g.term}</strong>
          <span>{g.def}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- wizard shared views ---------- */

export function ProcessingView({
  title,
  lines,
}: {
  title: string;
  lines: string[];
}) {
  return (
    <div className="gm-sec-processing" role="status">
      <span className="gm-spinner" aria-hidden />
      <strong>{title}</strong>
      <div className="gm-sec-processing-lines">
        {lines.map((l, i) => (
          <span key={l} style={{ animationDelay: `${i * 0.35}s` }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SuccessView({
  title,
  sub,
  receipt,
  actions,
}: {
  title: string;
  sub: string;
  receipt: { k: string; v: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="gm-sec-success">
      <CheckCircle2 />
      <strong>{title}</strong>
      <p>{sub}</p>
      {receipt.length > 0 ? (
        <div className="gm-sec-receipt">
          {receipt.map((r) => (
            <div key={r.k}>
              <span>{r.k}</span>
              <strong>{r.v}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {actions}
    </div>
  );
}

export function QrGraphic({ seed, label }: { seed: string; label: string }) {
  const cells = qrCells(seed, 21);
  return (
    <div className="gm-sec-qr" role="img" aria-label={label}>
      <div className="gm-sec-qr-grid">
        {cells.map((on, i) => (
          <i key={i} className={on ? "on" : ""} />
        ))}
      </div>
      <small>{label}</small>
    </div>
  );
}

function qrCells(seed: string, n: number): boolean[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells: boolean[] = [];
  let x = h >>> 0;
  for (let i = 0; i < n * n; i++) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    cells.push((x & 3) > 1);
  }
  return cells;
}

export function PinDots({ count, total }: { count: number; total: number }) {
  return (
    <div className="gm-sec-pindots" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < count ? "on" : ""} />
      ))}
    </div>
  );
}

export function WizardNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="gm-sec-wiznote">
      <Info />
      <div>{children}</div>
    </div>
  );
}

/* tiny in-card heading used inside modal bodies */
export function ModalSectionTitle({
  icon: Icon,
  children,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h4 className="gm-sec-modal-title">
      {Icon ? <Icon /> : null}
      {children}
    </h4>
  );
}
