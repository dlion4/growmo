/* ============================================================================
   PAGE 24 WORKFLOWS — harvest intake, grading, storage quality and value add.
   ========================================================================== */
import {
  BadgeCheck,
  CheckCircle2,
  Download,
  HandCoins,
  Leaf,
  LoaderCircle,
  PackageCheck,
  Send,
  ShieldCheck,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  HarvestRecord,
  PackingOption,
  StorageFacility,
  StorageLog,
  ValueAddition,
} from "../../data/app/harvest";
import { HARVEST_CONTEXT } from "../../data/app/harvest";
import { Dialog, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

export type HarvestModalId =
  | "record-harvest"
  | "harvest-detail"
  | "edit-harvest"
  | "attach-photos"
  | "finalise-harvest"
  | "delete-harvest"
  | "crop-units"
  | "grade-batch"
  | "grading-standard"
  | "quality-inspection"
  | "regrade-batch"
  | "reject-batch"
  | "print-grade-label"
  | "packing-detail"
  | "create-packing-run"
  | "packaging-stock"
  | "stack-safety"
  | "buy-packaging"
  | "facility-detail"
  | "add-facility"
  | "storage-entry"
  | "move-storage"
  | "record-condition"
  | "condition-alert"
  | "release-storage"
  | "loss-detail"
  | "record-loss"
  | "loss-recommendation"
  | "approve-urgent-sale"
  | "value-add-detail"
  | "create-value-run"
  | "cost-analysis"
  | "buyer-ready-pack"
  | "export-harvest"
  | "share-quality"
  | null;

type FlowKind = "wizard" | "confirm" | "detail" | "payment";
type FlowMeta = {
  title: string;
  desc: string;
  kind: FlowKind;
  success: string;
  steps?: string[];
};

const FLOWS: Record<Exclude<HarvestModalId, null>, FlowMeta> = {
  "record-harvest": {
    title: "Record harvest",
    desc: "Capture the crop-specific unit, plot, crew, grade quantities and handling action while the harvest is fresh.",
    kind: "wizard",
    success: "Harvest recorded in the post-harvest log",
    steps: ["Harvest", "Grades", "Handling"],
  },
  "harvest-detail": {
    title: "Harvest record detail",
    desc: "Review the complete harvest, yield, quality and handling record before grading or selling.",
    kind: "detail",
    success: "Harvest record reviewed",
  },
  "edit-harvest": {
    title: "Edit harvest record",
    desc: "Correct a crop, quantity, harvest crew or field note while retaining the audit trail.",
    kind: "wizard",
    success: "Harvest record updated",
    steps: ["Harvest", "Quality", "Save"],
  },
  "attach-photos": {
    title: "Attach harvest evidence",
    desc: "Add a harvest, grading or crated-produce photo reference to the farm quality trail.",
    kind: "wizard",
    success: "Harvest evidence attached",
    steps: ["Photo type", "Note", "Attach"],
  },
  "finalise-harvest": {
    title: "Finalise harvest record?",
    desc: "Finalising makes the yield, grade totals and post-harvest plan available for buyer and storage workflows.",
    kind: "confirm",
    success: "Harvest record finalised",
  },
  "delete-harvest": {
    title: "Delete this draft harvest?",
    desc: "The draft will be removed from the active log. Confirmed sale and storage records stay protected.",
    kind: "confirm",
    success: "Draft harvest deleted",
  },
  "crop-units": {
    title: "Crop-specific units guide",
    desc: "Use the practical Kenyan market unit for every crop so yield, storage and sales stay comparable.",
    kind: "detail",
    success: "Crop unit guide reviewed",
  },
  "grade-batch": {
    title: "Grade harvest batch",
    desc: "Sort the batch by market quality and create a grade record before packing or storage.",
    kind: "wizard",
    success: "Grading batch recorded",
    steps: ["Batch", "Grade split", "Confirm"],
  },
  "grading-standard": {
    title: "Grading standard",
    desc: "Review the crop quality rules that determine premium, standard, low-grade and reject channels.",
    kind: "detail",
    success: "Grading standard reviewed",
  },
  "quality-inspection": {
    title: "Run quality inspection",
    desc: "Record firmness, size, visible damage and buyer suitability before a batch is released.",
    kind: "wizard",
    success: "Quality inspection saved",
    steps: ["Inspect", "Decision", "Save"],
  },
  "regrade-batch": {
    title: "Regrade a batch",
    desc: "Move produce between grades after a quality check while retaining the original grading record.",
    kind: "wizard",
    success: "Batch grading updated",
    steps: ["Batch", "New grade", "Confirm"],
  },
  "reject-batch": {
    title: "Reject this batch?",
    desc: "Rejected produce will be clearly marked for composting, safe disposal or a non-premium use.",
    kind: "confirm",
    success: "Batch marked for safe disposition",
  },
  "print-grade-label": {
    title: "Prepare grade label",
    desc: "Create a clear crop, grade, date and lot label for a crate or buyer handover.",
    kind: "wizard",
    success: "Grade label prepared",
    steps: ["Batch", "Label", "Prepare"],
  },
  "packing-detail": {
    title: "Packing option detail",
    desc: "Review package capacity, stack safety and shelf-life guidance for this crop.",
    kind: "detail",
    success: "Packing option reviewed",
  },
  "create-packing-run": {
    title: "Create packing run",
    desc: "Turn graded produce into a traceable packed batch ready for storage or a buyer collection.",
    kind: "wizard",
    success: "Packing run created",
    steps: ["Produce", "Package", "Label"],
  },
  "packaging-stock": {
    title: "Packaging stock check",
    desc: "Review crates, bags, boxes and labels before committing produce to a packing run.",
    kind: "detail",
    success: "Packaging stock reviewed",
  },
  "stack-safety": {
    title: "Check stack safety",
    desc: "Confirm package type, load and stack limit before crates or bags leave the grading area.",
    kind: "wizard",
    success: "Stack safety check saved",
    steps: ["Package", "Stack", "Confirm"],
  },
  "buy-packaging": {
    title: "Pay for packaging by M-Pesa",
    desc: "Confirm a small packaging purchase for the active post-harvest batch using secure demo M-Pesa.",
    kind: "payment",
    success: "M-Pesa packaging payment recorded",
  },
  "facility-detail": {
    title: "Storage facility detail",
    desc: "Review capacity, conditions, crop fit and practical handling requirements for this space.",
    kind: "detail",
    success: "Storage facility reviewed",
  },
  "add-facility": {
    title: "Add storage facility",
    desc: "Register a shade, store, cold-room hire or drying yard with its crop conditions and capacity.",
    kind: "wizard",
    success: "Storage facility added",
    steps: ["Facility", "Conditions", "Save"],
  },
  "storage-entry": {
    title: "Record storage entry",
    desc: "Put a packed grade into the right location with condition, duration and release plan.",
    kind: "wizard",
    success: "Storage entry recorded",
    steps: ["Batch", "Location", "Confirm"],
  },
  "move-storage": {
    title: "Move stored produce",
    desc: "Record a transfer between storage spaces or to an approved buyer collection point.",
    kind: "wizard",
    success: "Storage movement recorded",
    steps: ["Batch", "Destination", "Confirm"],
  },
  "record-condition": {
    title: "Record storage condition",
    desc: "Log a temperature, humidity, ventilation, pest or spoilage check against the facility record.",
    kind: "wizard",
    success: "Storage condition logged",
    steps: ["Parameter", "Reading", "Save"],
  },
  "condition-alert": {
    title: "Create storage condition alert",
    desc: "Set a targeted action for a storage condition that could affect crop quality or shelf life.",
    kind: "wizard",
    success: "Storage alert scheduled",
    steps: ["Condition", "Action", "Notify"],
  },
  "release-storage": {
    title: "Release stored produce",
    desc: "Confirm the batch is leaving storage for a buyer, market trip or value-addition step.",
    kind: "wizard",
    success: "Storage release recorded",
    steps: ["Batch", "Destination", "Release"],
  },
  "loss-detail": {
    title: "Post-harvest loss detail",
    desc: "See where physical damage, shrinkage and rot are consuming crop value across the route to market.",
    kind: "detail",
    success: "Loss detail reviewed",
  },
  "record-loss": {
    title: "Record post-harvest loss",
    desc: "Capture a quality loss promptly so the farm can improve packing, storage and transport decisions.",
    kind: "wizard",
    success: "Post-harvest loss recorded",
    steps: ["Loss", "Stage", "Save"],
  },
  "loss-recommendation": {
    title: "Loss reduction plan",
    desc: "Turn the current loss pattern into a practical handling, storage or selling action.",
    kind: "wizard",
    success: "Loss reduction action saved",
    steps: ["Recommendation", "Owner", "Schedule"],
  },
  "approve-urgent-sale": {
    title: "Approve urgent sale?",
    desc: "This records a quality-protection decision to sell before the batch loses further value.",
    kind: "confirm",
    success: "Urgent sale decision recorded",
  },
  "value-add-detail": {
    title: "Value-addition detail",
    desc: "Review the input, expected buyer-ready output, equipment and cost before processing a batch.",
    kind: "detail",
    success: "Value-addition option reviewed",
  },
  "create-value-run": {
    title: "Create value-addition run",
    desc: "Plan trimming, packing, washing, drying or bundling that lifts the market value of a batch.",
    kind: "wizard",
    success: "Value-addition run created",
    steps: ["Batch", "Process", "Costing"],
  },
  "cost-analysis": {
    title: "Value-addition cost analysis",
    desc: "Compare the handling cost to the added market value before committing labour and packaging.",
    kind: "detail",
    success: "Value-addition analysis reviewed",
  },
  "buyer-ready-pack": {
    title: "Prepare buyer-ready pack",
    desc: "Package, label and quality-check a batch so a buyer receives a clear, consistent handover.",
    kind: "wizard",
    success: "Buyer-ready pack prepared",
    steps: ["Batch", "Pack", "Handover"],
  },
  "export-harvest": {
    title: "Export harvest & storage report",
    desc: "Prepare crop-specific harvest, grade, storage and loss information for records or a buyer meeting.",
    kind: "wizard",
    success: "Post-harvest report prepared",
    steps: ["Report", "Columns", "Export"],
  },
  "share-quality": {
    title: "Share quality summary",
    desc: "Prepare a concise crop-quality record for a buyer, extension officer or cooperative collection centre.",
    kind: "wizard",
    success: "Quality summary prepared for sharing",
    steps: ["Batch", "Access", "Prepare"],
  },
};

type Props = {
  active: HarvestModalId;
  harvest?: HarvestRecord | null;
  facility?: StorageFacility | null;
  packing?: PackingOption | null;
  storage?: StorageLog | null;
  valueAdd?: ValueAddition | null;
  onClose: () => void;
  onSaved: (message: string) => void;
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

function downloadHarvestReport() {
  const text = [
    "GROWMO POST-HARVEST SUMMARY",
    `${HARVEST_CONTEXT.farm} · ${HARVEST_CONTEXT.county}`,
    "Cabbage Gloria F1: 14,500 heads · 10,000 Grade A",
    "Keep Grade A cool and sell within 48 hours.",
    "Prepared in GrowMO.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "marys-farm-post-harvest-summary.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function HarvestModalHub({
  active,
  harvest,
  facility,
  packing,
  storage,
  valueAdd,
  onClose,
  onSaved,
}: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [notify, setNotify] = useState(true);
  const meta = active ? FLOWS[active] : null;
  useEffect(() => {
    if (active) {
      setStep(0);
      setBusy(false);
      setPaid(false);
      setNotify(true);
    }
  }, [active]);
  if (!active || !meta) return null;
  const selectedName =
    harvest?.crop ??
    facility?.name ??
    packing?.package ??
    storage?.crop ??
    valueAdd?.activity ??
    "Cabbage Gloria F1 batch";
  const finish = () => {
    setBusy(true);
    window.setTimeout(
      () => {
        setBusy(false);
        onSaved(meta.success);
        onClose();
      },
      meta.kind === "payment" ? 760 : 400,
    );
  };
  const rows =
    active === "harvest-detail"
      ? [
          ["Harvest", harvest?.crop ?? "Cabbage Gloria F1"],
          ["Plot", harvest?.plot ?? "Plot 1 · 0.52 acres"],
          ["Harvested", harvest?.quantity ?? "14,500 heads"],
          ["Grade A", harvest?.gradeA ?? "10,000 heads"],
          ["Handling", "Shaded and crated within one hour"],
        ]
      : active === "facility-detail"
        ? [
            ["Facility", facility?.name ?? "Main shade"],
            ["Capacity", facility?.capacity ?? "5 tonnes"],
            [
              "Conditions",
              `${facility?.temperature ?? "Ambient"} · ${facility?.humidity ?? "Ambient"}`,
            ],
            ["Crop fit", facility?.crops ?? "Cabbage and tomato short-term"],
            [
              "Handling note",
              facility?.note ?? "Use a fast sell-through plan.",
            ],
          ]
        : active === "packing-detail"
          ? [
              ["Crop", packing?.crop ?? "Cabbage"],
              ["Package", packing?.package ?? "Wooden open crate"],
              ["Capacity", packing?.quantity ?? "30 heads"],
              ["Stack limit", packing?.stack ?? "4 high"],
              ["Shelf life", packing?.shelfLife ?? "7–10 days cool"],
            ]
          : active === "value-add-detail"
            ? [
                ["Activity", valueAdd?.activity ?? "Cabbage trim and wax"],
                ["Input", valueAdd?.input ?? "Fresh cabbage"],
                ["Output", valueAdd?.output ?? "Market-ready cabbage"],
                ["Added value", valueAdd?.addedValue ?? "+KES 5/head"],
                [
                  "Equipment",
                  valueAdd?.equipment ?? "Knives, wax, grading table",
                ],
              ]
            : active === "loss-detail"
              ? [
                  ["Current total loss", "8% · KES 28,740"],
                  ["Largest source", "Physical damage · KES 17,400"],
                  ["Storage response", "Sell Grade A within 48 hours"],
                  ["Transport response", "No more than four crates high"],
                ]
              : [
                  ["Selected record", selectedName],
                  ["Farm", `${HARVEST_CONTEXT.farm} · ${HARVEST_CONTEXT.ward}`],
                  [
                    "Quality process",
                    "Crop-specific unit, grade and handling trail",
                  ],
                  [
                    "Storage focus",
                    "Protect quality and sell in the right window",
                  ],
                ];

  if (meta.kind === "detail")
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
        <div className="gm-check-list">
          {rows.map(([label, value]) => (
            <div className="gm-check-row" key={label}>
              <BadgeCheck />
              <span>
                <strong>{label}</strong>
                <small>{value}</small>
              </span>
            </div>
          ))}
        </div>
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <ShieldCheck />
          </span>
          <div>
            <strong>Quality stays connected to the crop record</strong>
            <p className="mb-0 text-muted">
              Harvest, grade, packing, storage and loss notes stay visible for
              the next buyer decision.
            </p>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => {
              downloadHarvestReport();
              onSaved("Post-harvest document download prepared");
              onClose();
            }}
          >
            <Download /> Download summary
          </button>
        </div>
      </Dialog>
    );
  if (meta.kind === "confirm") {
    const destructive =
      active === "delete-harvest" || active === "reject-batch";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-check-row">
          <span className="gm-mega-icon">
            {destructive ? <Trash2 /> : <CheckCircle2 />}
          </span>
          <span>
            <strong>{selectedName}</strong>
            <small>
              {destructive
                ? "The protected harvest and buyer history will remain separate from the removed draft batch."
                : "The decision will be stored with the crop-quality timeline."}
            </small>
          </span>
        </div>
        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Keep reviewing
          </button>
          <button
            type="button"
            className={
              destructive ? "gm-btn gm-btn-danger-soft" : "gm-btn gm-btn-lime"
            }
            disabled={busy}
            onClick={finish}
          >
            {busy ? (
              <LoaderCircle className="gm-spinner" />
            ) : destructive ? (
              "Confirm action"
            ) : active === "approve-urgent-sale" ? (
              "Approve sale"
            ) : (
              "Finalise record"
            )}
          </button>
        </div>
      </Dialog>
    );
  }
  if (meta.kind === "payment")
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <HandCoins />
          </span>
          <div style={{ flex: 1 }}>
            <small className="text-muted d-block">Packaging purchase</small>
            <strong>Plastic crates for Grade A cabbage</strong>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.5rem" }}
            >
              KES 2,400
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
              actionLabel="Enter any 4 digits to confirm the secure demo M-Pesa payment"
              onComplete={() => setPaid(true)}
            />
          </div>
        ) : (
          <div className="gm-check-row mt-3">
            <CheckCircle2 />
            <span>
              <strong>M-Pesa confirmation received</strong>
              <small>
                Receipt GM-PACK-2027 will be attached to the packing run.
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
  const steps = meta.steps ?? [];
  const isShare = [
    "export-harvest",
    "share-quality",
    "print-grade-label",
  ].includes(active);
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} onStep={setStep} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <Field label={isShare ? "Harvest record" : "Crop or batch"}>
              <select className="gm-select" defaultValue={selectedName}>
                <option>{selectedName}</option>
                <option>Cabbage Gloria F1 · Grade A batch</option>
                <option>Tomato Anna F1 · Extra Class</option>
                <option>H6213 maize · dry grain</option>
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label={isShare ? "Use" : "Reference"}>
              <input
                className="gm-input"
                defaultValue={
                  isShare
                    ? "Buyer / farm quality summary"
                    : "GrowMO post-harvest record"
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label={isShare ? "Sharing note" : "Handling note"}>
              <textarea
                className="gm-input"
                rows={3}
                defaultValue={
                  isShare
                    ? "Use crop-specific units and show the grade, handling and storage history clearly."
                    : "Keep this crop shaded, correctly packed and linked to its next storage or buyer action."
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label={
                isShare ? "Keep a document trail" : "Notify the harvest team"
              }
              desc={
                isShare
                  ? "The prepared summary remains in the post-harvest timeline."
                  : "A GrowMO reminder will appear before the next handling step."
              }
            />
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-check-list mt-3">
          <div className="gm-check-row">
            <PackageCheck />
            <span>
              <strong>Crop and grade check</strong>
              <small>
                Use the correct Kenyan market unit, grading standard and
                suitable package before storage.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <Warehouse />
            <span>
              <strong>Storage check</strong>
              <small>
                Facility conditions, stack limits and shelf-life expectations
                remain visible in the batch record.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <Leaf />
            <span>
              <strong>Loss-prevention check</strong>
              <small>
                Prioritise fast selling, safe stacking and clean handling for
                premium produce.
              </small>
            </span>
          </div>
        </div>
      ) : (
        <div className="gm-plan-detail-hero mt-3">
          <span className="gm-mega-icon">
            <Send />
          </span>
          <div>
            <strong>Ready to record</strong>
            <p className="mb-0 text-muted">
              Review the quality action, then save it in the post-harvest chain
              of custody.
            </p>
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={steps.length - 1}
        onBack={() => setStep((value) => Math.max(0, value - 1))}
        onNext={() =>
          step === steps.length - 1 ? finish() : setStep((value) => value + 1)
        }
        finishLabel={isShare ? "Prepare document" : "Confirm & save"}
        nextDisabled={busy}
      />
    </Dialog>
  );
}
