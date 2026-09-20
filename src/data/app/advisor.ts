/* ============================================================================
   PAGE 9 DATA — AI Advisor & Predictive Engine. Realistic Kenyan demo data for
   Mary's Farm (Githunguri, Kiambu). Blueprint: growmo.md sections 9.1–9.6.
   Money in KES, phones 07XX/01XX, real counties/crops/varieties, Kiswahili
   microcopy with English primary.
   ========================================================================== */

/* ============================ 9.0 profile ============================ */

export interface AdvisorProfile {
  farm: string;
  owner: string;
  county: string;
  subCounty: string;
  acres: number;
  plots: number;
  crops: string[];
  plan: string;
  creditsLeft: number;
  creditsTotal: number;
  renews: string;
  model: string;
  modelVersion: string;
  accuracy: number;
  seasonsLearned: number;
  asksThisSeason: number;
  language: string;
  updatedAt: string;
  responseTime: string;
  offlineMode: string;
}

export const ADVISOR_PROFILE: AdvisorProfile = {
  farm: "Mary's Farm",
  owner: "Mary Wanjiku",
  county: "Kiambu",
  subCounty: "Githunguri",
  acres: 3.8,
  plots: 7,
  crops: ["Cabbage (Gloria F1)", "Maize (H6213)", "Dry Beans (Rosecoco)"],
  plan: "GrowMO AI Pro",
  creditsLeft: 340,
  creditsTotal: 500,
  renews: "1 Oct 2026",
  model: "GrowMO Agronomist",
  modelVersion: "v4.2 · fine-tuned on 6 Kenyan seasons",
  accuracy: 94,
  seasonsLearned: 6,
  asksThisSeason: 1284,
  language: "English + Kiswahili",
  updatedAt: "Updated today 07:12 EAT",
  responseTime: "~1.8 s average reply",
  offlineMode: "USSD *384*22# works without data",
};

export const ADVISOR_STATS = [
  {
    id: "asks",
    label: "Questions answered",
    value: "1,284",
    note: "This season · 61% in Kiswahili",
  },
  {
    id: "accuracy",
    label: "Answer accuracy",
    value: "94%",
    note: "Rated by 312 growers like you",
  },
  {
    id: "saved",
    label: "Money saved with AI",
    value: "KES 41,300",
    note: "Fewer sprays, right fertilizer rate",
  },
  {
    id: "uptime",
    label: "Advisor availability",
    value: "24/7",
    note: "App, USSD and SMS — even offline",
  },
];

/* ============================ 9.1 chat ============================ */

export type ChatRole = "farmer" | "ai";

/** Every chip/button inside an AI answer maps to a real modal on the page. */
export type ChatAction =
  | "plan"
  | "pay"
  | "scan"
  | "treat"
  | "scout"
  | "irrigate"
  | "market"
  | "compare"
  | "credits"
  | "fertilizer"
  | "sell"
  | "export"
  | "symptoms";

export interface ChatOption {
  name: string;
  supplier: string;
  price: string;
  detail: string;
  fit: string;
  tone: "low" | "medium" | "high" | "neutral";
}

export interface BudgetRow {
  label: string;
  swahili?: string;
  amount: number;
}

export interface PaymentRow {
  name: string;
  phone: string;
  masked: string;
  amount: number;
  work: string;
}

export type ChatBlock =
  | { kind: "options"; title: string; items: ChatOption[] }
  | {
      kind: "budget";
      title: string;
      rows: BudgetRow[];
      total: number;
      caption?: string;
    }
  | { kind: "steps"; title: string; steps: string[] }
  | {
      kind: "payment";
      title: string;
      rows: PaymentRow[];
      total: number;
      actionLabel: string;
    }
  | {
      kind: "table";
      title: string;
      head: string[];
      rows: (string | number)[][];
    }
  | {
      kind: "chips";
      title: string;
      chips: { label: string; action: ChatAction }[];
    };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  at: string;
  text: string;
  blocks?: ChatBlock[];
  sources?: string[];
  confidence?: number;
  lang?: "EN" | "SW";
}

export interface ChatSession {
  id: string;
  title: string;
  lang: "EN" | "SW";
  crop: string;
  started: string;
  turns: number;
  summary: string;
  pinned: boolean;
  outcome: string;
}

/* ---- scripted conversations straight from the blueprint ---- */

export const CONV_MAIZE_BUDGET: ChatMessage[] = [
  {
    id: "cm-1",
    role: "farmer",
    at: "07:04",
    lang: "SW",
    text: "Nataka kupanda mahindi ekari moja hapa Uasin Gishu. Nina bajeti ya KES 40,000. Ni aina gani ya mbegu nzuri?",
  },
  {
    id: "cm-2",
    role: "ai",
    at: "07:04",
    lang: "SW",
    confidence: 96,
    text: "Habari! Kwa Uasin Gishu (Upper Highland, altitude ~2,100 m), ninapendekeza:",
    blocks: [
      {
        kind: "options",
        title: "Mbegu zinazofaa · Uasin Gishu, Upper Highland",
        items: [
          {
            name: "H6213",
            supplier: "Kenya Seed",
            price: "KES 3,500 / begi 10 kg",
            detail: "Yield 25–35 begi/ekari · mavuno mwezi 4",
            fit: "Drought tolerant, good for your zone",
            tone: "low",
          },
          {
            name: "SC Duma 43",
            supplier: "Seed Co",
            price: "KES 800 / begi 2 kg",
            detail: "Yield 20–28 begi/ekari · mavuno mwezi 3 (haraka)",
            fit: "Very drought tolerant",
            tone: "medium",
          },
        ],
      },
      {
        kind: "budget",
        title: "Kwa bajeti yako ya KES 40,000 — H6213 inafaa zaidi",
        rows: [
          { label: "Mbegu (H6213 10 kg)", swahili: "Mbegu", amount: 3500 },
          { label: "DAP 50 kg", amount: 7000 },
          { label: "CAN 50 kg", amount: 5500 },
          { label: "Herbicide (Catapult 2 L)", amount: 2500 },
          { label: "Labour · 6 workers", swahili: "Kazi", amount: 18000 },
          { label: "Contingency", swahili: "Akiba", amount: 3500 },
        ],
        total: 40000,
        caption:
          "Mapato yanayotarajiwa: 25 begi × KES 3,500 = KES 87,500 · Faida KES 47,500",
      },
      {
        kind: "chips",
        title: "Unataka nikupe mpango kamili wa msimu?",
        chips: [
          { label: "Ndiyo — tengeneza mpango", action: "plan" },
          { label: "Onyesha bei ya mahindi", action: "market" },
          { label: "Linganisha na wakulima wengine", action: "compare" },
        ],
      },
    ],
    sources: [
      "Kenya Seed catalogue 2026",
      "KALRO Uasin Gishu trial plots",
      "GrowMO price panel · Eldoret",
    ],
  },
];

export const CONV_LABOUR_PAY: ChatMessage[] = [
  {
    id: "cl-1",
    role: "farmer",
    at: "13:20",
    lang: "SW",
    text: "Wachungaji wangu wa mboga wanahitaji kulipwa jumla ya KES 3,000 leo. Watatu. Nambari zao ni 0712345678, 0723456789, 0734567890. Lipa sasa.",
  },
  {
    id: "cl-2",
    role: "ai",
    at: "13:20",
    lang: "SW",
    confidence: 99,
    text: "Sawa, nitalipa KES 1,000 kwa kila mfanyakazi:",
    blocks: [
      {
        kind: "payment",
        title: "Lipa kwa M-Pesa · jumla KES 3,000",
        rows: [
          {
            name: "Jane Nyambura",
            phone: "0712345678",
            masked: "0712***5678",
            amount: 1000,
            work: "Weeding · Plot 1",
          },
          {
            name: "Peter Kamau",
            phone: "0723456789",
            masked: "0723***6789",
            amount: 1000,
            work: "Spraying · Plot 1",
          },
          {
            name: "Grace Achieng",
            phone: "0734567890",
            masked: "0734***7890",
            amount: 1000,
            work: "Harvest · Plot 3",
          },
        ],
        total: 3000,
        actionLabel: "Confirm payment",
      },
      {
        kind: "chips",
        title: "Baada ya kulipa",
        chips: [
          { label: "Weka kazi zao kwenye ratiba", action: "scout" },
          { label: "Angalia bajeti ya kazi", action: "compare" },
        ],
      },
    ],
    sources: ["GrowMO payroll ledger", "Safaricom M-Pesa B2C"],
  },
];

export const CONV_BLACKROT: ChatMessage[] = [
  {
    id: "cb-1",
    role: "farmer",
    at: "06:48",
    lang: "SW",
    text: "Nina cabbage zangu zimeanza kuonyesha makala ya manjano. Ni nini hiyo?",
  },
  {
    id: "cb-2",
    role: "ai",
    at: "06:48",
    lang: "SW",
    confidence: 91,
    text: "Kutokana na maelezo yako, huenda ni Black Rot (Xanthomonas campestris), ambayo ni ugonjwa wa kawaida sana kwa cabbage wakati wa mvua nyingi.",
    blocks: [
      {
        kind: "steps",
        title: "Dalili",
        steps: [
          "Vipele vya umbo la 'V' vurugu, vya manjano kutoka mwisho wa jani",
          "Kisha vya kahawia/kijivu, mishipa ya jani inakuwa nyeusi",
          "Majani ya ndani huanza kuoza — harufu kali wakati wa mvua",
        ],
      },
      {
        kind: "steps",
        title: "Kitendo cha haraka",
        steps: [
          "Ondoa mmea wowote ulioathirika vibaya na uumie (usiutume komposti)",
          "Rukia Mancozeb 80WP kwa kiwango cha 50 g kwa lita 20 za maji",
          "Rukia asubuhi au jioni, sio wakati wa jua kali",
          "Usirukie ikiwa mvua inatarajiwa ndani ya saa 6",
          "Tenga siku 14 kati ya kurukia na mavuno (PHI = 14 days)",
        ],
      },
      {
        kind: "steps",
        title: "Kuzuia mbeleni",
        steps: [
          "Hakikisha spacing ya 45 cm × 45 cm kwa hewa nzuri",
          "Epuka kunyunyuzia maji juu ya majani — tumia drip irrigation",
          "Panda varieti zilizo na ustahimilivu kama Gloria F1",
        ],
      },
      {
        kind: "chips",
        title: "Unaweza piga picha na kutuma kwa uchambuzi zaidi?",
        chips: [
          { label: "Tuma picha ya jani", action: "scan" },
          { label: "Panga kurukia leo", action: "treat" },
          { label: "Weka kazi ya kuangalia", action: "scout" },
        ],
      },
    ],
    sources: [
      "CABI Invasive Species Compendium",
      "KALRO crop protection guide 2026",
      "GrowMO Kiambu disease panel · 1,940 reports",
    ],
  },
];

export const CHAT_SESSIONS: ChatSession[] = [
  {
    id: "cs-01",
    title: "Mbegu za mahindi · Uasin Gishu",
    lang: "SW",
    crop: "Maize",
    started: "Today 07:04",
    turns: 6,
    summary:
      "H6213 selected for 1 acre on a KES 40,000 budget; plan generated.",
    pinned: true,
    outcome: "Plan saved",
  },
  {
    id: "cs-02",
    title: "Makala ya manjano · cabbage",
    lang: "SW",
    crop: "Cabbage",
    started: "Today 06:48",
    turns: 4,
    summary: "Black rot diagnosed from symptom description; spray scheduled.",
    pinned: true,
    outcome: "Spray scheduled",
  },
  {
    id: "cs-03",
    title: "Malipo ya wachungaji watatu",
    lang: "SW",
    crop: "Cabbage",
    started: "Yesterday 13:20",
    turns: 3,
    summary: "KES 3,000 split across three casuals and paid by M-Pesa.",
    pinned: false,
    outcome: "Paid",
  },
  {
    id: "cs-04",
    title: "Fertilizer program for cabbage",
    lang: "EN",
    crop: "Cabbage",
    started: "18 Sep 09:15",
    turns: 5,
    summary: "Optimal DAP + 2× CAN + K foliar chosen over Premium.",
    pinned: false,
    outcome: "Program applied",
  },
  {
    id: "cs-05",
    title: "Sell maize now or hold?",
    lang: "EN",
    crop: "Maize",
    started: "17 Sep 16:40",
    turns: 4,
    summary: "Hold 3 weeks — Rift harvest glut expected to ease by mid-Oct.",
    pinned: false,
    outcome: "Hold decision",
  },
  {
    id: "cs-06",
    title: "Fall armyworm scouting plan",
    lang: "EN",
    crop: "Maize",
    started: "16 Sep 08:05",
    turns: 7,
    summary:
      "Pheromone traps at 4 per acre; scouting twice weekly from week 3.",
    pinned: false,
    outcome: "3 tasks added",
  },
  {
    id: "cs-07",
    title: "Bei ya sukuma wiki Marikiti",
    lang: "SW",
    crop: "Kale",
    started: "15 Sep 11:30",
    turns: 3,
    summary: "Price stable at KES 8/kg; December dip flagged for planning.",
    pinned: false,
    outcome: "Alert set",
  },
  {
    id: "cs-08",
    title: "Irrigation for beans this week",
    lang: "EN",
    crop: "Dry Beans",
    started: "14 Sep 07:52",
    turns: 5,
    summary: "No irrigation needed — 12 mm expected Thursday and Friday.",
    pinned: false,
    outcome: "Skipped irrigation",
  },
  {
    id: "cs-09",
    title: "Soil test interpretation · pH 5.8",
    lang: "EN",
    crop: "Cabbage",
    started: "12 Sep 15:10",
    turns: 6,
    summary: "Lime 400 kg/acre recommended before the March planting.",
    pinned: false,
    outcome: "Task added",
  },
  {
    id: "cs-10",
    title: "Cooperative bulk buy · DAP",
    lang: "EN",
    crop: "Mixed",
    started: "10 Sep 10:00",
    turns: 4,
    summary: "Bulk 20 bags with Githunguri group saves KES 450 per bag.",
    pinned: false,
    outcome: "Order drafted",
  },
];

export interface QuickPrompt {
  id: string;
  label: string;
  lang: "EN" | "SW";
  prompt: string;
  section: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "seed",
    label: "Best maize seed",
    lang: "SW",
    prompt:
      "Ni mbegu gani ya mahindi inafaa Uasin Gishu kwa bajeti ya KES 40,000?",
    section: "9.1",
  },
  {
    id: "blackrot",
    label: "Yellow V lesions",
    lang: "SW",
    prompt:
      "Cabbage zangu zina makala ya manjano ya umbo la V. Ni ugonjwa gani?",
    section: "9.3",
  },
  {
    id: "spray",
    label: "Spray cost 0.5 acre",
    lang: "EN",
    prompt: "What will it cost to spray my 0.5 acre cabbage this week?",
    section: "9.6",
  },
  {
    id: "fert",
    label: "Fertilizer program",
    lang: "EN",
    prompt: "What is the best fertilizer program for my cabbage?",
    section: "9.6",
  },
  {
    id: "sell",
    label: "Sell or hold maize",
    lang: "EN",
    prompt: "Should I sell my maize now in Eldoret or hold for three weeks?",
    section: "9.4",
  },
  {
    id: "pay",
    label: "Pay 3 casuals",
    lang: "SW",
    prompt: "Lipa wachungaji watatu KES 1,000 kila mmoja leo.",
    section: "9.1",
  },
  {
    id: "harvest",
    label: "When to harvest",
    lang: "EN",
    prompt: "When should I harvest my cabbage and at what head weight?",
    section: "9.2",
  },
  {
    id: "compare",
    label: "Compare my yields",
    lang: "EN",
    prompt: "How do I compare with other cabbage farmers in Kiambu?",
    section: "9.5",
  },
  {
    id: "faw",
    label: "Fall armyworm",
    lang: "EN",
    prompt: "I found fall armyworm damage in my maize. What should I do today?",
    section: "9.3",
  },
  {
    id: "irrigate",
    label: "Do I irrigate?",
    lang: "EN",
    prompt: "Do I need to irrigate my beans this week?",
    section: "9.3",
  },
  {
    id: "plan",
    label: "Generate season plan",
    lang: "EN",
    prompt: "Generate a full season plan for 2 acres of maize in Uasin Gishu.",
    section: "9.2",
  },
  {
    id: "credits",
    label: "My AI credits",
    lang: "EN",
    prompt: "How many AI credits do I have left this month?",
    section: "9.1",
  },
];

/* ---- canned, data-driven AI answers for the quick prompts ---- */

export interface AiReply {
  text: string;
  blocks: ChatBlock[];
  sources: string[];
  confidence: number;
  lang?: "EN" | "SW";
}

export const AI_REPLIES: Record<string, AiReply> = {
  seed: {
    lang: "SW",
    confidence: 96,
    text: "Kwa Uasin Gishu (Upper Highland, ~2,100 m) na bajeti ya KES 40,000, hizi ndizo chaguo bora:",
    blocks: [
      {
        kind: "options",
        title: "Mbegu · 1 ekari ya mahindi",
        items: [
          {
            name: "H6213",
            supplier: "Kenya Seed",
            price: "KES 3,500 / begi 10 kg",
            detail: "25–35 begi/ekari · mavuno mwezi 4",
            fit: "Drought tolerant, good for your zone",
            tone: "low",
          },
          {
            name: "SC Duma 43",
            supplier: "Seed Co",
            price: "KES 800 / begi 2 kg",
            detail: "20–28 begi/ekari · mavuno mwezi 3",
            fit: "Very drought tolerant",
            tone: "medium",
          },
        ],
      },
      {
        kind: "budget",
        title: "Mgawanyo wa bajeti · KES 40,000",
        rows: [
          { label: "Mbegu (H6213 10 kg)", amount: 3500 },
          { label: "DAP 50 kg", amount: 7000 },
          { label: "CAN 50 kg", amount: 5500 },
          { label: "Herbicide", amount: 2500 },
          { label: "Labour", amount: 18000 },
          { label: "Contingency", amount: 3500 },
        ],
        total: 40000,
        caption: "Faida inayotarajiwa: KES 47,500 (ROI 119%)",
      },
      {
        kind: "chips",
        title: "Hatua inayofuata",
        chips: [
          { label: "Tengeneza mpango kamili", action: "plan" },
          { label: "Bei ya mahindi sasa", action: "market" },
        ],
      },
    ],
    sources: ["Kenya Seed 2026", "KALRO Uasin Gishu trials"],
  },
  blackrot: {
    lang: "SW",
    confidence: 91,
    text: "Dalili za 'V' za manjano kutoka mwisho wa jani ni Black Rot (Xanthomonas campestris) — kawaida wakati humidity iko juu ya 80%.",
    blocks: [
      {
        kind: "steps",
        title: "Kitendo cha haraka (leo)",
        steps: [
          "Ondoa majani yaliyoathirika vibaya — usitume komposti",
          "Rukia Mancozeb 80WP: 50 g kwa lita 20 za maji",
          "Rukia asubuhi mapema au jioni — kuepuka jua kali",
          "Usirukie ikiwa mvua inatarajiwa ndani ya saa 6",
          "PHI = siku 14 kabla ya mavuno",
        ],
      },
      {
        kind: "table",
        title: "Gharama ya dawa · 0.5 ekari",
        head: ["Bidhaa", "Kiwango", "Bei"],
        rows: [
          ["Mancozeb 80WP", "250 g", "KES 620"],
          ["Kazi (mfanyakazi 1)", "saa 2", "KES 400"],
          ["Maji + sabuni ya kunata", "20 L", "KES 150"],
        ],
      },
      {
        kind: "chips",
        title: "Chagua hatua",
        chips: [
          { label: "Panga kurukia", action: "treat" },
          { label: "Tuma picha", action: "scan" },
          { label: "Weka kazi ya kuangalia", action: "scout" },
        ],
      },
    ],
    sources: ["CABI ISC", "GrowMO Kiambu disease panel"],
  },
  spray: {
    confidence: 93,
    text: "For 0.5 acre of Gloria F1 cabbage at day 24, here is this week's spray budget:",
    blocks: [
      {
        kind: "budget",
        title: "Spray round · Plot 1 (0.5 acre)",
        rows: [
          { label: "Mancozeb 80WP · 250 g", amount: 620 },
          { label: "Emamectin benzoate · 20 ml", amount: 380 },
          { label: "Sticker / spreader · 20 ml", amount: 150 },
          { label: "Labour · 1 worker × 2 hrs", amount: 400 },
          { label: "Knapsack fuel + water", amount: 120 },
        ],
        total: 1670,
        caption:
          "Best window: tomorrow 06:00–09:00 — wind 8 km/h, no rain for 12 hrs.",
      },
      {
        kind: "chips",
        title: "Next step",
        chips: [
          { label: "Open spray wizard", action: "treat" },
          { label: "Check risk forecast", action: "scout" },
        ],
      },
    ],
    sources: ["GrowMO input price panel · Kiambu", "KMD spray-window model"],
  },
  fert: {
    confidence: 95,
    text: "Comparing four fertilizer programs for your cabbage on humic nitisol at pH 5.8:",
    blocks: [
      {
        kind: "table",
        title: "Fertilizer programs · cost vs yield",
        head: ["Approach", "Cost/acre", "Yield impact", "Verdict"],
        rows: [
          ["Basic · DAP only", "KES 6,500", "12,000 heads", "Suboptimal"],
          [
            "Standard · DAP + 1× CAN",
            "KES 11,500",
            "14,400 heads (+20%)",
            "OK",
          ],
          [
            "Optimal · DAP + 2× CAN + K foliar",
            "KES 16,900",
            "16,800 heads (+40%)",
            "Recommended",
          ],
          [
            "Premium · + micronutrients",
            "KES 18,900",
            "17,400 heads (+45%)",
            "Marginal return low",
          ],
        ],
      },
      {
        kind: "steps",
        title: "AI pick · go with Optimal",
        steps: [
          "The extra KES 2,000 for micronutrients adds only 600 heads (≈ KES 18,000 revenue) — not worth it in your first season.",
          "Apply DAP 50 kg at planting in the furrow, never touching the seed.",
          "First CAN 50 kg at week 4, second 25 kg at week 6 with the K foliar.",
          "Re-test soil in March — pH 5.8 needs 400 kg/acre of lime.",
        ],
      },
      {
        kind: "chips",
        title: "Do it",
        chips: [
          { label: "Open fertilizer calculator", action: "fertilizer" },
          { label: "Order the inputs", action: "plan" },
        ],
      },
    ],
    sources: ["Soil test 12 Sep 2026", "KALRO cabbage nutrition guide"],
  },
  sell: {
    confidence: 88,
    text: "Eldoret maize is KES 3,500 per 90 kg bag today. Rift harvest peaks in the next three weeks, so supply will push prices down before they recover.",
    blocks: [
      {
        kind: "table",
        title: "Sell now vs hold · 56 bags",
        head: ["Scenario", "Price/bag", "Revenue", "Storage cost", "Net"],
        rows: [
          ["Sell now (20 Sep)", "KES 3,500", "KES 196,000", "—", "KES 196,000"],
          [
            "Hold 3 weeks",
            "KES 3,250",
            "KES 182,000",
            "KES 2,800",
            "KES 179,200",
          ],
          [
            "Hold 8 weeks",
            "KES 3,650",
            "KES 204,400",
            "KES 7,400",
            "KES 197,000",
          ],
        ],
      },
      {
        kind: "steps",
        title: "Recommendation",
        steps: [
          "Hold — but only if your grain store is weevil-proof and moisture is under 13.5%.",
          "Sell 20 bags now to cover the KES 42,000 school-fees payment on 5 Oct.",
          "Set a price alert at KES 3,600 so you get an SMS the moment Eldoret moves.",
        ],
      },
      {
        kind: "chips",
        title: "Act",
        chips: [
          { label: "Set a price alert", action: "market" },
          { label: "Open sell decision", action: "sell" },
        ],
      },
    ],
    sources: ["GrowMO price panel · Eldoret", "AFA cereal bulletin week 37"],
  },
  pay: {
    lang: "SW",
    confidence: 99,
    text: "Sawa — nitalipa KES 1,000 kwa kila mfanyakazi. Jumla KES 3,000 kutoka kwa pochi yako (saldo KES 12,400).",
    blocks: [
      {
        kind: "payment",
        title: "Lipa kwa M-Pesa · jumla KES 3,000",
        rows: [
          {
            name: "Jane Nyambura",
            phone: "0712345678",
            masked: "0712***5678",
            amount: 1000,
            work: "Weeding · Plot 1",
          },
          {
            name: "Peter Kamau",
            phone: "0723456789",
            masked: "0723***6789",
            amount: 1000,
            work: "Spraying · Plot 1",
          },
          {
            name: "Grace Achieng",
            phone: "0734567890",
            masked: "0734***7890",
            amount: 1000,
            work: "Harvest · Plot 3",
          },
        ],
        total: 3000,
        actionLabel: "Confirm payment",
      },
    ],
    sources: ["GrowMO payroll ledger"],
  },
  harvest: {
    confidence: 94,
    text: "Your Gloria F1 cabbage is at day 24 of 90. Heads should be ready from 14 Jan 2027.",
    blocks: [
      {
        kind: "steps",
        title: "Harvest readiness checklist",
        steps: [
          "Head diameter 18–22 cm and firm when squeezed — not spongy",
          "Target head weight 1.6–2.0 kg for the Marikiti wholesale grade",
          "Harvest in the morning before 10:00 so leaves stay crisp",
          "Cut with a clean knife, leave 2 wrapper leaves on for transport",
          "Move to shade within 30 minutes — field heat costs you 8% weight",
        ],
      },
      {
        kind: "table",
        title: "Projected harvest · 0.5 acre",
        head: ["Week", "Heads ready", "Avg weight", "Value"],
        rows: [
          ["14 Jan", "1,800", "1.7 kg", "KES 54,000"],
          ["21 Jan", "1,700", "1.8 kg", "KES 51,000"],
          ["28 Jan", "700", "1.6 kg", "KES 21,000"],
        ],
      },
      {
        kind: "chips",
        title: "Plan it",
        chips: [
          { label: "Draft the harvest plan", action: "plan" },
          { label: "Check harvest prices", action: "market" },
        ],
      },
    ],
    sources: ["GrowMO crop model · Plot 1", "Marikiti price panel"],
  },
  compare: {
    confidence: 97,
    text: "Against 214 cabbage farms in Kiambu on 0.3–1.0 acres, you are above average on 6 of 7 metrics.",
    blocks: [
      {
        kind: "table",
        title: "Your farm vs Kiambu cabbage growers",
        head: ["Metric", "You", "County avg", "Top 10%"],
        rows: [
          ["Yield per acre", "16,000 heads", "12,000", "20,000"],
          ["Cost per head", "KES 5.98", "KES 8.50", "KES 4.50"],
          ["Labour efficiency", "85 heads/worker/day", "60", "120"],
          ["Post-harvest loss", "8%", "20%", "3%"],
          ["Price achieved", "KES 30/head", "KES 25", "KES 35"],
        ],
      },
      {
        kind: "steps",
        title: "AI summary",
        steps: [
          "Your biggest opportunity is yield: move to 40 cm × 40 cm spacing with the Optimal fertilizer program.",
          "Selling direct to restaurants instead of brokers could lift your price by about 20%.",
        ],
      },
      {
        kind: "chips",
        title: "Dig deeper",
        chips: [
          { label: "Open benchmarking", action: "compare" },
          { label: "Change peer group", action: "compare" },
        ],
      },
    ],
    sources: [
      "GrowMO benchmark panel · 214 farms",
      "Kiambu Co-op returns 2026",
    ],
  },
  faw: {
    confidence: 92,
    text: "Fall armyworm damage at the whorl stage is manageable if you act within 48 hours. Your maize is at knee height, which is the most vulnerable stage.",
    blocks: [
      {
        kind: "steps",
        title: "Today",
        steps: [
          "Scout 10 random plants per acre — count whorls with fresh frass",
          "If 1 in 10 plants shows damage, spray now (economic threshold)",
          "Use Emamectin benzoate 5% SG at 20 ml per 20 L knapsack",
          "Direct the nozzle into the whorl, early morning or after 16:00",
          "Install 4 pheromone traps per acre to monitor moth flights",
        ],
      },
      {
        kind: "table",
        title: "Control options · 1.2 acre maize",
        head: ["Option", "Product", "Cost", "PHI"],
        rows: [
          ["Chemical", "Emamectin benzoate 5% SG", "KES 1,150", "7 days"],
          ["Bio", "Bt (Dipel DF)", "KES 1,480", "0 days"],
          ["Cultural", "Pheromone traps × 5", "KES 900", "—"],
        ],
      },
      {
        kind: "chips",
        title: "Act",
        chips: [
          { label: "Open spray wizard", action: "treat" },
          { label: "Schedule scouting", action: "scout" },
        ],
      },
    ],
    sources: ["icipe FAW surveillance", "KALRO maize IPM guide 2026"],
  },
  irrigate: {
    confidence: 90,
    text: "No — your beans do not need irrigation this week. 12 mm of rain is expected Thursday and Friday, and soil moisture is at 62% of field capacity.",
    blocks: [
      {
        kind: "table",
        title: "Water balance · Plot 4 (0.4 acre beans)",
        head: ["Day", "Rain", "ET₀", "Soil moisture", "Irrigate?"],
        rows: [
          ["Mon", "0 mm", "3.4 mm", "66%", "No"],
          ["Tue", "0 mm", "3.6 mm", "63%", "No"],
          ["Wed", "1 mm", "3.2 mm", "62%", "No"],
          ["Thu", "7 mm", "2.8 mm", "78%", "No"],
          ["Fri", "5 mm", "2.9 mm", "81%", "No"],
        ],
      },
      {
        kind: "steps",
        title: "Watch-outs",
        steps: [
          "Open drainage furrows on the low corner before Thursday — 7 mm in one hour causes waterlogging.",
          "If the rain misses, irrigate 6 mm (≈ 9.7 m³) at flowering, not before.",
        ],
      },
      {
        kind: "chips",
        title: "Set it up",
        chips: [{ label: "Open irrigation wizard", action: "irrigate" }],
      },
    ],
    sources: ["KMD Githunguri AWS 034", "NASA POWER soil moisture"],
  },
  plan: {
    confidence: 98,
    text: "I can build a full season plan for 2 acres of maize in Uasin Gishu with a KES 80,000 budget. Confirm the inputs and I will generate 16 scheduled activities with costs and labour.",
    blocks: [
      {
        kind: "table",
        title: "Inputs I will use",
        head: ["Field", "Value"],
        rows: [
          ["Crop", "Maize (H6213)"],
          ["Acreage", "2 acres"],
          ["County", "Uasin Gishu"],
          ["Planting month", "March"],
          ["Budget", "KES 80,000"],
          ["Soil type", "Loam"],
          ["Water source", "Rain-fed"],
          ["Goal", "Maximum profit"],
        ],
      },
      {
        kind: "chips",
        title: "Ready?",
        chips: [
          { label: "Open the plan generator", action: "plan" },
          { label: "Change the budget", action: "plan" },
        ],
      },
    ],
    sources: ["KALRO maize calendar", "GrowMO cost model v4"],
  },
  credits: {
    confidence: 100,
    text: "You have 340 of 500 AI credits left this month. They renew on 1 Oct 2026.",
    blocks: [
      {
        kind: "table",
        title: "Credit use this month",
        head: ["Action", "Credits", "Used"],
        rows: [
          ["Chat question", "1", "96"],
          ["Photo diagnosis", "5", "35"],
          ["Season plan generation", "10", "20"],
          ["Market forecast refresh", "2", "9"],
        ],
      },
      {
        kind: "chips",
        title: "Manage",
        chips: [
          { label: "Buy more credits", action: "credits" },
          { label: "See model library", action: "compare" },
        ],
      },
    ],
    sources: ["GrowMO billing"],
  },
};

export const CHAT_FALLBACK: AiReply = {
  confidence: 86,
  text: "Nimepokea swali lako. I will answer from your farm records, the weather feed and the market panel. To give you a precise number, pick one of these — or add the crop and acreage in your next message.",
  blocks: [
    {
      kind: "chips",
      title: "Ninaweza kusaidia na",
      chips: [
        { label: "Full season plan", action: "plan" },
        { label: "Diagnose a symptom", action: "symptoms" },
        { label: "Spray or fertilizer cost", action: "fertilizer" },
        { label: "Sell now or hold", action: "sell" },
        { label: "Pay my workers", action: "pay" },
        { label: "Compare my yields", action: "compare" },
      ],
    },
  ],
  sources: ["GrowMO Agronomist v4.2"],
};

/* ---- proactive insight feed ---- */

export interface AiInsight {
  id: string;
  title: string;
  detail: string;
  tone: "low" | "medium" | "high" | "neutral";
  source: string;
  at: string;
  action: ChatAction;
  actionLabel: string;
  crop: string;
}

export const AI_INSIGHTS: AiInsight[] = [
  {
    id: "in-01",
    title: "Black rot window opens Thursday",
    detail:
      "Humidity above 82% for 11 hours with 9 mm of rain. Spray Mancozeb before Wednesday evening.",
    tone: "high",
    source: "Disease risk model · Plot 1",
    at: "Today 06:30",
    action: "treat",
    actionLabel: "Schedule spray",
    crop: "Cabbage",
  },
  {
    id: "in-02",
    title: "Maize price will dip in 3 weeks",
    detail:
      "Rift harvest peaks mid-October. Hold your 56 bags and sell after 8 weeks for about KES 1,000 more.",
    tone: "medium",
    source: "Price forecast model",
    at: "Today 05:10",
    action: "sell",
    actionLabel: "Open sell plan",
    crop: "Maize",
  },
  {
    id: "in-03",
    title: "Your cost per head beats the county",
    detail:
      "KES 5.98 per head against a Kiambu average of KES 8.50 — 30% better than average.",
    tone: "low",
    source: "Benchmark engine · 214 farms",
    at: "Yesterday 18:20",
    action: "compare",
    actionLabel: "See benchmarks",
    crop: "Cabbage",
  },
  {
    id: "in-04",
    title: "Fall armyworm moths detected nearby",
    detail:
      "Two traps in Githunguri caught 14 moths this week. Scout your maize within 48 hours.",
    tone: "high",
    source: "icipe surveillance feed",
    at: "Yesterday 16:02",
    action: "scout",
    actionLabel: "Schedule scouting",
    crop: "Maize",
  },
  {
    id: "in-05",
    title: "Skip irrigation this week",
    detail:
      "12 mm of rain expected Thursday and Friday. Skipping saves about KES 2,400 in pumping.",
    tone: "low",
    source: "Water balance model",
    at: "Yesterday 07:00",
    action: "irrigate",
    actionLabel: "Open water plan",
    crop: "Dry Beans",
  },
  {
    id: "in-06",
    title: "Tomato prices rising into December",
    detail:
      "Dry season cuts supply: KES 3,200 per crate now, KES 4,000–5,000 in three months.",
    tone: "low",
    source: "Market forecast model",
    at: "18 Sep",
    action: "market",
    actionLabel: "Open forecasts",
    crop: "Tomato",
  },
  {
    id: "in-07",
    title: "Soil pH 5.8 is holding your yields back",
    detail:
      "400 kg of lime per acre before March planting would unlock roughly 12% more nitrogen uptake.",
    tone: "medium",
    source: "Soil test 12 Sep 2026",
    at: "17 Sep",
    action: "fertilizer",
    actionLabel: "Open fertilizer plan",
    crop: "Cabbage",
  },
  {
    id: "in-08",
    title: "Direct-to-restaurant deal available",
    detail:
      "Villa Rosa Kitchen wants 200 heads weekly at KES 36 — about 20% above broker prices.",
    tone: "low",
    source: "GrowMO buyer panel",
    at: "16 Sep",
    action: "sell",
    actionLabel: "Review offer",
    crop: "Cabbage",
  },
  {
    id: "in-09",
    title: "Bulk DAP buy with your cooperative",
    detail:
      "20 bags across the Githunguri group saves KES 450 per bag — KES 9,000 total.",
    tone: "medium",
    source: "Cooperative buying desk",
    at: "15 Sep",
    action: "plan",
    actionLabel: "Join the order",
    crop: "Mixed",
  },
  {
    id: "in-10",
    title: "Labour cost creeping up",
    detail:
      "Weeding now KES 500 per worker-day, up from KES 400 in July. Three weedings cost KES 4,500.",
    tone: "medium",
    source: "Payroll ledger",
    at: "14 Sep",
    action: "compare",
    actionLabel: "Review efficiency",
    crop: "Mixed",
  },
];

/* ============================ 9.2 crop plan generator ============================ */

export interface PlanInputs {
  id: string;
  label: string;
  options: string[];
  defaultIndex: number;
  hint: string;
}

/** The blueprint input form, as options for the generator wizard. */
export const PLAN_INPUTS: PlanInputs[] = [
  {
    id: "crop",
    label: "Crop",
    options: [
      "Maize",
      "Cabbage",
      "Tomato",
      "Potato",
      "Dry Beans",
      "Kale",
      "Onion",
      "Sugarcane",
      "Avocado",
      "Banana",
    ],
    defaultIndex: 0,
    hint: "Drives the calendar, inputs and risk model.",
  },
  {
    id: "acres",
    label: "Acreage",
    options: [
      "0.5 acres",
      "1 acre",
      "2 acres",
      "3 acres",
      "5 acres",
      "10 acres",
    ],
    defaultIndex: 2,
    hint: "Scales every quantity, cost and labour line.",
  },
  {
    id: "county",
    label: "County",
    options: [
      "Uasin Gishu",
      "Kiambu",
      "Nakuru",
      "Nyandarua",
      "Kakamega",
      "Machakos",
      "Kirinyaga",
      "Meru",
      "Kisumu",
      "Trans Nzoia",
    ],
    defaultIndex: 0,
    hint: "Sets altitude, rains and the local price market.",
  },
  {
    id: "month",
    label: "Planting month",
    options: ["March", "April", "May", "October", "November", "December"],
    defaultIndex: 0,
    hint: "Long rains (Mar–May) or short rains (Oct–Dec).",
  },
  {
    id: "budget",
    label: "Budget",
    options: [
      "KES 40,000",
      "KES 60,000",
      "KES 80,000",
      "KES 120,000",
      "KES 200,000",
      "KES 350,000",
    ],
    defaultIndex: 2,
    hint: "The plan is trimmed to fit — contingency included.",
  },
  {
    id: "soil",
    label: "Soil type",
    options: [
      "Loam",
      "Sandy loam",
      "Clay loam",
      "Humic nitisol",
      "Red volcanic",
      "Black cotton",
    ],
    defaultIndex: 0,
    hint: "Changes the fertilizer rate and drainage tasks.",
  },
  {
    id: "water",
    label: "Water source",
    options: [
      "Rain-fed",
      "Rain-fed + drip backup",
      "Drip irrigation",
      "Furrow irrigation",
      "Borehole",
      "River abstraction",
    ],
    defaultIndex: 0,
    hint: "Rain-fed plans get drought contingency tasks.",
  },
  {
    id: "goal",
    label: "Goal",
    options: [
      "Maximum profit",
      "Lowest risk",
      "Fastest cash",
      "Organic premium",
      "Highest yield",
    ],
    defaultIndex: 0,
    hint: "Re-weights the input program and the harvest date.",
  },
];

/** Defaults straight from the blueprint table. */
export const PLAN_DEFAULTS = {
  crop: "Maize",
  variety: "H6213",
  acres: 2,
  county: "Uasin Gishu",
  month: "March",
  budget: 80000,
  soil: "Loam",
  water: "Rain-fed",
  goal: "Maximum profit",
};

export interface SeasonPlanRow {
  id: string;
  week: string;
  date: string;
  activity: string;
  swahili: string;
  input: string;
  qty: string;
  cost: number;
  labour: string;
  labourCost: number;
  stage: string;
}

/** The 17-row blueprint plan for 2 acres of maize, Uasin Gishu, March. */
export const SEASON_PLAN_ROWS: SeasonPlanRow[] = [
  {
    id: "sp-01",
    week: "-2",
    date: "Mar 1–7",
    activity: "Land preparation (plough)",
    swahili: "Kulima ardhi",
    input: "—",
    qty: "—",
    cost: 6000,
    labour: "Tractor",
    labourCost: 6000,
    stage: "Land prep",
  },
  {
    id: "sp-02",
    week: "-1",
    date: "Mar 8–14",
    activity: "Harrowing, make furrows",
    swahili: "Kupapasa na kutengeneza mifereji",
    input: "—",
    qty: "—",
    cost: 3000,
    labour: "Tractor",
    labourCost: 3000,
    stage: "Land prep",
  },
  {
    id: "sp-03",
    week: "0",
    date: "Mar 20",
    activity: "Planting",
    swahili: "Kupanda",
    input: "H6213 seed",
    qty: "20 kg",
    cost: 7000,
    labour: "4 workers",
    labourCost: 2000,
    stage: "Planting",
  },
  {
    id: "sp-04",
    week: "0",
    date: "Mar 20",
    activity: "Apply DAP",
    swahili: "Kuweka DAP",
    input: "DAP 50 kg",
    qty: "2 bags",
    cost: 14000,
    labour: "2 workers",
    labourCost: 1000,
    stage: "Planting",
  },
  {
    id: "sp-05",
    week: "0",
    date: "Mar 20",
    activity: "Apply herbicide (pre-emerge)",
    swahili: "Dawa ya magugu",
    input: "Catapult",
    qty: "2 L",
    cost: 4000,
    labour: "1 worker",
    labourCost: 500,
    stage: "Planting",
  },
  {
    id: "sp-06",
    week: "3",
    date: "Apr 10",
    activity: "First weeding",
    swahili: "Kupalilia mara ya kwanza",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "6 workers",
    labourCost: 3000,
    stage: "Vegetative",
  },
  {
    id: "sp-07",
    week: "5",
    date: "Apr 24",
    activity: "Top dress CAN",
    swahili: "Kuweka CAN",
    input: "CAN 50 kg",
    qty: "2 bags",
    cost: 10000,
    labour: "2 workers",
    labourCost: 1000,
    stage: "Vegetative",
  },
  {
    id: "sp-08",
    week: "6",
    date: "May 1",
    activity: "Second weeding",
    swahili: "Kupalilia mara ya pili",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "4 workers",
    labourCost: 2000,
    stage: "Vegetative",
  },
  {
    id: "sp-09",
    week: "8",
    date: "May 15",
    activity: "Scout for FAW",
    swahili: "Kukagua funza wa majani",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "Self",
    labourCost: 0,
    stage: "Vegetative",
  },
  {
    id: "sp-10",
    week: "10",
    date: "May 29",
    activity: "Third weeding if needed",
    swahili: "Kupalilia mara ya tatu",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "3 workers",
    labourCost: 1500,
    stage: "Tasseling",
  },
  {
    id: "sp-11",
    week: "12",
    date: "Jun 12",
    activity: "Tasseling — monitor moisture",
    swahili: "Kuangalia unyevu",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "Self",
    labourCost: 0,
    stage: "Tasseling",
  },
  {
    id: "sp-12",
    week: "16",
    date: "Jul 10",
    activity: "Check moisture content",
    swahili: "Kupima unyevu wa nafaka",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "Self",
    labourCost: 0,
    stage: "Grain fill",
  },
  {
    id: "sp-13",
    week: "18",
    date: "Jul 24",
    activity: "Harvest",
    swahili: "Kuvuna",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "8 workers × 2 days",
    labourCost: 8000,
    stage: "Harvest",
  },
  {
    id: "sp-14",
    week: "18",
    date: "Jul 24",
    activity: "Threshing & shelling",
    swahili: "Kupura",
    input: "Thresher hire",
    qty: "1 day",
    cost: 2000,
    labour: "—",
    labourCost: 0,
    stage: "Harvest",
  },
  {
    id: "sp-15",
    week: "18",
    date: "Jul 26",
    activity: "Drying",
    swahili: "Kukausha",
    input: "—",
    qty: "—",
    cost: 0,
    labour: "—",
    labourCost: 0,
    stage: "Post-harvest",
  },
  {
    id: "sp-16",
    week: "19",
    date: "Aug 2",
    activity: "Bagging & storage",
    swahili: "Kupakia gunia",
    input: "Sacks",
    qty: "60",
    cost: 6000,
    labour: "2 workers",
    labourCost: 1000,
    stage: "Post-harvest",
  },
];

/** Totals derived from the calendar above so the column can never drift. */
export const PLAN_TOTALS = {
  activities: SEASON_PLAN_ROWS.length,
  inputs: SEASON_PLAN_ROWS.reduce((sum, row) => sum + row.cost, 0),
  labour: SEASON_PLAN_ROWS.reduce((sum, row) => sum + row.labourCost, 0),
};

export const PLAN_GRAND_TOTAL = PLAN_TOTALS.inputs + PLAN_TOTALS.labour;

export interface PlanScenario {
  id: string;
  name: string;
  yieldPerAcre: number;
  totalYield: number;
  unit: string;
  price: number;
  revenue: number;
  profit: number;
  roi: number;
  tone: "low" | "medium" | "high";
  note: string;
}

export const PLAN_SCENARIOS: PlanScenario[] = [
  {
    id: "ps-best",
    name: "Best",
    yieldPerAcre: 35,
    totalYield: 70,
    unit: "bags",
    price: 3800,
    revenue: 266000,
    profit: 185000,
    roi: 228,
    tone: "low",
    note: "Timely rains, no FAW outbreak, sold after the glut eased.",
  },
  {
    id: "ps-avg",
    name: "Average",
    yieldPerAcre: 28,
    totalYield: 56,
    unit: "bags",
    price: 3500,
    revenue: 196000,
    profit: 115000,
    roi: 142,
    tone: "medium",
    note: "Normal season with one spray round for armyworm.",
  },
  {
    id: "ps-worst",
    name: "Worst",
    yieldPerAcre: 18,
    totalYield: 36,
    unit: "bags",
    price: 3000,
    revenue: 108000,
    profit: 27000,
    roi: 33,
    tone: "high",
    note: "Dry spell at tasseling plus a late armyworm wave.",
  },
];

export interface SavedPlan {
  id: string;
  name: string;
  crop: string;
  county: string;
  acres: number;
  month: string;
  budget: number;
  spent: number;
  activities: number;
  created: string;
  status: "Draft" | "Active" | "Completed";
  expectedProfit: number;
  owner: string;
}

export const SAVED_PLANS: SavedPlan[] = [
  {
    id: "pl-01",
    name: "Maize · long rains 2027",
    crop: "Maize",
    county: "Uasin Gishu",
    acres: 2,
    month: "March",
    budget: 81000,
    spent: 0,
    activities: 17,
    created: "Today 07:20",
    status: "Draft",
    expectedProfit: 115000,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-02",
    name: "Cabbage Gloria F1 · short rains",
    crop: "Cabbage",
    county: "Kiambu",
    acres: 0.5,
    month: "October",
    budget: 46500,
    spent: 18200,
    activities: 22,
    created: "20 Oct 2026",
    status: "Active",
    expectedProfit: 79400,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-03",
    name: "Dry beans Rosecoco · Plot 4",
    crop: "Dry Beans",
    county: "Kiambu",
    acres: 0.4,
    month: "October",
    budget: 21000,
    spent: 9600,
    activities: 14,
    created: "18 Oct 2026",
    status: "Active",
    expectedProfit: 33800,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-04",
    name: "Tomato Anna F1 · tunnel",
    crop: "Tomato",
    county: "Kiambu",
    acres: 0.2,
    month: "November",
    budget: 38000,
    spent: 38000,
    activities: 26,
    created: "12 Nov 2025",
    status: "Completed",
    expectedProfit: 61000,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-05",
    name: "Potato Shangi · ridge block",
    crop: "Potato",
    county: "Nyandarua",
    acres: 0.6,
    month: "March",
    budget: 74000,
    spent: 74000,
    activities: 19,
    created: "2 Mar 2026",
    status: "Completed",
    expectedProfit: 52000,
    owner: "James Mwangi",
  },
  {
    id: "pl-06",
    name: "Kale Thousand Headed · year-round",
    crop: "Kale",
    county: "Kiambu",
    acres: 0.1,
    month: "October",
    budget: 9500,
    spent: 4100,
    activities: 12,
    created: "5 Oct 2026",
    status: "Active",
    expectedProfit: 18600,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-07",
    name: "Onion Red Creole · dry season",
    crop: "Onion",
    county: "Machakos",
    acres: 0.3,
    month: "April",
    budget: 32000,
    spent: 32000,
    activities: 16,
    created: "14 Apr 2026",
    status: "Completed",
    expectedProfit: 27400,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-08",
    name: "Maize · short rains trial",
    crop: "Maize",
    county: "Kiambu",
    acres: 1.2,
    month: "October",
    budget: 58000,
    spent: 21400,
    activities: 15,
    created: "15 Oct 2026",
    status: "Active",
    expectedProfit: 64000,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-09",
    name: "Avocado Hass · orchard care",
    crop: "Avocado",
    county: "Murang'a",
    acres: 0.4,
    month: "March",
    budget: 27000,
    spent: 27000,
    activities: 11,
    created: "22 Mar 2026",
    status: "Completed",
    expectedProfit: 41000,
    owner: "Mary Wanjiku",
  },
  {
    id: "pl-10",
    name: "Napier grass · fodder block",
    crop: "Napier Grass",
    county: "Kiambu",
    acres: 0.2,
    month: "November",
    budget: 7200,
    spent: 3000,
    activities: 8,
    created: "2 Nov 2026",
    status: "Active",
    expectedProfit: 12400,
    owner: "Mary Wanjiku",
  },
];

/* ============================ 9.3 pest & disease risk ============================ */

export interface PestRisk {
  id: string;
  crop: string;
  variety: string;
  county: string;
  pest: string;
  swahili: string;
  kind: "Disease" | "Pest";
  risk: "high" | "medium" | "low";
  score: number;
  forecast: string;
  action: string;
  product: string;
  dose: string;
  phi: string;
  window: string;
  lastScout: string;
  nextScout: string;
  model: string;
  confidence: number;
  yourFarm: boolean;
}

/** Blueprint rows 1–5 first, then five more Kenyan crop–county pairs. */
export const PEST_RISKS: PestRisk[] = [
  {
    id: "pr-01",
    crop: "Cabbage",
    variety: "Gloria F1",
    county: "Kiambu",
    pest: "Black rot",
    swahili: "Kuoza kwa kabichi",
    kind: "Disease",
    risk: "high",
    score: 82,
    forecast: "Rain + humidity → risk increasing",
    action: "Spray Mancozeb immediately",
    product: "Mancozeb 80WP",
    dose: "50 g per 20 L",
    phi: "14 days",
    window: "Tomorrow 06:00–09:00",
    lastScout: "Today 06:10",
    nextScout: "22 Sep",
    model: "Leaf-wetness + canopy humidity model",
    confidence: 91,
    yourFarm: true,
  },
  {
    id: "pr-02",
    crop: "Maize",
    variety: "H6213",
    county: "Uasin Gishu",
    pest: "Fall Armyworm",
    swahili: "Funza wa majani",
    kind: "Pest",
    risk: "medium",
    score: 58,
    forecast: "Warm temps → egg laying",
    action: "Install pheromone traps, scout",
    product: "Emamectin benzoate 5% SG",
    dose: "20 ml per 20 L",
    phi: "7 days",
    window: "23 Sep after 16:00",
    lastScout: "17 Sep",
    nextScout: "21 Sep",
    model: "Moth flight + degree-day model",
    confidence: 88,
    yourFarm: false,
  },
  {
    id: "pr-03",
    crop: "Tomato",
    variety: "Anna F1",
    county: "Kirinyaga",
    pest: "Late blight",
    swahili: "Ukunga wa tomato",
    kind: "Disease",
    risk: "medium",
    score: 61,
    forecast: "Rain expected → sporulation",
    action: "Preventive Mancozeb spray",
    product: "Mancozeb 80WP",
    dose: "60 g per 20 L",
    phi: "7 days",
    window: "22 Sep 06:30–09:00",
    lastScout: "16 Sep",
    nextScout: "20 Sep",
    model: "Blitecast (temperature + leaf wetness)",
    confidence: 85,
    yourFarm: false,
  },
  {
    id: "pr-04",
    crop: "Potato",
    variety: "Shangi",
    county: "Nyandarua",
    pest: "Early blight",
    swahili: "Ukunga wa mapema",
    kind: "Disease",
    risk: "low",
    score: 24,
    forecast: "Dry conditions",
    action: "Monitor, no action needed",
    product: "—",
    dose: "—",
    phi: "—",
    window: "—",
    lastScout: "15 Sep",
    nextScout: "24 Sep",
    model: "Alternaria risk index",
    confidence: 93,
    yourFarm: false,
  },
  {
    id: "pr-05",
    crop: "Beans",
    variety: "Rosecoco",
    county: "Machakos",
    pest: "Bean fly",
    swahili: "Nzi wa maharagwe",
    kind: "Pest",
    risk: "medium",
    score: 49,
    forecast: "Warm, dry",
    action: "Apply seed treatment at planting",
    product: "Imidacloprid seed dressing",
    dose: "10 ml per 2 kg seed",
    phi: "21 days",
    window: "At planting",
    lastScout: "14 Sep",
    nextScout: "25 Sep",
    model: "Emergence + soil moisture model",
    confidence: 87,
    yourFarm: false,
  },
  {
    id: "pr-06",
    crop: "Tomato",
    variety: "Anna F1",
    county: "Kiambu",
    pest: "Tuta absoluta",
    swahili: "Nondo wa tomato",
    kind: "Pest",
    risk: "high",
    score: 76,
    forecast: "Night temps 15–18 °C → rapid breeding",
    action: "Pheromone traps + spinosad rotation",
    product: "Spinosad 480 SC",
    dose: "15 ml per 20 L",
    phi: "3 days",
    window: "21 Sep 17:00–18:30",
    lastScout: "Today 06:10",
    nextScout: "20 Sep",
    model: "Trap-catch trend + humidity model",
    confidence: 84,
    yourFarm: true,
  },
  {
    id: "pr-07",
    crop: "Kale",
    variety: "Thousand Headed",
    county: "Murang'a",
    pest: "Aphids",
    swahili: "Viroboto",
    kind: "Pest",
    risk: "medium",
    score: 52,
    forecast: "Dry spell → colonies building",
    action: "Spot spray with insecticidal soap",
    product: "Insecticidal soap",
    dose: "40 ml per 20 L",
    phi: "1 day",
    window: "22 Sep 07:00–10:00",
    lastScout: "18 Sep",
    nextScout: "23 Sep",
    model: "Colony growth + temperature model",
    confidence: 89,
    yourFarm: false,
  },
  {
    id: "pr-08",
    crop: "Maize",
    variety: "H6213",
    county: "Nakuru",
    pest: "Stem borer",
    swahili: "Mchwa wa shina",
    kind: "Pest",
    risk: "low",
    score: 28,
    forecast: "Cool nights slowing larvae",
    action: "Keep field edges weeded, monitor",
    product: "—",
    dose: "—",
    phi: "—",
    window: "—",
    lastScout: "13 Sep",
    nextScout: "26 Sep",
    model: "Busseola flight index",
    confidence: 90,
    yourFarm: false,
  },
  {
    id: "pr-09",
    crop: "Passion fruit",
    variety: "Purple Passion",
    county: "Kisumu",
    pest: "Woodiness virus",
    swahili: "Virusi ya kukauka",
    kind: "Disease",
    risk: "high",
    score: 71,
    forecast: "Aphid vectors active after rains",
    action: "Remove infected vines, control aphids",
    product: "Imidacloprid 200 SL",
    dose: "10 ml per 20 L",
    phi: "7 days",
    window: "21 Sep 06:30–09:00",
    lastScout: "12 Sep",
    nextScout: "19 Sep",
    model: "Vector pressure + vine age model",
    confidence: 82,
    yourFarm: false,
  },
  {
    id: "pr-10",
    crop: "Banana",
    variety: "Grand Nain",
    county: "Meru",
    pest: "Banana weevil",
    swahili: "Kiroboto wa ndizi",
    kind: "Pest",
    risk: "low",
    score: 19,
    forecast: "Dry soil limiting movement",
    action: "Trap with split pseudostems",
    product: "—",
    dose: "—",
    phi: "—",
    window: "—",
    lastScout: "11 Sep",
    nextScout: "27 Sep",
    model: "Soil temperature + trap count model",
    confidence: 92,
    yourFarm: false,
  },
];

export interface TreatmentProduct {
  id: string;
  name: string;
  active: string;
  target: string;
  dose: string;
  packSize: string;
  price: number;
  phi: string;
  supplier: string;
  county: string;
  organic: boolean;
}

export const TREATMENT_PRODUCTS: TreatmentProduct[] = [
  {
    id: "tp-01",
    name: "Mancozeb 80WP",
    active: "Mancozeb 80%",
    target: "Black rot, late blight, early blight",
    dose: "50 g per 20 L",
    packSize: "1 kg",
    price: 1450,
    phi: "14 days",
    supplier: "Kunene Agrovet, Githunguri",
    county: "Kiambu",
    organic: false,
  },
  {
    id: "tp-02",
    name: "Metalaxyl-M 720 WP",
    active: "Metalaxyl + Mancozeb",
    target: "Late blight, downy mildew",
    dose: "40 g per 20 L",
    packSize: "500 g",
    price: 1980,
    phi: "7 days",
    supplier: "Kenya Farmers Association",
    county: "Nakuru",
    organic: false,
  },
  {
    id: "tp-03",
    name: "Emamectin benzoate 5% SG",
    active: "Emamectin benzoate",
    target: "Fall armyworm, diamondback moth",
    dose: "20 ml per 20 L",
    packSize: "100 ml",
    price: 1150,
    phi: "7 days",
    supplier: "Syngenta dealer, Eldoret",
    county: "Uasin Gishu",
    organic: false,
  },
  {
    id: "tp-04",
    name: "Dipel DF (Bt)",
    active: "Bacillus thuringiensis",
    target: "Caterpillars, diamondback moth",
    dose: "30 g per 20 L",
    packSize: "500 g",
    price: 1480,
    phi: "0 days",
    supplier: "Organic Inputs Kenya",
    county: "Kiambu",
    organic: true,
  },
  {
    id: "tp-05",
    name: "Spinosad 480 SC",
    active: "Spinosyn A + D",
    target: "Tuta absoluta, thrips",
    dose: "15 ml per 20 L",
    packSize: "250 ml",
    price: 2650,
    phi: "3 days",
    supplier: "Corteva dealer, Thika",
    county: "Kiambu",
    organic: true,
  },
  {
    id: "tp-06",
    name: "Imidacloprid 200 SL",
    active: "Imidacloprid",
    target: "Aphids, whitefly, bean fly",
    dose: "10 ml per 20 L",
    packSize: "250 ml",
    price: 1320,
    phi: "7 days",
    supplier: "Bayer agrovet, Murang'a",
    county: "Murang'a",
    organic: false,
  },
  {
    id: "tp-07",
    name: "Copper oxychloride 50WP",
    active: "Copper oxychloride",
    target: "Bacterial blights, leaf spots",
    dose: "60 g per 20 L",
    packSize: "1 kg",
    price: 1250,
    phi: "7 days",
    supplier: "Twiga Chemicals stockist",
    county: "Nakuru",
    organic: true,
  },
  {
    id: "tp-08",
    name: "Insecticidal soap",
    active: "Potassium salts of fatty acids",
    target: "Aphids, mites, whitefly",
    dose: "40 ml per 20 L",
    packSize: "1 L",
    price: 980,
    phi: "1 day",
    supplier: "Organic Inputs Kenya",
    county: "Kiambu",
    organic: true,
  },
  {
    id: "tp-09",
    name: "Lambda-cyhalothrin 5% EC",
    active: "Lambda-cyhalothrin",
    target: "Stem borer, armyworm",
    dose: "15 ml per 20 L",
    packSize: "250 ml",
    price: 890,
    phi: "7 days",
    supplier: "Agrovet Centre, Eldoret",
    county: "Uasin Gishu",
    organic: false,
  },
  {
    id: "tp-10",
    name: "Neem oil 1500 ppm",
    active: "Azadirachtin",
    target: "Sucking pests, mild fungal pressure",
    dose: "50 ml per 20 L",
    packSize: "1 L",
    price: 1150,
    phi: "2 days",
    supplier: "GrowMO input partners",
    county: "Kiambu",
    organic: true,
  },
];

export interface ScoutRound {
  id: string;
  date: string;
  crop: string;
  plot: string;
  scout: string;
  plants: number;
  affected: number;
  finding: string;
  action: string;
  status: "Done" | "Due" | "Overdue";
}

export const SCOUT_LOG: ScoutRound[] = [
  {
    id: "sc-01",
    date: "Today 06:10",
    crop: "Cabbage",
    plot: "Plot 1: Shamba ya nyumba",
    scout: "Mary Wanjiku",
    plants: 40,
    affected: 7,
    finding: "V-shaped yellow lesions on 7 of 40 plants — black rot starting",
    action: "Rogue and spray Mancozeb within 48 hrs",
    status: "Done",
  },
  {
    id: "sc-02",
    date: "Today 06:35",
    crop: "Maize",
    plot: "Plot 2: Ridge block",
    scout: "Peter Kamau",
    plants: 30,
    affected: 2,
    finding: "2 plants with fresh armyworm frass at the whorl",
    action: "Spray Emamectin at threshold, set 4 traps",
    status: "Done",
  },
  {
    id: "sc-03",
    date: "21 Sep",
    crop: "Cabbage",
    plot: "Plot 1: Shamba ya nyumba",
    scout: "Unassigned",
    plants: 40,
    affected: 0,
    finding: "—",
    action: "Re-check the rogued area after spraying",
    status: "Due",
  },
  {
    id: "sc-04",
    date: "22 Sep",
    crop: "Dry Beans",
    plot: "Plot 4: Lower shamba",
    scout: "Unassigned",
    plants: 25,
    affected: 0,
    finding: "—",
    action: "Check for bean fly at emergence",
    status: "Due",
  },
  {
    id: "sc-05",
    date: "18 Sep",
    crop: "Kale",
    plot: "Plot 6: Kitchen garden",
    scout: "Grace Achieng",
    plants: 20,
    affected: 3,
    finding: "Aphid colonies on 3 plants, no leaf curl yet",
    action: "Insecticidal soap spot spray",
    status: "Done",
  },
  {
    id: "sc-06",
    date: "17 Sep",
    crop: "Tomato",
    plot: "Plot 3: Tunnel",
    scout: "Mary Wanjiku",
    plants: 30,
    affected: 4,
    finding: "Tuta leaf mines on 4 plants near the tunnel door",
    action: "Pheromone traps up, spinosad rotation started",
    status: "Done",
  },
  {
    id: "sc-07",
    date: "16 Sep",
    crop: "Maize",
    plot: "Plot 2: Ridge block",
    scout: "Peter Kamau",
    plants: 30,
    affected: 0,
    finding: "No armyworm damage, moth traps empty",
    action: "Continue weekly monitoring",
    status: "Done",
  },
  {
    id: "sc-08",
    date: "15 Sep",
    crop: "Potato",
    plot: "Plot 5: Nyandarua block",
    scout: "James Mwangi",
    plants: 35,
    affected: 1,
    finding: "Single plant with early blight spots",
    action: "Remove leaves, monitor — dry spell limiting spread",
    status: "Done",
  },
  {
    id: "sc-09",
    date: "14 Sep",
    crop: "Dry Beans",
    plot: "Plot 4: Lower shamba",
    scout: "Grace Achieng",
    plants: 25,
    affected: 0,
    finding: "Clean stand, good emergence",
    action: "None",
    status: "Done",
  },
  {
    id: "sc-10",
    date: "12 Sep",
    crop: "Cabbage",
    plot: "Plot 1: Shamba ya nyumba",
    scout: "Mary Wanjiku",
    plants: 40,
    affected: 0,
    finding: "No disease symptoms after the diamondback check",
    action: "None",
    status: "Overdue",
  },
];

export interface Symptom {
  id: string;
  symptom: string;
  swahili: string;
  crop: string;
  likely: string;
  confidence: number;
  action: string;
}

export const SYMPTOM_LIBRARY: Symptom[] = [
  {
    id: "sy-01",
    symptom: "V-shaped yellow lesions from the leaf edge",
    swahili: "Makala ya manjano ya umbo la V",
    crop: "Cabbage",
    likely: "Black rot (Xanthomonas campestris)",
    confidence: 91,
    action: "Rogue plants, spray Mancozeb, PHI 14 days",
  },
  {
    id: "sy-02",
    symptom: "Window-pane feeding on young leaves",
    swahili: "Majani yameuliwa kama dirisha",
    crop: "Cabbage",
    likely: "Diamondback moth larvae",
    confidence: 88,
    action: "Rotate Emamectin with Bt, scout twice weekly",
  },
  {
    id: "sy-03",
    symptom: "Ragged holes with frass in the whorl",
    swahili: "Mashaka na uchafu katika kichwa cha mmea",
    crop: "Maize",
    likely: "Fall armyworm",
    confidence: 93,
    action: "Spray into the whorl, install pheromone traps",
  },
  {
    id: "sy-04",
    symptom: "Dark water-soaked patches with white mould",
    swahili: "Madoa meusi yenye ukungu mweupe",
    crop: "Tomato",
    likely: "Late blight (Phytophthora infestans)",
    confidence: 90,
    action: "Metalaxyl-M now, remove infected leaves",
  },
  {
    id: "sy-05",
    symptom: "Silver serpentine trails on leaves",
    swahili: "Michoro ya fedha kwenye majani",
    crop: "Tomato",
    likely: "Leaf miner / Tuta absoluta",
    confidence: 86,
    action: "Spinosad rotation plus traps",
  },
  {
    id: "sy-06",
    symptom: "Yellowing lower leaves with brown centres",
    swahili: "Majani ya chini yanakuwa manjano",
    crop: "Potato",
    likely: "Early blight (Alternaria solani)",
    confidence: 84,
    action: "Copper oxychloride, improve airflow",
  },
  {
    id: "sy-07",
    symptom: "Curling leaf tips with sticky residue",
    swahili: "Vichwa vya majani vinajikunja",
    crop: "Kale",
    likely: "Aphids",
    confidence: 95,
    action: "Insecticidal soap or neem oil spot spray",
  },
  {
    id: "sy-08",
    symptom: "Wilting in the afternoon, yellow vascular rings",
    swahili: "Kunyauka mchana na pete za manjano",
    crop: "Tomato",
    likely: "Bacterial wilt (Ralstonia)",
    confidence: 89,
    action: "Remove plants, 3-year rotation, no cure",
  },
  {
    id: "sy-09",
    symptom: "Purple leaves and stunted growth",
    swahili: "Majani ya zambarau na ukuaji duni",
    crop: "Maize",
    likely: "Phosphorus deficiency",
    confidence: 87,
    action: "Foliar DAP spray, re-test soil pH",
  },
  {
    id: "sy-10",
    symptom: "Blossom end turning dark and sunken",
    swahili: "Sehemu ya chini ya tunda inaoza",
    crop: "Tomato",
    likely: "Blossom end rot (calcium + water stress)",
    confidence: 92,
    action: "Even watering, foliar calcium at flowering",
  },
];

/* ============================ 9.4 market price forecast ============================ */

export interface MarketForecast {
  id: string;
  crop: string;
  market: string;
  unit: string;
  current: number;
  month1Low: number;
  month1High: number;
  month3Low: number;
  month3High: number;
  trend: "rising" | "stable" | "falling";
  trendLabel: string;
  advice: string;
  series: number[];
  confidence: number;
  swahili: string;
  yourStock: string;
}

/** Blueprint rows 1–4 first, then six more Kenyan market lines. */
export const MARKET_FORECASTS: MarketForecast[] = [
  {
    id: "mf-01",
    crop: "Cabbage",
    market: "Marikiti, Nairobi",
    unit: "head",
    current: 30,
    month1Low: 25,
    month1High: 35,
    month3Low: 20,
    month3High: 40,
    trend: "stable",
    trendLabel: "Stable",
    advice: "Supply increasing, may dip in Dec",
    series: [28, 29, 31, 30, 32, 31, 30, 29, 30, 31, 30, 30],
    confidence: 88,
    swahili: "Kabichi",
    yourStock: "4,200 heads ready from 14 Jan",
  },
  {
    id: "mf-02",
    crop: "Tomato",
    market: "Kangemi, Nairobi",
    unit: "crate",
    current: 3200,
    month1Low: 2800,
    month1High: 3500,
    month3Low: 4000,
    month3High: 5000,
    trend: "rising",
    trendLabel: "Rising",
    advice: "Dry season coming = less supply = higher prices",
    series: [
      2600, 2750, 2900, 3050, 3100, 3000, 3150, 3200, 3100, 3250, 3200, 3200,
    ],
    confidence: 85,
    swahili: "Nyanya",
    yourStock: "0.2 acre tunnel, first pick 12 Dec",
  },
  {
    id: "mf-03",
    crop: "Maize",
    market: "Eldoret depot",
    unit: "90 kg bag",
    current: 3500,
    month1Low: 3200,
    month1High: 3800,
    month3Low: 3000,
    month3High: 3500,
    trend: "falling",
    trendLabel: "Slight dip",
    advice: "Harvest season in Rift = more supply",
    series: [
      3900, 3800, 3700, 3650, 3600, 3550, 3500, 3480, 3520, 3500, 3510, 3500,
    ],
    confidence: 91,
    swahili: "Mahindi",
    yourStock: "56 bags in store · moisture 13.2%",
  },
  {
    id: "mf-04",
    crop: "Beans",
    market: "Nakuru main market",
    unit: "90 kg bag",
    current: 7500,
    month1Low: 7000,
    month1High: 8000,
    month3Low: 8000,
    month3High: 9000,
    trend: "rising",
    trendLabel: "Rising",
    advice: "Off-season, limited supply",
    series: [
      6800, 6900, 7000, 7100, 7200, 7300, 7400, 7450, 7500, 7500, 7550, 7500,
    ],
    confidence: 87,
    swahili: "Maharagwe",
    yourStock: "Rosecoco 0.4 acre · harvest 28 Dec",
  },
  {
    id: "mf-05",
    crop: "Kale",
    market: "Githunguri stage",
    unit: "kg",
    current: 8,
    month1Low: 7,
    month1High: 10,
    month3Low: 6,
    month3High: 9,
    trend: "stable",
    trendLabel: "Stable",
    advice: "Steady local demand; December glut likely",
    series: [9, 8, 8, 9, 7, 8, 8, 9, 8, 8, 8, 8],
    confidence: 83,
    swahili: "Sukuma wiki",
    yourStock: "Weekly 180 kg cut",
  },
  {
    id: "mf-06",
    crop: "Potato",
    market: "Nyandarua (Kinangop)",
    unit: "110 kg bag",
    current: 4200,
    month1Low: 3800,
    month1High: 4600,
    month3Low: 4500,
    month3High: 5200,
    trend: "rising",
    trendLabel: "Rising",
    advice: "Seed shortage pushing ware prices up",
    series: [
      3600, 3700, 3800, 3900, 4000, 4100, 4150, 4200, 4250, 4200, 4250, 4200,
    ],
    confidence: 86,
    swahili: "Viazi",
    yourStock: "0.6 acre Shangi · lift 20 Jan",
  },
  {
    id: "mf-07",
    crop: "Onion",
    market: "Wakulima Market, Nairobi",
    unit: "10 kg bag",
    current: 850,
    month1Low: 800,
    month1High: 950,
    month3Low: 700,
    month3High: 900,
    trend: "falling",
    trendLabel: "Dipping",
    advice: "Kano plains harvest arriving in November",
    series: [900, 920, 910, 890, 880, 870, 860, 855, 850, 845, 850, 850],
    confidence: 84,
    swahili: "Vitunguu",
    yourStock: "None in store",
  },
  {
    id: "mf-08",
    crop: "Avocado",
    market: "Murang'a collection centre",
    unit: "kg (Hass)",
    current: 45,
    month1Low: 40,
    month1High: 52,
    month3Low: 55,
    month3High: 68,
    trend: "rising",
    trendLabel: "Rising",
    advice: "Export window opens March — hold your crop",
    series: [38, 39, 40, 41, 42, 43, 44, 44, 45, 45, 45, 45],
    confidence: 89,
    swahili: "Parachichi",
    yourStock: "0.4 acre Hass · pick from Feb",
  },
  {
    id: "mf-09",
    crop: "Milk",
    market: "Githunguri dairy coop",
    unit: "litre",
    current: 52,
    month1Low: 48,
    month1High: 55,
    month3Low: 45,
    month3High: 52,
    trend: "falling",
    trendLabel: "Seasonal dip",
    advice: "Rainy season flush lowers farm-gate prices",
    series: [58, 57, 56, 55, 54, 53, 53, 52, 52, 52, 52, 52],
    confidence: 92,
    swahili: "Maziwa",
    yourStock: "2 cows · 22 L/day",
  },
  {
    id: "mf-10",
    crop: "Passion fruit",
    market: "Kisumu produce market",
    unit: "kg",
    current: 95,
    month1Low: 85,
    month1High: 110,
    month3Low: 100,
    month3High: 130,
    trend: "rising",
    trendLabel: "Rising",
    advice: "Processor demand up; contract farming worth it",
    series: [80, 82, 84, 86, 88, 90, 91, 92, 93, 94, 95, 95],
    confidence: 81,
    swahili: "Matunda ya pasi",
    yourStock: "None — planning 0.2 acre",
  },
];

export interface PriceAlert {
  id: string;
  crop: string;
  market: string;
  condition: "above" | "below";
  target: number;
  unit: string;
  channel: string;
  recipient: string;
  status: "Armed" | "Triggered" | "Paused";
  created: string;
  lastCheck: string;
}

export const PRICE_ALERTS: PriceAlert[] = [
  {
    id: "pa-01",
    crop: "Maize",
    market: "Eldoret depot",
    condition: "above",
    target: 3600,
    unit: "90 kg bag",
    channel: "SMS",
    recipient: "0712 345 678",
    status: "Armed",
    created: "17 Sep 2026",
    lastCheck: "Today 06:00",
  },
  {
    id: "pa-02",
    crop: "Cabbage",
    market: "Marikiti, Nairobi",
    condition: "below",
    target: 22,
    unit: "head",
    channel: "SMS + app",
    recipient: "0712 345 678",
    status: "Armed",
    created: "15 Sep 2026",
    lastCheck: "Today 06:00",
  },
  {
    id: "pa-03",
    crop: "Tomato",
    market: "Kangeli, Nairobi",
    condition: "above",
    target: 4000,
    unit: "crate",
    channel: "App",
    recipient: "0712 345 678",
    status: "Armed",
    created: "12 Sep 2026",
    lastCheck: "Today 06:00",
  },
  {
    id: "pa-04",
    crop: "Beans",
    market: "Nakuru main market",
    condition: "above",
    target: 8000,
    unit: "90 kg bag",
    channel: "SMS",
    recipient: "0723 456 789",
    status: "Triggered",
    created: "8 Sep 2026",
    lastCheck: "18 Sep 06:00",
  },
  {
    id: "pa-05",
    crop: "Avocado",
    market: "Murang'a collection centre",
    condition: "above",
    target: 55,
    unit: "kg",
    channel: "SMS + app",
    recipient: "0712 345 678",
    status: "Armed",
    created: "5 Sep 2026",
    lastCheck: "Today 06:00",
  },
  {
    id: "pa-06",
    crop: "Potato",
    market: "Nyandarua (Kinangop)",
    condition: "above",
    target: 4500,
    unit: "110 kg bag",
    channel: "App",
    recipient: "0734 567 890",
    status: "Armed",
    created: "2 Sep 2026",
    lastCheck: "Today 06:00",
  },
  {
    id: "pa-07",
    crop: "Milk",
    market: "Githunguri dairy coop",
    condition: "below",
    target: 48,
    unit: "litre",
    channel: "SMS",
    recipient: "0712 345 678",
    status: "Paused",
    created: "28 Aug 2026",
    lastCheck: "10 Sep 06:00",
  },
  {
    id: "pa-08",
    crop: "Kale",
    market: "Githunguri stage",
    condition: "below",
    target: 6,
    unit: "kg",
    channel: "App",
    recipient: "0712 345 678",
    status: "Armed",
    created: "25 Aug 2026",
    lastCheck: "Today 06:00",
  },
];

/* ============================ 9.5 benchmarking ============================ */

export interface BenchmarkMetric {
  id: string;
  metric: string;
  swahili: string;
  yours: string;
  countyAvg: string;
  top10: string;
  diffPct: number;
  better: boolean;
  measured: string;
  tip: string;
  unit: string;
  yoursValue: number;
  countyValue: number;
  topValue: number;
  lowerIsBetter: boolean;
}

/** Blueprint metrics 1–7 first, then three operational metrics. */
export const BENCHMARK_METRICS: BenchmarkMetric[] = [
  {
    id: "bm-01",
    metric: "Cabbage yield/acre",
    swahili: "Mavuno kwa ekari",
    yours: "16,000 heads",
    countyAvg: "12,000 heads",
    top10: "20,000 heads",
    diffPct: 33,
    better: true,
    measured: "Heads counted at harvest, Plot 1, short rains 2026",
    tip: "Close spacing to 40 cm × 40 cm with the Optimal fertilizer program.",
    unit: "heads",
    yoursValue: 16000,
    countyValue: 12000,
    topValue: 20000,
    lowerIsBetter: false,
  },
  {
    id: "bm-02",
    metric: "Cost per head",
    swahili: "Gharama kwa kichwa",
    yours: "KES 5.98",
    countyAvg: "KES 8.50",
    top10: "KES 4.50",
    diffPct: -30,
    better: true,
    measured: "Total season cost ÷ saleable heads",
    tip: "Bulk-buy DAP with the cooperative to shave another KES 0.40.",
    unit: "KES",
    yoursValue: 5.98,
    countyValue: 8.5,
    topValue: 4.5,
    lowerIsBetter: true,
  },
  {
    id: "bm-03",
    metric: "Labour efficiency",
    swahili: "Ufanisi wa kazi",
    yours: "85 heads/worker/day",
    countyAvg: "60 heads/worker/day",
    top10: "120 heads/worker/day",
    diffPct: 42,
    better: true,
    measured: "Harvest crew output, 3 recorded harvest days",
    tip: "Pre-cut crates and stage at the field edge to reach 100+.",
    unit: "heads/worker/day",
    yoursValue: 85,
    countyValue: 60,
    topValue: 120,
    lowerIsBetter: false,
  },
  {
    id: "bm-04",
    metric: "Fertilizer use efficiency",
    swahili: "Ufanisi wa mbolea",
    yours: "0.003 kg/head",
    countyAvg: "0.005 kg/head",
    top10: "0.002 kg/head",
    diffPct: -40,
    better: true,
    measured: "Fertilizer applied ÷ heads harvested",
    tip: "Split CAN into two doses to cut losses to leaching.",
    unit: "kg/head",
    yoursValue: 0.003,
    countyValue: 0.005,
    topValue: 0.002,
    lowerIsBetter: true,
  },
  {
    id: "bm-05",
    metric: "Time to harvest",
    swahili: "Muda hadi mavuno",
    yours: "90 days",
    countyAvg: "95 days",
    top10: "82 days",
    diffPct: -5,
    better: true,
    measured: "Transplant to first commercial harvest",
    tip: "Transplant hardened seedlings at 4 true leaves to gain a week.",
    unit: "days",
    yoursValue: 90,
    countyValue: 95,
    topValue: 82,
    lowerIsBetter: true,
  },
  {
    id: "bm-06",
    metric: "Post-harvest loss",
    swahili: "Hasara baada ya mavuno",
    yours: "8%",
    countyAvg: "20%",
    top10: "3%",
    diffPct: -60,
    better: true,
    measured: "Rejected heads ÷ total harvested, 3 consignments",
    tip: "Pre-cool in shade and deliver before 09:00 to reach 5%.",
    unit: "%",
    yoursValue: 8,
    countyValue: 20,
    topValue: 3,
    lowerIsBetter: true,
  },
  {
    id: "bm-07",
    metric: "Selling price achieved",
    swahili: "Bei iliyopatikana",
    yours: "KES 30/head",
    countyAvg: "KES 25/head",
    top10: "KES 35/head",
    diffPct: 20,
    better: true,
    measured: "Weighted average across all buyers this season",
    tip: "Two restaurant contracts at KES 36 would lift you into the top 10%.",
    unit: "KES/head",
    yoursValue: 30,
    countyValue: 25,
    topValue: 35,
    lowerIsBetter: false,
  },
  {
    id: "bm-08",
    metric: "Input cost per acre",
    swahili: "Gharama ya pembejeo kwa ekari",
    yours: "KES 31,400",
    countyAvg: "KES 38,900",
    top10: "KES 27,000",
    diffPct: -19,
    better: true,
    measured: "Seed + fertilizer + crop protection per acre",
    tip: "Soil-test first: you are still applying P where P is adequate.",
    unit: "KES/acre",
    yoursValue: 31400,
    countyValue: 38900,
    topValue: 27000,
    lowerIsBetter: true,
  },
  {
    id: "bm-09",
    metric: "Sprays applied on time",
    swahili: "Mipulizo kwa wakati",
    yours: "72%",
    countyAvg: "54%",
    top10: "92%",
    diffPct: 33,
    better: true,
    measured: "Sprays within the AI-recommended window ÷ total sprays",
    tip: "Set the spray window as an app reminder 12 hrs ahead.",
    unit: "%",
    yoursValue: 72,
    countyValue: 54,
    topValue: 92,
    lowerIsBetter: false,
  },
  {
    id: "bm-10",
    metric: "Records kept per week",
    swahili: "Rekodi kwa wiki",
    yours: "5 days",
    countyAvg: "2 days",
    top10: "7 days",
    diffPct: 150,
    better: true,
    measured: "Days with at least one logged activity",
    tip: "Log at the field with the app, not from memory in the evening.",
    unit: "days/week",
    yoursValue: 5,
    countyValue: 2,
    topValue: 7,
    lowerIsBetter: false,
  },
];

export const BENCHMARK_SUMMARY =
  "You're performing above average in 6 of 7 metrics. Your biggest opportunity is increasing yield toward the top 10% — consider closer spacing (40 cm × 40 cm instead of 45 cm × 45 cm) with adequate fertilizer. Also, selling directly to restaurants instead of brokers could increase your price by 20%.";

export interface PeerGroup {
  id: string;
  label: string;
  county: string;
  crop: string;
  band: string;
  farms: number;
  note: string;
  active: boolean;
}

export const PEER_GROUPS: PeerGroup[] = [
  {
    id: "pg-01",
    label: "Kiambu cabbage · 0.3–1.0 acre",
    county: "Kiambu",
    crop: "Cabbage",
    band: "0.3–1.0 acre",
    farms: 214,
    note: "Your current comparison group.",
    active: true,
  },
  {
    id: "pg-02",
    label: "Kiambu cabbage · 1–3 acres",
    county: "Kiambu",
    crop: "Cabbage",
    band: "1–3 acres",
    farms: 96,
    note: "Larger farms with hired managers.",
    active: false,
  },
  {
    id: "pg-03",
    label: "Kiambu all vegetables",
    county: "Kiambu",
    crop: "All vegetables",
    band: "Any size",
    farms: 1180,
    note: "Broadest view across the county.",
    active: false,
  },
  {
    id: "pg-04",
    label: "Central region brassicas",
    county: "Kiambu + Murang'a + Nyandarua",
    crop: "Brassicas",
    band: "0.3–2 acres",
    farms: 640,
    note: "Similar altitude and rain pattern.",
    active: false,
  },
  {
    id: "pg-05",
    label: "Uasin Gishu maize · 1–5 acres",
    county: "Uasin Gishu",
    crop: "Maize",
    band: "1–5 acres",
    farms: 428,
    note: "For your maize benchmark.",
    active: false,
  },
  {
    id: "pg-06",
    label: "Githunguri cooperative members",
    county: "Kiambu",
    crop: "Mixed",
    band: "Any size",
    farms: 312,
    note: "Your own cooperative group.",
    active: false,
  },
  {
    id: "pg-07",
    label: "Organic-certified vegetable farms",
    county: "National",
    crop: "Vegetables",
    band: "Any size",
    farms: 88,
    note: "Higher prices, lower input costs.",
    active: false,
  },
  {
    id: "pg-08",
    label: "Nyandarua potato growers",
    county: "Nyandarua",
    crop: "Potato",
    band: "0.5–2 acres",
    farms: 267,
    note: "For your Shangi block.",
    active: false,
  },
  {
    id: "pg-09",
    label: "Machakos dryland beans",
    county: "Machakos",
    crop: "Dry Beans",
    band: "0.3–2 acres",
    farms: 191,
    note: "Rain-fed, similar soil texture.",
    active: false,
  },
  {
    id: "pg-10",
    label: "GrowMO AI Pro subscribers",
    county: "National",
    crop: "Mixed",
    band: "Any size",
    farms: 2450,
    note: "Top-quartile record keepers.",
    active: false,
  },
];

/* ============================ 9.6 input optimization ============================ */

export interface FertilizerProgram {
  id: string;
  approach: string;
  program: string;
  rate: string;
  costPerAcre: number;
  yieldHeads: number;
  yieldImpact: string;
  verdict: "suboptimal" | "ok" | "recommended" | "marginal";
  verdictLabel: string;
  note: string;
  applications: { when: string; what: string; rate: string }[];
}

/** Blueprint programs 1–4, plus an organic and a soil-test-led option. */
export const FERT_PROGRAMS: FertilizerProgram[] = [
  {
    id: "fp-01",
    approach: "Basic",
    program: "DAP only",
    rate: "50 kg",
    costPerAcre: 6500,
    yieldHeads: 12000,
    yieldImpact: "Baseline (12,000 heads)",
    verdict: "suboptimal",
    verdictLabel: "Suboptimal",
    note: "Cheap but nitrogen runs out by week 6 — heads stay small.",
    applications: [
      {
        when: "Week 0 · planting",
        what: "DAP",
        rate: "50 kg/acre in the furrow",
      },
    ],
  },
  {
    id: "fp-02",
    approach: "Standard",
    program: "DAP + 1× CAN",
    rate: "50 + 50 kg",
    costPerAcre: 11500,
    yieldHeads: 14400,
    yieldImpact: "+20% (14,400 heads)",
    verdict: "ok",
    verdictLabel: "OK",
    note: "Better, but a single CAN dose leaches in heavy short-rain weeks.",
    applications: [
      { when: "Week 0 · planting", what: "DAP", rate: "50 kg/acre" },
      { when: "Week 4", what: "CAN", rate: "50 kg/acre" },
    ],
  },
  {
    id: "fp-03",
    approach: "Optimal",
    program: "DAP + 2× CAN + K foliar",
    rate: "50 + 75 kg + 2 L",
    costPerAcre: 16900,
    yieldHeads: 16800,
    yieldImpact: "+40% (16,800 heads)",
    verdict: "recommended",
    verdictLabel: "Recommended",
    note: "Best return per shilling — this is what the top 10% run.",
    applications: [
      { when: "Week 0 · planting", what: "DAP", rate: "50 kg/acre" },
      { when: "Week 4", what: "CAN", rate: "50 kg/acre" },
      { when: "Week 6", what: "CAN", rate: "25 kg/acre" },
      { when: "Week 7", what: "Potassium foliar", rate: "2 L/acre" },
    ],
  },
  {
    id: "fp-04",
    approach: "Premium",
    program: "DAP + 2× CAN + K foliar + micronutrients",
    rate: "50 + 75 kg + 2 L + 1 L",
    costPerAcre: 18900,
    yieldHeads: 17400,
    yieldImpact: "+45% (17,400 heads)",
    verdict: "marginal",
    verdictLabel: "Marginal return low",
    note: "KES 2,000 extra for only 600 more heads — skip it this season.",
    applications: [
      { when: "Week 0 · planting", what: "DAP", rate: "50 kg/acre" },
      { when: "Week 4", what: "CAN", rate: "50 kg/acre" },
      { when: "Week 6", what: "CAN", rate: "25 kg/acre" },
      { when: "Week 7", what: "Potassium foliar", rate: "2 L/acre" },
      { when: "Week 8", what: "Micronutrients", rate: "1 L/acre" },
    ],
  },
  {
    id: "fp-05",
    approach: "Organic",
    program: "Compost + manure + bone meal",
    rate: "4 t manure + 100 kg bone meal",
    costPerAcre: 14200,
    yieldHeads: 15100,
    yieldImpact: "+26% (15,100 heads)",
    verdict: "ok",
    verdictLabel: "OK",
    note: "Certification premium of KES 8/head can beat the Optimal plan.",
    applications: [
      { when: "Week -2", what: "Well-rotted manure", rate: "4 t/acre" },
      { when: "Week 0", what: "Bone meal", rate: "100 kg/acre" },
      { when: "Week 5", what: "Compost tea", rate: "200 L/acre" },
    ],
  },
  {
    id: "fp-06",
    approach: "Soil-test led",
    program: "Lime + DAP + 2× CAN (pH-corrected)",
    rate: "400 kg lime + 50 + 75 kg",
    costPerAcre: 21400,
    yieldHeads: 18200,
    yieldImpact: "+52% (18,200 heads)",
    verdict: "recommended",
    verdictLabel: "Recommended for pH 5.8",
    note: "Your pH 5.8 locks up phosphorus — lime pays back in one season.",
    applications: [
      { when: "Week -3", what: "Agricultural lime", rate: "400 kg/acre" },
      { when: "Week 0", what: "DAP", rate: "50 kg/acre" },
      { when: "Week 4", what: "CAN", rate: "50 kg/acre" },
      { when: "Week 6", what: "CAN", rate: "25 kg/acre" },
    ],
  },
];

export const AI_PICK =
  "Go with Optimal — the KES 2,000 extra for micronutrients only adds 600 heads (about KES 18,000 revenue). Not worth it for the first season. Focus on the Optimal plan.";

export interface FertilizerProduct {
  id: string;
  name: string;
  grade: string;
  packSize: string;
  price: number;
  rate: string;
  stage: string;
  supplier: string;
  inStock: boolean;
}

export const FERT_PRODUCTS: FertilizerProduct[] = [
  {
    id: "ff-01",
    name: "DAP",
    grade: "18:46:0",
    packSize: "50 kg",
    price: 6500,
    rate: "50 kg/acre",
    stage: "Planting",
    supplier: "Kenya Farmers Association, Githunguri",
    inStock: true,
  },
  {
    id: "ff-02",
    name: "CAN",
    grade: "26% N",
    packSize: "50 kg",
    price: 5200,
    rate: "50 kg/acre",
    stage: "Week 4 top dress",
    supplier: "Yara dealer, Thika Road",
    inStock: true,
  },
  {
    id: "ff-03",
    name: "Urea",
    grade: "46% N",
    packSize: "50 kg",
    price: 5800,
    rate: "25 kg/acre",
    stage: "Week 6 (split only)",
    supplier: "Mea Ltd stockist, Nairobi",
    inStock: true,
  },
  {
    id: "ff-04",
    name: "NPK 17:17:17",
    grade: "17:17:17",
    packSize: "50 kg",
    price: 6900,
    rate: "50 kg/acre",
    stage: "Planting (sandy soils)",
    supplier: "Kunene Agrovet, Githunguri",
    inStock: true,
  },
  {
    id: "ff-05",
    name: "Agricultural lime",
    grade: "CaCO₃ 90%",
    packSize: "50 kg",
    price: 900,
    rate: "400 kg/acre",
    stage: "3 weeks before planting",
    supplier: "Kiamba quarry",
    inStock: true,
  },
  {
    id: "ff-06",
    name: "Potassium foliar (K-Salt)",
    grade: "0:0:50",
    packSize: "1 L",
    price: 1350,
    rate: "2 L/acre",
    stage: "Week 7",
    supplier: "GrowMO input partners",
    inStock: true,
  },
  {
    id: "ff-07",
    name: "Micronutrient mix",
    grade: "B + Zn + Mn",
    packSize: "1 L",
    price: 2000,
    rate: "1 L/acre",
    stage: "Week 8",
    supplier: "Organic Inputs Kenya",
    inStock: false,
  },
  {
    id: "ff-08",
    name: "Well-rotted manure",
    grade: "Organic",
    packSize: "per tonne",
    price: 3200,
    rate: "4 t/acre",
    stage: "2 weeks before planting",
    supplier: "Githunguri dairy farmers",
    inStock: true,
  },
  {
    id: "ff-09",
    name: "Bone meal",
    grade: "Organic P",
    packSize: "25 kg",
    price: 1600,
    rate: "100 kg/acre",
    stage: "Planting",
    supplier: "Organic Inputs Kenya",
    inStock: true,
  },
  {
    id: "ff-10",
    name: "Calcium nitrate (foliar)",
    grade: "15.5% N + Ca",
    packSize: "25 kg",
    price: 3100,
    rate: "10 kg/acre",
    stage: "Flowering",
    supplier: "Yara dealer, Thika Road",
    inStock: true,
  },
];

export const SOIL_TEST = {
  taken: "12 Sep 2026",
  plot: "Plot 1: Shamba ya nyumba",
  lab: "KALRO Soil Lab, Kabete",
  ph: 5.8,
  phTarget: 6.5,
  nitrogen: { value: "0.18%", label: "Nitrogen (total)", status: "Low" },
  phosphorus: {
    value: "9 ppm",
    label: "Phosphorus (Olsen)",
    status: "Adequate",
  },
  potassium: { value: "112 ppm", label: "Potassium", status: "Adequate" },
  organicMatter: { value: "2.4%", label: "Organic matter", status: "Low" },
  cec: { value: "16 cmol/kg", label: "CEC", status: "Adequate" },
  limeNeeded: "400 kg/acre",
  note: "Slightly acidic — phosphorus is being locked up. Lime 3 weeks before planting.",
};

/* ============================ 9.x models, sources, plans ============================ */

export interface AiModelCard {
  id: string;
  name: string;
  task: string;
  version: string;
  accuracy: number;
  dataWindow: string;
  updated: string;
  owner: string;
  latency: string;
  status: "Live" | "Beta" | "Retired";
}

export const AI_MODELS: AiModelCard[] = [
  {
    id: "am-01",
    name: "GrowMO Agronomist",
    task: "Conversational advice (EN + Kiswahili)",
    version: "v4.2",
    accuracy: 94,
    dataWindow: "6 seasons · 1.2 M questions",
    updated: "18 Sep 2026",
    owner: "GrowMO Research",
    latency: "1.8 s",
    status: "Live",
  },
  {
    id: "am-02",
    name: "Leaf Vision",
    task: "Photo diagnosis of pests & diseases",
    version: "v3.7",
    accuracy: 91,
    dataWindow: "48,000 Kenyan leaf images",
    updated: "12 Sep 2026",
    owner: "GrowMO Research + KALRO",
    latency: "2.4 s",
    status: "Live",
  },
  {
    id: "am-03",
    name: "Season Planner",
    task: "Activity calendar + budget generation",
    version: "v5.0",
    accuracy: 96,
    dataWindow: "9,400 recorded season plans",
    updated: "15 Sep 2026",
    owner: "GrowMO Research",
    latency: "3.1 s",
    status: "Live",
  },
  {
    id: "am-04",
    name: "Risk Radar",
    task: "Pest & disease risk forecasting",
    version: "v2.9",
    accuracy: 88,
    dataWindow: "3 years of AWS + trap data",
    updated: "Daily 05:00 EAT",
    owner: "icipe + GrowMO",
    latency: "0.9 s",
    status: "Live",
  },
  {
    id: "am-05",
    name: "Price Compass",
    task: "Market price forecasting",
    version: "v3.1",
    accuracy: 85,
    dataWindow: "42 markets · 5 years daily",
    updated: "Daily 06:00 EAT",
    owner: "GrowMO Markets",
    latency: "0.7 s",
    status: "Live",
  },
  {
    id: "am-06",
    name: "Peer Benchmark",
    task: "Anonymised farm comparison",
    version: "v2.4",
    accuracy: 93,
    dataWindow: "6,100 farms, opt-in only",
    updated: "Weekly",
    owner: "GrowMO Research",
    latency: "1.1 s",
    status: "Live",
  },
  {
    id: "am-07",
    name: "Nutrition Optimiser",
    task: "Fertilizer program selection",
    version: "v2.0",
    accuracy: 90,
    dataWindow: "2,300 soil tests + trials",
    updated: "9 Sep 2026",
    owner: "GrowMO + KALRO",
    latency: "1.4 s",
    status: "Live",
  },
  {
    id: "am-08",
    name: "Water Balance",
    task: "Irrigation need from ET₀ and rain",
    version: "v1.8",
    accuracy: 89,
    dataWindow: "NASA POWER + KMD AWS",
    updated: "Daily 04:30 EAT",
    owner: "GrowMO Research",
    latency: "0.6 s",
    status: "Live",
  },
  {
    id: "am-09",
    name: "Voice Swahili",
    task: "Speech-to-text for voice questions",
    version: "v0.9",
    accuracy: 78,
    dataWindow: "12,000 rural voice samples",
    updated: "1 Sep 2026",
    owner: "GrowMO Research",
    latency: "2.8 s",
    status: "Beta",
  },
  {
    id: "am-10",
    name: "Yield Estimator v1",
    task: "Harvest volume prediction",
    version: "v1.0",
    accuracy: 71,
    dataWindow: "2 seasons",
    updated: "Retired 30 Jun 2026",
    owner: "GrowMO Research",
    latency: "—",
    status: "Retired",
  },
];

export interface AdvisorSource {
  id: string;
  name: string;
  kind: string;
  feed: string;
  updated: string;
  trust: string;
}

export const ADVISOR_SOURCES: AdvisorSource[] = [
  {
    id: "as-01",
    name: "Your farm records",
    kind: "Internal",
    feed: "Plantings, sprays, labour, sales",
    updated: "Continuous",
    trust: "Primary",
  },
  {
    id: "as-02",
    name: "Kenya Met Department",
    kind: "Weather",
    feed: "AWS network + forecasts",
    updated: "Hourly",
    trust: "Official",
  },
  {
    id: "as-03",
    name: "KALRO research",
    kind: "Agronomy",
    feed: "Variety trials, nutrition guides",
    updated: "Quarterly",
    trust: "Official",
  },
  {
    id: "as-04",
    name: "AFA market bulletins",
    kind: "Prices",
    feed: "42 produce markets",
    updated: "Daily",
    trust: "Official",
  },
  {
    id: "as-05",
    name: "icipe surveillance",
    kind: "Pests",
    feed: "Fall armyworm trap network",
    updated: "Weekly",
    trust: "Research",
  },
  {
    id: "as-06",
    name: "CABI ISC",
    kind: "Diseases",
    feed: "Pest and disease factsheets",
    updated: "Monthly",
    trust: "Research",
  },
  {
    id: "as-07",
    name: "NASA POWER",
    kind: "Climate",
    feed: "Rainfall, ET₀, soil moisture",
    updated: "Daily",
    trust: "Satellite",
  },
  {
    id: "as-08",
    name: "GrowMO community gauges",
    kind: "Weather",
    feed: "1,940 farmer rain gauges",
    updated: "Daily",
    trust: "Community",
  },
  {
    id: "as-09",
    name: "Safaricom M-Pesa",
    kind: "Payments",
    feed: "B2C disbursement for labour",
    updated: "Real time",
    trust: "Partner",
  },
  {
    id: "as-10",
    name: "County cooperative returns",
    kind: "Benchmark",
    feed: "Opt-in yield and cost data",
    updated: "Monthly",
    trust: "Community",
  },
];

export interface CreditPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  perks: string[];
  popular: boolean;
}

export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: "cp-01",
    name: "Free",
    price: 0,
    credits: 50,
    perks: ["50 chat credits monthly", "Weekly market summary", "USSD access"],
    popular: false,
  },
  {
    id: "cp-02",
    name: "Starter",
    price: 350,
    credits: 250,
    perks: [
      "250 credits monthly",
      "10 photo diagnoses",
      "Price alerts by SMS",
      "1 season plan a month",
    ],
    popular: false,
  },
  {
    id: "cp-03",
    name: "Pro",
    price: 900,
    credits: 500,
    perks: [
      "500 credits monthly",
      "Unlimited photo diagnoses",
      "Unlimited season plans",
      "Benchmarking engine",
      "Priority answer queue",
    ],
    popular: true,
  },
  {
    id: "cp-04",
    name: "Cooperative",
    price: 4500,
    credits: 4000,
    perks: [
      "4,000 shared credits",
      "Up to 25 members",
      "Group benchmarking",
      "Bulk input price alerts",
    ],
    popular: false,
  },
];

export const ADVISOR_FAQS = [
  {
    q: "Does the AI answer in Kiswahili?",
    a: "Yes. Ask in Kiswahili or English and the reply matches your language. Mixed sentences work too — the model detects the dominant language per message.",
  },
  {
    q: "How accurate are the pest and disease predictions?",
    a: "Risk Radar averages 88% accuracy across 3 years of Kenyan trap and AWS data. Every risk card shows its own confidence score and the model behind it.",
  },
  {
    q: "Can the AI pay my workers?",
    a: "It can prepare an M-Pesa disbursement from your GrowMO wallet. Nothing leaves the wallet until you enter your 4-digit GrowMO PIN on the confirmation screen.",
  },
  {
    q: "What happens to my data?",
    a: "Your records train only your own advisor. Benchmarking is opt-in and always anonymised — peer groups see county averages, never your farm.",
  },
  {
    q: "Does it work without internet?",
    a: "Basic advice works on USSD *384*22#. Photo diagnosis and plan generation need a data connection.",
  },
  {
    q: "How are AI credits used?",
    a: "One credit per chat question, five per photo diagnosis, ten per season plan and two per market forecast refresh. Credits reset on the first of each month.",
  },
  {
    q: "Can I export a generated season plan?",
    a: "Yes — as CSV for spreadsheets, PDF for the field file, or straight into the Crop Planner as scheduled tasks.",
  },
  {
    q: "Where do the prices come from?",
    a: "AFA market bulletins plus GrowMO's own daily collection from 42 produce markets, blended and confidence-scored per market.",
  },
];

export const WALLET = {
  balance: 12400,
  pending: 2600,
  phone: "0712 345 678",
  till: "4051234",
  lastTopUp: "16 Sep 2026 · KES 5,000 via M-Pesa",
};
