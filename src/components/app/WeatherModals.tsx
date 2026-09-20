/* ============================================================================
   PAGE 8 WORKFLOWS — weather location, alerts, crop prediction and planning
   ========================================================================== */
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Copy,
  Download,
  Droplets,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sprout,
  Thermometer,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  CropPredictionPeriod,
  CurrentWeatherMetric,
  ExtremeWeatherAlert,
  HistoricalWeatherMonth,
  PlantingWindow,
  SeasonalMonth,
  SeasonalRisk,
  WeatherLocation,
  WeatherPreferences,
  WeatherSource,
} from "../../data/app/weather";
import {
  CROP_WEATHER_PLANS,
  PLANTING_WINDOWS,
  WEATHER_CONTEXT,
  WEATHER_LOCATIONS,
  WEATHER_PREFERENCES,
} from "../../data/app/weather";
import { Dialog, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="gm-field">
      <span className="gm-field-label">{label}</span>
      {children}
      {hint ? <small className="text-muted d-block mt-1">{hint}</small> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="gm-input"
      value={value}
      type={type}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type SelectOption = string | { value: string; label: string };

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <select
      className="gm-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => {
        const normalized =
          typeof option === "string"
            ? { value: option, label: option }
            : option;
        return (
          <option value={normalized.value} key={normalized.value}>
            {normalized.label}
          </option>
        );
      })}
    </select>
  );
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="gm-review-row d-flex justify-content-between gap-3 py-2 border-bottom">
      <span className="text-muted">{label}</span>
      <strong className="text-end">{value}</strong>
    </div>
  );
}

function SuccessState({
  title,
  body,
  onDone,
}: {
  title: string;
  body: string;
  onDone: () => void;
}) {
  return (
    <div className="text-center py-3">
      <span className="gm-mega-icon d-inline-grid">
        <CheckCircle2 />
      </span>
      <h4 className="font-display mt-3 mb-2">{title}</h4>
      <p className="text-muted">{body}</p>
      <button type="button" className="gm-btn gm-btn-lime" onClick={onDone}>
        Done
      </button>
    </div>
  );
}

export function LocationDialog({
  open,
  current,
  onClose,
  onSelect,
}: {
  open: boolean;
  current: WeatherLocation;
  onClose: () => void;
  onSelect: (location: WeatherLocation) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  const rows = useMemo(
    () =>
      WEATHER_LOCATIONS.filter((item) =>
        `${item.farm} ${item.county} ${item.ward}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose a weather location"
      desc="Shamba gani? Weather decisions follow the farm or station you choose."
    >
      <div className="d-grid gap-3">
        <div className="gm-search-field">
          <input
            className="gm-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search farm, county or ward"
          />
        </div>
        <div className="d-grid gap-2">
          {rows.map((location) => (
            <button
              type="button"
              className={`gm-option-row text-start ${current.id === location.id ? "is-selected" : ""}`}
              key={location.id}
              onClick={() => {
                onSelect(location);
                onClose();
              }}
            >
              <div className="d-flex align-items-start gap-2">
                <span className="gm-mega-icon">
                  <MapPin />
                </span>
                <span>
                  <strong>{location.farm}</strong>
                  <small className="d-block text-muted">
                    {location.ward}, {location.county} · {location.elevation}
                  </small>
                  <small className="d-block text-muted">
                    {location.station} · {location.distance}
                  </small>
                </span>
                <ChevronRight className="ms-auto" />
              </div>
            </button>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="text-muted text-center mb-0">
            No station matches that search.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

export function MetricDialog({
  open,
  metric,
  onClose,
}: {
  open: boolean;
  metric: CurrentWeatherMetric | null;
  onClose: () => void;
}) {
  if (!metric) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${metric.parameter} reading`}
      desc="Local observation from the nearest weather station."
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <Thermometer />
          <span>
            <strong>{metric.parameter}</strong>
            <small>Last 24-hour movement: {metric.change}</small>
          </span>
          <strong className="font-display">
            {metric.value} {metric.unit}
          </strong>
        </div>
        <div className="gm-card p-3">
          <ReviewRow label="Source layer" value="Githunguri local station" />
          <ReviewRow label="Updated" value="13 Nov 2026 · 12:00" />
          <ReviewRow label="Confidence" value="86%" />
          <ReviewRow
            label="Action"
            value={
              metric.id === "soil-moisture"
                ? "Keep irrigation off while rain is expected"
                : "Use with the crop-stage advisory"
            }
          />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close reading
        </button>
      </div>
    </Dialog>
  );
}

export function ForecastDayDialog({
  open,
  day,
  onClose,
  onPlan,
}: {
  open: boolean;
  day: import("../../data/app/weather").WeatherForecastDay | null;
  onClose: () => void;
  onPlan: (action: string) => void;
}) {
  if (!day) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${day.day} · ${day.condition}`}
      desc={`${day.date} forecast for Githunguri, Kiambu.`}
    >
      <div className="d-grid gap-3">
        <div className="row g-2">
          <div className="col-6">
            <div className="gm-card p-3">
              <small>Temperature</small>
              <strong className="font-display">
                {day.min}–{day.max}°C
              </strong>
              <span>Feels warmest at 13:00.</span>
            </div>
          </div>
          <div className="col-6">
            <div className="gm-card p-3">
              <small>Rain</small>
              <strong className="font-display">{day.rainChance}%</strong>
              <span>{day.rainAmount} expected.</span>
            </div>
          </div>
        </div>
        <div className="gm-card p-3">
          <ReviewRow
            label="Wind / humidity"
            value={`${day.wind} · ${day.humidity}%`}
          />
          <ReviewRow label="Crop impact" value={day.cropImpact} />
          <ReviewRow label="Spray window" value={day.sprayWindow} />
          <ReviewRow label="Irrigation" value={day.irrigation} />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime flex-grow-1"
            onClick={() => onPlan(`Irrigation reminder set for ${day.day}`)}
          >
            Plan irrigation
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline flex-grow-1"
            onClick={() => onPlan(`Spray window saved for ${day.day}`)}
          >
            Save spray window
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SourcesDialog({
  open,
  sources,
  onClose,
}: {
  open: boolean;
  sources: WeatherSource[];
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Weather data sources"
      desc="GrowMO combines official forecasts, satellite history and local observations."
    >
      <div className="d-grid gap-3">
        {sources.map((source) => (
          <div className="gm-check-row" key={source.id}>
            <span className="gm-mega-icon">
              <CloudRain />
            </span>
            <span style={{ flex: 1 }}>
              <strong>{source.name}</strong>
              <small>
                {source.detail} · {source.update}
              </small>
            </span>
            <a
              className="gm-btn gm-btn-outline gm-btn-sm"
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              Open source <ExternalLink />
            </a>
          </div>
        ))}
        <button
          type="button"
          className="gm-btn gm-btn-soft w-100"
          onClick={onClose}
        >
          Close sources
        </button>
      </div>
    </Dialog>
  );
}

export function RefreshStationDialog({
  open,
  location,
  onClose,
  onComplete,
}: {
  open: boolean;
  location: WeatherLocation;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<"loading" | "done">("loading");
  useEffect(() => {
    if (!open) return;
    setStep("loading");
    const timer = window.setTimeout(() => setStep("done"), 1200);
    return () => window.clearTimeout(timer);
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={step === "done" ? onClose : () => undefined}
      title="Refresh weather station"
      desc={`Checking ${location.station}.`}
      dismissable={step === "done"}
    >
      {step === "loading" ? (
        <div className="text-center py-4">
          <LoaderCircle className="gm-spin" />
          <h4 className="font-display mt-3">Syncing observations…</h4>
          <p className="text-muted mb-0">
            Trying local probe, Kenya Met and satellite layers. Timeout window:
            30 seconds.
          </p>
        </div>
      ) : (
        <SuccessState
          title="Station refreshed"
          body="Current conditions and crop advisories now use the latest available observations."
          onDone={() => {
            onComplete();
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}

export function SeasonalOutlookDialog({
  open,
  months,
  subscribed,
  onClose,
  onSubscribe,
}: {
  open: boolean;
  months: SeasonalMonth[];
  subscribed: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Short Rains 2026 outlook"
      desc="Kenya Met seasonal forecast with GrowMO AI interpretation for Kiambu County."
      wide
    >
      <div className="d-grid gap-3">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Parameter</th>
                {months.map((month) => (
                  <th key={month.id}>{month.month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rainfall</td>
                {months.map((month) => (
                  <td key={month.id}>{month.rainfall}</td>
                ))}
              </tr>
              <tr>
                <td>Vs average</td>
                {months.map((month) => (
                  <td key={month.id}>{month.average}</td>
                ))}
              </tr>
              <tr>
                <td>Temperature</td>
                {months.map((month) => (
                  <td key={month.id}>{month.temperature}</td>
                ))}
              </tr>
              <tr>
                <td>Onset</td>
                {months.map((month) => (
                  <td key={month.id}>{month.onset}</td>
                ))}
              </tr>
              <tr>
                <td>Cessation</td>
                {months.map((month) => (
                  <td key={month.id}>{month.cessation}</td>
                ))}
              </tr>
              <tr>
                <td>Dry spell risk</td>
                {months.map((month) => (
                  <td key={month.id}>
                    <StatusChip
                      label={month.drySpellRisk}
                      tone={
                        month.drySpellRisk === "Moderate" ? "medium" : "low"
                      }
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Flood risk</td>
                {months.map((month) => (
                  <td key={month.id}>
                    <StatusChip
                      label={month.floodRisk}
                      tone={month.floodRisk === "Moderate" ? "medium" : "low"}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Rainy days</td>
                {months.map((month) => (
                  <td key={month.id}>{month.rainyDays}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="gm-check-row">
          <BellRing />
          <span>
            <strong>Receive seasonal change alerts</strong>
            <small>
              Get a Kiswahili SMS when the forecast shifts risk for your crop.
            </small>
          </span>
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onSubscribe}
            disabled={subscribed}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close outlook
        </button>
      </div>
    </Dialog>
  );
}

export function SeasonalRiskDialog({
  open,
  risk,
  onClose,
  onRemind,
}: {
  open: boolean;
  risk: SeasonalRisk | null;
  onClose: () => void;
  onRemind: () => void;
}) {
  if (!risk) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${risk.risk} risk`}
      desc={`${risk.crop} · ${risk.timing} · Kiambu County`}
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <Sprout />
          <span>
            <strong>Risk level</strong>
            <small>{risk.advisory}</small>
          </span>
          <StatusChip
            label={risk.level}
            tone={
              risk.level === "High"
                ? "high"
                : risk.level === "Moderate"
                  ? "medium"
                  : "low"
            }
          />
        </div>
        <div className="gm-card p-3">
          <ReviewRow label="Crop stage" value={risk.timing} />
          <ReviewRow label="Recommended action" value={risk.advisory} />
          <ReviewRow label="Related route" value="Crop tracker + inputs" />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={onRemind}
        >
          Add scouting reminder
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close risk detail
        </button>
      </div>
    </Dialog>
  );
}

export interface PredictionDraft {
  cropPlanId: string;
  county: string;
  location: string;
  plantingDate: string;
  notes: string;
}

export function PredictionWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: PredictionDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PredictionDraft>({
    cropPlanId: "plan-cabbage",
    county: "Kiambu",
    location: "Githunguri",
    plantingDate: "20 Oct 2026",
    notes: "",
  });
  const steps = ["Crop", "Location", "Review"];
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft({
        cropPlanId: "plan-cabbage",
        county: "Kiambu",
        location: "Githunguri",
        plantingDate: "20 Oct 2026",
        notes: "",
      });
    }
  }, [open]);
  const plan =
    CROP_WEATHER_PLANS.find((item) => item.id === draft.cropPlanId) ??
    CROP_WEATHER_PLANS[0];
  const update = <K extends keyof PredictionDraft>(
    key: K,
    value: PredictionDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Generate a crop weather prediction"
      desc="Mavuno na hali ya hewa — build a stage-by-stage outlook for the entire crop duration."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="d-grid gap-3">
          <Field label="Crop and variety">
            <SelectInput
              value={draft.cropPlanId}
              onChange={(value) => update("cropPlanId", value)}
              options={CROP_WEATHER_PLANS.map((item) => ({
                value: item.id,
                label: `${item.crop} · ${item.variety}`,
              }))}
            />
          </Field>
          <div className="gm-check-row">
            <Sprout />
            <span>
              <strong>
                {plan.crop} {plan.variety}
              </strong>
              <small>
                {plan.duration} · existing GrowMO climate template with{" "}
                {plan.periods.length} growth stages.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
          />
        </div>
      ) : step === 1 ? (
        <div className="d-grid gap-3">
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="County">
                <SelectInput
                  value={draft.county}
                  onChange={(value) => update("county", value)}
                  options={[
                    "Kiambu",
                    "Uasin Gishu",
                    "Kakamega",
                    "Nakuru",
                    "Machakos",
                    "Nyandarua",
                  ]}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Ward / location">
                <TextInput
                  value={draft.location}
                  onChange={(value) => update("location", value)}
                  placeholder="Githunguri"
                />
              </Field>
            </div>
          </div>
          <Field label="Planting date">
            <TextInput
              value={draft.plantingDate}
              onChange={(value) => update("plantingDate", value)}
              placeholder="20 Oct 2026"
            />
          </Field>
          <Field label="Farmer note">
            <textarea
              className="gm-input"
              rows={3}
              value={draft.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="Add a soil or water note for this plan"
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={!draft.location || !draft.plantingDate}
          />
        </div>
      ) : (
        <div className="d-grid gap-3">
          <div className="gm-card p-3">
            <ReviewRow label="Crop" value={`${plan.crop} ${plan.variety}`} />
            <ReviewRow
              label="Location"
              value={`${draft.location}, ${draft.county}`}
            />
            <ReviewRow label="Planting date" value={draft.plantingDate} />
            <ReviewRow label="Prediction length" value={plan.duration} />
          </div>
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>Prediction is an advisory</strong>
              <small>
                Compare it with the local station before a high-cost input or
                irrigation decision.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave(draft);
              onClose();
            }}
            finishLabel="Generate prediction"
          />
        </div>
      )}
    </Dialog>
  );
}

export function PredictionPeriodDialog({
  open,
  period,
  onClose,
  onTask,
}: {
  open: boolean;
  period: CropPredictionPeriod | null;
  onClose: () => void;
  onTask: () => void;
}) {
  if (!period) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${period.stage} weather window`}
      desc={`${period.period} · crop-stage advisory`}
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <CloudRain />
          <span>
            <strong>Rain {period.predictedRain}</strong>
            <small>
              {period.predictedTemp} · {period.cropNeed}
            </small>
          </span>
          <StatusChip
            label={period.match}
            tone={
              period.match === "Low" || period.match === "Decreasing"
                ? "medium"
                : "low"
            }
          />
        </div>
        <div className="gm-card p-3">
          <ReviewRow label="Stage" value={period.stage} />
          <ReviewRow label="Forecast match" value={period.match} />
          <ReviewRow label="Advisory" value={period.advisory} />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={onTask}
        >
          Create field task from advisory
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close period
        </button>
      </div>
    </Dialog>
  );
}

export function PlantingWindowDialog({
  open,
  window,
  onClose,
  onUse,
}: {
  open: boolean;
  window: PlantingWindow | null;
  onClose: () => void;
  onUse: () => void;
}) {
  if (!window) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${window.crop} · ${window.county}`}
      desc="Planting window advisor"
    >
      <div className="d-grid gap-3">
        <div className="gm-card p-3">
          <ReviewRow label="Best window" value={window.bestWindow} />
          <ReviewRow label="Good window" value={window.goodWindow} />
          <ReviewRow label="Risky window" value={window.riskyWindow} />
          <ReviewRow label="Avoid" value={window.avoid} />
          <ReviewRow label="Water need" value={window.waterNeed} />
        </div>
        <div className="gm-check-row">
          <Sprout />
          <span>
            <strong>Why this matters</strong>
            <small>{window.reason}</small>
          </span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={onUse}
        >
          Use this window in crop planner
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close window
        </button>
      </div>
    </Dialog>
  );
}

export interface WindowDraft {
  county: string;
  crop: string;
  targetMonth: string;
}
export function WindowAdvisorWizard({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (window: PlantingWindow) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WindowDraft>({
    county: "Kiambu",
    crop: "Cabbage",
    targetMonth: "October",
  });
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft({ county: "Kiambu", crop: "Cabbage", targetMonth: "October" });
    }
  }, [open]);
  const matches = PLANTING_WINDOWS.filter(
    (window) => window.county === draft.county && window.crop === draft.crop,
  );
  const result = matches[0] ?? PLANTING_WINDOWS[0];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Find my planting window"
      desc="Chagua county na crop — GrowMO compares the season pattern before you plant."
    >
      <Stepper steps={["Farm", "Season", "Recommendation"]} current={step} />
      {step === 0 ? (
        <div className="d-grid gap-3">
          <Field label="County">
            <SelectInput
              value={draft.county}
              onChange={(value) =>
                setDraft((current) => ({ ...current, county: value }))
              }
              options={[
                ...new Set(PLANTING_WINDOWS.map((item) => item.county)),
              ]}
            />
          </Field>
          <Field label="Crop">
            <SelectInput
              value={draft.crop}
              onChange={(value) =>
                setDraft((current) => ({ ...current, crop: value }))
              }
              options={[...new Set(PLANTING_WINDOWS.map((item) => item.crop))]}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
          />
        </div>
      ) : step === 1 ? (
        <div className="d-grid gap-3">
          <Field label="When are you considering planting?">
            <SelectInput
              value={draft.targetMonth}
              onChange={(value) =>
                setDraft((current) => ({ ...current, targetMonth: value }))
              }
              options={[
                "January",
                "March",
                "April",
                "June",
                "August",
                "October",
                "November",
              ]}
            />
          </Field>
          <div className="gm-check-row">
            <CloudRain />
            <span>
              <strong>Season context</strong>
              <small>
                We will compare this month to historical rainfall and dry spell
                probability.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="d-grid gap-3">
          <div className="gm-card p-3">
            <ReviewRow
              label="Farm"
              value={`${draft.crop} in ${draft.county}`}
            />
            <ReviewRow label="Target month" value={draft.targetMonth} />
            <ReviewRow label="Best window" value={result.bestWindow} />
            <ReviewRow label="Guidance" value={result.reason} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onApply(result);
              onClose();
            }}
            finishLabel="Use recommendation"
          />
        </div>
      )}
    </Dialog>
  );
}

export function AlertDialog({
  open,
  alert,
  onClose,
  onAcknowledge,
  onPlan,
}: {
  open: boolean;
  alert: ExtremeWeatherAlert | null;
  onClose: () => void;
  onAcknowledge: () => void;
  onPlan: () => void;
}) {
  if (!alert) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${alert.type} · ${alert.county}`}
      desc={`${alert.severity} alert · valid until ${alert.validUntil}`}
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <CloudRain />
          <p>
            <strong>{alert.message}</strong>
            <br />
            Recommended action: {alert.action}.
          </p>
        </div>
        <div className="gm-card p-3">
          <ReviewRow label="Status" value={alert.status} />
          <ReviewRow
            label="Severity"
            value={
              <StatusChip
                label={alert.severity}
                tone={alert.severity === "High" ? "high" : "medium"}
              />
            }
          />
          <ReviewRow label="County" value={alert.county} />
          <ReviewRow label="Details" value={alert.details} />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime flex-grow-1"
            onClick={onPlan}
          >
            Create response task
          </button>
          {alert.status === "Active" ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline flex-grow-1"
              onClick={onAcknowledge}
            >
              Acknowledge alert
            </button>
          ) : (
            <button
              type="button"
              className="gm-btn gm-btn-soft flex-grow-1"
              onClick={onClose}
            >
              Keep acknowledged
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

export interface AlertRuleDraft {
  type: string;
  county: string;
  threshold: string;
  channel: string;
}
export function CreateAlertWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (rule: AlertRuleDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<AlertRuleDraft>({
    type: "Heavy rain",
    county: "Kiambu",
    threshold: "20 mm in 6 hours",
    channel: "SMS + GrowMO",
  });
  useEffect(() => {
    if (open) {
      setStep(0);
      setDraft({
        type: "Heavy rain",
        county: "Kiambu",
        threshold: "20 mm in 6 hours",
        channel: "SMS + GrowMO",
      });
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create a weather alert"
      desc="Get the warning before the weather reaches the field."
    >
      <Stepper steps={["Risk", "Channel", "Review"]} current={step} />
      {step === 0 ? (
        <div className="d-grid gap-3">
          <Field label="Alert type">
            <SelectInput
              value={draft.type}
              onChange={(value) =>
                setDraft((current) => ({ ...current, type: value }))
              }
              options={[
                "Heavy rain",
                "Dry spell",
                "Frost",
                "Wind",
                "Hail",
                "Lightning",
              ]}
            />
          </Field>
          <Field label="County">
            <SelectInput
              value={draft.county}
              onChange={(value) =>
                setDraft((current) => ({ ...current, county: value }))
              }
              options={[
                "Kiambu",
                "Uasin Gishu",
                "Nakuru",
                "Nyandarua",
                "Kakamega",
                "Machakos",
                "Kericho",
              ]}
            />
          </Field>
          <Field label="Trigger">
            <TextInput
              value={draft.threshold}
              onChange={(value) =>
                setDraft((current) => ({ ...current, threshold: value }))
              }
              placeholder="20 mm in 6 hours"
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextDisabled={!draft.threshold}
          />
        </div>
      ) : step === 1 ? (
        <div className="d-grid gap-3">
          <Field label="How should we alert you?">
            <SelectInput
              value={draft.channel}
              onChange={(value) =>
                setDraft((current) => ({ ...current, channel: value }))
              }
              options={["SMS + GrowMO", "GrowMO only", "SMS only"]}
            />
          </Field>
          <div className="gm-check-row">
            <BellRing />
            <span>
              <strong>Kenyan SMS number</strong>
              <small>
                {WEATHER_CONTEXT.phone} · charged only by your mobile provider.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="d-grid gap-3">
          <div className="gm-card p-3">
            <ReviewRow label="Alert" value={draft.type} />
            <ReviewRow label="Area" value={draft.county} />
            <ReviewRow label="Trigger" value={draft.threshold} />
            <ReviewRow label="Channel" value={draft.channel} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave(draft);
              onClose();
            }}
            finishLabel="Save alert"
          />
        </div>
      )}
    </Dialog>
  );
}

export function HistoricalMonthDialog({
  open,
  month,
  onClose,
}: {
  open: boolean;
  month: HistoricalWeatherMonth | null;
  onClose: () => void;
}) {
  if (!month) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${month.month} climate history`}
      desc="Long-term planning baseline for Kiambu County."
    >
      <div className="d-grid gap-3">
        <div className="row g-2">
          <div className="col-6">
            <div className="gm-card p-3">
              <small>Rainfall</small>
              <strong className="font-display">{month.rainfall} mm</strong>
              <span>{month.rainyDays} rainy days</span>
            </div>
          </div>
          <div className="col-6">
            <div className="gm-card p-3">
              <small>Temperature</small>
              <strong className="font-display">
                {month.minTemp}–{month.maxTemp}°C
              </strong>
              <span>typical range</span>
            </div>
          </div>
        </div>
        <div className="gm-check-row">
          <CloudRain />
          <span>
            <strong>Dry spell probability</strong>
            <small>{month.note}</small>
          </span>
          <StatusChip
            label={`${month.drySpellProbability}%`}
            tone={month.drySpellProbability > 55 ? "high" : "medium"}
          />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close history
        </button>
      </div>
    </Dialog>
  );
}

export function HistoryCompareDialog({
  open,
  months,
  onClose,
}: {
  open: boolean;
  months: HistoricalWeatherMonth[];
  onClose: () => void;
}) {
  const [first, setFirst] = useState(months[0]?.id ?? "hist-oct");
  const [second, setSecond] = useState(months[1]?.id ?? "hist-nov");
  const a = months.find((month) => month.id === first) ?? months[0];
  const b = months.find((month) => month.id === second) ?? months[1];
  if (!a || !b) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Compare historical months"
      desc="Use rainfall and dry-spell history to choose a more resilient planting date."
    >
      <div className="d-grid gap-3">
        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Month one">
              <SelectInput
                value={first}
                onChange={setFirst}
                options={months.map((month) => ({
                  value: month.id,
                  label: month.month,
                }))}
              />
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Month two">
              <SelectInput
                value={second}
                onChange={setSecond}
                options={months.map((month) => ({
                  value: month.id,
                  label: month.month,
                }))}
              />
            </Field>
          </div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>{a.month}</th>
                <th>{b.month}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rainfall</td>
                <td>{a.rainfall} mm</td>
                <td>{b.rainfall} mm</td>
              </tr>
              <tr>
                <td>Rainy days</td>
                <td>{a.rainyDays}</td>
                <td>{b.rainyDays}</td>
              </tr>
              <tr>
                <td>Dry spell risk</td>
                <td>{a.drySpellProbability}%</td>
                <td>{b.drySpellProbability}%</td>
              </tr>
              <tr>
                <td>Temperature</td>
                <td>
                  {a.minTemp}–{a.maxTemp}°C
                </td>
                <td>
                  {b.minTemp}–{b.maxTemp}°C
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close comparison
        </button>
      </div>
    </Dialog>
  );
}

export function ReportExportDialog({
  open,
  onClose,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (
    format: "csv" | "txt",
    options: { includeHistory: boolean; includeAlerts: boolean },
  ) => void;
}) {
  const [format, setFormat] = useState<"csv" | "txt">("csv");
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeAlerts, setIncludeAlerts] = useState(true);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export weather report"
      desc="Download a field-ready weather brief for your records or extension officer."
    >
      <div className="d-grid gap-3">
        <Field label="Format">
          <SelectInput
            value={format}
            onChange={(value) => setFormat(value as "csv" | "txt")}
            options={["csv", "txt"]}
          />
        </Field>
        <label className="gm-check-row">
          <input
            type="checkbox"
            checked={includeHistory}
            onChange={(event) => setIncludeHistory(event.target.checked)}
          />
          <span>
            <strong>Historical planning table</strong>
            <small>Include 12-month rainfall and dry spell history.</small>
          </span>
        </label>
        <label className="gm-check-row">
          <input
            type="checkbox"
            checked={includeAlerts}
            onChange={(event) => setIncludeAlerts(event.target.checked)}
          />
          <span>
            <strong>Active alerts</strong>
            <small>Include action instructions and validity.</small>
          </span>
        </label>
        <div className="gm-check-row">
          <FileText />
          <span>
            <strong>Report contents</strong>
            <small>
              Current conditions, forecast, seasonal outlook and crop-stage
              guidance.
            </small>
          </span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={() => {
            onExport(format, { includeHistory, includeAlerts });
            onClose();
          }}
        >
          <Download /> Download weather report
        </button>
      </div>
    </Dialog>
  );
}

export function PreferencesDialog({
  open,
  preferences,
  onClose,
  onSave,
}: {
  open: boolean;
  preferences: WeatherPreferences;
  onClose: () => void;
  onSave: (preferences: WeatherPreferences) => void;
}) {
  const [draft, setDraft] = useState(preferences);
  useEffect(() => {
    if (open) setDraft(preferences);
  }, [open, preferences]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Weather alert settings"
      desc="Choose which warnings matter most to your farm team."
    >
      <div className="d-grid gap-3">
        <Toggle
          checked={draft.rainAlerts}
          onChange={(value) =>
            setDraft((current) => ({ ...current, rainAlerts: value }))
          }
          label="Heavy rain and flood alerts"
          desc="Drainage and livestock safety warnings."
        />
        <Toggle
          checked={draft.frostAlerts}
          onChange={(value) =>
            setDraft((current) => ({ ...current, frostAlerts: value }))
          }
          label="Frost alerts"
          desc="Useful for potatoes, beans and highlands."
        />
        <Toggle
          checked={draft.sprayWindows}
          onChange={(value) =>
            setDraft((current) => ({ ...current, sprayWindows: value }))
          }
          label="Safe spray windows"
          desc="Notify when leaves are dry and wind is safe."
        />
        <Toggle
          checked={draft.irrigationReminders}
          onChange={(value) =>
            setDraft((current) => ({ ...current, irrigationReminders: value }))
          }
          label="Irrigation reminders"
          desc="Use soil moisture and rainfall together."
        />
        <div className="row g-3">
          <div className="col-6">
            <Field label="Temperature">
              <SelectInput
                value={draft.temperatureUnit}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    temperatureUnit: value as "C" | "F",
                  }))
                }
                options={["C", "F"]}
              />
            </Field>
          </div>
          <div className="col-6">
            <Field label="Rainfall">
              <SelectInput
                value={draft.rainfallUnit}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    rainfallUnit: value as "mm" | "in",
                  }))
                }
                options={["mm", "in"]}
              />
            </Field>
          </div>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
        >
          Save alert settings
        </button>
      </div>
    </Dialog>
  );
}

export interface IrrigationPlan {
  crop: string;
  plot: string;
  date: string;
  minutes: number;
  method: string;
}
export function IrrigationWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (plan: IrrigationPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<IrrigationPlan>({
    crop: "Cabbage Gloria F1",
    plot: "Plot 1 · 0.5 acre",
    date: "16 Nov 2026",
    minutes: 20,
    method: "Drip lines",
  });
  useEffect(() => {
    if (open) {
      setStep(0);
      setPlan({
        crop: "Cabbage Gloria F1",
        plot: "Plot 1 · 0.5 acre",
        date: "16 Nov 2026",
        minutes: 20,
        method: "Drip lines",
      });
    }
  }, [open]);
  const update = <K extends keyof IrrigationPlan>(
    key: K,
    value: IrrigationPlan[K],
  ) => setPlan((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Plan irrigation"
      desc="Maji kwa wakati — schedule water only when forecast and soil need agree."
    >
      <Stepper steps={["Crop", "Schedule", "Review"]} current={step} />
      {step === 0 ? (
        <div className="d-grid gap-3">
          <Field label="Crop">
            <SelectInput
              value={plan.crop}
              onChange={(value) => update("crop", value)}
              options={[
                "Cabbage Gloria F1",
                "Tomato Anna F1",
                "Maize H6213",
                "Beans Rosecoco",
              ]}
            />
          </Field>
          <Field label="Plot">
            <TextInput
              value={plan.plot}
              onChange={(value) => update("plot", value)}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
          />
        </div>
      ) : step === 1 ? (
        <div className="d-grid gap-3">
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Date">
                <TextInput
                  value={plan.date}
                  onChange={(value) => update("date", value)}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Minutes">
                <TextInput
                  value={plan.minutes}
                  type="number"
                  onChange={(value) => update("minutes", Number(value) || 0)}
                />
              </Field>
            </div>
          </div>
          <Field label="Method">
            <SelectInput
              value={plan.method}
              onChange={(value) => update("method", value)}
              options={["Drip lines", "Furrow", "Watering cans", "Sprinkler"]}
            />
          </Field>
          <div className="gm-check-row">
            <Droplets />
            <span>
              <strong>Forecast check</strong>
              <small>
                Day 4 has only a 10% rain chance; irrigation is a reasonable
                fallback.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="d-grid gap-3">
          <div className="gm-card p-3">
            <ReviewRow
              label="Crop / plot"
              value={`${plan.crop} · ${plan.plot}`}
            />
            <ReviewRow label="When" value={plan.date} />
            <ReviewRow
              label="Duration"
              value={`${plan.minutes} minutes · ${plan.method}`}
            />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave(plan);
              onClose();
            }}
            finishLabel="Save irrigation plan"
          />
        </div>
      )}
    </Dialog>
  );
}

export interface SprayPlan {
  crop: string;
  product: string;
  date: string;
  note: string;
}
export function SprayWindowWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (plan: SprayPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<SprayPlan>({
    crop: "Cabbage Gloria F1",
    product: "Mancozeb 80 WP",
    date: "15 Nov 2026 · 09:00",
    note: "Spray only after leaves dry; respect PHI 14 days.",
  });
  useEffect(() => {
    if (open) {
      setStep(0);
      setPlan({
        crop: "Cabbage Gloria F1",
        product: "Mancozeb 80 WP",
        date: "15 Nov 2026 · 09:00",
        note: "Spray only after leaves dry; respect PHI 14 days.",
      });
    }
  }, [open]);
  const update = <K extends keyof SprayPlan>(key: K, value: SprayPlan[K]) =>
    setPlan((current) => ({ ...current, [key]: value }));
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Save a spray window"
      desc="Usalama kwanza — weather, wind and pre-harvest interval stay visible."
    >
      <Stepper steps={["Crop", "Window", "Review"]} current={step} />
      {step === 0 ? (
        <div className="d-grid gap-3">
          <Field label="Crop">
            <SelectInput
              value={plan.crop}
              onChange={(value) => update("crop", value)}
              options={["Cabbage Gloria F1", "Tomato Anna F1", "Maize H6213"]}
            />
          </Field>
          <Field label="Product">
            <TextInput
              value={plan.product}
              onChange={(value) => update("product", value)}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
          />
        </div>
      ) : step === 1 ? (
        <div className="d-grid gap-3">
          <Field label="Safe window">
            <TextInput
              value={plan.date}
              onChange={(value) => update("date", value)}
            />
          </Field>
          <Field label="Safety note">
            <textarea
              className="gm-input"
              rows={3}
              value={plan.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
          <div className="gm-check-row">
            <Wind />
            <span>
              <strong>Wind check</strong>
              <small>
                Keep spraying below 15 km/h wind and avoid rain within six
                hours.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="d-grid gap-3">
          <div className="gm-card p-3">
            <ReviewRow label="Crop" value={plan.crop} />
            <ReviewRow label="Product" value={plan.product} />
            <ReviewRow label="Window" value={plan.date} />
            <ReviewRow label="Safety" value={plan.note} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave(plan);
              onClose();
            }}
            finishLabel="Save spray plan"
          />
        </div>
      )}
    </Dialog>
  );
}

export function ShareAdvisoryDialog({
  open,
  title,
  onClose,
  onShare,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onShare: (method: "copy" | "sms" | "download") => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Share this advisory"
      desc="Send a short, useful weather instruction to the farm team."
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <MessageSquare />
          <span>
            <strong>{title}</strong>
            <small>
              Includes forecast timing, crop risk and the recommended action.
            </small>
          </span>
        </div>
        <button
          type="button"
          className="gm-option-row"
          onClick={() => onShare("sms")}
        >
          <MessageSquare />
          <span>
            <strong>Send by SMS</strong>
            <small>Open a message to {WEATHER_CONTEXT.phone}.</small>
          </span>
          <ChevronRight />
        </button>
        <button
          type="button"
          className="gm-option-row"
          onClick={() => onShare("copy")}
        >
          <Copy />
          <span>
            <strong>Copy advisory</strong>
            <small>Copy the text for WhatsApp or a notebook.</small>
          </span>
          <ChevronRight />
        </button>
        <button
          type="button"
          className="gm-option-row"
          onClick={() => onShare("download")}
        >
          <Download />
          <span>
            <strong>Download note</strong>
            <small>Save a text copy on this device.</small>
          </span>
          <ChevronRight />
        </button>
      </div>
    </Dialog>
  );
}

export function ConfirmWeatherDialog({
  open,
  title,
  body,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      desc="Please confirm this weather record change."
    >
      <div className="d-grid gap-3">
        <div className="gm-check-row">
          <ShieldCheck />
          <p>{body}</p>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export { WEATHER_PREFERENCES };
