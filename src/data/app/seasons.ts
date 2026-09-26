/* ============================================================================
   PAGE 23 — MULTI-SEASON PLANNING & CROP ROTATION
   Kenyan farm-planning demo data for Mary's Farm, Githunguri, Kiambu.
   ========================================================================== */

export type PlanStatus = "Active" | "Draft" | "Scheduled" | "Completed";
export type TaskState = "Due now" | "Upcoming" | "Done";

export const SEASON_CONTEXT = {
  farm: "Mary's Farm",
  county: "Kiambu",
  ward: "Githunguri",
  aez: "LH2 · Central Highlands",
  totalAcreage: 2.92,
  plannedAcreage: 2.92,
  activePlans: 4,
  rotationScore: 92,
  projectedProfit: 982000,
  soilSavings: 4000,
  season: "Short rains 2027",
};

export interface CalendarPlot {
  id: string;
  plot: string;
  acreage: number;
  soil: string;
  currentCrop: string;
  status: PlanStatus;
  months: {
    month: string;
    label: string;
    tone: "low" | "medium" | "neutral";
  }[];
}

export const CALENDAR_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const CALENDAR_PLOTS: CalendarPlot[] = [
  {
    id: "PLT-001",
    plot: "Plot 1 · Lower field",
    acreage: 0.52,
    soil: "Clay loam · pH 5.8",
    currentCrop: "Cabbage Gloria F1",
    status: "Active",
    months: [
      { month: "Jan", label: "Harvest", tone: "low" },
      { month: "Feb", label: "Rest", tone: "neutral" },
      { month: "Mar", label: "Beans", tone: "low" },
      { month: "Apr", label: "Beans", tone: "low" },
      { month: "May", label: "Beans", tone: "low" },
      { month: "Jun", label: "Harvest", tone: "low" },
      { month: "Jul", label: "Lablab", tone: "medium" },
      { month: "Aug", label: "Green manure", tone: "medium" },
      { month: "Sep", label: "Prepare", tone: "neutral" },
      { month: "Oct", label: "Cabbage", tone: "low" },
      { month: "Nov", label: "Cabbage", tone: "low" },
      { month: "Dec", label: "Cabbage", tone: "low" },
    ],
  },
  {
    id: "PLT-002",
    plot: "Plot 2 · Upper slope",
    acreage: 2,
    soil: "Red loam · pH 6.2",
    currentCrop: "H6213 maize",
    status: "Active",
    months: [
      { month: "Jan", label: "Maize", tone: "low" },
      { month: "Feb", label: "Harvest", tone: "low" },
      { month: "Mar", label: "Rest", tone: "neutral" },
      { month: "Apr", label: "Maize", tone: "low" },
      { month: "May", label: "Maize", tone: "low" },
      { month: "Jun", label: "Maize", tone: "low" },
      { month: "Jul", label: "Harvest", tone: "low" },
      { month: "Aug", label: "Mucuna", tone: "medium" },
      { month: "Sep", label: "Prepare", tone: "neutral" },
      { month: "Oct", label: "Maize", tone: "low" },
      { month: "Nov", label: "Maize", tone: "low" },
      { month: "Dec", label: "Maize", tone: "low" },
    ],
  },
  {
    id: "PLT-003",
    plot: "Plot 3 · Kitchen edge",
    acreage: 0.3,
    soil: "Sandy loam · irrigated",
    currentCrop: "Sukuma Wiki",
    status: "Active",
    months: CALENDAR_MONTHS.map((month) => ({
      month,
      label: "Sukuma",
      tone: "low" as const,
    })),
  },
  {
    id: "PLT-004",
    plot: "Plot 4 · Homestead garden",
    acreage: 0.1,
    soil: "Compost-rich beds",
    currentCrop: "Kitchen garden mix",
    status: "Scheduled",
    months: CALENDAR_MONTHS.map((month) => ({
      month,
      label: "Mixed garden",
      tone: "medium" as const,
    })),
  },
];

export interface RotationRow {
  id: string;
  season: string;
  yearOne: string;
  yearTwo: string;
  yearThree: string;
  purpose: string;
  note: string;
}

export const ROTATION_PLAN: RotationRow[] = [
  {
    id: "ROT-001",
    season: "Short rains · Oct–Jan",
    yearOne: "Cabbage Gloria F1",
    yearTwo: "Tomato Anna F1",
    yearThree: "Cabbage Gloria F1",
    purpose: "Heavy feeders, high value",
    note: "Avoids repeating brassica in consecutive crop windows",
  },
  {
    id: "ROT-002",
    season: "Long rains · Mar–Jun",
    yearOne: "Rosecoco beans",
    yearTwo: "Sukuma Wiki + cover crop",
    yearThree: "Rosecoco beans",
    purpose: "Legume fixes nitrogen, breaks pest cycle",
    note: "Deep roots after shallow-rooted cabbage",
  },
  {
    id: "ROT-003",
    season: "Dry break · Jul–Sep",
    yearOne: "Lablab + lime + manure",
    yearTwo: "Green manure + compost",
    yearThree: "Lablab + lime",
    purpose: "Soil recovery and pH correction",
    note: "Keep a managed living cover through the dry break",
  },
];

export const ROTATION_RULES = [
  {
    id: "RULE-001",
    rule: "Do not follow brassica with brassica",
    result: "Cabbage → Rosecoco beans",
    state: "Pass",
    note: "Different crop family breaks black-rot pressure.",
  },
  {
    id: "RULE-002",
    rule: "Include a legume at least once a year",
    result: "Beans in every long-rains window",
    state: "Pass",
    note: "Contributes nitrogen and residue to the soil.",
  },
  {
    id: "RULE-003",
    rule: "Allow a rest or cover period",
    result: "Jul–Sep managed cover crop",
    state: "Pass",
    note: "Green manure and lime are scheduled before planting.",
  },
  {
    id: "RULE-004",
    rule: "Alternate nutrient demand",
    result: "Cabbage (heavy) → beans (light)",
    state: "Pass",
    note: "Reduces fertilizer demand in the next crop.",
  },
  {
    id: "RULE-005",
    rule: "Break pest and disease cycles",
    result: "No continuous brassica cycle",
    state: "Pass",
    note: "Cabbage pests are not hosted by beans.",
  },
  {
    id: "RULE-006",
    rule: "Follow shallow roots with deep roots",
    result: "Beans after cabbage",
    state: "Pass",
    note: "Improves structure through deeper root channels.",
  },
];

export const ROTATION_BENEFITS = [
  {
    id: "BEN-001",
    benefit: "Soil nitrogen replenishment",
    impact: "+15 kg N/acre from beans",
    value: "KES 2,000/acre saved on fertilizer",
    icon: "N",
  },
  {
    id: "BEN-002",
    benefit: "Disease-pressure reduction",
    impact: "30% less black rot",
    value: "Year 2 cabbage compared with continuous cabbage",
    icon: "30%",
  },
  {
    id: "BEN-003",
    benefit: "Yield improvement",
    impact: "+10% in the second crop year",
    value: "Less soil fatigue and stronger soil biology",
    icon: "+10%",
  },
  {
    id: "BEN-004",
    benefit: "Pesticide reduction",
    impact: "2 fewer sprays per season",
    value: "About KES 2,000 saved per crop cycle",
    icon: "2",
  },
  {
    id: "BEN-005",
    benefit: "Soil structure",
    impact: "Better drainage and rooting",
    value: "Cover-crop biomass holds soil through the rains",
    icon: "Soil",
  },
];

export interface ProjectionRow {
  id: string;
  season: string;
  crop: string;
  cost: number;
  revenue: number;
  profit: number;
  cumulative: number;
  status: PlanStatus;
}

export const FINANCIAL_PROJECTIONS: ProjectionRow[] = [
  {
    id: "FIN-001",
    season: "SR 2026",
    crop: "Cabbage Gloria F1",
    cost: 56000,
    revenue: 318000,
    profit: 262000,
    cumulative: 262000,
    status: "Completed",
  },
  {
    id: "FIN-002",
    season: "LR 2027",
    crop: "Rosecoco beans",
    cost: 25000,
    revenue: 75000,
    profit: 50000,
    cumulative: 312000,
    status: "Active",
  },
  {
    id: "FIN-003",
    season: "SR 2027",
    crop: "Tomato Anna F1",
    cost: 80000,
    revenue: 400000,
    profit: 320000,
    cumulative: 632000,
    status: "Scheduled",
  },
  {
    id: "FIN-004",
    season: "LR 2028",
    crop: "Rosecoco beans",
    cost: 25000,
    revenue: 80000,
    profit: 55000,
    cumulative: 687000,
    status: "Scheduled",
  },
  {
    id: "FIN-005",
    season: "SR 2028",
    crop: "Cabbage Gloria F1",
    cost: 55000,
    revenue: 350000,
    profit: 295000,
    cumulative: 982000,
    status: "Scheduled",
  },
];

export const PROJECTION_TOTAL = {
  cost: 241000,
  revenue: 1223000,
  profit: 982000,
  revenuePerYear: 407667,
  profitPerYear: 327333,
};

export const SEASON_COMPARISON = [
  {
    id: "CMP-001",
    factor: "Yield / acre",
    shortRains: "16,000 heads",
    longRains: "14,000 heads",
    irrigated: "12,000 heads",
  },
  {
    id: "CMP-002",
    factor: "Market price at harvest",
    shortRains: "KES 30/head · January",
    longRains: "KES 20/head · June",
    irrigated: "KES 35/head · September",
  },
  {
    id: "CMP-003",
    factor: "Revenue / acre",
    shortRains: "KES 480,000",
    longRains: "KES 280,000",
    irrigated: "KES 420,000",
  },
  {
    id: "CMP-004",
    factor: "Cost / acre",
    shortRains: "KES 101,700",
    longRains: "KES 95,000",
    irrigated: "KES 120,000 · irrigation",
  },
  {
    id: "CMP-005",
    factor: "Profit / acre",
    shortRains: "KES 378,300",
    longRains: "KES 185,000",
    irrigated: "KES 300,000",
  },
  {
    id: "CMP-006",
    factor: "Disease pressure",
    shortRains: "High · black rot",
    longRains: "Medium",
    irrigated: "Low",
  },
  {
    id: "CMP-007",
    factor: "Pest pressure",
    shortRains: "Medium",
    longRains: "Low",
    irrigated: "High · aphids",
  },
  {
    id: "CMP-008",
    factor: "Rainfall reliability",
    shortRains: "Good",
    longRains: "Very good",
    irrigated: "Managed water",
  },
  {
    id: "CMP-009",
    factor: "GrowMO recommendation",
    shortRains: "Best overall",
    longRains: "Lower profit",
    irrigated: "Strong if water is available",
  },
];

export interface CoverCrop {
  id: string;
  name: string;
  botanical: string;
  purpose: string;
  seedingRate: string;
  cost: number;
  benefit: string;
  suitability: "Recommended" | "Good option";
}

export const COVER_CROPS: CoverCrop[] = [
  {
    id: "COV-001",
    name: "Lablab",
    botanical: "Lablab purpureus",
    purpose: "Nitrogen fixation, biomass and weed suppression",
    seedingRate: "10 kg/acre",
    cost: 3000,
    benefit: "Fixes 50–100 kg N/acre",
    suitability: "Recommended",
  },
  {
    id: "COV-002",
    name: "Mucuna",
    botanical: "Velvet bean",
    purpose: "Nitrogen fixation and soil cover",
    seedingRate: "15 kg/acre",
    cost: 2500,
    benefit: "Fixes 80–150 kg N/acre",
    suitability: "Good option",
  },
  {
    id: "COV-003",
    name: "Sunnhemp",
    botanical: "Crotalaria",
    purpose: "Nitrogen fixation and nematode break",
    seedingRate: "12 kg/acre",
    cost: 2000,
    benefit: "Fixes 60–100 kg N/acre",
    suitability: "Good option",
  },
  {
    id: "COV-004",
    name: "Oats + vetch mix",
    botanical: "Avena sativa + Vicia",
    purpose: "Biomass and soil structure",
    seedingRate: "20 kg/acre",
    cost: 1500,
    benefit: "Adds stable organic matter",
    suitability: "Good option",
  },
];

export interface FallowTask {
  id: string;
  week: string;
  action: string;
  owner: string;
  timing: string;
  status: TaskState;
}

export const FALLOW_TASKS: FallowTask[] = [
  {
    id: "FAL-001",
    week: "Week 1 · 1 Jul",
    action: "Harvest remaining residue and chop finely",
    owner: "Mary + 2 workers",
    timing: "Before noon",
    status: "Done",
  },
  {
    id: "FAL-002",
    week: "Week 1 · 3 Jul",
    action: "Apply agricultural lime from soil-test recommendation",
    owner: "Mary",
    timing: "Dry afternoon",
    status: "Done",
  },
  {
    id: "FAL-003",
    week: "Week 2 · 8 Jul",
    action: "Apply composted manure at 5 tonnes/acre",
    owner: "Kamau Farm Services",
    timing: "Morning",
    status: "Due now",
  },
  {
    id: "FAL-004",
    week: "Week 2 · 10 Jul",
    action: "Plant Lablab cover-crop seed",
    owner: "Mary + 1 worker",
    timing: "After 15 mm rain",
    status: "Upcoming",
  },
  {
    id: "FAL-005",
    week: "Week 4–10",
    action: "Monitor cover growth and remove invasive weeds",
    owner: "Mary",
    timing: "Weekly Friday",
    status: "Upcoming",
  },
  {
    id: "FAL-006",
    week: "Week 10",
    action: "Slash cover before full flowering",
    owner: "Hired brush cutter",
    timing: "Dry morning",
    status: "Upcoming",
  },
  {
    id: "FAL-007",
    week: "Week 11",
    action: "Incorporate residue as green manure",
    owner: "Mary + tractor hire",
    timing: "Two passes",
    status: "Upcoming",
  },
  {
    id: "FAL-008",
    week: "Week 12",
    action: "Prepare beds for the next cabbage window",
    owner: "Mary",
    timing: "After soil moisture check",
    status: "Upcoming",
  },
];

export interface IntercropPlan {
  id: string;
  main: string;
  intercrop: string;
  spacing: string;
  benefit: string;
  compatibility: "Excellent" | "Good" | "Standard practice";
  plot: string;
}

export const INTERCROP_PLANS: IntercropPlan[] = [
  {
    id: "INT-001",
    main: "H6213 maize",
    intercrop: "Rosecoco beans",
    spacing: "1 row maize : 1 row beans",
    benefit: "Beans fix nitrogen for maize and add a second income",
    compatibility: "Excellent",
    plot: "Plot 2",
  },
  {
    id: "INT-002",
    main: "Cabbage Gloria F1",
    intercrop: "Onions on edges",
    spacing: "Cabbage bed with onion border",
    benefit: "Onions repel some cabbage pests",
    compatibility: "Good",
    plot: "Plot 1",
  },
  {
    id: "INT-003",
    main: "Tomato Anna F1",
    intercrop: "Capsicum",
    spacing: "Alternate rows",
    benefit: "Shared management with diverse market grades",
    compatibility: "Good",
    plot: "Future Plot 1",
  },
  {
    id: "INT-004",
    main: "Maize",
    intercrop: "Sukuma Wiki",
    spacing: "Sukuma between maize rows",
    benefit: "Sukuma benefits from light maize shade",
    compatibility: "Good",
    plot: "Plot 2 edges",
  },
  {
    id: "INT-005",
    main: "Potato Shangi",
    intercrop: "Beans",
    spacing: "Alternate rows",
    benefit: "Legume residues support the following potato cycle",
    compatibility: "Good",
    plot: "Leased parcel",
  },
  {
    id: "INT-006",
    main: "Sugarcane",
    intercrop: "Beans early season",
    spacing: "Between rows for first 3 months",
    benefit: "Extra income before canopy closure",
    compatibility: "Standard practice",
    plot: "Neighbour benchmark",
  },
];

export const CLIMATE_SCENARIOS = [
  {
    id: "CLI-001",
    event: "El Niño · enhanced rainfall",
    impact: "Above-normal rain and localised flooding",
    seasons: "Short rains · Oct–Dec",
    avoid: "Tomatoes, onions in poorly drained beds",
    favor: "Rice, sugarcane, taro, watermelon",
    advisory:
      "Open drainage before planting and avoid waterlogging-prone beds.",
    tone: "medium" as const,
  },
  {
    id: "CLI-002",
    event: "La Niña · suppressed rainfall",
    impact: "Below-normal rain and drought risk",
    seasons: "Short rains · Oct–Dec",
    avoid: "Rain-fed maize and beans",
    favor: "Sorghum, millet, cassava",
    advisory: "Plant early-maturing varieties and secure irrigation water.",
    tone: "high" as const,
  },
];

export const SEASON_PLAN_REGISTER = [
  {
    id: "SP-001",
    plan: "SR 2027 Cabbage rotation",
    plot: "Plot 1",
    starts: "1 Oct 2027",
    crop: "Cabbage Gloria F1",
    acreage: 0.52,
    status: "Scheduled" as PlanStatus,
  },
  {
    id: "SP-002",
    plan: "LR 2027 Beans recovery",
    plot: "Plot 1",
    starts: "15 Mar 2027",
    crop: "Rosecoco beans",
    acreage: 0.52,
    status: "Active" as PlanStatus,
  },
  {
    id: "SP-003",
    plan: "Dry-break soil recovery",
    plot: "Plot 1",
    starts: "1 Jul 2027",
    crop: "Lablab + compost",
    acreage: 0.52,
    status: "Scheduled" as PlanStatus,
  },
  {
    id: "SP-004",
    plan: "SR 2027 Maize cycle",
    plot: "Plot 2",
    starts: "5 Oct 2027",
    crop: "H6213 maize",
    acreage: 2,
    status: "Scheduled" as PlanStatus,
  },
  {
    id: "SP-005",
    plan: "Kitchen harvest rhythm",
    plot: "Plot 3",
    starts: "Year-round",
    crop: "Sukuma Wiki",
    acreage: 0.3,
    status: "Active" as PlanStatus,
  },
  {
    id: "SP-006",
    plan: "Homestead kitchen mix",
    plot: "Plot 4",
    starts: "Year-round",
    crop: "Kale, coriander, onions",
    acreage: 0.1,
    status: "Active" as PlanStatus,
  },
  {
    id: "SP-007",
    plan: "SR 2028 Cabbage return",
    plot: "Plot 1",
    starts: "1 Oct 2028",
    crop: "Cabbage Gloria F1",
    acreage: 0.52,
    status: "Draft" as PlanStatus,
  },
  {
    id: "SP-008",
    plan: "LR 2028 Beans renewal",
    plot: "Plot 1",
    starts: "15 Mar 2028",
    crop: "Rosecoco beans",
    acreage: 0.52,
    status: "Draft" as PlanStatus,
  },
  {
    id: "SP-009",
    plan: "Tomato market window",
    plot: "Plot 1",
    starts: "1 Oct 2027",
    crop: "Tomato Anna F1",
    acreage: 0.52,
    status: "Draft" as PlanStatus,
  },
  {
    id: "SP-010",
    plan: "Maize + bean intercrop",
    plot: "Plot 2",
    starts: "10 Mar 2028",
    crop: "H6213 maize + beans",
    acreage: 2,
    status: "Draft" as PlanStatus,
  },
];

export function planTone(status: PlanStatus): "low" | "medium" | "neutral" {
  if (status === "Active" || status === "Completed") return "low";
  if (status === "Scheduled") return "medium";
  return "neutral";
}

export function taskTone(status: TaskState): "low" | "medium" | "neutral" {
  if (status === "Done") return "low";
  if (status === "Due now") return "medium";
  return "neutral";
}
