/* ============================================================================
   PAGE 2 DATA — Dashboard Home. Realistic Kenyan demo data for Mary's Farm.
   ========================================================================== */

export type HealthStatus = "healthy" | "attention" | "problem";
export type TaskPriority = "urgent" | "today" | "upcoming";
export type TaskStatus = "Pending" | "Scheduled" | "Unpaid" | "Done";
export type PaymentStatus = "Scheduled" | "Pending" | "Future" | "Paid";
export type InsightKind =
  | "tip"
  | "warning"
  | "market"
  | "weather"
  | "benchmark";

export interface ActiveCrop {
  id: string;
  crop: string;
  variety: string;
  symbol: string;
  plot: string;
  stage: string;
  day: number;
  totalDays: number;
  progress: number;
  nextTask: string;
  nextDue: string;
  status: HealthStatus;
  acreage: number;
  planted: string;
  expectedHarvest: string;
  expectedYield: string;
  projectedRevenue: number;
  water: string;
  manager: string;
}

export interface FarmTask {
  id: string;
  priority: TaskPriority;
  task: string;
  crop: string;
  plot: string;
  time: string;
  assigned: string;
  status: TaskStatus;
  details: string;
  input: string;
  quantity: string;
  note: string;
}

export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  tone: "neutral" | "good" | "risk";
  note: string;
}

export interface FarmTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  crop: string;
  amount: number;
  direction: "in" | "out";
  method: string;
  reference: string;
}

export interface AiInsight {
  id: string;
  kind: InsightKind;
  title: string;
  content: string;
  why: string;
  action: string;
  crop: string;
  confidence: number;
}

export interface MarketPrice {
  id: string;
  crop: string;
  variety: string;
  market: string;
  county: string;
  unit: string;
  price: number;
  change: number;
  trend: "up" | "down" | "flat";
  updated: string;
}

export interface UpcomingPayment {
  id: string;
  payee: string;
  phone: string;
  purpose: string;
  crop: string;
  amount: number;
  due: string;
  status: PaymentStatus;
  method: string;
  reference: string;
}

export interface SeasonTimelineRow {
  id: string;
  crop: string;
  variety: string;
  plot: string;
  start: string;
  harvest: string;
  phase: string;
  progress: number;
  nextMilestone: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "crop" | "money" | "weather" | "task";
}

export const DASHBOARD_FARM = {
  name: "Mary's Farm",
  owner: "Mary Wanjiku",
  initials: "MW",
  county: "Kiambu",
  subCounty: "Githunguri",
  ward: "Githunguri",
  location: "Kiambu County, Githunguri",
  aez: "UM1 — Upper Midland",
  season: "Short rains active — Week 3",
  phone: "0712 345 678",
  walletBalance: 35000,
  unread: 4,
  acreage: 5.4,
  activePlots: 6,
} as const;

export const DASHBOARD_WEATHER = {
  location: "Kiambu County, Githunguri",
  currentTemp: 24,
  feelsLike: 22,
  humidity: 78,
  wind: "12 km/h NE",
  rainfall24h: 5.2,
  rainProbability: 70,
  seasonalStatus: "Short rains active — Week 3",
  summary: "Light rain, brighter intervals after 14:00",
  alert:
    "High humidity + rain means black rot risk for cabbage. Apply Mancozeb within 48 hours.",
  updated: "Updated 07:40 EAT",
  forecast: [
    {
      day: "Today",
      condition: "Rain",
      high: 24,
      low: 17,
      rain: 70,
      field: "Spray after 14:00 if leaves dry",
    },
    {
      day: "Sat",
      condition: "Showers",
      high: 21,
      low: 16,
      rain: 76,
      field: "Hold foliar feeds",
    },
    {
      day: "Sun",
      condition: "Cloudy",
      high: 23,
      low: 16,
      rain: 35,
      field: "Good scouting window",
    },
    {
      day: "Mon",
      condition: "Light rain",
      high: 22,
      low: 15,
      rain: 62,
      field: "Check drainage channels",
    },
    {
      day: "Tue",
      condition: "Partly cloudy",
      high: 25,
      low: 16,
      rain: 20,
      field: "Top-dress before evening",
    },
    {
      day: "Wed",
      condition: "Sunny",
      high: 26,
      low: 17,
      rain: 12,
      field: "Irrigate nursery early",
    },
    {
      day: "Thu",
      condition: "Thunderstorms",
      high: 22,
      low: 15,
      rain: 84,
      field: "Secure covers and tools",
    },
  ],
  hourly: [
    { time: "08:00", temp: 19, rain: 58, wind: "7 km/h" },
    { time: "10:00", temp: 21, rain: 70, wind: "9 km/h" },
    { time: "12:00", temp: 23, rain: 54, wind: "12 km/h" },
    { time: "14:00", temp: 24, rain: 32, wind: "12 km/h" },
    { time: "16:00", temp: 23, rain: 28, wind: "10 km/h" },
    { time: "18:00", temp: 20, rain: 44, wind: "8 km/h" },
  ],
} as const;

export const ACTIVE_CROPS: ActiveCrop[] = [
  {
    id: "crop-01",
    crop: "Cabbage",
    variety: "Gloria F1",
    symbol: "🥬",
    plot: "Plot 1 · Shamba ya nyumba",
    stage: "Vegetative phase",
    day: 24,
    totalDays: 90,
    progress: 27,
    nextTask: "Top-dress CAN",
    nextDue: "in 3 days",
    status: "attention",
    acreage: 0.5,
    planted: "25 Aug 2026",
    expectedHarvest: "23 Nov 2026",
    expectedYield: "7,000 heads",
    projectedRevenue: 224000,
    water: "Drip + short rains",
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-02",
    crop: "Maize",
    variety: "H6213",
    symbol: "🌽",
    plot: "Plot 2 · Shamba ya chini",
    stage: "V6 vegetative",
    day: 31,
    totalDays: 150,
    progress: 21,
    nextTask: "Scout Fall Armyworm",
    nextDue: "today",
    status: "problem",
    acreage: 2,
    planted: "18 Aug 2026",
    expectedHarvest: "15 Jan 2027",
    expectedYield: "62 bags (90 kg)",
    projectedRevenue: 217000,
    water: "Rain-fed",
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-03",
    crop: "Beans",
    variety: "Rosecoco",
    symbol: "🫘",
    plot: "Plot 3 · Kwa mto",
    stage: "Flowering",
    day: 43,
    totalDays: 75,
    progress: 57,
    nextTask: "Inspect bean fly",
    nextDue: "tomorrow",
    status: "healthy",
    acreage: 0.7,
    planted: "06 Aug 2026",
    expectedHarvest: "20 Oct 2026",
    expectedYield: "7 bags (90 kg)",
    projectedRevenue: 52500,
    water: "Sprinkler",
    manager: "John Mwangi",
  },
  {
    id: "crop-04",
    crop: "Tomato",
    variety: "Anna F1",
    symbol: "🍅",
    plot: "Greenhouse 1",
    stage: "Fruit set",
    day: 61,
    totalDays: 110,
    progress: 55,
    nextTask: "Prune side shoots",
    nextDue: "today",
    status: "healthy",
    acreage: 0.2,
    planted: "19 Jul 2026",
    expectedHarvest: "06 Nov 2026",
    expectedYield: "160 crates",
    projectedRevenue: 512000,
    water: "Fertigation",
    manager: "Lucy Njeri",
  },
  {
    id: "crop-05",
    crop: "Potato",
    variety: "Shangi",
    symbol: "🥔",
    plot: "Plot 4 · Githiga lease",
    stage: "Tuber initiation",
    day: 38,
    totalDays: 90,
    progress: 42,
    nextTask: "Earth up rows",
    nextDue: "in 2 days",
    status: "attention",
    acreage: 0.8,
    planted: "11 Aug 2026",
    expectedHarvest: "09 Nov 2026",
    expectedYield: "78 bags (50 kg)",
    projectedRevenue: 226200,
    water: "Rain-fed",
    manager: "Peter Kamau",
  },
  {
    id: "crop-06",
    crop: "Kale",
    variety: "Thousand Headed",
    symbol: "🥬",
    plot: "Kitchen garden",
    stage: "Continuous harvest",
    day: 74,
    totalDays: 180,
    progress: 41,
    nextTask: "Harvest market bunches",
    nextDue: "tomorrow",
    status: "healthy",
    acreage: 0.1,
    planted: "06 Jul 2026",
    expectedHarvest: "Weekly to Dec 2026",
    expectedYield: "1,800 bunches",
    projectedRevenue: 54000,
    water: "Drip",
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-07",
    crop: "Onion",
    variety: "Red Creole",
    symbol: "🧅",
    plot: "Plot 5 · Ngewa",
    stage: "Bulb development",
    day: 68,
    totalDays: 120,
    progress: 57,
    nextTask: "Reduce irrigation",
    nextDue: "in 4 days",
    status: "healthy",
    acreage: 0.4,
    planted: "12 Jul 2026",
    expectedHarvest: "09 Nov 2026",
    expectedYield: "110 nets (14 kg)",
    projectedRevenue: 181500,
    water: "Drip",
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-08",
    crop: "Avocado",
    variety: "Hass",
    symbol: "🥑",
    plot: "Orchard · Upper ridge",
    stage: "Fruit sizing",
    day: 210,
    totalDays: 300,
    progress: 70,
    nextTask: "Calcium foliar feed",
    nextDue: "in 5 days",
    status: "healthy",
    acreage: 0.4,
    planted: "Perennial block",
    expectedHarvest: "Jan 2027",
    expectedYield: "5,400 fruits",
    projectedRevenue: 97200,
    water: "Basin irrigation",
    manager: "Mary Wanjiku",
  },
  {
    id: "crop-09",
    crop: "Napier grass",
    variety: "Pakchong 1",
    symbol: "🌿",
    plot: "Dairy strip",
    stage: "Regrowth",
    day: 19,
    totalDays: 45,
    progress: 42,
    nextTask: "Apply slurry",
    nextDue: "tomorrow",
    status: "healthy",
    acreage: 0.2,
    planted: "Perennial block",
    expectedHarvest: "14 Oct 2026",
    expectedYield: "3.8 tonnes",
    projectedRevenue: 38000,
    water: "Rain-fed + slurry",
    manager: "John Mwangi",
  },
  {
    id: "crop-10",
    crop: "Coffee",
    variety: "Ruiru 11",
    symbol: "☕",
    plot: "Coffee block",
    stage: "Berry expansion",
    day: 145,
    totalDays: 240,
    progress: 60,
    nextTask: "CBD inspection",
    nextDue: "in 2 days",
    status: "attention",
    acreage: 0.1,
    planted: "Perennial block",
    expectedHarvest: "Dec 2026",
    expectedYield: "820 kg cherry",
    projectedRevenue: 98400,
    water: "Rain-fed",
    manager: "Mary Wanjiku",
  },
];

export const TODAY_TASKS: FarmTask[] = [
  {
    id: "task-01",
    priority: "urgent",
    task: "Scout for Diamondback moth",
    crop: "Cabbage · Gloria F1",
    plot: "Plot 1",
    time: "08:00",
    assigned: "Self",
    status: "Pending",
    details:
      "Walk a W pattern and inspect 20 plants. Check leaf undersides and growing points.",
    input: "Yellow sticky cards",
    quantity: "4 cards + field notebook",
    note: "Take a clear photo if more than 3 larvae are found per plant.",
  },
  {
    id: "task-02",
    priority: "today",
    task: "Apply Mancozeb fungicide",
    crop: "Cabbage · Gloria F1",
    plot: "Plot 1",
    time: "10:00",
    assigned: "John Mwangi",
    status: "Scheduled",
    details:
      "Apply only after leaves dry. Cover both upper and lower leaf surfaces.",
    input: "Mancozeb 80% WP",
    quantity: "50 g per 20 L · 4 knapsacks",
    note: "Wear gloves, mask and gumboots. Observe 14-day PHI.",
  },
  {
    id: "task-03",
    priority: "upcoming",
    task: "Collect manure from dairy unit",
    crop: "Cabbage · Gloria F1",
    plot: "Compost bay",
    time: "14:00",
    assigned: "Self",
    status: "Pending",
    details:
      "Move well-composted manure to the covered bay before the evening rain.",
    input: "Wheelbarrow and fork",
    quantity: "12 wheelbarrows",
    note: "Keep fresh manure separate from mature compost.",
  },
  {
    id: "task-04",
    priority: "urgent",
    task: "Pay John for yesterday's weeding",
    crop: "General farm",
    plot: "Plot 2",
    time: "Anytime",
    assigned: "Mary Wanjiku",
    status: "Unpaid",
    details:
      "Approve completed weeding work and release the agreed casual labour rate.",
    input: "M-Pesa payroll",
    quantity: "KES 500",
    note: "John confirmed completion at 17:42 yesterday.",
  },
  {
    id: "task-05",
    priority: "today",
    task: "Prune tomato side shoots",
    crop: "Tomato · Anna F1",
    plot: "Greenhouse 1",
    time: "11:30",
    assigned: "Lucy Njeri",
    status: "Scheduled",
    details:
      "Remove side shoots below the first truss and sanitize secateurs between rows.",
    input: "Secateurs + sanitizer",
    quantity: "420 plants",
    note: "Do not prune wet plants.",
  },
  {
    id: "task-06",
    priority: "today",
    task: "Check maize Fall Armyworm traps",
    crop: "Maize · H6213",
    plot: "Plot 2",
    time: "13:00",
    assigned: "Self",
    status: "Pending",
    details:
      "Count moths in both pheromone traps and inspect 10 plants around each trap.",
    input: "FAW pheromone traps",
    quantity: "2 traps",
    note: "Action threshold is 3 moths per trap per night.",
  },
  {
    id: "task-07",
    priority: "upcoming",
    task: "Inspect potato ridges",
    crop: "Potato · Shangi",
    plot: "Plot 4",
    time: "15:00",
    assigned: "Peter Kamau",
    status: "Scheduled",
    details:
      "Mark exposed tubers and weak ridges ahead of Saturday's earthing-up crew.",
    input: "Marker flags",
    quantity: "30 flags",
    note: "Report any late-blight lesions immediately.",
  },
  {
    id: "task-08",
    priority: "upcoming",
    task: "Harvest kale for Githunguri market",
    crop: "Kale · Thousand Headed",
    plot: "Kitchen garden",
    time: "16:00",
    assigned: "Lucy Njeri",
    status: "Scheduled",
    details: "Harvest clean outer leaves and grade into uniform 500 g bunches.",
    input: "Crates + sisal twine",
    quantity: "120 bunches",
    note: "Buyer collection is at 06:30 tomorrow.",
  },
  {
    id: "task-09",
    priority: "upcoming",
    task: "Clean drip filter",
    crop: "Onion · Red Creole",
    plot: "Plot 5",
    time: "17:00",
    assigned: "Self",
    status: "Pending",
    details: "Back-flush the mainline and rinse the 120-mesh disc filter.",
    input: "Filter brush",
    quantity: "1 filter",
    note: "Record pressure before and after cleaning.",
  },
  {
    id: "task-10",
    priority: "upcoming",
    task: "Update spray diary",
    crop: "All protected crops",
    plot: "Farm office",
    time: "18:30",
    assigned: "Mary Wanjiku",
    status: "Done",
    details:
      "Attach product batch numbers, applicator name and weather conditions.",
    input: "Spray records",
    quantity: "3 entries",
    note: "KS1758 records synced at 18:44.",
  },
];

export const FINANCIAL_METRICS: FinancialMetric[] = [
  {
    id: "wallet",
    label: "Wallet balance",
    value: 35000,
    tone: "neutral",
    note: "M-Pesa linked",
  },
  {
    id: "budget",
    label: "Season budget · Cabbage",
    value: 56000,
    tone: "neutral",
    note: "0.5 acre plan",
  },
  {
    id: "spent",
    label: "Spent to date",
    value: 22000,
    tone: "neutral",
    note: "39% of budget",
  },
  {
    id: "remaining",
    label: "Remaining",
    value: 34000,
    tone: "good",
    note: "61% available",
  },
  {
    id: "obligations",
    label: "Unpaid obligations",
    value: 4500,
    tone: "risk",
    note: "3 payments due",
  },
  {
    id: "revenue",
    label: "Projected revenue",
    value: 240000,
    tone: "good",
    note: "7,000 heads × avg price",
  },
  {
    id: "profit",
    label: "Projected profit",
    value: 184000,
    tone: "good",
    note: "Up 12% vs last season",
  },
];

export const FARM_TRANSACTIONS: FarmTransaction[] = [
  {
    id: "txn-01",
    date: "18 Sep 2026",
    description: "Twiga cabbage deposit",
    category: "Crop sale",
    crop: "Cabbage",
    amount: 12400,
    direction: "in",
    method: "M-Pesa",
    reference: "QJT81M4K2P",
  },
  {
    id: "txn-02",
    date: "17 Sep 2026",
    description: "Casual weeding · John",
    category: "Labour",
    crop: "Maize",
    amount: 500,
    direction: "out",
    method: "M-Pesa",
    reference: "QJR74P9D0A",
  },
  {
    id: "txn-03",
    date: "16 Sep 2026",
    description: "Mancozeb 80% WP",
    category: "Crop protection",
    crop: "Cabbage",
    amount: 1250,
    direction: "out",
    method: "Wallet",
    reference: "GM-84291",
  },
  {
    id: "txn-04",
    date: "15 Sep 2026",
    description: "Kale market sale",
    category: "Crop sale",
    crop: "Kale",
    amount: 4800,
    direction: "in",
    method: "Cash",
    reference: "SALE-0194",
  },
  {
    id: "txn-05",
    date: "14 Sep 2026",
    description: "Greenhouse fertigation salts",
    category: "Fertilizer",
    crop: "Tomato",
    amount: 6800,
    direction: "out",
    method: "M-Pesa",
    reference: "QJP20L5V7C",
  },
  {
    id: "txn-06",
    date: "12 Sep 2026",
    description: "Drip line repair",
    category: "Irrigation",
    crop: "Onion",
    amount: 2350,
    direction: "out",
    method: "Wallet",
    reference: "GM-84022",
  },
  {
    id: "txn-07",
    date: "10 Sep 2026",
    description: "Milk collection payment",
    category: "Dairy income",
    crop: "Dairy",
    amount: 9360,
    direction: "in",
    method: "Bank",
    reference: "GDF-9188",
  },
  {
    id: "txn-08",
    date: "09 Sep 2026",
    description: "Shangi seed top-up",
    category: "Seed",
    crop: "Potato",
    amount: 4200,
    direction: "out",
    method: "M-Pesa",
    reference: "QJK51N8Y6E",
  },
  {
    id: "txn-09",
    date: "07 Sep 2026",
    description: "Transport to Marikiti",
    category: "Transport",
    crop: "Kale",
    amount: 3000,
    direction: "out",
    method: "Cash",
    reference: "PETTY-381",
  },
  {
    id: "txn-10",
    date: "05 Sep 2026",
    description: "Rosecoco forward order",
    category: "Crop sale",
    crop: "Beans",
    amount: 10000,
    direction: "in",
    method: "M-Pesa",
    reference: "QJH11A3R8M",
  },
];

export const AI_INSIGHTS: AiInsight[] = [
  {
    id: "insight-01",
    kind: "tip",
    title: "Heading stage ahead",
    content:
      "Your cabbage enters heading in 10 days. Reduce nitrogen and increase potassium for tighter heads.",
    why: "Growth model uses Day 24, UM1 temperatures and Gloria F1's 90-day maturity.",
    action: "Schedule potassium foliar feed",
    crop: "Cabbage",
    confidence: 92,
  },
  {
    id: "insight-02",
    kind: "warning",
    title: "Fall Armyworm nearby",
    content:
      "FAW has been reported on neighbouring farms in Limuru. Scout your maize immediately.",
    why: "Three verified field reports were logged within 18 km during the last 48 hours.",
    action: "Create maize scouting task",
    crop: "Maize",
    confidence: 88,
  },
  {
    id: "insight-03",
    kind: "market",
    title: "Cabbage price softened",
    content:
      "Marikiti cabbage prices dropped 15% this week. Compare Kiambu and Kangemi buyers before harvest.",
    why: "Supply arrivals rose after Nyandarua harvesting began on Monday.",
    action: "Open market comparison",
    crop: "Cabbage",
    confidence: 84,
  },
  {
    id: "insight-04",
    kind: "weather",
    title: "Dry spell watch",
    content:
      "A 10–13 day dry spell is likely from 02 October. Check cabbage and onion irrigation capacity.",
    why: "Seasonal ensemble agrees across 7 of 10 weather models.",
    action: "Create irrigation check",
    crop: "Cabbage",
    confidence: 76,
  },
  {
    id: "insight-05",
    kind: "benchmark",
    title: "Cabbage cost gap",
    content:
      "Your cost per head is KES 3.50; top Kiambu farms average KES 2.80. Bulk manure could close the gap.",
    why: "Compared with 126 farms in UM1 growing 0.25–1 acre of hybrid cabbage.",
    action: "Review cost benchmark",
    crop: "Cabbage",
    confidence: 90,
  },
  {
    id: "insight-06",
    kind: "tip",
    title: "Tomato pruning window",
    content:
      "Prune before noon today; lower humidity after 10:00 reduces Botrytis infection risk.",
    why: "Greenhouse humidity is forecast to fall below 72% between 10:00 and 13:00.",
    action: "Confirm pruning task",
    crop: "Tomato",
    confidence: 87,
  },
  {
    id: "insight-07",
    kind: "warning",
    title: "Late blight pressure rising",
    content:
      "Potato late-blight risk reaches high level on Saturday after two wet nights.",
    why: "Humidity above 90% and temperatures of 15–20°C favour infection.",
    action: "Add preventive spray task",
    crop: "Potato",
    confidence: 86,
  },
  {
    id: "insight-08",
    kind: "market",
    title: "Rosecoco demand strong",
    content:
      "Nakuru buyers are paying KES 7,500 per bag, KES 300 above Nyamakima today.",
    why: "Net advantage remains KES 165 per bag after estimated transport from Githunguri.",
    action: "Save Nakuru buyer watch",
    crop: "Beans",
    confidence: 95,
  },
  {
    id: "insight-09",
    kind: "weather",
    title: "Avocado calcium timing",
    content:
      "Tuesday's dry morning is the best 7-day window for a calcium foliar feed.",
    why: "Six rain-free hours and low wind are expected from 07:00.",
    action: "Schedule orchard spray",
    crop: "Avocado",
    confidence: 81,
  },
  {
    id: "insight-10",
    kind: "benchmark",
    title: "Labour efficiency improving",
    content:
      "Your weeding hours per acre improved 11% this month and now match the Kiambu median.",
    why: "Based on completed task duration across maize, cabbage and potato plots.",
    action: "View labour breakdown",
    crop: "Whole farm",
    confidence: 89,
  },
];

export const MARKET_PRICES: MarketPrice[] = [
  {
    id: "market-01",
    crop: "Cabbage",
    variety: "Gloria F1",
    market: "Marikiti",
    county: "Nairobi",
    unit: "head",
    price: 30,
    change: -5,
    trend: "down",
    updated: "07:10",
  },
  {
    id: "market-02",
    crop: "Tomato",
    variety: "Anna F1",
    market: "Kangemi",
    county: "Nairobi",
    unit: "crate",
    price: 3200,
    change: 400,
    trend: "up",
    updated: "07:18",
  },
  {
    id: "market-03",
    crop: "Maize",
    variety: "H6213",
    market: "Eldoret",
    county: "Uasin Gishu",
    unit: "90 kg bag",
    price: 3500,
    change: 0,
    trend: "flat",
    updated: "06:55",
  },
  {
    id: "market-04",
    crop: "Beans",
    variety: "Rosecoco",
    market: "Nakuru",
    county: "Nakuru",
    unit: "90 kg bag",
    price: 7500,
    change: 500,
    trend: "up",
    updated: "07:02",
  },
  {
    id: "market-05",
    crop: "Potato",
    variety: "Shangi",
    market: "Wakulima",
    county: "Nairobi",
    unit: "50 kg bag",
    price: 2900,
    change: 150,
    trend: "up",
    updated: "07:21",
  },
  {
    id: "market-06",
    crop: "Kale",
    variety: "Thousand Headed",
    market: "Githunguri",
    county: "Kiambu",
    unit: "bunch",
    price: 24,
    change: 2,
    trend: "up",
    updated: "06:48",
  },
  {
    id: "market-07",
    crop: "Onion",
    variety: "Red Creole",
    market: "Kongowea",
    county: "Mombasa",
    unit: "14 kg net",
    price: 1650,
    change: -100,
    trend: "down",
    updated: "06:40",
  },
  {
    id: "market-08",
    crop: "Avocado",
    variety: "Hass",
    market: "Export grade",
    county: "Kiambu",
    unit: "fruit",
    price: 18,
    change: 3,
    trend: "up",
    updated: "07:30",
  },
  {
    id: "market-09",
    crop: "Coffee",
    variety: "Ruiru 11",
    market: "Kiambu Mill",
    county: "Kiambu",
    unit: "kg cherry",
    price: 120,
    change: 0,
    trend: "flat",
    updated: "Yesterday",
  },
  {
    id: "market-10",
    crop: "Napier grass",
    variety: "Pakchong 1",
    market: "Githunguri dairy",
    county: "Kiambu",
    unit: "tonne",
    price: 10000,
    change: 500,
    trend: "up",
    updated: "Yesterday",
  },
];

export const UPCOMING_PAYMENTS: UpcomingPayment[] = [
  {
    id: "pay-01",
    payee: "John Mwangi",
    phone: "0718 442 106",
    purpose: "Weeding · yesterday",
    crop: "Maize",
    amount: 500,
    due: "Today",
    status: "Scheduled",
    method: "M-Pesa",
    reference: "PAY-260918-01",
  },
  {
    id: "pay-02",
    payee: "Githunguri Farmers Agrovet",
    phone: "0722 115 480",
    purpose: "CAN fertilizer · 1 bag",
    crop: "Cabbage",
    amount: 5000,
    due: "20 Sep 2026",
    status: "Pending",
    method: "Buy Goods",
    reference: "PO-2914",
  },
  {
    id: "pay-03",
    payee: "Peter Kamau",
    phone: "0704 183 921",
    purpose: "Produce transport",
    crop: "Potato",
    amount: 3000,
    due: "15 Oct 2026",
    status: "Future",
    method: "M-Pesa",
    reference: "PAY-261015-03",
  },
  {
    id: "pay-04",
    payee: "Lucy Njeri",
    phone: "0798 210 663",
    purpose: "Greenhouse week 38",
    crop: "Tomato",
    amount: 2800,
    due: "Today",
    status: "Scheduled",
    method: "M-Pesa",
    reference: "PAY-260918-04",
  },
  {
    id: "pay-05",
    payee: "Kiambu Water Services",
    phone: "Paybill 885100",
    purpose: "Irrigation water",
    crop: "Whole farm",
    amount: 1840,
    due: "23 Sep 2026",
    status: "Pending",
    method: "Paybill",
    reference: "WATER-9182",
  },
  {
    id: "pay-06",
    payee: "Limuru Mbegu & Inputs",
    phone: "Till 5418201",
    purpose: "Potato fungicide",
    crop: "Potato",
    amount: 3650,
    due: "24 Sep 2026",
    status: "Pending",
    method: "Buy Goods",
    reference: "PO-2931",
  },
  {
    id: "pay-07",
    payee: "Grace Waithira",
    phone: "0112 806 450",
    purpose: "Kale harvesting",
    crop: "Kale",
    amount: 750,
    due: "25 Sep 2026",
    status: "Future",
    method: "M-Pesa",
    reference: "PAY-260925-07",
  },
  {
    id: "pay-08",
    payee: "KALRO Kabete Lab",
    phone: "Paybill 804201",
    purpose: "Soil analysis · 2 samples",
    crop: "Cabbage",
    amount: 2400,
    due: "28 Sep 2026",
    status: "Future",
    method: "Paybill",
    reference: "LAB-6618",
  },
  {
    id: "pay-09",
    payee: "Mwangaza Sacco",
    phone: "Paybill 329115",
    purpose: "Solar pump instalment",
    crop: "Whole farm",
    amount: 6200,
    due: "30 Sep 2026",
    status: "Future",
    method: "Paybill",
    reference: "LOAN-04-12",
  },
  {
    id: "pay-10",
    payee: "Ngewa Landowner",
    phone: "0735 904 211",
    purpose: "Plot 5 quarterly lease",
    crop: "Onion",
    amount: 12000,
    due: "01 Oct 2026",
    status: "Future",
    method: "M-Pesa",
    reference: "LEASE-Q4-26",
  },
];

export const SEASON_TIMELINE: SeasonTimelineRow[] = ACTIVE_CROPS.map(
  (crop) => ({
    id: crop.id,
    crop: crop.crop,
    variety: crop.variety,
    plot: crop.plot,
    start: crop.planted,
    harvest: crop.expectedHarvest,
    phase: crop.stage,
    progress: crop.progress,
    nextMilestone: crop.nextTask,
  }),
);

export const DASHBOARD_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-01",
    at: "07:42",
    title: "Weather feed synced",
    detail: "Githunguri rain probability updated to 70%.",
    kind: "weather",
  },
  {
    id: "act-02",
    at: "07:18",
    title: "Tomato market moved",
    detail: "Kangemi crate price rose by KES 400.",
    kind: "money",
  },
  {
    id: "act-03",
    at: "06:55",
    title: "John checked in",
    detail: "Worker attendance confirmed from Plot 1.",
    kind: "task",
  },
  {
    id: "act-04",
    at: "Yesterday",
    title: "Spray task completed",
    detail: "Mancozeb batch MZB-882 logged by Mary.",
    kind: "task",
  },
  {
    id: "act-05",
    at: "Yesterday",
    title: "Buyer deposit received",
    detail: "Twiga paid KES 12,400 to the farm wallet.",
    kind: "money",
  },
  {
    id: "act-06",
    at: "Wed",
    title: "Cabbage photo added",
    detail: "Day 23 canopy image attached to Plot 1.",
    kind: "crop",
  },
  {
    id: "act-07",
    at: "Tue",
    title: "Potato risk changed",
    detail: "Late-blight risk moved from low to medium.",
    kind: "weather",
  },
  {
    id: "act-08",
    at: "Mon",
    title: "Inventory reconciled",
    detail: "CAN balance confirmed at 0.5 bag.",
    kind: "crop",
  },
  {
    id: "act-09",
    at: "14 Sep",
    title: "Kale sale recorded",
    detail: "KES 4,800 cash income added to farm records.",
    kind: "money",
  },
  {
    id: "act-10",
    at: "12 Sep",
    title: "Drip line repaired",
    detail: "Onion Plot 5 pressure returned to 1.2 bar.",
    kind: "crop",
  },
];

export const EXPENSE_CATEGORIES = [
  "Seed",
  "Fertilizer",
  "Crop protection",
  "Labour",
  "Transport",
  "Irrigation",
  "Equipment",
  "Other",
] as const;

export const QUICK_ACTIONS = [
  { id: "crop", label: "Add new crop", note: "4-step crop plan" },
  { id: "expense", label: "Record expense", note: "Categorise a payment" },
  { id: "labour", label: "Pay labour", note: "M-Pesa + receipt" },
  { id: "ai", label: "Ask GrowMO AI", note: "Crop-aware guidance" },
  { id: "analytics", label: "View analytics", note: "Yield, cost, benchmark" },
  { id: "market", label: "Check market", note: "10 live price records" },
] as const;
