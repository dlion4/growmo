/* ============================================================================
   PAGE 12 WORKFLOWS — diary, spray, purchases, batches, certification, soil
   sample, exports, data sharing and record settings.

   Every dialog here completes a real state change (a saved record, a closed
   checklist item, a generated file, an M-Pesa style receipt) or writes a
   corrective action into the page. Nothing is a "coming soon" placeholder.
   ========================================================================== */
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  Package,
  Printer,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sprout,
  Trash2,
  TriangleAlert,
  Upload,
  Warehouse,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  CertChecklistItem,
  Certification,
  ComplianceGap,
  DiaryEntry,
  DiaryEntryType,
  HarvestBatch,
  PurchaseCategory,
  PurchaseRecord,
  SoilSample,
  SprayRecord,
} from "../../data/app/records";
import {
  AUDITORS,
  CERTIFICATIONS,
  DIARY_TEMPLATES,
  DIARY_TYPES,
  EVIDENCE_DOCUMENTS,
  HARVEST_BATCHES,
  PURCHASES,
  RECORD_CONTEXT,
  RECORD_SETTINGS,
  SPRAY_PRODUCTS,
  SPRAY_RECORDS,
} from "../../data/app/records";
import { kes } from "../../data/site";
import { Dialog, OtpInput, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";
import { QrTile, RecordKvList, TraceTimeline } from "./RecordsWidgets";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + days * 86400000;
  const dt = new Date(t);
  return `${String(dt.getUTCDate()).padStart(2, "0")} ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
}

function makeRef(seed: string) {
  const body = seed
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(-4)
    .padEnd(4, "X");
  return `QK${body}${(seed.length * 37) % 97}${body.length}PL`;
}

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
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`gm-field ${className}`}>
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
  min,
}: {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
}) {
  return (
    <input
      className="gm-input"
      value={value}
      type={type}
      min={min}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      className="gm-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
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
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="gm-rec-callout">
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
    <div className="gm-rec-stack">
      <div className="gm-rec-success">
        <span className="gm-rec-success-mark">
          <CheckCircle2 />
        </span>
        <h4 className="font-display mb-1">{title}</h4>
        <p className="text-muted mb-2">{body}</p>
        {receipt ? (
          <div className="gm-rec-receipt">
            <small>Reference</small>
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

/* ============================ 1. FARM DIARY ============================== */

export function DiaryWizard({
  open,
  defaultDate = "2026-09-20",
  editing = null,
  onClose,
  onSave,
}: {
  open: boolean;
  defaultDate?: string;
  editing?: DiaryEntry | null;
  onClose: () => void;
  onSave: (entry: DiaryEntry) => void;
}) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<DiaryEntryType>("Activity");
  const [date, setDate] = useState(defaultDate);
  const [content, setContent] = useState("");
  const [crop, setCrop] = useState("Cabbage");
  const [variety, setVariety] = useState("Gloria F1");
  const [plot, setPlot] = useState("Plot 1");
  const [location, setLocation] = useState("Plot 1");
  const [weather, setWeather] = useState("Cloudy, 22°C");
  const [author, setAuthor] = useState("Mary Wanjiku");
  const [tags, setTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const steps = ["Entry type", "What happened", "Photos & review"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSaving(false);
    if (editing) {
      setType(editing.type);
      setDate(editing.iso);
      setContent(editing.content);
      setCrop(editing.crop);
      setVariety(editing.variety);
      setPlot(editing.plot);
      setLocation(editing.location);
      setWeather(editing.weather);
      setAuthor(editing.author);
      setTags(editing.tags);
      setPhotos(editing.photos);
    } else {
      setType("Activity");
      setDate(defaultDate);
      setContent("");
      setCrop("Cabbage");
      setVariety("Gloria F1");
      setPlot("Plot 1");
      setLocation("Plot 1");
      setWeather("Cloudy, 22°C");
      setAuthor("Mary Wanjiku");
      setTags([]);
      setPhotos([]);
    }
  }, [open, editing, defaultDate]);

  const applyTemplate = (id: string) => {
    const template = DIARY_TEMPLATES.find((item) => item.id === id);
    if (!template) return;
    setType(template.type);
    setContent(template.body);
    setTags(template.tags);
  };

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      const entry: DiaryEntry = {
        id: editing?.id ?? `d-new-${Date.now()}`,
        date: addDays(date, 0),
        iso: date,
        type,
        content,
        crop,
        variety,
        plot,
        location,
        weather,
        author,
        photos,
        tags,
        linked: editing?.linked ?? "",
        severity: type === "Problem" ? "medium" : editing?.severity,
      };
      onSave(entry);
      onClose();
    }, 700);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={editing ? `Edit diary entry · ${editing.date}` : "New farm diary entry"}
      desc="Records feed the compliance pack, the AI advisor and the buyer passport."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Entry date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
            <Field label="Entry type">
              <SelectInput
                value={type}
                onChange={(value) => setType(value as DiaryEntryType)}
                options={DIARY_TYPES}
              />
            </Field>
            <Field label="Crop">
              <SelectInput
                value={crop}
                onChange={setCrop}
                options={["Cabbage", "Kale", "Tomato", "Maize", "Beans", "Potato"]}
              />
            </Field>
            <Field label="Variety">
              <SelectInput
                value={variety}
                onChange={setVariety}
                options={[
                  "Gloria F1",
                  "Sukuma wiki Thousand Headed",
                  "Roma VF",
                  "H6213",
                  "Rosecoco",
                  "Shangi",
                ]}
              />
            </Field>
            <Field label="Plot">
              <SelectInput
                value={plot}
                onChange={(value) => {
                  setPlot(value);
                  setLocation(value);
                }}
                options={["Plot 1", "Plot 2", "Plot 3", "Plot 4", "Plot 5", "—"]}
              />
            </Field>
            <Field label="Recorded by">
              <SelectInput
                value={author}
                onChange={setAuthor}
                options={["Mary Wanjiku", "John Mwangi", "Jane Njeri", "Kamau Mwangi"]}
              />
            </Field>
          </div>
          <div>
            <span className="gm-field-label">Quick templates</span>
            <div className="d-flex flex-wrap gap-2">
              {DIARY_TEMPLATES.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className="gm-filter-chip"
                  onClick={() => applyTemplate(template.id)}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <Callout
            icon={ClipboardCheck}
            title="Why the type matters"
            body="KS1758 auditors look for a mix of activity, observation and decision entries — not only spray records."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Write the entry"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <Field
            label="What happened? (English or Kiswahili)"
            hint="Be specific: numbers, areas, plant counts and who did the work."
          >
            <textarea
              className="gm-textarea"
              rows={5}
              value={content}
              placeholder="e.g. Transplanted 4,200 cabbage seedlings to Plot 1 at 60 cm × 45 cm spacing."
              onChange={(event) => setContent(event.target.value)}
            />
          </Field>
          <div className="gm-form-grid">
            <Field label="Exact location">
              <TextInput
                value={location}
                onChange={setLocation}
                placeholder="Plot 1 · NW corner"
              />
            </Field>
            <Field label="Weather at the time">
              <TextInput
                value={weather}
                onChange={setWeather}
                placeholder="Rainy, 21°C, 12 mm"
              />
            </Field>
          </div>
          <div>
            <span className="gm-field-label">Tags</span>
            <div className="d-flex flex-wrap gap-2">
              {["scouting", "spray", "rain", "labour", "market", "decision", "sanitation"].map(
                (tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      className={`gm-filter-chip ${active ? "is-active" : ""}`}
                      onClick={() =>
                        setTags((current) =>
                          active ? current.filter((item) => item !== tag) : [...current, tag],
                        )
                      }
                    >
                      #{tag}
                    </button>
                  );
                },
              )}
            </div>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Add photos"
            nextDisabled={content.trim().length < 12}
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Attach a photo" hint="Camera or gallery — stored offline first.">
              <div className="d-flex flex-wrap gap-2">
                {["plot-photo.jpg", "pest-damage.jpg", "sprayer-calibration.jpg"].map(
                  (photo) => (
                    <button
                      type="button"
                      key={photo}
                      className="gm-filter-chip"
                      onClick={() =>
                        setPhotos((current) =>
                          current.includes(photo)
                            ? current.filter((item) => item !== photo)
                            : [...current, photo],
                        )
                      }
                    >
                      <Camera /> {photo}
                    </button>
                  ),
                )}
              </div>
            </Field>
            <Field label="Photo count">
              <TextInput value={String(photos.length)} onChange={() => undefined} />
            </Field>
          </div>
          <div className="gm-rec-review">
            <ReviewRow label="Date" value={addDays(date, 0)} />
            <ReviewRow label="Type" value={type} />
            <ReviewRow label="Crop" value={`${crop} · ${variety}`} />
            <ReviewRow label="Plot" value={plot} />
            <ReviewRow label="Recorded by" value={author} />
            <ReviewRow label="Tags" value={tags.length ? tags.map((t) => `#${t}`).join(" ") : "—"} />
          </div>
          <div className="gm-rec-callout">
            <Sprout />
            <span>
              <strong>Entry preview</strong>
              <small>{content}</small>
            </span>
          </div>
          {saving ? (
            <div className="gm-rec-processing">
              <LoaderCircle />
              <strong>Saving to the farm record book…</strong>
              <small>Written on the phone first, then synced to the cloud.</small>
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={save}
            finishLabel={editing ? "Save changes" : "Save diary entry"}
            nextDisabled={saving}
          />
        </div>
      )}
    </Dialog>
  );
}

export function PhotoViewerDialog({
  photo,
  onClose,
  onAttach,
}: {
  photo: string | null;
  onClose: () => void;
  onAttach: (photo: string) => void;
}) {
  return (
    <Dialog
      open={Boolean(photo)}
      onClose={onClose}
      title={photo ?? "Photo"}
      desc="Evidence photo attached to a farm diary entry."
    >
      <div className="gm-rec-stack">
        <div className="gm-rec-callout">
          <Camera />
          <span>
            <strong>{photo}</strong>
            <small>Githunguri, Kiambu · captured on the GrowMO app</small>
          </span>
        </div>
        <RecordKvList
          rows={[
            { label: "Uploaded by", value: RECORD_CONTEXT.farmer },
            { label: "Linked record", value: "12.1 Farm diary" },
            { label: "Stored", value: "On device + cloud backup" },
            { label: "GPS stamp", value: "-1.0563, 36.7672 (Plot 1)" },
          ]}
        />
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              if (photo) onAttach(photo);
              onClose();
            }}
          >
            <Upload /> Attach to compliance pack
          </button>
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ======================= 2. CONFIRM / DESTRUCTIVE ======================= */

export function ConfirmRecordDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = "danger",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  tone?: "danger" | "safe";
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc="This action is recorded in the audit log.">
      <div className="gm-rec-stack">
        <Callout
          icon={tone === "danger" ? AlertTriangle : ShieldCheck}
          title={tone === "danger" ? "Careful — records are evidence" : "Confirm the change"}
          body={body}
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`gm-btn ${tone === "danger" ? "gm-btn-danger-soft" : "gm-btn-lime"}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {tone === "danger" ? <Trash2 /> : <CheckCircle2 />} {confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ============================ 3. SPRAY RECORD =========================== */

export function SprayWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (record: SprayRecord) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [plot, setPlot] = useState("Plot 1");
  const [target, setTarget] = useState("Black rot");
  const [productId, setProductId] = useState(SPRAY_PRODUCTS[0].id);
  const [batchNo, setBatchNo] = useState("MB2026-11");
  const [calibration, setCalibration] = useState("1.2 L/min");
  const [volume, setVolume] = useState("100");
  const [area, setArea] = useState("0.5");
  const [date, setDate] = useState("2026-09-20");
  const [applicator, setApplicator] = useState("Self");
  const [wind, setWind] = useState("4");
  const [temp, setTemp] = useState("23");
  const [ppe, setPpe] = useState<string[]>(["Gloves", "N95 mask", "Overalls", "Gumboots"]);
  const [saving, setSaving] = useState(false);
  const steps = ["Crop & target", "Product & rate", "Conditions & PPE", "PHI review"];

  const product = SPRAY_PRODUCTS.find((item) => item.id === productId) ?? SPRAY_PRODUCTS[0];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSaving(false);
  }, [open]);

  const ppeOptions = ["Gloves", "N95 mask", "Face mask", "Overalls", "Gumboots", "Goggles"];
  const ppeComplete = ppe.includes("Gloves") && ppe.includes("Overalls");
  const windOk = Number(wind) <= 10;
  const nextSafe = addDays(date, product.phiDays);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      const record: SprayRecord = {
        id: `sr-new-${Date.now()}`,
        code: `SR-${String(SPRAY_RECORDS.length + 1).padStart(3, "0")}`,
        date: addDays(date, 0),
        iso: date,
        crop,
        variety:
          crop === "Cabbage"
            ? "Gloria F1"
            : crop === "Kale"
              ? "Sukuma wiki Thousand Headed"
              : "Roma VF",
        plot,
        target,
        product: product.name,
        activeIngredient: product.activeIngredient,
        pcpbNo: product.pcpbNo,
        batchNo,
        rate: product.rate,
        volumeMixed: `${volume} L`,
        areaTreated: `${area} acre`,
        applicator,
        ppe,
        wind: `${wind} km/h`,
        temp: `${temp}°C`,
        phiDays: product.phiDays,
        reiHours: product.reiHours,
        nextSafeHarvest: nextSafe,
        status: ppeComplete && windOk ? "Complete" : "Incomplete",
        cost: product.price,
        receipt: makeRef(`spray${batchNo}${volume}`),
        notes: calibration
          ? `Sprayer calibrated at ${calibration}. ${target} control on ${plot}.`
          : "Calibration value still required.",
      };
      onSave(record);
      onClose();
    }, 700);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Log a spray application"
      desc="A compliance-grade record: product, batch, rate, conditions, PPE and the pre-harvest interval."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Crop">
              <SelectInput
                value={crop}
                onChange={setCrop}
                options={["Cabbage", "Kale", "Tomato", "Potato", "Maize"]}
              />
            </Field>
            <Field label="Plot">
              <SelectInput
                value={plot}
                onChange={setPlot}
                options={["Plot 1", "Plot 2", "Plot 3", "Plot 4", "Plot 5"]}
              />
            </Field>
            <Field label="Pest or disease target" className="full">
              <SelectInput
                value={target}
                onChange={setTarget}
                options={[
                  "Black rot",
                  "Black rot (preventive)",
                  "Aphids",
                  "Diamondback moth",
                  "Cutworm",
                  "Whitefly (vector control)",
                  "Late blight",
                  "Grasshoppers",
                ]}
              />
            </Field>
            <Field label="Application date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
            <Field label="Applicator">
              <SelectInput
                value={applicator}
                onChange={setApplicator}
                options={["Self", "John Mwangi", "Jane Njeri", "Kamau Mwangi"]}
              />
            </Field>
          </div>
          <Callout
            icon={Sprout}
            title="Rotation check"
            body={`Last spray on ${plot} was logged in the record book. Rotate the active-ingredient group to slow resistance.`}
          />
          <WizardActions
            step={step}
            last={3}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Choose product"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <Field label="Registered product (PCPB approved)">
            <SelectInput
              value={productId}
              onChange={setProductId}
              options={SPRAY_PRODUCTS.map((item) => item.id)}
            />
          </Field>
          <div className="gm-rec-review">
            <ReviewRow label="Product" value={product.name} />
            <ReviewRow label="Active ingredient" value={product.activeIngredient} />
            <ReviewRow label="PCPB number" value={product.pcpbNo} />
            <ReviewRow label="Label rate" value={product.rate} />
            <ReviewRow label="PHI" value={`${product.phiDays} days`} />
            <ReviewRow label="Re-entry" value={`${product.reiHours} hours`} />
            <ReviewRow label="Stock on hand" value={product.stockLeft} />
            <ReviewRow label="Hazard class" value={product.hazardClass} />
          </div>
          <div className="gm-form-grid">
            <Field label="Batch / lot number">
              <TextInput value={batchNo} onChange={setBatchNo} placeholder="MB2026-11" />
            </Field>
            <Field label="Sprayer calibration">
              <SelectInput
                value={calibration}
                onChange={setCalibration}
                options={["1.0 L/min", "1.2 L/min", "1.5 L/min", "Not calibrated"]}
              />
            </Field>
            <Field label="Volume mixed (litres)">
              <TextInput value={volume} type="number" onChange={setVolume} />
            </Field>
            <Field label="Area treated (acre)">
              <TextInput value={area} type="number" onChange={setArea} />
            </Field>
          </div>
          {calibration === "Not calibrated" ? (
            <Callout
              icon={TriangleAlert}
              title="Calibration missing blocks compliance"
              body="An audit cannot verify the dose without a calibration value. Record it before saving."
            />
          ) : null}
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Conditions & PPE"
            nextDisabled={calibration === "Not calibrated"}
          />
        </div>
      ) : step === 2 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid cols3">
            <Field label="Wind speed (km/h)" hint="Do not spray above 10 km/h.">
              <TextInput value={wind} type="number" onChange={setWind} />
            </Field>
            <Field label="Temperature (°C)">
              <TextInput value={temp} type="number" onChange={setTemp} />
            </Field>
            <Field label="Volume / area">
              <TextInput value={`${volume} L / ${area} acre`} onChange={() => undefined} />
            </Field>
          </div>
          <div>
            <span className="gm-field-label">Personal protective equipment used</span>
            <div className="d-flex flex-wrap gap-2">
              {ppeOptions.map((item) => {
                const active = ppe.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    className={`gm-filter-chip ${active ? "is-active" : ""}`}
                    onClick={() =>
                      setPpe((current) =>
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
          {!windOk ? (
            <Callout
              icon={Ban}
              title="Wind above the label limit"
              body="Hold the spray, or shield the nozzle and re-check the wind. The record will be flagged as incomplete."
            />
          ) : null}
          {!ppeComplete ? (
            <Callout
              icon={TriangleAlert}
              title="Minimum PPE: gloves + overalls"
              body="PCPB training requires gloves and a full overall for any registered product."
            />
          ) : null}
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Check the PHI"
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-rec-review">
            <ReviewRow label="Crop / plot" value={`${crop} · ${plot}`} />
            <ReviewRow label="Target" value={target} />
            <ReviewRow label="Product" value={product.name} />
            <ReviewRow label="Batch" value={batchNo} />
            <ReviewRow label="Rate" value={product.rate} />
            <ReviewRow label="Mixed / treated" value={`${volume} L over ${area} acre`} />
            <ReviewRow label="Wind / temp" value={`${wind} km/h · ${temp}°C`} />
            <ReviewRow label="PPE" value={ppe.join(", ") || "None recorded"} />
            <ReviewRow label="PHI" value={`${product.phiDays} days`} />
            <ReviewRow label="Next safe harvest" value={nextSafe} />
            <ReviewRow label="Cost of product" value={kes(product.price)} />
            <ReviewRow
              label="Record status"
              value={ppeComplete && windOk ? "Complete" : "Incomplete — needs follow-up"}
            />
          </div>
          <Callout
            icon={ShieldCheck}
            title={`Harvest safety: ${nextSafe}`}
            body="Crates cannot carry the QR batch label until this date passes. The compliance centre tracks it for you."
          />
          {saving ? (
            <div className="gm-rec-processing">
              <LoaderCircle />
              <strong>Saving spray record…</strong>
              <small>Syncing with the compliance centre and the PHI calendar.</small>
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(2)}
            onNext={save}
            finishLabel="Save spray record"
            nextDisabled={saving}
          />
        </div>
      )}
    </Dialog>
  );
}

export function SprayDetailDialog({
  open,
  record,
  onClose,
  onComplete,
  onCorrective,
}: {
  open: boolean;
  record: SprayRecord | null;
  onClose: () => void;
  onComplete: (record: SprayRecord) => void;
  onCorrective: (record: SprayRecord) => void;
}) {
  if (!record) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${record.code} · ${record.product}`}
      desc={`${record.crop} ${record.plot} · applied ${record.date}`}
    >
      <div className="gm-rec-stack">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <StatusChip label={record.status} tone={record.status === "Complete" ? "low" : "high"} />
          <StatusChip label={`PHI ${record.phiDays} days`} tone="neutral" />
          <StatusChip label={`Re-entry ${record.reiHours} h`} tone="neutral" />
          <StatusChip label={`Safe harvest ${record.nextSafeHarvest}`} tone={record.status === "Complete" ? "low" : "medium"} />
        </div>
        <RecordKvList
          rows={[
            { label: "Target", value: record.target },
            { label: "Active ingredient", value: record.activeIngredient },
            { label: "PCPB number", value: record.pcpbNo },
            { label: "Batch / lot", value: record.batchNo },
            { label: "Rate", value: record.rate },
            { label: "Volume mixed", value: record.volumeMixed },
            { label: "Area treated", value: record.areaTreated },
            { label: "Applicator", value: record.applicator },
            { label: "PPE used", value: record.ppe.join(", ") || "Not recorded" },
            { label: "Wind", value: record.wind },
            { label: "Temperature", value: record.temp },
            { label: "Product cost", value: kes(record.cost) },
            { label: "M-Pesa reference", value: record.receipt || "No purchase reference" },
          ]}
        />
        <Callout icon={FileText} title="Auditor note" body={record.notes} />
        <div className="d-flex flex-wrap gap-2">
          {record.status === "Incomplete" ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onComplete(record);
                onClose();
              }}
            >
              <CheckCircle2 /> Complete the record
            </button>
          ) : null}
          {record.status === "Blocked" || !record.ppe.includes("Overalls") ? (
            <button
              type="button"
              className="gm-btn gm-btn-danger-soft"
              onClick={() => {
                onCorrective(record);
                onClose();
              }}
            >
              <TriangleAlert /> Open corrective action
            </button>
          ) : null}
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              downloadText(
                `growmo-spray-${record.code}.csv`,
                [
                  "Field,Value",
                  ...[
                    ["Code", record.code],
                    ["Date", record.date],
                    ["Crop", record.crop],
                    ["Plot", record.plot],
                    ["Target", record.target],
                    ["Product", record.product],
                    ["Active ingredient", record.activeIngredient],
                    ["Batch", record.batchNo],
                    ["Rate", record.rate],
                    ["Volume", record.volumeMixed],
                    ["Area", record.areaTreated],
                    ["Applicator", record.applicator],
                    ["PPE", record.ppe.join("; ")],
                    ["Wind", record.wind],
                    ["Temperature", record.temp],
                    ["PHI days", record.phiDays],
                    ["Next safe harvest", record.nextSafeHarvest],
                  ].map((row) => row.map(csvCell).join(",")),
                ].join("\n"),
              );
            }}
          >
            <Download /> Export this record
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function CorrectiveActionWizard({
  open,
  record,
  onClose,
  onSaved,
}: {
  open: boolean;
  record: SprayRecord | null;
  onClose: () => void;
  onSaved: (summary: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [cause, setCause] = useState(
    record?.wind && Number.parseInt(record.wind, 10) > 10
      ? "Wind rose above the label limit mid-application"
      : "PPE incomplete at the time of application",
  );
  const [actions, setActions] = useState<string[]>([
    "Re-train applicators on the PPE matrix",
    "Add a wind check step to the spray SOP",
  ]);
  const [owner, setOwner] = useState("Mary Wanjiku");
  const [due, setDue] = useState("2026-10-04");
  const [outcome, setOutcome] = useState("");
  const steps = ["What happened", "Corrective plan", "Close the action"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setOutcome("");
  }, [open]);

  const actionOptions = [
    "Re-train applicators on the PPE matrix",
    "Add a wind check step to the spray SOP",
    "Replace the damaged overall and mask",
    "Buy a personal wind meter (anemometer)",
    "Re-spray only within label wind limits",
    "Record a toolbox talk for the team",
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Corrective action report"
      desc={
        record
          ? `${record.code} · ${record.product} on ${record.plot}`
          : "Non-conformity raised from the compliance centre"
      }
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <Field label="Root cause">
            <textarea
              className="gm-textarea"
              rows={3}
              value={cause}
              onChange={(event) => setCause(event.target.value)}
            />
          </Field>
          <Callout
            icon={TriangleAlert}
            title="Why this matters for the audit"
            body="KS1758 asks for evidence that the farm noticed the non-conformity and acted on it. A closed action beats a perfect record."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Plan the fix"
            nextDisabled={cause.trim().length < 8}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div>
            <span className="gm-field-label">Corrective actions</span>
            <div className="d-flex flex-column gap-2">
              {actionOptions.map((option) => {
                const active = actions.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    className={`gm-checkcard ${active ? "on" : ""}`}
                    onClick={() =>
                      setActions((current) =>
                        active
                          ? current.filter((item) => item !== option)
                          : [...current, option],
                      )
                    }
                  >
                    <input type="checkbox" checked={active} readOnly tabIndex={-1} />
                    <span>
                      <strong>{option}</strong>
                      <small>Evidence will be attached when the action closes.</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="gm-form-grid">
            <Field label="Owner">
              <SelectInput
                value={owner}
                onChange={setOwner}
                options={["Mary Wanjiku", "John Mwangi", "Jane Njeri", "Kamau Mwangi"]}
              />
            </Field>
            <Field label="Due date">
              <TextInput value={due} type="date" onChange={setDue} />
            </Field>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Record the outcome"
            nextDisabled={actions.length === 0}
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <Field label="What was done, and by whom?">
            <textarea
              className="gm-textarea"
              rows={3}
              value={outcome}
              placeholder="e.g. Toolbox talk held with 4 workers on 26 Sep 2026; new wind meter purchased for KES 2,800."
              onChange={(event) => setOutcome(event.target.value)}
            />
          </Field>
          <div className="gm-rec-review">
            <ReviewRow label="Owner" value={owner} />
            <ReviewRow label="Due" value={addDays(due, 0)} />
            <ReviewRow label="Actions" value={`${actions.length} planned`} />
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={outcome.trim().length < 8}
              onClick={() => {
                onSaved(
                  `Corrective action closed · ${owner} · due ${addDays(due, 0)}`,
                );
                onClose();
              }}
            >
              <ClipboardCheck /> Close the action
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ========================= 4. INPUT PURCHASES =========================== */

export function PurchaseWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (record: PurchaseRecord) => void;
}) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("2026-09-20");
  const [supplier, setSupplier] = useState("Githunguri Agro-vet");
  const [supplierPhone, setSupplierPhone] = useState("0722 418 390");
  const [supplierCounty, setSupplierCounty] = useState("Kiambu");
  const [invoice, setInvoice] = useState("INV-4590");
  const [input, setInput] = useState("CAN 26% N (50 kg)");
  const [category, setCategory] = useState<PurchaseCategory>("Fertilizer");
  const [qty, setQty] = useState("1 bag");
  const [unitPrice, setUnitPrice] = useState("4200");
  const [batchNo, setBatchNo] = useState("CAN-KEL-2026-08");
  const [expiry, setExpiry] = useState("Aug 2029");
  const [certNo, setCertNo] = useState("KEBS-FC-2210");
  const [store, setStore] = useState("Farm store · shelf B");
  const [receipt, setReceipt] = useState(true);
  const [paidBy, setPaidBy] = useState("M-Pesa (GrowMO wallet)");
  const [saving, setSaving] = useState(false);
  const steps = ["Supplier & invoice", "Item & price", "Documentation"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSaving(false);
  }, [open]);

  const total = (Number(unitPrice) || 0) * (Number.parseInt(qty, 10) || 1);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onSave({
        id: `pur-new-${Date.now()}`,
        date: addDays(date, 0),
        iso: date,
        input,
        category,
        supplier,
        supplierPhone,
        supplierCounty,
        invoiceNo: invoice,
        qty,
        unitPrice: Number(unitPrice) || 0,
        total,
        batchNo,
        expiry,
        certNo,
        receipt,
        mpesa: receipt ? makeRef(invoice + supplier) : "",
        store,
      });
      onClose();
    }, 700);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Record an input purchase"
      desc="Invoice, batch number, certificate and receipt — the paper trail a buyer traces back to the shop."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Purchase date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
            <Field label="Invoice / delivery note number">
              <TextInput value={invoice} onChange={setInvoice} />
            </Field>
            <Field label="Supplier">
              <SelectInput
                value={supplier}
                onChange={setSupplier}
                options={[
                  "Githunguri Agro-vet",
                  "Kenya Seed Depot, Thika",
                  "Githunguri Farmers Co-op",
                  "Real IPM Kenya, Thika",
                  "Nakuru Lime Works",
                  "Jogoo Agro Supplies, Nairobi",
                ]}
              />
            </Field>
            <Field label="Supplier phone">
              <TextInput value={supplierPhone} onChange={setSupplierPhone} />
            </Field>
            <Field label="Supplier county">
              <SelectInput
                value={supplierCounty}
                onChange={setSupplierCounty}
                options={["Kiambu", "Nairobi", "Nakuru", "Nyandarua", "Machakos"]}
              />
            </Field>
            <Field label="Paid with">
              <SelectInput
                value={paidBy}
                onChange={setPaidBy}
                options={["M-Pesa (GrowMO wallet)", "Cash", "Co-op credit", "Bank transfer"]}
              />
            </Field>
          </div>
          <Callout
            icon={BadgeCheck}
            title="Registered suppliers only"
            body="Agro-vet dealers must show a PCPB licence. GrowMO keeps the number with the purchase so the residue audit closes faster."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Add the item"
            nextDisabled={invoice.trim().length < 3}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Input" className="full">
              <SelectInput
                value={input}
                onChange={setInput}
                options={[
                  "CAN 26% N (50 kg)",
                  "DAP 18-46-0 (50 kg)",
                  "Mancozeb 80WP (1 kg)",
                  "Imidacloprid 200SL (100 ml)",
                  "Cabbage Gloria F1 (10 g)",
                  "Agricultural lime (50 kg)",
                  "FYM composted manure (pickup load)",
                  "Bacillus thuringiensis 16000 IU (1 kg)",
                ]}
              />
            </Field>
            <Field label="Category">
              <SelectInput
                value={category}
                onChange={(value) => setCategory(value as PurchaseCategory)}
                options={["Fertilizer", "Crop protection", "Seed", "Soil amendment", "Equipment"]}
              />
            </Field>
            <Field label="Quantity">
              <TextInput value={qty} onChange={setQty} placeholder="2 bags" />
            </Field>
            <Field label="Unit price (KES)">
              <TextInput value={unitPrice} type="number" onChange={setUnitPrice} />
            </Field>
            <Field label="Line total">
              <TextInput value={kes(total)} onChange={() => undefined} />
            </Field>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Batch & receipt"
            nextDisabled={!unitPrice || Number(unitPrice) <= 0}
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Batch / lot number" hint="Printed on the bag or bottle.">
              <TextInput value={batchNo} onChange={setBatchNo} />
            </Field>
            <Field label="Expiry date">
              <TextInput value={expiry} onChange={setExpiry} placeholder="Jun 2028" />
            </Field>
            <Field label="Certificate / registration number">
              <TextInput value={certNo} onChange={setCertNo} />
            </Field>
            <Field label="Stored where">
              <SelectInput
                value={store}
                onChange={setStore}
                options={[
                  "Farm store · shelf A",
                  "Farm store · shelf B",
                  "Chemical cupboard · locked",
                  "Seed box · dry room",
                  "Tool shed",
                ]}
              />
            </Field>
          </div>
          {receipt ? (
            <Callout
              icon={FileSpreadsheet}
              title="Receipt photo attached"
              body={`${invoice} · ${supplier} · ${kes(total)} will be filed under section 12.3.`}
            />
          ) : (
            <Callout
              icon={TriangleAlert}
              title="No receipt attached"
              body="The compliance centre will flag this purchase until a receipt photo or delivery note is added."
            />
          )}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={save}
            finishLabel="Save purchase"
            nextDisabled={saving}
          />
        </div>
      )}
      <div className="mt-3">
        <Toggle
          checked={receipt}
          onChange={setReceipt}
          label="Receipt or delivery note photographed"
          desc="Attach the invoice image so the KRA and KEPHIS trail stays complete."
        />
      </div>
    </Dialog>
  );
}

export function ReceiptViewerDialog({
  open,
  record,
  onClose,
  onAttach,
}: {
  open: boolean;
  record: PurchaseRecord | null;
  onClose: () => void;
  onAttach: (id: string) => void;
}) {
  if (!record) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Receipt · ${record.invoiceNo}`}
      desc={`${record.supplier} · ${record.date}`}
    >
      <div className="gm-rec-stack">
        <RecordKvList
          rows={[
            { label: "Input", value: record.input },
            { label: "Category", value: record.category },
            { label: "Quantity", value: record.qty },
            { label: "Unit price", value: kes(record.unitPrice) },
            { label: "Total", value: kes(record.total) },
            { label: "Batch / lot", value: record.batchNo || "—" },
            { label: "Expiry", value: record.expiry },
            { label: "Certificate", value: record.certNo || "—" },
            { label: "Supplier phone", value: record.supplierPhone },
            { label: "Supplier county", value: record.supplierCounty },
            { label: "Stored", value: record.store },
            { label: "M-Pesa reference", value: record.mpesa || "Paid in cash" },
          ]}
        />
        <Callout
          icon={record.receipt ? CheckCircle2 : TriangleAlert}
          title={record.receipt ? "Receipt on file" : "Receipt missing"}
          body={
            record.receipt
              ? `${record.invoiceNo} is attached to the purchase record and included in the compliance pack.`
              : "Attach the receipt photo now — the auditor asks for it before releasing the traceability sheet."
          }
        />
        <div className="d-flex flex-wrap gap-2">
          {!record.receipt ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onAttach(record.id);
                onClose();
              }}
            >
              <Camera /> Attach receipt photo
            </button>
          ) : null}
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              downloadText(
                `growmo-receipt-${record.invoiceNo}.csv`,
                [
                  "Field,Value",
                  ...[
                    ["Invoice", record.invoiceNo],
                    ["Date", record.date],
                    ["Supplier", record.supplier],
                    ["Input", record.input],
                    ["Quantity", record.qty],
                    ["Unit price", record.unitPrice],
                    ["Total", record.total],
                    ["Batch", record.batchNo],
                    ["Expiry", record.expiry],
                    ["Certificate", record.certNo],
                    ["M-Pesa", record.mpesa],
                  ].map((row) => row.map(csvCell).join(",")),
                ].join("\n"),
              );
            }}
          >
            <Download /> Download receipt copy
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={() => {
              downloadText(
                "growmo-supplier-claim.txt",
                `Supplier claim raised with ${record.supplier} (${record.supplierPhone}) for invoice ${record.invoiceNo} on ${record.date}.`,
                "text/plain",
              );
            }}
          >
            <Send /> Query the supplier
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ===================== 5. HARVEST BATCH TRACEABILITY ==================== */

export function BatchWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (batch: HarvestBatch) => void;
}) {
  const [step, setStep] = useState(0);
  const [code, setCode] = useState(`${RECORD_CONTEXT.batchPrefix}-011`);
  const [crop, setCrop] = useState("Cabbage");
  const [variety, setVariety] = useState("Gloria F1");
  const [plot, setPlot] = useState("Plot 1");
  const [area, setArea] = useState("0.5 acre");
  const [planted, setPlanted] = useState("2026-06-12");
  const [harvested, setHarvested] = useState("2026-09-28");
  const [quantity, setQuantity] = useState("14,500 heads");
  const [gradeA, setGradeA] = useState("10000");
  const [gradeB, setGradeB] = useState("3500");
  const [gradeC, setGradeC] = useState("1000");
  const [destination, setDestination] = useState("Marikiti Market via Kamau Brokers");
  const [buyer, setBuyer] = useState("Kamau Brokers");
  const [buyerPhone, setBuyerPhone] = useState("0722 909 331");
  const [saving, setSaving] = useState(false);
  const steps = ["Crop & plot", "Harvest numbers", "Grading", "Destination & QR"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setSaving(false);
  }, [open]);

  const total = (Number(gradeA) || 0) + (Number(gradeB) || 0) + (Number(gradeC) || 0);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onSave({
        id: `b-new-${Date.now()}`,
        batchId: code,
        crop,
        variety,
        plot,
        area,
        planted: addDays(planted, 0),
        harvested: addDays(harvested, 0),
        quantity,
        gradeA: Number(gradeA) || 0,
        gradeB: Number(gradeB) || 0,
        gradeC: Number(gradeC) || 0,
        inputs: [
          { name: "DAP 18-46-0", qty: "25 kg" },
          { name: "CAN 26% N", qty: "37.5 kg" },
          { name: "Mancozeb 80WP", qty: "1 kg" },
          { name: "FYM manure", qty: "2.5 tonnes" },
        ],
        sprays: 4,
        lastSpray: "08 Sep 2026 · Mancozeb 80WP",
        phiCleared: "22 Sep 2026",
        soilTest: "pH 5.8 · Sep 2026 · KALRO",
        destination,
        buyer,
        destinationPhone: buyerPhone,
        qrScans: 0,
        status: "Planned",
        value: total * 24,
        steps: [
          { label: "Crop planted", at: addDays(planted, 0), note: `${plot} mapped at ${area}`, done: true },
          { label: "Spray records closed", at: "08 Sep 2026", note: "Latest PHI 21 days (Imidacloprid)", done: true },
          { label: "PHI cleared", at: "22 Sep 2026", note: "Harvest date is inside the safe window", done: true },
          { label: "Harvest & grading", at: addDays(harvested, 0), note: "Grade A/B/C split at the shed", done: false },
          { label: "QR label printed", at: addDays(harvested, 0), note: "One sticker per crate", done: false },
          { label: "Delivery to buyer", at: addDays(harvested, 1), note: `${destination}`, done: false },
        ],
      });
      onClose();
    }, 700);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Create a harvest batch"
      desc="The QR passport a buyer scans — farm, plot, inputs, sprays, soil test and destination."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Batch ID" hint="Generated from the farm code and season.">
              <TextInput value={code} onChange={setCode} />
            </Field>
            <Field label="Plot">
              <SelectInput
                value={plot}
                onChange={setPlot}
                options={["Plot 1", "Plot 2", "Plot 3", "Plot 4", "Plot 5"]}
              />
            </Field>
            <Field label="Crop">
              <SelectInput
                value={crop}
                onChange={setCrop}
                options={["Cabbage", "Kale", "Tomato", "Maize", "Beans", "Potato"]}
              />
            </Field>
            <Field label="Variety">
              <SelectInput
                value={variety}
                onChange={setVariety}
                options={[
                  "Gloria F1",
                  "Sukuma wiki Thousand Headed",
                  "Roma VF",
                  "H6213",
                  "Rosecoco",
                  "Shangi",
                ]}
              />
            </Field>
            <Field label="Plot area">
              <TextInput value={area} onChange={setArea} />
            </Field>
            <Field label="Soil test on record">
              <SelectInput
                value="pH 5.8 · Sep 2026 · KALRO"
                onChange={() => undefined}
                options={["pH 5.8 · Sep 2026 · KALRO", "pH 5.5 · Mar 2026 · KALRO"]}
              />
            </Field>
          </div>
          <Callout
            icon={Warehouse}
            title="Inputs are pulled from the purchase ledger"
            body="DAP, CAN, Mancozeb, Imidacloprid and manure will appear on the batch sheet automatically."
          />
          <WizardActions
            step={step}
            last={3}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Harvest numbers"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Planting date">
              <TextInput value={planted} type="date" onChange={setPlanted} />
            </Field>
            <Field label="Harvest date">
              <TextInput value={harvested} type="date" onChange={setHarvested} />
            </Field>
            <Field label="Quantity harvested" className="full">
              <TextInput value={quantity} onChange={setQuantity} placeholder="14,500 heads" />
            </Field>
          </div>
          <Callout
            icon={ShieldCheck}
            title="PHI cleared on 22 Sep 2026"
            body="The harvest date you entered is after the last safe-harvest date, so the batch can carry the compliance QR label."
          />
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Grade the harvest"
          />
        </div>
      ) : step === 2 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid cols3">
            <Field label="Grade A units">
              <TextInput value={gradeA} type="number" onChange={setGradeA} />
            </Field>
            <Field label="Grade B units">
              <TextInput value={gradeB} type="number" onChange={setGradeB} />
            </Field>
            <Field label="Grade C units">
              <TextInput value={gradeC} type="number" onChange={setGradeC} />
            </Field>
          </div>
          <div className="gm-rec-review">
            <ReviewRow label="Total units" value={total.toLocaleString("en-KE")} />
            <ReviewRow
              label="Grade A share"
              value={`${total ? Math.round((Number(gradeA) / total) * 100) : 0}%`}
            />
            <ReviewRow label="Rejects (Grade C)" value={`${gradeC} units → animal feed or local sale`} />
            <ReviewRow label="Estimated value" value={kes(total * 24)} />
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Destination & QR"
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Destination" className="full">
              <SelectInput
                value={destination}
                onChange={setDestination}
                options={[
                  "Marikiti Market via Kamau Brokers",
                  "Twiga Foods — Nairobi collection point",
                  "Githunguri open market (weekly)",
                  "Githunguri Farmers Co-op aggregation",
                  "Home store (food security)",
                ]}
              />
            </Field>
            <Field label="Buyer / broker">
              <TextInput value={buyer} onChange={setBuyer} />
            </Field>
            <Field label="Buyer phone">
              <TextInput value={buyerPhone} onChange={setBuyerPhone} />
            </Field>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <QrTile seed={code.length * 7 + total} label={`QR for ${code}`} size={132} />
            <div>
              <strong className="d-block font-display">{code}</strong>
              <small className="text-muted d-block">
                Scan opens the batch passport with traceability and the spray record.
              </small>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <StatusChip label={`${total.toLocaleString("en-KE")} units`} tone="low" />
                <StatusChip label={`${gradeA} A · ${gradeB} B · ${gradeC} C`} tone="neutral" />
                <StatusChip label="PHI cleared" tone="low" />
              </div>
            </div>
          </div>
          {saving ? (
            <div className="gm-rec-processing">
              <LoaderCircle />
              <strong>Generating batch passport…</strong>
              <small>Writing the QR payload and linking the spray and purchase records.</small>
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(2)}
            onNext={save}
            finishLabel="Create batch & QR"
            nextDisabled={saving}
          />
        </div>
      )}
    </Dialog>
  );
}

export function BatchTraceDialog({
  open,
  batch,
  onClose,
  onShare,
}: {
  open: boolean;
  batch: HarvestBatch | null;
  onClose: () => void;
  onShare: (batch: HarvestBatch) => void;
}) {
  if (!batch) return null;
  const sprays = SPRAY_RECORDS.filter((record) => record.plot === batch.plot).slice(0, 4);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Batch passport · ${batch.batchId}`}
      desc={`${batch.crop} — ${batch.variety} · ${batch.plot} · ${batch.area}`}
    >
      <div className="gm-rec-stack">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <QrTile seed={batch.batchId.length * 11 + batch.gradeA} label={`QR for ${batch.batchId}`} size={140} />
          <div>
            <StatusChip label={batch.status} tone={batch.status === "Sold" ? "low" : "medium"} />
            <p className="mb-0 mt-2">
              <strong className="font-display">{batch.qrScans}</strong> buyer scans ·{" "}
              <strong className="font-display">{kes(batch.value)}</strong> recorded value
            </p>
            <small className="text-muted">
              Farm {RECORD_CONTEXT.farm}, {RECORD_CONTEXT.subCounty}, {RECORD_CONTEXT.county}
            </small>
          </div>
        </div>
        <RecordKvList
          rows={[
            { label: "Farmer", value: `${RECORD_CONTEXT.farmer} · ID ${RECORD_CONTEXT.idNumber}` },
            { label: "Crop & variety", value: `${batch.crop} — ${batch.variety}` },
            { label: "Plot & area", value: `${batch.plot} · ${batch.area}` },
            { label: "Planting date", value: batch.planted },
            { label: "Harvest date", value: batch.harvested },
            { label: "Quantity", value: batch.quantity },
            {
              label: "Grade split",
              value: `A ${batch.gradeA.toLocaleString("en-KE")} · B ${batch.gradeB.toLocaleString("en-KE")} · C ${batch.gradeC.toLocaleString("en-KE")}`,
            },
            { label: "Spray applications", value: `${batch.sprays} on this plot` },
            { label: "Last spray", value: batch.lastSpray },
            { label: "PHI cleared", value: batch.phiCleared },
            { label: "Soil test", value: batch.soilTest },
            { label: "Destination", value: batch.destination },
            { label: "Buyer contact", value: `${batch.buyer} · ${batch.destinationPhone}` },
          ]}
        />
        <div>
          <span className="gm-eyebrow">Inputs used on this batch</span>
          <ul className="gm-check-list">
            {batch.inputs.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong> — {item.qty}
              </li>
            ))}
          </ul>
        </div>
        {sprays.length > 0 ? (
          <div>
            <span className="gm-eyebrow">Spray history for {batch.plot}</span>
            <div className="gm-table-wrap mt-2">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Target</th>
                    <th>PHI</th>
                    <th>Safe harvest</th>
                  </tr>
                </thead>
                <tbody>
                  {sprays.map((record) => (
                    <tr key={record.id}>
                      <td>{record.code}</td>
                      <td>{record.date}</td>
                      <td>{record.product}</td>
                      <td>{record.target}</td>
                      <td>{record.phiDays} days</td>
                      <td>{record.nextSafeHarvest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <div>
          <span className="gm-eyebrow">Trace timeline</span>
          <TraceTimeline batch={batch} />
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="gm-btn gm-btn-lime" onClick={() => onShare(batch)}>
            <Share2 /> Share the passport
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              downloadText(
                `growmo-batch-${batch.batchId}.csv`,
                [
                  "Field,Value",
                  ...[
                    ["Batch", batch.batchId],
                    ["Crop", `${batch.crop} — ${batch.variety}`],
                    ["Plot", `${batch.plot} (${batch.area})`],
                    ["Planted", batch.planted],
                    ["Harvested", batch.harvested],
                    ["Quantity", batch.quantity],
                    ["Grade A", batch.gradeA],
                    ["Grade B", batch.gradeB],
                    ["Grade C", batch.gradeC],
                    ["Last spray", batch.lastSpray],
                    ["PHI cleared", batch.phiCleared],
                    ["Soil test", batch.soilTest],
                    ["Destination", batch.destination],
                    ["Buyer", `${batch.buyer} ${batch.destinationPhone}`],
                  ].map((row) => row.map(csvCell).join(",")),
                ].join("\n"),
              );
            }}
          >
            <Download /> Download trace sheet
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function QrShareDialog({
  open,
  batch,
  onClose,
  onShared,
}: {
  open: boolean;
  batch: HarvestBatch | null;
  onClose: () => void;
  onShared: (batch: HarvestBatch, channel: string) => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [phone, setPhone] = useState(batch?.destinationPhone ?? "0722 909 331");
  const [note, setNote] = useState(
    "Batch passport attached — scan the QR on the crate to see the full record.",
  );
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setSent(false);
    setPhone(batch?.destinationPhone ?? "0722 909 331");
  }, [open, batch]);

  if (!batch) return null;

  const send = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
      onShared(batch, channel);
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Share passport · ${batch.batchId}`}
      desc="Send the batch QR to a buyer, broker, auditor or transporter."
    >
      {sent ? (
        <SuccessState
          title="Passport shared"
          body={`${batch.batchId} sent to ${phone} via ${channel}. The buyer can scan the crate QR for the full record.`}
          receipt={makeRef(batch.batchId + phone)}
          actionLabel="Done"
          onDone={onClose}
        />
      ) : (
        <div className="gm-rec-stack">
          <RecordKvList
            rows={[
              { label: "Batch", value: batch.batchId },
              { label: "Crop", value: `${batch.crop} — ${batch.variety}` },
              { label: "Quantity", value: batch.quantity },
              { label: "Buyer", value: batch.buyer },
            ]}
          />
          <div>
            <span className="gm-field-label">Channel</span>
            <div className="d-flex flex-wrap gap-2">
              {["WhatsApp", "SMS", "Email", "Print label"].map((item) => (
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
          </div>
          {channel === "Print label" ? (
            <Callout
              icon={Printer}
              title="Crate label ready"
              body="Two stickers per crate with the QR, batch ID, harvest date and the farm county."
            />
          ) : (
            <>
              <Field label={channel === "Email" ? "Email address" : "Phone number"}>
                <TextInput
                  value={channel === "Email" ? "quality@twigafoods.co.ke" : phone}
                  onChange={(value) => (channel === "Email" ? undefined : setPhone(value))}
                />
              </Field>
              <Field label="Message">
                <textarea
                  className="gm-textarea"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
            </>
          )}
          {busy ? (
            <div className="gm-rec-processing">
              <LoaderCircle />
              <strong>Sending {channel.toLowerCase()}…</strong>
              <small>Retrying automatically if the network drops.</small>
            </div>
          ) : null}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="gm-btn gm-btn-lime" disabled={busy} onClick={send}>
              {channel === "Print label" ? <Printer /> : <Send />}
              {channel === "Print label" ? "Print labels" : `Send via ${channel}`}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ========================== 6. CERTIFICATION ============================ */

export function CertWizard({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Certification | null;
  onClose: () => void;
  onSave: (cert: Certification, receipt: string | null) => void;
}) {
  const [step, setStep] = useState(0);
  const [certId, setCertId] = useState(initial?.id ?? CERTIFICATIONS[0].id);
  const [goal, setGoal] = useState("Submit to the county horticulture office");
  const [target, setTarget] = useState("2027-03-18");
  const [owner, setOwner] = useState("Mary Wanjiku");
  const [payNow, setPayNow] = useState(true);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  const steps = ["Certification", "Goal & owner", "Fee & confirmation"];

  const cert = CERTIFICATIONS.find((item) => item.id === certId) ?? CERTIFICATIONS[0];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setOtp("");
    setReceipt("");
    setProcessing(false);
    setCertId(initial?.id ?? CERTIFICATIONS[0].id);
  }, [open, initial]);

  const confirmFee = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setReceipt(makeRef(cert.id + goal));
      setStep(3);
    }, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={initial ? `Continue · ${initial.short}` : "Start or continue a certification"}
      desc="Certification progress is driven by the records you already keep — nothing is typed twice."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="d-flex flex-column gap-2">
            {CERTIFICATIONS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${certId === item.id ? "on" : ""}`}
                onClick={() => setCertId(item.id)}
              >
                <input type="radio" checked={certId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.body} · {item.status} · {item.progress}% · {item.requirements}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Set the goal"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Next milestone" className="full">
              <SelectInput
                value={goal}
                onChange={setGoal}
                options={[
                  "Submit to the county horticulture office",
                  "Complete worker health & safety training",
                  "Book the water quality test",
                  "Finish the GlobalG.A.P. self-assessment",
                  "Schedule the external audit",
                  "Book the residue sampling visit",
                ]}
              />
            </Field>
            <Field label="Target date">
              <TextInput value={target} type="date" onChange={setTarget} />
            </Field>
            <Field label="Owner">
              <SelectInput
                value={owner}
                onChange={setOwner}
                options={["Mary Wanjiku", "John Mwangi", "Jane Njeri", "Kamau Mwangi"]}
              />
            </Field>
          </div>
          <div className="gm-rec-review">
            <ReviewRow label="Certification" value={cert.name} />
            <ReviewRow label="Body" value={cert.body} />
            <ReviewRow label="Current progress" value={`${cert.progress}%`} />
            <ReviewRow label="Open requirements" value={String(cert.checklist.filter((c) => !c.done).length)} />
            <ReviewRow label="Milestone" value={goal} />
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Fee & confirmation"
          />
        </div>
      ) : step === 2 ? (
        <div className="gm-rec-stack">
          <div className="gm-rec-review">
            <ReviewRow label="Certification" value={cert.short} />
            <ReviewRow label="Auditor" value={cert.auditor} />
            <ReviewRow label="Target date" value={addDays(target, 0)} />
            <ReviewRow label="Fee payable now" value={cert.fee ? kes(cert.fee) : "No fee at this stage"} />
            <ReviewRow label="Pay from" value="GrowMO wallet → M-Pesa 0712 345 678" />
          </div>
          <Toggle
            checked={payNow}
            onChange={setPayNow}
            label="Pay the audit / certification fee now"
            desc="Funds are held until the certification body confirms the booking."
          />
          {payNow && cert.fee > 0 ? (
            <>
              {processing ? (
                <div className="gm-rec-processing">
                  <LoaderCircle />
                  <strong>Confirming M-Pesa payment…</strong>
                  <small>{kes(cert.fee)} to {cert.body}</small>
                </div>
              ) : (
                <>
                  <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <small className="text-muted">Charges: KES 0 · GrowMO covers transaction costs.</small>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => setOtp("123456")}
                    >
                      Use demo OTP
                    </button>
                  </div>
                </>
              )}
            </>
          ) : null}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={(payNow && cert.fee > 0 && otp.length !== 6) || processing}
              onClick={() => {
                if (payNow && cert.fee > 0) {
                  confirmFee();
                  return;
                }
                setStep(3);
              }}
            >
              <LockKeyhole /> {payNow && cert.fee > 0 ? "Pay & confirm" : "Confirm plan"}
            </button>
          </div>
        </div>
      ) : (
        <SuccessState
          title={receipt ? "Certification step paid" : "Milestone scheduled"}
          body={
            receipt
              ? `${kes(cert.fee)} paid to ${cert.body}. The ${goal.toLowerCase()} milestone is now tracked with owner ${owner}.`
              : `${goal} is now on the compliance calendar with owner ${owner}, due ${addDays(target, 0)}.`
          }
          receipt={receipt || makeRef(cert.id + owner)}
          actionLabel="Update the certification tracker"
          onDone={() => {
            onSave({ ...cert, dueDate: addDays(target, 0), auditor: cert.auditor }, receipt || null);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}

export function CertChecklistDialog({
  open,
  cert,
  onClose,
  onToggle,
  onAddEvidence,
}: {
  open: boolean;
  cert: Certification | null;
  onClose: () => void;
  onToggle: (certId: string, item: CertChecklistItem) => void;
  onAddEvidence: (certId: string, item: CertChecklistItem) => void;
}) {
  if (!cert) return null;
  const done = cert.checklist.filter((item) => item.done).length;
  const pct = cert.checklist.length ? Math.round((done / cert.checklist.length) * 100) : 0;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`${cert.short} checklist`}
      desc={`${done} of ${cert.checklist.length} requirements closed · ${pct}% complete`}
    >
      <div className="gm-rec-stack">
        <div className="gm-rec-cert-progress">
          <div
            className="gm-rec-phi-track"
            role="progressbar"
            aria-label="Checklist progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <i style={{ width: `${pct}%` }} />
          </div>
          <span className="font-display">{pct}%</span>
        </div>
        <div className="d-flex flex-column gap-2">
          {cert.checklist.map((item) => (
            <div className="gm-checkcard" key={item.id}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(cert.id, item)}
                aria-label={item.label}
              />
              <span style={{ flex: 1 }}>
                <strong>{item.label}</strong>
                <small>
                  {item.owner} · due {item.due} · evidence: {item.evidence}
                </small>
              </span>
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onAddEvidence(cert.id, item)}
              >
                <Upload /> Evidence
              </button>
            </div>
          ))}
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              downloadText(
                `growmo-${cert.short.replace(/[^A-Za-z0-9]/g, "")}-checklist.csv`,
                [
                  "Requirement,Done,Owner,Due,Evidence",
                  ...cert.checklist.map((item) =>
                    csvCell(item.label) +
                    "," +
                    csvCell(item.done ? "Yes" : "No") +
                    "," +
                    csvCell(item.owner) +
                    "," +
                    csvCell(item.due) +
                    "," +
                    csvCell(item.evidence),
                  ),
                ].join("\n"),
              );
            }}
          >
            <Download /> Export checklist
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export function AuditBookingDialog({
  open,
  presetCert,
  onClose,
  onBooked,
}: {
  open: boolean;
  presetCert: Certification | null;
  onClose: () => void;
  onBooked: (auditorName: string, date: string, receipt: string | null) => void;
}) {
  const [step, setStep] = useState(0);
  const [auditorId, setAuditorId] = useState(AUDITORS[0].id);
  const [slot, setSlot] = useState("2026-11-04");
  const [sharePack, setSharePack] = useState(true);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  const steps = ["Choose auditor", "Pick a date", "Confirm & pay"];

  const auditor = AUDITORS.find((item) => item.id === auditorId) ?? AUDITORS[0];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setOtp("");
    setReceipt("");
    setProcessing(false);
  }, [open]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Book an audit or inspection"
      desc={presetCert ? `For ${presetCert.name}` : "Compliance visit slot and evidence pack"}
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="d-flex flex-column gap-2">
            {AUDITORS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`gm-checkcard ${auditorId === item.id ? "on" : ""}`}
                onClick={() => setAuditorId(item.id)}
              >
                <input type="radio" checked={auditorId === item.id} readOnly tabIndex={-1} />
                <span>
                  <strong>
                    {item.name} · {item.org}
                  </strong>
                  <small>
                    {item.scope} · window {item.window} ·{" "}
                    {item.fee ? kes(item.fee) : "No fee"} · {item.phone}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Pick a date"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <Field label="Preferred visit date" hint={`Auditor window: ${auditor.window}`}>
            <TextInput value={slot} type="date" onChange={setSlot} />
          </Field>
          <Toggle
            checked={sharePack}
            onChange={setSharePack}
            label="Share the evidence pack in advance"
            desc="10 documents, 22 pages: diary, spray record, purchases, batches, soil tests and certification files."
          />
          <div className="gm-rec-review">
            <ReviewRow label="Auditor" value={`${auditor.name} (${auditor.org})`} />
            <ReviewRow label="Scope" value={auditor.scope} />
            <ReviewRow label="Contact" value={auditor.phone} />
            <ReviewRow label="Date" value={addDays(slot, 0)} />
            <ReviewRow label="Fee" value={auditor.fee ? kes(auditor.fee) : "No fee"} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Confirm & pay"
          />
        </div>
      ) : receipt ? (
        <SuccessState
          title="Audit booked"
          body={`${auditor.name} will visit on ${addDays(slot, 0)}${auditor.fee ? `. ${kes(auditor.fee)} paid from the GrowMO wallet.` : "."}${sharePack ? " The evidence pack was shared in advance." : ""}`}
          receipt={receipt}
          actionLabel="Add to the compliance calendar"
          onDone={() => {
            onBooked(auditor.name, addDays(slot, 0), receipt);
            onClose();
          }}
        />
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-rec-pay">
            <Smartphone />
            <span>
              <strong>
                {auditor.fee ? `Pay ${kes(auditor.fee)} to ${auditor.org}` : "Confirm the free county visit"}
              </strong>
              <small>M-Pesa 0712 345 678 · GrowMO wallet · charges covered</small>
            </span>
          </div>
          {auditor.fee > 0 ? (
            <>
              {processing ? (
                <div className="gm-rec-processing">
                  <LoaderCircle />
                  <strong>Waiting for M-Pesa confirmation…</strong>
                  <small>Do not close the app. The auditor is notified on success.</small>
                </div>
              ) : (
                <>
                  <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => setOtp("123456")}
                  >
                    Use demo OTP
                  </button>
                </>
              )}
            </>
          ) : (
            <Callout
              icon={ShieldCheck}
              title="County advisory visit is free"
              body="The officer confirms the slot by SMS. GrowMO records the visit in the certification tracker."
            />
          )}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={processing || (auditor.fee > 0 && otp.length !== 6)}
              onClick={() => {
                if (auditor.fee > 0) {
                  setProcessing(true);
                  window.setTimeout(() => {
                    setProcessing(false);
                    setReceipt(makeRef(auditor.id + slot));
                  }, 1200);
                  return;
                }
                setReceipt(makeRef(auditor.id + slot));
              }}
            >
              <LockKeyhole /> {auditor.fee > 0 ? "Pay & book" : "Confirm booking"}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ============================ 7. SOIL TESTS ============================= */

export function SoilTestWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (sample: SoilSample) => void;
}) {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState("2026-09-20");
  const [plot, setPlot] = useState("Plot 2");
  const [crop, setCrop] = useState("Tomato Roma VF");
  const [lab, setLab] = useState("KALRO Soil Laboratory, Kabete");
  const [labPhone, setLabPhone] = useState("0711 220 118");
  const [ph, setPh] = useState("5.9");
  const [n, setN] = useState("17");
  const [p, setP] = useState("24");
  const [k, setK] = useState("190");
  const [ca, setCa] = useState("1300");
  const [mg, setMg] = useState("210");
  const [om, setOm] = useState("3.1");
  const [recommendation, setRecommendation] = useState(
    "Lime 1.5 tonnes per acre, DAP at planting, split CAN top-dress",
  );
  const [cost, setCost] = useState("3200");
  const [payment, setPayment] = useState(true);
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  const steps = ["Plot & lab", "Lab results", "Recommendation & payment"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setOtp("");
    setReceipt("");
    setProcessing(false);
  }, [open]);

  const save = () => {
    onSave({
      id: `soil-new-${Date.now()}`,
      date: addDays(date, 0),
      iso: date,
      lab,
      labRef: `KAL-2026-${4400 + Number(n) * 3}`,
      plot,
      crop,
      ph: Number(ph) || 0,
      nitrogen: Number(n) || 0,
      phosphorus: Number(p) || 0,
      potassium: Number(k) || 0,
      calcium: Number(ca) || 0,
      magnesium: Number(mg) || 0,
      organicMatter: Number(om) || 0,
      recommendation,
      cost: Number(cost) || 0,
      labPhone,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Log a soil test"
      desc="Lab results feed the lime plan, the fertilizer budget and the certification file."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Sampling date">
              <TextInput value={date} type="date" onChange={setDate} />
            </Field>
            <Field label="Plot">
              <SelectInput
                value={plot}
                onChange={setPlot}
                options={["Plot 1", "Plot 2", "Plot 3", "Plot 4", "Plot 5"]}
              />
            </Field>
            <Field label="Crop on the plot">
              <SelectInput
                value={crop}
                onChange={setCrop}
                options={[
                  "Tomato Roma VF",
                  "Cabbage Gloria F1",
                  "Kale Thousand Headed",
                  "Maize H6213",
                  "Beans Rosecoco",
                  "Potato Shangi",
                ]}
              />
            </Field>
            <Field label="Laboratory">
              <SelectInput
                value={lab}
                onChange={setLab}
                options={[
                  "KALRO Soil Laboratory, Kabete",
                  "Crop Nutrition Laboratory Services (Cropnuts), Nairobi",
                  "Kenya Soil Survey, Nairobi",
                  "Kabete Farm Care Laboratory",
                ]}
              />
            </Field>
            <Field label="Lab phone">
              <TextInput value={labPhone} onChange={setLabPhone} />
            </Field>
            <Field label="Sampling cost (KES)">
              <TextInput value={cost} type="number" onChange={setCost} />
            </Field>
          </div>
          <Callout
            icon={FlaskConical}
            title="How to take the sample"
            body="Zig-zag 15 cores at 0–20 cm, mix in a clean bucket, quarter down to 500 g and label the bag with the plot name."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Enter lab results"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid cols3">
            <Field label="pH">
              <TextInput value={ph} type="number" onChange={setPh} />
            </Field>
            <Field label="Nitrogen N (ppm)">
              <TextInput value={n} type="number" onChange={setN} />
            </Field>
            <Field label="Phosphorus P (ppm)">
              <TextInput value={p} type="number" onChange={setP} />
            </Field>
            <Field label="Potassium K (ppm)">
              <TextInput value={k} type="number" onChange={setK} />
            </Field>
            <Field label="Calcium Ca (ppm)">
              <TextInput value={ca} type="number" onChange={setCa} />
            </Field>
            <Field label="Magnesium Mg (ppm)">
              <TextInput value={mg} type="number" onChange={setMg} />
            </Field>
            <Field label="Organic matter (%)">
              <TextInput value={om} type="number" onChange={setOm} />
            </Field>
          </div>
          <div className="gm-rec-review">
            <ReviewRow label="pH" value={`${ph} · ${Number(ph) < 5.5 ? "needs lime" : "workable"}`} />
            <ReviewRow label="Nitrogen" value={`${n} ppm · ${Number(n) < 20 ? "Low" : "Adequate"}`} />
            <ReviewRow label="Phosphorus" value={`${p} ppm`} />
            <ReviewRow label="Potassium" value={`${k} ppm · ${Number(k) > 150 ? "High" : "Medium"}`} />
            <ReviewRow label="Organic matter" value={`${om}%`} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Recommendation & payment"
          />
        </div>
      ) : receipt ? (
        <SuccessState
          title="Soil test recorded"
          body={`${plot} results saved with a lab reference, and the lime plan for ${crop} updated.`}
          receipt={receipt}
          actionLabel="Update my soil records"
          onDone={save}
        />
      ) : (
        <div className="gm-rec-stack">
          <Field label="Agronomist recommendation">
            <textarea
              className="gm-textarea"
              rows={3}
              value={recommendation}
              onChange={(event) => setRecommendation(event.target.value)}
            />
          </Field>
          <Toggle
            checked={payment}
            onChange={setPayment}
            label={`Pay the lab fee now (${kes(Number(cost) || 0)})`}
            desc={`Paid directly to ${lab} from the GrowMO wallet.`}
          />
          {payment ? (
            <div className="gm-rec-pay">
              <Smartphone />
              <span>
                <strong>{kes(Number(cost) || 0)} to {lab}</strong>
                <small>M-Pesa 0712 345 678 · receipt saved to the soil test record</small>
              </span>
            </div>
          ) : null}
          {payment ? (
            processing ? (
              <div className="gm-rec-processing">
                <LoaderCircle />
                <strong>Paying the laboratory…</strong>
                <small>The queue position is reserved once payment clears.</small>
              </div>
            ) : (
              <>
                <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP (demo: 123456)" />
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={() => setOtp("123456")}
                >
                  Use demo OTP
                </button>
              </>
            )
          ) : null}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={processing || (payment && otp.length !== 6)}
              onClick={() => {
                if (payment) {
                  setProcessing(true);
                  window.setTimeout(() => {
                    setProcessing(false);
                    setReceipt(makeRef(plot + lab));
                  }, 1200);
                  return;
                }
                save();
              }}
            >
              <LockKeyhole /> {payment ? "Pay & save" : "Save soil test"}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function SoilReportDialog({
  open,
  sample,
  previous,
  onClose,
  onFollowUp,
}: {
  open: boolean;
  sample: SoilSample | null;
  previous: SoilSample | null;
  onClose: () => void;
  onFollowUp: (sample: SoilSample) => void;
}) {
  if (!sample) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Soil report · ${sample.plot}`}
      desc={`${sample.lab} · ref ${sample.labRef} · sampled ${sample.date}`}
    >
      <div className="gm-rec-stack">
        <RecordKvList
          rows={[
            { label: "pH", value: `${sample.ph.toFixed(1)}` },
            { label: "Nitrogen (ppm)", value: String(sample.nitrogen) },
            { label: "Phosphorus (ppm)", value: String(sample.phosphorus) },
            { label: "Potassium (ppm)", value: String(sample.potassium) },
            { label: "Calcium (ppm)", value: String(sample.calcium) },
            { label: "Magnesium (ppm)", value: String(sample.magnesium) },
            { label: "Organic matter", value: `${sample.organicMatter}%` },
            { label: "Crop on plot", value: sample.crop },
            { label: "Sample cost", value: kes(sample.cost) },
            { label: "Lab phone", value: sample.labPhone },
          ]}
        />
        {previous ? (
          <div className="gm-rec-review">
            <ReviewRow
              label="pH change"
              value={`${previous.ph.toFixed(1)} → ${sample.ph.toFixed(1)} (${sample.ph >= previous.ph ? "+" : ""}${(sample.ph - previous.ph).toFixed(1)})`}
            />
            <ReviewRow
              label="Organic matter"
              value={`${previous.organicMatter}% → ${sample.organicMatter}%`}
            />
            <ReviewRow
              label="Nitrogen"
              value={`${previous.nitrogen} → ${sample.nitrogen} ppm`}
            />
            <ReviewRow label="Previous sampling" value={previous.date} />
          </div>
        ) : null}
        <Callout icon={FlaskConical} title="Recommendation" body={sample.recommendation} />
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onFollowUp(sample);
              onClose();
            }}
          >
            <ClipboardCheck /> Log the follow-up action
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => {
              downloadText(
                `growmo-soil-${sample.plot.replace(/\s/g, "")}-${sample.iso}.csv`,
                [
                  "Metric,Value",
                  ...[
                    ["Lab", sample.lab],
                    ["Reference", sample.labRef],
                    ["Plot", sample.plot],
                    ["Crop", sample.crop],
                    ["pH", sample.ph],
                    ["Nitrogen ppm", sample.nitrogen],
                    ["Phosphorus ppm", sample.phosphorus],
                    ["Potassium ppm", sample.potassium],
                    ["Calcium ppm", sample.calcium],
                    ["Magnesium ppm", sample.magnesium],
                    ["Organic matter %", sample.organicMatter],
                    ["Recommendation", sample.recommendation],
                  ].map((row) => row.map(csvCell).join(",")),
                ].join("\n"),
              );
            }}
          >
            <Download /> Download lab report
          </button>
          <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ====================== 8. COMPLIANCE CENTRE ACTIONS ==================== */

export function GapFixWizard({
  open,
  gap,
  onClose,
  onFixed,
}: {
  open: boolean;
  gap: ComplianceGap | null;
  onClose: () => void;
  onFixed: (gap: ComplianceGap, note: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [owner, setOwner] = useState(gap?.owner ?? "Mary Wanjiku");
  const [due, setDue] = useState("2026-10-02");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const steps = ["Review the gap", "Owner & evidence", "Close it out"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setEvidence([]);
    setNote("");
    setOwner(gap?.owner ?? "Mary Wanjiku");
  }, [open, gap]);

  if (!gap) return null;

  const evidenceOptions = [
    "Calibration certificate (sprayer)",
    "Receipt photo",
    "Water test request form",
    "Training attendance register",
    "Batch delivery note",
    "Diary backfill entries",
    "Lab sampling receipt",
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={gap.title}
      desc={`${gap.section} · severity ${gap.severity}`}
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <Callout icon={AlertTriangle} title="Why the auditor cares" body={gap.detail} />
          <RecordKvList
            rows={[
              { label: "Section", value: gap.section },
              { label: "Raised by", value: "GrowMO compliance check (daily)" },
              { label: "Severity", value: gap.severity },
              { label: "Suggested owner", value: gap.owner },
              { label: "Suggested due date", value: gap.due },
            ]}
          />
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Assign & attach"
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Owner">
              <SelectInput
                value={owner}
                onChange={setOwner}
                options={["Mary Wanjiku", "John Mwangi", "Jane Njeri", "Kamau Mwangi"]}
              />
            </Field>
            <Field label="Due date">
              <TextInput value={due} type="date" onChange={setDue} />
            </Field>
          </div>
          <div>
            <span className="gm-field-label">Evidence to attach</span>
            <div className="d-flex flex-wrap gap-2">
              {evidenceOptions.map((option) => {
                const active = evidence.includes(option);
                return (
                  <button
                    type="button"
                    key={option}
                    className={`gm-filter-chip ${active ? "is-active" : ""}`}
                    onClick={() =>
                      setEvidence((current) =>
                        active
                          ? current.filter((item) => item !== option)
                          : [...current, option],
                      )
                    }
                  >
                    <Upload /> {option}
                  </button>
                );
              })}
            </div>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Close it out"
            nextDisabled={evidence.length === 0}
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <Field label="Closure note">
            <textarea
              className="gm-textarea"
              rows={3}
              value={note}
              placeholder="e.g. Calibration readings recorded for all 2026 applications and the sprayer serviced on 22 Sep 2026."
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="gm-rec-review">
            <ReviewRow label="Owner" value={owner} />
            <ReviewRow label="Due" value={addDays(due, 0)} />
            <ReviewRow label="Evidence items" value={String(evidence.length)} />
          </div>
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={note.trim().length < 8}
              onClick={() => {
                onFixed(gap, note);
                onClose();
              }}
            >
              <CheckCircle2 /> Mark the gap closed
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ========================= 9. EXPORT & SHARING ========================= */

export function ExportPackDialog({
  open,
  onClose,
  onExported,
}: {
  open: boolean;
  onClose: () => void;
  onExported: (label: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [sections, setSections] = useState<string[]>(["12.2", "12.3", "12.4"]);
  const [format, setFormat] = useState("PDF pack");
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-09-20");
  const [photos, setPhotos] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const steps = ["Sections", "Format & dates", "Generate"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setBusy(false);
    setDone(false);
  }, [open]);

  const sectionOptions = [
    { id: "12.1", label: "Farm diary", note: `${13} entries in range` },
    { id: "12.2", label: "Spray record", note: `${SPRAY_RECORDS.length} applications with PHI` },
    { id: "12.3", label: "Input purchases", note: `${PURCHASES.length} invoices with batch numbers` },
    { id: "12.4", label: "Harvest batches", note: `${HARVEST_BATCHES.length} batch passports` },
    { id: "12.5", label: "Certification", note: `${CERTIFICATIONS.length} programmes, checklists included` },
    { id: "12.6", label: "Soil tests", note: "10 lab reports with trends" },
  ];

  const generate = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      const body = [
        "Section,Included",
        ...sectionOptions
          .map((option) => `${csvCell(option.id + " " + option.label)},${csvCell(sections.includes(option.id) ? "Yes" : "No")}`)
          .join("\n")
          .split("\n"),
      ].join("\n");
      downloadText(
        `growmo-compliance-pack-${from}-to-${to}.csv`,
        `${body}\n${csvCell("Format")},${csvCell(format)}\n${csvCell("Range")},${csvCell(`${from} to ${to}`)}\n${csvCell("Photos")},${csvCell(photos ? "included" : "excluded")}\n`,
      );
    }, 1400);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Export the compliance pack"
      desc="One file for an auditor, a buyer or the county officer."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="d-flex flex-column gap-2">
            {sectionOptions.map((option) => {
              const active = sections.includes(option.id);
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`gm-checkcard ${active ? "on" : ""}`}
                  onClick={() =>
                    setSections((current) =>
                      active
                        ? current.filter((item) => item !== option.id)
                        : [...current, option.id],
                    )
                  }
                >
                  <input type="checkbox" checked={active} readOnly tabIndex={-1} />
                  <span>
                    <strong>
                      {option.id} {option.label}
                    </strong>
                    <small>{option.note}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Format & dates"
            nextDisabled={sections.length === 0}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="From">
              <TextInput value={from} type="date" onChange={setFrom} />
            </Field>
            <Field label="To">
              <TextInput value={to} type="date" onChange={setTo} />
            </Field>
            <Field label="Format">
              <SelectInput
                value={format}
                onChange={setFormat}
                options={["PDF pack", "CSV data sheet", "Excel workbook", "Email to auditor"]}
              />
            </Field>
            <Field label="Recipient (if emailed)">
              <TextInput value="audit@africert.co.ke" onChange={() => undefined} />
            </Field>
          </div>
          <Toggle
            checked={photos}
            onChange={setPhotos}
            label="Include photo evidence"
            desc="Crash pads, receipts, disposal pit and crate labels add roughly 8 MB."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Review & generate"
          />
        </div>
      ) : done ? (
        <SuccessState
          title="Compliance pack generated"
          body={`${sections.length} sections · ${format} · ${from} to ${to}. Saved to the evidence library.`}
          receipt={`PACK-${sections.join("")}`}
          actionLabel="Open the evidence library"
          onDone={() => {
            onExported(`${format} · ${sections.length} sections`);
            onClose();
          }}
        />
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-rec-review">
            <ReviewRow label="Sections" value={sections.join(", ")} />
            <ReviewRow label="Format" value={format} />
            <ReviewRow label="Range" value={`${from} → ${to}`} />
            <ReviewRow label="Photo evidence" value={photos ? "Included" : "Excluded"} />
            <ReviewRow label="Estimated pages" value={`${12 + sections.length * 3} pages`} />
          </div>
          {busy ? (
            <div className="gm-rec-processing">
              <LoaderCircle />
              <strong>Building the pack…</strong>
              <small>Collating diary entries, spray records, invoices, batches and lab reports.</small>
            </div>
          ) : null}
          <div className="d-flex justify-content-between gap-2">
            <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="gm-btn gm-btn-lime" disabled={busy} onClick={generate}>
              <FileText /> Generate pack
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function DataShareDialog({
  open,
  onClose,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  onShared: (link: string, days: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("AfriCert Kenya — pre-audit");
  const [scope, setScope] = useState<string[]>(["12.2", "12.3", "12.5"]);
  const [days, setDays] = useState("14");
  const [pin, setPin] = useState("4821");
  const [allowDownload, setAllowDownload] = useState(true);
  const [link, setLink] = useState("");
  const steps = ["Recipient & scope", "Access window", "Share link"];

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setLink("");
  }, [open]);

  const generated = useMemo(
    () => `growmo.ke/records/${pin}-${days}${Math.abs(recipient.length * 17) % 997}`,
    [pin, days, recipient],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Share records with a third party"
      desc="Time-limited, PIN-protected and fully logged in the audit trail."
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Recipient" className="full">
              <SelectInput
                value={recipient}
                onChange={setRecipient}
                options={[
                  "AfriCert Kenya — pre-audit",
                  "Kiambu County horticulture office",
                  "Twiga Foods — quality desk",
                  "Kamau Brokers",
                  "Githunguri Farmers Co-op",
                  "KALRO residue study",
                ]}
              />
            </Field>
          </div>
          <div>
            <span className="gm-field-label">Sections to share</span>
            <div className="d-flex flex-wrap gap-2">
              {[
                ["12.1", "Farm diary"],
                ["12.2", "Spray record"],
                ["12.3", "Purchases"],
                ["12.4", "Batches"],
                ["12.5", "Certification"],
                ["12.6", "Soil tests"],
              ].map(([id, label]) => {
                const active = scope.includes(id);
                return (
                  <button
                    type="button"
                    key={id}
                    className={`gm-filter-chip ${active ? "is-active" : ""}`}
                    onClick={() =>
                      setScope((current) =>
                        active ? current.filter((item) => item !== id) : [...current, id],
                      )
                    }
                  >
                    {id} {label}
                  </button>
                );
              })}
            </div>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextLabel="Access window"
            nextDisabled={scope.length === 0}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-rec-stack">
          <div className="gm-form-grid">
            <Field label="Valid for (days)">
              <TextInput value={days} type="number" onChange={setDays} />
            </Field>
            <Field label="Access PIN" hint="Share the PIN on a different channel (SMS or call).">
              <TextInput value={pin} onChange={setPin} />
            </Field>
          </div>
          <Toggle
            checked={allowDownload}
            onChange={setAllowDownload}
            label="Allow downloads of PDF scans"
            desc="Buyers usually need the spray record PDF; auditors may also want the receipt images."
          />
          <Callout
            icon={ShieldCheck}
            title="Every view is logged"
            body="You will see who opened the link, what sections they read and when the access expires."
          />
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => {
              setLink(generated);
              setStep(2);
            }}
            nextLabel="Create the link"
          />
        </div>
      ) : (
        <div className="gm-rec-stack">
          <div className="gm-rec-success">
            <span className="gm-rec-success-mark">
              <Share2 />
            </span>
            <h4 className="font-display mb-1">Share link created</h4>
            <p className="text-muted mb-2">
              {recipient} can read {scope.join(", ")} for {days} days.
            </p>
            <span className="gm-code-chip">{link}</span>
            <small className="text-muted mt-2">
              PIN {pin} · downloads {allowDownload ? "allowed" : "blocked"}
            </small>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onShared(link, Number(days) || 14);
                onClose();
              }}
            >
              <Send /> Send the link & PIN
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                downloadText(
                  "growmo-share-link.txt",
                  `GrowMO record share\nRecipient: ${recipient}\nSections: ${scope.join(", ")}\nExpires: ${days} days\nLink: ${link}\nPIN: ${pin}\nDownloads: ${allowDownload ? "allowed" : "blocked"}\n`,
                  "text/plain",
                );
              }}
            >
              <Download /> Save the details
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

/* ============================ 10. SETTINGS ============================== */

export function RecordsSettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: typeof RECORD_SETTINGS;
  onClose: () => void;
  onSave: (next: typeof RECORD_SETTINGS) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (!open) return;
    setDraft(settings);
  }, [open, settings]);

  const set = <K extends keyof typeof RECORD_SETTINGS>(
    key: K,
    value: (typeof RECORD_SETTINGS)[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title="Record-keeping settings"
      desc="Reminders, backups, evidence rules and how long records are kept."
    >
      <div className="gm-rec-stack">
        <Toggle
          checked={draft.dailyReminder}
          onChange={(value) => set("dailyReminder", value)}
          label="Daily diary reminder"
          desc="A nudge at the time below if no entry has been written."
        />
        <div className="gm-form-grid">
          <Field label="Reminder time">
            <TextInput
              value={draft.reminderTime}
              onChange={(value) => set("reminderTime", value)}
              placeholder="18:30"
            />
          </Field>
          <Field label="Retention period (years)">
            <TextInput
              value={String(draft.retentionYears)}
              type="number"
              onChange={(value) => set("retentionYears", Number(value) || 7)}
            />
          </Field>
          <Field label="Record language">
            <SelectInput
              value={draft.language}
              onChange={(value) => set("language", value)}
              options={[
                "English (Kiswahili reminders)",
                "Kiswahili",
                "English only",
                "Kikuyu (beta)",
              ]}
            />
          </Field>
        </div>
        <Toggle
          checked={draft.phiAlerts}
          onChange={(value) => set("phiAlerts", value)}
          label="Pre-harvest interval alerts"
          desc="Block the batch QR until every product PHI has cleared."
        />
        <Toggle
          checked={draft.smsBackup}
          onChange={(value) => set("smsBackup", value)}
          label="SMS backup of key records"
          desc="Spray records and batch IDs are texted to 0712 345 678 for offline safety."
        />
        <Toggle
          checked={draft.photoMandatory}
          onChange={(value) => set("photoMandatory", value)}
          label="Require a photo on every problem entry"
          desc="Auditors accept photos as primary evidence for pest and disease findings."
        />
        <Toggle
          checked={draft.autoBatchCode}
          onChange={(value) => set("autoBatchCode", value)}
          label="Auto-generate batch IDs"
          desc="Format GRM-KMB-YYYY-NNN from the farm code and season."
        />
        <Toggle
          checked={draft.shareWithCoop}
          onChange={(value) => set("shareWithCoop", value)}
          label="Share with the farmer group"
          desc="Allows Kiambu Vegetable Farmers spot-checks without an emailed pack."
        />
        <Toggle
          checked={draft.shareWithBuyer}
          onChange={(value) => set("shareWithBuyer", value)}
          label="Allow buyers to scan batch QR codes"
          desc="The scan opens the passport but never the financial records."
        />
        <Toggle
          checked={draft.witnessSignature}
          onChange={(value) => set("witnessSignature", value)}
          label="Require a witness signature on spray records"
          desc="A second person signs the record, as GLOBALG.A.P. prefers for high-hazard products."
        />
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

/* ========================= 11. EVIDENCE PACKS ========================== */

export function EvidencePackDialog({
  open,
  pack,
  onClose,
  onVerify,
}: {
  open: boolean;
  pack: (typeof EVIDENCE_DOCUMENTS)[number] | null;
  onClose: () => void;
  onVerify: (id: string) => void;
}) {
  if (!pack) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={pack.name}
      desc={`${pack.kind} · ${pack.size} · generated ${pack.generated}`}
    >
      <div className="gm-rec-stack">
        <RecordKvList
          rows={[
            { label: "Section", value: pack.sections },
            { label: "Format", value: pack.kind },
            { label: "Size", value: pack.size },
            { label: "Generated", value: pack.generated },
            { label: "Photo scans", value: String(pack.scans) },
            { label: "Status", value: pack.verified ? "Verified" : "Awaiting review" },
          ]}
        />
        <Callout
          icon={pack.verified ? BadgeCheck : AlertTriangle}
          title={pack.verified ? "Verified evidence" : "Review before submitting"}
          body={
            pack.verified
              ? "This document has been checked against the source records and carries the farm registration number."
              : "Open the source records, confirm the missing items are captured, then mark the pack verified."
          }
        />
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              downloadText(
                `${pack.name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}.csv`,
                [
                  "Document,Section,Format,Size,Generated,Verified",
                  [
                    csvCell(pack.name),
                    csvCell(pack.sections),
                    csvCell(pack.kind),
                    csvCell(pack.size),
                    csvCell(pack.generated),
                    csvCell(pack.verified ? "Yes" : "No"),
                  ].join(","),
                ].join("\n"),
              );
            }}
          >
            <Download /> Download from the library
          </button>
          {!pack.verified ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                onVerify(pack.id);
                onClose();
              }}
            >
              <ClipboardCheck /> Mark as verified
            </button>
          ) : (
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                downloadText(
                  "growmo-evidence-receipt.txt",
                  `${pack.name} was shared with the county horticulture office on 20 Sep 2026. Reference QK${pack.id.toUpperCase()}PL.`,
                  "text/plain",
                );
              }}
            >
              <Send /> Send to the county office
            </button>
          )}
          <button type="button" className="gm-btn gm-btn-soft" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ======================= 12. RECORD REQUESTS =========================== */

export function RequestRespondDialog({
  open,
  request,
  onClose,
  onResponded,
}: {
  open: boolean;
  request: {
    id: string;
    from: string;
    kind: string;
    scope: string;
    status: string;
    requested: string;
    channel: string;
    contact: string;
  } | null;
  onClose: () => void;
  onResponded: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState(
    "Full record pack attached. Spray records, purchase invoices and the batch passport for the requested scope.",
  );
  const [attach, setAttach] = useState<string[]>(["12.2", "12.3", "12.4"]);

  useEffect(() => {
    if (!open) return;
    setAttach(["12.2", "12.3", "12.4"]);
  }, [open]);

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      wide
      title={`Respond · ${request.from}`}
      desc={`${request.kind} · requested ${request.requested} via ${request.channel}`}
    >
      <div className="gm-rec-stack">
        <RecordKvList
          rows={[
            { label: "Scope", value: request.scope },
            { label: "Status", value: request.status },
            { label: "Contact", value: request.contact },
            { label: "Channel", value: request.channel },
          ]}
        />
        <div>
          <span className="gm-field-label">Attach sections</span>
          <div className="d-flex flex-wrap gap-2">
            {["12.1", "12.2", "12.3", "12.4", "12.5", "12.6"].map((id) => {
              const active = attach.includes(id);
              return (
                <button
                  type="button"
                  key={id}
                  className={`gm-filter-chip ${active ? "is-active" : ""}`}
                  onClick={() =>
                    setAttach((current) =>
                      active ? current.filter((item) => item !== id) : [...current, id],
                    )
                  }
                >
                  {id}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="Note to the requester">
          <textarea
            className="gm-textarea"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={attach.length === 0}
            onClick={() => {
              downloadText(
                `growmo-response-${request.id}.csv`,
                [
                  "Requester,Kind,Scope,Sections,Channel,Contact",
                  [
                    csvCell(request.from),
                    csvCell(request.kind),
                    csvCell(request.scope),
                    csvCell(attach.join(" ")),
                    csvCell(request.channel),
                    csvCell(request.contact),
                  ].join(","),
                ].join("\n"),
              );
              onResponded(request.id, note);
              onClose();
            }}
          >
            <Send /> Send the response
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ===================== 13. BATCH DELIVERY CONFIRM ====================== */

export function BatchDeliveryDialog({
  open,
  batch,
  onClose,
  onConfirmed,
}: {
  open: boolean;
  batch: HarvestBatch | null;
  onClose: () => void;
  onConfirmed: (batch: HarvestBatch, scans: number) => void;
}) {
  const [scans, setScans] = useState("6");
  const [transporter, setTransporter] = useState("Pickup KDD 442T · David Mwaura");

  useEffect(() => {
    if (!open) return;
    setScans(String(Math.max(1, batch?.qrScans || 1)));
  }, [open, batch]);

  if (!batch) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Confirm delivery · ${batch.batchId}`}
      desc={`${batch.quantity} to ${batch.destination}`}
    >
      <div className="gm-rec-stack">
        <RecordKvList
          rows={[
            { label: "Buyer", value: batch.buyer },
            { label: "Buyer phone", value: batch.destinationPhone },
            { label: "Recorded value", value: kes(batch.value) },
            { label: "Current QR scans", value: String(batch.qrScans) },
          ]}
        />
        <div className="gm-form-grid">
          <Field label="QR scans captured at the gate">
            <TextInput value={scans} type="number" onChange={setScans} />
          </Field>
          <Field label="Transporter">
            <SelectInput
              value={transporter}
              onChange={setTransporter}
              options={[
                "Pickup KDD 442T · David Mwaura",
                "Boda boda · Peter Kariuki",
                "Co-op lorry · Githunguri Farmers",
                "Buyer collection · own vehicle",
              ]}
            />
          </Field>
        </div>
        <Callout
          icon={Warehouse}
          title="Delivery closes the trace loop"
          body="Once confirmed, the batch shows as delivered in the passport and the co-op spot-check queue."
        />
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              onConfirmed(batch, Number(scans) || batch.qrScans);
              onClose();
            }}
          >
            <Package /> Confirm delivery
          </button>
        </div>
      </div>
    </Dialog>
  );
}
