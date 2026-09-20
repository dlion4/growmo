/* ============================================================================
   PAGE 8 WIDGETS — Weather & Climate Intelligence
   Reuses the master theme's plan, widget, timeline, table and status primitives.
   ========================================================================== */
import {
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Sprout,
  Sun,
  Thermometer,
  Umbrella,
  Waves,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  CropPredictionPeriod,
  CropWeatherPlan,
  CurrentWeatherMetric,
  ExtremeWeatherAlert,
  SeasonalRisk,
  WeatherForecastDay,
  WeatherLocation,
} from "../../data/app/weather";
import { alertTone, matchTone, riskTone } from "../../data/app/weather";
import { StatusChip } from "./DashboardWidgets";
import { TrendChart } from "./InventoryWidgets";

export interface WeatherKpi {
  label: string;
  value: string;
  note: string;
}

export function WeatherHeaderCard({
  location,
  kpis,
  actions,
}: {
  location: WeatherLocation;
  kpis: WeatherKpi[];
  actions: ReactNode;
}) {
  return (
    <header className="gm-card gm-plan-head">
      <div className="d-flex flex-wrap align-items-start gap-4">
        <div style={{ flex: "1 1 440px" }}>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Page 8 · Weather & climate intelligence
          </span>
          <h1 className="font-display mt-2">
            Plant with the rain, not against it
          </h1>
          <p className="gm-lead on-dark mb-0">
            Hali ya hewa ya shamba — hyper-local conditions, crop-stage
            warnings, planting windows and practical actions for {location.ward}
            , {location.county}.
          </p>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <span className="gm-chip gm-chip-ghost">
              <MapPin /> {location.ward}, {location.county}
            </span>
            <span className="gm-chip gm-chip-ghost">
              <Gauge /> {location.elevation}
            </span>
            <span className="gm-chip gm-chip-ghost">
              Updated {location.updated}
            </span>
          </div>
        </div>
        <div className="gm-plan-hero-actions">{actions}</div>
      </div>
      <div className="gm-plan-kpi-row mt-4">
        {kpis.map((kpi) => (
          <div className="gm-card p-3" key={kpi.label}>
            <span className="gm-eyebrow">{kpi.label}</span>
            <strong className="font-display gm-plan-fact-value">
              {kpi.value}
            </strong>
            <small className="d-block text-muted">{kpi.note}</small>
          </div>
        ))}
      </div>
    </header>
  );
}

function metricIcon(metric: CurrentWeatherMetric) {
  if (metric.icon === "thermometer") return <Thermometer />;
  if (metric.icon === "droplets") return <Droplets />;
  if (metric.icon === "cloud-rain") return <CloudRain />;
  if (metric.icon === "wind") return <Wind />;
  if (metric.icon === "sun") return <Sun />;
  if (metric.icon === "waves") return <Waves />;
  if (metric.icon === "eye") return <Eye />;
  return <Gauge />;
}

export function CurrentConditionsCard({
  metrics,
  onMetric,
}: {
  metrics: CurrentWeatherMetric[];
  onMetric: (metric: CurrentWeatherMetric) => void;
}) {
  return (
    <div className="gm-card p-3">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">Section 8.1 · Live now</span>
          <h3 className="font-display mb-1">Current conditions</h3>
          <p className="text-muted mb-0">
            Local probe + Kenya Met feed · 13 Nov 2026, 12:00
          </p>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => onMetric(metrics[0])}
        >
          <Umbrella /> Full reading
        </button>
      </div>
      <div className="gm-widget-grid">
        {metrics.map((metric) => (
          <button
            type="button"
            className="gm-widget-mini is-on text-start"
            key={metric.id}
            onClick={() => onMetric(metric)}
          >
            <div className="d-flex align-items-start justify-content-between gap-2">
              <strong>{metric.parameter}</strong>
              <span
                className="gm-mega-icon"
                style={{ width: 32, height: 32, borderRadius: 10 }}
              >
                {metricIcon(metric)}
              </span>
            </div>
            <span
              className="font-display d-block"
              style={{ fontSize: "1.45rem" }}
            >
              {metric.value}{" "}
              <small
                style={{ fontFamily: "var(--gm-font-body)", fontSize: ".7rem" }}
              >
                {metric.unit}
              </small>
            </span>
            <small className="text-muted">24hr {metric.change}</small>
          </button>
        ))}
      </div>
      <div className="gm-check-row mt-3">
        <Droplets />
        <span>
          <strong>Soil moisture is 65%</strong>
          <small>
            Good for cabbage today; avoid irrigation while rain is expected.
          </small>
        </span>
        <StatusChip label="Good" tone="low" />
      </div>
    </div>
  );
}

export function ForecastDayCard({
  day,
  onOpen,
}: {
  day: WeatherForecastDay;
  onOpen: () => void;
}) {
  const icon =
    day.icon === "rain" ? (
      <CloudRain />
    ) : day.icon === "sun" ? (
      <Sun />
    ) : day.icon === "wind" ? (
      <Wind />
    ) : (
      <CloudRain />
    );
  return (
    <button
      type="button"
      className="gm-card p-3 text-start h-100"
      onClick={onOpen}
    >
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">{day.date}</span>
          <h3 className="font-display mb-0">{day.day}</h3>
        </div>
        <span className="gm-mega-icon">{icon}</span>
      </div>
      <strong className="d-block mt-3">{day.condition}</strong>
      <div className="d-flex align-items-baseline gap-2 mt-1">
        <strong className="font-display" style={{ fontSize: "1.6rem" }}>
          {day.max}°
        </strong>
        <span className="text-muted">/ {day.min}°C</span>
      </div>
      <div className="gm-check-row mt-3">
        <CloudRain />
        <span>
          <strong>{day.rainChance}% rain</strong>
          <small>
            {day.rainAmount} · {day.wind}
          </small>
        </span>
      </div>
      <p className="text-muted mb-0 mt-2" style={{ fontSize: ".77rem" }}>
        {day.cropImpact}
      </p>
    </button>
  );
}

export function WeatherRadarCard({
  location,
  onSources,
  onRefresh,
}: {
  location: WeatherLocation;
  onSources: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="gm-card p-3 h-100">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <span className="gm-eyebrow">Observation layer</span>
          <h3 className="font-display mb-1">What is feeding the forecast?</h3>
          <p className="text-muted mb-0">
            {location.station} · {location.distance} away
          </p>
        </div>
        <span className="gm-mega-icon">
          <MapPin />
        </span>
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <CloudRain />
          <small>Rain gauge</small>
          <strong>5.2 mm</strong>
        </span>
        <span>
          <Droplets />
          <small>Soil probe</small>
          <strong>65%</strong>
        </span>
        <span>
          <Wind />
          <small>Wind sensor</small>
          <strong>12 km/h</strong>
        </span>
        <span>
          <Gauge />
          <small>Last sync</small>
          <strong>{location.updated}</strong>
        </span>
      </div>
      <div className="gm-widget-mini is-on mt-3">
        <strong>Data confidence · 86%</strong>
        <div className="gm-widget-bars mt-2">
          <i style={{ height: "52%" }} />
          <i style={{ height: "78%" }} />
          <i style={{ height: "65%" }} />
          <i style={{ height: "88%" }} />
          <i style={{ height: "82%" }} />
          <i style={{ height: "94%" }} />
        </div>
        <small className="d-block text-muted mt-2">
          Local observation agrees with Kenya Met and satellite trend.
        </small>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onSources}
        >
          View data sources
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onRefresh}
        >
          Refresh station
        </button>
      </div>
    </div>
  );
}

export function SeasonalRiskCard({
  risk,
  onOpen,
}: {
  risk: SeasonalRisk;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-check-row w-100 text-start"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <Sprout />
      </span>
      <span style={{ flex: 1 }}>
        <strong>
          {risk.risk} · {risk.crop}
        </strong>
        <small>
          {risk.timing} · {risk.advisory}
        </small>
      </span>
      <StatusChip label={risk.level} tone={riskTone(risk.level)} />
    </button>
  );
}

export function PredictionTimeline({
  plan,
  onPeriod,
}: {
  plan: CropWeatherPlan;
  onPeriod: (period: CropPredictionPeriod) => void;
}) {
  return (
    <div className="gm-card p-3">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
        <div>
          <span className="gm-eyebrow">
            {plan.county} · {plan.plantingDate}
          </span>
          <h3 className="font-display mb-1">
            {plan.crop} {plan.variety} weather journey
          </h3>
          <p className="text-muted mb-0">
            {plan.duration} · {plan.season} · crop-stage prediction
          </p>
        </div>
        <StatusChip label={`${plan.periods.length} stages`} tone="low" />
      </div>
      <ol className="gm-timeline">
        {plan.periods.map((period, index) => (
          <li
            className={`gm-tl-item ${index < 2 ? "is-done" : index === 2 ? "is-current" : ""}`}
            key={period.id}
          >
            <button
              type="button"
              className="gm-tl-dot"
              onClick={() => onPeriod(period)}
              aria-label={`Open ${period.stage} weather period`}
            >
              <span>{index + 1}</span>
            </button>
            <button
              type="button"
              className="gm-option-row flex-grow-1 text-start mb-0"
              onClick={() => onPeriod(period)}
            >
              <div className="d-flex flex-wrap justify-content-between gap-2">
                <strong>
                  {period.period} · {period.stage}
                </strong>
                <StatusChip
                  label={period.match}
                  tone={matchTone(period.match)}
                />
              </div>
              <small className="d-block text-muted mt-1">
                Rain {period.predictedRain} · {period.predictedTemp} · need{" "}
                {period.cropNeed}
              </small>
              <span className="d-block mt-2" style={{ fontSize: ".78rem" }}>
                {period.advisory}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AlertCard({
  alert,
  onOpen,
}: {
  alert: ExtremeWeatherAlert;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className="gm-check-row w-100 text-start"
      onClick={onOpen}
    >
      <span className="gm-mega-icon">
        <CloudRain />
      </span>
      <span style={{ flex: 1 }}>
        <strong>
          {alert.type} · {alert.county}
        </strong>
        <small>{alert.message}</small>
        <small className="d-block mt-1">{alert.details}</small>
        <small className="d-block mt-1">
          Action: {alert.action} · valid until {alert.validUntil}
        </small>
      </span>
      <StatusChip
        label={alert.status === "Acknowledged" ? "Seen" : alert.severity}
        tone={
          alert.status === "Acknowledged" ? "low" : alertTone(alert.severity)
        }
      />
    </button>
  );
}

export function HistoricalWeatherChart({
  historical,
  onMonth,
}: {
  historical: {
    id: string;
    month: string;
    rainfall: number;
    minTemp: number;
    maxTemp: number;
    rainyDays: number;
    drySpellProbability: number;
    note: string;
  }[];
  onMonth: (month: (typeof historical)[number]) => void;
}) {
  return (
    <div className="gm-card p-3">
      <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
        <div>
          <span className="gm-eyebrow">Planning baseline</span>
          <h3 className="font-display mb-1">Rainfall rhythm by month</h3>
          <p className="text-muted mb-0">
            NASA POWER + local history · click a month for planning notes
          </p>
        </div>
        <StatusChip label="12-month history" tone="low" />
      </div>
      <TrendChart
        points={historical.map((month) => ({
          label: month.month.slice(0, 3),
          value: month.rainfall,
        }))}
        formatValue={(value) => `${value} mm`}
      />
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Rainfall</th>
              <th>Min / max</th>
              <th>Rainy days</th>
              <th>Dry spell probability</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {historical.map((month) => (
              <tr key={month.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link"
                    onClick={() => onMonth(month)}
                  >
                    {month.month}
                  </button>
                </td>
                <td>
                  <strong>{month.rainfall} mm</strong>
                </td>
                <td>
                  {month.minTemp}–{month.maxTemp}°C
                </td>
                <td>{month.rainyDays}</td>
                <td>
                  <StatusChip
                    label={`${month.drySpellProbability}%`}
                    tone={
                      month.drySpellProbability > 55
                        ? "high"
                        : month.drySpellProbability > 30
                          ? "medium"
                          : "low"
                    }
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-icon-btn"
                    aria-label={`Open ${month.month} history`}
                    onClick={() => onMonth(month)}
                  >
                    <Eye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
