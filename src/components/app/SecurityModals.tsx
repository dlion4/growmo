/* PAGE 18 — Security, Logs, Backups & Account Protection — modals & wizards.
   One dispatcher component (<SecurityModals/>) driven by a discriminated-union
   state owned by the /app/logs route. 28 dialogs/wizards/multi-step flows. */

import { Link } from "@tanstack/react-router";
import {
  Copy,
  FileDown,
  Fingerprint,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  Timer,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AUTO_LOGOUT_OPTIONS,
  type AuthMethod,
  BACKUP_CONTENTS,
  BACKUP_HISTORY,
  type BackupRow,
  DATA_SHARING_PREFS,
  EXPORT_FORMATS,
  FRAUD_FEATURES,
  type FraudFeature,
  type HealthCheck,
  type LogEvent,
  PIN_LOCKOUT_STEPS,
  type PrivacyRight,
  RESTORE_SCOPES,
  type RecoveryScenario,
  SEC_CONTEXT,
  SEC_FAQ,
  type Session,
  TIER_SETUPS,
  VELOCITY_LIMITS,
} from "../../data/app/logs";
import { Dialog, OtpInput, PinPad, Stepper, Toggle } from "../auth/controls";
import { StatusChip, WizardActions } from "./DashboardWidgets";
import {
  LevelChip,
  ModalSectionTitle,
  ProcessingView,
  QrGraphic,
  SecCallout,
  SuccessView,
  WizardNote,
} from "./SecurityWidgets";

/* ================= modal state machine ================= */

export type SecModalState =
  | { kind: "none" }
  | { kind: "twofa" }
  | { kind: "method"; m: AuthMethod }
  | { kind: "tiers" }
  | { kind: "change-pin" }
  | { kind: "reset-pin" }
  | { kind: "tx-pin" }
  | { kind: "lockout" }
  | { kind: "session"; s: Session }
  | { kind: "trust"; s: Session }
  | { kind: "logout-dev"; s: Session }
  | { kind: "auto-logout" }
  | { kind: "unfamiliar" }
  | { kind: "log-export" }
  | { kind: "backup-now" }
  | { kind: "backup-detail"; b: BackupRow }
  | { kind: "restore"; b?: BackupRow }
  | { kind: "export-data" }
  | { kind: "data-transfer" }
  | { kind: "fraud"; f: FraudFeature }
  | { kind: "velocity" }
  | { kind: "secure" }
  | { kind: "recovery"; s: RecoveryScenario }
  | { kind: "support" }
  | { kind: "privacy"; r: PrivacyRight }
  | { kind: "delete-account" }
  | { kind: "dpo" }
  | { kind: "health" }
  | { kind: "report" }
  | { kind: "emergency" }
  | { kind: "faq" };

export interface SecModalsProps {
  state: SecModalState;
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  frozen: boolean;
  onGotoLogs: (query: string) => void;
  onGotoSessions: () => void;
  onSessionTrusted: (id: string) => void;
  onSessionLoggedOut: (id: string) => void;
  onAutoLogoutSaved: (v: string) => void;
  onFraudToggled: (id: string, v: boolean) => void;
  onVelocitySaved: (v: {
    perHour: number;
    perDay: number;
    multiplier: number;
  }) => void;
  onBackupAdded: (label: string) => void;
  onRestoreDone: (info: { date: string; scope: string; ref: string }) => void;
  onExportDone: (info: { formats: string[]; ref: string }) => void;
  onPinChanged: () => void;
  onTxPinChanged: (on: boolean) => void;
  onSecureDone: (frozen: boolean) => void;
  onTwoFaDone: (method: "app" | "sms") => void;
  onEmergencySaved: (name: string) => void;
  onRestrictionSaved: (id: string, v: boolean) => void;
  onAccountDeleted: () => void;
  checks: HealthCheck[];
  score: number;
  pinTxActive: boolean;
  autoLogout: string;
  logRows: LogEvent[];
  emergency: string;
}

/* ================= shared helpers ================= */

function downloadText(name: string, mime: string, text: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useProcessed(active: boolean, ms: number, onDone: () => void) {
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

const BANNED_PINS = ["1111", "1234", "0000", "5678"];

function pinProblem(pin: string): string | null {
  if (pin.length < 4) return "PIN must be 4–6 digits";
  if (pin.length > 6) return "PIN must be 4–6 digits";
  if (BANNED_PINS.includes(pin))
    return "That PIN is too common (1111, 1234, 0000 or your phone's last 4)";
  return null;
}

function OtpGate({
  value,
  onChange,
  onVerify,
  label = "Enter the 6-digit code",
  hint = `Sent by SMS to ${SEC_CONTEXT.phone}`,
  cta = "Verify",
}: {
  value: string;
  onChange: (v: string) => void;
  onVerify: () => void;
  label?: string;
  hint?: string;
  cta?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="gm-sec-otp">
      <p className="gm-sec-otp-hint">{hint}</p>
      <OtpInput
        value={value}
        onChange={(v) => {
          setError(null);
          onChange(v);
        }}
        label={label}
      />
      {error ? (
        <p className="gm-sec-otp-error">{error}</p>
      ) : (
        <p className="gm-sec-otp-demo">Demo code: 123456</p>
      )}
      <button
        type="button"
        className="gm-btn gm-btn-primary"
        disabled={value.length !== 6}
        onClick={() => {
          if (value !== "123456") {
            setError("That code is not right. Demo code is 123456.");
            return;
          }
          onVerify();
        }}
      >
        {cta}
      </button>
    </div>
  );
}

function PinStep({
  label,
  sub,
  length,
  pin,
  onPin,
  onOk,
  okLabel,
  error,
}: {
  label: string;
  sub: string;
  length: number;
  pin: string;
  onPin: (p: string) => void;
  onOk: () => void;
  okLabel: string;
  error?: string | null;
}) {
  return (
    <div className="gm-sec-pinstep">
      <ModalSectionTitle icon={KeyRound}>{label}</ModalSectionTitle>
      <p className="gm-sec-otp-hint">{sub}</p>
      <PinPad
        length={length}
        onComplete={(p) => {
          onPin(p);
          if (p.length === length) onOk();
        }}
      />
      {error ? <p className="gm-sec-otp-error">{error}</p> : null}
      <button
        type="button"
        className="gm-btn gm-btn-primary"
        disabled={pin.length !== length}
        onClick={onOk}
      >
        {okLabel}
      </button>
    </div>
  );
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="gm-btn gm-btn-ghost"
      onClick={() => {
        try {
          void navigator.clipboard?.writeText(text);
        } catch {
          /* clipboard unavailable in some sandboxes — the value is visible above */
        }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      <Copy /> {done ? "Copied" : label}
    </button>
  );
}

/* ================= 18.1 — 2FA + methods + tiers ================= */

export function TwoFaSetupWizard({
  onClose,
  onOpen,
  onDone,
}: {
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  onDone: (method: "app" | "sms") => void;
}) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<"app" | "sms">("app");
  const [otp, setOtp] = useState("");

  return (
    <Dialog
      open
      onClose={onClose}
      title="Set up two-factor authentication"
      desc="Your account is Premium — 2FA is the single biggest score upgrade available."
    >
      <Stepper
        steps={["Method", "Link device", "Confirm"]}
        current={step}
        onStep={step === 2 ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-sec-choices">
          <button
            type="button"
            className={`gm-sec-choice ${method === "app" ? "on" : ""}`}
            onClick={() => setMethod("app")}
          >
            <ShieldCheck />
            <span>
              <strong>Authenticator app</strong>
              <small>
                Google Authenticator / Authy — codes work offline, very high
                security
              </small>
            </span>
            <LevelChip level="Very High" />
          </button>
          <button
            type="button"
            className={`gm-sec-choice ${method === "sms" ? "on" : ""}`}
            onClick={() => setMethod("sms")}
          >
            <Smartphone />
            <span>
              <strong>SMS OTP</strong>
              <small>
                Extra code by SMS for new devices &amp; withdrawals — already
                on, we'll tighten it
              </small>
            </span>
            <LevelChip level="High" />
          </button>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-sec-step-center">
          {method === "app" ? (
            <>
              <QrGraphic
                seed="growmo-2fa-mary-0712"
                label="Scan with Google Authenticator or Authy"
              />
              <p className="gm-sec-otp-hint">
                Can't scan? Manually enter the secret:{" "}
                <strong>GMW2 K9LP X4Q7 TRBA</strong>
              </p>
              <CopyBtn text="GMW2 K9LP X4Q7 TRBA" label="Copy secret" />
            </>
          ) : (
            <div className="gm-sec-step-center-box">
              <Phone />
              <strong>Codes will land on {SEC_CONTEXT.phone}</strong>
              <p>
                We'll send a confirmation code now. If it arrives, tap Continue.
              </p>
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => {
                  setOtp("123456");
                  setStep(2);
                }}
              >
                Send code &amp; continue
              </button>
            </div>
          )}
        </div>
      ) : null}
      {step === 2 ? (
        <div>
          {method === "app" ? (
            <>
              <p className="gm-sec-otp-hint">
                Open your authenticator app — it's now generating 6-digit codes
                for <strong>GrowMO ({SEC_CONTEXT.farm})</strong>. Enter the
                current code.
              </p>
              <OtpInput
                value={otp}
                onChange={setOtp}
                label="Authenticator code"
              />
              <p className="gm-sec-otp-demo">Demo code: 123456</p>
              {otp.length === 6 && otp !== "123456" ? (
                <p className="gm-sec-otp-error">
                  Wrong code — try the current 6 digits shown in your app.
                </p>
              ) : null}
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                disabled={otp.length !== 6}
                onClick={() => {
                  if (otp === "123456") setStep(3);
                }}
              >
                Confirm code
              </button>
            </>
          ) : (
            <OtpGate
              value={otp}
              onChange={setOtp}
              onVerify={() => setStep(3)}
              label="SMS confirmation code"
              cta="Confirm 2FA"
            />
          )}
        </div>
      ) : null}
      {step === 3 ? (
        <SuccessView
          title="Two-factor authentication is on"
          sub={
            method === "app"
              ? "Authenticator-app layer linked. New logins and withdrawals now need the rotating code."
              : "SMS 2FA tightened — codes now also required on new devices and every withdrawal."
          }
          receipt={[
            {
              k: "Method",
              v:
                method === "app"
                  ? "Authenticator app (very high)"
                  : "SMS OTP (high)",
            },
            { k: "Bound to", v: SEC_CONTEXT.phone },
            {
              k: "Score impact",
              v:
                method === "app"
                  ? "+2 → 9/10"
                  : "None — the authenticator-app layer is the score gap",
            },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => {
                  onDone(method);
                  onClose();
                }}
              >
                Done
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => onOpen({ kind: "health" })}
              >
                Re-run health check
              </button>
            </div>
          }
        />
      ) : null}
      {step === 1 && method === "app" ? (
        <WizardActions
          step={1}
          last={2}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          nextLabel="I scanned it"
        />
      ) : null}
    </Dialog>
  );
}

export function AuthMethodDetailDialog({
  m,
  onClose,
  onOpen,
}: {
  m: AuthMethod;
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title={m.name}
      desc={`${m.swahili} — ${m.setup}`}
    >
      <div className="gm-sec-method-detail">
        <div className="gm-sec-method-detail-top">
          <LevelChip level={m.level} />
          <StatusChip
            label={m.enabled ? "Active" : "Not active"}
            tone={m.enabled ? "low" : "neutral"}
          />
        </div>
        <p>{m.detail}</p>
        <WizardNote>{m.how}.</WizardNote>
      </div>
      <div className="gm-sec-modal-actions">
        {!m.enabled && (m.id === "2fa-app" || m.id === "2fa-sms") ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "twofa" })}
          >
            Set up now
          </button>
        ) : null}
        {m.id === "bio-face" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() =>
              onOpen({
                kind: "session",
                s: {
                  id: "s1",
                  device: "Infinix Hot 40",
                  model: "X6821",
                  os: "Android 14",
                  location: "Kiambu, KE",
                  ip: "196.201.44.12",
                  lastActive: "Now",
                  trusted: true,
                  current: true,
                },
              })
            }
          >
            Use on a compatible device
          </button>
        ) : null}
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function TierSetupDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="Recommended authentication by account type"
      desc="What each tier needs at minimum — and what we actually recommend."
    >
      <div className="gm-sec-tiers">
        {TIER_SETUPS.map((t) => (
          <div
            key={t.tier}
            className={`gm-sec-tier-row ${t.active ? "is-active" : ""}`}
          >
            <strong>{t.tier}</strong>
            <span>{t.minimum}</span>
            <span className="gm-sec-tier-rec">{t.recommended}</span>
          </div>
        ))}
      </div>
      <WizardNote>
        You're on <strong>Premium</strong>. The recommended set for your tier is
        fully active except the authenticator-app layer — that one tap moves you
        from 7/10 to 9/10.
      </WizardNote>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 18.2 — PIN wizards ================= */

export function ChangePinWizard({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const checkOld = () => {
    if (oldPin !== "123456") {
      setError("That's not your current PIN. Demo PIN is 123456.");
      return;
    }
    setError(null);
    setStep(1);
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Change your PIN"
      desc="You'll enter your old PIN, then the new one twice. 4–6 digits."
    >
      <Stepper
        steps={["Old PIN", "New PIN", "Confirm", "Done"]}
        current={step}
        onStep={step === 3 ? undefined : setStep}
      />
      {step === 0 ? (
        <PinStep
          label="Current PIN"
          sub={`Your PIN from onboarding — last changed 84 days ago.`}
          length={6}
          pin={oldPin}
          onPin={(p) => {
            setOldPin(p);
            setError(null);
          }}
          onOk={checkOld}
          okLabel="Confirm old PIN"
          error={error}
        />
      ) : null}
      {step === 1 ? (
        <PinStep
          label="New PIN"
          sub="4–6 digits. Not 1111, 1234, 0000 — and not the last 4 of your phone."
          length={6}
          pin={newPin}
          onPin={(p) => {
            setNewPin(p);
            setError(null);
          }}
          onOk={() => {
            const problem = pinProblem(newPin);
            if (problem) {
              setError(problem);
              return;
            }
            setConfirmPin("");
            setStep(2);
          }}
          okLabel="Use this PIN"
          error={error}
        />
      ) : null}
      {step === 2 ? (
        <PinStep
          label="Confirm new PIN"
          sub="Type it once more to be sure."
          length={6}
          pin={confirmPin}
          onPin={(p) => {
            setConfirmPin(p);
            setError(null);
          }}
          onOk={() => {
            if (confirmPin !== newPin) {
              setError("Those don't match — enter the same 6 digits.");
              return;
            }
            setStep(3);
          }}
          okLabel="Confirm"
          error={error}
        />
      ) : null}
      {step === 3 ? (
        <SuccessView
          title="PIN changed"
          sub="Your new PIN is live on this device. All other sessions were logged out for safety."
          receipt={[
            { k: "Changed", v: "Just now, Oct 25" },
            { k: "Logged out", v: "4 other sessions" },
            { k: "Log written", v: "PIN changed · Kiambu · Infinix Hot 40" },
          ]}
          actions={
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => {
                onDone();
                onClose();
              }}
            >
              Done
            </button>
          }
        />
      ) : null}
      <WizardNote>
        The stepper up top jumps you back to any finished step. Your new PIN is
        only saved on the final "Confirm".
      </WizardNote>
    </Dialog>
  );
}

export function ResetPinWizard({
  onClose,
  onDone,
  source = "change-pin",
}: {
  onClose: () => void;
  onDone: () => void;
  source?: string;
}) {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Reset your PIN"
      desc={
        source === "recovery"
          ? "Recovery flow — we verify you with OTP, then you set a fresh PIN."
          : "We'll verify your phone, then you set a fresh PIN. Old PIN is forgotten for good."
      }
    >
      <Stepper
        steps={["Verify phone", "New PIN", "Done"]}
        current={step}
        onStep={step === 2 ? undefined : setStep}
      />
      {step === 0 ? (
        <OtpGate
          value={otp}
          onChange={setOtp}
          onVerify={() => setStep(1)}
          hint={`OTP sent by SMS to ${SEC_CONTEXT.phone} (last 4 digits •••• 5678)`}
          cta="Verify phone"
        />
      ) : null}
      {step === 1 ? (
        <PinStep
          label="New PIN"
          sub="4–6 digits. You'll set it fresh — the old one is gone."
          length={6}
          pin={newPin}
          onPin={(p) => {
            setNewPin(p);
            setError(null);
          }}
          onOk={() => {
            const problem = pinProblem(newPin);
            if (problem) {
              setError(problem);
              return;
            }
            setStep(2);
          }}
          okLabel="Set PIN"
          error={error}
        />
      ) : null}
      {step === 2 ? (
        <SuccessView
          title="PIN reset"
          sub="Fresh PIN set and verified. A security log entry and an SMS receipt went to 0712 345 678."
          receipt={[
            { k: "Method", v: "OTP to registered phone" },
            { k: "Receipt", v: "SMS sent · Ref PIN-RST-88214" },
            { k: "Log written", v: "PIN reset via OTP · Low risk" },
          ]}
          actions={
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => {
                onDone();
                onClose();
              }}
            >
              Done
            </button>
          }
        />
      ) : null}
      {step < 2 ? (
        <WizardNote>
          The stepper up top jumps you back to any finished step. The reset is
          only saved when you confirm the new PIN.
        </WizardNote>
      ) : null}
    </Dialog>
  );
}

export function TransactionPinDialog({
  onClose,
  onDone,
  active,
}: {
  onClose: () => void;
  onDone: (on: boolean) => void;
  active: boolean;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(active);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Transaction PIN"
      desc="A separate PIN just for payments — the login PIN alone never pays out money."
    >
      <Toggle
        checked={enabled}
        onChange={(v) => {
          setEnabled(v);
          if (v) {
            setPin("");
            setError(null);
          } else {
            onDone(false);
            onClose();
          }
        }}
        label="Separate transaction PIN"
        desc="Recommended for Premium accounts — payments need this PIN, not your login PIN"
      />
      {enabled ? (
        <div className="gm-sec-txpin">
          <p className="gm-sec-otp-hint">Set the payment PIN (4–6 digits):</p>
          <PinPad
            length={6}
            onComplete={(p) => {
              setPin(p);
              setError(null);
              if (p.length === 6) {
                const problem = pinProblem(p);
                if (problem) setError(problem);
              }
            }}
          />
          {error ? <p className="gm-sec-otp-error">{error}</p> : null}
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            disabled={pin.length !== 6}
            onClick={() => {
              onDone(true);
              onClose();
            }}
          >
            Enable transaction PIN
          </button>
        </div>
      ) : null}
      <WizardNote>
        Turning it off falls back to your login PIN for payments — fine, but one
        compromised PIN then does everything.
      </WizardNote>
      {!enabled ? (
        <div className="gm-sec-modal-actions">
          <button
            type="button"
            className="gm-btn gm-btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      ) : null}
    </Dialog>
  );
}

export function PinLockoutDialog({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
}) {
  const [attempts] = useState(0);
  return (
    <Dialog
      open
      onClose={onClose}
      title="PIN lockout policy"
      desc="What happens when the PIN is entered wrong — automatically, no support call needed."
    >
      <p className="gm-sec-otp-hint">
        Your account right now:{" "}
        <strong>{attempts} failed attempts in the current window</strong> —
        fully unlocked.
      </p>
      <div className="gm-sec-locksteps">
        {PIN_LOCKOUT_STEPS.map((s) => (
          <div key={s.attempts} className="gm-sec-lockstep">
            <Timer />
            <span>{s.attempts}</span>
            <span className="gm-chip gm-risk gm-risk-{s.tone}">{s.lock}</span>
          </div>
        ))}
      </div>
      <WizardNote>
        Oct 24, 22:15 — your Nairobi laptop hit attempt 3. The 5-minute cooldown
        started, the SMS alert went out, and the correct login at 22:21 is in
        the log. The system did exactly what it should.
      </WizardNote>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={() => onOpen({ kind: "reset-pin" })}
        >
          Reset PIN now
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-ghost"
          onClick={() => onOpen({ kind: "support" })}
        >
          Contact support
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 18.3 — sessions ================= */

export function SessionDetailDialog({
  s,
  onClose,
  onOpen,
  onGotoLogs,
}: {
  s: Session;
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  onGotoLogs: (q: string) => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title={s.device}
      desc={`${s.model} · ${s.os}`}
    >
      <div className="gm-sec-kv">
        <div>
          <span>Location</span>
          <strong>{s.location}</strong>
        </div>
        <div>
          <span>IP address</span>
          <strong>{s.ip}</strong>
        </div>
        <div>
          <span>Last active</span>
          <strong>{s.lastActive}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>
            {s.trusted ? "Trusted — skips 2FA" : "Untrusted — full 2FA"}
          </strong>
        </div>
        {s.note ? (
          <div>
            <span>Note</span>
            <strong>{s.note}</strong>
          </div>
        ) : null}
      </div>
      <div className="gm-sec-modal-actions">
        {!s.current ? (
          <>
            {!s.trusted ? (
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => onOpen({ kind: "trust", s })}
              >
                Trust this device
              </button>
            ) : null}
            <button
              type="button"
              className="gm-btn gm-btn-danger"
              onClick={() => onOpen({ kind: "logout-dev", s })}
            >
              Log out remotely
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="gm-btn gm-btn-ghost"
          onClick={() => onOpen({ kind: "none" })}
        >
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-ghost"
          onClick={() => onGotoLogs(s.device)}
        >
          <MapPin /> View its logins
        </button>
      </div>
    </Dialog>
  );
}

export function TrustDeviceDialog({
  s,
  onClose,
  onDone,
}: {
  s: Session;
  onClose: () => void;
  onDone: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Trust ${s.device}?`}
      desc="Trusted devices skip 2FA on logins. Only trust devices you control."
    >
      <div className="gm-sec-kv">
        <div>
          <span>Device</span>
          <strong>{s.device}</strong>
        </div>
        <div>
          <span>Location</span>
          <strong>{s.location}</strong>
        </div>
        <div>
          <span>Last active</span>
          <strong>{s.lastActive}</strong>
        </div>
      </div>
      <label className="gm-sec-checkline">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
        />
        I confirm I own or control this device
      </label>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          disabled={!confirm}
          onClick={() => {
            onDone();
            onClose();
          }}
        >
          Trust device
        </button>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Not now
        </button>
      </div>
    </Dialog>
  );
}

export function LogoutDeviceDialog({
  s,
  onClose,
  onDone,
}: {
  s: Session;
  onClose: () => void;
  onDone: () => void;
}) {
  const [otp, setOtp] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Log out ${s.device}?`}
      desc="The session ends immediately — the device has to log back in with full 2FA."
    >
      <OtpGate
        value={otp}
        onChange={setOtp}
        onVerify={() => {
          onDone();
          onClose();
        }}
        hint={`Remote logout is OTP-gated. Code sent to ${SEC_CONTEXT.phone}`}
        cta="Log it out"
      />
    </Dialog>
  );
}

export function AutoLogoutDialog({
  onClose,
  onDone,
  current,
}: {
  onClose: () => void;
  onDone: (v: string) => void;
  current: string;
}) {
  const [value, setValue] = useState(current);
  return (
    <Dialog
      open
      onClose={onClose}
      title="Auto-logout timer"
      desc="How long the app stays unlocked after you set the phone down."
    >
      <div className="gm-sec-choices">
        {AUTO_LOGOUT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`gm-sec-choice ${value === o.value ? "on" : ""}`}
            onClick={() => setValue(o.value)}
          >
            <Timer />
            <span>
              <strong>{o.value}</strong>
              <small>{o.note}</small>
            </span>
            {o.rec ? (
              <span className="gm-chip gm-risk gm-risk-low">Recommended</span>
            ) : null}
            {o.value === "Never" ? (
              <span className="gm-chip gm-risk gm-risk-medium">
                Not recommended
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={() => {
            onDone(value);
            onClose();
          }}
        >
          Save timer
        </button>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

export function UnfamiliarDeviceDialog({
  onClose,
  onOpen,
  onConfirmYes,
  onConfirmNo,
}: {
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  onConfirmYes: () => void;
  onConfirmNo: () => void;
}) {
  const [otp, setOtp] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title="New login — was this you?"
      desc="Safari · iPhone (iPhone 13) from Kikuyu, Oct 22, 09:14."
    >
      <div className="gm-sec-unfamiliar">
        <Smartphone />
        <div>
          <strong>Safari · iPhone</strong>
          <p>iPhone 13 · iOS 17 · Kikuyu, KE · IP 105.112.6.77</p>
          <p className="gm-sec-otp-hint">
            The 2FA SMS code was verified at login time — this is why nothing
            was released without a second check.
          </p>
        </div>
      </div>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={() => {
            onConfirmYes();
            onClose();
          }}
        >
          Yes, it's me
        </button>
      </div>
      <div className="gm-sec-otp">
        <p className="gm-sec-otp-hint">
          <strong>No — this wasn't me?</strong> Securing is a strong action: it
          freezes outgoing money on every session. Confirm with the code sent to{" "}
          {SEC_CONTEXT.phone}.
        </p>
        <OtpInput value={otp} onChange={setOtp} label="Confirm code" />
        <p className="gm-sec-otp-demo">Demo code: 123456</p>
        <button
          type="button"
          className="gm-btn gm-btn-danger"
          disabled={otp.length !== 6}
          onClick={() => {
            if (otp === "123456") {
              onConfirmNo();
              onOpen({ kind: "secure" });
            }
          }}
        >
          <ShieldOff /> No — secure my account
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 18.4 — logs export ================= */

export function LogExportDialog({
  onClose,
  rows,
  onGotoLogs,
}: {
  onClose: () => void;
  rows: LogEvent[];
  onGotoLogs: (q: string) => void;
}) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [range, setRange] = useState("October 2026");
  const [cols, setCols] = useState<string[]>([
    "ts",
    "type",
    "event",
    "details",
    "ip",
    "location",
    "device",
    "risk",
  ]);
  const [phase, setPhase] = useState<"pick" | "run" | "done">("pick");
  useProcessed(phase === "run", 1100, () => setPhase("done"));

  const fname =
    format === "csv"
      ? "growmo-security-log-oct2026.csv"
      : "growmo-security-log-oct2026.json";
  const doDownload = () => {
    if (format === "csv") {
      const head = cols.map((c) => c).join(",");
      const map: Record<string, (e: LogEvent) => string> = {
        ts: (e) => e.ts,
        type: (e) => e.type,
        event: (e) => e.event,
        details: (e) => e.details,
        ip: (e) => e.ip,
        location: (e) => e.location,
        device: (e) => e.device,
        risk: (e) => e.risk,
      };
      const body = rows.map((e) =>
        cols.map((c) => `"${map[c](e).replace(/"/g, '""')}"`).join(","),
      );
      downloadText(fname, "text/csv", [head, ...body].join("\n"));
    } else {
      downloadText(fname, "application/json", JSON.stringify(rows, null, 2));
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Export security log"
      desc="Take the audit trail with you — it's your data under the KDP Act."
    >
      {phase === "pick" ? (
        <>
          <div className="gm-sec-choices">
            <button
              type="button"
              className={`gm-sec-choice ${format === "csv" ? "on" : ""}`}
              onClick={() => setFormat("csv")}
            >
              <FileDown />
              <span>
                <strong>CSV</strong>
                <small>Opens in Excel — co-op office friendly</small>
              </span>
            </button>
            <button
              type="button"
              className={`gm-sec-choice ${format === "json" ? "on" : ""}`}
              onClick={() => setFormat("json")}
            >
              <FileDown />
              <span>
                <strong>JSON</strong>
                <small>Machine-readable, full fidelity</small>
              </span>
            </button>
          </div>
          <div className="gm-sec-field">
            <label htmlFor="log-range">Date range</label>
            <select
              id="log-range"
              className="gm-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {["Last 24 h", "Last 7 days", "Last 30 days", "October 2026"].map(
                (r) => (
                  <option key={r}>{r}</option>
                ),
              )}
            </select>
          </div>
          <div className="gm-sec-colpicks">
            {[
              "ts",
              "type",
              "event",
              "details",
              "ip",
              "location",
              "device",
              "risk",
            ].map((c) => (
              <label key={c} className="gm-sec-checkline">
                <input
                  type="checkbox"
                  checked={cols.includes(c)}
                  onChange={(e) =>
                    setCols(
                      e.target.checked
                        ? [...cols, c]
                        : cols.filter((x) => x !== c),
                    )
                  }
                />
                {c}
              </label>
            ))}
          </div>
          <p className="gm-sec-otp-hint">
            {rows.length} events in range · {range}
          </p>
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              disabled={cols.length === 0}
              onClick={() => setPhase("run")}
            >
              <FileDown /> Generate &amp; download
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={() => {
                onGotoLogs("");
                onClose();
              }}
            >
              View log instead
            </button>
          </div>
        </>
      ) : null}
      {phase === "run" ? (
        <ProcessingView
          title="Packaging your audit trail"
          lines={[
            "Reading events…",
            "Applying filters…",
            "Encrypting + zipping…",
          ]}
        />
      ) : null}
      {phase === "done" ? (
        <SuccessView
          title="Export ready"
          sub={`${rows.length} events · ${range} · ${format.toUpperCase()}`}
          receipt={[
            { k: "File", v: fname },
            { k: "Columns", v: cols.join(", ") },
            { k: "Ref", v: "EXP-LOG-4471" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={doDownload}
              >
                <FileDown /> Download {fname}
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          }
        />
      ) : null}
    </Dialog>
  );
}

/* ================= 18.5 — backups ================= */

export function BackupNowWizard({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (label: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [registered, setRegistered] = useState(false);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });
  useEffect(() => {
    if (step !== 1 || registered) return;
    const t = setTimeout(() => {
      setRegistered(true);
      doneRef.current("Manual backup · Oct 25, 11:02 · BK-OCT25-1102");
      setStep(2);
    }, 2200);
    return () => clearTimeout(t);
  }, [step, registered]);
  return (
    <Dialog
      open
      onClose={onClose}
      title="Backup now"
      desc="A full encrypted snapshot, independent of the 6-hourly schedule."
    >
      <Stepper
        steps={["Review", "Running", "Receipt"]}
        current={step}
        onStep={step === 0 ? setStep : undefined}
      />
      {step === 0 ? (
        <>
          <div className="gm-sec-contents">
            {BACKUP_CONTENTS.map((c) => (
              <div key={c.id} className="gm-sec-content-row">
                <span className="gm-sec-content-emoji">{c.emoji}</span>
                <span>
                  {c.label}
                  <small>{c.objects}</small>
                </span>
                <strong>{c.size}</strong>
              </div>
            ))}
          </div>
          <WizardNote>
            Total ≈ 248 MB · encrypted (AES-256) · stored in the Nairobi region
            · 6 h of coverage from the last auto run.
          </WizardNote>
        </>
      ) : null}
      {step === 1 ? (
        <ProcessingView
          title="Taking the snapshot"
          lines={[
            "Locking farm records…",
            "Encrypting 2,148 photos…",
            "Uploading to Nairobi region…",
          ]}
        />
      ) : null}
      {step === 2 ? (
        <SuccessView
          title="Backup complete"
          sub="Snapshot verified end-to-end. The next automatic run stays on schedule."
          receipt={[
            { k: "Ref", v: "BK-OCT25-1102" },
            { k: "Size", v: "249 MB · 41,967 objects" },
            { k: "Stored", v: "Encrypted · Nairobi region" },
            { k: "Held", v: "30 days (snapshots) · 12 months (weekly)" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={onClose}
              >
                Done
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={onClose}
              >
                Keep reviewing
              </button>
            </div>
          }
        />
      ) : null}
      {step === 0 ? (
        <WizardActions
          step={0}
          last={0}
          onBack={() => setStep(0)}
          onNext={() => setStep(1)}
          finishLabel="Start backup"
        />
      ) : null}
    </Dialog>
  );
}

export function BackupDetailDialog({
  b,
  onClose,
  onOpen,
}: {
  b: BackupRow;
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title={`Backup — ${b.date}`}
      desc={b.trigger}
    >
      <div className="gm-sec-kv">
        <div>
          <span>Type</span>
          <strong>{b.type}</strong>
        </div>
        <div>
          <span>Size</span>
          <strong>{b.size}</strong>
        </div>
        <div>
          <span>Objects</span>
          <strong>{b.objects.toLocaleString("en-KE")}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{b.status}</strong>
        </div>
        <div>
          <span>Integrity</span>
          <strong>
            {b.status === "Complete" ? "Verified — checksum OK" : "n/a"}
          </strong>
        </div>
        <div>
          <span>Storage</span>
          <strong>Encrypted · AWS Nairobi · 30-day snapshot hold</strong>
        </div>
      </div>
      <div className="gm-sec-modal-actions">
        {b.status === "Complete" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "restore", b })}
          >
            <RotateCcw /> Restore from this snapshot
          </button>
        ) : (
          <WizardNote>
            This run failed (network dropped mid-run). The next scheduled run at
            12:00 covered it — no data gap.
          </WizardNote>
        )}
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function RestoreWizard({
  onClose,
  onDone,
  preset,
}: {
  onClose: () => void;
  onDone: (info: { date: string; scope: string; ref: string }) => void;
  preset?: BackupRow;
}) {
  const backups = BACKUP_HISTORY.filter((b) => b.status === "Complete");
  const [step, setStep] = useState(0);
  const [snap, setSnap] = useState(preset?.id ?? backups[0].id);
  const [scope, setScope] = useState("all");
  const [otp, setOtp] = useState("");
  useProcessed(step === 3, 2400, () => setStep(4));
  const chosen = backups.find((b) => b.id === snap);
  const scopeLabel =
    RESTORE_SCOPES.find((s) => s.id === scope)?.label ?? "Everything";

  return (
    <Dialog
      open
      onClose={onClose}
      title="Restore from backup"
      desc="Pick a snapshot and a scope. Restore is point-in-time — newer data in the chosen scope is replaced."
      wide
    >
      <Stepper
        steps={["Snapshot", "Scope", "Confirm", "Receipt"]}
        current={step}
        onStep={step <= 1 ? setStep : undefined}
      />
      {step === 0 ? (
        <div className="gm-sec-snaplist">
          {backups.map((b) => (
            <label
              key={b.id}
              className={`gm-sec-snap ${snap === b.id ? "on" : ""}`}
            >
              <input
                type="radio"
                name="snap"
                checked={snap === b.id}
                onChange={() => setSnap(b.id)}
              />
              <span className="gm-sec-snap-date">{b.date}</span>
              <span>
                {b.type} · {b.size}
              </span>
              <span className="gm-chip gm-risk gm-risk-low">Complete</span>
            </label>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-sec-choices">
          {RESTORE_SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`gm-sec-choice ${scope === s.id ? "on" : ""}`}
              onClick={() => setScope(s.id)}
            >
              <RotateCcw />
              <span>
                <strong>{s.label}</strong>
                <small>
                  {s.swahili} — {s.note}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Snapshot</span>
              <strong>
                {chosen?.date} · {chosen?.size}
              </strong>
            </div>
            <div>
              <span>Scope</span>
              <strong>{scopeLabel}</strong>
            </div>
            <div>
              <span>Effect</span>
              <strong>
                Newer {scopeLabel.toLowerCase()} data is replaced with the
                snapshot version
              </strong>
            </div>
            <div>
              <span>Safety net</span>
              <strong>
                A pre-restore snapshot is taken automatically first
              </strong>
            </div>
          </div>
          <OtpGate
            value={otp}
            onChange={setOtp}
            onVerify={() => setStep(3)}
            cta="Start restore"
            hint={`Restore is destructive for the chosen scope — code sent to ${SEC_CONTEXT.phone}`}
          />
        </>
      ) : null}
      {step === 3 ? (
        <ProcessingView
          title="Restoring your data"
          lines={[
            "Taking pre-restore snapshot…",
            `Downloading ${chosen?.size ?? "…"}…`,
            "Applying changes…",
          ]}
        />
      ) : null}
      {step === 4 ? (
        <SuccessView
          title="Restore complete"
          sub={`“${scopeLabel}” is back to the ${chosen?.date} state. A pre-restore snapshot keeps the replaced data recoverable.`}
          receipt={[
            { k: "Ref", v: "RST-2610-338" },
            { k: "Snapshot", v: chosen?.date ?? "—" },
            { k: "Scope", v: scopeLabel },
            { k: "Pre-restore", v: "BK-PRE-RST-0957" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => {
                  onDone({
                    date: chosen?.date ?? "—",
                    scope: scopeLabel,
                    ref: "RST-2610-338",
                  });
                  onClose();
                }}
              >
                Done
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={onClose}
              >
                Keep reviewing
              </button>
            </div>
          }
        />
      ) : null}
      {step < 2 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep(Math.max(0, step - 1))}
          onNext={() => setStep(step + 1)}
        />
      ) : null}
    </Dialog>
  );
}

export function ExportDataWizard({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (info: { formats: string[]; ref: string }) => void;
}) {
  const [step, setStep] = useState(0);
  const [formats, setFormats] = useState<string[]>(["csv", "jpg"]);
  const [otp, setOtp] = useState("");
  useProcessed(step === 2, 2400, () => setStep(3));

  return (
    <Dialog
      open
      onClose={onClose}
      title="Export all your data"
      desc="Data portability, KDP Act 2019 — machine-readable, no fee, no questions."
    >
      <Stepper
        steps={["Formats", "Confirm", "Receipt"]}
        current={step}
        onStep={step === 0 ? setStep : undefined}
      />
      {step === 0 ? (
        <div className="gm-sec-choices">
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`gm-sec-choice ${formats.includes(f.id) ? "on" : ""}`}
              onClick={() =>
                setFormats(
                  formats.includes(f.id)
                    ? formats.filter((x) => x !== f.id)
                    : [...formats, f.id],
                )
              }
            >
              <FileDown />
              <span>
                <strong>{f.label}</strong>
                <small>{f.note}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Formats</span>
              <strong>{formats.join(", ").toUpperCase() || "none"}</strong>
            </div>
            <div>
              <span>Estimated size</span>
              <strong>{formats.length >= 2 ? "231 MB" : "9 MB"}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>
                Download link valid 7 days (sent to {SEC_CONTEXT.email})
              </strong>
            </div>
          </div>
          <OtpGate
            value={otp}
            onChange={setOtp}
            onVerify={() => setStep(2)}
            cta="Generate export"
            hint={`Code sent to ${SEC_CONTEXT.phone}`}
          />
        </>
      ) : null}
      {step === 2 ? (
        <ProcessingView
          title="Building your data package"
          lines={[
            "Collecting farm & finance records…",
            "Packaging photos…",
            "Signing the download link…",
          ]}
        />
      ) : null}
      {step === 3 ? (
        <SuccessView
          title="Export is on its way"
          sub="The signed link was sent to mary.wanjiku@growmo.co.ke. You can also download it right now."
          receipt={[
            { k: "Ref", v: "EXP-2610-9917" },
            { k: "Formats", v: formats.join(", ").toUpperCase() || "—" },
            { k: "Valid until", v: "Oct 31, 2026 (7 days)" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() =>
                  downloadText(
                    "growmo-full-export-2026-10-25.txt",
                    "text/plain",
                    `GrowMO data export\nRef EXP-2610-9917\nFarm: ${SEC_CONTEXT.farm}\nFormats: ${formats.join(", ")}\n(This demo stub stands in for the 231 MB package.)`,
                  )
                }
              >
                <FileDown /> Download package
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => {
                  onDone({ formats, ref: "EXP-2610-9917" });
                  onClose();
                }}
              >
                Done
              </button>
            </div>
          }
        />
      ) : null}
      {step === 0 ? (
        <WizardActions
          step={0}
          last={2}
          onBack={() => setStep(0)}
          onNext={() => setStep(1)}
          nextDisabled={formats.length === 0}
        />
      ) : null}
    </Dialog>
  );
}

export function DataTransferDialog({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [agree, setAgree] = useState(false);
  return (
    <Dialog
      open
      onClose={onClose}
      title="Data transfer request"
      desc="Under the Kenya DPA 2019, GrowMO must respond within 48 hours."
    >
      {phase === "form" ? (
        <>
          <p className="gm-sec-otp-hint">
            Use this to move your data to another processor — for example a
            successor farm management tool or a co-op data portal. We deliver in
            CSV/JSON within 48 hours, free of charge.
          </p>
          <label className="gm-sec-checkline">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            I confirm I'm the account holder (or authorised agent) and I
            understand the 48-hour turnaround
          </label>
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              disabled={!agree}
              onClick={() => setPhase("done")}
            >
              <Send /> Submit transfer request
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <SuccessView
          title="Request received"
          sub="The DPO team has 48 hours by law. You'll get the package by email with a signed link."
          receipt={[
            { k: "Ref", v: "DTR-2026-0231" },
            { k: "Due by", v: "Oct 27, 2026 10:30 (48 h)" },
            { k: "Deliver to", v: SEC_CONTEXT.email },
          ]}
          actions={
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={onClose}
            >
              Done
            </button>
          }
        />
      )}
    </Dialog>
  );
}

/* ================= 18.6 — fraud protection ================= */

export function FraudFeatureDialog({
  f,
  onClose,
  onToggle,
}: {
  f: FraudFeature;
  onClose: () => void;
  onToggle: (id: string, v: boolean) => void;
}) {
  const feature = FRAUD_FEATURES.find((x) => x.id === f.id) ?? f;
  return (
    <Dialog
      open
      onClose={onClose}
      title={feature.name}
      desc={`${feature.swahili} — ${feature.locked ? "always-on core control" : "you can switch this"}`}
    >
      <p>{feature.how}</p>
      <div className="gm-sec-kv">
        <div>
          <span>Type</span>
          <strong>
            {feature.locked
              ? "Core control (cannot be disabled)"
              : "Optional control"}
          </strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{feature.enabled ? "Active" : "Off"}</strong>
        </div>
        <div>
          <span>Alerts</span>
          <strong>SMS + push to {SEC_CONTEXT.phone}</strong>
        </div>
        <div>
          <span>Log</span>
          <strong>Every trigger is written to the security log</strong>
        </div>
      </div>
      {!feature.locked ? (
        <Toggle
          checked={feature.enabled}
          onChange={(v) => onToggle(feature.id, v)}
          label="Enable this control"
        />
      ) : null}
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function VelocityLimitsDialog({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: (v: { perHour: number; perDay: number; multiplier: number }) => void;
}) {
  const [perHour, setPerHour] = useState(VELOCITY_LIMITS.perHour);
  const [perDay, setPerDay] = useState(VELOCITY_LIMITS.perDay);
  const [multiplier, setMultiplier] = useState(VELOCITY_LIMITS.multiplier);
  const problem =
    perHour < 1 || perHour > 100
      ? "Transactions per hour must be 1–100"
      : perDay < 1000 || perDay > 500000
        ? "Daily limit must be KES 1,000 – 500,000"
        : multiplier < 1 || multiplier > 10
          ? "Multiplier must be 1–10×"
          : null;
  return (
    <Dialog
      open
      onClose={onClose}
      title="Spending velocity limits"
      desc="Hard ceilings on how much can move, and how fast. The KDP Act and Safaricom both require sane defaults — these are yours to tune."
    >
      <div className="gm-sec-field">
        <label htmlFor="vel-hour">Max transactions per hour</label>
        <input
          id="vel-hour"
          type="number"
          min={1}
          max={100}
          className="gm-input"
          value={perHour}
          onChange={(e) => setPerHour(Number(e.target.value))}
        />
      </div>
      <div className="gm-sec-field">
        <label htmlFor="vel-day">Max wallet spend per day (KES)</label>
        <input
          id="vel-day"
          type="number"
          min={1000}
          max={500000}
          step={1000}
          className="gm-input"
          value={perDay}
          onChange={(e) => setPerDay(Number(e.target.value))}
        />
      </div>
      <div className="gm-sec-field">
        <label htmlFor="vel-mult">
          Unusual-payment threshold (× your 30-day average)
        </label>
        <input
          id="vel-mult"
          type="number"
          min={1}
          max={10}
          step={0.5}
          className="gm-input"
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
        />
        <small className="gm-sec-otp-hint">
          Your 30-day average payout is KES{" "}
          {VELOCITY_LIMITS.avgPayout30d.toLocaleString("en-KE")} — at{" "}
          {multiplier}× that's KES{" "}
          {(VELOCITY_LIMITS.avgPayout30d * multiplier).toLocaleString("en-KE")}{" "}
          before the extra PIN.
        </small>
      </div>
      {problem ? <p className="gm-sec-otp-error">{problem}</p> : null}
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          disabled={!!problem}
          onClick={() => {
            onDone({ perHour, perDay, multiplier });
            onClose();
          }}
        >
          <Save /> Save limits
        </button>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

/* ================= 18.7 — recovery + support ================= */

const AGENTS = [
  {
    name: "Githunguri Agrovet",
    dist: "2.1 km",
    addr: "Githunguri marketplace, Nyeri Rd",
  },
  {
    name: "Karuri Post Office",
    dist: "6.5 km",
    addr: "Karuri town centre, opposite chemist",
  },
  {
    name: "Kiambu Town SACCO branch",
    dist: "14 km",
    addr: "Moi Avenue, Kiambu town",
  },
];

export function RecoveryDialog({
  s,
  onClose,
  onOpen,
  frozen,
}: {
  s: RecoveryScenario;
  onClose: () => void;
  onOpen: (st: SecModalState) => void;
  frozen: boolean;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title={s.scenario}
      desc={`${s.swahili} — ${s.eta}`}
      wide
    >
      <p className="gm-sec-otp-hint">{s.method}</p>
      {s.id === "rc3" ? (
        <div className="gm-sec-agents">
          {AGENTS.map((a) => (
            <div key={a.name} className="gm-sec-agent">
              <Landmark />
              <span>
                <strong>{a.name}</strong>
                <small>
                  {a.addr} · {a.dist}
                </small>
              </span>
              <a
                className="gm-btn gm-btn-ghost"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${a.name} ${a.addr}`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin /> Directions
              </a>
            </div>
          ))}
        </div>
      ) : null}
      {s.id === "rc5" ? (
        <SecCallout tone={frozen ? "success" : "warn"}>
          {frozen
            ? "Your account is already frozen — outstanding money is safe. Call support to review the last 24 h together."
            : "If anything looks wrong, freeze first, investigate second. The freeze takes one OTP and stops everything that moves money out."}
        </SecCallout>
      ) : null}
      {s.id === "rc6" ? (
        <div className="gm-sec-kv">
          <div>
            <span>Documents</span>
            <strong>
              Death certificate · next of kin's national ID · court letter of
              administration
            </strong>
          </div>
          <div>
            <span>Data</span>
            <strong>
              Full export (KDP Act) delivered to the family within the statutory
              window
            </strong>
          </div>
          <div>
            <span>Wallet</span>
            <strong>
              Balance transferred to the family's verified M-Pesa number
            </strong>
          </div>
        </div>
      ) : null}
      <ol className="gm-sec-stepslist">
        {s.steps.map((st, i) => (
          <li key={st}>
            <i>{i + 1}</i>
            {st}
          </li>
        ))}
      </ol>
      <div className="gm-sec-modal-actions">
        {s.id === "rc1" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "reset-pin" })}
          >
            <KeyRound /> Start the reset
          </button>
        ) : null}
        {s.id === "rc2" ? (
          <>
            <a className="gm-btn gm-btn-primary" href="tel:0800100200">
              <PhoneCall /> Call {SEC_CONTEXT.support}
            </a>
            <Link to="/app/channels" className="gm-btn gm-btn-ghost">
              <MessageSquare /> Open live chat
            </Link>
          </>
        ) : null}
        {s.id === "rc3" ? (
          <a className="gm-btn gm-btn-primary" href="tel:0800100200">
            <PhoneCall /> Pre-book with support
          </a>
        ) : null}
        {s.id === "rc4" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "lockout" })}
          >
            <Lock /> Check lockout status
          </button>
        ) : null}
        {s.id === "rc5" ? (
          <button
            type="button"
            className="gm-btn gm-btn-danger"
            onClick={() => onOpen({ kind: "secure" })}
          >
            <ShieldOff /> {frozen ? "Review freeze" : "Secure my account"}
          </button>
        ) : null}
        {s.id === "rc6" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "dpo" })}
          >
            <Mail /> Contact the DPO
          </button>
        ) : null}
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function SupportDialog({ onClose }: { onClose: () => void }) {
  const [chatMsg, setChatMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Dialog
      open
      onClose={onClose}
      title="Support — we're here 24/7"
      desc="Toll-free from any Kenyan number. Security calls get priority."
    >
      {sent ? (
        <SuccessView
          title="Message sent to the security desk"
          sub="A named agent (not a bot) replies within the hour — usually in minutes."
          receipt={[
            { k: "Ticket", v: "SEC-2610-4417" },
            { k: "Channel", v: "Web form" },
            { k: "Queue", v: "Priority — account security" },
          ]}
          actions={
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={onClose}
            >
              Done
            </button>
          }
        />
      ) : (
        <>
          <div className="gm-sec-support-grid">
            <a className="gm-sec-support-tile" href="tel:0800100200">
              <PhoneCall />
              <strong>0800 100 200</strong>
              <small>Toll-free · 24/7 · Kiswahili &amp; English</small>
            </a>
            <Link to="/app/channels" className="gm-sec-support-tile">
              <MessageSquare />
              <strong>Live chat</strong>
              <small>WhatsApp &amp; in-app — avg. reply 4 min</small>
            </Link>
            <a
              className="gm-sec-support-tile"
              href="mailto:contact@dpo.growmo.co.ke"
            >
              <Mail />
              <strong>DPO email</strong>
              <small>contact@dpo.growmo.co.ke · data questions</small>
            </a>
            <div className="gm-sec-support-tile">
              <Users />
              <strong>Agents</strong>
              <small>140+ locations · ID required for account resets</small>
            </div>
          </div>
          <div className="gm-sec-field">
            <label htmlFor="support-msg">What's happening?</label>
            <textarea
              id="support-msg"
              className="gm-notes-area"
              rows={3}
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="e.g. I didn't recognise a login from Kikuyu last night…"
            />
          </div>
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              disabled={chatMsg.trim().length < 5}
              onClick={() => setSent(true)}
            >
              <Send /> Send to security desk
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ================= 18.8 — privacy ================= */

export function PrivacyRightDialog({
  r,
  onClose,
  onOpen,
  sharing,
  onRestriction,
}: {
  r: PrivacyRight;
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  sharing: { id: string; label: string; note: string; enabled: boolean }[];
  onRestriction: (id: string, v: boolean) => void;
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title={r.right}
      desc={`${r.swahili} — Kenya Data Protection Act 2019`}
    >
      <p>{r.impl}</p>
      {r.id === "pv5" || r.id === "pv7" ? (
        <div className="gm-sec-sharing">
          {sharing.map((d) => (
            <Toggle
              key={d.id}
              checked={d.enabled}
              onChange={(v) => onRestriction(d.id, v)}
              label={d.label}
              desc={d.note}
            />
          ))}
        </div>
      ) : null}
      <div className="gm-sec-modal-actions">
        {r.id === "pv2" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "export-data" })}
          >
            <FileDown /> View &amp; export my data
          </button>
        ) : null}
        {r.id === "pv4" ? (
          <button
            type="button"
            className="gm-btn gm-btn-danger"
            onClick={() => onOpen({ kind: "delete-account" })}
          >
            <Trash2 /> Delete my account
          </button>
        ) : null}
        {r.id === "pv6" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "export-data" })}
          >
            <FileDown /> Start portability export
          </button>
        ) : null}
        {r.id === "pv8" ? (
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={() => onOpen({ kind: "dpo" })}
          >
            <Mail /> Ask the DPO
          </button>
        ) : null}
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function DeleteAccountWizard({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [otp, setOtp] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title="Delete my account"
      desc="KDP Act 2019, right to erasure — with a 30-day grace period so this is never irreversible by accident."
    >
      <Stepper
        steps={["Understand", "Grace period", "Confirm", "Receipt"]}
        current={step}
        onStep={step === 3 ? undefined : setStep}
      />
      {step === 0 ? (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Wallet balance</span>
              <strong>KES 12,480 — must be withdrawn first</strong>
            </div>
            <div>
              <span>Farm data</span>
              <strong>3 plots · 14 seasons · 2,148 photos</strong>
            </div>
            <div>
              <span>Team</span>
              <strong>6 members will lose their roles</strong>
            </div>
          </div>
          <label className="gm-sec-checkline">
            <input
              type="checkbox"
              checked={agree1}
              onChange={(e) => setAgree1(e.target.checked)}
            />
            I understand deletion removes farm records, photos, transactions and
            the wallet — and that backups keep a legal copy for 12 months
          </label>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <SecCallout tone="warn">
            The account stays active and restorable for <strong>30 days</strong>{" "}
            (until Nov 24, 2026). Log in any time during the window and tap
            “Undo” to keep everything. After that, permanent deletion.
          </SecCallout>
          <label className="gm-sec-checkline">
            <input
              type="checkbox"
              checked={agree2}
              onChange={(e) => setAgree2(e.target.checked)}
            />
            I've withdrawn or am withdrawing the wallet balance
          </label>
        </>
      ) : null}
      {step === 2 ? (
        <OtpGate
          value={otp}
          onChange={setOtp}
          onVerify={() => setStep(3)}
          cta="Start 30-day deletion"
          hint={`Final check — code sent to ${SEC_CONTEXT.phone}`}
        />
      ) : null}
      {step === 3 ? (
        <SuccessView
          title="Deletion scheduled"
          sub="Your account enters the 30-day grace period. One tap undoes it; after Nov 24 it's gone for good."
          receipt={[
            { k: "Ref", v: "DEL-2026-0093" },
            { k: "Grace until", v: "Nov 24, 2026" },
            { k: "Notification", v: "SMS + email at day 7 and day 21" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => {
                  onDone();
                  onClose();
                }}
              >
                Done
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => {
                  onDone();
                  onClose();
                }}
              >
                <RotateCcw /> Undo now
              </button>
            </div>
          }
        />
      ) : null}
      {step === 0 ? (
        <WizardActions
          step={0}
          last={3}
          onBack={() => setStep(0)}
          onNext={() => setStep(1)}
          nextDisabled={!agree1}
        />
      ) : null}
      {step === 1 ? (
        <WizardActions
          step={1}
          last={3}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          nextDisabled={!agree2}
        />
      ) : null}
    </Dialog>
  );
}

export function DpoContactDialog({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState("Data access question");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Dialog
      open
      onClose={onClose}
      title="Data Protection Officer"
      desc="The DPO is independent of sales — data questions go straight to them."
    >
      {sent ? (
        <SuccessView
          title="Sent to the DPO"
          sub="Statutory response times apply: access requests within 48 hours, general queries within 5 working days."
          receipt={[
            { k: "Ticket", v: "DPO-2026-1187" },
            { k: "Topic", v: topic },
            { k: "Addressed to", v: SEC_CONTEXT.dpo },
          ]}
          actions={
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={onClose}
            >
              Done
            </button>
          }
        />
      ) : (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Direct</span>
              <strong>{SEC_CONTEXT.dpo}</strong>
            </div>
            <div>
              <span>Breach notice</span>
              <strong>
                Within 72 hours of any incident — as the Act requires
              </strong>
            </div>
            <div>
              <span>Storage</span>
              <strong>
                AES-256 at rest · TLS 1.3 in transit · 3-year inactivity limit
              </strong>
            </div>
          </div>
          <div className="gm-sec-field">
            <label htmlFor="dpo-topic">Topic</label>
            <select
              id="dpo-topic"
              className="gm-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {[
                "Data access question",
                "Erasure request",
                "Restrict processing",
                "Breach question",
                "Complaint to ODPC",
                "Other",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="gm-sec-field">
            <label htmlFor="dpo-msg">Message</label>
            <textarea
              id="dpo-msg"
              className="gm-notes-area"
              rows={3}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="What do you need clarified or done?"
            />
          </div>
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              disabled={msg.trim().length < 5}
              onClick={() => setSent(true)}
            >
              <Send /> Send to DPO
            </button>
            <a
              className="gm-btn gm-btn-ghost"
              href={`mailto:${SEC_CONTEXT.dpo}`}
            >
              <Mail /> Email instead
            </a>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ================= 18.9 — health + report + emergency + faq ================= */

export function HealthCheckWizard({
  onClose,
  onOpen,
  checks,
  score,
  onGotoSessions,
}: {
  onClose: () => void;
  onOpen: (s: SecModalState) => void;
  checks: HealthCheck[];
  score: number;
  onGotoSessions: () => void;
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (step !== 1) return;
    if (done >= checks.length) {
      const t = setTimeout(() => setStep(2), 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDone((d) => d + 1), 280);
    return () => clearTimeout(t);
  }, [step, done, checks.length]);

  return (
    <Dialog
      open
      onClose={onClose}
      title="Security health check"
      desc="Ten checks across authentication, sessions, backups and limits. Takes about 3 seconds."
      wide
    >
      <Stepper
        steps={["Start", "Checking", "Results"]}
        current={step}
        onStep={step === 0 ? setStep : undefined}
      />
      {step === 0 ? (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Current score</span>
              <strong>{score}/10</strong>
            </div>
            <div>
              <span>Checks</span>
              <strong>
                10 — auth, PIN, biometric, 2FA, devices, backup, logins, limits,
                contacts, timer
              </strong>
            </div>
            <div>
              <span>Cost</span>
              <strong>Free · unlimited runs</strong>
            </div>
          </div>
          <WizardNote>
            Each failing check comes with a one-tap fix — the wizard walks you
            straight to it.
          </WizardNote>
        </>
      ) : null}
      {step === 1 ? (
        <div className="gm-sec-healthlist" aria-live="polite">
          {checks.map((c, i) => (
            <div
              key={c.id}
              className={`gm-sec-healthitem ${i < done ? "done" : "pending"}`}
            >
              <span className="gm-sec-healthitem-name">{c.check}</span>
              {i < done ? (
                <StatusChip
                  label={c.status}
                  tone={
                    c.status === "Pass"
                      ? "low"
                      : c.status === "Warn"
                        ? "medium"
                        : "high"
                  }
                />
              ) : (
                <span className="gm-spinner" aria-hidden />
              )}
            </div>
          ))}
        </div>
      ) : null}
      {step === 2 ? (
        <>
          <div className="gm-sec-health-result">
            <strong>{score}/10</strong>
            <span>
              {checks.filter((c) => c.status === "Fail").length} failing ·{" "}
              {checks.filter((c) => c.status === "Warn").length} warning · fix
              all to reach 10/10
            </span>
          </div>
          <div className="gm-sec-health-results">
            {checks.map((c) => (
              <div
                key={c.id}
                className={`gm-sec-health gm-sec-health-${c.status.toLowerCase()}`}
              >
                <div>
                  <strong>{c.check}</strong>
                  <small>{c.detail}</small>
                </div>
                {c.status === "Pass" ? (
                  <StatusChip label="Pass" tone="low" />
                ) : c.actionLabel === "Enable 2FA" ? (
                  <button
                    type="button"
                    className="gm-btn gm-btn-primary"
                    onClick={() => onOpen({ kind: "twofa" })}
                  >
                    {c.actionLabel}
                  </button>
                ) : c.actionLabel === "Add emergency contact" ? (
                  <button
                    type="button"
                    className="gm-btn gm-btn-primary"
                    onClick={() => onOpen({ kind: "emergency" })}
                  >
                    {c.actionLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="gm-btn gm-btn-ghost"
                    onClick={() => {
                      onGotoSessions();
                      onClose();
                    }}
                  >
                    {c.actionLabel ?? "Review"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}
      {step === 0 ? (
        <WizardActions
          step={0}
          last={2}
          onBack={() => setStep(0)}
          onNext={() => {
            setDone(0);
            setStep(1);
          }}
          nextLabel="Run the checks"
        />
      ) : null}
      {step === 2 ? (
        <div className="gm-sec-modal-actions">
          <button
            type="button"
            className="gm-btn gm-btn-primary"
            onClick={onClose}
          >
            Done
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-ghost"
            onClick={() => onOpen({ kind: "report" })}
          >
            <FileDown /> Security report
          </button>
        </div>
      ) : null}
    </Dialog>
  );
}

export function SecurityReportDialog({
  onClose,
  score,
}: {
  onClose: () => void;
  score: number;
}) {
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  useProcessed(phase === "run", 1400, () => setPhase("done"));
  const reportText = () =>
    [
      `GrowMO security report — ${SEC_CONTEXT.farm}`,
      `Date: Oct 25, 2026 · Farmer: ${SEC_CONTEXT.farmer} · Phone: ${SEC_CONTEXT.phone}`,
      ``,
      `Score: ${score}/10`,
      `- Auth: phone+OTP, PIN (84 days), fingerprint, SMS 2FA`,
      `- Sessions: 5 active, 3 trusted`,
      `- Last 7 days: ${SEC_CONTEXT.logins7d} logins, ${SEC_CONTEXT.failed7d} failed attempts`,
      `- Last backup: Oct 25 06:00 (248 MB, verified)`,
      `- Encryption: AES-256 at rest, TLS 1.3 in transit`,
      `- Compliance: Kenya Data Protection Act 2019`,
    ].join("\n");
  return (
    <Dialog
      open
      onClose={onClose}
      title="Security report"
      desc="A shareable one-page summary — for the co-op, the bank, or your own records."
    >
      {phase === "idle" ? (
        <>
          <WizardNote>
            The report is generated on demand and is valid for 7 days. It never
            contains PINs, OTPs or full card numbers.
          </WizardNote>
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={() => setPhase("run")}
            >
              <FileDown /> Generate report
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </>
      ) : null}
      {phase === "run" ? (
        <ProcessingView
          title="Compiling the report"
          lines={[
            "Scoring authentication…",
            "Summarising the last 7 days…",
            "Signing the document…",
          ]}
        />
      ) : null}
      {phase === "done" ? (
        <SuccessView
          title="Report ready"
          sub="Share it or keep it — the link expires in 7 days."
          receipt={[
            { k: "Score", v: `${score}/10` },
            { k: "Generated", v: "Oct 25, 2026, 11:04" },
            { k: "Link", v: "growmo.co.ke/r/SEC-2610-8841" },
          ]}
          actions={
            <div className="gm-sec-success-actions">
              <CopyBtn
                text="https://growmo.co.ke/r/SEC-2610-8841"
                label="Copy share link"
              />
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() =>
                  downloadText(
                    "growmo-security-report-oct2026.txt",
                    "text/plain",
                    reportText(),
                  )
                }
              >
                <FileDown /> Download report
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          }
        />
      ) : null}
    </Dialog>
  );
}

export function EmergencyContactDialog({
  onClose,
  onDone,
  existing,
}: {
  onClose: () => void;
  onDone: (name: string) => void;
  existing: string;
}) {
  const [name, setName] = useState(existing);
  const [rel, setRel] = useState("Spouse / partner");
  const [phone, setPhone] = useState("");
  const problem = existing
    ? null
    : phone.length < 9
      ? "Enter the contact's phone number (07XX…)"
      : null;
  return (
    <Dialog
      open
      onClose={onClose}
      title="Emergency contact"
      desc="The person we call if your account is frozen or there's suspicious activity."
    >
      <div className="gm-sec-field">
        <label htmlFor="em-name">Full name</label>
        <input
          id="em-name"
          type="text"
          className="gm-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Wanjiku's brother — Kiprop Njoroge"
        />
      </div>
      <div className="gm-sec-field">
        <label htmlFor="em-rel">Relationship</label>
        <select
          id="em-rel"
          className="gm-select"
          value={rel}
          onChange={(e) => setRel(e.target.value)}
        >
          {[
            "Spouse / partner",
            "Parent",
            "Sibling",
            "Business partner",
            "Co-op secretary",
            "Other",
          ].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="gm-sec-field">
        <label htmlFor="em-phone">Phone (07XX / 01XX)</label>
        <input
          id="em-phone"
          type="tel"
          className="gm-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07XX XXX XXX"
        />
      </div>
      {problem ? <p className="gm-sec-otp-error">{problem}</p> : null}
      <WizardNote>
        They get a call — never your PIN, never your money. If the account is
        frozen, support talks to them to confirm it's really you.
      </WizardNote>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          disabled={!!problem || name.trim().length < 3}
          onClick={() => {
            onDone(name.trim());
            onClose();
          }}
        >
          <UserPlus /> Save contact
        </button>
        <button type="button" className="gm-btn gm-btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

export function SecFaqDialog({
  onClose,
  items,
}: {
  onClose: () => void;
  items: { q: string; a: string }[];
}) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="Security & data — questions we hear"
      desc="Plain answers. Anything deeper goes to the DPO."
      wide
    >
      <div className="gm-sec-faq-modal">
        {items.map((f) => (
          <details key={f.q} className="gm-acc">
            <summary className="gm-acc-head">
              {f.q}
              <Fingerprint />
            </summary>
            <p className="gm-sec-faq-a">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="gm-sec-modal-actions">
        <button
          type="button"
          className="gm-btn gm-btn-primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}

/* ================= dispatcher ================= */

export function SecurityModals(props: SecModalsProps) {
  const { state, onClose, onOpen } = props;
  if (state.kind === "none") return null;
  switch (state.kind) {
    case "twofa":
      return (
        <TwoFaSetupWizard
          onClose={onClose}
          onOpen={onOpen}
          onDone={props.onTwoFaDone}
        />
      );
    case "method":
      return (
        <AuthMethodDetailDialog m={state.m} onClose={onClose} onOpen={onOpen} />
      );
    case "tiers":
      return <TierSetupDialog onClose={onClose} />;
    case "change-pin":
      return <ChangePinWizard onClose={onClose} onDone={props.onPinChanged} />;
    case "reset-pin":
      return (
        <ResetPinWizard
          onClose={onClose}
          onDone={props.onPinChanged}
          source="recovery"
        />
      );
    case "tx-pin":
      return (
        <TransactionPinDialog
          active={props.pinTxActive}
          onClose={onClose}
          onDone={props.onTxPinChanged}
        />
      );
    case "lockout":
      return <PinLockoutDialog onClose={onClose} onOpen={onOpen} />;
    case "session":
      return (
        <SessionDetailDialog
          s={state.s}
          onClose={onClose}
          onOpen={onOpen}
          onGotoLogs={props.onGotoLogs}
        />
      );
    case "trust":
      return (
        <TrustDeviceDialog
          s={state.s}
          onClose={onClose}
          onDone={() => props.onSessionTrusted(state.s.id)}
        />
      );
    case "logout-dev":
      return (
        <LogoutDeviceDialog
          s={state.s}
          onClose={onClose}
          onDone={() => props.onSessionLoggedOut(state.s.id)}
        />
      );
    case "auto-logout":
      return (
        <AutoLogoutDialog
          current={props.autoLogout}
          onClose={onClose}
          onDone={props.onAutoLogoutSaved}
        />
      );
    case "unfamiliar":
      return (
        <UnfamiliarDeviceDialog
          onClose={onClose}
          onOpen={onOpen}
          onConfirmYes={() => props.onSessionTrusted("s4")}
          onConfirmNo={() => undefined}
        />
      );
    case "log-export":
      return (
        <LogExportDialog
          rows={props.logRows}
          onClose={onClose}
          onGotoLogs={props.onGotoLogs}
        />
      );
    case "backup-now":
      return <BackupNowWizard onClose={onClose} onDone={props.onBackupAdded} />;
    case "backup-detail":
      return (
        <BackupDetailDialog b={state.b} onClose={onClose} onOpen={onOpen} />
      );
    case "restore":
      return (
        <RestoreWizard
          preset={state.b}
          onClose={onClose}
          onDone={props.onRestoreDone}
        />
      );
    case "export-data":
      return <ExportDataWizard onClose={onClose} onDone={props.onExportDone} />;
    case "data-transfer":
      return <DataTransferDialog onClose={onClose} />;
    case "fraud":
      return (
        <FraudFeatureDialog
          f={state.f}
          onClose={onClose}
          onToggle={props.onFraudToggled}
        />
      );
    case "velocity":
      return (
        <VelocityLimitsDialog
          onClose={onClose}
          onDone={props.onVelocitySaved}
        />
      );
    case "secure":
      return (
        <SecureAccountDialog
          frozen={props.frozen}
          onClose={onClose}
          onDone={props.onSecureDone}
          onOpen={onOpen}
        />
      );
    case "recovery":
      return (
        <RecoveryDialog
          s={state.s}
          frozen={props.frozen}
          onClose={onClose}
          onOpen={onOpen}
        />
      );
    case "support":
      return <SupportDialog onClose={onClose} />;
    case "privacy":
      return (
        <PrivacyRightDialog
          r={state.r}
          sharing={DATA_SHARING_PREFS}
          onClose={onClose}
          onOpen={onOpen}
          onRestriction={props.onRestrictionSaved}
        />
      );
    case "delete-account":
      return (
        <DeleteAccountWizard
          onClose={onClose}
          onDone={props.onAccountDeleted}
        />
      );
    case "dpo":
      return <DpoContactDialog onClose={onClose} />;
    case "health":
      return (
        <HealthCheckWizard
          checks={props.checks}
          score={props.score}
          onGotoSessions={props.onGotoSessions}
          onClose={onClose}
          onOpen={onOpen}
        />
      );
    case "report":
      return <SecurityReportDialog score={props.score} onClose={onClose} />;
    case "emergency":
      return (
        <EmergencyContactDialog
          existing={props.emergency}
          onClose={onClose}
          onDone={props.onEmergencySaved}
        />
      );
    case "faq":
      return <SecFaqDialog items={SEC_FAQ} onClose={onClose} />;
    default:
      return null;
  }
}

/* ================= 18.7 — secure account ================= */

export function SecureAccountDialog({
  frozen,
  onClose,
  onDone,
  onOpen,
}: {
  frozen: boolean;
  onClose: () => void;
  onDone: (frozen: boolean) => void;
  onOpen: (s: SecModalState) => void;
}) {
  const [otp, setOtp] = useState("");
  const [unfreezeArmed, setUnfreezeArmed] = useState(false);

  return (
    <Dialog
      open
      onClose={onClose}
      title={frozen ? "Account freeze active" : "Secure my account"}
      desc={
        frozen
          ? "Everything that moves money out is stopped. Lift the freeze when you're sure."
          : "Instant, one-OTP action. It stops ALL outgoing money — sends, withdrawals, auto-pay, scheduled batches."
      }
    >
      {frozen ? (
        <>
          <SecCallout tone="success">
            Frozen since 10:52 today · Applied from Infinix Hot 40 · Deposits
            still land · Ref SEC-FRZ-2610-77
          </SecCallout>
          {unfreezeArmed ? (
            <div className="gm-sec-freeze-cta">
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                onClick={() => {
                  onDone(false);
                  onClose();
                }}
              >
                <ShieldCheck /> Unfreeze account
              </button>
              <p className="gm-sec-otp-hint">
                Unfreezing is instant and is written to the security log.
              </p>
            </div>
          ) : (
            <div className="gm-sec-otp">
              <p className="gm-sec-otp-hint">
                Enter the code to lift the freeze — sent to {SEC_CONTEXT.phone}.
              </p>
              <OtpInput value={otp} onChange={setOtp} label="Unfreeze code" />
              <p className="gm-sec-otp-demo">Demo code: 123456</p>
              <button
                type="button"
                className="gm-btn gm-btn-primary"
                disabled={otp.length !== 6}
                onClick={() => {
                  if (otp === "123456") setUnfreezeArmed(true);
                }}
              >
                <ShieldCheck /> Confirm unfreeze
              </button>
            </div>
          )}
          <div className="gm-sec-modal-actions">
            <button
              type="button"
              className="gm-btn gm-btn-ghost"
              onClick={() => onOpen({ kind: "support" })}
            >
              <PhoneCall /> Talk to support instead
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="gm-sec-kv">
            <div>
              <span>Stops</span>
              <strong>
                Sends · withdrawals · auto-pay · scheduled batches · API
                payments
              </strong>
            </div>
            <div>
              <span>Keeps working</span>
              <strong>Deposits, reading, backups, this page</strong>
            </div>
            <div>
              <span>Reversal</span>
              <strong>One OTP in the app, or support by phone</strong>
            </div>
          </div>
          <SecCallout tone="warn">
            Use this if you see a payment you didn't make, or a login you don't
            recognise. The freeze is instant — investigation can take its time.
          </SecCallout>
          <div className="gm-sec-otp">
            <p className="gm-sec-otp-hint">
              Confirm with the code sent to {SEC_CONTEXT.phone}.
            </p>
            <OtpInput value={otp} onChange={setOtp} label="Freeze code" />
            <p className="gm-sec-otp-demo">Demo code: 123456</p>
            <button
              type="button"
              className="gm-btn gm-btn-danger"
              disabled={otp.length !== 6}
              onClick={() => {
                if (otp === "123456") {
                  onDone(true);
                  onClose();
                }
              }}
            >
              <ShieldOff /> Freeze outgoing money — now
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
