/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING (/app/analytics) — dialogs / wizards
   Reuses Dialog, Stepper, WizardActions, OtpInput, Toggle, DashboardDrawer.
   ========================================================================== */
import { CheckCircle2, Download, Loader2, Lock, Mail, MessageCircle, Printer, Send, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AN_FAQ, AN_GLOSSARY, PREMADE_REPORTS, REPORT_CHART_TYPES, REPORT_COMPARE, REPORT_CROPS, REPORT_METRICS, type PremadeReport, type Worker } from "../../data/app/analytics";
import { kes } from "../../data/site";
import { Dialog, OtpInput, Stepper, Toggle } from "../auth/controls";
import { WizardActions } from "./DashboardWidgets";
import { AnCallout, AnKv } from "./AnalyticsWidgets";

function rc(prefix = "RPT") {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let o = prefix + "-";
  for (let i = 0; i < 7; i++) o += s[Math.floor(Math.random() * s.length)];
  return o;
}

function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => "\"" + String(c ?? "").replaceAll('"', '""') + "\"").join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ================= 1) Report result dialog ================= */
export function ReportResultDialog({ open, onClose, title, subtitle, rows, filename }: { open: boolean; onClose: () => void; title: string; subtitle?: string; rows: { k: string; v: ReactNode }[]; filename?: string; }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={subtitle} wide>
      <AnKv items={rows} columns={2} />
      <div className="d-flex gap-2 justify-content-end mt-3 flex-wrap">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button className="gm-btn gm-btn-outline" onClick={() => window.print()}><Printer /> Print</button>
        <button className="gm-btn gm-btn-lime" onClick={() => filename ? csvDownload(filename, [["Field", "Value"], ...rows.map((r) => [r.k, String(r.v)])]) : null}><Download /> CSV</button>
      </div>
    </Dialog>
  );
}

/* ================= 2) Custom report builder wizard ================= */
export function ReportBuilderWizard({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [step, setStep] = useState(0);
  const [range, setRange] = useState("ytd");
  const [crops, setCrops] = useState(REPORT_CROPS.map((c) => ({ ...c })));
  const [metrics, setMetrics] = useState(REPORT_METRICS.map((m) => ({ ...m })));
  const [compare, setCompare] = useState(REPORT_COMPARE.map((c) => ({ ...c })));
  const [chart, setChart] = useState("bar");
  const [format, setFormat] = useState<"pdf"|"excel"|"csv">("pdf");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  useEffect(() => { if (open) { setStep(0); setDone(false); setProcessing(false); setOtp(""); setCode(rc("CUSTOM")); } }, [open]);
  const steps = ["Range & crops", "Metrics & compare", "Format", "Generate"];
  const toggleCrop = (id: string) => setCrops((cs) => cs.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));
  const toggleMetric = (id: string) => setMetrics((ms) => ms.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)));
  const pickCompare = (id: string) => setCompare((cs) => cs.map((c) => ({ ...c, selected: c.id === id })));
  return (
    <Dialog open={open} onClose={onClose} title="Custom Report Builder" desc="Choose exactly what goes in" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-an-stack mt-3">
        {step === 0 && (
          <div>
            <p className="gm-field-label">Date range</p>
            <div className="gm-tabs mb-3">
              {["7d","30d","this-month","ytd","this-season","custom"].map((r) => (
                <button key={r} type="button" className={"gm-tab " + (range === r ? "on" : "")} onClick={() => setRange(r)}>{r.replace("-", " ")}</button>
              ))}
            </div>
            <p className="gm-field-label">Crops</p>
            <div className="gm-an-options">
              {crops.map((c) => (
                <button key={c.id} type="button" className={"gm-checkcard " + (c.selected ? "is-on" : "")} onClick={() => toggleCrop(c.id)}>
                  <strong>{c.label}</strong>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="gm-field-label">Metrics</p>
            <div className="gm-an-check-list">
              {metrics.map((m) => (
                <label key={m.id} className="gm-check-row"><input type="checkbox" checked={m.selected} onChange={() => toggleMetric(m.id)} /> {m.label} <small>{m.group}</small></label>
              ))}
            </div>
            <p className="gm-field-label mt-3">Compare to</p>
            <div className="gm-an-options">
              {compare.map((c) => (
                <button key={c.id} type="button" className={"gm-checkcard " + (c.selected ? "is-on" : "")} onClick={() => pickCompare(c.id)}><strong>{c.label}</strong></button>
              ))}
            </div>
            <p className="gm-field-label mt-3">Chart type</p>
            <div className="gm-tabs mb-0">
              {REPORT_CHART_TYPES.map((ct) => (<button key={ct.id} type="button" className={"gm-tab " + (chart === ct.id ? "on" : "")} onClick={() => setChart(ct.id)}>{ct.label}</button>))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="gm-field-label">Export format</p>
            <div className="gm-an-options">
              <button type="button" className={"gm-checkcard " + (format === "pdf" ? "is-on" : "")} onClick={() => setFormat("pdf")}><strong>PDF</strong><small>Board-ready, formatted</small></button>
              <button type="button" className={"gm-checkcard " + (format === "excel" ? "is-on" : "")} onClick={() => setFormat("excel")}><strong>Excel</strong><small>Formulas and pivot</small></button>
              <button type="button" className={"gm-checkcard " + (format === "csv" ? "is-on" : "")} onClick={() => setFormat("csv")}><strong>CSV</strong><small>Raw data only</small></button>
            </div>
            <AnCallout tone="info">Generating a PDF burns 1 credit. You have 48 free reports remaining this month.</AnCallout>
          </div>
        )}
        {step === 3 && !processing && !done && (
          <div>
            <h4 className="gm-h-section-sm">Review report</h4>
            <AnKv items={[
              { k: "Range", v: range },
              { k: "Crops", v: crops.filter((c) => c.selected).map((c) => c.label).join(", ") },
              { k: "Metrics", v: metrics.filter((m) => m.selected).map((m) => m.label).join(", ") },
              { k: "Comparison", v: compare.find((c) => c.selected)?.label ?? "None" },
              { k: "Chart", v: chart },
              { k: "Format", v: format.toUpperCase() },
            ]} />
            <p className="gm-mk-pay-note">Confirm with M-Pesa OTP <code>123456</code> (KES 0 for CSV, KES 20 for PDF/Excel).</p>
            <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP" />
          </div>
        )}
        {step === 3 && processing && <div className="gm-an-processing"><Loader2 className="spin" /><p>Compiling report…</p></div>}
        {done && (
          <div className="gm-an-success">
            <div className="gm-an-success-mark"><CheckCircle2 /></div>
            <h3>Report ready</h3>
            <p>Your custom report has been generated.</p>
            <p className="gm-an-receipt">Ref: <strong>{code}</strong></p>
          </div>
        )}
      </div>
      {!done && !processing && (
        <WizardActions step={step} last={3} onBack={() => setStep(Math.max(0, step-1))} onNext={() => {
          if (step < 3) setStep(step+1);
          else if (otp === "123456") { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); }, 1200); }
        }} nextDisabled={step === 3 && otp.length < 6} finishLabel="Generate" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 3) Premade report run wizard ================= */
export function RunReportWizard({ open, onClose, report }: { open: boolean; onClose: () => void; report: PremadeReport | null; }) {
  const [step, setStep] = useState(0);
  const [range, setRange] = useState("ytd");
  const [format, setFormat] = useState<"pdf"|"excel"|"csv">("pdf");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  useEffect(() => { if (open) { setStep(0); setDone(false); setProcessing(false); setCode(rc("RPT")); } }, [open]);
  if (!report) return null;
  const steps = ["Range", "Format", "Generate"];
  return (
    <Dialog open={open} onClose={onClose} title={report.name} desc={report.useCase} wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-an-stack mt-3">
        {step === 0 && (
          <div>
            <p className="gm-field-label">Date range</p>
            <div className="gm-tabs mb-0">
              {["ytd","this-season","last-season","custom"].map((r) => (<button key={r} type="button" className={"gm-tab " + (range === r ? "on" : "")} onClick={() => setRange(r)}>{r.replace("-", " ")}</button>))}
            </div>
            <AnCallout tone="info"><strong>Contents:</strong> {report.contents}</AnCallout>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="gm-field-label">Format</p>
            <div className="gm-an-options">
              <button className={"gm-checkcard " + (format === "pdf" ? "is-on" : "")} onClick={() => setFormat("pdf")}><strong>PDF</strong><small>Formatted</small></button>
              <button className={"gm-checkcard " + (format === "excel" ? "is-on" : "")} onClick={() => setFormat("excel")}><strong>Excel</strong><small>Pivot ready</small></button>
              <button className={"gm-checkcard " + (format === "csv" ? "is-on" : "")} onClick={() => setFormat("csv")}><strong>CSV</strong><small>Raw</small></button>
            </div>
          </div>
        )}
        {step === 2 && !processing && !done && (
          <div>
            <AnKv items={[
              { k: "Report", v: report.name }, { k: "Range", v: range }, { k: "Format", v: format.toUpperCase() },
            ]} />
          </div>
        )}
        {processing && <div className="gm-an-processing"><Loader2 className="spin" /><p>Building {report.name.toLowerCase()}…</p></div>}
        {done && (
          <div className="gm-an-success">
            <div className="gm-an-success-mark"><CheckCircle2 /></div>
            <h3>{report.name} ready</h3>
            <p className="gm-an-receipt">Ref: <strong>{code}</strong></p>
            <p>Downloaded as {format.toUpperCase()}.</p>
          </div>
        )}
      </div>
      {!done && !processing && (
        <WizardActions step={step} last={2} onBack={() => setStep(Math.max(0, step-1))} onNext={() => {
          if (step < 2) setStep(step+1);
          else { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); }, 1000); }
        }} finishLabel="Generate" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 4) Worker detail dialog ================= */
export function WorkerDetailDialog({ open, onClose, worker }: { open: boolean; onClose: () => void; worker: Worker | null; }) {
  if (!worker) return null;
  return (
    <Dialog open={open} onClose={onClose} title={worker.name} desc={worker.role} wide>
      <AnKv items={[
        { k: "Phone", v: worker.phone },
        { k: "Tasks completed", v: String(worker.tasks) },
        { k: "Rating", v: worker.rating + " stars" },
        { k: "Days worked", v: String(worker.daysWorked) },
        { k: "Attendance", v: worker.attendancePct + "%" },
        { k: "Total pay YTD", v: kes(worker.totalPay) },
        { k: "Status", v: worker.status },
      ]} columns={2} />
      <h4 className="gm-h-section-sm mt-3">Performance</h4>
      <div className="gm-an-worker-bars">
        <div>
          <div className="d-flex justify-content-between"><small>Tasks</small><small>{worker.tasks}</small></div>
          <div className="gm-progress"><i style={{ width: Math.min(100, (worker.tasks / 25) * 100) + "%" }} /></div>
        </div>
        <div>
          <div className="d-flex justify-content-between"><small>Attendance</small><small>{worker.attendancePct}%</small></div>
          <div className="gm-progress"><i style={{ width: worker.attendancePct + "%" }} /></div>
        </div>
        <div>
          <div className="d-flex justify-content-between"><small>Rating</small><small>{worker.rating}/5</small></div>
          <div className="gm-progress"><i style={{ width: (worker.rating / 5) * 100 + "%" }} /></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3"><button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 5) KPI drilldown dialog ================= */
export function KpiDetailDialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children?: ReactNode; }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc="Drill-down into how this KPI is calculated">
      {children}
      <div className="d-flex gap-2 justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 6) Export analytics dialog ================= */
export function AnalyticsExportDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) setDone(false); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Export all analytics" desc="One bundle for accountant or cooperative">
      {!done ? (
        <div>
          <p className="gm-field-label">Include</p>
          <label className="gm-check-row"><input type="checkbox" defaultChecked /> KPI summary</label>
          <label className="gm-check-row"><input type="checkbox" defaultChecked /> Crop performance</label>
          <label className="gm-check-row"><input type="checkbox" defaultChecked /> Cost breakdown</label>
          <label className="gm-check-row"><input type="checkbox" defaultChecked /> Revenue by month</label>
          <label className="gm-check-row"><input type="checkbox" /> Labour detail</label>
        </div>
      ) : (
        <div className="gm-an-success"><div className="gm-an-success-mark"><CheckCircle2 /></div><h3>Bundle ready</h3><p className="gm-an-receipt"><strong>{rc("BUNDLE")}</strong></p></div>
      )}
      <div className="d-flex gap-2 justify-content-end mt-3">
        {!done ? (<><button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button><button className="gm-btn gm-btn-lime" onClick={() => setDone(true)}><Download /> Generate bundle</button></>) : <button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>}
      </div>
    </Dialog>
  );
}

/* ================= 7) Share report dialog (time-limited code) ================= */
export function AnalyticsShareDialog({ open, onClose, title = "Analytics report" }: { open: boolean; onClose: () => void; title?: string; }) {
  const [days, setDays] = useState(7);
  const [generated, setGenerated] = useState(false);
  useEffect(() => { if (open) setGenerated(false); }, [open]);
  const code = useMemo(() => {
    if (!generated) return "";
    const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let c = "GM-AN-";
    for (let i = 0; i < 8; i++) c += s[Math.floor(Math.random() * s.length)];
    return c;
  }, [generated]);
  const expiry = new Date(Date.now() + days * 86400000).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Dialog open={open} onClose={onClose} title="Share report access" desc={title}>
      {!generated ? (
        <>
          <p className="gm-field-label">Access duration</p>
          <div className="gm-tabs mb-3">
            {[1, 3, 7, 14, 30].map((d) => (<button key={d} type="button" className={"gm-tab " + (days === d ? "on" : "")} onClick={() => setDays(d)}>{d} day{d > 1 ? "s" : ""}</button>))}
          </div>
          <Toggle checked={true} onChange={() => {}} label="Read-only" desc="Recipients can view but not edit" />
        </>
      ) : (
        <div className="gm-an-success">
          <div className="gm-an-receipt-lg"><Lock /><code>{code}</code></div>
          <p>Expires <strong>{expiry}</strong>.</p>
          <div className="gm-an-share-btns">
            <button className="gm-btn gm-btn-outline"><MessageCircle /> WhatsApp</button>
            <button className="gm-btn gm-btn-outline"><Send /> SMS</button>
            <button className="gm-btn gm-btn-outline"><Mail /> Email</button>
          </div>
        </div>
      )}
      <div className="d-flex gap-2 justify-content-end mt-3">
        {!generated ? (<><button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button><button className="gm-btn gm-btn-lime" onClick={() => setGenerated(true)}><Share2 /> Generate link</button></>) : <button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>}
      </div>
    </Dialog>
  );
}

/* ================= 8) Settings dialog ================= */
export function AnalyticsSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [email, setEmail] = useState(true);
  const [digest, setDigest] = useState(true);
  const [coop, setCoop] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Analytics settings" desc="Digests, sharing, defaults">
      <Toggle checked={email} onChange={setEmail} label="Email reports" desc="Send to mary@growmo.app" />
      <div className="mt-2"><Toggle checked={digest} onChange={setDigest} label="Weekly digest" desc="Monday 7am summary" /></div>
      <div className="mt-2"><Toggle checked={coop} onChange={setCoop} label="Share with Kiambu Farmers Coop" desc="Anonymous aggregated data only" /></div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button className="gm-btn gm-btn-lime" onClick={onClose}>Save</button>
      </div>
    </Dialog>
  );
}

/* ================= 9) FAQ dialog ================= */
export function AnalyticsFaqDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [oq, setOq] = useState<number | null>(0);
  return (
    <Dialog open={open} onClose={onClose} title="Analytics FAQ & glossary" desc="How metrics and reports work" wide>
      <div className="gm-an-faq">
        {AN_FAQ.map((f, i) => (
          <div key={i} className={"gm-an-faq-row " + (oq === i ? "is-on" : "")}>
            <button type="button" onClick={() => setOq(oq === i ? null : i)}><strong>Q:</strong> {f.q}</button>
            {oq === i ? <p><strong>A:</strong> {f.a}</p> : null}
          </div>
        ))}
      </div>
      <h4 className="gm-h-section-sm mt-3">Glossary</h4>
      <div className="gm-an-glossary">
        {AN_GLOSSARY.map((g) => (<div key={g.term} className="gm-an-glossary-row"><strong>{g.term}</strong><span>{g.def}</span></div>))}
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 10) Score breakdown ================= */
export function AnalyticsScoreDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const comp = [
    { k: "Profitability", v: 88 }, { k: "Yield", v: 82 }, { k: "Cost control", v: 74 },
    { k: "Record accuracy", v: 95 }, { k: "Labour efficiency", v: 80 }, { k: "Market access", v: 70 },
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Farm grade A · 82/100" desc="What drives your analytics score">
      <div className="gm-an-score-break">
        {comp.map((c) => (
          <div key={c.k}>
            <div className="d-flex justify-content-between"><strong>{c.k}</strong><span>{c.v}/100</span></div>
            <div className="gm-progress"><i style={{ width: c.v + "%" }} /></div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 11) Loan report preview dialog ================= */
export function LoanPreviewDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} title="Loan Application Report preview" desc="What the bank will see" wide>
      <AnCallout tone="good">This report contains everything Equity / Co-op Bank ask for in a smallholder agri-loan application.</AnCallout>
      <AnKv columns={2} items={[
        { k: "Farm", v: "Mary's Farm, Githunguri" },
        { k: "Acreage", v: "2.5 acres" },
        { k: "YTD revenue", v: kes(580000) },
        { k: "Net profit YTD", v: kes(370000) },
        { k: "ROI", v: "176%" },
        { k: "Seasons tracked", v: "3" },
        { k: "Active buyers", v: "10 verified" },
        { k: "Soil test", v: "KAL-2026-4471 (Sep 2026)" },
      ]} />
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button className="gm-btn gm-btn-lime" onClick={() => { csvDownload("loan-report-preview.csv", [["Field", "Value"], ["Farm", "Mary's Farm"], ["Acreage", "2.5"], ["Revenue", 580000], ["Profit", 370000], ["ROI", "176%"]]); }}><Download /> Download</button>
      </div>
    </Dialog>
  );
}

/* ================= 12) Crop comparison dialog ================= */
export function CropCompareDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} title="Crop comparison" desc="Across yield, cost, revenue and ROI" wide>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Crop</th><th>Yield/ac</th><th>Cost/ac</th><th>Revenue/ac</th><th>Profit/ac</th><th>ROI</th><th>Rank</th></tr></thead>
          <tbody>
            {[
              ["Cabbage", "29,000 heads", 139600, 870000, 730400, "523%", 1],
              ["Tomato", "20 tonnes", 150000, 800000, 650000, "433%", 2],
              ["Kale", "4,000 bundles", 28000, 96000, 68000, "243%", 3],
              ["Potato", "60 bags", 22000, 42000, 20000, "91%", 4],
              ["Maize", "18 bags", 40000, 63000, 23000, "58%", 5],
            ].map((r, i) => (
              <tr key={i}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{kes(r[2] as number)}</td><td>{kes(r[3] as number)}</td><td>{kes(r[4] as number)}</td><td><strong>{r[5]}</strong></td><td>#{r[6]}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 13) Confirm dialog ================= */
export function ConfirmAnalyticsDialog({ open, onClose, title, desc, onConfirm }: { open: boolean; onClose: () => void; title: string; desc: string; onConfirm: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={desc}>
      <div className="d-flex gap-2 justify-content-end">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button className="gm-btn gm-btn-lime" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
      </div>
    </Dialog>
  );
}

/* Helper: PREMADE_REPORTS export for route */
export { PREMADE_REPORTS };
