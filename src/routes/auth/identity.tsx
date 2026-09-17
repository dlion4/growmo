import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Camera, Check, CreditCard, FileCheck, Globe, ScanFace, Upload, X } from "lucide-react";
import { useState } from "react";
import { Dialog, Stepper } from "../../components/auth/controls";
import { AuthSplit } from "../../components/auth/shell";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/identity")({ component: IdentityPage });

const STEPS = ["Method", "Verify", "Review", "Next steps"];

function UploadTile({
  label,
  hint,
  preview,
  onFile,
}: {
  label: string;
  hint: string;
  preview: string | null;
  onFile: (url: string, name: string) => void;
}) {
  const toast = useToast();
  const id = `idup-${label.replace(/\s/g, "")}`;
  return (
    <div>
      <span className="gm-field-label">{label}</span>
      <label htmlFor={id} className="gm-upload-drop">
        {preview ? (
          <img src={preview} alt={`${label} preview`} />
        ) : (
          <Upload width={26} height={26} color="var(--gm-leaf-600)" style={{ marginBottom: ".4rem" }} />
        )}
        <strong style={{ display: "block", fontSize: ".85rem" }}>{preview ? "Tap to retake" : hint}</strong>
        <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>JPG or PNG, max 5MB</small>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onFile(URL.createObjectURL(f), f.name);
          toast.notify(`${label} uploaded — looking sharp`);
        }}
      />
    </div>
  );
}

function IdentityPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("national-id");
  const [idNumber, setIdNumber] = useState("");
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [reqOpen, setReqOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const idOk = /^\d{7,8}$/.test(idNumber.replace(/\s/g, ""));
  const docsOk = method === "ecitizen" ? idOk : idOk && front && back && selfie;

  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.notify("Submitted — review takes ~10 minutes");
      setStep(3);
    }, 1300);
  };

  return (
    <AuthSplit
      wide
      eyebrow="Know your customer"
      title="Verify once. Unlock everything."
      intro="Identity verification lifts your M-Pesa limits, unlocks input loans and qualifies you for certified-buyer contracts."
      points={["Takes ~5 minutes", "Reviewed in ~10 minutes", "ID data encrypted + never sold"]}
      quote={{ text: "Verification took one tea break. My payout limit went from 50K to 500K the same day.", who: "Amina O., Kajiado" }}
    >
      <div className="gm-auth-card">
        <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
          <div>
            <h2>Verify your identity</h2>
            <p className="gm-auth-sub mb-0">Step {step + 1} of 4 — {STEPS[step]}</p>
          </div>
          <button className="gm-btn gm-btn-danger-soft gm-btn-sm" onClick={() => setCancelOpen(true)}>
            <X width={15} height={15} /> Cancel
          </button>
        </div>

        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div>
            <div className="gm-method-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))" }}>
              {[
                { id: "national-id", icon: CreditCard, t: "National ID", d: "Most common" },
                { id: "passport", icon: Globe, t: "Passport", d: "Bio page" },
                { id: "ecitizen", icon: BadgeCheck, t: "eCitizen fetch", d: "Auto-verify" },
              ].map((m) => (
                <button key={m.id} className={`gm-method ${method === m.id ? "is-active" : ""}`} onClick={() => { setMethod(m.id); toast.notify(`${m.t} selected`, "info"); }}>
                  <span className="gm-method-icon"><m.icon /></span>
                  <strong>{m.t}</strong>
                  <small>{m.d}</small>
                </button>
              ))}
            </div>
            <button className="gm-btn gm-btn-outline gm-btn-sm mb-3" onClick={() => setReqOpen(true)}>
              <FileCheck width={15} height={15} /> What do I need?
            </button>
            <br />
            <button className="gm-btn gm-btn-block gm-btn-lg" onClick={() => setStep(1)}>
              Continue <ArrowRight />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="gm-field">
              <label htmlFor="id-num">{method === "passport" ? "Passport number" : "ID number"}</label>
              <input id="id-num" className="gm-input" placeholder={method === "passport" ? "e.g. A1234567" : "e.g. 12345678"} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" />
              {idNumber && method !== "passport" && !idOk && (
                <small style={{ color: "var(--gm-clay-500)", fontWeight: 700 }}>Kenyan IDs are 7–8 digits</small>
              )}
            </div>
            {method === "ecitizen" ? (
              <div className="gm-totp mb-3">
                <span className="gm-totp-num"><BadgeCheck /></span>
                <div style={{ flex: 1 }}>
                  <strong>eCitizen auto-fetch</strong>
                  <br />
                  <small>We'll pull your registered details after you confirm — no uploads needed.</small>
                </div>
              </div>
            ) : (
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <UploadTile label="ID front" hint="Tap to upload front" preview={front} onFile={(u) => setFront(u)} />
                </div>
                <div className="col-md-4">
                  <UploadTile label="ID back" hint="Tap to upload back" preview={back} onFile={(u) => setBack(u)} />
                </div>
                <div className="col-md-4">
                  <UploadTile label="Selfie" hint="Face the light" preview={selfie} onFile={(u) => setSelfie(u)} />
                </div>
              </div>
            )}
            <p className="gm-check-row">
              <span className="gm-mega-icon"><Camera /></span>
              <span><strong>Tips for instant approval</strong><small>Good light, no glare on the ID, whole document in frame, face uncovered.</small></span>
            </p>
            <div className="d-flex gap-2 mt-3">
              <button className="gm-btn gm-btn-outline" onClick={() => setStep(0)}><ArrowLeft /> Back</button>
              <button className="gm-btn" style={{ flex: 1 }} disabled={!docsOk} onClick={() => setStep(2)}>
                Review submission <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="gm-card p-4 mb-3" style={{ background: "var(--gm-mint-50)" }}>
              <div className="gm-spec"><ScanFace /> <span>Method</span> <strong>{method === "national-id" ? "National ID" : method === "passport" ? "Passport" : "eCitizen fetch"}</strong></div>
              <div className="gm-spec"><CreditCard /> <span>Document no.</span> <strong>{idNumber}</strong></div>
              {method !== "ecitizen" && (
                <div className="gm-spec" style={{ border: "none" }}>
                  <Camera /> <span>Documents</span>
                  <strong style={{ display: "flex", gap: ".4rem" }}>
                    {[front, back, selfie].map((p, i) => (
                      <img key={i} src={p ?? ""} alt="" style={{ width: 52, height: 40, objectFit: "cover", borderRadius: 8, border: "1px solid var(--gm-line)" }} />
                    ))}
                  </strong>
                </div>
              )}
            </div>
            <label style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", fontSize: ".87rem", fontWeight: 600, color: "var(--gm-ink-600)", marginBottom: "1rem" }}>
              <input type="checkbox" defaultChecked style={{ width: 20, height: 20, marginTop: 2, accentColor: "var(--gm-leaf-600)" }} />
              I confirm these documents are mine and the details are true. I understand false declarations lead to suspension.
            </label>
            <div className="d-flex gap-2">
              <button className="gm-btn gm-btn-outline" onClick={() => setStep(1)}><ArrowLeft /> Edit</button>
              <button className="gm-btn" style={{ flex: 1 }} disabled={busy} onClick={submit}>
                {busy ? <span className="gm-spinner" /> : <Check />} {busy ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <span className="gm-service-icon mx-auto" style={{ background: "var(--gm-grad-primary)", color: "#fff", width: 72, height: 72 }}>
              <Check width={34} height={34} />
            </span>
            <h2 className="mt-3">Submitted for review</h2>
            <p className="gm-auth-sub">Average review time: <strong>10 minutes</strong> (8am–8pm daily). We'll SMS + notify you.</p>
            <div className="text-start">
              {[
                { t: "Raise M-Pesa limits to KES 500K", d: "Auto-unlocks on approval", to: "/auth/security" },
                { t: "Check input-loan readiness", d: "Verified farmers qualify faster", to: "/auth/account-status" },
                { t: "Enter your workspace", d: "Keep farming while we review", to: "/auth/hub" },
              ].map((n) => (
                <Link key={n.t} to={n.to} className="gm-option-row">
                  <span className="gm-mega-icon"><BadgeCheck /></span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: "block", fontSize: ".9rem" }}>{n.t}</strong>
                    <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{n.d}</small>
                  </span>
                  <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* requirements dialog */}
      <Dialog open={reqOpen} onClose={() => setReqOpen(false)} title="What you'll need" desc="Gather these before you start — 5 minutes tops.">
        {[
          "Original national ID, passport or eCitizen-linked number",
          "A phone camera (or clear scanned photos)",
          "Good lighting — daylight near a window is perfect",
          "Your face uncovered for the selfie check",
        ].map((r, i) => (
          <p key={r} className="gm-check-row">
            <span className="gm-mega-icon" style={{ fontWeight: 900 }}>{i + 1}</span>
            <span><strong>{r}</strong></span>
          </p>
        ))}
        <button className="gm-btn gm-btn-block mt-2" onClick={() => { setReqOpen(false); toast.notify("Requirements noted — let's go", "info"); }}>
          Got it, continue <ArrowRight />
        </button>
      </Dialog>

      {/* cancel confirm */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel verification?" desc="Your uploads will be discarded.">
        <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>
          You can restart anytime — but full M-Pesa limits and loans stay locked until you're verified.
        </p>
        <div className="d-flex gap-2 mt-3">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setCancelOpen(false)}>Keep verifying</button>
          <button className="gm-btn gm-btn-danger-soft" style={{ flex: 1 }} onClick={() => { toast.notify("Verification cancelled — finish later", "info"); navigate({ to: "/auth/hub" }); }}>
            Yes, cancel
          </button>
        </div>
      </Dialog>
    </AuthSplit>
  );
}
