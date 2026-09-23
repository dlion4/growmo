/* ============================================================================
   PAGE 14 — WALLET modals & wizards
   Every wizard follows the GrowMO money flow:
   amount → review → M-Pesa OTP 123456 / wallet PIN → processing → receipt.
   ========================================================================== */
import { CheckCircle2, Loader2, Share2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { AutoPayRule, DepositMethod, PayType, Recipient, Txn, WalletBudget } from "../../data/app/wallet";
import {
  BANK_OPTIONS,
  BILLERS,
  WALLET_CONTEXT,
  WALLET_FAQ,
  WALLET_GLOSSARY,
  WALLET_SETTINGS_ROWS,
} from "../../data/app/wallet";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";
import { WalletFaqList, WalletGlossary, WalletKv } from "./WalletWidgets";

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
