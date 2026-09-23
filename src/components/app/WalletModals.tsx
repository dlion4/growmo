/* ============================================================================
   PAGE 14 — WALLET & PAYMENTS MODALS
   All modals, wizards, drawers and dialogs for the wallet page.
   17+ interactive components.
   ========================================================================== */
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Download,
  Eye,
  FileDown,
  FileText,
  Globe,
  Hash,
  Landmark,
  Lock,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Stepper, Toggle } from "../../components/auth/controls";
import {
  DashboardDrawer,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";
import type {
  AutoPayRule,
  Biller,
  SavedRecipient,
  SecuritySetting,
  Transaction,
  WalletBudgetAllocation,
} from "../../data/app/wallet";

/* ── Confirm dialog (reusable) ───────────────────────────────────────────── */
export function ConfirmWalletDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={body}>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`gm-btn gm-btn-sm ${destructive ? "gm-btn-danger" : "gm-btn-lime"}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}

/* ── 1. Deposit Wizard (3-step) ──────────────────────────────────────────── */
export function DepositWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (amount: number, method: string, ref: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("mpesa-stk");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setMethod("mpesa-stk");
      setAmount("");
      setProcessing(false);
    }
  }, [open]);

  const steps = ["Choose method", "Enter amount", "Confirm"];
  const numAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const limits =
    method === "mpesa-stk"
      ? { min: 100, max: 150000 }
      : method === "mpesa-paybill"
        ? { min: 100, max: 150000 }
        : method === "bank"
          ? { min: 500, max: 1000000 }
          : method === "agent"
            ? { min: 100, max: 50000 }
            : { min: 100, max: 100000 };

  const canProceed =
    step === 0
      ? true
      : step === 1
        ? numAmount >= limits.min && numAmount <= limits.max
        : true;

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      const ref = `DEP${Date.now().toString(36).toUpperCase().slice(-8)}`;
      onComplete(numAmount, method, ref);
      setProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Deposit Money" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <div className="gm-method-grid">
            {[
              {
                id: "mpesa-stk",
                icon: Smartphone,
                label: "M-Pesa STK Push",
                desc: "Instant · Free",
              },
              {
                id: "mpesa-paybill",
                icon: Smartphone,
                label: "M-Pesa Paybill",
                desc: "5–10 min · Free",
              },
              {
                id: "bank",
                icon: Landmark,
                label: "Bank Transfer",
                desc: "1–4 hours · KES 50 fee",
              },
              {
                id: "agent",
                icon: Store,
                label: "Agent Deposit",
                desc: "Instant · KES 20 fee",
              },
              {
                id: "card",
                icon: CreditCard,
                label: "Card (Visa/Mastercard)",
                desc: "Instant · 1.5% fee",
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`gm-method ${method === m.id ? "is-active" : ""}`}
                onClick={() => setMethod(m.id)}
              >
                <m.icon />
                <span>
                  <strong>{m.label}</strong>
                  <small>{m.desc}</small>
                </span>
              </button>
            ))}
          </div>
        ) : step === 1 ? (
          <>
            <div className="gm-field">
              <label>Amount (KES)</label>
              <input
                className="gm-input gm-input-lg font-display"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${kes(limits.min)} · Max ${kes(limits.max)}`}
              />
              <small className="text-muted">
                Min {kes(limits.min)} · Max {kes(limits.max)}
              </small>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-1">
              {[1000, 5000, 10000, 20000].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => setAmount(String(v))}
                >
                  {kes(v)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {processing ? (
              <div className="text-center py-4">
                <div className="gm-spinner mb-3" />
                <p className="text-muted">
                  {method === "mpesa-stk"
                    ? "STK push sent to 0712 345 678. Enter your M-Pesa PIN on your phone..."
                    : "Processing your deposit..."}
                </p>
              </div>
            ) : (
              <>
                <div className="gm-review-card">
                  <div className="gm-review-row">
                    <span>Method</span>
                    <strong>
                      {method === "mpesa-stk"
                        ? "M-Pesa STK Push"
                        : method === "mpesa-paybill"
                          ? "M-Pesa Paybill"
                          : method === "bank"
                            ? "Bank Transfer"
                            : method === "agent"
                              ? "Agent Deposit"
                              : "Card"}
                    </strong>
                  </div>
                  <div className="gm-review-row">
                    <span>Amount</span>
                    <strong className="font-display">{kes(numAmount)}</strong>
                  </div>
                  <div className="gm-review-row">
                    <span>To</span>
                    <strong>GrowMO Wallet · 0712 345 678</strong>
                  </div>
                  {method === "mpesa-paybill" ? (
                    <div className="gm-review-row">
                      <span>Paybill</span>
                      <strong>174379 · Acc: 0712345678</strong>
                    </div>
                  ) : null}
                </div>
                <div className="gm-check-row">
                  <ShieldCheck />
                  <span>
                    <strong>Secured by M-Pesa</strong>
                    <small>
                      Your deposit is protected by Safaricom's encryption.
                    </small>
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
        >
          {step > 0 ? "Back" : "Cancel"}
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            disabled={!canProceed}
            onClick={() => setStep(step + 1)}
          >
            Next <ArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm"
            disabled={processing}
            onClick={handleConfirm}
          >
            {processing ? "Processing..." : "Confirm deposit"}
          </button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 2. Send Money Wizard (3-step) ───────────────────────────────────────── */
export function SendMoneyWizard({
  open,
  mode,
  recipients,
  billers,
  onClose,
  onComplete,
}: {
  open: boolean;
  mode:
    | "worker"
    | "supplier"
    | "bank"
    | "growmo-user"
    | "bill";
  recipients: SavedRecipient[];
  billers: Biller[];
  onClose: () => void;
  onComplete: (amount: number, recipient: string, ref: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [accountRef, setAccountRef] = useState("");
  const [selectedBiller, setSelectedBiller] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setRecipient("");
      setPhone("");
      setAmount("");
      setAccountRef("");
      setSelectedBiller("");
      setProcessing(false);
    }
  }, [open]);

  const numAmount = parseInt(amount.replace(/[^0-9]/g, ""), 10) || 0;
  const steps =
    mode === "bill"
      ? ["Select biller", "Enter details", "Confirm"]
      : ["Select recipient", "Enter amount", "Confirm"];

  const canProceed =
    step === 0
      ? mode === "bill"
        ? !!selectedBiller
        : !!recipient
      : step === 1
        ? numAmount >= 10
        : true;

  const handleConfirm = () => {
    setProcessing(true);
    setTimeout(() => {
      const ref = `SND${Date.now().toString(36).toUpperCase().slice(-8)}`;
      onComplete(numAmount, recipient || selectedBiller, ref);
      setProcessing(false);
      onClose();
    }, 2000);
  };

  const filteredRecipients = recipients.filter((r) =>
    mode === "worker"
      ? r.type === "Worker"
      : mode === "supplier"
        ? r.type === "Supplier"
        : mode === "buyer"
          ? r.type === "Buyer"
          : true,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        mode === "worker"
          ? "Pay Worker"
          : mode === "supplier"
            ? "Pay Supplier"
            : mode === "bank"
              ? "Bank Transfer"
              : mode === "bill"
                ? "Pay Bill"
                : "Send to GrowMO User"
      }
      wide
    >
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          mode === "bill" ? (
            <div className="gm-field">
              <label>Select biller</label>
              <div className="d-flex flex-column gap-2 mt-1">
                {billers.map((biller) => (
                  <button
                    key={biller.id}
                    type="button"
                    className={`gm-option-row ${selectedBiller === biller.name ? "is-selected" : ""}`}
                    onClick={() => setSelectedBiller(biller.name)}
                  >
                    <Zap />
                    <span>
                      <strong>{biller.name}</strong>
                      <small>
                        {biller.category} · Paybill: {biller.paybill}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="gm-field">
              <label>Select recipient</label>
              <div className="d-flex flex-column gap-2 mt-1">
                {filteredRecipients.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`gm-option-row ${recipient === r.name ? "is-selected" : ""}`}
                    onClick={() => {
                      setRecipient(r.name);
                      setPhone(r.phone);
                    }}
                  >
                    {r.type === "Worker" ? (
                      <Users />
                    ) : r.type === "Supplier" ? (
                      <Store />
                    ) : (
                      <Banknote />
                    )}
                    <span>
                      <strong>{r.name}</strong>
                      <small>
                        {r.phone} · Last paid: {r.lastPaid}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : step === 1 ? (
          <>
            <div className="gm-field">
              <label>Amount (KES)</label>
              <input
                className="gm-input gm-input-lg font-display"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            {mode === "bill" ? (
              <div className="gm-field">
                <label>Account number / meter number</label>
                <input
                  className="gm-input"
                  value={accountRef}
                  onChange={(e) => setAccountRef(e.target.value)}
                  placeholder="Enter account reference"
                />
              </div>
            ) : mode === "bank" ? (
              <>
                <div className="gm-field">
                  <label>Bank</label>
                  <select className="gm-select w-100">
                    <option>KCB</option>
                    <option>Equity</option>
                    <option>Co-op Bank</option>
                    <option>NCBA</option>
                    <option>ABSA</option>
                  </select>
                </div>
                <div className="gm-field">
                  <label>Account number</label>
                  <input className="gm-input" placeholder="Enter account number" />
                </div>
              </>
            ) : null}
            <div className="d-flex flex-wrap gap-2 mt-1">
              {[500, 1000, 2000, 5000].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => setAmount(String(v))}
                >
                  {kes(v)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {processing ? (
              <div className="text-center py-4">
                <div className="gm-spinner mb-3" />
                <p className="text-muted">
                  Processing payment to {recipient || selectedBiller}...
                </p>
              </div>
            ) : (
              <>
                <div className="gm-review-card">
                  <div className="gm-review-row">
                    <span>Recipient</span>
                    <strong>{recipient || selectedBiller}</strong>
                  </div>
                  {phone ? (
                    <div className="gm-review-row">
                      <span>Phone</span>
                      <strong>{phone}</strong>
                    </div>
                  ) : null}
                  <div className="gm-review-row">
                    <span>Amount</span>
                    <strong className="font-display">{kes(numAmount)}</strong>
                  </div>
                  <div className="gm-review-row">
                    <span>Method</span>
                    <strong>
                      {mode === "worker"
                        ? "M-Pesa B2C"
                        : mode === "supplier"
                          ? "M-Pesa B2B"
                          : mode === "bank"
                            ? "Bank Transfer"
                            : mode === "bill"
                              ? "Paybill"
                              : "Internal"}
                    </strong>
                  </div>
                  <div className="gm-review-row">
                    <span>From</span>
                    <strong>GrowMO Wallet · 0712 345 678</strong>
                  </div>
                </div>
                <div className="gm-check-row">
                  <ShieldCheck />
                  <span>
                    <strong>Confirm with PIN</strong>
                    <small>
                      You will be asked for your 4-digit wallet PIN to authorize
                      this payment.
                    </small>
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
        >
          {step > 0 ? "Back" : "Cancel"}
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            disabled={!canProceed}
            onClick={() => setStep(step + 1)}
          >
            Next <ArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm"
            disabled={processing}
            onClick={handleConfirm}
          >
            {processing ? "Processing..." : "Send money"}
          </button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 3. Transaction Detail Drawer ────────────────────────────────────────── */
export function TransactionDrawer({
  open,
  txn,
  onClose,
}: {
  open: boolean;
  txn: Transaction | null;
  onClose: () => void;
}) {
  if (!txn) return null;
  return (
    <DashboardDrawer
      open={open}
      title="Transaction Detail"
      onClose={onClose}
      footer={
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={onClose}
          >
            <Download /> Download receipt
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="gm-wizard-stack">
        <div className="gm-plan-detail-hero">
          <span
            className={`gm-finance-activity-icon ${txn.type === "In" ? "is-in" : "is-out"}`}
          >
            {txn.type === "In" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </span>
          <div>
            <span className="gm-eyebrow">
              {txn.date} · {txn.time}
            </span>
            <h3 className="font-display mb-1">{txn.description}</h3>
            <StatusChip
              label={txn.status}
              tone={txn.status === "Success" ? "low" : txn.status === "Pending" ? "medium" : "high"}
            />
          </div>
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row">
            <span>Amount</span>
            <strong className={`font-display ${txn.type === "In" ? "text-success" : ""}`}>
              {txn.type === "In" ? "+" : "−"}
              {kes(txn.amount)}
            </strong>
          </div>
          <div className="gm-review-row">
            <span>Balance after</span>
            <strong className="font-display">{kes(txn.balanceAfter)}</strong>
          </div>
          <div className="gm-review-row">
            <span>Method</span>
            <strong>{txn.method}</strong>
          </div>
          <div className="gm-review-row">
            <span>Reference</span>
            <strong className="gm-code-chip">{txn.refNo}</strong>
          </div>
          {txn.recipient ? (
            <div className="gm-review-row">
              <span>Recipient</span>
              <strong>{txn.recipient}</strong>
            </div>
          ) : null}
          {txn.phone ? (
            <div className="gm-review-row">
              <span>Phone</span>
              <strong>{txn.phone}</strong>
            </div>
          ) : null}
          {txn.linkedCrop ? (
            <div className="gm-review-row">
              <span>Linked crop</span>
              <strong>{txn.linkedCrop}</strong>
            </div>
          ) : null}
        </div>
        <div className="gm-check-row">
          <ShieldCheck />
          <span>
            <strong>Verified transaction</strong>
            <small>
              This transaction was processed through M-Pesa's secure network
              and recorded in your GrowMO wallet ledger.
            </small>
          </span>
        </div>
      </div>
    </DashboardDrawer>
  );
}

/* ── 4. Auto-Pay Rule Wizard (3-step) ────────────────────────────────────── */
export function AutoPayRuleWizard({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing: AutoPayRule | null;
  onClose: () => void;
  onSave: (rule: AutoPayRule) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AutoPayRule>({
    id: "",
    name: "",
    trigger: "Task marked Complete",
    recipients: "Assigned workers",
    amount: "Per task rate",
    status: "Active",
    lastTriggered: "Never",
    note: "",
  });

  useEffect(() => {
    if (open) {
      setStep(0);
      setForm(
        editing ?? {
          id: `ap-${Date.now()}`,
          name: "",
          trigger: "Task marked Complete",
          recipients: "Assigned workers",
          amount: "Per task rate",
          status: "Active",
          lastTriggered: "Never",
          note: "",
        },
      );
    }
  }, [open, editing]);

  const steps = ["Trigger", "Action", "Review"];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit Auto-Pay Rule" : "New Auto-Pay Rule"}
      wide
    >
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <>
            <div className="gm-field">
              <label>Rule name</label>
              <input
                className="gm-input w-100"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Pay workers on task complete"
              />
            </div>
            <div className="gm-field">
              <label>Trigger</label>
              <select
                className="gm-select w-100"
                value={form.trigger}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trigger: e.target.value }))
                }
              >
                <option>Task marked Complete</option>
                <option>Every Friday 5 PM</option>
                <option>Budget category + approved supplier</option>
                <option>Monthly, 1st</option>
                <option>Harvest delivery confirmed</option>
                <option>Manual trigger only</option>
              </select>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="gm-field">
              <label>Recipients</label>
              <select
                className="gm-select w-100"
                value={form.recipients}
                onChange={(e) =>
                  setForm((f) => ({ ...f, recipients: e.target.value }))
                }
              >
                <option>Assigned workers</option>
                <option>All unpaid workers</option>
                <option>Supplier Till</option>
                <option>GrowMO</option>
                <option>Specific phone number</option>
              </select>
            </div>
            <div className="gm-field">
              <label>Amount</label>
              <select
                className="gm-select w-100"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
              >
                <option>Per task rate</option>
                <option>Sum of week</option>
                <option>Invoice amount</option>
                <option>Fixed amount</option>
              </select>
            </div>
            <div className="gm-field">
              <label>Note (optional)</label>
              <input
                className="gm-input w-100"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                placeholder="Add a note about this rule"
              />
            </div>
          </>
        ) : (
          <>
            <div className="gm-review-card">
              <div className="gm-review-row">
                <span>Name</span>
                <strong>{form.name || "Unnamed rule"}</strong>
              </div>
              <div className="gm-review-row">
                <span>Trigger</span>
                <strong>{form.trigger}</strong>
              </div>
              <div className="gm-review-row">
                <span>Recipients</span>
                <strong>{form.recipients}</strong>
              </div>
              <div className="gm-review-row">
                <span>Amount</span>
                <strong>{form.amount}</strong>
              </div>
              {form.note ? (
                <div className="gm-review-row">
                  <span>Note</span>
                  <strong>{form.note}</strong>
                </div>
              ) : null}
            </div>
            <Toggle
              checked={form.status === "Active"}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  status: v ? "Active" : "Paused",
                }))
              }
              label="Active immediately"
              desc="Start processing as soon as the trigger fires"
            />
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
        >
          {step > 0 ? "Back" : "Cancel"}
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={() => setStep(step + 1)}
          >
            Next <ArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            <Check /> Save rule
          </button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 5. Budget Allocation Dialog ─────────────────────────────────────────── */
export function BudgetAllocationDialog({
  open,
  allocations,
  onClose,
  onSave,
}: {
  open: boolean;
  allocations: WalletBudgetAllocation[];
  onClose: () => void;
  onSave: (id: string, amount: number) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  return (
    <Dialog open={open} onClose={onClose} title="Budget Allocation" wide>
      <div className="gm-wizard-stack">
        <p className="text-muted">
          Allocate money from your wallet to specific crop budgets. Allocated
          funds are protected for that crop's expenses.
        </p>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Budget</th>
                <th>Crop</th>
                <th>Allocated</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.budget}</strong>
                  </td>
                  <td>
                    <small>{a.crop}</small>
                  </td>
                  <td className="font-display">{kes(a.allocated)}</td>
                  <td>{kes(a.spent)}</td>
                  <td className={a.remaining > 0 ? "text-success" : ""}>
                    {kes(a.remaining)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => {
                        setEditId(a.id);
                        setAmount(String(a.allocated));
                      }}
                    >
                      <Pencil /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editId ? (
          <div className="gm-card p-3">
            <div className="gm-field">
              <label>
                Allocate to{" "}
                {allocations.find((a) => a.id === editId)?.budget}
              </label>
              <input
                className="gm-input font-display"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => setEditId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => {
                  onSave(editId, parseInt(amount, 10) || 0);
                  setEditId(null);
                }}
              >
                <Check /> Save allocation
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}

/* ── 6. Security Settings Dialog ─────────────────────────────────────────── */
export function SecuritySettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: SecuritySetting[];
  onClose: () => void;
  onSave: (settings: SecuritySetting[]) => void;
}) {
  const [form, setForm] = useState(settings);
  useEffect(() => {
    if (open) setForm(settings);
  }, [open, settings]);

  const toggleSetting = (id: string) => {
    setForm((f) =>
      f.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s,
      ),
    );
  };

  return (
    <Dialog open={open} onClose={onClose} title="Security & Controls" wide>
      <div className="gm-wizard-stack">
        {form.map((s) => (
          <div key={s.id} className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>{s.feature}</strong>
              <small>{s.details}</small>
            </span>
            <Toggle
              checked={s.enabled}
              onChange={() => toggleSetting(s.id)}
              label=""
            />
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={() => {
            onSave(form);
            onClose();
          }}
        >
          <Check /> Save settings
        </button>
      </div>
    </Dialog>
  );
}

/* ── 7. Freeze Wallet Dialog ─────────────────────────────────────────────── */
export function FreezeWalletDialog({
  open,
  frozen,
  onClose,
  onToggle,
}: {
  open: boolean;
  frozen: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={frozen ? "Unfreeze Wallet" : "Freeze Wallet"}
    >
      <div className="gm-wizard-stack">
        <div className="text-center py-2">
          <Lock
            width={48}
            height={48}
            style={{ color: frozen ? "var(--gm-leaf-500)" : "var(--gm-clay-500)" }}
          />
        </div>
        <p className="text-muted text-center">
          {frozen
            ? "Your wallet is currently frozen. All incoming and outgoing transactions are blocked. Unfreeze to restore normal operations."
            : "Freezing your wallet will immediately block all incoming and outgoing transactions. This is useful if you suspect unauthorized access."}
        </p>
        <div className="gm-alert-box is-danger">
          <ShieldCheck />
          <p>
            <strong>{frozen ? "Unfreeze" : "Freeze"} will take effect immediately</strong>
            <br />
            {frozen
              ? "You will be able to send and receive money again."
              : "You can unfreeze at any time from this page or by sending an SMS."}
          </p>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`gm-btn gm-btn-sm ${frozen ? "gm-btn-lime" : "gm-btn-danger"}`}
          onClick={() => {
            onToggle();
            onClose();
          }}
        >
          {frozen ? "Unfreeze wallet" : "Freeze wallet"}
        </button>
      </div>
    </Dialog>
  );
}

/* ── 8. PIN Change Dialog ────────────────────────────────────────────────── */
export function PinChangeDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (pin: string) => void;
}) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setStep(0);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title="Change Wallet PIN">
      <div className="gm-wizard-stack">
        {step === 0 ? (
          <div className="gm-field">
            <label>Current PIN</label>
            <input
              className="gm-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) =>
                setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Enter current 4-digit PIN"
            />
          </div>
        ) : (
          <>
            <div className="gm-field">
              <label>New PIN</label>
              <input
                className="gm-input"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="Enter new 4-digit PIN"
              />
            </div>
            <div className="gm-field">
              <label>Confirm new PIN</label>
              <input
                className="gm-input"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="Re-enter new PIN"
              />
              {confirmPin && newPin !== confirmPin ? (
                <small className="text-danger">PINs do not match</small>
              ) : null}
            </div>
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => (step > 0 ? setStep(0) : onClose())}
        >
          {step > 0 ? "Back" : "Cancel"}
        </button>
        {step === 0 ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            disabled={currentPin.length !== 4}
            onClick={() => setStep(1)}
          >
            Next <ArrowRight />
          </button>
        ) : (
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            disabled={newPin.length !== 4 || newPin !== confirmPin}
            onClick={() => {
              onSave(newPin);
              onClose();
            }}
          >
            <Check /> Change PIN
          </button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 9. Recipients Management Drawer ─────────────────────────────────────── */
export function RecipientsDrawer({
  open,
  recipients,
  onClose,
}: {
  open: boolean;
  recipients: SavedRecipient[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Worker" | "Supplier" | "Buyer">("all");
  const filtered = recipients.filter(
    (r) =>
      `${r.name} ${r.phone}`.toLowerCase().includes(query.toLowerCase()) &&
      (typeFilter === "all" || r.type === typeFilter),
  );
  return (
    <DashboardDrawer open={open} title="Saved Recipients" onClose={onClose}>
      <div className="gm-wizard-stack">
        <div className="gm-search-wrap">
          <Search />
          <input
            className="gm-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipients"
          />
        </div>
        <div className="d-flex flex-wrap gap-2">
          {(["all", "Worker", "Supplier", "Buyer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`gm-filter-chip ${typeFilter === t ? "on" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === "all" ? "All" : t}s
            </button>
          ))}
        </div>
        {filtered.map((r) => (
          <div key={r.id} className="gm-check-row">
            {r.type === "Worker" ? (
              <Users />
            ) : r.type === "Supplier" ? (
              <Store />
            ) : (
              <Banknote />
            )}
            <span>
              <strong>{r.name}</strong>
              <small>
                {r.phone} · {r.type} · Last: {r.lastPaid}
              </small>
            </span>
            <strong className="font-display">{kes(r.totalPaid)}</strong>
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0">No recipients match.</p>
        ) : null}
      </div>
    </DashboardDrawer>
  );
}

/* ── 10. Monthly Summary Dialog ──────────────────────────────────────────── */
export function MonthlySummaryDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="October 2026 — Monthly Summary" wide>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row">
            <span>Total deposits</span>
            <strong className="font-display text-success">+KES 60,000</strong>
          </div>
          <div className="gm-review-row">
            <span>Total spend</span>
            <strong className="font-display">−KES 35,500</strong>
          </div>
          <div className="gm-review-row">
            <span>Net movement</span>
            <strong className="text-success font-display">+KES 24,500</strong>
          </div>
          <div className="gm-review-row">
            <span>Transactions</span>
            <strong>24 transactions</strong>
          </div>
          <div className="gm-review-row">
            <span>Avg transaction</span>
            <strong className="font-display">KES 3,979</strong>
          </div>
        </div>
        <h4 className="font-display mt-2">Spend by category</h4>
        <div className="gm-check-row">
          <Users />
          <span>
            <strong>Labour</strong>
            <small>35% of spend</small>
          </span>
          <strong className="font-display">KES 12,500</strong>
        </div>
        <div className="gm-check-row">
          <Store />
          <span>
            <strong>Inputs</strong>
            <small>37% of spend</small>
          </span>
          <strong className="font-display">KES 13,000</strong>
        </div>
        <div className="gm-check-row">
          <TrendingDown />
          <span>
            <strong>Transport</strong>
            <small>11% of spend</small>
          </span>
          <strong className="font-display">KES 4,000</strong>
        </div>
        <div className="gm-check-row">
          <Smartphone />
          <span>
            <strong>Subscriptions</strong>
            <small>1% of spend</small>
          </span>
          <strong className="font-display">KES 299</strong>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 11. Spending Breakdown Drawer ───────────────────────────────────────── */
export function SpendingDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DashboardDrawer open={open} title="Spending Breakdown" onClose={onClose}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row">
            <span>Period</span>
            <strong>October 2026</strong>
          </div>
          <div className="gm-review-row">
            <span>Total spend</span>
            <strong className="font-display">KES 35,500</strong>
          </div>
          <div className="gm-review-row">
            <span>vs September</span>
            <strong className="text-danger">+12%</strong>
          </div>
        </div>
        <h4 className="font-display">Category breakdown</h4>
        {[
          { cat: "Labour", pct: 35, amt: 12500, color: "var(--gm-leaf-500)" },
          { cat: "Inputs", pct: 37, amt: 13000, color: "var(--gm-gold-500)" },
          { cat: "Transport", pct: 11, amt: 4000, color: "var(--gm-sprout-400)" },
          { cat: "Subscriptions", pct: 1, amt: 299, color: "var(--gm-clay-500)" },
          { cat: "Other", pct: 16, amt: 5701, color: "var(--gm-ink-400)" },
        ].map((c) => (
          <div key={c.cat} className="mb-2">
            <div className="d-flex justify-content-between mb-1">
              <strong>{c.cat}</strong>
              <span className="font-display">{kes(c.amt)}</span>
            </div>
            <div className="gm-progress-mini">
              <span
                className="gm-progress-mini-fill"
                style={{ width: `${c.pct}%`, background: c.color }}
              />
            </div>
            <small className="text-muted">{c.pct}% of total spend</small>
          </div>
        ))}
      </div>
    </DashboardDrawer>
  );
}

/* ── 12. Scheduled Payments Dialog ───────────────────────────────────────── */
export function ScheduledPaymentsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Scheduled Payments" wide>
      <div className="gm-wizard-stack">
        <p className="text-muted">
          Payments scheduled for automatic processing on their trigger date.
        </p>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Recipient</th>
                <th>Amount</th>
                <th>Next date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>GrowMO Premium</strong>
                </td>
                <td>GrowMO</td>
                <td className="font-display">KES 299</td>
                <td>01 Nov 2026</td>
                <td>
                  <StatusChip label="Active" tone="low" />
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Weekly labour payout</strong>
                </td>
                <td>All workers</td>
                <td className="font-display">Variable</td>
                <td>01 Nov 2026 (Fri)</td>
                <td>
                  <StatusChip label="Paused" tone="neutral" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 13. Wallet Limits Dialog ────────────────────────────────────────────── */
export function WalletLimitsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Transaction Limits">
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row">
            <span>Daily limit</span>
            <strong className="font-display">KES 50,000</strong>
          </div>
          <div className="gm-review-row">
            <span>Monthly limit</span>
            <strong className="font-display">KES 500,000</strong>
          </div>
          <div className="gm-review-row">
            <span>Approval threshold</span>
            <strong className="font-display">KES 5,000</strong>
          </div>
          <div className="gm-review-row">
            <span>Daily used</span>
            <strong>KES 1,500</strong>
          </div>
          <div className="gm-review-row">
            <span>Monthly used</span>
            <strong>KES 35,500</strong>
          </div>
        </div>
        <div className="gm-check-row">
          <ShieldCheck />
          <span>
            <strong>Limit increase</strong>
            <small>
              Contact GrowMO support to increase your limits. Verification
              required for limits above KES 200,000 daily.
            </small>
          </span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 14. Export Transactions Dialog ──────────────────────────────────────── */
export function ExportTransactionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<"csv" | "pdf">("csv");
  const [range, setRange] = useState("This month");
  return (
    <Dialog open={open} onClose={onClose} title="Export Transactions">
      <div className="gm-wizard-stack">
        <div className="gm-field">
          <label>Date range</label>
          <select
            className="gm-select w-100"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            {["This week", "This month", "Last 3 months", "This year", "All time"].map(
              (r) => (
                <option key={r}>{r}</option>
              ),
            )}
          </select>
        </div>
        <div className="gm-field">
          <label>Format</label>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={`gm-btn gm-btn-sm ${format === "csv" ? "gm-btn-dark" : "gm-btn-outline"}`}
              onClick={() => setFormat("csv")}
            >
              CSV
            </button>
            <button
              type="button"
              className={`gm-btn gm-btn-sm ${format === "pdf" ? "gm-btn-dark" : "gm-btn-outline"}`}
              onClick={() => setFormat("pdf")}
            >
              PDF
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime gm-btn-sm"
          onClick={onClose}
        >
          <FileDown /> Export {format.toUpperCase()}
        </button>
      </div>
    </Dialog>
  );
}

/* ── 15. M-Pesa Paybill Info Dialog ──────────────────────────────────────── */
export function PaybillInfoDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="M-Pesa Paybill Details">
      <div className="gm-wizard-stack">
        <p className="text-muted">
          Deposit money to your GrowMO wallet using M-Pesa Paybill.
        </p>
        <div className="gm-card p-3">
          <div className="gm-review-row">
            <span>Paybill number</span>
            <strong className="font-display">174379</strong>
          </div>
          <div className="gm-review-row">
            <span>Account number</span>
            <strong className="font-display">0712345678</strong>
          </div>
        </div>
        <div className="gm-check-row">
          <Smartphone />
          <span>
            <strong>How to deposit</strong>
            <small>
              1. Open M-Pesa on your phone. 2. Select Lipa na M-Pesa → Pay Bill.
              3. Enter Business No: 174379. 4. Account: 0712345678. 5. Enter
              amount and PIN. 6. Confirmation SMS will be sent.
            </small>
          </span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={() => setCopied(true)}
        >
          {copied ? (
            <>
              <Check /> Copied to clipboard
            </>
          ) : (
            <>
              <Copy /> Copy paybill details
            </>
          )}
        </button>
      </div>
    </Dialog>
  );
}

/* ── 16. Quick Actions Dropdown (rendered as Dialog) ──────────────────────── */
export function QuickActionsDialog({
  open,
  onClose,
  onDeposit,
  onSend,
  onPayWorker,
  onPaySupplier,
  onPayBill,
  onViewStatements,
}: {
  open: boolean;
  onClose: () => void;
  onDeposit: () => void;
  onSend: () => void;
  onPayWorker: () => void;
  onPaySupplier: () => void;
  onPayBill: () => void;
  onViewStatements: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Quick Actions">
      <div className="d-flex flex-column gap-2">
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onDeposit();
            onClose();
          }}
        >
          <span className="gm-action-icon is-positive">
            <ArrowDownLeft />
          </span>
          <span>
            <strong>Deposit money</strong>
            <small>Add funds via M-Pesa, bank or card</small>
          </span>
          <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onPayWorker();
            onClose();
          }}
        >
          <span className="gm-action-icon">
            <Users />
          </span>
          <span>
            <strong>Pay worker</strong>
            <small>Send M-Pesa to your farm team</small>
          </span>
          <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onPaySupplier();
            onClose();
          }}
        >
          <span className="gm-action-icon">
            <Store />
          </span>
          <span>
            <strong>Pay supplier</strong>
            <small>Pay agrovet or input supplier</small>
          </span>
          <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onPayBill();
            onClose();
          }}
        >
          <span className="gm-action-icon">
            <Zap />
          </span>
          <span>
            <strong>Pay bill</strong>
            <small>KPLC, water, NHIF and more</small>
          </span>
          <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onSend();
            onClose();
          }}
        >
          <span className="gm-action-icon">
            <Send />
          </span>
          <span>
            <strong>Bank transfer</strong>
            <small>Send to KCB, Equity, Co-op or NCBA</small>
          </span>
          <ArrowRight />
        </button>
        <button
          type="button"
          className="gm-action-card"
          onClick={() => {
            onViewStatements();
            onClose();
          }}
        >
          <span className="gm-action-icon">
            <FileText />
          </span>
          <span>
            <strong>View statements</strong>
            <small>Download transaction history</small>
          </span>
          <ArrowRight />
        </button>
      </div>
    </Dialog>
  );
}