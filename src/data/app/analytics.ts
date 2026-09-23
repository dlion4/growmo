/* ============================================================================
   PAGE 11 — ANALYTICS & REPORTING
   Analytics demo data for Mary Wanjiku's farm, Githunguri, Kiambu.
   ========================================================================== */

export type AnalyticsView =
  | "overview"
  | "crops"
  | "costs"
  | "revenue"
  | "labour"
  | "weather"
  | "reports"
  | "benchmark";

/* ── 11.1 Farm Overview KPIs ─────────────────────────────────────────────── */
export interface FarmKpi {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  unit: string;
  vsLastSeason: string;
  vsCountyAvg: string;
  trend: "up" | "down" | "stable";
  icon: string;
}

export const FARM_KPIS: FarmKpi[] = [
  { id: "kpi-1", label: "Total acreage under production", value: "2.5 acres", rawValue: 2.5, unit: "acres", vsLastSeason: "+0.5", vsCountyAvg: "—", trend: "up", icon: "MapPin" },
  { id: "kpi-2", label: "Active crops", value: "3", rawValue: 3, unit: "crops", vsLastSeason: "+1", vsCountyAvg: "—", trend: "up", icon: "Sprout" },
  { id: "kpi-3", label: "Total revenue (YTD)", value: "KES 580,000", rawValue: 580000, unit: "KES", vsLastSeason: "+45%", vsCountyAvg: "+30%", trend: "up", icon: "TrendingUp" },
  { id: "kpi-4", label: "Total expenses (YTD)", value: "KES 210,000", rawValue: 210000, unit: "KES", vsLastSeason: "+20%", vsCountyAvg: "-5%", trend: "down", icon: "ReceiptText" },
  { id: "kpi-5", label: "Net profit (YTD)", value: "KES 370,000", rawValue: 370000, unit: "KES", vsLastSeason: "+65%", vsCountyAvg: "+55%", trend: "up", icon: "CircleDollarSign" },
  { id: "kpi-6", label: "Overall ROI", value: "176%", rawValue: 176, unit: "%", vsLastSeason: "+30pp", vsCountyAvg: "+40pp", trend: "up", icon: "BarChart3" },
  { id: "kpi-7", label: "Labour cost as % of revenue", value: "15%", rawValue: 15, unit: "%", vsLastSeason: "-3pp", vsCountyAvg: "-8pp", trend: "up", icon: "Users" },
  { id: "kpi-8", label: "Post-harvest loss rate", value: "8%", rawValue: 8, unit: "%", vsLastSeason: "-5pp", vsCountyAvg: "-12pp", trend: "up", icon: "AlertTriangle" },
];

/* ── 11.2 Crop Performance Comparison ────────────────────────────────────── */
export interface CropPerformance {
  id: string;
  crop: string;
  variety: string;
  plot: string;
  yieldPerAcre: string;
  yieldValue: number;
  costPerAcre: number;
  revenuePerAcre: number;
  profitPerAcre: number;
  roi: number;
  rank: number;
  symbol: string;
}

export const CROP_PERFORMANCE: CropPerformance[] = [
  { id: "cp-1", crop: "Cabbage", variety: "Gloria F1", plot: "Plot 1 · 0.5 acre", yieldPerAcre: "29,000 heads", yieldValue: 29000, costPerAcre: 139600, revenuePerAcre: 870000, profitPerAcre: 730400, roi: 523, rank: 1, symbol: "🥬" },
  { id: "cp-2", crop: "Tomato", variety: "Anna F1", plot: "Greenhouse 1 · 0.08 acre", yieldPerAcre: "20 tonnes", yieldValue: 20000, costPerAcre: 150000, revenuePerAcre: 800000, profitPerAcre: 650000, roi: 433, rank: 2, symbol: "🍅" },
  { id: "cp-3", crop: "Maize", variety: "H6213", plot: "Plot 2 · 2 acres", yieldPerAcre: "18 bags", yieldValue: 18000, costPerAcre: 40000, revenuePerAcre: 63000, profitPerAcre: 23000, roi: 58, rank: 3, symbol: "🌽" },
];

/* ── 11.3 Cost Analysis ──────────────────────────────────────────────────── */
export interface CostCategory {
  id: string;
  category: string;
  amount: number;
  percentOfTotal: number;
  vsBudget: string;
  budgetAmount: number;
}

export const COST_CATEGORIES: CostCategory[] = [
  { id: "cc-1", category: "Fertilizers", amount: 65000, percentOfTotal: 31, vsBudget: "-5%", budgetAmount: 68421 },
  { id: "cc-2", category: "Labour", amount: 42000, percentOfTotal: 20, vsBudget: "+2%", budgetAmount: 41176 },
  { id: "cc-3", category: "Seeds", amount: 18000, percentOfTotal: 9, vsBudget: "-10%", budgetAmount: 20000 },
  { id: "cc-4", category: "Pesticides", amount: 25000, percentOfTotal: 12, vsBudget: "+8%", budgetAmount: 23148 },
  { id: "cc-5", category: "Manure", amount: 30000, percentOfTotal: 14, vsBudget: "0%", budgetAmount: 30000 },
  { id: "cc-6", category: "Transport", amount: 15000, percentOfTotal: 7, vsBudget: "+15%", budgetAmount: 13043 },
  { id: "cc-7", category: "Equipment", amount: 8000, percentOfTotal: 4, vsBudget: "—", budgetAmount: 8000 },
  { id: "cc-8", category: "Other", amount: 7000, percentOfTotal: 3, vsBudget: "—", budgetAmount: 7000 },
];

export const COST_TOTAL = { amount: 210000, budgetAmount: 210788 };

/* ── 11.4 Revenue Analysis ───────────────────────────────────────────────── */
export interface RevenueMonth {
  id: string;
  month: string;
  cabbage: number;
  maize: number;
  tomato: number;
  total: number;
  target: number;
  variance: number;
}

export const REVENUE_MONTHS: RevenueMonth[] = [
  { id: "rm-1", month: "Jul", cabbage: 0, maize: 63000, tomato: 0, total: 63000, target: 50000, variance: 13000 },
  { id: "rm-2", month: "Aug", cabbage: 0, maize: 0, tomato: 200000, total: 200000, target: 150000, variance: 50000 },
  { id: "rm-3", month: "Sep", cabbage: 0, maize: 0, tomato: 317000, total: 317000, target: 200000, variance: 117000 },
  { id: "rm-4", month: "Oct", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 50000, variance: -50000 },
  { id: "rm-5", month: "Nov", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 0, variance: 0 },
  { id: "rm-6", month: "Dec", cabbage: 0, maize: 0, tomato: 0, total: 0, target: 50000, variance: -50000 },
  { id: "rm-7", month: "Jan (proj)", cabbage: 435000, maize: 0, tomato: 0, total: 435000, target: 200000, variance: 235000 },
];

/* ── 11.5 Labour Efficiency ──────────────────────────────────────────────── */
export interface LabourMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  unit: string;
  note: string;
}

export const LABOUR_METRICS: LabourMetric[] = [
  { id: "lm-1", label: "Total labour cost (YTD)", value: "KES 42,000", rawValue: 42000, unit: "KES", note: "Across all crops" },
  { id: "lm-2", label: "Total labour days", value: "84", rawValue: 84, unit: "days", note: "6 workers × 14 avg days" },
  { id: "lm-3", label: "Cost per labour day", value: "KES 500", rawValue: 500, unit: "KES", note: "County avg: KES 550" },
  { id: "lm-4", label: "Revenue per labour day", value: "KES 6,905", rawValue: 6905, unit: "KES", note: "High efficiency" },
  { id: "lm-5", label: "Workers employed", value: "6 unique", rawValue: 6, unit: "workers", note: "Regular team" },
  { id: "lm-6", label: "Best worker (tasks completed)", value: "John Mwangi — 22 tasks", rawValue: 22, unit: "tasks", note: "Top performer" },
  { id: "lm-7", label: "Highest rated worker", value: "Grace Wanjiku — 4.8★", rawValue: 4.8, unit: "rating", note: "Quality leader" },
  { id: "lm-8", label: "Attendance rate", value: "92%", rawValue: 92, unit: "%", note: "Above county avg of 85%" },
];

/* ── 11.6 Weather Impact ─────────────────────────────────────────────────── */
export interface WeatherImpact {
  id: string;
  season: string;
  crop: string;
  actualRainfall: number;
  normalRainfall: number;
  deviation: number;
  yieldImpact: string;
  notes: string;
}

export const WEATHER_IMPACTS: WeatherImpact[] = [
  { id: "wi-1", season: "SR 2026", crop: "Cabbage", actualRainfall: 280, normalRainfall: 320, deviation: -13, yieldImpact: "-5% estimated", notes: "Slightly dry, compensated with irrigation" },
  { id: "wi-2", season: "LR 2026", crop: "Maize", actualRainfall: 350, normalRainfall: 400, deviation: -13, yieldImpact: "-10% estimated", notes: "Dry spell in April affected tasseling" },
];

/* ── 11.7 Report Filters ─────────────────────────────────────────────────── */
export const REPORT_DATE_RANGES = ["This week", "This month", "This season", "Last season", "Year to date", "Custom range"];
export const REPORT_CROPS = ["All crops", "Cabbage Gloria F1", "Maize H6213", "Tomato Anna F1", "Dry Beans Rosecoco"];
export const REPORT_PLOTS = ["All plots", "Plot 1 (0.5 acre)", "Plot 2 (2 acres)", "Plot 3 (1 acre)", "Greenhouse 1"];
export const REPORT_METRICS = ["Revenue", "Cost", "Profit", "Yield", "Labour", "Inputs", "Weather"];
export const REPORT_COMPARE = ["Last season", "County average", "Top 10% farmers"];
export const REPORT_CHART_TYPES = ["Bar", "Line", "Pie", "Table", "Area"];
export const REPORT_EXPORT_FORMATS = ["PDF", "Excel", "CSV"];

/* ── 11.8 Pre-Built Reports ──────────────────────────────────────────────── */
export interface PreBuiltReport {
  id: string;
  name: string;
  description: string;
  contents: string;
  useCase: string;
  icon: string;
  lastGenerated: string;
  pages: number;
}

export const PRE_BUILT_REPORTS: PreBuiltReport[] = [
  { id: "rpt-1", name: "Season Summary", description: "Full season performance review", contents: "Full P&L per crop, yield, costs, weather impact", useCase: "Season review, planning", icon: "FileText", lastGenerated: "10 Nov 2026", pages: 8 },
  { id: "rpt-2", name: "Loan Application Report", description: "Bank-ready farm profile", contents: "Farm profile, yield history, revenue, assets", useCase: "Bank/cooperative loan", icon: "Landmark", lastGenerated: "05 Nov 2026", pages: 12 },
  { id: "rpt-3", name: "Crop Performance Card", description: "Single crop deep dive", contents: "Single crop: all metrics from planting to sale", useCase: "Benchmarking, improvement", icon: "Sprout", lastGenerated: "08 Nov 2026", pages: 4 },
  { id: "rpt-4", name: "Financial Statement", description: "Complete financial overview", contents: "Income statement, balance sheet, cash flow", useCase: "Accounting, tax", icon: "CircleDollarSign", lastGenerated: "01 Nov 2026", pages: 6 },
  { id: "rpt-5", name: "Input Usage Report", description: "All inputs tracked", contents: "All inputs used, costs, efficiency", useCase: "Optimization", icon: "Package", lastGenerated: "03 Nov 2026", pages: 5 },
  { id: "rpt-6", name: "Labour Report", description: "Team performance overview", contents: "Attendance, wages, efficiency, worker ratings", useCase: "Payroll audit", icon: "Users", lastGenerated: "12 Nov 2026", pages: 4 },
  { id: "rpt-7", name: "Compliance Report", description: "Certification-ready records", contents: "Spray records, PHI, soil tests, certifications", useCase: "KEPHIS, GlobalG.A.P, KS1758", icon: "ShieldCheck", lastGenerated: "09 Nov 2026", pages: 10 },
  { id: "rpt-8", name: "Market Analysis", description: "Sales and pricing insights", contents: "Price trends, sales by market, buyer performance", useCase: "Sales strategy", icon: "TrendingUp", lastGenerated: "11 Nov 2026", pages: 7 },
];

/* ── Benchmark data ──────────────────────────────────────────────────────── */
export interface BenchmarkRow {
  id: string;
  metric: string;
  yourFarm: string;
  countyAverage: string;
  top10: string;
  difference: string;
  status: "above" | "below" | "at";
}

export const BENCHMARK_ROWS: BenchmarkRow[] = [
  { id: "bm-1", metric: "Cabbage yield/acre", yourFarm: "16,000 heads", countyAverage: "12,000 heads", top10: "20,000 heads", difference: "+33% vs average", status: "above" },
  { id: "bm-2", metric: "Cost per head", yourFarm: "KES 5.98", countyAverage: "KES 8.50", top10: "KES 4.50", difference: "-30% vs average", status: "above" },
  { id: "bm-3", metric: "Labour efficiency", yourFarm: "85 heads/worker/day", countyAverage: "60 heads/worker/day", top10: "120 heads/worker/day", difference: "+42% vs average", status: "above" },
  { id: "bm-4", metric: "Fertilizer use efficiency", yourFarm: "0.003 kg/head", countyAverage: "0.005 kg/head", top10: "0.002 kg/head", difference: "-40% vs average", status: "above" },
  { id: "bm-5", metric: "Time to harvest", yourFarm: "90 days", countyAverage: "95 days", top10: "82 days", difference: "-5% vs average", status: "above" },
  { id: "bm-6", metric: "Post-harvest loss", yourFarm: "8%", countyAverage: "20%", top10: "3%", difference: "-60% vs average", status: "above" },
  { id: "bm-7", metric: "Selling price achieved", yourFarm: "KES 30/head", countyAverage: "KES 25/head", top10: "KES 35/head", difference: "+20% vs average", status: "above" },
];

export const BENCHMARK_SUMMARY = "You're performing above average in 6 of 7 metrics. Your biggest opportunity is increasing yield toward the top 10% — consider closer spacing (40cm × 40cm instead of 45cm × 45cm) with adequate fertilizer. Also, selling directly to restaurants instead of brokers could increase your price by 20%.";

/* ── Saved report schedules ──────────────────────────────────────────────── */
export interface ReportSchedule {
  id: string;
  reportName: string;
  frequency: string;
  recipients: string;
  lastSent: string;
  nextSend: string;
  active: boolean;
}

export const REPORT_SCHEDULES: ReportSchedule[] = [
  { id: "rs-1", reportName: "Season Summary", frequency: "End of season", recipients: "mary@wanjiku.ke", lastSent: "30 Sep 2026", nextSend: "31 Jan 2027", active: true },
  { id: "rs-2", reportName: "Financial Statement", frequency: "Monthly", recipients: "mary@wanjiku.ke, accountant@co.ke", lastSent: "01 Nov 2026", nextSend: "01 Dec 2026", active: true },
  { id: "rs-3", reportName: "Labour Report", frequency: "Weekly", recipients: "mary@wanjiku.ke", lastSent: "10 Nov 2026", nextSend: "17 Nov 2026", active: false },
];