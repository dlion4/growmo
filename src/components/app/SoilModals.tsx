/* ============================================================================
   PAGE 17 WORKFLOWS — soil testing, interpretation, fertilizer plans, moisture.

   Every dialog completes a real action: a booked lab test paid by M-Pesa, a
   saved sampling guide, a limestone/manure/compost application written into the
   records, a season fertilizer programme exported, a moisture reading logged,
   a sensor installed or a set of results shared under a time-limited link.
   ========================================================================== */
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Droplets,
  FlaskConical,
  HelpCircle,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Microscope,
  Mountain,
  Package,
  Phone,
  Plus,
  Printer,
  Send,
  Share2,
  Smartphone,
  Sprout,
  Star,
  Thermometer,
  Timer,
  Truck,
  Wifi,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Dialog, OtpInput, Stepper, Toggle } from "../auth/controls";
import type {
  CompostBatch,
  FertilizerStep,
  MoistureWeek,
  ScoreComponent,
  SoilHistoryRow,
  SoilLab,
  SoilOrder,
  SoilParameter,
  SoilPlot,
  SoilPractice,
  SoilProduct,
  SoilSensor,
  SkippedInput,
} from "../../data/app/soil";
import {
  FEEL_METHOD_SCALE,
  LIME_RATE_TABLE,
  SAMPLING_KIT,
  SAMPLING_STEPS,
  SOIL_CONTEXT,
  SOIL_LABS,
  SOIL_PLOTS,
  SOIL_SETTINGS,
  SOIL_TEST_TYPES,
} from "../../data/app/soil";
import { kes } from "../../data/site";

export type TrendPoint = { id: string; label: string; value: number; note?: string };

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

/* ------------------------------------------------------------ local fields */

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="gm-field">
      <span className="gm-field-label">{label}</span>
      {children}
      {hint ? <small className="text-muted d-block mt-1">{hint}</small> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="gm-input"
      value={value}
      type={type}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function StaticField({ value }: { value: string }) {
  return <input className="gm-input" value={value} readOnly aria-readonly="true" />;
}

type SelectOption = string | { value: string; label: string };

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <select className="gm-select" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        );
      })}
    </select>
  );
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Callout({
  icon: Icon = FlaskConical,
  title,
  body,
  tone = "info",
}: {
  icon?: typeof FlaskConical;
  title: string;
  body: string;
  tone?: "info" | "warn" | "good";
}) {
  return (
    <div className={`gm-soil-callout tone-${tone}`}>
      <Icon />
      <span>
        <strong>{title}</strong>
        <small>{body}</small>
      </span>
    </div>
  );
}

function SuccessState({
  title,
  body,
  receipt,
  actionLabel,
  onDone,
}: {
  title: string;
  body: string;
  receipt?: string;
  actionLabel: string;
  onDone: () => void;
}) {
  return (
    <div className="gm-soil-stack">
      <div className="gm-soil-success">
        <span className="gm-soil-success-mark">
          <CheckCircle2 />
        </span>
        <h4 className="font-display mb-1">{title}</h4>
        <p className="text-muted mb-2">{body}</p>
        {receipt ? (
          <div className="gm-soil-receipt">
            <small>M-Pesa reference</small>
            <strong>{receipt}</strong>
          </div>
        ) : null}
      </div>
      <button type="button" className="gm-btn gm-btn-lime w-100" onClick={onDone}>
        {actionLabel}
      </button>
    </div>
  );
}

function PayPanel({
  amount,
  purpose,
  payee,
  onPaid,
}: {
  amount: number;
  purpose: string;
  payee: string;
  onPaid: (receipt: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");

  useEffect(() => {
    setOtp("");
    setReceipt("");
    setProcessing(false);
  }, [amount, purpose]);

  if (receipt) {
    return (
      <SuccessState
        title="Payment confirmed"
        body={`${kes(amount)} paid for ${purpose}.`}
        receipt={receipt}
        actionLabel="Continue"
        onDone={() => onPaid(receipt)}
      />
    );
  }

  return (
    <div className="gm-soil-stack">
      <div className="gm-soil-pay">
        <Smartphone />
        <span>
          <strong>
            {kes(amount)} to {payee}
          </strong>
          <small>M-Pesa {SOIL_CONTEXT.phone} · GrowMO wallet · charges covered</small>
        </span>
      </div>
      {processing ? (
        <div className="gm-soil-processing">
          <LoaderCircle />
          <strong>Waiting for M-Pesa confirmation…</strong>
          <small>Keep the app open. The receipt appears the moment it clears.</small>
        </div>
      ) : (
        <>
          <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
          <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => setOtp("123456")}>
            Use demo OTP
          </button>
        </>
      )}
      <button
        type="button"
        className="gm-btn gm-btn-lime w-100"
        disabled={otp.length !== 6 || processing}
        onClick={() => {
          setProcessing(true);
          window.setTimeout(() => {
            setProcessing(false);
            setReceipt(`QK${(amount * 3) % 9971}PL${purpose.length % 9}`);
          }, 1200);
        }}
      >
        <LockKeyhole /> Confirm payment
      </button>
      <small className="text-center text-muted">
        Simulated M-Pesa confirmation — no real money moves in this demo.
      </small>
    </div>
  );
}

/* =========================== 17.1 scheduler ============================= */

export function BookTestWizard({
  open,
  presetPlotId,
  presetLabId,
  onClose,
  onBooked,
}: {
  open: boolean;
  presetPlotId?: string;
  presetLabId?: string;
  onClose: () => void;
  onBooked: (summary: {
    plot: string;
    type: string;
    lab: string;
    cost: number;
    receipt: string;
    collection?: string;
  }) => void;
}) {
  const [step, setStep] = useState(0);
  const [plotId, setPlotId] = useState(presetPlotId ?? SOIL_PLOTS[0].id);
  const [typeId, setTypeId] = useState(SOIL_TEST_TYPES[1].id);
  const [labId, setLabId] = useState(presetLabId ?? SOIL_LABS[0].id);
  const [zones, setZones] = useState("1 zone (uniform plot)");
  const [depth, setDepth] = useState("0 – 20 cm (topsoil)");
  const [collection, setCollection] = useState("Drop at the lab");
  const [date, setDate] = useState("2026-09-22");
  const [notes, setNotes] = useState("");
  const [instructions, setInstructions] = useState(true);
  const [courier, setCourier] = useState(false);
  const steps = ["Plot & zone", "Test type", "Lab", "Sample & pay"];

  const plot = SOIL_PLOTS.find((item) => item.id === plotId) ?? SOIL_PLOTS[0];
  const testType = SOIL_TEST_TYPES.find((item) => item.id === typeId) ?? SOIL_TEST_TYPES[0];
  const lab = SOIL_LABS.find((item) => item.id === labId) ?? SOIL_LABS[0];
  const baseCost =
    testType.id === "type-basic"
      ? lab.costBasic
      : testType.id === "type-specialized"
        ? lab.costComprehensive || 12000
        : lab.costComprehensive;
  const total = (baseCost || 2000) + (courier ? 350 : 0);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setInstructions(true);
    setCourier(false);
    if (presetPlotId) setPlotId(presetPlotId);
    if (presetLabId) setLabId(presetLabId);
  }, [open, presetPlotId, presetLabId]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Schedule a soil test"
      desc="One sample per zone, 0 – 20 cm deep, delivered to the lab within 48 hours."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-soil-stack">
          <Field label="Plot" hint={`Last test: ${plot.lastTest} · next recommended: ${plot.nextTest}`}>
            <SelectInput
              value={plotId}
              onChange={setPlotId}
              options={SOIL_PLOTS.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.crop} · ${item.area}`,
              }))}
            />
          </Field>
          <div className="gm-form-grid">
            <Field label="Zones to sample" hint="Split the plot if slope, colour or history changes.">
              <SelectInput
                value={zones}
                onChange={setZones}
                options={[
                  "1 zone (uniform plot)",
                  "2 zones (upper + lower)",
                  "3 zones (upper, mid, lower)",
                  "4 zones (slope, flat, wet, eroded)",
                ]}
              />
            </Field>
            <Field label="Sampling depth">
              <SelectInput
                value={depth}
                onChange={setDepth}
                options={[
                  "0 – 20 cm (topsoil)",
                  "0 – 20 cm + 20 – 40 cm (deep sample)",
                  "0 – 15 cm (pasture or shallow soil)",
                ]}
              />
            </Field>
          </div>
          <div className="gm-soil-zones">
            <div className="gm-soil-zone">
              <strong>{plot.name}</strong>
              <small>
                pH {plot.ph.toFixed(1)} · OM {plot.organicMatter.toFixed(1)}% · {plot.texture}
              </small>
            </div>
            <div className="gm-soil-zone">
              <strong>{plot.zone.split(" · ")[0]}</strong>
              <small>{plot.zone.split(" · ")[1] ?? "Standard zone"}</small>
            </div>
            <div className="gm-soil-zone">
              <strong>{plot.crop}</strong>
              <small>{plot.variety === "—" ? "No cash crop" : plot.variety}</small>
            </div>
          </div>
          <Callout
            icon={Mountain}
            title="Why zones matter"
            body="Mixing soil from a wet lower terrace into a dry upper block averages away the problem. One sample per zone gives one clear recommendation per zone."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(1)}>
              Choose the test type
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-soil-stack">
          <div className="d-flex flex-column gap-2">
            {SOIL_TEST_TYPES.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${typeId === item.id ? "on" : ""}`}
                onClick={() => setTypeId(item.id)}
              >
                <input type="radio" checked={typeId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>
                    {item.label} ·{" "}
                    {item.id === "type-basic"
                      ? `${kes(item.costBasic)}`
                      : item.id === "type-specialized"
                        ? `from ${kes(12000)}`
                        : `${kes(item.costComprehensive)}`}
                  </strong>
                  <small>
                    {item.parameters} · turnaround {item.turnaround} · {item.bestFor} ·{" "}
                    {item.swahili}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <Callout
            icon={FlaskConical}
            title="Which one today?"
            body="Plot 5 has never been tested, so book Comprehensive — the micronutrients (Zn, B, S) are what the current programme is fixing on the other plots."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(2)}>
              Choose the lab
            </button>
          </div>
        </div>
      ) : step === 2 ? (
        <div className="gm-soil-stack">
          <div className="d-flex flex-column gap-2">
            {SOIL_LABS.slice(0, 6).map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${labId === item.id ? "on" : ""}`}
                onClick={() => setLabId(item.id)}
              >
                <input type="radio" checked={labId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>
                    {item.name} · ★ {item.rating}
                  </strong>
                  <small>
                    {item.location} · {item.turnaround} · basic{" "}
                    {item.costBasic === 0 ? "n/a" : kes(item.costBasic)} · comprehensive{" "}
                    {item.costComprehensive === 0 ? "n/a" : kes(item.costComprehensive)} ·{" "}
                    {item.accreditation}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div className="gm-soil-review">
            <ReviewRow label="Test type" value={testType.label} />
            <ReviewRow
              label="Price for this type"
              value={baseCost === 0 ? "Not offered by this lab" : kes(baseCost)}
            />
            <ReviewRow label="Turnaround" value={lab.turnaround} />
            <ReviewRow label="Collection" value={lab.courier} />
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(3)}>
              Sample collection & payment
            </button>
          </div>
        </div>
      ) : (
        <div className="gm-soil-stack">
          <div className="gm-form-grid">
            <Field label="Sampling date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
            <Field label="Sample delivery">
              <SelectInput
                value={collection}
                onChange={setCollection}
                options={[
                  "Drop at the lab",
                  "Sub-county agriculture office",
                  "Group collection point (Githunguri)",
                  "Boda courier pickup at the farm",
                ]}
              />
            </Field>
          </div>
          <Toggle
            checked={instructions}
            onChange={setInstructions}
            label="Generate sample collection instructions"
            desc="A labelled checklist with the W-pattern diagram, printed or sent by SMS."
          />
          <Toggle
            checked={courier}
            onChange={setCourier}
            label="Add courier to the lab (KES 350)"
            desc={`Boda from Githunguri to ${lab.location.split(",")[0]} on the same day.`}
          />
          <Field label="Notes for the lab">
            <textarea
              className="gm-textarea"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Plot 5 is newly leased; two seasons of continuous maize before us."
            />
          </Field>
          <div className="gm-soil-review">
            <ReviewRow label="Plot & zones" value={`${plot.name} · ${zones}`} />
            <ReviewRow label="Test type" value={`${testType.label} (${testType.parameters})`} />
            <ReviewRow label="Lab" value={lab.name} />
            <ReviewRow label="Courier" value={courier ? `${kes(350)} included` : "Not required"} />
            <ReviewRow label="Total" value={kes(total)} />
          </div>
          <PayPanel
            amount={total}
            purpose={`${testType.label} soil test · ${plot.name}`}
            payee={lab.name}
            onPaid={(receipt) => {
              onBooked({
                plot: plot.name,
                type: testType.label,
                lab: lab.name,
                cost: total,
                receipt,
                collection: instructions ? `${collection} · instructions generated` : collection,
              });
              onClose();
            }}
          />
        </div>
      )}
    </Dialog>
  );
}

export function LimeOrderDialog({
  open,
  plot,
  onClose,
  onOrdered,
}: {
  open: boolean;
  plot: SoilPlot | null;
  onClose: () => void;
  onOrdered: (summary: {
    plot: string;
    rate: string;
    tonnes: number;
    cost: number;
    receipt: string;
    mode: string;
  }) => void;
}) {
  const [acres, setAcres] = useState("0.5");
  const [rateId, setRateId] = useState("lr-4");
  const [mode, setMode] = useState("Group buying order");
  const rate = LIME_RATE_TABLE.find((item) => item.id === rateId) ?? LIME_RATE_TABLE[3];
  const acresNumber = Math.max(0.1, Number(acres) || 0.5);
  const tonnes = (Number(rate.ratePerAcre.replace(/[^0-9]/g, "")) / 1000) * acresNumber;
  const bags = Math.ceil((tonnes * 1000) / 50);
  const total = Math.round(rate.cost * acresNumber);

  useEffect(() => {
    if (!open) return;
    setAcres("0.5");
    setMode("Group buying order");
    if (plot) {
      const match =
        LIME_RATE_TABLE.find((item) => item.texture === plot.texture) ?? LIME_RATE_TABLE[3];
      setRateId(match.id);
    }
  }, [open, plot]);

  if (!plot) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Lime order · ${plot.name}`}
      desc={`${plot.texture} at pH ${plot.ph.toFixed(1)} — target pH 6.3 for ${plot.crop}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-form-grid">
          <Field label="Area to lime (acres)">
            <TextInput value={acres} type="number" onChange={setAcres} />
          </Field>
          <Field label="Texture & current pH" hint="Rates from the lime requirement table.">
            <SelectInput
              value={rateId}
              onChange={setRateId}
              options={LIME_RATE_TABLE.map((item) => ({
                value: item.id,
                label: `${item.texture} · pH ${item.currentPh} · ${item.ratePerAcre}/acre`,
              }))}
            />
          </Field>
        </div>
        <div className="gm-soil-review">
          <ReviewRow label="Recommended rate" value={`${rate.ratePerAcre} per acre`} />
          <ReviewRow label="Total lime" value={`${tonnes.toFixed(2)} tonnes (${bags} × 50 kg bags)`} />
          <ReviewRow label="Cost per acre" value={rate.cost === 0 ? "No lime needed" : kes(rate.cost)} />
          <ReviewRow label="Cost for this area" value={trace(rate.cost === 0 ? 0 : total)} />
          <ReviewRow label="Crop note" value={rate.note} />
        </div>
        <div>
          <span className="gm-field-label">How to buy</span>
          <div className="d-flex flex-wrap gap-2">
            {["Group buying order", "Pay now by M-Pesa", "Spread: pay half now, half on delivery"].map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  className={`gm-filter-chip ${mode === item ? "is-active" : ""}`}
                  onClick={() => setMode(item)}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>
        <Callout
          icon={Truck}
          title="Spread 2 – 3 weeks before planting"
          body="Lime and DAP react with each other if they meet in the same furrow. Space the two applications so the phosphorus is not locked up."
          tone="warn"
        />
        {rate.cost === 0 || total === 0 ? (
          <SuccessState
            title="No lime needed"
            body={`${plot.name} is already at or above pH 6.5. Correct the other limits instead — liming above pH 6.5 can reduce manganese availability.`}
            actionLabel="Close"
            onDone={onClose}
          />
        ) : mode === "Pay now by M-Pesa" ? (
          <PayPanel
            amount={total}
            purpose={`Agricultural lime ${tonnes.toFixed(2)} t for ${plot.name}`}
            payee="Nakuru Lime Works"
            onPaid={(receipt) => {
              onOrdered({
                plot: plot.name,
                rate: rate.ratePerAcre,
                tonnes: Math.round(tonnes * 100) / 100,
                cost: total,
                receipt,
                mode,
              });
              onClose();
            }}
          />
        ) : (
          <div className="d-flex flex-wrap justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onOrdered({
                  plot: plot.name,
                  rate: rate.ratePerAcre,
                  tonnes: Math.round(tonnes * 100) / 100,
                  cost:
                    mode === "Spread: pay half now, half on delivery"
                      ? Math.round(total / 2)
                      : total,
                  receipt:
                    mode === "Spread: pay half now, half on delivery"
                      ? `QKHALF${bags}PL`
                      : `QKLIME${bags}PL`,
                  mode,
                });
                onClose();
              }}
            >
              {mode === "Spread: pay half now, half on delivery"
                ? `Pay half now (${kes(Math.round(total / 2))})`
                : `Add to the group lime order · ${kes(total)}`}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function trace(amount: number) {
  return amount === 0 ? "KES 0" : kes(amount);
}

/* ============================ 17.5 sampling ============================= */

export function SamplingGuideDialog({
  open,
  plot,
  language,
  onClose,
  onLanguage,
  onSaved,
}: {
  open: boolean;
  plot: SoilPlot | null;
  language: "EN" | "SW";
  onClose: () => void;
  onLanguage: (language: "EN" | "SW") => void;
  onSaved: (plot: SoilPlot, language: string) => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setChecked([]);
  }, [open]);

  if (!plot) return null;

  const toggleKit = (id: string) =>
    setChecked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`How to take a soil sample · ${plot.name}`}
      desc="Nine steps, one plastic bucket, and 15 – 20 sub-samples from a W pattern across the zone."
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex flex-wrap gap-2">
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
          </div>
          <span className="gm-chip gm-chip-ghost">
            <MapPin /> {plot.zone}
          </span>
        </div>

        <div className="gm-soil-step-list">
          {SAMPLING_STEPS.map((step) => (
            <div key={step.id}>
              <span className="num font-display">{step.step}</span>
              <span style={{ flex: 1 }}>
                <strong>{(language === "SW" ? step.swahili : step.action) || step.action}</strong>
                <small className="d-block text-muted">
                  {language === "SW" ? step.details : step.details}
                </small>
              </span>
            </div>
          ))}
        </div>

        <span className="gm-eyebrow">Kit checklist</span>
        <div className="gm-soil-feature-grid">
          {SAMPLING_KIT.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`gm-checkcard ${checked.includes(item.id) ? "on" : ""}`}
              onClick={() => toggleKit(item.id)}
            >
              <input type="checkbox" checked={checked.includes(item.id)} readOnly tabIndex={-1} />
              <span>
                <strong>{item.item}</strong>
                <small>
                  {item.supplied ? "Available from the group store" : "Buy locally"} · {item.note}
                </small>
              </span>
            </button>
          ))}
        </div>

        <div className="gm-soil-review">
          <ReviewRow label="Plot" value={plot.name} />
          <ReviewRow label="Sampling points" value="15 – 20 sub-samples" />
          <ReviewRow label="Depth" value="0 – 20 cm" />
          <ReviewRow label="Sample weight" value="About 500 g mixed" />
          <ReviewRow label="Delivery window" value="Within 48 hours, kept cool" />
          <ReviewRow label="Kit ready" value={`${checked.length} of ${SAMPLING_KIT.length} items ticked`} />
        </div>

        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() =>
              downloadText(
                `growmo-soil-sampling-${plot.id}.csv`,
                [
                  ["Step", "Action", "Details"],
                  ...SAMPLING_STEPS.map((step) => [step.step, step.action, step.details]),
                  [],
                  ["Kit item", "Source", "Note"],
                  ...SAMPLING_KIT.map((item) => [
                    item.item,
                    item.supplied ? "Group store" : "Buy locally",
                    item.note,
                  ]),
                ]
                  .map((row) => row.map(csvCell).join(","))
                  .join("\n"),
              )
            }
          >
            <Download /> Download the checklist
          </button>
          <button type="button" className="gm-btn gm-btn-outline" onClick={() => window.print()}>
            <Printer /> Print the guide
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onSaved(plot, language);
              onClose();
            }}
          >
            <ClipboardCheck /> Save to this plot
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ============================== 17.6 labs =============================== */

export function LabDetailDialog({
  open,
  lab,
  onClose,
  onBook,
  onContact,
}: {
  open: boolean;
  lab: SoilLab | null;
  onClose: () => void;
  onBook: (lab: SoilLab) => void;
  onContact: (lab: SoilLab, channel: string) => void;
}) {
  if (!lab) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={lab.name}
      desc={`${lab.location} · ${lab.accreditation}`}
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          <span className="gm-chip gm-chip-lime">
            <Star /> {lab.rating}
          </span>
          <span className="gm-chip gm-chip-ghost">
            <Timer /> {lab.turnaround}
          </span>
          <span className="gm-chip gm-chip-ghost">
            <Microscope /> {lab.tests}
          </span>
        </div>
        <div className="gm-soil-review">
          <ReviewRow label="Basic test" value={lab.costBasic === 0 ? "Not offered" : kes(lab.costBasic)} />
          <ReviewRow
            label="Comprehensive test"
            value={lab.costComprehensive === 0 ? "Not offered" : kes(lab.costComprehensive)}
          />
          <ReviewRow label="Phone" value={lab.phone} />
          <ReviewRow label="Email" value={lab.email} />
          <ReviewRow label="Sample delivery" value={lab.courier} />
          <ReviewRow label="Counties served" value={lab.counties} />
        </div>
        <Callout icon={Star} title="Accreditation matters" body={lab.note} />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => onContact(lab, "Phone call")}
          >
            <Phone /> Call the lab
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => onContact(lab, "Email")}
          >
            <Mail /> Email a question
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onBook(lab)}>
            <FlaskConical /> Book a test here
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ============================ 17.2 results ============================== */

export function ParameterDialog({
  open,
  parameter,
  hypothesis,
  onClose,
  onFix,
  onAddPlan,
}: {
  open: boolean;
  parameter: SoilParameter | null;
  hypothesis: string;
  onClose: () => void;
  onFix: (parameter: SoilParameter) => void;
  onAddPlan: (parameter: SoilParameter, note: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setNote("");
  }, [open]);

  if (!parameter) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${parameter.parameter} · ${parameter.display}`}
      desc={`${parameter.status} against the optimum of ${parameter.optimalLabel} for ${SOIL_CONTEXT.activePlot} ${SOIL_CONTEXT.season}`}
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          <span className="gm-chip gm-chip-ghost">{parameter.symbol}</span>
          <span className="gm-chip gm-chip-ghost">Method: {parameter.method}</span>
          <span className="gm-chip gm-chip-ghost">
            Lab ref {SOIL_CONTEXT.labRef} · {SOIL_CONTEXT.lastTest}
          </span>
        </div>
        <Callout
          icon={FlaskConical}
          title="What the number means"
          body={hypothesis}
        />
        <div className="gm-soil-review">
          <ReviewRow label="Your value" value={parameter.display} />
          <ReviewRow label="Optimal range" value={parameter.optimalLabel} />
          <ReviewRow label="Status" value={parameter.status} />
          <ReviewRow
            label="Action cost"
            value={parameter.actionCost === 0 ? "No cost — no action needed" : kes(parameter.actionCost)}
          />
        </div>
        <Callout
          icon={parameter.status === "Optimal" || parameter.status === "Adequate" ? CheckCircle2 : AlertTriangle}
          title="Recommendation"
          body={parameter.recommendation}
          tone={parameter.status === "Optimal" || parameter.status === "Adequate" ? "good" : "warn"}
        />
        <Field label="Your note for the season plan">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Lime again after the January bean harvest, retest pH in March."
          />
        </Field>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            disabled={note.trim().length < 6}
            onClick={() => {
              onAddPlan(parameter, note);
              onClose();
            }}
          >
            <ClipboardCheck /> Add to the season plan
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={parameter.actionTarget === "none"}
            onClick={() => {
              onFix(parameter);
              onClose();
            }}
          >
            {parameter.actionTarget === "none"
              ? "No corrective action needed"
              : parameter.actionCost === 0
                ? "Schedule the follow-up"
                : `Fix it · from ${kes(parameter.actionCost)}`}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ScoreBreakdownDialog({
  open,
  score,
  projected,
  components,
  onClose,
  onAction,
}: {
  open: boolean;
  score: number;
  projected: number;
  components: ScoreComponent[];
  onClose: () => void;
  onAction: (component: ScoreComponent) => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Soil health score · 5 components"
      desc={`${score}/100 today, projected ${projected}/100 next season if the plan is followed`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          {components.map((component) => (
            <ReviewRow
              key={component.id}
              label={component.label}
              value={`${component.score}/${component.max} · ${component.note}`}
            />
          ))}
        </div>
        <div className="d-flex flex-column gap-2">
          {components.map((component) => (
            <div className="gm-soil-feature" key={`${component.id}-step`}>
              <Sprout />
              <span style={{ flex: 1 }}>
                <strong>{component.nextStep}</strong>
                <small>
                  Lifts {component.label} from {component.score} to about{" "}
                  {Math.min(component.max, component.score + 3)} of {component.max}
                </small>
              </span>
              <button type="button" className="gm-table-link" onClick={() => onAction(component)}>
                Act on it
              </button>
            </div>
          ))}
        </div>
        <Callout
          icon={ClipboardCheck}
          title="How the score is built"
          body="Each component is scored out of 20 from the latest lab result, then weighted by how much it limits the current crop. Texture and structure move slowly, so they are scored on trend rather than one season."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() =>
              downloadText(
                "growmo-soil-health-score.csv",
                [
                  ["Component", "Score", "Max", "Note", "Next step"],
                  ...components.map((component) => [
                    component.label,
                    component.score,
                    component.max,
                    component.note,
                    component.nextStep,
                  ]),
                  ["Total", score, 100, `Projected next season: ${projected}`, ""],
                ]
                  .map((row) => row.map(csvCell).join(","))
                  .join("\n"),
              )
            }
          >
            <Download /> Export the breakdown
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ========================== 17.4 history & trend ======================== */

export function HistoryDetailDialog({
  open,
  row,
  onClose,
  onCompare,
}: {
  open: boolean;
  row: SoilHistoryRow | null;
  onClose: () => void;
  onCompare: (row: SoilHistoryRow) => void;
}) {
  if (!row) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${row.year} soil test`}
      desc={`${row.lab} · ref ${row.labRef} · cost ${kes(row.cost)}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          <ReviewRow label="pH" value={row.ph.toFixed(1)} />
          <ReviewRow label="Organic matter" value={`${row.organicMatter.toFixed(1)}%`} />
          <ReviewRow label="Nitrogen" value={`${row.nitrogen} ppm`} />
          <ReviewRow label="Phosphorus" value={`${row.phosphorus} ppm`} />
          <ReviewRow label="Potassium" value={`${row.potassium} ppm`} />
          <ReviewRow label="Calcium" value={`${row.calcium} ppm`} />
          <ReviewRow label="Zinc" value={`${row.zinc} ppm`} />
          <ReviewRow label="Boron" value={`${row.boron} ppm`} />
          <ReviewRow label="CEC" value={`${row.cec} meq/100g`} />
          <ReviewRow label="Soil health score" value={`${row.score}/100`} />
        </div>
        <Callout icon={Sprout} title="Trend summary" body={row.trend} />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() =>
              downloadText(
                `growmo-soil-${row.id}.csv`,
                [
                  ["Parameter", "Value"],
                  ["Test", row.year],
                  ["Lab", row.lab],
                  ["Reference", row.labRef],
                  ["pH", row.ph],
                  ["Organic matter %", row.organicMatter],
                  ["N ppm", row.nitrogen],
                  ["P ppm", row.phosphorus],
                  ["K ppm", row.potassium],
                  ["Ca ppm", row.calcium],
                  ["Zn ppm", row.zinc],
                  ["B ppm", row.boron],
                  ["CEC", row.cec],
                  ["Score", row.score],
                  ["Trend", row.trend],
                ]
                  .map((line) => line.map(csvCell).join(","))
                  .join("\n"),
              )
            }
          >
            <Download /> Download the lab report
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onCompare(row)}>
            <Sprout /> Compare with the latest test
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function TrendPointDialog({
  open,
  point,
  onClose,
  onAddPlan,
}: {
  open: boolean;
  point: TrendPoint | null;
  onClose: () => void;
  onAddPlan: (point: TrendPoint) => void;
}) {
  if (!point) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${point.label} · ${point.value}`}
      desc={point.note ?? "Trend point from the soil test history"}
    >
      <div className="gm-soil-stack">
        <Callout
          icon={Sprout}
          title="What moved this point"
          body={point.note ?? "Each point on the chart is one lab test. Tap a later point to see what changed."}
        />
        <div className="gm-soil-review">
          <ReviewRow label="Period" value={point.label} />
          <ReviewRow label="Value" value={String(point.value)} />
          <ReviewRow
            label="Gap to target"
            value={
              point.value > 100 ? "See the parameter detail" : `${Math.max(0, 100 - point.value)} points`
            }
          />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onAddPlan(point);
              onClose();
            }}
          >
            <ClipboardCheck /> Add follow-up to the season plan
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ========================== 17.3 fertilizer plan ======================== */

export function FertilizerProgramDialog({
  open,
  steps,
  total,
  saved,
  onClose,
  onToggle,
  onExport,
  onOrder,
}: {
  open: boolean;
  steps: FertilizerStep[];
  total: number;
  saved: number;
  onClose: () => void;
  onToggle: (step: FertilizerStep) => void;
  onExport: () => void;
  onOrder: (steps: FertilizerStep[]) => void;
}) {
  const [includeManure, setIncludeManure] = useState(true);
  const [includeMicrons, setIncludeMicrons] = useState(true);
  const selected = steps.filter(
    (step) =>
      (includeManure || step.application !== "Manure") &&
      (includeMicrons || !step.product.toLowerCase().includes("foliar")),
  );
  const selectedTotal = selected.reduce((sum, step) => sum + step.cost, 0);

  useEffect(() => {
    if (!open) return;
    setIncludeManure(true);
    setIncludeMicrons(true);
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="AI fertilizer programme · Plot 1 cabbage"
      desc={`Built from the ${SOIL_CONTEXT.lastTest} KALRO result — pH 5.8, N 15 ppm, Zn 1.8 ppm, B 0.4 ppm`}
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          <span className="gm-chip gm-chip-lime">Full plan {kes(total)}</span>
          <span className="gm-chip gm-chip-gold">Skipped inputs save {kes(saved)}</span>
          <span className="gm-chip gm-chip-ghost">Per acre · 2 acre farm</span>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Product & rate</th>
                <th>Purpose</th>
                <th>Cost</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => (
                <tr key={step.id}>
                  <td>
                    <strong>{step.application}</strong>
                    <small className="d-block text-muted">{step.timing}</small>
                  </td>
                  <td>
                    {step.product}
                    <small className="d-block text-muted">{step.ratePerAcre} per acre</small>
                  </td>
                  <td>{step.purpose}</td>
                  <td className="font-display">KES {step.cost.toLocaleString("en-KE")}</td>
                  <td>
                    <button
                      type="button"
                      className={`gm-btn gm-btn-sm ${step.applied ? "gm-btn-outline" : "gm-btn-soft"}`}
                      onClick={() => onToggle(step)}
                    >
                      {step.applied ? "Applied" : "Mark applied"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Toggle
          checked={includeManure}
          onChange={setIncludeManure}
          label="Include farmyard manure (KES 30,000)"
          desc="Biggest single line, but it is what lifted organic matter from 2.1% to 3.2% since 2023."
        />
        <Toggle
          checked={includeMicrons}
          onChange={setIncludeMicrons}
          label="Include the zinc and boron foliar corrections"
          desc="Cheap fixes for the two micronutrients still below optimum."
        />
        <div className="gm-soil-review">
          <ReviewRow label="Lines selected" value={`${selected.length} of ${steps.length}`} />
          <ReviewRow label="Cost of selection" value={kes(selectedTotal)} />
          <ReviewRow label="Skipped inputs (MOP, TSP, Cu)" value={`-${kes(saved)}`} />
          <ReviewRow label="Net plan" value={kes(selectedTotal)} />
        </div>
        <Callout
          icon={AlertTriangle}
          title="Do not mix lime and DAP in one day"
          body="Apply lime at land preparation, then DAP in the planting furrow at least two weeks later. Applied together, the phosphorus is locked up and wasted."
          tone="warn"
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onExport}>
            <Download /> Export the programme
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={() => window.print()}>
            <Printer /> Print for the agronomist
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onOrder(selected)}>
            <Package /> Order the inputs
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ProductDetailDialog({
  open,
  product,
  products,
  onClose,
  onAddToOrder,
}: {
  open: boolean;
  product: SoilProduct | null;
  products: SoilProduct[];
  onClose: () => void;
  onAddToOrder: (product: SoilProduct) => void;
}) {
  const [substituteId, setSubstituteId] = useState("");

  useEffect(() => {
    if (!open) return;
    setSubstituteId("");
  }, [open]);

  if (!product) return null;

  const alternatives = products.filter(
    (item) => item.id !== product.id && item.category === product.category,
  );
  const chosen = products.find((item) => item.id === substituteId) ?? product;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={product.product}
      desc={`${product.category} · ${product.supplier} · ${product.packSize}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          <ReviewRow label="Price" value={product.price === 0 ? "Own production" : kes(product.price)} />
          <ReviewRow label="Rate per acre" value={product.ratePerAcre} />
          <ReviewRow label="Nutrient analysis" value={product.nutrient} />
          <ReviewRow label="Stock" value={product.stock} />
          <ReviewRow
            label="Will be ordered"
            value={`${chosen.product} · ${chosen.price === 0 ? "own production" : kes(chosen.price)}`}
          />
        </div>
        <Callout icon={Sprout} title="How to apply" body={product.howToApply} />
        {alternatives.length > 0 ? (
          <Field
            label="Alternative product in the same category"
            hint="Switching a substitute changes what goes on the order, nothing else."
          >
            <SelectInput
              value={substituteId}
              onChange={setSubstituteId}
              options={[
                { value: "", label: "Keep this product" },
                ...alternatives.map((item) => ({
                  value: item.id,
                  label: `${item.product} · ${
                    item.price === 0 ? "own production" : kes(item.price)
                  } ${item.packSize}`,
                })),
              ]}
            />
          </Field>
        ) : null}
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onAddToOrder(chosen);
              onClose();
            }}
          >
            <Package /> Add {chosen.product} to the order
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SkipReasonDialog({
  open,
  skipped,
  onClose,
  onConfirm,
}: {
  open: boolean;
  skipped: SkippedInput | null;
  onClose: () => void;
  onConfirm: (skipped: SkippedInput) => void;
}) {
  if (!skipped) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Why we skip ${skipped.input}`}
      desc="Fertilizer is only worth buying for the nutrient the soil is actually short of."
    >
      <div className="gm-soil-stack">
        <Callout icon={AlertTriangle} title="Reason" body={skipped.reason} />
        <div className="gm-soil-review">
          <ReviewRow label="Money saved" value={kes(skipped.saved)} />
          <ReviewRow label="Evidence" value={skipped.evidence} />
          <ReviewRow label="Buy anyway?" value="Not recommended this season" />
        </div>
        <Callout
          icon={FlaskConical}
          title="When to revisit"
          body="Retest at the next annual sample. If potassium falls below 100 ppm or phosphorus below 15 ppm, add the product back to the programme."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onConfirm(skipped);
              onClose();
            }}
          >
            <CheckCircle2 /> Keep it skipped and save {kes(skipped.saved)}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ======================= amendments + compost =========================== */

export function AmendmentLogDialog({
  open,
  preset,
  onClose,
  onLogged,
}: {
  open: boolean;
  preset: "lime" | "manure" | "compost" | null;
  onClose: () => void;
  onLogged: (summary: {
    amendment: string;
    plot: string;
    quantity: string;
    cost: number;
    date: string;
  }) => void;
}) {
  const [amendment, setAmendment] = useState("Agricultural lime (CaCO₃)");
  const [plot, setPlot] = useState(SOIL_PLOTS[0].name);
  const [quantity, setQuantity] = useState("1,000 kg");
  const [cost, setCost] = useState("8000");
  const [date, setDate] = useState("2026-09-22");
  const [method, setMethod] = useState("Broadcast and incorporate");
  const [record, setRecord] = useState(true);

  useEffect(() => {
    if (!open) return;
    setPlot(SOIL_PLOTS[0].name);
    setDate("2026-09-22");
    setRecord(true);
    if (preset === "lime") {
      setAmendment("Agricultural lime (CaCO₃)");
      setQuantity("1,000 kg");
      setCost("8000");
    } else if (preset === "manure") {
      setAmendment("Farmyard manure (well rotted)");
      setQuantity("2.5 tonnes");
      setCost("15000");
    } else if (preset === "compost") {
      setAmendment("Compost (own yard, screened)");
      setQuantity("1 tonne");
      setCost("0");
    }
  }, [open, preset]);

  const costNumber = Math.max(0, Number(cost) || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Log a soil amendment"
      desc="Lime, manure and compost are written into the farm diary and the input records."
    >
      <div className="gm-soil-stack">
        <div className="gm-form-grid">
          <Field label="Amendment">
            <SelectInput
              value={amendment}
              onChange={setAmendment}
              options={[
                "Agricultural lime (CaCO₃)",
                "Dolomitic lime",
                "Gypsum (calcium sulphate)",
                "Farmyard manure (well rotted)",
                "Compost (own yard, screened)",
                "Wood ash",
                "Lablab green manure",
              ]}
            />
          </Field>
          <Field label="Plot">
            <SelectInput
              value={plot}
              onChange={setPlot}
              options={SOIL_PLOTS.map((item) => item.name)}
            />
          </Field>
          <Field label="Quantity applied">
            <TextInput value={quantity} onChange={setQuantity} placeholder="e.g. 2,000 kg" />
          </Field>
          <Field label="Cost (KES)">
            <TextInput value={cost} type="number" onChange={setCost} />
          </Field>
          <Field label="Date applied">
            <TextInput value={date} type="date" onChange={setDate} />
          </Field>
          <Field label="Method">
            <SelectInput
              value={method}
              onChange={setMethod}
              options={[
                "Broadcast and incorporate",
                "In the planting furrow",
                "Spot application around the plant",
                "Spread on the bed surface as mulch",
                "Compost tea drench",
              ]}
            />
          </Field>
        </div>
        <Toggle
          checked={record}
          onChange={setRecord}
          label="Write this into the farm diary and records"
          desc="Adds a diary entry and an input line so the cost shows up in the finance page."
        />
        <div className="gm-soil-review">
          <ReviewRow label="Amendment" value={amendment} />
          <ReviewRow label="Plot" value={plot} />
          <ReviewRow label="Quantity" value={quantity} />
          <ReviewRow label="Cost" value={costNumber === 0 ? "No cash cost" : kes(costNumber)} />
        </div>
        <Callout
          icon={ClipboardCheck}
          title="Retest reminder"
          body="Lime moves pH slowly. GrowMO will schedule a pH retest for March so you can see whether the rate was enough."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onLogged({ amendment, plot, quantity, cost: costNumber, date });
              onClose();
            }}
          >
            <CheckCircle2 /> Save the amendment
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function CompostBatchWizard({
  open,
  batches,
  onClose,
  onCreated,
}: {
  open: boolean;
  batches: CompostBatch[];
  onClose: () => void;
  onCreated: (batch: CompostBatch) => void;
}) {
  const [step, setStep] = useState(0);
  const [materials, setMaterials] = useState<string[]>(["Green: crop residue", "Brown: dry grass"]);
  const [volume, setVolume] = useState("1.5");
  const [moisture, setMoisture] = useState("Damp as a wrung cloth");
  const [site, setSite] = useState("Compost yard, Plot 10");
  const [turnDays, setTurnDays] = useState("14");
  const steps = ["Materials", "Build the heap", "Schedule turning"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setMaterials(["Green: crop residue", "Brown: dry grass"]);
  }, [open]);

  const nextNumber = `CB-2026-${String(batches.length + 2).padStart(3, "0")}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Build a compost batch"
      desc="Layer green and brown material, keep it damp and turn it on schedule."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-soil-stack">
          <div>
            <span className="gm-field-label">Materials going in</span>
            <div className="d-flex flex-wrap gap-2">
              {[
                "Green: crop residue",
                "Green: kitchen waste",
                "Green: fresh manure",
                "Brown: dry grass",
                "Brown: maize stover",
                "Additive: wood ash",
                "Additive: molasses",
                "Additive: lime (thin layer)",
              ].map((item) => {
                const active = materials.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    className={`gm-filter-chip ${active ? "is-active" : ""}`}
                    onClick={() =>
                      setMaterials((current) =>
                        active ? current.filter((value) => value !== item) : [...current, item],
                      )
                    }
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="gm-form-grid">
            <Field label="Expected volume (tonnes)">
              <TextInput value={volume} type="number" onChange={setVolume} />
            </Field>
            <Field label="Build site">
              <SelectInput
                value={site}
                onChange={setSite}
                options={[
                  "Compost yard, Plot 10",
                  "Behind the store shed",
                  "Nursery shade area",
                  "Lower terrace, out of the wind",
                ]}
              />
            </Field>
          </div>
          <Callout
            icon={Package}
            title="Ratio to aim for"
            body="Three parts dry brown material to one part green, in layers no thicker than 15 cm each. That is what keeps the heap heating without going smelly."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={materials.length < 2}
              onClick={() => setStep(1)}
            >
              Build the heap
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-soil-stack">
          <Field label="Moisture target">
            <SelectInput
              value={moisture}
              onChange={setMoisture}
              options={[
                "Damp as a wrung cloth",
                "Dry — add water while turning",
                "Wet — add dry material and turn",
              ]}
            />
          </Field>
          <div className="gm-soil-review">
            <ReviewRow label="Batch number" value={nextNumber} />
            <ReviewRow label="Volume" value={`${volume} tonnes`} />
            <ReviewRow label="Site" value={site} />
            <ReviewRow label="Materials" value={`${materials.length} selected`} />
            <ReviewRow label="Build date" value="20 Sep 2026" />
            <ReviewRow label="Expected ready" value="15 Nov 2026 (8 weeks)" />
          </div>
          <Callout
            icon={Thermometer}
            title="Heat is the sign it is working"
            body="A well built heap reaches 55 – 65 °C in the first week. If it stays cool, it is too dry or there is not enough green material."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(2)}>
              Schedule the turns
            </button>
          </div>
        </div>
      ) : (
        <div className="gm-soil-stack">
          <Field label="Turn every (days)" hint="Two turns at the start, then one a fortnight.">
            <SelectInput value={turnDays} onChange={setTurnDays} options={["7", "10", "14", "21"]} />
          </Field>
          <div className="gm-soil-review">
            <ReviewRow label="Reminder 1" value="04 Oct 2026" />
            <ReviewRow label="Reminder 2" value="18 Oct 2026" />
            <ReviewRow label="Reminder 3" value="01 Nov 2026" />
            <ReviewRow label="Ready for use" value="15 Nov 2026" />
            <ReviewRow label="Where it will go" value="Plot 6 kitchen garden, then Plot 1" />
          </div>
          <Callout
            icon={CalendarDays}
            title="Reminders land in your tasks"
            body="GrowMO adds the turning dates to the dashboard task board so the heap is turned while it is still hot."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onCreated({
                  id: `cb-new-${batches.length + 1}`,
                  batch: nextNumber,
                  started: "20 Sep 2026",
                  ready: "15 Nov 2026",
                  material: materials.join(", "),
                  volume: `${volume} tonnes`,
                  stage: "Turning",
                  temperature: "—",
                  turned: "Just built",
                  quality: "New heap — check heat in 3 days",
                  appliedTo: "Not applied yet",
                });
                onClose();
              }}
            >
              <CheckCircle2 /> Create the batch
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ============================ 17.7 practices ============================ */

export function PracticePlanDialog({
  open,
  practice,
  onClose,
  onChanged,
}: {
  open: boolean;
  practice: SoilPractice | null;
  onClose: () => void;
  onChanged: (practice: SoilPractice, next: boolean, progress: number) => void;
}) {
  const [progress, setProgress] = useState("20");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !practice) return;
    setProgress(String(practice.progress));
    setNote("");
  }, [open, practice]);

  if (!practice) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${practice.practice} · how to do it`}
      desc={`${practice.frequency} · ${practice.costLabel} · ${practice.acres}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          <ReviewRow label="Impact on soil" value={practice.impact} />
          <ReviewRow label="Priority" value={practice.priority} />
          <ReviewRow label="First action" value={practice.firstAction} />
          <ReviewRow label="Cost" value={practice.costLabel} />
        </div>
        <Callout icon={Sprout} title="How to do it properly" body={practice.howTo} />
        <Field label="Progress this season (%)">
          <TextInput value={progress} type="number" onChange={setProgress} />
        </Field>
        <Field label="Note for the diary">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Broadcast lime on the lower half of Plot 1 before the rain."
          />
        </Field>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => {
              onChanged(practice, false, Number(progress) || 0);
              onClose();
            }}
          >
            <Timer /> Pause this practice
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onChanged(practice, true, Number(progress) || 0);
              onClose();
            }}
          >
            <CheckCircle2 /> Save progress to the diary
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ============================ 17.8 moisture ============================= */

export function MoistureLogDialog({
  open,
  week,
  onClose,
  onLogged,
}: {
  open: boolean;
  week: MoistureWeek | null;
  onClose: () => void;
  onLogged: (week: MoistureWeek | null, summary: string) => void;
}) {
  const [rainfall, setRainfall] = useState("0");
  const [et, setEt] = useState("0");
  const [irrigation, setIrrigation] = useState("0");
  const [feel, setFeel] = useState(FEEL_METHOD_SCALE[2].label);
  const [plot, setPlot] = useState("Plot 1");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setRainfall(String(week?.rainfall ?? 0));
    setEt(String(week?.et ?? 0));
    setIrrigation(String(week?.irrigation ?? 0));
    setPlot("Plot 1");
    setNote("");
    setFeel(FEEL_METHOD_SCALE[2].label);
  }, [open, week]);

  const net = (Number(rainfall) || 0) + (Number(irrigation) || 0) - (Number(et) || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={week ? `Log moisture · ${week.week}` : "Log a moisture reading"}
      desc="Rainfall, irrigation and evapotranspiration give the weekly water balance."
    >
      <div className="gm-soil-stack">
        <div className="gm-form-grid">
          <Field label="Plot">
            <SelectInput value={plot} onChange={setPlot} options={SOIL_PLOTS.map((item) => item.name)} />
          </Field>
          <Field label="Feel-method reading">
            <SelectInput
              value={feel}
              onChange={setFeel}
              options={FEEL_METHOD_SCALE.map((item) => ({
                value: item.label,
                label: `${item.label} · ${item.moisture}`,
              }))}
            />
          </Field>
          <Field label="Rainfall in (mm)">
            <TextInput value={rainfall} type="number" onChange={setRainfall} />
          </Field>
          <Field label="ET out (mm)">
            <TextInput value={et} type="number" onChange={setEt} />
          </Field>
          <Field label="Irrigation in (mm)">
            <TextInput value={irrigation} type="number" onChange={setIrrigation} />
          </Field>
          <Field label="Net balance">
            <StaticField value={`${net > 0 ? "+" : ""}${net} mm`} />
          </Field>
        </div>
        <Field label="Field note">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Furrow ran dry on the lower block by Wednesday; soil still moist at 10 cm."
          />
        </Field>
        <Callout
          icon={Droplets}
          title={net < 0 ? "Deficit week — plan irrigation" : "Surplus week — watch drainage"}
          body={
            net < 0
              ? `${Math.abs(net)} mm deficit. Cabbage at heading uses about 25 mm a week, so a light irrigation now is cheaper than a stressed crop.`
              : `${net} mm surplus. Check the cut-off furrow on the slope and hold off foliar sprays before the rain.`
          }
          tone={net < 0 ? "warn" : "good"}
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onLogged(
                week,
                `${plot}: ${rainfall} mm rain, ${irrigation} mm irrigation, ${et} mm ET, net ${net} mm, soil ${feel.toLowerCase()}`,
              );
              onClose();
            }}
          >
            <CheckCircle2 /> Save the reading
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function IrrigationPlanDialog({
  open,
  weeks,
  onClose,
  onApplied,
}: {
  open: boolean;
  weeks: MoistureWeek[];
  onClose: () => void;
  onApplied: (total: number, weeks: string[], mode: string) => void;
}) {
  const [method, setMethod] = useState("Furrow irrigation");
  const [include, setInclude] = useState<string[]>(
    weeks.filter((week) => week.irrigationCost > 0).map((week) => week.id),
  );
  const [labour, setLabour] = useState(true);

  useEffect(() => {
    if (!open) return;
    setInclude(weeks.filter((week) => week.irrigationCost > 0).map((week) => week.id));
    setLabour(true);
  }, [open, weeks]);

  const chosen = weeks.filter((week) => include.includes(week.id));
  const water = chosen.reduce((total, week) => total + week.irrigation, 0);
  const cost = chosen.reduce((total, week) => total + week.irrigationCost, 0) + (labour ? 1200 : 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Plan irrigation for the deficit weeks"
      desc="Ten millimetres of water at the right stage is worth more than the same water a week late."
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          {weeks.map((week) => {
            const active = include.includes(week.id);
            const needed = week.irrigationCost > 0 || week.net < 0;
            return (
              <button
                type="button"
                key={week.id}
                className={`gm-filter-chip ${active ? "is-active" : ""}`}
                onClick={() =>
                  setInclude((current) =>
                    active ? current.filter((id) => id !== week.id) : [...current, week.id],
                  )
                }
              >
                {week.week} · net {week.net > 0 ? `+${week.net}` : week.net} mm
                {needed ? " · needs water" : " · fine"}
              </button>
            );
          })}
        </div>
        <div className="gm-form-grid">
          <Field label="Irrigation method">
            <SelectInput
              value={method}
              onChange={setMethod}
              options={[
                "Furrow irrigation",
                "Bucket and watering can",
                "Drip tape (partial)",
                "Sprinkler, shared with the group",
              ]}
            />
          </Field>
          <Field label="Water required" >
            <StaticField value={`${water} mm over ${chosen.length} weeks`} />
          </Field>
        </div>
        <Toggle
          checked={labour}
          onChange={setLabour}
          label="Add watering labour (KES 1,200)"
          desc="Two days of casual labour across the deficit weeks, paid through the wallet."
        />
        <div className="gm-soil-review">
          <ReviewRow label="Weeks selected" value={`${chosen.length} of ${weeks.length}`} />
          <ReviewRow label="Water" value={`${water} mm`} />
          <ReviewRow label="Estimated cost" value={kes(cost)} />
          <ReviewRow label="Next action" value={chosen[0]?.action ?? "No deficit weeks selected"} />
        </div>
        <Callout
          icon={Droplets}
          title="Irrigate in the evening"
          body="Evening watering loses less to evaporation and keeps the leaf dry overnight, which matters for black rot on cabbage."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={chosen.length === 0}
            onClick={() => {
              onApplied(cost, chosen.map((week) => week.week), method);
              onClose();
            }}
          >
            <Droplets /> Schedule the irrigation plan
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SensorWizard({
  open,
  sensor,
  onClose,
  onSaved,
}: {
  open: boolean;
  sensor: SoilSensor | null;
  onClose: () => void;
  onSaved: (summary: { plot: string; action: string; cost: number; receipt: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [plot, setPlot] = useState(sensor?.plot ?? SOIL_PLOTS[0].name);
  const [depth, setDepth] = useState("20 cm");
  const [simPay, setSimPay] = useState(true);
  const [action, setAction] = useState(
    sensor?.status === "Offline" ? "Replace the battery" : "Install a new sensor",
  );

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSimPay(true);
    setPlot(sensor?.plot ?? SOIL_PLOTS[0].name);
    setAction(sensor?.status === "Offline" ? "Replace the battery" : "Install a new sensor");
  }, [open, sensor]);

  const cost = action === "Replace the battery" ? 0 : 12500;
  const simCost = simPay ? 720 : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={sensor ? `${action} · ${sensor.plot}` : "Install a soil moisture sensor"}
      desc="Hourly moisture and temperature readings, with a SIM data plan for the season."
    >
      <Stepper steps={["Sensor & plot", "Installation", "SIM & confirm"]} current={step} />
      {step === 0 ? (
        <div className="gm-soil-stack">
          <div className="gm-form-grid">
            <Field label="Action">
              <SelectInput
                value={action}
                onChange={setAction}
                options={[
                  "Install a new sensor",
                  "Replace the battery",
                  "Recalibrate an existing sensor",
                  "Remove a sensor",
                ]}
              />
            </Field>
            <Field label="Plot">
              <SelectInput
                value={plot}
                onChange={setPlot}
                options={SOIL_PLOTS.map((item) => item.name)}
              />
            </Field>
            <Field label="Installation depth" hint="10 cm for shallow roots, 20 cm for cabbage and tomato.">
              <SelectInput value={depth} onChange={setDepth} options={["10 cm", "20 cm", "30 cm"]} />
            </Field>
          </div>
          <Callout
            icon={Wifi}
            title="What the sensor tells you"
            body="Moisture percentage every hour and a soil temperature reading. It decides when to irrigate; only the lab decides what fertilizer to buy."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(1)}>
              Installation detail
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-soil-stack">
          <div className="gm-soil-review">
            <ReviewRow label="Device" value="GROWMO-SM-100 probe" />
            <ReviewRow label="Plot" value={plot} />
            <ReviewRow label="Depth" value={depth} />
            <ReviewRow label="Calibration" value="Two-point (dry / field capacity) sample taken at install" />
            <ReviewRow label="Reading frequency" value="Every hour, uploaded over the cellular network" />
            <ReviewRow label="Battery life" value="11 months per charge on the solar variant" />
          </div>
          <Callout
            icon={AlertTriangle}
            title="Where to bury the probe"
            body="One metre inside the bed edge, in the crop row and not against the furrow bank. Bury it where you would plant, not on the path."
            tone="warn"
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(2)}>
              SIM & confirm
            </button>
          </div>
        </div>
      ) : (
        <div className="gm-soil-stack">
          <Toggle
            checked={simPay}
            onChange={setSimPay}
            label="Add the season SIM data plan (KES 720)"
            desc="60 KES a month for twelve months of hourly readings."
          />
          <div className="gm-soil-review">
            <ReviewRow
              label="Sensor hardware"
              value={cost === 0 ? "No hardware cost for this action" : kes(cost)}
            />
            <ReviewRow label="SIM data plan" value={simPay ? kes(720) : "Using an existing SIM"} />
            <ReviewRow label="Total" value={kes(cost + simCost)} />
            <ReviewRow label="Installation visit" value="Field team, 22 Sep 2026, 09:00" />
          </div>
          {cost + simCost === 0 ? (
            <SuccessState
              title="Maintenance booked"
              body={`A technician will ${action.toLowerCase()} on ${plot} on 22 Sep 2026. Readings resume the same day.`}
              actionLabel="Done"
              onDone={() => {
                onSaved({ plot, action, cost: 0, receipt: "SERVICE" });
                onClose();
              }}
            />
          ) : (
            <PayPanel
              amount={cost + simCost}
              purpose={`${action} on ${plot}`}
              payee="GrowMO field services"
              onPaid={(receipt) => {
                onSaved({ plot, action, cost: cost + simCost, receipt });
                onClose();
              }}
            />
          )}
        </div>
      )}
    </Dialog>
  );
}

/* ====================== sharing, export, settings, faq ================== */

export function SoilShareDialog({
  open,
  onClose,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  onShared: (summary: { who: string; scope: string; expiry: string; code: string }) => void;
}) {
  const [who, setWho] = useState("Peter Otieno · verified agronomist");
  const [scope, setScope] = useState("Latest test + fertilizer programme");
  const [expiry, setExpiry] = useState("7 days");
  const [includeFinance, setIncludeFinance] = useState(false);
  const [includeMoisture, setIncludeMoisture] = useState(true);
  const [generated, setGenerated] = useState("");

  useEffect(() => {
    if (!open) return;
    setGenerated("");
    setIncludeFinance(false);
    setIncludeMoisture(true);
  }, [open]);

  const code = `GM-SOIL-${who.slice(0, 2).toUpperCase()}${scope.length}${expiry.slice(0, 1)}`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Share soil results"
      desc="Third parties see only what you select, and the link expires on its own."
    >
      <div className="gm-soil-stack">
        <div className="gm-form-grid">
          <Field label="Share with">
            <SelectInput
              value={who}
              onChange={setWho}
              options={[
                "Peter Otieno · verified agronomist",
                "Twiga Foods · export buyer",
                "KS1758 certification auditor",
                "Kiambu County extension officer",
                "KALRO soil desk",
                "Lime supplier (specification only)",
              ]}
            />
          </Field>
          <Field label="What to include">
            <SelectInput
              value={scope}
              onChange={setScope}
              options={[
                "Latest test + fertilizer programme",
                "Full test history (4 years)",
                "Fertilizer programme only",
                "Lime specification only",
                "Sampling evidence for an audit",
              ]}
            />
          </Field>
          <Field label="Link expires in">
            <SelectInput value={expiry} onChange={setExpiry} options={["24 hours", "7 days", "30 days", "90 days"]} />
          </Field>
        </div>
        <Toggle
          checked={includeMoisture}
          onChange={setIncludeMoisture}
          label="Include the moisture balance"
          desc="Useful for irrigation advice; irrelevant to a fertilizer quotation."
        />
        <Toggle
          checked={includeFinance}
          onChange={setIncludeFinance}
          label="Include the costs I have paid"
          desc="Off by default — buyers never need to see what you spent."
        />
        <div className="gm-soil-review">
          <ReviewRow label="Recipient" value={who} />
          <ReviewRow label="Scope" value={scope} />
          <ReviewRow label="Moisture data" value={includeMoisture ? "Included" : "Hidden"} />
          <ReviewRow label="Cost data" value={includeFinance ? "Included" : "Hidden"} />
          <ReviewRow label="Access code" value={<span className="gm-code-chip">{code}</span>} />
        </div>
        {generated ? (
          <SuccessState
            title="Access link created"
            body={`${who} can open the ${scope.toLowerCase()} for the next ${expiry}. Every view is logged against your data requests.`}
            receipt={generated}
            actionLabel="Done"
            onDone={onClose}
          />
        ) : (
          <div className="d-flex flex-wrap justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft"
              onClick={() =>
                downloadText(
                  "growmo-soil-share-preview.csv",
                  [
                    ["Share with", who],
                    ["Scope", scope],
                    ["Expiry", expiry],
                    ["Moisture data", includeMoisture ? "Included" : "Hidden"],
                    ["Cost data", includeFinance ? "Included" : "Hidden"],
                    ["Access code", code],
                  ]
                    .map((row) => row.map(csvCell).join(","))
                    .join("\n"),
                )
              }
            >
              <Download /> Preview what they will see
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setGenerated(code);
                onShared({ who, scope, expiry, code });
              }}
            >
              <Share2 /> Create the access link
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

export function SoilExportDialog({
  open,
  orders,
  onClose,
  onExported,
}: {
  open: boolean;
  orders: SoilOrder[];
  onClose: () => void;
  onExported: (sections: string[], format: string) => void;
}) {
  const [sections, setSections] = useState<string[]>([
    "Test results",
    "Fertilizer programme",
    "History & trend",
  ]);
  const [format, setFormat] = useState("CSV");
  const [range, setRange] = useState("All plots, all years");

  useEffect(() => {
    if (!open) return;
    setSections(["Test results", "Fertilizer programme", "History & trend"]);
  }, [open]);

  const options = [
    "Test results",
    "Fertilizer programme",
    "History & trend",
    "Soil health score",
    "Sampling evidence",
    "Moisture & irrigation",
    "Costs & lab orders",
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Export soil records"
      desc="Certificate-ready evidence, or a working file for your own analysis."
    >
      <div className="gm-soil-stack">
        <div>
          <span className="gm-field-label">Sections to include</span>
          <div className="d-flex flex-wrap gap-2">
            {options.map((item) => {
              const active = sections.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  className={`gm-filter-chip ${active ? "is-active" : ""}`}
                  onClick={() =>
                    setSections((current) =>
                      active ? current.filter((value) => value !== item) : [...current, item],
                    )
                  }
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <div className="gm-form-grid">
          <Field label="Format">
            <SelectInput value={format} onChange={setFormat} options={["CSV", "PDF pack", "Print"]} />
          </Field>
          <Field label="Range">
            <SelectInput
              value={range}
              onChange={setRange}
              options={[
                "All plots, all years",
                "Plot 1 only",
                "Latest season only",
                "Certification window (2025 – 2026)",
              ]}
            />
          </Field>
        </div>
        <div className="gm-soil-review">
          <ReviewRow label="Sections" value={`${sections.length} selected`} />
          <ReviewRow label="Format" value={format} />
          <ReviewRow label="Range" value={range} />
          <ReviewRow label="Lab orders on file" value={`${orders.length}`} />
        </div>
        <Callout
          icon={ClipboardCheck}
          title="Certification note"
          body="For a KS1758 or GlobalG.A.P. audit, include the sampling evidence and the lab reference numbers — an auditor wants the chain from the field to the report."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={sections.length === 0}
            onClick={() => {
              if (format === "Print") {
                window.print();
              } else {
                downloadText(
                  "growmo-soil-export.csv",
                  [
                    ["Section", "Value"],
                    ...sections.map((section) => [section, `${range} · ${format}`]),
                  ]
                    .map((row) => row.map(csvCell).join(","))
                    .join("\n"),
                );
              }
              onExported(sections, format);
              onClose();
            }}
          >
            <Download /> Export {sections.length} sections
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SoilSettingsDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (next: typeof SOIL_SETTINGS) => void;
}) {
  const [draft, setDraft] = useState(SOIL_SETTINGS);

  useEffect(() => {
    if (!open) return;
    setDraft(SOIL_SETTINGS);
  }, [open]);

  const set = <K extends keyof typeof SOIL_SETTINGS>(
    key: K,
    value: (typeof SOIL_SETTINGS)[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Soil & testing settings"
      desc="Test reminders, moisture alerts and who can see your soil data."
    >
      <div className="gm-soil-stack">
        <Toggle
          checked={draft.testReminder}
          onChange={(value) => set("testReminder", value)}
          label="Remind me before the next soil test"
          desc="Uses the annual cycle per plot and the lead time below."
        />
        <div className="gm-form-grid">
          <Field label="Remind me this many days ahead">
            <SelectInput
              value={draft.reminderLeadDays}
              onChange={(value) => set("reminderLeadDays", value)}
              options={["30", "45", "60", "90"]}
            />
          </Field>
          <Field label="Default lab">
            <SelectInput
              value={draft.defaultLab}
              onChange={(value) => set("defaultLab", value)}
              options={SOIL_LABS.map((item) => item.name)}
            />
          </Field>
          <Field label="Default test type">
            <SelectInput
              value={draft.defaultTestType}
              onChange={(value) => set("defaultTestType", value)}
              options={SOIL_TEST_TYPES.map((item) => item.label)}
            />
          </Field>
          <Field label="Units">
            <SelectInput
              value={draft.units}
              onChange={(value) => set("units", value)}
              options={["Metric (ppm, meq/100g)", "Imperial (lb/acre)"]}
            />
          </Field>
        </div>
        <Toggle
          checked={draft.moistureAlerts}
          onChange={(value) => set("moistureAlerts", value)}
          label="Moisture alerts from the balance chart"
          desc="Warns you when the forecast week drops below your moisture trigger."
        />
        <Field label="Moisture alert trigger (% of capacity)">
          <SelectInput
            value={draft.moistureThreshold}
            onChange={(value) => set("moistureThreshold", value)}
            options={["25", "30", "35", "40", "45"]}
          />
        </Field>
        <Toggle
          checked={draft.lowNutrientAlerts}
          onChange={(value) => set("lowNutrientAlerts", value)}
          label="Alert me when a nutrient falls below optimum"
          desc="Fires when a new lab result is loaded, before you buy anything."
        />
        <Toggle
          checked={draft.labResultsNotify}
          onChange={(value) => set("labResultsNotify", value)}
          label="Tell me when lab results are ready"
          desc="SMS and in-app notification with the reference number."
        />
        <Toggle
          checked={draft.shareWithAgronomist}
          onChange={(value) => set("shareWithAgronomist", value)}
          label="Let my agronomist see new results"
          desc="Peter Otieno advises on the fertilizer programme, so he needs the numbers."
        />
        <Toggle
          checked={draft.shareWithBuyer}
          onChange={(value) => set("shareWithBuyer", value)}
          label="Publish soil data to buyers"
          desc="Off by default. Buyers see it only through a link you create, after an audit."
        />
        <div className="gm-form-grid">
          <Field label="Language">
            <SelectInput
              value={draft.language}
              onChange={(value) => set("language", value)}
              options={[
                "English (Kiswahili guide available)",
                "Kiswahili",
                "English only",
              ]}
            />
          </Field>
          <Field label="Weekly digest day">
            <SelectInput
              value={draft.digestDay}
              onChange={(value) => set("digestDay", value)}
              options={["Sunday", "Monday", "Friday", "Saturday"]}
            />
          </Field>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            <CheckCircle2 /> Save settings
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function SoilFaqDialog({
  open,
  faq,
  glossary,
  onClose,
  onAskAgronomist,
  onOpenLibrary,
}: {
  open: boolean;
  faq: { q: string; a: string }[];
  glossary: { id: string; term: string; meaning: string }[];
  onClose: () => void;
  onAskAgronomist: () => void;
  onOpenLibrary: () => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [tab, setTab] = useState<"faq" | "glossary">("faq");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Soil testing FAQ & glossary"
      desc="How often to test, how the recommendations are built, and what the units mean."
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          {(["faq", "glossary"] as const).map((item) => (
            <button
              type="button"
              key={item}
              className={`gm-filter-chip ${tab === item ? "is-active" : ""}`}
              onClick={() => setTab(item)}
            >
              {item === "faq" ? `Questions (${faq.length})` : `Glossary (${glossary.length})`}
            </button>
          ))}
        </div>
        {tab === "faq" ? (
          <div className="gm-soil-faq">
            {faq.map((item, index) => (
              <div key={item.q}>
                <button
                  type="button"
                  className="gm-soil-faq-row"
                  aria-expanded={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <HelpCircle />
                  {item.q}
                  <i>{openIndex === index ? "Hide" : "Show answer"}</i>
                </button>
                {openIndex === index ? (
                  <div className="p-3" style={{ background: "var(--gm-mint-50)" }}>
                    <p className="mb-0" style={{ fontSize: "0.86rem" }}>
                      {item.a}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="gm-soil-review">
            {glossary.map((item) => (
              <ReviewRow key={item.id} label={item.term} value={item.meaning} />
            ))}
          </div>
        )}
        <Callout
          icon={BookOpen}
          title="Extension library"
          body="The KALRO soil management guide and the county sampling leaflet are in the community library, available offline by SMS code."
        />
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onOpenLibrary}>
            <BookOpen /> Open the library
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onAskAgronomist}>
            <Sprout /> Ask a verified agronomist
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function OrderDetailDialog({
  open,
  order,
  onClose,
  onSettle,
  onRepeat,
}: {
  open: boolean;
  order: SoilOrder | null;
  onClose: () => void;
  onSettle: (order: SoilOrder) => void;
  onRepeat: (order: SoilOrder) => void;
}) {
  if (!order) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={order.status === "Paid" ? `Receipt · ${order.item}` : `Finish · ${order.item}`}
      desc={`${order.plot} · ${order.date} · ${order.method}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          <ReviewRow label="Amount" value={kes(order.amount)} />
          <ReviewRow label="Status" value={order.status} />
          <ReviewRow
            label="Receipt"
            value={order.receipt === "—" ? "Not issued yet" : order.receipt}
          />
          <ReviewRow label="Note" value={order.note} />
        </div>
        {order.status === "Paid" ? (
          <SuccessState
            title="Paid and on file"
            body={`${kes(order.amount)} was settled on ${order.date}. The receipt is stored with the plot records for audit evidence.`}
            receipt={order.receipt}
            actionLabel="Close"
            onDone={onClose}
          />
        ) : (
          <PayPanel
            amount={order.amount}
            purpose={`${order.item} · ${order.plot}`}
            payee={order.method.includes("Co-op") ? "Githunguri Farmers Co-op" : "GrowMO input desk"}
            onPaid={() => {
              onSettle(order);
              onClose();
            }}
          />
        )}
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => {
              onRepeat(order);
              onClose();
            }}
          >
            <Plus /> Order the same test again
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function ConfirmSoilDialog({
  open,
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc="This changes what GrowMO recommends from today.">
      <div className="gm-soil-stack">
        <Callout icon={AlertTriangle} title="Please confirm" body={body} tone="warn" />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Keep it as it is
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function InputOrderWizard({
  open,
  steps,
  onClose,
  onOrdered,
}: {
  open: boolean;
  steps: FertilizerStep[];
  onClose: () => void;
  onOrdered: (summary: { lines: number; total: number; receipt: string; mode: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState("Group buying order");
  const [supplier, setSupplier] = useState("Githunguri Farmers Co-op");
  const [includeManure, setIncludeManure] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setVerified(false);
    setIncludeManure(true);
  }, [open]);

  const lines = steps.filter((item) => includeManure || item.application !== "Manure");
  const total = lines.reduce((sum, item) => sum + item.cost, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Order the soil-test inputs"
      desc="Buying only what the test says is short — the same list your agronomist approved."
    >
      <Stepper steps={["Lines", "Supplier & terms", "Confirm"]} current={step} />
      {step === 0 ? (
        <div className="gm-soil-stack">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Product</th>
                  <th>Rate/acre</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.application}</strong>
                    </td>
                    <td>{item.product}</td>
                    <td className="font-display">{item.ratePerAcre}</td>
                    <td className="font-display">KES {item.cost.toLocaleString("en-KE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Toggle
            checked={includeManure}
            onChange={setIncludeManure}
            label="Include farmyard manure in this order"
            desc="Turn it off if the manure is coming from your own cattle."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(1)}>
              Supplier & terms
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-soil-stack">
          <div className="gm-form-grid">
            <Field label="Supplier">
              <SelectInput
                value={supplier}
                onChange={setSupplier}
                options={[
                  "Githunguri Farmers Co-op",
                  "Kenya Seed Depot, Thika",
                  "Nakuru Lime Works",
                  "Real IPM Kenya, Thika",
                  "Jogoo Agro Supplies, Nairobi",
                ]}
              />
            </Field>
            <Field label="Payment terms">
              <SelectInput
                value={mode}
                onChange={setMode}
                options={[
                  "Group buying order",
                  "Pay now by M-Pesa",
                  "Pay on delivery",
                  "Group input loan (repay after harvest)",
                ]}
              />
            </Field>
          </div>
          <div className="gm-soil-review">
            <ReviewRow label="Lines" value={`${lines.length}`} />
            <ReviewRow label="Total" value={kes(total)} />
            <ReviewRow label="Delivery" value="Githunguri co-op store, 24 – 28 Sep 2026" />
            <ReviewRow label="Lime delivery" value="Nakuru Lime Works, 2 tonnes, same window" />
          </div>
          <Callout
            icon={Truck}
            title="Delivery order matters"
            body="Lime arrives first so it can be spread and incorporated, then the DAP and CAN follow for planting and top-dressing."
          />
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(0)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={() => setStep(2)}>
              Confirm the order
            </button>
          </div>
        </div>
      ) : (
        <div className="gm-soil-stack">
          <div className="gm-soil-review">
            <ReviewRow label="Supplier" value={supplier} />
            <ReviewRow label="Terms" value={mode} />
            <ReviewRow label="Lines" value={`${lines.length} products`} />
            <ReviewRow label="Total" value={kes(total)} />
            <ReviewRow label="Collect from" value="Githunguri co-op store" />
          </div>
          <button
            type="button"
            className={`gm-checkcard ${verified ? "on" : ""}`}
            onClick={() => setVerified(!verified)}
          >
            <input type="checkbox" checked={verified} readOnly tabIndex={-1} />
            <span>
              <strong>I have checked the rates against the soil test</strong>
              <small>
                Lime {kes(8000)}, DAP {kes(6500)}, CAN {kes(5000)} and {kes(2500)}, foliar{" "}
                {kes(1400)} and {kes(600)}, manure {kes(30000)}.
              </small>
            </span>
          </button>
          {mode === "Pay now by M-Pesa" ? (
            <PayPanel
              amount={total}
              purpose={`Soil-test input order · ${lines.length} lines`}
              payee={supplier}
              onPaid={(receipt) => {
                onOrdered({ lines: lines.length, total, receipt, mode });
                onClose();
              }}
            />
          ) : (
            <div className="d-flex justify-content-between gap-2">
              <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                disabled={!verified}
                onClick={() => {
                  onOrdered({
                    lines: lines.length,
                    total,
                    receipt: mode === "Group input loan (repay after harvest)" ? "QKSOILLOAN" : "QKSOILORDER",
                    mode,
                  });
                  onClose();
                }}
              >
                <Package /> Place the order
              </button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}

export function SoilContactDialog({
  open,
  lab,
  onClose,
  onSent,
}: {
  open: boolean;
  lab: SoilLab | null;
  onClose: () => void;
  onSent: (channel: string, message: string) => void;
}) {
  const [channel, setChannel] = useState("Phone call");
  const [message, setMessage] = useState(
    "Habari. Naomba kufahamu gharama ya upimaji kamili wa udongo kwa ekari moja na muda wa matokeo. Asante.",
  );

  useEffect(() => {
    if (!open) return;
    setChannel("Phone call");
  }, [open]);

  if (!lab) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Contact ${lab.name}`}
      desc={`${lab.phone} · ${lab.email}`}
    >
      <div className="gm-soil-stack">
        <div className="d-flex flex-wrap gap-2">
          {["Phone call", "SMS", "Email", "WhatsApp"].map((item) => (
            <button
              type="button"
              key={item}
              className={`gm-filter-chip ${channel === item ? "is-active" : ""}`}
              onClick={() => setChannel(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <Field label="Message">
          <textarea
            className="gm-textarea"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
        <div className="gm-soil-review">
          <ReviewRow label="Lab" value={lab.name} />
          <ReviewRow label="Turnaround" value={lab.turnaround} />
          <ReviewRow label="Sample delivery" value={lab.courier} />
          <ReviewRow label="Your number" value={SOIL_CONTEXT.phone} />
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={message.trim().length < 10}
            onClick={() => {
              onSent(channel, message);
              onClose();
            }}
          >
            <Send /> Send via {channel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function CompareTestsDialog({
  open,
  latest,
  previous,
  onClose,
  onAddPlan,
}: {
  open: boolean;
  latest: SoilHistoryRow | null;
  previous: SoilHistoryRow | null;
  onClose: () => void;
  onAddPlan: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setNote("");
  }, [open]);

  if (!latest) return null;

  const rows: { label: string; key: keyof SoilHistoryRow; unit: string }[] = [
    { label: "pH", key: "ph", unit: "" },
    { label: "Organic matter", key: "organicMatter", unit: "%" },
    { label: "Nitrogen", key: "nitrogen", unit: "ppm" },
    { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
    { label: "Potassium", key: "potassium", unit: "ppm" },
    { label: "Calcium", key: "calcium", unit: "ppm" },
    { label: "Zinc", key: "zinc", unit: "ppm" },
    { label: "Boron", key: "boron", unit: "ppm" },
    { label: "CEC", key: "cec", unit: "meq/100g" },
    { label: "Health score", key: "score", unit: "/100" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Compare soil tests"
      desc={previous ? `${previous.year} against ${latest.year}` : `${latest.year} on its own`}
    >
      <div className="gm-soil-stack">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Parameter</th>
                {previous ? <th>{previous.year}</th> : null}
                <th>{latest.year}</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const now = latest[row.key] as number;
                const before = previous ? (previous[row.key] as number) : undefined;
                const delta = before === undefined ? undefined : now - before;
                return (
                  <tr key={row.label}>
                    <td>
                      <strong>{row.label}</strong>
                      <small className="d-block text-muted">{row.unit}</small>
                    </td>
                    {previous ? <td className="font-display">{before}</td> : null}
                    <td className="font-display">{now}</td>
                    <td>
                      {delta === undefined ? (
                        <span className="text-muted">first record</span>
                      ) : (
                        <span className={`gm-soil-net ${delta >= 0 ? "is-positive" : "is-negative"}`}>
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Callout
          icon={Sprout}
          title={previous ? "Trend summary" : "Single record"}
          body={
            previous
              ? `${latest.trend} The biggest mover is organic matter — that is the manure and compost programme paying off.`
              : latest.trend
          }
        />
        <Field label="What will you do about the gap?">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Increase manure to 6 t/acre on Plot 1 and add a lablab cover crop in the off-season."
          />
        </Field>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={note.trim().length < 8}
            onClick={() => {
              onAddPlan(note);
              onClose();
            }}
          >
            <ClipboardCheck /> Add the action to my season plan
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function CompostBatchDialog({
  open,
  batch,
  onClose,
  onTurned,
  onApplied,
}: {
  open: boolean;
  batch: CompostBatch | null;
  onClose: () => void;
  onTurned: (batch: CompostBatch) => void;
  onApplied: (batch: CompostBatch, plot: string, tonnes: string) => void;
}) {
  const [plot, setPlot] = useState(SOIL_PLOTS[0].name);
  const [tonnes, setTonnes] = useState("1");

  useEffect(() => {
    if (!open) return;
    setPlot(SOIL_PLOTS[0].name);
    setTonnes("1");
  }, [open]);

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Compost batch ${batch.batch}`}
      desc={`${batch.material} · built ${batch.started} · ${batch.volume}`}
    >
      <div className="gm-soil-stack">
        <div className="gm-soil-review">
          <ReviewRow label="Stage" value={batch.stage} />
          <ReviewRow label="Temperature" value={batch.temperature} />
          <ReviewRow label="Last turned" value={batch.turned} />
          <ReviewRow label="Quality" value={batch.quality} />
          <ReviewRow label="Ready on" value={batch.ready} />
          <ReviewRow label="Applied to" value={batch.appliedTo} />
        </div>
        <Callout
          icon={Thermometer}
          title={batch.stage === "Curing" || batch.stage === "Ready" ? "Almost ready" : "Still heating"}
          body={
            batch.stage === "Ready"
              ? "This batch is finished. Screen it and take it to the plot within two weeks so the nutrients are not leached by rain."
              : "Keep turning on schedule. If the temperature drops below 40 °C before week four, the heap has dried out — add water while turning."
          }
          tone={batch.stage === "Ready" ? "good" : "info"}
        />
        <div className="gm-form-grid">
          <Field label="Apply to plot">
            <SelectInput value={plot} onChange={setPlot} options={SOIL_PLOTS.map((item) => item.name)} />
          </Field>
          <Field label="Tonnes applied">
            <TextInput value={tonnes} type="number" onChange={setTonnes} />
          </Field>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => {
              onTurned(batch);
              onClose();
            }}
          >
            <Timer /> Log a turn today
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onApplied(batch, plot, tonnes);
              onClose();
            }}
          >
            <CheckCircle2 /> Apply to {plot}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
