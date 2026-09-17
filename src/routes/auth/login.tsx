import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Fingerprint,
  KeyRound,
  LifeBuoy,
  Link2,
  Lock,
  Mail,
  Phone,
  Smartphone,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Dialog, PasswordField, PinPad, useCountdown } from "../../components/auth/controls";
import { AuthSplit } from "../../components/auth/shell";
import { SAVED_ACCOUNTS } from "../../data/auth";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

type Method = "passkey" | "password" | "pin" | "magic" | "social";

const METHODS: { id: Method; label: string; sub: string; icon: typeof KeyRound }[] = [
  { id: "passkey", label: "Passkey", sub: "Fastest", icon: Fingerprint },
  { id: "password", label: "Password", sub: "Classic", icon: KeyRound },
  { id: "pin", label: "PIN pad", sub: "4 digits", icon: Lock },
  { id: "magic", label: "Magic link", sub: "No typing", icon: Link2 },
  { id: "social", label: "Social", sub: "1 tap", icon: Users },
];

function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("passkey");
  const [identifier, setIdentifier] = useState("0712 345 678");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [currentId, setCurrentId] = useState("mary");
  const [switchOpen, setSwitchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pinKey, setPinKey] = useState(0);
  const resend = useCountdown(30);

  const current = SAVED_ACCOUNTS.find((a) => a.id === currentId) ?? SAVED_ACCOUNTS[0];

  const simulate = (ms: number, msg: string, to: string) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      toast.notify(msg);
      navigate({ to });
    }, ms);
  };

  const sendMagic = () => {
    setMagicSent(true);
    resend.start(30);
    toast.notify(`Magic link sent to ${identifier}`, "info");
  };

  return (
    <AuthSplit
      eyebrow="Welcome back"
      title="Your farm never sleeps."
      intro="Pick the way you like to sign in — passkey, PIN, magic link or classic password. Every session is encrypted end to end."
      points={["5 sign-in methods, same account", "M-Pesa-ready trusted sessions", "Kabambe? Dial *384*66# anytime"]}
      quote={{ text: "I sign in with my fingerprint before sunrise scouting. Ten seconds and I'm checking tasks.", who: "Mary W., Kiambu" }}
    >
      <div className="gm-auth-card">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div>
            <h2>Sign in to GrowMO</h2>
            <p className="gm-auth-sub">How would you like to continue{current ? `, ${current.name.split(" ")[0]}` : ""}?</p>
          </div>
          <button className="gm-icon-btn" onClick={() => setHelpOpen(true)} aria-label="Get sign-in help" title="Get help">
            <LifeBuoy />
          </button>
        </div>

        {/* method picker */}
        <div className="gm-method-grid mb-4" role="tablist" aria-label="Sign-in methods">
          {METHODS.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={method === m.id}
              className={`gm-method ${method === m.id ? "is-active" : ""}`}
              onClick={() => {
                setMethod(m.id);
                toast.notify(`${m.label} sign-in selected`, "info");
              }}
            >
              <span className="gm-method-icon"><m.icon /></span>
              <strong>{m.label}</strong>
              <small>{m.sub}</small>
            </button>
          ))}
        </div>

        {/* PASSKEY */}
        {method === "passkey" && (
          <div>
            <button className="gm-account-row mb-3" onClick={() => setSwitchOpen(true)} aria-label="Switch account">
              <span className="gm-ava" style={{ background: current.hue }}>{current.initials}</span>
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: ".92rem" }}>{current.name}</strong>
                <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>{current.phone} · {current.lastActive}</small>
              </span>
              <small style={{ fontWeight: 800, color: "var(--gm-leaf-700)" }}>Switch</small>
            </button>
            <button className="gm-btn gm-btn-block gm-btn-lg" disabled={busy} onClick={() => simulate(1300, "Passkey verified — welcome back!", "/auth/hub")}>
              {busy ? <span className="gm-spinner" /> : <Fingerprint />} {busy ? "Verifying…" : "Sign in with passkey"}
            </button>
            <p className="text-center mt-3 mb-0" style={{ fontSize: ".82rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>
              Use fingerprint, face unlock or your security key. <Link to="/auth/passkeys" className="gm-link-arrow" style={{ fontSize: ".82rem" }}>Manage passkeys</Link>
            </p>
          </div>
        )}

        {/* PASSWORD */}
        {method === "password" && (
          <form onSubmit={(e) => { e.preventDefault(); simulate(1100, "Password accepted — one more step", "/auth/mfa"); }}>
            <div className="gm-field">
              <label htmlFor="login-id">Phone or email</label>
              <input id="login-id" className="gm-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
            </div>
            <PasswordField id="login-pw" label="Password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="••••••••" />
            <div className="d-flex align-items-center justify-content-between mb-3">
              <label style={{ display: "flex", gap: ".5rem", alignItems: "center", fontSize: ".85rem", fontWeight: 700 }}>
                <input type="checkbox" defaultChecked /> Remember this device
              </label>
              <Link to="/auth/recovery" className="gm-link-arrow" style={{ fontSize: ".85rem" }}>Forgot password?</Link>
            </div>
            <button className="gm-btn gm-btn-block gm-btn-lg" type="submit" disabled={busy}>
              {busy ? <span className="gm-spinner" /> : <KeyRound />} {busy ? "Checking…" : "Sign in"} <ArrowRight />
            </button>
            <p className="text-center mt-3 mb-0" style={{ fontSize: ".82rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>
              Password sign-ins ask for a second factor. That's a good thing.
            </p>
          </form>
        )}

        {/* PIN */}
        {method === "pin" && (
          <div>
            <p className="text-center mb-3" style={{ fontWeight: 700, color: "var(--gm-ink-600)" }}>
              Enter the 4-digit PIN for <strong>{current.phone}</strong>
            </p>
            <PinPad
              length={4}
              resetKey={pinKey}
              actionLabel="Same PIN as your GrowMO wallet"
              onComplete={() => simulate(900, "PIN correct — welcome back!", "/auth/hub")}
            />
            <p className="text-center mt-3 mb-0">
              <Link to="/auth/recovery" className="gm-link-arrow" style={{ fontSize: ".85rem" }}>Forgot PIN?</Link>
              <span style={{ color: "var(--gm-line)", marginInline: ".6rem" }}>|</span>
              <button type="button" className="gm-link-arrow" style={{ fontSize: ".85rem", border: "none", background: "none", cursor: "pointer" }} onClick={() => { setPinKey((k) => k + 1); toast.notify("PIN pad cleared", "info"); }}>
                Clear
              </button>
            </p>
          </div>
        )}

        {/* MAGIC LINK */}
        {method === "magic" && (
          <div>
            {!magicSent ? (
              <>
                <div className="gm-field">
                  <label htmlFor="magic-id">Phone or email</label>
                  <input id="magic-id" className="gm-input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                </div>
                <div className="d-flex gap-2 mb-3">
                  <span className="gm-chip"><Smartphone width={14} height={14} /> SMS</span>
                  <span className="gm-chip"><Mail width={14} height={14} /> Email</span>
                </div>
                <button className="gm-btn gm-btn-block gm-btn-lg" onClick={sendMagic}>
                  <Link2 /> Send me a magic link
                </button>
              </>
            ) : (
              <div className="text-center py-2">
                <span className="gm-service-icon mx-auto" style={{ background: "var(--gm-grad-primary)", color: "#fff" }}>
                  <Check />
                </span>
                <h3 className="font-display mt-3">Check your messages</h3>
                <p style={{ color: "var(--gm-ink-600)", fontWeight: 600 }}>
                  We sent a sign-in link to <strong>{identifier}</strong>. It expires in 10 minutes.
                </p>
                <button className="gm-btn gm-btn-block" onClick={() => simulate(900, "Magic link verified — welcome!", "/auth/hub")} disabled={busy}>
                  {busy ? <span className="gm-spinner" /> : <Check />} I've clicked the link
                </button>
                <p className="mt-3 mb-0" style={{ fontSize: ".85rem", fontWeight: 700 }}>
                  {resend.running ? (
                    <span style={{ color: "var(--gm-ink-400)" }}>Resend available in {resend.mmss}</span>
                  ) : (
                    <button type="button" className="gm-link-arrow" style={{ border: "none", background: "none", cursor: "pointer" }} onClick={sendMagic}>
                      Resend link
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* SOCIAL */}
        {method === "social" && (
          <div className="d-grid gap-2">
            <button className="gm-btn gm-btn-outline gm-btn-block gm-btn-lg" disabled={busy} onClick={() => simulate(1200, "Signed in with Google", "/auth/hub")}>
              {busy ? <span className="gm-spinner dark" /> : <span style={{ fontWeight: 900 }}>G</span>} Continue with Google
            </button>
            <button className="gm-btn gm-btn-dark gm-btn-block gm-btn-lg" disabled={busy} onClick={() => simulate(1200, "Signed in with Apple", "/auth/hub")}>
              {busy ? <span className="gm-spinner" /> : <Smartphone />} Continue with Apple
            </button>
            <p className="text-center mt-2 mb-0" style={{ fontSize: ".82rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>
              We only read your name + email. Your farm data stays with GrowMO.
            </p>
          </div>
        )}

        <div className="gm-divider">New to GrowMO?</div>
        <Link to="/auth/register" className="gm-btn gm-btn-soft gm-btn-block">
          Create a free account <ArrowRight />
        </Link>
        <p className="text-center mt-3 mb-0" style={{ fontSize: ".8rem", color: "var(--gm-ink-400)", fontWeight: 600 }}>
          <Phone width={13} height={13} /> No smartphone? Dial <strong>*384*66#</strong> from any phone.
        </p>
      </div>

      {/* switch account dialog */}
      <Dialog open={switchOpen} onClose={() => setSwitchOpen(false)} title="Switch account" desc="Pick a saved account on this device.">
        <div className="d-grid gap-2">
          {SAVED_ACCOUNTS.map((a) => (
            <button
              key={a.id}
              className="gm-account-row"
              onClick={() => {
                setCurrentId(a.id);
                setSwitchOpen(false);
                toast.notify(`Switched to ${a.name}`);
              }}
            >
              <span className="gm-ava" style={{ background: a.hue }}>{a.initials}</span>
              <span style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: ".9rem" }}>{a.name}</strong>
                <small style={{ color: "var(--gm-ink-400)", fontWeight: 700 }}>{a.phone} · {a.lastActive}</small>
              </span>
              {a.id === currentId && <span className="gm-chip">Current</span>}
            </button>
          ))}
        </div>
        <button className="gm-btn gm-btn-outline gm-btn-block mt-3" onClick={() => { setSwitchOpen(false); toast.notify("Add-account flow started", "info"); }}>
          Use a different account
        </button>
      </Dialog>

      {/* help router dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Sign-in help" desc="What seems to be the problem? We'll route you right.">
        {[
          { icon: Lock, t: "I forgot my PIN or password", d: "Reset in ~3 minutes with SMS verification", go: "/auth/recovery" },
          { icon: Smartphone, t: "I lost my phone", d: "Freeze sessions + assisted recovery", go: "/auth/recovery" },
          { icon: Fingerprint, t: "My passkey stopped working", d: "Re-pair this device or use PIN instead", go: "/auth/passkeys" },
          { icon: Phone, t: "Talk to a human", d: "Free helpline 0800 221 000 · Mon–Sat", go: "" },
        ].map((h) => (
          <button
            key={h.t}
            className="gm-option-row"
            onClick={() => {
              setHelpOpen(false);
              if (h.go) {
                toast.notify("Taking you there…", "info");
                navigate({ to: h.go });
              } else {
                toast.notify("Calling 0800 221 000… (demo)", "info");
              }
            }}
          >
            <span className="gm-mega-icon"><h.icon /></span>
            <span style={{ flex: 1 }}>
              <strong style={{ display: "block", fontSize: ".9rem" }}>{h.t}</strong>
              <small style={{ color: "var(--gm-ink-400)", fontWeight: 600 }}>{h.d}</small>
            </span>
            <ArrowRight width={17} height={17} color="var(--gm-leaf-600)" />
          </button>
        ))}
      </Dialog>
    </AuthSplit>
  );
}
