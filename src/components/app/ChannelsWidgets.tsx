/* ============================================================================
   PAGE 16 — CHANNELS widgets (offline, USSD, SMS, WhatsApp, agents)
   ========================================================================== */
import { ArrowLeft, CircleDot, Send, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent, SmsCommand, UssdScreen } from "../../data/app/channels";
import {
  AGENTS,
  CHANNELS_CONTEXT,
  DATA_SAVERS,
  OFFLINE_FEATURES,
  OFFLINE_TIPS,
  SMS_COMMANDS,
  SMS_FACTS,
  type SYNC_QUEUE,
  USSD_ROOT,
  USSD_SCREENS,
  WA_FEATURES,
} from "../../data/app/channels";
import { kes } from "../../data/site";
import { StatusChip } from "./DashboardWidgets";

/* ---------------- hero ---------------- */
export function ChannelsHero({
  ctx,
  online,
  onToggleOnline,
}: {
  ctx: typeof CHANNELS_CONTEXT;
  online: boolean;
  onToggleOnline: () => void;
}) {
  return (
    <section className="gm-ch-hero">
      <div className="gm-ch-hero-top">
        <div className="gm-ch-hero-copy">
          <span className={`gm-chip ${online ? "gm-chip-lime" : "gm-chip-gold"}`}>
            {online ? <Wifi /> : <WifiOff />} {online ? "Online · synced" : "Offline mode · changes queued"}
          </span>
          <h1 className="font-display">Every channel, one farm record</h1>
          <p>
            Smartphone app with a real offline mode, USSD on any kabambe, SMS to 20550, a WhatsApp bot that reads photos,
            and agents in Githunguri, Ikinu and beyond for anyone who prefers to talk to a person.
          </p>
        </div>
        <div className="gm-ch-hero-actions">
          <button type="button" className="gm-btn gm-btn-lime" onClick={onToggleOnline}>
            {online ? "Simulate losing network" : "Reconnect the phone"}
          </button>
          <span className="gm-chip gm-chip-dark">{ctx.device}</span>
        </div>
      </div>
      <div className="gm-ch-hero-stats">
        <div className="gm-ch-stat">
          <strong>{ctx.ussd}</strong>
          <small>USSD menu</small>
        </div>
        <div className="gm-ch-stat">
          <strong>{ctx.smsShort}</strong>
          <small>SMS short code</small>
        </div>
        <div className="gm-ch-stat">
          <strong>{ctx.waNumber}</strong>
          <small>WhatsApp bot</small>
        </div>
        <div className="gm-ch-stat">
          <strong>{ctx.offlineHours30d} h</strong>
          <small>Offline in 30 days</small>
        </div>
        <div className="gm-ch-stat">
          <strong>{ctx.agentsNearby}</strong>
          <small>Agents within 10 km</small>
        </div>
        <div className="gm-ch-stat">
          <strong>{ctx.dataUsed}</strong>
          <small>Data used</small>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 16.1 offline ---------------- */
export function OfflineBanner({ online, queue, lastSync, onSync }: { online: boolean; queue: number; lastSync: string; onSync: () => void }) {
  if (online && queue === 0) return null;
  return (
    <div className={`gm-ch-banner ${online ? "is-syncing" : "is-offline"}`}>
      <span className="gm-ch-banner-ic">{online ? "🔄" : "🌍"}</span>
      <div>
        <strong>{online ? `${queue} changes syncing now` : "You're offline. Changes will sync when connected."}</strong>
        <small>{online ? `Last full sync ${lastSync}` : `Queued actions run themselves the moment the network returns · last sync ${lastSync}`}</small>
      </div>
      <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={onSync} disabled={!online}>
        {online ? "Sync now" : "Retry when online"}
      </button>
    </div>
  );
}

export function OfflineFeatureTable() {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Offline</th>
            <th>Behaviour with no network</th>
            <th>Queue limit</th>
            <th>When it syncs</th>
          </tr>
        </thead>
        <tbody>
          {OFFLINE_FEATURES.map((row) => (
            <tr key={row.feature}>
              <td>
                <strong>
                  {row.icon} {row.feature}
                </strong>
              </td>
              <td>
                <StatusChip label={row.offline} tone={row.offline === "Full" ? "low" : row.offline === "Partial" ? "medium" : "high"} />
              </td>
              <td>{row.behaviour}</td>
              <td>{row.queue}</td>
              <td>{row.conflict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SyncQueue({ items, onFlush }: { items: typeof SYNC_QUEUE; onFlush: () => void }) {
  return (
    <div className="gm-ch-queue">
      <div className="gm-ch-queue-head">
        <div>
          <strong>Sync queue · {items.length} actions waiting</strong>
          <small>Every queued action keeps GPS, time and the worker who did it.</small>
        </div>
        <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={onFlush}>
          Flush queue
        </button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.action}</strong>
              <small>{item.detail}</small>
            </div>
            <span className="gm-ch-queue-meta">
              {item.size} · {item.gps} · {item.when}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OfflineTips() {
  return (
    <div className="gm-ch-tips">
      {OFFLINE_TIPS.map((tip) => (
        <div key={tip.title} className="gm-ch-tip">
          <strong>{tip.title}</strong>
          <p>{tip.body}</p>
        </div>
      ))}
    </div>
  );
}

export function DataSaverList() {
  return (
    <ul className="gm-ch-savers">
      {DATA_SAVERS.map((item) => (
        <li key={item.label}>
          <div>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </div>
          <span className="gm-chip gm-chip-lime">{item.saving}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------- 16.2 USSD ---------------- */
export function UssdPhone() {
  const [screen, setScreen] = useState<string>(USSD_ROOT);
  const [typed, setTyped] = useState("");
  const [history, setHistory] = useState<{ key: string; label: string }[]>([]);
  const current: UssdScreen = USSD_SCREENS[screen] ?? USSD_SCREENS[USSD_ROOT];

  useEffect(() => {
    if (screen === USSD_ROOT) setHistory([]);
  }, [screen]);

  function choose(key: string) {
    const option = current.options.find((item) => item.key === key);
    if (!option) return;
    setHistory((prev) => [...prev, { key, label: option.label }]);
    setScreen(option.next);
    setTyped("");
  }

  const exiting = current.options.some((option) => option.label.includes("Ondoka"));

  return (
    <div className="gm-ch-phone-wrap">
      <div className="gm-ch-phone">
        <div className="gm-ch-phone-notch" />
        <div className="gm-ch-phone-screen">
          <div className="gm-ch-phone-status">
            <span>Safaricom</span>
            <span>▮▮▮ 78%</span>
          </div>
          <p className="gm-ch-phone-code">GrowMO — {CHANNELS_CONTEXT.ussd}</p>
          <div className="gm-ch-phone-log">
            {history.map((entry, index) => (
              <div key={`${entry.key}-${index}`} className="gm-ch-phone-line user">
                &gt; {entry.key}
              </div>
            ))}
            {current.lines.map((line, index) => (
              <div key={`${current.id}-${index}`} className="gm-ch-phone-line ussd">
                {line}
              </div>
            ))}
          </div>
          <div className="gm-ch-phone-menu">
            {current.options.map((option) => (
              <button key={option.key} type="button" className="gm-ch-phone-key" onClick={() => choose(option.key)}>
                <b>{option.key}</b>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {exiting ? <p className="gm-ch-phone-foot">Session ends · no data used</p> : <p className="gm-ch-phone-foot">0. Rudi · 00. Ondoka</p>}
        </div>
      </div>
      <div className="gm-ch-phone-side">
        <div className="gm-ch-phone-input">
          <input
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Type a number, e.g. 5"
            inputMode="numeric"
            onKeyDown={(event) => {
              if (event.key === "Enter") choose(typed.trim());
            }}
          />
          <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => choose(typed.trim())} disabled={!typed.trim()}>
            <Send /> Send
          </button>
          <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setScreen(USSD_ROOT)}>
            <ArrowLeft /> Home
          </button>
        </div>
        <ul className="gm-ch-ussd-notes">
          <li>Runs on any handset — no data, no app, no smartphone.</li>
          <li>Session cost is KES 2–5, charged by the network like any USSD service.</li>
          <li>Answers in Kiswahili or English, whichever you pick.</li>
          <li>Payments started here always finish with a wallet PIN in the app or a YES reply.</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------------- 16.3 SMS ---------------- */
export function SmsConsole({ onReply, preset }: { onReply: (raw: string) => string; preset?: string }) {
  const [command, setCommand] = useState("WEATHER");
  const [log, setLog] = useState<{ code: string; reply: string; cost: string }[]>([
    { code: "BALANCE", reply: "Wallet KES 35,000 · pending KES 4,500 · budgets KES 20,000 (75% used). Free balance KES 15,000.", cost: "KES 1.00" },
  ]);

  useEffect(() => {
    if (preset) setCommand(preset);
  }, [preset]);

  return (
    <div className="gm-ch-sms-console">
      <div className="gm-ch-sms-phone">
        <div className="gm-ch-sms-phone-head">
          <span>💬 Messages · {CHANNELS_CONTEXT.smsShort}</span>
          <span className="gm-chip gm-chip-ghost">KES 1.00 per SMS</span>
        </div>
        <div className="gm-ch-sms-thread">
          {log.map((entry, index) => (
            <div key={`${entry.code}-${index}`}>
              <div className="gm-ch-sms-out">{entry.code}</div>
              <div className="gm-ch-sms-in">{entry.reply}</div>
            </div>
          ))}
        </div>
        <div className="gm-ch-sms-compose">
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value.toUpperCase())}
            placeholder="Type a command, e.g. PRICE CABBAGE"
            onKeyDown={(event) => {
              if (event.key === "Enter" && command.trim()) {
                setLog((prev) => [...prev, { code: command.trim(), reply: onReply(command.trim()), cost: "KES 1.00" }]);
                setCommand("");
              }
            }}
          />
          <button
            type="button"
            className="gm-btn gm-btn-sm gm-btn-lime"
            disabled={!command.trim()}
            onClick={() => {
              setLog((prev) => [...prev, { code: command.trim(), reply: onReply(command.trim()), cost: "KES 1.00" }]);
              setCommand("");
            }}
          >
            <Send /> Send
          </button>
        </div>
      </div>
      <div className="gm-ch-sms-commands">
        {SMS_COMMANDS.map((entry) => (
          <button key={entry.code} type="button" className="gm-ch-sms-command" onClick={() => setCommand(entry.code.includes("<") ? entry.code.split(" ")[0] + " " : entry.code)}>
            <code>{entry.code}</code>
            <strong>{entry.label}</strong>
            <small>{entry.returns}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SmsFacts() {
  return (
    <dl className="gm-ch-kv">
      {SMS_FACTS.map((row) => (
        <div key={row.k} className="gm-ch-kv-row">
          <dt>{row.k}</dt>
          <dd>{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- 16.4 WhatsApp ---------------- */
export function WhatsAppPanel({ example, onPick }: { example: { id: string; label: string; symptoms: string; diagnosis: string; confidence: string; remedy: string; cost: number; verdict: string }; onPick: (id: string) => void }) {
  return (
    <div className="gm-ch-wa">
      <div className="gm-ch-wa-chat">
        <div className="gm-ch-wa-head">🟢 GrowMO · {CHANNELS_CONTEXT.waNumber}</div>
        <div className="gm-ch-wa-body">
          <div className="gm-ch-wa-msg bot">Habari Mary! 🌱 Tuma picha ya shamba, sauti, au swali — nitakujibu chini ya dakika moja.</div>
          <div className="gm-ch-wa-msg me photo">
            <div className="gm-ch-wa-photo">📷</div>
            <small>{example.label} · sent now</small>
          </div>
          <div className="gm-ch-wa-msg me">Mahindi yangu yana wadudu kwenye kitovu, nifanye nini?</div>
          <div className="gm-ch-wa-msg bot">
            <strong>{example.diagnosis}</strong> — {example.confidence} confidence
            <br />
            I saw: {example.symptoms}.
            <br />
            <br />
            <strong>Fanya hivi:</strong>
            <br />
            • {example.remedy}
            <br />• Vaa gloves na barakoa wakati wa kunyunyiza
            <br />• Rudia ukaguzi baada ya siku 5
            <br />
            Inputs available at Githunguri Agrovet — {kes(example.cost)}.
            <small>14:23 · GrowMO AI</small>
          </div>
          <div className="gm-ch-wa-msg me">Order it please</div>
          <div className="gm-ch-wa-msg bot">
            Order placed with Githunguri Agrovet. Pay KES {example.cost.toLocaleString()} from the wallet and collect today before 6pm. 🧾
            <small>14:24 · GrowMO</small>
          </div>
        </div>
        <div className="gm-ch-wa-quick">
          {["fall", "blight", "deficiency"].map((id) => (
            <button key={id} type="button" className={`gm-ch-wa-btn ${example.id === id ? "is-on" : ""}`} onClick={() => onPick(id)}>
              {id === "fall" ? "Fall armyworm" : id === "blight" ? "Early blight" : "Nitrogen deficiency"}
            </button>
          ))}
        </div>
      </div>
      <div className="gm-ch-wa-side">
        <ul className="gm-ch-wa-features">
          {WA_FEATURES.map((item) => (
            <li key={item.feature}>
              <CircleDot />
              <div>
                <strong>{item.feature}</strong>
                <small>{item.how}</small>
              </div>
            </li>
          ))}
        </ul>
        <div className="gm-ch-tip">
          <strong>Voice notes</strong>
          <p>Send a voice note in Kiswahili — the bot transcribes it, answers in Kiswahili and keeps the transcript in the farm record.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 16.5 agents ---------------- */
export function AgentsPanel({ onCashIn, onCall }: { onCashIn: (agent: Agent) => void; onCall: (agent: Agent) => void }) {
  return (
    <div className="gm-ch-agents">
      {AGENTS.map((agent) => (
        <div key={agent.id} className="gm-ch-agent">
          <div className="gm-ch-agent-head">
            <span className="gm-ch-agent-ava">{agent.name.charAt(0)}</span>
            <div>
              <strong>{agent.name}</strong>
              <small>
                {agent.type} · {agent.town} · {agent.distance}
              </small>
            </div>
            <span className="gm-chip gm-chip-lime">{agent.rating.toFixed(1)}★</span>
          </div>
          <p className="gm-ch-agent-addr">{agent.address}</p>
          <div className="gm-ch-agent-meta">
            <span className="gm-chip gm-chip-ghost">{agent.hours}</span>
            <span className={`gm-chip ${agent.float >= 20000 ? "gm-chip-lime" : "gm-chip-gold"}`}>Float {kes(agent.float)}</span>
          </div>
          <div className="gm-ch-agent-services">
            {agent.services.map((service) => (
              <span key={service}>{service}</span>
            ))}
          </div>
          <div className="gm-ch-agent-actions">
            <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => onCashIn(agent)}>
              Cash-in at this agent
            </button>
            <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onCall(agent)}>
              Call {agent.phone}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgentProgramme() {
  return (
    <dl className="gm-ch-kv">
      {[
        { k: "Who can become an agent", v: "Agro-vet shops, M-Pesa agents, community leaders, church and co-op groups" },
        { k: "What GrowMO provides", v: "KYC, three-day training, a smartphone and the agent app" },
        { k: "Commission", v: "KES 10–50 per transaction plus KES 20 on every cash deposit" },
        { k: "Float support", v: "Same-day M-Pesa float top-up and a monthly settlement statement" },
        { k: "Training", v: "Agronomy basics, fraud prevention, customer care, USSD walkthroughs" },
        { k: "Agent locator", v: "Find the nearest agent by dialling *384*9# or opening the app" },
      ].map((row) => (
        <div key={row.k} className="gm-ch-kv-row">
          <dt>{row.k}</dt>
          <dd>{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function KvPairs({ items }: { items: { k: string; v: string }[] }) {
  return (
    <dl className="gm-ch-kv">
      {items.map((row) => (
        <div key={row.k} className="gm-ch-kv-row">
          <dt>{row.k}</dt>
          <dd>{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------- FAQ / glossary ---------------- */
export function ChannelsFaqList({ items, open, onOpen }: { items: { q: string; a: string }[]; open: number | null; onOpen: (index: number | null) => void }) {
  return (
    <div className="gm-ch-faq">
      {items.map((item, index) => (
        <div key={item.q} className={`gm-ch-faq-row ${open === index ? "is-open" : ""}`}>
          <button type="button" onClick={() => onOpen(open === index ? null : index)}>
            {item.q}
          </button>
          {open === index ? <p>{item.a}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function ChannelsGlossary({ items }: { items: { term: string; def: string }[] }) {
  return (
    <div className="gm-ch-glossary">
      {items.map((item) => (
        <div key={item.term}>
          <strong>{item.term}</strong>
          <span>{item.def}</span>
        </div>
      ))}
    </div>
  );
}

export function SmsCommandRow({ entry, onUse }: { entry: SmsCommand; onUse: (code: string) => void }) {
  return (
    <tr>
      <td>
        <code>{entry.code}</code>
      </td>
      <td>{entry.label}</td>
      <td>{entry.example}</td>
      <td>{entry.returns}</td>
      <td>
        <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => onUse(entry.example)}>
          Try it
        </button>
      </td>
    </tr>
  );
}
