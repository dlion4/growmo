/* ============================================================================
   PAGE 10 — MARKET & SALES (/app/market)  — dialogs / wizards / drawers
   ========================================================================== */
import { CheckCircle2, ChevronRight, Download, Loader2, Lock, MapPin, MessageCircle, Phone, Printer, Send, Share2, ShieldCheck, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Buyer, Contract, CropPriceRow, MarketRecommendation, SaleRecord, SalesScenario, TrendPoint } from "../../data/app/market";
import { MARKET_FAQ, MARKETS, MARKET_GLOSSARY, TRANSPORT_OPTIONS } from "../../data/app/market";
import { kes } from "../../data/site";
import { Dialog, OtpInput, Stepper, Toggle } from "../auth/controls";
import { WizardActions, StatusChip } from "./DashboardWidgets";
import { MarketCallout, MarketKv } from "./MarketWidgets";

function rc(prefix = "QK") {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = prefix;
  for (let i = 0; i < 7; i++) out += s[Math.floor(Math.random() * s.length)];
  return out;
}

function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => "\"" + String(c ?? "").replaceAll('"', '""') + "\"").join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ================= Confirm dialog ================= */
export function ConfirmMarketDialog({ open, onClose, title, desc, confirmLabel, onConfirm, danger }: { open: boolean; onClose: () => void; title: string; desc: string; confirmLabel?: string; onConfirm: () => void; danger?: boolean; }) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={desc}>
      <div className="d-flex gap-2 justify-content-end">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button type="button" className={"gm-btn " + (danger ? "gm-btn-danger-soft" : "gm-btn-lime")} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel ?? "Confirm"}</button>
      </div>
    </Dialog>
  );
}

/* ================= 1) Crop price detail ================= */
export function CropPriceDialog({ open, onClose, crop, onSetAlert, onTrend }: { open: boolean; onClose: () => void; crop: CropPriceRow | null; onSetAlert: (c: CropPriceRow) => void; onTrend: (c: CropPriceRow) => void; }) {
  if (!crop) return null;
  const c = crop;
  const all = MARKETS.map((m) => {
    const pair = c.prices[m.market] ?? [0, 0];
    const lo = pair[0]; const hi = pair[1];
    const mid = (lo + hi) / 2;
    const feeCut = Math.round(mid * m.marketFeePct) / 100;
    const net = Math.round(mid - m.transportPerHead - feeCut);
    return { ...m, lo, hi, net };
  }).sort((a, b) => b.net - a.net);
  function doExport() {
    const rows: (string | number)[][] = [["Market", "Distance", "Low", "High", "Transport/unit", "Net/unit", "Reliability"]];
    for (const m of all) rows.push([m.market, m.distance, m.lo, m.hi, m.transportPerHead, m.net, m.reliability]);
    csvDownload(c.crop.toLowerCase() + "-prices.csv", rows);
  }
  return (
    <Dialog open={open} onClose={onClose} title={c.icon + " " + c.crop + " — current prices"} desc={c.swahili + " · per " + c.unit + " · live 09:14"} wide>
      <div className="gm-mk-kv is-2">
        <div className="gm-mk-kv-row"><span className="gm-mk-kv-k">7-day high</span><span className="gm-mk-kv-v">{crop.weekHigh.toLocaleString("en-KE")} KES</span></div>
        <div className="gm-mk-kv-row"><span className="gm-mk-kv-k">7-day low</span><span className="gm-mk-kv-v">{crop.weekLow.toLocaleString("en-KE")} KES</span></div>
        <div className="gm-mk-kv-row"><span className="gm-mk-kv-k">Trend</span><span className="gm-mk-kv-v">{crop.trend === "up" ? "Up" : crop.trend === "down" ? "Down" : "Stable"} {crop.changePct > 0 ? "+" : ""}{crop.changePct}%</span></div>
        <div className="gm-mk-kv-row"><span className="gm-mk-kv-k">Unit</span><span className="gm-mk-kv-v">Per {crop.unit}</span></div>
      </div>
      <MarketCallout tone="info">Tip: {crop.tip}</MarketCallout>
      <h4 className="gm-h-section-sm mt-3">Net price after transport + cess</h4>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Market</th><th>Distance</th><th>Range</th><th>Transport</th><th>Net</th><th>Reliability</th></tr></thead>
          <tbody>
            {all.map((m) => (
              <tr key={m.market}><td><strong>{m.market}</strong></td><td>{m.distance} km</td><td>{m.lo.toLocaleString("en-KE")}–{m.hi.toLocaleString("en-KE")}</td><td>{kes(m.transportPerHead)}</td><td><strong className="up">{kes(m.net)}</strong></td><td>{m.reliability} stars</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex gap-2 mt-3 justify-content-end flex-wrap">
        <button type="button" className="gm-btn gm-btn-outline" onClick={() => { onSetAlert(c); onClose(); }}>Set price alert</button>
        <button type="button" className="gm-btn gm-btn-outline" onClick={() => onTrend(c)}>View trends</button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={doExport}><Download /> Export CSV</button>
      </div>
    </Dialog>
  );
}

/* ================= 2) Trend point detail ================= */
export function TrendPointDialog({ open, onClose, point }: { open: boolean; onClose: () => void; point: TrendPoint | null; }) {
  if (!point) return null;
  return (
    <Dialog open={open} onClose={onClose} title={point.month + " · KES " + point.price + "/head"} desc="Cabbage at Marikiti — 12 month view">
      <MarketKv items={[
        { k: "This year", v: "KES " + point.price },
        { k: "Year ago", v: point.yearAgo ? "KES " + point.yearAgo : "—" },
        { k: "Seasonal avg", v: point.seasonalAvg ? "KES " + point.seasonalAvg : "—" },
        { k: "Note", v: point.note ?? "—" },
      ]} />
      <div className="d-flex gap-2 justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 3) Trend viewer dialog ================= */
export function TrendDialog({ open, onClose, crop }: { open: boolean; onClose: () => void; crop: CropPriceRow | null; }) {
  const [range, setRange] = useState<"7d" | "30d" | "12m" | "yoy" | "seasonal">("12m");
  const [point, setPoint] = useState<TrendPoint | null>(null);
  useEffect(() => { if (open) { setRange("12m"); setPoint(null); } }, [open]);
  if (!crop) return null;
  const c = crop;
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthShorts = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const counts: Record<string, number> = { "7d": 7, "30d": 30, "12m": 12, yoy: 12, seasonal: 12 };
  const pair = c.prices["Nairobi (Marikiti)"];
  const pts: TrendPoint[] = Array.from({ length: counts[range] }).map((_, i) => ({
    month: (range === "12m" || range === "yoy" || range === "seasonal") ? monthNames[i] : "Day " + (i + 1),
    monthShort: (range === "12m" || range === "yoy" || range === "seasonal") ? monthShorts[i] : String(i + 1),
    price: Math.round(pair[0] + Math.random() * (pair[1] - pair[0])),
    yearAgo: Math.round(pair[0] * 0.9 + Math.random() * 3),
  }));
  function doExport() {
    const rows: (string | number)[][] = [["period", "price", "yearAgo"]];
    for (const p of pts) rows.push([p.month, p.price, p.yearAgo ?? ""]);
    csvDownload(c.crop.toLowerCase() + "-trend-" + range + ".csv", rows);
  }
  return (
    <Dialog open={open} onClose={onClose} title={c.icon + " " + c.crop + " price trend"} desc={"Marikiti · last " + range} wide>
      <div className="gm-tabs mb-3">
        {(["7d", "30d", "12m", "yoy", "seasonal"] as const).map((r) => (
          <button key={r} type="button" className={"gm-tab " + (range === r ? "on" : "")} onClick={() => setRange(r)}>{r.toUpperCase()}</button>
        ))}
      </div>
      <div className="gm-mk-chart is-lg">
        <div className="gm-mk-chart-body" style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem", height: "220px", padding: "0.5rem" }}>
          {pts.map((p, i) => {
            const h = ((p.price - 15) / Math.max(1, c.weekHigh - 15)) * 100;
            return (
              <button key={i} type="button" className="gm-mk-chart-bar" onClick={() => setPoint(p)} style={{ height: Math.max(6, h) + "%" }}>
                <span className="gm-mk-chart-tip">{p.month} · KES {p.price}</span>
              </button>
            );
          })}
        </div>
      </div>
      <MarketCallout tone="info">
        <strong>Insight.</strong> Cabbage prices peak Jan–Feb (dry season, low supply) and dip Jun–Aug. Planting Oct–Nov positions you for the January peak.
      </MarketCallout>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={doExport}><Download /> Export CSV</button>
      </div>
      <TrendPointDialog open={!!point} onClose={() => setPoint(null)} point={point} />
    </Dialog>
  );
}

/* ================= 4) Price alert wizard ================= */
export function PriceAlertWizard({ open, onClose, crop }: { open: boolean; onClose: () => void; crop: CropPriceRow | null; }) {
  const [step, setStep] = useState(0);
  const [market, setMarket] = useState(MARKETS[0].market);
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState(0);
  const [sms, setSms] = useState(true);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (open && crop) { setStep(0); setDone(false); setThreshold(Math.round(crop.prices[MARKETS[0].market][1] * 1.05)); }
  }, [open, crop]);
  if (!crop) return null;
  const steps = ["Crop & market", "Threshold", "Channel", "Confirm"];
  return (
    <Dialog open={open} onClose={onClose} title={"Price alert — " + crop.crop} desc="We notify you the moment your price hits." wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-mk-stack mt-3">
        {step === 0 && (
          <div>
            <p className="gm-field-label">Select market to monitor</p>
            <div className="gm-mk-options">
              {MARKETS.map((m) => (
                <button key={m.market} type="button" className={"gm-checkcard " + (market === m.market ? "is-on" : "")} onClick={() => setMarket(m.market)}>
                  <strong>{m.marketShort}</strong><small>{m.distance} km</small>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="gm-field-label">Alert me when price is</p>
            <div className="gm-tabs mb-3">
              <button type="button" className={"gm-tab " + (direction === "above" ? "on" : "")} onClick={() => setDirection("above")}>Above</button>
              <button type="button" className={"gm-tab " + (direction === "below" ? "on" : "")} onClick={() => setDirection("below")}>Below</button>
            </div>
            <div className="gm-field"><label>Threshold (KES per {crop.unit})</label><input type="number" className="gm-input" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></div>
            <small className="gm-mk-help">Current range at {market}: {crop.prices[market]?.[0].toLocaleString("en-KE")}–{crop.prices[market]?.[1].toLocaleString("en-KE")} KES</small>
          </div>
        )}
        {step === 2 && (
          <div>
            <Toggle checked={sms} onChange={setSms} label="SMS alert to 0712 345 678" desc="Standard carrier rates apply" />
            <div className="mt-2"><Toggle checked={true} onChange={() => {}} label="In-app notification" desc="Always on when app is open" /></div>
          </div>
        )}
        {step === 3 && !done && (
          <div>
            <h4 className="gm-h-section-sm">Review alert</h4>
            <MarketKv items={[
              { k: "Crop", v: crop.crop },
              { k: "Market", v: market },
              { k: "Threshold", v: direction + " " + threshold.toLocaleString("en-KE") + " KES" },
              { k: "Channel", v: sms ? "SMS + in-app" : "In-app only" },
            ]} />
            <MarketCallout tone="good">You have 4 active alerts; this makes 5.</MarketCallout>
          </div>
        )}
        {done && (
          <div className="gm-mk-success">
            <div className="gm-mk-success-mark"><CheckCircle2 /></div>
            <h3>Alert set</h3>
            <p>We will SMS you the moment {crop.crop} at {market} goes {direction} {threshold.toLocaleString("en-KE")} KES.</p>
            <p className="gm-mk-receipt">Alert code: <strong>{rc("AL")}</strong></p>
          </div>
        )}
      </div>
      {!done && <WizardActions step={step} last={steps.length - 1} onBack={() => setStep(Math.max(0, step - 1))} onNext={() => { if (step < steps.length - 1) setStep(step + 1); else setDone(true); }} finishLabel="Activate alert" />}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 5) Recommendation detail ================= */
export function RecommendationDetailDialog({ open, onClose, rec, onPlan }: { open: boolean; onClose: () => void; rec: MarketRecommendation | null; onPlan: (r: MarketRecommendation) => void; }) {
  if (!rec) return null;
  const qty = 14500;
  return (
    <Dialog open={open} onClose={onClose} title={rec.market + " — Cabbage"} desc={rec.distanceKm + " km · net " + kes(rec.netPricePerHead) + "/head"} wide>
      <div className="gm-mk-dlg-grid">
        <MarketKv items={[
          { k: "Distance", v: rec.distanceKm + " km" },
          { k: "Price/head", v: kes(rec.pricePerHead) },
          { k: "Transport/head", v: kes(rec.transportPerHead) },
          { k: "Cess/head", v: kes(rec.feePerHead) },
          { k: "Net/head", v: <strong className="up">{kes(rec.netPricePerHead)}</strong> },
          { k: "Volume capacity", v: rec.volumeScore + "/10" },
          { k: "Reliability", v: rec.reliabilityScore + " stars" },
        ]} />
        <div>
          <h4 className="gm-h-section-sm">Verdict</h4>
          <p>{rec.note}</p>
          <h4 className="gm-h-section-sm">For 14,500 heads</h4>
          <MarketKv items={[
            { k: "Gross", v: kes(rec.pricePerHead * qty) },
            { k: "Transport", v: "– " + kes(rec.transportPerHead * qty) },
            { k: "Market fees", v: "– " + kes(rec.feePerHead * qty) },
            { k: "Net revenue", v: <strong>{kes(Math.round(rec.netPricePerHead * qty))}</strong>, tone: "good" },
          ]} />
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button className="gm-btn gm-btn-lime" onClick={() => onPlan(rec)}>Build harvest plan <ChevronRight /></button>
      </div>
    </Dialog>
  );
}

/* ================= 6) Buyer detail ================= */
export function BuyerDetailDialog({ open, onClose, buyer, onContact, onRecordSale }: { open: boolean; onClose: () => void; buyer: Buyer | null; onContact: (b: Buyer) => void; onRecordSale: (b: Buyer) => void; }) {
  if (!buyer) return null;
  return (
    <Dialog open={open} onClose={onClose} title={buyer.name} desc={buyer.type + " · " + buyer.location} wide>
      <div className="gm-mk-buyer-lg">
        <div className="gm-mk-buyer-rating-lg">
          <strong>{buyer.rating}</strong><small>/5</small>
          <div className="d-flex">{[1,2,3,4,5].map((i) => <Star key={i} width={16} height={16} fill="currentColor" style={{ opacity: i <= buyer.rating ? 1 : 0.2 }} />)}</div>
          <small>{buyer.reviewsCount} reviews · {buyer.verified ? "Verified" : "Unverified"}</small>
        </div>
        <div>
          <MarketKv items={[
            { k: "Crops wanted", v: buyer.cropsWanted.join(", ") },
            { k: "Min quantity", v: buyer.minQuantity },
            { k: "Payment terms", v: buyer.paymentTerms },
            { k: "Contact person", v: buyer.contact },
            { k: "Phone", v: buyer.phone },
            { k: "Email", v: buyer.email ?? "—" },
            { k: "County", v: buyer.county },
          ]} />
          <MarketCallout tone="info">Note: {buyer.notes}</MarketCallout>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3 flex-wrap">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button className="gm-btn gm-btn-outline" onClick={() => onContact(buyer)}><Phone /> Contact buyer</button>
        <button className="gm-btn gm-btn-lime" onClick={() => onRecordSale(buyer)}><ChevronRight /> Record sale</button>
      </div>
    </Dialog>
  );
}

/* ================= 7) Contact buyer wizard ================= */
export function ContactBuyerDialog({ open, onClose, buyer }: { open: boolean; onClose: () => void; buyer: Buyer | null; }) {
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<"whatsapp"|"sms"|"call"|"email">("whatsapp");
  const [msg, setMsg] = useState("");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState("");
  useEffect(() => {
    if (open && buyer) { setStep(0); setDone(false); setOtp(""); setProcessing(false); setMsg("Hello " + buyer.contact + ", this is Mary from Githunguri. I will have " + buyer.cropsWanted[0] + " ready next week. Can we discuss?"); setReceipt(rc("MSG")); }
  }, [open, buyer]);
  if (!buyer) return null;
  const steps = ["Channel", "Message", "Verify", "Sent"];
  return (
    <Dialog open={open} onClose={onClose} title={"Contact " + buyer.name} desc={buyer.phone} wide>
      <Stepper steps={steps.slice(0,3)} current={Math.min(step, 2)} />
      <div className="gm-mk-stack mt-3">
        {step === 0 && (
          <div className="gm-mk-options">
            {[
              { id: "whatsapp", label: "WhatsApp", icon: "WhatsApp", sub: "Fastest response" },
              { id: "sms", label: "SMS", icon: "SMS", sub: "No data needed" },
              { id: "call", label: "Call", icon: "Call", sub: "Immediate" },
              { id: "email", label: "Email", icon: "Email", sub: buyer.email ?? "No email" },
            ].filter((o) => o.id !== "email" || buyer.email).map((o) => (
              <button key={o.id} type="button" className={"gm-checkcard " + (channel === o.id ? "is-on" : "")} onClick={() => setChannel(o.id as any)}>
                <strong>{o.label}</strong><small>{o.sub}</small>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="gm-field-label">Your message</p>
            <textarea className="gm-input" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
            <small className="gm-mk-help">Message sent from 0712 345 678.</small>
          </div>
        )}
        {step === 2 && !processing && !done && (
          <div>
            <p className="gm-mk-pay-note">Confirm M-Pesa SMS bundle charge of <strong>KES 2</strong> to send. Demo OTP: <code>123456</code>.</p>
            <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP" />
          </div>
        )}
        {step === 2 && processing && <div className="gm-mk-processing"><Loader2 className="spin" /><p>Sending…</p></div>}
        {done && (
          <div className="gm-mk-success">
            <div className="gm-mk-success-mark"><CheckCircle2 /></div>
            <h3>Message sent</h3>
            <p>{buyer.contact} will receive your {channel} shortly.</p>
            <p className="gm-mk-receipt">Reference: <strong>{receipt}</strong></p>
          </div>
        )}
      </div>
      {!done && !processing && (
        <WizardActions step={step} last={2} onBack={() => setStep(Math.max(0, step-1))} onNext={() => {
          if (step < 2) setStep(step + 1);
          else if (otp === "123456") { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); }, 900); }
        }} nextDisabled={step === 2 && otp.length < 6} finishLabel="Send" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 8) Scenario detail ================= */
export function ScenarioDetailDialog({ open, onClose, scenario, onActivate }: { open: boolean; onClose: () => void; scenario: SalesScenario | null; onActivate: (s: SalesScenario) => void; }) {
  if (!scenario) return null;
  const s = scenario;
  const qty = s.quantity;
  function doExport() {
    csvDownload("scenario-" + s.id + ".csv", [
      ["Metric", "Value"],
      ["Scenario", s.label],
      ["Quantity", qty],
      ["Price per head", s.pricePerHead],
      ["Gross", s.grossRevenue],
      ["Transport", s.transport],
      ["Market fees", s.marketFees],
      ["Net revenue", s.netRevenue],
      ["vs baseline", s.vsBaseline],
    ]);
  }
  return (
    <Dialog open={open} onClose={onClose} title={s.label} desc={s.swahili} wide>
      <div className="gm-mk-dlg-grid">
        <div>
          <h4 className="gm-h-section-sm">Per-head economics</h4>
          <MarketKv items={[
            { k: "Sale price", v: kes(s.pricePerHead) },
            { k: "Transport", v: "– " + kes(Math.round((s.transport / qty) * 100) / 100) },
            { k: "Market fees", v: "– " + kes(Math.round((s.marketFees / qty) * 100) / 100) },
            { k: "Net per head", v: <strong className="up">{kes(Math.round((s.netRevenue / qty) * 100) / 100)}</strong> },
          ]} />
        </div>
        <div>
          <h4 className="gm-h-section-sm">Totals for {qty.toLocaleString("en-KE")} heads</h4>
          <MarketKv items={[
            { k: "Gross revenue", v: kes(s.grossRevenue) },
            { k: "Transport", v: "– " + kes(s.transport) },
            { k: "Market fees", v: "– " + kes(s.marketFees) },
            { k: "Net revenue", v: <strong>{kes(s.netRevenue)}</strong>, tone: "good" },
            { k: "vs sell-all-Marikiti baseline", v: (s.vsBaseline > 0 ? "+" : "") + kes(s.vsBaseline), tone: s.vsBaseline >= 0 ? "good" : "warn" },
          ]} />
        </div>
      </div>
      <MarketCallout tone={s.aiPick ? "good" : s.risk === "high" ? "warn" : "info"}>{s.note}</MarketCallout>
      <div className="d-flex gap-2 justify-content-end mt-3 flex-wrap">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        <button className="gm-btn gm-btn-outline" onClick={doExport}><Download /> Export CSV</button>
        {s.aiPick ? <button className="gm-btn gm-btn-lime" onClick={() => onActivate(s)}>Activate this plan <ChevronRight /></button> : null}
      </div>
    </Dialog>
  );
}

/* ================= 9) Activate plan wizard ================= */
export function ActivatePlanWizard({ open, onClose, scenario }: { open: boolean; onClose: () => void; scenario: SalesScenario | null; }) {
  const [step, setStep] = useState(0);
  const [transport, setTransport] = useState(TRANSPORT_OPTIONS[2].id);
  const [date, setDate] = useState("2027-01-29");
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setStep(0); setDone(false); setOtp(""); setProcessing(false); } }, [open]);
  if (!scenario) return null;
  const steps = ["Transport", "Date", "Pay deposit", "Confirm"];
  const selT = TRANSPORT_OPTIONS.find((t) => t.id === transport) ?? TRANSPORT_OPTIONS[0];
  return (
    <Dialog open={open} onClose={onClose} title={"Activate plan — " + scenario.label} desc="Lock in harvest plan and transport" wide>
      <Stepper steps={steps} current={Math.min(step, 3)} />
      <div className="gm-mk-stack mt-3">
        {step === 0 && (
          <div className="gm-mk-options">
            {TRANSPORT_OPTIONS.map((t) => (
              <button key={t.id} type="button" className={"gm-checkcard " + (transport === t.id ? "is-on" : "")} onClick={() => setTransport(t.id)}>
                <strong>{t.mode}</strong><small>{kes(t.costPerKm)}/km · {t.leadTime}</small><small>{t.note}</small>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="gm-field"><label>Harvest date</label><input type="date" className="gm-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <MarketCallout tone="info">AI recommends harvesting 29 Jan 2027 (peak). Storage KES 8,000 is factored in.</MarketCallout>
          </div>
        )}
        {step === 2 && !processing && !done && (
          <div>
            <h4 className="gm-h-section-sm">Pay transport deposit (KES 5,000)</h4>
            <p>Deposit to {selT.mode} via M-Pesa. Demo OTP: <code>123456</code>.</p>
            <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP" />
          </div>
        )}
        {step === 3 && !done && !processing && (
          <div>
            <h4 className="gm-h-section-sm">Confirm booking</h4>
            <MarketKv items={[
              { k: "Scenario", v: scenario.label },
              { k: "Transport", v: selT.mode },
              { k: "Date", v: date },
              { k: "Deposit", v: kes(5000) },
            ]} />
            <MarketCallout tone="good">You will receive an SMS confirmation with the driver's plate number by 4:30 AM on harvest day.</MarketCallout>
          </div>
        )}
        {processing && <div className="gm-mk-processing"><Loader2 className="spin" /><p>Booking transport…</p></div>}
        {done && (
          <div className="gm-mk-success">
            <div className="gm-mk-success-mark"><CheckCircle2 /></div>
            <h3>Plan activated</h3>
            <p>{scenario.label} via {selT.mode} on {date}.</p>
            <p className="gm-mk-receipt">Receipt: <strong>{rc("PL")}</strong></p>
          </div>
        )}
      </div>
      {!done && !processing && (
        <WizardActions step={step} last={3} onBack={() => setStep(Math.max(0, step-1))} onNext={() => {
          if (step === 2 && otp.length < 6) return;
          if (step < 3) setStep(step + 1);
          else { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); }, 1000); }
        }} nextDisabled={step === 2 && otp.length < 6} finishLabel="Confirm" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 10) Sale detail dialog ================= */
export function SaleDetailDialog({ open, onClose, sale, onShare, onPrint }: { open: boolean; onClose: () => void; sale: SaleRecord | null; onShare: (s: SaleRecord) => void; onPrint: () => void; }) {
  if (!sale) return null;
  const sl = sale;
  function doExport() {
    const obj: Record<string, unknown> = { ...sl };
    csvDownload("sale-" + sl.id + ".csv", [["field", "value"], ...Object.entries(obj).map(([k, v]) => [k, String(v)])]);
  }
  const tone = sl.paymentStatus === "Received" ? "high" : sl.paymentStatus === "Overdue" ? "low" : sl.paymentStatus === "Partial" ? "medium" : "neutral";
  return (
    <Dialog open={open} onClose={onClose} title={"Sale " + sl.id} desc={sl.date + " · " + sl.crop + " to " + sl.buyer} wide>
      <MarketKv columns={2} items={[
        { k: "Date", v: sl.date }, { k: "Recorded by", v: sl.recordedBy },
        { k: "Plot", v: sl.plot }, { k: "Crop", v: sl.crop + " · " + sl.variety },
        { k: "Quantity", v: sl.quantity.toLocaleString("en-KE") + " " + sl.unit + (sl.quantity !== 1 ? "s" : "") },
        { k: "Price per unit", v: kes(sl.pricePerUnit) },
        { k: "Gross amount", v: kes(sl.totalAmount) }, { k: "Transport", v: "– " + kes(sl.transportCost) },
        { k: "Market fees", v: "– " + kes(sl.marketFees) },
        { k: "Net income", v: <strong className="up">{kes(sl.netIncome)}</strong>, tone: "good" },
        { k: "Buyer", v: sl.buyer }, { k: "Buyer phone", v: sl.buyerPhone },
        { k: "Payment method", v: sl.paymentMethod }, { k: "M-Pesa receipt", v: sl.mpesaReceipt ?? "—" },
        { k: "Payment status", v: <StatusChip label={sl.paymentStatus} tone={tone} /> },
        { k: "Quality grade", v: <span className="gm-chip gm-grade">{sl.qualityGrade}</span> },
      ]} />
      <MarketCallout tone="info">Note: {sl.notes}</MarketCallout>
      <div className="d-flex gap-2 justify-content-end mt-3 flex-wrap">
        <button className="gm-btn gm-btn-outline" onClick={onPrint}><Printer /> Print</button>
        <button className="gm-btn gm-btn-outline" onClick={() => onShare(sl)}><Share2 /> Share</button>
        <button className="gm-btn gm-btn-outline" onClick={doExport}><Download /> CSV</button>
        <button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>
      </div>
    </Dialog>
  );
}

/* ================= 11) Record sale wizard ================= */
export function RecordSaleWizard({ open, onClose, presetBuyer, onSaved }: { open: boolean; onClose: () => void; presetBuyer?: Buyer | null; onSaved: (s: Partial<SaleRecord>) => void; }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<SaleRecord>>({
    crop: "Cabbage", variety: "Gloria F1", unit: "Head", quantity: 500, pricePerUnit: 30,
    paymentMethod: "M-Pesa", qualityGrade: "A",
    buyer: presetBuyer?.name ?? "", buyerPhone: presetBuyer?.phone ?? "",
    transportCost: 2000, marketFees: 300, date: new Date().toISOString().slice(0, 10),
  });
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [receipt, setReceipt] = useState("");
  const total = (form.quantity ?? 0) * (form.pricePerUnit ?? 0);
  const net = total - (form.transportCost ?? 0) - (form.marketFees ?? 0);
  useEffect(() => { if (open) { setStep(0); setDone(false); setOtp(""); setProcessing(false); setReceipt(rc("SHK")); setForm((f) => ({ ...f, buyer: presetBuyer?.name ?? f.buyer, buyerPhone: presetBuyer?.phone ?? f.buyerPhone })); } }, [open, presetBuyer]);
  const steps = ["Sale details", "Buyer", "Payment", "Confirm"];
  const set = (patch: Partial<SaleRecord>) => setForm((f) => ({ ...f, ...patch }));
  return (
    <Dialog open={open} onClose={onClose} title="Record a new sale" desc="Logged sales feed into analytics and records" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-mk-stack mt-3">
        {step === 0 && (
          <div className="gm-mk-form-grid">
            <div className="gm-field"><label>Date</label><input type="date" className="gm-input" value={form.date} onChange={(e) => set({ date: e.target.value })} /></div>
            <div className="gm-field"><label>Crop</label><input className="gm-input" value={form.crop} onChange={(e) => set({ crop: e.target.value })} /></div>
            <div className="gm-field"><label>Variety</label><input className="gm-input" value={form.variety} onChange={(e) => set({ variety: e.target.value })} /></div>
            <div className="gm-field"><label>Quantity</label><input type="number" className="gm-input" value={form.quantity} onChange={(e) => set({ quantity: Number(e.target.value) })} /></div>
            <div className="gm-field"><label>Unit</label><input className="gm-input" value={form.unit} onChange={(e) => set({ unit: e.target.value })} /></div>
            <div className="gm-field"><label>Price per unit</label><input type="number" className="gm-input" value={form.pricePerUnit} onChange={(e) => set({ pricePerUnit: Number(e.target.value) })} /></div>
            <div className="gm-field"><label>Quality</label>
              <select className="gm-select" value={form.qualityGrade} onChange={(e) => set({ qualityGrade: e.target.value as any })}>
                <option value="A">A — premium</option><option value="B">B — standard</option><option value="C">C — processing</option>
              </select>
            </div>
            <div className="gm-field"><label>Plot</label><input className="gm-input" value={form.plot} onChange={(e) => set({ plot: e.target.value })} placeholder="e.g. Plot 1" /></div>
          </div>
        )}
        {step === 1 && (
          <div className="gm-mk-form-grid">
            <div className="gm-field" style={{ gridColumn: "1/-1" }}><label>Buyer</label><input className="gm-input" value={form.buyer} onChange={(e) => set({ buyer: e.target.value })} /></div>
            <div className="gm-field"><label>Buyer phone</label><input className="gm-input" value={form.buyerPhone} onChange={(e) => set({ buyerPhone: e.target.value })} placeholder="07XX XXX XXX" /></div>
            <div className="gm-field"><label>Transport cost</label><input type="number" className="gm-input" value={form.transportCost} onChange={(e) => set({ transportCost: Number(e.target.value) })} /></div>
            <div className="gm-field"><label>Market fees</label><input type="number" className="gm-input" value={form.marketFees} onChange={(e) => set({ marketFees: Number(e.target.value) })} /></div>
            <div className="gm-field" style={{ gridColumn: "1/-1" }}><label>Notes</label><textarea className="gm-input" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} /></div>
          </div>
        )}
        {step === 2 && !done && !processing && (
          <div>
            <p className="gm-field-label">Payment method</p>
            <div className="gm-tabs mb-3">
              {(["M-Pesa","Cash","Bank","Invoice"] as const).map((m) => (
                <button key={m} type="button" className={"gm-tab " + (form.paymentMethod === m ? "on" : "")} onClick={() => set({ paymentMethod: m })}>{m}</button>
              ))}
            </div>
            {form.paymentMethod === "M-Pesa" ? (
              <>
                <p>Confirm buyer sent <strong>{kes(total)}</strong>. Enter M-Pesa OTP (demo <code>123456</code>).</p>
                <OtpInput value={otp} onChange={setOtp} />
              </>
            ) : <p>Receipt will be generated.</p>}
          </div>
        )}
        {step === 3 && !done && (
          <div>
            <h4 className="gm-h-section-sm">Review sale</h4>
            <MarketKv items={[
              { k: "Crop", v: (form.crop ?? "") + " (" + (form.variety ?? "") + ")" },
              { k: "Quantity", v: (form.quantity ?? 0).toLocaleString("en-KE") + " " + (form.unit ?? "") + "s" },
              { k: "Price/unit", v: kes(form.pricePerUnit ?? 0) },
              { k: "Gross", v: kes(total) },
              { k: "Net", v: <strong className="up">{kes(net)}</strong>, tone: "good" },
              { k: "Buyer", v: form.buyer ?? "" },
              { k: "Payment", v: form.paymentMethod ?? "" },
            ]} />
          </div>
        )}
        {processing && <div className="gm-mk-processing"><Loader2 className="spin" /><p>Saving…</p></div>}
        {done && (
          <div className="gm-mk-success">
            <div className="gm-mk-success-mark"><CheckCircle2 /></div>
            <h3>Sale recorded</h3>
            <p>{form.quantity?.toLocaleString("en-KE")} {form.unit}s of {form.crop} to {form.buyer}.</p>
            <p className="gm-mk-receipt">Ref: <strong>{receipt}</strong></p>
          </div>
        )}
      </div>
      {!done && !processing && (
        <WizardActions step={step} last={3} onBack={() => setStep(Math.max(0, step-1))} onNext={() => {
          if (step < 3) setStep(step+1);
          else { setProcessing(true); setTimeout(() => { setProcessing(false); setDone(true); onSaved({ ...form, totalAmount: total, netIncome: net, paymentStatus: form.paymentMethod === "Invoice" ? "Pending" : "Received", mpesaReceipt: form.paymentMethod === "M-Pesa" ? receipt : undefined }); }, 900); }
        }} nextDisabled={step === 2 && form.paymentMethod === "M-Pesa" && otp.length < 6} finishLabel="Save sale" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 12) Contract detail ================= */
export function ContractDetailDialog({ open, onClose, contract, onApply }: { open: boolean; onClose: () => void; contract: Contract | null; onApply: (c: Contract) => void; }) {
  if (!contract) return null;
  return (
    <Dialog open={open} onClose={onClose} title={contract.title} desc={contract.company + " · " + contract.duration} wide>
      <MarketKv columns={2} items={[
        { k: "Company", v: contract.company },
        { k: "Crop & variety", v: contract.crop + " · " + contract.variety },
        { k: "Acreage", v: contract.acreage },
        { k: "Duration", v: contract.duration },
        { k: "Price guarantee", v: <strong style={{ color: "var(--gm-leaf-600)" }}>{contract.priceGuarantee}</strong> },
        { k: "Deadline", v: contract.applicationDeadline },
        { k: "County match", v: contract.countyMatch ? "Kiambu match" : "Out of county", tone: contract.countyMatch ? "good" : "warn" },
        { k: "Crop match", v: contract.cropMatch ? "You grow this" : "New crop needed", tone: contract.cropMatch ? "good" : "warn" },
        { k: "Applicants", v: contract.applicants + " farmers" },
        { k: "Rating", v: contract.rating + " stars" },
      ]} />
      <h4 className="gm-h-section-sm mt-3">Requirements</h4>
      <ul className="gm-mk-list">{contract.requirements.map((r) => <li key={r}><ShieldCheck width={14} height={14} /> {r}</li>)}</ul>
      <MarketCallout tone="info"><MapPin width={14} height={14} /> {contract.contactPerson} · {contract.phone} · {contract.email}</MarketCallout>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Close</button>
        {contract.status === "open" ? <button className="gm-btn gm-btn-lime" onClick={() => onApply(contract)}>Apply <ChevronRight /></button> : null}
      </div>
    </Dialog>
  );
}

/* ================= 13) Apply contract wizard ================= */
export function ApplyContractWizard({ open, onClose, contract, onApplied }: { open: boolean; onClose: () => void; contract: Contract | null; onApplied?: (c: Contract) => void; }) {
  const [step, setStep] = useState(0);
  const [acres, setAcres] = useState(0.5);
  const [phone, setPhone] = useState("0712 345 678");
  const [accept, setAccept] = useState(false);
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState("");
  useEffect(() => { if (open) { setStep(0); setDone(false); setAccept(false); setRef(rc("APP")); } }, [open]);
  if (!contract) return null;
  const steps = ["Acreage", "Eligibility", "Submit"];
  return (
    <Dialog open={open} onClose={onClose} title={"Apply — " + contract.title} desc={contract.company} wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-mk-stack mt-3">
        {step === 0 && (
          <div>
            <div className="gm-field"><label>Acreage to commit</label><input type="number" step="0.1" className="gm-input" value={acres} onChange={(e) => setAcres(Number(e.target.value))} /></div>
            <div className="gm-field"><label>Contact number</label><input className="gm-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="gm-field-label">Tick requirements you meet</p>
            {contract.requirements.map((r, i) => (
              <label key={i} className="gm-check-row"><input type="checkbox" defaultChecked={i !== 0} /> {r}</label>
            ))}
            <MarketCallout tone="warn">Missing any? The company offers onboarding support for qualifying farmers.</MarketCallout>
          </div>
        )}
        {step === 2 && !done && (
          <div>
            <h4 className="gm-h-section-sm">Submit application</h4>
            <MarketKv items={[
              { k: "Contract", v: contract.title }, { k: "Company", v: contract.company },
              { k: "Acreage", v: acres + " acres" }, { k: "Price", v: contract.priceGuarantee },
            ]} />
            <label className="gm-check-row"><input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} /> I agree to the contract terms.</label>
          </div>
        )}
        {done && (
          <div className="gm-mk-success">
            <div className="gm-mk-success-mark"><CheckCircle2 /></div>
            <h3>Application submitted</h3>
            <p>{contract.company} will contact you in 5 working days.</p>
            <p className="gm-mk-receipt">Ref: <strong>{ref}</strong></p>
          </div>
        )}
      </div>
      {!done && (
        <WizardActions step={step} last={2} onBack={() => setStep(Math.max(0, step-1))} onNext={() => { if (step < 2) setStep(step+1); else if (accept) { setDone(true); if (contract && onApplied) onApplied(contract); } }} nextDisabled={step === 2 && !accept} finishLabel="Submit" />
      )}
      {done && <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button></div>}
    </Dialog>
  );
}

/* ================= 14) Transport compare ================= */
export function TransportCompareDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  return (
    <Dialog open={open} onClose={onClose} title="Transport options" desc="From Githunguri, rated for a 1,000-head cabbage load" wide>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Mode</th><th>Cost/km</th><th>Lead</th><th>Note</th></tr></thead>
          <tbody>
            {TRANSPORT_OPTIONS.map((t) => (
              <tr key={t.id}><td><strong>{t.mode}</strong></td><td>{t.costPerKm === 0 ? "Free" : kes(t.costPerKm)}</td><td>{t.leadTime}</td><td>{t.note}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 15) Export dialog ================= */
export function MarketExportDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [range, setRange] = useState("ytd");
  const [format, setFormat] = useState<"csv"|"pdf"|"excel">("csv");
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) setDone(false); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Export sales & prices" desc="Download a file for your accountant or cooperative">
      {!done ? (
        <>
          <p className="gm-field-label">Date range</p>
          <div className="gm-tabs mb-3">
            {["ytd","this-month","last-month","this-season","custom"].map((r) => (
              <button key={r} type="button" className={"gm-tab " + (range === r ? "on" : "")} onClick={() => setRange(r)}>{r.replace("-", " ")}</button>
            ))}
          </div>
          <p className="gm-field-label">Format</p>
          <div className="gm-mk-options">
            <button type="button" className={"gm-checkcard " + (format === "csv" ? "is-on" : "")} onClick={() => setFormat("csv")}><strong>CSV</strong><small>For Excel / Sheets</small></button>
            <button type="button" className={"gm-checkcard " + (format === "excel" ? "is-on" : "")} onClick={() => setFormat("excel")}><strong>Excel</strong><small>Formatted workbook</small></button>
            <button type="button" className={"gm-checkcard " + (format === "pdf" ? "is-on" : "")} onClick={() => setFormat("pdf")}><strong>PDF</strong><small>For printing</small></button>
          </div>
        </>
      ) : (
        <div className="gm-mk-success"><div className="gm-mk-success-mark"><CheckCircle2 /></div><h3>Export ready</h3><p>Market report {range}.{format} is downloading.</p><p className="gm-mk-receipt">Ref: <strong>{rc("EXP")}</strong></p></div>
      )}
      <div className="d-flex gap-2 justify-content-end mt-3">
        {!done ? (<><button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button><button className="gm-btn gm-btn-lime" onClick={() => setDone(true)}><Download /> Generate</button></>) : <button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>}
      </div>
    </Dialog>
  );
}

/* ================= 16) Share time-limited code ================= */
export function MarketShareDialog({ open, onClose, title }: { open: boolean; onClose: () => void; title?: string; }) {
  const [days, setDays] = useState(7);
  const [generated, setGenerated] = useState(false);
  useEffect(() => { if (open) setGenerated(false); }, [open]);
  const code = useMemo(() => {
    if (!generated) return "";
    const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let c = "GM-MK-";
    for (let i = 0; i < 8; i++) c += s[Math.floor(Math.random() * s.length)];
    return c;
  }, [generated]);
  const expiry = new Date(Date.now() + days * 86400000).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  return (
    <Dialog open={open} onClose={onClose} title="Share access" desc={(title ?? "Market prices") + " · time-limited link"}>
      {!generated ? (
        <>
          <p className="gm-field-label">Access duration</p>
          <div className="gm-tabs mb-3">{[1,3,7,14,30].map((d) => (<button key={d} type="button" className={"gm-tab " + (days === d ? "on" : "")} onClick={() => setDays(d)}>{d} day{d > 1 ? "s" : ""}</button>))}</div>
          <Toggle checked={true} onChange={() => {}} label="Read-only" desc="Recipients can view but not change" />
        </>
      ) : (
        <div className="gm-mk-success">
          <div className="gm-mk-receipt-lg"><Lock /><code>{code}</code></div>
          <p>Expires <strong>{expiry}</strong>.</p>
          <div className="gm-mk-share-btns">
            <button type="button" className="gm-btn gm-btn-outline"><MessageCircle /> WhatsApp</button>
            <button type="button" className="gm-btn gm-btn-outline"><Send /> SMS</button>
            <button type="button" className="gm-btn gm-btn-outline">Email</button>
          </div>
        </div>
      )}
      <div className="d-flex gap-2 justify-content-end mt-3">
        {!generated ? (<><button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button><button className="gm-btn gm-btn-lime" onClick={() => setGenerated(true)}><Share2 /> Generate link</button></>) : <button className="gm-btn gm-btn-lime" onClick={onClose}>Done</button>}
      </div>
    </Dialog>
  );
}

/* ================= 17) Settings dialog ================= */
export function MarketSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [sms, setSms] = useState(true); const [thresh, setThresh] = useState(10);
  const [autoRec, setAutoRec] = useState(true); const [weekend, setWeekend] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Market settings" desc="Alerts, reminders, sharing">
      <Toggle checked={sms} onChange={setSms} label="SMS price alerts" desc="Sent to 0712 345 678" />
      <div className="gm-field mt-2"><label>Price move threshold (%)</label><input type="number" className="gm-input" value={thresh} onChange={(e) => setThresh(Number(e.target.value))} /></div>
      <div className="mt-2"><Toggle checked={autoRec} onChange={setAutoRec} label="Auto-record M-Pesa sales" desc="Write records entry automatically" /></div>
      <div className="mt-2"><Toggle checked={weekend} onChange={setWeekend} label="Weekend deliveries" desc="Buyers may schedule Sat/Sun" /></div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button className="gm-btn gm-btn-lime" onClick={onClose}>Save</button>
      </div>
    </Dialog>
  );
}

/* ================= 18) FAQ dialog ================= */
export function MarketFaqDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [openQ, setOpenQ] = useState<number | null>(0);
  return (
    <Dialog open={open} onClose={onClose} title="Market FAQ & glossary" desc="Prices, brokers, contracts" wide>
      <div className="gm-mk-faq">
        {MARKET_FAQ.map((f, i) => (
          <div key={i} className={"gm-mk-faq-row " + (openQ === i ? "is-on" : "")}>
            <button type="button" onClick={() => setOpenQ(openQ === i ? null : i)}><strong>Q:</strong> {f.q}</button>
            {openQ === i ? <p><strong>A:</strong> {f.a}</p> : null}
          </div>
        ))}
      </div>
      <h4 className="gm-h-section-sm mt-3">Glossary</h4>
      <div className="gm-mk-glossary">{MARKET_GLOSSARY.map((g) => (<div key={g.term} className="gm-mk-glossary-row"><strong>{g.term}</strong><span>{g.def}</span></div>))}</div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 19) Score breakdown ================= */
export function MarketScoreDialog({ open, onClose, score }: { open: boolean; onClose: () => void; score: number; }) {
  const comps = [
    { k: "Price awareness", v: 92 }, { k: "Buyer diversity", v: 68 },
    { k: "On-time payment", v: 85 }, { k: "Price alerts", v: 70 },
    { k: "Contract cover", v: 55 }, { k: "Record accuracy", v: 95 },
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Market readiness score" desc={score + "/100 — what drives it"}>
      <div className="gm-mk-score-break">
        {comps.map((c) => (
          <div key={c.k}>
            <div className="d-flex justify-content-between"><strong>{c.k}</strong><span>{c.v}/100</span></div>
            <div className="gm-progress" role="progressbar"><i style={{ width: c.v + "%" }} /></div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 20) Alerts list ================= */
export function MarketAlertsDialog({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const alerts = [
    { crop: "Tomato", market: "Marikiti", dir: "above", threshold: 4500, cur: 5000, hot: true },
    { crop: "Cabbage", market: "Thika", dir: "above", threshold: 35, cur: 30, hot: false },
    { crop: "Avocado", market: "Kangemi", dir: "above", threshold: 45, cur: 55, hot: true },
    { crop: "Potatoes", market: "Marikiti", dir: "below", threshold: 2000, cur: 1800, hot: true },
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Active price alerts" desc="Notifications fire at threshold" wide>
      <div className="gm-mk-alert-list">
        {alerts.map((a, i) => (
          <div key={i} className={"gm-mk-alert " + (a.hot ? "is-hot" : "")}>
            <div><strong>{a.crop} · {a.market}</strong><small>When price goes {a.dir} {a.threshold.toLocaleString("en-KE")} KES</small></div>
            <div className="gm-mk-alert-meta"><StatusChip label={a.hot ? "Triggered" : "Armed"} tone={a.hot ? "high" : "neutral"} />now {a.cur.toLocaleString("en-KE")}</div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-end mt-3"><button className="gm-btn gm-btn-lime" onClick={onClose}>Close</button></div>
    </Dialog>
  );
}

/* ================= 21) Quick phone dialog ================= */
export function QuickPhoneDialog({ open, onClose, buyer }: { open: boolean; onClose: () => void; buyer: Buyer | null; }) {
  if (!buyer) return null;
  return (
    <Dialog open={open} onClose={onClose} title={"Call " + buyer.name} desc={buyer.contact}>
      <div className="gm-mk-phone">
        <div className="gm-mk-phone-num">{buyer.phone}</div>
        <MarketCallout tone="info"><Phone width={14} height={14} /> GrowMO will place a masked call.</MarketCallout>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button className="gm-btn gm-btn-outline" onClick={onClose}>Cancel</button>
        <button className="gm-btn gm-btn-lime" onClick={onClose}><Phone /> Call</button>
      </div>
    </Dialog>
  );
}
