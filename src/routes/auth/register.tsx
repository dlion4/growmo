import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Sprout, Store, Tractor, Users, X } from "lucide-react";
import { useState } from "react";
import { Dialog, OtpInput, PasswordField, PinPad, Stepper, StrengthMeter, useCountdown, strengthOf } from "../../components/auth/controls";
import { AuthSplit } from "../../components/auth/shell";
import { COUNTIES_SAMPLE } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/register")({ component: RegisterPage });

const STEPS = ["Account type", "Your details", "Verify", "Secure"];
const TYPES = [
  { id: "farmer", icon: Sprout, t: "Farmer", d: "Crops, livestock, mixed" },
  { id: "coop", icon: Users, t: "Cooperative", d: "Up to 200 members" },
  { id: "agrovet", icon: Store, t: "Agrovet", d: "Sell + pickup point" },
  { id: "buyer", icon: Tractor, t: "Buyer", d: "Source direct" },
];

function RegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [type, setType] = useState("farmer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [otp, setOtp] = useState("");
  const [bio, setBio] = useState(true);
  const [terms, setTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const resend = useCountdown(30);

  const validPhone = /^0[17]\d{8}$/.test(phone.replace(/\s/g, ""));
  const pwOk = pw.length >= 8 && pw === pw2;

  const sendOtp = (initial = false) => {
    resend.start(30);
    toast.notify(initial ? `Code sent to ${phone || "your phone"}` : "New code sent — check SMS", "info");
  };

  const next = () => {
    if (step === 1) {
      if (!name.trim()) return toast.notify("Please enter your full name", "warn");
      if (!validPhone) return toast.notify("Enter a valid number like 0712345678", "warn");
      if (strengthOf(pw).score < 2) return toast.notify("Choose a stronger password", "warn");
      if (pw !== pw2) return toast.notify("Passwords don't match", "warn");
      if (otp === "") sendOtp(true);
    }
    if (step === 2 && otp.replace(/\D/g, "").length < 6) {
      return toast.notify("Enter the 6-digit code first", "warn");
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const finish = () => {
    if (!terms) return toast.notify("Please accept the Terms to continue", "warn");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.notify(`Karibu, ${name.split(" ")[0] || "mkulima"}! Account created.`);
      navigate({ to: "/auth/hub" });
    }, 1200);
  };

  return (
    <AuthSplit
      eyebrow="Join 128,000+ farmers"
      title="Three minutes to your first season plan."
      intro="Guided setup in your language — pick your account type, verify your number, lock it down. Free forever tier, no card."
      points={["Free Mbegu plan included", "Works on kabambe via SMS", "M-Pesa payouts from day one"]}
      quote={{ text: "The agrovet helped me register in Swahili. My season plan was ready before I got home.", who: "Kiprono B., Uasin Gishu" }}
    >
      <div className="gm-auth-card">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <div>
            <h2>Create your account</h2>
            <p className="gm-auth-sub mb-0">Step {step + 1} of 4 — {STEPS[step]}</p>
          </div>
          <button className="gm-btn gm-btn-danger-soft gm-btn-sm" onClick={() => setLeaveOpen(true)}>
            <X width={15} height={15} /> Exit
          </button>
        </div>

        <Stepper steps={STEPS} current={step} onStep={(i) => i < step && setStep(i)} />

        {/* STEP 1 — type */}
        {step === 0 && (
          <div>
            <div className="gm-method-grid mb-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
              {TYPES.map((t) => (
                <button key={t.id} className={`gm-method ${type === t.id ? "is-active" : ""}`} onClick={() => { setType(t.id); toast.notify(`${t.t} account selected`, "info"); }}>
                  <span className="gm-method-icon"><t.icon /></span>
                  <strong>{t.t}</strong>
                  <small>{t.d}</small>
                </button>
              ))}
            </div>
            <button className="gm-btn gm-btn-block gm-btn-lg" onClick={next}>
              Continue <ArrowRight />
            </button>
          </div>
        )}

        {/* STEP 2 — details */}
        {step === 1 && (
          <div>
            <div className="gm-field">
              <label htmlFor="r-name">Full name (as on ID)</label>
              <input id="r-name" className="gm-input" placeholder="e.g. Mary Wanjiku" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="gm-field">
                  <label htmlFor="r-phone">Phone (M-Pesa)</label>
                  <input id="r-phone" className="gm-input" placeholder="0712 345 678" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  {phone && !validPhone && <small style={{ color: "var(--gm-clay-500)", fontWeight: 700 }}>Use format 07XX or 01XX, 10 digits</small>}
                </div>
              </div>
              <div className="col-md-6">
                <div className="gm-field">
                  <label htmlFor="r-county">County</label>
                  <select id="r-county" className="gm-select" value={county} onChange={(e) => setCounty(e.target.value)}>
                    <option value="">Select…</option>
                    {COUNTIES_SAMPLE.map((c) => <option key={c}>{c}</option>)}
                    <option>Another county</option>
                  </select>
                </div>
              </div>
            </div>
            <PasswordField id="r-pw" label="Create password" value={pw} onChange={setPw} placeholder="12+ characters, mix it up" />
            <StrengthMeter password={pw} onStrong={() => toast.notify("Strong password — nicely done!")} />
            <div className="gm-field">
              <label htmlFor="r-pw2">Confirm password</label>
              <input id="r-pw2" type="password" className="gm-input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="d-flex gap-2">
              <button className="gm-btn gm-btn-outline" onClick={() => setStep(0)}><ArrowLeft /> Back</button>
              <button className="gm-btn" style={{ flex: 1 }} onClick={next} disabled={!pwOk || !validPhone || !name.trim()}>
                Send verification code <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — verify */}
        {step === 2 && (
          <div className="text-center">
            <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
              Enter the 6-digit code sent to <strong>{phone || "your phone"}</strong>
            </p>
            <div className="d-flex justify-content-center mb-4">
              <OtpInput value={otp} onChange={(v) => {
                setOtp(v);
                if (v.replace(/\D/g, "").length === 6) toast.notify("Code accepted — number verified!");
              }} />
            </div>
            <p style={{ fontSize: ".87rem", fontWeight: 700 }}>
              {resend.running ? (
                <span style={{ color: "var(--gm-ink-400)" }}>Resend code in {resend.mmss}</span>
              ) : (
                <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => sendOtp()}>
                  Resend code
                </button>
              )}
            </p>
            <div className="d-flex gap-2 mt-3">
              <button className="gm-btn gm-btn-outline" onClick={() => setStep(1)}><ArrowLeft /> Back</button>
              <button className="gm-btn" style={{ flex: 1 }} onClick={next}>
                Verify & continue <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 — secure */}
        {step === 3 && (
          <div>
            <p className="text-center mb-3" style={{ fontWeight: 700, color: "var(--gm-ink-600)" }}>
              Set a 4-digit wallet PIN <span style={{ color: "var(--gm-ink-400)" }}>(for M-Pesa payouts & payroll)</span>
            </p>
            <PinPad length={4} onComplete={() => toast.notify("Wallet PIN set")} />
            <label className="gm-check-row mt-3" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={bio} onChange={(e) => { setBio(e.target.checked); toast.notify(e.target.checked ? "Biometric unlock enabled" : "Biometric unlock off", "info"); }} style={{ width: 20, height: 20, accentColor: "var(--gm-leaf-600)" }} />
              <span><strong>Enable fingerprint unlock</strong><small>Fast, private — stays on this device</small></span>
            </label>
            <label className="gm-check-row" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} style={{ width: 20, height: 20, accentColor: "var(--gm-leaf-600)" }} />
              <span>
                <strong>I accept the Terms & Privacy Policy</strong>
                <small><button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: ".8rem" }} onClick={(e) => { e.preventDefault(); setTermsOpen(true); }}>Read terms</button></small>
              </span>
            </label>
            <div className="d-flex gap-2 mt-3">
              <button className="gm-btn gm-btn-outline" onClick={() => setStep(2)}><ArrowLeft /> Back</button>
              <button className="gm-btn gm-btn-lg" style={{ flex: 1 }} onClick={finish} disabled={busy}>
                {busy ? <span className="gm-spinner" /> : <Check />} {busy ? "Creating…" : "Create my account"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center mt-4 mb-0" style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--gm-ink-400)" }}>
          Already have an account? <Link to="/auth/login" className="gm-link-arrow" style={{ fontSize: ".85rem" }}>Sign in</Link>
        </p>
      </div>

      {/* terms dialog */}
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} title="Terms & Privacy" desc="Plain-language summary. Full text at growmo.co.ke/terms." wide>
        <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid var(--gm-line-soft)", borderRadius: "var(--gm-r-sm)", padding: "1rem", fontSize: ".87rem", color: "var(--gm-ink-600)", lineHeight: 1.7 }}>
          <p><strong>1. Your data is yours.</strong> Farm records, photos and transactions belong to you. Export or delete anytime under Kenya's Data Protection Act, 2019.</p>
          <p><strong>2. M-Pesa & money.</strong> Wallet payouts settle via Safaricom Daraja. GrowMO never sees your M-Pesa PIN.</p>
          <p><strong>3. Fair marketplace.</strong> Listings must be genuine; harvest grades verified on delivery. Fraud leads to suspension with appeal.</p>
          <p><strong>4. Free tier.</strong> Mbegu (Seed) is free forever. Premium bills monthly via M-Pesa; cancel anytime, keep your data.</p>
          <p><strong>5. Safety.</strong> Never share OTPs, PINs or passwords — GrowMO staff will never ask for them.</p>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setTermsOpen(false)}>Close</button>
          <button className="gm-btn" style={{ flex: 1 }} onClick={() => { setTerms(true); setTermsOpen(false); toast.notify("Terms accepted — asante!"); }}>
            <Check /> Accept terms
          </button>
        </div>
      </Dialog>

      {/* leave confirm */}
      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Leave setup?" desc="Your progress isn't saved yet.">
        <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>
          You're on step {step + 1} of 4. If you leave now, you'll restart registration from the beginning.
        </p>
        <div className="d-flex gap-2 mt-3">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setLeaveOpen(false)}>Keep going</button>
          <button className="gm-btn gm-btn-danger-soft" style={{ flex: 1 }} onClick={() => { toast.notify("Setup discarded", "info"); navigate({ to: "/auth/login" }); }}>
            Yes, leave
          </button>
        </div>
      </Dialog>
    </AuthSplit>
  );
}
