/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING (/app/analytics)

   Blueprint sections implemented:
   11.1 Farm overview KPIs (vs last season + county average)
   11.2 Crop performance comparison (yield, cost, revenue, profit, ROI)
   11.3 Cost analysis breakdown with budget variance
   11.4 Revenue by month (actuals + targets with hits/misses)
   11.5 Labour efficiency metrics and worker table
   11.6 Weather impact analysis by season
   11.7 Custom report builder wizard
   11.8 Pre-built reports library

   The page keeps its filters in local state; generating a report issues a
   receipt code; CSV/PDF exports download real text files.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  ChevronDown,
  CloudRain,
  Download,
  FileBarChart2,
  HelpCircle,
  MoreHorizontal,
  Percent,
  PieChart,
  Plus,
  Printer,
  Search,
  Settings2,
  Share2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardDrawer, DashboardMetric, DashboardSectionHeader } from "../../components/app/DashboardWidgets";
import { AnalyticsHero, AnKpiCard, CostRow, CropBar, ReportCard, RevenueBar, WeatherRow, WorkerRow, AnCallout } from "../../components/app/AnalyticsWidgets";
import {
  AnalyticsExportDialog,
  AnalyticsFaqDialog,
  AnalyticsScoreDialog,
  AnalyticsSettingsDialog,
  AnalyticsShareDialog,
  ConfirmAnalyticsDialog,
  CropCompareDialog,
  KpiDetailDialog,
  LoanPreviewDialog,
  ReportBuilderWizard,
  ReportResultDialog,
  RunReportWizard,
  WorkerDetailDialog,
} from "../../components/app/AnalyticsModals";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AN_CONTEXT,
  COST_CATEGORIES,
  CROP_PERF,
  FARM_KPIS,
  LABOUR_EFFICIENCY,
  PREMADE_REPORTS,
  REVENUE_MONTHS,
  WEATHER_IMPACT,
  WORKERS,
  analyticsTotals,
  type PremadeReport,
  type Worker,
} from "../../data/app/analytics";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

type AnSection = "overview" | "crops" | "cost" | "revenue" | "labour" | "weather" | "builder" | "reports";
type ModalId =
  | "kpi-detail"
  | "crop-compare"
  | "worker-detail"
  | "report-run"
  | "report-builder"
  | "report-result"
  | "loan-preview"
  | "export"
  | "share"
  | "settings"
  | "faq"
  | "score"
  | "confirm-delete"
  | null;

function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => "\"" + String(c ?? "").replaceAll('"', '""') + "\"").join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/app/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const toast = useToast();
  const totals = useMemo(() => analyticsTotals(), []);
  const [section, setSection] = useState<AnSection>("overview");
  const [modal, setModal] = useState<ModalId>(null);
  const [drawer, setDrawer] = useState<"saved" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kpiTitle, setKpiTitle] = useState("");
  const [kpiBody, setKpiBody] = useState<any>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedReport, setSelectedReport] = useState<PremadeReport | null>(null);
  const [result, setResult] = useState<{ title: string; sub?: string; rows: { k: string; v: any }[] } | null>(null);

  // Pagination/sorting state
  const [workerQuery, setWorkerQuery] = useState("");
  const [workerPage, setWorkerPage] = useState(1);
  const [reportQuery, setReportQuery] = useState("");
  const [reportPage, setReportPage] = useState(1);

  const filteredWorkers = useMemo(() => {
    const q = workerQuery.trim().toLowerCase();
    return WORKERS.filter((w) => q.length === 0 || w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q));
  }, [workerQuery]);
  const wPerPage = 6;
  const wPages = Math.max(1, Math.ceil(filteredWorkers.length / wPerPage));
  const workersShown = filteredWorkers.slice((workerPage - 1) * wPerPage, workerPage * wPerPage);

  const filteredReports = useMemo(() => {
    const q = reportQuery.trim().toLowerCase();
    return PREMADE_REPORTS.filter((r) => q.length === 0 || r.name.toLowerCase().includes(q) || r.useCase.toLowerCase().includes(q));
  }, [reportQuery]);
  const rPerPage = 6;
  const rPages = Math.max(1, Math.ceil(filteredReports.length / rPerPage));
  const reportsShown = filteredReports.slice((reportPage - 1) * rPerPage, reportPage * rPerPage);

  const maxRevPerAcre = Math.max(...CROP_PERF.map((c) => c.revenuePerAcre));
  const maxCost = Math.max(...COST_CATEGORIES.map((c) => c.amount));
  const maxRev = Math.max(...REVENUE_MONTHS.map((m) => Math.max(m.total, m.target)));

  function openKpi(title: string, body: any) { setKpiTitle(title); setKpiBody(body); setModal("kpi-detail"); }

  function runReport(r: PremadeReport) {
    setSelectedReport(r); setModal("report-run");
  }
  function openResultFor(name: string) {
    const rows = [
      { k: "Report", v: name }, { k: "Period", v: AN_CONTEXT.season },
      { k: "Generated", v: new Date().toLocaleString("en-KE") },
      { k: "Revenue YTD", v: kes(totals.revenue) }, { k: "Costs YTD", v: kes(totals.costs) },
      { k: "Profit YTD", v: kes(totals.profit) }, { k: "ROI", v: "176%" },
    ];
    setResult({ title: name, sub: "Auto-generated summary", rows }); setModal("report-result");
  }

  return (
    <div className="gm-app-page">
      <AnalyticsHero score={AN_CONTEXT.healthScore} profit={totals.profit} reports={AN_CONTEXT.reportsGenerated}>
        <div className="gm-an-toolbar" style={{ marginTop: "1.1rem" }}>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("loan-preview")}>🏦 Loan preview</button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("crop-compare")}><BarChart3 /> Compare crops</button>
          <div style={{ flex: 1 }} />
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("faq")}><HelpCircle /> FAQ</button>
          <div className="gm-an-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal /> Tools <ChevronDown /></button>
            {menuOpen ? (
              <div className="gm-an-menu is-open">
                <button type="button" onClick={() => { setMenuOpen(false); setModal("export"); }}><Download /> Export all analytics</button>
                <button type="button" onClick={() => { setMenuOpen(false); setModal("share"); }}><Share2 /> Share access</button>
                <button type="button" onClick={() => { setMenuOpen(false); window.print(); }}><Printer /> Print</button>
                <button type="button" onClick={() => { setMenuOpen(false); setModal("settings"); }}><Settings2 /> Settings</button>
              </div>
            ) : null}
          </div>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setModal("report-builder")}><Plus /> Build report</button>
        </div>
      </AnalyticsHero>

      <Reveal>
        <div className="gm-subtabs" role="tablist" aria-label="Analytics sections">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "crops", label: "Crop performance", icon: Award },
            { id: "cost", label: "Cost breakdown", icon: PieChart },
            { id: "revenue", label: "Revenue", icon: BarChart3 },
            { id: "labour", label: "Labour", icon: Users },
            { id: "weather", label: "Weather", icon: CloudRain },
            { id: "builder", label: "Custom builder", icon: FileBarChart2 },
            { id: "reports", label: "Pre-built reports", icon: FileBarChart2, count: PREMADE_REPORTS.length },
          ].map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={section === t.id} className={"gm-subtab " + (section === t.id ? "on" : "")} onClick={() => setSection(t.id as AnSection)}>
              <t.icon /> {t.label}{t.count ? <span className="gm-subtab-count">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </Reveal>

      {/* ==================================== 11.1 OVERVIEW KPIs ==================================== */}
      {section === "overview" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.1 · Farm Overview KPIs"
            title="Your season at a glance"
            subtitle="Every KPI is compared to last season and to the Kiambu county average for farms your size. Click any tile for the calculation."
            action={<button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("score")}>Grade breakdown</button>}
          />
          <div className="gm-an-kpi-grid">
            {FARM_KPIS.map((k) => (
              <div key={k.kpi} onClick={() => openKpi(k.kpi, <AnCallout tone="info">This KPI is computed from your sales, expenses and labour logs for {AN_CONTEXT.season}. Tap the relevant section for the full breakdown.</AnCallout>)}>
                <AnKpiCard k={k} />
              </div>
            ))}
          </div>
          <div className="gm-card-grid-3" style={{ marginTop: "1.2rem" }}>
            <DashboardMetric icon={TrendingUp} label="Best crop" value="Cabbage" note="523% ROI · 14,500 heads Jan" />
            <DashboardMetric icon={TrendingDown} label="Biggest cost overrun" value="Pesticides" note="+8% vs budget · early blight spraying" />
            <DashboardMetric icon={Percent} label="Post-harvest loss" value="8%" note="-5 pp vs last season · best on track" />
          </div>
          <AnCallout tone="good">
            <strong>Bottom line.</strong> You are {kes(200000)} ahead of your season target and top 12% in Kiambu county. The biggest lever for next season is to plant more cabbage and lock in a tomato contract before March.
          </AnCallout>
        </Reveal>
      ) : null}

      {/* ==================================== 11.2 CROPS ==================================== */}
      {section === "crops" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.2 · Crop Performance Comparison"
            title="Which crops make you the most money per acre?"
            subtitle="Cabbage leads on ROI at 523% thanks to double-planting in the SR; maize is break-even at 58%."
            action={
              <div className="d-flex gap-2">
                <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setModal("crop-compare")}><BarChart3 /> Full table</button>
                <button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => csvDownload("crop-performance.csv", [["Crop","Variety","Acres","Yield/ac","Cost/ac","Revenue/ac","Profit/ac","ROI","Rank"], ...CROP_PERF.map((c) => [c.crop, c.variety, c.acres, c.yieldPerAcre, c.costPerAcre, c.revenuePerAcre, c.profitPerAcre, c.roi + "%", c.rank])])}><Download /> CSV</button>
              </div>
            }
          />
          <div className="gm-an-crop-grid">
            {CROP_PERF.map((c) => (<CropBar key={c.crop} crop={c} max={maxRevPerAcre} />))}
          </div>
          <div className="gm-card-grid-3" style={{ marginTop: "1rem" }}>
            <DashboardMetric icon={Award} label="ROI leader" value="Cabbage" note="523% — plant again SR 2027" />
            <DashboardMetric icon={TrendingUp} label="Revenue leader" value="Tomato" note={kes(800000) + "/ac at 20 tonnes" } />
            <DashboardMetric icon={TrendingDown} label="Lowest ROI" value="Maize" note="58% — consider rotating to beans" />
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 11.3 COST ==================================== */}
      {section === "cost" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.3 · Cost Analysis"
            title="Where every shilling went"
            subtitle="Fertilizer is your single biggest cost at 31%. Pesticides (+8%) and transport (+15%) ran over budget."
            action={<button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => csvDownload("cost-breakdown.csv", [["Category","Amount","%","vs budget"], ...COST_CATEGORIES.map((c) => [c.category, c.amount, c.pct + "%", c.vsBudget])])}><Download /> CSV</button>}
          />
          <div className="gm-an-cost-grid">
            {COST_CATEGORIES.map((c) => (<CostRow key={c.category} c={c} max={maxCost} />))}
          </div>
          <div className="gm-card-grid-3" style={{ marginTop: "1rem" }}>
            <DashboardMetric icon={PieChart} label="Total costs YTD" value={kes(totals.costs)} note="vs budget -1% overall" />
            <DashboardMetric icon={TrendingDown} label="Biggest overrun" value="Transport" note="+15% · extra Marikiti runs" />
            <DashboardMetric icon={TrendingUp} label="Best savings" value="Seeds" note="-10% · nursery reuse" />
          </div>
          <AnCallout tone="warn">
            <strong>Action.</strong> Pesticide spend ran 8% over because of late blight in Plot 2. Next season start sprays at transplant (not at first symptom) and alternate Ridomil with Mancozeb per your advisor plan.
          </AnCallout>
        </Reveal>
      ) : null}

      {/* ==================================== 11.4 REVENUE ==================================== */}
      {section === "revenue" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.4 · Revenue Analysis"
            title="Monthly revenue against targets"
            subtitle="Green bars = hit or beat target; red bars = missed. Jan projection is your cabbage harvest."
            action={<button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => csvDownload("revenue.csv", [["Month","Cabbage","Maize","Tomato","Total","Target","Variance","Hit"], ...REVENUE_MONTHS.map((m) => [m.month, m.cabbage, m.maize, m.tomato, m.total, m.target, m.variance, m.hit ? "Yes" : "No"])])}><Download /> CSV</button>}
          />
          <div className="gm-card gm-card-flush">
            <div className="gm-an-rev-chart">
              {REVENUE_MONTHS.map((m) => (<RevenueBar key={m.month} m={m} max={maxRev} />))}
            </div>
          </div>
          <div className="gm-card gm-card-flush" style={{ marginTop: "1rem" }}>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead><tr><th>Month</th><th>Cabbage</th><th>Maize</th><th>Tomato</th><th>Total</th><th>Target</th><th>Variance</th></tr></thead>
                <tbody>
                  {REVENUE_MONTHS.map((m) => (
                    <tr key={m.month}>
                      <td><strong>{m.month}</strong></td>
                      <td>{m.cabbage ? kes(m.cabbage) : "—"}</td>
                      <td>{m.maize ? kes(m.maize) : "—"}</td>
                      <td>{m.tomato ? kes(m.tomato) : "—"}</td>
                      <td><strong>{kes(m.total)}</strong></td>
                      <td>{kes(m.target)}</td>
                      <td style={{ color: m.hit ? "var(--gm-leaf-700)" : "var(--gm-clay-700)", fontWeight: 800 }}>{m.variance > 0 ? "+" : ""}{kes(m.variance)} {m.hit ? "✓" : "🔴"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 11.5 LABOUR ==================================== */}
      {section === "labour" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.5 · Labour Efficiency"
            title="Your team and their output"
            subtitle="Revenue per labour day is KES 6,905 — well above the Kiambu average of KES 4,200."
            action={<button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => csvDownload("labour.csv", [["Name","Role","Tasks","Rating","Days","Pay"], ...WORKERS.map((w) => [w.name, w.role, w.tasks, w.rating, w.daysWorked, w.totalPay])])}><Download /> CSV</button>}
          />
          <div className="gm-card-grid-3">
            {LABOUR_EFFICIENCY.slice(0, 6).map((it) => (
              <div key={it.k} className="gm-stat"><span className="gm-mega-icon"><Users /></span><strong className="gm-stat-value font-display">{it.v}</strong><span className="gm-stat-label">{it.k}</span></div>
            ))}
          </div>
          <h4 className="gm-h-section" style={{ marginTop: "1.5rem" }}>Team roster</h4>
          <div className="gm-an-toolbar">
            <div className="gm-an-search"><Search width={16} height={16} /><input className="gm-input" placeholder="Search worker…" value={workerQuery} onChange={(e) => { setWorkerQuery(e.target.value); setWorkerPage(1); }} /></div>
            <span className="gm-mk-count">{filteredWorkers.length} workers</span>
          </div>
          <div className="gm-card gm-card-flush">
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead><tr><th></th><th>Name</th><th>Tasks</th><th>Rating</th><th>Days</th><th>Pay YTD</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {workersShown.map((w) => (<WorkerRow key={w.id} w={w} onOpen={(wr) => { setSelectedWorker(wr); setModal("worker-detail"); }} />))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={workerPage} total={wPages} perPage={wPerPage} totalItems={filteredWorkers.length} onChange={(p) => setWorkerPage(p)} />
        </Reveal>
      ) : null}

      {/* ==================================== 11.6 WEATHER ==================================== */}
      {section === "weather" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.6 · Weather Impact Analysis"
            title="How rainfall shaped your yield this season"
            subtitle="Both maize and cabbage saw below-normal rainfall; irrigation kept cabbage close to target but maize was hit at tasseling."
          />
          <div className="gm-an-wx-grid">
            {WEATHER_IMPACT.map((w, i) => (<WeatherRow key={i} w={w} />))}
          </div>
          <AnCallout tone="info">
            <CloudRain width={16} height={16} /> LR 2026 ran 13% below normal across Kiambu. Installing drip irrigation on plot 4 (maize for LR 2027) would recover an estimated 1.5 bags/acre — worth KES 5,250 against KES 18,000 of drip kit cost.
          </AnCallout>
        </Reveal>
      ) : null}

      {/* ==================================== 11.7 BUILDER ==================================== */}
      {section === "builder" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.7 · Custom Report Builder"
            title="Build your own report"
            subtitle="Pick date range, crops, metrics and comparison groups — we generate the PDF/Excel/CSV in seconds."
            action={<button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setModal("report-builder")}><Plus /> Start builder</button>}
          />
          <div className="gm-an-builder-walk">
            <div className="gm-an-step"><strong>1</strong><span>Pick date range</span></div>
            <div className="gm-an-step"><strong>2</strong><span>Choose crops & plots</span></div>
            <div className="gm-an-step"><strong>3</strong><span>Select metrics</span></div>
            <div className="gm-an-step"><strong>4</strong><span>Compare vs last season / county</span></div>
            <div className="gm-an-step"><strong>5</strong><span>Choose chart types & format</span></div>
            <div className="gm-an-step"><strong>6</strong><span>Download or share</span></div>
          </div>
          <div className="gm-card-grid-3" style={{ marginTop: "1rem" }}>
            <div className="gm-stat"><span className="gm-mega-icon"><FileBarChart2 /></span><strong className="gm-stat-value font-display">9</strong><span className="gm-stat-label">Metrics available</span><small>Revenue, cost, profit, yield, labour, inputs, weather, ROI, loss</small></div>
            <div className="gm-stat"><span className="gm-mega-icon"><BarChart3 /></span><strong className="gm-stat-value font-display">5</strong><span className="gm-stat-label">Chart types</span><small>Bar, line, pie, table, area</small></div>
            <div className="gm-stat"><span className="gm-mega-icon"><Share2 /></span><strong className="gm-stat-value font-display">3</strong><span className="gm-stat-label">Share channels</span><small>WhatsApp, SMS, email — time-limited</small></div>
          </div>
        </Reveal>
      ) : null}

      {/* ==================================== 11.8 PRE-BUILT ==================================== */}
      {section === "reports" ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="11.8 · Pre-Built Reports"
            title="One-click reports for every audience"
            subtitle="These cover the documents your bank, cooperative, KEPHIS and your own season review ask for."
            action={<button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => csvDownload("premade-reports.csv", [["Name","Use case","Last run"], ...PREMADE_REPORTS.map((r) => [r.name, r.useCase, r.lastRun ?? ""])])}><Download /> CSV</button>}
          />
          <div className="gm-an-toolbar">
            <div className="gm-an-search"><Search width={16} height={16} /><input className="gm-input" placeholder="Search reports…" value={reportQuery} onChange={(e) => { setReportQuery(e.target.value); setReportPage(1); }} /></div>
            <span className="gm-mk-count">{filteredReports.length} reports</span>
          </div>
          <div className="gm-an-report-grid">
            {reportsShown.map((r) => (
              <ReportCard key={r.id} r={r}
                onRun={runReport}
                onShare={(rp) => { setSelectedReport(rp); setModal("share"); }}
                onDownload={(rp) => openResultFor(rp.name)}
              />
            ))}
          </div>
          <Pagination page={reportPage} total={rPages} perPage={rPerPage} totalItems={filteredReports.length} onChange={(p) => setReportPage(p)} />
        </Reveal>
      ) : null}

      {/* Drawer */}
      <DashboardDrawer open={drawer === "saved"} title="Saved reports" onClose={() => setDrawer(null)} footer={<button className="gm-btn gm-btn-lime" onClick={() => setDrawer(null)}>Close</button>}>
        <AnCallout tone="info">You have 12 saved reports. Oldest auto-deletes after 180 days.</AnCallout>
        {PREMADE_REPORTS.slice(0, 5).map((r) => (
          <div key={r.id} className="gm-an-kv-row"><span className="gm-an-kv-k">{r.name}</span><span className="gm-an-kv-v">{r.lastRun ?? "—"}</span></div>
        ))}
      </DashboardDrawer>

      {/* Modals */}
      <KpiDetailDialog open={modal === "kpi-detail"} onClose={() => setModal(null)} title={kpiTitle}>{kpiBody}</KpiDetailDialog>
      <CropCompareDialog open={modal === "crop-compare"} onClose={() => setModal(null)} />
      <WorkerDetailDialog open={modal === "worker-detail"} onClose={() => setModal(null)} worker={selectedWorker} />
      <RunReportWizard open={modal === "report-run"} onClose={() => setModal(null)} report={selectedReport} />
      <ReportBuilderWizard open={modal === "report-builder"} onClose={() => setModal(null)} />
      <ReportResultDialog open={modal === "report-result"} onClose={() => setModal(null)} title={result?.title ?? ""} subtitle={result?.sub} rows={result?.rows ?? []} />
      <LoanPreviewDialog open={modal === "loan-preview"} onClose={() => setModal(null)} />
      <AnalyticsExportDialog open={modal === "export"} onClose={() => setModal(null)} />
      <AnalyticsShareDialog open={modal === "share"} onClose={() => setModal(null)} title={selectedReport ? selectedReport.name : "Analytics report"} />
      <AnalyticsSettingsDialog open={modal === "settings"} onClose={() => setModal(null)} />
      <AnalyticsFaqDialog open={modal === "faq"} onClose={() => setModal(null)} />
      <AnalyticsScoreDialog open={modal === "score"} onClose={() => setModal(null)} />
      <ConfirmAnalyticsDialog open={modal === "confirm-delete"} onClose={() => setModal(null)} title="Delete report?" desc="This removes the saved report from your list." onConfirm={() => toast.notify("Report removed", "info")} />

      <div style={{ height: "3rem" }} />
      <style>{`
        .gm-app .gm-an-builder-walk { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0 0.3rem; }
        .gm-app .gm-an-step { display: flex; align-items: center; gap: 0.5rem; background: var(--gm-card); border: 1px solid var(--gm-line); border-radius: 999px; padding: 0.4rem 0.9rem; font-size: 0.82rem; font-weight: 600; }
        .gm-app .gm-an-step strong { width: 22px; height: 22px; border-radius: 50%; background: var(--gm-leaf-500); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; }
      `}</style>
    </div>
  );
}
