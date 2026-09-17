import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Copy,
  Fingerprint,
  Laptop,
  Pencil,
  Plus,
  QrCode,
  ShieldCheck,
  Smartphone,
  Trash2,
  Usb,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, Stepper, Toggle } from "../../components/auth/controls";
import { AuthConsole } from "../../components/auth/shell";
import { PASSKEYS, PASSKEY_COMPARE, type Passkey } from "../../data/auth";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/auth/passkeys")({ component: PasskeysPage });

/* deterministic pseudo-QR for the pairing demo */
function PseudoQr({ seed }: { seed: number }) {
  const cells = useMemo(() => {
    const n = 21;
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const grid: boolean[] = [];
    for (let i = 0; i < n * n; i++) grid.push(rand() > 0.52);
    const finder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++)
        for (let c = 0; c < 7; c++) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[(r0 + r) * n + (c0 + c)] = edge || core;
        }
    };
    finder(0, 0);
    finder(0, n - 7);
    finder(n - 7, 0);
    return { grid, n };
  }, [seed]);

  const size = 168;
  const cell = size / cells.n;
  return (
    <svg className="gm-qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Pairing QR code">
      {cells.grid.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={(i % cells.n) * cell}
            y={Math.floor(i / cells.n) * cell}
            width={cell}
            height={cell}
            fill="#0c2317"
          />
        ) : null,
      )}
    </svg>
  );
}

function PasskeysPage() {
  const toast = useToast();
  const [keys, setKeys] = useState<Passkey[]>(PASSKEYS);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wStep, setWStep] = useState(0);
  const [wType, setWType] = useState("phone");
  const [wName, setWName] = useState("");
  const [wBusy, setWBusy] = useState(false);
  const [rename, setRename] = useState<Passkey | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [revoke, setRevoke] = useState<Passkey | null>(null);
  const [pairOpen, setPairOpen] = useState(false);
  const [policies, setPolicies] = useState({ pin: true, attest: true, autofill: false });

  const policy = (k: keyof typeof policies, label: string) => (v: boolean) => {
    setPolicies({ ...policies, [k]: v });
    toast.notify(`${label} ${v ? "enabled" : "disabled"}`, "info");
  };

  const addKey = () => {
    setWBusy(true);
    setTimeout(() => {
      setWBusy(false);
      setKeys([
        ...keys,
        {
          id: `p${Date.now()}`, name: wName || "New passkey",
          device: wType === "phone" ? "Android · this phone" : wType === "key" ? "Hardware key · USB/NFC" : "Laptop · browser",
          created: "Today", lastUsed: "Never",
          hue: "linear-gradient(135deg,#166534,#7bd88f)",
        },
      ]);
      setWizardOpen(false);
      setWStep(0);
      setWName("");
      toast.notify("Passkey added — phishing-proof sign-ins unlocked");
    }, 1400);
  };

  return (
    <AuthConsole
      title="Passkeys"
      desc="Passwordless sign-in for every device you own. No passwords to leak, phish or forget."
      actions={
        <>
          <button className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setPairOpen(true)}>
            <QrCode width={15} height={15} /> Pair device
          </button>
          <button className="gm-btn gm-btn-sm" onClick={() => { setWStep(0); setWizardOpen(true); }}>
            <Plus width={15} height={15} /> Add passkey
          </button>
        </>
      }
    >
      {/* inventory */}
      <div className="gm-auth-card mb-4">
        <h2 style={{ fontSize: "1.2rem" }}>Your passkeys ({keys.length})</h2>
        <p className="gm-auth-sub">Each passkey lives on its device — GrowMO only stores the public half.</p>
        <div className="d-grid gap-2">
          {keys.map((k) => (
            <div key={k.id} className="gm-check-row" style={{ marginBottom: 0 }}>
              <span className="gm-mega-icon" style={{ background: k.hue, color: "#fff" }}><Fingerprint width={19} height={19} /></span>
              <span style={{ flex: 1 }}>
                <strong>{k.name}</strong>
                <small>{k.device} · Added {k.created} · Last used {k.lastUsed}</small>
              </span>
              <button
                className="gm-icon-btn"
                style={{ width: 38, height: 38 }}
                aria-label={`Rename ${k.name}`}
                onClick={() => { setRename(k); setRenameVal(k.name); }}
              >
                <Pencil width={16} height={16} />
              </button>
              <button
                className="gm-icon-btn"
                style={{ width: 38, height: 38, color: "var(--gm-clay-500)" }}
                aria-label={`Revoke ${k.name}`}
                onClick={() => setRevoke(k)}
              >
                <Trash2 width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-4">
        {/* policies */}
        <div className="col-lg-5">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}>Sign-in policies</h2>
            <p className="gm-auth-sub">Guardrails applied to every passkey on your account.</p>
            <div className="d-grid gap-2">
              <Toggle checked={policies.pin} onChange={policy("pin", "Device PIN requirement")} label="Require device PIN" desc="Passkey needs PIN/biometric each use" />
              <Toggle checked={policies.attest} onChange={policy("attest", "Key attestation")} label="Hardware attestation" desc="Reject software-only passkeys" />
              <Toggle checked={policies.autofill} onChange={policy("autofill", "Autofill sign-in")} label="One-tap autofill" desc="Suggest passkey on this browser" />
            </div>
          </div>
        </div>

        {/* comparison */}
        <div className="col-lg-7">
          <div className="gm-auth-card h-100">
            <h2 style={{ fontSize: "1.2rem" }}>Why passkeys win</h2>
            <p className="gm-auth-sub">Passkey vs password vs SMS code, head to head.</p>
            <div className="gm-table-wrap">
              <table className="gm-table" style={{ minWidth: 0 }}>
                <thead>
                  <tr><th>Capability</th><th>Passkey</th><th>Password</th><th>SMS</th></tr>
                </thead>
                <tbody>
                  {PASSKEY_COMPARE.map((r) => (
                    <tr key={r.feature}>
                      <td>{r.feature}</td>
                      <td>{r.passkey ? <Check width={17} height={17} color="var(--gm-leaf-600)" /> : <X width={17} height={17} color="var(--gm-line)" />}</td>
                      <td>{r.password ? <Check width={17} height={17} color="var(--gm-leaf-600)" /> : <X width={17} height={17} color="var(--gm-line)" />}</td>
                      <td>{r.sms ? <Check width={17} height={17} color="var(--gm-leaf-600)" /> : <X width={17} height={17} color="var(--gm-line)" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* add wizard */}
      <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} title="Add a passkey" desc="Three quick steps — your device does the crypto.">
        <Stepper steps={["Device", "Name", "Confirm"]} current={wStep} />
        {wStep === 0 && (
          <div>
            <div className="gm-method-grid mb-3">
              {[
                { id: "phone", icon: Smartphone, t: "This phone", d: "Fingerprint" },
                { id: "key", icon: Usb, t: "Security key", d: "USB / NFC" },
                { id: "laptop", icon: Laptop, t: "Laptop", d: "Browser" },
              ].map((t) => (
                <button key={t.id} className={`gm-method ${wType === t.id ? "is-active" : ""}`} onClick={() => setWType(t.id)}>
                  <span className="gm-method-icon"><t.icon /></span>
                  <strong>{t.t}</strong>
                  <small>{t.d}</small>
                </button>
              ))}
            </div>
            <button className="gm-btn gm-btn-block" onClick={() => setWStep(1)}>Continue <ArrowRight /></button>
          </div>
        )}
        {wStep === 1 && (
          <div>
            <div className="gm-field">
              <label htmlFor="pk-name">Name this passkey</label>
              <input id="pk-name" className="gm-input" placeholder="e.g. Mum's Tecno — backup" value={wName} onChange={(e) => setWName(e.target.value)} />
            </div>
            <div className="d-flex gap-2">
              <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setWStep(0)}>Back</button>
              <button className="gm-btn" style={{ flex: 1 }} disabled={!wName.trim()} onClick={() => setWStep(2)}>Continue <ArrowRight /></button>
            </div>
          </div>
        )}
        {wStep === 2 && (
          <div className="text-center">
            <span className="gm-service-icon mx-auto mb-3" style={{ background: kBg(wType), color: "#fff", width: 64, height: 64 }}>
              <ShieldCheck width={30} height={30} />
            </span>
            <p style={{ fontWeight: 600, color: "var(--gm-ink-600)" }}>
              {wBusy ? "Follow the prompt on your device — verifying…" : `Ready to create “${wName}”. Your device will ask for fingerprint or PIN.`}
            </p>
            <div className="d-flex gap-2 mt-3">
              <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} disabled={wBusy} onClick={() => setWStep(1)}>Back</button>
              <button className="gm-btn" style={{ flex: 1 }} disabled={wBusy} onClick={addKey}>
                {wBusy ? <span className="gm-spinner" /> : <Fingerprint />} {wBusy ? "Waiting…" : "Create passkey"}
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* rename */}
      <Dialog open={!!rename} onClose={() => setRename(null)} title="Rename passkey" desc={rename?.device}>
        <div className="gm-field">
          <label htmlFor="pk-rename">Passkey name</label>
          <input id="pk-rename" className="gm-input" value={renameVal} onChange={(e) => setRenameVal(e.target.value)} />
        </div>
        <div className="d-flex gap-2">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setRename(null)}>Cancel</button>
          <button
            className="gm-btn"
            style={{ flex: 1 }}
            disabled={!renameVal.trim()}
            onClick={() => {
              if (!rename) return;
              setKeys(keys.map((k) => (k.id === rename.id ? { ...k, name: renameVal.trim() } : k)));
              setRename(null);
              toast.notify("Passkey renamed");
            }}
          >
            <Check /> Save name
          </button>
        </div>
      </Dialog>

      {/* revoke */}
      <Dialog open={!!revoke} onClose={() => setRevoke(null)} title="Revoke this passkey?" desc="This device will no longer sign you in.">
        <p className="gm-check-row">
          <span className="gm-mega-icon" style={{ background: "rgba(198,91,59,.12)", color: "var(--gm-clay-500)" }}><Trash2 /></span>
          <span><strong>{revoke?.name}</strong><small>{revoke?.device} · Last used {revoke?.lastUsed}</small></span>
        </p>
        <div className="d-flex gap-2">
          <button className="gm-btn gm-btn-outline" style={{ flex: 1 }} onClick={() => setRevoke(null)}>Keep it</button>
          <button
            className="gm-btn gm-btn-danger-soft"
            style={{ flex: 1 }}
            onClick={() => {
              if (!revoke) return;
              setKeys(keys.filter((k) => k.id !== revoke.id));
              setRevoke(null);
              toast.notify("Passkey revoked — device signed out", "warn");
            }}
          >
            <Trash2 /> Yes, revoke
          </button>
        </div>
      </Dialog>

      {/* pair device */}
      <Dialog open={pairOpen} onClose={() => setPairOpen(false)} title="Pair a new device" desc="Scan with the GrowMO app on your other phone.">
        <div className="text-center">
          <PseudoQr seed={428913} />
          <p className="mt-3 mb-1" style={{ fontSize: ".82rem", fontWeight: 800, color: "var(--gm-ink-400)" }}>OR ENTER PAIRING CODE</p>
          <span className="gm-code-chip">GM-482-913</span>
          <div className="d-flex gap-2 mt-3">
            <button
              className="gm-btn gm-btn-outline gm-btn-sm"
              style={{ flex: 1 }}
              onClick={() => {
                try { navigator.clipboard.writeText("GM-482-913"); } catch { /* noop */ }
                toast.notify("Pairing code copied", "info");
              }}
            >
              <Copy width={15} height={15} /> Copy code
            </button>
            <button className="gm-btn gm-btn-sm" style={{ flex: 1 }} onClick={() => { setPairOpen(false); toast.notify("New device paired — passkey created"); }}>
              <Check width={15} height={15} /> Simulate scan
            </button>
          </div>
        </div>
      </Dialog>
    </AuthConsole>
  );
}

function kBg(t: string) {
  return t === "key"
    ? "linear-gradient(135deg,#581c87,#a855f7)"
    : t === "laptop"
      ? "linear-gradient(135deg,#1e3a8a,#3b82f6)"
      : "var(--gm-grad-primary)";
}
