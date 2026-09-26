/* ============================================================================
   PAGE 20 WIDGETS — machinery registry, service and asset summaries.
   Built entirely with existing dashboard and planner theme classes.
   ========================================================================== */
import {
  CalendarClock,
  Gauge,
  type LucideIcon,
  MapPin,
  ShieldCheck,
  Tractor,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";
import type { EquipmentAsset, MaintenanceTask } from "../../data/app/machinery";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

export function MachineryHero({
  kpis,
  actions,
}: {
  kpis: { icon: LucideIcon; label: string; value: string; note: string }[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 420px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 20 · farm infrastructure
          </span>
          <h1 className="font-display mt-2">
            Every machine earns its place on the shamba
          </h1>
          <p className="gm-lead on-dark mb-0">
            Sajili vifaa, protect service dates, track every litre, and rent the
            right machine with a clean record for Mary&apos;s Farm in
            Githunguri.
          </p>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="gm-plan-facts"
            style={{ minWidth: 170 }}
          >
            <span>
              <kpi.icon />
              <small>{kpi.label}</small>
              <strong className="font-display" style={{ fontSize: "1.15rem" }}>
                {kpi.value}
              </strong>
              <small>{kpi.note}</small>
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

export function AssetCard({
  asset,
  tone,
  onOpen,
  onEdit,
  onService,
}: {
  asset: EquipmentAsset;
  tone: "low" | "medium" | "high";
  onOpen: () => void;
  onEdit: () => void;
  onService: () => void;
}) {
  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Tractor />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <span className="gm-eyebrow">{asset.category}</span>
            <StatusChip label={asset.status} tone={tone} />
          </div>
          <h3 className="font-display mb-1">{asset.name}</h3>
          <p className="text-muted mb-0" style={{ fontSize: "0.82rem" }}>
            {asset.id} · {asset.makeModel}
          </p>
        </div>
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <Gauge />
          <small>Condition</small>
          <strong>{asset.condition}</strong>
        </span>
        <span>
          <MapPin />
          <small>Stored at</small>
          <strong>{asset.storage}</strong>
        </span>
        <span>
          <CalendarClock />
          <small>Year / ownership</small>
          <strong>
            {asset.year} · {asset.ownership}
          </strong>
        </span>
        <span>
          <ShieldCheck />
          <small>Estimated value</small>
          <strong className="font-display">{kes(asset.currentValue)}</strong>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onOpen}
        >
          Open record
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onService}
        >
          <Wrench /> Service
        </button>
      </div>
    </article>
  );
}

export function ServiceTaskRow({
  task,
  tone,
  onOpen,
  onComplete,
}: {
  task: MaintenanceTask;
  tone: "low" | "medium" | "high" | "neutral";
  onOpen: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="gm-check-row">
      <span className="gm-mega-icon">
        <Wrench />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong>{task.service}</strong>
        <small>
          {task.equipment} · {task.nextDue} · {task.assignedTo}
        </small>
      </span>
      <span className="d-flex flex-wrap align-items-center justify-content-end gap-2">
        <StatusChip label={task.status} tone={tone} />
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onOpen}
        >
          Checklist
        </button>
        {task.status !== "Future" && task.status !== "After use" ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onComplete}
          >
            Log done
          </button>
        ) : null}
      </span>
    </div>
  );
}

export function MetricCallout({
  icon: Icon,
  label,
  value,
  note,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="gm-card p-3 h-100">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div style={{ flex: 1 }}>
          <small className="text-muted d-block">{label}</small>
          <strong
            className="font-display d-block"
            style={{ fontSize: "1.25rem" }}
          >
            {value}
          </strong>
          <small className="text-muted d-block mt-1">{note}</small>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
