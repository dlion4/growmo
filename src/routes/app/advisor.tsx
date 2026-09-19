/* ============================================================================
   PAGE 9 — AI ADVISOR & PREDICTIVE ENGINE  (/app/advisor)
   Blueprint: growmo.md sections 9.1–9.6.
   9.1 Chat (EN + Kiswahili) · 9.2 Crop plan generator · 9.3 Pest & disease
   risk · 9.4 Market price forecast · 9.5 Benchmarking · 9.6 Input optimization
   ========================================================================== */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  Bug,
  Calculator,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  Cpu,
  Database,
  Download,
  Droplets,
  Eye,
  FileDown,
  FileText,
  Filter,
  FlaskConical,
  HandCoins,
  History,
  Info,
  Languages,
  Layers,
  ListChecks,
  MapPin,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Package,
  Plus,
  Radio,
  Save,
  ScanLine,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  Table2,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Wheat,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AiBenchBar,
  AiChatBubble,
  AiEmpty,
  AiFact,
  AiFactGrid,
  AiField,
  AiInsightCard,
  AiKv,
  AiMarketCard,
  AiModalFooter,
  AiNote,
  AiPlanCard,
  AiProgramCard,
  AiRiskCard,
  AiScenarioCard,
  AiSparkline,
  AiSummary,
  AiTyping,
  AiUploadDrop,
  riskTone,
  TrendIcon,
  verdictTone,
} from "../../components/app/AdvisorWidgets";
import {
  DashboardDrawer,
  DashboardSectionHeader,
  ProgressLine,
  StatusChip,
  WizardActions,
} from "../../components/app/DashboardWidgets";
import { PlannerSubtabs } from "../../components/app/PlannerWidgets";
import {
  Dialog,
  PinPad,
  ScoreRing,
  Stepper,
  Toggle,
} from "../../components/auth/controls";
import { Pagination, Reveal } from "../../components/ui/primitives";
import {
  ADVISOR_FAQS,
  ADVISOR_PROFILE,
  ADVISOR_SOURCES,
  ADVISOR_STATS,
  AI_INSIGHTS,
  AI_MODELS,
  AI_PICK,
  AI_REPLIES,
  type AiInsight,
  BENCHMARK_METRICS,
  BENCHMARK_SUMMARY,
  type BenchmarkMetric,
  CHAT_FALLBACK,
  CHAT_SESSIONS,
  type ChatAction,
  type ChatMessage,
  CONV_BLACKROT,
  CONV_LABOUR_PAY,
  CONV_MAIZE_BUDGET,
  CREDIT_PLANS,
  FERT_PRODUCTS,
  FERT_PROGRAMS,
  type FertilizerProgram,
  MARKET_FORECASTS,
  type MarketForecast,
  PEER_GROUPS,
  PEST_RISKS,
  type PeerGroup,
  type PestRisk,
  PLAN_INPUTS,
  PLAN_SCENARIOS,
  PLAN_TOTALS,
  PRICE_ALERTS,
  type PriceAlert,
  QUICK_PROMPTS,
  SAVED_PLANS,
  type SavedPlan,
  SCOUT_LOG,
  SEASON_PLAN_ROWS,
  SOIL_TEST,
  SYMPTOM_LIBRARY,
  type Symptom,
  TREATMENT_PRODUCTS,
  WALLET,
} from "../../data/app/advisor";
import { kes } from "../../data/site";
import { useToast } from "../../store/toast";

export const Route = createFileRoute("/app/advisor")({
  component: AdvisorPage,
});

/* ============================ local types ============================ */

type AdvisorView = "chat" | "plan" | "risk" | "market" | "bench" | "inputs";

type DrawerId =
  | "sessions"
  | "insights"
  | "library"
  | "sources"
  | "tasks"
  | null;

type ModalId =
  | "plan"
  | "plan-detail"
  | "plan-export"
  | "plan-share"
  | "confirm-plan"
  | "scan"
  | "pay"
  | "symptoms"
  | "treat"
  | "scout"
  | "risk-detail"
  | "risk-rules"
  | "confirm-risk"
  | "market-detail"
  | "price-alert"
  | "sell"
  | "confirm-alert"
  | "bench-detail"
  | "bench-peers"
  | "bench-report"
  | "fert"
  | "fert-program"
  | "fert-order"
  | "credits"
  | "models"
  | "chat-share"
  | "chat-clear"
  | "chat-export"
  | "feedback"
  | "insight"
  | "task"
  | "confirm-task"
  | "voice"
  | "language"
  | null;

interface AdvisorTask {
  id: string;
  title: string;
  detail: string;
  due: string;
  plot: string;
  cost: number;
  source: string;
  status: "Open" | "Scheduled" | "Done";
}

/* ============================ helpers ============================ */

function downloadText(filename: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvLine(cells: (string | number)[]) {
  return cells
    .map((cell) => {
      const text = String(cell);
      return text.includes(",") || text.includes('"')
        ? `"${text.replaceAll('"', '""')}"`
        : text;
    })
    .join(",");
}

function taskTone(status: AdvisorTask["status"]) {
  return status === "Done" ? "low" : status === "Scheduled" ? "medium" : "high";
}

function acresOf(option: string) {
  return Number.parseFloat(option.replace(/[^\d.]/g, "")) || 0;
}

function budgetOf(option: string) {
  return Number.parseInt(option.replace(/[^\d]/g, ""), 10) || 0;
}

/** Keyword routing so free-typed questions still land on a real answer. */
const KEYWORD_ROUTES: { keys: string[]; reply: string }[] = [
  { keys: ["mbegu", "seed", "mbegu nzuri", "variety"], reply: "seed" },
  {
    keys: ["makala", "manjano", "black rot", "yellow", "lesion"],
    reply: "blackrot",
  },
  { keys: ["spray", "kurukia", "dawa", "cost to spray"], reply: "spray" },
  { keys: ["fertilizer", "mbolea", "dap", "can", "lime"], reply: "fert" },
  { keys: ["sell", "uza", "hold", "price now", "bei"], reply: "sell" },
  { keys: ["lipa", "pay", "mfanyakazi", "wage", "casual"], reply: "pay" },
  { keys: ["harvest", "vuna", "mavuno", "ready"], reply: "harvest" },
  { keys: ["compare", "linganisha", "benchmark", "average"], reply: "compare" },
  { keys: ["armyworm", "funza", "faw", "worm"], reply: "faw" },
  { keys: ["irrigat", "maji", "water", "umwagiliaji"], reply: "irrigate" },
  { keys: ["plan", "mpango", "season plan", "calendar"], reply: "plan" },
  {
    keys: ["credit", "credits", "bajeti ya ai", "subscription"],
    reply: "credits",
  },
];

function routePrompt(text: string) {
  const lower = text.toLowerCase();
  const match = KEYWORD_ROUTES.find((route) =>
    route.keys.some((key) => lower.includes(key)),
  );
  return match ? match.reply : null;
}

const VIEW_ITEMS: {
  id: AdvisorView;
  label: string;
  icon: React.ReactNode;
  count?: number;
}[] = [
  { id: "chat", label: "Ask the AI", icon: <Bot width={15} height={15} /> },
  {
    id: "plan",
    label: "Crop plan generator",
    icon: <CalendarDays width={15} height={15} />,
  },
  {
    id: "risk",
    label: "Pest & disease risk",
    icon: <Bug width={15} height={15} />,
    count: PEST_RISKS.length,
  },
  {
    id: "market",
    label: "Market forecast",
    icon: <TrendingUp width={15} height={15} />,
    count: MARKET_FORECASTS.length,
  },
  {
    id: "bench",
    label: "Benchmarking",
    icon: <BarChart3 width={15} height={15} />,
  },
  {
    id: "inputs",
    label: "Input optimization",
    icon: <FlaskConical width={15} height={15} />,
  },
];

const SESSION_TRANSCRIPTS: Record<string, ChatMessage[]> = {
  "cs-01": CONV_MAIZE_BUDGET,
  "cs-02": CONV_BLACKROT,
  "cs-03": CONV_LABOUR_PAY,
};

const LABOUR_PAYMENT_BLOCK = CONV_LABOUR_PAY[1].blocks?.find(
  (block) => block.kind === "payment",
);
const LABOUR_PAYMENT =
  LABOUR_PAYMENT_BLOCK && LABOUR_PAYMENT_BLOCK.kind === "payment"
    ? LABOUR_PAYMENT_BLOCK
    : null;

const SCAN_SAMPLES = [
  { id: "leaf-1", label: "Cabbage · Plot 1", detail: "Today 06:12 · 3 leaves" },
  { id: "leaf-2", label: "Tomato · Plot 3", detail: "17 Sep · tunnel leaf" },
  { id: "leaf-3", label: "Maize · Plot 2", detail: "16 Sep · whorl shot" },
];

/* ============================ page ============================ */

function AdvisorPage() {
  const toast = useToast();

  /* ---- view / overlay state ---- */
  const [view, setView] = useState<AdvisorView>("chat");
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [modal, setModal] = useState<ModalId>(null);
  const [menu, setMenu] = useState<"none" | "more" | "ask" | "lang">("none");

  /* ---- 9.1 chat ---- */
  const [sessionId, setSessionId] = useState("cs-01");
  const [messages, setMessages] = useState<ChatMessage[]>(CONV_MAIZE_BUDGET);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [voice, setVoice] = useState(false);
  const [swahiliFirst, setSwahiliFirst] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [rated, setRated] = useState<Record<string, "up" | "down">>({});
  const [credits, setCredits] = useState(ADVISOR_PROFILE.creditsLeft);
  const threadRef = useRef<HTMLDivElement | null>(null);

  /* ---- 9.2 plan generator ---- */
  const [plans, setPlans] = useState<SavedPlan[]>(SAVED_PLANS);
  const [activePlan, setActivePlan] = useState<SavedPlan | null>(null);
  const [planTab, setPlanTab] = useState<"activities" | "budget" | "returns">(
    "activities",
  );
  const [planCrop, setPlanCrop] = useState(PLAN_INPUTS[0].options[0]);
  const [planAcres, setPlanAcres] = useState(PLAN_INPUTS[1].options[2]);
  const [planCounty, setPlanCounty] = useState(PLAN_INPUTS[2].options[0]);
  const [planMonth, setPlanMonth] = useState(PLAN_INPUTS[3].options[0]);
  const [planBudget, setPlanBudget] = useState(PLAN_INPUTS[4].options[2]);
  const [planSoil, setPlanSoil] = useState(PLAN_INPUTS[5].options[0]);
  const [planWater, setPlanWater] = useState(PLAN_INPUTS[6].options[0]);
  const [planGoal, setPlanGoal] = useState(PLAN_INPUTS[7].options[0]);
  const [generated, setGenerated] = useState(false);
  const [planPage, setPlanPage] = useState(1);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryStatus, setLibraryStatus] = useState("All");

  /* ---- 9.3 risk ---- */
  const [riskFilter, setRiskFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [riskQuery, setRiskQuery] = useState("");
  const [riskPage, setRiskPage] = useState(1);
  const [riskMine, setRiskMine] = useState(false);
  const [activeRisk, setActiveRisk] = useState<PestRisk | null>(null);
  const [ignoredRisks, setIgnoredRisks] = useState<string[]>([]);
  const [scoutPage, setScoutPage] = useState(1);

  /* ---- 9.4 market ---- */
  const [marketQuery, setMarketQuery] = useState("");
  const [marketTrend, setMarketTrend] = useState<
    "all" | "rising" | "stable" | "falling"
  >("all");
  const [marketPage, setMarketPage] = useState(1);
  const [activeMarket, setActiveMarket] = useState<MarketForecast | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>(PRICE_ALERTS);
  const [alertToDelete, setAlertToDelete] = useState<PriceAlert | null>(null);

  /* ---- 9.5 benchmarking ---- */
  const [peerId, setPeerId] = useState(PEER_GROUPS[0].id);
  const [benchSort, setBenchSort] = useState<"gap" | "metric">("gap");
  const [benchQuery, setBenchQuery] = useState("");
  const [activeMetric, setActiveMetric] = useState<BenchmarkMetric | null>(
    null,
  );

  /* ---- 9.6 inputs ---- */
  const [activeProgram, setActiveProgram] = useState<FertilizerProgram | null>(
    null,
  );
  const [fertAcres, setFertAcres] = useState("0.5");
  const [chosenProgram, setChosenProgram] = useState("Optimal");
  const [soilApplied, setSoilApplied] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [productPage, setProductPage] = useState(1);

  /* ---- money + tasks ---- */
  const [wallet, setWallet] = useState(WALLET.balance);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState("");
  const [payRef, setPayRef] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AdvisorTask[]>([]);
  const [taskToDelete, setTaskToDelete] = useState<AdvisorTask | null>(null);
  const [activeTask, setActiveTask] = useState<AdvisorTask | null>(null);
  const [activeInsight, setActiveInsight] = useState<AiInsight | null>(null);
  const [feedbackValue, setFeedbackValue] = useState<"up" | "down" | null>(
    null,
  );
  const [feedbackNote, setFeedbackNote] = useState("");
  const [creditPlan, setCreditPlan] = useState("cp-03");

  /* keep appshell drawers closed while an overlay is open here */
  useEffect(() => {
    if (modal || drawer) {
      window.dispatchEvent(new Event("close-appshell-drawers"));
    }
  }, [modal, drawer]);

  useEffect(() => {
    const node = threadRef.current;
    if (!node || (!typing && messages.length === 0)) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing]);

  /* ============================ derived data ============================ */

  const peer = useMemo(
    () => PEER_GROUPS.find((row) => row.id === peerId) ?? PEER_GROUPS[0],
    [peerId],
  );

  const filteredRisks = useMemo(() => {
    const query = riskQuery.toLowerCase().trim();
    return PEST_RISKS.filter((row) => {
      if (riskFilter !== "all" && row.risk !== riskFilter) return false;
      if (riskMine && !row.yourFarm) return false;
      if (ignoredRisks.includes(row.id)) return false;
      if (!query) return true;
      return `${row.crop} ${row.pest} ${row.county} ${row.product} ${row.swahili}`
        .toLowerCase()
        .includes(query);
    });
  }, [riskFilter, riskMine, riskQuery, ignoredRisks]);

  const riskPages = Math.max(1, Math.ceil(filteredRisks.length / 4));
  const pagedRisks = filteredRisks.slice((riskPage - 1) * 4, riskPage * 4);

  const pagedScouts = SCOUT_LOG.slice((scoutPage - 1) * 5, scoutPage * 5);
  const scoutPages = Math.max(1, Math.ceil(SCOUT_LOG.length / 5));

  const filteredMarkets = useMemo(() => {
    const query = marketQuery.toLowerCase().trim();
    return MARKET_FORECASTS.filter((row) => {
      if (marketTrend !== "all" && row.trend !== marketTrend) return false;
      if (!query) return true;
      return `${row.crop} ${row.market} ${row.unit} ${row.swahili}`
        .toLowerCase()
        .includes(query);
    });
  }, [marketQuery, marketTrend]);

  const marketPages = Math.max(1, Math.ceil(filteredMarkets.length / 6));
  const pagedMarkets = filteredMarkets.slice(
    (marketPage - 1) * 6,
    marketPage * 6,
  );

  const filteredBenchmarks = useMemo(() => {
    const query = benchQuery.toLowerCase().trim();
    const rows = BENCHMARK_METRICS.filter((row) =>
      query
        ? `${row.metric} ${row.swahili} ${row.unit}`
            .toLowerCase()
            .includes(query)
        : true,
    );
    return benchSort === "gap"
      ? [...rows].sort((a, b) => Math.abs(b.diffPct) - Math.abs(a.diffPct))
      : rows;
  }, [benchQuery, benchSort]);

  const filteredPlans = useMemo(() => {
    const query = libraryQuery.toLowerCase().trim();
    return plans.filter((row) => {
      if (libraryStatus !== "All" && row.status !== libraryStatus) return false;
      if (!query) return true;
      return `${row.name} ${row.crop} ${row.county} ${row.owner}`
        .toLowerCase()
        .includes(query);
    });
  }, [plans, libraryQuery, libraryStatus]);

  const filteredProducts = useMemo(() => {
    const query = productQuery.toLowerCase().trim();
    return FERT_PRODUCTS.filter((row) =>
      query
        ? `${row.name} ${row.grade} ${row.supplier} ${row.stage}`
            .toLowerCase()
            .includes(query)
        : true,
    );
  }, [productQuery]);

  const productPages = Math.max(1, Math.ceil(filteredProducts.length / 5));
  const pagedProducts = filteredProducts.slice(
    (productPage - 1) * 5,
    productPage * 5,
  );

  const acreValue = acresOf(planAcres) || 1;
  const budgetValue = budgetOf(planBudget) || 0;
  const planScale = acreValue / 2;
  const scaledTotal = Math.round(PLAN_TOTALS.grand * planScale);
  const overBudget = budgetValue > 0 && scaledTotal > budgetValue;
  const pagedPlanRows = SEASON_PLAN_ROWS.slice(
    (planPage - 1) * 8,
    planPage * 8,
  );
  const planRowPages = Math.max(1, Math.ceil(SEASON_PLAN_ROWS.length / 8));

  const recommended =
    FERT_PROGRAMS.find((row) => row.id === "fp-03") ?? FERT_PROGRAMS[2];
  const fertAcreValue = Number.parseFloat(fertAcres) || 0.5;
  const chosenProgramRow =
    FERT_PROGRAMS.find((row) => row.approach === chosenProgram) ?? recommended;
  const fertTotal = Math.round(chosenProgramRow.costPerAcre * fertAcreValue);
  const limeCost = soilApplied
    ? Math.round(
        (FERT_PRODUCTS.find((row) => row.name === "Agricultural lime")?.price ??
          900) *
          8 *
          fertAcreValue,
      )
    : 0;

  const pagedSessions = CHAT_SESSIONS;
  const pagedInsights = AI_INSIGHTS;

  /* ============================ handlers ============================ */

  const openModal = (id: ModalId) => {
    setMenu("none");
    setModal(id);
  };

  const openDrawer = (id: DrawerId) => {
    setMenu("none");
    setDrawer(id);
  };

  const changeRiskFilter = (value: typeof riskFilter) => {
    setRiskFilter(value);
    setRiskPage(1);
  };
  const changeRiskQuery = (value: string) => {
    setRiskQuery(value);
    setRiskPage(1);
  };
  const changeMarketQuery = (value: string) => {
    setMarketQuery(value);
    setMarketPage(1);
  };
  const changeMarketTrend = (value: typeof marketTrend) => {
    setMarketTrend(value);
    setMarketPage(1);
  };
  const changeProductQuery = (value: string) => {
    setProductQuery(value);
    setProductPage(1);
  };

  const addTask = (task: Omit<AdvisorTask, "id" | "status">) => {
    setTasks((rows) => [
      {
        ...task,
        id: `ai-task-${Date.now()}-${rows.length}`,
        status: "Scheduled",
      },
      ...rows,
    ]);
  };

  const appendMessages = (incoming: ChatMessage[]) => {
    setMessages((rows) => [...rows, ...incoming]);
  };

  const spendCredit = (amount: number) => {
    setCredits((value) => Math.max(0, value - amount));
  };

  /** Ask the advisor — real structured answer, or a routed fallback. */
  const ask = (promptId?: string) => {
    const text = (
      promptId
        ? (QUICK_PROMPTS.find((p) => p.id === promptId)?.prompt ?? "")
        : draft
    ).trim();
    if (!text) return;
    const at = new Date().toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const farmerMessage: ChatMessage = {
      id: `me-${Date.now()}`,
      role: "farmer",
      at,
      text,
      lang: swahiliFirst ? "SW" : "EN",
    };
    appendMessages([farmerMessage]);
    setDraft("");
    setTyping(true);

    const key =
      promptId ??
      QUICK_PROMPTS.find((quick) => quick.prompt === text)?.id ??
      routePrompt(text);
    const reply = (key && AI_REPLIES[key]) || CHAT_FALLBACK;

    window.setTimeout(() => {
      setTyping(false);
      appendMessages([
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          at,
          text: reply.text,
          blocks: reply.blocks,
          sources: reply.sources,
          confidence: reply.confidence,
          lang: reply.lang ?? (swahiliFirst ? "SW" : "EN"),
        },
      ]);
      spendCredit(1);
    }, 900);
  };

  const rateAnswer = (messageId: string, value: "up" | "down") => {
    setRated((rows) => ({ ...rows, [messageId]: value }));
    setFeedbackValue(value);
    setFeedbackNote("");
    openModal("feedback");
  };

  const switchSession = (id: string) => {
    setSessionId(id);
    const transcript = SESSION_TRANSCRIPTS[id];
    if (transcript) {
      setMessages(transcript);
    } else {
      const session = CHAT_SESSIONS.find((row) => row.id === id);
      setMessages([
        {
          id: `${id}-1`,
          role: "farmer",
          at: "09:00",
          text: session?.title ?? "Karibu — how can I help?",
        },
        {
          id: `${id}-2`,
          role: "ai",
          at: "09:00",
          text: session
            ? `${session.summary} Ask a follow-up and I will answer from your farm records.`
            : "Niko hapa — ask me anything about your farm.",
          blocks: [
            {
              kind: "chips",
              title: "Endelea hapa",
              chips: [
                { label: "Full season plan", action: "plan" },
                { label: "Check pest risk", action: "scout" },
                { label: "Market prices", action: "market" },
              ],
            },
          ],
          sources: ["GrowMO Agronomist v4.2"],
          confidence: 90,
        },
      ]);
    }
    setDrawer(null);
  };

  const runChatAction = (action: ChatAction) => {
    if (action === "plan") {
      setView("plan");
      openModal("plan");
      return;
    }
    if (action === "pay") {
      setPin("");
      openModal("pay");
      return;
    }
    if (action === "scan") {
      openModal("scan");
      return;
    }
    if (action === "treat") {
      setView("risk");
      openModal("treat");
      return;
    }
    if (action === "scout") {
      setView("risk");
      openModal("scout");
      return;
    }
    if (action === "irrigate") {
      setActiveInsight(AI_INSIGHTS.find((row) => row.id === "in-05") ?? null);
      openModal("insight");
      return;
    }
    if (action === "market") {
      setView("market");
      setMarketPage(1);
      return;
    }
    if (action === "sell") {
      setView("market");
      openModal("sell");
      return;
    }
    if (action === "compare") {
      setView("bench");
      return;
    }
    if (action === "fertilizer") {
      setView("inputs");
      openModal("fert");
      return;
    }
    if (action === "credits") {
      openModal("credits");
      return;
    }
    if (action === "export") {
      openModal("chat-export");
      return;
    }
    openModal("symptoms");
  };

  const exportTranscript = () => {
    const lines = [
      csvLine(["Time", "Speaker", "Message"]),
      ...messages.map((row) =>
        csvLine([
          row.at,
          row.role === "ai" ? "GrowMO AI" : ADVISOR_PROFILE.owner,
          row.text,
        ]),
      ),
    ];
    downloadText(
      `growmo-advisor-${sessionId}.csv`,
      lines.join("\n"),
      "text/csv",
    );
    setModal(null);
    toast.notify("Conversation exported as CSV", "success");
  };

  const exportPlan = (kind: "csv" | "text") => {
    if (kind === "csv") {
      const lines = [
        csvLine([
          "Week",
          "Date",
          "Activity",
          "Input",
          "Qty",
          "Cost (KES)",
          "Labour",
          "Labour cost (KES)",
        ]),
        ...SEASON_PLAN_ROWS.map((row) =>
          csvLine([
            row.week,
            row.date,
            row.activity,
            row.input,
            row.qty,
            row.cost,
            row.labour,
            row.labourCost,
          ]),
        ),
        csvLine([
          "",
          "",
          "TOTALS",
          "",
          "",
          PLAN_TOTALS.inputs,
          "",
          PLAN_TOTALS.labour,
        ]),
        csvLine(["", "", "GRAND TOTAL", "", "", PLAN_TOTALS.grand, "", ""]),
      ];
      downloadText(
        `growmo-season-plan-${planCrop.toLowerCase()}.csv`,
        lines.join("\n"),
        "text/csv",
      );
    } else {
      const body = [
        `GrowMO season plan — ${planCrop}, ${planAcres}, ${planCounty}`,
        `Planting ${planMonth} · budget ${kes(budgetValue)} · goal ${planGoal}`,
        "",
        ...SEASON_PLAN_ROWS.map(
          (row) =>
            `Week ${row.week} · ${row.date} · ${row.activity} · ${row.input} ${row.qty} · ${kes(row.cost + row.labourCost)}`,
        ),
        "",
        `Inputs ${kes(PLAN_TOTALS.inputs)} · Labour ${kes(PLAN_TOTALS.labour)} · Grand total ${kes(PLAN_TOTALS.grand)}`,
      ].join("\n");
      downloadText(
        `growmo-season-plan-${planCrop.toLowerCase()}.txt`,
        body,
        "text/plain",
      );
    }
    setModal(null);
    toast.notify("Season plan exported", "success");
  };

  const exportMarket = () => {
    const lines = [
      csvLine([
        "Crop",
        "Market",
        "Unit",
        "Today",
        "1-month low",
        "1-month high",
        "3-month low",
        "3-month high",
        "Trend",
        "Advice",
      ]),
      ...filteredMarkets.map((row) =>
        csvLine([
          row.crop,
          row.market,
          row.unit,
          row.current,
          row.month1Low,
          row.month1High,
          row.month3Low,
          row.month3High,
          row.trendLabel,
          row.advice,
        ]),
      ),
    ];
    downloadText("growmo-market-forecast.csv", lines.join("\n"), "text/csv");
    toast.notify("Market forecast downloaded", "success");
  };

  const exportBenchmark = () => {
    const lines = [
      csvLine([
        "Metric",
        "Your farm",
        "County average",
        "Top 10%",
        "Difference %",
      ]),
      ...filteredBenchmarks.map((row) =>
        csvLine([row.metric, row.yours, row.countyAvg, row.top10, row.diffPct]),
      ),
    ];
    downloadText(
      `growmo-benchmark-${peer.county.toLowerCase().replace(/[^a-z]/g, "")}.csv`,
      lines.join("\n"),
      "text/csv",
    );
    setModal(null);
    toast.notify("Benchmark report downloaded", "success");
  };

  const confirmPayment = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setPin("");
      setWallet((value) => Math.max(0, value - 3000));
      setPayRef(`QGH${Math.floor(1000 + Math.random() * 8999)}K4`);
      setModal(null);
      toast.notify("KES 3,000 sent to 3 workers by M-Pesa", "success");
      appendMessages([
        {
          id: `pay-${Date.now()}`,
          role: "ai",
          at: new Date().toLocaleTimeString("en-KE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          text: "Imekamilika — KES 3,000 zimetumwa kwa wachungaji watatu. Receipt imehifadhiwa kwenye Ledger.",
          sources: ["Safaricom M-Pesa B2C"],
          confidence: 100,
          lang: "SW",
        },
      ]);
    }, 1100);
  };

  const confirmCredits = () => {
    const plan = CREDIT_PLANS.find((row) => row.id === creditPlan);
    if (!plan) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setPin("");
      setWallet((value) => Math.max(0, value - plan.price));
      setCredits((value) => value + plan.credits);
      setModal(null);
      toast.notify(
        `${plan.name} activated — ${plan.credits} credits added`,
        "success",
      );
    }, 1000);
  };

  const confirmFertilizerOrder = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setPin("");
      const total = fertTotal + limeCost;
      setWallet((value) => Math.max(0, value - total));
      addTask({
        title: `Apply ${chosenProgram} fertilizer program`,
        detail: `${chosenProgramRow.program} across ${fertAcreValue} acres`,
        due: "Within 7 days",
        plot: "Plot 1: Shamba ya nyumba",
        cost: total,
        source: "AI input optimization",
      });
      setModal(null);
      toast.notify(`${kes(total)} reserved · inputs ordered`, "success");
    }, 1000);
  };

  /* ============================ render ============================ */

  return (
    <div>
      <Reveal>
        <header className="gm-ai-hero">
          <div className="d-flex flex-wrap gap-4 align-items-start">
            <div style={{ flex: "1 1 320px" }}>
              <span className="gm-eyebrow on-dark">
                <span className="dot" /> Page 9 · AI advisor &amp; predictive
                engine
              </span>
              <div className="d-flex align-items-center gap-3 mt-2">
                <span className="gm-ai-ava-lg">
                  <Bot width={30} height={30} />
                </span>
                <div>
                  <h1
                    className="font-display mb-1"
                    style={{ color: "var(--gm-card)", fontSize: "1.55rem" }}
                  >
                    GrowMO Agronomist
                  </h1>
                  <p className="gm-lead on-dark mb-0">
                    {ADVISOR_PROFILE.modelVersion} · {ADVISOR_PROFILE.language}
                  </p>
                </div>
              </div>
              <p className="gm-lead on-dark mt-3 mb-2">
                Your personal agronomist — {ADVISOR_PROFILE.farm},{" "}
                {ADVISOR_PROFILE.subCounty}, {ADVISOR_PROFILE.county} County ·{" "}
                {ADVISOR_PROFILE.acres} acres across {ADVISOR_PROFILE.plots}{" "}
                plots.
              </p>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="gm-chip gm-chip-lime">
                  <Sparkles width={13} height={13} /> {ADVISOR_PROFILE.plan}
                </span>
                <span className="gm-chip gm-chip-ghost">
                  <BadgeCheck width={13} height={13} />{" "}
                  {ADVISOR_PROFILE.accuracy}% accuracy
                </span>
                <span className="gm-chip gm-chip-ghost">
                  <History width={13} height={13} />{" "}
                  {ADVISOR_PROFILE.seasonsLearned} seasons learned
                </span>
              </div>
              <div className="gm-ai-credit mt-3">
                <Coins width={16} height={16} />
                <div style={{ flex: "1 1 160px" }}>
                  <small>AI credits this month</small>
                  <strong className="font-display">
                    {credits} / {ADVISOR_PROFILE.creditsTotal} left
                  </strong>
                </div>
                <span className="gm-ai-credit-track">
                  <i
                    style={{
                      width: `${Math.round((credits / ADVISOR_PROFILE.creditsTotal) * 100)}%`,
                    }}
                  />
                </span>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime gm-btn-sm"
                  onClick={() => openModal("credits")}
                >
                  Top up
                </button>
              </div>
            </div>

            <div style={{ flex: "1 1 280px" }}>
              <div className="gm-ai-hero-strip">
                {ADVISOR_STATS.map((stat) => (
                  <div key={stat.id}>
                    <small>{stat.label}</small>
                    <strong className="font-display">{stat.value}</strong>
                    <small style={{ textTransform: "none", letterSpacing: 0 }}>
                      {stat.note}
                    </small>
                  </div>
                ))}
              </div>
              <div className="gm-ai-hero-actions mt-3">
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={() => {
                    setView("chat");
                    setDraft("");
                  }}
                >
                  <MessageSquare /> Ask the advisor
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => {
                    setView("plan");
                    openModal("plan");
                  }}
                >
                  <CalendarDays /> Generate season plan
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("scan")}
                >
                  <Camera /> Scan a leaf
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-ghost"
                  onClick={() => openModal("voice")}
                >
                  <Mic /> Voice &amp; USSD
                </button>
                <div
                  className={`gm-dropdown ${menu === "more" ? "is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="gm-btn gm-btn-ghost"
                    onClick={() => setMenu(menu === "more" ? "none" : "more")}
                    aria-expanded={menu === "more"}
                  >
                    <MoreHorizontal /> More
                  </button>
                  <div className="gm-dropdown-menu">
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openModal("models")}
                    >
                      <Cpu width={15} height={15} /> Model library
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openDrawer("sources")}
                    >
                      <Database width={15} height={15} /> Data sources
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openModal("language")}
                    >
                      <Languages width={15} height={15} /> Language &amp; voice
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openModal("chat-export")}
                    >
                      <FileDown width={15} height={15} /> Export conversation
                    </button>
                    <button
                      type="button"
                      className="gm-dropdown-item"
                      onClick={() => openModal("chat-share")}
                    >
                      <Share2 width={15} height={15} /> Share with agronomist
                    </button>
                  </div>
                </div>
              </div>
              {menu === "more" ? (
                <button
                  type="button"
                  className="gm-drop-close"
                  aria-label="Close menu"
                  onClick={() => setMenu("none")}
                />
              ) : null}
            </div>
          </div>
        </header>
      </Reveal>

      {/* created tasks from AI actions */}
      {tasks.length ? (
        <div className="gm-card p-3 mt-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div>
              <span className="gm-eyebrow">Scheduled by the AI</span>
              <h2 className="gm-h-section mb-0" style={{ fontSize: "1.15rem" }}>
                {tasks.length} task{tasks.length === 1 ? "" : "s"} from this
                session
              </h2>
            </div>
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => openDrawer("tasks")}
            >
              <ListChecks width={15} height={15} /> Review all
            </button>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {tasks.slice(0, 3).map((task) => (
              <button
                key={task.id}
                type="button"
                className="gm-ai-feed-btn"
                style={{ flex: "1 1 240px" }}
                onClick={() => {
                  setActiveTask(task);
                  openModal("task");
                }}
              >
                <strong className="d-block">{task.title}</strong>
                <small className="text-muted">
                  {task.due} · {task.plot} · {kes(task.cost)}
                </small>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Reveal>
        <div className="mt-4">
          <PlannerSubtabs
            label="Advisor sections"
            value={view}
            items={VIEW_ITEMS}
            onChange={(value) => setView(value)}
          />
        </div>
      </Reveal>

      {view === "chat" ? (
        <ChatView
          messages={messages}
          typing={typing}
          draft={draft}
          voice={voice}
          credits={credits}
          rated={rated}
          sessionId={sessionId}
          sessions={pagedSessions}
          insights={pagedInsights}
          wallet={wallet}
          threadRef={threadRef}
          onDraft={setDraft}
          onAsk={() => ask()}
          onQuick={(id) => ask(id)}
          onToggleVoice={() => setVoice((value) => !value)}
          onRate={rateAnswer}
          onAction={runChatAction}
          onSession={switchSession}
          onOpenSessions={() => openDrawer("sessions")}
          onOpenInsight={(insight) => {
            setActiveInsight(insight);
            openModal("insight");
          }}
          onOpenInsights={() => openDrawer("insights")}
          onScan={() => openModal("scan")}
          onSymptoms={() => openModal("symptoms")}
          onClear={() => openModal("chat-clear")}
          onShare={() => openModal("chat-share")}
          onExport={() => openModal("chat-export")}
        />
      ) : null}

      {view === "plan" ? (
        <PlanView
          plans={plans}
          filteredPlans={filteredPlans}
          generated={generated}
          rows={pagedPlanRows}
          pages={planRowPages}
          page={planPage}
          planTab={planTab}
          inputs={{
            planCrop,
            planAcres,
            planCounty,
            planMonth,
            planBudget,
            planSoil,
            planWater,
            planGoal,
          }}
          scaledTotal={scaledTotal}
          overBudget={overBudget}
          budgetValue={budgetValue}
          libraryQuery={libraryQuery}
          libraryStatus={libraryStatus}
          onLibraryQuery={setLibraryQuery}
          onLibraryStatus={setLibraryStatus}
          onOpenWizard={() => openModal("plan")}
          onOpenPlan={(plan) => {
            setActivePlan(plan);
            setPlanTab("activities");
            openModal("plan-detail");
          }}
          onPage={setPlanPage}
          onTab={setPlanTab}
          onExport={() => openModal("plan-export")}
          onShare={() => openModal("plan-share")}
          onDelete={(plan) => {
            setActivePlan(plan);
            openModal("confirm-plan");
          }}
        />
      ) : null}

      {view === "risk" ? (
        <RiskView
          risks={pagedRisks}
          total={filteredRisks.length}
          pages={riskPages}
          page={riskPage}
          filter={riskFilter}
          query={riskQuery}
          mine={riskMine}
          scouts={pagedScouts}
          scoutPages={scoutPages}
          scoutPage={scoutPage}
          onFilter={changeRiskFilter}
          onQuery={changeRiskQuery}
          onMine={() => setRiskMine((value) => !value)}
          onPage={setRiskPage}
          onScoutPage={setScoutPage}
          onOpen={(risk) => {
            setActiveRisk(risk);
            openModal("risk-detail");
          }}
          onTreat={() => openModal("treat")}
          onScout={() => openModal("scout")}
          onRules={() => openModal("risk-rules")}
          onSymptoms={() => openModal("symptoms")}
        />
      ) : null}

      {view === "market" ? (
        <MarketView
          markets={pagedMarkets}
          total={filteredMarkets.length}
          pages={marketPages}
          page={marketPage}
          query={marketQuery}
          trend={marketTrend}
          alerts={alerts}
          onQuery={changeMarketQuery}
          onTrend={changeMarketTrend}
          onPage={setMarketPage}
          onOpen={(market) => {
            setActiveMarket(market);
            openModal("market-detail");
          }}
          onSell={() => openModal("sell")}
          onAlert={() => openModal("price-alert")}
          onDelete={(alert) => {
            setAlertToDelete(alert);
            openModal("confirm-alert");
          }}
          onToggle={(id) =>
            setAlerts((rows) =>
              rows.map((row) =>
                row.id === id
                  ? {
                      ...row,
                      status: row.status === "Paused" ? "Armed" : "Paused",
                    }
                  : row,
              ),
            )
          }
          onExport={exportMarket}
        />
      ) : null}

      {view === "bench" ? (
        <BenchView
          peer={peer}
          metrics={filteredBenchmarks}
          sort={benchSort}
          query={benchQuery}
          onSort={setBenchSort}
          onQuery={setBenchQuery}
          onPeers={() => openModal("bench-peers")}
          onPeer={(id) => setPeerId(id)}
          onDetail={(metric) => {
            setActiveMetric(metric);
            openModal("bench-detail");
          }}
          onReport={() => openModal("bench-report")}
        />
      ) : null}

      {view === "inputs" ? (
        <InputsView
          programs={FERT_PROGRAMS}
          products={pagedProducts}
          productPages={productPages}
          productPage={productPage}
          productQuery={productQuery}
          acres={fertAcreValue}
          chosen={chosenProgram}
          soilApplied={soilApplied}
          onAcres={setFertAcres}
          onChosen={setChosenProgram}
          onSoil={() => setSoilApplied((value) => !value)}
          onProductQuery={changeProductQuery}
          onProductPage={setProductPage}
          onOpen={(program) => {
            setActiveProgram(program);
            openModal("fert-program");
          }}
          onCalculator={() => openModal("fert")}
          onOrder={() => openModal("fert-order")}
        />
      ) : null}

      {/* ============================ drawers ============================ */}

      <DashboardDrawer
        open={drawer === "sessions"}
        title="Conversation history"
        onClose={() => setDrawer(null)}
        footer={
          <div className="d-flex gap-2">
            <button
              type="button"
              className="gm-btn gm-btn-outline gm-btn-sm"
              onClick={() => openModal("chat-export")}
            >
              <FileDown width={15} height={15} /> Export all
            </button>
            <button
              type="button"
              className="gm-btn gm-btn-lime gm-btn-sm"
              onClick={() => {
                setDrawer(null);
                setView("chat");
              }}
            >
              Back to chat
            </button>
          </div>
        }
      >
        <div className="gm-search-field mb-3">
          <Filter />
          <input
            className="gm-input"
            placeholder="Search conversations…"
            aria-label="Search conversations"
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
          />
        </div>
        <div className="d-flex flex-column gap-2">
          {pagedSessions
            .filter((row) =>
              libraryQuery
                ? `${row.title} ${row.crop} ${row.summary}`
                    .toLowerCase()
                    .includes(libraryQuery.toLowerCase())
                : true,
            )
            .map((session) => (
              <button
                key={session.id}
                type="button"
                className={`gm-ai-session ${session.id === sessionId ? "is-active" : ""}`}
                onClick={() => switchSession(session.id)}
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <strong>{session.title}</strong>
                  {session.pinned ? (
                    <StatusChip label="Pinned" tone="low" />
                  ) : null}
                </div>
                <small>
                  {session.started} · {session.turns} turns · {session.lang}
                </small>
                <small>{session.summary}</small>
                <small className="fw-bold">{session.outcome}</small>
              </button>
            ))}
        </div>
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "insights"}
        title="Proactive AI insights"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm gm-btn-block"
            onClick={() => openModal("risk-rules")}
          >
            <Bell width={15} height={15} /> Alert rules
          </button>
        }
      >
        <div className="d-flex flex-column gap-2">
          {pagedInsights.map((insight) => (
            <button
              key={insight.id}
              type="button"
              className="gm-ai-feed-btn"
              onClick={() => {
                setActiveInsight(insight);
                setDrawer(null);
                openModal("insight");
              }}
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong className="d-block">{insight.title}</strong>
                <StatusChip label={insight.crop} tone={insight.tone} />
              </div>
              <small className="text-muted">{insight.detail}</small>
              <small className="text-muted">
                {insight.source} · {insight.at}
              </small>
            </button>
          ))}
        </div>
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "library"}
        title="Saved season plans"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-lime gm-btn-sm gm-btn-block"
            onClick={() => {
              setDrawer(null);
              openModal("plan");
            }}
          >
            <Sparkles width={15} height={15} /> New plan
          </button>
        }
      >
        <div className="d-flex flex-wrap gap-2 mb-3">
          {["All", "Draft", "Active", "Completed"].map((status) => (
            <button
              key={status}
              type="button"
              className={`gm-filter-chip ${libraryStatus === status ? "is-active" : ""}`}
              onClick={() => setLibraryStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="d-flex flex-column gap-2">
          {filteredPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="gm-ai-feed-btn"
              onClick={() => {
                setActivePlan(plan);
                setDrawer(null);
                openModal("plan-detail");
              }}
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong>{plan.name}</strong>
                <StatusChip
                  label={plan.status}
                  tone={
                    plan.status === "Completed"
                      ? "low"
                      : plan.status === "Active"
                        ? "medium"
                        : "neutral"
                  }
                />
              </div>
              <small className="text-muted">
                {plan.county} · {plan.acres} acres · {plan.activities}{" "}
                activities
              </small>
              <small className="text-muted">
                {kes(plan.spent)} spent of {kes(plan.budget)}
              </small>
            </button>
          ))}
        </div>
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "sources"}
        title="Data behind the advice"
        onClose={() => setDrawer(null)}
        footer={
          <button
            type="button"
            className="gm-btn gm-btn-outline gm-btn-sm gm-btn-block"
            onClick={() => openModal("models")}
          >
            <Cpu width={15} height={15} /> Model library
          </button>
        }
      >
        <div className="d-flex flex-column gap-2">
          {ADVISOR_SOURCES.map((source) => (
            <div key={source.id} className="gm-ai-fact">
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong
                  className="font-display"
                  style={{ fontSize: "0.95rem" }}
                >
                  {source.name}
                </strong>
                <StatusChip
                  label={source.trust}
                  tone={
                    source.trust === "Official"
                      ? "low"
                      : source.trust === "Primary"
                        ? "medium"
                        : "neutral"
                  }
                />
              </div>
              <small className="text-muted">
                {source.kind} · {source.feed}
              </small>
              <small className="text-muted">Updated {source.updated}</small>
            </div>
          ))}
        </div>
        <AiNote title="Karibu uwazi" tone="ok">
          Your own farm records are the primary source. Benchmarking data is
          opt-in and always anonymised — no peer ever sees your farm.
        </AiNote>
      </DashboardDrawer>

      <DashboardDrawer
        open={drawer === "tasks"}
        title="Tasks the AI scheduled"
        onClose={() => setDrawer(null)}
        footer={
          <Link
            to="/app/planner"
            className="gm-btn gm-btn-lime gm-btn-sm gm-btn-block"
          >
            Open the crop planner
          </Link>
        }
      >
        {tasks.length ? (
          <div className="d-flex flex-column gap-2">
            {tasks.map((task) => (
              <div key={task.id} className="gm-check-row">
                <div>
                  <strong className="d-block">{task.title}</strong>
                  <small className="text-muted">{task.detail}</small>
                  <small className="text-muted">
                    {task.due} · {task.plot} · {task.source}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="font-display" style={{ fontWeight: 700 }}>
                    {kes(task.cost)}
                  </span>
                  <StatusChip
                    label={task.status}
                    tone={taskTone(task.status)}
                  />
                  <button
                    type="button"
                    className="gm-icon-btn"
                    aria-label={`Open ${task.title}`}
                    onClick={() => {
                      setActiveTask(task);
                      setDrawer(null);
                      openModal("task");
                    }}
                  >
                    <Eye width={15} height={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AiEmpty>
            No AI-scheduled tasks yet. Ask the advisor to plan a spray, a
            scouting round or a season and it will appear here.
          </AiEmpty>
        )}
      </DashboardDrawer>

      <AdvisorFaqs />

      {/* ============================ 34 dialogs ============================ */}

      <Dialog
        open={modal === "plan"}
        onClose={() => setModal(null)}
        title="Crop plan generator"
        desc="Section 9.2 — eight inputs in, a full season out."
        wide
      >
        <PlanWizard
          values={{
            planCrop,
            planAcres,
            planCounty,
            planMonth,
            planBudget,
            planSoil,
            planWater,
            planGoal,
          }}
          scaledTotal={scaledTotal}
          budgetValue={budgetValue}
          overBudget={overBudget}
          busy={false}
          onChange={(field, value) => {
            if (field === "planCrop") setPlanCrop(value);
            if (field === "planAcres") setPlanAcres(value);
            if (field === "planCounty") setPlanCounty(value);
            if (field === "planMonth") setPlanMonth(value);
            if (field === "planBudget") setPlanBudget(value);
            if (field === "planSoil") setPlanSoil(value);
            if (field === "planWater") setPlanWater(value);
            if (field === "planGoal") setPlanGoal(value);
          }}
          onGenerate={() => {
            setGenerated(true);
            setPlanPage(1);
            setPlans((rows) => [
              {
                id: `pl-gen-${Date.now()}`,
                name: `${planCrop} · ${planAcres} · ${planCounty}`,
                crop: planCrop,
                county: planCounty,
                acres: acresOf(planAcres),
                month: planMonth,
                budget: scaledTotal,
                spent: 0,
                activities: SEASON_PLAN_ROWS.length,
                created: "Just now",
                status: "Draft",
                expectedProfit: PLAN_SCENARIOS[1].profit,
                owner: ADVISOR_PROFILE.owner,
              },
              ...rows,
            ]);
            toast.notify(
              "Season plan generated and saved as a draft",
              "success",
            );
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "plan-detail" && !!activePlan}
        onClose={() => setModal(null)}
        title="Saved season plan"
        wide
      >
        {activePlan ? (
          <PlanDetailModal
            plan={activePlan}
            tab={planTab}
            onTab={setPlanTab}
            onExport={() => exportPlan("csv")}
            onShare={() => setModal("plan-share")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "plan-export"}
        onClose={() => setModal(null)}
        title="Export the season plan"
        desc="Pick a format — the file downloads straight to your device."
      >
        <ExportPicker
          options={[
            {
              id: "csv",
              label: "CSV spreadsheet",
              detail: "Week, date, activity, input, qty, cost, labour",
              icon: <Table2 width={18} height={18} />,
            },
            {
              id: "text",
              label: "Plain text field file",
              detail: "Printable one-line-per-activity list",
              icon: <FileText width={18} height={18} />,
            },
            {
              id: "planner",
              label: "Push to the crop planner",
              detail: "Creates scheduled tasks in /app/planner",
              icon: <CalendarDays width={18} height={18} />,
            },
          ]}
          onExport={(id) => {
            if (id === "planner") {
              setModal(null);
              addTask({
                title: `${planCrop} season plan · ${planAcres}`,
                detail: `${SEASON_PLAN_ROWS.length} activities pushed from the AI generator`,
                due: `${planMonth} 2027`,
                plot: planCounty,
                cost: scaledTotal,
                source: "Crop plan generator",
              });
              toast.notify("Season plan pushed to the crop planner", "success");
              return;
            }
            exportPlan(id === "csv" ? "csv" : "text");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "plan-share"}
        onClose={() => setModal(null)}
        title="Share the season plan"
        desc="Send it to your cooperative, agronomist or a family member."
      >
        <ShareModal
          title="Season plan"
          desc="Shares the activity calendar, budget and revenue scenarios."
          onSend={(channel) => {
            setModal(null);
            toast.notify(`Season plan sent via ${channel}`, "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "confirm-plan" && !!activePlan}
        onClose={() => setModal(null)}
        title="Delete this plan?"
      >
        {activePlan ? (
          <ConfirmDialog
            title="Delete plan"
            desc={`${activePlan.name} and its ${activePlan.activities} activities will be removed from your library. This cannot be undone.`}
            confirmLabel="Delete plan"
            onConfirm={() => {
              setPlans((rows) =>
                rows.filter((row) => row.id !== activePlan.id),
              );
              setModal(null);
              toast.notify("Plan deleted", "info");
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "scan"}
        onClose={() => setModal(null)}
        title="Scan a leaf"
        desc="Leaf Vision v3.7 · 5 AI credits per scan"
        wide
      >
        <ScanWizard
          onClose={() => setModal(null)}
          onSave={(task) => {
            addTask(task);
            spendCredit(5);
            setModal(null);
            toast.notify("Diagnosis saved · treatment scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "pay"}
        onClose={() => setModal(null)}
        title="Pay casuals by M-Pesa"
        desc="Three payments of KES 1,000 from your GrowMO wallet."
      >
        <PayModal
          balance={wallet}
          pin={pin}
          busy={busy}
          receipt={payRef}
          onPin={setPin}
          onConfirm={confirmPayment}
          onClose={() => {
            setPin("");
            setPayRef(null);
            setModal(null);
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "symptoms"}
        onClose={() => setModal(null)}
        title="Symptom checker"
        desc="Describe what you see — the advisor narrows it to the most likely cause."
        wide
      >
        <SymptomChecker
          onClose={() => setModal(null)}
          onTreat={() => {
            setModal("treat");
            setView("risk");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "treat"}
        onClose={() => setModal(null)}
        title="Plan a spray round"
        desc="Product, dose, timing and cost — straight into your task list."
        wide
      >
        <TreatWizard
          risk={activeRisk ?? PEST_RISKS[0]}
          acres={fertAcres}
          onClose={() => setModal(null)}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Spray round scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "scout"}
        onClose={() => setModal(null)}
        title="Schedule a scouting round"
        desc="The risk model learns from what your team finds in the field."
      >
        <ScoutWizard
          onClose={() => setModal(null)}
          onSave={(task) => {
            addTask(task);
            setModal(null);
            toast.notify("Scouting round scheduled", "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "risk-detail" && !!activeRisk}
        onClose={() => setModal(null)}
        title="Risk detail"
        wide
      >
        {activeRisk ? (
          <RiskDetailModal
            risk={activeRisk}
            onTreat={() => setModal("treat")}
            onScout={() => setModal("scout")}
            onIgnore={() => setModal("confirm-risk")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "risk-rules"}
        onClose={() => setModal(null)}
        title="Alert rules"
        desc="Decide when the advisor is allowed to interrupt you."
      >
        <RiskRulesModal
          onClose={() => setModal(null)}
          onSave={(summary) => {
            setModal(null);
            toast.notify(`Alert rules saved · ${summary}`, "success");
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "confirm-risk"}
        onClose={() => setModal(null)}
        title="Dismiss this risk?"
      >
        <ConfirmDialog
          title="Dismiss risk"
          desc={`${activeRisk?.pest ?? "This risk"} will be hidden from the risk list for 14 days. The model keeps watching and will raise it again if conditions worsen.`}
          confirmLabel="Dismiss for 14 days"
          onConfirm={() => {
            if (activeRisk) {
              setIgnoredRisks((rows) => [...rows, activeRisk.id]);
            }
            setModal(null);
            toast.notify("Risk dismissed for 14 days", "info");
          }}
          onClose={() => setModal("risk-detail")}
        />
      </Dialog>

      <Dialog
        open={modal === "market-detail" && !!activeMarket}
        onClose={() => setModal(null)}
        title="Price forecast model"
        wide
      >
        {activeMarket ? (
          <MarketDetailModal
            market={activeMarket}
            onAlert={() => setModal("price-alert")}
            onSell={() => setModal("sell")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "price-alert"}
        onClose={() => setModal(null)}
        title="New price alert"
        desc="Get an SMS the moment a market crosses your target."
      >
        <PriceAlertWizard
          onClose={() => setModal(null)}
          onSave={(alert) => {
            setAlerts((rows) => [
              {
                ...alert,
                id: `pa-new-${Date.now()}`,
                status: "Armed",
                created: "Just now",
                lastCheck: "Today 06:00",
              },
              ...rows,
            ]);
            setModal(null);
            toast.notify(
              `Alert armed · ${alert.crop} ${alert.condition} ${kes(alert.target)}`,
              "success",
            );
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "sell"}
        onClose={() => setModal(null)}
        title="Sell now or hold?"
        desc="Modelled from Price Compass v3.1 and your store condition."
        wide
      >
        <SellModal
          market={activeMarket}
          onAlert={() => setModal("price-alert")}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "confirm-alert"}
        onClose={() => setModal(null)}
        title="Delete this alert?"
      >
        <ConfirmDialog
          title="Delete price alert"
          desc={`The ${alertToDelete?.crop ?? "price"} alert on ${alertToDelete?.market ?? "this market"} will stop checking at 06:00 tomorrow.`}
          confirmLabel="Delete alert"
          onConfirm={() => {
            if (alertToDelete) {
              setAlerts((rows) =>
                rows.filter((row) => row.id !== alertToDelete.id),
              );
            }
            setAlertToDelete(null);
            setModal(null);
            toast.notify("Price alert deleted", "info");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "bench-detail" && !!activeMetric}
        onClose={() => setModal(null)}
        title="Benchmark detail"
        wide
      >
        {activeMetric ? (
          <MetricDetailModal
            metric={activeMetric}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "bench-peers"}
        onClose={() => setModal(null)}
        title="Choose a peer group"
        desc="Narrow groups give sharper comparisons."
        wide
      >
        <PeerPicker
          peerId={peerId}
          onPick={(id) => {
            setPeerId(id);
            toast.notify("Peer group updated", "info");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "bench-report"}
        onClose={() => setModal(null)}
        title="Benchmark report"
        desc="One page, ready for a lender or your cooperative."
        wide
      >
        <ReportModal
          peer={peer}
          onExport={exportBenchmark}
          onShare={() => setModal("chat-share")}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "fert"}
        onClose={() => setModal(null)}
        title="Fertilizer calculator"
        desc="Section 9.6 — priced from your soil test and local stockists."
        wide
      >
        <FertWizard
          acres={fertAcres}
          chosen={chosenProgram}
          soilApplied={soilApplied}
          total={fertTotal}
          lime={limeCost}
          onAcres={setFertAcres}
          onChosen={setChosenProgram}
          onSoil={() => setSoilApplied((value) => !value)}
          onApply={() => setModal("fert-order")}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "fert-program" && !!activeProgram}
        onClose={() => setModal(null)}
        title="Fertilizer schedule"
        wide
      >
        {activeProgram ? (
          <ProgramScheduleModal
            program={activeProgram}
            acres={fertAcreValue}
            onOrder={() => setModal("fert-order")}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "fert-order"}
        onClose={() => setModal(null)}
        title="Order the inputs"
        desc="Stock is held for 48 hours at the agro vet."
      >
        <OrderModal
          total={fertTotal + limeCost}
          wallet={wallet}
          busy={busy}
          onConfirm={confirmFertilizerOrder}
          onClose={() => {
            setPin("");
            setModal(null);
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "credits"}
        onClose={() => setModal(null)}
        title="AI credits & plans"
        desc="Credits pay for chats, scans, plans and forecast refreshes."
        wide
      >
        <CreditsWizard
          planId={creditPlan}
          balance={wallet}
          busy={busy}
          onPlan={setCreditPlan}
          onConfirm={confirmCredits}
          onClose={() => {
            setPin("");
            setModal(null);
          }}
        />
      </Dialog>

      <Dialog
        open={modal === "models"}
        onClose={() => setModal(null)}
        title="Model library"
        desc="What runs behind every answer on this page."
        wide
      >
        <ModelsModal onClose={() => setModal(null)} />
      </Dialog>

      <Dialog
        open={modal === "chat-share"}
        onClose={() => setModal(null)}
        title="Share this conversation"
        desc="Send the transcript to your agronomist or cooperative officer."
      >
        <ShareModal
          title="Conversation"
          desc={`Shares ${messages.length} messages from this session.`}
          onSend={(channel) => {
            setModal(null);
            toast.notify(`Conversation sent via ${channel}`, "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "chat-clear"}
        onClose={() => setModal(null)}
        title="Clear this conversation?"
      >
        <ConfirmDialog
          title="Clear conversation"
          desc="All messages in this session will be removed from the screen. Your history entry and any tasks you created stay saved."
          confirmLabel="Clear conversation"
          onConfirm={() => {
            setMessages([]);
            setModal(null);
            toast.notify("Conversation cleared", "info");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "chat-export"}
        onClose={() => setModal(null)}
        title="Export the conversation"
      >
        <ExportPicker
          options={[
            {
              id: "csv",
              label: "CSV transcript",
              detail: "Time, speaker, message — opens in Excel",
              icon: <Table2 width={18} height={18} />,
            },
            {
              id: "text",
              label: "Plain text",
              detail: "Readable transcript for printing",
              icon: <FileText width={18} height={18} />,
            },
          ]}
          onExport={(id) => {
            if (id === "csv") {
              exportTranscript();
              return;
            }
            const body = messages
              .map(
                (row) =>
                  `${row.at} ${row.role === "ai" ? "GrowMO AI" : ADVISOR_PROFILE.owner}: ${row.text}`,
              )
              .join("\n\n");
            downloadText(`growmo-advisor-${sessionId}.txt`, body, "text/plain");
            setModal(null);
            toast.notify("Transcript downloaded", "success");
          }}
          onClose={() => setModal(null)}
        />
      </Dialog>

      <Dialog
        open={modal === "feedback" && !!feedbackValue}
        onClose={() => setModal(null)}
        title="Answer feedback"
        desc="Every rating retrains the advisor for your farm."
      >
        {feedbackValue ? (
          <FeedbackModal
            value={feedbackValue}
            note={feedbackNote}
            onNote={setFeedbackNote}
            onSubmit={() => {
              setModal(null);
              toast.notify(
                "Thanks — feedback sent to the model team",
                "success",
              );
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "insight" && !!activeInsight}
        onClose={() => setModal(null)}
        title="AI insight"
        wide
      >
        {activeInsight ? (
          <InsightModal
            insight={activeInsight}
            onAction={(action) => {
              setModal(null);
              runChatAction(action);
            }}
            onClose={() => {
              setActiveInsight(null);
              setModal(null);
            }}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "task" && !!activeTask}
        onClose={() => setModal(null)}
        title="AI-scheduled task"
      >
        {activeTask ? (
          <TaskModal
            task={activeTask}
            onDone={() => {
              setTasks((rows) =>
                rows.map((row) =>
                  row.id === activeTask.id ? { ...row, status: "Done" } : row,
                ),
              );
              setModal(null);
              toast.notify("Task marked done", "success");
            }}
            onDelete={() => {
              setTaskToDelete(activeTask);
              setModal("confirm-task");
            }}
            onClose={() => setModal(null)}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={modal === "confirm-task"}
        onClose={() => setModal(null)}
        title="Delete this task?"
      >
        <ConfirmDialog
          title="Delete task"
          desc={`${taskToDelete?.title ?? "This task"} will be removed from your AI task list.`}
          confirmLabel="Delete task"
          onConfirm={() => {
            if (taskToDelete) {
              setTasks((rows) =>
                rows.filter((row) => row.id !== taskToDelete.id),
              );
            }
            setTaskToDelete(null);
            setModal(null);
            toast.notify("Task deleted", "info");
          }}
          onClose={() => setModal("task")}
        />
      </Dialog>

      <Dialog
        open={modal === "voice"}
        onClose={() => setModal(null)}
        title="Ask by voice or USSD"
        desc="Works without a data connection."
      >
        <VoiceModal onClose={() => setModal(null)} />
      </Dialog>

      <Dialog
        open={modal === "language"}
        onClose={() => setModal(null)}
        title="Language & voice settings"
      >
        <LanguageModal
          swahiliFirst={swahiliFirst}
          offline={offlineMode}
          onSwahili={() => setSwahiliFirst((value) => !value)}
          onOffline={() => setOfflineMode((value) => !value)}
          onClose={() => {
            setModal(null);
            toast.notify("Advisor settings saved", "success");
          }}
        />
      </Dialog>
    </div>
  );
}

/* ============================ 9.1 chat view ============================ */

function ChatView({
  messages,
  typing,
  draft,
  voice,
  credits,
  rated,
  sessionId,
  sessions,
  insights,
  wallet,
  threadRef,
  onDraft,
  onAsk,
  onQuick,
  onToggleVoice,
  onRate,
  onAction,
  onSession,
  onOpenSessions,
  onOpenInsight,
  onOpenInsights,
  onScan,
  onSymptoms,
  onClear,
  onShare,
  onExport,
}: {
  messages: ChatMessage[];
  typing: boolean;
  draft: string;
  voice: boolean;
  credits: number;
  rated: Record<string, "up" | "down">;
  sessionId: string;
  sessions: typeof CHAT_SESSIONS;
  insights: AiInsight[];
  wallet: number;
  threadRef: React.RefObject<HTMLDivElement | null>;
  onDraft: (value: string) => void;
  onAsk: () => void;
  onQuick: (id: string) => void;
  onToggleVoice: () => void;
  onRate: (messageId: string, value: "up" | "down") => void;
  onAction: (action: ChatAction) => void;
  onSession: (id: string) => void;
  onOpenSessions: () => void;
  onOpenInsight: (insight: AiInsight) => void;
  onOpenInsights: () => void;
  onScan: () => void;
  onSymptoms: () => void;
  onClear: () => void;
  onShare: () => void;
  onExport: () => void;
}) {
  const active = sessions.find((row) => row.id === sessionId);
  return (
    <div className="mt-4">
      <Reveal>
        <div className="gm-ai-layout">
          <section className="gm-dash-card">
            <DashboardSectionHeader
              eyebrow="Section 9.1"
              title="Ask the GrowMO agronomist"
              subtitle="Full conversation in English or Kiswahili — plans, budgets, diagnoses, payments. Every answer cites its sources."
              action={
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={onSymptoms}
                  >
                    <ScanLine width={15} height={15} /> Symptom checker
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={onExport}
                  >
                    <FileDown width={15} height={15} /> Export
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-outline gm-btn-sm"
                    onClick={onShare}
                  >
                    <Share2 width={15} height={15} /> Share
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-danger-soft gm-btn-sm"
                    onClick={onClear}
                  >
                    <Trash2 width={15} height={15} /> Clear
                  </button>
                </div>
              }
            />

            {active ? (
              <div className="gm-ai-fact-grid mb-3">
                <AiFact label="Session" value={active.title} />
                <AiFact label="Turns" value={`${active.turns}`} />
                <AiFact label="Credits left" value={`${credits}`} />
                <AiFact label="Outcome" value={active.outcome} />
              </div>
            ) : null}

            <div className="gm-ai-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className={`gm-filter-chip ${prompt.lang === "SW" ? "" : ""}`}
                  onClick={() => onQuick(prompt.id)}
                >
                  {prompt.label}
                  <span className="gm-n">{prompt.lang}</span>
                </button>
              ))}
            </div>

            <div className="gm-ai-thread" ref={threadRef}>
              {messages.map((message) => (
                <AiChatBubble
                  key={message.id}
                  message={message}
                  onAction={onAction}
                  onFeedback={onRate}
                />
              ))}
              {typing ? <AiTyping label="GrowMO AI inafikiri…" /> : null}
            </div>

            <div className="gm-ai-composer">
              <div className="gm-ai-composer-row">
                <AiField label="Swali lako · Your question">
                  <textarea
                    className="gm-textarea"
                    rows={2}
                    placeholder="e.g. Nina cabbage zimeanza kuonyesha makala ya manjano…"
                    value={draft}
                    onChange={(event) => onDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        onAsk();
                      }
                    }}
                  />
                </AiField>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`gm-btn ${voice ? "gm-btn-dark" : "gm-btn-soft"}`}
                    onClick={onToggleVoice}
                    aria-pressed={voice}
                  >
                    <Mic width={15} height={15} />{" "}
                    {voice ? "Listening" : "Voice"}
                  </button>
                  <button
                    type="button"
                    className="gm-btn gm-btn-lime"
                    disabled={!draft.trim()}
                    onClick={onAsk}
                  >
                    <Send width={15} height={15} /> Ask
                  </button>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
                <small className="text-muted">
                  Enter sends · Shift + Enter for a new line · 1 credit per
                  question
                </small>
                <button
                  type="button"
                  className="gm-btn gm-btn-soft gm-btn-sm ms-auto"
                  onClick={onScan}
                >
                  <Camera width={14} height={14} /> Scan a leaf (5 credits)
                </button>
              </div>
            </div>

            <div className="mt-3">
              <h3 className="gm-h-section" style={{ fontSize: "1.05rem" }}>
                Rated answers this session
              </h3>
              <div className="d-flex flex-wrap gap-2">
                {messages
                  .filter((row) => rated[row.id])
                  .map((row) => (
                    <span key={row.id} className="gm-chip">
                      {rated[row.id] === "up" ? (
                        <CheckCircle2 width={13} height={13} />
                      ) : (
                        <TriangleAlert width={13} height={13} />
                      )}
                      {row.at} ·{" "}
                      {rated[row.id] === "up" ? "Helpful" : "Flagged"}
                    </span>
                  ))}
                {!messages.some((row) => rated[row.id]) ? (
                  <small className="text-muted">
                    No ratings yet — thumbs up or down on any answer trains your
                    own advisor.
                  </small>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="gm-ai-side">
            <div className="gm-dash-card">
              <DashboardSectionHeader
                eyebrow="Wallet"
                title="Pay from the chat"
                subtitle="M-Pesa disbursement straight to your casuals."
              />
              <AiKv label="GrowMO wallet" value={kes(wallet)} />
              <AiKv label="Pending" value={kes(WALLET.pending)} />
              <AiKv label="Registered number" value={WALLET.phone} />
              <AiKv label="Last top-up" value={WALLET.lastTopUp} />
              <button
                type="button"
                className="gm-btn gm-btn-mpesa gm-btn-block mt-3"
                onClick={() => onAction("pay")}
              >
                <HandCoins width={15} height={15} /> Pay workers now
              </button>
              <Link
                to="/app/dashboard"
                className="gm-btn gm-btn-soft gm-btn-sm gm-btn-block mt-2"
              >
                Open the dashboard
              </Link>
            </div>

            <div className="gm-dash-card">
              <DashboardSectionHeader
                eyebrow="Recent"
                title="Conversations"
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={onOpenSessions}
                  >
                    All <ArrowRight width={13} height={13} />
                  </button>
                }
              />
              <div className="d-flex flex-column gap-2">
                {sessions.slice(0, 4).map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    className={`gm-ai-session ${session.id === sessionId ? "is-active" : ""}`}
                    onClick={() => onSession(session.id)}
                  >
                    <strong>{session.title}</strong>
                    <small>
                      {session.started} · {session.crop} · {session.lang}
                    </small>
                    <small>{session.summary}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="gm-dash-card">
              <DashboardSectionHeader
                eyebrow="Proactive"
                title="AI noticed this"
                action={
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={onOpenInsights}
                  >
                    All <ArrowRight width={13} height={13} />
                  </button>
                }
              />
              <div className="d-flex flex-column gap-2">
                {insights.slice(0, 3).map((insight) => (
                  <AiInsightCard
                    key={insight.id}
                    insight={insight}
                    onOpen={onOpenInsight}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Reveal>
    </div>
  );
}

/* ============================ 9.2 plan generator ============================ */

function PlanView({
  plans,
  filteredPlans,
  generated,
  rows,
  pages,
  page,
  planTab,
  inputs,
  scaledTotal,
  overBudget,
  budgetValue,
  libraryQuery,
  libraryStatus,
  onLibraryQuery,
  onLibraryStatus,
  onOpenWizard,
  onOpenPlan,
  onPage,
  onTab,
  onExport,
  onShare,
  onDelete,
}: {
  plans: SavedPlan[];
  filteredPlans: SavedPlan[];
  generated: boolean;
  rows: typeof SEASON_PLAN_ROWS;
  pages: number;
  page: number;
  planTab: "activities" | "budget" | "returns";
  inputs: {
    planCrop: string;
    planAcres: string;
    planCounty: string;
    planMonth: string;
    planBudget: string;
    planSoil: string;
    planWater: string;
    planGoal: string;
  };
  scaledTotal: number;
  overBudget: boolean;
  budgetValue: number;
  libraryQuery: string;
  libraryStatus: string;
  onLibraryQuery: (value: string) => void;
  onLibraryStatus: (value: string) => void;
  onOpenWizard: () => void;
  onOpenPlan: (plan: SavedPlan) => void;
  onPage: (page: number) => void;
  onTab: (tab: "activities" | "budget" | "returns") => void;
  onExport: () => void;
  onShare: () => void;
  onDelete: (plan: SavedPlan) => void;
}) {
  return (
    <div className="mt-4">
      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow="Section 9.2"
            title="Crop plan generator"
            subtitle="Eight inputs in, a full season out — 17 scheduled activities with inputs, quantities, costs and labour."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onExport}
                >
                  <FileDown width={15} height={15} /> Export
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onShare}
                >
                  <Share2 width={15} height={15} /> Share
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={onOpenWizard}
                >
                  <Sparkles width={15} height={15} /> Generate a new plan
                </button>
              </div>
            }
          />

          <AiFactGrid>
            <AiFact label="Crop" value={inputs.planCrop} />
            <AiFact label="Acreage" value={inputs.planAcres} />
            <AiFact label="County" value={inputs.planCounty} />
            <AiFact label="Planting" value={inputs.planMonth} />
            <AiFact label="Budget" value={kes(budgetValue)} />
            <AiFact label="Soil" value={inputs.planSoil} />
            <AiFact label="Water" value={inputs.planWater} />
            <AiFact label="Goal" value={inputs.planGoal} />
          </AiFactGrid>

          <div className="mt-3">
            <AiNote
              tone={overBudget ? "warn" : "ok"}
              title={
                overBudget
                  ? "Plan is above the stated budget"
                  : "Generated full season plan"
              }
            >
              {overBudget
                ? `Modelled cost ${kes(scaledTotal)} against a budget of ${kes(budgetValue)}. Cut the third weeding or move to a shorter-maturity variety to fit.`
                : `Modelled cost ${kes(scaledTotal)} — within your ${kes(budgetValue)} budget with contingency included.`}
            </AiNote>
          </div>

          <div
            className="gm-tabs mt-3"
            role="tablist"
            aria-label="Plan sections"
          >
            {(
              [
                { id: "activities", label: "Season calendar" },
                { id: "budget", label: "Cost & labour" },
                { id: "returns", label: "Revenue projection" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={planTab === tab.id}
                className={`gm-tab ${planTab === tab.id ? "on" : ""}`}
                onClick={() => onTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {generated ? (
            planTab === "activities" ? (
              <>
                <div className="gm-table-wrap mt-3">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th scope="col">Week</th>
                        <th scope="col">Date</th>
                        <th scope="col">Activity</th>
                        <th scope="col">Input</th>
                        <th scope="col">Qty</th>
                        <th scope="col">Cost</th>
                        <th scope="col">Labour</th>
                        <th scope="col">Labour cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <th scope="row" className="font-display">
                            {row.week}
                          </th>
                          <td>{row.date}</td>
                          <td>
                            <strong>{row.activity}</strong>
                            <br />
                            <small className="text-muted">
                              {row.swahili} · {row.stage}
                            </small>
                          </td>
                          <td>{row.input}</td>
                          <td>{row.qty}</td>
                          <td className="font-display">
                            {row.cost ? kes(row.cost) : "—"}
                          </td>
                          <td>{row.labour}</td>
                          <td className="font-display">
                            {row.labourCost ? kes(row.labourCost) : "—"}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row" colSpan={5}>
                          <strong>TOTALS</strong>
                        </th>
                        <td className="font-display">
                          <strong>{kes(PLAN_TOTALS.inputs)}</strong>
                        </td>
                        <td>—</td>
                        <td className="font-display">
                          <strong>{kes(PLAN_TOTALS.labour)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" colSpan={5}>
                          <strong>GRAND TOTAL</strong>
                        </th>
                        <td className="font-display" colSpan={3}>
                          <strong>{kes(PLAN_TOTALS.grand)}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={page}
                  total={pages}
                  perPage={8}
                  totalItems={SEASON_PLAN_ROWS.length}
                  onChange={onPage}
                />
              </>
            ) : planTab === "budget" ? (
              <>
                <AiFactGrid>
                  <AiFact label="Inputs" value={kes(PLAN_TOTALS.inputs)} />
                  <AiFact label="Labour" value={kes(PLAN_TOTALS.labour)} />
                  <AiFact
                    label="Logistics"
                    value={kes(PLAN_TOTALS.logistics)}
                  />
                  <AiFact label="Grand total" value={kes(PLAN_TOTALS.grand)} />
                  <AiFact
                    label="Cost per acre"
                    value={kes(Math.round(PLAN_TOTALS.grand / 2))}
                  />
                  <AiFact label="Budget" value={kes(budgetValue)} />
                </AiFactGrid>
                <div className="mt-3">
                  <ProgressLine
                    value={Math.min(
                      100,
                      Math.round(
                        (PLAN_TOTALS.grand / Math.max(1, budgetValue)) * 100,
                      ),
                    )}
                    label="Share of budget used"
                  />
                </div>
                <div className="gm-table-wrap mt-3">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th scope="col">Stage</th>
                        <th scope="col">Activities</th>
                        <th scope="col">Input cost</th>
                        <th scope="col">Labour cost</th>
                        <th scope="col">Stage total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        new Set(SEASON_PLAN_ROWS.map((row) => row.stage)),
                      ).map((stage) => {
                        const stageRows = SEASON_PLAN_ROWS.filter(
                          (row) => row.stage === stage,
                        );
                        const inputCost = stageRows.reduce(
                          (sum, row) => sum + row.cost,
                          0,
                        );
                        const labourCost = stageRows.reduce(
                          (sum, row) => sum + row.labourCost,
                          0,
                        );
                        return (
                          <tr key={stage}>
                            <th scope="row">{stage}</th>
                            <td>{stageRows.length}</td>
                            <td className="font-display">{kes(inputCost)}</td>
                            <td className="font-display">{kes(labourCost)}</td>
                            <td className="font-display">
                              <strong>{kes(inputCost + labourCost)}</strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="gm-ai-scenarios mt-3">
                  {PLAN_SCENARIOS.map((scenario) => (
                    <AiScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      best={scenario.id === "ps-avg"}
                    />
                  ))}
                </div>
                <div className="gm-table-wrap mt-3">
                  <table className="gm-table">
                    <thead>
                      <tr>
                        <th scope="col">Scenario</th>
                        <th scope="col">Yield/acre</th>
                        <th scope="col">Total yield</th>
                        <th scope="col">Price/bag</th>
                        <th scope="col">Revenue</th>
                        <th scope="col">Profit</th>
                        <th scope="col">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PLAN_SCENARIOS.map((scenario) => (
                        <tr key={scenario.id}>
                          <th scope="row">
                            <span className="d-flex align-items-center gap-2">
                              {scenario.name}
                              <StatusChip
                                label={scenario.tone}
                                tone={scenario.tone}
                              />
                            </span>
                          </th>
                          <td className="font-display">
                            {scenario.yieldPerAcre} {scenario.unit}
                          </td>
                          <td className="font-display">
                            {scenario.totalYield} {scenario.unit}
                          </td>
                          <td className="font-display">
                            {kes(scenario.price)}
                          </td>
                          <td className="font-display">
                            {kes(scenario.revenue)}
                          </td>
                          <td className="font-display">
                            <strong>{kes(scenario.profit)}</strong>
                          </td>
                          <td className="font-display">{scenario.roi}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <AiSummary
                    title="AI read on these numbers"
                    note="Plan for the average case, keep cash for the worst. The 8-week hold on maize turns the average case into the best case if your store stays dry."
                    chips={[
                      "Break-even 24 bags",
                      "Worst case still pays KES 27,000",
                    ]}
                    actions={
                      <button
                        type="button"
                        className="gm-btn gm-btn-lime gm-btn-sm"
                        onClick={onExport}
                      >
                        <Download width={15} height={15} /> Export plan
                      </button>
                    }
                  />
                </div>
              </>
            )
          ) : (
            <AiEmpty>
              <Sparkles
                width={22}
                height={22}
                style={{ color: "var(--gm-leaf-600)" }}
              />
              <p className="mb-2 mt-2">
                No plan generated yet for these inputs. Run the generator and
                the full 17-activity calendar, budget and three revenue
                scenarios appear here.
              </p>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={onOpenWizard}
              >
                <Sparkles width={15} height={15} /> Generate the plan
              </button>
            </AiEmpty>
          )}
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Library"
            title={`${plans.length} saved season plans`}
            subtitle="Drafts, active seasons and completed plans from the last two years."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onOpenWizard}
              >
                <Plus width={15} height={15} /> New plan
              </button>
            }
          />
          <div className="gm-ai-tools">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                placeholder="Search plans by crop, county or owner…"
                aria-label="Search saved plans"
                value={libraryQuery}
                onChange={(event) => onLibraryQuery(event.target.value)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {["All", "Draft", "Active", "Completed"].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`gm-filter-chip ${libraryStatus === status ? "is-active" : ""}`}
                  onClick={() => onLibraryStatus(status)}
                >
                  {status}
                  <span className="gm-n">
                    {status === "All"
                      ? plans.length
                      : plans.filter((row) => row.status === status).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filteredPlans.length ? (
            <div className="gm-ai-plans">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="d-flex flex-column gap-2">
                  <AiPlanCard plan={plan} onOpen={onOpenPlan} />
                  <button
                    type="button"
                    className="gm-btn gm-btn-danger-soft gm-btn-sm gm-btn-block"
                    onClick={() => onDelete(plan)}
                  >
                    <Trash2 width={13} height={13} /> Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <AiEmpty>No plans match that search.</AiEmpty>
          )}
        </section>
      </Reveal>
    </div>
  );
}

/* ============================ 9.3 risk view ============================ */

function RiskView({
  risks,
  total,
  pages,
  page,
  filter,
  query,
  mine,
  scouts,
  scoutPages,
  scoutPage,
  onFilter,
  onQuery,
  onMine,
  onPage,
  onScoutPage,
  onOpen,
  onTreat,
  onScout,
  onRules,
  onSymptoms,
}: {
  risks: PestRisk[];
  total: number;
  pages: number;
  page: number;
  filter: "all" | "high" | "medium" | "low";
  query: string;
  mine: boolean;
  scouts: typeof SCOUT_LOG;
  scoutPages: number;
  scoutPage: number;
  onFilter: (value: "all" | "high" | "medium" | "low") => void;
  onQuery: (value: string) => void;
  onMine: () => void;
  onPage: (page: number) => void;
  onScoutPage: (page: number) => void;
  onOpen: (risk: PestRisk) => void;
  onTreat: () => void;
  onScout: () => void;
  onRules: () => void;
  onSymptoms: () => void;
}) {
  const counts = {
    all: PEST_RISKS.length,
    high: PEST_RISKS.filter((row) => row.risk === "high").length,
    medium: PEST_RISKS.filter((row) => row.risk === "medium").length,
    low: PEST_RISKS.filter((row) => row.risk === "low").length,
  };
  return (
    <div className="mt-4">
      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow="Section 9.3"
            title="Pest & disease risk prediction"
            subtitle="Daily risk scores from weather, trap counts and 1,940 grower reports — with the exact action to take."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onSymptoms}
                >
                  <ScanLine width={15} height={15} /> Symptom checker
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onRules}
                >
                  <Bell width={15} height={15} /> Alert rules
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onScout}
                >
                  <ListChecks width={15} height={15} /> Schedule scouting
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={onTreat}
                >
                  <Droplets width={15} height={15} /> Spray now
                </button>
              </div>
            }
          />

          <div className="gm-ai-tools">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                placeholder="Search by crop, pest, county or product…"
                aria-label="Search risks"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(["all", "high", "medium", "low"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`gm-filter-chip ${filter === value ? "is-active" : ""}`}
                  onClick={() => onFilter(value)}
                >
                  {value === "all" ? "All risks" : `${value} risk`}
                  <span className="gm-n">{counts[value]}</span>
                </button>
              ))}
              <button
                type="button"
                className={`gm-filter-chip ${mine ? "is-active" : ""}`}
                onClick={onMine}
                aria-pressed={mine}
              >
                <MapPin width={13} height={13} /> My farm only
              </button>
            </div>
          </div>

          {risks.length ? (
            <>
              <div className="gm-ai-risks">
                {risks.map((risk) => (
                  <AiRiskCard key={risk.id} risk={risk} onOpen={onOpen} />
                ))}
              </div>
              <Pagination
                page={page}
                total={pages}
                perPage={4}
                totalItems={total}
                onChange={onPage}
              />
            </>
          ) : (
            <AiEmpty>Nothing matches that filter.</AiEmpty>
          )}

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Crop</th>
                  <th scope="col">County</th>
                  <th scope="col">Current risk</th>
                  <th scope="col">Score</th>
                  <th scope="col">7-day forecast</th>
                  <th scope="col">Recommended action</th>
                  <th scope="col">Product</th>
                  <th scope="col">PHI</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => (
                  <tr key={risk.id}>
                    <th scope="row">
                      {risk.crop}
                      <br />
                      <small className="text-muted">{risk.variety}</small>
                    </th>
                    <td>{risk.county}</td>
                    <td>
                      <span className="d-flex align-items-center gap-2">
                        <StatusChip
                          label={`${risk.pest} · ${risk.risk}`}
                          tone={riskTone(risk.risk)}
                        />
                      </span>
                    </td>
                    <td className="font-display">{risk.score}</td>
                    <td>{risk.forecast}</td>
                    <td>
                      <strong>{risk.action}</strong>
                    </td>
                    <td>
                      {risk.product}
                      <br />
                      <small className="text-muted">{risk.dose}</small>
                    </td>
                    <td>{risk.phi}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onOpen(risk)}
                      >
                        Details <ArrowRight width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Field checks"
            title="Scouting log"
            subtitle="The model learns from what your team actually finds in the field."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onScout}
              >
                <Plus width={15} height={15} /> New scouting round
              </button>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Crop</th>
                  <th scope="col">Plot</th>
                  <th scope="col">Scout</th>
                  <th scope="col">Plants checked</th>
                  <th scope="col">Affected</th>
                  <th scope="col">Finding</th>
                  <th scope="col">Action taken</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {scouts.map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.date}</th>
                    <td>{row.crop}</td>
                    <td>{row.plot}</td>
                    <td>{row.scout}</td>
                    <td className="font-display">{row.plants}</td>
                    <td className="font-display">
                      {row.affected ? row.affected : "—"}
                    </td>
                    <td>{row.finding}</td>
                    <td>{row.action}</td>
                    <td>
                      <StatusChip
                        label={row.status}
                        tone={
                          row.status === "Done"
                            ? "low"
                            : row.status === "Due"
                              ? "medium"
                              : "high"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={scoutPage}
            total={scoutPages}
            perPage={5}
            totalItems={SCOUT_LOG.length}
            onChange={onScoutPage}
          />
        </section>
      </Reveal>
    </div>
  );
}

/* ============================ 9.4 market view ============================ */

function MarketView({
  markets,
  total,
  pages,
  page,
  query,
  trend,
  alerts,
  onQuery,
  onTrend,
  onPage,
  onOpen,
  onSell,
  onAlert,
  onDelete,
  onToggle,
  onExport,
}: {
  markets: MarketForecast[];
  total: number;
  pages: number;
  page: number;
  query: string;
  trend: "all" | "rising" | "stable" | "falling";
  alerts: PriceAlert[];
  onQuery: (value: string) => void;
  onTrend: (value: "all" | "rising" | "stable" | "falling") => void;
  onPage: (page: number) => void;
  onOpen: (market: MarketForecast) => void;
  onSell: () => void;
  onAlert: () => void;
  onDelete: (alert: PriceAlert) => void;
  onToggle: (id: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="mt-4">
      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow="Section 9.4"
            title="Market price forecast"
            subtitle="42 markets, five years of daily prices. One-month and three-month ranges with a confidence score per market."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onExport}
                >
                  <FileDown width={15} height={15} /> Download CSV
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onAlert}
                >
                  <Bell width={15} height={15} /> New price alert
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={onSell}
                >
                  <CircleDollarSign width={15} height={15} /> Sell now or hold?
                </button>
              </div>
            }
          />

          <div className="gm-ai-tools">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                placeholder="Search crop or market…"
                aria-label="Search markets"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              {(["all", "rising", "stable", "falling"] as const).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    className={`gm-filter-chip ${trend === value ? "is-active" : ""}`}
                    onClick={() => onTrend(value)}
                  >
                    {value === "all" ? "All trends" : value}
                    <span className="gm-n">
                      {value === "all"
                        ? MARKET_FORECASTS.length
                        : MARKET_FORECASTS.filter((row) => row.trend === value)
                            .length}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          {markets.length ? (
            <>
              <div className="gm-ai-markets">
                {markets.map((market) => (
                  <AiMarketCard
                    key={market.id}
                    market={market}
                    onOpen={onOpen}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                total={pages}
                perPage={6}
                totalItems={total}
                onChange={onPage}
              />
            </>
          ) : (
            <AiEmpty>No market matches that filter.</AiEmpty>
          )}

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Crop</th>
                  <th scope="col">Market</th>
                  <th scope="col">Current price</th>
                  <th scope="col">1-month forecast</th>
                  <th scope="col">3-month forecast</th>
                  <th scope="col">Trend</th>
                  <th scope="col">Confidence</th>
                  <th scope="col">Advice</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market.id}>
                    <th scope="row">
                      {market.crop}
                      <br />
                      <small className="text-muted">{market.swahili}</small>
                    </th>
                    <td>{market.market}</td>
                    <td className="font-display">
                      {kes(market.current)}
                      <small className="text-muted d-block">
                        per {market.unit}
                      </small>
                    </td>
                    <td className="font-display">
                      {kes(market.month1Low)} – {kes(market.month1High)}
                    </td>
                    <td className="font-display">
                      {kes(market.month3Low)} – {kes(market.month3High)}
                    </td>
                    <td>
                      <span className="d-flex align-items-center gap-2">
                        <TrendIcon trend={market.trend} />
                        <StatusChip
                          label={market.trendLabel}
                          tone={
                            market.trend === "rising"
                              ? "low"
                              : market.trend === "falling"
                                ? "high"
                                : "neutral"
                          }
                        />
                      </span>
                    </td>
                    <td className="font-display">{market.confidence}%</td>
                    <td>{market.advice}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onOpen(market)}
                      >
                        Model <ArrowRight width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Watching for you"
            title={`${alerts.length} price alerts`}
            subtitle="SMS or in-app the moment a market crosses your target."
            action={
              <button
                type="button"
                className="gm-btn gm-btn-outline gm-btn-sm"
                onClick={onAlert}
              >
                <Plus width={15} height={15} /> Add alert
              </button>
            }
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Crop</th>
                  <th scope="col">Market</th>
                  <th scope="col">Trigger</th>
                  <th scope="col">Channel</th>
                  <th scope="col">Recipient</th>
                  <th scope="col">Created</th>
                  <th scope="col">Last check</th>
                  <th scope="col">Status</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <th scope="row">{alert.crop}</th>
                    <td>{alert.market}</td>
                    <td className="font-display">
                      {alert.condition === "above" ? "Above" : "Below"}{" "}
                      {kes(alert.target)}
                      <small className="text-muted d-block">
                        per {alert.unit}
                      </small>
                    </td>
                    <td>{alert.channel}</td>
                    <td>{alert.recipient}</td>
                    <td>{alert.created}</td>
                    <td>{alert.lastCheck}</td>
                    <td>
                      <StatusChip
                        label={alert.status}
                        tone={
                          alert.status === "Armed"
                            ? "low"
                            : alert.status === "Triggered"
                              ? "medium"
                              : "neutral"
                        }
                      />
                    </td>
                    <td>
                      <span className="d-flex gap-2">
                        <button
                          type="button"
                          className="gm-btn gm-btn-soft gm-btn-sm"
                          onClick={() => onToggle(alert.id)}
                        >
                          {alert.status === "Paused" ? "Resume" : "Pause"}
                        </button>
                        <button
                          type="button"
                          className="gm-icon-btn"
                          aria-label={`Delete ${alert.crop} alert`}
                          onClick={() => onDelete(alert)}
                        >
                          <Trash2 width={14} height={14} />
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ============================ 9.5 benchmarking ============================ */

function BenchView({
  peer,
  metrics,
  sort,
  query,
  onSort,
  onQuery,
  onPeers,
  onPeer,
  onDetail,
  onReport,
}: {
  peer: PeerGroup;
  metrics: BenchmarkMetric[];
  sort: "gap" | "metric";
  query: string;
  onSort: (value: "gap" | "metric") => void;
  onQuery: (value: string) => void;
  onPeers: () => void;
  onPeer: (id: string) => void;
  onDetail: (metric: BenchmarkMetric) => void;
  onReport: () => void;
}) {
  const better = metrics.filter((row) => row.better).length;
  return (
    <div className="mt-4">
      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow="Section 9.5"
            title="How do I compare?"
            subtitle={`Anonymised against ${peer.farms} ${peer.label.toLowerCase()} farms.`}
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onPeers}
                >
                  <Layers width={15} height={15} /> Change peer group
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={onReport}
                >
                  <FileText width={15} height={15} /> Benchmark report
                </button>
              </div>
            }
          />

          <AiSummary
            title={`Above average on ${better} of ${metrics.length} metrics`}
            note={BENCHMARK_SUMMARY}
            chips={[peer.label, `${peer.farms} farms`, "Opt-in, anonymised"]}
            actions={
              <Link to="/app/crops" className="gm-btn gm-btn-lime gm-btn-sm">
                <Wheat width={15} height={15} /> Open crop records
              </Link>
            }
          />

          <div className="gm-ai-tools mt-3">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                placeholder="Search a metric…"
                aria-label="Search metrics"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`gm-filter-chip ${sort === "gap" ? "is-active" : ""}`}
                onClick={() => onSort("gap")}
              >
                Biggest gap first
              </button>
              <button
                type="button"
                className={`gm-filter-chip ${sort === "metric" ? "is-active" : ""}`}
                onClick={() => onSort("metric")}
              >
                Blueprint order
              </button>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {PEER_GROUPS.slice(0, 5).map((group) => (
              <button
                key={group.id}
                type="button"
                className={`gm-filter-chip ${group.id === peer.id ? "is-active" : ""}`}
                onClick={() => onPeer(group.id)}
              >
                {group.label}
                <span className="gm-n">{group.farms}</span>
              </button>
            ))}
          </div>

          <div className="d-flex flex-column gap-3">
            {metrics.map((metric) => (
              <AiBenchBar
                key={metric.id}
                metric={metric}
                onOpen={() => onDetail(metric)}
              />
            ))}
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">Kiswahili</th>
                  <th scope="col">Your farm</th>
                  <th scope="col">County average</th>
                  <th scope="col">Top 10%</th>
                  <th scope="col">Difference</th>
                  <th scope="col">How measured</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <th scope="row">{metric.metric}</th>
                    <td>{metric.swahili}</td>
                    <td className="font-display">{metric.yours}</td>
                    <td className="font-display">{metric.countyAvg}</td>
                    <td className="font-display">{metric.top10}</td>
                    <td>
                      <StatusChip
                        label={`${metric.diffPct > 0 ? "+" : ""}${metric.diffPct}% vs average`}
                        tone={metric.better ? "low" : "high"}
                      />
                    </td>
                    <td>{metric.measured}</td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onDetail(metric)}
                      >
                        <Info width={13} height={13} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ============================ 9.6 input optimization ============================ */

function InputsView({
  programs,
  products,
  productPages,
  productPage,
  productQuery,
  acres,
  chosen,
  soilApplied,
  onAcres,
  onChosen,
  onSoil,
  onProductQuery,
  onProductPage,
  onOpen,
  onCalculator,
  onOrder,
}: {
  programs: typeof FERT_PROGRAMS;
  products: typeof FERT_PRODUCTS;
  productPages: number;
  productPage: number;
  productQuery: string;
  acres: number;
  chosen: string;
  soilApplied: boolean;
  onAcres: (value: string) => void;
  onChosen: (value: string) => void;
  onSoil: () => void;
  onProductQuery: (value: string) => void;
  onProductPage: (page: number) => void;
  onOpen: (program: FertilizerProgram) => void;
  onCalculator: () => void;
  onOrder: () => void;
}) {
  const chosenRow =
    programs.find((row) => row.approach === chosen) ?? programs[2];
  return (
    <div className="mt-4">
      <Reveal>
        <section className="gm-dash-card">
          <DashboardSectionHeader
            eyebrow="Section 9.6"
            title="What is the best fertilizer program for my cabbage?"
            subtitle="Six programs modelled against your soil test, priced per acre and scored on marginal return."
            action={
              <div className="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="gm-btn gm-btn-outline gm-btn-sm"
                  onClick={onCalculator}
                >
                  <Calculator width={15} height={15} /> Fertilizer calculator
                </button>
                <button
                  type="button"
                  className="gm-btn gm-btn-lime"
                  onClick={onOrder}
                >
                  <Package width={15} height={15} /> Order the inputs
                </button>
              </div>
            }
          />

          <AiFactGrid>
            <AiFact label="Soil test" value={SOIL_TEST.taken} />
            <AiFact
              label="pH"
              value={`${SOIL_TEST.ph} (target ${SOIL_TEST.phTarget})`}
            />
            <AiFact label="Nitrogen" value={SOIL_TEST.nitrogen.value} />
            <AiFact label="Phosphorus" value={SOIL_TEST.phosphorus.value} />
            <AiFact label="Potassium" value={SOIL_TEST.potassium.value} />
            <AiFact
              label="Organic matter"
              value={SOIL_TEST.organicMatter.value}
            />
            <AiFact label="CEC" value={SOIL_TEST.cec.value} />
            <AiFact label="Lime needed" value={SOIL_TEST.limeNeeded} />
          </AiFactGrid>

          <div className="gm-ai-fact-grid mt-3">
            <AiField label="Acres to treat">
              <select
                className="gm-select"
                value={String(acres)}
                onChange={(event) => onAcres(event.target.value)}
              >
                {["0.25", "0.5", "1", "1.5", "2"].map((option) => (
                  <option key={option} value={option}>
                    {option} acres
                  </option>
                ))}
              </select>
            </AiField>
            <AiField label="Program">
              <select
                className="gm-select"
                value={chosen}
                onChange={(event) => onChosen(event.target.value)}
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.approach}>
                    {program.approach} — {program.program}
                  </option>
                ))}
              </select>
            </AiField>
            <div className="d-flex align-items-end pb-2">
              <Toggle
                checked={soilApplied}
                onChange={onSoil}
                label="Add lime correction"
                desc="400 kg/acre for pH 5.8"
              />
            </div>
          </div>

          <div className="gm-ai-receipt mt-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <span className="gm-eyebrow">AI pick</span>
                <strong className="d-block font-display">
                  {chosenRow.approach} ·{" "}
                  {kes(Math.round(chosenRow.costPerAcre * acres))} for {acres}{" "}
                  acres
                </strong>
                <small className="text-muted">
                  {chosenRow.yieldImpact} · {chosenRow.program}
                </small>
              </div>
              <button
                type="button"
                className="gm-btn gm-btn-lime"
                onClick={onOrder}
              >
                <HandCoins width={15} height={15} /> Reserve{" "}
                {kes(
                  Math.round(chosenRow.costPerAcre * acres) +
                    (soilApplied ? 7200 : 0),
                )}
              </button>
            </div>
            <p className="mt-2 mb-0">{AI_PICK}</p>
          </div>

          <div className="gm-ai-programs mt-3">
            {programs.map((program) => (
              <AiProgramCard
                key={program.id}
                program={program}
                acres={acres}
                onOpen={onOpen}
              />
            ))}
          </div>

          <div className="gm-table-wrap mt-3">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Approach</th>
                  <th scope="col">Fertilizer</th>
                  <th scope="col">Rate/acre</th>
                  <th scope="col">Cost/acre</th>
                  <th scope="col">Expected yield impact</th>
                  <th scope="col">Applications</th>
                  <th scope="col">Recommendation</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {programs.map((program) => (
                  <tr key={program.id}>
                    <th scope="row">{program.approach}</th>
                    <td>{program.program}</td>
                    <td>{program.rate}</td>
                    <td className="font-display">{kes(program.costPerAcre)}</td>
                    <td>{program.yieldImpact}</td>
                    <td>{program.applications.length}</td>
                    <td>
                      <StatusChip
                        label={program.verdictLabel}
                        tone={verdictTone(program.verdict)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="gm-btn gm-btn-soft gm-btn-sm"
                        onClick={() => onOpen(program)}
                      >
                        Schedule <ArrowRight width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Stockists"
            title="Fertilizer & soil amendment prices"
            subtitle="Live prices from agro vets and stockists within 40 km of Githunguri."
          />
          <div className="gm-ai-tools">
            <div className="gm-search-field">
              <Search />
              <input
                className="gm-input"
                placeholder="Search product, grade or supplier…"
                aria-label="Search fertilizer products"
                value={productQuery}
                onChange={(event) => onProductQuery(event.target.value)}
              />
            </div>
          </div>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Grade</th>
                  <th scope="col">Pack</th>
                  <th scope="col">Price</th>
                  <th scope="col">Rate</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Supplier</th>
                  <th scope="col">Availability</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.name}</th>
                    <td>{product.grade}</td>
                    <td>{product.packSize}</td>
                    <td className="font-display">{kes(product.price)}</td>
                    <td>{product.rate}</td>
                    <td>{product.stage}</td>
                    <td>{product.supplier}</td>
                    <td>
                      <StatusChip
                        label={product.inStock ? "In stock" : "Back order"}
                        tone={product.inStock ? "low" : "medium"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={productPage}
            total={productPages}
            perPage={5}
            totalItems={FERT_PRODUCTS.length}
            onChange={onProductPage}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="gm-dash-card mt-4">
          <DashboardSectionHeader
            eyebrow="Treatment products"
            title="What the risk model recommends"
            subtitle="Doses, PHI and the nearest stockist for every product the advisor suggests."
          />
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Active ingredient</th>
                  <th scope="col">Targets</th>
                  <th scope="col">Dose</th>
                  <th scope="col">Pack</th>
                  <th scope="col">Price</th>
                  <th scope="col">PHI</th>
                  <th scope="col">Stockist</th>
                  <th scope="col">Type</th>
                </tr>
              </thead>
              <tbody>
                {TREATMENT_PRODUCTS.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.name}</th>
                    <td>{product.active}</td>
                    <td>{product.target}</td>
                    <td>{product.dose}</td>
                    <td>{product.packSize}</td>
                    <td className="font-display">{kes(product.price)}</td>
                    <td>{product.phi}</td>
                    <td>
                      {product.supplier}
                      <br />
                      <small className="text-muted">{product.county}</small>
                    </td>
                    <td>
                      <StatusChip
                        label={product.organic ? "Organic" : "Conventional"}
                        tone={product.organic ? "low" : "neutral"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

/* ============================ confirm dialog (shared) ============================ */

function ConfirmDialog({
  title,
  desc,
  confirmLabel,
  danger = true,
  onConfirm,
  onClose,
}: {
  title: string;
  desc: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex gap-3 align-items-start">
        <span
          className="gm-mega-icon"
          style={{
            background: danger ? "var(--gm-cream-50)" : "var(--gm-mint-100)",
            color: danger ? "var(--gm-clay-500)" : "var(--gm-leaf-700)",
          }}
        >
          <TriangleAlert width={18} height={18} />
        </span>
        <p className="mb-0">{desc}</p>
      </div>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`gm-btn ${danger ? "gm-btn-danger-soft" : "gm-btn-lime"}`}
          aria-label={`${title} — ${confirmLabel}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.1 scan wizard ============================ */

function ScanWizard({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (task: Omit<AdvisorTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState<string | null>(null);
  const [crop, setCrop] = useState("Cabbage");
  const [plot, setPlot] = useState("Plot 1: Shamba ya nyumba");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Symptom | null>(null);

  const analyse = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setResult(SYMPTOM_LIBRARY[0]);
      setStep(2);
    }, 1200);
  };

  const finish = () => {
    if (!result) return;
    onSave({
      title: `Treat ${result.likely} on ${crop}`,
      detail: `${result.action} · photo analysed by Leaf Vision v3.7`,
      due: "Within 48 hours",
      plot,
      cost: 1670,
      source: "AI photo diagnosis",
    });
    onClose();
  };

  return (
    <div>
      {busy ? (
        <div className="text-center p-4">
          <span className="gm-spinner" />
          <h3 className="font-display mt-3">Leaf Vision is analysing…</h3>
          <p className="text-muted mb-0">
            Comparing your photo against 48,000 Kenyan leaf images.
          </p>
        </div>
      ) : (
        <>
          <Stepper
            steps={["Sample", "Context", "Diagnosis"]}
            current={step}
            onStep={(index) => (index < step ? setStep(index) : undefined)}
          />
          {step === 0 ? (
            <div className="mt-3">
              <AiUploadDrop
                picked={sample}
                options={SCAN_SAMPLES}
                onPick={setSample}
              />
              <AiNote title="Camera tip" tone="ok">
                Fill the frame with one leaf, shoot in shade and include the
                edge where the lesion starts. Five credits per scan.
              </AiNote>
            </div>
          ) : step === 1 ? (
            <div className="gm-form-grid mt-3">
              <AiField label="Crop">
                <select
                  className="gm-select"
                  value={crop}
                  onChange={(event) => setCrop(event.target.value)}
                >
                  {[
                    "Cabbage",
                    "Maize",
                    "Tomato",
                    "Potato",
                    "Kale",
                    "Dry Beans",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </AiField>
              <AiField label="Plot">
                <select
                  className="gm-select"
                  value={plot}
                  onChange={(event) => setPlot(event.target.value)}
                >
                  {[
                    "Plot 1: Shamba ya nyumba",
                    "Plot 2: Ridge block",
                    "Plot 3: Tunnel",
                    "Plot 4: Lower shamba",
                    "Plot 6: Kitchen garden",
                  ].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </AiField>
              <AiField
                label="When did you first see it?"
                hint="Helps the model stage the infection."
              >
                <input
                  className="gm-input"
                  defaultValue="2 days ago"
                  aria-label="When did you first see the symptom"
                />
              </AiField>
              <AiField
                label="Recent weather"
                hint="Pulled from KMD Githunguri AWS 034."
              >
                <input
                  className="gm-input"
                  value="9 mm rain, 82% humidity"
                  readOnly
                />
              </AiField>
            </div>
          ) : result ? (
            <div className="mt-3">
              <div className="d-flex align-items-center gap-3">
                <ScoreRing score={result.confidence} size={110} />
                <div>
                  <span className="gm-eyebrow">Leaf Vision v3.7</span>
                  <h3 className="gm-h-section mb-0">{result.likely}</h3>
                  <p className="text-muted mb-0">
                    Symptom matched: {result.symptom} ({result.swahili})
                  </p>
                </div>
              </div>
              <AiNote title="Kitendo cha haraka" tone="warn">
                {result.action}
              </AiNote>
              <AiFactGrid>
                <AiFact label="Crop" value={crop} />
                <AiFact label="Plot" value={plot} />
                <AiFact label="Confidence" value={`${result.confidence}%`} />
                <AiFact label="Credits used" value="5" />
              </AiFactGrid>
            </div>
          ) : null}
          <WizardActions
            step={step}
            last={2}
            onBack={() => setStep((value) => value - 1)}
            onNext={() =>
              step === 2 ? finish() : step === 1 ? analyse() : setStep(1)
            }
            nextLabel={step === 1 ? "Analyse photo" : "Continue"}
            finishLabel="Schedule treatment"
            nextDisabled={step === 0 && !sample}
          />
        </>
      )}
    </div>
  );
}

/* ============================ 9.1 payment ============================ */

function PayModal({
  balance,
  pin,
  busy,
  receipt,
  onPin,
  onConfirm,
  onClose,
}: {
  balance: number;
  pin: string;
  busy: boolean;
  receipt: string | null;
  onPin: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Sending via M-Pesa…</h3>
        <p className="text-muted mb-0">
          Disbursing KES 3,000 to three numbers. Do not close this screen.
        </p>
      </div>
    );
  }

  if (receipt) {
    return (
      <div>
        <div className="gm-ai-receipt">
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2
              width={20}
              height={20}
              style={{ color: "var(--gm-leaf-600)" }}
            />
            <strong className="font-display">Payment complete</strong>
          </div>
          <AiKv label="Receipt" value={receipt} />
          <AiKv label="Total sent" value={kes(3000)} />
          <AiKv label="Recipients" value="3 casuals" />
          <AiKv label="Wallet balance" value={kes(balance)} />
          <AiKv label="Recorded in" value="Labour ledger · today" />
        </div>
        <AiModalFooter align="end">
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onClose}
          >
            Done
          </button>
        </AiModalFooter>
      </div>
    );
  }

  return (
    <div>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Worker</th>
              <th scope="col">Number</th>
              <th scope="col">Work</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {LABOUR_PAYMENT?.rows.map((row) => (
              <tr key={row.masked}>
                <th scope="row">{row.name}</th>
                <td>{row.masked}</td>
                <td>{row.work}</td>
                <td className="font-display">{kes(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AiKv label="Wallet balance" value={kes(balance)} />
      <AiKv label="Total to send" value={kes(3000)} />
      <AiKv label="Balance after" value={kes(Math.max(0, balance - 3000))} />
      <div className="mt-3">
        <PinPad
          length={4}
          actionLabel="Confirm KES 3,000"
          resetKey={pin.length}
          onComplete={(value) => {
            onPin(value);
            onConfirm();
          }}
        />
      </div>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <span className="gm-chip">
          <ShieldAlert width={13} height={13} /> Nothing is sent before your PIN
        </span>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.1 symptom checker ============================ */

function SymptomChecker({
  onClose,
  onTreat,
}: {
  onClose: () => void;
  onTreat: () => void;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Symptom | null>(null);
  const rows = SYMPTOM_LIBRARY.filter((row) =>
    query
      ? `${row.symptom} ${row.crop} ${row.likely} ${row.swahili}`
          .toLowerCase()
          .includes(query.toLowerCase())
      : true,
  );
  return (
    <div>
      <div className="gm-search-field mb-3">
        <Search />
        <input
          className="gm-input"
          placeholder="Describe what you see — 'yellow V lesions', 'holes in the whorl'…"
          aria-label="Search symptoms"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {picked ? (
        <div className="mb-3">
          <div className="d-flex align-items-center gap-3">
            <ScoreRing score={picked.confidence} size={96} />
            <div>
              <span className="gm-eyebrow">Most likely</span>
              <h3 className="gm-h-section mb-0">{picked.likely}</h3>
              <p className="text-muted mb-0">
                {picked.crop} · {picked.symptom}
              </p>
            </div>
          </div>
          <AiNote title="Recommended action" tone="warn">
            {picked.action}
          </AiNote>
        </div>
      ) : null}
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Symptom</th>
              <th scope="col">Kiswahili</th>
              <th scope="col">Crop</th>
              <th scope="col">Most likely cause</th>
              <th scope="col">Confidence</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.symptom}</th>
                <td>{row.swahili}</td>
                <td>{row.crop}</td>
                <td>{row.likely}</td>
                <td className="font-display">{row.confidence}%</td>
                <td>
                  <button
                    type="button"
                    className="gm-btn gm-btn-soft gm-btn-sm"
                    onClick={() => setPicked(row)}
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? (
        <AiEmpty>No symptom matches that description.</AiEmpty>
      ) : null}
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={!picked}
          onClick={onTreat}
        >
          <Droplets width={15} height={15} /> Plan the treatment
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ share / export / feedback ============================ */

function ShareModal({
  title,
  desc,
  onSend,
  onClose,
}: {
  title: string;
  desc: string;
  onSend: (channel: string) => void;
  onClose: () => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [recipient, setRecipient] = useState("0712 345 678");
  const [note, setNote] = useState("");
  return (
    <div>
      <p className="text-muted">{desc}</p>
      <div className="gm-form-grid">
        <AiField label="Channel">
          <select
            className="gm-select"
            value={channel}
            onChange={(event) => setChannel(event.target.value)}
          >
            {["WhatsApp", "SMS", "Email", "Copy link"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </AiField>
        <AiField label="Recipient" hint="07XX or 01XX for WhatsApp and SMS.">
          <input
            className="gm-input"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            aria-label="Recipient"
          />
        </AiField>
      </div>
      <AiField label="Add a note">
        <textarea
          className="gm-textarea"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={`${title} — here is what the AI recommends…`}
        />
      </AiField>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          disabled={channel !== "Copy link" && recipient.trim().length < 9}
          onClick={() => onSend(channel)}
        >
          <Send width={15} height={15} /> Send {title.toLowerCase()}
        </button>
      </AiModalFooter>
    </div>
  );
}

function ExportPicker({
  options,
  onExport,
  onClose,
}: {
  options: {
    id: string;
    label: string;
    detail: string;
    icon: React.ReactNode;
  }[];
  onExport: (id: string) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState(options[0].id);
  return (
    <div>
      <div className="d-flex flex-column gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`gm-check-row ${picked === option.id ? "is-selected" : ""}`}
            onClick={() => setPicked(option.id)}
            aria-pressed={picked === option.id}
          >
            <span className="d-flex align-items-center gap-2">
              {option.icon}
              <span>
                <strong className="d-block">{option.label}</strong>
                <small className="text-muted">{option.detail}</small>
              </span>
            </span>
            {picked === option.id ? (
              <Check
                width={16}
                height={16}
                style={{ color: "var(--gm-leaf-600)" }}
              />
            ) : null}
          </button>
        ))}
      </div>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onExport(picked)}
        >
          <Download width={15} height={15} /> Download
        </button>
      </AiModalFooter>
    </div>
  );
}

function FeedbackModal({
  value,
  note,
  onNote,
  onSubmit,
  onClose,
}: {
  value: "up" | "down";
  note: string;
  onNote: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2">
        <StatusChip
          label={value === "up" ? "Marked helpful" : "Flagged for review"}
          tone={value === "up" ? "low" : "high"}
        />
        <small className="text-muted">
          {value === "up"
            ? "This answer will be weighted higher for your farm."
            : "Tell us what was wrong so the model can learn."}
        </small>
      </div>
      <AiField label="What should we improve?">
        <textarea
          className="gm-textarea"
          rows={4}
          value={note}
          onChange={(event) => onNote(event.target.value)}
          placeholder={
            value === "up"
              ? "Anything that made this answer useful?"
              : "e.g. the dose was wrong for a 20 L knapsack…"
          }
        />
      </AiField>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {[
          "Dose was wrong",
          "Wrong product",
          "Price out of date",
          "Too generic",
          "Language",
        ].map((tag) => (
          <button
            key={tag}
            type="button"
            className="gm-filter-chip"
            onClick={() => onNote(note ? `${note}, ${tag}` : tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Skip
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onSubmit}>
          <Check width={15} height={15} /> Send feedback
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ credits wizard ============================ */

function CreditsWizard({
  planId,
  balance,
  busy,
  onPlan,
  onConfirm,
  onClose,
}: {
  planId: string;
  balance: number;
  busy: boolean;
  onPlan: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const plan = CREDIT_PLANS.find((row) => row.id === planId) ?? CREDIT_PLANS[2];

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Activating {plan.name}…</h3>
        <p className="text-muted mb-0">
          Charging {kes(plan.price)} from your GrowMO wallet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Stepper
        steps={["Choose plan", "Review", "Pay"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <div className="gm-module-grid mt-3">
          {CREDIT_PLANS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`gm-checkcard ${option.id === planId ? "is-active" : ""}`}
              onClick={() => onPlan(option.id)}
              aria-pressed={option.id === planId}
            >
              <div className="d-flex align-items-center justify-content-between gap-2">
                <strong className="font-display">{option.name}</strong>
                {option.popular ? (
                  <StatusChip label="Popular" tone="low" />
                ) : null}
              </div>
              <span className="gm-price-big font-display">
                {option.price ? kes(option.price) : "Free"}
              </span>
              <small className="text-muted">
                {option.credits} credits / month
              </small>
              <ul className="gm-check-list mt-2">
                {option.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : step === 1 ? (
        <div className="mt-3">
          <AiFactGrid>
            <AiFact label="Plan" value={plan.name} />
            <AiFact label="Price" value={kes(plan.price)} />
            <AiFact label="Credits" value={`${plan.credits}`} />
            <AiFact label="Renews" value="Monthly" />
          </AiFactGrid>
          <AiKv label="Wallet balance" value={kes(balance)} />
          <AiKv
            label="After payment"
            value={kes(Math.max(0, balance - plan.price))}
          />
          <AiNote title="No hidden charges" tone="ok">
            Credits never expire within the month, and unused credits roll over
            once. Cancel any time from Settings.
          </AiNote>
        </div>
      ) : (
        <div className="mt-3">
          <AiKv label="Plan" value={plan.name} />
          <AiKv label="Amount" value={kes(plan.price)} />
          <AiKv label="Wallet" value={WALLET.phone} />
          <div className="mt-3">
            <PinPad
              length={4}
              actionLabel={`Pay ${kes(plan.price)}`}
              resetKey={pin.length}
              onComplete={(value) => {
                setPin(value);
                onConfirm();
              }}
            />
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          step === 2 ? onConfirm() : setStep((value) => value + 1)
        }
        finishLabel={`Pay ${kes(plan.price)}`}
      />
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ voice + language ============================ */

function VoiceModal({ onClose }: { onClose: () => void }) {
  const phrases = [
    "Ninapanda lini mahindi Uasin Gishu?",
    "Bei ya sukuma wiki Githunguri leo?",
    "Lipa wachungaji KES 500 kila mmoja",
    "Cabbage zangu zina madoa ya manjano",
  ];
  return (
    <div>
      <div className="gm-ussd-card">
        <span className="gm-eyebrow">USSD — works without data</span>
        <span className="gm-ussd-code">*384*22#</span>
        <p className="mb-0">
          Dial, choose <strong>3 — AI Advisor</strong>, then speak or type your
          question in English or Kiswahili.
        </p>
      </div>
      <div className="gm-ai-upload mt-3">
        <Mic width={26} height={26} style={{ color: "var(--gm-leaf-600)" }} />
        <strong className="font-display">Sema swali lako</strong>
        <small className="text-muted">
          Voice Swahili v0.9 (beta) — 78% accuracy on rural accents. Try one of
          these:
        </small>
      </div>
      <div className="d-flex flex-wrap gap-2 mt-3">
        {phrases.map((phrase) => (
          <span key={phrase} className="gm-chip">
            <Radio width={13} height={13} /> {phrase}
          </span>
        ))}
      </div>
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <Link to="/app/dashboard" className="gm-btn gm-btn-lime">
          Open the dashboard
        </Link>
      </AiModalFooter>
    </div>
  );
}

function LanguageModal({
  swahiliFirst,
  offline,
  onSwahili,
  onOffline,
  onClose,
}: {
  swahiliFirst: boolean;
  offline: boolean;
  onSwahili: () => void;
  onOffline: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <Toggle
        checked={swahiliFirst}
        onChange={onSwahili}
        label="Reply in Kiswahili first"
        desc="The advisor detects your language per message, this only sets the default."
      />
      <Toggle
        checked={offline}
        onChange={onOffline}
        label="Low-data mode"
        desc="Shorter answers with fewer sources — uses about 60% less data."
      />
      <AiFactGrid>
        <AiFact label="Languages" value={ADVISOR_PROFILE.language} />
        <AiFact label="Model" value={ADVISOR_PROFILE.model} />
        <AiFact label="Version" value={ADVISOR_PROFILE.modelVersion} />
        <AiFact label="Reply time" value={ADVISOR_PROFILE.responseTime} />
      </AiFactGrid>
      <AiNote title="Offline" tone="ok">
        {ADVISOR_PROFILE.offlineMode}. Photo diagnosis and plan generation need
        a data connection.
      </AiNote>
      <AiModalFooter align="end">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Save settings
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.2 plan wizard ============================ */

type PlanFormValues = {
  planCrop: string;
  planAcres: string;
  planCounty: string;
  planMonth: string;
  planBudget: string;
  planSoil: string;
  planWater: string;
  planGoal: string;
};

function PlanWizard({
  values,
  scaledTotal,
  budgetValue,
  overBudget,
  busy,
  onChange,
  onGenerate,
  onClose,
}: {
  values: PlanFormValues;
  scaledTotal: number;
  budgetValue: number;
  overBudget: boolean;
  busy: boolean;
  onChange: (field: keyof PlanFormValues, value: string) => void;
  onGenerate: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [run, setRun] = useState(false);

  const generate = () => {
    setRun(true);
    window.setTimeout(() => {
      setRun(false);
      setGenerated(true);
      setStep(3);
      onGenerate();
    }, 1200);
  };

  if (run || busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Building your season plan…</h3>
        <p className="text-muted mb-0">
          Season Planner v5.0 is costing 17 activities from KALRO calendars,
          local input prices and your labour rates.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Stepper
        steps={["Inputs", "Review", "Generate", "Plan"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          {PLAN_INPUTS.map((field) => {
            const value =
              values[
                `plan${field.id.charAt(0).toUpperCase()}${field.id.slice(1)}` as keyof PlanFormValues
              ];
            return (
              <AiField key={field.id} label={field.label} hint={field.hint}>
                <select
                  className="gm-select"
                  value={value}
                  onChange={(event) =>
                    onChange(
                      `plan${field.id.charAt(0).toUpperCase()}${field.id.slice(1)}` as keyof PlanFormValues,
                      event.target.value,
                    )
                  }
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </AiField>
            );
          })}
        </div>
      ) : step === 1 ? (
        <div className="mt-3">
          <AiFactGrid>
            <AiFact label="Crop" value={values.planCrop} />
            <AiFact label="Acreage" value={values.planAcres} />
            <AiFact label="County" value={values.planCounty} />
            <AiFact label="Planting" value={values.planMonth} />
            <AiFact label="Budget" value={values.planBudget} />
            <AiFact label="Soil" value={values.planSoil} />
            <AiFact label="Water" value={values.planWater} />
            <AiFact label="Goal" value={values.planGoal} />
          </AiFactGrid>
          <AiKv label="Modelled cost" value={kes(scaledTotal)} />
          <AiKv label="Stated budget" value={kes(budgetValue)} />
          <AiKv label="Activities" value={`${SEASON_PLAN_ROWS.length}`} />
          <AiNote
            tone={overBudget ? "warn" : "ok"}
            title={overBudget ? "Above budget" : "Within budget"}
          >
            {overBudget
              ? `The model needs ${kes(scaledTotal)} against your ${kes(budgetValue)}. Drop the third weeding, or move to SC Duma 43 for a shorter season.`
              : `${kes(scaledTotal)} modelled against ${kes(budgetValue)} — the difference stays as contingency.`}
          </AiNote>
        </div>
      ) : step === 2 ? (
        <div className="mt-3">
          <AiNote title="What the generator produces" tone="ok">
            A week-by-week calendar with inputs, quantities, costs and labour,
            plus three revenue scenarios and a break-even yield.
          </AiNote>
          <div className="gm-table-wrap">
            <table className="gm-table">
              <thead>
                <tr>
                  <th scope="col">Output</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Season calendar</th>
                  <td>
                    {SEASON_PLAN_ROWS.length} activities from week -2 to week 19
                  </td>
                </tr>
                <tr>
                  <th scope="row">Cost & labour split</th>
                  <td>
                    Inputs {kes(PLAN_TOTALS.inputs)} · labour{" "}
                    {kes(PLAN_TOTALS.labour)} · logistics{" "}
                    {kes(PLAN_TOTALS.logistics)}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Revenue scenarios</th>
                  <td>Best, average and worst with ROI per scenario</td>
                </tr>
                <tr>
                  <th scope="row">Risk add-ons</th>
                  <td>
                    Armyworm scouting, spray windows and a drought contingency
                    task
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="d-flex align-items-center gap-3">
            <CheckCircle2
              width={28}
              height={28}
              style={{ color: "var(--gm-leaf-600)" }}
            />
            <div>
              <span className="gm-eyebrow">Plan ready</span>
              <h3 className="gm-h-section mb-0">
                {values.planCrop} · {values.planAcres} · {values.planCounty}
              </h3>
              <p className="text-muted mb-0">
                Saved to your library as a draft. Grand total {kes(scaledTotal)}
                .
              </p>
            </div>
          </div>
          <div className="gm-ai-scenarios mt-3">
            {PLAN_SCENARIOS.map((scenario) => (
              <AiScenarioCard
                key={scenario.id}
                scenario={scenario}
                best={scenario.id === "ps-avg"}
              />
            ))}
          </div>
        </div>
      )}
      <WizardActions
        step={step}
        last={3}
        onBack={() => setStep((value) => value - 1)}
        onNext={() =>
          step === 2 ? generate() : setStep((value) => Math.min(3, value + 1))
        }
        nextLabel={step === 2 ? "Generate the plan" : "Continue"}
        finishLabel={generated ? "Close" : "Generate the plan"}
      />
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ plan detail ============================ */

function PlanDetailModal({
  plan,
  tab,
  onTab,
  onExport,
  onShare,
  onClose,
}: {
  plan: SavedPlan;
  tab: "activities" | "budget" | "returns";
  onTab: (tab: "activities" | "budget" | "returns") => void;
  onExport: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">{plan.status}</span>
          <h3 className="gm-h-section mb-0">{plan.name}</h3>
          <p className="text-muted mb-0">
            {plan.county} · {plan.acres} acres · {plan.month} · owner{" "}
            {plan.owner}
          </p>
        </div>
        <StatusChip
          label={plan.status}
          tone={
            plan.status === "Completed"
              ? "low"
              : plan.status === "Active"
                ? "medium"
                : "neutral"
          }
        />
      </div>

      <AiFactGrid>
        <AiFact label="Budget" value={kes(plan.budget)} />
        <AiFact label="Spent" value={kes(plan.spent)} />
        <AiFact label="Activities" value={`${plan.activities}`} />
        <AiFact label="Expected profit" value={kes(plan.expectedProfit)} />
      </AiFactGrid>

      <div className="gm-tabs mt-3" role="tablist" aria-label="Plan detail">
        {(
          [
            { id: "activities", label: "Activities" },
            { id: "budget", label: "Budget" },
            { id: "returns", label: "Returns" },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`gm-tab ${tab === item.id ? "on" : ""}`}
            onClick={() => onTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "activities" ? (
        <div className="gm-table-wrap mt-3">
          <table className="gm-table">
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">Date</th>
                <th scope="col">Activity</th>
                <th scope="col">Labour</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {SEASON_PLAN_ROWS.slice(0, 8).map((row) => (
                <tr key={row.id}>
                  <th scope="row" className="font-display">
                    {row.week}
                  </th>
                  <td>{row.date}</td>
                  <td>{row.activity}</td>
                  <td>{row.labour}</td>
                  <td className="font-display">
                    {kes(row.cost + row.labourCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === "budget" ? (
        <div className="mt-3">
          <ProgressLine
            value={Math.min(100, Math.round((plan.spent / plan.budget) * 100))}
            label="Budget used"
          />
          <AiKv label="Inputs" value={kes(Math.round(plan.spent * 0.62))} />
          <AiKv label="Labour" value={kes(Math.round(plan.spent * 0.3))} />
          <AiKv label="Logistics" value={kes(Math.round(plan.spent * 0.08))} />
          <AiKv label="Remaining" value={kes(plan.budget - plan.spent)} />
        </div>
      ) : (
        <div className="mt-3">
          <AiKv
            label="Expected revenue"
            value={kes(plan.expectedProfit + plan.budget)}
          />
          <AiKv label="Cost" value={kes(plan.budget)} />
          <AiKv label="Expected profit" value={kes(plan.expectedProfit)} />
          <AiKv
            label="ROI"
            value={`${Math.round((plan.expectedProfit / plan.budget) * 100)}%`}
          />
          <AiNote title="Model note" tone="ok">
            Returns assume the average scenario from the revenue model — best
            case is 60% higher, worst case still clears costs.
          </AiNote>
        </div>
      )}

      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onShare}
        >
          <Share2 width={15} height={15} /> Share
        </button>
        <span className="d-flex gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onExport}
          >
            <FileDown width={15} height={15} /> Export
          </button>
        </span>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.3 treatment wizard ============================ */

function TreatWizard({
  risk,
  acres,
  onClose,
  onSave,
}: {
  risk: PestRisk | null;
  acres: string;
  onClose: () => void;
  onSave: (task: Omit<AdvisorTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState(
    TREATMENT_PRODUCTS.find((row) => row.name.includes("Mancozeb"))?.id ??
      TREATMENT_PRODUCTS[0].id,
  );
  const [when, setWhen] = useState("Tomorrow 06:00 – 09:00");
  const [worker, setWorker] = useState("Peter Kamau · 0723 456 789");
  const [knapsacks, setKnapsacks] = useState("4");
  const [busy, setBusy] = useState(false);

  const chosen =
    TREATMENT_PRODUCTS.find((row) => row.id === product) ??
    TREATMENT_PRODUCTS[0];
  const acreValue = Number.parseFloat(acres) || 0.5;
  const packs = Math.max(1, Math.ceil(acreValue * 2));
  const productCost = Math.round((chosen.price / 4) * packs);
  const labourCost = Math.round(acreValue * 800);
  const total = productCost + labourCost + 270;

  const finish = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      onSave({
        title: `Spray ${chosen.name} — ${risk?.pest ?? "preventive"}`,
        detail: `${chosen.dose} · ${knapsacks} knapsacks · ${when} · PHI ${chosen.phi}`,
        due: when,
        plot: "Plot 1: Shamba ya nyumba",
        cost: total,
        source: "AI risk model",
      });
      onClose();
    }, 900);
  };

  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Scheduling the spray round…</h3>
      </div>
    );
  }

  return (
    <div>
      <Stepper
        steps={["Product", "Dose & timing", "Confirm"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <>
          {risk ? (
            <AiNote
              title={`${risk.pest} · ${risk.county}`}
              tone={risk.risk === "high" ? "danger" : "warn"}
            >
              {risk.action} · risk score {risk.score} · {risk.confidence}% model
              confidence
            </AiNote>
          ) : null}
          <div className="d-flex flex-column gap-2 mt-3">
            {TREATMENT_PRODUCTS.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`gm-check-row ${row.id === product ? "is-selected" : ""}`}
                onClick={() => setProduct(row.id)}
                aria-pressed={row.id === product}
              >
                <span>
                  <strong className="d-block">{row.name}</strong>
                  <small className="text-muted">
                    {row.active} · targets {row.target}
                  </small>
                  <small className="text-muted">
                    {row.dose} · PHI {row.phi} · {row.supplier}
                  </small>
                </span>
                <span className="d-flex align-items-center gap-2">
                  <span className="font-display" style={{ fontWeight: 700 }}>
                    {kes(row.price)}
                  </span>
                  <StatusChip
                    label={row.organic ? "Organic" : "Conventional"}
                    tone={row.organic ? "low" : "neutral"}
                  />
                </span>
              </button>
            ))}
          </div>
        </>
      ) : step === 1 ? (
        <div className="gm-form-grid mt-3">
          <AiField label="Acres to treat">
            <select
              className="gm-select"
              value={acres}
              onChange={(event) =>
                setKnapsacks(
                  String(Math.ceil(Number.parseFloat(event.target.value) * 8)),
                )
              }
            >
              {["0.25", "0.5", "1", "1.5", "2"].map((option) => (
                <option key={option} value={option}>
                  {option} acres
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Knapsacks (20 L)" hint="About 8 knapsacks per acre.">
            <input
              className="gm-input"
              value={knapsacks}
              onChange={(event) => setKnapsacks(event.target.value)}
              aria-label="Knapsacks"
            />
          </AiField>
          <AiField
            label="Spray window"
            hint="Wind under 12 km/h and no rain for 6 hours."
          >
            <select
              className="gm-select"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
            >
              {[
                "Tomorrow 06:00 – 09:00",
                "Tomorrow 16:30 – 18:00",
                "23 Sep 06:00 – 09:00",
                "24 Sep 16:30 – 18:00",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Who sprays">
            <select
              className="gm-select"
              value={worker}
              onChange={(event) => setWorker(event.target.value)}
            >
              {[
                "Peter Kamau · 0723 456 789",
                "Jane Nyambura · 0712 345 678",
                "Grace Achieng · 0734 567 890",
                "Myself",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
        </div>
      ) : (
        <div className="mt-3">
          <div className="gm-ai-receipt">
            <strong className="font-display d-block mb-2">
              Spray round summary
            </strong>
            <AiKv label="Product" value={chosen.name} />
            <AiKv label="Dose" value={chosen.dose} />
            <AiKv
              label="Packs needed"
              value={`${packs} × ${chosen.packSize}`}
            />
            <AiKv label="Product cost" value={kes(productCost)} />
            <AiKv label="Labour" value={kes(labourCost)} />
            <AiKv label="Water + sticker" value={kes(270)} />
            <AiKv label="Total" value={kes(total)} />
            <AiKv label="PHI" value={chosen.phi} />
            <AiKv label="Window" value={when} />
          </div>
          <AiNote title="Safety" tone="warn">
            Full PPE, no spraying within 6 hours of rain, and never re-enter the
            plot for 4 hours. Record the batch number for traceability.
          </AiNote>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
        finishLabel={`Schedule · ${kes(total)}`}
      />
    </div>
  );
}

/* ============================ scouting wizard ============================ */

function ScoutWizard({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (task: Omit<AdvisorTask, "id" | "status">) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [plot, setPlot] = useState("Plot 1: Shamba ya nyumba");
  const [when, setWhen] = useState("Tomorrow 06:30");
  const [who, setWho] = useState("Myself");
  const [plants, setPlants] = useState("40");
  const [target, setTarget] = useState("Black rot lesions");

  const finish = () => {
    onSave({
      title: `Scout ${crop} for ${target.toLowerCase()}`,
      detail: `${plants} plants, W-pattern across ${plot} · assigned to ${who}`,
      due: when,
      plot,
      cost: who === "Myself" ? 0 : 500,
      source: "AI risk model",
    });
    onClose();
  };

  return (
    <div>
      <Stepper
        steps={["What", "Where & when", "Confirm"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <AiField label="Crop">
            <select
              className="gm-select"
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
            >
              {[
                "Cabbage",
                "Maize",
                "Tomato",
                "Kale",
                "Dry Beans",
                "Potato",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="What to look for">
            <select
              className="gm-select"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {[
                "Black rot lesions",
                "Fall armyworm frass",
                "Diamondback moth larvae",
                "Aphid colonies",
                "Leaf miner trails",
                "Nutrient deficiency",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField
            label="Plants to check"
            hint="10 random plants per acre is the minimum."
          >
            <input
              className="gm-input"
              value={plants}
              onChange={(event) => setPlants(event.target.value)}
              aria-label="Plants to check"
            />
          </AiField>
        </div>
      ) : step === 1 ? (
        <div className="gm-form-grid mt-3">
          <AiField label="Plot">
            <select
              className="gm-select"
              value={plot}
              onChange={(event) => setPlot(event.target.value)}
            >
              {[
                "Plot 1: Shamba ya nyumba",
                "Plot 2: Ridge block",
                "Plot 3: Tunnel",
                "Plot 4: Lower shamba",
                "Plot 6: Kitchen garden",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="When">
            <select
              className="gm-select"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
            >
              {[
                "Tomorrow 06:30",
                "Tomorrow 16:30",
                "22 Sep 06:30",
                "24 Sep 07:00",
              ].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Who scouts">
            <select
              className="gm-select"
              value={who}
              onChange={(event) => setWho(event.target.value)}
            >
              {["Myself", "Peter Kamau", "Jane Nyambura", "Grace Achieng"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </AiField>
        </div>
      ) : (
        <div className="mt-3">
          <AiFactGrid>
            <AiFact label="Crop" value={crop} />
            <AiFact label="Target" value={target} />
            <AiFact label="Plants" value={plants} />
            <AiFact label="Plot" value={plot} />
            <AiFact label="When" value={when} />
            <AiFact label="Scout" value={who} />
          </AiFactGrid>
          <AiNote title="How to scout" tone="ok">
            Walk a W-pattern, stop at 10 random plants, check the whorl and the
            underside of the lower leaves. Photograph anything unusual and the
            advisor will diagnose it from the photo.
          </AiNote>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step === 2 ? finish() : setStep((value) => value + 1))}
        finishLabel="Schedule scouting"
      />
    </div>
  );
}

/* ============================ risk detail + rules ============================ */

function RiskDetailModal({
  risk,
  onTreat,
  onScout,
  onIgnore,
  onClose,
}: {
  risk: PestRisk;
  onTreat: () => void;
  onScout: () => void;
  onIgnore: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex align-items-start gap-3">
        <span
          className="gm-ai-score"
          style={{ width: 64, height: 64, fontSize: "1.3rem" }}
        >
          {risk.score}
        </span>
        <div>
          <span className="gm-eyebrow">
            {risk.kind} · {risk.county}
          </span>
          <h3 className="gm-h-section mb-0">{risk.pest}</h3>
          <p className="text-muted mb-0">
            {risk.crop} ({risk.variety}) · {risk.swahili}
          </p>
        </div>
        <StatusChip label={`${risk.risk} risk`} tone={riskTone(risk.risk)} />
      </div>

      <AiFactGrid>
        <AiFact label="Risk score" value={`${risk.score} / 100`} />
        <AiFact label="Model confidence" value={`${risk.confidence}%`} />
        <AiFact label="Last scout" value={risk.lastScout} />
        <AiFact label="Next scout" value={risk.nextScout} />
      </AiFactGrid>

      <AiNote
        tone={
          risk.risk === "high"
            ? "danger"
            : risk.risk === "medium"
              ? "warn"
              : "ok"
        }
        title="7-day forecast"
      >
        {risk.forecast}
      </AiNote>

      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Recommended action</th>
              <td>{risk.action}</td>
            </tr>
            <tr>
              <th scope="row">Product</th>
              <td>
                {risk.product} · {risk.dose}
              </td>
            </tr>
            <tr>
              <th scope="row">Pre-harvest interval</th>
              <td>{risk.phi}</td>
            </tr>
            <tr>
              <th scope="row">Best spray window</th>
              <td>{risk.window}</td>
            </tr>
            <tr>
              <th scope="row">Model</th>
              <td>{risk.model}</td>
            </tr>
            <tr>
              <th scope="row">On your farm</th>
              <td>
                {risk.yourFarm
                  ? "Yes — this is one of your crops"
                  : "Neighbouring farms"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={onIgnore}
        >
          <X width={15} height={15} /> Dismiss risk
        </button>
        <span className="d-flex gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-outline"
            onClick={onScout}
          >
            <ListChecks width={15} height={15} /> Scout
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onTreat}
          >
            <Droplets width={15} height={15} /> Treat now
          </button>
        </span>
      </AiModalFooter>
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onClose}
        >
          Close
        </button>
      </AiModalFooter>
    </div>
  );
}

function RiskRulesModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (summary: string) => void;
}) {
  const [highThreshold, setHighThreshold] = useState("70");
  const [mediumThreshold, setMediumThreshold] = useState("45");
  const [sms, setSms] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [crops, setCrops] = useState("Cabbage, Maize");
  return (
    <div>
      <p className="text-muted">
        Choose when the advisor interrupts you. Rules apply to risk scores,
        price movements and spray windows.
      </p>
      <div className="gm-form-grid">
        <AiField label="High risk at score" hint="Default 70 of 100.">
          <input
            className="gm-input"
            value={highThreshold}
            onChange={(event) => setHighThreshold(event.target.value)}
            aria-label="High risk threshold"
          />
        </AiField>
        <AiField label="Medium risk at score">
          <input
            className="gm-input"
            value={mediumThreshold}
            onChange={(event) => setMediumThreshold(event.target.value)}
            aria-label="Medium risk threshold"
          />
        </AiField>
        <AiField label="Crops to watch">
          <input
            className="gm-input"
            value={crops}
            onChange={(event) => setCrops(event.target.value)}
            aria-label="Crops to watch"
          />
        </AiField>
      </div>
      <Toggle
        checked={sms}
        onChange={setSms}
        label="SMS alerts"
        desc={`To ${WALLET.phone} · KES 1 per message`}
      />
      <Toggle
        checked={inApp}
        onChange={setInApp}
        label="In-app notifications"
        desc="Shows in the insight feed and the topbar bell."
      />
      <Toggle
        checked={priceAlerts}
        onChange={setPriceAlerts}
        label="Price movement alerts"
        desc="Any watched market moving more than 8% in a day."
      />
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() =>
            onSave(
              `High ≥ ${highThreshold}, medium ≥ ${mediumThreshold} · ${crops} · ${
                sms ? "SMS" : ""
              }${sms && inApp ? " + " : ""}${inApp ? "in-app" : ""}`,
            )
          }
        >
          <Save width={15} height={15} /> Save rules
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.4 market modals ============================ */

function MarketDetailModal({
  market,
  onAlert,
  onSell,
  onClose,
}: {
  market: MarketForecast;
  onAlert: () => void;
  onSell: () => void;
  onClose: () => void;
}) {
  const months = [
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
  ];
  return (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">{market.market}</span>
          <h3 className="gm-h-section mb-0">
            {market.crop} · per {market.unit}
          </h3>
          <p className="text-muted mb-0">
            {market.swahili} · {market.yourStock}
          </p>
        </div>
        <div className="text-end">
          <strong className="font-display" style={{ fontSize: "1.6rem" }}>
            {kes(market.current)}
          </strong>
          <div className="d-flex align-items-center gap-2 justify-content-end">
            <TrendIcon trend={market.trend} />
            <StatusChip
              label={market.trendLabel}
              tone={
                market.trend === "rising"
                  ? "low"
                  : market.trend === "falling"
                    ? "high"
                    : "neutral"
              }
            />
          </div>
        </div>
      </div>

      <AiFactGrid>
        <AiFact
          label="1-month range"
          value={`${kes(market.month1Low)} – ${kes(market.month1High)}`}
        />
        <AiFact
          label="3-month range"
          value={`${kes(market.month3Low)} – ${kes(market.month3High)}`}
        />
        <AiFact label="Confidence" value={`${market.confidence}%`} />
        <AiFact label="Market" value={market.market} />
      </AiFactGrid>

      <AiSparkline
        series={market.series}
        label={`${market.crop} price history, last 12 months`}
      />
      <div className="gm-ai-bench-legend mb-3">
        {months.map((month, index) => (
          <span key={month}>
            {month} <b>{market.series[index]}</b>
          </span>
        ))}
      </div>

      <AiNote title="What the model says" tone="ok">
        {market.advice}. Price Compass v3.1 blends AFA bulletins with daily
        collection from 42 produce markets; confidence reflects how stable this
        market has been over 12 months.
      </AiNote>

      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Horizon</th>
              <th scope="col">Low</th>
              <th scope="col">High</th>
              <th scope="col">Your stock</th>
              <th scope="col">Suggested move</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Today</th>
              <td className="font-display">{kes(market.current)}</td>
              <td className="font-display">{kes(market.current)}</td>
              <td>{market.yourStock}</td>
              <td>
                {market.trend === "falling"
                  ? "Hold — supply glut is temporary"
                  : market.trend === "rising"
                    ? "Hold — prices are still climbing"
                    : "Sell steady volumes, keep a core stock"}
              </td>
            </tr>
            <tr>
              <th scope="row">1 month</th>
              <td className="font-display">{kes(market.month1Low)}</td>
              <td className="font-display">{kes(market.month1High)}</td>
              <td>{market.yourStock}</td>
              <td>Set an alert at the top of the range</td>
            </tr>
            <tr>
              <th scope="row">3 months</th>
              <td className="font-display">{kes(market.month3Low)}</td>
              <td className="font-display">{kes(market.month3High)}</td>
              <td>{market.yourStock}</td>
              <td>
                {market.month3High > market.current
                  ? "Plan to sell into the higher range"
                  : "Sell earlier if you need cash"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onAlert}
        >
          <Bell width={15} height={15} /> Alert me
        </button>
        <span className="d-flex gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={onClose}
          >
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onSell}>
            <CircleDollarSign width={15} height={15} /> Sell now or hold?
          </button>
        </span>
      </AiModalFooter>
    </div>
  );
}

function PriceAlertWizard({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (
    alert: Omit<PriceAlert, "id" | "created" | "lastCheck" | "status">,
  ) => void;
}) {
  const [step, setStep] = useState(0);
  const [crop, setCrop] = useState("Cabbage");
  const [market, setMarket] = useState(MARKET_FORECASTS[0].market);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("35");
  const [channel, setChannel] = useState("SMS");
  const [phone, setPhone] = useState(WALLET.phone);

  const finish = () => {
    onSave({
      crop,
      market,
      condition,
      target: Number.parseInt(target, 10) || 0,
      unit: MARKET_FORECASTS.find((row) => row.crop === crop)?.unit ?? "unit",
      channel,
      recipient: phone,
    });
    onClose();
  };

  return (
    <div>
      <Stepper
        steps={["Trigger", "Delivery"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <div className="gm-form-grid mt-3">
          <AiField label="Crop">
            <select
              className="gm-select"
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
            >
              {MARKET_FORECASTS.map((row) => (
                <option key={row.id} value={row.crop}>
                  {row.crop}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Market">
            <select
              className="gm-select"
              value={market}
              onChange={(event) => setMarket(event.target.value)}
            >
              {MARKET_FORECASTS.map((row) => (
                <option key={row.id} value={row.market}>
                  {row.market}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Trigger when price is">
            <select
              className="gm-select"
              value={condition}
              onChange={(event) =>
                setCondition(event.target.value as "above" | "below")
              }
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </AiField>
          <AiField label="Target price (KES)">
            <input
              className="gm-input"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              aria-label="Target price"
            />
          </AiField>
        </div>
      ) : (
        <div className="gm-form-grid mt-3">
          <AiField label="Channel">
            <select
              className="gm-select"
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
            >
              {["SMS", "App", "SMS + app"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </AiField>
          <AiField label="Recipient number" hint="07XX or 01XX.">
            <input
              className="gm-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-label="Recipient number"
            />
          </AiField>
        </div>
      )}
      <AiNote title="Checked daily" tone="ok">
        Markets are checked at 06:00 EAT. SMS alerts cost KES 1 each and come
        out of your GrowMO wallet.
      </AiNote>
      <WizardActions
        step={step}
        last={1}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step === 1 ? finish() : setStep(1))}
        finishLabel="Arm the alert"
        nextDisabled={step === 0 && !(Number.parseInt(target, 10) > 0)}
      />
    </div>
  );
}

function SellModal({
  market,
  onAlert,
  onClose,
}: {
  market: MarketForecast | null;
  onAlert: () => void;
  onClose: () => void;
}) {
  const row = market ?? MARKET_FORECASTS[2];
  const options = [
    {
      id: "now",
      label: "Sell now",
      price: row.current,
      revenue: Math.round(row.current * 56),
      storage: 0,
      note: "Cash today, no storage risk.",
      tone: "neutral" as const,
    },
    {
      id: "3w",
      label: "Hold 3 weeks",
      price: row.month1Low,
      revenue: Math.round(row.month1Low * 56),
      storage: 2800,
      note: "Rift harvest glut — prices dip first.",
      tone: "high" as const,
    },
    {
      id: "8w",
      label: "Hold 8 weeks",
      price: row.month3High,
      revenue: Math.round(row.month3High * 56),
      storage: 7400,
      note: "Best net if the store stays dry and weevil-free.",
      tone: "low" as const,
    },
  ];
  return (
    <div>
      <p className="text-muted">
        {row.crop} at {row.market} · 56 bags in store · moisture 13.2%
      </p>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">Price/bag</th>
              <th scope="col">Revenue</th>
              <th scope="col">Storage cost</th>
              <th scope="col">Net</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option) => (
              <tr key={option.id}>
                <th scope="row">
                  <span className="d-flex align-items-center gap-2">
                    {option.label}
                    <StatusChip label={option.tone} tone={option.tone} />
                  </span>
                </th>
                <td className="font-display">{kes(option.price)}</td>
                <td className="font-display">{kes(option.revenue)}</td>
                <td className="font-display">{kes(option.storage)}</td>
                <td className="font-display">
                  <strong>{kes(option.revenue - option.storage)}</strong>
                </td>
                <td>{option.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AiSummary
        title="AI call: hold, but sell 20 bags now"
        note="You need KES 42,000 for school fees on 5 October. Selling 20 bags covers it and leaves 36 bags to ride into the higher December range."
        chips={[
          "Break-even at KES 3,050/bag",
          "Store must stay below 13.5% moisture",
        ]}
      />
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onAlert}>
          <Bell width={15} height={15} /> Set a price alert
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.5 benchmark modals ============================ */

function MetricDetailModal({
  metric,
  onClose,
}: {
  metric: BenchmarkMetric;
  onClose: () => void;
}) {
  return (
    <div>
      <span className="gm-eyebrow">Benchmark detail</span>
      <h3 className="gm-h-section">{metric.metric}</h3>
      <p className="text-muted">{metric.swahili}</p>
      <AiFactGrid>
        <AiFact label="Your farm" value={metric.yours} />
        <AiFact label="County average" value={metric.countyAvg} />
        <AiFact label="Top 10%" value={metric.top10} />
        <AiFact
          label="Difference"
          value={`${metric.diffPct > 0 ? "+" : ""}${metric.diffPct}%`}
        />
      </AiFactGrid>
      <AiBenchBar metric={metric} onOpen={onClose} />
      <AiNote title="How this is measured" tone="ok">
        {metric.measured}. Peer data is opt-in and anonymised from{" "}
        {PEER_GROUPS[0].farms} Kiambu farms and county cooperative returns.
      </AiNote>
      <AiNote title="How to close the gap" tone="warn">
        {metric.tip}
      </AiNote>
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <Link to="/app/crops" className="gm-btn gm-btn-lime">
          <Wheat width={15} height={15} /> Open crop records
        </Link>
      </AiModalFooter>
    </div>
  );
}

function PeerPicker({
  peerId,
  onPick,
  onClose,
}: {
  peerId: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <p className="text-muted">
        Peer groups decide who you are compared against. Choose the group that
        matches your scale — narrow groups give sharper numbers.
      </p>
      <div className="d-flex flex-column gap-2">
        {PEER_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`gm-check-row ${group.id === peerId ? "is-selected" : ""}`}
            onClick={() => onPick(group.id)}
            aria-pressed={group.id === peerId}
          >
            <span>
              <strong className="d-block">{group.label}</strong>
              <small className="text-muted">
                {group.county} · {group.crop} · {group.band}
              </small>
              <small className="text-muted">{group.note}</small>
            </span>
            <span className="d-flex align-items-center gap-2">
              <span className="font-display" style={{ fontWeight: 700 }}>
                {group.farms} farms
              </span>
              {group.id === peerId ? (
                <Check
                  width={16}
                  height={16}
                  style={{ color: "var(--gm-leaf-600)" }}
                />
              ) : null}
            </span>
          </button>
        ))}
      </div>
      <AiModalFooter align="end">
        <button type="button" className="gm-btn gm-btn-lime" onClick={onClose}>
          Done
        </button>
      </AiModalFooter>
    </div>
  );
}

function ReportModal({
  peer,
  onExport,
  onShare,
  onClose,
}: {
  peer: PeerGroup;
  onExport: () => void;
  onShare: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <p className="text-muted">
        A one-page report comparing your farm with {peer.farms}{" "}
        {peer.label.toLowerCase()} farms — for your own records, a lender or
        your cooperative.
      </p>
      <AiFactGrid>
        <AiFact label="Peer group" value={peer.label} />
        <AiFact label="Farms compared" value={`${peer.farms}`} />
        <AiFact label="Metrics" value={`${BENCHMARK_METRICS.length}`} />
        <AiFact label="Period" value="Short rains 2026" />
      </AiFactGrid>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">You</th>
              <th scope="col">County avg</th>
              <th scope="col">Top 10%</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARK_METRICS.slice(0, 7).map((metric) => (
              <tr key={metric.id}>
                <th scope="row">{metric.metric}</th>
                <td className="font-display">{metric.yours}</td>
                <td className="font-display">{metric.countyAvg}</td>
                <td className="font-display">{metric.top10}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AiNote title="AI summary included" tone="ok">
        {BENCHMARK_SUMMARY}
      </AiNote>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <span className="d-flex gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={onShare}
          >
            <Share2 width={15} height={15} /> Share
          </button>
          <button
            type="button"
            className="gm-btn gm-btn-lime"
            onClick={onExport}
          >
            <FileDown width={15} height={15} /> Download CSV
          </button>
        </span>
      </AiModalFooter>
    </div>
  );
}

/* ============================ 9.6 fertilizer modals ============================ */

function FertWizard({
  acres,
  chosen,
  soilApplied,
  total,
  lime,
  onAcres,
  onChosen,
  onSoil,
  onApply,
  onClose,
}: {
  acres: string;
  chosen: string;
  soilApplied: boolean;
  total: number;
  lime: number;
  onAcres: (value: string) => void;
  onChosen: (value: string) => void;
  onSoil: () => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const row =
    FERT_PROGRAMS.find((program) => program.approach === chosen) ??
    FERT_PROGRAMS[2];
  return (
    <div>
      <Stepper
        steps={["Soil & area", "Program", "Confirm"]}
        current={step}
        onStep={(index) => (index < step ? setStep(index) : undefined)}
      />
      {step === 0 ? (
        <div className="mt-3">
          <AiFactGrid>
            <AiFact label="Soil test" value={SOIL_TEST.taken} />
            <AiFact label="Lab" value={SOIL_TEST.lab} />
            <AiFact label="pH" value={`${SOIL_TEST.ph}`} />
            <AiFact label="Target pH" value={`${SOIL_TEST.phTarget}`} />
          </AiFactGrid>
          <div className="gm-form-grid mt-3">
            <AiField label="Acres to treat">
              <select
                className="gm-select"
                value={acres}
                onChange={(event) => onAcres(event.target.value)}
              >
                {["0.25", "0.5", "1", "1.5", "2"].map((option) => (
                  <option key={option} value={option}>
                    {option} acres
                  </option>
                ))}
              </select>
            </AiField>
          </div>
          <Toggle
            checked={soilApplied}
            onChange={onSoil}
            label="Include lime correction"
            desc={`pH ${SOIL_TEST.ph} needs ${SOIL_TEST.limeNeeded} — applied 3 weeks before planting`}
          />
          <AiNote tone="warn" title="Why lime matters">
            {SOIL_TEST.note}
          </AiNote>
        </div>
      ) : step === 1 ? (
        <div className="mt-3">
          <div className="d-flex flex-column gap-2">
            {FERT_PROGRAMS.map((program) => (
              <button
                key={program.id}
                type="button"
                className={`gm-check-row ${program.approach === chosen ? "is-selected" : ""}`}
                onClick={() => onChosen(program.approach)}
                aria-pressed={program.approach === chosen}
              >
                <span>
                  <strong className="d-block">
                    {program.approach} — {program.program}
                  </strong>
                  <small className="text-muted">
                    {program.rate} · {program.yieldImpact}
                  </small>
                </span>
                <span className="d-flex align-items-center gap-2">
                  <span className="font-display" style={{ fontWeight: 700 }}>
                    {kes(program.costPerAcre)}
                  </span>
                  <StatusChip
                    label={program.verdictLabel}
                    tone={verdictTone(program.verdict)}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="gm-ai-receipt">
            <strong className="font-display d-block mb-2">
              {row.approach} program · {acres} acres
            </strong>
            {row.applications.map((application) => (
              <AiKv
                key={application.when + application.what}
                label={`${application.when} · ${application.what}`}
                value={application.rate}
              />
            ))}
            <AiKv label="Fertilizer cost" value={kes(total)} />
            {soilApplied ? (
              <AiKv label="Lime (400 kg/acre)" value={kes(lime)} />
            ) : null}
            <AiKv label="Total" value={kes(total + lime)} />
            <AiKv label="Expected yield" value={row.yieldImpact} />
          </div>
          <AiNote title="AI pick" tone="ok">
            {AI_PICK}
          </AiNote>
        </div>
      )}
      <WizardActions
        step={step}
        last={2}
        onBack={() => setStep((value) => value - 1)}
        onNext={() => (step === 2 ? onApply() : setStep((value) => value + 1))}
        finishLabel={`Order · ${kes(total + lime)}`}
      />
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-soft gm-btn-sm"
          onClick={onClose}
        >
          Cancel
        </button>
      </AiModalFooter>
    </div>
  );
}

function ProgramScheduleModal({
  program,
  acres,
  onOrder,
  onClose,
}: {
  program: FertilizerProgram;
  acres: number;
  onOrder: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">{program.approach}</span>
          <h3 className="gm-h-section mb-0">{program.program}</h3>
          <p className="text-muted mb-0">{program.rate}</p>
        </div>
        <StatusChip
          label={program.verdictLabel}
          tone={verdictTone(program.verdict)}
        />
      </div>
      <AiFactGrid>
        <AiFact label="Cost per acre" value={kes(program.costPerAcre)} />
        <AiFact
          label={`Cost for ${acres} acres`}
          value={kes(Math.round(program.costPerAcre * acres))}
        />
        <AiFact label="Yield impact" value={program.yieldImpact} />
        <AiFact label="Applications" value={`${program.applications.length}`} />
      </AiFactGrid>
      <div className="gm-table-wrap mt-3">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">What</th>
              <th scope="col">Rate</th>
            </tr>
          </thead>
          <tbody>
            {program.applications.map((application) => (
              <tr key={application.when + application.what}>
                <th scope="row">{application.when}</th>
                <td>{application.what}</td>
                <td>{application.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AiNote title="Note" tone="ok">
        {program.note}
      </AiNote>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <button type="button" className="gm-btn gm-btn-lime" onClick={onOrder}>
          <Package width={15} height={15} /> Order these inputs
        </button>
      </AiModalFooter>
    </div>
  );
}

function OrderModal({
  total,
  wallet,
  busy,
  onConfirm,
  onClose,
}: {
  total: number;
  wallet: number;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [pin, setPin] = useState("");
  if (busy) {
    return (
      <div className="text-center p-4">
        <span className="gm-spinner" />
        <h3 className="font-display mt-3">Reserving your inputs…</h3>
        <p className="text-muted mb-0">
          Holding stock at the agro vet and charging {kes(total)} to your
          wallet.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className="gm-ai-receipt">
        <strong className="font-display d-block mb-2">Order summary</strong>
        <AiKv label="Program" value="Fertilizer + amendments" />
        <AiKv label="Total" value={kes(total)} />
        <AiKv label="Wallet balance" value={kes(wallet)} />
        <AiKv label="Balance after" value={kes(Math.max(0, wallet - total))} />
        <AiKv label="Collection" value="Kunene Agrovet, Githunguri" />
      </div>
      <AiNote
        tone={wallet >= total ? "ok" : "danger"}
        title={wallet >= total ? "Wallet covers this order" : "Wallet short"}
      >
        {wallet >= total
          ? "Confirm with your 4-digit GrowMO PIN. Stock is held for 48 hours."
          : `You are ${kes(total - wallet)} short. Top up from the wallet first — stock is still held for 48 hours.`}
      </AiNote>
      <div className="mt-3">
        <PinPad
          length={4}
          actionLabel={`Confirm ${kes(total)}`}
          resetKey={pin.length}
          onComplete={(value) => {
            setPin(value);
            onConfirm();
          }}
        />
      </div>
      <AiModalFooter align="end">
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Cancel
        </button>
      </AiModalFooter>
    </div>
  );
}

/* ============================ models, insight, task ============================ */

function ModelsModal({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <p className="text-muted">
        Nine models power the advisor. Each one shows its accuracy, data window
        and last update so you know what you are trusting.
      </p>
      <div className="gm-table-wrap">
        <table className="gm-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Task</th>
              <th scope="col">Version</th>
              <th scope="col">Accuracy</th>
              <th scope="col">Data window</th>
              <th scope="col">Updated</th>
              <th scope="col">Latency</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {AI_MODELS.map((model) => (
              <tr key={model.id}>
                <th scope="row">
                  {model.name}
                  <br />
                  <small className="text-muted">{model.owner}</small>
                </th>
                <td>{model.task}</td>
                <td>{model.version}</td>
                <td className="font-display">{model.accuracy}%</td>
                <td>{model.dataWindow}</td>
                <td>{model.updated}</td>
                <td>{model.latency}</td>
                <td>
                  <StatusChip
                    label={model.status}
                    tone={
                      model.status === "Live"
                        ? "low"
                        : model.status === "Beta"
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
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Close
        </button>
        <Link to="/app/dashboard" className="gm-btn gm-btn-lime">
          <Zap width={15} height={15} /> Back to dashboard
        </Link>
      </AiModalFooter>
    </div>
  );
}

function InsightModal({
  insight,
  onAction,
  onClose,
}: {
  insight: AiInsight;
  onAction: (action: ChatAction) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <span className="gm-eyebrow">
            {insight.source} · {insight.at}
          </span>
          <h3 className="gm-h-section mb-0">{insight.title}</h3>
        </div>
        <StatusChip label={insight.crop} tone={insight.tone} />
      </div>
      <p>{insight.detail}</p>
      <AiFactGrid>
        <AiFact label="Crop" value={insight.crop} />
        <AiFact label="Source" value={insight.source} />
        <AiFact label="Raised" value={insight.at} />
        <AiFact label="Priority" value={insight.tone} />
      </AiFactGrid>
      <AiNote
        tone={
          insight.tone === "high"
            ? "danger"
            : insight.tone === "medium"
              ? "warn"
              : "ok"
        }
        title="What the advisor suggests"
      >
        {insight.detail}
      </AiNote>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-outline"
          onClick={onClose}
        >
          Dismiss
        </button>
        <button
          type="button"
          className="gm-btn gm-btn-lime"
          onClick={() => onAction(insight.action)}
        >
          {insight.actionLabel} <ArrowRight width={15} height={15} />
        </button>
      </AiModalFooter>
    </div>
  );
}

function TaskModal({
  task,
  onDone,
  onDelete,
  onClose,
}: {
  task: AdvisorTask;
  onDone: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div>
      <span className="gm-eyebrow">{task.source}</span>
      <h3 className="gm-h-section">{task.title}</h3>
      <p className="text-muted">{task.detail}</p>
      <AiFactGrid>
        <AiFact label="Due" value={task.due} />
        <AiFact label="Plot" value={task.plot} />
        <AiFact label="Cost" value={kes(task.cost)} />
        <AiFact label="Status" value={task.status} />
      </AiFactGrid>
      <AiNote title="From the advisor" tone="ok">
        This task was created from an AI recommendation. It also appears in the
        crop planner so it stays in your season calendar.
      </AiNote>
      <AiModalFooter>
        <button
          type="button"
          className="gm-btn gm-btn-danger-soft"
          onClick={onDelete}
        >
          <Trash2 width={15} height={15} /> Delete
        </button>
        <span className="d-flex gap-2">
          <button
            type="button"
            className="gm-btn gm-btn-soft"
            onClick={onClose}
          >
            Close
          </button>
          <button type="button" className="gm-btn gm-btn-lime" onClick={onDone}>
            <Check width={15} height={15} /> Mark done
          </button>
        </span>
      </AiModalFooter>
      <AiModalFooter align="end">
        <Link to="/app/planner" className="gm-btn gm-btn-outline gm-btn-sm">
          Open the crop planner
        </Link>
      </AiModalFooter>
    </div>
  );
}

/* ============================ FAQ strip ============================ */

function AdvisorFaqs() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="gm-dash-card mt-4">
      <DashboardSectionHeader
        eyebrow="How it works"
        title="Advisor questions"
        subtitle="Credits, accuracy, payments and privacy — the things growers ask most."
      />
      <div className="d-flex flex-column gap-2">
        {ADVISOR_FAQS.map((faq, index) => (
          <div
            key={faq.q}
            className={`gm-faq ${open === index ? "is-open" : ""}`}
          >
            <button
              type="button"
              className="gm-check-row"
              onClick={() => setOpen(open === index ? null : index)}
              aria-expanded={open === index}
            >
              <strong>{faq.q}</strong>
              <span className="font-display">{open === index ? "−" : "+"}</span>
            </button>
            {open === index ? <p className="mt-2 mb-0">{faq.a}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
