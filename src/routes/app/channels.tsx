/* ============================================================================
   PAGE 16 — MOBILE, OFFLINE, USSD & SMS CHANNELS  (/app/channels)

   Ensure every farmer can access GrowMO regardless of device or connectivity.
   16.1 PWA Offline Mode    16.2 USSD Menu (*384#)
   16.3 SMS Commands         16.4 WhatsApp Chatbot
   16.5 Agent Network
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  CloudOff,
  Copy,
  Database,
  Download,
  Edit3,
  Eye,
  FileText,
  Globe,
  Layers,
  Lock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Signal,
  Smartphone,
  Star,
  Tablet,
  TrendingUp,
  Upload,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AddAgentWizard,
  AgentDrawer,
  AgentLocatorDialog,
  BulkSmsDialog,
  ChannelAnalyticsDialog,
  ChannelHealthDialog,
  ChannelLanguageDialog,
  ChannelPriorityDialog,
  ConfirmChannelDialog,
  ConnectivityTestDialog,
  EditAgentDialog,
  OfflineFeatureDialog,
  OfflineTestDialog,
  SmsGatewayDialog,
  SmsTestDialog,
  StorageManagerDialog,
  SyncQueueDrawer,
  SyncSettingsDialog,
  UssdConfigDialog,
  UssdSimulatorDialog,
  WhatsAppConfigDialog,
  WhatsAppTemplateDialog,
} from "../../components/app/ChannelsModals";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AGENTS,
  AGENT_NETWORK_STATS,
  OFFLINE_FEATURES,
  OFFLINE_STORAGE,
  SMS_COMMANDS,
  SMS_STATS,
  SYNC_QUEUE,
  USSD_CONFIG,
  USSD_MENU,
  WHATSAPP_CONFIG,
  WHATSAPP_TEMPLATES,
  type Agent,
  type ChannelsView,
  type OfflineFeature,
  type SmsCommand,
  type SyncQueueItem,
  type WhatsAppTemplate,
} from "../../data/app/channels";

export const Route = createFileRoute("/app/channels")({
  component: ChannelsPage,
});

type ModalId =
  | "offline-feature"
  | "sync-settings"
  | "storage-manager"
  | "ussd-simulator"
  | "ussd-config"
  | "sms-test"
  | "sms-gateway"
  | "whatsapp-config"
  | "whatsapp-template"
  | "agent-add"
  | "agent-edit"
  | "agent-locator"
  | "channel-health"
  | "connectivity-test"
  | "offline-test"
  | "channel-analytics"
  | "channel-language"
  | "channel-priority"
  | "bulk-sms"
  | "agent-deactivate"
  | null;

function ChannelsPage() {
  const [view, setView] = useState<ChannelsView>("offline");
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);

  /* State */
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(SYNC_QUEUE);
  const [syncDrawerOpen, setSyncDrawerOpen] = useState(false);

  /* Selection */
  const [selectedFeature, setSelectedFeature] = useState<OfflineFeature | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<SmsCommand | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agentDrawerOpen, setAgentDrawerOpen] = useState(false);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);

  /* Agent search/filter */
  const [agentQuery, setAgentQuery] = useState("");
  const [agentType, setAgentType] = useState("all");
  const [agentCounty, setAgentCounty] = useState("all");
  const [agentPage, setAgentPage] = useState(1);
  const filteredAgents = agents.filter(
    (a) =>
      `${a.name} ${a.location} ${a.county}`.toLowerCase().includes(agentQuery.toLowerCase()) &&
      (agentType === "all" || a.type === agentType) &&
      (agentCounty === "all" || a.county === agentCounty),
  );
  const agentPerPage = 6;
  const agentTotalPages = Math.max(1, Math.ceil(filteredAgents.length / agentPerPage));
  const agentRows = filteredAgents.slice(
    (agentPage - 1) * agentPerPage,
    agentPage * agentPerPage,
  );

  const handleSaveAgent = (agent: Agent) => {
    setAgents((a) =>
      a.some((x) => x.id === agent.id)
        ? a.map((x) => (x.id === agent.id ? agent : x))
        : [agent, ...a],
    );
  };

  const handleSyncNow = () => {
    setSyncQueue([]);
    setSyncDrawerOpen(false);
  };

  const navItems = [
    { id: "offline" as const, label: "Offline / PWA", icon: <Wifi />, count: OFFLINE_FEATURES.length },
    { id: "ussd" as const, label: "USSD", icon: <Signal />, count: USSD_MENU.length },
    { id: "sms" as const, label: "SMS", icon: <MessageCircle />, count: SMS_COMMANDS.length },
    { id: "whatsapp" as const, label: "WhatsApp", icon: <Phone />, count: WHATSAPP_TEMPLATES.length },
    { id: "agents" as const, label: "Agent Network", icon: <Users />, count: agents.length },
  ];

  return (
    <main className="gm-app-page gm-channels-page">
      <div className="gm-container py-4">
        {/* Breadcrumb */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              <ArrowRight className="rotate-180" /> Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">System</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Channels</strong>
          </div>
          <div className="gm-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((c) => !c)} aria-expanded={menu}>
              <MoreHorizontal /> More channel tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-channels-menu">
                <button type="button" onClick={() => { openModal("channel-health"); setMenu(false); }}><Signal /> Channel health</button>
                <button type="button" onClick={() => { openModal("connectivity-test"); setMenu(false); }}><Wifi /> Connectivity test</button>
                <button type="button" onClick={() => { openModal("offline-test"); setMenu(false); }}><CloudOff /> Test offline mode</button>
                <button type="button" onClick={() => { openModal("channel-analytics"); setMenu(false); }}><BarChart3 /> Usage analytics</button>
                <button type="button" onClick={() => { openModal("channel-language"); setMenu(false); }}><Globe /> Language settings</button>
                <button type="button" onClick={() => { openModal("channel-priority"); setMenu(false); }}><Layers /> Notification priority</button>
                <button type="button" onClick={() => { openModal("bulk-sms"); setMenu(false); }}><Send /> Bulk SMS</button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Overview stats */}
        <div className="gm-card p-3 mb-3">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
            <div>
              <span className="gm-eyebrow">Multi-channel access</span>
              <h2 className="font-display mb-1">Reach every farmer, everywhere</h2>
              <p className="text-muted mb-0">PWA, USSD, SMS, WhatsApp and 2,100+ agents across 42 counties.</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => setSyncDrawerOpen(true)}><RefreshCw /> Sync queue {syncQueue.length > 0 ? `(${syncQueue.length})` : ""}</button>
              <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => openModal("channel-health")}><Signal /> Channel health</button>
            </div>
          </div>
          <div className="gm-stat-grid mt-3">
            <DashboardMetric icon={Wifi} label="PWA users" value="45,200" note="Smartphone app" />
            <DashboardMetric icon={Signal} label="USSD users" value="12,400" note="*384# shortcode" />
            <DashboardMetric icon={MessageCircle} label="SMS users" value="8,200" note="20550 shortcode" />
            <DashboardMetric icon={Users} label="Agents" value="2,100" note="42 counties" />
          </div>
        </div>

        {/* Tabs */}
        <div className="gm-card p-2">
          <PlannerSubtabs value={view} items={navItems} onChange={setView} label="Channel sections" />
        </div>

        <Reveal className="mt-4">
          {view === "offline" ? (
            <OfflineView features={OFFLINE_FEATURES} storage={OFFLINE_STORAGE} onFeature={(f) => { setSelectedFeature(f); openModal("offline-feature"); }} onSyncSettings={() => openModal("sync-settings")} onStorage={() => openModal("storage-manager")} onTest={() => openModal("offline-test")} onSyncNow={() => setSyncDrawerOpen(true)} />
          ) : null}
          {view === "ussd" ? (
            <UssdView menu={USSD_MENU} config={USSD_CONFIG} onSimulator={() => openModal("ussd-simulator")} onConfig={() => openModal("ussd-config")} />
          ) : null}
          {view === "sms" ? (
            <SmsView commands={SMS_COMMANDS} stats={SMS_STATS} onTest={(cmd) => { setSelectedCommand(cmd); openModal("sms-test"); }} onGateway={() => openModal("sms-gateway")} onBulk={() => openModal("bulk-sms")} />
          ) : null}
          {view === "whatsapp" ? (
            <WhatsAppView templates={WHATSAPP_TEMPLATES} config={WHATSAPP_CONFIG} onTemplate={(t) => { setSelectedTemplate(t); openModal("whatsapp-template"); }} onConfig={() => openModal("whatsapp-config")} />
          ) : null}
          {view === "agents" ? (
            <AgentsView agents={agentRows} allAgents={agents} stats={AGENT_NETWORK_STATS} totalFiltered={filteredAgents.length} query={agentQuery} typeFilter={agentType} countyFilter={agentCounty} page={agentPage} totalPages={agentTotalPages} perPage={agentPerPage} onQuery={(q) => { setAgentQuery(q); setAgentPage(1); }} onType={(t) => { setAgentType(t); setAgentPage(1); }} onCounty={(c) => { setAgentCounty(c); setAgentPage(1); }} onPage={setAgentPage} onAdd={() => openModal("agent-add")} onAgent={(a) => { setSelectedAgent(a); setAgentDrawerOpen(true); }} onEdit={(a) => { setSelectedAgent(a); openModal("agent-edit"); }} onLocator={() => openModal("agent-locator")} />
          ) : null}
        </Reveal>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <OfflineFeatureDialog open={modal === "offline-feature"} feature={selectedFeature} onClose={closeModal} />
      <SyncSettingsDialog open={modal === "sync-settings"} onClose={closeModal} />
      <StorageManagerDialog open={modal === "storage-manager"} onClose={closeModal} />
      <UssdSimulatorDialog open={modal === "ussd-simulator"} menu={USSD_MENU} onClose={closeModal} />
      <UssdConfigDialog open={modal === "ussd-config"} onClose={closeModal} />
      <SmsTestDialog open={modal === "sms-test"} command={selectedCommand} onClose={closeModal} />
      <SmsGatewayDialog open={modal === "sms-gateway"} onClose={closeModal} />
      <WhatsAppConfigDialog open={modal === "whatsapp-config"} onClose={closeModal} />
      <WhatsAppTemplateDialog open={modal === "whatsapp-template"} template={selectedTemplate} onClose={closeModal} />
      <AddAgentWizard open={modal === "agent-add"} onClose={closeModal} onSave={handleSaveAgent} />
      <EditAgentDialog open={modal === "agent-edit"} agent={selectedAgent} onClose={closeModal} onSave={handleSaveAgent} />
      <AgentLocatorDialog open={modal === "agent-locator"} agents={agents} onClose={closeModal} />
      <ChannelHealthDialog open={modal === "channel-health"} onClose={closeModal} />
      <ConnectivityTestDialog open={modal === "connectivity-test"} onClose={closeModal} />
      <OfflineTestDialog open={modal === "offline-test"} onClose={closeModal} />
      <ChannelAnalyticsDialog open={modal === "channel-analytics"} onClose={closeModal} />
      <ChannelLanguageDialog open={modal === "channel-language"} onClose={closeModal} />
      <ChannelPriorityDialog open={modal === "channel-priority"} onClose={closeModal} />
      <BulkSmsDialog open={modal === "bulk-sms"} onClose={closeModal} />
      <ConfirmChannelDialog open={modal === "agent-deactivate"} title="Deactivate agent?" body={`Deactivate ${selectedAgent?.name}? They will lose access to the agent app.`} confirmLabel="Deactivate" destructive onClose={closeModal} onConfirm={() => {}} />

      {/* Drawers */}
      <AgentDrawer open={agentDrawerOpen} agent={selectedAgent} onClose={() => setAgentDrawerOpen(false)} onEdit={() => { setAgentDrawerOpen(false); openModal("agent-edit"); }} />
      <SyncQueueDrawer open={syncDrawerOpen} queue={syncQueue} onClose={() => setSyncDrawerOpen(false)} onSync={handleSyncNow} />
    </main>
  );
}

/* ========================================================================
   SUB-VIEWS
   ======================================================================== */

/* ── 16.1 PWA Offline Mode ──────────────────────────────────────────────── */
function OfflineView({ features, storage, onFeature, onSyncSettings, onStorage, onTest, onSyncNow }: {
  features: OfflineFeature[]; storage: typeof OFFLINE_STORAGE;
  onFeature: (f: OfflineFeature) => void; onSyncSettings: () => void; onStorage: () => void; onTest: () => void; onSyncNow: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader eyebrow="16.1 · PWA Offline Mode" title="Farm without internet" subtitle="Your most important data is cached locally. Work offline, sync when connected." action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onStorage}><Database /> Storage</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onSyncNow}><RefreshCw /> Sync now</button></div>} />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Database} label="Storage used" value={storage.totalUsed} note={`of ${storage.totalAvailable}`} />
        <DashboardMetric icon={CloudOff} label="Pending changes" value={`${storage.pendingChanges}`} note="Waiting to sync" />
        <DashboardMetric icon={CheckCircle2} label="Sync status" value={storage.syncStatus} note={storage.lastFullSync} />
        <DashboardMetric icon={Wifi} label="Photos cached" value={storage.photosSize} note="Uploaded when online" />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div><span className="gm-eyebrow">Offline capabilities</span><h3 className="font-display mb-1">What works without internet</h3></div>
          <div className="d-flex gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onSyncSettings}><Settings2 /> Sync settings</button><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onTest}><CloudOff /> Test offline</button></div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Feature</th><th>Offline</th><th>Sync behavior</th><th>Last synced</th><th>Size</th><th /></tr></thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.id}>
                  <td><strong>{f.feature}</strong><small className="d-block text-muted">{f.category}</small></td>
                  <td><StatusChip label={f.offlineCapability} tone={f.offlineCapability === "Full" ? "low" : f.offlineCapability === "Cached" ? "medium" : f.offlineCapability === "Partial" ? "medium" : "high"} /></td>
                  <td><small>{f.syncBehavior}</small></td>
                  <td><small>{f.lastSynced}</small></td>
                  <td><small>{f.storageUsed}</small></td>
                  <td><button type="button" className="gm-icon-btn" onClick={() => onFeature(f)}><Eye /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── 16.2 USSD Menu ─────────────────────────────────────────────────────── */
function UssdView({ menu, config, onSimulator, onConfig }: {
  menu: typeof USSD_MENU; config: typeof USSD_CONFIG; onSimulator: () => void; onConfig: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <DashboardSectionHeader eyebrow="16.2 · USSD Menu" title="Access from any phone" subtitle={`Dial ${config.shortcode} from any Safaricom, Airtel or Telkom phone — no internet needed.`} action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onConfig}><Settings2 /> Config</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onSimulator}><Smartphone /> Try simulator</button></div>} />
      <div className="row g-3 mt-3">
        <div className="col-xl-5">
          <div className="gm-card p-4 h-100 text-center">
            <span className="gm-eyebrow">USSD shortcode</span>
            <h2 className="font-display" style={{ fontSize: "3rem", letterSpacing: "0.1em" }}>{config.shortcode}</h2>
            <p className="text-muted">Dial from any phone in Kenya</p>
            <button type="button" className="gm-btn gm-btn-outline w-100" onClick={() => setCopied(true)}>{copied ? <><CheckCircle2 /> Copied!</> : <><Copy /> Copy shortcode</>}</button>
            <div className="gm-stat-grid mt-3">
              <DashboardMetric icon={Users} label="Monthly users" value={config.monthlyUsers.toLocaleString()} note="Growing 15%/month" />
              <DashboardMetric icon={Clock} label="Avg session" value={config.avgSessionDuration} note={`${config.completionRate}% completion`} />
            </div>
          </div>
        </div>
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Menu structure</span>
            <h3 className="font-display mb-1">8 main options</h3>
            <div className="gm-table-wrap mt-2">
              <table className="gm-table">
                <thead><tr><th>Code</th><th>English</th><th>Kiswahili</th><th>Description</th></tr></thead>
                <tbody>
                  {menu.map((item) => (
                    <tr key={item.id}>
                      <td><strong className="font-display">{item.code}</strong></td>
                      <td><strong>{item.label}</strong></td>
                      <td><small>{item.labelSw}</small></td>
                      <td><small>{item.description}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="gm-card p-4 mt-3">
        <span className="gm-eyebrow">USSD flow example</span>
        <h3 className="font-display mb-2">Weather query flow</h3>
        <div className="gm-ussd-card">
          <div className="gm-ussd-code">
            <strong>GrowMO — *384#</strong>
            <div className="gm-ussd-divider" />
            <div>1. Angalia hali ya hewa (Weather)</div>
            <div>2. Shughuli za leo (Today's tasks)</div>
            <div>3. Pesa zangu (Wallet balance)</div>
            <div>...</div>
            <div className="gm-ussd-divider" />
            <div><strong>&gt; Select: 1</strong></div>
            <div className="gm-ussd-divider" />
            <div>Kiambu: 24°C, Mvua 70%.</div>
            <div>Cabbage: Rukia fungicide baada ya mvua.</div>
            <div>Jengo la siku 3: J3 ☁️22°C, J4 🌧️21°C, J5 ⛅23°C</div>
            <div className="gm-ussd-divider" />
            <div>0. Rudi | 00. Ondoka</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 16.3 SMS Commands ──────────────────────────────────────────────────── */
function SmsView({ commands, stats, onTest, onGateway, onBulk }: {
  commands: SmsCommand[]; stats: typeof SMS_STATS;
  onTest: (cmd: SmsCommand) => void; onGateway: () => void; onBulk: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader eyebrow="16.3 · SMS Commands" title="Text your farm" subtitle={`Send commands to ${stats.shortcode} — instant responses, no internet needed.`} action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onGateway}><Settings2 /> Gateway config</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onBulk}><Send /> Bulk SMS</button></div>} />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={MessageCircle} label="SMS sent (month)" value={stats.monthlySmsSent.toLocaleString()} note={`${stats.monthlySmsReceived.toLocaleString()} received`} />
        <DashboardMetric icon={CheckCircle2} label="Delivery rate" value={`${stats.deliveryRate}%`} note="Africa's Talking gateway" />
        <DashboardMetric icon={Clock} label="Avg response" value={stats.avgResponseTime} note="Command to reply" />
        <DashboardMetric icon={Users} label="Active subscribers" value={stats.activeSubscribers.toLocaleString()} note={`Shortcode: ${stats.shortcode}`} />
      </div>
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Available commands</span>
        <h3 className="font-display mb-1">SMS to {stats.shortcode}</h3>
        <div className="gm-table-wrap mt-2">
          <table className="gm-table">
            <thead><tr><th>Command</th><th>Action</th><th>Example response</th><th>Status</th><th /></tr></thead>
            <tbody>
              {commands.map((cmd) => (
                <tr key={cmd.id}>
                  <td><code className="gm-code-chip">{cmd.command}</code></td>
                  <td><strong>{cmd.action}</strong></td>
                  <td><small>{cmd.response.split("\n")[0]}</small></td>
                  <td><StatusChip label={cmd.active ? "Active" : "Inactive"} tone={cmd.active ? "low" : "neutral"} /></td>
                  <td><button type="button" className="gm-icon-btn" onClick={() => onTest(cmd)}><Send /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">How it works</span>
            <h3 className="font-display mb-2">Simple text commands</h3>
            <div className="gm-check-row"><MessageCircle /><span><strong>1. Send SMS</strong><small>Type a command (e.g. WEATHER) to 20550</small></span></div>
            <div className="gm-check-row"><Zap /><span><strong>2. GrowMO processes</strong><small>Your farm data is queried instantly</small></span></div>
            <div className="gm-check-row"><CheckCircle2 /><span><strong>3. Get response</strong><small>Receive answer via SMS in seconds</small></span></div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Example SMS flow</span>
            <h3 className="font-display mb-2">PAY command</h3>
            <div className="gm-check-row"><Send /><span><strong>You send:</strong><small>PAY 0712345678 500</small></span></div>
            <div className="gm-check-row"><MessageCircle /><span><strong>GrowMO replies:</strong><small>Confirm: Pay KES 500 to 0712***5678? Reply YES</small></span></div>
            <div className="gm-check-row"><Send /><span><strong>You reply:</strong><small>YES</small></span></div>
            <div className="gm-check-row"><CheckCircle2 /><span><strong>GrowMO confirms:</strong><small>✅ Paid KES 500. Ref: QJK3L5X7YZ. Balance: KES 34,500</small></span></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 16.4 WhatsApp Chatbot ──────────────────────────────────────────────── */
function WhatsAppView({ templates, config, onTemplate, onConfig }: {
  templates: WhatsAppTemplate[]; config: typeof WHATSAPP_CONFIG;
  onTemplate: (t: WhatsAppTemplate) => void; onConfig: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader eyebrow="16.4 · WhatsApp Chatbot" title="Chat with your farm" subtitle={`Send text, voice notes or photos to ${config.businessNumber} — AI responds in your language.`} action={<button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onConfig}><Settings2 /> WhatsApp config</button>} />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Phone} label="Business number" value={config.businessNumber} note={config.provider} />
        <DashboardMetric icon={MessageCircle} label="Messages sent" value={config.monthlyMessagesSent.toLocaleString()} note={`${config.monthlyMessagesReceived.toLocaleString()} received`} />
        <DashboardMetric icon={Star} label="Photo diagnoses" value={config.photoDiagnosesThisMonth.toString()} note="This month" />
        <DashboardMetric icon={Users} label="Active chats" value={config.activeChats.toLocaleString()} note={`Avg response: ${config.avgResponseTime}`} />
      </div>
      <div className="row g-3 mt-3">
        <div className="col-xl-7">
          <div className="gm-card p-3 h-100">
            <span className="gm-eyebrow">Message templates</span>
            <h3 className="font-display mb-1">Approved templates</h3>
            <div className="gm-table-wrap mt-2">
              <table className="gm-table">
                <thead><tr><th>Template</th><th>Category</th><th>Status</th><th>Used</th><th /></tr></thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong><small className="d-block text-muted">{t.language}</small></td>
                      <td><StatusChip label={t.category} tone="neutral" /></td>
                      <td><StatusChip label={t.status} tone={t.status === "Approved" ? "low" : t.status === "Pending" ? "medium" : "high"} /></td>
                      <td><strong className="font-display">{t.timesUsed.toLocaleString()}</strong></td>
                      <td><button type="button" className="gm-icon-btn" onClick={() => onTemplate(t)}><Eye /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-5">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Capabilities</span>
            <h3 className="font-display mb-2">What the bot can do</h3>
            <div className="gm-check-row"><MessageCircle /><span><strong>Text messages</strong><small>Ask questions in English or Kiswahili</small></span></div>
            <div className="gm-check-row"><Star /><span><strong>Photo diagnosis</strong><small>Send pest/disease photo → AI identifies</small></span></div>
            <div className="gm-check-row"><Phone /><span><strong>Voice notes</strong><small>Speak in Kiswahili → transcribed → AI responds</small></span></div>
            <div className="gm-check-row"><Globe /><span><strong>Multi-language</strong><small>{config.languages.join(", ")}</small></span></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 16.5 Agent Network ─────────────────────────────────────────────────── */
function AgentsView({ agents, allAgents, stats, totalFiltered, query, typeFilter, countyFilter, page, totalPages, perPage, onQuery, onType, onCounty, onPage, onAdd, onAgent, onEdit, onLocator }: {
  agents: Agent[]; allAgents: Agent[]; stats: typeof AGENT_NETWORK_STATS; totalFiltered: number; query: string; typeFilter: string; countyFilter: string; page: number; totalPages: number; perPage: number;
  onQuery: (q: string) => void; onType: (t: string) => void; onCounty: (c: string) => void; onPage: (p: number) => void;
  onAdd: () => void; onAgent: (a: Agent) => void; onEdit: (a: Agent) => void; onLocator: () => void;
}) {
  const types = [...new Set(allAgents.map((a) => a.type))];
  const counties = [...new Set(allAgents.map((a) => a.county))].sort();
  return (
    <>
      <DashboardSectionHeader eyebrow="16.5 · Agent Network" title="2,100+ agents across Kenya" subtitle="Agro-vets, M-Pesa agents, community leaders and cooperatives help farmers access GrowMO." action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onLocator}><MapPin /> Find agent</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onAdd}><Plus /> Add agent</button></div>} />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={Users} label="Total agents" value={stats.totalAgents.toLocaleString()} note={`${stats.activeAgents.toLocaleString()} active`} />
        <DashboardMetric icon={MapPin} label="Counties" value={stats.counties.toString()} note="Coverage" />
        <DashboardMetric icon={TrendingUp} label="Farmers served" value={stats.farmersServed.toLocaleString()} note={`Avg ${stats.avgFarmersPerAgent}/agent`} />
        <DashboardMetric icon={Star} label="Satisfaction" value={`${stats.satisfactionRate}/5`} note={`${stats.monthlyTransactions.toLocaleString()} txns/month`} />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}><Search /><input className="gm-input" value={query} onChange={e => onQuery(e.target.value)} placeholder="Search agent name, location or county" /></div>
          <select className="gm-select" value={typeFilter} onChange={e => onType(e.target.value)}>
            <option value="all">All types</option>
            {types.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="gm-select" value={countyFilter} onChange={e => onCounty(e.target.value)}>
            <option value="all">All counties</option>
            {counties.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Agent</th><th>Type</th><th>Location</th><th>Services</th><th>Farmers</th><th>Txns/mo</th><th>Rating</th><th>Status</th><th /></tr></thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button type="button" className="gm-table-link text-start" onClick={() => onAgent(a)}>
                      <strong>{a.name}</strong>
                      <small className="d-block text-muted">{a.phone}</small>
                    </button>
                  </td>
                  <td><StatusChip label={a.type} tone="neutral" /></td>
                  <td><small>{a.location}, {a.county}</small></td>
                  <td><small>{a.services.slice(0, 2).join(", ")}{a.services.length > 2 ? ` +${a.services.length - 2}` : ""}</small></td>
                  <td><strong className="font-display">{a.farmersServed}</strong></td>
                  <td><strong className="font-display">{a.transactionsThisMonth.toLocaleString()}</strong></td>
                  <td><strong>{a.rating} ★</strong></td>
                  <td><StatusChip label={a.status} tone={a.status === "Active" ? "low" : a.status === "Training" ? "medium" : "neutral"} /></td>
                  <td><div className="d-flex gap-1"><button type="button" className="gm-icon-btn" onClick={() => onEdit(a)}><Pencil /></button><button type="button" className="gm-icon-btn" onClick={() => onAgent(a)}><Eye /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {agents.length === 0 ? <p className="text-muted text-center py-4 mb-0">No agent matches.</p> : null}
        <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={onPage} perPage={perPage} totalItems={totalFiltered} />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Target agent types</span>
            <h3 className="font-display mb-2">Who can be an agent?</h3>
            <div className="gm-check-row"><Star /><span><strong>Agro-vet shops</strong><small>Input sales + onboarding + soil kits</small></span></div>
            <div className="gm-check-row"><Smartphone /><span><strong>M-Pesa agents</strong><small>Cash deposit/withdrawal + onboarding</small></span></div>
            <div className="gm-check-row"><Users /><span><strong>Community leaders</strong><small>Training + coordination + onboarding</small></span></div>
            <div className="gm-check-row"><Globe /><span><strong>Church groups</strong><small>Group coordination + training</small></span></div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Commission structure</span>
            <h3 className="font-display mb-2">How agents earn</h3>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Farmer onboarding</span><strong>KES 50/new farmer</strong></div>
              <div className="gm-review-row"><span>Cash deposit</span><strong>KES 10–20/txn</strong></div>
              <div className="gm-review-row"><span>Cash withdrawal</span><strong>KES 10–20/txn</strong></div>
              <div className="gm-review-row"><span>Input sale referral</span><strong>KES 20–50/txn</strong></div>
              <div className="gm-review-row"><span>Training session</span><strong>KES 200/session</strong></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}