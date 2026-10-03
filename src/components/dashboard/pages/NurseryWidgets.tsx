/* ============================================================================
   PAGE 25 WIDGETS — seed stock and nursery status summaries.
   ----------------------------------------------------------------------------
   Styling: master theme + dashboard.css + nursery.css (the additive
   `.gm-nursery-page` layer). Nothing here invents a colour, font or radius —
   every value comes from a --gm-* token.
   ========================================================================== */
import { type LucideIcon, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { NurseryRecord, SeedStock } from "../../../data/app/nursery";
import { nurseryTone, stockTone } from "../../../data/app/nursery";
import { StatusChip } from "./DashboardWidgets";

export function NurseryHero({
  metrics,
  actions,
}: {
  metrics: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-page-head gm-nur-hero">
      <div className="gm-page-head-top">
        <div className="gm-page-head-copy">
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 25 · seeds to strong starts
          </span>
          <h1 className="font-display">
            Start each crop with seed you can trust
          </h1>
          <p className="gm-lead on-dark mb-0">
            Trace each lot, care for every seedling and transplant with
            confidence. Mbegu bora, mavuno bora.
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

export function SeedStockSummary({
  seed,
  onOpen,
}: {
  seed: SeedStock;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-check-row gm-nur-seed-row text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Sprout />
      </span>
      <span className="gm-nur-seed-copy">
        <strong>
          {seed.seed} · {seed.variety}
        </strong>
        <small>
          {seed.quantity} · lot {seed.lot} · expires {seed.expiry}
        </small>
      </span>
      <StatusChip label={seed.status} tone={stockTone(seed.status)} />
    </button>
  );
}

export function NurseryRecordCard({
  nursery,
  onOpen,
}: {
  nursery: NurseryRecord;
  onOpen: () => void;
}) {
  const progress = Math.min(
    100,
    Math.round((nursery.ready / Math.max(1, nursery.target)) * 100),
  );
  return (
    <button
      type="button"
      className="gm-card gm-nur-record h-100 text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-nur-record-top">
        <span className="gm-mega-icon">
          <Sprout />
        </span>
        <StatusChip label={nursery.status} tone={nurseryTone(nursery.status)} />
      </span>

      <span className="gm-eyebrow d-block">{nursery.id}</span>
      <strong className="gm-nur-record-title d-block">
        {nursery.crop} · {nursery.variety}
      </strong>

      <span className="gm-nur-record-count">
        <strong className="font-display">
          {nursery.ready.toLocaleString()}
        </strong>
        <small>/ {nursery.target.toLocaleString()} seedlings</small>
      </span>

      <span
        className="gm-progress gm-nur-record-bar"
        role="progressbar"
        aria-label={`${progress}% of target raised`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <i style={{ width: `${progress}%` }} />
      </span>

      <span className="gm-nur-record-foot">
        <span>{nursery.type}</span>
        <span>{nursery.transplantDate}</span>
      </span>
    </button>
  );
}
