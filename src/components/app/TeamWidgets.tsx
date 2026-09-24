/* ============================================================================
   PAGE 15.3 — TEAM MANAGEMENT & HUMAN RESOURCES  (/app/team)
   Display widgets. All state + modal dispatch lives in the route;
   modals live in TeamModals.tsx. Tokens only, .gm-app / .gm-modal-overlay.
   ========================================================================== */
import {
  ChevronDown,
  FileText,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  AdvanceRec,
  AnalyticRow,
  AttendanceMethod,
  AttStatus,
  ComplianceRow,
  PerfHistory,
  WorkerStatus,
} from "../../data/app/team";
import { COST_BREAKDOWN, PERFORMANCE_CARDS } from "../../data/app/team";
import { kes } from "../../data/site";
import { Stars } from "../ui/primitives";

/* Payroll pipeline — 4 steps of section 15.3.5 */
export const PAYROLL_STAGES: {
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Payslips",
    desc: "Days, OT at 1.5×, piece rates, deductions — auto from attendance",
    icon: FileText,
  },
  {
    label: "Review",
    desc: "Adjust a bonus or deduction per worker, approve all at once",
    icon: ShieldCheck,
  },
  {
    label: "Approve",
    desc: "6-digit PIN gate, then the batch runs",
    icon: WalletCards,
  },
  {
    label: "SMS",
    desc: "Kiswahili payslip SMS + PDF to every worker",
    icon: MessageSquare,
  },
];

const FALLBACK_PERF = {
  avg: 3.5,
  dist: [0, 20, 60, 15, 5] as [number, number, number, number, number],
  rework: 3,
  noShow: 0,
  lates: 1,
  speedVs: "—",
  qualityVs: "—",
  strengths: "New this season — first full review due.",
  improve: "Build the task history to unlock the trend chart.",
};

export function perfCardFor(name: string) {
  return PERFORMANCE_CARDS[name] ?? FALLBACK_PERF;
}

/* ---------------- shared bits ---------------- */

export function workerTone(
  status: WorkerStatus,
): "low" | "medium" | "high" | "neutral" {
  switch (status) {
    case "Active":
      return "low";
    case "On leave":
      return "neutral";
    case "Suspended":
      return "high";
    case "Terminated":
      return "high";
    default:
      return "neutral";
  }
}

export function workerChip(status: WorkerStatus) {
  const tone = workerTone(status);
  const cls = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return <span className={`gm-chip ${cls}`}>{status}</span>;
}

export function attTone(
  status: AttStatus,
): "low" | "medium" | "high" | "neutral" {
  switch (status) {
    case "Present":
      return "low";
    case "Half day":
      return "neutral";
    case "Late":
      return "medium";
    case "Leave":
      return "neutral";
    default:
      return "high";
  }
}

export function attChip(status: AttStatus) {
  const tone = attTone(status);
  const cls = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return <span className={`gm-chip ${cls}`}>{status}</span>;
}

export function WorkerAvatar({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("");
  return (
    <span
      className="gm-team-avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Money({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  return (
    <strong className={`font-display gm-team-money ${className ?? ""}`}>
      {value}
    </strong>
  );
}

/* ---------------- hero ---------------- */

export interface TeamKpi {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}

export function TeamHero({
  kpis,
  actions,
}: {
  kpis: TeamKpi[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-team-hero">
      <div className="gm-team-hero-grid">
        <div>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 15.3 · Team management &amp; HR
          </span>
          <h1 className="font-display mt-2">The people who grow the farm</h1>
          <p className="gm-lead on-dark mb-0">
            Wastani wa timu: hire with the community board, tick attendance with
            SMS check-ins, rate every task, and run the Friday payroll in four
            steps — from payslip to M-Pesa receipt.
          </p>
        </div>
        <div className="gm-team-hero-actions">{actions}</div>
      </div>
      <div className="gm-stat-grid gm-team-hero-kpis">
        {kpis.map((k) => (
          <div key={k.label} className="gm-team-hero-kpi">
            <span className="gm-mega-icon">
              <k.icon />
            </span>
            <div>
              <strong className="gm-stat-value font-display">{k.value}</strong>
              <span className="gm-stat-label">{k.label}</span>
              <small className="gm-stat-sub">{k.note}</small>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}

/* ---------------- overview ---------------- */

export function AlertBand({
  items,
}: {
  items: { id: string; tone: "warn" | "success"; text: string }[];
}) {
  return (
    <div className="gm-team-alerts">
      {items.map((a) => (
        <div key={a.id} className={`gm-team-alert is-${a.tone}`}>
          <span className="gm-team-alert-dot" aria-hidden />
          <p>{a.text}</p>
        </div>
      ))}
    </div>
  );
}

export function ComplianceSnapshot({
  rows,
  onOpen,
}: {
  rows: ComplianceRow[];
  onOpen: (row: ComplianceRow) => void;
}) {
  const met = rows.filter((r) => r.status === "Met").length;
  const attention = rows.filter((r) => r.status !== "Met");
  return (
    <div className="gm-card">
      <div className="gm-dash-section-title">
        <div>
          <span className="gm-eyebrow">Labour law · Kenya</span>
          <h2 className="gm-h-section">Compliance snapshot</h2>
        </div>
        <span
          className={`gm-chip ${attention.length ? "gm-risk gm-risk-medium" : ""}`}
        >
          {met}/{rows.length} met
        </span>
      </div>
      {attention.length ? (
        <ul className="gm-team-watchlist">
          {attention.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="gm-team-watch-item"
                onClick={() => onOpen(r)}
              >
                <span
                  className={`gm-chip gm-risk gm-risk-${r.status === "Warning" ? "medium" : "high"}`}
                >
                  {r.status}
                </span>
                <strong>{r.requirement}</strong>
                <small>{r.note}</small>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">
          All 12 requirements met — nothing needs attention.
        </p>
      )}
    </div>
  );
}

/* ---------------- recruitment ---------------- */

export function JobPostCard({
  post,
  onOpen,
}: {
  post: {
    id: string;
    title: string;
    duration: string;
    rate: string;
    needed: number;
    hired: number;
    status: "Open" | "Filling" | "Closed";
    channels: string[];
    closes: string;
  };
  onOpen: () => void;
}) {
  const pct = post.needed ? Math.round((post.hired / post.needed) * 100) : 0;
  return (
    <article className="gm-card gm-team-job">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">
            {post.id} · {post.status}
          </span>
          <h3 className="font-display gm-team-job-title">{post.title}</h3>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onOpen}
        >
          View
        </button>
      </div>
      <div className="gm-team-job-facts">
        <span>{post.duration}</span>
        <Money value={post.rate} />
        <span>
          {post.closes === "—" ? "Draft — not posted" : `Closes ${post.closes}`}
        </span>
      </div>
      <div className="d-flex align-items-center gap-3 mt-3">
        <div
          className="gm-progress gm-team-job-progress"
          role="progressbar"
          aria-label="Hired"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <i style={{ width: `${pct}%` }} />
        </div>
        <span className="text-muted" style={{ fontSize: ".8rem" }}>
          {post.hired}/{post.needed} hired
        </span>
      </div>
      {post.channels.length ? (
        <div className="gm-team-chip-row">
          {post.channels.map((c) => (
            <span key={c} className="gm-chip">
              {c}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function StageChip({ stage }: { stage: string }) {
  const tone: "low" | "medium" | "high" | "neutral" =
    stage === "Hired"
      ? "low"
      : stage === "Declined"
        ? "high"
        : stage === "Onboarding"
          ? "medium"
          : "neutral";
  const cls = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return <span className={`gm-chip ${cls}`}>{stage}</span>;
}

export function OnboardingCard({
  applicant,
  done,
  total,
  onOpen,
}: {
  applicant: { id: string; name: string; job: string; note: string };
  done: number;
  total: number;
  onOpen: () => void;
}) {
  const pct = Math.round((done / total) * 100);
  return (
    <div className="gm-card gm-team-onb">
      <div className="d-flex align-items-center gap-3">
        <WorkerAvatar name={applicant.name} size={40} />
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">{applicant.id} · onboarding</span>
          <strong>{applicant.name}</strong>
          <small className="text-muted d-block">{applicant.job}</small>
        </div>
        <span
          className={`gm-chip ${pct === 100 ? "gm-risk gm-risk-low" : "gm-risk gm-risk-medium"}`}
        >
          {done}/{total} done
        </span>
      </div>
      <div
        className="gm-progress mt-3"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="text-muted mb-2 mt-2">{applicant.note}</p>
      <button
        type="button"
        className="gm-btn gm-btn-primary gm-btn-sm"
        onClick={onOpen}
      >
        Open checklist
      </button>
    </div>
  );
}

/* ---------------- attendance ---------------- */

export function MethodRowView({
  method,
  onToggle,
}: {
  method: AttendanceMethod;
  onToggle: () => void;
}) {
  return (
    <div className={`gm-team-method ${method.available ? "" : "is-off"}`}>
      <div style={{ flex: 1 }}>
        <div className="d-flex align-items-center gap-2">
          <strong>{method.method}</strong>
          {!method.available ? (
            <span className="gm-chip">coming soon</span>
          ) : method.active ? (
            <span className="gm-chip gm-risk gm-risk-low">active</span>
          ) : (
            <span className="gm-chip">off</span>
          )}
        </div>
        <small className="text-muted">{method.how}</small>
        <small className="d-block text-muted">Best for: {method.bestFor}</small>
      </div>
      {method.available ? (
        <button
          type="button"
          role="switch"
          aria-checked={method.active}
          aria-label={`Toggle ${method.method}`}
          className={`gm-toggle-track ${method.active ? "is-on" : ""}`}
          onClick={onToggle}
        >
          <span className="gm-toggle-thumb" />
        </button>
      ) : (
        <span className="text-muted" style={{ fontSize: ".75rem" }}>
          future
        </span>
      )}
    </div>
  );
}

/* ---------------- performance ---------------- */

export function RatingDist({
  dist,
}: {
  dist: [number, number, number, number, number];
}) {
  const max = Math.max(...dist, 1);
  return (
    <div className="gm-team-dist">
      {[5, 4, 3, 2, 1].map((star, i) => (
        <div key={star} className="gm-team-dist-row">
          <span className="gm-team-dist-label">{star}★</span>
          <div
            className="gm-progress"
            role="progressbar"
            aria-label={`${star} star ratings`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((dist[i] / max) * 100)}
          >
            <i style={{ width: `${(dist[i] / max) * 100}%` }} />
          </div>
          <span className="gm-team-dist-num">{dist[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function PerfTrendChart({ data }: { data: PerfHistory[] }) {
  const W = 560;
  const H = 180;
  const padX = 8;
  const padY = 18;
  const minR = 3.0;
  const maxR = 5.0;
  const maxT = Math.max(...data.map((d) => d.tasks), 1);
  const x = (i: number) => padX + (i * (W - 2 * padX)) / (data.length - 1);
  const y = (r: number) => padY + ((maxR - r) * (H - 2 * padY)) / (maxR - minR);
  const line = data
    .map(
      (d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.rating).toFixed(1)}`,
    )
    .join(" ");
  const avgLine = data
    .map(
      (d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.farmAvg).toFixed(1)}`,
    )
    .join(" ");
  const barW = (W - 2 * padX) / data.length / 3;
  return (
    <div className="gm-card gm-team-chart">
      <div className="gm-dash-section-title">
        <div>
          <span className="gm-eyebrow">12-month trend</span>
          <h2 className="gm-h-section">Rating vs farm average</h2>
        </div>
        <div className="gm-team-legend">
          <span>
            <i className="gm-team-legend-line" /> Worker
          </span>
          <span>
            <i className="gm-team-legend-dash" /> Farm avg
          </span>
          <span>
            <i className="gm-team-legend-bar" /> Tasks
          </span>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="gm-team-trend"
        role="img"
        aria-label="Monthly average rating line with task volume bars, compared to farm average"
      >
        {[4.0, 4.5].map((g) => (
          <g key={g}>
            <line
              x1={padX}
              x2={W - padX}
              y1={y(g)}
              y2={y(g)}
              className="gm-team-grid"
            />
            <text
              x={W - padX}
              y={y(g) - 4}
              textAnchor="end"
              className="gm-team-gridtext"
            >
              {g.toFixed(1)}★
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <rect
            key={d.month}
            x={x(i) - barW / 2}
            y={H - padY - (d.tasks / maxT) * (H - 2 * padY)}
            width={barW}
            height={(d.tasks / maxT) * (H - 2 * padY)}
            className="gm-team-trend-bar"
          />
        ))}
        <path d={avgLine} className="gm-team-trend-avg" />
        <path d={line} className="gm-team-trend-line" />
        {data.map((d, i) => (
          <circle
            key={d.month}
            cx={x(i)}
            cy={y(d.rating)}
            r={3}
            className="gm-team-trend-dot"
          />
        ))}
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text
              key={d.month}
              x={x(i)}
              y={H - 2}
              textAnchor="middle"
              className="gm-team-gridtext"
            >
              {d.month}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

export function RatingScaleLegend() {
  return (
    <ol className="gm-team-scale">
      {[
        [5, "Excellent", "Exceeded expectations, no rework needed"],
        [4, "Good", "Met all expectations, minor issues"],
        [3, "Satisfactory", "Done adequately, some rework"],
        [2, "Below average", "Significant rework needed"],
        [1, "Poor", "Work unacceptable, must redo"],
      ].map(([s, label, desc]) => (
        <li key={s} className="gm-team-scale-row">
          <span className="gm-team-scale-star">{s}★</span>
          <strong>{label as string}</strong>
          <small className="text-muted">{desc as string}</small>
        </li>
      ))}
    </ol>
  );
}

/* ---------------- payroll ---------------- */

export function PipelineStep({
  state,
  label,
  desc,
  icon: Icon,
}: {
  state: "done" | "now" | "todo";
  label: string;
  desc: string;
  icon: LucideIcon;
}) {
  return (
    <div className={`gm-team-pipe is-${state}`}>
      <span className="gm-team-pipe-dot">
        <Icon />
      </span>
      <div>
        <strong>{label}</strong>
        <small className="text-muted">{desc}</small>
      </div>
    </div>
  );
}

export function SmsBubble({ text, from }: { text: string; from?: string }) {
  return (
    <div className="gm-sms">
      {from ? <span className="gm-sms-from">{from}</span> : null}
      <div className="gm-sms-bubble">{text}</div>
    </div>
  );
}

export function ReceiptRow({
  worker,
  amount,
  ref,
  method,
}: {
  worker: string;
  amount: string;
  ref: string;
  method: string;
}) {
  return (
    <div className="gm-team-receipt">
      <div className="d-flex align-items-center gap-3">
        <WorkerAvatar name={worker} size={32} />
        <div style={{ flex: 1 }}>
          <strong>{worker}</strong>
          <small className="text-muted d-block">{method}</small>
        </div>
        <Money value={amount} />
      </div>
      <code className="gm-team-ref">{ref}</code>
    </div>
  );
}

/* ---------------- advances ---------------- */

export function AdvanceProgress({ rec }: { rec: AdvanceRec }) {
  const paid = rec.amount - rec.remaining;
  const pct = rec.amount ? Math.round((paid / rec.amount) * 100) : 0;
  return (
    <div className="gm-team-adv">
      <div
        className="d-flex justify-content-between"
        style={{ fontSize: ".78rem" }}
      >
        <span className="text-muted">
          {kes(rec.amount)} · {rec.plan}
        </span>
        <span className="text-muted">
          {rec.remaining > 0 ? `${kes(rec.remaining)} left` : "settled"}
        </span>
      </div>
      <div
        className="gm-progress"
        role="progressbar"
        aria-label="Repayment progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------------- compliance / analytics ---------------- */

export function complianceTone(status: ComplianceRow["status"]) {
  return status === "Met" ? "low" : status === "Warning" ? "medium" : "high";
}

export function ComplianceRowView({
  row,
  onOpen,
}: {
  row: ComplianceRow;
  onOpen: () => void;
}) {
  const tone = complianceTone(row.status);
  return (
    <tr className="gm-team-cmp-row" onClick={onOpen}>
      <th scope="row">
        <strong>{row.requirement}</strong>
        <small className="text-muted d-block">{row.details}</small>
      </th>
      <td>{row.tracking}</td>
      <td>
        <span className={`gm-chip gm-risk gm-risk-${tone}`}>{row.status}</span>
      </td>
      <td>
        <button
          type="button"
          className="gm-btn gm-btn-ghost gm-btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          Details
        </button>
      </td>
    </tr>
  );
}

export function AnalyticRowView({ row }: { row: AnalyticRow }) {
  const tone =
    row.changeGood === null ? "neutral" : row.changeGood ? "low" : "high";
  const cls = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return (
    <tr>
      <th scope="row">{row.metric}</th>
      <td>
        <Money value={row.thisMonth} />
      </td>
      <td>{row.lastMonth}</td>
      <td>
        <span className={`gm-chip ${cls}`}>{row.change}</span>
      </td>
      <td className="text-muted">{row.countyAvg}</td>
    </tr>
  );
}

export function CostBreakdownBars() {
  return (
    <div className="gm-team-cost">
      {COST_BREAKDOWN.map((c) => (
        <div key={c.label} className="gm-team-cost-row">
          <div
            className="d-flex justify-content-between"
            style={{ fontSize: ".8rem" }}
          >
            <span>{c.label}</span>
            <Money value={kes(c.amount)} />
          </div>
          <div
            className="gm-progress"
            role="progressbar"
            aria-label={c.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={c.pct}
          >
            <i style={{ width: `${c.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- FAQ + glossary ---------------- */

export function TeamFaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="gm-team-faq">
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

export function TeamGlossary({
  items,
}: {
  items: { term: string; def: string }[];
}) {
  return (
    <div className="gm-team-glossary">
      {items.map((g) => (
        <div key={g.term} className="gm-team-glossary-card">
          <strong className="font-display">{g.term}</strong>
          <small className="text-muted">{g.def}</small>
        </div>
      ))}
    </div>
  );
}

export function RatingStars({ value }: { value: number }) {
  return <Stars rating={value} size={13} />;
}
