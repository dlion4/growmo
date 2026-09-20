/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING (ENHANCED)  (/app/analytics)

   Deep insights into farm performance through charts, KPIs, and exportable
   reports. Implements all 8 blueprint sections:
   11.1 Farm Overview KPIs    11.2 Crop Performance Comparison
   11.3 Cost Analysis         11.4 Revenue Analysis
   11.5 Labour Efficiency     11.6 Weather Impact Analysis
   11.7 Custom Report Builder 11.8 Pre-Built Reports
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Download,
  Eye,
  FileDown,
  FileText,
  Filter,
  Globe,
  Layers,
  ListFilter,
  MapPin,
  MoreHorizontal,
  Pencil,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Share2,
  ShieldCheck,
  Sprout,
  Table,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AnalyticsBarChart,
  RainfallBar,
  ReportCard,
  StackedRevenueBar,
  TrendArrow,
} from "../../components/app/AnalyticsWidgets";
import {
  AnalyticsInsightDrawer,
  AnalyticsSettingsDialog,
  BenchmarkDrawer,
  type AnalyticsSettings,
  ComparisonWizard,
  ConfirmAnalyticsDialog,
  CostCategoryDialog,
  CropPerformanceDialog,
  ExportDataDialog,
  KpiDrilldownDialog,
  LabourMetricDialog,
  ReportBuilderWizard,
  type ReportConfig,
  ReportPreviewDialog,
  ReportScheduleWizard,
  ReportShareDialog,
  RevenueMonthDialog,
  WeatherImpactDialog,
} from "../../components/app/AnalyticsModals";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  BENCHMARK_ROWS,
  BENCHMARK_SUMMARY,
  COST_CATEGORIES,
  COST_TOTAL,
  CROP_PERFORMANCE,
  FARM_KPIS,
  LABOUR_METRICS,
  PRE_BUILT_REPORTS,
  REPORT_SCHEDULES,
  REVENUE_MONTHS,
  WEATHER_IMPACTS,
  type AnalyticsView,
  type BenchmarkRow,
  type CostCategory,
  type CropPerformance,
  type FarmKpi,
  type LabourMetric,
  type PreBuiltReport,
  type ReportSchedule,
  type RevenueMonth,
  type WeatherImpact,
} from "../../data/app/analytics";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

type ModalId =
  | "kpi-drilldown"
  | "crop-performance"
  | "cost-category"
  | "revenue-month"
  | "labour-metric"
  | "weather-impact"
  | "report-builder"
  | "report-preview"
  | "report-share"
  | "report-schedule"
  | "report-schedule-create"
  | "report-delete"
  | "settings"
  | "export-data"
  | "comparison"
  | "insight-drawer"
  | null;

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function AnalyticsPage() {
  const [view, setView] = useState<AnalyticsView>("overview");
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);

  /* Selection state */
  const [selectedKpi, setSelectedKpi] = useState<FarmKpi | null>(null);
  const [selectedCropPerf, setSelectedCropPerf] =
    useState<CropPerformance | null>(null);
  const [selectedCostCategory, setSelectedCostCategory] =
    useState<CostCategory | null>(null);
  const [selectedRevenueMonth, setSelectedRevenueMonth] =
    useState<RevenueMonth | null>(null);
  const [selectedLabourMetric, setSelectedLabourMetric] =
    useState<LabourMetric | null>(null);
  const [selectedWeatherImpact, setSelectedWeatherImpact] =
    useState<WeatherImpact | null>(null);
  const [selectedReport, setSelectedReport] =
    useState<PreBuiltReport | null>(null);
  const [selectedBenchmarkRow, setSelectedBenchmarkRow] =
    useState<BenchmarkRow | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ReportSchedule | null>(null);

  /* Settings */
  const [settings, setSettings] = useState<AnalyticsSettings>({
    autoRefresh: true,
    includeWeather: true,
    benchmarkEnabled: true,
    weeklyDigest: false,
    fiscalStart: "January",
    currency: "KES",
  });

  /* Schedules */
  const [schedules, setSchedules] =
    useState<ReportSchedule[]>(REPORT_SCHEDULES);

  /* Drawer state */
  const [benchmarkDrawerOpen, setBenchmarkDrawerOpen] = useState(false);
  const [insightDrawerOpen, setInsightDrawerOpen] = useState(false);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);

  const totalRevenue = REVENUE_MONTHS.reduce((s, m) => s + m.total, 0);
  const totalTarget = REVENUE_MONTHS.reduce((s, m) => s + m.target, 0);
  const totalCost = COST_TOTAL.amount;

  const navItems = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: <BarChart3 />,
      count: FARM_KPIS.length,
    },
    {
      id: "crops" as const,
      label: "Crop performance",
      icon: <Sprout />,
      count: CROP_PERFORMANCE.length,
    },
    {
      id: "costs" as const,
      label: "Cost analysis",
      icon: <CircleDollarSign />,
      count: COST_CATEGORIES.length,
    },
    {
      id: "revenue" as const,
      label: "Revenue",
      icon: <TrendingUp />,
      count: REVENUE_MONTHS.length,
    },
    {
      id: "labour" as const,
      label: "Labour",
      icon: <Users />,
      count: LABOUR_METRICS.length,
    },
    {
      id: "weather" as const,
      label: "Weather",
      icon: <Cloud />,
      count: WEATHER_IMPACTS.length,
    },
    {
      id: "reports" as const,
      label: "Reports",
      icon: <FileText />,
      count: PRE_BUILT_REPORTS.length,
    },
    {
      id: "benchmark" as const,
      label: "Benchmark",
      icon: <Globe />,
      count: BENCHMARK_ROWS.length,
    },
  ];

  const handleGenerateReport = (config: ReportConfig) => {
    downloadText(
      `growmo-custom-report.${config.exportFormat === "Excel" ? "xlsx" : config.exportFormat.toLowerCase()}`,
      [
        "GrowMO Custom Analytics Report",
        `Date Range: ${config.dateRange}`,
        `Crop: ${config.crops}`,
        `Plot: ${config.plots}`,
        `Compare to: ${config.compareTo}`,
        `Chart type: ${config.chartType}`,
        `Metrics: ${config.metrics.join(", ")}`,
        "",
        "Metric,Value",
        ...config.metrics.map((m) => {
          const map: Record<string, string> = {
            Revenue: "KES 580,000",
            Cost: "KES 210,000",
            Profit: "KES 370,000",
            Yield: "2.5 acres average",
            Labour: "KES 42,000",
            Inputs: "KES 146,000",
            Weather: "-13% rainfall deviation",
          };
          return `${csvCell(m)},${csvCell(map[m] ?? "N/A")}`;
        }),
      ].join("\n"),
      config.exportFormat === "PDF" ? "text/plain" : "text/csv",
    );
  };

  const handleDownloadReport = (report: PreBuiltReport) => {
    downloadText(
      `growmo-${report.name.toLowerCase().replace(/\s/g, "-")}.csv`,
      [
        `GrowMO Report: ${report.name}`,
        `Generated: ${report.lastGenerated}`,
        `Contents: ${report.contents}`,
        `Use case: ${report.useCase}`,
        `Pages: ${report.pages}`,
        "",
        "Section,Key metric,Value",
        "Revenue,YTD total,KES 580,000",
        "Expenses,YTD total,KES 210,000",
        "Profit,Net,KES 370,000",
        "ROI,Overall,176%",
        "Labour,Total cost,KES 42,000",
        "Weather,Rainfall deviation,-13%",
      ].join("\n"),
    );
  };

  const handleDeleteSchedule = () => {
    const deletingId = selectedSchedule?.id;
    if (!deletingId) return;
    setSchedules((current) =>
      current.filter((schedule) => schedule.id !== deletingId),
    );
  };

  const handleSaveSchedule = (schedule: ReportSchedule) => {
    setSchedules((current) => {
      const exists = current.some((s) => s.id === schedule.id);
      return exists
        ? current.map((s) => (s.id === schedule.id ? schedule : s))
        : [schedule, ...current];
    });
  };

  return (
    <main className="gm-app-page gm-analytics-page">
      <div className="gm-container py-4">
        {/* Breadcrumb */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Manage</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Analytics</strong>
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((current) => !current)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> More analytics tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-analytics-menu">
                <button
                  type="button"
                  onClick={() => {
                    openModal("comparison");
                    setMenu(false);
                  }}
                >
                  <Layers /> Compare performance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("export-data");
                    setMenu(false);
                  }}
                >
                  <Download /> Export all data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("settings");
                    setMenu(false);
                  }}
                >
                  <Settings2 /> Analytics settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInsightDrawerOpen(true);
                    setMenu(false);
                  }}
                >
                  <Sparkles /> AI insights
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Header KPIs */}
        <div className="gm-card p-3 mb-3">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <span className="gm-eyebrow">Analytics overview</span>
              <h2 className="font-display mb-1">
                Your farm at a glance
              </h2>
              <p className="text-muted mb-0">
                Wanjiku Mixed Farm · Githunguri, Kiambu · SR 2026
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => setInsightDrawerOpen(true)}
              >
                <Sparkles /> AI insights
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => openModal("report-builder")}
              >
                <Plus /> Build report
              </button>
            </div>
          </div>
          <div className="gm-stat-grid mt-3">
            <DashboardMetric
              icon={TrendingUp}
              label="Revenue YTD"
              value={kes(totalRevenue)}
              note={`Target: ${kes(totalTarget)}`}
            />
            <DashboardMetric
              icon={CircleDollarSign}
              label="Expenses YTD"
              value={kes(totalCost)}
              note="Across all crops"
            />
            <DashboardMetric
              icon={BarChart3}
              label="Net profit"
              value={kes(totalRevenue - totalCost)}
              note={`${Math.round(((totalRevenue - totalCost) / Math.max(totalCost, 1)) * 100)}% ROI`}
            />
            <DashboardMetric
              icon={MapPin}
              label="Acreage"
              value="2.5 acres"
              note="3 active crops"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="gm-card p-2">
          <PlannerSubtabs
            value={view}
            items={navItems}
            onChange={setView}
            label="Analytics sections"
          />
        </div>

        <Reveal className="mt-4">
          {view === "overview" ? (
            <OverviewView
              kpis={FARM_KPIS}
              onKpi={(kpi) => {
                setSelectedKpi(kpi);
                openModal("kpi-drilldown");
              }}
              onCompare={() => openModal("comparison")}
              onExport={() => openModal("export-data")}
            />
          ) : null}
          {view === "crops" ? (
            <CropsView
              crops={CROP_PERFORMANCE}
              onCrop={(crop) => {
                setSelectedCropPerf(crop);
                openModal("crop-performance");
              }}
              onBuilder={() => openModal("report-builder")}
            />
          ) : null}
          {view === "costs" ? (
            <CostsView
              categories={COST_CATEGORIES}
              total={COST_TOTAL}
              onCategory={(cat) => {
                setSelectedCostCategory(cat);
                openModal("cost-category");
              }}
              onExport={() => openModal("export-data")}
            />
          ) : null}
          {view === "revenue" ? (
            <RevenueView
              months={REVENUE_MONTHS}
              onMonth={(month) => {
                setSelectedRevenueMonth(month);
                openModal("revenue-month");
              }}
              onBuilder={() => openModal("report-builder")}
            />
          ) : null}
          {view === "labour" ? (
            <LabourView
              metrics={LABOUR_METRICS}
              onMetric={(metric) => {
                setSelectedLabourMetric(metric);
                openModal("labour-metric");
              }}
              onReport={() => {
                setSelectedReport(
                  PRE_BUILT_REPORTS.find((r) => r.name === "Labour Report") ??
                    null,
                );
                openModal("report-preview");
              }}
            />
          ) : null}
          {view === "weather" ? (
            <WeatherView
              impacts={WEATHER_IMPACTS}
              onImpact={(impact) => {
                setSelectedWeatherImpact(impact);
                openModal("weather-impact");
              }}
            />
          ) : null}
          {view === "reports" ? (
            <ReportsView
              reports={PRE_BUILT_REPORTS}
              schedules={schedules}
              onPreview={(report) => {
                setSelectedReport(report);
                openModal("report-preview");
              }}
              onDownload={handleDownloadReport}
              onShare={(report) => {
                setSelectedReport(report);
                openModal("report-share");
              }}
              onScheduleCreate={() => {
                setSelectedSchedule(null);
                openModal("report-schedule-create");
              }}
              onScheduleEdit={(schedule) => {
                setSelectedSchedule(schedule);
                openModal("report-schedule");
              }}
              onScheduleDelete={(schedule) => {
                setSelectedSchedule(schedule);
                openModal("report-delete");
              }}
              onBuilder={() => openModal("report-builder")}
            />
          ) : null}
          {view === "benchmark" ? (
            <BenchmarkView
              rows={BENCHMARK_ROWS}
              summary={BENCHMARK_SUMMARY}
              onRow={(row) => {
                setSelectedBenchmarkRow(row);
                setBenchmarkDrawerOpen(true);
              }}
              onCompare={() => openModal("comparison")}
            />
          ) : null}
        </Reveal>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <KpiDrilldownDialog
        open={modal === "kpi-drilldown"}
        kpi={selectedKpi}
        onClose={closeModal}
      />
      <CropPerformanceDialog
        open={modal === "crop-performance"}
        crop={selectedCropPerf}
        onClose={closeModal}
      />
      <CostCategoryDialog
        open={modal === "cost-category"}
        category={selectedCostCategory}
        onClose={closeModal}
      />
      <RevenueMonthDialog
        open={modal === "revenue-month"}
        month={selectedRevenueMonth}
        onClose={closeModal}
      />
      <LabourMetricDialog
        open={modal === "labour-metric"}
        metric={selectedLabourMetric}
        onClose={closeModal}
      />
      <WeatherImpactDialog
        open={modal === "weather-impact"}
        weather={selectedWeatherImpact}
        onClose={closeModal}
      />
      <ReportBuilderWizard
        open={modal === "report-builder"}
        onClose={closeModal}
        onGenerate={handleGenerateReport}
      />
      <ReportPreviewDialog
        open={modal === "report-preview"}
        report={selectedReport}
        onClose={closeModal}
        onDownload={() => {
          if (selectedReport) handleDownloadReport(selectedReport);
          closeModal();
        }}
        onShare={() => {
          closeModal();
          if (selectedReport) {
            setSelectedReport(selectedReport);
            setTimeout(() => openModal("report-share"), 100);
          }
        }}
      />
      <ReportShareDialog
        open={modal === "report-share"}
        reportName={selectedReport?.name ?? "Report"}
        onClose={closeModal}
      />
      <ReportScheduleWizard
        open={
          modal === "report-schedule" ||
          modal === "report-schedule-create"
        }
        editing={modal === "report-schedule" ? selectedSchedule : null}
        onClose={closeModal}
        onSave={handleSaveSchedule}
      />
      <ConfirmAnalyticsDialog
        open={modal === "report-delete"}
        title="Delete this schedule?"
        body={`"${selectedSchedule?.reportName}" (${selectedSchedule?.frequency}) will be removed. You can recreate it later.`}
        confirmLabel="Delete schedule"
        destructive
        onClose={closeModal}
        onConfirm={handleDeleteSchedule}
      />
      <AnalyticsSettingsDialog
        open={modal === "settings"}
        settings={settings}
        onClose={closeModal}
        onSave={setSettings}
      />
      <ExportDataDialog open={modal === "export-data"} onClose={closeModal} />
      <ComparisonWizard open={modal === "comparison"} onClose={closeModal} />

      {/* Drawers */}
      <BenchmarkDrawer
        open={benchmarkDrawerOpen}
        row={selectedBenchmarkRow}
        onClose={() => setBenchmarkDrawerOpen(false)}
      />
      <AnalyticsInsightDrawer
        open={insightDrawerOpen}
        onClose={() => setInsightDrawerOpen(false)}
      />
    </main>
  );
}

/* ── Missing Sparkles placeholder ────────────────────────────────────────── */
function Sparkles(props: any) {
  return <TrendingUp {...props} />;
}

/* ========================================================================
   SUB-VIEWS
   ======================================================================== */

/* ── 11.1 Overview ──────────────────────────────────────────────────────── */
function OverviewView({
  kpis,
  onKpi,
  onCompare,
  onExport,
}: {
  kpis: FarmKpi[];
  onKpi: (kpi: FarmKpi) => void;
  onCompare: () => void;
  onExport: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = kpis.filter((kpi) =>
    kpi.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.1 · Farm overview KPIs"
        title="Every metric in one place"
        subtitle="Track your farm's key performance indicators against last season and the Kiambu county average."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onExport}
            >
              <Download /> Export KPIs
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onCompare}
            >
              <Layers /> Compare seasons
            </button>
          </div>
        }
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}>
            <Search />
            <input
              className="gm-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search KPIs"
            />
          </div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Value</th>
                <th>vs Last Season</th>
                <th>vs County Average</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((kpi) => (
                <tr key={kpi.id}>
                  <td>
                    <strong>{kpi.label}</strong>
                  </td>
                  <td>
                    <strong className="font-display">{kpi.value}</strong>
                  </td>
                  <td>
                    <TrendArrow value={kpi.vsLastSeason} />
                  </td>
                  <td>
                    <TrendArrow value={kpi.vsCountyAvg} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${kpi.label}`}
                      onClick={() => onKpi(kpi)}
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-4 mb-0">
            No KPI matches that search.
          </p>
        ) : null}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Farm health</span>
            <h3 className="font-display mb-2">
              Your farm is outperforming the county
            </h3>
            <p className="text-muted">
              In 6 of 8 KPIs, Wanjiku Mixed Farm beats the Kiambu county
              average. Revenue growth of 45% YoY is driven by cabbage direct
              sales and tomato greenhouse production.
            </p>
            <div className="gm-check-row">
              <CheckCircle2 />
              <span>
                <strong>Best improvement</strong>
                <small>
                  Post-harvest loss dropped 5pp to 8% — now 12pp below county
                  average.
                </small>
              </span>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Areas to watch</span>
            <h3 className="font-display mb-2">
              Keep an eye on expense growth
            </h3>
            <p className="text-muted">
              Expenses grew 20% YoY (but still 5% below county average per
              acre). Labour cost efficiency is strong at 15% of revenue vs 23%
              county average.
            </p>
            <div className="gm-check-row">
              <AlertTriangle />
              <span>
                <strong>Action needed</strong>
                <small>
                  Review pesticide spend — up 8% vs budget due to armyworm
                  response on maize.
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 11.2 Crop Performance ──────────────────────────────────────────────── */
function CropsView({
  crops,
  onCrop,
  onBuilder,
}: {
  crops: CropPerformance[];
  onCrop: (crop: CropPerformance) => void;
  onBuilder: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.2 · Crop performance comparison"
        title="Which crop earns the most per acre?"
        subtitle="Compare yield, cost, revenue, profit and ROI across all your crops to guide planting decisions."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onBuilder}
            >
              <FileDown /> Build crop report
            </button>
          </div>
        }
      />
      <div className="row g-3 mt-3">
        <div className="col-xl-8">
          <div className="gm-card p-4 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">Revenue per acre</span>
                <h3 className="font-display mb-1">
                  Let margin guide the next acre
                </h3>
                <p className="text-muted mb-0">
                  Projected revenue per acre for each crop
                </p>
              </div>
            </div>
            <div className="mt-3">
              <AnalyticsBarChart
                rows={crops.map((crop) => ({
                  id: crop.id,
                  label: `${crop.symbol} ${crop.crop}`,
                  sub: `${crop.roi}% ROI`,
                  value: crop.revenuePerAcre,
                  highlight: crop.rank === 1,
                }))}
                unitLabel="Revenue per acre — KES"
              />
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Revenue mix</span>
            <h3 className="font-display mb-2">
              Cabbage leads by margin
            </h3>
            <StackedRevenueBar
              segments={[
                { label: "Cabbage", value: 435000, color: "var(--gm-leaf-500)" },
                { label: "Tomato", value: 517000, color: "var(--gm-clay-500)" },
                { label: "Maize", value: 63000, color: "var(--gm-gold-500)" },
              ]}
              total={1015000}
            />
            <div className="gm-check-row mt-3">
              <TrendingUp />
              <span>
                <strong>Best ROI</strong>
                <small>Cabbage Gloria F1 — 523% return</small>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Full comparison</span>
            <h3 className="font-display mb-1">
              Click any row for details
            </h3>
          </div>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Yield / Acre</th>
                <th>Cost / Acre</th>
                <th>Revenue / Acre</th>
                <th>Profit / Acre</th>
                <th>ROI</th>
                <th>Rank</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link text-start"
                      onClick={() => onCrop(crop)}
                    >
                      <strong>
                        {crop.symbol} {crop.crop}
                      </strong>
                      <small className="d-block text-muted">
                        {crop.variety} · {crop.plot}
                      </small>
                    </button>
                  </td>
                  <td>{crop.yieldPerAcre}</td>
                  <td>{kes(crop.costPerAcre)}</td>
                  <td>
                    <strong className="font-display">
                      {kes(crop.revenuePerAcre)}
                    </strong>
                  </td>
                  <td>
                    <strong className="text-success font-display">
                      {kes(crop.profitPerAcre)}
                    </strong>
                  </td>
                  <td>
                    <StatusChip
                      label={`${crop.roi}%`}
                      tone={
                        crop.roi >= 100
                          ? "low"
                          : crop.roi < 0
                            ? "high"
                            : "medium"
                      }
                    />
                  </td>
                  <td>
                    <span style={{ fontSize: "1.3rem" }}>
                      {crop.rank === 1 ? "🥇" : crop.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`View ${crop.crop}`}
                      onClick={() => onCrop(crop)}
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
    </>
  );
}

/* ── 11.3 Cost Analysis ─────────────────────────────────────────────────── */
function CostsView({
  categories,
  total,
  onCategory,
  onExport,
}: {
  categories: CostCategory[];
  total: { amount: number; budgetAmount: number };
  onCategory: (cat: CostCategory) => void;
  onExport: () => void;
}) {
  const [miniTab, setMiniTab] = useState<"table" | "chart">("table");
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.3 · Cost analysis"
        title="Where is the money going?"
        subtitle="Breakdown of all production costs by category with budget comparison."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onExport}
          >
            <Download /> Export costs
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={CircleDollarSign}
          label="Total costs YTD"
          value={kes(total.amount)}
          note="All categories"
        />
        <DashboardMetric
          icon={TrendingDown}
          label="Budget total"
          value={kes(total.budgetAmount)}
          note="Planned spending"
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Variance"
          value={kes(Math.abs(total.amount - total.budgetAmount))}
          note={
            total.amount <= total.budgetAmount
              ? "Under budget"
              : "Over budget"
          }
        />
        <DashboardMetric
          icon={Filter}
          label="Categories"
          value={`${categories.length}`}
          note="Cost categories tracked"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Cost breakdown</span>
            <h3 className="font-display mb-1">Category detail</h3>
          </div>
          <div
            className="gm-tabs gm-tabs-mini"
            role="tablist"
            aria-label="Cost view"
          >
            <button
              type="button"
              className={`gm-tab ${miniTab === "table" ? "on" : ""}`}
              onClick={() => setMiniTab("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={`gm-tab ${miniTab === "chart" ? "on" : ""}`}
              onClick={() => setMiniTab("chart")}
            >
              Chart
            </button>
          </div>
        </div>
        {miniTab === "table" ? (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>% of Total</th>
                  <th>Budget</th>
                  <th>vs Budget</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <strong>{cat.category}</strong>
                    </td>
                    <td>
                      <strong className="font-display">
                        {kes(cat.amount)}
                      </strong>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="gm-progress-mini"
                          style={{ width: 80 }}
                        >
                          <span
                            className="gm-progress-mini-fill"
                            style={{ width: `${cat.percentOfTotal}%` }}
                          />
                        </div>
                        <span>{cat.percentOfTotal}%</span>
                      </div>
                    </td>
                    <td>{kes(cat.budgetAmount)}</td>
                    <td>
                      <TrendArrow value={cat.vsBudget} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${cat.category}`}
                        onClick={() => onCategory(cat)}
                      >
                        <Eye />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="gm-table-total">
                  <td>
                    <strong>TOTAL</strong>
                  </td>
                  <td>
                    <strong className="font-display">
                      {kes(total.amount)}
                    </strong>
                  </td>
                  <td>100%</td>
                  <td>{kes(total.budgetAmount)}</td>
                  <td>
                    <TrendArrow
                      value={
                        total.amount <= total.budgetAmount ? "Under" : "Over"
                      }
                    />
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3">
            <AnalyticsBarChart
              rows={categories.map((cat) => ({
                id: cat.id,
                label: cat.category,
                sub: `${cat.percentOfTotal}%`,
                value: cat.amount,
                highlight: cat.percentOfTotal >= 20,
              }))}
              unitLabel="KES by category"
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ── 11.4 Revenue Analysis ──────────────────────────────────────────────── */
function RevenueView({
  months,
  onMonth,
  onBuilder,
}: {
  months: RevenueMonth[];
  onMonth: (month: RevenueMonth) => void;
  onBuilder: () => void;
}) {
  const [miniTab, setMiniTab] = useState<"table" | "chart">("table");
  const totalActual = months.reduce((s, m) => s + m.total, 0);
  const totalTarget = months.reduce((s, m) => s + m.target, 0);
  const monthsAbove = months.filter((m) => m.variance > 0).length;
  const monthsBelow = months.filter(
    (m) => m.variance < 0 && m.target > 0,
  ).length;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.4 · Revenue analysis"
        title="Monthly revenue against targets"
        subtitle="Track how each crop contributes to monthly revenue and compare against your targets."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onBuilder}
          >
            <FileDown /> Build revenue report
          </button>
        }
      />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric
          icon={TrendingUp}
          label="Total revenue"
          value={kes(totalActual)}
          note={`Target: ${kes(totalTarget)}`}
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Months above target"
          value={`${monthsAbove}`}
          note="Out of 7 months"
        />
        <DashboardMetric
          icon={AlertTriangle}
          label="Months below target"
          value={`${monthsBelow}`}
          note="Need attention"
        />
        <DashboardMetric
          icon={CircleDollarSign}
          label="Best month"
          value="Jan (proj)"
          note="KES 435,000 cabbage harvest"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Monthly breakdown</span>
            <h3 className="font-display mb-1">
              Revenue by month and crop
            </h3>
          </div>
          <div
            className="gm-tabs gm-tabs-mini"
            role="tablist"
            aria-label="Revenue view"
          >
            <button
              type="button"
              className={`gm-tab ${miniTab === "table" ? "on" : ""}`}
              onClick={() => setMiniTab("table")}
            >
              Table
            </button>
            <button
              type="button"
              className={`gm-tab ${miniTab === "chart" ? "on" : ""}`}
              onClick={() => setMiniTab("chart")}
            >
              Chart
            </button>
          </div>
        </div>
        {miniTab === "table" ? (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Cabbage</th>
                  <th>Maize</th>
                  <th>Tomato</th>
                  <th>Total</th>
                  <th>Target</th>
                  <th>Variance</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {months.map((month) => (
                  <tr key={month.id}>
                    <td>
                      <strong>{month.month}</strong>
                    </td>
                    <td className="font-display">
                      {month.cabbage > 0 ? kes(month.cabbage) : "—"}
                    </td>
                    <td className="font-display">
                      {month.maize > 0 ? kes(month.maize) : "—"}
                    </td>
                    <td className="font-display">
                      {month.tomato > 0 ? kes(month.tomato) : "—"}
                    </td>
                    <td>
                      <strong className="font-display">
                        {month.total > 0 ? kes(month.total) : "—"}
                      </strong>
                    </td>
                    <td>{month.target > 0 ? kes(month.target) : "—"}</td>
                    <td>
                      {month.target > 0 ? (
                        <span
                          className={
                            month.variance >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                          style={{ fontWeight: 600 }}
                        >
                          {month.variance >= 0 ? "+" : ""}
                          {kes(month.variance)}{" "}
                          {month.variance >= 0 ? "✅" : "🔴"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${month.month}`}
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
        ) : (
          <div className="mt-3">
            <AnalyticsBarChart
              rows={months
                .filter((m) => m.total > 0)
                .map((m) => ({
                  id: m.id,
                  label: m.month,
                  sub: m.variance >= 0 ? "✅" : "🔴",
                  value: m.total,
                  highlight: m.variance > 100000,
                }))}
              unitLabel="KES per month"
            />
          </div>
        )}
      </div>
    </>
  );
}

/* ── 11.5 Labour Efficiency ──────────────────────────────────────────────── */
function LabourView({
  metrics,
  onMetric,
  onReport,
}: {
  metrics: LabourMetric[];
  onMetric: (metric: LabourMetric) => void;
  onReport: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.5 · Labour efficiency"
        title="Your team's productivity"
        subtitle="Key labour metrics showing cost efficiency, worker performance, and attendance rates."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onReport}
          >
            <FileText /> Labour report
          </button>
        }
      />
      <div className="row g-3 mt-3">
        {metrics.map((metric) => (
          <div className="col-xl-3 col-md-6" key={metric.id}>
            <button
              type="button"
              className="gm-card p-3 h-100 w-100 text-start"
              onClick={() => onMetric(metric)}
              style={{ cursor: "pointer" }}
            >
              <span className="gm-eyebrow">{metric.label}</span>
              <h3 className="font-display mb-1">{metric.value}</h3>
              <small className="text-muted">{metric.note}</small>
              <div className="d-flex justify-content-end mt-2">
                <Eye width={16} className="text-muted" />
              </div>
            </button>
          </div>
        ))}
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Top performers</span>
            <h3 className="font-display mb-2">
              Recognise and retain the best
            </h3>
            <div className="gm-check-row">
              <Users />
              <span>
                <strong>John Mwangi</strong>
                <small>22 tasks completed · 95% attendance</small>
              </span>
              <StatusChip label="Top tasks" tone="low" />
            </div>
            <div className="gm-check-row mt-2">
              <Users />
              <span>
                <strong>Grace Wanjiku</strong>
                <small>4.8★ quality rating · 98% attendance</small>
              </span>
              <StatusChip label="Top quality" tone="low" />
            </div>
            <div className="gm-check-row mt-2">
              <Users />
              <span>
                <strong>Peter Kamau</strong>
                <small>18 tasks · Strong in weeding and planting</small>
              </span>
              <StatusChip label="Reliable" tone="medium" />
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Efficiency comparison</span>
            <h3 className="font-display mb-2">
              Above county average
            </h3>
            <p className="text-muted">
              Revenue per labour day is KES 6,905, which is 30% above the
              Kiambu county average of KES 5,300. This efficiency comes from
              proper task scheduling and trained workers.
            </p>
            <div className="gm-check-row">
              <CheckCircle2 />
              <span>
                <strong>Attendance rate: 92%</strong>
                <small>County average is 85%</small>
              </span>
            </div>
            <div className="gm-check-row mt-2">
              <ShieldCheck />
              <span>
                <strong>Cost per day: KES 500</strong>
                <small>County average: KES 550</small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 11.6 Weather Impact ────────────────────────────────────────────────── */
function WeatherView({
  impacts,
  onImpact,
}: {
  impacts: WeatherImpact[];
  onImpact: (impact: WeatherImpact) => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.6 · Weather impact analysis"
        title="Rainfall versus yield"
        subtitle="Compare actual rainfall against normal patterns and understand the yield impact."
      />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
          <div>
            <span className="gm-eyebrow">Rainfall comparison</span>
            <h3 className="font-display mb-1">
              Actual vs normal rainfall
            </h3>
          </div>
        </div>
        <div className="mt-3">
          {impacts.map((impact) => (
            <div key={impact.id} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong>
                  {impact.season} · {impact.crop}
                </strong>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onImpact(impact)}
                >
                  <Eye /> Detail
                </button>
              </div>
              <RainfallBar
                actual={impact.actualRainfall}
                normal={impact.normalRainfall}
                label={`${impact.season} (${impact.crop})`}
              />
              <div className="d-flex flex-wrap gap-3 mt-1">
                <StatusChip
                  label={`${impact.deviation}% deviation`}
                  tone="high"
                />
                <StatusChip label={impact.yieldImpact} tone="medium" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="row g-3 mt-1">
        {impacts.map((impact) => (
          <div className="col-xl-6" key={impact.id}>
            <div className="gm-card p-4 h-100">
              <span className="gm-eyebrow">
                {impact.season} · {impact.crop}
              </span>
              <h3 className="font-display mb-2">
                {impact.deviation < 0 ? "Drier than normal" : "Wetter than normal"}
              </h3>
              <p className="text-muted">{impact.notes}</p>
              <div className="gm-review-card">
                <div className="gm-review-row">
                  <span>Actual rainfall</span>
                  <strong className="font-display">
                    {impact.actualRainfall} mm
                  </strong>
                </div>
                <div className="gm-review-row">
                  <span>Normal rainfall</span>
                  <strong>{impact.normalRainfall} mm</strong>
                </div>
                <div className="gm-review-row">
                  <span>Yield impact</span>
                  <strong>{impact.yieldImpact}</strong>
                </div>
              </div>
              <button
                type="button"
                className="gm-btn gm-btn-outline w-100 mt-3"
                onClick={() => onImpact(impact)}
              >
                View full weather detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 11.7 + 11.8 Reports ────────────────────────────────────────────────── */
function ReportsView({
  reports,
  schedules,
  onPreview,
  onDownload,
  onShare,
  onScheduleCreate,
  onScheduleEdit,
  onScheduleDelete,
  onBuilder,
}: {
  reports: PreBuiltReport[];
  schedules: ReportSchedule[];
  onPreview: (report: PreBuiltReport) => void;
  onDownload: (report: PreBuiltReport) => void;
  onShare: (report: PreBuiltReport) => void;
  onScheduleCreate: () => void;
  onScheduleEdit: (schedule: ReportSchedule) => void;
  onScheduleDelete: (schedule: ReportSchedule) => void;
  onBuilder: () => void;
}) {
  const [miniTab, setMiniTab] = useState<"prebuilt" | "schedules" | "builder">(
    "prebuilt",
  );
  const [query, setQuery] = useState("");
  const filtered = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.useCase.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <DashboardSectionHeader
        eyebrow="11.7 · Reports & 11.8 · Pre-built reports"
        title="Every report you need, ready to generate"
        subtitle="Pre-built reports for compliance, banking, and planning. Or build a custom report with the wizard."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onBuilder}
          >
            <Plus /> Custom report
          </button>
        }
      />
      <div className="gm-card p-2 mt-3">
        <div
          className="gm-tabs"
          role="tablist"
          aria-label="Report sections"
        >
          <button
            type="button"
            className={`gm-tab ${miniTab === "prebuilt" ? "on" : ""}`}
            onClick={() => setMiniTab("prebuilt")}
          >
            Pre-built reports
            <span className="gm-n">{reports.length}</span>
          </button>
          <button
            type="button"
            className={`gm-tab ${miniTab === "schedules" ? "on" : ""}`}
            onClick={() => setMiniTab("schedules")}
          >
            Schedules
            <span className="gm-n">{schedules.length}</span>
          </button>
          <button
            type="button"
            className={`gm-tab ${miniTab === "builder" ? "on" : ""}`}
            onClick={() => setMiniTab("builder")}
          >
            Custom builder
          </button>
        </div>
      </div>

      {miniTab === "prebuilt" ? (
        <>
          <div className="gm-card p-3 mt-3">
            <div className="d-flex flex-wrap align-items-end gap-2">
              <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}>
                <Search />
                <input
                  className="gm-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reports"
                />
              </div>
            </div>
          </div>
          <div className="row g-3 mt-1">
            {filtered.map((report) => (
              <div className="col-xl-3 col-md-6" key={report.id}>
                <ReportCard
                  name={report.name}
                  description={report.description}
                  useCase={report.useCase}
                  pages={report.pages}
                  lastGenerated={report.lastGenerated}
                  onPreview={() => onPreview(report)}
                  onDownload={() => onDownload(report)}
                />
              </div>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="gm-card p-4 mt-3 text-center">
              <p className="text-muted mb-0">No report matches.</p>
            </div>
          ) : null}
        </>
      ) : miniTab === "schedules" ? (
        <>
          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onScheduleCreate}
            >
              <Plus /> New schedule
            </button>
          </div>
          <div className="gm-card p-3 mt-2">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Frequency</th>
                    <th>Recipients</th>
                    <th>Last sent</th>
                    <th>Next send</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr key={schedule.id}>
                      <td>
                        <strong>{schedule.reportName}</strong>
                      </td>
                      <td>{schedule.frequency}</td>
                      <td>
                        <small>{schedule.recipients}</small>
                      </td>
                      <td>
                        <small>{schedule.lastSent}</small>
                      </td>
                      <td>
                        <small>{schedule.nextSend}</small>
                      </td>
                      <td>
                        <StatusChip
                          label={schedule.active ? "Active" : "Paused"}
                          tone={schedule.active ? "low" : "neutral"}
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="gm-icon-btn"
                            aria-label="Edit schedule"
                            onClick={() => onScheduleEdit(schedule)}
                          >
                            <Pencil />
                          </button>
                          <button
                            type="button"
                            className="gm-icon-btn"
                            aria-label="Delete schedule"
                            onClick={() => onScheduleDelete(schedule)}
                          >
                            <X />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {schedules.length === 0 ? (
              <p className="text-muted text-center py-4 mb-0">
                No schedules configured. Create one to automate report delivery.
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="gm-card p-4 mt-3">
          <span className="gm-eyebrow">Section 11.7</span>
          <h3 className="font-display mb-2">
            Custom report builder
          </h3>
          <p className="text-muted">
            Build a report by selecting date range, crops, plots, metrics,
            comparison target, chart type, and export format.
          </p>
          <div className="row g-3 mt-1">
            {[
              { label: "Date range", example: "This season, Year to date" },
              { label: "Crops", example: "All crops, Cabbage, Maize" },
              { label: "Plots", example: "All plots, Plot 1" },
              { label: "Metrics", example: "Revenue, Cost, Profit, Yield" },
              {
                label: "Compare to",
                example: "Last season, County average",
              },
              { label: "Chart type", example: "Bar, Line, Pie, Table" },
              { label: "Export", example: "PDF, Excel, CSV" },
            ].map((item) => (
              <div className="col-md-4" key={item.label}>
                <div className="gm-check-row">
                  <Filter />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.example}</small>
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-lime w-100 mt-3"
            onClick={onBuilder}
          >
            <Plus /> Open report builder
          </button>
        </div>
      )}
    </>
  );
}

/* ── Benchmark ──────────────────────────────────────────────────────────── */
function BenchmarkView({
  rows,
  summary,
  onRow,
  onCompare,
}: {
  rows: BenchmarkRow[];
  summary: string;
  onRow: (row: BenchmarkRow) => void;
  onCompare: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader
        eyebrow="Benchmark · County comparison"
        title="How does your farm compare?"
        subtitle="Your metrics vs Kiambu county averages and top 10% farmers."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onCompare}
          >
            <Layers /> Compare periods
          </button>
        }
      />
      <div className="row g-3 mt-3">
        <div className="col-xl-8">
          <div className="gm-card p-3">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Your Farm</th>
                    <th>County Average</th>
                    <th>Top 10%</th>
                    <th>Difference</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.metric}</strong>
                      </td>
                      <td>
                        <strong className="font-display">
                          {row.yourFarm}
                        </strong>
                      </td>
                      <td>{row.countyAverage}</td>
                      <td>{row.top10}</td>
                      <td>
                        <StatusChip
                          label={row.difference}
                          tone={
                            row.status === "above" ? "low" : "high"
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gm-icon-btn"
                          aria-label={`View ${row.metric}`}
                          onClick={() => onRow(row)}
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
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Summary</span>
            <h3 className="font-display mb-2">
              Above average in most metrics
            </h3>
            <p className="text-muted">{summary}</p>
            <div className="gm-check-row">
              <CheckCircle2 />
              <span>
                <strong>6 of 7 above average</strong>
                <small>
                  Strong performance across yield, cost, efficiency and
                  post-harvest management.
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}