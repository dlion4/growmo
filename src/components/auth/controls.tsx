/* Shared auth controls — all styling lives in the master theme (styles.css §17). */
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { lockScroll, unlockScroll } from "../../store/scroll-lock";

/* ================= Dialog (modal) ================= */
export function Dialog({
  open,
  onClose,
  title,
  desc,
  children,
  wide = false,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  desc?: string;
  children: ReactNode;
  wide?: boolean;
  dismissable?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    window.addEventListener("keydown", onKey);
    /* shared counter so a modal can never clear (or be cleared by) the
       dashboard shell's own scroll lock */
    lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;
  return (
    <div className="gm-modal-overlay" onClick={() => dismissable && onClose()}>
      <div
        className={`gm-modal ${wide ? "gm-modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gm-modal-head">
          <div>
            <h3 className="font-display">{title}</h3>
            {desc && <p>{desc}</p>}
          </div>
          {dismissable && (
            <button className="gm-icon-btn" onClick={onClose} aria-label="Close dialog">
              <X />
            </button>
          )}
        </div>
        <div className="gm-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ================= Stepper ================= */
export function Stepper({
  steps,
  current,
  onStep,
}: {
  steps: string[];
  current: number;
  onStep?: (i: number) => void;
}) {
  return (
    <ol className="gm-stepper" aria-label="Progress">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "now" : "todo";
        return (
          <li key={s} className={`gm-stepper-step is-${state}`}>
            <button
              type="button"
              className="gm-stepper-btn"
              disabled={!onStep || i > current}
              onClick={() => onStep?.(i)}
            >
              <span className="gm-stepper-dot">{i < current ? <Check /> : i + 1}</span>
              <span className="gm-stepper-label">{s}</span>
            </button>
            {i < steps.length - 1 && <span className="gm-stepper-bar" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ================= OTP input ================= */
export function OtpInput({
  length = 6,
  value,
  onChange,
  label = "Verification code",
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, d: string) => {
    const chars = value.split("");
    chars[i] = d;
    onChange(chars.join("").slice(0, length));
  };

  return (
    <div>
      <span className="gm-field-label">{label}</span>
      <div className="gm-otp" role="group" aria-label={label}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`gm-otp-box ${value[i] ? "is-filled" : ""}`}
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ""}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(-1);
              if (!d) return;
              setDigit(i, d);
              refs.current[Math.min(i + 1, length - 1)]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                e.preventDefault();
                if (value[i]) {
                  const chars = value.split("");
                  chars[i] = "";
                  onChange(chars.join(""));
                } else {
                  refs.current[Math.max(i - 1, 0)]?.focus();
                }
              }
              if (e.key === "ArrowLeft") refs.current[Math.max(i - 1, 0)]?.focus();
              if (e.key === "ArrowRight") refs.current[Math.min(i + 1, length - 1)]?.focus();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
              if (text) {
                onChange(text);
                refs.current[Math.min(text.length, length - 1)]?.focus();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ================= PIN pad ================= */
export function PinPad({
  length = 4,
  onComplete,
  resetKey = 0,
  actionLabel,
}: {
  length?: number;
  onComplete: (pin: string) => void;
  resetKey?: number;
  actionLabel?: string;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => setPin(""), [resetKey]);

  const press = (d: string) => {
    if (pin.length >= length) return;
    const next = (pin + d).slice(0, length);
    setPin(next);
    if (next.length === length) setTimeout(() => onComplete(next), 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") setPin((p) => p.slice(0, -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="gm-pinpad-wrap">
      <div className="gm-pin-dots" aria-label={`${pin.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={`gm-pin-dot ${i < pin.length ? "is-on" : ""}`} />
        ))}
      </div>
      <div className="gm-pinpad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className="gm-pin-key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="gm-pin-key gm-pin-util" onClick={() => setPin("")} aria-label="Clear PIN">
          C
        </button>
        <button type="button" className="gm-pin-key" onClick={() => press("0")}>
          0
        </button>
        <button
          type="button"
          className="gm-pin-key gm-pin-util"
          onClick={() => setPin((p) => p.slice(0, -1))}
          aria-label="Delete last digit"
        >
          ⌫
        </button>
      </div>
      {actionLabel && (
        <p className="text-center mt-2 mb-0" style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--gm-ink-400)" }}>
          {actionLabel}
        </p>
      )}
    </div>
  );
}

/* ================= Password field + strength ================= */
export function strengthOf(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(4, score <= 1 ? (pw.length > 0 ? 1 : 0) : score - 1);
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score: capped, label: labels[capped] ?? "Weak" };
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="gm-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          className="gm-input"
          style={{ paddingRight: "3rem" }}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            border: "none", background: "var(--gm-mint-100)", color: "var(--gm-leaf-700)",
            width: 34, height: 34, borderRadius: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {show ? <EyeOff width={17} height={17} /> : <Eye width={17} height={17} />}
        </button>
      </div>
    </div>
  );
}

export function StrengthMeter({ password, onStrong }: { password: string; onStrong?: () => void }) {
  const { score, label } = strengthOf(password);
  const fired = useRef(false);

  useEffect(() => {
    if (password.length === 0) fired.current = false;
    if (score >= 4 && !fired.current && password.length > 0) {
      fired.current = true;
      onStrong?.();
    }
  }, [score, password, onStrong]);

  if (password.length === 0) return null;
  return (
    <div className="gm-meter-wrap" aria-label={`Password strength: ${label}`}>
      <div className="gm-meter">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`gm-meter-bar ${i < score ? `is-on s${score}` : ""}`} />
        ))}
      </div>
      <small className="gm-meter-label">{label} — try 12+ characters with symbols</small>
    </div>
  );
}

/* ================= Countdown hook ================= */
export function useCountdown(totalSeconds: number) {
  const [left, setLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);

  return {
    left,
    running,
    start: (s?: number) => {
      if (s !== undefined) setLeft(s);
      setRunning(true);
    },
    reset: (s: number = totalSeconds) => {
      setLeft(s);
      setRunning(false);
    },
    mmss: `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`,
  };
}

/* TOTP 30-second window */
export function useTotpWindow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor(now / 1000) % 30;
  return { left: 30 - elapsed, pct: ((30 - elapsed) / 30) * 100 };
}

/* ================= Score ring ================= */
export function ScoreRing({ score, size = 148 }: { score: number; size?: number }) {
  const r = 60;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? "var(--gm-leaf-500)" : score >= 55 ? "var(--gm-gold-500)" : "var(--gm-clay-500)";
  return (
    <div className="gm-score-ring" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" width={size} height={size}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--gm-line)" strokeWidth="13" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * score) / 100}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset .8s var(--gm-ease), stroke .4s" }}
        />
      </svg>
      <div className="gm-score-center">
        <strong>{score}</strong>
        <small>/ 100</small>
      </div>
    </div>
  );
}

/* ================= Toggle switch ================= */
export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`gm-toggle-row ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="gm-toggle-track" aria-hidden="true">
        <span className="gm-toggle-thumb" />
      </span>
      <span className="gm-toggle-text">
        <strong>{label}</strong>
        {desc && <small>{desc}</small>}
      </span>
    </button>
  );
}
