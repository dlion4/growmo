/* ============================================================================
   PAGE 17 WIDGETS — soil health, testing and moisture building blocks.
   Presentation only: master-theme classes plus the additive .gm-soil-* layer in
   soil.css (documented in docs/MASTER_THEME.md §17). No new colours, fonts,
   radii or shadows are invented here.
   ========================================================================== */
import {
  AlertTriangle,
  BatteryLow,
  Check,
  ClipboardCheck,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  MapPin,
  Microscope,
  Mountain,
  Package,
  Phone,
  Ruler,
  Sprout,
  Star,
  Sun,
  Thermometer,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ProgressLine,
  StatusChip,
} from "./DashboardWidgets";
import { ScoreRing } from "../auth/controls";
import type {
  CompostBatch,
  FertilizerStep,
  LimeRateRow,
  MoistureWeek,
  SoilHistoryRow,
  SoilLab,
  SoilOrder,
  SoilParameter,
  SoilPlot,
  SoilPractice,
  SoilSensor,
  SamplingStep,
  ScoreComponent,
} from "../../data/app/soil";
import {
  moistureTone,
  practiceTone,
  soilParamTone,
} from "../../data/app/soil";

/* ---------------------------------------------------------------- hero */

export interface SoilKpi {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}

export function SoilHero({
  score,
  projected,
  components,
  kpis,
  alerts,
  actions,
  onScore,
}: {
  score: number;
  projected: number;
  components: ScoreComponent[];
  kpis: SoilKpi[];
  alerts: { label: string; tone: "low" | "medium" | "high" }[];
  actions: ReactNode;
  onScore: () => void;
}) {
  return (
    <section className="gm-soil-hero">
      <div className="gm-soil-hero-head">
        <div className="gm-soil-hero-copy">
          <span className="gm-eyebrow on-dark">
            <span className="dot" />
            17 · Soil health · Testing · Moisture
          </span>
          <h1 className="gm-h-section mb-2">Feed the soil, not just the plant</h1>
          <p className="gm-lead on-dark mb-3">
            Every shilling of fertilizer on this farm now follows a lab result —
            pH, nutrients and micronutrients from KALRO Kabete, translated into one
            costed programme for Plot 1 cabbage.
          </p>
          <div className="gm-soil-hero-chips">
            {alerts.map((alert) => (
              <StatusChip key={alert.label} label={alert.label} tone={alert.tone} />
            ))}
          </div>
        </div>
        <button
          type="button"
          className="gm-soil-score"
          onClick={onScore}
          aria-label="Open the soil health score breakdown"
        >
          <ScoreRing score={score} size={150} />
          <span className="gm-soil-score-label">
            <strong className="font-display">
              {score} → {projected}
            </strong>
            <small>Soil health score · projected next season</small>
            <span className="gm-soil-score-link">See the 5 components</span>
          </span>
        </button>
      </div>

      <div className="gm-soil-hero-grid">
        {components.map((component) => (
          <button
            type="button"
            className="gm-soil-component"
            key={component.id}
            onClick={onScore}
          >
            <span className="gm-soil-component-head">
              <strong>{component.label}</strong>
              <span className="font-display">
                {component.score}/{component.max}
              </span>
            </span>
            <ProgressLine value={(component.score / component.max) * 100} label={component.label} />
            <small>{component.note}</small>
          </button>
        ))}
      </div>

      <div className="gm-soil-kpi-grid">
        {kpis.map((kpi) => (
          <div className="gm-soil-kpi" key={kpi.label}>
            <span className="gm-mega-icon">
              <kpi.icon />
            </span>
            <strong className="font-display">{kpi.value}</strong>
            <span>{kpi.label}</span>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      <div className="gm-soil-hero-actions">{actions}</div>
    </section>
  );
}

/* -------------------------------------------------------------- 17.1 plots */

export function SoilPlotCard({
  plot,
  onOpen,
  onBookTest,
}: {
  plot: SoilPlot;
  onOpen: () => void;
  onBookTest: () => void;
}) {
  const phTone = plot.ph >= 6 ? "low" : plot.ph >= 5.6 ? "medium" : "high";
  const tone =
    plot.status === "Overdue"
      ? "high"
      : plot.status === "Due soon" || plot.status === "Sampled"
        ? "medium"
        : "low";
  return (
    <article className="gm-soil-plot">
      <div className="gm-soil-plot-head">
        <span className="gm-mega-icon">
          <Mountain />
        </span>
        <div>
          <strong>{plot.name}</strong>
          <small>
            {plot.area} · {plot.crop} {plot.variety !== "—" ? `(${plot.variety})` : ""}
          </small>
        </div>
        <StatusChip label={plot.status} tone={tone} />
      </div>
      <div className="gm-soil-plot-meters">
        <span>
          <small>pH</small>
          <strong className="font-display">{plot.ph.toFixed(1)}</strong>
          <StatusChip label={plot.ph >= 6 ? "Optimal" : "Low"} tone={phTone} />
        </span>
        <span>
          <small>Organic matter</small>
          <strong className="font-display">{plot.organicMatter.toFixed(1)}%</strong>
          <StatusChip label={plot.organicMatter >= 4 ? "Good" : "Medium"} tone={plot.organicMatter >= 4 ? "low" : "medium"} />
        </span>
      </div>
      <div className="gm-soil-plot-meta">
        <span>
          <FlaskConical /> Last test {plot.lastTest}
        </span>
        <span>
          <Timer /> Next {plot.nextTest}
        </span>
        <span>
          <Ruler /> {plot.texture}
        </span>
      </div>
      <p className="gm-soil-plot-note">{plot.note}</p>
      <small className="gm-soil-plot-zone">
        <MapPin /> {plot.zone}
      </small>
      <div className="gm-soil-plot-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Plot records
        </button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onBookTest}>
          Book a test
        </button>
      </div>
    </article>
  );
}

export function SoilPlotRow({
  plot,
  onOpen,
  onBookTest,
}: {
  plot: SoilPlot;
  onOpen: () => void;
  onBookTest: () => void;
}) {
  const tone =
    plot.status === "Overdue"
      ? "high"
      : plot.status === "Due soon" || plot.status === "Sampled"
        ? "medium"
        : "low";
  return (
    <tr>
      <td>
        <strong>{plot.name}</strong>
        <small className="d-block text-muted">
          {plot.area} · {plot.zone.split(" · ")[0]}
        </small>
      </td>
      <td>
        {plot.crop}
        <small className="d-block text-muted">{plot.variety}</small>
      </td>
      <td>{plot.texture}</td>
      <td className="font-display">{plot.ph.toFixed(1)}</td>
      <td className="font-display">{plot.organicMatter.toFixed(1)}%</td>
      <td>{plot.lastTest}</td>
      <td>{plot.nextTest}</td>
      <td>
        <StatusChip label={plot.status} tone={tone} />
      </td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
            Records
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onBookTest}>
            Book
          </button>
        </div>
      </td>
    </tr>
  );
}

export function LabCard({
  lab,
  onOpen,
  onBook,
}: {
  lab: SoilLab;
  onOpen: () => void;
  onBook: () => void;
}) {
  return (
    <article className="gm-soil-lab">
      <div className="gm-soil-lab-head">
        <span className="gm-mega-icon">
          <Microscope />
        </span>
        <div>
          <strong>{lab.name}</strong>
          <small>
            <MapPin /> {lab.location}
          </small>
        </div>
      </div>
      <div className="gm-soil-lab-meta">
        <span>
          <ClipboardCheck /> {lab.tests}
        </span>
        <span>
          <Timer /> {lab.turnaround}
        </span>
        <span>
          <Star /> {lab.rating} · {lab.accreditation}
        </span>
        <span>
          <Phone /> {lab.phone}
        </span>
      </div>
      <div className="gm-soil-lab-prices">
        <span>
          <small>Basic</small>
          <strong className="font-display">
            {lab.costBasic === 0 ? "Not offered" : `KES ${lab.costBasic.toLocaleString("en-KE")}`}
          </strong>
        </span>
        <span>
          <small>Comprehensive</small>
          <strong className="font-display">
            {lab.costComprehensive === 0
              ? "Not offered"
              : `KES ${lab.costComprehensive.toLocaleString("en-KE")}`}
          </strong>
        </span>
      </div>
      <p className="gm-soil-lab-note">{lab.note}</p>
      <div className="gm-soil-lab-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Lab details
        </button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onBook}>
          Book with this lab
        </button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ 17.2 results */

export function ParameterRow({
  parameter,
  onOpen,
  onAction,
}: {
  parameter: SoilParameter;
  onOpen: () => void;
  onAction: () => void;
}) {
  const tone = soilParamTone(parameter);
  return (
    <tr>
      <td>
        <strong>{parameter.parameter}</strong>
        <small className="d-block text-muted">
          {parameter.symbol} · {parameter.method}
        </small>
      </td>
      <td className="font-display">{parameter.display}</td>
      <td>
        <StatusChip label={parameter.status} tone={tone} />
      </td>
      <td>
        {parameter.optimalLabel}
        {parameter.optimalLow > 0 ? (
          <small className="d-block text-muted">
            {parameter.optimalLow} – {parameter.optimalHigh} {parameter.unit}
          </small>
        ) : (
          <small className="d-block text-muted">Field textural class</small>
        )}
      </td>
      <td>{parameter.recommendation}</td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
            Interpret
          </button>
          {parameter.actionTarget !== "none" && parameter.status !== "Optimal" ? (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onAction}>
              {parameter.actionCost === 0 ? "Plan it" : "Fix it"}
            </button>
          ) : (
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onAction}>
              Why skip?
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function ParameterMeter({
  parameter,
  onOpen,
}: {
  parameter: SoilParameter;
  onOpen: () => void;
}) {
  const span =
    parameter.optimalHigh > parameter.optimalLow
      ? parameter.optimalHigh - parameter.optimalLow
      : Math.max(parameter.value, 1);
  const max = parameter.optimalHigh + span * 0.8;
  const position = Math.min(100, Math.max(0, (parameter.value / max) * 100));
  const lowMark = (parameter.optimalLow / max) * 100;
  const highMark = Math.min(100, (parameter.optimalHigh / max) * 100);
  return (
    <button type="button" className="gm-soil-meter" onClick={onOpen}>
      <span className="gm-soil-meter-head">
        <strong>
          {parameter.parameter} · {parameter.display}
        </strong>
        <StatusChip label={parameter.status} tone={soilParamTone(parameter)} />
      </span>
      <span className="gm-soil-meter-track">
        <i className="band" style={{ left: `${lowMark}%`, width: `${Math.max(4, highMark - lowMark)}%` }} />
        <i className="mark" style={{ left: `${position}%` }} />
      </span>
      <small>{parameter.recommendation}</small>
    </button>
  );
}

/* -------------------------------------------------------- 17.3 fertilizer */

export function ProgramStepRow({
  step,
  onOpen,
  onToggle,
}: {
  step: FertilizerStep;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <tr>
      <td>
        <strong>{step.application}</strong>
        <small className="d-block text-muted">{step.timing}</small>
      </td>
      <td>
        {step.product}
        <small className="d-block text-muted">{step.swahili}</small>
      </td>
      <td className="font-display">{step.ratePerAcre}</td>
      <td>{step.purpose}</td>
      <td className="font-display">KES {step.cost.toLocaleString("en-KE")}</td>
      <td>
        {step.applied ? (
          <StatusChip label="Applied" tone="low" />
        ) : (
          <StatusChip label="Planned" tone="medium" />
        )}
      </td>
      <td>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
            Product
          </button>
          <button
            type="button"
            className={`gm-btn gm-btn-sm ${step.applied ? "gm-btn-outline" : "gm-btn-lime"}`}
            onClick={onToggle}
          >
            {step.applied ? "Undo" : "Mark applied"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export function SkippedInputRow({
  input,
  reason,
  saved,
  evidence,
  onOpen,
}: {
  input: string;
  reason: string;
  saved: number;
  evidence: string;
  onOpen: () => void;
}) {
  return (
    <div className="gm-check-row gm-soil-skip">
      <span className="gm-soil-skip-icon">
        <AlertTriangle />
      </span>
      <span style={{ flex: 1 }}>
        <strong>{input}</strong>
        <small>{reason}</small>
        <small className="gm-soil-skip-evidence">{evidence}</small>
      </span>
      <span className="gm-soil-skip-saved">
        <small>Saved</small>
        <strong className="font-display">KES {saved.toLocaleString("en-KE")}</strong>
      </span>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
        Why?
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- 17.4 charts */

export function TrendLineChart({
  points,
  title,
  unit,
  target,
  label,
  min,
  max,
  onPoint,
}: {
  points: { id: string; label: string; value: number; note?: string }[];
  title: string;
  unit: string;
  target?: number;
  label: string;
  min: number;
  max: number;
  onPoint: (point: { id: string; label: string; value: number; note?: string }) => void;
}) {
  const width = 320;
  const height = 132;
  const pad = 18;
  const span = max - min || 1;
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const y = (value: number) =>
    height - pad - ((Math.min(max, Math.max(min, value)) - min) / span) * (height - pad * 2);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${pad + index * step} ${y(point.value)}`)
    .join(" ");
  return (
    <figure className="gm-soil-chart">
      <figcaption>
        <span className="gm-eyebrow">{title}</span>
        <span className="gm-soil-chart-unit">{unit}</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${label} trend from ${points[0]?.label} to ${points[points.length - 1]?.label}`}
      >
        <line x1={pad} y1={y(min)} x2={width - pad} y2={y(min)} className="axis" />
        {target !== undefined ? (
          <>
            <line x1={pad} y1={y(target)} x2={width - pad} y2={y(target)} className="target" />
            <text x={width - pad} y={y(target) - 5} className="target-label" textAnchor="end">
              target {target}
            </text>
          </>
        ) : null}
        <path d={path} className="series" />
        {points.map((point, index) => (
          <g key={point.id} className="point" onClick={() => onPoint(point)}>
            <circle cx={pad + index * step} cy={y(point.value)} r="9" className="hit" />
            <circle cx={pad + index * step} cy={y(point.value)} r="4" className="dot" />
            <text x={pad + index * step} y={height - 4} className="tick" textAnchor="middle">
              {point.label}
            </text>
            <text x={pad + index * step} y={y(point.value) - 8} className="value" textAnchor="middle">
              {point.value}
            </text>
          </g>
        ))}
      </svg>
      <small className="gm-soil-chart-note">
        Tap any point for that season's detail.
      </small>
    </figure>
  );
}

export function NpkBarChart({
  rows,
  onBar,
}: {
  rows: SoilHistoryRow[];
  onBar: (row: SoilHistoryRow) => void;
}) {
  const maxN = 30;
  const series: { key: "nitrogen" | "phosphorus" | "potassium"; label: string; max: number; cls: string }[] = [
    { key: "nitrogen", label: "N (ppm)", max: maxN, cls: "n" },
    { key: "phosphorus", label: "P (ppm)", max: 40, cls: "p" },
    { key: "potassium", label: "K (ppm)", max: 240, cls: "k" },
  ];
  return (
    <div className="gm-soil-bars">
      <div className="gm-soil-bars-legend">
        {series.map((item) => (
          <span key={item.key}>
            <em className={item.cls} /> {item.label}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div className="gm-soil-bar-row" key={row.id}>
          <span className="gm-soil-bar-year">{row.year}</span>
          <span className="gm-soil-bar-track">
            {series.map((item) => (
              <i
                key={item.key}
                className={item.cls}
                style={{ width: `${Math.min(100, (row[item.key] / item.max) * 100)}%` }}
              />
            ))}
          </span>
          <span className="gm-soil-bar-values font-display">
            {row.nitrogen} / {row.phosphorus} / {row.potassium}
          </span>
          <button
            type="button"
            className="gm-table-link"
            onClick={() => onBar(row)}
          >
            Detail
          </button>
        </div>
      ))}
    </div>
  );
}

export function ScoreTrendChart({
  points,
  onPoint,
}: {
  points: { id: string; year: string; score: number; note: string }[];
  onPoint: (point: { id: string; year: string; score: number; note: string }) => void;
}) {
  return (
    <div className="gm-soil-score-trend">
      {points.map((point) => (
        <button
          type="button"
          className="gm-soil-score-col"
          key={point.id}
          onClick={() => onPoint(point)}
        >
          <span className="font-display">{point.score}</span>
          <span className="gm-soil-score-bar">
            <i style={{ height: `${point.score}%` }} />
          </span>
          <small>{point.year}</small>
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- 17.5 sampling */

const STEP_ICON: Record<string, LucideIcon> = {
  tools: Ruler,
  map: MapPin,
  route: Sprout,
  layers: Mountain,
  bucket: Package,
  bag: Package,
  tag: ClipboardCheck,
  sun: Sun,
  shield: Check,
};

export function SamplingStepCard({
  step,
  language,
  onOpen,
}: {
  step: SamplingStep;
  language: "EN" | "SW";
  onOpen: () => void;
}) {
  const Icon = STEP_ICON[step.icon] ?? Check;
  return (
    <article className={`gm-soil-step ${language === "SW" ? "is-sw" : ""}`}>
      <span className="gm-soil-step-num font-display">{step.step}</span>
      <span className="gm-mega-icon">
        <Icon />
      </span>
      <strong>{step.action}</strong>
      <p>{language === "SW" ? step.swahili : step.details}</p>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
        {language === "SW" ? "Maelezo zaidi" : "More detail"}
      </button>
    </article>
  );
}

/* -------------------------------------------------------------- 17.7 plan */

export function PracticeCard({
  practice,
  onOpen,
  onToggle,
}: {
  practice: SoilPractice;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <article className={`gm-soil-practice ${practice.started ? "is-started" : ""}`}>
      <div className="gm-soil-practice-head">
        <span className="gm-mega-icon">
          <Leaf />
        </span>
        <div>
          <strong>{practice.practice}</strong>
          <small>
            {practice.frequency} · {practice.acres}
          </small>
        </div>
        <StatusChip label={practice.priority} tone={practiceTone(practice.priority)} />
      </div>
      <p>{practice.impact}</p>
      <div className="gm-soil-practice-meta">
        <span className="gm-chip gm-chip-gold">{practice.costLabel}</span>
        <span className="gm-chip gm-chip-ghost">{practice.firstAction}</span>
      </div>
      <ProgressLine value={practice.progress} label={`${practice.practice} progress`} />
      <small className="gm-soil-practice-progress">
        {practice.started ? `${practice.progress}% through this season's plan` : "Not started yet"}
      </small>
      <div className="gm-soil-practice-foot">
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          How to do it
        </button>
        <button
          type="button"
          className={`gm-btn gm-btn-sm ${practice.started ? "gm-btn-outline" : "gm-btn-lime"}`}
          onClick={onToggle}
        >
          {practice.started ? "Pause" : "Start practice"}
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------- 17.8 moisture */

export function MoistureWeekRow({
  week,
  onOpen,
}: {
  week: MoistureWeek;
  onOpen: () => void;
}) {
  return (
    <tr>
      <td>
        <strong>{week.week}</strong>
      </td>
      <td className="font-display">{week.rainfall} mm</td>
      <td className="font-display">{week.et} mm</td>
      <td className="font-display">{week.irrigation} mm</td>
      <td
        className={`font-display ${
          week.net < 0 ? "gm-soil-net is-negative" : "gm-soil-net is-positive"
        }`}
      >
        {week.net > 0 ? `+${week.net}` : week.net} mm
      </td>
      <td>
        <StatusChip label={week.status} tone={moistureTone(week.status)} />
      </td>
      <td>{week.action}</td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          {week.logged ? "Logged" : week.irrigationCost > 0 ? "Irrigate" : "Log"}
        </button>
      </td>
    </tr>
  );
}

export function MoistureBalanceChart({
  weeks,
  onBar,
}: {
  weeks: MoistureWeek[];
  onBar: (week: MoistureWeek) => void;
}) {
  const max = Math.max(
    ...weeks.map((week) => Math.max(week.rainfall, week.et, week.irrigation, Math.abs(week.net))),
  );
  const scale = (value: number) => `${Math.max(4, (value / max) * 100)}%`;
  return (
    <div className="gm-soil-moisture">
      <div className="gm-soil-moisture-legend">
        <span>
          <em className="rain" /> Rainfall in
        </span>
        <span>
          <em className="et" /> ET out
        </span>
        <span>
          <em className="irr" /> Irrigation in
        </span>
        <span>
          <em className="net" /> Net balance
        </span>
      </div>
      {weeks.map((week) => (
        <button
          type="button"
          className="gm-soil-moisture-row"
          key={week.id}
          onClick={() => onBar(week)}
        >
          <span className="gm-soil-moisture-week">{week.week}</span>
          <span className="gm-soil-moisture-bars">
            <i className="rain" style={{ width: scale(week.rainfall) }} />
            <i className="et" style={{ width: scale(week.et) }} />
            <i className="irr" style={{ width: scale(week.irrigation) }} />
            <i className={`net ${week.net < 0 ? "is-negative" : ""}`} style={{ width: scale(Math.abs(week.net)) }} />
          </span>
          <span className={`gm-soil-moisture-net font-display ${week.net < 0 ? "is-negative" : ""}`}>
            {week.net > 0 ? `+${week.net}` : week.net} mm
          </span>
          <StatusChip label={week.status} tone={moistureTone(week.status)} />
        </button>
      ))}
    </div>
  );
}

export function SensorRow({
  sensor,
  onOpen,
}: {
  sensor: SoilSensor;
  onOpen: () => void;
}) {
  const tone =
    sensor.status === "Online" ? "low" : sensor.status === "Offline" ? "medium" : "high";
  return (
    <tr>
      <td>
        <strong>{sensor.device}</strong>
        <small className="d-block text-muted">Depth {sensor.depth}</small>
      </td>
      <td>{sensor.plot}</td>
      <td>
        {sensor.status === "Online" ? (
          <span className="gm-soil-signal is-on">
            <Wifi /> {sensor.moisture}%
          </span>
        ) : sensor.status === "Offline" ? (
          <span className="gm-soil-signal is-off">
            <WifiOff /> last {sensor.moisture}%
          </span>
        ) : (
          <span className="gm-soil-signal is-none">
            <WifiOff /> not connected
          </span>
        )}
      </td>
      <td>
        {sensor.status === "Not installed" ? (
          "—"
        ) : sensor.battery <= 20 ? (
          <span className="gm-soil-signal is-low">
            <BatteryLow /> {sensor.battery}%
          </span>
        ) : (
          <span className="gm-soil-signal">{sensor.battery}%</span>
        )}
      </td>
      <td>{sensor.lastReading}</td>
      <td>
        <StatusChip label={sensor.status} tone={tone} />
      </td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          {sensor.status === "Not installed" ? "Install" : "Manage"}
        </button>
      </td>
    </tr>
  );
}

/* ---------------------------------------------------- compost, lime, misc */

export function CompostRow({
  batch,
  onOpen,
}: {
  batch: CompostBatch;
  onOpen: () => void;
}) {
  const tone =
    batch.stage === "Ready" || batch.stage === "Applied"
      ? "low"
      : batch.stage === "Curing"
        ? "medium"
        : "medium";
  return (
    <tr>
      <td>
        <strong>{batch.batch}</strong>
        <small className="d-block text-muted">{batch.material}</small>
      </td>
      <td>{batch.started}</td>
      <td>{batch.ready}</td>
      <td className="font-display">{batch.volume}</td>
      <td>
        <StatusChip label={batch.stage} tone={tone} />
      </td>
      <td>
        <span className="gm-soil-temp">
          <Thermometer /> {batch.temperature}
        </span>
        <small className="d-block text-muted">turned {batch.turned}</small>
      </td>
      <td>{batch.appliedTo}</td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Batch notes
        </button>
      </td>
    </tr>
  );
}

export function LimeRateRowView({
  row,
  onOpen,
}: {
  row: LimeRateRow;
  onOpen: () => void;
}) {
  return (
    <tr>
      <td>
        <strong>{row.texture}</strong>
      </td>
      <td>{row.currentPh}</td>
      <td>{row.targetPh}</td>
      <td className="font-display">{row.ratePerAcre}</td>
      <td className="font-display">
        {row.cost === 0 ? "—" : `KES ${row.cost.toLocaleString("en-KE")}`}
      </td>
      <td>{row.note}</td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          Use this rate
        </button>
      </td>
    </tr>
  );
}

export function SoilOrderRow({
  order,
  onOpen,
}: {
  order: SoilOrder;
  onOpen: () => void;
}) {
  const tone =
    order.status === "Paid"
      ? "low"
      : order.status === "Pending" || order.status === "In progress"
        ? "medium"
        : "high";
  return (
    <tr>
      <td>{order.date}</td>
      <td>
        <strong>{order.item}</strong>
        <small className="d-block text-muted">{order.note}</small>
      </td>
      <td>{order.plot}</td>
      <td className="font-display">KES {order.amount.toLocaleString("en-KE")}</td>
      <td>{order.method}</td>
      <td>
        <StatusChip label={order.status} tone={tone} />
      </td>
      <td>
        {order.receipt === "—" ? (
          <span className="text-muted">—</span>
        ) : (
          <span className="gm-code-chip">{order.receipt}</span>
        )}
      </td>
      <td>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpen}>
          {order.status === "Paid" ? "Receipt" : "Finish order"}
        </button>
      </td>
    </tr>
  );
}

export function MoistureMethodCard({
  method,
  onToggle,
}: {
  method: {
    id: string;
    method: string;
    source: string;
    frequency: string;
    display: string;
    cost: number;
    accuracy: string;
    bestFor: string;
    active: boolean;
  };
  onToggle: () => void;
}) {
  const Icon =
    method.id === "mm-1"
      ? Droplets
      : method.id === "mm-2"
        ? Check
        : method.id === "mm-3"
          ? Gauge
          : Sun;
  return (
    <article className={`gm-soil-method ${method.active ? "is-active" : ""}`}>
      <div className="gm-soil-method-head">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div>
          <strong>{method.method}</strong>
          <small>{method.source}</small>
        </div>
        <StatusChip label={method.active ? "On" : "Off"} tone={method.active ? "low" : "neutral"} />
      </div>
      <div className="gm-soil-method-meta">
        <span>
          <Timer /> {method.frequency}
        </span>
        <span>
          <Gauge /> {method.accuracy}
        </span>
        <span className="gm-chip gm-chip-gold">
          {method.cost === 0 ? "Free" : `KES ${method.cost.toLocaleString("en-KE")}`}
        </span>
      </div>
      <p>
        <strong>Shows:</strong> {method.display}
      </p>
      <small className="gm-soil-method-best">{method.bestFor}</small>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onToggle}>
        {method.active ? "Turn this method off" : "Turn this method on"}
      </button>
    </article>
  );
}

export function SoilPartnerCard({
  icon: Icon,
  title,
  body,
  meta,
  action,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  meta: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <article className="gm-soil-partner">
      <span className="gm-mega-icon">
        <Icon />
      </span>
      <strong>{title}</strong>
      <p>{body}</p>
      <small>{meta}</small>
      <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onAction}>
        {action}
      </button>
    </article>
  );
}

export function SoilKv({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="gm-soil-kv">
      {rows.map((row) => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SoilCallout({
  icon: Icon = FlaskConical,
  title,
  body,
  tone = "info",
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  tone?: "info" | "warn" | "good";
}) {
  return (
    <div className={`gm-soil-callout tone-${tone}`}>
      <Icon />
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
    </div>
  );
}
