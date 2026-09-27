/* ============================================================================
   PAGE 24 — POST-HARVEST HANDLING & STORAGE (/app/harvest)
   Crop-specific harvest units, grading, packing, storage and loss prevention.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  CloudSun,
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  PackageCheck,
  PackagePlus,
  Pencil,
  Plus,
  ScanLine,
  Search,
  Send,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  HarvestModalHub,
  type HarvestModalId,
} from "../../components/app/HarvestModals";
import {
  HarvestHero,
  StorageFacilityCard,
} from "../../components/app/HarvestWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  CABBAGE_HARVEST_DETAIL,
  CONDITION_MONITORS,
  CROP_UNITS,
  conditionTone,
  GRADING_STANDARDS,
  HARVEST_CONTEXT,
  HARVEST_RECORDS,
  type HarvestRecord,
  harvestTone,
  LOSS_RECOMMENDATIONS,
  LOSS_TRACKING,
  PACKING_OPTIONS,
  type PackingOption,
  STORAGE_FACILITIES,
  STORAGE_LOGS,
  type StorageFacility,
  type StorageLog,
  VALUE_ADDITION,
  type ValueAddition,
} from "../../data/app/harvest";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/harvest")({
  component: HarvestPage,
});

type View = "harvest" | "grading" | "storage" | "losses" | "value" | "units";
type GradeTab = "cabbage" | "tomato" | "potato";
type DrawerId = "harvest" | "facility" | "packing" | "storage" | "value" | null;

function HarvestPage() {
  const toast = useToast();
  const [view, setView] = useState<View>("harvest");
  const [gradeTab, setGradeTab] = useState<GradeTab>("cabbage");
  const [harvests, setHarvests] = useState(HARVEST_RECORDS);
  const [storageLogs, setStorageLogs] = useState(STORAGE_LOGS);
  const [modal, setModal] = useState<HarvestModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedHarvest, setSelectedHarvest] = useState<HarvestRecord | null>(
    HARVEST_RECORDS[0],
  );
  const [selectedFacility, setSelectedFacility] =
    useState<StorageFacility | null>(STORAGE_FACILITIES[0]);
  const [selectedPacking, setSelectedPacking] = useState<PackingOption | null>(
    PACKING_OPTIONS[0],
  );
  const [selectedStorage, setSelectedStorage] = useState<StorageLog | null>(
    STORAGE_LOGS[0],
  );
  const [selectedValue, setSelectedValue] = useState<ValueAddition | null>(
    VALUE_ADDITION[0],
  );
  const [menu, setMenu] = useState(false);
  const [harvestSearch, setHarvestSearch] = useState("");
  const [harvestStatus, setHarvestStatus] = useState<
    "All" | HarvestRecord["status"]
  >("All");
  const [harvestPage, setHarvestPage] = useState(1);
  const [storageSearch, setStorageSearch] = useState("");
  const [storageState, setStorageState] = useState<"All" | StorageLog["state"]>(
    "All",
  );
  const [storagePage, setStoragePage] = useState(1);
  const [packingSearch, setPackingSearch] = useState("");
  const [packingPage, setPackingPage] = useState(1);
  const [valueSearch, setValueSearch] = useState("");
  const [valuePage, setValuePage] = useState(1);

  const filteredHarvests = useMemo(
    () =>
      harvests.filter(
        (record) =>
          `${record.crop} ${record.plot} ${record.id} ${record.status}`
            .toLowerCase()
            .includes(harvestSearch.toLowerCase()) &&
          (harvestStatus === "All" || record.status === harvestStatus),
      ),
    [harvests, harvestSearch, harvestStatus],
  );
  const harvestPages = Math.max(1, Math.ceil(filteredHarvests.length / 5));
  const shownHarvests = filteredHarvests.slice(
    (harvestPage - 1) * 5,
    harvestPage * 5,
  );
  const filteredStorage = useMemo(
    () =>
      storageLogs.filter(
        (entry) =>
          `${entry.crop} ${entry.grade} ${entry.location} ${entry.state}`
            .toLowerCase()
            .includes(storageSearch.toLowerCase()) &&
          (storageState === "All" || entry.state === storageState),
      ),
    [storageLogs, storageSearch, storageState],
  );
  const storagePages = Math.max(1, Math.ceil(filteredStorage.length / 5));
  const shownStorage = filteredStorage.slice(
    (storagePage - 1) * 5,
    storagePage * 5,
  );
  const filteredPacking = useMemo(
    () =>
      PACKING_OPTIONS.filter((option) =>
        `${option.crop} ${option.package} ${option.shelfLife}`
          .toLowerCase()
          .includes(packingSearch.toLowerCase()),
      ),
    [packingSearch],
  );
  const packingPages = Math.max(1, Math.ceil(filteredPacking.length / 5));
  const shownPacking = filteredPacking.slice(
    (packingPage - 1) * 5,
    packingPage * 5,
  );
  const filteredValue = useMemo(
    () =>
      VALUE_ADDITION.filter((item) =>
        `${item.activity} ${item.input} ${item.output} ${item.state}`
          .toLowerCase()
          .includes(valueSearch.toLowerCase()),
      ),
    [valueSearch],
  );
  const valuePages = Math.max(1, Math.ceil(filteredValue.length / 4));
  const shownValue = filteredValue.slice((valuePage - 1) * 4, valuePage * 4);

  const openHarvest = (record: HarvestRecord) => {
    setSelectedHarvest(record);
    setDrawer("harvest");
  };
  const openFacility = (facility: StorageFacility) => {
    setSelectedFacility(facility);
    setDrawer("facility");
  };
  const openPacking = (option: PackingOption) => {
    setSelectedPacking(option);
    setDrawer("packing");
  };
  const openStorage = (entry: StorageLog) => {
    setSelectedStorage(entry);
    setDrawer("storage");
  };
  const openValue = (item: ValueAddition) => {
    setSelectedValue(item);
    setDrawer("value");
  };

  const savedWorkflow = (message: string) => {
    if (modal === "record-harvest")
      setHarvests((items) => [
        {
          id: `HRV-${String(items.length + 1).padStart(3, "0")}`,
          date: "18 Jan 2027",
          crop: "Cabbage Gloria F1",
          plot: "Plot 1 · 0.52 acres",
          quantity: "1,200 heads",
          weight: "2.1 tonnes",
          gradeA: "840 heads",
          yield: "Partial harvest",
          crew: "3 workers",
          status: "Recorded",
          value: 36000,
        },
        ...items,
      ]);
    if (modal === "delete-harvest" && selectedHarvest)
      setHarvests((items) =>
        items.filter((record) => record.id !== selectedHarvest.id),
      );
    if (modal === "storage-entry")
      setStorageLogs((items) => [
        {
          id: `LOG-${String(items.length + 1).padStart(3, "0")}`,
          date: "18 Jan",
          crop: "Cabbage Gloria F1",
          grade: "A",
          quantity: "840 heads",
          package: "34 crates",
          location: "Main shade",
          condition: "Firm, clean",
          duration: "48 hours",
          state: "In storage",
        },
        ...items,
      ]);
    if (modal === "release-storage" && selectedStorage)
      setStorageLogs((items) =>
        items.map((entry) =>
          entry.id === selectedStorage.id
            ? {
                ...entry,
                state: "Released",
                duration: "Released to buyer collection",
              }
            : entry,
        ),
      );
    toast.notify(message, "success");
  };

  return (
    <div>
      <HarvestHero
        metrics={[
          {
            icon: Sprout,
            value: "14,500",
            label: "heads harvested",
            note: "Cabbage Gloria F1 · Plot 1",
          },
          {
            icon: BadgeCheck,
            value: "10,000",
            label: "Grade A heads",
            note: "Premium buyer-ready quality",
          },
          {
            icon: Banknote,
            value: kes(HARVEST_CONTEXT.storedValue),
            label: "value in quality chain",
            note: "Harvest, storage and sale allocation",
          },
          {
            icon: TrendingDown,
            value: "8%",
            label: "loss to reduce",
            note: `${kes(HARVEST_CONTEXT.lossValue)} current exposure`,
          },
        ]}
        actions={
          <>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => setModal("record-harvest")}
            >
              <Plus /> Record harvest
            </button>
            <div className="gm-dropdown">
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setMenu((open) => !open)}
                aria-expanded={menu}
              >
                <MoreHorizontal /> Harvest tools
              </button>
              {menu ? (
                <div className="gm-menu">
                  <p className="gm-menuhead">Post-harvest tools</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("grade-batch");
                    }}
                  >
                    <ScanLine /> Grade a batch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("storage-entry");
                    }}
                  >
                    <Warehouse /> Add storage entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("export-harvest");
                    }}
                  >
                    <Download /> Export report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      setModal("share-quality");
                    }}
                  >
                    <Send /> Share quality summary
                  </button>
                </div>
              ) : null}
            </div>
          </>
        }
      />
      <PlannerSubtabs
        value={view}
        label="Post-harvest workspace"
        onChange={setView}
        items={[
          {
            id: "harvest",
            label: "Harvest log",
            icon: <Sprout />,
            count: harvests.length,
          },
          {
            id: "grading",
            label: "Grading & packing",
            icon: <ScanLine />,
            count: 9,
          },
          {
            id: "storage",
            label: "Storage",
            icon: <Warehouse />,
            count: storageLogs.length,
          },
          {
            id: "losses",
            label: "Loss control",
            icon: <TrendingDown />,
            count: 4,
          },
          {
            id: "value",
            label: "Value addition",
            icon: <TrendingUp />,
            count: 7,
          },
          {
            id: "units",
            label: "Crop units",
            icon: <ClipboardCheck />,
            count: 15,
          },
        ]}
      />
      {view === "harvest" ? (
        <HarvestContent
          records={shownHarvests}
          search={harvestSearch}
          status={harvestStatus}
          page={harvestPage}
          pages={harvestPages}
          total={filteredHarvests.length}
          onSearch={(value) => {
            setHarvestSearch(value);
            setHarvestPage(1);
          }}
          onStatus={(status) => {
            setHarvestStatus(status);
            setHarvestPage(1);
          }}
          onPage={setHarvestPage}
          onOpen={openHarvest}
          onModal={setModal}
        />
      ) : null}
      {view === "grading" ? (
        <GradingContent
          gradeTab={gradeTab}
          onGradeTab={setGradeTab}
          packing={shownPacking}
          search={packingSearch}
          page={packingPage}
          pages={packingPages}
          total={filteredPacking.length}
          onSearch={(value) => {
            setPackingSearch(value);
            setPackingPage(1);
          }}
          onPage={setPackingPage}
          onOpenPacking={openPacking}
          onModal={setModal}
        />
      ) : null}
      {view === "storage" ? (
        <StorageContent
          logs={shownStorage}
          search={storageSearch}
          state={storageState}
          page={storagePage}
          pages={storagePages}
          total={filteredStorage.length}
          onSearch={(value) => {
            setStorageSearch(value);
            setStoragePage(1);
          }}
          onState={(state) => {
            setStorageState(state);
            setStoragePage(1);
          }}
          onPage={setStoragePage}
          onFacility={openFacility}
          onStorage={openStorage}
          onModal={setModal}
        />
      ) : null}
      {view === "losses" ? <LossContent onModal={setModal} /> : null}
      {view === "value" ? (
        <ValueContent
          items={shownValue}
          search={valueSearch}
          page={valuePage}
          pages={valuePages}
          total={filteredValue.length}
          onSearch={(value) => {
            setValueSearch(value);
            setValuePage(1);
          }}
          onPage={setValuePage}
          onOpen={openValue}
          onModal={setModal}
        />
      ) : null}
      {view === "units" ? <UnitsContent onModal={setModal} /> : null}
      <HarvestDrawer
        drawer={drawer}
        harvest={selectedHarvest}
        facility={selectedFacility}
        packing={selectedPacking}
        storage={selectedStorage}
        valueAdd={selectedValue}
        onClose={() => setDrawer(null)}
        onModal={setModal}
      />
      <HarvestModalHub
        active={modal}
        harvest={selectedHarvest}
        facility={selectedFacility}
        packing={selectedPacking}
        storage={selectedStorage}
        valueAdd={selectedValue}
        onClose={() => setModal(null)}
        onSaved={savedWorkflow}
      />
    </div>
  );
}

function HarvestContent({
  records,
  search,
  status,
  page,
  pages,
  total,
  onSearch,
  onStatus,
  onPage,
  onOpen,
  onModal,
}: {
  records: HarvestRecord[];
  search: string;
  status: "All" | HarvestRecord["status"];
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onStatus: (status: "All" | HarvestRecord["status"]) => void;
  onPage: (page: number) => void;
  onOpen: (record: HarvestRecord) => void;
  onModal: (id: HarvestModalId) => void;
}) {
  return (
    <div className="mt-4">
      <div className="row g-3">
        <div className="col-lg-7">
          <Reveal>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Latest harvest · HRV-001"
                title="Cabbage Gloria F1 harvest is shaded and moving"
                subtitle="Plot 1 · 0.52 acres · harvested 15 January 2027 with a clear grade record and buyer-ready handling plan."
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime gm-btn-sm"
                    onClick={() => onModal("grade-batch")}
                  >
                    <ScanLine /> Grade batch
                  </button>
                }
              />
              <div className="row g-3 mt-1">
                {CABBAGE_HARVEST_DETAIL.grades.map((grade) => (
                  <div className="col-md-4" key={grade.grade}>
                    <div className="gm-check-row h-100">
                      <BadgeCheck />
                      <span>
                        <strong>
                          {grade.grade} · {grade.quantity}
                        </strong>
                        <small>
                          {grade.average} avg · {grade.weight}
                          <br />
                          {grade.note}
                        </small>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="gm-plan-detail-hero mt-3">
                <span className="gm-mega-icon">
                  <CloudSun />
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{CABBAGE_HARVEST_DETAIL.conditions}</strong>
                  <p className="mb-0 text-muted">
                    {CABBAGE_HARVEST_DETAIL.handling} ·{" "}
                    {CABBAGE_HARVEST_DETAIL.storage}
                  </p>
                </div>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("harvest-detail")}
                >
                  Open record
                </button>
              </div>
            </section>
          </Reveal>
        </div>
        <div className="col-lg-5">
          <Reveal delay={0.08}>
            <section className="gm-card h-100">
              <DashboardSectionHeader
                eyebrow="Harvest checklist"
                title="Protect this crop today"
                subtitle="Small handling choices protect price at the buyer handover."
              />
              <div className="gm-check-list mt-3">
                <ActionRow
                  icon={PackageCheck}
                  title="Crate Grade A within one hour"
                  note="334 crates planned; keep stack at four high"
                  label="Packing"
                  onClick={() => onModal("create-packing-run")}
                />
                <ActionRow
                  icon={Warehouse}
                  title="Release premium heads within 48 hours"
                  note="Storage risk grows after the buyer window"
                  label="Storage"
                  onClick={() => onModal("release-storage")}
                />
                <ActionRow
                  icon={Send}
                  title="Share quality summary with buyer"
                  note="Grade, handling and lot record in one sheet"
                  label="Share"
                  onClick={() => onModal("share-quality")}
                />
              </div>
            </section>
          </Reveal>
        </div>
      </div>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Harvest register"
          title="Crop-specific harvest records"
          subtitle="Search the log, track a realistic crop unit and open the complete yield and quality record."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("crop-units")}
            >
              <ClipboardCheck /> Unit guide
            </button>
          }
        />
        <div className="gm-toolbar mt-3">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search crop, plot, record or status"
            />
          </label>
          <select
            className="gm-select"
            value={status}
            onChange={(event) =>
              onStatus(event.target.value as "All" | HarvestRecord["status"])
            }
            aria-label="Filter harvest status"
          >
            <option>All</option>
            <option>Recorded</option>
            <option>Ready to grade</option>
            <option>Stored</option>
            <option>Sold</option>
          </select>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Harvest</th>
                <th>Plot</th>
                <th>Quantity / weight</th>
                <th>Grade A</th>
                <th>Yield</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onOpen(record)}
                    >
                      <strong>{record.crop}</strong>
                      <small>
                        {record.id} · {record.date}
                      </small>
                    </button>
                  </td>
                  <td>{record.plot}</td>
                  <td>
                    {record.quantity}
                    <small>{record.weight}</small>
                  </td>
                  <td>{record.gradeA}</td>
                  <td>{record.yield}</td>
                  <td>
                    <strong>{kes(record.value)}</strong>
                  </td>
                  <td>
                    <StatusChip
                      label={record.status}
                      tone={harvestTone(record.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}
function ActionRow({
  icon: Icon,
  title,
  note,
  label,
  onClick,
}: {
  icon: typeof PackageCheck;
  title: string;
  note: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="gm-check-row">
      <Icon />
      <span style={{ flex: 1 }}>
        <strong>{title}</strong>
        <small>{note}</small>
      </span>
      <button
        type="button"
        className="gm-btn gm-btn-soft gm-btn-sm"
        onClick={onClick}
      >
        {label}
        <ChevronRight />
      </button>
    </div>
  );
}

function GradingContent({
  gradeTab,
  onGradeTab,
  packing,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onOpenPacking,
  onModal,
}: {
  gradeTab: GradeTab;
  onGradeTab: (tab: GradeTab) => void;
  packing: PackingOption[];
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onOpenPacking: (option: PackingOption) => void;
  onModal: (id: HarvestModalId) => void;
}) {
  const standards = GRADING_STANDARDS[gradeTab];
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Quality before price"
          title="Grade by a transparent market standard"
          subtitle="Use the right quality language when preparing a premium buyer batch, local-market lot or safe reject decision."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("quality-inspection")}
              >
                <ShieldCheck /> Inspect
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("grade-batch")}
              >
                <ScanLine /> Grade batch
              </button>
            </div>
          }
        />
        <PlannerSubtabs
          value={gradeTab}
          label="Crop grading standard"
          onChange={onGradeTab}
          items={[
            { id: "cabbage", label: "Cabbage Gloria F1" },
            { id: "tomato", label: "Tomato Anna F1" },
            { id: "potato", label: "Potato Shangi" },
          ]}
        />
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Size / weight</th>
                <th>Quality</th>
                <th>Defects</th>
                <th>Market</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((standard) => (
                <tr key={standard.grade}>
                  <td>
                    <strong>{standard.grade}</strong>
                  </td>
                  <td>{standard.size}</td>
                  <td>{standard.quality}</td>
                  <td>{standard.defects}</td>
                  <td>{standard.market}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => onModal("grading-standard")}
          >
            <FileText /> Standard detail
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={() => onModal("regrade-batch")}
          >
            <Pencil /> Regrade batch
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-danger-soft"
            onClick={() => onModal("reject-batch")}
          >
            Mark reject
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => onModal("print-grade-label")}
          >
            <FileSpreadsheet /> Grade label
          </button>
        </div>
      </section>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Packing & packaging"
          title="Package for the crop, shelf life and transport"
          subtitle="Use capacity and stack limits that protect crop quality rather than chasing the largest possible load."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("packaging-stock")}
            >
              <PackagePlus /> Check packaging stock
            </button>
          }
        />
        <div className="gm-toolbar mt-3">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search crop, package or shelf life"
            />
          </label>
          <button
            type="button"
            className="gm-btn gm-btn-mpesa gm-btn-sm ms-auto"
            onClick={() => onModal("buy-packaging")}
          >
            <ShoppingBasket /> Buy packaging
          </button>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Package</th>
                <th>Capacity</th>
                <th>Cost</th>
                <th>Stack limit</th>
                <th>Shelf life</th>
              </tr>
            </thead>
            <tbody>
              {packing.map((option) => (
                <tr key={option.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onOpenPacking(option)}
                    >
                      <strong>{option.crop}</strong>
                      <small>{option.id}</small>
                    </button>
                  </td>
                  <td>{option.package}</td>
                  <td>{option.quantity}</td>
                  <td>{kes(option.cost)}</td>
                  <td>{option.stack}</td>
                  <td>{option.shelfLife}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
    </div>
  );
}

function StorageContent({
  logs,
  search,
  state,
  page,
  pages,
  total,
  onSearch,
  onState,
  onPage,
  onFacility,
  onStorage,
  onModal,
}: {
  logs: StorageLog[];
  search: string;
  state: "All" | StorageLog["state"];
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onState: (state: "All" | StorageLog["state"]) => void;
  onPage: (page: number) => void;
  onFacility: (facility: StorageFacility) => void;
  onStorage: (entry: StorageLog) => void;
  onModal: (id: HarvestModalId) => void;
}) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Farm storage spaces"
          title="Match crop quality to the right storage conditions"
          subtitle="Availability alone is not enough: capacity, temperature, humidity and crop fit determine how long quality lasts."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("storage-entry")}
            >
              <Plus /> Add storage entry
            </button>
          }
        />
        <div className="row g-3 mt-1">
          {STORAGE_FACILITIES.map((facility) => (
            <div className="col-sm-6 col-xl-3" key={facility.id}>
              <StorageFacilityCard
                facility={facility}
                onOpen={() => onFacility(facility)}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Storage chain of custody"
          title="Ten current and completed storage records"
          subtitle="Log entry condition, package, location and release path for each crop-grade batch."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("record-condition")}
              >
                <Thermometer /> Log condition
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("move-storage")}
              >
                <ArrowRight /> Move batch
              </button>
            </div>
          }
        />
        <div className="gm-toolbar mt-3">
          <label className="gm-search">
            <Search />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search crop, grade or location"
            />
          </label>
          <select
            className="gm-select"
            value={state}
            onChange={(event) =>
              onState(event.target.value as "All" | StorageLog["state"])
            }
            aria-label="Filter storage state"
          >
            <option>All</option>
            <option>In storage</option>
            <option>Released</option>
            <option>Sold</option>
          </select>
        </div>
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Entry</th>
                <th>Grade / quantity</th>
                <th>Package</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Duration</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onStorage(entry)}
                    >
                      <strong>{entry.crop}</strong>
                      <small>
                        {entry.id} · {entry.date}
                      </small>
                    </button>
                  </td>
                  <td>
                    {entry.grade}
                    <small>{entry.quantity}</small>
                  </td>
                  <td>{entry.package}</td>
                  <td>{entry.location}</td>
                  <td>{entry.condition}</td>
                  <td>{entry.duration}</td>
                  <td>
                    <StatusChip
                      label={entry.state}
                      tone={entry.state === "In storage" ? "medium" : "low"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={pages}
          perPage={5}
          totalItems={total}
          onChange={onPage}
        />
      </section>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Conditions monitoring"
          title="Spot quality loss before it spreads"
          action={
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("condition-alert")}
            >
              <AlertTriangle /> Create alert
            </button>
          }
        />
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Method</th>
                <th>Target</th>
                <th>Alert threshold</th>
                <th>Current check</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {CONDITION_MONITORS.map((monitor) => (
                <tr key={monitor.id}>
                  <td>
                    <strong>{monitor.parameter}</strong>
                  </td>
                  <td>{monitor.method}</td>
                  <td>{monitor.target}</td>
                  <td>{monitor.alert}</td>
                  <td>{monitor.current}</td>
                  <td>
                    <StatusChip
                      label={monitor.status}
                      tone={conditionTone(monitor.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function LossContent({ onModal }: { onModal: (id: HarvestModalId) => void }) {
  return (
    <div className="mt-4">
      <section className="gm-card">
        <DashboardSectionHeader
          eyebrow="Post-harvest loss tracking"
          title="Keep loss visible, then remove its cause"
          subtitle="This cabbage route loses 8% of value across handling, storage, transport and the market. The record shows where to act first."
          action={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("record-loss")}
              >
                <Plus /> Record loss
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("approve-urgent-sale")}
              >
                <Send /> Approve urgent sale
              </button>
            </div>
          }
        />
        <div className="row g-3 mt-1">
          <Metric
            value="8%"
            label="total loss rate"
            note="Physical damage, shrinkage and rot"
          />
          <Metric
            value={kes(HARVEST_CONTEXT.lossValue)}
            label="value exposed"
            note="Current cabbage harvest pathway"
          />
          <Metric
            value="48 hours"
            label="Grade A sale window"
            note="Best control against storage loss"
          />
        </div>
        <div className="gm-table-wrap mt-4">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Loss type</th>
                <th>Before storage</th>
                <th>In storage</th>
                <th>Transport</th>
                <th>At market</th>
                <th>Total</th>
                <th>Value lost</th>
              </tr>
            </thead>
            <tbody>
              {LOSS_TRACKING.map((loss) => (
                <tr key={loss.id}>
                  <td>
                    <button
                      type="button"
                      className="gm-table-link"
                      onClick={() => onModal("loss-detail")}
                    >
                      <strong>{loss.type}</strong>
                      <small>{loss.id}</small>
                    </button>
                  </td>
                  <td>{loss.before}</td>
                  <td>{loss.storage}</td>
                  <td>{loss.transport}</td>
                  <td>{loss.market}</td>
                  <td>
                    <strong>{loss.total}</strong>
                  </td>
                  <td>{loss.value ? kes(loss.value) : "Quantity loss"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th>Total loss</th>
                <th>2.5%</th>
                <th>2.5%</th>
                <th>1.5%</th>
                <th>1.5%</th>
                <th>8%</th>
                <th>{kes(HARVEST_CONTEXT.lossValue)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
      <section className="gm-card mt-3">
        <DashboardSectionHeader
          eyebrow="Loss reduction actions"
          title="Make the next crate, store and trip count"
          subtitle="Choose a focused action before the current batch loses further quality."
        />
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Recommendation</th>
                <th>Expected reduction</th>
                <th>Potential saving</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {LOSS_RECOMMENDATIONS.map((recommendation) => (
                <tr key={recommendation.id}>
                  <td>
                    <strong>{recommendation.recommendation}</strong>
                  </td>
                  <td>{recommendation.reduction}</td>
                  <td>{kes(recommendation.saving)}</td>
                  <td>
                    <StatusChip
                      label={recommendation.priority}
                      tone={
                        recommendation.priority === "Urgent"
                          ? "high"
                          : recommendation.priority === "High"
                            ? "medium"
                            : "neutral"
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onModal("loss-recommendation")}
                    >
                      Plan action <ChevronRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
function Metric({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note: string;
}) {
  return (
    <div className="col-md-4">
      <DashboardMetric
        icon={TrendingDown}
        value={value}
        label={label}
        note={note}
      />
    </div>
  );
}

function ValueContent({
  items,
  search,
  page,
  pages,
  total,
  onSearch,
  onPage,
  onOpen,
  onModal,
}: {
  items: ValueAddition[];
  search: string;
  page: number;
  pages: number;
  total: number;
  onSearch: (value: string) => void;
  onPage: (page: number) => void;
  onOpen: (item: ValueAddition) => void;
  onModal: (id: HarvestModalId) => void;
}) {
  return (
    <section className="gm-card mt-4">
      <DashboardSectionHeader
        eyebrow="Post-harvest value addition"
        title="Finish the crop in a form buyers recognise"
        subtitle="Small preparation steps can protect shelf life, improve consistency and lift the price per unit."
        action={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => onModal("cost-analysis")}
            >
              <Banknote /> Cost analysis
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => onModal("create-value-run")}
            >
              <Plus /> Create value run
            </button>
          </div>
        }
      />
      <div className="gm-toolbar mt-3">
        <label className="gm-search">
          <Search />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search activity, output or equipment"
          />
        </label>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm ms-auto"
          onClick={() => onModal("buyer-ready-pack")}
        >
          <PackageCheck /> Buyer-ready pack
        </button>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Input → output</th>
              <th>Added value</th>
              <th>Equipment</th>
              <th>Cost</th>
              <th>Readiness</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <button
                    type="button"
                    className="gm-table-link"
                    onClick={() => onOpen(item)}
                  >
                    <strong>{item.activity}</strong>
                    <small>{item.id}</small>
                  </button>
                </td>
                <td>
                  {item.input}
                  <small>{item.output}</small>
                </td>
                <td>
                  <strong>{item.addedValue}</strong>
                </td>
                <td>{item.equipment}</td>
                <td>{item.cost ? kes(item.cost) : "Labour"}</td>
                <td>
                  <StatusChip
                    label={item.state}
                    tone={
                      item.state === "Ready"
                        ? "low"
                        : item.state === "Planned"
                          ? "medium"
                          : "neutral"
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={pages}
        perPage={4}
        totalItems={total}
        onChange={onPage}
      />
    </section>
  );
}

function UnitsContent({ onModal }: { onModal: (id: HarvestModalId) => void }) {
  return (
    <section className="gm-card mt-4">
      <DashboardSectionHeader
        eyebrow="Crop-specific harvest units"
        title="Measure each crop the way its market understands"
        subtitle="Correct units keep harvest yield, packing, storage and buyer records consistent across every crop."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm"
            onClick={() => onModal("record-harvest")}
          >
            <Plus /> Record harvest
          </button>
        }
      />
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Primary unit</th>
              <th>Secondary unit</th>
              <th>Tertiary unit</th>
              <th>Typical pack</th>
            </tr>
          </thead>
          <tbody>
            {CROP_UNITS.map((unit) => (
              <tr key={unit.id}>
                <td>
                  <strong>{unit.crop}</strong>
                </td>
                <td>{unit.primary}</td>
                <td>{unit.secondary}</td>
                <td>{unit.tertiary}</td>
                <td>{unit.pack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gm-plan-detail-hero mt-3">
        <span className="gm-mega-icon">
          <ClipboardCheck />
        </span>
        <div style={{ flex: 1 }}>
          <strong>Units protect the numbers behind a crop sale</strong>
          <p className="mb-0 text-muted">
            A cabbage head, 90 kg maize bag and 3 kg export carton should never
            be forced into one generic harvest field.
          </p>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={() => onModal("crop-units")}
        >
          Open unit guide
        </button>
      </div>
    </section>
  );
}

function HarvestDrawer({
  drawer,
  harvest,
  facility,
  packing,
  storage,
  valueAdd,
  onClose,
  onModal,
}: {
  drawer: DrawerId;
  harvest: HarvestRecord | null;
  facility: StorageFacility | null;
  packing: PackingOption | null;
  storage: StorageLog | null;
  valueAdd: ValueAddition | null;
  onClose: () => void;
  onModal: (id: HarvestModalId) => void;
}) {
  const title =
    drawer === "harvest"
      ? (harvest?.crop ?? "Harvest record")
      : drawer === "facility"
        ? (facility?.name ?? "Storage facility")
        : drawer === "packing"
          ? (packing?.package ?? "Packing option")
          : drawer === "storage"
            ? (storage?.crop ?? "Storage entry")
            : (valueAdd?.activity ?? "Value addition");
  return (
    <DashboardDrawer
      open={Boolean(drawer)}
      title={title}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="gm-btn gm-btn-outline w-100"
          onClick={onClose}
        >
          Close record
        </button>
      }
    >
      {drawer === "harvest" && harvest ? (
        <>
          <span className="gm-eyebrow">
            {harvest.id} · {harvest.date} · {harvest.status}
          </span>
          <h3 className="font-display mt-2">{harvest.quantity}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>{harvest.plot}</strong>
                <small>
                  {harvest.weight} · {harvest.yield}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <BadgeCheck />
              <span>
                <strong>{harvest.gradeA} Grade A</strong>
                <small>
                  {harvest.crew} · {kes(harvest.value)} harvest value
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("harvest-detail")}
            >
              Open complete record
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("attach-photos")}
            >
              Attach harvest evidence
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("grade-batch")}
            >
              Grade this batch
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-danger-soft"
              onClick={() => onModal("delete-harvest")}
            >
              Delete draft harvest
            </button>
          </div>
        </>
      ) : null}
      {drawer === "facility" && facility ? (
        <>
          <span className="gm-eyebrow">
            {facility.id} · {facility.status}
          </span>
          <h3 className="font-display mt-2">{facility.name}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Warehouse />
              <span>
                <strong>
                  {facility.capacity} · {facility.type}
                </strong>
                <small>{facility.crops}</small>
              </span>
            </div>
            <div className="gm-check-row">
              <Thermometer />
              <span>
                <strong>
                  {facility.temperature} · {facility.humidity}
                </strong>
                <small>{facility.note}</small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("facility-detail")}
            >
              Facility detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("record-condition")}
            >
              Record condition check
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("storage-entry")}
            >
              Add stored batch
            </button>
          </div>
        </>
      ) : null}
      {drawer === "packing" && packing ? (
        <>
          <span className="gm-eyebrow">
            {packing.id} · {packing.crop}
          </span>
          <h3 className="font-display mt-2">{packing.package}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <PackageCheck />
              <span>
                <strong>{packing.quantity} per package</strong>
                <small>
                  {kes(packing.cost)} each · stack {packing.stack}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <CalendarDays />
              <span>
                <strong>{packing.shelfLife}</strong>
                <small>
                  Follow the stack limit and keep the crop shaded as required.
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("packing-detail")}
            >
              Packing detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("stack-safety")}
            >
              Stack safety check
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("create-packing-run")}
            >
              Create packing run
            </button>
          </div>
        </>
      ) : null}
      {drawer === "storage" && storage ? (
        <>
          <span className="gm-eyebrow">
            {storage.id} · {storage.state}
          </span>
          <h3 className="font-display mt-2">{storage.crop}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <PackageCheck />
              <span>
                <strong>
                  {storage.grade} · {storage.quantity}
                </strong>
                <small>
                  {storage.package} · {storage.location}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <ShieldCheck />
              <span>
                <strong>{storage.condition}</strong>
                <small>{storage.duration}</small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("record-condition")}
            >
              Update condition
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("move-storage")}
            >
              Move batch
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("release-storage")}
            >
              Release to buyer
            </button>
          </div>
        </>
      ) : null}
      {drawer === "value" && valueAdd ? (
        <>
          <span className="gm-eyebrow">
            {valueAdd.id} · {valueAdd.state}
          </span>
          <h3 className="font-display mt-2">{valueAdd.activity}</h3>
          <div className="gm-check-list">
            <div className="gm-check-row">
              <Sprout />
              <span>
                <strong>
                  {valueAdd.input} → {valueAdd.output}
                </strong>
                <small>
                  {valueAdd.addedValue} · equipment: {valueAdd.equipment}
                </small>
              </span>
            </div>
            <div className="gm-check-row">
              <Banknote />
              <span>
                <strong>
                  {valueAdd.cost ? kes(valueAdd.cost) : "Labour only"}
                </strong>
                <small>
                  Process cost before added buyer value is realised.
                </small>
              </span>
            </div>
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("value-add-detail")}
            >
              Value-add detail
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => onModal("cost-analysis")}
            >
              Cost analysis
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => onModal("create-value-run")}
            >
              Create processing run
            </button>
          </div>
        </>
      ) : null}
    </DashboardDrawer>
  );
}
