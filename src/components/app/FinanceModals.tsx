/* ============================================================================
   PAGE 7 WORKFLOWS — money, budgets, expenses, income and automation
   Every dialog completes a state change or a visible financial workflow.
   ========================================================================== */
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  LoaderCircle,
  LockKeyhole,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  AutoPayRule,
  BudgetStatus,
  ExpenseMethod,
  ExpenseRecord,
  FinancialBudget,
  FinancialPayee,
  FinancialSettings,
  IncomeMethod,
  IncomeRecord,
  WalletActivity,
} from "../../data/app/finance";
import {
  BUDGET_TEMPLATES,
  EXPENSE_CATEGORIES,
  EXPENSE_SUBCATEGORIES,
  FINANCE_CONTEXT,
  FINANCE_CROPS,
  FINANCIAL_PAYEES,
} from "../../data/app/finance";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";

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
    <div className="gm-review-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SuccessState({
  title,
  body,
  receipt,
  actionLabel = "Done",
  onDone,
}: {
  title: string;
  body: string;
  receipt?: string;
  actionLabel?: string;
  onDone: () => void;
}) {
  return (
    <div className="text-center py-2">
      <span className="gm-success-mark">
        <CheckCircle2 />
      </span>
      <h4 className="font-display mt-3 mb-2">{title}</h4>
      <p className="text-muted mb-3">{body}</p>
      {receipt ? (
        <div className="gm-receipt-code">
          <small>M-Pesa reference</small>
          <strong>{receipt}</strong>
        </div>
      ) : null}
      <button
        type="button"
        className="gm-btn gm-btn-lime mt-3"
        onClick={onDone}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export type MoneyMode = "deposit" | "withdraw" | "expense";

export function MpesaMoneyWizard({
  open,
  mode,
  initialAmount = 0,
  purpose = "GrowMO wallet",
  onClose,
  onComplete,
}: {
  open: boolean;
  mode: MoneyMode;
  initialAmount?: number;
  purpose?: string;
  onClose: () => void;
  onComplete: (amount: number, receipt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(
    initialAmount ? String(initialAmount) : "",
  );
  const [otp, setOtp] = useState("");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState("");
  const steps = ["Amount", "OTP", "PIN", "Receipt"];
  const isDeposit = mode === "deposit";
  const isWithdraw = mode === "withdraw";
  const numericAmount = Math.max(0, Number(amount) || 0);
  const title = isDeposit
    ? "Add money via M-Pesa"
    : isWithdraw
      ? "Send money to M-Pesa"
      : "Confirm wallet payment";

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAmount(initialAmount ? String(initialAmount) : "");
    setOtp("");
    setProcessing(false);
    setReceipt("");
  }, [open, initialAmount]);

  const createReceipt = () => {
    const suffix = `${numericAmount}${purpose}`
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(-8)
      .toUpperCase();
    return `GMO${suffix || "7K2L9P"}`;
  };

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 1) {
      setStep(2);
    }
  };

  const verifyPin = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setReceipt(createReceipt());
      setProcessing(false);
      setStep(3);
    }, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      desc="M-Pesa confirmation is simulated safely inside GrowMO."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-wizard-stack">
          <div className="gm-mpesa-hero">
            <span className="gm-mega-icon">
              <Smartphone />
            </span>
            <div>
              <strong>{purpose}</strong>
              <small>
                {isDeposit
                  ? "Move funds from your registered number into the farm wallet."
                  : isWithdraw
                    ? "Send available wallet funds to 0712 345 678."
                    : "Protected payment from the GrowMO wallet."}
              </small>
            </div>
          </div>
          <Field
            label="Amount (KES)"
            hint={
              isWithdraw
                ? `Effective available: ${kes(FINANCE_CONTEXT.effectiveAvailable)}`
                : "Use whole shillings; minimum KES 100."
            }
          >
            <TextInput
              value={amount}
              type="number"
              min="100"
              onChange={setAmount}
              placeholder="e.g. 10000"
            />
          </Field>
          <div className="d-flex flex-wrap gap-2">
            {[500, 1000, 5000, 10000].map((quick) => (
              <button
                type="button"
                className="gm-filter-chip"
                key={quick}
                onClick={() => setAmount(String(quick))}
              >
                {kes(quick)}
              </button>
            ))}
          </div>
          <div className="gm-check-row">
            <LockKeyhole />
            <span>
              <strong>Secure confirmation</strong>
              <small>
                We will ask for a one-time code and your four-digit farm PIN.
                Never share a real PIN in a demo.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={onClose}
            onNext={next}
            nextLabel="Send OTP"
            nextDisabled={
              numericAmount < 100 ||
              (isWithdraw && numericAmount > FINANCE_CONTEXT.effectiveAvailable)
            }
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-wizard-stack">
          <div className="text-center">
            <span className="gm-mega-icon">
              <Smartphone />
            </span>
            <h4 className="font-display mt-2 mb-1">
              Enter the code sent to 0712 345 678
            </h4>
            <p className="text-muted">
              Kwa usalama, we have sent a six-digit code. Use{" "}
              <strong>123456</strong> in this demo.
            </p>
          </div>
          <OtpInput value={otp} onChange={setOtp} label="M-Pesa OTP" />
          <div className="d-flex justify-content-between align-items-center gap-2">
            <small className="text-muted">Code expires in 02:00</small>
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={() => setOtp("123456")}
            >
              Use demo code
            </button>
          </div>
          <WizardActions
            step={step}
            last={3}
            onBack={() => setStep(0)}
            onNext={next}
            nextLabel="Verify code"
            nextDisabled={otp.length !== 6}
          />
        </div>
      ) : step === 2 ? (
        <div className="gm-wizard-stack">
          <div className="text-center">
            <span className="gm-mega-icon">
              <LockKeyhole />
            </span>
            <h4 className="font-display mt-2 mb-1">Enter farm PIN</h4>
            <p className="text-muted">
              Confirm {kes(numericAmount)} for {purpose}.
            </p>
          </div>
          {processing ? (
            <div className="gm-processing">
              <LoaderCircle className="gm-spin" />
              <strong>Confirming with M-Pesa…</strong>
              <small>
                We will retry within the 30-second timeout window if the network
                pauses.
              </small>
            </div>
          ) : (
            <PinPad
              onComplete={verifyPin}
              actionLabel="Demo PIN: tap any four digits"
              resetKey={step}
            />
          )}
          {!processing ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline w-100 mt-3"
              onClick={() => setStep(1)}
            >
              Back to OTP
            </button>
          ) : null}
        </div>
      ) : (
        <SuccessState
          title={
            isDeposit
              ? "Money added"
              : isWithdraw
                ? "Money sent"
                : "Payment confirmed"
          }
          body={`${kes(numericAmount)} ${isDeposit ? "is now available in your GrowMO wallet." : isWithdraw ? "has been sent to 0712 345 678." : `has been paid for ${purpose}.`}`}
          receipt={receipt}
          actionLabel="Update my finance records"
          onDone={() => {
            onComplete(numericAmount, receipt);
            onClose();
          }}
        />
      )}
    </Dialog>
  );
}

const newBudget = (): FinancialBudget => ({
  id: `bud-new-${Date.now()}`,
  name: "",
  crop: "Cabbage Gloria F1",
  plot: "Plot 1 · 0.5 acre",
  season: FINANCE_CONTEXT.season,
  total: 56000,
  spent: 0,
  startDate: "13 Nov 2026",
  endDate: "31 Jan 2027",
  status: "Future",
  alertAt: 90,
  note: "Reserve enough for inputs, labour and transport.",
});

export function BudgetWizard({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing?: FinancialBudget | null;
  onClose: () => void;
  onSave: (budget: FinancialBudget) => void;
}) {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<FinancialBudget>(newBudget);
  const [template, setTemplate] = useState("Custom plan");
  const steps = ["Plan details", "Guardrails", "Review"];
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setBudget(editing ? { ...editing } : newBudget());
    setTemplate(editing ? "Custom plan" : "Cabbage 0.5 acre");
  }, [open, editing]);
  const update = <K extends keyof FinancialBudget>(
    key: K,
    value: FinancialBudget[K],
  ) => setBudget((current) => ({ ...current, [key]: value }));
  const loadTemplate = (name: string) => {
    setTemplate(name);
    const picked = BUDGET_TEMPLATES.find((item) => item.name === name);
    if (picked)
      setBudget((current) => ({
        ...current,
        name: `${picked.name} — ${FINANCE_CONTEXT.season}`,
        crop: picked.crop,
        total: picked.total,
      }));
  };
  const canNext =
    step === 0
      ? Boolean(budget.name && budget.crop && budget.total > 0)
      : step === 1
        ? budget.alertAt >= 50 && budget.alertAt <= 100
        : true;
  const finish = () => {
    onSave({
      ...budget,
      spent: editing?.spent ?? 0,
      status: editing?.status ?? "Future",
    });
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Adjust budget plan" : "Create a crop budget"}
      desc="Panga pesa kabla ya kupanda — the budget remains linked to this crop and plot."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-wizard-stack">
          <Field label="Start from a template">
            <SelectInput
              value={template}
              onChange={loadTemplate}
              options={[
                "Custom plan",
                ...BUDGET_TEMPLATES.map((item) => item.name),
              ]}
            />
          </Field>
          <div className="row g-3">
            <div className="col-md-8">
              <Field label="Budget name">
                <TextInput
                  value={budget.name}
                  onChange={(value) => update("name", value)}
                  placeholder="Cabbage Season SR 2026 — Plot 1"
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Total budget (KES)">
                <TextInput
                  value={budget.total}
                  type="number"
                  min="1"
                  onChange={(value) => update("total", Number(value) || 0)}
                />
              </Field>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Linked crop">
                <SelectInput
                  value={budget.crop}
                  onChange={(value) => update("crop", value)}
                  options={FINANCE_CROPS.filter((crop) => crop !== "None")}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Plot">
                <TextInput
                  value={budget.plot}
                  onChange={(value) => update("plot", value)}
                  placeholder="Plot 1 · 0.5 acre"
                />
              </Field>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Start date">
                <TextInput
                  value={budget.startDate}
                  onChange={(value) => update("startDate", value)}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="End date">
                <TextInput
                  value={budget.endDate}
                  onChange={(value) => update("endDate", value)}
                />
              </Field>
            </div>
          </div>
          <Field label="Plan note">
            <textarea
              className="gm-input"
              rows={3}
              value={budget.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextDisabled={!canNext}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-wizard-stack">
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>Wallet guardrails</strong>
              <small>
                Set the alert before this crop budget runs low. GrowMO will flag
                a category before payment.
              </small>
            </span>
          </div>
          <Field label="Alert me when budget spend reaches (%)">
            <TextInput
              value={budget.alertAt}
              type="number"
              min="50"
              onChange={(value) => update("alertAt", Number(value) || 90)}
            />
          </Field>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="gm-kpi-soft">
                <small>Planned</small>
                <strong className="font-display">{kes(budget.total)}</strong>
                <span>
                  from {budget.startDate} to {budget.endDate}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="gm-kpi-soft">
                <small>Wallet source</small>
                <strong className="font-display">GrowMO wallet</strong>
                <span>Allocated money stays ring-fenced.</span>
              </div>
            </div>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={!canNext}
          />
        </div>
      ) : (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <ReviewRow label="Budget" value={budget.name} />
            <ReviewRow
              label="Crop / plot"
              value={`${budget.crop} · ${budget.plot}`}
            />
            <ReviewRow label="Amount" value={kes(budget.total)} />
            <ReviewRow
              label="Dates"
              value={`${budget.startDate} → ${budget.endDate}`}
            />
            <ReviewRow label="Alert" value={`${budget.alertAt}% spent`} />
          </div>
          <div className="gm-check-row">
            <WalletCards />
            <span>
              <strong>Next step</strong>
              <small>
                After saving, open category allocation to split this budget into
                land prep, inputs, labour and harvest.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={finish}
            finishLabel={editing ? "Save budget changes" : "Create budget"}
          />
        </div>
      )}
    </Dialog>
  );
}

export function BudgetCategoryDialog({
  open,
  category,
  onClose,
  onSave,
}: {
  open: boolean;
  category: {
    id: string;
    category: string;
    allocated: number;
    spent: number;
    note: string;
    status: BudgetStatus;
  } | null;
  onClose: () => void;
  onSave: (category: {
    id: string;
    category: string;
    allocated: number;
    spent: number;
    note: string;
    status: BudgetStatus;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [allocated, setAllocated] = useState("0");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open && category) {
      setName(category.category);
      setAllocated(String(category.allocated));
      setNote(category.note);
    }
  }, [open, category]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Adjust budget category"
      desc="Change the envelope, not the history."
    >
      <div className="gm-wizard-stack">
        <Field label="Category">
          <TextInput value={name} onChange={setName} />
        </Field>
        <Field label="Allocated (KES)">
          <TextInput
            value={allocated}
            type="number"
            min="0"
            onChange={setAllocated}
          />
        </Field>
        <Field label="Note">
          <textarea
            className="gm-input"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
        <div className="gm-check-row">
          <AlertTriangle />
          <span>
            <strong>Spent so far is protected</strong>
            <small>
              {category ? kes(category.spent) : "KES 0"} remains in the ledger;
              only the future allocation changes.
            </small>
          </span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          disabled={!name}
          onClick={() => {
            if (category)
              onSave({
                ...category,
                category: name,
                allocated: Number(allocated) || 0,
                note,
              });
            onClose();
          }}
        >
          Save allocation
        </button>
      </div>
    </Dialog>
  );
}

const emptyExpense = (
  defaultBudgetId: string | null,
  payee: string,
): ExpenseRecord => ({
  id: `exp-new-${Date.now()}`,
  date: FINANCE_CONTEXT.today,
  description: "",
  category: "Inputs",
  subCategory: "Fertilizer",
  crop: "Cabbage Gloria F1",
  budgetId: defaultBudgetId,
  amount: 0,
  method: "GrowMO wallet",
  payee,
  receipt: null,
  status: "Pending",
  receiptPhoto: false,
  notes: "",
});

export function ExpenseWizard({
  open,
  defaultBudgetId,
  selectedPayee,
  onClose,
  onSave,
}: {
  open: boolean;
  defaultBudgetId: string | null;
  selectedPayee?: string;
  onClose: () => void;
  onSave: (expense: ExpenseRecord) => void;
}) {
  const [step, setStep] = useState(0);
  const [expense, setExpense] = useState<ExpenseRecord>(
    emptyExpense(defaultBudgetId, selectedPayee ?? "Githunguri Agro-vet"),
  );
  const steps = ["Details", "Link", "Review"];
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setExpense(
      emptyExpense(defaultBudgetId, selectedPayee ?? "Githunguri Agro-vet"),
    );
  }, [open, defaultBudgetId, selectedPayee]);
  const update = <K extends keyof ExpenseRecord>(
    key: K,
    value: ExpenseRecord[K],
  ) => setExpense((current) => ({ ...current, [key]: value }));
  const canNext =
    step === 0
      ? Boolean(expense.description && expense.amount > 0 && expense.payee)
      : true;
  const finish = () => {
    onClose();
    onSave({
      ...expense,
      status: expense.method === "GrowMO wallet" ? "Pending" : "Paid",
    });
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Record an expense"
      desc="Andika matumizi — every shilling gets a crop, category and payment trail."
      wide
    >
      <Stepper steps={steps} current={step} />
      {step === 0 ? (
        <div className="gm-wizard-stack">
          <div className="row g-3">
            <div className="col-md-8">
              <Field label="Description">
                <TextInput
                  value={expense.description}
                  onChange={(value) => update("description", value)}
                  placeholder="CAN 50kg — one bag"
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Amount (KES)">
                <TextInput
                  value={expense.amount}
                  type="number"
                  min="1"
                  onChange={(value) => update("amount", Number(value) || 0)}
                />
              </Field>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Category">
                <SelectInput
                  value={expense.category}
                  onChange={(value) => update("category", value)}
                  options={EXPENSE_CATEGORIES}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Sub-category">
                <SelectInput
                  value={expense.subCategory}
                  onChange={(value) => update("subCategory", value)}
                  options={EXPENSE_SUBCATEGORIES}
                />
              </Field>
            </div>
          </div>
          <Field label="Supplier / payee">
            <TextInput
              value={expense.payee}
              onChange={(value) => update("payee", value)}
              placeholder="Githunguri Agro-vet"
            />
          </Field>
          <Field label="Date">
            <TextInput
              value={expense.date}
              onChange={(value) => update("date", value)}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextDisabled={!canNext}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-wizard-stack">
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Linked crop">
                <SelectInput
                  value={expense.crop}
                  onChange={(value) => update("crop", value)}
                  options={FINANCE_CROPS}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Linked budget">
                <SelectInput
                  value={expense.budgetId ?? "None"}
                  onChange={(value) =>
                    update("budgetId", value === "None" ? null : value)
                  }
                  options={[
                    "None",
                    "bud-cabbage",
                    "bud-maize",
                    "bud-tomato",
                    "bud-beans",
                  ]}
                />
              </Field>
            </div>
          </div>
          <Field label="Payment method">
            <SelectInput
              value={expense.method}
              onChange={(value) => update("method", value as ExpenseMethod)}
              options={["Cash", "Manual M-Pesa", "GrowMO wallet"]}
            />
          </Field>
          <Field label="M-Pesa receipt code" hint="Optional for manual entries">
            <TextInput
              value={expense.receipt ?? ""}
              onChange={(value) => update("receipt", value || null)}
              placeholder="e.g. SHK4RT9"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="gm-input"
              rows={3}
              value={expense.notes}
              onChange={(event) => update("notes", event.target.value)}
              placeholder="What was bought and where it went"
            />
          </Field>
          <label className="gm-check-row">
            <input
              type="checkbox"
              checked={expense.receiptPhoto}
              onChange={(event) => update("receiptPhoto", event.target.checked)}
            />
            <span>
              <strong>Receipt photo attached</strong>
              <small>Store a visual copy with this record.</small>
            </span>
          </label>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <ReviewRow label="Expense" value={expense.description} />
            <ReviewRow label="Amount" value={kes(expense.amount)} />
            <ReviewRow
              label="Category"
              value={`${expense.category} · ${expense.subCategory}`}
            />
            <ReviewRow label="Crop" value={expense.crop} />
            <ReviewRow label="Payment" value={expense.method} />
            <ReviewRow label="Payee" value={expense.payee} />
          </div>
          {expense.method === "GrowMO wallet" ? (
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>M-Pesa confirmation follows</strong>
                <small>
                  Save the expense first, then confirm the wallet payment with
                  OTP and PIN.
                </small>
              </span>
            </div>
          ) : (
            <div className="gm-check-row">
              <ReceiptText />
              <span>
                <strong>Manual record</strong>
                <small>
                  This entry will immediately appear as paid; attach the real
                  receipt code if available.
                </small>
              </span>
            </div>
          )}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={finish}
            finishLabel="Save expense"
          />
        </div>
      )}
    </Dialog>
  );
}

const emptyIncome = (): IncomeRecord => ({
  id: `inc-new-${Date.now()}`,
  date: FINANCE_CONTEXT.today,
  source: "",
  crop: "Cabbage Gloria F1",
  quantity: 0,
  unit: "heads",
  unitPrice: 0,
  total: 0,
  method: "M-Pesa",
  buyer: "",
  status: "Received",
  receipt: null,
  note: "",
});

export function IncomeWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (income: IncomeRecord) => void;
}) {
  const [step, setStep] = useState(0);
  const [income, setIncome] = useState<IncomeRecord>(emptyIncome);
  useEffect(() => {
    if (open) {
      setStep(0);
      setIncome(emptyIncome());
    }
  }, [open]);
  const update = <K extends keyof IncomeRecord>(
    key: K,
    value: IncomeRecord[K],
  ) => setIncome((current) => ({ ...current, [key]: value }));
  const calculated = income.quantity * income.unitPrice;
  const canNext =
    step === 0
      ? Boolean(
          income.source &&
            income.buyer &&
            income.quantity > 0 &&
            income.unitPrice > 0,
        )
      : true;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Record farm income"
      desc="Mapato yote ya shamba — sales, milk and buyer deposits."
      wide
    >
      <Stepper
        steps={["Sale details", "Settlement", "Review"]}
        current={step}
      />
      {step === 0 ? (
        <div className="gm-wizard-stack">
          <div className="row g-3">
            <div className="col-md-8">
              <Field label="Source">
                <TextInput
                  value={income.source}
                  onChange={(value) => update("source", value)}
                  placeholder="Cabbage sale — Marikiti"
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Date">
                <TextInput
                  value={income.date}
                  onChange={(value) => update("date", value)}
                />
              </Field>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <Field label="Crop / enterprise">
                <SelectInput
                  value={income.crop}
                  onChange={(value) => update("crop", value)}
                  options={FINANCE_CROPS.filter((crop) => crop !== "None")}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Buyer">
                <TextInput
                  value={income.buyer}
                  onChange={(value) => update("buyer", value)}
                  placeholder="Marikiti broker"
                />
              </Field>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-md-4">
              <Field label="Quantity">
                <TextInput
                  value={income.quantity}
                  type="number"
                  min="1"
                  onChange={(value) => update("quantity", Number(value) || 0)}
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Unit">
                <TextInput
                  value={income.unit}
                  onChange={(value) => update("unit", value)}
                  placeholder="heads"
                />
              </Field>
            </div>
            <div className="col-md-4">
              <Field label="Unit price (KES)">
                <TextInput
                  value={income.unitPrice}
                  type="number"
                  min="1"
                  onChange={(value) => update("unitPrice", Number(value) || 0)}
                />
              </Field>
            </div>
          </div>
          <div className="gm-check-row">
            <ArrowUpRight />
            <span>
              <strong>Calculated total</strong>
              <small>
                {income.quantity || 0} {income.unit} ×{" "}
                {kes(income.unitPrice || 0)}
              </small>
            </span>
            <strong className="font-display">{kes(calculated)}</strong>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => {
              update("total", calculated);
              setStep(1);
            }}
            nextDisabled={!canNext}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-wizard-stack">
          <Field label="Payment method">
            <SelectInput
              value={income.method}
              onChange={(value) => update("method", value as IncomeMethod)}
              options={["M-Pesa", "Cash", "Bank"]}
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={income.status}
              onChange={(value) =>
                update("status", value as IncomeRecord["status"])
              }
              options={["Received", "Pending", "Future"]}
            />
          </Field>
          <Field label="Receipt / reference">
            <TextInput
              value={income.receipt ?? ""}
              onChange={(value) => update("receipt", value || null)}
              placeholder="e.g. QJK3L5X7YZ"
            />
          </Field>
          <Field label="Note">
            <textarea
              className="gm-input"
              rows={3}
              value={income.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <ReviewRow label="Sale" value={income.source} />
            <ReviewRow label="Buyer" value={income.buyer} />
            <ReviewRow
              label="Quantity"
              value={`${income.quantity} ${income.unit}`}
            />
            <ReviewRow label="Total" value={kes(calculated)} />
            <ReviewRow
              label="Settlement"
              value={`${income.method} · ${income.status}`}
            />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave({ ...income, total: calculated });
              onClose();
            }}
            finishLabel="Save income"
          />
        </div>
      )}
    </Dialog>
  );
}

export function AutoPayRuleWizard({
  open,
  editing,
  onClose,
  onSave,
}: {
  open: boolean;
  editing?: AutoPayRule | null;
  onClose: () => void;
  onSave: (rule: AutoPayRule) => void;
}) {
  const [step, setStep] = useState(0);
  const [rule, setRule] = useState<AutoPayRule>({
    id: `rule-new-${Date.now()}`,
    name: "",
    trigger: "",
    action: "",
    amount: "Per task rate",
    status: "Active",
    lastRun: "Never",
    note: "",
  });
  useEffect(() => {
    if (open) {
      setStep(0);
      setRule(
        editing
          ? { ...editing }
          : {
              id: `rule-new-${Date.now()}`,
              name: "",
              trigger: "",
              action: "",
              amount: "Per task rate",
              status: "Active",
              lastRun: "Never",
              note: "",
            },
      );
    }
  }, [open, editing]);
  const update = <K extends keyof AutoPayRule>(key: K, value: AutoPayRule[K]) =>
    setRule((current) => ({ ...current, [key]: value }));
  const canNext = Boolean(rule.name && rule.trigger && rule.action);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit auto-pay rule" : "Create an auto-pay rule"}
      desc="Automate carefully; every rule can be paused before money moves."
    >
      <Stepper steps={["Trigger", "Action", "Review"]} current={step} />
      {step === 0 ? (
        <div className="gm-wizard-stack">
          <Field label="Rule name">
            <TextInput
              value={rule.name}
              onChange={(value) => update("name", value)}
              placeholder="Weekly labour settlement"
            />
          </Field>
          <Field label="When should it run?">
            <TextInput
              value={rule.trigger}
              onChange={(value) => update("trigger", value)}
              placeholder="Every Friday · 5:00 PM"
            />
          </Field>
          <Field label="Amount basis">
            <SelectInput
              value={rule.amount}
              onChange={(value) => update("amount", value)}
              options={["Per task rate", "Sum of tasks", "20%", "Per expense"]}
            />
          </Field>
          <WizardActions
            step={step}
            last={2}
            onBack={onClose}
            onNext={() => setStep(1)}
            nextDisabled={!canNext}
          />
        </div>
      ) : step === 1 ? (
        <div className="gm-wizard-stack">
          <Field label="Action">
            <TextInput
              value={rule.action}
              onChange={(value) => update("action", value)}
              placeholder="Pay all unpaid tasks for the week"
            />
          </Field>
          <Field label="Status">
            <SelectInput
              value={rule.status}
              onChange={(value) =>
                update("status", value as AutoPayRule["status"])
              }
              options={["Active", "Paused"]}
            />
          </Field>
          <Field label="Safeguard note">
            <textarea
              className="gm-input"
              rows={3}
              value={rule.note}
              onChange={(event) => update("note", event.target.value)}
              placeholder="Require a review before a large payment."
            />
          </Field>
          <div className="gm-check-row">
            <ShieldCheck />
            <span>
              <strong>PIN protection remains on</strong>
              <small>
                Large expenses still require the farm PIN even when this rule is
                active.
              </small>
            </span>
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        </div>
      ) : (
        <div className="gm-wizard-stack">
          <div className="gm-review-card">
            <ReviewRow label="Rule" value={rule.name} />
            <ReviewRow label="Trigger" value={rule.trigger} />
            <ReviewRow label="Action" value={rule.action} />
            <ReviewRow label="State" value={rule.status} />
          </div>
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep(1)}
            onNext={() => {
              onSave(rule);
              onClose();
            }}
            finishLabel="Save rule"
          />
        </div>
      )}
    </Dialog>
  );
}

export function ConfirmFinanceDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive = false,
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
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      desc="This action changes your finance records."
    >
      <div className="gm-wizard-stack">
        <div className={`gm-alert-box ${destructive ? "is-danger" : ""}`}>
          <AlertTriangle />
          <p>{body}</p>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`gm-btn ${destructive ? "gm-btn-danger" : "gm-btn-lime"}`}
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

export function CashFlowAssumptionsDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (assumptions: {
    reserve: number;
    price: number;
    costs: number;
  }) => void;
}) {
  const [reserve, setReserve] = useState("20");
  const [price, setPrice] = useState("30");
  const [costs, setCosts] = useState("5");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cash flow assumptions"
      desc="Badili makadirio — see how a different price or cost changes runway."
    >
      <div className="gm-wizard-stack">
        <Field label="Reserve income for next season (%)">
          <TextInput
            value={reserve}
            type="number"
            min="0"
            onChange={setReserve}
          />
        </Field>
        <Field label="Expected cabbage price per head (KES)">
          <TextInput value={price} type="number" min="1" onChange={setPrice} />
        </Field>
        <Field label="Unexpected cost buffer (%)">
          <TextInput value={costs} type="number" min="0" onChange={setCosts} />
        </Field>
        <div className="gm-check-row">
          <Sparkles />
          <span>
            <strong>GrowMO will refresh your runway</strong>
            <small>
              The projection is a planning aid; confirm buyer prices before
              committing cash.
            </small>
          </span>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={() => {
            onSave({
              reserve: Number(reserve) || 0,
              price: Number(price) || 0,
              costs: Number(costs) || 0,
            });
            onClose();
          }}
        >
          Refresh forecast
        </button>
      </div>
    </Dialog>
  );
}

export function PnlExportDialog({
  open,
  crop,
  onClose,
  onExport,
}: {
  open: boolean;
  crop: string;
  onClose: () => void;
  onExport: (format: "csv" | "txt") => void;
}) {
  const [format, setFormat] = useState<"csv" | "txt">("csv");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export profit & loss"
      desc="Download a clean copy for your records or SACCO review."
    >
      <div className="gm-wizard-stack">
        <div className="gm-check-row">
          <FileText />
          <span>
            <strong>{crop}</strong>
            <small>Revenue, production cost, variance, ROI and notes.</small>
          </span>
        </div>
        <Field label="File format">
          <SelectInput
            value={format}
            onChange={(value) => setFormat(value as "csv" | "txt")}
            options={["csv", "txt"]}
          />
        </Field>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={() => {
            onExport(format);
            onClose();
          }}
        >
          <Download /> Download P&amp;L
        </button>
      </div>
    </Dialog>
  );
}

export function FinancialSettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: FinancialSettings;
  onClose: () => void;
  onSave: (settings: FinancialSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Finance settings"
      desc="Set alerts and payment guardrails for Wanjiku Mixed Farm."
    >
      <div className="gm-wizard-stack">
        <Toggle
          checked={draft.lowBalanceAlert}
          onChange={(value) =>
            setDraft((current) => ({ ...current, lowBalanceAlert: value }))
          }
          label="Low balance alert"
          desc="Warn me when effective available falls below KES 10,000."
        />
        <Toggle
          checked={draft.budgetAlerts}
          onChange={(value) =>
            setDraft((current) => ({ ...current, budgetAlerts: value }))
          }
          label="Budget alerts"
          desc="Notify when a category reaches its alert percentage."
        />
        <Toggle
          checked={draft.smsReceipts}
          onChange={(value) =>
            setDraft((current) => ({ ...current, smsReceipts: value }))
          }
          label="SMS receipts"
          desc="Send confirmation references to 0712 345 678."
        />
        <Field label="Next-season reserve (%)">
          <TextInput
            value={draft.reservePercentage}
            type="number"
            min="0"
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                reservePercentage: Number(value) || 0,
              }))
            }
          />
        </Field>
        <Field label="Require PIN above (KES)">
          <TextInput
            value={draft.requirePinAbove}
            type="number"
            min="0"
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                requirePinAbove: Number(value) || 0,
              }))
            }
          />
        </Field>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={() => {
            onSave(draft);
            onClose();
          }}
        >
          Save settings
        </button>
      </div>
    </Dialog>
  );
}

export function PayeePickerDialog({
  open,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (payee: FinancialPayee) => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);
  const matches = useMemo(
    () =>
      FINANCIAL_PAYEES.filter((payee) =>
        `${payee.name} ${payee.type} ${payee.phone}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose a payee"
      desc="Select a known supplier, worker or buyer to keep names consistent."
    >
      <div className="gm-wizard-stack">
        <div className="gm-search-wrap">
          <Search />
          <input
            className="gm-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, type or phone"
          />
        </div>
        <div className="gm-payee-list">
          {matches.map((payee) => (
            <button
              type="button"
              className={`gm-check-row ${selected === payee.name ? "is-checked" : ""}`}
              key={payee.id}
              onClick={() => {
                onSelect(payee);
                onClose();
              }}
            >
              <span className="gm-avatar">
                {payee.name
                  .split(" ")
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <strong>{payee.name}</strong>
                <small>
                  {payee.type} · {payee.phone} · last paid {payee.lastPaid}
                </small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </div>
        {matches.length === 0 ? (
          <p className="text-muted text-center mb-0">
            No matching payee. Record a new name in the expense form.
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

export function PortfolioDialog({
  open,
  crop,
  onClose,
}: {
  open: boolean;
  crop: {
    crop: string;
    acreage: string;
    budget: number;
    spent: number;
    revenue: number;
    profit: number;
    roi: number;
    status: string;
  } | null;
  onClose: () => void;
}) {
  if (!crop) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`${crop.crop} finance detail`}
      desc={`${crop.acreage} · full-season contribution to the farm portfolio.`}
      wide
    >
      <div className="row g-3">
        <div className="col-md-3">
          <div className="gm-kpi-soft">
            <small>Budget</small>
            <strong className="font-display">{kes(crop.budget)}</strong>
            <span>planned</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="gm-kpi-soft">
            <small>Spent</small>
            <strong className="font-display">{kes(crop.spent)}</strong>
            <span>ledger</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="gm-kpi-soft">
            <small>Revenue</small>
            <strong className="font-display">{kes(crop.revenue)}</strong>
            <span>sales / forecast</span>
          </div>
        </div>
        <div className="col-md-3">
          <div className="gm-kpi-soft">
            <small>ROI</small>
            <strong className="font-display">{crop.roi}%</strong>
            <span>{crop.status}</span>
          </div>
        </div>
      </div>
      <div className="gm-check-row mt-3">
        <WalletCards />
        <span>
          <strong>
            {crop.profit >= 0
              ? "Mavuno mazuri — profitable"
              : "Review this crop before more spend"}
          </strong>
          <small>
            {crop.profit >= 0
              ? `${kes(crop.profit)} projected profit after spend.`
              : `${kes(Math.abs(crop.profit))} projected loss; compare input and buyer assumptions.`}
          </small>
        </span>
        <StatusChip
          label={crop.profit >= 0 ? "Positive" : "Watch"}
          tone={crop.profit >= 0 ? "low" : "high"}
        />
      </div>
      <button
        type="button"
        className="gm-btn gm-btn-outline w-100 mt-3"
        onClick={onClose}
      >
        Close portfolio detail
      </button>
    </Dialog>
  );
}

export function BudgetAlertDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Budget alerts"
      desc="Alerts are here to guide decisions, not to shame a hard season."
    >
      <div className="gm-wizard-stack">
        <div className="gm-alert-box is-danger">
          <AlertTriangle />
          <p>
            <strong>Seeds &amp; nursery is KES 200 over budget.</strong>
            <br />
            Seed price was higher than the original estimate. Adjust the
            category or note the variance.
          </p>
        </div>
        <div className="gm-alert-box">
          <Sparkles />
          <p>
            <strong>Fertilizer is on track.</strong>
            <br />
            CAN purchase of KES 5,000 is due in one week; keep KES 5,750 in the
            envelope.
          </p>
        </div>
        <div className="gm-alert-box is-success">
          <CheckCircle2 />
          <p>
            <strong>Labour pace is healthy.</strong>
            <br />
            Only 43% is spent with 66% of the season remaining.
          </p>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={onClose}
        >
          I understand
        </button>
      </div>
    </Dialog>
  );
}

export function WalletActivityDialog({
  open,
  activity,
  onClose,
}: {
  open: boolean;
  activity: WalletActivity | null;
  onClose: () => void;
}) {
  if (!activity) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Wallet transaction"
      desc="A complete view of this simulated ledger event."
    >
      <div className="gm-wizard-stack">
        <div className="gm-check-row">
          <span
            className={`gm-finance-activity-icon ${activity.kind === "In" ? "is-in" : "is-out"}`}
          >
            {activity.kind === "In" ? <ArrowDownLeft /> : <ArrowUpRight />}
          </span>
          <span>
            <strong>{activity.description}</strong>
            <small>
              {activity.time} · {activity.category}
            </small>
          </span>
          <strong className="font-display">
            {activity.kind === "In" ? "+" : "−"}
            {kes(activity.amount)}
          </strong>
        </div>
        <div className="gm-review-card">
          <ReviewRow label="Balance after" value={kes(activity.balanceAfter)} />
          <ReviewRow label="Status" value={activity.status} />
          <ReviewRow
            label="M-Pesa receipt"
            value={activity.receipt ?? "Manual / no code"}
          />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close transaction
        </button>
      </div>
    </Dialog>
  );
}

export function ReceiptDialog({
  open,
  receipt,
  title = "Payment receipt",
  onClose,
}: {
  open: boolean;
  receipt: {
    reference: string;
    amount: number;
    recipient: string;
    date: string;
  } | null;
  title?: string;
  onClose: () => void;
}) {
  if (!receipt) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      desc="Keep this reference for your farm records."
    >
      <div className="gm-wizard-stack">
        <div className="gm-receipt-card">
          <ReceiptText />
          <span>
            <small>GrowMO M-Pesa reference</small>
            <strong>{receipt.reference}</strong>
          </span>
        </div>
        <div className="gm-review-card">
          <ReviewRow label="Amount" value={kes(receipt.amount)} />
          <ReviewRow label="Recipient / payee" value={receipt.recipient} />
          <ReviewRow label="Date" value={receipt.date} />
          <ReviewRow label="Status" value="Confirmed" />
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime w-100"
          onClick={onClose}
        >
          Close receipt
        </button>
      </div>
    </Dialog>
  );
}
