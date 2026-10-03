/* ============================================================================
   PAGE 15 — SETTINGS, TEAM & PERMISSIONS  (/app/settings)

   Blueprint sections implemented
   15.1 Profile settings        15.2 Farm settings
   15.3 Team management         — roles, invitation flow, permission matrix and
        the advanced HR block (worker directory, recruitment & onboarding,
        attendance, performance, payroll, advances, compliance, labour analytics)
   15.4 Notification preferences 15.5 Data & privacy
   15.6 Subscription plans

   The page keeps team, plots, notification and plan choices in local state:
   inviting someone, changing a role, moving a plot, running payroll or starting
   a deletion all change what is on the screen.
   ========================================================================== */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CalendarClock,
  CreditCard,
  Download,
  FileSpreadsheet,
  HelpCircle,
  LayoutGrid,
  MoreHorizontal,
  Printer,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { DashboardMetric, DashboardSectionHeader } from "../../components/dashboard/pages/DashboardWidgets";
import {
  ReportPreviewDrawer,
  ReportTools,
  type ReportDefinition,
} from "../../components/dashboard/pages/ReportActions";
import { PlannerSubtabs } from "../../components/dashboard/pages/PlannerWidgets";
import {
  ConfirmSettingsDialog,
  DataActionDialog,
  FarmPlotDialog,
  InviteMemberDialog,
  JobPostDialog,
  MemberDialog,
  OnboardingDialog,
  PayrollDialog,
  PlanDialog,
  ProfileEditDialog,
  WorkerDialog,
} from "../../components/dashboard/pages/SettingsModals";
import {
  DataRow,
  FarmDefaults,
  FarmPlotCard,
  HrPanel,
  KvList,
  NotifRow,
  PermissionMatrix,
  PlanCard,
  PlanComparison,
  ProfileCard,
  ProfileFieldGroups,
  RoleLegend,
  SettingsFaqList,
  SettingsGlossary,
  SettingsHero,
  TeamMemberCard,
} from "../../components/dashboard/pages/SettingsWidgets";
import type { FarmPlot, TeamMember, Worker } from "../../data/app/settings";
import {
  DATA_SETTINGS,
  FARM_PLOTS,
  NOTIF_PREFS,
  PERM_MATRIX,
  PERM_MATRIX_KEYS,
  PLAN_COMPARISON_ROWS,
  PLANS,
  PROFILE_FIELDS,
  ROLES,
  SETTINGS_CONTEXT,
  SETTINGS_FAQ,
  SETTINGS_GLOSSARY,
  TEAM_MEMBERS,
  WORKERS,
} from "../../data/app/settings";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Settings, team & permissions — GrowMO" }] }),
});

type SettingsView = "profile" | "farm" | "team" | "hr" | "notifications" | "data" | "plan" | "faq";

function SettingsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<SettingsView>("profile");
  const [ctx, setCtx] = useState(SETTINGS_CONTEXT);
  const [members, setMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [plots, setPlots] = useState<FarmPlot[]>(FARM_PLOTS);
  const [notifs, setNotifs] = useState(NOTIF_PREFS);
  const [plan, setPlan] = useState(SETTINGS_CONTEXT.plan);
  const [menu, setMenu] = useState(false);
  const [reportPreview, setReportPreview] = useState<ReportDefinition | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [activePlot, setActivePlot] = useState<FarmPlot | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [dataAction, setDataAction] = useState<string | null>(null);
  const [activeWorker, setActiveWorker] = useState<Worker | null>(null);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string; body: string; label: string; run: () => void } | null>(null);

  const activePlan = PLANS.find((p) => p.id === plan) ?? PLANS[1];
  const payrollTotal = 9312.5;

  const profileReport: ReportDefinition = {
    id: "farm-profile",
    title: "Farm profile & access record",
    filename: "growmo-farm-profile",
    description: "Farm owner profile, location, operating preferences and account security settings.",
    columns: [{ key: "group", label: "Group" }, { key: "field", label: "Field" }, { key: "value", label: "Value" }],
    rows: PROFILE_FIELDS.map((field) => ({ group: field.group, field: field.k, value: field.v })),
  };
  const plotsReport: ReportDefinition = {
    id: "farm-plots",
    title: "Farm plots & settings",
    filename: "growmo-farm-plots",
    description: "Active plot records with crop, soil, planting and expected harvest information.",
    columns: [{ key: "plot", label: "Plot" }, { key: "crop", label: "Crop" }, { key: "size", label: "Size" }, { key: "soil", label: "Soil / pH" }, { key: "planted", label: "Planted" }, { key: "harvest", label: "Harvest" }, { key: "status", label: "Status" }],
    rows: plots.map((plot) => ({ plot: plot.name, crop: plot.crop, size: plot.size, soil: `${plot.soil} · pH ${plot.ph}`, planted: plot.planted, harvest: plot.harvest, status: plot.status })),
  };
  const teamReport: ReportDefinition = {
    id: "team-roster",
    title: "Team roster & authority",
    filename: "growmo-team-roster",
    description: "Current team access, role assignments, plot scope and payment authority.",
    columns: [{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "phone", label: "Phone" }, { key: "status", label: "Status" }, { key: "plots", label: "Plots" }, { key: "financial", label: "Financial access" }, { key: "authority", label: "Payment authority" }, { key: "validity", label: "Valid until" }],
    rows: members.map((member) => ({ name: member.name, role: ROLES.find((role) => role.key === member.role)?.label ?? member.role, phone: member.phone, status: member.status, plots: member.plots, financial: member.financial, authority: member.paymentAuthority, validity: member.validUntil })),
  };
  const permissionsReport: ReportDefinition = {
    id: "permission-matrix",
    title: "Role permission matrix",
    filename: "growmo-role-permissions",
    description: "Full, limited and unavailable permission levels for every farm role.",
    columns: [{ key: "feature", label: "Feature" }, ...PERM_MATRIX_KEYS.map((role) => ({ key: role, label: ROLES.find((entry) => entry.key === role)?.label ?? role }))],
    rows: PERM_MATRIX.map((row) => ({
      feature: row.feature,
      ...Object.fromEntries(PERM_MATRIX_KEYS.map((role) => [role, row.cells[role] === "y" ? "Full" : row.cells[role] === "l" ? "Limited" : "No access"])),
    })),
  };
  const notificationsReport: ReportDefinition = {
    id: "notification-preferences",
    title: "Notification preferences",
    filename: "growmo-notification-preferences",
    description: "Message channels currently enabled for every farm alert and report type.",
    columns: [{ key: "type", label: "Notification" }, { key: "description", label: "Description" }, { key: "push", label: "Push" }, { key: "sms", label: "SMS" }, { key: "whatsapp", label: "WhatsApp" }, { key: "email", label: "Email" }],
    rows: notifs.map((row) => ({ type: row.label, description: row.desc, push: row.channels.push, sms: row.channels.sms, whatsapp: row.channels.wa, email: row.channels.email })),
  };
  const privacyReport: ReportDefinition = {
    id: "data-privacy-settings",
    title: "Data & privacy settings",
    filename: "growmo-data-privacy-settings",
    description: "Data sharing, retention and export controls configured for this farm account.",
    columns: [{ key: "setting", label: "Setting" }, { key: "detail", label: "Detail" }, { key: "action", label: "Available action" }],
    rows: DATA_SETTINGS.map((row) => ({ setting: row.label, detail: row.desc, action: row.action })),
  };
  const plansReport: ReportDefinition = {
    id: "plan-comparison",
    title: "Plan feature comparison",
    filename: "growmo-plan-feature-comparison",
    description: "GrowMO plan limits and feature availability across Free, Premium and Enterprise.",
    columns: [{ key: "feature", label: "Feature" }, { key: "free", label: "Free" }, { key: "premium", label: "Premium" }, { key: "enterprise", label: "Enterprise" }],
    rows: PLAN_COMPARISON_ROWS.map((row) => ({ feature: row.feature, free: row.free, premium: row.premium, enterprise: row.enterprise })),
  };
  const settingsReport: ReportDefinition = {
    id: "settings-summary",
    title: "Settings summary",
    filename: "growmo-settings-summary",
    description: "A shareable summary of the farm account, plan, team and plot configuration.",
    columns: [{ key: "area", label: "Area" }, { key: "record", label: "Record" }, { key: "value", label: "Current value" }],
    rows: [
      { area: "Farm", record: "Farm name", value: ctx.farmName },
      { area: "Farm", record: "Location", value: `${ctx.ward}, ${ctx.subCounty}, ${ctx.county}` },
      { area: "Account", record: "Plan", value: activePlan.name },
      { area: "Account", record: "Team members", value: members.length },
      { area: "Farm", record: "Plots", value: plots.length },
      { area: "Security", record: "Two-factor login", value: ctx.twoFactor },
    ],
  };

  function exportTeam() {
    setMenu(false);
    setReportPreview(teamReport);
  }

  return (
    <main className="gm-app-page gm-settings-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/dashboard/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Manage</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Settings, team & permissions</strong>
          </div>
          <div className="gm-settings-tools">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((current) => !current)} aria-expanded={menu}>
              <MoreHorizontal /> Settings tools
            </button>
            {menu ? (
              <div className="gm-settings-menu">
                <div className="gm-settings-menu-group">
                  <div className="gm-settings-menu-label">Team Management</div>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { setInviteOpen(true); setMenu(false); }}>
                    <UserPlus /> Invite a team member
                  </button>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { exportTeam(); setMenu(false); }}>
                    <FileSpreadsheet /> Preview team roster report
                  </button>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { setJobOpen(true); setMenu(false); }}>
                    <CalendarClock /> Post a farm job
                  </button>
                </div>
                <div className="gm-settings-menu-group">
                  <div className="gm-settings-menu-label">Financial</div>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { setPlanOpen(true); setMenu(false); }}>
                    <CreditCard /> Plans & billing
                  </button>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { navigate({ to: "/dashboard/wallet" }); }}>
                    <Download /> Open the wallet
                  </button>
                </div>
                <div className="gm-settings-menu-group">
                  <div className="gm-settings-menu-label">System</div>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { setView("data"); setMenu(false); toast.notify("Opened data & privacy.", "info"); }}>
                    <ShieldCheck /> Data & privacy
                  </button>
                  <button type="button" className="gm-settings-menu-item" onClick={() => { setReportPreview(settingsReport); setMenu(false); }}>
                    <Printer /> Preview settings report
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <SettingsHero ctx={{ ...ctx, plan, members: members.length, plots: plots.length }} onInvite={() => setInviteOpen(true)} onUpgrade={() => setPlanOpen(true)} />

        {/* KPI band */}
        <div className="row g-3 mt-3">
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={Users} label="Team members" value={String(members.length)} note={`${members.filter((m) => m.status === "Active").length} active · ${members.filter((m) => m.status !== "Active").length} pending or suspended`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={Building2} label="Plots & crops" value={`${plots.length} plots`} note={`${ctx.acres} acres · ${new Set(plots.map((p) => p.crop.split(" ")[0])).size} crops in rotation`} />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={ShieldCheck} label="Permissions set" value="13 features" note="6 roles · only the owner can edit the matrix" />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetric icon={CreditCard} label="Subscription" value={activePlan.price === 0 ? "Free" : `${kes(activePlan.price)}/mo`} note={`${activePlan.name} · renews 1 Nov 2026 via M-Pesa`} />
          </div>
        </div>

        <div className="mt-4">
          <PlannerSubtabs
            label="Settings sections"
            value={view}
            onChange={(next) => setView(next)}
            items={[
              { id: "profile", label: "Profile", icon: <LayoutGrid /> },
              { id: "farm", label: "Farm & plots" },
              { id: "team", label: "Team & roles", icon: <Users />, count: members.length },
              { id: "hr", label: "Labour & HR" },
              { id: "notifications", label: "Notifications", icon: <Bell /> },
              { id: "data", label: "Data & privacy", icon: <ShieldCheck /> },
              { id: "plan", label: "Plan & billing" },
              { id: "faq", label: "Help" },
            ]}
          />
        </div>

        {/* ---------------- 15.1 profile ---------------- */}
        {view === "profile" ? (
          <div className="mt-3">
            <ProfileCard ctx={ctx} onEdit={() => setProfileOpen(true)} />
            <DashboardSectionHeader
              eyebrow="15.1"
              title="Everything from onboarding, now editable"
              subtitle="Change a value and it flows straight through plans, records and analytics."
              action={<ReportTools report={profileReport} onPreview={setReportPreview} />}
            />
            <ProfileFieldGroups />
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <KvList
                  items={[
                    { k: "Wallet PIN", v: "Set · last changed 12 Aug 2026" },
                    { k: "Two-factor login", v: "SMS to 0712 345 678" },
                    { k: "Biometric unlock", v: "Infinix Hot 40 · fingerprint" },
                    { k: "Active sessions", v: "This phone + 1 tablet (packhouse)" },
                  ]}
                />
              </div>
              <div className="col-lg-6">
                <div className="gm-st-panel-note">
                  <strong>Profile completeness {ctx.onboardingComplete}%</strong>
                  <p>
                    Adding a photo and the farm's KRA PIN takes you to 100%, which unlocks the branded reports on Enterprise
                    and lets buyers verify your farm in one scan.
                  </p>
                  <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => { setProfileOpen(true); toast.notify("Add the missing profile fields.", "info"); }}>
                    Finish profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 15.2 farm ---------------- */}
        {view === "farm" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.2"
              title="Farm settings"
              subtitle="Plots, soil readings, irrigation, units and record retention."
              action={
                <div className="d-flex flex-wrap gap-2">
                  <ReportTools report={plotsReport} onPreview={setReportPreview} />
                  <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => toast.notify("New plot form opens with the same fields as an existing plot.", "info")}>
                    + Add plot
                  </button>
                </div>
              }
            />
            <div className="gm-st-plot-grid">
              {plots.map((plot) => (
                <FarmPlotCard key={plot.id} p={plot} onEdit={setActivePlot} />
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <div className="gm-card p-3">
                  <h3 className="gm-h-section">Farm defaults</h3>
                  <FarmDefaults />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="gm-st-panel-note">
                  <strong>Soil data feeds the plan</strong>
                  <p>
                    Plot 1 sits at pH 5.8 with clay loam — the planner already recommends agricultural lime before the LR 2027
                    season. Update a soil reading and the input list recalculates.
                  </p>
                </div>
                <div className="gm-st-panel-note is-good">
                  <strong>Irrigation & water</strong>
                  <p>Drip on Plot 2 covers 0.5 acres and saves about 40% of the water a furrow would use. The rain gauge reading is logged each morning at 7am.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 15.3 team ---------------- */}
        {view === "team" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.3"
              title="Team & permissions"
              subtitle="Six roles, 13 permission rows and a date range on every invitation."
              action={
                <div className="d-flex flex-wrap gap-2">
                  <ReportTools report={teamReport} onPreview={setReportPreview} />
                  <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => setInviteOpen(true)}>
                    <UserPlus /> Invite member
                  </button>
                </div>
              }
            />
            <div className="gm-st-member-grid">
              {members.map((member) => (
                <TeamMemberCard key={member.id} m={member} onOpen={setActiveMember} />
              ))}
            </div>

            <div className="row g-4 mt-3">
              <div className="col-xl-7">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                  <h3 className="gm-h-section mb-0">Role permission matrix</h3>
                  <ReportTools report={permissionsReport} onPreview={setReportPreview} />
                </div>
                <PermissionMatrix />
              </div>
              <div className="col-xl-5">
                <h3 className="gm-h-section">What each role means</h3>
                <RoleLegend />
                <div className="gm-st-panel-note is-good mt-3">
                  <strong>Owner-only actions</strong>
                  <p>Changing the matrix, adding or removing people, switching plans and deleting the account stay with the owner — managers can run the farm but cannot rewrite the rules.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 15.3 HR ---------------- */}
        {view === "hr" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.3"
              title="Labour, HR & payroll"
              subtitle="Worker records, hiring, attendance, performance, weekly payroll, advances, Kenyan labour compliance and analytics."
              action={
                <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => setPayrollOpen(true)}>
                  Run payroll {kes(payrollTotal)}
                </button>
              }
            />
            <HrPanel
              onWorker={setActiveWorker}
              onPayWorker={(worker) => {
                setActiveWorker(worker);
                toast.notify(`Pay ${worker.name} from the labour budget.`, "info");
              }}
              onPayroll={() => setPayrollOpen(true)}
              onJob={() => setJobOpen(true)}
              onOnboard={() => setOnboardOpen(true)}
              onPreview={setReportPreview}
            />
          </div>
        ) : null}

        {/* ---------------- 15.4 notifications ---------------- */}
        {view === "notifications" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.4"
              title="Notification preferences"
              subtitle="Ten message types across push, SMS, WhatsApp and email — choose per row."
              action={<ReportTools report={notificationsReport} onPreview={setReportPreview} />}
            />
            <div className="gm-card p-3">
              {notifs.map((row) => (
                <NotifRow
                  key={row.id}
                  row={row}
                  onToggle={(id, channel) => {
                    setNotifs((current) =>
                      current.map((item) => item.id === id ? { ...item, channels: { ...item.channels, [channel]: !item.channels[channel as keyof typeof item.channels] } } : item),
                    );
                    toast.notify("Notification preference saved.", "info");
                  }}
                />
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <KvList
                  items={[
                    { k: "Quiet hours", v: "21:00 – 05:30 · urgent weather still breaks through" },
                    { k: "SMS budget", v: "KES 0.80 each · unlimited on Premium and Enterprise" },
                    { k: "WhatsApp", v: "Free, needs data · the bot replies in Kiswahili too" },
                    { k: "Language", v: ctx.language },
                  ]}
                />
              </div>
              <div className="col-lg-6">
                <div className="gm-st-panel-note">
                  <strong>Why SMS still matters</strong>
                  <p>When there is no data for two hours, task reminders fall back to SMS automatically so workers are never left waiting at the gate.</p>
                </div>
                <div className="gm-st-panel-note is-good">
                  <strong>Extreme weather always gets through</strong>
                  <p>Storm, flood and frost warnings fire on every channel you have enabled — including SMS at night.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 15.5 data & privacy ---------------- */}
        {view === "data" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.5"
              title="Data & privacy"
              subtitle="You decide what leaves the farm, who sees it, and for how long it is kept."
              action={<ReportTools report={privacyReport} onPreview={setReportPreview} />}
            />
            <div className="gm-st-data-list">
              {DATA_SETTINGS.map((row) => (
                <DataRow key={row.id} d={row} onAction={setDataAction} />
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <KvList
                  items={[
                    { k: "Bulk data location", v: "Nairobi DC · Kenya" },
                    { k: "Encryption", v: "TLS 1.3 in transit · AES-256 at rest" },
                    { k: "Backups", v: "Nightly, 30-day retention, encrypted" },
                    { k: "Benchmark pool", v: "De-identified and opt-in" },
                    { k: "Deletion grace", v: "30 days after you confirm" },
                  ]}
                />
              </div>
              <div className="col-lg-6">
                <div className="gm-st-panel-note is-warn">
                  <strong>Deleting the account</strong>
                  <p>Withdraw wallet funds first. Deletion removes records, photos, payroll history and the audit trail after the grace period, and it cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- 15.6 plans ---------------- */}
        {view === "plan" ? (
          <div className="mt-3">
            <DashboardSectionHeader
              eyebrow="15.6"
              title="Subscription plans"
              subtitle="Free to start, Premium at KES 299 a month, Enterprise at KES 999 — paid from the GrowMO wallet by M-Pesa."
              action={<ReportTools report={plansReport} onPreview={setReportPreview} />}
            />
            <div className="gm-st-plan-grid">
              {PLANS.map((entry) => (
                <PlanCard
                  key={entry.id}
                  p={entry}
                  isCurrent={entry.id === plan}
                  onPick={(id) => {
                    if (id === plan) {
                      toast.notify(`${entry.name} is your current plan — manage billing from the wallet.`, "info");
                      return;
                    }
                    setConfirm({
                      title: `Switch to ${PLANS.find((p) => p.id === id)?.name}?`,
                      body:
                        id === "free"
                          ? "Extra plots and team members become read-only at the next renewal until you are back inside the Free limits. Nothing is deleted."
                          : `Billing of ${kes(PLANS.find((p) => p.id === id)?.price ?? 0)} a month starts today, prorated, paid from the GrowMO wallet.`,
                      label: "Switch plan",
                      run: () => {
                        setPlan(id);
                        toast.notify(`Plan switched to ${PLANS.find((p) => p.id === id)?.name}.`, "success");
                      },
                    });
                  }}
                />
              ))}
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-4 mb-2">
              <h3 className="gm-h-section mb-0">Feature comparison</h3>
              <ReportTools report={plansReport} onPreview={setReportPreview} />
            </div>
            <PlanComparison rows={PLAN_COMPARISON_ROWS} />
            <div className="row g-3 mt-3">
              <div className="col-lg-6">
                <KvList
                  items={[
                    { k: "Billing date", v: "1st of every month" },
                    { k: "Payment method", v: "GrowMO wallet · M-Pesa STK, Paybill 247247, bank or agent" },
                    { k: "Invoices", v: "Available for Enterprise (KRA-compliant)" },
                    { k: "Cancel", v: "Any time before the 28th" },
                  ]}
                />
              </div>
              <div className="col-lg-6">
                <div className="gm-st-panel-note is-good">
                  <strong>Your plan pays for itself</strong>
                  <p>Premium costs KES 299 a month. The October market timing advice alone added about KES 143,550 to the cabbage sale, and the payroll run saves roughly six hours of paperwork.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ---------------- FAQ ---------------- */}
        {view === "faq" ? (
          <div className="mt-3">
            <div className="gm-card p-4">
              <DashboardSectionHeader eyebrow="Help" title="Settings questions" subtitle="Teams, roles, data sharing and billing." action={<button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => toast.notify("Support is reachable on 0700 000 000, 24/7.", "info")}>Contact support</button>} />
              <SettingsFaqList items={SETTINGS_FAQ} open={faqOpen} onOpen={setFaqOpen} />
              <h3 className="gm-h-section mt-3">Glossary</h3>
              <SettingsGlossary items={SETTINGS_GLOSSARY} />
            </div>
          </div>
        ) : null}

        <div className="gm-st-footer-note">
          <HelpCircle />
          <span>
            Settings changes are logged with your name, phone and timestamp so a farm audit can always see who changed what.
          </span>
          <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => setMenu(true)}>
            <Settings2 /> Open tools
          </button>
        </div>
      </div>

      <ReportPreviewDrawer report={reportPreview} onClose={() => setReportPreview(null)} />

      {/* ---------------- modals ---------------- */}
      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSent={(member) => {
          setMembers((current) => [...current, member]);
          setCtx((current) => ({ ...current, members: current.members + 1 }));
          toast.notify(`${member.name} invited as ${member.role}.`, "success");
        }}
      />

      <ProfileEditDialog
        open={profileOpen}
        ctx={{ farmer: ctx.farmer, phone: ctx.phone, email: ctx.email, farmName: ctx.farmName, county: ctx.county, subCounty: ctx.subCounty, ward: ctx.ward, language: ctx.language }}
        onClose={() => setProfileOpen(false)}
        onSave={(next) => {
          setCtx((current) => ({ ...current, ...next }));
          toast.notify("Profile saved across the farm.", "success");
        }}
      />

      <MemberDialog
        open={Boolean(activeMember)}
        member={activeMember}
        onClose={() => setActiveMember(null)}
        onSave={(member) => {
          setMembers((current) => current.map((item) => (item.id === member.id ? member : item)));
          toast.notify(`${member.name} now has the ${ROLES.find((r) => r.key === member.role)?.label} role.`, "success");
        }}
        onRemove={(member) => {
          setConfirm({
            title: `Remove ${member.name}?`,
            body: "Their access stops immediately, pending payments are reallocated and the audit trail stays for compliance.",
            label: "Remove member",
            run: () => {
              setMembers((current) => current.filter((item) => item.id !== member.id));
              setActiveMember(null);
              toast.notify(`${member.name} removed from the team.`, "warn");
            },
          });
        }}
      />

      <FarmPlotDialog
        open={Boolean(activePlot)}
        plot={activePlot}
        onClose={() => setActivePlot(null)}
        onSave={(plot) => {
          setPlots((current) => current.map((item) => (item.id === plot.id ? plot : item)));
          toast.notify(`${plot.name} updated — plans and soil advice recalculated.`, "success");
        }}
      />

      <PlanDialog
        open={planOpen}
        current={plan}
        onClose={() => setPlanOpen(false)}
        onPick={(id, note) => {
          setPlan(id);
          toast.notify(note, "success");
        }}
      />

      <DataActionDialog
        open={Boolean(dataAction)}
        action={dataAction}
        onClose={() => setDataAction(null)}
        onDone={(_id, receipt, note) => toast.notify(`${note} · ${receipt}`, "success")}
      />

      <WorkerDialog
        open={Boolean(activeWorker)}
        worker={activeWorker}
        onClose={() => setActiveWorker(null)}
        onPay={(worker, amount, memo) => toast.notify(`${kes(amount)} sent to ${worker.name} — ${memo}.`, "success")}
      />

      <PayrollDialog
        open={payrollOpen}
        onClose={() => setPayrollOpen(false)}
        onPaid={(total) => {
          setMembers((current) => current.map((member) => (member.role === "worker" ? { ...member, tasksThisMonth: member.tasksThisMonth } : member)));
          toast.notify(`Payroll released: ${kes(total)} to ${WORKERS.filter((w) => w.status === "Active").length} workers.`, "success");
        }}
      />

      <JobPostDialog
        open={jobOpen}
        onClose={() => setJobOpen(false)}
        onPosted={(receipt) => toast.notify(`Job posted to the community board · ${receipt}.`, "success")}
      />

      <OnboardingDialog
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onDone={(checked) => toast.notify(`Onboarding complete (${checked}/8) — worker added to the directory.`, "success")}
      />

      <ConfirmSettingsDialog
        open={Boolean(confirm)}
        title={confirm?.title ?? ""}
        body={confirm?.body ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm?.run()}
      />
    </main>
  );
}
