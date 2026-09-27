/* ============================================================================
   PAGE 22 WORKFLOWS — cooperative governance, buying, sales and member care.
   ========================================================================== */
import {
  BadgeCheck,
  CheckCircle2,
  Download,
  FileText,
  HandCoins,
  LoaderCircle,
  Send,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CoopContract,
  CooperativeMember,
  InputLine,
} from "../../data/app/cooperative";
import { COOPERATIVE_PROFILE } from "../../data/app/cooperative";
import { kes } from "../../data/site";
import { Dialog, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

export type CooperativeModalId =
  | "registration-detail"
  | "edit-cooperative"
  | "verify-registration"
  | "manage-signatories"
  | "constitution"
  | "schedule-agm"
  | "add-member"
  | "member-profile"
  | "edit-member"
  | "suspend-member"
  | "share-transaction"
  | "member-statement"
  | "record-acreage"
  | "crop-forecast"
  | "submit-input-needs"
  | "review-input-aggregate"
  | "request-quotes"
  | "select-supplier"
  | "approve-input-order"
  | "place-bulk-order"
  | "record-delivery"
  | "collection-notice"
  | "pay-input-share"
  | "grade-produce"
  | "record-collective-sale"
  | "buyer-receipt"
  | "pay-member-payout"
  | "account-detail"
  | "transfer-funds"
  | "financial-report"
  | "audit-pack"
  | "new-contract"
  | "contract-detail"
  | "negotiation-note"
  | "review-contract"
  | "send-esignature"
  | "broadcast-sms"
  | "whatsapp-update"
  | "push-update"
  | "individual-sms"
  | "delivery-notice"
  | "export-register"
  | null;

type FlowKind = "wizard" | "confirm" | "detail" | "payment";
type FlowMeta = {
  title: string;
  desc: string;
  kind: FlowKind;
  success: string;
  steps?: string[];
};

const FLOWS: Record<Exclude<CooperativeModalId, null>, FlowMeta> = {
  "registration-detail": {
    title: "Cooperative registration record",
    desc: "The official identity, governance and payment records for Delion Farmers Cooperative Society Ltd.",
    kind: "detail",
    success: "Registration record reviewed",
  },
  "edit-cooperative": {
    title: "Update cooperative profile",
    desc: "Keep the address, crop focus, documents and collection centre accurate for every member.",
    kind: "wizard",
    success: "Cooperative profile updated",
    steps: ["Identity", "Operations", "Review"],
  },
  "verify-registration": {
    title: "Verify registration",
    desc: "Confirm the cooperative registration reference before presenting the group to partners.",
    kind: "wizard",
    success: "Registration verification submitted",
    steps: ["Reference", "Evidence", "Submit"],
  },
  "manage-signatories": {
    title: "Manage account signatories",
    desc: "Maintain the board members who can approve cooperative banking and M-Pesa actions.",
    kind: "wizard",
    success: "Signatory instructions saved",
    steps: ["Signatories", "Mandate", "Confirm"],
  },
  constitution: {
    title: "Constitution & governance",
    desc: "Review the current constitution, AGM commitment and member voting rules.",
    kind: "detail",
    success: "Governance record reviewed",
  },
  "schedule-agm": {
    title: "Schedule annual general meeting",
    desc: "Prepare a clear notice, agenda and reminders for every registered member.",
    kind: "wizard",
    success: "AGM notice scheduled",
    steps: ["Meeting", "Agenda", "Notify"],
  },
  "add-member": {
    title: "Add cooperative member",
    desc: "Capture a verified grower, farm record and first share contribution.",
    kind: "wizard",
    success: "Member added to the cooperative",
    steps: ["Identity", "Farm", "Shares"],
  },
  "member-profile": {
    title: "Member profile",
    desc: "View the grower profile, farm acreage, crops, shares and cooperative activity.",
    kind: "detail",
    success: "Member profile reviewed",
  },
  "edit-member": {
    title: "Edit member record",
    desc: "Update a member's contact, farm location, crop plan or payment preference.",
    kind: "wizard",
    success: "Member record updated",
    steps: ["Profile", "Farm", "Save"],
  },
  "suspend-member": {
    title: "Suspend this member?",
    desc: "Suspension pauses voting, payouts and new input credit while retaining the auditable member record.",
    kind: "confirm",
    success: "Member status updated",
  },
  "share-transaction": {
    title: "Record share contribution",
    desc: "Add a member share purchase, dividend credit or approved share transfer.",
    kind: "wizard",
    success: "Share transaction recorded",
    steps: ["Transaction", "M-Pesa", "Receipt"],
  },
  "member-statement": {
    title: "Prepare member statement",
    desc: "Create a clear record of shares, acreage, input credit and pooled-sale proceeds.",
    kind: "detail",
    success: "Member statement prepared",
  },
  "record-acreage": {
    title: "Update collective acreage",
    desc: "Record crop acreage from member farm plans before production and market planning.",
    kind: "wizard",
    success: "Collective acreage updated",
    steps: ["Crop", "Members", "Confirm"],
  },
  "crop-forecast": {
    title: "Create crop forecast",
    desc: "Set a realistic pooled yield and market-value forecast for the buyer pipeline.",
    kind: "wizard",
    success: "Crop forecast updated",
    steps: ["Yield", "Price", "Review"],
  },
  "submit-input-needs": {
    title: "Collect member input needs",
    desc: "Open a buying round for members to request fertilizer, seed and crop protection products.",
    kind: "wizard",
    success: "Input needs round opened",
    steps: ["Inputs", "Deadline", "Notify"],
  },
  "review-input-aggregate": {
    title: "Review aggregated input order",
    desc: "See quantities, price savings and member commitments before quote selection.",
    kind: "detail",
    success: "Input aggregate reviewed",
  },
  "request-quotes": {
    title: "Request supplier quotes",
    desc: "Invite verified suppliers to price the exact pooled quantities with delivery terms.",
    kind: "wizard",
    success: "Quote requests sent",
    steps: ["Suppliers", "Quantity", "Send"],
  },
  "select-supplier": {
    title: "Select supplier quote",
    desc: "Compare quality, delivery and collective savings before board approval.",
    kind: "wizard",
    success: "Preferred supplier selected",
    steps: ["Compare", "Rationale", "Confirm"],
  },
  "approve-input-order": {
    title: "Approve bulk input order?",
    desc: "Chairperson and treasurer approval will lock the selected supplier and payable total.",
    kind: "confirm",
    success: "Bulk input order approved",
  },
  "place-bulk-order": {
    title: "Place bulk supplier order",
    desc: "Issue the approved purchase order with delivery location and cooperative reference.",
    kind: "wizard",
    success: "Supplier purchase order issued",
    steps: ["Order", "Delivery", "Issue"],
  },
  "record-delivery": {
    title: "Record supplier delivery",
    desc: "Confirm received bags, seeds and crop protection before making stock available to members.",
    kind: "wizard",
    success: "Delivery recorded in collection stock",
    steps: ["Delivery", "Quality", "Confirm"],
  },
  "collection-notice": {
    title: "Send collection notice",
    desc: "Tell committed members when their paid input share is ready at the collection point.",
    kind: "wizard",
    success: "Collection notice sent",
    steps: ["Members", "Collection", "Send"],
  },
  "pay-input-share": {
    title: "Pay input share by M-Pesa",
    desc: "Record a member's secure M-Pesa payment before input collection is released.",
    kind: "payment",
    success: "M-Pesa input payment recorded",
  },
  "grade-produce": {
    title: "Record quality & grading",
    desc: "Capture each member's delivered crop by grade at the cooperative collection centre.",
    kind: "wizard",
    success: "Grading record saved",
    steps: ["Member", "Grades", "Receipt"],
  },
  "record-collective-sale": {
    title: "Record collective sale",
    desc: "Close the buyer sale with volume, quality, transport and proceeds allocated to the pool.",
    kind: "wizard",
    success: "Collective sale recorded",
    steps: ["Buyer", "Delivery", "Settlement"],
  },
  "buyer-receipt": {
    title: "Buyer sale receipt",
    desc: "Review the pooled-sale receipt before cash is released to member payout accounts.",
    kind: "detail",
    success: "Buyer receipt reviewed",
  },
  "pay-member-payout": {
    title: "Pay member sale proceeds",
    desc: "Confirm a protected M-Pesa payout after the contribution, grade and sale receipt are checked.",
    kind: "payment",
    success: "Member M-Pesa payout recorded",
  },
  "account-detail": {
    title: "Cooperative account detail",
    desc: "Review the protected account purpose, authority rules and latest balance.",
    kind: "detail",
    success: "Account detail reviewed",
  },
  "transfer-funds": {
    title: "Transfer cooperative funds",
    desc: "Move approved money between protected cooperative accounts using two-signatory authority.",
    kind: "payment",
    success: "Internal funds transfer recorded",
  },
  "financial-report": {
    title: "Prepare financial report",
    desc: "Generate an income, expenditure, balance-sheet or member-statement report for review.",
    kind: "wizard",
    success: "Financial report prepared",
    steps: ["Report", "Period", "Prepare"],
  },
  "audit-pack": {
    title: "Prepare annual audit pack",
    desc: "Collect the ledgers, approvals, bank records and member register for an independent audit.",
    kind: "wizard",
    success: "Audit pack prepared",
    steps: ["Scope", "Documents", "Share"],
  },
  "new-contract": {
    title: "Create cooperative contract",
    desc: "Build a buyer or supplier agreement with crop, value, member allocation and quality terms.",
    kind: "wizard",
    success: "Contract draft created",
    steps: ["Partner", "Terms", "Review"],
  },
  "contract-detail": {
    title: "Cooperative contract detail",
    desc: "Review the partner terms, crop allocation, participating members and governance history.",
    kind: "detail",
    success: "Contract detail reviewed",
  },
  "negotiation-note": {
    title: "Add negotiation note",
    desc: "Preserve a clear, dated board note while contract terms are under discussion.",
    kind: "wizard",
    success: "Negotiation note saved",
    steps: ["Note", "Visibility", "Save"],
  },
  "review-contract": {
    title: "Board contract review",
    desc: "Send the draft agreement through the cooperative review and approval path.",
    kind: "wizard",
    success: "Contract sent for board review",
    steps: ["Reviewers", "Terms", "Send"],
  },
  "send-esignature": {
    title: "Send for e-signature",
    desc: "Invite the partner and authorised cooperative signatories to approve the agreement securely.",
    kind: "wizard",
    success: "E-signature request sent",
    steps: ["Signers", "Message", "Send"],
  },
  "broadcast-sms": {
    title: "Broadcast SMS",
    desc: "Send an important cooperative update to all members with a delivery record.",
    kind: "wizard",
    success: "SMS broadcast sent",
    steps: ["Audience", "Message", "Send"],
  },
  "whatsapp-update": {
    title: "WhatsApp group update",
    desc: "Prepare a practical crop-cluster message with a clear action for members.",
    kind: "wizard",
    success: "WhatsApp update posted",
    steps: ["Group", "Message", "Post"],
  },
  "push-update": {
    title: "Send push notification",
    desc: "Notify selected members in GrowMO without charging their SMS balance.",
    kind: "wizard",
    success: "Push notification sent",
    steps: ["Audience", "Message", "Send"],
  },
  "individual-sms": {
    title: "Send individual SMS",
    desc: "Send a personal payment, verification or collection message to one member.",
    kind: "wizard",
    success: "Individual SMS sent",
    steps: ["Member", "Message", "Send"],
  },
  "delivery-notice": {
    title: "Send delivery & collection notice",
    desc: "Share the collection point, timing and payment status for a cooperative order.",
    kind: "wizard",
    success: "Collection notice scheduled",
    steps: ["Order", "Timing", "Notify"],
  },
  "export-register": {
    title: "Export cooperative register",
    desc: "Prepare a clean member, crop, finance or contract report for authorised review.",
    kind: "wizard",
    success: "Cooperative register exported",
    steps: ["Register", "Columns", "Export"],
  },
};

type Props = {
  active: CooperativeModalId;
  member?: CooperativeMember | null;
  contract?: CoopContract | null;
  inputLine?: InputLine | null;
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

function downloadRegister() {
  const text = [
    "DELION FARMERS COOPERATIVE SOCIETY LTD",
    `Registration: ${COOPERATIVE_PROFILE.registration}`,
    "Member register summary: 45 members · 120 acres",
    "Prepared through GrowMO Cooperative Management",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "delion-cooperative-register.txt";
  link.click();
  URL.revokeObjectURL(url);
}

export function CooperativeModalHub({
  active,
  member,
  contract,
  inputLine,
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
  if (!meta || !active) return null;

  const finish = () => {
    setBusy(true);
    window.setTimeout(
      () => {
        setBusy(false);
        onSaved(meta.success);
        onClose();
      },
      meta.kind === "payment" ? 760 : 360,
    );
  };
  const recordName =
    member?.name ??
    contract?.contract ??
    inputLine?.input ??
    "Delion Farmers Cooperative";
  const detailRows =
    active === "registration-detail"
      ? [
          ["Registration", COOPERATIVE_PROFILE.registration],
          [
            "Location",
            `${COOPERATIVE_PROFILE.office}, ${COOPERATIVE_PROFILE.county}`,
          ],
          [
            "Type & crops",
            `${COOPERATIVE_PROFILE.type} · ${COOPERATIVE_PROFILE.crops}`,
          ],
          [
            "Members & acreage",
            `${COOPERATIVE_PROFILE.members} members · ${COOPERATIVE_PROFILE.acreage} acres`,
          ],
          ["Bank", COOPERATIVE_PROFILE.bank],
          ["M-Pesa Paybill", COOPERATIVE_PROFILE.paybill],
          ["Logo record", COOPERATIVE_PROFILE.logo],
          ["Constitution", COOPERATIVE_PROFILE.constitution],
          ["AGM due", COOPERATIVE_PROFILE.annualMeeting],
        ]
      : active === "buyer-receipt"
        ? [
            ["Buyer", "Fresh Produce Kenya Ltd"],
            ["Crop", "Cabbage Gloria F1 · Grade A"],
            ["Pooled delivery", "47,500 heads"],
            ["Receipt value", kes(1437500)],
            ["Settlement", "M-Pesa to cooperative paybill"],
          ]
        : active === "constitution"
          ? [
              ["Constitution", COOPERATIVE_PROFILE.constitution],
              ["Membership", "45 registered growers"],
              ["Voting", "One active member, one vote"],
              ["AGM", COOPERATIVE_PROFILE.annualMeeting],
              ["Signatories", "Chairperson, secretary, treasurer"],
            ]
          : [
              ["Selected record", recordName],
              ["Authority", "Delion Farmers Cooperative Society Ltd"],
              ["County", "Kiambu · Githunguri"],
              ["Payment rail", "KCB and M-Pesa Paybill 522901"],
            ];

  if (meta.kind === "detail") {
    const canDownload =
      active === "member-statement" || active === "export-register";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
        <div className="gm-check-list">
          {detailRows.map(([label, value]) => (
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
            <strong>Auditable cooperative record</strong>
            <p className="mb-0 text-muted">
              Every approval, payment and membership change is kept in the
              shared group timeline.
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
          {canDownload ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                downloadRegister();
                onSaved("Document download prepared");
                onClose();
              }}
            >
              <Download /> Download record
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }

  if (meta.kind === "confirm") {
    const destructive = active === "suspend-member";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-check-row">
          <span className="gm-mega-icon">
            {destructive ? <Trash2 /> : <CheckCircle2 />}
          </span>
          <span>
            <strong>{recordName}</strong>
            <small>
              {destructive
                ? "The member and their historical shares remain in the protected register."
                : "This action needs an auditable approval record."}
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
              "Confirm suspension"
            ) : (
              "Approve order"
            )}
          </button>
        </div>
      </Dialog>
    );
  }

  if (meta.kind === "payment") {
    const isPayout = active === "pay-member-payout";
    const amount = isPayout
      ? (member?.balance ?? 92500)
      : active === "pay-input-share"
        ? 12400
        : 150000;
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <HandCoins />
          </span>
          <div style={{ flex: 1 }}>
            <small className="text-muted d-block">
              {isPayout ? "Member payout" : "Amount to confirm"}
            </small>
            <strong>
              {member?.name ?? (isPayout ? "David Mwangi" : "Bulk input order")}
            </strong>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.5rem" }}
            >
              {kes(amount)}
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
                Receipt GM-COOP-2027 will be added to the cooperative financial
                record.
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

  const steps = meta.steps ?? [];
  const isMessage = [
    "broadcast-sms",
    "whatsapp-update",
    "push-update",
    "individual-sms",
    "delivery-notice",
    "collection-notice",
  ].includes(active);
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} onStep={setStep} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <Field label={isMessage ? "Audience" : "Cooperative record"}>
              <select
                className="gm-select"
                defaultValue={member?.name ?? recordName}
              >
                <option>{member?.name ?? recordName}</option>
                <option>All active members · 43</option>
                <option>Cabbage cluster · 18 members</option>
                <option>Board signatories · 3</option>
              </select>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label={isMessage ? "Channel" : "Reference"}>
              <input
                className="gm-input"
                defaultValue={
                  isMessage
                    ? "GrowMO verified cooperative update"
                    : COOPERATIVE_PROFILE.registration
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Field label={isMessage ? "Message" : "Notes"}>
              <textarea
                className="gm-input"
                rows={3}
                defaultValue={
                  isMessage
                    ? "Hujambo mwanachama. Please check the cooperative update and act before the stated deadline."
                    : "Recorded for Delion Farmers Cooperative Society Ltd with the required board authority."
                }
              />
            </Field>
          </div>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label={
                isMessage
                  ? "Keep a delivery record"
                  : "Notify authorised members"
              }
              desc={
                isMessage
                  ? "Show sent, delivered and scheduled status in communication history."
                  : "A GrowMO notification will be recorded for the selected action."
              }
            />
          </div>
        </div>
      ) : step === 1 ? (
        <div className="gm-check-list mt-3">
          <div className="gm-check-row">
            <UsersRound />
            <span>
              <strong>Member and board checks</strong>
              <small>
                Relevant participants, member allocation and signatory authority
                will be retained in this record.
              </small>
            </span>
          </div>
          <div className="gm-check-row">
            <FileText />
            <span>
              <strong>Kenyan cooperative documentation</strong>
              <small>
                Reference the Githunguri collection point, KCB account and
                M-Pesa Paybill 522901 where applicable.
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
            <strong>Ready for confirmation</strong>
            <p className="mb-0 text-muted">
              Review this cooperative workflow before GrowMO records the action
              and notifies the selected people.
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
        finishLabel={isMessage ? "Send update" : "Confirm & save"}
        nextDisabled={busy}
      />
    </Dialog>
  );
}
