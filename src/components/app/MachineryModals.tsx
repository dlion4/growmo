/* ============================================================================
   PAGE 20 WORKFLOWS — equipment, servicing, hire, fuel and asset controls.
   One reachable workflow map keeps all dashboard actions complete and local.
   ========================================================================== */
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Fuel,
  HandCoins,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Tractor,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  EquipmentAsset,
  FuelEntry,
  HireRecord,
  MaintenanceTask,
  UsageLog,
} from "../../data/app/machinery";
import { kes } from "../../data/site";
import { Dialog, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

export type MachineryModalId =
  | "register"
  | "edit-asset"
  | "asset-detail"
  | "archive-asset"
  | "add-service"
  | "service-detail"
  | "complete-service"
  | "reschedule-service"
  | "bulk-service"
  | "log-usage"
  | "usage-detail"
  | "duplicate-usage"
  | "hire-in"
  | "hire-out"
  | "booking-detail"
  | "settle-hire"
  | "rate-card"
  | "publish-market"
  | "log-fuel"
  | "fuel-receipt"
  | "energy-check"
  | "valuation-detail"
  | "depreciation-settings"
  | "export"
  | "insurance"
  | "attachments"
  | "import-log"
  | "service-report"
  | null;

type ModalKind = "wizard" | "confirm" | "detail" | "payment";

type ModalMeta = {
  title: string;
  desc: string;
  kind: ModalKind;
  success: string;
  steps?: string[];
};

const MODALS: Record<Exclude<MachineryModalId, null>, ModalMeta> = {
  register: {
    title: "Register equipment",
    desc: "Capture ownership, value and the next care action before the asset goes to work.",
    kind: "wizard",
    success: "Equipment record saved",
    steps: ["Identity", "Capacity", "Confirm"],
  },
  "edit-asset": {
    title: "Update equipment record",
    desc: "Keep the registry accurate for maintenance, valuation and insurance decisions.",
    kind: "wizard",
    success: "Equipment record updated",
    steps: ["Details", "Finance", "Confirm"],
  },
  "asset-detail": {
    title: "Equipment record",
    desc: "A readable asset record for the farm file.",
    kind: "detail",
    success: "Asset record reviewed",
  },
  "archive-asset": {
    title: "Archive this equipment?",
    desc: "This hides the asset from active planning but preserves its historical usage and costs.",
    kind: "confirm",
    success: "Equipment archived",
  },
  "add-service": {
    title: "Schedule maintenance",
    desc: "Create a service reminder with an owner, interval and budget.",
    kind: "wizard",
    success: "Service added to the maintenance calendar",
    steps: ["Service", "Assign", "Confirm"],
  },
  "service-detail": {
    title: "Service checklist",
    desc: "Review the work scope and the last recorded service point.",
    kind: "detail",
    success: "Checklist reviewed",
  },
  "complete-service": {
    title: "Mark service complete?",
    desc: "Confirm the job only after the checklist and receipt are attached to the record.",
    kind: "confirm",
    success: "Service marked complete",
  },
  "reschedule-service": {
    title: "Reschedule maintenance",
    desc: "Choose a practical new due date and tell the assigned person.",
    kind: "wizard",
    success: "Maintenance date moved",
    steps: ["Reason", "New date", "Confirm"],
  },
  "bulk-service": {
    title: "Plan a service day",
    desc: "Bundle nearby equipment checks for a faster farm maintenance morning.",
    kind: "wizard",
    success: "Service day planned",
    steps: ["Select work", "Assign", "Confirm"],
  },
  "log-usage": {
    title: "Log equipment use",
    desc: "Hours, fuel and operator detail make each asset cost trustworthy.",
    kind: "wizard",
    success: "Usage log added",
    steps: ["Activity", "Meter & fuel", "Confirm"],
  },
  "usage-detail": {
    title: "Usage entry",
    desc: "Read the field and operator context behind this equipment run.",
    kind: "detail",
    success: "Usage entry reviewed",
  },
  "duplicate-usage": {
    title: "Copy usage entry",
    desc: "Start from the last run, then update the date, plot and meter reading.",
    kind: "wizard",
    success: "Usage entry copied",
    steps: ["Activity", "Check", "Save"],
  },
  "hire-in": {
    title: "Record hired-in equipment",
    desc: "Capture supplier, rate and M-Pesa status before field work starts.",
    kind: "wizard",
    success: "Hired-in job recorded",
    steps: ["Hire details", "Cost", "Confirm"],
  },
  "hire-out": {
    title: "Create hire-out booking",
    desc: "Protect the asset, agreed rate and collection terms in one booking record.",
    kind: "wizard",
    success: "Hire-out booking created",
    steps: ["Customer", "Terms", "Confirm"],
  },
  "booking-detail": {
    title: "Hire booking",
    desc: "Review equipment, rate, settlement and purpose before changing the booking.",
    kind: "detail",
    success: "Booking reviewed",
  },
  "settle-hire": {
    title: "Settle hire with M-Pesa",
    desc: "Confirm the amount on the farm PIN pad. This is a secure demo payment.",
    kind: "payment",
    success: "M-Pesa hire payment recorded",
  },
  "rate-card": {
    title: "Edit hire rate card",
    desc: "Set practical rates, minimum hire and availability for nearby farmers.",
    kind: "wizard",
    success: "Rate card saved",
    steps: ["Rate", "Terms", "Confirm"],
  },
  "publish-market": {
    title: "Publish equipment listing",
    desc: "Choose what neighbours can book and the area you are comfortable serving.",
    kind: "wizard",
    success: "Listing published to GrowMO equipment marketplace",
    steps: ["Select assets", "Availability", "Publish"],
  },
  "log-fuel": {
    title: "Log fuel purchase",
    desc: "Add the diesel receipt now so cost per hour stays honest.",
    kind: "wizard",
    success: "Fuel entry saved",
    steps: ["Fuel", "Receipt", "Confirm"],
  },
  "fuel-receipt": {
    title: "Fuel receipt",
    desc: "Receipt detail stored with the MF 35 running cost record.",
    kind: "detail",
    success: "Fuel receipt reviewed",
  },
  "energy-check": {
    title: "Run fuel efficiency check",
    desc: "Compare current litres per hour against the MF 35 operating standard.",
    kind: "detail",
    success: "Efficiency check added to the farm notes",
  },
  "valuation-detail": {
    title: "Asset valuation",
    desc: "Compare a current local market estimate with the accounting book value.",
    kind: "detail",
    success: "Valuation reviewed",
  },
  "depreciation-settings": {
    title: "Depreciation settings",
    desc: "Choose the method used in farm accounts and lender-ready asset reports.",
    kind: "wizard",
    success: "Depreciation settings updated",
    steps: ["Method", "Useful life", "Confirm"],
  },
  export: {
    title: "Export machinery register",
    desc: "Prepare a clean CSV summary for your accountant, insurer or cooperative.",
    kind: "wizard",
    success: "Machinery report prepared",
    steps: ["Choose report", "Columns", "Export"],
  },
  insurance: {
    title: "Insurance check",
    desc: "Record cover, policy details and the date you need to renew protection.",
    kind: "wizard",
    success: "Insurance reminder saved",
    steps: ["Cover", "Policy", "Confirm"],
  },
  attachments: {
    title: "Attach equipment evidence",
    desc: "Save a photo, logbook scan or service receipt against this farm asset.",
    kind: "wizard",
    success: "Evidence attached to equipment record",
    steps: ["Choose file", "Describe", "Attach"],
  },
  "import-log": {
    title: "Import equipment log",
    desc: "Bring a paper or spreadsheet log into the current machinery register.",
    kind: "wizard",
    success: "Import review ready",
    steps: ["File", "Match columns", "Review"],
  },
  "service-report": {
    title: "Service cost report",
    desc: "Prepare a maintenance summary for the season and share it with the owner.",
    kind: "wizard",
    success: "Service report prepared",
    steps: ["Period", "Include", "Export"],
  },
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="gm-field">
      <span className="gm-field-label">{label}</span>
      {children}
    </div>
  );
}

function DetailRows({
  asset,
  task,
  hire,
  fuel,
  usage,
}: Pick<Props, "asset" | "task" | "hire" | "fuel" | "usage">) {
  const rows = asset
    ? [
        ["Equipment ID", asset.id],
        ["Make & model", asset.makeModel],
        ["Fuel", asset.fuelUse],
        ["Attachments", asset.attachments.join(" · ") || "None"],
        ["Insurance", asset.insurance],
        ["Notes", asset.notes],
      ]
    : task
      ? [
          ["Equipment", task.equipment],
          ["Frequency", task.frequency],
          ["Last done", task.lastDone],
          ["Next due", task.nextDue],
          ["Assigned to", task.assignedTo],
          ["Budget", task.estimatedCost ? kes(task.estimatedCost) : "No cost"],
        ]
      : hire
        ? [
            ["Direction", `Hire ${hire.direction.toLowerCase()}`],
            ["Equipment", hire.equipment],
            ["Customer / owner", hire.person],
            ["Phone", hire.phone],
            ["Rate", hire.rate],
            ["Purpose", hire.purpose],
            ["Settlement", hire.payment],
          ]
        : fuel
          ? [
              ["Date", fuel.date],
              ["Fuel", fuel.fuelType],
              ["Quantity", `${fuel.quantity} L`],
              ["Price", `${kes(fuel.pricePerLitre)} / L`],
              ["Equipment", fuel.equipment],
              ["Receipt", fuel.receipt],
            ]
          : usage
            ? [
                ["Date", usage.date],
                ["Equipment", usage.equipment],
                ["Activity", usage.activity],
                ["Duration", usage.duration],
                ["Operator", usage.operator],
                ["Notes", usage.notes],
              ]
            : [
                ["Farm", "Mary's Farm · Githunguri"],
                ["Status", "Ready to record"],
              ];
  return (
    <div className="gm-check-list">
      {rows.map(([label, value]) => (
        <div key={label} className="gm-check-row">
          <span style={{ flex: 1 }}>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

type Props = {
  active: MachineryModalId;
  asset?: EquipmentAsset | null;
  task?: MaintenanceTask | null;
  hire?: HireRecord | null;
  fuel?: FuelEntry | null;
  usage?: UsageLog | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

export function MachineryModalHub({
  active,
  asset,
  task,
  hire,
  fuel,
  usage,
  onClose,
  onSaved,
}: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [marketplace, setMarketplace] = useState(true);
  const [notify, setNotify] = useState(true);
  const meta = active ? MODALS[active] : null;

  useEffect(() => {
    if (!active) return;
    setStep(0);
    setBusy(false);
    setPaid(false);
    setMarketplace(active === "publish-market");
    setNotify(true);
  }, [active]);

  if (!active || !meta) return null;
  const steps = meta.steps ?? [];
  const finish = () => {
    setBusy(true);
    window.setTimeout(
      () => {
        setBusy(false);
        onSaved(meta.success);
        onClose();
      },
      meta.kind === "payment" ? 700 : 380,
    );
  };

  if (meta.kind === "detail") {
    const energy = active === "energy-check";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
        {energy ? (
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon">
              <Fuel />
            </span>
            <div style={{ flex: 1 }}>
              <span className="gm-eyebrow">October fuel signal</span>
              <h3 className="font-display mb-1">
                5.83 L/hr — 17% above normal
              </h3>
              <p className="mb-0 text-muted">
                Check the air filter and tyre pressure before the next ploughing
                run. Pole pole, a small check now protects the engine.
              </p>
            </div>
            <StatusChip label="Action needed" tone="medium" />
          </div>
        ) : (
          <DetailRows
            asset={asset}
            task={task}
            hire={hire}
            fuel={fuel}
            usage={usage}
          />
        )}
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          {active === "valuation-detail" ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onSaved("Valuation shared with farm finance");
                onClose();
              }}
            >
              Share with finance
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }

  if (meta.kind === "confirm") {
    const dangerous = active === "archive-asset";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-check-row">
          <span className="gm-mega-icon">
            {dangerous ? <Trash2 /> : <ClipboardCheck />}
          </span>
          <span>
            <strong>{asset?.name ?? task?.service ?? "Selected record"}</strong>
            <small>
              {dangerous
                ? "You can restore it later from the archived equipment report."
                : "The completion time and budget will become part of the maintenance record."}
            </small>
          </span>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Keep editing
          </button>
          <button
            type="button"
            className={
              dangerous ? "gm-btn gm-btn-danger-soft" : "gm-btn gm-btn-lime"
            }
            disabled={busy}
            onClick={finish}
          >
            {busy ? (
              <LoaderCircle className="gm-spinner" />
            ) : dangerous ? (
              "Archive equipment"
            ) : (
              "Confirm complete"
            )}
          </button>
        </div>
      </Dialog>
    );
  }

  if (meta.kind === "payment") {
    const total = hire?.total ?? 3000;
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <HandCoins />
          </span>
          <div style={{ flex: 1 }}>
            <small className="text-muted d-block">Paying to</small>
            <strong>{hire?.person ?? "AgriHire Kiambu"}</strong>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.55rem" }}
            >
              {kes(total)}
            </strong>
          </div>
          <StatusChip
            label={paid ? "Confirmed" : "Awaiting PIN"}
            tone={paid ? "low" : "medium"}
          />
        </div>
        {!paid ? (
          <div className="mt-3">
            <PinPad
              actionLabel="Enter any 4 digits to confirm the demo M-Pesa payment"
              onComplete={() => setPaid(true)}
            />
          </div>
        ) : (
          <div className="gm-check-row mt-3">
            <CheckCircle2 />
            <span>
              <strong>STK confirmation received</strong>
              <small>
                Receipt GM-MACH-1026 will be attached to the hire booking.
              </small>
            </span>
          </div>
        )}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          {paid ? (
            <button
              type="button"
              className="gm-btn gm-btn-mpesa"
              disabled={busy}
              onClick={finish}
            >
              {busy ? <LoaderCircle className="gm-spinner" /> : "Save payment"}
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }

  const isFuel = active === "log-fuel";
  const isUsage = active === "log-usage" || active === "duplicate-usage";
  const isHire = active === "hire-in" || active === "hire-out";
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <Field
            label={
              isFuel
                ? "Fuel type"
                : isUsage
                  ? "Equipment used"
                  : isHire
                    ? "Equipment"
                    : active === "insurance"
                      ? "Equipment to cover"
                      : "Equipment name"
            }
          >
            <select
              className="gm-select"
              defaultValue={asset?.name ?? "MF 35 Tractor"}
            >
              <option>{asset?.name ?? "MF 35 Tractor"}</option>
              <option>Drip irrigation kit (1 acre)</option>
              <option>Knapsack sprayer × 2</option>
              <option>Trailer 2-tonne</option>
            </select>
          </Field>
          <Field
            label={
              isFuel
                ? "Quantity (litres)"
                : isUsage
                  ? "Activity"
                  : isHire
                    ? "Date of job"
                    : "Category / record type"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                isFuel
                  ? "20"
                  : isUsage
                    ? (usage?.activity ?? "Land preparation")
                    : isHire
                      ? "05 Nov 2026"
                      : active === "register"
                        ? "Tractor"
                        : "Farm equipment"
              }
            />
          </Field>
          <Field
            label={
              isFuel
                ? "Price per litre (KES)"
                : isUsage
                  ? "Operator"
                  : isHire
                    ? "Customer / owner"
                    : "Storage location"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                isFuel
                  ? "195"
                  : isUsage
                    ? (usage?.operator ?? "John Mwangi")
                    : isHire
                      ? (hire?.person ?? "Kariuki Farms")
                      : (asset?.storage ?? "Garage at home compound")
              }
            />
          </Field>
          <Field
            label={
              isFuel
                ? "Purchase date"
                : isUsage
                  ? "Plot / location"
                  : isHire
                    ? "Rate agreed"
                    : "Notes"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                isFuel
                  ? "30 Oct 2026"
                  : isUsage
                    ? (usage?.plot ?? "Plot 1 · Home shamba")
                    : isHire
                      ? (hire?.rate ?? "KES 3,500/acre")
                      : (asset?.notes ?? "Record checked with farm manager")
              }
            />
          </Field>
          {active === "attachments" || active === "import-log" ? (
            <div className="col-12">
              <button type="button" className="gm-upload-drop w-100">
                <ImagePlus /> Choose a logbook photo or CSV file{" "}
                <small>PDF, JPG or CSV · demo upload</small>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="row g-3 mt-1">
          <Field
            label={
              isFuel
                ? "Receipt reference"
                : isUsage
                  ? "Hours / duration"
                  : isHire
                    ? "Duration"
                    : active === "depreciation-settings"
                      ? "Useful life (years)"
                      : "Assigned person"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                isFuel
                  ? "RCPT-9012"
                  : isUsage
                    ? (usage?.duration ?? "3 hrs")
                    : isHire
                      ? (hire?.duration ?? "1 acre · 3 hrs")
                      : active === "depreciation-settings"
                        ? "10"
                        : (task?.assignedTo ?? "Mary Wanjiku")
              }
            />
          </Field>
          <Field
            label={
              isFuel
                ? "Equipment hour meter"
                : isUsage
                  ? "Fuel used (L)"
                  : isHire
                    ? "Payment method"
                    : active === "depreciation-settings"
                      ? "Depreciation method"
                      : "Due date / interval"
            }
          >
            <select
              className="gm-select"
              defaultValue={
                isFuel
                  ? "2,006 hrs"
                  : isUsage
                    ? String(usage?.fuelLitres ?? 0)
                    : isHire
                      ? "M-Pesa"
                      : active === "depreciation-settings"
                        ? "Straight line"
                        : "Monthly"
              }
            >
              <option>
                {isFuel
                  ? "2,006 hrs"
                  : isUsage
                    ? String(usage?.fuelLitres ?? 0)
                    : isHire
                      ? "M-Pesa"
                      : active === "depreciation-settings"
                        ? "Straight line"
                        : "Monthly"}
              </option>
              <option>Weekly</option>
              <option>Seasonal</option>
            </select>
          </Field>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label="Notify assigned person"
              desc="Send a GrowMO in-app reminder after this record is saved."
            />
          </div>
          {active === "publish-market" ? (
            <div className="col-12">
              <Toggle
                checked={marketplace}
                onChange={setMarketplace}
                label="Show on Githunguri marketplace"
                desc="Only approved equipment and rate card details will be visible to nearby farmers."
              />
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-2">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon">
              {isFuel ? (
                <Fuel />
              ) : isHire ? (
                <HandCoins />
              ) : active === "export" || active === "service-report" ? (
                <Download />
              ) : active === "insurance" ? (
                <ShieldCheck />
              ) : active === "register" ? (
                <Tractor />
              ) : (
                <Wrench />
              )}
            </span>
            <div style={{ flex: 1 }}>
              <span className="gm-eyebrow">Ready to save</span>
              <h3 className="font-display mb-1">
                {isFuel
                  ? "Fuel cost ready for the MF 35 ledger"
                  : isHire
                    ? "Terms captured for the equipment booking"
                    : "This record is ready for Mary's Farm file"}
              </h3>
              <p className="mb-0 text-muted">
                Kumbuka: clean records make repairs, hire income and lender
                reports easier to trust.
              </p>
            </div>
            <BadgeCheck />
          </div>
          <div className="gm-check-row mt-3">
            <CalendarClock />
            <span>
              <strong>
                {notify ? "Reminder will be sent" : "No reminder will be sent"}
              </strong>
              <small>
                Every change remains in the machinery activity history.
              </small>
            </span>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((current) => Math.max(0, current - 1))}
        onNext={() => {
          if (step < steps.length - 1) setStep((current) => current + 1);
          else finish();
        }}
        finishLabel={
          busy
            ? "Saving…"
            : active === "publish-market"
              ? "Publish listing"
              : active === "export" || active === "service-report"
                ? "Prepare report"
                : "Save record"
        }
        nextDisabled={busy}
      />
    </Dialog>
  );
}
