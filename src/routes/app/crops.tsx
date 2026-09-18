import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BellRing,
  Bot,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CloudRain,
  Coins,
  Download,
  Droplets,
  Eye,
  Filter,
  FlaskConical,
  Gauge,
  Image,
  Leaf,
  ListFilter,
  Lock,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  SkipForward,
  Sprout,
  Store,
  Trash2,
  TrendingUp,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import {
  CropGrowthTimeline,
  CropHeaderCard,
  CropPerformanceStrip,
  CropWidgetCard,
} from "../../components/app/CropWidgets";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "../../components/app/DashboardWidgets";
import {
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
  ACTIVE_CROPS,
  type ActiveCropRecord,
  ALL_CROP_TASKS,
  BENCHMARK_ROWS,
  CABBAGE_FERTILIZER_SCHEDULE,
  CABBAGE_FORECAST,
  CABBAGE_STAGES,
  COST_LEDGER,
  CROP_ACTIVITY,
  type CropActivityRow,
  type CropTask,
  type CropWidgetDefinition,
  CURRENT_STAGE_FACTS,
  DISEASE_RISKS,
  FERTILIZER_AI_RECOMMENDATION,
  FERTILIZER_HISTORY,
  GRAIN_STAGES,
  GRAIN_WIDGETS,
  GROWTH_PHOTOS,
  type GrowthPhoto,
  type GrowthStage,
  INDUSTRIAL_STAGES,
  INDUSTRIAL_WIDGETS,
  INPUT_SUPPLIERS,
  type InputSupplierRow,
  PEST_RISKS,
  SCOUTING_LOG,
  type TaskPriority,
  type TaskStatus,
  VEGETABLE_WIDGETS,
  WEATHER_OVERLAY,
  YIELD_FACTORS,
} from "../../data/app/crops";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/crops")({
  component: CropManagementPage,
});

type CropView = "overview" | "tasks" | "widgets" | "evidence";
type DrawerId = "crop-list" | "stage" | "task" | "activity" | null;
type ModalId =
  | "edit-crop"
  | "archive-crop"
  | "delete-crop"
  | "complete-task"
  | "skip-task"
  | "edit-task"
  | "reschedule-task"
  | "add-task"
  | "customize"
  | "widget-library"
  | "nursery"
  | "transplant"
  | "fertilizer"
  | "fertilizer-apply"
  | "pest"
  | "scouting"
  | "diagnose"
  | "input-shop"
  | "input-order"
  | "weed"
  | "irrigation"
  | "spray"
  | "harvest"
  | "postharvest"
  | "sensor"
  | "photo-add"
  | "photo-detail"
  | "costs"
  | "weather"
  | "yield"
  | "benchmark"
  | "report"
  | "generic-widget"
  | null;

type WidgetPreset = "vegetable" | "grain" | "industrial";

const WIDGET_ICONS: Record<string, typeof Sprout> = {
  nursery: Sprout,
  transplant: Leaf,
  fertilizer: FlaskConical,
  pest: ShieldCheck,
  weed: Leaf,
  irrigation: Droplets,
  staking: Sprout,
  pruning: Leaf,
  spraying: ShieldCheck,
  harvest: PackageCheck,
  postharvest: Store,
  moisture: Droplets,
  photos: Camera,
  costs: Coins,
  weather: CloudRain,
  yield: TrendingUp,
  benchmark: BarChart3,
  "land-prep": Wheat,
  "planting-log": Sprout,
  germination: Leaf,
  armyworm: ShieldCheck,
  tasseling: Wheat,
  "grain-fill": Wheat,
  storage: Store,
  ridges: Wheat,
  setts: Sprout,
  tillering: Leaf,
  ratoon: RefreshCw,
  trashing: Leaf,
  factory: Store,
  payment: Wallet,
};

const ACTIVITY_ICONS: Record<CropActivityRow["type"], typeof Activity> = {
  task: ClipboardCheck,
  input: PackageCheck,
  photo: Camera,
  weather: CloudRain,
  health: Activity,
};

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  const id = useId();
  return (
    <div className={`gm-field ${full ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div id={id}>{children}</div>
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

function downloadText(filename: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function forecastForCrop(crop: ActiveCropRecord): typeof CABBAGE_FORECAST {
  if (crop.id === "crop-cabbage") return CABBAGE_FORECAST;
  const outlooks = [
    `${crop.crop}: monitor field drainage`,
    `${crop.currentStage}: moisture favourable`,
    `${crop.nextStage.split("·")[0].trim()}: drier work window`,
  ];
  return CABBAGE_FORECAST.map((month, index) => ({
    ...month,
    id: `${crop.id}-${month.id}`,
    outlook: outlooks[index] ?? "Monitor crop conditions",
    tone: index === 0 ? "medium" : "low",
  }));
}

function widgetsForCrop(crop: ActiveCropRecord): CropWidgetDefinition[] {
  if (
    crop.enterprise === "grain" ||
    crop.enterprise === "legume" ||
    crop.enterprise === "fodder"
  ) {
    return GRAIN_WIDGETS;
  }
  if (crop.enterprise === "industrial" || crop.enterprise === "fruit") {
    return INDUSTRIAL_WIDGETS;
  }
  return VEGETABLE_WIDGETS;
}

function presetForCrop(crop: ActiveCropRecord): WidgetPreset {
  if (
    crop.enterprise === "grain" ||
    crop.enterprise === "legume" ||
    crop.enterprise === "fodder"
  ) {
    return "grain";
  }
  if (crop.enterprise === "industrial" || crop.enterprise === "fruit") {
    return "industrial";
  }
  return "vegetable";
}

function stagesForCrop(crop: ActiveCropRecord): GrowthStage[] {
  if (
    crop.enterprise === "grain" ||
    crop.enterprise === "legume" ||
    crop.enterprise === "fodder"
  ) {
    return GRAIN_STAGES;
  }
  if (crop.enterprise === "industrial" || crop.enterprise === "fruit") {
    return INDUSTRIAL_STAGES;
  }
  return CABBAGE_STAGES;
}

function taskTone(status: TaskStatus) {
  return status === "Completed"
    ? "low"
    : status === "Upcoming"
      ? "high"
      : status === "Skipped"
        ? "neutral"
        : "medium";
}

function priorityTone(priority: TaskPriority) {
  return priority === "High"
    ? "high"
    : priority === "Medium"
      ? "medium"
      : "low";
}

function CropManagementPage() {
  const toast = useToast();
  const [view, setView] = useState<CropView>("overview");
  const [activeCropId, setActiveCropId] = useState("crop-cabbage");
  const [tasks, setTasks] = useState<CropTask[]>(ALL_CROP_TASKS);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState("stage-vegetative");
  const [selectedTaskId, setSelectedTaskId] = useState("task-008");
  const [selectedWidgetId, setSelectedWidgetId] = useState("fertilizer");
  const [selectedPhotoId, setSelectedPhotoId] = useState("photo-03");
  const [selectedSupplierId, setSelectedSupplierId] = useState("input-01");
  const [archivedCropIds, setArchivedCropIds] = useState<string[]>([]);
  const [deletedCropIds, setDeletedCropIds] = useState<string[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<
    Record<WidgetPreset, string[]>
  >({
    vegetable: VEGETABLE_WIDGETS.filter((widget) => widget.defaultOn).map(
      (widget) => widget.id,
    ),
    grain: GRAIN_WIDGETS.filter((widget) => widget.defaultOn).map(
      (widget) => widget.id,
    ),
    industrial: INDUSTRIAL_WIDGETS.filter((widget) => widget.defaultOn).map(
      (widget) => widget.id,
    ),
  });

  useEffect(() => {
    if (modal || drawer)
      window.dispatchEvent(new Event("close-appshell-drawers"));
  }, [modal, drawer]);

  const activeCrops = ACTIVE_CROPS.filter(
    (crop) =>
      !archivedCropIds.includes(crop.id) && !deletedCropIds.includes(crop.id),
  );
  const crop =
    activeCrops.find((item) => item.id === activeCropId) ??
    activeCrops[0] ??
    ACTIVE_CROPS[0];
  const stages = crop ? stagesForCrop(crop) : CABBAGE_STAGES;
  const selectedStage =
    stages.find((stage) => stage.id === selectedStageId) ??
    stages.find((stage) => stage.state === "current") ??
    stages[0];
  const cropTasks = tasks.filter((task) => task.cropId === crop?.id);
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? cropTasks[0];
  const widgetDefinitions = crop ? widgetsForCrop(crop) : VEGETABLE_WIDGETS;
  const preset = crop ? presetForCrop(crop) : "vegetable";
  const enabledWidgetIds = widgetOrder[preset];
  const selectedWidget =
    widgetDefinitions.find((widget) => widget.id === selectedWidgetId) ??
    widgetDefinitions[0];
  const selectedPhoto =
    GROWTH_PHOTOS.find((photo) => photo.id === selectedPhotoId) ??
    GROWTH_PHOTOS[0];
  const selectedSupplier =
    INPUT_SUPPLIERS.find((supplier) => supplier.id === selectedSupplierId) ??
    INPUT_SUPPLIERS[0];

  const openStage = (stage: GrowthStage) => {
    setSelectedStageId(stage.id);
    setDrawer("stage");
  };

  const openTask = (id: string) => {
    setSelectedTaskId(id);
    setDrawer("task");
  };

  const switchCrop = (id: string) => {
    const next = ACTIVE_CROPS.find((item) => item.id === id);
    if (!next) return;
    setActiveCropId(id);
    const nextStages = stagesForCrop(next);
    setSelectedStageId(
      nextStages.find((stage) => stage.state === "current")?.id ??
        nextStages[0]?.id ??
        "",
    );
    const nextTask = tasks.find(
      (task) => task.cropId === id && task.status !== "Completed",
    );
    setSelectedTaskId(
      nextTask?.id ?? tasks.find((task) => task.cropId === id)?.id ?? "",
    );
    setDrawer(null);
    setView("overview");
  };

  const toggleWidget = (id: string) => {
    setWidgetOrder((current) => ({
      ...current,
      [preset]: current[preset].includes(id)
        ? current[preset].filter((item) => item !== id)
        : [...current[preset], id],
    }));
  };

  const openWidget = (widget: CropWidgetDefinition) => {
    setSelectedWidgetId(widget.id);
    const target: Partial<Record<string, ModalId>> = {
      nursery: "nursery",
      transplant: "transplant",
      fertilizer: "fertilizer",
      pest: "pest",
      armyworm: "pest",
      weed: "weed",
      irrigation: "irrigation",
      spraying: "spray",
      harvest: "harvest",
      postharvest: "postharvest",
      moisture: "sensor",
      photos: "photo-detail",
      costs: "costs",
      weather: "weather",
      yield: "yield",
      benchmark: "benchmark",
    };
    setModal(target[widget.id] ?? "generic-widget");
  };

  const archiveCrop = () => {
    if (!crop) return;
    setArchivedCropIds((ids) => [...ids, crop.id]);
    const next = activeCrops.find((item) => item.id !== crop.id);
    if (next) setActiveCropId(next.id);
    setModal(null);
    toast.notify(`${crop.crop} moved to the archive`, "success");
  };

  const deleteCrop = () => {
    if (!crop) return;
    setDeletedCropIds((ids) => [...ids, crop.id]);
    setTasks((rows) => rows.filter((task) => task.cropId !== crop.id));
    const next = activeCrops.find((item) => item.id !== crop.id);
    if (next) setActiveCropId(next.id);
    setModal(null);
    toast.notify(`${crop.crop} crop record deleted`, "success");
  };

  const markTaskComplete = (id: string, actualCost: number, note: string) => {
    setTasks((rows) =>
      rows.map((task) =>
        task.id === id
          ? {
              ...task,
              status: "Completed",
              cost: actualCost,
              notes: note,
              doneBy: "Mary",
            }
          : task,
      ),
    );
    setDrawer(null);
    setModal(null);
    toast.notify("Task completed and crop record updated", "success");
  };

  const skipTask = (id: string, reason: string) => {
    setTasks((rows) =>
      rows.map((task) =>
        task.id === id
          ? { ...task, status: "Skipped", notes: reason, doneBy: "Mary" }
          : task,
      ),
    );
    setDrawer(null);
    setModal(null);
    toast.notify("Task skipped with a recorded reason", "success");
  };

  const exportCrop = () => {
    if (!crop) return;
    const lines = [
      "GrowMO Crop Health Report",
      `Crop: ${crop.crop} — ${crop.variety}`,
      `Plot: ${crop.plot} · ${crop.acres} acre`,
      `Planted: ${crop.plantingDate}`,
      `Expected harvest: ${crop.harvestDate}`,
      `Health: ${crop.healthScore}/100 · ${crop.healthLabel}`,
      `Current stage: ${crop.currentStage}`,
      `Predicted yield: ${crop.predictedYield}`,
      `Predicted revenue: ${kes(crop.predictedRevenue)}`,
      "",
      "Tasks",
      ...cropTasks.map(
        (task) =>
          `${task.date} | ${task.task} | ${task.status} | ${kes(task.cost)}`,
      ),
    ];
    downloadText(
      `growmo-${crop.crop.toLowerCase().replaceAll(" ", "-")}-health-report.txt`,
      lines.join("\n"),
    );
    setModal(null);
    toast.notify("Crop health report downloaded", "success");
  };

  if (!crop) return null;

  return (
    <div>
      <Reveal>
        <CropHeaderCard
          crop={crop}
          forecast={forecastForCrop(crop)}
          actions={
            <>
              <button
                type="button"
                className="gm-btn gm-btn-ghost"
                onClick={() => setDrawer("crop-list")}
              >
                <Wheat /> Switch crop ({activeCrops.length})
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={() => setModal("add-task")}
              >
                <Plus /> Add crop task
              </button>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn on-dark"
                  aria-label="Crop actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((open) => !open)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Crop actions</p>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("edit-crop");
                      }}
                    >
                      <Pencil /> Edit crop details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setDrawer("activity");
                      }}
                    >
                      <Activity /> Crop activity log
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("report");
                      }}
                    >
                      <Download /> Export health report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("archive-crop");
                      }}
                    >
                      <Lock /> Archive crop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("delete-crop");
                      }}
                    >
                      <Trash2 /> Delete crop
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          }
        />
      </Reveal>

      {menu ? (
        <button
          type="button"
          className="gm-drop-close"
          aria-label="Close crop actions"
          onClick={() => setMenu(false)}
        />
      ) : null}

      <PlannerSubtabs
        value={view}
        label="Crop management workspace"
        onChange={setView}
        items={[
          {
            id: "overview",
            label: "Crop overview",
            icon: <Gauge />,
            count: stages.length,
          },
          {
            id: "tasks",
            label: "Task checklist",
            icon: <ClipboardList />,
            count: cropTasks.length,
          },
          {
            id: "widgets",
            label: "Modular widgets",
            icon: <Settings2 />,
            count: enabledWidgetIds.length,
          },
          {
            id: "evidence",
            label: "Evidence & records",
            icon: <Camera />,
            count: GROWTH_PHOTOS.length,
          },
        ]}
      />

      {view === "overview" ? (
        <OverviewView
          crop={crop}
          stages={stages}
          tasks={cropTasks}
          onStage={openStage}
          onTask={openTask}
          onViewTasks={() => setView("tasks")}
          onModal={setModal}
          onWidget={openWidget}
          onPhoto={(id) => {
            setSelectedPhotoId(id);
            setModal("photo-detail");
          }}
        />
      ) : null}

      {view === "tasks" ? (
        <TaskChecklist
          crop={crop}
          tasks={cropTasks}
          onOpen={openTask}
          onAdd={() => setModal("add-task")}
        />
      ) : null}

      {view === "widgets" ? (
        <WidgetBoard
          crop={crop}
          widgets={widgetDefinitions}
          enabledIds={enabledWidgetIds}
          onOpen={openWidget}
          onConfigure={(widget) => {
            setSelectedWidgetId(widget.id);
            setModal("customize");
          }}
          onCustomize={() => setModal("customize")}
          onLibrary={() => setModal("widget-library")}
        />
      ) : null}

      {view === "evidence" ? (
        <EvidenceView
          crop={crop}
          onPhoto={(id) => {
            setSelectedPhotoId(id);
            setModal("photo-detail");
          }}
          onAddPhoto={() => setModal("photo-add")}
          onActivity={() => setDrawer("activity")}
          onWeather={() => setModal("weather")}
          onYield={() => setModal("yield")}
        />
      ) : null}

      <DashboardDrawer
        open={drawer === "crop-list"}
        title={`Active crops · ${activeCrops.length}`}
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-block"
            onClick={() => {
              setDrawer(null);
              setModal("add-task");
            }}
          >
            <Plus /> Add task to current crop
          </button>
        }
      >
        <CropSwitcher
          crops={activeCrops}
          selectedId={crop.id}
          onSelect={switchCrop}
        />
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "stage"}
        title={selectedStage?.name ?? "Growth stage"}
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-block"
            onClick={() => {
              setDrawer(null);
              setModal("add-task");
            }}
          >
            <Plus /> Add stage task
          </button>
        }
      >
        {selectedStage ? <StageDetail stage={selectedStage} /> : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "task"}
        title={selectedTask?.task ?? "Crop task"}
        onClose={() => setDrawer(null)}
        footer={
          selectedTask ? (
            <div className="d-flex flex-wrap gap-2">
              {selectedTask.status !== "Completed" &&
              selectedTask.status !== "Skipped" ? (
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => setModal("complete-task")}
                >
                  <Check /> Mark complete
                </button>
              ) : null}
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={() => setModal("edit-task")}
              >
                <Pencil /> Edit
              </button>
            </div>
          ) : undefined
        }
      >
        {selectedTask ? (
          <TaskDetail
            task={selectedTask}
            onComplete={() => setModal("complete-task")}
            onSkip={() => setModal("skip-task")}
            onEdit={() => setModal("edit-task")}
            onReschedule={() => setModal("reschedule-task")}
          />
        ) : null}
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "activity"}
        title="Cabbage activity log"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-block"
            onClick={() => {
              setDrawer(null);
              setModal("report");
            }}
          >
            <Download /> Export with crop report
          </button>
        }
      >
        {CROP_ACTIVITY.map((entry) => {
          const Icon = ACTIVITY_ICONS[entry.type];
          return (
            <div key={entry.id} className="gm-check-row">
              <span className="gm-mega-icon">
                <Icon />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{entry.event}</strong>
                <small>
                  {entry.detail} · {entry.by} · {entry.at}
                </small>
              </span>
            </div>
          );
        })}
      </DashboardDrawer>

      {/* 1 — crop edit wizard */}
      <Dialog
        open={modal === "edit-crop"}
        onClose={() => setModal(null)}
        title="Edit crop details"
        desc={`${crop.crop} · ${crop.plot}`}
        wide
      >
        <EditCropWizard
          crop={crop}
          onSave={() => {
            setModal(null);
            toast.notify("Crop details updated", "success");
          }}
        />
      </Dialog>

      {/* 2 — archive confirmation */}
      <Dialog
        open={modal === "archive-crop"}
        onClose={() => setModal(null)}
        title="Archive this crop?"
        desc="Archive preserves every task, cost and photo while removing the crop from active work."
      >
        <ArchiveCropConfirm
          crop={crop}
          onCancel={() => setModal(null)}
          onArchive={archiveCrop}
        />
      </Dialog>

      {/* 3 — delete confirmation */}
      <Dialog
        open={modal === "delete-crop"}
        onClose={() => setModal(null)}
        title="Delete crop record?"
        desc="This permanently removes the local crop record and its tasks from this session."
      >
        <DeleteCropConfirm
          crop={crop}
          onCancel={() => setModal(null)}
          onDelete={deleteCrop}
        />
      </Dialog>

      {/* 4 — task completion */}
      <Dialog
        open={modal === "complete-task"}
        onClose={() => setModal(null)}
        title="Complete crop task"
        desc={selectedTask?.task}
        wide
      >
        {selectedTask ? (
          <CompleteTaskWizard
            task={selectedTask}
            onDone={(cost, note) =>
              markTaskComplete(selectedTask.id, cost, note)
            }
          />
        ) : null}
      </Dialog>

      {/* 5 — task skip */}
      <Dialog
        open={modal === "skip-task"}
        onClose={() => setModal(null)}
        title="Skip this task?"
        desc="A reason is required so the crop record remains agronomically useful."
      >
        {selectedTask ? (
          <SkipTaskWizard
            task={selectedTask}
            onCancel={() => setModal(null)}
            onSkip={(reason) => skipTask(selectedTask.id, reason)}
          />
        ) : null}
      </Dialog>

      {/* 6 — task edit */}
      <Dialog
        open={modal === "edit-task"}
        onClose={() => setModal(null)}
        title="Edit crop task"
        desc={selectedTask?.task}
        wide
      >
        {selectedTask ? (
          <EditTaskWizard
            task={selectedTask}
            onSave={(updated) => {
              setTasks((rows) =>
                rows.map((task) => (task.id === updated.id ? updated : task)),
              );
              setModal(null);
              toast.notify("Task instructions updated", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 7 — task reschedule */}
      <Dialog
        open={modal === "reschedule-task"}
        onClose={() => setModal(null)}
        title="Reschedule crop task"
        desc={selectedTask?.task}
      >
        {selectedTask ? (
          <RescheduleTask
            task={selectedTask}
            onSave={(date, note) => {
              setTasks((rows) =>
                rows.map((task) =>
                  task.id === selectedTask.id
                    ? { ...task, date, notes: note }
                    : task,
                ),
              );
              setModal(null);
              setDrawer(null);
              toast.notify("Task rescheduled", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 8 — add task */}
      <Dialog
        open={modal === "add-task"}
        onClose={() => setModal(null)}
        title={`Add ${crop.crop.toLowerCase()} task`}
        desc="Create instructions, resources, timing and assignment."
        wide
      >
        <AddTaskWizard
          crop={crop}
          stages={stages}
          onSave={(task) => {
            setTasks((rows) => [task, ...rows]);
            setSelectedTaskId(task.id);
            setModal(null);
            setView("tasks");
            toast.notify("Crop task added", "success");
          }}
        />
      </Dialog>

      {/* 9 — customize active widgets */}
      <Dialog
        open={modal === "customize"}
        onClose={() => setModal(null)}
        title="Customize crop view"
        desc="Add, remove and reorder enterprise-specific widgets without losing records."
        wide
      >
        <CustomizeWidgets
          initialPreset={preset}
          orders={widgetOrder}
          onSave={(orders) => {
            setWidgetOrder(orders);
            setModal(null);
            toast.notify("Crop widget layout updated", "success");
          }}
        />
      </Dialog>

      {/* 10 — widget library */}
      <Dialog
        open={modal === "widget-library"}
        onClose={() => setModal(null)}
        title="Crop widget library"
        desc="Vegetable, grain and long-season modules in one searchable catalog."
        wide
      >
        <WidgetLibrary
          enabledIds={enabledWidgetIds}
          currentPreset={preset}
          onToggle={(id) => {
            toggleWidget(id);
            toast.notify(
              enabledWidgetIds.includes(id)
                ? "Widget removed from view"
                : "Widget added to view",
              "success",
            );
          }}
        />
      </Dialog>

      {/* 11 — nursery tracker */}
      <Dialog
        open={modal === "nursery"}
        onClose={() => setModal(null)}
        title="Nursery tracker"
        desc="Gloria F1 sowing, germination and seedling health."
        wide
      >
        <NurseryTracker
          onSave={() => {
            setModal(null);
            toast.notify("Nursery observation saved", "success");
          }}
        />
      </Dialog>

      {/* 12 — transplanting log */}
      <Dialog
        open={modal === "transplant"}
        onClose={() => setModal(null)}
        title="Transplanting log"
        desc="Field date, survival, spacing and gap-filling record."
        wide
      >
        <TransplantingLog
          onSave={() => {
            setModal(null);
            toast.notify("Transplanting record updated", "success");
          }}
        />
      </Dialog>

      {/* 13 — fertilizer schedule */}
      <Dialog
        open={modal === "fertilizer"}
        onClose={() => setModal(null)}
        title="Fertilizer schedule"
        desc="Four planned cabbage applications and ten cross-crop history records."
        wide
      >
        <FertilizerCentre onApply={() => setModal("fertilizer-apply")} />
      </Dialog>

      {/* 14 — fertilizer application */}
      <Dialog
        open={modal === "fertilizer-apply"}
        onClose={() => setModal("fertilizer")}
        title="Record fertilizer application"
        desc="Verify rate, field conditions, operator and actual cost."
        wide
      >
        <FertilizerApplicationWizard
          onDone={() => {
            setModal(null);
            toast.notify("Fertilizer application recorded", "success");
          }}
        />
      </Dialog>

      {/* 15 — pest and disease centre */}
      <Dialog
        open={modal === "pest"}
        onClose={() => setModal(null)}
        title="Pest & disease monitor"
        desc="Current cabbage risks, treatment guidance and ten scouting records."
        wide
      >
        <PestDiseaseCentre
          onScout={() => setModal("scouting")}
          onDiagnose={() => setModal("diagnose")}
          onInputs={() => setModal("input-shop")}
        />
      </Dialog>

      {/* 16 — scouting wizard */}
      <Dialog
        open={modal === "scouting"}
        onClose={() => setModal("pest")}
        title="Add scouting record"
        desc="Walk the plot, sample plants, score severity and record the field decision."
        wide
      >
        <ScoutingWizard
          onDone={() => {
            setModal(null);
            toast.notify("Scouting record saved", "success");
          }}
        />
      </Dialog>

      {/* 17 — symptom diagnosis */}
      <Dialog
        open={modal === "diagnose"}
        onClose={() => setModal("pest")}
        title="Guided symptom check"
        desc="A local decision aid for cabbage symptoms; severe cases require an agronomist."
        wide
      >
        <DiagnosisWizard
          onAction={(action) => {
            setModal(null);
            toast.notify(`${action} added to crop actions`, "success");
          }}
        />
      </Dialog>

      {/* 18 — treatment input catalog */}
      <Dialog
        open={modal === "input-shop"}
        onClose={() => setModal(null)}
        title="Verified crop inputs"
        desc="Ten Kenyan suppliers with real pack, stock, price and phone records."
        wide
      >
        <InputShop
          onOrder={(id) => {
            setSelectedSupplierId(id);
            setModal("input-order");
          }}
        />
      </Dialog>

      {/* 19 — M-Pesa purchase flow */}
      <Dialog
        open={modal === "input-order"}
        onClose={() => setModal(null)}
        title="Buy crop input"
        desc={
          selectedSupplier
            ? `${selectedSupplier.item} · ${selectedSupplier.supplier}`
            : undefined
        }
        wide
        dismissable
      >
        {selectedSupplier ? (
          <InputOrderWizard
            supplier={selectedSupplier}
            onClose={() => setModal(null)}
            onPaid={() =>
              toast.notify("Input order paid and receipt saved", "success")
            }
          />
        ) : null}
      </Dialog>

      {/* 20 — weed management */}
      <Dialog
        open={modal === "weed"}
        onClose={() => setModal(null)}
        title="Weed management log"
        desc="Plan manual or chemical weed control without damaging cabbage roots."
        wide
      >
        <WeedManagement
          onSave={() => {
            setModal(null);
            toast.notify("Weed-management round saved", "success");
          }}
        />
      </Dialog>

      {/* 21 — irrigation log */}
      <Dialog
        open={modal === "irrigation"}
        onClose={() => setModal(null)}
        title="Irrigation log"
        desc="Record rainfall, backup irrigation, source and soil condition."
        wide
      >
        <IrrigationLog
          onSave={() => {
            setModal(null);
            toast.notify("Water record saved", "success");
          }}
        />
      </Dialog>

      {/* 22 — spray record */}
      <Dialog
        open={modal === "spray"}
        onClose={() => setModal(null)}
        title="Spraying record"
        desc="Product, rate, weather, operator, PPE, PHI and batch traceability."
        wide
      >
        <SprayRecordWizard
          onInputs={() => setModal("input-shop")}
          onDone={() => {
            setModal(null);
            toast.notify("Spray record and PHI saved", "success");
          }}
        />
      </Dialog>

      {/* 23 — harvest tracker */}
      <Dialog
        open={modal === "harvest"}
        onClose={() => setModal(null)}
        title="Harvest tracker"
        desc="Forecast quantity, quality mix, crew, crates and buyer readiness."
        wide
      >
        <HarvestTracker
          onSave={() => {
            setModal(null);
            toast.notify("Harvest forecast updated", "success");
          }}
        />
      </Dialog>

      {/* 24 — post-harvest plan */}
      <Dialog
        open={modal === "postharvest"}
        onClose={() => setModal(null)}
        title="Post-harvest handling plan"
        desc="Grade, pack, shade, dispatch and reconcile every marketable head."
        wide
      >
        <PostHarvestPlan
          onSave={() => {
            setModal(null);
            toast.notify("Post-harvest plan saved", "success");
          }}
        />
      </Dialog>

      {/* 25 — soil sensor setup */}
      <Dialog
        open={modal === "sensor"}
        onClose={() => setModal(null)}
        title="Soil moisture setup"
        desc="Connect a sensor or enable a complete manual observation routine."
        wide
      >
        <SensorSetup
          onSave={() => {
            setModal(null);
            toast.notify("Soil moisture tracking enabled", "success");
          }}
        />
      </Dialog>

      {/* 26 — add growth photo */}
      <Dialog
        open={modal === "photo-add"}
        onClose={() => setModal(null)}
        title="Add growth photo record"
        desc="Capture stage, sample area, observation and field reference."
        wide
      >
        <GrowthPhotoWizard
          onDone={() => {
            setModal(null);
            toast.notify("Growth photo record added", "success");
          }}
        />
      </Dialog>

      {/* 27 — growth photo detail */}
      <Dialog
        open={modal === "photo-detail"}
        onClose={() => setModal(null)}
        title={selectedPhoto?.stage ?? "Growth photo"}
        desc={selectedPhoto?.reference}
        wide
      >
        {selectedPhoto ? (
          <GrowthPhotoDetail
            photo={selectedPhoto}
            onAdd={() => setModal("photo-add")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 28 — cost tracker */}
      <Dialog
        open={modal === "costs"}
        onClose={() => setModal(null)}
        title="Per-crop cost tracker"
        desc="Ten cost records against the 0.5-acre cabbage budget."
        wide
      >
        <CostTracker onAdd={() => setModal("input-shop")} />
      </Dialog>

      {/* 29 — weather overlay */}
      <Dialog
        open={modal === "weather"}
        onClose={() => setModal(null)}
        title="Crop weather overlay"
        desc="Ten observed and forecast water-balance periods."
        wide
      >
        <WeatherCentre
          onReminder={() => {
            setModal(null);
            toast.notify("Crop weather alert saved", "success");
          }}
        />
      </Dialog>

      {/* 30 — yield predictor */}
      <Dialog
        open={modal === "yield"}
        onClose={() => setModal(null)}
        title="AI yield prediction"
        desc="Current factors, downside scenarios and editable assumptions."
        wide
      >
        <YieldPredictor
          onSave={() => {
            setModal(null);
            toast.notify("Yield assumptions updated", "success");
          }}
        />
      </Dialog>

      {/* 31 — benchmark comparison */}
      <Dialog
        open={modal === "benchmark"}
        onClose={() => setModal(null)}
        title="Kiambu cabbage benchmark"
        desc="Ten indicators against county median and top-quartile farms."
        wide
      >
        <BenchmarkCentre />
      </Dialog>

      {/* 32 — report export */}
      <Dialog
        open={modal === "report"}
        onClose={() => setModal(null)}
        title="Export crop health report"
        desc="Choose evidence sections, then download a local crop record."
        wide
      >
        <ReportExport crop={crop} onExport={exportCrop} />
      </Dialog>

      {/* 33 — enterprise-specific generic widget */}
      <Dialog
        open={modal === "generic-widget"}
        onClose={() => setModal(null)}
        title={selectedWidget?.label ?? "Crop widget"}
        desc={selectedWidget?.description}
        wide
      >
        {selectedWidget ? (
          <GenericWidgetWorkflow
            widget={selectedWidget}
            crop={crop}
            onSave={() => {
              setModal(null);
              toast.notify(`${selectedWidget.label} record saved`, "success");
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

function OverviewView({
  crop,
  stages,
  tasks,
  onStage,
  onTask,
  onViewTasks,
  onModal,
  onWidget,
  onPhoto,
}: {
  crop: ActiveCropRecord;
  stages: GrowthStage[];
  tasks: CropTask[];
  onStage: (stage: GrowthStage) => void;
  onTask: (id: string) => void;
  onViewTasks: () => void;
  onModal: (modal: ModalId) => void;
  onWidget: (widget: CropWidgetDefinition) => void;
  onPhoto: (id: string) => void;
}) {
  const currentStage =
    stages.find((stage) => stage.state === "current") ?? stages[0];
  const nextTasks = tasks
    .filter((task) => task.status === "Upcoming" || task.status === "Planned")
    .slice(0, 5);
  return (
    <div>
      <Reveal>
        <DashboardSectionHeader
          eyebrow="4.2 · Every stage is tappable"
          title="Growth timeline"
          subtitle="From nursery or field establishment through harvest — open a node for activities, inputs, weather and common problems."
        />
        <section className="gm-card p-3">
          <CropGrowthTimeline stages={stages} onOpen={onStage} />
        </section>
      </Reveal>

      <div className="gm-split mt-4">
        <Reveal variant="left">
          <section className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow="4.3 · Current stage"
              title={crop.currentStage}
            />
            <div className="d-flex flex-wrap align-items-center gap-3">
              <ScoreRing
                score={Math.round((crop.stageDay / crop.stageDuration) * 100)}
                size={106}
              />
              <div style={{ flex: "1 1 210px" }}>
                <strong className="font-display d-block">
                  Day {crop.stageDay} of {crop.stageDuration}
                </strong>
                <small>
                  {crop.stageStarted} → {crop.stageEnds}
                </small>
                <ProgressLine
                  value={Math.round((crop.stageDay / crop.stageDuration) * 100)}
                  label="Current crop stage progress"
                />
                <span className="gm-chip mt-2">Next: {crop.nextStage}</span>
              </div>
            </div>
            <div className="gm-table-wrap mt-3">
              <table className="gm-table">
                <tbody>
                  {CURRENT_STAGE_FACTS.map((fact) => (
                    <tr key={fact.id}>
                      <td>{fact.label}</td>
                      <td>
                        <strong>
                          {crop.id === "crop-cabbage"
                            ? fact.value
                            : fact.id === "stage-name"
                              ? crop.currentStage
                              : fact.id === "stage-start"
                                ? crop.stageStarted
                                : fact.id === "stage-end"
                                  ? crop.stageEnds
                                  : fact.id === "stage-duration"
                                    ? `${crop.stageDuration} days`
                                    : fact.id === "stage-day"
                                      ? `${crop.stageDay} of ${crop.stageDuration}`
                                      : crop.nextStage}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="font-display mt-3">Key activities</h3>
            <div className="d-flex flex-wrap gap-2">
              {currentStage?.activities.map((activity) => (
                <span key={activity} className="gm-chip">
                  <Check /> {activity}
                </span>
              ))}
            </div>
            <div className="gm-plan-rec mt-3">
              <small>Conditions needed</small>
              <strong className="d-block mt-1">{currentStage?.weather}</strong>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-block mt-3"
              onClick={() => onStage(currentStage)}
            >
              <Eye /> Open current-stage guidance
            </button>
          </section>
        </Reveal>
        <Reveal variant="right">
          <section className="gm-card p-3 h-100">
            <DashboardSectionHeader
              eyebrow={`4.4 · ${tasks.length} dynamic tasks · ${nextTasks.length} next actions`}
              title="Upcoming crop work"
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm"
                  onClick={onViewTasks}
                >
                  All tasks
                </button>
              }
            />
            {nextTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                className="gm-check-row"
                onClick={() => onTask(task.id)}
              >
                <StatusChip
                  label={task.priority}
                  tone={priorityTone(task.priority)}
                />
                <span style={{ flex: 1 }}>
                  <strong>{task.task}</strong>
                  <small>
                    {task.date} · {task.labour} · {kes(task.cost)}
                  </small>
                </span>
                <ArrowRight />
              </button>
            ))}
            {nextTasks.length === 0 ? (
              <div className="gm-empty">
                <CheckCircle2 />
                <strong>No pending tasks</strong>
                <small>
                  Add the next stage action to keep the crop schedule complete.
                </small>
              </div>
            ) : null}
          </section>
        </Reveal>
      </div>

      <Reveal>
        <DashboardSectionHeader
          eyebrow="Live crop indicators"
          title="Crop performance"
        />
        <CropPerformanceStrip crop={crop} />
      </Reveal>

      {crop.id === "crop-cabbage" ? (
        <>
          <Reveal>
            <DashboardSectionHeader
              eyebrow="4.6 · Expanded widget"
              title="Fertilizer schedule"
              subtitle="Four cabbage applications with rate, method, purpose, actual date and actual cost."
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onModal("fertilizer")}
                >
                  <FlaskConical /> Open fertilizer centre
                </button>
              }
            />
            <section className="gm-card p-3">
              <div className="gm-table-wrap">
                <table className="gm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Stage</th>
                      <th>Fertilizer</th>
                      <th>Rate</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CABBAGE_FERTILIZER_SCHEDULE.map((row) => (
                      <tr key={row.id}>
                        <td>{row.number}</td>
                        <td>{row.date}</td>
                        <td>{row.stage}</td>
                        <td>
                          <strong>{row.fertilizer}</strong>
                        </td>
                        <td>{row.rate}</td>
                        <td>{row.method}</td>
                        <td>
                          <StatusChip
                            label={row.status}
                            tone={
                              row.status === "Applied"
                                ? "low"
                                : row.status === "Due"
                                  ? "high"
                                  : "medium"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gm-plan-rec mt-3">
                <span className="gm-eyebrow">
                  <Bot /> AI soil recommendation
                </span>
                <p className="mb-0 mt-2">
                  <strong>{FERTILIZER_AI_RECOMMENDATION}</strong>
                </p>
              </div>
            </section>
          </Reveal>

          <div className="gm-split mt-4">
            <Reveal variant="left">
              <section className="gm-card p-3 h-100">
                <DashboardSectionHeader
                  eyebrow="4.7 · Crop protection"
                  title="Pest & disease monitor"
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onModal("pest")}
                    >
                      Full monitor
                    </button>
                  }
                />
                {[...DISEASE_RISKS.slice(0, 2), ...PEST_RISKS.slice(0, 2)].map(
                  (risk) => (
                    <div key={risk.id} className="gm-check-row">
                      <AlertTriangle />
                      <span style={{ flex: 1 }}>
                        <strong>
                          {"disease" in risk ? risk.disease : risk.pest}
                        </strong>
                        <small>
                          {"symptoms" in risk
                            ? risk.symptoms
                            : risk.identification}
                        </small>
                      </span>
                      <StatusChip label={risk.risk} tone={risk.tone} />
                    </div>
                  ),
                )}
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm mt-3"
                  onClick={() => onModal("scouting")}
                >
                  <Plus /> Add scouting record
                </button>
              </section>
            </Reveal>
            <Reveal variant="right">
              <section className="gm-card p-3 h-100">
                <DashboardSectionHeader
                  eyebrow="4.8 · Water balance"
                  title="Weather overlay"
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onModal("weather")}
                    >
                      All 10 periods
                    </button>
                  }
                />
                {WEATHER_OVERLAY.slice(0, 5).map((row) => (
                  <div key={row.id} className="gm-check-row">
                    <CloudRain />
                    <span style={{ flex: 1 }}>
                      <strong>{row.period}</strong>
                      <small>
                        Need {row.needed} mm ·{" "}
                        {row.received !== null
                          ? `received ${row.received} mm`
                          : `forecast ${row.forecast} mm`}
                      </small>
                    </span>
                    <StatusChip
                      label={
                        row.variance !== null
                          ? `${row.variance > 0 ? "+" : ""}${row.variance} mm`
                          : "Pending"
                      }
                      tone={row.tone}
                    />
                  </div>
                ))}
              </section>
            </Reveal>
          </div>

          <div className="gm-split mt-4">
            <Reveal variant="left">
              <section className="gm-card p-3 h-100">
                <DashboardSectionHeader
                  eyebrow="4.9 · Weekly evidence"
                  title="Growth photo timeline"
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onModal("photo-add")}
                    >
                      <Camera /> Add record
                    </button>
                  }
                />
                {GROWTH_PHOTOS.slice(0, 3).map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="gm-check-row"
                    onClick={() => onPhoto(photo.id)}
                  >
                    <span className="gm-mega-icon">
                      <Image />
                    </span>
                    <span style={{ flex: 1 }}>
                      <strong>
                        {photo.date} · {photo.stage}
                      </strong>
                      <small>{photo.note}</small>
                    </span>
                    <StatusChip
                      label={photo.status}
                      tone={photo.status === "Logged" ? "low" : "neutral"}
                    />
                  </button>
                ))}
                <p className="text-muted mt-2 mb-0">
                  <small>
                    3 logged records · 6 scheduled evidence dates through
                    harvest.
                  </small>
                </p>
              </section>
            </Reveal>
            <Reveal variant="right">
              <section className="gm-card p-3 h-100">
                <DashboardSectionHeader
                  eyebrow="4.10 · AI-updated weekly"
                  title="Yield prediction"
                  action={
                    <button
                      type="button"
                      className="gm-btn gm-btn-soft gm-btn-sm"
                      onClick={() => onModal("yield")}
                    >
                      Run scenarios
                    </button>
                  }
                />
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <ScoreRing score={72} size={112} />
                  <div style={{ flex: 1 }}>
                    <small>Predicted yield</small>
                    <strong
                      className="font-display d-block"
                      style={{ fontSize: "1.45rem" }}
                    >
                      14,500 heads
                    </strong>
                    <small>0.5 acre · Gloria F1</small>
                  </div>
                </div>
                <div className="gm-plan-total mt-3">
                  <div>
                    <small>At KES 30/head</small>
                    <strong>{kes(435000)}</strong>
                  </div>
                  <div>
                    <small>Confidence</small>
                    <strong>72%</strong>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {YIELD_FACTORS.slice(0, 4).map((factor) => (
                    <StatusChip
                      key={factor.id}
                      label={`${factor.factor} ${factor.impact === null ? "baseline" : `${factor.impact}%`}`}
                      tone={factor.tone}
                    />
                  ))}
                </div>
              </section>
            </Reveal>
          </div>
        </>
      ) : (
        <Reveal>
          <section className="gm-card p-3 mt-4">
            <DashboardSectionHeader
              eyebrow={`${crop.enterprise} enterprise · crop-specific modules`}
              title={`${crop.crop} workspace`}
              subtitle={`The cabbage modules are hidden here. ${crop.crop} uses its own establishment, protection, water, harvest and performance records.`}
              action={
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("customize")}
                >
                  <Settings2 /> Customize modules
                </button>
              }
            />
            <div className="gm-plan-summary-grid">
              {widgetsForCrop(crop)
                .filter((widget) => widget.defaultOn)
                .slice(0, 6)
                .map((widget) => (
                  <button
                    key={widget.id}
                    type="button"
                    className="gm-check-row"
                    onClick={() => onWidget(widget)}
                  >
                    <Sprout />
                    <span style={{ flex: 1 }}>
                      <strong>{widget.label}</strong>
                      <small>{widget.summary}</small>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}

function TaskChecklist({
  crop,
  tasks,
  onOpen,
  onAdd,
}: {
  crop: ActiveCropRecord;
  tasks: CropTask[];
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | TaskStatus>("All");
  const [priority, setPriority] = useState<"All" | TaskPriority>("All");
  const [page, setPage] = useState(1);
  const rows = useMemo(
    () =>
      tasks.filter(
        (task) =>
          `${task.task} ${task.input} ${task.labour} ${task.notes} ${task.stage}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (status === "All" || task.status === status) &&
          (priority === "All" || task.priority === priority),
      ),
    [priority, query, status, tasks],
  );
  const perPage = 7;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  const statusFilters: ("All" | TaskStatus)[] = [
    "All",
    "Completed",
    "Upcoming",
    "Planned",
    "Skipped",
  ];
  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow={`4.4 · ${tasks.length} auto-generated tasks`}
        title={`${crop.crop} task checklist`}
        subtitle="Search and filter completed, active and upcoming work. Every row opens complete, skip, edit and reschedule actions."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onAdd}>
            <Plus /> Add task
          </button>
        }
      />
      <section className="gm-card p-3">
        <div className="gm-form-grid">
          <Field label="Search task, input, stage or worker">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                aria-label="Search crop tasks"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Field>
          <Field label="Priority">
            <select
              className="gm-select"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as "All" | TaskPriority);
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
        <div className="d-flex flex-wrap gap-2 mb-3">
          {statusFilters.map((item) => (
            <button
              key={item}
              type="button"
              className={`gm-filter-chip ${status === item ? "is-active" : ""}`}
              onClick={() => {
                setStatus(item);
                setPage(1);
              }}
            >
              {item}
              <span className="gm-n">
                {item === "All"
                  ? tasks.length
                  : tasks.filter((task) => task.status === item).length}
              </span>
            </button>
          ))}
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task / stage</th>
                <th>Input</th>
                <th>Labour</th>
                <th>Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((task) => (
                <tr
                  key={task.id}
                  className={
                    task.status === "Completed" ? "opacity-75" : undefined
                  }
                >
                  <td>{task.date}</td>
                  <td>
                    <strong className="d-flex align-items-center gap-2">
                      {task.status === "Completed" ? <CheckCircle2 /> : null}
                      {task.task}
                    </strong>
                    <br />
                    <small>{task.stage}</small>
                  </td>
                  <td>{task.input}</td>
                  <td>{task.labour}</td>
                  <td className="font-display">{kes(task.cost)}</td>
                  <td>
                    <StatusChip
                      label={task.priority}
                      tone={priorityTone(task.priority)}
                    />
                  </td>
                  <td>
                    <StatusChip
                      label={task.status}
                      tone={taskTone(task.status)}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="gm-btn gm-btn-outline gm-btn-sm"
                      onClick={() => onOpen(task.id)}
                    >
                      <Eye /> Open
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8}>No tasks match this search and filter.</td>
                </tr>
              ) : null}
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
      </section>
    </Reveal>
  );
}

function WidgetBoard({
  crop,
  widgets,
  enabledIds,
  onOpen,
  onConfigure,
  onCustomize,
  onLibrary,
}: {
  crop: ActiveCropRecord;
  widgets: CropWidgetDefinition[];
  enabledIds: string[];
  onOpen: (widget: CropWidgetDefinition) => void;
  onConfigure: (widget: CropWidgetDefinition) => void;
  onCustomize: () => void;
  onLibrary: () => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [show, setShow] = useState<"All" | "On" | "Off">("All");
  const [page, setPage] = useState(1);
  const rows = widgets.filter(
    (widget) =>
      `${widget.label} ${widget.description} ${widget.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All" || widget.category === category) &&
      (show === "All" ||
        (show === "On"
          ? enabledIds.includes(widget.id)
          : !enabledIds.includes(widget.id))),
  );
  const perPage = 6;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow={`4.5 · ${enabledIds.length} widgets active`}
        title={`${crop.crop} modular view`}
        subtitle="The widget set changes by enterprise. Cabbage, maize and long-season defaults are all available in Customize View."
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline"
              onClick={onLibrary}
            >
              <ListFilter /> Widget library
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onCustomize}
            >
              <Settings2 /> Customize view
            </button>
          </div>
        }
      />
      <section className="gm-card p-3 mb-3">
        <div className="gm-plan-toolbar">
          <Field label="Search widgets">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                aria-label="Search crop widgets"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </Field>
          <Field label="Category">
            <select
              className="gm-select"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option>All</option>
              <option>Establishment</option>
              <option>Nutrition</option>
              <option>Protection</option>
              <option>Water</option>
              <option>Evidence</option>
              <option>Harvest</option>
              <option>Performance</option>
              <option>Specialist</option>
            </select>
          </Field>
          <Field label="Visibility">
            <select
              className="gm-select"
              value={show}
              onChange={(event) => {
                setShow(event.target.value as "All" | "On" | "Off");
                setPage(1);
              }}
            >
              <option>All</option>
              <option>On</option>
              <option>Off</option>
            </select>
          </Field>
        </div>
      </section>
      <div className="gm-plan-grid">
        {visible.map((widget) => (
          <CropWidgetCard
            key={widget.id}
            widget={widget}
            icon={WIDGET_ICONS[widget.id] ?? Gauge}
            enabled={enabledIds.includes(widget.id)}
            onOpen={() => onOpen(widget)}
            onConfigure={() => onConfigure(widget)}
          />
        ))}
        {visible.length === 0 ? (
          <section className="gm-card gm-plan-empty">
            <Filter />
            <h3 className="font-display">No widgets match</h3>
            <p>Clear the category, visibility or search filter.</p>
          </section>
        ) : null}
      </div>
      <Pagination
        page={Math.min(page, pages)}
        total={pages}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
    </Reveal>
  );
}

function EvidenceView({
  crop,
  onPhoto,
  onAddPhoto,
  onActivity,
  onWeather,
  onYield,
}: {
  crop: ActiveCropRecord;
  onPhoto: (id: string) => void;
  onAddPhoto: () => void;
  onActivity: () => void;
  onWeather: () => void;
  onYield: () => void;
}) {
  const [page, setPage] = useState(1);
  const perPage = 6;
  const pages = Math.ceil(GROWTH_PHOTOS.length / perPage);
  const photos = GROWTH_PHOTOS.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <Reveal>
        <DashboardSectionHeader
          eyebrow="4.9 · Nine dated records"
          title={`${crop.crop} growth evidence`}
          subtitle="Weekly photo records, crop activity, weather observations and yield factors in one auditable view."
          action={
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={onActivity}
              >
                <Activity /> Activity log
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={onAddPhoto}
              >
                <Camera /> Add photo record
              </button>
            </div>
          }
        />
        <div className="gm-plan-grid">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="gm-card p-3 text-start"
              onClick={() => onPhoto(photo.id)}
            >
              <div className="gm-product-art">
                <Camera width={42} height={42} />
                <span className="gm-chip">{photo.reference}</span>
              </div>
              <div className="d-flex justify-content-between gap-2 mt-3">
                <span className="gm-eyebrow">{photo.date}</span>
                <StatusChip
                  label={photo.status}
                  tone={photo.status === "Logged" ? "low" : "neutral"}
                />
              </div>
              <h3 className="font-display mt-2">{photo.stage}</h3>
              <p className="mb-0">{photo.note}</p>
            </button>
          ))}
        </div>
        <Pagination
          page={page}
          total={pages}
          onChange={setPage}
          perPage={perPage}
          totalItems={GROWTH_PHOTOS.length}
        />
      </Reveal>
      <div className="gm-split mt-4">
        <Reveal variant="left">
          <button
            type="button"
            className="gm-card p-3 text-start h-100 w-100"
            onClick={onWeather}
          >
            <span className="gm-mega-icon">
              <CloudRain />
            </span>
            <span className="gm-eyebrow d-block mt-2">
              Ten water-balance periods
            </span>
            <h3 className="font-display">Weather evidence</h3>
            <p>
              Observed rainfall, crop need, forecast and impact from
              establishment through pre-harvest.
            </p>
            <span className="gm-link-arrow">
              Open weather overlay <ArrowRight />
            </span>
          </button>
        </Reveal>
        <Reveal variant="right">
          <button
            type="button"
            className="gm-card p-3 text-start h-100 w-100"
            onClick={onYield}
          >
            <span className="gm-mega-icon">
              <TrendingUp />
            </span>
            <span className="gm-eyebrow d-block mt-2">72% confidence</span>
            <h3 className="font-display">Yield evidence</h3>
            <p>
              Six live factors explain the 14,500-head prediction and KES
              435,000 revenue.
            </p>
            <span className="gm-link-arrow">
              Open yield model <ArrowRight />
            </span>
          </button>
        </Reveal>
      </div>
    </div>
  );
}

function CropSwitcher({
  crops,
  selectedId,
  onSelect,
}: {
  crops: ActiveCropRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const rows = crops.filter((crop) =>
    `${crop.crop} ${crop.variety} ${crop.plot} ${crop.swahili}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div>
      <Field label="Search ten active crops">
        <div className="gm-search-field">
          <Search />
          <input
            className="gm-input"
            value={query}
            aria-label="Search active crops"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </Field>
      {rows.map((crop) => (
        <button
          key={crop.id}
          type="button"
          className={`gm-option-row ${crop.id === selectedId ? "is-selected" : ""}`}
          onClick={() => onSelect(crop.id)}
        >
          <span className="gm-mega-icon">
            <Sprout />
          </span>
          <span style={{ flex: 1 }}>
            <strong>
              {crop.crop} — {crop.variety}
            </strong>
            <small>
              {crop.plot} · {crop.acres} ac · {crop.currentStage}
            </small>
          </span>
          <StatusChip
            label={`${crop.healthScore}/100`}
            tone={crop.healthTone}
          />
          <ArrowRight />
        </button>
      ))}
      {rows.length === 0 ? (
        <div className="gm-empty">
          <Search />
          <strong>No active crops match</strong>
        </div>
      ) : null}
    </div>
  );
}

function StageDetail({ stage }: { stage: GrowthStage }) {
  const [tab, setTab] = useState<"guide" | "inputs" | "risks">("guide");
  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <StatusChip
          label={
            stage.state === "done"
              ? "Complete"
              : stage.state === "current"
                ? "Current stage"
                : "Upcoming"
          }
          tone={
            stage.state === "current"
              ? "medium"
              : stage.state === "done"
                ? "low"
                : "neutral"
          }
        />
        <span className="gm-chip">
          <CalendarDays /> {stage.dates}
        </span>
        <span className="gm-chip">{stage.duration}</span>
      </div>
      <ProgressLine value={stage.progress} label={`${stage.name} completion`} />
      <PlannerSubtabs
        value={tab}
        label="Stage detail"
        onChange={setTab}
        items={[
          { id: "guide", label: "Description & activities" },
          {
            id: "inputs",
            label: "Required inputs",
            count: stage.inputs.length,
          },
          {
            id: "risks",
            label: "Weather & problems",
            count: stage.problems.length,
          },
        ]}
      />
      {tab === "guide" ? (
        <div>
          <div className="gm-card p-3">
            <p className="mb-0">{stage.description}</p>
          </div>
          <h3 className="font-display mt-4">Key activities</h3>
          {stage.activities.map((activity) => (
            <div key={activity} className="gm-check-row">
              <Check />
              <strong>{activity}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "inputs" ? (
        <div>
          {stage.inputs.map((input) => (
            <div key={input} className="gm-check-row">
              <PackageCheck />
              <strong>{input}</strong>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "risks" ? (
        <div>
          <div className="gm-plan-rec">
            <span className="gm-eyebrow">
              <CloudRain /> Weather consideration
            </span>
            <p className="mb-0 mt-2">
              <strong>{stage.weather}</strong>
            </p>
          </div>
          <h3 className="font-display mt-4">Common problems</h3>
          {stage.problems.map((problem) => (
            <div key={problem} className="gm-check-row">
              <AlertTriangle />
              <strong>{problem}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TaskDetail({
  task,
  onComplete,
  onSkip,
  onEdit,
  onReschedule,
}: {
  task: CropTask;
  onComplete: () => void;
  onSkip: () => void;
  onEdit: () => void;
  onReschedule: () => void;
}) {
  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <StatusChip label={task.status} tone={taskTone(task.status)} />
        <StatusChip label={task.priority} tone={priorityTone(task.priority)} />
        <span className="gm-chip">
          <CalendarDays /> {task.date}
        </span>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Stage</td>
              <td>
                <strong>{task.stage}</strong>
              </td>
            </tr>
            <tr>
              <td>Input</td>
              <td>
                <strong>{task.input}</strong>
              </td>
            </tr>
            <tr>
              <td>Labour</td>
              <td>
                <strong>{task.labour}</strong>
              </td>
            </tr>
            <tr>
              <td>Cost</td>
              <td className="font-display">
                <strong>{kes(task.cost)}</strong>
              </td>
            </tr>
            <tr>
              <td>Done by / assigned</td>
              <td>
                <strong>{task.doneBy}</strong>
              </td>
            </tr>
            <tr>
              <td>Notes</td>
              <td>
                <strong>{task.notes}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {task.status !== "Completed" && task.status !== "Skipped" ? (
          <>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={onComplete}
            >
              <Check /> Complete
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={onSkip}
            >
              <SkipForward /> Skip
            </button>
          </>
        ) : null}
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onEdit}
        >
          <Pencil /> Edit
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-outline gm-btn-sm"
          onClick={onReschedule}
        >
          <CalendarClock /> Reschedule
        </button>
      </div>
    </div>
  );
}

function EditCropWizard({
  crop,
  onSave,
}: {
  crop: ActiveCropRecord;
  onSave: () => void;
}) {
  const [step, setStep] = useState(0);
  const [variety, setVariety] = useState(crop.variety);
  const [plot, setPlot] = useState(crop.plot);
  const [acres, setAcres] = useState(String(crop.acres));
  const [harvest, setHarvest] = useState("2027-01-18");
  const [water, setWater] = useState(crop.water);
  return (
    <div>
      <Stepper
        steps={["Crop", "Field", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Crop">
            <input
              className="gm-input"
              value={`${crop.crop} · ${crop.swahili}`}
              readOnly
            />
          </Field>
          <Field label="Variety">
            <input
              className="gm-input"
              value={variety}
              onChange={(event) => setVariety(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Plot">
            <input
              className="gm-input"
              value={plot}
              onChange={(event) => setPlot(event.target.value)}
            />
          </Field>
          <Field label="Acreage">
            <input
              className="gm-input"
              inputMode="decimal"
              value={acres}
              onChange={(event) =>
                setAcres(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
              }
            />
          </Field>
          <Field label="Expected harvest">
            <input
              className="gm-input"
              type="date"
              value={harvest}
              onChange={(event) => setHarvest(event.target.value)}
            />
          </Field>
          <Field label="Water plan">
            <select
              className="gm-select"
              value={water}
              onChange={(event) => setWater(event.target.value)}
            >
              <option>Short rains + drip backup</option>
              <option>Rain-fed</option>
              <option>Drip irrigation</option>
              <option>Sprinkler irrigation</option>
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
                    {crop.crop} — {variety}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Field</td>
                <td>
                  <strong>
                    {plot} · {acres} acre
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Expected harvest</td>
                <td>
                  <strong>{harvest}</strong>
                </td>
              </tr>
              <tr>
                <td>Water</td>
                <td>
                  <strong>{water}</strong>
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
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave())}
        finishLabel="Save crop details"
        nextDisabled={
          !variety.trim() || !plot.trim() || !Number(acres) || !harvest
        }
      />
    </div>
  );
}

function ArchiveCropConfirm({
  crop,
  onCancel,
  onArchive,
}: {
  crop: ActiveCropRecord;
  onCancel: () => void;
  onArchive: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <div className="gm-check-row">
        <Lock />
        <span>
          <strong>
            {crop.crop} — {crop.variety}
          </strong>
          <small>
            {crop.plot} · {crop.progress}% complete
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
          <strong>
            Preserve all records and remove this crop from active work
          </strong>
          <small>
            The archive action can be reversed from a future records workflow.
          </small>
        </span>
      </button>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Keep active
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-dark"
          disabled={!confirmed}
          onClick={onArchive}
        >
          <Lock /> Archive crop
        </button>
      </ModalFooter>
    </div>
  );
}

function DeleteCropConfirm({
  crop,
  onCancel,
  onDelete,
}: {
  crop: ActiveCropRecord;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState("");
  return (
    <div>
      <div className="gm-plan-rec">
        <StatusChip label="Destructive action" tone="high" />
        <h3 className="font-display mt-2">
          Delete {crop.crop} and its local task records
        </h3>
        <p className="mb-0">
          Archive instead if the crop was planted or has financial records.
        </p>
      </div>
      <Field label={`Type ${crop.crop} to confirm`}>
        <input
          className="gm-input mt-3"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          disabled={name !== crop.crop}
          onClick={onDelete}
        >
          <Trash2 /> Permanently delete
        </button>
      </ModalFooter>
    </div>
  );
}

function CompleteTaskWizard({
  task,
  onDone,
}: {
  task: CropTask;
  onDone: (cost: number, note: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState([false, false, false]);
  const [actualCost, setActualCost] = useState(String(task.cost));
  const [note, setNote] = useState(task.notes);
  const [photo, setPhoto] = useState("No photo required");
  const toggle = (index: number) =>
    setChecks((rows) =>
      rows.map((value, rowIndex) => (rowIndex === index ? !value : value)),
    );
  return (
    <div>
      <Stepper
        steps={["Field checks", "Evidence", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="mt-3">
          {[
            "Work was completed across the assigned area.",
            "Input and labour quantities were checked.",
            "Safety and crop-stage instructions were followed.",
          ].map((label, index) => (
            <button
              key={label}
              type="button"
              className={`gm-checkcard ${checks[index] ? "on" : ""}`}
              onClick={() => toggle(index)}
            >
              <input
                type="checkbox"
                checked={checks[index]}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{label}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Actual cost (KES)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={actualCost}
              onChange={(event) =>
                setActualCost(event.target.value.replace(/\D/g, "").slice(0, 7))
              }
            />
          </Field>
          <Field label="Photo evidence">
            <select
              className="gm-select"
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
            >
              <option>No photo required</option>
              <option>Photo record GM-TASK-NEW</option>
              <option>Supervisor visual check</option>
            </select>
          </Field>
          <Field label="Completion note" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Task</td>
                <td>
                  <strong>{task.task}</strong>
                </td>
              </tr>
              <tr>
                <td>Input / labour</td>
                <td>
                  <strong>
                    {task.input} · {task.labour}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Actual cost</td>
                <td className="font-display">
                  <strong>{kes(Number(actualCost))}</strong>
                </td>
              </tr>
              <tr>
                <td>Evidence</td>
                <td>
                  <strong>{photo}</strong>
                </td>
              </tr>
              <tr>
                <td>Note</td>
                <td>
                  <strong>{note}</strong>
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
            : onDone(Number(actualCost), note.trim())
        }
        finishLabel="Complete & record"
        nextDisabled={(step === 0 && !checks.every(Boolean)) || !note.trim()}
      />
    </div>
  );
}

function SkipTaskWizard({
  task,
  onCancel,
  onSkip,
}: {
  task: CropTask;
  onCancel: () => void;
  onSkip: (reason: string) => void;
}) {
  const [reasonType, setReasonType] = useState("Field condition changed");
  const [reason, setReason] = useState(
    "Recent field inspection showed the action is not needed at this crop stage.",
  );
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div>
      <Field label="Skip reason">
        <select
          className="gm-select"
          value={reasonType}
          onChange={(event) => setReasonType(event.target.value)}
        >
          <option>Field condition changed</option>
          <option>Weather unsafe</option>
          <option>Input unavailable</option>
          <option>Task duplicated</option>
          <option>Agronomist advised against action</option>
        </select>
      </Field>
      <Field label="Agronomic note">
        <textarea
          className="gm-textarea"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>
      <button
        type="button"
        className={`gm-checkcard ${confirmed ? "on" : ""}`}
        onClick={() => setConfirmed((value) => !value)}
      >
        <input type="checkbox" checked={confirmed} readOnly tabIndex={-1} />
        <span>
          <strong>Record {task.task} as skipped</strong>
          <small>{reasonType} · this remains visible in crop history.</small>
        </span>
      </button>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Keep task
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-dark"
          disabled={!confirmed || !reason.trim()}
          onClick={() => onSkip(`${reasonType}: ${reason.trim()}`)}
        >
          <SkipForward /> Skip with reason
        </button>
      </ModalFooter>
    </div>
  );
}

function EditTaskWizard({
  task,
  onSave,
}: {
  task: CropTask;
  onSave: (task: CropTask) => void;
}) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(task.task);
  const [input, setInput] = useState(task.input);
  const [labour, setLabour] = useState(task.labour);
  const [cost, setCost] = useState(String(task.cost));
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [note, setNote] = useState(task.notes);
  return (
    <div>
      <Stepper
        steps={["Task", "Resources", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Task name" full>
            <input
              className="gm-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field label="Priority">
            <select
              className="gm-select"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>
          <Field label="Date">
            <input className="gm-input" value={task.date} readOnly />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Input">
            <input
              className="gm-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </Field>
          <Field label="Labour">
            <input
              className="gm-input"
              value={labour}
              onChange={(event) => setLabour(event.target.value)}
            />
          </Field>
          <Field label="Estimated cost">
            <input
              className="gm-input"
              inputMode="numeric"
              value={cost}
              onChange={(event) =>
                setCost(event.target.value.replace(/\D/g, "").slice(0, 7))
              }
            />
          </Field>
          <Field label="Instructions" full>
            <textarea
              className="gm-textarea"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Task</td>
                <td>
                  <strong>{title}</strong>
                </td>
              </tr>
              <tr>
                <td>Priority</td>
                <td>
                  <StatusChip label={priority} tone={priorityTone(priority)} />
                </td>
              </tr>
              <tr>
                <td>Input</td>
                <td>
                  <strong>{input}</strong>
                </td>
              </tr>
              <tr>
                <td>Labour</td>
                <td>
                  <strong>{labour}</strong>
                </td>
              </tr>
              <tr>
                <td>Cost</td>
                <td className="font-display">
                  <strong>{kes(Number(cost))}</strong>
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
                ...task,
                task: title.trim(),
                input: input.trim(),
                labour: labour.trim(),
                cost: Number(cost),
                priority,
                notes: note.trim(),
              })
        }
        finishLabel="Save task"
        nextDisabled={
          !title.trim() || !input.trim() || !labour.trim() || !note.trim()
        }
      />
    </div>
  );
}

function RescheduleTask({
  task,
  onSave,
}: {
  task: CropTask;
  onSave: (date: string, note: string) => void;
}) {
  const [date, setDate] = useState("2026-11-18");
  const [reason, setReason] = useState(
    "Move to the next dry field-work window after rainfall.",
  );
  return (
    <div className="gm-form-grid">
      <Field label="Current schedule">
        <input className="gm-input" value={task.date} readOnly />
      </Field>
      <Field label="New date">
        <input
          className="gm-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <Field label="Reschedule reason" full>
        <textarea
          className="gm-textarea"
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>
      <div className="full gm-plan-rec">
        <strong>Crop-stage check</strong>
        <p className="mb-0 mt-1">
          Confirm the new date remains inside {task.stage} and does not conflict
          with product PHI or fertilizer timing.
        </p>
      </div>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={!date || !reason.trim()}
            onClick={() =>
              onSave(
                new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                }).format(new Date(`${date}T12:00:00`)),
                reason.trim(),
              )
            }
          >
            <CalendarClock /> Reschedule task
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}

function AddTaskWizard({
  crop,
  stages,
  onSave,
}: {
  crop: ActiveCropRecord;
  stages: GrowthStage[];
  onSave: (task: CropTask) => void;
}) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(
    `Inspect ${crop.crop.toLowerCase()} after rainfall`,
  );
  const [stage, setStage] = useState(crop.currentStage);
  const [date, setDate] = useState("2026-11-15");
  const [input, setInput] = useState("Field sheet and phone camera");
  const [labour, setLabour] = useState("Self");
  const [cost, setCost] = useState("0");
  const [priority, setPriority] = useState<TaskPriority>("High");
  const [note, setNote] = useState(
    "Inspect 20 plants in a W pattern and record any symptoms before treatment.",
  );
  return (
    <div>
      <Stepper
        steps={["Work", "Resources", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Task name" full>
            <input
              className="gm-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field label="Growth stage">
            <select
              className="gm-select"
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            >
              {stages.map((item) => (
                <option key={item.id}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Task date">
            <input
              className="gm-input"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
          <Field label="Priority">
            <select
              className="gm-select"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Input or tool">
            <input
              className="gm-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </Field>
          <Field label="Labour">
            <input
              className="gm-input"
              value={labour}
              onChange={(event) => setLabour(event.target.value)}
            />
          </Field>
          <Field label="Estimated cost">
            <input
              className="gm-input"
              inputMode="numeric"
              value={cost}
              onChange={(event) =>
                setCost(event.target.value.replace(/\D/g, "").slice(0, 7))
              }
            />
          </Field>
          <Field label="Field instructions" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Crop / task</td>
                <td>
                  <strong>
                    {crop.crop} · {title}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Stage / date</td>
                <td>
                  <strong>
                    {stage} · {date}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Input / labour</td>
                <td>
                  <strong>
                    {input} · {labour}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Estimated cost</td>
                <td className="font-display">
                  <strong>{kes(Number(cost))}</strong>
                </td>
              </tr>
              <tr>
                <td>Instructions</td>
                <td>
                  <strong>{note}</strong>
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
                id: `task-${Date.now()}`,
                cropId: crop.id,
                date: new Intl.DateTimeFormat("en-GB", {
                  day: "2-digit",
                  month: "short",
                }).format(new Date(`${date}T12:00:00`)),
                task: title.trim(),
                input: input.trim(),
                labour: labour.trim(),
                cost: Number(cost),
                priority,
                status: "Planned",
                doneBy: labour === "Self" ? crop.manager : "Unassigned",
                notes: note.trim(),
                stage,
              })
        }
        finishLabel="Add crop task"
        nextDisabled={
          !title.trim() ||
          !stage ||
          !date ||
          !input.trim() ||
          !labour.trim() ||
          !note.trim()
        }
      />
    </div>
  );
}

function CustomizeWidgets({
  initialPreset,
  orders,
  onSave,
}: {
  initialPreset: WidgetPreset;
  orders: Record<WidgetPreset, string[]>;
  onSave: (orders: Record<WidgetPreset, string[]>) => void;
}) {
  const [step, setStep] = useState(0);
  const [preset, setPreset] = useState<WidgetPreset>(initialPreset);
  const [next, setNext] = useState(orders);
  const definitions =
    preset === "vegetable"
      ? VEGETABLE_WIDGETS
      : preset === "grain"
        ? GRAIN_WIDGETS
        : INDUSTRIAL_WIDGETS;
  const enabled = next[preset];
  const move = (id: string, direction: -1 | 1) =>
    setNext((current) => {
      const list = [...current[preset]];
      const index = list.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return current;
      [list[index], list[target]] = [
        list[target] as string,
        list[index] as string,
      ];
      return { ...current, [preset]: list };
    });
  const toggle = (id: string) =>
    setNext((current) => ({
      ...current,
      [preset]: current[preset].includes(id)
        ? current[preset].filter((item) => item !== id)
        : [...current[preset], id],
    }));
  const orderedDefinitions = [...definitions].sort((a, b) => {
    const ai = enabled.indexOf(a.id);
    const bi = enabled.indexOf(b.id);
    if (ai === -1 && bi === -1) return a.label.localeCompare(b.label);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return (
    <div>
      <Stepper
        steps={["Enterprise", "Arrange", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-plan-summary-grid mt-3">
          {(["vegetable", "grain", "industrial"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={`gm-checkcard ${preset === item ? "on" : ""}`}
              onClick={() => setPreset(item)}
            >
              <input
                type="radio"
                checked={preset === item}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>
                  {item === "vegetable"
                    ? "Vegetables · Cabbage"
                    : item === "grain"
                      ? "Grains · Maize"
                      : "Long-season · Sugarcane"}
                </strong>
                <small>
                  {item === "vegetable"
                    ? VEGETABLE_WIDGETS.length
                    : item === "grain"
                      ? GRAIN_WIDGETS.length
                      : INDUSTRIAL_WIDGETS.length}{" "}
                  available widgets
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-3">
          {orderedDefinitions.map((widget) => {
            const isOn = enabled.includes(widget.id);
            const index = enabled.indexOf(widget.id);
            return (
              <div key={widget.id} className="gm-check-row">
                <Toggle
                  checked={isOn}
                  onChange={() => toggle(widget.id)}
                  label={widget.label}
                  desc={widget.description}
                />
                <div className="d-flex gap-1 ms-auto">
                  {isOn ? (
                    <>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        disabled={index === 0}
                        aria-label={`Move ${widget.label} up`}
                        onClick={() => move(widget.id, -1)}
                      >
                        <ArrowUp />
                      </button>
                      <button
                        type="button"
                        className="gm-icon-btn"
                        disabled={index === enabled.length - 1}
                        aria-label={`Move ${widget.label} down`}
                        onClick={() => move(widget.id, 1)}
                      >
                        <ArrowDown />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-card p-3 mt-3">
          <h3 className="font-display">
            {enabled.length} active {preset} widgets
          </h3>
          {enabled.map((id, index) => {
            const widget = definitions.find((item) => item.id === id);
            return widget ? (
              <div key={id} className="gm-check-row">
                <span className="gm-mega-icon font-display">{index + 1}</span>
                <span>
                  <strong>{widget.label}</strong>
                  <small>{widget.summary}</small>
                </span>
              </div>
            ) : null;
          })}
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave(next))}
        finishLabel="Save widget layout"
        nextDisabled={enabled.length === 0}
      />
    </div>
  );
}

function WidgetLibrary({
  enabledIds,
  currentPreset,
  onToggle,
}: {
  enabledIds: string[];
  currentPreset: WidgetPreset;
  onToggle: (id: string) => void;
}) {
  const [preset, setPreset] = useState<WidgetPreset>(currentPreset);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const definitions =
    preset === "vegetable"
      ? VEGETABLE_WIDGETS
      : preset === "grain"
        ? GRAIN_WIDGETS
        : INDUSTRIAL_WIDGETS;
  const rows = definitions.filter((widget) =>
    `${widget.label} ${widget.description} ${widget.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 6;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <PlannerSubtabs
        value={preset}
        label="Enterprise widget library"
        onChange={(value) => {
          setPreset(value);
          setPage(1);
        }}
        items={[
          {
            id: "vegetable",
            label: "Vegetables",
            count: VEGETABLE_WIDGETS.length,
          },
          { id: "grain", label: "Grains", count: GRAIN_WIDGETS.length },
          {
            id: "industrial",
            label: "Long-season",
            count: INDUSTRIAL_WIDGETS.length,
          },
        ]}
      />
      <Field label="Search widget name or purpose">
        <div className="gm-search-field">
          <Search />
          <input
            className="gm-input"
            value={query}
            aria-label="Search widget library"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </Field>
      <div className="gm-plan-grid">
        {visible.map((widget) => (
          <article key={widget.id} className="gm-card p-3">
            <div className="d-flex justify-content-between gap-2">
              <span className="gm-mega-icon">
                {(() => {
                  const Icon = WIDGET_ICONS[widget.id] ?? Gauge;
                  return <Icon />;
                })()}
              </span>
              <StatusChip
                label={
                  widget.availability === "hidden"
                    ? "Never shown"
                    : widget.defaultOn
                      ? "Default on"
                      : "Optional"
                }
                tone={
                  widget.availability === "hidden"
                    ? "neutral"
                    : widget.defaultOn
                      ? "low"
                      : "medium"
                }
              />
            </div>
            <h3 className="font-display mt-2">{widget.label}</h3>
            <p>{widget.description}</p>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              disabled={
                preset !== currentPreset || widget.availability === "hidden"
              }
              onClick={() => onToggle(widget.id)}
            >
              {enabledIds.includes(widget.id) ? <X /> : <Plus />}
              {enabledIds.includes(widget.id) ? " Remove" : " Add"}
            </button>
          </article>
        ))}
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

function NurseryTracker({ onSave }: { onSave: () => void }) {
  const [step, setStep] = useState(0);
  const [germinated, setGerminated] = useState("940");
  const [sown, setSown] = useState("1000");
  const [health, setHealth] = useState("Good · even green colour");
  const [note, setNote] = useState(
    "Hardening completed over seven days; morning watering only.",
  );
  const rate = Math.round(
    (Number(germinated) / Math.max(1, Number(sown))) * 100,
  );
  return (
    <div>
      <Stepper
        steps={["Sowing", "Health", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Seed sown">
            <input
              className="gm-input"
              value="Gloria F1 · 200 g · 20 Sep"
              readOnly
            />
          </Field>
          <Field label="Estimated seeds sown">
            <input
              className="gm-input"
              inputMode="numeric"
              value={sown}
              onChange={(event) =>
                setSown(event.target.value.replace(/\D/g, "").slice(0, 5))
              }
            />
          </Field>
          <Field label="Seedlings germinated">
            <input
              className="gm-input"
              inputMode="numeric"
              value={germinated}
              onChange={(event) =>
                setGerminated(event.target.value.replace(/\D/g, "").slice(0, 5))
              }
            />
          </Field>
          <Field label="Germination rate">
            <input
              className="gm-input font-display"
              value={`${rate}%`}
              readOnly
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Seedling health">
            <select
              className="gm-select"
              value={health}
              onChange={(event) => setHealth(event.target.value)}
            >
              <option>Good · even green colour</option>
              <option>Attention · pale seedlings</option>
              <option>Attention · uneven emergence</option>
              <option>Problem · damping-off present</option>
            </select>
          </Field>
          <Field label="Nursery note" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="d-flex flex-wrap align-items-center gap-4 mt-3">
          <ScoreRing score={rate} size={132} />
          <div>
            <StatusChip
              label={rate >= 90 ? "Strong nursery" : "Review nursery"}
              tone={rate >= 90 ? "low" : "medium"}
            />
            <h3 className="font-display mt-2">{rate}% Gloria F1 germination</h3>
            <p>
              {health}. {note}
            </p>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave())}
        finishLabel="Save nursery record"
        nextDisabled={
          !Number(sown) ||
          !Number(germinated) ||
          Number(germinated) > Number(sown) ||
          !note.trim()
        }
      />
    </div>
  );
}

function TransplantingLog({ onSave }: { onSave: () => void }) {
  const [survived, setSurvived] = useState("8420");
  const [planted, setPlanted] = useState("8770");
  const [spacing, setSpacing] = useState("45 × 45 cm");
  const [gaps, setGaps] = useState("350");
  const rate = Math.round(
    (Number(survived) / Math.max(1, Number(planted))) * 100,
  );
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Transplanted">
          <input
            className="gm-input"
            inputMode="numeric"
            value={planted}
            onChange={(event) =>
              setPlanted(event.target.value.replace(/\D/g, "").slice(0, 5))
            }
          />
        </Field>
        <Field label="Survived at day 7">
          <input
            className="gm-input"
            inputMode="numeric"
            value={survived}
            onChange={(event) =>
              setSurvived(event.target.value.replace(/\D/g, "").slice(0, 5))
            }
          />
        </Field>
        <Field label="Spacing">
          <select
            className="gm-select"
            value={spacing}
            onChange={(event) => setSpacing(event.target.value)}
          >
            <option>45 × 45 cm</option>
            <option>60 × 45 cm</option>
            <option>60 × 60 cm</option>
          </select>
        </Field>
        <Field label="Gaps to fill">
          <input
            className="gm-input"
            inputMode="numeric"
            value={gaps}
            onChange={(event) =>
              setGaps(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
        </Field>
      </div>
      <div className="gm-plan-kpi-row mt-3">
        <PlannerFact
          label="Transplant date"
          value="20 Oct 2026"
          note="Late afternoon"
        />
        <PlannerFact
          label="Survival"
          value={`${rate}%`}
          note={`${Number(survived).toLocaleString()} live plants`}
        />
        <PlannerFact label="Spacing" value={spacing} note="Bed width 1 m" />
        <PlannerFact
          label="Gap filling"
          value={`${gaps} plants`}
          note="Complete within 7 days"
        />
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={
            !Number(planted) ||
            !Number(survived) ||
            Number(survived) > Number(planted)
          }
          onClick={onSave}
        >
          <Check /> Save transplanting log
        </button>
      </ModalFooter>
    </div>
  );
}

function FertilizerCentre({ onApply }: { onApply: () => void }) {
  const [tab, setTab] = useState<"schedule" | "history" | "recommendation">(
    "schedule",
  );
  const [page, setPage] = useState(1);
  const perPage = 5;
  const pages = Math.ceil(FERTILIZER_HISTORY.length / perPage);
  const history = FERTILIZER_HISTORY.slice(
    (page - 1) * perPage,
    page * perPage,
  );
  return (
    <div>
      <PlannerSubtabs
        value={tab}
        label="Fertilizer centre"
        onChange={setTab}
        items={[
          {
            id: "schedule",
            label: "Cabbage schedule",
            count: CABBAGE_FERTILIZER_SCHEDULE.length,
          },
          {
            id: "history",
            label: "Farm history",
            count: FERTILIZER_HISTORY.length,
          },
          { id: "recommendation", label: "AI soil note" },
        ]}
      />
      {tab === "schedule" ? (
        <div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Stage</th>
                  <th>Fertilizer</th>
                  <th>Rate</th>
                  <th>Method</th>
                  <th>Purpose</th>
                  <th>Actual date</th>
                  <th>Actual cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {CABBAGE_FERTILIZER_SCHEDULE.map((row) => (
                  <tr key={row.id}>
                    <td>{row.number}</td>
                    <td>{row.date}</td>
                    <td>{row.stage}</td>
                    <td>
                      <strong>{row.fertilizer}</strong>
                    </td>
                    <td>{row.rate}</td>
                    <td>{row.method}</td>
                    <td>{row.purpose}</td>
                    <td>{row.actualDate}</td>
                    <td className="font-display">
                      {row.actualCost === null
                        ? "Not recorded"
                        : kes(row.actualCost)}
                    </td>
                    <td>
                      <StatusChip
                        label={row.status}
                        tone={
                          row.status === "Applied"
                            ? "low"
                            : row.status === "Due"
                              ? "high"
                              : "medium"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ModalFooter>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={onApply}
            >
              <Plus /> Record application
            </button>
          </ModalFooter>
        </div>
      ) : null}
      {tab === "history" ? (
        <div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Date</th>
                  <th>Stage</th>
                  <th>Fertilizer</th>
                  <th>Rate</th>
                  <th>Purpose</th>
                  <th>Actual</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {ACTIVE_CROPS.find((crop) => crop.id === row.cropId)
                        ?.crop ?? "Crop"}
                    </td>
                    <td>{row.date}</td>
                    <td>{row.stage}</td>
                    <td>
                      <strong>{row.fertilizer}</strong>
                    </td>
                    <td>{row.rate}</td>
                    <td>{row.purpose}</td>
                    <td className="font-display">
                      {row.actualCost === null
                        ? "Pending"
                        : kes(row.actualCost)}
                    </td>
                    <td>
                      <StatusChip
                        label={row.status}
                        tone={
                          row.status === "Applied"
                            ? "low"
                            : row.status === "Due"
                              ? "high"
                              : "medium"
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
            onChange={setPage}
            perPage={perPage}
            totalItems={FERTILIZER_HISTORY.length}
          />
        </div>
      ) : null}
      {tab === "recommendation" ? (
        <div className="d-flex flex-wrap align-items-center gap-4">
          <ScoreRing score={78} size={132} />
          <div style={{ flex: "1 1 300px" }}>
            <span className="gm-eyebrow">
              <Bot /> Soil test interpretation
            </span>
            <h3 className="font-display mt-2">
              pH 5.8 · low calcium · manure adequate
            </h3>
            <p>{FERTILIZER_AI_RECOMMENDATION}</p>
            <div className="gm-check-row">
              <Check />
              <strong>No additional organic matter this season</strong>
            </div>
            <div className="gm-check-row">
              <CalendarDays />
              <strong>
                Plan agricultural lime before next land preparation
              </strong>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FertilizerApplicationWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState("CAN · first top dress");
  const [rate, setRate] = useState("25");
  const [operator, setOperator] = useState("Mary Wanjiku");
  const [cost, setCost] = useState("2750");
  const [moist, setMoist] = useState(true);
  const [distance, setDistance] = useState(true);
  return (
    <div>
      <Stepper
        steps={["Product", "Field checks", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Application">
            <select
              className="gm-select"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
            >
              <option>CAN · first top dress</option>
              <option>CAN · second top dress</option>
              <option>Potassium foliar</option>
            </select>
          </Field>
          <Field label="Quantity used">
            <input
              className="gm-input"
              inputMode="decimal"
              value={rate}
              onChange={(event) =>
                setRate(event.target.value.replace(/[^\d.]/g, "").slice(0, 5))
              }
            />
          </Field>
          <Field label="Operator">
            <select
              className="gm-select"
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
            >
              <option>Mary Wanjiku</option>
              <option>John Mwangi</option>
              <option>Peter Kamau</option>
            </select>
          </Field>
          <Field label="Actual cost">
            <input
              className="gm-input"
              inputMode="numeric"
              value={cost}
              onChange={(event) =>
                setCost(event.target.value.replace(/\D/g, "").slice(0, 7))
              }
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="mt-3">
          <Toggle
            checked={moist}
            onChange={setMoist}
            label="Soil is moist"
            desc="Top dressing on dry soil increases loss and root injury"
          />
          <Toggle
            checked={distance}
            onChange={setDistance}
            label="Fertilizer kept away from stem"
            desc="Side-dress and cover lightly along rows"
          />
          <div className="gm-plan-rec mt-3">
            <strong>Field instruction</strong>
            <p className="mb-0 mt-1">
              Apply after weeding, avoid leaf contact and irrigate lightly if
              rain is not expected within 24 hours.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Product</td>
                <td>
                  <strong>{product}</strong>
                </td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td>
                  <strong>{rate} kg or litres as labelled</strong>
                </td>
              </tr>
              <tr>
                <td>Operator</td>
                <td>
                  <strong>{operator}</strong>
                </td>
              </tr>
              <tr>
                <td>Actual cost</td>
                <td className="font-display">
                  <strong>{kes(Number(cost))}</strong>
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
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onDone())}
        finishLabel="Record application"
        nextDisabled={
          !product ||
          !Number(rate) ||
          !operator ||
          !Number(cost) ||
          (step === 1 && (!moist || !distance))
        }
      />
    </div>
  );
}

function PestDiseaseCentre({
  onScout,
  onDiagnose,
  onInputs,
}: {
  onScout: () => void;
  onDiagnose: () => void;
  onInputs: () => void;
}) {
  const [tab, setTab] = useState<"pests" | "diseases" | "scouting">("pests");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const scouts = SCOUTING_LOG.filter((row) =>
    `${row.found} ${row.action} ${row.scout}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(scouts.length / perPage));
  const visible = scouts.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <PlannerSubtabs
        value={tab}
        label="Pest and disease data"
        onChange={setTab}
        items={[
          { id: "pests", label: "Common pests", count: PEST_RISKS.length },
          {
            id: "diseases",
            label: "Common diseases",
            count: DISEASE_RISKS.length,
          },
          { id: "scouting", label: "Scouting log", count: SCOUTING_LOG.length },
        ]}
      />
      {tab === "pests" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Pest</th>
                <th>Current risk</th>
                <th>Identification</th>
                <th>Damage</th>
                <th>Treatment</th>
                <th>Cost / session</th>
              </tr>
            </thead>
            <tbody>
              {PEST_RISKS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.pest}</strong>
                  </td>
                  <td>
                    <StatusChip label={row.risk} tone={row.tone} />
                  </td>
                  <td>{row.identification}</td>
                  <td>{row.damage}</td>
                  <td>{row.treatment}</td>
                  <td className="font-display">{kes(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "diseases" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Disease</th>
                <th>Risk</th>
                <th>Symptoms</th>
                <th>Prevention</th>
                <th>Treatment</th>
                <th>PHI</th>
              </tr>
            </thead>
            <tbody>
              {DISEASE_RISKS.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.disease}</strong>
                  </td>
                  <td>
                    <StatusChip label={row.risk} tone={row.tone} />
                  </td>
                  <td>{row.symptoms}</td>
                  <td>{row.prevention}</td>
                  <td>{row.treatment}</td>
                  <td>{row.phi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "scouting" ? (
        <div>
          <Field label="Search scouting records">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                aria-label="Search scouting records"
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
                  <th>Date</th>
                  <th>Found</th>
                  <th>Severity</th>
                  <th>Area</th>
                  <th>Action</th>
                  <th>Photo</th>
                  <th>Scout</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      <strong>{row.found}</strong>
                    </td>
                    <td>
                      <StatusChip
                        label={`${row.severity}/10`}
                        tone={
                          row.severity >= 6
                            ? "high"
                            : row.severity >= 3
                              ? "medium"
                              : "low"
                        }
                      />
                    </td>
                    <td>{row.areaAffected}</td>
                    <td>{row.action}</td>
                    <td>{row.photoRef}</td>
                    <td>{row.scout}</td>
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
            totalItems={scouts.length}
          />
        </div>
      ) : null}
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onInputs}
        >
          <ShoppingBag /> Find treatment
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-dark"
          onClick={onDiagnose}
        >
          <Bot /> Check symptoms
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onScout}>
          <Plus /> Add scouting record
        </button>
      </ModalFooter>
    </div>
  );
}

function ScoutingWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState("20");
  const [pattern, setPattern] = useState("W pattern across plot");
  const [finding, setFinding] = useState("Diamondback moth larvae");
  const [count, setCount] = useState("2");
  const [severity, setSeverity] = useState("2");
  const [area, setArea] = useState("10");
  const [action, setAction] = useState("Monitor · below spray threshold");
  const [photo, setPhoto] = useState(true);
  return (
    <div>
      <Stepper
        steps={["Sample", "Finding", "Decision"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Plants inspected">
            <input
              className="gm-input"
              inputMode="numeric"
              value={sample}
              onChange={(event) =>
                setSample(event.target.value.replace(/\D/g, "").slice(0, 3))
              }
            />
          </Field>
          <Field label="Walk pattern">
            <select
              className="gm-select"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
            >
              <option>W pattern across plot</option>
              <option>Five diagonal stations</option>
              <option>Outer rows + centre</option>
            </select>
          </Field>
          <div className="full gm-plan-rec">
            <strong>Representative sample</strong>
            <p className="mb-0 mt-1">
              Inspect upper and lower leaf surfaces and include plot edges, low
              spots and the centre.
            </p>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Finding">
            <select
              className="gm-select"
              value={finding}
              onChange={(event) => setFinding(event.target.value)}
            >
              <option>Diamondback moth larvae</option>
              <option>Aphid colony</option>
              <option>Black-rot symptoms</option>
              <option>Alternaria spots</option>
              <option>No pest or disease found</option>
            </select>
          </Field>
          <Field label="Plants affected">
            <input
              className="gm-input"
              inputMode="numeric"
              value={count}
              onChange={(event) =>
                setCount(event.target.value.replace(/\D/g, "").slice(0, 3))
              }
            />
          </Field>
          <Field label="Severity · 1 to 10">
            <input
              className="gm-input"
              inputMode="numeric"
              value={severity}
              onChange={(event) =>
                setSeverity(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <Field label="Area affected %">
            <input
              className="gm-input"
              inputMode="numeric"
              value={area}
              onChange={(event) =>
                setArea(event.target.value.replace(/\D/g, "").slice(0, 3))
              }
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Field decision" full>
            <textarea
              className="gm-textarea"
              rows={3}
              value={action}
              onChange={(event) => setAction(event.target.value)}
            />
          </Field>
          <Toggle
            checked={photo}
            onChange={setPhoto}
            label="Attach photo reference"
            desc="Creates a dated evidence reference for this scouting event"
          />
          <div className="gm-plan-rec">
            <StatusChip
              label={
                Number(severity) >= 6
                  ? "Action threshold likely"
                  : "Monitor and recheck"
              }
              tone={Number(severity) >= 6 ? "high" : "medium"}
            />
            <p className="mb-0 mt-2">
              {count} of {sample} plants · {pattern.toLowerCase()} · severity{" "}
              {severity}/10 · {area}% area. Follow the product label and PHI if
              treatment is selected.
            </p>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onDone())}
        finishLabel="Save scouting record"
        nextDisabled={
          !Number(sample) ||
          !finding ||
          !Number(severity) ||
          Number(severity) > 10 ||
          !action.trim()
        }
      />
    </div>
  );
}

function DiagnosisWizard({ onAction }: { onAction: (action: string) => void }) {
  const [step, setStep] = useState(0);
  const [location, setLocation] = useState("Leaf margins");
  const [appearance, setAppearance] = useState("V-shaped yellow lesions");
  const [spread, setSpread] = useState("5 plants in one wet area");
  const diagnosis =
    location === "Leaf margins" && appearance.includes("V-shaped")
      ? "Black rot likely"
      : "Field review needed";
  return (
    <div>
      <Stepper
        steps={["Location", "Appearance", "Action"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Where is the symptom?">
            <select
              className="gm-select"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>Leaf margins</option>
              <option>Leaf underside</option>
              <option>Stem base</option>
              <option>Roots</option>
              <option>Whole plant</option>
            </select>
          </Field>
          <Field label="How widespread?">
            <input
              className="gm-input"
              value={spread}
              onChange={(event) => setSpread(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Closest appearance" full>
            <select
              className="gm-select"
              value={appearance}
              onChange={(event) => setAppearance(event.target.value)}
            >
              <option>V-shaped yellow lesions</option>
              <option>Round dark concentric spots</option>
              <option>Grey fuzz below leaf</option>
              <option>Small feeding windows</option>
              <option>Swollen roots</option>
            </select>
          </Field>
          <div className="full gm-card p-3">
            <strong>Observation</strong>
            <p className="mb-0 mt-1">
              {appearance} at {location.toLowerCase()} · {spread}.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-plan-rec mt-3">
          <StatusChip
            label={diagnosis}
            tone={diagnosis.includes("likely") ? "high" : "medium"}
          />
          <h3 className="font-display mt-2">
            Isolate, document and protect unaffected plants
          </h3>
          <p>
            Remove heavily affected plants, avoid moving through wet foliage,
            disinfect tools and request an agronomist review if spread
            increases. Mancozeb protection must follow the label and 14-day PHI.
          </p>
          <div className="gm-check-row">
            <AlertTriangle />
            <strong>This guided check is not a laboratory diagnosis.</strong>
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
            : onAction("Black-rot field review")
        }
        finishLabel="Add field review action"
      />
    </div>
  );
}

function InputShop({ onOrder }: { onOrder: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [verified, setVerified] = useState(false);
  const [page, setPage] = useState(1);
  const rows = INPUT_SUPPLIERS.filter(
    (supplier) =>
      `${supplier.supplier} ${supplier.town} ${supplier.item} ${supplier.pack}`
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
        <Field label="Search item, supplier or town">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search crop inputs"
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
          desc="GrowMO business and stock check completed"
        />
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Phone</th>
              <th>Input</th>
              <th>Pack</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Verification</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <strong>{supplier.supplier}</strong>
                  <br />
                  <small>{supplier.town}</small>
                </td>
                <td>{supplier.phone}</td>
                <td>{supplier.item}</td>
                <td>{supplier.pack}</td>
                <td className="font-display">{kes(supplier.price)}</td>
                <td>{supplier.stock}</td>
                <td>
                  <StatusChip
                    label={supplier.verified ? "Verified" : "Check pending"}
                    tone={supplier.verified ? "low" : "medium"}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-mpesa gm-btn-sm"
                    disabled={supplier.stock < 1}
                    onClick={() => onOrder(supplier.id)}
                  >
                    <ShoppingBag /> Buy
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

function InputOrderWizard({
  supplier,
  onClose,
  onPaid,
}: {
  supplier: InputSupplierRow;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [step, setStep] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [delivery, setDelivery] = useState("Pickup in Githunguri");
  const [phone, setPhone] = useState("0712 345 678");
  const [otp, setOtp] = useState("");
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const fee = delivery === "Pickup in Githunguri" ? 0 : 350;
  const total = Number(quantity) * supplier.price + fee;
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
          M-Pesa receipt · SKM4P8R2LT
        </span>
        <h3 className="font-display mt-2">Input order confirmed</h3>
        <p>
          {quantity} × {supplier.pack} {supplier.item} reserved from{" "}
          {supplier.supplier}. Pickup reference GM-IN-260918.
        </p>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Paid from</td>
                <td>
                  <strong>{phone}</strong>
                </td>
              </tr>
              <tr>
                <td>Fulfilment</td>
                <td>
                  <strong>{delivery}</strong>
                </td>
              </tr>
              <tr>
                <td>Total</td>
                <td className="font-display">
                  <strong>{kes(total)}</strong>
                </td>
              </tr>
              <tr>
                <td>M-Pesa receipt</td>
                <td>
                  <strong>SKM4P8R2LT</strong>
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
        steps={["Input", "Delivery", "Confirm", "Wallet PIN", "Receipt"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Input">
            <input
              className="gm-input"
              value={`${supplier.item} · ${supplier.pack}`}
              readOnly
            />
          </Field>
          <Field label={`Quantity · ${supplier.stock} available`}>
            <input
              className="gm-input"
              inputMode="numeric"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <Field label="Supplier">
            <input
              className="gm-input"
              value={`${supplier.supplier} · ${supplier.town}`}
              readOnly
            />
          </Field>
          <Field label="Subtotal">
            <input
              className="gm-input font-display"
              value={kes(Number(quantity) * supplier.price)}
              readOnly
            />
          </Field>
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
              <option>Pickup in Githunguri</option>
              <option>Boda delivery · KES 350</option>
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
          <div className="full gm-plan-total">
            <div>
              <small>Order total</small>
              <strong>{kes(total)}</strong>
            </div>
            <span>{supplier.phone}</span>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-3">
          <div className="gm-plan-rec">
            <strong>Simulated phone confirmation</strong>
            <p className="mb-0 mt-1">
              Enter local simulation code <strong>517204</strong> for {phone}.
              No real SMS is sent.
            </p>
          </div>
          <div className="mt-3">
            <OtpInput
              value={otp}
              onChange={setOtp}
              label="6-digit order code"
            />
          </div>
          <button
            type="button"
            className={`gm-checkcard mt-3 ${approved ? "on" : ""}`}
            onClick={() => setApproved((value) => !value)}
          >
            <input type="checkbox" checked={approved} readOnly tabIndex={-1} />
            <span>
              <strong>Approve {kes(total)} for this crop input</strong>
              <small>
                {quantity} × {supplier.pack} · {delivery}
              </small>
            </span>
          </button>
        </div>
      ) : null}
      {step === 3 ? (
        <div className="text-center mt-3">
          <h3 className="font-display">Enter GrowMO wallet PIN</h3>
          <p>
            The simulated M-Pesa payment will be recorded against the cabbage
            crop.
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
          <p>Waiting for the simulated wallet and supplier response.</p>
        </div>
      ) : null}
      {step < 3 ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => setStep((value) => value + 1)}
          finishLabel="Continue to wallet PIN"
          nextDisabled={
            !Number(quantity) ||
            Number(quantity) > supplier.stock ||
            phone.replace(/\D/g, "").length !== 10 ||
            (step === 2 && (otp !== "517204" || !approved))
          }
        />
      ) : null}
    </div>
  );
}

function WeedManagement({ onSave }: { onSave: () => void }) {
  const [method, setMethod] = useState("Manual hoeing");
  const [date, setDate] = useState("2026-11-10");
  const [workers, setWorkers] = useState("2");
  const [cost, setCost] = useState("1000");
  const [coverage, setCoverage] = useState("100");
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Method">
          <select
            className="gm-select"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option>Manual hoeing</option>
            <option>Hand pulling near plants</option>
            <option>Mulch suppression</option>
            <option>Label-approved herbicide</option>
          </select>
        </Field>
        <Field label="Date">
          <input
            className="gm-input"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label="Workers">
          <input
            className="gm-input"
            inputMode="numeric"
            value={workers}
            onChange={(event) =>
              setWorkers(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
        </Field>
        <Field label="Actual / expected cost">
          <input
            className="gm-input"
            inputMode="numeric"
            value={cost}
            onChange={(event) =>
              setCost(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Plot coverage %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={coverage}
            onChange={(event) =>
              setCoverage(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
      </div>
      <div className="gm-plan-rec mt-3">
        <strong>Protect shallow cabbage roots</strong>
        <p className="mb-0 mt-1">
          Use shallow cultivation within rows, remove weeds before seed set and
          avoid soil movement into cabbage hearts.
        </p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={
            !method || !date || !Number(workers) || Number(coverage) > 100
          }
          onClick={onSave}
        >
          <Check /> Save weed round
        </button>
      </ModalFooter>
    </div>
  );
}

function IrrigationLog({ onSave }: { onSave: () => void }) {
  const [source, setSource] = useState("Rainfall + drip backup");
  const [rain, setRain] = useState("12");
  const [irrigation, setIrrigation] = useState("3");
  const [soil, setSoil] = useState("Moist at 10 cm");
  const [runoff, setRunoff] = useState(false);
  const total = Number(rain) + Number(irrigation);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Water source">
          <select
            className="gm-select"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option>Rainfall + drip backup</option>
            <option>Rainfall only</option>
            <option>Drip irrigation</option>
            <option>Sprinkler irrigation</option>
          </select>
        </Field>
        <Field label="Rain received · mm">
          <input
            className="gm-input"
            inputMode="decimal"
            value={rain}
            onChange={(event) =>
              setRain(event.target.value.replace(/[^\d.]/g, "").slice(0, 4))
            }
          />
        </Field>
        <Field label="Irrigation equivalent · mm">
          <input
            className="gm-input"
            inputMode="decimal"
            value={irrigation}
            onChange={(event) =>
              setIrrigation(
                event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
              )
            }
          />
        </Field>
        <Field label="Soil condition">
          <select
            className="gm-select"
            value={soil}
            onChange={(event) => setSoil(event.target.value)}
          >
            <option>Moist at 10 cm</option>
            <option>Dry at 10 cm</option>
            <option>Waterlogged</option>
            <option>Surface moist only</option>
          </select>
        </Field>
        <Toggle
          checked={runoff}
          onChange={setRunoff}
          label="Runoff or standing water observed"
          desc="Triggers a drainage review for black-rot control"
        />
      </div>
      <div className="gm-plan-total mt-3">
        <div>
          <small>Total weekly water</small>
          <strong>{total} mm</strong>
        </div>
        <div>
          <small>Vegetative target</small>
          <strong>15–20 mm</strong>
        </div>
        <StatusChip
          label={
            runoff
              ? "Drainage action needed"
              : total >= 15
                ? "Target met"
                : "Deficit"
          }
          tone={runoff ? "high" : total >= 15 ? "low" : "medium"}
        />
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!source || !soil}
          onClick={onSave}
        >
          <Droplets /> Save water record
        </button>
      </ModalFooter>
    </div>
  );
}

function SprayRecordWizard({
  onInputs,
  onDone,
}: {
  onInputs: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState("Mancozeb 80% WP");
  const [rate, setRate] = useState("50 g per 20 L");
  const [batch, setBatch] = useState("MZ-KB-2608-41");
  const [operator, setOperator] = useState("Peter Kamau");
  const [wind, setWind] = useState("8");
  const [dry, setDry] = useState(true);
  const [ppe, setPpe] = useState(true);
  const [phi, setPhi] = useState("14");
  return (
    <div>
      <Stepper
        steps={["Product", "Safety", "Traceability"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Product">
            <select
              className="gm-select"
              value={product}
              onChange={(event) => setProduct(event.target.value)}
            >
              <option>Mancozeb 80% WP</option>
              <option>Imidacloprid</option>
              <option>Duduthrin</option>
              <option>Metalaxyl + Mancozeb</option>
            </select>
          </Field>
          <Field label="Mixing rate">
            <input
              className="gm-input"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </Field>
          <Field label="Operator">
            <select
              className="gm-select"
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
            >
              <option>Peter Kamau</option>
              <option>Mary Wanjiku</option>
              <option>Licensed applicator · Githunguri</option>
            </select>
          </Field>
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onInputs}
          >
            <ShoppingBag /> Check verified input stock
          </button>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Wind speed · km/h">
            <input
              className="gm-input"
              inputMode="numeric"
              value={wind}
              onChange={(event) =>
                setWind(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <Toggle
            checked={dry}
            onChange={setDry}
            label="Leaves are dry"
            desc="Do not spray wet foliage or immediately before rain"
          />
          <Toggle
            checked={ppe}
            onChange={setPpe}
            label="Full PPE confirmed"
            desc="Gloves, mask, boots and long clothing"
          />
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Product batch">
            <input
              className="gm-input"
              value={batch}
              onChange={(event) => setBatch(event.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Pre-harvest interval · days">
            <input
              className="gm-input"
              inputMode="numeric"
              value={phi}
              onChange={(event) =>
                setPhi(event.target.value.replace(/\D/g, "").slice(0, 2))
              }
            />
          </Field>
          <div className="full gm-plan-rec">
            <StatusChip label={`${phi}-day PHI`} tone="high" />
            <p className="mb-0 mt-2">
              The crop task calendar will block harvest before the interval
              ends. Follow the product label when it differs from this record.
            </p>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onDone())}
        finishLabel="Save spray & PHI"
        nextDisabled={
          !product ||
          !rate.trim() ||
          !operator ||
          Number(wind) > 15 ||
          (step === 1 && (!dry || !ppe)) ||
          !batch.trim() ||
          !Number(phi)
        }
      />
    </div>
  );
}

function HarvestTracker({ onSave }: { onSave: () => void }) {
  const [heads, setHeads] = useState("14500");
  const [gradeA, setGradeA] = useState("70");
  const [gradeB, setGradeB] = useState("22");
  const [reject, setReject] = useState("8");
  const [price, setPrice] = useState("30");
  const [buyer, setBuyer] = useState("Marikiti wholesaler");
  const revenue = Number(heads) * Number(price);
  return (
    <div>
      <div className="gm-form-grid">
        <Field label="Predicted marketable heads">
          <input
            className="gm-input"
            inputMode="numeric"
            value={heads}
            onChange={(event) =>
              setHeads(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </Field>
        <Field label="Expected price / head">
          <input
            className="gm-input"
            inputMode="numeric"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Grade A %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={gradeA}
            onChange={(event) =>
              setGradeA(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Grade B %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={gradeB}
            onChange={(event) =>
              setGradeB(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Reject %">
          <input
            className="gm-input"
            inputMode="numeric"
            value={reject}
            onChange={(event) =>
              setReject(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Buyer route">
          <select
            className="gm-select"
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
          >
            <option>Marikiti wholesaler</option>
            <option>Githunguri Fresh Hub</option>
            <option>Twiga collection point</option>
            <option>Supermarket supply desk</option>
          </select>
        </Field>
      </div>
      <div className="gm-plan-kpi-row mt-3">
        <PlannerFact
          label="Harvest window"
          value="15–18 Jan"
          note="90 days from transplanting"
        />
        <PlannerFact
          label="Grade A"
          value={Math.round(
            (Number(heads) * Number(gradeA)) / 100,
          ).toLocaleString()}
          note={`${gradeA}% of marketable`}
        />
        <PlannerFact
          label="Rejected"
          value={Math.round(
            (Number(heads) * Number(reject)) / 100,
          ).toLocaleString()}
          note={`${reject}% quality loss`}
        />
        <PlannerFact
          label="Revenue"
          value={kes(revenue)}
          note={`${buyer} · ${kes(Number(price))}/head`}
        />
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={
            !Number(heads) ||
            !Number(price) ||
            Number(gradeA) + Number(gradeB) + Number(reject) !== 100
          }
          onClick={onSave}
        >
          <Check /> Save harvest forecast
        </button>
      </ModalFooter>
    </div>
  );
}

function PostHarvestPlan({ onSave }: { onSave: () => void }) {
  const [step, setStep] = useState(0);
  const [crate, setCrate] = useState("Ventilated reusable crates");
  const [transport, setTransport] = useState("Kamau pickup · 04:30 collection");
  const [buyer, setBuyer] = useState("Marikiti wholesaler · KES 30/head floor");
  const [checks, setChecks] = useState([true, true, false, false]);
  const toggle = (index: number) =>
    setChecks((rows) =>
      rows.map((value, rowIndex) => (rowIndex === index ? !value : value)),
    );
  return (
    <div>
      <Stepper
        steps={["Grade & pack", "Dispatch", "Readiness"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Packaging">
            <select
              className="gm-select"
              value={crate}
              onChange={(event) => setCrate(event.target.value)}
            >
              <option>Ventilated reusable crates</option>
              <option>Clean lined sacks</option>
              <option>Buyer-owned crates</option>
            </select>
          </Field>
          <div className="full gm-check-list">
            {[
              "Cut with clean knives and retain two wrapper leaves",
              "Grade by firmness, head weight and disease damage",
              "Keep filled crates in shade",
              "Record rejected heads by reason",
            ].map((item) => (
              <div key={item} className="gm-check-row">
                <Check />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Transport">
            <input
              className="gm-input"
              value={transport}
              onChange={(event) => setTransport(event.target.value)}
            />
          </Field>
          <Field label="Buyer">
            <input
              className="gm-input"
              value={buyer}
              onChange={(event) => setBuyer(event.target.value)}
            />
          </Field>
          <div className="full gm-plan-rec">
            <strong>Dispatch target</strong>
            <p className="mb-0 mt-1">
              Harvest after dew dries, shade immediately and arrive at Marikiti
              before peak unloading congestion.
            </p>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="mt-3">
          {[
            "400-crate equivalent confirmed",
            "Six-person harvest crew confirmed",
            "Pickup and driver confirmed",
            "Buyer quantity and price floor confirmed",
          ].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`gm-checkcard ${checks[index] ? "on" : ""}`}
              onClick={() => toggle(index)}
            >
              <input
                type="checkbox"
                checked={checks[index]}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{item}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave())}
        finishLabel="Save handling plan"
        nextDisabled={
          !crate ||
          !transport.trim() ||
          !buyer.trim() ||
          (step === 2 && !checks.every(Boolean))
        }
      />
    </div>
  );
}

function SensorSetup({ onSave }: { onSave: () => void }) {
  const [mode, setMode] = useState("Manual observations");
  const [depth, setDepth] = useState("10 cm root-zone check");
  const [frequency, setFrequency] = useState("Every 2 days");
  const [alerts, setAlerts] = useState(true);
  return (
    <div>
      <div className="gm-plan-summary-grid">
        {["Manual observations", "Bluetooth probe", "LoRa soil sensor"].map(
          (item) => (
            <button
              key={item}
              type="button"
              className={`gm-checkcard ${mode === item ? "on" : ""}`}
              onClick={() => setMode(item)}
            >
              <input
                type="radio"
                checked={mode === item}
                readOnly
                tabIndex={-1}
              />
              <span>
                <strong>{item}</strong>
                <small>
                  {item === "Manual observations"
                    ? "No hardware · field feel test"
                    : item === "Bluetooth probe"
                      ? "Pair during field visit"
                      : "Continuous remote readings"}
                </small>
              </span>
            </button>
          ),
        )}
      </div>
      <div className="gm-form-grid mt-3">
        <Field label="Measurement">
          <select
            className="gm-select"
            value={depth}
            onChange={(event) => setDepth(event.target.value)}
          >
            <option>10 cm root-zone check</option>
            <option>20 cm root-zone check</option>
            <option>10 cm + 20 cm profile</option>
          </select>
        </Field>
        <Field label="Frequency">
          <select
            className="gm-select"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
          >
            <option>Daily</option>
            <option>Every 2 days</option>
            <option>Twice weekly</option>
          </select>
        </Field>
        <Toggle
          checked={alerts}
          onChange={setAlerts}
          label="Water-stress reminders"
          desc="Local crop reminder when the expected root zone is dry"
        />
      </div>
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSave}>
          <Droplets /> Enable {mode.toLowerCase()}
        </button>
      </ModalFooter>
    </div>
  );
}

function GrowthPhotoWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState("Vegetative · Day 24");
  const [area, setArea] = useState("Centre bed + two edge beds");
  const [note, setNote] = useState(
    "Canopy even; record leaf colour and any black-rot lesions.",
  );
  const [captured, setCaptured] = useState(false);
  return (
    <div>
      <Stepper
        steps={["Capture", "Describe", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-upload-drop mt-3">
          <Camera width={44} height={44} />
          <h3 className="font-display">Create a local field-photo record</h3>
          <p>
            This simulation records evidence metadata without uploading a real
            file.
          </p>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={() => setCaptured(true)}
          >
            {captured ? <Check /> : <Camera />}
            {captured ? " Capture recorded" : " Simulate camera capture"}
          </button>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Growth stage">
            <input
              className="gm-input"
              value={stage}
              onChange={(event) => setStage(event.target.value)}
            />
          </Field>
          <Field label="Sample area">
            <input
              className="gm-input"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </Field>
          <Field label="Observation" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-card p-3 mt-3">
          <div className="gm-product-art">
            <Camera width={48} height={48} />
            <span className="gm-chip gm-chip-lime">GM-CAB-NEW</span>
          </div>
          <h3 className="font-display mt-3">{stage}</h3>
          <p>{note}</p>
          <small>{area} · captured by Mary</small>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onDone())}
        finishLabel="Save photo record"
        nextDisabled={
          !captured || !stage.trim() || !area.trim() || !note.trim()
        }
      />
    </div>
  );
}

function GrowthPhotoDetail({
  photo,
  onAdd,
  onClose,
}: {
  photo: GrowthPhoto;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="gm-product-art">
        <Camera width={62} height={62} />
        <span className="gm-chip gm-chip-lime">{photo.reference}</span>
      </div>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Date</td>
              <td>
                <strong>{photo.date}</strong>
              </td>
            </tr>
            <tr>
              <td>Stage</td>
              <td>
                <strong>{photo.stage}</strong>
              </td>
            </tr>
            <tr>
              <td>Status</td>
              <td>
                <StatusChip
                  label={photo.status}
                  tone={photo.status === "Logged" ? "low" : "neutral"}
                />
              </td>
            </tr>
            <tr>
              <td>Observation</td>
              <td>
                <strong>{photo.note}</strong>
              </td>
            </tr>
            <tr>
              <td>Sample</td>
              <td>
                <strong>{photo.plantsVisible}</strong>
              </td>
            </tr>
            <tr>
              <td>Captured by</td>
              <td>
                <strong>{photo.capturedBy}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onAdd}>
          <Camera /> Add next record
        </button>
      </ModalFooter>
    </div>
  );
}

function CostTracker({ onAdd }: { onAdd: () => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const rows = COST_LEDGER.filter(
    (row) =>
      `${row.description} ${row.supplier} ${row.category} ${row.method}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All" || row.category === category),
  );
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  const actual = COST_LEDGER.reduce((sum, row) => sum + row.actual, 0);
  const budget = COST_LEDGER.reduce((sum, row) => sum + row.budget, 0);
  return (
    <div>
      <div className="gm-plan-kpi-row">
        <PlannerFact
          label="Crop budget"
          value={kes(50850)}
          note="0.5-acre plan"
        />
        <PlannerFact
          label="Recorded actual"
          value={kes(actual)}
          note={`${Math.round((actual / 50850) * 100)}% used`}
        />
        <PlannerFact
          label="Scheduled ledger"
          value={kes(budget)}
          note="Recorded + planned lines"
        />
        <PlannerFact
          label="Remaining crop budget"
          value={kes(50850 - actual)}
          note="Before harvest logistics"
        />
      </div>
      <div className="gm-form-grid mt-3">
        <Field label="Search cost, supplier or reference">
          <div className="gm-search-field">
            <Search />
            <input
              className="gm-input"
              value={query}
              aria-label="Search crop costs"
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </Field>
        <Field label="Category">
          <select
            className="gm-select"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option>All</option>
            {[...new Set(COST_LEDGER.map((row) => row.category))].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </Field>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Supplier</th>
              <th>Method / reference</th>
              <th>Budget</th>
              <th>Actual</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>
                  <StatusChip label={row.category} />
                </td>
                <td>
                  <strong>{row.description}</strong>
                </td>
                <td>{row.supplier}</td>
                <td>
                  {row.method}
                  <br />
                  <small>{row.reference}</small>
                </td>
                <td className="font-display">{kes(row.budget)}</td>
                <td className="font-display">
                  {row.actual ? kes(row.actual) : "Scheduled"}
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
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-outline" onClick={onAdd}>
          <ShoppingBag /> Find verified input
        </button>
      </ModalFooter>
    </div>
  );
}

function WeatherCentre({ onReminder }: { onReminder: () => void }) {
  const [tab, setTab] = useState<"balance" | "season" | "actions">("balance");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const pages = Math.ceil(WEATHER_OVERLAY.length / perPage);
  const rows = WEATHER_OVERLAY.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <PlannerSubtabs
        value={tab}
        label="Crop weather views"
        onChange={setTab}
        items={[
          {
            id: "balance",
            label: "Water balance",
            count: WEATHER_OVERLAY.length,
          },
          {
            id: "season",
            label: "3-month outlook",
            count: CABBAGE_FORECAST.length,
          },
          { id: "actions", label: "Field actions" },
        ]}
      />
      {tab === "balance" ? (
        <div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Rain needed</th>
                  <th>Received</th>
                  <th>Forecast</th>
                  <th>Deficit / surplus</th>
                  <th>Impact</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.period}</strong>
                    </td>
                    <td>{row.needed} mm</td>
                    <td>
                      {row.received === null
                        ? "Not observed"
                        : `${row.received} mm`}
                    </td>
                    <td>
                      {row.forecast === null
                        ? "Observed period"
                        : `${row.forecast} mm`}
                    </td>
                    <td>
                      <StatusChip
                        label={
                          row.variance === null
                            ? "Pending"
                            : `${row.variance > 0 ? "+" : ""}${row.variance} mm`
                        }
                        tone={row.tone}
                      />
                    </td>
                    <td>{row.impact}</td>
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
            totalItems={WEATHER_OVERLAY.length}
          />
        </div>
      ) : null}
      {tab === "season" ? (
        <div className="gm-plan-summary-grid">
          {CABBAGE_FORECAST.map((month) => (
            <article key={month.id} className="gm-card p-3">
              <CloudRain />
              <span className="gm-eyebrow d-block mt-2">{month.month}</span>
              <h3 className="font-display">{month.rainfall}</h3>
              <p>{month.temperature}</p>
              <StatusChip label={month.outlook} tone={month.tone} />
            </article>
          ))}
        </div>
      ) : null}
      {tab === "actions" ? (
        <div className="gm-check-list">
          {[
            "Clear drainage before the wet 10–16 November window.",
            "Inspect black-rot symptoms after every two wet nights.",
            "Use drip backup if weekly total remains below 15 mm.",
            "Stop overhead irrigation and avoid moving through wet leaves.",
            "Reduce irrigation from 10 January to limit splitting.",
          ].map((action) => (
            <div key={action} className="gm-check-row">
              <Check />
              <strong>{action}</strong>
            </div>
          ))}
          <button
            type="button"
            className="gm-btn gm-btn-lime mt-3"
            onClick={onReminder}
          >
            <BellRing /> Save crop weather alert
          </button>
        </div>
      ) : null}
    </div>
  );
}

function YieldPredictor({ onSave }: { onSave: () => void }) {
  const [tab, setTab] = useState<"current" | "scenarios" | "assumptions">(
    "current",
  );
  const [heads, setHeads] = useState("14500");
  const [price, setPrice] = useState("30");
  const [loss, setLoss] = useState("8");
  const adjusted = Math.round(Number(heads) * (1 - Number(loss) / 100));
  const revenue = adjusted * Number(price);
  return (
    <div>
      <PlannerSubtabs
        value={tab}
        label="Yield prediction views"
        onChange={setTab}
        items={[
          {
            id: "current",
            label: "Current factors",
            count: YIELD_FACTORS.length,
          },
          { id: "scenarios", label: "Scenarios", count: 3 },
          { id: "assumptions", label: "Assumptions" },
        ]}
      />
      {tab === "current" ? (
        <div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Current status</th>
                  <th>Impact</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {YIELD_FACTORS.map((factor) => (
                  <tr key={factor.id}>
                    <td>
                      <strong>{factor.factor}</strong>
                    </td>
                    <td>{factor.status}</td>
                    <td>
                      <StatusChip
                        label={
                          factor.impact === null
                            ? "Baseline"
                            : `${factor.impact}%`
                        }
                        tone={factor.tone}
                      />
                    </td>
                    <td>{factor.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gm-plan-total mt-3">
            <div>
              <small>Predicted yield · 0.5 acre</small>
              <strong>14,500 heads</strong>
            </div>
            <div>
              <small>At KES 30/head</small>
              <strong>{kes(435000)}</strong>
            </div>
            <div>
              <small>Confidence</small>
              <strong>72%</strong>
            </div>
          </div>
        </div>
      ) : null}
      {tab === "scenarios" ? (
        <div className="gm-plan-scenario-grid">
          {[
            { label: "Recovery", heads: 16000, price: 34, confidence: 54 },
            { label: "Current", heads: 14500, price: 30, confidence: 72 },
            { label: "Downside", heads: 12000, price: 22, confidence: 38 },
          ].map((scenario) => (
            <article key={scenario.label} className="gm-card p-3">
              <span className="gm-eyebrow">{scenario.label}</span>
              <strong className="font-display gm-plan-fact-value">
                {scenario.heads.toLocaleString()} heads
              </strong>
              <p className="mb-1">{kes(scenario.price)}/head</p>
              <strong className="font-display">
                {kes(scenario.heads * scenario.price)}
              </strong>
              <ProgressLine
                value={scenario.confidence}
                label={`${scenario.label} confidence`}
              />
            </article>
          ))}
        </div>
      ) : null}
      {tab === "assumptions" ? (
        <div>
          <div className="gm-form-grid">
            <Field label="Field yield before grading">
              <input
                className="gm-input"
                inputMode="numeric"
                value={heads}
                onChange={(event) =>
                  setHeads(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </Field>
            <Field label="Expected price / head">
              <input
                className="gm-input"
                inputMode="numeric"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value.replace(/\D/g, "").slice(0, 3))
                }
              />
            </Field>
            <Field label="Grading / field loss %">
              <input
                className="gm-input"
                inputMode="numeric"
                value={loss}
                onChange={(event) =>
                  setLoss(event.target.value.replace(/\D/g, "").slice(0, 2))
                }
              />
            </Field>
          </div>
          <div className="gm-plan-kpi-row mt-3">
            <PlannerFact
              label="Sellable heads"
              value={adjusted.toLocaleString()}
              note={`${loss}% loss`}
            />
            <PlannerFact
              label="Projected revenue"
              value={kes(revenue)}
              note={`${kes(Number(price))}/head`}
            />
            <PlannerFact label="Budget" value={kes(50850)} note="0.5 acre" />
            <PlannerFact
              label="Projected net"
              value={kes(revenue - 50850)}
              note="Before market variance"
            />
          </div>
          <ModalFooter>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              disabled={!Number(heads) || !Number(price) || Number(loss) > 50}
              onClick={onSave}
            >
              <Check /> Save yield assumptions
            </button>
          </ModalFooter>
        </div>
      ) : null}
    </div>
  );
}

function BenchmarkCentre() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rows = BENCHMARK_ROWS.filter((row) =>
    `${row.metric} ${row.position}`.toLowerCase().includes(query.toLowerCase()),
  );
  const perPage = 5;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-4 mb-3">
        <ScoreRing score={82} size={124} />
        <div>
          <span className="gm-eyebrow">Kiambu peer position</span>
          <h3 className="font-display mt-2">
            Mary's cabbage is above county median
          </h3>
          <p className="mb-0">
            Strong survival and record completeness offset the current
            water-balance deficit.
          </p>
        </div>
      </div>
      <Field label="Search ten benchmark indicators">
        <div className="gm-search-field">
          <Search />
          <input
            className="gm-input"
            value={query}
            aria-label="Search benchmark indicators"
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
              <th>Metric</th>
              <th>Mary's farm</th>
              <th>Kiambu median</th>
              <th>Top quartile</th>
              <th>Position</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.metric}</strong>
                </td>
                <td className="font-display">{row.mary}</td>
                <td>{row.kiambuMedian}</td>
                <td>{row.topQuartile}</td>
                <td>
                  <StatusChip label={row.position} tone={row.tone} />
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

function ReportExport({
  crop,
  onExport,
}: {
  crop: ActiveCropRecord;
  onExport: () => void;
}) {
  const [tasks, setTasks] = useState(true);
  const [costs, setCosts] = useState(true);
  const [photos, setPhotos] = useState(true);
  const [weather, setWeather] = useState(true);
  const [health, setHealth] = useState(true);
  return (
    <div>
      <div className="gm-plan-summary-grid">
        <Toggle
          checked={tasks}
          onChange={setTasks}
          label="Task history"
          desc="Completed, skipped and upcoming work"
        />
        <Toggle
          checked={costs}
          onChange={setCosts}
          label="Crop costs"
          desc="Budget, actual and planned spend"
        />
        <Toggle
          checked={photos}
          onChange={setPhotos}
          label="Photo references"
          desc="Nine dated evidence records"
        />
        <Toggle
          checked={weather}
          onChange={setWeather}
          label="Weather overlay"
          desc="Water balance and crop impact"
        />
        <Toggle
          checked={health}
          onChange={setHealth}
          label="Health & yield"
          desc="Risk factors and AI prediction"
        />
      </div>
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Report preview</span>
        <h3 className="font-display mt-2">
          {crop.crop} — {crop.variety}
        </h3>
        <p>
          {crop.plot} · {crop.plantingDate} to {crop.harvestDate}
        </p>
        <div className="d-flex flex-wrap gap-2">
          {tasks ? <span className="gm-chip">Tasks</span> : null}
          {costs ? <span className="gm-chip">Costs</span> : null}
          {photos ? <span className="gm-chip">Photos</span> : null}
          {weather ? <span className="gm-chip">Weather</span> : null}
          {health ? <span className="gm-chip">Health</span> : null}
        </div>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!tasks && !costs && !photos && !weather && !health}
          onClick={onExport}
        >
          <Download /> Download crop report
        </button>
      </ModalFooter>
    </div>
  );
}

function GenericWidgetWorkflow({
  widget,
  crop,
  onSave,
}: {
  widget: CropWidgetDefinition;
  crop: ActiveCropRecord;
  onSave: () => void;
}) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("On schedule");
  const [value, setValue] = useState(widget.summary);
  const [note, setNote] = useState(
    `Reviewed ${widget.label.toLowerCase()} for ${crop.crop} at ${crop.currentStage}.`,
  );
  return (
    <div>
      <Stepper
        steps={["Current status", "Observation", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Widget">
            <input className="gm-input" value={widget.label} readOnly />
          </Field>
          <Field label="Status">
            <select
              className="gm-select"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>On schedule</option>
              <option>Needs attention</option>
              <option>Completed</option>
              <option>Not applicable this week</option>
            </select>
          </Field>
          <div className="full gm-check-row">
            <Gauge />
            <span>
              <strong>{widget.summary}</strong>
              <small>{widget.description}</small>
            </span>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Updated measurement or milestone" full>
            <input
              className="gm-input"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </Field>
          <Field label="Field note" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-card p-3 mt-3">
          <StatusChip
            label={status}
            tone={
              status === "On schedule" || status === "Completed"
                ? "low"
                : status === "Needs attention"
                  ? "high"
                  : "neutral"
            }
          />
          <h3 className="font-display mt-2">{widget.label}</h3>
          <p>
            <strong>{value}</strong>
          </p>
          <p className="mb-0">{note}</p>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step < 2 ? setStep((value) => value + 1) : onSave())}
        finishLabel="Save widget record"
        nextDisabled={!value.trim() || !note.trim()}
      />
    </div>
  );
}
