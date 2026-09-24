/* ============================================================================
   PAGE 16 — MOBILE, OFFLINE, USSD & SMS CHANNELS  (/app/channels)

   Blueprint sections implemented
   16.1 PWA offline mode   16.2 USSD menu *384# (fully tappable demo)
   16.3 SMS commands       16.4 WhatsApp chatbot
   16.5 Agent network

   The page is honest about state: going "offline" queues actions, the USSD
   phone runs a real menu tree, the SMS console answers live keyword commands,
   and agent cash-in posts to the wallet ledger with a receipt.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Download,
  HelpCircle,
  LayoutGrid,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Printer,
  Share2,
  Store,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import {
  AgentCashInDialog,
  AgentRegisterDialog,
  ChannelsFaqDialog,
  InstallPwaDialog,
  OfflineActionDialog,
  SmsHelpDialog,
  UssdHelpDialog,
  WhatsAppHelpDialog,
} from "../../components/app/ChannelsModals";
import {
  AgentProgramme,
  AgentsPanel,
  ChannelsFaqList,
  ChannelsGlossary,
  ChannelsHero,
  DataSaverList,
  KvPairs,
  OfflineBanner,
  OfflineFeatureTable,
  OfflineTips,
  SmsConsole,
  SmsFacts,
  SyncQueue,
  UssdPhone,
  WhatsAppPanel,
} from "../../components/app/ChannelsWidgets";
import { DashboardMetric, DashboardSectionHeader } from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import type { Agent } from "../../data/app/channels";
import {
  CHANNELS_CONTEXT,
  CHANNELS_FAQ,
  CHANNELS_GLOSSARY,
  SMS_COMMANDS,
  SYNC_QUEUE,
  WA_EXAMPLES,
} from "../../data/app/channels";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/channels")({
  component: ChannelsPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Offline, USSD & SMS channels — GrowMO" }] }),
});

type ChannelView = "offline" | "ussd" | "sms" | "whatsapp" | "agents" | "help";

function ChannelsPage() {
  const toast = useToast();
  const [view, setView] = useState<ChannelView>("offline");
  const [online, setOnline] = useState(CHANNELS_CONTEXT.online);
  const [queue, setQueue] = useState(SYNC_QUEUE.length);
  const [menu, setMenu] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [offlineAction, setOfflineAction] = useState(false);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [agentRegister, setAgentRegister] = useState(false);
  const [ussdHelp, setUssdHelp] = useState(false);
  const [smsHelp, setSmsHelp] = useState(false);
  const [waHelp, setWaHelp] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [waTopic, setWaTopic] = useState("fall");
  const [smsPreset, setSmsPreset] = useState("WEATHER");
  const [cashInTotal, setCashInTotal] = useState(0);

  const example = WA_EXAMPLES.find((item) => item.id === waTopic) ?? WA_EXAMPLES[0];

  function smsReply(raw: string): string {
    const command = raw.toUpperCase().trim();
    if (command.startsWith("WEATHER")) return SMS_COMMANDS[0].reply;
    if (command.startsWith("TASKS")) return SMS_COMMANDS[1].reply;
    if (command.startsWith("BALANCE")) return SMS_COMMANDS[2].reply;
    if (command.startsWith("PRICE")) {
      const crop = command.replace("PRICE", "").trim() || "CABBAGE";
      return `${crop}: Marikiti 1,800–2,400/bale · Thika 1,500–2,000 (best net) · Kongowea 1,600–2,100 · trend +8% this week.`;
    }
    if (command.startsWith("PAY")) return "Confirm: Pay the amount you sent? Reply YES. You will get an M-Pesa receipt SMS and the receipt lands in the wallet ledger.";
    if (command.startsWith("CROP")) return `${command.replace("CROP", "").trim() || "CABBAGE"} Plot 1: Day 24/90, Vegetative. Next: top-dress CAN 50kg/acre in 3 days. Scout for aphids after the rain.`;
    if (command.startsWith("DONE")) return `Task ${command.replace("DONE", "").trim() || "1"} closed. Attendance logged for the crew and payroll updates on Friday.`;
    if (command === "HELP" || command === "MENU") return SMS_COMMANDS.map((entry) => entry.code).join(" · ");
    return "Command not recognised. Reply HELP for the list, or dial *384# for the full menu.";
  }

  return (
    <main className="gm-app-page gm-channels-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">System</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Mobile, offline & channels</strong>
            <span className={`gm-chip ${online ? "gm-chip-lime" : "gm-chip-gold"}`}>{online ? "Online" : "Offline"}</span>
          </div>
          <div className="gm-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((current) => !current)} aria-expanded={menu}>
              <MoreHorizontal /> Channel tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-finance-menu">
                <button type="button" onClick={() => { setInstallOpen(true); setMenu(false); }}>
                  <Download /> Install the app
                </button>
                <button type="button" onClick={() => { setOfflineAction(true); setMenu(false); }}>
                  {online ? <WifiOff /> : <Wifi />} {online ? "Simulate an offline action" : "Queue an action"}
                </button>
                <button type="button" onClick={() => { setUssdHelp(true); setMenu(false); }}>
                  <Phone /> USSD *384# help
                </button>
                <button type="button" onClick={() => { setSmsHelp(true); setMenu(false); }}>
                  <MessageSquare /> SMS command list
                </button>
                <button type="button" onClick={() => { setWaHelp(true); setMenu(false); }}>
                  <BookOpen /> WhatsApp bot help
                </button>
                <button type="button" onClick={() => { setAgentRegister(true); setMenu(false); }}>
                  <Store /> Become an agent
                </button>
                <button type="button" onClick={() => { setFaqModal(true); setMenu(false); }}>
                  <HelpCircle /> Channel questions
                </button>
                <button type="button" onClick={() => { window.print(); setMenu(false); toast.notify("Printing the channel page as it appears on screen.", "info"); }}>
                  <Printer /> Print this page
                </button>
                <button type="button" onClick={() => { toast.notify("Channel links sent to 0712 345 678 by SMS.", "success"); setMenu(false); }}>
                  <Share2 /> Send the links to my phone
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <ChannelsHero
          ctx={CHANNELS_CONTEXT}
          online={online}
          onToggleOnline={() => {
            setOnline((current) => {
              const next = !current;
              toast.notify(next ? "Back online — the queue will flush." : "Offline mode on: actions now queue on the phone.", next ? "success" : "warn");
              return next;
            });
          }}
        />

        <div className="mt-3">
          <OfflineBanner
            online={online}
            queue={queue}
            lastSync={CHANNELS_CONTEXT.lastSync}
            onSync={() => {
              setQueue(0);
              toast.notify("Queue flushed — everything is on the server.", "success");
            }}
          />
        </div>

        {/* KPI band */}
        <div className="row g-3 mt-3">
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={WifiOff} label="Offline in 30 days" value={`${CHANNELS_CONTEXT.offlineHours30d} h`} note={`${queue} actions currently queued`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={Phone} label="USSD sessions" value={String(CHANNELS_CONTEXT.ussdSessions30d)} note="Most used: weather, then tasks" />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={MessageSquare} label="SMS commands" value={String(CHANNELS_CONTEXT.smsCommands30d)} note="BALANCE and PRICE lead the list" />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={Store} label="Agent cash-in" value={kes(cashInTotal)} note={`${CHANNELS_CONTEXT.agentsNearby} agents within 10 km`} />
          </div>
        </div>

        <div className="mt-4">
          <PlannerSubtabs
            label="Channel sections"
            value={view}
            onChange={(next) => setView(next)}
            items={[
              { id: "offline", label: "Offline & PWA", icon: <LayoutGrid />, count: queue },
              { id: "ussd", label: "USSD *384#", icon: <Phone /> },
              { id: "sms", label: "SMS 20550", icon: <MessageSquare /> },
              { id: "whatsapp", label: "WhatsApp", icon: <BookOpen /> },
              { id: "agents", label: "Agents", icon: <Store />, count: CHANNELS_CONTEXT.agentsNearby },
              { id: "help", label: "Help" },
            ]}
          />
        </div>

        {/* ---------------- 16.1 offline ---------------- */}
        {view === "offline" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="16.1"
              title="What still works with no network"
              subtitle="Tasks, logs, photos and records carry on; money and the AI wait for a live connection."
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setOfflineAction(true)}>
                  {online ? "Simulate an offline action" : "Queue an action"}
                </button>
              }
            />
            <OfflineFeatureTable />
            <div className="row g-3 mt-3">
              <div className="col-xl-6">
                <SyncQueue
                  items={SYNC_QUEUE.slice(0, queue)}
                  onFlush={() => {
                    if (!online) {
                      toast.notify("Still offline — the queue flushes when data returns.", "warn");
                      return;
                    }
                    setQueue(0);
                    toast.notify("Queue flushed cleanly.", "success");
                  }}
                />
              </div>
              <div className="col-xl-6">
                <h3 className="gm-h-section">Saving data on purpose</h3>
                <DataSaverList />
              </div>
            </div>
            <OfflineTips />
          </div>
        ) : null}

        {/* ---------------- 16.2 USSD ---------------- */}
        {view === "ussd" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="16.2"
              title="USSD menu — *384#"
              subtitle="Tap through the real menu tree below. On a phone it is the same eight options, no data required."
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setUssdHelp(true)}>
                  How it works
                </button>
              }
            />
            <UssdPhone />
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <KvPairs
                  items={[
                    { k: "Dial", v: "*384# from any Safaricom, Airtel or Telkom line" },
                    { k: "Cost", v: "KES 2–5 per session, charged by the network" },
                    { k: "Languages", v: "Kiswahili and English on every screen" },
                    { k: "Payments", v: "Started in USSD, finished with a wallet PIN or YES reply" },
                  ]}
                />
              </div>
              <div className="col-lg-6">
                <div className="gm-ch-tip">
                  <strong>Built for the kabambe</strong>
                  <p>
                    The menu uses short lines and single digits because most feature-phone sessions happen in sunlight with
                    one hand. If a session times out, dialling again resumes at the same place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 16.3 SMS ---------------- */}
        {view === "sms" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="16.3"
              title="SMS commands to 20550"
              subtitle="Type a real command below — the console replies exactly as the live short code does."
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setSmsHelp(true)}>
                  Full command list
                </button>
              }
            />
            <SmsConsole onReply={smsReply} preset={smsPreset} />
            <div className="row g-3 mt-3">
              <div className="col-lg-7">
                <h3 className="gm-h-section">How the short code behaves</h3>
                <SmsFacts />
              </div>
              <div className="col-lg-5">
                <div className="gm-ch-tip">
                  <strong>Fallback that keeps workers paid on time</strong>
                  <p>
                    If the app cannot reach the server for two hours, task reminders switch to SMS automatically so nobody
                    stands at the gate waiting for a message that never comes.
                  </p>
                </div>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-block mt-2"
                  onClick={() => {
                    setSmsPreset("BALANCE");
                    toast.notify("BALANCE queued in the SMS console below.", "info");
                  }}
                >
                  Send BALANCE now
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 16.4 WhatsApp ---------------- */}
        {view === "whatsapp" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="16.4"
              title="WhatsApp chatbot"
              subtitle={`Add ${CHANNELS_CONTEXT.waNumber} and send a photo, a voice note or a question.`}
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setWaHelp(true)}>
                  What it can do
                </button>
              }
            />
            <WhatsAppPanel example={example} onPick={setWaTopic} />
          </div>
        ) : null}

        {/* ---------------- 16.5 agents ---------------- */}
        {view === "agents" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="16.5"
              title="Agent network"
              subtitle="Cash in, cash out, get help with the app — from people you already know in the market."
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => setAgentRegister(true)}>
                  Become an agent
                </button>
              }
            />
            <AgentsPanel
              onCashIn={setActiveAgent}
              onCall={(agent) => toast.notify(`Calling ${agent.name} on ${agent.phone}…`, "info")}
            />
            <h3 className="gm-h-section mt-4">The agent programme</h3>
            <AgentProgramme />
            <div className="gm-ch-tip mt-2">
              <strong>Agents keep the cash economy working</strong>
              <p>
                A grower with no smartphone can still deposit cash, check a balance and collect a payout through an agent,
                and every action lands in the same farm record.
              </p>
            </div>
          </div>
        ) : null}

        {/* ---------------- help ---------------- */}
        {view === "help" ? (
          <div className="mt-3">
            <div className="gm-card p-4">
              <DashboardSectionHeader
                eyebrow="Help"
                title="Channel questions"
                subtitle="USSD costs, offline behaviour, Kiswahili support and what agents charge."
                action={
                  <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setFaqModal(true)}>
                    Open in a dialog
                  </button>
                }
              />
              <ChannelsFaqList items={CHANNELS_FAQ} open={faqOpen} onOpen={setFaqOpen} />
              <h3 className="gm-h-section mt-3">Glossary</h3>
              <ChannelsGlossary items={CHANNELS_GLOSSARY} />
            </div>
          </div>
        ) : null}

        <div className="gm-ch-footer-note">
          <span>Channel usage this month: {CHANNELS_CONTEXT.ussdSessions30d} USSD sessions · {CHANNELS_CONTEXT.smsCommands30d} SMS commands · {CHANNELS_CONTEXT.waMessages30d} WhatsApp messages · {CHANNELS_CONTEXT.offlineHours30d} hours offline</span>
          <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => { setSmsPreset("WEATHER"); setView("sms"); }}>
            Try the SMS console
          </button>
        </div>
      </div>

      {/* ---------------- modals ---------------- */}
      <InstallPwaDialog
        open={installOpen}
        onClose={() => setInstallOpen(false)}
        onInstalled={() => toast.notify("GrowMO installed — offline mode is ready.", "success")}
      />

      <OfflineActionDialog
        open={offlineAction}
        online={online}
        onClose={() => setOfflineAction(false)}
        onQueued={(action, detail) => {
          if (online) {
            toast.notify(`${action} posted live · ${detail}.`, "success");
            return;
          }
          setQueue((current) => current + 1);
          toast.notify(`${action} queued on the phone · ${detail}.`, "warn");
        }}
      />

      <AgentCashInDialog
        open={Boolean(activeAgent)}
        agent={activeAgent}
        onClose={() => setActiveAgent(null)}
        onDone={(agent, amount, receipt) => {
          setCashInTotal((current) => current + amount);
          toast.notify(`${kes(amount)} cash-in at ${agent.name} · ${receipt}.`, "success");
        }}
      />

      <AgentRegisterDialog
        open={agentRegister}
        onClose={() => setAgentRegister(false)}
        onDone={(receipt) => toast.notify(`Agent application received · ${receipt}.`, "success")}
      />

      <UssdHelpDialog open={ussdHelp} onClose={() => setUssdHelp(false)} />

      <SmsHelpDialog
        open={smsHelp}
        onClose={() => setSmsHelp(false)}
        onUse={(commandExample) => {
          setSmsPreset(commandExample);
          setSmsHelp(false);
          setView("sms");
          toast.notify(`${commandExample} loaded into the SMS console.`, "info");
        }}
      />

      <WhatsAppHelpDialog
        open={waHelp}
        onClose={() => setWaHelp(false)}
        onCall={() => {
          setWaHelp(false);
          setView("whatsapp");
          toast.notify("Scrolled to the WhatsApp chat demo.", "info");
        }}
      />

      <ChannelsFaqDialog open={faqModal} onClose={() => setFaqModal(false)} faqs={CHANNELS_FAQ} glossary={CHANNELS_GLOSSARY} />
    </main>
  );
}
