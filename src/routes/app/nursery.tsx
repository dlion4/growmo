/* ============================================================================
   PAGE 25 — SEEDS & SEEDLING NURSERY MANAGEMENT (/app/nursery)
   Trace seed lots, raise healthy seedlings, and plant stronger crops.
   ========================================================================== */
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Droplets,
  FileText,
  Leaf,
  type LucideIcon,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  Sprout,
  Star,
  TrendingUp,
  Upload,
  Wheat,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
} from "../../components/app/DashboardWidgets";
import {
  NurseryModalHub,
  type NurseryModalId,
} from "../../components/app/NurseryModals";
import {
  NurseryHero,
  NurseryRecordCard,
  SeedStockSummary,
} from "../../components/app/NurseryWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import { ScoreRing } from "../../components/auth/controls";
import { Pagination, Reveal, Stars } from "../../components/ui/primitives";
import {
  CABBAGE_NURSERY_SETUP,
  DIRECT_PLANTING,
  EMERGENCE_SAMPLES,
  GERMINATION_LOG,
  GERMINATION_METRICS,
  healthTone,
  NURSERY_RECORDS,
  type NurseryRecord,
  PROPAGATION_METHODS,
  SEED_PERFORMANCE,
  SEED_STOCK,
  SEED_STORAGE_GUIDES,
  SEEDLING_HEALTH,
  SEEDLING_PURCHASES,
  type SeedlingPurchase,
  type SeedStock,
  stockTone,
  TRANSPLANT_READINESS,
} from "../../data/app/nursery";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/nursery")({
  component: NurseryPage,
});

type View =
  | "seeds"
  | "nursery"
  | "germination"
  | "health"
  | "sources"
  | "performance";
type SeedSubtab = "inventory" | "propagation" | "storage";
type HealthSubtab = "monitor" | "readiness";
type SourceSubtab = "purchases" | "direct";
type DrawerId = "seed" | "nursery" | "purchase" | null;

const NURSERY_TABS: { id: View; label: string; icon: LucideIcon }[] = [
  { id: "seeds", label: "Seed store", icon: PackageCheck },
  { id: "nursery", label: "My nurseries", icon: Sprout },
  { id: "germination", label: "Germination", icon: TrendingUp },
  { id: "health", label: "Health & readiness", icon: ShieldCheck },
  { id: "sources", label: "Purchases & direct", icon: Wheat },
  { id: "performance", label: "Performance", icon: Star },
];

const PAGE_SIZE = 5;

function NurseryPage() {
  const toast = useToast();
  const [view, setView] = useState<View>("seeds");
  const [seedSubtab, setSeedSubtab] = useState<SeedSubtab>("inventory");
  const [healthSubtab, setHealthSubtab] = useState<HealthSubtab>("monitor");
  const [sourceSubtab, setSourceSubtab] = useState<SourceSubtab>("purchases");
  const [seeds, setSeeds] = useState(SEED_STOCK);
  const [nurseries, setNurseries] = useState(NURSERY_RECORDS);
  const [purchases, setPurchases] = useState(SEEDLING_PURCHASES);
  const [modal, setModal] = useState<NurseryModalId>(null);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [selectedSeed, setSelectedSeed] = useState<SeedStock | null>(
    SEED_STOCK[0],
  );
  const [selectedNursery, setSelectedNursery] = useState<NurseryRecord | null>(
    NURSERY_RECORDS[0],
  );
  const [selectedPurchase, setSelectedPurchase] =
    useState<SeedlingPurchase | null>(SEEDLING_PURCHASES[0]);
  const [context, setContext] = useState("");
  const [menu, setMenu] = useState(false);
  const [seedSearch, setSeedSearch] = useState("");
  const [seedFilter, setSeedFilter] = useState<"All" | SeedStock["status"]>(
    "All",
  );
  const [seedPage, setSeedPage] = useState(1);
  const [nurserySearch, setNurserySearch] = useState("");
  const [nurseryFilter, setNurseryFilter] = useState<
    "All" | NurseryRecord["status"]
  >("All");
  const [germSearch, setGermSearch] = useState("");
  const [germPage, setGermPage] = useState(1);
  const [healthSearch, setHealthSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<"All" | "Good" | "Watch">(
    "All",
  );
  const [healthPage, setHealthPage] = useState(1);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseFilter, setPurchaseFilter] = useState<
    "All" | SeedlingPurchase["status"]
  >("All");
  const [purchasePage, setPurchasePage] = useState(1);
  const [performanceSearch, setPerformanceSearch] = useState("");
  const [performancePage, setPerformancePage] = useState(1);

  const filteredSeeds = useMemo(
    () =>
      seeds.filter(
        (seed) =>
          `${seed.seed} ${seed.variety} ${seed.company} ${seed.lot} ${seed.status}`
            .toLowerCase()
            .includes(seedSearch.toLowerCase()) &&
          (seedFilter === "All" || seed.status === seedFilter),
      ),
    [seeds, seedSearch, seedFilter],
  );
  const seedPages = Math.max(1, Math.ceil(filteredSeeds.length / PAGE_SIZE));
  const shownSeeds = filteredSeeds.slice(
    (seedPage - 1) * PAGE_SIZE,
    seedPage * PAGE_SIZE,
  );

  const filteredNurseries = useMemo(
    () =>
      nurseries.filter(
        (record) =>
          `${record.id} ${record.crop} ${record.variety} ${record.location} ${record.status}`
            .toLowerCase()
            .includes(nurserySearch.toLowerCase()) &&
          (nurseryFilter === "All" || record.status === nurseryFilter),
      ),
    [nurseries, nurserySearch, nurseryFilter],
  );
  const filteredGermination = useMemo(
    () =>
      GERMINATION_LOG.filter((entry) =>
        `${entry.day} ${entry.date} ${entry.activity} ${entry.observation} ${entry.action}`
          .toLowerCase()
          .includes(germSearch.toLowerCase()),
      ),
    [germSearch],
  );
  const germPages = Math.max(1, Math.ceil(filteredGermination.length / 4));
  const shownGermination = filteredGermination.slice(
    (germPage - 1) * 4,
    germPage * 4,
  );
  const filteredHealth = useMemo(
    () =>
      SEEDLING_HEALTH.filter(
        (item) =>
          `${item.issue} ${item.symptoms} ${item.cause} ${item.treatment}`
            .toLowerCase()
            .includes(healthSearch.toLowerCase()) &&
          (healthFilter === "All" || item.level === healthFilter),
      ),
    [healthSearch, healthFilter],
  );
  const healthPages = Math.max(1, Math.ceil(filteredHealth.length / 4));
  const shownHealth = filteredHealth.slice(
    (healthPage - 1) * 4,
    healthPage * 4,
  );
  const filteredPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          `${purchase.date} ${purchase.nursery} ${purchase.crop} ${purchase.quality} ${purchase.status}`
            .toLowerCase()
            .includes(purchaseSearch.toLowerCase()) &&
          (purchaseFilter === "All" || purchase.status === purchaseFilter),
      ),
    [purchases, purchaseSearch, purchaseFilter],
  );
  const purchasePages = Math.max(
    1,
    Math.ceil(filteredPurchases.length / PAGE_SIZE),
  );
  const shownPurchases = filteredPurchases.slice(
    (purchasePage - 1) * PAGE_SIZE,
    purchasePage * PAGE_SIZE,
  );
  const filteredPerformance = useMemo(
    () =>
      SEED_PERFORMANCE.filter((item) =>
        `${item.seed} ${item.variety} ${item.season} ${item.yield}`
          .toLowerCase()
          .includes(performanceSearch.toLowerCase()),
      ),
    [performanceSearch],
  );
  const performancePages = Math.max(
    1,
    Math.ceil(filteredPerformance.length / 4),
  );
  const shownPerformance = filteredPerformance.slice(
    (performancePage - 1) * 4,
    performancePage * 4,
  );

  const openSeed = (seed: SeedStock) => {
    setSelectedSeed(seed);
    setDrawer("seed");
  };
  const openNursery = (nursery: NurseryRecord) => {
    setSelectedNursery(nursery);
    setDrawer("nursery");
  };
  const openPurchase = (purchase: SeedlingPurchase) => {
    setSelectedPurchase(purchase);
    setDrawer("purchase");
  };
  const openModal = (id: NurseryModalId, note = "") => {
    setContext(note);
    setModal(id);
  };

  const savedWorkflow = (
    action: Exclude<NurseryModalId, null>,
    message: string,
  ) => {
    if (action === "add-seed")
      setSeeds((items) => [
        {
          id: `SED-${String(items.length + 1).padStart(3, "0")}`,
          seed: "Kale",
          variety: "Mfalme F1",
          company: "Simlaw",
          lot: "SF-2026-19",
          quantity: "25 g",
          bought: "20 Oct 2026",
          germination: "92% certified",
          expiry: "Oct 2028",
          storage: "Cool, dry, airtight",
          status: "Good",
          value: 1250,
        },
        ...items,
      ]);
    if (action === "write-off-seed" && selectedSeed)
      setSeeds((items) => items.filter((item) => item.id !== selectedSeed.id));
    if (action === "add-nursery")
      setNurseries((items) => [
        {
          id: `NUR-2026-${String(items.length + 3).padStart(3, "0")}`,
          crop: "Sukuma Wiki",
          variety: "Thousand Headed",
          seedLot: "Local-2026-14",
          sown: "10 g",
          target: 1800,
          ready: 0,
          sowingDate: "20 Oct 2026",
          transplantDate: "20 Nov 2026",
          location: "Kitchen garden shade",
          type: "Raised bed",
          status: "Sowing",
          assigned: "Mary Wanjiku",
        },
        ...items,
      ]);
    if (action === "confirm-transplant" && selectedNursery)
      setNurseries((items) =>
        items.map((item) =>
          item.id === selectedNursery.id
            ? { ...item, status: "Transplanted" }
            : item,
        ),
      );
    if (action === "add-purchase")
      setPurchases((items) => [
        {
          id: `PUR-${String(items.length + 1).padStart(3, "0")}`,
          date: "20 Oct 2026",
          nursery: "Limuru Certified Nursery",
          crop: "Hass avocado",
          quantity: "20 grafted seedlings",
          unitPrice: 350,
          total: 7000,
          verified: true,
          quality: "Grafted and labelled",
          status: "Planned",
        },
        ...items,
      ]);
    if (action === "pay-purchase" && selectedPurchase)
      setPurchases((items) =>
        items.map((item) =>
          item.id === selectedPurchase.id ? { ...item, status: "Paid" } : item,
        ),
      );
    if (action === "receive-purchase" && selectedPurchase)
      setPurchases((items) =>
        items.map((item) =>
          item.id === selectedPurchase.id
            ? { ...item, status: "Received" }
            : item,
        ),
      );
    toast.notify(message, "success");
  };

  const tableSearch = (
    value: string,
    onChange: (value: string) => void,
    label: string,
  ) => (
    <label className="gm-search" aria-label={label}>
      <Search />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
      />
    </label>
  );

  return (
    <main className="gm-app">
      <Reveal>
        <NurseryHero
          metrics={[
            {
              icon: PackageCheck,
              label: "Tracked seed lots",
              value: `${seeds.length}`,
              note: "certified lots & cuttings",
            },
            {
              icon: Sprout,
              label: "Ready seedlings",
              value: "3,200",
              note: "Gloria F1 · 20 Oct",
            },
            {
              icon: TrendingUp,
              label: "Germination",
              value: "85%",
              note: "above 80% standard",
            },
            {
              icon: ClipboardCheck,
              label: "Nursery health",
              value: "Good",
              note: "hardening in progress",
            },
          ]}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => openModal("add-nursery")}
              >
                <Plus /> Establish nursery
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline on-dark"
                onClick={() => openModal("add-seed")}
              >
                <Plus /> Add seed lot
              </button>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="More nursery actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((value) => !value)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Nursery actions</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        openModal("direct-planting");
                      }}
                    >
                      <Wheat /> Direct planting
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        openModal("export-nursery");
                      }}
                    >
                      <Download /> Export report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        openModal("share-nursery-plan");
                      }}
                    >
                      <Upload /> Share plan
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>

      <Reveal delay={40}>
        <div
          className="gm-tabs mt-4"
          role="tablist"
          aria-label="Seed and nursery workspaces"
        >
          {NURSERY_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={`gm-tab ${view === id ? "on" : ""}`}
              onClick={() => setView(id)}
            >
              <Icon />
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      {view === "seeds" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="Seed sourcing & storage"
              title="Know every seed lot before it reaches the soil"
              subtitle="Certified lot numbers, expiry, germination evidence and storage guidance protect the first decision in every crop."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("storage-guide")}
                >
                  <ShieldCheck /> Storage guide
                </button>
              }
            />
            <PlannerSubtabs
              value={seedSubtab}
              onChange={setSeedSubtab}
              label="Seed-store views"
              items={[
                {
                  id: "inventory",
                  label: "My seed store",
                  count: seeds.length,
                },
                {
                  id: "propagation",
                  label: "Propagation methods",
                  count: PROPAGATION_METHODS.length,
                },
                {
                  id: "storage",
                  label: "Storage guidance",
                  count: SEED_STORAGE_GUIDES.length,
                },
              ]}
            />
            {seedSubtab === "inventory" ? (
              <>
                <div className="row g-3 mt-1">
                  <div className="col-lg-4">
                    <div className="gm-card h-100">
                      <span className="gm-eyebrow">Quick attention</span>
                      <h3 className="font-display mb-2">
                        Plant Kembu 10 vines soon
                      </h3>
                      <p className="text-muted mb-3">
                        2,000 KALRO cuttings stay best in shade and moist
                        conditions, but should be planted within 48–72 hours.
                      </p>
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime"
                        onClick={() =>
                          openModal(
                            "direct-planting",
                            "Sweet potato Kembu 10 cuttings",
                          )
                        }
                      >
                        Create planting plan <ArrowRight />
                      </button>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="gm-card h-100">
                      <div className="d-flex justify-content-between align-items-center gap-2">
                        <div>
                          <span className="gm-eyebrow">Trusted lots</span>
                          <h3 className="font-display mb-0">
                            Seed-store check-in
                          </h3>
                        </div>
                        <button
                          type="button"
                          className="gm-btn gm-btn-outline"
                          onClick={() =>
                            openModal("test-germination", "Rosecoco bean lot")
                          }
                        >
                          Test a lot
                        </button>
                      </div>
                      <div className="gm-check-list mt-3">
                        {seeds.slice(0, 3).map((seed) => (
                          <SeedStockSummary
                            key={seed.id}
                            seed={seed}
                            onOpen={() => openSeed(seed)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="gm-card mt-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      {tableSearch(
                        seedSearch,
                        (value) => {
                          setSeedSearch(value);
                          setSeedPage(1);
                        },
                        "Search seed, company or lot",
                      )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <select
                        className="gm-select"
                        value={seedFilter}
                        onChange={(event) => {
                          setSeedFilter(
                            event.target.value as typeof seedFilter,
                          );
                          setSeedPage(1);
                        }}
                        aria-label="Filter seed status"
                      >
                        <option>All</option>
                        <option>Good</option>
                        <option>Check germination</option>
                        <option>Plant urgently</option>
                        <option>Low stock</option>
                      </select>
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime"
                        onClick={() => openModal("add-seed")}
                      >
                        <Plus /> Add seed
                      </button>
                    </div>
                  </div>
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Seed / variety</th>
                          <th>Company & lot</th>
                          <th>In store</th>
                          <th>Germination</th>
                          <th>Expiry</th>
                          <th>Storage</th>
                          <th>Status</th>
                          <th aria-label="Open" />
                        </tr>
                      </thead>
                      <tbody>
                        {shownSeeds.map((seed) => (
                          <tr key={seed.id}>
                            <td>
                              <strong>{seed.seed}</strong>
                              <small className="d-block text-muted">
                                {seed.variety}
                              </small>
                            </td>
                            <td>
                              {seed.company}
                              <small className="d-block text-muted">
                                {seed.lot}
                              </small>
                            </td>
                            <td>{seed.quantity}</td>
                            <td>{seed.germination}</td>
                            <td>{seed.expiry}</td>
                            <td>{seed.storage}</td>
                            <td>
                              <StatusChip
                                label={seed.status}
                                tone={stockTone(seed.status)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="gm-icon-btn"
                                aria-label={`Open ${seed.seed}`}
                                onClick={() => openSeed(seed)}
                              >
                                <ChevronRight />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={seedPage}
                    total={seedPages}
                    perPage={PAGE_SIZE}
                    totalItems={filteredSeeds.length}
                    onChange={setSeedPage}
                  />
                </div>
              </>
            ) : null}
            {seedSubtab === "propagation" ? (
              <div className="gm-card mt-3">
                <div className="d-flex justify-content-between gap-3 flex-wrap mb-3">
                  <div>
                    <span className="gm-eyebrow">Choose the right start</span>
                    <h3 className="font-display mb-0">
                      Propagation method by crop
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime"
                    onClick={() => openModal("direct-planting")}
                  >
                    Plan direct planting <ArrowRight />
                  </button>
                </div>
                <div className="gm-table-wrap">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Propagation method</th>
                        <th>Planting material</th>
                        <th>Practical guidance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROPAGATION_METHODS.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.crop}</strong>
                          </td>
                          <td>{item.method}</td>
                          <td>{item.material}</td>
                          <td>{item.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            {seedSubtab === "storage" ? (
              <div className="gm-card mt-3">
                <div className="d-flex justify-content-between gap-3 flex-wrap mb-3">
                  <div>
                    <span className="gm-eyebrow">Viability protection</span>
                    <h3 className="font-display mb-0">
                      Keep seed cool, dry and identifiable
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline"
                    onClick={() => openModal("storage-guide")}
                  >
                    <FileText /> Open full guide
                  </button>
                </div>
                <div className="gm-table-wrap">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Crop seed</th>
                        <th>Ideal temperature</th>
                        <th>Ideal humidity</th>
                        <th>Container</th>
                        <th>Shelf life</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SEED_STORAGE_GUIDES.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.crop}</strong>
                          </td>
                          <td>{item.temperature}</td>
                          <td>{item.humidity}</td>
                          <td>{item.container}</td>
                          <td>{item.life}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>
        </Reveal>
      ) : null}

      {view === "nursery" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="Nursery establishment"
              title="Raise steady, healthy seedlings"
              subtitle="Set up the seed lot, bed, soil mix, protection and care routine before germination begins."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("add-nursery")}
                >
                  <Plus /> Establish nursery
                </button>
              }
            />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                {tableSearch(
                  nurserySearch,
                  (value) => setNurserySearch(value),
                  "Search crop, nursery or location",
                )}
              </div>
              <select
                className="gm-select"
                value={nurseryFilter}
                onChange={(event) =>
                  setNurseryFilter(event.target.value as typeof nurseryFilter)
                }
                aria-label="Filter nursery state"
              >
                <option>All</option>
                <option>Sowing</option>
                <option>Germinating</option>
                <option>Growing</option>
                <option>Hardening</option>
                <option>Ready</option>
                <option>Transplanted</option>
              </select>
            </div>
            <div className="row g-3 mt-1">
              {filteredNurseries.map((nursery) => (
                <div className="col-sm-6 col-xl-3" key={nursery.id}>
                  <NurseryRecordCard
                    nursery={nursery}
                    onOpen={() => openNursery(nursery)}
                  />
                </div>
              ))}
            </div>
            <div className="row g-3 mt-3">
              <div className="col-xl-7">
                <div className="gm-card h-100">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <div>
                      <span className="gm-eyebrow">
                        Active setup · NUR-2026-003
                      </span>
                      <h3 className="font-display mb-0">
                        Cabbage Gloria F1 nursery
                      </h3>
                    </div>
                    <StatusChip label="Ready" tone="low" />
                  </div>
                  <div className="gm-check-list mt-3">
                    {CABBAGE_NURSERY_SETUP.map(([label, value]) => (
                      <div className="gm-check-row" key={label}>
                        <BadgeCheck />
                        <span>
                          <strong>{label}</strong>
                          <small>{value}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <div className="gm-card h-100">
                  <span className="gm-eyebrow">Today’s care</span>
                  <h3 className="font-display">Hardening-off checkpoint</h3>
                  <p className="text-muted">
                    Shade is off, watering is reduced and the field team is
                    preparing Plot 1 for the 20–22 October transplant window.
                  </p>
                  <div className="gm-check-list">
                    <button
                      type="button"
                      className="gm-check-row text-start w-100"
                      onClick={() => openModal("record-watering")}
                    >
                      <Droplets />
                      <span>
                        <strong>Record evening mist</strong>
                        <small>Keep roots moist, not waterlogged.</small>
                      </span>
                      <ChevronRight />
                    </button>
                    <button
                      type="button"
                      className="gm-check-row text-start w-100"
                      onClick={() => openModal("harden-seedlings")}
                    >
                      <Leaf />
                      <span>
                        <strong>Review hardening plan</strong>
                        <small>Three days complete without shade.</small>
                      </span>
                      <ChevronRight />
                    </button>
                    <button
                      type="button"
                      className="gm-check-row text-start w-100"
                      onClick={() => openModal("attach-nursery-photo")}
                    >
                      <Upload />
                      <span>
                        <strong>Add a dated photo note</strong>
                        <small>Evidence for the crop record.</small>
                      </span>
                      <ChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      {view === "germination" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="Germination monitoring"
              title="Count early, act early"
              subtitle="Follow the first 30 days from sowing to hardening off, then compare results with certified-seed standards."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("calculate-germination")}
                >
                  <TrendingUp /> Calculate rate
                </button>
              }
            />
            <div className="row g-3">
              <div className="col-xl-7">
                <div className="gm-card h-100">
                  <div className="d-flex justify-content-between align-items-center gap-2">
                    <div>
                      <span className="gm-eyebrow">NUR-2026-003</span>
                      <h3 className="font-display mb-0">
                        Day 0–30 activity log
                      </h3>
                    </div>
                    {tableSearch(
                      germSearch,
                      (value) => {
                        setGermSearch(value);
                        setGermPage(1);
                      },
                      "Search activity log",
                    )}
                  </div>
                  <div className="gm-table-wrap mt-3">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Day / date</th>
                          <th>Activity</th>
                          <th>Observation</th>
                          <th>Photo</th>
                          <th>Action</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {shownGermination.map((entry) => (
                          <tr key={entry.id}>
                            <td>
                              <strong>{entry.day}</strong>
                              <small className="d-block text-muted">
                                {entry.date}
                              </small>
                            </td>
                            <td>{entry.activity}</td>
                            <td>{entry.observation}</td>
                            <td>{entry.photo}</td>
                            <td>{entry.action}</td>
                            <td>
                              <button
                                type="button"
                                className="gm-icon-btn"
                                aria-label={`Open ${entry.activity}`}
                                onClick={() =>
                                  openModal(
                                    "observation-detail",
                                    `${entry.day} · ${entry.activity}`,
                                  )
                                }
                              >
                                <ChevronRight />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={germPage}
                    total={germPages}
                    perPage={4}
                    totalItems={filteredGermination.length}
                    onChange={setGermPage}
                  />
                </div>
              </div>
              <div className="col-xl-5">
                <div className="gm-card h-100">
                  <span className="gm-eyebrow">
                    Germination-rate calculator
                  </span>
                  <div className="d-flex align-items-center gap-3">
                    <ScoreRing score={85} size={104} />
                    <div>
                      <h3 className="font-display mb-1">85% · pass</h3>
                      <p className="text-muted mb-0">
                        Above the 80% certified-seed benchmark — no need to
                        re-sow.
                      </p>
                    </div>
                  </div>
                  <div className="gm-progress-wrap mt-3">
                    <ProgressLine
                      value={85}
                      label="85 percent germination rate"
                    />
                  </div>
                  <div className="gm-check-list">
                    {GERMINATION_METRICS.map((metric) => (
                      <div className="gm-check-row" key={metric.label}>
                        <CheckCircle2 />
                        <span>
                          <strong>
                            {metric.label} · {metric.value}
                          </strong>
                          <small>{metric.note}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime w-100 mt-3"
                    onClick={() => openModal("calculate-germination")}
                  >
                    Update calculation <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
            <div className="gm-card mt-3">
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("thin-seedlings")}
                >
                  Record thinning
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("fertilise-nursery")}
                >
                  Record light feed
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("harden-seedlings")}
                >
                  Start hardening
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("germination-log")}
                >
                  Open full timeline
                </button>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      {view === "health" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="Seedling health & field readiness"
              title="Inspect every seedling before it becomes a crop"
              subtitle="Spot common nursery risks early, follow safe responses, and transplant only when crop, field and team are ready."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("run-health-check")}
                >
                  <ShieldCheck /> Run health check
                </button>
              }
            />
            <PlannerSubtabs
              value={healthSubtab}
              onChange={setHealthSubtab}
              label="Health and readiness views"
              items={[
                {
                  id: "monitor",
                  label: "Health monitor",
                  count: SEEDLING_HEALTH.length,
                },
                {
                  id: "readiness",
                  label: "Transplant readiness",
                  count: TRANSPLANT_READINESS.length,
                },
              ]}
            />
            {healthSubtab === "monitor" ? (
              <div className="gm-card mt-3">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <div>
                    {tableSearch(
                      healthSearch,
                      (value) => {
                        setHealthSearch(value);
                        setHealthPage(1);
                      },
                      "Search issue or symptom",
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <select
                      className="gm-select"
                      value={healthFilter}
                      onChange={(event) => {
                        setHealthFilter(
                          event.target.value as typeof healthFilter,
                        );
                        setHealthPage(1);
                      }}
                      aria-label="Filter health status"
                    >
                      <option>All</option>
                      <option>Good</option>
                      <option>Watch</option>
                    </select>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline"
                      onClick={() => openModal("flag-health-issue")}
                    >
                      Flag issue
                    </button>
                  </div>
                </div>
                <div className="gm-table-wrap">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Issue</th>
                        <th>Symptoms</th>
                        <th>Likely cause</th>
                        <th>Treatment</th>
                        <th>Prevention</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {shownHealth.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.issue}</strong>
                          </td>
                          <td>{item.symptoms}</td>
                          <td>{item.cause}</td>
                          <td>{item.treatment}</td>
                          <td>{item.prevention}</td>
                          <td>
                            <StatusChip
                              label={item.level}
                              tone={healthTone(item.level)}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="gm-icon-btn"
                              aria-label={`Open ${item.issue} health guide`}
                              onClick={() =>
                                openModal("health-detail", item.issue)
                              }
                            >
                              <ChevronRight />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={healthPage}
                  total={healthPages}
                  perPage={4}
                  totalItems={filteredHealth.length}
                  onChange={setHealthPage}
                />
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime"
                    onClick={() =>
                      openModal("create-treatment", "Leggy seedlings")
                    }
                  >
                    Create treatment plan
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline"
                    onClick={() => openModal("health-detail", "Damping off")}
                  >
                    Safe treatment guide
                  </button>
                </div>
              </div>
            ) : null}
            {healthSubtab === "readiness" ? (
              <div className="row g-3 mt-3">
                <div className="col-xl-8">
                  <div className="gm-card">
                    <div className="d-flex justify-content-between gap-3 flex-wrap">
                      <div>
                        <span className="gm-eyebrow">
                          Cabbage Gloria F1 · NUR-2026-003
                        </span>
                        <h3 className="font-display mb-0">
                          Transplanting readiness checklist
                        </h3>
                      </div>
                      <StatusChip label="READY TO TRANSPLANT" tone="low" />
                    </div>
                    <div className="gm-table-wrap mt-3">
                      <table className="gm-table">
                        <thead>
                          <tr>
                            <th>Criteria</th>
                            <th>Required</th>
                            <th>Actual</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TRANSPLANT_READINESS.map((item) => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.criteria}</strong>
                              </td>
                              <td>{item.required}</td>
                              <td>{item.actual}</td>
                              <td>
                                <span className="d-inline-flex align-items-center gap-1">
                                  <CheckCircle2 /> {item.pass}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="col-xl-4">
                  <div className="gm-card h-100">
                    <span className="gm-eyebrow">Ready with care</span>
                    <h3 className="font-display">100% checks passed</h3>
                    <ProgressLine
                      value={100}
                      label="All transplanting checks passed"
                    />
                    <p className="text-muted mt-3">
                      Plant early morning or late afternoon, water in well, and
                      use the light-rain window to reduce stress.
                    </p>
                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime"
                        onClick={() => openModal("schedule-transplant")}
                      >
                        Schedule transplant
                      </button>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline"
                        onClick={() => openModal("assign-transplant-team")}
                      >
                        Assign five workers
                      </button>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline"
                        onClick={() => openModal("confirm-transplant")}
                      >
                        Confirm transplanting
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </Reveal>
      ) : null}

      {view === "sources" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="External seedlings & direct sowing"
              title="Trace bought planting material and field emergence"
              subtitle="Verify every external nursery source, then use sample rows to protect crop stands planted directly in the field."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("add-purchase")}
                >
                  <Plus /> Add purchase
                </button>
              }
            />
            <PlannerSubtabs
              value={sourceSubtab}
              onChange={setSourceSubtab}
              label="Planting-source views"
              items={[
                {
                  id: "purchases",
                  label: "Seedling purchases",
                  count: purchases.length,
                },
                { id: "direct", label: "Direct planting", count: 1 },
              ]}
            />
            {sourceSubtab === "purchases" ? (
              <div className="gm-card mt-3">
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <div>
                    {tableSearch(
                      purchaseSearch,
                      (value) => {
                        setPurchaseSearch(value);
                        setPurchasePage(1);
                      },
                      "Search nursery, crop or quality",
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <select
                      className="gm-select"
                      value={purchaseFilter}
                      onChange={(event) => {
                        setPurchaseFilter(
                          event.target.value as typeof purchaseFilter,
                        );
                        setPurchasePage(1);
                      }}
                      aria-label="Filter purchase status"
                    >
                      <option>All</option>
                      <option>Planned</option>
                      <option>Paid</option>
                      <option>Received</option>
                    </select>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline"
                      onClick={() => openModal("verify-source")}
                    >
                      Verify source
                    </button>
                  </div>
                </div>
                <div className="gm-table-wrap">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Nursery</th>
                        <th>Crop / variety</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Source</th>
                        <th>Quality</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {shownPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>{purchase.date}</td>
                          <td>
                            <strong>{purchase.nursery}</strong>
                          </td>
                          <td>{purchase.crop}</td>
                          <td>{purchase.quantity}</td>
                          <td>{kes(purchase.unitPrice)}</td>
                          <td>{kes(purchase.total)}</td>
                          <td>
                            <StatusChip
                              label={
                                purchase.verified
                                  ? "KEPHIS verified"
                                  : "Check source"
                              }
                              tone={purchase.verified ? "low" : "medium"}
                            />
                          </td>
                          <td>
                            {purchase.quality}
                            <small className="d-block text-muted">
                              {purchase.status}
                            </small>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="gm-icon-btn"
                              aria-label={`Open purchase from ${purchase.nursery}`}
                              onClick={() => openPurchase(purchase)}
                            >
                              <ChevronRight />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={purchasePage}
                  total={purchasePages}
                  perPage={PAGE_SIZE}
                  totalItems={filteredPurchases.length}
                  onChange={setPurchasePage}
                />
              </div>
            ) : null}
            {sourceSubtab === "direct" ? (
              <div className="row g-3 mt-3">
                <div className="col-xl-7">
                  <div className="gm-card h-100">
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div>
                        <span className="gm-eyebrow">
                          No nursery needed · Plot 2
                        </span>
                        <h3 className="font-display mb-0">
                          {DIRECT_PLANTING.crop}
                        </h3>
                      </div>
                      <StatusChip label="91% emergence · good" tone="low" />
                    </div>
                    <div className="gm-check-list mt-3">
                      {[
                        ["Method", DIRECT_PLANTING.method],
                        ["Seed rate", DIRECT_PLANTING.seedRate],
                        [
                          "Depth & spacing",
                          `${DIRECT_PLANTING.depth} · ${DIRECT_PLANTING.spacing}`,
                        ],
                        ["Seeds per hole", DIRECT_PLANTING.seedsPerHole],
                        ["Target population", DIRECT_PLANTING.target],
                        ["Fertiliser", DIRECT_PLANTING.fertilizer],
                        ["Planting date", DIRECT_PLANTING.date],
                        ["Expected germination", DIRECT_PLANTING.expected],
                        ["Next thinning", DIRECT_PLANTING.thinning],
                      ].map(([label, value]) => (
                        <div className="gm-check-row" key={label}>
                          <BadgeCheck />
                          <span>
                            <strong>{label}</strong>
                            <small>{value}</small>
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="gm-btn gm-btn-lime w-100 mt-3"
                      onClick={() => openModal("direct-planting")}
                    >
                      Update field planting plan
                    </button>
                  </div>
                </div>
                <div className="col-xl-5">
                  <div className="gm-card h-100">
                    <span className="gm-eyebrow">Emergence assessment</span>
                    <h3 className="font-display">Three sample rows</h3>
                    <div className="gm-table-wrap">
                      <table className="gm-table">
                        <thead>
                          <tr>
                            <th>Row</th>
                            <th>Expected</th>
                            <th>Actual</th>
                            <th>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {EMERGENCE_SAMPLES.map((sample) => (
                            <tr key={sample.id}>
                              <td>
                                {sample.row}
                                <small className="d-block text-muted">
                                  {sample.length}
                                </small>
                              </td>
                              <td>{sample.expected}</td>
                              <td>{sample.actual}</td>
                              <td>{sample.rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="gm-plan-detail-hero mt-3">
                      <span className="gm-mega-icon">
                        <CheckCircle2 />
                      </span>
                      <div>
                        <strong>Average: 91% · good</strong>
                        <p className="mb-0 text-muted">
                          Above the 85% target. If this falls below 80%, replant
                          gaps within seven days.
                        </p>
                      </div>
                    </div>
                    <div className="d-grid gap-2 mt-3">
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime"
                        onClick={() => openModal("record-emergence")}
                      >
                        Record samples
                      </button>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline"
                        onClick={() => openModal("replant-gaps")}
                      >
                        Plan gap replant
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </Reveal>
      ) : null}

      {view === "performance" ? (
        <Reveal delay={80}>
          <section className="mt-4">
            <DashboardSectionHeader
              eyebrow="Learn from your own farm"
              title="Make the next seed choice with evidence"
              subtitle="Compare germination, field emergence and yield across varieties and seasons, then choose the seed that earns its place."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("ai-recommendation")}
                >
                  <Star /> See AI recommendation
                </button>
              }
            />
            <div className="row g-3">
              <div className="col-xl-8">
                <div className="gm-card h-100">
                  <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <span className="gm-eyebrow">Season history</span>
                      <h3 className="font-display mb-0">
                        Seed performance record
                      </h3>
                    </div>
                    {tableSearch(
                      performanceSearch,
                      (value) => {
                        setPerformanceSearch(value);
                        setPerformancePage(1);
                      },
                      "Search seed performance",
                    )}
                  </div>
                  <div className="gm-table-wrap">
                    <table className="gm-table">
                      <thead>
                        <tr>
                          <th>Seed / variety</th>
                          <th>Season</th>
                          <th>Germination</th>
                          <th>Field emergence</th>
                          <th>Final yield</th>
                          <th>Rating</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {shownPerformance.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.seed}</strong>
                              <small className="d-block text-muted">
                                {item.variety}
                              </small>
                            </td>
                            <td>{item.season}</td>
                            <td>{item.germination}</td>
                            <td>{item.emergence}</td>
                            <td>{item.yield}</td>
                            <td>
                              <Stars rating={item.rating} />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="gm-icon-btn"
                                aria-label={`Open ${item.variety} performance`}
                                onClick={() =>
                                  openModal("performance-detail", item.variety)
                                }
                              >
                                <ChevronRight />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={performancePage}
                    total={performancePages}
                    perPage={4}
                    totalItems={filteredPerformance.length}
                    onChange={setPerformancePage}
                  />
                </div>
              </div>
              <div className="col-xl-4">
                <div className="gm-card h-100">
                  <span className="gm-eyebrow">GrowMO AI recommendation</span>
                  <h3 className="font-display">Stay with Gloria F1</h3>
                  <div className="gm-plan-detail-hero">
                    <span className="gm-mega-icon">
                      <TrendingUp />
                    </span>
                    <div>
                      <strong>Reliable heads, season after season</strong>
                      <p className="mb-0 text-muted">
                        Three seasons show 14,500–15,200 heads per acre.
                      </p>
                    </div>
                  </div>
                  <p className="text-muted mt-3">
                    Copenhagen OP gave 23% lower yield. The KES 600 sachet
                    premium for Gloria F1 pays for itself in 3,000+ extra heads.
                  </p>
                  <div className="gm-check-list">
                    <div className="gm-check-row">
                      <CheckCircle2 />
                      <span>
                        <strong>85–88% germination</strong>
                        <small>Consistent certified lot performance.</small>
                      </span>
                    </div>
                    <div className="gm-check-row">
                      <CheckCircle2 />
                      <span>
                        <strong>90–92% field emergence</strong>
                        <small>Strong establishment after transplanting.</small>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime w-100 mt-3"
                    onClick={() => openModal("ai-recommendation")}
                  >
                    Use this recommendation <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
            <div className="gm-card mt-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <strong>Ready for your records?</strong>
                <small className="d-block text-muted">
                  Export a clean seed-to-field summary for your advisor or
                  crop-plan meeting.
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline"
                  onClick={() => openModal("share-nursery-plan")}
                >
                  <Upload /> Share plan
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => openModal("export-nursery")}
                >
                  <Download /> Export report
                </button>
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      <DashboardDrawer
        open={drawer === "seed" && !!selectedSeed}
        title={
          selectedSeed
            ? `${selectedSeed.seed} · ${selectedSeed.variety}`
            : "Seed lot"
        }
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => openModal("edit-seed")}
            >
              Edit lot
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => openModal("test-germination")}
            >
              Test germination
            </button>
          </div>
        }
      >
        {selectedSeed ? (
          <>
            <span className="gm-eyebrow">
              {selectedSeed.id} · {selectedSeed.company}
            </span>
            <div className="gm-check-list mt-3">
              {[
                ["Lot / batch", selectedSeed.lot],
                ["Quantity", selectedSeed.quantity],
                ["Germination", selectedSeed.germination],
                ["Expiry", selectedSeed.expiry],
                ["Storage", selectedSeed.storage],
                ["Stock value", kes(selectedSeed.value)],
              ].map(([label, value]) => (
                <div className="gm-check-row" key={label}>
                  <BadgeCheck />
                  <span>
                    <strong>{label}</strong>
                    <small>{value}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="d-grid gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => openModal("seed-detail")}
              >
                Open certified-lot detail
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-danger-soft"
                onClick={() => openModal("write-off-seed")}
              >
                Write off unusable seed
              </button>
            </div>
          </>
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "nursery" && !!selectedNursery}
        title={
          selectedNursery
            ? `${selectedNursery.id} · ${selectedNursery.crop}`
            : "Nursery"
        }
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => openModal("edit-nursery")}
            >
              Edit setup
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => openModal("nursery-detail")}
            >
              Open record
            </button>
          </div>
        }
      >
        {selectedNursery ? (
          <>
            <span className="gm-eyebrow">
              {selectedNursery.variety} · seed lot {selectedNursery.seedLot}
            </span>
            <div className="gm-check-list mt-3">
              {[
                [
                  "Seedlings",
                  `${selectedNursery.ready.toLocaleString()} ready / ${selectedNursery.target.toLocaleString()} target`,
                ],
                [
                  "Sown",
                  `${selectedNursery.sown} · ${selectedNursery.sowingDate}`,
                ],
                ["Transplant target", selectedNursery.transplantDate],
                ["Location", selectedNursery.location],
                ["Nursery type", selectedNursery.type],
                ["Assigned", selectedNursery.assigned],
              ].map(([label, value]) => (
                <div className="gm-check-row" key={label}>
                  <Sprout />
                  <span>
                    <strong>{label}</strong>
                    <small>{value}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="d-grid gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => openModal("record-watering")}
              >
                Record care action
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => openModal("schedule-transplant")}
              >
                Schedule transplant
              </button>
            </div>
          </>
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "purchase" && !!selectedPurchase}
        title={selectedPurchase ? selectedPurchase.nursery : "Purchase"}
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={() => openModal("verify-source")}
            >
              Verify source
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() => openModal("receive-purchase")}
            >
              Receive
            </button>
          </div>
        }
      >
        {selectedPurchase ? (
          <>
            <span className="gm-eyebrow">
              {selectedPurchase.id} · {selectedPurchase.date}
            </span>
            <h3 className="font-display mt-2">{selectedPurchase.crop}</h3>
            <div className="gm-check-list mt-3">
              {[
                ["Quantity", selectedPurchase.quantity],
                ["Unit price", kes(selectedPurchase.unitPrice)],
                ["Total", kes(selectedPurchase.total)],
                [
                  "Source",
                  selectedPurchase.verified
                    ? "KEPHIS verified"
                    : "Verification requested",
                ],
                ["Quality", selectedPurchase.quality],
                ["Status", selectedPurchase.status],
              ].map(([label, value]) => (
                <div className="gm-check-row" key={label}>
                  <BadgeCheck />
                  <span>
                    <strong>{label}</strong>
                    <small>{value}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="d-grid gap-2 mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => openModal("purchase-detail")}
              >
                Open full record
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-mpesa"
                onClick={() => openModal("pay-purchase")}
              >
                Pay by M-Pesa
              </button>
            </div>
          </>
        ) : null}
      </DashboardDrawer>

      <NurseryModalHub
        active={modal}
        seed={selectedSeed}
        nursery={selectedNursery}
        purchase={selectedPurchase}
        context={context}
        onClose={() => setModal(null)}
        onSaved={savedWorkflow}
      />
    </main>
  );
}
