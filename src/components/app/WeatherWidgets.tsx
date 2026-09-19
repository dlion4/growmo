/* ============================================================================
   PAGE 8 SHARED WIDGETS — /app/weather
   Presentational building blocks styled only by the master theme +
   weather.css (§19). No data fetching, no business logic.
   ========================================================================== */
import {
  ArrowRight,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSunRain,
  Droplet,
  Droplets,
  Eye,
  Gauge,
  Leaf,
  type LucideIcon,
  Navigation,
  Sun,
  Thermometer,
  ThermometerSnowflake,
  Waves,
  Wind,
} from "lucide-react";
import { type ReactNode, useId } from "react";
import type {
  AlertContact,
  CropPeriod,
  CurrentDatum,
  ExtremeAlert,
  ForecastDay,
  GaugeObservation,
  HistoryMonth,
  PlantingWindow,
  SeasonMonth,
  WxCondition,
  WxSeverity,
  WxTone,
} from "../../data/app/weather";
import { StatusChip } from "./DashboardWidgets";

/* ---------- icons ---------- */

export const CONDITION_ICONS: Record<WxCondition, LucideIcon> = {
  rain: CloudRain,
  showers: CloudSunRain,
  storm: CloudLightning,
  cloud: Cloud,
  sun: Sun,
  fog: CloudFog,
  wind: Wind,
};

export const CURRENT_ICONS: Record<CurrentDatum["icon"], LucideIcon> = {
  temp: Thermometer,
  feels: ThermometerSnowflake,
  humidity: Droplets,
  wind: Wind,
  compass: Navigation,
  rain: CloudRain,
  "rain-week": CloudSunRain,
  "soil-temp": Thermometer,
  "soil-moist": Droplet,
  uv: Sun,
  et: Waves,
  dew: Droplet,
  eye: Eye,
  gauge: Gauge,
};

export function severityTone(severity: WxSeverity): WxTone {
  return severity === "Extreme" || severity === "Warning"
    ? "high"
    : severity === "Watch"
      ? "medium"
      : "low";
}

/* ---------- form helpers (labelled, a11y-safe) ---------- */

export function WxField({
  label,
  children,
  full = false,
  hint,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className={`gm-field ${full ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div id={id}>{children}</div>
      {hint ? (
        <small style={{ fontWeight: 600, color: "var(--gm-ink-400)" }}>
          {hint}
        </small>
      ) : null}
    </div>
  );
}

export function WxModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
      {children}
    </div>
  );
}

/* ---------- notes, facts, summary ---------- */

export function WxNote({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "danger";
  children: ReactNode;
}) {
  const cls = tone === "warn" ? "warn" : tone === "danger" ? "danger" : "";
  return <p className={`gm-wx-note ${cls} mb-0`}>{children}</p>;
}

export function WxFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="gm-wx-fact">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

export function WxFactGrid({
  facts,
}: {
  facts: { label: string; value: string }[];
}) {
  return (
    <div className="gm-wx-fact-grid">
      {facts.map((fact) => (
        <WxFact key={fact.label} label={fact.label} value={fact.value} />
      ))}
    </div>
  );
}

export function WxSummary({
  title,
  note,
  chips = [],
  actions,
}: {
  title: string;
  note: string;
  chips?: string[];
  actions?: ReactNode;
}) {
  return (
    <div className="gm-wx-summary">
      <div style={{ flex: "1 1 260px" }}>
        <strong className="d-block">{title}</strong>
        <p className="mb-0" style={{ color: "rgba(255,255,255,.82)" }}>
          {note}
        </p>
        {chips.length ? (
          <div className="d-flex flex-wrap gap-2 mt-2">
            {chips.map((chip) => (
              <span key={chip} className="gm-chip">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="d-flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/* ---------- 8.1 live conditions ---------- */

export function WxConditionTile({
  datum,
  selected,
  onSelect,
}: {
  datum: CurrentDatum;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = CURRENT_ICONS[datum.icon];
  return (
    <button
      type="button"
      className={`gm-wx-now ${selected ? "on" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="gm-wx-now-top">
        <Icon />
        <small>{datum.label}</small>
      </span>
      <span className="gm-wx-now-value">
        {datum.display}
        {datum.unit ? <span>{datum.unit}</span> : null}
      </span>
      <span className="gm-wx-now-change">24hr {datum.change}</span>
      <span className="gm-wx-now-note">{datum.field}</span>
    </button>
  );
}

export function WxConditionDetail({ datum }: { datum: CurrentDatum }) {
  return (
    <div className="gm-wx-detail">
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="gm-mega-icon">
          {(() => {
            const Icon = CURRENT_ICONS[datum.icon];
            return <Icon />;
          })()}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong className="d-block font-display">
            {datum.label} · {datum.swahili}
          </strong>
          <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>
            {datum.value}
            {datum.unit ? ` ${datum.unit}` : ""} · 24hr change {datum.change}
          </small>
        </div>
        <StatusChip
          label={datum.tone === "neutral" ? "Normal" : datum.tone}
          tone={datum.tone}
        />
      </div>
      <p className="mb-0" style={{ fontSize: ".86rem", fontWeight: 600 }}>
        {datum.note}
      </p>
      <div className="gm-check-row mb-0">
        <Leaf />
        <span style={{ flex: 1 }}>
          <small>What to do in the field</small>
          <strong>{datum.field}</strong>
        </span>
      </div>
    </div>
  );
}

/* ---------- 8.2 hourly + 7-day ---------- */

export function WxHourlyStrip({
  hours,
  selected,
  onSelect,
}: {
  hours: { hour: string; temp: number; rainPct: number; label: string }[];
  selected: string;
  onSelect: (hour: string) => void;
}) {
  return (
    <div className="gm-wx-hours" role="tablist" aria-label="Today by the hour">
      {hours.map((hour) => (
        <button
          key={hour.hour}
          type="button"
          role="tab"
          aria-selected={selected === hour.hour}
          className={`gm-wx-hour ${selected === hour.hour ? "on" : ""}`}
          onClick={() => onSelect(hour.hour)}
        >
          <small>{hour.hour}</small>
          <strong>{hour.temp}°</strong>
          <span className="gm-wx-hour-bar" aria-hidden="true">
            <i style={{ width: `${hour.rainPct}%` }} />
          </span>
          <small>{hour.rainPct}%</small>
        </button>
      ))}
    </div>
  );
}

export function WxDayCard({
  day,
  selected,
  onSelect,
}: {
  day: ForecastDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = CONDITION_ICONS[day.condition];
  return (
    <button
      type="button"
      className={`gm-wx-day ${selected ? "on" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="gm-wx-day-top">
        <Icon />
        <small style={{ fontWeight: 800 }}>{day.label}</small>
      </span>
      <span className="gm-wx-day-temp">
        {day.max}° <small>/ {day.min}°</small>
      </span>
      <span className="gm-wx-day-meta">
        <span>{day.conditionText}</span>
        <span>
          {day.rainPct}% · {day.rainMin}–{day.rainMax} mm
        </span>
        <span>
          {day.wind} km/h {day.windDir}
        </span>
      </span>
      <StatusChip label={day.spray} tone={day.tone} />
    </button>
  );
}

/* ---------- 8.3 seasonal ---------- */

export function WxMonthCard({
  month,
  selected,
  onSelect,
}: {
  month: SeasonMonth;
  selected: boolean;
  onSelect: () => void;
}) {
  const max = 250;
  return (
    <button
      type="button"
      className={`gm-wx-month ${selected ? "on" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="d-flex align-items-center justify-content-between gap-2">
        <span className="gm-eyebrow">{month.month}</span>
        <StatusChip label={month.vsAverage} tone={month.tone} />
      </div>
      <span className="gm-wx-month-rain">{month.rainfall}</span>
      <span className="gm-wx-hour-bar" aria-hidden="true">
        <i
          style={{ width: `${Math.min(100, (month.rainMid / max) * 100)}%` }}
        />
      </span>
      <span className="gm-wx-day-meta">
        <span>
          {month.temp} · {month.rainyDays} rainy days
        </span>
        <span>Dry spell risk: {month.drySpell}</span>
        <span>Flood risk: {month.flood}</span>
      </span>
      <small style={{ fontWeight: 700, color: "var(--gm-ink-600)" }}>
        {month.headline}
      </small>
    </button>
  );
}

export function WxDekadalGrid({ month }: { month: SeasonMonth }) {
  return (
    <div className="gm-wx-dekadal">
      {month.dekadal.map((dek) => (
        <div key={dek.label} className="gm-wx-dek">
          <small>{dek.label}</small>
          <strong>{dek.rain} mm</strong>
          <p className="mb-0" style={{ fontSize: ".78rem", fontWeight: 600 }}>
            {dek.note}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------- 8.4 prediction engine ---------- */

export function WxStageRail({
  periods,
  selectedId,
  onSelect,
}: {
  periods: CropPeriod[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="gm-wx-stage-rail" role="tablist" aria-label="Crop stages">
      {periods.map((period) => (
        <button
          key={period.id}
          type="button"
          role="tab"
          aria-selected={selectedId === period.id}
          className={`gm-wx-stage-item ${
            period.tone === "high"
              ? "is-high"
              : period.tone === "medium"
                ? "is-medium"
                : ""
          } ${selectedId === period.id ? "on" : ""}`}
          onClick={() => onSelect(period.id)}
        >
          <small>
            Days {period.days} · {period.rain}
          </small>
          <strong>{period.stage}</strong>
          <small>{period.period}</small>
          <StatusChip label={period.match} tone={period.tone} />
        </button>
      ))}
    </div>
  );
}

export function WxBalanceBar({
  value,
  max = 40,
}: {
  value: number;
  max?: number;
}) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return (
    <div className="gm-wx-balance" aria-hidden="true">
      <i className={value < 0 ? "neg" : ""} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- 8.5 planting windows ---------- */

const MONTH_CELLS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((month) => ({ id: month, letter: month.slice(0, 1) }));

export function WxWindowTrack({ window }: { window: PlantingWindow }) {
  const cls = (value: number) =>
    value === 3
      ? "t-best"
      : value === 2
        ? "t-good"
        : value === 1
          ? "t-risky"
          : value === 0
            ? "t-avoid"
            : "t-blank";
  return (
    <div>
      <div className="gm-wx-track" aria-hidden="true">
        {MONTH_CELLS.map((cell) => (
          <span
            key={`${window.id}-${cell.id}`}
            className={cls(window.track[MONTH_CELLS.indexOf(cell)] ?? -1)}
          />
        ))}
      </div>
      <div className="gm-wx-months-mini" aria-hidden="true">
        {MONTH_CELLS.map((cell) => (
          <span key={`${window.id}-lbl-${cell.id}`}>{cell.letter}</span>
        ))}
      </div>
    </div>
  );
}

export function WxWindowLegend() {
  return (
    <div className="gm-wx-legend">
      <span>
        <i style={{ background: "var(--gm-leaf-600)" }} /> Best window
      </span>
      <span>
        <i style={{ background: "var(--gm-sprout-300)" }} /> Good window
      </span>
      <span>
        <i style={{ background: "var(--gm-gold-400)" }} /> Risky
      </span>
      <span>
        <i style={{ background: "var(--gm-clay-500)", opacity: 0.4 }} /> Avoid
      </span>
      <span>
        <i style={{ background: "var(--gm-line)" }} /> Not applicable
      </span>
    </div>
  );
}

/* ---------- 8.6 alerts ---------- */

export function WxAlertCard({
  alert,
  onOpen,
}: {
  alert: ExtremeAlert;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={`gm-wx-alert is-${alert.tone} ${alert.ack ? "is-acked" : ""}`}
      onClick={onOpen}
    >
      <span className="gm-wx-alert-head">
        <strong>{alert.type}</strong>
        <StatusChip
          label={alert.severity}
          tone={severityTone(alert.severity)}
        />
        {alert.ack ? <StatusChip label="Acknowledged" tone="neutral" /> : null}
      </span>
      <span className="gm-wx-alert-msg">{alert.message}</span>
      <span className="gm-wx-alert-meta">
        <span>{alert.counties}</span>
        <span>· {alert.affected}</span>
        <span>· {alert.issued}</span>
      </span>
      <span className="d-flex flex-wrap gap-2">
        <span className="gm-chip">
          <ArrowRight width={13} height={13} /> {alert.action}
        </span>
        <span className="gm-chip">Valid {alert.valid}</span>
      </span>
    </button>
  );
}

/* ---------- 8.7 history ---------- */

export function WxRainChart({
  months,
  selectedId,
  onSelect,
}: {
  months: HistoryMonth[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const max = Math.max(...months.map((month) => month.rain), 1);
  return (
    <div
      className="gm-wx-chart"
      role="tablist"
      aria-label="Average monthly rainfall"
    >
      {months.map((month) => (
        <button
          key={month.id}
          type="button"
          role="tab"
          aria-selected={selectedId === month.id}
          className={`gm-wx-bar ${selectedId === month.id ? "on" : ""}`}
          onClick={() => onSelect(month.id)}
        >
          <strong>{month.rain}</strong>
          <span className="gm-wx-bar-track" aria-hidden="true">
            <i style={{ height: `${(month.rain / max) * 100}%` }} />
          </span>
          <small>{month.month}</small>
        </button>
      ))}
    </div>
  );
}

/* ---------- misc rows ---------- */

export function WxObservationRow({
  observation,
  onOpen,
  onDelete,
}: {
  observation: GaugeObservation;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const variance = Number(
    (observation.gaugeMm - observation.stationMm).toFixed(1),
  );
  return (
    <tr>
      <td>
        <strong>{observation.date}</strong>
        <br />
        <small>{observation.time}</small>
      </td>
      <td>{observation.plot}</td>
      <td className="font-display">{observation.gaugeMm} mm</td>
      <td className="font-display">{observation.stationMm} mm</td>
      <td>
        <StatusChip
          label={`${variance > 0 ? "+" : ""}${variance} mm`}
          tone={Math.abs(variance) >= 2 ? "medium" : "low"}
        />
      </td>
      <td>{observation.by}</td>
      <td>
        <div className="d-flex gap-1">
          <button
            type="button"
            className="gm-iconbtn"
            onClick={onOpen}
            aria-label={`Open reading from ${observation.date}`}
          >
            <Eye />
          </button>
          <button
            type="button"
            className="gm-iconbtn danger"
            onClick={onDelete}
            aria-label={`Delete reading from ${observation.date}`}
          >
            <CloudRain />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function WxContactRow({
  contact,
  selected,
  onToggle,
}: {
  contact: AlertContact;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={`gm-checkcard ${selected ? "on" : ""}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <input type="checkbox" readOnly checked={selected} tabIndex={-1} />
      <span style={{ flex: 1 }}>
        <strong>{contact.name}</strong>
        <small>
          {contact.role} · {contact.phone} · {contact.channels.join(", ")}
        </small>
      </span>
      <StatusChip label={contact.language} tone="neutral" />
    </button>
  );
}
