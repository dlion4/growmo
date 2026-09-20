/* ============================================================================
   PAGE 16 — MOBILE, OFFLINE, USSD & SMS CHANNELS MODALS
   20+ modals, wizards, drawers, and dialogs.
   ========================================================================== */
import {
  ArrowRight,
  BarChart3,
  Check,
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
  Key,
  Layers,
  Lock,
  Mail,
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
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Stepper, Toggle } from "../../components/auth/controls";
import {
  DashboardDrawer,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";
import type {
  Agent,
  OfflineFeature,
  SmsCommand,
  SyncQueueItem,
  UssdMenuItem,
  WhatsAppTemplate,
} from "../../data/app/channels";

/* ── Confirm dialog (reusable) ───────────────────────────────────────────── */
export function ConfirmChannelDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} desc={body}>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className={`gm-btn gm-btn-sm ${destructive ? "gm-btn-danger" : "gm-btn-lime"}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
      </div>
    </Dialog>
  );
}

/* ── 1. Offline Feature Detail Dialog ────────────────────────────────────── */
export function OfflineFeatureDialog({
  open,
  feature,
  onClose,
}: {
  open: boolean;
  feature: OfflineFeature | null;
  onClose: () => void;
}) {
  if (!feature) return null;
  return (
    <Dialog open={open} onClose={onClose} title={feature.feature}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Offline capability</span><strong>{feature.offlineCapability}</strong></div>
          <div className="gm-review-row"><span>Sync behavior</span><strong>{feature.syncBehavior}</strong></div>
          <div className="gm-review-row"><span>Last synced</span><strong>{feature.lastSynced}</strong></div>
          <div className="gm-review-row"><span>Storage used</span><strong>{feature.storageUsed}</strong></div>
          <div className="gm-review-row"><span>Category</span><strong>{feature.category}</strong></div>
        </div>
        <div className="gm-check-row">
          {feature.offlineCapability === "Full" ? <CheckCircle2 /> : feature.offlineCapability === "None" ? <WifiOff /> : <Cloud />}
          <span><strong>{feature.offlineCapability === "Full" ? "Works fully offline" : feature.offlineCapability === "Cached" ? "Cached for offline use" : feature.offlineCapability === "Partial" ? "Partially available offline" : "Requires internet"}</strong><small>{feature.syncBehavior}</small></span>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 2. Sync Settings Dialog ─────────────────────────────────────────────── */
export function SyncSettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [syncInterval, setSyncInterval] = useState("Every 15 minutes");
  const [photoQuality, setPhotoQuality] = useState("Medium");
  return (
    <Dialog open={open} onClose={onClose} title="Sync Settings">
      <div className="gm-wizard-stack">
        <Toggle checked={autoSync} onChange={setAutoSync} label="Auto-sync" desc="Automatically sync when connection is available" />
        <Toggle checked={wifiOnly} onChange={setWifiOnly} label="Wi-Fi only" desc="Only sync when connected to Wi-Fi" />
        <div className="gm-field"><label>Sync interval</label>
          <select className="gm-select w-100" value={syncInterval} onChange={e => setSyncInterval(e.target.value)}>
            {["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Every hour", "Manual only"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="gm-field"><label>Photo upload quality</label>
          <select className="gm-select w-100" value={photoQuality} onChange={e => setPhotoQuality(e.target.value)}>
            {["High (original)", "Medium (compressed)", "Low (fast upload)"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Check /> Save settings</button>
      </div>
    </Dialog>
  );
}

/* ── 3. Storage Manager Dialog ───────────────────────────────────────────── */
export function StorageManagerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Storage Manager" wide>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Total used</span><strong className="font-display">17.6 MB</strong></div>
          <div className="gm-review-row"><span>Available</span><strong>50 MB</strong></div>
          <div className="gm-review-row"><span>Photos</span><strong>12.4 MB</strong></div>
          <div className="gm-review-row"><span>Farm data</span><strong>5.2 MB</strong></div>
        </div>
        <div className="mb-2">
          <div className="d-flex justify-content-between mb-1"><strong>Storage usage</strong><span>35%</span></div>
          <div className="gm-progress-mini"><span className="gm-progress-mini-fill" style={{ width: "35%" }} /></div>
        </div>
        <div className="d-flex flex-column gap-2">
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm"><Trash2 /> Clear photo cache (8.2 MB)</button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm"><RefreshCw /> Clear price cache (0.2 MB)</button>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm"><Database /> Clear all cached data</button>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 4. USSD Menu Simulator Dialog ───────────────────────────────────────── */
export function UssdSimulatorDialog({
  open,
  menu,
  onClose,
}: {
  open: boolean;
  menu: UssdMenuItem[];
  onClose: () => void;
}) {
  const [currentItem, setCurrentItem] = useState<UssdMenuItem | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => { if (open) { setCurrentItem(null); setHistory([]); } }, [open]);
  const handleSelect = (item: UssdMenuItem) => { setCurrentItem(item); setHistory(h => [...h, `Selected ${item.code}: ${item.label}`]); };
  return (
    <Dialog open={open} onClose={onClose} title="USSD Simulator — *384#">
      <div className="gm-ussd-card">
        <div className="gm-ussd-code">
          {!currentItem ? (
            <>
              <strong>GrowMO — *384#</strong>
              <div className="gm-ussd-divider" />
              {menu.map(item => (
                <button key={item.id} type="button" className="gm-ussd-option" onClick={() => handleSelect(item)}>
                  {item.code}. {item.labelSw} ({item.label})
                </button>
              ))}
            </>
          ) : (
            <>
              <strong>{currentItem.label}</strong>
              <div className="gm-ussd-divider" />
              <pre className="gm-ussd-response">{currentItem.response}</pre>
            </>
          )}
        </div>
        <div className="d-flex gap-2 mt-2">
          {currentItem && <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setCurrentItem(null)}>Back to menu</button>}
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 5. USSD Config Dialog ───────────────────────────────────────────────── */
export function UssdConfigDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [timeout, setTimeout_] = useState("120");
  const [language, setLanguage] = useState("Auto-detect");
  return (
    <Dialog open={open} onClose={onClose} title="USSD Configuration">
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Shortcode</span><strong className="font-display">*384#</strong></div>
          <div className="gm-review-row"><span>Carriers</span><strong>Safaricom, Airtel, Telkom</strong></div>
          <div className="gm-review-row"><span>Monthly users</span><strong className="font-display">12,400</strong></div>
        </div>
        <div className="gm-field"><label>Session timeout (seconds)</label><input className="gm-input w-100" type="number" value={timeout} onChange={e => setTimeout_(e.target.value)} /></div>
        <div className="gm-field"><label>Default language</label>
          <select className="gm-select w-100" value={language} onChange={e => setLanguage(e.target.value)}>
            {["Auto-detect", "English", "Kiswahili"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Check /> Save config</button>
      </div>
    </Dialog>
  );
}

/* ── 6. SMS Command Test Dialog ──────────────────────────────────────────── */
export function SmsTestDialog({
  open,
  command,
  onClose,
}: {
  open: boolean;
  command: SmsCommand | null;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("0712 345 678");
  const [sent, setSent] = useState(false);
  useEffect(() => { if (open) setSent(false); }, [open]);
  if (!command) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Test: SMS ${command.command}`}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Command</span><strong className="font-display">{command.command}</strong></div>
          <div className="gm-review-row"><span>Shortcode</span><strong>{command.shortcode}</strong></div>
          <div className="gm-review-row"><span>Action</span><strong>{command.action}</strong></div>
        </div>
        <div className="gm-field"><label>Send test to phone number</label><input className="gm-input w-100" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        <div className="gm-check-row"><MessageCircle /><span><strong>Expected response</strong><small>{command.response}</small></span></div>
        {sent && <div className="gm-alert-box is-success"><CheckCircle2 /><p><strong>Test SMS sent!</strong><br />Check your phone for the response from {command.shortcode}.</p></div>}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" disabled={sent} onClick={() => setSent(true)}><Send /> Send test</button>
      </div>
    </Dialog>
  );
}

/* ── 7. SMS Gateway Config Dialog ────────────────────────────────────────── */
export function SmsGatewayDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="SMS Gateway Configuration" wide>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Gateway provider</span><strong>Africa's Talking</strong></div>
          <div className="gm-review-row"><span>Shortcode</span><strong className="font-display">20550</strong></div>
          <div className="gm-review-row"><span>Cost per SMS</span><strong>KES 1</strong></div>
          <div className="gm-review-row"><span>Delivery rate</span><strong className="text-success">97.5%</strong></div>
          <div className="gm-review-row"><span>Avg response time</span><strong>3 sec</strong></div>
        </div>
        <div className="gm-check-row"><ShieldCheck /><span><strong>API key configured</strong><small>Your SMS gateway is connected and operational.</small></span><StatusChip label="Active" tone="low" /></div>
      </div>
    </Dialog>
  );
}

/* ── 8. WhatsApp Config Dialog ───────────────────────────────────────────── */
export function WhatsAppConfigDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="WhatsApp Configuration" wide>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Business number</span><strong className="font-display">+254 712 345 678</strong></div>
          <div className="gm-review-row"><span>Provider</span><strong>Meta Cloud API</strong></div>
          <div className="gm-review-row"><span>Monthly messages sent</span><strong className="font-display">28,400</strong></div>
          <div className="gm-review-row"><span>Monthly messages received</span><strong className="font-display">34,100</strong></div>
          <div className="gm-review-row"><span>Active chats</span><strong>4,200</strong></div>
          <div className="gm-review-row"><span>Avg response time</span><strong>8 sec</strong></div>
        </div>
        <div className="gm-check-row"><ShieldCheck /><span><strong>Webhook connected</strong><small>WhatsApp Business API is connected and receiving messages.</small></span><StatusChip label="Active" tone="low" /></div>
      </div>
    </Dialog>
  );
}

/* ── 9. WhatsApp Template Preview Dialog ─────────────────────────────────── */
export function WhatsAppTemplateDialog({
  open,
  template,
  onClose,
}: {
  open: boolean;
  template: WhatsAppTemplate | null;
  onClose: () => void;
}) {
  if (!template) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Template: ${template.name}`}>
      <div className="gm-wizard-stack">
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Category</span><strong>{template.category}</strong></div>
          <div className="gm-review-row"><span>Language</span><strong>{template.language}</strong></div>
          <div className="gm-review-row"><span>Status</span><StatusChip label={template.status} tone={template.status === "Approved" ? "low" : template.status === "Pending" ? "medium" : "high"} /></div>
          <div className="gm-review-row"><span>Times used</span><strong className="font-display">{template.timesUsed.toLocaleString()}</strong></div>
          <div className="gm-review-row"><span>Last used</span><strong>{template.lastUsed}</strong></div>
        </div>
        <div className="gm-card p-3" style={{ background: "var(--gm-mint-50)" }}>
          <span className="gm-eyebrow">Preview</span>
          <p className="mb-0 mt-1" style={{ whiteSpace: "pre-wrap" }}>{template.content}</p>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 10. Agent Detail Drawer ─────────────────────────────────────────────── */
export function AgentDrawer({
  open,
  agent,
  onClose,
  onEdit,
}: {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!agent) return null;
  return (
    <DashboardDrawer open={open} title={agent.name} onClose={onClose} footer={
      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onEdit}><Pencil /> Edit agent</button>
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
      </div>
    }>
      <div className="gm-wizard-stack">
        <div className="text-center mb-2">
          <span className="gm-avatar-lg">{agent.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
          <h3 className="font-display mt-2 mb-0">{agent.name}</h3>
          <StatusChip label={agent.type} tone="neutral" />
          <StatusChip label={agent.status} tone={agent.status === "Active" ? "low" : agent.status === "Training" ? "medium" : "neutral"} />
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Phone</span><strong>{agent.phone}</strong></div>
          <div className="gm-review-row"><span>Location</span><strong>{agent.location}, {agent.county}</strong></div>
          <div className="gm-review-row"><span>Commission</span><strong>{agent.commission}</strong></div>
          <div className="gm-review-row"><span>Farmers served</span><strong className="font-display">{agent.farmersServed}</strong></div>
          <div className="gm-review-row"><span>Transactions (month)</span><strong className="font-display">{agent.transactionsThisMonth.toLocaleString()}</strong></div>
          <div className="gm-review-row"><span>Rating</span><strong>{agent.rating} ★</strong></div>
          <div className="gm-review-row"><span>Joined</span><strong>{agent.joinedDate}</strong></div>
        </div>
        <h4 className="font-display">Services</h4>
        {agent.services.map(s => (
          <div key={s} className="gm-check-row"><CheckCircle2 /><span><strong>{s}</strong></span></div>
        ))}
      </div>
    </DashboardDrawer>
  );
}

/* ── 11. Add Agent Wizard (3-step) ───────────────────────────────────────── */
export function AddAgentWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (agent: Agent) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Agent>({
    id: "", name: "", phone: "", type: "Agro-vet", location: "", county: "Kiambu",
    services: [], commission: "KES 20/txn", status: "Training", farmersServed: 0,
    transactionsThisMonth: 0, rating: 0, joinedDate: "Oct 2026",
  });
  useEffect(() => { if (open) { setStep(0); setForm({ id: `ag-${Date.now()}`, name: "", phone: "", type: "Agro-vet", location: "", county: "Kiambu", services: [], commission: "KES 20/txn", status: "Training", farmersServed: 0, transactionsThisMonth: 0, rating: 0, joinedDate: "Oct 2026" }); } }, [open]);
  const steps = ["Contact", "Services", "Review"];
  const allServices = ["Onboarding", "Cash deposit", "Cash withdrawal", "Input sales", "Training", "Soil kit collection", "Agronomist referral", "Group coordination", "Export buyer connection", "Certification support", "Smartphone training"];
  const toggleService = (s: string) => setForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));
  return (
    <Dialog open={open} onClose={onClose} title="Add Agent" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <>
            <div className="row g-3">
              <div className="col-md-6"><div className="gm-field"><label>Agent name</label><input className="gm-input w-100" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Githunguri Agro-vet" /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Phone</label><input className="gm-input w-100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Type</label><select className="gm-select w-100" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>{["Agro-vet","M-Pesa Agent","Community Leader","Church Group","Cooperative"].map(t => <option key={t}>{t}</option>)}</select></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Location</label><input className="gm-input w-100" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Githunguri Town" /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>County</label><select className="gm-select w-100" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}>{["Kiambu","Nakuru","Meru","Uasin Gishu","Kakamega","Kisumu","Mombasa","Kilifi"].map(c => <option key={c}>{c}</option>)}</select></div></div>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="gm-field"><label>Services offered</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {allServices.map(s => <button key={s} type="button" className={`gm-btn gm-btn-sm ${form.services.includes(s) ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => toggleService(s)}>{s}</button>)}
              </div>
            </div>
            <div className="gm-field"><label>Commission</label><input className="gm-input w-100" value={form.commission} onChange={e => setForm(f => ({ ...f, commission: e.target.value }))} placeholder="e.g. KES 20/txn" /></div>
          </>
        ) : (
          <>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Name</span><strong>{form.name || "—"}</strong></div>
              <div className="gm-review-row"><span>Phone</span><strong>{form.phone || "—"}</strong></div>
              <div className="gm-review-row"><span>Type</span><strong>{form.type}</strong></div>
              <div className="gm-review-row"><span>Location</span><strong>{form.location}, {form.county}</strong></div>
              <div className="gm-review-row"><span>Services</span><strong>{form.services.join(", ") || "—"}</strong></div>
              <div className="gm-review-row"><span>Commission</span><strong>{form.commission}</strong></div>
            </div>
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Add agent</button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 12. Edit Agent Dialog ───────────────────────────────────────────────── */
export function EditAgentDialog({
  open,
  agent,
  onClose,
  onSave,
}: {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSave: (a: Agent) => void;
}) {
  const [form, setForm] = useState<Agent | null>(null);
  useEffect(() => { if (open) setForm(agent ? { ...agent } : null); }, [open, agent]);
  if (!form) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Edit: ${form.name}`} wide>
      <div className="gm-wizard-stack">
        <div className="row g-3">
          <div className="col-md-6"><div className="gm-field"><label>Status</label><select className="gm-select w-100" value={form.status} onChange={e => setForm(f => f ? { ...f, status: e.target.value as any } : null)}>{["Active","Training","Inactive"].map(s => <option key={s}>{s}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Commission</label><input className="gm-input w-100" value={form.commission} onChange={e => setForm(f => f ? { ...f, commission: e.target.value } : null)} /></div></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save</button>
      </div>
    </Dialog>
  );
}

/* ── 13. Agent Locator Dialog ────────────────────────────────────────────── */
export function AgentLocatorDialog({
  open,
  agents,
  onClose,
}: {
  open: boolean;
  agents: Agent[];
  onClose: () => void;
}) {
  const [county, setCounty] = useState("Kiambu");
  const filtered = agents.filter(a => a.county === county && a.status === "Active");
  return (
    <Dialog open={open} onClose={onClose} title="Find an Agent" wide>
      <div className="gm-wizard-stack">
        <div className="gm-field"><label>County</label>
          <select className="gm-select w-100" value={county} onChange={e => setCounty(e.target.value)}>
            {[...new Set(agents.map(a => a.county))].sort().map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {filtered.map(agent => (
          <div key={agent.id} className="gm-check-row">
            <MapPin />
            <span><strong>{agent.name}</strong><small>{agent.location} · {agent.type} · {agent.services.length} services</small></span>
            <strong className="font-display">{agent.rating} ★</strong>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted text-center py-3 mb-0">No active agents in {county}.</p>}
      </div>
    </Dialog>
  );
}

/* ── 14. Channel Health Dashboard Dialog ─────────────────────────────────── */
export function ChannelHealthDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Channel Health Dashboard" wide>
      <div className="gm-wizard-stack">
        <div className="row g-2">
          <div className="col-md-4"><div className="gm-card p-3 text-center"><Wifi width={24} style={{ color: "var(--gm-leaf-500)" }} /><h4 className="font-display mt-1 mb-0">PWA</h4><StatusChip label="Online" tone="low" /><small className="d-block text-muted">99.9% uptime</small></div></div>
          <div className="col-md-4"><div className="gm-card p-3 text-center"><Signal width={24} style={{ color: "var(--gm-leaf-500)" }} /><h4 className="font-display mt-1 mb-0">USSD</h4><StatusChip label="Active" tone="low" /><small className="d-block text-muted">3 carriers</small></div></div>
          <div className="col-md-4"><div className="gm-card p-3 text-center"><MessageCircle width={24} style={{ color: "var(--gm-leaf-500)" }} /><h4 className="font-display mt-1 mb-0">SMS</h4><StatusChip label="Active" tone="low" /><small className="d-block text-muted">97.5% delivery</small></div></div>
          <div className="col-md-4"><div className="gm-card p-3 text-center"><Phone width={24} style={{ color: "var(--gm-leaf-500)" }} /><h4 className="font-display mt-1 mb-0">WhatsApp</h4><StatusChip label="Connected" tone="low" /><small className="d-block text-muted">4,200 active chats</small></div></div>
          <div className="col-md-4"><div className="gm-card p-3 text-center"><Users width={24} style={{ color: "var(--gm-leaf-500)" }} /><h4 className="font-display mt-1 mb-0">Agents</h4><StatusChip label="1,890 active" tone="low" /><small className="d-block text-muted">42 counties</small></div></div>
          <div className="col-md-4"><div className="gm-card p-3 text-center"><CloudOff width={24} style={{ color: "var(--gm-gold-500)" }} /><h4 className="font-display mt-1 mb-0">Offline</h4><StatusChip label="3 pending" tone="medium" /><small className="d-block text-muted">17.6 MB cached</small></div></div>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 15. Connectivity Test Dialog ────────────────────────────────────────── */
export function ConnectivityTestDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ name: string; status: string; latency: string }[]>([]);
  useEffect(() => { if (open) { setTesting(false); setResults([]); } }, [open]);
  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setResults([
        { name: "Internet", status: "Connected", latency: "45ms" },
        { name: "GrowMO API", status: "Reachable", latency: "120ms" },
        { name: "M-Pesa Gateway", status: "Reachable", latency: "89ms" },
        { name: "SMS Gateway", status: "Reachable", latency: "67ms" },
        { name: "WhatsApp API", status: "Reachable", latency: "156ms" },
        { name: "Weather API", status: "Reachable", latency: "234ms" },
      ]);
      setTesting(false);
    }, 2000);
  };
  return (
    <Dialog open={open} onClose={onClose} title="Connectivity Test">
      <div className="gm-wizard-stack">
        <p className="text-muted">Test connectivity to all GrowMO services.</p>
        {results.length > 0 ? (
          results.map(r => (
            <div key={r.name} className="gm-check-row">
              <Wifi />
              <span><strong>{r.name}</strong><small>{r.latency}</small></span>
              <StatusChip label={r.status} tone="low" />
            </div>
          ))
        ) : testing ? (
          <div className="text-center py-3"><div className="gm-spinner mb-2" /><p className="text-muted">Testing all connections...</p></div>
        ) : (
          <p className="text-muted text-center">Click "Run test" to check all connections.</p>
        )}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" disabled={testing} onClick={runTest}><RefreshCw /> Run test</button>
      </div>
    </Dialog>
  );
}

/* ── 16. Sync Queue Drawer ───────────────────────────────────────────────── */
export function SyncQueueDrawer({
  open,
  queue,
  onClose,
  onSync,
}: {
  open: boolean;
  queue: SyncQueueItem[];
  onClose: () => void;
  onSync: () => void;
}) {
  return (
    <DashboardDrawer open={open} title="Sync Queue" onClose={onClose} footer={
      <button type="button" className="gm-btn gm-btn-lime gm-btn-sm w-100" onClick={onSync}><RefreshCw /> Sync now</button>
    }>
      <div className="gm-wizard-stack">
        <p className="text-muted">{queue.length} pending changes waiting to sync.</p>
        {queue.map(item => (
          <div key={item.id} className="gm-check-row">
            <Cloud />
            <span><strong>{item.description}</strong><small>{item.type} · {item.createdAt} · {item.size}</small></span>
            <StatusChip label={item.status} tone={item.status === "Pending" ? "medium" : item.status === "Syncing" ? "low" : "high"} />
          </div>
        ))}
        {queue.length === 0 && <p className="text-muted text-center py-3 mb-0">All changes synced! 🎉</p>}
      </div>
    </DashboardDrawer>
  );
}

/* ── 17. Offline Mode Test Dialog ────────────────────────────────────────── */
export function OfflineTestDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"online" | "offline">("online");
  return (
    <Dialog open={open} onClose={onClose} title="Test Offline Mode">
      <div className="gm-wizard-stack">
        <p className="text-muted">Simulate going offline to test cached features.</p>
        <div className="d-flex gap-2 mb-2">
          <button type="button" className={`gm-btn gm-btn-sm ${mode === "online" ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setMode("online")}><Wifi /> Online</button>
          <button type="button" className={`gm-btn gm-btn-sm ${mode === "offline" ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setMode("offline")}><WifiOff /> Offline</button>
        </div>
        {mode === "offline" && (
          <div className="gm-alert-box"><CloudOff /><p><strong>You're offline</strong><br />Changes will sync when connected. Available: crop plans, tasks, expenses, photos, inventory.</p></div>
        )}
        <div className="gm-check-row"><CheckCircle2 /><span><strong>View crop plans</strong><small>{mode === "offline" ? "Available (cached)" : "Available"}</small></span><StatusChip label="OK" tone="low" /></div>
        <div className="gm-check-row"><CheckCircle2 /><span><strong>View tasks</strong><small>{mode === "offline" ? "Available (cached)" : "Available"}</small></span><StatusChip label="OK" tone="low" /></div>
        <div className="gm-check-row">{mode === "offline" ? <CloudOff /> : <CheckCircle2 />}<span><strong>AI chat</strong><small>{mode === "offline" ? "Unavailable" : "Available"}</small></span><StatusChip label={mode === "offline" ? "Offline" : "OK"} tone={mode === "offline" ? "high" : "low"} /></div>
        <div className="gm-check-row">{mode === "offline" ? <CloudOff /> : <CheckCircle2 />}<span><strong>Payments</strong><small>{mode === "offline" ? "Unavailable" : "Available"}</small></span><StatusChip label={mode === "offline" ? "Offline" : "OK"} tone={mode === "offline" ? "high" : "low"} /></div>
      </div>
    </Dialog>
  );
}

/* ── 18. Channel Usage Analytics Dialog ──────────────────────────────────── */
export function ChannelAnalyticsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Channel Usage Analytics" wide>
      <div className="gm-wizard-stack">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="gm-review-card">
              <div className="gm-review-row"><span>PWA users</span><strong className="font-display">45,200</strong></div>
              <div className="gm-review-row"><span>USSD users</span><strong className="font-display">12,400</strong></div>
              <div className="gm-review-row"><span>SMS users</span><strong className="font-display">8,200</strong></div>
              <div className="gm-review-row"><span>WhatsApp users</span><strong className="font-display">4,200</strong></div>
              <div className="gm-review-row"><span>Agent-assisted</span><strong className="font-display">128,000</strong></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Most used channel</span><strong>PWA (56%)</strong></div>
              <div className="gm-review-row"><span>Fastest growing</span><strong>WhatsApp (+34%)</strong></div>
              <div className="gm-review-row"><span>Offline usage</span><strong>23% of sessions</strong></div>
              <div className="gm-review-row"><span>Avg sessions/day</span><strong>3.2</strong></div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 19. Language Settings Dialog ─────────────────────────────────────────── */
export function ChannelLanguageDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [defaultLang, setDefaultLang] = useState("Auto-detect");
  return (
    <Dialog open={open} onClose={onClose} title="Channel Language Settings">
      <div className="gm-wizard-stack">
        <div className="gm-field"><label>Default language for all channels</label>
          <select className="gm-select w-100" value={defaultLang} onChange={e => setDefaultLang(e.target.value)}>
            {["Auto-detect","English","Kiswahili","Kikuyu","Luo","Kalenjin"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <p className="text-muted">This sets the default language for USSD menus, SMS responses, and WhatsApp bot replies. Users can override per channel.</p>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Check /> Save</button>
      </div>
    </Dialog>
  );
}

/* ── 20. Notification Channel Priority Dialog ────────────────────────────── */
export function ChannelPriorityDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [channels, setChannels] = useState([
    { name: "Push notification", enabled: true },
    { name: "WhatsApp", enabled: true },
    { name: "SMS", enabled: true },
    { name: "USSD callback", enabled: false },
    { name: "Email", enabled: true },
    { name: "Agent visit", enabled: false },
  ]);
  const toggle = (name: string) => setChannels(c => c.map(ch => ch.name === name ? { ...ch, enabled: !ch.enabled } : ch));
  return (
    <Dialog open={open} onClose={onClose} title="Notification Channel Priority">
      <div className="gm-wizard-stack">
        <p className="text-muted">Choose which channels to use for farm notifications, in priority order.</p>
        {channels.map(ch => (
          <Toggle key={ch.name} checked={ch.enabled} onChange={() => toggle(ch.name)} label={ch.name} desc={ch.enabled ? "Active" : "Disabled"} />
        ))}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Check /> Save priority</button>
      </div>
    </Dialog>
  );
}

/* ── 21. Bulk SMS Campaign Dialog ────────────────────────────────────────── */
export function BulkSmsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [audience, setAudience] = useState("All farmers");
  const [message, setMessage] = useState("");
  const [scheduled, setScheduled] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="Send Bulk SMS" wide>
      <div className="gm-wizard-stack">
        <div className="gm-field"><label>Audience</label>
          <select className="gm-select w-100" value={audience} onChange={e => setAudience(e.target.value)}>
            {["All farmers","Kiambu county","Premium subscribers","Inactive 30+ days","New signups this week"].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="gm-field"><label>Message</label><textarea className="gm-textarea w-100" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message in English or Kiswahili..." /></div>
        <small className="text-muted">{message.length}/160 characters · ~{Math.ceil(Math.max(message.length, 1) / 160)} SMS</small>
        <Toggle checked={scheduled} onChange={setScheduled} label="Schedule for later" desc="Send at a specific date and time" />
        {scheduled && <div className="gm-field"><label>Schedule date</label><input className="gm-input w-100" type="datetime-local" /></div>}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" disabled={!message} onClick={onClose}><Send /> {scheduled ? "Schedule" : "Send now"}</button>
      </div>
    </Dialog>
  );
}