import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
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
} from "../../../data/app/crops";
import { kes } from "../../../data/site";
import { DashboardMetric, StatusChip } from "./DashboardWidgets";

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
  const total = stages.length || 1;
  const current = stages.findIndex((stage) => stage.state === "current");
  return (
    <div className="gm-gtl">
      {/* summary rail header — overall season progress */}
      <div className="gm-gtl-meta">
        <span className="gm-gtl-meta-label">
          <Sprout width={14} height={14} />
          {stages.length} growth stages
        </span>
        <span className="gm-gtl-meta-dots" aria-hidden="true">
          {stages.map((stage) => (
            <i
              key={stage.id}
              className={
                stage.state === "done"
                  ? "is-done"
                  : stage.state === "current"
                    ? "is-current"
                    : ""
              }
            />
          ))}
        </span>
        <span className="gm-gtl-meta-value">
          {current >= 0 ? `Stage ${current + 1} of ${total}` : `0 of ${total} started`}
        </span>
      </div>

      <ol className="gm-gtl-rail">
        {stages.map((stage, index) => (
          <li key={stage.id} className={`gm-gtl-row is-${stage.state}`}>
            <button
              type="button"
              className="gm-gtl-node"
              onClick={() => onOpen(stage)}
              aria-label={`${stage.name} — open stage guidance`}
            >
              {/* left rail: index badge + connector */}
              <span className="gm-gtl-railcell" aria-hidden="true">
                <span className="gm-gtl-connector is-top" />
                <span className="gm-gtl-index">
                  {stage.state === "done" ? (
                    <Check width={15} height={15} strokeWidth={3} />
                  ) : stage.state === "current" ? (
                    <Activity width={15} height={15} />
                  ) : (
                    <span className="gm-gtl-index-num">{index + 1}</span>
                  )}
                </span>
                <span className="gm-gtl-connector is-bottom" />
              </span>

              {/* body card */}
              <span className="gm-gtl-card">
                <span className="gm-gtl-card-head">
                  <span className="gm-gtl-title">
                    <strong>{stage.name}</strong>
                    <small>
                      <CalendarDays width={12} height={12} /> {stage.dates}
                      <i className="gm-gtl-dotsep">·</i>
                      <Timer width={12} height={12} /> {stage.duration}
                    </small>
                  </span>
                  <span className={`gm-gtl-state is-${stage.state}`}>
                    {stage.state === "done"
                      ? "Complete"
                      : stage.state === "current"
                        ? "Current"
                        : "Upcoming"}
                  </span>
                </span>

                <span className="gm-gtl-desc">{stage.description}</span>

                <span className="gm-gtl-progress">
                  <span className="gm-gtl-progress-head">
                    <small>
                      {stage.state === "current"
                        ? "Stage progress"
                        : stage.state === "done"
                          ? "Completed"
                          : "Not started"}
                    </small>
                    <b>{stage.progress}%</b>
                  </span>
                  <span
                    className="gm-gtl-progress-track"
                    role="progressbar"
                    aria-label={`${stage.name} progress`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={stage.progress}
                  >
                    <i
                      style={{ width: `${Math.min(100, Math.max(0, stage.progress))}%` }}
                    />
                  </span>
                </span>
              </span>

              {/* trailing chevron */}
              <span className="gm-gtl-go" aria-hidden="true">
                <ArrowRight width={16} height={16} />
              </span>
            </button>
          </li>
        ))}
      </ol>
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
