/* ============================================================================
   PAGE 21 WORKFLOWS — portfolio publishing, buyer negotiation and orders.
   ========================================================================== */
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  HandCoins,
  ImagePlus,
  LoaderCircle,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  Buyer,
  FarmOrder,
  Inquiry,
  Portfolio,
} from "../../data/app/orders";
import { kes } from "../../data/site";
import { Dialog, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

export type OrdersModalId =
  | "build-portfolio"
  | "edit-portfolio"
  | "publish-portfolio"
  | "archive-portfolio"
  | "share-link"
  | "qr-link"
  | "link-settings"
  | "buyer-preview"
  | "new-inquiry"
  | "buyer-profile"
  | "accept-offer"
  | "counter-offer"
  | "modify-quantity"
  | "modify-date"
  | "modify-delivery"
  | "decline-offer"
  | "message-buyer"
  | "thread-history"
  | "create-order"
  | "collect-deposit"
  | "confirm-payment"
  | "schedule-delivery"
  | "cancel-order"
  | "generate-contract"
  | "contract-detail"
  | "send-esign"
  | "download-contract"
  | "add-buyer"
  | "edit-buyer"
  | "buyer-note"
  | "rate-buyer"
  | "export-orders"
  | "photo-detail"
  | "gaps-evidence"
  | null;

type FlowKind = "wizard" | "confirm" | "detail" | "payment";
type Meta = {
  title: string;
  desc: string;
  kind: FlowKind;
  success: string;
  steps?: string[];
};

const FLOWS: Record<Exclude<OrdersModalId, null>, Meta> = {
  "build-portfolio": {
    title: "Build crop portfolio",
    desc: "Turn field records into a buyer-ready crop page before you start selling.",
    kind: "wizard",
    success: "Draft portfolio created",
    steps: ["Crop", "Supply", "Publish"],
  },
  "edit-portfolio": {
    title: "Edit crop portfolio",
    desc: "Keep crop detail, availability and evidence accurate for buyers.",
    kind: "wizard",
    success: "Portfolio updated",
    steps: ["Crop detail", "Availability", "Review"],
  },
  "publish-portfolio": {
    title: "Publish crop portfolio",
    desc: "Confirm the share settings before your portfolio becomes visible to buyers.",
    kind: "wizard",
    success: "Portfolio is live for buyers",
    steps: ["Review", "Privacy", "Publish"],
  },
  "archive-portfolio": {
    title: "Archive this portfolio?",
    desc: "It will disappear from buyer search but history and orders remain in the farm record.",
    kind: "confirm",
    success: "Portfolio archived",
  },
  "share-link": {
    title: "Share buyer portfolio",
    desc: "Send the live crop page with the harvest window, availability and traceability signal.",
    kind: "detail",
    success: "Portfolio link copied",
  },
  "qr-link": {
    title: "Portfolio QR code",
    desc: "Use this code on a crate label, poster or printed crop offer.",
    kind: "detail",
    success: "QR code prepared",
  },
  "link-settings": {
    title: "Link privacy & expiry",
    desc: "Control who can view this portfolio and when it stops accepting buyer inquiries.",
    kind: "wizard",
    success: "Link settings saved",
    steps: ["Access", "Expiry", "Save"],
  },
  "buyer-preview": {
    title: "Buyer-facing preview",
    desc: "This is the buyer experience: crop facts, evidence, price and inquiry path without exposing your phone.",
    kind: "detail",
    success: "Buyer preview checked",
  },
  "new-inquiry": {
    title: "Create buyer inquiry",
    desc: "Capture an offline or WhatsApp buyer inquiry in the same negotiation workspace.",
    kind: "wizard",
    success: "Inquiry added to negotiations",
    steps: ["Buyer", "Offer", "Confirm"],
  },
  "buyer-profile": {
    title: "Buyer profile",
    desc: "Review their order pattern, verification and payment history before accepting terms.",
    kind: "detail",
    success: "Buyer profile reviewed",
  },
  "accept-offer": {
    title: "Accept this offer?",
    desc: "Acceptance creates a confirmed order and reserves the stock allocation.",
    kind: "confirm",
    success: "Offer accepted and order confirmed",
  },
  "counter-offer": {
    title: "Send counter-offer",
    desc: "Propose a fair price, quantity and delivery plan without losing the chat context.",
    kind: "wizard",
    success: "Counter-offer sent to buyer",
    steps: ["Offer", "Terms", "Send"],
  },
  "modify-quantity": {
    title: "Modify quantity",
    desc: "Protect your available stock while keeping a strong buyer conversation.",
    kind: "wizard",
    success: "Quantity option sent",
    steps: ["Allocation", "Grade mix", "Send"],
  },
  "modify-date": {
    title: "Modify delivery date",
    desc: "Offer a harvest-ready date and explain the field constraint clearly.",
    kind: "wizard",
    success: "New delivery date sent",
    steps: ["Date", "Reason", "Send"],
  },
  "modify-delivery": {
    title: "Modify delivery terms",
    desc: "Set a practical route, delivery fee and handover time for both sides.",
    kind: "wizard",
    success: "Delivery terms sent",
    steps: ["Route", "Fee", "Send"],
  },
  "decline-offer": {
    title: "Decline this inquiry?",
    desc: "The buyer will be told politely and your crop availability will stay unchanged.",
    kind: "confirm",
    success: "Inquiry declined",
  },
  "message-buyer": {
    title: "Message buyer",
    desc: "Send a clear note in the protected GrowMO negotiation thread.",
    kind: "wizard",
    success: "Message sent",
    steps: ["Message", "Review", "Send"],
  },
  "thread-history": {
    title: "Negotiation history",
    desc: "A dated record of every proposal, counter-offer and agreement.",
    kind: "detail",
    success: "Negotiation history reviewed",
  },
  "create-order": {
    title: "Create sales order",
    desc: "Record an agreed buyer order and reserve crop availability straight away.",
    kind: "wizard",
    success: "Order created",
    steps: ["Buyer", "Order", "Confirm"],
  },
  "collect-deposit": {
    title: "Collect deposit by M-Pesa",
    desc: "Confirm the deposit amount using the secure demo farm PIN pad.",
    kind: "payment",
    success: "M-Pesa deposit recorded",
  },
  "confirm-payment": {
    title: "Confirm final payment",
    desc: "Record the M-Pesa confirmation only after delivery is checked and accepted.",
    kind: "payment",
    success: "Final M-Pesa payment recorded",
  },
  "schedule-delivery": {
    title: "Schedule delivery",
    desc: "Set pickup, delivery time, vehicle and crate count in the order timeline.",
    kind: "wizard",
    success: "Delivery plan saved",
    steps: ["Route", "Handover", "Confirm"],
  },
  "cancel-order": {
    title: "Cancel this order?",
    desc: "This releases reserved crop stock. A cancellation note stays in the buyer history.",
    kind: "confirm",
    success: "Order cancelled and stock released",
  },
  "generate-contract": {
    title: "Generate supply agreement",
    desc: "Prepare the weekly cabbage agreement from the confirmed buyer terms.",
    kind: "wizard",
    success: "Supply agreement generated",
    steps: ["Terms", "Quality", "Generate"],
  },
  "contract-detail": {
    title: "GrowMO supply agreement",
    desc: "A clear contract summary ready for both the farmer and buyer to review.",
    kind: "detail",
    success: "Contract reviewed",
  },
  "send-esign": {
    title: "Send for e-signature",
    desc: "Invite the buyer to approve the supply agreement through their verified GrowMO contact.",
    kind: "wizard",
    success: "E-signature request sent",
    steps: ["Recipients", "Message", "Send"],
  },
  "download-contract": {
    title: "Download contract",
    desc: "Prepare the signed agreement as a printable farm document.",
    kind: "detail",
    success: "Contract download prepared",
  },
  "add-buyer": {
    title: "Add buyer to CRM",
    desc: "Keep buyer contacts, locations and payment notes with your crop pipeline.",
    kind: "wizard",
    success: "Buyer added to CRM",
    steps: ["Contact", "Business", "Confirm"],
  },
  "edit-buyer": {
    title: "Edit buyer record",
    desc: "Update a buyer contact or relationship note without losing their order history.",
    kind: "wizard",
    success: "Buyer record updated",
    steps: ["Contact", "Notes", "Save"],
  },
  "buyer-note": {
    title: "Add buyer note",
    desc: "Save a practical reminder for the next negotiation or collection day.",
    kind: "wizard",
    success: "Buyer note saved",
    steps: ["Note", "Visibility", "Save"],
  },
  "rate-buyer": {
    title: "Rate this buyer",
    desc: "Your private farm rating helps you make the next payment and delivery decision.",
    kind: "wizard",
    success: "Buyer rating saved",
    steps: ["Rating", "Payment note", "Save"],
  },
  "export-orders": {
    title: "Export orders & buyers",
    desc: "Prepare a clean sales report for accounting, cooperative records or a lender.",
    kind: "wizard",
    success: "Order report prepared",
    steps: ["Report", "Columns", "Export"],
  },
  "photo-detail": {
    title: "Portfolio evidence",
    desc: "A buyer-facing visual record tied to the crop portfolio timeline.",
    kind: "detail",
    success: "Portfolio photo reviewed",
  },
  "gaps-evidence": {
    title: "GAP evidence pack",
    desc: "Review the evidence backing every good agricultural practice on the public portfolio.",
    kind: "detail",
    success: "GAP evidence pack reviewed",
  },
};

type Props = {
  active: OrdersModalId;
  portfolio?: Portfolio | null;
  inquiry?: Inquiry | null;
  order?: FarmOrder | null;
  buyer?: Buyer | null;
  onClose: () => void;
  onSaved: (message: string) => void;
};

function downloadContract() {
  const content = [
    "GROWMO SUPPLY AGREEMENT",
    "Seller: Mary Wanjiku, Delion Farm, Kiambu",
    "Buyer: Fresh Produce Kenya Ltd",
    "Crop: Cabbage Gloria F1, Grade A",
    "Quantity: 2,000 heads per week for 8 weeks",
    "Price: KES 34/head, KES 544,000 total contract value",
    "Delivery: Warehouse 4, Mombasa Rd, Monday by 10 AM",
    "Payment: M-Pesa on delivery",
  ].join("\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "growmo-supply-agreement-CON-2027-001.txt";
  link.click();
  URL.revokeObjectURL(url);
}

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

function DetailList({
  portfolio,
  inquiry,
  order,
  buyer,
}: Pick<Props, "portfolio" | "inquiry" | "order" | "buyer">) {
  const rows = inquiry
    ? [
        ["Buyer", `${inquiry.buyer} · ${inquiry.company}`],
        [
          "Offer",
          `${inquiry.quantity.toLocaleString()} ${inquiry.unit} · ${inquiry.grade}`,
        ],
        ["Proposed price", `${kes(inquiry.proposedPrice)} each`],
        ["Delivery", inquiry.delivery],
        ["Payment", inquiry.payment],
        ["Buyer message", inquiry.note],
      ]
    : order
      ? [
          ["Buyer", order.buyer],
          [
            "Crop allocation",
            `${order.quantity.toLocaleString()} ${order.unit} · ${order.crop}`,
          ],
          ["Order total", kes(order.total)],
          ["Delivery", `${order.deliveryDate} · ${order.delivery}`],
          ["Payment", order.paymentDetail],
          ["Status", order.status],
        ]
      : buyer
        ? [
            ["Company", buyer.company],
            ["Contact", `${buyer.phone} · ${buyer.email}`],
            ["Location", buyer.location],
            [
              "Order history",
              `${buyer.orders} orders · ${kes(buyer.totalSpent)}`,
            ],
            ["Payment history", buyer.paymentHistory],
            ["Farm note", buyer.notes],
          ]
        : portfolio
          ? [
              ["Crop", `${portfolio.crop} · ${portfolio.variety}`],
              ["Harvest window", portfolio.harvest],
              [
                "Available",
                `${portfolio.available.toLocaleString()} ${portfolio.unit}`,
              ],
              ["Grade A", `${portfolio.gradeA}% expected`],
              ["Price", `${kes(portfolio.price)} per unit`],
              ["Portfolio state", portfolio.state],
            ]
          : [
              ["Portfolio", "Cabbage · Gloria F1"],
              ["Access", "Buyer-ready"],
            ];
  return (
    <div className="gm-check-list">
      {rows.map(([label, value]) => (
        <div className="gm-check-row" key={label}>
          <span style={{ flex: 1 }}>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

export function OrdersModalHub({
  active,
  portfolio,
  inquiry,
  order,
  buyer,
  onClose,
  onSaved,
}: Props) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
  const [openLink, setOpenLink] = useState(true);
  const [notify, setNotify] = useState(true);
  const meta = active ? FLOWS[active] : null;
  useEffect(() => {
    if (active) {
      setStep(0);
      setBusy(false);
      setPaid(false);
      setOpenLink(true);
      setNotify(true);
    }
  }, [active]);
  if (!active || !meta) return null;
  const finish = () => {
    setBusy(true);
    window.setTimeout(
      () => {
        setBusy(false);
        onSaved(meta.success);
        onClose();
      },
      meta.kind === "payment" ? 700 : 360,
    );
  };
  if (meta.kind === "detail") {
    const share = active === "share-link";
    const contract =
      active === "contract-detail" || active === "download-contract";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
        {share ? (
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon">
              <Share2 />
            </span>
            <div style={{ flex: 1 }}>
              <span className="gm-eyebrow">Live portfolio link</span>
              <h3 className="font-display mb-1">
                growmo.co.ke/farm/delion-farm/cabbage-2027-001
              </h3>
              <p className="mb-0 text-muted">
                Auto-updates with crop status, availability and evidence. Link
                expires 30 days after harvest.
              </p>
            </div>
            <StatusChip label="Live" tone="low" />
          </div>
        ) : contract ? (
          <div className="gm-check-list">
            <div className="gm-check-row">
              <FileText />
              <span>
                <strong>
                  Fresh Produce Kenya Ltd · weekly cabbage agreement
                </strong>
                <small>
                  2,000 Grade A heads per week · 18 Jan–11 Mar 2027 · KES
                  544,000 total value.
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>Quality & handover</strong>
                <small>
                  Grade A 1.5–2.5 kg, PHI clear; delivery every Monday before 10
                  AM at Warehouse 4, Mombasa Rd.
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <HandCoins />
              <span>
                <strong>Payment and dispute terms</strong>
                <small>
                  M-Pesa on delivery. Quality disputes must be reported within
                  four hours with photos.
                </small>
              </span>
            </div>
          </div>
        ) : active === "qr-link" ? (
          <div className="text-center">
            <div className="gm-qr mx-auto">
              <QrCode />
            </div>
            <p className="mt-3 mb-0 text-muted">
              Scan to open Delion Farm&apos;s live Gloria F1 cabbage portfolio.
            </p>
          </div>
        ) : (
          <DetailList
            portfolio={portfolio}
            inquiry={inquiry}
            order={order}
            buyer={buyer}
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
          {share ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(
                    "https://growmo.co.ke/farm/delion-farm/cabbage-2027-001",
                  );
                } catch {
                  /* Clipboard support is optional in a local preview. */
                }
                onSaved("Portfolio link copied for sharing");
                onClose();
              }}
            >
              <Share2 /> Copy link
            </button>
          ) : null}
          {active === "buyer-preview" ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                onSaved("Buyer preview is ready to share");
                onClose();
              }}
            >
              Open buyer order form
            </button>
          ) : null}
          {active === "download-contract" ? (
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                downloadContract();
                onSaved("Contract download prepared");
                onClose();
              }}
            >
              <Download /> Download agreement
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }
  if (meta.kind === "confirm") {
    const danger =
      active === "archive-portfolio" ||
      active === "cancel-order" ||
      active === "decline-offer";
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-check-row">
          <span className="gm-mega-icon">
            {danger ? <Trash2 /> : <ClipboardCheck />}
          </span>
          <span>
            <strong>
              {portfolio?.crop ??
                inquiry?.buyer ??
                order?.id ??
                "Selected record"}
            </strong>
            <small>
              {danger
                ? "This decision stays in the farm timeline for a clear buyer history."
                : "Your confirmed allocation and buyer timeline will update immediately."}
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
            disabled={busy}
            className={
              danger ? "gm-btn gm-btn-danger-soft" : "gm-btn gm-btn-lime"
            }
            onClick={finish}
          >
            {busy ? (
              <LoaderCircle className="gm-spinner" />
            ) : danger ? (
              "Confirm action"
            ) : (
              "Accept offer"
            )}
          </button>
        </div>
      </Dialog>
    );
  }
  if (meta.kind === "payment") {
    const amount =
      active === "collect-deposit"
        ? Math.round((order?.total ?? 105000) / 2)
        : (order?.total ?? 68000);
    return (
      <Dialog open onClose={onClose} title={meta.title} desc={meta.desc}>
        <div className="gm-plan-detail-hero">
          <span className="gm-mega-icon">
            <HandCoins />
          </span>
          <div style={{ flex: 1 }}>
            <small className="text-muted d-block">
              {active === "collect-deposit"
                ? "Deposit to collect"
                : "Amount to confirm"}
            </small>
            <strong>{order?.buyer ?? "Fresh Produce Kenya Ltd"}</strong>
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
                Receipt GM-ORDER-2027 will be attached to this buyer order.
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
              onClick={finish}
            >
              Save payment
            </button>
          ) : null}
        </div>
      </Dialog>
    );
  }
  const steps = meta.steps ?? [];
  const portfolioFlow =
    active === "build-portfolio" ||
    active === "edit-portfolio" ||
    active === "publish-portfolio";
  const negotiation = [
    "counter-offer",
    "modify-quantity",
    "modify-date",
    "modify-delivery",
    "message-buyer",
  ].includes(active);
  return (
    <Dialog open onClose={onClose} title={meta.title} desc={meta.desc} wide>
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="row g-3 mt-1">
          <Field
            label={
              portfolioFlow
                ? "Crop portfolio"
                : negotiation
                  ? "Buyer"
                  : active === "add-buyer"
                    ? "Buyer name"
                    : active === "schedule-delivery"
                      ? "Order"
                      : "Buyer / crop"
            }
          >
            <select
              className="gm-select"
              defaultValue={
                portfolio?.crop ??
                inquiry?.buyer ??
                buyer?.name ??
                "Cabbage · Gloria F1"
              }
            >
              <option>
                {portfolio?.crop ??
                  inquiry?.buyer ??
                  buyer?.name ??
                  "Cabbage · Gloria F1"}
              </option>
              <option>Fresh Produce Kenya Ltd</option>
              <option>Karen Greens Restaurant</option>
              <option>Kale · Sukuma Wiki</option>
            </select>
          </Field>
          <Field
            label={
              portfolioFlow
                ? "Harvest window"
                : negotiation
                  ? "Your proposed price (KES)"
                  : active === "add-buyer"
                    ? "Kenyan phone"
                    : "Quantity / date"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                portfolioFlow
                  ? (portfolio?.harvest ?? "15–22 Jan 2027")
                  : negotiation
                    ? String(inquiry?.proposedPrice ?? 34)
                    : active === "add-buyer"
                      ? "0712 000 000"
                      : `${inquiry?.quantity ?? order?.quantity ?? 2000}`
              }
            />
          </Field>
          <Field
            label={
              portfolioFlow
                ? "Available quantity"
                : negotiation
                  ? "Grade / allocation"
                  : active === "add-buyer"
                    ? "Company"
                    : "Delivery / location"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                portfolioFlow
                  ? `${portfolio?.available ?? 11500} heads`
                  : negotiation
                    ? (inquiry?.grade ?? "Grade A cabbage")
                    : active === "add-buyer"
                      ? "Buyer business name"
                      : (inquiry?.delivery ??
                        order?.delivery ??
                        "Deliver · Nairobi")
              }
            />
          </Field>
          <Field
            label={
              portfolioFlow
                ? "Portfolio visibility"
                : negotiation
                  ? "Buyer message"
                  : active === "add-buyer"
                    ? "County / town"
                    : "Payment terms"
            }
          >
            <select
              className="gm-select"
              defaultValue={
                portfolioFlow
                  ? "Live to verified buyers"
                  : negotiation
                    ? "Counter-offer with delivery terms"
                    : active === "add-buyer"
                      ? "Kiambu"
                      : (order?.payment ?? "M-Pesa on delivery")
              }
            >
              <option>
                {portfolioFlow
                  ? "Live to verified buyers"
                  : negotiation
                    ? "Counter-offer with delivery terms"
                    : active === "add-buyer"
                      ? "Kiambu"
                      : (order?.payment ?? "M-Pesa on delivery")}
              </option>
              <option>M-Pesa on delivery</option>
              <option>Cash on pickup</option>
              <option>50% deposit</option>
            </select>
          </Field>
          {active === "photo-detail" ? (
            <div className="col-12">
              <button type="button" className="gm-upload-drop w-100">
                <ImagePlus /> Select portfolio evidence{" "}
                <small>Photo, report or crate label · demo upload</small>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="row g-3 mt-1">
          <Field
            label={
              active === "link-settings"
                ? "Access setting"
                : active === "schedule-delivery"
                  ? "Handover time"
                  : active === "generate-contract"
                    ? "Quality standard"
                    : "Terms note"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                active === "link-settings"
                  ? "Open link · buyer inquiry enabled"
                  : active === "schedule-delivery"
                    ? "Monday · 09:30 AM"
                    : active === "generate-contract"
                      ? "Grade A · 1.5–2.5 kg · PHI clear"
                      : "Clear terms recorded in GrowMO"
              }
            />
          </Field>
          <Field
            label={
              active === "link-settings"
                ? "Link expiry"
                : active === "schedule-delivery"
                  ? "Vehicle / crates"
                  : active === "generate-contract"
                    ? "Contract duration"
                    : "Internal note"
            }
          >
            <input
              className="gm-input"
              defaultValue={
                active === "link-settings"
                  ? "21 Feb 2027"
                  : active === "schedule-delivery"
                    ? "Trailer · 70 crates"
                    : active === "generate-contract"
                      ? "8 weeks"
                      : "Visible in your farm record"
              }
            />
          </Field>
          <div className="col-12">
            <Toggle
              checked={notify}
              onChange={setNotify}
              label="Notify buyer through GrowMO"
              desc="The buyer receives the next step in their protected order timeline."
            />
          </div>
          {active === "link-settings" || active === "publish-portfolio" ? (
            <div className="col-12">
              <Toggle
                checked={openLink}
                onChange={setOpenLink}
                label="Allow buyer inquiries from this link"
                desc="Hide your phone number while keeping the portfolio open for verified buyer requests."
              />
            </div>
          ) : null}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-2">
          <div className="gm-plan-detail-hero">
            <span className="gm-mega-icon">
              {active === "generate-contract" ? (
                <FileText />
              ) : active === "send-esign" ? (
                <Send />
              ) : active === "export-orders" ? (
                <Download />
              ) : active === "schedule-delivery" ? (
                <CalendarDays />
              ) : (
                <BadgeCheck />
              )}
            </span>
            <div style={{ flex: 1 }}>
              <span className="gm-eyebrow">Ready to proceed</span>
              <h3 className="font-display mb-1">
                {portfolioFlow
                  ? "The buyer sees a complete, traceable crop offer"
                  : negotiation
                    ? "The buyer will receive a clear next option"
                    : "This record is ready for the sales file"}
              </h3>
              <p className="mb-0 text-muted">
                Uwazi kwanza — a clean record protects the farmer and gives
                buyers confidence.
              </p>
            </div>
            <StatusChip
              label={notify ? "Buyer notified" : "Private record"}
              tone={notify ? "low" : "neutral"}
            />
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
            : active === "publish-portfolio"
              ? "Publish portfolio"
              : active === "send-esign"
                ? "Send for signature"
                : active === "export-orders"
                  ? "Prepare report"
                  : "Save record"
        }
        nextDisabled={busy}
      />
    </Dialog>
  );
}
