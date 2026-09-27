/* ============================================================================
   PAGE 20 — MACHINERY & EQUIPMENT MANAGEMENT  (/app/machinery)

   Blueprint sections implemented:
   20.1 equipment registry        20.2 maintenance scheduler
   20.3 usage log + analytics     20.4 hire in / hire out management
   20.5 fuel & energy tracking    20.6 depreciation & asset valuation

   The page keeps a live local machinery book: filters and pagination work,
   equipment records open in a drawer, service jobs can be completed, and the
   M-Pesa hire flow, fuel entries and multi-step record workflows update the
   visible farm file without a backend.
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  Fuel,
  Gauge,
  HandCoins,
  LayoutList,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Tractor,
  Trash2,
  TrendingDown,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  MachineryModalHub,
  type MachineryModalId,
} from "../../components/app/MachineryModals";
import {
  AssetCard,
  MachineryHero,
  MetricCallout,
  ServiceTaskRow,
} from "../../components/app/MachineryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  EQUIPMENT_ASSETS,
  EQUIPMENT_CATEGORIES,
  type EquipmentAsset,
  type EquipmentCategory,
  equipmentTone,
  FUEL_ENTRIES,
  type FuelEntry,
  HIRE_RATES,
  HIRE_RECORDS,
  type HireRecord,
  MACHINERY_CONTEXT,
  MAINTENANCE_TASKS,
  type MaintenanceTask,
  maintenanceTone,
  USAGE_ANALYTICS,
  USAGE_LOGS,
  type UsageLog,
  VALUATION_ROWS,
} from "../../data/app/machinery";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/machinery")({
  component: MachineryPage,
});

type MachineryView =
  | "registry"
  | "maintenance"
  | "usage"
  | "hire"
  | "fuel"
  | "valuation";
type DrawerId = "asset" | "usage" | "hire" | null;

function statusTone(
  status: HireRecord["status"],
): "low" | "medium" | "neutral" {
  if (status === "Completed") return "low";
  if (status === "Pending") return "medium";
  return "neutral";
}

function downloadReport(rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "marys-farm-machinery-register.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function MachineryPage() {
  const toast = useToast();
  const [view, setView] = useState<MachineryView>("registry");
  const [assets, setAssets] = useState(EQUIPMENT_ASSETS);
  const [maintenance, setMaintenance] = useState(MAINTENANCE_TASKS);
  const [fuelEntries, setFuelEntries] = useState(FUEL_ENTRIES);
  const [usageEntries, setUsageEntries] = useState(USAGE_LOGS);
  const [hires, setHires] = useState(HIRE_RECORDS);
  const [modal, setModal] = useState<MachineryModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedAsset, setSelectedAsset] = useState<EquipmentAsset | null>(
    EQUIPMENT_ASSETS[0],
  );
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(
    MAINTENANCE_TASKS[0],
  );
  const [selectedUsage, setSelectedUsage] = useState<UsageLog | null>(
    USAGE_LOGS[0],
  );
  const [selectedHire, setSelectedHire] = useState<HireRecord | null>(
    HIRE_RECORDS[0],
  );
  const [selectedFuel, setSelectedFuel] = useState<FuelEntry | null>(
    FUEL_ENTRIES[0],
  );
  const [assetSearch, setAssetSearch] = useState("");
  const [category, setCategory] = useState<"All" | EquipmentCategory>("All");
  const [assetPage, setAssetPage] = useState(1);
  const [maintenanceFilter, setMaintenanceFilter] = useState<
    "All" | MaintenanceTask["status"]
  >("All");
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [usageSearch, setUsageSearch] = useState("");
  const [usagePage, setUsagePage] = useState(1);
  const [assetMenu, setAssetMenu] = useState<string | null>(null);

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        const query =
          `${asset.id} ${asset.name} ${asset.category} ${asset.makeModel} ${asset.storage}`.toLowerCase();
        return (
          (!assetSearch || query.includes(assetSearch.toLowerCase())) &&
          (category === "All" || asset.category === category)
        );
      }),
    [assets, assetSearch, category],
  );
  const assetsPerPage = 6;
  const assetPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / assetsPerPage),
  );
  const displayedAssets = filteredAssets.slice(
    (assetPage - 1) * assetsPerPage,
    assetPage * assetsPerPage,
  );

  const filteredMaintenance = useMemo(
    () =>
      maintenance.filter(
        (task) =>
          maintenanceFilter === "All" || task.status === maintenanceFilter,
      ),
    [maintenance, maintenanceFilter],
  );
  const maintenancePerPage = 6;
  const maintenancePages = Math.max(
    1,
    Math.ceil(filteredMaintenance.length / maintenancePerPage),
  );
  const displayedMaintenance = filteredMaintenance.slice(
    (maintenancePage - 1) * maintenancePerPage,
    maintenancePage * maintenancePerPage,
  );

  const filteredUsage = useMemo(
    () =>
      usageEntries.filter((usage) =>
        `${usage.date} ${usage.equipment} ${usage.activity} ${usage.operator} ${usage.plot}`
          .toLowerCase()
          .includes(usageSearch.toLowerCase()),
      ),
    [usageEntries, usageSearch],
  );
  const usagePerPage = 6;
  const usagePages = Math.max(
    1,
    Math.ceil(filteredUsage.length / usagePerPage),
  );
  const displayedUsage = filteredUsage.slice(
    (usagePage - 1) * usagePerPage,
    usagePage * usagePerPage,
  );

  const currentValue = assets.reduce(
    (sum, asset) => sum + asset.currentValue,
    0,
  );
  const overdue = maintenance.filter(
    (task) => task.status === "Overdue",
  ).length;
  const fuelCost = fuelEntries.reduce((sum, entry) => sum + entry.total, 0);
  const hireIncome = hires
    .filter((hire) => hire.direction === "Out")
    .reduce((sum, hire) => sum + hire.total, 0);

  const openAsset = (asset: EquipmentAsset) => {
    setSelectedAsset(asset);
    setDrawer("asset");
  };
  const openTask = (task: MaintenanceTask, next: MachineryModalId) => {
    setSelectedTask(task);
    setModal(next);
  };
  const openUsage = (
    usage: UsageLog,
    next: MachineryModalId,
    asDrawer = false,
  ) => {
    setSelectedUsage(usage);
    if (asDrawer) setDrawer("usage");
    else setModal(next);
  };
  const openHire = (
    hire: HireRecord,
    next: MachineryModalId,
    asDrawer = false,
  ) => {
    setSelectedHire(hire);
    if (asDrawer) setDrawer("hire");
    else setModal(next);
  };

  const saveWorkflow = (message: string) => {
    if (modal === "archive-asset" && selectedAsset) {
      setAssets((items) =>
        items.filter((asset) => asset.id !== selectedAsset.id),
      );
      setDrawer(null);
    }
    if (modal === "complete-service" && selectedTask) {
      setMaintenance((items) =>
        items.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                status: "OK",
                lastDone: "30 Oct 2026",
                nextDue: "Next service interval",
              }
            : task,
        ),
      );
    }
    if (modal === "register") {
      setAssets((items) => [
        ...items,
        {
          ...EQUIPMENT_ASSETS[8],
          id: `EQ-${String(items.length + 1).padStart(3, "0")}`,
          name: "Farm hand cart",
          makeModel: "Jua Kali steel cart",
          year: 2026,
          purchaseDate: "30 Oct 2026",
          purchasePrice: 12000,
          currentValue: 12000,
          notes: "New equipment record added from the machinery register.",
        },
      ]);
    }
    if (modal === "log-fuel") {
      setFuelEntries((items) => [
        ...items,
        {
          id: `FE-${String(items.length + 1).padStart(3, "0")}`,
          date: "30 Oct 2026",
          fuelType: "Diesel",
          quantity: 20,
          pricePerLitre: 195,
          total: 3900,
          equipment: "MF 35",
          receipt: "RCPT-9012",
        },
      ]);
    }
    if (modal === "log-usage" || modal === "duplicate-usage") {
      setUsageEntries((items) => [
        ...items,
        {
          ...USAGE_LOGS[0],
          id: `UL-${String(items.length + 1).padStart(3, "0")}`,
          date: "30 Oct 2026",
          activity:
            modal === "duplicate-usage"
              ? "Copied field activity"
              : "New field activity",
        },
      ]);
    }
    if (modal === "hire-in" || modal === "hire-out") {
      setHires((items) => [
        ...items,
        {
          ...HIRE_RECORDS[0],
          id: `${modal === "hire-in" ? "HI" : "HO"}-${String(items.length + 1).padStart(3, "0")}`,
          direction: modal === "hire-in" ? "In" : "Out",
          date: "30 Oct 2026",
          status: "Pending",
          payment: "Pending",
          total: modal === "hire-in" ? 3000 : 3500,
        },
      ]);
    }
    toast.notify(message, "success");
  };

  const exportDirect = () => {
    downloadReport([
      ["Equipment ID", "Name", "Category", "Condition", "Value", "Status"],
      ...assets.map((asset) => [
        asset.id,
        asset.name,
        asset.category,
        asset.condition,
        String(asset.currentValue),
        asset.status,
      ]),
    ]);
    toast.notify("Machinery register downloaded as CSV", "success");
  };

  const tabs = [
    {
      id: "registry" as const,
      label: "Registry",
      icon: <Tractor />,
      count: assets.length,
    },
    {
      id: "maintenance" as const,
      label: "Maintenance",
      icon: <Wrench />,
      count: overdue,
    },
    { id: "usage" as const, label: "Usage log", icon: <Activity /> },
    { id: "hire" as const, label: "Hire desk", icon: <HandCoins /> },
    { id: "fuel" as const, label: "Fuel & energy", icon: <Fuel /> },
    { id: "valuation" as const, label: "Asset value", icon: <TrendingDown /> },
  ];

  return (
    <main className="gm-app-inner">
      <Reveal>
        <MachineryHero
          kpis={[
            {
              icon: Tractor,
              label: "Equipment value",
              value: kes(currentValue),
              note: `${assets.length} registered assets`,
            },
            {
              icon: Wrench,
              label: "Care now",
              value: `${overdue} overdue`,
              note: "Service work needs attention",
            },
            {
              icon: Fuel,
              label: "October fuel",
              value: kes(fuelCost),
              note: `${fuelEntries.reduce((sum, entry) => sum + entry.quantity, 0)} L logged this month`,
            },
            {
              icon: HandCoins,
              label: "Hire income",
              value: kes(hireIncome),
              note: "Completed jobs this season",
            },
          ]}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal("register")}
              >
                <Plus /> Register equipment
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setModal("log-fuel")}
              >
                <Fuel /> Log fuel
              </button>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Open machinery tools"
                  onClick={() =>
                    setAssetMenu(assetMenu === "tools" ? null : "tools")
                  }
                >
                  <MoreHorizontal />
                </button>
                {assetMenu === "tools" ? (
                  <div className="gm-menu">
                    <button
                      type="button"
                      onClick={() => {
                        setAssetMenu(null);
                        setModal("import-log");
                      }}
                    >
                      <FileSpreadsheet /> Import log
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssetMenu(null);
                        setModal("export");
                      }}
                    >
                      <Download /> Prepare report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAssetMenu(null);
                        exportDirect();
                      }}
                    >
                      <Download /> Download CSV now
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>

      <div className="mt-4">
        <PlannerSubtabs
          value={view}
          items={tabs}
          onChange={setView}
          label="Machinery workspace"
        />
      </div>

      {view === "registry" ? (
        <RegistrySection
          assets={displayedAssets}
          total={filteredAssets.length}
          search={assetSearch}
          category={category}
          page={assetPage}
          pages={assetPages}
          openMenu={assetMenu}
          onSearch={(value) => {
            setAssetSearch(value);
            setAssetPage(1);
          }}
          onCategory={(value) => {
            setCategory(value);
            setAssetPage(1);
          }}
          onPage={setAssetPage}
          onOpen={openAsset}
          onEdit={(asset) => {
            setSelectedAsset(asset);
            setModal("edit-asset");
          }}
          onService={(asset) => {
            setSelectedAsset(asset);
            setModal("add-service");
          }}
          onMenu={setAssetMenu}
          onArchive={(asset) => {
            setSelectedAsset(asset);
            setModal("archive-asset");
          }}
          onInsurance={(asset) => {
            setSelectedAsset(asset);
            setModal("insurance");
          }}
        />
      ) : null}

      {view === "maintenance" ? (
        <MaintenanceSection
          tasks={displayedMaintenance}
          total={filteredMaintenance.length}
          filter={maintenanceFilter}
          page={maintenancePage}
          pages={maintenancePages}
          onFilter={(value) => {
            setMaintenanceFilter(value);
            setMaintenancePage(1);
          }}
          onPage={setMaintenancePage}
          onOpen={(task) => openTask(task, "service-detail")}
          onComplete={(task) => openTask(task, "complete-service")}
          onReschedule={(task) => openTask(task, "reschedule-service")}
          onAdd={() => setModal("add-service")}
          onBulk={() => setModal("bulk-service")}
          onReport={() => setModal("service-report")}
        />
      ) : null}

      {view === "usage" ? (
        <UsageSection
          logs={displayedUsage}
          total={filteredUsage.length}
          search={usageSearch}
          page={usagePage}
          pages={usagePages}
          onSearch={(value) => {
            setUsageSearch(value);
            setUsagePage(1);
          }}
          onPage={setUsagePage}
          onLog={() => setModal("log-usage")}
          onOpen={(usage) => openUsage(usage, "usage-detail")}
          onDrawer={(usage) => openUsage(usage, "usage-detail", true)}
          onDuplicate={(usage) => openUsage(usage, "duplicate-usage")}
        />
      ) : null}

      {view === "hire" ? (
        <HireSection
          hires={hires}
          onHireIn={() => setModal("hire-in")}
          onHireOut={() => setModal("hire-out")}
          onOpen={(hire) => openHire(hire, "booking-detail")}
          onSettle={(hire) => openHire(hire, "settle-hire")}
          onRateCard={() => setModal("rate-card")}
          onPublish={() => setModal("publish-market")}
        />
      ) : null}

      {view === "fuel" ? (
        <FuelSection
          entries={fuelEntries}
          total={fuelCost}
          onLog={() => setModal("log-fuel")}
          onReceipt={(fuel) => {
            setSelectedFuel(fuel);
            setModal("fuel-receipt");
          }}
          onCheck={() => setModal("energy-check")}
        />
      ) : null}

      {view === "valuation" ? (
        <ValuationSection
          onOpen={(id) => {
            setSelectedAsset(assets.find((asset) => asset.id === id) ?? null);
            setModal("valuation-detail");
          }}
          onSettings={() => setModal("depreciation-settings")}
          onExport={() => setModal("export")}
        />
      ) : null}

      <DashboardDrawer
        open={drawer === "asset" && Boolean(selectedAsset)}
        title={
          selectedAsset
            ? `${selectedAsset.id} · ${selectedAsset.name}`
            : "Equipment record"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("asset-detail");
              }}
            >
              <LayoutList /> Full record
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("attachments");
              }}
            >
              <ShieldCheck /> Add evidence
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setModal("edit-asset");
              }}
            >
              <Pencil /> Edit record
            </button>
          </>
        }
      >
        {selectedAsset ? (
          <AssetDrawer
            asset={selectedAsset}
            onService={() => {
              setDrawer(null);
              setModal("add-service");
            }}
            onInsurance={() => {
              setDrawer(null);
              setModal("insurance");
            }}
            onArchive={() => {
              setDrawer(null);
              setModal("archive-asset");
            }}
          />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "usage" && Boolean(selectedUsage)}
        title={
          selectedUsage ? `${selectedUsage.id} · Usage detail` : "Usage detail"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("usage-detail");
              }}
            >
              Full record
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => {
                setDrawer(null);
                setModal("duplicate-usage");
              }}
            >
              Copy entry
            </button>
          </>
        }
      >
        {selectedUsage ? <UsageDrawer usage={selectedUsage} /> : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "hire" && Boolean(selectedHire)}
        title={
          selectedHire ? `${selectedHire.id} · Hire booking` : "Hire booking"
        }
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => {
                setDrawer(null);
                setModal("booking-detail");
              }}
            >
              Open record
            </button>
            {selectedHire?.status === "Pending" ? (
              <button
                type="button"
                className="gm-btn gm-btn-mpesa"
                onClick={() => {
                  setDrawer(null);
                  setModal("settle-hire");
                }}
              >
                Settle by M-Pesa
              </button>
            ) : null}
          </>
        }
      >
        {selectedHire ? <HireDrawer hire={selectedHire} /> : null}
      </DashboardDrawer>

      <MachineryModalHub
        active={modal}
        asset={selectedAsset}
        task={selectedTask}
        usage={selectedUsage}
        hire={selectedHire}
        fuel={selectedFuel}
        onClose={() => setModal(null)}
        onSaved={saveWorkflow}
      />
    </main>
  );
}

function RegistrySection({
  assets,
  total,
  search,
  category,
  page,
  pages,
  openMenu,
  onSearch,
  onCategory,
  onPage,
  onOpen,
  onEdit,
  onService,
  onMenu,
  onArchive,
  onInsurance,
}: {
  assets: EquipmentAsset[];
  total: number;
  search: string;
  category: "All" | EquipmentCategory;
  page: number;
  pages: number;
  openMenu: string | null;
  onSearch: (value: string) => void;
  onCategory: (value: "All" | EquipmentCategory) => void;
  onPage: (page: number) => void;
  onOpen: (asset: EquipmentAsset) => void;
  onEdit: (asset: EquipmentAsset) => void;
  onService: (asset: EquipmentAsset) => void;
  onMenu: (id: string | null) => void;
  onArchive: (asset: EquipmentAsset) => void;
  onInsurance: (asset: EquipmentAsset) => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.1 · Equipment registry"
        title="The ownership record behind every tool"
        subtitle="Value, identity, insurance and storage stay beside the working condition — a useful asset file for the farm, cooperative or lender."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => onService(assets[0] ?? EQUIPMENT_ASSETS[0])}
          >
            <Wrench /> Schedule service
          </button>
        }
      />
      <div className="gm-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <label className="gm-field col-lg-7">
            <span className="gm-field-label">Search equipment</span>
            <span className="gm-search-field">
              <Search />
              <input
                value={search}
                onChange={(event) => onSearch(event.target.value)}
                placeholder="ID, equipment, make or storage location"
              />
            </span>
          </label>
          <label className="gm-field col-lg-5">
            <span className="gm-field-label">Category</span>
            <select
              className="gm-select"
              value={category}
              onChange={(event) =>
                onCategory(event.target.value as "All" | EquipmentCategory)
              }
            >
              <option value="All">All categories</option>
              {EQUIPMENT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="row g-3">
        {assets.map((asset) => (
          <div className="col-md-6 col-xl-4" key={asset.id}>
            <AssetCard
              asset={asset}
              tone={equipmentTone(asset.status)}
              onOpen={() => onOpen(asset)}
              onEdit={() => onEdit(asset)}
              onService={() => onService(asset)}
            />
            <div className="gm-dropdown position-relative d-inline-block mt-2">
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={() => onMenu(openMenu === asset.id ? null : asset.id)}
              >
                <MoreHorizontal /> More tools
              </button>
              {openMenu === asset.id ? (
                <div className="gm-menu">
                  <button
                    type="button"
                    onClick={() => {
                      onMenu(null);
                      onInsurance(asset);
                    }}
                  >
                    <ShieldCheck /> Insurance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMenu(null);
                      onArchive(asset);
                    }}
                    className="danger"
                  >
                    <Trash2 /> Archive record
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {!assets.length ? (
        <div className="gm-empty">
          <Tractor />
          <h3 className="font-display">No equipment matches this view</h3>
          <p>
            Clear the filter or register the next machine before work starts.
          </p>
        </div>
      ) : null}
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={6}
          totalItems={total}
        />
      </div>
    </section>
  );
}

function MaintenanceSection({
  tasks,
  total,
  filter,
  page,
  pages,
  onFilter,
  onPage,
  onOpen,
  onComplete,
  onReschedule,
  onAdd,
  onBulk,
  onReport,
}: {
  tasks: MaintenanceTask[];
  total: number;
  filter: "All" | MaintenanceTask["status"];
  page: number;
  pages: number;
  onFilter: (value: "All" | MaintenanceTask["status"]) => void;
  onPage: (page: number) => void;
  onOpen: (task: MaintenanceTask) => void;
  onComplete: (task: MaintenanceTask) => void;
  onReschedule: (task: MaintenanceTask) => void;
  onAdd: () => void;
  onBulk: () => void;
  onReport: () => void;
}) {
  const filters: ("All" | MaintenanceTask["status"])[] = [
    "All",
    "Overdue",
    "Upcoming",
    "OK",
    "Future",
    "After use",
  ];
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.2 · Maintenance scheduler"
        title="Service before the machine makes the decision"
        subtitle="Intervals, assigned hands and estimated costs keep a small breakdown from turning into a missed planting window."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onReport}
            >
              <FileSpreadsheet /> Service report
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onAdd}
            >
              <Plus /> Schedule service
            </button>
          </div>
        }
      />
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
            onClick={() => onFilter(item)}
          >
            {item}
            {item === "Overdue" ? <span className="gm-n">3</span> : null}
          </button>
        ))}
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm ms-sm-auto"
          onClick={onBulk}
        >
          <CalendarClock /> Plan service day
        </button>
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Equipment / service</th>
                <th>Frequency</th>
                <th>Last done</th>
                <th>Next due</th>
                <th>Estimate</th>
                <th>Assigned</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.equipment}</strong>
                    <small className="d-block text-muted">{task.service}</small>
                  </td>
                  <td>{task.frequency}</td>
                  <td>{task.lastDone}</td>
                  <td>{task.nextDue}</td>
                  <td className="font-display">
                    {task.estimatedCost ? kes(task.estimatedCost) : "Free"}
                  </td>
                  <td>{task.assignedTo}</td>
                  <td>
                    <StatusChip
                      label={task.status}
                      tone={maintenanceTone(task.status)}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${task.service}`}
                        onClick={() => onOpen(task)}
                      >
                        <LayoutList />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Reschedule ${task.service}`}
                        onClick={() => onReschedule(task)}
                      >
                        <Pencil />
                      </button>
                      {task.status !== "Future" &&
                      task.status !== "After use" ? (
                        <button
                          type="button"
                          className="gm-icon-btn"
                          aria-label={`Complete ${task.service}`}
                          onClick={() => onComplete(task)}
                        >
                          <CheckCircle2 />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={6}
          totalItems={total}
        />
      </div>
      <div className="row g-3 mt-1">
        {tasks.slice(0, 3).map((task) => (
          <div className="col-lg-4" key={`row-${task.id}`}>
            <ServiceTaskRow
              task={task}
              tone={maintenanceTone(task.status)}
              onOpen={() => onOpen(task)}
              onComplete={() => onComplete(task)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function UsageSection({
  logs,
  total,
  search,
  page,
  pages,
  onSearch,
  onPage,
  onLog,
  onOpen,
  onDrawer,
  onDuplicate,
}: {
  logs: UsageLog[];
  total: number;
  search: string;
  page: number;
  pages: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onLog: () => void;
  onOpen: (usage: UsageLog) => void;
  onDrawer: (usage: UsageLog) => void;
  onDuplicate: (usage: UsageLog) => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.3 · Usage log"
        title="See the cost and work behind every hour"
        subtitle="Operators, plot work and fuel are traceable from the first pass to a buyer delivery."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onLog}>
            <Plus /> Log equipment use
          </button>
        }
      />
      <div className="gm-card p-3 mb-3">
        <label className="gm-field mb-0">
          <span className="gm-field-label">Find a usage entry</span>
          <span className="gm-search-field">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Activity, operator, plot or equipment"
            />
          </span>
        </label>
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Equipment</th>
                <th>Activity</th>
                <th>Duration</th>
                <th>Fuel</th>
                <th>Operator</th>
                <th>Plot</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {logs.map((usage) => (
                <tr key={usage.id}>
                  <td>{usage.date}</td>
                  <td>
                    <strong>{usage.equipment}</strong>
                  </td>
                  <td>
                    {usage.activity}
                    <small className="d-block text-muted">{usage.notes}</small>
                  </td>
                  <td>{usage.duration}</td>
                  <td>{usage.fuelLitres ? `${usage.fuelLitres} L` : "—"}</td>
                  <td>{usage.operator}</td>
                  <td>{usage.plot}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Open ${usage.id}`}
                        onClick={() => onDrawer(usage)}
                      >
                        <LayoutList />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`View ${usage.id}`}
                        onClick={() => onOpen(usage)}
                      >
                        <Search />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        aria-label={`Copy ${usage.id}`}
                        onClick={() => onDuplicate(usage)}
                      >
                        <Plus />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination
          page={page}
          total={pages}
          onChange={onPage}
          perPage={6}
          totalItems={total}
        />
      </div>
      <DashboardSectionHeader
        eyebrow="Usage analytics"
        title="Run cost without guesswork"
        subtitle="This month&apos;s practical view of energy, maintenance and income tied to each asset."
      />
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Hours this month</th>
                <th>Hours this year</th>
                <th>Fuel cost</th>
                <th>Maintenance</th>
                <th>Cost / hour</th>
                <th>Revenue attributed</th>
              </tr>
            </thead>
            <tbody>
              {USAGE_ANALYTICS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.equipment}</strong>
                  </td>
                  <td>{row.monthHours}</td>
                  <td>{row.yearHours}</td>
                  <td className="font-display">{kes(row.fuelCost)}</td>
                  <td className="font-display">{kes(row.maintenanceCost)}</td>
                  <td className="font-display">{kes(row.costHour)}</td>
                  <td>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function HireSection({
  hires,
  onHireIn,
  onHireOut,
  onOpen,
  onSettle,
  onRateCard,
  onPublish,
}: {
  hires: HireRecord[];
  onHireIn: () => void;
  onHireOut: () => void;
  onOpen: (hire: HireRecord) => void;
  onSettle: (hire: HireRecord) => void;
  onRateCard: () => void;
  onPublish: () => void;
}) {
  const hireIn = hires.filter((hire) => hire.direction === "In");
  const hireOut = hires.filter((hire) => hire.direction === "Out");
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.4 · Hire in / hire out"
        title="A better rental record for both neighbours"
        subtitle="Protect costs when you hire in, earn with confidence when you hire out, and agree the rate before the keys move."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onHireIn}
            >
              <HandCoins /> Hire in
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onHireOut}
            >
              <Plus /> Hire out
            </button>
          </div>
        }
      />
      <div className="row g-3">
        <div className="col-xl-6">
          <div className="gm-card p-0 overflow-hidden h-100">
            <div className="p-3 border-bottom">
              <span className="gm-eyebrow">Hired in</span>
              <h3 className="font-display mb-0">Outside equipment</h3>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Equipment / owner</th>
                    <th>Rate</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {hireIn.map((hire) => (
                    <tr key={hire.id}>
                      <td>{hire.date}</td>
                      <td>
                        <strong>{hire.equipment}</strong>
                        <small className="d-block text-muted">
                          {hire.person} · {hire.purpose}
                        </small>
                      </td>
                      <td>{hire.rate}</td>
                      <td className="font-display">{kes(hire.total)}</td>
                      <td>
                        <StatusChip
                          label={hire.payment}
                          tone={hire.status === "Pending" ? "medium" : "low"}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gm-icon-btn"
                          aria-label={`Open ${hire.id}`}
                          onClick={() => onOpen(hire)}
                        >
                          <LayoutList />
                        </button>
                        {hire.status === "Pending" ? (
                          <button
                            type="button"
                            className="gm-btn gm-btn-mpesa gm-btn-sm"
                            onClick={() => onSettle(hire)}
                          >
                            Pay
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-xl-6">
          <div className="gm-card p-0 overflow-hidden h-100">
            <div className="p-3 border-bottom">
              <span className="gm-eyebrow">Hired out</span>
              <h3 className="font-display mb-0">Income from your equipment</h3>
            </div>
            <div className="gm-table-wrap">
              <table className="gm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Equipment / hirer</th>
                    <th>Rate</th>
                    <th>Income</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {hireOut.map((hire) => (
                    <tr key={hire.id}>
                      <td>{hire.date}</td>
                      <td>
                        <strong>{hire.equipment}</strong>
                        <small className="d-block text-muted">
                          {hire.person} · {hire.duration}
                        </small>
                      </td>
                      <td>{hire.rate}</td>
                      <td className="font-display">
                        {hire.total ? kes(hire.total) : "Family"}
                      </td>
                      <td>
                        <StatusChip
                          label={hire.status}
                          tone={statusTone(hire.status)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="gm-icon-btn"
                          aria-label={`Open ${hire.id}`}
                          onClick={() => onOpen(hire)}
                        >
                          <LayoutList />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <DashboardSectionHeader
        eyebrow="Farmer-set rate card"
        title="Rates that make the job worth it"
        subtitle="Rates are local, transparent and separate the operator, fuel and collection expectations."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onRateCard}
            >
              <Settings2 /> Edit rate card
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onPublish}
            >
              <MapPin /> Publish locally
            </button>
          </div>
        }
      />
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Rate type</th>
                <th>Rate</th>
                <th>Minimum</th>
                <th>Includes</th>
                <th>Location</th>
                <th>Listing</th>
              </tr>
            </thead>
            <tbody>
              {HIRE_RATES.map((rate) => (
                <tr key={rate.id}>
                  <td>
                    <strong>{rate.equipment}</strong>
                  </td>
                  <td>{rate.rateType}</td>
                  <td className="font-display">
                    {kes(rate.rate)}
                    {rate.unit}
                  </td>
                  <td>{rate.minimum}</td>
                  <td>{rate.includes}</td>
                  <td>{rate.location}</td>
                  <td>
                    <StatusChip
                      label={rate.published ? "Published" : "Private"}
                      tone={rate.published ? "low" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FuelSection({
  entries,
  total,
  onLog,
  onReceipt,
  onCheck,
}: {
  entries: FuelEntry[];
  total: number;
  onLog: () => void;
  onReceipt: (entry: FuelEntry) => void;
  onCheck: () => void;
}) {
  const litres = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.5 · Fuel & energy"
        title="Every litre has a machine and a reason"
        subtitle="Fuel purchases, hour meter context and a simple efficiency check expose the little leaks in a machinery budget."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onCheck}
            >
              <Gauge /> Check efficiency
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onLog}
            >
              <Fuel /> Log fuel
            </button>
          </div>
        }
      />
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <MetricCallout
            icon={Fuel}
            label="Fuel logged in October"
            value={`${litres} L`}
            note="Diesel purchases tied to the MF 35."
          />
        </div>
        <div className="col-md-4">
          <MetricCallout
            icon={CircleDollarSign}
            label="Fuel cost"
            value={kes(total)}
            note="Average KES 195 per litre."
          />
        </div>
        <div className="col-md-4">
          <MetricCallout
            icon={Gauge}
            label="Efficiency signal"
            value="5.83 L/hr"
            note="17% above 5 L/hr standard — inspect before next field run."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={onCheck}
              >
                Open check
              </button>
            }
          />
        </div>
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Fuel type</th>
                <th>Quantity</th>
                <th>Price / L</th>
                <th>Total</th>
                <th>Equipment</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{entry.fuelType}</td>
                  <td>{entry.quantity} L</td>
                  <td className="font-display">{kes(entry.pricePerLitre)}</td>
                  <td className="font-display">{kes(entry.total)}</td>
                  <td>{entry.equipment}</td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onReceipt(entry)}
                    >
                      {entry.receipt}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <strong>Month total</strong>
                </td>
                <td>
                  <strong>{litres} L</strong>
                </td>
                <td />
                <td className="font-display">
                  <strong>{kes(total)}</strong>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

function ValuationSection({
  onOpen,
  onSettings,
  onExport,
}: {
  onOpen: (id: string) => void;
  onSettings: () => void;
  onExport: () => void;
}) {
  return (
    <section className="mt-4">
      <DashboardSectionHeader
        eyebrow="20.6 · Depreciation & valuation"
        title="Know the difference between book value and market value"
        subtitle="A clean asset position supports insurance, farm finance and a sensible replacement plan."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onSettings}
            >
              <Settings2 /> Depreciation settings
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onExport}
            >
              <Download /> Export asset schedule
            </button>
          </div>
        }
      />
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <MetricCallout
            icon={Tractor}
            label="Current market estimate"
            value={kes(MACHINERY_CONTEXT.totalValue)}
            note="All equipment in the current registry."
          />
        </div>
        <div className="col-md-4">
          <MetricCallout
            icon={TrendingDown}
            label="Book value in focus"
            value={kes(
              VALUATION_ROWS.reduce((sum, row) => sum + row.bookValue, 0),
            )}
            note="Key depreciating assets shown below."
          />
        </div>
        <div className="col-md-4">
          <MetricCallout
            icon={ShieldCheck}
            label="Protection check"
            value="1 review due"
            note="Greenhouse cover should be reviewed before the short rains."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-soft gm-btn-sm"
                onClick={onSettings}
              >
                Review cover
              </button>
            }
          />
        </div>
      </div>
      <div className="gm-card p-0 overflow-hidden">
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Purchase price</th>
                <th>Purchase date</th>
                <th>Useful life</th>
                <th>Annual depreciation</th>
                <th>Current age</th>
                <th>Market value</th>
                <th>Book value</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {VALUATION_ROWS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.equipment}</strong>
                  </td>
                  <td className="font-display">{kes(row.purchasePrice)}</td>
                  <td>{row.purchaseDate}</td>
                  <td>{row.usefulLife}</td>
                  <td className="font-display">
                    {kes(row.annualDepreciation)}
                  </td>
                  <td>{row.currentAge}</td>
                  <td className="font-display">{kes(row.currentValue)}</td>
                  <td className="font-display">{kes(row.bookValue)}</td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onOpen(row.id)}
                    >
                      Compare
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="gm-cta-band mt-4">
        <div>
          <span className="gm-eyebrow on-dark">
            <span className="dot" /> Ready for finance
          </span>
          <h3 className="font-display mb-1">
            Keep farm assets ready for the next opportunity
          </h3>
          <p className="mb-0">
            Send the current register to{" "}
            <Link to="/app/finance">Farm Finance</Link> when preparing a
            lender-ready cash-flow or replacement plan.
          </p>
        </div>
        <Link to="/app/finance" className="gm-btn gm-btn-lime">
          Open farm finance <ChevronDown />
        </Link>
      </div>
    </section>
  );
}

function AssetDrawer({
  asset,
  onService,
  onInsurance,
  onArchive,
}: {
  asset: EquipmentAsset;
  onService: () => void;
  onInsurance: () => void;
  onArchive: () => void;
}) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <Tractor />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">{asset.category}</span>
          <h3 className="font-display mb-1">{asset.name}</h3>
          <p className="mb-0 text-muted">
            {asset.makeModel} · {asset.condition} · {asset.ownership}
          </p>
        </div>
        <StatusChip label={asset.status} tone={equipmentTone(asset.status)} />
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <CircleDollarSign />
          <small>Current value</small>
          <strong className="font-display">{kes(asset.currentValue)}</strong>
        </span>
        <span>
          <TrendingDown />
          <small>Depreciation</small>
          <strong>{asset.depreciationMethod}</strong>
        </span>
        <span>
          <Fuel />
          <small>Fuel / energy</small>
          <strong>{asset.fuelUse}</strong>
        </span>
        <span>
          <MapPin />
          <small>Stored at</small>
          <strong>{asset.storage}</strong>
        </span>
        <span>
          <ShieldCheck />
          <small>Insurance</small>
          <strong>{asset.insurance}</strong>
        </span>
        <span>
          <CalendarClock />
          <small>Purchase</small>
          <strong>{asset.purchaseDate}</strong>
        </span>
      </div>
      <div className="mt-3">
        <span className="gm-field-label">Compatible attachments</span>
        <div className="d-flex flex-wrap gap-2 mt-1">
          {asset.attachments.length ? (
            asset.attachments.map((item) => (
              <span className="gm-chip" key={item}>
                {item}
              </span>
            ))
          ) : (
            <span className="gm-chip">No attachment recorded</span>
          )}
        </div>
      </div>
      <div className="gm-check-row mt-3">
        <Activity />
        <span>
          <strong>Farm note</strong>
          <small>{asset.notes}</small>
        </span>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-soft"
          onClick={onInsurance}
        >
          <ShieldCheck /> Insurance check
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={onService}
        >
          <Wrench /> Schedule service
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={onArchive}
        >
          <Trash2 /> Archive
        </button>
      </div>
    </div>
  );
}

function UsageDrawer({ usage }: { usage: UsageLog }) {
  return (
    <div className="gm-check-list">
      <div className="gm-check-row">
        <Activity />
        <span>
          <strong>{usage.activity}</strong>
          <small>
            {usage.date} · {usage.equipment}
          </small>
        </span>
      </div>
      {[
        ["Duration", usage.duration],
        ["Fuel used", usage.fuelLitres ? `${usage.fuelLitres} L` : "No fuel"],
        ["Operator", usage.operator],
        ["Plot", usage.plot],
        ["Field note", usage.notes],
      ].map(([label, value]) => (
        <div className="gm-check-row" key={label}>
          <span style={{ flex: 1 }}>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}

function HireDrawer({ hire }: { hire: HireRecord }) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-mega-icon">
          <HandCoins />
        </span>
        <div style={{ flex: 1 }}>
          <span className="gm-eyebrow">
            Hire {hire.direction.toLowerCase()}
          </span>
          <h3 className="font-display mb-1">{hire.equipment}</h3>
          <p className="mb-0 text-muted">
            {hire.person} · {hire.phone} · {hire.date}
          </p>
        </div>
        <StatusChip label={hire.status} tone={statusTone(hire.status)} />
      </div>
      <div className="gm-plan-facts mt-3">
        <span>
          <CircleDollarSign />
          <small>Agreed rate</small>
          <strong>{hire.rate}</strong>
        </span>
        <span>
          <Activity />
          <small>Duration</small>
          <strong>{hire.duration}</strong>
        </span>
        <span>
          <MapPin />
          <small>Purpose</small>
          <strong>{hire.purpose}</strong>
        </span>
        <span>
          <ShieldCheck />
          <small>Payment</small>
          <strong>{hire.payment}</strong>
        </span>
      </div>
    </div>
  );
}
