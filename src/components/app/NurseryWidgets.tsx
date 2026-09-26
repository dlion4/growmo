/* ============================================================================
   PAGE 25 WIDGETS — seed stock and nursery status summaries.
   ========================================================================== */
import { type LucideIcon, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { NurseryRecord, SeedStock } from "../../data/app/nursery";
import { nurseryTone, stockTone } from "../../data/app/nursery";
import { StatusChip } from "./DashboardWidgets";

export function NurseryHero({
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
            <span className="dot" /> Page 25 · seeds to strong starts
          </span>
          <h1 className="font-display mt-2">
            Start each crop with seed you can trust
          </h1>
          <p className="gm-lead on-dark mb-0">
            Trace each lot, care for every seedling and transplant with
            confidence. Mbegu bora, mavuno bora.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {metrics.map((metric) => (
          <div
            className="gm-plan-facts"
            key={metric.label}
            style={{ minWidth: 154 }}
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
      className="gm-check-row text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Sprout />
      </span>
      <span style={{ flex: 1 }}>
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
  return (
    <button
      type="button"
      className="gm-card h-100 text-start w-100"
      onClick={onOpen}
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <span className="gm-mega-icon">
          <Sprout />
        </span>
        <StatusChip label={nursery.status} tone={nurseryTone(nursery.status)} />
      </div>
      <span className="gm-eyebrow d-block mt-2">{nursery.id}</span>
      <strong className="d-block">
        {nursery.crop} · {nursery.variety}
      </strong>
      <small className="text-muted d-block mt-1">
        {nursery.ready.toLocaleString()} / {nursery.target.toLocaleString()}{" "}
        seedlings
      </small>
      <div className="d-flex justify-content-between gap-2 mt-3 small">
        <span>{nursery.type}</span>
        <span>{nursery.transplantDate}</span>
      </div>
    </button>
  );
}
