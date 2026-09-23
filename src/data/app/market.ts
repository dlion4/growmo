/* ============================================================================
   PAGE 10 — MARKET & SALES  (/app/market)
   Kenyan market data for Mary's Farm, Githunguri (Kiambu), Sep 2026 season.

   Blueprint sections covered:
   10.1 live market prices across 8 Kenyan markets · 10.2 price trend charts ·
   10.3 AI best-market recommendation with transport/fees net prices ·
   10.4 buyer directory (brokers, supermarkets, exporters, cooperatives, online) ·
   10.5 harvest sales planner (4 scenarios + AI pick) ·
   10.6 sales recording with M-Pesa receipt · 10.7 contract farming board.
   Prices, distances, fees and M-Pesa codes are realistic but fictional.
   ========================================================================== */

export const MARKET_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  county: "Kiambu",
  subCounty: "Githunguri",
  phone: "0712 345 678",
  walletBalance: 85400,
  mpesaName: "MARY WANJIKU K",
  season: "SR 2026 · Short rains",
  lastPriceUpdate: "22 Sep 2026 · 09:14",
  subscribedAlerts: 4,
  pendingContracts: 2,
  salesYtd: 580000,
  salesTarget: 720000,
  buyersContacted: 12,
  activeListings: 3,
  marketScore: 78,
  topMarket: "Thika",
  transportRate: 35, // KES per km per 1,000 heads
};

/* ------------------------------------------------------------ 10.1 prices */

export interface MarketPrice {
  market: string;
  marketShort: string;
  distance: number;
  transportPerHead: number;
  marketFeePct: number;
  reliability: number; // 0-5
}

export const MARKETS: MarketPrice[] = [
  { market: "Nairobi (Marikiti)", marketShort: "Marikiti", distance: 40, transportPerHead: 2.0, marketFeePct: 1, reliability: 3.5 },
  { market: "Nairobi (Wakulima)", marketShort: "Wakulima", distance: 42, transportPerHead: 2.1, marketFeePct: 1, reliability: 3.8 },
  { market: "Kangemi", marketShort: "Kangemi", distance: 35, transportPerHead: 1.75, marketFeePct: 1, reliability: 3.4 },
  { market: "Mombasa (Kongowea)", marketShort: "Kongowea", distance: 450, transportPerHead: 12.0, marketFeePct: 1.5, reliability: 3.6 },
  { market: "Kisumu (Kibos)", marketShort: "Kibos", distance: 290, transportPerHead: 8.5, marketFeePct: 1, reliability: 3.7 },
  { market: "Eldoret", marketShort: "Eldoret", distance: 270, transportPerHead: 7.8, marketFeePct: 1, reliability: 4.0 },
  { market: "Nakuru", marketShort: "Nakuru", distance: 140, transportPerHead: 4.0, marketFeePct: 1, reliability: 3.9 },
  { market: "Thika", marketShort: "Thika", distance: 15, transportPerHead: 0.5, marketFeePct: 0, reliability: 4.2 },
];

export interface CropPriceRow {
  crop: string;
  unit: string;
  swahili: string;
  icon: string;
  prices: Record<string, [number, number]>; // market -> [low,high]
  trend: "up" | "down" | "stable";
  changePct: number;
  weekHigh: number;
  weekLow: number;
  tip: string;
}

export const CROP_PRICES: CropPriceRow[] = [
  {
    crop: "Cabbage", unit: "Head", swahili: "Kabeji", icon: "🥬",
    prices: {
      "Nairobi (Marikiti)": [25, 40], "Nairobi (Wakulima)": [20, 35], "Kangemi": [25, 40],
      "Mombasa (Kongowea)": [20, 35], "Kisumu (Kibos)": [25, 35], "Eldoret": [30, 45],
      "Nakuru": [25, 40], "Thika": [20, 35],
    },
    trend: "up", changePct: 8, weekHigh: 45, weekLow: 22,
    tip: "Prices climbing as dry season supply tightens — hold 2 weeks for peak.",
  },
  {
    crop: "Sukuma Wiki", unit: "Bundle", swahili: "Sukuma Wiki", icon: "🥬",
    prices: {
      "Nairobi (Marikiti)": [10, 20], "Nairobi (Wakulima)": [8, 15], "Kangemi": [10, 20],
      "Mombasa (Kongowea)": [8, 15], "Kisumu (Kibos)": [10, 15], "Eldoret": [10, 20],
      "Nakuru": [10, 18], "Thika": [8, 15],
    },
    trend: "stable", changePct: 0, weekHigh: 20, weekLow: 8,
    tip: "Stable year-round; irrigate to keep leaf size consistent for premium.",
  },
  {
    crop: "Tomato", unit: "64kg crate", swahili: "Nyanya", icon: "🍅",
    prices: {
      "Nairobi (Marikiti)": [2500, 5000], "Nairobi (Wakulima)": [2000, 4500], "Kangemi": [2800, 5500],
      "Mombasa (Kongowea)": [2000, 4500], "Kisumu (Kibos)": [2500, 4000], "Eldoret": [2000, 3500],
      "Nakuru": [2200, 4000], "Thika": [2500, 5000],
    },
    trend: "up", changePct: 12, weekHigh: 5500, weekLow: 2200,
    tip: "Rain damage in Makueni has lifted prices — harvest mature pink for KES 5,000.",
  },
  {
    crop: "Onion", unit: "50kg bag", swahili: "Kitunguu", icon: "🧅",
    prices: {
      "Nairobi (Marikiti)": [4000, 7000], "Nairobi (Wakulima)": [3500, 6500], "Kangemi": [4500, 7500],
      "Mombasa (Kongowea)": [3000, 6000], "Kisumu (Kibos)": [3500, 6000], "Eldoret": [3500, 6500],
      "Nakuru": [4000, 7000], "Thika": [4000, 7000],
    },
    trend: "down", changePct: -5, weekHigh: 7500, weekLow: 3200,
    tip: "Tanzanian imports arriving — sell stored stock before further dip.",
  },
  {
    crop: "Maize", unit: "90kg bag", swahili: "Mahindi", icon: "🌽",
    prices: {
      "Nairobi (Marikiti)": [3000, 4500], "Nairobi (Wakulima)": [3000, 4000], "Kangemi": [3200, 4500],
      "Mombasa (Kongowea)": [3200, 4000], "Kisumu (Kibos)": [3000, 4200], "Eldoret": [3200, 4500],
      "Nakuru": [3000, 4200], "Thika": [3000, 4000],
    },
    trend: "stable", changePct: 2, weekHigh: 4500, weekLow: 3000,
    tip: "NCPB floor price at KES 3,200 provides a backstop; consider selling to them.",
  },
  {
    crop: "Beans", unit: "90kg bag", swahili: "Maharage", icon: "🫘",
    prices: {
      "Nairobi (Marikiti)": [6000, 9000], "Nairobi (Wakulima)": [5500, 8500], "Kangemi": [6500, 9500],
      "Mombasa (Kongowea)": [5500, 8000], "Kisumu (Kibos)": [5000, 7500], "Eldoret": [6000, 8500],
      "Nakuru": [5500, 8000], "Thika": [6000, 8500],
    },
    trend: "up", changePct: 6, weekHigh: 9500, weekLow: 5200,
    tip: "Shortage across Eastern province pushing prices; Rosecoco at premium.",
  },
  {
    crop: "Potatoes", unit: "50kg bag", swahili: "Viazi", icon: "🥔",
    prices: {
      "Nairobi (Marikiti)": [1500, 2500], "Nairobi (Wakulima)": [1200, 2200], "Kangemi": [1500, 2500],
      "Mombasa (Kongowea)": [1800, 3000], "Kisumu (Kibos)": [1500, 2500], "Eldoret": [1500, 2200],
      "Nakuru": [1400, 2200], "Thika": [1500, 2500],
    },
    trend: "down", changePct: -8, weekHigh: 2800, weekLow: 1200,
    tip: "Glut from Kinangop harvest; store in dark cool place or sell at Kongowea.",
  },
  {
    crop: "Carrot", unit: "50kg bag", swahili: "Karoti", icon: "🥕",
    prices: {
      "Nairobi (Marikiti)": [2000, 3500], "Nairobi (Wakulima)": [1800, 3000], "Kangemi": [2200, 3800],
      "Mombasa (Kongowea)": [2000, 3500], "Kisumu (Kibos)": [1800, 3000], "Eldoret": [2000, 3200],
      "Nakuru": [2000, 3500], "Thika": [2000, 3000],
    },
    trend: "up", changePct: 4, weekHigh: 3800, weekLow: 1800,
    tip: "Steady demand from hotels; wash and grade for KES 3,500+.",
  },
  {
    crop: "Capsicum", unit: "Kg", swahili: "Pilipili hoho", icon: "🫑",
    prices: {
      "Nairobi (Marikiti)": [40, 80], "Nairobi (Wakulima)": [35, 70], "Kangemi": [45, 90],
      "Mombasa (Kongowea)": [30, 60], "Kisumu (Kibos)": [35, 70], "Eldoret": [35, 65],
      "Nakuru": [40, 80], "Thika": [40, 85],
    },
    trend: "stable", changePct: 1, weekHigh: 90, weekLow: 30,
    tip: "Coloured (red/yellow) capsicum earns 2x green; consider leaving to ripen.",
  },
  {
    crop: "Avocado (Hass)", unit: "Piece", swahili: "Parachichi", icon: "🥑",
    prices: {
      "Nairobi (Marikiti)": [15, 50], "Nairobi (Wakulima)": [12, 45], "Kangemi": [18, 55],
      "Mombasa (Kongowea)": [10, 30], "Kisumu (Kibos)": [12, 35], "Eldoret": [15, 40],
      "Nakuru": [15, 45], "Thika": [15, 50],
    },
    trend: "up", changePct: 15, weekHigh: 55, weekLow: 10,
    tip: "Export season opening; size 16-18 to packhouse earns KES 45+ per piece.",
  },
];

/* ------------------------------------------------------------ 10.2 trends */

export interface TrendPoint {
  month: string;
  monthShort: string;
  price: number;
  yearAgo?: number;
  seasonalAvg?: number;
  note?: string;
}

export const CABBAGE_MARIKITI_12M: TrendPoint[] = [
  { month: "January", monthShort: "J", price: 48, yearAgo: 42, seasonalAvg: 45, note: "Peak — dry season low supply" },
  { month: "February", monthShort: "F", price: 42, yearAgo: 40, seasonalAvg: 40 },
  { month: "March", monthShort: "M", price: 35, yearAgo: 32, seasonalAvg: 35, note: "LR planting — supply increases" },
  { month: "April", monthShort: "A", price: 28, yearAgo: 25, seasonalAvg: 30 },
  { month: "May", monthShort: "M", price: 22, yearAgo: 20, seasonalAvg: 24 },
  { month: "June", monthShort: "J", price: 32, yearAgo: 28, seasonalAvg: 28, note: "LR harvest peak ends" },
  { month: "July", monthShort: "J", price: 36, yearAgo: 34, seasonalAvg: 32 },
  { month: "August", monthShort: "A", price: 28, yearAgo: 30, seasonalAvg: 30 },
  { month: "September", monthShort: "S", price: 32, yearAgo: 30, seasonalAvg: 31 },
  { month: "October", monthShort: "O", price: 30, yearAgo: 26, seasonalAvg: 28, note: "SR plantings begin" },
  { month: "November", monthShort: "N", price: 24, yearAgo: 22, seasonalAvg: 25 },
  { month: "December", monthShort: "D", price: 20, yearAgo: 18, seasonalAvg: 22, note: "Festive demand but high supply" },
];

export const TREND_RANGES = {
  "7d": { label: "Last 7 days (daily)", points: 7, interval: "day" },
  "30d": { label: "Last 30 days (daily)", points: 30, interval: "day" },
  "12m": { label: "Last 12 months (weekly)", points: 52, interval: "week" },
  "yoy": { label: "Same period last year", points: 12, interval: "month" },
  "seasonal": { label: "Seasonal pattern (multi-year)", points: 12, interval: "month" },
};

export const PRICE_ALERTS = [
  { id: "a1", crop: "Tomato", market: "Marikiti", threshold: 4500, current: 5000, triggered: true, time: "08:42", trend: "up", phone: true },
  { id: "a2", crop: "Cabbage", market: "Thika", threshold: 35, current: 30, triggered: false, time: "09:14", trend: "up", phone: true },
  { id: "a3", crop: "Avocado", market: "Kangemi", threshold: 45, current: 55, triggered: true, time: "07:20", trend: "up", phone: false },
  { id: "a4", crop: "Potatoes", market: "Marikiti", threshold: 2000, current: 1800, triggered: true, time: "06:55", trend: "down", phone: true },
  { id: "a5", crop: "Beans", market: "Wakulima", threshold: 8000, current: 8500, triggered: true, time: "05:30", trend: "up", phone: false },
  { id: "a6", crop: "Onion", market: "Nakuru", threshold: 5000, current: 5200, triggered: false, time: "09:00", trend: "down", phone: false },
];

/* ------------------------------------------------------------ 10.3 best market */

export interface MarketRecommendation {
  rank: number;
  market: string;
  distanceKm: number;
  pricePerHead: number;
  transportPerHead: number;
  feePerHead: number;
  netPricePerHead: number;
  verdict: "best" | "higher" | "similar" | "far";
  note: string;
  volumeScore: number;
  reliabilityScore: number;
}

export const CABBAGE_MARKET_RECS: MarketRecommendation[] = [
  { rank: 1, market: "Thika", distanceKm: 15, pricePerHead: 30, transportPerHead: 0.5, feePerHead: 0, netPricePerHead: 29.5, verdict: "best", note: "Best — close + good price, low fees", volumeScore: 7, reliabilityScore: 4.2 },
  { rank: 2, market: "Marikiti (Nairobi)", distanceKm: 40, pricePerHead: 35, transportPerHead: 2.0, feePerHead: 0.35, netPricePerHead: 32.65, verdict: "higher", note: "Higher price but more transport and fees", volumeScore: 10, reliabilityScore: 3.5 },
  { rank: 3, market: "Kangemi", distanceKm: 35, pricePerHead: 32, transportPerHead: 1.75, feePerHead: 0.32, netPricePerHead: 29.93, verdict: "similar", note: "Similar net to Marikiti, less volume", volumeScore: 6, reliabilityScore: 3.4 },
  { rank: 4, market: "Wakulima", distanceKm: 42, pricePerHead: 28, transportPerHead: 2.1, feePerHead: 0.28, netPricePerHead: 25.62, verdict: "far", note: "Price too low for the distance", volumeScore: 8, reliabilityScore: 3.8 },
  { rank: 5, market: "Nakuru", distanceKm: 140, pricePerHead: 30, transportPerHead: 4.0, feePerHead: 0.30, netPricePerHead: 25.70, verdict: "far", note: "Too far for same price", volumeScore: 7, reliabilityScore: 3.9 },
  { rank: 6, market: "Eldoret", distanceKm: 270, pricePerHead: 38, transportPerHead: 7.8, feePerHead: 0.38, netPricePerHead: 29.82, verdict: "similar", note: "High price but long haul", volumeScore: 5, reliabilityScore: 4.0 },
];

/* ------------------------------------------------------------ 10.4 buyer directory */

export type BuyerType = "Broker" | "Supermarket" | "Restaurant" | "Exporter" | "Processor" | "Cooperative" | "Online" | "Direct";

export interface Buyer {
  id: string;
  name: string;
  type: BuyerType;
  location: string;
  cropsWanted: string[];
  minQuantity: string;
  paymentTerms: string;
  paymentDays: number;
  contact: string;
  phone: string;
  email?: string;
  rating: number;
  reviewsCount: number;
  lastOrder?: string;
  totalSpent?: number;
  verified: boolean;
  notes: string;
  county: string;
}

export const BUYERS: Buyer[] = [
  {
    id: "b1", name: "Kamau Brokers", type: "Broker", location: "Marikiti Market",
    cropsWanted: ["All vegetables", "Tomato", "Cabbage", "Kale"], minQuantity: "500 kg+",
    paymentTerms: "Cash on delivery", paymentDays: 0, contact: "Kamau Maina", phone: "0712 555 123",
    rating: 3.5, reviewsCount: 28, lastOrder: "18 Sep 2026", totalSpent: 285000, verified: true,
    notes: "Reliable but drives hard on price. Pay on the lorry before offload.", county: "Nairobi",
  },
  {
    id: "b2", name: "Naivas Procurement", type: "Supermarket", location: "Nairobi HQ, Donholm",
    cropsWanted: ["Cabbage", "Tomato", "Kale", "Carrots", "Potatoes"], minQuantity: "1 tonne/week",
    paymentTerms: "30-day invoice", paymentDays: 30, contact: "Procurement Desk", phone: "0701 222 333",
    email: "fresh-produce@naivas.co.ke", rating: 4.0, reviewsCount: 54, verified: true,
    notes: "Requires uniform grading and bar-coded crates; consistent weekly offtake.", county: "Nairobi",
  },
  {
    id: "b3", name: "Tuskys Fresh Division", type: "Supermarket", location: "Nairobi, Mombasa Rd",
    cropsWanted: ["Tomato", "Capsicum", "Onion", "Potatoes"], minQuantity: "800 kg/week",
    paymentTerms: "45-day invoice", paymentDays: 45, contact: "Jane Muthoni", phone: "0733 444 555",
    email: "supply@tuskys.co.ke", rating: 3.6, reviewsCount: 42, lastOrder: "02 Sep 2026", totalSpent: 142000, verified: true,
    notes: "Payment sometimes slips to 60 days — chase weekly.", county: "Nairobi",
  },
  {
    id: "b4", name: "Karen Greens Restaurant", type: "Restaurant", location: "Karen, Nairobi",
    cropsWanted: ["Cabbage", "Herbs", "Spinach", "Managu", "Tomato"], minQuantity: "50–100 heads/week",
    paymentTerms: "Weekly M-Pesa", paymentDays: 7, contact: "Chef Pauline", phone: "0733 888 999",
    rating: 4.8, reviewsCount: 16, lastOrder: "20 Sep 2026", totalSpent: 58000, verified: true,
    notes: "Pays promptly; prefers clean, small heads for salad plates.", county: "Nairobi",
  },
  {
    id: "b5", name: "Vegpro Ltd (Vegcare)", type: "Exporter", location: "Nairobi, Athi River",
    cropsWanted: ["French beans", "Avocado", "Baby corn", "Mange tout", "Snow peas"], minQuantity: "Contract",
    paymentTerms: "45-day invoice", paymentDays: 45, contact: "Outgrower Manager", phone: "020 555 777",
    email: "outgrowers@vegpro.co.ke", rating: 4.5, reviewsCount: 88, verified: true,
    notes: "Requires GlobalG.A.P.; premium prices for export-grade; strict PHI records.", county: "Machakos",
  },
  {
    id: "b6", name: "Butali Sugar Mills", type: "Processor", location: "Kakamega, Butali",
    cropsWanted: ["Sugarcane"], minQuantity: "Per tonne",
    paymentTerms: "Per tonne rate, 30-day", paymentDays: 30, contact: "Weighbridge Office", phone: "0722 666 000",
    rating: 3.8, reviewsCount: 12, verified: false,
    notes: "Factory-registered farmers only; payment via cooperative SACCO.", county: "Kakamega",
  },
  {
    id: "b7", name: "Kiambu Farmers Cooperative", type: "Cooperative", location: "Kiambu Town",
    cropsWanted: ["Mixed vegetables", "Milk", "Avocado", "Potatoes"], minQuantity: "Any",
    paymentTerms: "Weekly settlement", paymentDays: 7, contact: "Secretary", phone: "0722 111 222",
    email: "info@kiambufarmers.coop", rating: 4.2, reviewsCount: 34, lastOrder: "15 Sep 2026", totalSpent: 92000, verified: true,
    notes: "Member-owned; group transport saves KES 0.8/head vs direct haul.", county: "Kiambu",
  },
  {
    id: "b8", name: "Twiga Foods", type: "Online", location: "Nairobi, Baba Dogo",
    cropsWanted: ["All vegetables", "Bananas", "Potatoes", "Onions"], minQuantity: "100 kg+",
    paymentTerms: "7-day payment via app", paymentDays: 7, contact: "Supplier Desk", phone: "0700 333 444",
    email: "suppliers@twiga.co.ke", rating: 4.0, reviewsCount: 120, verified: true,
    notes: "App-based ordering; consistent demand; rejection rate ~5% for size.", county: "Nairobi",
  },
  {
    id: "b9", name: "Kakuzi Ltd", type: "Exporter", location: "Murang'a, Makuyu",
    cropsWanted: ["Hass avocado", "Macadamia", "Blueberries"], minQuantity: "1 acre+ contract",
    paymentTerms: "Market + 10%, monthly", paymentDays: 30, contact: "Outgrower Relations", phone: "0705 777 888",
    email: "outgrowers@kakuzi.co.ke", rating: 4.3, reviewsCount: 22, verified: true,
    notes: "5-year contracts; organic preferred; provides seedlings and agronomist visits.", county: "Murang'a",
  },
  {
    id: "b10", name: "Kenyan Kitchen Ltd", type: "Processor", location: "Nairobi, Industrial Area",
    cropsWanted: ["Tomato", "Onion", "Garlic", "Capsicum"], minQuantity: "200 kg/week",
    paymentTerms: "14-day invoice", paymentDays: 14, contact: "Supply Chain", phone: "0719 666 777",
    rating: 4.1, reviewsCount: 19, lastOrder: "10 Sep 2026", totalSpent: 68000, verified: true,
    notes: "Buys Grade B tomatoes for processing at KES 40/kg min; suitable for second grade.", county: "Nairobi",
  },
];

/* ------------------------------------------------------------ 10.5 sales planner */

export interface SalesScenario {
  id: string;
  label: string;
  swahili: string;
  quantity: number;
  split?: { label: string; pct: number; price: number }[];
  pricePerHead: number;
  grossRevenue: number;
  transport: number;
  marketFees: number;
  netRevenue: number;
  vsBaseline: number;
  risk: "low" | "medium" | "high";
  aiPick?: boolean;
  note: string;
}

export const SALES_SCENARIOS: SalesScenario[] = [
  {
    id: "s1", label: "Sell all at Marikiti", swahili: "Uza Marikiti yote",
    quantity: 14500, pricePerHead: 30, grossRevenue: 435000, transport: 29000, marketFees: 4350,
    netRevenue: 401650, vsBaseline: 0, risk: "low",
    note: "Simple, fast, broker handles everything. Baseline option.",
  },
  {
    id: "s2", label: "Split 50% Marikiti + 50% direct restaurants", swahili: "Gawanya: nusu soko, nusu migahawa",
    quantity: 14500,
    split: [
      { label: "Marikiti 50%", pct: 50, price: 30 },
      { label: "Restaurants 50%", pct: 50, price: 35 },
    ],
    pricePerHead: 32.5, grossRevenue: 471250, transport: 14500, marketFees: 2175,
    netRevenue: 454575, vsBaseline: 52925, risk: "medium",
    note: "Requires two delivery runs and direct relationships with chefs.",
  },
  {
    id: "s3", label: "Sell all direct to restaurants", swahili: "Uza migahawa yote",
    quantity: 14500, pricePerHead: 35, grossRevenue: 507500, transport: 7250, marketFees: 0,
    netRevenue: 500250, vsBaseline: 98600, risk: "high",
    note: "Top price but you need 40+ restaurant buyers; small weekly offtake per buyer.",
  },
  {
    id: "s4", label: "Store 2 weeks, sell at peak", swahili: "Hifadhi wiki 2, uza bei ya juu",
    quantity: 14500, pricePerHead: 40, grossRevenue: 580000, transport: 29000, marketFees: 5800,
    netRevenue: 545200, vsBaseline: 143550, risk: "medium", aiPick: true,
    note: "Cool storage KES 8,000; AI predicts +8 pts rise by Jan 29; 3% spoilage risk in shade net.",
  },
];

/* ------------------------------------------------------------ 10.6 sales records */

export interface SaleRecord {
  id: string;
  date: string;
  dateIso: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  buyer: string;
  buyerPhone: string;
  paymentMethod: "M-Pesa" | "Cash" | "Bank" | "Invoice";
  mpesaReceipt?: string;
  paymentStatus: "Received" | "Pending" | "Partial" | "Overdue";
  transportCost: number;
  marketFees: number;
  netIncome: number;
  qualityGrade: "A" | "B" | "C";
  notes: string;
  recordedBy: string;
  plot: string;
}

export const SALE_RECORDS: SaleRecord[] = [
  {
    id: "sal-001", date: "15 Jan 2027", dateIso: "2027-01-15", crop: "Cabbage", variety: "Gloria F1",
    quantity: 5000, unit: "Head", pricePerUnit: 30, totalAmount: 150000,
    buyer: "Kamau Brokers, Marikiti", buyerPhone: "0712 555 123", paymentMethod: "M-Pesa",
    mpesaReceipt: "SHK7PQ2RT", paymentStatus: "Received", transportCost: 10000, marketFees: 1500,
    netIncome: 138500, qualityGrade: "A",
    notes: "Buyer complained about size variation — sort better next time.",
    recordedBy: "Mary Wanjiku", plot: "Plot 1",
  },
  {
    id: "sal-002", date: "12 Sep 2026", dateIso: "2026-09-12", crop: "Tomato", variety: "Roma VF",
    quantity: 240, unit: "64kg crate", pricePerUnit: 4800, totalAmount: 1152000,
    buyer: "Naivas Procurement", buyerPhone: "0701 222 333", paymentMethod: "Invoice",
    paymentStatus: "Received", transportCost: 8500, marketFees: 0,
    netIncome: 1143500, qualityGrade: "A",
    notes: "Paid 28 days after delivery; Naivas invoice NV-2026-4471.",
    recordedBy: "Mary Wanjiku", plot: "Plot 2",
  },
  {
    id: "sal-003", date: "08 Sep 2026", dateIso: "2026-09-08", crop: "Kale", variety: "Thousand Head",
    quantity: 180, unit: "Bundle", pricePerUnit: 15, totalAmount: 2700,
    buyer: "Karen Greens Restaurant", buyerPhone: "0733 888 999", paymentMethod: "M-Pesa",
    mpesaReceipt: "QGR4MK9VX", paymentStatus: "Received", transportCost: 1200, marketFees: 0,
    netIncome: 1500, qualityGrade: "A",
    notes: "Weekly delivery; Chef Pauline asks for extra 20 bundles next week.",
    recordedBy: "Mary Wanjiku", plot: "Plot 3",
  },
  {
    id: "sal-004", date: "02 Sep 2026", dateIso: "2026-09-02", crop: "Potato", variety: "Shangi",
    quantity: 12, unit: "50kg bag", pricePerUnit: 2200, totalAmount: 26400,
    buyer: "Twiga Foods", buyerPhone: "0700 333 444", paymentMethod: "Bank",
    paymentStatus: "Received", transportCost: 1800, marketFees: 0,
    netIncome: 24600, qualityGrade: "B",
    notes: "App delivery; 1 bag rejected for greening, replaced next day.",
    recordedBy: "Mary Wanjiku", plot: "Plot 4",
  },
  {
    id: "sal-005", date: "28 Aug 2026", dateIso: "2026-08-28", crop: "Maize", variety: "H6213",
    quantity: 18, unit: "90kg bag", pricePerUnit: 3500, totalAmount: 63000,
    buyer: "Kiambu Farmers Cooperative", buyerPhone: "0722 111 222", paymentMethod: "M-Pesa",
    mpesaReceipt: "PLK2ZR6NY", paymentStatus: "Received", transportCost: 2500, marketFees: 630,
    netIncome: 59870, qualityGrade: "A",
    notes: "Deductions: cooperative cess 1%. Sold at SGR satellite depot.",
    recordedBy: "Peter (farm hand)", plot: "Plot 5",
  },
  {
    id: "sal-006", date: "20 Aug 2026", dateIso: "2026-08-20", crop: "Cabbage", variety: "Gloria F1",
    quantity: 2000, unit: "Head", pricePerUnit: 28, totalAmount: 56000,
    buyer: "Kamau Brokers, Marikiti", buyerPhone: "0712 555 123", paymentMethod: "Cash",
    paymentStatus: "Received", transportCost: 4000, marketFees: 560,
    netIncome: 51440, qualityGrade: "B",
    notes: "Slightly small heads from edge rows; priced down KES 2.",
    recordedBy: "Mary Wanjiku", plot: "Plot 1",
  },
  {
    id: "sal-007", date: "15 Aug 2026", dateIso: "2026-08-15", crop: "Avocado (Hass)", variety: "Hass",
    quantity: 800, unit: "Piece", pricePerUnit: 38, totalAmount: 30400,
    buyer: "Vegpro Ltd", buyerPhone: "020 555 777", paymentMethod: "Invoice",
    paymentStatus: "Pending", transportCost: 1500, marketFees: 0,
    netIncome: 28900, qualityGrade: "A",
    notes: "Export grade, size 16; invoice VP-2026-8842, due 29 Sep.",
    recordedBy: "Mary Wanjiku", plot: "Plot 9 (orchard)",
  },
  {
    id: "sal-008", date: "10 Aug 2026", dateIso: "2026-08-10", crop: "Beans", variety: "Rosecoco",
    quantity: 8, unit: "90kg bag", pricePerUnit: 7500, totalAmount: 60000,
    buyer: "Kangemi Market (Wanjiku Traders)", buyerPhone: "0720 333 444", paymentMethod: "M-Pesa",
    mpesaReceipt: "MKB8WP4QL", paymentStatus: "Received", transportCost: 3000, marketFees: 600,
    netIncome: 56400, qualityGrade: "A",
    notes: "Rosecoco premium at KES 7,500; dried to 12% moisture before sale.",
    recordedBy: "Mary Wanjiku", plot: "Plot 8",
  },
  {
    id: "sal-009", date: "03 Aug 2026", dateIso: "2026-08-03", crop: "Spinach", variety: "Fordhook Giant",
    quantity: 60, unit: "Bundle", pricePerUnit: 18, totalAmount: 1080,
    buyer: "WhatsApp group (direct)", buyerPhone: "0715 000 111", paymentMethod: "M-Pesa",
    mpesaReceipt: "DTB5KR2HX", paymentStatus: "Received", transportCost: 0, marketFees: 0,
    netIncome: 1080, qualityGrade: "A",
    notes: "Farm-gate pickup; neighbour Nduta forwarded to her chama.",
    recordedBy: "Mary Wanjiku", plot: "Plot 6",
  },
  {
    id: "sal-010", date: "28 Jul 2026", dateIso: "2026-07-28", crop: "Carrot", variety: "Nantes",
    quantity: 10, unit: "50kg bag", pricePerUnit: 2800, totalAmount: 28000,
    buyer: "Tuskys Fresh Division", buyerPhone: "0733 444 555", paymentMethod: "Invoice",
    paymentStatus: "Overdue", transportCost: 2200, marketFees: 0,
    netIncome: 25800, qualityGrade: "A",
    notes: "Invoice overdue by 12 days — flagged for chase. Escalate to area manager.",
    recordedBy: "Mary Wanjiku", plot: "Plot 4",
  },
];

/* ------------------------------------------------------------ 10.7 contracts */

export interface Contract {
  id: string;
  title: string;
  company: string;
  crop: string;
  variety: string;
  acreage: string;
  duration: string;
  priceGuarantee: string;
  requirements: string[];
  countyMatch: boolean;
  cropMatch: boolean;
  applicationDeadline: string;
  status: "open" | "applied" | "awarded" | "rejected";
  rating: number;
  applicants: number;
  contactPerson: string;
  phone: string;
  email: string;
}

export const CONTRACTS: Contract[] = [
  {
    id: "c1", title: "French Beans Export Supply", company: "Vegpro Ltd (Vegcare)",
    crop: "French beans", variety: "Julien", acreage: "0.5+ acre", duration: "6 months",
    priceGuarantee: "KES 80/kg",
    requirements: ["GlobalG.A.P. certification", "Julien variety only", "Drip irrigation preferred", "Spray records 2 yr"],
    countyMatch: true, cropMatch: false, applicationDeadline: "15 Oct 2026",
    status: "open", rating: 4.5, applicants: 48,
    contactPerson: "Outgrower Manager", phone: "020 555 777", email: "outgrowers@vegpro.co.ke",
  },
  {
    id: "c2", title: "Sugarcane Supply Agreement", company: "Butali Sugar Mills",
    crop: "Sugarcane", variety: "CO 421 / EAK 73-325", acreage: "2+ acres", duration: "4 years (ratoon cycle)",
    priceGuarantee: "KES 4,200/tonne",
    requirements: ["Registered with factory zone", "Recommended variety only", "Weeding schedule twice/year"],
    countyMatch: false, cropMatch: false, applicationDeadline: "Rolling",
    status: "open", rating: 3.8, applicants: 22,
    contactPerson: "Zone Extension Officer", phone: "0722 666 000", email: "outgrowers@butalisugar.co.ke",
  },
  {
    id: "c3", title: "Hass Avocado Offtake", company: "Kakuzi Ltd",
    crop: "Avocado", variety: "Hass", acreage: "1+ acre", duration: "5 years",
    priceGuarantee: "Market price + 10%",
    requirements: ["Organic certification preferred", "Grade 14-20 only", "Planting material supplied by Kakuzi", "12 tree spacing"],
    countyMatch: true, cropMatch: true, applicationDeadline: "30 Nov 2026",
    status: "applied", rating: 4.3, applicants: 120,
    contactPerson: "Outgrower Relations", phone: "0705 777 888", email: "outgrowers@kakuzi.co.ke",
  },
  {
    id: "c4", title: "Processing Tomato Supply", company: "Kenyan Kitchen Ltd",
    crop: "Tomato", variety: "Roma VF / Cal J", acreage: "0.5+ acre", duration: "1 year (renewable)",
    priceGuarantee: "KES 40/kg minimum",
    requirements: ["Consistent supply 200 kg/week minimum", "Spray records", "Cool-box delivery", "MRL testing on request"],
    countyMatch: true, cropMatch: true, applicationDeadline: "30 Sep 2026",
    status: "open", rating: 4.1, applicants: 34,
    contactPerson: "Supply Chain Lead", phone: "0719 666 777", email: "supply@kenyankitchen.co.ke",
  },
  {
    id: "c5", title: "Wakulima Horticulture Export", company: "Wakulima Exporters EA",
    crop: "Mange tout / Sugar snaps", variety: "Norli / Sugar Ann", acreage: "0.25+ acre", duration: "8 months",
    priceGuarantee: "KES 180/kg",
    requirements: ["Net shed mandatory", "Daily harvest", "Cold room at packing", "HACCP training provided"],
    countyMatch: true, cropMatch: false, applicationDeadline: "01 Oct 2026",
    status: "open", rating: 4.4, applicants: 18,
    contactPerson: "Field Coordinator", phone: "0715 222 333", email: "growers@wakulima-ea.com",
  },
  {
    id: "c6", title: "Potato Supply (Crisping)", company: "Tropical Heat & Snacks",
    crop: "Potato", variety: "Shangi / Dutch Robjin", acreage: "1+ acre", duration: "Seasonal",
    priceGuarantee: "KES 38/kilogram (large)",
    requirements: ["Specific gravity ≥ 1.080", "Low reducing sugars", "Contract storage period"],
    countyMatch: true, cropMatch: true, applicationDeadline: "20 Oct 2026",
    status: "open", rating: 4.0, applicants: 26,
    contactPerson: "Raw Materials", phone: "0721 888 999", email: "rawmat@tropicalheat.co.ke",
  },
];

/* ------------------------------------------------------------ extras */

export const TRANSPORT_OPTIONS = [
  { id: "t1", mode: "Own pickup", costPerKm: 0, note: "Small Suzuki — max 1,000 heads", leadTime: "Same day" },
  { id: "t2", mode: "Boda-boda (Kifaru)", costPerKm: 30, note: "Up to 400 kg, suitable for direct restaurant runs", leadTime: "1 hour" },
  { id: "t3", mode: "Cooperative lorry (Kiambu Co-op)", costPerKm: 80, note: "Shared load, 8-tonne Isuzu, SGR point runs Tues/Fridays", leadTime: "2 days notice" },
  { id: "t4", mode: "Hired lorry (1.5T)", costPerKm: 60, note: "Isuzu Elf, up to 6,000 heads, returns farm-gate", leadTime: "Same day" },
  { id: "t5", mode: "Twiga pickup", costPerKm: 0, note: "Free pickup from collection point Githunguri stage", leadTime: "Book 24hrs" },
];

export const PRICE_HISTORY_7D_CABBAGE = [
  { day: "Mon 16", marikiti: 30, thika: 28, kangemi: 32, volume: 12000 },
  { day: "Tue 17", marikiti: 30, thika: 28, kangemi: 32, volume: 13500 },
  { day: "Wed 18", marikiti: 32, thika: 28, kangemi: 32, volume: 15800 },
  { day: "Thu 19", marikiti: 32, thika: 30, kangemi: 34, volume: 14200 },
  { day: "Fri 20", marikiti: 33, thika: 30, kangemi: 34, volume: 18000 },
  { day: "Sat 21", marikiti: 35, thika: 30, kangemi: 35, volume: 22000 },
  { day: "Sun 22", marikiti: 35, thika: 30, kangemi: 35, volume: 9800 },
];

export const MARKET_FAQ = [
  { q: "Why does Marikiti have a wider price range than other markets?", a: "Marikiti is the largest wholesale market in East Africa. The low end is early-morning broker-to-broker trades while the high end is late-morning retail restocks. Time your arrival between 6-7am for best bulk prices." },
  { q: "How do I avoid being cheated by brokers?", a: "Always agree on the unit price per head/crate (not per kg) before offloading, get payment before offloading when possible, and use the GrowMO receipt log with broker name and plate number." },
  { q: "When is the best day to sell?", a: "Wednesday-Friday is generally best for urban restocking before the weekend. Avoid Mondays as many markets are glutted from overnight rural deliveries." },
  { q: "Are online buyers like Twiga reliable?", a: "Twiga pays within 7 days and the app tracks every rejection. The trade-off is slightly lower prices than direct retail, and ~5% rejection for size/grade issues." },
  { q: "How do I qualify for export contracts?", a: "Most exporters require GlobalG.A.P. certification, 0.5+ acres dedicated to the export crop, a spray diary covering 2 years, and (for beans/peas) a net shed. Vegpro and Kakuzi run free certification support for qualifying outgrowers." },
  { q: "What does \"indicative price\" mean?", a: "Prices shown are from daily KAMIS (Kenya Agricultural Market Information System) feeds plus cooperative reports. Actual transacted price may vary by KES 2-5 depending on quality, time of day and relationship." },
  { q: "Can I set a price alert?", a: "Yes — use the bell icon next to any crop to set a threshold for SMS or in-app alerts. You have 4 active alerts." },
  { q: "How is net price calculated?", a: "Net price = market price − transport per unit − market fees/cess. We use a per-km rate of KES 35/1,000 heads for hired transport, and cooperative cess of 1% where applicable." },
];

export const MARKET_GLOSSARY = [
  { term: "Cess", def: "Market entry fee charged by county governments, usually 1-2% of value." },
  { term: "KAMIS", def: "Kenya Agricultural Market Information System — the government's daily price feed." },
  { term: "Offtake", def: "The quantity a buyer commits to purchase over a period." },
  { term: "GlobalG.A.P.", def: "International farm certification required by EU supermarkets and most Kenyan exporters." },
  { term: "MRL", def: "Maximum Residue Level — the legal pesticide residue limit for produce." },
  { term: "PHI", def: "Pre-Harvest Interval — days you must wait between last spray and harvest." },
  { term: "Outgrower", def: "A farmer who grows under contract for a company that supplies inputs and buys output." },
  { term: "Ratoon", def: "A second or subsequent crop regrown from the root-stock of the previous planting (used for sugarcane)." },
];

export const MARKET_SETTINGS_DEFAULTS = {
  smsAlerts: true,
  priceThresholdPct: 10,
  defaultMarket: "Thika",
  shareReceiptsWhatsApp: true,
  autoRecordSales: true,
  indicativePriceDisclaimer: true,
  distanceUnit: "km",
  preferredPayment: "M-Pesa",
  reminderHarvestWindow: 3,
  weekendDelivery: false,
};

export function marketTotals() {
  const salesYtd = SALE_RECORDS.reduce((s, r) => s + r.netIncome, 0);
  const grossYtd = SALE_RECORDS.reduce((s, r) => s + r.totalAmount, 0);
  const transportYtd = SALE_RECORDS.reduce((s, r) => s + r.transportCost, 0);
  const feesYtd = SALE_RECORDS.reduce((s, r) => s + r.marketFees, 0);
  const pending = SALE_RECORDS.filter((r) => r.paymentStatus === "Pending" || r.paymentStatus === "Overdue")
    .reduce((s, r) => s + r.totalAmount, 0);
  return { salesYtd, grossYtd, transportYtd, feesYtd, pending };
}
