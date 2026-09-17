import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Clock, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, OtpInput, Stepper } from "../../components/auth/controls";
import { AuthConsole } from "../../components/auth/shell";
import { RESTORE_TASKS, TRACKER_STAGES, type RestoreTask, type TaskState } from "../../data/auth";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/account-status")({ component: AccountStatusPage });

interface WStep {
  title: string;
  desc: string;
  control?: "text" | "otp" | "toggle" | "info";
  placeholder?: string;
  cta: string;
}
interface Wizard {
  id: string;
  title: string;
  desc: string;
  steps: WStep[];
  doneState: TaskState;
  doneMsg: string;
}

const WIZARDS: Wizard[] = [
  {
    id: "identity", title: "Verify identity", desc: "Unlock full M-Pesa limits.",
    doneState: "done", doneMsg: "Identity verified — limits unlocked!",
    steps: [
      { title: "ID number", desc: "Enter your 7–8 digit national ID number.", control: "text", placeholder: "e.g. 12345678", cta: "Check ID" },
      { title: "Liveness", desc: "Confirm the selfie matches your ID photo.", control: "info", cta: "Looks like me" },
      { title: "Finish", desc: "We'll certify this verification on your account.", cta: "Complete verification" },
    ],
  },
  {
    id: "phone", title: "Confirm M-Pesa number", desc: "OTP check for payouts.",
    doneState: "done", doneMsg: "M-Pesa number confirmed!",
    steps: [
      { title: "Send code", desc: "We'll SMS a 4-digit code to 0712 ••• 678.", control: "info", cta: "Send code" },
      { title: "Enter code", desc: "Type the code from the SMS.", control: "otp", cta: "Verify code" },
      { title: "Finish", desc: "Link this number for all payouts.", cta: "Link number" },
    ],
  },
  {
    id: "farm", title: "Map your plots", desc: "Plans match your real soil.",
    doneState: "done", doneMsg: "Plots mapped — plans personalized!",
    steps: [
      { title: "Plot count", desc: "How many separate plots do you farm?", control: "text", placeholder: "e.g. 3", cta: "Save count" },
      { title: "Boundaries", desc: "Walk each boundary with GPS, or draw on satellite map later.", control: "toggle", cta: "Enable GPS walk" },
      { title: "Finish", desc: "We'll pre-fill soil defaults per plot.", cta: "Done — map later" },
    ],
  },
  {
    id: "payout", title: "Add payout method", desc: "Where buyers pay you.",
    doneState: "review", doneMsg: "Payout method submitted for review",
    steps: [
      { title: "Details", desc: "M-Pesa number or bank account for settlements.", control: "text", placeholder: "0712 345 678", cta: "Save details" },
      { title: "Ownership", desc: "Confirm with the code we just sent.", control: "otp", cta: "Confirm ownership" },
      { title: "Review", desc: "Our team verifies names match (under 2 hrs).", cta: "Submit for review" },
    ],
  },
  {
    id: "coop", title: "Join Chama Yetu", desc: "Accept the Meru invite.",
    doneState: "review", doneMsg: "Invite accepted — chair will approve",
    steps: [
      { title: "The invite", desc: "Chama Yetu · 84 members · bulk inputs + joint sales.", control: "info", cta: "Sounds good" },
      { title: "Group rules", desc: "Agree to shared records and meeting attendance.", control: "toggle", cta: "I agree" },
      { title: "Queue", desc: "Your request joins the chair's approval list.", cta: "Request to join" },
    ],
  },
  {
    id: "loan", title: "Loan readiness", desc: "Already complete — view report.",
    doneState: "done", doneMsg: "Report ready — share with lenders",
    steps: [
      { title: "Records", desc: "6-month P&L + diary verified. Score: 82/100.", control: "info", cta: "View breakdown" },
      { title: "Offer", desc: "You pre-qualify for up to KES 45,000 input financing.", control: "info", cta: "See terms" },
      { title: "Finish", desc: "Download the lender-ready PDF anytime.", cta: "Download report" },
    ],
  },
];

const COLS: { id: TaskState; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" },
];

function AccountStatusPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState<RestoreTask[]>(RESTORE_TASKS);
  const [wizard, setWizard] = useState<Wizard | null>(null);
  const [wStep, setWStep] = useState(0);
  const [wVal, setWVal] = useState("");
  const [wOtp, setWOtp] = useState("");
  const [stageIdx, setStageIdx] = useState(2);
  const [checking, setChecking] = useState(false);

  const doneCount = tasks.filter((t) => t.state === "done").length;
  const pct = Math.round((doneCount / tasks.length) * 100);

  const openWizard = (task: RestoreTask) => {
    const w = WIZARDS.find((x) => x.id === task.wizard);
    if (!w) return;
    setWizard(w);
    setWStep(0);
    setWVal("");
    setWOtp("");
  };

  const advanceWizard = () => {
    if (!wizard) return;
    const step = wizard.steps[wStep];
    if (step.control === "text" && !wVal.trim()) return toast.notify("Fill this in to continue", "warn");
    if (step.control === "otp" && wOtp.replace(/\D/g, "").length < 4) return toast.notify("Enter the code first", "warn");
    if (wStep < wizard.steps.length - 1) {
      setWStep(wStep + 1);
      toast.notify(`${step.title} saved`, "info");
    } else {
      setTasks(tasks.map((t) => (t.wizard === wizard.id ? { ...t, state: wizard.doneState } : t)));
      setWizard(null);
      toast.notify(wizard.doneMsg);
    }
  };

  const checkUpdates = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (stageIdx < TRACKER_STAGES.length - 1) {
        setStageIdx(stageIdx + 1);
        toast.notify(`Update: “${TRACKER_STAGES[stageIdx + 1].label}” reached`);
      } else {
        toast.notify("Decision made — KES 45,000 approved!", "info");
      }
    }, 1200);
  };

  return (
    <AuthConsole
      title="Account status"
      desc="Finish restoration tasks to lift limits — and track live applications below."
      actions={
        <span className="gm-chip gm-chip-gold">
          <Clock width={14} height={14} /> {doneCount}/{tasks.length} tasks · {pct}%
        </span>
      }
    >
      {/* status banner */}
      <div className="gm-auth-card mb-4" style={{ background: "var(--gm-grad-deep)", border: "none", color: "#fff" }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="gm-service-icon mb-0" style={{ background: "var(--gm-grad-gold)", color: "#2b1c05" }}>
            <Sparkles />
          </span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h2 style={{ color: "#fff", fontSize: "1.25rem" }}>
              {pct === 100 ? "Fully verified — Hongera! 🎉" : "Limited account — almost there"}
            </h2>
            <p className="mb-2" style={{ color: "rgba(255,255,255,.7)", fontWeight: 600, fontSize: ".9rem" }}>
              {pct === 100
                ? "Full M-Pesa limits, loans and certified contracts unlocked."
                : "Complete the board to unlock KES 500K M-Pesa limits, loans and export contracts."}
            </p>
            <div style={{ height: 10, borderRadius: 99, background: "rgba(255,255,255,.15)", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 99, background: "var(--gm-grad-lime)", transition: "width .6s var(--gm-ease)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* task board */}
      <div className="gm-board mb-4">
        {COLS.map((col) => {
          const items = tasks.filter((t) => t.state === col.id);
          return (
            <div key={col.id} className="gm-board-col">
              <header>
                <h4>{col.label}</h4>
                <span className="gm-board-count">{items.length}</span>
              </header>
              {items.length === 0 && (
                <p style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--gm-ink-400)", textAlign: "center", padding: "1rem 0" }}>
                  Nothing here 🎉
                </p>
              )}
              {items.map((t) => (
                <div key={t.id} className="gm-task">
                  <strong>{t.title}</strong>
                  <p>{t.desc}</p>
                  <div className="gm-task-foot">
                    <small>{t.eta}</small>
                    <button className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => openWizard(t)}>
                      {t.state === "done" ? "View" : "Start"} <ArrowRight width={14} height={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* live tracker */}
      <div className="gm-auth-card">
        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-3">
          <div>
            <h2 style={{ fontSize: "1.2rem" }}>
              <span className="gm-eyebrow" style={{ marginBottom: ".5rem" }}><span className="dot" /> Live tracker</span>
              <br />Input loan · KES 45,000
            </h2>
            <p className="gm-auth-sub mb-0">Application #LN-2026-8841 · updates land here + SMS in real time.</p>
          </div>
          <button className="gm-btn gm-btn-outline gm-btn-sm" disabled={checking} onClick={checkUpdates}>
            {checking ? <span className="gm-spinner dark" /> : <RefreshCw width={15} height={15} />} {checking ? "Checking…" : "Check for updates"}
          </button>
        </div>
        <ul className="gm-timeline">
          {TRACKER_STAGES.map((s, i) => (
            <li key={s.label} className={`gm-tl-item ${i < stageIdx ? "is-done" : i === stageIdx ? "is-current" : ""}`}>
              <span className="gm-tl-dot">{i < stageIdx ? <Check /> : i === stageIdx ? <Clock /> : <ShieldCheck />}</span>
              <span style={{ flex: 1 }}>
                <strong>{s.label}</strong>
                <small>{i <= stageIdx ? s.detail : "Waiting on previous stage"}</small>
              </span>
              <span className="gm-tl-at">{i < stageIdx ? s.at : i === stageIdx ? "Now" : "Pending"}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* wizard dialog */}
      <Dialog open={!!wizard} onClose={() => setWizard(null)} title={wizard?.title ?? ""} desc={wizard?.desc} wide>
        {wizard && (
          <>
            <Stepper steps={wizard.steps.map((s) => s.title)} current={wStep} />
            <h3 className="font-display" style={{ fontSize: "1.15rem" }}>{wizard.steps[wStep].title}</h3>
            <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>{wizard.steps[wStep].desc}</p>

            {wizard.steps[wStep].control === "text" && (
              <div className="gm-field">
                <label htmlFor="wiz-text">Your answer</label>
                <input id="wiz-text" className="gm-input" placeholder={wizard.steps[wStep].placeholder} value={wVal} onChange={(e) => setWVal(e.target.value)} />
              </div>
            )}
            {wizard.steps[wStep].control === "otp" && (
              <div className="d-flex justify-content-center my-3">
                <OtpInput length={4} value={wOtp} onChange={setWOtp} />
              </div>
            )}
            {wizard.steps[wStep].control === "toggle" && (
              <label className="gm-check-row" style={{ cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--gm-leaf-600)" }} />
                <span><strong>Yes, enable this</strong><small>You can change it later in Settings</small></span>
              </label>
            )}

            <div className="d-flex gap-2 mt-3">
              {wStep > 0 && (
                <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setWStep(wStep - 1)}>Back</button>
              )}
              <button className="gm-btn" style={{ flex: 2 }} onClick={advanceWizard}>
                {wStep === wizard.steps.length - 1 ? <Check /> : null} {wizard.steps[wStep].cta} {wStep < wizard.steps.length - 1 && <ArrowRight />}
              </button>
            </div>
          </>
        )}
      </Dialog>
    </AuthConsole>
  );
}
