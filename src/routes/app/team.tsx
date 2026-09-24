/* ============================================================================
   PAGE 15.3 — TEAM MANAGEMENT & HUMAN RESOURCES (ADVANCED FULL PAGE)  (/app/team)

   Blueprint sections implemented
   15.3.1 Worker directory (expanded)   15.3.2 Recruitment & onboarding
   15.3.3 Attendance management         15.3.4 Performance management
   15.3.5 Payroll processing (full)     15.3.6 Advances & deductions
   15.3.7 Labour compliance (Kenya law) 15.3.8 Labour analytics

   9 tabs · 25 dialogs/wizards (TeamModals) · live state everywhere:
   the directory, job posts, applicants, onboarding, attendance methods,
   payslips, the payroll pipeline (draft → reviewed → approved → paid),
   advances, the PPE checklist and compliance statuses all change on the page.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileText,
  HardHat,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Plus,
  Printer,
  Scale,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  type TeamModalState,
  TeamModals,
} from "../../components/app/TeamModals";
import {
  AdvanceProgress,
  AlertBand,
  AnalyticRowView,
  attChip,
  ComplianceRowView,
  CostBreakdownBars,
  JobPostCard,
  MethodRowView,
  OnboardingCard,
  PAYROLL_STAGES,
  PerfTrendChart,
  PipelineStep,
  perfCardFor,
  RatingDist,
  RatingScaleLegend,
  SmsBubble,
  StageChip,
  TeamFaqList,
  TeamGlossary,
  TeamHero,
  type TeamKpi,
  WorkerAvatar,
  workerChip,
} from "../../components/app/TeamWidgets";
import { Pagination, Reveal, Stars } from "../../components/ui/primitives";
import {
  ADVANCES,
  type AdvanceRec,
  ANALYTICS,
  APPLICANTS,
  type Applicant,
  ATTENDANCE_LOGS,
  ATTENDANCE_METHODS,
  ATTENDANCE_MONTH,
  ATTENDANCE_TODAY,
  type AttendanceMethod,
  BATCH_RECEIPTS,
  COMPLIANCE,
  type ComplianceRow,
  JOB_POSTS,
  type JobPost,
  ONBOARDING_STEPS,
  PAYROLL_LINES,
  type PayslipLine,
  PERF_HISTORY,
  PPE_CHECKLIST,
  payslipNet,
  TASK_RATINGS,
  TEAM_ALERTS,
  TEAM_CONTEXT,
  TEAM_FAQ,
  TEAM_GLOSSARY,
  WORKERS,
  type Worker,
} from "../../data/app/team";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/team")({
  component: TeamPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Team management & HR — GrowMO" }] }),
});

type TeamView =
  | "overview"
  | "directory"
  | "recruitment"
  | "attendance"
  | "performance"
  | "payroll"
  | "advances"
  | "compliance"
  | "analytics";

function TeamPage() {
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [view, setView] = useState<TeamView>("overview");
  const [modal, setModal] = useState<TeamModalState>({ kind: "none" });
  const [rowMenu, setRowMenu] = useState("");

  /* ---- live state (every control on the page mutates one of these) ---- */
  const [workers, setWorkers] = useState<Worker[]>(WORKERS);
  const [posts, setPosts] = useState<JobPost[]>(JOB_POSTS);
  const [applicants, setApplicants] = useState<Applicant[]>(APPLICANTS);
  const [onb, setOnb] = useState<Record<string, number>>({ "APP-203": 3 });
  const [methods, setMethods] =
    useState<AttendanceMethod[]>(ATTENDANCE_METHODS);
  const [lines, setLines] = useState<PayslipLine[]>(PAYROLL_LINES);
  const [advances, setAdvances] = useState<AdvanceRec[]>(ADVANCES);
  const [ppe, setPpe] = useState(PPE_CHECKLIST);
  const [wallet, setWallet] = useState(TEAM_CONTEXT.walletBalance);
  const [payrollStage, setPayrollStage] = useState(0);
  const [compliance, setCompliance] = useState<ComplianceRow[]>(COMPLIANCE);

  /* ---- directory filters ---- */
  const [query, setQuery] = useState("");
  const [fType, setFType] = useState("All types");
  const [fStatus, setFStatus] = useState("All statuses");
  const [sort, setSort] = useState("Rating (high → low)");
  const [page, setPage] = useState(1);
  const perPage = 6;

  /* ---- performance tab ---- */
  const [perfWorker, setPerfWorker] = useState("John Mwangi");

  const activeCount = workers.filter((w) => w.status === "Active").length;
  const payrollTotal = lines.reduce((s, l) => s + payslipNet(l), 0);
  const outstanding = advances
    .filter((a) => a.type === "Advance" && a.status === "Repaying")
    .reduce((s, a) => s + a.remaining, 0);
  const avgRating = useMemo(
    () =>
      (
        workers.reduce((s, w) => s + w.rating, 0) / Math.max(1, workers.length)
      ).toFixed(1),
    [workers],
  );

  const kpis: TeamKpi[] = [
    {
      icon: Users,
      label: "Active workers",
      value: String(activeCount),
      note: `${workers.length} in directory · Kiambu`,
    },
    {
      icon: WalletCards,
      label: "Payroll this week",
      value: kes(Math.round(payrollTotal)),
      note: `${lines.length} workers · payday Fri 23/10`,
    },
    {
      icon: CalendarCheck,
      label: "Attendance (Oct)",
      value: "93%",
      note: "county average 85%",
    },
    {
      icon: Star,
      label: "Average rating",
      value: `${avgRating}★`,
      note: "across 505 tasks this season",
    },
  ];

  const filteredWorkers = useMemo(() => {
    let list = workers.filter((w) => {
      const q = query.toLowerCase();
      const matchesQ =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.phone.includes(q) ||
        w.village.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q);
      const matchesT = fType === "All types" || w.empType === fType;
      const matchesS = fStatus === "All statuses" || w.status === fStatus;
      return matchesQ && matchesT && matchesS;
    });
    list = [...list].sort((a, b) => {
      if (sort === "Name (A → Z)") return a.name.localeCompare(b.name);
      if (sort === "Attendance (high → low)")
        return b.attendancePct - a.attendancePct;
      if (sort === "Joined (newest first)")
        return b.joinDate.localeCompare(a.joinDate);
      return b.rating - a.rating;
    });
    return list;
  }, [workers, query, fType, fStatus, sort]);

  const pagedWorkers = filteredWorkers.slice(
    (page - 1) * perPage,
    page * perPage,
  );
  const pageCount = Math.max(1, Math.ceil(filteredWorkers.length / perPage));

  const stageLabel = [
    "Payslips ready",
    "Reviewed",
    "Approved",
    "Paid & receipted",
  ][payrollStage];

  const payrollCta = () => {
    if (payrollStage === 0) setModal({ kind: "payroll-review" });
    else if (payrollStage === 1) setModal({ kind: "payroll-approve" });
    else if (payrollStage === 2) setModal({ kind: "batch-pay" });
    else setView("payroll");
  };

  return (
    <main className="gm-app-page gm-team-page">
      <div className="gm-container py-4">
        {/* breadcrumb + tools */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <Link to="/app/dashboard" className="gm-back-link">
              Dashboard
            </Link>
            <span className="gm-breadcrumb-sep">/</span>
            <span className="text-muted">People</span>
            <span className="gm-breadcrumb-sep">/</span>
            <strong>Team &amp; HR</strong>
            {payrollStage < 3 ? (
              <StatusChip label="Payday today" tone="medium" />
            ) : (
              <StatusChip label="Payroll paid" tone="low" />
            )}
          </div>
          <div className="gm-menu-wrap">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setMenu((c) => !c)}
              aria-expanded={menu}
            >
              <MoreHorizontal /> Team tools
            </button>
            {menu ? (
              <div className="gm-menu">
                <p className="gm-menuhead">Team tools</p>
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    setModal({ kind: "export" });
                  }}
                >
                  <Download /> Export team records
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    setModal({ kind: "benchmark" });
                  }}
                >
                  <BarChart3 /> Kiambu county benchmark
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    setView("compliance");
                  }}
                >
                  <ShieldCheck /> Labour law checklist
                </button>
                <hr />
                <button
                  type="button"
                  onClick={() => {
                    setMenu(false);
                    window.print();
                  }}
                >
                  <Printer /> Print current view
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* hero */}
        <Reveal>
          <TeamHero
            kpis={kpis}
            actions={
              <>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => setModal({ kind: "add-worker" })}
                >
                  <UserPlus /> Add worker
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={payrollCta}
                >
                  <WalletCards />
                  {payrollStage < 3
                    ? `Run payroll · ${stageLabel}`
                    : "View payroll"}
                </button>
                <Link className="gm-btn gm-btn-ghost" to="/app/labour">
                  <ClipboardList /> Task view
                </Link>
              </>
            }
          />
        </Reveal>

        {/* tabs */}
        <div className="mt-4">
          <PlannerSubtabs<TeamView>
            label="Team sections"
            value={view}
            onChange={(v) => {
              setView(v);
              setPage(1);
            }}
            items={[
              { id: "overview", label: "Overview", icon: <Briefcase /> },
              {
                id: "directory",
                label: "Directory",
                icon: <Users />,
                count: workers.length,
              },
              {
                id: "recruitment",
                label: "Recruitment",
                icon: <Plus />,
                count: posts.filter((p) => p.status !== "Closed").length,
              },
              {
                id: "attendance",
                label: "Attendance",
                icon: <CalendarCheck />,
              },
              { id: "performance", label: "Performance", icon: <Star /> },
              {
                id: "payroll",
                label: "Payroll",
                icon: <WalletCards />,
                count: payrollStage < 3 ? 1 : 0,
              },
              {
                id: "advances",
                label: "Advances",
                icon: <CircleDollarSign />,
                count: advances.filter((a) => a.status === "Repaying").length,
              },
              { id: "compliance", label: "Compliance", icon: <ShieldCheck /> },
              { id: "analytics", label: "Analytics", icon: <TrendingUp /> },
            ]}
          />
        </div>

        <div className="gm-team-main">
          {view === "overview" ? (
            <OverviewTab
              {...{
                payrollStage,
                setPayrollStage,
                payrollTotal,
                outstanding,
                wallet,
                workers,
                lines,
                compliance,
                applicants,
                onb,
                setModal,
                setView,
                payrollCta,
              }}
            />
          ) : null}

          {view === "directory" ? (
            <DirectoryTab
              {...{
                workers,
                filteredWorkers,
                pagedWorkers,
                page,
                setPage,
                pageCount,
                query,
                setQuery,
                fType,
                setFType,
                fStatus,
                setFStatus,
                sort,
                setSort,
                rowMenu,
                setRowMenu,
                setModal,
              }}
            />
          ) : null}

          {view === "recruitment" ? (
            <RecruitmentTab
              {...{
                posts,
                applicants,
                onb,
                setModal,
              }}
            />
          ) : null}

          {view === "attendance" ? (
            <AttendanceTab
              {...{
                methods,
                setMethods,
                setModal,
                notify: toast.notify,
              }}
            />
          ) : null}

          {view === "performance" ? (
            <PerformanceTab
              {...{
                perfWorker,
                setPerfWorker,
                workers,
                setModal,
              }}
            />
          ) : null}

          {view === "payroll" ? (
            <PayrollTab
              {...{
                lines,
                payrollStage,
                setModal,
                wallet,
              }}
            />
          ) : null}

          {view === "advances" ? (
            <AdvancesTab
              {...{
                advances,
                setModal,
              }}
            />
          ) : null}

          {view === "compliance" ? (
            <ComplianceTab
              {...{
                compliance,
                ppe,
                setModal,
              }}
            />
          ) : null}

          {view === "analytics" ? <AnalyticsTab setModal={setModal} /> : null}
        </div>

        <TeamModals
          modal={modal}
          setModal={setModal}
          workers={workers}
          setWorkers={setWorkers}
          posts={posts}
          setPosts={setPosts}
          applicants={applicants}
          setApplicants={setApplicants}
          onb={onb}
          setOnb={setOnb}
          methods={methods}
          setMethods={setMethods}
          lines={lines}
          setLines={setLines}
          advances={advances}
          setAdvances={setAdvances}
          ppe={ppe}
          setPpe={setPpe}
          wallet={wallet}
          setWallet={setWallet}
          payrollStage={payrollStage}
          setPayrollStage={setPayrollStage}
          compliance={compliance}
          setCompliance={setCompliance}
          notify={(m, t) => toast.notify(m, t)}
        />
      </div>
    </main>
  );
}

/* ================= overview ================= */

function OverviewTab(props: {
  payrollStage: number;
  setPayrollStage: (n: number) => void;
  payrollTotal: number;
  outstanding: number;
  wallet: number;
  workers: Worker[];
  lines: PayslipLine[];
  compliance: ComplianceRow[];
  applicants: Applicant[];
  onb: Record<string, number>;
  setModal: (m: TeamModalState) => void;
  setView: (v: TeamView) => void;
  payrollCta: () => void;
}) {
  const {
    payrollStage,
    payrollTotal,
    outstanding,
    wallet,
    workers,
    lines,
    compliance,
    applicants,
    onb,
    setModal,
    setView,
    payrollCta,
  } = props;
  const topWorkers = [...workers]
    .filter((w) => w.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
  const onboarding = applicants.find((a) => a.stage === "Onboarding");
  const attention = compliance.filter((c) => c.status !== "Met").slice(0, 3);
  return (
    <>
      <AlertBand items={TEAM_ALERTS} />

      <div className="gm-team-grid-2">
        {/* payroll pipeline */}
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">
                {TEAM_CONTEXT.week} · payday {TEAM_CONTEXT.payday}
              </span>
              <h2 className="gm-h-section">Friday payroll</h2>
            </div>
            <StatusChip
              label={["Draft", "Reviewed", "Approved", "Paid"][payrollStage]}
              tone={payrollStage === 3 ? "low" : "neutral"}
            />
          </div>
          <div className="gm-team-pipeline">
            {PAYROLL_STAGES.map((s, i) => (
              <PipelineStep
                key={s.label}
                state={
                  payrollStage > i
                    ? "done"
                    : payrollStage === i
                      ? "now"
                      : "todo"
                }
                label={s.label}
                desc={s.desc}
                icon={s.icon}
              />
            ))}
          </div>
          <div className="gm-team-pipeline-total">
            <span>{lines.length} payments · net after deductions</span>
            <strong className="font-display">
              {kes(Math.round(payrollTotal))}
            </strong>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-primary"
              onClick={payrollCta}
            >
              <WalletCards />{" "}
              {payrollStage === 3 ? "View the run" : "Continue payroll"}
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => setView("payroll")}
            >
              Full payroll view
            </button>
          </div>
        </section>

        {/* compliance snapshot */}
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Labour law · Kenya</span>
              <h2 className="gm-h-section">Needs attention</h2>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-ghost gm-btn-sm"
              onClick={() => setView("compliance")}
            >
              All 12 <Scale size={14} />
            </button>
          </div>
          {attention.length ? (
            <ul className="gm-team-watchlist">
              {attention.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="gm-team-watch-item"
                    onClick={() =>
                      setModal({ kind: "compliance", rowId: r.id })
                    }
                  >
                    <span
                      className={`gm-chip gm-risk gm-risk-${r.status === "Warning" ? "medium" : "high"}`}
                    >
                      {r.status}
                    </span>
                    <strong>{r.requirement}</strong>
                    <small>{r.note}</small>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">All 12 requirements met.</p>
          )}
          <div className="gm-card-inset mt-3">
            <small className="text-muted">
              Minimum wage (agriculture, 2026)
            </small>
            <strong className="font-display d-block">
              {kes(TEAM_CONTEXT.minWageMonth)}/month
            </strong>
            <small className="text-muted">
              {TEAM_CONTEXT.minWageNote} · Kiambu market rate {kes(500)}/day
            </small>
          </div>
        </section>

        {/* wallet & advances */}
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Money</span>
              <h2 className="gm-h-section">Wallet &amp; advances</h2>
            </div>
            <Link to="/app/wallet" className="gm-btn gm-btn-ghost gm-btn-sm">
              Wallet
            </Link>
          </div>
          <div
            className="gm-stat-grid"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <div className="gm-card-inset">
              <small className="text-muted">GrowMO wallet</small>
              <strong className="font-display d-block gm-team-wallet">
                {kes(Math.round(wallet))}
              </strong>
              <small className="text-muted">
                M-Pesa · after this payroll:{" "}
                {kes(Math.round(wallet - payrollTotal))}
              </small>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Advances outstanding</small>
              <strong className="font-display d-block">
                {kes(outstanding)}
              </strong>
              <small className="text-muted">3 workers repaying weekly</small>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setModal({ kind: "new-advance" })}
            >
              <CircleDollarSign /> Give an advance
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setModal({ kind: "deduction" })}
            >
              <Minus /> Record deduction
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-ghost gm-btn-sm"
              onClick={() => setView("advances")}
            >
              Full ledger
            </button>
          </div>
        </section>

        {/* team snapshot */}
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Top rated this season</span>
              <h2 className="gm-h-section">The crew</h2>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-ghost gm-btn-sm"
              onClick={() => setView("directory")}
            >
              Directory
            </button>
          </div>
          <div className="gm-team-crew">
            {topWorkers.map((w) => (
              <button
                key={w.id}
                type="button"
                className="gm-team-crew-row"
                onClick={() => setModal({ kind: "worker", workerId: w.id })}
              >
                <WorkerAvatar name={w.name} size={32} />
                <span style={{ flex: 1, textAlign: "left" }}>
                  <strong>{w.name.split(" ").slice(0, 2).join(" ")}</strong>
                  <small className="text-muted d-block">
                    {w.empType} · {w.attendancePct}% attendance
                  </small>
                </span>
                <span className="font-display">{w.rating}★</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* new this month */}
      <div className="gm-team-grid-2 mt-4">
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Recruitment</span>
              <h2 className="gm-h-section">New this month</h2>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-ghost gm-btn-sm"
              onClick={() => setView("recruitment")}
            >
              Recruitment
            </button>
          </div>
          {applicants
            .filter((a) => a.stage === "Hired")
            .map((a) => (
              <div key={a.id} className="gm-team-hire-row">
                <WorkerAvatar name={a.name} size={32} />
                <span style={{ flex: 1, textAlign: "left" }}>
                  <strong>{a.name}</strong>
                  <small className="text-muted d-block">
                    {a.job.split("·")[1] ?? a.job} · started 20/10
                  </small>
                </span>
                <StageChip stage="Hired" />
              </div>
            ))}
        </section>

        {onboarding ? (
          <OnboardingCard
            applicant={onboarding}
            done={Math.min(onb[onboarding.id] ?? 0, ONBOARDING_STEPS.length)}
            total={ONBOARDING_STEPS.length}
            onOpen={() =>
              setModal({ kind: "onboarding", applicantId: onboarding.id })
            }
          />
        ) : (
          <section className="gm-card">
            <p className="gm-eyebrow">Onboarding</p>
            <p className="gm-lead mb-0">
              No one is mid-onboarding right now. Post a job and the checklist
              starts automatically.
            </p>
          </section>
        )}
      </div>
    </>
  );
}

/* ================= directory (15.3.1) ================= */

function DirectoryTab(props: {
  workers: Worker[];
  filteredWorkers: Worker[];
  pagedWorkers: Worker[];
  page: number;
  setPage: (p: number) => void;
  pageCount: number;
  query: string;
  setQuery: (s: string) => void;
  fType: string;
  setFType: (s: string) => void;
  fStatus: string;
  setFStatus: (s: string) => void;
  sort: string;
  setSort: (s: string) => void;
  rowMenu: string;
  setRowMenu: (s: string) => void;
  setModal: (m: TeamModalState) => void;
}) {
  const {
    workers,
    filteredWorkers,
    pagedWorkers,
    page,
    setPage,
    pageCount,
    query,
    setQuery,
    fType,
    setFType,
    fStatus,
    setFStatus,
    sort,
    setSort,
    rowMenu,
    setRowMenu,
    setModal,
  } = props;
  return (
    <section className="gm-card">
      <DashboardSectionHeader
        eyebrow="15.3.1 · Worker directory"
        title="Everyone on the farm, one file per person"
        subtitle="Identity, M-Pesa, pay terms, contacts, rates and the numbers the payroll needs — kept current so Friday runs without surprises."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-primary gm-btn-sm"
            onClick={() => setModal({ kind: "add-worker" })}
          >
            <UserPlus /> Add worker
          </button>
        }
      />

      {/* filters */}
      <div className="gm-team-filters">
        <label className="gm-field gm-field-grow">
          <span>Search</span>
          <input
            className="gm-input"
            placeholder="Name, phone, village, W-id…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="gm-field">
          <span>Employment</span>
          <select
            className="gm-select"
            value={fType}
            onChange={(e) => {
              setFType(e.target.value);
              setPage(1);
            }}
          >
            <option>All types</option>
            <option>Permanent</option>
            <option>Seasonal</option>
            <option>Casual</option>
            <option>Contract</option>
          </select>
        </label>
        <label className="gm-field">
          <span>Status</span>
          <select
            className="gm-select"
            value={fStatus}
            onChange={(e) => {
              setFStatus(e.target.value);
              setPage(1);
            }}
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>On leave</option>
            <option>Suspended</option>
            <option>Inactive</option>
            <option>Terminated</option>
          </select>
        </label>
        <label className="gm-field">
          <span>Sort</span>
          <select
            className="gm-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option>Rating (high → low)</option>
            <option>Attendance (high → low)</option>
            <option>Name (A → Z)</option>
            <option>Joined (newest first)</option>
          </select>
        </label>
      </div>

      <div className="gm-table-wrap">
        <table className="gm-table gm-team-crew-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Contact</th>
              <th>Type · contract</th>
              <th>Rate</th>
              <th>Pay</th>
              <th>October</th>
              <th>Rating</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {pagedWorkers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-muted">
                  No workers match the filters — clear the search or change the
                  type.
                </td>
              </tr>
            ) : null}
            {pagedWorkers.map((w) => (
              <tr
                key={w.id}
                onClick={() => setModal({ kind: "worker", workerId: w.id })}
              >
                <th scope="row">
                  <span className="gm-team-crew-cell">
                    <WorkerAvatar name={w.name} size={34} />
                    <span>
                      <strong>{w.name}</strong>
                      <small className="text-muted d-block">
                        {w.id} · {w.village}
                      </small>
                    </span>
                  </span>
                </th>
                <td>
                  {w.phone}
                  <small className="text-muted d-block">
                    M-Pesa {w.mpesaName}{" "}
                    <span className="gm-chip gm-risk gm-risk-low">
                      verified
                    </span>
                  </small>
                </td>
                <td>
                  {w.empType}
                  <small className="text-muted d-block">
                    {w.contractEnd
                      ? `ends ${w.contractEnd}`
                      : `since ${w.joinDate}`}
                  </small>
                </td>
                <td>
                  <span className="font-display">{kes(w.dailyRate)}/day</span>
                  <small className="text-muted d-block">
                    ≈ {kes(Math.round(w.dailyRate * 0.25))}/hr · OT ×1.5
                  </small>
                </td>
                <td>
                  {w.payFreq}
                  <small className="text-muted d-block">{w.payMethod}</small>
                </td>
                <td>
                  {w.attendancePct}%
                  <small className="text-muted d-block">
                    {w.absentsMonth} absent · {w.latesMonth} late
                  </small>
                </td>
                <td>
                  <span className="font-display">
                    {w.rating > 0 ? `${w.rating}★` : "—"}
                  </span>
                  <small className="text-muted d-block">
                    {w.tasksDone} tasks
                  </small>
                </td>
                <td>{workerChip(w.status)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="gm-dropdown">
                    <button
                      type="button"
                      className="gm-icon-btn"
                      aria-label={`Actions for ${w.name}`}
                      aria-expanded={rowMenu === w.id}
                      onClick={() => setRowMenu(rowMenu === w.id ? "" : w.id)}
                    >
                      <MoreHorizontal />
                    </button>
                    {rowMenu === w.id ? (
                      <div className="gm-menu">
                        <p className="gm-menuhead">{w.name.split(" ")[0]}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setRowMenu("");
                            setModal({ kind: "worker", workerId: w.id });
                          }}
                        >
                          <Users /> Open full profile
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRowMenu("");
                            setModal({ kind: "edit-worker", workerId: w.id });
                          }}
                        >
                          <UserPlus /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRowMenu("");
                            setModal({ kind: "change-status", workerId: w.id });
                          }}
                        >
                          <Scale /> Change status
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRowMenu("");
                            setModal({ kind: "contract", workerId: w.id });
                          }}
                        >
                          <FileText /> Contract PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRowMenu("");
                            setModal({ kind: "leave", workerId: w.id });
                          }}
                        >
                          <CalendarCheck /> Leave request
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
        <small className="text-muted">
          {filteredWorkers.length} of {workers.length} workers · click a row for
          the full file
        </small>
        <Pagination
          page={page}
          total={pageCount}
          onChange={setPage}
          perPage={6}
          totalItems={filteredWorkers.length}
        />
      </div>
    </section>
  );
}

/* ================= recruitment (15.3.2) ================= */

function RecruitmentTab(props: {
  posts: JobPost[];
  applicants: Applicant[];
  onb: Record<string, number>;
  setModal: (m: TeamModalState) => void;
}) {
  const { posts, applicants, onb, setModal } = props;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.2 · Recruitment & onboarding"
        title="Post it, reach the village, onboard in 8 steps"
        subtitle="GrowMO community board, WhatsApp, SMS to nearby workers and the chief's office — then the checklist that turns an applicant into a file in the directory."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-primary gm-btn-sm"
            onClick={() => setModal({ kind: "post-job" })}
          >
            <Plus /> Post a job
          </button>
        }
      />

      <div className="gm-team-grid-2">
        {posts.map((p) => (
          <JobPostCard
            key={p.id}
            post={p}
            onOpen={() => setModal({ kind: "job", postId: p.id })}
          />
        ))}
      </div>

      {/* applicant pipeline */}
      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="Applicant pipeline"
          title="Who's applying, and where they stand"
        />
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Applying for</th>
                <th>Skills</th>
                <th>Last worked</th>
                <th>Applied</th>
                <th>Stage</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr
                  key={a.id}
                  className="gm-team-clickrow"
                  onClick={() =>
                    setModal({ kind: "applicant", applicantId: a.id })
                  }
                >
                  <th scope="row">
                    <span className="gm-team-crew-cell">
                      <WorkerAvatar name={a.name} size={30} />
                      <span>
                        <strong>{a.name}</strong>
                        <small className="text-muted d-block">
                          {a.id} · {a.phone}
                        </small>
                      </span>
                    </span>
                  </th>
                  <td>
                    {a.job}
                    <small className="text-muted d-block">{a.village}</small>
                  </td>
                  <td>
                    {a.skills.map((s) => (
                      <span key={s} className="gm-chip d-inline-block me-1">
                        {s}
                      </span>
                    ))}
                  </td>
                  <td>{a.lastWorked}</td>
                  <td>{a.applied}</td>
                  <td>
                    <StageChip stage={a.stage} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {a.stage === "Onboarding" ? (
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() =>
                          setModal({ kind: "onboarding", applicantId: a.id })
                        }
                      >
                        <ClipboardCheck /> Checklist{" "}
                        {Math.min(onb[a.id] ?? 0, ONBOARDING_STEPS.length)}/
                        {ONBOARDING_STEPS.length}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gm-btn gm-btn-ghost gm-btn-sm"
                        onClick={() =>
                          setModal({ kind: "applicant", applicantId: a.id })
                        }
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

/* ================= attendance (15.3.3) ================= */

function AttendanceTab(props: {
  methods: AttendanceMethod[];
  setMethods: React.Dispatch<React.SetStateAction<AttendanceMethod[]>>;
  setModal: (m: TeamModalState) => void;
  notify: (msg: string, tone?: "success" | "info" | "warn") => void;
}) {
  const { methods, setMethods, setModal, notify } = props;
  const today = ATTENDANCE_TODAY;
  const present = today.filter(
    (r) => r.status === "Present" || r.status === "Late",
  ).length;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.3 · Attendance"
        title="Check-ins that land without you doing anything"
        subtitle="Five ways a worker can clock in — SMS, USSD, your own tick. Everything lands in the same register with a timestamp, and the monthly summary feeds the payslips."
        action={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setModal({ kind: "checkin-sim" })}
            >
              <Smartphone /> Simulate check-in
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary gm-btn-sm"
              onClick={() => setModal({ kind: "mark-attendance" })}
            >
              <ClipboardCheck /> Mark attendance
            </button>
          </div>
        }
      />

      <div className="gm-team-grid-2">
        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Check-in methods</span>
              <h2 className="gm-h-section">How workers clock in</h2>
            </div>
          </div>
          <div className="gm-team-methods">
            {methods.map((m) => (
              <MethodRowView
                key={m.id}
                method={m}
                onToggle={() => {
                  setMethods((ms) =>
                    ms.map((x) =>
                      x.id === m.id ? { ...x, active: !x.active } : x,
                    ),
                  );
                  notify(
                    `${m.method} ${m.active ? "turned off" : "activated"}.`,
                    "success",
                  );
                }}
              />
            ))}
          </div>
          <p className="text-muted mt-2 mb-0">
            SMS short code 20550 and USSD *384*3*1# work on any handset — no
            data, no app, no smartphone needed.
          </p>
        </section>

        <section className="gm-card">
          <div className="gm-dash-section-title">
            <div>
              <span className="gm-eyebrow">Today · Friday 23/10</span>
              <h2 className="gm-h-section">The register so far</h2>
            </div>
            <StatusChip
              label={`${present} of ${today.length} present`}
              tone={present >= 5 ? "low" : "medium"}
            />
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table gm-table-sm">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Status</th>
                  <th>Task</th>
                </tr>
              </thead>
              <tbody>
                {today.map((r) => (
                  <tr key={r.workerId}>
                    <th scope="row">{r.worker}</th>
                    <td>{r.checkIn}</td>
                    <td>{r.checkOut}</td>
                    <td>{attChip(r.status)}</td>
                    <td>
                      <small>{r.task}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* monthly summary */}
      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="October 2026 · to date"
          title="Monthly summary"
          subtitle="Present, absent, late and half-days per worker, with overtime hours — the numbers that drive this week's payslips."
        />
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th className="num">Present</th>
                <th className="num">Absent</th>
                <th className="num">Late</th>
                <th className="num">Half-day</th>
                <th className="num">Attendance</th>
                <th className="num">OT hours</th>
              </tr>
            </thead>
            <tbody>
              {ATTENDANCE_MONTH.map((r) => (
                <tr key={r.workerId}>
                  <th scope="row">{r.worker}</th>
                  <td className="num">{r.present}</td>
                  <td className="num">{r.absent}</td>
                  <td className="num">{r.late}</td>
                  <td className="num">{r.half}</td>
                  <td className="num">
                    <span
                      className={`gm-chip ${r.pct >= 90 ? "gm-risk gm-risk-low" : r.pct >= 80 ? "gm-risk gm-risk-medium" : "gm-risk gm-risk-high"}`}
                    >
                      {r.pct}%
                    </span>
                  </td>
                  <td className="num">
                    {r.overtime ? `${r.overtime} h` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* check-in log */}
      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="Live feed"
          title="Check-in log"
          subtitle="The last check-ins and check-outs, with the method each one used."
        />
        <div className="gm-team-loglist">
          {ATTENDANCE_LOGS.map((l) => (
            <div key={l.id} className="gm-team-logrow">
              <code className="gm-team-logts">{l.ts}</code>
              <span style={{ flex: 1 }}>
                <strong>{l.who}</strong>
                <small className="text-muted d-block">{l.note}</small>
              </span>
              <span className="gm-chip">{l.method}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= performance (15.3.4) ================= */

const PERF_WORKERS = [
  "John Mwangi",
  "Peter Kamau",
  "Grace Wanjiku",
  "Samuel Njoroge",
  "Joseph Muthoni",
  "Lucy Wambui",
  "David Maina",
  "Ruth Wairimu",
];

function PerformanceTab(props: {
  perfWorker: string;
  setPerfWorker: (s: string) => void;
  workers: Worker[];
  setModal: (m: TeamModalState) => void;
}) {
  const { perfWorker, setPerfWorker, workers, setModal } = props;
  const card = perfCardFor(perfWorker);
  const w = workers.find((x) => x.name.includes(perfWorker));
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.4 · Performance"
        title="Rate the task, not the person"
        subtitle="A 5-point scale on every finished task. The card below is the worker's season in one view — distribution, rework, speed and quality vs the farm average."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-primary gm-btn-sm"
            onClick={() => setModal({ kind: "rate-task" })}
          >
            <Star /> Rate a task
          </button>
        }
      />

      <div className="gm-team-grid-2">
        <section className="gm-card">
          <div className="d-flex align-items-center gap-3 mb-3">
            <WorkerAvatar name={perfWorker} size={46} />
            <div style={{ flex: 1 }}>
              <strong
                className="font-display d-block"
                style={{ fontSize: "1.05rem" }}
              >
                {perfWorker}
              </strong>
              <span className="text-muted">
                {w
                  ? `${w.empType} · ${w.skills.slice(0, 3).join(", ")}`
                  : "Seasonal"}
              </span>
            </div>
            <div className="text-center">
              <strong
                className="font-display d-block"
                style={{ fontSize: "1.6rem" }}
              >
                {card.avg}★
              </strong>
              <Stars rating={card.avg} size={12} />
            </div>
          </div>
          <div className="gm-form-grid">
            <label className="gm-field">
              <span>Worker</span>
              <select
                className="gm-select"
                value={perfWorker}
                onChange={(e) => setPerfWorker(e.target.value)}
              >
                {PERF_WORKERS.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="gm-stat-grid gm-team-perf-stats">
            <div className="gm-card-inset">
              <small className="text-muted">Tasks this season</small>
              <strong className="font-display d-block">
                {w?.tasksDone ?? "—"}
              </strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Rework rate</small>
              <strong className="font-display d-block">
                {w
                  ? Math.round((card.rework / Math.max(1, w.tasksDone)) * 100)
                  : 0}
                %
              </strong>
              <small className="text-muted">{card.rework} reworks</small>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Speed vs team</small>
              <strong
                className="font-display d-block"
                style={{ fontSize: "1rem" }}
              >
                {card.speedVs}
              </strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Quality vs team</small>
              <strong
                className="font-display d-block"
                style={{ fontSize: "1rem" }}
              >
                {card.qualityVs}
              </strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">No-shows (12 mo)</small>
              <strong className="font-display d-block">{card.noShow}</strong>
            </div>
            <div className="gm-card-inset">
              <small className="text-muted">Lates (12 mo)</small>
              <strong className="font-display d-block">{card.lates}</strong>
            </div>
          </div>

          <div className="gm-team-perf-cols mt-3">
            <div>
              <p className="gm-eyebrow mb-1">Rating distribution</p>
              <RatingDist dist={card.dist} />
            </div>
            <div>
              <p className="gm-eyebrow mb-1">Strengths</p>
              <p className="mb-2">{card.strengths}</p>
              <p className="gm-eyebrow mb-1">Work on</p>
              <p className="mb-2">{card.improve}</p>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() =>
                  setModal({ kind: "perf-review", workerName: perfWorker })
                }
              >
                <FileText /> Write monthly review
              </button>
            </div>
          </div>
        </section>

        <PerfTrend />
      </div>

      <div className="gm-team-grid-2 mt-4">
        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="The scale"
            title="What each star means"
          />
          <RatingScaleLegend />
        </section>

        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="Recent ratings"
            title="The task ledger"
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => setModal({ kind: "rate-task" })}
              >
                <Plus /> Add rating
              </button>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table gm-table-sm">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Task · plot</th>
                  <th>Date</th>
                  <th>Stars</th>
                  <th>Rework</th>
                </tr>
              </thead>
              <tbody>
                {TASK_RATINGS.map((t) => (
                  <tr key={t.id}>
                    <th scope="row">{t.worker}</th>
                    <td>
                      {t.task}
                      <small className="text-muted d-block">
                        {t.plot} · {t.note}
                      </small>
                    </td>
                    <td>{t.date}</td>
                    <td>
                      <span className="font-display">{t.stars}★</span>
                    </td>
                    <td>
                      {t.rework ? (
                        <span className="gm-chip gm-risk gm-risk-high">
                          Rework
                        </span>
                      ) : (
                        <span className="gm-chip">Clean</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function PerfTrend() {
  return (
    <section className="gm-card">
      <PerfTrendChart data={PERF_HISTORY} />
      <p className="text-muted mt-2 mb-0">
        John Mwangi · average rating vs the farm average, with task volume
        behind each point. July was the peak — 12 tasks, 4.5★.
      </p>
    </section>
  );
}

/* ================= payroll (15.3.5) ================= */

function PayrollTab(props: {
  lines: PayslipLine[];
  payrollStage: number;
  setModal: (m: TeamModalState) => void;
  wallet: number;
}) {
  const { lines, payrollStage, setModal, wallet } = props;
  const total = lines.reduce((s, l) => s + payslipNet(l), 0);
  const paid = payrollStage === 3;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.5 · Payroll · week Oct 20 – 26, 2026"
        title="Four steps from attendance to M-Pesa receipt"
        subtitle="Payslips auto-build from the register, you review and approve with your PIN, the batch pushes to every worker's phone, and each one gets a line-item SMS."
        action={
          paid ? (
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setModal({ kind: "payroll-sms" })}
            >
              <MessageSquare /> Payslip SMS
            </button>
          ) : (
            <button
              type="button"
              className="gm-btn gm-btn-primary gm-btn-sm"
              onClick={() =>
                setModal(
                  payrollStage === 0
                    ? { kind: "payroll-review" }
                    : payrollStage === 1
                      ? { kind: "payroll-approve" }
                      : { kind: "batch-pay" },
                )
              }
            >
              <WalletCards />{" "}
              {payrollStage === 0
                ? "Review payslips"
                : payrollStage === 1
                  ? "Approve with PIN"
                  : "Pay the batch"}
            </button>
          )
        }
      />

      <div className="gm-card">
        <div className="gm-team-pipeline">
          {PAYROLL_STAGES.map((s, i) => (
            <PipelineStep
              key={s.label}
              state={
                payrollStage > i ? "done" : payrollStage === i ? "now" : "todo"
              }
              label={s.label}
              desc={s.desc}
              icon={s.icon}
            />
          ))}
        </div>
        <div className="gm-team-pipeline-total">
          <span>
            {lines.length} payments · wallet after:{" "}
            {kes(Math.round(wallet - (paid ? total : 0)))}
          </span>
          <strong className="font-display">{kes(Math.round(total))}</strong>
        </div>
      </div>

      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="The week's payslips"
          title="Every line is traceable to the register"
          subtitle="OT at 1.5× the hourly rate (93.75/hr on a 500/day), piece rates, and named deductions — nothing is a mystery number."
        />
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Worker</th>
                <th className="num">Days</th>
                <th className="num">Basic</th>
                <th className="num">OT (1.5×)</th>
                <th className="num">Piece</th>
                <th className="num">Deductions</th>
                <th className="num">Net</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.workerId}>
                  <th scope="row">
                    {l.worker}
                    <small className="text-muted d-block">{l.workerId}</small>
                  </th>
                  <td className="num">{l.daysWorked}</td>
                  <td className="num">{kes(l.basic)}</td>
                  <td className="num">
                    {l.otPay ? `${kes(l.otPay)} (${l.otHours}h)` : "—"}
                  </td>
                  <td className="num">{l.piece ? kes(l.piece) : "—"}</td>
                  <td className="num">
                    {kes(l.absenceDed + l.advanceDed + l.otherDed)}
                  </td>
                  <td className="num font-display gm-team-ps-net">
                    {kes(payslipNet(l))}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-ghost gm-btn-sm"
                      onClick={() =>
                        setModal({ kind: "payslip", workerId: l.workerId })
                      }
                    >
                      <FileText /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={6}>
                  Total — paid Friday via GrowMO wallet M-Pesa
                </th>
                <th className="num font-display gm-team-ps-net">
                  {kes(Math.round(total))}
                </th>
                <th />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {paid ? (
        <div className="gm-team-grid-2 mt-4">
          <section className="gm-card">
            <DashboardSectionHeader
              eyebrow="Delivered"
              title="M-Pesa receipts"
            />
            <div className="gm-team-receipts">
              {lines.map((l) => (
                <div key={l.workerId} className="gm-team-receipt">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ flex: 1 }}>
                      <strong>{l.worker}</strong>
                      <small className="text-muted d-block">
                        GrowMO wallet M-Pesa
                      </small>
                    </div>
                    <strong className="font-display">
                      {kes(payslipNet(l))}
                    </strong>
                  </div>
                  <code className="gm-team-ref">
                    {BATCH_RECEIPTS[l.workerId]}
                  </code>
                </div>
              ))}
            </div>
          </section>
          <section className="gm-card">
            <DashboardSectionHeader
              eyebrow="On every worker's phone"
              title="The SMS they get"
            />
            <SmsBubble
              from="20550 → John Mwangi"
              text={`Umelipwa KES ${String(Math.round(payslipNet(lines[0])))} kwa GrowMO (Mary's Farm). Wiki ya Oct 20–26. Receipt: ${BATCH_RECEIPTS["W-001"]}`}
            />
            <SmsBubble
              from="20550 → Peter Kamau"
              text={`Umelipwa KES ${String(Math.round(payslipNet(lines[1])))} kwa GrowMO (Mary's Farm). Wiki ya Oct 20–26. Receipt: ${BATCH_RECEIPTS["W-002"]}`}
            />
            <p className="text-muted mb-0">
              PDF payslips are filed in Records → Payroll. The SMS is the
              written payslip the Labour Act requires — itemised, in English
              with the Kiswahili greeting.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}

/* ================= advances (15.3.6) ================= */

function AdvancesTab(props: {
  advances: AdvanceRec[];
  setModal: (m: TeamModalState) => void;
}) {
  const { advances, setModal } = props;
  const outstanding = advances
    .filter((a) => a.type === "Advance" && a.status === "Repaying")
    .reduce((s, a) => s + a.remaining, 0);
  const deductions = advances
    .filter((a) => a.type === "Deduction")
    .reduce((s, a) => s + a.amount, 0);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.6 · Advances & deductions"
        title="Money moving, always named"
        subtitle="Advances are paid from the wallet and repaid in weekly deductions. Deductions are one-time, agreed, and itemised on the payslip."
        action={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => setModal({ kind: "deduction" })}
            >
              <Minus /> Record deduction
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-primary gm-btn-sm"
              onClick={() => setModal({ kind: "new-advance" })}
            >
              <CircleDollarSign /> Give an advance
            </button>
          </div>
        }
      />

      <div className="gm-stat-grid gm-team-adv-kpis">
        <div className="gm-card gm-card-inset">
          <small className="text-muted">Advances outstanding</small>
          <strong className="font-display d-block">{kes(outstanding)}</strong>
          <small className="text-muted">
            {advances.filter((a) => a.status === "Repaying").length} active
            plans
          </small>
        </div>
        <div className="gm-card gm-card-inset">
          <small className="text-muted">Deductions this month</small>
          <strong className="font-display d-block">{kes(deductions)}</strong>
          <small className="text-muted">absence + tool damage</small>
        </div>
        <div className="gm-card gm-card-inset">
          <small className="text-muted">Settled this season</small>
          <strong className="font-display d-block">{kes(1500)}</strong>
          <small className="text-muted">
            ADV-004 · Peter, funeral expenses
          </small>
        </div>
      </div>

      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="The ledger"
          title="Every advance and deduction"
        />
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Worker</th>
                <th>Type</th>
                <th className="num">Amount</th>
                <th>Date</th>
                <th>Reason</th>
                <th style={{ minWidth: 220 }}>Repayment</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {advances.map((a) => (
                <tr key={a.id}>
                  <th scope="row">
                    <code>{a.id}</code>
                  </th>
                  <td>
                    {a.worker}
                    <small className="text-muted d-block">{a.workerId}</small>
                  </td>
                  <td>
                    {a.type === "Advance" ? (
                      <span className="gm-chip gm-risk gm-risk-medium">
                        Advance
                      </span>
                    ) : (
                      <span className="gm-chip gm-risk gm-risk-high">
                        Deduction
                      </span>
                    )}
                  </td>
                  <td className="num font-display">{kes(a.amount)}</td>
                  <td>{a.date}</td>
                  <td>{a.reason}</td>
                  <td>
                    {a.type === "Advance" ? (
                      <AdvanceProgress rec={a} />
                    ) : (
                      <small className="text-muted">{a.plan}</small>
                    )}
                  </td>
                  <td>
                    {a.status === "Settled" ? (
                      <span className="gm-chip gm-risk gm-risk-low">
                        Settled
                      </span>
                    ) : a.status === "Deducted" ? (
                      <span className="gm-chip">Applied</span>
                    ) : (
                      <span className="gm-chip gm-risk gm-risk-medium">
                        Repaying
                      </span>
                    )}
                  </td>
                  <td>
                    {a.type === "Advance" && a.status === "Repaying" ? (
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() =>
                          setModal({ kind: "repay-advance", recId: a.id })
                        }
                      >
                        <CircleDollarSign /> Repay
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="gm-btn gm-btn-ghost gm-btn-sm"
                        onClick={() =>
                          setModal({ kind: "worker", workerId: a.workerId })
                        }
                      >
                        File
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-muted mt-2 mb-0">
          Repaying in full skips the rest of the weekly plan — the payslip stops
          showing the deduction next week, automatically.
        </p>
      </section>
    </>
  );
}

/* ================= compliance (15.3.7) ================= */

function ComplianceTab(props: {
  compliance: ComplianceRow[];
  ppe: { id: string; item: string; ok: boolean }[];
  setModal: (m: TeamModalState) => void;
}) {
  const { compliance, ppe, setModal } = props;
  const met = compliance.filter((c) => c.status === "Met").length;
  const shortPpe = ppe.filter((p) => !p.ok);
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.7 · Labour compliance · Kenya"
        title="The 12 rules that keep the farm on the right side of the law"
        subtitle="Minimum wage, NSSF, NHIF/SHA, housing levy, leave, maternity, PPE, child labour, contracts and payslips — GrowMO checks your rates and records against each one."
        action={
          <StatusChip
            label={`${met}/${compliance.length} met`}
            tone={met === compliance.length ? "low" : "medium"}
          />
        }
      />

      <section className="gm-card">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>How GrowMO tracks it</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {compliance.map((c) => (
                <ComplianceRowView
                  key={c.id}
                  row={c}
                  onOpen={() => setModal({ kind: "compliance", rowId: c.id })}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="gm-team-grid-2 mt-4">
        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="PPE provision"
            title="Chemical handling kit"
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => setModal({ kind: "ppe" })}
              >
                <HardHat /> Open checklist
              </button>
            }
          />
          <div className="gm-team-channel-list">
            {ppe.map((p) => (
              <div
                key={p.id}
                className={`gm-team-ppe-row ${p.ok ? "" : "is-short"}`}
              >
                <span
                  className={`gm-chip ${p.ok ? "gm-risk gm-risk-low" : "gm-risk gm-risk-medium"}`}
                >
                  {p.ok ? "In stock" : "Short"}
                </span>
                <span style={{ flex: 1 }}>{p.item}</span>
              </div>
            ))}
          </div>
          {shortPpe.length ? (
            <p className="text-muted mt-2 mb-0">
              {shortPpe.length} items short — order raised 21/10 with Githunguri
              Agrovet, expected 25/10. Spraying continues with the spare pair
              until it arrives.
            </p>
          ) : (
            <p className="text-muted mt-2 mb-0">
              All PPE in place. Re-check before each spraying season.
            </p>
          )}
        </section>

        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="Permanent staff"
            title="Statutory deductions, worked out"
          />
          <table className="gm-table gm-table-sm">
            <thead>
              <tr>
                <th>Worker</th>
                <th className="num">Gross</th>
                <th className="num">NSSF 6%</th>
                <th className="num">NHIF</th>
                <th className="num">Housing 1.5%</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  Lucy Wambui
                  <small className="text-muted d-block">
                    NSSF-123456 · NHIF-789012
                  </small>
                </th>
                <td className="num font-display">{kes(3600)}</td>
                <td className="num">−{kes(216)}</td>
                <td className="num">−{kes(300)}</td>
                <td className="num">−{kes(54)}</td>
              </tr>
              <tr>
                <th scope="row">
                  Esther Nyambura
                  <small className="text-muted d-block">
                    NSSF-654321 · NHIF-234567
                  </small>
                </th>
                <td className="num font-display">{kes(3600)}</td>
                <td className="num">−{kes(216)}</td>
                <td className="num">−{kes(300)}</td>
                <td className="num">−{kes(54)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-muted mt-2 mb-0">
            Employer matches the NSSF 6%. Casual and seasonal workers are exempt
            from NSSF/NHIF but keep overtime at 1.5×, leave pro-rated, and the
            written payslip.
          </p>
        </section>
      </div>

      <section className="gm-card mt-4">
        <DashboardSectionHeader
          eyebrow="Asked all the time"
          title="Labour law FAQ"
        />
        <TeamFaqList items={TEAM_FAQ} />
      </section>
    </>
  );
}

/* ================= analytics (15.3.8) ================= */

function AnalyticsTab(props: { setModal: (m: TeamModalState) => void }) {
  const { setModal } = props;
  return (
    <>
      <DashboardSectionHeader
        eyebrow="15.3.8 · Labour analytics"
        title="Your team against last month and the county"
        subtitle="Nine measures, this month vs last month, with the Kiambu county average where GrowMO has one. The point of the page: labour should be a line in the P&L you understand, not a worry."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm"
            onClick={() => setModal({ kind: "benchmark" })}
          >
            <BarChart3 /> Full county benchmark
          </button>
        }
      />

      <section className="gm-card">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Measure</th>
                <th className="num">This month</th>
                <th className="num">Last month</th>
                <th>Change</th>
                <th className="num">County avg</th>
              </tr>
            </thead>
            <tbody>
              {ANALYTICS.map((r) => (
                <AnalyticRowView key={r.metric} row={r} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="gm-team-grid-2 mt-4">
        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="October · KES 38,500"
            title="Where the labour money goes"
          />
          <CostBreakdownBars />
          <p className="text-muted mt-2 mb-0">
            Weekly wage workers are 56% of the cost; permanent monthly staff
            37%. Cost per labour day (512) sits below the county 550 — revenue
            per labour day (6,905) is well above the county 4,500.
          </p>
        </section>

        <section className="gm-card">
          <DashboardSectionHeader
            eyebrow="Plain language"
            title="Team glossary"
          />
          <TeamGlossary items={TEAM_GLOSSARY} />
        </section>
      </div>
    </>
  );
}
