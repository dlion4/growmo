import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Coins,
  Copy,
  Download,
  Droplets,
  Eye,
  Filter,
  FlaskConical,
  Gauge,
  Leaf,
  ListFilter,
  MapPin,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Store,
  Trash2,
  TrendingUp,
  Users,
  Wheat,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  DashboardDrawer,
  DashboardMetric,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "../../components/app/DashboardWidgets";
import {
  CropPlannerCard,
  PlannerFact,
  PlannerSubtabs,
} from "../../components/app/PlannerWidgets";
import {
  Dialog,
  OtpInput,
  PinPad,
  ScoreRing,
  Stepper,
  Toggle,
} from "../../components/auth/controls";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  AI_CABBAGE_RECOMMENDATION,
  BASE_COST_TOTAL,
  CABBAGE_COST_ITEMS,
  CABBAGE_VARIETIES,
  CROP_CATALOG,
  CROP_GROUPS,
  type CropCatalogItem,
  type CropGroupId,
  FARM_PLOTS,
  IRRIGATION_PLAN,
  LABOUR_PLAN,
  MARKET_OUTLOOK,
  PLANNER_METHODS,
  PLANTING_WINDOWS,
  REVENUE_SCENARIOS,
  SAVED_PLANS,
  type SavedCropPlan,
  SEED_SUPPLIERS,
  type SeedSupplier,
} from "../../data/app/planner";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/planner")({
  component: CropPlannerPage,
});

type PlannerView = "browse" | "plans" | "tools";
type DrawerId = "crop" | "selection" | "plan" | null;
type DetailTab = "overview" | "varieties" | "calendar" | "costs" | "returns";
type ModalId =
  | "method"
  | "library"
  | "compare"
  | "plant"
  | "cost-save"
  | "stress"
  | "plan-edit"
  | "plan-copy"
  | "plan-delete"
  | "suppliers"
  | "seed-order"
  | "markets"
  | "labour"
  | "irrigation"
  | "rotation"
  | "soil-fit"
  | "risk"
  | "share"
  | "export"
  | "advisor"
  | "custom"
  | "reminder"
  | null;

type SortId = "popular" | "cost-low" | "revenue-high" | "maturity";

type ToolId =
  | "soil-fit"
  | "rotation"
  | "risk"
  | "markets"
  | "labour"
  | "irrigation"
  | "suppliers"
  | "advisor";

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  const fieldId = useId();
  return (
    <div className={`gm-field ${full ? "full" : ""}`}>
      <label htmlFor={fieldId}>{label}</label>
      <div id={fieldId}>{children}</div>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
      {children}
    </div>
  );
}

function downloadText(filename: string, content: string, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function planTone(status: SavedCropPlan["status"]) {
  return status === "Ready"
    ? "low"
    : status === "Review"
      ? "medium"
      : status === "Planted"
        ? "low"
        : "neutral";
}

function CropPlannerPage() {
  const toast = useToast();
  const [view, setView] = useState<PlannerView>("browse");
  const [group, setGroup] = useState<CropGroupId>("vegetables");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [water, setWater] = useState("All");
  const [zone, setZone] = useState("All");
  const [sort, setSort] = useState<SortId>("popular");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [selectedCropId, setSelectedCropId] = useState("cabbage");
  const [selectedVarietyId, setSelectedVarietyId] = useState("gloria");
  const [compareIds, setCompareIds] = useState<string[]>(["cabbage"]);
  const [plans, setPlans] = useState<SavedCropPlan[]>(SAVED_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState("plan-001");
  const [selectedSupplierId, setSelectedSupplierId] = useState("supplier-01");
  const [planQuery, setPlanQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [planPage, setPlanPage] = useState(1);

  useEffect(() => {
    if (modal || drawer) {
      window.dispatchEvent(new Event("close-appshell-drawers"));
    }
  }, [modal, drawer]);

  const selectedCrop =
    CROP_CATALOG.find((crop) => crop.id === selectedCropId) ?? CROP_CATALOG[0];
  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];
  const selectedSupplier =
    SEED_SUPPLIERS.find((supplier) => supplier.id === selectedSupplierId) ??
    SEED_SUPPLIERS[0];
  const selectedVariety =
    CABBAGE_VARIETIES.find((variety) => variety.id === selectedVarietyId) ??
    CABBAGE_VARIETIES[0];

  const filteredCrops = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const rows = CROP_CATALOG.filter(
      (crop) =>
        crop.group === group &&
        `${crop.name} ${crop.swahili} ${crop.zones.join(" ")} ${crop.seasons}`
          .toLowerCase()
          .includes(normalized) &&
        (difficulty === "All" || crop.difficulty === difficulty) &&
        (water === "All" || crop.water === water) &&
        (zone === "All" || crop.zones.includes(zone)),
    );
    return [...rows].sort((a, b) => {
      if (sort === "cost-low") return a.costMin - b.costMin;
      if (sort === "revenue-high") return b.revenueMax - a.revenueMax;
      if (sort === "maturity")
        return (
          Number.parseInt(a.maturity, 10) - Number.parseInt(b.maturity, 10)
        );
      return b.popularity - a.popularity;
    });
  }, [difficulty, group, query, sort, water, zone]);

  const filteredPlans = useMemo(() => {
    const normalized = planQuery.toLowerCase().trim();
    return plans.filter(
      (plan) =>
        `${plan.crop} ${plan.variety} ${plan.plot} ${plan.season}`
          .toLowerCase()
          .includes(normalized) &&
        (planFilter === "All" || plan.status === planFilter),
    );
  }, [planFilter, planQuery, plans]);

  const groupCounts = useMemo(
    () =>
      Object.fromEntries(
        CROP_GROUPS.map((item) => [
          item.id,
          CROP_CATALOG.filter((crop) => crop.group === item.id).length,
        ]),
      ) as Record<CropGroupId, number>,
    [],
  );

  const cropPerPage = 6;
  const cropPages = Math.max(1, Math.ceil(filteredCrops.length / cropPerPage));
  const visibleCrops = filteredCrops.slice(
    (page - 1) * cropPerPage,
    page * cropPerPage,
  );

  const planPerPage = 5;
  const planPages = Math.max(1, Math.ceil(filteredPlans.length / planPerPage));
  const visiblePlans = filteredPlans.slice(
    (planPage - 1) * planPerPage,
    planPage * planPerPage,
  );

  const openCrop = (id: string, tab: DetailTab = "overview") => {
    setSelectedCropId(id);
    setDetailTab(tab);
    setDrawer("crop");
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds((ids) => ids.filter((item) => item !== id));
      return;
    }
    if (compareIds.length >= 3) {
      setDrawer("selection");
      return;
    }
    setCompareIds((ids) => [...ids, id]);
  };

  const resetFilters = () => {
    setQuery("");
    setDifficulty("All");
    setWater("All");
    setZone("All");
    setSort("popular");
    setPage(1);
  };

  const exportCatalog = () => {
    const rows = [
      [
        "Crop",
        "Kiswahili",
        "Group",
        "Maturity",
        "Zones",
        "Cost Min KES",
        "Cost Max KES",
        "Revenue Min KES",
        "Revenue Max KES",
      ],
      ...CROP_CATALOG.map((crop) => [
        crop.name,
        crop.swahili,
        CROP_GROUPS.find((item) => item.id === crop.group)?.label ?? crop.group,
        crop.maturity,
        crop.zones.join(" / "),
        String(crop.costMin),
        String(crop.costMax),
        String(crop.revenueMin),
        String(crop.revenueMax),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    downloadText("growmo-kiambu-crop-catalog.csv", csv);
    setMenu(false);
    toast.notify("Crop catalog downloaded", "success");
  };

  const deleteSelectedPlan = () => {
    if (!selectedPlan) return;
    setPlans((rows) => rows.filter((plan) => plan.id !== selectedPlan.id));
    setDrawer(null);
    setModal(null);
    setSelectedPlanId(
      plans.find((plan) => plan.id !== selectedPlan.id)?.id ?? "",
    );
    toast.notify(`${selectedPlan.crop} plan removed`, "success");
  };

  return (
    <div>
      <Reveal>
        <header className="gm-card gm-plan-head">
          <div className="d-flex flex-wrap align-items-start gap-4">
            <div style={{ flex: "1 1 430px" }}>
              <span className="gm-eyebrow on-dark">
                <span className="dot" /> Page 3 · Pre-planting decision engine
              </span>
              <h1 className="font-display mt-2">
                Plan the right crop before the first shilling is spent
              </h1>
              <p className="gm-lead on-dark mb-0">
                Compare crop fit, certified varieties, Kiambu planting windows,
                true cost and market return — then save a field-ready plan.
              </p>
            </div>
            <div className="gm-plan-hero-actions">
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => {
                  setSelectedCropId("cabbage");
                  setModal("plant");
                }}
              >
                <Sprout /> Plant a crop
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setView("plans")}
              >
                <ClipboardList /> Saved plans ({plans.length})
              </button>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Planner actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((value) => !value)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Planner actions</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("method");
                      }}
                    >
                      <Sparkles /> How recommendations work
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("library");
                      }}
                    >
                      <Wheat /> Browse complete crop library
                    </button>
                    <button type="button" onClick={exportCatalog}>
                      <Download /> Export crop catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        window.print();
                      }}
                    >
                      <Printer /> Print planner view
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="gm-plan-kpi-row mt-4">
            <PlannerFact
              label="Crop profiles"
              value="32"
              note="Across all 8 groups"
            />
            <PlannerFact
              label="Cabbage varieties"
              value="10"
              note="Certified + open-pollinated"
            />
            <PlannerFact
              label="Kiambu fit"
              value="UM1 · 1,800 m"
              note="Mary's Githunguri farm"
            />
            <PlannerFact
              label="Recommended window"
              value="01 Oct–15 Nov"
              note="Short rains · cabbage"
            />
          </div>
        </header>
      </Reveal>

      {menu ? (
        <button
          type="button"
          className="gm-drop-close"
          aria-label="Close planner actions"
          onClick={() => setMenu(false)}
        />
      ) : null}

      <PlannerSubtabs
        value={view}
        label="Planner workspace"
        onChange={setView}
        items={[
          {
            id: "browse",
            label: "Crop selector",
            icon: <Leaf />,
            count: CROP_CATALOG.length,
          },
          {
            id: "plans",
            label: "Saved plans",
            icon: <ClipboardCheck />,
            count: plans.length,
          },
          { id: "tools", label: "Decision tools", icon: <Gauge />, count: 8 },
        ]}
      />

      {view === "browse" ? (
        <BrowseView
          group={group}
          groupCounts={groupCounts}
          query={query}
          difficulty={difficulty}
          water={water}
          zone={zone}
          sort={sort}
          rows={visibleCrops}
          filteredTotal={filteredCrops.length}
          page={Math.min(page, cropPages)}
          totalPages={cropPages}
          selectedIds={compareIds}
          onGroup={(value) => {
            setGroup(value);
            setPage(1);
          }}
          onQuery={(value) => {
            setQuery(value);
            setPage(1);
          }}
          onDifficulty={(value) => {
            setDifficulty(value);
            setPage(1);
          }}
          onWater={(value) => {
            setWater(value);
            setPage(1);
          }}
          onZone={(value) => {
            setZone(value);
            setPage(1);
          }}
          onSort={(value) => {
            setSort(value);
            setPage(1);
          }}
          onPage={setPage}
          onReset={resetFilters}
          onOpen={openCrop}
          onCompare={toggleCompare}
          onOpenSelection={() => setDrawer("selection")}
          onRunCompare={() => setModal("compare")}
          onLibrary={() => setModal("library")}
        />
      ) : null}

      {view === "plans" ? (
        <SavedPlansView
          rows={visiblePlans}
          allRows={plans}
          filteredTotal={filteredPlans.length}
          query={planQuery}
          filter={planFilter}
          page={Math.min(planPage, planPages)}
          totalPages={planPages}
          onQuery={(value) => {
            setPlanQuery(value);
            setPlanPage(1);
          }}
          onFilter={(value) => {
            setPlanFilter(value);
            setPlanPage(1);
          }}
          onPage={setPlanPage}
          onOpen={(id) => {
            setSelectedPlanId(id);
            setDrawer("plan");
          }}
          onCreate={() => setModal("plant")}
          onExport={() => setModal("export")}
        />
      ) : null}

      {view === "tools" ? (
        <DecisionTools
          onOpen={(id) => setModal(id)}
          onCustom={() => setModal("custom")}
        />
      ) : null}

      <DashboardDrawer
        open={drawer === "crop"}
        title={
          selectedCrop
            ? `${selectedCrop.name} · ${selectedCrop.swahili}`
            : "Crop detail"
        }
        onClose={() => setDrawer(null)}
        footer={
          selectedCrop ? (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => toggleCompare(selectedCrop.id)}
              >
                {compareIds.includes(selectedCrop.id) ? <X /> : <Plus />}
                {compareIds.includes(selectedCrop.id)
                  ? "Remove comparison"
                  : "Add to comparison"}
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal("plant")}
              >
                <Sprout /> Plant this crop
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedCrop ? (
          <CropDetailSheet
            crop={selectedCrop}
            tab={detailTab}
            varietyId={selectedVarietyId}
            onTab={setDetailTab}
            onVariety={setSelectedVarietyId}
            onPlant={(varietyId) => {
              setSelectedVarietyId(varietyId);
              setModal("plant");
            }}
            onReminder={() => setModal("reminder")}
            onCostSave={() => setModal("cost-save")}
            onStress={() => setModal("stress")}
            onMarket={() => setModal("markets")}
          />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "selection"}
        title={`Crop comparison shortlist · ${compareIds.length}/3`}
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-block"
            disabled={compareIds.length < 2}
            onClick={() => setModal("compare")}
          >
            <BarChart3 /> Compare {compareIds.length} crops
          </button>
        }
      >
        <ComparisonSelection
          ids={compareIds}
          onRemove={toggleCompare}
          onOpen={(id) => openCrop(id)}
          onBrowse={() => {
            setDrawer(null);
            setView("browse");
          }}
        />
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "plan"}
        title={selectedPlan ? `${selectedPlan.crop} crop plan` : "Saved plan"}
        onClose={() => setDrawer(null)}
        footer={
          selectedPlan ? (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => setModal("share")}
              >
                <Share2 /> Share
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal("plan-edit")}
              >
                <Pencil /> Edit plan
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedPlan ? (
          <SavedPlanDetail
            plan={selectedPlan}
            onCrop={() => {
              const crop =
                CROP_CATALOG.find((item) => item.name === selectedPlan.crop) ??
                CROP_CATALOG[0];
              if (crop) openCrop(crop.id);
            }}
            onCopy={() => setModal("plan-copy")}
            onDelete={() => setModal("plan-delete")}
            onExport={() => setModal("export")}
          />
        ) : null}
      </DashboardDrawer>

      {/* 1 — recommendation methodology */}
      <Dialog
        open={modal === "method"}
        onClose={() => setModal(null)}
        title="How GrowMO recommends crops"
        desc="Five explainable signals — never a black-box planting instruction."
        wide
      >
        <RecommendationMethod onClose={() => setModal(null)} />
      </Dialog>

      {/* 2 — complete crop library */}
      <Dialog
        open={modal === "library"}
        onClose={() => setModal(null)}
        title="Complete Kenyan crop library"
        desc="Every crop listed in the eight blueprint groups, with 32 full planning profiles."
        wide
      >
        <CropLibrary
          onSelect={(id, groupId) => {
            setGroup(groupId);
            setView("browse");
            setModal(null);
            setPage(1);
            if (id) openCrop(id);
          }}
        />
      </Dialog>

      {/* 3 — crop comparison */}
      <Dialog
        open={modal === "compare"}
        onClose={() => setModal(null)}
        title="Crop decision comparison"
        desc="Compare up to three enterprises on farm fit, cash need, timing and return."
        wide
      >
        <CropComparison
          ids={compareIds}
          onPlant={(id) => {
            setSelectedCropId(id);
            setModal("plant");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 4 — complete Plant This Crop workflow */}
      <Dialog
        open={modal === "plant"}
        onClose={() => setModal(null)}
        title={`Plant ${selectedCrop?.name ?? "a crop"}`}
        desc="Plot, variety, date, acreage, cost review and local plan confirmation."
        wide
      >
        {selectedCrop ? (
          <PlantCropWizard
            crop={selectedCrop}
            initialVariety={selectedVariety?.id ?? "gloria"}
            onDone={(plan) => {
              setPlans((rows) => [plan, ...rows]);
              setSelectedPlanId(plan.id);
              setModal(null);
              setDrawer("plan");
              setView("plans");
              toast.notify(
                `${plan.crop} plan created and saved locally`,
                "success",
              );
            }}
          />
        ) : null}
      </Dialog>

      {/* 5 — save cost scenario */}
      <Dialog
        open={modal === "cost-save"}
        onClose={() => setModal(null)}
        title="Save cost scenario"
        desc="Name and attach the current cabbage cost assumptions to a saved plan."
      >
        <SaveCostScenario
          plans={plans}
          onSave={() => {
            setModal(null);
            toast.notify("Cost scenario saved to the crop plan", "success");
          }}
        />
      </Dialog>

      {/* 6 — revenue stress test */}
      <Dialog
        open={modal === "stress"}
        onClose={() => setModal(null)}
        title="Revenue stress test"
        desc="Adjust loss rate, farm-gate price and unforeseen cost before committing."
        wide
      >
        <RevenueStressTest
          onUse={() => {
            setModal(null);
            toast.notify(
              "Stress-tested scenario added to planning assumptions",
              "success",
            );
          }}
        />
      </Dialog>

      {/* 7 — edit a saved plan */}
      <Dialog
        open={modal === "plan-edit"}
        onClose={() => setModal(null)}
        title="Edit saved crop plan"
        desc={
          selectedPlan
            ? `${selectedPlan.crop} · ${selectedPlan.plot}`
            : undefined
        }
        wide
      >
        {selectedPlan ? (
          <EditPlanWizard
            plan={selectedPlan}
            onSave={(next) => {
              setPlans((rows) =>
                rows.map((plan) => (plan.id === next.id ? next : plan)),
              );
              setModal(null);
              toast.notify("Crop plan updated", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 8 — duplicate a plan */}
      <Dialog
        open={modal === "plan-copy"}
        onClose={() => setModal(null)}
        title="Duplicate this plan"
        desc="Create a separate editable scenario without changing the original."
      >
        {selectedPlan ? (
          <DuplicatePlan
            plan={selectedPlan}
            onCopy={(copy) => {
              setPlans((rows) => [copy, ...rows]);
              setSelectedPlanId(copy.id);
              setModal(null);
              toast.notify("Editable plan copy created", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 9 — delete confirmation */}
      <Dialog
        open={modal === "plan-delete"}
        onClose={() => setModal(null)}
        title="Remove saved plan?"
        desc="This removes only the local planning record. It does not affect planted crops."
      >
        {selectedPlan ? (
          <DeletePlanConfirm
            plan={selectedPlan}
            onCancel={() => setModal(null)}
            onDelete={deleteSelectedPlan}
          />
        ) : null}
      </Dialog>

      {/* 10 — certified seed suppliers */}
      <Dialog
        open={modal === "suppliers"}
        onClose={() => setModal(null)}
        title="Certified seed suppliers"
        desc="Ten Kenyan supplier records with stock, delivery, verification and price."
        wide
      >
        <SupplierCentre
          onOrder={(id) => {
            setSelectedSupplierId(id);
            setModal("seed-order");
          }}
        />
      </Dialog>

      {/* 11 — money workflow with M-Pesa */}
      <Dialog
        open={modal === "seed-order"}
        onClose={() => setModal(null)}
        title="Reserve certified seed"
        desc={
          selectedSupplier
            ? `${selectedSupplier.name} · ${selectedSupplier.variety}`
            : undefined
        }
        wide
        dismissable
      >
        {selectedSupplier ? (
          <SeedOrderWizard
            supplier={selectedSupplier}
            onClose={() => setModal(null)}
            onPaid={() =>
              toast.notify("Seed reservation paid and receipt saved", "success")
            }
          />
        ) : null}
      </Dialog>

      {/* 12 — market outlook */}
      <Dialog
        open={modal === "markets"}
        onClose={() => setModal(null)}
        title="Cabbage market outlook"
        desc="Ten Kenyan market records with price, forecast, demand and transport."
        wide
      >
        <MarketOutlookCentre
          onUse={(market) => {
            setModal(null);
            toast.notify(
              `${market} selected for the revenue scenario`,
              "success",
            );
          }}
        />
      </Dialog>

      {/* 13 — labour planner */}
      <Dialog
        open={modal === "labour"}
        onClose={() => setModal(null)}
        title="Per-acre labour planner"
        desc="Ten activities from nursery preparation through harvest and grading."
        wide
      >
        <LabourPlanner
          onSave={() => {
            setModal(null);
            toast.notify("Labour schedule saved to cabbage plan", "success");
          }}
        />
      </Dialog>

      {/* 14 — irrigation planner */}
      <Dialog
        open={modal === "irrigation"}
        onClose={() => setModal(null)}
        title="Irrigation demand planner"
        desc="Stage-specific water demand for 17,000 cabbage plants per acre."
        wide
      >
        <IrrigationPlanner
          onSave={() => {
            setModal(null);
            toast.notify("Irrigation schedule saved", "success");
          }}
        />
      </Dialog>

      {/* 15 — crop rotation checker */}
      <Dialog
        open={modal === "rotation"}
        onClose={() => setModal(null)}
        title="Crop rotation checker"
        desc="Review the last crop, disease family and next safe planting window."
        wide
      >
        <RotationChecker
          onSave={() => {
            setModal(null);
            toast.notify(
              "Rotation note added to planning assumptions",
              "success",
            );
          }}
        />
      </Dialog>

      {/* 16 — soil fit workflow */}
      <Dialog
        open={modal === "soil-fit"}
        onClose={() => setModal(null)}
        title="Soil fit check"
        desc="Compare plot pH, drainage and organic matter against the crop target."
        wide
      >
        <SoilFitWizard
          crop={selectedCrop ?? CROP_CATALOG[0]}
          onUsePlot={(plot) => {
            setModal(null);
            toast.notify(`${plot} selected as the best-fit plot`, "success");
          }}
        />
      </Dialog>

      {/* 17 — structured risk assessment */}
      <Dialog
        open={modal === "risk"}
        onClose={() => setModal(null)}
        title="Pre-planting risk assessment"
        desc="Test weather, water, disease, finance and market readiness."
        wide
      >
        <RiskAssessment
          onSave={() => {
            setModal(null);
            toast.notify("Risk controls saved to the plan", "success");
          }}
        />
      </Dialog>

      {/* 18 — share plan */}
      <Dialog
        open={modal === "share"}
        onClose={() => setModal(null)}
        title="Share crop plan"
        desc="Send a complete local plan summary to a worker, agronomist or partner."
      >
        {selectedPlan ? (
          <SharePlan
            plan={selectedPlan}
            onDone={() => {
              setModal(null);
              toast.notify("Plan summary prepared for sharing", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 19 — export report */}
      <Dialog
        open={modal === "export"}
        onClose={() => setModal(null)}
        title="Export planner report"
        desc="Choose a useful report scope and download it locally."
        wide
      >
        <ExportPlanner
          plans={plans}
          selectedPlan={selectedPlan}
          onDone={() => {
            setModal(null);
            toast.notify("Planner report downloaded", "success");
          }}
        />
      </Dialog>

      {/* 20 — AI crop advisor */}
      <Dialog
        open={modal === "advisor"}
        onClose={() => setModal(null)}
        title="Crop choice advisor"
        desc="A transparent local simulation using Mary's farm profile and goals."
        wide
      >
        <CropAdvisor
          onChoose={(id) => {
            setSelectedCropId(id);
            setModal(null);
            openCrop(id);
          }}
        />
      </Dialog>

      {/* 21 — custom crop scenario */}
      <Dialog
        open={modal === "custom"}
        onClose={() => setModal(null)}
        title="Build a custom crop scenario"
        desc="Compare your own acreage, cost, yield and price assumptions."
        wide
      >
        <CustomScenario
          onSave={() => {
            setModal(null);
            toast.notify(
              "Custom scenario saved to this planning session",
              "success",
            );
          }}
        />
      </Dialog>

      {/* 22 — calendar reminder */}
      <Dialog
        open={modal === "reminder"}
        onClose={() => setModal(null)}
        title="Add planting-window reminder"
        desc="Save a local reminder for the selected Kiambu window."
      >
        <CalendarReminder
          onSave={() => {
            setModal(null);
            toast.notify("Planting-window reminder saved", "success");
          }}
        />
      </Dialog>
    </div>
  );
}

function BrowseView({
  group,
  groupCounts,
  query,
  difficulty,
  water,
  zone,
  sort,
  rows,
  filteredTotal,
  page,
  totalPages,
  selectedIds,
  onGroup,
  onQuery,
  onDifficulty,
  onWater,
  onZone,
  onSort,
  onPage,
  onReset,
  onOpen,
  onCompare,
  onOpenSelection,
  onRunCompare,
  onLibrary,
}: {
  group: CropGroupId;
  groupCounts: Record<CropGroupId, number>;
  query: string;
  difficulty: string;
  water: string;
  zone: string;
  sort: SortId;
  rows: CropCatalogItem[];
  filteredTotal: number;
  page: number;
  totalPages: number;
  selectedIds: string[];
  onGroup: (value: CropGroupId) => void;
  onQuery: (value: string) => void;
  onDifficulty: (value: string) => void;
  onWater: (value: string) => void;
  onZone: (value: string) => void;
  onSort: (value: SortId) => void;
  onPage: (value: number) => void;
  onReset: () => void;
  onOpen: (id: string, tab?: DetailTab) => void;
  onCompare: (id: string) => void;
  onOpenSelection: () => void;
  onRunCompare: () => void;
  onLibrary: () => void;
}) {
  const selectedGroup =
    CROP_GROUPS.find((item) => item.id === group) ?? CROP_GROUPS[0];
  return (
    <div>
      <Reveal>
        <DashboardSectionHeader
          eyebrow="3.1 · Eight crop groups"
          title="Choose a crop group"
          subtitle="Kuchagua vizuri huanza na mazingira yako — start with the enterprise family, then compare farm fit."
          action={
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={onLibrary}
            >
              <Wheat /> All listed crops
            </button>
          }
        />
        <div className="gm-plan-groups" role="tablist" aria-label="Crop groups">
          {CROP_GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={group === item.id}
              className={`gm-plan-group ${group === item.id ? "on" : ""}`}
              onClick={() => onGroup(item.id)}
            >
              <span className="gm-plan-group-symbol">{item.symbol}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{groupCounts[item.id]} detailed profiles</small>
              </span>
            </button>
          ))}
        </div>
        <section className="gm-card p-3 mt-2">
          <span className="gm-eyebrow">Included in {selectedGroup?.label}</span>
          <p className="mb-2 mt-1">{selectedGroup?.summary}</p>
          <div className="gm-plan-crops-in-group">
            {selectedGroup?.crops.map((crop) => (
              <span key={crop} className="gm-chip">
                {crop}
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <DashboardSectionHeader
          eyebrow={`3.2 · ${filteredTotal} matching detailed profiles`}
          title={`${selectedGroup?.label} crop selector`}
          subtitle="Every card includes maturity, zone, season, cost, yield, revenue, difficulty, water and Kiambu popularity."
        />
        <section className="gm-card p-3 mb-3">
          <div className="gm-plan-toolbar">
            <Field label="Search this crop group">
              <div className="gm-search-field">
                <Search />
                <input
                  className="gm-input"
                  value={query}
                  aria-label="Search crops by name, zone or season"
                  onChange={(event) => onQuery(event.target.value)}
                />
              </div>
            </Field>
            <Field label="Difficulty">
              <select
                className="gm-select"
                value={difficulty}
                onChange={(event) => onDifficulty(event.target.value)}
              >
                <option>All</option>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Advanced</option>
              </select>
            </Field>
            <Field label="Water need">
              <select
                className="gm-select"
                value={water}
                onChange={(event) => onWater(event.target.value)}
              >
                <option>All</option>
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
              </select>
            </Field>
            <Field label="Agro-ecological zone">
              <select
                className="gm-select"
                value={zone}
                onChange={(event) => onZone(event.target.value)}
              >
                <option>All</option>
                <option>LH1</option>
                <option>LH2</option>
                <option>UM1</option>
                <option>UM2</option>
                <option>UM3</option>
                <option>LM1</option>
                <option>LM2</option>
                <option>CL1</option>
              </select>
            </Field>
          </div>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
            <div className="d-flex flex-wrap gap-2">
              <span className="gm-chip">
                <Filter /> {filteredTotal} results
              </span>
              {query ||
              difficulty !== "All" ||
              water !== "All" ||
              zone !== "All" ? (
                <button
                  type="button"
                  className="gm-filter-chip is-active"
                  onClick={onReset}
                >
                  <RefreshCw /> Reset filters
                </button>
              ) : null}
            </div>
            <Field label="Sort by">
              <select
                className="gm-select"
                value={sort}
                onChange={(event) => onSort(event.target.value as SortId)}
              >
                <option value="popular">Kiambu popularity</option>
                <option value="cost-low">Lowest entry cost</option>
                <option value="revenue-high">Highest revenue potential</option>
                <option value="maturity">Fastest maturity</option>
              </select>
            </Field>
          </div>
        </section>

        <div className="gm-plan-grid">
          {rows.map((crop) => (
            <CropPlannerCard
              key={crop.id}
              crop={crop}
              selected={selectedIds.includes(crop.id)}
              onOpen={() => onOpen(crop.id)}
              onCompare={() => onCompare(crop.id)}
            />
          ))}
          {rows.length === 0 ? (
            <section className="gm-card gm-plan-empty">
              <ListFilter width={42} height={42} />
              <h3 className="font-display mt-2">
                No crops match these filters
              </h3>
              <p>Clear one or more filters to reopen this crop group.</p>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={onReset}
              >
                <RefreshCw /> Reset filters
              </button>
            </section>
          ) : null}
        </div>
        <Pagination
          page={page}
          total={totalPages}
          onChange={onPage}
          perPage={6}
          totalItems={filteredTotal}
        />
      </Reveal>

      {selectedIds.length > 0 ? (
        <div className="gm-plan-compare-tray">
          <div>
            <strong>{selectedIds.length} of 3 crops shortlisted</strong>
            <small className="d-block">
              Select at least two to compare side by side.
            </small>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-ghost gm-btn-sm"
              onClick={onOpenSelection}
            >
              Review shortlist
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              disabled={selectedIds.length < 2}
              onClick={onRunCompare}
            >
              <BarChart3 /> Compare crops
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SavedPlansView({
  rows,
  allRows,
  filteredTotal,
  query,
  filter,
  page,
  totalPages,
  onQuery,
  onFilter,
  onPage,
  onOpen,
  onCreate,
  onExport,
}: {
  rows: SavedCropPlan[];
  allRows: SavedCropPlan[];
  filteredTotal: number;
  query: string;
  filter: string;
  page: number;
  totalPages: number;
  onQuery: (value: string) => void;
  onFilter: (value: string) => void;
  onPage: (value: number) => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
  onExport: () => void;
}) {
  const filters = ["All", "Draft", "Ready", "Planted", "Review"];
  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow={`${allRows.length} locally available plans`}
        title="Saved crop plans"
        subtitle="Plans created here remain usable without linking to the unfinished crop-management page."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onExport}
            >
              <Download /> Export
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCreate}
            >
              <Plus /> New plan
            </button>
          </div>
        }
      />
      <div className="gm-stat-grid mb-3">
        <DashboardMetric
          icon={ClipboardList}
          label="All plans"
          value={String(allRows.length)}
          note="Across 2026 seasons"
        />
        <DashboardMetric
          icon={CheckCircle2}
          label="Ready"
          value={String(
            allRows.filter((plan) => plan.status === "Ready").length,
          )}
          note="Inputs can be scheduled"
        />
        <DashboardMetric
          icon={Coins}
          label="Planned budgets"
          value={kes(allRows.reduce((sum, plan) => sum + plan.budget, 0))}
          note="All local plan records"
        />
        <DashboardMetric
          icon={TrendingUp}
          label="Projected revenue"
          value={kes(
            allRows.reduce((sum, plan) => sum + plan.projectedRevenue, 0),
          )}
          note="Before actual harvest"
        />
      </div>
      <section className="gm-card p-3">
        <div className="gm-form-grid">
          <Field label="Search crop, variety, plot or season" full>
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                aria-label="Search saved crop plans"
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
          </Field>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
              onClick={() => onFilter(item)}
            >
              {item}
              <span className="gm-n">
                {item === "All"
                  ? allRows.length
                  : allRows.filter((plan) => plan.status === item).length}
              </span>
            </button>
          ))}
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop plan</th>
                <th>Plot / area</th>
                <th>Planting</th>
                <th>Budget</th>
                <th>Revenue</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <strong>
                      {plan.crop} · {plan.variety}
                    </strong>
                    <br />
                    <small>
                      {plan.id} · created {plan.created}
                    </small>
                  </td>
                  <td>
                    {plan.plot}
                    <br />
                    <small>{plan.acreage} acre</small>
                  </td>
                  <td>
                    {plan.plantingDate}
                    <br />
                    <small>{plan.season}</small>
                  </td>
                  <td className="font-display">{kes(plan.budget)}</td>
                  <td className="font-display">{kes(plan.projectedRevenue)}</td>
                  <td>
                    <StatusChip
                      label={plan.status}
                      tone={planTone(plan.status)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => onOpen(plan.id)}
                    >
                      <Eye /> Open
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    No saved plans match this search and status.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          total={totalPages}
          onChange={onPage}
          perPage={5}
          totalItems={filteredTotal}
        />
      </section>
    </Reveal>
  );
}

const TOOL_CARDS: {
  id: ToolId;
  title: string;
  note: string;
  icon: typeof Gauge;
}[] = [
  {
    id: "soil-fit",
    title: "Soil fit check",
    note: "Match crop pH, drainage and fertility to six plots.",
    icon: FlaskConical,
  },
  {
    id: "rotation",
    title: "Rotation checker",
    note: "Avoid crop-family and disease carry-over risk.",
    icon: RotateCcw,
  },
  {
    id: "risk",
    title: "Risk assessment",
    note: "Test water, weather, finance and market readiness.",
    icon: ShieldCheck,
  },
  {
    id: "markets",
    title: "Market outlook",
    note: "Compare ten markets after transport costs.",
    icon: TrendingUp,
  },
  {
    id: "labour",
    title: "Labour planner",
    note: "Cost ten farm activities per acre.",
    icon: Users,
  },
  {
    id: "irrigation",
    title: "Irrigation planner",
    note: "Estimate weekly litres through crop stages.",
    icon: Droplets,
  },
  {
    id: "suppliers",
    title: "Seed suppliers",
    note: "Find certified stock from ten Kenyan sellers.",
    icon: Store,
  },
  {
    id: "advisor",
    title: "Crop choice advisor",
    note: "Explainable recommendations for Mary's farm.",
    icon: Bot,
  },
];

function DecisionTools({
  onOpen,
  onCustom,
}: {
  onOpen: (id: ToolId) => void;
  onCustom: () => void;
}) {
  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow="Eight complete planning workflows"
        title="Decision tools"
        subtitle="Open an agronomy, logistics or market workflow. Every result can feed a real local plan."
        action={
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onCustom}
          >
            <Plus /> Custom scenario
          </button>
        }
      />
      <div className="gm-module-grid">
        {TOOL_CARDS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              type="button"
              className="gm-module"
              onClick={() => onOpen(tool.id)}
            >
              <span className="gm-mega-icon">
                <Icon />
              </span>
              <strong>{tool.title}</strong>
              <small>{tool.note}</small>
              <span className="gm-chip">
                Open workflow <ArrowRight />
              </span>
            </button>
          );
        })}
      </div>
      <section className="gm-card p-3 mt-4">
        <DashboardSectionHeader
          eyebrow="Decision order"
          title="A safer way to plan"
        />
        <div className="gm-plan-summary-grid">
          {[
            [
              "1",
              "Confirm farm fit",
              "Start with soil, zone, water and recent rotation.",
            ],
            [
              "2",
              "Choose the variety",
              "Compare maturity, resistance, yield and market preference.",
            ],
            [
              "3",
              "Test the economics",
              "Include all labour, logistics and a downside price case.",
            ],
            [
              "4",
              "Save the field plan",
              "Assign a real plot, acreage, date and budget.",
            ],
            [
              "5",
              "Source certified inputs",
              "Verify supplier stock before the planting window.",
            ],
            [
              "6",
              "Review before planting",
              "Re-check rainfall and cash position seven days before.",
            ],
          ].map(([number, title, note]) => (
            <div key={number} className="gm-check-row">
              <span className="gm-mega-icon font-display">{number}</span>
              <span>
                <strong>{title}</strong>
                <small>{note}</small>
              </span>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function CropDetailSheet({
  crop,
  tab,
  varietyId,
  onTab,
  onVariety,
  onPlant,
  onReminder,
  onCostSave,
  onStress,
  onMarket,
}: {
  crop: CropCatalogItem;
  tab: DetailTab;
  varietyId: string;
  onTab: (tab: DetailTab) => void;
  onVariety: (id: string) => void;
  onPlant: (varietyId: string) => void;
  onReminder: () => void;
  onCostSave: () => void;
  onStress: () => void;
  onMarket: () => void;
}) {
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-plan-crop-art">{crop.symbol}</span>
        <div style={{ flex: "1 1 260px" }}>
          <span className="gm-eyebrow">3.3 · Crop detail sheet</span>
          <h2 className="font-display mb-1">
            {crop.name} · {crop.swahili}
          </h2>
          <p className="mb-2">{crop.countyNote}</p>
          <div className="d-flex flex-wrap gap-2">
            <StatusChip
              label={`${crop.popularity}% Kiambu popularity`}
              tone="low"
            />
            <StatusChip
              label={crop.difficulty}
              tone={
                crop.difficulty === "Easy"
                  ? "low"
                  : crop.difficulty === "Moderate"
                    ? "medium"
                    : "high"
              }
            />
            <StatusChip
              label={`${crop.water} water`}
              tone={
                crop.water === "High"
                  ? "high"
                  : crop.water === "Moderate"
                    ? "medium"
                    : "low"
              }
            />
          </div>
        </div>
      </div>
      <div className="gm-plan-detail-tabs">
        <PlannerSubtabs
          value={tab}
          label="Crop detail views"
          onChange={onTab}
          items={[
            { id: "overview", label: "Overview" },
            { id: "varieties", label: "Varieties", count: 10 },
            { id: "calendar", label: "Kiambu calendar", count: 4 },
            { id: "costs", label: "Cost / acre", count: 19 },
            { id: "returns", label: "Revenue", count: 4 },
          ]}
        />
      </div>
      {tab === "overview" ? <CropOverview crop={crop} /> : null}
      {tab === "varieties" ? (
        <VarietyComparison
          selectedId={varietyId}
          onSelect={onVariety}
          onPlant={onPlant}
          crop={crop}
        />
      ) : null}
      {tab === "calendar" ? (
        <KiambuCalendar crop={crop} onReminder={onReminder} />
      ) : null}
      {tab === "costs" ? (
        <CostCalculator crop={crop} onSave={onCostSave} />
      ) : null}
      {tab === "returns" ? (
        <RevenueCalculator
          crop={crop}
          onStress={onStress}
          onMarket={onMarket}
        />
      ) : null}
    </div>
  );
}

function CropOverview({ crop }: { crop: CropCatalogItem }) {
  return (
    <div>
      <span className="gm-eyebrow">3.3.1 · Crop overview</span>
      <div className="gm-table-wrap mt-2">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Scientific name</td>
              <td>
                <strong>
                  <em>{crop.scientific}</em>
                </strong>
              </td>
            </tr>
            <tr>
              <td>Kiswahili</td>
              <td>
                <strong>{crop.swahili}</strong>
              </td>
            </tr>
            <tr>
              <td>Family</td>
              <td>
                <strong>{crop.family}</strong>
              </td>
            </tr>
            <tr>
              <td>Origin</td>
              <td>
                <strong>{crop.origin}</strong>
              </td>
            </tr>
            <tr>
              <td>Grown in Kenya</td>
              <td>
                <strong>{crop.kenyaRegions}</strong>
              </td>
            </tr>
            <tr>
              <td>Best zones</td>
              <td>
                <strong>{crop.zones.join(", ")}</strong>
              </td>
            </tr>
            <tr>
              <td>Seasons</td>
              <td>
                <strong>{crop.seasons}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="gm-plan-summary-grid mt-3">
        <PlannerFact
          label="Maturity"
          value={crop.maturity}
          note="Expected field duration"
        />
        <PlannerFact
          label="Estimated yield / acre"
          value={crop.yield}
          note="Under good management"
        />
        <PlannerFact
          label="Estimated cost / acre"
          value={`${kes(crop.costMin)}–${kes(crop.costMax).replace("KES ", "")}`}
          note="Before farm-specific adjustment"
        />
        <PlannerFact
          label="Estimated revenue / acre"
          value={`${kes(crop.revenueMin)}–${kes(crop.revenueMax).replace("KES ", "")}`}
          note="Price and grade dependent"
        />
        <PlannerFact
          label="Water need"
          value={crop.water}
          note="Confirm source before planting"
        />
        <PlannerFact
          label="Kiambu popularity"
          value={`${crop.popularity}%`}
          note={crop.countyNote}
        />
      </div>
      {crop.id === "cabbage" ? (
        <div className="gm-plan-rec mt-3">
          <span className="gm-eyebrow">
            <Sparkles /> Kiambu AI recommendation
          </span>
          <p className="mb-0 mt-2">
            <strong>{AI_CABBAGE_RECOMMENDATION}</strong>
          </p>
        </div>
      ) : (
        <div className="gm-card p-3 mt-3">
          <span className="gm-eyebrow">Detailed enterprise model</span>
          <p className="mb-0 mt-2">
            The blueprint's full 10-variety, four-window and 19-line worked
            model is calibrated for cabbage. This crop overview remains fully
            selectable; use the custom scenario tool to model its own farm
            assumptions.
          </p>
        </div>
      )}
    </div>
  );
}

function VarietyComparison({
  selectedId,
  onSelect,
  onPlant,
  crop,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onPlant: (id: string) => void;
  crop: CropCatalogItem;
}) {
  const [query, setQuery] = useState("");
  const [stock, setStock] = useState("All");
  const [page, setPage] = useState(1);
  const rows = CABBAGE_VARIETIES.filter(
    (variety) =>
      `${variety.variety} ${variety.company} ${variety.resistance} ${variety.suitability}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (stock === "All" || variety.stock === stock),
  );
  const perPage = 5;
  const total = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  if (crop.id !== "cabbage") {
    return (
      <div className="gm-card p-3">
        <span className="gm-eyebrow">Cabbage worked example</span>
        <h3 className="font-display mt-2">
          The comprehensive variety table is specific to cabbage in Kiambu
        </h3>
        <p>
          Return to Cabbage for the ten-row comparison, or continue with a
          custom {crop.name} enterprise scenario using the complete crop
          overview assumptions.
        </p>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onPlant(selectedId)}
        >
          <Sprout /> Continue with {crop.name}
        </button>
      </div>
    );
  }
  return (
    <div>
      <span className="gm-eyebrow">3.3.2 · Ten-variety comparison</span>
      <div className="gm-plan-rec mt-2 mb-3">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <ScoreRing score={94} size={86} />
          <div style={{ flex: "1 1 260px" }}>
            <span className="gm-eyebrow">
              <Bot /> GrowMO AI · UM1 Kiambu
            </span>
            <p className="mb-2 mt-1">
              <strong>{AI_CABBAGE_RECOMMENDATION}</strong>
            </p>
            <button
              type="button"
              className="gm-btn gm-btn-dark gm-btn-sm"
              onClick={() => {
                onSelect("gloria");
                onPlant("gloria");
              }}
            >
              <Sprout /> Use Gloria F1
            </button>
          </div>
        </div>
      </div>
      <div className="gm-form-grid">
        <Field label="Search variety, company or resistance">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search cabbage varieties"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </Field>
        <Field label="Supplier stock">
          <select
            className="gm-select"
            value={stock}
            onChange={(event) => {
              setStock(event.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>Available</option>
            <option>Low stock</option>
            <option>Pre-order</option>
          </select>
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Variety / company</th>
              <th>Maturity</th>
              <th>Head kg</th>
              <th>Yield / acre</th>
              <th>Price / 10g</th>
              <th>Resistance</th>
              <th>Suitability</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((variety) => (
              <tr key={variety.id}>
                <td>
                  <button
                    type="button"
                    className={`gm-filter-chip ${selectedId === variety.id ? "is-active" : ""}`}
                    onClick={() => onSelect(variety.id)}
                  >
                    {selectedId === variety.id ? <Check /> : <Plus />}{" "}
                    {variety.score}
                  </button>
                </td>
                <td>
                  <strong>{variety.variety}</strong>
                  <br />
                  <small>{variety.company}</small>
                </td>
                <td>{variety.maturity} days</td>
                <td>{variety.headWeight}</td>
                <td>{variety.yield}</td>
                <td className="font-display">{kes(variety.price10g)}</td>
                <td>{variety.resistance}</td>
                <td>{variety.suitability}</td>
                <td>
                  <StatusChip
                    label={variety.stock}
                    tone={
                      variety.stock === "Available"
                        ? "low"
                        : variety.stock === "Low stock"
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
        page={Math.min(page, total)}
        total={total}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onPlant(selectedId)}
        >
          <Sprout /> Plant selected variety
        </button>
      </div>
    </div>
  );
}

function KiambuCalendar({
  crop,
  onReminder,
}: {
  crop: CropCatalogItem;
  onReminder: () => void;
}) {
  const [selected, setSelected] = useState("short-rains");
  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2">
        <div>
          <span className="gm-eyebrow">3.3.3 · Kiambu-specific calendar</span>
          <h3 className="font-display mt-1">
            Four planting windows for {crop.name}
          </h3>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onReminder}
        >
          <BellRing /> Add reminder
        </button>
      </div>
      <div className="gm-plan-calendar mt-3">
        {PLANTING_WINDOWS.map((window) => (
          <article
            key={window.id}
            className={selected === window.id ? "gm-risk gm-risk-low" : ""}
          >
            <div className="d-flex justify-content-between gap-2">
              <StatusChip label={window.recommendation} tone={window.tone} />
              <input
                type="radio"
                checked={selected === window.id}
                onChange={() => setSelected(window.id)}
                aria-label={`Select ${window.season}`}
              />
            </div>
            <h4 className="font-display mb-0">{window.season}</h4>
            <div>
              <small>Planting window</small>
              <strong className="d-block">{window.planting}</strong>
            </div>
            <div>
              <small>Harvest window</small>
              <strong className="d-block">{window.harvest}</strong>
            </div>
            <div className="gm-check-row mt-auto">
              <AlertTriangle />
              <span>
                <small>Primary risk</small>
                <strong>{window.risk}</strong>
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="gm-plan-rec mt-3">
        <strong>
          Selected window:{" "}
          {PLANTING_WINDOWS.find((window) => window.id === selected)?.season}
        </strong>
        <p className="mb-0 mt-1">
          For cabbage in UM1 Githunguri, the short rains remain best. Prepare
          nursery four weeks before 20 October and protect drainage before wet
          November nights.
        </p>
      </div>
    </div>
  );
}

function CostCalculator({
  crop,
  onSave,
}: {
  crop: CropCatalogItem;
  onSave: () => void;
}) {
  const [acreage, setAcreage] = useState("1");
  const [yieldHeads, setYieldHeads] = useState("17000");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const scale = Math.max(0.1, Number(acreage) || 0);
  const adjustedBase =
    crop.id === "cabbage"
      ? BASE_COST_TOTAL
      : Math.round((crop.costMin + crop.costMax) / 2);
  const total = Math.round(adjustedBase * scale);
  const heads = Math.max(1, Number(yieldHeads) * scale);
  const costPerHead = total / heads;
  const rows = CABBAGE_COST_ITEMS.filter(
    (item) =>
      `${item.item} ${item.quantity} ${item.when}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All" || item.category === category),
  );
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <span className="gm-eyebrow">
        3.3.4 · Dynamic per-acre cost calculator
      </span>
      <div className="gm-plan-cost-controls mt-2">
        <Field label="Acreage">
          <input
            className="gm-input"
            inputMode="decimal"
            value={acreage}
            onChange={(event) =>
              setAcreage(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
            }
          />
        </Field>
        <Field label="Expected marketable heads / acre">
          <input
            className="gm-input"
            inputMode="numeric"
            value={yieldHeads}
            onChange={(event) =>
              setYieldHeads(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Cost category">
          <select
            className="gm-select"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>Land</option>
            <option>Inputs</option>
            <option>Labour</option>
            <option>Harvest</option>
          </select>
        </Field>
      </div>
      <Field label="Search the full cost schedule">
        <div className="gm-search-field">
          <Search />
          <input
            className="gm-input"
            value={query}
            aria-label="Search cost line items"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </Field>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Item</th>
              <th>Quantity / acre</th>
              <th>Unit price</th>
              <th>Total / acre</th>
              <th>For {scale} ac</th>
              <th>When needed</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id}>
                <td>
                  <StatusChip label={item.category} />
                </td>
                <td>
                  <strong>{item.item}</strong>
                </td>
                <td>{item.quantity}</td>
                <td className="font-display">{kes(item.unitPrice)}</td>
                <td className="font-display">{kes(item.total)}</td>
                <td className="font-display">
                  {kes(Math.round(item.total * scale))}
                </td>
                <td>{item.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={Math.min(page, pages)}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
      <div className="gm-plan-total mt-3">
        <div>
          <small>Dynamic total · {scale} acre</small>
          <strong className="font-display">{kes(total)}</strong>
        </div>
        <div>
          <small>Cost per marketable head</small>
          <strong className="font-display">{kes(costPerHead)}</strong>
        </div>
        <div>
          <small>Blueprint baseline · 1 acre</small>
          <strong className="font-display">{kes(BASE_COST_TOTAL)}</strong>
        </div>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSave}>
          <Plus /> Save scenario
        </button>
      </div>
      <p className="text-muted mt-2 mb-0">
        <small>
          The displayed blueprint baseline is KES 101,700 ÷ 17,000 heads = KES
          5.98/head. For non-cabbage profiles, the calculator calibrates from
          the crop's midpoint cost while preserving the full worked schedule for
          reference.
        </small>
      </p>
    </div>
  );
}

function RevenueCalculator({
  crop,
  onStress,
  onMarket,
}: {
  crop: CropCatalogItem;
  onStress: () => void;
  onMarket: () => void;
}) {
  const [marketPrice, setMarketPrice] = useState("30");
  const [yieldHeads, setYieldHeads] = useState("17000");
  const [cost, setCost] = useState(
    String(
      crop.id === "cabbage"
        ? BASE_COST_TOTAL
        : Math.round((crop.costMin + crop.costMax) / 2),
    ),
  );
  const currentGross = Number(marketPrice) * Number(yieldHeads);
  const currentNet = currentGross - Number(cost);
  const currentRoi =
    Number(cost) > 0 ? Math.round((currentNet / Number(cost)) * 100) : 0;
  const rows = REVENUE_SCENARIOS.map((scenario) =>
    scenario.id === "market"
      ? {
          ...scenario,
          pricePerHead: Number(marketPrice),
          yieldHeads: Number(yieldHeads),
          grossRevenue: currentGross,
          netProfit: currentNet,
          roi: currentRoi,
        }
      : scenario,
  );
  return (
    <div>
      <span className="gm-eyebrow">3.3.5 · Dynamic revenue projection</span>
      <div className="gm-form-grid mt-2">
        <Field label="Current market price / head (KES)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={marketPrice}
            onChange={(event) =>
              setMarketPrice(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Expected marketable heads">
          <input
            className="gm-input"
            inputMode="numeric"
            value={yieldHeads}
            onChange={(event) =>
              setYieldHeads(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Total season cost (KES)">
          <input
            className="gm-input"
            inputMode="numeric"
            value={cost}
            onChange={(event) =>
              setCost(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
          />
        </Field>
      </div>
      <div className="gm-plan-scenario-grid mt-3">
        {rows.map((scenario) => (
          <article key={scenario.id} className="gm-card p-3">
            <div className="d-flex justify-content-between gap-2">
              <span className="gm-eyebrow">{scenario.scenario}</span>
              <StatusChip
                label={`${scenario.roi}% ROI`}
                tone={
                  scenario.roi > 100
                    ? "low"
                    : scenario.roi > 0
                      ? "medium"
                      : "high"
                }
              />
            </div>
            <strong className="font-display gm-plan-fact-value">
              {kes(scenario.netProfit)}
            </strong>
            <small>Net profit</small>
            <div className="gm-check-row mt-2">
              <span style={{ flex: 1 }}>
                <small>Gross revenue</small>
                <strong className="font-display">
                  {kes(scenario.grossRevenue)}
                </strong>
              </span>
            </div>
            <div className="d-flex justify-content-between gap-2 mt-2">
              <small>{kes(scenario.pricePerHead)}/head</small>
              <small>{scenario.yieldHeads.toLocaleString()} heads</small>
            </div>
          </article>
        ))}
      </div>
      <div className="gm-plan-rec mt-3">
        <strong>
          Break-even: {kes(Number(cost) / Math.max(1, Number(yieldHeads)))} per
          marketable head
        </strong>
        <p className="mb-0 mt-1">
          The current-market case updates immediately. Compare the full
          ten-market outlook or add loss and unforeseen-cost assumptions before
          planting.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onMarket}
        >
          <TrendingUp /> Compare markets
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onStress}>
          <ShieldCheck /> Stress-test returns
        </button>
      </ModalFooter>
    </div>
  );
}

function ComparisonSelection({
  ids,
  onRemove,
  onOpen,
  onBrowse,
}: {
  ids: string[];
  onRemove: (id: string) => void;
  onOpen: (id: string) => void;
  onBrowse: () => void;
}) {
  const rows = ids
    .map((id) => CROP_CATALOG.find((crop) => crop.id === id))
    .filter(Boolean) as CropCatalogItem[];
  return (
    <div>
      {rows.map((crop) => (
        <div key={crop.id} className="gm-check-row">
          <span className="gm-plan-group-symbol">{crop.symbol}</span>
          <span style={{ flex: 1 }}>
            <strong>
              {crop.name} · {crop.swahili}
            </strong>
            <small>
              {crop.maturity} · {kes(crop.costMin)}–
              {kes(crop.costMax).replace("KES ", "")}/acre
            </small>
          </span>
          <button
            type="button"
            className="gm-icon-btn"
            aria-label={`Open ${crop.name}`}
            onClick={() => onOpen(crop.id)}
          >
            <Eye />
          </button>
          <button
            type="button"
            className="gm-icon-btn"
            aria-label={`Remove ${crop.name}`}
            onClick={() => onRemove(crop.id)}
          >
            <X />
          </button>
        </div>
      ))}
      {rows.length < 3 ? (
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-block mt-3"
          onClick={onBrowse}
        >
          <Plus /> Add another crop
        </button>
      ) : (
        <p className="text-muted mt-3">
          Shortlist full. Remove one crop to add another.
        </p>
      )}
    </div>
  );
}

function SavedPlanDetail({
  plan,
  onCrop,
  onCopy,
  onDelete,
  onExport,
}: {
  plan: SavedCropPlan;
  onCrop: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const roi = Math.round(
    ((plan.projectedRevenue - plan.budget) / plan.budget) * 100,
  );
  return (
    <div>
      <div className="gm-plan-detail-hero">
        <span className="gm-plan-crop-art">🌱</span>
        <div style={{ flex: 1 }}>
          <StatusChip label={plan.status} tone={planTone(plan.status)} />
          <h2 className="font-display mt-2 mb-1">
            {plan.crop} · {plan.variety}
          </h2>
          <p className="mb-0">
            {plan.id} · created {plan.created}
          </p>
        </div>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Plot</td>
              <td>
                <strong>{plan.plot}</strong>
              </td>
            </tr>
            <tr>
              <td>Acreage</td>
              <td>
                <strong>{plan.acreage} acre</strong>
              </td>
            </tr>
            <tr>
              <td>Planting</td>
              <td>
                <strong>{plan.plantingDate}</strong>
              </td>
            </tr>
            <tr>
              <td>Season</td>
              <td>
                <strong>{plan.season}</strong>
              </td>
            </tr>
            <tr>
              <td>Budget</td>
              <td className="font-display">
                <strong>{kes(plan.budget)}</strong>
              </td>
            </tr>
            <tr>
              <td>Projected revenue</td>
              <td className="font-display">
                <strong>{kes(plan.projectedRevenue)}</strong>
              </td>
            </tr>
            <tr>
              <td>Projected net / ROI</td>
              <td className="font-display">
                <strong>
                  {kes(plan.projectedRevenue - plan.budget)} · {roi}%
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="gm-check-list mt-3">
        <div className="gm-check-row">
          <Check />
          <span>
            <strong>Plan saved locally</strong>
            <small>Available here without Page 4.</small>
          </span>
        </div>
        <div className="gm-check-row">
          <Check />
          <span>
            <strong>Cost and return attached</strong>
            <small>Budget is scaled to {plan.acreage} acre.</small>
          </span>
        </div>
        <div className="gm-check-row">
          <CalendarCheck />
          <span>
            <strong>Planting date assigned</strong>
            <small>
              {plan.plantingDate} · {plan.season}
            </small>
          </span>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onCrop}
        >
          <Leaf /> Crop profile
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onCopy}
        >
          <Copy /> Duplicate
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onExport}
        >
          <Download /> Export
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onDelete}
        >
          <Trash2 /> Remove
        </button>
      </div>
    </div>
  );
}

function RecommendationMethod({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"signals" | "confidence" | "limits">(
    "signals",
  );
  return (
    <div>
      <PlannerSubtabs
        value={tab}
        label="Recommendation method"
        onChange={setTab}
        items={[
          { id: "signals", label: "Five signals" },
          { id: "confidence", label: "Confidence" },
          { id: "limits", label: "Farmer control" },
        ]}
      />
      {tab === "signals" ? (
        <div className="gm-plan-summary-grid">
          {PLANNER_METHODS.map((method, index) => (
            <div key={method.id} className="gm-check-row">
              <span className="gm-mega-icon font-display">{index + 1}</span>
              <span>
                <strong>{method.title}</strong>
                <small>{method.detail}</small>
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "confidence" ? (
        <div className="d-flex flex-wrap align-items-center gap-4">
          <ScoreRing score={94} size={128} />
          <div style={{ flex: "1 1 280px" }}>
            <h3 className="font-display">94% confidence for Gloria F1</h3>
            <p>
              The score combines UM1 altitude fit, known market preference,
              maturity, certified-seed access and black-rot tolerance. It falls
              if plot water, pH or buyer assumptions are missing.
            </p>
            <ProgressLine
              value={94}
              label="Gloria F1 recommendation confidence"
            />
          </div>
        </div>
      ) : null}
      {tab === "limits" ? (
        <div className="gm-card p-3">
          <h3 className="font-display">
            The farmer remains the decision-maker
          </h3>
          <p>
            GrowMO does not know future weather, final farm-gate prices or field
            conditions with certainty. Recommendations must be reviewed against
            current soil tests, verified seed stock, working capital and an
            identified buyer.
          </p>
          <div className="gm-check-row">
            <ShieldCheck />
            <strong>No crop is planted or purchased automatically.</strong>
          </div>
        </div>
      ) : null}
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          <Check /> Understood
        </button>
      </ModalFooter>
    </div>
  );
}

function CropLibrary({
  onSelect,
}: {
  onSelect: (id: string | null, group: CropGroupId) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"All" | CropGroupId>("All");
  const [page, setPage] = useState(1);
  const flatRows = CROP_GROUPS.flatMap((item) =>
    item.crops.map((name) => ({
      group: item,
      name,
      detail: CROP_CATALOG.find(
        (crop) =>
          crop.group === item.id &&
          (crop.name === name ||
            (name.startsWith("Beans") && crop.id === "beans")),
      ),
    })),
  );
  const rows = flatRows.filter(
    (row) =>
      `${row.name} ${row.group.label}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (group === "All" || row.group.id === group),
  );
  const perPage = 10;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Search every listed crop">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search complete crop library"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </Field>
        <Field label="Crop group">
          <select
            className="gm-select"
            value={group}
            onChange={(event) => {
              setGroup(event.target.value as "All" | CropGroupId);
              setPage(1);
            }}
          >
            <option>All</option>
            {CROP_GROUPS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>Crop</th>
              <th>Planning profile</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={`${row.group.id}-${row.name}`}>
                <td>
                  {row.group.symbol} {row.group.label}
                </td>
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td>
                  {row.detail ? (
                    <StatusChip label="Detailed profile" tone="low" />
                  ) : (
                    <StatusChip label="Group listing" />
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={() =>
                      onSelect(row.detail?.id ?? null, row.group.id)
                    }
                  >
                    {row.detail ? <Eye /> : <Filter />}{" "}
                    {row.detail ? "Open profile" : "Browse group"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={Math.min(page, pages)}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
    </div>
  );
}

function CropComparison({
  ids,
  onPlant,
  onClose,
}: {
  ids: string[];
  onPlant: (id: string) => void;
  onClose: () => void;
}) {
  const rows = ids
    .map((id) => CROP_CATALOG.find((crop) => crop.id === id))
    .filter(Boolean) as CropCatalogItem[];
  if (rows.length < 2)
    return (
      <div className="text-center p-3">
        <BarChart3 width={44} height={44} />
        <h3 className="font-display mt-2">Select at least two crops</h3>
        <p>A side-by-side decision needs two or three crop profiles.</p>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Return to crop selector
        </button>
      </div>
    );
  const best = [...rows].sort(
    (a, b) => b.revenueMax - b.costMax - (a.revenueMax - a.costMax),
  )[0];
  return (
    <div>
      <div className="gm-plan-rec mb-3">
        <span className="gm-eyebrow">
          <Sparkles /> Highest upside in this shortlist
        </span>
        <h3 className="font-display mt-1">{best?.name}</h3>
        <p className="mb-0">
          Potential spread:{" "}
          {kes((best?.revenueMax ?? 0) - (best?.costMax ?? 0))}/acre before
          losses. Confirm water, working capital and buyer demand first.
        </p>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Decision factor</th>
              {rows.map((crop) => (
                <th key={crop.id}>
                  {crop.symbol} {crop.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Maturity</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.maturity}</td>
              ))}
            </tr>
            <tr>
              <td>Best zones</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.zones.join(", ")}</td>
              ))}
            </tr>
            <tr>
              <td>Season</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.seasons}</td>
              ))}
            </tr>
            <tr>
              <td>Cost / acre</td>
              {rows.map((crop) => (
                <td key={crop.id} className="font-display">
                  {kes(crop.costMin)}–{kes(crop.costMax).replace("KES ", "")}
                </td>
              ))}
            </tr>
            <tr>
              <td>Yield</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.yield}</td>
              ))}
            </tr>
            <tr>
              <td>Revenue / acre</td>
              {rows.map((crop) => (
                <td key={crop.id} className="font-display">
                  {kes(crop.revenueMin)}–
                  {kes(crop.revenueMax).replace("KES ", "")}
                </td>
              ))}
            </tr>
            <tr>
              <td>Difficulty</td>
              {rows.map((crop) => (
                <td key={crop.id}>
                  <StatusChip
                    label={crop.difficulty}
                    tone={
                      crop.difficulty === "Easy"
                        ? "low"
                        : crop.difficulty === "Moderate"
                          ? "medium"
                          : "high"
                    }
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td>Water</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.water}</td>
              ))}
            </tr>
            <tr>
              <td>Kiambu popularity</td>
              {rows.map((crop) => (
                <td key={crop.id}>{crop.popularity}%</td>
              ))}
            </tr>
            <tr>
              <td>Choose</td>
              {rows.map((crop) => (
                <td key={crop.id}>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime gm-btn-sm"
                    onClick={() => onPlant(crop.id)}
                  >
                    <Sprout /> Plan
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlantCropWizard({
  crop,
  initialVariety,
  onDone,
}: {
  crop: CropCatalogItem;
  initialVariety: string;
  onDone: (plan: SavedCropPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [plotId, setPlotId] = useState(FARM_PLOTS[0]?.id ?? "");
  const [varietyId, setVarietyId] = useState(initialVariety);
  const [plantingDate, setPlantingDate] = useState("2026-10-20");
  const [acreage, setAcreage] = useState("0.5");
  const [confirmed, setConfirmed] = useState(false);
  const plot = FARM_PLOTS.find((item) => item.id === plotId) ?? FARM_PLOTS[0];
  const variety =
    CABBAGE_VARIETIES.find((item) => item.id === varietyId) ??
    CABBAGE_VARIETIES[0];
  const area = Number(acreage) || 0;
  const perAcreCost =
    crop.id === "cabbage"
      ? BASE_COST_TOTAL
      : Math.round((crop.costMin + crop.costMax) / 2);
  const perAcreRevenue =
    crop.id === "cabbage"
      ? 510000
      : Math.round((crop.revenueMin + crop.revenueMax) / 2);
  const budget = Math.round(perAcreCost * area);
  const revenue = Math.round(perAcreRevenue * area);
  return (
    <div>
      <Stepper
        steps={[
          "Plot",
          "Variety",
          "Planting date",
          "Acreage",
          "Cost review",
          "Confirmation",
        ]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-plan-summary-grid mt-3">
          {FARM_PLOTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gm-checkcard ${plotId === item.id ? "on" : ""}`}
              disabled={item.available <= 0}
              onClick={() => {
                setPlotId(item.id);
                setAcreage(String(Math.min(0.5, item.available)));
              }}
            >
              <input
                type="radio"
                checked={plotId === item.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.available} of {item.acres} ac available · {item.zone}
                </small>
                <small>
                  {item.soil} · pH {item.ph} · {item.water}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        crop.id === "cabbage" ? (
          <div className="gm-plan-summary-grid mt-3">
            {CABBAGE_VARIETIES.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`gm-checkcard ${varietyId === item.id ? "on" : ""}`}
                onClick={() => setVarietyId(item.id)}
              >
                <input
                  type="radio"
                  checked={varietyId === item.id}
                  readOnly
                  tabIndex={-1}
                />
                <span>
                  <strong>
                    {item.variety} · {item.score}/100
                  </strong>
                  <small>
                    {item.company} · {item.maturity} days
                  </small>
                  <small>
                    {item.resistance} · {kes(item.price10g)}/10g
                  </small>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="gm-card p-3 mt-3">
            <StatusChip label="Crop profile selection" tone="low" />
            <h3 className="font-display mt-2">{crop.name} planning profile</h3>
            <p>
              The catalog assumptions for {crop.scientific} will be attached.
              Confirm a certified locally available variety with your agrovet
              before buying seed.
            </p>
            <div className="gm-check-row">
              <PackageCheck />
              <span>
                <strong>Certified variety to be confirmed</strong>
                <small>
                  {crop.maturity} · {crop.zones.join(", ")}
                </small>
              </span>
            </div>
          </div>
        )
      ) : null}
      {step === 2 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Planting date">
            <input
              className="gm-input"
              type="date"
              min="2026-09-19"
              value={plantingDate}
              onChange={(event) => setPlantingDate(event.target.value)}
            />
          </Field>
          <Field label="Recommended window">
            <input className="gm-input" value="01 Oct–15 Nov 2026" readOnly />
          </Field>
          <div className="full gm-plan-rec">
            <StatusChip label="Recommended · 20 Oct" tone="low" />
            <p className="mb-0 mt-2">
              Nursery establishment begins four weeks earlier. Expected cabbage
              harvest is January–February 2027.
            </p>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="gm-form-grid mt-3">
          <Field label={`Acreage · maximum ${plot?.available ?? 0} ac`}>
            <input
              className="gm-input"
              inputMode="decimal"
              value={acreage}
              onChange={(event) =>
                setAcreage(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
                )
              }
            />
          </Field>
          <Field label="Selected plot">
            <input
              className="gm-input"
              value={`${plot?.name} · ${plot?.zone}`}
              readOnly
            />
          </Field>
          <div className="full gm-card p-3">
            <strong>Land check</strong>
            <p className="mb-0 mt-1">
              {area > (plot?.available ?? 0)
                ? `Reduce acreage to ${plot?.available ?? 0} or less.`
                : `${area} acre fits within the selected plot's ${plot?.available ?? 0} acre availability.`}
            </p>
          </div>
        </div>
      ) : null}
      {step === 4 ? (
        <div>
          <div className="gm-plan-kpi-row mt-3">
            <PlannerFact
              label="Acreage"
              value={`${area} ac`}
              note={plot?.name}
            />
            <PlannerFact
              label="Estimated cost"
              value={kes(budget)}
              note={`${kes(perAcreCost)}/acre`}
            />
            <PlannerFact
              label="Average revenue"
              value={kes(revenue)}
              note="Before field loss"
            />
            <PlannerFact
              label="Projected net"
              value={kes(revenue - budget)}
              note={`${Math.round(((revenue - budget) / Math.max(1, budget)) * 100)}% ROI`}
            />
          </div>
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Crop / variety</td>
                  <td>
                    <strong>
                      {crop.name} ·{" "}
                      {crop.id === "cabbage"
                        ? variety?.variety
                        : "Certified variety to confirm"}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Plot / acreage</td>
                  <td>
                    <strong>
                      {plot?.name} · {area} acre
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Planting / season</td>
                  <td>
                    <strong>{plantingDate} · Short rains 2026</strong>
                  </td>
                </tr>
                <tr>
                  <td>Cost assumption</td>
                  <td className="font-display">
                    <strong>{kes(budget)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {step === 5 ? (
        <div className="gm-card p-3 mt-3">
          <span className="gm-eyebrow">Ready to save locally</span>
          <h3 className="font-display mt-2">
            {crop.name} · {area} acre · {plot?.name}
          </h3>
          <p>
            This creates a usable saved plan in this planner. It will not
            navigate to the unfinished crop-management page.
          </p>
          <button
            type="button"
            className={`gm-checkcard ${confirmed ? "on" : ""}`}
            onClick={() => setConfirmed((value) => !value)}
          >
            <input type="checkbox" checked={confirmed} readOnly tabIndex={-1} />
            <span>
              <strong>
                I have reviewed the plot, date, acreage and {kes(budget)} cost
                estimate
              </strong>
              <small>I can edit this plan before planting.</small>
            </span>
          </button>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={5}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => {
          if (step < 5) setStep((value) => value + 1);
          else
            onDone({
              id: `plan-${Date.now()}`,
              crop: crop.name,
              variety:
                crop.id === "cabbage"
                  ? (variety?.variety ?? "Gloria F1")
                  : "Certified variety to confirm",
              plot: plot?.name ?? "Farm plot",
              acreage: area,
              plantingDate: new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(`${plantingDate}T12:00:00`)),
              season: "Short rains 2026",
              budget,
              projectedRevenue: revenue,
              status: "Ready",
              created: "18 Sep 2026",
            });
        }}
        finishLabel="Confirm & save plan"
        nextDisabled={
          !plot ||
          !plantingDate ||
          !area ||
          area > (plot?.available ?? 0) ||
          (step === 5 && !confirmed)
        }
      />
    </div>
  );
}

function SaveCostScenario({
  plans,
  onSave,
}: {
  plans: SavedCropPlan[];
  onSave: () => void;
}) {
  const [name, setName] = useState("Cabbage · standard Kiambu inputs");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [note, setNote] = useState(
    "Baseline KES 101,700 per acre; 17,000 marketable heads.",
  );
  return (
    <div className="gm-form-grid">
      <Field label="Scenario name" full>
        <input
          className="gm-input"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field label="Attach to plan">
        <select
          className="gm-select"
          value={planId}
          onChange={(event) => setPlanId(event.target.value)}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.crop} · {plan.plot}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Baseline">
        <input className="gm-input" value={kes(BASE_COST_TOTAL)} readOnly />
      </Field>
      <Field label="Planning note" full>
        <textarea
          className="gm-textarea"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={!name.trim() || !planId || !note.trim()}
            onClick={onSave}
          >
            <Check /> Save cost scenario
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}

function RevenueStressTest({ onUse }: { onUse: () => void }) {
  const [price, setPrice] = useState("24");
  const [heads, setHeads] = useState("17000");
  const [loss, setLoss] = useState("12");
  const [extra, setExtra] = useState("15000");
  const sellable = Math.round(Number(heads) * (1 - Number(loss) / 100));
  const cost = BASE_COST_TOTAL + Number(extra);
  const gross = sellable * Number(price);
  const net = gross - cost;
  const roi = Math.round((net / Math.max(1, cost)) * 100);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Farm-gate price / head">
          <input
            className="gm-input"
            inputMode="numeric"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Harvested heads">
          <input
            className="gm-input"
            inputMode="numeric"
            value={heads}
            onChange={(event) =>
              setHeads(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Field + grading loss %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={loss}
            onChange={(event) =>
              setLoss(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
        </Field>
        <Field label="Unforeseen cost">
          <input
            className="gm-input"
            inputMode="numeric"
            value={extra}
            onChange={(event) =>
              setExtra(event.target.value.replace(/\D/g, "").slice(0, 7))
            }
          />
        </Field>
      </div>
      <div className="gm-plan-kpi-row mt-3">
        <PlannerFact
          label="Sellable heads"
          value={sellable.toLocaleString()}
          note={`${loss}% loss applied`}
        />
        <PlannerFact
          label="Adjusted cost"
          value={kes(cost)}
          note="Baseline + unforeseen"
        />
        <PlannerFact label="Net profit" value={kes(net)} note={`${roi}% ROI`} />
        <PlannerFact
          label="Break-even"
          value={kes(cost / Math.max(1, sellable))}
          note="Per sellable head"
        />
      </div>
      <div className="gm-plan-rec mt-3">
        <StatusChip
          label={
            net > 0 ? "Scenario remains profitable" : "Scenario loses money"
          }
          tone={net > 0 ? "low" : "high"}
        />
        <p className="mb-0 mt-2">
          At {kes(Number(price))}/head and {loss}% losses, the plan has a{" "}
          {kes(net)} net return after {kes(cost)} total cost.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!Number(price) || !Number(heads)}
          onClick={onUse}
        >
          <Check /> Use these assumptions
        </button>
      </ModalFooter>
    </div>
  );
}

function EditPlanWizard({
  plan,
  onSave,
}: {
  plan: SavedCropPlan;
  onSave: (plan: SavedCropPlan) => void;
}) {
  const [step, setStep] = useState(0);
  const [plot, setPlot] = useState(plan.plot);
  const [acreage, setAcreage] = useState(String(plan.acreage));
  const [date, setDate] = useState("2026-10-20");
  const [status, setStatus] = useState<SavedCropPlan["status"]>(plan.status);
  const areaRatio = Number(acreage) / Math.max(0.1, plan.acreage);
  const nextBudget = Math.round(plan.budget * areaRatio);
  const nextRevenue = Math.round(plan.projectedRevenue * areaRatio);
  return (
    <div>
      <Stepper
        steps={["Field", "Timing", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Plot">
            <select
              className="gm-select"
              value={plot}
              onChange={(event) => setPlot(event.target.value)}
            >
              {FARM_PLOTS.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
              <option>{plan.plot}</option>
            </select>
          </Field>
          <Field label="Acreage">
            <input
              className="gm-input"
              inputMode="decimal"
              value={acreage}
              onChange={(event) =>
                setAcreage(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
                )
              }
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Planting date">
            <input
              className="gm-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
          <Field label="Plan status">
            <select
              className="gm-select"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as SavedCropPlan["status"])
              }
            >
              <option>Draft</option>
              <option>Ready</option>
              <option>Review</option>
              <option>Planted</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Crop</td>
                <td>
                  <strong>
                    {plan.crop} · {plan.variety}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Plot / acreage</td>
                <td>
                  <strong>
                    {plot} · {acreage} acre
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Planting</td>
                <td>
                  <strong>{date}</strong>
                </td>
              </tr>
              <tr>
                <td>Recalculated budget</td>
                <td className="font-display">
                  <strong>{kes(nextBudget)}</strong>
                </td>
              </tr>
              <tr>
                <td>Recalculated revenue</td>
                <td className="font-display">
                  <strong>{kes(nextRevenue)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          step < 2
            ? setStep((value) => value + 1)
            : onSave({
                ...plan,
                plot,
                acreage: Number(acreage),
                plantingDate: new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(`${date}T12:00:00`)),
                budget: nextBudget,
                projectedRevenue: nextRevenue,
                status,
              })
        }
        finishLabel="Save changes"
        nextDisabled={!plot.trim() || !Number(acreage) || !date}
      />
    </div>
  );
}

function DuplicatePlan({
  plan,
  onCopy,
}: {
  plan: SavedCropPlan;
  onCopy: (plan: SavedCropPlan) => void;
}) {
  const [plot, setPlot] = useState("Shamba ya nyuma");
  const [date, setDate] = useState("2026-11-03");
  return (
    <div className="gm-form-grid">
      <Field label="New plot">
        <input
          className="gm-input"
          value={plot}
          onChange={(event) => setPlot(event.target.value)}
        />
      </Field>
      <Field label="New planting date">
        <input
          className="gm-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <div className="full gm-card p-3">
        <p className="mb-0">
          <strong>
            {plan.crop} · {plan.variety}
          </strong>
          <br />
          <small>
            Cost, acreage and revenue assumptions will be copied into a Draft
            plan.
          </small>
        </p>
      </div>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={!plot.trim() || !date}
            onClick={() =>
              onCopy({
                ...plan,
                id: `plan-${Date.now()}`,
                plot,
                plantingDate: new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).format(new Date(`${date}T12:00:00`)),
                status: "Draft",
                created: "18 Sep 2026",
              })
            }
          >
            <Copy /> Create editable copy
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}

function DeletePlanConfirm({
  plan,
  onCancel,
  onDelete,
}: {
  plan: SavedCropPlan;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <div className="gm-check-row">
        <AlertTriangle />
        <span>
          <strong>
            {plan.crop} · {plan.variety}
          </strong>
          <small>
            {plan.plot} · {plan.plantingDate} · {kes(plan.budget)}
          </small>
        </span>
      </div>
      <button
        type="button"
        className={`gm-checkcard mt-3 ${confirmed ? "on" : ""}`}
        onClick={() => setConfirmed((value) => !value)}
      >
        <input type="checkbox" checked={confirmed} readOnly tabIndex={-1} />
        <span>
          <strong>I understand this local plan will be removed</strong>
          <small>This cannot be undone in the current planning session.</small>
        </span>
      </button>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Keep plan
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-dark"
          disabled={!confirmed}
          onClick={onDelete}
        >
          <Trash2 /> Remove plan
        </button>
      </ModalFooter>
    </div>
  );
}

function SupplierCentre({ onOrder }: { onOrder: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [verified, setVerified] = useState(false);
  const [page, setPage] = useState(1);
  const rows = SEED_SUPPLIERS.filter(
    (supplier) =>
      `${supplier.name} ${supplier.location} ${supplier.variety}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!verified || supplier.verified),
  );
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Search supplier, location or variety">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search seed suppliers"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </Field>
        <Toggle
          checked={verified}
          onChange={(value) => {
            setVerified(value);
            setPage(1);
          }}
          label="Verified suppliers only"
          desc="GrowMO business and stock checks completed"
        />
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Variety / pack</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Delivery</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <strong>{supplier.name}</strong>
                  <br />
                  <small>{supplier.location}</small>
                </td>
                <td>
                  {supplier.phone}
                  <br />
                  {supplier.verified ? (
                    <StatusChip label="Verified" tone="low" />
                  ) : (
                    <StatusChip label="Check pending" tone="medium" />
                  )}
                </td>
                <td>
                  {supplier.variety}
                  <br />
                  <small>{supplier.pack}</small>
                </td>
                <td className="font-display">{kes(supplier.price)}</td>
                <td>{supplier.stock} packs</td>
                <td>{supplier.delivery}</td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-mpesa gm-btn-sm"
                    disabled={supplier.stock < 1}
                    onClick={() => onOrder(supplier.id)}
                  >
                    <ShoppingBag /> Reserve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={Math.min(page, pages)}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
    </div>
  );
}

function SeedOrderWizard({
  supplier,
  onClose,
  onPaid,
}: {
  supplier: SeedSupplier;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [step, setStep] = useState(0);
  const [packs, setPacks] = useState("4");
  const [delivery, setDelivery] = useState("Pickup at agrovet");
  const [phone, setPhone] = useState("0712 345 678");
  const [otp, setOtp] = useState("");
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const subtotal = supplier.price * Number(packs);
  const deliveryFee = delivery === "Pickup at agrovet" ? 0 : 450;
  const total = subtotal + deliveryFee;
  const pay = () => {
    setBusy(true);
    setStep(4);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      onPaid();
    }, 1200);
  };
  if (done)
    return (
      <div className="gm-plan-payment-receipt text-center">
        <CheckCircle2 width={52} height={52} />
        <span className="gm-eyebrow d-block mt-2">
          M-Pesa receipt · RJT8K2P6MA
        </span>
        <h3 className="font-display mt-2">Seed reservation confirmed</h3>
        <p>
          {kes(total)} paid to {supplier.name} for {packs} × {supplier.pack} of{" "}
          {supplier.variety}. Collection reference: GM-SEED-260918.
        </p>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Phone</td>
                <td>
                  <strong>{phone}</strong>
                </td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td>
                  <strong>{delivery}</strong>
                </td>
              </tr>
              <tr>
                <td>Amount</td>
                <td className="font-display">
                  <strong>{kes(total)}</strong>
                </td>
              </tr>
              <tr>
                <td>M-Pesa receipt</td>
                <td>
                  <strong>RJT8K2P6MA</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime mt-3"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    );
  return (
    <div>
      <Stepper
        steps={["Order", "Delivery", "Confirm", "M-Pesa PIN", "Receipt"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Certified seed">
            <input
              className="gm-input"
              value={`${supplier.variety} · ${supplier.pack}`}
              readOnly
            />
          </Field>
          <Field label={`Packs · ${supplier.stock} available`}>
            <input
              className="gm-input"
              inputMode="numeric"
              value={packs}
              onChange={(event) =>
                setPacks(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <div className="full gm-plan-total">
            <div>
              <small>Order total before delivery</small>
              <strong>{kes(subtotal)}</strong>
            </div>
            <span>{supplier.name}</span>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Fulfilment">
            <select
              className="gm-select"
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
            >
              <option>Pickup at agrovet</option>
              <option>Boda delivery · KES 450</option>
            </select>
          </Field>
          <Field label="M-Pesa phone">
            <input
              className="gm-input"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 12))
              }
            />
          </Field>
          <div className="full gm-card p-3">
            <MapPin /> <strong className="ms-2">{supplier.location}</strong>
            <p className="mb-0 mt-1">
              {supplier.delivery} · supplier contact {supplier.phone}
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-3">
          <div className="gm-plan-rec">
            <strong>Simulated phone confirmation</strong>
            <p className="mb-0 mt-1">
              Enter verification code <strong>482193</strong> sent to {phone}.
              This local demo does not contact a real mobile number.
            </p>
          </div>
          <div className="mt-3">
            <OtpInput
              value={otp}
              onChange={setOtp}
              label="6-digit order confirmation code"
            />
          </div>
          <button
            type="button"
            className={`gm-checkcard mt-3 ${approved ? "on" : ""}`}
            onClick={() => setApproved((value) => !value)}
          >
            <input type="checkbox" checked={approved} readOnly tabIndex={-1} />
            <span>
              <strong>I approve {kes(total)} for certified seed</strong>
              <small>
                {packs} packs · {delivery}
              </small>
            </span>
          </button>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="text-center mt-3">
          <h3 className="font-display">Enter GrowMO wallet PIN</h3>
          <p>
            {kes(total)} will be sent to {supplier.name} via simulated M-Pesa.
          </p>
          <PinPad
            resetKey={resetKey}
            onComplete={(pin) => {
              if (new Set(pin).size === 1) {
                setResetKey((value) => value + 1);
                return;
              }
              pay();
            }}
            actionLabel="Use any non-repeating 4 digits in this simulation"
          />
        </div>
      ) : null}
      {step === 4 && busy ? (
        <div className="text-center p-4">
          <span className="gm-spinner" />
          <h3 className="font-display mt-3">Confirming M-Pesa payment…</h3>
          <p>
            Waiting for the simulated Safaricom response and supplier
            reservation.
          </p>
        </div>
      ) : null}
      {step < 3 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => setStep((value) => value + 1)}
          finishLabel="Continue to PIN"
          nextDisabled={
            !Number(packs) ||
            Number(packs) > supplier.stock ||
            phone.replace(/\D/g, "").length !== 10 ||
            (step === 2 && (otp !== "482193" || !approved))
          }
        />
      ) : null}
    </div>
  );
}

function MarketOutlookCentre({ onUse }: { onUse: (market: string) => void }) {
  const [query, setQuery] = useState("");
  const [demand, setDemand] = useState("All");
  const [page, setPage] = useState(1);
  const rows = MARKET_OUTLOOK.filter(
    (market) =>
      `${market.market} ${market.county} ${market.buyerType}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (demand === "All" || market.demand === demand),
  );
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Search market, county or buyer">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search cabbage markets"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </Field>
        <Field label="Demand">
          <select
            className="gm-select"
            value={demand}
            onChange={(event) => {
              setDemand(event.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Market</th>
              <th>Current / head</th>
              <th>Forecast</th>
              <th>Demand</th>
              <th>Transport</th>
              <th>Net at 17,000 heads</th>
              <th>Buyer</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((market) => {
              const net =
                market.current * 17000 - market.transport - BASE_COST_TOTAL;
              return (
                <tr key={market.id}>
                  <td>
                    <strong>{market.market}</strong>
                    <br />
                    <small>{market.county}</small>
                  </td>
                  <td className="font-display">{kes(market.current)}</td>
                  <td className="font-display">{kes(market.forecast)}</td>
                  <td>
                    <StatusChip
                      label={market.demand}
                      tone={
                        market.demand === "High"
                          ? "low"
                          : market.demand === "Medium"
                            ? "medium"
                            : "high"
                      }
                    />
                  </td>
                  <td className="font-display">{kes(market.transport)}</td>
                  <td className="font-display">{kes(net)}</td>
                  <td>{market.buyerType}</td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => onUse(market.market)}
                    >
                      Use
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={Math.min(page, pages)}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
    </div>
  );
}

function LabourPlanner({ onSave }: { onSave: () => void }) {
  const [rateScale, setRateScale] = useState("100");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const pages = Math.ceil(LABOUR_PLAN.length / perPage);
  const rows = LABOUR_PLAN.slice((page - 1) * perPage, page * perPage);
  const scale = Number(rateScale) / 100;
  const total = Math.round(
    LABOUR_PLAN.reduce((sum, row) => sum + row.total, 0) * scale,
  );
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Local wage adjustment %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={rateScale}
            onChange={(event) =>
              setRateScale(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Adjusted labour total">
          <input
            className="gm-input font-display"
            value={kes(total)}
            readOnly
          />
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Timing</th>
              <th>Workers</th>
              <th>Days</th>
              <th>Rate</th>
              <th>Adjusted total</th>
              <th>Skill</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.activity}</strong>
                </td>
                <td>{row.week}</td>
                <td>{row.workers}</td>
                <td>{row.days}</td>
                <td className="font-display">
                  {kes(Math.round(row.rate * scale))}
                </td>
                <td className="font-display">
                  {kes(Math.round(row.total * scale))}
                </td>
                <td>{row.skill}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={LABOUR_PLAN.length}
      />
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!Number(rateScale)}
          onClick={onSave}
        >
          <Users /> Save labour schedule
        </button>
      </ModalFooter>
    </div>
  );
}

function IrrigationPlanner({ onSave }: { onSave: () => void }) {
  const [plants, setPlants] = useState("17000");
  const [system, setSystem] = useState("Drip");
  const efficiency =
    system === "Drip" ? 0.9 : system === "Sprinkler" ? 0.75 : 0.6;
  const scale = Number(plants) / 17000 / efficiency;
  const total = Math.round(
    IRRIGATION_PLAN.reduce((sum, row) => sum + row.weeklyLitres, 0) * scale,
  );
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Target plant population">
          <input
            className="gm-input"
            inputMode="numeric"
            value={plants}
            onChange={(event) =>
              setPlants(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Irrigation system">
          <select
            className="gm-select"
            value={system}
            onChange={(event) => setSystem(event.target.value)}
          >
            <option>Drip</option>
            <option>Sprinkler</option>
            <option>Hose / furrow</option>
          </select>
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Growth stage</th>
              <th>Weeks</th>
              <th>Litres / plant</th>
              <th>Frequency</th>
              <th>Adjusted weekly litres</th>
              <th>Field note</th>
            </tr>
          </thead>
          <tbody>
            {IRRIGATION_PLAN.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.stage}</strong>
                </td>
                <td>{row.weeks}</td>
                <td>{row.litresPerPlant}</td>
                <td>{row.frequency}</td>
                <td className="font-display">
                  {Math.round(row.weeklyLitres * scale).toLocaleString()} L
                </td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gm-plan-total mt-3">
        <div>
          <small>Eight-stage reference demand</small>
          <strong>{total.toLocaleString()} L</strong>
        </div>
        <div>
          <small>System efficiency</small>
          <strong>{Math.round(efficiency * 100)}%</strong>
        </div>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!Number(plants)}
          onClick={onSave}
        >
          <Droplets /> Save irrigation plan
        </button>
      </div>
    </div>
  );
}

function RotationChecker({ onSave }: { onSave: () => void }) {
  const [step, setStep] = useState(0);
  const [previous, setPrevious] = useState("Beans");
  const [disease, setDisease] = useState("No major soil-borne disease");
  const [residue, setResidue] = useState("Incorporated");
  const risky =
    ["Cabbage", "Kale", "Broccoli"].includes(previous) ||
    disease.includes("Clubroot");
  return (
    <div>
      <Stepper
        steps={["Previous crop", "Field history", "Decision"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Previous crop">
            <select
              className="gm-select"
              value={previous}
              onChange={(event) => setPrevious(event.target.value)}
            >
              <option>Beans</option>
              <option>Maize</option>
              <option>Potato</option>
              <option>Cabbage</option>
              <option>Kale</option>
              <option>Broccoli</option>
              <option>Fallow</option>
            </select>
          </Field>
          <Field label="Residue management">
            <select
              className="gm-select"
              value={residue}
              onChange={(event) => setResidue(event.target.value)}
            >
              <option>Incorporated</option>
              <option>Removed</option>
              <option>Composted</option>
              <option>Burned</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Disease history">
            <select
              className="gm-select"
              value={disease}
              onChange={(event) => setDisease(event.target.value)}
            >
              <option>No major soil-borne disease</option>
              <option>Clubroot suspected</option>
              <option>Bacterial wilt</option>
              <option>Fusarium pressure</option>
              <option>Unknown field history</option>
            </select>
          </Field>
          <div className="full gm-card p-3">
            <p className="mb-0">
              Last crop: <strong>{previous}</strong> · residue:{" "}
              <strong>{residue}</strong>. Cabbage is a Brassica and should not
              follow cabbage, kale or broccoli on a short rotation.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-plan-rec mt-3">
          <StatusChip
            label={risky ? "High rotation risk" : "Good rotation fit"}
            tone={risky ? "high" : "low"}
          />
          <h3 className="font-display mt-2">
            {risky
              ? "Choose another plot or delay Brassica planting"
              : `${previous} → cabbage is acceptable`}
          </h3>
          <p className="mb-0">
            {risky
              ? "Use a non-Brassica break crop for at least two seasons and confirm soil pH plus clubroot history."
              : "Retain crop residues only if disease-free, add mature manure and record the rotation in the saved plan."}
          </p>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave())}
        finishLabel="Save rotation decision"
      />
    </div>
  );
}

function SoilFitWizard({
  crop,
  onUsePlot,
}: {
  crop: CropCatalogItem;
  onUsePlot: (plot: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [plotId, setPlotId] = useState(FARM_PLOTS[0]?.id ?? "");
  const [drainage, setDrainage] = useState("Good");
  const [organic, setOrganic] = useState("2.8");
  const plot = FARM_PLOTS.find((item) => item.id === plotId) ?? FARM_PLOTS[0];
  const pHScore = plot ? Math.max(0, 100 - Math.abs(6.3 - plot.ph) * 80) : 0;
  const score = Math.round(
    Math.min(
      98,
      pHScore * 0.55 +
        (drainage === "Good" ? 30 : drainage === "Moderate" ? 18 : 5) +
        Math.min(15, Number(organic) * 4),
    ),
  );
  return (
    <div>
      <Stepper
        steps={["Plot", "Soil detail", "Fit result"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-plan-summary-grid mt-3">
          {FARM_PLOTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gm-checkcard ${plotId === item.id ? "on" : ""}`}
              onClick={() => setPlotId(item.id)}
            >
              <input
                type="radio"
                checked={plotId === item.id}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.soil} · pH {item.ph}
                </small>
                <small>
                  {item.zone} · {item.water}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Observed drainage">
            <select
              className="gm-select"
              value={drainage}
              onChange={(event) => setDrainage(event.target.value)}
            >
              <option>Good</option>
              <option>Moderate</option>
              <option>Poor</option>
            </select>
          </Field>
          <Field label="Organic matter %">
            <input
              className="gm-input"
              inputMode="decimal"
              value={organic}
              onChange={(event) =>
                setOrganic(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
                )
              }
            />
          </Field>
          <div className="full gm-card p-3">
            <strong>{crop.name} target</strong>
            <p className="mb-0 mt-1">
              Well-drained fertile soil, approximately pH 5.5–6.8. Confirm with
              a recent laboratory test before major amendments.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="d-flex flex-wrap gap-4 align-items-center mt-3">
          <ScoreRing score={score} size={136} />
          <div style={{ flex: "1 1 280px" }}>
            <StatusChip
              label={
                score >= 80
                  ? "Strong fit"
                  : score >= 60
                    ? "Conditional fit"
                    : "Weak fit"
              }
              tone={score >= 80 ? "low" : score >= 60 ? "medium" : "high"}
            />
            <h3 className="font-display mt-2">
              {plot?.name} · pH {plot?.ph}
            </h3>
            <p>
              {score >= 80
                ? "The plot fits the crop's soil range. Maintain drainage and apply mature manure from the cost plan."
                : "Correct drainage and confirm a laboratory amendment plan before committing seed."}
            </p>
            <ProgressLine value={score} label={`${crop.name} soil fit score`} />
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          step < 2
            ? setStep((value) => value + 1)
            : onUsePlot(plot?.name ?? "Selected plot")
        }
        finishLabel="Use this plot"
        nextDisabled={!plot || !Number(organic)}
      />
    </div>
  );
}

function RiskAssessment({ onSave }: { onSave: () => void }) {
  const [checks, setChecks] = useState({
    water: true,
    buyer: true,
    cash: false,
    seed: true,
    drainage: false,
    labour: true,
  });
  const labels: Record<keyof typeof checks, [string, string]> = {
    water: [
      "Reliable water confirmed",
      "Backup water available through head formation",
    ],
    buyer: ["Buyer route identified", "At least two realistic cabbage outlets"],
    cash: [
      "Full working capital available",
      "KES 101,700/acre plus contingency",
    ],
    seed: [
      "Certified seed source checked",
      "Variety, pack and stock confirmed",
    ],
    drainage: [
      "Heavy-rain drainage ready",
      "Outlets clear before wet November",
    ],
    labour: [
      "Critical labour covered",
      "Transplanting and harvest crews identified",
    ],
  };
  const ready = Object.values(checks).filter(Boolean).length;
  const score = Math.round((ready / 6) * 100);
  return (
    <div>
      <div className="d-flex flex-wrap gap-4 align-items-center">
        <ScoreRing score={score} size={124} />
        <div>
          <StatusChip
            label={
              score >= 80
                ? "Ready with controls"
                : score >= 60
                  ? "Conditional readiness"
                  : "High planning risk"
            }
            tone={score >= 80 ? "low" : score >= 60 ? "medium" : "high"}
          />
          <h3 className="font-display mt-2">
            {ready} of 6 readiness controls confirmed
          </h3>
        </div>
      </div>
      <div className="gm-form-grid mt-3">
        {(Object.keys(checks) as (keyof typeof checks)[]).map((key) => (
          <Toggle
            key={key}
            checked={checks[key]}
            onChange={(value) =>
              setChecks((current) => ({ ...current, [key]: value }))
            }
            label={labels[key][0]}
            desc={labels[key][1]}
          />
        ))}
      </div>
      <div className="gm-plan-rec mt-3">
        <strong>
          {score < 80
            ? "Resolve cash and drainage before planting."
            : "Proceed to a final seven-day weather and price review."}
        </strong>
        <p className="mb-0 mt-1">
          This risk score is saved as a planning control, not as a guarantee of
          outcome.
        </p>
      </div>
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSave}>
          <ShieldCheck /> Save {score}% risk review
        </button>
      </ModalFooter>
    </div>
  );
}

function SharePlan({
  plan,
  onDone,
}: {
  plan: SavedCropPlan;
  onDone: () => void;
}) {
  const [recipient, setRecipient] = useState("Agronomist Grace Wanjiku");
  const [phone, setPhone] = useState("0721 660 318");
  const [scope, setScope] = useState("Full plan summary");
  const share = async () => {
    const summary = `GrowMO plan: ${plan.crop} · ${plan.variety}; ${plan.plot}; ${plan.acreage} acre; plant ${plan.plantingDate}; budget ${kes(plan.budget)}; projected revenue ${kes(plan.projectedRevenue)}.`;
    if (navigator.clipboard) await navigator.clipboard.writeText(summary);
    onDone();
  };
  return (
    <div className="gm-form-grid">
      <Field label="Recipient" full>
        <input
          className="gm-input"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
        />
      </Field>
      <Field label="Kenyan phone">
        <input
          className="gm-input"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value.replace(/[^\d ]/g, "").slice(0, 12))
          }
        />
      </Field>
      <Field label="Share scope">
        <select
          className="gm-select"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        >
          <option>Full plan summary</option>
          <option>Field instructions only</option>
          <option>Budget and return only</option>
        </select>
      </Field>
      <div className="full gm-card p-3">
        <span className="gm-eyebrow">Prepared summary</span>
        <p className="mb-0 mt-2">
          <strong>
            {plan.crop} · {plan.variety}
          </strong>
          <br />
          {plan.plot} · {plan.acreage} acre · {plan.plantingDate}
          <br />
          {kes(plan.budget)} budget · {kes(plan.projectedRevenue)} projected
          revenue
        </p>
      </div>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={
              !recipient.trim() || phone.replace(/\D/g, "").length !== 10
            }
            onClick={share}
          >
            <Share2 /> Copy share summary
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}

function ExportPlanner({
  plans,
  selectedPlan,
  onDone,
}: {
  plans: SavedCropPlan[];
  selectedPlan?: SavedCropPlan;
  onDone: () => void;
}) {
  const [scope, setScope] = useState(
    selectedPlan ? "Selected plan" : "All saved plans",
  );
  const [costs, setCosts] = useState(true);
  const [returns, setReturns] = useState(true);
  const exportReport = () => {
    const selected =
      scope === "Selected plan" && selectedPlan ? [selectedPlan] : plans;
    const lines = [
      "GrowMO Crop Planner Report",
      "Generated: 18 Sep 2026",
      `Scope: ${scope}`,
      "",
      ...selected
        .flatMap((plan) => [
          `${plan.crop} · ${plan.variety}`,
          `Plot: ${plan.plot} · ${plan.acreage} acre`,
          `Planting: ${plan.plantingDate} · ${plan.season}`,
          costs ? `Budget: ${kes(plan.budget)}` : "",
          returns
            ? `Projected revenue: ${kes(plan.projectedRevenue)} · Net: ${kes(plan.projectedRevenue - plan.budget)}`
            : "",
          `Status: ${plan.status}`,
          "",
        ])
        .filter(Boolean),
    ];
    downloadText(
      "growmo-crop-planner-report.txt",
      lines.join("\n"),
      "text/plain",
    );
    onDone();
  };
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Report scope">
          <select
            className="gm-select"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
          >
            <option>All saved plans</option>
            {selectedPlan ? <option>Selected plan</option> : null}
            <option>Full crop catalog</option>
          </select>
        </Field>
        <div className="gm-card p-3">
          <strong>
            {scope === "Selected plan" ? 1 : plans.length} plan records
          </strong>
          <small className="d-block">
            Plain-text report for local storage and printing
          </small>
        </div>
        <Toggle
          checked={costs}
          onChange={setCosts}
          label="Include costs"
          desc="Budget and acreage assumptions"
        />
        <Toggle
          checked={returns}
          onChange={setReturns}
          label="Include returns"
          desc="Revenue, net profit and projection warning"
        />
      </div>
      <div className="gm-plan-rec mt-3">
        <strong>Projection notice included</strong>
        <p className="mb-0 mt-1">
          All exports label revenue as a planning estimate, not a guaranteed
          return.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={exportReport}
        >
          <Download /> Download report
        </button>
      </ModalFooter>
    </div>
  );
}

function CropAdvisor({ onChoose }: { onChoose: (id: string) => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("Fast cash flow");
  const [budget, setBudget] = useState("80000");
  const [water, setWater] = useState("Moderate");
  const [experience, setExperience] = useState("Intermediate");
  const candidates = CROP_CATALOG.filter(
    (crop) =>
      crop.costMin <= Number(budget) &&
      (water === "High" || crop.water !== "High"),
  )
    .sort((a, b) => {
      if (goal === "Highest revenue") return b.revenueMax - a.revenueMax;
      if (goal === "Low risk") return a.popularity - b.popularity;
      return Number.parseInt(a.maturity, 10) - Number.parseInt(b.maturity, 10);
    })
    .slice(0, 3);
  return (
    <div>
      <Stepper
        steps={["Farm goal", "Resources", "Recommendations"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Primary goal">
            <select
              className="gm-select"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              <option>Fast cash flow</option>
              <option>Highest revenue</option>
              <option>Low risk</option>
              <option>Dairy feed security</option>
            </select>
          </Field>
          <Field label="Experience">
            <select
              className="gm-select"
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Available budget / acre">
            <input
              className="gm-input"
              inputMode="numeric"
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
          </Field>
          <Field label="Available water">
            <select
              className="gm-select"
              value={water}
              onChange={(event) => setWater(event.target.value)}
            >
              <option>Low</option>
              <option>Moderate</option>
              <option>High</option>
            </select>
          </Field>
          <div className="full gm-plan-rec">
            <strong>Farm context applied</strong>
            <p className="mb-0 mt-1">
              UM1 Githunguri, 1,800 m, red volcanic loam, short rains 2026 and
              Nairobi market access.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-plan-summary-grid mt-3">
          {candidates.map((crop, index) => (
            <article key={crop.id} className="gm-card p-3">
              <StatusChip
                label={`Rank ${index + 1}`}
                tone={index === 0 ? "low" : "neutral"}
              />
              <h3 className="font-display mt-2">
                {crop.symbol} {crop.name}
              </h3>
              <p>{crop.countyNote}</p>
              <div className="gm-check-row">
                <span>
                  <small>Cost / acre</small>
                  <strong className="font-display">
                    {kes(crop.costMin)}–{kes(crop.costMax).replace("KES ", "")}
                  </strong>
                </span>
              </div>
              <div className="gm-check-row">
                <span>
                  <small>Revenue / acre</small>
                  <strong className="font-display">
                    {kes(crop.revenueMin)}–
                    {kes(crop.revenueMax).replace("KES ", "")}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-block mt-2"
                onClick={() => onChoose(crop.id)}
              >
                Open {crop.name} profile
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {step < 2 ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => setStep((value) => value + 1)}
          finishLabel="Generate recommendations"
          nextDisabled={!Number(budget)}
        />
      ) : null}
    </div>
  );
}

function CustomScenario({ onSave }: { onSave: () => void }) {
  const [crop, setCrop] = useState("Cabbage");
  const [acreage, setAcreage] = useState("1");
  const [cost, setCost] = useState("101700");
  const [yieldUnits, setYieldUnits] = useState("17000");
  const [price, setPrice] = useState("30");
  const gross = Number(yieldUnits) * Number(price) * Number(acreage);
  const totalCost = Number(cost) * Number(acreage);
  const net = gross - totalCost;
  const roi = Math.round((net / Math.max(1, totalCost)) * 100);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Crop">
          <select
            className="gm-select"
            value={crop}
            onChange={(event) => setCrop(event.target.value)}
          >
            {CROP_CATALOG.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Acreage">
          <input
            className="gm-input"
            inputMode="decimal"
            value={acreage}
            onChange={(event) =>
              setAcreage(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
            }
          />
        </Field>
        <Field label="Cost / acre">
          <input
            className="gm-input"
            inputMode="numeric"
            value={cost}
            onChange={(event) =>
              setCost(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
          />
        </Field>
        <Field label="Yield units / acre">
          <input
            className="gm-input"
            inputMode="numeric"
            value={yieldUnits}
            onChange={(event) =>
              setYieldUnits(event.target.value.replace(/\D/g, "").slice(0, 7))
            }
          />
        </Field>
        <Field label="Price / unit">
          <input
            className="gm-input"
            inputMode="numeric"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
      </div>
      <div className="gm-plan-kpi-row mt-3">
        <PlannerFact
          label="Total cost"
          value={kes(totalCost)}
          note={`${acreage} acre`}
        />
        <PlannerFact
          label="Gross revenue"
          value={kes(gross)}
          note={`${Number(yieldUnits).toLocaleString()} units/acre`}
        />
        <PlannerFact label="Net profit" value={kes(net)} note={`${roi}% ROI`} />
        <PlannerFact
          label="Break-even unit"
          value={kes(
            totalCost / Math.max(1, Number(yieldUnits) * Number(acreage)),
          )}
          note="Before field losses"
        />
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={
            !crop ||
            !Number(acreage) ||
            !Number(cost) ||
            !Number(yieldUnits) ||
            !Number(price)
          }
          onClick={onSave}
        >
          <Check /> Save custom scenario
        </button>
      </ModalFooter>
    </div>
  );
}

function CalendarReminder({ onSave }: { onSave: () => void }) {
  const [windowId, setWindowId] = useState("short-rains");
  const [date, setDate] = useState("2026-09-22");
  const [channel, setChannel] = useState("In-app reminder");
  const [note, setNote] = useState(
    "Start Gloria F1 nursery for 20 October transplanting.",
  );
  return (
    <div className="gm-form-grid">
      <Field label="Planting window" full>
        <select
          className="gm-select"
          value={windowId}
          onChange={(event) => setWindowId(event.target.value)}
        >
          {PLANTING_WINDOWS.map((window) => (
            <option key={window.id} value={window.id}>
              {window.season} · {window.planting}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reminder date">
        <input
          className="gm-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <Field label="Channel">
        <select
          className="gm-select"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        >
          <option>In-app reminder</option>
          <option>Local calendar note</option>
          <option>Printable task card</option>
        </select>
      </Field>
      <Field label="Reminder note" full>
        <textarea
          className="gm-textarea"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={!date || !note.trim()}
            onClick={onSave}
          >
            <BellRing /> Save reminder
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}
