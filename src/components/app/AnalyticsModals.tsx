/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING MODALS
   All modals, wizards, drawers, and dialogs for the analytics page.
   ========================================================================== */
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Eye,
  FileDown,
  FileText,
  Filter,
  Globe,
  Grid3X3,
  Hash,
  Layers,
  ListFilter,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  PieChart,
  Plus,
  RefreshCw,
  Settings2,
  Share2,
  ShieldCheck,
  Smartphone,
  Table,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Stepper, Toggle } from "../../components/auth/controls";
import { StatusChip } from "../../components/app/DashboardWidgets";
import { DashboardDrawer } from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";
import type {
  PreBuiltReport,
  ReportSchedule,
  CostCategory,
  CropPerformance,
  FarmKpi,
  LabourMetric,
  RevenueMonth,
  WeatherImpact,
  BenchmarkRow,
} from "../../data/app/analytics";

/* ── Confirm dialog ──────────────────────────────────────────────────────── */
export function ConfirmAnalyticsDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={body}>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={`gm-btn gm-btn-sm ${destructive ? "gm-btn-danger" : "gm-btn-lime"}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/* ── KPI Drilldown Dialog ────────────────────────────────────────────────── */
export function KpiDrilldownDialog({
  open,
  kpi,
  onClose,
}: {
  open: boolean;
  kpi: FarmKpi | null;
  onClose: () => void;
}) {
  if (!kpi) return null;
  const trendColor = kpi.trend === "up" ? "low" : kpi.trend === "down" ? "high" : "neutral";
  return (
    <Dialog open={open} onClose={onClose} title={`KPI: ${kpi.label}`}>
      <div className="gm-wizard-stack">
        <div className="gm-plan-detail-hero">
          <span className="gm-finance-activity-icon is-in" style={{ background: "var(--gm-leaf-100)" }}>
            <TrendingUp />
          </span>
          <div>
            <span className="gm-eyebrow">Current value</span>
            <h3 className="font-display mb-1">{kpi.value}</h3>
            <StatusChip label={kpi.trend === "up" ? "Improving" : kpi.trend === "down" ? "Declining" : "Stable"} tone={trendColor} />
          </div>
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>vs Last Season</span><strong className={kpi.vsLastSeason.startsWith("+") ? "text-success" : kpi.vsLastSeason.startsWith("-") ? "text-danger" : ""}>{kpi.vsLastSeason}</strong></div>
          <div className="gm-review-row"><span>vs County Average</span><strong className={kpi.vsCountyAvg.startsWith("+") ? "text-success" : kpi.vsCountyAvg.startsWith("-") ? "text-danger" : ""}>{kpi.vsCountyAvg}</strong></div>
          <div className="gm-review-row"><span>Unit</span><strong>{kpi.unit}</strong></div>
        </div>
        <div className="gm-check-row">
          <ShieldCheck />
          <span><strong>What this means</strong><small>This KPI is calculated from your recorded farm data and compared against last season's records and Kiambu county averages from the Agricultural Extension office.</small></span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Crop Performance Detail Dialog ──────────────────────────────────────── */
export function CropPerformanceDialog({
  open,
  crop,
  onClose,
}: {
  open: boolean;
  crop: CropPerformance | null;
  onClose: () => void;
}) {
  if (!crop) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`${crop.crop} ${crop.variety} — Performance`}>
      <div className="gm-wizard-stack">
        <div className="gm-plan-detail-hero">
          <span style={{ fontSize: "2.5rem" }}>{crop.symbol}</span>
          <div>
            <span className="gm-eyebrow">{crop.plot}</span>
            <h3 className="font-display mb-1">{crop.crop} {crop.variety}</h3>
            <StatusChip label={crop.rank === 1 ? "🥇 Best crop" : crop.rank === 2 ? "🥈 Runner up" : "🥉 Third"} tone={crop.rank === 1 ? "low" : crop.rank === 2 ? "medium" : "neutral"} />
          </div>
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Yield per acre</span><strong>{crop.yieldPerAcre}</strong></div>
          <div className="gm-review-row"><span>Cost per acre</span><strong>{kes(crop.costPerAcre)}</strong></div>
          <div className="gm-review-row"><span>Revenue per acre</span><strong className="text-success">{kes(crop.revenuePerAcre)}</strong></div>
          <div className="gm-review-row"><span>Profit per acre</span><strong className="text-success">{kes(crop.profitPerAcre)}</strong></div>
          <div className="gm-review-row"><span>ROI</span><strong className="text-success">{crop.roi}%</strong></div>
        </div>
        <div className="row g-2">
          <div className="col-4"><div className="gm-kpi-soft"><small>Revenue</small><strong className="font-display">{kes(crop.revenuePerAcre)}</strong></div></div>
          <div className="col-4"><div className="gm-kpi-soft"><small>Cost</small><strong className="font-display">{kes(crop.costPerAcre)}</strong></div></div>
          <div className="col-4"><div className="gm-kpi-soft"><small>ROI</small><strong className="font-display">{crop.roi}%</strong></div></div>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Cost Category Detail Dialog ─────────────────────────────────────────── */
export function CostCategoryDialog({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: CostCategory | null;
  onClose: () => void;
}) {
  if (!category) return null;
  const variance = category.amount - category.budgetAmount;
  return (
    <Dialog open={open} onClose={onClose} title={`${category.category} — Cost Detail`}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Actual spend</span><strong className="font-display">{kes(category.amount)}</strong></div>
          <div className="gm-review-row"><span>Budgeted</span><strong>{kes(category.budgetAmount)}</strong></div>
          <div className="gm-review-row"><span>Variance</span><strong className={variance > 0 ? "text-danger" : variance < 0 ? "text-success" : ""}>{variance > 0 ? "+" : ""}{kes(Math.abs(variance))}</strong></div>
          <div className="gm-review-row"><span>% of total costs</span><strong>{category.percentOfTotal}%</strong></div>
          <div className="gm-review-row"><span>vs Budget</span><strong>{category.vsBudget}</strong></div>
        </div>
        <div className="gm-check-row">
          {variance <= 0 ? <CheckCircle2 /> : <AlertTriangle />}
          <span>
            <strong>{variance <= 0 ? "Under budget" : "Over budget"}</strong>
            <small>{variance <= 0 ? `You saved ${kes(Math.abs(variance))} compared to the plan.` : `Spending exceeded the plan by ${kes(variance)}. Review recent purchases.`}</small>
          </span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Revenue Month Detail Dialog ─────────────────────────────────────────── */
export function RevenueMonthDialog({
  open,
  month,
  onClose,
}: {
  open: boolean;
  month: RevenueMonth | null;
  onClose: () => void;
}) {
  if (!month) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`${month.month} — Revenue Breakdown`}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Cabbage</span><strong className="font-display">{month.cabbage > 0 ? kes(month.cabbage) : "—"}</strong></div>
          <div className="gm-review-row"><span>Maize</span><strong className="font-display">{month.maize > 0 ? kes(month.maize) : "—"}</strong></div>
          <div className="gm-review-row"><span>Tomato</span><strong className="font-display">{month.tomato > 0 ? kes(month.tomato) : "—"}</strong></div>
          <div className="gm-review-row"><span>Total</span><strong className="font-display">{kes(month.total)}</strong></div>
          <div className="gm-review-row"><span>Target</span><strong>{kes(month.target)}</strong></div>
          <div className="gm-review-row"><span>Variance</span><strong className={month.variance >= 0 ? "text-success" : "text-danger"}>{month.variance >= 0 ? "+" : ""}{kes(month.variance)}</strong></div>
        </div>
        <div className="gm-check-row">
          {month.variance >= 0 ? <CheckCircle2 /> : <AlertTriangle />}
          <span>
            <strong>{month.variance >= 0 ? "Above target" : month.variance < 0 && month.target > 0 ? "Below target" : "No target"}</strong>
            <small>{month.variance >= 0 ? `Exceeded target by ${kes(month.variance)}.` : month.variance < 0 && month.target > 0 ? `Shortfall of ${kes(Math.abs(month.variance))}. Review market timing.` : "No revenue target set for this month."}</small>
          </span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Labour Metric Dialog ────────────────────────────────────────────────── */
export function LabourMetricDialog({
  open,
  metric,
  onClose,
}: {
  open: boolean;
  metric: LabourMetric | null;
  onClose: () => void;
}) {
  if (!metric) return null;
  return (
    <Dialog open={open} onClose={onClose} title={metric.label}>
      <div className="gm-wizard-stack">
        <div className="gm-plan-detail-hero">
          <span className="gm-finance-activity-icon is-in" style={{ background: "var(--gm-gold-100)" }}>
            <Users />
          </span>
          <div>
            <span className="gm-eyebrow">Current value</span>
            <h3 className="font-display mb-1">{metric.value}</h3>
          </div>
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Unit</span><strong>{metric.unit}</strong></div>
          <div className="gm-review-row"><span>Note</span><strong>{metric.note}</strong></div>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Weather Impact Dialog ───────────────────────────────────────────────── */
export function WeatherImpactDialog({
  open,
  weather,
  onClose,
}: {
  open: boolean;
  weather: WeatherImpact | null;
  onClose: () => void;
}) {
  if (!weather) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`${weather.season} — ${weather.crop} Weather Impact`}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Actual rainfall</span><strong className="font-display">{weather.actualRainfall} mm</strong></div>
          <div className="gm-review-row"><span>Normal rainfall</span><strong>{weather.normalRainfall} mm</strong></div>
          <div className="gm-review-row"><span>Deviation</span><strong className={weather.deviation < 0 ? "text-danger" : "text-success"}>{weather.deviation}%</strong></div>
          <div className="gm-review-row"><span>Yield impact</span><strong>{weather.yieldImpact}</strong></div>
        </div>
        <div className="gm-check-row">
          <AlertTriangle />
          <span><strong>Field note</strong><small>{weather.notes}</small></span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── Report Builder Wizard ───────────────────────────────────────────────── */
export function ReportBuilderWizard({
  open,
  onClose,
  onGenerate,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => void;
}) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<ReportConfig>({
    dateRange: "This season",
    crops: "All crops",
    plots: "All plots",
    metrics: ["Revenue", "Cost", "Profit"],
    compareTo: "Last season",
    chartType: "Table",
    exportFormat: "PDF",
    share: "Download",
  });

  useEffect(() => {
    if (open) { setStep(0); setConfig({ dateRange: "This season", crops: "All crops", plots: "All plots", metrics: ["Revenue", "Cost", "Profit"], compareTo: "Last season", chartType: "Table", exportFormat: "PDF", share: "Download" }); }
  }, [open]);

  const steps = ["Date range", "Filters", "Metrics", "Output"];
  const toggleMetric = (m: string) => setConfig(c => ({ ...c, metrics: c.metrics.includes(m) ? c.metrics.filter(x => x !== m) : [...c.metrics, m] }));

  return (
    <Dialog open={open} onClose={onClose} title="Build Custom Report" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <>
            <div className="gm-field">
              <label>Date range</label>
              <select className="gm-select w-100" value={config.dateRange} onChange={e => setConfig(c => ({ ...c, dateRange: e.target.value }))}>
                {["This week", "This month", "This season", "Last season", "Year to date", "Custom range"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="gm-field">
              <label>Crop filter</label>
              <select className="gm-select w-100" value={config.crops} onChange={e => setConfig(c => ({ ...c, crops: e.target.value }))}>
                {["All crops", "Cabbage Gloria F1", "Maize H6213", "Tomato Anna F1", "Dry Beans Rosecoco"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="gm-field">
              <label>Plot filter</label>
              <select className="gm-select w-100" value={config.plots} onChange={e => setConfig(c => ({ ...c, plots: e.target.value }))}>
                {["All plots", "Plot 1 (0.5 acre)", "Plot 2 (2 acres)", "Plot 3 (1 acre)", "Greenhouse 1"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="gm-field">
              <label>Compare to</label>
              <select className="gm-select w-100" value={config.compareTo} onChange={e => setConfig(c => ({ ...c, compareTo: e.target.value }))}>
                {["Last season", "County average", "Top 10% farmers"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="gm-field">
              <label>Chart type</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {["Bar", "Line", "Pie", "Table", "Area"].map(t => (
                  <button key={t} type="button" className={`gm-btn gm-btn-sm ${config.chartType === t ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setConfig(c => ({ ...c, chartType: t }))}>{t}</button>
                ))}
              </div>
            </div>
          </>
        ) : step === 2 ? (
          <div className="gm-field">
            <label>Select metrics to include</label>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {["Revenue", "Cost", "Profit", "Yield", "Labour", "Inputs", "Weather"].map(m => (
                <button key={m} type="button" className={`gm-btn gm-btn-sm ${config.metrics.includes(m) ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => toggleMetric(m)}>{m}</button>
              ))}
            </div>
            <p className="text-muted mt-2 mb-0">{config.metrics.length} metric{config.metrics.length === 1 ? "" : "s"} selected</p>
          </div>
        ) : (
          <>
            <div className="gm-field">
              <label>Export format</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {["PDF", "Excel", "CSV"].map(f => (
                  <button key={f} type="button" className={`gm-btn gm-btn-sm ${config.exportFormat === f ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setConfig(c => ({ ...c, exportFormat: f }))}>{f}</button>
                ))}
              </div>
            </div>
            <div className="gm-field">
              <label>Share method</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {["Download", "Email", "WhatsApp"].map(s => (
                  <button key={s} type="button" className={`gm-btn gm-btn-sm ${config.share === s ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setConfig(c => ({ ...c, share: s }))}>{s === "Download" ? <><FileDown className="me-1" />Download</> : s === "Email" ? <><Mail className="me-1" />Email</> : <><MessageCircle className="me-1" />WhatsApp</>}</button>
                ))}
              </div>
            </div>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Date range</span><strong>{config.dateRange}</strong></div>
              <div className="gm-review-row"><span>Crop</span><strong>{config.crops}</strong></div>
              <div className="gm-review-row"><span>Plot</span><strong>{config.plots}</strong></div>
              <div className="gm-review-row"><span>Compare to</span><strong>{config.compareTo}</strong></div>
              <div className="gm-review-row"><span>Chart type</span><strong>{config.chartType}</strong></div>
              <div className="gm-review-row"><span>Metrics</span><strong>{config.metrics.join(", ")}</strong></div>
              <div className="gm-review-row"><span>Format</span><strong>{config.exportFormat}</strong></div>
              <div className="gm-review-row"><span>Share via</span><strong>{config.share}</strong></div>
            </div>
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onGenerate(config); onClose(); }}><Check /> Generate report</button>
        )}
      </div>
    </Dialog>
  );
}

export interface ReportConfig {
  dateRange: string;
  crops: string;
  plots: string;
  metrics: string[];
  compareTo: string;
  chartType: string;
  exportFormat: string;
  share: string;
}

/* ── Report Preview Dialog ───────────────────────────────────────────────── */
export function ReportPreviewDialog({
  open,
  report,
  onClose,
  onDownload,
  onShare,
}: {
  open: boolean;
  report: PreBuiltReport | null;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  if (!report) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Preview: ${report.name}`} wide>
      <div className="gm-wizard-stack">
        <div className="gm-plan-detail-hero">
          <span className="gm-finance-activity-icon is-in" style={{ background: "var(--gm-leaf-100)" }}>
            <FileText />
          </span>
          <div>
            <span className="gm-eyebrow">{report.useCase}</span>
            <h3 className="font-display mb-1">{report.name}</h3>
            <StatusChip label={`${report.pages} pages`} tone="neutral" />
          </div>
        </div>
        <p className="text-muted">{report.description}</p>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Contents</span><strong>{report.contents}</strong></div>
          <div className="gm-review-row"><span>Use case</span><strong>{report.useCase}</strong></div>
          <div className="gm-review-row"><span>Last generated</span><strong>{report.lastGenerated}</strong></div>
          <div className="gm-review-row"><span>Page count</span><strong>{report.pages} pages</strong></div>
        </div>
        <div className="gm-check-row">
          <ShieldCheck />
          <span><strong>Data included</strong><small>This report contains live data from your farm records up to the last generation date. Regenerate to include the latest entries.</small></span>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={onShare}><Share2 /> Share</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onDownload}><Download /> Download</button>
      </div>
    </Dialog>
  );
}

/* ── Report Share Dialog ─────────────────────────────────────────────────── */
export function ReportShareDialog({
  open,
  reportName,
  onClose,
}: {
  open: boolean;
  reportName: string;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<"email" | "whatsapp" | "link">("email");
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title={`Share: ${reportName}`}>
      <div className="gm-wizard-stack">
        <div className="d-flex gap-2 mb-2">
          {([["email", Mail], ["whatsapp", MessageCircle], ["link", Globe]] as const).map(([m, Icon]) => (
            <button key={m} type="button" className={`gm-btn gm-btn-sm ${method === m ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setMethod(m)}><Icon className="me-1" />{m === "email" ? "Email" : m === "whatsapp" ? "WhatsApp" : "Copy link"}</button>
          ))}
        </div>
        {method === "email" ? (
          <div className="gm-field">
            <label>Recipient email</label>
            <input className="gm-input" type="email" placeholder="e.g. mary@wanjiku.ke" />
          </div>
        ) : method === "whatsapp" ? (
          <div className="gm-field">
            <label>WhatsApp number</label>
            <input className="gm-input" type="tel" placeholder="0712 345 678" />
          </div>
        ) : (
          <div className="gm-check-row">
            <Globe />
            <span><strong>Share link</strong><small>https://app.growmo.ke/reports/share/{reportName.toLowerCase().replace(/\s/g, "-")}</small></span>
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setCopied(true)}>{copied ? <><Check className="me-1" />Copied</> : <><Copy className="me-1" />Copy</>}</button>
          </div>
        )}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        {method !== "link" && <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Send className="me-1" />Send</button>}
      </div>
    </Dialog>
  );
}

/* Placeholder for missing Send icon */
function Send(props: any) {
  return <ArrowRight {...props} />;
}

/* ── Report Schedule Wizard ──────────────────────────────────────────────── */
export function ReportScheduleWizard({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: ReportSchedule | null;
  onClose: () => void;
  onSave: (schedule: ReportSchedule) => void;
}) {
  const [form, setForm] = useState<ReportSchedule>({
    id: "",
    reportName: "Season Summary",
    frequency: "Monthly",
    recipients: "",
    lastSent: "",
    nextSend: "",
    active: true,
  });

  useEffect(() => {
    if (open) {
      setForm(editing ?? { id: `rs-${Date.now()}`, reportName: "Season Summary", frequency: "Monthly", recipients: "", lastSent: "Never", nextSend: "01 Dec 2026", active: true });
    }
  }, [open, editing]);

  return (
    <Dialog open={open} onClose={onClose} title={editing ? "Edit Report Schedule" : "Schedule a Report"}>
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Report</label>
          <select className="gm-select w-100" value={form.reportName} onChange={e => setForm(f => ({ ...f, reportName: e.target.value }))}>
            {["Season Summary", "Loan Application Report", "Crop Performance Card", "Financial Statement", "Input Usage Report", "Labour Report", "Compliance Report", "Market Analysis"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="gm-field">
          <label>Frequency</label>
          <select className="gm-select w-100" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
            {["Weekly", "Monthly", "End of season", "Quarterly"].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="gm-field">
          <label>Recipients (comma-separated emails)</label>
          <input className="gm-input w-100" value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))} placeholder="e.g. mary@wanjiku.ke, accountant@co.ke" />
        </div>
        <Toggle checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} label="Active" desc="Send reports automatically on schedule" />
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save schedule</button>
      </div>
    </Dialog>
  );
}

/* ── Analytics Settings Dialog ───────────────────────────────────────────── */
export function AnalyticsSettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: AnalyticsSettings;
  onClose: () => void;
  onSave: (settings: AnalyticsSettings) => void;
}) {
  const [form, setForm] = useState(settings);
  useEffect(() => { if (open) setForm(settings); }, [open, settings]);

  return (
    <Dialog open={open} onClose={onClose} title="Analytics Settings">
      <div className="gm-wizard-stack">
        <Toggle checked={form.autoRefresh} onChange={v => setForm(f => ({ ...f, autoRefresh: v }))} label="Auto-refresh KPIs" desc="Update dashboard metrics every time you open Analytics" />
        <Toggle checked={form.includeWeather} onChange={v => setForm(f => ({ ...f, includeWeather: v }))} label="Include weather data" desc="Pull rainfall and temperature from Met Department" />
        <Toggle checked={form.benchmarkEnabled} onChange={v => setForm(f => ({ ...f, benchmarkEnabled: v }))} label="County benchmarking" desc="Compare your metrics against Kiambu county averages" />
        <Toggle checked={form.weeklyDigest} onChange={v => setForm(f => ({ ...f, weeklyDigest: v }))} label="Weekly analytics digest" desc="Receive a summary email every Monday" />
        <div className="gm-field">
          <label>Fiscal year start month</label>
          <select className="gm-select w-100" value={form.fiscalStart} onChange={e => setForm(f => ({ ...f, fiscalStart: e.target.value }))}>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="gm-field">
          <label>Default currency</label>
          <select className="gm-select w-100" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
            {["KES", "USD", "GBP", "UGX", "TZS"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save settings</button>
      </div>
    </Dialog>
  );
}

export interface AnalyticsSettings {
  autoRefresh: boolean;
  includeWeather: boolean;
  benchmarkEnabled: boolean;
  weeklyDigest: boolean;
  fiscalStart: string;
  currency: string;
}

/* ── Export Data Dialog ──────────────────────────────────────────────────── */
export function ExportDataDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [sections, setSections] = useState<string[]>(["KPIs", "Crop performance", "Revenue"]);
  const toggleSection = (s: string) => setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const allSections = ["KPIs", "Crop performance", "Cost analysis", "Revenue", "Labour efficiency", "Weather impact", "Benchmarks"];

  return (
    <Dialog open={open} onClose={onClose} title="Export Farm Data">
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Format</label>
          <div className="d-flex gap-2 mt-1">
            {([["csv", Table], ["excel", Grid3X3], ["pdf", FileText]] as const).map(([f, Icon]) => (
              <button key={f} type="button" className={`gm-btn gm-btn-sm ${format === f ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setFormat(f as any)}><Icon className="me-1" />{f.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div className="gm-field">
          <label>Sections to include</label>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {allSections.map(s => (
              <button key={s} type="button" className={`gm-btn gm-btn-sm ${sections.includes(s) ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => toggleSection(s)}>{s}</button>
            ))}
          </div>
          <p className="text-muted mt-2 mb-0">{sections.length} of {allSections.length} sections selected</p>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Download /> Export {format.toUpperCase()}</button>
      </div>
    </Dialog>
  );
}

/* ── Benchmark Detail Drawer ─────────────────────────────────────────────── */
export function BenchmarkDrawer({
  open,
  row,
  onClose,
}: {
  open: boolean;
  row: BenchmarkRow | null;
  onClose: () => void;
}) {
  if (!row) return null;
  return (
    <DashboardDrawer
      open={open}
      title={`${row.metric} — Benchmark`}
      onClose={onClose}
    >
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Your farm</span><strong className="font-display">{row.yourFarm}</strong></div>
          <div className="gm-review-row"><span>County average</span><strong>{row.countyAverage}</strong></div>
          <div className="gm-review-row"><span>Top 10%</span><strong>{row.top10}</strong></div>
          <div className="gm-review-row"><span>Difference</span><strong className={row.status === "above" ? "text-success" : "text-danger"}>{row.difference}</strong></div>
        </div>
        <div className="gm-check-row">
          {row.status === "above" ? <CheckCircle2 /> : <AlertTriangle />}
          <span>
            <strong>{row.status === "above" ? "Above average" : "Below average"}</strong>
            <small>{row.status === "above" ? "Great performance! Keep monitoring and aim for top 10%." : "Focus on this metric. Check extension officer recommendations."}</small>
          </span>
        </div>
      </div>
    </DashboardDrawer>
  );
}

/* ── Comparison Wizard ───────────────────────────────────────────────────── */
export function ComparisonWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"season" | "crop" | "plot">("season");
  const [selectedA, setSelectedA] = useState("SR 2026");
  const [selectedB, setSelectedB] = useState("LR 2026");

  useEffect(() => { if (open) setStep(0); }, [open]);

  const steps = ["Comparison type", "Select items", "Results"];
  const seasonOptions = ["SR 2026", "LR 2026", "SR 2025", "LR 2025"];
  const cropOptions = ["Cabbage Gloria F1", "Maize H6213", "Tomato Anna F1", "Dry Beans Rosecoco"];
  const plotOptions = ["Plot 1 (0.5 acre)", "Plot 2 (2 acres)", "Plot 3 (1 acre)", "Greenhouse 1"];

  const getOptions = () => mode === "season" ? seasonOptions : mode === "crop" ? cropOptions : plotOptions;

  return (
    <Dialog open={open} onClose={onClose} title="Compare Performance" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <div className="gm-field">
            <label>What do you want to compare?</label>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {([["season", Calendar], ["crop", PieChart], ["plot", Layers]] as const).map(([m, Icon]) => (
                <button key={m} type="button" className={`gm-btn gm-btn-lg ${mode === m ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setMode(m as any)} style={{ flex: "1 1 140px" }}>
                  <Icon className="me-1" /> {m === "season" ? "Seasons" : m === "crop" ? "Crops" : "Plots"}
                </button>
              ))}
            </div>
          </div>
        ) : step === 1 ? (
          <>
            <div className="gm-field">
              <label>{mode === "season" ? "Season A" : mode === "crop" ? "Crop A" : "Plot A"}</label>
              <select className="gm-select w-100" value={selectedA} onChange={e => setSelectedA(e.target.value)}>
                {getOptions().filter(o => o !== selectedB).map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="gm-field">
              <label>{mode === "season" ? "Season B" : mode === "crop" ? "Crop B" : "Plot B"}</label>
              <select className="gm-select w-100" value={selectedB} onChange={e => setSelectedB(e.target.value)}>
                {getOptions().filter(o => o !== selectedA).map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </>
        ) : (
          <div className="gm-wizard-stack">
            <h4 className="font-display">{selectedA} vs {selectedB}</h4>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>{selectedA} revenue</span><strong className="font-display">KES 580,000</strong></div>
              <div className="gm-review-row"><span>{selectedB} revenue</span><strong className="font-display">KES 398,000</strong></div>
              <div className="gm-review-row"><span>Difference</span><strong className="text-success">+KES 182,000 (+46%)</strong></div>
              <div className="gm-review-row"><span>{selectedA} profit margin</span><strong>64%</strong></div>
              <div className="gm-review-row"><span>{selectedB} profit margin</span><strong>58%</strong></div>
            </div>
            <div className="gm-check-row">
              <TrendingUp />
              <span><strong>Improving trend</strong><small>{selectedA} outperforms {selectedB} in revenue and profit margin. Key drivers: cabbage direct sales and lower post-harvest losses.</small></span>
            </div>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Check /> Done</button>
        )}
      </div>
    </Dialog>
  );
}

/* ── Analytics Insight Drawer ────────────────────────────────────────────── */
export function AnalyticsInsightDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DashboardDrawer open={open} title="Farm Insights — AI Recommendations" onClose={onClose}>
      <div className="gm-wizard-stack">
        <div className="gm-alert-box is-success">
          <CheckCircle2 />
          <p><strong>Revenue growth on track</strong><br />Your YTD revenue is 45% higher than last season. Direct sales channel contributed 14% of total revenue.</p>
        </div>
        <div className="gm-alert-box">
          <TrendingUp />
          <p><strong>Expand cabbage production</strong><br />Cabbage shows 523% ROI — the highest across all crops. Consider adding 0.5 acre next season.</p>
        </div>
        <div className="gm-alert-box is-danger">
          <AlertTriangle />
          <p><strong>Maize needs attention</strong><br />At 58% ROI and a projected KES 2,000 loss, review your maize plan before expanding. Check seed rate and buyer price.</p>
        </div>
        <div className="gm-alert-box">
          <Users />
          <p><strong>Labour efficiency is above average</strong><br />Your revenue per labour day (KES 6,905) is 30% above county average. Maintain team size and task scheduling.</p>
        </div>
        <div className="gm-check-row">
          <ShieldCheck />
          <span><strong>Data-driven decisions</strong><small>These insights combine your farm records with county averages and weather data to suggest actionable improvements.</small></span>
        </div>
      </div>
    </DashboardDrawer>
  );
}