/* ============================================================================
   PAGE 15 — SETTINGS, TEAM & PERMISSIONS (ENHANCED)  (/app/settings)

   Account management, team collaboration, and data control.
   15.1 Profile Settings       15.2 Farm Settings
   15.3 Team Management        15.4 Notification Preferences
   15.5 Data & Privacy         15.6 Subscription Plans
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
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
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  ActivityLogDrawer,
  AddTeamMemberWizard,
  ApiKeysDialog,
  ChangePasswordDialog,
  ConfirmSettingsDialog,
  ConnectedAppsDialog,
  DangerZoneDrawer,
  DeleteAccountDialog,
  EditTeamMemberDialog,
  ExportDataDialog,
  FarmSettingsDialog,
  LanguageDialog,
  NotificationPrefsDialog,
  PermissionMatrixDialog,
  PlotEditDialog,
  PrivacySettingsDialog,
  ProfileEditWizard,
  SessionsDialog,
  SubscriptionPlanDialog,
  TeamMemberDrawer,
  TwoFactorDialog,
  UpgradeWizard,
} from "../../components/app/SettingsModals";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  ACTIVITY_LOGS,
  CURRENT_PLAN,
  FARM_SETTINGS,
  NOTIFICATION_PREFS,
  PERMISSION_FEATURES,
  PERMISSION_MATRIX,
  PLAN_FEATURES,
  PLAN_PRICE,
  PRIVACY_SETTINGS,
  TEAM_MEMBERS,
  USER_PROFILE,
  type ActivityLog,
  type FarmPlot,
  type FarmSettings,
  type NotificationPref,
  type PrivacySetting,
  type SettingsView,
  type TeamMember,
  type UserProfile,
} from "../../data/app/settings";
import { kes } from "../../data/site";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

type ModalId =
  | "profile-edit"
  | "farm-settings"
  | "plot-edit"
  | "plot-add"
  | "team-add"
  | "team-edit"
  | "team-remove"
  | "permission-matrix"
  | "notification-prefs"
  | "privacy-settings"
  | "export-data"
  | "delete-account"
  | "plan-free"
  | "plan-premium"
  | "plan-enterprise"
  | "upgrade"
  | "change-password"
  | "two-factor"
  | "connected-apps"
  | "api-keys"
  | "sessions"
  | "language"
  | "danger-zone"
  | null;

function SettingsPage() {
  const [view, setView] = useState<SettingsView>("profile");
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);

  /* State */
  const [profile, setProfile] = useState<UserProfile>(USER_PROFILE);
  const [farm, setFarm] = useState<FarmSettings>(FARM_SETTINGS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPref[]>(NOTIFICATION_PREFS);
  const [privacySettings, setPrivacySettings] =
    useState<PrivacySetting[]>(PRIVACY_SETTINGS);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  /* Selection */
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [dangerDrawerOpen, setDangerDrawerOpen] = useState(false);

  const openModal = (next: Exclude<ModalId, null>) => setModal(next);
  const closeModal = () => setModal(null);

  /* Team search/filter */
  const [teamQuery, setTeamQuery] = useState("");
  const [teamRole, setTeamRole] = useState("all");
  const [teamPage, setTeamPage] = useState(1);
  const filteredTeam = team.filter(
    (m) =>
      `${m.name} ${m.phone} ${m.role}`
        .toLowerCase()
        .includes(teamQuery.toLowerCase()) &&
      (teamRole === "all" || m.role === teamRole),
  );
  const teamPerPage = 6;
  const teamTotalPages = Math.max(1, Math.ceil(filteredTeam.length / teamPerPage));
  const teamRows = filteredTeam.slice(
    (teamPage - 1) * teamPerPage,
    teamPage * teamPerPage,
  );

  const handleSaveMember = (member: TeamMember) => {
    setTeam((t) =>
      t.some((m) => m.id === member.id)
        ? t.map((m) => (m.id === member.id ? member : m))
        : [member, ...t],
    );
  };

  const handleRemoveMember = () => {
    if (!selectedMember) return;
    setTeam((t) => t.filter((m) => m.id !== selectedMember.id));
    setMemberDrawerOpen(false);
  };

  const handleSavePlot = (plot: FarmPlot) => {
    setFarm((f) => ({
      ...f,
      plots: f.plots.some((p) => p.id === plot.id)
        ? f.plots.map((p) => (p.id === plot.id ? plot : p))
        : [...f.plots, plot],
    }));
  };

  const navItems = [
    { id: "profile" as const, label: "Profile", icon: <Users /> },
    { id: "farm" as const, label: "Farm", icon: <MapPin /> },
    { id: "team" as const, label: "Team", icon: <UserPlus />, count: team.length },
    { id: "notifications" as const, label: "Notifications", icon: <Bell />, count: notifPrefs.filter((p) => p.enabled).length },
    { id: "privacy" as const, label: "Data & Privacy", icon: <ShieldCheck /> },
    { id: "subscription" as const, label: "Subscription", icon: <Star /> },
  ];

  return (
    <main className="gm-app-page gm-settings-page">
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
            <strong>Settings</strong>
          </div>
          <div className="gm-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((c) => !c)} aria-expanded={menu}>
              <MoreHorizontal /> More settings
            </button>
            {menu ? (
              <div className="gm-dropdown gm-settings-menu">
                <button type="button" onClick={() => { openModal("change-password"); setMenu(false); }}><Key /> Change password</button>
                <button type="button" onClick={() => { openModal("two-factor"); setMenu(false); }}><ShieldCheck /> Two-factor auth</button>
                <button type="button" onClick={() => { openModal("sessions"); setMenu(false); }}><Smartphone /> Active sessions</button>
                <button type="button" onClick={() => { openModal("connected-apps"); setMenu(false); }}><Globe /> Connected apps</button>
                <button type="button" onClick={() => { openModal("language"); setMenu(false); }}><Globe /> Language & region</button>
                <button type="button" onClick={() => { setActivityDrawerOpen(true); setMenu(false); }}><Clock /> Activity log</button>
                <button type="button" onClick={() => { setDangerDrawerOpen(true); setMenu(false); }}><Trash2 /> Danger zone</button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Profile summary card */}
        <div className="gm-card p-3 mb-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="gm-avatar-lg">{profile.avatar}</span>
            <div style={{ flex: 1 }}>
              <h2 className="font-display mb-0">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-muted mb-0">
                {profile.phone} · {profile.ward}, {profile.subCounty},{" "}
                {profile.county} · {CURRENT_PLAN} plan
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="gm-btn gm-btn-soft gm-btn-sm" onClick={() => openModal("profile-edit")}><Edit3 /> Edit profile</button>
              <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => openModal("change-password")}><Lock /> Security</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="gm-card p-2">
          <PlannerSubtabs value={view} items={navItems} onChange={setView} label="Settings sections" />
        </div>

        <Reveal className="mt-4">
          {view === "profile" ? (
            <ProfileView profile={profile} onEdit={() => openModal("profile-edit")} onChangePassword={() => openModal("change-password")} on2FA={() => openModal("two-factor")} twoFactor={twoFactorEnabled} onSessions={() => openModal("sessions")} onLanguage={() => openModal("language")} onConnectedApps={() => openModal("connected-apps")} />
          ) : null}
          {view === "farm" ? (
            <FarmView farm={farm} onEditFarm={() => openModal("farm-settings")} onEditPlot={(plot) => { setSelectedPlot(plot); openModal("plot-edit"); }} onAddPlot={() => { setSelectedPlot(null); openModal("plot-add"); }} />
          ) : null}
          {view === "team" ? (
            <TeamView team={teamRows} allTeam={team} totalFiltered={filteredTeam.length} query={teamQuery} roleFilter={teamRole} page={teamPage} totalPages={teamTotalPages} perPage={teamPerPage} onQuery={(q) => { setTeamQuery(q); setTeamPage(1); }} onRole={(r) => { setTeamRole(r); setTeamPage(1); }} onPage={setTeamPage} onAdd={() => openModal("team-add")} onMember={(m) => { setSelectedMember(m); setMemberDrawerOpen(true); }} onEdit={(m) => { setSelectedMember(m); openModal("team-edit"); }} onMatrix={() => openModal("permission-matrix")} />
          ) : null}
          {view === "notifications" ? (
            <NotificationsView prefs={notifPrefs} onEdit={() => openModal("notification-prefs")} />
          ) : null}
          {view === "privacy" ? (
            <PrivacyView settings={privacySettings} onEdit={() => openModal("privacy-settings")} onExport={() => openModal("export-data")} onDelete={() => openModal("delete-account")} />
          ) : null}
          {view === "subscription" ? (
            <SubscriptionView current={CURRENT_PLAN} onPlan={(plan) => openModal(plan.toLowerCase() as ModalId)} onUpgrade={(plan) => { openModal("upgrade"); }} />
          ) : null}
        </Reveal>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <ProfileEditWizard open={modal === "profile-edit"} profile={profile} onClose={closeModal} onSave={setProfile} />
      <FarmSettingsDialog open={modal === "farm-settings"} farm={farm} onClose={closeModal} onSave={setFarm} />
      <PlotEditDialog open={modal === "plot-edit" || modal === "plot-add"} plot={modal === "plot-edit" ? selectedPlot : null} onClose={closeModal} onSave={handleSavePlot} />
      <AddTeamMemberWizard open={modal === "team-add"} onClose={closeModal} onSave={handleSaveMember} />
      <EditTeamMemberDialog open={modal === "team-edit"} member={selectedMember} onClose={closeModal} onSave={handleSaveMember} />
      <ConfirmSettingsDialog open={modal === "team-remove"} title="Remove team member?" body={`Remove ${selectedMember?.name} from your farm team? They will lose access immediately.`} confirmLabel="Remove member" destructive onClose={closeModal} onConfirm={handleRemoveMember} />
      <PermissionMatrixDialog open={modal === "permission-matrix"} matrix={PERMISSION_MATRIX} features={PERMISSION_FEATURES} onClose={closeModal} />
      <NotificationPrefsDialog open={modal === "notification-prefs"} prefs={notifPrefs} onClose={closeModal} onSave={setNotifPrefs} />
      <PrivacySettingsDialog open={modal === "privacy-settings"} settings={privacySettings} onClose={closeModal} onSave={setPrivacySettings} />
      <ExportDataDialog open={modal === "export-data"} onClose={closeModal} />
      <DeleteAccountDialog open={modal === "delete-account"} onClose={closeModal} />
      <SubscriptionPlanDialog open={modal === "plan-free" ? "Free" : modal === "plan-premium" ? "Premium" : modal === "plan-enterprise" ? "Enterprise" : null} current={CURRENT_PLAN} onClose={closeModal} onUpgrade={() => openModal("upgrade")} />
      <UpgradeWizard open={modal === "upgrade"} targetPlan="Premium" onClose={closeModal} onComplete={closeModal} />
      <ChangePasswordDialog open={modal === "change-password"} onClose={closeModal} />
      <TwoFactorDialog open={modal === "two-factor"} enabled={twoFactorEnabled} onClose={closeModal} onToggle={() => setTwoFactorEnabled((e) => !e)} />
      <ConnectedAppsDialog open={modal === "connected-apps"} onClose={closeModal} />
      <ApiKeysDialog open={modal === "api-keys"} onClose={closeModal} />
      <SessionsDialog open={modal === "sessions"} onClose={closeModal} />
      <LanguageDialog open={modal === "language"} current={profile.language} onClose={closeModal} onSave={(lang) => setProfile((p) => ({ ...p, language: lang }))} />

      {/* Drawers */}
      <TeamMemberDrawer open={memberDrawerOpen} member={selectedMember} onClose={() => setMemberDrawerOpen(false)} onEdit={() => { setMemberDrawerOpen(false); openModal("team-edit"); }} onRemove={() => { setMemberDrawerOpen(false); openModal("team-remove"); }} />
      <ActivityLogDrawer open={activityDrawerOpen} logs={ACTIVITY_LOGS} onClose={() => setActivityDrawerOpen(false)} />
      <DangerZoneDrawer open={dangerDrawerOpen} onClose={() => setDangerDrawerOpen(false)} onExport={() => { setDangerDrawerOpen(false); openModal("export-data"); }} onDelete={() => { setDangerDrawerOpen(false); openModal("delete-account"); }} />
    </main>
  );
}

/* ========================================================================
   SUB-VIEWS
   ======================================================================== */

/* ── 15.1 Profile ────────────────────────────────────────────────────────── */
function ProfileView({
  profile, onEdit, onChangePassword, on2FA, twoFactor, onSessions, onLanguage, onConnectedApps,
}: {
  profile: UserProfile; onEdit: () => void; onChangePassword: () => void; on2FA: () => void; twoFactor: boolean; onSessions: () => void; onLanguage: () => void; onConnectedApps: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader eyebrow="15.1 · Profile settings" title="Your personal information" subtitle="Manage your profile details, security settings and connected accounts." action={<button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onEdit}><Edit3 /> Edit profile</button>} />
      <div className="row g-3 mt-3">
        <div className="col-xl-8">
          <div className="gm-card p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="gm-avatar-lg">{profile.avatar}</span>
              <div><h3 className="font-display mb-0">{profile.firstName} {profile.lastName}</h3><span className="gm-eyebrow">Farmer · {profile.county}</span></div>
            </div>
            <div className="gm-review-card">
              <div className="gm-review-row"><span>Phone</span><strong>{profile.phone}</strong></div>
              <div className="gm-review-row"><span>Email</span><strong>{profile.email}</strong></div>
              <div className="gm-review-row"><span>National ID</span><strong>{profile.nationalId}</strong></div>
              <div className="gm-review-row"><span>Gender</span><strong>{profile.gender}</strong></div>
              <div className="gm-review-row"><span>Date of birth</span><strong>{profile.dateOfBirth}</strong></div>
              <div className="gm-review-row"><span>Location</span><strong>{profile.village}, {profile.ward}, {profile.subCounty}, {profile.county}</strong></div>
              <div className="gm-review-row"><span>Language</span><strong>{profile.language}</strong></div>
            </div>
          </div>
        </div>
        <div className="col-xl-4">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Security</span>
            <h3 className="font-display mb-2">Account protection</h3>
            <div className="d-flex flex-column gap-2">
              <button type="button" className="gm-action-card" onClick={onChangePassword}><Lock /><span><strong>Change password</strong><small>Last changed 30 days ago</small></span><ChevronRight /></button>
              <button type="button" className="gm-action-card" onClick={on2FA}><ShieldCheck /><span><strong>Two-factor auth</strong><small>{twoFactor ? "Enabled" : "Disabled"}</small></span><ChevronRight /></button>
              <button type="button" className="gm-action-card" onClick={onSessions}><Smartphone /><span><strong>Active sessions</strong><small>3 devices</small></span><ChevronRight /></button>
              <button type="button" className="gm-action-card" onClick={onConnectedApps}><Globe /><span><strong>Connected apps</strong><small>3 integrations</small></span><ChevronRight /></button>
              <button type="button" className="gm-action-card" onClick={onLanguage}><Globe /><span><strong>Language & region</strong><small>{profile.language}</small></span><ChevronRight /></button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 15.2 Farm Settings ──────────────────────────────────────────────────── */
function FarmView({
  farm, onEditFarm, onEditPlot, onAddPlot,
}: {
  farm: FarmSettings; onEditFarm: () => void; onEditPlot: (plot: FarmPlot) => void; onAddPlot: () => void;
}) {
  return (
    <>
      <DashboardSectionHeader eyebrow="15.2 · Farm settings" title="Manage your farm and plots" subtitle="Edit farm details, plot information, soil data and GPS coordinates." action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onEditFarm}><Settings2 /> Farm settings</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onAddPlot}><Plus /> Add plot</button></div>} />
      <div className="gm-stat-grid mt-3">
        <DashboardMetric icon={MapPin} label="Farm name" value={farm.farmName} note={farm.farmType} />
        <DashboardMetric icon={Layers} label="Total acreage" value={farm.totalAcreage} note={`${farm.plots.length} plots`} />
        <DashboardMetric icon={CheckCircle2} label="Active plots" value={`${farm.plots.filter((p) => p.status === "Active").length}`} note={`of ${farm.plots.length} total`} />
        <DashboardMetric icon={FileText} label="Registration" value={farm.registrationNumber} note="County registration" />
      </div>
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
          <div><span className="gm-eyebrow">Plots</span><h3 className="font-display mb-1">All plots and greenhouses</h3></div>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Plot</th><th>Size</th><th>Soil</th><th>Water source</th><th>GPS</th><th>Last test</th><th>Status</th><th /></tr></thead>
            <tbody>
              {farm.plots.map((plot) => (
                <tr key={plot.id}>
                  <td><strong>{plot.name}</strong><small className="d-block text-muted">{plot.crops.join(", ")}</small></td>
                  <td>{plot.size}</td>
                  <td><small>{plot.soilType}</small></td>
                  <td><small>{plot.waterSource}</small></td>
                  <td><code className="gm-code-chip">{plot.gps}</code></td>
                  <td><small>{plot.lastSoilTest}</small></td>
                  <td><StatusChip label={plot.status} tone={plot.status === "Active" ? "low" : plot.status === "Planned" ? "medium" : "neutral"} /></td>
                  <td><button type="button" className="gm-icon-btn" onClick={() => onEditPlot(plot)}><Pencil /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── 15.3 Team Management ────────────────────────────────────────────────── */
function TeamView({
  team, allTeam, totalFiltered, query, roleFilter, page, totalPages, perPage, onQuery, onRole, onPage, onAdd, onMember, onEdit, onMatrix,
}: {
  team: TeamMember[]; allTeam: TeamMember[]; totalFiltered: number; query: string; roleFilter: string; page: number; totalPages: number; perPage: number; onQuery: (q: string) => void; onRole: (r: string) => void; onPage: (p: number) => void; onAdd: () => void; onMember: (m: TeamMember) => void; onEdit: (m: TeamMember) => void; onMatrix: () => void;
}) {
  const roles = [...new Set(allTeam.map((m) => m.role))];
  return (
    <>
      <DashboardSectionHeader eyebrow="15.3 · Team management" title="Your farm team" subtitle={`${allTeam.length} members · ${allTeam.filter((m) => m.status === "Active").length} active`} action={<div className="d-flex flex-wrap gap-2"><button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={onMatrix}><Grid3X3 /> Permission matrix</button><button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onAdd}><UserPlus /> Add member</button></div>} />
      <div className="gm-card p-3 mt-3">
        <div className="d-flex flex-wrap align-items-end gap-2 mb-3">
          <div className="gm-search-wrap" style={{ flex: "1 1 280px" }}><Search /><input className="gm-input" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search name, phone or role" /></div>
          <select className="gm-select" value={roleFilter} onChange={(e) => onRole(e.target.value)}>
            <option value="all">All roles</option>
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Member</th><th>Role</th><th>Plots</th><th>Financial</th><th>Payments</th><th>Status</th><th>Last active</th><th /></tr></thead>
            <tbody>
              {team.map((m) => (
                <tr key={m.id}>
                  <td>
                    <button type="button" className="gm-table-link text-start" onClick={() => onMember(m)}>
                      <strong>{m.name}</strong>
                      <small className="d-block text-muted">{m.phone}</small>
                    </button>
                  </td>
                  <td><StatusChip label={m.role} tone={m.role === "Owner" ? "low" : m.role === "Farm Manager" ? "medium" : "neutral"} /></td>
                  <td><small>{m.plotsAccessible}</small></td>
                  <td><StatusChip label={m.financialAccess} tone={m.financialAccess === "Full" ? "medium" : m.financialAccess === "View only" ? "neutral" : "neutral"} /></td>
                  <td><small>{m.paymentAuthority}</small></td>
                  <td><StatusChip label={m.status} tone={m.status === "Active" ? "low" : m.status === "Invited" ? "medium" : "neutral"} /></td>
                  <td><small>{m.lastActive}</small></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button type="button" className="gm-icon-btn" onClick={() => onEdit(m)}><Pencil /></button>
                      <button type="button" className="gm-icon-btn" onClick={() => onMember(m)}><Eye /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {team.length === 0 ? <p className="text-muted text-center py-4 mb-0">No team member matches.</p> : null}
        <Pagination page={Math.min(page, totalPages)} total={totalPages} onChange={onPage} perPage={perPage} totalItems={totalFiltered} />
      </div>
    </>
  );
}

/* ── 15.4 Notifications ──────────────────────────────────────────────────── */
function NotificationsView({ prefs, onEdit }: { prefs: NotificationPref[]; onEdit: () => void }) {
  const channels = ["Push", "SMS", "WhatsApp", "Email"] as const;
  return (
    <>
      <DashboardSectionHeader eyebrow="15.4 · Notification preferences" title="Choose how you get notified" subtitle="Control which alerts you receive and on which channel." action={<button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onEdit}><Edit3 /> Edit preferences</button>} />
      {channels.map((ch) => (
        <div className="gm-card p-3 mt-3" key={ch}>
          <h4 className="font-display mb-2">{ch}</h4>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead><tr><th>Type</th><th>Note</th><th>Status</th></tr></thead>
              <tbody>
                {prefs.filter((p) => p.channel === ch).map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.type}</strong></td>
                    <td><small className="text-muted">{p.note}</small></td>
                    <td><StatusChip label={p.enabled ? "On" : "Off"} tone={p.enabled ? "low" : "neutral"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

/* ── 15.5 Data & Privacy ─────────────────────────────────────────────────── */
function PrivacyView({ settings, onEdit, onExport, onDelete }: { settings: PrivacySetting[]; onEdit: () => void; onExport: () => void; onDelete: () => void }) {
  return (
    <>
      <DashboardSectionHeader eyebrow="15.5 · Data & privacy" title="Control your data" subtitle="Manage who can see your farm data and how it's used." action={<button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={onEdit}><Settings2 /> Edit privacy</button>} />
      <div className="gm-card p-3 mt-3">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Setting</th><th>Description</th><th>Current</th><th>Status</th></tr></thead>
            <tbody>
              {settings.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.setting}</strong></td>
                  <td><small className="text-muted">{s.description}</small></td>
                  <td><strong>{s.value}</strong></td>
                  <td><StatusChip label={s.enabled ? "Enabled" : "Disabled"} tone={s.enabled ? "low" : "neutral"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100">
            <span className="gm-eyebrow">Export</span>
            <h3 className="font-display mb-2">Download your data</h3>
            <p className="text-muted">Export a complete backup of your farm data, records and photos as a ZIP file.</p>
            <button type="button" className="gm-btn gm-btn-outline" onClick={onExport}><Download /> Export all data</button>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-4 h-100" style={{ borderLeft: "3px solid var(--gm-clay-500)" }}>
            <span className="gm-eyebrow">Danger</span>
            <h3 className="font-display mb-2">Delete account</h3>
            <p className="text-muted">Permanently delete your GrowMO account. 30-day grace period. Cannot be undone.</p>
            <button type="button" className="gm-btn gm-btn-danger" onClick={onDelete}><Trash2 /> Delete account</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 15.6 Subscription ───────────────────────────────────────────────────── */
function SubscriptionView({ current, onPlan, onUpgrade }: { current: string; onPlan: (plan: string) => void; onUpgrade: (plan: string) => void }) {
  const plans = [
    { name: "Free", label: "Mbegu (Seed)", price: "Free", period: "forever", desc: "Everything a starting farmer needs.", popular: false },
    { name: "Premium", label: "Mavuno (Harvest)", price: "KES 299", period: "/month", desc: "For serious commercial farmers.", popular: true },
    { name: "Enterprise", label: "Chama / Cooperative", price: "KES 999", period: "/month", desc: "Run your whole group.", popular: false },
  ];
  return (
    <>
      <DashboardSectionHeader eyebrow="15.6 · Subscription plans" title="Choose your plan" subtitle={`Current plan: ${current}`} />
      <div className="row g-3 mt-3">
        {plans.map((plan) => (
          <div className="col-xl-4" key={plan.name}>
            <div className={`gm-pricing ${plan.popular ? "popular" : ""} h-100`}>
              {plan.popular ? <span className="gm-chip gm-chip-lime">Most popular</span> : null}
              <h3 className="font-display">{plan.label}</h3>
              <div className="gm-price-big font-display">{plan.price}<small>{plan.period}</small></div>
              <p className="text-muted">{plan.desc}</p>
              <ul className="gm-check-list">
                {PLAN_FEATURES.slice(0, 6).map((f) => (
                  <li key={f.feature}><strong>{f.feature}</strong>: {plan.name === "Free" ? f.free : plan.name === "Premium" ? f.premium : f.enterprise}</li>
                ))}
              </ul>
              <button type="button" className={`gm-btn w-100 mt-2 ${plan.name === current ? "gm-btn-dark" : plan.popular ? "gm-btn-lime" : "gm-btn-outline"}`} onClick={() => plan.name === current ? onPlan(plan.name) : onUpgrade(plan.name)}>
                {plan.name === current ? "Current plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="gm-card p-3 mt-3">
        <h4 className="font-display mb-2">Feature comparison</h4>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead><tr><th>Feature</th><th>Free</th><th>Premium</th><th>Enterprise</th></tr></thead>
            <tbody>
              {PLAN_FEATURES.map((f) => (
                <tr key={f.feature}>
                  <td><strong>{f.feature}</strong></td>
                  <td>{f.free}</td>
                  <td className={f.premium === "✅" ? "text-success" : ""}>{f.premium}</td>
                  <td className={f.enterprise === "✅" ? "text-success" : ""}>{f.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Clock(props: any) {
  return <BarChart3 {...props} />;
}