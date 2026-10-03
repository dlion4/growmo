/* ============================================================================
   PAGE 24 WIDGETS — crop-specific harvest records and post-harvest quality.
   ========================================================================== */
import { type LucideIcon, PackageCheck, Scale, Warehouse } from "lucide-react";
import type { ReactNode } from "react";
import type { HarvestRecord, StorageFacility } from "../../../data/app/harvest";
import { StatusChip } from "./DashboardWidgets";

export function HarvestHero({
  metrics,
  actions,
}: {
  metrics: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-page-head gm-harvest-hero">
      <div className="gm-page-head-top">
        <div className="gm-page-head-copy">
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 24 · harvest with care
          </span>
          <h1 className="font-display">
            Every harvested crop deserves a clean path to the buyer
          </h1>
          <p className="gm-lead on-dark mb-0">
            Record the right unit, grade with confidence, protect quality in
            storage and turn less loss into more income. Vuna vizuri, uza
            vizuri.
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

export function HarvestRecordSummary({
  record,
  onOpen,
}: {
  record: HarvestRecord;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-check-row text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Scale />
      </span>
      <span style={{ flex: 1 }}>
        <strong>{record.crop}</strong>
        <small>
          {record.quantity} · {record.plot}
        </small>
      </span>
      <StatusChip
        label={record.status}
        tone={
          record.status === "Stored" || record.status === "Sold"
            ? "low"
            : "medium"
        }
      />
    </button>
  );
}

export function StorageFacilityCard({
  facility,
  onOpen,
}: {
  facility: StorageFacility;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-card h-100 text-start w-100"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Warehouse />
      </span>
      <span className="gm-eyebrow d-block mt-2">
        {facility.capacity} capacity
      </span>
      <strong className="d-block">{facility.name}</strong>
      <small className="text-muted d-block mt-1">{facility.type}</small>
      <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
        <StatusChip
          label={facility.status}
          tone={
            facility.status === "Available"
              ? "low"
              : facility.status === "Full"
                ? "medium"
                : "high"
          }
        />
        <PackageCheck />
      </div>
    </button>
  );
}
