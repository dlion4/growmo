import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldHalf,
  Smartphone,
  Timer,
  Usb,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, OtpInput, useCountdown, useTotpWindow } from "../../components/auth/controls";
import { AuthSplit } from "../../components/auth/shell";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/mfa")({ component: MfaPage });

type Factor = "app" | "sms" | "whatsapp" | "email" | "backup" | "key";

const FACTORS: { id: Factor; label: string; sub: string; icon: typeof Smartphone }[] = [
  { id: "app", label: "Authenticator", sub: "App code", icon: ShieldHalf },
  { id: "sms", label: "SMS", sub: "0712•••678", icon: Smartphone },
  { id: "whatsapp", label: "WhatsApp", sub: "Chat code", icon: MessageCircle },
  { id: "email", label: "Email", sub: "Inbox code", icon: Mail },
  { id: "backup", label: "Backups", sub: "Saved codes", icon: KeyRound },
  { id: "key", label: "Security key", sub: "USB / NFC", icon: Usb },
];

const CODES = ["GM7K-2P9X", "QW3E-8Z1M", "PL90-AX44", "ND21-KB77", "ZX5C-V093", "HT88-MN12", "JK34-PQ90", "UV67-RS21"];

function MfaPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [factor, setFactor] = useState<Factor>("app");
  const [otp, setOtp] = useState("");
  const [backup, setBackup] = useState("");
  const [busy, setBusy] = useState(false);
  const [expired, setExpired] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [codesOpen, setCodesOpen] = useState(false);
  const [codes, setCodes] = useState(CODES);
  const session = useCountdown(300);
  const resend = useCountdown(30);
  const totp = useTotpWindow();

  useEffect(() => {
    session.start(300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session.running && session.left <= 0 && !expired) {
      setExpired(true);
      toast.notify("Session expired — request a fresh code", "warn");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.running, session.left]);

  const pick = (f: Factor) => {
    setFactor(f);
    setOtp("");
    setExpired(false);
    session.start(300);
    const label = FACTORS.find((x) => x.id === f)?.label;
    toast.notify(`${label} factor selected — code sent`, "info");
  };

  const verify = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.notify("Second factor verified — karibu!");
      navigate({ to: "/auth/hub" });
    }, 1000);
  };

  const ready = factor === "backup" ? backup.replace(/[^A-Za-z0-9]/g, "").length >= 8 : otp.replace(/\D/g, "").length === 6;

  return (
    <AuthSplit
      eyebrow="Two-step verification"
      title="One more lock on your money."
      intro="Passwords leak. Second factors don't. Approve this sign-in with whichever factor you have at hand."
      points={["Codes expire in 5 minutes", "Never share codes — not even with us", "Lost everything? Backup codes save you"]}
      quote={{ text: "Someone got my password once. The SMS code stopped them cold. I'll never turn this off.", who: "Peter M., Meru" }}
    >
      <div className="gm-auth-card">
        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
          <div>
            <h2>Verify it's you</h2>
            <p className="gm-auth-sub mb-0">Signing in as <strong>Mary Wanjiku · 0712 ••• 678</strong></p>
          </div>
          <span className={`gm-timer ${session.left < 60 ? "is-low" : ""}`}>
            <Timer width={15} height={15} /> {expired ? "Expired" : session.mmss}
          </span>
        </div>

        {expired ? (
          <div className="text-center py-4">
            <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
              This verification session expired for your safety. Request a fresh code to continue.
            </p>
            <button className="gm-btn" onClick={() => { setExpired(false); session.start(300); toast.notify("Fresh code sent", "info"); }}>
              <RefreshCw /> Send a fresh code
            </button>
          </div>
        ) : (
          <>
            <div className="gm-method-grid my-4">
              {FACTORS.map((f) => (
                <button key={f.id} className={`gm-method ${factor === f.id ? "is-active" : ""}`} onClick={() => pick(f.id)}>
                  <span className="gm-method-icon"><f.icon /></span>
                  <strong>{f.label}</strong>
                  <small>{f.sub}</small>
                </button>
              ))}
            </div>

            {/* authenticator with TOTP meter */}
            {factor === "app" && (
              <div>
                <div className="gm-totp mb-3">
                  <span className="gm-totp-num">{totp.left}</span>
                  <div style={{ flex: 1 }}>
                    <div className="gm-totp-track"><div className="gm-totp-fill" style={{ width: `${totp.pct}%` }} /></div>
                    <small>Code refreshes in {totp.left}s — enter the current one</small>
                  </div>
                </div>
                <div className="d-flex justify-content-center mb-3">
                  <OtpInput value={otp} onChange={setOtp} label="Authenticator code" />
                </div>
              </div>
            )}

            {(factor === "sms" || factor === "whatsapp" || factor === "email") && (
              <div className="text-center">
                <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
                  Code sent via <strong>{FACTORS.find((f) => f.id === factor)?.label}</strong>
                </p>
                <div className="d-flex justify-content-center mb-3">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
                <p style={{ fontSize: ".85rem", fontWeight: 700 }}>
                  {resend.running ? (
                    <span style={{ color: "var(--gm-ink-400)" }}>Resend in {resend.mmss}</span>
                  ) : (
                    <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer" }} onClick={() => { resend.start(30); toast.notify("Code resent", "info"); }}>
                      Resend code
                    </button>
                  )}
                </p>
              </div>
            )}

            {factor === "backup" && (
              <div>
                <div className="gm-field">
                  <label htmlFor="mfa-backup">Enter one unused backup code</label>
                  <input
                    id="mfa-backup"
                    className="gm-input"
                    style={{ fontFamily: "monospace", letterSpacing: ".1em", textTransform: "uppercase" }}
                    placeholder="XXXX-XXXX"
                    value={backup}
                    onChange={(e) => setBackup(e.target.value)}
                  />
                </div>
                <button className="gm-btn gm-btn-outline gm-btn-sm mb-3" onClick={() => setCodesOpen(true)}>
                  <KeyRound width={15} height={15} /> View my backup codes
                </button>
              </div>
            )}

            {factor === "key" && (
              <div className="text-center py-2">
                <span className="gm-service-icon mx-auto mb-3" style={{ width: 64, height: 64 }}>
                  <Usb width={30} height={30} />
                </span>
                <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
                  Insert your security key and tap it — or hold it to the back of your phone (NFC).
                </p>
              </div>
            )}

            <button className="gm-btn gm-btn-block gm-btn-lg mt-2" disabled={!ready && factor !== "key" || busy} onClick={verify}>
              {busy ? <span className="gm-spinner" /> : <Check />} {busy ? "Verifying…" : factor === "key" ? "I'm tapping my key…" : "Verify & sign in"}
            </button>

            <p className="text-center mt-3 mb-0" style={{ fontSize: ".85rem", fontWeight: 700 }}>
              <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer", fontSize: ".85rem" }} onClick={() => setLostOpen(true)}>
                Lost access to all factors?
              </button>
            </p>
          </>
        )}
      </div>

      {/* lost access dialog */}
      <Dialog open={lostOpen} onClose={() => setLostOpen(false)} title="Lost all factors?" desc="Don't panic — you have three ways back.">
        <button className="gm-option-row" onClick={() => { setLostOpen(false); setCodesOpen(true); }}>
          <span className="gm-mega-icon"><KeyRound /></span>
          <span style={{ flex: 1 }}><strong style={{ display: "block", fontSize: ".9rem" }}>Use a backup code</strong>
          <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>The 8 codes from when you enabled 2-step</small></span>
          <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
        </button>
        <button className="gm-option-row" onClick={() => { toast.notify("Assisted recovery started", "info"); navigate({ to: "/auth/recovery" }); }}>
          <span className="gm-mega-icon"><ShieldHalf /></span>
          <span style={{ flex: 1 }}><strong style={{ display: "block", fontSize: ".9rem" }}>Assisted recovery</strong>
          <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>Verify with ID at an agent or on call</small></span>
          <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
        </button>
      </Dialog>

      {/* recovery codes dialog */}
      <Dialog open={codesOpen} onClose={() => setCodesOpen(false)} title="Backup codes" desc="Each works once. Store them like cash — paper beats screenshots.">
        <div className="row g-2 mb-3">
          {codes.map((c) => (
            <div key={c} className="col-6">
              <div className="gm-code-chip" style={{ width: "100%", textAlign: "center", fontSize: ".85rem" }}>{c}</div>
            </div>
          ))}
        </div>
        <div className="d-flex gap-2">
          <button
            className="gm-btn gm-btn-outline gm-btn-sm"
            style={{ flex: 1 }}
            onClick={() => {
              try { navigator.clipboard.writeText(codes.join("\n")); } catch { /* clipboard unavailable */ }
              toast.notify("Codes copied — store safely");
            }}
          >
            <Copy width={15} height={15} /> Copy all
          </button>
          <button
            className="gm-btn gm-btn-soft gm-btn-sm"
            style={{ flex: 1 }}
            onClick={() => {
              setCodes(codes.map(() => `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`));
              toast.notify("Fresh codes generated — old ones voided", "warn");
            }}
          >
            <RefreshCw width={15} height={15} /> Regenerate
          </button>
        </div>
      </Dialog>
    </AuthSplit>
  );
}
