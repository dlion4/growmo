/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING WIDGETS
   Reusable widget components for the analytics page.
   ========================================================================== */
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { StatusChip } from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";

/* ── Simple bar chart ────────────────────────────────────────────────────── */
export function AnalyticsBarChart({
  rows,
  unitLabel,
}: {
  rows: { id: string; label: string; sub?: string; value: number; highlight?: boolean }[];
  unitLabel?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="gm-bar-chart">
      {unitLabel ? (
        <p className="text-muted mb-2" style={{ fontSize: ".8rem" }}>
          {unitLabel}
        </p>
      ) : null}
      {rows.map((row) => (
        <div key={row.id} className="gm-bar-row">
          <span className="gm-bar-label">
            <strong>{row.label}</strong>
            {row.sub ? <small>{row.sub}</small> : null}
          </span>
          <div className="gm-bar-track">
            <span
              className={`gm-bar-fill ${row.highlight ? "is-highlight" : ""}`}
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
            />
          </div>
          <span className="gm-bar-value font-display">{kes(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Horizontal stacked bar (revenue by crop) ────────────────────────────── */
export function StackedRevenueBar({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div className="gm-stacked-bar-wrap">
      <div className="gm-stacked-bar">
        {segments.map((seg) => (
          <span
            key={seg.label}
            className="gm-stacked-segment"
            style={{
              width: `${(seg.value / Math.max(total, 1)) * 100}%`,
              background: seg.color,
            }}
            title={`${seg.label}: ${kes(seg.value)}`}
          />
        ))}
      </div>
      <div className="d-flex flex-wrap gap-3 mt-2">
        {segments.map((seg) => (
          <span key={seg.label} className="d-flex align-items-center gap-1">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: seg.color,
                display: "inline-block",
              }}
            />
            <small>
              {seg.label}: {kes(seg.value)} (
              {Math.round((seg.value / Math.max(total, 1)) * 100)}%)
            </small>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Rainfall comparison bar ─────────────────────────────────────────────── */
export function RainfallBar({
  actual,
  normal,
  label,
}: {
  actual: number;
  normal: number;
  label: string;
}) {
  const max = Math.max(actual, normal, 1);
  return (
    <div className="gm-bar-row">
      <span className="gm-bar-label">
        <strong>{label}</strong>
      </span>
      <div className="gm-bar-track">
        <span
          className="gm-bar-fill"
          style={{
            width: `${(actual / max) * 100}%`,
            background: "var(--gm-sky-500, #3b82f6)",
          }}
        />
        <span
          className="gm-bar-fill"
          style={{
            width: `${(normal / max) * 100}%`,
            background: "var(--gm-line)",
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            opacity: 0.3,
          }}
        />
      </div>
      <span className="gm-bar-value font-display">
        {actual} / {normal} mm
      </span>
    </div>
  );
}

/* ── KPI trend arrow ─────────────────────────────────────────────────────── */
export function TrendArrow({
  value,
  suffix = "",
}: {
  value: string;
  suffix?: string;
}) {
  const isPositive =
    value.startsWith("+") || (!value.startsWith("-") && value !== "—" && value !== "0%");
  const isNegative = value.startsWith("-") && value !== "—" && value !== "0%";
  return (
    <span
      className={`d-inline-flex align-items-center gap-1 ${isPositive ? "text-success" : isNegative ? "text-danger" : "text-muted"}`}
      style={{ fontWeight: 600, fontSize: ".85rem" }}
    >
      {isPositive ? (
        <TrendingUp width={14} height={14} />
      ) : isNegative ? (
        <TrendingDown width={14} height={14} />
      ) : null}
      {value}
      {suffix}
    </span>
  );
}

/* ── Report card ─────────────────────────────────────────────────────────── */
export function ReportCard({
  name,
  description,
  useCase,
  pages,
  lastGenerated,
  onPreview,
  onDownload,
}: {
  name: string;
  description: string;
  useCase: string;
  pages: number;
  lastGenerated: string;
  onPreview: () => void;
  onDownload: () => void;
}) {
  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <h4 className="font-display mb-1">{name}</h4>
          <p className="text-muted mb-1" style={{ fontSize: ".85rem" }}>
            {description}
          </p>
        </div>
        <StatusChip label={`${pages}p`} tone="neutral" />
      </div>
      <span className="gm-eyebrow mt-2">{useCase}</span>
      <small className="text-muted mb-2">Last: {lastGenerated}</small>
      <div className="d-flex gap-2 mt-auto">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onPreview}
        >
          <BarChart3 className="me-1" /> Preview
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onDownload}
        >
          <ArrowRight className="me-1" /> Download
        </button>
      </div>
    </article>
  );
}