/* ============================================================================
   PAGE 17 — SOIL HEALTH & TESTING MANAGEMENT  (/app/soil)

   Blueprint sections implemented:
   17.1 soil test scheduler          17.2 soil test results dashboard
   17.3 AI fertilizer recommendation 17.4 test history & trend analysis
   17.5 soil sampling instructions   17.6 lab directory (Kenya)
   17.7 soil health improvement plan 17.8 soil moisture monitoring
   Plus a records tab: lab orders and receipts, plot drill-down drawer,
   amendments, compost batches and a 24-dialog workflow layer.

   The page keeps a working soil file in local state: booked tests change the
   plot status, lime and manure applications are logged, the fertilizer
   programme is ticked off line by line, moisture readings are entered, sensors
   are installed, orders are settled by M-Pesa and results are shared under
   time-limited access codes.
   ========================================================================== */
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  HelpCircle,
  Layers,
  LayoutGrid,
  Leaf,
  MoreHorizontal,
  Mountain,
  Package,
  Plus,
  Printer,
  Search,
  Settings2,
  Share2,
  Sprout,
  Sun,
  Table2,
  Thermometer,
  Timer,
  TrendingUp,
  Truck,
  Wifi,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  CompostRow,
  LabCard,
  LimeRateRowView,
  MoistureBalanceChart,
  MoistureMethodCard,
  MoistureWeekRow,
  NpkBarChart,
  ParameterMeter,
  ParameterRow,
  PracticeCard,
  ProgramStepRow,
  SamplingStepCard,
  ScoreTrendChart,
  SensorRow,
  SkippedInputRow,
  SoilCallout,
  SoilHero,
  SoilKv,
  SoilOrderRow,
  SoilPartnerCard,
  SoilPlotCard,
  SoilPlotRow,
  TrendLineChart,
  type SoilKpi,
} from "../../components/app/SoilWidgets";
import {
  AmendmentLogDialog,
  BookTestWizard,
  CompareTestsDialog,
  CompostBatchDialog,
  CompostBatchWizard,
  ConfirmSoilDialog,
  FertilizerProgramDialog,
  HistoryDetailDialog,
  InputOrderWizard,
  IrrigationPlanDialog,
  LabDetailDialog,
  LimeOrderDialog,
  MoistureLogDialog,
  OrderDetailDialog,
  ParameterDialog,
  PracticePlanDialog,
  ProductDetailDialog,
  SamplingGuideDialog,
  ScoreBreakdownDialog,
  SensorWizard,
  SkipReasonDialog,
  SoilContactDialog,
  SoilExportDialog,
  SoilFaqDialog,
  SoilSettingsDialog,
  SoilShareDialog,
  TrendPointDialog,
  type TrendPoint,
} from "../../components/app/SoilModals";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  COMPOST_BATCHES,
  FEEL_METHOD_SCALE,
  FERTILIZER_PROGRAM,
  LIME_RATE_TABLE,
  SAMPLING_KIT,
  SAMPLING_STEPS,
  SKIPPED_INPUTS,
  SOIL_ACTIVITY,
  SOIL_ALERTS,
  SOIL_CONTEXT,
  SOIL_FAQ,
  SOIL_GLOSSARY,
  SOIL_HISTORY,
  SOIL_LABS,
  SOIL_ORDERS,
  SOIL_PARAMETERS,
  SOIL_PLOTS,
  SOIL_PRACTICES,
  SOIL_PRODUCTS,
  SOIL_SCORE_COMPONENTS,
  SOIL_SCORE_HISTORY,
  SOIL_SENSORS,
  SOIL_TEST_TYPES,
  MOISTURE_METHODS,
  MOISTURE_WEEKS,
  soilTotals,
} from "../../data/app/soil";
import type {
  CompostBatch,
  FertilizerStep,
  MoistureWeek,
  SoilLab,
  SoilOrder,
  SoilParameter,
  SoilPlot,
  SoilPractice,
  SoilProduct,
  SoilSensor,
  SoilHistoryRow,
  ScoreComponent,
  SkippedInput,
} from "../../data/app/soil";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

type SoilView =
  | "scheduler"
  | "results"
  | "program"
  | "history"
  | "sampling"
  | "labs"
  | "plan"
  | "moisture"
  | "records";

type ModalId =
  | "book"
  | "lime"
  | "sampling"
  | "lab"
  | "lab-contact"
  | "parameter"
  | "score"
  | "history"
  | "compare"
  | "point"
  | "program"
  | "product"
  | "skip"
  | "amendment"
  | "compost-new"
  | "compost-batch"
  | "practice"
  | "moisture-log"
  | "irrigation"
  | "sensor"
  | "order"
  | "inputs"
  | "share"
  | "export"
  | "settings"
  | "faq"
  | "confirm-pause"
  | null;

type DrawerId = "plot" | "activity" | null;

type PlanAction = {
  id: string;
  label: string;
  detail: string;
  source: string;
};

type AppliedAmendment = {
  id: string;
  amendment: string;
  plot: string;
  quantity: string;
  cost: number;
  date: string;
};

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export const Route = createFileRoute("/app/soil")({
  component: SoilPage,
});

/* ============================== 17.1 scheduler ========================== */

function SchedulerSection({
  plots,
  onOpenPlot,
  onBook,
  onLime,
  onGuide,
  onAlert,
  onOpenLabs,
  onOpenRecords,
}: {
  plots: SoilPlot[];
  onOpenPlot: (plot: SoilPlot) => void;
  onBook: (plot?: SoilPlot) => void;
  onLime: (plot: SoilPlot) => void;
  onGuide: (plot: SoilPlot) => void;
  onAlert: (target: string) => void;
  onOpenLabs: () => void;
  onOpenRecords: () => void;
}) {
  const [tab, setTab] = useState<"cards" | "table" | "types">("cards");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All plots");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plots.filter((plot) => {
      const matches =
        needle.length === 0 ||
        plot.name.toLowerCase().includes(needle) ||
        plot.crop.toLowerCase().includes(needle) ||
        plot.texture.toLowerCase().includes(needle) ||
        plot.zone.toLowerCase().includes(needle);
      const statusMatch = status === "All plots" || plot.status === status;
      return matches && statusMatch;
    });
  }, [plots, query, status]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.1 · Soil test scheduler"
        title="Book the right test, on the right plot, at the right time"
        subtitle="Each plot runs its own testing cycle. Plot 5 has never been tested and Plot 8 is due before the January beans."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onOpenLabs}>
              <FlaskConical /> Lab directory
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onBook()}>
              <Plus /> Schedule a test
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="Scheduler views"
          value={tab}
          onChange={setTab}
          items={[
            { id: "cards", label: "Plot cards", icon: <LayoutGrid />, count: plots.length },
            { id: "table", label: "Test plan table", icon: <Table2 />, count: plots.length },
            { id: "types", label: "Test types & costs", icon: <FlaskConical />, count: SOIL_TEST_TYPES.length },
          ]}
        />
      </div>

      <div className="d-flex flex-column gap-3">
        {SOIL_ALERTS.slice(0, 3).map((alert) => (
          <div className={`gm-soil-callout tone-${alert.tone === "low" ? "good" : "warn"}`} key={alert.id}>
            {alert.tone === "low" ? <CheckCircle2 /> : <AlertTriangle />}
            <span style={{ flex: 1 }}>
              <strong>{alert.title}</strong>
              <small>{alert.body}</small>
            </span>
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={() => onAlert(alert.actionTarget)}
            >
              {alert.action}
            </button>
          </div>
        ))}
      </div>

      {tab === "types" ? (
        <div className="gm-card p-3 mt-3">
          <DashboardSectionHeader
            eyebrow="What a test costs"
            title="Three levels of soil testing"
            subtitle="Basic answers the NPK question; comprehensive adds the calcium, magnesium, sulphur and micronutrients that decide the last 20% of yield."
            action={
              <span className="gm-chip gm-chip-ghost">
                <Timer /> 5 – 28 days depending on the lab
              </span>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Test type</th>
                  <th>Parameters</th>
                  <th>Turnaround</th>
                  <th>Basic cost</th>
                  <th>Comprehensive cost</th>
                  <th>Best for</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {SOIL_TEST_TYPES.map((type) => (
                  <tr key={type.id}>
                    <td>
                      <strong>{type.label}</strong>
                      <small className="d-block text-muted">{type.swahili}</small>
                    </td>
                    <td>{type.parameters}</td>
                    <td>{type.turnaround}</td>
                    <td className="font-display">
                      {type.costBasic === 0 ? "—" : kes(type.costBasic)}
                    </td>
                    <td className="font-display">
                      {type.costComprehensive === 0 ? "—" : kes(type.costComprehensive)}
                    </td>
                    <td>{type.bestFor}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onBook()}
                      >
                        Book {type.label.toLowerCase()}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-soil-feature-grid mt-3">
            <SoilPartnerCard
              icon={FlaskConical}
              title="KALRO Kabete sample desk"
              body="Samples accepted to 4 pm on weekdays; results in 7 – 14 days with a fertiliser programme attached."
              meta={`Reference ${SOIL_CONTEXT.labRef} · last visit ${SOIL_CONTEXT.lastTest}`}
              action="See every lab"
              onAction={onOpenLabs}
            />
            <SoilPartnerCard
              icon={Coins}
              title="Test costs are in your records"
              body="Every lab payment is written into the input records and shows up in the finance page as a soil line."
              meta={`${SOIL_ORDERS.length} lab transactions on file`}
              action="Open the records tab"
              onAction={onOpenRecords}
            />
            <SoilPartnerCard
              icon={CalendarDays}
              title="Annual cycle per plot"
              body="GrowMO reminds you 60 days before the due date so the sample can be taken before land preparation."
              meta={`Next reminder: ${SOIL_CONTEXT.nextTest}`}
              action="Adjust reminders"
              onAction={() => onAlert("settings")}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="gm-soil-toolbar mt-3">
            <div className="gm-soil-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search plots by name, crop, texture or zone"
                aria-label="Search plots"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            {["All plots", "Current", "Due soon", "Overdue"].map((item) => (
              <button
                type="button"
                key={item}
                className={`gm-filter-chip ${status === item ? "is-active" : ""}`}
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
            <span className="gm-soil-count">
              {matched.length} of {plots.length} plots
            </span>
          </div>

          {tab === "cards" ? (
            <>
              {shown.length === 0 ? (
                <div className="gm-empty">
                  <span className="gm-service-icon">
                    <FlaskConical />
                  </span>
                  <h3 className="font-display">No plot matches “{query || status}”</h3>
                  <p className="text-muted">
                    Clear the search box or switch back to “All plots” to see the ten plots on the
                    farm.
                  </p>
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft"
                    onClick={() => {
                      setQuery("");
                      setStatus("All plots");
                      setPage(1);
                    }}
                  >
                    <Search /> Show every plot
                  </button>
                </div>
              ) : (
                <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
                  {shown.map((plot) => (
                    <SoilPlotCard
                      key={plot.id}
                      plot={plot}
                      onOpen={() => onOpenPlot(plot)}
                      onBookTest={() => onBook(plot)}
                    />
                  ))}
                </div>
              )}
              <div className="gm-card p-2 mt-3">
                <Pagination
                  page={current}
                  total={pages}
                  onChange={setPage}
                  perPage={perPage}
                  totalItems={matched.length}
                />
              </div>
            </>
          ) : (
            <div className="gm-card p-3">
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Plot</th>
                      <th>Crop</th>
                      <th>Texture</th>
                      <th>pH</th>
                      <th>OM</th>
                      <th>Last test</th>
                      <th>Next test</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.length === 0 ? (
                      <tr>
                        <td colSpan={9}>
                          <span className="text-muted">
                            No plot matches the current search or status filter — clear the search to
                            see all {plots.length} plots.
                          </span>
                        </td>
                      </tr>
                    ) : (
                      matched.map((plot) => (
                        <SoilPlotRow
                          key={plot.id}
                          plot={plot}
                          onOpen={() => onOpenPlot(plot)}
                          onBookTest={() => onBook(plot)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  disabled={matched.length === 0}
                  onClick={() => onLime(matched[0] ?? plots[0])}
                >
                  <Mountain /> Plan the lime application
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  disabled={matched.length === 0}
                  onClick={() => onGuide(matched[0] ?? plots[0])}
                >
                  <ClipboardCheck /> Sampling instructions
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Reveal>
  );
}

/* =============================== 17.2 results =========================== */

function ResultsSection({
  parameters,
  activePlot,
  onOpenParameter,
  onFix,
  onScore,
  onShare,
  onGoProgram,
}: {
  parameters: SoilParameter[];
  activePlot: SoilPlot;
  onOpenParameter: (parameter: SoilParameter) => void;
  onFix: (parameter: SoilParameter) => void;
  onScore: () => void;
  onShare: () => void;
  onGoProgram: () => void;
}) {
  const [tab, setTab] = useState<"table" | "meters" | "gaps">("table");
  const [filter, setFilter] = useState("All parameters");

  const critical = parameters.filter(
    (parameter) => parameter.status === "Low" || parameter.status === "Slightly low",
  );
  const optimal = parameters.filter(
    (parameter) => parameter.status === "Optimal" || parameter.status === "Adequate",
  );
  const shown = filter === "All parameters" ? parameters : critical;

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.2 · Soil test results dashboard"
        title="Fifteen parameters, one plain-language recommendation each"
        subtitle={`${SOIL_CONTEXT.lab} · reference ${SOIL_CONTEXT.labRef} · sampled 16 Sep 2026 · ${activePlot.name} cabbage (Gloria F1)`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onShare}>
              <Share2 /> Share results
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onGoProgram}>
              <Sprout /> Fertilizer plan
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={FlaskConical}
          label="Parameters tested"
          value={String(parameters.length)}
          note="Comprehensive panel: pH, NPK, Ca, Mg, S, Zn, B, Cu, Fe, Mn, CEC, texture"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Below optimum"
          value={String(critical.length)}
          note="pH, nitrogen, sulphur, zinc and boron need action this season"
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Adequate or optimal"
          value={String(optimal.length)}
          note="Potassium, copper, iron, manganese and magnesium need no spending"
        />
        <DashboardMetric
          icon={Coins}
          label="Saved by skipping"
          value={kes(soilTotals().saved)}
          note="MOP, extra TSP and copper foliar are not needed"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Result views"
          value={tab}
          onChange={setTab}
          items={[
            { id: "table", label: "Full table", icon: <Table2 />, count: parameters.length },
            { id: "meters", label: "Against optimum", icon: <Gauge />, count: parameters.length },
            { id: "gaps", label: "Gaps to fix", icon: <AlertTriangle />, count: critical.length },
          ]}
        />
      </div>

      {tab === "table" ? (
        <div className="gm-card p-3">
          <div className="gm-soil-toolbar">
            {["All parameters", "Below optimum only"].map((item) => (
              <button
                type="button"
                key={item}
                className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
            <span className="gm-soil-count">{shown.length} parameters shown</span>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Parameter & method</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Optimal range (cabbage)</th>
                  <th>Recommendation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((parameter) => (
                  <ParameterRow
                    key={parameter.id}
                    parameter={parameter}
                    onOpen={() => onOpenParameter(parameter)}
                    onAction={() =>
                      parameter.actionTarget === "none" ? onOpenParameter(parameter) : onFix(parameter)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
          <small className="d-block mt-2 text-muted">
            Analysis methods are recorded so an auditor can see exactly how each number was produced.
          </small>
        </div>
      ) : tab === "meters" ? (
        <>
          <div className="gm-soil-feature-grid">
            {parameters.map((parameter) => (
              <ParameterMeter
                key={parameter.id}
                parameter={parameter}
                onOpen={() => onOpenParameter(parameter)}
              />
            ))}
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Reading the meters"
              title="Where each parameter sits against the optimum band"
              subtitle="The green band is the optimal range for cabbage. The dot is the farm reading — tap any meter for the full interpretation."
              action={
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onScore}>
                  <TrendingUp /> Explain the soil score
                </button>
              }
            />
            <SoilCallout
              title="Three numbers matter most this season"
              body="pH 5.8 is limiting phosphorus availability, nitrogen at 15 ppm is the yield limit, and zinc and boron are both just below optimum — two cheap foliar corrections."
            />
          </div>
        </>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Gaps to fix"
            title="Five parameters need action before planting"
            subtitle="Everything else is adequate, which is why the programme skips MOP, extra TSP and copper."
            action={
              <span className="gm-chip gm-chip-gold">
                <Coins /> Total correction cost from{" "}
                {kes(critical.reduce((total, parameter) => total + parameter.actionCost, 0))}
              </span>
            }
          />
          {critical.map((parameter) => (
            <div className="gm-check-row gm-soil-skip" key={parameter.id}>
              <span className="gm-soil-skip-icon">
                <AlertTriangle />
              </span>
              <span style={{ flex: 1 }}>
                <strong>
                  {parameter.parameter} · {parameter.display} ({parameter.status})
                </strong>
                <small>{parameter.recommendation}</small>
                <small className="gm-soil-skip-evidence">
                  Optimal {parameter.optimalLabel} · method {parameter.method}
                </small>
              </span>
              <span className="gm-soil-skip-saved">
                <small>Cost</small>
                <strong className="font-display">
                  {parameter.actionCost === 0 ? "No cost" : kes(parameter.actionCost)}
                </strong>
              </span>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onFix(parameter)}
              >
                Fix it
              </button>
            </div>
          ))}
          <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-soft" onClick={onShare}>
              <Share2 /> Send to my agronomist
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onGoProgram}>
              <Sprout /> Open the fertilizer programme
            </button>
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* =============================== 17.3 program =========================== */

function ProgramSection({
  steps,
  skipped,
  products,
  onOpenStep,
  onToggleStep,
  onOpenProduct,
  onOpenSkip,
  onOpenProgram,
  onOrder,
  onLogAmendment,
}: {
  steps: FertilizerStep[];
  skipped: SkippedInput[];
  products: SoilProduct[];
  onOpenStep: (step: FertilizerStep) => void;
  onToggleStep: (step: FertilizerStep) => void;
  onOpenProduct: (product: SoilProduct) => void;
  onOpenSkip: (skipped: SkippedInput) => void;
  onOpenProgram: () => void;
  onOrder: () => void;
  onLogAmendment: (preset: "lime" | "manure" | "compost") => void;
}) {
  const [tab, setTab] = useState<"program" | "catalog" | "skip">("program");
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const total = steps.reduce((sum, step) => sum + step.cost, 0);
  const applied = steps.filter((step) => step.applied);
  const saved = skipped.reduce((sum, item) => sum + item.saved, 0);

  const matched = products.filter((product) => {
    const needle = query.trim().toLowerCase();
    return (
      (category === "All categories" || product.category === category) &&
      (needle.length === 0 ||
        product.product.toLowerCase().includes(needle) ||
        product.supplier.toLowerCase().includes(needle) ||
        product.nutrient.toLowerCase().includes(needle))
    );
  });
  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.3 · AI fertilizer recommendation"
        title="A costed programme built from the lab report, not from habit"
        subtitle="Seven application lines, KES 54,000 for the acre, and KES 12,500 saved by not buying what the soil already has."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onLogAmendment("manure")}>
              <Leaf /> Log manure
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onOpenProgram}>
              <Sprout /> Full programme
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={Coins}
          label="Programme cost"
          value={kes(total)}
          note={`Per acre · ${steps.length} application lines`}
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Lines applied"
          value={`${applied.length} of ${steps.length}`}
          note={applied.length === 0 ? "Programme starts with lime at land prep" : "Tick them off as you go"}
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Skipped inputs"
          value={kes(saved)}
          note="MOP, extra TSP and copper foliar are not needed"
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Expected score lift"
          value={`${SOIL_CONTEXT.soilHealthScore} → ${SOIL_CONTEXT.projectedScore}`}
          note="If the programme is followed for two seasons"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Programme views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "program", label: "Application plan", icon: <CalendarDays />, count: steps.length },
            { id: "catalog", label: "Products & prices", icon: <Package />, count: products.length },
            { id: "skip", label: "What we skip", icon: <AlertTriangle />, count: skipped.length },
          ]}
        />
      </div>

      {tab === "program" ? (
        <>
          <div className="gm-card p-3">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Application & timing</th>
                    <th>Product & rate</th>
                    <th>Rate/acre</th>
                    <th>Purpose</th>
                    <th>Cost (KES)</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step) => (
                    <ProgramStepRow
                      key={step.id}
                      step={step}
                      onOpen={() => onOpenStep(step)}
                      onToggle={() => onToggleStep(step)}
                    />
                  ))}
                  <tr>
                    <td>
                      <strong>Total fertilizer programme</strong>
                    </td>
                    <td colSpan={3} className="text-muted">
                      Lime, basal, two CAN splits, two foliar corrections and 5 tonnes of manure
                    </td>
                    <td className="font-display">
                      <strong>KES {total.toLocaleString("en-KE")}</strong>
                    </td>
                    <td colSpan={2}>
                      <span className="gm-chip gm-chip-lime">
                        {applied.length}/{steps.length} applied
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onLogAmendment("lime")}
              >
                <Mountain /> Log the lime
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onLogAmendment("compost")}
              >
                <Leaf /> Log compost
              </button>
              <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onOrder}>
                <Package /> Order these inputs
              </button>
            </div>
          </div>

          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Spread rates that matter"
              title="Lime requirement by texture and current pH"
              subtitle="Lime is the first line of the programme and the easiest to get wrong — too little and the pH does not move."
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Texture</th>
                    <th>Current pH</th>
                    <th>Target pH</th>
                    <th>Rate per acre</th>
                    <th>Cost per acre</th>
                    <th>Note</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {LIME_RATE_TABLE.map((row) => (
                    <LimeRateRowView
                      key={row.id}
                      row={row}
                      onOpen={() => {
                        downloadText(
                          "growmo-lime-rate.csv",
                          [
                            ["Texture", row.texture],
                            ["Current pH", row.currentPh],
                            ["Target pH", row.targetPh],
                            ["Rate per acre", row.ratePerAcre],
                            ["Cost per acre", row.cost],
                            ["Note", row.note],
                          ]
                            .map((line) => line.map(csvCell).join(","))
                            .join("\n"),
                        );
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : tab === "catalog" ? (
        <>
          <div className="gm-soil-toolbar">
            <div className="gm-soil-search">
              <Search />
              <input
                className="gm-input"
                value={query}
                placeholder="Search products, suppliers or nutrient analysis"
                aria-label="Search products"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="gm-select"
              value={category}
              aria-label="Filter by category"
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              {["All categories", ...Array.from(new Set(products.map((item) => item.category)))].map(
                (item) => (
                  <option key={item}>{item}</option>
                ),
              )}
            </select>
            <span className="gm-soil-count">{matched.length} of {products.length} products</span>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Pack size</th>
                  <th>Price</th>
                  <th>Rate/acre</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <span className="text-muted">
                        No product matches that search — try “lime”, “DAP”, “manure” or a supplier
                        name.
                      </span>
                    </td>
                  </tr>
                ) : null}
                {shown.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.product}</strong>
                      <small className="d-block text-muted">{product.nutrient}</small>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.supplier}</td>
                    <td>{product.packSize}</td>
                    <td className="font-display">
                      {product.price === 0 ? "Own production" : kes(product.price)}
                    </td>
                    <td>{product.ratePerAcre}</td>
                    <td>
                      <StatusChip
                        label={product.stock}
                        tone={product.stock === "In store" ? "low" : product.stock === "Order in" ? "medium" : "high"}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onOpenProduct(product)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>
        </>
      ) : (
        <>
          <div className="gm-card p-3">
            <DashboardSectionHeader
              eyebrow="Money not spent"
              title="Inputs the soil test says you can skip"
              subtitle="Every skipped input is a saving, provided the evidence behind it is kept — one tap opens the lab reference."
              action={<span className="gm-chip gm-chip-lime">Total saving {kes(saved)}</span>}
            />
            {skipped.map((item) => (
              <SkippedInputRow
                key={item.id}
                input={item.input}
                reason={item.reason}
                saved={item.saved}
                evidence={item.evidence}
                onOpen={() => onOpenSkip(item)}
              />
            ))}
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="How the recommendation is built"
              title="From lab number to bag on the farm"
              subtitle="The engine matches your result against the crop requirement, then removes anything already adequate."
            />
            <div className="gm-soil-feature-grid">
              <div className="gm-soil-feature">
                <FlaskConical />
                <span>
                  <strong>1 · Lab result</strong>
                  <small>pH 5.8, N 15 ppm, P 25 ppm, K 180 ppm, Zn 1.8 ppm, B 0.4 ppm</small>
                </span>
              </div>
              <div className="gm-soil-feature">
                <Sprout />
                <span>
                  <strong>2 · Crop requirement</strong>
                  <small>Cabbage Gloria F1 on 0.5 acre needs 120 kg N, 60 kg P₂O₅ per hectare equivalent</small>
                </span>
              </div>
              <div className="gm-soil-feature">
                <Coins />
                <span>
                  <strong>3 · Costed plan</strong>
                  <small>KES 54,000 per acre including manure, priced at Githunguri co-op rates</small>
                </span>
              </div>
              <div className="gm-soil-feature">
                <ClipboardCheck />
                <span>
                  <strong>4 · Advisory check</strong>
                  <small>Reviewed with a verified agronomist before the order is placed</small>
                </span>
                <button type="button" className="gm-table-link" onClick={onOpenProgram}>
                  Open the programme
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/* =============================== 17.4 history =========================== */

function HistorySection({
  rows,
  onOpenRow,
  onCompare,
  onPoint,
  onOpenScore,
  onExport,
  onBook,
}: {
  rows: SoilHistoryRow[];
  onOpenRow: (row: SoilHistoryRow) => void;
  onCompare: (row: SoilHistoryRow) => void;
  onPoint: (point: TrendPoint) => void;
  onOpenScore: () => void;
  onExport: () => void;
  onBook: () => void;
}) {
  const [tab, setTab] = useState<"charts" | "table" | "score">("charts");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const plotted = rows.slice(-4);
  const phPoints = plotted.map((row) => ({
    id: row.id,
    label: row.year.split(" ")[0],
    value: row.ph,
    note: row.trend,
  }));
  const omPoints = plotted.map((row) => ({
    id: `${row.id}-om`,
    label: row.year.split(" ")[0],
    value: row.organicMatter,
    note: row.trend,
  }));
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(page, pages);
  const shown = rows.slice((current - 1) * perPage, current * perPage);
  const latest = rows.find((row) => row.id === "hist-2026") ?? rows[rows.length - 1];

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.4 · History & trend analysis"
        title="Four years of tests show the programme is working"
        subtitle="pH from 5.3 to 5.8, organic matter from 2.1% to 3.2% and the soil health score from 35 to 58 out of 100."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onExport}>
              <Download /> Export history
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onBook}>
              <Plus /> Next test
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="History views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "charts", label: "Trend charts", icon: <TrendingUp />, count: 4 },
            { id: "table", label: "All tests", icon: <Table2 />, count: rows.length },
            { id: "score", label: "Soil health score", icon: <Gauge />, count: SOIL_SCORE_COMPONENTS.length },
          ]}
        />
      </div>

      {tab === "charts" ? (
        <>
          <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
            <div>
              <TrendLineChart
                points={phPoints}
                title="pH over four years"
                unit="0 – 7 scale · target 6.5"
                target={6.5}
                label="soil pH"
                min={4.5}
                max={7}
                onPoint={onPoint}
              />
            </div>
            <div>
              <TrendLineChart
                points={omPoints}
                title="Organic matter"
                unit="% · target 5%"
                target={5}
                label="organic matter"
                min={0}
                max={6}
                onPoint={onPoint}
              />
            </div>
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="NPK over four years"
              title="Nitrogen is climbing, phosphorus is stable, potassium is comfortably high"
              subtitle="The bars are plotted on their own scales because the three nutrients are reported in different ranges."
            />
            <NpkBarChart rows={plotted} onBar={onOpenRow} />
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Comparison"
              title="Your best and worst plots in the same season"
              subtitle="Plot 6 (compost block) scores 74 while Plot 8 (lower terrace) scores 47 — the difference is drainage and organic matter, not fertilizer."
              action={
                <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onOpenScore}>
                  <TrendingUp /> Score breakdown
                </button>
              }
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>pH</th>
                    <th>OM %</th>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Score</th>
                    <th>Trend</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(-6).map((row) => (
                    <tr key={`cmp-${row.id}`}>
                      <td>
                        <strong>{row.year}</strong>
                        <small className="d-block text-muted">{row.lab.split(",")[0]}</small>
                      </td>
                      <td className="font-display">{row.ph.toFixed(1)}</td>
                      <td className="font-display">{row.organicMatter.toFixed(1)}</td>
                      <td className="font-display">{row.nitrogen}</td>
                      <td className="font-display">{row.phosphorus}</td>
                      <td className="font-display">{row.potassium}</td>
                      <td className="font-display">{row.score}</td>
                      <td>{row.trend}</td>
                      <td>
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onOpenRow(row)}
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : tab === "table" ? (
        <>
          <div className="gm-card p-3">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Test date</th>
                    <th>Lab</th>
                    <th>pH</th>
                    <th>OM%</th>
                    <th>N</th>
                    <th>P</th>
                    <th>K</th>
                    <th>Zn</th>
                    <th>B</th>
                    <th>Cost</th>
                    <th>Trend summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.year}</strong>
                        <small className="d-block text-muted">{row.date}</small>
                      </td>
                      <td>
                        {row.lab}
                        <small className="d-block text-muted">ref {row.labRef}</small>
                      </td>
                      <td className="font-display">{row.ph.toFixed(1)}</td>
                      <td className="font-display">{row.organicMatter.toFixed(1)}%</td>
                      <td className="font-display">{row.nitrogen}</td>
                      <td className="font-display">{row.phosphorus}</td>
                      <td className="font-display">{row.potassium}</td>
                      <td className="font-display">{row.zinc}</td>
                      <td className="font-display">{row.boron}</td>
                      <td className="font-display">{kes(row.cost)}</td>
                      <td>{row.trend}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="gm-btn gm-btn-soft gm-btn-sm"
                            onClick={() => onOpenRow(row)}
                          >
                            Report
                          </button>
                          <button
                            type="button"
                            className="gm-btn gm-btn-outline gm-btn-sm"
                            onClick={() => onCompare(row)}
                          >
                            Compare
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Pagination
                page={current}
                total={pages}
                onChange={setPage}
                perPage={perPage}
                totalItems={rows.length}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow={`Current score ${SOIL_CONTEXT.soilHealthScore}/100`}
            title="Soil health score, year by year"
            subtitle={`Baseline 35 in 2023 · 58 today · ${SOIL_CONTEXT.projectedScore} projected next season if the plan is followed`}
            action={
              <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onOpenScore}>
                <Gauge /> Five components
              </button>
            }
          />
          <ScoreTrendChart points={SOIL_SCORE_HISTORY} onPoint={(point) => onPoint({ id: point.id, label: point.year, value: point.score, note: point.note })} />
          <div className="gm-soil-feature-grid mt-3">
            {SOIL_SCORE_COMPONENTS.map((component) => (
              <div className="gm-soil-feature" key={component.id}>
                <Gauge />
                <span style={{ flex: 1 }}>
                  <strong>
                    {component.label} · {component.score}/{component.max}
                  </strong>
                  <small>{component.note}</small>
                  <span className="d-block mt-2">
                    <ProgressLine value={(component.score / component.max) * 100} label={component.label} />
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <SoilCallout
              icon={TrendingUp}
              title="Where the next 12 points come from"
              body={`Micronutrients and organic matter are the two cheapest lifts: zinc sulphate at land prep, boron at heading and manure raised to 5 tonnes per acre would move the score to about ${SOIL_CONTEXT.projectedScore}.`}
            />
          </div>
          <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={() =>
                downloadText(
                  "growmo-soil-score-trend.csv",
                  [
                    ["Year", "Score", "Note"],
                    ...SOIL_SCORE_HISTORY.map((point) => [point.year, point.score, point.note]),
                    [],
                    ["Latest pH", latest.ph],
                    ["Latest organic matter", latest.organicMatter],
                    ["Latest score", latest.score],
                  ]
                    .map((row) => row.map(csvCell).join(","))
                    .join("\n"),
                )
              }
            >
              <Download /> Export the score trend
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onBook}>
              <Plus /> Book the next test
            </button>
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* ============================== 17.5 sampling =========================== */

function SamplingSection({
  language,
  plot,
  checked,
  onLanguage,
  onToggleKit,
  onOpenGuide,
  onPrint,
}: {
  language: "EN" | "SW";
  plot: SoilPlot;
  checked: string[];
  onLanguage: (language: "EN" | "SW") => void;
  onToggleKit: (id: string) => void;
  onOpenGuide: (plot: SoilPlot) => void;
  onPrint: () => void;
}) {
  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.5 · Soil sampling instructions"
        title="Nine steps that decide whether the lab result is worth anything"
        subtitle="A contaminated sample is worse than no sample — it makes you buy the wrong fertilizer for a whole season."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onPrint}>
              <Printer /> Print for the field
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onOpenGuide(plot)}
            >
              <ClipboardCheck /> Open the illustrated guide
            </button>
          </div>
        }
      />

      <div className="gm-soil-toolbar mt-3">
        {(["EN", "SW"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={`gm-filter-chip ${language === item ? "is-active" : ""}`}
            onClick={() => onLanguage(item)}
          >
            {item === "EN" ? "English" : "Kiswahili"}
          </button>
        ))}
        <span className="gm-soil-count">
          Guide language: {language === "EN" ? "English with Kiswahili keywords" : "Kiswahili"}
        </span>
      </div>

      <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
        {SAMPLING_STEPS.map((step) => (
          <SamplingStepCard
            key={step.id}
            step={step}
            language={language}
            onOpen={() => onOpenGuide(plot)}
          />
        ))}
      </div>

      <div className="gm-card p-3 mt-3">
        <DashboardSectionHeader
          eyebrow="Before you leave the house"
          title="Sampling kit checklist"
          subtitle={`Tick what you have packed for ${plot.name}. The group store near Githunguri lends the auger.`}
          action={
            <StatusChip
              label={`${checked.length}/${SAMPLING_KIT.length} ready`}
              tone={checked.length === SAMPLING_KIT.length ? "low" : "medium"}
            />
          }
        />
        <div className="gm-soil-feature-grid">
          {SAMPLING_KIT.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`gm-checkcard ${checked.includes(item.id) ? "on" : ""}`}
              onClick={() => onToggleKit(item.id)}
            >
              <input type="checkbox" checked={checked.includes(item.id)} readOnly tabIndex={-1} />
              <span>
                <strong>{item.item}</strong>
                <small>
                  {item.supplied ? "Group store" : "Buy locally"} · {item.note}
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="gm-card p-3 mt-3">
        <DashboardSectionHeader
          eyebrow="Mistakes that ruin a sample"
          title="Five ways to waste KES 5,000"
          subtitle="Each of these has cost a Kenyan farmer a lab fee and a wrong fertilizer order."
        />
        <div className="gm-soil-feature-grid">
          <div className="gm-soil-feature">
            <AlertTriangle />
            <span>
              <strong>Sampling where the cattle stand</strong>
              <small>A manure patch reports 4× the nitrogen of the rest of the plot. Walk the W pattern instead.</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <AlertTriangle />
            <span>
              <strong>Using a rusty tin or metal bucket</strong>
              <small>Metal dust adds zinc and iron, so the micronutrient panel reads falsely high.</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <AlertTriangle />
            <span>
              <strong>One sample for the whole farm</strong>
              <small>Averaging a wet terrace and a dry slope hides both problems — sample per zone.</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <AlertTriangle />
            <span>
              <strong>Leaving the bag in the sun</strong>
              <small>Heat and moisture change nitrogen readings within a day. Deliver within 48 hours.</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <AlertTriangle />
            <span>
              <strong>Unlabelled bags</strong>
              <small>Three bags and no labels means three results you cannot use. Plot, date and crop on every bag.</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <CheckCircle2 />
            <span>
              <strong>GPS pin saved per point</strong>
              <small>GrowMO records the sampling points so next year's sample comes from the same places.</small>
            </span>
            <button type="button" className="gm-table-link" onClick={() => onOpenGuide(plot)}>
              Show the W pattern
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ================================ 17.6 labs ============================= */

function LabsSection({
  labs,
  onOpen,
  onBook,
  onContact,
}: {
  labs: SoilLab[];
  onOpen: (lab: SoilLab) => void;
  onBook: (lab: SoilLab) => void;
  onContact: (lab: SoilLab) => void;
}) {
  const [tab, setTab] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");
  const [speed, setSpeed] = useState("Any turnaround");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return labs.filter((lab) => {
      const matches =
        needle.length === 0 ||
        lab.name.toLowerCase().includes(needle) ||
        lab.location.toLowerCase().includes(needle) ||
        lab.tests.toLowerCase().includes(needle) ||
        lab.counties.toLowerCase().includes(needle);
      const speedMatch =
        speed === "Any turnaround" ||
        (speed === "Within 7 days" && (lab.turnaround.includes("5") || lab.turnaround.includes("6"))) ||
        (speed === "7 – 14 days" && lab.turnaround.includes("7")) ||
        (speed === "Longer than 14 days" &&
          (lab.turnaround.includes("21") || lab.turnaround.includes("28") || lab.turnaround.includes("10")));
      return matches && speedMatch;
    });
  }, [labs, query, speed]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);
  const cheapest = [...labs].sort((a, b) => a.costBasic - b.costBasic)[0];

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.6 · Lab directory (Kenya)"
        title="Ten labs, their real prices and turnaround times"
        subtitle={`Cheapest basic test is ${cheapest.name} at KES ${cheapest.costBasic.toLocaleString("en-KE")}; the reference lab for certification evidence is KALRO Kabete.`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTab("table")}>
              <Table2 /> Compare all labs
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onBook(labs[0])}>
              <Plus /> Book a test
            </button>
          </div>
        }
      />

      <div className="gm-card p-2 my-3">
        <PlannerSubtabs
          label="Lab views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "cards", label: "Lab cards", icon: <LayoutGrid />, count: labs.length },
            { id: "table", label: "Price comparison", icon: <Table2 />, count: labs.length },
          ]}
        />
      </div>

      <div className="gm-soil-toolbar">
        <div className="gm-soil-search">
          <Search />
          <input
            className="gm-input"
            value={query}
            placeholder="Search labs by name, town, test range or county"
            aria-label="Search labs"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="gm-select"
          value={speed}
          aria-label="Filter by turnaround"
          onChange={(event) => {
            setSpeed(event.target.value);
            setPage(1);
          }}
        >
          {["Any turnaround", "Within 7 days", "7 – 14 days", "Longer than 14 days"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <span className="gm-soil-count">{matched.length} of {labs.length} labs</span>
      </div>

      {tab === "cards" ? (
        <>
          <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
            {shown.map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                onOpen={() => onOpen(lab)}
                onBook={() => onBook(lab)}
              />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>
        </>
      ) : (
        <div className="gm-card p-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Lab</th>
                  <th>Location</th>
                  <th>Tests</th>
                  <th>Turnaround</th>
                  <th>Cost (basic)</th>
                  <th>Cost (comprehensive)</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matched.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <span className="text-muted">
                        No lab matches that search — clear the box or widen the turnaround filter.
                      </span>
                    </td>
                  </tr>
                ) : null}
                {matched.map((lab) => (
                  <tr key={lab.id}>
                    <td>
                      <strong>{lab.name}</strong>
                      <small className="d-block text-muted">
                        ★ {lab.rating} · {lab.accreditation}
                      </small>
                    </td>
                    <td>{lab.location}</td>
                    <td>{lab.tests}</td>
                    <td>{lab.turnaround}</td>
                    <td className="font-display">
                      {lab.costBasic === 0 ? "—" : kes(lab.costBasic)}
                    </td>
                    <td className="font-display">
                      {lab.costComprehensive === 0 ? "—" : kes(lab.costComprehensive)}
                    </td>
                    <td>
                      {lab.phone}
                      <small className="d-block text-muted">{lab.email}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onOpen(lab)}
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          className="gm-btn gm-btn-outline gm-btn-sm"
                          onClick={() => onContact(lab)}
                        >
                          Contact
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="gm-card p-3 mt-3">
        <DashboardSectionHeader
          eyebrow="Choosing a lab"
          title="Cheap, fast or audit-ready — pick two"
          subtitle="Use the county lab for routine pH checks, a private lab when you need results before planting, and KALRO or SGS when a buyer or auditor will read the report."
        />
        <div className="gm-soil-feature-grid">
          <div className="gm-soil-feature">
            <Coins />
            <span>
              <strong>Cheapest</strong>
              <small>{cheapest.name} · {kes(cheapest.costBasic)} for a basic test, free for registered groups</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <Timer />
            <span>
              <strong>Fastest</strong>
              <small>Crop Nutrition Laboratory · 5 – 7 days and a fertilizer programme on the report</small>
            </span>
          </div>
          <div className="gm-soil-feature">
            <ClipboardCheck />
            <span>
              <strong>Audit-ready</strong>
              <small>KALRO Kabete and SGS Kenya carry KENAS accreditation accepted by KS1758 and GlobalG.A.P.</small>
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================= 17.7 improvement ========================= */

function PlanSection({
  practices,
  batches,
  onOpenPractice,
  onTogglePractice,
  onOpenCompost,
  onNewBatch,
  onLogAmendment,
  onOrderLime,
}: {
  practices: SoilPractice[];
  batches: CompostBatch[];
  onOpenPractice: (practice: SoilPractice) => void;
  onTogglePractice: (practice: SoilPractice) => void;
  onOpenCompost: (batch: CompostBatch) => void;
  onNewBatch: () => void;
  onLogAmendment: (preset: "lime" | "manure" | "compost") => void;
  onOrderLime: () => void;
}) {
  const [tab, setTab] = useState<"practices" | "compost" | "amendments">("practices");
  const [priority, setPriority] = useState("All priorities");
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [batchPage, setBatchPage] = useState(1);
  const batchPerPage = 5;

  const matched = practices.filter(
    (practice) => priority === "All priorities" || practice.priority === priority,
  );
  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  const current = Math.min(page, pages);
  const shown = matched.slice((current - 1) * perPage, current * perPage);

  const batchPages = Math.max(1, Math.ceil(batches.length / batchPerPage));
  const batchCurrent = Math.min(batchPage, batchPages);
  const batchShown = batches.slice((batchCurrent - 1) * batchPerPage, batchCurrent * batchPerPage);

  const started = practices.filter((practice) => practice.started);
  const averageProgress =
    started.length > 0
      ? Math.round(started.reduce((total, practice) => total + practice.progress, 0) / started.length)
      : 0;
  const compostReady = batches.filter((batch) => batch.stage === "Ready").length;

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.7 · Soil health improvement plan"
        title="Ten practices that rebuild the soil over seasons, not weeks"
        subtitle="Lime, manure and rotation are the high-priority three. Compost, mulching and cover crops cost little and hold the gains."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onNewBatch}>
              <Leaf /> Build a compost batch
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onOrderLime}>
              <Mountain /> Order lime
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={Leaf}
          label="Practices running"
          value={`${started.length} of ${practices.length}`}
          note={`Average progress ${averageProgress}% across the started practices`}
        />
        <DashboardMetric
          icon={Coins}
          label="Lime + manure budget"
          value={kes(38000)}
          note="KES 8,000 lime and KES 30,000 manure, per acre"
        />
        <DashboardMetric
          icon={Thermometer}
          label="Compost batches"
          value={String(batches.length)}
          note={`${compostReady} batch${compostReady === 1 ? "" : "es"} ready to apply · 9.1 tonnes this season`}
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Score target"
          value={`${SOIL_CONTEXT.soilHealthScore} → ${SOIL_CONTEXT.projectedScore}`}
          note="Organic matter and micronutrients give the next 12 points"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Improvement views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
            setBatchPage(1);
          }}
          items={[
            { id: "practices", label: "Practices", icon: <Sprout />, count: practices.length },
            { id: "compost", label: "Compost batches", icon: <Leaf />, count: batches.length },
            { id: "amendments", label: "Amendment log", icon: <ClipboardCheck />, count: 0 },
          ]}
        />
      </div>

      {tab === "practices" ? (
        <>
          <div className="gm-soil-toolbar">
            {["All priorities", "High", "Medium", "Good practice"].map((item) => (
              <button
                type="button"
                key={item}
                className={`gm-filter-chip ${priority === item ? "is-active" : ""}`}
                onClick={() => {
                  setPriority(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
            <span className="gm-soil-count">{matched.length} of {practices.length} practices</span>
          </div>
          <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
            {shown.map((practice) => (
              <PracticeCard
                key={practice.id}
                practice={practice}
                onOpen={() => onOpenPractice(practice)}
                onToggle={() => onTogglePractice(practice)}
              />
            ))}
          </div>
          <div className="gm-card p-2 mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={matched.length}
            />
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Rotation planner"
              title="Keep a legume in every cycle"
              subtitle="Rotation is free nitrogen and it breaks the black-rot and nematode cycles that build up on continuous cabbage."
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Plot 1</th>
                    <th>Plot 2</th>
                    <th>Plot 4</th>
                    <th>Follows a legume?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { season: "SR 2025", p1: "Cabbage", p2: "Tomato", p4: "Potato", ok: false },
                    { season: "LR 2026", p1: "Cabbage", p2: "Tomato", p4: "Beans (Rosecoco)", ok: true },
                    { season: "SR 2026", p1: "Beans (Rosecoco)", p2: "Kale", p4: "Potato", ok: true },
                    { season: "LR 2027", p1: "Cabbage", p2: "Tomato", p4: "Lablab cover crop", ok: true },
                  ].map((row) => (
                    <tr key={row.season}>
                      <td>
                        <strong>{row.season}</strong>
                      </td>
                      <td>{row.p1}</td>
                      <td>{row.p2}</td>
                      <td>{row.p4}</td>
                      <td>
                        <StatusChip
                          label={row.ok ? "Yes" : "No — fixed in 2026"}
                          tone={row.ok ? "low" : "medium"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onOpenPractice(practices[2])}
              >
                <Sprout /> Open the rotation practice
              </button>
            </div>
          </div>
        </>
      ) : tab === "compost" ? (
        <>
          <div className="gm-card p-3">
            <DashboardSectionHeader
              eyebrow="Compost yard"
              title="Batch by batch, with turning reminders"
              subtitle="Two heaps are live: CB-2026-011 curing and CB-2026-010 still hot at 52 °C."
              action={
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onNewBatch}>
                  <Plus /> New batch
                </button>
              }
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Started</th>
                    <th>Ready</th>
                    <th>Volume</th>
                    <th>Stage</th>
                    <th>Temperature</th>
                    <th>Applied to</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batchShown.map((batch) => (
                    <CompostRow
                      key={batch.id}
                      batch={batch}
                      onOpen={() => onOpenCompost(batch)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Pagination
                page={batchCurrent}
                total={batchPages}
                onChange={setBatchPage}
                perPage={batchPerPage}
                totalItems={batches.length}
              />
            </div>
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Why compost is the cheapest organic matter"
              title="Nine tonnes this season from material that would have been burned"
              subtitle="One tonne of screened compost carries about 11 kg of nitrogen and 350 kg of organic matter — and it costs only turning labour."
            />
            <div className="gm-soil-feature-grid">
              <div className="gm-soil-feature">
                <Leaf />
                <span>
                  <strong>Recycles crop residue</strong>
                  <small>Cabbage and kale stubble, tomato vines and manure all go in rather than up in smoke.</small>
                </span>
              </div>
              <div className="gm-soil-feature">
                <Thermometer />
                <span>
                  <strong>Kills weed seed and pathogens</strong>
                  <small>A heap held above 55 °C for a week does what burning would not, without losing the carbon.</small>
                </span>
              </div>
              <div className="gm-soil-feature">
                <Coins />
                <span>
                  <strong>Cheaper than manure</strong>
                  <small>Own compost costs KES 0 per tonne against KES 6,000 for bought manure.</small>
                </span>
                <button type="button" className="gm-table-link" onClick={onNewBatch}>
                  Start a batch
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Amendment log"
            title="What has actually gone into the soil"
            subtitle="Every lime, manure, compost or ash application is recorded here and in the farm diary, then costed in the finance page."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() => onLogAmendment("lime")}
                >
                  <Mountain /> Log lime
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onLogAmendment("compost")}
                >
                  <Leaf /> Log compost
                </button>
              </div>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Amendment</th>
                  <th>Why it is in the plan</th>
                  <th>Rate</th>
                  <th>Cost</th>
                  <th>Route</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    name: "Agricultural lime (CaCO₃)",
                    why: "Raises pH 5.8 → 6.3 so phosphorus and calcium become available",
                    rate: "2,000 kg/acre",
                    cost: 8000,
                    route: "Nakuru Lime Works via the group order",
                  },
                  {
                    name: "Farmyard manure",
                    why: "Organic matter 3.2% → target 5%, better structure and moisture holding",
                    rate: "5 tonnes/acre",
                    cost: 30000,
                    route: "Githunguri dairy farms, covered storage",
                  },
                  {
                    name: "Compost (own yard)",
                    why: "Free organic matter top-up on the kitchen garden and nursery beds",
                    rate: "2 tonnes/acre",
                    cost: 0,
                    route: "CB-2026-009 and CB-2026-011 batches",
                  },
                  {
                    name: "Gypsum (if sulphur stays low)",
                    why: "Sulphur 12 ppm — gypsum supplies S and improves clay structure",
                    rate: "50 kg/acre",
                    cost: 780,
                    route: "Jogoo Agro Supplies, Nairobi",
                  },
                  {
                    name: "Wood ash (thin layer)",
                    why: "Potassium and a small liming effect; never more than a dusting",
                    rate: "200 kg/acre",
                    cost: 0,
                    route: "Own kitchen and compost yard",
                  },
                ].map((row) => (
                  <tr key={row.name}>
                    <td>
                      <strong>{row.name}</strong>
                    </td>
                    <td>{row.why}</td>
                    <td className="font-display">{row.rate}</td>
                    <td className="font-display">{row.cost === 0 ? "No cost" : kes(row.cost)}</td>
                    <td>{row.route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* ============================== 17.8 moisture =========================== */

function MoistureSection({
  weeks,
  sensors,
  onLogWeek,
  onPlanIrrigation,
  onSensor,
  onMethodToggle,
  methods,
}: {
  weeks: MoistureWeek[];
  sensors: SoilSensor[];
  onLogWeek: (week: MoistureWeek | null) => void;
  onPlanIrrigation: () => void;
  onSensor: (sensor: SoilSensor) => void;
  onMethodToggle: (id: string, label: string) => void;
  methods: typeof MOISTURE_METHODS;
}) {
  const [tab, setTab] = useState<"balance" | "methods" | "sensors">("balance");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const pages = Math.max(1, Math.ceil(weeks.length / perPage));
  const current = Math.min(page, pages);
  const shown = weeks.slice((current - 1) * perPage, current * perPage);
  const water = weeks.reduce((total, week) => total + week.irrigation, 0);
  const irrigationCost = weeks.reduce((total, week) => total + week.irrigationCost, 0);
  const deficitWeeks = weeks.filter((week) => week.net < 0).length;
  const online = sensors.filter((sensor) => sensor.status === "Online").length;

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.8 · Soil moisture monitoring"
        title="Rainfall, evapotranspiration and irrigation in one balance"
        subtitle={`${deficitWeeks} of the next 10 weeks run a deficit on Plot 1 — ${water} mm of irrigation planned at ${kes(irrigationCost)}.`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onLogWeek(null)}>
              <Droplets /> Log a reading
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onPlanIrrigation}>
              <Sun /> Plan irrigation
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={Droplets}
          label="Water planned"
          value={`${water} mm`}
          note={`Across ${weeks.filter((week) => week.irrigation > 0).length} weeks of the October – November window`}
        />
        <DashboardMetric
          icon={Coins}
          label="Irrigation cost"
          value={kes(irrigationCost)}
          note="Furrow watering labour, no pump running costs at this depth"
        />
        <DashboardMetric
          icon={Thermometer}
          label="Sensors online"
          value={`${online} of ${sensors.length}`}
          note="Plot 3 battery is at 12% and needs attention this week"
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Critical weeks"
          value={String(deficitWeeks)}
          note="27 Sep – 3 Oct and heading week 18 – 24 Oct are the tightest"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Moisture views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "balance", label: "Balance chart & table", icon: <Droplets />, count: weeks.length },
            { id: "methods", label: "Monitoring methods", icon: <Gauge />, count: methods.length },
            { id: "sensors", label: "Sensors & gauges", icon: <Wifi />, count: sensors.length },
          ]}
        />
      </div>

      {tab === "balance" ? (
        <>
          <div className="gm-card p-3">
            <DashboardSectionHeader
              eyebrow="Weekly water balance"
              title="Cabbage on Plot 1, October – November 2026"
              subtitle="Bars are rainfall, ET, irrigation and the net balance. Negative net means the crop is drawing down stored water."
              action={<span className="gm-chip gm-chip-ghost">Click any week for the detail</span>}
            />
            <MoistureBalanceChart weeks={weeks} onBar={onLogWeek} />
          </div>
          <div className="gm-card p-3 mt-3">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Rainfall in</th>
                    <th>ET out</th>
                    <th>Irrigation in</th>
                    <th>Net balance</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>Log</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((week) => (
                    <MoistureWeekRow key={week.id} week={week} onOpen={() => onLogWeek(week)} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <Pagination
                page={current}
                total={pages}
                onChange={setPage}
                perPage={perPage}
                totalItems={weeks.length}
              />
            </div>
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="The feel method"
              title="No equipment? Use your hand"
              subtitle="Squeeze a handful from 20 cm depth. It is not a lab, but it is a daily decision you can make yourself."
            />
            <div className="gm-soil-feature-grid">
              {FEEL_METHOD_SCALE.map((item) => (
                <div className="gm-soil-feature" key={item.id}>
                  <Droplets />
                  <span>
                    <strong>
                      {item.label} · {item.moisture}
                    </strong>
                    <small>{item.detail}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : tab === "methods" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Four ways to watch moisture"
            title="Rainfall and ET are free, sensors are precise, satellites give county context"
            subtitle="GrowMO combines the free methods by default and adds sensor data where it changes a decision."
          />
          <div className="gm-soil-kpi-grid" style={{ marginTop: 0 }}>
            {methods.map((method) => (
              <MoistureMethodCard
                key={method.id}
                method={method}
                onToggle={() => onMethodToggle(method.id, method.method)}
              />
            ))}
          </div>
          <div className="mt-3">
            <SoilCallout
              icon={Gauge}
              tone="warn"
              title="Sensors decide irrigation, labs decide fertilizer"
              body="A moisture probe cannot tell you that potassium is high and zinc is low. Keep the two jobs separate or you will buy the wrong thing."
            />
          </div>
        </div>
      ) : (
        <>
          <div className="gm-card p-3">
            <DashboardSectionHeader
              eyebrow="Devices on the farm"
              title="Six monitoring devices, three online"
              subtitle="The Plot 3 probe is offline on 12% battery and two plots have no sensor at all — install one before the next dry spell."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onSensor(sensors.find((sensor) => sensor.status !== "Online") ?? sensors[0])}
                >
                  <Plus /> Install a sensor
                </button>
              }
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Plot</th>
                    <th>Reading</th>
                    <th>Battery</th>
                    <th>Last data</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((sensor) => (
                    <SensorRow key={sensor.id} sensor={sensor} onOpen={() => onSensor(sensor)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Rain gauge"
              title="Farm rainfall against the Kenya Met forecast"
              subtitle="The tipping-bucket gauge recorded 32 mm in the week to 19 Sep; the forecast expected 24 mm."
            />
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Gauge (mm)</th>
                    <th>Kenya Met forecast (mm)</th>
                    <th>Difference</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { week: "13 – 19 Sep", gauge: 32, forecast: 24, note: "Wetter than forecast; furrows topped up" },
                    { week: "06 – 12 Sep", gauge: 12, forecast: 18, note: "Drier than forecast; light irrigation used" },
                    { week: "30 Aug – 05 Sep", gauge: 27, forecast: 25, note: "Close to forecast" },
                    { week: "23 – 29 Aug", gauge: 8, forecast: 10, note: "Dry week, mulching paid off" },
                    { week: "16 – 22 Aug", gauge: 19, forecast: 16, note: "Good planting moisture" },
                  ].map((row) => (
                    <tr key={row.week}>
                      <td>
                        <strong>{row.week}</strong>
                      </td>
                      <td className="font-display">{row.gauge}</td>
                      <td className="font-display">{row.forecast}</td>
                      <td>
                        <span
                          className={`gm-soil-net ${row.gauge - row.forecast >= 0 ? "is-positive" : "is-negative"}`}
                        >
                          {row.gauge - row.forecast > 0 ? "+" : ""}
                          {row.gauge - row.forecast} mm
                        </span>
                      </td>
                      <td>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/* =============================== 17.9 records =========================== */

function RecordsSection({
  orders,
  amendments,
  activity,
  onOpenOrder,
  onOpenActivity,
  onExport,
  onShare,
}: {
  orders: SoilOrder[];
  amendments: AppliedAmendment[];
  activity: typeof SOIL_ACTIVITY;
  onOpenOrder: (order: SoilOrder) => void;
  onOpenActivity: () => void;
  onExport: () => void;
  onShare: () => void;
}) {
  const [tab, setTab] = useState<"orders" | "amendments" | "activity">("orders");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const pages = Math.max(1, Math.ceil(orders.length / perPage));
  const current = Math.min(page, pages);
  const shown = orders.slice((current - 1) * perPage, current * perPage);
  const paid = orders.filter((order) => order.status === "Paid");
  const pending = orders.filter((order) => order.status !== "Paid");

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="17.9 · Lab orders & soil records"
        title="Every test, amendment and payment on one audit trail"
        subtitle="Certification auditors want the chain from the field to the report — sampling date, lab reference, payment receipt and the resulting programme."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onShare}>
              <Share2 /> Share with an auditor
            </button>
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onExport}>
              <Download /> Export evidence
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid my-3">
        <DashboardMetric
          icon={Coins}
          label="Spent on testing"
          value={kes(paid.reduce((total, order) => total + order.amount, 0))}
          note={`${paid.length} lab transactions settled with receipts`}
        />
        <DashboardMetric
          icon={Timer}
          label="Outstanding"
          value={kes(pending.reduce((total, order) => total + order.amount, 0))}
          note={`${pending.length} order still to settle — the group lime order closes 30 Sep`}
        />
        <DashboardMetric
          icon={Leaf}
          label="Amendments logged"
          value={String(amendments.length + COMPOST_BATCHES.filter((batch) => batch.stage === "Applied").length)}
          note="Lime, manure and compost applications this season"
        />
        <DashboardMetric
          icon={Activity}
          label="Soil activity records"
          value={String(activity.length)}
          note="Sampling, tests, payments, advisory and training"
        />
      </div>

      <div className="gm-card p-2 mb-3">
        <PlannerSubtabs
          label="Record views"
          value={tab}
          onChange={(next) => {
            setTab(next);
            setPage(1);
          }}
          items={[
            { id: "orders", label: "Lab orders", icon: <FlaskConical />, count: orders.length },
            {
              id: "amendments",
              label: "Amendments applied",
              icon: <Leaf />,
              count: amendments.length,
            },
            { id: "activity", label: "Activity log", icon: <Activity />, count: activity.length },
          ]}
        />
      </div>

      {tab === "orders" ? (
        <div className="gm-card p-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Plot</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((order) => (
                  <SoilOrderRow key={order.id} order={order} onOpen={() => onOpenOrder(order)} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Pagination
              page={current}
              total={pages}
              onChange={setPage}
              perPage={perPage}
              totalItems={orders.length}
            />
          </div>
        </div>
      ) : tab === "amendments" ? (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Applied this season"
            title="What went into the soil, and when"
            subtitle="Applications logged from this page appear here immediately and are written into the farm diary on the records page."
          />
          {amendments.length === 0 ? (
            <div className="gm-empty">
              <span className="gm-service-icon">
                <Leaf />
              </span>
              <h3 className="font-display">No amendment logged yet this session</h3>
              <p className="text-muted">
                Use the lime, manure or compost buttons in the improvement plan tab — each one
                records quantity, cost and date against the plot.
              </p>
              <StatusChip label="The season plan already includes lime at 2 tonnes/acre" tone="medium" />
            </div>
          ) : (
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amendment</th>
                    <th>Plot</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {amendments.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date}</td>
                      <td>
                        <strong>{row.amendment}</strong>
                      </td>
                      <td>{row.plot}</td>
                      <td className="font-display">{row.quantity}</td>
                      <td className="font-display">
                        {row.cost === 0 ? "No cost" : kes(row.cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-3">
            <span className="gm-eyebrow">Also applied from the compost yard</span>
            <div className="gm-soil-feature-grid mt-2">
              {COMPOST_BATCHES.filter((batch) => batch.stage === "Applied")
                .slice(0, 6)
                .map((batch) => (
                  <div className="gm-soil-feature" key={batch.id}>
                    <Leaf />
                    <span>
                      <strong>
                        {batch.batch} · {batch.volume}
                      </strong>
                      <small>
                        {batch.appliedTo} · built {batch.started}
                      </small>
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="gm-card p-3">
          <DashboardSectionHeader
            eyebrow="Everything that touched soil health"
            title="Ten activities, most recent first"
            subtitle="Sampling, lab work, payments, advisory sessions and training — the complete history for a certification file."
            action={
              <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onOpenActivity}>
                <Activity /> Open the drawer
              </button>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Detail</th>
                  <th>Who</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      <StatusChip
                        label={row.type}
                        tone={
                          row.type === "Lab test" || row.type === "Sampling"
                            ? "low"
                            : row.type === "Payment"
                              ? "medium"
                              : "neutral"
                        }
                      />
                    </td>
                    <td>{row.detail}</td>
                    <td>{row.who}</td>
                    <td className="font-display">
                      {row.cost === 0 ? "—" : kes(row.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Reveal>
  );
}

/* ================================== PAGE ================================ */

function SoilPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<SoilView>("scheduler");
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [menu, setMenu] = useState(false);

  const [plots, setPlots] = useState<SoilPlot[]>(SOIL_PLOTS);
  const [history] = useState<SoilHistoryRow[]>(SOIL_HISTORY);
  const [program, setProgram] = useState<FertilizerStep[]>(FERTILIZER_PROGRAM);
  const [practices, setPractices] = useState<SoilPractice[]>(SOIL_PRACTICES);
  const [weeks, setWeeks] = useState<MoistureWeek[]>(MOISTURE_WEEKS);
  const [sensors, setSensors] = useState<SoilSensor[]>(SOIL_SENSORS);
  const [orders, setOrders] = useState<SoilOrder[]>(SOIL_ORDERS);
  const [amendments, setAmendments] = useState<AppliedAmendment[]>([]);
  const [batches, setBatches] = useState<CompostBatch[]>(COMPOST_BATCHES);
  const [methods, setMethods] = useState(MOISTURE_METHODS);
  const [plans, setPlans] = useState<PlanAction[]>([]);
  const [checkedKit, setCheckedKit] = useState<string[]>([]);
  const [language, setLanguage] = useState<"EN" | "SW">("EN");
  const [shares, setShares] = useState<{ who: string; scope: string; expiry: string; code: string }[]>([]);
  const [activePlot, setActivePlot] = useState<SoilPlot>(SOIL_PLOTS[0]);
  const [activeLab, setActiveLab] = useState<SoilLab | null>(null);
  const [activeParameter, setActiveParameter] = useState<SoilParameter | null>(null);
  const [activeHistory, setActiveHistory] = useState<SoilHistoryRow | null>(null);
  const [activePoint, setActivePoint] = useState<TrendPoint | null>(null);
  const [activeProduct, setActiveProduct] = useState<SoilProduct | null>(null);
  const [activeSkip, setActiveSkip] = useState<SkippedInput | null>(null);
  const [activePractice, setActivePractice] = useState<SoilPractice | null>(null);
  const [activeWeek, setActiveWeek] = useState<MoistureWeek | null>(null);
  const [activeSensor, setActiveSensor] = useState<SoilSensor | null>(null);
  const [activeOrder, setActiveOrder] = useState<SoilOrder | null>(null);
  const [activeBatch, setActiveBatch] = useState<CompostBatch | null>(null);
  const [activeComponent, setActiveComponent] = useState<ScoreComponent | null>(null);
  const [presetPlotId, setPresetPlotId] = useState<string | undefined>(undefined);
  const [presetLabId, setPresetLabId] = useState<string | undefined>(undefined);
  const [amendmentPreset, setAmendmentPreset] = useState<"lime" | "manure" | "compost" | null>(null);
  const [pauseTarget, setPauseTarget] = useState<SoilPractice | null>(null);
  const [orderSteps, setOrderSteps] = useState<FertilizerStep[]>(FERTILIZER_PROGRAM);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);
  const totals = soilTotals();
  const latestTest = history.find((row) => row.id === "hist-2026") ?? history[history.length - 1];

  const kpis: SoilKpi[] = [
    {
      icon: Gauge,
      label: "Soil health score",
      value: `${SOIL_CONTEXT.soilHealthScore}/100`,
      note: `Was ${SOIL_CONTEXT.score2023} in 2023 · projected ${SOIL_CONTEXT.projectedScore} next season`,
    },
    {
      icon: FlaskConical,
      label: "Tests on record",
      value: String(history.length),
      note: `${plots.filter((plot) => plot.status === "Current").length} plots current · ${plots.filter((plot) => plot.status === "Overdue").length} never tested`,
    },
    {
      icon: Sprout,
      label: "Fertilizer programme",
      value: kes(totals.programCost),
      note: `${program.filter((step) => step.applied).length} of ${program.length} lines applied this season`,
    },
    {
      icon: Droplets,
      label: "Irrigation plan",
      value: `${weeks.reduce((total, week) => total + week.irrigation, 0)} mm`,
      note: `${kes(totals.irrigationNeeded)} across the October – November deficit weeks`,
    },
  ];

  /* ------------------------------------------------------------ handlers */

  const bookTest = (summary: {
    plot: string;
    type: string;
    lab: string;
    cost: number;
    receipt: string;
    collection?: string;
  }) => {
    setPlots((current) =>
      current.map((plot) =>
        plot.name === summary.plot
          ? { ...plot, status: "Sampled", nextTest: "Results pending", lab: summary.lab }
          : plot,
      ),
    );
    setOrders((current) => [
      {
        id: `so-new-${current.length + 1}`,
        date: "20 Sep 2026",
        item: `${summary.type} soil test · ${summary.plot}`,
        plot: summary.plot,
        amount: summary.cost,
        method: "M-Pesa (GrowMO wallet)",
        status: "Paid",
        receipt: summary.receipt,
        note: summary.collection ? `Collection: ${summary.collection}` : "Booked from the app",
      },
      ...current,
    ]);
    toast.notify(
      `${summary.type} test booked for ${summary.plot} at ${summary.lab}. Receipt ${summary.receipt}; collection instructions are ready.`,
      "success",
    );
  };

  const orderLime = (summary: {
    plot: string;
    rate: string;
    tonnes: number;
    cost: number;
    receipt: string;
    mode: string;
  }) => {
    setOrders((current) => [
      {
        id: `so-lime-${current.length + 1}`,
        date: "20 Sep 2026",
        item: `Agricultural lime ${summary.tonnes} t`,
        plot: summary.plot,
        amount: summary.cost,
        method: summary.mode,
        status: summary.mode === "Pay now by M-Pesa" ? "Paid" : "Pending",
        receipt: summary.receipt,
        note: `${summary.rate} per acre · spread 2 – 3 weeks before planting`,
      },
      ...current,
    ]);
    setProgram((current) =>
      current.map((step) => (step.application === "Lime" ? { ...step, applied: true } : step)),
    );
    toast.notify(
      summary.mode === "Pay now by M-Pesa"
        ? `Lime paid for ${summary.plot} — ${summary.tonnes} tonnes, receipt ${summary.receipt}.`
        : `${summary.tonnes} tonnes of lime added to the ${summary.mode.toLowerCase()} for ${summary.plot}.`,
      "success",
    );
  };

  const logAmendment = (summary: {
    amendment: string;
    plot: string;
    quantity: string;
    cost: number;
    date: string;
  }) => {
    setAmendments((current) => [
      { id: `am-${current.length + 1}`, ...summary, date: "20 Sep 2026" },
      ...current,
    ]);
    if (summary.amendment.toLowerCase().includes("manure")) {
      setProgram((current) =>
        current.map((step) => (step.application === "Manure" ? { ...step, applied: true } : step)),
      );
    }
    if (summary.amendment.toLowerCase().includes("compost")) {
      setProgram((current) =>
        current.map((step) =>
          step.application === "Manure" ? { ...step, applied: true } : step,
        ),
      );
    }
    toast.notify(
      `${summary.quantity} of ${summary.amendment} recorded for ${summary.plot} and written into the farm diary.`,
      "success",
    );
  };

  const toggleProgramStep = (step: FertilizerStep) => {
    setProgram((current) =>
      current.map((item) => (item.id === step.id ? { ...item, applied: !item.applied } : item)),
    );
    toast.notify(
      step.applied
        ? `${step.application} marked as not applied yet.`
        : `${step.application} marked applied — the cost is written into the input records.`,
      "success",
    );
  };

  const togglePractice = (practice: SoilPractice, next: boolean, progress: number) => {
    setPractices((current) =>
      current.map((item) =>
        item.id === practice.id ? { ...item, started: next, progress } : item,
      ),
    );
    toast.notify(
      next
        ? `${practice.practice} saved at ${progress}% progress and added to the diary.`
        : `${practice.practice} paused — you can restart it from the improvement plan.`,
      next ? "success" : "info",
    );
  };

  const createCompost = (batch: CompostBatch) => {
    setBatches((current) => [batch, ...current]);
    toast.notify(
      `${batch.batch} created with ${batch.volume} of material. Turning reminders are on the task board.`,
      "success",
    );
  };

  const turnCompost = (batch: CompostBatch) => {
    setBatches((current) =>
      current.map((item) => (item.id === batch.id ? { ...item, turned: "Today" } : item)),
    );
    toast.notify(`${batch.batch} turn logged today — recorded in the compost log.`, "success");
  };

  const applyCompost = (batch: CompostBatch, plot: string, tonnes: string) => {
    setBatches((current) =>
      current.map((item) =>
        item.id === batch.id ? { ...item, stage: "Applied", appliedTo: plot } : item,
      ),
    );
    setAmendments((current) => [
      {
        id: `am-${current.length + 1}`,
        amendment: `Compost ${batch.batch}`,
        plot,
        quantity: `${tonnes} tonnes`,
        cost: 0,
        date: "20 Sep 2026",
      },
      ...current,
    ]);
    toast.notify(`${tonnes} tonnes of ${batch.batch} applied to ${plot}.`, "success");
  };

  const logMoisture = (week: MoistureWeek | null, summary: string) => {
    if (week) {
      setWeeks((current) =>
        current.map((item) => (item.id === week.id ? { ...item, logged: true } : item)),
      );
    }
    toast.notify(`Moisture reading saved — ${summary}.`, "success");
  };

  const planIrrigation = (cost: number, chosen: string[], method: string) => {
    setWeeks((current) =>
      current.map((week) => (chosen.includes(week.week) ? { ...week, logged: true } : week)),
    );
    setOrders((current) => [
      {
        id: `so-irr-${current.length + 1}`,
        date: "20 Sep 2026",
        item: `Irrigation plan · ${chosen.length} weeks`,
        plot: "Plot 1",
        amount: cost,
        method,
        status: "Pending",
        receipt: "—",
        note: `Watering scheduled for ${chosen[0] ?? "no week"}`,
      },
      ...current,
    ]);
    toast.notify(
      `Irrigation plan saved: ${chosen.length} weeks of watering at ${kes(cost)} using ${method.toLowerCase()}.`,
      "success",
    );
  };

  const saveSensor = (summary: {
    plot: string;
    action: string;
    cost: number;
    receipt: string;
  }) => {
    setSensors((current) =>
      current.map((sensor) =>
        sensor.plot === summary.plot
          ? {
              ...sensor,
              status: "Online",
              battery: 100,
              lastReading: "20 Sep 2026, 10:00",
              moisture: sensor.moisture || 32,
            }
          : sensor,
      ),
    );
    if (summary.cost > 0) {
      setOrders((current) => [
        {
          id: `so-sen-${current.length + 1}`,
          date: "20 Sep 2026",
          item: summary.action,
          plot: summary.plot,
          amount: summary.cost,
          method: "M-Pesa (GrowMO wallet)",
          status: "Paid",
          receipt: summary.receipt,
          note: "Sensor hardware and season SIM plan",
        },
        ...current,
      ]);
    }
    toast.notify(
      `${summary.action} completed on ${summary.plot}. Hourly readings resume from the next clock hour.`,
      "success",
    );
  };

  const addPlan = (label: string, detail: string, source: string) => {
    setPlans((current) => [{ id: `plan-${current.length + 1}`, label, detail, source }, ...current]);
    toast.notify(`“${label}” added to the season plan under ${source}.`, "success");
  };

  const settleOrder = (order: SoilOrder) => {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Paid", receipt: `QKSOIL${item.amount % 9000}PL` }
          : item,
      ),
    );
    toast.notify(`${order.item} settled — receipt and lab reference stored with the plot records.`, "success");
  };

  const exportSoil = (sections: string[], format: string) => {
    toast.notify(
      `${sections.length} soil sections exported as ${format}. Everything stays on the device until you share it.`,
      "success",
    );
  };

  const alertAction = (target: string) => {
    if (target === "fert-program") setView("program");
    else if (target === "lime") {
      setActivePlot(plots[0]);
      openModal("lime");
    } else if (target === "scheduler") {
      setView("scheduler");
      setPresetPlotId(plots.find((plot) => plot.status === "Overdue")?.id);
      openModal("book");
    } else if (target === "moisture") setView("moisture");
    else if (target === "settings") openModal("settings");
  };

  const openGuide = (plot: SoilPlot) => {
    setActivePlot(plot);
    openModal("sampling");
  };

  /* --------------------------------------------------------------- render */

  return (
    <main className="gm-app-page gm-soil-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="gm-soil-crumbs">
            <Link to="/app/dashboard" className="gm-soil-back">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Inputs & soil</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Soil health &amp; testing</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setDrawer("activity")}
            >
              <Activity /> Soil activity
            </button>
            <div className="gm-menu-wrap gm-soil-menu-wrap">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                aria-expanded={menu}
                onClick={() => setMenu((current) => !current)}
              >
                <MoreHorizontal /> More soil tools
              </button>
              {menu ? (
                <div className="gm-dropdown gm-soil-menu">
                  <button
                    type="button"
                    onClick={() => {
                      openModal("export");
                      setMenu(false);
                    }}
                  >
                    <Download /> Export soil records
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("share");
                      setMenu(false);
                    }}
                  >
                    <Share2 /> Share results with a third party
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("settings");
                      setMenu(false);
                    }}
                  >
                    <Settings2 /> Soil &amp; testing settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("faq");
                      setMenu(false);
                    }}
                  >
                    <HelpCircle /> FAQ &amp; glossary
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPresetLabId(undefined);
                      setPresetPlotId(undefined);
                      openModal("book");
                      setMenu(false);
                    }}
                  >
                    <FlaskConical /> Schedule a soil test
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openModal("compost-new");
                      setMenu(false);
                    }}
                  >
                    <Leaf /> Build a compost batch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      window.print();
                    }}
                  >
                    <Printer /> Print this page
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <Reveal>
          <SoilHero
            score={SOIL_CONTEXT.soilHealthScore}
            projected={SOIL_CONTEXT.projectedScore}
            components={SOIL_SCORE_COMPONENTS}
            kpis={kpis}
            alerts={[
              { label: "pH 5.8 · lime window closes 28 Sep", tone: "high" },
              { label: "Plot 5 never tested", tone: "high" },
              { label: `Programme ${kes(totals.programCost)}/acre`, tone: "low" },
              { label: `Skip list saves ${kes(totals.saved)}`, tone: "low" },
            ]}
            onScore={() => openModal("score")}
            actions={
              <>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => {
                    setPresetPlotId(undefined);
                    setPresetLabId(undefined);
                    openModal("book");
                  }}
                >
                  <Plus /> Schedule a soil test
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-gold"
                  onClick={() => {
                    setActivePlot(plots[0]);
                    openModal("lime");
                  }}
                >
                  <Mountain /> Order lime
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("program")}
                >
                  <Sprout /> Fertilizer programme
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("sampling")}
                >
                  <ClipboardCheck /> Sampling guide
                </button>
              </>
            }
          />
        </Reveal>

        <div className="gm-card p-2 mt-3">
          <PlannerSubtabs
            label="Soil sections"
            value={view}
            onChange={setView}
            items={[
              { id: "scheduler", label: "Test scheduler", icon: <CalendarDays />, count: plots.length },
              { id: "results", label: "Results dashboard", icon: <FlaskConical />, count: SOIL_PARAMETERS.length },
              { id: "program", label: "Fertilizer plan", icon: <Sprout />, count: program.length },
              { id: "history", label: "History & trend", icon: <TrendingUp />, count: history.length },
              { id: "sampling", label: "Sampling guide", icon: <ClipboardCheck />, count: 9 },
              { id: "labs", label: "Lab directory", icon: <Layers />, count: SOIL_LABS.length },
              { id: "plan", label: "Improvement plan", icon: <Leaf />, count: practices.length },
              { id: "moisture", label: "Moisture", icon: <Droplets />, count: weeks.length },
              { id: "records", label: "Orders & records", icon: <Coins />, count: orders.length },
            ]}
          />
        </div>

        {plans.length > 0 ? (
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Season plan"
              title={`${plans.length} soil action${plans.length === 1 ? "" : "s"} queued`}
              subtitle="Actions you added from the results, the score breakdown and the trend charts."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() =>
                    downloadText(
                      "growmo-soil-actions.csv",
                      [
                        ["Action", "Detail", "Source"],
                        ...plans.map((plan) => [plan.label, plan.detail, plan.source]),
                      ]
                        .map((row) => row.map(csvCell).join(","))
                        .join("\n"),
                    )
                  }
                >
                  <Download /> Export actions
                </button>
              }
            />
            <div className="gm-soil-feature-grid">
              {plans.map((plan) => (
                <div className="gm-soil-feature" key={plan.id}>
                  <CheckCircle2 />
                  <span>
                    <strong>{plan.label}</strong>
                    <small>
                      {plan.detail} · from {plan.source}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3">
          {view === "scheduler" ? (
            <SchedulerSection
              plots={plots}
              onOpenPlot={(plot) => {
                setActivePlot(plot);
                setDrawer("plot");
              }}
              onBook={(plot) => {
                setPresetPlotId(plot?.id);
                setPresetLabId(undefined);
                openModal("book");
              }}
              onLime={(plot) => {
                setActivePlot(plot);
                openModal("lime");
              }}
              onGuide={openGuide}
              onAlert={alertAction}
              onOpenLabs={() => setView("labs")}
              onOpenRecords={() => setView("records")}
            />
          ) : view === "results" ? (
            <ResultsSection
              parameters={SOIL_PARAMETERS}
              activePlot={activePlot}
              onOpenParameter={(parameter) => {
                setActiveParameter(parameter);
                openModal("parameter");
              }}
              onFix={(parameter) => {
                if (parameter.actionTarget === "lime") {
                  setActivePlot(activePlot);
                  openModal("lime");
                } else if (
                  parameter.actionTarget === "manure" ||
                  parameter.actionTarget === "dap" ||
                  parameter.actionTarget === "can"
                ) {
                  setAmendmentPreset("manure");
                  openModal("amendment");
                } else {
                  setActiveParameter(parameter);
                  openModal("program");
                }
              }}
              onScore={() => openModal("score")}
              onShare={() => openModal("share")}
              onGoProgram={() => setView("program")}
            />
          ) : view === "program" ? (
            <ProgramSection
              steps={program}
              skipped={SKIPPED_INPUTS}
              products={SOIL_PRODUCTS}
              onOpenStep={(step) => {
                setActiveProduct(
                  SOIL_PRODUCTS.find((product) => step.product.includes(product.product.split(" ")[0])) ??
                    SOIL_PRODUCTS[0],
                );
                openModal("product");
              }}
              onToggleStep={toggleProgramStep}
              onOpenProduct={(product) => {
                setActiveProduct(product);
                openModal("product");
              }}
              onOpenSkip={(skipped) => {
                setActiveSkip(skipped);
                openModal("skip");
              }}
              onOpenProgram={() => openModal("program")}
              onOrder={() => {
                setOrderSteps(program);
                openModal("inputs");
              }}
              onLogAmendment={(preset) => {
                setAmendmentPreset(preset);
                openModal("amendment");
              }}
            />
          ) : view === "history" ? (
            <HistorySection
              rows={history}
              onOpenRow={(row) => {
                setActiveHistory(row);
                openModal("history");
              }}
              onCompare={(row) => {
                setActiveHistory(row);
                openModal("compare");
              }}
              onPoint={(point) => {
                setActivePoint(point);
                openModal("point");
              }}
              onOpenScore={() => openModal("score")}
              onExport={() => openModal("export")}
              onBook={() => {
                setPresetPlotId(undefined);
                setPresetLabId(undefined);
                openModal("book");
              }}
            />
          ) : view === "sampling" ? (
            <SamplingSection
              language={language}
              plot={activePlot}
              checked={checkedKit}
              onLanguage={setLanguage}
              onToggleKit={(id) =>
                setCheckedKit((current) =>
                  current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
                )
              }
              onOpenGuide={openGuide}
              onPrint={() => window.print()}
            />
          ) : view === "labs" ? (
            <LabsSection
              labs={SOIL_LABS}
              onOpen={(lab) => {
                setActiveLab(lab);
                openModal("lab");
              }}
              onBook={(lab) => {
                setPresetLabId(lab.id);
                setPresetPlotId(undefined);
                openModal("book");
              }}
              onContact={(lab) => {
                setActiveLab(lab);
                openModal("lab-contact");
              }}
            />
          ) : view === "plan" ? (
            <PlanSection
              practices={practices}
              batches={batches}
              onOpenPractice={(practice) => {
                setActivePractice(practice);
                openModal("practice");
              }}
              onTogglePractice={(practice) => {
                if (practice.started) {
                  setPauseTarget(practice);
                  openModal("confirm-pause");
                } else {
                  togglePractice(practice, true, 10);
                }
              }}
              onOpenCompost={(batch) => {
                setActiveBatch(batch);
                openModal("compost-batch");
              }}
              onNewBatch={() => openModal("compost-new")}
              onLogAmendment={(preset) => {
                setAmendmentPreset(preset);
                openModal("amendment");
              }}
              onOrderLime={() => {
                setActivePlot(plots[0]);
                openModal("lime");
              }}
            />
          ) : view === "moisture" ? (
            <MoistureSection
              weeks={weeks}
              sensors={sensors}
              methods={methods}
              onLogWeek={(week) => {
                setActiveWeek(week);
                openModal("moisture-log");
              }}
              onPlanIrrigation={() => openModal("irrigation")}
              onSensor={(sensor) => {
                setActiveSensor(sensor);
                openModal("sensor");
              }}
              onMethodToggle={(id) =>
                setMethods((current) =>
                  current.map((method) =>
                    method.id === id ? { ...method, active: !method.active } : method,
                  ),
                )
              }
            />
          ) : (
            <RecordsSection
              orders={orders}
              amendments={amendments}
              activity={SOIL_ACTIVITY}
              onOpenOrder={(order) => {
                setActiveOrder(order);
                openModal("order");
              }}
              onOpenActivity={() => setDrawer("activity")}
              onExport={() => openModal("export")}
              onShare={() => openModal("share")}
            />
          )}
        </div>

        {amendments.length > 0 ? (
          <div className="gm-card p-3 mt-3">
            <DashboardSectionHeader
              eyebrow="Today's applications"
              title={`${amendments.length} amendment${amendments.length === 1 ? "" : "s"} logged this session`}
              subtitle="Written into the farm diary on the records page and costed in the finance page."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() => setView("records")}
                >
                  <ClipboardCheck /> Open the amendment log
                </button>
              }
            />
            <div className="gm-soil-feature-grid">
              {amendments.slice(0, 6).map((row) => (
                <div className="gm-soil-feature" key={row.id}>
                  <Leaf />
                  <span>
                    <strong>
                      {row.amendment} · {row.quantity}
                    </strong>
                    <small>
                      {row.plot} · {row.date} · {row.cost === 0 ? "no cash cost" : kes(row.cost)}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="gm-card p-3 mt-3">
          <DashboardSectionHeader
            eyebrow="Before you spend on fertilizer"
            title="The four-step soil routine"
            subtitle="Test, sample properly, follow the recommendation and retest next season — that is the whole discipline."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => setView("sampling")}
                >
                  <ClipboardCheck /> Sampling guide
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => setView("labs")}
                >
                  <FlaskConical /> Find a lab
                </button>
              </div>
            }
          />
          <div className="gm-soil-feature-grid">
            <div className="gm-soil-feature">
              <FlaskConical />
              <span>
                <strong>1 · Test</strong>
                <small>Annual per plot, comprehensive on new land and before certification.</small>
              </span>
            </div>
            <div className="gm-soil-feature">
              <Mountain />
              <span>
                <strong>2 · Sample properly</strong>
                <small>15 – 20 sub-samples, W pattern, plastic bucket, delivered within 48 hours.</small>
              </span>
            </div>
            <div className="gm-soil-feature">
              <Sprout />
              <span>
                <strong>3 · Follow the programme</strong>
                <small>Buy only the short nutrients, space lime away from DAP, split the nitrogen.</small>
              </span>
            </div>
            <div className="gm-soil-feature">
              <TrendingUp />
              <span>
                <strong>4 · Retest and compare</strong>
                <small>Same W pattern, same depth, same lab — then judge the direction of travel.</small>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- drawers */}

      <DashboardDrawer
        open={drawer === "activity"}
        title="Soil activity"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime w-100"
            onClick={() =>
              downloadText(
                "growmo-soil-activity.csv",
                [
                  ["Date", "Type", "Detail", "Who", "Cost"],
                  ...SOIL_ACTIVITY.map((row) => [row.date, row.type, row.detail, row.who, row.cost]),
                ]
                  .map((row) => row.map(csvCell).join(","))
                  .join("\n"),
              )
            }
          >
            <Download /> Export the activity log
          </button>
        }
      >
        <span className="gm-eyebrow">This season</span>
        {SOIL_ACTIVITY.map((row) => (
          <div className="gm-check-row" key={row.id}>
            <span className="gm-mega-icon">
              <FlaskConical />
            </span>
            <span style={{ flex: 1 }}>
              <strong>
                {row.type} · {row.date}
              </strong>
              <small>{row.detail}</small>
            </span>
            <span className="gm-chip gm-chip-ghost">
              {row.cost === 0 ? "No cost" : kes(row.cost)}
            </span>
          </div>
        ))}
        <span className="gm-eyebrow d-block mt-3">Shared access links</span>
        {shares.length === 0 ? (
          <p className="text-muted">
            No soil data has been shared yet. Use “Share results” to create a time-limited link for
            your agronomist, a buyer or an auditor.
          </p>
        ) : (
          shares.map((share) => (
            <div className="gm-check-row" key={share.code}>
              <span className="gm-mega-icon">
                <Share2 />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{share.who}</strong>
                <small>
                  {share.scope} · expires in {share.expiry}
                </small>
              </span>
              <span className="gm-code-chip">{share.code}</span>
            </div>
          ))
        )}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "plot"}
        title={`${activePlot.name} · soil file`}
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex flex-wrap gap-2 w-100">
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setPresetPlotId(activePlot.id);
                setPresetLabId(undefined);
                openModal("book");
              }}
            >
              <Plus /> Book a test
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setAmendmentPreset("manure");
                openModal("amendment");
              }}
            >
              <Leaf /> Log an amendment
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={() => openGuide(activePlot)}
            >
              <ClipboardCheck /> Sampling guide
            </button>
          </div>
        }
      >
        <SoilKv
          rows={[
            { label: "Area", value: activePlot.area },
            {
              label: "Crop",
              value: `${activePlot.crop}${activePlot.variety === "—" ? "" : ` · ${activePlot.variety}`}`,
            },
            { label: "Texture", value: activePlot.texture },
            { label: "Zone", value: activePlot.zone },
            { label: "pH", value: `${activePlot.ph.toFixed(1)} (target 6.3)` },
            { label: "Organic matter", value: `${activePlot.organicMatter.toFixed(1)}% (target 5%)` },
            { label: "Last test", value: `${activePlot.lastTest} · ${activePlot.lab}` },
            { label: "Next test", value: activePlot.nextTest },
            { label: "Status", value: <StatusChip label={activePlot.status} tone={activePlot.status === "Current" ? "low" : "medium"} /> },
          ]}
        />
        <p className="mt-3 mb-2">{activePlot.note}</p>
        <span className="gm-eyebrow d-block mt-3">Tests for this plot</span>
        {history
          .filter((row) => row.year.toLowerCase().includes(activePlot.name.toLowerCase().split(" ")[0]))
          .map((row) => (
            <div className="gm-check-row" key={row.id}>
              <span className="gm-mega-icon">
                <FlaskConical />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{row.year}</strong>
                <small>
                  pH {row.ph.toFixed(1)} · OM {row.organicMatter.toFixed(1)}% · N {row.nitrogen} ppm ·
                  score {row.score}
                </small>
              </span>
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => {
                  setActiveHistory(row);
                  openModal("history");
                }}
              >
                Report
              </button>
            </div>
          ))}
        {history.filter((row) =>
          row.year.toLowerCase().includes(activePlot.name.toLowerCase().split(" ")[0]),
        ).length === 0 ? (
          <p className="text-muted">
            This plot shares the farm-level KALRO samples. Book a dedicated test to build its own
            trend line.
          </p>
        ) : null}
        <span className="gm-eyebrow d-block mt-3">Lab orders for this plot</span>
        {orders
          .filter((order) => order.plot.includes(activePlot.name))
          .map((order) => (
            <div className="gm-check-row" key={order.id}>
              <span className="gm-mega-icon">
                <Coins />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{order.item}</strong>
                <small>
                  {order.date} · {order.status} · {order.receipt === "—" ? "no receipt yet" : order.receipt}
                </small>
              </span>
              <span className="font-display">{kes(order.amount)}</span>
            </div>
          ))}
        {orders.filter((order) => order.plot.includes(activePlot.name)).length === 0 ? (
          <p className="text-muted">
            No lab transaction recorded for this plot yet. The lime and manure orders cover it
            jointly with the neighbouring block.
          </p>
        ) : null}
      </DashboardDrawer>

      {/* -------------------------------------------------------- dialogs */}

      <BookTestWizard
        open={modal === "book"}
        presetPlotId={presetPlotId}
        presetLabId={presetLabId}
        onClose={closeModal}
        onBooked={bookTest}
      />

      <LimeOrderDialog
        open={modal === "lime"}
        plot={activePlot}
        onClose={closeModal}
        onOrdered={orderLime}
      />

      <SamplingGuideDialog
        open={modal === "sampling"}
        plot={activePlot}
        language={language}
        onClose={closeModal}
        onLanguage={setLanguage}
        onSaved={(plot, languageUsed) =>
          toast.notify(
            `Sampling instructions for ${plot.name} saved in ${languageUsed === "EN" ? "English" : "Kiswahili"} — available offline in the field.`,
            "success",
          )
        }
      />

      <LabDetailDialog
        open={modal === "lab"}
        lab={activeLab}
        onClose={closeModal}
        onBook={(lab) => {
          setPresetLabId(lab.id);
          setPresetPlotId(undefined);
          openModal("book");
        }}
        onContact={(lab) => {
          setActiveLab(lab);
          openModal("lab-contact");
        }}
      />

      <SoilContactDialog
        open={modal === "lab-contact"}
        lab={activeLab}
        onClose={closeModal}
        onSent={(channel, message) =>
          toast.notify(
            `${channel} sent to ${activeLab?.name ?? "the lab"}: “${message.slice(0, 52)}…” — a reply normally comes within a day.`,
            "success",
          )
        }
      />

      <ParameterDialog
        open={modal === "parameter"}
        parameter={activeParameter}
        hypothesis={
          activeParameter
            ? `${activeParameter.parameter} at ${activeParameter.display} sits ${activeParameter.status.toLowerCase()} against the ${activeParameter.optimalLabel} optimum for cabbage. ${
                activeParameter.status === "Low"
                  ? "This is directly limiting yield, so it is worth spending on this season."
                  : activeParameter.status === "High"
                    ? "Above optimum is not automatically good — it can lock out other nutrients and it is money already spent."
                    : "Keep it here with the current programme and re-check at the next test."
              }`
            : ""
        }
        onClose={closeModal}
        onFix={(parameter) => {
          if (parameter.actionTarget === "lime") {
            setActivePlot(plots[0]);
            openModal("lime");
          } else if (parameter.actionTarget === "manure") {
            setAmendmentPreset("manure");
            openModal("amendment");
          } else {
            openModal("program");
          }
        }}
        onAddPlan={(parameter, note) =>
          addPlan(parameter.parameter, note, "soil test results")
        }
      />

      <ScoreBreakdownDialog
        open={modal === "score"}
        score={SOIL_CONTEXT.soilHealthScore}
        projected={SOIL_CONTEXT.projectedScore}
        components={SOIL_SCORE_COMPONENTS}
        onClose={closeModal}
        onAction={(component) => {
          setActiveComponent(component);
          if (component.id === "sc-ph") {
            setActivePlot(plots[0]);
            openModal("lime");
          } else if (component.id === "sc-om") {
            setAmendmentPreset("manure");
            openModal("amendment");
          } else {
            openModal("program");
          }
        }}
      />

      <HistoryDetailDialog
        open={modal === "history"}
        row={activeHistory}
        onClose={closeModal}
        onCompare={(row) => {
          setActiveHistory(row);
          openModal("compare");
        }}
      />

      <CompareTestsDialog
        open={modal === "compare"}
        latest={activeHistory ?? latestTest}
        previous={history[history.indexOf(activeHistory ?? latestTest) - 1] ?? history[0]}
        onClose={closeModal}
        onAddPlan={(note) =>
          addPlan(`Close the gap after ${activeHistory?.year ?? latestTest.year}`, note, "trend analysis")
        }
      />

      <TrendPointDialog
        open={modal === "point"}
        point={activePoint}
        onClose={closeModal}
        onAddPlan={(point) =>
          addPlan(`${point.label} trend follow-up`, point.note ?? "Review this trend", "trend charts")
        }
      />

      <FertilizerProgramDialog
        open={modal === "program"}
        steps={program}
        total={totals.programCost}
        saved={totals.saved}
        onClose={closeModal}
        onToggle={toggleProgramStep}
        onExport={() => {
          downloadText(
            "growmo-fertilizer-programme.csv",
            [
              ["Application", "Timing", "Product", "Rate/acre", "Purpose", "Cost", "Applied"],
              ...program.map((step) => [
                step.application,
                step.timing,
                step.product,
                step.ratePerAcre,
                step.purpose,
                step.cost,
                step.applied ? "yes" : "no",
              ]),
            ]
              .map((row) => row.map(csvCell).join(","))
              .join("\n"),
          );
          toast.notify("Fertilizer programme exported as CSV — 7 application lines with costs.", "success");
        }}
        onOrder={(selected) => {
          setOrderSteps(selected);
          openModal("inputs");
        }}
      />

      <ProductDetailDialog
        open={modal === "product"}
        product={activeProduct}
        products={SOIL_PRODUCTS}
        onClose={closeModal}
        onAddToOrder={(product) => {
          setOrderSteps(
            program.map((step) =>
              step.product.split(" ")[0] === product.product.split(" ")[0]
                ? { ...step, product: product.product }
                : step,
            ),
          );
          setView("program");
          openModal("inputs");
        }}
      />

      <SkipReasonDialog
        open={modal === "skip"}
        skipped={activeSkip}
        onClose={closeModal}
        onConfirm={(skipped) =>
          toast.notify(
            `${skipped.input} stays out of the programme — ${kes(skipped.saved)} saved and the lab reference is stored as evidence.`,
            "success",
          )
        }
      />

      <AmendmentLogDialog
        open={modal === "amendment"}
        preset={amendmentPreset}
        onClose={closeModal}
        onLogged={logAmendment}
      />

      <CompostBatchWizard
        open={modal === "compost-new"}
        batches={batches}
        onClose={closeModal}
        onCreated={createCompost}
      />

      <CompostBatchDialog
        open={modal === "compost-batch"}
        batch={activeBatch}
        onClose={closeModal}
        onTurned={turnCompost}
        onApplied={applyCompost}
      />

      <PracticePlanDialog
        open={modal === "practice"}
        practice={activePractice}
        onClose={closeModal}
        onChanged={togglePractice}
      />

      <ConfirmSoilDialog
        open={modal === "confirm-pause"}
        title={`Pause ${pauseTarget?.practice ?? "this practice"}?`}
        body={`${pauseTarget?.impact ?? ""} Pausing removes it from this season's progress chart, but the diary entries stay.`}
        confirmLabel="Pause the practice"
        onClose={closeModal}
        onConfirm={() => {
          if (pauseTarget) togglePractice(pauseTarget, false, pauseTarget.progress);
        }}
      />

      <MoistureLogDialog
        open={modal === "moisture-log"}
        week={activeWeek}
        onClose={closeModal}
        onLogged={logMoisture}
      />

      <IrrigationPlanDialog
        open={modal === "irrigation"}
        weeks={weeks}
        onClose={closeModal}
        onApplied={planIrrigation}
      />

      <SensorWizard
        open={modal === "sensor"}
        sensor={activeSensor}
        onClose={closeModal}
        onSaved={saveSensor}
      />

      <OrderDetailDialog
        open={modal === "order"}
        order={activeOrder}
        onClose={closeModal}
        onSettle={settleOrder}
        onRepeat={(order) => {
          setPresetPlotId(SOIL_PLOTS.find((plot) => order.plot.includes(plot.name))?.id);
          setPresetLabId(undefined);
          openModal("book");
        }}
      />

      <InputOrderWizard
        open={modal === "inputs"}
        steps={orderSteps}
        onClose={closeModal}
        onOrdered={(summary) => {
          setOrders((current) => [
            {
              id: `so-order-${current.length + 1}`,
              date: "20 Sep 2026",
              item: `Soil-test input order · ${summary.lines} lines`,
              plot: "Plot 1 & 2",
              amount: summary.total,
              method: summary.mode,
              status: summary.mode === "Pay now by M-Pesa" ? "Paid" : "Pending",
              receipt: summary.receipt,
              note: "Lime, DAP, CAN, foliar corrections and manure",
            },
            ...current,
          ]);
          toast.notify(
            `${summary.lines} input lines ordered at ${kes(summary.total)} via ${summary.mode.toLowerCase()}.`,
            "success",
          );
        }}
      />

      <SoilShareDialog
        open={modal === "share"}
        onClose={closeModal}
        onShared={(summary) => {
          setShares((current) => [summary, ...current]);
          toast.notify(
            `Access link created for ${summary.who} — valid for ${summary.expiry}, code ${summary.code}.`,
            "success",
          );
        }}
      />

      <SoilExportDialog
        open={modal === "export"}
        orders={orders}
        onClose={closeModal}
        onExported={exportSoil}
      />

      <SoilSettingsDialog
        open={modal === "settings"}
        onClose={closeModal}
        onSave={() => toast.notify("Soil settings saved — reminders, alerts and sharing updated.", "success")}
      />

      <SoilFaqDialog
        open={modal === "faq"}
        faq={SOIL_FAQ}
        glossary={SOIL_GLOSSARY}
        onClose={closeModal}
        onAskAgronomist={() => {
          closeModal();
          void navigate({ to: "/app/community" });
        }}
        onOpenLibrary={() => {
          closeModal();
          void navigate({ to: "/app/community" });
        }}
      />

      {activeComponent ? (
        <SoilCalloutSlot component={activeComponent} onClear={() => setActiveComponent(null)} />
      ) : null}
    </main>
  );
}

/* Keeps the selected score component visible as a small contextual note. */
function SoilCalloutSlot({
  component,
  onClear,
}: {
  component: ScoreComponent;
  onClear: () => void;
}) {
  return (
    <div className="gm-card p-3 mt-3">
      <DashboardSectionHeader
        eyebrow="Working on"
        title={component.label}
        subtitle={component.nextStep}
        action={
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onClear}>
            <CheckCircle2 /> Done working on this
          </button>
        }
      />
      <ProgressLine
        value={(component.score / component.max) * 100}
        label={`${component.label} score`}
      />
      <div className="d-flex flex-wrap gap-2 mt-3">
        <span className="gm-chip gm-chip-ghost">
          <Truck /> Next step: {component.nextStep}
        </span>
        <span className="gm-chip gm-chip-gold">
          <Timer /> Retest after harvest to confirm the lift
        </span>
      </div>
    </div>
  );
}
