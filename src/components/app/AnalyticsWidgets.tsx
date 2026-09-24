/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING (/app/analytics) widgets
   ========================================================================== */
import { Award, CalendarRange, ChevronRight, Download, FileBarChart2, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { CostCategory, CropPerf, PremadeReport, RevenueMonth, Worker } from "../../data/app/analytics";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

/* ---------- Hero ---------- */
export function AnalyticsHero({ score, profit, reports, children }: { score: number; profit: number; reports: number; children?: ReactNode; }) {
  return (
    <div className="gm-an-hero">
      <div className="gm-an-hero-head">
        <div className="gm-an-hero-copy">
          <span className="gm-chip gm-chip-live"><span className="gm-dot-live" /> Live · synced 09:14</span>
          <h1 className="font-display">Analytics &amp; Reporting</h1>
          <p className="gm-lead mb-0">
            Every shilling you spend and earn, rolled up into KPIs, comparisons against Kiambu county peers, and one-click
            reports for your bank, your cooperative or your own season review.
          </p>
        </div>
        <div className="gm-an-hero-score">
          <div className="gm-an-hero-score-num"><strong>{score}</strong><small>/100</small></div>
          <div className="gm-an-hero-score-label"><strong>Farm grade A</strong><small>Top 12% in Kiambu</small><span className="gm-an-score-link">See breakdown →</span></div>
        </div>
      </div>
      <div className="gm-an-hero-grid">
        <div className="gm-stat">
          <span className="gm-mega-icon"><TrendingUp /></span>
          <strong className="gm-stat-value font-display">{kes(profit)}</strong>
          <span className="gm-stat-label">Net profit YTD</span>
          <small>+65% vs last season · +55% vs county</small>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon"><Award /></span>
          <strong className="gm-stat-value font-display">176%</strong>
          <span className="gm-stat-label">Overall ROI</span>
          <small>+30 pp vs last season</small>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon"><FileBarChart2 /></span>
          <strong className="gm-stat-value font-display">{reports}</strong>
          <span className="gm-stat-label">Reports generated</span>
          <small>12 shared externally</small>
        </div>
        <div className="gm-stat">
          <span className="gm-mega-icon"><CalendarRange /></span>
          <strong className="gm-stat-value font-display">5</strong>
          <span className="gm-stat-label">Crops tracked</span>
          <small>2.5 acres · 3 seasons</small>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ---------- KPI delta chip ---------- */
export function DeltaChip({ dir, text }: { dir: "up" | "down" | "flat"; text: string }) {
  return (
    <span className={`gm-an-delta gm-an-delta-${dir}`}>
      {dir === "up" ? <TrendingUp width={12} height={12} /> : dir === "down" ? <TrendingDown width={12} height={12} /> : "↔"}
      {text}
    </span>
  );
}

/* ---------- KPI tile ---------- */
export function AnKpiCard({ k }: { k: { kpi: string; value: string; icon: string; vsLast: string; vsLastDir: "up"|"down"|"flat"; vsCounty: string; vsCountyDir: "up"|"down"|"flat"; } }) {
  return (
    <div className="gm-an-kpi">
      <div className="gm-an-kpi-icon">{k.icon}</div>
      <strong>{k.value}</strong>
      <span className="gm-an-kpi-label">{k.kpi}</span>
      <div className="gm-an-kpi-deltas">
        <DeltaChip dir={k.vsLastDir} text={k.vsLast + " vs last"} />
        {k.vsCounty !== "—" ? <DeltaChip dir={k.vsCountyDir} text={k.vsCounty + " vs county"} /> : null}
      </div>
    </div>
  );
}

/* ---------- Crop performance bar ---------- */
export function CropBar({ crop, max }: { crop: CropPerf; max: number; }) {
  const w = (crop.revenuePerAcre / max) * 100;
  return (
    <div className="gm-an-crop-bar-row">
      <div className="gm-an-crop-bar-head">
        <span className="gm-an-crop-emo">{crop.emoji}</span>
        <strong>{crop.crop}</strong>
        <small>{crop.variety} · {crop.acres} ac</small>
        <span className="gm-an-crop-rank">#{crop.rank}</span>
      </div>
      <div className="gm-an-crop-bar-track">
        <div className="gm-an-crop-bar-fill" style={{ width: w + "%", background: crop.color }}>
          <span>{kes(crop.revenuePerAcre)}/ac</span>
        </div>
      </div>
      <div className="gm-an-crop-bar-meta">
        <span>Cost {kes(crop.costPerAcre)}/ac</span>
        <span>Profit {kes(crop.profitPerAcre)}/ac</span>
        <span className="gm-an-roi">ROI {crop.roi}%</span>
      </div>
    </div>
  );
}

/* ---------- Cost row ---------- */
export function CostRow({ c, max }: { c: CostCategory; max: number; }) {
  return (
    <div className="gm-an-cost-row">
      <div className="gm-an-cost-head">
        <span className="gm-an-cost-ico">{c.icon}</span>
        <strong>{c.category}</strong>
        <span className="gm-an-cost-pct">{c.pct}%</span>
        <StatusChip label={c.vsBudget} tone={c.tone === "good" ? "high" : c.tone === "bad" ? "low" : "medium"} />
      </div>
      <div className="gm-an-cost-bar">
        <div className="gm-an-cost-fill" style={{ width: (c.amount / max) * 100 + "%" }} />
        <small>{kes(c.amount)}</small>
      </div>
    </div>
  );
}

/* ---------- Revenue month bar ---------- */
export function RevenueBar({ m, max }: { m: RevenueMonth; max: number; }) {
  const h = (m.total / max) * 100;
  const th = (m.target / max) * 100;
  return (
    <div className="gm-an-rev-col">
      <div className="gm-an-rev-track">
        <div className="gm-an-rev-target" style={{ height: th + "%" }} />
        <div className={`gm-an-rev-fill ${m.hit ? "is-hit" : "is-miss"}`} style={{ height: h + "%" }}>
          <span className="gm-an-rev-tip">{m.monthShort} · {kes(m.total)} {m.hit ? "✓" : "✗"}</span>
        </div>
      </div>
      <small>{m.monthShort}</small>
    </div>
  );
}

/* ---------- Worker row ---------- */
export function WorkerRow({ w, onOpen }: { w: Worker; onOpen: (w: Worker) => void; }) {
  return (
    <tr className="gm-an-worker-row" onClick={() => onOpen(w)}>
      <td>
        <div className="gm-an-w-ava">{w.name.charAt(0)}</div>
      </td>
      <td><strong>{w.name}</strong><small>{w.role}</small></td>
      <td>{w.tasks}</td>
      <td><span className="gm-an-rating">{"★".repeat(Math.round(w.rating))}<small style={{ opacity: 0.3 }}>{"★".repeat(5 - Math.round(w.rating))}</small> {w.rating}</span></td>
      <td>{w.daysWorked}d ({w.attendancePct}%)</td>
      <td><strong>{kes(w.totalPay)}</strong></td>
      <td><StatusChip label={w.status} tone={w.status === "Active" ? "high" : w.status === "On leave" ? "medium" : "neutral"} /></td>
      <td><button className="gm-icon-btn" onClick={(e) => { e.stopPropagation(); onOpen(w); }}><ChevronRight /></button></td>
    </tr>
  );
}

/* ---------- Weather impact row ---------- */
export function WeatherRow({ w }: { w: any }) {
  return (
    <div className={`gm-an-wx-row tone-${w.tone}`}>
      <div>
        <strong>{w.season} · {w.crop}</strong>
        <small>{w.rainfallActual} vs normal {w.rainfallNormal} ({w.deviationPct > 0 ? "+" : ""}{w.deviationPct}%)</small>
      </div>
      <div className="gm-an-wx-impact">
        <span className={w.yieldImpactPct > 0 ? "up" : "down"}>{w.yieldImpactPct > 0 ? "+" : ""}{w.yieldImpactPct}% yield</span>
        <small>{w.notes}</small>
      </div>
    </div>
  );
}

/* ---------- Premade report card ---------- */
export function ReportCard({ r, onRun, onShare, onDownload }: { r: PremadeReport; onRun: (r: PremadeReport) => void; onShare: (r: PremadeReport) => void; onDownload: (r: PremadeReport) => void; }) {
  return (
    <div className="gm-an-report">
      <div className="gm-an-report-icon" style={{ background: r.color }}>{r.icon}</div>
      <div className="gm-an-report-body">
        <strong>{r.name}</strong>
        <small>{r.contents}</small>
        <small className="gm-an-report-use">{r.useCase}</small>
        {r.lastRun ? <small className="gm-an-report-last">Last run {r.lastRun}</small> : null}
      </div>
      <div className="gm-an-report-foot">
        <button className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onRun(r)}><FileBarChart2 width={14} height={14} /> Run</button>
        <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onDownload(r)}><Download width={14} height={14} /></button>
        <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onShare(r)}>Share</button>
      </div>
    </div>
  );
}

/* ---------- KV list ---------- */
export function AnKv({ items, columns = 1 }: { items: { k: string; v: ReactNode }[]; columns?: 1 | 2; }) {
  return (
    <div className={`gm-an-kv ${columns === 2 ? "is-2" : ""}`}>
      {items.map((it) => (
        <div key={it.k} className="gm-an-kv-row"><span className="gm-an-kv-k">{it.k}</span><span className="gm-an-kv-v">{it.v}</span></div>
      ))}
    </div>
  );
}

export function AnCallout({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: ReactNode }) {
  return <div className={`gm-an-callout tone-${tone}`}>{children}</div>;
}
