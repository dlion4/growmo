import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CircleDot,
  CloudRain,
  Coins,
  Droplets,
  Gauge,
  type LucideIcon,
  MapPin,
  Settings2,
  Sprout,
  Timer,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  ActiveCropRecord,
  CropForecastMonth,
  CropWidgetDefinition,
  GrowthStage,
} from "../../data/app/crops";
import { kes } from "../../data/site";
import { DashboardMetric, ProgressLine, StatusChip } from "./DashboardWidgets";

export function CropHeaderCard({
  crop,
  forecast,
  actions,
}: {
  crop: ActiveCropRecord;
  forecast: CropForecastMonth[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 390px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 4 · Living crop dashboard
          </span>
          <div className="d-flex flex-wrap align-items-center gap-3 mt-2">
            <span className="gm-mega-icon">
              <Sprout />
            </span>
            <div>
              <h1
                className="font-display mb-1"
                style={{ color: "var(--gm-card)" }}
              >
                {crop.crop} — {crop.variety}
              </h1>
              <p className="gm-lead on-dark mb-0">
                {crop.plot} · {crop.acres} acre
              </p>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <StatusChip
              label={`${crop.healthScore}/100 · ${crop.healthLabel}`}
              tone={crop.healthTone}
            />
            <span className="gm-chip gm-chip-ghost">
              <MapPin /> {crop.zone}
            </span>
            <span className="gm-chip gm-chip-ghost">
              <Droplets /> {crop.water}
            </span>
          </div>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>

      <div className="gm-plan-kpi-row mt-4">
        <CropHeaderFact
          icon={CalendarDays}
          label="Planted"
          value={crop.plantingDate}
          note={`${crop.daysElapsed} days elapsed`}
        />
        <CropHeaderFact
          icon={Timer}
          label="Expected harvest"
          value={crop.harvestDate}
          note={`${crop.daysRemaining} days remaining · ${crop.totalDays}-day crop`}
        />
        <CropHeaderFact
          icon={Activity}
          label="Current stage"
          value={crop.currentStage}
          note={`Day ${crop.stageDay} of ${crop.stageDuration}`}
        />
        <CropHeaderFact
          icon={Coins}
          label="Crop spend"
          value={kes(crop.spent)}
          note={`${kes(crop.budget - crop.spent)} remaining`}
        />
      </div>

      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <span className="gm-eyebrow">Three-month crop forecast</span>
          <span className="gm-chip">
            <CloudRain /> Kiambu · crop-specific
          </span>
        </div>
        <div className="gm-plan-summary-grid">
          {forecast.map((month) => (
            <div key={month.id} className="gm-check-row">
              <CloudRain />
              <span style={{ flex: 1 }}>
                <strong>{month.month}</strong>
                <small>
                  {month.rainfall} · {month.temperature}
                </small>
              </span>
              <StatusChip label={month.outlook} tone={month.tone} />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function CropHeaderFact({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="gm-card p-3">
      <Icon />
      <small className="d-block mt-2">{label}</small>
      <strong className="font-display d-block">{value}</strong>
      <small className="text-muted">{note}</small>
    </div>
  );
}

export function CropGrowthTimeline({
  stages,
  onOpen,
}: {
  stages: GrowthStage[];
  onOpen: (stage: GrowthStage) => void;
}) {
  return (
    <div className="gm-timeline">
      {stages.map((stage) => (
        <button
          key={stage.id}
          type="button"
          className={`gm-tl-item ${stage.state === "done" ? "is-done" : stage.state === "current" ? "is-current" : ""}`}
          onClick={() => onOpen(stage)}
        >
          <span className="gm-mega-icon">
            {stage.state === "done" ? (
              <Check />
            ) : stage.state === "current" ? (
              <Activity />
            ) : (
              <CircleDot />
            )}
          </span>
          <span style={{ flex: 1 }}>
            <strong>{stage.name}</strong>
            <small>
              {stage.dates} · {stage.duration}
            </small>
            <ProgressLine
              value={stage.progress}
              label={`${stage.name} progress`}
            />
          </span>
          <StatusChip
            label={
              stage.state === "done"
                ? "Complete"
                : stage.state === "current"
                  ? "Current"
                  : "Upcoming"
            }
            tone={
              stage.state === "current"
                ? "medium"
                : stage.state === "done"
                  ? "low"
                  : "neutral"
            }
          />
          <ArrowRight />
        </button>
      ))}
    </div>
  );
}

export function CropWidgetCard({
  widget,
  icon: Icon,
  enabled,
  onOpen,
  onConfigure,
}: {
  widget: CropWidgetDefinition;
  icon: LucideIcon;
  enabled: boolean;
  onOpen: () => void;
  onConfigure: () => void;
}) {
  return (
    <article className="gm-card p-3 h-100 d-flex flex-column">
      <div className="d-flex align-items-start gap-3">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span className="gm-eyebrow">{widget.category}</span>
          <h3 className="font-display mb-1">{widget.label}</h3>
          <p className="text-muted mb-0">{widget.description}</p>
        </div>
        <StatusChip
          label={
            widget.availability === "hidden"
              ? "Not applicable"
              : widget.availability === "sensor"
                ? "Manual mode"
                : enabled
                  ? "On"
                  : "Off"
          }
          tone={
            widget.availability === "hidden"
              ? "neutral"
              : enabled
                ? "low"
                : "medium"
          }
        />
      </div>
      <div className="gm-check-row mt-3">
        {widget.availability === "hidden" ? <AlertTriangle /> : <Gauge />}
        <span style={{ flex: 1 }}>
          <small>Current summary</small>
          <strong>{widget.summary}</strong>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-auto pt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onConfigure}
        >
          <Settings2 /> Configure
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          disabled={widget.availability === "hidden"}
          onClick={onOpen}
        >
          Open widget <ArrowRight />
        </button>
      </div>
    </article>
  );
}

export function CropPerformanceStrip({ crop }: { crop: ActiveCropRecord }) {
  const spendPercent = Math.round((crop.spent / crop.budget) * 100);
  return (
    <div className="gm-stat-grid">
      <DashboardMetric
        icon={Gauge}
        label="Overall health"
        value={`${crop.healthScore}/100`}
        note={crop.healthLabel}
      />
      <DashboardMetric
        icon={Activity}
        label="Season progress"
        value={`${crop.progress}%`}
        note={`${crop.daysRemaining} days remaining`}
      />
      <DashboardMetric
        icon={Coins}
        label="Budget used"
        value={`${spendPercent}%`}
        note={`${kes(crop.spent)} spent`}
      />
      <DashboardMetric
        icon={Sprout}
        label="Yield prediction"
        value={crop.predictedYield}
        note={`${kes(crop.predictedRevenue)} revenue`}
      />
    </div>
  );
}
