/* ============================================================================
   PAGE 15 — SETTINGS / TEAM modals & wizards
   Invitations, role edits, plan switches, data actions and the payroll run all
   follow the GrowMO pattern: review → OTP/PIN 123456 → processing → receipt.
   ========================================================================== */
import { CheckCircle2, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import type { FarmPlot, TeamMember, Worker } from "../../data/app/settings";
import { DATA_SHARING_DETAIL, JOB_POST, ONBOARDING_CHECKLIST, PAYSLIPS, PLANS, ROLES } from "../../data/app/settings";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper } from "../auth/controls";
import { WizardActions } from "./DashboardWidgets";

function code(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = `${prefix}-`;
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="gm-st-processing">
      <Loader2 className="spin" />
      <p>{label}</p>
    </div>
  );
}

function Receipt({ title, note, receipt }: { title: string; note: string; receipt: string }) {
  return (
    <div className="gm-st-receipt">
      <span className="gm-st-receipt-mark">
        <CheckCircle2 />
      </span>
      <h3 className="font-display">{title}</h3>
      <p>{note}</p>
      <div className="gm-code-chip">{receipt}</div>
    </div>
  );
}

/* ---------------- invite ---------------- */
export function InviteMemberDialog({
  open,
  onClose,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  onSent: (member: TeamMember) => void;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("07");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [plots, setPlots] = useState("All plots");
  const [financial, setFinancial] = useState("View only");
  const [authority, setAuthority] = useState("Initiate");
  const [validUntil, setValidUntil] = useState("Indefinite");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setName("");
    setPhone("07");
    setEmail("");
    setRole("manager");
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  const steps = ["Who they are", "What they can do", "Confirm"];

  return (
    <Dialog open={open} onClose={onClose} title="Invite a team member" desc="They get an SMS with a one-time code to set their own PIN" wide>
      <Stepper steps={steps} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipt ? (
        <>
          <Receipt
            title="Invitation sent"
            note={`${name} (${phone}) can now join Mary's Farm as ${ROLES.find((r) => r.key === role)?.label}. The invite expires in 48 hours.`}
            receipt={receipt}
          />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Sending the invite SMS…" />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-st-form">
              <label className="gm-field">
                <span>Full name</span>
                <input className="gm-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Agnes Nekesa" />
              </label>
              <label className="gm-field">
                <span>Phone (Safaricom or Airtel)</span>
                <input className="gm-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07XX XXX XXX" />
              </label>
              <label className="gm-field">
                <span>Email (optional)</span>
                <input className="gm-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.co.ke" />
              </label>
              <label className="gm-field">
                <span>Role</span>
                <select className="gm-select" value={role} onChange={(event) => setRole(event.target.value)}>
                  {ROLES.filter((option) => option.key !== "owner").map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label} — {option.desc}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="gm-st-form">
              <label className="gm-field">
                <span>Plots accessible</span>
                <select className="gm-select" value={plots} onChange={(event) => setPlots(event.target.value)}>
                  {["All plots", "Selected plots", "Assigned plots only"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field">
                <span>Financial access</span>
                <select className="gm-select" value={financial} onChange={(event) => setFinancial(event.target.value)}>
                  {["Full", "View only", "None"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field">
                <span>Payment authority</span>
                <select className="gm-select" value={authority} onChange={(event) => setAuthority(event.target.value)}>
                  {["Can initiate payments", "Can approve payments", "None"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="gm-field">
                <span>Valid until</span>
                <select className="gm-select" value={validUntil} onChange={(event) => setValidUntil(event.target.value)}>
                  {["Indefinite", "28 Feb 2027", "31 Dec 2026", "31 Jan 2027"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <p className="gm-st-note">
                Only the owner can change roles later. Suspending a member stops their access instantly and reallocates any
                pending payments.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="gm-st-form">
              <dl className="gm-st-kv">
                <div className="gm-st-kv-row">
                  <dt>Name</dt>
                  <dd>{name}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Phone</dt>
                  <dd>{phone}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Role</dt>
                  <dd>{ROLES.find((r) => r.key === role)?.label}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Plots</dt>
                  <dd>{plots}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Financial</dt>
                  <dd>{financial}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Payments</dt>
                  <dd>{authority}</dd>
                </div>
                <div className="gm-st-kv-row">
                  <dt>Valid until</dt>
                  <dd>{validUntil}</dd>
                </div>
              </dl>
              <OtpInput value={otp} onChange={setOtp} label="Owner OTP to authorise the invite (123456)" />
            </div>
          ) : null}

          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep((current) => Math.max(0, current - 1))}
            nextLabel="Continue"
            finishLabel="Send invite"
            nextDisabled={(step === 0 && (!name || phone.length < 9)) || (step === 2 && otp.length < 6)}
            onNext={() => {
              if (step < 2) {
                setStep((current) => current + 1);
                return;
              }
              setBusy(true);
              setTimeout(() => {
                const ref = code("INV");
                setBusy(false);
                setReceipt(ref);
                onSent({
                  id: ref,
                  name,
                  phone,
                  email: email || "—",
                  role: role as TeamMember["role"],
                  avatar: name
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                  status: "Invited",
                  joined: "Pending",
                  lastLogin: "—",
                  mfa: false,
                  plots,
                  crops: "All crops",
                  financial: financial as TeamMember["financial"],
                  paymentAuthority: authority === "Can approve payments" ? "Approve" : authority === "Can initiate payments" ? "Initiate" : "None",
                  validFrom: "22 Sep 2026",
                  validUntil,
                  tasksThisMonth: 0,
                });
              }, 1100);
            }}
          />
        </>
      )}
    </Dialog>
  );
}

/* ---------------- member detail ---------------- */
export function MemberDialog({
  open,
  member,
  onClose,
  onSave,
  onRemove,
}: {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}) {
  const [draft, setDraft] = useState<TeamMember | null>(member);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setDraft(member);
    setBusy(false);
  }, [member]);
  if (!draft) return null;
  const isOwner = draft.role === "owner";
  return (
    <Dialog open={open} onClose={onClose} title={draft.name} desc={`${ROLES.find((r) => r.key === draft.role)?.label} · ${draft.status}`} wide>
      <dl className="gm-st-kv is-two">
        <div className="gm-st-kv-row">
          <dt>Phone</dt>
          <dd>{draft.phone}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Email</dt>
          <dd>{draft.email}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Joined</dt>
          <dd>{draft.joined}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Last login</dt>
          <dd>{draft.lastLogin}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>MFA</dt>
          <dd>{draft.mfa ? "Enabled" : "Not set"}</dd>
        </div>
        <div className="gm-st-kv-row">
          <dt>Tasks this month</dt>
          <dd>{draft.tasksThisMonth}</dd>
        </div>
      </dl>

      <div className="gm-st-form">
        <label className="gm-field">
          <span>Role</span>
          <select
            className="gm-select"
            value={draft.role}
            disabled={isOwner}
            onChange={(event) => setDraft({ ...draft, role: event.target.value as TeamMember["role"] })}
          >
            {ROLES.map((role) => (
              <option key={role.key} value={role.key}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Plots accessible</span>
          <select className="gm-select" value={draft.plots} onChange={(event) => setDraft({ ...draft, plots: event.target.value })}>
            {["All", "Plots 1, 2", "Assigned only"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Financial access</span>
          <select className="gm-select" value={draft.financial} onChange={(event) => setDraft({ ...draft, financial: event.target.value as TeamMember["financial"] })}>
            {["Full", "View only", "None"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Payment authority</span>
          <select className="gm-select" value={draft.paymentAuthority} onChange={(event) => setDraft({ ...draft, paymentAuthority: event.target.value as TeamMember["paymentAuthority"] })}>
            {["Initiate", "Approve", "None"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Status</span>
          <select className="gm-select" value={draft.status} disabled={isOwner} onChange={(event) => setDraft({ ...draft, status: event.target.value as TeamMember["status"] })}>
            {["Active", "Invited", "Suspended"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Valid until</span>
          <select className="gm-select" value={draft.validUntil} onChange={(event) => setDraft({ ...draft, validUntil: event.target.value })}>
            {["Indefinite", "28 Feb 2027", "31 Dec 2026", "31 Jan 2027"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      {busy ? <Spinner label="Saving permissions…" /> : null}
      <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
        {!isOwner ? (
          <button type="button" className="gm-btn gm-btn-danger-soft" onClick={() => onRemove(draft)}>
            Remove member
          </button>
        ) : null}
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              setBusy(false);
              onSave(draft);
              onClose();
            }, 800);
          }}
        >
          Save changes
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- profile ---------------- */
export function ProfileEditDialog({
  open,
  ctx,
  onClose,
  onSave,
}: {
  open: boolean;
  ctx: { farmer: string; phone: string; email: string; farmName: string; county: string; subCounty: string; ward: string; language: string };
  onClose: () => void;
  onSave: (next: typeof ctx) => void;
}) {
  const [draft, setDraft] = useState(ctx);
  useEffect(() => setDraft(ctx), [ctx]);
  return (
    <Dialog open={open} onClose={onClose} title="Edit profile" desc="Everything captured during onboarding stays editable" wide>
      <div className="gm-st-form is-two">
        <label className="gm-field">
          <span>Full name</span>
          <input className="gm-input" value={draft.farmer} onChange={(event) => setDraft({ ...draft, farmer: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Phone</span>
          <input className="gm-input" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Email</span>
          <input className="gm-input" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Farm name</span>
          <input className="gm-input" value={draft.farmName} onChange={(event) => setDraft({ ...draft, farmName: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>County</span>
          <input className="gm-input" value={draft.county} onChange={(event) => setDraft({ ...draft, county: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Sub-county</span>
          <input className="gm-input" value={draft.subCounty} onChange={(event) => setDraft({ ...draft, subCounty: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Ward</span>
          <input className="gm-input" value={draft.ward} onChange={(event) => setDraft({ ...draft, ward: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Language</span>
          <select className="gm-select" value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })}>
            {["English + Kiswahili", "English only", "Kiswahili only", "Kikuyu"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
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
          Save profile
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- farm plot ---------------- */
export function FarmPlotDialog({
  open,
  plot,
  onClose,
  onSave,
}: {
  open: boolean;
  plot: FarmPlot | null;
  onClose: () => void;
  onSave: (plot: FarmPlot) => void;
}) {
  const [draft, setDraft] = useState<FarmPlot | null>(plot);
  useEffect(() => setDraft(plot), [plot]);
  if (!draft) return null;
  return (
    <Dialog open={open} onClose={onClose} title={draft.name} desc="Plot details feed the plan, the soil model and records" wide>
      <div className="gm-st-form is-two">
        <label className="gm-field">
          <span>Plot name</span>
          <input className="gm-input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Size</span>
          <input className="gm-input" value={draft.size} onChange={(event) => setDraft({ ...draft, size: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Location</span>
          <input className="gm-input" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Crop</span>
          <input className="gm-input" value={draft.crop} onChange={(event) => setDraft({ ...draft, crop: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>Soil type</span>
          <input className="gm-input" value={draft.soil} onChange={(event) => setDraft({ ...draft, soil: event.target.value })} />
        </label>
        <label className="gm-field">
          <span>pH</span>
          <input className="gm-input" type="number" step="0.1" value={draft.ph} onChange={(event) => setDraft({ ...draft, ph: Number(event.target.value) })} />
        </label>
        <label className="gm-field">
          <span>Status</span>
          <select className="gm-select" value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as FarmPlot["status"] })}>
            {["Active", "Fallow", "Preparing"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="gm-field">
          <span>Harvest window</span>
          <input className="gm-input" value={draft.harvest} onChange={(event) => setDraft({ ...draft, harvest: event.target.value })} />
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
          Save plot
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- plans ---------------- */
export function PlanDialog({
  open,
  current,
  onClose,
  onPick,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onPick: (id: string, note: string) => void;
}) {
  const [selected, setSelected] = useState(current);
  useEffect(() => setSelected(current), [current, open]);
  return (
    <Dialog open={open} onClose={onClose} title="Plans & billing" desc="Pay by M-Pesa from the GrowMO wallet" wide>
      <div className="gm-st-plan-grid">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`gm-st-plan ${selected === plan.id ? "is-current" : ""} ${plan.id === "premium" ? "is-featured" : ""}`}
            onClick={() => setSelected(plan.id)}
          >
            <div className="gm-st-plan-head">
              <span className="gm-st-plan-icon">{plan.icon}</span>
              <div>
                <strong className="font-display">{plan.name}</strong>
                <small>{plan.desc}</small>
              </div>
            </div>
            <div className="gm-st-plan-price">
              <strong className="font-display">{plan.price === 0 ? "Free" : kes(plan.price)}</strong>
              <small>{plan.billing}</small>
            </div>
            <ul className="gm-st-plan-features">
              {plan.features.slice(0, 6).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={selected === current}
          onClick={() => {
            onPick(selected, selected === current ? "Plan unchanged" : `Switched to ${PLANS.find((p) => p.id === selected)?.name}`);
            onClose();
          }}
        >
          {selected === current ? "This is your plan" : `Switch to ${PLANS.find((p) => p.id === selected)?.name}`}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- data actions ---------------- */
export function DataActionDialog({
  open,
  action,
  onClose,
  onDone,
}: {
  open: boolean;
  action: string | null;
  onClose: () => void;
  onDone: (id: string, receipt: string, note: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  const labels: Record<string, { title: string; desc: string; cta: string; danger?: boolean }> = {
    d1: { title: "Extension sharing", desc: "Kiambu extension officers can read soil tests and spray records.", cta: "Save sharing settings" },
    d2: { title: "Benchmark pool", desc: "Your yields join the de-identified county comparison pool.", cta: "Update benchmark sharing" },
    d3: { title: "Buyer traceability", desc: "Pick which buyers can scan batch QRs — Naivas, Twiga and Karen Greens are available.", cta: "Save buyer list" },
    d4: { title: "Data retention", desc: "Keep everything, auto-delete after three years, or set a custom window.", cta: "Change retention" },
    d5: { title: "Export all data", desc: "A ZIP with CSVs plus photos is prepared and a download link is SMSed to you.", cta: "Prepare export" },
    d6: { title: "Delete account", desc: "Deletion runs after a 30-day grace period. Withdraw wallet funds first.", cta: "Start 30-day deletion", danger: true },
  };
  const meta = labels[action ?? "d1"] ?? labels.d1;

  return (
    <Dialog open={open} onClose={onClose} title={meta.title} desc="OTP authorisation required">
      {receipt ? (
        <>
          <Receipt title={meta.danger ? "Deletion scheduled" : "Saved"} note={meta.desc} receipt={receipt} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Applying your choice…" />
      ) : (
        <>
          <p className="gm-st-note">{meta.desc}</p>
          <dl className="gm-st-kv">
            {DATA_SHARING_DETAIL.map((row) => (
              <div key={row.k} className="gm-st-kv-row">
                <dt>{row.k}</dt>
                <dd>{row.v}</dd>
              </div>
            ))}
          </dl>
          <OtpInput value={otp} onChange={setOtp} label="Owner OTP (123456)" />
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={`gm-btn ${meta.danger ? "gm-btn-danger-soft" : "gm-btn-lime"}`}
              disabled={otp.length < 6}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const ref = code(meta.danger ? "DEL" : "SET");
                  setBusy(false);
                  setReceipt(ref);
                  onDone(action ?? "", ref, meta.title);
                }, 1100);
              }}
            >
              {meta.cta}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ---------------- worker detail ---------------- */
export function WorkerDialog({
  open,
  worker,
  onClose,
  onPay,
}: {
  open: boolean;
  worker: Worker | null;
  onClose: () => void;
  onPay: (worker: Worker, amount: number, memo: string) => void;
}) {
  if (!worker) return null;
  return (
    <Dialog open={open} onClose={onClose} title={worker.name} desc={`${worker.id} · ${worker.role} · ${worker.employment}`} wide>
      <div className="row g-3">
        <div className="col-lg-6">
          <h3 className="gm-h-section">Identity & contact</h3>
          <dl className="gm-st-kv">
            <div className="gm-st-kv-row">
              <dt>Phone</dt>
              <dd>{worker.phone}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>M-Pesa name</dt>
              <dd>{worker.mpesaName}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>National ID</dt>
              <dd>{worker.nin}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Village</dt>
              <dd>
                {worker.village} · {worker.distance}
              </dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Next of kin</dt>
              <dd>{worker.nextOfKin}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Status</dt>
              <dd>{worker.status}</dd>
            </div>
          </dl>
        </div>
        <div className="col-lg-6">
          <h3 className="gm-h-section">Contract & skills</h3>
          <dl className="gm-st-kv">
            <div className="gm-st-kv-row">
              <dt>Employment</dt>
              <dd>
                {worker.employment} · joined {worker.joined}
              </dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Contract ends</dt>
              <dd>{worker.contractEnd}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Skills</dt>
              <dd>{worker.skills.join(", ")}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Daily rate</dt>
              <dd>{kes(worker.dailyRate)}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Piece rate</dt>
              <dd>{worker.pieceRate}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Paid by</dt>
              <dd>{worker.payment}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>NSSF / NHIF</dt>
              <dd>
                {worker.nssf} · {worker.nhif}
              </dd>
            </div>
          </dl>
        </div>
        <div className="col-lg-6">
          <h3 className="gm-h-section">Performance</h3>
          <dl className="gm-st-kv">
            <div className="gm-st-kv-row">
              <dt>Rating</dt>
              <dd>{worker.rating.toFixed(1)}★</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Tasks completed</dt>
              <dd>{worker.tasks}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Attendance</dt>
              <dd>{worker.attendance}%</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Earned all time</dt>
              <dd>{kes(worker.earnedAllTime)}</dd>
            </div>
            <div className="gm-st-kv-row">
              <dt>Earned this season</dt>
              <dd>{kes(worker.earnedSeason)}</dd>
            </div>
          </dl>
          <p className="gm-st-note">{worker.note}</p>
        </div>
        <div className="col-lg-6">
          <h3 className="gm-h-section">Pay this worker</h3>
          <PayWorkerInline worker={worker} onPay={onPay} />
        </div>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

function PayWorkerInline({ worker, onPay }: { worker: Worker; onPay: (worker: Worker, amount: number, memo: string) => void }) {
  const [amount, setAmount] = useState(worker.dailyRate * 5);
  const [memo, setMemo] = useState("Weekly pay");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  if (done) return <Receipt title="Payment sent" note={`${kes(amount)} to ${worker.name} · ${worker.phone}`} receipt={done} />;
  if (busy) return <Spinner label={`Paying ${worker.name}…`} />;

  return (
    <div className="gm-st-form">
      <label className="gm-field">
        <span>Amount (KES)</span>
        <input className="gm-input" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
      </label>
      <label className="gm-field">
        <span>Note on the receipt</span>
        <input className="gm-input" value={memo} onChange={(event) => setMemo(event.target.value)} />
      </label>
      <p className="gm-st-note">Funds come from the labour budget. Enter the wallet PIN — any 4 digits in this demo.</p>
      <PinPad
        onComplete={(value) => {
          setPin(value);
          setBusy(true);
          setTimeout(() => {
            const ref = code("PL");
            setBusy(false);
            setDone(ref);
            onPay(worker, amount, memo);
          }, 1100);
        }}
      />
      {pin ? <p className="gm-st-note">PIN captured.</p> : null}
    </div>
  );
}

/* ---------------- payroll run ---------------- */
export function PayrollDialog({
  open,
  onClose,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: (total: number, receipts: Record<string, string>) => void;
}) {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipts, setReceipts] = useState<Record<string, string> | null>(null);
  const total = PAYSLIPS.reduce((sum, slip) => sum + slip.net, 0);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setOtp("");
    setBusy(false);
    setReceipts(null);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title="Weekly payroll run" desc={`${PAYSLIPS.length} workers · ${kes(total)} · Friday 5 PM run`} wide>
      <Stepper steps={["Review payslips", "Authorise", "Receipts"]} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipts ? (
        <div>
          <Receipt title="Payroll processed" note={`${PAYSLIPS.length} workers paid from the labour budget; each one gets an SMS payslip.`} receipt={`BATCH ${code("PAY")}`} />
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Net pay</th>
                  <th>M-Pesa number</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {PAYSLIPS.map((slip) => (
                  <tr key={slip.worker}>
                    <td>{slip.worker}</td>
                    <td>{kes(slip.net)}</td>
                    <td>{slip.phone}</td>
                    <td>
                      <code>{receipts[slip.worker]}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : busy ? (
        <Spinner label="Paying workers over M-Pesa B2C…" />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Days</th>
                    <th>Basic</th>
                    <th>Overtime</th>
                    <th>Piece</th>
                    <th>Deductions</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYSLIPS.map((slip) => (
                    <tr key={slip.worker}>
                      <td>{slip.worker}</td>
                      <td>{slip.days}</td>
                      <td>{kes(slip.basic)}</td>
                      <td>{kes(slip.otPay)}</td>
                      <td>{slip.piece ? kes(slip.piece) : "—"}</td>
                      <td>{slip.absence + slip.advance === 0 ? "—" : kes(slip.absence + slip.advance)}</td>
                      <td>
                        <strong>{kes(slip.net)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="gm-st-form">
              <p className="gm-st-note">
                Total to release <strong>{kes(total)}</strong> from the labour budget. Workers also receive a written payslip
                by SMS and WhatsApp.
              </p>
              <OtpInput value={otp} onChange={setOtp} label="Owner OTP to authorise payroll (123456)" />
            </div>
          ) : null}
        </>
      )}
      {!receipts && !busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((current) => Math.max(0, current - 1))}
          nextLabel="Authorise"
          finishLabel="Pay all workers"
          nextDisabled={step === 1 && otp.length < 6}
          onNext={() => {
            if (step === 0) {
              setStep(1);
              return;
            }
            setBusy(true);
            setTimeout(() => {
              const issued: Record<string, string> = {};
              for (const slip of PAYSLIPS) issued[slip.worker] = code("SHK");
              setBusy(false);
              setStep(2);
              setReceipts(issued);
              onPaid(total, issued);
            }, 1600);
          }}
        />
      ) : null}
      {receipts ? (
        <div className="d-flex justify-content-end mt-3">
          <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
            Done
          </button>
        </div>
      ) : null}
    </Dialog>
  );
}


/* ---------------- job post & onboarding ---------------- */
export function JobPostDialog({ open, onClose, onPosted }: { open: boolean; onClose: () => void; onPosted: (receipt: string) => void }) {
  const [draft, setDraft] = useState({ ...JOB_POST });
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setDraft({ ...JOB_POST });
    setBusy(false);
    setReceipt(null);
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Post a farm job" desc="Community board, WhatsApp, SMS to nearby workers and the chief's notice board" wide>
      {receipt ? (
        <>
          <Receipt title="Job posted" note="47 workers were messaged and the post is live on the community board for 14 days." receipt={receipt} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Posting to the community board and SMS…" />
      ) : (
        <>
          <div className="gm-st-form is-two">
            <label className="gm-field">
              <span>Job title</span>
              <input className="gm-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label className="gm-field">
              <span>Skills required</span>
              <input className="gm-input" value={draft.skills} onChange={(event) => setDraft({ ...draft, skills: event.target.value })} />
            </label>
            <label className="gm-field">
              <span>Duration</span>
              <input className="gm-input" value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: event.target.value })} />
            </label>
            <label className="gm-field">
              <span>Rate</span>
              <input className="gm-input" value={draft.rate} onChange={(event) => setDraft({ ...draft, rate: event.target.value })} />
            </label>
            <label className="gm-field">
              <span>Workers needed</span>
              <input className="gm-input" type="number" value={draft.workers} onChange={(event) => setDraft({ ...draft, workers: Number(event.target.value) })} />
            </label>
            <label className="gm-field">
              <span>Meals</span>
              <input className="gm-input" value={draft.meals} onChange={(event) => setDraft({ ...draft, meals: event.target.value })} />
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
                setBusy(true);
                setTimeout(() => {
                  const ref = code("JOB");
                  setBusy(false);
                  setReceipt(ref);
                  onPosted(ref);
                }, 1200);
              }}
            >
              Post job
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

export function OnboardingDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (checked: number) => void }) {
  const [checked, setChecked] = useState<number[]>([]);
  useEffect(() => {
    if (open) setChecked([]);
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="New worker onboarding" desc="Eight steps before anyone starts on the farm">
      <ol className="gm-st-checklist is-action">
        {ONBOARDING_CHECKLIST.map((item, index) => (
          <li key={item.step}>
            <button
              type="button"
              className={`gm-st-check ${checked.includes(index) ? "is-on" : ""}`}
              onClick={() => setChecked((current) => (current.includes(index) ? current.filter((id) => id !== index) : [...current, index]))}
            >
              <span>{checked.includes(index) ? "✓" : ""}</span>
              <strong>{item.step}</strong>
              <small>{item.owner}</small>
            </button>
          </li>
        ))}
      </ol>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={checked.length < ONBOARDING_CHECKLIST.length}
          onClick={() => {
            onDone(checked.length);
            onClose();
          }}
        >
          {checked.length}/{ONBOARDING_CHECKLIST.length} done — add to directory
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- confirm ---------------- */
export function ConfirmSettingsDialog({
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
      <p className="gm-st-note">{body}</p>
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
