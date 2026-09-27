/* ============================================================================
   PAGE 25 WORKFLOWS — seed traceability, nursery care and planting readiness.
   ========================================================================== */
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Download,
  HandCoins,
  Leaf,
  LoaderCircle,
  Send,
  ShieldCheck,
  Sprout,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  NurseryRecord,
  SeedlingPurchase,
  SeedStock,
} from "../../data/app/nursery";
import { NURSERY_CONTEXT } from "../../data/app/nursery";
import { Dialog, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

export type NurseryModalId =
  | "add-seed"
  | "seed-detail"
  | "edit-seed"
  | "test-germination"
  | "write-off-seed"
  | "storage-guide"
  | "add-nursery"
  | "nursery-detail"
  | "edit-nursery"
  | "sow-seed"
  | "record-watering"
  | "attach-nursery-photo"
  | "germination-log"
  | "observation-detail"
  | "thin-seedlings"
  | "fertilise-nursery"
  | "harden-seedlings"
  | "calculate-germination"
  | "health-detail"
  | "run-health-check"
  | "create-treatment"
  | "flag-health-issue"
  | "readiness-detail"
  | "schedule-transplant"
  | "confirm-transplant"
  | "assign-transplant-team"
  | "add-purchase"
  | "purchase-detail"
  | "verify-source"
  | "pay-purchase"
  | "receive-purchase"
  | "direct-planting"
  | "emergence-detail"
  | "record-emergence"
  | "replant-gaps"
  | "performance-detail"
  | "ai-recommendation"
  | "export-nursery"
  | "share-nursery-plan"
  | null;

type FlowKind = "wizard" | "confirm" | "detail" | "payment";
type FlowMeta = {
  title: string;
  desc: string;
  kind: FlowKind;
  success: string;
  steps?: string[];
};

const FLOWS: Record<Exclude<NurseryModalId, null>, FlowMeta> = {
  "add-seed": {
    title: "Add seed lot",
    desc: "Register crop, variety, supplier, certified lot, expiry and safe storage guidance before seed leaves the store.",
    kind: "wizard",
    success: "Seed lot added to the store",
    steps: ["Seed lot", "Storage", "Save"],
  },
  "seed-detail": {
    title: "Certified seed lot",
    desc: "Review the seed identity, germination evidence, storage condition and crop plan before sowing.",
    kind: "detail",
    success: "Seed lot reviewed",
  },
  "edit-seed": {
    title: "Edit seed lot",
    desc: "Correct a quantity, expiry, lot note or storage condition while keeping the traceability record useful.",
    kind: "wizard",
    success: "Seed lot updated",
    steps: ["Seed lot", "Condition", "Save"],
  },
  "test-germination": {
    title: "Run germination test",
    desc: "Plan a simple count from this lot so planting decisions use observed viability, si kubahatisha.",
    kind: "wizard",
    success: "Germination test scheduled",
    steps: ["Sample", "Count", "Confirm"],
  },
  "write-off-seed": {
    title: "Write off this seed lot?",
    desc: "This removes unusable seed from available stock. Keep the reason in the traceability record.",
    kind: "confirm",
    success: "Seed lot written off safely",
  },
  "storage-guide": {
    title: "Seed storage guide",
    desc: "Use crop-specific temperature, humidity and container advice to protect germination until planting day.",
    kind: "detail",
    success: "Storage guidance reviewed",
  },
  "add-nursery": {
    title: "Establish nursery",
    desc: "Set the crop, seed lot, target seedlings, location, soil mix and care routine before sowing.",
    kind: "wizard",
    success: "Nursery establishment plan saved",
    steps: ["Crop", "Bed setup", "Care plan"],
  },
  "nursery-detail": {
    title: "Nursery record",
    desc: "Review the full seed-to-seedling setup, daily care and transplant window for this nursery.",
    kind: "detail",
    success: "Nursery record reviewed",
  },
  "edit-nursery": {
    title: "Update nursery setup",
    desc: "Adjust a practical setup detail, assigned grower or transplant target without losing the original record.",
    kind: "wizard",
    success: "Nursery setup updated",
    steps: ["Setup", "Care", "Save"],
  },
  "sow-seed": {
    title: "Record sowing",
    desc: "Capture seed quantity, drill spacing, depth and first watering immediately after the bed is prepared.",
    kind: "wizard",
    success: "Sowing activity recorded",
    steps: ["Seed lot", "Method", "Confirm"],
  },
  "record-watering": {
    title: "Record nursery watering",
    desc: "Log a light morning or evening misting so moisture care remains balanced and visible to the team.",
    kind: "wizard",
    success: "Watering entry recorded",
    steps: ["Nursery", "Observation", "Save"],
  },
  "attach-nursery-photo": {
    title: "Attach nursery photo note",
    desc: "Create a dated visual evidence note for emergence, health, hardening or transplant readiness.",
    kind: "wizard",
    success: "Nursery photo note attached",
    steps: ["Stage", "Caption", "Attach"],
  },
  "germination-log": {
    title: "Germination timeline",
    desc: "Review sowing, emergence, thinning, true-leaf and hardening actions across the first 30 days.",
    kind: "detail",
    success: "Germination timeline reviewed",
  },
  "observation-detail": {
    title: "Germination observation",
    desc: "Open the observation, photo note and completed field action for this nursery day.",
    kind: "detail",
    success: "Observation reviewed",
  },
  "thin-seedlings": {
    title: "Record thinning",
    desc: "Remove weak or doubled seedlings and record the new spacing so strong plants have room to grow.",
    kind: "wizard",
    success: "Thinning recorded",
    steps: ["Count", "Spacing", "Confirm"],
  },
  "fertilise-nursery": {
    title: "Feed seedlings",
    desc: "Record a light labelled DAP solution or nursery feed after true leaves develop; avoid heavy early feeding.",
    kind: "wizard",
    success: "Nursery feeding recorded",
    steps: ["Product", "Rate", "Save"],
  },
  "harden-seedlings": {
    title: "Start hardening off",
    desc: "Reduce shade and watering carefully before transplanting so seedlings handle field conditions well.",
    kind: "wizard",
    success: "Hardening plan saved",
    steps: ["Nursery", "Schedule", "Confirm"],
  },
  "calculate-germination": {
    title: "Germination-rate calculator",
    desc: "Compare counted seedlings with the seeds sown and check the result against the 80% certified-seed threshold.",
    kind: "wizard",
    success: "Germination calculation saved",
    steps: ["Inputs", "Result", "Record"],
  },
  "health-detail": {
    title: "Seedling health guide",
    desc: "Review symptoms, likely cause, safe treatment and prevention before acting in a nursery bed.",
    kind: "detail",
    success: "Health guidance reviewed",
  },
  "run-health-check": {
    title: "Run seedling health check",
    desc: "Inspect stems, leaves, spacing, pests and moisture, then make a focused care decision.",
    kind: "wizard",
    success: "Health check recorded",
    steps: ["Inspect", "Findings", "Save"],
  },
  "create-treatment": {
    title: "Create treatment plan",
    desc: "Set a safe, labelled nursery treatment and follow-up check; always follow the product label and PHI guidance.",
    kind: "wizard",
    success: "Treatment plan recorded",
    steps: ["Issue", "Treatment", "Schedule"],
  },
  "flag-health-issue": {
    title: "Flag seedling health issue",
    desc: "Escalate a serious nursery issue to the farm team with a clear location and immediate containment action.",
    kind: "wizard",
    success: "Health alert shared with the nursery team",
    steps: ["Issue", "Contain", "Notify"],
  },
  "readiness-detail": {
    title: "Transplanting readiness",
    desc: "Review the nine seedling, field, weather and labour checks before seedlings leave the nursery.",
    kind: "detail",
    success: "Readiness checklist reviewed",
  },
  "schedule-transplant": {
    title: "Schedule transplanting",
    desc: "Plan the nursery, field, weather window and crop target for a calm, well-watered transplant day.",
    kind: "wizard",
    success: "Transplanting schedule saved",
    steps: ["Date", "Field", "Team"],
  },
  "confirm-transplant": {
    title: "Confirm transplanting?",
    desc: "This will mark the ready cabbage seedlings as moved to Plot 1 and preserve the nursery completion record.",
    kind: "confirm",
    success: "Transplanting confirmed",
  },
  "assign-transplant-team": {
    title: "Assign transplant team",
    desc: "Confirm the five workers, field supervisor and early-morning workflow before the seedlings move.",
    kind: "wizard",
    success: "Transplant team assigned",
    steps: ["Workers", "Timing", "Confirm"],
  },
  "add-purchase": {
    title: "Add seedling purchase",
    desc: "Record external seedlings or tubers with nursery source, quality, KEPHIS verification and cost.",
    kind: "wizard",
    success: "Seedling purchase recorded",
    steps: ["Source", "Quality", "Payment"],
  },
  "purchase-detail": {
    title: "Seedling purchase detail",
    desc: "Review supplier evidence, condition at arrival, quantity, price and receiving notes.",
    kind: "detail",
    success: "Purchase record reviewed",
  },
  "verify-source": {
    title: "Verify nursery source",
    desc: "Record the seller certificate, crop label and disease-free quality check before accepting planting material.",
    kind: "wizard",
    success: "Source verification saved",
    steps: ["Certificate", "Inspect", "Save"],
  },
  "pay-purchase": {
    title: "Pay nursery purchase by M-Pesa",
    desc: "Use the secure demo M-Pesa flow to confirm payment for the selected planting material.",
    kind: "payment",
    success: "M-Pesa seedling payment recorded",
  },
  "receive-purchase": {
    title: "Receive planting material",
    desc: "Accept, count and quality-check seedlings or tubers as they arrive on the farm.",
    kind: "wizard",
    success: "Purchase received into farm records",
    steps: ["Count", "Quality", "Confirm"],
  },
  "direct-planting": {
    title: "Record direct planting",
    desc: "Set seed rate, spacing, fertiliser, depth and expected emergence for maize, beans or another directly sown crop.",
    kind: "wizard",
    success: "Direct planting plan saved",
    steps: ["Crop", "Spacing", "Confirm"],
  },
  "emergence-detail": {
    title: "Emergence assessment",
    desc: "Review representative row counts and decide whether the field meets the 85% emergence benchmark.",
    kind: "detail",
    success: "Emergence assessment reviewed",
  },
  "record-emergence": {
    title: "Record emergence samples",
    desc: "Count actual plants across sample rows to calculate an evidence-based emergence percentage.",
    kind: "wizard",
    success: "Emergence samples recorded",
    steps: ["Rows", "Counts", "Save"],
  },
  "replant-gaps": {
    title: "Replant gaps within seven days",
    desc: "Create a focused gap-replant plan when emergence is below 80% so the crop stand remains even.",
    kind: "wizard",
    success: "Gap-replant action scheduled",
    steps: ["Gaps", "Seed", "Confirm"],
  },
  "performance-detail": {
    title: "Seed performance history",
    desc: "Compare germination, field emergence and final yield across past varieties before buying again.",
    kind: "detail",
    success: "Performance history reviewed",
  },
  "ai-recommendation": {
    title: "GrowMO AI seed recommendation",
    desc: "Use your own seasonal results to choose a variety with the best practical yield and return for the next crop.",
    kind: "detail",
    success: "AI recommendation reviewed",
  },
  "export-nursery": {
    title: "Export seed and nursery report",
    desc: "Prepare a clean seed-store, nursery, germination and readiness report for farm records or an advisor.",
    kind: "wizard",
    success: "Nursery report prepared",
    steps: ["Report", "Columns", "Export"],
  },
  "share-nursery-plan": {
    title: "Share nursery plan",
    desc: "Prepare a focused nursery plan for your farm team, extension officer or cooperative agronomist.",
    kind: "wizard",
    success: "Nursery plan prepared for sharing",
    steps: ["Plan", "Access", "Prepare"],
  },
};

type Props = {
  active: NurseryModalId;
  seed?: SeedStock | null;
  nursery?: NurseryRecord | null;
  purchase?: SeedlingPurchase | null;
  context?: string;
  onClose: () => void;
  onSaved: (action: Exclude<NurseryModalId, null>, message: string) => void;
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

function downloadNurseryReport() {
  const report = [
    "GROWMO SEED & NURSERY SUMMARY",
    `${NURSERY_CONTEXT.farm} · ${NURSERY_CONTEXT.county}`,
    "Cabbage Gloria F1 · NUR-2026-003 · 3,200 seedlings ready",
    "Germination: 85% · certified-seed threshold: 80%.",
    "Next transplant: 20 October 2026.",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([report], { type: "text/plain" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "marys-farm-seed-nursery-summary.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function NurseryModalHub({
  active,
  seed,
  nursery,
  purchase,
  context,
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
  const selectedName = seed
    ? `${seed.seed} · ${seed.variety}`
    : nursery
      ? `${nursery.id} · ${nursery.crop} ${nursery.variety}`
      : purchase
        ? `${purchase.nursery} · ${purchase.crop}`
        : (context ?? "Cabbage Gloria F1 nursery");
  const finish = () => {
    setBusy(true);
    window.setTimeout(
      () => {
        setBusy(false);
        onSaved(active, meta.success);
        onClose();
      },
      meta.kind === "payment" ? 760 : 400,
    );
  };
  const rows =
    active === "seed-detail"
      ? [
          ["Seed lot", selectedName],
          ["Lot / batch", seed?.lot ?? "SF-2026-06"],
          ["Germination", seed?.germination ?? "92% tested"],
          ["Storage", seed?.storage ?? "Cool, dry and airtight"],
          ["Expiry", seed?.expiry ?? "Dec 2027"],
        ]
      : active === "nursery-detail"
        ? [
            ["Nursery", selectedName],
            ["Seed lot", nursery?.seedLot ?? "SF-2026-06"],
            [
              "Seedlings",
              `${nursery?.ready.toLocaleString() ?? "3,200"} / ${nursery?.target.toLocaleString() ?? "3,500"}`,
            ],
            ["Location", nursery?.location ?? "Near house · partial shade"],
            ["Transplant target", nursery?.transplantDate ?? "20 Oct 2026"],
          ]
        : active === "purchase-detail"
          ? [
              ["Supplier", purchase?.nursery ?? "Githunguri Nurseries"],
              ["Planting material", purchase?.crop ?? "Tomato Kilele F1"],
              ["Quantity", purchase?.quantity ?? "2,000 seedlings"],
              ["Quality", purchase?.quality ?? "Healthy, 15 cm tall"],
              [
                "Source check",
                purchase?.verified
                  ? "KEPHIS certified"
                  : "Verification requested",
              ],
            ]
          : active === "ai-recommendation"
            ? [
                ["Recommended seed", "Cabbage Gloria F1"],
                ["Evidence", "Three seasons of farm results"],
                ["Expected yield", "14,500–15,200 heads/acre"],
                ["Alternative", "Copenhagen OP: 11,000 heads/acre"],
                [
                  "Decision",
                  "The KES 600 sachet premium is repaid by 3,000+ extra heads",
                ],
              ]
            : active === "emergence-detail"
              ? [
                  ["Crop", "H6213 maize · Plot 2"],
                  ["Sample average", "91% emergence"],
                  ["Benchmark", "Good: above 85%"],
                  ["Lowest sample", "Row 3: 86%"],
                  ["Action", "Thin to one seedling on 01 Nov"],
                ]
              : active === "readiness-detail"
                ? [
                    ["Overall", "READY TO TRANSPLANT"],
                    [
                      "Seedling stage",
                      "12 cm · five true leaves · sturdy stems",
                    ],
                    ["Hardening", "Three days completed"],
                    ["Field and weather", "Beds ready · light rain forecast"],
                    ["Labour", "Five workers confirmed"],
                  ]
                : active === "health-detail"
                  ? [
                      ["Today’s focus", context ?? "Leggy seedlings"],
                      [
                        "Check",
                        "Stem base, leaf colour, pests, drainage and spacing",
                      ],
                      [
                        "Safe response",
                        "Use labelled products and follow directions",
                      ],
                      [
                        "Prevention",
                        "Clean mix, airflow, balanced water and routine checks",
                      ],
                    ]
                  : active === "storage-guide"
                    ? [
                        [
                          "Vegetable seed",
                          "10–15°C · 30–40% humidity · airtight jar",
                        ],
                        [
                          "Maize / bean",
                          "10–15°C · below 40% humidity · hermetic bag",
                        ],
                        ["Potato tubers", "3–5°C · dark, ventilated storage"],
                        [
                          "Sweet potato vines",
                          "Keep moist in shade; plant within 48–72 hours",
                        ],
                      ]
                    : active === "germination-log"
                      ? [
                          ["Day 0", "Sown in 5 cm drills, 1 cm deep; watered"],
                          ["Day 7", "85% germination; above threshold"],
                          ["Day 14", "Two true leaves; light feed started"],
                          ["Day 28", "Hardening off in progress"],
                          ["Day 30", "Target transplant readiness check"],
                        ]
                      : active === "performance-detail"
                        ? [
                            [
                              "Gloria F1",
                              "85–88% germination; 14,500–15,200 heads/acre",
                            ],
                            [
                              "Copenhagen OP",
                              "75% germination; 11,000 heads/acre",
                            ],
                            [
                              "H6213 maize",
                              "91% field emergence; 22 bags/acre",
                            ],
                            [
                              "Kilele F1",
                              "18 tonnes/acre from purchased seedlings",
                            ],
                          ]
                        : active === "observation-detail"
                          ? [
                              [
                                "Observation",
                                context ?? "Day 28 hardening off",
                              ],
                              ["Nursery", "NUR-2026-003 · Cabbage Gloria F1"],
                              [
                                "Photo note",
                                "Dated nursery photo evidence is attached",
                              ],
                              [
                                "Next action",
                                "Review watering and readiness tomorrow",
                              ],
                            ]
                          : [
                              ["Selected record", selectedName],
                              [
                                "Farm",
                                `${NURSERY_CONTEXT.farm} · ${NURSERY_CONTEXT.ward}`,
                              ],
                              [
                                "Traceability",
                                "Lot, nursery activity and crop decision remain linked",
                              ],
                              [
                                "Care focus",
                                "Strong, healthy planting material for the field",
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
            <strong>Keep each seedling decision traceable</strong>
            <p className="mb-0 text-muted">
              Evidence from seed lot to field stand helps the next season begin
              stronger.
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
              if (
                active === "ai-recommendation" ||
                active === "performance-detail"
              )
                onSaved(active, meta.success);
              else {
                downloadNurseryReport();
                onSaved(active, "Nursery summary download prepared");
              }
              onClose();
            }}
          >
            <Download />{" "}
            {active === "ai-recommendation"
              ? "Use recommendation"
              : "Download summary"}
          </button>
        </div>
      </Dialog>
    );
  if (meta.kind === "confirm") {
    const destructive = active === "write-off-seed";
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
                ? "The reason stays in your traceability history."
                : "The nursery completion will remain visible in the crop timeline."}
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
              "Write off seed"
            ) : (
              "Confirm transplant"
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
            <small className="text-muted d-block">
              {purchase?.nursery ?? "Githunguri Nurseries"}
            </small>
            <strong>{purchase?.crop ?? "Tomato Kilele F1 seedlings"}</strong>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.5rem" }}
            >
              KES {(purchase?.total ?? 10000).toLocaleString()}
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
                Receipt GM-NUR-2026 will be linked to this planting-material
                purchase.
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
  const needsAlert =
    active === "flag-health-issue" || active === "replant-gaps";
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} onStep={setStep} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <Field label="Selected record">
              <select className="gm-select" defaultValue={selectedName}>
                <option>{selectedName}</option>
                <option>Cabbage Gloria F1 · NUR-2026-003</option>
                <option>Tomato Kilele F1 · NUR-2026-004</option>
                <option>H6213 maize · Plot 2</option>
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Date / reference">
              <input
                className="gm-input"
                defaultValue="20 Oct 2026 · GrowMO nursery record"
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label={needsAlert ? "Immediate action" : "Field note"}>
              <textarea
                className="gm-input"
                rows={3}
                defaultValue={
                  needsAlert
                    ? "Contain the issue, inspect the affected area and record the follow-up before close of day."
                    : "Use the crop-specific nursery plan and keep this activity connected to the seed lot."
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label={
                needsAlert ? "Notify the farm team" : "Keep a task reminder"
              }
              desc={
                needsAlert
                  ? "The nursery team will see the priority action in this local demo."
                  : "The next practical care step stays visible in the nursery timeline."
              }
            />
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-check-list mt-3">
          <div className="gm-check-row">
            <Sprout />
            <span>
              <strong>Planting-material check</strong>
              <small>
                Confirm certified lot, suitable condition and the right crop
                stage.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <Leaf />
            <span>
              <strong>Nursery care check</strong>
              <small>
                Maintain drainage, spacing, light and balanced watering.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <AlertTriangle />
            <span>
              <strong>Field readiness check</strong>
              <small>
                Make sure weather, field inputs and labour support the decision.
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
              Save the action in this crop’s seed-to-field traceability trail.
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
        finishLabel={
          active === "export-nursery" ? "Prepare report" : "Confirm & save"
        }
        nextDisabled={busy}
      />
    </Dialog>
  );
}
