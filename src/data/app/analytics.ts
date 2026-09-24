/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING (/app/analytics)
   Kenyan demo analytics data for Mary's Farm, Githunguri (Kiambu).

   Blueprint sections covered:
   11.1 Farm overview KPIs (vs last season & county average)
   11.2 Crop performance comparison with ROI
   11.3 Cost analysis breakdown
   11.4 Revenue analysis month by month with targets
   11.5 Labour efficiency metrics
   11.6 Weather impact on yield
   11.7 Custom report builder
   11.8 Pre-built reports library
   Monetary figures use kes() from data/site.
   ========================================================================== */

export const AN_CONTEXT = {
  farm: "Mary's Farm",
  farmer: "Mary Wanjiku",
  county: "Kiambu",
  subCounty: "Githunguri",
  season: "YTD 2026 (Jan–Sep)",
  reportDate: "22 Sep 2026",
  dataSources: 9,
  lastSync: "22 Sep 2026 · 09:14",
  overallGrade: "A",
  healthScore: 82,
  reportsGenerated: 48,
  reportsShared: 12,
};

/* ------------------------------------------------------------ 11.1 KPIs */

export interface FarmKpi {
  kpi: string;
  value: string;
  numeric: number;
  vsLast: string;
  vsLastDir: "up" | "down" | "flat";
  vsCounty: string;
  vsCountyDir: "up" | "down" | "flat";
  icon: string;
}

export const FARM_KPIS: FarmKpi[] = [
  { kpi: "Acreage under production", value: "2.5 acres", numeric: 2.5, vsLast: "+0.5", vsLastDir: "up", vsCounty: "—", vsCountyDir: "flat", icon: "🌱" },
  { kpi: "Active crops", value: "3", numeric: 3, vsLast: "+1", vsLastDir: "up", vsCounty: "—", vsCountyDir: "flat", icon: "🥬" },
  { kpi: "Total revenue (YTD)", value: "KES 580,000", numeric: 580000, vsLast: "+45%", vsLastDir: "up", vsCounty: "+30%", vsCountyDir: "up", icon: "💰" },
  { kpi: "Total expenses (YTD)", value: "KES 210,000", numeric: 210000, vsLast: "+20%", vsLastDir: "up", vsCounty: "-5%", vsCountyDir: "down", icon: "💸" },
  { kpi: "Net profit (YTD)", value: "KES 370,000", numeric: 370000, vsLast: "+65%", vsLastDir: "up", vsCounty: "+55%", vsCountyDir: "up", icon: "📈" },
  { kpi: "Overall ROI", value: "176%", numeric: 176, vsLast: "+30pp", vsLastDir: "up", vsCounty: "+40pp", vsCountyDir: "up", icon: "🎯" },
  { kpi: "Labour cost as % of revenue", value: "15%", numeric: 15, vsLast: "-3pp", vsLastDir: "down", vsCounty: "-8pp", vsCountyDir: "down", icon: "👩🏾‍🌾" },
  { kpi: "Post-harvest loss rate", value: "8%", numeric: 8, vsLast: "-5pp", vsLastDir: "down", vsCounty: "-12pp", vsCountyDir: "down", icon: "📦" },
];

/* ------------------------------------------------------------ 11.2 Crop performance */

export interface CropPerf {
  crop: string;
  variety: string;
  acres: number;
  yield: string;
  yieldPerAcre: number;
  costPerAcre: number;
  revenuePerAcre: number;
  profitPerAcre: number;
  roi: number;
  rank: number;
  color: string;
  emoji: string;
}

export const CROP_PERF: CropPerf[] = [
  { crop: "Cabbage", variety: "Gloria F1", acres: 0.5, yield: "29,000 heads", yieldPerAcre: 29000, costPerAcre: 139600, revenuePerAcre: 870000, profitPerAcre: 730400, roi: 523, rank: 1, color: "var(--gm-leaf-500)", emoji: "🥬" },
  { crop: "Tomato", variety: "Roma VF", acres: 0.5, yield: "20 tonnes", yieldPerAcre: 20000, costPerAcre: 150000, revenuePerAcre: 800000, profitPerAcre: 650000, roi: 433, rank: 2, color: "var(--gm-clay-500)", emoji: "🍅" },
  { crop: "Maize", variety: "H6213", acres: 1.0, yield: "18 bags", yieldPerAcre: 18, costPerAcre: 40000, revenuePerAcre: 63000, profitPerAcre: 23000, roi: 58, rank: 3, color: "var(--gm-gold-500)", emoji: "🌽" },
  { crop: "Kale", variety: "Thousand Head", acres: 0.3, yield: "1,200 bundles", yieldPerAcre: 4000, costPerAcre: 28000, revenuePerAcre: 96000, profitPerAcre: 68000, roi: 243, rank: 4, color: "var(--gm-sprout-500)", emoji: "🥬" },
  { crop: "Potato", variety: "Shangi", acres: 0.2, yield: "12 bags", yieldPerAcre: 60, costPerAcre: 22000, revenuePerAcre: 42000, profitPerAcre: 20000, roi: 91, rank: 5, color: "var(--gm-ocean-400)", emoji: "🥔" },
];

/* ------------------------------------------------------------ 11.3 Cost breakdown */

export interface CostCategory {
  category: string;
  amount: number;
  pct: number;
  vsBudget: string;
  vsBudgetPct: number;
  tone: "good" | "warn" | "bad";
  icon: string;
}

export const COST_CATEGORIES: CostCategory[] = [
  { category: "Fertilizers", amount: 65000, pct: 31, vsBudget: "-5%", vsBudgetPct: -5, tone: "good", icon: "🧪" },
  { category: "Labour", amount: 42000, pct: 20, vsBudget: "+2%", vsBudgetPct: 2, tone: "warn", icon: "👩🏾‍🌾" },
  { category: "Manure", amount: 30000, pct: 14, vsBudget: "0%", vsBudgetPct: 0, tone: "good", icon: "🌿" },
  { category: "Pesticides", amount: 25000, pct: 12, vsBudget: "+8%", vsBudgetPct: 8, tone: "bad", icon: "🐛" },
  { category: "Seeds", amount: 18000, pct: 9, vsBudget: "-10%", vsBudgetPct: -10, tone: "good", icon: "🌱" },
  { category: "Transport", amount: 15000, pct: 7, vsBudget: "+15%", vsBudgetPct: 15, tone: "bad", icon: "🚚" },
  { category: "Equipment", amount: 8000, pct: 4, vsBudget: "—", vsBudgetPct: 0, tone: "warn", icon: "🔧" },
  { category: "Other", amount: 7000, pct: 3, vsBudget: "—", vsBudgetPct: 0, tone: "warn", icon: "📋" },
];

/* ------------------------------------------------------------ 11.4 Revenue by month */

export interface RevenueMonth {
  month: string;
  monthShort: string;
  cabbage: number;
  maize: number;
  tomato: number;
  total: number;
  target: number;
  variance: number;
  hit: boolean;
}

export const REVENUE_MONTHS: RevenueMonth[] = [
  { month: "July", monthShort: "Jul", cabbage: 0, maize: 63000, tomato: 0, total: 63000, target: 50000, variance: 13000, hit: true },
  { month: "August", monthShort: "Aug", cabbage: 0, maize: 0, tomato: 200000, total: 200000, target: 150000, variance: 50000, hit: true },
  { month: "September", monthShort: "Sep", cabbage: 0, maize: 0, tomato: 317000, total: 317000, target: 200000, variance: 117000, hit: true },
  { month: "October", monthShort: "Oct", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 50000, variance: -50000, hit: false },
  { month: "November", monthShort: "Nov", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 0, variance: 0, hit: true },
  { month: "December", monthShort: "Dec", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 50000, variance: -50000, hit: false },
  { month: "January (proj)", monthShort: "Jan", cabbage: 435000, maize: 0, tomato: 0, total: 435000, target: 200000, variance: 235000, hit: true },
];

/* ------------------------------------------------------------ 11.5 Labour efficiency */

export const LABOUR_EFFICIENCY = [
  { k: "Total labour cost (YTD)", v: "KES 42,000" },
  { k: "Total labour days", v: "84" },
  { k: "Cost per labour day", v: "KES 500" },
  { k: "Revenue per labour day", v: "KES 6,905" },
  { k: "Workers employed (unique)", v: "6" },
  { k: "Best worker (tasks completed)", v: "John Mwangi — 22 tasks" },
  { k: "Highest rated worker", v: "Grace Wanjiku — 4.8 stars" },
  { k: "Attendance rate", v: "92%" },
];

export interface Worker {
  id: string; name: string; role: string; phone: string; tasks: number; rating: number; daysWorked: number; attendancePct: number;
  totalPay: number; status: "Active" | "On leave" | "Inactive";
}

export const WORKERS: Worker[] = [
  { id: "w1", name: "John Mwangi", role: "Foreman / sprayer", phone: "0721 111 222", tasks: 22, rating: 4.6, daysWorked: 72, attendancePct: 96, totalPay: 14500, status: "Active" },
  { id: "w2", name: "Grace Wanjiku", role: "Harvester / grader", phone: "0733 555 666", tasks: 18, rating: 4.8, daysWorked: 65, attendancePct: 94, totalPay: 11200, status: "Active" },
  { id: "w3", name: "Peter Otieno", role: "Irrigation / nursery", phone: "0712 333 444", tasks: 14, rating: 4.2, daysWorked: 58, attendancePct: 88, totalPay: 9800, status: "Active" },
  { id: "w4", name: "Faith Njeri", role: "Harvester", phone: "0715 666 777", tasks: 10, rating: 4.5, daysWorked: 42, attendancePct: 90, totalPay: 7200, status: "Active" },
  { id: "w5", name: "Samuel Kiprono", role: "Tractor / land prep", phone: "0720 888 999", tasks: 8, rating: 4.0, daysWorked: 20, attendancePct: 85, totalPay: 5600, status: "On leave" },
  { id: "w6", name: "Lucy Achieng", role: "Weeding / thinning", phone: "0701 222 111", tasks: 12, rating: 4.4, daysWorked: 38, attendancePct: 91, totalPay: 6400, status: "Active" },
];

/* ------------------------------------------------------------ 11.6 Weather impact */

export interface WeatherImpact {
  season: string;
  crop: string;
  rainfallActual: string;
  rainfallNormal: string;
  deviationPct: number;
  yieldImpactPct: number;
  notes: string;
  tone: "good" | "warn" | "bad";
}

export const WEATHER_IMPACT: WeatherImpact[] = [
  { season: "SR 2026", crop: "Cabbage", rainfallActual: "280 mm (Oct–Dec)", rainfallNormal: "320 mm", deviationPct: -13, yieldImpactPct: -5, notes: "Slightly dry, compensated with furrow irrigation", tone: "warn" },
  { season: "LR 2026", crop: "Maize", rainfallActual: "350 mm (Mar–May)", rainfallNormal: "400 mm", deviationPct: -13, yieldImpactPct: -10, notes: "Dry spell in April at tasseling — 1 bag/acre below potential", tone: "bad" },
  { season: "LR 2026", crop: "Tomato", rainfallActual: "410 mm (Mar–Jun)", rainfallNormal: "380 mm", deviationPct: 8, yieldImpactPct: 3, notes: "Early blight pressure managed with Ridomil alternation", tone: "good" },
  { season: "SR 2025", crop: "Kale", rainfallActual: "340 mm (Oct–Dec)", rainfallNormal: "330 mm", deviationPct: 3, yieldImpactPct: 1, notes: "Ideal rainfall, close to long-run average", tone: "good" },
];

/* ------------------------------------------------------------ 11.7 Custom report builder */

export interface Metric { id: string; label: string; selected: boolean; group: string; }
export const REPORT_METRICS: Metric[] = [
  { id: "revenue", label: "Revenue", selected: true, group: "Financial" },
  { id: "cost", label: "Cost", selected: true, group: "Financial" },
  { id: "profit", label: "Profit", selected: true, group: "Financial" },
  { id: "yield", label: "Yield", selected: true, group: "Agronomic" },
  { id: "labour", label: "Labour", selected: false, group: "People" },
  { id: "inputs", label: "Inputs", selected: false, group: "Agronomic" },
  { id: "weather", label: "Weather", selected: false, group: "Agronomic" },
  { id: "roi", label: "ROI", selected: true, group: "Financial" },
  { id: "loss", label: "Post-harvest loss", selected: false, group: "Operations" },
];

export const REPORT_CROPS = [
  { id: "all", label: "All crops", selected: true },
  { id: "cabbage", label: "Cabbage", selected: false },
  { id: "tomato", label: "Tomato", selected: false },
  { id: "maize", label: "Maize", selected: false },
  { id: "kale", label: "Kale", selected: false },
];

export const REPORT_COMPARE = [
  { id: "none", label: "No comparison", selected: true },
  { id: "last-season", label: "Last season", selected: false },
  { id: "county", label: "County average", selected: false },
  { id: "top25", label: "Top 25% farmers", selected: false },
];

export const REPORT_CHART_TYPES = [
  { id: "bar", label: "Bar" }, { id: "line", label: "Line" }, { id: "pie", label: "Pie" }, { id: "table", label: "Table" }, { id: "area", label: "Area" },
];

/* ------------------------------------------------------------ 11.8 Pre-built reports */

export interface PremadeReport {
  id: string; name: string; contents: string; useCase: string; icon: string; lastRun?: string; color: string;
}

export const PREMADE_REPORTS: PremadeReport[] = [
  { id: "r1", name: "Season Summary", contents: "Full P&L per crop, yield, costs, weather impact", useCase: "Season review & planning", icon: "📊", lastRun: "15 Sep 2026", color: "var(--gm-leaf-500)" },
  { id: "r2", name: "Loan Application Report", contents: "Farm profile, yield history, revenue, assets", useCase: "Bank/cooperative loan", icon: "🏦", lastRun: "02 Aug 2026", color: "var(--gm-ocean-500)" },
  { id: "r3", name: "Crop Performance Card", contents: "Single crop: metrics from planting to sale", useCase: "Benchmarking, improvement", icon: "🥬", color: "var(--gm-sprout-500)" },
  { id: "r4", name: "Financial Statement", contents: "Income statement, balance sheet, cash flow", useCase: "Accounting, tax", icon: "💼", color: "var(--gm-gold-500)" },
  { id: "r5", name: "Input Usage Report", contents: "All inputs used, costs, efficiency", useCase: "Optimization", icon: "🧪", color: "var(--gm-clay-500)" },
  { id: "r6", name: "Labour Report", contents: "Attendance, wages, efficiency, ratings", useCase: "Payroll audit", icon: "👥", color: "var(--gm-berry-500)" },
  { id: "r7", name: "Compliance Report", contents: "Spray records, PHI, soil tests, certifications", useCase: "KEPHIS, GlobalG.A.P, KS1758", icon: "✅", color: "var(--gm-leaf-600)" },
  { id: "r8", name: "Market Analysis", contents: "Price trends, sales by market, buyer performance", useCase: "Sales strategy", icon: "🛒", color: "var(--gm-gold-600)" },
  { id: "r9", name: "Soil Health Report", contents: "Tests, recommendations, amendments", useCase: "Agronomist review", icon: "🌱", lastRun: "16 Sep 2026", color: "var(--gm-ocean-600)" },
  { id: "r10", name: "Post-Harvest Loss Report", contents: "Loss by crop, cause, mitigation", useCase: "Loss reduction", icon: "📦", color: "var(--gm-clay-600)" },
];

/* ------------------------------------------------------------ extras */

export const AN_FAQ = [
  { q: "Where do these numbers come from?", a: "Numbers are computed from records you've logged (sales, sprays, labour, inputs) plus soil tests, weather feeds and buyer payments. Figures dated before onboarding use your opening balances." },
  { q: "What does vs county average mean?", a: "Your performance is compared to anonymous aggregate data from other GrowMO farmers in Kiambu county with similar acreage and crops." },
  { q: "Can I edit or delete a report?", a: "Generated reports are stored read-only. You can re-run a report with different parameters or delete it from your saved list." },
  { q: "How do I share a report with my bank?", a: "Use the Share button on any report to create a time-limited access link (7/30/90 days). Banks love the Loan Application Report because it bundles every document they ask for." },
  { q: "How is ROI calculated?", a: "ROI = (Revenue – Total cost) / Total cost × 100. Land and family labour are costed at market rate for comparability." },
  { q: "Why are some figures projections?", a: "Future months show projections based on your crop plans and current market prices. They update as new sales are logged." },
];

export const AN_GLOSSARY = [
  { term: "ROI", def: "Return on Investment — profit divided by total cost, expressed as a percentage." },
  { term: "YTD", def: "Year To Date — from the start of the calendar or fiscal year to today." },
  { term: "pp", def: "Percentage points — the arithmetic difference between two percentages." },
  { term: "Post-harvest loss", def: "Produce lost between harvest and sale due to spoilage, damage, rejection or theft." },
  { term: "Cost per acre", def: "All input, labour and operational costs allocated to one acre of that crop." },
];

export const AN_SETTINGS_DEFAULTS = {
  defaultCompare: "county",
  defaultDateRange: "ytd",
  emailReports: false,
  emailAddress: "mary@growmo.app",
  weeklyDigest: true,
  includeCountyBenchmark: true,
  shareWithCoop: false,
  currency: "KES",
};

export function analyticsTotals() {
  const revenue = REVENUE_MONTHS.reduce((s, m) => s + m.total, 0);
  const costs = COST_CATEGORIES.reduce((s, c) => s + c.amount, 0);
  const profit = revenue - costs;
  const hits = REVENUE_MONTHS.filter((m) => m.hit).length;
  return { revenue, costs, profit, hits, months: REVENUE_MONTHS.length };
}
