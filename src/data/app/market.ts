/* ============================================================================
   PAGE 10 — MARKET & SALES (ENHANCED)
   Market data for Mary Wanjiku's farm, Githunguri, Kiambu County.
   Realistic Kenyan demo data: KES, 07XX phones, real markets, crops, buyers.
   ========================================================================== */
import {
  BarChart3,
  Building2,
  FileText,
  Globe,
  Handshake,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Star,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────────────── */
export const MARKET_CONTEXT = {
  farmer: "Mary Wanjiku",
  farm: "Wanjiku Mixed Farm",
  location: "Githunguri, Kiambu County",
  phone: "0712 345 678",
  today: "13 Nov 2026",
  season: "Short Rains 2026",
};

export type MarketTrend = "up" | "down" | "stable";
export type PriceStatus = "received" | "pending" | "forecast";

/* ── 10.1 Live Market Prices ─────────────────────────────────────────────── */
export interface MarketPriceRow {
  id: string;
  crop: string;
  swahili: string;
  unit: string;
  marikiti: string;
  wakulima: string;
  kangemi: string;
  kongowea: string;
  kisumu: string;
  eldoret: string;
  nakuru: string;
  thika: string;
  trend: MarketTrend;
  lastUpdate: string;
  bestMarket: string;
  advice: string;
}

export const MARKET_PRICES: MarketPriceRow[] = [
  {
    id: "mp-01", crop: "Cabbage", swahili: "Kabichi", unit: "per head",
    marikiti: "25–40", wakulima: "20–35", kangemi: "25–40", kongowea: "20–35",
    kisumu: "25–35", eldoret: "30–45", nakuru: "25–40", thika: "20–35",
    trend: "stable", lastUpdate: "Today 08:00", bestMarket: "Eldoret",
    advice: "Supply increasing — prices may dip in December. Sell before Dec 15.",
  },
  {
    id: "mp-02", crop: "Tomato", swahili: "Nyanya", unit: "64kg crate",
    marikiti: "2,500–5,000", wakulima: "2,000–4,500", kangemi: "2,800–5,500",
    kongowea: "2,000–4,500", kisumu: "2,500–4,000", eldoret: "2,000–3,500",
    nakuru: "2,200–4,000", thika: "2,500–5,000",
    trend: "up", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Dry season starting — less supply, prices rising. Hold if possible.",
  },
  {
    id: "mp-03", crop: "Maize", swahili: "Mahindi", unit: "90kg bag",
    marikiti: "3,000–4,500", wakulima: "3,000–4,000", kangemi: "3,200–4,500",
    kongowea: "3,200–4,000", kisumu: "3,000–4,200", eldoret: "3,200–4,500",
    nakuru: "3,000–4,200", thika: "3,000–4,000",
    trend: "down", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Rift Valley harvest flooding market. Store 2–3 months for better prices.",
  },
  {
    id: "mp-04", crop: "Beans (Rosecoco)", swahili: "Maharagwe", unit: "90kg bag",
    marikiti: "6,000–9,000", wakulima: "5,500–8,500", kangemi: "6,500–9,500",
    kongowea: "5,500–8,000", kisumu: "5,000–7,500", eldoret: "6,000–8,500",
    nakuru: "5,500–8,000", thika: "6,000–8,500",
    trend: "up", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Off-season supply is tight. Sell now for top price.",
  },
  {
    id: "mp-05", crop: "Potatoes", swahili: "Viazi", unit: "50kg bag",
    marikiti: "1,500–2,500", wakulima: "1,200–2,200", kangemi: "1,500–2,500",
    kongowea: "1,800–3,000", kisumu: "1,500–2,500", eldoret: "1,500–2,200",
    nakuru: "1,400–2,200", thika: "1,500–2,500",
    trend: "stable", lastUpdate: "Today 08:00", bestMarket: "Kongowea",
    advice: "Mombasa pays premium for clean graded stock. Invest in sorting.",
  },
  {
    id: "mp-06", crop: "Sukuma Wiki", swahili: "Sukuma Wiki", unit: "per bundle",
    marikiti: "10–20", wakulima: "8–15", kangemi: "10–20", kongowea: "8–15",
    kisumu: "10–15", eldoret: "10–20", nakuru: "10–18", thika: "8–15",
    trend: "stable", lastUpdate: "Today 08:00", bestMarket: "Eldoret",
    advice: "Consistent demand year-round. Sell fresh within 24 hours.",
  },
  {
    id: "mp-07", crop: "Onions", swahili: "Vitunguu", unit: "50kg bag",
    marikiti: "4,000–7,000", wakulima: "3,500–6,500", kangemi: "4,500–7,500",
    kongowea: "3,000–6,000", kisumu: "3,500–6,000", eldoret: "3,500–6,500",
    nakuru: "4,000–7,000", thika: "4,000–7,000",
    trend: "up", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Prices rising with dry season. Store well for peak in January.",
  },
  {
    id: "mp-08", crop: "Carrots", swahili: "Karoti", unit: "50kg bag",
    marikiti: "2,000–3,500", wakulima: "1,800–3,000", kangemi: "2,200–3,800",
    kongowea: "2,000–3,500", kisumu: "1,800–3,000", eldoret: "2,000–3,200",
    nakuru: "2,000–3,500", thika: "2,000–3,000",
    trend: "down", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Nyandarua supply increasing. Sell quickly — carrots don't store long.",
  },
  {
    id: "mp-09", crop: "Capsicum", swahili: "Hoho", unit: "per kg",
    marikiti: "40–80", wakulima: "35–70", kangemi: "45–90", kongowea: "30–60",
    kisumu: "35–70", eldoret: "35–65", nakuru: "40–80", thika: "40–85",
    trend: "up", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Greenhouse capsicum fetches premium. Grade and pack carefully.",
  },
  {
    id: "mp-10", crop: "Avocado (Hass)", swahili: "Parachichi", unit: "per piece",
    marikiti: "15–50", wakulima: "12–45", kangemi: "18–55", kongowea: "10–30",
    kisumu: "12–35", eldoret: "15–40", nakuru: "15–45", thika: "15–50",
    trend: "up", lastUpdate: "Today 08:00", bestMarket: "Kangemi",
    advice: "Export demand pushing prices up. Avocado collection season strong.",
  },
];

/* ── 10.2 Price Trend Data ───────────────────────────────────────────────── */
export interface PriceTrendPoint {
  date: string;
  price: number;
}

export interface PriceTrend {
  id: string;
  crop: string;
  market: string;
  unit: string;
  current: number;
  weekAgo: number;
  monthAgo: number;
  yearAgo: number;
  trend: MarketTrend;
  seasonPeak: string;
  seasonLow: string;
  insight: string;
  data7d: PriceTrendPoint[];
  data30d: PriceTrendPoint[];
}

export const PRICE_TRENDS: PriceTrend[] = [
  {
    id: "pt-01", crop: "Cabbage", market: "Marikiti", unit: "per head",
    current: 32, weekAgo: 30, monthAgo: 28, yearAgo: 25,
    trend: "up", seasonPeak: "Jan–Feb (KES 40)", seasonLow: "Jun–Aug (KES 20)",
    insight: "Prices peak in Jan–Feb during dry season. Plant in Oct–Nov for peak harvest timing.",
    data7d: [
      { date: "Nov 7", price: 28 }, { date: "Nov 8", price: 30 }, { date: "Nov 9", price: 30 },
      { date: "Nov 10", price: 31 }, { date: "Nov 11", price: 32 }, { date: "Nov 12", price: 32 }, { date: "Nov 13", price: 32 },
    ],
    data30d: [
      { date: "Oct 14", price: 24 }, { date: "Oct 17", price: 25 }, { date: "Oct 20", price: 25 },
      { date: "Oct 23", price: 26 }, { date: "Oct 26", price: 27 }, { date: "Oct 29", price: 27 },
      { date: "Nov 1", price: 28 }, { date: "Nov 4", price: 28 }, { date: "Nov 7", price: 28 },
      { date: "Nov 10", price: 31 }, { date: "Nov 13", price: 32 },
    ],
  },
  {
    id: "pt-02", crop: "Tomato", market: "Kangemi", unit: "64kg crate",
    current: 4200, weekAgo: 3800, monthAgo: 3500, yearAgo: 3000,
    trend: "up", seasonPeak: "Dec–Feb (KES 5,500)", seasonLow: "Apr–Jun (KES 2,000)",
    insight: "Dry season supply drops push prices up. Greenhouse farmers benefit most.",
    data7d: [
      { date: "Nov 7", price: 3800 }, { date: "Nov 8", price: 3900 }, { date: "Nov 9", price: 4000 },
      { date: "Nov 10", price: 4000 }, { date: "Nov 11", price: 4100 }, { date: "Nov 12", price: 4100 }, { date: "Nov 13", price: 4200 },
    ],
    data30d: [
      { date: "Oct 14", price: 3200 }, { date: "Oct 17", price: 3300 }, { date: "Oct 20", price: 3400 },
      { date: "Oct 23", price: 3500 }, { date: "Oct 26", price: 3500 }, { date: "Oct 29", price: 3600 },
      { date: "Nov 1", price: 3700 }, { date: "Nov 4", price: 3700 }, { date: "Nov 7", price: 3800 },
      { date: "Nov 10", price: 4000 }, { date: "Nov 13", price: 4200 },
    ],
  },
  {
    id: "pt-03", crop: "Maize", market: "Eldoret", unit: "90kg bag",
    current: 3800, weekAgo: 3900, monthAgo: 4100, yearAgo: 4200,
    trend: "down", seasonPeak: "May–Jul (KES 4,500)", seasonLow: "Oct–Dec (KES 3,000)",
    insight: "Rift Valley harvest season pushing prices down. Store for 2–3 months for recovery.",
    data7d: [
      { date: "Nov 7", price: 3900 }, { date: "Nov 8", price: 3900 }, { date: "Nov 9", price: 3850 },
      { date: "Nov 10", price: 3850 }, { date: "Nov 11", price: 3800 }, { date: "Nov 12", price: 3800 }, { date: "Nov 13", price: 3800 },
    ],
    data30d: [
      { date: "Oct 14", price: 4100 }, { date: "Oct 17", price: 4100 }, { date: "Oct 20", price: 4050 },
      { date: "Oct 23", price: 4000 }, { date: "Oct 26", price: 4000 }, { date: "Oct 29", price: 3950 },
      { date: "Nov 1", price: 3950 }, { date: "Nov 4", price: 3900 }, { date: "Nov 7", price: 3900 },
      { date: "Nov 10", price: 3850 }, { date: "Nov 13", price: 3800 },
    ],
  },
  {
    id: "pt-04", crop: "Beans", market: "Nakuru", unit: "90kg bag",
    current: 7800, weekAgo: 7500, monthAgo: 7200, yearAgo: 6500,
    trend: "up", seasonPeak: "Nov–Jan (KES 9,000)", seasonLow: "Apr–Jun (KES 5,500)",
    insight: "Off-season prices climbing. Good time to sell stored beans.",
    data7d: [
      { date: "Nov 7", price: 7500 }, { date: "Nov 8", price: 7600 }, { date: "Nov 9", price: 7600 },
      { date: "Nov 10", price: 7700 }, { date: "Nov 11", price: 7700 }, { date: "Nov 12", price: 7800 }, { date: "Nov 13", price: 7800 },
    ],
    data30d: [
      { date: "Oct 14", price: 7000 }, { date: "Oct 17", price: 7100 }, { date: "Oct 20", price: 7200 },
      { date: "Oct 23", price: 7200 }, { date: "Oct 26", price: 7300 }, { date: "Oct 29", price: 7300 },
      { date: "Nov 1", price: 7400 }, { date: "Nov 4", price: 7400 }, { date: "Nov 7", price: 7500 },
      { date: "Nov 10", price: 7700 }, { date: "Nov 13", price: 7800 },
    ],
  },
  {
    id: "pt-05", crop: "Potatoes", market: "Kongowea", unit: "50kg bag",
    current: 2400, weekAgo: 2300, monthAgo: 2200, yearAgo: 2000,
    trend: "stable", seasonPeak: "Dec–Feb (KES 3,000)", seasonLow: "Jun–Aug (KES 1,500)",
    insight: "Mombasa maintains steady premium. Clean grading pays.",
    data7d: [
      { date: "Nov 7", price: 2300 }, { date: "Nov 8", price: 2350 }, { date: "Nov 9", price: 2350 },
      { date: "Nov 10", price: 2400 }, { date: "Nov 11", price: 2400 }, { date: "Nov 12", price: 2400 }, { date: "Nov 13", price: 2400 },
    ],
    data30d: [
      { date: "Oct 14", price: 2200 }, { date: "Oct 17", price: 2200 }, { date: "Oct 20", price: 2200 },
      { date: "Oct 23", price: 2250 }, { date: "Oct 26", price: 2250 }, { date: "Oct 29", price: 2250 },
      { date: "Nov 1", price: 2300 }, { date: "Nov 4", price: 2300 }, { date: "Nov 7", price: 2300 },
      { date: "Nov 10", price: 2400 }, { date: "Nov 13", price: 2400 },
    ],
  },
];

/* ── 10.3 Best Market Recommendations ────────────────────────────────────── */
export interface MarketRecommendation {
  rank: number;
  market: string;
  county: string;
  distanceKm: number;
  pricePerHead: number;
  transportPerHead: number;
  netPricePerHead: number;
  buyerReliability: number;
  volumeDemand: string;
  verdict: string;
  icon: LucideIcon;
}

export const MARKET_RECOMMENDATIONS: MarketRecommendation[] = [
  {
    rank: 1, market: "Thika", county: "Kiambu", distanceKm: 15,
    pricePerHead: 30, transportPerHead: 0.5, netPricePerHead: 29.5,
    buyerReliability: 4.2, volumeDemand: "High daily demand",
    verdict: "Best net — close and consistent demand",
    icon: Star,
  },
  {
    rank: 2, market: "Marikiti (Nairobi)", county: "Nairobi", distanceKm: 40,
    pricePerHead: 35, transportPerHead: 2.0, netPricePerHead: 33.0,
    buyerReliability: 3.5, volumeDemand: "Highest volume in Kenya",
    verdict: "Higher price but broker fees eat margin",
    icon: Building2,
  },
  {
    rank: 3, market: "Kangemi", county: "Nairobi", distanceKm: 35,
    pricePerHead: 32, transportPerHead: 1.75, netPricePerHead: 30.25,
    buyerReliability: 4.0, volumeDemand: "Medium — good for vegetables",
    verdict: "Solid middle option for weekly supply",
    icon: MapPin,
  },
  {
    rank: 4, market: "Nakuru", county: "Nakuru", distanceKm: 60,
    pricePerHead: 30, transportPerHead: 3.0, netPricePerHead: 27.0,
    buyerReliability: 3.8, volumeDemand: "High — agricultural hub",
    verdict: "Too far for same price — skip for cabbage",
    icon: Truck,
  },
];

/* ── 10.4 Buyer Directory ────────────────────────────────────────────────── */
export type BuyerType = "Broker" | "Supermarket" | "Restaurant" | "Exporter" | "Processor" | "Cooperative" | "Online" | "Direct";
export type PaymentTerms = "Cash on delivery" | "M-Pesa same day" | "7-day invoice" | "30-day invoice" | "45-day invoice" | "Weekly settlement";

export interface Buyer {
  id: string;
  name: string;
  type: BuyerType;
  location: string;
  crops: string[];
  minQuantity: string;
  paymentTerms: PaymentTerms;
  phone: string;
  email: string;
  rating: number;
  totalOrders: number;
  lastOrder: string;
  hue: string;
  icon: LucideIcon;
  notes: string;
}

export const BUYERS: Buyer[] = [
  {
    id: "b-01", name: "Kamau Brokers", type: "Broker", location: "Marikiti Market, Nairobi",
    crops: ["Cabbage", "Tomato", "Sukuma Wiki", "Onions"], minQuantity: "500 kg+",
    paymentTerms: "Cash on delivery", phone: "0712 880 114", email: "",
    rating: 3.5, totalOrders: 12, lastOrder: "12 Oct 2026", hue: "linear-gradient(135deg,#9a3412,#ea580c)",
    icon: Users, notes: "Reliable for large volumes. Negotiate hard on price.",
  },
  {
    id: "b-02", name: "Naivas Supermarket", type: "Supermarket", location: "Nairobi HQ",
    crops: ["Cabbage", "Tomato", "Kale", "Carrots", "Capsicum"], minQuantity: "1 tonne/week",
    paymentTerms: "30-day invoice", phone: "020 440 5000", email: "procurement@naivas.co.ke",
    rating: 4.2, totalOrders: 3, lastOrder: "28 Sep 2026", hue: "linear-gradient(135deg,#166534,#22a355)",
    icon: Building2, notes: "Needs GlobalG.A.P or KS1758. Consistent weekly orders once approved.",
  },
  {
    id: "b-03", name: "Karen Greens Restaurant", type: "Restaurant", location: "Karen, Nairobi",
    crops: ["Cabbage", "Herbs", "Capsicum", "Tomato"], minQuantity: "50–100 heads/week",
    paymentTerms: "M-Pesa same day", phone: "0733 441 600", email: "orders@karengreens.co.ke",
    rating: 4.8, totalOrders: 8, lastOrder: "10 Nov 2026", hue: "linear-gradient(135deg,#065f46,#10b981)",
    icon: Star, notes: "Premium buyer. Pays KES 35/head. Wants clean, sorted produce.",
  },
  {
    id: "b-04", name: "Vegpro Ltd", type: "Exporter", location: "Nairobi Industrial Area",
    crops: ["French beans", "Avocado", "Baby corn", "Snow peas"], minQuantity: "Contract basis",
    paymentTerms: "45-day invoice", phone: "020 693 2200", email: "exports@vegpro.co.ke",
    rating: 4.5, totalOrders: 0, lastOrder: "Never", hue: "linear-gradient(135deg,#581c87,#a855f7)",
    icon: Globe, notes: "Requires GlobalG.A.P certification. Long-term contracts available.",
  },
  {
    id: "b-05", name: "Kiambu Green Bistro", type: "Restaurant", location: "Kiambu Town",
    crops: ["Cabbage", "Sukuma Wiki", "Avocado"], minQuantity: "30–60 heads/week",
    paymentTerms: "Weekly settlement", phone: "0720 881 460", email: "",
    rating: 4.3, totalOrders: 2, lastOrder: "05 Nov 2026", hue: "linear-gradient(135deg,#0c4a6e,#0284c7)",
    icon: Building2, notes: "New buyer — started ordering in October. Pays well for quality.",
  },
  {
    id: "b-06", name: "Twiga Foods", type: "Online", location: "Nairobi (app-based)",
    crops: ["Cabbage", "Tomato", "Onions", "Potatoes"], minQuantity: "100 kg+",
    paymentTerms: "7-day invoice", phone: "0709 999 100", email: "vendors@twiga.ke",
    rating: 4.0, totalOrders: 5, lastOrder: "20 Oct 2026", hue: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    icon: Smartphone, notes: "App-based ordering. Good for clearing bulk stock quickly.",
  },
  {
    id: "b-07", name: "Kiambu Cereal Union", type: "Cooperative", location: "Kiambu County",
    crops: ["Maize", "Beans"], minQuantity: "Any — for members",
    paymentTerms: "Weekly settlement", phone: "0722 510 765", email: "info@kiambucereal.coop",
    rating: 4.1, totalOrders: 6, lastOrder: "18 Oct 2026", hue: "linear-gradient(135deg,#b45309,#fbbf24)",
    icon: Handshake, notes: "Best for beans and maize. Bulk pooling gets better transport rates.",
  },
  {
    id: "b-08", name: "Walk-in Buyers", type: "Direct", location: "Githunguri Market",
    crops: ["All vegetables", "Eggs", "Milk"], minQuantity: "Any quantity",
    paymentTerms: "Cash on delivery", phone: "—", email: "",
    rating: 4.0, totalOrders: 20, lastOrder: "Today", hue: "linear-gradient(135deg,#334155,#64748b)",
    icon: Users, notes: "Local market buyers. Best for small quantities and surplus.",
  },
];

/* ── 10.5 Harvest Sales Planner ──────────────────────────────────────────── */
export interface SaleScenario {
  id: string;
  label: string;
  quantity: number;
  pricePerHead: number;
  grossRevenue: number;
  transportCost: number;
  marketFees: number;
  netRevenue: number;
  recommended: boolean;
  note: string;
}

export const SALE_SCENARIOS: SaleScenario[] = [
  {
    id: "sc-01", label: "Sell all at Marikiti", quantity: 14500, pricePerHead: 30,
    grossRevenue: 435000, transportCost: 29000, marketFees: 4350, netRevenue: 401650,
    recommended: false, note: "Quickest clearance, but lowest net margin.",
  },
  {
    id: "sc-02", label: "50% Marikiti + 50% direct", quantity: 14500, pricePerHead: 33,
    grossRevenue: 471250, transportCost: 14500, marketFees: 2175, netRevenue: 454575,
    recommended: false, note: "Balanced — reduces broker dependency.",
  },
  {
    id: "sc-03", label: "Sell all direct to restaurants", quantity: 14500, pricePerHead: 35,
    grossRevenue: 507500, transportCost: 7250, marketFees: 0, netRevenue: 500250,
    recommended: false, note: "Highest per-head price but slower clearance.",
  },
  {
    id: "sc-04", label: "Store 2 weeks then sell at peak", quantity: 14500, pricePerHead: 40,
    grossRevenue: 580000, transportCost: 29000, marketFees: 5800, netRevenue: 545200,
    recommended: true, note: "+KES 143,550 vs immediate Marikiti. Risk: spoilage in store.",
  },
];

/* ── 10.6 Sales Records ──────────────────────────────────────────────────── */
export type SaleStatus = "Completed" | "Pending" | "In Transit" | "Disputed" | "Cancelled";

export interface SaleRecord {
  id: string;
  date: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  buyer: string;
  buyerPhone: string;
  paymentMethod: string;
  mpesaReceipt: string | null;
  saleStatus: SaleStatus;
  transportCost: number;
  marketFees: number;
  netIncome: number;
  qualityGrade: string;
  notes: string;
  market: string;
}

export const SALES_RECORDS: SaleRecord[] = [
  {
    id: "sr-01", date: "10 Nov 2026", crop: "Cabbage", variety: "Gloria F1",
    quantity: 2000, unit: "heads", pricePerUnit: 35, totalAmount: 70000,
    buyer: "Karen Greens Restaurant", buyerPhone: "0733 441 600",
    paymentMethod: "M-Pesa", mpesaReceipt: "SHK7PQ2RT",
    saleStatus: "Completed", transportCost: 2000, marketFees: 0, netIncome: 68000,
    qualityGrade: "A", notes: "Delivered fresh. Buyer wants weekly supply starting Dec.",
    market: "Direct",
  },
  {
    id: "sr-02", date: "05 Nov 2026", crop: "Tomato", variety: "Anna F1",
    quantity: 12, unit: "crates", pricePerUnit: 1800, totalAmount: 21600,
    buyer: "Wakulima market trader", buyerPhone: "0710 551 230",
    paymentMethod: "M-Pesa", mpesaReceipt: "WKM9R4T6P",
    saleStatus: "Completed", transportCost: 1500, marketFees: 800, netIncome: 19300,
    qualityGrade: "A", notes: "First greenhouse picking. Small but good quality.",
    market: "Wakulima",
  },
  {
    id: "sr-03", date: "01 Nov 2026", crop: "Cabbage", variety: "Gloria F1",
    quantity: 1500, unit: "heads", pricePerUnit: 28, totalAmount: 42000,
    buyer: "Kamau Brokers", buyerPhone: "0712 880 114",
    paymentMethod: "M-Pesa", mpesaReceipt: "KMB5N8T1",
    saleStatus: "Completed", transportCost: 3000, marketFees: 2100, netIncome: 36900,
    qualityGrade: "B", notes: "Size variation — sort better next time. Price negotiable.",
    market: "Marikiti",
  },
  {
    id: "sr-04", date: "20 Oct 2026", crop: "Avocado", variety: "Hass",
    quantity: 120, unit: "kg", pricePerUnit: 85, totalAmount: 10200,
    buyer: "Kiambu Fresh Traders", buyerPhone: "0722 300 890",
    paymentMethod: "M-Pesa", mpesaReceipt: "AVO5N8T1",
    saleStatus: "Completed", transportCost: 500, marketFees: 0, netIncome: 9700,
    qualityGrade: "B", notes: "Boundary trees — grade 2 fruit. Exporter wants larger.",
    market: "Local",
  },
  {
    id: "sr-05", date: "15 Oct 2026", crop: "Eggs", variety: "Poultry",
    quantity: 6, unit: "trays", pricePerUnit: 450, totalAmount: 2700,
    buyer: "Githunguri market", buyerPhone: "—",
    paymentMethod: "Cash", mpesaReceipt: null,
    saleStatus: "Completed", transportCost: 0, marketFees: 0, netIncome: 2700,
    qualityGrade: "A", notes: "Side income from poultry house.",
    market: "Githunguri",
  },
  {
    id: "sr-06", date: "12 Nov 2026", crop: "Milk", variety: "Dairy",
    quantity: 170, unit: "litres", pricePerUnit: 52, totalAmount: 8840,
    buyer: "Githunguri Dairy Co-op", buyerPhone: "0722 510 200",
    paymentMethod: "M-Pesa", mpesaReceipt: "DAIRY-9402",
    saleStatus: "Completed", transportCost: 0, marketFees: 100, netIncome: 8740,
    qualityGrade: "A", notes: "Monthly milk sales — consistent side income.",
    market: "Cooperative",
  },
  {
    id: "sr-07", date: "14 Nov 2026", crop: "Cabbage", variety: "Gloria F1",
    quantity: 3000, unit: "heads", pricePerUnit: 30, totalAmount: 90000,
    buyer: "Kamau Brokers", buyerPhone: "0712 880 114",
    paymentMethod: "M-Pesa", mpesaReceipt: null,
    saleStatus: "Pending", transportCost: 6000, marketFees: 4500, netIncome: 79500,
    qualityGrade: "A", notes: "Larger batch — broker confirmed price. Awaiting delivery.",
    market: "Marikiti",
  },
  {
    id: "sr-08", date: "20 Nov 2026", crop: "Tomato", variety: "Anna F1",
    quantity: 18, unit: "crates", pricePerUnit: 2200, totalAmount: 39600,
    buyer: "Kiambu Green Bistro", buyerPhone: "0720 881 460",
    paymentMethod: "M-Pesa", mpesaReceipt: null,
    saleStatus: "In Transit", transportCost: 800, marketFees: 0, netIncome: 38800,
    qualityGrade: "A", notes: "Premium restaurant order. Delivering today.",
    market: "Direct",
  },
  {
    id: "sr-09", date: "25 Nov 2026", crop: "Beans", variety: "Rosecoco",
    quantity: 4, unit: "bags", pricePerUnit: 7200, totalAmount: 28800,
    buyer: "Kiambu Cereal Union", buyerPhone: "0722 510 765",
    paymentMethod: "Bank", mpesaReceipt: null,
    saleStatus: "Pending", transportCost: 2000, marketFees: 500, netIncome: 26300,
    qualityGrade: "A", notes: "Cooperative pooling — better transport rates.",
    market: "Cooperative",
  },
  {
    id: "sr-10", date: "30 Dec 2026", crop: "Cabbage", variety: "Gloria F1",
    quantity: 8000, unit: "heads", pricePerUnit: 38, totalAmount: 304000,
    buyer: "Multiple buyers", buyerPhone: "—",
    paymentMethod: "M-Pesa", mpesaReceipt: null,
    saleStatus: "Forecast", transportCost: 16000, marketFees: 8000, netIncome: 280000,
    qualityGrade: "A/B", notes: "Peak season forecast. Split between Marikiti + direct.",
    market: "Mixed",
  },
];

/* ── 10.7 Contract Farming Board ─────────────────────────────────────────── */
export type ContractStatus = "Open" | "Applied" | "Accepted" | "Closed";

export interface FarmContract {
  id: string;
  company: string;
  companyPhone: string;
  crop: string;
  variety: string;
  acreage: string;
  duration: string;
  priceGuarantee: string;
  requirements: string[];
  location: string;
  status: ContractStatus;
  applicationDeadline: string;
  slotsAvailable: number;
  hue: string;
}

export const FARM_CONTRACTS: FarmContract[] = [
  {
    id: "fc-01", company: "Vegpro Ltd", companyPhone: "020 693 2200",
    crop: "French beans", variety: "Julien", acreage: "0.5+ acre",
    duration: "6 months", priceGuarantee: "KES 80/kg",
    requirements: ["GlobalG.A.P certification", "Specific variety — Julien", "Spray diary maintained"],
    location: "Export — Nairobi", status: "Open", applicationDeadline: "30 Nov 2026",
    slotsAvailable: 15, hue: "linear-gradient(135deg,#581c87,#a855f7)",
  },
  {
    id: "fc-02", company: "Butali Sugar", companyPhone: "0722 300 500",
    crop: "Sugarcane", variety: "CO 421", acreage: "2+ acres",
    duration: "4 years", priceGuarantee: "KES 4,200/tonne",
    requirements: ["Registered with factory", "Specific cane variety", "Minimum 2 acres"],
    location: "Kakamega County", status: "Open", applicationDeadline: "15 Jan 2027",
    slotsAvailable: 50, hue: "linear-gradient(135deg,#b45309,#fbbf24)",
  },
  {
    id: "fc-03", company: "Kakuzi Ltd", companyPhone: "020 691 3000",
    crop: "Hass Avocado", variety: "Hass", acreage: "1+ acre",
    duration: "5 years", priceGuarantee: "Market price + 10%",
    requirements: ["Organic preferred", "Specific grades (size 14–18)", "No chemical residue"],
    location: "Thika / Murang'a", status: "Applied", applicationDeadline: "28 Feb 2027",
    slotsAvailable: 30, hue: "linear-gradient(135deg,#065f46,#10b981)",
  },
  {
    id: "fc-04", company: "Kenyan Kitchen Ltd", companyPhone: "0733 200 400",
    crop: "Tomatoes", variety: "Anna F1", acreage: "0.5+ acre",
    duration: "1 year", priceGuarantee: "KES 40/kg minimum",
    requirements: ["Consistent supply — min 200kg/week", "Greenhouse preferred", "Food safety records"],
    location: "Nairobi / Kiambu", status: "Open", applicationDeadline: "31 Dec 2026",
    slotsAvailable: 8, hue: "linear-gradient(135deg,#9a3412,#ea580c)",
  },
];

/* ── Price Alerts ────────────────────────────────────────────────────────── */
export interface PriceAlert {
  id: string;
  crop: string;
  market: string;
  condition: "above" | "below";
  threshold: number;
  currentPrice: number;
  active: boolean;
  createdAt: string;
  triggeredAt: string | null;
}

export const PRICE_ALERTS: PriceAlert[] = [
  {
    id: "pa-01", crop: "Cabbage", market: "Marikiti", condition: "above",
    threshold: 35, currentPrice: 32, active: true, createdAt: "01 Nov 2026",
    triggeredAt: null,
  },
  {
    id: "pa-02", crop: "Tomato", market: "Kangemi", condition: "above",
    threshold: 4500, currentPrice: 4200, active: true, createdAt: "15 Oct 2026",
    triggeredAt: null,
  },
  {
    id: "pa-03", crop: "Maize", market: "Eldoret", condition: "below",
    threshold: 3500, currentPrice: 3800, active: true, createdAt: "20 Oct 2026",
    triggeredAt: null,
  },
  {
    id: "pa-04", crop: "Beans", market: "Nakuru", condition: "above",
    threshold: 8500, currentPrice: 7800, active: true, createdAt: "01 Nov 2026",
    triggeredAt: null,
  },
  {
    id: "pa-05", crop: "Cabbage", market: "Thika", condition: "above",
    threshold: 30, currentPrice: 30, active: false, createdAt: "15 Sep 2026",
    triggeredAt: "10 Nov 2026",
  },
];

/* ── Portfolio (Crop listings visible to buyers) ─────────────────────────── */
export interface CropListing {
  id: string;
  crop: string;
  variety: string;
  plot: string;
  acreage: string;
  expectedHarvest: string;
  estimatedQuantity: number;
  unit: string;
  qualityGrade: string;
  minOrder: number;
  priceAsk: number;
  photos: number;
  views: number;
  orders: number;
  status: "Active" | "Sold Out" | "Draft";
  shareLink: string;
}

export const CROP_LISTINGS: CropListing[] = [
  {
    id: "cl-01", crop: "Cabbage", variety: "Gloria F1", plot: "Plot 1",
    acreage: "0.5 acre", expectedHarvest: "15 Jan 2027", estimatedQuantity: 14500,
    unit: "heads", qualityGrade: "A/B", minOrder: 100, priceAsk: 35,
    photos: 4, views: 87, orders: 3, status: "Active",
    shareLink: "growmo.ke/p/mary/cabbage-jan27",
  },
  {
    id: "cl-02", crop: "Tomato", variety: "Anna F1", plot: "Greenhouse 1",
    acreage: "0.08 acre", expectedHarvest: "Weekly from Nov 2026", estimatedQuantity: 18,
    unit: "crates/week", qualityGrade: "A", minOrder: 5, priceAsk: 2200,
    photos: 3, views: 42, orders: 1, status: "Active",
    shareLink: "growmo.ke/p/mary/tomato-gh1",
  },
  {
    id: "cl-03", crop: "Beans", variety: "Rosecoco", plot: "Plot 3",
    acreage: "1 acre", expectedHarvest: "28 Feb 2027", estimatedQuantity: 6,
    unit: "bags", qualityGrade: "A", minOrder: 1, priceAsk: 7500,
    photos: 2, views: 23, orders: 0, status: "Active",
    shareLink: "growmo.ke/p/mary/beans-feb27",
  },
  {
    id: "cl-04", crop: "Maize", variety: "H6213", plot: "Plot 2",
    acreage: "2 acres", expectedHarvest: "15 Mar 2027", estimatedQuantity: 31,
    unit: "bags", qualityGrade: "A", minOrder: 5, priceAsk: 4200,
    photos: 2, views: 15, orders: 0, status: "Draft",
    shareLink: "growmo.ke/p/mary/maize-mar27",
  },
];

/* ── Helper functions ────────────────────────────────────────────────────── */
export function saleStatusTone(status: SaleStatus): "low" | "medium" | "high" | "neutral" {
  if (status === "Completed") return "low";
  if (status === "Pending") return "medium";
  if (status === "In Transit") return "medium";
  if (status === "Disputed") return "high";
  return "neutral";
}

export function contractStatusTone(status: ContractStatus): "low" | "medium" | "high" | "neutral" {
  if (status === "Accepted") return "low";
  if (status === "Applied") return "medium";
  if (status === "Open") return "neutral";
  return "high";
}

export function trendIcon(trend: MarketTrend): typeof TrendingUp {
  if (trend === "up") return TrendingUp;
  if (trend === "down") return TrendingDown;
  return TrendingUp;
}

export function formatPrice(value: number): string {
  return `KES ${value.toLocaleString("en-KE")}`;
}