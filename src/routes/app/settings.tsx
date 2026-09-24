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
import { DashboardMetric, DashboardSectionHeader } from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
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
} from "../../components/app/SettingsModals";
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
} from "../../components/app/SettingsWidgets";
import type { FarmPlot, TeamMember, Worker } from "../../data/app/settings";
import {
  DATA_SETTINGS,
  FARM_PLOTS,
  NOTIF_PREFS,
  PLAN_COMPARISON_ROWS,
  PLANS,
  ROLES,
  SETTINGS_CONTEXT,
  SETTINGS_FAQ,
  SETTINGS_GLOSSARY,
  TEAM_MEMBERS,
  WORKERS,
} from "../../data/app/settings";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Settings, team & permissions — GrowMO" }] }),
});

type SettingsView = "profile" | "farm" | "team" | "hr" | "notifications" | "data" | "plan" | "faq";

function downloadText(filename: string, body: string, type = "text/csv") {
  const blob = new Blob([body], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | null | undefined) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

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

  function exportTeam() {
    const rows = [
      ["Name", "Role", "Phone", "Email", "Status", "Plots", "Financial access", "Payment authority", "Valid until"],
      ...members.map((member) => [member.name, member.role, member.phone, member.email, member.status, member.plots, member.financial, member.paymentAuthority, member.validUntil]),
    ];
    downloadText("growmo-team-roster.csv", rows.map((row) => row.map(csvCell).join(",")).join("\n"));
    toast.notify(`Exported ${members.length} team members to CSV.`, "success");
  }

  return (
    <main className="gm-app-page gm-settings-page">
      <div className="gm-container py-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">Manage</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Settings, team & permissions</strong>
          </div>
          <div className="gm-menu-wrap">
            <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setMenu((current) => !current)} aria-expanded={menu}>
              <MoreHorizontal /> Settings tools
            </button>
            {menu ? (
              <div className="gm-dropdown gm-finance-menu">
                <button type="button" onClick={() => { setInviteOpen(true); setMenu(false); }}>
                  <UserPlus /> Invite a team member
                </button>
                <button type="button" onClick={() => { setPlanOpen(true); setMenu(false); }}>
                  <CreditCard /> Plans & billing
                </button>
                <button type="button" onClick={() => { exportTeam(); setMenu(false); }}>
                  <FileSpreadsheet /> Export team roster (CSV)
                </button>
                <button type="button" onClick={() => { setView("data"); setMenu(false); toast.notify("Opened data & privacy.", "info"); }}>
                  <ShieldCheck /> Data & privacy
                </button>
                <button type="button" onClick={() => { setJobOpen(true); setMenu(false); }}>
                  <CalendarClock /> Post a farm job
                </button>
                <button type="button" onClick={() => { window.print(); setMenu(false); toast.notify("Printing the settings page as it appears on screen.", "info"); }}>
                  <Printer /> Print settings
                </button>
                <button type="button" onClick={() => { navigate({ to: "/app/wallet" }); }}>
                  <Download /> Open the wallet
                </button>
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
            <DashboardSectionHeader eyebrow="15.1" title="Everything from onboarding, now editable" subtitle="Change a value and it flows straight through plans, records and analytics." />
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
                <button type="button" className="gm-btn gm-btn-sm gm-btn-outline" onClick={() => toast.notify("New plot form opens with the same fields as an existing plot.", "info")}>
                  + Add plot
                </button>
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
                <button type="button" className="gm-btn gm-btn-sm gm-btn-lime" onClick={() => setInviteOpen(true)}>
                  <UserPlus /> Invite member
                </button>
              }
            />
            <div className="gm-st-member-grid">
              {members.map((member) => (
                <TeamMemberCard key={member.id} m={member} onOpen={setActiveMember} />
              ))}
            </div>

            <div className="row g-4 mt-3">
              <div className="col-xl-7">
                <h3 className="gm-h-section">Role permission matrix</h3>
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
            />
          </div>
        ) : null}

        {/* ---------------- 15.4 notifications ---------------- */}
        {view === "notifications" ? (
          <div className="mt-3">
            <DashboardSectionHeader eyebrow="15.4" title="Notification preferences" subtitle="Ten message types across push, SMS, WhatsApp and email — choose per row." />
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
            <DashboardSectionHeader eyebrow="15.5" title="Data & privacy" subtitle="You decide what leaves the farm, who sees it, and for how long it is kept." />
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
            <h3 className="gm-h-section mt-4">Feature comparison</h3>
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
