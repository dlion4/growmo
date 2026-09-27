import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Boxes,
  ClipboardList,
  HandCoins,
  Fuel as FuelIcon,
  LayoutDashboard,
  Plus,
  Store,
  TrendingDown,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  AddEquipmentWizard,
  AttachmentsModal,
  AssetsReportModal,
  ConditionModal,
  ContactModal,
  DepreciationModal,
  DelistModal,
  EquipmentDrawer,
  EditEquipmentModal,
  ExportModal,
  type ModalState,
  FuelLogModal,
  FuelReportModal,
  HireInModal,
  HireOutModal,
  HireReceiptModal,
  InsuranceModal,
  ListingModal,
  MaintReportModal,
  PhotoModal,
  PublishModal,
  RateAddModal,
  RateEditModal,
  ScheduleModal,
  ServiceDoneModal,
  UsageLogModal,
  UsageReportModal,
} from "../../components/app/MachineryModals";
import {
  categoryIcon,
  DepTable,
  EffChart,
  EquipTable,
  eqById,
  FuelEffTable,
  FuelTable,
  HireInTable,
  HireOutTable,
  ListingCard,
  MaintTable,
  MachHero,
  RateCardTable,
  UsageAnalyticsTable,
  UsageTable,
} from "../../components/app/MachineryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  CATEGORIES,
  DEPRECIATION,
  EQUIPMENT,
  EQUIPMENT_TOTAL_VALUE,
  FUEL_EFFICIENCY,
  FUEL_LOG,
  FUEL_MONTH_TOTAL,
  HIRE_IN,
  HIRE_OUT,
  MAINTENANCE,
  MACH_ALERTS,
  MACH_CONTEXT,
  MARKET_LISTINGS,
  type MarketListing,
  RATE_CARD,
  USAGE_ANALYTICS,
  USAGE_LOG,
} from "../../data/app/machinery";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/machinery")({
  component: MachineryPage,
  ssr: true,
  head: () => ({ meta: [{ title: "Machinery & equipment — GrowMO" }] }),
});

type MachTab = "overview" | "registry" | "maintenance" | "usage" | "hire" | "fuel" | "assets";

function MachineryPage() {
  const toast = useToast();
  const [tab, setTab] = useState<MachTab>("overview");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [listings, setListings] = useState<MarketListing[]>(MARKET_LISTINGS);

  /* registry filters */
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 8;

  /* maintenance filter */
  const [maintFilter, setMaintFilter] = useState("All");

  const open = (s: ModalState) => setModal(s);
  const close = () => setModal(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EQUIPMENT.filter(
      (e) =>
        (cat === "All" || e.category === cat) &&
        (q === "" || `${e.id} ${e.name} ${e.make} ${e.subCategory}`.toLowerCase().includes(q)),
    );
  }, [query, cat]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  const maintRows = MAINTENANCE.filter(
    (m) => maintFilter === "All" || m.status === maintFilter,
  );

  const overdue = MAINTENANCE.filter((m) => m.status === "Overdue");
  const upcoming = MAINTENANCE.filter((m) => m.status === "Upcoming");
  const hireOutIncome = HIRE_OUT.reduce((s, h) => s + h.income, 0);
  const topAssets = [...EQUIPMENT].sort((a, b) => b.valueListed - a.valueListed).slice(0, 5);

  return (
    <main className="gm-app-page gm-mach-page">
      <div className="gm-container py-4">
        {/* breadcrumb */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Link to="/app/dashboard" className="gm-back-link">
            Dashboard
          </Link>
          <span className="gm-breadcrumb-sep">/</span>
          <span className="text-muted">Farm</span>
          <span className="gm-breadcrumb-sep">/</span>
          <strong>Machinery &amp; equipment</strong>
          <StatusChip label={`${MACH_CONTEXT.today} · diesel ${kes(MACH_CONTEXT.dieselPrice)}/L`} tone="neutral" />
        </div>

        <MachHero onExport={() => open({ kind: "export" })} />

        <PlannerSubtabs<MachTab>
          value={tab}
          onChange={setTab}
          label="Machinery sections"
          items={[
            { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
            { id: "registry", label: "Registry", icon: <Boxes size={14} />, count: EQUIPMENT.length },
            { id: "maintenance", label: "Maintenance", icon: <Wrench size={14} />, count: overdue.length },
            { id: "usage", label: "Usage", icon: <ClipboardList size={14} /> },
            { id: "hire", label: "Hire in / out", icon: <HandCoins size={14} /> },
            { id: "fuel", label: "Fuel & energy", icon: <FuelIcon size={14} /> },
            { id: "assets", label: "Depreciation", icon: <TrendingDown size={14} /> },
          ]}
        />

        {/* ============ OVERVIEW ============ */}
        {tab === "overview" && (
          <div>
            <div className="gm-statgrid">
              <DashboardMetric
                icon={Boxes}
                label="Asset value (15 items)"
                value={kes(EQUIPMENT_TOTAL_VALUE)}
                note="4 tractors/implements tracked for depreciation"
              />
              <DashboardMetric
                icon={Wrench}
                label="Maintenance"
                value={`${overdue.length} overdue`}
                note={`${upcoming.length} upcoming · ${MAINTENANCE.length} tasks scheduled`}
              />
              <DashboardMetric
                icon={FuelIcon}
                label="Fuel this month"
                value={kes(FUEL_MONTH_TOTAL.total)}
                note={`${FUEL_MONTH_TOTAL.litres} L diesel · 5.83 L/hr — 17% high`}
              />
              <DashboardMetric
                icon={HandCoins}
                label="Hired out (season)"
                value={kes(hireOutIncome)}
                note="3 jobs · 1 pending collection"
              />
            </div>

            <div className="gm-mach-overview-grid">
              <Reveal>
                <section className="gm-card">
                  <DashboardSectionHeader
                    eyebrow="Top assets"
                    title="What the machines are worth"
                    subtitle="Five highest-value items from the registry."
                    action={
                      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTab("registry")}>
                        Full registry
                      </button>
                    }
                  />
                  <div className="gm-mach-toplist">
                    {topAssets.map((e) => (
                      <button key={e.id} type="button" className="gm-mach-toprow" onClick={() => open({ kind: "equipment", equipmentId: e.id })}>
                        <span className="gm-mach-cat-ic">{categoryIcon(e.category)}</span>
                        <span className="gm-mach-topmain">
                          <strong>{e.name}</strong>
                          <small>
                            {e.id} · {e.condition} · {e.status}
                          </small>
                        </span>
                        <strong className="gm-mach-topval font-display">{kes(e.valueListed)}</strong>
                      </button>
                    ))}
                  </div>
                </section>
              </Reveal>

              <div className="gm-mach-overview-side">
                <Reveal>
                  <section className="gm-card">
                    <DashboardSectionHeader
                      eyebrow="Watch list"
                      title="Machinery alerts"
                    />
                    <ul className="gm-alert-list">
                      {MACH_ALERTS.map((a) => (
                        <li key={a.id} className={`gm-alert ${a.tone}`}>
                          <StatusChip
                            label={a.tone === "warn" ? "Watch" : a.tone === "info" ? "Info" : "OK"}
                            tone={a.tone === "warn" ? "medium" : a.tone === "info" ? "neutral" : "low"}
                          />
                          <span>{a.text}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
                <Reveal>
                  <section className="gm-card">
                    <DashboardSectionHeader
                      eyebrow="Due soon"
                      title="Next 5 service tasks"
                      action={
                        <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => setTab("maintenance")}>
                          All {MAINTENANCE.length}
                        </button>
                      }
                    />
                    {MAINTENANCE.slice(0, 5).map((m) => (
                      <button key={m.id} type="button" className="gm-mach-toprow" onClick={() => open({ kind: "service", maintId: m.id })}>
                        <span className="gm-mach-topmain">
                          <strong>{eqById(m.equipmentId).name}</strong>
                          <small>
                            {m.service} · due {m.nextDue}
                          </small>
                        </span>
                        <StatusChip
                          label={m.status}
                          tone={m.status === "Overdue" ? "high" : m.status === "Upcoming" ? "medium" : m.status === "OK" ? "low" : "neutral"}
                        />
                      </button>
                    ))}
                  </section>
                </Reveal>
                <Reveal>
                  <section className="gm-card">
                    <DashboardSectionHeader eyebrow="Quick actions" title="Do it from here" />
                    <div className="gm-quickgrid">
                      <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "add-equipment" })}>
                        <Plus size={14} /> Add equipment
                      </button>
                      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "usage" })}>
                        <ClipboardList size={14} /> Log usage
                      </button>
                      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "fuel" })}>
                        <FuelIcon size={14} /> Log fuel
                      </button>
                      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "publish" })}>
                        <Store size={14} /> Marketplace
                      </button>
                    </div>
                  </section>
                </Reveal>
              </div>
            </div>
          </div>
        )}

        {/* ============ REGISTRY (20.1) ============ */}
        {tab === "registry" && (
          <div>
            <Reveal>
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Equipment registry · 24 fields per item"
                  title={`The equipment list — ${EQUIPMENT.length} items, ${kes(EQUIPMENT_TOTAL_VALUE)}`}
                  subtitle="Search or filter by category — every row opens the full equipment record."
                  action={
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "add-equipment" })}>
                      <Plus size={14} /> Add equipment
                    </button>
                  }
                />
                <div className="gm-mach-filters">
                  <input
                    className="gm-input gm-mach-search"
                    placeholder="Search by ID, name, make…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    aria-label="Search equipment"
                  />
                  <div className="gm-filter-chips" role="group" aria-label="Filter by category">
                    {["All", ...CATEGORIES].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`gm-filter-chip ${cat === c ? "on" : ""}`}
                        aria-pressed={cat === c}
                        onClick={() => {
                          setCat(c);
                          setPage(1);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <EquipTable
                  rows={pageRows}
                  onOpen={(id) => open({ kind: "equipment", equipmentId: id })}
                  onEdit={(id) => open({ kind: "edit-equipment", equipmentId: id })}
                />
                <Pagination
                  page={page}
                  total={pages}
                  onChange={setPage}
                  perPage={perPage}
                  totalItems={filtered.length}
                />
              </section>
            </Reveal>
          </div>
        )}

        {/* ============ MAINTENANCE (20.2) ============ */}
        {tab === "maintenance" && (
          <div>
            <Reveal>
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Maintenance scheduler"
                  title={`${MAINTENANCE.length} scheduled tasks`}
                  subtitle="Oil changes, greasing, flushing, panel cleaning — the full season plan."
                  action={
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "maint-report" })}>
                      Full report
                    </button>
                  }
                />
                <div className="gm-filter-chips" role="group" aria-label="Filter by status">
                  {["All", "Overdue", "Upcoming", "OK", "Future", "Every use"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`gm-filter-chip ${maintFilter === st ? "on" : ""}`}
                      aria-pressed={maintFilter === st}
                      onClick={() => setMaintFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <MaintTable
                  rows={maintRows}
                  onOpen={(m) => open({ kind: "service", maintId: m.id })}
                  onDone={(m) => open({ kind: "service", maintId: m.id })}
                />
                <p className="gm-muted mt-2 mb-0">
                  “Mark done” closes the task, records the actual cost and moves
                  the next due date one cycle forward ({MAINTENANCE[0].frequency} and
                  friends). Overdue tasks are highlighted red on the map of the schedule.
                </p>
              </section>
            </Reveal>
          </div>
        )}

        {/* ============ USAGE (20.3) ============ */}
        {tab === "usage" && (
          <div>
            <Reveal>
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Usage log"
                  title="What ran, and who drove it"
                  subtitle="Every machine hour lands here — hours, fuel, operator, plot."
                  action={
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "usage" })}>
                      <Plus size={14} /> Log usage
                    </button>
                  }
                />
                <UsageTable
                  rows={USAGE_LOG}
                  onOpen={(u) => open({ kind: "equipment", equipmentId: u.equipmentId })}
                />
              </section>
            </Reveal>
            <Reveal>
              <section className="gm-card mt-4">
                <DashboardSectionHeader
                  eyebrow="Usage analytics"
                  title="Cost per hour, revenue attributed"
                  action={
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "usage-report" })}>
                      Usage report
                    </button>
                  }
                />
                <UsageAnalyticsTable rows={USAGE_ANALYTICS} />
                <p className="gm-muted mt-2 mb-0">
                  The MF 35 earns {kes(120000)} in ploughing services against
                  {kes(776)}/hr all-in cost — hire-out is the profit line. The drip
                  kit is solar, so its {kes(10)}/hr is maintenance only.
                </p>
              </section>
            </Reveal>
          </div>
        )}

        {/* ============ HIRE (20.4) ============ */}
        {tab === "hire" && (
          <div>
            <div className="gm-mach-grid-2">
              <Reveal>
                <section className="gm-card">
                  <DashboardSectionHeader
                    eyebrow="Hire in"
                    title="Machines we rented"
                    action={
                      <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "hire-in" })}>
                        <Plus size={14} /> Hire in
                      </button>
                    }
                  />
                  <HireInTable
                    rows={HIRE_IN}
                    onOpen={(h) => open({ kind: "contact", contactName: h.owner, contactPhone: h.ownerPhone })}
                  />
                </section>
              </Reveal>
              <Reveal>
                <section className="gm-card">
                  <DashboardSectionHeader
                    eyebrow="Hire out"
                    title="Machines we rented out"
                    action={
                      <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "hire-out" })}>
                        <Plus size={14} /> Record hire-out
                      </button>
                    }
                  />
                  <HireOutTable
                    rows={HIRE_OUT}
                    onOpen={(h) => open({ kind: "contact", contactName: h.hirer, contactPhone: h.hirerPhone })}
                    onCollect={(h) => open({ kind: "hire-receipt", hireOutId: h.id })}
                  />
                </section>
              </Reveal>
            </div>

            <Reveal>
              <section className="gm-card mt-4">
                <DashboardSectionHeader
                  eyebrow="Rate card"
                  title="Your hire-out rates"
                  subtitle="What you charge, the minimum hire, and what is included — farmers see this on your profile."
                  action={
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "rate-add" })}>
                      <Plus size={14} /> Add rate
                    </button>
                  }
                />
                <RateCardTable
                  rows={RATE_CARD}
                  onEdit={(r) => open({ kind: "rate-edit", rateId: r.id })}
                  onAdd={() => open({ kind: "rate-add" })}
                />
              </section>
            </Reveal>

            <Reveal>
              <section className="gm-card mt-4">
                <DashboardSectionHeader
                  eyebrow="GrowMO Equipment Marketplace"
                  title="Listed for 240 farmers within 25 km"
                  subtitle="Publish a machine, set the terms, and bookings land in your Inbox."
                  action={
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "publish" })}>
                      <Store size={14} /> Publish a machine
                    </button>
                  }
                />
                {listings.length === 0 ? (
                  <p className="gm-muted">Nothing listed right now — publish a machine above.</p>
                ) : (
                  <div className="gm-listing-stack">
                    {listings.map((l) => (
                      <ListingCard
                        key={l.id}
                        l={l}
                        onOpen={() => open({ kind: "listing", listingId: l.id })}
                        onPause={() => {
                          setListings((ls) => ls.map((x) => (x.id === l.id ? { ...x, status: x.status === "Active" ? "Paused" : "Active" } : x)));
                          toast.notify(`${l.id} ${l.status === "Active" ? "paused" : "resumed"} on the marketplace`);
                        }}
                        onDelist={() => open({ kind: "delist", listingId: l.id })}
                      />
                    ))}
                  </div>
                )}
              </section>
            </Reveal>
          </div>
        )}

        {/* ============ FUEL (20.5) ============ */}
        {tab === "fuel" && (
          <div>
            <Reveal>
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Fuel tracking"
                  title={`October — ${FUEL_MONTH_TOTAL.litres} L, ${kes(FUEL_MONTH_TOTAL.total)}`}
                  subtitle={`Diesel at ${kes(MACH_CONTEXT.dieselPrice)}/L · receipt photographed on the big fill-up.`}
                  action={
                    <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "fuel" })}>
                      <Plus size={14} /> Log fuel
                    </button>
                  }
                />
                <FuelTable rows={FUEL_LOG} onOpen={(f) => open({ kind: "equipment", equipmentId: f.equipmentId })} />
              </section>
            </Reveal>
            <div className="gm-mach-grid-2 mt-4">
              <Reveal>
                <section className="gm-card">
                  <DashboardSectionHeader
                    eyebrow="Fuel efficiency"
                    title="Litres per hour vs standard"
                    action={
                      <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "fuel-report" })}>
                        Fuel report
                      </button>
                    }
                  />
                  <FuelEffTable rows={FUEL_EFFICIENCY} />
                </section>
              </Reveal>
              <Reveal>
                <section className="gm-card">
                  <DashboardSectionHeader eyebrow="Trend" title="Getting 17% thirstier" />
                  <EffChart rows={FUEL_EFFICIENCY} />
                  <p className="gm-muted mt-2 mb-0">
                    September ran 5.33 L/hr — already warm. October jumped to 5.83.
                    The MF 35 is rated {MACH_CONTEXT.standardFuelLph} L/hr; check the
                    air filter, tire pressure and brakes in that order.
                  </p>
                </section>
              </Reveal>
            </div>
          </div>
        )}

        {/* ============ ASSETS (20.6) ============ */}
        {tab === "assets" && (
          <div>
            <Reveal>
              <section className="gm-card">
                <DashboardSectionHeader
                  eyebrow="Depreciation & asset valuation"
                  title="What the farm's iron is worth"
                  subtitle="Straight-line on the four tracked assets; everything else carried at registry value."
                  action={
                    <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "assets-report" })}>
                      Asset report
                    </button>
                  }
                />
                <DepTable
                  rows={DEPRECIATION}
                  onOpen={(id) => open({ kind: "equipment", equipmentId: id })}
                />
                <div className="gm-quickrow mt-3">
                  <button type="button" className="gm-btn gm-btn-lime gm-btn-sm" onClick={() => open({ kind: "depreciation", equipmentId: "EQ-001" })}>
                    <TrendingDown size={14} /> Open the depreciation calculator
                  </button>
                  <button type="button" className="gm-btn gm-btn-outline gm-btn-sm" onClick={() => open({ kind: "export" })}>
                    Export asset report
                  </button>
                </div>
              </section>
            </Reveal>
          </div>
        )}
      </div>

      {/* ============ MODALS (26 kinds) ============ */}
      {modal?.kind === "equipment" && (
        <EquipmentDrawer open state={modal} onClose={close} onOpen={open} />
      )}
      {modal?.kind === "add-equipment" && <AddEquipmentWizard state={modal} onClose={close} />}
      {modal?.kind === "edit-equipment" && <EditEquipmentModal state={modal} onClose={close} />}
      {modal?.kind === "condition" && <ConditionModal state={modal} onClose={close} />}
      {modal?.kind === "attachments" && <AttachmentsModal state={modal} onClose={close} />}
      {modal?.kind === "insurance" && <InsuranceModal state={modal} onClose={close} />}
      {modal?.kind === "photo" && <PhotoModal state={modal} onClose={close} />}
      {modal?.kind === "service" && <ServiceDoneModal state={modal} onClose={close} />}
      {modal?.kind === "schedule" && <ScheduleModal state={modal} onClose={close} />}
      {modal?.kind === "maint-report" && <MaintReportModal state={modal} onClose={close} />}
      {modal?.kind === "usage" && <UsageLogModal state={modal} onClose={close} />}
      {modal?.kind === "usage-report" && <UsageReportModal state={modal} onClose={close} />}
      {modal?.kind === "hire-in" && <HireInModal state={modal} onClose={close} />}
      {modal?.kind === "hire-out" && <HireOutModal state={modal} onClose={close} />}
      {modal?.kind === "hire-receipt" && <HireReceiptModal state={modal} onClose={close} />}
      {modal?.kind === "rate-edit" && <RateEditModal state={modal} onClose={close} />}
      {modal?.kind === "rate-add" && <RateAddModal state={modal} onClose={close} />}
      {modal?.kind === "publish" && <PublishModal state={modal} onClose={close} />}
      {modal?.kind === "delist" && <DelistModal state={modal} onClose={close} />}
      {modal?.kind === "listing" && <ListingModal state={modal} onClose={close} onOpen={open} />}
      {modal?.kind === "fuel" && <FuelLogModal state={modal} onClose={close} />}
      {modal?.kind === "fuel-report" && <FuelReportModal state={modal} onClose={close} />}
      {modal?.kind === "depreciation" && <DepreciationModal state={modal} onClose={close} />}
      {modal?.kind === "assets-report" && <AssetsReportModal state={modal} onClose={close} onOpen={open} />}
      {modal?.kind === "export" && <ExportModal state={modal} onClose={close} />}
      {modal?.kind === "contact" && <ContactModal state={modal} onClose={close} />}
    </main>
  );
}
