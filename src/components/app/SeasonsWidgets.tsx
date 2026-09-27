/* ============================================================================
   PAGE 23 WIDGETS — multi-season farm planning and soil-first rotations.
   ========================================================================== */
import { CalendarRange, type LucideIcon, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { CalendarPlot } from "../../data/app/seasons";
import { StatusChip } from "./DashboardWidgets";

export function SeasonsHero({
  metrics,
  actions,
}: {
  metrics: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 440px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 23 · plan ahead, protect the soil
          </span>
          <h1 className="font-display mt-2">
            Every season has a job in your farm&apos;s long game
          </h1>
          <p className="gm-lead on-dark mb-0">
            Put crops, soil recovery and market windows on one shared calendar.
            Rotate with purpose, not guesswork. Twalima leo, tunajenga kesho.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {metrics.map((metric) => (
          <div
            className="gm-plan-facts"
            key={metric.label}
            style={{ minWidth: 158 }}
          >
            <span>
              <metric.icon />
              <small>{metric.label}</small>
              <strong className="font-display" style={{ fontSize: "1.12rem" }}>
                {metric.value}
              </strong>
              <small>{metric.note}</small>
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

export function CalendarPlotSummary({
  plot,
  onOpen,
}: {
  plot: CalendarPlot;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-check-row text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Sprout />
      </span>
      <span style={{ flex: 1 }}>
        <strong>{plot.plot}</strong>
        <small>
          {plot.acreage} acres · {plot.currentCrop}
        </small>
      </span>
      <StatusChip
        label={plot.status}
        tone={plot.status === "Active" ? "low" : "medium"}
      />
    </button>
  );
}

export function RotationBenefitCard({
  value,
  title,
  note,
}: {
  value: string;
  title: string;
  note: string;
}) {
  return (
    <div className="gm-card h-100">
      <span className="gm-eyebrow">Rotation result</span>
      <strong className="font-display d-block mt-1">{value}</strong>
      <strong className="d-block mt-2">{title}</strong>
      <small className="text-muted d-block mt-1">{note}</small>
    </div>
  );
}

export function PlanLegend() {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center">
      <StatusChip label="Crop / harvest" tone="low" />
      <StatusChip label="Cover crop / action" tone="medium" />
      <StatusChip label="Rest / preparation" tone="neutral" />
      <span className="text-muted small d-flex align-items-center gap-1">
        <CalendarRange /> Tap a plot to open its full sequence
      </span>
    </div>
  );
}
