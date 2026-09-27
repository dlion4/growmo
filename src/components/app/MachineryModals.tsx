/* ============================================================================
   PAGE 20 — MACHINERY & EQUIPMENT MANAGEMENT  (26 modal kinds)

   equipment · add-equipment · edit-equipment · condition · attachments ·
   insurance · photo · service · schedule · maint-report · usage ·
   usage-report · hire-in · hire-out · hire-receipt · rate-edit · rate-add ·
   publish · delist · listing · fuel · fuel-report · depreciation ·
   assets-report · export · contact
   ========================================================================== */

import {
  BatteryCharging,
  CircleCheck,
  Cog,
  Download,
  FileJson,
  FileSpreadsheet,
  Fuel,
  Gavel,
  HandCoins,
  Phone,
  Plus,
  ScanSearch,
  Store,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Stepper } from "../auth/controls";
import {
  DashboardDrawer,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "./DashboardWidgets";
import {
  CATEGORIES,
  CONDITIONS,
  DEPR_METHODS,
  DEPRECIATION,
  EQUIPMENT,
  EQUIPMENT_TOTAL_VALUE,
  EQUIP_STATUS,
  USAGE_ANALYTICS,
  FUEL_MONTH_TOTAL,
  FUEL_TYPES,
  FUEL_LOG,
  MARKET_LISTINGS,
  MACH_CONTEXT,
  type HireOutRow,
  HIRE_OUT,
  type MaintRow,
  MAINTENANCE,
  type MarketListing,
  type RateCardRow,
  RATE_CARD,
  SUBCATEGORIES,
  USAGE_LOG,
} from "../../data/app/machinery";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";
import { Field, MpesaConfirm, SimWork } from "./MapModals";
import {
  categoryIcon,
  conditionTone,
  eqById,
} from "./MachineryWidgets";
import { MiniTabs } from "./MapWidgets";

/* ---------- modal state (26 kinds) ---------- */

export type ModalKind =
  | "equipment"
  | "add-equipment"
  | "edit-equipment"
  | "condition"
  | "attachments"
  | "insurance"
  | "photo"
  | "service"
  | "schedule"
  | "maint-report"
  | "usage"
  | "usage-report"
  | "hire-in"
  | "hire-out"
  | "hire-receipt"
  | "rate-edit"
  | "rate-add"
  | "publish"
  | "delist"
  | "listing"
  | "fuel"
  | "fuel-report"
  | "depreciation"
  | "assets-report"
  | "export"
  | "contact";

export interface ModalState {
  kind: ModalKind;
  equipmentId?: string;
  maintId?: string;
  usageId?: string;
  hireInId?: string;
  hireOutId?: string;
  rateId?: string;
  listingId?: string;
  fuelId?: string;
  contactPhone?: string;
  contactName?: string;
}

const maintOf = (id?: string): MaintRow =>
  MAINTENANCE.find((m) => m.id === id) ?? MAINTENANCE[0];
const hireOutOf = (id?: string): HireOutRow =>
  HIRE_OUT.find((h) => h.id === id) ?? HIRE_OUT[0];
const rateOf = (id?: string): RateCardRow =>
  RATE_CARD.find((r) => r.id === id) ?? RATE_CARD[0];

export type EquipTabId =
  | "overview"
  | "depreciation"
  | "maintenance"
  | "usage"
  | "fuel"
  | "hire"
  | "insurance"
  | "notes";

const EQUIP_TABS: { id: EquipTabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "depreciation", label: "Depreciation" },
  { id: "maintenance", label: "Maintenance" },
  { id: "usage", label: "Usage" },
  { id: "fuel", label: "Fuel" },
  { id: "hire", label: "Hire" },
  { id: "insurance", label: "Insurance" },
  { id: "notes", label: "Notes & photos" },
];

/* ============================================================================
   20.1 EQUIPMENT DETAIL DRAWER (8 mini-tabs)
   ========================================================================== */

export function EquipmentDrawer({
  open,
  state,
  onClose,
  onOpen,
}: {
  open: boolean;
  state: ModalState;
  onClose: () => void;
  onOpen: (s: ModalState) => void;
}) {
  const [tab, setTab] = useState<EquipTabId>("overview");
  useEffect(() => {
    if (open) setTab("overview");
  }, [open, state.equipmentId]);
  const e = eqById(state.equipmentId);
  const dep = DEPRECIATION.find((d) => d.equipmentId === e.id);
  const maint = MAINTENANCE.filter((m) => m.equipmentId === e.id);
  const usage = USAGE_LOG.filter((u) => u.equipmentId === e.id);
  const fuel = FUEL_LOG.filter((f) => f.equipmentId === e.id);
  const hireOut = HIRE_OUT.filter((h) => h.equipmentId === e.id);
  const agePct = dep ? Math.round((dep.bookValue / dep.purchasePrice) * 100) : null;

  return (
    <DashboardDrawer
      open={open}
      title={`${e.id} · ${e.name}`}
      onClose={onClose}
      footer={
        <div className="gm-drawer-foot">
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "edit-equipment", equipmentId: e.id })}>
            Edit details
          </button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "condition", equipmentId: e.id })}>
            <Wrench size={14} /> Condition / status
          </button>
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "usage", equipmentId: e.id })}>
            <Plus size={14} /> Log usage
          </button>
        </div>
      }
    >
      <div className="gm-mach-head">
        <span className="gm-mach-cat-ic gm-mach-cat-ic-lg">{categoryIcon(e.category)}</span>
        <div>
          <strong>{e.make}</strong>
          <small>
            {e.category} · {e.subCategory} · {e.status}
          </small>
        </div>
        <StatusChip label={e.condition} tone={conditionTone(e.condition)} />
      </div>

      <MiniTabs value={tab} items={EQUIP_TABS} onChange={setTab} label="Equipment sections" />

      {tab === "overview" && (
        <div className="gm-tabpane">
          <dl className="gm-facts">
            <Field k="Equipment ID" v={e.id} />
            <Field k="Name" v={e.name} />
            <Field k="Category" v={`${e.category} / ${e.subCategory}`} />
            <Field k="Make & model" v={e.make} />
            <Field k="Year of manufacture" v={String(e.year)} />
            <Field k="Registration no." v={e.regNo} />
            <Field k="Engine number" v={e.engineNo} />
            <Field k="Condition" v={e.condition} />
            <Field k="Ownership" v={e.ownership} />
            <Field k="Purchase date" v={e.purchaseDate} />
            <Field k="Purchase price" v={kes(e.purchasePrice)} />
            <Field k="Current estimated value" v={kes(e.marketValue)} />
            <Field k="Depreciation method" v={e.deprMethod} />
            <Field k="Useful life" v={`${e.usefulLife} years`} />
            <Field k="Fuel type" v={e.fuelType} />
            <Field k="Fuel consumption" v={e.fuelLph > 0 ? `${e.fuelLph} L/hr` : "—"} />
            <Field k="Horsepower" v={e.hp > 0 ? `${e.hp} HP` : "—"} />
            <Field k="Attachments" v={e.attachments.length > 0 ? e.attachments.join(", ") : "None"} />
            <Field k="Storage location" v={e.storage} />
            <Field k="Insurance" v={e.insurance.insured ? `Yes — ${e.insurance.insurer}, ${e.insurance.policyNo}, exp. ${e.insurance.expiry}` : "No"} />
            <Field k="Photo" v={e.photo} />
            <Field k="Status" v={e.status} />
            {e.hoursMeter ? <Field k="Meter hours" v={`${e.hoursMeter.toLocaleString()} hrs`} /> : null}
          </dl>
          <p className="gm-note-callout">{e.notes}</p>
          {e.attachments.length > 0 && (
            <div className="gm-quickrow">
              <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => onOpen({ kind: "attachments", equipmentId: e.id })}>
                Manage attachments
              </button>
              <button type="button" className="gm-btn gm-btn-ghost gm-btn-sm" onClick={() => onOpen({ kind: "photo", equipmentId: e.id })}>
                Add photo
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "depreciation" && (
        <div className="gm-tabpane">
          {dep ? (
            <>
              <div className="gm-dep-head">
                <div>
                  <strong>Book value {kes(dep.bookValue)}</strong>
                  <small>
                    of {kes(dep.purchasePrice)} purchase · {dep.ageYears} yrs old
                  </small>
                </div>
                <StatusChip label={`${agePct}% of cost kept`} tone={agePct !== null && agePct > 50 ? "low" : "medium"} />
              </div>
              <ProgressLine value={agePct ?? 0} label={`${e.name} book value kept`} />
              <dl className="gm-facts">
                <Field k="Useful life" v={`${dep.usefulLife} years`} />
                <Field k="Annual depreciation" v={kes(dep.annualDep)} />
                <Field k="Method" v={e.deprMethod} />
                <Field k="Market estimate" v={`~${kes(dep.marketValue)}`} />
              </dl>
              <p className="gm-muted mb-0">
                Market value runs above book because working MF 35s hold value in
                Kiambu — the {kes(dep.marketValue - dep.bookValue)} gap is the
                depreciation allowance, not cash.
              </p>
            </>
          ) : (
            <div className="gm-method-done">
              <Cog size={20} />
              <div>
                <strong>Not in the valuation schedule</strong>
                <p className="mb-0">
                  The asset report tracks the 4 largest purchases. Open the
                  depreciation calculator to price this one.
                </p>
              </div>
            </div>
          )}
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "depreciation", equipmentId: e.id })}>
              <Cog size={14} /> Value this asset
            </button>
          </div>
        </div>
      )}

      {tab === "maintenance" && (
        <div className="gm-tabpane">
          {maint.length === 0 ? (
            <p className="gm-muted">No scheduled maintenance for this item.</p>
          ) : (
            maint.map((m) => (
              <button key={m.id} type="button" className="gm-mach-row" onClick={() => onOpen({ kind: "service", maintId: m.id })}>
                <span>
                  <strong>{m.service}</strong>
                  <small>
                    {m.frequency} · next {m.nextDue} · {m.cost === 0 ? "free" : kes(m.cost)}
                  </small>
                </span>
                <StatusChip
                  label={m.status}
                  tone={m.status === "Overdue" ? "high" : m.status === "Upcoming" ? "medium" : m.status === "OK" ? "low" : "neutral"}
                />
              </button>
            ))
          )}
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "schedule", equipmentId: e.id })}>
              <Plus size={14} /> Schedule a task
            </button>
          </div>
        </div>
      )}

      {tab === "usage" && (
        <div className="gm-tabpane">
          {usage.length === 0 ? (
            <p className="gm-muted">No usage logged for this item yet.</p>
          ) : (
            usage.map((u) => (
              <div key={u.id} className="gm-mach-row">
                <span>
                  <strong>{u.date} · {u.hours} hrs</strong>
                  <small>
                    {u.activity} — {u.operator}
                  </small>
                </span>
                <small className="gm-mach-row-end">
                  {u.fuelL > 0 ? `${u.fuelL} L` : "no fuel"}
                </small>
              </div>
            ))
          )}
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "usage", equipmentId: e.id })}>
              <Plus size={14} /> Log usage
            </button>
          </div>
        </div>
      )}

      {tab === "fuel" && (
        <div className="gm-tabpane">
          {fuel.length === 0 ? (
            <p className="gm-muted">No fuel use this month — solar or manual.</p>
          ) : (
            fuel.map((f) => (
              <div key={f.id} className="gm-mach-row">
                <span>
                  <strong>{f.date} · {f.litres} L</strong>
                  <small>
                    {f.fuelType} @ {kes(f.pricePerL)}/L
                  </small>
                </span>
                <small className="gm-mach-row-end">{kes(f.total)}</small>
              </div>
            ))
          )}
          <div className="gm-method-cta">
            {e.fuelLph > 0 && (
              <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "fuel", equipmentId: e.id })}>
                <Fuel size={14} /> Log fuel
              </button>
            )}
          </div>
        </div>
      )}

      {tab === "hire" && (
        <div className="gm-tabpane">
          <h4 className="gm-subhead">Hired out ({hireOut.length})</h4>
          {hireOut.length === 0 ? (
            <p className="gm-muted mb-2">Not hired out this season.</p>
          ) : (
            hireOut.map((h) => (
              <div key={h.id} className="gm-mach-row">
                <span>
                  <strong>{h.date} · {h.hirer}</strong>
                  <small>
                    {h.rate} · {h.duration}
                  </small>
                </span>
                <small className="gm-mach-row-end">{kes(h.income)}</small>
              </div>
            ))
          )}
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "hire-out", equipmentId: e.id })}>
              <HandCoins size={14} /> Record hire-out
            </button>
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "publish", equipmentId: e.id })}>
              <Store size={14} /> Marketplace
            </button>
          </div>
        </div>
      )}

      {tab === "insurance" && (
        <div className="gm-tabpane">
          {e.insurance.insured ? (
            <dl className="gm-facts">
              <Field k="Insurer" v={e.insurance.insurer} />
              <Field k="Policy no." v={e.insurance.policyNo} />
              <Field k="Expiry" v={e.insurance.expiry} />
            </dl>
          ) : (
            <p className="gm-muted">
              Not insured. {e.purchasePrice >= 50000 ? "At this value, Africlaim's farm-equipment policy is worth a quote." : "Optional at this value."}
            </p>
          )}
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => onOpen({ kind: "insurance", equipmentId: e.id })}>
              <BatteryCharging size={14} /> {e.insurance.insured ? "Renew policy" : "Get insured"}
            </button>
          </div>
        </div>
      )}

      {tab === "notes" && (
        <div className="gm-tabpane">
          <figure className="gm-photo-card gm-photo-crop">
            <span className="gm-photo-thumb">{categoryIcon(e.category)}</span>
            <figcaption>
              <strong>{e.photo}</strong>
              <small>16/11/2026</small>
            </figcaption>
          </figure>
          <p className="gm-note-callout">{e.notes}</p>
          <div className="gm-method-cta">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "photo", equipmentId: e.id })}>
              Add photo note
            </button>
          </div>
        </div>
      )}
    </DashboardDrawer>
  );
}

/* ============================================================================
   20.1 ADD EQUIPMENT — 3-step wizard (all 24 registry fields)
   ========================================================================== */

const ATTACH_OPTIONS = ["Plough", "Harrow", "Trailer", "Rotavator (hired)", "Tarpaulin", "Chains", "Nozzles (3 sets)", "4 × 400 m drip tape", "Filter", "Valve manifold", "Shade cloth (30%)", "Insect net door", "Tap + overflow"];

export function AddEquipmentWizard({ onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    name: "",
    category: "Tool",
    subCategory: "Hand Hoe",
    make: "",
    year: "2026",
    regNo: "—",
    engineNo: "—",
    condition: "New",
    ownership: "Own",
    fuelType: "Manual",
    fuelLph: "0",
    hp: "0",
    usefulLife: "8",
    attachments: [] as string[],
    storage: "Tool shed",
    purchaseDate: "Nov 2026",
    purchasePrice: "0",
    currentValue: "0",
    deprMethod: "Straight line",
    photo: "",
    notes: "",
  });

  const toggleAttach = (a: string) =>
    setF((x) => ({ ...x, attachments: x.attachments.includes(a) ? x.attachments.filter((y) => y !== a) : [...x.attachments, a] }));

  if (saved) {
    return (
      <Dialog open onClose={onClose} title="Equipment saved">
        <div className="gm-method-done">
          <CircleCheck size={24} />
          <div>
            <strong>EQ-016 · {f.name} is in the registry</strong>
            <p className="mb-0">
              {f.category} / {f.subCategory} · {kes(Number(f.purchasePrice) || 0)} ·{" "}
              {f.ownership} · condition {f.condition}
            </p>
          </div>
        </div>
        <WizardActions step={0} last={0} onBack={onClose} onNext={onClose} finishLabel="Done" />
      </Dialog>
    );
  }

  const step0Ok = f.name.trim() !== "" && f.make.trim() !== "";
  return (
    <Dialog open onClose={onClose} title="Add equipment" desc="All 24 registry fields — the wizard walks them in three groups." wide>
      <Stepper steps={["Identity", "Specs & fuel", "Money & notes"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Name
            <input className="gm-input" placeholder="e.g. Walking tractor 7HP" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </label>
          <label className="gm-label">
            Category
            <select className="gm-input" value={f.category} onChange={(e) => {
              const c = e.target.value;
              setF({ ...f, category: c, subCategory: SUBCATEGORIES[c]?.[0] ?? "" });
            }}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Sub-category
            <select className="gm-input" value={f.subCategory} onChange={(e) => setF({ ...f, subCategory: e.target.value })}>
              {(SUBCATEGORIES[f.category] ?? []).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Make & model
            <input className="gm-input" placeholder="e.g. Kubota KRT45" value={f.make} onChange={(e) => setF({ ...f, make: e.target.value })} />
          </label>
          <label className="gm-label">
            Year of manufacture
            <input className="gm-input" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} inputMode="numeric" />
          </label>
          <label className="gm-label">
            Registration number
            <input className="gm-input" value={f.regNo} onChange={(e) => setF({ ...f, regNo: e.target.value })} placeholder="— if none" />
          </label>
          <label className="gm-label">
            Engine number
            <input className="gm-input" value={f.engineNo} onChange={(e) => setF({ ...f, engineNo: e.target.value })} placeholder="— if none" />
          </label>
          <label className="gm-label">
            Condition
            <select className="gm-input" value={f.condition} onChange={(e) => setF({ ...f, condition: e.target.value })}>
              {CONDITIONS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Ownership
            <select className="gm-input" value={f.ownership} onChange={(e) => setF({ ...f, ownership: e.target.value })}>
              {["Own", "Hired", "Shared", "Cooperative"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {step === 1 && (
        <div>
          <div className="gm-coords-grid">
            <label className="gm-label">
              Fuel type
              <select className="gm-input" value={f.fuelType} onChange={(e) => setF({ ...f, fuelType: e.target.value })}>
                {FUEL_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="gm-label">
              Fuel consumption (L/hr)
              <input className="gm-input" value={f.fuelLph} onChange={(e) => setF({ ...f, fuelLph: e.target.value })} inputMode="decimal" />
            </label>
            <label className="gm-label">
              Horsepower
              <input className="gm-input" value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} inputMode="numeric" />
            </label>
            <label className="gm-label">
              Useful life (years)
              <input className="gm-input" value={f.usefulLife} onChange={(e) => setF({ ...f, usefulLife: e.target.value })} inputMode="numeric" />
            </label>
            <label className="gm-label">
              Storage location
              <input className="gm-input" value={f.storage} onChange={(e) => setF({ ...f, storage: e.target.value })} />
            </label>
          </div>
          <div className="gm-attach-picks">
            <span className="gm-label-static">Attachments compatible</span>
            <div className="gm-chip-picks">
              {ATTACH_OPTIONS.map((a) => (
                <button key={a} type="button" className={`gm-chip-pick ${f.attachments.includes(a) ? "on" : ""}`} aria-pressed={f.attachments.includes(a)} onClick={() => toggleAttach(a)}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="gm-coords-grid">
            <label className="gm-label">
              Purchase date
              <input className="gm-input" value={f.purchaseDate} onChange={(e) => setF({ ...f, purchaseDate: e.target.value })} placeholder="e.g. Nov 2026" />
            </label>
            <label className="gm-label">
              Purchase price (KES)
              <input className="gm-input" value={f.purchasePrice} onChange={(e) => setF({ ...f, purchasePrice: e.target.value })} inputMode="numeric" />
            </label>
            <label className="gm-label">
              Current estimated value (KES)
              <input className="gm-input" value={f.currentValue} onChange={(e) => setF({ ...f, currentValue: e.target.value })} inputMode="numeric" />
            </label>
            <label className="gm-label">
              Depreciation method
              <select className="gm-input" value={f.deprMethod} onChange={(e) => setF({ ...f, deprMethod: e.target.value })}>
                {DEPR_METHODS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="gm-label">
              Photo caption
              <input className="gm-input" placeholder="e.g. In the shed, 17/11" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} />
            </label>
          </div>
          <label className="gm-label">
            Notes
            <textarea className="gm-input gm-textarea" rows={3} placeholder="Condition, quirks, what it is good for…" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </label>
          <div className="gm-review-box">
            <h5>Review</h5>
            <ul className="mb-0">
              <li>
                EQ-016 · {f.name || "—"} · {f.category} / {f.subCategory}
              </li>
              <li>
                {f.fuelType} · {f.hp} HP · life {f.usefulLife} yrs · {f.ownership}
              </li>
              <li>
                Bought {f.purchaseDate} for {kes(Number(f.purchasePrice) || 0)} · now ~{kes(Number(f.currentValue) || 0)} · {f.deprMethod}
              </li>
            </ul>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => {
          if (step === 2) {
            setSaved(true);
            toast.notify(`EQ-016 ${f.name} added to the registry`);
          } else setStep((s) => s + 1);
        }}
        nextDisabled={step === 0 ? !step0Ok : false}
        finishLabel="Save to registry"
      />
    </Dialog>
  );
}

/* ---------- edit equipment ---------- */

export function EditEquipmentModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const [f, setF] = useState({
    name: e.name,
    condition: e.condition,
    ownership: e.ownership,
    purchasePrice: String(e.purchasePrice),
    currentValue: String(e.marketValue),
    usefulLife: String(e.usefulLife),
    storage: e.storage,
    notes: e.notes,
  });
  return (
    <Dialog open onClose={onClose} title={`Edit ${e.id} · ${e.name}`} desc="Identity fields (ID, make, year, registration) are fixed after entry." wide>
      <div className="gm-coords-grid">
        <label className="gm-label">
          Name
          <input className="gm-input" value={f.name} onChange={(ev) => setF({ ...f, name: ev.target.value })} />
        </label>
        <label className="gm-label">
          Condition
          <select className="gm-input" value={f.condition} onChange={(ev) => setF({ ...f, condition: ev.target.value })}>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Ownership
          <select className="gm-input" value={f.ownership} onChange={(ev) => setF({ ...f, ownership: ev.target.value })}>
            {["Own", "Hired", "Shared", "Cooperative"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Purchase price (KES)
          <input className="gm-input" value={f.purchasePrice} onChange={(ev) => setF({ ...f, purchasePrice: ev.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Current value (KES)
          <input className="gm-input" value={f.currentValue} onChange={(ev) => setF({ ...f, currentValue: ev.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Useful life (yrs)
          <input className="gm-input" value={f.usefulLife} onChange={(ev) => setF({ ...f, usefulLife: ev.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Storage location
          <input className="gm-input" value={f.storage} onChange={(ev) => setF({ ...f, storage: ev.target.value })} />
        </label>
      </div>
      <label className="gm-label">
        Notes
        <textarea className="gm-input gm-textarea" rows={3} value={f.notes} onChange={(ev) => setF({ ...f, notes: ev.target.value })} />
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!f.name.trim()} onClick={() => { toast.notify(`${e.id} updated in the registry`); onClose(); }}>
          Save changes
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- condition / status change ---------- */

export function ConditionModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const [condition, setCondition] = useState(e.condition);
  const [status, setStatus] = useState(e.status);
  const [reason, setReason] = useState("");
  const dirty = condition !== e.condition || status !== e.status;
  return (
    <Dialog open onClose={onClose} title={`Condition & status · ${e.id}`} desc="Changing to “Under repair” takes the equipment out of the hire rate card.">
      <div className="gm-coords-grid">
        <label className="gm-label">
          Condition
          <select className="gm-input" value={condition} onChange={(ev) => setCondition(ev.target.value)}>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Operating status
          <select className="gm-input" value={status} onChange={(ev) => setStatus(ev.target.value)}>
            {EQUIP_STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="gm-label">
        Why the change? (goes on the equipment record)
        <input className="gm-input" placeholder="e.g. Battery dead — new one ordered" value={reason} onChange={(ev) => setReason(ev.target.value)} />
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!dirty || !reason.trim()}
          onClick={() => {
            toast.notify(`${e.id} → ${condition}, ${status}`);
            onClose();
          }}
        >
          <Wrench size={14} /> Apply change
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- attachments multi-select ---------- */

export function AttachmentsModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const [list, setList] = useState<string[]>(e.attachments);
  const toggle = (a: string) => setList((l) => (l.includes(a) ? l.filter((x) => x !== a) : [...l, a]));
  return (
    <Dialog open onClose={onClose} title={`Attachments · ${e.name}`}>
      <div className="gm-chip-picks">
        {ATTACH_OPTIONS.map((a) => (
          <button key={a} type="button" className={`gm-chip-pick ${list.includes(a) ? "on" : ""}`} aria-pressed={list.includes(a)} onClick={() => toggle(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`${e.id} attachments updated — ${list.length} fitted`); onClose(); }}>
          Save attachments
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- photo note ---------- */

export function PhotoModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const [caption, setCaption] = useState("");
  return (
    <Dialog open onClose={onClose} title={`Add photo · ${e.id}`}>
      <label className="gm-upload-box">
        <CameraIcon />
        <span>
          <strong>Take or choose a photo</strong>
          <small>Stored on the equipment record with the date</small>
        </span>
        <input type="file" accept="image/*" aria-label="Equipment photo" onChange={(ev) => { if (ev.target.files?.[0]) setCaption((c) => c || (ev.target.files?.[0]?.name.replace(/\.[^.]+$/, "") ?? "")); }} />
      </label>
      <label className="gm-label">
        Caption
        <input className="gm-input" placeholder="e.g. New battery fitted" value={caption} onChange={(ev) => setCaption(ev.target.value)} />
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!caption.trim()} onClick={() => { toast.notify(`Photo saved on ${e.id}`); onClose(); }}>
          Save photo
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- insurance (M-Pesa premium) ---------- */

export function InsuranceModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const premium = Math.max(1000, Math.round(e.purchasePrice * 0.015 / 50) * 50);
  const [insurer, setInsurer] = useState("Africlaim");
  const [paidRef, setPaidRef] = useState("");
  return (
    <Dialog open onClose={onClose} title={`${e.insurance.insured ? "Renew" : "Insure"} ${e.id} · ${e.name}`} desc={`Annual premium on ${kes(e.purchasePrice)} insured value · 1.5% rounded to KES 50`}>
      <div className="gm-soiltest-row">
        <label className="gm-label">
          Insurer
          <select className="gm-input" value={insurer} onChange={(ev) => setInsurer(ev.target.value)}>
            <option>Africlaim</option>
            <option>UBI Insurance</option>
            <option>Liberty Kenya</option>
            <option>Britam</option>
          </select>
        </label>
        <div className="gm-mpesa-row">
          <span>Annual premium</span>
          <strong>{kes(premium)}</strong>
        </div>
      </div>
      {paidRef === "" ? (
        <MpesaConfirm amount={premium} detail={`Equipment insurance · ${e.id} · ${insurer}`} onPaid={setPaidRef} />
      ) : (
        <div className="gm-method-done">
          <CircleCheck size={20} />
          <div>
            <strong>Policy issued — M-Pesa ref {paidRef}</strong>
            <p className="mb-0">
              {insurer} policy {insurer.slice(0, 2).toUpperCase()}/{e.id.replace("EQ-", "")}/2026 covers {e.name} until Nov 2027. Certificate sent to your GrowMO files.
            </p>
          </div>
        </div>
      )}
      {paidRef && (
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`${e.id} insured with ${insurer}`); onClose(); }}>
            Done
          </button>
        </div>
      )}
    </Dialog>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

/* ============================================================================
   20.2 MAINTENANCE MODALS
   ========================================================================== */

export function ServiceDoneModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const m = maintOf(state.maintId);
  const e = eqById(m.equipmentId);
  const [cost, setCost] = useState(m.cost > 0 ? String(m.cost) : "0");
  const [note, setNote] = useState("");
  return (
    <Dialog open onClose={onClose} title={`Mark done · ${m.service}`} desc={`${e.id} ${e.name} · was due ${m.nextDue}`}>
      <div className="gm-coords-grid">
        <label className="gm-label">
          Actual cost (KES)
          <input className="gm-input" value={cost} onChange={(ev) => setCost(ev.target.value)} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Notes
          <input className="gm-input" placeholder="e.g. Oil + filter, 4 quarts" value={note} onChange={(ev) => setNote(ev.target.value)} />
        </label>
      </div>
      <p className="gm-muted mb-0">
        The next due date moves one cycle forward ({m.frequency}) and the cost
        lands on the {e.name} maintenance total.
      </p>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!note.trim()}
          onClick={() => {
            toast.notify(`${m.service} done on ${e.id} — ${kes(Number(cost) || 0)}`);
            onClose();
          }}
        >
          <CircleCheck size={14} /> Mark done
        </button>
      </div>
    </Dialog>
  );
}

export function ScheduleModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const e = eqById(state.equipmentId);
  const [f, setF] = useState({
    service: "",
    frequency: "Monthly",
    nextDue: "Dec 2026",
    cost: "0",
    assigned: "Self",
  });
  return (
    <Dialog open onClose={onClose} title={`Schedule maintenance · ${e.id}`} desc={`${e.name} — joins the 12-task scheduler`}>
      <div className="gm-coords-grid">
        <label className="gm-label">
          Service
          <input className="gm-input" placeholder="e.g. Replace brake pads" value={f.service} onChange={(ev) => setF({ ...f, service: ev.target.value })} />
        </label>
        <label className="gm-label">
          Frequency
          <select className="gm-input" value={f.frequency} onChange={(ev) => setF({ ...f, frequency: ev.target.value })}>
            {["Every use", "Weekly", "Monthly", "Every 100 hrs", "Every 200 hrs", "Every 6 months", "Every season", "Annually", "Before harvest season"].map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Next due
          <input className="gm-input" value={f.nextDue} onChange={(ev) => setF({ ...f, nextDue: ev.target.value })} placeholder="e.g. Dec 2026" />
        </label>
        <label className="gm-label">
          Est. cost (KES)
          <input className="gm-input" value={f.cost} onChange={(ev) => setF({ ...f, cost: ev.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Assigned to
          <select className="gm-input" value={f.assigned} onChange={(ev) => setF({ ...f, assigned: ev.target.value })}>
            {["Self", "Local mechanic", "Dealer", "Mechanic"].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!f.service.trim()}
          onClick={() => {
            toast.notify(`Scheduled: ${f.service} on ${e.id} — due ${f.nextDue}`);
            onClose();
          }}
        >
          <Plus size={14} /> Add to schedule
        </button>
      </div>
    </Dialog>
  );
}

export function MaintReportModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const counts = {
    Overdue: MAINTENANCE.filter((m) => m.status === "Overdue").length,
    Upcoming: MAINTENANCE.filter((m) => m.status === "Upcoming").length,
    OK: MAINTENANCE.filter((m) => m.status === "OK").length,
    Future: MAINTENANCE.filter((m) => m.status === "Future").length,
  };
  const estTotal = MAINTENANCE.reduce((s, m) => s + m.cost, 0);
  return (
    <Dialog open onClose={onClose} title="Maintenance report" desc="All 12 scheduled tasks · costs to close out the season" wide>
      <div className="gm-chiprow">
        <StatusChip label={`${counts.Overdue} overdue`} tone="high" />
        <StatusChip label={`${counts.Upcoming} upcoming`} tone="medium" />
        <StatusChip label={`${counts.OK} OK`} tone="low" />
        <StatusChip label={`${counts.Future} future`} tone="neutral" />
        <StatusChip label={`${kes(estTotal)} est. season cost`} tone="neutral" />
      </div>
      {MAINTENANCE.map((m) => (
        <div key={m.id} className="gm-mach-row">
          <span>
            <strong>
              {eqById(m.equipmentId).name} — {m.service}
            </strong>
            <small>
              {m.frequency} · next {m.nextDue} · {m.assigned}
            </small>
          </span>
          <span className="gm-mach-row-end">
            <StatusChip
              label={m.status}
              tone={m.status === "Overdue" ? "high" : m.status === "Upcoming" ? "medium" : m.status === "OK" ? "low" : "neutral"}
            />
          </span>
        </div>
      ))}
    </Dialog>
  );
}

/* ============================================================================
   20.3 USAGE MODALS
   ========================================================================== */

export function UsageLogModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    equipmentId: state.equipmentId ?? "EQ-001",
    date: "Nov 17",
    activity: "",
    hours: "2",
    fuelL: "0",
    operator: "James (hired operator)",
    plot: "Plot 1",
    notes: "",
  });
  const e = eqById(f.equipmentId);
  if (saved) {
    return (
      <Dialog open onClose={onClose} title="Usage logged">
        <div className="gm-method-done">
          <CircleCheck size={22} />
          <div>
            <strong>
              {f.date} · {e.name} · {f.hours} hrs
            </strong>
            <p className="mb-0">
              {f.activity} — {f.operator} · {f.plot}
              {Number(f.fuelL) > 0 ? ` · ${f.fuelL} L diesel (${kes(Number(f.fuelL) * 195)})` : ""}
            </p>
          </div>
        </div>
        <WizardActions step={0} last={0} onBack={onClose} onNext={onClose} finishLabel="Done" />
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title="Log equipment usage" desc="Hours, fuel and who did the work — feeds the cost/hour analytics" wide>
      <Stepper steps={["Work done", "Confirm"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Equipment
            <select className="gm-input" value={f.equipmentId} onChange={(ev) => setF({ ...f, equipmentId: ev.target.value })}>
              {EQUIPMENT.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.id} · {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Date
            <input className="gm-input" value={f.date} onChange={(ev) => setF({ ...f, date: ev.target.value })} />
          </label>
          <label className="gm-label">
            Activity
            <input className="gm-input" placeholder="e.g. Ploughing Plot 1 — first pass" value={f.activity} onChange={(ev) => setF({ ...f, activity: ev.target.value })} />
          </label>
          <label className="gm-label">
            Hours
            <input className="gm-input" value={f.hours} onChange={(ev) => setF({ ...f, hours: ev.target.value })} inputMode="decimal" />
          </label>
          <label className="gm-label">
            Fuel used (L)
            <input className="gm-input" value={f.fuelL} onChange={(ev) => setF({ ...f, fuelL: ev.target.value })} inputMode="decimal" />
          </label>
          <label className="gm-label">
            Operator
            <select className="gm-input" value={f.operator} onChange={(ev) => setF({ ...f, operator: ev.target.value })}>
              {["James (hired operator)", "Mary Wanjiku", "John Mwangi", "Peter Kamau", "Workers"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Plot
            <select className="gm-input" value={f.plot} onChange={(ev) => setF({ ...f, plot: ev.target.value })}>
              {["Plot 1", "Plot 2", "Plot 3", "Plot 4", "Greenhouse", "Around the farm"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Notes
            <input className="gm-input" placeholder="e.g. 2 passes, stony patch near the stream" value={f.notes} onChange={(ev) => setF({ ...f, notes: ev.target.value })} />
          </label>
        </div>
      )}
      {step === 1 && (
        <div className="gm-review-box">
          <h5>Review the entry</h5>
          <ul className="mb-0">
            <li>
              {f.date} · {e.id} {e.name}
            </li>
            <li>{f.activity}</li>
            <li>
              {f.hours} hrs · {Number(f.fuelL) > 0 ? `${f.fuelL} L ≈ ${kes(Number(f.fuelL) * 195)}` : "no fuel"} · {f.operator} · {f.plot}
            </li>
            {f.notes ? <li>“{f.notes}”</li> : null}
          </ul>
        </div>
      )}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => {
          setSaved(true);
          toast.notify(`Usage logged: ${e.id}, ${f.hours} hrs`);
        }}
        nextDisabled={step === 0 ? !f.activity.trim() : false}
        finishLabel="Save log entry"
      />
    </Dialog>
  );
}

export function UsageReportModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const totalHours = USAGE_LOG.reduce((s, u) => s + u.hours, 0);
  const totalFuel = USAGE_LOG.reduce((s, u) => s + u.fuelL, 0);
  return (
    <Dialog open onClose={onClose} title="Usage report · October 2026" desc="What ran, for how long, and what it cost" wide>
      <div className="gm-chiprow">
        <StatusChip label={`${USAGE_LOG.length} entries`} tone="neutral" />
        <StatusChip label={`${totalHours} hrs total`} tone="neutral" />
        <StatusChip label={`${totalFuel} L diesel · ${kes(totalFuel * 195)}`} tone="neutral" />
      </div>
      {USAGE_ANALYTICS.map((r) => (
        <div key={r.label} className="gm-mach-row">
          <span>
            <strong>{r.label}</strong>
            <small>
              {r.hoursMonth} hrs this month · {r.hoursYear} this year · {kes(r.costHour)}/hr
            </small>
          </span>
          <small className="gm-mach-row-end">{r.revenue}</small>
        </div>
      ))}
    </Dialog>
  );
}

/* ============================================================================
   20.4 HIRE MODALS + MARKETPLACE
   ========================================================================== */

export function HireInModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [paidRef, setPaidRef] = useState("");
  const [f, setF] = useState({
    equipment: "Tractor + rotavator",
    owner: "",
    ownerPhone: "",
    rate: "KES 4,500/acre",
    duration: "1 acre, 3 hrs",
    purpose: "",
    totalCost: "4500",
  });
  if (paidRef !== "") {
    return (
      <Dialog open onClose={onClose} title="Hire-in booked & paid">
        <div className="gm-method-done">
          <CircleCheck size={22} />
          <div>
            <strong>
              {f.equipment} from {f.owner} — {kes(Number(f.totalCost) || 0)} paid (ref {paidRef})
            </strong>
            <p className="mb-0">
              {f.purpose} · {f.duration}. The cost sits on this month's hire-in total.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`Hire-in paid: ${f.owner}, ${kes(Number(f.totalCost) || 0)}`); onClose(); }}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title="Hire equipment in" desc="Rent a machine from a neighbour or AgriHire — pay by M-Pesa" wide>
      <Stepper steps={["Details", "Pay"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Equipment
            <select className="gm-input" value={f.equipment} onChange={(ev) => setF({ ...f, equipment: ev.target.value })}>
              {["Tractor + rotavator", "Tractor + plough", "Sprayer boom (tractor-mounted)", "Water tank 5,000L", "Greenhouse sheets", "Boda-boda (day)"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Owner
            <input className="gm-input" placeholder="e.g. Kariuki Farms" value={f.owner} onChange={(ev) => setF({ ...f, owner: ev.target.value })} />
          </label>
          <label className="gm-label">
            Owner phone
            <input className="gm-input" placeholder="07XX XXX XXX" value={f.ownerPhone} onChange={(ev) => setF({ ...f, ownerPhone: ev.target.value })} />
          </label>
          <label className="gm-label">
            Rate
            <input className="gm-input" value={f.rate} onChange={(ev) => setF({ ...f, rate: ev.target.value })} />
          </label>
          <label className="gm-label">
            Duration
            <input className="gm-input" value={f.duration} onChange={(ev) => setF({ ...f, duration: ev.target.value })} />
          </label>
          <label className="gm-label">
            Purpose
            <input className="gm-input" placeholder="e.g. Land prep Plot 1" value={f.purpose} onChange={(ev) => setF({ ...f, purpose: ev.target.value })} />
          </label>
          <label className="gm-label">
            Total cost (KES)
            <input className="gm-input" value={f.totalCost} onChange={(ev) => setF({ ...f, totalCost: ev.target.value })} inputMode="numeric" />
          </label>
        </div>
      )}
      {step === 1 && (
        <>
          <div className="gm-review-box">
            <h5>Review the hire</h5>
            <ul className="mb-0">
              <li>
                {f.equipment} · {f.rate} · {f.duration}
              </li>
              <li>
                Owner: {f.owner || "—"} {f.ownerPhone ? `(${f.ownerPhone})` : ""}
              </li>
              <li>{f.purpose}</li>
            </ul>
          </div>
          <MpesaConfirm amount={Number(f.totalCost) || 0} detail={`Hire-in · ${f.owner || f.equipment}`} onPaid={setPaidRef} />
        </>
      )}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => setStep(1)}
        nextDisabled={step === 0 ? !f.owner.trim() || !f.purpose.trim() : false}
        nextLabel="Continue to pay"
        finishLabel="Waiting for PIN"
      />
    </Dialog>
  );
}

export function HireOutModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [f, setF] = useState({
    equipmentId: state.equipmentId ?? "EQ-001",
    hirer: "",
    hirerPhone: "",
    rate: "KES 2,000/hr",
    duration: "2 hrs",
    income: "4000",
    expectPay: "M-Pesa",
  });
  if (saved) {
    const e = eqById(f.equipmentId);
    return (
      <Dialog open onClose={onClose} title="Hire-out recorded">
        <div className="gm-method-done">
          <CircleCheck size={22} />
          <div>
            <strong>
              {e.name} → {f.hirer} · {kes(Number(f.income) || 0)}
            </strong>
            <p className="mb-0">
              {f.rate} · {f.duration} · expecting {f.expectPay}. Income is pending until collected.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`Hire-out recorded: ${kes(Number(f.income) || 0)} pending`); onClose(); }}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  const e = eqById(f.equipmentId);
  return (
    <Dialog open onClose={onClose} title="Record hire-out" desc="Someone hired your equipment — log the deal and the money owed" wide>
      <Stepper steps={["Deal", "Confirm"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Equipment
            <select className="gm-input" value={f.equipmentId} onChange={(ev) => setF({ ...f, equipmentId: ev.target.value })}>
              {EQUIPMENT.filter((x) => x.status === "Operational").map((x) => (
                <option key={x.id} value={x.id}>
                  {x.id} · {x.name}
                </option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Hirer
            <input className="gm-input" placeholder="e.g. Kamau (Kariuki road)" value={f.hirer} onChange={(ev) => setF({ ...f, hirer: ev.target.value })} />
          </label>
          <label className="gm-label">
            Hirer phone
            <input className="gm-input" placeholder="07XX XXX XXX" value={f.hirerPhone} onChange={(ev) => setF({ ...f, hirerPhone: ev.target.value })} />
          </label>
          <label className="gm-label">
            Rate
            <input className="gm-input" value={f.rate} onChange={(ev) => setF({ ...f, rate: ev.target.value })} />
          </label>
          <label className="gm-label">
            Duration
            <input className="gm-input" value={f.duration} onChange={(ev) => setF({ ...f, duration: ev.target.value })} />
          </label>
          <label className="gm-label">
            Income (KES)
            <input className="gm-input" value={f.income} onChange={(ev) => setF({ ...f, income: ev.target.value })} inputMode="numeric" />
          </label>
          <label className="gm-label">
            Expect payment by
            <select className="gm-input" value={f.expectPay} onChange={(ev) => setF({ ...f, expectPay: ev.target.value })}>
              <option>M-Pesa</option>
              <option>Cash</option>
              <option>Family, no charge</option>
            </select>
          </label>
        </div>
      )}
      {step === 1 && (
        <div className="gm-review-box">
          <h5>Review</h5>
          <ul className="mb-0">
            <li>
              {e.id} {e.name} → {f.hirer || "—"} {f.hirerPhone ? `(${f.hirerPhone})` : ""}
            </li>
            <li>
              {f.rate} · {f.duration}
            </li>
            <li>
              Income {kes(Number(f.income) || 0)} · {f.expectPay}
            </li>
          </ul>
        </div>
      )}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => {
          setSaved(true);
          toast.notify(`Hire-out: ${f.hirer} — ${kes(Number(f.income) || 0)}`);
        }}
        nextDisabled={step === 0 ? !f.hirer.trim() : false}
        finishLabel="Record deal"
      />
    </Dialog>
  );
}

export function HireReceiptModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const h = hireOutOf(state.hireOutId);
  const [method, setMethod] = useState<"M-Pesa" | "Cash">("M-Pesa");
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <Dialog open onClose={onClose} title="Payment collected">
        <div className="gm-method-done">
          <CircleCheck size={22} />
          <div>
            <strong>
              {kes(h.income)} received from {h.hirer} via {method}
            </strong>
            <p className="mb-0">
              Reference {method === "M-Pesa" ? "QF884213" : "cash receipt #41"} · hire-out marked paid and completed.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`${kes(h.income)} collected from ${h.hirer}`); onClose(); }}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title={`Collect · ${h.hirer}`} desc={`${h.rate} · ${h.duration} — ${kes(h.income)} owed since ${h.date}`}>
      <div className="gm-chip-picks">
        <button type="button" className={`gm-chip-pick ${method === "M-Pesa" ? "on" : ""}`} aria-pressed={method === "M-Pesa"} onClick={() => setMethod("M-Pesa")}>
          M-Pesa {h.hirerPhone}
        </button>
        <button type="button" className={`gm-chip-pick ${method === "Cash" ? "on" : ""}`} aria-pressed={method === "Cash"} onClick={() => setMethod("Cash")}>
          Cash
        </button>
      </div>
      {method === "M-Pesa" && (
        <p className="gm-muted">
          You send the STK push to {h.hirerPhone}; we mark it received when the
          confirmation arrives.
        </p>
      )}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => setDone(true)}>
          <HandCoins size={14} /> Mark as {method === "M-Pesa" ? "push sent" : "cash received"}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- rate card ---------- */

function RateForm({
  initial,
  onSave,
  onClose,
}: {
  initial: RateCardRow | null;
  onSave: () => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    equipmentId: initial?.equipmentId ?? "EQ-001",
    label: initial?.label ?? "",
    rateType: initial?.rateType ?? "Per hour",
    rate: String(initial?.rate ?? 2000),
    minHire: initial?.minHire ?? "2 hours",
    includes: initial?.includes ?? "Operator + fuel",
    location: initial?.location ?? "My farm or within 10 km",
  });
  return (
    <>
      <div className="gm-coords-grid">
        <label className="gm-label">
          Equipment
          <select className="gm-input" value={f.equipmentId} onChange={(ev) => setF({ ...f, equipmentId: ev.target.value })}>
            {EQUIPMENT.map((x) => (
              <option key={x.id} value={x.id}>
                {x.id} · {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Listing label
          <input className="gm-input" placeholder="e.g. MF 35 + Plough" value={f.label} onChange={(ev) => setF({ ...f, label: ev.target.value })} />
        </label>
        <label className="gm-label">
          Rate type
          <select className="gm-input" value={f.rateType} onChange={(ev) => setF({ ...f, rateType: ev.target.value })}>
            {["Per hour", "Per acre", "Per trip", "Per day", "Per season"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Rate (KES)
          <input className="gm-input" value={f.rate} onChange={(ev) => setF({ ...f, rate: ev.target.value })} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Minimum hire
          <input className="gm-input" value={f.minHire} onChange={(ev) => setF({ ...f, minHire: ev.target.value })} />
        </label>
        <label className="gm-label">
          Includes
          <select className="gm-input" value={f.includes} onChange={(ev) => setF({ ...f, includes: ev.target.value })}>
            {["Operator + fuel", "Fuel only", "—"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Location
          <select className="gm-input" value={f.location} onChange={(ev) => setF({ ...f, location: ev.target.value })}>
            {["My farm or within 10 km", "Within 10 km", "My farm only", "Self-collect"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!f.label.trim() || Number(f.rate) <= 0} onClick={onSave}>
          <Gavel size={14} /> Save rate
        </button>
      </div>
    </>
  );
}

export function RateEditModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const r = rateOf(state.rateId);
  return (
    <Dialog open onClose={onClose} title={`Edit rate · ${r.label}`} desc="The rate card is public on your GrowMO profile" wide>
      <RateForm
        initial={r}
        onClose={onClose}
        onSave={() => {
          toast.notify(`Rate updated: ${r.label}`);
          onClose();
        }}
      />
    </Dialog>
  );
}

export function RateAddModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  return (
    <Dialog open onClose={onClose} title="Add a rate" desc="New row on your hire-out rate card" wide>
      <RateForm
        initial={null}
        onClose={onClose}
        onSave={() => {
          toast.notify("Rate added to the rate card");
          onClose();
        }}
      />
    </Dialog>
  );
}

/* ---------- marketplace ---------- */

export function PublishModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<"form" | "work" | "done">("form");
  const [f, setF] = useState({
    equipmentId: state.equipmentId ?? "EQ-001",
    title: "MF 35 + 3-disc plough — ploughing by the acre",
    rate: "3500",
    rateType: "Per acre",
    minHire: "0.5 acre",
    includes: "Operator + fuel",
    location: "Within 10 km",
    photo: "MF 35 with plough, Kariuki road",
  });
  if (stage === "work") {
    return (
      <Dialog open onClose={onClose} dismissable={false} title="Publishing to the marketplace">
        <SimWork label="Checking availability, writing the listing, notifying 240 farmers within 25 km…" ms={1900} onDone={() => setStage("done")} />
      </Dialog>
    );
  }
  if (stage === "done") {
    return (
      <Dialog open onClose={onClose} title="Live on the marketplace">
        <div className="gm-method-done">
          <Store size={22} />
          <div>
            <strong>ML-02 · {f.title}</strong>
            <p className="mb-0">
              {kes(Number(f.rate) || 0)}/{f.rateType.replace("Per ", "").replace(" hour", "hr")} · min {f.minHire} · visible to 240 farmers
              within 25 km of Githunguri. Bookings land in your Inbox.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify("Listing ML-02 is live"); onClose(); }}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title="Publish on the GrowMO Equipment Marketplace" desc="Neighbouring farmers see the listing and book by message" wide>
      <Stepper steps={["Equipment", "Terms", "Review"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-pick-list">
          {["EQ-001", "EQ-004", "EQ-006", "EQ-005"].map((id) => {
            const x = eqById(id);
            return (
              <button key={id} type="button" className={`gm-pick-card ${f.equipmentId === id ? "on" : ""}`} aria-pressed={f.equipmentId === id} onClick={() => setF({ ...f, equipmentId: id })}>
                <span className="gm-mach-cat-ic">{categoryIcon(x.category)}</span>
                <span>
                  <strong>{x.name}</strong>
                  <small>
                    {x.id} · {x.condition} · {x.status}
                  </small>
                </span>
                {f.equipmentId === id && <CircleCheck size={17} />}
              </button>
            );
          })}
        </div>
      )}
      {step === 1 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Title
            <input className="gm-input" value={f.title} onChange={(ev) => setF({ ...f, title: ev.target.value })} />
          </label>
          <label className="gm-label">
            Rate type
            <select className="gm-input" value={f.rateType} onChange={(ev) => setF({ ...f, rateType: ev.target.value })}>
              {["Per hour", "Per acre", "Per trip", "Per day", "Per season"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Rate (KES)
            <input className="gm-input" value={f.rate} onChange={(ev) => setF({ ...f, rate: ev.target.value })} inputMode="numeric" />
          </label>
          <label className="gm-label">
            Minimum hire
            <input className="gm-input" value={f.minHire} onChange={(ev) => setF({ ...f, minHire: ev.target.value })} />
          </label>
          <label className="gm-label">
            Includes
            <select className="gm-input" value={f.includes} onChange={(ev) => setF({ ...f, includes: ev.target.value })}>
              {["Operator + fuel", "Fuel only", "—"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Location
            <select className="gm-input" value={f.location} onChange={(ev) => setF({ ...f, location: ev.target.value })}>
              {["My farm or within 10 km", "Within 10 km", "My farm only", "Self-collect"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Photo caption
            <input className="gm-input" value={f.photo} onChange={(ev) => setF({ ...f, photo: ev.target.value })} />
          </label>
        </div>
      )}
      {step === 2 && (
        <div className="gm-review-box">
          <h5>Review the listing</h5>
          <ul className="mb-0">
            <li>{f.title}</li>
            <li>
              {kes(Number(f.rate) || 0)}/{f.rateType.replace("Per ", "").replace(" hour", "hr")} · min {f.minHire}
            </li>
            <li>
              {f.includes} · {f.location}
            </li>
            <li>Photo: {f.photo}</li>
          </ul>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => Math.max(0, s - 1))}
        onNext={() => {
          if (step === 2) setStage("work");
          else setStep((s) => s + 1);
        }}
        nextDisabled={step === 1 ? !f.title.trim() || Number(f.rate) <= 0 : false}
        finishLabel="Publish listing"
      />
    </Dialog>
  );
}

export function DelistModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const l = marketOf(state.listingId);
  return (
    <Dialog open onClose={onClose} title={`Delist · ${l.title}`} desc="Existing bookings are honoured; new bookings stop immediately.">
      <p className="gm-muted mb-3">
        {l.views} views and {l.bookings} bookings this season will stay on your
        profile. You can re-publish the same terms in one tap.
      </p>
      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Keep listed
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger"
          onClick={() => {
            toast.notify(`${l.id} delisted from the marketplace`);
            onClose();
          }}
        >
          <Trash2 size={14} /> Delist
        </button>
      </div>
    </Dialog>
  );
}

export function ListingModal({ state, onClose, onOpen }: { state: ModalState; onClose: () => void; onOpen: (s: ModalState) => void }) {
  const l = marketOf(state.listingId);
  const e = eqById(l.equipmentId);
  return (
    <Dialog open onClose={onClose} title={`Marketplace listing · ${l.id}`}>
      <div className="gm-listing-detail">
        <span className="gm-listing-photo gm-listing-photo-lg">{categoryIcon(e.category)}</span>
        <div>
          <strong>{l.title}</strong>
          <small>
            {l.rate} · listed {l.listed} · {l.status}
          </small>
        </div>
      </div>
      <dl className="gm-facts">
        <Field k="Equipment" v={`${e.id} · ${e.name}`} />
        <Field k="Views" v={String(l.views)} />
        <Field k="Bookings" v={String(l.bookings)} />
        <Field k="Photo" v={l.photo} />
        <Field k="Reach" v="240 farmers within 25 km of Githunguri" />
        <Field k="Payment" v="M-Pesa on completion, through GrowMO" />
      </dl>
      <div className="gm-method-cta gm-rowwrap">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => onOpen({ kind: "equipment", equipmentId: e.id })}>
          View equipment
        </button>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- contact ---------- */

export function ContactModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const name = state.contactName ?? "Contact";
  const phone = state.contactPhone ?? "07XX XXX XXX";
  return (
    <Dialog open onClose={onClose} title={name} desc="Saved on this equipment record">
      <div className="gm-contact-card">
        <span className="gm-contact-ic">
          <Phone size={18} />
        </span>
        <div>
          <strong>{phone}</strong>
          <small>Githunguri, Kiambu · responds in the morning</small>
        </div>
      </div>
      <div className="gm-method-cta gm-rowwrap">
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => toast.notify(`Calling ${name} on ${phone}…`)}>
          <Phone size={14} /> Call
        </button>
        <button type="button" className="gm-btn gm-btn-outline" onClick={() => toast.notify(`SMS draft opened: “Habari ${name.split(" ")[0]} — about the equipment”`)}>
          Message
        </button>
      </div>
    </Dialog>
  );
}

/* ---------- marketplace lookup ---------- */

const marketOf = (id?: string): MarketListing =>
  MARKET_LISTINGS.find((l) => l.id === id) ?? MARKET_LISTINGS[0];

/* ============================================================================
   20.5 FUEL MODALS
   ========================================================================== */

export function FuelLogModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [paidRef, setPaidRef] = useState("");
  const [f, setF] = useState({
    equipmentId: state.equipmentId ?? "EQ-001",
    date: "Nov 17",
    litres: "10",
    pricePerL: "195",
    receipt: "Yes — photographed",
  });
  const total = Math.round((Number(f.litres) || 0) * (Number(f.pricePerL) || 0));
  if (paidRef !== "") {
    const e = eqById(f.equipmentId);
    return (
      <Dialog open onClose={onClose} title="Fuel paid & logged">
        <div className="gm-method-done">
          <Fuel size={22} />
          <div>
            <strong>
              {f.litres} L diesel · {kes(total)} (ref {paidRef})
            </strong>
            <p className="mb-0">
              Logged on {e.id} · {f.date} · receipt {f.receipt.toLowerCase()}.
              Month total now {kes(6825 + total)}.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => { toast.notify(`Fuel logged: ${f.litres} L, ${kes(total)}`); onClose(); }}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title="Log fuel" desc="Fill-up → M-Pesa → the efficiency tracker updates automatically" wide>
      <Stepper steps={["Fill-up", "Pay"]} current={step} onStep={setStep} />
      {step === 0 && (
        <div className="gm-coords-grid">
          <label className="gm-label">
            Equipment
            <select className="gm-input" value={f.equipmentId} onChange={(ev) => setF({ ...f, equipmentId: ev.target.value })}>
              {EQUIPMENT.filter((x) => x.fuelType !== "Manual").map((x) => (
                <option key={x.id} value={x.id}>
                  {x.id} · {x.name} ({x.fuelType})
                </option>
              ))}
            </select>
          </label>
          <label className="gm-label">
            Date
            <input className="gm-input" value={f.date} onChange={(ev) => setF({ ...f, date: ev.target.value })} />
          </label>
          <label className="gm-label">
            Quantity (L)
            <input className="gm-input" value={f.litres} onChange={(ev) => setF({ ...f, litres: ev.target.value })} inputMode="decimal" />
          </label>
          <label className="gm-label">
            Price / L (KES)
            <input className="gm-input" value={f.pricePerL} onChange={(ev) => setF({ ...f, pricePerL: ev.target.value })} inputMode="numeric" />
          </label>
          <label className="gm-label">
            Receipt
            <select className="gm-input" value={f.receipt} onChange={(ev) => setF({ ...f, receipt: ev.target.value })}>
              <option>Yes — photographed</option>
              <option>No receipt</option>
            </select>
          </label>
        </div>
      )}
      {step === 1 && (
        <>
          <div className="gm-review-box">
            <h5>Review the fill-up</h5>
            <ul className="mb-0">
              <li>
                {f.date} · {eqById(f.equipmentId).name}
              </li>
              <li>
                {f.litres} L × {kes(Number(f.pricePerL) || 0)} = <strong>{kes(total)}</strong>
              </li>
            </ul>
          </div>
          <MpesaConfirm amount={total} detail={`Fuel · ${f.litres} L diesel · Githunguri station`} onPaid={setPaidRef} />
        </>
      )}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => setStep(1)}
        nextDisabled={step === 0 ? Number(f.litres) <= 0 : false}
        nextLabel="Continue to pay"
        finishLabel="Waiting for PIN"
      />
    </Dialog>
  );
}

export function FuelReportModal({ onClose }: { state: ModalState; onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="Fuel & energy report" desc="October 2026 · diesel only — the solar pump and electric tools run on sun and grid" wide>
      <div className="gm-chiprow">
        <StatusChip label={`${FUEL_MONTH_TOTAL.litres} L this month`} tone="neutral" />
        <StatusChip label={`${kes(FUEL_MONTH_TOTAL.total)} spent`} tone="neutral" />
        <StatusChip label="5.83 L/hr — 17% above standard" tone="high" />
      </div>
      <p className="gm-muted">
        The MF 35 is rated at {MACH_CONTEXT.standardFuelLph} L/hr. October ran
        5.83 — at 35 L that is about {kes(Math.round(35 * 0.83 * 195))} of extra
        diesel. Likely culprits: the worn air filter, low tire pressure, or a
        dragging brake. Check them in that order before the December ploughing.
      </p>
      <div className="gm-method-cta">
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

/* ============================================================================
   20.6 DEPRECIATION + ASSETS
   ========================================================================== */

export function DepreciationModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
  const e = eqById(state.equipmentId ?? "EQ-001");
  const tracked = DEPRECIATION.find((d) => d.equipmentId === e.id);
  const [purchase, setPurchase] = useState(String(tracked?.purchasePrice ?? e.purchasePrice));
  const [life, setLife] = useState(String(tracked?.usefulLife ?? e.usefulLife));
  const [age, setAge] = useState(String(tracked?.ageYears ?? "1"));
  const [method, setMethod] = useState("Straight line");
  const p = Number(purchase) || 0;
  const yrs = Number(life) || 1;
  const a = Math.min(Number(age) || 0, yrs);
  const straight = Math.max(0, p - (p / yrs) * a);
  const declining = p * Math.pow(0.75, a);
  const book = method === "Declining balance" ? declining : straight;
  const market = Math.round(book * 1.15);
  return (
    <Dialog open onClose={onClose} title={`Depreciation calculator · ${e.id}`} desc="Straight line spreads the cost evenly; declining balance front-loads it (25%/yr).">
      <div className="gm-coords-grid">
        <label className="gm-label">
          Purchase price (KES)
          <input className="gm-input" value={purchase} onChange={(ev) => setPurchase(ev.target.value)} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Useful life (yrs)
          <input className="gm-input" value={life} onChange={(ev) => setLife(ev.target.value)} inputMode="numeric" />
        </label>
        <label className="gm-label">
          Method
          <select className="gm-input" value={method} onChange={(ev) => setMethod(ev.target.value)}>
            {DEPR_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label className="gm-label">
          Current age (yrs) — {a.toFixed(1)}
          <input type="range" min="0" max={yrs} step="0.1" value={a} onChange={(ev) => setAge(ev.target.value)} aria-label="Current age" />
        </label>
      </div>
      <div className="gm-dep-result">
        <div>
          <small>Book value</small>
          <strong className="font-display">{kes(Math.round(book))}</strong>
        </div>
        <div>
          <small>Market estimate</small>
          <strong className="font-display">{kes(market)}</strong>
        </div>
        <div>
          <small>% of cost kept</small>
          <strong className="font-display">{Math.round((book / (p || 1)) * 100)}%</strong>
        </div>
      </div>
      <ProgressLine value={Math.round((book / (p || 1)) * 100)} label="Book value kept" />
      <p className="gm-muted mb-0">
        {method === "Straight line"
          ? `${kes(Math.round(p / yrs))} written off per year for ${yrs} years.`
          : `25% of the remaining value written off each year — faster, tax-friendlier for early years.`}
      </p>
    </Dialog>
  );
}

export function AssetsReportModal({ onClose, onOpen }: { state: ModalState; onClose: () => void; onOpen: (s: ModalState) => void }) {
  const totals = DEPRECIATION.reduce(
    (acc, r) => ({ purchase: acc.purchase + r.purchasePrice, book: acc.book + r.bookValue, market: acc.market + r.marketValue }),
    { purchase: 0, book: 0, market: 0 },
  );
  return (
    <Dialog open onClose={onClose} title="Asset valuation report" desc="The 4 tracked assets · straight line · as at 17/11/2026" wide>
      {DEPRECIATION.map((r) => (
        <button key={r.equipmentId} type="button" className="gm-mach-row gm-mach-row-click" onClick={() => onOpen({ kind: "equipment", equipmentId: r.equipmentId })}>
          <span>
            <strong>{r.name}</strong>
            <small>
              bought {r.purchaseDate} for {kes(r.purchasePrice)} · {r.usefulLife}-yr life
            </small>
          </span>
          <span className="gm-mach-row-end">
            <strong>{kes(r.marketValue)}</strong>
            <small>book {kes(r.bookValue)}</small>
          </span>
        </button>
      ))}
      <div className="gm-dep-result">
        <div>
          <small>Total purchase</small>
          <strong className="font-display">{kes(totals.purchase)}</strong>
        </div>
        <div>
          <small>Total book</small>
          <strong className="font-display">{kes(totals.book)}</strong>
        </div>
        <div>
          <small>Total market</small>
          <strong className="font-display">{kes(totals.market)}</strong>
        </div>
      </div>
      <p className="gm-muted mb-0">
        The other {EQUIPMENT.length - DEPRECIATION.length} items (tools, drip kit,
        tank) are carried at registry values — {kes(EQUIPMENT_TOTAL_VALUE - totals.market)} in
        total — and depreciated informally.
      </p>
    </Dialog>
  );
}

/* ---------- export ---------- */

export function ExportModal({ onClose }: { state: ModalState; onClose: () => void }) {
  const [fmt, setFmt] = useState<"csv" | "maint" | "asset">("asset");
  const [stage, setStage] = useState<"pick" | "work" | "done">("pick");
  const names = {
    csv: "growmo-equipment-registry-17-11-2026.csv",
    maint: "growmo-maintenance-report-17-11-2026.pdf",
    asset: "growmo-asset-valuation-17-11-2026.pdf",
  };
  if (stage === "work") {
    return (
      <Dialog open onClose={onClose} dismissable={false} title="Generating export">
        <SimWork label={`Assembling ${names[fmt]}…`} ms={1700} onDone={() => setStage("done")} />
      </Dialog>
    );
  }
  if (stage === "done") {
    return (
      <Dialog open onClose={onClose} title="Export ready">
        <div className="gm-method-done">
          <Download size={22} />
          <div>
            <strong>{names[fmt]}</strong>
            <p className="mb-0">
              Saved to your GrowMO files ·{" "}
              {fmt === "csv"
                ? `${EQUIPMENT.length} rows × 24 fields — open in Excel or Sheets`
                : fmt === "maint"
                  ? "12 tasks with costs, owners and due dates, A3 landscape"
                  : "4 tracked assets + registry totals, 2 pages"}.
            </p>
          </div>
        </div>
        <div className="gm-method-cta">
          <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
            Done
          </button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open onClose={onClose} title="Export from the machinery page">
      <div className="gm-export-list">
        <button type="button" className={`gm-export-card ${fmt === "asset" ? "on" : ""}`} aria-pressed={fmt === "asset"} onClick={() => setFmt("asset")}>
          <ScanSearch size={18} />
          <span>
            <strong>Asset valuation (PDF)</strong>
            <small>4 tracked assets, book vs market, season totals.</small>
          </span>
        </button>
        <button type="button" className={`gm-export-card ${fmt === "csv" ? "on" : ""}`} aria-pressed={fmt === "csv"} onClick={() => setFmt("csv")}>
          <FileSpreadsheet size={18} />
          <span>
            <strong>Equipment registry (CSV)</strong>
            <small>All 15 items × 24 fields — the full 20.1 table.</small>
          </span>
        </button>
        <button type="button" className={`gm-export-card ${fmt === "maint" ? "on" : ""}`} aria-pressed={fmt === "maint"} onClick={() => setFmt("maint")}>
          <FileJson size={18} />
          <span>
            <strong>Maintenance report (PDF)</strong>
            <small>12 tasks, costs and owners — print for the mechanic.</small>
          </span>
        </button>
      </div>
      <div className="gm-method-cta">
        <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStage("work")}>
          <Download size={14} /> Generate {fmt === "csv" ? "CSV" : "PDF"}
        </button>
      </div>
    </Dialog>
  );
}
