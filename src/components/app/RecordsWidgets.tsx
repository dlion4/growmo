/* ============================================================================
   PAGE 12 WIDGETS — records, traceability & compliance building blocks.
   Presentation only: every widget is styled with master-theme classes plus
   the additive .gm-rec-* layer in records.css (documented in
   docs/MASTER_THEME.md §15). No colour, font or radius is invented here.
   ========================================================================== */
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  FileText,
  Leaf,
  MapPin,
  QrCode,
  ScanLine,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import type {
  Certification,
  ComplianceGap,
  DiaryEntry,
  HarvestBatch,
  SprayRecord,
  SoilSample,
} from "../../data/app/records";
import { diaryTone, soilLevel, sprayPhiState } from "../../data/app/records";
import { StatusChip } from "./DashboardWidgets";

/* ------------------------------------------------------------ hero strip */

export interface RecordKpi {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}

export function RecordsHero({
  kpis,
  score,
  actions,
  alerts,
}: {
  kpis: RecordKpi[];
  score: number;
  actions: ReactNode;
  alerts: { label: string; tone: "low" | "medium" | "high" }[];
}) {
  const tone = score >= 80 ? "low" : score >= 60 ? "medium" : "high";
  return (
    <section className="gm-rec-hero">
      <div className="gm-rec-hero-head">
        <div>
          <span className="gm-eyebrow on-dark">
            <span className="dot" />
            12 · Records · Traceability · Compliance
          </span>
          <h1 className="gm-h-section mb-2">
            Every spray, shilling and crate written down
          </h1>
          <p className="gm-lead on-dark mb-0">
            Mary&apos;s Farm, Githunguri (Kiambu) — a compliance-grade record
            book that a buyer, an auditor or the county officer can follow from
            the seed bag to the market crate.
          </p>
        </div>
        <div className="gm-rec-ring">
          <span className="gm-rec-ring-num font-display">{score}</span>
          <small>compliance score</small>
          <StatusChip
            label={
              tone === "low"
                ? "Audit ready"
                : tone === "medium"
                  ? "Gaps to close"
                  : "Action needed"
            }
            tone={tone}
          />
        </div>
      </div>

      <div className="gm-rec-kpi-grid">
        {kpis.map((kpi) => (
          <div className="gm-rec-kpi" key={kpi.label}>
            <span className="gm-mega-icon">
              <kpi.icon />
            </span>
            <strong className="font-display">{kpi.value}</strong>
            <span>{kpi.label}</span>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      <div className="gm-rec-alert-row">
        {alerts.map((alert) => (
          <StatusChip key={alert.label} label={alert.label} tone={alert.tone} />
        ))}
      </div>

      <div className="gm-rec-hero-actions">{actions}</div>
    </section>
  );
}

/* --------------------------------------------------------- PHI + PPE meter */

export function PhiMeter({
  record,
  showDetail = true,
}: {
  record: SprayRecord;
  showDetail?: boolean;
}) {
  const state = sprayPhiState(record);
  const total = Math.max(record.phiDays, 1);
  const today = Date.parse("2026-09-20");
  const elapsed = record.status === "Complete"
    ? Math.min(total, Math.max(0, Math.round((today - Date.parse(record.iso)) / 86400000)))
    : 0;
  const pct = record.status === "Complete" ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  return (
    <div className="gm-rec-phi">
      <div className="gm-rec-phi-head">
        <span>
          <strong>{record.product}</strong>
          <small>
            {record.phiDays === 0
              ? "Zero pre-harvest interval (bio-pesticide)"
              : `${record.phiDays}-day PHI · re-entry ${record.reiHours} h`}
          </small>
        </span>
        <StatusChip label={state.label} tone={state.tone} />
      </div>
      <div
        className="gm-rec-phi-track"
        role="progressbar"
        aria-label={`PHI progress for ${record.code}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      {showDetail ? <small className="gm-rec-phi-note">{state.detail}</small> : null}
    </div>
  );
}

/* ------------------------------------------------------------- diary card */

export function DiaryEntryCard({
  entry,
  onOpen,
  onPhoto,
}: {
  entry: DiaryEntry;
  onOpen: () => void;
  onPhoto: (photo: string) => void;
}) {
  return (
    <article className="gm-rec-diary">
      <div className="gm-rec-diary-top">
        <span className="gm-rec-diary-date font-display">{entry.date}</span>
        <StatusChip label={entry.type} tone={diaryTone(entry)} />
      </div>
      <p className="gm-rec-diary-body">{entry.content}</p>
      <div className="gm-rec-diary-meta">
        <span>
          <Leaf /> {entry.crop} · {entry.variety}
        </span>
        <span>
          <MapPin /> {entry.location}
        </span>
        {entry.linked ? <span className="gm-code-chip">{entry.linked}</span> : null}
      </div>
      <div className="gm-rec-diary-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          <FileText /> Open record
        </button>
        {entry.photos.length > 0 ? (
          <div className="gm-rec-photos">
            {entry.photos.map((photo) => (
              <button
                type="button"
                key={photo}
                className="gm-rec-photo"
                aria-label={`View photo ${photo}`}
                onClick={() => onPhoto(photo)}
              >
                <Camera />
              </button>
            ))}
          </div>
        ) : (
          <small className="text-muted">No photo attached</small>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ batch cards */

export function QrTile({
  seed,
  label,
  size = 148,
}: {
  seed: number;
  label: string;
  size?: number;
}) {
  const cells = useMemo(() => {
    const n = 21;
    let s = seed * 7919 + 13;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const grid: boolean[] = [];
    for (let i = 0; i < n * n; i++) grid.push(rand() > 0.52);
    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[(r0 + r) * n + (c0 + c)] = edge || core;
        }
    };
    finder(0, 0);
    finder(0, n - 7);
    finder(n - 7, 0);
    return { grid, n };
  }, [seed]);

  const cell = size / cells.n;
  return (
    <div className="gm-rec-qr" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        {cells.grid.map((on, i) =>
          on ? (
            <rect
              key={i}
              x={(i % cells.n) * cell}
              y={Math.floor(i / cells.n) * cell}
              width={cell}
              height={cell}
              fill="var(--gm-forest-900)"
            />
          ) : null,
        )}
      </svg>
    </div>
  );
}

export function BatchSummaryCard({
  batch,
  onTrace,
  onShare,
}: {
  batch: HarvestBatch;
  onTrace: () => void;
  onShare: () => void;
}) {
  const total = batch.gradeA + batch.gradeB + batch.gradeC;
  return (
    <article className="gm-rec-batch">
      <div className="gm-rec-batch-head">
        <div>
          <span className="gm-eyebrow">{batch.batchId}</span>
          <strong className="font-display">
            {batch.crop} — {batch.variety}
          </strong>
          <small>
            {batch.plot} · {batch.area} · harvested {batch.harvested}
          </small>
        </div>
        <StatusChip
          label={batch.status}
          tone={
            batch.status === "Sold" || batch.status === "Delivered"
              ? "low"
              : batch.status === "Planned" || batch.status === "Stored"
                ? "medium"
                : "neutral"
          }
        />
      </div>
      <div className="gm-rec-batch-grid">
        <div>
          <small>Quantity</small>
          <strong className="font-display">{batch.quantity}</strong>
        </div>
        <div>
          <small>Grade split</small>
          <strong className="font-display">
            A {batch.gradeA.toLocaleString("en-KE")} · B{" "}
            {batch.gradeB.toLocaleString("en-KE")} · C{" "}
            {batch.gradeC.toLocaleString("en-KE")}
          </strong>
          <span className="gm-rec-mini-track" aria-hidden="true">
            <i style={{ width: `${total ? (batch.gradeA / total) * 100 : 0}%` }} />
          </span>
        </div>
        <div>
          <small>QR scans</small>
          <strong className="font-display">
            <ScanLine /> {batch.qrScans}
          </strong>
        </div>
      </div>
      <div className="gm-rec-batch-foot">
        <span>
          <BadgeCheck /> {batch.destination}
        </span>
        <div className="d-flex gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onTrace}>
            <QrCode /> Trace batch
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onShare}>
            Share passport
          </button>
        </div>
      </div>
    </article>
  );
}

export function TraceTimeline({ batch }: { batch: HarvestBatch }) {
  return (
    <ol className="gm-timeline">
      {batch.steps.map((step) => (
        <li
          key={step.label}
          className={`gm-tl-item ${step.done ? "is-done" : "is-current"}`}
        >
          <span className="gm-tl-dot" />
          <div>
            <strong>{step.label}</strong>
            <small className="d-block">{step.note}</small>
            <span className="gm-tl-at">{step.at}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------- certification */

export function CertProgressCard({
  cert,
  onOpen,
  onChecklist,
}: {
  cert: Certification;
  onOpen: () => void;
  onChecklist: () => void;
}) {
  const done = cert.checklist.filter((item) => item.done).length;
  return (
    <article className="gm-rec-cert">
      <div className="gm-rec-cert-head">
        <span className="gm-mega-icon">
          <ShieldCheck />
        </span>
        <div>
          <strong>{cert.short}</strong>
          <small>{cert.body}</small>
        </div>
        <StatusChip
          label={cert.status}
          tone={
            cert.status === "Certified" || cert.status === "Active"
              ? "low"
              : cert.status === "In progress"
                ? "medium"
                : cert.status === "Expired"
                  ? "high"
                  : "neutral"
          }
        />
      </div>
      <p className="gm-rec-cert-req">{cert.requirements}</p>
      <div className="gm-rec-cert-progress">
        <div
          className="gm-rec-phi-track"
          role="progressbar"
          aria-label={`${cert.short} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={cert.progress}
        >
          <i style={{ width: `${cert.progress}%` }} />
        </div>
        <span className="font-display">{cert.progress}%</span>
      </div>
      <div className="gm-rec-cert-meta">
        <span>
          <strong>{cert.checklist.length}</strong> requirements
          {cert.checklist.length ? ` · ${done} closed` : ""}
        </span>
        <span>
          Due <strong>{cert.dueDate}</strong>
        </span>
      </div>
      <div className="gm-rec-cert-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Certification details
        </button>
        {cert.checklist.length > 0 ? (
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onChecklist}>
            Checklist ({done}/{cert.checklist.length})
          </button>
        ) : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- soil bits */

export function SoilTrendChart({
  samples,
  metric,
}: {
  samples: SoilSample[];
  metric: "ph" | "organicMatter";
}) {
  const rows = [...samples].sort((a, b) => a.iso.localeCompare(b.iso));
  const values = rows.map((row) => (metric === "ph" ? row.ph : row.organicMatter));
  const max = metric === "ph" ? 7 : Math.max(...values) + 1;
  const min = metric === "ph" ? 4.5 : 0;
  return (
    <div className="gm-rec-soil-chart">
      {rows.map((row) => {
        const value = metric === "ph" ? row.ph : row.organicMatter;
        const height = Math.max(8, ((value - min) / (max - min)) * 100);
        return (
          <div className="gm-rec-soil-bar" key={row.id}>
            <span className="gm-rec-soil-value font-display">
              {metric === "ph" ? value.toFixed(1) : `${value.toFixed(1)}%`}
            </span>
            <span className="gm-rec-soil-col">
              <i style={{ height: `${height}%` }} />
            </span>
            <span className="gm-rec-soil-label">{row.date.split(" ").slice(1).join(" ")}</span>
            <span className="gm-rec-soil-plot">{row.plot}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SoilSampleRow({
  sample,
  onOpen,
}: {
  sample: SoilSample;
  onOpen: () => void;
}) {
  return (
    <div className="gm-check-row gm-rec-soil-row">
      <span className="gm-rec-soil-date font-display">{sample.date}</span>
      <span style={{ flex: 1 }}>
        <strong>
          {sample.plot} · {sample.crop}
        </strong>
        <small>
          {sample.lab} · ref {sample.labRef}
        </small>
      </span>
      <span className="gm-rec-soil-pills">
        <StatusChip label={`pH ${sample.ph.toFixed(1)}`} tone={soilLevel(sample.ph, "ph") === "Optimal" ? "low" : "medium"} />
        <StatusChip label={`N ${sample.nitrogen}`} tone={soilLevel(sample.nitrogen, "n") === "Low" ? "high" : "low"} />
        <StatusChip label={`OM ${sample.organicMatter}%`} tone={soilLevel(sample.organicMatter, "om") === "Low" ? "medium" : "low"} />
      </span>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
        Report
      </button>
    </div>
  );
}

/* --------------------------------------------------------- charts + rows */

export function RecordsMonthChart({
  rows,
  onBar,
}: {
  rows: { month: string; diary: number; sprays: number; purchases: number; batches: number }[];
  onBar: (month: string) => void;
}) {
  const max = Math.max(...rows.map((row) => row.diary));
  return (
    <div className="gm-rec-bars">
      {rows.map((row) => (
        <button
          type="button"
          className="gm-rec-bar"
          key={row.month}
          onClick={() => onBar(row.month)}
          aria-label={`${row.month}: ${row.diary} diary entries, ${row.sprays} sprays, ${row.purchases} purchases`}
        >
          <span className="gm-rec-bar-col">
            <i style={{ height: `${(row.diary / max) * 100}%` }} />
          </span>
          <span className="gm-rec-bar-label">{row.month.split(" ")[0]}</span>
          <span className="gm-rec-bar-value font-display">{row.diary}</span>
        </button>
      ))}
    </div>
  );
}

export function EvidenceDocRow({
  doc,
  onOpen,
}: {
  doc: {
    id: string;
    name: string;
    kind: string;
    size: string;
    generated: string;
    sections: string;
    scans: number;
    verified: boolean;
  };
  onOpen: () => void;
}) {
  return (
    <div className="gm-check-row gm-rec-evidence">
      <span className="gm-mega-icon">
        {doc.verified ? <CheckCircle2 /> : <TriangleAlert />}
      </span>
      <span style={{ flex: 1 }}>
        <strong>{doc.name}</strong>
        <small>
          {doc.kind} · {doc.size} · section {doc.sections} · generated{" "}
          {doc.generated}
        </small>
      </span>
      <StatusChip
        label={doc.verified ? "Verified" : "Awaiting review"}
        tone={doc.verified ? "low" : "medium"}
      />
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
        Open pack
      </button>
    </div>
  );
}

export function ComplianceGapRow({
  gap,
  onFix,
}: {
  gap: ComplianceGap;
  onFix: () => void;
}) {
  return (
    <div className="gm-rec-gap">
      <div className="gm-rec-gap-head">
        <StatusChip
          label={gap.severity === "high" ? "Blocking" : gap.severity === "medium" ? "Fix soon" : "Housekeeping"}
          tone={gap.severity}
        />
        <span className="gm-eyebrow mb-0">{gap.section}</span>
      </div>
      <strong>{gap.title}</strong>
      <p>{gap.detail}</p>
      <div className="gm-rec-gap-foot">
        <small>
          {gap.owner} · due {gap.due}
        </small>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onFix}>
          {gap.action}
        </button>
      </div>
    </div>
  );
}

export function RecordKvList({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="gm-rec-kv">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
