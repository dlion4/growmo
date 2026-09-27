/* ============================================================================
   PAGE 23 WORKFLOWS — season planning, rotation and soil recovery actions.
   ========================================================================== */
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  Leaf,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sprout,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CalendarPlot,
  CoverCrop,
  FallowTask,
  IntercropPlan,
  ProjectionRow,
} from "../../data/app/seasons";
import { SEASON_CONTEXT } from "../../data/app/seasons";
import { Dialog, Stepper, Toggle } from "../auth/controls";
import { WizardActions } from "./DashboardWidgets";

export type SeasonsModalId =
  | "calendar-detail"
  | "new-plan"
  | "edit-plan"
  | "add-plot-cycle"
  | "calendar-settings"
  | "season-reminder"
  | "rotation-detail"
  | "generate-rotation"
  | "edit-rotation"
  | "change-rotation-crop"
  | "approve-rotation"
  | "rotation-rules"
  | "benefit-detail"
  | "financial-assumptions"
  | "financial-scenario"
  | "export-projection"
  | "season-compare"
  | "compare-crop"
  | "save-comparison"
  | "cover-crop-detail"
  | "create-cover-plan"
  | "fallow-task-detail"
  | "complete-fallow-task"
  | "reschedule-fallow-task"
  | "intercrop-detail"
  | "create-intercrop"
  | "compatibility-check"
  | "climate-outlook"
  | "el-nino-plan"
  | "la-nina-plan"
  | "weather-alerts"
  | "share-plan"
  | "export-calendar"
  | "archive-plan"
  | null;

type FlowKind = "wizard" | "confirm" | "detail";
type FlowMeta = {
  title: string;
  desc: string;
  kind: FlowKind;
  success: string;
  steps?: string[];
};

const FLOWS: Record<Exclude<SeasonsModalId, null>, FlowMeta> = {
  "calendar-detail": {
    title: "Plot calendar detail",
    desc: "Review the crop sequence, rest period and farm actions assigned to this plot.",
    kind: "detail",
    success: "Plot calendar reviewed",
  },
  "new-plan": {
    title: "Create season plan",
    desc: "Start a practical plan with crop, plot, season timing and expected market window.",
    kind: "wizard",
    success: "Season plan added to the calendar",
    steps: ["Plot", "Crop & season", "Review"],
  },
  "edit-plan": {
    title: "Edit season plan",
    desc: "Keep the crop plan aligned with soil readiness, labour and market timing.",
    kind: "wizard",
    success: "Season plan updated",
    steps: ["Plan", "Dates", "Save"],
  },
  "add-plot-cycle": {
    title: "Add plot cycle",
    desc: "Add a crop, fallow or cover-crop phase without disrupting the longer rotation record.",
    kind: "wizard",
    success: "Plot cycle added to the calendar",
    steps: ["Plot", "Cycle", "Confirm"],
  },
  "calendar-settings": {
    title: "Calendar settings",
    desc: "Set the farm year, preferred rain-season labels and visible planning horizon.",
    kind: "wizard",
    success: "Calendar settings saved",
    steps: ["Horizon", "Visibility", "Save"],
  },
  "season-reminder": {
    title: "Schedule season reminder",
    desc: "Prepare a GrowMO reminder before an important planting, soil or harvest window.",
    kind: "wizard",
    success: "Season reminder scheduled",
    steps: ["Milestone", "Timing", "Confirm"],
  },
  "rotation-detail": {
    title: "AI rotation detail",
    desc: "Trace the crop-family, soil-nutrition and disease-break decisions behind this sequence.",
    kind: "detail",
    success: "Rotation detail reviewed",
  },
  "generate-rotation": {
    title: "Generate soil-first rotation",
    desc: "Build a three-year rotation using your Kiambu soil profile, crop history and desired market crops.",
    kind: "wizard",
    success: "AI rotation draft generated",
    steps: ["Plot history", "Priorities", "Generate"],
  },
  "edit-rotation": {
    title: "Edit rotation sequence",
    desc: "Adjust crop order while GrowMO rechecks family, nitrogen and soil-rest rules.",
    kind: "wizard",
    success: "Rotation sequence updated",
    steps: ["Sequence", "Soil check", "Save"],
  },
  "change-rotation-crop": {
    title: "Change a rotation crop",
    desc: "Replace a planned crop and see the new family and nutrient-balance impact before saving.",
    kind: "wizard",
    success: "Rotation crop changed and rechecked",
    steps: ["Crop", "Impact", "Confirm"],
  },
  "approve-rotation": {
    title: "Approve this rotation?",
    desc: "Approval locks the current sequence as the farm baseline while preserving editable scenario history.",
    kind: "confirm",
    success: "Three-year rotation approved",
  },
  "rotation-rules": {
    title: "Rotation rule evidence",
    desc: "Review the family, soil, rest-period and pest-break rules applied to Plot 1.",
    kind: "detail",
    success: "Rotation rules reviewed",
  },
  "benefit-detail": {
    title: "Rotation benefit estimate",
    desc: "See how the soil and input-saving estimate is calculated for this plan.",
    kind: "detail",
    success: "Benefit estimate reviewed",
  },
  "financial-assumptions": {
    title: "Edit projection assumptions",
    desc: "Tune expected yield, price, input cost and loss rate before comparing seasons.",
    kind: "wizard",
    success: "Financial assumptions updated",
    steps: ["Yield", "Market price", "Review"],
  },
  "financial-scenario": {
    title: "Create financial scenario",
    desc: "Model a conservative, expected or strong-market crop scenario alongside the approved plan.",
    kind: "wizard",
    success: "Financial scenario saved",
    steps: ["Scenario", "Assumptions", "Save"],
  },
  "export-projection": {
    title: "Export multi-season projection",
    desc: "Prepare a clean financial plan for your farm records, lender or cooperative advisor.",
    kind: "wizard",
    success: "Projection export prepared",
    steps: ["Report", "Columns", "Export"],
  },
  "season-compare": {
    title: "Season comparison detail",
    desc: "Read the yield, price, cost and weather trade-offs for cabbage in each production window.",
    kind: "detail",
    success: "Season comparison reviewed",
  },
  "compare-crop": {
    title: "Compare another crop",
    desc: "Put a realistic Kiambu crop beside cabbage before committing it to the rotation.",
    kind: "wizard",
    success: "Crop comparison added",
    steps: ["Crop", "Season", "Compare"],
  },
  "save-comparison": {
    title: "Save seasonal decision",
    desc: "Turn the comparison into a dated planning note that remains with the farm record.",
    kind: "wizard",
    success: "Seasonal decision saved",
    steps: ["Decision", "Reason", "Save"],
  },
  "cover-crop-detail": {
    title: "Cover-crop profile",
    desc: "Review establishment, biomass and nitrogen benefits before placing it in the fallow period.",
    kind: "detail",
    success: "Cover-crop profile reviewed",
  },
  "create-cover-plan": {
    title: "Create cover-crop plan",
    desc: "Schedule seed, lime, manure and incorporation tasks for a protected dry-season recovery window.",
    kind: "wizard",
    success: "Cover-crop plan added",
    steps: ["Cover crop", "Field work", "Schedule"],
  },
  "fallow-task-detail": {
    title: "Fallow task detail",
    desc: "Check the timing, owner and field conditions for this soil-recovery task.",
    kind: "detail",
    success: "Fallow task reviewed",
  },
  "complete-fallow-task": {
    title: "Mark fallow task complete?",
    desc: "GrowMO will retain the completion time in the soil-recovery record and reveal the next task.",
    kind: "confirm",
    success: "Fallow task marked complete",
  },
  "reschedule-fallow-task": {
    title: "Reschedule fallow task",
    desc: "Move the field task while retaining a clear reason for your soil and labour records.",
    kind: "wizard",
    success: "Fallow task rescheduled",
    steps: ["Timing", "Reason", "Confirm"],
  },
  "intercrop-detail": {
    title: "Intercrop plan detail",
    desc: "Review spacing, crop compatibility, harvest timing and the practical benefit of this pairing.",
    kind: "detail",
    success: "Intercrop plan reviewed",
  },
  "create-intercrop": {
    title: "Create intercrop plan",
    desc: "Choose a compatible crop pair, spacing pattern and target plot for the next farm window.",
    kind: "wizard",
    success: "Intercrop plan created",
    steps: ["Crop pair", "Spacing", "Save"],
  },
  "compatibility-check": {
    title: "Run compatibility check",
    desc: "Check crop families, canopy, root depth, water use and harvest timing before intercropping.",
    kind: "wizard",
    success: "Compatibility check completed",
    steps: ["Crop pair", "Field context", "Result"],
  },
  "climate-outlook": {
    title: "Long-range climate outlook",
    desc: "Turn the current seasonal signal into practical crop, drainage and water-planning choices.",
    kind: "detail",
    success: "Climate outlook reviewed",
  },
  "el-nino-plan": {
    title: "Prepare El Niño adaptation plan",
    desc: "Schedule drainage, crop choice and disease-prevention actions for enhanced-rainfall conditions.",
    kind: "wizard",
    success: "El Niño adaptation plan saved",
    steps: ["Exposure", "Actions", "Save"],
  },
  "la-nina-plan": {
    title: "Prepare La Niña contingency",
    desc: "Prepare earlier planting, drought-tolerant crops and water actions for a suppressed-rainfall season.",
    kind: "wizard",
    success: "La Niña contingency saved",
    steps: ["Water", "Crops", "Save"],
  },
  "weather-alerts": {
    title: "Season planning alerts",
    desc: "Choose which rain, drought, pest and soil-window signals GrowMO should put into your farm plan.",
    kind: "wizard",
    success: "Planning alerts updated",
    steps: ["Signals", "Timing", "Save"],
  },
  "share-plan": {
    title: "Share season plan",
    desc: "Prepare a read-only planning summary for a farm manager, adviser or cooperative officer.",
    kind: "wizard",
    success: "Season plan share prepared",
    steps: ["Recipient", "Access", "Share"],
  },
  "export-calendar": {
    title: "Export annual farm calendar",
    desc: "Prepare a printable twelve-month crop, rest and field-action schedule.",
    kind: "wizard",
    success: "Calendar export prepared",
    steps: ["Year", "Detail", "Export"],
  },
  "archive-plan": {
    title: "Archive this season plan?",
    desc: "The plan will leave the active calendar but stay in your farm planning history for reference.",
    kind: "confirm",
    success: "Season plan archived",
  },
};

type Props = {
  active: SeasonsModalId;
  plot?: CalendarPlot | null;
  coverCrop?: CoverCrop | null;
  fallowTask?: FallowTask | null;
  intercrop?: IntercropPlan | null;
  projection?: ProjectionRow | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="gm-field">
      <span className="gm-field-label">{label}</span>
      {children}
    </div>
  );
}

function downloadCalendar() {
  const text = [
    "GROWMO MULTI-SEASON FARM CALENDAR",
    `${SEASON_CONTEXT.farm} · ${SEASON_CONTEXT.ward}, ${SEASON_CONTEXT.county}`,
    "Planning horizon: 2027–2029",
    "Plot 1: cabbage → beans → cover crop → tomato/cabbage rotation",
    "Prepared with GrowMO Multi-Season Planning",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "marys-farm-multi-season-calendar.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function SeasonsModalHub({
  active,
  plot,
  coverCrop,
  fallowTask,
  intercrop,
  projection,
  onClose,
  onSaved,
}: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(true);
  const meta = active ? FLOWS[active] : null;

  useEffect(() => {
    if (active) {
      setStep(0);
      setBusy(false);
      setNotify(true);
    }
  }, [active]);

  if (!active || !meta) return null;

  const selectedName =
    plot?.plot ??
    coverCrop?.name ??
    fallowTask?.action ??
    intercrop?.main ??
    projection?.crop ??
    "Plot 1 rotation";
  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSaved(meta.success);
      onClose();
    }, 420);
  };

  const rows =
    active === "calendar-detail"
      ? [
          ["Plot", plot?.plot ?? "Plot 1 · Lower field"],
          ["Soil profile", plot?.soil ?? "Clay loam · pH 5.8"],
          ["Current crop", plot?.currentCrop ?? "Cabbage Gloria F1"],
          ["Next recovery phase", "Rosecoco beans, then Lablab cover crop"],
          ["Planning rule", "No consecutive brassica crop family"],
        ]
      : active === "cover-crop-detail"
        ? [
            [
              "Cover crop",
              `${coverCrop?.name ?? "Lablab"} · ${coverCrop?.botanical ?? "Lablab purpureus"}`,
            ],
            ["Seeding rate", coverCrop?.seedingRate ?? "10 kg/acre"],
            [
              "Cost",
              coverCrop
                ? `KES ${coverCrop.cost.toLocaleString("en-KE")}/acre`
                : "KES 3,000/acre",
            ],
            [
              "Primary purpose",
              coverCrop?.purpose ??
                "Nitrogen fixation, biomass and weed suppression",
            ],
            [
              "Expected benefit",
              coverCrop?.benefit ?? "Fixes 50–100 kg N/acre",
            ],
          ]
        : active === "intercrop-detail"
          ? [
              ["Main crop", intercrop?.main ?? "H6213 maize"],
              ["Companion crop", intercrop?.intercrop ?? "Rosecoco beans"],
              ["Spacing", intercrop?.spacing ?? "1 row maize : 1 row beans"],
              [
                "Benefit",
                intercrop?.benefit ??
                  "Beans fix nitrogen and add a second income",
              ],
              ["Target plot", intercrop?.plot ?? "Plot 2"],
            ]
          : active === "season-compare"
            ? [
                [
                  "Best overall window",
                  "Short rains · expected profit KES 378,300/acre",
                ],
                [
                  "Long-rains trade-off",
                  "Very good rain reliability, lower June market price",
                ],
                [
                  "Irrigated option",
                  "Strong September price where water is secured",
                ],
                ["Crop", "Cabbage Gloria F1"],
              ]
            : active === "climate-outlook"
              ? [
                  ["Farm location", "Githunguri, Kiambu · LH2 highland"],
                  [
                    "Current planning posture",
                    "Protect drainage and preserve a drought alternative",
                  ],
                  [
                    "El Niño response",
                    "Drainage, disease prevention and less tomato in wet beds",
                  ],
                  [
                    "La Niña response",
                    "Earlier planting, water storage and drought-tolerant fallback",
                  ],
                ]
              : [
                  ["Selected plan", selectedName],
                  ["Farm", `${SEASON_CONTEXT.farm} · ${SEASON_CONTEXT.county}`],
                  ["Planning horizon", "2027–2029"],
                  [
                    "Rotation score",
                    `${SEASON_CONTEXT.rotationScore}/100 · soil-first`,
                  ],
                ];

  if (meta.kind === "detail") {
    const downloadable =
      active === "calendar-detail" || active === "season-compare";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
        <div className="gm-check-list">
          {rows.map(([label, value]) => (
            <div className="gm-check-row" key={label}>
              <BadgeCheck />
              <span>
                <strong>{label}</strong>
                <small>{value}</small>
              </span>
            </div>
          ))}
        </div>
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <ShieldCheck />
          </span>
          <div>
            <strong>Planning stays connected to the farm record</strong>
            <p className="mb-0 text-muted">
              Changes in crops, soil recovery and weather response remain
              visible in the multi-season timeline.
            </p>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          {downloadable ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                downloadCalendar();
                onSaved("Planning document download prepared");
                onClose();
              }}
            >
              <Download /> Download summary
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }

  if (meta.kind === "confirm") {
    const destructive = active === "archive-plan";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-check-row">
          <span className="gm-mega-icon">
            {destructive ? <Trash2 /> : <CheckCircle2 />}
          </span>
          <span>
            <strong>{selectedName}</strong>
            <small>
              {destructive
                ? "Historical yields and plan decisions stay preserved for future rotation planning."
                : "The approved sequence becomes the farm’s working rotation and can still be revised with a new scenario."}
            </small>
          </span>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Keep editing
          </button>
          <button
            type="button"
            className={
              destructive ? "gm-btn gm-btn-danger-soft" : "gm-btn gm-btn-lime"
            }
            disabled={busy}
            onClick={finish}
          >
            {busy ? (
              <LoaderCircle className="gm-spinner" />
            ) : destructive ? (
              "Archive plan"
            ) : active === "complete-fallow-task" ? (
              "Mark complete"
            ) : (
              "Approve rotation"
            )}
          </button>
        </div>
      </Dialog>
    );
  }

  const steps = meta.steps ?? [];
  const isWeather = ["weather-alerts", "el-nino-plan", "la-nina-plan"].includes(
    active,
  );
  const isShare =
    active === "share-plan" ||
    active === "export-calendar" ||
    active === "export-projection";
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} onStep={setStep} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <Field
              label={
                isWeather
                  ? "Planning context"
                  : isShare
                    ? "Planning record"
                    : "Plot or selected item"
              }
            >
              <select className="gm-select" defaultValue={selectedName}>
                <option>{selectedName}</option>
                <option>Plot 1 · Lower field · 0.52 acres</option>
                <option>Plot 2 · Upper slope · 2.0 acres</option>
                <option>Plot 3 · Kitchen edge · 0.3 acres</option>
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label={isWeather ? "Season" : "Reference"}>
              <input
                className="gm-input"
                defaultValue={
                  isWeather
                    ? "Short rains · October–January"
                    : "GrowMO plan 2027–2029"
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label={isWeather ? "Farm action" : "Planning note"}>
              <textarea
                className="gm-input"
                rows={3}
                defaultValue={
                  isWeather
                    ? "Use this plan to guide crop choice, soil work and timely preparation in Githunguri."
                    : "Keep the crop sequence practical for soil health, labour availability and the target market window."
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label={
                isShare
                  ? "Keep an export record"
                  : "Notify Mary before the next milestone"
              }
              desc={
                isShare
                  ? "GrowMO will retain this prepared document in the planning timeline."
                  : "A practical reminder will appear before the scheduled field action."
              }
            />
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-check-list mt-3">
          <div className="gm-check-row">
            <Sprout />
            <span>
              <strong>Soil-first plan check</strong>
              <small>
                The crop sequence includes a legume, a managed rest period and a
                pest-break between brassica crops.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <CalendarDays />
            <span>
              <strong>Season window check</strong>
              <small>
                Dates are tuned to Kiambu short rains, long rains and the
                dry-season soil-recovery interval.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <Leaf />
            <span>
              <strong>Farm record check</strong>
              <small>
                The decision will remain connected to plot history and future
                financial projections.
              </small>
            </span>
          </div>
        </div>
      ) : (
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <Send />
          </span>
          <div>
            <strong>Ready to record</strong>
            <p className="mb-0 text-muted">
              Review the plan once more, then GrowMO will keep the dated action
              in the multi-season farm record.
            </p>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((value) => Math.max(0, value - 1))}
        onNext={() =>
          step === steps.length - 1 ? finish() : setStep((value) => value + 1)
        }
        finishLabel={isShare ? "Prepare document" : "Confirm & save"}
        nextDisabled={busy}
      />
    </Dialog>
  );
}
