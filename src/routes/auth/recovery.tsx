import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Headset, Mail, MapPin, MessageCircle, Smartphone, Video } from "lucide-react";
import { useState } from "react";
import { Dialog, OtpInput, PasswordField, Stepper, StrengthMeter, useCountdown, strengthOf } from "../../components/auth/controls";
import { AuthSplit } from "../../components/auth/shell";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/recovery")({ component: RecoveryPage });

const STEPS = ["Choose method", "Verify", "New password"];

function RecoveryPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState("sms");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const [assistOpen, setAssistOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const resend = useCountdown(30);

  const masked = identifier ? `${identifier.slice(0, 4)} ••• ${identifier.slice(-3)}` : "your phone";

  const send = (initial = false) => {
    if (!identifier.trim() && initial) return toast.notify("Enter your phone or email first", "warn");
    resend.start(30);
    toast.notify(initial ? `Reset code sent via ${channelLabel()}` : "New code sent", "info");
    if (initial) setStep(1);
  };

  const channelLabel = () => ({ sms: "SMS", whatsapp: "WhatsApp", email: "Email" })[channel] ?? "SMS";

  const reset = () => {
    if (strengthOf(pw).score < 2) return toast.notify("Choose a stronger password", "warn");
    if (pw !== pw2) return toast.notify("Passwords don't match", "warn");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      toast.notify("Password reset — all other sessions signed out");
    }, 1100);
  };

  return (
    <AuthSplit
      eyebrow="Locked out? Pole."
      title="Back into your farm in minutes."
      intro="Verify you own the number, set a fresh password, and we'll sign out every other device automatically."
      points={["SMS, WhatsApp or email codes", "Other devices auto-signed-out", "Stuck? Assisted recovery with ID"]}
      quote={{ text: "I forgot my PIN at planting time. Reset took four minutes and I never left the shamba.", who: "Grace A., Kisumu" }}
    >
      <div className="gm-auth-card">
        {done ? (
          <div className="text-center py-3">
            <span className="gm-service-icon mx-auto" style={{ background: "var(--gm-grad-primary)", color: "#fff", width: 72, height: 72 }}>
              <Check width={34} height={34} />
            </span>
            <h2 className="mt-3">Password reset!</h2>
            <p className="gm-auth-sub">Use your new password to sign in. A confirmation SMS is on its way.</p>
            <Link to="/auth/login" className="gm-btn gm-btn-lg gm-btn-block">Back to sign in <ArrowRight /></Link>
          </div>
        ) : (
          <>
            <h2>Recover access</h2>
            <p className="gm-auth-sub">Step {step + 1} of 3 — {STEPS[step]}</p>
            <Stepper steps={STEPS} current={step} />

            {step === 0 && (
              <div>
                <div className="gm-field">
                  <label htmlFor="rc-id">Phone or email on your account</label>
                  <input id="rc-id" className="gm-input" placeholder="0712 345 678" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                </div>
                <span className="gm-field-label">Send the code via</span>
                <div className="gm-method-grid mb-4">
                  {[
                    { id: "sms", icon: Smartphone, t: "SMS", d: "Instant" },
                    { id: "whatsapp", icon: MessageCircle, t: "WhatsApp", d: "Instant" },
                    { id: "email", icon: Mail, t: "Email", d: "~1 min" },
                  ].map((c) => (
                    <button key={c.id} className={`gm-method ${channel === c.id ? "is-active" : ""}`} onClick={() => { setChannel(c.id); toast.notify(`${c.t} selected`, "info"); }}>
                      <span className="gm-method-icon"><c.icon /></span>
                      <strong>{c.t}</strong>
                      <small>{c.d}</small>
                    </button>
                  ))}
                </div>
                <button className="gm-btn gm-btn-block gm-btn-lg" onClick={() => send(true)}>
                  Send reset code <ArrowRight />
                </button>
                <div className="gm-divider">Can't access these?</div>
                <button className="gm-btn gm-btn-outline gm-btn-block" onClick={() => setAssistOpen(true)}>
                  <Headset /> Assisted recovery
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="text-center">
                <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
                  Enter the code we sent to <strong>{masked}</strong> via {channelLabel()}
                </p>
                <div className="d-flex justify-content-center mb-4">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
                <p style={{ fontSize: ".87rem", fontWeight: 700 }}>
                  {resend.running ? (
                    <span style={{ color: "var(--gm-ink-400)" }}>Resend code in {resend.mmss}</span>
                  ) : (
                    <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => send()}>
                      Resend code
                    </button>
                  )}
                </p>
                <div className="d-flex gap-2 mt-3">
                  <button className="gm-btn gm-btn-outline" onClick={() => setStep(0)}><ArrowLeft /> Back</button>
                  <button
                    className="gm-btn"
                    style={{ flex: 1 }}
                    disabled={otp.replace(/\D/g, "").length < 6}
                    onClick={() => { toast.notify("Code verified — set a new password"); setStep(2); }}
                  >
                    Verify <ArrowRight />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <PasswordField id="rc-pw" label="New password" value={pw} onChange={setPw} placeholder="12+ characters" />
                <StrengthMeter password={pw} onStrong={() => toast.notify("Strong password — nicely done!")} />
                <div className="gm-field">
                  <label htmlFor="rc-pw2">Confirm new password</label>
                  <input id="rc-pw2" type="password" className="gm-input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="d-flex gap-2">
                  <button className="gm-btn gm-btn-outline" onClick={() => setStep(1)}><ArrowLeft /> Back</button>
                  <button className="gm-btn" style={{ flex: 1 }} onClick={reset} disabled={busy}>
                    {busy ? <span className="gm-spinner" /> : <Check />} {busy ? "Resetting…" : "Reset password"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* assisted recovery dialog */}
      <Dialog open={assistOpen} onClose={() => setAssistOpen(false)} title="Assisted recovery" desc="No access to your number? A human will verify you instead.">
        {[
          { icon: Headset, t: "Call support — 0800 221 000", d: "Answer 3 farm questions + ID number", act: () => toast.notify("Calling 0800 221 000… (demo)", "info") },
          { icon: MapPin, t: "Visit an agrovet agent", d: "Carry your original national ID", act: () => toast.notify("2,140 agents nearby — SMS with list sent", "info") },
          { icon: Video, t: "Video verification", d: "5-min call, Tue–Sat 8am–5pm", act: () => toast.notify("Video slot booked — link sent by SMS", "info") },
        ].map((o) => (
          <button key={o.t} className="gm-option-row" onClick={() => { setAssistOpen(false); o.act(); }}>
            <span className="gm-mega-icon"><o.icon /></span>
            <span style={{ flex: 1 }}>
              <strong style={{ display: "block", fontSize: ".9rem" }}>{o.t}</strong>
              <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{o.d}</small>
            </span>
            <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
          </button>
        ))}
      </Dialog>
    </AuthSplit>
  );
}
