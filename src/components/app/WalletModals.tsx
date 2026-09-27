/* ============================================================================
   PAGE 14 — WALLET modals & wizards
   Every wizard follows the GrowMO money flow:
   amount → review → M-Pesa OTP 123456 / wallet PIN → processing → receipt.
   ========================================================================== */
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  Check,
  CheckCircle2,
  Download,
  FileCheck,
  Loader2,
  Plus,
  Share2,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type {
  AutoPayRule,
  DepositMethod,
  PayoutChannelId,
  PayoutLine,
  PayType,
  Recipient,
  Txn,
  WalletBudget,
} from "../../data/app/wallet";
import {
  BANK_OPTIONS,
  BILLERS,
  CASH_RECEIPT_MODES,
  PAYOUT_CHANNELS,
  PAYOUT_PURPOSES,
  SCHEDULE_PRESETS,
  WALLET_CONTEXT,
  WALLET_FAQ,
  WALLET_GLOSSARY,
  WALLET_SETTINGS_ROWS,
} from "../../data/app/wallet";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";
import { PayeeChip, PayoutLineRow, PayoutTotalBar, payoutInitials, WalletCallout, WalletFaqList, WalletGlossary, WalletKv } from "./WalletWidgets";

function code(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = `${prefix}-`;
  for (let i = 0; i < 7; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function Processing({ label }: { label: string }) {
  return (
    <div className="gm-w-processing">
      <Loader2 className="spin" />
      <p>{label}</p>
    </div>
  );
}

export function ReceiptBlock({ title, amount, receipt, note }: { title: string; amount: number; receipt: string; note?: string }) {
  return (
    <div className="gm-w-receipt-block">
      <span className="gm-w-receipt-mark">
        <CheckCircle2 />
      </span>
      <h3 className="font-display">{title}</h3>
      <p className="gm-w-receipt-amount">{kes(amount)}</p>
      <div className="gm-code-chip">{receipt}</div>
      {note ? <p className="gm-w-receipt-note">{note}</p> : null}
    </div>
  );
}

/* ---------------- 14.2 Deposit ---------------- */
export function DepositWizard({
  open,
  method,
  methods,
  onClose,
  onCompleted,
}: {
  open: boolean;
  method: string;
  methods: DepositMethod[];
  onClose: () => void;
  onCompleted: (amount: number, receipt: string, methodName: string) => void;
}) {
  const active = methods.find((m) => m.id === method) ?? methods[0];
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(1000);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAmount(1000);
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open, method]);

  const fee = Math.round(amount * active.feeRate) + active.flatFee;
  const credited = amount - fee;
  const steps = ["Amount", "Review", "Authorise"];

  return (
    <Dialog open={open} onClose={onClose} title={`Deposit via ${active.name}`} desc={`${active.speed} · ${active.fee} · ${kes(active.min)} – ${kes(active.max)}`} wide>
      <Stepper steps={steps} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipt ? (
        <>
          <ReceiptBlock title="Wallet credited" amount={amount} receipt={receipt} note={`${active.name} · ${WALLET_CONTEXT.accountNo} · SMS receipt sent to ${WALLET_CONTEXT.phone}`} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Processing label={`Waiting for ${active.id === "bank" ? "bank confirmation" : "M-Pesa confirmation"}…`} />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-w-wizard">
              <label className="gm-field">
                <span>Amount to deposit (KES)</span>
                <input className="gm-input" type="number" min={active.min} max={active.max} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              </label>
              <div className="gm-w-quick-amounts">
                {[500, 1000, 2000, 5000, 10000].map((value) => (
                  <button key={value} type="button" className={`gm-filter-chip ${amount === value ? "is-on" : ""}`} onClick={() => setAmount(value)}>
                    {kes(value)}
                  </button>
                ))}
              </div>
              <ol className="gm-w-steps">
                {active.steps.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {step === 1 ? (
            <WalletKv
              items={[
                { k: "Method", v: active.name },
                { k: "Amount", v: kes(amount) },
                { k: "Fee", v: active.fee },
                { k: "You receive", v: <strong>{kes(credited)}</strong> },
                { k: "Credits to", v: `${WALLET_CONTEXT.accountNo} · ${WALLET_CONTEXT.farmer}` },
                { k: "Speed", v: active.speed },
              ]}
            />
          ) : null}

          {step === 2 ? (
            <div className="gm-w-wizard">
              <p className="gm-w-note">
                {active.id === "stk"
                  ? `STK push sent to ${WALLET_CONTEXT.phone}. Enter your M-Pesa PIN on the handset, or type the demo code below.`
                  : active.id === "paybill"
                    ? `Pay to Paybill ${WALLET_CONTEXT.paybill}, account ${WALLET_CONTEXT.accountNumber}, then confirm here.`
                    : active.id === "bank"
                      ? `Transfer ${kes(amount)} to ${WALLET_CONTEXT.trustAccount}, reference ${WALLET_CONTEXT.accountNo}.`
                      : "Confirm the deposit with your wallet PIN to credit the balance."}
              </p>
              <OtpInput value={otp} onChange={setOtp} label="Demo OTP (123456)" />
              <p className="gm-w-note is-small">In production the code is generated by Safaricom; GrowMO never sees your M-Pesa PIN.</p>
            </div>
          ) : null}

          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep((current) => Math.max(0, current - 1))}
            nextLabel="Review"
            finishLabel="Confirm deposit"
            nextDisabled={step === 0 && (amount < active.min || amount > active.max)}
            onNext={() => {
              if (step < 2) {
                setStep((current) => current + 1);
                return;
              }
              if (otp.length < 6) return;
              setBusy(true);
              setTimeout(() => {
                const ref = code("DEP");
                setBusy(false);
                setReceipt(ref);
                onCompleted(amount, ref, active.name);
              }, 1200);
            }}
          />
        </>
      )}
    </Dialog>
  );
}

/* ---------------- 14.3 Send money ---------------- */
export function SendMoneyWizard({
  open,
  presets,
  payTypes,
  quick,
  onClose,
  onCompleted,
}: {
  open: boolean;
  presets: { type?: string; recipient?: string; amount?: number };
  payTypes: PayType[];
  quick: Recipient[];
  onClose: () => void;
  onCompleted: (payload: { amount: number; receipt: string; to: string; type: string; memo: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState(presets.type ?? "b2c");
  const [recipient, setRecipient] = useState<Recipient | null>(quick.find((r) => r.name === presets.recipient) ?? null);
  const [manual, setManual] = useState("");
  const [amount, setAmount] = useState(presets.amount ?? 500);
  const [memo, setMemo] = useState("");
  const [bank, setBank] = useState(BANK_OPTIONS[0]);
  const [biller, setBiller] = useState(BILLERS[0].id);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setType(presets.type ?? "b2c");
    setRecipient(quick.find((r) => r.name === presets.recipient) ?? null);
    setManual("");
    setAmount(presets.amount ?? 500);
    setMemo("");
    setBusy(false);
    setReceipt(null);
  }, [open, presets, quick]);

  const active = payTypes.find((p) => p.id === type) ?? payTypes[0];
  const target = recipient?.name ?? manual ?? "";
  const destination = type === "bank" ? `${bank} · ${target}` : type === "bill" ? `${BILLERS.find((b) => b.id === biller)?.name} · ${target}` : target;
  const steps = ["What for", "Who to", "How much", "Authorise"];
  const needsSecondPin = amount > 5000;

  return (
    <Dialog open={open} onClose={onClose} title="Send money / pay" desc={active.hint} wide>
      <Stepper steps={steps} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipt ? (
        <>
          <ReceiptBlock
            title={amount > 5000 ? "Payment released after second PIN" : "Payment sent"}
            amount={amount}
            receipt={receipt}
            note={`${destination} · ${active.label} · SMS confirmation sent to ${WALLET_CONTEXT.phone}`}
          />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Processing label="Talking to M-Pesa Daraja…" />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-w-paytype-grid">
              {payTypes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`gm-w-paytype ${option.id === type ? "is-on" : ""}`}
                  onClick={() => setType(option.id)}
                >
                  <span className="gm-w-method-ic">{option.icon}</span>
                  <strong>{option.label}</strong>
                  <small>{option.recipientLabel}</small>
                </button>
              ))}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gm-w-wizard">
              <div className="gm-w-recipient-grid">
                {quick.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    className={`gm-w-recipient ${recipient?.id === person.id ? "is-on" : ""}`}
                    onClick={() => setRecipient(person)}
                  >
                    <span className="gm-ava">{person.avatar}</span>
                    <span className="gm-w-recipient-copy">
                      <strong>{person.name}</strong>
                      <small>
                        {person.role} · {person.phone}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
              {type === "bank" ? (
                <label className="gm-field">
                  <span>Bank</span>
                  <select className="gm-select" value={bank} onChange={(event) => setBank(event.target.value)}>
                    {BANK_OPTIONS.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              {type === "bill" ? (
                <label className="gm-field">
                  <span>Biller</span>
                  <select className="gm-select" value={biller} onChange={(event) => setBiller(event.target.value)}>
                    {BILLERS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name} — {option.account}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label className="gm-field">
                <span>{active.recipientLabel} {recipient ? "(or type a different one)" : ""}</span>
                <input
                  className="gm-input"
                  placeholder={type === "b2b" ? "Till 452198" : "07XX XXX XXX"}
                  value={manual}
                  onChange={(event) => {
                    setManual(event.target.value);
                    setRecipient(null);
                  }}
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="gm-w-wizard">
              <label className="gm-field">
                <span>Amount (KES)</span>
                <input className="gm-input" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              </label>
              <div className="gm-w-quick-amounts">
                {[100, 500, 1000, 2500, 5000].map((value) => (
                  <button key={value} type="button" className={`gm-filter-chip ${amount === value ? "is-on" : ""}`} onClick={() => setAmount(value)}>
                    {kes(value)}
                  </button>
                ))}
              </div>
              <label className="gm-field">
                <span>Note for the receipt (optional)</span>
                <input className="gm-input" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="e.g. weeding Plot 1, 1 day" />
              </label>
              {needsSecondPin ? (
                <div className="gm-w-callout is-warn">
                  <strong>Approval rule</strong>
                  <p>Payments above KES 5,000 need a second PIN entry, as set in Wallet security.</p>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="gm-w-wizard">
              <WalletKv
                items={[
                  { k: "Paying", v: destination || "—" },
                  { k: "Channel", v: active.label },
                  { k: "Amount", v: kes(amount) },
                  { k: "Fee", v: type === "p2p" ? "Free" : type === "b2c" ? "Standard M-Pesa tariff" : "Passed to recipient profile" },
                  { k: "Reference", v: "Auto-generated receipt" },
                ]}
              />
              <p className="gm-w-note">Enter your wallet PIN. Any 4 digits work in this demo.</p>
              <PinPad onComplete={() => {
                setBusy(true);
                setTimeout(() => {
                  const ref = code("PL");
                  setBusy(false);
                  setReceipt(ref);
                  onCompleted({ amount, receipt: ref, to: destination || "Unknown recipient", type: type.toUpperCase(), memo });
                }, 1200);
              }} />
            </div>
          ) : null}

          {!busy && step < 3 ? (
            <WizardActions
              step={step}
              last={2}
              onBack={() => setStep((current) => Math.max(0, current - 1))}
              nextLabel="Continue"
              finishLabel="Review"
              nextDisabled={(step === 1 && !target) || (step === 2 && amount <= 0)}
              onNext={() => setStep((current) => Math.min(3, current + 1))}
            />
          ) : null}
          {!busy && step === 3 ? (
            <div className="d-flex justify-content-between gap-2 mt-3">
              <button type="button" className="gm-btn gm-btn-outline" onClick={() => setStep(2)}>
                Back to amount
              </button>
              <span className="gm-w-note is-small">Use the PIN pad above to authorise this payment.</span>
            </div>
          ) : null}
        </>
      )}
    </Dialog>
  );
}

/* ---------------- 14.3b Withdraw ---------------- */
export function WithdrawWizard({
  open,
  onClose,
  onCompleted,
}: {
  open: boolean;
  onClose: () => void;
  onCompleted: (amount: number, receipt: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(2000);
  const [channel, setChannel] = useState("M-Pesa agent");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAmount(2000);
    setChannel("M-Pesa agent");
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  const fee = channel === "M-Pesa agent" ? Math.round(amount * 0.008) + 15 : 50;

  return (
    <Dialog open={open} onClose={onClose} title="Withdraw from wallet" desc={`Balance ${kes(WALLET_CONTEXT.availableBalance)}`} wide>
      <Stepper steps={["Amount", "Channel", "Confirm"]} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipt ? (
        <>
          <ReceiptBlock title="Withdrawal approved" amount={amount} receipt={receipt} note={`${channel} · fee ${kes(fee)} · collect with your ID and phone`} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Processing label="Authorising withdrawal…" />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-w-wizard">
              <label className="gm-field">
                <span>Amount (KES)</span>
                <input className="gm-input" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              </label>
              <div className="gm-w-quick-amounts">
                {[1000, 2000, 5000, 10000].map((value) => (
                  <button key={value} type="button" className={`gm-filter-chip ${amount === value ? "is-on" : ""}`} onClick={() => setAmount(value)}>
                    {kes(value)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="gm-w-wizard">
              {["M-Pesa agent", "Bank transfer"].map((option) => (
                <button key={option} type="button" className={`gm-w-radio ${channel === option ? "is-on" : ""}`} onClick={() => setChannel(option)}>
                  <strong>{option}</strong>
                  <small>
                    {option === "M-Pesa agent" ? "Githunguri Agrovet or Kamau shop · 0.8% min KES 15 · instant" : "KCB / Equity / Co-op · KES 50 · by 9am next day"}
                  </small>
                </button>
              ))}
            </div>
          ) : null}
          {step === 2 ? (
            <div className="gm-w-wizard">
              <WalletKv
                items={[
                  { k: "Amount", v: kes(amount) },
                  { k: "Fee", v: kes(fee) },
                  { k: "You receive", v: <strong>{kes(amount - fee)}</strong> },
                  { k: "Channel", v: channel },
                ]}
              />
              <OtpInput value={otp} onChange={setOtp} label="Demo OTP (123456)" />
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep((current) => Math.max(0, current - 1))}
            nextLabel="Continue"
            finishLabel="Withdraw"
            nextDisabled={amount <= 0 || amount + fee > WALLET_CONTEXT.availableBalance}
            onNext={() => {
              if (step < 2) {
                setStep((current) => current + 1);
                return;
              }
              if (otp.length < 6) return;
              setBusy(true);
              setTimeout(() => {
                const ref = code("WDR");
                setBusy(false);
                setReceipt(ref);
                onCompleted(amount, ref);
              }, 1100);
            }}
          />
        </>
      )}
    </Dialog>
  );
}

/* ---------------- 14.5 detail ---------------- */
export function TxnDetailDialog({ open, t, onClose, onReversed }: { open: boolean; t: Txn | null; onClose: () => void; onReversed: (t: Txn) => void }) {
  const [busy, setBusy] = useState(false);
  useEffect(() => setBusy(false), [t]);
  if (!t) return null;
  return (
    <Dialog open={open} onClose={onClose} title={t.description} desc={`${t.date} · ${t.method}`} wide>
      <WalletKv
        items={[
          { k: "Receipt", v: <code>{t.refNo}</code> },
          { k: "Direction", v: t.type === "In" ? "Money in" : "Money out" },
          { k: "Amount", v: <strong>{t.type === "In" ? "+" : "–"}{kes(Math.abs(t.amount))}</strong> },
          { k: "Balance after", v: kes(t.balanceAfter) },
          { k: "Category", v: t.category },
          { k: "Budget envelope", v: t.budget ?? "—" },
          { k: "Crop", v: t.crop ?? "—" },
          { k: "Status", v: <StatusChip label={t.status} tone={t.status === "Success" ? "low" : t.status === "Pending" ? "medium" : "high"} /> },
        ]}
      />
      <div className="gm-w-callout is-info">
        <strong>Evidence trail</strong>
        <p>
          {t.type === "Out"
            ? "This payout is linked to the task or invoice that authorised it, so your records and the worker's payslip hold the same reference."
            : "Incoming money is matched to the sale, deposit or grant that produced it before it is written into analytics."}
        </p>
      </div>
      <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-soft">Resend SMS receipt</button>
        {t.type === "Out" && t.status === "Success" ? (
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                onReversed(t);
                onClose();
              }, 900);
            }}
          >
            {busy ? "Raising reversal…" : "Request reversal"}
          </button>
        ) : null}
      </div>
    </Dialog>
  );
}

/* ---------------- 14.4 rule editor ---------------- */
export function AutopayEditDialog({
  open,
  rule,
  onClose,
  onSave,
}: {
  open: boolean;
  rule: AutoPayRule | null;
  onClose: () => void;
  onSave: (rule: AutoPayRule) => void;
}) {
  const [draft, setDraft] = useState<AutoPayRule | null>(rule);
  useEffect(() => setDraft(rule), [rule]);
  if (!draft) return null;
  return (
    <Dialog open={open} onClose={onClose} title={draft.label} desc="Auto-pay rule">
      <div className="gm-w-wizard">
        <label className="gm-field">
          <span>Trigger</span>
          <input className="gm-input" value={draft.trigger} onChange={(event) => setDraft({ ...draft, trigger: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Recipients</span>
          <input className="gm-input" value={draft.recipients} onChange={(event) => setDraft({ ...draft, recipients: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Spend cap (KES)</span>
          <input className="gm-input" type="number" value={draft.amountCap} onChange={(event) => setDraft({ ...draft, amountCap: Number(event.target.value) })} />
        </label>
        <label className="gm-field">
          <span>Note</span>
          <input className="gm-input" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} />
        </label>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
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
          Save rule
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- 14.6 budget ---------------- */
export function BudgetDetailDialog({
  open,
  b,
  onClose,
  onAllocate,
}: {
  open: boolean;
  b: WalletBudget | null;
  onClose: () => void;
  onAllocate: (id: string, amount: number) => void;
}) {
  const [topUp, setTopUp] = useState(5000);
  useEffect(() => setTopUp(5000), [b]);
  if (!b) return null;
  const remaining = b.allocated - b.spent;
  return (
    <Dialog open={open} onClose={onClose} title={`${b.emoji} ${b.name}`} desc="Envelope budget" wide>
      <WalletKv
        items={[
          { k: "Allocated", v: kes(b.allocated) },
          { k: "Spent", v: kes(b.spent) },
          { k: "Remaining", v: <strong>{kes(Math.max(0, remaining))}</strong> },
          { k: "Crop", v: b.crop ?? "General farm" },
          { k: "Rule", v: b.allocated > 0 ? "Money ring-fenced for this crop" : "No money set aside yet" },
        ]}
      />
      <div className="gm-w-wizard">
        <label className="gm-field">
          <span>Move money into this budget (KES)</span>
          <input className="gm-input" type="number" value={topUp} onChange={(event) => setTopUp(Number(event.target.value))} />
        </label>
        <p className="gm-w-note is-small">Allocation moves money from your free balance ({kes(WALLET_CONTEXT.freeBalance)}) into the envelope. Reverse it any time.</p>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={topUp <= 0}
          onClick={() => {
            onAllocate(b.id, topUp);
            onClose();
          }}
        >
          Allocate {kes(topUp)}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- recipients ---------------- */
export function AddRecipientDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (recipient: Recipient) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("07");
  const [role, setRole] = useState("Worker");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("07");
    setRole("Worker");
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title="Add a payee" desc="Saved payees keep the whitelist useful">
      {receipt ? (
        <>
          <ReceiptBlock title="Payee saved" amount={0} receipt={receipt} note="Whitelist rules now allow pays to this number without extra checks." />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="gm-w-wizard">
            <label className="gm-field">
              <span>Full name</span>
              <input className="gm-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Samuel Njoroge" />
            </label>
            <label className="gm-field">
              <span>Phone or Till</span>
              <input className="gm-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <label className="gm-field">
              <span>Role</span>
              <select className="gm-select" value={role} onChange={(event) => setRole(event.target.value)}>
                {["Worker", "Foreman", "Supplier", "Transporter", "Co-op", "Utility"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <OtpInput value={otp} onChange={setOtp} label="OTP to authorise the change (123456)" />
          </div>
          {busy ? <Processing label="Saving payee…" /> : null}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={!name || phone.length < 9 || otp.length < 6 || busy}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const ref = code("PAYEE");
                  setBusy(false);
                  setReceipt(ref);
                  onAdd({
                    id: ref,
                    name,
                    phone,
                    role,
                    avatar: name
                      .split(" ")
                      .map((part) => part.charAt(0))
                      .join("")
                      .slice(0, 2)
                      .toUpperCase(),
                    recent: 0,
                  });
                }, 900);
              }}
            >
              Save payee
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ---------------- 14.7 dialogs ---------------- */
export function WalletFaqDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState<number | null>(0);
  return (
    <Dialog open={open} onClose={onClose} title="Wallet questions" desc="M-Pesa, fees, safety and reversals" wide>
      <WalletFaqList items={WALLET_FAQ} open={index} onOpen={setIndex} />
      <h3 className="gm-h-section mt-3">Wallet glossary</h3>
      <WalletGlossary items={WALLET_GLOSSARY} />
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function WalletShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [days, setDays] = useState(7);
  const [generated, setGenerated] = useState(false);
  const [receipt, setReceipt] = useState("");
  useEffect(() => {
    if (!open) return;
    setDays(7);
    setGenerated(false);
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Share a statement" desc="Time-limited link for your co-op or lender">
      {generated ? (
        <>
          <ReceiptBlock title="Statement link ready" amount={0} receipt={receipt} note={`Valid for ${days} days · read-only · no PIN needed by the viewer`} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="gm-w-wizard">
            <span className="gm-field-label">Link lifetime</span>
            <div className="gm-w-quick-amounts">
              {[1, 3, 7, 14, 30].map((value) => (
                <button key={value} type="button" className={`gm-filter-chip ${days === value ? "is-on" : ""}`} onClick={() => setDays(value)}>
                  {value} days
                </button>
              ))}
            </div>
            <WalletKv
              items={[
                { k: "Includes", v: "Transactions, budgets and receipts (Oct 2026)" },
                { k: "Excludes", v: "PIN, M-Pesa credentials, team logins" },
                { k: "Delivery", v: "SMS to any Kenyan number or WhatsApp" },
              ]}
            />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setReceipt(code("QK"));
                setGenerated(true);
              }}
            >
              <Share2 /> Generate link
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

export function WalletSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Wallet settings" desc="Limits, settlement and receipts" wide>
      <WalletKv items={WALLET_SETTINGS_ROWS.map((row) => ({ k: row.k, v: row.v }))} />
      <div className="gm-w-wizard">
        <label className="gm-field">
          <span>Wallet PIN reminder SMS</span>
          <select className="gm-select" defaultValue="Monthly">
            {["Never", "Monthly", "Every 3 months"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Receipt language</span>
          <select className="gm-select" defaultValue="Kiswahili + English">
            {["Kiswahili + English", "English only", "Kiswahili only"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Save settings
        </button>
      </div>
    </Dialog>
  );
}

export function FreezeConfirmDialog({
  open,
  onClose,
  onFrozen,
}: {
  open: boolean;
  onClose: () => void;
  onFrozen: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) {
      setOtp("");
      setBusy(false);
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Freeze the wallet?" desc="No sends, withdrawals or auto-pay will run until you unfreeze with your PIN">
      <div className="gm-w-callout is-warn">
        <strong>Use it when</strong>
        <p>Your phone is lost, a payee looks wrong, or someone is pressuring you for money. Freezing is instant and reversible.</p>
      </div>
      <OtpInput value={otp} onChange={setOtp} label="Demo OTP (123456)" />
      {busy ? <Processing label="Freezing wallet…" /> : null}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Keep active
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          disabled={otp.length < 6 || busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              setBusy(false);
              onFrozen();
              onClose();
            }, 900);
          }}
        >
          Freeze now
        </button>
      </div>
    </Dialog>
  );
}

/* Generic confirmation used by a couple of wallet actions */
export function ConfirmWalletDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="gm-w-note">{body}</p>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
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

/* ============================================================================
   14.3c BULK PAYOUT — one card, seven wizard steps, five modals in the flow:
   [1] BulkPayoutWizard      (main, 7 steps: Purpose → Payees → Amounts →
                             Timing → Review → Authorise → Receipt)
   [2] BulkAddPayeeDialog    (manual payee: M-Pesa / bank / GrowMO / cash)
   [3] BulkScheduleDialog    (hold & release on a date & time)
   [4] BulkCashRecordDialog  (invoice preview + receipt mode + confirmation)
   [5] BulkBudgetSplitDialog (split the batch across budget envelopes)
   ========================================================================== */

export type BulkTiming =
  | { mode: "now" }
  | { mode: "scheduled"; label: string }
  | { mode: "cash"; invoiceNo: string; receiptMode: string };

export interface BulkPayoutResult {
  mode: "now" | "scheduled" | "cash";
  purpose: string;
  memo: string;
  lines: PayoutLine[];
  lineRefs: string[];
  total: number;
  fee: number;
  batchRef: string;
  scheduleLabel?: string;
  invoiceNo?: string;
  budgetSplit: { id: string; name: string; amount: number }[];
}

function lineFeeOf(line: PayoutLine): number {
  if (line.channel === "mpesa") return Math.round(line.amount * 0.007) + 15;
  if (line.channel === "bank") return 50;
  return 0;
}

function channelLabel(id: PayoutChannelId): string {
  return PAYOUT_CHANNELS.find((c) => c.id === id)?.label ?? id;
}

function normIdentifier(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function downloadBatchCsv(filename: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ---------------- [2] add a payee manually ---------------- */
export function BulkAddPayeeDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (candidate: Omit<PayoutLine, "id">) => boolean;
}) {
  const [channel, setChannel] = useState<PayoutChannelId>("mpesa");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState(500);
  const [memo, setMemo] = useState("");
  const [dupWarn, setDupWarn] = useState("");

  useEffect(() => {
    if (!open) return;
    setChannel("mpesa");
    setName("");
    setIdentifier("");
    setAmount(500);
    setMemo("");
    setDupWarn("");
  }, [open]);

  const active = PAYOUT_CHANNELS.find((c) => c.id === channel) ?? PAYOUT_CHANNELS[0];
  const identifierRequired = channel !== "cash" && identifier.trim().length < 4;
  const valid = name.trim().length >= 2 && !identifierRequired && amount >= 100;

  function submit(keepOpen: boolean) {
    const ok = onAdd({ name: name.trim(), channel, identifier: identifier.trim(), amount, memo: memo.trim() });
    if (!ok) {
      setDupWarn(`${name.trim() || "This payee"} is already in the batch — remove them first to re-add.`);
      return;
    }
    setDupWarn("");
    setName("");
    setIdentifier("");
    setMemo("");
    setAmount(500);
    if (!keepOpen) onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add a payee to the batch" desc="Pick how this person gets paid, then keep adding">
      <div className="gm-w-paytype-grid">
        {PAYOUT_CHANNELS.map((c) => (
          <button key={c.id} type="button" className={`gm-w-radio ${channel === c.id ? "is-on" : ""}`} onClick={() => setChannel(c.id)}>
            <strong>
              {c.icon} {c.label}
            </strong>
            <small>{c.hint}</small>
          </button>
        ))}
      </div>
      <div className="gm-w-wizard">
        <label className="gm-field">
          <span>{channel === "cash" ? "Who you paid in cash" : "Full name"}</span>
          <input className="gm-input" value={name} onChange={(event) => setName(event.target.value)} placeholder={channel === "cash" ? "e.g. Njeri Wafula" : "e.g. Njeri Wafula"} />
        </label>
        <label className="gm-field">
          <span>
            {active.idLabel}
            {channel === "cash" ? "" : " *"}
          </span>
          <input className="gm-input" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder={active.idPlaceholder} />
        </label>
        <div className="d-flex gap-2">
          <label className="gm-field" style={{ flex: 1 }}>
            <span>Amount (KES) *</span>
            <input className="gm-input" type="number" min={100} value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
          </label>
          <label className="gm-field" style={{ flex: 1.4 }}>
            <span>Note for the receipt</span>
            <input className="gm-input" value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="e.g. 3 days weeding, Plot 1" />
          </label>
        </div>
        {dupWarn ? (
          <p className="gm-w-note" style={{ color: "var(--gm-clay-700)" }}>
            <AlertTriangle style={{ width: 14, height: 14, verticalAlign: "-2px" }} /> {dupWarn}
          </p>
        ) : (
          <p className="gm-w-note is-small">{active.feeNote}. Amounts of {kes(100)} minimum per payee.</p>
        )}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-soft" disabled={!valid} onClick={() => submit(true)}>
          <Plus /> Add & add another
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!valid} onClick={() => submit(false)}>
          Add to batch
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- [3] schedule the batch ---------------- */
export function BulkScheduleDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSave: (label: string) => void;
}) {
  const [label, setLabel] = useState(initial);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("17:00");

  useEffect(() => {
    if (!open) return;
    setLabel(initial);
    setCustomDate("");
    setCustomTime("17:00");
  }, [open, initial]);

  const minDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const customLabel =
    customDate && customTime
      ? `${new Date(`${customDate}T${customTime}`).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" })} · ${customTime}`
      : "";

  return (
    <Dialog open={open} onClose={onClose} title="Schedule the batch" desc="Money is held and released automatically — nothing is sent early">
      <span className="gm-field-label">Quick picks</span>
      <div className="gm-w-schedule-list">
        {SCHEDULE_PRESETS.map((p) => (
          <button key={p.id} type="button" className={`gm-w-radio ${label === p.label ? "is-on" : ""}`} onClick={() => setLabel(p.label)}>
            <strong>{p.label}</strong>
            <small>{p.detail}</small>
          </button>
        ))}
      </div>
      <span className="gm-field-label" style={{ marginTop: ".6rem" }}>
        Or pick an exact date & time
      </span>
      <div className="d-flex gap-2">
        <label className="gm-field" style={{ flex: 1 }}>
          <span>Date</span>
          <input className="gm-input" type="date" min={minDate} value={customDate} onChange={(event) => setCustomDate(event.target.value)} />
        </label>
        <label className="gm-field" style={{ flex: 1 }}>
          <span>Time</span>
          <input className="gm-input" type="time" value={customTime} onChange={(event) => setCustomTime(event.target.value)} />
        </label>
      </div>
      {customLabel ? (
        <div className="gm-w-quick-amounts">
          <button
            type="button"
            className={`gm-filter-chip ${label === customLabel ? "is-on" : ""}`}
            onClick={() => setLabel(customLabel)}
          >
            Use {customLabel} ✓
          </button>
        </div>
      ) : null}
      <WalletCallout tone="info" title="Before the run">
        You get an SMS 24 hours ahead. Until release you can still edit amounts or cancel from History — the money
        stays reserved, not sent.
      </WalletCallout>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!label} onClick={() => onSave(label)}>
          Save schedule
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- [4] record cash with an invoice ---------------- */
export function BulkCashRecordDialog({
  open,
  lines,
  purpose,
  onClose,
  onSave,
}: {
  open: boolean;
  lines: PayoutLine[];
  purpose: string;
  onClose: () => void;
  onSave: (invoiceNo: string, receiptMode: string) => void;
}) {
  const [receiptMode, setReceiptMode] = useState(CASH_RECEIPT_MODES[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-0000");

  useEffect(() => {
    if (!open) return;
    setReceiptMode(CASH_RECEIPT_MODES[0]);
    setConfirmed(false);
    setInvoiceNo(`INV-2026-${String(1000 + Math.floor(Math.random() * 9000))}`);
  }, [open]);

  const total = lines.reduce((sum, l) => sum + (l.amount > 0 ? l.amount : 0), 0);
  const today = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Dialog open={open} onClose={onClose} title="Record the cash payment" desc="No money leaves the wallet — this writes the invoice & payslips">
      <div className="gm-w-invoice">
        <div className="gm-w-invoice-head">
          <div>
            <strong>{invoiceNo}</strong>
            <small>
              {WALLET_CONTEXT.farm} · {WALLET_CONTEXT.accountNo} · {today}
            </small>
          </div>
          <div className="gm-w-invoice-total">
            <small>Total cash paid</small>
            <b>{kes(total)}</b>
          </div>
        </div>
        <div className="gm-w-invoice-lines">
          {lines.map((l) => (
            <div key={l.id} className="gm-w-invoice-line">
              <span>{l.name}</span>
              <small>{l.memo || purpose}</small>
              <b>{kes(l.amount)}</b>
            </div>
          ))}
        </div>
      </div>
      <span className="gm-field-label" style={{ marginTop: ".7rem" }}>
        Deliver receipts by
      </span>
      <div className="gm-w-quick-amounts">
        {CASH_RECEIPT_MODES.map((m) => (
          <button key={m} type="button" className={`gm-filter-chip ${receiptMode === m ? "is-on" : ""}`} onClick={() => setReceiptMode(m)}>
            {m}
          </button>
        ))}
      </div>
      <label className="gm-w-confirm">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span>
          I confirm I handed over <strong>{kes(total)}</strong> in cash, counted and verified, on {today}.
        </span>
      </label>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-lime" disabled={!confirmed} onClick={() => onSave(invoiceNo, receiptMode)}>
          <FileCheck /> Issue invoice
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- [5] split the batch across budgets ---------------- */
export function BulkBudgetSplitDialog({
  open,
  total,
  budgets,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  total: number;
  budgets: WalletBudget[];
  initial: { id: string; name: string; amount: number }[];
  onClose: () => void;
  onSave: (split: { id: string; name: string; amount: number }[]) => void;
}) {
  const [alloc, setAlloc] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    const start: Record<string, number> = {};
    initial.forEach((s) => {
      start[s.id] = s.amount;
    });
    setAlloc(start);
  }, [open, initial]);

  const used = budgets.reduce((sum, b) => sum + (alloc[b.id] || 0), 0);
  const remaining = Math.max(0, total - used);
  const over = used > total;

  return (
    <Dialog open={open} onClose={onClose} title="Split the batch across budgets" desc={`Keep each crop's spending inside its envelope — batch total ${kes(total)}`}>
      <div className="gm-w-wizard">
        {budgets.map((b) => (
          <div key={b.id} className="gm-w-split-row">
            <span className="gm-w-budget-emoji">{b.emoji}</span>
            <div className="gm-w-split-copy">
              <strong>{b.name}</strong>
              <small>{b.crop ? `${b.crop} budget` : "Unallocated envelope"}</small>
            </div>
            <input
              className="gm-input gm-w-split-amt"
              type="number"
              min={0}
              max={total}
              placeholder="0"
              value={alloc[b.id] || ""}
              aria-label={`Amount into ${b.name}`}
              onChange={(event) => setAlloc((current) => ({ ...current, [b.id]: Number(event.target.value) }))}
            />
          </div>
        ))}
      </div>
      <WalletKv
        items={[
          { k: "Assigned to envelopes", v: kes(used) },
          { k: "Stays in free balance", v: <strong>{kes(remaining)}</strong> },
          { k: "Batch total", v: kes(total) },
        ]}
      />
      {over ? (
        <WalletCallout tone="warn" title="Over-allocated">
          The split is {kes(used - total)} more than the batch total — reduce an envelope before saving.
        </WalletCallout>
      ) : null}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={over}
          onClick={() =>
            onSave(
              budgets
                .filter((b) => (alloc[b.id] || 0) > 0)
                .map((b) => ({ id: b.id, name: b.name, amount: alloc[b.id] })),
            )
          }
        >
          Save split
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- [1] the 7-step wizard ---------------- */
export function BulkPayoutWizard({
  open,
  saved,
  budgets,
  balance,
  dailyLimit,
  todaySpent,
  onClose,
  onCompleted,
}: {
  open: boolean;
  saved: Recipient[];
  budgets: WalletBudget[];
  balance: number;
  dailyLimit: number;
  todaySpent: number;
  onClose: () => void;
  onCompleted: (result: BulkPayoutResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState(PAYOUT_PURPOSES[0].id);
  const [batchMemo, setBatchMemo] = useState("");
  const [lines, setLines] = useState<PayoutLine[]>([]);
  const [timing, setTiming] = useState<BulkTiming>({ mode: "now" });
  const [budgetSplit, setBudgetSplit] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [payeeOpen, setPayeeOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [dupNote, setDupNote] = useState("");
  const [otp, setOtp] = useState("");
  const [pinPhase, setPinPhase] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [batchRef, setBatchRef] = useState("");
  const [lineRefs, setLineRefs] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPurpose(PAYOUT_PURPOSES[0].id);
    setBatchMemo("");
    setLines([]);
    setTiming({ mode: "now" });
    setBudgetSplit([]);
    setPayeeOpen(false);
    setScheduleOpen(false);
    setCashOpen(false);
    setBudgetOpen(false);
    setDupNote("");
    setOtp("");
    setPinPhase(0);
    setBusy(false);
    setDone(false);
    setBatchRef("");
    setLineRefs([]);
  }, [open]);

  const total = lines.reduce((sum, l) => sum + (l.amount > 0 ? l.amount : 0), 0);
  const fee = lines.reduce((sum, l) => sum + lineFeeOf(l), 0);
  const needsSecondPin = total > 5000;
  const dailyLeft = dailyLimit - todaySpent;
  const overDaily = timing.mode !== "cash" && total > dailyLeft;
  const overBalance = timing.mode === "now" && total > balance;
  const splitTotal = budgetSplit.reduce((sum, s) => sum + s.amount, 0);
  const splitOver = splitTotal > total;
  const steps = ["Purpose", "Payees", "Amounts", "Timing", "Review", "Authorise", "Receipt"];

  function upsertLine(candidate: Omit<PayoutLine, "id">): boolean {
    const duplicate = lines.some(
      (l) =>
        l.channel === candidate.channel &&
        (candidate.identifier
          ? normIdentifier(l.identifier) === normIdentifier(candidate.identifier)
          : l.name.trim().toLowerCase() === candidate.name.trim().toLowerCase()),
    );
    if (duplicate) {
      setDupNote(`${candidate.name || "This payee"} is already in the batch — remove them first to re-add.`);
      return false;
    }
    setDupNote("");
    setLines((current) => [
      ...current,
      { ...candidate, id: `pl-${Date.now()}-${Math.floor(Math.random() * 100000)}` },
    ]);
    return true;
  }

  function addSaved(r: Recipient) {
    upsertLine({ name: r.name, channel: "mpesa", identifier: r.phone, amount: 500, memo: "", savedId: r.id });
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((l) => l.id !== id));
  }

  function setLineAmount(id: string, value: number) {
    setLines((current) => current.map((l) => (l.id === id ? { ...l, amount: value } : l)));
  }

  function setLineMemo(id: string, value: string) {
    setLines((current) => current.map((l) => (l.id === id ? { ...l, memo: value } : l)));
  }

  function applyAllAmount(value: number) {
    setLines((current) => current.map((l) => ({ ...l, amount: value })));
  }

  function release() {
    const refs = lines.map(() => code("PL"));
    const ref = code("BATCH");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setLineRefs(refs);
      setBatchRef(ref);
      setDone(true);
      setStep(6);
      onCompleted({
        mode: timing.mode,
        purpose,
        memo: batchMemo,
        lines,
        lineRefs: refs,
        total,
        fee,
        batchRef: ref,
        scheduleLabel: timing.mode === "scheduled" ? timing.label : undefined,
        invoiceNo: timing.mode === "cash" ? timing.invoiceNo : undefined,
        budgetSplit,
      });
    }, 1400);
  }

  function exportBatchCsv() {
    downloadBatchCsv(
      `growmo-bulk-${batchRef.toLowerCase() || "batch"}.csv`,
      [
        ["Receipt", "Payee", "Channel", "Identifier", "Amount (KES)", "Note"],
        ...lines.map((l, i) => [lineRefs[i] ?? "", l.name, channelLabel(l.channel), l.identifier, l.amount, l.memo]),
        [],
        ["", "Total", "", "", total, timing.mode === "cash" ? `Invoice ${timing.invoiceNo}` : batchRef],
      ],
    );
  }

  const receiptNote =
    timing.mode === "cash"
      ? `Invoice ${timing.invoiceNo} · ${lines.length} payslips · ${timing.receiptMode}`
      : timing.mode === "scheduled"
        ? `Held until ${timing.label} · SMS reminder 24h before · ${lines.length} receipts queued`
        : budgetSplit.length > 0
          ? `${lines.length} payees paid · split ${budgetSplit.map((s) => `${s.name} ${kes(s.amount)}`).join(" + ")}${total - splitTotal > 0 ? ` + free ${kes(total - splitTotal)}` : ""}`
          : `${lines.length} payees paid · free balance · SMS receipt to each`;

  return (
    <Dialog open={open} onClose={onClose} title="Bulk payout" desc="Many payees · one run · pay now, schedule or record cash" wide>
      <Stepper steps={steps} current={step} onStep={(index) => index <= step && setStep(index)} />

      {done ? (
        <>
          <ReceiptBlock
            title={timing.mode === "cash" ? "Invoice issued" : timing.mode === "scheduled" ? "Batch scheduled" : "Batch released"}
            amount={total}
            receipt={batchRef}
            note={receiptNote}
          />
          <div className="gm-w-batch-lines">
            {lines.map((l, i) => (
              <div key={l.id} className="gm-w-batch-line">
                <span className="gm-w-payout-ava">{payoutInitials(l.name)}</span>
                <div className="gm-w-batch-line-copy">
                  <strong>{l.name}</strong>
                  <small>
                    {channelLabel(l.channel)} · {l.identifier}
                    {l.memo ? ` · ${l.memo}` : ""}
                  </small>
                </div>
                <div className="gm-w-batch-line-right">
                  <b>{kes(l.amount)}</b>
                  <span className="gm-code-chip is-sm">{lineRefs[i]}</span>
                </div>
              </div>
            ))}
          </div>
          {timing.mode === "cash" ? (
            <WalletCallout tone="good" title="Records created">
              Every payee has an individual payslip against invoice {timing.invoiceNo}. Find the lines in History by
              filtering “Cash record”.
            </WalletCallout>
          ) : timing.mode === "scheduled" ? (
            <WalletCallout tone="info" title="Held safely">
              The money is reserved until the run. Edit amounts or cancel from History any time before release.
            </WalletCallout>
          ) : (
            <WalletCallout tone="good" title="Done">
              Every payee received a confirmation SMS. Open any line from History to raise a reversal within 2 hours.
            </WalletCallout>
          )}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={exportBatchCsv}>
              <Download /> Export CSV
            </button>
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Processing label={timing.mode === "cash" ? "Writing the invoice & payslips…" : "Talking to M-Pesa Daraja for each payee…"} />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-w-wizard">
              <div className="gm-w-paytype-grid">
                {PAYOUT_PURPOSES.map((p) => (
                  <button key={p.id} type="button" className={`gm-w-radio ${purpose === p.id ? "is-on" : ""}`} onClick={() => setPurpose(p.id)}>
                    <strong>
                      {p.icon} {p.id}
                    </strong>
                    <small>{p.sub}</small>
                  </button>
                ))}
              </div>
              <label className="gm-field">
                <span>Batch note (printed on every receipt)</span>
                <input className="gm-input" value={batchMemo} onChange={(event) => setBatchMemo(event.target.value)} placeholder="e.g. Week 5 wages — weeding & transplanting" />
              </label>
              <WalletCallout tone="info" title="How the bulk wizard works">
                Add as many payees as you like — M-Pesa phones, bank accounts, GrowMO wallet IDs or cash. Then set each
                amount, pay now, schedule the run for a later date, or record cash you already handed over with a
                proper invoice and payslip per person.
              </WalletCallout>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gm-w-wizard">
              <div className="gm-w-bulk-head">
                <span className="gm-chip gm-chip-lime">
                  {lines.length} {lines.length === 1 ? "payee" : "payees"} in this batch
                </span>
                <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setPayeeOpen(true)}>
                  <Plus /> Add manually
                </button>
              </div>
              <span className="gm-field-label">Saved payees — tap to add</span>
              <div className="gm-w-payee-chips">
                {saved.map((r) => (
                  <PayeeChip key={r.id} r={r} added={lines.some((l) => l.savedId === r.id)} onPick={addSaved} />
                ))}
              </div>
              <span className="gm-field-label">The batch</span>
              {lines.length === 0 ? (
                <div className="gm-w-bulk-empty">
                  <Users />
                  <p>
                    No payees yet. Tap a saved payee above or use <strong>Add manually</strong> to type a phone number,
                    bank account or GrowMO wallet ID. Keep adding as many as you need.
                  </p>
                </div>
              ) : (
                <div className="gm-w-payout-list">
                  {lines.map((l) => (
                    <PayoutLineRow key={l.id} line={l} onRemove={removeLine} />
                  ))}
                </div>
              )}
              {dupNote ? <WalletCallout tone="warn" title="Duplicate payee">{dupNote}</WalletCallout> : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="gm-w-wizard">
              <span className="gm-field-label">Set an amount for each payee</span>
              <div className="gm-w-payout-list">
                {lines.map((l) => (
                  <PayoutLineRow key={l.id} line={l} editable onRemove={removeLine} onAmount={setLineAmount} onMemo={setLineMemo} />
                ))}
              </div>
              <span className="gm-field-label">Apply to every payee</span>
              <div className="gm-w-quick-amounts">
                {[500, 1000, 2500, 5000, 10000].map((value) => (
                  <button key={value} type="button" className="gm-filter-chip" onClick={() => applyAllAmount(value)}>
                    {kes(value)}
                  </button>
                ))}
              </div>
              <PayoutTotalBar lines={lines} fee={fee} funding={timing.mode === "cash" ? "Cash (no wallet)" : "Wallet balance"} />
              <p className="gm-w-note is-small">Minimum {kes(100)} per payee · M-Pesa per-recipient ceiling {kes(150000)}.</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="gm-w-wizard">
              <div className="gm-w-timing-grid">
                <button type="button" className={`gm-w-timing ${timing.mode === "now" ? "is-on" : ""}`} onClick={() => setTiming({ mode: "now" })}>
                  <span className="gm-w-method-ic">
                    <Zap />
                  </span>
                  <strong>Pay now</strong>
                  <small>Instant release to M-Pesa & bank. Each payee gets an SMS receipt right away.</small>
                </button>
                <button
                  type="button"
                  className={`gm-w-timing ${timing.mode === "scheduled" ? "is-on" : ""}`}
                  onClick={() => setTiming({ mode: "scheduled", label: SCHEDULE_PRESETS[0].label })}
                >
                  <span className="gm-w-method-ic">
                    <CalendarClock />
                  </span>
                  <strong>Schedule</strong>
                  <small>
                    {timing.mode === "scheduled" && timing.label ? `Release ${timing.label}` : "Hold the batch, release on a date & time"}
                  </small>
                </button>
                <button type="button" className={`gm-w-timing ${timing.mode === "cash" ? "is-on" : ""}`} onClick={() => setCashOpen(true)}>
                  <span className="gm-w-method-ic">
                    <Banknote />
                  </span>
                  <strong>Record cash</strong>
                  <small>I already paid them cash — create the invoice & payslips, no money leaves the wallet.</small>
                </button>
              </div>
              {timing.mode === "scheduled" ? (
                <div className="gm-w-bulk-sub">
                  <div className="gm-w-bulk-sub-head">
                    <span>When should the run fire?</span>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setScheduleOpen(true)}>
                      Pick exact date & time
                    </button>
                  </div>
                  <div className="gm-w-quick-amounts">
                    {SCHEDULE_PRESETS.map((p) => (
                      <button key={p.id} type="button" className={`gm-filter-chip ${timing.mode === "scheduled" && timing.label === p.label ? "is-on" : ""}`} onClick={() => setTiming({ mode: "scheduled", label: p.label })}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <p className="gm-w-note is-small">
                    {timing.mode === "scheduled" ? timing.label : ""} · SMS reminder 24h before · edit or cancel from History until release.
                  </p>
                </div>
              ) : null}
              {timing.mode === "cash" ? (
                <div className="gm-w-bulk-sub">
                  <div className="gm-w-bulk-sub-head">
                    <span>
                      Invoice {timing.invoiceNo} · {timing.receiptMode}
                    </span>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setCashOpen(true)}>
                      Review invoice
                    </button>
                  </div>
                  <p className="gm-w-note is-small">
                    Wallet impact: none. {lines.length} payslips are written against the invoice so cash stays auditable.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="gm-w-wizard">
              <span className="gm-field-label">Every line, one last time</span>
              <div className="gm-w-payout-list">
                {lines.map((l) => (
                  <PayoutLineRow key={l.id} line={l} onRemove={removeLine} />
                ))}
              </div>
              <WalletKv
                items={[
                  { k: "Purpose", v: purpose },
                  { k: "Batch note", v: batchMemo || "—" },
                  { k: "Payees", v: `${lines.length}` },
                  { k: "Batch total", v: <strong>{kes(total)}</strong> },
                  { k: "Fee estimate", v: fee === 0 ? "Free" : kes(fee) },
                  { k: "Timing", v: timing.mode === "now" ? "Pay now" : timing.mode === "scheduled" ? `Scheduled · ${timing.label}` : `Cash · invoice ${timing.invoiceNo}` },
                  { k: timing.mode === "cash" ? "Wallet impact" : "Net outflow", v: timing.mode === "cash" ? "None — invoice record only" : <strong>{kes(total + fee)}</strong> },
                ]}
              />
              {timing.mode !== "cash" ? (
                <div className="gm-w-bulk-sub">
                  <div className="gm-w-bulk-sub-head">
                    <span>Split across budget envelopes</span>
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setBudgetOpen(true)}>
                      {budgetSplit.length ? "Edit split" : "Add split"}
                    </button>
                  </div>
                  {budgetSplit.length ? (
                    <div className="gm-w-quick-amounts">
                      {budgetSplit.map((s) => (
                        <span key={s.id} className="gm-filter-chip is-on">
                          {s.name} · {kes(s.amount)}
                        </span>
                      ))}
                      {total - splitTotal > 0 ? <span className="gm-filter-chip">Free balance · {kes(total - splitTotal)}</span> : null}
                    </div>
                  ) : (
                    <p className="gm-w-note is-small">The whole batch stays in your free balance.</p>
                  )}
                </div>
              ) : null}
              {splitOver ? (
                <WalletCallout tone="warn" title="Split no longer fits">
                  Lines changed since the split was saved — the split is {kes(splitTotal - total)} over. Open “Edit
                  split” to fix it.
                </WalletCallout>
              ) : null}
              <ul className="gm-w-checklist">
                {timing.mode !== "cash" ? (
                  <li className={overDaily ? "is-warn" : "is-ok"}>
                    {overDaily ? <AlertTriangle /> : <Check />}
                    <span>
                      Daily limit {kes(dailyLimit)} — {kes(dailyLeft)} left today.{" "}
                      {overDaily ? `This batch needs ${kes(total)} and would be held or split.` : "The batch fits within today's limit."}
                    </span>
                  </li>
                ) : null}
                {overBalance ? (
                  <li className="is-warn">
                    <AlertTriangle />
                    <span>
                      Batch needs {kes(total)} but only {kes(balance)} is available — top up first or split the batch.
                    </span>
                  </li>
                ) : null}
                <li className="is-ok">
                  <Check />
                  <span>
                    {lines.length} receipts — one SMS per payee, stored against the task, invoice or payslip.
                  </span>
                </li>
                <li className={needsSecondPin ? "is-warn" : "is-ok"}>
                  {needsSecondPin ? <AlertTriangle /> : <Check />}
                  <span>
                    {needsSecondPin
                      ? `Total ${kes(total)} is above KES 5,000 — a second PIN is required at authorisation.`
                      : "Below the KES 5,000 second-PIN threshold — one OTP is enough."}
                  </span>
                </li>
              </ul>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="gm-w-wizard">
              <WalletKv
                items={[
                  { k: "Batch", v: `${lines.length} payees · ${purpose}` },
                  { k: "Total", v: <strong>{kes(total)}</strong> },
                  { k: "Fee estimate", v: fee === 0 ? "Free" : kes(fee) },
                  { k: "Timing", v: timing.mode === "now" ? "Pay now" : timing.mode === "scheduled" ? `Scheduled · ${timing.label}` : `Cash · ${timing.invoiceNo}` },
                ]}
              />
              {pinPhase === 0 ? (
                <>
                  <OtpInput value={otp} onChange={setOtp} label="Wallet OTP (123456)" />
                  <p className="gm-w-note is-small">In production this is the Daraja confirmation; GrowMO never sees your M-Pesa PIN.</p>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime gm-btn-block"
                    disabled={otp.length < 6}
                    onClick={() => (needsSecondPin ? setPinPhase(1) : release())}
                  >
                    {needsSecondPin ? "Continue to second PIN" : "Release batch"}
                  </button>
                </>
              ) : (
                <>
                  <WalletCallout tone="warn" title="Second approval required">
                    This batch totals {kes(total)} — above the KES 5,000 threshold set in Wallet security. Confirm with
                    your 4-digit wallet PIN.
                  </WalletCallout>
                  <PinPad onComplete={() => release()} />
                  <p className="gm-w-note is-small">Any 4 digits work in this demo.</p>
                </>
              )}
              <div className="d-flex justify-content-between gap-2 mt-1">
                <button type="button" className="gm-btn gm-btn-outline" onClick={() => (pinPhase === 1 ? setPinPhase(0) : setStep(4))}>
                  {pinPhase === 1 ? "Back to OTP" : "Back to review"}
                </button>
              </div>
            </div>
          ) : null}

          {step <= 4 ? (
            <WizardActions
              step={step}
              last={4}
              onBack={() => setStep((current) => Math.max(0, current - 1))}
              nextLabel="Continue"
              finishLabel="Authorise"
              nextDisabled={
                step === 1 ? lines.length === 0 : step === 2 ? lines.some((l) => l.amount < 100) : false
              }
              onNext={() => setStep((current) => Math.min(5, current + 1))}
            />
          ) : null}
        </>
      )}

      {/* sub-modals raised from inside the wizard */}
      <BulkAddPayeeDialog open={payeeOpen} onClose={() => setPayeeOpen(false)} onAdd={upsertLine} />
      <BulkScheduleDialog
        open={scheduleOpen}
        initial={timing.mode === "scheduled" ? timing.label : ""}
        onClose={() => setScheduleOpen(false)}
        onSave={(label) => {
          setTiming({ mode: "scheduled", label });
          setScheduleOpen(false);
        }}
      />
      <BulkCashRecordDialog
        open={cashOpen}
        lines={lines}
        purpose={purpose}
        onClose={() => setCashOpen(false)}
        onSave={(invoiceNo, receiptMode) => {
          setTiming({ mode: "cash", invoiceNo, receiptMode });
          setCashOpen(false);
        }}
      />
      <BulkBudgetSplitDialog
        open={budgetOpen}
        total={total}
        budgets={budgets}
        initial={budgetSplit}
        onClose={() => setBudgetOpen(false)}
        onSave={(split) => {
          setBudgetSplit(split);
          setBudgetOpen(false);
        }}
      />
    </Dialog>
  );
}
