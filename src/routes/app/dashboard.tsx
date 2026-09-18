import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  BellRing,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  CloudRain,
  CloudSun,
  Coins,
  Download,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Leaf,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Sprout,
  Store,
  Timer,
  Tractor,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wheat,
  Wind,
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
  Dialog,
  PinPad,
  ScoreRing,
  Stepper,
  Toggle,
} from "../../components/auth/controls";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  ACTIVE_CROPS,
  type ActiveCrop,
  AI_INSIGHTS,
  type AiInsight,
  DASHBOARD_ACTIVITY,
  DASHBOARD_FARM,
  DASHBOARD_WEATHER,
  EXPENSE_CATEGORIES,
  FARM_TRANSACTIONS,
  type FarmTask,
  type FarmTransaction,
  FINANCIAL_METRICS,
  type HealthStatus,
  MARKET_PRICES,
  type MarketPrice,
  type PaymentStatus,
  QUICK_ACTIONS,
  type SeasonTimelineRow,
  type TaskPriority,
  TODAY_TASKS,
  UPCOMING_PAYMENTS,
  type UpcomingPayment,
} from "../../data/app/dashboard";
import { CROP_LIBRARY } from "../../data/app/onboarding";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardPage,
});

type DashboardView = "overview" | "tasks" | "money";
type DrawerId = "briefing" | "activity" | null;
type ModalId =
  | "weather"
  | "weather-alert"
  | "crop"
  | "observation"
  | "task"
  | "task-complete"
  | "task-add"
  | "finance"
  | "expense"
  | "insight"
  | "ask-ai"
  | "market"
  | "crop-add"
  | "labour-pay"
  | "analytics"
  | "payments"
  | "payment"
  | "payment-pay"
  | "timeline"
  | "customize"
  | "season-note"
  | null;

type DashboardSections = {
  weather: boolean;
  crops: boolean;
  tasks: boolean;
  finance: boolean;
  insights: boolean;
  market: boolean;
  actions: boolean;
  payments: boolean;
  timeline: boolean;
};

const DEFAULT_SECTIONS: DashboardSections = {
  weather: true,
  crops: true,
  tasks: true,
  finance: true,
  insights: true,
  market: true,
  actions: true,
  payments: true,
  timeline: true,
};

const ACTION_ICONS = {
  crop: Sprout,
  expense: Receipt,
  labour: Users,
  ai: Bot,
  analytics: BarChart3,
  market: Store,
} as const;

const INSIGHT_ICONS = {
  tip: Sparkles,
  warning: AlertTriangle,
  market: TrendingUp,
  weather: CloudRain,
  benchmark: Gauge,
} as const;

const ACTIVITY_ICONS = {
  crop: Leaf,
  money: Wallet,
  weather: CloudSun,
  task: ClipboardCheck,
} as const;

const priorityLabel: Record<TaskPriority, string> = {
  urgent: "Urgent",
  today: "Due today",
  upcoming: "Upcoming",
};

const healthLabel: Record<HealthStatus, string> = {
  healthy: "Healthy",
  attention: "Attention",
  problem: "Problem",
};

function priorityTone(priority: TaskPriority) {
  return priority === "urgent"
    ? "high"
    : priority === "today"
      ? "medium"
      : "low";
}

function healthTone(status: HealthStatus) {
  return status === "problem"
    ? "high"
    : status === "attention"
      ? "medium"
      : "low";
}

function paymentTone(status: PaymentStatus) {
  return status === "Pending"
    ? "high"
    : status === "Scheduled"
      ? "medium"
      : status === "Paid"
        ? "low"
        : "neutral";
}

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

function DashboardPage() {
  const toast = useToast();
  const [view, setView] = useState<DashboardView>("overview");
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState(false);
  const [sections, setSections] = useState<DashboardSections>(DEFAULT_SECTIONS);

  const [crops, setCrops] = useState<ActiveCrop[]>(ACTIVE_CROPS);
  const [tasks, setTasks] = useState<FarmTask[]>(TODAY_TASKS);
  const [payments, setPayments] =
    useState<UpcomingPayment[]>(UPCOMING_PAYMENTS);
  const [transactions, setTransactions] =
    useState<FarmTransaction[]>(FARM_TRANSACTIONS);

  const [selectedCropId, setSelectedCropId] = useState(
    ACTIVE_CROPS[0]?.id ?? "",
  );
  const [selectedTaskId, setSelectedTaskId] = useState(
    TODAY_TASKS[0]?.id ?? "",
  );
  const [selectedInsightId, setSelectedInsightId] = useState(
    AI_INSIGHTS[0]?.id ?? "",
  );
  const [selectedMarketId, setSelectedMarketId] = useState(
    MARKET_PRICES[0]?.id ?? "",
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(
    UPCOMING_PAYMENTS[0]?.id ?? "",
  );

  const [taskQuery, setTaskQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<"all" | TaskPriority | "done">(
    "all",
  );
  const [taskPage, setTaskPage] = useState(1);
  const [paymentQuery, setPaymentQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>(
    "all",
  );
  const [paymentPage, setPaymentPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);

  const selectedCrop =
    crops.find((crop) => crop.id === selectedCropId) ?? crops[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];
  const selectedInsight =
    AI_INSIGHTS.find((insight) => insight.id === selectedInsightId) ??
    AI_INSIGHTS[0];
  const selectedMarket =
    MARKET_PRICES.find((market) => market.id === selectedMarketId) ??
    MARKET_PRICES[0];
  const selectedPayment =
    payments.find((payment) => payment.id === selectedPaymentId) ?? payments[0];

  const filteredTasks = useMemo(() => {
    const query = taskQuery.toLowerCase().trim();
    return tasks.filter((task) => {
      const matchesQuery =
        `${task.task} ${task.crop} ${task.assigned} ${task.plot}`
          .toLowerCase()
          .includes(query);
      const matchesFilter =
        taskFilter === "all" ||
        (taskFilter === "done"
          ? task.status === "Done"
          : task.priority === taskFilter);
      return matchesQuery && matchesFilter;
    });
  }, [taskFilter, taskQuery, tasks]);

  const filteredPayments = useMemo(() => {
    const query = paymentQuery.toLowerCase().trim();
    return payments.filter(
      (payment) =>
        `${payment.payee} ${payment.purpose} ${payment.crop}`
          .toLowerCase()
          .includes(query) &&
        (paymentFilter === "all" || payment.status === paymentFilter),
    );
  }, [paymentFilter, paymentQuery, payments]);

  useEffect(() => {
    if (modal || drawer) {
      window.dispatchEvent(new Event("close-appshell-drawers"));
    }
  }, [modal, drawer]);

  const openCrop = (id: string) => {
    setSelectedCropId(id);
    setModal("crop");
  };

  const openTask = (id: string) => {
    setSelectedTaskId(id);
    setModal("task");
  };

  const openInsight = (id: string) => {
    setSelectedInsightId(id);
    setModal("insight");
  };

  const openMarket = (id: string) => {
    setSelectedMarketId(id);
    setModal("market");
  };

  const openPayment = (id: string) => {
    setSelectedPaymentId(id);
    setModal("payment");
  };

  const addRecommendedTask = (insight: AiInsight) => {
    const exists = tasks.some((task) => task.note.includes(insight.id));
    if (!exists) {
      setTasks((rows) => [
        {
          id: `task-${Date.now()}`,
          priority: insight.kind === "warning" ? "urgent" : "upcoming",
          task: insight.action,
          crop: insight.crop,
          plot: "Assigned after review",
          time: "Tomorrow 08:00",
          assigned: "Self",
          status: "Pending",
          details: insight.content,
          input: "To confirm",
          quantity: "To confirm",
          note: `AI recommendation · ${insight.id}`,
        },
        ...rows,
      ]);
    }
    setModal(null);
    toast.notify("AI recommendation added to tasks", "success");
  };

  const exportDashboard = () => {
    const rows = [
      ["GrowMO Dashboard", DASHBOARD_FARM.name],
      ["Generated", "18 Sep 2026"],
      ["Active crops", String(crops.length)],
      [
        "Open tasks",
        String(tasks.filter((task) => task.status !== "Done").length),
      ],
      ["Wallet balance", String(DASHBOARD_FARM.walletBalance)],
      ...crops.map((crop) => [
        `${crop.crop} — ${crop.variety}`,
        `${crop.plot} | ${crop.stage} | ${crop.progress}% | ${crop.expectedHarvest}`,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "growmo-dashboard-18-sep-2026.csv";
    link.click();
    URL.revokeObjectURL(url);
    setMenu(false);
    toast.notify("Dashboard report downloaded", "success");
  };

  const handleQuickAction = (id: (typeof QUICK_ACTIONS)[number]["id"]) => {
    const target: Record<(typeof QUICK_ACTIONS)[number]["id"], ModalId> = {
      crop: "crop-add",
      expense: "expense",
      labour: "labour-pay",
      ai: "ask-ai",
      analytics: "analytics",
      market: "market",
    };
    if (id === "market") setSelectedMarketId(MARKET_PRICES[0]?.id ?? "");
    setModal(target[id]);
  };

  const completeTask = (task: FarmTask) => {
    setTasks((rows) =>
      rows.map((row) =>
        row.id === task.id ? { ...row, status: "Done" } : row,
      ),
    );
    setModal(null);
    toast.notify(`${task.task} marked complete`, "success");
  };

  const markPaymentPaid = (payment: UpcomingPayment) => {
    setPayments((rows) =>
      rows.map((row) =>
        row.id === payment.id ? { ...row, status: "Paid" } : row,
      ),
    );
    setTransactions((rows) => [
      {
        id: `txn-${Date.now()}`,
        date: "18 Sep 2026",
        description: payment.purpose,
        category: "Scheduled payment",
        crop: payment.crop,
        amount: payment.amount,
        direction: "out",
        method: payment.method,
        reference: payment.reference,
      },
      ...rows,
    ]);
    toast.notify(`Payment to ${payment.payee} completed`, "success");
  };

  return (
    <div>
      <Reveal>
        <header className="gm-dash-head">
          <div className="d-flex flex-wrap align-items-start gap-3">
            <div style={{ flex: "1 1 360px" }}>
              <span className="gm-eyebrow">
                <span className="dot" /> Page 2 · Daily command centre
              </span>
              <h1 className="font-display">Habari Mary — shamba lako leo</h1>
              <p className="gm-lead">
                {DASHBOARD_FARM.name} · {DASHBOARD_FARM.subCounty},{" "}
                {DASHBOARD_FARM.county} · {DASHBOARD_FARM.season}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <button
                type="button"
                className="gm-btn gm-btn-dark gm-btn-sm"
                onClick={() => setDrawer("briefing")}
              >
                <BellRing /> Daily briefing
              </button>
              <Link
                to="/app/onboarding"
                className="gm-btn gm-btn-outline gm-btn-sm"
              >
                <User /> Farm profile
              </Link>
              <div className="gm-dropdown">
                <button
                  type="button"
                  className="gm-icon-btn"
                  aria-label="Dashboard actions"
                  aria-expanded={menu}
                  onClick={() => setMenu((open) => !open)}
                >
                  <MoreHorizontal />
                </button>
                {menu ? (
                  <div className="gm-menu">
                    <p className="gm-menuhead">Dashboard actions</p>
                    <button type="button" onClick={exportDashboard}>
                      <Download /> Export dashboard CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setModal("customize");
                      }}
                    >
                      <Settings2 /> Customize sections
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        setDrawer("activity");
                      }}
                    >
                      <Activity /> Farm activity
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenu(false);
                        window.print();
                      }}
                    >
                      <FileText /> Print farm brief
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      {menu ? (
        <button
          type="button"
          className="gm-drop-close"
          aria-label="Close dashboard actions"
          onClick={() => setMenu(false)}
        />
      ) : null}

      <div className="gm-tabs" role="tablist" aria-label="Dashboard views">
        <button
          type="button"
          role="tab"
          aria-selected={view === "overview"}
          className={`gm-tab ${view === "overview" ? "on" : ""}`}
          onClick={() => setView("overview")}
        >
          <Gauge /> Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "tasks"}
          className={`gm-tab ${view === "tasks" ? "on" : ""}`}
          onClick={() => setView("tasks")}
        >
          <ClipboardList /> Operations (
          {tasks.filter((task) => task.status !== "Done").length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "money"}
          className={`gm-tab ${view === "money" ? "on" : ""}`}
          onClick={() => setView("money")}
        >
          <Wallet /> Money (
          {payments.filter((payment) => payment.status !== "Paid").length})
        </button>
      </div>

      {view === "overview" ? (
        <OverviewDashboard
          crops={crops}
          tasks={tasks}
          payments={payments}
          sections={sections}
          onCrop={openCrop}
          onTask={openTask}
          onInsight={openInsight}
          onMarket={openMarket}
          onPayment={openPayment}
          onModal={setModal}
          onQuickAction={handleQuickAction}
          onView={setView}
        />
      ) : null}

      {view === "tasks" ? (
        <TasksView
          rows={filteredTasks}
          allRows={tasks}
          query={taskQuery}
          filter={taskFilter}
          page={taskPage}
          onQuery={(value) => {
            setTaskQuery(value);
            setTaskPage(1);
          }}
          onFilter={(value) => {
            setTaskFilter(value);
            setTaskPage(1);
          }}
          onPage={setTaskPage}
          onOpen={openTask}
          onAdd={() => setModal("task-add")}
        />
      ) : null}

      {view === "money" ? (
        <MoneyView
          payments={filteredPayments}
          allPayments={payments}
          transactions={transactions}
          query={paymentQuery}
          filter={paymentFilter}
          paymentPage={paymentPage}
          transactionPage={transactionPage}
          onQuery={(value) => {
            setPaymentQuery(value);
            setPaymentPage(1);
          }}
          onFilter={(value) => {
            setPaymentFilter(value);
            setPaymentPage(1);
          }}
          onPaymentPage={setPaymentPage}
          onTransactionPage={setTransactionPage}
          onOpenPayment={openPayment}
          onExpense={() => setModal("expense")}
          onPayments={() => setModal("payments")}
          onFinance={() => setModal("finance")}
        />
      ) : null}

      <DashboardDrawer
        open={drawer === "briefing"}
        title="Mary's daily briefing"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-block"
            onClick={() => {
              setDrawer(null);
              setModal("task-add");
            }}
          >
            <Plus /> Add a task
          </button>
        }
      >
        <FarmBriefing
          tasks={tasks}
          payments={payments}
          onWeather={() => {
            setDrawer(null);
            setModal("weather-alert");
          }}
          onTask={(id) => {
            setDrawer(null);
            openTask(id);
          }}
          onPayment={(id) => {
            setDrawer(null);
            openPayment(id);
          }}
        />
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "activity"}
        title="Farm activity"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-block"
            onClick={() => {
              setDrawer(null);
              exportDashboard();
            }}
          >
            <Download /> Export activity with dashboard
          </button>
        }
      >
        {DASHBOARD_ACTIVITY.map((entry) => {
          const Icon = ACTIVITY_ICONS[entry.kind];
          return (
            <div key={entry.id} className="gm-check-row">
              <span className="gm-mega-icon">
                <Icon />
              </span>
              <span style={{ flex: 1 }}>
                <strong>{entry.title}</strong>
                <small>
                  {entry.detail} · {entry.at}
                </small>
              </span>
            </div>
          );
        })}
      </DashboardDrawer>

      {/* 1 — detailed weather */}
      <Dialog
        open={modal === "weather"}
        onClose={() => setModal(null)}
        title="Githunguri weather desk"
        desc="Hourly field conditions and the full 7-day action forecast."
        wide
      >
        <WeatherDetails onAlert={() => setModal("weather-alert")} />
      </Dialog>

      {/* 2 — weather risk workflow */}
      <Dialog
        open={modal === "weather-alert"}
        onClose={() => setModal(null)}
        title="Cabbage black-rot alert"
        desc="High humidity + rain · recommended action within 48 hours."
      >
        <WeatherAlert
          onClose={() => setModal(null)}
          onTask={() => {
            const exists = tasks.some(
              (task) => task.id === "task-weather-risk",
            );
            if (!exists) {
              setTasks((rows) => [
                {
                  id: "task-weather-risk",
                  priority: "urgent",
                  task: "Protect cabbage from black rot",
                  crop: "Cabbage · Gloria F1",
                  plot: "Plot 1",
                  time: "Tomorrow 10:00",
                  assigned: "John Mwangi",
                  status: "Scheduled",
                  details: DASHBOARD_WEATHER.alert,
                  input: "Mancozeb 80% WP",
                  quantity: "50 g per 20 L · 4 knapsacks",
                  note: "Created from weather risk engine.",
                },
                ...rows,
              ]);
            }
            setModal(null);
            toast.notify(
              "Weather action added to tomorrow's schedule",
              "success",
            );
          }}
        />
      </Dialog>

      {/* 3 — crop detail */}
      <Dialog
        open={modal === "crop"}
        onClose={() => setModal(null)}
        title={
          selectedCrop
            ? `${selectedCrop.crop} — ${selectedCrop.variety}`
            : "Crop detail"
        }
        desc={selectedCrop?.plot}
        wide
      >
        {selectedCrop ? (
          <CropDetail
            crop={selectedCrop}
            onObservation={() => setModal("observation")}
            onTask={() => {
              setModal("task-add");
            }}
          />
        ) : null}
      </Dialog>

      {/* 4 — field observation */}
      <Dialog
        open={modal === "observation"}
        onClose={() => setModal(null)}
        title="Log field observation"
        desc={
          selectedCrop
            ? `${selectedCrop.crop} · ${selectedCrop.plot}`
            : undefined
        }
      >
        {selectedCrop ? (
          <ObservationForm
            crop={selectedCrop}
            onCancel={() => setModal("crop")}
            onSave={(status) => {
              setCrops((rows) =>
                rows.map((row) =>
                  row.id === selectedCrop.id ? { ...row, status } : row,
                ),
              );
              setModal(null);
              toast.notify("Field observation saved", "success");
            }}
          />
        ) : null}
      </Dialog>

      {/* 5 — task detail */}
      <Dialog
        open={modal === "task"}
        onClose={() => setModal(null)}
        title={selectedTask?.task ?? "Task detail"}
        desc={
          selectedTask
            ? `${selectedTask.crop} · ${selectedTask.plot}`
            : undefined
        }
        wide
      >
        {selectedTask ? (
          <TaskDetail
            task={selectedTask}
            onClose={() => setModal(null)}
            onComplete={() => setModal("task-complete")}
            onPay={() => {
              const labour = payments.find(
                (payment) => payment.id === "pay-01",
              );
              if (labour) setSelectedPaymentId(labour.id);
              setModal("payment-pay");
            }}
          />
        ) : null}
      </Dialog>

      {/* 6 — task completion wizard */}
      <Dialog
        open={modal === "task-complete"}
        onClose={() => setModal(null)}
        title="Complete task"
        desc={selectedTask?.task}
        wide
      >
        {selectedTask ? (
          <TaskCompletionWizard
            task={selectedTask}
            onDone={() => completeTask(selectedTask)}
          />
        ) : null}
      </Dialog>

      {/* 7 — add task wizard */}
      <Dialog
        open={modal === "task-add"}
        onClose={() => setModal(null)}
        title="Add farm task"
        desc="Plan the work, assign it, then review the field instructions."
        wide
      >
        <NewTaskWizard
          crops={crops}
          onSave={(task) => {
            setTasks((rows) => [task, ...rows]);
            setModal(null);
            toast.notify("Task added to the farm schedule", "success");
          }}
        />
      </Dialog>

      {/* 8 — finance centre */}
      <Dialog
        open={modal === "finance"}
        onClose={() => setModal(null)}
        title="Cabbage financial snapshot"
        desc="Budget, transactions and harvest forecast for Plot 1."
        wide
      >
        <FinanceCentre
          transactions={transactions}
          onExpense={() => setModal("expense")}
        />
      </Dialog>

      {/* 9 — expense wizard */}
      <Dialog
        open={modal === "expense"}
        onClose={() => setModal(null)}
        title="Record farm expense"
        desc="Categorise the payment and attach it to the right crop budget."
        wide
      >
        <ExpenseWizard
          crops={crops}
          onDone={(expense) => {
            setTransactions((rows) => [expense, ...rows]);
            setModal(null);
            toast.notify("Expense recorded and budget updated", "success");
          }}
        />
      </Dialog>

      {/* 10 — insight detail */}
      <Dialog
        open={modal === "insight"}
        onClose={() => setModal(null)}
        title={selectedInsight?.title ?? "AI insight"}
        desc={
          selectedInsight
            ? `${selectedInsight.crop} · ${selectedInsight.confidence}% confidence`
            : undefined
        }
      >
        {selectedInsight ? (
          <InsightDetail
            insight={selectedInsight}
            onTask={() => addRecommendedTask(selectedInsight)}
            onAsk={() => setModal("ask-ai")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 11 — AI advisor wizard */}
      <Dialog
        open={modal === "ask-ai"}
        onClose={() => setModal(null)}
        title="Ask GrowMO AI"
        desc="Choose context, ask a real farm question, then review the action plan."
        wide
      >
        <AiAdvisorWizard
          crops={crops}
          onAddTask={(title, crop) => {
            setTasks((rows) => [
              {
                id: `task-${Date.now()}`,
                priority: "today",
                task: title,
                crop,
                plot: "Confirm during assignment",
                time: "Tomorrow 08:00",
                assigned: "Self",
                status: "Pending",
                details:
                  "Action generated from the GrowMO AI advisory workflow.",
                input: "Confirm after field check",
                quantity: "As recommended",
                note: "Created by GrowMO AI.",
              },
              ...rows,
            ]);
            setModal(null);
            toast.notify("AI action added to farm tasks", "success");
          }}
        />
      </Dialog>

      {/* 12 — market centre */}
      <Dialog
        open={modal === "market"}
        onClose={() => setModal(null)}
        title="Live market comparison"
        desc={
          selectedMarket
            ? `${selectedMarket.crop} · ${selectedMarket.variety}`
            : "10 Kenyan market records"
        }
        wide
      >
        <MarketCentre
          initialCrop={selectedMarket?.crop ?? "All"}
          onSave={(market) => {
            setSelectedMarketId(market.id);
            setModal(null);
            toast.notify(`${market.market} added to your watchlist`, "success");
          }}
        />
      </Dialog>

      {/* 13 — add crop wizard */}
      <Dialog
        open={modal === "crop-add"}
        onClose={() => setModal(null)}
        title="Add a new crop"
        desc="A complete 4-step crop setup — crop, plot, season and budget."
        wide
      >
        <NewCropWizard
          onSave={(crop) => {
            setCrops((rows) => [crop, ...rows]);
            setSelectedCropId(crop.id);
            setModal(null);
            toast.notify(`${crop.crop} crop plan created`, "success");
          }}
        />
      </Dialog>

      {/* 14 — pay labour wizard */}
      <Dialog
        open={modal === "labour-pay"}
        onClose={() => setModal(null)}
        title="Pay farm labour"
        desc="Approve work, confirm M-Pesa recipient and authorize with your wallet PIN."
        wide
        dismissable
      >
        <MpesaPaymentWizard
          payee="John Mwangi"
          phone="0718 442 106"
          purpose="Cabbage and maize field labour"
          amount={500}
          onPaid={() => {
            const labour = payments.find((payment) => payment.id === "pay-01");
            if (labour) markPaymentPaid(labour);
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      {/* 15 — analytics */}
      <Dialog
        open={modal === "analytics"}
        onClose={() => setModal(null)}
        title="Farm analytics"
        desc="Yield, cost and Kiambu benchmark views — no disconnected report links."
        wide
      >
        <AnalyticsCentre crops={crops} />
      </Dialog>

      {/* 16 — payments centre */}
      <Dialog
        open={modal === "payments"}
        onClose={() => setModal(null)}
        title="Upcoming payments"
        desc="Ten scheduled obligations across labour, inputs, utilities and finance."
        wide
      >
        <PaymentsCentre
          payments={payments}
          onOpen={(id) => {
            setSelectedPaymentId(id);
            setModal("payment");
          }}
        />
      </Dialog>

      {/* 17 — payment detail */}
      <Dialog
        open={modal === "payment"}
        onClose={() => setModal(null)}
        title={selectedPayment?.payee ?? "Payment detail"}
        desc={selectedPayment?.reference}
      >
        {selectedPayment ? (
          <PaymentDetail
            payment={selectedPayment}
            onClose={() => setModal(null)}
            onPay={() => setModal("payment-pay")}
          />
        ) : null}
      </Dialog>

      {/* 18 — M-Pesa payment confirmation */}
      <Dialog
        open={modal === "payment-pay"}
        onClose={() => setModal(null)}
        title="Confirm M-Pesa payment"
        desc={
          selectedPayment
            ? `${selectedPayment.payee} · ${selectedPayment.reference}`
            : undefined
        }
        dismissable
      >
        {selectedPayment ? (
          <MpesaPaymentWizard
            payee={selectedPayment.payee}
            phone={selectedPayment.phone}
            purpose={selectedPayment.purpose}
            amount={selectedPayment.amount}
            onPaid={() => markPaymentPaid(selectedPayment)}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      {/* 19 — seasonal timeline */}
      <Dialog
        open={modal === "timeline"}
        onClose={() => setModal(null)}
        title="Seasonal crop timeline"
        desc="All 10 crops from current phase to expected harvest."
        wide
      >
        <TimelineCentre
          rows={crops.map((crop) => ({
            id: crop.id,
            crop: crop.crop,
            variety: crop.variety,
            plot: crop.plot,
            start: crop.planted,
            harvest: crop.expectedHarvest,
            phase: crop.stage,
            progress: crop.progress,
            nextMilestone: crop.nextTask,
          }))}
          onNote={() => setModal("season-note")}
        />
      </Dialog>

      {/* 20 — customize dashboard */}
      <Dialog
        open={modal === "customize"}
        onClose={() => setModal(null)}
        title="Customize dashboard"
        desc="Choose what appears in the Overview. You can restore everything any time."
        wide
      >
        <CustomizeDashboard
          value={sections}
          onSave={(next) => {
            setSections(next);
            setModal(null);
            toast.notify("Dashboard layout updated", "success");
          }}
        />
      </Dialog>

      {/* 21 — seasonal note */}
      <Dialog
        open={modal === "season-note"}
        onClose={() => setModal(null)}
        title="Add seasonal note"
        desc="Save a dated milestone against the farm timeline."
      >
        <SeasonNoteForm
          crops={crops}
          onSave={() => {
            setModal(null);
            toast.notify("Season note added to the crop timeline", "success");
          }}
        />
      </Dialog>
    </div>
  );
}

function OverviewDashboard({
  crops,
  tasks,
  payments,
  sections,
  onCrop,
  onTask,
  onInsight,
  onMarket,
  onPayment,
  onModal,
  onQuickAction,
  onView,
}: {
  crops: ActiveCrop[];
  tasks: FarmTask[];
  payments: UpcomingPayment[];
  sections: DashboardSections;
  onCrop: (id: string) => void;
  onTask: (id: string) => void;
  onInsight: (id: string) => void;
  onMarket: (id: string) => void;
  onPayment: (id: string) => void;
  onModal: (id: ModalId) => void;
  onQuickAction: (id: (typeof QUICK_ACTIONS)[number]["id"]) => void;
  onView: (view: DashboardView) => void;
}) {
  const openTasks = tasks.filter((task) => task.status !== "Done");
  const unpaid = payments.filter((payment) => payment.status !== "Paid");

  return (
    <div>
      {/* Section 2.1 is the page header + global AppShell header above. */}

      {/* Section 2.2: Weather hero */}
      {sections.weather ? (
        <Reveal>
          <section
            className="gm-card p-3 p-md-4"
            aria-labelledby="weather-heading"
            style={{
              background: "var(--gm-grad-deep)",
              color: "var(--gm-card)",
            }}
          >
            <div className="d-flex flex-wrap gap-4 align-items-center">
              <div style={{ flex: "1 1 270px" }}>
                <span className="gm-eyebrow on-dark">
                  <span className="dot" /> {DASHBOARD_WEATHER.updated}
                </span>
                <div className="d-flex align-items-center gap-3 mt-2">
                  <CloudRain width={58} height={58} />
                  <div>
                    <strong
                      className="font-display"
                      style={{
                        display: "block",
                        fontSize: "2.7rem",
                        lineHeight: 1,
                      }}
                    >
                      {DASHBOARD_WEATHER.currentTemp}°C
                    </strong>
                    <small>Feels like {DASHBOARD_WEATHER.feelsLike}°C</small>
                  </div>
                </div>
                <h2 id="weather-heading" className="font-display mt-3 mb-1">
                  {DASHBOARD_WEATHER.location}
                </h2>
                <p className="gm-lead on-dark mb-2">
                  {DASHBOARD_WEATHER.summary}
                </p>
                <span className="gm-chip gm-chip-lime">
                  {DASHBOARD_WEATHER.seasonalStatus}
                </span>
              </div>

              <div className="gm-form-grid cols3" style={{ flex: "1 1 390px" }}>
                <WeatherDatum
                  icon={Droplets}
                  label="Humidity"
                  value={`${DASHBOARD_WEATHER.humidity}%`}
                />
                <WeatherDatum
                  icon={Wind}
                  label="Wind"
                  value={DASHBOARD_WEATHER.wind}
                />
                <WeatherDatum
                  icon={CloudRain}
                  label="Rain · 24h"
                  value={`${DASHBOARD_WEATHER.rainfall24h} mm`}
                />
                <WeatherDatum
                  icon={Gauge}
                  label="Rain today"
                  value={`${DASHBOARD_WEATHER.rainProbability}%`}
                />
                {DASHBOARD_WEATHER.forecast.slice(0, 3).map((forecast) => (
                  <WeatherDatum
                    key={forecast.day}
                    icon={
                      forecast.condition.includes("Rain") ||
                      forecast.condition.includes("Showers")
                        ? CloudRain
                        : CloudSun
                    }
                    label={forecast.day}
                    value={`${forecast.high}° / ${forecast.low}°`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className="gm-check-row mt-3"
              onClick={() => onModal("weather-alert")}
            >
              <span className="gm-mega-icon">
                <AlertTriangle />
              </span>
              <span style={{ flex: 1 }}>
                <strong>Crop-specific alert · Cabbage</strong>
                <small>{DASHBOARD_WEATHER.alert}</small>
              </span>
              <ArrowRight />
            </button>

            <div className="d-flex justify-content-end mt-3">
              <button
                type="button"
                className="gm-btn gm-btn-ghost gm-btn-sm"
                onClick={() => onModal("weather")}
              >
                Full 7-day field forecast <ArrowRight />
              </button>
            </div>
          </section>
        </Reveal>
      ) : null}

      {/* Section 2.3: Active crops carousel */}
      {sections.crops ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="10 crop records"
            title="Active crops"
            subtitle="Scroll across your plots; open any crop for stage, inputs and observations."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm"
                onClick={() => onModal("crop-add")}
              >
                <Plus /> Add crop
              </button>
            }
          />
          <div className="d-flex gap-3 overflow-auto pb-2">
            {crops.map((crop) => (
              <article
                key={crop.id}
                className="gm-card p-3"
                style={{ flex: "0 0 292px" }}
              >
                <div className="d-flex align-items-start gap-2">
                  <span className="font-display" style={{ fontSize: "1.8rem" }}>
                    {crop.symbol}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>
                      {crop.crop} — {crop.variety}
                    </strong>
                    <small className="d-block text-muted">{crop.plot}</small>
                  </div>
                  <StatusChip
                    label={healthLabel[crop.status]}
                    tone={healthTone(crop.status)}
                  />
                </div>
                <div className="d-flex justify-content-between mt-3 mb-1">
                  <small>{crop.stage}</small>
                  <small className="font-display">
                    Day {crop.day}/{crop.totalDays}
                  </small>
                </div>
                <ProgressLine
                  value={crop.progress}
                  label={`${crop.crop} season progress`}
                />
                <div className="gm-check-row mb-2">
                  <span style={{ flex: 1 }}>
                    <strong>Next: {crop.nextTask}</strong>
                    <small>{crop.nextDue}</small>
                  </span>
                </div>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm gm-btn-block"
                  onClick={() => onCrop(crop.id)}
                >
                  View crop details <ArrowRight />
                </button>
              </article>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Sections 2.4 + 2.5 */}
      <div className="gm-split mt-4">
        {sections.tasks ? (
          <Reveal variant="left">
            <section className="gm-card p-3 h-100">
              <DashboardSectionHeader
                eyebrow={`${openTasks.length} open`}
                title="Today's tasks"
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onView("tasks")}
                  >
                    All tasks
                  </button>
                }
              />
              {openTasks.slice(0, 5).map((task) => (
                <button
                  key={task.id}
                  type="button"
                  className="gm-check-row"
                  onClick={() => onTask(task.id)}
                >
                  <StatusChip
                    label={priorityLabel[task.priority]}
                    tone={priorityTone(task.priority)}
                  />
                  <span style={{ flex: 1 }}>
                    <strong>{task.task}</strong>
                    <small>
                      {task.crop} · {task.time} · {task.assigned}
                    </small>
                  </span>
                  <ArrowRight />
                </button>
              ))}
              <button
                type="button"
                className="gm-btn gm-btn-lime gm-btn-sm mt-2"
                onClick={() => onModal("task-add")}
              >
                <Plus /> Add task
              </button>
            </section>
          </Reveal>
        ) : null}

        {sections.finance ? (
          <Reveal variant="right">
            <section className="gm-card p-3 h-100">
              <DashboardSectionHeader
                eyebrow="Cabbage · Plot 1"
                title="Financial snapshot"
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onModal("finance")}
                  >
                    Details
                  </button>
                }
              />
              <div className="d-flex flex-wrap align-items-center gap-3">
                <ScoreRing score={39} size={114} />
                <div style={{ flex: "1 1 220px" }}>
                  {FINANCIAL_METRICS.map((metric) => (
                    <div
                      key={metric.id}
                      className="d-flex justify-content-between gap-2 py-1"
                    >
                      <small>{metric.label}</small>
                      <strong className="font-display">
                        {kes(metric.value)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => onModal("expense")}
                >
                  <Receipt /> Record expense
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onView("money")}
                >
                  Money view <ArrowRight />
                </button>
              </div>
            </section>
          </Reveal>
        ) : null}
      </div>

      {/* Section 2.6: AI strip */}
      {sections.insights ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="GrowMO Intelligence"
            title="AI insights"
            subtitle="Recommendations combine your crop stages, Kiambu weather and market data."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-dark gm-btn-sm"
                onClick={() => onModal("ask-ai")}
              >
                <Bot /> Ask AI
              </button>
            }
          />
          <div className="d-flex gap-3 overflow-auto pb-2">
            {AI_INSIGHTS.map((insight) => {
              const Icon = INSIGHT_ICONS[insight.kind];
              return (
                <button
                  key={insight.id}
                  type="button"
                  className="gm-card p-3 text-start"
                  style={{ flex: "0 0 285px" }}
                  onClick={() => onInsight(insight.id)}
                >
                  <span className="gm-mega-icon mb-2">
                    <Icon />
                  </span>
                  <strong className="d-block">{insight.title}</strong>
                  <small className="d-block text-muted mt-1">
                    {insight.content}
                  </small>
                  <span className="gm-chip mt-2">
                    {insight.confidence}% confidence
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>
      ) : null}

      {/* Section 2.7: Market ticker */}
      {sections.market ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="Updated this morning"
            title="Market ticker"
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("market")}
              >
                Compare all 10
              </button>
            }
          />
          <div className="d-flex gap-2 overflow-auto pb-2">
            {MARKET_PRICES.map((market) => (
              <button
                key={market.id}
                type="button"
                className="gm-card p-3 text-start"
                style={{ flex: "0 0 220px" }}
                onClick={() => onMarket(market.id)}
              >
                <small className="gm-eyebrow">{market.market}</small>
                <strong className="d-block mt-1">{market.crop}</strong>
                <span
                  className="font-display d-block"
                  style={{ fontSize: "1.2rem" }}
                >
                  {kes(market.price)}/{market.unit}
                </span>
                <StatusChip
                  label={
                    market.trend === "up"
                      ? `↑ +${kes(market.change)}`
                      : market.trend === "down"
                        ? `↓ ${kes(market.change)}`
                        : "→ No change"
                  }
                  tone={
                    market.trend === "up"
                      ? "low"
                      : market.trend === "down"
                        ? "high"
                        : "neutral"
                  }
                />
              </button>
            ))}
          </div>
        </Reveal>
      ) : null}

      {/* Sections 2.8 + 2.9 */}
      <div className="gm-split mt-4">
        {sections.actions ? (
          <Reveal variant="left">
            <section className="gm-card p-3 h-100">
              <DashboardSectionHeader
                eyebrow="No dead ends"
                title="Quick actions"
                subtitle="Each action opens a complete workflow here."
              />
              <div className="gm-module-grid">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = ACTION_ICONS[action.id];
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className="gm-module"
                      onClick={() => onQuickAction(action.id)}
                    >
                      <span className="gm-mega-icon">
                        <Icon />
                      </span>
                      <strong>{action.label}</strong>
                      <small>{action.note}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          </Reveal>
        ) : null}

        {sections.payments ? (
          <Reveal variant="right">
            <section className="gm-card p-3 h-100">
              <DashboardSectionHeader
                eyebrow={`${unpaid.length} obligations`}
                title="Upcoming payments"
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => onModal("payments")}
                  >
                    View all
                  </button>
                }
              />
              {unpaid.slice(0, 4).map((payment) => (
                <button
                  key={payment.id}
                  type="button"
                  className="gm-check-row"
                  onClick={() => onPayment(payment.id)}
                >
                  <span className="gm-mega-icon">
                    <Banknote />
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong>{payment.payee}</strong>
                    <small>
                      {payment.purpose} · {payment.due}
                    </small>
                  </span>
                  <span className="font-display">{kes(payment.amount)}</span>
                </button>
              ))}
              <button
                type="button"
                className="gm-btn gm-btn-mpesa gm-btn-sm mt-2"
                onClick={() => onQuickAction("labour")}
              >
                <Wallet /> Pay labour via M-Pesa
              </button>
            </section>
          </Reveal>
        ) : null}
      </div>

      {/* Section 2.10: Mini Gantt */}
      {sections.timeline ? (
        <Reveal>
          <DashboardSectionHeader
            eyebrow="Sep 2026 — Jan 2027"
            title="Seasonal timeline"
            subtitle="Mini Gantt of active crops and their current growth phase."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={() => onModal("timeline")}
              >
                Full timeline
              </button>
            }
          />
          <section className="gm-card p-3">
            <div className="d-flex justify-content-between text-muted mb-2">
              <small>Sep</small>
              <small>Oct</small>
              <small>Nov</small>
              <small>Dec</small>
              <small>Jan</small>
            </div>
            {crops.slice(0, 6).map((crop) => (
              <button
                key={crop.id}
                type="button"
                className="gm-check-row"
                onClick={() => onCrop(crop.id)}
              >
                <span style={{ flex: "0 0 150px" }}>
                  <strong>{crop.crop}</strong>
                  <small>{crop.stage}</small>
                </span>
                <span style={{ flex: 1 }}>
                  <ProgressLine
                    value={crop.progress}
                    label={`${crop.crop} timeline progress`}
                  />
                </span>
                <small>{crop.expectedHarvest}</small>
              </button>
            ))}
          </section>
        </Reveal>
      ) : null}
    </div>
  );
}

function WeatherDatum({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CloudSun;
  label: string;
  value: string;
}) {
  return (
    <div className="gm-check-row">
      <Icon />
      <span>
        <small>{label}</small>
        <strong className="d-block font-display">{value}</strong>
      </span>
    </div>
  );
}

function TasksView({
  rows,
  allRows,
  query,
  filter,
  page,
  onQuery,
  onFilter,
  onPage,
  onOpen,
  onAdd,
}: {
  rows: FarmTask[];
  allRows: FarmTask[];
  query: string;
  filter: "all" | TaskPriority | "done";
  page: number;
  onQuery: (value: string) => void;
  onFilter: (value: "all" | TaskPriority | "done") => void;
  onPage: (page: number) => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
}) {
  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  const filters: { id: "all" | TaskPriority | "done"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "urgent", label: "Urgent" },
    { id: "today", label: "Due today" },
    { id: "upcoming", label: "Upcoming" },
    { id: "done", label: "Done" },
  ];

  return (
    <Reveal>
      <DashboardSectionHeader
        eyebrow={`${allRows.length} task records`}
        title="Operations board"
        subtitle="Search, filter and open every task for instructions, quantities and completion evidence."
        action={
          <button type="button" className="gm-btn gm-btn-lime" onClick={onAdd}>
            <Plus /> Add task
          </button>
        }
      />
      <section className="gm-card p-3">
        <div className="gm-form-grid mb-2">
          <Field label="Search tasks" full>
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Search task, crop, plot or assignee"
              />
            </div>
          </Field>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`gm-filter-chip ${filter === item.id ? "is-active" : ""}`}
              onClick={() => onFilter(item.id)}
            >
              {item.label}
              <span className="gm-n">
                {item.id === "all"
                  ? allRows.length
                  : item.id === "done"
                    ? allRows.filter((task) => task.status === "Done").length
                    : allRows.filter((task) => task.priority === item.id)
                        .length}
              </span>
            </button>
          ))}
        </div>
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Task</th>
                <th>Crop / plot</th>
                <th>Time</th>
                <th>Assigned</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((task) => (
                <tr key={task.id}>
                  <td>
                    <StatusChip
                      label={priorityLabel[task.priority]}
                      tone={priorityTone(task.priority)}
                    />
                  </td>
                  <td>
                    <strong>{task.task}</strong>
                  </td>
                  <td>
                    {task.crop}
                    <br />
                    <small>{task.plot}</small>
                  </td>
                  <td>{task.time}</td>
                  <td>{task.assigned}</td>
                  <td>
                    <StatusChip
                      label={task.status}
                      tone={
                        task.status === "Done"
                          ? "low"
                          : task.status === "Unpaid"
                            ? "high"
                            : "medium"
                      }
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
                  <td colSpan={7}>No tasks match this search and filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination
          page={Math.min(page, totalPages)}
          total={totalPages}
          onChange={onPage}
          perPage={perPage}
          totalItems={rows.length}
        />
      </section>
    </Reveal>
  );
}

function MoneyView({
  payments,
  allPayments,
  transactions,
  query,
  filter,
  paymentPage,
  transactionPage,
  onQuery,
  onFilter,
  onPaymentPage,
  onTransactionPage,
  onOpenPayment,
  onExpense,
  onPayments,
  onFinance,
}: {
  payments: UpcomingPayment[];
  allPayments: UpcomingPayment[];
  transactions: FarmTransaction[];
  query: string;
  filter: "all" | PaymentStatus;
  paymentPage: number;
  transactionPage: number;
  onQuery: (value: string) => void;
  onFilter: (value: "all" | PaymentStatus) => void;
  onPaymentPage: (page: number) => void;
  onTransactionPage: (page: number) => void;
  onOpenPayment: (id: string) => void;
  onExpense: () => void;
  onPayments: () => void;
  onFinance: () => void;
}) {
  const paymentPerPage = 5;
  const transactionPerPage = 5;
  const paymentPages = Math.max(1, Math.ceil(payments.length / paymentPerPage));
  const transactionPages = Math.max(
    1,
    Math.ceil(transactions.length / transactionPerPage),
  );
  const visiblePayments = payments.slice(
    (paymentPage - 1) * paymentPerPage,
    paymentPage * paymentPerPage,
  );
  const visibleTransactions = transactions.slice(
    (transactionPage - 1) * transactionPerPage,
    transactionPage * transactionPerPage,
  );
  const paymentFilters: ("all" | PaymentStatus)[] = [
    "all",
    "Scheduled",
    "Pending",
    "Future",
    "Paid",
  ];

  return (
    <div>
      <Reveal>
        <DashboardSectionHeader
          eyebrow="KES overview"
          title="Money command centre"
          subtitle="Cabbage budget, ten obligations and a complete transaction ledger."
          action={
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={onExpense}
              >
                <Receipt /> Record expense
              </button>
              <button
                type="button"
                className="gm-btn gm-btn-outline"
                onClick={onFinance}
              >
                <BarChart3 /> Budget detail
              </button>
            </div>
          }
        />
        <div className="gm-stat-grid">
          {FINANCIAL_METRICS.map((metric) => (
            <DashboardMetric
              key={metric.id}
              icon={
                metric.id === "wallet"
                  ? Wallet
                  : metric.id === "profit"
                    ? TrendingUp
                    : Coins
              }
              label={metric.label}
              value={kes(metric.value)}
              note={metric.note}
            />
          ))}
        </div>
      </Reveal>

      <Reveal>
        <DashboardSectionHeader
          eyebrow={`${allPayments.length} records`}
          title="Payment obligations"
          action={
            <button
              type="button"
              className="gm-btn gm-btn-soft gm-btn-sm"
              onClick={onPayments}
            >
              Open payment centre
            </button>
          }
        />
        <section className="gm-card p-3">
          <Field label="Search payment records">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Search payee, purpose or crop"
              />
            </div>
          </Field>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {paymentFilters.map((item) => (
              <button
                key={item}
                type="button"
                className={`gm-filter-chip ${filter === item ? "is-active" : ""}`}
                onClick={() => onFilter(item)}
              >
                {item === "all" ? "All" : item}
                <span className="gm-n">
                  {item === "all"
                    ? allPayments.length
                    : allPayments.filter((payment) => payment.status === item)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <PaymentsTable rows={visiblePayments} onOpen={onOpenPayment} />
          <Pagination
            page={Math.min(paymentPage, paymentPages)}
            total={paymentPages}
            onChange={onPaymentPage}
            perPage={paymentPerPage}
            totalItems={payments.length}
          />
        </section>
      </Reveal>

      <Reveal>
        <DashboardSectionHeader
          eyebrow={`${transactions.length} ledger entries`}
          title="Recent transactions"
        />
        <section className="gm-card p-3">
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Crop</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>
                      <strong>{transaction.description}</strong>
                    </td>
                    <td>{transaction.category}</td>
                    <td>{transaction.crop}</td>
                    <td>{transaction.method}</td>
                    <td>{transaction.reference}</td>
                    <td className="font-display">
                      {transaction.direction === "in" ? "+" : "−"}
                      {kes(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={transactionPage}
            total={transactionPages}
            onChange={onTransactionPage}
            perPage={transactionPerPage}
            totalItems={transactions.length}
          />
        </section>
      </Reveal>
    </div>
  );
}

function PaymentsTable({
  rows,
  onOpen,
}: {
  rows: UpcomingPayment[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="gm-table-wrap">
      <table className="gm-table">
        <thead>
          <tr>
            <th>Pay to</th>
            <th>Purpose</th>
            <th>Crop</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((payment) => (
            <tr key={payment.id}>
              <td>
                <strong>{payment.payee}</strong>
                <br />
                <small>{payment.phone}</small>
              </td>
              <td>{payment.purpose}</td>
              <td>{payment.crop}</td>
              <td className="font-display">{kes(payment.amount)}</td>
              <td>{payment.due}</td>
              <td>
                <StatusChip
                  label={payment.status}
                  tone={paymentTone(payment.status)}
                />
              </td>
              <td>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={() => onOpen(payment.id)}
                >
                  <Eye /> Open
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7}>No payments match this search and filter.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function FarmBriefing({
  tasks,
  payments,
  onWeather,
  onTask,
  onPayment,
}: {
  tasks: FarmTask[];
  payments: UpcomingPayment[];
  onWeather: () => void;
  onTask: (id: string) => void;
  onPayment: (id: string) => void;
}) {
  return (
    <div>
      <span className="gm-eyebrow">
        <span className="dot" /> Friday, 18 September
      </span>
      <h2 className="font-display mt-2">Start with these three things</h2>
      <button type="button" className="gm-option-row" onClick={onWeather}>
        <span className="gm-mega-icon">
          <CloudRain />
        </span>
        <span style={{ flex: 1 }}>
          <strong>Protect cabbage before the next wet night</strong>
          <small>{DASHBOARD_WEATHER.alert}</small>
        </span>
        <ArrowRight />
      </button>
      {tasks
        .filter((task) => task.priority === "urgent" && task.status !== "Done")
        .slice(0, 2)
        .map((task) => (
          <button
            key={task.id}
            type="button"
            className="gm-option-row"
            onClick={() => onTask(task.id)}
          >
            <span className="gm-mega-icon">
              <ClipboardList />
            </span>
            <span style={{ flex: 1 }}>
              <strong>{task.task}</strong>
              <small>
                {task.time} · {task.assigned}
              </small>
            </span>
            <ArrowRight />
          </button>
        ))}
      <h3 className="font-display mt-4">Money due</h3>
      {payments
        .filter(
          (payment) => payment.due === "Today" && payment.status !== "Paid",
        )
        .map((payment) => (
          <button
            key={payment.id}
            type="button"
            className="gm-option-row"
            onClick={() => onPayment(payment.id)}
          >
            <span className="gm-mega-icon">
              <Wallet />
            </span>
            <span style={{ flex: 1 }}>
              <strong>
                {payment.payee} · {kes(payment.amount)}
              </strong>
              <small>{payment.purpose}</small>
            </span>
            <ArrowRight />
          </button>
        ))}
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Soko leo</span>
        <p className="mb-0">
          <strong>Tomato at Kangemi is up {kes(400)}/crate.</strong>
          <br />
          <small>
            Rosecoco at Nakuru remains the best beans price after transport.
          </small>
        </p>
      </div>
    </div>
  );
}

function WeatherDetails({ onAlert }: { onAlert: () => void }) {
  const [tab, setTab] = useState<"now" | "hourly" | "week">("now");
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        {(["now", "hourly", "week"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item === "now"
              ? "Current conditions"
              : item === "hourly"
                ? "Hourly"
                : "7-day forecast"}
          </button>
        ))}
      </div>
      {tab === "now" ? (
        <div>
          <div className="gm-stat-grid">
            <DashboardMetric
              icon={CloudRain}
              label="Temperature"
              value={`${DASHBOARD_WEATHER.currentTemp}°C`}
              note={`Feels like ${DASHBOARD_WEATHER.feelsLike}°C`}
            />
            <DashboardMetric
              icon={Droplets}
              label="Humidity"
              value={`${DASHBOARD_WEATHER.humidity}%`}
              note="Disease pressure elevated"
            />
            <DashboardMetric
              icon={Wind}
              label="Wind"
              value={DASHBOARD_WEATHER.wind}
              note="Safe after 14:00"
            />
            <DashboardMetric
              icon={CloudRain}
              label="Rain · 24h"
              value={`${DASHBOARD_WEATHER.rainfall24h} mm`}
              note={`${DASHBOARD_WEATHER.rainProbability}% chance today`}
            />
          </div>
          <button
            type="button"
            className="gm-option-row mt-3"
            onClick={onAlert}
          >
            <span className="gm-mega-icon">
              <AlertTriangle />
            </span>
            <span style={{ flex: 1 }}>
              <strong>Black-rot action alert</strong>
              <small>{DASHBOARD_WEATHER.alert}</small>
            </span>
            <ArrowRight />
          </button>
        </div>
      ) : null}
      {tab === "hourly" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature</th>
                <th>Rain chance</th>
                <th>Wind</th>
                <th>Field decision</th>
              </tr>
            </thead>
            <tbody>
              {DASHBOARD_WEATHER.hourly.map((row) => (
                <tr key={row.time}>
                  <td>
                    <strong>{row.time}</strong>
                  </td>
                  <td>{row.temp}°C</td>
                  <td>{row.rain}%</td>
                  <td>{row.wind}</td>
                  <td>
                    {row.rain < 40
                      ? "Suitable for dry-leaf work"
                      : "Hold spraying"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "week" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Condition</th>
                <th>High / low</th>
                <th>Rain</th>
                <th>Field guidance</th>
              </tr>
            </thead>
            <tbody>
              {DASHBOARD_WEATHER.forecast.map((row) => (
                <tr key={row.day}>
                  <td>
                    <strong>{row.day}</strong>
                  </td>
                  <td>{row.condition}</td>
                  <td>
                    {row.high}° / {row.low}°
                  </td>
                  <td>{row.rain}%</td>
                  <td>{row.field}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function WeatherAlert({
  onClose,
  onTask,
}: {
  onClose: () => void;
  onTask: () => void;
}) {
  const [tab, setTab] = useState<"risk" | "recipe" | "safety">("risk");
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        {(["risk", "recipe", "safety"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item === "risk"
              ? "Risk"
              : item === "recipe"
                ? "Spray recipe"
                : "Safety"}
          </button>
        ))}
      </div>
      {tab === "risk" ? (
        <div className="gm-card p-3">
          <StatusChip label="High risk · next 48h" tone="high" />
          <h3 className="font-display mt-2">Why GrowMO raised this</h3>
          <p>
            Humidity is 78%, 5.2 mm fell overnight and another wet night is
            likely. Gloria F1 is approaching canopy closure, so leaves will stay
            wet longer.
          </p>
        </div>
      ) : null}
      {tab === "recipe" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Product</td>
                <td>
                  <strong>Mancozeb 80% WP</strong>
                </td>
              </tr>
              <tr>
                <td>Mixing rate</td>
                <td>
                  <strong>50 g per 20 L knapsack</strong>
                </td>
              </tr>
              <tr>
                <td>Plot quantity</td>
                <td>
                  <strong>4 knapsacks · 200 g total</strong>
                </td>
              </tr>
              <tr>
                <td>Best window</td>
                <td>
                  <strong>Tomorrow after 14:00, once leaves dry</strong>
                </td>
              </tr>
              <tr>
                <td>Pre-harvest interval</td>
                <td>
                  <strong>14 days</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "safety" ? (
        <div className="gm-check-list">
          {[
            "Wear gloves, mask, gumboots and long sleeves.",
            "Keep livestock and children away during mixing.",
            "Triple-rinse the container and return it to the agrovet.",
            "Do not spray in rain or winds above 15 km/h.",
          ].map((item) => (
            <div key={item} className="gm-check-row">
              <Check /> <strong>{item}</strong>
            </div>
          ))}
        </div>
      ) : null}
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Acknowledge
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onTask}>
          <ClipboardList /> Add protected spray task
        </button>
      </ModalFooter>
    </div>
  );
}

function CropDetail({
  crop,
  onObservation,
  onTask,
}: {
  crop: ActiveCrop;
  onObservation: () => void;
  onTask: () => void;
}) {
  const [tab, setTab] = useState<"overview" | "calendar" | "inputs">(
    "overview",
  );
  return (
    <div>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <span className="font-display" style={{ fontSize: "3rem" }}>
          {crop.symbol}
        </span>
        <div style={{ flex: 1 }}>
          <StatusChip
            label={healthLabel[crop.status]}
            tone={healthTone(crop.status)}
          />
          <p className="mb-1 mt-2">
            <strong>{crop.stage}</strong> · Day {crop.day} of {crop.totalDays}
          </p>
          <ProgressLine value={crop.progress} label={`${crop.crop} progress`} />
        </div>
      </div>
      <div className="gm-tabs" role="tablist">
        {(["overview", "calendar", "inputs"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item === "overview"
              ? "Crop overview"
              : item === "calendar"
                ? "Next milestones"
                : "Inputs & value"}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Plot</td>
                <td>
                  <strong>{crop.plot}</strong>
                </td>
              </tr>
              <tr>
                <td>Acreage</td>
                <td>
                  <strong>{crop.acreage} acre</strong>
                </td>
              </tr>
              <tr>
                <td>Planting date</td>
                <td>
                  <strong>{crop.planted}</strong>
                </td>
              </tr>
              <tr>
                <td>Water</td>
                <td>
                  <strong>{crop.water}</strong>
                </td>
              </tr>
              <tr>
                <td>Manager</td>
                <td>
                  <strong>{crop.manager}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "calendar" ? (
        <div className="gm-timeline">
          <div className="gm-tl-item is-done">
            <strong>Planted</strong>
            <small>{crop.planted}</small>
          </div>
          <div className="gm-tl-item is-current">
            <strong>{crop.stage}</strong>
            <small>
              Day {crop.day} · {crop.progress}% complete
            </small>
          </div>
          <div className="gm-tl-item">
            <strong>{crop.nextTask}</strong>
            <small>{crop.nextDue}</small>
          </div>
          <div className="gm-tl-item">
            <strong>Expected harvest</strong>
            <small>{crop.expectedHarvest}</small>
          </div>
        </div>
      ) : null}
      {tab === "inputs" ? (
        <div className="gm-stat-grid">
          <DashboardMetric
            icon={PackageCheck}
            label="Next input"
            value={crop.nextTask}
            note={crop.nextDue}
          />
          <DashboardMetric
            icon={Wheat}
            label="Expected yield"
            value={crop.expectedYield}
            note={crop.expectedHarvest}
          />
          <DashboardMetric
            icon={Coins}
            label="Projected revenue"
            value={kes(crop.projectedRevenue)}
            note={`${crop.acreage} acre plan`}
          />
        </div>
      ) : null}
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onObservation}
        >
          <Pencil /> Log observation
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onTask}>
          <Plus /> Add crop task
        </button>
      </ModalFooter>
    </div>
  );
}

function ObservationForm({
  crop,
  onCancel,
  onSave,
}: {
  crop: ActiveCrop;
  onCancel: () => void;
  onSave: (status: HealthStatus) => void;
}) {
  const [status, setStatus] = useState<HealthStatus>(crop.status);
  const [note, setNote] = useState(
    "Canopy is even; two outer leaves show small feeding holes.",
  );
  const [count, setCount] = useState("20");
  return (
    <div>
      <Field label="Crop health">
        <div className="gm-seg" role="radiogroup" aria-label="Crop health">
          {(["healthy", "attention", "problem"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={status === item}
              className={status === item ? "on" : ""}
              onClick={() => setStatus(item)}
            >
              {healthLabel[item]}
            </button>
          ))}
        </div>
      </Field>
      <div className="gm-form-grid">
        <Field label="Plants inspected">
          <input
            className="gm-input"
            inputMode="numeric"
            value={count}
            onChange={(event) =>
              setCount(event.target.value.replace(/\D/g, "").slice(0, 3))
            }
          />
        </Field>
        <Field label="Observation date">
          <input className="gm-input" type="date" value="2026-09-18" readOnly />
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
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onCancel}
        >
          Back to crop
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!count || !note.trim()}
          onClick={() => onSave(status)}
        >
          <Check /> Save observation
        </button>
      </ModalFooter>
    </div>
  );
}

function TaskDetail({
  task,
  onClose,
  onComplete,
  onPay,
}: {
  task: FarmTask;
  onClose: () => void;
  onComplete: () => void;
  onPay: () => void;
}) {
  const [tab, setTab] = useState<"instructions" | "inputs" | "notes">(
    "instructions",
  );
  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <StatusChip
          label={priorityLabel[task.priority]}
          tone={priorityTone(task.priority)}
        />
        <StatusChip
          label={task.status}
          tone={
            task.status === "Done"
              ? "low"
              : task.status === "Unpaid"
                ? "high"
                : "medium"
          }
        />
        <span className="gm-chip">
          <Timer /> {task.time}
        </span>
        <span className="gm-chip">
          <User /> {task.assigned}
        </span>
      </div>
      <div className="gm-tabs" role="tablist">
        {(["instructions", "inputs", "notes"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "instructions" ? (
        <div className="gm-card p-3">
          <p className="mb-0">{task.details}</p>
        </div>
      ) : null}
      {tab === "inputs" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Input / tool</td>
                <td>
                  <strong>{task.input}</strong>
                </td>
              </tr>
              <tr>
                <td>Quantity</td>
                <td>
                  <strong>{task.quantity}</strong>
                </td>
              </tr>
              <tr>
                <td>Crop</td>
                <td>
                  <strong>{task.crop}</strong>
                </td>
              </tr>
              <tr>
                <td>Plot</td>
                <td>
                  <strong>{task.plot}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "notes" ? (
        <div className="gm-card p-3">
          <p className="mb-0">{task.note}</p>
        </div>
      ) : null}
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        {task.status === "Unpaid" ? (
          <button type="button" className="gm-btn gm-btn-mpesa" onClick={onPay}>
            <Wallet /> Pay now
          </button>
        ) : task.status !== "Done" ? (
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onComplete}
          >
            <ClipboardCheck /> Complete task
          </button>
        ) : (
          <StatusChip label="Completed and recorded" tone="low" />
        )}
      </ModalFooter>
    </div>
  );
}

function TaskCompletionWizard({
  task,
  onDone,
}: {
  task: FarmTask;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState([false, false, false]);
  const [note, setNote] = useState(
    "Task completed as instructed; no exceptions observed.",
  );
  const [evidence, setEvidence] = useState("Field note + supervisor check");
  const allChecks = checks.every(Boolean);
  const toggle = (index: number) =>
    setChecks((rows) =>
      rows.map((value, rowIndex) => (rowIndex === index ? !value : value)),
    );
  return (
    <div>
      <Stepper
        steps={["Checks", "Evidence", "Review"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="d-grid gap-2 mt-3">
          {[
            "The task instructions were followed.",
            "Required protective equipment was used.",
            "Input quantities and leftovers were recorded.",
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
          <Field label="Completion evidence">
            <select
              className="gm-select"
              value={evidence}
              onChange={(event) => setEvidence(event.target.value)}
            >
              <option>Field note + supervisor check</option>
              <option>Photo evidence + field note</option>
              <option>Worker confirmation + GPS</option>
            </select>
          </Field>
          <Field label="Completed at">
            <input
              className="gm-input"
              value="18 Sep 2026 · 10:45 EAT"
              readOnly
            />
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
                <td>Crop / plot</td>
                <td>
                  <strong>
                    {task.crop} · {task.plot}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Evidence</td>
                <td>
                  <strong>{evidence}</strong>
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
        onNext={() => (step === 2 ? onDone() : setStep((value) => value + 1))}
        finishLabel="Complete & record"
        nextDisabled={
          (step === 0 && !allChecks) || (step === 1 && !note.trim())
        }
      />
    </div>
  );
}

function NewTaskWizard({
  crops,
  onSave,
}: {
  crops: ActiveCrop[];
  onSave: (task: FarmTask) => void;
}) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Inspect crop after overnight rain");
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>("today");
  const [time, setTime] = useState("09:30");
  const [assigned, setAssigned] = useState("Self");
  const [details, setDetails] = useState(
    "Walk the plot, inspect 20 plants and record any disease or pest symptoms.",
  );
  const [input, setInput] = useState("Field notebook and phone camera");
  const [quantity, setQuantity] = useState("20 plants");
  const crop = crops.find((row) => row.id === cropId) ?? crops[0];
  return (
    <div>
      <Stepper
        steps={["Task", "Instructions", "Review"]}
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
          <Field label="Crop">
            <select
              className="gm-select"
              value={cropId}
              onChange={(event) => setCropId(event.target.value)}
            >
              {crops.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.crop} — {row.variety}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className="gm-select"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
            >
              <option value="urgent">Urgent</option>
              <option value="today">Due today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </Field>
          <Field label="Time">
            <input
              className="gm-input"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </Field>
          <Field label="Assigned to">
            <select
              className="gm-select"
              value={assigned}
              onChange={(event) => setAssigned(event.target.value)}
            >
              <option>Self</option>
              <option>John Mwangi</option>
              <option>Lucy Njeri</option>
              <option>Peter Kamau</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Instructions" full>
            <textarea
              className="gm-textarea"
              rows={4}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
            />
          </Field>
          <Field label="Input / tool">
            <input
              className="gm-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          </Field>
          <Field label="Quantity / coverage">
            <input
              className="gm-input"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
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
                <td>Crop</td>
                <td>
                  <strong>
                    {crop ? `${crop.crop} — ${crop.variety}` : "Whole farm"}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>When / assignee</td>
                <td>
                  <strong>
                    {time} · {assigned}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>Instructions</td>
                <td>
                  <strong>{details}</strong>
                </td>
              </tr>
              <tr>
                <td>Input</td>
                <td>
                  <strong>
                    {input} · {quantity}
                  </strong>
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
        onNext={() => {
          if (step < 2) setStep((value) => value + 1);
          else
            onSave({
              id: `task-${Date.now()}`,
              priority,
              task: title.trim(),
              crop: crop ? `${crop.crop} · ${crop.variety}` : "Whole farm",
              plot: crop?.plot ?? "Whole farm",
              time,
              assigned,
              status: "Pending",
              details: details.trim(),
              input: input.trim(),
              quantity: quantity.trim(),
              note: "Created from the Page 2 operations board.",
            });
        }}
        finishLabel="Add task"
        nextDisabled={
          !title.trim() || !details.trim() || !input.trim() || !quantity.trim()
        }
      />
    </div>
  );
}

function FinanceCentre({
  transactions,
  onExpense,
}: {
  transactions: FarmTransaction[];
  onExpense: () => void;
}) {
  const [tab, setTab] = useState<"budget" | "ledger" | "forecast">("budget");
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        {(["budget", "ledger", "forecast"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "budget" ? (
        <div className="d-flex flex-wrap align-items-center gap-3">
          <ScoreRing score={39} size={136} />
          <div className="gm-table-wrap" style={{ flex: "1 1 310px" }}>
            <table className="gm-table">
              <tbody>
                {FINANCIAL_METRICS.map((metric) => (
                  <tr key={metric.id}>
                    <td>{metric.label}</td>
                    <td className="font-display">
                      <strong>{kes(metric.value)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {tab === "ledger" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <strong>{row.description}</strong>
                  </td>
                  <td>{row.category}</td>
                  <td>{row.method}</td>
                  <td className="font-display">
                    {row.direction === "in" ? "+" : "−"}
                    {kes(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "forecast" ? (
        <div className="gm-timeline">
          <div className="gm-tl-item is-done">
            <strong>Spent to date</strong>
            <small>{kes(22000)} · land preparation, seed and protection</small>
          </div>
          <div className="gm-tl-item is-current">
            <strong>Vegetative stage</strong>
            <small>
              {kes(11500)} planned for CAN, labour and disease control
            </small>
          </div>
          <div className="gm-tl-item">
            <strong>Heading stage</strong>
            <small>
              {kes(9800)} planned for potassium, irrigation and scouting
            </small>
          </div>
          <div className="gm-tl-item">
            <strong>Harvest & market</strong>
            <small>
              {kes(12700)} planned · {kes(240000)} revenue forecast
            </small>
          </div>
        </div>
      ) : null}
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={onExpense}
        >
          <Receipt /> Record expense
        </button>
      </ModalFooter>
    </div>
  );
}

function ExpenseWizard({
  crops,
  onDone,
}: {
  crops: ActiveCrop[];
  onDone: (transaction: FarmTransaction) => void;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] =
    useState<(typeof EXPENSE_CATEGORIES)[number]>("Fertilizer");
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [description, setDescription] = useState("CAN fertilizer top-dress");
  const [amount, setAmount] = useState("5000");
  const [method, setMethod] = useState("M-Pesa");
  const [reference, setReference] = useState("QJT82K6M4R");
  const [busy, setBusy] = useState(false);
  const crop = crops.find((row) => row.id === cropId) ?? crops[0];
  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      onDone({
        id: `txn-${Date.now()}`,
        date: "18 Sep 2026",
        description: description.trim(),
        category,
        crop: crop?.crop ?? "Whole farm",
        amount: Number(amount),
        direction: "out",
        method,
        reference: reference.trim(),
      });
    }, 900);
  };
  return (
    <div>
      <Stepper
        steps={["Category", "Payment", "Review"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Expense category">
            <select
              className="gm-select"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as (typeof EXPENSE_CATEGORIES)[number],
                )
              }
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          <Field label="Crop budget">
            <select
              className="gm-select"
              value={cropId}
              onChange={(event) => setCropId(event.target.value)}
            >
              {crops.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.crop} — {row.variety}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" full>
            <input
              className="gm-input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Amount (KES)">
            <input
              className="gm-input"
              inputMode="numeric"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
          </Field>
          <Field label="Payment method">
            <select
              className="gm-select"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option>M-Pesa</option>
              <option>GrowMO Wallet</option>
              <option>Cash</option>
              <option>Bank</option>
            </select>
          </Field>
          <Field label="Receipt / M-Pesa reference" full>
            <input
              className="gm-input"
              value={reference}
              onChange={(event) =>
                setReference(event.target.value.toUpperCase())
              }
            />
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Verifying M-Pesa reference…</h3>
            <p>
              Matching {reference} before updating the {crop?.crop} budget.
            </p>
          </div>
        ) : (
          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Expense</td>
                  <td>
                    <strong>{description}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Budget</td>
                  <td>
                    <strong>
                      {crop?.crop} · {category}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td className="font-display">
                    <strong>{kes(Number(amount) || 0)}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Payment</td>
                  <td>
                    <strong>
                      {method} · {reference}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      ) : null}
      {!busy ? (
        <WizardActions
          step={step}
          last={2}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
          finishLabel="Verify & record"
          nextDisabled={
            !description.trim() || !Number(amount) || !reference.trim()
          }
        />
      ) : null}
    </div>
  );
}

function InsightDetail({
  insight,
  onTask,
  onAsk,
  onClose,
}: {
  insight: AiInsight;
  onTask: () => void;
  onAsk: () => void;
  onClose: () => void;
}) {
  const Icon = INSIGHT_ICONS[insight.kind];
  return (
    <div>
      <div className="d-flex gap-3 align-items-start">
        <span className="gm-mega-icon">
          <Icon />
        </span>
        <div>
          <StatusChip
            label={`${insight.confidence}% confidence`}
            tone={insight.confidence >= 85 ? "low" : "medium"}
          />
          <p className="mt-2">{insight.content}</p>
        </div>
      </div>
      <div className="gm-card p-3 mt-3">
        <span className="gm-eyebrow">Why this insight</span>
        <p className="mb-0 mt-2">{insight.why}</p>
      </div>
      <ModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-dark" onClick={onAsk}>
          <Bot /> Ask a follow-up
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onTask}>
          <Plus /> {insight.action}
        </button>
      </ModalFooter>
    </div>
  );
}

function AiAdvisorWizard({
  crops,
  onAddTask,
}: {
  crops: ActiveCrop[];
  onAddTask: (title: string, crop: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [topic, setTopic] = useState("Pest or disease risk");
  const [question, setQuestion] = useState(
    "What should I check before spraying my cabbage after overnight rain?",
  );
  const [busy, setBusy] = useState(false);
  const crop = crops.find((row) => row.id === cropId) ?? crops[0];
  const ask = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setStep(2);
    }, 850);
  };
  return (
    <div>
      <Stepper
        steps={["Context", "Question", "Action plan"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Crop context">
            <select
              className="gm-select"
              value={cropId}
              onChange={(event) => setCropId(event.target.value)}
            >
              {crops.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.crop} — {row.variety} · {row.stage}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Topic">
            <select
              className="gm-select"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            >
              <option>Pest or disease risk</option>
              <option>Nutrition and fertilizer</option>
              <option>Weather and irrigation</option>
              <option>Harvest and market</option>
              <option>Cost optimization</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        busy ? (
          <div className="text-center p-4">
            <span className="gm-spinner" />
            <h3 className="font-display mt-3">Reading farm context…</h3>
            <p>
              Checking {crop?.crop} stage, Githunguri weather and recent field
              records.
            </p>
          </div>
        ) : (
          <Field label="Your question">
            <textarea
              className="gm-textarea mt-3"
              rows={5}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
          </Field>
        )
      ) : null}
      {step === 2 ? (
        <div>
          <div className="gm-card p-3">
            <span className="gm-eyebrow">GrowMO AI answer</span>
            <h3 className="font-display mt-2">
              Check leaf dryness, wind and active infection first
            </h3>
            <p>
              Wait until leaves are dry and wind is below 15 km/h. Scout 20
              plants before mixing. If black-rot symptoms are absent, use the
              preventive Mancozeb rate of 50 g per 20 L; if V-shaped yellow
              lesions are present, photograph them and request an agronomist
              review before spraying.
            </p>
          </div>
          <div className="gm-check-list mt-3">
            <div className="gm-check-row">
              <Check />
              <strong>Scout 20 plants in a W pattern</strong>
            </div>
            <div className="gm-check-row">
              <Check />
              <strong>Spray after 14:00 only if leaves are dry</strong>
            </div>
            <div className="gm-check-row">
              <Check />
              <strong>Record product batch and 14-day PHI</strong>
            </div>
          </div>
          <ModalFooter>
            <button
              type="button"
              className="gm-btn gm-btn-lime"
              onClick={() =>
                onAddTask(
                  `Scout and protect ${crop?.crop ?? "crop"}`,
                  crop ? `${crop.crop} · ${crop.variety}` : "Whole farm",
                )
              }
            >
              <Plus /> Add action plan to tasks
            </button>
          </ModalFooter>
        </div>
      ) : null}
      {step < 2 && !busy ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => (step === 0 ? setStep(1) : ask())}
          finishLabel="Ask GrowMO AI"
          nextDisabled={!question.trim()}
        />
      ) : null}
    </div>
  );
}

function MarketCentre({
  initialCrop,
  onSave,
}: {
  initialCrop: string;
  onSave: (market: MarketPrice) => void;
}) {
  const [tab, setTab] = useState<"prices" | "buyers" | "transport">("prices");
  const [query, setQuery] = useState(initialCrop === "All" ? "" : initialCrop);
  const [page, setPage] = useState(1);
  const rows = MARKET_PRICES.filter((market) =>
    `${market.crop} ${market.variety} ${market.market} ${market.county}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 5;
  const total = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        {(["prices", "buyers", "transport"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "prices" ? (
        <div>
          <Field label="Search crop, market or county">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                value={query}
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
                  <th>Crop</th>
                  <th>Market</th>
                  <th>Price</th>
                  <th>Change</th>
                  <th>Updated</th>
                  <th>Watch</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((market) => (
                  <tr key={market.id}>
                    <td>
                      <strong>{market.crop}</strong>
                      <br />
                      <small>{market.variety}</small>
                    </td>
                    <td>
                      {market.market}
                      <br />
                      <small>{market.county}</small>
                    </td>
                    <td className="font-display">
                      {kes(market.price)}/{market.unit}
                    </td>
                    <td>
                      <StatusChip
                        label={
                          market.trend === "up"
                            ? `+${market.change}`
                            : String(market.change)
                        }
                        tone={
                          market.trend === "up"
                            ? "low"
                            : market.trend === "down"
                              ? "high"
                              : "neutral"
                        }
                      />
                    </td>
                    <td>{market.updated}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-outline gm-btn-sm"
                        onClick={() => onSave(market)}
                      >
                        Watch
                      </button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No market records match “{query}”.</td>
                  </tr>
                ) : null}
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
        </div>
      ) : null}
      {tab === "buyers" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Location</th>
                <th>Buys</th>
                <th>Terms</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Twiga Foods</strong>
                </td>
                <td>Tatu City collection</td>
                <td>Cabbage, tomato</td>
                <td>48-hour M-Pesa</td>
                <td>4.8/5</td>
              </tr>
              <tr>
                <td>
                  <strong>Githunguri Fresh Hub</strong>
                </td>
                <td>Githunguri town</td>
                <td>Kale, cabbage</td>
                <td>Same-day cashless</td>
                <td>4.6/5</td>
              </tr>
              <tr>
                <td>
                  <strong>FreshCrop Exporters</strong>
                </td>
                <td>Ruiru</td>
                <td>Hass avocado</td>
                <td>Grade-based weekly</td>
                <td>4.9/5</td>
              </tr>
              <tr>
                <td>
                  <strong>Nakuru Cereal Traders</strong>
                </td>
                <td>Nakuru CBD</td>
                <td>Rosecoco, maize</td>
                <td>On delivery</td>
                <td>4.5/5</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "transport" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Destination</th>
                <th>Distance</th>
                <th>Pickup quote</th>
                <th>Net advantage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Marikiti</td>
                <td>48 km</td>
                <td>{kes(6500)}</td>
                <td>Best for 200+ cabbage heads</td>
              </tr>
              <tr>
                <td>Kangemi</td>
                <td>39 km</td>
                <td>{kes(5200)}</td>
                <td>Best tomato net return</td>
              </tr>
              <tr>
                <td>Nakuru</td>
                <td>142 km</td>
                <td>{kes(14500)}</td>
                <td>+{kes(165)}/bag Rosecoco</td>
              </tr>
              <tr>
                <td>Githunguri</td>
                <td>4 km</td>
                <td>{kes(800)}</td>
                <td>Best small-volume kale</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function NewCropWizard({ onSave }: { onSave: (crop: ActiveCrop) => void }) {
  const [step, setStep] = useState(0);
  const [cropName, setCropName] = useState("Cabbage");
  const cropEntry =
    CROP_LIBRARY.find((entry) => entry.crop === cropName) ?? CROP_LIBRARY[0];
  const [variety, setVariety] = useState("Gloria F1");
  const [plot, setPlot] = useState("Plot 6 · Shamba ya nyuma");
  const [acreage, setAcreage] = useState("0.5");
  const [planting, setPlanting] = useState("2026-10-05");
  const [budget, setBudget] = useState("62000");
  const [water, setWater] = useState("Drip + short rains");
  return (
    <div>
      <Stepper
        steps={["Crop", "Plot", "Season", "Budget"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Crop">
            <select
              className="gm-select"
              value={cropName}
              onChange={(event) => {
                const next = event.target.value;
                setCropName(next);
                setVariety(
                  CROP_LIBRARY.find((entry) => entry.crop === next)
                    ?.varieties[0] ?? "",
                );
              }}
            >
              {CROP_LIBRARY.map((entry) => (
                <option key={entry.crop}>{entry.crop}</option>
              ))}
            </select>
          </Field>
          <Field label="Variety">
            <select
              className="gm-select"
              value={variety}
              onChange={(event) => setVariety(event.target.value)}
            >
              {cropEntry?.varieties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Plot name" full>
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
              value={acreage}
              onChange={(event) =>
                setAcreage(
                  event.target.value.replace(/[^\d.]/g, "").slice(0, 4),
                )
              }
            />
          </Field>
          <Field label="Water plan">
            <select
              className="gm-select"
              value={water}
              onChange={(event) => setWater(event.target.value)}
            >
              <option>Drip + short rains</option>
              <option>Rain-fed</option>
              <option>Sprinkler</option>
              <option>Fertigation</option>
            </select>
          </Field>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="gm-form-grid mt-3">
          <Field label="Planting date">
            <input
              className="gm-input"
              type="date"
              value={planting}
              onChange={(event) => setPlanting(event.target.value)}
            />
          </Field>
          <Field label="Season">
            <input className="gm-input" value="Short rains 2026" readOnly />
          </Field>
          <div className="full gm-card p-3">
            <StatusChip label="Recommended window" tone="low" />
            <p className="mb-0 mt-2">
              05–12 October gives this {cropName} plan the best rain
              establishment window for UM1 Githunguri.
            </p>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div>
          <div className="gm-form-grid mt-3">
            <Field label="Season budget (KES)">
              <input
                className="gm-input"
                inputMode="numeric"
                value={budget}
                onChange={(event) =>
                  setBudget(event.target.value.replace(/\D/g, "").slice(0, 8))
                }
              />
            </Field>
            <Field label="Expected revenue">
              <input
                className="gm-input"
                value={kes(Math.round((Number(budget) || 0) * 3.4))}
                readOnly
              />
            </Field>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <tbody>
                <tr>
                  <td>Plan</td>
                  <td>
                    <strong>
                      {cropName} — {variety}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Plot</td>
                  <td>
                    <strong>
                      {plot} · {acreage} acre
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Planting</td>
                  <td>
                    <strong>
                      {planting} · {water}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td>Budget</td>
                  <td className="font-display">
                    <strong>{kes(Number(budget) || 0)}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={3}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => {
          if (step < 3) setStep((value) => value + 1);
          else
            onSave({
              id: `crop-${Date.now()}`,
              crop: cropName,
              variety,
              symbol: "🌱",
              plot,
              stage: "Plan ready",
              day: 0,
              totalDays: cropName === "Maize" ? 150 : 90,
              progress: 0,
              nextTask: "Confirm seed and planting crew",
              nextDue: "before planting",
              status: "healthy",
              acreage: Number(acreage),
              planted: planting,
              expectedHarvest: "Calculated after planting",
              expectedYield: `Target set after emergence (${cropEntry?.unit ?? "units"})`,
              projectedRevenue: Math.round(Number(budget) * 3.4),
              water,
              manager: DASHBOARD_FARM.owner,
            });
        }}
        finishLabel="Create crop plan"
        nextDisabled={
          !cropName ||
          !variety ||
          !plot.trim() ||
          !Number(acreage) ||
          !planting ||
          !Number(budget)
        }
      />
    </div>
  );
}

function MpesaPaymentWizard({
  payee,
  phone,
  purpose,
  amount,
  onPaid,
  onClose,
}: {
  payee: string;
  phone: string;
  purpose: string;
  amount: number;
  onPaid: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const pay = () => {
    setBusy(true);
    setStep(3);
    window.setTimeout(() => {
      setBusy(false);
      setDone(true);
      onPaid();
    }, 1100);
  };
  if (done) {
    return (
      <div className="text-center p-3">
        <CheckCircle2 width={50} height={50} color="var(--gm-leaf-600)" />
        <h3 className="font-display mt-2">Payment sent</h3>
        <p>
          <strong>{kes(amount)}</strong> was sent to <strong>{payee}</strong> (
          {phone}). An M-Pesa receipt is now in the farm ledger.
        </p>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Done
        </button>
      </div>
    );
  }
  return (
    <div>
      <Stepper
        steps={["Recipient", "Approve", "PIN", "Receipt"]}
        current={step}
        onStep={busy ? undefined : setStep}
      />
      {step === 0 ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <tbody>
              <tr>
                <td>Pay to</td>
                <td>
                  <strong>{payee}</strong>
                </td>
              </tr>
              <tr>
                <td>M-Pesa</td>
                <td>
                  <strong>{phone}</strong>
                </td>
              </tr>
              <tr>
                <td>Purpose</td>
                <td>
                  <strong>{purpose}</strong>
                </td>
              </tr>
              <tr>
                <td>Amount</td>
                <td className="font-display">
                  <strong>{kes(amount)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
      {step === 1 ? (
        <button
          type="button"
          className={`gm-checkcard mt-3 ${approved ? "on" : ""}`}
          onClick={() => setApproved((value) => !value)}
        >
          <input type="checkbox" checked={approved} readOnly tabIndex={-1} />
          <span>
            <strong>I confirm this work or invoice is approved</strong>
            <small>
              {kes(amount)} will leave the GrowMO wallet and go to {phone}.
            </small>
          </span>
        </button>
      ) : null}
      {step === 2 ? (
        <div className="text-center mt-3">
          <p>
            <strong>Enter your 4-digit GrowMO wallet PIN</strong>
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
            actionLabel="PIN is encrypted and never shown"
          />
        </div>
      ) : null}
      {step === 3 && busy ? (
        <div className="text-center p-4">
          <span className="gm-spinner" />
          <h3 className="font-display mt-3">Sending M-Pesa payment…</h3>
          <p>
            Do not close this window while Safaricom confirms the transaction.
          </p>
        </div>
      ) : null}
      {step < 2 ? (
        <WizardActions
          step={step}
          last={1}
          onBack={() => setStep((value) => value - 1)}
          onNext={() => setStep((value) => value + 1)}
          finishLabel="Enter wallet PIN"
          nextDisabled={step === 1 && !approved}
        />
      ) : null}
    </div>
  );
}

function AnalyticsCentre({ crops }: { crops: ActiveCrop[] }) {
  const [tab, setTab] = useState<"yield" | "cost" | "benchmark">("yield");
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        {(["yield", "cost", "benchmark"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={`gm-tab ${tab === item ? "on" : ""}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "yield" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Area</th>
                <th>Progress</th>
                <th>Expected yield</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.id}>
                  <td>
                    <strong>
                      {crop.crop} · {crop.variety}
                    </strong>
                  </td>
                  <td>{crop.acreage} ac</td>
                  <td>{crop.progress}%</td>
                  <td>{crop.expectedYield}</td>
                  <td className="font-display">{kes(crop.projectedRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {tab === "cost" ? (
        <div className="gm-stat-grid">
          <DashboardMetric
            icon={Coins}
            label="Cabbage cost/head"
            value="KES 3.50"
            note="Target KES 2.80"
          />
          <DashboardMetric
            icon={Users}
            label="Labour/acre"
            value="KES 12,400"
            note="11% better this month"
          />
          <DashboardMetric
            icon={Droplets}
            label="Irrigation/acre"
            value="KES 4,850"
            note="Within Kiambu median"
          />
          <DashboardMetric
            icon={Tractor}
            label="Mechanisation"
            value="18%"
            note="Of operations completed"
          />
        </div>
      ) : null}
      {tab === "benchmark" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Mary's Farm</th>
                <th>Kiambu top quartile</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cabbage cost/head</td>
                <td>KES 3.50</td>
                <td>KES 2.80</td>
                <td>
                  <StatusChip label="25% higher" tone="medium" />
                </td>
              </tr>
              <tr>
                <td>Marketable heads</td>
                <td>91%</td>
                <td>94%</td>
                <td>
                  <StatusChip label="3 points" tone="medium" />
                </td>
              </tr>
              <tr>
                <td>Water use/head</td>
                <td>8.2 L</td>
                <td>8.9 L</td>
                <td>
                  <StatusChip label="8% better" tone="low" />
                </td>
              </tr>
              <tr>
                <td>Labour hours/acre</td>
                <td>126</td>
                <td>120</td>
                <td>
                  <StatusChip label="Near target" tone="low" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function PaymentsCentre({
  payments,
  onOpen,
}: {
  payments: UpcomingPayment[];
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const rows = payments.filter((payment) =>
    `${payment.payee} ${payment.purpose} ${payment.crop}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const perPage = 5;
  const total = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <Field label="Search ten payment records">
        <div className="gm-search-field">
          <Search />
          <input
            className="gm-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </Field>
      <PaymentsTable rows={visible} onOpen={onOpen} />
      <Pagination
        page={Math.min(page, total)}
        total={total}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
    </div>
  );
}

function PaymentDetail({
  payment,
  onClose,
  onPay,
}: {
  payment: UpcomingPayment;
  onClose: () => void;
  onPay: () => void;
}) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <StatusChip label={payment.status} tone={paymentTone(payment.status)} />
        <strong className="font-display" style={{ fontSize: "1.6rem" }}>
          {kes(payment.amount)}
        </strong>
      </div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <tbody>
            <tr>
              <td>Payee</td>
              <td>
                <strong>{payment.payee}</strong>
              </td>
            </tr>
            <tr>
              <td>Destination</td>
              <td>
                <strong>{payment.phone}</strong>
              </td>
            </tr>
            <tr>
              <td>Purpose</td>
              <td>
                <strong>{payment.purpose}</strong>
              </td>
            </tr>
            <tr>
              <td>Crop budget</td>
              <td>
                <strong>{payment.crop}</strong>
              </td>
            </tr>
            <tr>
              <td>Due</td>
              <td>
                <strong>{payment.due}</strong>
              </td>
            </tr>
            <tr>
              <td>Method</td>
              <td>
                <strong>{payment.method}</strong>
              </td>
            </tr>
            <tr>
              <td>Reference</td>
              <td>
                <strong>{payment.reference}</strong>
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
        {payment.status !== "Paid" ? (
          <button type="button" className="gm-btn gm-btn-mpesa" onClick={onPay}>
            <Wallet /> Pay {kes(payment.amount)}
          </button>
        ) : (
          <StatusChip label="Receipt saved" tone="low" />
        )}
      </ModalFooter>
    </div>
  );
}

function TimelineCentre({
  rows,
  onNote,
}: {
  rows: SeasonTimelineRow[];
  onNote: () => void;
}) {
  const [tab, setTab] = useState<"gantt" | "milestones">("gantt");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const total = Math.max(1, Math.ceil(rows.length / perPage));
  const visible = rows.slice((page - 1) * perPage, page * perPage);
  return (
    <div>
      <div className="gm-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "gantt"}
          className={`gm-tab ${tab === "gantt" ? "on" : ""}`}
          onClick={() => setTab("gantt")}
        >
          Mini Gantt
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "milestones"}
          className={`gm-tab ${tab === "milestones" ? "on" : ""}`}
          onClick={() => setTab("milestones")}
        >
          Milestones
        </button>
      </div>
      {tab === "gantt" ? (
        <div>
          <div className="d-flex justify-content-between text-muted mb-2">
            <small>Sep</small>
            <small>Oct</small>
            <small>Nov</small>
            <small>Dec</small>
            <small>Jan</small>
          </div>
          {visible.map((row) => (
            <div key={row.id} className="gm-check-row">
              <span style={{ flex: "0 0 130px" }}>
                <strong>{row.crop}</strong>
                <small>{row.phase}</small>
              </span>
              <span style={{ flex: 1 }}>
                <ProgressLine
                  value={row.progress}
                  label={`${row.crop} progress`}
                />
              </span>
              <small>{row.harvest}</small>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "milestones" ? (
        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Plot</th>
                <th>Current phase</th>
                <th>Next milestone</th>
                <th>Harvest</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>
                      {row.crop} · {row.variety}
                    </strong>
                  </td>
                  <td>{row.plot}</td>
                  <td>
                    {row.phase} · {row.progress}%
                  </td>
                  <td>{row.nextMilestone}</td>
                  <td>{row.harvest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <Pagination
        page={page}
        total={total}
        onChange={setPage}
        perPage={perPage}
        totalItems={rows.length}
      />
      <ModalFooter>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onNote}>
          <Plus /> Add seasonal note
        </button>
      </ModalFooter>
    </div>
  );
}

function CustomizeDashboard({
  value,
  onSave,
}: {
  value: DashboardSections;
  onSave: (value: DashboardSections) => void;
}) {
  const [step, setStep] = useState(0);
  const [next, setNext] = useState(value);
  const labels: Record<keyof DashboardSections, [string, string]> = {
    weather: ["Weather hero", "Current conditions, forecast and crop alert"],
    crops: ["Active crops", "Ten crop cards and growth progress"],
    tasks: ["Today's tasks", "Priority ordered field work"],
    finance: ["Financial snapshot", "Budget spent, remaining and profit"],
    insights: ["AI insights", "Tips, risks and benchmarks"],
    market: ["Market ticker", "Ten current Kenyan market prices"],
    actions: ["Quick actions", "Six complete workflows"],
    payments: ["Upcoming payments", "Labour, inputs and obligations"],
    timeline: ["Seasonal timeline", "Current crop phases and harvest dates"],
  };
  const shown = Object.values(next).filter(Boolean).length;
  return (
    <div>
      <Stepper
        steps={["Choose sections", "Review layout"]}
        current={step}
        onStep={setStep}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          {(Object.keys(next) as (keyof DashboardSections)[]).map((key) => (
            <Toggle
              key={key}
              checked={next[key]}
              onChange={(checked) =>
                setNext((current) => ({ ...current, [key]: checked }))
              }
              label={labels[key][0]}
              desc={labels[key][1]}
            />
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="gm-card p-3 mt-3">
          <h3 className="font-display">{shown} of 9 sections visible</h3>
          <div className="d-flex flex-wrap gap-2">
            {(Object.keys(next) as (keyof DashboardSections)[]).map((key) =>
              next[key] ? (
                <span key={key} className="gm-chip gm-chip-lime">
                  <Check /> {labels[key][0]}
                </span>
              ) : (
                <span key={key} className="gm-chip">
                  Hidden · {labels[key][0]}
                </span>
              ),
            )}
          </div>
          <button
            type="button"
            className="gm-btn gm-btn-soft gm-btn-sm mt-3"
            onClick={() => setNext(DEFAULT_SECTIONS)}
          >
            <RefreshCw /> Restore all sections
          </button>
        </div>
      ) : null}
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep(0)}
        onNext={() => (step === 0 ? setStep(1) : onSave(next))}
        finishLabel="Save dashboard"
        nextDisabled={shown === 0}
      />
    </div>
  );
}

function SeasonNoteForm({
  crops,
  onSave,
}: {
  crops: ActiveCrop[];
  onSave: () => void;
}) {
  const [cropId, setCropId] = useState(crops[0]?.id ?? "");
  const [date, setDate] = useState("2026-09-18");
  const [note, setNote] = useState(
    "Short rains establishment is on schedule; review drainage after Saturday showers.",
  );
  return (
    <div className="gm-form-grid">
      <Field label="Crop">
        <select
          className="gm-select"
          value={cropId}
          onChange={(event) => setCropId(event.target.value)}
        >
          {crops.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {crop.crop} — {crop.variety}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Milestone date">
        <input
          className="gm-input"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </Field>
      <Field label="Season note" full>
        <textarea
          className="gm-textarea"
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
      <div className="full">
        <ModalFooter>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            disabled={!cropId || !date || !note.trim()}
            onClick={onSave}
          >
            <CalendarDays /> Save seasonal note
          </button>
        </ModalFooter>
      </div>
    </div>
  );
}
