/* ============================================================================
   PAGE 16 — CHANNELS modals (install, offline queue, agent cash-in, help)
   ========================================================================== */
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent } from "../../data/app/channels";
import { CHANNELS_CONTEXT, SMS_COMMANDS, USSD_SESSION_COST, WA_FEATURES } from "../../data/app/channels";
import { kes } from "../../data/site";
import { Dialog, OtpInput, Stepper } from "../auth/controls";
import { ChannelsFaqList, ChannelsGlossary, KvPairs } from "./ChannelsWidgets";
import { WizardActions } from "./DashboardWidgets";

function code(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = `${prefix}-`;
  for (let i = 0; i < 6; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="gm-ch-processing">
      <Loader2 className="spin" />
      <p>{label}</p>
    </div>
  );
}

function Done({ title, note, receipt }: { title: string; note: string; receipt: string }) {
  return (
    <div className="gm-ch-done">
      <span className="gm-ch-done-mark">
        <CheckCircle2 />
      </span>
      <h3 className="font-display">{title}</h3>
      <p>{note}</p>
      <div className="gm-code-chip">{receipt}</div>
    </div>
  );
}

/* ---------------- install the PWA ---------------- */
export function InstallPwaDialog({
  open,
  onClose,
  onInstalled,
}: {
  open: boolean;
  onClose: () => void;
  onInstalled: () => void;
}) {
  const [step, setStep] = useState(0);
  const steps = ["Install", "Permissions", "Ready"];
  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Install GrowMO on this phone" desc={`${CHANNELS_CONTEXT.appVersion} · about 2.4 MB`} wide>
      <Stepper steps={steps} current={step} onStep={(index) => index <= step && setStep(index)} />
      {step === 0 ? (
        <div className="gm-ch-install">
          <p className="gm-ch-note">
            Android: open the browser menu (⋮) and tap <strong>Install app</strong>. iPhone: tap the share icon then{" "}
            <strong>Add to Home Screen</strong>. The shell installs once; plans, tasks and prices then cache in the
            background so the farm works with no bars at all.
          </p>
          <KvPairs
            items={[
              { k: "Download size", v: "2.4 MB shell · 6 MB with the October plan cached" },
              { k: "Storage use", v: "48 MB of 256 MB allowed" },
              { k: "Runs on", v: "Android 8+, iOS 15+, any modern browser" },
              { k: "Works offline", v: "Tasks, logs, photos, records" },
            ]}
          />
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-ch-install">
          <KvPairs
            items={[
              { k: "Storage", v: "Allowed — needed for the offline cache" },
              { k: "Camera", v: "Allowed — pest and disease photos, batch QRs" },
              { k: "Location", v: "While in use — geofenced attendance and spray records" },
              { k: "Notifications", v: "Allowed — task reminders, weather warnings, payment receipts" },
              { k: "Background sync", v: "Allowed — flushes the queue when data returns" },
            ]}
          />
          <p className="gm-ch-note is-small">Location is never tracked outside a task or a record you create, and it never leaves Kenya.</p>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-ch-install">
          <p className="gm-ch-note">
            Offline mode is on. Try it: switch off mobile data and mark a task complete — the change queues and syncs by
            itself the moment you are back online.
          </p>
          <KvPairs
            items={[
              { k: "Offline queue", v: "Up to 20 actions and 15 photos" },
              { k: "Data saver", v: "Low-data mode is on by default on 3G" },
              { k: "Shortcodes saved", v: `${CHANNELS_CONTEXT.ussd} and ${CHANNELS_CONTEXT.smsShort}` },
            ]}
          />
        </div>
      ) : null}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          {step === 2 ? "Close" : "Later"}
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => {
            if (step < 2) {
              setStep(step + 1);
              return;
            }
            onInstalled();
            onClose();
          }}
        >
          {step === 2 ? "Finish" : "Next"}
        </button>
      </div>
    </Dialog>
  );
}

/* ---------------- queue an offline action ---------------- */
export function OfflineActionDialog({
  open,
  online,
  onClose,
  onQueued,
}: {
  open: boolean;
  online: boolean;
  onClose: () => void;
  onQueued: (label: string, detail: string) => void;
}) {
  const [action, setAction] = useState("Marked task complete");
  const [detail, setDetail] = useState("Weeding Plot 1 · crew of 3");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAction("Marked task complete");
    setDetail("Weeding Plot 1 · crew of 3");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} title="Simulate an offline action" desc={online ? "You are online — the change would post immediately" : "You are offline — the change will queue"}>
      {receipt ? (
        <>
          <Done
            title={online ? "Posted live" : "Queued for sync"}
            note={online ? "The action went straight to the server and the ledger is up to date." : "The action is stored on the phone with GPS and time. It flushes automatically when data returns."}
            receipt={receipt}
          />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Saving on the phone…" />
      ) : (
        <>
          <div className="gm-ch-form">
            <label className="gm-field">
              <span>Action</span>
              <select className="gm-select" value={action} onChange={(event) => setAction(event.target.value)}>
                {["Marked task complete", "Recorded an expense", "Logged a spray", "Took a scouting photo", "Closed a harvest batch"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="gm-field">
              <span>Detail that goes in the record</span>
              <input className="gm-input" value={detail} onChange={(event) => setDetail(event.target.value)} />
            </label>
            <p className="gm-ch-note is-small">
              Offline actions keep GPS, timestamp and the worker. Conflicts are resolved last-write-wins with both versions
              kept in the audit log.
            </p>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={!detail.trim()}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const ref = code(online ? "LIVE" : "QUEUE");
                  setBusy(false);
                  setReceipt(ref);
                  onQueued(action, detail);
                }, 900);
              }}
            >
              {online ? "Post now" : "Queue it"}
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ---------------- agent cash-in ---------------- */
export function AgentCashInDialog({
  open,
  agent,
  onClose,
  onDone,
}: {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onDone: (agent: Agent, amount: number, receipt: string) => void;
}) {
  const [amount, setAmount] = useState(2000);
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount(2000);
    setStep(0);
    setOtp("");
    setBusy(false);
    setReceipt(null);
  }, [open]);

  if (!agent) return null;
  const fee = 20;

  return (
    <Dialog open={open} onClose={onClose} title={`Cash-in at ${agent.name}`} desc={`${agent.town} · ${agent.distance} · float ${kes(agent.float)}`} wide>
      <Stepper steps={["Amount", "Confirm", "Receipt"]} current={step} onStep={(index) => index <= step && setStep(index)} />
      {receipt ? (
        <>
          <Done title="Wallet credited" note={`${kes(amount)} deposited at ${agent.name}. The agent keeps a KES ${fee} service fee, and GrowMO pays their commission.`} receipt={receipt} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Agent confirming the deposit…" />
      ) : (
        <>
          {step === 0 ? (
            <div className="gm-ch-form">
              <label className="gm-field">
                <span>Cash you are handing over (KES)</span>
                <input className="gm-input" type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              </label>
              <div className="gm-ch-quick">
                {[500, 1000, 2000, 5000, 10000].map((value) => (
                  <button key={value} type="button" className={`gm-filter-chip ${amount === value ? "is-on" : ""}`} onClick={() => setAmount(value)}>
                    {kes(value)}
                  </button>
                ))}
              </div>
              <KvPairs
                items={[
                  { k: "Agent", v: `${agent.name} · ${agent.hours}` },
                  { k: "Fee", v: `${kes(fee)} flat on deposits of KES 100–50,000` },
                  { k: "Float available", v: kes(agent.float) },
                  { k: "Credited to", v: "GrowMO wallet · 0712 345 678" },
                ]}
              />
            </div>
          ) : null}
          {step === 1 ? (
            <div className="gm-ch-form">
              <p className="gm-ch-note">
                Hand <strong>{kes(amount)}</strong> to {agent.name}. They trigger the deposit; you confirm with the OTP that
                lands on your phone (demo code 123456).
              </p>
              <OtpInput value={otp} onChange={setOtp} label="Deposit OTP" />
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={1}
            onBack={() => setStep((current) => Math.max(0, current - 1))}
            nextLabel="Confirm"
            finishLabel="Confirm cash-in"
            nextDisabled={amount < 100 || amount > 50000 || (step === 1 && otp.length < 6)}
            onNext={() => {
              if (step < 1) {
                setStep(1);
                return;
              }
              setBusy(true);
              setTimeout(() => {
                const ref = code("DEP");
                setBusy(false);
                setStep(2);
                setReceipt(ref);
                onDone(agent, amount, ref);
              }, 1200);
            }}
          />
        </>
      )}
    </Dialog>
  );
}

/* ---------------- agent registration ---------------- */
export function AgentRegisterDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (receipt: string) => void }) {
  const [name, setName] = useState("");
  const [town, setTown] = useState("Githunguri");
  const [phone, setPhone] = useState("07");
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("07");
    setBusy(false);
    setReceipt(null);
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Become a GrowMO agent" desc="Agro-vets, M-Pesa agents, community leaders and co-ops welcome">
      {receipt ? (
        <>
          <Done title="Application received" note="Our Kiambu field officer will call within two working days to arrange KYC and the three-day training." receipt={receipt} />
          <div className="d-flex justify-content-end mt-3">
            <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
              Done
            </button>
          </div>
        </>
      ) : busy ? (
        <Spinner label="Submitting the application…" />
      ) : (
        <>
          <div className="gm-ch-form">
            <label className="gm-field">
              <span>Business or your name</span>
              <input className="gm-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ikinu Agrovet" />
            </label>
            <label className="gm-field">
              <span>Town or market</span>
              <input className="gm-input" value={town} onChange={(event) => setTown(event.target.value)} />
            </label>
            <label className="gm-field">
              <span>Phone</span>
              <input className="gm-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <KvPairs
              items={[
                { k: "Training", v: "3 days, Githunguri or Nairobi" },
                { k: "Equipment", v: "Smartphone and starter float support" },
                { k: "Commission", v: "KES 10–50 per transaction, KES 20 per deposit" },
              ]}
            />
          </div>
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={!name || phone.length < 9}
              onClick={() => {
                setBusy(true);
                setTimeout(() => {
                  const ref = code("AGENT");
                  setBusy(false);
                  setReceipt(ref);
                  onDone(ref);
                }, 1100);
              }}
            >
              Apply to be an agent
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}

/* ---------------- help dialogs ---------------- */
export function UssdHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="USSD *384# help" desc={USSD_SESSION_COST} wide>
      <KvPairs
        items={[
          { k: "How to dial", v: "Type *384# and press call — no data, no airtime bundle required" },
          { k: "Languages", v: "Kiswahili and English on every screen" },
          { k: "Menu depth", v: "8 root options, up to 3 levels" },
          { k: "Payments", v: "Started in USSD, confirmed with a wallet PIN or a YES reply" },
          { k: "Works on", v: "Safaricom, Airtel and Telkom lines" },
          { k: "Accessibility", v: "Large text, short lines, no scrolling" },
        ]}
      />
      <p className="gm-ch-note is-small">
        Tip: if a session times out mid-task, dial again — GrowMO resumes where you left off because the session is tied to
        your phone number.
      </p>
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function SmsHelpDialog({ open, onClose, onUse }: { open: boolean; onClose: () => void; onUse: (example: string) => void }) {
  return (
    <Dialog open={open} onClose={onClose} title={`SMS commands to ${CHANNELS_CONTEXT.smsShort}`} desc="Standard SMS rates apply" wide>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
              <th>Example</th>
              <th>Reply</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {SMS_COMMANDS.map((entry) => (
              <tr key={entry.code}>
                <td>
                  <code>{entry.code}</code>
                </td>
                <td>{entry.label}</td>
                <td>{entry.example}</td>
                <td>{entry.returns}</td>
                <td>
                  <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onUse(entry.example)}>
                    Try
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}

export function WhatsAppHelpDialog({ open, onClose, onCall }: { open: boolean; onClose: () => void; onCall: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="WhatsApp bot help" desc={`${CHANNELS_CONTEXT.waNumber} · replies in under a minute`} wide>
      <KvPairs items={WA_FEATURES.map((item) => ({ k: item.feature, v: item.how }))} />
      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="gm-btn gm-btn-outline" onClick={onClose}>
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onCall}>
          Start a chat demo
        </button>
      </div>
    </Dialog>
  );
}

export function ChannelsFaqDialog({
  open,
  onClose,
  faqs,
  glossary,
}: {
  open: boolean;
  onClose: () => void;
  faqs: { q: string; a: string }[];
  glossary: { term: string; def: string }[];
}) {
  const [index, setIndex] = useState<number | null>(0);
  return (
    <Dialog open={open} onClose={onClose} title="Channel questions" desc="USSD, SMS, offline mode and agents" wide>
      <ChannelsFaqList items={faqs} open={index} onOpen={setIndex} />
      <h3 className="gm-h-section mt-3">Glossary</h3>
      <ChannelsGlossary items={glossary} />
      <div className="d-flex justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Close
        </button>
      </div>
    </Dialog>
  );
}
