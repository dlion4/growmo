/* ============================================================================
   PAGE 16 — CHANNELS widgets (offline, USSD, SMS, WhatsApp, agents)
   ========================================================================== */
import {
  ArrowLeft,
  BookOpen,
  Camera,
  CheckCheck,
  CircleDot,
  ClipboardCheck,
  CloudSun,
  Download,
  Languages,
  MessageSquare,
  Mic,
  Phone,
  Send,
  Sprout,
  Store,
  TrendingUp,
  Wallet,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent, SmsCommand, UssdScreen } from "../../../data/app/channels";
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
} from "../../../data/app/channels";
import { kes } from "../../../data/site";
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
    <section className="gm-channel-hero-card">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
        <div style={{ flex: "1 1 400px", position: "relative", zIndex: 1 }}>
          <span className={`gm-chip ${online ? "gm-chip-lime" : "gm-chip-gold"}`}>
            {online ? <Wifi /> : <WifiOff />} {online ? "Online · synced" : "Offline mode · changes queued"}
          </span>
          <h1 className="font-display mt-2">Every channel, one farm record</h1>
          <p className="mt-2" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Smartphone app with a real offline mode, USSD on any kabambe, SMS to 20550, a WhatsApp bot that reads photos,
            and agents in Githunguri, Ikinu and beyond for anyone who prefers to talk to a person.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center" style={{ position: "relative", zIndex: 1 }}>
          <button type="button" className="gm-btn gm-btn-outline" style={{ borderColor: "rgba(255, 255, 255, 0.5)", color: "#0b120d", backgroundColor: "white" }} onClick={onToggleOnline}>
            {online ? "Simulate losing network" : "Reconnect the phone"}
          </button>
          <span className="gm-chip" style={{ background: "rgba(255, 255, 255, 0.2)", color: "white", border: "1px solid rgba(255, 255, 255, 0.3)" }}>{ctx.device}</span>
        </div>
      </div>
      <div className="gm-channel-icon-grid">
        <div className="gm-channel-icon-card">
          <Phone />
          <h4>USSD Menu</h4>
          <p>{ctx.ussd}</p>
        </div>
        <div className="gm-channel-icon-card">
          <MessageSquare />
          <h4>SMS</h4>
          <p>{ctx.smsShort}</p>
        </div>
        <div className="gm-channel-icon-card">
          <BookOpen />
          <h4>WhatsApp</h4>
          <p>{ctx.waNumber}</p>
        </div>
        <div className="gm-channel-icon-card">
          <WifiOff />
          <h4>Offline Time</h4>
          <p>{ctx.offlineHours30d} h / 30d</p>
        </div>
        <div className="gm-channel-icon-card">
          <Store />
          <h4>Local Agents</h4>
          <p>{ctx.agentsNearby} nearby</p>
        </div>
        <div className="gm-channel-icon-card">
          <Download />
          <h4>Data Usage</h4>
          <p>{ctx.dataUsed}</p>
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
      <div className="gm-ussd-phone-display">
        <div className="gm-ch-phone-notch" />
        <div className="gm-ussd-screen">
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
    <div className="gm-sms-console">
      <div className="gm-ch-sms-phone">
        <div className="gm-ch-sms-phone-head">
          <span>💬 Messages · {CHANNELS_CONTEXT.smsShort}</span>
          <span className="gm-chip gm-chip-ghost">KES 1.00 per SMS</span>
        </div>
        <div className="gm-ch-sms-thread">
          {log.map((entry, index) => (
            <div key={`${entry.code}-${index}`}>
              <div className="gm-sms-message">{entry.code}</div>
              <div className="gm-sms-message incoming">
                {entry.reply}
                <div className="gm-sms-timestamp">{entry.cost} · {new Date().toLocaleTimeString()}</div>
              </div>
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
/* Feature icon map — keeps WA_FEATURES data-driven without touching the data file. */
const WA_FEATURE_ICONS: Record<string, typeof Camera> = {
  "Photo diagnosis": Camera,
  "Voice notes": Mic,
  "Market prices": TrendingUp,
  "Weather": CloudSun,
  "Tasks": ClipboardCheck,
  "Payments": Wallet,
  "Order inputs": Store,
  "Language": Languages,
};

export function WhatsAppPanel({ example, onPick }: { example: { id: string; label: string; symptoms: string; diagnosis: string; confidence: string; remedy: string; cost: number; verdict: string }; onPick: (id: string) => void }) {
  return (
    <div className="gm-wa2">
      {/* ------------- phone chat panel ------------- */}
      <div className="gm-wa2-phone">
        <div className="gm-wa2-topbar">
          <span className="gm-wa2-avatar" aria-hidden="true">
            <Sprout width={18} height={18} />
          </span>
          <span className="gm-wa2-topbar-text">
            <strong>GrowMO</strong>
            <small>online · replies in under a minute</small>
          </span>
          <span className="gm-wa2-badge">{CHANNELS_CONTEXT.waNumber}</span>
        </div>

        <div className="gm-wa2-day">Today · 14:23</div>

        <div className="gm-wa2-thread">
          <div className="gm-wa2-bubble in">
            Habari Mary! 🌱 Tuma picha ya shamba, sauti, au swali — nitakujibu chini ya dakika moja.
            <span className="gm-wa2-meta">14:23</span>
          </div>

          <div className="gm-wa2-bubble out is-photo">
            <span className="gm-wa2-photo">
              <Camera width={26} height={26} />
              <i>Maize leaf · Lab</i>
            </span>
            <small>{example.label} · sent now</small>
          </div>

          <div className="gm-wa2-bubble out">
            Mahindi yangu yana wadudu kwenye kitovu, nifanye nini?
            <span className="gm-wa2-meta">
              14:23 <CheckCheck width={13} height={13} />
            </span>
          </div>

          <div className="gm-wa2-bubble in is-diagnosis">
            <span className="gm-wa2-diag-head">
              <Camera width={15} height={15} />
              <strong>{example.diagnosis}</strong>
              <em>{example.confidence} confidence</em>
            </span>
            <span className="gm-wa2-diag-see">I saw: {example.symptoms}.</span>
            <span className="gm-wa2-diag-steps">
              <b>Fanya hivi</b>
              <i>1. {example.remedy}</i>
              <i>2. Vaa gloves na barakoa wakati wa kunyunyiza</i>
              <i>3. Rudia ukaguzi baada ya siku 5</i>
            </span>
            <span className="gm-wa2-diag-input">
              Inputs at Githunguri Agrovet — <b>{kes(example.cost)}</b>
            </span>
            <span className="gm-wa2-meta">14:23 · GrowMO AI</span>
          </div>

          <div className="gm-wa2-bubble out">
            Order it please
            <span className="gm-wa2-meta">
              14:24 <CheckCheck width={13} height={13} />
            </span>
          </div>

          <div className="gm-wa2-bubble in is-order">
            <span className="gm-wa2-order-row">
              <Store width={16} height={16} />
              <span>
                <strong>Order placed · Githunguri Agrovet</strong>
                <small>
                  Pay {kes(example.cost)} from the wallet · collect today before 6pm
                </small>
              </span>
              <CheckCheck width={16} height={16} className="gm-wa2-order-tick" />
            </span>
            <span className="gm-wa2-meta">14:24 · GrowMO</span>
          </div>
        </div>

        <div className="gm-wa2-quick">
          <span className="gm-wa2-quick-label">Try a scenario</span>
          <div className="gm-wa2-quick-row">
            {["fall", "blight", "deficiency"].map((id) => (
              <button
                key={id}
                type="button"
                className={`gm-wa2-chip ${example.id === id ? "is-on" : ""}`}
                onClick={() => onPick(id)}
              >
                {id === "fall" ? "Fall armyworm" : id === "blight" ? "Early blight" : "Nitrogen deficiency"}
              </button>
            ))}
          </div>
        </div>

        <div className="gm-wa2-compose">
          <span className="gm-wa2-compose-field">Type a message…</span>
          <span className="gm-wa2-compose-mic" aria-hidden="true">
            <Mic width={17} height={17} />
          </span>
          <span className="gm-wa2-compose-send" aria-hidden="true">
            <Send width={16} height={16} />
          </span>
        </div>
      </div>

      {/* ------------- capability grid ------------- */}
      <div className="gm-wa2-side">
        <div className="gm-wa2-side-head">
          <h3>What the bot can do</h3>
          <span className="gm-chip gm-chip-lime">8 skills</span>
        </div>
        <ul className="gm-wa2-skills">
          {WA_FEATURES.map((item, index) => {
            const Icon = WA_FEATURE_ICONS[item.feature] ?? CircleDot;
            return (
              <li key={item.feature} className="gm-wa2-skill">
                <span className="gm-wa2-skill-icon" style={{ animationDelay: `${index * 0.06}s` }}>
                  <Icon width={17} height={17} />
                </span>
                <span className="gm-wa2-skill-text">
                  <strong>{item.feature}</strong>
                  <small>{item.how}</small>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="gm-wa2-voice">
          <span className="gm-wa2-voice-icon">
            <Mic width={18} height={18} />
          </span>
          <span className="gm-wa2-voice-text">
            <strong>Voice notes in Kiswahili</strong>
            <small>
              Send a voice note — the bot transcribes it, answers in Kiswahili and keeps the transcript in the farm record.
            </small>
          </span>
          <span className="gm-wa2-wave" aria-hidden="true">
            {[9, 16, 7, 13, 19, 8, 15, 6, 12, 18, 7, 10].map((h, i) => (
              <i key={i} style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }} />
            ))}
          </span>
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
