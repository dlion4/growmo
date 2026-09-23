/* ============================================================================
   PAGE 10 — Market & Sales Modals, Wizards & Drawers
   15+ interactive dialogs for the market page.
   ========================================================================== */
import {
  BarChart3,
  Bell,
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  Handshake,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog, Stepper } from "../auth/controls";
import { WizardActions, StatusChip } from "./DashboardWidgets";
import {
  type Buyer,
  type CropListing,
  type FarmContract,
  type PriceAlert,
  type SaleRecord,
  formatPrice,
  type PriceTrend,
} from "../../data/app/market";
import { Sparkline } from "./MarketWidgets";

/* ── 1. Create Listing Wizard (3-step) ───────────────────────────────────── */
export function CreateListingWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (listing: { crop: string; quantity: number; price: number; notes: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [variety, setVariety] = useState("Gloria F1");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const reset = () => { setStep(0); setCrop("Cabbage"); setVariety("Gloria F1"); setQuantity(""); setPrice(""); setNotes(""); };
  return (
    <Dialog
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create crop listing"
      desc="Share your standing crop with buyers"
      wide
    >
      <Stepper steps={["Crop & variety", "Quantity & price", "Review & publish"]} current={step} />
      {step === 0 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Crop</label>
            <select className="gm-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option>Cabbage</option>
              <option>Tomato</option>
              <option>Maize</option>
              <option>Beans</option>
              <option>Avocado</option>
              <option>Potatoes</option>
            </select>
          </div>
          <div className="gm-field">
            <label>Variety</label>
            <select className="gm-select" value={variety} onChange={(e) => setVariety(e.target.value)}>
              {crop === "Cabbage" && <option>Gloria F1</option>}
              {crop === "Tomato" && <option>Anna F1</option>}
              {crop === "Maize" && <option>H6213</option>}
              {crop === "Beans" && <option>Rosecoco</option>}
              {crop === "Avocado" && <option>Hass</option>}
              {crop === "Potatoes" && <option>Shangi</option>}
            </select>
          </div>
          <div className="gm-field">
            <label>Plot</label>
            <select className="gm-select">
              <option>Plot 1 · 0.5 acre</option>
              <option>Plot 2 · 2 acres</option>
              <option>Plot 3 · 1 acre</option>
              <option>Greenhouse 1</option>
            </select>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Expected quantity</label>
            <input className="gm-input" type="number" placeholder="e.g. 14500" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="gm-field">
            <label>Asking price (KES per unit)</label>
            <input className="gm-input" type="number" placeholder="e.g. 35" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="gm-field">
            <label>Notes for buyers</label>
            <textarea className="gm-textarea" rows={3} placeholder="Grade, harvest window, delivery terms..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Crop</span><strong>{crop} — {variety}</strong></div>
            <div className="gm-review-row"><span>Quantity</span><strong>{Number(quantity || 0).toLocaleString("en-KE")} heads</strong></div>
            <div className="gm-review-row"><span>Asking price</span><strong>{formatPrice(Number(price || 0))}/head</strong></div>
            <div className="gm-review-row"><span>Est. revenue</span><strong className="font-display">{formatPrice(Number(quantity || 0) * Number(price || 0))}</strong></div>
            <div className="gm-review-row"><span>Notes</span><strong>{notes || "—"}</strong></div>
          </div>
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>Listing is public</strong>
              <small>Verified buyers can see and order from your portfolio link.</small>
            </span>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step === 2) {
            onSave({ crop, quantity: Number(quantity || 0), price: Number(price || 0), notes });
            reset();
            onClose();
          } else {
            setStep((s) => s + 1);
          }
        }}
        finishLabel="Publish listing"
      />
    </Dialog>
  );
}

/* ── 2. Contract Application Wizard (3-step) ─────────────────────────────── */
export function ContractApplicationWizard({
  open,
  contract,
  onClose,
  onApply,
}: {
  open: boolean;
  contract: FarmContract | null;
  onClose: () => void;
  onApply: () => void;
}) {
  const [step, setStep] = useState(0);
  const [agree, setAgree] = useState(false);
  if (!contract) return null;
  return (
    <Dialog
      open={open}
      onClose={() => { setStep(0); setAgree(false); onClose(); }}
      title={`Apply: ${contract.company}`}
      desc={`${contract.crop} ${contract.variety} — ${contract.duration}`}
      wide
    >
      <Stepper steps={["Requirements", "Your farm details", "Confirm"]} current={step} />
      {step === 0 && (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Crop & variety</span><strong>{contract.crop} — {contract.variety}</strong></div>
            <div className="gm-review-row"><span>Min acreage</span><strong>{contract.acreage}</strong></div>
            <div className="gm-review-row"><span>Contract duration</span><strong>{contract.duration}</strong></div>
            <div className="gm-review-row"><span>Price guarantee</span><strong className="font-display">{contract.priceGuarantee}</strong></div>
            <div className="gm-review-row"><span>Deadline</span><strong>{contract.applicationDeadline}</strong></div>
            <div className="gm-review-row"><span>Slots remaining</span><strong>{contract.slotsAvailable}</strong></div>
          </div>
          <div>
            <span className="gm-eyebrow">Requirements</span>
            {contract.requirements.map((req) => (
              <div key={req} className="gm-check-row">
                <Check />
                <span><strong>{req}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Your available acreage</label>
            <input className="gm-input" defaultValue="0.5 acre (Plot 1)" />
          </div>
          <div className="gm-field">
            <label>Current certifications</label>
            <input className="gm-input" defaultValue="PCPB User Certificate" />
          </div>
          <div className="gm-field">
            <label>Farming experience with this crop</label>
            <textarea className="gm-textarea" rows={3} defaultValue="3 seasons of cabbage. First time with French beans — willing to learn." />
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="gm-wizard-stack">
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>Application summary</strong>
              <small>Applying to {contract.company} for {contract.crop} {contract.variety} contract.</small>
            </span>
          </div>
          <label className="gm-checkcard">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              <strong>I agree to the contract terms</strong>
              <small>I understand the price guarantee, quality requirements and delivery schedule.</small>
            </span>
          </label>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step === 2) {
            if (!agree) return;
            onApply();
            setStep(0);
            setAgree(false);
            onClose();
          } else {
            setStep((s) => s + 1);
          }
        }}
        nextDisabled={step === 2 && !agree}
        finishLabel="Submit application"
      />
    </Dialog>
  );
}

/* ── 3. Buyer Profile Drawer ─────────────────────────────────────────────── */
export function BuyerProfileDrawer({
  open,
  buyer,
  onClose,
  onOrder,
}: {
  open: boolean;
  buyer: Buyer | null;
  onClose: () => void;
  onOrder: () => void;
}) {
  if (!open || !buyer) return null;
  const Icon = buyer.icon;
  return (
    <>
      <button type="button" className="gm-scrim is-visible" onClick={onClose} aria-label="Close" />
      <aside className="gm-drawer wide is-visible" role="dialog" aria-modal="true" aria-label={buyer.name}>
        <div className="gm-drawer-head">
          <strong className="font-display">{buyer.name}</strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={onClose}><X /></button>
        </div>
        <div className="gm-drawer-body">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon" style={{ background: buyer.hue, color: "#fff", width: 56, height: 56 }}><Icon /></span>
            <div>
              <span className="gm-eyebrow">{buyer.type}</span>
              <h3 className="font-display mb-1">{buyer.name}</h3>
              <p className="mb-0" style={{ color: "var(--gm-ink-400)" }}>{buyer.location}</p>
            </div>
          </div>
          <div className="gm-review-card mt-3">
            <div className="gm-review-row"><span>Rating</span><strong><Star width={14} height={14} fill="var(--gm-gold-500)" color="var(--gm-gold-500)" /> {buyer.rating}/5</strong></div>
            <div className="gm-review-row"><span>Total orders</span><strong>{buyer.totalOrders}</strong></div>
            <div className="gm-review-row"><span>Last order</span><strong>{buyer.lastOrder}</strong></div>
            <div className="gm-review-row"><span>Payment terms</span><strong>{buyer.paymentTerms}</strong></div>
            <div className="gm-review-row"><span>Min quantity</span><strong>{buyer.minQuantity}</strong></div>
            <div className="gm-review-row"><span>Phone</span><strong>{buyer.phone}</strong></div>
            {buyer.email && <div className="gm-review-row"><span>Email</span><strong>{buyer.email}</strong></div>}
          </div>
          <div className="mt-3">
            <span className="gm-eyebrow">Crops wanted</span>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {buyer.crops.map((c) => (
                <span key={c} className="gm-chip">{c}</span>
              ))}
            </div>
          </div>
          <div className="gm-check-row mt-3">
            <MessageSquare />
            <span>
              <strong>Notes</strong>
              <small>{buyer.notes}</small>
            </span>
          </div>
        </div>
        <div className="gm-drawer-foot">
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onOrder}>
            <Handshake width={14} height={14} /> Place order
          </button>
          <button type="button" className="gm-btn gm-btn-mpesa gm-btn-sm">
            <Phone width={14} height={14} /> Call buyer
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}

/* ── 4. New Sale Recording Wizard (4-step) ───────────────────────────────── */
export function NewSaleWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (sale: Partial<SaleRecord>) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [buyer, setBuyer] = useState("Karen Greens Restaurant");
  const [method, setMethod] = useState("M-Pesa");
  const reset = () => { setStep(0); setCrop("Cabbage"); setQuantity(""); setPrice(""); setBuyer("Karen Greens Restaurant"); setMethod("M-Pesa"); };
  const total = Number(quantity || 0) * Number(price || 0);
  return (
    <Dialog open={open} onClose={() => { reset(); onClose(); }} title="Record a sale" desc="Log completed or pending sales" wide>
      <Stepper steps={["Crop & quantity", "Buyer & price", "Payment", "Confirm"]} current={step} />
      {step === 0 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Crop</label>
            <select className="gm-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option>Cabbage Gloria F1</option>
              <option>Tomato Anna F1</option>
              <option>Maize H6213</option>
              <option>Beans Rosecoco</option>
              <option>Avocado Hass</option>
              <option>Milk</option>
              <option>Eggs</option>
            </select>
          </div>
          <div className="gm-form-grid">
            <div className="gm-field">
              <label>Quantity sold</label>
              <input className="gm-input" type="number" placeholder="e.g. 2000" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="gm-field">
              <label>Unit</label>
              <select className="gm-select">
                <option>heads</option>
                <option>crates</option>
                <option>bags</option>
                <option>kg</option>
                <option>litres</option>
                <option>trays</option>
              </select>
            </div>
          </div>
          <div className="gm-field">
            <label>Quality grade</label>
            <select className="gm-select">
              <option>A — premium quality</option>
              <option>B — good, minor defects</option>
              <option>C — standard</option>
            </select>
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Buyer</label>
            <select className="gm-select" value={buyer} onChange={(e) => setBuyer(e.target.value)}>
              <option>Karen Greens Restaurant</option>
              <option>Kamau Brokers</option>
              <option>Kiambu Green Bistro</option>
              <option>Naivas Supermarket</option>
              <option>Walk-in buyer</option>
              <option>Twiga Foods</option>
            </select>
          </div>
          <div className="gm-field">
            <label>Price per unit (KES)</label>
            <input className="gm-input" type="number" placeholder="e.g. 30" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Total amount</span><strong className="font-display">{formatPrice(total)}</strong></div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Payment method</label>
            <select className="gm-select" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>M-Pesa</option>
              <option>Cash</option>
              <option>Bank transfer</option>
            </select>
          </div>
          <div className="gm-field">
            <label>M-Pesa receipt (if applicable)</label>
            <input className="gm-input" placeholder="e.g. SHK7PQ2RT" />
          </div>
          <div className="gm-field">
            <label>Sale status</label>
            <select className="gm-select">
              <option>Completed</option>
              <option>Pending</option>
              <option>In Transit</option>
            </select>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Crop</span><strong>{crop}</strong></div>
            <div className="gm-review-row"><span>Quantity</span><strong>{Number(quantity || 0).toLocaleString("en-KE")}</strong></div>
            <div className="gm-review-row"><span>Price/unit</span><strong>{formatPrice(Number(price || 0))}</strong></div>
            <div className="gm-review-row"><span>Total</span><strong className="font-display">{formatPrice(total)}</strong></div>
            <div className="gm-review-row"><span>Buyer</span><strong>{buyer}</strong></div>
            <div className="gm-review-row"><span>Payment</span><strong>{method}</strong></div>
          </div>
        </div>
      )}
      <WizardActions
        step={step} last={3}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => {
          if (step === 3) {
            onSave({ crop, quantity: Number(quantity), pricePerUnit: Number(price), totalAmount: total, buyer, paymentMethod: method });
            reset(); onClose();
          } else { setStep((s) => s + 1); }
        }}
        finishLabel="Save sale"
      />
    </Dialog>
  );
}

/* ── 5. Price Alert Wizard ───────────────────────────────────────────────── */
export function PriceAlertDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (alert: Partial<PriceAlert>) => void;
}) {
  const [crop, setCrop] = useState("Cabbage");
  const [market, setMarket] = useState("Marikiti");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [threshold, setThreshold] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title="Set price alert" desc="Get notified when market price crosses your target">
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Crop</label>
          <select className="gm-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option>Cabbage</option><option>Tomato</option><option>Maize</option>
            <option>Beans</option><option>Potatoes</option><option>Onions</option>
          </select>
        </div>
        <div className="gm-field">
          <label>Market</label>
          <select className="gm-select" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option>Marikiti</option><option>Wakulima</option><option>Kangemi</option>
            <option>Kongowea</option><option>Eldoret</option><option>Nakuru</option><option>Thika</option>
          </select>
        </div>
        <div className="gm-field">
          <label>Condition</label>
          <div className="d-flex gap-2">
            <button type="button" className={`gm-chipbtn ${condition === "above" ? "on" : ""}`} onClick={() => setCondition("above")}>Above</button>
            <button type="button" className={`gm-chipbtn ${condition === "below" ? "on" : ""}`} onClick={() => setCondition("below")}>Below</button>
          </div>
        </div>
        <div className="gm-field">
          <label>Threshold price (KES)</label>
          <input className="gm-input" type="number" placeholder="e.g. 35" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-block"
          onClick={() => {
            onSave({ crop, market, condition, threshold: Number(threshold), active: true });
            onClose();
          }}
        >
          <Bell width={16} height={16} /> Create alert
        </button>
      </div>
    </Dialog>
  );
}

/* ── 6. Market Comparison Dialog ─────────────────────────────────────────── */
export function MarketComparisonDialog({
  open,
  crop,
  onClose,
}: {
  open: boolean;
  crop: string;
  onClose: () => void;
}) {
  const markets = [
    { name: "Thika", price: 30, transport: 0.5, distance: 15 },
    { name: "Marikiti", price: 35, transport: 2.0, distance: 40 },
    { name: "Kangemi", price: 32, transport: 1.75, distance: 35 },
    { name: "Nakuru", price: 30, transport: 3.0, distance: 60 },
  ];
  return (
    <Dialog open={open} onClose={onClose} title={`Compare markets — ${crop}`} desc="Net price after transport costs" wide>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr><th>Market</th><th>Price/head</th><th>Distance</th><th>Transport/head</th><th>Net price</th><th>Verdict</th></tr>
          </thead>
          <tbody>
            {markets.map((m, i) => (
              <tr key={m.name}>
                <td><strong>{m.name}</strong></td>
                <td className="font-display">{formatPrice(m.price)}</td>
                <td>{m.distance} km</td>
                <td>{formatPrice(m.transport)}</td>
                <td><strong className="font-display">{formatPrice(m.price - m.transport)}</strong></td>
                <td><StatusChip label={i === 0 ? "Best" : i === 1 ? "Good" : i === 2 ? "OK" : "Skip"} tone={i === 0 ? "low" : i === 1 ? "medium" : "neutral"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

/* ── 7. Price Trend Detail Drawer ────────────────────────────────────────── */
export function PriceTrendDrawer({
  open,
  trend,
  onClose,
}: {
  open: boolean;
  trend: PriceTrend | null;
  onClose: () => void;
}) {
  if (!open || !trend) return null;
  return (
    <>
      <button type="button" className="gm-scrim is-visible" onClick={onClose} aria-label="Close" />
      <aside className="gm-drawer wide is-visible" role="dialog" aria-modal="true" aria-label={`${trend.crop} price trend`}>
        <div className="gm-drawer-head">
          <strong className="font-display">{trend.crop} — {trend.market}</strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={onClose}><X /></button>
        </div>
        <div className="gm-drawer-body">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon" style={{ background: trend.trend === "up" ? "var(--gm-grad-primary)" : "var(--gm-grad-gold)", color: "#fff" }}>
              <TrendingUp />
            </span>
            <div>
              <span className="gm-eyebrow">Current price</span>
              <h3 className="font-display mb-0">{formatPrice(trend.current)} {trend.unit}</h3>
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-4">
              <div className="gm-kpi-soft">
                <small>7 days ago</small>
                <strong className="font-display">{formatPrice(trend.weekAgo)}</strong>
              </div>
            </div>
            <div className="col-4">
              <div className="gm-kpi-soft">
                <small>30 days ago</small>
                <strong className="font-display">{formatPrice(trend.monthAgo)}</strong>
              </div>
            </div>
            <div className="col-4">
              <div className="gm-kpi-soft">
                <small>1 year ago</small>
                <strong className="font-display">{formatPrice(trend.yearAgo)}</strong>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <span className="gm-eyebrow">7-day trend</span>
            <div className="gm-card p-3 mt-2">
              <Sparkline data={trend.data7d} width={340} height={60} />
            </div>
          </div>
          <div className="mt-3">
            <span className="gm-eyebrow">30-day trend</span>
            <div className="gm-card p-3 mt-2">
              <Sparkline data={trend.data30d} width={340} height={60} color="var(--gm-gold-500)" />
            </div>
          </div>
          <div className="gm-check-row mt-3">
            <BarChart3 />
            <span>
              <strong>Season peak: {trend.seasonPeak}</strong>
              <small>Season low: {trend.seasonLow}</small>
            </span>
          </div>
          <div className="gm-check-row mt-2">
            <TrendingUp />
            <span>
              <strong>AI insight</strong>
              <small>{trend.insight}</small>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── 8. Negotiation Dialog ───────────────────────────────────────────────── */
export function NegotiationDialog({
  open,
  buyer,
  onClose,
  onSend,
}: {
  open: boolean;
  buyer: Buyer | null;
  onClose: () => void;
  onSend: (msg: string) => void;
}) {
  const [message, setMessage] = useState("");
  if (!buyer) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Message ${buyer.name}`} desc={`Send a price negotiation or order inquiry`}>
      <div className="gm-wizard-stack">
        <div className="gm-check-row">
          <Phone />
          <span>
            <strong>{buyer.phone}</strong>
            <small>{buyer.type} · {buyer.location}</small>
          </span>
        </div>
        <div className="gm-field">
          <label>Message</label>
          <textarea
            className="gm-textarea"
            rows={4}
            placeholder={`Habari ${buyer.name}, I have 3,000 cabbage heads ready for delivery. Interested?`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2">
          <button type="button" className="gm-btn gm-btn-mpesa gm-btn-block" onClick={() => { onSend(message || `Habari ${buyer.name}, I have cabbage available.`); onClose(); }}>
            <MessageSquare width={16} height={16} /> Send via SMS
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-block" onClick={() => { onSend(message || `Habari ${buyer.name}`); onClose(); }}>
            <MessageSquare width={16} height={16} /> WhatsApp
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 9. Shipment Tracker Drawer ──────────────────────────────────────────── */
export function ShipmentDrawer({
  open,
  sale,
  onClose,
}: {
  open: boolean;
  sale: SaleRecord | null;
  onClose: () => void;
}) {
  if (!open || !sale) return null;
  const stages = [
    { label: "Packed & loaded", time: "06:00 AM", done: true },
    { label: "In transit", time: sale.saleStatus === "In Transit" ? "Now" : "08:30 AM", done: sale.saleStatus !== "Pending", current: sale.saleStatus === "In Transit" },
    { label: "Arrived at market", time: "Expected 10:00 AM", done: sale.saleStatus === "Completed" },
    { label: "Payment confirmed", time: sale.mpesaReceipt ?? "Pending", done: sale.saleStatus === "Completed" },
  ];
  return (
    <>
      <button type="button" className="gm-scrim is-visible" onClick={onClose} aria-label="Close" />
      <aside className="gm-drawer wide is-visible" role="dialog" aria-modal="true" aria-label="Shipment tracker">
        <div className="gm-drawer-head">
          <strong className="font-display">Shipment: {sale.crop} — {sale.buyer}</strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={onClose}><X /></button>
        </div>
        <div className="gm-drawer-body">
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Crop</span><strong>{sale.crop} {sale.variety}</strong></div>
            <div className="gm-review-row"><span>Quantity</span><strong>{sale.quantity.toLocaleString("en-KE")} {sale.unit}</strong></div>
            <div className="gm-review-row"><span>Buyer</span><strong>{sale.buyer}</strong></div>
            <div className="gm-review-row"><span>Total</span><strong className="font-display">{formatPrice(sale.totalAmount)}</strong></div>
            <div className="gm-review-row"><span>Status</span><StatusChip label={sale.saleStatus} tone={sale.saleStatus === "Completed" ? "low" : "medium"} /></div>
          </div>
          <div className="mt-3">
            <span className="gm-eyebrow">Delivery timeline</span>
            <ul className="gm-timeline mt-2">
              {stages.map((s) => (
                <li key={s.label} className={`gm-tl-item ${s.done ? "is-done" : ""} ${s.current ? "is-current" : ""}`}>
                  <span className="gm-tl-dot">{s.done ? <Check /> : <Truck />}</span>
                  <span><strong>{s.label}</strong><small>{s.time}</small></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── 10. Share Portfolio Dialog ───────────────────────────────────────────── */
export function SharePortfolioDialog({
  open,
  listing,
  onClose,
}: {
  open: boolean;
  listing: CropListing | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!listing) return null;
  const link = `https://${listing.shareLink}`;
  return (
    <Dialog open={open} onClose={onClose} title="Share crop portfolio" desc="Buyers can view and order from this link">
      <div className="gm-wizard-stack">
        <div className="gm-code-chip" style={{ textAlign: "center", width: "100%" }}>{link}</div>
        <div className="d-flex gap-2">
          <button type="button" className="gm-btn gm-btn-lime gm-btn-block" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
            {copied ? <><Check width={16} height={16} /> Copied!</> : <><Copy width={16} height={16} /> Copy link</>}
          </button>
          <button type="button" className="gm-btn gm-btn-mpesa gm-btn-block">
            <MessageSquare width={16} height={16} /> WhatsApp
          </button>
        </div>
        <div className="gm-check-row">
          <Globe />
          <span>
            <strong>{listing.views} views · {listing.orders} orders</strong>
            <small>Share this link on WhatsApp groups and with direct buyers.</small>
          </span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 11. Sale Detail Drawer ──────────────────────────────────────────────── */
export function SaleDetailDrawer({
  open,
  sale,
  onClose,
  onTrack,
}: {
  open: boolean;
  sale: SaleRecord | null;
  onClose: () => void;
  onTrack: () => void;
}) {
  if (!open || !sale) return null;
  return (
    <>
      <button type="button" className="gm-scrim is-visible" onClick={onClose} aria-label="Close" />
      <aside className="gm-drawer wide is-visible" role="dialog" aria-modal="true" aria-label="Sale detail">
        <div className="gm-drawer-head">
          <strong className="font-display">{sale.crop} sale — {sale.date}</strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={onClose}><X /></button>
        </div>
        <div className="gm-drawer-body">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon" style={{ background: "var(--gm-grad-primary)", color: "#fff" }}>
              <Package />
            </span>
            <div>
              <span className="gm-eyebrow">{sale.market}</span>
              <h3 className="font-display mb-0">{formatPrice(sale.totalAmount)}</h3>
              <StatusChip label={sale.saleStatus} tone={sale.saleStatus === "Completed" ? "low" : sale.saleStatus === "Pending" ? "medium" : "neutral"} />
            </div>
          </div>
          <div className="gm-review-card mt-3">
            <div className="gm-review-row"><span>Crop</span><strong>{sale.crop} — {sale.variety}</strong></div>
            <div className="gm-review-row"><span>Quantity</span><strong>{sale.quantity.toLocaleString("en-KE")} {sale.unit}</strong></div>
            <div className="gm-review-row"><span>Price/unit</span><strong>{formatPrice(sale.pricePerUnit)}</strong></div>
            <div className="gm-review-row"><span>Total</span><strong className="font-display">{formatPrice(sale.totalAmount)}</strong></div>
            <div className="gm-review-row"><span>Transport</span><strong>−{formatPrice(sale.transportCost)}</strong></div>
            <div className="gm-review-row"><span>Market fees</span><strong>−{formatPrice(sale.marketFees)}</strong></div>
            <div className="gm-review-row"><span>Net income</span><strong className="font-display" style={{ color: "var(--gm-leaf-700)" }}>{formatPrice(sale.netIncome)}</strong></div>
            <div className="gm-review-row"><span>Buyer</span><strong>{sale.buyer}</strong></div>
            <div className="gm-review-row"><span>Phone</span><strong>{sale.buyerPhone}</strong></div>
            <div className="gm-review-row"><span>Payment</span><strong>{sale.paymentMethod}</strong></div>
            <div className="gm-review-row"><span>Receipt</span><strong>{sale.mpesaReceipt ?? "—"}</strong></div>
            <div className="gm-review-row"><span>Grade</span><strong>{sale.qualityGrade}</strong></div>
          </div>
          <div className="gm-check-row mt-3">
            <FileText />
            <span>
              <strong>Notes</strong>
              <small>{sale.notes}</small>
            </span>
          </div>
        </div>
        <div className="gm-drawer-foot">
          {(sale.saleStatus === "In Transit" || sale.saleStatus === "Pending") && (
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onTrack}>
              <Truck width={14} height={14} /> Track shipment
            </button>
          )}
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm">
            <Download width={14} height={14} /> Export receipt
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}

/* ── 12. Contract Detail Dialog ──────────────────────────────────────────── */
export function ContractDetailDialog({
  open,
  contract,
  onClose,
  onApply,
}: {
  open: boolean;
  contract: FarmContract | null;
  onClose: () => void;
  onApply: () => void;
}) {
  if (!contract) return null;
  return (
    <Dialog open={open} onClose={onClose} title={contract.company} desc={`${contract.crop} ${contract.variety} contract`} wide>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Crop & variety</span><strong>{contract.crop} — {contract.variety}</strong></div>
          <div className="gm-review-row"><span>Min acreage</span><strong>{contract.acreage}</strong></div>
          <div className="gm-review-row"><span>Duration</span><strong>{contract.duration}</strong></div>
          <div className="gm-review-row"><span>Price guarantee</span><strong className="font-display">{contract.priceGuarantee}</strong></div>
          <div className="gm-review-row"><span>Location</span><strong>{contract.location}</strong></div>
          <div className="gm-review-row"><span>Deadline</span><strong>{contract.applicationDeadline}</strong></div>
          <div className="gm-review-row"><span>Slots</span><strong>{contract.slotsAvailable} remaining</strong></div>
          <div className="gm-review-row"><span>Phone</span><strong>{contract.companyPhone}</strong></div>
        </div>
        <div>
          <span className="gm-eyebrow">Requirements</span>
          {contract.requirements.map((req) => (
            <div key={req} className="gm-check-row">
              <Check /><span><strong>{req}</strong></span>
            </div>
          ))}
        </div>
        {contract.status === "Open" && (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-block mt-2" onClick={onApply}>
            <Handshake width={16} height={16} /> Apply for this contract
          </button>
        )}
        {contract.status === "Applied" && (
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>Application submitted</strong>
              <small>You will be notified when {contract.company} responds.</small>
            </span>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/* ── 13. Bulk Order Wizard (3-step) ──────────────────────────────────────── */
export function BulkOrderWizard({
  open,
  onClose,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (order: { crop: string; quantity: number; buyer: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [quantity, setQuantity] = useState("");
  const [buyer, setBuyer] = useState("Kamau Brokers");
  return (
    <Dialog open={open} onClose={() => { setStep(0); onClose(); }} title="Create bulk order" desc="Send an order to a buyer" wide>
      <Stepper steps={["Crop & quantity", "Select buyer", "Confirm order"]} current={step} />
      {step === 0 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Crop</label>
            <select className="gm-select" value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option>Cabbage Gloria F1</option><option>Tomato Anna F1</option><option>Beans Rosecoco</option>
            </select>
          </div>
          <div className="gm-field">
            <label>Quantity</label>
            <input className="gm-input" type="number" placeholder="e.g. 5000" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
        </div>
      )}
      {step === 1 && (
        <div className="gm-wizard-stack">
          <div className="gm-field">
            <label>Buyer</label>
            <select className="gm-select" value={buyer} onChange={(e) => setBuyer(e.target.value)}>
              <option>Kamau Brokers</option><option>Karen Greens Restaurant</option>
              <option>Naivas Supermarket</option><option>Twiga Foods</option>
            </select>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Crop</span><strong>{crop}</strong></div>
            <div className="gm-review-row"><span>Quantity</span><strong>{Number(quantity || 0).toLocaleString("en-KE")}</strong></div>
            <div className="gm-review-row"><span>Buyer</span><strong>{buyer}</strong></div>
          </div>
        </div>
      )}
      <WizardActions step={step} last={2} onBack={() => setStep((s) => s - 1)} onNext={() => {
        if (step === 2) { onSend({ crop, quantity: Number(quantity), buyer }); setStep(0); onClose(); }
        else setStep((s) => s + 1);
      }} finishLabel="Send order" />
    </Dialog>
  );
}

/* ── 14. Price Alert List Dialog ─────────────────────────────────────────── */
export function PriceAlertListDialog({
  open,
  alerts,
  onClose,
  onAdd,
  onDelete,
}: {
  open: boolean;
  alerts: PriceAlert[];
  onClose: () => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Price alerts" desc="Get notified when market prices hit your target" wide>
      <div className="gm-wizard-stack">
        {alerts.map((a) => (
          <div key={a.id} className="gm-check-row">
            {a.active ? <Bell /> : <Check />}
            <span style={{ flex: 1 }}>
              <strong>{a.crop} — {a.market}</strong>
              <small>
                Alert when {a.condition} {formatPrice(a.threshold)} · Current: {formatPrice(a.currentPrice)}
                {!a.active && a.triggeredAt && ` · Triggered ${a.triggeredAt}`}
              </small>
            </span>
            <StatusChip label={a.active ? "Active" : "Triggered"} tone={a.active ? "low" : "medium"} />
            <button type="button" className="gm-icon-btn danger" onClick={() => onDelete(a.id)}><X width={14} height={14} /></button>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="gm-empty">
            <h4 className="font-display">No alerts set</h4>
            <p className="text-muted">Create an alert to track market prices.</p>
          </div>
        )}
        <button type="button" className="gm-btn gm-btn-lime gm-btn-block mt-2" onClick={onAdd}>
          <Plus width={16} height={16} /> Add new alert
        </button>
      </div>
    </Dialog>
  );
}

/* ── 15. Sales Export Dialog ─────────────────────────────────────────────── */
export function SalesExportDialog({
  open,
  onClose,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  onExport: (format: string) => void;
}) {
  const [format, setFormat] = useState("csv");
  return (
    <Dialog open={open} onClose={onClose} title="Export sales data" desc="Download your sales records">
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Format</label>
          <select className="gm-select" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="csv">CSV (Excel compatible)</option>
            <option value="txt">Plain text</option>
          </select>
        </div>
        <div className="gm-field">
          <label>Date range</label>
          <select className="gm-select">
            <option>This month</option>
            <option>Last 3 months</option>
            <option>This season</option>
            <option>All time</option>
          </select>
        </div>
        <div className="gm-field">
          <label>Crop filter</label>
          <select className="gm-select">
            <option>All crops</option>
            <option>Cabbage</option>
            <option>Tomato</option>
            <option>Maize</option>
            <option>Beans</option>
          </select>
        </div>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-block" onClick={() => { onExport(format); onClose(); }}>
          <Download width={16} height={16} /> Export sales
        </button>
      </div>
    </Dialog>
  );
}

/* ── 16. Buyer Rating Dialog ─────────────────────────────────────────────── */
export function BuyerRatingDialog({
  open,
  buyer,
  onClose,
  onSave,
}: {
  open: boolean;
  buyer: Buyer | null;
  onClose: () => void;
  onSave: (rating: number, comment: string) => void;
}) {
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");
  if (!buyer) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Rate ${buyer.name}`} desc="Help other farmers know what to expect">
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Rating</label>
          <div className="d-flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                className="gm-pin-key"
                style={{ width: 50, height: 50, borderRadius: 14, background: r <= rating ? "var(--gm-grad-gold)" : "var(--gm-mint-50)", color: r <= rating ? "#2b1c05" : "var(--gm-ink-400)" }}
                onClick={() => setRating(r)}
              >
                <Star width={18} height={18} fill={r <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        <div className="gm-field">
          <label>Comment</label>
          <textarea className="gm-textarea" rows={3} placeholder="How was your experience selling to this buyer?" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-block" onClick={() => { onSave(rating, comment); onClose(); }}>
          <Star width={16} height={16} /> Submit rating
        </button>
      </div>
    </Dialog>
  );
}

/* ── 17. Listing Detail Drawer ───────────────────────────────────────────── */
export function ListingDetailDrawer({
  open,
  listing,
  onClose,
  onShare,
}: {
  open: boolean;
  listing: CropListing | null;
  onClose: () => void;
  onShare: () => void;
}) {
  if (!open || !listing) return null;
  return (
    <>
      <button type="button" className="gm-scrim is-visible" onClick={onClose} aria-label="Close" />
      <aside className="gm-drawer wide is-visible" role="dialog" aria-modal="true" aria-label="Listing detail">
        <div className="gm-drawer-head">
          <strong className="font-display">{listing.crop} — {listing.variety}</strong>
          <button type="button" className="gm-icon-btn on-dark" onClick={onClose}><X /></button>
        </div>
        <div className="gm-drawer-body">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon" style={{ background: "var(--gm-grad-primary)", color: "#fff" }}>
              <Package />
            </span>
            <div>
              <span className="gm-eyebrow">{listing.plot} · {listing.acreage}</span>
              <h3 className="font-display mb-0">{listing.crop} — {listing.variety}</h3>
              <StatusChip label={listing.status} tone={listing.status === "Active" ? "low" : "neutral"} />
            </div>
          </div>
          <div className="gm-review-card mt-3">
            <div className="gm-review-row"><span>Expected harvest</span><strong>{listing.expectedHarvest}</strong></div>
            <div className="gm-review-row"><span>Estimated quantity</span><strong>{listing.estimatedQuantity.toLocaleString("en-KE")} {listing.unit}</strong></div>
            <div className="gm-review-row"><span>Quality grade</span><strong>{listing.qualityGrade}</strong></div>
            <div className="gm-review-row"><span>Min order</span><strong>{listing.minOrder.toLocaleString("en-KE")} {listing.unit}</strong></div>
            <div className="gm-review-row"><span>Asking price</span><strong className="font-display">{formatPrice(listing.priceAsk)}/{listing.unit.split("/")[0]}</strong></div>
            <div className="gm-review-row"><span>Photos</span><strong>{listing.photos} uploaded</strong></div>
            <div className="gm-review-row"><span>Views</span><strong>{listing.views}</strong></div>
            <div className="gm-review-row"><span>Orders</span><strong>{listing.orders}</strong></div>
          </div>
          <div className="gm-check-row mt-3">
            <Share2 />
            <span>
              <strong>Portfolio link</strong>
              <small>growmo.ke/p/mary/{listing.crop.toLowerCase()}-{listing.variety.toLowerCase().replace(" ", "-")}</small>
            </span>
          </div>
        </div>
        <div className="gm-drawer-foot">
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onShare}>
            <Share2 width={14} height={14} /> Share link
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        </div>
      </aside>
    </>
  );
}