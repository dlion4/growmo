/* ============================================================================
   PAGE 15 — SETTINGS, TEAM & PERMISSIONS MODALS
   20+ modals, wizards, drawers, and dialogs.
   ========================================================================== */
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Edit3,
  Eye,
  FileText,
  Globe,
  Grid3X3,
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
  Smartphone,
  Star,
  Table,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, Stepper, Toggle } from "../../components/auth/controls";
import {
  DashboardDrawer,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { kes } from "../../data/site";
import type {
  ActivityLog,
  FarmPlot,
  FarmSettings,
  NotificationPref,
  PrivacySetting,
  TeamMember,
  UserProfile,
} from "../../data/app/settings";

/* ── Confirm dialog (reusable) ───────────────────────────────────────────── */
export function ConfirmSettingsDialog({
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

/* ── 1. Profile Edit Wizard (3-step) ─────────────────────────────────────── */
export function ProfileEditWizard({
  open,
  profile,
  onClose,
  onSave,
}: {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (p: UserProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(profile);
  useEffect(() => { if (open) { setStep(0); setForm(profile); } }, [open, profile]);
  const steps = ["Personal info", "Location", "Preferences"];

  return (
    <Dialog open={open} onClose={onClose} title="Edit Profile" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <>
            <div className="row g-3">
              <div className="col-md-6"><div className="gm-field"><label>First name</label><input className="gm-input w-100" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Last name</label><input className="gm-input w-100" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Phone</label><input className="gm-input w-100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Email</label><input className="gm-input w-100" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>National ID</label><input className="gm-input w-100" value={form.nationalId} onChange={e => setForm(f => ({ ...f, nationalId: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Gender</label><select className="gm-select w-100" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}><option>Female</option><option>Male</option><option>Other</option></select></div></div>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="row g-3">
              <div className="col-md-6"><div className="gm-field"><label>County</label><select className="gm-select w-100" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}>{["Kiambu","Nakuru","Meru","Uasin Gishu","Kakamega","Kisumu","Makueni","Kilifi","Nyeri","Murang'a"].map(c => <option key={c}>{c}</option>)}</select></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Sub-county</label><input className="gm-input w-100" value={form.subCounty} onChange={e => setForm(f => ({ ...f, subCounty: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Ward</label><input className="gm-input w-100" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Village</label><input className="gm-input w-100" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} /></div></div>
            </div>
          </>
        ) : (
          <>
            <div className="gm-field"><label>Language</label><select className="gm-select w-100" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>{["English / Kiswahili","English","Kiswahili","Kikuyu","Luo","Kalenjin"].map(l => <option key={l}>{l}</option>)}</select></div>
            <div className="gm-review-card mt-2">
              <div className="gm-review-row"><span>Name</span><strong>{form.firstName} {form.lastName}</strong></div>
              <div className="gm-review-row"><span>Phone</span><strong>{form.phone}</strong></div>
              <div className="gm-review-row"><span>Email</span><strong>{form.email}</strong></div>
              <div className="gm-review-row"><span>Location</span><strong>{form.ward}, {form.subCounty}, {form.county}</strong></div>
              <div className="gm-review-row"><span>Language</span><strong>{form.language}</strong></div>
            </div>
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save profile</button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 2. Farm Settings Edit Dialog ────────────────────────────────────────── */
export function FarmSettingsDialog({
  open,
  farm,
  onClose,
  onSave,
}: {
  open: boolean;
  farm: FarmSettings;
  onClose: () => void;
  onSave: (f: FarmSettings) => void;
}) {
  const [form, setForm] = useState(farm);
  useEffect(() => { if (open) setForm(farm); }, [open, farm]);
  return (
    <Dialog open={open} onClose={onClose} title="Farm Settings" wide>
      <div className="gm-wizard-stack">
        <div className="row g-3">
          <div className="col-md-6"><div className="gm-field"><label>Farm name</label><input className="gm-input w-100" value={form.farmName} onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))} /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Farm type</label><select className="gm-select w-100" value={form.farmType} onChange={e => setForm(f => ({ ...f, farmType: e.target.value }))}>{["Mixed (crops + dairy)","Crops only","Dairy only","Poultry","Horticulture"].map(t => <option key={t}>{t}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Total acreage</label><input className="gm-input w-100" value={form.totalAcreage} onChange={e => setForm(f => ({ ...f, totalAcreage: e.target.value }))} /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Registration number</label><input className="gm-input w-100" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} /></div></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save farm settings</button>
      </div>
    </Dialog>
  );
}

/* ── 3. Plot Edit Dialog ─────────────────────────────────────────────────── */
export function PlotEditDialog({
  open,
  plot,
  onClose,
  onSave,
}: {
  open: boolean;
  plot: FarmPlot | null;
  onClose: () => void;
  onSave: (p: FarmPlot) => void;
}) {
  const [form, setForm] = useState<FarmPlot>({
    id: "", name: "", size: "", soilType: "", waterSource: "", gps: "", lastSoilTest: "", crops: [], status: "Active",
  });
  useEffect(() => { if (open) setForm(plot ?? { id: `plot-${Date.now()}`, name: "", size: "", soilType: "", waterSource: "", gps: "", lastSoilTest: "", crops: [], status: "Active" }); }, [open, plot]);
  return (
    <Dialog open={open} onClose={onClose} title={plot ? "Edit Plot" : "Add Plot"} wide>
      <div className="gm-wizard-stack">
        <div className="row g-3">
          <div className="col-md-6"><div className="gm-field"><label>Plot name</label><input className="gm-input w-100" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Plot 1" /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Size</label><input className="gm-input w-100" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 0.5 acre" /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Soil type</label><select className="gm-select w-100" value={form.soilType} onChange={e => setForm(f => ({ ...f, soilType: e.target.value }))}>{["Clay loam","Red volcanic","Sandy loam","Enriched media","Black cotton","Loam"].map(s => <option key={s}>{s}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Water source</label><select className="gm-select w-100" value={form.waterSource} onChange={e => setForm(f => ({ ...f, waterSource: e.target.value }))}>{["Rain-fed","Rain + drip irrigation","Drip + fertigation","River pump","Borehole","Dam/pond"].map(w => <option key={w}>{w}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>GPS coordinates</label><input className="gm-input w-100" value={form.gps} onChange={e => setForm(f => ({ ...f, gps: e.target.value }))} placeholder="-1.0534, 36.8712" /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Last soil test</label><input className="gm-input w-100" value={form.lastSoilTest} onChange={e => setForm(f => ({ ...f, lastSoilTest: e.target.value }))} placeholder="Sep 2026" /></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Status</label><select className="gm-select w-100" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>{["Active","Fallow","Planned"].map(s => <option key={s}>{s}</option>)}</select></div></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> {plot ? "Save plot" : "Add plot"}</button>
      </div>
    </Dialog>
  );
}

/* ── 4. Add Team Member Wizard (4-step) ──────────────────────────────────── */
export function AddTeamMemberWizard({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TeamMember>({
    id: "", name: "", phone: "", email: null, role: "Worker",
    plotsAccessible: "All", cropsAccessible: "All", financialAccess: "None",
    paymentAuthority: "None", validFrom: "", validUntil: "Indefinite",
    status: "Invited", lastActive: "Never", avatar: "",
  });
  useEffect(() => { if (open) { setStep(0); setForm({ id: `tm-${Date.now()}`, name: "", phone: "", email: null, role: "Worker", plotsAccessible: "All", cropsAccessible: "All", financialAccess: "None", paymentAuthority: "None", validFrom: "", validUntil: "Indefinite", status: "Invited", lastActive: "Never", avatar: "" }); } }, [open]);
  const steps = ["Contact", "Role", "Permissions", "Review"];

  const getDefaults = (role: string) => {
    const map: Record<string, { fin: string; pay: string }> = {
      "Farm Manager": { fin: "View only", pay: "Can initiate" },
      Agronomist: { fin: "None", pay: "None" },
      Accountant: { fin: "Full", pay: "Can initiate" },
      Worker: { fin: "None", pay: "None" },
      Viewer: { fin: "View only", pay: "None" },
    };
    return map[role] ?? { fin: "None", pay: "None" };
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add Team Member" wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <>
            <div className="row g-3">
              <div className="col-md-6"><div className="gm-field"><label>Full name</label><input className="gm-input w-100" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Peter Kamau" /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Phone number</label><input className="gm-input w-100" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="07XX XXX XXX" /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Email (optional)</label><input className="gm-input w-100" type="email" value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value || null }))} placeholder="name@email.com" /></div></div>
            </div>
          </>
        ) : step === 1 ? (
          <>
            <div className="gm-field"><label>Role</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {["Farm Manager", "Agronomist", "Accountant", "Worker", "Viewer"].map(r => (
                  <button key={r} type="button" className={`gm-btn gm-btn-sm ${form.role === r ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => { const d = getDefaults(r); setForm(f => ({ ...f, role: r as any, financialAccess: d.fin as any, paymentAuthority: d.pay as any })); }}>{r}</button>
                ))}
              </div>
            </div>
            <div className="row g-3 mt-1">
              <div className="col-md-6"><div className="gm-field"><label>Valid from</label><input className="gm-input w-100" type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} /></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Valid until</label><select className="gm-select w-100" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}><option>Indefinite</option><option>31 Mar 2027</option><option>30 Jun 2027</option><option>31 Dec 2027</option></select></div></div>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="row g-3">
              <div className="col-md-6"><div className="gm-field"><label>Plots accessible</label><select className="gm-select w-100" value={form.plotsAccessible} onChange={e => setForm(f => ({ ...f, plotsAccessible: e.target.value }))}>{["All","Plot 1","Plot 2","Plot 3","Greenhouse 1","Plot 1, Plot 2","Plot 1, Greenhouse 1"].map(p => <option key={p}>{p}</option>)}</select></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Crops accessible</label><select className="gm-select w-100" value={form.cropsAccessible} onChange={e => setForm(f => ({ ...f, cropsAccessible: e.target.value }))}>{["All","Cabbage, Tomato","Cabbage, Maize","Maize","Cabbage, Maize, Tomato"].map(c => <option key={c}>{c}</option>)}</select></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Financial access</label><select className="gm-select w-100" value={form.financialAccess} onChange={e => setForm(f => ({ ...f, financialAccess: e.target.value as any }))}>{["Full","View only","None"].map(f => <option key={f}>{f}</option>)}</select></div></div>
              <div className="col-md-6"><div className="gm-field"><label>Payment authority</label><select className="gm-select w-100" value={form.paymentAuthority} onChange={e => setForm(f => ({ ...f, paymentAuthority: e.target.value as any }))}>{["Can initiate","Can approve","None"].map(p => <option key={p}>{p}</option>)}</select></div></div>
            </div>
          </>
        ) : (
          <>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Name</span><strong>{form.name || "—"}</strong></div>
              <div className="gm-review-row"><span>Phone</span><strong>{form.phone || "—"}</strong></div>
              <div className="gm-review-row"><span>Email</span><strong>{form.email || "—"}</strong></div>
              <div className="gm-review-row"><span>Role</span><strong>{form.role}</strong></div>
              <div className="gm-review-row"><span>Plots</span><strong>{form.plotsAccessible}</strong></div>
              <div className="gm-review-row"><span>Crops</span><strong>{form.cropsAccessible}</strong></div>
              <div className="gm-review-row"><span>Financial access</span><strong>{form.financialAccess}</strong></div>
              <div className="gm-review-row"><span>Payment authority</span><strong>{form.paymentAuthority}</strong></div>
              <div className="gm-review-row"><span>Valid from</span><strong>{form.validFrom || "Today"}</strong></div>
              <div className="gm-review-row"><span>Valid until</span><strong>{form.validUntil}</strong></div>
            </div>
            <div className="gm-check-row"><ShieldCheck /><span><strong>Invite will be sent via SMS</strong><small>The team member will receive an SMS with a link to join your farm on GrowMO.</small></span></div>
          </>
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Send invite</button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 5. Edit Team Member Dialog ──────────────────────────────────────────── */
export function EditTeamMemberDialog({
  open,
  member,
  onClose,
  onSave,
}: {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (m: TeamMember) => void;
}) {
  const [form, setForm] = useState<TeamMember | null>(null);
  useEffect(() => { if (open) setForm(member ? { ...member } : null); }, [open, member]);
  if (!form) return null;
  return (
    <Dialog open={open} onClose={onClose} title={`Edit: ${form.name}`} wide>
      <div className="gm-wizard-stack">
        <div className="row g-3">
          <div className="col-md-6"><div className="gm-field"><label>Role</label><select className="gm-select w-100" value={form.role} onChange={e => setForm(f => f ? { ...f, role: e.target.value as any } : null)}>{["Farm Manager","Agronomist","Accountant","Worker","Viewer"].map(r => <option key={r}>{r}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Status</label><select className="gm-select w-100" value={form.status} onChange={e => setForm(f => f ? { ...f, status: e.target.value as any } : null)}>{["Active","Invited","Inactive"].map(s => <option key={s}>{s}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Plots accessible</label><select className="gm-select w-100" value={form.plotsAccessible} onChange={e => setForm(f => f ? { ...f, plotsAccessible: e.target.value } : null)}>{["All","Plot 1","Plot 2","Plot 1, Plot 2","Plot 1, Greenhouse 1"].map(p => <option key={p}>{p}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Financial access</label><select className="gm-select w-100" value={form.financialAccess} onChange={e => setForm(f => f ? { ...f, financialAccess: e.target.value as any } : null)}>{["Full","View only","None"].map(f => <option key={f}>{f}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Payment authority</label><select className="gm-select w-100" value={form.paymentAuthority} onChange={e => setForm(f => f ? { ...f, paymentAuthority: e.target.value as any } : null)}>{["Can initiate","Can approve","None"].map(p => <option key={p}>{p}</option>)}</select></div></div>
          <div className="col-md-6"><div className="gm-field"><label>Valid until</label><select className="gm-select w-100" value={form.validUntil} onChange={e => setForm(f => f ? { ...f, validUntil: e.target.value } : null)}>{["Indefinite","31 Mar 2027","30 Jun 2027","31 Dec 2027"].map(d => <option key={d}>{d}</option>)}</select></div></div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save changes</button>
      </div>
    </Dialog>
  );
}

/* ── 6. Team Member Detail Drawer ────────────────────────────────────────── */
export function TeamMemberDrawer({
  open,
  member,
  onClose,
  onEdit,
  onRemove,
}: {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  if (!member) return null;
  return (
    <DashboardDrawer open={open} title={member.name} onClose={onClose} footer={
      <div className="d-flex flex-wrap gap-2">
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onEdit}><Pencil /> Edit</button>
        {member.role !== "Owner" && <button type="button" className="gm-btn gm-btn-danger-soft gm-btn-sm" onClick={onRemove}><Trash2 /> Remove</button>}
      </div>
    }>
      <div className="gm-wizard-stack">
        <div className="text-center mb-2">
          <span className="gm-avatar-lg">{member.avatar}</span>
          <h3 className="font-display mt-2 mb-0">{member.name}</h3>
          <StatusChip label={member.role} tone={member.role === "Owner" ? "low" : member.status === "Active" ? "low" : "neutral"} />
        </div>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Phone</span><strong>{member.phone}</strong></div>
          <div className="gm-review-row"><span>Email</span><strong>{member.email ?? "—"}</strong></div>
          <div className="gm-review-row"><span>Status</span><strong>{member.status}</strong></div>
          <div className="gm-review-row"><span>Plots</span><strong>{member.plotsAccessible}</strong></div>
          <div className="gm-review-row"><span>Crops</span><strong>{member.cropsAccessible}</strong></div>
          <div className="gm-review-row"><span>Financial access</span><strong>{member.financialAccess}</strong></div>
          <div className="gm-review-row"><span>Payment authority</span><strong>{member.paymentAuthority}</strong></div>
          <div className="gm-review-row"><span>Valid from</span><strong>{member.validFrom}</strong></div>
          <div className="gm-review-row"><span>Valid until</span><strong>{member.validUntil}</strong></div>
          <div className="gm-review-row"><span>Last active</span><strong>{member.lastActive}</strong></div>
        </div>
      </div>
    </DashboardDrawer>
  );
}

/* ── 7. Permission Matrix Dialog ─────────────────────────────────────────── */
export function PermissionMatrixDialog({
  open,
  matrix,
  features,
  onClose,
}: {
  open: boolean;
  matrix: Record<string, Record<string, string>>;
  features: readonly string[];
  onClose: () => void;
}) {
  const roles = Object.keys(matrix);
  return (
    <Dialog open={open} onClose={onClose} title="Role Permission Matrix" wide>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead><tr><th>Feature</th>{roles.map(r => <th key={r}>{r}</th>)}</tr></thead>
          <tbody>
            {features.map(f => (
              <tr key={f}>
                <td><strong>{f}</strong></td>
                {roles.map(r => {
                  const val = matrix[r]?.[f] ?? "—";
                  const tone = val === "Full" ? "low" : val === "—" ? "neutral" : "medium";
                  return <td key={r}><StatusChip label={val} tone={tone as any} /></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

/* ── 8. Notification Preferences Dialog ──────────────────────────────────── */
export function NotificationPrefsDialog({
  open,
  prefs,
  onClose,
  onSave,
}: {
  open: boolean;
  prefs: NotificationPref[];
  onClose: () => void;
  onSave: (prefs: NotificationPref[]) => void;
}) {
  const [form, setForm] = useState(prefs);
  useEffect(() => { if (open) setForm(prefs); }, [open, prefs]);
  const toggle = (id: string) => setForm(f => f.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  const channels = ["Push", "SMS", "WhatsApp", "Email"] as const;
  return (
    <Dialog open={open} onClose={onClose} title="Notification Preferences" wide>
      <div className="gm-wizard-stack">
        {channels.map(ch => (
          <div key={ch}>
            <h4 className="font-display mb-2">{ch}</h4>
            {form.filter(p => p.channel === ch).map(p => (
              <Toggle key={p.id} checked={p.enabled} onChange={() => toggle(p.id)} label={p.type} desc={p.note} />
            ))}
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save preferences</button>
      </div>
    </Dialog>
  );
}

/* ── 9. Privacy Settings Dialog ──────────────────────────────────────────── */
export function PrivacySettingsDialog({
  open,
  settings,
  onClose,
  onSave,
}: {
  open: boolean;
  settings: PrivacySetting[];
  onClose: () => void;
  onSave: (s: PrivacySetting[]) => void;
}) {
  const [form, setForm] = useState(settings);
  useEffect(() => { if (open) setForm(settings); }, [open, settings]);
  const toggle = (id: string) => setForm(f => f.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  return (
    <Dialog open={open} onClose={onClose} title="Data & Privacy" wide>
      <div className="gm-wizard-stack">
        {form.filter(s => s.setting !== "Export all data" && s.setting !== "Delete account").map(s => (
          <Toggle key={s.id} checked={s.enabled} onChange={() => toggle(s.id)} label={s.setting} desc={s.description} />
        ))}
        <div className="gm-field">
          <label>Data retention</label>
          <select className="gm-select w-100" value={form.find(s => s.setting === "Data retention")?.value ?? "Keep all"} onChange={e => setForm(f => f.map(s => s.setting === "Data retention" ? { ...s, value: e.target.value } : s))}>
            {["Keep all", "Auto-delete after 3 years", "Custom"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(form); onClose(); }}><Check /> Save privacy settings</button>
      </div>
    </Dialog>
  );
}

/* ── 10. Export Data Dialog ──────────────────────────────────────────────── */
export function ExportDataDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [sections, setSections] = useState<string[]>(["Profile", "Farm data", "Transactions", "Crop records"]);
  const allSections = ["Profile", "Farm data", "Transactions", "Crop records", "Team data", "Weather history", "Market prices", "Photos"];
  const toggle = (s: string) => setSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  return (
    <Dialog open={open} onClose={onClose} title="Export All Data">
      <div className="gm-wizard-stack">
        <p className="text-muted">Download a ZIP file containing all your GrowMO data.</p>
        <div className="gm-field"><label>Format</label>
          <div className="d-flex gap-2 mt-1">
            <button type="button" className={`gm-btn gm-btn-sm ${format === "csv" ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setFormat("csv")}>CSV</button>
            <button type="button" className={`gm-btn gm-btn-sm ${format === "json" ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => setFormat("json")}>JSON</button>
          </div>
        </div>
        <div className="gm-field"><label>Sections to include</label>
          <div className="d-flex flex-wrap gap-2 mt-1">
            {allSections.map(s => <button key={s} type="button" className={`gm-btn gm-btn-sm ${sections.includes(s) ? "gm-btn-dark" : "gm-btn-outline"}`} onClick={() => toggle(s)}>{s}</button>)}
          </div>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onClose}><Download /> Export data</button>
      </div>
    </Dialog>
  );
}

/* ── 11. Delete Account Dialog ───────────────────────────────────────────── */
export function DeleteAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState("");
  useEffect(() => { if (open) setConfirm(""); }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Delete Account">
      <div className="gm-wizard-stack">
        <div className="gm-alert-box is-danger"><Trash2 /><p><strong>This action cannot be undone</strong><br />All your farm data, records, team connections and payment history will be permanently deleted after a 30-day grace period.</p></div>
        <div className="gm-field"><label>Type DELETE to confirm</label><input className="gm-input w-100" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE" /></div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-danger gm-btn-sm" disabled={confirm !== "DELETE"} onClick={onClose}><Trash2 /> Delete account</button>
      </div>
    </Dialog>
  );
}

/* ── 12. Subscription Plan Dialog ────────────────────────────────────────── */
export function SubscriptionPlanDialog({
  open,
  current,
  onClose,
  onUpgrade,
}: {
  open: string | null;
  current: string;
  onClose: () => void;
  onUpgrade: (plan: string) => void;
}) {
  if (!open) return null;
  const isCurrent = open.toLowerCase() === current.toLowerCase();
  return (
    <Dialog open={!!open} onClose={onClose} title={`${open} Plan`}>
      <div className="gm-wizard-stack">
        <h3 className="font-display">{open === "Free" ? "Mbegu (Seed)" : open === "Premium" ? "Mavuno (Harvest)" : "Chama / Cooperative"}</h3>
        <p className="text-muted">{open === "Free" ? "Everything a starting farmer needs." : open === "Premium" ? "For serious commercial farmers who want predictions, not surprises." : "Run your whole group — bulk buying, collective sales, one dashboard."}</p>
        <div className="gm-review-card">
          <div className="gm-review-row"><span>Price</span><strong className="font-display">{open === "Free" ? "Free forever" : open === "Premium" ? "KES 299/month" : "KES 2,499/month"}</strong></div>
          <div className="gm-review-row"><span>Crops</span><strong>{open === "Free" ? "2" : open === "Premium" ? "Unlimited" : "Unlimited"}</strong></div>
          <div className="gm-review-row"><span>Team</span><strong>{open === "Free" ? "1 (self)" : open === "Premium" ? "3" : "200"}</strong></div>
          <div className="gm-review-row"><span>AI chats</span><strong>{open === "Free" ? "5/month" : open === "Premium" ? "50/month" : "Unlimited"}</strong></div>
        </div>
        {isCurrent && <div className="gm-check-row"><CheckCircle2 /><span><strong>This is your current plan</strong><small>You are subscribed to the {open} plan.</small></span></div>}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Close</button>
        {!isCurrent && <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onUpgrade(open); onClose(); }}>Upgrade to {open}</button>}
      </div>
    </Dialog>
  );
}

/* ── 13. Upgrade Wizard (3-step) ─────────────────────────────────────────── */
export function UpgradeWizard({
  open,
  targetPlan,
  onClose,
  onComplete,
}: {
  open: boolean;
  targetPlan: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  useEffect(() => { if (open) { setStep(0); setProcessing(false); } }, [open]);
  const steps = ["Select plan", "Payment", "Confirm"];
  const price = targetPlan === "Premium" ? 299 : 999;
  return (
    <Dialog open={open} onClose={onClose} title={`Upgrade to ${targetPlan}`} wide>
      <Stepper steps={steps} current={step} />
      <div className="gm-wizard-stack mt-3">
        {step === 0 ? (
          <div className="gm-review-card">
            <div className="gm-review-row"><span>Plan</span><strong>{targetPlan}</strong></div>
            <div className="gm-review-row"><span>Price</span><strong className="font-display">{kes(price)}/month</strong></div>
            <div className="gm-review-row"><span>Billing</span><strong>Monthly via M-Pesa</strong></div>
          </div>
        ) : step === 1 ? (
          <>
            <p className="text-muted">Pay via M-Pesa. An STK push will be sent to your phone.</p>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Amount</span><strong className="font-display">{kes(price)}</strong></div>
              <div className="gm-review-row"><span>To</span><strong>GrowMO (Paybill 174379)</strong></div>
              <div className="gm-review-row"><span>Phone</span><strong>0712 345 678</strong></div>
            </div>
          </>
        ) : (
          processing ? (
            <div className="text-center py-4"><div className="gm-spinner mb-3" /><p className="text-muted">Processing your payment...</p></div>
          ) : (
            <div className="text-center py-3"><CheckCircle2 width={48} height={48} style={{ color: "var(--gm-leaf-500)" }} /><h3 className="font-display mt-2">Upgrade successful!</h3><p className="text-muted">Your {targetPlan} plan is now active.</p></div>
          )
        )}
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => step > 0 ? setStep(step - 1) : onClose()}>{step > 0 ? "Back" : "Cancel"}</button>
        {step < steps.length - 1 ? (
          <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => setStep(step + 1)}>Next <ArrowRight /></button>
        ) : (
          <button type="button" className="gm-btn gm-btn-mpesa gm-btn-sm" disabled={processing} onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); onComplete(); }, 2000); }}>Pay {kes(price)}</button>
        )}
      </div>
    </Dialog>
  );
}

/* ── 14. Change Password Dialog ──────────────────────────────────────────── */
export function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  useEffect(() => { if (open) { setCurrent(""); setNewPw(""); setConfirm(""); } }, [open]);
  return (
    <Dialog open={open} onClose={onClose} title="Change Password">
      <div className="gm-wizard-stack">
        <div className="gm-field"><label>Current password</label><input className="gm-input w-100" type="password" value={current} onChange={e => setCurrent(e.target.value)} /></div>
        <div className="gm-field"><label>New password</label><input className="gm-input w-100" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /><small className="text-muted">Minimum 8 characters with uppercase, number and symbol</small></div>
        <div className="gm-field"><label>Confirm new password</label><input className="gm-input w-100" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />{confirm && newPw !== confirm && <small className="text-danger">Passwords do not match</small>}</div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" disabled={!current || !newPw || newPw !== confirm || newPw.length < 8} onClick={onClose}><Check /> Change password</button>
      </div>
    </Dialog>
  );
}

/* ── 15. Two-Factor Auth Dialog ──────────────────────────────────────────── */
export function TwoFactorDialog({
  open,
  enabled,
  onClose,
  onToggle,
}: {
  open: boolean;
  enabled: boolean;
  onClose: () => void;
  onToggle: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={enabled ? "Disable 2FA" : "Enable 2FA"}>
      <div className="gm-wizard-stack">
        <div className="text-center"><ShieldCheck width={48} height={48} style={{ color: enabled ? "var(--gm-clay-500)" : "var(--gm-leaf-500)" }} /></div>
        <p className="text-muted text-center">{enabled ? "Two-factor authentication adds an extra layer of security. Disabling it makes your account less secure." : "Two-factor authentication requires a code from your phone in addition to your password when logging in."}</p>
        {!enabled && <div className="gm-check-row"><Smartphone /><span><strong>Authenticator app</strong><small>Use Google Authenticator or Authy to generate codes</small></span></div>}
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className={`gm-btn gm-btn-sm ${enabled ? "gm-btn-danger" : "gm-btn-lime"}`} onClick={() => { onToggle(); onClose(); }}>{enabled ? "Disable 2FA" : "Enable 2FA"}</button>
      </div>
    </Dialog>
  );
}

/* ── 16. Activity Log Drawer ─────────────────────────────────────────────── */
export function ActivityLogDrawer({
  open,
  logs,
  onClose,
}: {
  open: boolean;
  logs: ActivityLog[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = logs.filter(l => `${l.user} ${l.action} ${l.details}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <DashboardDrawer open={open} title="Activity Log" onClose={onClose}>
      <div className="gm-wizard-stack">
        <div className="gm-search-wrap"><Search /><input className="gm-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search activity" /></div>
        {filtered.map(log => (
          <div key={log.id} className="gm-check-row">
            <Clock />
            <span><strong>{log.action}</strong><small>{log.user} · {log.date} · {log.ip}</small></span>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted text-center py-3 mb-0">No activity matches.</p>}
      </div>
    </DashboardDrawer>
  );
}

/* ── 17. Connected Apps Dialog ───────────────────────────────────────────── */
export function ConnectedAppsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Connected Apps">
      <div className="gm-wizard-stack">
        <p className="text-muted">Apps and services connected to your GrowMO account.</p>
        <div className="gm-check-row"><Smartphone /><span><strong>M-Pesa (Safaricom)</strong><small>Payments and wallet · Connected Oct 2024</small></span><StatusChip label="Active" tone="low" /></div>
        <div className="gm-check-row"><Globe /><span><strong>Google Calendar</strong><small>Task sync · Connected Aug 2026</small></span><StatusChip label="Active" tone="low" /></div>
        <div className="gm-check-row"><Mail /><span><strong>WhatsApp Business</strong><small>Buyer communication · Connected Sep 2026</small></span><StatusChip label="Active" tone="low" /></div>
      </div>
    </Dialog>
  );
}

/* ── 18. API Keys Dialog ─────────────────────────────────────────────────── */
export function ApiKeysDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title="API Keys">
      <div className="gm-wizard-stack">
        <p className="text-muted">Manage API keys for external integrations. Enterprise plan only.</p>
        <div className="gm-card p-3">
          <div className="gm-review-row"><span>Key name</span><strong>Farm Dashboard Integration</strong></div>
          <div className="gm-review-row"><span>Key</span><strong className="font-display">{show ? "grmo_sk_live_2026_abc123xyz" : "••••••••••••••••"}</strong></div>
          <div className="gm-review-row"><span>Created</span><strong>01 Oct 2026</strong></div>
          <div className="gm-review-row"><span>Last used</span><strong>Today</strong></div>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm mt-2" onClick={() => setShow(!show)}><Eye /> {show ? "Hide" : "Reveal"} key</button>
        </div>
      </div>
    </Dialog>
  );
}

/* ── 19. Session Management Dialog ───────────────────────────────────────── */
export function SessionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Active Sessions" wide>
      <div className="gm-wizard-stack">
        <p className="text-muted">Devices where your GrowMO account is currently logged in.</p>
        <div className="gm-check-row"><Smartphone /><span><strong>Samsung Galaxy A14 — Android</strong><small>Kiambu, Kenya · Active now · This device</small></span><StatusChip label="Current" tone="low" /></div>
        <div className="gm-check-row"><Globe /><span><strong>Chrome on Windows</strong><small>Nairobi, Kenya · 2 hours ago</small></span><button type="button" className="gm-btn gm-btn-danger-soft gm-btn-sm">Revoke</button></div>
        <div className="gm-check-row"><Globe /><span><strong>Safari on iPhone</strong><small>Kiambu, Kenya · Yesterday</small></span><button type="button" className="gm-btn gm-btn-danger-soft gm-btn-sm">Revoke</button></div>
      </div>
    </Dialog>
  );
}

/* ── 20. Danger Zone Drawer ──────────────────────────────────────────────── */
export function DangerZoneDrawer({
  open,
  onClose,
  onExport,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  return (
    <DashboardDrawer open={open} title="Danger Zone" onClose={onClose}>
      <div className="gm-wizard-stack">
        <div className="gm-alert-box is-danger"><Trash2 /><p><strong>Irreversible actions</strong><br />These actions cannot be undone. Please proceed with caution.</p></div>
        <div className="gm-card p-3">
          <h4 className="font-display mb-1">Export all data</h4>
          <p className="text-muted mb-2">Download a complete backup of your farm data, records and photos.</p>
          <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onExport}><Download /> Export data</button>
        </div>
        <div className="gm-card p-3">
          <h4 className="font-display mb-1">Delete account</h4>
          <p className="text-muted mb-2">Permanently delete your GrowMO account and all associated data. 30-day grace period.</p>
          <button type="button" className="gm-btn gm-btn-danger gm-btn-sm" onClick={onDelete}><Trash2 /> Delete account</button>
        </div>
      </div>
    </DashboardDrawer>
  );
}

/* ── 21. Language Dialog ─────────────────────────────────────────────────── */
export function LanguageDialog({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string;
  onClose: () => void;
  onSave: (lang: string) => void;
}) {
  const [lang, setLang] = useState(current);
  useEffect(() => { if (open) setLang(current); }, [open, current]);
  return (
    <Dialog open={open} onClose={onClose} title="Language & Region">
      <div className="gm-wizard-stack">
        <div className="gm-field"><label>Language</label>
          <select className="gm-select w-100" value={lang} onChange={e => setLang(e.target.value)}>
            {["English / Kiswahili","English","Kiswahili","Kikuyu","Luo","Kalenjin","Kamba","Meru"].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="gm-field"><label>Date format</label>
          <select className="gm-select w-100"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
        </div>
        <div className="gm-field"><label>Currency</label>
          <select className="gm-select w-100"><option>KES (Kenyan Shilling)</option><option>USD</option><option>UGX</option></select>
        </div>
      </div>
      <div className="d-flex gap-2 justify-content-end mt-3">
        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onClose}>Cancel</button>
        <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => { onSave(lang); onClose(); }}><Check /> Save</button>
      </div>
    </Dialog>
  );
}