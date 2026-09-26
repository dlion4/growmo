/* ============================================================================
   PAGE 23 — MULTI-SEASON PLANNING & CROP ROTATION (/app/seasons)
   Annual calendars, soil-first rotations, long-range financial and climate plans.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CloudRain,
  Download,
  FileSpreadsheet,
  FileText,
  Leaf,
  ListChecks,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  TimerReset,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  SeasonsModalHub,
  type SeasonsModalId,
} from "../../components/app/SeasonsModals";
import {
  CalendarPlotSummary,
  PlanLegend,
  RotationBenefitCard,
  SeasonsHero,
} from "../../components/app/SeasonsWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  CALENDAR_MONTHS,
  CALENDAR_PLOTS,
  type CalendarPlot,
  CLIMATE_SCENARIOS,
  COVER_CROPS,
  type CoverCrop,
  FALLOW_TASKS,
  type FallowTask,
  FINANCIAL_PROJECTIONS,
  INTERCROP_PLANS,
  type IntercropPlan,
  PROJECTION_TOTAL,
  type ProjectionRow,
  planTone,
  ROTATION_BENEFITS,
  ROTATION_PLAN,
  ROTATION_RULES,
  SEASON_COMPARISON,
  SEASON_CONTEXT,
  SEASON_PLAN_REGISTER,
  taskTone,
} from "../../data/app/seasons";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/seasons")({
  component: SeasonsPage,
});

type View =
  | "calendar"
  | "rotation"
  | "projection"
  | "compare"
  | "recovery"
  | "intercrop"
  | "climate";
type CalendarYear = "2027" | "2028" | "2029";
type DrawerId = "plot" | "plan" | "cover" | "intercrop" | null;

function SeasonsPage() {
  const toast = useToast();
  const [view, setView] = useState<View>("calendar");
  const [calendarYear, setCalendarYear] = useState<CalendarYear>("2027");
  const [plans, setPlans] = useState(SEASON_PLAN_REGISTER);
  const [fallowTasks, setFallowTasks] = useState(FALLOW_TASKS);
  const [intercrops, setIntercrops] = useState(INTERCROP_PLANS);
  const [modal, setModal] = useState<SeasonsModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedPlot, setSelectedPlot] = useState<CalendarPlot | null>(
    CALENDAR_PLOTS[0],
  );
  const [selectedPlan, setSelectedPlan] = useState(SEASON_PLAN_REGISTER[0]);
  const [selectedCover, setSelectedCover] = useState<CoverCrop | null>(
    COVER_CROPS[0],
  );
  const [selectedFallow, setSelectedFallow] = useState<FallowTask | null>(
    FALLOW_TASKS[2],
  );
  const [selectedIntercrop, setSelectedIntercrop] =
    useState<IntercropPlan | null>(INTERCROP_PLANS[0]);
  const [selectedProjection, setSelectedProjection] =
    useState<ProjectionRow | null>(FINANCIAL_PROJECTIONS[2]);
  const [menu, setMenu] = useState(false);
  const [planSearch, setPlanSearch] = useState("");
  const [planStatus, setPlanStatus] = useState<
    "All" | (typeof plans)[number]["status"]
  >("All");
  const [planPage, setPlanPage] = useState(1);
  const [projectionSearch, setProjectionSearch] = useState("");
  const [projectionPage, setProjectionPage] = useState(1);
  const [fallowFilter, setFallowFilter] = useState<
    "All" | FallowTask["status"]
  >("All");
  const [fallowPage, setFallowPage] = useState(1);
  const [intercropSearch, setIntercropSearch] = useState("");
  const [intercropPage, setIntercropPage] = useState(1);

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        const matchesSearch =
          `${plan.plan} ${plan.plot} ${plan.crop} ${plan.status}`
            .toLowerCase()
            .includes(planSearch.toLowerCase());
        return (
          matchesSearch && (planStatus === "All" || plan.status === planStatus)
        );
      }),
    [plans, planSearch, planStatus],
  );
  const planPages = Math.max(1, Math.ceil(filteredPlans.length / 5));
  const shownPlans = filteredPlans.slice((planPage - 1) * 5, planPage * 5);

  const filteredProjections = useMemo(
    () =>
      FINANCIAL_PROJECTIONS.filter((projection) =>
        `${projection.season} ${projection.crop} ${projection.status}`
          .toLowerCase()
          .includes(projectionSearch.toLowerCase()),
      ),
    [projectionSearch],
  );
  const projectionPages = Math.max(
    1,
    Math.ceil(filteredProjections.length / 3),
  );
  const shownProjections = filteredProjections.slice(
    (projectionPage - 1) * 3,
    projectionPage * 3,
  );

  const filteredFallow = useMemo(
    () =>
      fallowTasks.filter(
        (task) => fallowFilter === "All" || task.status === fallowFilter,
      ),
    [fallowTasks, fallowFilter],
  );
  const fallowPages = Math.max(1, Math.ceil(filteredFallow.length / 5));
  const shownFallow = filteredFallow.slice(
    (fallowPage - 1) * 5,
    fallowPage * 5,
  );

  const filteredIntercrops = useMemo(
    () =>
      intercrops.filter((plan) =>
        `${plan.main} ${plan.intercrop} ${plan.plot} ${plan.compatibility}`
          .toLowerCase()
          .includes(intercropSearch.toLowerCase()),
      ),
    [intercrops, intercropSearch],
  );
  const intercropPages = Math.max(1, Math.ceil(filteredIntercrops.length / 4));
  const shownIntercrops = filteredIntercrops.slice(
    (intercropPage - 1) * 4,
    intercropPage * 4,
  );

  const openPlot = (plot: CalendarPlot) => {
    setSelectedPlot(plot);
    setDrawer("plot");
  };
  const openPlan = (id: string) => {
    const plan = plans.find((item) => item.id === id);
    if (plan) {
      setSelectedPlan(plan);
      setDrawer("plan");
    }
  };
  const openCover = (cover: CoverCrop) => {
    setSelectedCover(cover);
    setDrawer("cover");
  };
  const openIntercrop = (plan: IntercropPlan) => {
    setSelectedIntercrop(plan);
    setDrawer("intercrop");
  };

  const savedWorkflow = (message: string) => {
    if (modal === "new-plan") {
      setPlans((items) => [
        {
          id: `SP-${String(items.length + 1).padStart(3, "0")}`,
          plan: "New Kiambu season plan",
          plot: "Plot 1",
          starts: "1 Mar 2028",
          crop: "Rosecoco beans",
          acreage: 0.52,
          status: "Draft",
        },
        ...items,
      ]);
    }
    if (modal === "archive-plan") {
      setPlans((items) => items.filter((plan) => plan.id !== selectedPlan.id));
    }
    if (modal === "complete-fallow-task" && selectedFallow) {
      setFallowTasks((items) =>
        items.map((task) =>
          task.id === selectedFallow.id ? { ...task, status: "Done" } : task,
        ),
      );
    }
    if (modal === "create-intercrop") {
      setIntercrops((items) => [
        {
          id: `INT-${String(items.length + 1).padStart(3, "0")}`,
          main: "Cabbage Gloria F1",
          intercrop: "Onions on edges",
          spacing: "Cabbage bed with onion border",
          benefit: "Diversifies the crop edge and supports pest management",
          compatibility: "Good",
          plot: "Plot 1",
        },
        ...items,
      ]);
    }
    toast.notify(message, "success");
  };

  return (
    <div>
      <SeasonsHero
        metrics={[
          {
            icon: CalendarRange,
            value: "3 years",
            label: "planning horizon",
            note: "2027–2029 rotation map",
          },
          {
            icon: Sprout,
            value: `${SEASON_CONTEXT.rotationScore}/100`,
            label: "rotation health",
            note: "Legume, rest and family checks pass",
          },
          {
            icon: Banknote,
            value: kes(SEASON_CONTEXT.projectedProfit),
            label: "projected Plot 1 profit",
            note: "Across five planned crop windows",
          },
          {
            icon: Leaf,
            value: kes(SEASON_CONTEXT.soilSavings),
            label: "soil-input saving",
            note: "Nitrogen and fewer sprays estimated",
          },
        ]}
        actions={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("generate-rotation")}
            >
              <Sparkles /> Build rotation
            </button>
            <div className="gm-dropdown">
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setMenu((open) => !open)}
                aria-expanded={menu}
              >
                <MoreHorizontal /> Plan tools
              </button>
              {menu ? (
                <div className="gm-menu">
                  <p className="gm-menuhead">Multi-season tools</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("new-plan");
                    }}
                  >
                    <Plus /> Add season plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("share-plan");
                    }}
                  >
                    <Send /> Share plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("export-calendar");
                    }}
                  >
                    <Download /> Export calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("calendar-settings");
                    }}
                  >
                    <Pencil /> Calendar settings
                  </button>
                </div>
              ) : null}
            </div>
          </>
        }
      />

      <PlannerSubtabs
        value={view}
        label="Multi-season planning workspace"
        onChange={setView}
        items={[
          {
            id: "calendar",
            label: "Farm calendar",
            icon: <CalendarRange />,
            count: 12,
          },
          { id: "rotation", label: "Rotation", icon: <Sprout />, count: 3 },
          {
            id: "projection",
            label: "3-year projection",
            icon: <TrendingUp />,
            count: 5,
          },
          {
            id: "compare",
            label: "Season comparison",
            icon: <ClipboardCheck />,
            count: 3,
          },
          { id: "recovery", label: "Cover & fallow", icon: <Leaf />, count: 8 },
          {
            id: "intercrop",
            label: "Intercropping",
            icon: <Wheat />,
            count: 6,
          },
          {
            id: "climate",
            label: "Climate plan",
            icon: <CloudRain />,
            count: 2,
          },
        ]}
      />

      {view === "calendar" ? (
        <CalendarContent
          year={calendarYear}
          onYear={setCalendarYear}
          plans={shownPlans}
          planSearch={planSearch}
          planStatus={planStatus}
          planPage={planPage}
          planPages={planPages}
          totalPlans={filteredPlans.length}
          onSearch={(value) => {
            setPlanSearch(value);
            setPlanPage(1);
          }}
          onStatus={(status) => {
            setPlanStatus(status);
            setPlanPage(1);
          }}
          onPage={setPlanPage}
          onOpenPlot={openPlot}
          onOpenPlan={openPlan}
          onModal={setModal}
        />
      ) : null}
      {view === "rotation" ? <RotationContent onModal={setModal} /> : null}
      {view === "projection" ? (
        <ProjectionContent
          rows={shownProjections}
          search={projectionSearch}
          page={projectionPage}
          pages={projectionPages}
          total={filteredProjections.length}
          onSearch={(value) => {
            setProjectionSearch(value);
            setProjectionPage(1);
          }}
          onPage={setProjectionPage}
          onProjection={(projection) => {
            setSelectedProjection(projection);
            setModal("financial-assumptions");
          }}
          onModal={setModal}
        />
      ) : null}
      {view === "compare" ? <ComparisonContent onModal={setModal} /> : null}
      {view === "recovery" ? (
        <RecoveryContent
          covers={COVER_CROPS}
          tasks={shownFallow}
          status={fallowFilter}
          page={fallowPage}
          pages={fallowPages}
          total={filteredFallow.length}
          onStatus={(status) => {
            setFallowFilter(status);
            setFallowPage(1);
          }}
          onPage={setFallowPage}
          onCover={openCover}
          onTask={(task) => {
            setSelectedFallow(task);
            setModal("fallow-task-detail");
          }}
          onModal={setModal}
        />
      ) : null}
      {view === "intercrop" ? (
        <IntercropContent
          plans={shownIntercrops}
          search={intercropSearch}
          page={intercropPage}
          pages={intercropPages}
          total={filteredIntercrops.length}
          onSearch={(value) => {
            setIntercropSearch(value);
            setIntercropPage(1);
          }}
          onPage={setIntercropPage}
          onOpen={openIntercrop}
          onModal={setModal}
        />
      ) : null}
      {view === "climate" ? <ClimateContent onModal={setModal} /> : null}

      <SeasonsDrawer
        drawer={drawer}
        plot={selectedPlot}
        plan={selectedPlan}
        cover={selectedCover}
        intercrop={selectedIntercrop}
        onClose={() => setDrawer(null)}
        onModal={setModal}
      />
      <SeasonsModalHub
        active={modal}
        plot={selectedPlot}
        coverCrop={selectedCover}
        fallowTask={selectedFallow}
        intercrop={selectedIntercrop}
        projection={selectedProjection}
        onClose={() => setModal(null)}
        onSaved={savedWorkflow}
      />
    </div>
  );
}

function CalendarContent({
  year,
  onYear,
  plans,
  planSearch,
  planStatus,
  planPage,
  planPages,
  totalPlans,
  onSearch,
  onStatus,
  onPage,
  onOpenPlot,
  onOpenPlan,
  onModal,
}: {
  year: CalendarYear;
  onYear: (year: CalendarYear) => void;
  plans: typeof SEASON_PLAN_REGISTER;
  planSearch: string;
  planStatus: "All" | (typeof SEASON_PLAN_REGISTER)[number]["status"];
  planPage: number;
  planPages: number;
  totalPlans: number;
  onSearch: (value: string) => void;
  onStatus: (
    status: "All" | (typeof SEASON_PLAN_REGISTER)[number]["status"],
  ) => void;
  onPage: (page: number) => void;
  onOpenPlot: (plot: CalendarPlot) => void;
  onOpenPlan: (id: string) => void;
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Annual farm view"
          title={`${year} crops, recovery and market windows`}
          subtitle="A 12-month Gantt-style farm calendar keeps every plot in a useful production, recovery or preparation phase."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("season-reminder")}
              >
                <CalendarDays /> Add reminder
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("new-plan")}
              >
                <Plus /> Add plan
              </button>
            </div>
          }
        />
        <PlannerSubtabs
          value={year}
          label="Calendar year"
          onChange={onYear}
          items={[
            { id: "2027", label: "2027 live plan", icon: <CalendarRange /> },
            { id: "2028", label: "2028 rotation" },
            { id: "2029", label: "2029 outlook" },
          ]}
        />
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <PlanLegend />
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm"
            onClick={() => onModal("add-plot-cycle")}
          >
            <Plus /> Add plot cycle
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Plot & current use</th>
                {CALENDAR_MONTHS.map((month) => (
                  <th key={month}>{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CALENDAR_PLOTS.map((plot) => (
                <tr key={plot.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onOpenPlot(plot)}
                    >
                      <strong>{plot.plot}</strong>
                      <small>
                        {plot.acreage} acres · {plot.currentCrop}
                      </small>
                    </button>
                  </td>
                  {plot.months.map((month) => (
                    <td key={month.month}>
                      <StatusChip label={month.label} tone={month.tone} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="row g-3 mt-1">
        <div className="col-lg-4">
          <Reveal delay={0.04}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Plot pulse"
                title="This farm calendar"
                subtitle="Four plots, each with an assigned job."
              />
              <div className="gm-check-list mt-3">
                {CALENDAR_PLOTS.map((plot) => (
                  <CalendarPlotSummary
                    key={plot.id}
                    plot={plot}
                    onOpen={() => onOpenPlot(plot)}
                  />
                ))}
              </div>
            </section>
          </Reveal>
        </div>
        <div className="col-lg-8">
          <Reveal delay={0.08}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Plan register"
                title="Ten planned crop windows"
                subtitle="Search, filter and open each plan to keep its crop, acreage and season decision clear."
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={() => onModal("export-calendar")}
                  >
                    <FileSpreadsheet /> Export
                  </button>
                }
              />
              <div className="gm-toolbar mt-3">
                <label className="gm-search">
                  <Search />
                  <input
                    value={planSearch}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder="Search plan, crop or plot"
                  />
                </label>
                <select
                  className="gm-select"
                  value={planStatus}
                  onChange={(event) =>
                    onStatus(
                      event.target.value as
                        | "All"
                        | (typeof SEASON_PLAN_REGISTER)[number]["status"],
                    )
                  }
                  aria-label="Filter plan status"
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Scheduled</option>
                  <option>Draft</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="gm-table-wrap mt-3">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Start</th>
                      <th>Crop</th>
                      <th>Land</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td>
                          <button
                            type="button"
                            className="gm-table-link"
                            onClick={() => onOpenPlan(plan.id)}
                          >
                            <strong>{plan.plan}</strong>
                            <small>
                              {plan.id} · {plan.plot}
                            </small>
                          </button>
                        </td>
                        <td>{plan.starts}</td>
                        <td>{plan.crop}</td>
                        <td>{plan.acreage} ac</td>
                        <td>
                          <StatusChip
                            label={plan.status}
                            tone={planTone(plan.status)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={planPage}
                total={planPages}
                perPage={5}
                totalItems={totalPlans}
                onChange={onPage}
              />
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function RotationContent({
  onModal,
}: {
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="AI-suggested · Plot 1"
          title="A high-value rotation that gives the soil a turn"
          subtitle="0.52 acres · Clay loam · pH 5.8 · Githunguri, Kiambu. Heavy feeders are separated by legumes and a managed recovery window."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("edit-rotation")}
              >
                <Pencil /> Adjust sequence
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("approve-rotation")}
              >
                <CheckCircle2 /> Approve rotation
              </button>
            </div>
          }
        />
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Year 1</th>
                <th>Year 2</th>
                <th>Year 3</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {ROTATION_PLAN.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.season}</strong>
                    <small>{row.note}</small>
                  </td>
                  <td>{row.yearOne}</td>
                  <td>{row.yearTwo}</td>
                  <td>{row.yearThree}</td>
                  <td>{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("rotation-detail")}
          >
            <FileText /> Rotation detail
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("change-rotation-crop")}
          >
            <Sprout /> Change a crop
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("rotation-rules")}
          >
            <ShieldCheck /> Rule evidence
          </button>
        </div>
      </section>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <Reveal delay={0.05}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Checks applied"
                title="Six rotation rules pass"
                subtitle="GrowMO checks crop families, nutrient demand, roots and recovery before recommending a sequence."
              />
              <div className="gm-table-wrap mt-3">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>Rule</th>
                      <th>Plan check</th>
                      <th>Why it matters</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROTATION_RULES.map((rule) => (
                      <tr key={rule.id}>
                        <td>
                          <strong>{rule.rule}</strong>
                        </td>
                        <td>{rule.result}</td>
                        <td>{rule.note}</td>
                        <td>
                          <StatusChip label={rule.state} tone="low" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </Reveal>
        </div>
        <div className="col-lg-5">
          <Reveal delay={0.1}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Soil-first wins"
                title="Estimated impact"
                subtitle="Planning estimates are guides; actual yield and soil records keep the next rotation sharper."
              />
              <div className="row g-2 mt-1">
                {ROTATION_BENEFITS.map((benefit) => (
                  <div className="col-sm-6" key={benefit.id}>
                    <button
                      type="button"
                      className="w-100 border-0 bg-transparent p-0 text-start"
                      onClick={() => onModal("benefit-detail")}
                    >
                      <RotationBenefitCard
                        value={benefit.impact}
                        title={benefit.benefit}
                        note={benefit.value}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function ProjectionContent({
  rows,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onProjection,
  onModal,
}: {
  rows: ProjectionRow[];
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onProjection: (projection: ProjectionRow) => void;
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Plot 1 · three-year money view"
          title="Every crop choice is a long-range cash decision"
          subtitle="Costs, revenue and profit assumptions are linked to the soil-first sequence rather than viewed as isolated seasons."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("financial-scenario")}
              >
                <Sparkles /> New scenario
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("export-projection")}
              >
                <Download /> Export
              </button>
            </div>
          }
        />
        <div className="row g-3 mt-1">
          <FinancialMetric
            value={kes(PROJECTION_TOTAL.cost)}
            label="3-year planned cost"
            note="Inputs, labour and soil recovery"
          />
          <FinancialMetric
            value={kes(PROJECTION_TOTAL.revenue)}
            label="3-year expected revenue"
            note="Gross crop-sales estimate"
          />
          <FinancialMetric
            value={kes(PROJECTION_TOTAL.profit)}
            label="3-year profit"
            note="Rotation-adjusted projection"
          />
          <FinancialMetric
            value={kes(PROJECTION_TOTAL.profitPerYear)}
            label="profit per acre/year"
            note="Based on Plot 1 plan"
          />
        </div>
        <div className="gm-toolbar mt-4">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search crop or season"
            />
          </label>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
            onClick={() => onModal("financial-assumptions")}
          >
            <Pencil /> Edit assumptions
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>Crop</th>
                <th>Cost</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Cumulative profit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onProjection(row)}
                    >
                      <strong>{row.season}</strong>
                      <small>{row.id}</small>
                    </button>
                  </td>
                  <td>{row.crop}</td>
                  <td>{kes(row.cost)}</td>
                  <td>{kes(row.revenue)}</td>
                  <td>
                    <strong>{kes(row.profit)}</strong>
                  </td>
                  <td>{kes(row.cumulative)}</td>
                  <td>
                    <StatusChip
                      label={row.status}
                      tone={planTone(row.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>3-year total</th>
                <th></th>
                <th>{kes(PROJECTION_TOTAL.cost)}</th>
                <th>{kes(PROJECTION_TOTAL.revenue)}</th>
                <th>{kes(PROJECTION_TOTAL.profit)}</th>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={3}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}
function FinancialMetric({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="col-sm-6 col-xl-3">
      <DashboardMetric
        icon={Banknote}
        value={value}
        label={label}
        note={note}
      />
    </div>
  );
}

function ComparisonContent({
  onModal,
}: {
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Cabbage Gloria F1 · Kiambu"
          title="Choose the market window, not just the crop"
          subtitle="Compare realistic yield, market, cost and weather trade-offs before putting cabbage in a season plan."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("compare-crop")}
              >
                <Plus /> Compare crop
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("save-comparison")}
              >
                <BadgeCheck /> Save decision
              </button>
            </div>
          }
        />
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <TrendingUp />
          </span>
          <div style={{ flex: 1 }}>
            <span className="gm-eyebrow">GrowMO recommendation</span>
            <h3 className="font-display mb-1">
              Short rains are the strongest overall Cabbage Gloria F1 window
            </h3>
            <p className="mb-0 text-muted">
              The January price outlook offsets higher black-rot watchfulness,
              as long as drainage and spray timing are protected.
            </p>
          </div>
          <StatusChip label="Best overall" tone="low" />
        </div>
        <div className="gm-table-wrap mt-4">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Short rains · Oct–Jan</th>
                <th>Long rains · Mar–Jun</th>
                <th>Irrigated · Jun–Sep</th>
              </tr>
            </thead>
            <tbody>
              {SEASON_COMPARISON.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.factor}</strong>
                  </td>
                  <td>{row.shortRains}</td>
                  <td>{row.longRains}</td>
                  <td>{row.irrigated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => onModal("season-compare")}
          >
            <FileText /> Open comparison detail
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => onModal("financial-scenario")}
          >
            <Banknote /> Model a price scenario
          </button>
        </div>
      </section>
    </div>
  );
}

function RecoveryContent({
  covers,
  tasks,
  status,
  page,
  pages,
  total,
  onStatus,
  onPage,
  onCover,
  onTask,
  onModal,
}: {
  covers: CoverCrop[];
  tasks: FallowTask[];
  status: "All" | FallowTask["status"];
  page: number;
  pages: number;
  total: number;
  onStatus: (status: "All" | FallowTask["status"]) => void;
  onPage: (page: number) => void;
  onCover: (cover: CoverCrop) => void;
  onTask: (task: FallowTask) => void;
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Dry break · Jul–Sep"
          title="A fallow period can still work for your soil"
          subtitle="Use living covers, compost and timed incorporation to recover Plot 1 before the next high-value crop."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("create-cover-plan")}
            >
              <Leaf /> Create cover plan
            </button>
          }
        />
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Cover crop</th>
                <th>Purpose</th>
                <th>Seeding rate</th>
                <th>Cost / acre</th>
                <th>Soil benefit</th>
                <th>Fit</th>
              </tr>
            </thead>
            <tbody>
              {covers.map((cover) => (
                <tr key={cover.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onCover(cover)}
                    >
                      <strong>{cover.name}</strong>
                      <small>{cover.botanical}</small>
                    </button>
                  </td>
                  <td>{cover.purpose}</td>
                  <td>{cover.seedingRate}</td>
                  <td>{kes(cover.cost)}</td>
                  <td>{cover.benefit}</td>
                  <td>
                    <StatusChip
                      label={cover.suitability}
                      tone={
                        cover.suitability === "Recommended" ? "low" : "medium"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Fallow management checklist"
          title="Eight deliberate tasks before the next crop"
          subtitle="Each field task carries a timing and owner so the recovery interval does not become an unplanned gap."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("reschedule-fallow-task")}
            >
              <TimerReset /> Reschedule task
            </button>
          }
        />
        <div className="gm-toolbar mt-3">
          <select
            className="gm-select"
            value={status}
            onChange={(event) => {
              onStatus(event.target.value as "All" | FallowTask["status"]);
            }}
            aria-label="Filter fallow task status"
          >
            <option>All</option>
            <option>Due now</option>
            <option>Upcoming</option>
            <option>Done</option>
          </select>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
            onClick={() => onModal("complete-fallow-task")}
          >
            <CheckCircle2 /> Mark current task done
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Timing</th>
                <th>Field action</th>
                <th>Owner</th>
                <th>Best timing</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.week}</strong>
                  </td>
                  <td>{task.action}</td>
                  <td>{task.owner}</td>
                  <td>{task.timing}</td>
                  <td>
                    <StatusChip
                      label={task.status}
                      tone={taskTone(task.status)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onTask(task)}
                    >
                      Open <ChevronRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}

function IntercropContent({
  plans,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onOpen,
  onModal,
}: {
  plans: IntercropPlan[];
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onOpen: (plan: IntercropPlan) => void;
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <section className="gm-card mt-4">
      <DashboardSectionHeader
        eyebrow="Crop pairing plans"
        title="Make one plot do more without crowding it"
        subtitle="Compatibility considers spacing, crop family, canopy, harvest timing and the field-management load."
        action={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("compatibility-check")}
            >
              <ShieldCheck /> Check pairing
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("create-intercrop")}
            >
              <Plus /> Create plan
            </button>
          </div>
        }
      />
      <div className="gm-toolbar mt-3">
        <label className="gm-search">
          <Search />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search crop pair, plot or compatibility"
          />
        </label>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Main crop</th>
              <th>Intercrop</th>
              <th>Spacing pattern</th>
              <th>Benefit</th>
              <th>Target</th>
              <th>Compatibility</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link"
                    onClick={() => onOpen(plan)}
                  >
                    <strong>{plan.main}</strong>
                    <small>{plan.id}</small>
                  </button>
                </td>
                <td>{plan.intercrop}</td>
                <td>{plan.spacing}</td>
                <td>{plan.benefit}</td>
                <td>{plan.plot}</td>
                <td>
                  <StatusChip
                    label={plan.compatibility}
                    tone={
                      plan.compatibility === "Excellent"
                        ? "low"
                        : plan.compatibility === "Good"
                          ? "medium"
                          : "neutral"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={pages}
        perPage={4}
        totalItems={total}
        onChange={onPage}
      />
    </section>
  );
}

function ClimateContent({
  onModal,
}: {
  onModal: (id: SeasonsModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Long-range weather planning"
          title="Keep a rain plan and a dry plan ready"
          subtitle="Climate signals help you adapt crop choice, drainage and water investment before a season turns difficult."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("weather-alerts")}
            >
              <CloudRain /> Alert settings
            </button>
          }
        />
        <div className="row g-3 mt-1">
          {CLIMATE_SCENARIOS.map((scenario) => (
            <div className="col-lg-6" key={scenario.id}>
              <Reveal>
                <article className="gm-card h-100">
                  <div className="d-flex align-items-start gap-3">
                    <span className="gm-mega-icon">
                      <CloudRain />
                    </span>
                    <div style={{ flex: 1 }}>
                      <span className="gm-eyebrow">{scenario.seasons}</span>
                      <h3 className="gm-h-section">{scenario.event}</h3>
                      <p className="text-muted mb-2">{scenario.impact}</p>
                    </div>
                    <StatusChip
                      label={
                        scenario.tone === "high"
                          ? "Prepare early"
                          : "Drainage first"
                      }
                      tone={scenario.tone}
                    />
                  </div>
                  <div className="gm-check-list mt-3">
                    <div className="gm-check-row">
                      <Sprout />
                      <span>
                        <strong>Favour</strong>
                        <small>{scenario.favor}</small>
                      </span>
                    </div>
                    <div className="gm-check-row">
                      <ListChecks />
                      <span>
                        <strong>Avoid</strong>
                        <small>{scenario.avoid}</small>
                      </span>
                    </div>
                    <div className="gm-check-row">
                      <ShieldCheck />
                      <span>
                        <strong>Advisory</strong>
                        <small>{scenario.advisory}</small>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline w-100 mt-3"
                    onClick={() =>
                      onModal(
                        scenario.id === "CLI-001"
                          ? "el-nino-plan"
                          : "la-nina-plan",
                      )
                    }
                  >
                    {scenario.id === "CLI-001"
                      ? "Build wet-season plan"
                      : "Build dry-season plan"}
                    <ArrowRight />
                  </button>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <CloudRain />
          </span>
          <div style={{ flex: 1 }}>
            <strong>
              Githunguri planning habit: check drainage before SR, water before
              a dry signal
            </strong>
            <p className="mb-0 text-muted">
              Pair climate response with real field observations, soil condition
              and your water source rather than treating any forecast as a
              guarantee.
            </p>
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => onModal("climate-outlook")}
          >
            Open outlook
          </button>
        </div>
      </section>
    </div>
  );
}

function SeasonsDrawer({
  drawer,
  plot,
  plan,
  cover,
  intercrop,
  onClose,
  onModal,
}: {
  drawer: DrawerId;
  plot: CalendarPlot | null;
  plan: (typeof SEASON_PLAN_REGISTER)[number];
  cover: CoverCrop | null;
  intercrop: IntercropPlan | null;
  onClose: () => void;
  onModal: (id: SeasonsModalId) => void;
}) {
  const title =
    drawer === "plot"
      ? (plot?.plot ?? "Plot calendar")
      : drawer === "plan"
        ? plan.plan
        : drawer === "cover"
          ? (cover?.name ?? "Cover crop")
          : intercrop
            ? `${intercrop.main} + ${intercrop.intercrop}`
            : "Intercrop plan";
  return (
    <DashboardDrawer
      open={Boolean(drawer)}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close record
        </button>
      }
    >
      {drawer === "plot" && plot ? (
        <>
          <span className="gm-eyebrow">
            {plot.id} · {plot.acreage} acres · {plot.status}
          </span>
          <h3 className="font-display mt-2">{plot.currentCrop}</h3>
          <p className="text-muted">{plot.soil}</p>
          <div className="gm-check-list">
            {plot.months.map((month) => (
              <div className="gm-check-row" key={month.month}>
                <CalendarDays />
                <span>
                  <strong>
                    {month.month} · {month.label}
                  </strong>
                  <small>
                    {month.tone === "low"
                      ? "Crop production or harvest action"
                      : month.tone === "medium"
                        ? "Cover-crop or soil action"
                        : "Rest, planning or land preparation"}
                  </small>
                </span>
              </div>
            ))}
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("calendar-detail")}
            >
              Open calendar detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("add-plot-cycle")}
            >
              Add plot cycle
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("edit-plan")}
            >
              Edit active plan
            </button>
          </div>
        </>
      ) : null}
      {drawer === "plan" ? (
        <>
          <span className="gm-eyebrow">
            {plan.id} · {plan.status}
          </span>
          <h3 className="font-display mt-2">{plan.plan}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>{plan.crop}</strong>
                <small>
                  {plan.plot} · {plan.acreage} acres
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <CalendarDays />
              <span>
                <strong>Starts {plan.starts}</strong>
                <small>
                  Visible in the calendar and linked to the rotation sequence.
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Soil-first guardrails</strong>
                <small>
                  Legume, crop-family and rest-period checks remain available
                  before activation.
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("edit-plan")}
            >
              Edit plan
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("season-reminder")}
            >
              Schedule reminder
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-danger-soft"
              onClick={() => onModal("archive-plan")}
            >
              Archive plan
            </button>
          </div>
        </>
      ) : null}
      {drawer === "cover" && cover ? (
        <>
          <span className="gm-eyebrow">
            {cover.id} · {cover.suitability}
          </span>
          <h3 className="font-display mt-2">{cover.name}</h3>
          <p className="text-muted">
            <em>{cover.botanical}</em> · {cover.seedingRate} · {kes(cover.cost)}
            /acre
          </p>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Leaf />
              <span>
                <strong>Purpose</strong>
                <small>{cover.purpose}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <TrendingUp />
              <span>
                <strong>Expected soil return</strong>
                <small>{cover.benefit}</small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("cover-crop-detail")}
            >
              Cover-crop profile
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("create-cover-plan")}
            >
              Add to Plot 1 recovery
            </button>
          </div>
        </>
      ) : null}
      {drawer === "intercrop" && intercrop ? (
        <>
          <span className="gm-eyebrow">
            {intercrop.id} · {intercrop.compatibility}
          </span>
          <h3 className="font-display mt-2">
            {intercrop.main} + {intercrop.intercrop}
          </h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>{intercrop.spacing}</strong>
                <small>{intercrop.plot}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <BadgeCheck />
              <span>
                <strong>Farm benefit</strong>
                <small>{intercrop.benefit}</small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("intercrop-detail")}
            >
              Open pairing detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("compatibility-check")}
            >
              Rerun compatibility
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("create-intercrop")}
            >
              Create similar pairing
            </button>
          </div>
        </>
      ) : null}
    </DashboardDrawer>
  );
}
