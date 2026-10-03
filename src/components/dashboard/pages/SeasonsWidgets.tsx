/* ============================================================================
   PAGE 23 WIDGETS — multi-season farm planning and soil-first rotations.
   ----------------------------------------------------------------------------
   Styling: master theme + dashboard.css + seasons.css (the additive
   `.gm-seasons-page` layer). Tokens only — no bespoke colours or fonts.
   ========================================================================== */
import { CalendarRange, type LucideIcon, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { CalendarPlot } from "../../../data/app/seasons";
import { StatusChip } from "./DashboardWidgets";

export function SeasonsHero({
  metrics,
  actions,
}: {
  metrics: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-page-head gm-sea-hero">
      <div className="gm-page-head-top">
        <div className="gm-page-head-copy">
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 23 · plan ahead, protect the soil
          </span>
          <h1 className="font-display">
            Every season has a job in your farm&apos;s long game
          </h1>
          <p className="gm-lead on-dark mb-0">
            Put crops, soil recovery and market windows on one shared calendar.
            Rotate with purpose, not guesswork. Twalima leo, tunajenga kesho.
          </p>
        </div>
        <div className="gm-page-head-actions">{actions}</div>
      </div>

      <div className="gm-page-kpis">
        {metrics.map((metric) => (
          <div className="gm-page-kpi" key={metric.label}>
            <span className="gm-page-kpi-icon" aria-hidden="true">
              <metric.icon />
            </span>
            <span className="gm-page-kpi-body">
              <small className="gm-page-kpi-label">{metric.label}</small>
              <strong className="gm-page-kpi-value font-display">
                {metric.value}
              </strong>
              <small className="gm-page-kpi-note">{metric.note}</small>
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
      className="gm-check-row gm-sea-plot-row text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Sprout />
      </span>
      <span className="gm-sea-plot-copy">
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
    <div className="gm-card gm-sea-benefit h-100">
      <span className="gm-eyebrow">Rotation result</span>
      <strong className="gm-sea-benefit-value font-display d-block">
        {value}
      </strong>
      <strong className="gm-sea-benefit-title d-block">{title}</strong>
      <small className="gm-sea-benefit-note d-block">{note}</small>
    </div>
  );
}

export function PlanLegend() {
  return (
    <div className="gm-sea-legend">
      <StatusChip label="Crop / harvest" tone="low" />
      <StatusChip label="Cover crop / action" tone="medium" />
      <StatusChip label="Rest / preparation" tone="neutral" />
      <span className="gm-sea-legend-hint">
        <CalendarRange /> Tap a plot to open its full sequence
      </span>
    </div>
  );
}
