/* ============================================================================
   PAGE 15.3 — TEAM MANAGEMENT & HUMAN RESOURCES  (/app/team)
   All dialogs & wizards, driven by one discriminated-union modal state.
   26 modal kinds — see TeamModalState. Modals mutate live state via the
   setters passed from the route; toasts fire only on real state changes.
   ========================================================================== */
import {
  Check,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  FileText,
  HardHat,
  Mail,
  MessageSquare,
  Scale,
  ShieldCheck,
  Smartphone,
  Star,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type AdvanceRec,
  type Applicant,
  type AttendanceMethod,
  type AttStatus,
  BATCH_RECEIPTS,
  type ComplianceRow,
  type JobPost,
  ONBOARDING_STEPS,
  PAYROLL_SMS,
  type PayslipLine,
  payslipNet,
  WORKER_SKILLS,
  type Worker,
} from "../../data/app/team";
import { kes } from "../../data/site";
import { Dialog, OtpInput, PinPad, Stepper } from "../auth/controls";
import { DashboardDrawer, WizardActions } from "./DashboardWidgets";
import { SmsBubble, workerChip } from "./TeamWidgets";

export type TeamModalState =
  | { kind: "none" }
  | { kind: "worker"; workerId: string }
  | { kind: "add-worker" }
  | { kind: "edit-worker"; workerId: string }
  | { kind: "change-status"; workerId: string }
  | { kind: "payslip"; workerId: string }
  | { kind: "leave"; workerId: string }
  | { kind: "contract"; workerId: string }
  | { kind: "post-job" }
  | { kind: "job"; postId: string }
  | { kind: "applicant"; applicantId: string }
  | { kind: "onboarding"; applicantId: string }
  | { kind: "mark-attendance" }
  | { kind: "checkin-sim" }
  | { kind: "rate-task" }
  | { kind: "perf-review"; workerName: string }
  | { kind: "payroll-review" }
  | { kind: "payroll-approve" }
  | { kind: "batch-pay" }
  | { kind: "payroll-sms" }
  | { kind: "new-advance" }
  | { kind: "deduction" }
  | { kind: "repay-advance"; recId: string }
  | { kind: "compliance"; rowId: string }
  | { kind: "ppe" }
  | { kind: "benchmark" }
  | { kind: "export" };

export interface TeamModalsProps {
  modal: TeamModalState;
  setModal: (m: TeamModalState) => void;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  posts: JobPost[];
  setPosts: React.Dispatch<React.SetStateAction<JobPost[]>>;
  applicants: Applicant[];
  setApplicants: React.Dispatch<React.SetStateAction<Applicant[]>>;
  onb: Record<string, number>;
  setOnb: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  methods: AttendanceMethod[];
  setMethods: React.Dispatch<React.SetStateAction<AttendanceMethod[]>>;
  lines: PayslipLine[];
  setLines: React.Dispatch<React.SetStateAction<PayslipLine[]>>;
  advances: AdvanceRec[];
  setAdvances: React.Dispatch<React.SetStateAction<AdvanceRec[]>>;
  ppe: { id: string; item: string; ok: boolean }[];
  setPpe: React.Dispatch<
    React.SetStateAction<{ id: string; item: string; ok: boolean }[]>
  >;
  wallet: number;
  setWallet: React.Dispatch<React.SetStateAction<number>>;
  payrollStage: number; // 0 draft · 1 reviewed · 2 approved · 3 paid
  setPayrollStage: (n: number) => void;
  compliance: ComplianceRow[];
  setCompliance: React.Dispatch<React.SetStateAction<ComplianceRow[]>>;
  notify: (msg: string, tone?: "success" | "info" | "warn") => void;
}

/* ================= small shared helpers ================= */

function useProcessed(active: boolean, ms: number, onDone: () => void) {
  const cb = useRef(onDone);
  useEffect(() => {
    cb.current = onDone;
  });
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => cb.current(), ms);
    return () => clearTimeout(t);
  }, [active, ms]);
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="gm-field">
      <span>{label}</span>
      {children}
      {hint ? <small className="text-muted">{hint}</small> : null}
    </div>
  );
}

function MoneyConfirm({
  amount,
  from,
  to,
  note,
  onConfirm,
  onBack,
}: {
  amount: number;
  from: string;
  to: string;
  note: string;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState<"pin" | "run" | "done">("pin");
  useProcessed(phase === "run", 2200, () => setPhase("done"));
  return (
    <div>
      {phase === "pin" ? (
        <>
          <div className="gm-money-confirm">
            <span className="gm-eyebrow">M-Pesa · STK confirmation</span>
            <p className="font-display gm-money-amount">
              {kes(Math.round(amount))}
            </p>
            <p>
              {from} → <strong>{to}</strong>
            </p>
            <small className="text-muted">{note}</small>
          </div>
          <PinPad
            length={6}
            onComplete={(p) => {
              if (p === "123456") {
                setPhase("run");
              } else {
                setWrong((w) => w + 1);
              }
            }}
          />
          {wrong > 0 ? (
            <p className="gm-form-err">
              {wrong >= 3
                ? "Too many wrong PINs — press Back and try the details again."
                : "Wrong PIN — demo PIN is 123456."}
            </p>
          ) : (
            <p className="text-muted">
              Enter the 6-digit payment PIN · demo 123456
            </p>
          )}
          <button
            type="button"
            className="gm-btn gm-btn-outline mt-2"
            onClick={onBack}
          >
            Back
          </button>
        </>
      ) : phase === "run" ? (
        <div className="gm-processing">
          <span className="gm-spinner" aria-hidden />
          <p>Sending {kes(Math.round(amount))}…</p>
          <small className="text-muted">
            M-Pesa is confirming with Safaricom
          </small>
        </div>
      ) : (
        <div className="gm-receipt-done">
          <span className="gm-receipt-done-mark">
            <Check />
          </span>
          <p className="font-display">Sent {kes(Math.round(amount))}</p>
          <small className="text-muted">{note}</small>
          <button
            type="button"
            className="gm-btn gm-btn-primary mt-3"
            onClick={onConfirm}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ================= 1 · worker detail drawer ================= */

export function WorkerDetailDrawer(
  props: TeamModalsProps & { workerId: string },
) {
  const { workerId, setModal, workers } = props;
  const w = workers.find((x) => x.id === workerId);
  const [tab, setTab] = useState<"profile" | "pay" | "activity">("profile");
  if (!w) return null;
  const inThisBatch = props.lines.some((l) => l.workerId === w.id);
  return (
    <DashboardDrawer
      open
      title={`${w.name} · ${w.id}`}
      onClose={() => setModal({ kind: "none" })}
      footer={
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => setModal({ kind: "edit-worker", workerId: w.id })}
          >
            <UserPlus /> Edit profile
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal({ kind: "change-status", workerId: w.id })}
          >
            <Scale /> Change status
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal({ kind: "contract", workerId: w.id })}
          >
            <FileText /> Contract PDF
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal({ kind: "leave", workerId: w.id })}
          >
            <ClipboardCheck /> Leave request
          </button>
        </div>
      }
    >
      <div className="gm-team-wd-head">
        <div className="d-flex align-items-center gap-3">
          <span className="gm-team-avatar gm-team-avatar-lg" aria-hidden>
            {w.name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")}
          </span>
          <div>
            <strong
              className="font-display d-block"
              style={{ fontSize: "1.05rem" }}
            >
              {w.name}
            </strong>
            <span className="text-muted">
              {w.village} · {w.distanceKm} km from farm
            </span>
            <div className="mt-1">{workerChip(w.status)}</div>
          </div>
        </div>
        {w.statusNote ? (
          <p className="gm-team-wd-note">{w.statusNote}</p>
        ) : null}
      </div>

      <div className="gm-tabs gm-tabs-sm">
        {(["profile", "pay", "activity"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`gm-tab ${tab === t ? "on" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "profile"
              ? "Profile"
              : t === "pay"
                ? "Pay & benefits"
                : "Activity"}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <dl className="gm-deflist">
          <div>
            <dt>National ID</dt>
            <dd>{w.idNo}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {w.phone}
              {w.altPhone ? ` · alt ${w.altPhone}` : ""}
            </dd>
          </div>
          <div>
            <dt>M-Pesa name</dt>
            <dd>
              {w.mpesaName}{" "}
              <span className="gm-chip gm-risk gm-risk-low">verified</span>
            </dd>
          </div>
          <div>
            <dt>M-Pesa number</dt>
            <dd>{w.mpesaNo}</dd>
          </div>
          <div>
            <dt>Date of birth</dt>
            <dd>
              {w.dob} · {w.gender}
            </dd>
          </div>
          <div>
            <dt>Nationality</dt>
            <dd>{w.nationality}</dd>
          </div>
          <div>
            <dt>Joined</dt>
            <dd>
              {w.joinDate} · {w.empType}
              {w.contractEnd ? ` · ends ${w.contractEnd}` : ""}
            </dd>
          </div>
          <div>
            <dt>Skills</dt>
            <dd>
              {w.skills.join(", ")}{" "}
              <span className="gm-chip">{w.skillLevel}</span>
            </dd>
          </div>
          <div>
            <dt>Certifications</dt>
            <dd>
              {w.certifications.length
                ? w.certifications.join(" · ")
                : "None recorded"}
            </dd>
          </div>
          <div>
            <dt>Emergency contact</dt>
            <dd>
              {w.emergency.name} · {w.emergency.phone}
            </dd>
          </div>
          <div>
            <dt>Next of kin</dt>
            <dd>
              {w.nextOfKin.name} ({w.nextOfKin.rel}) · {w.nextOfKin.phone}
            </dd>
          </div>
          <div>
            <dt>Health notes</dt>
            <dd>{w.healthNotes}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{w.notes}</dd>
          </div>
        </dl>
      ) : null}

      {tab === "pay" ? (
        <div>
          <dl className="gm-deflist">
            <div>
              <dt>Daily rate</dt>
              <dd className="font-display">
                {kes(w.dailyRate)}{" "}
                <small className="text-muted">
                  (≈ {kes(Math.round(w.dailyRate * 0.25))}/hour · OT ×
                  {w.overtimeMultiplier})
                </small>
              </dd>
            </div>
            <div>
              <dt>Pay frequency</dt>
              <dd>{w.payFreq}</dd>
            </div>
            <div>
              <dt>Pay method</dt>
              <dd>{w.payMethod}</dd>
            </div>
            {w.bankAccount ? (
              <div>
                <dt>Bank account</dt>
                <dd>{w.bankAccount}</dd>
              </div>
            ) : null}
            {w.nssf ? (
              <div>
                <dt>NSSF</dt>
                <dd>{w.nssf} · 6% + 6%</dd>
              </div>
            ) : null}
            {w.nhif ? (
              <div>
                <dt>NHIF / SHA</dt>
                <dd>{w.nhif} · KES 300 tier</dd>
              </div>
            ) : null}
          </dl>
          {w.pieceRates.length ? (
            <div className="gm-card-inset mt-3">
              <p className="gm-eyebrow mb-1">Piece rates</p>
              {w.pieceRates.map((p) => (
                <div key={p.task} className="d-flex justify-content-between">
                  <span>{p.task}</span>
                  <strong className="font-display">{p.rate}</strong>
                </div>
              ))}
            </div>
          ) : null}
          <div
            className="gm-stat-grid mt-3"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div className="gm-card-inset">
              <small className="text-muted">Earned all-time</small>
              <strong className="font-display d-block">
                {kes(w.totalEarned)}
              </strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">This season</small>
              <strong className="font-display d-block">
                {kes(w.seasonEarned)}
              </strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Tasks done</small>
              <strong className="font-display d-block">{w.tasksDone}</strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">
                Attendance · absences · lates (Oct)
              </small>
              <strong className="font-display d-block">
                {w.attendancePct}% · {w.absentsMonth} · {w.latesMonth}
              </strong>
            </div>
          </div>
          {inThisBatch ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm mt-3"
              onClick={() => setModal({ kind: "payslip", workerId: w.id })}
            >
              <WalletCards /> Last payslip
            </button>
          ) : null}
        </div>
      ) : null}

      {tab === "activity" ? (
        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="gm-eyebrow">Performance</span>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() =>
                setModal({
                  kind: "perf-review",
                  workerName: w.name.split(" ").slice(0, 2).join(" "),
                })
              }
            >
              <Star /> Full review
            </button>
          </div>
          <p className="gm-lead mb-2">
            Average rating <strong className="font-display">{w.rating}★</strong>{" "}
            across {w.tasksDone} tasks this season.
          </p>
          {[
            "Weeding Plot 1 · rated 5★ · 21/10",
            "Transplanting Plot 4 · rated 5★ · 15/10",
            "Spraying Plot 2 · rated 4★ · 12/10",
          ].map((a) => (
            <div key={a} className="gm-team-activity-row">
              <Check />
              <span>{a}</span>
            </div>
          ))}
        </div>
      ) : null}
    </DashboardDrawer>
  );
}

/* ================= 2 · add worker wizard ================= */

export function AddWorkerWizard(props: TeamModalsProps) {
  const { setModal, setWorkers, notify } = props;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    idNo: "",
    phone: "",
    village: "",
    dob: "",
    gender: "Male",
    empType: "Seasonal",
    dailyRate: 500,
    payFreq: "Weekly",
    payMethod: "GrowMO wallet M-Pesa",
    skills: [] as string[],
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });
  const [otp, setOtp] = useState("");
  const set = (k: string, v: string | number | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const valid1 =
    form.name.trim().length >= 3 &&
    /^\d{8,}$/.test(form.idNo) &&
    /^07\d{8}$/.test(form.phone.replace(/\s/g, ""));
  const valid2 = form.village.trim().length >= 2 && form.dailyRate > 0;

  const finish = () => {
    const w: Worker = {
      id: `W-${String(props.workers.length + 10).padStart(3, "0")}`,
      name: form.name.trim(),
      idNo: form.idNo,
      phone: form.phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3"),
      mpesaName: form.name.trim().split(" ").slice(0, 2).join(" "),
      mpesaNo: form.phone.replace(/\s/g, ""),
      dob: form.dob || "—",
      gender: form.gender as Worker["gender"],
      nationality: "Kenyan",
      village: form.village,
      distanceKm: 2,
      joinDate: "23/10/2026",
      empType: form.empType as Worker["empType"],
      skills: form.skills,
      skillLevel: "New",
      certifications: [],
      dailyRate: form.dailyRate,
      pieceRates: [],
      overtimeMultiplier: 1.5,
      payFreq: form.payFreq as Worker["payFreq"],
      payMethod: form.payMethod as Worker["payMethod"],
      emergency: {
        name: form.emergencyName || "—",
        phone: form.emergencyPhone || "—",
      },
      nextOfKin: { name: "—", rel: "—", phone: "—" },
      healthNotes: "None recorded.",
      rating: 0,
      totalEarned: 0,
      seasonEarned: 0,
      tasksDone: 0,
      attendancePct: 100,
      absentsMonth: 0,
      latesMonth: 0,
      status: "Active",
      notes: form.notes || "Added 23/10/2026.",
    };
    setWorkers((ws) => [w, ...ws]);
    notify(`${w.name} added to the directory.`, "success");
    setModal({ kind: "worker", workerId: w.id });
  };

  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Add a worker"
      desc="Three short steps — identity, job, payment — then a quick verification."
      wide
    >
      <Stepper
        steps={["Identity", "Job & skills", "Payment & verify"]}
        current={step}
        onStep={(i) => i < step && setStep(i)}
      />
      {step === 0 ? (
        <div className="gm-form-grid">
          <Field label="Full name">
            <input
              className="gm-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Njoroge Wanjala"
            />
          </Field>
          <Field label="National ID (8 digits)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={form.idNo}
              onChange={(e) =>
                set("idNo", e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="12345678"
            />
          </Field>
          <Field label="Phone (07XX)">
            <input
              className="gm-input"
              inputMode="tel"
              value={form.phone}
              onChange={(e) =>
                set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))
              }
              placeholder="0712345678"
            />
          </Field>
          <Field label="Date of birth">
            <input
              className="gm-input"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              placeholder="12/05/1995"
            />
          </Field>
          <Field label="Gender">
            <select
              className="gm-select"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid">
          <Field label="Village / location">
            <input
              className="gm-input"
              value={form.village}
              onChange={(e) => set("village", e.target.value)}
              placeholder="Githunguri, Kiambu"
            />
          </Field>
          <Field label="Employment type">
            <select
              className="gm-select"
              value={form.empType}
              onChange={(e) => set("empType", e.target.value)}
            >
              <option>Permanent</option>
              <option>Seasonal</option>
              <option>Casual</option>
              <option>Contract</option>
            </select>
          </Field>
          <Field
            label="Daily rate (KES)"
            hint={`≈ ${kes(Math.round(form.dailyRate * 0.25))}/hour, OT at 1.5×`}
          >
            <input
              className="gm-input"
              type="number"
              min={1}
              value={form.dailyRate}
              onChange={(e) => set("dailyRate", Number(e.target.value) || 0)}
            />
          </Field>
          <div className="gm-field">
            <span>Skills</span>
            <div className="gm-chip-row gm-team-skillpicks">
              {WORKER_SKILLS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`gm-filter-chip ${form.skills.includes(s) ? "on" : ""}`}
                  onClick={() =>
                    set(
                      "skills",
                      form.skills.includes(s)
                        ? form.skills.filter((x) => x !== s)
                        : [...form.skills, s],
                    )
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-form-grid">
          <Field label="Pay frequency">
            <select
              className="gm-select"
              value={form.payFreq}
              onChange={(e) => set("payFreq", e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
              <option>End of task</option>
            </select>
          </Field>
          <Field label="Pay method">
            <select
              className="gm-select"
              value={form.payMethod}
              onChange={(e) => set("payMethod", e.target.value)}
            >
              <option>GrowMO wallet M-Pesa</option>
              <option>Manual M-Pesa</option>
              <option>Cash</option>
              <option>Bank transfer</option>
            </select>
          </Field>
          <Field label="Emergency contact name">
            <input
              className="gm-input"
              value={form.emergencyName}
              onChange={(e) => set("emergencyName", e.target.value)}
              placeholder="Family member"
            />
          </Field>
          <Field label="Emergency contact phone">
            <input
              className="gm-input"
              inputMode="tel"
              value={form.emergencyPhone}
              onChange={(e) =>
                set(
                  "emergencyPhone",
                  e.target.value.replace(/[^\d]/g, "").slice(0, 10),
                )
              }
              placeholder="07XX XXX XXX"
            />
          </Field>
          <Field label="Notes">
            <textarea
              className="gm-input"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything the team should know"
            />
          </Field>
          <div className="gm-card-inset gm-team-otpwrap">
            <p className="mb-1" style={{ fontWeight: 700 }}>
              Verify {form.phone || "the worker's phone"}
            </p>
            <OtpInput value={otp} onChange={setOtp} label="Verification code" />
            <p className="text-muted">
              We sent a 6-digit code · demo code 123456
            </p>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => (step === 2 ? finish() : setStep((s) => s + 1))}
        nextLabel="Continue"
        finishLabel="Add to directory"
        nextDisabled={
          step === 0 ? !valid1 : step === 1 ? !valid2 : otp !== "123456"
        }
      />
    </Dialog>
  );
}

/* ================= 3 · edit worker ================= */

export function EditWorkerDialog(
  props: TeamModalsProps & { workerId: string },
) {
  const { workerId, setModal, workers, setWorkers, notify } = props;
  const orig = workers.find((x) => x.id === workerId);
  const [form, setForm] = useState(() => ({
    name: orig?.name ?? "",
    phone: orig?.phone ?? "",
    village: orig?.village ?? "",
    empType: orig?.empType ?? "Casual",
    dailyRate: orig?.dailyRate ?? 500,
    payFreq: orig?.payFreq ?? "Weekly",
    payMethod: orig?.payMethod ?? "GrowMO wallet M-Pesa",
    skillLevel: orig?.skillLevel ?? "New",
    notes: orig?.notes ?? "",
    healthNotes: orig?.healthNotes ?? "",
  }));
  if (!orig) return null;
  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    setWorkers((ws) =>
      ws.map((w) =>
        w.id === workerId
          ? {
              ...w,
              name: form.name,
              phone: form.phone,
              village: form.village,
              empType: form.empType as Worker["empType"],
              dailyRate: form.dailyRate,
              payFreq: form.payFreq as Worker["payFreq"],
              payMethod: form.payMethod as Worker["payMethod"],
              skillLevel: form.skillLevel as Worker["skillLevel"],
              notes: form.notes,
              healthNotes: form.healthNotes,
            }
          : w,
      ),
    );
    notify(`${orig.name}'s profile updated.`, "success");
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Edit ${orig.name}`}
      desc="Changes save to the directory immediately."
      wide
    >
      <div className="gm-form-grid">
        <Field label="Full name">
          <input
            className="gm-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Phone">
          <input
            className="gm-input"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Village / location">
          <input
            className="gm-input"
            value={form.village}
            onChange={(e) => set("village", e.target.value)}
          />
        </Field>
        <Field label="Employment type">
          <select
            className="gm-select"
            value={form.empType}
            onChange={(e) => set("empType", e.target.value)}
          >
            <option>Permanent</option>
            <option>Seasonal</option>
            <option>Casual</option>
            <option>Contract</option>
          </select>
        </Field>
        <Field label="Daily rate (KES)">
          <input
            className="gm-input"
            type="number"
            min={1}
            value={form.dailyRate}
            onChange={(e) => set("dailyRate", Number(e.target.value) || 0)}
          />
        </Field>
        <Field label="Skill level">
          <select
            className="gm-select"
            value={form.skillLevel}
            onChange={(e) => set("skillLevel", e.target.value)}
          >
            <option>New</option>
            <option>Trained</option>
            <option>Experienced</option>
          </select>
        </Field>
        <Field label="Pay frequency">
          <select
            className="gm-select"
            value={form.payFreq}
            onChange={(e) => set("payFreq", e.target.value)}
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Bi-weekly</option>
            <option>Monthly</option>
            <option>End of task</option>
          </select>
        </Field>
        <Field label="Pay method">
          <select
            className="gm-select"
            value={form.payMethod}
            onChange={(e) => set("payMethod", e.target.value)}
          >
            <option>GrowMO wallet M-Pesa</option>
            <option>Manual M-Pesa</option>
            <option>Cash</option>
            <option>Bank transfer</option>
          </select>
        </Field>
        <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
          <span>Health notes</span>
          <textarea
            className="gm-input"
            rows={2}
            value={form.healthNotes}
            onChange={(e) => set("healthNotes", e.target.value)}
          />
        </div>
        <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
          <span>Notes</span>
          <textarea
            className="gm-input"
            rows={2}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={save}
          disabled={!form.name.trim() || form.dailyRate <= 0}
        >
          <Check /> Save changes
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 4 · change status ================= */

export function ChangeStatusDialog(
  props: TeamModalsProps & { workerId: string },
) {
  const { workerId, setModal, workers, setWorkers, notify } = props;
  const orig = workers.find((x) => x.id === workerId);
  const [status, setStatus] = useState<Worker["status"]>(
    orig && orig.status !== "Active" ? orig.status : "Suspended",
  );
  const [reason, setReason] = useState("");
  if (!orig) return null;
  const confirm = () => {
    setWorkers((ws) =>
      ws.map((w) =>
        w.id === workerId
          ? {
              ...w,
              status,
              statusNote:
                status === orig.status
                  ? w.statusNote
                  : `${status} from 23/10/2026 — ${reason.trim() || "no reason recorded"}.`,
              notes: reason.trim() ? `${w.notes} · ${reason.trim()}` : w.notes,
            }
          : w,
      ),
    );
    notify(`${orig.name} is now ${status.toLowerCase()}.`, "success");
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Change status — ${orig.name}`}
    >
      <Field label="New status">
        <select
          className="gm-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as Worker["status"])}
        >
          <option>Active</option>
          <option>Inactive</option>
          <option>Suspended</option>
          <option>Terminated</option>
          <option>On leave</option>
        </select>
      </Field>
      <div className="mt-2">
        <Field label="Reason (saved to the worker's file)">
          <textarea
            className="gm-input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              status === "Suspended"
                ? "e.g. 3 unexcused absences — review scheduled 30/10"
                : status === "Terminated"
                  ? "e.g. contract ended 28/02/2027, final pay cleared"
                  : "e.g. returning after maternity leave"
            }
          />
        </Field>
      </div>
      {status === "Terminated" ? (
        <p className="gm-form-err">
          Termination is permanent in the directory. Final pay, leave pro-ration
          and the payslip history stay on record.
        </p>
      ) : null}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger"
          onClick={confirm}
          disabled={status === orig.status || !reason.trim()}
        >
          Confirm {status.toLowerCase()}
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 5 · payslip detail ================= */

export function PayslipDialog(props: TeamModalsProps & { workerId: string }) {
  const { workerId, setModal, lines, workers } = props;
  const w = workers.find((x) => x.id === workerId);
  const l = lines.find((x) => x.workerId === workerId);
  if (!w || !l) return null;
  const net = payslipNet(l);
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Payslip — ${w.name}`}
      desc={`Payroll week Oct 20 – 26, 2026 · ${w.payMethod}`}
    >
      <table className="gm-table gm-team-ps">
        <thead>
          <tr>
            <th>Line</th>
            <th>Calc</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic pay</td>
            <td>
              {l.daysWorked} day{l.daysWorked === 1 ? "" : "s"} ×{" "}
              {kes(l.dailyRate)}
            </td>
            <td className="num font-display">{kes(l.basic)}</td>
          </tr>
          {l.otPay > 0 ? (
            <tr>
              <td>Overtime</td>
              <td>
                {l.otHours} hr × {kes(l.otRate)} (1.5× hourly)
              </td>
              <td className="num font-display">{kes(l.otPay)}</td>
            </tr>
          ) : null}
          {l.piece > 0 ? (
            <tr>
              <td>Piece rate</td>
              <td>{l.pieceNote}</td>
              <td className="num font-display">{kes(l.piece)}</td>
            </tr>
          ) : null}
          {l.bonus > 0 ? (
            <tr>
              <td>Bonus</td>
              <td>{l.bonusNote ?? "Approved this week"}</td>
              <td className="num font-display">{kes(l.bonus)}</td>
            </tr>
          ) : null}
          {l.absenceDed > 0 ? (
            <tr className="gm-team-ps-ded">
              <td>Absence deduction</td>
              <td>{l.absenceNote}</td>
              <td className="num font-display">−{kes(l.absenceDed)}</td>
            </tr>
          ) : null}
          {l.advanceDed > 0 ? (
            <tr className="gm-team-ps-ded">
              <td>Advance repayment</td>
              <td>Per repayment plan</td>
              <td className="num font-display">−{kes(l.advanceDed)}</td>
            </tr>
          ) : null}
          {l.otherDed > 0 ? (
            <tr className="gm-team-ps-ded">
              <td>Deduction</td>
              <td>{l.otherNote}</td>
              <td className="num font-display">−{kes(l.otherDed)}</td>
            </tr>
          ) : null}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>Net pay (M-Pesa)</th>
            <th className="num font-display gm-team-ps-net">{kes(net)}</th>
          </tr>
        </tfoot>
      </table>
      {w.statusNote ? <p className="text-muted mt-2">{w.statusNote}</p> : null}
      <p className="text-muted">
        Written payslip on file — Labour Act requires one every pay cycle. The
        SMS receipt mirrors these lines.
      </p>
    </Dialog>
  );
}

/* ================= 6 · leave request ================= */

export function LeaveDialog(props: TeamModalsProps & { workerId: string }) {
  const { workerId, setModal, workers, setWorkers, notify } = props;
  const orig = workers.find((x) => x.id === workerId);
  const [type, setType] = useState("Annual");
  const [from, setFrom] = useState("01/11/2026");
  const [days, setDays] = useState(5);
  if (!orig) return null;
  const save = () => {
    setWorkers((ws) =>
      ws.map((w) =>
        w.id === workerId
          ? {
              ...w,
              status: "On leave",
              statusNote: `${type} leave ${from} · ${days} day${days === 1 ? "" : "s"} — approved 23/10/2026.`,
            }
          : w,
      ),
    );
    notify(
      `${orig.name}: ${type.toLowerCase()} leave booked from ${from}.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Leave request — ${orig.name}`}
    >
      <div className="gm-form-grid">
        <Field
          label="Leave type"
          hint={
            orig.empType === "Permanent"
              ? "Permanent staff: 21 days annual, 7+7 sick, 90 days maternity."
              : "Casual/seasonal: pro-rated by contract terms."
          }
        >
          <select
            className="gm-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Annual</option>
            <option>Sick</option>
            <option>Maternity</option>
            <option>Compassionate</option>
            <option>Unpaid</option>
          </select>
        </Field>
        <Field label="Start date">
          <input
            className="gm-input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </Field>
        <Field label="Days">
          <input
            className="gm-input"
            type="number"
            min={1}
            max={90}
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || 1)}
          />
        </Field>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={save}
          disabled={days < 1 || !from.trim()}
        >
          <Check /> Book leave
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 7 · contract PDF ================= */

export function ContractDialog(props: TeamModalsProps & { workerId: string }) {
  const { workerId, setModal, workers } = props;
  const w = workers.find((x) => x.id === workerId);
  const [phase, setPhase] = useState<"preview" | "done">("preview");
  if (!w) return null;
  const body = [
    `GROWMO — SEASONAL EMPLOYMENT AGREEMENT`,
    ``,
    `Farmer:        Mary Wanjiku — Mary's Farm, Githunguri, Kiambu`,
    `Worker:        ${w.name} (ID ${w.idNo})`,
    `Phone:         ${w.phone} · M-Pesa ${w.mpesaName} ${w.mpesaNo}`,
    `Type:          ${w.empType}${w.contractEnd ? ` · ends ${w.contractEnd}` : ""}`,
    `Rate:          ${kes(w.dailyRate)}/day · hourly ${kes(Math.round(w.dailyRate * 0.25))} · OT ×1.5`,
    `Piece rates:   ${w.pieceRates.length ? w.pieceRates.map((p) => `${p.task} ${p.rate}`).join("; ") : "none"}`,
    `Pay frequency: ${w.payFreq} · ${w.payMethod}`,
    ``,
    `Both parties agree to the Labour Act (Kenya) terms on minimum wage,`,
    `overtime, leave and payslips. Signed ${w.joinDate} · copy in GrowMO records.`,
  ].join("\n");
  const download = () => {
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-${w.id}-${w.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setPhase("done");
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Contract — ${w.name}`}
      desc="Seasonal agreement, Labour Act compliant."
    >
      {phase === "preview" ? (
        <>
          <pre className="gm-team-contract">{body}</pre>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal({ kind: "none" })}
            >
              Close
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={download}
            >
              <Download /> Download contract
            </button>
          </div>
        </>
      ) : (
        <div className="gm-receipt-done">
          <span className="gm-receipt-done-mark">
            <Check />
          </span>
          <p className="font-display">Contract downloaded</p>
          <small className="text-muted">
            Also filed in Records → Payroll &amp; contracts.
          </small>
          <button
            type="button"
            className="gm-btn gm-btn-primary mt-3"
            onClick={() => setModal({ kind: "none" })}
          >
            Done
          </button>
        </div>
      )}
    </Dialog>
  );
}

/* ================= 8 · post job wizard ================= */

export function PostJobWizard(props: TeamModalsProps) {
  const { setModal, setPosts, notify } = props;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "",
    duration: "2 weeks",
    rate: 500,
    needed: 2,
    accommodation: "Not provided",
    meals: "Lunch provided",
    requirements: "",
    channels: ["GrowMO community board", "WhatsApp group"] as string[],
  });
  const set = (k: string, v: string | number | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const allChannels = [
    "GrowMO community board",
    "WhatsApp group",
    "SMS to nearby workers",
    "Chief's office notice",
  ];
  const valid1 = form.title.trim().length >= 5 && form.needed >= 1;
  const finish = () => {
    const post: JobPost = {
      id: `JOB-0${17 + props.posts.length}`,
      title: form.title.trim(),
      skills: [form.duration, `KES ${form.rate}/day`],
      duration: form.duration,
      rate: `${kes(form.rate)}/day`,
      needed: form.needed,
      hired: 0,
      location: "Githunguri, Kiambu",
      accommodation: form.accommodation as JobPost["accommodation"],
      meals: form.meals as JobPost["meals"],
      requirements: form.requirements || "None",
      howToApply: "Call 0712 345 678 or visit farm",
      posted: "23/10/2026",
      closes: "30/10/2026",
      channels: form.channels as string[],
      status: "Open",
    };
    setPosts((ps) => [post, ...ps]);
    notify(
      `Post ${post.id} is live on ${form.channels.length} channel${form.channels.length === 1 ? "" : "s"}.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Post a job"
      desc="Reach workers around Githunguri on the channels you pick."
      wide
    >
      <Stepper
        steps={["Role", "Terms", "Channels"]}
        current={step}
        onStep={(i) => i < step && setStep(i)}
      />
      {step === 0 ? (
        <div className="gm-form-grid">
          <Field label="Job title">
            <input
              className="gm-input"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Casual farm worker — tomato harvesting"
            />
          </Field>
          <Field label="Duration">
            <select
              className="gm-select"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
            >
              <option>1 week</option>
              <option>2 weeks</option>
              <option>4 weeks</option>
              <option>3 months</option>
              <option>6 months</option>
            </select>
          </Field>
          <Field label="Day rate (KES)">
            <input
              className="gm-input"
              type="number"
              min={1}
              value={form.rate}
              onChange={(e) => set("rate", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Workers needed">
            <input
              className="gm-input"
              type="number"
              min={1}
              max={20}
              value={form.needed}
              onChange={(e) => set("needed", Number(e.target.value) || 1)}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid">
          <Field label="Accommodation">
            <select
              className="gm-select"
              value={form.accommodation}
              onChange={(e) => set("accommodation", e.target.value)}
            >
              <option>Not provided</option>
              <option>Provided</option>
            </select>
          </Field>
          <Field label="Meals">
            <select
              className="gm-select"
              value={form.meals}
              onChange={(e) => set("meals", e.target.value)}
            >
              <option>Not provided</option>
              <option>Lunch provided</option>
            </select>
          </Field>
          <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
            <span>Requirements</span>
            <textarea
              className="gm-input"
              rows={2}
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              placeholder="e.g. PCPB certificate, own jembe preferred"
            />
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div>
          <p className="gm-eyebrow">Choose channels</p>
          <div className="gm-team-channel-list">
            {allChannels.map((c) => (
              <label key={c} className="gm-check-row">
                <input
                  type="checkbox"
                  checked={form.channels.includes(c)}
                  onChange={(e) =>
                    set(
                      "channels",
                      e.target.checked
                        ? [...form.channels, c]
                        : form.channels.filter((x) => x !== c),
                    )
                  }
                />
                <span>
                  <strong>{c}</strong>
                  <small className="text-muted d-block">
                    {c === "GrowMO community board"
                      ? "Listed on the page-13 community board, searchable by village & skill"
                      : c === "WhatsApp group"
                        ? "Auto-shared to your farm WhatsApp group with the rate and dates"
                        : c === "SMS to nearby workers"
                          ? `SMS blast to your ${14} nearby workers within 5 km`
                          : "Printed notice at the chief's office, Githunguri"}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => (step === 2 ? finish() : setStep((s) => s + 1))}
        nextLabel="Continue"
        finishLabel="Post job"
        nextDisabled={
          step === 0 ? !valid1 : step === 2 ? form.channels.length === 0 : false
        }
      />
    </Dialog>
  );
}

/* ================= 9 · applicant detail ================= */

export function ApplicantDetailDialog(
  props: TeamModalsProps & { applicantId: string },
) {
  const { applicantId, setModal, applicants, setApplicants, notify } = props;
  const a = applicants.find((x) => x.id === applicantId);
  const [stage, setStage] = useState<Applicant["stage"]>(a?.stage ?? "Applied");
  if (!a) return null;
  const save = (s: Applicant["stage"]) => {
    setApplicants((as) =>
      as.map((x) => (x.id === applicantId ? { ...x, stage: s } : x)),
    );
    setStage(s);
    if (s === "Hired" || s === "Declined") {
      notify(
        `${a.name}: ${s.toLowerCase()}. ${s === "Hired" ? "Added to onboarding." : ""}`,
        "success",
      );
      setModal({ kind: s === "Hired" ? "onboarding" : "none", applicantId });
    }
  };
  const stages: Applicant["stage"][] = [
    "Applied",
    "Shortlisted",
    "Onboarding",
    "Hired",
    "Declined",
  ];
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={a.name}
      desc={`${a.id} · applied ${a.applied} for ${a.job}`}
    >
      <dl className="gm-deflist">
        <div>
          <dt>Phone</dt>
          <dd>{a.phone}</dd>
        </div>
        <div>
          <dt>Village</dt>
          <dd>{a.village}</dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd>{a.skills.join(", ")}</dd>
        </div>
        <div>
          <dt>Last worked</dt>
          <dd>{a.lastWorked}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{stage}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{a.note}</dd>
        </div>
      </dl>
      <p className="gm-eyebrow mt-3">Move stage</p>
      <div className="gm-chip-row">
        {stages.map((s) => (
          <button
            key={s}
            type="button"
            className={`gm-filter-chip ${stage === s ? "on" : ""}`}
            onClick={() => save(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 10 · onboarding checklist ================= */

export function OnboardingChecklistDialog(
  props: TeamModalsProps & { applicantId: string },
) {
  const { applicantId, setModal, applicants, onb, setOnb, notify } = props;
  const a = applicants.find((x) => x.id === applicantId);
  const done = onb[applicantId] ?? 0;
  if (!a) return null;
  const tick = (i: number) => {
    let nextDone: number;
    if (i === done - 1)
      nextDone = i; // undo the last completed step
    else if (i === done)
      nextDone = i + 1; // complete the next step
    else return;
    setOnb((o) => ({ ...o, [applicantId]: nextDone }));
    if (nextDone === ONBOARDING_STEPS.length) {
      notify(
        `${a.name} is fully onboarded — added to the directory.`,
        "success",
      );
    }
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Onboarding — ${a.name}`}
      desc="The 8-step checklist. Tick each step as you go; the worker joins the directory when it's done."
      wide
    >
      <ol className="gm-team-onb-steps">
        {ONBOARDING_STEPS.map((s, i) => {
          const isDone = i < done;
          return (
            <li
              key={s}
              className={`gm-team-onb-step ${isDone ? "is-done" : ""}`}
            >
              <button
                type="button"
                className="gm-team-onb-dot"
                aria-label={`${isDone ? "Undo" : "Complete"} step ${i + 1}: ${s}`}
                onClick={() => tick(i)}
              >
                {isDone ? <Check /> : i + 1}
              </button>
              <span className="gm-team-onb-text">{s}</span>
              {i === 2 && isDone ? (
                <span className="gm-chip gm-risk gm-risk-low">
                  M-Pesa name matches ID
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="d-flex align-items-center justify-content-between mt-3">
        <span className="text-muted">
          {Math.min(done, ONBOARDING_STEPS.length)}/{ONBOARDING_STEPS.length}{" "}
          complete
        </span>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => setModal({ kind: "none" })}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 11 · mark attendance ================= */

export function MarkAttendanceDialog(props: TeamModalsProps) {
  const { setModal, workers, setWorkers, notify } = props;
  const active = workers.filter(
    (w) => w.status === "Active" || w.status === "On leave",
  );
  const [picked, setPicked] = useState<
    Record<string, { status: AttStatus; task: string; note: string }>
  >(() =>
    Object.fromEntries(
      active.map((w) => [
        w.id,
        { status: "Present" as AttStatus, task: "", note: "" },
      ]),
    ),
  );
  const mark = (
    id: string,
    patch: Partial<{ status: AttStatus; task: string; note: string }>,
  ) => setPicked((p) => ({ ...p, [id]: { ...p[id], ...patch } }));
  const save = () => {
    setWorkers((ws) =>
      ws.map((w) => {
        const p = picked[w.id];
        if (!p) return w;
        if (p.status === "Absent")
          return {
            ...w,
            absentsMonth: w.absentsMonth + 1,
            attendancePct: Math.max(0, w.attendancePct - 4),
          };
        if (p.status === "Late") return { ...w, latesMonth: w.latesMonth + 1 };
        if (p.status === "Half day")
          return { ...w, attendancePct: Math.max(0, w.attendancePct - 2) };
        return w;
      }),
    );
    const n = Object.values(picked).filter(
      (p) => p.status === "Present" || p.status === "Late",
    ).length;
    notify(`Attendance saved for ${n} present workers today.`, "success");
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Mark today's attendance"
      desc="Friday 23/10/2026 — tick each worker, then save once."
      wide
    >
      <div className="gm-team-attmark">
        {active.map((w) => {
          const p = picked[w.id];
          return (
            <div key={w.id} className="gm-team-attmark-row">
              <strong>{w.name.split(" ").slice(0, 2).join(" ")}</strong>
              <div className="gm-chip-row">
                {(["Present", "Late", "Half day", "Absent"] as AttStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      type="button"
                      className={`gm-filter-chip ${p.status === s ? "on" : ""}`}
                      onClick={() => mark(w.id, { status: s })}
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
              <input
                className="gm-input gm-input-sm"
                placeholder="Task (e.g. Weeding Plot 1)"
                value={p.task}
                onChange={(e) => mark(w.id, { task: e.target.value })}
              />
            </div>
          );
        })}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-primary" onClick={save}>
          <ClipboardCheck /> Save register
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 12 · check-in simulator ================= */

export function CheckInSimulatorDialog(props: TeamModalsProps) {
  const { setModal, notify } = props;
  const [worker, setWorker] = useState("John Mwangi (0712 345 678)");
  const [method, setMethod] = useState<"sms" | "ussd">("sms");
  const [phase, setPhase] = useState<"pick" | "run" | "done">("pick");
  useProcessed(phase === "run", 1800, () => setPhase("done"));
  const send = () => {
    setPhase("run");
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Check-in simulator"
      desc="See how a worker's SMS or USSD check-in lands in the register."
    >
      {phase === "pick" ? (
        <div>
          <Field label="Worker">
            <select
              className="gm-select"
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
            >
              <option>John Mwangi (0712 345 678)</option>
              <option>Peter Kamau (0723 456 789)</option>
              <option>Grace Wanjiku (0734 567 890)</option>
              <option>David Maina (0709 888 222)</option>
            </select>
          </Field>
          <div className="mt-2 gm-form-grid">
            <label className="gm-check-row">
              <input
                type="radio"
                name="sim-method"
                checked={method === "sms"}
                onChange={() => setMethod("sms")}
              />
              <span>
                <strong>SMS check-in</strong>
                <small className="text-muted d-block">
                  Texts "IN" to 20550
                </small>
              </span>
            </label>
            <label className="gm-check-row">
              <input
                type="radio"
                name="sim-method"
                checked={method === "ussd"}
                onChange={() => setMethod("ussd")}
              />
              <span>
                <strong>USSD check-in</strong>
                <small className="text-muted d-block">Dials *384*3*1#</small>
              </span>
            </label>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal({ kind: "none" })}
            >
              Close
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={send}
            >
              {method === "sms" ? <MessageSquare /> : <Smartphone />} Simulate{" "}
              {method === "sms" ? "SMS" : "USSD"}
            </button>
          </div>
        </div>
      ) : phase === "run" ? (
        <div className="gm-processing">
          <span className="gm-spinner" aria-hidden />
          <p>
            {method === "sms"
              ? `Waiting for "IN" from ${worker.split(" (")[0]}…`
              : "USSD session with Safaricom…"}
          </p>
          <small className="text-muted">
            The register updates the moment it lands
          </small>
        </div>
      ) : (
        <div>
          {method === "sms" ? (
            <div className="gm-team-simpair">
              <SmsPreview
                direction="out"
                text={`IN — ${worker.split(" (")[0]}`}
              />
              <SmsPreview
                direction="in"
                text="Shukran! You are checked in for Mary's Farm. Time: 08:42. — GrowMO"
              />
            </div>
          ) : (
            <pre className="gm-team-ussd">
              {`Safaricom — GrowMO Attendance
1. Check in      ← you are here
2. Check out
3. My hours
* Back

✓ Checked in: ${worker.split(" (")[0]}
  Farm:    Mary's Farm, Githunguri
  Time:    08:42:10
  Ref:     USS-7Q3M2K`}
            </pre>
          )}
          <div className="gm-receipt-done mt-2">
            <span className="gm-receipt-done-mark">
              <Check />
            </span>
            <p className="font-display">Logged to today's register</p>
            <small className="text-muted">
              Timestamped with the network time — no farmer input needed.
            </small>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setPhase("pick");
                setWorker("John Mwangi (0712 345 678)");
              }}
            >
              Again
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => {
                notify(
                  `Check-in registered for ${worker.split(" (")[0]}.`,
                  "success",
                );
                setModal({ kind: "none" });
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function SmsPreview({
  direction,
  text,
}: {
  direction: "in" | "out";
  text: string;
}) {
  return (
    <div className={`gm-sms gm-sms-${direction}`}>
      <div className="gm-sms-bubble">{text}</div>
    </div>
  );
}

/* ================= 13 · rate a task ================= */

export function RateTaskDialog(props: TeamModalsProps) {
  const { setModal, notify } = props;
  const [worker, setWorker] = useState("John Mwangi");
  const [task, setTask] = useState("Weeding");
  const [plot, setPlot] = useState("Plot 1 — cabbage");
  const [stars, setStars] = useState(4);
  const [rework, setRework] = useState(false);
  const [note, setNote] = useState("");
  const save = () => {
    notify(
      `${worker} rated ${stars}★ for ${task.toLowerCase()} (${plot}).`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Rate a finished task"
      desc="Your rating updates the worker's performance card and the farm average."
    >
      <div className="gm-form-grid">
        <Field label="Worker">
          <select
            className="gm-select"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
          >
            {[
              "John Mwangi",
              "Peter Kamau",
              "Grace Wanjiku",
              "Samuel Njoroge",
              "Joseph Muthoni",
              "Lucy Wambui",
              "David Maina",
              "Ruth Wairimu",
            ].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Task">
          <select
            className="gm-select"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          >
            {[
              "Weeding",
              "Transplanting",
              "Spraying",
              "Harvesting",
              "Irrigation",
              "Packing",
              "Fencing",
              "Loading",
              "Watering",
              "Nursery batch",
            ].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Plot / area">
          <input
            className="gm-input"
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
          />
        </Field>
      </div>
      <div className="gm-team-starpick">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={stars === s}
            aria-label={`Rate ${s} star${s === 1 ? "" : "s"}`}
            className={`gm-team-star ${s <= stars ? "on" : ""}`}
            onClick={() => setStars(s)}
          >
            <Star />
          </button>
        ))}
        <span className="gm-team-star-label">
          {stars}/5 ·{" "}
          {
            ["Poor", "Below average", "Satisfactory", "Good", "Excellent"][
              stars - 1
            ]
          }
        </span>
      </div>
      <label className="gm-check-row mt-2">
        <input
          type="checkbox"
          checked={rework}
          onChange={(e) => setRework(e.target.checked)}
        />
        <span>
          <strong>Rework was needed</strong>
          <small className="text-muted d-block">
            Counted in the rework rate on the performance card
          </small>
        </span>
      </label>
      <div className="mt-2">
        <Field label="Note (optional)">
          <textarea
            className="gm-input"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Clean rows, missed nothing near the base"
          />
        </Field>
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button type="button" className="gm-btn gm-btn-primary" onClick={save}>
          <Star /> Save rating
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 14 · performance review ================= */

export function PerformanceReviewDialog(
  props: TeamModalsProps & { workerName: string },
) {
  const { workerName, setModal, notify } = props;
  const [focus, setFocus] = useState("");
  const [action, setAction] = useState("");
  const save = () => {
    notify(
      `Review saved for ${workerName} — note added to the file.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Performance review — ${workerName}`}
      desc="Monthly review: what to keep, what to work on, what to do about it."
    >
      <div className="gm-form-grid">
        <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
          <span>This month's focus</span>
          <textarea
            className="gm-input"
            rows={3}
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. Steady 5★ transplanting; weeding speed slipped on the new plots"
          />
        </div>
        <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
          <span>Action plan</span>
          <textarea
            className="gm-input"
            rows={2}
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Pair with Samuel for two spraying sessions; revisit pace on weeding"
          />
        </div>
      </div>
      <p className="text-muted">
        Ratings, rework and attendance numbers update automatically from task
        ratings — this review adds the human note.
      </p>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={save}
          disabled={!focus.trim()}
        >
          <Check /> Save review
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 15 · payroll review ================= */

export function PayrollReviewDialog(props: TeamModalsProps) {
  const { setModal, lines, setLines, payrollStage, setPayrollStage, notify } =
    props;
  const [bonus, setBonus] = useState<Record<string, number>>({});
  const [ded, setDed] = useState<Record<string, number>>({});
  const [dedNote, setDedNote] = useState<Record<string, string>>({});
  const [bonusNote, setBonusNote] = useState<Record<string, string>>({});
  const total = lines.reduce(
    (s, l) =>
      s + payslipNet(l) + (bonus[l.workerId] ?? 0) - (ded[l.workerId] ?? 0),
    0,
  );
  const approve = () => {
    setLines((ls) =>
      ls.map((l) => ({
        ...l,
        bonus: (l.bonus ?? 0) + (bonus[l.workerId] ?? 0),
        bonusNote: bonus[l.workerId]
          ? bonusNote[l.workerId] || "Approved in review"
          : l.bonusNote,
        otherDed: l.otherDed + (ded[l.workerId] ?? 0),
        otherNote: ded[l.workerId]
          ? dedNote[l.workerId] || "Manual deduction"
          : l.otherNote,
      })),
    );
    if (payrollStage === 0) {
      setPayrollStage(1);
      notify("Payslips reviewed — ready for the PIN gate.", "success");
    }
    setModal({ kind: "payroll-approve" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Review the payslips"
      desc={`Week Oct 20 – 26 · ${lines.length} workers. Add a bonus or deduction per worker, then approve.`}
      wide
    >
      <table className="gm-table gm-team-ps">
        <thead>
          <tr>
            <th>Worker</th>
            <th className="num">Basic</th>
            <th className="num">OT + piece</th>
            <th className="num">Deductions</th>
            <th className="num">Net so far</th>
            <th>Bonus (+)</th>
            <th>Deduction (−)</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => {
            const curNet =
              payslipNet(l) + (bonus[l.workerId] ?? 0) - (ded[l.workerId] ?? 0);
            return (
              <tr key={l.workerId}>
                <th scope="row">{l.worker}</th>
                <td className="num">{kes(l.basic)}</td>
                <td className="num">{kes(l.otPay + l.piece)}</td>
                <td className="num">
                  {kes(l.absenceDed + l.advanceDed + l.otherDed)}
                </td>
                <td className="num font-display">{kes(curNet)}</td>
                <td>
                  <input
                    className="gm-input gm-input-sm gm-input-num"
                    type="number"
                    min={0}
                    value={bonus[l.workerId] ?? 0}
                    placeholder="0"
                    onChange={(e) =>
                      setBonus((b) => ({
                        ...b,
                        [l.workerId]: Number(e.target.value) || 0,
                      }))
                    }
                  />
                  {bonus[l.workerId] ? (
                    <input
                      className="gm-input gm-input-sm"
                      placeholder="reason"
                      value={bonusNote[l.workerId] ?? ""}
                      onChange={(e) =>
                        setBonusNote((b) => ({
                          ...b,
                          [l.workerId]: e.target.value,
                        }))
                      }
                    />
                  ) : null}
                </td>
                <td>
                  <input
                    className="gm-input gm-input-sm gm-input-num"
                    type="number"
                    min={0}
                    value={ded[l.workerId] ?? 0}
                    placeholder="0"
                    onChange={(e) =>
                      setDed((d) => ({
                        ...d,
                        [l.workerId]: Number(e.target.value) || 0,
                      }))
                    }
                  />
                  {ded[l.workerId] ? (
                    <input
                      className="gm-input gm-input-sm"
                      placeholder="reason"
                      value={dedNote[l.workerId] ?? ""}
                      onChange={(e) =>
                        setDedNote((d) => ({
                          ...d,
                          [l.workerId]: e.target.value,
                        }))
                      }
                    />
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>Total for the week</th>
            <th colSpan={3} className="num font-display gm-team-ps-net">
              {kes(Math.round(total))}
            </th>
          </tr>
        </tfoot>
      </table>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Keep as draft
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={approve}
        >
          <ShieldCheck /> Approve &amp; go to PIN
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 16 · payroll approve (PIN) ================= */

export function PayrollApproveDialog(props: TeamModalsProps) {
  const { setModal, lines, setPayrollStage, notify } = props;
  const [attempt, setAttempt] = useState(0);
  const total = lines.reduce((s, l) => s + payslipNet(l), 0);
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Approve payroll"
      desc={`Week Oct 20 – 26 · ${lines.length} payments · ${kes(Math.round(total))} total`}
      dismissable={false}
    >
      <div className="gm-money-confirm">
        <span className="gm-eyebrow">Approval required</span>
        <p className="font-display gm-money-amount">{kes(Math.round(total))}</p>
        <p className="text-muted">
          Four M-Pesa payouts: John {kes(Math.round(payslipNet(lines[0])))} ·
          Peter {kes(Math.round(payslipNet(lines[1])))} · Grace{" "}
          {kes(Math.round(payslipNet(lines[2])))} · Samuel{" "}
          {kes(Math.round(payslipNet(lines[3])))}
        </p>
      </div>
      <PinPad
        length={6}
        resetKey={attempt}
        onComplete={(p) => {
          if (p === "123456") {
            setPayrollStage(2);
            notify("Payroll approved. Opening the M-Pesa batch…", "success");
            setModal({ kind: "batch-pay" });
          } else {
            setAttempt((a) => a + 1);
          }
        }}
      />
      <p className="text-muted">
        {attempt > 0
          ? "Wrong PIN — try again (demo PIN 123456)."
          : "Enter your 6-digit GrowMO PIN · demo 123456"}
      </p>
    </Dialog>
  );
}

/* ================= 17 · batch M-Pesa payment ================= */

export function BatchPaymentDialog(props: TeamModalsProps) {
  const { setModal, lines, setWallet, setPayrollStage, notify } = props;
  const [phase, setPhase] = useState<"confirm" | "run" | "done">("confirm");
  const total = lines.reduce((s, l) => s + payslipNet(l), 0);
  useProcessed(phase === "run", 2600, () => setPhase("done"));
  const run = () => {
    setPhase("run");
  };
  const finish = () => {
    setWallet((w) => Math.round((w - total) * 100) / 100);
    setPayrollStage(3);
    notify(
      `Batch paid — ${kes(Math.round(total))} sent to ${lines.length} workers.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => phase !== "run" && setModal({ kind: "none" })}
      title="Run the M-Pesa batch"
      desc="Four STK pushes from the GrowMO wallet — same network as your own M-Pesa."
      dismissable={phase !== "run"}
      wide
    >
      {phase === "confirm" ? (
        <>
          <div className="gm-money-confirm">
            <span className="gm-eyebrow">GrowMO wallet → workers</span>
            <p className="font-display gm-money-amount">
              {kes(Math.round(total))}
            </p>
            <p className="text-muted">
              Wallet balance after: {kes(Math.round(props.wallet - total))}
            </p>
          </div>
          <ul className="gm-team-batchlist">
            {lines.map((l) => {
              const wk = props.workers.find((w) => w.id === l.workerId);
              return (
                <li key={l.workerId} className="d-flex justify-content-between">
                  <span>
                    {l.worker} · {wk?.mpesaNo ?? "—"}
                  </span>
                  <strong className="font-display">{kes(payslipNet(l))}</strong>
                </li>
              );
            })}
          </ul>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal({ kind: "none" })}
            >
              Not yet
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={run}
            >
              <WalletCards /> Send {lines.length} payments
            </button>
          </div>
        </>
      ) : phase === "run" ? (
        <div className="gm-processing">
          <span className="gm-spinner" aria-hidden />
          <p>Pushing STK requests one by one…</p>
          <small className="text-muted">
            Each worker approves on their phone · receipts follow automatically
          </small>
        </div>
      ) : (
        <div>
          <div className="gm-receipt-done">
            <span className="gm-receipt-done-mark">
              <Check />
            </span>
            <p className="font-display">
              All {lines.length} payments delivered
            </p>
            <small className="text-muted">
              Wallet balance: {kes(Math.round(props.wallet - total))}
            </small>
          </div>
          <div className="gm-team-receipts">
            {lines.map((l) => {
              const wk = props.workers.find((w) => w.id === l.workerId);
              return (
                <div key={l.workerId} className="gm-team-receipt">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ flex: 1 }}>
                      <strong>{l.worker}</strong>
                      <small className="text-muted d-block">
                        {wk?.payMethod ?? "M-Pesa"}
                      </small>
                    </div>
                    <MoneyInline value={kes(payslipNet(l))} />
                  </div>
                  <code className="gm-team-ref">
                    {BATCH_RECEIPTS[l.workerId]}
                  </code>
                </div>
              );
            })}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                finish();
              }}
            >
              Skip SMS
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => {
                const wasTotal = total;
                setWallet((w) => Math.round((w - wasTotal) * 100) / 100);
                setPayrollStage(3);
                setModal({ kind: "payroll-sms" });
              }}
            >
              <MessageSquare /> Pay &amp; send SMS
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

function MoneyInline({ value }: { value: string }) {
  return <strong className="font-display gm-team-money">{value}</strong>;
}

/* ================= 18 · payslip SMS ================= */

export function PayslipSmsDialog(props: TeamModalsProps) {
  const { setModal, lines, notify } = props;
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const allSent = lines.every((l) => sent[l.workerId]);
  const sendOne = (id: string) => {
    setSent((s) => ({ ...s, [id]: true }));
  };
  const sendAll = () => {
    setSent(Object.fromEntries(lines.map((l) => [l.workerId, true])));
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Payslip SMS"
      desc="Every payout goes with a line-item SMS in English + Kiswahili — the written payslip on paper."
      wide
    >
      <div className="gm-team-smslist">
        {lines.map((l) => {
          const ref = BATCH_RECEIPTS[l.workerId];
          const text = PAYROLL_SMS(
            l.worker.split(" ")[0],
            String(payslipNet(l)),
            ref,
          );
          return (
            <div key={l.workerId} className="gm-team-smscard">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong>
                  {l.worker} · {l.workerId}
                </strong>
                {sent[l.workerId] ? (
                  <span className="gm-chip gm-risk gm-risk-low">Sent</span>
                ) : (
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={() => sendOne(l.workerId)}
                  >
                    <MessageSquare /> Send
                  </button>
                )}
              </div>
              <SmsBubble text={text} from="20550 → worker" />
            </div>
          );
        })}
      </div>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          disabled={!Object.values(sent).some(Boolean)}
          onClick={() => {
            notify("Payslip SMS sent.", "success");
            setModal({ kind: "none" });
          }}
        >
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={() => {
            sendAll();
            notify(`SMS sent to all ${lines.length} workers.`, "success");
            setModal({ kind: "none" });
          }}
          disabled={allSent}
        >
          <Mail /> Send to everyone
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 19 · new advance ================= */

export function NewAdvanceDialog(props: TeamModalsProps) {
  const { setModal, workers, advances, setAdvances, setWallet, notify } = props;
  const [step, setStep] = useState(0);
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "");
  const [amount, setAmount] = useState(1000);
  const [reason, setReason] = useState("School fees");
  const [weeks, setWeeks] = useState(5);
  const w = workers.find((x) => x.id === workerId);
  const perWeek = Math.ceil(amount / Math.max(1, weeks));
  const finish = () => {
    if (!w) return;
    const rec: AdvanceRec = {
      id: `ADV-${String(advances.length + 5).padStart(3, "0")}`,
      worker: w.name.split(" ").slice(0, 2).join(" "),
      workerId: w.id,
      type: "Advance",
      amount,
      date: "23/10/2026",
      reason,
      plan: `Deduct ${kes(perWeek)}/week for ${weeks} week${weeks === 1 ? "" : "s"}`,
      remaining: amount,
      status: "Repaying",
    };
    setAdvances((a) => [rec, ...a]);
    setWallet((bal) => Math.round((bal - amount) * 100) / 100);
    notify(
      `Advance ${rec.id} (${kes(amount)}) recorded for ${rec.worker}.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Give an advance"
      desc="Paid now from the wallet, repaid in named weekly deductions on the payslip."
    >
      <Stepper
        steps={["Amount", "Repayment plan"]}
        current={step}
        onStep={(i) => i < step && setStep(i)}
      />
      {step === 0 ? (
        <div className="gm-form-grid">
          <Field label="Worker">
            <select
              className="gm-select"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            >
              {workers
                .filter((x) => x.status === "Active")
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name.split(" ").slice(0, 2).join(" ")}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Amount (KES)">
            <input
              className="gm-input"
              type="number"
              min={100}
              step={100}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
            />
          </Field>
          <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
            <span>Reason (shown on the payslip)</span>
            <input
              className="gm-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. School fees, medical, transport"
            />
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div>
          <Field label="Repay over (weeks)">
            <select
              className="gm-select"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value) || 1)}
            >
              {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} week{n === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </Field>
          <div className="gm-card-inset mt-2">
            <p>
              <strong className="font-display">{kes(perWeek)}</strong> / week ×{" "}
              {weeks} weeks
            </p>
            <p className="text-muted mb-0">
              First deduction lands next payroll (week of Oct 27). The payslip
              line is named “{reason || "Advance repayment"}”.
            </p>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep((s) => s - 1)}
        onNext={() => (step === 1 ? finish() : setStep((s) => s + 1))}
        nextLabel="Continue"
        finishLabel={`Pay ${kes(Math.round(amount))} & record`}
        nextDisabled={amount < 100 || !reason.trim() || !workerId}
      />
    </Dialog>
  );
}

/* ================= 20 · new deduction ================= */

export function DeductionDialog(props: TeamModalsProps) {
  const { setModal, workers, advances, setAdvances, notify } = props;
  const [workerId, setWorkerId] = useState(workers[0]?.id ?? "");
  const [amount, setAmount] = useState(300);
  const [reason, setReason] = useState("");
  const w = workers.find((x) => x.id === workerId);
  const save = () => {
    if (!w) return;
    const rec: AdvanceRec = {
      id: `DED-${String(advances.filter((a) => a.type === "Deduction").length + 3).padStart(3, "0")}`,
      worker: w.name.split(" ").slice(0, 2).join(" "),
      workerId: w.id,
      type: "Deduction",
      amount,
      date: "23/10/2026",
      reason,
      plan: "Applied to the next payroll",
      remaining: 0,
      status: "Deducted",
    };
    setAdvances((a) => [rec, ...a]);
    notify(
      `Deduction ${rec.id} (${kes(amount)}) recorded against ${rec.worker}.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Record a deduction"
      desc="Named on the payslip — never a mystery number. Damage, absence or tool replacement."
    >
      <div className="gm-form-grid">
        <Field label="Worker">
          <select
            className="gm-select"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
          >
            {workers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name.split(" ").slice(0, 2).join(" ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Amount (KES)">
          <input
            className="gm-input"
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
        </Field>
        <div className="gm-field" style={{ gridColumn: "1 / -1" }}>
          <span>Reason</span>
          <input
            className="gm-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Broke sprayer nozzle, 1 day absent without notice"
          />
        </div>
      </div>
      <p className="text-muted">
        Labour Act: deductions must be agreed and itemised — both are recorded
        here automatically.
      </p>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={save}
          disabled={amount < 1 || !reason.trim()}
        >
          <Check /> Record deduction
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 21 · repay advance in full ================= */

export function RepayAdvanceDialog(props: TeamModalsProps & { recId: string }) {
  const { recId, setModal, advances, setAdvances, setWallet, notify } = props;
  const rec = advances.find((a) => a.id === recId);
  const [phase, setPhase] = useState<"pick" | "money">("pick");
  if (!rec) return null;
  const doConfirm = () => {
    setAdvances((as) =>
      as.map((a) =>
        a.id === recId ? { ...a, remaining: 0, status: "Settled" } : a,
      ),
    );
    setWallet((bal) => Math.round((bal - rec.remaining) * 100) / 100);
    notify(
      `${rec.id} settled in full — ${kes(rec.remaining)} returned.`,
      "success",
    );
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={`Repay ${rec.id}`}
      desc={`${rec.worker} · ${rec.reason}`}
    >
      {phase === "pick" ? (
        <>
          <div className="gm-money-confirm">
            <span className="gm-eyebrow">Outstanding balance</span>
            <p className="font-display gm-money-amount">{kes(rec.remaining)}</p>
            <p className="text-muted">
              {rec.plan} — {Math.ceil(rec.remaining / 200) || 1} weekly
              instalments left
            </p>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              disabled={rec.remaining <= 0}
              onClick={() => setPhase("money")}
            >
              <CircleDollarSign /> Repay in full from wallet
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setModal({ kind: "none" })}
            >
              Keep the weekly plan
            </button>
          </div>
        </>
      ) : (
        <MoneyConfirm
          amount={rec.remaining}
          from={`GrowMO wallet (Mary's Farm)`}
          to={`${rec.worker} · M-Pesa`}
          note="Full early repayment of the advance — ends the weekly deductions."
          onConfirm={doConfirm}
          onBack={() => setPhase("pick")}
        />
      )}
    </Dialog>
  );
}

/* ================= 22 · compliance detail ================= */

export function ComplianceDetailDialog(
  props: TeamModalsProps & { rowId: string },
) {
  const { rowId, setModal, compliance, setCompliance, notify } = props;
  const row = compliance.find((c) => c.id === rowId);
  if (!row) return null;
  const markMet = () => {
    setCompliance((cs) =>
      cs.map((c) =>
        c.id === rowId
          ? { ...c, status: "Met", note: `${c.note} Closed 23/10/2026.` }
          : c,
      ),
    );
    notify(`${row.requirement} marked as met.`, "success");
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={row.requirement}
      desc={row.details}
    >
      <dl className="gm-deflist">
        <div>
          <dt>How GrowMO tracks it</dt>
          <dd>{row.tracking}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{row.status}</dd>
        </div>
        <div>
          <dt>Current position</dt>
          <dd>{row.note}</dd>
        </div>
      </dl>
      {row.status !== "Met" ? (
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal({ kind: "none" })}
          >
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={markMet}
          >
            <Check /> Mark as met
          </button>
        </div>
      ) : (
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => setModal({ kind: "none" })}
          >
            Close
          </button>
        </div>
      )}
    </Dialog>
  );
}

/* ================= 23 · PPE checklist ================= */

export function PpeChecklistDialog(props: TeamModalsProps) {
  const { setModal, ppe, setPpe, notify } = props;
  const missing = ppe.filter((p) => !p.ok).length;
  const toggle = (id: string) =>
    setPpe((ps) => ps.map((p) => (p.id === id ? { ...p, ok: !p.ok } : p)));
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="PPE checklist — chemical handling"
      desc="Employer-provided by law. Tick items as the store is counted."
    >
      <div className="gm-team-channel-list">
        {ppe.map((p) => (
          <label key={p.id} className="gm-check-row">
            <input
              type="checkbox"
              checked={p.ok}
              onChange={() => toggle(p.id)}
            />
            <span>
              <strong>{p.item}</strong>
              {!p.ok ? (
                <small
                  className="d-block"
                  style={{ color: "var(--gm-clay-700)" }}
                >
                  Short / worn — order needed
                </small>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      <div className="d-flex align-items-center justify-content-between mt-3">
        <span
          className={`gm-chip ${missing ? "gm-risk gm-risk-medium" : "gm-risk gm-risk-low"}`}
        >
          {missing
            ? `${missing} item${missing === 1 ? "" : "s"} short`
            : "All PPE in place"}
        </span>
        <div className="d-flex gap-2">
          {missing ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => {
                notify(
                  "PPE order placed with Githunguri Agrovet — expected 25/10.",
                  "success",
                );
              }}
            >
              <HardHat /> Raise order
            </button>
          ) : null}
          <button
            type="button"
            className="gm-btn gm-btn-primary gm-btn-sm"
            onClick={() => setModal({ kind: "none" })}
          >
            Done
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ================= 24 · county benchmark ================= */

export function BenchmarkDialog(props: TeamModalsProps) {
  const { setModal } = props;
  const rows: [string, string, string, string][] = [
    ["Casual day rate", "KES 500–550", "KES 550 avg", "In range"],
    ["Overtime multiplier", "1.5× hourly", "1.5×", "Match"],
    ["Attendance rate", "93%", "85%", "Above"],
    ["Revenue per labour day", "KES 6,905", "KES 4,500", "Well above"],
    ["Turnover (12 mo)", "8%", "15%", "Below (good)"],
    ["Advances outstanding", "KES 1,600", "KES 1,100", "Slightly above"],
  ];
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Kiambu county benchmark"
      desc="Where your labour costs and quality sit against the county averages GrowMO compiles from member farms."
      wide
    >
      <table className="gm-table">
        <thead>
          <tr>
            <th>Measure</th>
            <th>Your farm</th>
            <th>County avg</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([m, you, avg, pos]) => (
            <tr key={m}>
              <th scope="row">{m}</th>
              <td className="font-display">{you}</td>
              <td>{avg}</td>
              <td>
                <span
                  className={`gm-chip ${pos.startsWith("Below (good)") || pos.startsWith("Above") || pos.startsWith("Well above") ? "gm-risk gm-risk-low" : pos === "Match" || pos === "In range" ? "" : "gm-risk gm-risk-medium"}`}
                >
                  {pos}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted">
        County figures: 40+ member farms, Sep 2026 sample. Rates are market
        medians, not legal floors.
      </p>
    </Dialog>
  );
}

/* ================= 25 · export ================= */

export function ExportDialog(props: TeamModalsProps) {
  const { setModal, workers, advances, notify } = props;
  const [scope, setScope] = useState("Directory + payslips");
  const [fmt, setFmt] = useState("CSV");
  const download = () => {
    const head = [
      "ID",
      "Name",
      "Phone",
      "M-Pesa",
      "Type",
      "Status",
      "Daily rate",
      "Pay freq",
      "Earned (season)",
      "Rating",
    ];
    const rows = workers.map((w) => [
      w.id,
      w.name,
      w.phone,
      w.mpesaNo,
      w.empType,
      w.status,
      w.dailyRate,
      w.payFreq,
      w.seasonEarned,
      w.rating,
    ]);
    const body = [
      head,
      ...rows,
      [],
      ["ADVANCE/DEDUCTION LOG"],
      ["Ref", "Worker", "Type", "Amount", "Date", "Reason", "Remaining"],
      ...advances.map((a) => [
        a.id,
        a.worker,
        a.type,
        a.amount,
        a.date,
        a.reason,
        a.remaining,
      ]),
    ]
      .map((r) =>
        r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "growmo-team-export-2026-10-23.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Team records exported (CSV).", "success");
    setModal({ kind: "none" });
  };
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title="Export team records"
      desc="What goes into the file, and in which format."
    >
      <div className="gm-form-grid">
        <Field label="Scope">
          <select
            className="gm-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option>Directory + payslips</option>
            <option>Directory only</option>
            <option>Advances & deductions only</option>
            <option>Attendance (October)</option>
          </select>
        </Field>
        <Field label="Format">
          <select
            className="gm-select"
            value={fmt}
            onChange={(e) => setFmt(e.target.value)}
          >
            <option>CSV</option>
            <option>PDF</option>
          </select>
        </Field>
      </div>
      <p className="text-muted">
        {scope} · {fmt} · {workers.length} workers, {advances.length}{" "}
        advance/deduction lines. The export is kept in Records for your books.
      </p>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={download}
        >
          <Download /> Download {fmt}
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 26 · job post detail ================= */

export function JobDetailDialog(props: TeamModalsProps & { postId: string }) {
  const { postId, setModal, posts, applicants } = props;
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const forJob = applicants.filter((a) => a.job.startsWith(post.id));
  return (
    <Dialog
      open
      onClose={() => setModal({ kind: "none" })}
      title={post.title}
      desc={`${post.id} · ${post.status} · ${post.location}`}
      wide
    >
      <dl className="gm-deflist">
        <div>
          <dt>Duration</dt>
          <dd>{post.duration}</dd>
        </div>
        <div>
          <dt>Rate</dt>
          <dd className="font-display">{post.rate}</dd>
        </div>
        <div>
          <dt>Workers</dt>
          <dd>
            {post.hired} of {post.needed} hired
          </dd>
        </div>
        <div>
          <dt>Accommodation</dt>
          <dd>{post.accommodation}</dd>
        </div>
        <div>
          <dt>Meals</dt>
          <dd>{post.meals}</dd>
        </div>
        <div>
          <dt>Requirements</dt>
          <dd>{post.requirements}</dd>
        </div>
        <div>
          <dt>How to apply</dt>
          <dd>{post.howToApply}</dd>
        </div>
        <div>
          <dt>Posted / closes</dt>
          <dd>
            {post.posted} → {post.closes}
          </dd>
        </div>
      </dl>
      {post.channels.length ? (
        <div className="gm-team-chip-row mt-2">
          {post.channels.map((c) => (
            <span key={c} className="gm-chip">
              {c}
            </span>
          ))}
        </div>
      ) : null}
      {forJob.length ? (
        <div className="mt-3">
          <p className="gm-eyebrow mb-1">Applicants for this post</p>
          {forJob.map((a) => (
            <button
              key={a.id}
              type="button"
              className="gm-team-crew-row"
              style={{ width: "100%" }}
              onClick={() => setModal({ kind: "applicant", applicantId: a.id })}
            >
              <span style={{ flex: 1, textAlign: "left" }}>
                <strong>{a.name}</strong>
                <small className="text-muted d-block">
                  {a.phone} · {a.village}
                </small>
              </span>
              <StageChipLocal stage={a.stage} />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-muted mt-3">
          No applicants yet — the channels go live as soon as the post is
          opened.
        </p>
      )}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={() => setModal({ kind: "none" })}
        >
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={() => setModal({ kind: "post-job" })}
        >
          <UserPlus /> Post a similar job
        </button>
      </div>
    </Dialog>
  );
}

function StageChipLocal({ stage }: { stage: string }) {
  const tone =
    stage === "Hired"
      ? "low"
      : stage === "Declined"
        ? "high"
        : stage === "Onboarding"
          ? "medium"
          : "neutral";
  const cls = tone === "neutral" ? "" : `gm-risk gm-risk-${tone}`;
  return <span className={`gm-chip ${cls}`}>{stage}</span>;
}

/* ================= dispatcher ================= */

export function TeamModals(props: TeamModalsProps) {
  const { modal } = props;
  if (modal.kind === "none") return null;
  return (
    <>
      {modal.kind === "worker" ? (
        <WorkerDetailDrawer {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "add-worker" ? <AddWorkerWizard {...props} /> : null}
      {modal.kind === "edit-worker" ? (
        <EditWorkerDialog {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "change-status" ? (
        <ChangeStatusDialog {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "payslip" ? (
        <PayslipDialog {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "leave" ? (
        <LeaveDialog {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "contract" ? (
        <ContractDialog {...props} workerId={modal.workerId} />
      ) : null}
      {modal.kind === "post-job" ? <PostJobWizard {...props} /> : null}
      {modal.kind === "job" ? (
        <JobDetailDialog {...props} postId={modal.postId} />
      ) : null}
      {modal.kind === "applicant" ? (
        <ApplicantDetailDialog {...props} applicantId={modal.applicantId} />
      ) : null}
      {modal.kind === "onboarding" ? (
        <OnboardingChecklistDialog {...props} applicantId={modal.applicantId} />
      ) : null}
      {modal.kind === "mark-attendance" ? (
        <MarkAttendanceDialog {...props} />
      ) : null}
      {modal.kind === "checkin-sim" ? (
        <CheckInSimulatorDialog {...props} />
      ) : null}
      {modal.kind === "rate-task" ? <RateTaskDialog {...props} /> : null}
      {modal.kind === "perf-review" ? (
        <PerformanceReviewDialog {...props} workerName={modal.workerName} />
      ) : null}
      {modal.kind === "payroll-review" ? (
        <PayrollReviewDialog {...props} />
      ) : null}
      {modal.kind === "payroll-approve" ? (
        <PayrollApproveDialog {...props} />
      ) : null}
      {modal.kind === "batch-pay" ? <BatchPaymentDialog {...props} /> : null}
      {modal.kind === "payroll-sms" ? <PayslipSmsDialog {...props} /> : null}
      {modal.kind === "new-advance" ? <NewAdvanceDialog {...props} /> : null}
      {modal.kind === "deduction" ? <DeductionDialog {...props} /> : null}
      {modal.kind === "repay-advance" ? (
        <RepayAdvanceDialog {...props} recId={modal.recId} />
      ) : null}
      {modal.kind === "compliance" ? (
        <ComplianceDetailDialog {...props} rowId={modal.rowId} />
      ) : null}
      {modal.kind === "ppe" ? <PpeChecklistDialog {...props} /> : null}
      {modal.kind === "benchmark" ? <BenchmarkDialog {...props} /> : null}
      {modal.kind === "export" ? <ExportDialog {...props} /> : null}
    </>
  );
}
