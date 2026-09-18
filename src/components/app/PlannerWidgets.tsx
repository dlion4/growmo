import {
  ArrowRight,
  CalendarDays,
  Coins,
  Droplets,
  Gauge,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  CropCatalogItem,
  Difficulty,
  WaterNeed,
} from "../../data/app/planner";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

export function PlannerSubtabs<T extends string>({
  value,
  items,
  onChange,
  label,
}: {
  value: T;
  items: { id: T; label: string; icon?: ReactNode; count?: number }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="gm-tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={`gm-tab ${value === item.id ? "on" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
          {typeof item.count === "number" ? (
            <span className="gm-n">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function difficultyTone(difficulty: Difficulty) {
  return difficulty === "Easy"
    ? "low"
    : difficulty === "Moderate"
      ? "medium"
      : "high";
}

function waterTone(water: WaterNeed) {
  return water === "Low" ? "low" : water === "Moderate" ? "medium" : "high";
}

export function CropPlannerCard({
  crop,
  selected,
  onOpen,
  onCompare,
}: {
  crop: CropCatalogItem;
  selected: boolean;
  onOpen: () => void;
  onCompare: () => void;
}) {
  return (
    <article className="gm-card gm-plan-card p-3 h-100">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-plan-crop-art" aria-hidden="true">
          {crop.symbol}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="gm-eyebrow">{crop.swahili}</span>
          <h3 className="font-display mb-1">{crop.name}</h3>
          <div className="d-flex flex-wrap gap-1">
            <StatusChip
              label={crop.difficulty}
              tone={difficultyTone(crop.difficulty)}
            />
            <StatusChip
              label={`${crop.water} water`}
              tone={waterTone(crop.water)}
            />
          </div>
        </div>
      </div>

      <div className="gm-plan-facts mt-3">
        <span>
          <CalendarDays />
          <small>Maturity</small>
          <strong>{crop.maturity}</strong>
        </span>
        <span>
          <MapPin />
          <small>Zones</small>
          <strong>{crop.zones.join(", ")}</strong>
        </span>
        <span>
          <Gauge />
          <small>Yield</small>
          <strong>{crop.yield}</strong>
        </span>
        <span>
          <Coins />
          <small>Cost / acre</small>
          <strong className="font-display">
            {kes(crop.costMin)}–{kes(crop.costMax).replace("KES ", "")}
          </strong>
        </span>
      </div>

      <div className="gm-check-row mt-3">
        <TrendingUp />
        <span style={{ flex: 1 }}>
          <small>Projected revenue / acre</small>
          <strong className="font-display">
            {kes(crop.revenueMin)}–{kes(crop.revenueMax).replace("KES ", "")}
          </strong>
        </span>
      </div>

      <div className="d-flex align-items-center justify-content-between gap-2 mt-3">
        <span className="gm-chip">
          <Star /> {crop.popularity}% Kiambu popularity
        </span>
        <Droplets aria-label={`${crop.water} water need`} />
      </div>
      <p className="gm-plan-card-note mt-2 mb-3">{crop.countyNote}</p>

      <div className="d-flex flex-wrap gap-2 mt-auto">
        <button
          type="button"
          className={`gm-btn ${selected ? "gm-btn-dark" : "gm-btn-outline"} gm-btn-sm`}
          onClick={onCompare}
          aria-pressed={selected}
        >
          {selected ? "Selected" : "Compare"}
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onOpen}
        >
          View crop <ArrowRight />
        </button>
      </div>
    </article>
  );
}

export function PlannerFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="gm-card p-3">
      <span className="gm-eyebrow">{label}</span>
      <strong className="font-display gm-plan-fact-value">{value}</strong>
      {note ? <small className="d-block text-muted">{note}</small> : null}
    </div>
  );
}
